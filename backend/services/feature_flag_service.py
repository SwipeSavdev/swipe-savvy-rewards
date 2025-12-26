"""
Feature Flag Management Service
Handles feature flag operations, caching, and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import json
from enum import Enum

# Feature Flag Models
class FeatureFlagCategory(str, Enum):
    UI = "ui"
    ADVANCED = "advanced"
    EXPERIMENTAL = "experimental"
    ROLLOUT = "rollout"

class FeatureFlagStatus(str, Enum):
    ENABLED = "enabled"
    DISABLED = "disabled"

# In-memory cache for feature flags (can be Redis in production)
feature_flags_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 300  # 5 minutes

class FeatureFlagService:
    """Service for managing feature flags"""
    
    @staticmethod
    def is_feature_enabled(flag_key: str, user_id: Optional[str] = None) -> bool:
        """
        Check if a feature flag is enabled for a user
        
        Args:
            flag_key: The feature flag key
            user_id: Optional user ID for targeting rules
            
        Returns:
            Boolean indicating if feature is enabled
        """
        # Check cache first
        if flag_key in feature_flags_cache:
            cached_flag = feature_flags_cache[flag_key]
            if cached_flag['cached_at'] > datetime.utcnow() - timedelta(seconds=CACHE_TTL):
                return cached_flag['enabled']
        
        # Would query database if cache miss
        return False
    
    @staticmethod
    def get_flag_variant(flag_key: str, user_id: Optional[str] = None) -> str:
        """
        Get the variant for a feature flag (for A/B testing)
        
        Args:
            flag_key: The feature flag key
            user_id: User ID for consistent variant assignment
            
        Returns:
            Variant identifier (control, treatment, a, b, etc.)
        """
        # Hash user_id to determine consistent variant
        if not user_id:
            return "control"
        
        hash_value = hash(f"{flag_key}:{user_id}")
        percentage = (hash_value % 100)
        return "treatment" if percentage < 50 else "control"
    
    @staticmethod
    def track_feature_usage(
        flag_key: str,
        user_id: Optional[str] = None,
        action: str = "view",
        device_type: str = "mobile"
    ) -> None:
        """
        Track feature flag usage for analytics
        
        Args:
            flag_key: The feature flag key
            user_id: User ID if authenticated
            action: Type of action (view, interact, complete, dismiss)
            device_type: Device type (ios, android, web)
        """
        # Would insert into feature_flag_usage table
        pass


# FastAPI Router
router = APIRouter(prefix="/api/features", tags=["feature-flags"])

# Sample Feature Flags Configuration
FEATURE_FLAGS = {
    "tier_progress_bar": {
        "key": "tier_progress_bar",
        "name": "Tier Progress Bar",
        "description": "Display tier progress visualization on rewards screen",
        "category": FeatureFlagCategory.UI,
        "enabled": True,
        "rollout_percentage": 100,
    },
    "amount_chip_selector": {
        "key": "amount_chip_selector",
        "name": "Amount Chip Selector",
        "description": "Quick select amount chips for donations",
        "category": FeatureFlagCategory.UI,
        "enabled": True,
        "rollout_percentage": 100,
    },
    "platform_goal_meter": {
        "key": "platform_goal_meter",
        "name": "Platform Goal Meter",
        "description": "Show community-wide goal progress",
        "category": FeatureFlagCategory.UI,
        "enabled": True,
        "rollout_percentage": 100,
    },
    "social_sharing": {
        "key": "social_sharing",
        "name": "Social Sharing",
        "description": "Allow sharing receipts to social media",
        "category": FeatureFlagCategory.ADVANCED,
        "enabled": True,
        "rollout_percentage": 100,
    },
    "receipt_generation": {
        "key": "receipt_generation",
        "name": "Receipt Generation",
        "description": "Generate and download transaction receipts",
        "category": FeatureFlagCategory.ADVANCED,
        "enabled": True,
        "rollout_percentage": 100,
    },
    "community_feed": {
        "key": "community_feed",
        "name": "Community Feed",
        "description": "Share transactions to community feed",
        "category": FeatureFlagCategory.ADVANCED,
        "enabled": False,
        "rollout_percentage": 0,
    },
    "ai_concierge_chat": {
        "key": "ai_concierge_chat",
        "name": "AI Concierge",
        "description": "Enable AI Concierge bottom sheet chat",
        "category": FeatureFlagCategory.UI,
        "enabled": True,
        "rollout_percentage": 100,
    },
    "dark_mode": {
        "key": "dark_mode",
        "name": "Dark Mode Support",
        "description": "Enable dark mode theme switching",
        "category": FeatureFlagCategory.UI,
        "enabled": True,
        "rollout_percentage": 100,
    },
    "notification_center": {
        "key": "notification_center",
        "name": "Notification Center",
        "description": "Centralized notification management",
        "category": FeatureFlagCategory.EXPERIMENTAL,
        "enabled": False,
        "rollout_percentage": 0,
    },
    "advanced_analytics": {
        "key": "advanced_analytics",
        "name": "Advanced Analytics",
        "description": "Enhanced transaction analytics dashboard",
        "category": FeatureFlagCategory.ADVANCED,
        "enabled": False,
        "rollout_percentage": 0,
    },
}


@router.get("/check/{flag_key}")
async def check_feature_flag(
    flag_key: str,
    user_id: Optional[str] = Query(None),
) -> Dict[str, Any]:
    """Check if a feature flag is enabled"""
    if flag_key not in FEATURE_FLAGS:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    
    flag = FEATURE_FLAGS[flag_key]
    variant = FeatureFlagService.get_flag_variant(flag_key, user_id)
    is_enabled = flag.get("enabled", False)
    
    # Track usage
    FeatureFlagService.track_feature_usage(flag_key, user_id)
    
    return {
        "flag_key": flag_key,
        "enabled": is_enabled,
        "variant": variant,
        "rollout_percentage": flag.get("rollout_percentage", 0),
    }


@router.get("/all")
async def get_all_features() -> Dict[str, Dict[str, Any]]:
    """Get all feature flags and their status"""
    return {
        key: {
            **flag,
            "category": flag["category"].value,
        }
        for key, flag in FEATURE_FLAGS.items()
    }


@router.get("/by-category/{category}")
async def get_features_by_category(category: str) -> List[Dict[str, Any]]:
    """Get feature flags by category"""
    return [
        {
            **flag,
            "category": flag["category"].value,
        }
        for key, flag in FEATURE_FLAGS.items()
        if flag["category"].value == category
    ]


@router.post("/{flag_key}/toggle")
async def toggle_feature_flag(flag_key: str) -> Dict[str, Any]:
    """Toggle a feature flag on/off (admin only)"""
    if flag_key not in FEATURE_FLAGS:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    
    flag = FEATURE_FLAGS[flag_key]
    flag["enabled"] = not flag["enabled"]
    flag["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "flag_key": flag_key,
        "enabled": flag["enabled"],
        "message": f"Feature '{flag['name']}' is now {'enabled' if flag['enabled'] else 'disabled'}"
    }


@router.post("/{flag_key}/rollout")
async def set_rollout_percentage(
    flag_key: str,
    percentage: int = Query(..., ge=0, le=100)
) -> Dict[str, Any]:
    """Set rollout percentage for a feature flag (admin only)"""
    if flag_key not in FEATURE_FLAGS:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    
    if not 0 <= percentage <= 100:
        raise HTTPException(status_code=400, detail="Percentage must be 0-100")
    
    flag = FEATURE_FLAGS[flag_key]
    flag["rollout_percentage"] = percentage
    flag["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "flag_key": flag_key,
        "rollout_percentage": percentage,
        "message": f"Rollout percentage for '{flag['name']}' set to {percentage}%"
    }


@router.get("/{flag_key}/analytics")
async def get_feature_analytics(
    flag_key: str,
    days: int = Query(7, ge=1, le=90)
) -> Dict[str, Any]:
    """Get analytics for a feature flag"""
    if flag_key not in FEATURE_FLAGS:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    
    flag = FEATURE_FLAGS[flag_key]
    
    return {
        "flag_key": flag_key,
        "flag_name": flag["name"],
        "total_users": 0,  # Would query database
        "total_interactions": 0,
        "completion_rate": 0.0,
        "engagement_score": 0.0,
        "period_days": days,
        "trends": [],
        "daily_data": [],
    }


@router.get("/{flag_key}/variants")
async def get_feature_variants(flag_key: str) -> Dict[str, Any]:
    """Get A/B test variant data for a feature"""
    if flag_key not in FEATURE_FLAGS:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    
    return {
        "flag_key": flag_key,
        "variants": [
            {
                "name": "control",
                "percentage": 50,
                "users": 0,
                "conversions": 0,
                "conversion_rate": 0.0,
            },
            {
                "name": "treatment",
                "percentage": 50,
                "users": 0,
                "conversions": 0,
                "conversion_rate": 0.0,
            }
        ]
    }


@router.get("/audit-log")
async def get_audit_log(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
) -> Dict[str, Any]:
    """Get audit log of feature flag changes"""
    return {
        "total": 0,
        "limit": limit,
        "offset": offset,
        "logs": []
    }


def setup_feature_flags_routes(app):
    """Setup feature flags routes in FastAPI app"""
    app.include_router(router)
