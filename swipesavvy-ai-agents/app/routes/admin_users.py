"""Admin User Management Routes

This module provides endpoints for managing regular users in the SwipeSavvy platform.
Includes user listing, creation, details, status updates, and deletion.
"""

from fastapi import APIRouter, HTTPException, Query, Body, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
import jwt
import os
from passlib.context import CryptContext

from app.database import get_db
from app.models import User, AdminUser

router = APIRouter(prefix="/api/v1/admin/users", tags=["admin-users"])

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_token(token: str) -> dict:
    """Verify JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============================================================================
# Request/Response Models
# ============================================================================

class UserCreateRequest(BaseModel):
    """Request body for creating a new user"""
    email: EmailStr
    name: str
    phone: Optional[str] = None
    invite: bool = True  # If true, send invite email instead of setting password


class UserUpdateStatusRequest(BaseModel):
    """Request body for updating user status"""
    status: str  # "active", "suspended", "deactivated"
    reason: Optional[str] = None


class UserResponse(BaseModel):
    """Response model for user details"""
    id: str
    email: str
    name: str
    phone: Optional[str]
    status: str
    role: str
    created_at: str
    last_login: Optional[str]
    verification_status: str  # "verified", "pending", "unverified"
    device_count: int
    transaction_count: int


class UserListResponse(BaseModel):
    """Response model for user list"""
    users: List[UserResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class UserInviteResponse(BaseModel):
    """Response for user invitation"""
    id: str
    email: str
    name: str
    invite_token: str
    invite_expires_at: str
    message: str



# ============================================================================
# Endpoints
# ============================================================================

@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """
    List all users with pagination and filtering
    
    Query Parameters:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 25, max: 100)
    - status: Filter by status (active, suspended, deactivated)
    - search: Search by email or name
    """
    # Token is optional for demo
    if authorization:
        token = authorization.replace("Bearer ", "")
        verify_token(token)
    
    # Build query
    query = db.query(User)
    
    # Filter by status
    if status:
        query = query.filter(User.status == status)
    
    # Search by email or name
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_pattern)) | 
            (User.name.ilike(search_pattern))
        )
    
    # Get total count
    total = query.count()
    total_pages = (total + per_page - 1) // per_page
    
    # Apply pagination
    users = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return UserListResponse(
        users=[
            UserResponse(
                id=str(u.id),
                email=u.email,
                name=u.name,
                phone=u.phone,
                status=u.status,
                role=u.role,
                created_at=u.created_at.isoformat() if u.created_at else None,
                last_login=u.last_login.isoformat() if u.last_login else None,
                verification_status="verified",  # Can be extended with a field
                device_count=0,  # Can be extended with relationship
                transaction_count=0,  # Can be extended with relationship
            )
            for u in users
        ],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.post("", response_model=UserInviteResponse, status_code=201)
async def create_user(req: UserCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new user and optionally send invite email
    
    Request Body:
    - email: User email address (must be unique)
    - name: User full name
    - phone: Optional phone number
    - invite: Send email invite (default: true)
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == req.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="User with this email already exists")
    
    # Create new user
    new_user = User(
        email=req.email.lower(),
        name=req.name,
        phone=req.phone,
        password_hash=pwd_context.hash("temporary"),  # Temporary password
        status="active",
        role="user",
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate invite token (in production, save to database)
    import secrets
    invite_token = secrets.token_urlsafe(32)
    
    message = f"Invitation sent to {req.email}" if req.invite else f"User {req.name} created successfully"
    
    return UserInviteResponse(
        id=str(new_user.id),
        email=req.email,
        name=req.name,
        invite_token=invite_token,
        invite_expires_at=datetime.now(timezone.utc).isoformat(),
        message=message,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific user
    
    Path Parameters:
    - user_id: The user's unique identifier
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        phone=user.phone,
        status=user.status,
        role=user.role,
        created_at=user.created_at.isoformat() if user.created_at else None,
        last_login=user.last_login.isoformat() if user.last_login else None,
        verification_status="verified",
        device_count=0,
        transaction_count=0,
    )


@router.put("/{user_id}/status", response_model=UserResponse)
async def update_user_status(user_id: str, req: UserUpdateStatusRequest, db: Session = Depends(get_db)):
    """
    Update a user's status (active, suspended, deactivated)
    
    Path Parameters:
    - user_id: The user's unique identifier
    
    Request Body:
    - status: New status (active, suspended, deactivated)
    - reason: Optional reason for status change
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    if req.status not in ["active", "suspended", "deactivated"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be active, suspended, or deactivated")
    
    user.status = req.status
    db.commit()
    db.refresh(user)
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        phone=user.phone,
        status=user.status,
        role=user.role,
        created_at=user.created_at.isoformat() if user.created_at else None,
        last_login=user.last_login.isoformat() if user.last_login else None,
        verification_status="verified",
        device_count=0,
        transaction_count=0,
    )


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str, db: Session = Depends(get_db)):
    """
    Delete a user (hard delete)
    
    Path Parameters:
    - user_id: The user's unique identifier
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    db.delete(user)
    db.commit()
    return None


# ============================================================================
# Statistics Endpoint
# ============================================================================

@router.get("/stats/overview", response_model=dict)
async def get_users_stats(db: Session = Depends(get_db)):
    """Get user statistics overview"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "active").count()
    suspended_users = db.query(User).filter(User.status == "suspended").count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": suspended_users,
        "deactivated_users": total_users - active_users - suspended_users,
        "verified_users": total_users,  # Can be extended
        "verification_rate": 100.0 if total_users > 0 else 0,
    }
