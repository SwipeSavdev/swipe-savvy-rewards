"""
FIS Global Payment One - Card Management API Routes

Handles:
- Card issuance (virtual and physical)
- Card activation
- Card replacement
- Card cancellation
- Card controls (lock/unlock, limits, etc.)
- PIN management
"""

import logging
from datetime import date
from typing import Optional, List, Dict, Any
from uuid import UUID
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Depends, Header, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import verify_token_string
from app.services.fis_card_service import (
    get_fis_card_service,
    FISCardService
)
from app.services.fis_card_controls_service import (
    get_fis_card_controls_service,
    FISCardControlsService,
    SpendingLimits,
    ChannelControls,
    MerchantControls,
    GeoControls,
    AlertPreferences
)
from app.services.fis_pin_service import (
    get_fis_pin_service,
    FISPinService
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/fis/cards", tags=["fis-cards"])


# =============================================================================
# AUTHENTICATION
# =============================================================================

def require_auth(authorization: Optional[str] = Header(None)) -> str:
    """Require authentication - raises 401 if no valid token"""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    try:
        token = authorization.replace("Bearer ", "")
        user_id = verify_token_string(token)
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return user_id
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class IssueVirtualCardRequest(BaseModel):
    """Request to issue a virtual card"""
    cardholder_name: str
    nickname: Optional[str] = None
    set_as_primary: bool = False


class IssuePhysicalCardRequest(BaseModel):
    """Request to order a physical card"""
    cardholder_name: str
    shipping_address: Dict[str, str]
    expedited: bool = False
    nickname: Optional[str] = None
    set_as_primary: bool = False


class ActivateCardRequest(BaseModel):
    """Request to activate a card"""
    last_four: str
    activation_code: Optional[str] = None


class ReplaceCardRequest(BaseModel):
    """Request to replace a card"""
    reason: str  # lost, stolen, damaged, expired
    shipping_address: Optional[Dict[str, str]] = None
    expedited: bool = False


class CancelCardRequest(BaseModel):
    """Request to cancel a card"""
    reason: str


class LockCardRequest(BaseModel):
    """Request to lock a card"""
    reason: Optional[str] = None


class SpendingLimitsRequest(BaseModel):
    """Request to set spending limits"""
    daily_limit: Optional[float] = None
    weekly_limit: Optional[float] = None
    monthly_limit: Optional[float] = None
    per_transaction_limit: Optional[float] = None


class ChannelControlsRequest(BaseModel):
    """Request to set channel controls"""
    atm_enabled: bool = True
    pos_enabled: bool = True
    ecommerce_enabled: bool = True
    contactless_enabled: bool = True
    international_enabled: bool = False


class MerchantControlsRequest(BaseModel):
    """Request to set merchant controls"""
    blocked_mcc_codes: List[str] = Field(default_factory=list)
    allowed_mcc_codes: Optional[List[str]] = None


class GeoControlsRequest(BaseModel):
    """Request to set geographic controls"""
    allowed_countries: List[str] = Field(default_factory=lambda: ["US"])
    blocked_countries: List[str] = Field(default_factory=list)


class AlertPreferencesRequest(BaseModel):
    """Request to set alert preferences"""
    alert_on_transaction: bool = True
    alert_on_decline: bool = True
    alert_on_international: bool = True
    alert_threshold: Optional[float] = None


class SetPinRequest(BaseModel):
    """Request to set initial PIN"""
    pin: str = Field(..., min_length=4, max_length=4)


class ChangePinRequest(BaseModel):
    """Request to change PIN"""
    current_pin: str = Field(..., min_length=4, max_length=4)
    new_pin: str = Field(..., min_length=4, max_length=4)


class ResetPinRequest(BaseModel):
    """Request to reset PIN"""
    verification_method: str
    verification_data: Dict[str, Any]
    new_pin: str = Field(..., min_length=4, max_length=4)


class ValidatePinRequest(BaseModel):
    """Request to validate PIN"""
    pin: str = Field(..., min_length=4, max_length=4)
    operation: Optional[str] = None


class BlockMerchantCategoryRequest(BaseModel):
    """Request to block merchant category"""
    category: str


class BlockCountryRequest(BaseModel):
    """Request to block country"""
    country_code: str


# =============================================================================
# CARD ISSUANCE ENDPOINTS
# =============================================================================

@router.post("/issue/virtual")
async def issue_virtual_card(
    request: IssueVirtualCardRequest,
    user_id: str = Depends(require_auth),
    card_service: FISCardService = Depends(get_fis_card_service)
):
    """Issue a new virtual card for instant use."""
    response = await card_service.issue_virtual_card(
        user_id=UUID(user_id),
        cardholder_name=request.cardholder_name,
        nickname=request.nickname,
        set_as_primary=request.set_as_primary
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to issue virtual card"
        )

    return {
        "success": True,
        "message": "Virtual card issued successfully",
        "data": response.data
    }


@router.post("/issue/physical")
async def order_physical_card(
    request: IssuePhysicalCardRequest,
    user_id: str = Depends(require_auth),
    card_service: FISCardService = Depends(get_fis_card_service)
):
    """Order a physical card for mailing."""
    response = await card_service.order_physical_card(
        user_id=UUID(user_id),
        cardholder_name=request.cardholder_name,
        shipping_address=request.shipping_address,
        expedited=request.expedited,
        nickname=request.nickname,
        set_as_primary=request.set_as_primary
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to order physical card"
        )

    return {
        "success": True,
        "message": "Physical card ordered successfully",
        "data": response.data
    }


@router.get("")
async def get_user_cards(
    user_id: str = Depends(require_auth),
    card_service: FISCardService = Depends(get_fis_card_service)
):
    """Get all cards for the authenticated user."""
    response = await card_service.get_user_cards(UUID(user_id))

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get cards"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.get("/{card_id}")
async def get_card(
    card_id: str,
    user_id: str = Depends(require_auth),
    card_service: FISCardService = Depends(get_fis_card_service)
):
    """Get card details."""
    response = await card_service.get_card(card_id)

    if not response.success:
        raise HTTPException(
            status_code=404,
            detail=response.error_message or "Card not found"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.get("/{card_id}/sensitive")
async def get_card_sensitive_data(
    card_id: str,
    include_pan: bool = Query(False),
    include_cvv: bool = Query(False),
    user_id: str = Depends(require_auth),
    card_service: FISCardService = Depends(get_fis_card_service)
):
    """Get sensitive card data (PAN, CVV) - requires additional security."""
    response = await card_service.get_card_sensitive_data(
        card_id=card_id,
        include_pan=include_pan,
        include_cvv=include_cvv
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get sensitive data"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.post("/{card_id}/activate")
async def activate_card(
    card_id: str,
    request: ActivateCardRequest,
    user_id: str = Depends(require_auth),
    card_service: FISCardService = Depends(get_fis_card_service)
):
    """Activate a card."""
    response = await card_service.activate_card(
        card_id=card_id,
        last_four=request.last_four,
        activation_code=request.activation_code
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to activate card"
        )

    return {
        "success": True,
        "message": "Card activated successfully",
        "data": response.data
    }


@router.post("/{card_id}/replace")
async def replace_card(
    card_id: str,
    request: ReplaceCardRequest,
    user_id: str = Depends(require_auth),
    card_service: FISCardService = Depends(get_fis_card_service)
):
    """Replace a card (lost, stolen, damaged, expired)."""
    response = await card_service.replace_card(
        card_id=card_id,
        reason=request.reason,
        shipping_address=request.shipping_address,
        expedited=request.expedited
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to replace card"
        )

    return {
        "success": True,
        "message": "Card replacement ordered",
        "data": response.data
    }


@router.delete("/{card_id}")
async def cancel_card(
    card_id: str,
    request: CancelCardRequest,
    user_id: str = Depends(require_auth),
    card_service: FISCardService = Depends(get_fis_card_service)
):
    """Cancel/close a card permanently."""
    response = await card_service.cancel_card(
        card_id=card_id,
        reason=request.reason
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to cancel card"
        )

    return {
        "success": True,
        "message": "Card cancelled successfully"
    }


@router.get("/{card_id}/shipping")
async def get_shipping_status(
    card_id: str,
    user_id: str = Depends(require_auth),
    card_service: FISCardService = Depends(get_fis_card_service)
):
    """Get shipping status for a physical card."""
    response = await card_service.get_shipping_status(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get shipping status"
        )

    return {
        "success": True,
        "data": response.data
    }


# =============================================================================
# CARD CONTROL ENDPOINTS
# =============================================================================

@router.post("/{card_id}/lock")
async def lock_card(
    card_id: str,
    request: LockCardRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Lock a card (temporary freeze)."""
    response = await controls_service.lock_card(
        card_id=card_id,
        reason=request.reason
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to lock card"
        )

    return {
        "success": True,
        "message": "Card locked successfully"
    }


@router.post("/{card_id}/unlock")
async def unlock_card(
    card_id: str,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Unlock a card."""
    response = await controls_service.unlock_card(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to unlock card"
        )

    return {
        "success": True,
        "message": "Card unlocked successfully"
    }


@router.post("/{card_id}/freeze")
async def freeze_card(
    card_id: str,
    request: LockCardRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Freeze a card (for suspected fraud)."""
    response = await controls_service.freeze_card(
        card_id=card_id,
        reason=request.reason or "user_request"
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to freeze card"
        )

    return {
        "success": True,
        "message": "Card frozen successfully"
    }


@router.post("/{card_id}/unfreeze")
async def unfreeze_card(
    card_id: str,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Unfreeze a card."""
    response = await controls_service.unfreeze_card(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to unfreeze card"
        )

    return {
        "success": True,
        "message": "Card unfrozen successfully"
    }


@router.get("/{card_id}/controls")
async def get_all_controls(
    card_id: str,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Get all card controls."""
    response = await controls_service.get_all_controls(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get controls"
        )

    return {
        "success": True,
        "data": response.data
    }


# =============================================================================
# SPENDING LIMITS ENDPOINTS
# =============================================================================

@router.get("/{card_id}/limits")
async def get_spending_limits(
    card_id: str,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Get current spending limits."""
    response = await controls_service.get_spending_limits(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get limits"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.put("/{card_id}/limits")
async def set_spending_limits(
    card_id: str,
    request: SpendingLimitsRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Set spending limits."""
    limits = SpendingLimits(
        daily_limit=Decimal(str(request.daily_limit)) if request.daily_limit else None,
        weekly_limit=Decimal(str(request.weekly_limit)) if request.weekly_limit else None,
        monthly_limit=Decimal(str(request.monthly_limit)) if request.monthly_limit else None,
        per_transaction_limit=Decimal(str(request.per_transaction_limit)) if request.per_transaction_limit else None
    )

    response = await controls_service.set_spending_limits(card_id, limits)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to set limits"
        )

    return {
        "success": True,
        "message": "Spending limits updated"
    }


@router.delete("/{card_id}/limits")
async def remove_spending_limits(
    card_id: str,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Remove all spending limits."""
    response = await controls_service.remove_spending_limits(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to remove limits"
        )

    return {
        "success": True,
        "message": "Spending limits removed"
    }


# =============================================================================
# CHANNEL CONTROLS ENDPOINTS
# =============================================================================

@router.put("/{card_id}/controls/channels")
async def set_channel_controls(
    card_id: str,
    request: ChannelControlsRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Set channel controls (ATM, POS, eCommerce, etc.)."""
    controls = ChannelControls(
        atm_enabled=request.atm_enabled,
        pos_enabled=request.pos_enabled,
        ecommerce_enabled=request.ecommerce_enabled,
        contactless_enabled=request.contactless_enabled,
        international_enabled=request.international_enabled
    )

    response = await controls_service.set_channel_controls(card_id, controls)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to set channel controls"
        )

    return {
        "success": True,
        "message": "Channel controls updated"
    }


@router.post("/{card_id}/controls/international/enable")
async def enable_international(
    card_id: str,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Enable international transactions."""
    response = await controls_service.enable_international(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to enable international"
        )

    return {
        "success": True,
        "message": "International transactions enabled"
    }


@router.post("/{card_id}/controls/international/disable")
async def disable_international(
    card_id: str,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Disable international transactions."""
    response = await controls_service.disable_international(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to disable international"
        )

    return {
        "success": True,
        "message": "International transactions disabled"
    }


# =============================================================================
# MERCHANT CONTROLS ENDPOINTS
# =============================================================================

@router.put("/{card_id}/controls/merchants")
async def set_merchant_controls(
    card_id: str,
    request: MerchantControlsRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Set merchant category controls."""
    controls = MerchantControls(
        blocked_mcc_codes=request.blocked_mcc_codes,
        allowed_mcc_codes=request.allowed_mcc_codes
    )

    response = await controls_service.set_merchant_controls(card_id, controls)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to set merchant controls"
        )

    return {
        "success": True,
        "message": "Merchant controls updated"
    }


@router.post("/{card_id}/controls/merchants/block")
async def block_merchant_category(
    card_id: str,
    request: BlockMerchantCategoryRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Block a merchant category by name."""
    response = await controls_service.block_merchant_category(
        card_id=card_id,
        category=request.category
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to block category"
        )

    return {
        "success": True,
        "message": f"Category '{request.category}' blocked"
    }


@router.post("/{card_id}/controls/merchants/unblock")
async def unblock_merchant_category(
    card_id: str,
    request: BlockMerchantCategoryRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Unblock a merchant category by name."""
    response = await controls_service.unblock_merchant_category(
        card_id=card_id,
        category=request.category
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to unblock category"
        )

    return {
        "success": True,
        "message": f"Category '{request.category}' unblocked"
    }


# =============================================================================
# GEOGRAPHIC CONTROLS ENDPOINTS
# =============================================================================

@router.put("/{card_id}/controls/geo")
async def set_geo_controls(
    card_id: str,
    request: GeoControlsRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Set geographic controls."""
    controls = GeoControls(
        allowed_countries=request.allowed_countries,
        blocked_countries=request.blocked_countries
    )

    response = await controls_service.set_geo_controls(card_id, controls)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to set geo controls"
        )

    return {
        "success": True,
        "message": "Geographic controls updated"
    }


@router.post("/{card_id}/controls/geo/block")
async def block_country(
    card_id: str,
    request: BlockCountryRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Block a specific country."""
    response = await controls_service.block_country(
        card_id=card_id,
        country_code=request.country_code
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to block country"
        )

    return {
        "success": True,
        "message": f"Country '{request.country_code}' blocked"
    }


@router.post("/{card_id}/controls/geo/unblock")
async def unblock_country(
    card_id: str,
    request: BlockCountryRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Unblock a specific country."""
    response = await controls_service.unblock_country(
        card_id=card_id,
        country_code=request.country_code
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to unblock country"
        )

    return {
        "success": True,
        "message": f"Country '{request.country_code}' unblocked"
    }


# =============================================================================
# ALERT PREFERENCES ENDPOINTS
# =============================================================================

@router.put("/{card_id}/alerts")
async def set_alert_preferences(
    card_id: str,
    request: AlertPreferencesRequest,
    user_id: str = Depends(require_auth),
    controls_service: FISCardControlsService = Depends(get_fis_card_controls_service)
):
    """Set alert preferences."""
    from app.services.fis_card_controls_service import AlertPreferences as AlertPrefs

    preferences = AlertPrefs(
        alert_on_transaction=request.alert_on_transaction,
        alert_on_decline=request.alert_on_decline,
        alert_on_international=request.alert_on_international,
        alert_threshold=Decimal(str(request.alert_threshold)) if request.alert_threshold else None
    )

    response = await controls_service.set_alert_preferences(card_id, preferences)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to set alert preferences"
        )

    return {
        "success": True,
        "message": "Alert preferences updated"
    }


# =============================================================================
# PIN MANAGEMENT ENDPOINTS
# =============================================================================

@router.post("/{card_id}/pin/set")
async def set_pin(
    card_id: str,
    request: SetPinRequest,
    user_id: str = Depends(require_auth),
    pin_service: FISPinService = Depends(get_fis_pin_service)
):
    """Set initial PIN."""
    response = await pin_service.set_pin(
        card_id=card_id,
        pin=request.pin
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to set PIN"
        )

    return {
        "success": True,
        "message": "PIN set successfully"
    }


@router.put("/{card_id}/pin/change")
async def change_pin(
    card_id: str,
    request: ChangePinRequest,
    user_id: str = Depends(require_auth),
    pin_service: FISPinService = Depends(get_fis_pin_service)
):
    """Change existing PIN."""
    response = await pin_service.change_pin(
        card_id=card_id,
        current_pin=request.current_pin,
        new_pin=request.new_pin
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to change PIN"
        )

    return {
        "success": True,
        "message": "PIN changed successfully"
    }


@router.post("/{card_id}/pin/reset")
async def reset_pin(
    card_id: str,
    request: ResetPinRequest,
    user_id: str = Depends(require_auth),
    pin_service: FISPinService = Depends(get_fis_pin_service)
):
    """Reset forgotten PIN."""
    response = await pin_service.reset_pin(
        card_id=card_id,
        verification_method=request.verification_method,
        verification_data=request.verification_data,
        new_pin=request.new_pin
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to reset PIN"
        )

    return {
        "success": True,
        "message": "PIN reset successfully"
    }


@router.post("/{card_id}/pin/validate")
async def validate_pin(
    card_id: str,
    request: ValidatePinRequest,
    user_id: str = Depends(require_auth),
    pin_service: FISPinService = Depends(get_fis_pin_service)
):
    """Validate PIN for sensitive operations."""
    response = await pin_service.validate_pin(
        card_id=card_id,
        pin=request.pin,
        operation=request.operation
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Invalid PIN"
        )

    return {
        "success": True,
        "message": "PIN validated"
    }


@router.get("/{card_id}/pin/status")
async def get_pin_status(
    card_id: str,
    user_id: str = Depends(require_auth),
    pin_service: FISPinService = Depends(get_fis_pin_service)
):
    """Get PIN status."""
    response = await pin_service.get_pin_status(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get PIN status"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.post("/{card_id}/pin/unlock")
async def unlock_pin(
    card_id: str,
    user_id: str = Depends(require_auth),
    pin_service: FISPinService = Depends(get_fis_pin_service)
):
    """Unlock a locked PIN."""
    response = await pin_service.unlock_pin(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to unlock PIN"
        )

    return {
        "success": True,
        "message": "PIN unlocked successfully"
    }


@router.post("/{card_id}/pin/reset/otp")
async def request_pin_reset_otp(
    card_id: str,
    user_id: str = Depends(require_auth),
    pin_service: FISPinService = Depends(get_fis_pin_service)
):
    """Request OTP for PIN reset."""
    response = await pin_service.request_pin_reset_otp(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to send OTP"
        )

    return {
        "success": True,
        "message": "OTP sent successfully"
    }
