"""
AWS Push Notification Service for SwipeSavvy

Handles mobile push notifications using AWS SNS:
- iOS push notifications via APNS (Apple Push Notification Service)
- Android push notifications via FCM (Firebase Cloud Messaging)
- Topic-based broadcasts for announcements
- Direct device targeting for personalized notifications

This service manages device registration, token management, and notification delivery.
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Platform Application ARNs (set these in environment)
APNS_PLATFORM_ARN = os.getenv("AWS_SNS_APNS_ARN")  # iOS Production
APNS_SANDBOX_ARN = os.getenv("AWS_SNS_APNS_SANDBOX_ARN")  # iOS Development
FCM_PLATFORM_ARN = os.getenv("AWS_SNS_FCM_ARN")  # Android/FCM

# Mock mode for development
MOCK_PUSH = os.getenv("MOCK_PUSH", "true").lower() == "true" or not AWS_ACCESS_KEY_ID


class Platform(str, Enum):
    """Supported push notification platforms"""
    IOS = "ios"
    IOS_SANDBOX = "ios_sandbox"
    ANDROID = "android"


class NotificationType(str, Enum):
    """Types of push notifications"""
    TRANSACTION = "transaction"
    CASHBACK = "cashback"
    SECURITY = "security"
    MARKETING = "marketing"
    SYSTEM = "system"
    CHAT = "chat"


class AWSPushNotificationService:
    """Push notification service using AWS SNS Mobile Push"""

    def __init__(self):
        self.mock_mode = MOCK_PUSH
        self.client = None
        self.platform_arns = {
            Platform.IOS: APNS_PLATFORM_ARN,
            Platform.IOS_SANDBOX: APNS_SANDBOX_ARN,
            Platform.ANDROID: FCM_PLATFORM_ARN,
        }

        if not self.mock_mode:
            try:
                self.client = boto3.client(
                    'sns',
                    region_name=AWS_REGION,
                    aws_access_key_id=AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
                )
                logger.info(f"AWS Push Notification service initialized in region: {AWS_REGION}")
            except Exception as e:
                logger.error(f"Failed to initialize AWS SNS for push: {e}")
                self.mock_mode = True
        else:
            logger.info("AWS Push Notification service running in MOCK mode")

    # ========================================================================
    # DEVICE REGISTRATION
    # ========================================================================

    async def register_device(
        self,
        device_token: str,
        platform: Platform,
        user_id: Optional[str] = None,
        custom_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Register a device for push notifications.

        Args:
            device_token: Platform-specific device token (APNS token or FCM token)
            platform: Target platform (ios, ios_sandbox, android)
            user_id: Optional user ID to associate with this device
            custom_data: Optional custom attributes for the endpoint

        Returns:
            Dict with endpoint_arn and status
        """
        if self.mock_mode:
            mock_arn = f"arn:aws:sns:{AWS_REGION}:mock:endpoint/{platform.value}/{device_token[:20]}"
            logger.info(f"[MOCK] Registered device: {platform.value}, token: {device_token[:20]}...")
            return {
                "success": True,
                "endpoint_arn": mock_arn,
                "platform": platform.value,
                "status": "mock_registered"
            }

        platform_arn = self.platform_arns.get(platform)
        if not platform_arn:
            return {
                "success": False,
                "error": f"Platform ARN not configured for {platform.value}"
            }

        try:
            # Build custom user data
            attributes = {}
            if user_id:
                attributes["UserId"] = user_id
            if custom_data:
                for key, value in custom_data.items():
                    attributes[key] = str(value)

            # Create platform endpoint
            response = self.client.create_platform_endpoint(
                PlatformApplicationArn=platform_arn,
                Token=device_token,
                CustomUserData=json.dumps({"user_id": user_id}) if user_id else "",
                Attributes=attributes if attributes else {}
            )

            endpoint_arn = response.get('EndpointArn')
            logger.info(f"Device registered: {endpoint_arn}")

            return {
                "success": True,
                "endpoint_arn": endpoint_arn,
                "platform": platform.value,
                "status": "registered"
            }

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']

            # Handle duplicate endpoint
            if error_code == 'InvalidParameter' and 'already exists' in error_message.lower():
                # Extract existing endpoint ARN and update it
                logger.info(f"Device already registered, updating endpoint")
                return await self._update_existing_endpoint(device_token, platform, user_id)

            logger.error(f"Failed to register device: {error_code} - {error_message}")
            return {
                "success": False,
                "error": error_message,
                "error_code": error_code
            }

    async def _update_existing_endpoint(
        self,
        device_token: str,
        platform: Platform,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update an existing endpoint with new token"""
        try:
            # List endpoints to find the existing one
            platform_arn = self.platform_arns.get(platform)
            response = self.client.list_endpoints_by_platform_application(
                PlatformApplicationArn=platform_arn
            )

            for endpoint in response.get('Endpoints', []):
                attrs = endpoint.get('Attributes', {})
                if attrs.get('Token') == device_token:
                    endpoint_arn = endpoint['EndpointArn']

                    # Update the endpoint to re-enable it
                    self.client.set_endpoint_attributes(
                        EndpointArn=endpoint_arn,
                        Attributes={
                            'Enabled': 'true',
                            'Token': device_token
                        }
                    )

                    return {
                        "success": True,
                        "endpoint_arn": endpoint_arn,
                        "platform": platform.value,
                        "status": "updated"
                    }

            return {
                "success": False,
                "error": "Could not find existing endpoint"
            }

        except ClientError as e:
            logger.error(f"Failed to update endpoint: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def unregister_device(self, endpoint_arn: str) -> Dict[str, Any]:
        """
        Unregister a device from push notifications.

        Args:
            endpoint_arn: The ARN of the endpoint to delete
        """
        if self.mock_mode:
            logger.info(f"[MOCK] Unregistered device: {endpoint_arn}")
            return {"success": True, "status": "mock_unregistered"}

        try:
            self.client.delete_endpoint(EndpointArn=endpoint_arn)
            logger.info(f"Device unregistered: {endpoint_arn}")
            return {"success": True, "status": "unregistered"}
        except ClientError as e:
            logger.error(f"Failed to unregister device: {e}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # SEND PUSH NOTIFICATIONS
    # ========================================================================

    async def send_push_notification(
        self,
        endpoint_arn: str,
        title: str,
        body: str,
        notification_type: NotificationType = NotificationType.SYSTEM,
        data: Optional[Dict] = None,
        badge: Optional[int] = None,
        sound: str = "default",
        category: Optional[str] = None,
        thread_id: Optional[str] = None,
        ttl: int = 86400  # 24 hours
    ) -> Dict[str, Any]:
        """
        Send a push notification to a specific device.

        Args:
            endpoint_arn: Target device endpoint ARN
            title: Notification title
            body: Notification body text
            notification_type: Type of notification for categorization
            data: Custom data payload
            badge: iOS badge count
            sound: Notification sound
            category: iOS notification category for actions
            thread_id: iOS thread ID for grouping
            ttl: Time to live in seconds
        """
        if self.mock_mode:
            logger.info(f"[MOCK PUSH] To: {endpoint_arn[:50]}..., Title: {title}, Body: {body[:50]}...")
            return {
                "success": True,
                "message_id": "MOCK_MESSAGE_ID",
                "status": "mock_sent"
            }

        try:
            # Build platform-specific payloads
            message = self._build_push_message(
                title=title,
                body=body,
                notification_type=notification_type,
                data=data,
                badge=badge,
                sound=sound,
                category=category,
                thread_id=thread_id
            )

            response = self.client.publish(
                TargetArn=endpoint_arn,
                Message=json.dumps(message),
                MessageStructure='json',
                MessageAttributes={
                    'AWS.SNS.MOBILE.APNS.TTL': {
                        'DataType': 'String',
                        'StringValue': str(ttl)
                    },
                    'AWS.SNS.MOBILE.FCM.TTL': {
                        'DataType': 'String',
                        'StringValue': str(ttl)
                    }
                }
            )

            message_id = response.get('MessageId')
            logger.info(f"Push notification sent: {message_id}")

            return {
                "success": True,
                "message_id": message_id,
                "status": "sent"
            }

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']

            # Handle disabled endpoint
            if error_code == 'EndpointDisabled':
                logger.warning(f"Endpoint disabled: {endpoint_arn}")
                return {
                    "success": False,
                    "error": "Device endpoint is disabled",
                    "error_code": error_code,
                    "should_remove": True
                }

            logger.error(f"Failed to send push: {error_code} - {error_message}")
            return {
                "success": False,
                "error": error_message,
                "error_code": error_code
            }

    def _build_push_message(
        self,
        title: str,
        body: str,
        notification_type: NotificationType,
        data: Optional[Dict] = None,
        badge: Optional[int] = None,
        sound: str = "default",
        category: Optional[str] = None,
        thread_id: Optional[str] = None
    ) -> Dict[str, str]:
        """Build platform-specific push notification payloads"""

        # Custom data payload
        custom_data = data or {}
        custom_data["notification_type"] = notification_type.value
        custom_data["timestamp"] = datetime.utcnow().isoformat()

        # APNS payload (iOS)
        apns_payload = {
            "aps": {
                "alert": {
                    "title": title,
                    "body": body
                },
                "sound": sound,
                "mutable-content": 1
            },
            **custom_data
        }

        if badge is not None:
            apns_payload["aps"]["badge"] = badge
        if category:
            apns_payload["aps"]["category"] = category
        if thread_id:
            apns_payload["aps"]["thread-id"] = thread_id

        # FCM payload (Android)
        fcm_payload = {
            "notification": {
                "title": title,
                "body": body,
                "sound": sound,
                "click_action": "OPEN_APP",
                "channel_id": f"swipesavvy_{notification_type.value}"
            },
            "data": {
                **{k: str(v) for k, v in custom_data.items()},
                "title": title,
                "body": body
            },
            "priority": "high"
        }

        return {
            "default": body,
            "APNS": json.dumps(apns_payload),
            "APNS_SANDBOX": json.dumps(apns_payload),
            "GCM": json.dumps(fcm_payload)
        }

    # ========================================================================
    # BATCH & TOPIC NOTIFICATIONS
    # ========================================================================

    async def send_to_multiple_devices(
        self,
        endpoint_arns: List[str],
        title: str,
        body: str,
        notification_type: NotificationType = NotificationType.SYSTEM,
        data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Send push notification to multiple devices.

        Returns aggregated results.
        """
        results = {
            "total": len(endpoint_arns),
            "success": 0,
            "failed": 0,
            "disabled": 0,
            "details": []
        }

        for endpoint_arn in endpoint_arns:
            result = await self.send_push_notification(
                endpoint_arn=endpoint_arn,
                title=title,
                body=body,
                notification_type=notification_type,
                data=data
            )

            if result.get("success"):
                results["success"] += 1
            else:
                results["failed"] += 1
                if result.get("should_remove"):
                    results["disabled"] += 1

            results["details"].append({
                "endpoint": endpoint_arn,
                **result
            })

        return results

    async def create_topic(self, topic_name: str, display_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Create an SNS topic for broadcast notifications.

        Args:
            topic_name: Unique topic name (e.g., "swipesavvy-announcements")
            display_name: Display name for SMS subscriptions
        """
        if self.mock_mode:
            mock_arn = f"arn:aws:sns:{AWS_REGION}:mock:topic/{topic_name}"
            return {"success": True, "topic_arn": mock_arn}

        try:
            attributes = {}
            if display_name:
                attributes['DisplayName'] = display_name

            response = self.client.create_topic(
                Name=topic_name,
                Attributes=attributes
            )

            topic_arn = response.get('TopicArn')
            logger.info(f"Topic created: {topic_arn}")

            return {"success": True, "topic_arn": topic_arn}

        except ClientError as e:
            logger.error(f"Failed to create topic: {e}")
            return {"success": False, "error": str(e)}

    async def subscribe_to_topic(self, topic_arn: str, endpoint_arn: str) -> Dict[str, Any]:
        """Subscribe a device endpoint to a topic for broadcast notifications."""
        if self.mock_mode:
            return {"success": True, "subscription_arn": "mock_subscription"}

        try:
            response = self.client.subscribe(
                TopicArn=topic_arn,
                Protocol='application',
                Endpoint=endpoint_arn
            )

            subscription_arn = response.get('SubscriptionArn')
            return {"success": True, "subscription_arn": subscription_arn}

        except ClientError as e:
            logger.error(f"Failed to subscribe to topic: {e}")
            return {"success": False, "error": str(e)}

    async def publish_to_topic(
        self,
        topic_arn: str,
        title: str,
        body: str,
        notification_type: NotificationType = NotificationType.MARKETING,
        data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Publish a push notification to all subscribers of a topic.

        Use this for announcements and marketing broadcasts.
        """
        if self.mock_mode:
            logger.info(f"[MOCK TOPIC PUSH] Topic: {topic_arn}, Title: {title}")
            return {"success": True, "message_id": "MOCK_TOPIC_MESSAGE"}

        try:
            message = self._build_push_message(
                title=title,
                body=body,
                notification_type=notification_type,
                data=data
            )

            response = self.client.publish(
                TopicArn=topic_arn,
                Message=json.dumps(message),
                MessageStructure='json'
            )

            return {
                "success": True,
                "message_id": response.get('MessageId')
            }

        except ClientError as e:
            logger.error(f"Failed to publish to topic: {e}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # NOTIFICATION TEMPLATES
    # ========================================================================

    async def send_transaction_notification(
        self,
        endpoint_arn: str,
        merchant: str,
        amount: float,
        cashback: float,
        transaction_id: str
    ) -> Dict[str, Any]:
        """Send transaction receipt push notification"""
        return await self.send_push_notification(
            endpoint_arn=endpoint_arn,
            title="Transaction Complete",
            body=f"${amount:.2f} at {merchant}. You earned ${cashback:.2f} cashback!",
            notification_type=NotificationType.TRANSACTION,
            data={
                "transaction_id": transaction_id,
                "merchant": merchant,
                "amount": str(amount),
                "cashback": str(cashback),
                "action": "view_transaction"
            },
            sound="transaction.wav"
        )

    async def send_cashback_notification(
        self,
        endpoint_arn: str,
        amount: float,
        merchant: str,
        total_balance: float
    ) -> Dict[str, Any]:
        """Send cashback earned push notification"""
        return await self.send_push_notification(
            endpoint_arn=endpoint_arn,
            title="Cashback Earned!",
            body=f"You earned ${amount:.2f} at {merchant}. Total: ${total_balance:.2f}",
            notification_type=NotificationType.CASHBACK,
            data={
                "amount": str(amount),
                "merchant": merchant,
                "total_balance": str(total_balance),
                "action": "view_rewards"
            },
            badge=1,
            sound="cashback.wav"
        )

    async def send_security_alert(
        self,
        endpoint_arn: str,
        alert_type: str,
        details: str
    ) -> Dict[str, Any]:
        """Send security alert push notification"""
        titles = {
            "new_login": "New Login Detected",
            "new_device": "New Device",
            "suspicious_activity": "Security Alert",
            "password_changed": "Password Changed"
        }

        return await self.send_push_notification(
            endpoint_arn=endpoint_arn,
            title=titles.get(alert_type, "Security Alert"),
            body=details,
            notification_type=NotificationType.SECURITY,
            data={
                "alert_type": alert_type,
                "action": "view_security"
            },
            sound="alert.wav",
            category="SECURITY_ALERT"
        )

    async def send_chat_notification(
        self,
        endpoint_arn: str,
        sender_name: str,
        message_preview: str,
        conversation_id: str
    ) -> Dict[str, Any]:
        """Send chat message push notification"""
        return await self.send_push_notification(
            endpoint_arn=endpoint_arn,
            title=sender_name,
            body=message_preview[:100],
            notification_type=NotificationType.CHAT,
            data={
                "conversation_id": conversation_id,
                "action": "open_chat"
            },
            thread_id=f"chat_{conversation_id}",
            category="CHAT_MESSAGE"
        )

    async def send_promotional_notification(
        self,
        endpoint_arn: str,
        title: str,
        body: str,
        offer_id: Optional[str] = None,
        deep_link: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send promotional push notification"""
        return await self.send_push_notification(
            endpoint_arn=endpoint_arn,
            title=title,
            body=body,
            notification_type=NotificationType.MARKETING,
            data={
                "offer_id": offer_id,
                "deep_link": deep_link,
                "action": "view_offer"
            }
        )


# Singleton instance
aws_push_service = AWSPushNotificationService()


# Convenience functions
async def register_device(device_token: str, platform: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Register a device for push notifications"""
    platform_enum = Platform(platform.lower())
    return await aws_push_service.register_device(device_token, platform_enum, user_id)


async def send_push(endpoint_arn: str, title: str, body: str, data: Optional[Dict] = None) -> Dict[str, Any]:
    """Send a push notification"""
    return await aws_push_service.send_push_notification(endpoint_arn, title, body, data=data)


async def send_transaction_push(endpoint_arn: str, merchant: str, amount: float, cashback: float, tx_id: str):
    """Send transaction notification"""
    return await aws_push_service.send_transaction_notification(endpoint_arn, merchant, amount, cashback, tx_id)
