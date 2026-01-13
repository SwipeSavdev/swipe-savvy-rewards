"""
AWS SNS SMS Service for SwipeSavvy

Handles all SMS communications using AWS Simple Notification Service (SNS):
- Phone verification OTP
- Transaction alerts
- Security notifications
- Login verification codes
- KYC status updates
- Promotional messages

Replaces Twilio with AWS SNS for cost-effective, scalable SMS delivery.
"""

import os
import logging
from typing import Optional

import boto3
from botocore.exceptions import ClientError

from app.services.notification_templates import SMSTemplates

logger = logging.getLogger(__name__)

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
SNS_SENDER_ID = os.getenv("SNS_SENDER_ID", "SwipeSavvy")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# For development/testing, enable mock mode
# In production (ECS), use IAM role - no access keys needed
# Set MOCK_SMS=true explicitly to enable mock mode
MOCK_SMS = os.getenv("MOCK_SMS", "true" if ENVIRONMENT == "development" else "false").lower() == "true"


class AWSSNSService:
    """SMS service using AWS Simple Notification Service"""

    def __init__(self):
        self.sender_id = SNS_SENDER_ID
        self.mock_mode = MOCK_SMS
        self.client = None

        if not self.mock_mode:
            try:
                # Use explicit credentials if provided (local dev), otherwise use IAM role (ECS)
                if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
                    self.client = boto3.client(
                        'sns',
                        region_name=AWS_REGION,
                        aws_access_key_id=AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
                    )
                    logger.info(f"AWS SNS service initialized with explicit credentials in region: {AWS_REGION}")
                else:
                    # ECS/Lambda: Use IAM role credentials automatically
                    self.client = boto3.client('sns', region_name=AWS_REGION)
                    logger.info(f"AWS SNS service initialized with IAM role in region: {AWS_REGION}")
            except Exception as e:
                logger.error(f"Failed to initialize AWS SNS client: {e}")
                self.mock_mode = True
        else:
            logger.info("AWS SNS service running in MOCK mode - SMS will be logged only")

    async def send_sms(
        self,
        to_phone: str,
        message: str,
        message_type: str = "Transactional"
    ) -> dict:
        """
        Send SMS message using AWS SNS.

        Args:
            to_phone: Recipient phone number (E.164 format preferred)
            message: Message content (max 160 characters for single SMS)
            message_type: "Transactional" (high priority) or "Promotional"

        Returns:
            dict with status and message_id
        """
        # Format phone number to E.164
        formatted_phone = self._format_phone(to_phone)

        if self.mock_mode:
            logger.info(f"[MOCK SMS] To: {formatted_phone}, Message: {message}")
            return {
                "success": True,
                "message_id": "MOCK_MESSAGE_ID",
                "status": "simulated",
                "to": formatted_phone
            }

        try:
            # Set SMS attributes for reliable delivery
            response = self.client.publish(
                PhoneNumber=formatted_phone,
                Message=message,
                MessageAttributes={
                    'AWS.SNS.SMS.SenderID': {
                        'DataType': 'String',
                        'StringValue': self.sender_id
                    },
                    'AWS.SNS.SMS.SMSType': {
                        'DataType': 'String',
                        'StringValue': message_type
                    }
                }
            )

            message_id = response.get('MessageId')
            logger.info(f"SMS sent successfully to {formatted_phone}, MessageId: {message_id}")

            return {
                "success": True,
                "message_id": message_id,
                "status": "sent",
                "to": formatted_phone
            }

        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"AWS SNS error ({error_code}): {error_message}")
            return {
                "success": False,
                "error": error_message,
                "error_code": error_code,
                "to": formatted_phone
            }
        except Exception as e:
            logger.error(f"Failed to send SMS to {formatted_phone}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "to": formatted_phone
            }

    async def send_verification_code(self, to_phone: str, code: str) -> dict:
        """Send verification code SMS using template"""
        message = SMSTemplates.verification_code(code)
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_login_otp(self, to_phone: str, code: str) -> dict:
        """Send login OTP code SMS using template"""
        message = SMSTemplates.login_code(code)
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_password_reset_code(self, to_phone: str, code: str) -> dict:
        """Send password reset code SMS using template"""
        message = SMSTemplates.password_reset_code(code)
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_transaction_alert(
        self,
        to_phone: str,
        amount: float,
        merchant: str,
        cashback: float = 0.0
    ) -> dict:
        """Send transaction notification SMS using template"""
        message = SMSTemplates.transaction_alert(merchant, amount, cashback)
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_large_transaction_alert(
        self,
        to_phone: str,
        merchant: str,
        amount: float
    ) -> dict:
        """Send large transaction security alert SMS"""
        message = SMSTemplates.large_transaction_alert(merchant, amount)
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_security_alert(
        self,
        to_phone: str,
        alert_type: str,
        details: str = ""
    ) -> dict:
        """Send security alert SMS using templates"""
        if alert_type == "new_device":
            message = SMSTemplates.new_device_alert(details or "Unknown device")
        elif alert_type == "suspicious_activity":
            message = SMSTemplates.suspicious_activity_alert()
        elif alert_type == "account_locked":
            message = SMSTemplates.account_locked()
        else:
            # Fallback for legacy alert types
            messages = {
                "new_login": "SwipeSavvy: New login detected on your account. If this wasn't you, secure your account immediately.",
                "password_changed": "SwipeSavvy: Your password was just changed. If you didn't do this, contact support immediately.",
            }
            message = messages.get(alert_type, f"SwipeSavvy Security Alert: {details}")

        return await self.send_sms(to_phone, message, "Transactional")

    async def send_promotional_sms(
        self,
        to_phone: str,
        message: str
    ) -> dict:
        """Send promotional SMS (lower priority, lower cost)"""
        return await self.send_sms(to_phone, message, "Promotional")

    # ========================================================================
    # NEW TEMPLATE-BASED SMS METHODS
    # ========================================================================

    async def send_cashback_milestone_sms(self, to_phone: str, amount: float) -> dict:
        """Send cashback milestone notification SMS"""
        message = SMSTemplates.cashback_milestone(amount)
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_withdrawal_initiated_sms(self, to_phone: str, amount: float) -> dict:
        """Send withdrawal initiated notification SMS"""
        message = SMSTemplates.withdrawal_initiated(amount)
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_withdrawal_completed_sms(self, to_phone: str, amount: float) -> dict:
        """Send withdrawal completed notification SMS"""
        message = SMSTemplates.withdrawal_completed(amount)
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_kyc_approved_sms(self, to_phone: str) -> dict:
        """Send KYC approval notification SMS"""
        message = SMSTemplates.kyc_approved()
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_kyc_action_required_sms(self, to_phone: str) -> dict:
        """Send KYC action required notification SMS"""
        message = SMSTemplates.kyc_action_required()
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_promotional_offer_sms(
        self,
        to_phone: str,
        offer: str,
        code: Optional[str] = None
    ) -> dict:
        """Send promotional offer SMS using template"""
        message = SMSTemplates.promotional_offer(offer, code)
        return await self.send_sms(to_phone, message, "Promotional")

    async def send_referral_bonus_sms(
        self,
        to_phone: str,
        amount: float,
        friend_name: str
    ) -> dict:
        """Send referral bonus notification SMS"""
        message = SMSTemplates.referral_bonus(amount, friend_name)
        return await self.send_sms(to_phone, message, "Transactional")

    async def send_limited_time_offer_sms(
        self,
        to_phone: str,
        offer: str,
        expires: str
    ) -> dict:
        """Send limited time offer SMS"""
        message = SMSTemplates.limited_time_offer(offer, expires)
        return await self.send_sms(to_phone, message, "Promotional")

    def _format_phone(self, phone: str) -> str:
        """Format phone number to E.164 format for AWS SNS"""
        if not phone:
            return phone

        # Remove all non-digit characters except leading +
        cleaned = phone.strip()
        if cleaned.startswith('+'):
            digits = '+' + ''.join(filter(str.isdigit, cleaned[1:]))
        else:
            digits = ''.join(filter(str.isdigit, cleaned))

        # Add US country code if not present
        if len(digits) == 10:
            return f"+1{digits}"
        elif len(digits) == 11 and digits.startswith('1'):
            return f"+{digits}"
        elif not digits.startswith('+'):
            return f"+{digits}"

        return digits

    def get_sms_attributes(self) -> dict:
        """Get current SNS SMS attributes and settings"""
        if self.mock_mode:
            return {
                "monthly_spend_limit": "1.00",
                "default_sms_type": "Transactional",
                "mock_mode": True
            }

        try:
            response = self.client.get_sms_attributes(
                attributes=['MonthlySpendLimit', 'DefaultSMSType', 'UsageReportS3Bucket']
            )
            return response.get('attributes', {})
        except ClientError as e:
            logger.error(f"Failed to get SMS attributes: {e}")
            return {}

    def set_sms_attributes(
        self,
        monthly_spend_limit: Optional[str] = None,
        default_sms_type: Optional[str] = None
    ) -> bool:
        """
        Set SNS SMS attributes.

        Args:
            monthly_spend_limit: Maximum monthly SMS spend in USD
            default_sms_type: "Transactional" or "Promotional"
        """
        if self.mock_mode:
            logger.info("[MOCK] Would set SMS attributes")
            return True

        try:
            attributes = {}
            if monthly_spend_limit:
                attributes['MonthlySpendLimit'] = monthly_spend_limit
            if default_sms_type:
                attributes['DefaultSMSType'] = default_sms_type

            if attributes:
                self.client.set_sms_attributes(attributes=attributes)
                logger.info(f"SMS attributes updated: {attributes}")
            return True
        except ClientError as e:
            logger.error(f"Failed to set SMS attributes: {e}")
            return False

    async def check_phone_number_opted_out(self, phone: str) -> bool:
        """Check if a phone number has opted out of receiving SMS"""
        if self.mock_mode:
            return False

        try:
            formatted_phone = self._format_phone(phone)
            response = self.client.check_if_phone_number_is_opted_out(
                phoneNumber=formatted_phone
            )
            return response.get('isOptedOut', False)
        except ClientError as e:
            logger.error(f"Failed to check opt-out status: {e}")
            return False

    async def opt_in_phone_number(self, phone: str) -> bool:
        """Opt a phone number back in to receiving SMS"""
        if self.mock_mode:
            logger.info(f"[MOCK] Would opt in phone: {phone}")
            return True

        try:
            formatted_phone = self._format_phone(phone)
            self.client.opt_in_phone_number(phoneNumber=formatted_phone)
            logger.info(f"Phone number opted in: {formatted_phone}")
            return True
        except ClientError as e:
            logger.error(f"Failed to opt in phone number: {e}")
            return False


# Singleton instance
aws_sns_service = AWSSNSService()


# Convenience functions for backward compatibility with existing code
async def send_verification_sms(phone: str, code: str) -> dict:
    """Send phone verification code via SMS"""
    return await aws_sns_service.send_verification_code(phone, code)


async def send_login_otp_sms(phone: str, code: str) -> dict:
    """Send login OTP code via SMS"""
    return await aws_sns_service.send_login_otp(phone, code)


async def send_password_reset_sms(phone: str, code: str) -> dict:
    """Send password reset code via SMS"""
    return await aws_sns_service.send_password_reset_code(phone, code)


async def send_transaction_alert_sms(
    phone: str,
    amount: float,
    merchant: str,
    transaction_type: str = "purchase"
) -> dict:
    """Send transaction alert via SMS"""
    return await aws_sns_service.send_transaction_alert(phone, amount, merchant, transaction_type)


async def send_security_alert_sms(phone: str, alert_type: str, details: str = "") -> dict:
    """Send security alert via SMS"""
    return await aws_sns_service.send_security_alert(phone, alert_type, details)
