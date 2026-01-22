"""
FIS Global Payment One - Transaction API Routes

Handles:
- Transaction history
- Transaction details
- Pending authorizations
- Transaction analytics
- Disputes
"""

import logging
from datetime import date
from typing import Optional, List
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Depends, Header, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.auth import verify_token_string
from app.services.fis_transaction_service import (
    get_fis_transaction_service,
    FISTransactionService,
    TransactionFilter,
    PaginationParams,
    TransactionType,
    TransactionStatus,
    TransactionChannel,
    DisputeReason
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/fis/cards", tags=["fis-transactions"])


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

class DisputeRequest(BaseModel):
    """Request to initiate a dispute"""
    reason: str
    description: str
    expected_credit_amount: Optional[float] = None
    supporting_documents: List[str] = Field(default_factory=list)


class AddDocumentRequest(BaseModel):
    """Request to add a document to a dispute"""
    document_url: str
    document_type: str


class TransactionNoteRequest(BaseModel):
    """Request to add a note to a transaction"""
    note: str


class CategorizeTransactionRequest(BaseModel):
    """Request to categorize a transaction"""
    category: str


# =============================================================================
# TRANSACTION ENDPOINTS
# =============================================================================

@router.get("/{card_id}/transactions")
async def get_transactions(
    card_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    transaction_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    merchant_name: Optional[str] = Query(None),
    mcc_code: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Get transactions for a card with optional filters."""
    # Build filter
    filters = TransactionFilter(
        start_date=start_date,
        end_date=end_date,
        min_amount=Decimal(str(min_amount)) if min_amount else None,
        max_amount=Decimal(str(max_amount)) if max_amount else None,
        transaction_type=TransactionType(transaction_type) if transaction_type else None,
        status=TransactionStatus(status) if status else None,
        channel=TransactionChannel(channel) if channel else None,
        merchant_name=merchant_name,
        mcc_code=mcc_code,
        category=category
    )

    pagination = PaginationParams(page=page, page_size=page_size)

    response = await tx_service.get_transactions(
        card_id=card_id,
        filters=filters,
        pagination=pagination
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get transactions"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.get("/{card_id}/transactions/recent")
async def get_recent_transactions(
    card_id: str,
    limit: int = Query(10, ge=1, le=50),
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Get most recent transactions."""
    response = await tx_service.get_recent_transactions(
        card_id=card_id,
        limit=limit
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get recent transactions"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.get("/{card_id}/transactions/pending")
async def get_pending_transactions(
    card_id: str,
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Get pending (not yet posted) transactions."""
    response = await tx_service.get_pending_transactions(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get pending transactions"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.get("/{card_id}/transactions/{transaction_id}")
async def get_transaction(
    card_id: str,
    transaction_id: str,
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Get details of a specific transaction."""
    response = await tx_service.get_transaction(
        card_id=card_id,
        transaction_id=transaction_id
    )

    if not response.success:
        raise HTTPException(
            status_code=404,
            detail=response.error_message or "Transaction not found"
        )

    return {
        "success": True,
        "data": response.data
    }


# =============================================================================
# ANALYTICS ENDPOINTS
# =============================================================================

@router.get("/{card_id}/transactions/summary")
async def get_transaction_summary(
    card_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Get transaction summary for a period."""
    response = await tx_service.get_transaction_summary(
        card_id=card_id,
        start_date=start_date,
        end_date=end_date
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get summary"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.get("/{card_id}/transactions/categories")
async def get_spending_by_category(
    card_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Get spending breakdown by category."""
    response = await tx_service.get_spending_by_category(
        card_id=card_id,
        start_date=start_date,
        end_date=end_date
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get category breakdown"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.get("/{card_id}/transactions/merchants")
async def get_spending_by_merchant(
    card_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    limit: int = Query(10, ge=1, le=50),
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Get spending breakdown by merchant."""
    response = await tx_service.get_spending_by_merchant(
        card_id=card_id,
        start_date=start_date,
        end_date=end_date,
        limit=limit
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get merchant breakdown"
        )

    return {
        "success": True,
        "data": response.data
    }


# =============================================================================
# DISPUTE ENDPOINTS
# =============================================================================

@router.post("/{card_id}/transactions/{transaction_id}/dispute")
async def initiate_dispute(
    card_id: str,
    transaction_id: str,
    request: DisputeRequest,
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Initiate a dispute for a transaction."""
    try:
        reason = DisputeReason(request.reason)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid dispute reason. Must be one of: {[r.value for r in DisputeReason]}"
        )

    response = await tx_service.initiate_dispute(
        card_id=card_id,
        transaction_id=transaction_id,
        reason=reason,
        description=request.description,
        expected_credit_amount=Decimal(str(request.expected_credit_amount)) if request.expected_credit_amount else None,
        supporting_documents=request.supporting_documents
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to initiate dispute"
        )

    return {
        "success": True,
        "message": "Dispute initiated",
        "data": response.data
    }


@router.get("/{card_id}/disputes")
async def get_disputes(
    card_id: str,
    status: Optional[str] = Query(None),
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Get disputes for a card."""
    response = await tx_service.get_disputes(
        card_id=card_id,
        status=status
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to get disputes"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.get("/{card_id}/disputes/{dispute_id}")
async def get_dispute(
    card_id: str,
    dispute_id: str,
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Get details of a specific dispute."""
    response = await tx_service.get_dispute(
        card_id=card_id,
        dispute_id=dispute_id
    )

    if not response.success:
        raise HTTPException(
            status_code=404,
            detail=response.error_message or "Dispute not found"
        )

    return {
        "success": True,
        "data": response.data
    }


@router.post("/{card_id}/disputes/{dispute_id}/documents")
async def add_dispute_document(
    card_id: str,
    dispute_id: str,
    request: AddDocumentRequest,
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Add a supporting document to a dispute."""
    response = await tx_service.add_dispute_document(
        card_id=card_id,
        dispute_id=dispute_id,
        document_url=request.document_url,
        document_type=request.document_type
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to add document"
        )

    return {
        "success": True,
        "message": "Document added to dispute"
    }


# =============================================================================
# TRANSACTION NOTES/CATEGORIZATION
# =============================================================================

@router.post("/{card_id}/transactions/{transaction_id}/notes")
async def add_transaction_note(
    card_id: str,
    transaction_id: str,
    request: TransactionNoteRequest,
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Add a note to a transaction."""
    response = await tx_service.add_transaction_note(
        card_id=card_id,
        transaction_id=transaction_id,
        note=request.note
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to add note"
        )

    return {
        "success": True,
        "message": "Note added"
    }


@router.put("/{card_id}/transactions/{transaction_id}/category")
async def categorize_transaction(
    card_id: str,
    transaction_id: str,
    request: CategorizeTransactionRequest,
    user_id: str = Depends(require_auth),
    tx_service: FISTransactionService = Depends(get_fis_transaction_service)
):
    """Manually categorize a transaction."""
    response = await tx_service.categorize_transaction(
        card_id=card_id,
        transaction_id=transaction_id,
        category=request.category
    )

    if not response.success:
        raise HTTPException(
            status_code=400,
            detail=response.error_message or "Failed to categorize transaction"
        )

    return {
        "success": True,
        "message": "Transaction categorized"
    }
