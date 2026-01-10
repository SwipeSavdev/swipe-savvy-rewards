"""
Notification Service
Handles email, SMS, and push notifications for the platform

Integrations:
- Email: SendGrid (https://sendgrid.com)
- SMS: Twilio (https://twilio.com)
- Push: Firebase Cloud Messaging (FCM)
"""

import os
import logging
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
import secrets
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

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

# ==================== Database Layer ====================

from sqlalchemy.orm import Session
from uuid import UUID as PyUUID
import uuid

# Import SQLAlchemy models for database persistence
from app.models.notifications import (
    NotificationHistory as NotificationHistoryDB,
    NotificationPreferences as NotificationPreferencesDB
)
from app.database import SessionLocal

def get_db_session() -> Session:
    """Get a database session for notification operations"""
    return SessionLocal()


class NotificationModel:
    """Wrapper class for notification that works with both DB and in-memory"""
    def __init__(self, user_id: str, notification_type: NotificationType,
                 channel: NotificationChannel, title: str, content: str,
                 recipient: str, metadata: dict = None, db_record=None):
        if db_record:
            # Initialize from database record
            self.id = str(db_record.id)
            self.user_id = str(db_record.user_id)
            self.type = db_record.notification_type
            self.channel = channel if channel else NotificationChannel.IN_APP
            self.title = db_record.title
            self.content = db_record.body
            self.status = NotificationStatus(db_record.status) if db_record.status in [s.value for s in NotificationStatus] else NotificationStatus.PENDING
            self.created_at = db_record.created_at
            self.sent_at = db_record.sent_at
            self.read_at = db_record.read_at
            self.recipient = recipient
            self.metadata = db_record.data or {}
        else:
            # Create new notification
            self.id = str(uuid.uuid4())
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
            "type": self.type.value if hasattr(self.type, 'value') else self.type,
            "channel": self.channel.value if hasattr(self.channel, 'value') else self.channel,
            "title": self.title,
            "content": self.content,
            "status": self.status.value if hasattr(self.status, 'value') else self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None,
            "recipient": self.recipient,
            "metadata": self.metadata,
        }

    def save_to_db(self, db: Session) -> 'NotificationModel':
        """Persist notification to database"""
        db_notification = NotificationHistoryDB(
            id=uuid.UUID(self.id) if isinstance(self.id, str) else self.id,
            user_id=uuid.UUID(self.user_id) if isinstance(self.user_id, str) else self.user_id,
            title=self.title,
            body=self.content,
            notification_type=self.type.value if hasattr(self.type, 'value') else str(self.type),
            status=self.status.value if hasattr(self.status, 'value') else self.status,
            data=self.metadata,
            is_read=self.read_at is not None,
            read_at=self.read_at,
            sent_at=self.sent_at,
            created_at=self.created_at
        )
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        return self


class PreferencesModel:
    """Wrapper class for notification preferences"""
    def __init__(self, user_id: str, db_record=None):
        if db_record:
            self.id = str(db_record.id)
            self.user_id = str(db_record.user_id)
            self.email_enabled = db_record.payment_notifications  # Map to general email
            self.sms_enabled = db_record.security_notifications  # Map to SMS alerts
            self.push_enabled = db_record.feature_notifications
            self.marketing_emails = db_record.allow_marketing
            self.digest_frequency = db_record.email_digest_frequency or "daily"
            self.updated_at = db_record.updated_at
        else:
            self.id = str(uuid.uuid4())
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
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def save_to_db(self, db: Session) -> 'PreferencesModel':
        """Persist preferences to database"""
        # Check if preferences exist
        existing = db.query(NotificationPreferencesDB).filter(
            NotificationPreferencesDB.user_id == uuid.UUID(self.user_id)
        ).first()

        if existing:
            existing.payment_notifications = self.email_enabled
            existing.security_notifications = self.sms_enabled
            existing.feature_notifications = self.push_enabled
            existing.allow_marketing = self.marketing_emails
            existing.email_digest_frequency = self.digest_frequency
            existing.updated_at = datetime.utcnow()
        else:
            db_prefs = NotificationPreferencesDB(
                id=uuid.UUID(self.id),
                user_id=uuid.UUID(self.user_id),
                payment_notifications=self.email_enabled,
                security_notifications=self.sms_enabled,
                feature_notifications=self.push_enabled,
                allow_marketing=self.marketing_emails,
                email_digest_frequency=self.digest_frequency
            )
            db.add(db_prefs)

        db.commit()
        return self

