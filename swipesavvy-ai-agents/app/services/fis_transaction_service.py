"""
FIS Global Payment One - Transaction Service

Handles transaction operations:
- Transaction history retrieval
- Transaction details
- Pending authorizations
- Transaction categorization
- Dispute initiation
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from decimal import Decimal
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

class TransactionType(str, Enum):
    """Transaction types"""
    PURCHASE = "purchase"
    REFUND = "refund"
    ATM_WITHDRAWAL = "atm_withdrawal"
    ATM_DEPOSIT = "atm_deposit"
    TRANSFER = "transfer"
    FEE = "fee"
    ADJUSTMENT = "adjustment"
    REVERSAL = "reversal"


class TransactionStatus(str, Enum):
    """Transaction statuses"""
    PENDING = "pending"
    POSTED = "posted"
    DECLINED = "declined"
    REVERSED = "reversed"
    DISPUTED = "disputed"


class TransactionChannel(str, Enum):
    """Transaction channels"""
    POS = "pos"
    ATM = "atm"
    ECOMMERCE = "ecommerce"
    CONTACTLESS = "contactless"
    MOBILE = "mobile"
    RECURRING = "recurring"


class DisputeReason(str, Enum):
    """Dispute reasons"""
    UNAUTHORIZED = "unauthorized"
    DUPLICATE = "duplicate"
    INCORRECT_AMOUNT = "incorrect_amount"
    MERCHANDISE_NOT_RECEIVED = "merchandise_not_received"
    MERCHANDISE_NOT_AS_DESCRIBED = "merchandise_not_as_described"
    CANCELLED_RECURRING = "cancelled_recurring"
    CREDIT_NOT_PROCESSED = "credit_not_processed"
    OTHER = "other"


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class TransactionFilter(BaseModel):
    """Transaction filter parameters"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    transaction_type: Optional[TransactionType] = None
    status: Optional[TransactionStatus] = None
    channel: Optional[TransactionChannel] = None
    merchant_name: Optional[str] = None
    mcc_code: Optional[str] = None
    category: Optional[str] = None


class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=100)


class TransactionSummary(BaseModel):
    """Transaction summary for a period"""
    total_spent: Decimal
    total_refunds: Decimal
    transaction_count: int
    average_transaction: Decimal
    top_categories: List[Dict[str, Any]]
    top_merchants: List[Dict[str, Any]]


class TransactionDetail(BaseModel):
    """Detailed transaction information"""
    transaction_id: str
    card_id: str
    transaction_type: TransactionType
    status: TransactionStatus
    channel: TransactionChannel
    amount: Decimal
    currency: str = "USD"
    merchant_name: Optional[str] = None
    merchant_id: Optional[str] = None
    mcc_code: Optional[str] = None
    mcc_description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[Dict[str, str]] = None  # city, state, country
    timestamp: datetime
    posted_date: Optional[datetime] = None
    authorization_code: Optional[str] = None
    is_international: bool = False
    rewards_earned: Optional[Decimal] = None
    notes: Optional[str] = None


class DisputeRequest(BaseModel):
    """Dispute request"""
    transaction_id: str
    reason: DisputeReason
    description: str
    expected_credit_amount: Optional[Decimal] = None
    supporting_documents: List[str] = Field(default_factory=list)  # Document URLs


class DisputeResponse(BaseModel):
    """Dispute response"""
    dispute_id: str
    transaction_id: str
    status: str
    reason: DisputeReason
    created_at: datetime
    expected_resolution_date: Optional[date] = None
    provisional_credit_amount: Optional[Decimal] = None
    provisional_credit_date: Optional[date] = None


# =============================================================================
# FIS TRANSACTION SERVICE
# =============================================================================

