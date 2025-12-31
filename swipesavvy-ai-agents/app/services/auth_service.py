"""
User Authentication Models and Services
Provides JWT-based authentication with user management
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
from typing import Optional, List
import jwt
import hashlib
import secrets
from enum import Enum

# Error message constants
USER_NOT_FOUND = "User not found"

# ==================== Models ====================

class UserRole(str, Enum):
    """User roles in the system"""
    ADMIN = "admin"
    MERCHANT = "merchant"
    USER = "user"

class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class UserCreate(BaseModel):
    """User registration data"""
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None

class UserLogin(BaseModel):
    """User login credentials"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """User data response"""
    id: str
    email: str
    first_name: str
    last_name: str
    role: UserRole
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    phone_number: Optional[str] = None

class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int

class TokenPayload(BaseModel):
    """JWT token payload"""
    user_id: str
    email: str
    role: UserRole
    exp: datetime

class PasswordChangeRequest(BaseModel):
    """Password change request"""
    current_password: str
    new_password: str
    confirm_password: str

# ==================== Database Models (Mock) ====================

USERS_DB = {}  # Mock database

class User:
    """User model for database"""
    def __init__(self, email: str, password: str, first_name: str, last_name: str, 
                 phone_number: Optional[str] = None):
        self.id = secrets.token_urlsafe(16)
        self.email = email
        self.password_hash = self._hash_password(password)
        self.first_name = first_name
        self.last_name = last_name
        self.phone_number = phone_number
        self.role = UserRole.USER
        self.status = UserStatus.ACTIVE
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
        self.last_login: Optional[datetime] = None
        self.refresh_tokens: List[str] = []

    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash password with salt"""
        salt = secrets.token_hex(32)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}${pwd_hash.hex()}"

    def verify_password(self, password: str) -> bool:
        """Verify password against hash"""
        try:
            salt, pwd_hash = self.password_hash.split('$')
            new_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return new_hash.hex() == pwd_hash
        except (ValueError, AttributeError):
            return False

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone_number": self.phone_number,
            "role": self.role,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "last_login": self.last_login,
        }

# ==================== Authentication Service ====================

class AuthService:
    """Authentication service for JWT token management"""

    def __init__(self, secret_key: str = "your-secret-key", algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7

    def create_access_token(self, user_id: str, email: str, role: UserRole) -> tuple[str, datetime]:
        """Create JWT access token"""
        expires = datetime.now(timezone.utc) + timedelta(minutes=self.access_token_expire_minutes)
        payload = {
            "user_id": user_id,
            "email": email,
            "role": role,
            "exp": expires,
            "type": "access"
        }
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        return token, expires

    def create_refresh_token(self, user_id: str) -> tuple[str, datetime]:
        """Create JWT refresh token"""
        expires = datetime.now(timezone.utc) + timedelta(days=self.refresh_token_expire_days)
        payload = {
            "user_id": user_id,
            "exp": expires,
            "type": "refresh"
        }
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        return token, expires

    def verify_token(self, token: str) -> dict:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

    def decode_token(self, token: str) -> Optional[dict]:
        """Decode token without verification (for refresh)"""
        try:
            return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
        except (jwt.InvalidTokenError, jwt.DecodeError, TypeError):
            return None

# ==================== User Service ====================

class UserService:
    """User management service"""

    @staticmethod
    def register_user(user_data: UserCreate) -> User:
        """Register new user"""
        # Check if user exists
        if any(u.email == user_data.email for u in USERS_DB.values()):
            raise HTTPException(status_code=400, detail="User already exists")

        # Create new user
        user = User(
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone_number=user_data.phone_number
        )
        USERS_DB[user.id] = user
        return user

    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password"""
        user = next((u for u in USERS_DB.values() if u.email == email), None)
        if not user or not user.verify_password(password):
            return None
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        return user

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[User]:
        """Get user by ID"""
        return USERS_DB.get(user_id)

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email"""
        return next((u for u in USERS_DB.values() if u.email == email), None)

    @staticmethod
    def get_all_users() -> List[User]:
        """Get all users"""
        return list(USERS_DB.values())

    @staticmethod
    def update_user(user_id: str, **kwargs) -> User:
        """Update user data"""
        user = USERS_DB.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=USER_NOT_FOUND)

        for key, value in kwargs.items():
            if hasattr(user, key) and key != "password_hash":
                setattr(user, key, value)

        user.updated_at = datetime.now(timezone.utc)
        return user

    @staticmethod
    def change_password(user_id: str, old_password: str, new_password: str) -> User:
        """Change user password"""
        user = USERS_DB.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=USER_NOT_FOUND)

        if not user.verify_password(old_password):
            raise HTTPException(status_code=400, detail="Incorrect password")

        user.password_hash = User._hash_password(new_password)
        user.updated_at = datetime.utcnow()
        return user

    @staticmethod
    def delete_user(user_id: str) -> bool:
        """Delete user"""
        if user_id in USERS_DB:
            del USERS_DB[user_id]
            return True
        return False

