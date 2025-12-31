"""Feature Flag API routes for admin portal."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from app.database import get_db
from app.models import FeatureFlag
from datetime import datetime, timezone

router = APIRouter(prefix="/api/feature-flags", tags=["feature-flags"])

# Error message constants
FEATURE_FLAG_NOT_FOUND = "Feature flag not found"

# Pydantic models for request/response
class FeatureFlagCreate(BaseModel):
    name: str
    description: Optional[str] = None
    enabled: bool = False
    rollout_percentage: int = 0
    environment: str = "development"

class FeatureFlagUpdate(BaseModel):
    description: Optional[str] = None
    enabled: Optional[bool] = None
    rollout_percentage: Optional[int] = None

class FeatureFlagResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    enabled: bool
    rollout_percentage: int
    environment: str
    created_at: str
    
    class Config:
        from_attributes = True

class FeatureFlagListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    flags: List[FeatureFlagResponse]

class MobileFeatureFlagsResponse(BaseModel):
    flags: Dict[str, Any]
    timestamp: str
    version: str = "1.0"

# Mock user_id for demo (in production, extract from JWT token)
DEMO_USER_ID = "admin-user-1"


@router.post("/", response_model=dict)
def create_feature_flag(
    flag_data: FeatureFlagCreate,
    db: Session = Depends(get_db),
):
    """Create a new feature flag."""
    # Check if flag already exists
    existing = db.query(FeatureFlag).filter(FeatureFlag.name == flag_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Feature flag '{flag_data.name}' already exists")

    flag = FeatureFlag(
        name=flag_data.name,
        display_name=flag_data.name.replace('_', ' ').title(),
        description=flag_data.description,
        enabled=flag_data.enabled,
        rollout_percentage=flag_data.rollout_percentage,
        environment=flag_data.environment,
        created_by=DEMO_USER_ID,
    )
    db.add(flag)
    db.commit()
    db.refresh(flag)
    
    return {
        "success": True,
        "data": {
            "id": str(flag.id),
            "name": flag.name,
            "description": flag.description,
            "enabled": flag.enabled,
            "rollout_percentage": flag.rollout_percentage,
            "environment": flag.environment,
            "created_at": flag.created_at.isoformat() if flag.created_at else None,
        },
    }


@router.get("/{flag_id}", response_model=dict)
def get_feature_flag(
    flag_id: str,
    db: Session = Depends(get_db),
):
    """Get a feature flag by ID."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail=FEATURE_FLAG_NOT_FOUND)

    return {
        "success": True,
        "data": {
            "id": str(flag.id),
            "name": flag.name,
            "description": flag.description,
            "enabled": flag.enabled,
            "rollout_percentage": flag.rollout_percentage,
            "environment": flag.environment,
            "created_at": flag.created_at.isoformat() if flag.created_at else None,
        },
    }


@router.get("/name/{flag_name}", response_model=dict)
def get_feature_flag_by_name(
    flag_name: str,
    db: Session = Depends(get_db),
):
    """Get a feature flag by name."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.name == flag_name).first()
    if not flag:
        raise HTTPException(status_code=404, detail=FEATURE_FLAG_NOT_FOUND)

    return {
        "success": True,
        "data": {
            "id": str(flag.id),
            "name": flag.name,
            "description": flag.description,
            "enabled": flag.enabled,
            "rollout_percentage": flag.rollout_percentage,
            "environment": flag.environment,
            "created_at": flag.created_at.isoformat() if flag.created_at else None,
        },
    }


@router.get("", response_model=dict)
def list_feature_flags(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    enabled_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    """List all feature flags with pagination."""
    query = db.query(FeatureFlag)
    
    if enabled_only:
        query = query.filter(FeatureFlag.enabled == True)
    
    total = query.count()
    flags = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "success": True,
        "data": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "flags": [
                {
                    "id": str(f.id),
                    "name": f.name,
                    "description": f.description,
                    "enabled": f.enabled,
                    "rollout_percentage": f.rollout_percentage,
                    "environment": f.environment,
                    "created_at": f.created_at.isoformat() if f.created_at else None,
                }
                for f in flags
            ]
        },
    }


@router.put("/{flag_id}", response_model=dict)
def update_feature_flag(
    flag_id: str,
    flag_data: FeatureFlagUpdate,
    db: Session = Depends(get_db),
):
    """Update a feature flag."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail=FEATURE_FLAG_NOT_FOUND)

    if flag_data.description is not None:
        flag.description = flag_data.description
    if flag_data.enabled is not None:
        flag.enabled = flag_data.enabled
    if flag_data.rollout_percentage is not None:
        flag.rollout_percentage = flag_data.rollout_percentage
    
    flag.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(flag)

    return {
        "success": True,
        "data": {
            "id": str(flag.id),
            "name": flag.name,
            "description": flag.description,
            "enabled": flag.enabled,
            "rollout_percentage": flag.rollout_percentage,
            "environment": flag.environment,
            "created_at": flag.created_at.isoformat() if flag.created_at else None,
        },
    }


@router.patch("/{flag_id}/toggle", response_model=dict)
def toggle_feature_flag(
    flag_id: str,
    enabled: bool = Query(...),
    db: Session = Depends(get_db),
):
    """Toggle a feature flag on/off."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail=FEATURE_FLAG_NOT_FOUND)

    flag.enabled = enabled
    flag.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(flag)

    return {
        "success": True,
        "data": {
            "id": str(flag.id),
            "name": flag.name,
            "description": flag.description,
            "enabled": flag.enabled,
            "rollout_percentage": flag.rollout_percentage,
            "environment": flag.environment,
            "created_at": flag.created_at.isoformat() if flag.created_at else None,
        },
        "message": f"Feature flag toggled {'on' if enabled else 'off'}",
    }


@router.delete("/{flag_id}", response_model=dict)
def delete_feature_flag(
    flag_id: str,
    db: Session = Depends(get_db),
):
    """Delete a feature flag."""
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail=FEATURE_FLAG_NOT_FOUND)
    
    db.delete(flag)
    db.commit()

    return {
        "success": True,
        "message": "Feature flag deleted successfully",
    }


@router.get("/mobile/active", response_model=dict)
def get_mobile_feature_flags(
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Get active feature flags for mobile app.
    
    This endpoint returns only enabled flags, considering rollout percentage.
    Used by mobile app to determine which features to show.
    """
    flags = db.query(FeatureFlag).filter(FeatureFlag.enabled == True).all()

    # Convert to mobile-friendly format
    mobile_flags = {
        f.name: {
            "enabled": f.enabled,
            "rollout_percentage": f.rollout_percentage,
            "environment": f.environment,
        }
        for f in flags
    }

    return {
        "success": True,
        "data": {
            "flags": mobile_flags,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": "1.0"
        },
    }
