"""
SMS Service using Twilio

Handles:
- Phone verification OTP
- Transaction alerts
- Security notifications
"""

import os
from typing import Optional
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException


class SMSService:
    """SMS service using Twilio"""

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER", "+15551234567")
        self.enabled = bool(self.account_sid and self.auth_token)

        if self.enabled:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            print("WARNING: Twilio not configured. SMS will be simulated.")

    async def send_sms(
        self,
        to_phone: str,
        message: str,
        from_number: Optional[str] = None
    ) -> dict:
        """
        Send SMS message.

        Args:
            to_phone: Recipient phone number (E.164 format preferred)
            message: Message content
            from_number: Optional sender number override

        Returns:
            dict with status and message_sid
        """
        # Format phone number to E.164
        formatted_phone = self._format_phone(to_phone)

        if not self.enabled:
            # Simulate SMS in development
            print(f"[SMS SIMULATED] To: {formatted_phone}, Message: {message}")
            return {
                "success": True,
                "message_sid": "SIMULATED_SID",
                "status": "simulated",
                "to": formatted_phone
            }

        try:
            message_obj = self.client.messages.create(
                body=message,
                from_=from_number or self.from_number,
                to=formatted_phone
            )

            return {
                "success": True,
                "message_sid": message_obj.sid,
                "status": message_obj.status,
                "to": formatted_phone
            }

        except TwilioRestException as e:
            print(f"Twilio error: {e}")
            return {
                "success": False,
                "error": str(e),
                "error_code": e.code,
                "to": formatted_phone
            }

    async def send_verification_code(self, to_phone: str, code: str) -> dict:
        """Send verification code SMS"""
        message = f"Your SwipeSavvy verification code is: {code}. This code expires in 10 minutes. Do not share this code with anyone."
        return await self.send_sms(to_phone, message)

    async def send_password_reset_code(self, to_phone: str, code: str) -> dict:
        """Send password reset code SMS"""
        message = f"Your SwipeSavvy password reset code is: {code}. This code expires in 15 minutes. If you didn't request this, please ignore."
        return await self.send_sms(to_phone, message)

    async def send_transaction_alert(
        self,
        to_phone: str,
        amount: float,
        merchant: str,
        transaction_type: str = "purchase"
    ) -> dict:
        """Send transaction notification SMS"""
        message = f"SwipeSavvy: ${amount:.2f} {transaction_type} at {merchant}. If you didn't make this transaction, contact us immediately."
        return await self.send_sms(to_phone, message)

    async def send_security_alert(
        self,
        to_phone: str,
        alert_type: str,
        details: str = ""
    ) -> dict:
        """Send security alert SMS"""
        messages = {
            "new_login": "SwipeSavvy: New login detected on your account. If this wasn't you, secure your account immediately.",
            "password_changed": "SwipeSavvy: Your password was just changed. If you didn't do this, contact support immediately.",
            "suspicious_activity": f"SwipeSavvy: Suspicious activity detected on your account. {details}",
            "account_locked": "SwipeSavvy: Your account has been locked due to multiple failed login attempts.",
        }

        message = messages.get(alert_type, f"SwipeSavvy Security Alert: {details}")
        return await self.send_sms(to_phone, message)

    def _format_phone(self, phone: str) -> str:
        """Format phone number to E.164 format"""
        # Remove all non-digit characters
        digits = ''.join(filter(str.isdigit, phone))

        # Add US country code if not present
        if len(digits) == 10:
            return f"+1{digits}"
        elif len(digits) == 11 and digits.startswith('1'):
            return f"+{digits}"
        elif not phone.startswith('+'):
            return f"+{digits}"

        return phone

    async def lookup_phone(self, phone: str) -> dict:
        """
        Lookup phone number details using Twilio Lookup API.
        Useful for validation and carrier info.
        """
        if not self.enabled:
            return {
                "valid": True,
                "phone_number": self._format_phone(phone),
                "carrier": {"type": "mobile"},
                "simulated": True
            }

        try:
            formatted = self._format_phone(phone)
            phone_number = self.client.lookups.v2.phone_numbers(formatted).fetch(
                fields="line_type_intelligence"
            )

            return {
                "valid": phone_number.valid,
                "phone_number": phone_number.phone_number,
                "country_code": phone_number.country_code,
                "national_format": phone_number.national_format,
                "carrier": phone_number.line_type_intelligence or {}
            }

        except TwilioRestException as e:
            return {
                "valid": False,
                "error": str(e),
                "phone_number": phone
            }

    async def verify_phone_start(self, to_phone: str) -> dict:
        """
        Start phone verification using Twilio Verify service.
        Alternative to sending custom codes.
        """
        if not self.enabled:
            return {
                "success": True,
                "status": "pending",
                "simulated": True
            }

        verify_service_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
        if not verify_service_sid:
            # Fall back to custom SMS
            return {"success": False, "error": "Verify service not configured"}

        try:
            verification = self.client.verify.v2.services(
                verify_service_sid
            ).verifications.create(
                to=self._format_phone(to_phone),
                channel='sms'
            )

            return {
                "success": True,
                "status": verification.status,
                "sid": verification.sid
            }

        except TwilioRestException as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def verify_phone_check(self, to_phone: str, code: str) -> dict:
        """
        Check phone verification code using Twilio Verify service.
        """
        if not self.enabled:
            # Simulate verification (accept any 6-digit code in dev)
            return {
                "success": len(code) == 6 and code.isdigit(),
                "status": "approved" if len(code) == 6 else "pending",
                "simulated": True
            }

        verify_service_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
        if not verify_service_sid:
            return {"success": False, "error": "Verify service not configured"}

        try:
            verification_check = self.client.verify.v2.services(
                verify_service_sid
            ).verification_checks.create(
                to=self._format_phone(to_phone),
                code=code
            )

            return {
                "success": verification_check.status == "approved",
                "status": verification_check.status,
                "sid": verification_check.sid
            }

        except TwilioRestException as e:
            return {
                "success": False,
                "error": str(e)
            }
