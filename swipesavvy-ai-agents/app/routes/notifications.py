"""
Notification API Routes for SwipeSavvy

Endpoints for push notification management, device registration, preferences, and history.
Integrates with Firebase Cloud Messaging for cross-platform notifications.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
from app.database import get_db
from app.core.auth import verify_jwt_token
from app.core.config import settings
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])

# Initialize Firebase service - can fail gracefully
firebase_service = None
preferences_service = None

try:
    from app.services.firebase_service import FirebaseService, NotificationPreferencesService
    if settings.FIREBASE_CREDENTIALS and settings.FIREBASE_DATABASE_URL:
        firebase_service = FirebaseService(
            credentials_json=settings.FIREBASE_CREDENTIALS,
            database_url=settings.FIREBASE_DATABASE_URL
        )
        preferences_service = NotificationPreferencesService(firebase_service)
        logger.info("Firebase service initialized successfully")
except Exception as e:
    logger.warning(f"Firebase service initialization deferred: {str(e)}")


# ============================================
# Request/Response Models
# ============================================

class RegisterDeviceRequest(BaseModel):
    """Register device for push notifications"""
    device_token: str = Field(..., description="FCM device token")
    device_type: str = Field(default="ios", description="ios, android, or web")
    device_name: Optional[str] = Field(None, description="Device nickname")

    @validator('device_type')
    def validate_device_type(cls, v):
        if v not in ['ios', 'android', 'web']:
            raise ValueError('device_type must be ios, android, or web')
        return v


class NotificationPreferencesRequest(BaseModel):
    """Update notification preferences"""
    payment_notifications: Optional[bool] = True
    campaign_notifications: Optional[bool] = True
    support_notifications: Optional[bool] = True
    security_notifications: Optional[bool] = True
    feature_notifications: Optional[bool] = True


class SendEventNotificationRequest(BaseModel):
    """Send event-based notification"""
    event_type: str = Field(..., description="Event type: payment, campaign, support, security, feature")
    event_data: Optional[Dict[str, Any]] = Field(None, description="Event-specific data")

    @validator('event_type')
    def validate_event_type(cls, v):
        valid_types = ['payment', 'campaign', 'support', 'security', 'feature']
        if v not in valid_types:
            raise ValueError(f'event_type must be one of: {valid_types}')
        return v


class SendTestNotificationRequest(BaseModel):
    """Send test notification"""
    title: str = Field(..., description="Notification title")
    body: str = Field(..., description="Notification body")
    data: Optional[Dict[str, str]] = Field(None, description="Custom data")


class NotificationResponse(BaseModel):
    """Standard notification response"""
    success: bool
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    data: Optional[Dict[str, Any]] = None


# ============================================
# Device Management Endpoints
# ============================================

@router.post("/register-device", response_model=NotificationResponse)
async def register_device(
    request: RegisterDeviceRequest,
    user_id: UUID = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Register a device for push notifications.
    
    Stores device token and metadata for push notification delivery.
    Supports multiple devices per user (phone, tablet, web, etc.).
    
    **Request Body:**
    - device_token: Firebase device token (required)
    - device_type: Device type - "ios", "android", or "web" (default: "ios")
    - device_name: Optional device name for user reference
    
    **Returns:**
    - success: Registration status
    - message: Status message
    - data: Device registration details (device_id, device_type, etc.)
    """
    try:
        if not firebase_service:
            raise HTTPException(
                status_code=503,
                detail="Firebase service not configured"
            )
        
        # Register device with Firebase
        result = firebase_service.register_device(
            user_id=user_id,
            device_token=request.device_token,
            device_type=request.device_type,
            device_name=request.device_name,
            db_session=db
        )
        
        logger.info(f"Device registered for user {user_id}: {request.device_type}")
        
        return NotificationResponse(
            success=True,
            message="Device registered successfully",
            data=result
        )
    
    except Exception as e:
        logger.error(f"Device registration error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/unregister-device/{device_id}", response_model=NotificationResponse)
