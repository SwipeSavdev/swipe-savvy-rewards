"""
FIS Global Payment One - Webhook Handler Routes

Handles incoming webhooks from FIS:
- Transaction events (authorization, posting, decline)
- Card status changes
- Fraud alerts
- PIN events
- Wallet token events
"""

import logging
import hmac
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from enum import Enum

from fastapi import APIRouter, HTTPException, Request, Header, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal
from app.services.fis_global_service import get_fis_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/webhooks/fis", tags=["fis-webhooks"])


# =============================================================================
# WEBHOOK EVENT TYPES
# =============================================================================

class WebhookEventType(str, Enum):
    """FIS webhook event types"""
    # Transaction events
    TRANSACTION_AUTHORIZED = "transaction.authorized"
    TRANSACTION_POSTED = "transaction.posted"
    TRANSACTION_DECLINED = "transaction.declined"
    TRANSACTION_REVERSED = "transaction.reversed"
    TRANSACTION_REFUNDED = "transaction.refunded"

    # Card events
    CARD_ACTIVATED = "card.activated"
    CARD_LOCKED = "card.locked"
    CARD_UNLOCKED = "card.unlocked"
    CARD_FROZEN = "card.frozen"
    CARD_UNFROZEN = "card.unfrozen"
    CARD_CANCELLED = "card.cancelled"
    CARD_SHIPPED = "card.shipped"
    CARD_DELIVERED = "card.delivered"
    CARD_EXPIRING_SOON = "card.expiring_soon"

    # PIN events
    PIN_SET = "pin.set"
    PIN_CHANGED = "pin.changed"
    PIN_LOCKED = "pin.locked"
    PIN_UNLOCKED = "pin.unlocked"
    PIN_ATTEMPTS_EXCEEDED = "pin.attempts_exceeded"

    # Fraud events
    FRAUD_ALERT = "fraud.alert"
    FRAUD_SUSPECTED = "fraud.suspected"
    FRAUD_CONFIRMED = "fraud.confirmed"

    # Wallet events
    WALLET_TOKEN_CREATED = "wallet.token_created"
    WALLET_TOKEN_ACTIVATED = "wallet.token_activated"
    WALLET_TOKEN_SUSPENDED = "wallet.token_suspended"
    WALLET_TOKEN_RESUMED = "wallet.token_resumed"
    WALLET_TOKEN_DELETED = "wallet.token_deleted"

    # Dispute events
    DISPUTE_CREATED = "dispute.created"
    DISPUTE_UPDATED = "dispute.updated"
    DISPUTE_RESOLVED = "dispute.resolved"

    # Balance events
    BALANCE_LOW = "balance.low"
    BALANCE_UPDATED = "balance.updated"


# =============================================================================
# WEBHOOK MODELS
# =============================================================================

class WebhookPayload(BaseModel):
    """Base webhook payload"""
    event_id: str
    event_type: str
    timestamp: str
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None


class TransactionWebhookData(BaseModel):
    """Transaction webhook data"""
    transaction_id: str
    card_id: str
    amount: float
    currency: str = "USD"
    merchant_name: Optional[str] = None
    merchant_id: Optional[str] = None
    mcc_code: Optional[str] = None
    status: str
    decline_reason: Optional[str] = None
    authorization_code: Optional[str] = None


class CardWebhookData(BaseModel):
    """Card webhook data"""
    card_id: str
    status: str
    reason: Optional[str] = None
    tracking_number: Optional[str] = None  # For shipping events


class PinWebhookData(BaseModel):
    """PIN webhook data"""
    card_id: str
    event: str
    failed_attempts: Optional[int] = None


class FraudWebhookData(BaseModel):
    """Fraud webhook data"""
    alert_id: str
    card_id: str
    transaction_id: Optional[str] = None
    alert_type: str
    severity: str
    description: str


class WalletWebhookData(BaseModel):
    """Wallet token webhook data"""
    token_id: str
    card_id: str
    wallet_type: str
    status: str
    device_id: Optional[str] = None


class DisputeWebhookData(BaseModel):
    """Dispute webhook data"""
    dispute_id: str
    card_id: str
    transaction_id: str
    status: str
    resolution: Optional[str] = None
    credit_amount: Optional[float] = None


