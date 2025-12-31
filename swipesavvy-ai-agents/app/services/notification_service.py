"""
Notification Service
Handles email, SMS, and push notifications for the platform
"""

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum
import secrets
from abc import ABC, abstractmethod

# ==================== Models ====================

class NotificationChannel(str, Enum):
    """Notification channels"""
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"

class NotificationStatus(str, Enum):
    """Notification delivery status"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"

class NotificationType(str, Enum):
    """Types of notifications"""
    TRANSACTION_ALERT = "transaction_alert"
    REWARD_EARNED = "reward_earned"
    CHALLENGE_REMINDER = "challenge_reminder"
    INVESTMENT_UPDATE = "investment_update"
    SECURITY_ALERT = "security_alert"
    PROMOTIONAL = "promotional"
    SYSTEM_UPDATE = "system_update"

class Notification(BaseModel):
    """Notification model"""
    id: str
    user_id: str
    type: NotificationType
    channel: NotificationChannel
    title: str
    content: str
    status: NotificationStatus
    created_at: datetime
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    recipient: str
    metadata: dict = {}

class CreateNotificationRequest(BaseModel):
    """Create notification request"""
    type: NotificationType
    channel: NotificationChannel
    title: str
    content: str
    recipient: str
    metadata: dict = {}

class NotificationPreferences(BaseModel):
    """User notification preferences"""
    user_id: str
    email_enabled: bool = True
    sms_enabled: bool = True
    push_enabled: bool = True
    marketing_emails: bool = False
    digest_frequency: str = "daily"  # daily, weekly, none
    updated_at: datetime

class CreatePreferencesRequest(BaseModel):
    """Update notification preferences request"""
    email_enabled: bool = True
    sms_enabled: bool = True
    push_enabled: bool = True
    marketing_emails: bool = False
    digest_frequency: str = "daily"

class SendEmailRequest(BaseModel):
    """Send email request"""
    to_email: EmailStr
    subject: str
    body: str
    html_body: Optional[str] = None

class SendSMSRequest(BaseModel):
    """Send SMS request"""
    phone_number: str
    message: str

class SendPushRequest(BaseModel):
    """Send push notification request"""
    user_id: str
    title: str
    body: str
    data: dict = {}

# ==================== Database (Mock) ====================

NOTIFICATIONS_DB = {}  # notification_id -> notification
PREFERENCES_DB = {}  # user_id -> preferences

class NotificationModel:
    """Notification database model"""
    def __init__(self, user_id: str, notification_type: NotificationType,
                 channel: NotificationChannel, title: str, content: str,
                 recipient: str, metadata: dict = None):
        self.id = secrets.token_urlsafe(16)
        self.user_id = user_id
        self.type = notification_type
        self.channel = channel
        self.title = title
        self.content = content
        self.status = NotificationStatus.PENDING
        self.created_at = datetime.utcnow()
        self.sent_at = None
        self.read_at = None
        self.recipient = recipient
        self.metadata = metadata or {}

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "channel": self.channel,
            "title": self.title,
            "content": self.content,
            "status": self.status,
            "created_at": self.created_at,
            "sent_at": self.sent_at,
            "read_at": self.read_at,
            "recipient": self.recipient,
            "metadata": self.metadata,
        }

class PreferencesModel:
    """Notification preferences database model"""
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.email_enabled = True
        self.sms_enabled = True
        self.push_enabled = True
        self.marketing_emails = False
        self.digest_frequency = "daily"
        self.updated_at = datetime.utcnow()

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "email_enabled": self.email_enabled,
            "sms_enabled": self.sms_enabled,
            "push_enabled": self.push_enabled,
            "marketing_emails": self.marketing_emails,
            "digest_frequency": self.digest_frequency,
            "updated_at": self.updated_at,
        }

# ==================== Notification Provider (Mock) ====================

class NotificationProvider(ABC):
    """Abstract base class for notification providers"""

    @abstractmethod
    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> bool:
        """Send notification"""
        pass

class EmailProvider(NotificationProvider):
    """Mock email provider"""
    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> bool:
        """Send email (mock)"""
        print(f"📧 Sending email to {recipient}")
        print(f"Subject: {subject}")
        print(f"Message: {message}")
        return True

class SMSProvider(NotificationProvider):
    """Mock SMS provider"""
    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> bool:
        """Send SMS (mock)"""
        print(f"📱 Sending SMS to {recipient}")
        print(f"Message: {message}")
        return True

class PushProvider(NotificationProvider):
    """Mock push notification provider"""
    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> bool:
        """Send push notification (mock)"""
        print(f"🔔 Sending push to {recipient}")
        print(f"Title: {subject}")
        print(f"Message: {message}")
        return True

# ==================== Notification Service ====================

class NotificationService:
    """Notification management service"""

    def __init__(self):
        self.email_provider = EmailProvider()
        self.sms_provider = SMSProvider()
        self.push_provider = PushProvider()

    async def send_notification(self, user_id: str, notification_type: NotificationType,
                               channel: NotificationChannel, title: str, content: str,
                               recipient: str, metadata: dict = None) -> NotificationModel:
        """Send notification"""
        notification = NotificationModel(
            user_id, notification_type, channel, title, content, recipient, metadata
        )

        # Get user preferences
        preferences = PREFERENCES_DB.get(user_id)
        if not preferences:
            # Create default preferences if not exists
            preferences = PreferencesModel(user_id)
            PREFERENCES_DB[user_id] = preferences

        # Check if user wants this type of notification
        if channel == NotificationChannel.EMAIL and not preferences.email_enabled:
            notification.status = NotificationStatus.FAILED
            NOTIFICATIONS_DB[notification.id] = notification
            return notification

        if channel == NotificationChannel.SMS and not preferences.sms_enabled:
            notification.status = NotificationStatus.FAILED
            NOTIFICATIONS_DB[notification.id] = notification
            return notification

        if channel == NotificationChannel.PUSH and not preferences.push_enabled:
            notification.status = NotificationStatus.FAILED
            NOTIFICATIONS_DB[notification.id] = notification
            return notification

        # Send via appropriate provider
        try:
            if channel == NotificationChannel.EMAIL:
                await self.email_provider.send(recipient, title, content)
            elif channel == NotificationChannel.SMS:
                await self.sms_provider.send(recipient, title, content)
            elif channel == NotificationChannel.PUSH:
                await self.push_provider.send(recipient, title, content)
            elif channel == NotificationChannel.IN_APP:
                pass  # In-app notifications don't need external provider

            notification.status = NotificationStatus.DELIVERED
            notification.sent_at = datetime.utcnow()
        except Exception as e:
            notification.status = NotificationStatus.FAILED
            print(f"Failed to send notification: {str(e)}")

        NOTIFICATIONS_DB[notification.id] = notification
        return notification

    @staticmethod
    def get_notifications(user_id: str, limit: int = 50, offset: int = 0) -> List[NotificationModel]:
        """Get notifications for user"""
        user_notifications = [
            n for n in NOTIFICATIONS_DB.values() if n.user_id == user_id
        ]
        user_notifications.sort(key=lambda x: x.created_at, reverse=True)
        return user_notifications[offset:offset + limit]

    @staticmethod
    def mark_as_read(notification_id: str, user_id: str) -> Optional[NotificationModel]:
        """Mark notification as read"""
        notification = NOTIFICATIONS_DB.get(notification_id)
        if not notification or notification.user_id != user_id:
            return None

        notification.read_at = datetime.utcnow()
        return notification

    @staticmethod
    def mark_all_as_read(user_id: str) -> int:
        """Mark all notifications as read"""
        count = 0
        for notification in NOTIFICATIONS_DB.values():
            if notification.user_id == user_id and not notification.read_at:
                notification.read_at = datetime.utcnow()
                count += 1
        return count

    @staticmethod
    def delete_notification(notification_id: str, user_id: str) -> bool:
        """Delete notification"""
        notification = NOTIFICATIONS_DB.get(notification_id)
        if notification and notification.user_id == user_id:
            del NOTIFICATIONS_DB[notification_id]
            return True
        return False

    @staticmethod
    def get_preferences(user_id: str) -> PreferencesModel:
        """Get notification preferences"""
        if user_id not in PREFERENCES_DB:
            PREFERENCES_DB[user_id] = PreferencesModel(user_id)
        return PREFERENCES_DB[user_id]

    @staticmethod
    def update_preferences(user_id: str, preferences: CreatePreferencesRequest) -> PreferencesModel:
        """Update notification preferences"""
        prefs = NotificationService.get_preferences(user_id)
        prefs.email_enabled = preferences.email_enabled
        prefs.sms_enabled = preferences.sms_enabled
        prefs.push_enabled = preferences.push_enabled
        prefs.marketing_emails = preferences.marketing_emails
        prefs.digest_frequency = preferences.digest_frequency
        prefs.updated_at = datetime.utcnow()
        PREFERENCES_DB[user_id] = prefs
        return prefs

# ==================== API Routes ====================

notification_service = NotificationService()

def create_notification_routes(app: FastAPI, get_current_user=None):
    """Create notification API routes"""

    @app.post("/api/notifications/send", response_model=Notification, tags=["Notifications"])
    async def send_notification(request: CreateNotificationRequest, current_user = Depends(get_current_user)):
        """Send notification"""
        notification = await notification_service.send_notification(
            current_user.id, request.type, request.channel, request.title,
            request.content, request.recipient, request.metadata
        )
        return notification.to_dict()

    @app.get("/api/notifications", response_model=List[Notification], tags=["Notifications"])
    async def get_notifications(limit: int = 50, offset: int = 0,
                               current_user = Depends(get_current_user)):
        """Get user notifications"""
        notifications = NotificationService.get_notifications(current_user.id, limit, offset)
        return [n.to_dict() for n in notifications]

    @app.post("/api/notifications/{notification_id}/read", tags=["Notifications"])
    async def mark_as_read(notification_id: str, current_user = Depends(get_current_user)):
        """Mark notification as read"""
        notification = NotificationService.mark_as_read(notification_id, current_user.id)
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Marked as read"}

    @app.post("/api/notifications/read-all", tags=["Notifications"])
    async def mark_all_as_read(current_user = Depends(get_current_user)):
        """Mark all notifications as read"""
        count = NotificationService.mark_all_as_read(current_user.id)
        return {"message": f"Marked {count} notifications as read"}

    @app.delete("/api/notifications/{notification_id}", tags=["Notifications"])
    async def delete_notification(notification_id: str, current_user = Depends(get_current_user)):
        """Delete notification"""
        if not NotificationService.delete_notification(notification_id, current_user.id):
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"message": "Notification deleted"}

    @app.get("/api/notifications/preferences", response_model=NotificationPreferences, tags=["Notifications"])
    async def get_preferences(current_user = Depends(get_current_user)):
        """Get notification preferences"""
        prefs = NotificationService.get_preferences(current_user.id)
        return prefs.to_dict()

    @app.patch("/api/notifications/preferences", response_model=NotificationPreferences, tags=["Notifications"])
    async def update_preferences(request: CreatePreferencesRequest, current_user = Depends(get_current_user)):
        """Update notification preferences"""
        prefs = NotificationService.update_preferences(current_user.id, request)
        return prefs.to_dict()

    return app
