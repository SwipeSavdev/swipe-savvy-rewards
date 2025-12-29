"""
Enhanced Notification Service with Real Provider Integration
Handles SMS (Twilio), Email (SendGrid), Push (Firebase), and In-App notifications
"""

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from enum import Enum
import secrets
from abc import ABC, abstractmethod
import os
from dotenv import load_dotenv
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# ==================== Third-party Imports ====================
# These need to be installed:
# pip install twilio sendgrid firebase-admin

try:
    from twilio.rest import Client as TwilioClient
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    logger.warning("⚠️  Twilio not installed. Run: pip install twilio")

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False
    logger.warning("⚠️  SendGrid not installed. Run: pip install sendgrid")

try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logger.warning("⚠️  Firebase Admin SDK not installed. Run: pip install firebase-admin")

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
    MARKETING_CAMPAIGN = "marketing_campaign"

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
    in_app_enabled: bool = True
    marketing_emails: bool = False
    marketing_sms: bool = False
    digest_frequency: str = "daily"
    updated_at: datetime = None

class CreatePreferencesRequest(BaseModel):
    """Update notification preferences request"""
    email_enabled: bool = True
    sms_enabled: bool = True
    push_enabled: bool = True
    in_app_enabled: bool = True
    marketing_emails: bool = False
    marketing_sms: bool = False
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
    device_token: str
    title: str
    body: str
    data: dict = {}

# ==================== Database (Mock) ====================

NOTIFICATIONS_DB = {}  # notification_id -> notification
PREFERENCES_DB = {}  # user_id -> preferences
DEVICE_TOKENS_DB = {}  # user_id -> [device_tokens]

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
            "type": self.type.value,
            "channel": self.channel.value,
            "title": self.title,
            "content": self.content,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None,
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
        self.in_app_enabled = True
        self.marketing_emails = False
        self.marketing_sms = False
        self.digest_frequency = "daily"
        self.updated_at = datetime.utcnow()

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "email_enabled": self.email_enabled,
            "sms_enabled": self.sms_enabled,
            "push_enabled": self.push_enabled,
            "in_app_enabled": self.in_app_enabled,
            "marketing_emails": self.marketing_emails,
            "marketing_sms": self.marketing_sms,
            "digest_frequency": self.digest_frequency,
            "updated_at": self.updated_at.isoformat(),
        }

# ==================== Notification Provider (Real Implementation) ====================

