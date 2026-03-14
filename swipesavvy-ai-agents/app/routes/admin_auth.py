"""
Admin Authentication Routes

Handles login, logout, token refresh, and session management for the admin portal.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Header, Request
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
import bcrypt
import jwt
import os
import secrets
import json
import logging
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AdminUser

logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/v1/admin/auth", tags=["admin-auth"])

# Configuration — accept either JWT_SECRET_KEY or JWT_SECRET for compatibility
SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
BEARER_PREFIX = "Bearer "
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# ============================================================================
# Demo Users Loading (From Environment Only — PCI DSS 2.2.2)
# ============================================================================


def load_demo_users():
    """Load demo users from DEMO_USERS environment variable only.

    SECURITY: Demo credentials must NEVER be hardcoded in source code.
    Set the DEMO_USERS env var as a JSON string in development environments.
    See .env.example for the expected format.

    Passwords are hashed with bcrypt at load time so they are never compared
    in plaintext at login (OWASP A02).
    """
    if ENVIRONMENT not in ["development", "testing"]:
        return {}

    demo_users_json = os.getenv("DEMO_USERS")
    if not demo_users_json:
        logger.info("No DEMO_USERS env var set — demo login disabled")
        return {}

    try:
        users = json.loads(demo_users_json)
        # Hash plaintext passwords at load time
        for email, user_data in users.items():
            if "password" in user_data:
                raw_pw = user_data["password"].encode("utf-8")[:72]
                user_data["password_hash"] = bcrypt.hashpw(raw_pw, bcrypt.gensalt()).decode("utf-8")
                del user_data["password"]  # Remove plaintext from memory
        logger.info(f"Loaded {len(users)} demo users from DEMO_USERS environment variable")
        return users
    except json.JSONDecodeError:
        logger.error("DEMO_USERS environment variable is not valid JSON")
        return {}


# Load demo users at startup
DEMO_USERS = load_demo_users()

# ============================================================================
# Pydantic Models
# ============================================================================


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    def __init__(self, **data):
        super().__init__(**data)
        if not self.password or len(self.password.strip()) == 0:
            raise ValueError("Password cannot be empty")
        if len(self.password) < 6:
            raise ValueError("Password must be at least 6 characters")
        if len(self.password.encode("utf-8")) > 72:
            raise ValueError("Password exceeds maximum length")


class UserInfo(BaseModel):
    id: str
    name: str
    email: str
    role: str


class LoginResponse(BaseModel):
    session: dict
    token: str
    expires_at: str


class RefreshTokenRequest(BaseModel):
    token: str


class TokenRefreshResponse(BaseModel):
    token: str
    expires_at: str


# ============================================================================
# Password Utilities
# ============================================================================


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    truncated_password = plain_password.encode("utf-8")[:72]
    try:
        return bcrypt.checkpw(truncated_password, hashed_password.encode("utf-8"))
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a plain password with bcrypt."""
    truncated_password = password.encode("utf-8")[:72]
    return bcrypt.hashpw(truncated_password, bcrypt.gensalt()).decode("utf-8")


# SECURITY: Admin token blacklist (mirrors user_auth.py pattern)
_admin_token_blacklist: dict[str, float] = {}

# ============================================================================
# Token Management
# ============================================================================


def create_access_token(
    user_id: str, user_email: str, role: str, expires_delta: Optional[timedelta] = None
):
    """Create a JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.now(timezone.utc) + expires_delta
    payload = {
        "user_id": user_id,
        "email": user_email,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
        "jti": secrets.token_hex(16),
        "iss": "swipesavvy",
        "aud": "admin-api",
    }

    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expire.isoformat()


def is_admin_token_blacklisted(jti: str) -> bool:
    """Check if an admin token's JTI has been revoked."""
    if jti in _admin_token_blacklist:
        if _admin_token_blacklist[jti] > datetime.now(timezone.utc).timestamp():
            return True
        # Expired entry, clean up
        _admin_token_blacklist.pop(jti, None)
    return False


def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM], issuer="swipesavvy", audience="admin-api"
        )
        jti = payload.get("jti")
        if jti and is_admin_token_blacklisted(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked"
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# ============================================================================
# Routes
# ============================================================================


@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Admin login endpoint with rate limiting.

    **Rate limit:** 5 attempts per minute per IP
    **Validates:** Email format, password not empty
    **In production:** Query database with hashed password verification
    """
    user_data = None
    email_lower = req.email.lower()

    # First check demo users (only in dev/test environments, loaded from env var)
    demo_user = DEMO_USERS.get(email_lower)
    if demo_user and demo_user.get("password_hash"):
        try:
            if bcrypt.checkpw(
                req.password.encode("utf-8")[:72], demo_user["password_hash"].encode("utf-8")
            ):
                user_data = demo_user
                logger.info(f"Demo user login: {req.email}")
        except Exception as e:
            logger.error(f"Demo user password verification error: {e}")

    # If no demo user found, check database
    if not user_data:
        db_user = db.query(AdminUser).filter(AdminUser.email == email_lower).first()
        if db_user and verify_password(req.password, db_user.password_hash):
            user_data = {
                "id": str(db_user.id),
                "name": db_user.full_name,
                "email": db_user.email,
                "role": db_user.role,
                "status": db_user.status,
            }
            db_user.last_login = datetime.utcnow()
            db.commit()
            logger.info(f"Database user login: {req.email}")

    if not user_data:
        logger.warning(f"Failed login attempt for email: {req.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    if user_data.get("status") != "active":
        logger.warning(f"Login attempt for inactive user: {req.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is not active"
        )

    token, expires_at = create_access_token(
        user_id=user_data["id"], user_email=user_data["email"], role=user_data["role"]
    )

    logger.info(f"Successful login for user: {req.email}")

    return LoginResponse(
        session={
            "token": token,
            "user": {
                "id": user_data["id"],
                "name": user_data["name"],
                "email": user_data["email"],
                "role": user_data["role"],
            },
        },
        token=token,
        expires_at=expires_at,
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh an access token.

    Validates the existing token and issues a new one.
    Verifies the user still exists and is active.
    Blacklists the old token's JTI to prevent replay attacks.
    """
    payload = verify_token(req.token)

    # SECURITY: Reject replayed refresh tokens (OWASP A07)
    old_jti = payload.get("jti")
    if old_jti and is_admin_token_blacklisted(old_jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has already been used"
        )

    user = db.query(AdminUser).filter(AdminUser.id == payload["user_id"]).first()
    if not user or user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or not active"
        )

    # SECURITY: Blacklist old token JTI before issuing new one (replay prevention)
    jti = payload.get("jti")
    exp = payload.get("exp", 0)
    if jti:
        _admin_token_blacklist[jti] = exp

    token, expires_at = create_access_token(
        user_id=payload["user_id"], user_email=payload["email"], role=payload["role"]
    )

    return TokenRefreshResponse(token=token, expires_at=expires_at)


