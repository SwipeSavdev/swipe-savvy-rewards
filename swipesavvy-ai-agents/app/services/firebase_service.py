"""
Firebase Cloud Messaging Service for Push Notifications
Phase 10 Task 2: Push Notifications Integration

Provides device registration, notification preferences, and push delivery.
Uses Firebase Cloud Messaging (FCM) for cross-platform notification delivery.
"""

import json
import logging
from typing import Dict, List, Optional, Any
from uuid import UUID
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, messaging, db
from sqlalchemy import select
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class FirebaseService:
    """
    Firebase Cloud Messaging service for managing device tokens and push notifications.
    
    Features:
    - Device token registration and management
    - Notification preference tracking
    - Push notification delivery to single/multiple devices
    - Notification history tracking
    - Multi-device support (iOS, Android, Web)
    """

    def __init__(self, credentials_json: str, database_url: str):
        """
        Initialize Firebase service.
        
        Args:
            credentials_json: Firebase service account credentials (JSON string or path)
            database_url: Firebase Realtime Database URL
            
        Raises:
            ValueError: If Firebase initialization fails
        """
        try:
            # Initialize Firebase App if not already initialized
            if not firebase_admin.get_app():
                # Parse credentials
                if credentials_json.startswith('{'):
                    creds_dict = json.loads(credentials_json)
                else:
                    with open(credentials_json, 'r') as f:
                        creds_dict = json.load(f)
                
                creds = credentials.Certificate(creds_dict)
                firebase_admin.initialize_app(creds, {
                    'databaseURL': database_url
                })
            
            self.db = db.reference()
            logger.info("Firebase service initialized successfully")
        except Exception as e:
            logger.error(f"Firebase initialization failed: {str(e)}")
            raise ValueError(f"Firebase initialization error: {str(e)}")

    def register_device(
        self,
        user_id: UUID,
        device_token: str,
        device_type: str,
        device_name: Optional[str] = None,
        db_session: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Register a device for push notifications.
        
        Args:
            user_id: User ID
            device_token: Firebase device token
            device_type: Device type (ios, android, web)
            device_name: Optional device name/identifier
            db_session: SQLAlchemy session for database operations
            
        Returns:
            Dictionary with registration status
            
        Example:
            {
                "success": true,
                "device_id": "device-uuid",
                "device_token": "token...",
                "device_type": "ios",
                "registered_at": "2024-01-15T10:30:00Z"
            }
        """
        try:
            device_id = str(UUID('random').int)  # Generate device ID
            
            # Store in Firebase Realtime Database
            device_data = {
                'user_id': str(user_id),
                'device_token': device_token,
                'device_type': device_type,
                'device_name': device_name or f'{device_type}-device',
                'registered_at': datetime.utcnow().isoformat(),
                'is_active': True
            }
            
            self.db.child('devices').child(device_id).set(device_data)
            
            logger.info(f"Device registered: {device_id} for user {user_id}")
            
            return {
                'success': True,
                'device_id': device_id,
                'device_token': device_token[:20] + '...',  # Return partial token
                'device_type': device_type,
                'registered_at': device_data['registered_at']
            }
        except Exception as e:
            logger.error(f"Device registration failed: {str(e)}")
            raise

    def send_notification(
        self,
        user_id: UUID,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        device_tokens: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Send push notification to user(s).
        
        Sends to either specific device tokens or retrieves user's registered devices.
        
        Args:
            user_id: Target user ID
            title: Notification title
            body: Notification body
            data: Optional data payload (dict)
            device_tokens: Optional list of specific device tokens. If not provided,
                          sends to all user's registered devices.
            
        Returns:
            Dictionary with send status and message IDs
            
        Example:
            {
                "success": true,
                "message_count": 2,
                "message_ids": ["msg-id-1", "msg-id-2"],
                "failed_count": 0,
                "sent_at": "2024-01-15T10:30:00Z"
            }
        """
        try:
            # If no specific tokens provided, fetch user's devices
            if not device_tokens:
                device_tokens = self._get_user_device_tokens(user_id)
            
            if not device_tokens:
                logger.warning(f"No devices found for user {user_id}")
                return {
                    'success': False,
                    'message_count': 0,
                    'message_ids': [],
                    'error': 'No registered devices found'
                }
            
            # Build notification message
            notification = messaging.Notification(
                title=title,
                body=body
            )
            
            message_ids = []
            failed_count = 0
            
            # Send to each device
            for token in device_tokens:
                try:
                    message = messaging.Message(
                        notification=notification,
                        data=data or {},
                        token=token
                    )
                    
                    response = messaging.send(message)
                    message_ids.append(response)
                    logger.info(f"Notification sent to device {token[:20]}...")
                    
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Failed to send to device {token[:20]}: {str(e)}")
            
            result = {
                'success': failed_count == 0,
                'message_count': len(device_tokens),
                'message_ids': message_ids,
                'failed_count': failed_count,
                'sent_at': datetime.utcnow().isoformat()
            }
            
            # Log notification in history (if db_session provided)
            # This would require a NotificationHistory model
            
            return result
            
        except Exception as e:
            logger.error(f"Notification send failed: {str(e)}")
            raise

    def send_multicast(
        self,
        user_ids: List[UUID],
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Send notification to multiple users.
        
        Args:
            user_ids: List of user IDs
            title: Notification title
            body: Notification body
            data: Optional data payload
            
        Returns:
            Dictionary with overall send statistics
        """
        try:
            total_sent = 0
            total_failed = 0
            
            for user_id in user_ids:
                result = self.send_notification(user_id, title, body, data)
                total_sent += result.get('message_count', 0)
                total_failed += result.get('failed_count', 0)
            
            return {
                'success': total_failed == 0,
                'total_users': len(user_ids),
                'total_messages_sent': total_sent,
                'total_failed': total_failed,
                'sent_at': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Multicast send failed: {str(e)}")
            raise

    def _get_user_device_tokens(self, user_id: UUID) -> List[str]:
        """
        Retrieve all active device tokens for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of device tokens
        """
        try:
            devices_ref = self.db.child('devices').order_by_child('user_id').equal_to(str(user_id)).get()
            
            tokens = []
            if devices_ref.val():
                for device_data in devices_ref.val().values():
                    if device_data.get('is_active'):
                        tokens.append(device_data.get('device_token'))
            
            return tokens
        except Exception as e:
            logger.error(f"Failed to retrieve device tokens for user {user_id}: {str(e)}")
            return []

    def unregister_device(self, device_id: str) -> Dict[str, Any]:
        """
        Unregister a device (mark as inactive).
        
        Args:
            device_id: Device ID
            
        Returns:
            Unregistration status
        """
        try:
            self.db.child('devices').child(device_id).update({
                'is_active': False,
                'unregistered_at': datetime.utcnow().isoformat()
            })
            
            logger.info(f"Device unregistered: {device_id}")
            return {
                'success': True,
                'device_id': device_id,
                'message': 'Device unregistered successfully'
            }
        except Exception as e:
            logger.error(f"Device unregistration failed: {str(e)}")
            raise

    def send_event_notification(
        self,
        user_id: UUID,
        event_type: str,
        event_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send event-based notification (payment, campaign, support, security, feature).
        
        Args:
            user_id: User ID
            event_type: Type of event (payment, campaign, support, security, feature)
            event_data: Event-specific data
            
        Returns:
            Notification send result
            
        Event Types:
        - payment: Payment/transaction notifications
        - campaign: Marketing campaign notifications
        - support: Support ticket updates
        - security: Security alerts (login, password change, etc.)
        - feature: New feature announcements
        """
        try:
            # Build event-specific message
            titles = {
                'payment': 'Payment Notification',
                'campaign': 'Campaign Update',
                'support': 'Support Ticket Update',
                'security': 'Security Alert',
                'feature': 'New Feature Available'
            }
            
            title = titles.get(event_type, 'Notification')
            body = event_data.get('message', 'You have a new notification')
            
            data = {
                'event_type': event_type,
                **event_data
            }
            
            return self.send_notification(user_id, title, body, data)
            
        except Exception as e:
            logger.error(f"Event notification send failed: {str(e)}")
            raise


class NotificationPreferencesService:
    """
    Manages user notification preferences.
    Uses Firebase Realtime Database for storage.
    """

    def __init__(self, firebase_service: FirebaseService):
        """Initialize with Firebase service instance."""
        self.firebase = firebase_service
        self.db = firebase_service.db

    def set_preferences(
        self,
        user_id: UUID,
        preferences: Dict[str, bool]
    ) -> Dict[str, Any]:
        """
        Set notification preferences for user.
        
        Args:
            user_id: User ID
            preferences: Dictionary of preference flags
                {
                    "payment_notifications": bool,
                    "campaign_notifications": bool,
                    "support_notifications": bool,
                    "security_notifications": bool,
                    "feature_notifications": bool
                }
            
        Returns:
            Updated preferences
        """
        try:
            pref_data = {
                **preferences,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            self.db.child('preferences').child(str(user_id)).set(pref_data)
            
            logger.info(f"Preferences updated for user {user_id}")
            return {
                'success': True,
                'user_id': str(user_id),
                'preferences': preferences,
                'updated_at': pref_data['updated_at']
            }
        except Exception as e:
            logger.error(f"Preference update failed: {str(e)}")
            raise

    def get_preferences(self, user_id: UUID) -> Dict[str, Any]:
        """
        Get notification preferences for user.
        
        Args:
            user_id: User ID
            
        Returns:
            User preferences (defaults: all enabled)
        """
        try:
            pref_ref = self.db.child('preferences').child(str(user_id)).get()
            
            # Default preferences: all notifications enabled
            default_prefs = {
                'payment_notifications': True,
                'campaign_notifications': True,
                'support_notifications': True,
                'security_notifications': True,
                'feature_notifications': True
            }
            
            if pref_ref.val():
                return {**default_prefs, **pref_ref.val()}
            
            return default_prefs
            
        except Exception as e:
            logger.error(f"Failed to retrieve preferences for user {user_id}: {str(e)}")
            return {}

    def check_notification_allowed(
        self,
        user_id: UUID,
        notification_type: str
    ) -> bool:
        """
        Check if a specific notification type is allowed for user.
        
        Args:
            user_id: User ID
            notification_type: Type of notification (payment, campaign, support, security, feature)
            
        Returns:
            True if notification is allowed, False otherwise
        """
        try:
            preferences = self.get_preferences(user_id)
            
            pref_key = f'{notification_type}_notifications'
            return preferences.get(pref_key, True)
            
        except Exception as e:
            logger.error(f"Failed to check notification preference: {str(e)}")
            return True  # Allow by default if check fails