class NotificationProvider(ABC):
    """Abstract base class for notification providers"""

    @abstractmethod
    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> dict:
        """
        Send notification
        Returns: {
            "success": bool,
            "message_id": str,
            "error": str (if failed)
        }
        """
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Check if provider is properly configured"""
        pass


class EmailProvider(NotificationProvider):
    """SendGrid email provider"""
    
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "noreply@swipesavvy.com")
        self.client = None
        
        if self.api_key and SENDGRID_AVAILABLE:
            try:
                self.client = SendGridAPIClient(self.api_key)
                logger.info("✅ SendGrid initialized")
            except Exception as e:
                logger.error(f"⚠️  Failed to initialize SendGrid: {e}")

    def is_configured(self) -> bool:
        """Check if SendGrid is configured"""
        return SENDGRID_AVAILABLE and self.client is not None

    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> dict:
        """Send email via SendGrid"""
        
        if not self.is_configured():
            # Fallback to mock
            logger.info(f"📧 [MOCK] Sending email to {recipient}")
            logger.info(f"   Subject: {subject}")
            return {
                "success": True,
                "message_id": secrets.token_urlsafe(16),
                "provider": "mock"
            }
        
        try:
            html_body = kwargs.get("html_body", message)
            
            mail = Mail(
                from_email=Email(self.from_email),
                to_emails=To(recipient),
                subject=subject,
                plain_text_content=Content("text/plain", message),
                html_content=Content("text/html", html_body)
            )
            
            response = self.client.send(mail)
            
            logger.info(f"✅ Email sent to {recipient} (Status: {response.status_code})")
            
            return {
                "success": response.status_code in [200, 202],
                "message_id": response.headers.get("X-Message-Id", secrets.token_urlsafe(16)),
                "provider": "sendgrid",
                "status_code": response.status_code
            }
        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            return {
                "success": False,
                "message_id": None,
                "error": str(e),
                "provider": "sendgrid"
            }


class SMSProvider(NotificationProvider):
    """Twilio SMS provider"""
    
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER")
        self.client = None
        
        if self.account_sid and self.auth_token and TWILIO_AVAILABLE:
            try:
                self.client = TwilioClient(self.account_sid, self.auth_token)
                logger.info("✅ Twilio initialized")
            except Exception as e:
                logger.error(f"⚠️  Failed to initialize Twilio: {e}")

    def is_configured(self) -> bool:
        """Check if Twilio is configured"""
        return TWILIO_AVAILABLE and self.client is not None

    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> dict:
        """Send SMS via Twilio"""
        
        if not self.is_configured():
            # Fallback to mock
            logger.info(f"💬 [MOCK] Sending SMS to {recipient}")
            logger.info(f"   Message: {message[:50]}...")
            return {
                "success": True,
                "message_id": secrets.token_urlsafe(16),
                "provider": "mock"
            }
        
        try:
            # Use message, ignore subject for SMS
            sms_message = message if len(message) <= 160 else message[:157] + "..."
            
            response = self.client.messages.create(
                body=sms_message,
                from_=self.from_number,
                to=recipient
            )
            
            logger.info(f"✅ SMS sent to {recipient} (SID: {response.sid})")
            
            return {
                "success": response.status in ["queued", "sent"],
                "message_id": response.sid,
                "provider": "twilio",
                "status": response.status
            }
        except Exception as e:
            logger.error(f"❌ Failed to send SMS: {e}")
            return {
                "success": False,
                "message_id": None,
                "error": str(e),
                "provider": "twilio"
            }


class PushProvider(NotificationProvider):
    """Firebase Cloud Messaging push provider"""
    
    def __init__(self):
        self.app = None
        creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        
        if creds_path and FIREBASE_AVAILABLE:
            try:
                # Initialize Firebase app
                if not firebase_admin._apps:
                    cred = credentials.Certificate(creds_path)
                    self.app = firebase_admin.initialize_app(cred)
                else:
                    self.app = firebase_admin.get_app()
                logger.info("✅ Firebase initialized")
            except Exception as e:
                logger.error(f"⚠️  Failed to initialize Firebase: {e}")

    def is_configured(self) -> bool:
        """Check if Firebase is configured"""
        return FIREBASE_AVAILABLE and self.app is not None

    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> dict:
        """Send push notification via Firebase"""
        
        if not self.is_configured():
            # Fallback to mock
            logger.info(f"🔔 [MOCK] Sending push to {recipient}")
            logger.info(f"   Title: {subject}")
            logger.info(f"   Message: {message[:50]}...")
            return {
                "success": True,
                "message_id": secrets.token_urlsafe(16),
                "provider": "mock"
            }
        
        try:
            device_token = recipient  # recipient is device token for push
            data = kwargs.get("data", {})
            
            message_obj = messaging.Message(
                notification=messaging.Notification(
                    title=subject,
                    body=message
                ),
                data=data,
                token=device_token
            )
            
            response = messaging.send(message_obj)
            
            logger.info(f"✅ Push sent to device {device_token[:20]}... (MID: {response})")
            
            return {
                "success": True,
                "message_id": response,
                "provider": "firebase"
            }
        except Exception as e:
            logger.error(f"❌ Failed to send push: {e}")
            return {
                "success": False,
                "message_id": None,
                "error": str(e),
                "provider": "firebase"
            }


class InAppProvider(NotificationProvider):
    """In-app notification provider (database storage)"""
    
    def is_configured(self) -> bool:
        """In-app provider is always available"""
        return True

    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> dict:
        """Store in-app notification in database"""
        
        try:
            notification_id = secrets.token_urlsafe(16)
            
            # Store in database (would be in real DB in production)
            in_app_notification = {
                "id": notification_id,
                "title": subject,
                "message": message,
                "user_id": kwargs.get("user_id"),
                "created_at": datetime.utcnow().isoformat(),
                "read": False
            }
            
            # In production, save to database
            logger.info(f"📱 In-app notification stored (ID: {notification_id})")
            
            return {
                "success": True,
                "message_id": notification_id,
                "provider": "in_app"
            }
        except Exception as e:
            logger.error(f"❌ Failed to store in-app notification: {e}")
            return {
                "success": False,
                "message_id": None,
                "error": str(e),
                "provider": "in_app"
            }


# ==================== Notification Service ====================

class NotificationService:
    """Notification management service"""

    def __init__(self):
        self.email_provider = EmailProvider()
        self.sms_provider = SMSProvider()
        self.push_provider = PushProvider()
        self.in_app_provider = InAppProvider()
        logger.info("🚀 NotificationService initialized")

    async def send_notification(self, user_id: str, notification_type: NotificationType,
                               channel: NotificationChannel, title: str, content: str,
                               recipient: str, metadata: dict = None) -> NotificationModel:
        """Send notification through specified channel"""
        
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
            logger.info(f"⏭️  Skipped email notification (user disabled)")
            return notification

        if channel == NotificationChannel.SMS and not preferences.sms_enabled:
            notification.status = NotificationStatus.FAILED
            NOTIFICATIONS_DB[notification.id] = notification
            logger.info(f"⏭️  Skipped SMS notification (user disabled)")
            return notification

        if channel == NotificationChannel.PUSH and not preferences.push_enabled:
            notification.status = NotificationStatus.FAILED
            NOTIFICATIONS_DB[notification.id] = notification
            logger.info(f"⏭️  Skipped push notification (user disabled)")
            return notification

        if channel == NotificationChannel.IN_APP and not preferences.in_app_enabled:
            notification.status = NotificationStatus.FAILED
            NOTIFICATIONS_DB[notification.id] = notification
            logger.info(f"⏭️  Skipped in-app notification (user disabled)")
            return notification

        # Send via appropriate provider
        try:
            result = None
            
            if channel == NotificationChannel.EMAIL:
                result = await self.email_provider.send(recipient, title, content)
            elif channel == NotificationChannel.SMS:
                result = await self.sms_provider.send(recipient, title, content)
            elif channel == NotificationChannel.PUSH:
                result = await self.push_provider.send(recipient, title, content)
            elif channel == NotificationChannel.IN_APP:
                result = await self.in_app_provider.send(
                    recipient, title, content, user_id=user_id
                )

            if result and result.get("success"):
                notification.status = NotificationStatus.SENT
                notification.sent_at = datetime.utcnow()
                notification.metadata["message_id"] = result.get("message_id")
                notification.metadata["provider"] = result.get("provider")
                logger.info(f"✅ {channel.value.upper()} notification sent successfully")
            else:
                notification.status = NotificationStatus.FAILED
                notification.metadata["error"] = result.get("error") if result else "Unknown error"
                logger.error(f"❌ {channel.value.upper()} notification failed: {notification.metadata.get('error')}")

        except Exception as e:
            notification.status = NotificationStatus.FAILED
            notification.metadata["error"] = str(e)
            logger.error(f"❌ Error sending {channel.value} notification: {e}")

        NOTIFICATIONS_DB[notification.id] = notification
        return notification

    async def send_campaign_notifications(self, campaign_id: str, user_ids: List[str],
                                         channels: List[NotificationChannel],
                                         title: str, content: str) -> dict:
        """Send notifications for a marketing campaign to multiple users"""
        
        results = {
            "campaign_id": campaign_id,
            "total": len(user_ids) * len(channels),
            "sent": 0,
            "failed": 0,
            "timestamp": datetime.utcnow().isoformat(),
            "by_channel": {
                "email": {"sent": 0, "failed": 0},
                "sms": {"sent": 0, "failed": 0},
                "push": {"sent": 0, "failed": 0},
                "in_app": {"sent": 0, "failed": 0}
            }
        }

        logger.info(f"🚀 Sending campaign notifications: {campaign_id} to {len(user_ids)} users via {len(channels)} channels")

        for user_id in user_ids:
            for channel in channels:
                # Get recipient based on channel (would come from user DB)
                recipient = await self._get_user_recipient(user_id, channel)
                
                if not recipient:
                    results["failed"] += 1
                    results["by_channel"][channel.value]["failed"] += 1
                    continue

                notification = await self.send_notification(
                    user_id=user_id,
                    notification_type=NotificationType.MARKETING_CAMPAIGN,
                    channel=channel,
                    title=title,
                    content=content,
                    recipient=recipient,
                    metadata={"campaign_id": campaign_id}
                )

                if notification.status == NotificationStatus.SENT:
                    results["sent"] += 1
                    results["by_channel"][channel.value]["sent"] += 1
                else:
                    results["failed"] += 1
                    results["by_channel"][channel.value]["failed"] += 1

        logger.info(f"📊 Campaign notifications complete: {results['sent']} sent, {results['failed']} failed")
        return results

    async def _get_user_recipient(self, user_id: str, channel: NotificationChannel) -> Optional[str]:
        """Get recipient address/token for user based on channel"""
        # In production, query from user database
        # For now, return None (would need user service integration)
        return None

    def get_notification_status(self, notification_id: str) -> Optional[dict]:
        """Get notification status"""
        notification = NOTIFICATIONS_DB.get(notification_id)
        if notification:
            return notification.to_dict()
        return None

    def get_user_preferences(self, user_id: str) -> dict:
        """Get user's notification preferences"""
        preferences = PREFERENCES_DB.get(user_id)
        if not preferences:
            preferences = PreferencesModel(user_id)
            PREFERENCES_DB[user_id] = preferences
        return preferences.to_dict()

    def update_user_preferences(self, user_id: str, prefs: CreatePreferencesRequest) -> dict:
        """Update user's notification preferences"""
        preferences = PreferencesModel(user_id) if user_id not in PREFERENCES_DB else PREFERENCES_DB[user_id]
        
        preferences.email_enabled = prefs.email_enabled
        preferences.sms_enabled = prefs.sms_enabled
        preferences.push_enabled = prefs.push_enabled
        preferences.in_app_enabled = prefs.in_app_enabled
        preferences.marketing_emails = prefs.marketing_emails
        preferences.marketing_sms = prefs.marketing_sms
        preferences.digest_frequency = prefs.digest_frequency
        preferences.updated_at = datetime.utcnow()
        
        PREFERENCES_DB[user_id] = preferences
        logger.info(f"✅ Updated notification preferences for user {user_id}")
        return preferences.to_dict()

    def register_device_token(self, user_id: str, device_token: str) -> bool:
        """Register device token for push notifications"""
        if user_id not in DEVICE_TOKENS_DB:
            DEVICE_TOKENS_DB[user_id] = []
        
        if device_token not in DEVICE_TOKENS_DB[user_id]:
            DEVICE_TOKENS_DB[user_id].append(device_token)
            logger.info(f"✅ Registered device token for user {user_id}")
        
        return True

    def get_provider_status(self) -> dict:
        """Get status of all notification providers"""
        status = {
            "email": {
                "configured": self.email_provider.is_configured(),
                "provider": "sendgrid"
            },
            "sms": {
                "configured": self.sms_provider.is_configured(),
                "provider": "twilio"
            },
            "push": {
                "configured": self.push_provider.is_configured(),
                "provider": "firebase"
            },
            "in_app": {
                "configured": self.in_app_provider.is_configured(),
                "provider": "in_app"
            }
        }
        logger.info(f"📊 Provider status: {status}")
        return status


# Global instance
notification_service = NotificationService()
