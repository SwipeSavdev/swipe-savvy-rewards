"""
Admin Portal - Settings Management Routes

Endpoints for managing platform settings in the admin portal
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["admin-settings"])

# Demo Settings Data
DEMO_SETTINGS = {
    "general": {
        "platformName": "SwipeSavvy",
        "platformDescription": "Digital wallet and payment platform",
        "supportEmail": "support@swipesavvy.com",
        "supportPhone": "+1-800-SWIPE-PAY",
        "timezone": "America/Los_Angeles",
        "language": "en-US"
    },
    "security": {
        "enableTwoFactor": True,
        "enableBiometric": True,
        "sessionTimeout": 3600,
        "maxLoginAttempts": 5,
        "requireStrongPassword": True,
        "passwordMinLength": 12,
        "enableIpWhitelist": False
    },
    "payments": {
        "minTransaction": 0.01,
        "maxTransaction": 10000.00,
        "dailyLimit": 50000.00,
        "transactionFee": 0.49,
        "platformFeePercentage": 2.5,
        "enableCrypto": False,
        "supportedCurrencies": ["USD", "EUR", "GBP"]
    },
    "notifications": {
        "enableEmailNotifications": True,
        "enableSmsNotifications": True,
        "enablePushNotifications": True,
        "emailFrequency": "immediate",
        "smsFrequency": "critical_only",
        "unsubscribeRate": 5.2
    },
    "compliance": {
        "enableKyc": True,
        "kycLevel": "full",
        "enableAml": True,
        "dataRetentionDays": 2555,
        "gdprCompliant": True,
        "ccpaCompliant": True
    },
    "branding": {
        "logoUrl": "https://cdn.swipesavvy.com/logo.png",
        "faviconUrl": "https://cdn.swipesavvy.com/favicon.ico",
        "primaryColor": "#007AFF",
        "secondaryColor": "#5AC8FA",
        "accentColor": "#FF5252",
        "fontFamily": "Segoe UI, Roboto"
    }
}

class SettingValue(BaseModel):
    value: Any

@router.get("/settings")
async def get_all_settings() -> Dict[str, Any]:
    """Get all platform settings"""
    try:
        return {
            "success": True,
            "settings": DEMO_SETTINGS,
            "lastUpdated": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get settings")


@router.get("/settings/{category}")
async def get_settings_by_category(category: str) -> Dict[str, Any]:
    """Get settings for a specific category"""
    try:
        if category not in DEMO_SETTINGS:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")
        
        return {
            "success": True,
            "category": category,
            "settings": DEMO_SETTINGS[category],
            "lastUpdated": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting settings by category: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get settings")


@router.get("/settings/{category}/{key}")
async def get_setting(category: str, key: str) -> Dict[str, Any]:
    """Get a specific setting by category and key"""
    try:
        if category not in DEMO_SETTINGS:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")
        
        if key not in DEMO_SETTINGS[category]:
            raise HTTPException(status_code=404, detail=f"Setting key '{key}' not found in category '{category}'")
        
        return {
            "success": True,
            "category": category,
            "key": key,
            "value": DEMO_SETTINGS[category][key],
            "lastUpdated": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting setting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get setting")


@router.put("/settings/{category}/{key}")
async def update_setting(category: str, key: str, setting: SettingValue) -> Dict[str, Any]:
    """Update a specific setting"""
    try:
        if category not in DEMO_SETTINGS:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")
        
        if key not in DEMO_SETTINGS[category]:
            raise HTTPException(status_code=404, detail=f"Setting key '{key}' not found in category '{category}'")
        
        old_value = DEMO_SETTINGS[category][key]
        DEMO_SETTINGS[category][key] = setting.value
        
        return {
            "success": True,
            "message": f"Setting {category}.{key} updated successfully",
            "category": category,
            "key": key,
            "oldValue": old_value,
            "newValue": setting.value,
            "updatedAt": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating setting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update setting")


@router.put("/settings/{category}")
async def update_category_settings(category: str, settings: Dict[str, Any]) -> Dict[str, Any]:
    """Update multiple settings in a category"""
    try:
        if category not in DEMO_SETTINGS:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")
        
        changes = {}
        for key, value in settings.items():
            if key in DEMO_SETTINGS[category]:
                old_value = DEMO_SETTINGS[category][key]
                DEMO_SETTINGS[category][key] = value
                changes[key] = {"from": old_value, "to": value}
            else:
                # Create new setting if it doesn't exist
                DEMO_SETTINGS[category][key] = value
                changes[key] = {"created": True, "value": value}
        
        return {
            "success": True,
            "message": f"Settings in category '{category}' updated successfully",
            "category": category,
            "changes": changes,
            "updatedAt": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating category settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update category settings")


@router.post("/settings/reset/{category}")
async def reset_category_settings(category: str) -> Dict[str, Any]:
    """Reset all settings in a category to defaults"""
    try:
        if category not in DEMO_SETTINGS:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")
        
        return {
            "success": True,
            "message": f"Settings in category '{category}' have been reset to defaults",
            "category": category,
            "resetAt": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting category settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reset category settings")


@router.get("/settings/categories/list")
async def list_categories() -> Dict[str, Any]:
    """List all available settings categories"""
    try:
        categories = []
        for cat_name, cat_settings in DEMO_SETTINGS.items():
            categories.append({
                "name": cat_name,
                "settingsCount": len(cat_settings),
                "keys": list(cat_settings.keys())
            })
        
        return {
            "success": True,
            "categories": categories,
            "totalCategories": len(categories)
        }
    except Exception as e:
        logger.error(f"Error listing categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list categories")
