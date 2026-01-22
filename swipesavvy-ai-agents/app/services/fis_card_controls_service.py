"""
FIS Global Payment One - Card Controls Service

Handles card control operations:
- Lock/Unlock cards
- Spending limits
- Merchant category controls
- Geographic controls
- Channel controls (ATM, POS, eCommerce)
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

from app.services.fis_global_service import (
    FISGlobalService,
    FISAPIResponse,
    get_fis_service
)

logger = logging.getLogger(__name__)


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class SpendingLimits(BaseModel):
    """Spending limit configuration"""
    daily_limit: Optional[Decimal] = None
    weekly_limit: Optional[Decimal] = None
    monthly_limit: Optional[Decimal] = None
    per_transaction_limit: Optional[Decimal] = None


class ChannelControls(BaseModel):
    """Channel control configuration"""
    atm_enabled: bool = True
    pos_enabled: bool = True
    ecommerce_enabled: bool = True
    contactless_enabled: bool = True
    international_enabled: bool = False


class MerchantControls(BaseModel):
    """Merchant category control configuration"""
    blocked_mcc_codes: List[str] = Field(default_factory=list)
    allowed_mcc_codes: Optional[List[str]] = None  # If set, only these are allowed


class GeoControls(BaseModel):
    """Geographic control configuration"""
    allowed_countries: List[str] = Field(default_factory=lambda: ["US"])
    blocked_countries: List[str] = Field(default_factory=list)


class TimeControls(BaseModel):
    """Time-based control configuration"""
    allowed_hours_start: Optional[int] = None  # 0-23
    allowed_hours_end: Optional[int] = None  # 0-23
    allowed_days: List[int] = Field(default_factory=lambda: [0, 1, 2, 3, 4, 5, 6])


class AlertPreferences(BaseModel):
    """Alert preference configuration"""
    alert_on_transaction: bool = True
    alert_on_decline: bool = True
    alert_on_international: bool = True
    alert_threshold: Optional[Decimal] = None


class CardControlsResponse(BaseModel):
    """Full card controls response"""
    card_id: str
    spending_limits: SpendingLimits
    channel_controls: ChannelControls
    merchant_controls: MerchantControls
    geo_controls: GeoControls
    time_controls: Optional[TimeControls] = None
    alert_preferences: AlertPreferences
    last_updated: datetime


# =============================================================================
# COMMON MCC CODES
# =============================================================================

MCC_CATEGORIES = {
    "gambling": ["7995", "7800", "7801", "7802"],
    "alcohol": ["5813", "5921"],
    "tobacco": ["5993"],
    "adult_entertainment": ["5967", "7273"],
    "firearms": ["5941"],
    "cryptocurrency": ["6051"],
    "money_orders": ["6050"],
    "dating_services": ["7273", "7299"],
}


# =============================================================================
# FIS CARD CONTROLS SERVICE
# =============================================================================

class FISCardControlsService:
    """
    Service for managing FIS card controls.
    """

    def __init__(self, fis_service: Optional[FISGlobalService] = None):
        """
        Initialize card controls service.

        Args:
            fis_service: FIS Global service instance
        """
        self.fis = fis_service or get_fis_service()

    # =========================================================================
    # LOCK/UNLOCK
    # =========================================================================

    async def lock_card(
        self,
        card_id: str,
        reason: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Lock a card (temporary freeze).

        Args:
            card_id: FIS card ID
            reason: Optional reason for locking

        Returns:
            FISAPIResponse with lock status
        """
        logger.info(f"Locking card {card_id}")

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/lock",
            data={"reason": reason} if reason else None
        )

        if response.success:
            logger.info(f"Card {card_id} locked successfully")
        else:
            logger.error(f"Failed to lock card {card_id}: {response.error_message}")

        return response

    async def unlock_card(self, card_id: str) -> FISAPIResponse:
        """
        Unlock a card.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with unlock status
        """
        logger.info(f"Unlocking card {card_id}")

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/unlock"
        )

        if response.success:
            logger.info(f"Card {card_id} unlocked successfully")
        else:
            logger.error(f"Failed to unlock card {card_id}: {response.error_message}")

        return response

    async def freeze_card(
        self,
        card_id: str,
        reason: str
    ) -> FISAPIResponse:
        """
        Freeze a card (more permanent than lock, for suspected fraud).

        Args:
            card_id: FIS card ID
            reason: Reason for freezing (fraud, suspicious_activity, user_request)

        Returns:
            FISAPIResponse with freeze status
        """
        logger.info(f"Freezing card {card_id} - reason: {reason}")

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/freeze",
            data={"reason": reason}
        )

        if response.success:
            logger.info(f"Card {card_id} frozen successfully")
        else:
            logger.error(f"Failed to freeze card {card_id}: {response.error_message}")

        return response

    async def unfreeze_card(self, card_id: str) -> FISAPIResponse:
        """
        Unfreeze a card.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with unfreeze status
        """
        logger.info(f"Unfreezing card {card_id}")

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/unfreeze"
        )

        if response.success:
            logger.info(f"Card {card_id} unfrozen successfully")
        else:
            logger.error(f"Failed to unfreeze card {card_id}: {response.error_message}")

        return response

    # =========================================================================
    # SPENDING LIMITS
    # =========================================================================

    async def set_spending_limits(
        self,
        card_id: str,
        limits: SpendingLimits
    ) -> FISAPIResponse:
        """
        Set spending limits for a card.

        Args:
            card_id: FIS card ID
            limits: SpendingLimits configuration

        Returns:
            FISAPIResponse with updated limits
        """
        logger.info(f"Setting spending limits for card {card_id}")

        payload = {}
        if limits.daily_limit is not None:
            payload["daily_limit"] = float(limits.daily_limit)
        if limits.weekly_limit is not None:
            payload["weekly_limit"] = float(limits.weekly_limit)
        if limits.monthly_limit is not None:
            payload["monthly_limit"] = float(limits.monthly_limit)
        if limits.per_transaction_limit is not None:
            payload["per_transaction_limit"] = float(limits.per_transaction_limit)

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/cards/{card_id}/limits",
            data=payload
        )

    async def get_spending_limits(self, card_id: str) -> FISAPIResponse:
        """
        Get current spending limits for a card.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with current limits
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/limits"
        )

    async def remove_spending_limits(self, card_id: str) -> FISAPIResponse:
        """
        Remove all spending limits from a card.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with removal status
        """
        logger.info(f"Removing spending limits for card {card_id}")

        return await self.fis._make_request(
            method="DELETE",
            endpoint=f"/cards/{card_id}/limits"
        )

    # =========================================================================
    # CHANNEL CONTROLS
    # =========================================================================

    async def set_channel_controls(
        self,
        card_id: str,
        controls: ChannelControls
    ) -> FISAPIResponse:
        """
        Set channel controls (ATM, POS, eCommerce, etc.).

        Args:
            card_id: FIS card ID
            controls: ChannelControls configuration

        Returns:
            FISAPIResponse with updated controls
        """
        logger.info(f"Setting channel controls for card {card_id}")

        payload = {
            "atm_enabled": controls.atm_enabled,
            "pos_enabled": controls.pos_enabled,
            "ecommerce_enabled": controls.ecommerce_enabled,
            "contactless_enabled": controls.contactless_enabled,
            "international_enabled": controls.international_enabled
        }

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/cards/{card_id}/controls/channels",
            data=payload
        )

    async def enable_international(self, card_id: str) -> FISAPIResponse:
        """Enable international transactions."""
        logger.info(f"Enabling international for card {card_id}")
        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/controls/international/enable"
        )

    async def disable_international(self, card_id: str) -> FISAPIResponse:
        """Disable international transactions."""
        logger.info(f"Disabling international for card {card_id}")
        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/controls/international/disable"
        )

    # =========================================================================
    # MERCHANT CATEGORY CONTROLS
    # =========================================================================

    async def set_merchant_controls(
        self,
        card_id: str,
        controls: MerchantControls
    ) -> FISAPIResponse:
        """
        Set merchant category controls.

        Args:
            card_id: FIS card ID
            controls: MerchantControls configuration

        Returns:
            FISAPIResponse with updated controls
        """
        logger.info(f"Setting merchant controls for card {card_id}")

        payload = {
            "blocked_mcc_codes": controls.blocked_mcc_codes
        }
        if controls.allowed_mcc_codes:
            payload["allowed_mcc_codes"] = controls.allowed_mcc_codes

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/cards/{card_id}/controls/merchants",
            data=payload
        )

    async def block_merchant_category(
        self,
        card_id: str,
        category: str
    ) -> FISAPIResponse:
        """
        Block a merchant category by name.

        Args:
            card_id: FIS card ID
            category: Category name (gambling, alcohol, etc.)

        Returns:
            FISAPIResponse with updated controls
        """
        mcc_codes = MCC_CATEGORIES.get(category.lower(), [])
        if not mcc_codes:
            return FISAPIResponse(
                success=False,
                error_code="INVALID_CATEGORY",
                error_message=f"Unknown merchant category: {category}"
            )

        logger.info(f"Blocking category '{category}' for card {card_id}")

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/controls/merchants/block",
            data={"mcc_codes": mcc_codes}
        )

    async def unblock_merchant_category(
        self,
        card_id: str,
        category: str
    ) -> FISAPIResponse:
        """
        Unblock a merchant category by name.

        Args:
            card_id: FIS card ID
            category: Category name

        Returns:
            FISAPIResponse with updated controls
        """
        mcc_codes = MCC_CATEGORIES.get(category.lower(), [])
        if not mcc_codes:
            return FISAPIResponse(
                success=False,
                error_code="INVALID_CATEGORY",
                error_message=f"Unknown merchant category: {category}"
            )

        logger.info(f"Unblocking category '{category}' for card {card_id}")

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/controls/merchants/unblock",
            data={"mcc_codes": mcc_codes}
        )

    # =========================================================================
    # GEOGRAPHIC CONTROLS
    # =========================================================================

    async def set_geo_controls(
        self,
        card_id: str,
        controls: GeoControls
    ) -> FISAPIResponse:
        """
        Set geographic controls.

        Args:
            card_id: FIS card ID
            controls: GeoControls configuration

        Returns:
            FISAPIResponse with updated controls
        """
        logger.info(f"Setting geo controls for card {card_id}")

        payload = {
            "allowed_countries": controls.allowed_countries,
            "blocked_countries": controls.blocked_countries
        }

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/cards/{card_id}/controls/geo",
            data=payload
        )

    async def block_country(
        self,
        card_id: str,
        country_code: str
    ) -> FISAPIResponse:
        """
        Block a specific country.

        Args:
            card_id: FIS card ID
            country_code: ISO country code (e.g., "RU", "CN")

        Returns:
            FISAPIResponse with updated controls
        """
        logger.info(f"Blocking country {country_code} for card {card_id}")

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/controls/geo/block",
            data={"country_code": country_code.upper()}
        )

    async def unblock_country(
        self,
        card_id: str,
        country_code: str
    ) -> FISAPIResponse:
        """
        Unblock a specific country.

        Args:
            card_id: FIS card ID
            country_code: ISO country code

        Returns:
            FISAPIResponse with updated controls
        """
        logger.info(f"Unblocking country {country_code} for card {card_id}")

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/controls/geo/unblock",
            data={"country_code": country_code.upper()}
        )

    # =========================================================================
    # GET ALL CONTROLS
    # =========================================================================

    async def get_all_controls(self, card_id: str) -> FISAPIResponse:
        """
        Get all card controls.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with all controls
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/controls"
        )

    # =========================================================================
    # ALERT PREFERENCES
    # =========================================================================

    async def set_alert_preferences(
        self,
        card_id: str,
        preferences: AlertPreferences
    ) -> FISAPIResponse:
        """
        Set alert preferences for a card.

        Args:
            card_id: FIS card ID
            preferences: AlertPreferences configuration

        Returns:
            FISAPIResponse with updated preferences
        """
        logger.info(f"Setting alert preferences for card {card_id}")

        payload = {
            "alert_on_transaction": preferences.alert_on_transaction,
            "alert_on_decline": preferences.alert_on_decline,
            "alert_on_international": preferences.alert_on_international
        }
        if preferences.alert_threshold is not None:
            payload["alert_threshold"] = float(preferences.alert_threshold)

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/cards/{card_id}/alerts",
            data=payload
        )


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_controls_service: Optional[FISCardControlsService] = None


def get_fis_card_controls_service() -> FISCardControlsService:
    """Get or create singleton FIS Card Controls service instance"""
    global _controls_service
    if _controls_service is None:
        _controls_service = FISCardControlsService()
    return _controls_service


# Export singleton
fis_card_controls_service = get_fis_card_controls_service()