# =============================================================================
# WEBHOOK SIGNATURE VERIFICATION
# =============================================================================

def verify_webhook_signature(
    payload: bytes,
    signature: str,
    timestamp: str
) -> bool:
    """
    Verify FIS webhook signature.

    FIS uses HMAC-SHA256 with the webhook secret.

    Args:
        payload: Raw request body
        signature: X-FIS-Signature header
        timestamp: X-FIS-Timestamp header

    Returns:
        True if signature is valid
    """
    fis_service = get_fis_service()

    if not fis_service.webhook_secret:
        logger.warning("No webhook secret configured, skipping verification")
        return True  # Skip verification in development

    # Construct signed payload
    signed_payload = f"{timestamp}.{payload.decode('utf-8')}"

    # Calculate expected signature
    expected_signature = hmac.new(
        fis_service.webhook_secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Compare signatures
    return hmac.compare_digest(signature, expected_signature)


# =============================================================================
# WEBHOOK HANDLERS
# =============================================================================

async def handle_transaction_event(event_type: str, data: Dict[str, Any]):
    """Handle transaction webhook events."""
    logger.info(f"Processing transaction event: {event_type}")

    transaction_data = TransactionWebhookData(**data)

    # Create database session for background processing
    db = SessionLocal()
    try:
        # TODO: Store transaction in database
        # TODO: Send push notification to user
        # TODO: Update card balance

        if event_type == WebhookEventType.TRANSACTION_AUTHORIZED.value:
            logger.info(f"Transaction authorized: {transaction_data.transaction_id}")
            # Handle authorization

        elif event_type == WebhookEventType.TRANSACTION_DECLINED.value:
            logger.info(f"Transaction declined: {transaction_data.transaction_id}")
            # Handle decline - send notification

        elif event_type == WebhookEventType.TRANSACTION_POSTED.value:
            logger.info(f"Transaction posted: {transaction_data.transaction_id}")
            # Handle posting - update balance

    finally:
        db.close()


async def handle_card_event(event_type: str, data: Dict[str, Any]):
    """Handle card webhook events."""
    logger.info(f"Processing card event: {event_type}")

    card_data = CardWebhookData(**data)

    db = SessionLocal()
    try:
        # TODO: Update card status in database
        # TODO: Send notification

        if event_type == WebhookEventType.CARD_SHIPPED.value:
            logger.info(f"Card shipped: {card_data.card_id}")
            # Send shipping notification

        elif event_type == WebhookEventType.CARD_DELIVERED.value:
            logger.info(f"Card delivered: {card_data.card_id}")
            # Send delivery notification

        elif event_type == WebhookEventType.CARD_EXPIRING_SOON.value:
            logger.info(f"Card expiring soon: {card_data.card_id}")
            # Send expiration reminder

    finally:
        db.close()


async def handle_pin_event(event_type: str, data: Dict[str, Any]):
    """Handle PIN webhook events."""
    logger.info(f"Processing PIN event: {event_type}")

    pin_data = PinWebhookData(**data)

    db = SessionLocal()
    try:
        # TODO: Update PIN status in database
        # TODO: Send security alert

        if event_type == WebhookEventType.PIN_LOCKED.value:
            logger.info(f"PIN locked for card: {pin_data.card_id}")
            # Send security alert

        elif event_type == WebhookEventType.PIN_ATTEMPTS_EXCEEDED.value:
            logger.warning(f"PIN attempts exceeded for card: {pin_data.card_id}")
            # Send urgent security alert

    finally:
        db.close()


async def handle_fraud_event(event_type: str, data: Dict[str, Any]):
    """Handle fraud webhook events."""
    logger.info(f"Processing fraud event: {event_type}")

    fraud_data = FraudWebhookData(**data)

    db = SessionLocal()
    try:
        # TODO: Store fraud alert in database
        # TODO: Send urgent notification
        # TODO: Potentially auto-lock card

        logger.warning(f"Fraud alert: {fraud_data.alert_id} - {fraud_data.description}")

        if fraud_data.severity in ["high", "critical"]:
            # Auto-lock card for high severity alerts
            logger.warning(f"High severity fraud alert - consider locking card {fraud_data.card_id}")

    finally:
        db.close()


async def handle_wallet_event(event_type: str, data: Dict[str, Any]):
    """Handle wallet token webhook events."""
    logger.info(f"Processing wallet event: {event_type}")

    wallet_data = WalletWebhookData(**data)

    db = SessionLocal()
    try:
        # TODO: Update wallet token status in database
        # TODO: Send notification

        if event_type == WebhookEventType.WALLET_TOKEN_CREATED.value:
            logger.info(f"Wallet token created: {wallet_data.token_id}")

        elif event_type == WebhookEventType.WALLET_TOKEN_SUSPENDED.value:
            logger.info(f"Wallet token suspended: {wallet_data.token_id}")

    finally:
        db.close()


async def handle_dispute_event(event_type: str, data: Dict[str, Any]):
    """Handle dispute webhook events."""
    logger.info(f"Processing dispute event: {event_type}")

    dispute_data = DisputeWebhookData(**data)

    db = SessionLocal()
    try:
        # TODO: Update dispute status in database
        # TODO: Send notification

        if event_type == WebhookEventType.DISPUTE_RESOLVED.value:
            logger.info(f"Dispute resolved: {dispute_data.dispute_id}")
            # Send resolution notification

    finally:
        db.close()


# =============================================================================
# WEBHOOK ENDPOINTS
# =============================================================================

@router.post("")
async def receive_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_fis_signature: Optional[str] = Header(None),
    x_fis_timestamp: Optional[str] = Header(None)
):
    """
    Receive and process FIS webhooks.

    FIS sends webhook events for various card and transaction activities.
    """
    # Get raw body for signature verification
    body = await request.body()

    # Verify signature
    if x_fis_signature and x_fis_timestamp:
        if not verify_webhook_signature(body, x_fis_signature, x_fis_timestamp):
            logger.warning("Invalid webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")

    # Parse payload
    try:
        import json
        payload_dict = json.loads(body)
        payload = WebhookPayload(**payload_dict)
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")

    logger.info(f"Received FIS webhook: {payload.event_type} - {payload.event_id}")

    # Route to appropriate handler
    event_type = payload.event_type

    # Transaction events
    if event_type.startswith("transaction."):
        background_tasks.add_task(
            handle_transaction_event,
            event_type,
            payload.data
        )

    # Card events
    elif event_type.startswith("card."):
        background_tasks.add_task(
            handle_card_event,
            event_type,
            payload.data
        )

    # PIN events
    elif event_type.startswith("pin."):
        background_tasks.add_task(
            handle_pin_event,
            event_type,
            payload.data
        )

    # Fraud events
    elif event_type.startswith("fraud."):
        background_tasks.add_task(
            handle_fraud_event,
            event_type,
            payload.data
        )

    # Wallet events
    elif event_type.startswith("wallet."):
        background_tasks.add_task(
            handle_wallet_event,
            event_type,
            payload.data
        )

    # Dispute events
    elif event_type.startswith("dispute."):
        background_tasks.add_task(
            handle_dispute_event,
            event_type,
            payload.data
        )

    else:
        logger.warning(f"Unknown webhook event type: {event_type}")

    # Always return 200 to acknowledge receipt
    return {
        "received": True,
        "event_id": payload.event_id
    }


@router.post("/test")
async def test_webhook(
    payload: WebhookPayload,
    background_tasks: BackgroundTasks
):
    """
    Test webhook endpoint for development.

    This endpoint doesn't require signature verification.
    """
    logger.info(f"Test webhook received: {payload.event_type}")

    # Route to appropriate handler
    event_type = payload.event_type

    if event_type.startswith("transaction."):
        background_tasks.add_task(
            handle_transaction_event,
            event_type,
            payload.data
        )
    elif event_type.startswith("card."):
        background_tasks.add_task(
            handle_card_event,
            event_type,
            payload.data
        )
    elif event_type.startswith("fraud."):
        background_tasks.add_task(
            handle_fraud_event,
            event_type,
            payload.data
        )

    return {
        "received": True,
        "event_id": payload.event_id,
        "test_mode": True
    }


@router.get("/events")
async def list_webhook_events():
    """List all supported webhook event types."""
    return {
        "events": [
            {
                "type": event.value,
                "category": event.value.split(".")[0]
            }
            for event in WebhookEventType
        ]
    }
