"""
Payment API Routes for SwipeSavvy

Endpoints for payment processing, subscriptions, refunds, and payment history.
Integrates with Authorize.Net for secure payment handling.
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field
from app.database import get_db
from app.models import Payment, Subscription
from app.services.payment_service import AuthorizeNetService, SubscriptionService
from app.core.auth import verify_jwt_token
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

# Error message constants
PAYMENT_NOT_FOUND = "Payment not found"

# Initialize services
payment_service = AuthorizeNetService(
    settings.AUTHORIZE_NET_API_LOGIN_ID,
    settings.AUTHORIZE_NET_TRANSACTION_KEY,
)
subscription_service = SubscriptionService(
    settings.AUTHORIZE_NET_API_LOGIN_ID,
    settings.AUTHORIZE_NET_TRANSACTION_KEY,
)


# ============================================
# Request/Response Models
# ============================================

class CreatePaymentIntentRequest(BaseModel):
    """Create payment intent request"""
    amount: float = Field(..., gt=0, description="Payment amount in dollars")
    currency: str = Field(default="USD", description="Currency code")
    description: Optional[str] = Field(None, description="Payment description")
    merchant_id: Optional[UUID] = Field(None, description="Merchant ID if applicable")
    metadata: Optional[dict] = Field(None, description="Additional metadata")


class ConfirmPaymentRequest(BaseModel):
    """Confirm payment request"""
    payment_method_id: str = Field(..., description="Stripe payment method ID")


class RefundPaymentRequest(BaseModel):
    """Refund payment request"""
    amount: Optional[float] = Field(None, description="Refund amount (None for full)")
    reason: Optional[str] = Field(None, description="Reason for refund")


class CreateSubscriptionRequest(BaseModel):
    """Create subscription request"""
    plan: str = Field(..., description="Plan type (starter, pro, enterprise)")
    payment_method_id: str = Field(..., description="Stripe payment method ID")


class PaymentResponse(BaseModel):
    """Payment response"""
    id: UUID
    status: str
    amount: float
    currency: str
    description: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None


class PaymentHistoryResponse(BaseModel):
    """Payment history response"""
    total: int
    limit: int
    offset: int
    payments: list[PaymentResponse]


# ============================================
# Payment Endpoints
# ============================================

@router.post("/create-intent", response_model=dict)
async def create_payment_intent(
    request: CreatePaymentIntentRequest,
    user_id: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Create a Stripe payment intent
    
    - **amount**: Payment amount in dollars
    - **currency**: Currency code (default: USD)
    - **description**: Optional payment description
    - **merchant_id**: Optional merchant ID
    
    Returns:
    - **client_secret**: Use this to confirm payment on frontend
    - **stripe_id**: Stripe payment intent ID
    """
    try:
        user_uuid = UUID(user_id)
        merchant_uuid = UUID(str(request.merchant_id)) if request.merchant_id else None
        
        result = payment_service.create_payment_intent(
            db=db,
            user_id=user_uuid,
            amount=request.amount,
            currency=request.currency,
            description=request.description,
            merchant_id=merchant_uuid,
            metadata=request.metadata,
        )
        
        return {
            "success": True,
            "data": result,
        }
    
    except Exception as e:
        logger.error(f"Failed to create payment intent: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/confirm", response_model=dict)
