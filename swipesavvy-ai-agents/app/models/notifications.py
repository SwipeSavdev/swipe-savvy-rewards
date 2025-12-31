"""
Database models for Phase 10 Task 2: Push Notifications
Supports device token storage, notification history, and preferences.
"""

from sqlalchemy import Column, String, UUID, Boolean, DateTime, Text, Integer, Enum, ForeignKey, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

Base = declarative_base()


class DeviceToken(Base):
    """
    Stores registered device tokens for push notifications.
    
    Supports multiple devices per user (mobile, tablet, web, etc.)
    Track device info and registration status.
    """
    __tablename__ = "device_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    device_token = Column(String(255), nullable=False, unique=True, index=True)
    device_type = Column(String(50), nullable=False)  # ios, android, web
    device_name = Column(String(255), nullable=True)  # e.g., "John's iPhone 14"
    is_active = Column(Boolean, default=True, index=True)
    firebase_device_id = Column(String(255), nullable=True)  # Firebase internal ID
    
    # Metadata
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    unregistered_at = Column(DateTime, nullable=True)
    
    # User agent info
    device_os = Column(String(100), nullable=True)  # iOS 17.2, Android 14, etc.
    app_version = Column(String(20), nullable=True)
    
    # Notification counts
    notifications_sent = Column(Integer, default=0)
    notifications_failed = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<DeviceToken(user_id={self.user_id}, device_type={self.device_type})>"


class NotificationHistory(Base):
    """
    Tracks all notifications sent to users.
    Used for audit trail, analytics, and resend functionality.
    """
    __tablename__ = "notification_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    device_id = Column(UUID(as_uuid=True), ForeignKey("device_tokens.id"), nullable=True)
    
    # Notification content
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False, index=True)  # payment, campaign, support, security, feature
    event_type = Column(String(100), nullable=True)  # payment_received, campaign_launched, etc.
    
    # Payload
    data = Column(JSONB, nullable=True)  # Additional data/metadata
    
    # Status tracking
    status = Column(String(50), default='pending', index=True)  # pending, sent, delivered, failed, clicked, dismissed
    message_id = Column(String(255), nullable=True, unique=True)  # Firebase message ID
    
    # User interaction
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    clicked = Column(Boolean, default=False)
    clicked_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)
    failure_reason = Column(String(255), nullable=True)
    
    # Retry info
    retry_count = Column(Integer, default=0)
    last_retry_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<NotificationHistory(user_id={self.user_id}, type={self.notification_type}, status={self.status})>"


class NotificationPreferences(Base):
    """
    User notification preferences and settings.
    Controls which types of notifications user receives.
    """
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True)
    
    # Notification type toggles
    payment_notifications = Column(Boolean, default=True)  # Payment/transaction alerts
    campaign_notifications = Column(Boolean, default=True)  # Marketing campaigns
    support_notifications = Column(Boolean, default=True)  # Support ticket updates
    security_notifications = Column(Boolean, default=True)  # Security alerts
    feature_notifications = Column(Boolean, default=True)  # New feature announcements
    
    # Quiet hours (optional)
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String(5), nullable=True)  # HH:MM format
    quiet_hours_end = Column(String(5), nullable=True)    # HH:MM format
    quiet_hours_timezone = Column(String(50), nullable=True)
    
    # Frequency preferences
    email_digest_enabled = Column(Boolean, default=False)
    email_digest_frequency = Column(String(50), default='daily')  # daily, weekly, off
    
    # Privacy
    allow_analytics = Column(Boolean, default=True)
    allow_marketing = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<NotificationPreferences(user_id={self.user_id})>"


class NotificationTemplate(Base):
    """
    Reusable notification templates for common use cases.
    Enables consistent messaging across the platform.
    """
    __tablename__ = "notification_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Template metadata
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    template_type = Column(String(50), nullable=False)  # payment, campaign, support, security, feature
    
    # Template content (supports variables like {user_name}, {amount}, etc.)
    title_template = Column(String(255), nullable=False)
    body_template = Column(Text, nullable=False)
    
    # Optional fields
    icon_url = Column(String(255), nullable=True)
    image_url = Column(String(255), nullable=True)
    action_url = Column(String(255), nullable=True)
    
    # Variables required by template
    variables = Column(JSONB, nullable=True)  # List of variable names needed
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<NotificationTemplate(name={self.name}, type={self.template_type})>"
