"""
Admin Portal - Settings Management Routes

Endpoints for managing platform settings in the admin portal
Settings are persisted to the database.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
import logging
import json
import os
import uuid
import shutil

from app.database import get_db
from app.models import Setting

# Directory for storing uploaded branding images
BRANDING_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "branding")
os.makedirs(BRANDING_UPLOAD_DIR, exist_ok=True)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["admin-settings"])

# Default Settings (used for initialization)
DEFAULT_SETTINGS = {
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


def get_data_type(value: Any) -> str:
    """Determine the data type of a value for storage"""
    if isinstance(value, bool):
        return 'boolean'
    elif isinstance(value, int):
        return 'integer'
    elif isinstance(value, float):
        return 'float'
    elif isinstance(value, (list, dict)):
        return 'json'
    return 'string'


def serialize_value(value: Any) -> str:
    """Serialize a value for database storage"""
    if isinstance(value, (list, dict)):
        return json.dumps(value)
    elif isinstance(value, bool):
        return 'true' if value else 'false'
    return str(value)


def deserialize_value(value: str, data_type: str) -> Any:
    """Deserialize a value from database storage"""
    if data_type == 'boolean':
        return value.lower() == 'true'
    elif data_type == 'integer':
        return int(value)
    elif data_type == 'float':
        return float(value)
    elif data_type == 'json':
        return json.loads(value)
    return value


def get_settings_from_db(db: Session) -> Dict[str, Dict[str, Any]]:
    """Load all settings from database, with defaults for missing values"""
    settings = {}

    # Start with defaults
    for category, cat_settings in DEFAULT_SETTINGS.items():
        settings[category] = cat_settings.copy()

    # Override with database values
    db_settings = db.query(Setting).all()
    for s in db_settings:
        if s.category not in settings:
            settings[s.category] = {}
        settings[s.category][s.key] = deserialize_value(s.value, s.data_type)

    return settings


def save_setting_to_db(db: Session, category: str, key: str, value: Any, description: Optional[str] = None):
    """Save or update a setting in the database"""
    data_type = get_data_type(value)
    serialized = serialize_value(value)

    existing = db.query(Setting).filter(
        Setting.category == category,
        Setting.key == key
    ).first()

    if existing:
        existing.value = serialized
        existing.data_type = data_type
        existing.updated_at = datetime.utcnow()
        if description:
            existing.description = description
    else:
        new_setting = Setting(
            category=category,
            key=key,
            value=serialized,
            data_type=data_type,
            description=description or f"{category}.{key} setting"
        )
        db.add(new_setting)

    db.commit()


class SettingValue(BaseModel):
    value: Any


class BulkUpdateRequest(BaseModel):
    settings: Dict[str, Any]


@router.get("/settings")
async def get_all_settings(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get all platform settings"""
    try:
        settings = get_settings_from_db(db)

        # Get the most recent update time
        latest = db.query(Setting).order_by(Setting.updated_at.desc()).first()
        last_updated = latest.updated_at.isoformat() if latest else datetime.now().isoformat()

        return {
            "success": True,
            "settings": settings,
            "lastUpdated": last_updated
        }
    except Exception as e:
        logger.error(f"Error getting settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get settings")


# ============================================================================
# Branding Image Management Endpoints (must be before generic {category}/{key} routes)
# ============================================================================