async def confirm_payment(
    payment_id: UUID,
    request: ConfirmPaymentRequest,
    user_id: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Confirm and process a payment intent
    
    - **payment_id**: Payment ID to confirm
    - **payment_method_id**: Stripe payment method ID
    
    Returns confirmed payment details
    """
    try:
        user_uuid = UUID(user_id)
        
        # Verify payment belongs to user
        payment = db.query(Payment).filter(
            Payment.id == payment_id,
            Payment.user_id == user_uuid,
        ).first()
        
        if not payment:
            raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)
        
        result = payment_service.confirm_payment(
            db=db,
            payment_id=payment_id,
            payment_method_id=request.payment_method_id,
        )
        
        return {
            "success": True,
            "data": result,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to confirm payment: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{payment_id}/refund", response_model=dict)
async def refund_payment(
    payment_id: UUID,
    request: RefundPaymentRequest,
    user_id: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Refund a payment (full or partial)
    
    - **payment_id**: Payment ID to refund
    - **amount**: Refund amount (None for full refund)
    - **reason**: Reason for refund
    
    Returns refund details
    """
    try:
        user_uuid = UUID(user_id)
        
        # Verify payment belongs to user
        payment = db.query(Payment).filter(
            Payment.id == payment_id,
            Payment.user_id == user_uuid,
        ).first()
        
        if not payment:
            raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)
        
        result = payment_service.refund_payment(
            db=db,
            payment_id=payment_id,
            amount=request.amount,
            reason=request.reason,
        )
        
        return {
            "success": True,
            "data": result,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to refund payment: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/history", response_model=dict)
async def get_payment_history(
    limit: int = 50,
    offset: int = 0,
    user_id: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Get payment history for authenticated user
    
    - **limit**: Number of records to return (default: 50)
    - **offset**: Pagination offset (default: 0)
    
    Returns paginated payment history
    """
    try:
        user_uuid = UUID(user_id)
        result = payment_service.get_payment_history(
            db=db,
            user_id=user_uuid,
            limit=limit,
            offset=offset,
        )
        
        return {
            "success": True,
            "data": result,
        }
    
    except Exception as e:
        logger.error(f"Failed to retrieve payment history: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{payment_id}", response_model=dict)
async def get_payment(
    payment_id: UUID,
    user_id: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Get details for a specific payment
    
    - **payment_id**: Payment ID
    
    Returns payment details
    """
    try:
        user_uuid = UUID(user_id)
        
        # Verify payment belongs to user
        payment = db.query(Payment).filter(
            Payment.id == payment_id,
            Payment.user_id == user_uuid,
        ).first()
        
        if not payment:
            raise HTTPException(status_code=404, detail=PAYMENT_NOT_FOUND)
        
        result = payment_service.get_payment_details(
            db=db,
            payment_id=payment_id,
        )
        
        return {
            "success": True,
            "data": result,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve payment: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# Subscription Endpoints
# ============================================

@router.post("/subscriptions", response_model=dict)
async def create_subscription(
    request: CreateSubscriptionRequest,
    user_id: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Create a new subscription
    
    - **plan**: Plan type (starter, pro, enterprise)
    - **payment_method_id**: Stripe payment method ID
    
    Returns subscription details
    """
    try:
        user_uuid = UUID(user_id)
        
        # Check if user already has subscription
        existing = db.query(Subscription).filter(
            Subscription.user_id == user_uuid,
            Subscription.status == "active",
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail="User already has an active subscription",
            )
        
        result = subscription_service.create_subscription(
            db=db,
            user_id=user_uuid,
            plan=request.plan,
            payment_method_id=request.payment_method_id,
        )
        
        return {
            "success": True,
            "data": result,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create subscription: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/subscriptions/{subscription_id}/cancel", response_model=dict)
async def cancel_subscription(
    subscription_id: UUID,
    reason: Optional[str] = None,
    user_id: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Cancel a subscription
    
    - **subscription_id**: Subscription ID
    - **reason**: Optional reason for cancellation
    
    Returns cancellation confirmation
    """
    try:
        user_uuid = UUID(user_id)
        
        # Verify subscription belongs to user
        subscription = db.query(Subscription).filter(
            Subscription.id == subscription_id,
            Subscription.user_id == user_uuid,
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        result = subscription_service.cancel_subscription(
            db=db,
            subscription_id=subscription_id,
            reason=reason,
        )
        
        return {
            "success": True,
            "data": result,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel subscription: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/subscriptions/user/{user_id}", response_model=dict)
async def get_user_subscription(
    user_id: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db),
):
    """
    Get active subscription for user
    
    Returns subscription details or 404 if none active
    """
    try:
        user_uuid = UUID(user_id)
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user_uuid,
            Subscription.status.in_(["active", "past_due"]),
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="No active subscription")
        
        return {
            "success": True,
            "data": {
                "id": subscription.id,
                "plan": subscription.plan,
                "status": subscription.status,
                "amount": float(subscription.amount) if subscription.amount else None,
                "current_period_start": subscription.current_period_start.isoformat(),
                "current_period_end": subscription.current_period_end.isoformat(),
            },
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve subscription: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