# ==================== Dependencies ====================

security = HTTPBearer()
auth_service = AuthService()
user_service = UserService()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user from token"""
    token = credentials.credentials
    payload = auth_service.verify_token(token)
    
    user = user_service.get_user_by_id(payload["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail=USER_NOT_FOUND)

    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="User account is not active")

    return user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Get current admin user"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== API Routes ====================

def create_auth_routes(app: FastAPI):
    """Create authentication API routes"""

    @app.post("/api/auth/register", response_model=TokenResponse, tags=["Authentication"])
    async def register(user_data: UserCreate):
        """Register new user and return auth tokens"""
        user = user_service.register_user(user_data)
        access_token, access_expires = auth_service.create_access_token(
            user.id, user.email, user.role
        )
        refresh_token, _ = auth_service.create_refresh_token(user.id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": auth_service.access_token_expire_minutes * 60
        }

    @app.post("/api/auth/login", response_model=TokenResponse, tags=["Authentication"])
    async def login(credentials: UserLogin):
        """Login user and return auth tokens"""
        user = user_service.authenticate_user(credentials.email, credentials.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        access_token, access_expires = auth_service.create_access_token(
            user.id, user.email, user.role
        )
        refresh_token, _ = auth_service.create_refresh_token(user.id)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": auth_service.access_token_expire_minutes * 60
        }

    @app.post("/api/auth/refresh", response_model=TokenResponse, tags=["Authentication"])
    async def refresh_token(request: dict):
        """Refresh access token"""
        refresh_token = request.get("refresh_token")
        if not refresh_token:
            raise HTTPException(status_code=400, detail="Refresh token required")

        payload = auth_service.decode_token(refresh_token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        user = user_service.get_user_by_id(payload["user_id"])
        if not user:
            raise HTTPException(status_code=404, detail=USER_NOT_FOUND)

        access_token, _ = auth_service.create_access_token(user.id, user.email, user.role)
        new_refresh_token, _ = auth_service.create_refresh_token(user.id)

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": auth_service.access_token_expire_minutes * 60
        }

    @app.get("/api/auth/me", response_model=UserResponse, tags=["Authentication"])
    async def get_current_user_info(current_user: User = Depends(get_current_user)):
        """Get current user information"""
        return current_user.to_dict()

    @app.post("/api/auth/change-password", tags=["Authentication"])
    async def change_password(
        request: PasswordChangeRequest,
        current_user: User = Depends(get_current_user)
    ):
        """Change user password"""
        if request.new_password != request.confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")

        user_service.change_password(current_user.id, request.current_password, request.new_password)
        return {"message": "Password changed successfully"}

    @app.post("/api/auth/logout", tags=["Authentication"])
    async def logout(current_user: User = Depends(get_current_user)):
        """Logout user (invalidate tokens)"""
        return {"message": "Logged out successfully"}

    @app.get("/api/users", response_model=List[UserResponse], tags=["Users"])
    async def list_users(current_user: User = Depends(get_current_admin)):
        """List all users (admin only)"""
        users = user_service.get_all_users()
        return [u.to_dict() for u in users]

    @app.get("/api/users/{user_id}", response_model=UserResponse, tags=["Users"])
    async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
        """Get user details"""
        user = user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=USER_NOT_FOUND)

        # Users can only see their own data unless admin
        if current_user.id != user_id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")

        return user.to_dict()

    return app
