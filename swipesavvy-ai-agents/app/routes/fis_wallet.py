"""
FIS Global Payment One - Digital Wallet API Routes

Handles:
- Apple Pay provisioning
- Google Pay provisioning
- Samsung Pay provisioning
- Wallet token management
"""

import logging
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Header, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import verify_token_string
from app.services.fis_wallet_service import (
    get_fis_wallet_service,
    FISWalletService,
    WalletType,
    TokenStatus,
    DeviceType
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/cards", tags=["fis-wallet"])


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

class ApplePayProvisionRequest(BaseModel):
    """Request to provision Apple Pay"""
    device_id: str
    device_type: str = "phone"
    certificates: List[str]
    nonce: str
    nonce_signature: str


class GooglePayProvisionRequest(BaseModel):
    """Request to provision Google Pay"""
    device_id: str
    device_type: str = "phone"
    wallet_account_id: str
    device_info: Dict[str, Any]


class GooglePayPushTokenRequest(BaseModel):
    """Request to get Google Pay push token"""
    wallet_account_id: str


class SamsungPayProvisionRequest(BaseModel):
    """Request to provision Samsung Pay"""
    device_id: str
    device_type: str = "phone"
    wallet_user_id: str
    device_info: Dict[str, Any]


class SuspendTokenRequest(BaseModel):
    """Request to suspend a token"""
    reason: Optional[str] = None


class DeleteTokenRequest(BaseModel):
    """Request to delete a token"""
    reason: Optional[str] = None


# =============================================================================
# APPLE PAY ENDPOINTS
# =============================================================================

@router.get("/{card_id}/wallet/apple-pay/eligibility")
async def get_apple_pay_eligibility(
    card_id: str,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Check if a card is eligible for Apple Pay."""
    response = await wallet_service.get_apple_pay_eligibility(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to check eligibility"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.post("/{card_id}/wallet/apple-pay/provision")
async def provision_apple_pay(
    card_id: str,
    request: ApplePayProvisionRequest,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Provision a card for Apple Pay."""
    try:
        device_type = DeviceType(request.device_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid device type. Must be one of: {[d.value for d in DeviceType]}"
        )

    response = await wallet_service.provision_apple_pay(
        card_id=card_id,
        device_id=request.device_id,
        device_type=device_type,
        certificates=request.certificates,
        nonce=request.nonce,
        nonce_signature=request.nonce_signature
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to provision Apple Pay"
        )

    return {
        "success": True,
        "message": "Apple Pay provisioned successfully",
        "data": response.data
    }


# =============================================================================
# GOOGLE PAY ENDPOINTS
# =============================================================================

@router.get("/{card_id}/wallet/google-pay/eligibility")
async def get_google_pay_eligibility(
    card_id: str,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Check if a card is eligible for Google Pay."""
    response = await wallet_service.get_google_pay_eligibility(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to check eligibility"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.post("/{card_id}/wallet/google-pay/provision")
async def provision_google_pay(
    card_id: str,
    request: GooglePayProvisionRequest,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Provision a card for Google Pay."""
    try:
        device_type = DeviceType(request.device_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid device type. Must be one of: {[d.value for d in DeviceType]}"
        )

    response = await wallet_service.provision_google_pay(
        card_id=card_id,
        device_id=request.device_id,
        device_type=device_type,
        wallet_account_id=request.wallet_account_id,
        device_info=request.device_info
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to provision Google Pay"
        )

    return {
        "success": True,
        "message": "Google Pay provisioned successfully",
        "data": response.data
    }


@router.post("/{card_id}/wallet/google-pay/push-token")
async def get_google_pay_push_token(
    card_id: str,
    request: GooglePayPushTokenRequest,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Get push provisioning token for Google Pay."""
    response = await wallet_service.get_google_pay_push_token(
        card_id=card_id,
        wallet_account_id=request.wallet_account_id
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get push token"
        )

    return {
        "success": True,
        "data": response.data
    }


# =============================================================================
# SAMSUNG PAY ENDPOINTS
# =============================================================================

@router.post("/{card_id}/wallet/samsung-pay/provision")
async def provision_samsung_pay(
    card_id: str,
    request: SamsungPayProvisionRequest,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Provision a card for Samsung Pay."""
    try:
        device_type = DeviceType(request.device_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid device type. Must be one of: {[d.value for d in DeviceType]}"
        )

    response = await wallet_service.provision_samsung_pay(
        card_id=card_id,
        device_id=request.device_id,
        device_type=device_type,
        wallet_user_id=request.wallet_user_id,
        device_info=request.device_info
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to provision Samsung Pay"
        )

    return {
        "success": True,
        "message": "Samsung Pay provisioned successfully",
        "data": response.data
    }


# =============================================================================
# TOKEN MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/{card_id}/wallet/tokens")
async def get_wallet_tokens(
    card_id: str,
    wallet_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Get all wallet tokens for a card."""
    parsed_wallet_type = None
    if wallet_type:
        try:
            parsed_wallet_type = WalletType(wallet_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid wallet type. Must be one of: {[w.value for w in WalletType]}"
            )

    parsed_status = None
    if status:
        try:
            parsed_status = TokenStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {[s.value for s in TokenStatus]}"
            )

    response = await wallet_service.get_wallet_tokens(
        card_id=card_id,
        wallet_type=parsed_wallet_type,
        status=parsed_status
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get tokens"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.get("/{card_id}/wallet/tokens/{token_id}")
async def get_token(
    card_id: str,
    token_id: str,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Get details of a specific wallet token."""
    response = await wallet_service.get_token(
        card_id=card_id,
        token_id=token_id
    )

    if not response.success:
        raise HTTPException(
            status_code=404,
            detail=response.error_message or "Token not found"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.post("/{card_id}/wallet/tokens/{token_id}/suspend")
async def suspend_token(
    card_id: str,
    token_id: str,
    request: SuspendTokenRequest,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Suspend a wallet token."""
    response = await wallet_service.suspend_token(
        card_id=card_id,
        token_id=token_id,
        reason=request.reason
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to suspend token"
        )

    return {
        "success": True,
        "message": "Token suspended"
    }


@router.post("/{card_id}/wallet/tokens/{token_id}/resume")
async def resume_token(
    card_id: str,
    token_id: str,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Resume a suspended wallet token."""
    response = await wallet_service.resume_token(
        card_id=card_id,
        token_id=token_id
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to resume token"
        )

    return {
        "success": True,
        "message": "Token resumed"
    }


@router.delete("/{card_id}/wallet/tokens/{token_id}")
async def delete_token(
    card_id: str,
    token_id: str,
    request: DeleteTokenRequest,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Delete a wallet token."""
    response = await wallet_service.delete_token(
        card_id=card_id,
        token_id=token_id,
        reason=request.reason
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to delete token"
        )

    return {
        "success": True,
        "message": "Token deleted"
    }


@router.post("/{card_id}/wallet/tokens/suspend-all")
async def suspend_all_tokens(
    card_id: str,
    request: SuspendTokenRequest,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Suspend all wallet tokens for a card."""
    response = await wallet_service.suspend_all_tokens(
        card_id=card_id,
        reason=request.reason
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to suspend tokens"
        )

    return {
        "success": True,
        "message": "All tokens suspended"
    }


@router.delete("/{card_id}/wallet/tokens")
async def delete_all_tokens(
    card_id: str,
    request: DeleteTokenRequest,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Delete all wallet tokens for a card."""
    response = await wallet_service.delete_all_tokens(
        card_id=card_id,
        reason=request.reason
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to delete tokens"
        )

    return {
        "success": True,
        "message": "All tokens deleted"
    }


@router.get("/{card_id}/wallet/tokens/{token_id}/activity")
async def get_token_activity(
    card_id: str,
    token_id: str,
    user_id: str = Depends(require_auth),
    wallet_service: FISWalletService = Depends(get_fis_wallet_service)
):
    """Get activity history for a token."""
    response = await wallet_service.get_token_activity(
        card_id=card_id,
        token_id=token_id
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get token activity"
        )

    return {
        "success": True,
        "data": response.data
    }
