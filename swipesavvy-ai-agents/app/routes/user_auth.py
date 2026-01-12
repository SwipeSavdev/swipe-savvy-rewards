"""
User Authentication and Registration API Routes

Handles:
- User registration/signup
- Email verification
- Phone verification
- Password reset
- User login
- Token refresh
"""

import os
import re
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field, validator
from sqlalchemy.orm import Session
import bcrypt
import jwt

from app.database import get_db
from app.models import User, UserKYCHistory, OFACScreeningResult
from app.services.aws_ses_service import AWSSESService
from app.services.aws_sns_service import AWSSNSService

router = APIRouter(prefix="/api/v1/auth", tags=["User Authentication"])

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
REFRESH_TOKEN_EXPIRE_DAYS = 30
EMAIL_VERIFICATION_EXPIRE_HOURS = 24
PHONE_VERIFICATION_EXPIRE_MINUTES = 10
PASSWORD_RESET_EXPIRE_HOURS = 1

security = HTTPBearer(auto_error=False)


# ============================================
# Pydantic Models
# ============================================

class SignupRequest(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    date_of_birth: str  # YYYY-MM-DD format
    street_address: str = Field(..., min_length=1, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=2, max_length=50)
    zip_code: str = Field(..., min_length=5, max_length=20)
    ssn_last4: str = Field(..., min_length=4, max_length=4)
    terms_accepted: bool = Field(...)

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

    @validator('phone')
    def validate_phone(cls, v):
        # Remove non-digits
        digits = re.sub(r'\D', '', v)
        if len(digits) < 10 or len(digits) > 15:
            raise ValueError('Invalid phone number')
        return digits

    @validator('date_of_birth')
    def validate_dob(cls, v):
        try:
            dob = datetime.strptime(v, '%Y-%m-%d')
            age = (datetime.now() - dob).days // 365
            if age < 18:
                raise ValueError('You must be at least 18 years old')
            if age > 120:
                raise ValueError('Invalid date of birth')
            return v
        except ValueError as e:
            if 'time data' in str(e):
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
            raise

    @validator('ssn_last4')
    def validate_ssn(cls, v):
        if not v.isdigit() or len(v) != 4:
            raise ValueError('SSN last 4 must be exactly 4 digits')
        return v

    @validator('terms_accepted')
    def validate_terms(cls, v):
        if not v:
            raise ValueError('You must accept the terms and conditions')
        return v


class LoginRequest(BaseModel):
    """User login request"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class EmailVerificationRequest(BaseModel):
    """Email verification request"""
    token: str


class PhoneVerificationRequest(BaseModel):
    """Phone verification code submission"""
    code: str = Field(..., min_length=6, max_length=6)


class ResendVerificationRequest(BaseModel):
    """Resend verification email/SMS"""
    type: str = Field(..., pattern="^(email|phone)$")


class PasswordResetRequest(BaseModel):
    """Password reset request"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

    @validator('new_password')
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


# ============================================
# Helper Functions
# ============================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def create_access_token(user_id: str, email: str) -> str:
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": str(user_id),
        "email": email,
        "type": "access",
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """Create JWT refresh token"""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def generate_verification_token() -> str:
    """Generate secure verification token"""
    return secrets.token_urlsafe(32)


def generate_verification_code() -> str:
    """Generate 6-digit verification code"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])


def hash_ssn(ssn_last4: str, salt: str) -> str:
    """Hash SSN for secure storage"""
    return hashlib.sha256(f"{ssn_last4}{salt}".encode()).hexdigest()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current authenticated user from JWT token"""
    if not credentials:
        return None

    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def log_kyc_history(
    db: Session,
    user_id: UUID,
    action: str,
    verification_type: str = None,
    previous_status: str = None,
    new_status: str = None,
    notes: str = None,
    ip_address: str = None,
    user_agent: str = None
):
    """Log KYC action to history"""
    history = UserKYCHistory(
        user_id=user_id,
        action=action,
        verification_type=verification_type,
        previous_status=previous_status,
        new_status=new_status,
        notes=notes,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(history)


# ============================================
# API Endpoints
# ============================================

@router.post("/signup", response_model=dict)
async def signup(
    request: SignupRequest,
    background_tasks: BackgroundTasks,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.

    Steps:
    1. Validate input data
    2. Check for existing email/phone
    3. Create user with pending status
    4. Run initial OFAC screening
    5. Send verification email
    6. Return success with next steps
    """
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == request.email.lower()).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if phone already exists
    existing_phone = db.query(User).filter(User.phone == request.phone).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    # Parse date of birth
    dob = datetime.strptime(request.date_of_birth, '%Y-%m-%d').date()

    # Generate verification tokens
    email_token = generate_verification_token()
    phone_code = generate_verification_code()

    # Hash password and SSN
    password_hash = hash_password(request.password)
    ssn_salt = secrets.token_hex(16)
    ssn_hashed = hash_ssn(request.ssn_last4, ssn_salt)

    # Create user
    user = User(
        id=uuid4(),
        email=request.email.lower(),
        password_hash=password_hash,
        name=f"{request.first_name} {request.last_name}",
        first_name=request.first_name,
        last_name=request.last_name,
        phone=request.phone,
        date_of_birth=dob,
        street_address=request.street_address,
        city=request.city,
        state=request.state,
        zip_code=request.zip_code,
        country='US',
        ssn_last4=request.ssn_last4,
        ssn_hash=f"{ssn_hashed}:{ssn_salt}",
        status='pending',
        role='user',
        kyc_tier='tier1',
        kyc_status='pending',
        email_verified=False,
        email_verification_token=email_token,
        email_verification_expires=datetime.utcnow() + timedelta(hours=EMAIL_VERIFICATION_EXPIRE_HOURS),
        phone_verified=False,
        phone_verification_code=phone_code,
        phone_verification_expires=datetime.utcnow() + timedelta(minutes=PHONE_VERIFICATION_EXPIRE_MINUTES)
    )

    db.add(user)
    db.flush()  # Flush to get user.id without committing transaction

    # Log KYC history
    log_kyc_history(
        db=db,
        user_id=user.id,
        action="user_registered",
        verification_type="signup",
        new_status="pending",
        notes="User completed registration form",
        ip_address=req.client.host if req.client else None,
        user_agent=req.headers.get("user-agent")
    )

    # Create initial OFAC screening record
    ofac_screening = OFACScreeningResult(
        user_id=user.id,
        screening_type='ofac',
        status='pending'
    )
    db.add(ofac_screening)

    db.commit()

    # Send verification email in background
    background_tasks.add_task(
        send_verification_email,
        email=request.email,
        first_name=request.first_name,
        token=email_token
    )

    # Send phone verification SMS in background
    background_tasks.add_task(
        send_verification_sms,
        phone=request.phone,
        code=phone_code
    )

    return {
        "success": True,
        "message": "Account created successfully. Please verify your email and phone number.",
        "user_id": str(user.id),
        "next_steps": [
            "Check your email for verification link",
            "Enter the 6-digit code sent to your phone"
        ],
        "verification_required": {
            "email": True,
            "phone": True
        }
    }


@router.post("/login")
async def login(
    request: LoginRequest,
    background_tasks: BackgroundTasks,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and send OTP for verification.
    Two-factor authentication is required for every login.
    """
    # Find user
    user = db.query(User).filter(User.email == request.email.lower()).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check if account is locked
    if user.locked_until and user.locked_until > datetime.utcnow():
        remaining = (user.locked_until - datetime.utcnow()).seconds // 60
        raise HTTPException(
            status_code=423,
            detail=f"Account is locked. Try again in {remaining} minutes."
        )

    # Verify password
    if not verify_password(request.password, user.password_hash):
        # Increment failed attempts
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1

        # Lock account after 5 failed attempts
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=30)
            db.commit()
            raise HTTPException(
                status_code=423,
                detail="Account locked due to too many failed attempts. Try again in 30 minutes."
            )

        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check account status
    if user.status == 'suspended':
        raise HTTPException(status_code=403, detail="Account is suspended")
    if user.status == 'deleted':
        raise HTTPException(status_code=403, detail="Account has been deleted")

    # Reset failed attempts on successful password verification
    user.failed_login_attempts = 0
    user.locked_until = None

    # Generate OTP code for login verification
    otp_code = generate_verification_code()
    user.phone_verification_code = otp_code
    user.phone_verification_expires = datetime.utcnow() + timedelta(minutes=PHONE_VERIFICATION_EXPIRE_MINUTES)
    db.commit()

    # Send OTP via SMS in background
    background_tasks.add_task(
        send_verification_sms,
        phone=user.phone,
        code=otp_code
    )

    # Return response indicating OTP is required (no tokens yet)
    return {
        "otp_required": True,
        "verification_required": True,
        "message": "Verification code sent to your phone",
        "user_id": str(user.id),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "status": user.status,
            "role": user.role,
            "kyc_tier": user.kyc_tier,
            "kyc_status": user.kyc_status,
            "email_verified": user.email_verified,
            "phone_verified": user.phone_verified
        }
    }


@router.post("/verify-email")
async def verify_email(
    request: EmailVerificationRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Verify user email with token"""
    user = db.query(User).filter(
        User.email_verification_token == request.token
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")

    if user.email_verification_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification token has expired")

    if user.email_verified:
        return {"success": True, "message": "Email already verified"}

    # Mark email as verified
    user.email_verified = True
    user.email_verified_at = datetime.utcnow()
    user.email_verification_token = None
    user.email_verification_expires = None

    # Update user status if both email and phone are verified
    if user.phone_verified:
        user.status = 'active'
        user.kyc_status = 'in_review'

    # Log KYC history
    log_kyc_history(
        db=db,
        user_id=user.id,
        action="email_verified",
        verification_type="email",
        previous_status=user.kyc_status,
        new_status=user.kyc_status,
        ip_address=req.client.host if req.client else None
    )

    db.commit()

    return {
        "success": True,
        "message": "Email verified successfully",
        "status": user.status,
        "phone_verified": user.phone_verified
    }


class VerifyLoginOTPRequest(BaseModel):
    """Verify OTP for login"""
    user_id: str
    code: str = Field(..., min_length=6, max_length=6)


@router.post("/verify-login-otp")
async def verify_login_otp(
    request: VerifyLoginOTPRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Verify OTP code during login and return JWT tokens.
    This endpoint does not require authentication as it's part of the login flow.
    """
    # Find user by ID
    user = db.query(User).filter(User.id == request.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if code has expired
    if not user.phone_verification_expires or user.phone_verification_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired. Please login again.")

    # Verify the OTP code
    if user.phone_verification_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Clear OTP data
    user.phone_verification_code = None
    user.phone_verification_expires = None
    user.last_login = datetime.utcnow()

    # Mark phone as verified if not already
    if not user.phone_verified:
        user.phone_verified = True
        user.phone_verified_at = datetime.utcnow()

    db.commit()

    # Generate tokens - user is now fully authenticated
    access_token = create_access_token(str(user.id), user.email)
    refresh_token = create_refresh_token(str(user.id))

    return {
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "status": user.status,
            "role": user.role,
            "kyc_tier": user.kyc_tier,
            "kyc_status": user.kyc_status,
            "email_verified": user.email_verified,
            "phone_verified": user.phone_verified
        }
    }


@router.post("/verify-phone")
async def verify_phone(
    request: PhoneVerificationRequest,
    req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify user phone with OTP code (for initial signup verification)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if current_user.phone_verified:
        return {"success": True, "message": "Phone already verified"}

    if current_user.phone_verification_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired")

    if current_user.phone_verification_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Mark phone as verified
    current_user.phone_verified = True
    current_user.phone_verified_at = datetime.utcnow()
    current_user.phone_verification_code = None
    current_user.phone_verification_expires = None

    # Update user status if both email and phone are verified
    if current_user.email_verified:
        current_user.status = 'active'
        current_user.kyc_status = 'in_review'

    # Log KYC history
    log_kyc_history(
        db=db,
        user_id=current_user.id,
        action="phone_verified",
        verification_type="phone",
        previous_status=current_user.kyc_status,
        new_status=current_user.kyc_status,
        ip_address=req.client.host if req.client else None
    )

    db.commit()

    return {
        "success": True,
        "message": "Phone verified successfully",
        "status": current_user.status,
        "email_verified": current_user.email_verified
    }


class ResendLoginOTPRequest(BaseModel):
    """Resend OTP for login verification"""
    user_id: str


@router.post("/resend-login-otp")
async def resend_login_otp(
    request: ResendLoginOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Resend OTP code for login verification.
    This endpoint does not require authentication as it's part of the login flow.
    """
    # Find user by ID
    user = db.query(User).filter(User.id == request.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate new OTP code
    otp_code = generate_verification_code()
    user.phone_verification_code = otp_code
    user.phone_verification_expires = datetime.utcnow() + timedelta(minutes=PHONE_VERIFICATION_EXPIRE_MINUTES)
    db.commit()

    # Send OTP via SMS in background
    background_tasks.add_task(
        send_verification_sms,
        phone=user.phone,
        code=otp_code
    )

    return {"success": True, "message": "Verification code sent"}


@router.post("/resend-verification")
async def resend_verification(
    request: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resend email or phone verification (requires authentication)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if request.type == "email":
        if current_user.email_verified:
            return {"success": True, "message": "Email already verified"}

        # Generate new token
        token = generate_verification_token()
        current_user.email_verification_token = token
        current_user.email_verification_expires = datetime.utcnow() + timedelta(hours=EMAIL_VERIFICATION_EXPIRE_HOURS)
        db.commit()

        # Send email
        background_tasks.add_task(
            send_verification_email,
            email=current_user.email,
            first_name=current_user.first_name,
            token=token
        )

        return {"success": True, "message": "Verification email sent"}

    elif request.type == "phone":
        if current_user.phone_verified:
            return {"success": True, "message": "Phone already verified"}

        # Generate new code
        code = generate_verification_code()
        current_user.phone_verification_code = code
        current_user.phone_verification_expires = datetime.utcnow() + timedelta(minutes=PHONE_VERIFICATION_EXPIRE_MINUTES)
        db.commit()

        # Send SMS
        background_tasks.add_task(
            send_verification_sms,
            phone=current_user.phone,
            code=code
        )

        return {"success": True, "message": "Verification code sent"}


@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Request password reset"""
    user = db.query(User).filter(User.email == request.email.lower()).first()

    # Always return success to prevent email enumeration
    if not user:
        return {"success": True, "message": "If an account exists, a password reset email has been sent"}

    # Generate reset token
    token = generate_verification_token()
    user.password_reset_token = token
    user.password_reset_expires = datetime.utcnow() + timedelta(hours=PASSWORD_RESET_EXPIRE_HOURS)
    db.commit()

    # Send password reset email
    background_tasks.add_task(
        send_password_reset_email,
        email=user.email,
        first_name=user.first_name,
        token=token
    )

    return {"success": True, "message": "If an account exists, a password reset email has been sent"}


@router.post("/reset-password")
async def reset_password(
    request: PasswordResetConfirm,
    req: Request,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    user = db.query(User).filter(
        User.password_reset_token == request.token
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    if user.password_reset_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")

    # Update password
    user.password_hash = hash_password(request.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    user.failed_login_attempts = 0
    user.locked_until = None

    # Log KYC history
    log_kyc_history(
        db=db,
        user_id=user.id,
        action="password_reset",
        verification_type="password",
        notes="Password reset via email link",
        ip_address=req.client.host if req.client else None
    )

    db.commit()

    return {"success": True, "message": "Password reset successfully"}


@router.post("/refresh")
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    try:
        payload = jwt.decode(request.refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        if user.status in ['suspended', 'deleted']:
            raise HTTPException(status_code=403, detail="Account is not active")

        # Generate new tokens
        access_token = create_access_token(str(user.id), user.email)
        refresh_token = create_refresh_token(str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600,
            user={
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "status": user.status,
                "kyc_tier": user.kyc_tier,
                "kyc_status": user.kyc_status
            }
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user profile"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone": current_user.phone,
        "status": current_user.status,
        "role": current_user.role,
        "kyc_tier": current_user.kyc_tier,
        "kyc_status": current_user.kyc_status,
        "email_verified": current_user.email_verified,
        "phone_verified": current_user.phone_verified,
        "address": {
            "street": current_user.street_address,
            "city": current_user.city,
            "state": current_user.state,
            "zip_code": current_user.zip_code,
            "country": current_user.country
        },
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None
    }


@router.post("/check-email")
async def check_email_availability(
    email: EmailStr,
    db: Session = Depends(get_db)
):
    """Check if email is available for registration"""
    existing = db.query(User).filter(User.email == email.lower()).first()
    return {"available": existing is None}


@router.post("/check-phone")
async def check_phone_availability(
    phone: str,
    db: Session = Depends(get_db)
):
    """Check if phone number is available for registration"""
    # Normalize phone number
    digits = re.sub(r'\D', '', phone)
    existing = db.query(User).filter(User.phone == digits).first()
    return {"available": existing is None}


# ============================================
# Background Task Functions
# ============================================

async def send_verification_email(email: str, first_name: str, token: str):
    """Send email verification link using AWS SES"""
    try:
        email_service = AWSSESService()
        await email_service.send_verification_email(
            to_email=email,
            verification_token=token,
            user_name=first_name
        )
    except Exception as e:
        print(f"Failed to send verification email: {e}")


async def send_verification_sms(phone: str, code: str):
    """Send phone verification code via SMS using AWS SNS"""
    try:
        sms_service = AWSSNSService()
        result = await sms_service.send_verification_code(phone, code)
        if not result.get("success"):
            print(f"Failed to send verification SMS: {result.get('error')}")
    except Exception as e:
        print(f"Failed to send verification SMS: {e}")


async def send_password_reset_email(email: str, first_name: str, token: str):
    """Send password reset email using AWS SES"""
    try:
        email_service = AWSSESService()
        await email_service.send_password_reset_email(
            to_email=email,
            reset_token=token,
            user_name=first_name
        )
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
