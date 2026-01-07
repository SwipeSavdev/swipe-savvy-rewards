"""
Admin Portal - Role-Based Access Control (RBAC) Routes

Endpoints for managing roles, policies, and permissions in the admin portal
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from app.database import get_db
from app.models import Role, Policy, Permission, AdminUser

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["admin-rbac"])


# ============================================================================
# Request/Response Models - Roles
# ============================================================================

class RoleCreateRequest(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    permissions: List[str] = []


class RoleUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None
    status: Optional[str] = None


class RoleResponse(BaseModel):
    id: str
    name: str
    display_name: str
    description: Optional[str]
    permissions: List[str]
    is_system: bool
    status: str
    user_count: int
    created_at: Optional[str]
    updated_at: Optional[str]


class RoleListResponse(BaseModel):
    roles: List[RoleResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# ============================================================================
# Request/Response Models - Policies
# ============================================================================

class PolicyCreateRequest(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    resource: str
    actions: List[str] = []
    conditions: Optional[Dict[str, Any]] = None
    effect: str = "allow"
    priority: int = 0


class PolicyUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    resource: Optional[str] = None
    actions: Optional[List[str]] = None
    conditions: Optional[Dict[str, Any]] = None
    effect: Optional[str] = None
    priority: Optional[int] = None
    status: Optional[str] = None


class PolicyResponse(BaseModel):
    id: str
    name: str
    display_name: str
    description: Optional[str]
    resource: str
    actions: List[str]
    conditions: Optional[Dict[str, Any]]
    effect: str
    priority: int
    is_system: bool
    status: str
    created_at: Optional[str]
    updated_at: Optional[str]


class PolicyListResponse(BaseModel):
    policies: List[PolicyResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# ============================================================================
# Request/Response Models - Permissions
# ============================================================================

class PermissionCreateRequest(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    category: str
    resource: str
    action: str


class PermissionResponse(BaseModel):
    id: str
    name: str
    display_name: str
    description: Optional[str]
    category: str
    resource: str
    action: str
    is_system: bool
    created_at: Optional[str]


class PermissionListResponse(BaseModel):
    permissions: List[PermissionResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


# ============================================================================
# Role Endpoints
# ============================================================================

@router.get("/roles", response_model=RoleListResponse)
async def list_roles(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all roles with pagination and filtering"""
    try:
        query = db.query(Role)

        if status:
            query = query.filter(Role.status == status)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Role.name.ilike(search_pattern)) |
                (Role.display_name.ilike(search_pattern))
            )

        total = query.count()
        total_pages = (total + per_page - 1) // per_page

        roles = query.order_by(Role.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

        # Count users for each role
        role_responses = []
        for role in roles:
            user_count = db.query(AdminUser).filter(AdminUser.role == role.name).count()
            role_responses.append(RoleResponse(
                id=str(role.id),
                name=role.name,
                display_name=role.display_name,
                description=role.description,
                permissions=role.permissions or [],
                is_system=role.is_system,
                status=role.status,
                user_count=user_count,
                created_at=role.created_at.isoformat() if role.created_at else None,
                updated_at=role.updated_at.isoformat() if role.updated_at else None
            ))

        return RoleListResponse(
            roles=role_responses,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
    except Exception as e:
        logger.error(f"Error listing roles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list roles")


@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(role_id: str, db: Session = Depends(get_db)):
    """Get a specific role by ID"""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        user_count = db.query(AdminUser).filter(AdminUser.role == role.name).count()

        return RoleResponse(
            id=str(role.id),
            name=role.name,
            display_name=role.display_name,
            description=role.description,
            permissions=role.permissions or [],
            is_system=role.is_system,
            status=role.status,
            user_count=user_count,
            created_at=role.created_at.isoformat() if role.created_at else None,
            updated_at=role.updated_at.isoformat() if role.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting role: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get role")


@router.post("/roles", response_model=RoleResponse, status_code=201)
async def create_role(request: RoleCreateRequest, db: Session = Depends(get_db)):
    """Create a new role"""
    try:
        # Check if role name already exists
        existing = db.query(Role).filter(Role.name == request.name.lower().replace(' ', '_')).first()
        if existing:
            raise HTTPException(status_code=409, detail=f"Role '{request.name}' already exists")

        role = Role(
            name=request.name.lower().replace(' ', '_'),
            display_name=request.display_name,
            description=request.description,
            permissions=request.permissions,
            is_system=False,
            status='active'
        )

        db.add(role)
        db.commit()
        db.refresh(role)

        return RoleResponse(
            id=str(role.id),
            name=role.name,
            display_name=role.display_name,
            description=role.description,
            permissions=role.permissions or [],
            is_system=role.is_system,
            status=role.status,
            user_count=0,
            created_at=role.created_at.isoformat() if role.created_at else None,
            updated_at=role.updated_at.isoformat() if role.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating role: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create role")


@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(role_id: str, request: RoleUpdateRequest, db: Session = Depends(get_db)):
    """Update a role"""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        if role.is_system and request.status == 'inactive':
            raise HTTPException(status_code=400, detail="Cannot deactivate system roles")

        if request.display_name is not None:
            role.display_name = request.display_name
        if request.description is not None:
            role.description = request.description
        if request.permissions is not None:
            role.permissions = request.permissions
        if request.status is not None:
            if request.status not in ['active', 'inactive']:
                raise HTTPException(status_code=400, detail="Invalid status")
            role.status = request.status

        role.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(role)

        user_count = db.query(AdminUser).filter(AdminUser.role == role.name).count()

        return RoleResponse(
            id=str(role.id),
            name=role.name,
            display_name=role.display_name,
            description=role.description,
            permissions=role.permissions or [],
            is_system=role.is_system,
            status=role.status,
            user_count=user_count,
            created_at=role.created_at.isoformat() if role.created_at else None,
            updated_at=role.updated_at.isoformat() if role.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating role: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update role")


@router.delete("/roles/{role_id}", status_code=204)
async def delete_role(role_id: str, db: Session = Depends(get_db)):
    """Delete a role"""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        if role.is_system:
            raise HTTPException(status_code=400, detail="Cannot delete system roles")

        # Check if any users have this role
        user_count = db.query(AdminUser).filter(AdminUser.role == role.name).count()
        if user_count > 0:
            raise HTTPException(status_code=400, detail=f"Cannot delete role with {user_count} assigned users")

        db.delete(role)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting role: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete role")


# ============================================================================
# Policy Endpoints
# ============================================================================

@router.get("/policies", response_model=PolicyListResponse)
async def list_policies(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status: Optional[str] = Query(None),
    resource: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all policies with pagination and filtering"""
    try:
        query = db.query(Policy)

        if status:
            query = query.filter(Policy.status == status)

        if resource:
            query = query.filter(Policy.resource == resource)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Policy.name.ilike(search_pattern)) |
                (Policy.display_name.ilike(search_pattern))
            )

        total = query.count()
        total_pages = (total + per_page - 1) // per_page

        policies = query.order_by(Policy.priority.desc(), Policy.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

        return PolicyListResponse(
            policies=[
                PolicyResponse(
                    id=str(p.id),
                    name=p.name,
                    display_name=p.display_name,
                    description=p.description,
                    resource=p.resource,
                    actions=p.actions or [],
                    conditions=p.conditions,
                    effect=p.effect,
                    priority=p.priority,
                    is_system=p.is_system,
                    status=p.status,
                    created_at=p.created_at.isoformat() if p.created_at else None,
                    updated_at=p.updated_at.isoformat() if p.updated_at else None
                )
                for p in policies
            ],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
    except Exception as e:
        logger.error(f"Error listing policies: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list policies")


@router.get("/policies/{policy_id}", response_model=PolicyResponse)
async def get_policy(policy_id: str, db: Session = Depends(get_db)):
    """Get a specific policy by ID"""
    try:
        policy = db.query(Policy).filter(Policy.id == policy_id).first()
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")

        return PolicyResponse(
            id=str(policy.id),
            name=policy.name,
            display_name=policy.display_name,
            description=policy.description,
            resource=policy.resource,
            actions=policy.actions or [],
            conditions=policy.conditions,
            effect=policy.effect,
            priority=policy.priority,
            is_system=policy.is_system,
            status=policy.status,
            created_at=policy.created_at.isoformat() if policy.created_at else None,
            updated_at=policy.updated_at.isoformat() if policy.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting policy: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get policy")


@router.post("/policies", response_model=PolicyResponse, status_code=201)
async def create_policy(request: PolicyCreateRequest, db: Session = Depends(get_db)):
    """Create a new policy"""
    try:
        # Check if policy name already exists
        existing = db.query(Policy).filter(Policy.name == request.name.lower().replace(' ', '_')).first()
        if existing:
            raise HTTPException(status_code=409, detail=f"Policy '{request.name}' already exists")

        if request.effect not in ['allow', 'deny']:
            raise HTTPException(status_code=400, detail="Effect must be 'allow' or 'deny'")

        policy = Policy(
            name=request.name.lower().replace(' ', '_'),
            display_name=request.display_name,
            description=request.description,
            resource=request.resource,
            actions=request.actions,
            conditions=request.conditions,
            effect=request.effect,
            priority=request.priority,
            is_system=False,
            status='active'
        )

        db.add(policy)
        db.commit()
        db.refresh(policy)

        return PolicyResponse(
            id=str(policy.id),
            name=policy.name,
            display_name=policy.display_name,
            description=policy.description,
            resource=policy.resource,
            actions=policy.actions or [],
            conditions=policy.conditions,
            effect=policy.effect,
            priority=policy.priority,
            is_system=policy.is_system,
            status=policy.status,
            created_at=policy.created_at.isoformat() if policy.created_at else None,
            updated_at=policy.updated_at.isoformat() if policy.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating policy: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create policy")


@router.put("/policies/{policy_id}", response_model=PolicyResponse)
async def update_policy(policy_id: str, request: PolicyUpdateRequest, db: Session = Depends(get_db)):
    """Update a policy"""
    try:
        policy = db.query(Policy).filter(Policy.id == policy_id).first()
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")

        if policy.is_system and request.status == 'inactive':
            raise HTTPException(status_code=400, detail="Cannot deactivate system policies")

        if request.display_name is not None:
            policy.display_name = request.display_name
        if request.description is not None:
            policy.description = request.description
        if request.resource is not None:
            policy.resource = request.resource
        if request.actions is not None:
            policy.actions = request.actions
        if request.conditions is not None:
            policy.conditions = request.conditions
        if request.effect is not None:
            if request.effect not in ['allow', 'deny']:
                raise HTTPException(status_code=400, detail="Effect must be 'allow' or 'deny'")
            policy.effect = request.effect
        if request.priority is not None:
            policy.priority = request.priority
        if request.status is not None:
            if request.status not in ['active', 'inactive']:
                raise HTTPException(status_code=400, detail="Invalid status")
            policy.status = request.status

        policy.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(policy)

        return PolicyResponse(
            id=str(policy.id),
            name=policy.name,
            display_name=policy.display_name,
            description=policy.description,
            resource=policy.resource,
            actions=policy.actions or [],
            conditions=policy.conditions,
            effect=policy.effect,
            priority=policy.priority,
            is_system=policy.is_system,
            status=policy.status,
            created_at=policy.created_at.isoformat() if policy.created_at else None,
            updated_at=policy.updated_at.isoformat() if policy.updated_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating policy: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update policy")


@router.delete("/policies/{policy_id}", status_code=204)
async def delete_policy(policy_id: str, db: Session = Depends(get_db)):
    """Delete a policy"""
    try:
        policy = db.query(Policy).filter(Policy.id == policy_id).first()
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")

        if policy.is_system:
            raise HTTPException(status_code=400, detail="Cannot delete system policies")

        db.delete(policy)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting policy: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete policy")


# ============================================================================
# Permission Endpoints
# ============================================================================

@router.get("/permissions", response_model=PermissionListResponse)
async def list_permissions(
    page: int = Query(1, ge=1),
    per_page: int = Query(100, ge=1, le=200),
    category: Optional[str] = Query(None),
    resource: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List all permissions with pagination and filtering"""
    try:
        query = db.query(Permission)

        if category:
            query = query.filter(Permission.category == category)

        if resource:
            query = query.filter(Permission.resource == resource)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Permission.name.ilike(search_pattern)) |
                (Permission.display_name.ilike(search_pattern))
            )

        total = query.count()
        total_pages = (total + per_page - 1) // per_page

        permissions = query.order_by(Permission.category, Permission.resource, Permission.action).offset((page - 1) * per_page).limit(per_page).all()

        return PermissionListResponse(
            permissions=[
                PermissionResponse(
                    id=str(p.id),
                    name=p.name,
                    display_name=p.display_name,
                    description=p.description,
                    category=p.category,
                    resource=p.resource,
                    action=p.action,
                    is_system=p.is_system,
                    created_at=p.created_at.isoformat() if p.created_at else None
                )
                for p in permissions
            ],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
    except Exception as e:
        logger.error(f"Error listing permissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list permissions")


@router.get("/permissions/{permission_id}", response_model=PermissionResponse)
async def get_permission(permission_id: str, db: Session = Depends(get_db)):
    """Get a specific permission by ID"""
    try:
        permission = db.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")

        return PermissionResponse(
            id=str(permission.id),
            name=permission.name,
            display_name=permission.display_name,
            description=permission.description,
            category=permission.category,
            resource=permission.resource,
            action=permission.action,
            is_system=permission.is_system,
            created_at=permission.created_at.isoformat() if permission.created_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting permission: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get permission")


@router.post("/permissions", response_model=PermissionResponse, status_code=201)
async def create_permission(request: PermissionCreateRequest, db: Session = Depends(get_db)):
    """Create a new permission"""
    try:
        # Generate permission name from resource and action
        perm_name = f"{request.resource}:{request.action}"

        # Check if permission already exists
        existing = db.query(Permission).filter(Permission.name == perm_name).first()
        if existing:
            raise HTTPException(status_code=409, detail=f"Permission '{perm_name}' already exists")

        permission = Permission(
            name=perm_name,
            display_name=request.display_name,
            description=request.description,
            category=request.category,
            resource=request.resource,
            action=request.action,
            is_system=False
        )

        db.add(permission)
        db.commit()
        db.refresh(permission)

        return PermissionResponse(
            id=str(permission.id),
            name=permission.name,
            display_name=permission.display_name,
            description=permission.description,
            category=permission.category,
            resource=permission.resource,
            action=permission.action,
            is_system=permission.is_system,
            created_at=permission.created_at.isoformat() if permission.created_at else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating permission: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create permission")


@router.delete("/permissions/{permission_id}", status_code=204)
async def delete_permission(permission_id: str, db: Session = Depends(get_db)):
    """Delete a permission"""
    try:
        permission = db.query(Permission).filter(Permission.id == permission_id).first()
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")

        if permission.is_system:
            raise HTTPException(status_code=400, detail="Cannot delete system permissions")

        db.delete(permission)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting permission: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete permission")


# ============================================================================
# Statistics Endpoints
# ============================================================================

@router.get("/rbac/stats")
async def get_rbac_stats(db: Session = Depends(get_db)):
    """Get RBAC statistics overview"""
    try:
        total_roles = db.query(Role).count()
        active_roles = db.query(Role).filter(Role.status == 'active').count()
        total_policies = db.query(Policy).count()
        active_policies = db.query(Policy).filter(Policy.status == 'active').count()
        total_permissions = db.query(Permission).count()

        return {
            "roles": {
                "total": total_roles,
                "active": active_roles,
                "inactive": total_roles - active_roles
            },
            "policies": {
                "total": total_policies,
                "active": active_policies,
                "inactive": total_policies - active_policies
            },
            "permissions": {
                "total": total_permissions
            }
        }
    except Exception as e:
        logger.error(f"Error getting RBAC stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get RBAC stats")


# ============================================================================
# Seed Default Data Endpoint (for initialization)
# ============================================================================

@router.post("/rbac/migrate")
async def migrate_rbac_tables(db: Session = Depends(get_db)):
    """Create RBAC tables if they don't exist"""
    try:
        from app.database import engine, Base

        # Create only the RBAC tables
        Role.__table__.create(bind=engine, checkfirst=True)
        Policy.__table__.create(bind=engine, checkfirst=True)
        Permission.__table__.create(bind=engine, checkfirst=True)

        return {
            "message": "RBAC tables created successfully",
            "tables": ["roles", "policies", "permissions"]
        }
    except Exception as e:
        logger.error(f"Error creating RBAC tables: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create RBAC tables: {str(e)}")


@router.post("/rbac/seed")
async def seed_rbac_data(db: Session = Depends(get_db)):
    """Seed default roles, policies, and permissions"""
    try:
        # Check if already seeded
        existing_roles = db.query(Role).count()
        if existing_roles > 0:
            return {"message": "RBAC data already seeded", "seeded": False}

        # Default permissions
        default_permissions = [
            # User Management
            {"name": "users:read", "display_name": "View Users", "category": "User Management", "resource": "users", "action": "read"},
            {"name": "users:write", "display_name": "Create/Edit Users", "category": "User Management", "resource": "users", "action": "write"},
            {"name": "users:delete", "display_name": "Delete Users", "category": "User Management", "resource": "users", "action": "delete"},
            {"name": "users:manage", "display_name": "Manage Users", "category": "User Management", "resource": "users", "action": "manage"},
            # Merchant Management
            {"name": "merchants:read", "display_name": "View Merchants", "category": "Merchant Management", "resource": "merchants", "action": "read"},
            {"name": "merchants:write", "display_name": "Create/Edit Merchants", "category": "Merchant Management", "resource": "merchants", "action": "write"},
            {"name": "merchants:delete", "display_name": "Delete Merchants", "category": "Merchant Management", "resource": "merchants", "action": "delete"},
            {"name": "merchants:manage", "display_name": "Manage Merchants", "category": "Merchant Management", "resource": "merchants", "action": "manage"},
            # Transaction Management
            {"name": "transactions:read", "display_name": "View Transactions", "category": "Transaction Management", "resource": "transactions", "action": "read"},
            {"name": "transactions:write", "display_name": "Process Transactions", "category": "Transaction Management", "resource": "transactions", "action": "write"},
            {"name": "transactions:refund", "display_name": "Refund Transactions", "category": "Transaction Management", "resource": "transactions", "action": "refund"},
            # Analytics
            {"name": "analytics:read", "display_name": "View Analytics", "category": "Analytics", "resource": "analytics", "action": "read"},
            {"name": "analytics:export", "display_name": "Export Analytics", "category": "Analytics", "resource": "analytics", "action": "export"},
            # Settings
            {"name": "settings:read", "display_name": "View Settings", "category": "Settings", "resource": "settings", "action": "read"},
            {"name": "settings:write", "display_name": "Modify Settings", "category": "Settings", "resource": "settings", "action": "write"},
            # Support
            {"name": "support:read", "display_name": "View Support Tickets", "category": "Support", "resource": "support", "action": "read"},
            {"name": "support:write", "display_name": "Manage Support Tickets", "category": "Support", "resource": "support", "action": "write"},
            # RBAC
            {"name": "rbac:read", "display_name": "View Roles & Policies", "category": "Administration", "resource": "rbac", "action": "read"},
            {"name": "rbac:write", "display_name": "Manage Roles & Policies", "category": "Administration", "resource": "rbac", "action": "write"},
        ]

        for perm_data in default_permissions:
            perm = Permission(
                name=perm_data["name"],
                display_name=perm_data["display_name"],
                description=f"Permission to {perm_data['action']} {perm_data['resource']}",
                category=perm_data["category"],
                resource=perm_data["resource"],
                action=perm_data["action"],
                is_system=True
            )
            db.add(perm)

        # Default roles
        default_roles = [
            {
                "name": "admin",
                "display_name": "Administrator",
                "description": "Full system access with all permissions",
                "permissions": [p["name"] for p in default_permissions],
                "is_system": True
            },
            {
                "name": "support_manager",
                "display_name": "Support Manager",
                "description": "Manage support tickets and view user data",
                "permissions": ["users:read", "merchants:read", "transactions:read", "support:read", "support:write", "analytics:read"],
                "is_system": True
            },
            {
                "name": "analyst",
                "display_name": "Analyst",
                "description": "View and export analytics data",
                "permissions": ["analytics:read", "analytics:export", "transactions:read", "merchants:read", "users:read"],
                "is_system": True
            },
            {
                "name": "viewer",
                "display_name": "Viewer",
                "description": "Read-only access to basic data",
                "permissions": ["users:read", "merchants:read", "transactions:read", "analytics:read"],
                "is_system": True
            }
        ]

        for role_data in default_roles:
            role = Role(
                name=role_data["name"],
                display_name=role_data["display_name"],
                description=role_data["description"],
                permissions=role_data["permissions"],
                is_system=role_data["is_system"],
                status='active'
            )
            db.add(role)

        # Default policies
        default_policies = [
            {
                "name": "admin_full_access",
                "display_name": "Admin Full Access",
                "description": "Grants full access to administrators",
                "resource": "*",
                "actions": ["*"],
                "effect": "allow",
                "priority": 100,
                "is_system": True
            },
            {
                "name": "support_ticket_access",
                "display_name": "Support Ticket Access",
                "description": "Allows support managers to handle tickets",
                "resource": "support",
                "actions": ["read", "write"],
                "effect": "allow",
                "priority": 50,
                "is_system": True
            },
            {
                "name": "analytics_read_only",
                "display_name": "Analytics Read Only",
                "description": "Read-only access to analytics",
                "resource": "analytics",
                "actions": ["read", "export"],
                "effect": "allow",
                "priority": 30,
                "is_system": True
            }
        ]

        for policy_data in default_policies:
            policy = Policy(
                name=policy_data["name"],
                display_name=policy_data["display_name"],
                description=policy_data["description"],
                resource=policy_data["resource"],
                actions=policy_data["actions"],
                effect=policy_data["effect"],
                priority=policy_data["priority"],
                is_system=policy_data["is_system"],
                status='active'
            )
            db.add(policy)

        db.commit()

        return {
            "message": "RBAC data seeded successfully",
            "seeded": True,
            "roles_created": len(default_roles),
            "policies_created": len(default_policies),
            "permissions_created": len(default_permissions)
        }
    except Exception as e:
        logger.error(f"Error seeding RBAC data: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to seed RBAC data: {str(e)}")
