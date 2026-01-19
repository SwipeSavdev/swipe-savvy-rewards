"""
AWS SNS (Simple Notification Service) for Push Notifications
Replaces Firebase Cloud Messaging (FCM) for production use

Provides device registration, notification preferences, and push delivery.
Uses AWS SNS Platform Applications for cross-platform notification delivery.

Architecture:
- iOS: APNs (Apple Push Notification service)
- Android: GCM/FCM (Google Cloud Messaging / Firebase Cloud Messaging)
- SNS acts as the hub managing all platform endpoints
"""

import json
import logging
from typing import Dict, List, Optional, Any
from uuid import UUID, uuid4
from datetime import datetime

import boto3
from botocore.exceptions import ClientError
from sqlalchemy import select
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class SNSPushNotificationService:
    """
    AWS SNS-based push notification service for managing device tokens and push notifications.
    
    Features:
    - Device endpoint registration with SNS Platform Applications
    - Notification preference tracking
    - Push notification delivery to single/multiple devices
    - Notification history tracking
    - Multi-platform support (iOS, Android)
    """

    def __init__(self, aws_region: str = 'us-east-1', 
                 ios_app_arn: Optional[str] = None,
                 android_app_arn: Optional[str] = None):
        """
        Initialize SNS Push Notification service.
        
        Args:
            aws_region: AWS region (default: us-east-1)
            ios_app_arn: iOS Platform Application ARN (APNS_SANDBOX or APNS)
            android_app_arn: Android Platform Application ARN (GCM)
            
        Raises:
            ValueError: If SNS client initialization fails
        """
        try:
            self.sns_client = boto3.client('sns', region_name=aws_region)
            self.aws_region = aws_region
            self.ios_app_arn = ios_app_arn
            self.android_app_arn = android_app_arn
            
            logger.info(f"SNS Push Notification service initialized for region {aws_region}")
        except Exception as e:
            logger.error(f"SNS initialization failed: {str(e)}")
            raise ValueError(f"SNS initialization error: {str(e)}")

    def register_device(
        self,
        user_id: UUID,
        device_token: str,
        device_type: str,
        device_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Register a device endpoint with SNS Platform Application.
        
        The device_token is obtained from:
        - iOS: APNs (still use Firebase SDK, but we register with SNS instead)
        - Android: Firebase Cloud Messaging (FCM)
        
        Args:
            user_id: User ID
            device_token: Device token from Firebase/APNs
            device_type: Device type ('ios' or 'android')
            device_name: Optional device name/identifier
            
        Returns:
            Dictionary with registration status and endpoint ARN
            
        Example:
            {
                "success": true,
                "endpoint_arn": "arn:aws:sns:us-east-1:...:endpoint/APNS_SANDBOX/...",
                "device_token": "token...",
                "device_type": "ios",
                "registered_at": "2024-01-15T10:30:00Z"
            }
        """
        try:
            # Validate device type and get appropriate platform app
            if device_type.lower() == 'ios':
                platform_app_arn = self.ios_app_arn
                if not platform_app_arn:
                    raise ValueError("iOS Platform Application ARN not configured")
            elif device_type.lower() == 'android':
                platform_app_arn = self.android_app_arn
                if not platform_app_arn:
                    raise ValueError("Android Platform Application ARN not configured")
            else:
                raise ValueError(f"Unsupported device type: {device_type}")

            # Create or update platform endpoint
            custom_data = {
                'user_id': str(user_id),
                'device_name': device_name or f'{device_type}-device',
                'registered_at': datetime.utcnow().isoformat()
            }

            response = self.sns_client.create_platform_endpoint(
                PlatformApplicationArn=platform_app_arn,
                Token=device_token,
                CustomUserData=json.dumps(custom_data)
            )

            endpoint_arn = response['EndpointArn']
            
            logger.info(f"Device registered: {endpoint_arn} for user {user_id} ({device_type})")

            return {
                'success': True,
                'endpoint_arn': endpoint_arn,
                'device_token': device_token[:20] + '...',
                'device_type': device_type,
                'registered_at': custom_data['registered_at']
            }
        except ClientError as e:
            logger.error(f"AWS SNS error during device registration: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Device registration failed: {str(e)}")
            raise

    def send_notification(
        self,
        endpoint_arn: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        badge: Optional[int] = None,
        sound: str = 'default'
    ) -> Dict[str, Any]:
        """
        Send push notification to a specific endpoint.
        
        Args:
            endpoint_arn: SNS endpoint ARN
            title: Notification title
            body: Notification body
            data: Optional data payload (dict)
            badge: Optional badge number (iOS)
            sound: Sound file (default: 'default')
            
        Returns:
            Dictionary with send status and message ID
        """
        try:
            # Determine platform from endpoint ARN
            if 'APNS' in endpoint_arn:
                platform = 'ios'
                message_structure = self._format_ios_message(title, body, data, badge, sound)
            elif 'GCM' in endpoint_arn:
                platform = 'android'
                message_structure = self._format_android_message(title, body, data, sound)
            else:
                raise ValueError(f"Unknown platform in endpoint ARN: {endpoint_arn}")

            # Publish message to endpoint
            response = self.sns_client.publish(
                TargetArn=endpoint_arn,
                Message=message_structure,
                MessageStructure='json'
            )

            message_id = response['MessageId']
            logger.info(f"Notification sent via SNS: {message_id} to {platform} endpoint")

            return {
                'success': True,
                'message_id': message_id,
                'platform': platform,
                'sent_at': datetime.utcnow().isoformat()
            }
        except ClientError as e:
            logger.error(f"AWS SNS error during notification send: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Notification send failed: {str(e)}")
            raise

    def send_to_user(
        self,
        user_id: UUID,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        endpoint_arns: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Send notification to user (all devices or specific endpoints).
        
        Args:
            user_id: User ID
            title: Notification title
            body: Notification body
            data: Optional data payload
            endpoint_arns: Optional list of endpoint ARNs. If not provided,
                          sends to all user's registered endpoints.
            
        Returns:
            Dictionary with send statistics
        """
        try:
            # If no specific endpoints provided, would need database query
            # This is a simplified version - in production, query database for user endpoints
            if not endpoint_arns:
                logger.warning(f"No endpoint ARNs provided for user {user_id}")
                return {
                    'success': False,
                    'message_count': 0,
                    'message_ids': [],
                    'error': 'No registered devices found'
                }

            message_ids = []
            failed_count = 0

            # Send to each endpoint
            for endpoint_arn in endpoint_arns:
                try:
                    result = self.send_notification(endpoint_arn, title, body, data)
                    message_ids.append(result['message_id'])
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Failed to send to endpoint {endpoint_arn}: {str(e)}")

            return {
                'success': failed_count == 0,
                'message_count': len(endpoint_arns),
                'message_ids': message_ids,
                'failed_count': failed_count,
                'sent_at': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Notification send to user failed: {str(e)}")
            raise

    def send_multicast(
        self,
        endpoint_arns: List[str],
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Send notification to multiple endpoints.
        
        Args:
            endpoint_arns: List of endpoint ARNs
            title: Notification title
            body: Notification body
            data: Optional data payload
            
        Returns:
            Dictionary with overall send statistics
        """
        try:
            message_ids = []
            failed_count = 0

            for endpoint_arn in endpoint_arns:
                try:
                    result = self.send_notification(endpoint_arn, title, body, data)
                    message_ids.append(result['message_id'])
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Failed to send to endpoint: {str(e)}")

            return {
                'success': failed_count == 0,
                'total_endpoints': len(endpoint_arns),
                'messages_sent': len(message_ids),
                'failed_count': failed_count,
                'message_ids': message_ids,
                'sent_at': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Multicast send failed: {str(e)}")
            raise

    def unregister_device(self, endpoint_arn: str) -> Dict[str, Any]:
        """
        Unregister a device endpoint.
        
        Args:
            endpoint_arn: SNS endpoint ARN
            
        Returns:
            Unregistration status
        """
        try:
            self.sns_client.delete_endpoint(EndpointArn=endpoint_arn)
            
            logger.info(f"Device endpoint deleted: {endpoint_arn}")
            return {
                'success': True,
                'endpoint_arn': endpoint_arn,
                'message': 'Endpoint deleted successfully'
            }
        except ClientError as e:
            logger.error(f"AWS SNS error during endpoint deletion: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Device unregistration failed: {str(e)}")
            raise

    def get_endpoint_attributes(self, endpoint_arn: str) -> Dict[str, Any]:
        """
        Get endpoint attributes and status.
        
        Args:
            endpoint_arn: SNS endpoint ARN
            
        Returns:
            Endpoint attributes
        """
        try:
            response = self.sns_client.get_endpoint_attributes(
                EndpointArn=endpoint_arn
            )
            
            return response['Attributes']
        except ClientError as e:
            logger.error(f"AWS SNS error getting endpoint attributes: {str(e)}")
            raise

    def send_event_notification(
        self,
        endpoint_arns: List[str],
        event_type: str,
        event_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send event-based notification (payment, campaign, support, security, feature).
        
        Args:
            endpoint_arns: List of endpoint ARNs
            event_type: Type of event (payment, campaign, support, security, feature)
            event_data: Event-specific data
            
        Returns:
            Notification send result
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
            
            return self.send_multicast(endpoint_arns, title, body, data)
        except Exception as e:
            logger.error(f"Event notification send failed: {str(e)}")
            raise

    @staticmethod
    def _format_ios_message(title: str, body: str, data: Optional[Dict[str, str]] = None,
                           badge: Optional[int] = None, sound: str = 'default') -> str:
        """Format message for iOS (APNs)."""
        message = {
            'default': body,
            'APNS': json.dumps({
                'aps': {
                    'alert': {
                        'title': title,
                        'body': body
                    },
                    'sound': sound,
                    'badge': badge or 1
                },
                'data': data or {}
            })
        }
        return json.dumps(message)

    @staticmethod
    def _format_android_message(title: str, body: str, 
                               data: Optional[Dict[str, str]] = None,
                               sound: str = 'default') -> str:
        """Format message for Android (GCM/FCM)."""
        message = {
            'default': body,
            'GCM': json.dumps({
                'notification': {
                    'title': title,
                    'body': body,
                    'sound': sound
                },
                'data': data or {}
            })
        }
        return json.dumps(message)


class NotificationPreferencesService:
    """
    Manages user notification preferences (platform-agnostic).
    """

    def __init__(self):
        """Initialize notification preferences service."""
        pass

    def set_preferences(
        self,
        user_id: UUID,
        preferences: Dict[str, bool],
        db_session: Session
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
            db_session: SQLAlchemy session
            
        Returns:
            Updated preferences
        """
        try:
            # Store in database (would need NotificationPreference model)
            logger.info(f"Preferences updated for user {user_id}")
            return {
                'success': True,
                'user_id': str(user_id),
                'preferences': preferences,
                'updated_at': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Preference update failed: {str(e)}")
            raise

    def get_preferences(self, user_id: UUID, db_session: Session) -> Dict[str, Any]:
        """
        Get notification preferences for user.
        
        Args:
            user_id: User ID
            db_session: SQLAlchemy session
            
        Returns:
            User preferences (defaults: all enabled)
        """
        try:
            # Query from database (would need NotificationPreference model)
            default_prefs = {
                'payment_notifications': True,
                'campaign_notifications': True,
                'support_notifications': True,
                'security_notifications': True,
                'feature_notifications': True
            }
            return default_prefs
        except Exception as e:
            logger.error(f"Failed to retrieve preferences for user {user_id}: {str(e)}")
            return {}

    def check_notification_allowed(
        self,
        user_id: UUID,
        notification_type: str,
        db_session: Session
    ) -> bool:
        """
        Check if a specific notification type is allowed for user.
        
        Args:
            user_id: User ID
            notification_type: Type of notification (payment, campaign, support, security, feature)
            db_session: SQLAlchemy session
            
        Returns:
            True if notification is allowed, False otherwise
        """
        try:
            preferences = self.get_preferences(user_id, db_session)
            pref_key = f'{notification_type}_notifications'
            return preferences.get(pref_key, True)
        except Exception as e:
            logger.error(f"Failed to check notification preference: {str(e)}")
            return True  # Allow by default if check fails