class FISTransactionService:
    """
    Service for FIS transaction operations.
    """

    def __init__(self, fis_service: Optional[FISGlobalService] = None):
        """
        Initialize transaction service.

        Args:
            fis_service: FIS Global service instance
        """
        self.fis = fis_service or get_fis_service()

    # =========================================================================
    # TRANSACTION RETRIEVAL
    # =========================================================================

    async def get_transactions(
        self,
        card_id: str,
        filters: Optional[TransactionFilter] = None,
        pagination: Optional[PaginationParams] = None
    ) -> FISAPIResponse:
        """
        Get transactions for a card with optional filters.

        Args:
            card_id: FIS card ID
            filters: Optional transaction filters
            pagination: Optional pagination parameters

        Returns:
            FISAPIResponse with transactions list
        """
        logger.info(f"Getting transactions for card {card_id}")

        params: Dict[str, Any] = {}

        if filters:
            if filters.start_date:
                params["start_date"] = filters.start_date.isoformat()
            if filters.end_date:
                params["end_date"] = filters.end_date.isoformat()
            if filters.min_amount is not None:
                params["min_amount"] = float(filters.min_amount)
            if filters.max_amount is not None:
                params["max_amount"] = float(filters.max_amount)
            if filters.transaction_type:
                params["type"] = filters.transaction_type.value
            if filters.status:
                params["status"] = filters.status.value
            if filters.channel:
                params["channel"] = filters.channel.value
            if filters.merchant_name:
                params["merchant"] = filters.merchant_name
            if filters.mcc_code:
                params["mcc"] = filters.mcc_code
            if filters.category:
                params["category"] = filters.category

        if pagination:
            params["page"] = pagination.page
            params["page_size"] = pagination.page_size
        else:
            params["page"] = 1
            params["page_size"] = 25

        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/transactions",
            params=params
        )

    async def get_transaction(
        self,
        card_id: str,
        transaction_id: str
    ) -> FISAPIResponse:
        """
        Get details of a specific transaction.

        Args:
            card_id: FIS card ID
            transaction_id: Transaction ID

        Returns:
            FISAPIResponse with transaction details
        """
        logger.info(f"Getting transaction {transaction_id} for card {card_id}")

        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/transactions/{transaction_id}"
        )

    async def get_pending_transactions(
        self,
        card_id: str
    ) -> FISAPIResponse:
        """
        Get pending (not yet posted) transactions.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with pending transactions
        """
        logger.info(f"Getting pending transactions for card {card_id}")

        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/transactions/pending"
        )

    async def get_recent_transactions(
        self,
        card_id: str,
        limit: int = 10
    ) -> FISAPIResponse:
        """
        Get most recent transactions.

        Args:
            card_id: FIS card ID
            limit: Number of transactions to return (max 50)

        Returns:
            FISAPIResponse with recent transactions
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/transactions/recent",
            params={"limit": min(limit, 50)}
        )

    # =========================================================================
    # TRANSACTION SUMMARY & ANALYTICS
    # =========================================================================

    async def get_transaction_summary(
        self,
        card_id: str,
        start_date: date,
        end_date: date
    ) -> FISAPIResponse:
        """
        Get transaction summary for a period.

        Args:
            card_id: FIS card ID
            start_date: Start date
            end_date: End date

        Returns:
            FISAPIResponse with summary data
        """
        logger.info(f"Getting transaction summary for card {card_id}")

        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/transactions/summary",
            params={
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
        )

    async def get_spending_by_category(
        self,
        card_id: str,
        start_date: date,
        end_date: date
    ) -> FISAPIResponse:
        """
        Get spending breakdown by category.

        Args:
            card_id: FIS card ID
            start_date: Start date
            end_date: End date

        Returns:
            FISAPIResponse with category breakdown
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/transactions/categories",
            params={
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
        )

    async def get_spending_by_merchant(
        self,
        card_id: str,
        start_date: date,
        end_date: date,
        limit: int = 10
    ) -> FISAPIResponse:
        """
        Get spending breakdown by merchant.

        Args:
            card_id: FIS card ID
            start_date: Start date
            end_date: End date
            limit: Number of top merchants to return

        Returns:
            FISAPIResponse with merchant breakdown
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/transactions/merchants",
            params={
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "limit": limit
            }
        )

    # =========================================================================
    # DISPUTES
    # =========================================================================

    async def initiate_dispute(
        self,
        card_id: str,
        transaction_id: str,
        reason: DisputeReason,
        description: str,
        expected_credit_amount: Optional[Decimal] = None,
        supporting_documents: Optional[List[str]] = None
    ) -> FISAPIResponse:
        """
        Initiate a dispute for a transaction.

        Args:
            card_id: FIS card ID
            transaction_id: Transaction ID to dispute
            reason: Dispute reason
            description: Detailed description of the issue
            expected_credit_amount: Expected credit amount
            supporting_documents: List of document URLs

        Returns:
            FISAPIResponse with dispute details
        """
        logger.info(f"Initiating dispute for transaction {transaction_id}")

        payload = {
            "transaction_id": transaction_id,
            "reason": reason.value,
            "description": description
        }

        if expected_credit_amount is not None:
            payload["expected_credit_amount"] = float(expected_credit_amount)

        if supporting_documents:
            payload["supporting_documents"] = supporting_documents

        response = await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/disputes",
            data=payload
        )

        if response.success:
            logger.info(f"Dispute initiated: {response.data.get('dispute_id')}")
        else:
            logger.error(f"Failed to initiate dispute: {response.error_message}")

        return response

    async def get_disputes(
        self,
        card_id: str,
        status: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Get disputes for a card.

        Args:
            card_id: FIS card ID
            status: Optional status filter (open, closed, pending)

        Returns:
            FISAPIResponse with disputes list
        """
        params = {}
        if status:
            params["status"] = status

        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/disputes",
            params=params
        )

    async def get_dispute(
        self,
        card_id: str,
        dispute_id: str
    ) -> FISAPIResponse:
        """
        Get details of a specific dispute.

        Args:
            card_id: FIS card ID
            dispute_id: Dispute ID

        Returns:
            FISAPIResponse with dispute details
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/disputes/{dispute_id}"
        )

    async def add_dispute_document(
        self,
        card_id: str,
        dispute_id: str,
        document_url: str,
        document_type: str
    ) -> FISAPIResponse:
        """
        Add a supporting document to a dispute.

        Args:
            card_id: FIS card ID
            dispute_id: Dispute ID
            document_url: URL of the document
            document_type: Type of document (receipt, correspondence, etc.)

        Returns:
            FISAPIResponse with update status
        """
        logger.info(f"Adding document to dispute {dispute_id}")

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/disputes/{dispute_id}/documents",
            data={
                "document_url": document_url,
                "document_type": document_type
            }
        )

    # =========================================================================
    # TRANSACTION NOTES
    # =========================================================================

    async def add_transaction_note(
        self,
        card_id: str,
        transaction_id: str,
        note: str
    ) -> FISAPIResponse:
        """
        Add a note/memo to a transaction.

        Args:
            card_id: FIS card ID
            transaction_id: Transaction ID
            note: Note text

        Returns:
            FISAPIResponse with update status
        """
        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/transactions/{transaction_id}/notes",
            data={"note": note}
        )

    async def categorize_transaction(
        self,
        card_id: str,
        transaction_id: str,
        category: str
    ) -> FISAPIResponse:
        """
        Manually categorize a transaction.

        Args:
            card_id: FIS card ID
            transaction_id: Transaction ID
            category: Category name

        Returns:
            FISAPIResponse with update status
        """
        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/cards/{card_id}/transactions/{transaction_id}/category",
            data={"category": category}
        )


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_transaction_service: Optional[FISTransactionService] = None


def get_fis_transaction_service() -> FISTransactionService:
    """Get or create singleton FIS Transaction service instance"""
    global _transaction_service
    if _transaction_service is None:
        _transaction_service = FISTransactionService()
    return _transaction_service


# Export singleton
fis_transaction_service = get_fis_transaction_service()
