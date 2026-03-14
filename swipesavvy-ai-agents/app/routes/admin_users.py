"""Admin User Management Routes

This module provides endpoints for managing admin portal users AND customer users.
Includes user listing, creation, invitation, details, status updates, and deletion.
"""

from fastapi import APIRouter, HTTPException, Query, Body, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
import bcrypt
import secrets
import logging

from app.database import get_db
from app.models import AdminUser, User
from app.core.auth import verify_jwt_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/users", tags=["admin-users"])


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_invite_token() -> str:
    """Generate a secure invitation token."""
    return secrets.token_urlsafe(32)

# ============================================================================
# Request/Response Models
# ============================================================================

class CustomerUserCreateRequest(BaseModel):
    """Request body for creating/inviting a customer user"""
    email: EmailStr
    name: str
    phone: Optional[str] = None
    invite: bool = True  # If True, send invitation email; if False, require password


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
# Customer User Endpoints (for UsersPage.tsx)
# ============================================================================

@router.get("", response_model=AdminUserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    List all customer users with pagination and filtering.
    Requires admin authentication.
    """

    # Build query for customer users (User model)
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

    # Apply pagination and order by created_at descending
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return AdminUserListResponse(
        users=[
            AdminUserResponse(
                id=str(u.id),
                email=u.email,
                name=u.name or u.email.split('@')[0],  # Fallback to email prefix if no name
                role="customer",  # All are customers
                department=None,
                status=u.status or "active",
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
async def create_user(req: CustomerUserCreateRequest, current_user: str = Depends(verify_jwt_token), db: Session = Depends(get_db)):
    """
    Create/invite a new customer user

    Request Body:
    - email: User email address (must be unique)
    - name: User's full name
    - phone: Optional phone number
    - invite: If True, send invitation email
    """
    # Check if email already exists in User table
    existing_user = db.query(User).filter(User.email == req.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="User with this email already exists")

    # Generate invite token for password setup
    invite_token = generate_invite_token()

    # Create new customer user with 'invited' status
    new_user = User(
        email=req.email.lower(),
        name=req.name,
        phone=req.phone,
        password_hash=hash_password(invite_token),  # Temporary password, user will set their own
        status="invited",  # Set as invited until they complete signup
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send invitation email if requested
    if req.invite:
        try:
            from app.services.aws_ses_service import AWSSESService
            ses_service = AWSSESService()

            # Send invitation email using the new template
            invite_link = f"https://app.swipesavvy.com/invite?token={invite_token}&email={req.email}"
            await ses_service.send_user_invitation(
                to_email=req.email,
                name=req.name,
                invite_link=invite_link,
                inviter_name="SwipeSavvy Admin"
            )
            logger.info(f"Invitation email sent to {req.email}")
        except Exception as e:
            logger.error(f"Failed to send invitation email to {req.email}: {e}")
            # Don't fail the request if email fails - user is still created

    return AdminUserResponse(
        id=str(new_user.id),
        email=new_user.email,
        name=new_user.name,
        role="customer",
        department=None,
        status=new_user.status,
        created_at=new_user.created_at.isoformat() if new_user.created_at else None,
        last_login=None,
    )


# ============================================================================
# IMPORTANT: Specific routes MUST come before wildcard /{user_id} routes
# ============================================================================

@router.get("/stats/overview", response_model=dict)
async def get_admin_users_stats(current_user: str = Depends(verify_jwt_token), db: Session = Depends(get_db)):
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


@router.get("/customer/{user_id}/otp")
async def get_customer_otp(
    user_id: str,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Check if a customer user has a pending OTP (admin use only).
    Requires admin authentication. Does NOT return the OTP code itself.
    """
    # Find the customer user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    has_active_otp = (
        user.phone_verification_code is not None
        and user.phone_verification_expires is not None
        and user.phone_verification_expires > datetime.now(timezone.utc)
    )

    return {
        "user_id": str(user.id),
        "email": user.email,
        "has_active_otp": has_active_otp,
        "phone_verification_expires": user.phone_verification_expires.isoformat() if user.phone_verification_expires else None,
    }


@router.delete("/by-phone/{phone}", status_code=200)
async def delete_user_by_phone(
    phone: str,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Delete a customer user by phone number (hard delete).
    Requires admin authentication.
    """

    # Clean the phone number - keep only digits
    phone_digits = ''.join(filter(str.isdigit, phone))

    # Search for users with matching phone number
    users = db.query(User).filter(User.phone.ilike(f"%{phone_digits}%")).all()

    if not users:
        # Also try with +1 prefix
        users = db.query(User).filter(User.phone.ilike(f"%{phone_digits[-10:]}%")).all()

    if not users:
        raise HTTPException(status_code=404, detail=f"No users found with phone number containing {phone}")

    deleted_users = []
    for user in users:
        deleted_users.append({
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "name": user.name
        })
        db.delete(user)

    db.commit()

    return {
        "success": True,
        "deleted_count": len(deleted_users),
        "deleted_users": deleted_users
    }


@router.delete("/by-email/{email:path}", status_code=200)
async def delete_user_by_email(
    email: str,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Delete a customer user by email address (hard delete).
    Requires admin authentication.
    """

    # Search for user with matching email
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail=f"No user found with email {email}")

    deleted_user = {
        "id": str(user.id),
        "email": user.email,
        "phone": user.phone,
        "name": user.name
    }

    db.delete(user)
    db.commit()

    logger.info(f"Deleted user with email {email}")

    return {
        "success": True,
        "deleted_user": deleted_user
    }


@router.post("/delete-by-emails", status_code=200)
async def delete_users_by_emails(
    emails: List[str] = Body(..., embed=True),
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Delete multiple customer users by email addresses (hard delete).
    Requires admin authentication.
    """

    # Search for users with matching emails
    users = db.query(User).filter(User.email.in_(emails)).all()

    if not users:
        raise HTTPException(status_code=404, detail=f"No users found with provided emails")

    deleted_users = []
    for user in users:
        deleted_users.append({
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "name": user.name
        })
        db.delete(user)

    db.commit()

    logger.info(f"Deleted {len(deleted_users)} users by email: {[u['email'] for u in deleted_users]}")

    return {
        "success": True,
        "deleted_count": len(deleted_users),
        "deleted_users": deleted_users,
        "not_found": [e for e in emails if e not in [u['email'] for u in deleted_users]]
    }


# ============================================================================
# Wildcard routes - these MUST come AFTER specific routes
# ============================================================================

@router.get("/{user_id}", response_model=AdminUserResponse)
async def get_admin_user(user_id: str, current_user: str = Depends(verify_jwt_token), db: Session = Depends(get_db)):
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
async def update_admin_user(user_id: str, req: AdminUserUpdateRequest, current_user: str = Depends(verify_jwt_token), db: Session = Depends(get_db)):
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
async def delete_admin_user(user_id: str, current_user: str = Depends(verify_jwt_token), db: Session = Depends(get_db)):
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