@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """
    Logout endpoint.

    Invalidates the token by adding its JTI to a blacklist.
    Frontend should also delete the token from localStorage.
    """
    # SECURITY: Blacklist the token so it cannot be reused (OWASP A07)
    if authorization and authorization.startswith(BEARER_PREFIX):
        token = authorization.replace(BEARER_PREFIX, "")
        try:
            payload = jwt.decode(
                token, SECRET_KEY, algorithms=[ALGORITHM], issuer="swipesavvy", audience="admin-api"
            )
            jti = payload.get("jti")
            exp = payload.get("exp", 0)
            if jti:
                _admin_token_blacklist[jti] = exp
                # Prune expired entries
                now = datetime.utcnow().timestamp()
                expired = [k for k, v in _admin_token_blacklist.items() if v < now]
                for k in expired:
                    _admin_token_blacklist.pop(k, None)
        except (jwt.InvalidTokenError, jwt.DecodeError):
            pass  # Token already invalid — logout succeeds anyway

    return {"success": True, "message": "Logged out successfully"}


@router.get("/me")
async def get_current_user(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    """
    Get current authenticated user info.

    Expects Authorization header: "Bearer {token}"
    """
    if not authorization or not authorization.startswith(BEARER_PREFIX):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token provided")

    token = authorization.replace(BEARER_PREFIX, "")
    payload = verify_token(token)

    user = db.query(AdminUser).filter(AdminUser.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return UserInfo(id=str(user.id), name=user.full_name, email=user.email, role=user.role)


# ============================================================================
# Initial Setup Endpoint (One-time use)
# ============================================================================


class SetupRequest(BaseModel):
    setup_key: str
    email: EmailStr
    password: str
    full_name: str


@router.post("/setup-admin")
async def setup_initial_admin(req: SetupRequest, db: Session = Depends(get_db)):
    """
    Create initial admin user. One-time setup endpoint.

    Requires a setup key that matches the JWT_SECRET_KEY first 16 chars.
    Can only be used if no admin users exist in the database.
    """
    # SECURITY: Use a dedicated setup key, not derived from JWT secret (OWASP A04)
    setup_secret = os.getenv("ADMIN_SETUP_KEY", "")
    if not setup_secret:
        logger.error("ADMIN_SETUP_KEY not set — admin setup endpoint disabled")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Setup not configured"
        )
    if req.setup_key != setup_secret:
        logger.warning("Invalid setup key attempted")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid setup key")

    existing_count = (
        db.query(AdminUser).filter(AdminUser.role.in_(["admin", "super_admin"])).count()
    )
    if existing_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin users already exist. This endpoint can only be used for initial setup.",
        )

    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters"
        )

    from uuid import uuid4

    password_hash = get_password_hash(req.password)

    admin_user = AdminUser(
        id=uuid4(),
        email=req.email.lower(),
        password_hash=password_hash,
        full_name=req.full_name,
        role="super_admin",
        status="active",
    )

    db.add(admin_user)
    db.commit()

    logger.info(f"Initial admin user created: {req.email}")

    return {"success": True, "message": "Admin user created successfully", "email": req.email}


class ResetPasswordRequest(BaseModel):
    setup_key: str
    email: EmailStr
    new_password: str


@router.post("/reset-password")
async def reset_admin_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset admin password. Requires setup key for security.
    """
    # SECURITY: Use a dedicated setup key, not derived from JWT secret (OWASP A04)
    setup_secret = os.getenv("ADMIN_SETUP_KEY", "")
    if not setup_secret:
        logger.error("ADMIN_SETUP_KEY not set — admin setup endpoint disabled")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Setup not configured"
        )
    if req.setup_key != setup_secret:
        logger.warning("Invalid setup key for password reset")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid setup key")

    user = db.query(AdminUser).filter(AdminUser.email == req.email.lower()).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters"
        )

    user.password_hash = get_password_hash(req.new_password)
    db.commit()

    logger.info(f"Password reset for user: {req.email}")

    return {"success": True, "message": "Password reset successfully"}
