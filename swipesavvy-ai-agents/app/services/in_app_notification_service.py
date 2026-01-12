"""
In-App Notification Service for SwipeSavvy

Handles in-app notifications that are displayed within the application:
- Notification center messages
- Toast/banner notifications
- Real-time notification delivery via WebSocket
- Notification persistence and read status tracking
- Notification preferences management

This service works alongside push notifications to provide a comprehensive
notification experience within the app.
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from enum import Enum
from uuid import uuid4

from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
import uuid

logger = logging.getLogger(__name__)


class NotificationPriority(str, Enum):
    """Notification priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationCategory(str, Enum):
    """Notification categories for filtering and preferences"""
    TRANSACTION = "transaction"
    CASHBACK = "cashback"
    SECURITY = "security"
    ACCOUNT = "account"
    MARKETING = "marketing"
    SYSTEM = "system"
    SOCIAL = "social"
    SUPPORT = "support"


class InAppNotification:
    """In-app notification data model"""

    def __init__(
        self,
        user_id: str,
        title: str,
        body: str,
        category: NotificationCategory,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        icon: Optional[str] = None,
        image_url: Optional[str] = None,
        action_url: Optional[str] = None,
        action_type: Optional[str] = None,
        data: Optional[Dict] = None,
        expires_at: Optional[datetime] = None,
    ):
        self.id = str(uuid4())
        self.user_id = user_id
        self.title = title
        self.body = body
        self.category = category
        self.priority = priority
        self.icon = icon
        self.image_url = image_url
        self.action_url = action_url
        self.action_type = action_type
        self.data = data or {}
        self.read = False
        self.dismissed = False
        self.created_at = datetime.now(timezone.utc)
        self.expires_at = expires_at

    def to_dict(self) -> Dict[str, Any]:
        """Convert notification to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "body": self.body,
            "category": self.category.value,
            "priority": self.priority.value,
            "icon": self.icon,
            "image_url": self.image_url,
            "action_url": self.action_url,
            "action_type": self.action_type,
            "data": self.data,
            "read": self.read,
            "dismissed": self.dismissed,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }


class InAppNotificationService:
    """
    Service for managing in-app notifications.

    Provides methods for creating, storing, retrieving, and managing
    notifications displayed within the SwipeSavvy mobile app.
    """

    def __init__(self):
        self._notifications: Dict[str, List[InAppNotification]] = {}  # In-memory storage
        self._websocket_manager = None
        logger.info("In-App Notification Service initialized")

    def set_websocket_manager(self, manager):
        """Set the WebSocket manager for real-time delivery"""
        self._websocket_manager = manager

    # ========================================================================
    # NOTIFICATION CREATION
    # ========================================================================

    async def create_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        category: NotificationCategory,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        icon: Optional[str] = None,
        image_url: Optional[str] = None,
        action_url: Optional[str] = None,
        action_type: Optional[str] = None,
        data: Optional[Dict] = None,
        expires_in_hours: Optional[int] = None,
        deliver_via_websocket: bool = True,
        db: Optional[Session] = None
    ) -> InAppNotification:
        """
        Create and store a new in-app notification.

        Args:
            user_id: Target user ID
            title: Notification title
            body: Notification body text
            category: Notification category
            priority: Priority level
            icon: Icon name/path
            image_url: Optional image URL for rich notifications
            action_url: Deep link or URL to navigate on tap
            action_type: Type of action (e.g., "navigate", "open_url", "dismiss")
            data: Additional custom data
            expires_in_hours: Hours until notification expires
            deliver_via_websocket: Whether to send via WebSocket immediately
            db: Optional database session for persistence

        Returns:
            Created InAppNotification object
        """
        expires_at = None
        if expires_in_hours:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_in_hours)

        notification = InAppNotification(
            user_id=user_id,
            title=title,
            body=body,
            category=category,
            priority=priority,
            icon=icon,
            image_url=image_url,
            action_url=action_url,
            action_type=action_type,
            data=data,
            expires_at=expires_at
        )

        # Store in memory (replace with database in production)
        if user_id not in self._notifications:
            self._notifications[user_id] = []
        self._notifications[user_id].insert(0, notification)

        # Keep only last 100 notifications per user in memory
        if len(self._notifications[user_id]) > 100:
            self._notifications[user_id] = self._notifications[user_id][:100]

        # TODO: Persist to database if db session provided
        # if db:
        #     db_notification = NotificationModel(**notification.to_dict())
        #     db.add(db_notification)
        #     db.commit()

        # Deliver via WebSocket if available
        if deliver_via_websocket and self._websocket_manager:
            await self._deliver_via_websocket(user_id, notification)

        logger.info(f"Created notification {notification.id} for user {user_id}")
        return notification

    async def _deliver_via_websocket(self, user_id: str, notification: InAppNotification):
        """Deliver notification via WebSocket for real-time display"""
        try:
            if self._websocket_manager:
                await self._websocket_manager.send_to_user(
                    user_id,
                    {
                        "type": "notification",
                        "notification": notification.to_dict()
                    }
                )
                logger.debug(f"Delivered notification {notification.id} via WebSocket")
        except Exception as e:
            logger.error(f"Failed to deliver notification via WebSocket: {e}")

    # ========================================================================
    # NOTIFICATION RETRIEVAL
    # ========================================================================

    async def get_notifications(
        self,
        user_id: str,
        category: Optional[NotificationCategory] = None,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0,
        db: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Get notifications for a user.

        Args:
            user_id: User ID
            category: Optional category filter
            unread_only: Only return unread notifications
            limit: Maximum number of notifications
            offset: Pagination offset
            db: Optional database session

        Returns:
            List of notification dictionaries
        """
        notifications = self._notifications.get(user_id, [])

        # Filter by category
        if category:
            notifications = [n for n in notifications if n.category == category]

        # Filter unread
        if unread_only:
            notifications = [n for n in notifications if not n.read]

        # Filter expired
        now = datetime.now(timezone.utc)
        notifications = [
            n for n in notifications
            if not n.expires_at or n.expires_at > now
        ]

        # Filter dismissed
        notifications = [n for n in notifications if not n.dismissed]

        # Apply pagination
        paginated = notifications[offset:offset + limit]

        return [n.to_dict() for n in paginated]

    async def get_unread_count(
        self,
        user_id: str,
        category: Optional[NotificationCategory] = None,
        db: Optional[Session] = None
    ) -> int:
        """Get count of unread notifications for a user"""
        notifications = self._notifications.get(user_id, [])

        if category:
            notifications = [n for n in notifications if n.category == category]

        now = datetime.now(timezone.utc)
        unread = [
            n for n in notifications
            if not n.read and not n.dismissed and (not n.expires_at or n.expires_at > now)
        ]

        return len(unread)

    async def get_notification_by_id(
        self,
        notification_id: str,
        user_id: str,
        db: Optional[Session] = None
    ) -> Optional[Dict[str, Any]]:
        """Get a specific notification by ID"""
        notifications = self._notifications.get(user_id, [])

        for n in notifications:
            if n.id == notification_id:
                return n.to_dict()

        return None

    # ========================================================================
    # NOTIFICATION MANAGEMENT
    # ========================================================================

    async def mark_as_read(
        self,
        notification_id: str,
        user_id: str,
        db: Optional[Session] = None
    ) -> bool:
        """Mark a notification as read"""
        notifications = self._notifications.get(user_id, [])

        for n in notifications:
            if n.id == notification_id:
                n.read = True
                logger.debug(f"Marked notification {notification_id} as read")
                return True

        return False

    async def mark_all_as_read(
        self,
        user_id: str,
        category: Optional[NotificationCategory] = None,
        db: Optional[Session] = None
    ) -> int:
        """Mark all notifications as read for a user"""
        notifications = self._notifications.get(user_id, [])
        count = 0

        for n in notifications:
            if not n.read:
                if category is None or n.category == category:
                    n.read = True
                    count += 1

        logger.info(f"Marked {count} notifications as read for user {user_id}")
        return count

    async def dismiss_notification(
        self,
        notification_id: str,
        user_id: str,
        db: Optional[Session] = None
    ) -> bool:
        """Dismiss (hide) a notification"""
        notifications = self._notifications.get(user_id, [])

        for n in notifications:
            if n.id == notification_id:
                n.dismissed = True
                logger.debug(f"Dismissed notification {notification_id}")
                return True

        return False

    async def delete_notification(
        self,
        notification_id: str,
        user_id: str,
        db: Optional[Session] = None
    ) -> bool:
        """Permanently delete a notification"""
        notifications = self._notifications.get(user_id, [])

        for i, n in enumerate(notifications):
            if n.id == notification_id:
                del notifications[i]
                logger.debug(f"Deleted notification {notification_id}")
                return True

        return False

    async def clear_all_notifications(
        self,
        user_id: str,
        category: Optional[NotificationCategory] = None,
        db: Optional[Session] = None
    ) -> int:
        """Clear all notifications for a user"""
        if user_id not in self._notifications:
            return 0

        if category:
            original_count = len(self._notifications[user_id])
            self._notifications[user_id] = [
                n for n in self._notifications[user_id]
                if n.category != category
            ]
            count = original_count - len(self._notifications[user_id])
        else:
            count = len(self._notifications[user_id])
            self._notifications[user_id] = []

        logger.info(f"Cleared {count} notifications for user {user_id}")
        return count

    # ========================================================================
    # CONVENIENCE METHODS FOR COMMON NOTIFICATIONS
    # ========================================================================

    async def send_transaction_notification(
        self,
        user_id: str,
        merchant: str,
        amount: float,
        cashback: float,
        transaction_id: str
    ) -> InAppNotification:
        """Send transaction notification"""
        return await self.create_notification(
            user_id=user_id,
            title="Transaction Complete",
            body=f"${amount:.2f} at {merchant}. You earned ${cashback:.2f} cashback!",
            category=NotificationCategory.TRANSACTION,
            priority=NotificationPriority.NORMAL,
            icon="receipt",
            action_url=f"/transactions/{transaction_id}",
            action_type="navigate",
            data={
                "transaction_id": transaction_id,
                "merchant": merchant,
                "amount": amount,
                "cashback": cashback
            }
        )

    async def send_cashback_notification(
        self,
        user_id: str,
        amount: float,
        merchant: str,
        total_balance: float
    ) -> InAppNotification:
        """Send cashback earned notification"""
        return await self.create_notification(
            user_id=user_id,
            title="Cashback Earned!",
            body=f"You earned ${amount:.2f} at {merchant}. Total balance: ${total_balance:.2f}",
            category=NotificationCategory.CASHBACK,
            priority=NotificationPriority.NORMAL,
            icon="cash",
            action_url="/rewards",
            action_type="navigate",
            data={
                "amount": amount,
                "merchant": merchant,
                "total_balance": total_balance
            }
        )

    async def send_security_notification(
        self,
        user_id: str,
        alert_type: str,
        details: str,
        action_url: str = "/security"
    ) -> InAppNotification:
        """Send security alert notification"""
        titles = {
            "new_login": "New Login Detected",
            "new_device": "New Device",
            "suspicious_activity": "Security Alert",
            "password_changed": "Password Changed",
            "account_locked": "Account Locked"
        }

        return await self.create_notification(
            user_id=user_id,
            title=titles.get(alert_type, "Security Alert"),
            body=details,
            category=NotificationCategory.SECURITY,
            priority=NotificationPriority.URGENT,
            icon="shield",
            action_url=action_url,
            action_type="navigate",
            data={"alert_type": alert_type}
        )

    async def send_kyc_notification(
        self,
        user_id: str,
        status: str,
        message: str
    ) -> InAppNotification:
        """Send KYC status notification"""
        icons = {
            "submitted": "document",
            "approved": "checkmark-circle",
            "rejected": "close-circle",
            "pending": "time"
        }

        priorities = {
            "approved": NotificationPriority.HIGH,
            "rejected": NotificationPriority.URGENT,
            "submitted": NotificationPriority.NORMAL,
            "pending": NotificationPriority.LOW
        }

        return await self.create_notification(
            user_id=user_id,
            title=f"Verification {status.title()}",
            body=message,
            category=NotificationCategory.ACCOUNT,
            priority=priorities.get(status, NotificationPriority.NORMAL),
            icon=icons.get(status, "document"),
            action_url="/verification",
            action_type="navigate",
            data={"kyc_status": status}
        )

    async def send_promotional_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        offer_id: Optional[str] = None,
        image_url: Optional[str] = None,
        expires_in_hours: int = 168  # 7 days
    ) -> InAppNotification:
        """Send promotional notification"""
        return await self.create_notification(
            user_id=user_id,
            title=title,
            body=body,
            category=NotificationCategory.MARKETING,
            priority=NotificationPriority.LOW,
            icon="gift",
            image_url=image_url,
            action_url=f"/offers/{offer_id}" if offer_id else "/offers",
            action_type="navigate",
            data={"offer_id": offer_id},
            expires_in_hours=expires_in_hours
        )

    async def send_support_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        ticket_id: Optional[str] = None
    ) -> InAppNotification:
        """Send support-related notification"""
        return await self.create_notification(
            user_id=user_id,
            title=title,
            body=body,
            category=NotificationCategory.SUPPORT,
            priority=NotificationPriority.NORMAL,
            icon="chatbubble",
            action_url=f"/support/tickets/{ticket_id}" if ticket_id else "/support",
            action_type="navigate",
            data={"ticket_id": ticket_id}
        )

    async def send_system_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        action_url: Optional[str] = None
    ) -> InAppNotification:
        """Send system notification"""
        return await self.create_notification(
            user_id=user_id,
            title=title,
            body=body,
            category=NotificationCategory.SYSTEM,
            priority=NotificationPriority.NORMAL,
            icon="information-circle",
            action_url=action_url,
            action_type="navigate" if action_url else None
        )


# Singleton instance
in_app_notification_service = InAppNotificationService()


# Convenience functions
async def send_in_app_notification(
    user_id: str,
    title: str,
    body: str,
    category: str = "system",
    data: Optional[Dict] = None
) -> Dict[str, Any]:
    """Send an in-app notification"""
    category_enum = NotificationCategory(category.lower())
    notification = await in_app_notification_service.create_notification(
        user_id=user_id,
        title=title,
        body=body,
        category=category_enum,
        data=data
    )
    return notification.to_dict()


async def get_user_notifications(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Get notifications for a user"""
    return await in_app_notification_service.get_notifications(user_id, limit=limit)


async def get_unread_notification_count(user_id: str) -> int:
    """Get unread notification count"""
    return await in_app_notification_service.get_unread_count(user_id)