@router.get("/settings/branding/images")
async def get_branding_images(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get all uploaded branding images"""
    try:
        # Query directly to handle case when no images exist yet
        setting = db.query(Setting).filter(
            Setting.category == "branding",
            Setting.key == "images"
        ).first()

        images = []
        if setting and setting.value:
            try:
                images = json.loads(setting.value)
            except json.JSONDecodeError:
                images = []

        return {
            "success": True,
            "images": images
        }
    except Exception as e:
        logger.error(f"Error getting branding images: {str(e)}")
        # Return empty images instead of error when none exist
        return {
            "success": True,
            "images": []
        }


@router.get("/settings/branding/images/file/{filename}")
async def get_branding_image_file(filename: str):
    """Serve a branding image file"""
    try:
        file_path = os.path.join(BRANDING_UPLOAD_DIR, filename)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Image not found")

        # Determine content type
        ext = os.path.splitext(filename)[1].lower()
        content_types = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".gif": "image/gif",
            ".webp": "image/webp"
        }
        content_type = content_types.get(ext, "application/octet-stream")

        return FileResponse(file_path, media_type=content_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving branding image: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to serve image")


@router.post("/settings/branding/upload")
async def upload_branding_image(
    file: UploadFile = File(...),
    type: str = Form(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Upload a branding image (logo, favicon, or banner)"""
    try:
        # Validate file type
        allowed_types = ["image/png", "image/jpeg", "image/svg+xml", "image/x-icon", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )

        # Validate image type
        valid_image_types = ["logo", "favicon", "banner"]
        if type not in valid_image_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image type. Must be one of: {', '.join(valid_image_types)}"
            )

        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1] or ".png"
        unique_id = str(uuid.uuid4())[:8]
        new_filename = f"{type}_{unique_id}{file_ext}"
        file_path = os.path.join(BRANDING_UPLOAD_DIR, new_filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Get current images and remove any existing image of the same type
        setting = db.query(Setting).filter(
            Setting.category == "branding",
            Setting.key == "images"
        ).first()

        images = []
        if setting and setting.value:
            try:
                images = json.loads(setting.value)
            except json.JSONDecodeError:
                images = []

        images = [img for img in images if img.get("type") != type]

        # Add new image
        new_image = {
            "id": unique_id,
            "name": file.filename,
            "url": f"/api/v1/admin/settings/branding/images/file/{new_filename}",
            "type": type,
            "uploadedAt": datetime.utcnow().isoformat(),
            "filename": new_filename
        }
        images.append(new_image)

        # Save to database
        save_setting_to_db(db, "branding", "images", images)

        logger.info(f"Uploaded branding image: {new_filename} (type: {type})")

        return {
            "success": True,
            "message": f"{type.capitalize()} uploaded successfully",
            "image": new_image
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading branding image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@router.delete("/settings/branding/images/{image_id}")
async def delete_branding_image(image_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Delete a branding image"""
    try:
        # Get current images
        setting = db.query(Setting).filter(
            Setting.category == "branding",
            Setting.key == "images"
        ).first()

        images = []
        if setting and setting.value:
            try:
                images = json.loads(setting.value)
            except json.JSONDecodeError:
                images = []

        # Find the image
        image_to_delete = None
        for img in images:
            if img.get("id") == image_id:
                image_to_delete = img
                break

        if not image_to_delete:
            raise HTTPException(status_code=404, detail="Image not found")

        # Delete the file
        if image_to_delete.get("filename"):
            file_path = os.path.join(BRANDING_UPLOAD_DIR, image_to_delete["filename"])
            if os.path.exists(file_path):
                os.remove(file_path)

        # Remove from list and save
        images = [img for img in images if img.get("id") != image_id]
        save_setting_to_db(db, "branding", "images", images)

        logger.info(f"Deleted branding image: {image_id}")

        return {
            "success": True,
            "message": "Image deleted successfully",
            "deletedId": image_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting branding image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")


# ============================================================================
# Generic Settings Routes (after specific routes)
# ============================================================================

@router.get("/settings/{category}")
async def get_settings_by_category(category: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get settings for a specific category"""
    try:
        settings = get_settings_from_db(db)

        if category not in settings:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")

        return {
            "success": True,
            "category": category,
            "settings": settings[category],
            "lastUpdated": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting settings by category: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get settings")


@router.get("/settings/{category}/{key}")
async def get_setting(category: str, key: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get a specific setting by category and key"""
    try:
        settings = get_settings_from_db(db)

        if category not in settings:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")

        if key not in settings[category]:
            raise HTTPException(status_code=404, detail=f"Setting key '{key}' not found in category '{category}'")

        return {
            "success": True,
            "category": category,
            "key": key,
            "value": settings[category][key],
            "lastUpdated": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting setting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get setting")


@router.put("/settings/{category}/{key}")
async def update_setting(category: str, key: str, setting: SettingValue, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Update a specific setting"""
    try:
        settings = get_settings_from_db(db)

        if category not in settings:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")

        old_value = settings[category].get(key)

        # Save to database
        save_setting_to_db(db, category, key, setting.value)

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
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update setting")


@router.put("/settings/{category}")
async def update_category_settings(category: str, request: BulkUpdateRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Update multiple settings in a category"""
    try:
        settings = get_settings_from_db(db)

        if category not in settings and category not in DEFAULT_SETTINGS:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")

        changes = {}
        for key, value in request.settings.items():
            old_value = settings.get(category, {}).get(key)
            save_setting_to_db(db, category, key, value)

            if old_value is not None:
                changes[key] = {"from": old_value, "to": value}
            else:
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
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update category settings")


@router.put("/settings")
async def update_all_settings(request: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Update settings from the frontend Settings page"""
    try:
        # Map frontend fields to database settings
        if 'name' in request:
            save_setting_to_db(db, 'general', 'platformName', request['name'])
        if 'description' in request:
            save_setting_to_db(db, 'general', 'platformDescription', request['description'])
        if 'timezone' in request:
            save_setting_to_db(db, 'general', 'timezone', request['timezone'])
        if 'locales' in request and len(request['locales']) > 0:
            save_setting_to_db(db, 'general', 'language', request['locales'][0])
        if 'alerts' in request:
            save_setting_to_db(db, 'notifications', 'enableEmailNotifications', request['alerts'])
        if 'digest' in request:
            save_setting_to_db(db, 'notifications', 'enableDigest', request['digest'])
        if 'branding_mode' in request:
            save_setting_to_db(db, 'branding', 'brandingMode', request['branding_mode'])

        return {
            "success": True,
            "message": "Settings updated successfully",
            "updatedAt": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")


@router.post("/settings/reset/{category}")
async def reset_category_settings(category: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Reset all settings in a category to defaults"""
    try:
        if category not in DEFAULT_SETTINGS:
            raise HTTPException(status_code=404, detail=f"Settings category '{category}' not found")

        # Delete existing settings in this category
        db.query(Setting).filter(Setting.category == category).delete()
        db.commit()

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
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to reset category settings")


@router.get("/settings/categories/list")
async def list_categories(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """List all available settings categories"""
    try:
        settings = get_settings_from_db(db)

        categories = []
        for cat_name, cat_settings in settings.items():
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


@router.post("/settings/seed")
async def seed_default_settings(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Seed the database with default settings"""
    try:
        # Check if settings already exist
        existing_count = db.query(Setting).count()
        if existing_count > 0:
            return {
                "success": True,
                "message": "Settings already exist",
                "seeded": False,
                "existing_count": existing_count
            }

        # Seed defaults
        count = 0
        for category, cat_settings in DEFAULT_SETTINGS.items():
            for key, value in cat_settings.items():
                save_setting_to_db(db, category, key, value)
                count += 1

        return {
            "success": True,
            "message": "Default settings seeded successfully",
            "seeded": True,
            "settings_created": count
        }
    except Exception as e:
        logger.error(f"Error seeding settings: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to seed settings: {str(e)}")
