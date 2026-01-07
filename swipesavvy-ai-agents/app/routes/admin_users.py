"""Admin User Management Routes

This module provides endpoints for managing admin portal users.
Includes admin user listing, creation, details, status updates, and deletion.
"""

from fastapi import APIRouter, HTTPException, Query, Body, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
import jwt
import os
import bcrypt

from app.database import get_db
from app.models import AdminUser

router = APIRouter(prefix="/api/v1/admin/users", tags=["admin-users"])

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

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

class AdminUserCreateRequest(BaseModel):
    """Request body for creating a new admin user"""
    email: EmailStr
    full_name: str
    password: str
    role: str = "admin"
    department: Optional[str] = None


class AdminUserUpdateRequest(BaseModel):
    """Request body for updating an admin user"""
    full_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None


class AdminUserResponse(BaseModel):
    """Response model for admin user details"""
    id: str
    email: str
    name: str  # Mapped from full_name for frontend compatibility
    role: str
    department: Optional[str]
    status: str
    created_at: Optional[str]
    last_login: Optional[str]


class AdminUserListResponse(BaseModel):
    """Response model for admin user list"""
    users: List[AdminUserResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# ============================================================================
# Endpoints
# ============================================================================

@router.get("", response_model=AdminUserListResponse)
async def list_admin_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """
    List all admin users with pagination and filtering

    Query Parameters:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 25, max: 100)
    - role: Filter by role (super_admin, admin, support, analyst)
    - search: Search by email or name
    """
    # Token is optional for demo
    if authorization:
        token = authorization.replace("Bearer ", "")
        verify_token(token)

    # Build query
    query = db.query(AdminUser)

    # Filter by role
    if role:
        query = query.filter(AdminUser.role == role)

    # Search by email or name
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (AdminUser.email.ilike(search_pattern)) |
            (AdminUser.full_name.ilike(search_pattern))
        )

    # Get total count
    total = query.count()
    total_pages = (total + per_page - 1) // per_page

    # Apply pagination
    users = query.offset((page - 1) * per_page).limit(per_page).all()

    return AdminUserListResponse(
        users=[
            AdminUserResponse(
                id=str(u.id),
                email=u.email,
                name=u.full_name,  # Map full_name to name for frontend
                role=u.role,
                department=u.department,
                status=u.status,
                created_at=u.created_at.isoformat() if u.created_at else None,
                last_login=u.last_login.isoformat() if u.last_login else None,
            )
            for u in users
        ],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.post("", response_model=AdminUserResponse, status_code=201)
async def create_admin_user(req: AdminUserCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new admin user

    Request Body:
    - email: Admin email address (must be unique)
    - full_name: Admin full name
    - password: Password
    - role: Role (super_admin, admin, support, analyst)
    - department: Optional department
    """
    # Check if email already exists
    existing_user = db.query(AdminUser).filter(AdminUser.email == req.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Admin user with this email already exists")

    # Create new admin user
    new_user = AdminUser(
        email=req.email.lower(),
        full_name=req.full_name,
        password_hash=hash_password(req.password),
        role=req.role,
        department=req.department,
        status="active",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return AdminUserResponse(
        id=str(new_user.id),
        email=new_user.email,
        name=new_user.full_name,
        role=new_user.role,
        department=new_user.department,
        status=new_user.status,
        created_at=new_user.created_at.isoformat() if new_user.created_at else None,
        last_login=None,
    )


@router.get("/{user_id}", response_model=AdminUserResponse)
async def get_admin_user(user_id: str, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific admin user

    Path Parameters:
    - user_id: The admin user's unique identifier
    """
    user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Admin user {user_id} not found")

    return AdminUserResponse(
        id=str(user.id),
        email=user.email,
        name=user.full_name,
        role=user.role,
        department=user.department,
        status=user.status,
        created_at=user.created_at.isoformat() if user.created_at else None,
        last_login=user.last_login.isoformat() if user.last_login else None,
    )


@router.put("/{user_id}", response_model=AdminUserResponse)
async def update_admin_user(user_id: str, req: AdminUserUpdateRequest, db: Session = Depends(get_db)):
    """
    Update an admin user

    Path Parameters:
    - user_id: The admin user's unique identifier

    Request Body:
    - full_name: Optional new name
    - role: Optional new role
    - department: Optional new department
    - status: Optional new status
    """
    user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Admin user {user_id} not found")

    if req.full_name is not None:
        user.full_name = req.full_name
    if req.role is not None:
        user.role = req.role
    if req.department is not None:
        user.department = req.department
    if req.status is not None:
        if req.status not in ["active", "inactive", "suspended"]:
            raise HTTPException(status_code=400, detail="Invalid status. Must be active, inactive, or suspended")
        user.status = req.status

    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    return AdminUserResponse(
        id=str(user.id),
        email=user.email,
        name=user.full_name,
        role=user.role,
        department=user.department,
        status=user.status,
        created_at=user.created_at.isoformat() if user.created_at else None,
        last_login=user.last_login.isoformat() if user.last_login else None,
    )


@router.delete("/{user_id}", status_code=204)
async def delete_admin_user(user_id: str, db: Session = Depends(get_db)):
    """
    Delete an admin user (hard delete)

    Path Parameters:
    - user_id: The admin user's unique identifier
    """
    user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Admin user {user_id} not found")

    db.delete(user)
    db.commit()
    return None


# ============================================================================
# Statistics Endpoint
# ============================================================================

@router.get("/stats/overview", response_model=dict)
async def get_admin_users_stats(db: Session = Depends(get_db)):
    """Get admin user statistics overview"""
    total_users = db.query(AdminUser).count()
    active_users = db.query(AdminUser).filter(AdminUser.status == "active").count()
    inactive_users = db.query(AdminUser).filter(AdminUser.status == "inactive").count()

    # Count by role
    super_admin_count = db.query(AdminUser).filter(AdminUser.role == "super_admin").count()
    admin_count = db.query(AdminUser).filter(AdminUser.role == "admin").count()
    support_count = db.query(AdminUser).filter(AdminUser.role == "support").count()
    analyst_count = db.query(AdminUser).filter(AdminUser.role == "analyst").count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "suspended_users": total_users - active_users - inactive_users,
        "by_role": {
            "super_admin": super_admin_count,
            "admin": admin_count,
            "support": support_count,
            "analyst": analyst_count,
        }
    }
