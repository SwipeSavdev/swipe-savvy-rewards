"""
FIS Global Payment One - Digital Wallet Service

Handles digital wallet operations:
- Apple Pay provisioning
- Google Pay provisioning
- Samsung Pay provisioning
- Wallet token management
- Token lifecycle (suspend, resume, delete)
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

from app.services.fis_global_service import (
    FISGlobalService,
    FISAPIResponse,
    get_fis_service
)

logger = logging.getLogger(__name__)


# =============================================================================
# ENUMS
# =============================================================================

class WalletType(str, Enum):
    """Digital wallet types"""
    APPLE_PAY = "apple_pay"
    GOOGLE_PAY = "google_pay"
    SAMSUNG_PAY = "samsung_pay"


class TokenStatus(str, Enum):
    """Wallet token statuses"""
    REQUESTED = "requested"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"
    EXPIRED = "expired"


class DeviceType(str, Enum):
    """Device types"""
    PHONE = "phone"
    WATCH = "watch"
    TABLET = "tablet"
    OTHER = "other"


class ProvisioningMethod(str, Enum):
    """Provisioning methods"""
    IN_APP = "in_app"           # Push provisioning from app
    MANUAL = "manual"           # Manual entry in wallet app
    CARD_ON_FILE = "card_on_file"  # From stored credentials


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class ApplePayProvisionRequest(BaseModel):
    """Apple Pay provisioning request"""
    card_id: str
    device_id: str
    device_type: DeviceType = DeviceType.PHONE
    certificates: List[str]  # Apple's leaf and intermediate certificates
    nonce: str
    nonce_signature: str


class GooglePayProvisionRequest(BaseModel):
    """Google Pay provisioning request"""
    card_id: str
    device_id: str
    device_type: DeviceType = DeviceType.PHONE
    wallet_account_id: str
    device_info: Dict[str, Any]


class SamsungPayProvisionRequest(BaseModel):
    """Samsung Pay provisioning request"""
    card_id: str
    device_id: str
    device_type: DeviceType = DeviceType.PHONE
    wallet_user_id: str
    device_info: Dict[str, Any]


class WalletToken(BaseModel):
    """Wallet token information"""
    token_id: str
    card_id: str
    wallet_type: WalletType
    status: TokenStatus
    device_id: str
    device_type: DeviceType
    device_name: Optional[str] = None
    token_suffix: str  # Last 4 of token PAN
    created_at: datetime
    last_used: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class ProvisioningResponse(BaseModel):
    """Provisioning response"""
    token_id: str
    status: TokenStatus
    activation_data: Optional[Dict[str, Any]] = None
    encrypted_pass_data: Optional[str] = None  # For Apple Pay
    push_token_id: Optional[str] = None


# =============================================================================
# FIS WALLET SERVICE
# =============================================================================

class FISWalletService:
    """
    Service for FIS digital wallet operations.

    Supports:
    - Apple Pay (via Apple Push Provisioning)
    - Google Pay (via Google Push Provisioning)
    - Samsung Pay
    """

    def __init__(self, fis_service: Optional[FISGlobalService] = None):
        """
        Initialize wallet service.

        Args:
            fis_service: FIS Global service instance
        """
        self.fis = fis_service or get_fis_service()

    # =========================================================================
    # APPLE PAY
    # =========================================================================

    async def provision_apple_pay(
        self,
        card_id: str,
        device_id: str,
        device_type: DeviceType,
        certificates: List[str],
        nonce: str,
        nonce_signature: str
    ) -> FISAPIResponse:
        """
        Provision a card for Apple Pay.

        This implements Apple's Push Provisioning flow.

        Args:
            card_id: FIS card ID
            device_id: Apple device ID
            device_type: Type of device (phone, watch)
            certificates: Apple's leaf and intermediate certificates
            nonce: Apple-provided nonce
            nonce_signature: Signature of the nonce

        Returns:
            FISAPIResponse with provisioning data
        """
        logger.info(f"Provisioning Apple Pay for card {card_id} on device {device_id}")

        payload = {
            "wallet_type": WalletType.APPLE_PAY.value,
            "device_id": device_id,
            "device_type": device_type.value,
            "apple_pay": {
                "certificates": certificates,
                "nonce": nonce,
                "nonce_signature": nonce_signature
            }
        }

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/wallet/provision",
            data=payload
        )

        if response.success:
            logger.info(f"Apple Pay provisioned for card {card_id}")
        else:
            logger.error(f"Failed to provision Apple Pay: {response.error_message}")

        return response

    async def get_apple_pay_eligibility(self, card_id: str) -> FISAPIResponse:
        """
        Check if a card is eligible for Apple Pay.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with eligibility status
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/wallet/apple-pay/eligibility"
        )

    # =========================================================================
    # GOOGLE PAY
    # =========================================================================

    async def provision_google_pay(
        self,
        card_id: str,
        device_id: str,
        device_type: DeviceType,
        wallet_account_id: str,
        device_info: Dict[str, Any]
    ) -> FISAPIResponse:
        """
        Provision a card for Google Pay.

        Args:
            card_id: FIS card ID
            device_id: Android device ID
            device_type: Type of device
            wallet_account_id: Google Wallet account ID
            device_info: Device information

        Returns:
            FISAPIResponse with provisioning data
        """
        logger.info(f"Provisioning Google Pay for card {card_id} on device {device_id}")

        payload = {
            "wallet_type": WalletType.GOOGLE_PAY.value,
            "device_id": device_id,
            "device_type": device_type.value,
            "google_pay": {
                "wallet_account_id": wallet_account_id,
                "device_info": device_info
            }
        }

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/wallet/provision",
            data=payload
        )

        if response.success:
            logger.info(f"Google Pay provisioned for card {card_id}")
        else:
            logger.error(f"Failed to provision Google Pay: {response.error_message}")

        return response

    async def get_google_pay_eligibility(self, card_id: str) -> FISAPIResponse:
        """
        Check if a card is eligible for Google Pay.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with eligibility status
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/wallet/google-pay/eligibility"
        )

    async def get_google_pay_push_token(
        self,
        card_id: str,
        wallet_account_id: str
    ) -> FISAPIResponse:
        """
        Get push provisioning token for Google Pay.

        This token is used in the Google Pay app to complete provisioning.

        Args:
            card_id: FIS card ID
            wallet_account_id: Google Wallet account ID

        Returns:
            FISAPIResponse with opaque payment card (OPC)
        """
        logger.info(f"Getting Google Pay push token for card {card_id}")

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/wallet/google-pay/push-token",
            data={"wallet_account_id": wallet_account_id}
        )

    # =========================================================================
    # SAMSUNG PAY
    # =========================================================================

    async def provision_samsung_pay(
        self,
        card_id: str,
        device_id: str,
        device_type: DeviceType,
        wallet_user_id: str,
        device_info: Dict[str, Any]
    ) -> FISAPIResponse:
        """
        Provision a card for Samsung Pay.

        Args:
            card_id: FIS card ID
            device_id: Samsung device ID
            device_type: Type of device
            wallet_user_id: Samsung Wallet user ID
            device_info: Device information

        Returns:
            FISAPIResponse with provisioning data
        """
        logger.info(f"Provisioning Samsung Pay for card {card_id} on device {device_id}")

        payload = {
            "wallet_type": WalletType.SAMSUNG_PAY.value,
            "device_id": device_id,
            "device_type": device_type.value,
            "samsung_pay": {
                "wallet_user_id": wallet_user_id,
                "device_info": device_info
            }
        }

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/wallet/provision",
            data=payload
        )

        if response.success:
            logger.info(f"Samsung Pay provisioned for card {card_id}")
        else:
            logger.error(f"Failed to provision Samsung Pay: {response.error_message}")

        return response

    # =========================================================================
    # TOKEN MANAGEMENT
    # =========================================================================

    async def get_wallet_tokens(
        self,
        card_id: str,
        wallet_type: Optional[WalletType] = None,
        status: Optional[TokenStatus] = None
    ) -> FISAPIResponse:
        """
        Get all wallet tokens for a card.

        Args:
            card_id: FIS card ID
            wallet_type: Optional filter by wallet type
            status: Optional filter by status

        Returns:
            FISAPIResponse with tokens list
        """
        params = {}
        if wallet_type:
            params["wallet_type"] = wallet_type.value
        if status:
            params["status"] = status.value

        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/wallet/tokens",
            params=params
        )

    async def get_token(
        self,
        card_id: str,
        token_id: str
    ) -> FISAPIResponse:
        """
        Get details of a specific wallet token.

        Args:
            card_id: FIS card ID
            token_id: Token ID

        Returns:
            FISAPIResponse with token details
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/wallet/tokens/{token_id}"
        )

    async def suspend_token(
        self,
        card_id: str,
        token_id: str,
        reason: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Suspend a wallet token.

        Suspended tokens cannot be used for payments.

        Args:
            card_id: FIS card ID
            token_id: Token ID
            reason: Optional reason for suspension

        Returns:
            FISAPIResponse with suspension status
        """
        logger.info(f"Suspending wallet token {token_id} for card {card_id}")

        payload = {}
        if reason:
            payload["reason"] = reason

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/wallet/tokens/{token_id}/suspend",
            data=payload if payload else None
        )

        if response.success:
            logger.info(f"Token {token_id} suspended")
        else:
            logger.error(f"Failed to suspend token: {response.error_message}")

        return response

    async def resume_token(
        self,
        card_id: str,
        token_id: str
    ) -> FISAPIResponse:
        """
        Resume a suspended wallet token.

        Args:
            card_id: FIS card ID
            token_id: Token ID

        Returns:
            FISAPIResponse with resume status
        """
        logger.info(f"Resuming wallet token {token_id} for card {card_id}")

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/wallet/tokens/{token_id}/resume"
        )

        if response.success:
            logger.info(f"Token {token_id} resumed")
        else:
            logger.error(f"Failed to resume token: {response.error_message}")

        return response

    async def delete_token(
        self,
        card_id: str,
        token_id: str,
        reason: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Delete a wallet token.

        This permanently removes the card from the digital wallet.

        Args:
            card_id: FIS card ID
            token_id: Token ID
            reason: Optional reason for deletion

        Returns:
            FISAPIResponse with deletion status
        """
        logger.info(f"Deleting wallet token {token_id} for card {card_id}")

        payload = {}
        if reason:
            payload["reason"] = reason

        response = await self.fis._make_request(
            method="DELETE",
            endpoint=f"/cards/{card_id}/wallet/tokens/{token_id}",
            data=payload if payload else None
        )

        if response.success:
            logger.info(f"Token {token_id} deleted")
        else:
            logger.error(f"Failed to delete token: {response.error_message}")

        return response

    async def suspend_all_tokens(
        self,
        card_id: str,
        reason: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Suspend all wallet tokens for a card.

        Useful when card is reported lost/stolen.

        Args:
            card_id: FIS card ID
            reason: Optional reason for suspension

        Returns:
            FISAPIResponse with suspension status
        """
        logger.info(f"Suspending all wallet tokens for card {card_id}")

        payload = {}
        if reason:
            payload["reason"] = reason

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/wallet/tokens/suspend-all",
            data=payload if payload else None
        )

    async def delete_all_tokens(
        self,
        card_id: str,
        reason: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Delete all wallet tokens for a card.

        Useful when card is cancelled.

        Args:
            card_id: FIS card ID
            reason: Optional reason for deletion

        Returns:
            FISAPIResponse with deletion status
        """
        logger.info(f"Deleting all wallet tokens for card {card_id}")

        payload = {}
        if reason:
            payload["reason"] = reason

        return await self.fis._make_request(
            method="DELETE",
            endpoint=f"/cards/{card_id}/wallet/tokens",
            data=payload if payload else None
        )

    # =========================================================================
    # TOKEN LIFECYCLE EVENTS
    # =========================================================================

    async def get_token_activity(
        self,
        card_id: str,
        token_id: str
    ) -> FISAPIResponse:
        """
        Get activity history for a token.

        Args:
            card_id: FIS card ID
            token_id: Token ID

        Returns:
            FISAPIResponse with activity history
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/wallet/tokens/{token_id}/activity"
        )


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_wallet_service: Optional[FISWalletService] = None


def get_fis_wallet_service() -> FISWalletService:
    """Get or create singleton FIS Wallet service instance"""
    global _wallet_service
    if _wallet_service is None:
        _wallet_service = FISWalletService()
    return _wallet_service


# Export singleton
fis_wallet_service = get_fis_wallet_service()