# ==================== Notification Providers ====================

class NotificationProvider(ABC):
    """Abstract base class for notification providers"""

    @abstractmethod
    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> bool:
        """Send notification"""
        pass


class SendGridEmailProvider(NotificationProvider):
    """SendGrid email provider for transactional emails"""

    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "noreply@swipesavvy.com")
        self.from_name = os.getenv("SENDGRID_FROM_NAME", "SwipeSavvy")
        self._sg = None

    @property
    def sg(self):
        """Lazy load SendGrid client"""
        if self._sg is None and self.api_key:
            try:
                from sendgrid import SendGridAPIClient
                self._sg = SendGridAPIClient(self.api_key)
            except ImportError:
                logger.warning("sendgrid package not installed. Run: pip install sendgrid")
        return self._sg

    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> bool:
        """Send email via SendGrid"""
        if not self.api_key:
            logger.warning("SendGrid API key not configured, using mock email")
            logger.info(f"📧 [MOCK] Email to {recipient}: {subject}")
            return True

        try:
            from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent

            mail = Mail(
                from_email=Email(self.from_email, self.from_name),
                to_emails=To(recipient),
                subject=subject,
            )

            # Add plain text content
            mail.add_content(Content("text/plain", message))

            # Add HTML content if provided
            html_body = kwargs.get("html_body")
            if html_body:
                mail.add_content(Content("text/html", html_body))

            response = self.sg.send(mail)

            if response.status_code in [200, 201, 202]:
                logger.info(f"📧 Email sent to {recipient}: {subject}")
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code} - {response.body}")
                return False

        except Exception as e:
            logger.error(f"Failed to send email via SendGrid: {str(e)}")
            return False

    async def send_template(
        self,
        recipient: str,
        template_id: str,
        dynamic_data: Dict[str, Any]
    ) -> bool:
        """Send email using SendGrid dynamic template"""
        if not self.api_key:
            logger.warning(f"📧 [MOCK] Template email to {recipient}: template={template_id}")
            return True

        try:
            from sendgrid.helpers.mail import Mail, Email, To

            mail = Mail(
                from_email=Email(self.from_email, self.from_name),
                to_emails=To(recipient),
            )
            mail.template_id = template_id
            mail.dynamic_template_data = dynamic_data

            response = self.sg.send(mail)

            if response.status_code in [200, 201, 202]:
                logger.info(f"📧 Template email sent to {recipient}: {template_id}")
                return True
            else:
                logger.error(f"SendGrid template error: {response.status_code}")
                return False

        except Exception as e:
            logger.error(f"Failed to send template email: {str(e)}")
            return False


