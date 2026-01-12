"""
AWS Push Notifications & In-App Notifications API Routes

Provides endpoints for:
- Device registration for AWS SNS push notifications
- Push notification delivery (iOS/Android)
- In-app notification management
- Notification preferences
- Notification history

This module integrates with AWS SNS for push notifications
and provides in-app notification functionality.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
from datetime import datetime
import logging

from app.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/push-notifications", tags=["push-notifications"])

# Initialize services
aws_push_service = None
in_app_service = None

try:
    from app.services.aws_push_notification_service import (
        aws_push_service as push_service,
        Platform,
        NotificationType
    )
    aws_push_service = push_service
    logger.info("AWS Push Notification service initialized")
except Exception as e:
    logger.warning(f"AWS Push service initialization deferred: {e}")

try:
    from app.services.in_app_notification_service import (
        in_app_notification_service,
        NotificationCategory,
        NotificationPriority
    )
    in_app_service = in_app_notification_service
    logger.info("In-App Notification service initialized")
except Exception as e:
    logger.warning(f"In-App Notification service initialization deferred: {e}")


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class RegisterDeviceRequest(BaseModel):
    """Register a device for push notifications"""
    device_token: str = Field(..., description="Platform-specific device token (APNS or FCM)")
    platform: str = Field(..., description="Platform: ios, ios_sandbox, or android")
    device_name: Optional[str] = Field(None, description="Optional device name")
    app_version: Optional[str] = Field(None, description="App version")

    @validator('platform')
    def validate_platform(cls, v):
        valid = ['ios', 'ios_sandbox', 'android']
        if v.lower() not in valid:
            raise ValueError(f'platform must be one of: {valid}')
        return v.lower()


class UnregisterDeviceRequest(BaseModel):
    """Unregister a device from push notifications"""
    endpoint_arn: str = Field(..., description="AWS SNS endpoint ARN from registration")


class SendPushRequest(BaseModel):
    """Send a push notification"""
    endpoint_arn: str = Field(..., description="Target device endpoint ARN")
    title: str = Field(..., description="Notification title")
    body: str = Field(..., description="Notification body")
    notification_type: str = Field(default="system", description="Type: transaction, cashback, security, marketing, system, chat")
    data: Optional[Dict[str, Any]] = Field(None, description="Custom data payload")
    badge: Optional[int] = Field(None, description="iOS badge count")


class SendBroadcastRequest(BaseModel):
    """Send push notification to multiple devices"""
    endpoint_arns: List[str] = Field(..., description="List of target endpoint ARNs")
    title: str = Field(..., description="Notification title")
    body: str = Field(..., description="Notification body")
    notification_type: str = Field(default="marketing", description="Notification type")
    data: Optional[Dict[str, Any]] = Field(None, description="Custom data payload")


class InAppNotificationRequest(BaseModel):
    """Create an in-app notification"""
    title: str = Field(..., description="Notification title")
    body: str = Field(..., description="Notification body")
    category: str = Field(default="system", description="Category: transaction, cashback, security, account, marketing, system, social, support")
    priority: str = Field(default="normal", description="Priority: low, normal, high, urgent")
    icon: Optional[str] = Field(None, description="Icon name")
    image_url: Optional[str] = Field(None, description="Image URL for rich notifications")
    action_url: Optional[str] = Field(None, description="Deep link or URL on tap")
    data: Optional[Dict[str, Any]] = Field(None, description="Custom data")
    expires_in_hours: Optional[int] = Field(None, description="Hours until expiration")


class NotificationResponse(BaseModel):
    """Standard notification API response"""
    success: bool
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    data: Optional[Dict[str, Any]] = None


# ============================================================================
# DEVICE REGISTRATION ENDPOINTS
# ============================================================================

@router.post("/register-device", response_model=NotificationResponse)
async def register_device(
    request: RegisterDeviceRequest,
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Register a device for AWS SNS push notifications.

    Registers the device token with AWS SNS and returns an endpoint ARN
    that should be stored for sending push notifications.

    **Request Body:**
    - device_token: Platform-specific token (APNS for iOS, FCM for Android)
    - platform: "ios", "ios_sandbox", or "android"
    - device_name: Optional device identifier
    - app_version: Optional app version

    **Returns:**
    - endpoint_arn: AWS SNS endpoint ARN (store this for sending notifications)
    - platform: Registered platform
    - status: Registration status
    """
    if not aws_push_service:
        raise HTTPException(status_code=503, detail="Push notification service not available")

    try:
        from app.services.aws_push_notification_service import Platform

        platform_enum = Platform(request.platform)
        result = await aws_push_service.register_device(
            device_token=request.device_token,
            platform=platform_enum,
            user_id=user_id,
            custom_data={
                "device_name": request.device_name,
                "app_version": request.app_version
            } if request.device_name or request.app_version else None
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Registration failed"))

        logger.info(f"Device registered for user {user_id}: {request.platform}")

        return NotificationResponse(
            success=True,
            message="Device registered successfully",
            data={
                "endpoint_arn": result.get("endpoint_arn"),
                "platform": result.get("platform"),
                "status": result.get("status")
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Device registration error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/unregister-device", response_model=NotificationResponse)
async def unregister_device(
    request: UnregisterDeviceRequest,
    db: Session = Depends(get_db)
):
    """
    Unregister a device from push notifications.

    Removes the device endpoint from AWS SNS.

    **Request Body:**
    - endpoint_arn: The endpoint ARN from device registration
    """
    if not aws_push_service:
        raise HTTPException(status_code=503, detail="Push notification service not available")

    try:
        result = await aws_push_service.unregister_device(request.endpoint_arn)

        return NotificationResponse(
            success=result.get("success", True),
            message="Device unregistered successfully",
            data=result
        )

    except Exception as e:
        logger.error(f"Device unregistration error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# PUSH NOTIFICATION ENDPOINTS
# ============================================================================

@router.post("/send", response_model=NotificationResponse)
async def send_push_notification(
    request: SendPushRequest,
    db: Session = Depends(get_db)
):
    """
    Send a push notification to a specific device.

    **Request Body:**
    - endpoint_arn: Target device endpoint ARN
    - title: Notification title
    - body: Notification body
    - notification_type: Type for categorization
    - data: Optional custom payload
    - badge: Optional iOS badge count
    """
    if not aws_push_service:
        raise HTTPException(status_code=503, detail="Push notification service not available")

    try:
        from app.services.aws_push_notification_service import NotificationType

        notification_type = NotificationType(request.notification_type.lower())
        result = await aws_push_service.send_push_notification(
            endpoint_arn=request.endpoint_arn,
            title=request.title,
            body=request.body,
            notification_type=notification_type,
            data=request.data,
            badge=request.badge
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Send failed"))

        return NotificationResponse(
            success=True,
            message="Push notification sent",
            data={
                "message_id": result.get("message_id"),
                "status": result.get("status")
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Push notification error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/send-broadcast", response_model=NotificationResponse)
async def send_broadcast_notification(
    request: SendBroadcastRequest,
    db: Session = Depends(get_db)
):
    """
    Send push notification to multiple devices.

    **Request Body:**
    - endpoint_arns: List of target device endpoint ARNs
    - title: Notification title
    - body: Notification body
    - notification_type: Type for categorization
    - data: Optional custom payload
    """
    if not aws_push_service:
        raise HTTPException(status_code=503, detail="Push notification service not available")

    try:
        from app.services.aws_push_notification_service import NotificationType

        notification_type = NotificationType(request.notification_type.lower())
        result = await aws_push_service.send_to_multiple_devices(
            endpoint_arns=request.endpoint_arns,
            title=request.title,
            body=request.body,
            notification_type=notification_type,
            data=request.data
        )

        return NotificationResponse(
            success=True,
            message=f"Broadcast sent: {result['success']} succeeded, {result['failed']} failed",
            data=result
        )

    except Exception as e:
        logger.error(f"Broadcast notification error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# IN-APP NOTIFICATION ENDPOINTS
# ============================================================================

@router.post("/in-app", response_model=NotificationResponse)
async def create_in_app_notification(
    request: InAppNotificationRequest,
    user_id: str = Query(..., description="Target user ID"),
    db: Session = Depends(get_db)
):
    """
    Create an in-app notification for a user.

    In-app notifications appear in the notification center within the app.
    They can include rich content, deep links, and custom actions.

    **Request Body:**
    - title: Notification title
    - body: Notification body
    - category: Notification category
    - priority: Priority level
    - icon: Optional icon name
    - image_url: Optional image for rich notifications
    - action_url: Deep link on tap
    - data: Custom data payload
    - expires_in_hours: Optional expiration time
    """
    if not in_app_service:
        raise HTTPException(status_code=503, detail="In-app notification service not available")

    try:
        from app.services.in_app_notification_service import (
            NotificationCategory,
            NotificationPriority
        )

        category = NotificationCategory(request.category.lower())
        priority = NotificationPriority(request.priority.lower())

        notification = await in_app_service.create_notification(
            user_id=user_id,
            title=request.title,
            body=request.body,
            category=category,
            priority=priority,
            icon=request.icon,
            image_url=request.image_url,
            action_url=request.action_url,
            data=request.data,
            expires_in_hours=request.expires_in_hours,
            db=db
        )

        return NotificationResponse(
            success=True,
            message="In-app notification created",
            data=notification.to_dict()
        )

    except Exception as e:
        logger.error(f"In-app notification error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/in-app", response_model=NotificationResponse)
async def get_in_app_notifications(
    user_id: str = Query(..., description="User ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    unread_only: bool = Query(False, description="Only return unread notifications"),
    limit: int = Query(50, ge=1, le=100, description="Max results"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db)
):
    """
    Get in-app notifications for a user.

    Returns paginated list of notifications with filtering options.

    **Query Parameters:**
    - user_id: Target user ID
    - category: Optional category filter
    - unread_only: Only return unread notifications
    - limit: Maximum number of results (default: 50)
    - offset: Pagination offset
    """
    if not in_app_service:
        raise HTTPException(status_code=503, detail="In-app notification service not available")

    try:
        category_enum = None
        if category:
            from app.services.in_app_notification_service import NotificationCategory
            category_enum = NotificationCategory(category.lower())

        notifications = await in_app_service.get_notifications(
            user_id=user_id,
            category=category_enum,
            unread_only=unread_only,
            limit=limit,
            offset=offset,
            db=db
        )

        unread_count = await in_app_service.get_unread_count(user_id, db=db)

        return NotificationResponse(
            success=True,
            message="Notifications retrieved",
            data={
                "notifications": notifications,
                "total_count": len(notifications),
                "unread_count": unread_count,
                "limit": limit,
                "offset": offset
            }
        )

    except Exception as e:
        logger.error(f"Get notifications error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/in-app/unread-count", response_model=NotificationResponse)
async def get_unread_count(
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Get unread notification count for a user.

    Returns the number of unread in-app notifications.
    """
    if not in_app_service:
        raise HTTPException(status_code=503, detail="In-app notification service not available")

    try:
        count = await in_app_service.get_unread_count(user_id, db=db)

        return NotificationResponse(
            success=True,
            message="Unread count retrieved",
            data={"unread_count": count}
        )

    except Exception as e:
        logger.error(f"Get unread count error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/in-app/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Mark a notification as read."""
    if not in_app_service:
        raise HTTPException(status_code=503, detail="In-app notification service not available")

    try:
        success = await in_app_service.mark_as_read(notification_id, user_id, db=db)

        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")

        return NotificationResponse(
            success=True,
            message="Notification marked as read",
            data={"notification_id": notification_id}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mark as read error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/in-app/read-all", response_model=NotificationResponse)
async def mark_all_read(
    user_id: str = Query(..., description="User ID"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for a user."""
    if not in_app_service:
        raise HTTPException(status_code=503, detail="In-app notification service not available")

    try:
        category_enum = None
        if category:
            from app.services.in_app_notification_service import NotificationCategory
            category_enum = NotificationCategory(category.lower())

        count = await in_app_service.mark_all_as_read(user_id, category=category_enum, db=db)

        return NotificationResponse(
            success=True,
            message=f"Marked {count} notifications as read",
            data={"count": count}
        )

    except Exception as e:
        logger.error(f"Mark all read error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/in-app/{notification_id}", response_model=NotificationResponse)
async def delete_notification(
    notification_id: str,
    user_id: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Delete a notification."""
    if not in_app_service:
        raise HTTPException(status_code=503, detail="In-app notification service not available")

    try:
        success = await in_app_service.delete_notification(notification_id, user_id, db=db)

        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")

        return NotificationResponse(
            success=True,
            message="Notification deleted",
            data={"notification_id": notification_id}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete notification error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/in-app", response_model=NotificationResponse)
async def clear_all_notifications(
    user_id: str = Query(..., description="User ID"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    db: Session = Depends(get_db)
):
    """Clear all notifications for a user."""
    if not in_app_service:
        raise HTTPException(status_code=503, detail="In-app notification service not available")

    try:
        category_enum = None
        if category:
            from app.services.in_app_notification_service import NotificationCategory
            category_enum = NotificationCategory(category.lower())

        count = await in_app_service.clear_all_notifications(user_id, category=category_enum, db=db)

        return NotificationResponse(
            success=True,
            message=f"Cleared {count} notifications",
            data={"count": count}
        )

    except Exception as e:
        logger.error(f"Clear notifications error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