async def unregister_device(
    device_id: str,
    user_id: UUID = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Unregister a device from push notifications.
    
    Marks device as inactive, preventing further notifications.
    
    **Path Parameters:**
    - device_id: Device ID from registration response
    
    **Returns:**
    - success: Unregistration status
    - message: Status message
    """
    try:
        if not firebase_service:
            raise HTTPException(
                status_code=503,
                detail="Firebase service not configured"
            )
        
        result = firebase_service.unregister_device(device_id)
        
        logger.info(f"Device unregistered: {device_id}")
        
        return NotificationResponse(
            success=True,
            message="Device unregistered successfully",
            data=result
        )
    
    except Exception as e:
        logger.error(f"Device unregistration error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# Preferences Endpoints
# ============================================

@router.post("/preferences", response_model=NotificationResponse)
async def update_preferences(
    request: NotificationPreferencesRequest,
    user_id: UUID = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Update user notification preferences.
    
    Controls which types of notifications the user receives.
    
    **Request Body:**
    - payment_notifications: Receive payment alerts (default: True)
    - campaign_notifications: Receive marketing campaigns (default: True)
    - support_notifications: Receive support updates (default: True)
    - security_notifications: Receive security alerts (default: True)
    - feature_notifications: Receive new feature announcements (default: True)
    
    **Returns:**
    - success: Update status
    - message: Status message
    - data: Updated preferences
    """
    try:
        if not preferences_service:
            raise HTTPException(
                status_code=503,
                detail="Firebase service not configured"
            )
        
        prefs_dict = {
            'payment_notifications': request.payment_notifications,
            'campaign_notifications': request.campaign_notifications,
            'support_notifications': request.support_notifications,
            'security_notifications': request.security_notifications,
            'feature_notifications': request.feature_notifications
        }
        
        result = preferences_service.set_preferences(user_id, prefs_dict)
        
        logger.info(f"Preferences updated for user {user_id}")
        
        return NotificationResponse(
            success=True,
            message="Preferences updated successfully",
            data=result
        )
    
    except Exception as e:
        logger.error(f"Preference update error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/preferences", response_model=NotificationResponse)
async def get_preferences(
    user_id: UUID = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Get current notification preferences.
    
    Returns user's notification preference settings.
    Defaults: All notification types enabled.
    
    **Returns:**
    - success: Request status
    - message: Status message
    - data: User preferences dictionary
    """
    try:
        if not preferences_service:
            raise HTTPException(
                status_code=503,
                detail="Firebase service not configured"
            )
        
        prefs = preferences_service.get_preferences(user_id)
        
        return NotificationResponse(
            success=True,
            message="Preferences retrieved successfully",
            data={
                'user_id': str(user_id),
                'preferences': prefs
            }
        )
    
    except Exception as e:
        logger.error(f"Preference retrieval error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# Notification History Endpoints
# ============================================

@router.get("/history", response_model=NotificationResponse)
async def get_notification_history(
    user_id: UUID = Depends(verify_jwt_token),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    notification_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get user's notification history.
    
    Retrieves paginated list of sent/received notifications.
    
    **Query Parameters:**
    - limit: Results per page (default: 50, max: 100)
    - offset: Pagination offset (default: 0)
    - notification_type: Filter by type (payment, campaign, support, security, feature)
    
    **Returns:**
    - success: Request status
    - data: Paginated notification list with total count
    """
    try:
        valid_types = ['payment', 'campaign', 'support', 'security', 'feature']
        if notification_type and notification_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid notification_type. Must be one of: {valid_types}"
            )
        
        # TODO: Query from NotificationHistory model once database is synced
        # For now return mock data structure
        notifications = []
        
        logger.info(f"Notification history retrieved for user {user_id}: {len(notifications)} records")
        
        return NotificationResponse(
            success=True,
            message="Notification history retrieved successfully",
            data={
                'user_id': str(user_id),
                'total': len(notifications),
                'limit': limit,
                'offset': offset,
                'notifications': notifications
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Notification history error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# Testing Endpoints
# ============================================

@router.post("/test", response_model=NotificationResponse)
async def send_test_notification(
    request: SendTestNotificationRequest,
    user_id: UUID = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Send a test notification to verify device registration.
    
    Sends test notification to all registered devices for the user.
    Useful for verifying notification delivery is working.
    
    **Request Body:**
    - title: Notification title
    - body: Notification body/message
    - data: Optional custom data dictionary
    
    **Returns:**
    - success: Send status
    - message: Status message with details
    - data: Send result with message count
    """
    try:
        if not firebase_service:
            raise HTTPException(
                status_code=503,
                detail="Firebase service not configured"
            )
        
        result = firebase_service.send_notification(
            user_id=user_id,
            title=request.title,
            body=request.body,
            data=request.data
        )
        
        message = f"Test notification sent to {result.get('message_count', 0)} device(s)"
        if result.get('failed_count', 0) > 0:
            message += f" ({result.get('failed_count')} failed)"
        
        logger.info(f"Test notification sent for user {user_id}: {message}")
        
        return NotificationResponse(
            success=result.get('success', True),
            message=message,
            data=result
        )
    
    except Exception as e:
        logger.error(f"Test notification error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# Notification Interaction Endpoints
# ============================================

@router.post("/mark-as-read/{notification_id}", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: str,
    user_id: UUID = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Mark a notification as read.
    
    Updates notification status and records read timestamp.
    
    **Path Parameters:**
    - notification_id: Notification ID to mark as read
    
    **Returns:**
    - success: Update status
    - message: Status message
    """
    try:
        # TODO: Update NotificationHistory model with is_read = True, read_at = now()
        # For now return mock response
        
        logger.info(f"Notification marked as read: {notification_id}")
        
        return NotificationResponse(
            success=True,
            message="Notification marked as read",
            data={
                'notification_id': notification_id,
                'read_at': datetime.utcnow().isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Mark as read error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/send-event", response_model=NotificationResponse)
async def send_event_notification(
    request: SendEventNotificationRequest,
    user_id: UUID = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Send event-based notification to user.
    
    Sends a notification triggered by a specific event type.
    
    **Request Body:**
    - event_type: Type of event (required)
      - "payment": Payment/transaction notifications
      - "campaign": Marketing campaign notifications  
      - "support": Support ticket updates
      - "security": Security alerts
      - "feature": New feature announcements
    - event_data: Optional event-specific data
    
    **Returns:**
    - success: Send status
    - message: Status message
    - data: Delivery information
    """
    try:
        if not firebase_service:
            raise HTTPException(
                status_code=503,
                detail="Firebase service not configured"
            )
        
        result = firebase_service.send_event_notification(
            user_id=user_id,
            event_type=request.event_type,
            event_data=request.event_data or {}
        )
        
        logger.info(f"Event notification sent for user {user_id}: {request.event_type}")
        
        return NotificationResponse(
            success=result.get('success', True),
            message=f"Event notification sent: {request.event_type}",
            data=result
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Event notification error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

