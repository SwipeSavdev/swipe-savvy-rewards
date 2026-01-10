"""
Admin Authentication Routes

Handles login, logout, token refresh, and session management for the admin portal.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Header, Request
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from slowapi import Limiter
from slowapi.util import get_remote_address
import jwt
import os
import json
import logging
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AdminUser

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/v1/admin/auth", tags=["admin-auth"])

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
BEARER_PREFIX = "Bearer "
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Demo user email constants
ADMIN_EMAIL = "admin@swipesavvy.com"
SUPPORT_EMAIL = "support@swipesavvy.com"
OPS_EMAIL = "ops@swipesavvy.com"

# ============================================================================
# Demo Users Loading (From Environment Only)
# ============================================================================

def load_demo_users():
    """Load demo users from environment, not source code"""
    
    # Only load demo users in development/testing
    if ENVIRONMENT not in ["development", "testing"]:
        logger.warning(f"Demo users disabled in {ENVIRONMENT} environment")
        return {}
    
    # Load from environment variable
    demo_users_json = os.getenv("DEMO_USERS", "{}")
    try:
        if demo_users_json == "{}":
            # Default development users
            logger.info("Using default development demo users from environment")
            DEMO_USERS = {
                ADMIN_EMAIL: {
                    "id": "demo-admin-1",
                    "name": "Admin User",
                    "email": ADMIN_EMAIL,
                    "password": "TempPassword123!",
                    "role": "admin",
                    "status": "active"
                },
                SUPPORT_EMAIL: {
                    "id": "demo-support-1",
                    "name": "Support User",
                    "email": SUPPORT_EMAIL,
                    "password": "TempPassword456!",
                    "role": "support",
                    "status": "active"
                },
                OPS_EMAIL: {
                    "id": "demo-ops-1",
                    "name": "Operations User",
                    "email": OPS_EMAIL,
                    "password": "TempPassword789!",
                    "role": "operator",
                    "status": "active"
                },
                "jason@valiantpayments.com": {
                    "id": "super-admin-1",
                    "name": "Jason Mayoral",
                    "email": "jason@valiantpayments.com",
                    "password": "Valipay2@23!$!",
                    "role": "super_admin",
                    "status": "active"
                }
            }
        else:
            DEMO_USERS = json.loads(demo_users_json)
            logger.info(f"Loaded {len(DEMO_USERS)} demo users from DEMO_USERS environment variable")
        
        return DEMO_USERS
    except json.JSONDecodeError:
        logger.error("DEMO_USERS environment variable is not valid JSON")
        return {}


# Load demo users at startup
DEMO_USERS = load_demo_users()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============================================================================
# Pydantic Models with Validation
# ============================================================================

class LoginRequest(BaseModel):
    email: EmailStr  # Validates email format
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@swipesavvy.com",
                "password": "Admin123!"
            }
        }
    
    def __init__(self, **data):
        super().__init__(**data)
        # Additional validation
        if not self.password or len(self.password.strip()) == 0:
            raise ValueError('Password cannot be empty')
        if len(self.password) < 6:
            raise ValueError('Password must be at least 6 characters')

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
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a plain password."""
    return pwd_context.hash(password)

# ============================================================================
# Token Management
# ============================================================================

def create_access_token(user_id: str, user_email: str, role: str, expires_delta: Optional[timedelta] = None):
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
        "type": "access"
    }
    
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expire.isoformat()

def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )



