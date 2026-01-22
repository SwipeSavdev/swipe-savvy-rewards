"""
FIS Global Payment One - Card Issuance Service

Handles card lifecycle operations:
- Virtual card issuance
- Physical card ordering
- Card activation
- Card replacement
- Card cancellation
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

from app.services.fis_global_service import (
    FISGlobalService,
    FISAPIResponse,
    FISCardStatus,
    FISCardType,
    get_fis_service
)

logger = logging.getLogger(__name__)


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class IssueVirtualCardRequest(BaseModel):
    """Request to issue a virtual card"""
    user_id: UUID
    cardholder_name: str
    nickname: Optional[str] = None
    set_as_primary: bool = False


class IssuePhysicalCardRequest(BaseModel):
    """Request to order a physical card"""
    user_id: UUID
    cardholder_name: str
    shipping_address: Dict[str, str]  # street, city, state, zip, country
    expedited: bool = False
    nickname: Optional[str] = None
    set_as_primary: bool = False


class ActivateCardRequest(BaseModel):
    """Request to activate a card"""
    card_id: str
    last_four: str  # For verification
    activation_code: Optional[str] = None  # For physical cards


class ReplaceCardRequest(BaseModel):
    """Request to replace a card"""
    card_id: str
    reason: str  # lost, stolen, damaged, expired
    shipping_address: Optional[Dict[str, str]] = None  # For physical cards
    expedited: bool = False


class CardResponse(BaseModel):
    """Card response data"""
    card_id: str
    fis_card_id: str
    card_type: str
    status: str
    last_four: str
    expiry_month: int
    expiry_year: int
    cardholder_name: str
    card_network: str = "visa"
    is_primary: bool = False
    nickname: Optional[str] = None
    created_at: datetime
    activated_at: Optional[datetime] = None


# =============================================================================
# FIS CARD SERVICE
# =============================================================================

class FISCardService:
    """
    Service for FIS card issuance and lifecycle management.
    """

    def __init__(self, fis_service: Optional[FISGlobalService] = None):
        """
        Initialize card service.

        Args:
            fis_service: FIS Global service instance (uses singleton if not provided)
        """
        self.fis = fis_service or get_fis_service()

    async def issue_virtual_card(
        self,
        user_id: UUID,
        cardholder_name: str,
        nickname: Optional[str] = None,
        set_as_primary: bool = False
    ) -> FISAPIResponse:
        """
        Issue a new virtual card for instant use.

        Args:
            user_id: User's UUID
            cardholder_name: Name to emboss on card
            nickname: Optional friendly name for the card
            set_as_primary: Whether to set as primary card

        Returns:
            FISAPIResponse with card details
        """
        logger.info(f"Issuing virtual card for user {user_id}")

        payload = {
            "card_type": "virtual",
            "cardholder_name": cardholder_name.upper(),
            "external_user_id": str(user_id),
            "program_id": "swipesavvy_virtual",
            "metadata": {
                "nickname": nickname,
                "is_primary": set_as_primary
            }
        }

        response = await self.fis._make_request(
            method="POST",
            endpoint="/cards/issue",
            data=payload
        )

        if response.success:
            logger.info(f"Virtual card issued successfully: {response.data.get('card_id')}")
        else:
            logger.error(f"Failed to issue virtual card: {response.error_message}")

        return response

    async def order_physical_card(
        self,
        user_id: UUID,
        cardholder_name: str,
        shipping_address: Dict[str, str],
        expedited: bool = False,
        nickname: Optional[str] = None,
        set_as_primary: bool = False
    ) -> FISAPIResponse:
        """
        Order a physical card for mailing.

        Args:
            user_id: User's UUID
            cardholder_name: Name to emboss on card
            shipping_address: Shipping address dict with street, city, state, zip, country
            expedited: Whether to use expedited shipping
            nickname: Optional friendly name for the card
            set_as_primary: Whether to set as primary card

        Returns:
            FISAPIResponse with card and shipping details
        """
        logger.info(f"Ordering physical card for user {user_id}")

        payload = {
            "card_type": "physical",
            "cardholder_name": cardholder_name.upper(),
            "external_user_id": str(user_id),
            "program_id": "swipesavvy_physical",
            "shipping": {
                "address": {
                    "line1": shipping_address.get("street"),
                    "city": shipping_address.get("city"),
                    "state": shipping_address.get("state"),
                    "postal_code": shipping_address.get("zip"),
                    "country": shipping_address.get("country", "US")
                },
                "expedited": expedited,
                "method": "expedited" if expedited else "standard"
            },
            "metadata": {
                "nickname": nickname,
                "is_primary": set_as_primary
            }
        }

        response = await self.fis._make_request(
            method="POST",
            endpoint="/cards/issue",
            data=payload
        )

        if response.success:
            logger.info(f"Physical card ordered successfully: {response.data.get('card_id')}")
        else:
            logger.error(f"Failed to order physical card: {response.error_message}")

        return response

    async def activate_card(
        self,
        card_id: str,
        last_four: str,
        activation_code: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Activate a card.

        Args:
            card_id: FIS card ID
            last_four: Last 4 digits for verification
            activation_code: Activation code (for physical cards)

        Returns:
            FISAPIResponse with activation status
        """
        logger.info(f"Activating card {card_id}")

        payload = {
            "last_four_verification": last_four
        }

        if activation_code:
            payload["activation_code"] = activation_code

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/activate",
            data=payload
        )

        if response.success:
            logger.info(f"Card {card_id} activated successfully")
        else:
            logger.error(f"Failed to activate card {card_id}: {response.error_message}")

        return response

    async def get_card(self, card_id: str) -> FISAPIResponse:
        """
        Get card details.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with card details
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}"
        )

    async def get_user_cards(self, user_id: UUID) -> FISAPIResponse:
        """
        Get all cards for a user.

        Args:
            user_id: User's UUID

        Returns:
            FISAPIResponse with list of cards
        """
        return await self.fis._make_request(
            method="GET",
            endpoint="/cards",
            params={"external_user_id": str(user_id)}
        )

    async def get_card_sensitive_data(
        self,
        card_id: str,
        include_pan: bool = False,
        include_cvv: bool = False
    ) -> FISAPIResponse:
        """
        Get sensitive card data (PAN, CVV) - requires additional authorization.

        Args:
            card_id: FIS card ID
            include_pan: Whether to include full PAN
            include_cvv: Whether to include CVV

        Returns:
            FISAPIResponse with sensitive card data
        """
        logger.info(f"Retrieving sensitive data for card {card_id}")

        params = {}
        if include_pan:
            params["include_pan"] = "true"
        if include_cvv:
            params["include_cvv"] = "true"

        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/sensitive",
            params=params
        )

    async def replace_card(
        self,
        card_id: str,
        reason: str,
        shipping_address: Optional[Dict[str, str]] = None,
        expedited: bool = False
    ) -> FISAPIResponse:
        """
        Replace a card (lost, stolen, damaged, expired).

        Args:
            card_id: FIS card ID of card to replace
            reason: Reason for replacement (lost, stolen, damaged, expired)
            shipping_address: New shipping address (uses existing if not provided)
            expedited: Whether to use expedited shipping

        Returns:
            FISAPIResponse with new card details
        """
        logger.info(f"Replacing card {card_id} - reason: {reason}")

        payload = {
            "reason": reason,
            "expedited": expedited
        }

        if shipping_address:
            payload["shipping"] = {
                "address": {
                    "line1": shipping_address.get("street"),
                    "city": shipping_address.get("city"),
                    "state": shipping_address.get("state"),
                    "postal_code": shipping_address.get("zip"),
                    "country": shipping_address.get("country", "US")
                }
            }

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/replace",
            data=payload
        )

        if response.success:
            logger.info(f"Card {card_id} replaced - new card: {response.data.get('new_card_id')}")
        else:
            logger.error(f"Failed to replace card {card_id}: {response.error_message}")

        return response

    async def cancel_card(
        self,
        card_id: str,
        reason: str
    ) -> FISAPIResponse:
        """
        Cancel/close a card permanently.

        Args:
            card_id: FIS card ID
            reason: Reason for cancellation

        Returns:
            FISAPIResponse with cancellation status
        """
        logger.info(f"Cancelling card {card_id} - reason: {reason}")

        response = await self.fis._make_request(
            method="DELETE",
            endpoint=f"/cards/{card_id}",
            data={"reason": reason}
        )

        if response.success:
            logger.info(f"Card {card_id} cancelled successfully")
        else:
            logger.error(f"Failed to cancel card {card_id}: {response.error_message}")

        return response

    async def update_card_status(
        self,
        card_id: str,
        status: FISCardStatus
    ) -> FISAPIResponse:
        """
        Update card status.

        Args:
            card_id: FIS card ID
            status: New card status

        Returns:
            FISAPIResponse with updated status
        """
        logger.info(f"Updating card {card_id} status to {status.value}")

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/cards/{card_id}/status",
            data={"status": status.value}
        )

    async def get_shipping_status(self, card_id: str) -> FISAPIResponse:
        """
        Get shipping status for a physical card.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with shipping details
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/shipping"
        )


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_card_service: Optional[FISCardService] = None


def get_fis_card_service() -> FISCardService:
    """Get or create singleton FIS Card service instance"""
    global _card_service
    if _card_service is None:
        _card_service = FISCardService()
    return _card_service


# Export singleton
fis_card_service = get_fis_card_service()
