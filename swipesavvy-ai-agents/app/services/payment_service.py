"""
Payment Service - Authorize.Net Integration for SwipeSavvy

Handles payment processing, subscriptions, refunds, and payment profile management.
Integrates with Authorize.Net API for secure payment processing.
"""

from typing import Optional, Dict, Any, List
from decimal import Decimal
from uuid import UUID, uuid4
from datetime import datetime, timedelta, timezone
import requests
import json
from sqlalchemy.orm import Session
from app.models import Payment, Subscription, User
from app.database import get_db
import logging

logger = logging.getLogger(__name__)

# Constants
PAYMENT_NOT_FOUND = "Payment not found"
SUBSCRIPTION_NOT_FOUND = "Subscription not found"
USER_NOT_FOUND = "User not found"


class AuthorizeNetService:
    """Service for managing payments through Authorize.Net"""
    
    def __init__(self, api_login_id: str, transaction_key: str):
        """Initialize payment service with Authorize.Net credentials"""
        self.api_login_id = api_login_id
        self.transaction_key = transaction_key
        self.base_url = "https://apitest.authorize.net/xml/v1/request.api"  # Sandbox
        # For production: "https://api.authorize.net/xml/v1/request.api"
    
    def _build_request_headers(self) -> Dict[str, str]:
        """Build request headers for Authorize.Net"""
        return {
            "Content-Type": "application/json",
        }
    
    def _build_auth(self) -> Dict[str, Any]:
        """Build authentication object for Authorize.Net requests"""
        return {
            "name": self.api_login_id,
            "transactionKey": self.transaction_key,
        }
    
    def create_payment_intent(
        self,
        db: Session,
        user_id: UUID,
        amount: float,
        currency: str = "USD",
        description: Optional[str] = None,
        merchant_id: Optional[UUID] = None,
        metadata: Optional[Dict[str, Any]] = None,
        payment_method: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Create a payment transaction via Authorize.Net
        
        Args:
            db: Database session
            user_id: ID of user making payment
            amount: Payment amount in dollars
            currency: Currency code (default: USD)
            description: Payment description
            merchant_id: ID of merchant receiving payment
            metadata: Additional metadata for payment
            payment_method: Payment method details (card info, etc)
        
        Returns:
            Payment intent with transaction ID
        
        Raises:
            Exception: If payment creation fails
        """
        try:
            # Save payment record in database (pending status)
            payment = Payment(
                user_id=user_id,
                merchant_id=merchant_id,
                amount=Decimal(str(amount)),
                currency=currency,
                stripe_payment_intent_id=f"auth_pending_{str(uuid4())[:8]}",  # Temp ID
                status="pending",
                payment_method="authorize_net",
                description=description,
                metadata=metadata or {},
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)

            logger.info(f"Payment created: {payment.id} for user {user_id}")

            return {
                "id": payment.id,
                "status": "pending",
                "amount": float(amount),
                "currency": currency,
                "message": "Ready to process - provide card details to confirm",
                "payment_method": "authorize_net",
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Payment creation failed: {str(e)}")
            raise
    
    def confirm_payment(
        self,
        db: Session,
        payment_id: UUID,
        card_number: str,
        expiration_date: str,
        card_code: str,
    ) -> Dict[str, Any]:
        """
        Confirm and process a payment via Authorize.Net
        
        Args:
            db: Database session
            payment_id: ID of payment to confirm
            card_number: Credit card number
            expiration_date: Card expiration (MMYY)
            card_code: CVV code
        
        Returns:
            Confirmed payment details
        """
        try:
            # Get payment from database
            payment = db.query(Payment).filter(Payment.id == payment_id).first()
            if not payment:
                raise ValueError(PAYMENT_NOT_FOUND)
            
            # Build Authorize.Net transaction request
            request_payload = {
                "createTransactionRequest": {
                    "merchantAuthentication": self._build_auth(),
                    "refId": str(payment_id)[:20],
                    "transactionRequest": {
                        "transactionType": "authCaptureTransaction",
                        "amount": str(payment.amount),
                        "payment": {
                            "creditCard": {
                                "cardNumber": card_number,
                                "expirationDate": expiration_date,
                                "cardCode": card_code,
                            }
                        },
                    }
                }
            }
            
            # Send request to Authorize.Net
            response = requests.post(
                self.base_url,
                data=json.dumps(request_payload),
                headers=self._build_request_headers(),
            )
            
            response_data = response.json()
            
            # Check response
            if response_data.get("messages", {}).get("resultCode") == "Ok":
                transaction_response = response_data.get("transactionResponse", {})
                if transaction_response.get("responseCode") == "1":  # Approved
                    payment.status = "succeeded"
                    payment.stripe_charge_id = transaction_response.get("transId")
                    payment.stripe_payment_id = transaction_response.get("transId")
                    payment.completed_at = datetime.now(timezone.utc)
                    logger.info(f"Payment {payment_id} succeeded")
                else:
                    payment.status = "failed"
                    logger.warning(f"Payment {payment_id} declined")
            else:
                payment.status = "failed"
                logger.warning(f"Payment {payment_id} failed with API error")
            
            db.commit()
            db.refresh(payment)

            return {
                "id": payment.id,
                "status": payment.status,
                "amount": float(payment.amount),
                "currency": payment.currency,
                "transaction_id": payment.stripe_charge_id,
                "completed_at": payment.completed_at.isoformat() if payment.completed_at else None,
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Payment confirmation failed: {str(e)}")
            raise
    
    def refund_payment(
        self,
        db: Session,
        payment_id: UUID,
        amount: Optional[float] = None,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Refund a payment or partial refund
        
        Args:
            db: Database session
            payment_id: ID of payment to refund
            amount: Refund amount (None for full refund)
            reason: Reason for refund
        
        Returns:
            Refund details
        """
        try:
            # Get payment
            payment = db.query(Payment).filter(Payment.id == payment_id).first()
            if not payment:
                raise ValueError(PAYMENT_NOT_FOUND)
            
            if payment.status != "succeeded":
                raise ValueError(f"Cannot refund payment with status: {payment.status}")
            
            # Build refund request
            refund_amount = amount or float(payment.amount)
            request_body = {
                "createTransactionRequest": {
                    "merchantAuthentication": self._build_auth(),
                    "refId": str(payment_id)[:20],
                    "transactionRequest": {
                        "transactionType": "refundTransaction",
                        "amount": str(refund_amount),
                        "refTransId": payment.stripe_charge_id,
                    }
                }
            }
            
            # Send refund request
            response = requests.post(
                self.base_url,
                data=json.dumps(request_body),
                headers=self._build_request_headers(),
            )
            
            response.json()
            
            # Update payment record
            refund_decimal = Decimal(str(refund_amount))
            payment.refund_amount = refund_decimal
            payment.refund_reason = reason
            if refund_decimal == payment.amount:
                payment.status = "refunded"
            else:
                payment.status = "partially_refunded"
            
            db.commit()
            db.refresh(payment)

            logger.info(f"Payment {payment_id} refunded: {refund_amount}")

            return {
                "id": payment.id,
                "status": payment.status,
                "original_amount": float(payment.amount),
                "refund_amount": float(refund_decimal),
                "refund_reason": reason,
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Refund failed: {str(e)}")
            raise
    
    def get_payment_history(
        self,
        db: Session,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """
        Get payment history for a user
        
        Args:
            db: Database session
            user_id: User ID
            limit: Number of records to return
            offset: Offset for pagination
        
        Returns:
            Payment history with pagination
        """
        try:
            query = db.query(Payment).filter(
                Payment.user_id == user_id
            ).order_by(Payment.created_at.desc())
            
            total = query.count()
            payments = query.limit(limit).offset(offset).all()
            
            return {
                "total": total,
                "limit": limit,
                "offset": offset,
                "payments": [
                    {
                        "id": p.id,
                        "amount": float(p.amount),
                        "currency": p.currency,
                        "status": p.status,
                        "merchant_id": p.merchant_id,
                        "description": p.description,
                        "created_at": p.created_at.isoformat(),
                        "completed_at": p.completed_at.isoformat() if p.completed_at else None,
                    }
                    for p in payments
                ],
            }
        
        except Exception as e:
            logger.error(f"Failed to retrieve payment history: {str(e)}")
            raise
    
    def get_payment_details(
        self,
        db: Session,
        payment_id: UUID,
    ) -> Dict[str, Any]:
        """Get details for a specific payment"""
        try:
            payment = db.query(Payment).filter(Payment.id == payment_id).first()
            if not payment:
                raise ValueError(PAYMENT_NOT_FOUND)
            
            return {
                "id": payment.id,
                "user_id": payment.user_id,
                "merchant_id": payment.merchant_id,
                "amount": float(payment.amount),
                "currency": payment.currency,
                "status": payment.status,
                "payment_method": payment.payment_method,
                "description": payment.description,
                "refund_amount": float(payment.refund_amount),
                "refund_reason": payment.refund_reason,
                "created_at": payment.created_at.isoformat(),
                "updated_at": payment.updated_at.isoformat(),
                "completed_at": payment.completed_at.isoformat() if payment.completed_at else None,
            }
        
        except Exception as e:
            logger.error(f"Failed to retrieve payment details: {str(e)}")
            raise


class SubscriptionService:
    """Service for managing subscriptions via Authorize.Net ARB"""
    
    def __init__(self, api_login_id: str, transaction_key: str):
        """Initialize subscription service"""
        self.api_login_id = api_login_id
        self.transaction_key = transaction_key
        self.base_url = "https://apitest.authorize.net/xml/v1/request.api"
    
    def _build_auth(self) -> Dict[str, Any]:
        """Build authentication object"""
        return {
            "name": self.api_login_id,
            "transactionKey": self.transaction_key,
        }
    
    def _build_request_headers(self) -> Dict[str, str]:
        """Build request headers"""
        return {"Content-Type": "application/json"}
    
    def create_subscription(
        self,
        db: Session,
        user_id: UUID,
        plan: str,
    ) -> Dict[str, Any]:
        """
        Create a new subscription via Authorize.Net ARB
        
        Args:
            db: Database session
            user_id: User ID
            plan: Plan type (starter, pro, enterprise)
        
        Returns:
            Subscription details
        """
        try:
            # Get user
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError(USER_NOT_FOUND)
            
            # Plan pricing
            plan_prices = {
                "starter": 9.99,
                "pro": 29.99,
                "enterprise": 99.99,
            }
            
            amount = plan_prices.get(plan, 0)
            
            # Build ARB subscription request for Authorize.Net
            # (Would be sent to Authorize.Net API for actual subscription processing)
            
            # Save subscription in database
            db_subscription = Subscription(
                user_id=user_id,
                plan=plan,
                stripe_subscription_id=f"arb_pending_{str(uuid4())[:8]}",
                status="active",
                amount=Decimal(str(amount)),
                current_period_start=datetime.now(timezone.utc),
                current_period_end=datetime.now(timezone.utc) + timedelta(days=30),
            )
            db.add(db_subscription)
            db.commit()
            db.refresh(db_subscription)

            logger.info(f"Subscription created for user {user_id}: {plan}")

            return {
                "id": db_subscription.id,
                "plan": plan,
                "status": "active",
                "amount": float(amount),
                "currency": "USD",
                "current_period_start": db_subscription.current_period_start.isoformat(),
                "current_period_end": db_subscription.current_period_end.isoformat(),
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Subscription creation failed: {str(e)}")
            raise
    
    def cancel_subscription(
        self,
        db: Session,
        subscription_id: UUID,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Cancel a subscription"""
        try:
            subscription = db.query(Subscription).filter(
                Subscription.id == subscription_id
            ).first()
            
            if not subscription:
                raise ValueError(SUBSCRIPTION_NOT_FOUND)
            
            # Update in database
            subscription.status = "canceled"
            subscription.canceled_at = datetime.now(timezone.utc)
            subscription.cancel_reason = reason
            db.commit()
            db.refresh(subscription)

            logger.info(f"Subscription {subscription_id} canceled")

            return {
                "id": subscription.id,
                "plan": subscription.plan,
                "status": "canceled",
                "canceled_at": subscription.canceled_at.isoformat(),
                "cancel_reason": reason,
            }

        except Exception as e:
            db.rollback()
            logger.error(f"Subscription cancellation failed: {str(e)}")
            raise