class TwilioSMSProvider(NotificationProvider):
    """Twilio SMS provider for transactional SMS"""

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER")
        self.verify_service_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
        self._client = None

    @property
    def client(self):
        """Lazy load Twilio client"""
        if self._client is None and self.account_sid and self.auth_token:
            try:
                from twilio.rest import Client
                self._client = Client(self.account_sid, self.auth_token)
            except ImportError:
                logger.warning("twilio package not installed. Run: pip install twilio")
        return self._client

    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> bool:
        """Send SMS via Twilio"""
        if not self.account_sid or not self.auth_token:
            logger.warning("Twilio credentials not configured, using mock SMS")
            logger.info(f"📱 [MOCK] SMS to {recipient}: {message}")
            return True

        try:
            # Normalize phone number
            phone = self._normalize_phone(recipient)

            sms = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=phone
            )

            logger.info(f"📱 SMS sent to {phone}: SID={sms.sid}")
            return True

        except Exception as e:
            logger.error(f"Failed to send SMS via Twilio: {str(e)}")
            return False

    async def send_otp(self, phone_number: str) -> Dict[str, Any]:
        """Send OTP via Twilio Verify Service"""
        if not self.verify_service_sid:
            # Generate mock OTP for development
            mock_code = "123456"
            logger.info(f"📱 [MOCK] OTP to {phone_number}: {mock_code}")
            return {"success": True, "mock": True, "code": mock_code}

        try:
            phone = self._normalize_phone(phone_number)

            verification = self.client.verify \
                .v2 \
                .services(self.verify_service_sid) \
                .verifications \
                .create(to=phone, channel="sms")

            logger.info(f"📱 OTP sent to {phone}: status={verification.status}")
            return {
                "success": True,
                "status": verification.status,
                "sid": verification.sid
            }

        except Exception as e:
            logger.error(f"Failed to send OTP: {str(e)}")
            return {"success": False, "error": str(e)}

    async def verify_otp(self, phone_number: str, code: str) -> Dict[str, Any]:
        """Verify OTP via Twilio Verify Service"""
        if not self.verify_service_sid:
            # Accept mock code for development
            is_valid = code == "123456"
            return {"success": True, "valid": is_valid, "mock": True}

        try:
            phone = self._normalize_phone(phone_number)

            verification_check = self.client.verify \
                .v2 \
                .services(self.verify_service_sid) \
                .verification_checks \
                .create(to=phone, code=code)

            is_valid = verification_check.status == "approved"
            logger.info(f"📱 OTP verification for {phone}: valid={is_valid}")

            return {
                "success": True,
                "valid": is_valid,
                "status": verification_check.status
            }

        except Exception as e:
            logger.error(f"Failed to verify OTP: {str(e)}")
            return {"success": False, "valid": False, "error": str(e)}

    def _normalize_phone(self, phone: str) -> str:
        """Normalize phone number to E.164 format"""
        # Remove all non-digit characters
        digits = ''.join(filter(str.isdigit, phone))

        # Add US country code if not present
        if len(digits) == 10:
            return f"+1{digits}"
        elif len(digits) == 11 and digits.startswith("1"):
            return f"+{digits}"
        elif not phone.startswith("+"):
            return f"+{digits}"

        return phone


class PushProvider(NotificationProvider):
    """Firebase Cloud Messaging push notification provider"""

    def __init__(self):
        # Firebase credentials would be loaded from service account
        self.firebase_credentials = os.getenv("FIREBASE_CREDENTIALS_PATH")
        self._initialized = False

    async def send(self, recipient: str, subject: str, message: str, **kwargs) -> bool:
        """Send push notification (stub - requires Firebase setup)"""
        logger.info(f"🔔 [STUB] Push to {recipient}: {subject} - {message}")
        return True

# ==================== Notification Service ====================