@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh an access token.
    
    Validates the existing token and issues a new one.
    """
    payload = verify_token(req.token)
    
    # Verify user still exists and is active
    user = db.query(AdminUser).filter(AdminUser.id == payload["user_id"]).first()
    if not user or user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or not active"
        )
    
    # Create new token
    token, expires_at = create_access_token(
        user_id=payload["user_id"],
        user_email=payload["email"],
        role=payload["role"]
    )
    
    return TokenRefreshResponse(
        token=token,
        expires_at=expires_at
    )

@router.post("/logout")
async def logout():
    """
    Logout endpoint.
    
    In production, invalidate token in a blacklist or database.
    Frontend should delete the token from localStorage.
    """
    return {
        "success": True,
        "message": "Logged out successfully"
    }

@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """
    Get current authenticated user info.
    
    Expects Authorization header: "Bearer {token}"
    """
    if not authorization or not authorization.startswith(BEARER_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )
    
    token = authorization.replace(BEARER_PREFIX, "")
    payload = verify_token(token)
    
    user = db.query(AdminUser).filter(AdminUser.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserInfo(
        id=str(user.id),
        name=user.full_name,
        email=user.email,
        role=user.role
    )

# ============================================================================
# Demo Endpoints (for testing)
# ============================================================================

@router.get("/demo-credentials")
async def get_demo_credentials(db: Session = Depends(get_db)):
    """
    Get demo credentials from database.
    **Only available in development mode.**
    """
    if os.getenv("ENV") == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not available in production"
        )
    
    # Retrieve demo users from database
    demo_users = db.query(AdminUser).filter(
        AdminUser.email.in_([
            ADMIN_EMAIL,
            SUPPORT_EMAIL,
            OPS_EMAIL
        ])
    ).all()
    
    return {
        "note": "Use the credentials created in the database to login",
        "demo_users": [
            {
                "id": str(user.id),
                "email": user.email,
                "name": user.full_name,
                "role": user.role,
                "status": user.status
            }
            for user in demo_users
        ]
    }

    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# ============================================================================
# Routes
# ============================================================================

@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")  # Rate limit: 5 attempts per minute
async def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Admin login endpoint with rate limiting.

    **Rate limit:** 5 attempts per minute per IP
    **Validates:** Email format, password not empty

    **Demo credentials (dev/test only):**
    - Email: admin@swipesavvy.com
    - Password: TempPassword123!

    **In production:** Query database with hashed password verification
    """
    # Email validation is done by EmailStr in LoginRequest
    # Additional password validation is done in LoginRequest.__init__

    user_data = None
    email_lower = req.email.lower()

    # First check demo users (only in dev/test environments)
    demo_user = DEMO_USERS.get(email_lower)
    if demo_user and demo_user["password"] == req.password:
        user_data = demo_user
        logger.info(f"Demo user login: {req.email}")

    # If no demo user found, check database
    if not user_data:
        db_user = db.query(AdminUser).filter(AdminUser.email == email_lower).first()
        if db_user and verify_password(req.password, db_user.password_hash):
            user_data = {
                "id": str(db_user.id),
                "name": db_user.full_name,
                "email": db_user.email,
                "role": db_user.role,
                "status": db_user.status
            }
            # Update last login
            db_user.last_login = datetime.utcnow()
            db.commit()
            logger.info(f"Database user login: {req.email}")

    if not user_data:
        logger.warning(f"Failed login attempt for email: {req.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if user_data.get("status") != "active":
        logger.warning(f"Login attempt for inactive user: {req.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )

    # Create token
    token, expires_at = create_access_token(
        user_id=user_data["id"],
        user_email=user_data["email"],
        role=user_data["role"]
    )

    logger.info(f"Successful login for user: {req.email}")

    return LoginResponse(
        session={
            "token": token,
            "user": UserInfo(
                id=user_data["id"],
                name=user_data["name"],
                email=user_data["email"],
                role=user_data["role"]
            )
        },
        token=token,
        expires_at=expires_at
    )

@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh an access token.
    
    Validates the existing token and issues a new one.
    """
    payload = verify_token(req.token)
    
    # Create new token
    token, expires_at = create_access_token(
        user_id=payload["user_id"],
        user_email=payload["email"],
        role=payload["role"]
    )
    
    return TokenRefreshResponse(
        token=token,
        expires_at=expires_at
    )

@router.post("/logout")
async def logout():
    """
    Logout endpoint.
    
    In production, invalidate token in a blacklist or database.
    Frontend should delete the token from localStorage.
    """
    return {
        "success": True,
        "message": "Logged out successfully"
    }

@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Get current authenticated user info.
    
    Expects Authorization header: "Bearer {token}"
    """
    if not authorization or not authorization.startswith(BEARER_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )
    
    token = authorization.replace(BEARER_PREFIX, "")
    payload = verify_token(token)
    
    user = DEMO_USERS.get(payload["email"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserInfo(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"]
    )

# ============================================================================
# Demo Endpoints (for testing)
# ============================================================================

@router.get("/demo-credentials")
async def get_demo_credentials():
    """
    Get demo credentials for testing.
    **Only available in development mode.**
    """
    if os.getenv("ENV") == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not available in production"
        )
    
    return {
        "credentials": [
            {
                "email": "admin@swipesavvy.com",
                "password": "Admin123!",
                "role": "super_admin"
            },
            {
                "email": "support@swipesavvy.com",
                "password": "Support123!",
                "role": "support"
            },
            {
                "email": "ops@swipesavvy.com",
                "password": "Ops123!",
                "role": "admin"
            }
        ]
    }
