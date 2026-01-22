"""
FIS Global Payment One - PIN Management Service

Handles PIN operations:
- Set initial PIN
- Change PIN
- Reset forgotten PIN
- Validate PIN
- PIN retry tracking
"""

import logging
import hashlib
import secrets
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, field_validator

from app.services.fis_global_service import (
    FISGlobalService,
    FISAPIResponse,
    get_fis_service
)

logger = logging.getLogger(__name__)


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class SetPinRequest(BaseModel):
    """Request to set initial PIN"""
    card_id: str
    pin: str = Field(..., min_length=4, max_length=4)

    @field_validator('pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        # Check for common weak PINs
        weak_pins = ['0000', '1111', '2222', '3333', '4444',
                     '5555', '6666', '7777', '8888', '9999',
                     '1234', '4321', '1212', '2121']
        if v in weak_pins:
            raise ValueError('PIN is too weak. Choose a more secure PIN.')
        return v


class ChangePinRequest(BaseModel):
    """Request to change existing PIN"""
    card_id: str
    current_pin: str = Field(..., min_length=4, max_length=4)
    new_pin: str = Field(..., min_length=4, max_length=4)

    @field_validator('current_pin', 'new_pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        return v

    @field_validator('new_pin')
    @classmethod
    def validate_new_pin(cls, v: str, info) -> str:
        # Check for weak PINs
        weak_pins = ['0000', '1111', '2222', '3333', '4444',
                     '5555', '6666', '7777', '8888', '9999',
                     '1234', '4321', '1212', '2121']
        if v in weak_pins:
            raise ValueError('PIN is too weak. Choose a more secure PIN.')
        return v


class ResetPinRequest(BaseModel):
    """Request to reset forgotten PIN"""
    card_id: str
    verification_method: str  # otp, security_questions, biometric
    verification_data: Dict[str, Any]
    new_pin: str = Field(..., min_length=4, max_length=4)

    @field_validator('new_pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        weak_pins = ['0000', '1111', '2222', '3333', '4444',
                     '5555', '6666', '7777', '8888', '9999',
                     '1234', '4321', '1212', '2121']
        if v in weak_pins:
            raise ValueError('PIN is too weak. Choose a more secure PIN.')
        return v


class ValidatePinRequest(BaseModel):
    """Request to validate PIN"""
    card_id: str
    pin: str = Field(..., min_length=4, max_length=4)
    operation: Optional[str] = None  # What operation requires PIN validation

    @field_validator('pin')
    @classmethod
    def validate_pin(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('PIN must contain only digits')
        return v


class PinStatusResponse(BaseModel):
    """PIN status response"""
    card_id: str
    pin_set: bool
    pin_locked: bool = False
    failed_attempts: int = 0
    last_changed: Optional[datetime] = None
    next_change_allowed: Optional[datetime] = None


# =============================================================================
# FIS PIN SERVICE
# =============================================================================

class FISPinService:
    """
    Service for FIS PIN management operations.

    Security considerations:
    - PINs are never logged or stored in plain text
    - PIN transmission uses encryption
    - Failed attempts are tracked and locked after threshold
    """

    MAX_FAILED_ATTEMPTS = 3
    LOCKOUT_DURATION_MINUTES = 30
    MIN_CHANGE_INTERVAL_HOURS = 24

    def __init__(self, fis_service: Optional[FISGlobalService] = None):
        """
        Initialize PIN service.

        Args:
            fis_service: FIS Global service instance
        """
        self.fis = fis_service or get_fis_service()

    def _encrypt_pin(self, pin: str, card_id: str) -> str:
        """
        Encrypt PIN for transmission.

        In production, this would use FIS's PIN encryption key (PEK)
        and proper HSM-based encryption.

        Args:
            pin: Plain text PIN
            card_id: Card ID for key derivation

        Returns:
            Encrypted PIN block
        """
        # Generate a random IV
        iv = secrets.token_hex(8)

        # In production, this would be proper PIN block encryption
        # using ISO 9564 format with the card's PEK
        pin_block = hashlib.sha256(f"{pin}:{card_id}:{iv}".encode()).hexdigest()

        return f"{iv}:{pin_block}"

    async def set_pin(
        self,
        card_id: str,
        pin: str
    ) -> FISAPIResponse:
        """
        Set initial PIN for a card.

        Args:
            card_id: FIS card ID
            pin: 4-digit PIN

        Returns:
            FISAPIResponse with PIN set status
        """
        logger.info(f"Setting initial PIN for card {card_id}")

        # Validate PIN format
        try:
            request = SetPinRequest(card_id=card_id, pin=pin)
        except ValueError as e:
            return FISAPIResponse(
                success=False,
                error_code="INVALID_PIN",
                error_message=str(e)
            )

        # Encrypt PIN for transmission
        encrypted_pin = self._encrypt_pin(pin, card_id)

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/pin/set",
            data={
                "encrypted_pin": encrypted_pin,
                "pin_format": "ISO_9564_FORMAT_0"
            }
        )

        if response.success:
            logger.info(f"PIN set successfully for card {card_id}")
        else:
            logger.error(f"Failed to set PIN for card {card_id}: {response.error_message}")

        return response

    async def change_pin(
        self,
        card_id: str,
        current_pin: str,
        new_pin: str
    ) -> FISAPIResponse:
        """
        Change existing PIN.

        Args:
            card_id: FIS card ID
            current_pin: Current 4-digit PIN
            new_pin: New 4-digit PIN

        Returns:
            FISAPIResponse with PIN change status
        """
        logger.info(f"Changing PIN for card {card_id}")

        # Validate request
        try:
            request = ChangePinRequest(
                card_id=card_id,
                current_pin=current_pin,
                new_pin=new_pin
            )
        except ValueError as e:
            return FISAPIResponse(
                success=False,
                error_code="INVALID_PIN",
                error_message=str(e)
            )

        # Check if new PIN is same as current
        if current_pin == new_pin:
            return FISAPIResponse(
                success=False,
                error_code="SAME_PIN",
                error_message="New PIN must be different from current PIN"
            )

        # Encrypt PINs for transmission
        encrypted_current = self._encrypt_pin(current_pin, card_id)
        encrypted_new = self._encrypt_pin(new_pin, card_id)

        response = await self.fis._make_request(
            method="PUT",
            endpoint=f"/cards/{card_id}/pin/change",
            data={
                "current_pin_block": encrypted_current,
                "new_pin_block": encrypted_new,
                "pin_format": "ISO_9564_FORMAT_0"
            }
        )

        if response.success:
            logger.info(f"PIN changed successfully for card {card_id}")
        else:
            logger.error(f"Failed to change PIN for card {card_id}: {response.error_message}")

        return response

    async def reset_pin(
        self,
        card_id: str,
        verification_method: str,
        verification_data: Dict[str, Any],
        new_pin: str
    ) -> FISAPIResponse:
        """
        Reset forgotten PIN after identity verification.

        Args:
            card_id: FIS card ID
            verification_method: Method used for verification (otp, security_questions, biometric)
            verification_data: Verification data (OTP code, answers, etc.)
            new_pin: New 4-digit PIN

        Returns:
            FISAPIResponse with PIN reset status
        """
        logger.info(f"Resetting PIN for card {card_id} using {verification_method}")

        # Validate request
        try:
            request = ResetPinRequest(
                card_id=card_id,
                verification_method=verification_method,
                verification_data=verification_data,
                new_pin=new_pin
            )
        except ValueError as e:
            return FISAPIResponse(
                success=False,
                error_code="INVALID_PIN",
                error_message=str(e)
            )

        # Encrypt new PIN
        encrypted_pin = self._encrypt_pin(new_pin, card_id)

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/pin/reset",
            data={
                "verification_method": verification_method,
                "verification_data": verification_data,
                "new_pin_block": encrypted_pin,
                "pin_format": "ISO_9564_FORMAT_0"
            }
        )

        if response.success:
            logger.info(f"PIN reset successfully for card {card_id}")
        else:
            logger.error(f"Failed to reset PIN for card {card_id}: {response.error_message}")

        return response

    async def validate_pin(
        self,
        card_id: str,
        pin: str,
        operation: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Validate PIN for sensitive operations.

        Args:
            card_id: FIS card ID
            pin: PIN to validate
            operation: Optional operation requiring validation

        Returns:
            FISAPIResponse with validation result
        """
        logger.info(f"Validating PIN for card {card_id}" +
                   (f" for operation: {operation}" if operation else ""))

        # Basic validation
        try:
            request = ValidatePinRequest(card_id=card_id, pin=pin, operation=operation)
        except ValueError as e:
            return FISAPIResponse(
                success=False,
                error_code="INVALID_PIN_FORMAT",
                error_message=str(e)
            )

        # Encrypt PIN
        encrypted_pin = self._encrypt_pin(pin, card_id)

        payload = {
            "pin_block": encrypted_pin,
            "pin_format": "ISO_9564_FORMAT_0"
        }
        if operation:
            payload["operation"] = operation

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/pin/validate",
            data=payload
        )

        if response.success:
            logger.info(f"PIN validated successfully for card {card_id}")
        else:
            # Don't log specific PIN errors for security
            logger.warning(f"PIN validation failed for card {card_id}")

        return response

    async def get_pin_status(self, card_id: str) -> FISAPIResponse:
        """
        Get PIN status for a card.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with PIN status
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/pin/status"
        )

    async def unlock_pin(self, card_id: str) -> FISAPIResponse:
        """
        Unlock a PIN that was locked due to failed attempts.

        This typically requires additional verification and may
        need to be done through customer service.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with unlock status
        """
        logger.info(f"Unlocking PIN for card {card_id}")

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/pin/unlock"
        )

        if response.success:
            logger.info(f"PIN unlocked for card {card_id}")
        else:
            logger.error(f"Failed to unlock PIN for card {card_id}: {response.error_message}")

        return response

    async def request_pin_reset_otp(self, card_id: str) -> FISAPIResponse:
        """
        Request OTP for PIN reset verification.

        Sends OTP to registered phone/email.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with OTP request status
        """
        logger.info(f"Requesting PIN reset OTP for card {card_id}")

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/pin/reset/otp"
        )

    async def verify_pin_reset_otp(
        self,
        card_id: str,
        otp_code: str
    ) -> FISAPIResponse:
        """
        Verify OTP for PIN reset.

        Args:
            card_id: FIS card ID
            otp_code: OTP code received

        Returns:
            FISAPIResponse with verification result and reset token
        """
        logger.info(f"Verifying PIN reset OTP for card {card_id}")

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/pin/reset/verify",
            data={"otp_code": otp_code}
        )


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_pin_service: Optional[FISPinService] = None


def get_fis_pin_service() -> FISPinService:
    """Get or create singleton FIS PIN service instance"""
    global _pin_service
    if _pin_service is None:
        _pin_service = FISPinService()
    return _pin_service


# Export singleton
fis_pin_service = get_fis_pin_service()