class NotificationService:
    """Notification management service with SendGrid and Twilio integration"""

    def __init__(self):
        self.email_provider = SendGridEmailProvider()
        self.sms_provider = TwilioSMSProvider()
        self.push_provider = PushProvider()

    async def send_notification(self, user_id: str, notification_type: NotificationType,
                               channel: NotificationChannel, title: str, content: str,
                               recipient: str, metadata: dict = None) -> NotificationModel:
        """Send notification with database persistence"""
        notification = NotificationModel(
            user_id, notification_type, channel, title, content, recipient, metadata
        )

        db = get_db_session()
        try:
            # Get user preferences from database
            preferences = self._get_or_create_preferences(db, user_id)

            # Check if user wants this type of notification
            if channel == NotificationChannel.EMAIL and not preferences.email_enabled:
                notification.status = NotificationStatus.FAILED
                notification.save_to_db(db)
                return notification

            if channel == NotificationChannel.SMS and not preferences.sms_enabled:
                notification.status = NotificationStatus.FAILED
                notification.save_to_db(db)
                return notification

            if channel == NotificationChannel.PUSH and not preferences.push_enabled:
                notification.status = NotificationStatus.FAILED
                notification.save_to_db(db)
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
                logger.error(f"Failed to send notification: {str(e)}")

            # Persist to database
            notification.save_to_db(db)
            return notification
        finally:
            db.close()

    def _get_or_create_preferences(self, db: Session, user_id: str) -> PreferencesModel:
        """Get or create user preferences from database"""
        try:
            db_prefs = db.query(NotificationPreferencesDB).filter(
                NotificationPreferencesDB.user_id == uuid.UUID(user_id)
            ).first()

            if db_prefs:
                return PreferencesModel(user_id, db_record=db_prefs)
            else:
                # Create default preferences
                prefs = PreferencesModel(user_id)
                prefs.save_to_db(db)
                return prefs
        except Exception as e:
            logger.warning(f"Error loading preferences, using defaults: {e}")
            return PreferencesModel(user_id)

    # ==================== Convenience Methods ====================

    async def send_welcome_email(self, email: str, name: str) -> bool:
        """Send welcome email to new user"""
        template_id = os.getenv("SENDGRID_TEMPLATE_WELCOME")
        if template_id and template_id.startswith("d-"):
            return await self.email_provider.send_template(
                recipient=email,
                template_id=template_id,
                dynamic_data={"name": name, "email": email}
            )
        else:
            return await self.email_provider.send(
                recipient=email,
                subject="Welcome to SwipeSavvy!",
                message=f"Hi {name},\n\nWelcome to SwipeSavvy! We're excited to have you.\n\nBest,\nThe SwipeSavvy Team"
            )

    async def send_verification_email(self, email: str, code: str, name: str = "") -> bool:
        """Send email verification code"""
        template_id = os.getenv("SENDGRID_TEMPLATE_VERIFICATION")
        if template_id and template_id.startswith("d-"):
            return await self.email_provider.send_template(
                recipient=email,
                template_id=template_id,
                dynamic_data={"name": name, "code": code}
            )
        else:
            return await self.email_provider.send(
                recipient=email,
                subject="Verify your SwipeSavvy account",
                message=f"Your verification code is: {code}\n\nThis code expires in 10 minutes."
            )

    async def send_password_reset_email(self, email: str, reset_link: str, name: str = "") -> bool:
        """Send password reset email"""
        template_id = os.getenv("SENDGRID_TEMPLATE_PASSWORD_RESET")
        if template_id and template_id.startswith("d-"):
            return await self.email_provider.send_template(
                recipient=email,
                template_id=template_id,
                dynamic_data={"name": name, "reset_link": reset_link}
            )
        else:
            return await self.email_provider.send(
                recipient=email,
                subject="Reset your SwipeSavvy password",
                message=f"Click here to reset your password: {reset_link}\n\nThis link expires in 1 hour."
            )

    async def send_transaction_alert_email(
        self, email: str, amount: str, merchant: str, transaction_type: str, name: str = ""
    ) -> bool:
        """Send transaction alert email"""
        template_id = os.getenv("SENDGRID_TEMPLATE_TRANSACTION_ALERT")
        if template_id and template_id.startswith("d-"):
            return await self.email_provider.send_template(
                recipient=email,
                template_id=template_id,
                dynamic_data={
                    "name": name,
                    "amount": amount,
                    "merchant": merchant,
                    "type": transaction_type
                }
            )
        else:
            return await self.email_provider.send(
                recipient=email,
                subject=f"SwipeSavvy Alert: {amount} {transaction_type}",
                message=f"A {transaction_type} of {amount} was made at {merchant}."
            )

    async def send_kyc_status_email(
        self, email: str, status: str, tier: str = "", name: str = "", reason: str = ""
    ) -> bool:
        """Send KYC status update email"""
        if status == "approved":
            template_id = os.getenv("SENDGRID_TEMPLATE_KYC_APPROVED")
            subject = "Your SwipeSavvy account has been verified!"
            message = f"Congratulations {name}! Your account has been verified at {tier} level."
        else:
            template_id = os.getenv("SENDGRID_TEMPLATE_KYC_REJECTED")
            subject = "Action required: SwipeSavvy verification"
            message = f"Hi {name}, we couldn't verify your account. Reason: {reason}"

        if template_id and template_id.startswith("d-"):
            return await self.email_provider.send_template(
                recipient=email,
                template_id=template_id,
                dynamic_data={"name": name, "status": status, "tier": tier, "reason": reason}
            )
        else:
            return await self.email_provider.send(
                recipient=email,
                subject=subject,
                message=message
            )

    async def send_otp_sms(self, phone_number: str) -> Dict[str, Any]:
        """Send OTP via SMS using Twilio Verify"""
        return await self.sms_provider.send_otp(phone_number)

    async def verify_otp_sms(self, phone_number: str, code: str) -> Dict[str, Any]:
        """Verify OTP code"""
        return await self.sms_provider.verify_otp(phone_number, code)

    async def send_transaction_alert_sms(
        self, phone_number: str, amount: str, merchant: str, transaction_type: str
    ) -> bool:
        """Send transaction alert via SMS"""
        message = f"SwipeSavvy Alert: {amount} {transaction_type} at {merchant}. Reply STOP to opt out."
        return await self.sms_provider.send(phone_number, "", message)

    @staticmethod
    def get_notifications(user_id: str, limit: int = 50, offset: int = 0) -> List[NotificationModel]:
        """Get notifications for user from database"""
        db = get_db_session()
        try:
            db_notifications = db.query(NotificationHistoryDB).filter(
                NotificationHistoryDB.user_id == uuid.UUID(user_id)
            ).order_by(
                NotificationHistoryDB.created_at.desc()
            ).offset(offset).limit(limit).all()

            return [
                NotificationModel(
                    user_id=str(n.user_id),
                    notification_type=NotificationType(n.notification_type) if n.notification_type in [t.value for t in NotificationType] else NotificationType.SYSTEM_UPDATE,
                    channel=NotificationChannel.IN_APP,
                    title=n.title,
                    content=n.body,
                    recipient="",
                    db_record=n
                )
                for n in db_notifications
            ]
        except Exception as e:
            logger.error(f"Error fetching notifications: {e}")
            return []
        finally:
            db.close()

    @staticmethod
    def mark_as_read(notification_id: str, user_id: str) -> Optional[NotificationModel]:
        """Mark notification as read in database"""
        db = get_db_session()
        try:
            notification = db.query(NotificationHistoryDB).filter(
                NotificationHistoryDB.id == uuid.UUID(notification_id),
                NotificationHistoryDB.user_id == uuid.UUID(user_id)
            ).first()

            if not notification:
                return None

            notification.is_read = True
            notification.read_at = datetime.utcnow()
            db.commit()

            return NotificationModel(
                user_id=str(notification.user_id),
                notification_type=NotificationType.SYSTEM_UPDATE,
                channel=NotificationChannel.IN_APP,
                title=notification.title,
                content=notification.body,
                recipient="",
                db_record=notification
            )
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            db.rollback()
            return None
        finally:
            db.close()

    @staticmethod
    def mark_all_as_read(user_id: str) -> int:
        """Mark all notifications as read in database"""
        db = get_db_session()
        try:
            count = db.query(NotificationHistoryDB).filter(
                NotificationHistoryDB.user_id == uuid.UUID(user_id),
                NotificationHistoryDB.is_read == False
            ).update({
                "is_read": True,
                "read_at": datetime.utcnow()
            })
            db.commit()
            return count
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {e}")
            db.rollback()
            return 0
        finally:
            db.close()

    @staticmethod
    def delete_notification(notification_id: str, user_id: str) -> bool:
        """Delete notification from database"""
        db = get_db_session()
        try:
            result = db.query(NotificationHistoryDB).filter(
                NotificationHistoryDB.id == uuid.UUID(notification_id),
                NotificationHistoryDB.user_id == uuid.UUID(user_id)
            ).delete()
            db.commit()
            return result > 0
        except Exception as e:
            logger.error(f"Error deleting notification: {e}")
            db.rollback()
            return False
        finally:
            db.close()

    @staticmethod
    def get_preferences(user_id: str) -> PreferencesModel:
        """Get notification preferences from database"""
        db = get_db_session()
        try:
            db_prefs = db.query(NotificationPreferencesDB).filter(
                NotificationPreferencesDB.user_id == uuid.UUID(user_id)
            ).first()

            if db_prefs:
                return PreferencesModel(user_id, db_record=db_prefs)
            else:
                # Create and save default preferences
                prefs = PreferencesModel(user_id)
                prefs.save_to_db(db)
                return prefs
        except Exception as e:
            logger.warning(f"Error loading preferences: {e}")
            return PreferencesModel(user_id)
        finally:
            db.close()

    @staticmethod
    def update_preferences(user_id: str, preferences: CreatePreferencesRequest) -> PreferencesModel:
        """Update notification preferences in database"""
        db = get_db_session()
        try:
            prefs = PreferencesModel(user_id)
            prefs.email_enabled = preferences.email_enabled
            prefs.sms_enabled = preferences.sms_enabled
            prefs.push_enabled = preferences.push_enabled
            prefs.marketing_emails = preferences.marketing_emails
            prefs.digest_frequency = preferences.digest_frequency
            prefs.updated_at = datetime.utcnow()
            prefs.save_to_db(db)
            return prefs
        except Exception as e:
            logger.error(f"Error updating preferences: {e}")
            return PreferencesModel(user_id)
        finally:
            db.close()

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
