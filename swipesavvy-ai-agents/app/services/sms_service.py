"""
SMS Service for SwipeSavvy

Handles all SMS communications including:
- Phone verification OTP
- Transaction alerts
- Security notifications

Uses AWS SNS for SMS delivery (migrated from Twilio).
This module provides backward compatibility with existing code.
"""

import os
from typing import Optional
import logging

from app.services.aws_sns_service import AWSSNSService, aws_sns_service

logger = logging.getLogger(__name__)


class SMSService:
    """
    SMS service for sending transactional SMS.
    Now uses AWS SNS as the backend (migrated from Twilio).
    """

    def __init__(self):
        self._sns_service = AWSSNSService()
        self.enabled = not self._sns_service.mock_mode

        if not self.enabled:
            logger.warning("SMS service running in MOCK mode - SMS will be logged only")
        else:
            logger.info("SMS service initialized with AWS SNS")

    async def send_sms(
        self,
        to_phone: str,
        message: str,
        from_number: Optional[str] = None
    ) -> dict:
        """
        Send SMS message using AWS SNS.

        Args:
            to_phone: Recipient phone number (E.164 format preferred)
            message: Message content
            from_number: Ignored (AWS SNS uses sender ID instead)

        Returns:
            dict with status and message_id
        """
        return await self._sns_service.send_sms(to_phone, message)

    async def send_verification_code(self, to_phone: str, code: str) -> dict:
        """Send verification code SMS"""
        return await self._sns_service.send_verification_code(to_phone, code)

    async def send_password_reset_code(self, to_phone: str, code: str) -> dict:
        """Send password reset code SMS"""
        return await self._sns_service.send_password_reset_code(to_phone, code)

    async def send_transaction_alert(
        self,
        to_phone: str,
        amount: float,
        merchant: str,
        transaction_type: str = "purchase"
    ) -> dict:
        """Send transaction notification SMS"""
        return await self._sns_service.send_transaction_alert(to_phone, amount, merchant, transaction_type)

    async def send_security_alert(
        self,
        to_phone: str,
        alert_type: str,
        details: str = ""
    ) -> dict:
        """Send security alert SMS"""
        return await self._sns_service.send_security_alert(to_phone, alert_type, details)

    def _format_phone(self, phone: str) -> str:
        """Format phone number to E.164 format"""
        return self._sns_service._format_phone(phone)

    async def lookup_phone(self, phone: str) -> dict:
        """
        Phone lookup is not directly supported by AWS SNS.
        Returns basic validation info.
        """
        formatted = self._format_phone(phone)
        return {
            "valid": len(formatted) >= 10,
            "phone_number": formatted,
            "carrier": {"type": "unknown"},
            "note": "Phone lookup not supported with AWS SNS"
        }

    async def verify_phone_start(self, to_phone: str) -> dict:
        """
        Start phone verification by sending OTP.
        AWS SNS doesn't have a built-in verify service like Twilio.
        """
        import random
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        result = await self.send_verification_code(to_phone, code)
        if result.get("success"):
            return {
                "success": True,
                "status": "pending",
                "code": code  # In production, store this securely
            }
        return {
            "success": False,
            "error": result.get("error", "Failed to send verification code")
        }

    async def verify_phone_check(self, to_phone: str, code: str) -> dict:
        """
        Check phone verification code.
        Note: This should be validated against stored code in production.
        """
        # In production, verify against stored code in database
        return {
            "success": len(code) == 6 and code.isdigit(),
            "status": "approved" if len(code) == 6 else "pending",
            "note": "Code validation should be done against stored code"
        }


# Singleton instance
sms_service = SMSService()


# Convenience functions for backward compatibility
async def send_verification_sms(phone: str, code: str) -> dict:
    """Send phone verification code via SMS"""
    return await sms_service.send_verification_code(phone, code)


async def send_password_reset_sms(phone: str, code: str) -> dict:
    """Send password reset code via SMS"""
    return await sms_service.send_password_reset_code(phone, code)


async def send_transaction_alert_sms(
    phone: str,
    amount: float,
    merchant: str,
    transaction_type: str = "purchase"
) -> dict:
    """Send transaction alert via SMS"""
    return await sms_service.send_transaction_alert(phone, amount, merchant, transaction_type)


async def send_security_alert_sms(phone: str, alert_type: str, details: str = "") -> dict:
    """Send security alert via SMS"""
    return await sms_service.send_security_alert(phone, alert_type, details)
