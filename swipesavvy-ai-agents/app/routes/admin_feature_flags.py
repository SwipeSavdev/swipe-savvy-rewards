"""
Admin Portal - Feature Flags Management Routes

Endpoints for managing feature flags in the admin portal
"""

from fastapi import APIRouter, HTTPException, Query, Depends, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import logging
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import FeatureFlag as FeatureFlagModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["admin-feature-flags"])

# Error message constants
FEATURE_FLAG_NOT_FOUND = "Feature flag not found"

class FeatureFlagResponse(BaseModel):
    id: str
    name: str
    displayName: str
    description: Optional[str]
    enabled: bool
    rolloutPercentage: int
    targetedUsers: List[str]
    createdAt: str
    updatedAt: str
    createdBy: Optional[str]
    environment: str

class FlagsListResponse(BaseModel):
    flags: List[FeatureFlagResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class ToggleFlagRequest(BaseModel):
    enabled: bool

class UpdateRolloutRequest(BaseModel):
    rollout: int = Field(..., ge=0, le=100)

@router.get("/feature-flags")
async def list_feature_flags(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=200),
    enabled: Optional[bool] = Query(None),
    environment: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    List all feature flags with pagination and filtering
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10, max: 200)
    - enabled: Filter by enabled status (true/false)
    - environment: Filter by environment (production, staging, development)
    - search: Search by name or description
    """
    try:
        query = db.query(FeatureFlagModel)
        
        if enabled is not None:
            query = query.filter(FeatureFlagModel.enabled == enabled)
        
        if environment:
            query = query.filter(FeatureFlagModel.environment == environment)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (FeatureFlagModel.name.ilike(search_pattern)) |
                (FeatureFlagModel.description.ilike(search_pattern))
            )
        
        total = query.count()
        total_pages = (total + per_page - 1) // per_page
        
        flags = query.offset((page - 1) * per_page).limit(per_page).all()
        
        return {
            "flags": [
                FeatureFlagResponse(
                    id=str(f.id),
                    name=f.name,
                    displayName=f.display_name,
                    description=f.description,
                    enabled=f.enabled,
                    rolloutPercentage=f.rollout_percentage,
                    targetedUsers=f.targeted_users or [],
                    createdAt=f.created_at.isoformat() if f.created_at else None,
                    updatedAt=f.updated_at.isoformat() if f.updated_at else None,
                    createdBy=str(f.created_by) if f.created_by else None,
                    environment=f.environment
                )
                for f in flags
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error listing feature flags: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list feature flags")


@router.get("/feature-flags/{flag_id}")
async def get_feature_flag(flag_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get a specific feature flag by ID"""
    try:
        flag = db.query(FeatureFlagModel).filter(FeatureFlagModel.id == flag_id).first()
        if not flag:
            raise HTTPException(status_code=404, detail=FEATURE_FLAG_NOT_FOUND)
        
        return {
            "success": True,
            "flag": FeatureFlagResponse(
                id=str(flag.id),
                name=flag.name,
                displayName=flag.display_name,
                description=flag.description,
                enabled=flag.enabled,
                rolloutPercentage=flag.rollout_percentage,
                targetedUsers=flag.targeted_users or [],
                createdAt=flag.created_at.isoformat() if flag.created_at else None,
                updatedAt=flag.updated_at.isoformat() if flag.updated_at else None,
                createdBy=str(flag.created_by) if flag.created_by else None,
                environment=flag.environment
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feature flag: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get feature flag")


@router.put("/feature-flags/{flag_id}")
async def update_feature_flag(
    flag_id: str,
    enabled: Optional[bool] = None,
    rollout_percentage: Optional[int] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update feature flag settings"""
    try:
        flag = db.query(FeatureFlagModel).filter(FeatureFlagModel.id == flag_id).first()
        if not flag:
            raise HTTPException(status_code=404, detail=FEATURE_FLAG_NOT_FOUND)
        
        if enabled is not None:
            flag.enabled = enabled
        
        if rollout_percentage is not None:
            if not (0 <= rollout_percentage <= 100):
                raise HTTPException(status_code=422, detail="Rollout percentage must be between 0 and 100")
            flag.rollout_percentage = rollout_percentage
        
        flag.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(flag)
        
        return {
            "success": True,
            "message": "Feature flag updated successfully",
            "flag": FeatureFlagResponse(
                id=str(flag.id),
                name=flag.name,
                displayName=flag.display_name,
                description=flag.description,
                enabled=flag.enabled,
                rolloutPercentage=flag.rollout_percentage,
                targetedUsers=flag.targeted_users or [],
                createdAt=flag.created_at.isoformat() if flag.created_at else None,
                updatedAt=flag.updated_at.isoformat() if flag.updated_at else None,
                createdBy=str(flag.created_by) if flag.created_by else None,
                environment=flag.environment
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating feature flag: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update feature flag")


@router.put("/feature-flags/{flag_id}/toggle")
async def toggle_feature_flag(
    flag_id: str,
    request: ToggleFlagRequest = Body(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Toggle a feature flag on/off"""
    try:
        flag = db.query(FeatureFlagModel).filter(FeatureFlagModel.id == flag_id).first()
        if not flag:
            raise HTTPException(status_code=404, detail=FEATURE_FLAG_NOT_FOUND)
        
        flag.enabled = request.enabled
        flag.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(flag)
        
        return {
            "success": True,
            "message": f"Feature flag {flag.name} {'enabled' if request.enabled else 'disabled'}",
            "flag": FeatureFlagResponse(
                id=str(flag.id),
                name=flag.name,
                displayName=flag.display_name,
                description=flag.description,
                enabled=flag.enabled,
                rolloutPercentage=flag.rollout_percentage,
                targetedUsers=flag.targeted_users or [],
                createdAt=flag.created_at.isoformat() if flag.created_at else None,
                updatedAt=flag.updated_at.isoformat() if flag.updated_at else None,
                createdBy=str(flag.created_by) if flag.created_by else None,
                environment=flag.environment
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling feature flag: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to toggle feature flag")


@router.put("/feature-flags/{flag_id}/rollout")
async def update_rollout(
    flag_id: str,
    request: UpdateRolloutRequest = Body(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update feature flag rollout percentage"""
    try:
        flag = db.query(FeatureFlagModel).filter(FeatureFlagModel.id == flag_id).first()
        if not flag:
            raise HTTPException(status_code=404, detail=FEATURE_FLAG_NOT_FOUND)
        
        flag.rollout_percentage = request.rollout
        flag.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(flag)
        
        return {
            "success": True,
            "message": f"Rollout percentage updated to {request.rollout}%",
            "flag": FeatureFlagResponse(
                id=str(flag.id),
                name=flag.name,
                displayName=flag.display_name,
                description=flag.description,
                enabled=flag.enabled,
                rolloutPercentage=flag.rollout_percentage,
                targetedUsers=flag.targeted_users or [],
                createdAt=flag.created_at.isoformat() if flag.created_at else None,
                updatedAt=flag.updated_at.isoformat() if flag.updated_at else None,
                createdBy=str(flag.created_by) if flag.created_by else None,
                environment=flag.environment
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating rollout percentage: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update rollout percentage")

@router.get("/feature-flags/stats/overview")
async def get_flags_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get feature flags overview statistics"""
    try:
        flags = db.query(FeatureFlagModel).all()
        
        enabled_count = sum(1 for f in flags if f.enabled)
        disabled_count = len(flags) - enabled_count
        avg_rollout = sum(f.rollout_percentage for f in flags) / len(flags) if flags else 0
        
        return {
            "total_flags": len(flags),
            "enabled_flags": enabled_count,
            "disabled_flags": disabled_count,
            "avg_rollout": avg_rollout,
            "production_flags": sum(1 for f in flags if f.environment == 'production'),
            "staging_flags": sum(1 for f in flags if f.environment == 'staging')
        }
    except Exception as e:
        logger.error(f"Error getting flags stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get flags stats")
