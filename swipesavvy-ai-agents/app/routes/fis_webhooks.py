"""
FIS Global Payment One - Webhook Handler Routes

Handles incoming webhooks from FIS:
- Transaction events (authorization, posting, decline)
- Card status changes
- Fraud alerts
- PIN events
- Wallet token events
- Balance events

Durability contract (PERSIST FIRST, PROCESS SECOND)
--------------------------------------------------
1. Verify the signature (fail-closed) and the timestamp freshness.
2. Write the raw signed body into the ``fis_webhook_events`` inbox in its OWN
   transaction.
3. ONLY THEN acknowledge with 200.
4. Processing reads back from the inbox and records its outcome against the
   inbox row.

If step 2 fails we return 503 so the processor retries — we never claim success
for work that was dropped. If processing fails, the row stays visible as
``failed`` (retry scheduled) or ``dead_letter`` (terminal, needs an operator).
Nothing is ever swallowed.
"""

import hashlib
import hmac
import json
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request
from pydantic import BaseModel, ValidationError
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.services.auth_service import get_current_admin
from app.services.fis_global_service import get_fis_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/webhooks/fis", tags=["fis-webhooks"])

DEFAULT_TXN_DESCRIPTION = "Card Transaction"

# =============================================================================
# DURABILITY / SECURITY TUNABLES
# =============================================================================

# Replay window. The timestamp is part of the signed payload, so an attacker
# cannot alter it without invalidating the signature — but without a freshness
# check a captured request stays replayable forever. Anything older (or further
# in the future, to tolerate clock skew) than this is rejected.
WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = int(
    os.getenv("FIS_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS", "300")
)

# Retry policy for inbox processing.
MAX_PROCESSING_ATTEMPTS = int(os.getenv("FIS_WEBHOOK_MAX_ATTEMPTS", "5"))
RETRY_BACKOFF_BASE_SECONDS = int(os.getenv("FIS_WEBHOOK_RETRY_BASE_SECONDS", "30"))
RETRY_BACKOFF_MAX_SECONDS = int(os.getenv("FIS_WEBHOOK_RETRY_MAX_SECONDS", "3600"))

# Inbox lifecycle states.
STATUS_PENDING = "pending"
STATUS_PROCESSING = "processing"
STATUS_PROCESSED = "processed"
STATUS_FAILED = "failed"
STATUS_DEAD_LETTER = "dead_letter"
STATUS_REJECTED = "rejected"


# ---------------------------------------------------------------------------
# Card-surface kill switch (CARD_SURFACE_ENABLED, defaults OFF)
# ---------------------------------------------------------------------------
# The switch gates PROCESSING, deliberately NOT ingestion.
#
# When the card surface is dark we still accept and durably store inbound FIS
# events; we simply do not act on them until it is switched back on. The
# alternative — rejecting at the door with a 503 so the processor retries — is
# the wrong trade on this path: processor retry horizons are finite (hours to a
# few days), so any dark period longer than that horizon turns a deliberate
# maintenance window into PERMANENT loss of settlement events, and sustained
# 5xx also risks FIS disabling the endpoint outright.
#
# Storing-but-not-processing is also exactly consistent with the contract this
# module already implements: a 200 means "durably stored", never "processed".
# Nothing is acted on while dark, and nothing is lost.
def card_surface_enabled() -> bool:
    """Read at call time so the switch is testable and togglable."""
    return os.getenv("CARD_SURFACE_ENABLED", "false").strip().lower() in (
        "1",
        "true",
        "yes",
        "on",
    )


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
    status: Optional[str] = None
    decline_reason: Optional[str] = None
    authorization_code: Optional[str] = None


class CardWebhookData(BaseModel):
    """Card webhook data"""

    card_id: str
    status: Optional[str] = None
    reason: Optional[str] = None
    tracking_number: Optional[str] = None  # For shipping events


class PinWebhookData(BaseModel):
    """PIN webhook data"""

    card_id: str
    event: Optional[str] = None
    failed_attempts: Optional[int] = None


class FraudWebhookData(BaseModel):
    """Fraud webhook data"""

    alert_id: str
    card_id: str
    transaction_id: Optional[str] = None
    alert_type: Optional[str] = None
    severity: str
    description: Optional[str] = None


class WalletWebhookData(BaseModel):
    """Wallet token webhook data"""

    token_id: str
    card_id: str
    wallet_type: str
    status: Optional[str] = None
    device_id: Optional[str] = None


class DisputeWebhookData(BaseModel):
    """Dispute webhook data"""

    dispute_id: str
    card_id: str
    transaction_id: str
    status: Optional[str] = None
    resolution: Optional[str] = None
    credit_amount: Optional[float] = None


class BalanceWebhookData(BaseModel):
    """Balance webhook data (balance.low / balance.updated)"""

    card_id: str
    available_balance: Optional[float] = None
    current_balance: Optional[float] = None
    currency: str = "USD"
    threshold: Optional[float] = None


# =============================================================================
# ERROR TAXONOMY
# =============================================================================


class WebhookProcessingError(Exception):
    """Base class for webhook processing failures."""


class RetryableWebhookError(WebhookProcessingError):
    """
    A failure that may well succeed on a later attempt — e.g. the card row has
    not replicated yet, or events arrived out of order. Retried with backoff,
    then dead-lettered (visibly) if it never resolves.
    """


class PermanentWebhookError(WebhookProcessingError):
    """A failure that will never succeed on retry — dead-letter immediately."""


class UnsupportedEventError(WebhookProcessingError):
    """
    An event type we knowingly do not act on. Recorded as 'rejected' — a visible
    terminal state, NOT a silent 200.
    """


# =============================================================================
# WEBHOOK SIGNATURE VERIFICATION
# =============================================================================


def verify_webhook_signature(payload: bytes, signature: str, timestamp: str) -> bool:
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
        logger.error("No webhook secret configured — rejecting webhook (PCI DSS 6.5.10)")
        return False

    # Construct signed payload
    signed_payload = f"{timestamp}.{payload.decode('utf-8')}"

    # Calculate expected signature
    expected_signature = hmac.new(
        fis_service.webhook_secret.encode("utf-8"), signed_payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    # Compare signatures
    return hmac.compare_digest(signature, expected_signature)


def parse_webhook_timestamp(timestamp: str) -> Optional[datetime]:
    """
    Parse the X-FIS-Timestamp header.

    Accepts unix epoch seconds (what FIS documents) and ISO-8601, so a processor
    change of representation does not silently start rejecting live traffic.
    Returns None when the value cannot be interpreted at all.
    """
    if not timestamp:
        return None

    raw = timestamp.strip()

    # Unix epoch seconds (or milliseconds).
    try:
        numeric = float(raw)
        if numeric > 1e11:  # milliseconds
            numeric = numeric / 1000.0
        return datetime.fromtimestamp(numeric, tz=timezone.utc)
    except (ValueError, OverflowError, OSError):
        pass

    # ISO-8601, tolerating a trailing 'Z'.
    try:
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        return None

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def verify_webhook_timestamp(
    timestamp: str, tolerance_seconds: int = WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS
) -> bool:
    """
    Bound the replay window.

    The timestamp is covered by the signature, so it cannot be forged — but a
    captured, still-valid request would otherwise be replayable indefinitely.
    Skew is allowed in BOTH directions so a slightly fast processor clock does
    not drop real events.
    """
    parsed = parse_webhook_timestamp(timestamp)
    if parsed is None:
        logger.warning("Webhook timestamp could not be parsed — rejecting")
        return False

    drift = abs((datetime.now(timezone.utc) - parsed).total_seconds())
    if drift > tolerance_seconds:
        logger.warning(
            "Webhook timestamp outside the %ss replay window (drift %.0fs) — rejecting",
            tolerance_seconds,
            drift,
        )
        return False

    return True


# =============================================================================
# DURABLE INBOX
# =============================================================================


def compute_retry_backoff_seconds(attempts: int) -> int:
    """Exponential backoff, capped. ``attempts`` is the count already consumed."""
    exponent = max(attempts - 1, 0)
    # Guard against overflow on an absurd attempt count.
    if exponent > 32:
        return RETRY_BACKOFF_MAX_SECONDS
    return min(RETRY_BACKOFF_BASE_SECONDS * (2**exponent), RETRY_BACKOFF_MAX_SECONDS)


def store_webhook_event(
    payload: WebhookPayload,
    raw_body: bytes,
    signature: Optional[str],
    timestamp: Optional[str],
) -> Tuple[Optional[str], bool]:
    """
    Persist the event to the durable inbox in its OWN transaction.

    This runs BEFORE the endpoint acknowledges. Returns
    ``(inbox_row_id, is_duplicate)``.

    Raises on storage failure so the caller can return a retryable status — we
    must never acknowledge an event we did not store.
    """
    db = SessionLocal()
    try:
        row_id = str(uuid.uuid4())
        db.execute(
            text("""
                INSERT INTO fis_webhook_events
                    (id, event_id, event_type, raw_body, payload, signature,
                     event_timestamp, status, attempts, max_attempts, received_at)
                VALUES
                    (:id, :event_id, :event_type, :raw_body, CAST(:payload AS JSONB),
                     :signature, :event_timestamp, :status, 0, :max_attempts, NOW())
                """),
            {
                "id": row_id,
                "event_id": payload.event_id,
                "event_type": payload.event_type,
                "raw_body": raw_body.decode("utf-8", errors="replace"),
                "payload": json.dumps(payload.model_dump()),
                "signature": signature,
                "event_timestamp": timestamp,
                "status": STATUS_PENDING,
                "max_attempts": MAX_PROCESSING_ATTEMPTS,
            },
        )
        db.commit()
        return row_id, False
    except IntegrityError:
        # Unique violation on event_id — this is a duplicate delivery. That is
        # the idempotency backstop doing its job; treat it as a successful no-op.
        db.rollback()
        logger.info("Duplicate FIS webhook delivery ignored: event_id=%s", payload.event_id)
        return None, True
    finally:
        db.close()


def _record_success(db: Session, row_id: str) -> None:
    db.execute(
        text("""
            UPDATE fis_webhook_events
            SET status = :status, processed_at = NOW(), last_error = NULL,
                next_attempt_at = NULL
            WHERE id = :id
            """),
        {"status": STATUS_PROCESSED, "id": row_id},
    )
    db.commit()


def _record_rejected(db: Session, row_id: str, reason: str) -> None:
    """Terminal, deliberate non-processing. Visible — never a silent drop."""
    db.execute(
        text("""
            UPDATE fis_webhook_events
            SET status = :status, processed_at = NOW(), last_error = :reason,
                next_attempt_at = NULL
            WHERE id = :id
            """),
        {"status": STATUS_REJECTED, "id": row_id, "reason": reason},
    )
    db.commit()


def _record_failure(
    db: Session, row_id: str, attempts: int, max_attempts: int, error: str, permanent: bool
) -> str:
    """
    Record a processing failure against the inbox row.

    Either schedules another attempt or moves the row to the dead-letter state.
    Both outcomes are queryable; neither loses the payload.
    """
    if permanent or attempts >= max_attempts:
        db.execute(
            text("""
                UPDATE fis_webhook_events
                SET status = :status, last_error = :error, dead_lettered_at = NOW(),
                    next_attempt_at = NULL
                WHERE id = :id
                """),
            {"status": STATUS_DEAD_LETTER, "error": error, "id": row_id},
        )
        db.commit()
        logger.error(
            "FIS webhook DEAD-LETTERED after %s attempt(s): row=%s error=%s",
            attempts,
            row_id,
            error,
        )
        return STATUS_DEAD_LETTER

    backoff = compute_retry_backoff_seconds(attempts)
    db.execute(
        text("""
            UPDATE fis_webhook_events
            SET status = :status, last_error = :error, next_attempt_at = :next_attempt
            WHERE id = :id
            """),
        {
            "status": STATUS_FAILED,
            "error": error,
            "next_attempt": datetime.now(timezone.utc) + timedelta(seconds=backoff),
            "id": row_id,
        },
    )
    db.commit()
    logger.warning(
        "FIS webhook processing failed (attempt %s/%s), retrying in %ss: row=%s error=%s",
        attempts,
        max_attempts,
        backoff,
        row_id,
        error,
    )
    return STATUS_FAILED


def process_inbox_event(row_id: str) -> str:
    """
    Process one inbox row and record the outcome against it.

    Claiming is done with a conditional UPDATE, so a background task and the
    retry sweeper cannot both process the same row. Returns the resulting
    status. Never raises — the outcome always lands on the row.
    """
    if not card_surface_enabled():
        # Dark surface: leave the row untouched and un-attempted. It is NOT a
        # failure, so it must not consume a retry attempt or move toward the
        # dead-letter state — it simply waits.
        logger.info(
            "Card surface disabled — deferring FIS webhook row %s (stored, not processed)",
            row_id,
        )
        return "deferred"

    db = SessionLocal()
    try:
        # Atomically claim the row.
        claimed = db.execute(
            text("""
                UPDATE fis_webhook_events
                SET status = :processing, attempts = attempts + 1
                WHERE id = :id
                  AND status IN (:pending, :failed)
                RETURNING event_type, payload, attempts, max_attempts
                """),
            {
                "processing": STATUS_PROCESSING,
                "id": row_id,
                "pending": STATUS_PENDING,
                "failed": STATUS_FAILED,
            },
        ).fetchone()
        db.commit()

        if claimed is None:
            # Already processed, already claimed, or terminal. Not an error.
            logger.debug("FIS webhook row %s not claimable (already handled)", row_id)
            return "skipped"

        event_type, payload, attempts, max_attempts = (
            claimed[0],
            claimed[1],
            claimed[2],
            claimed[3],
        )
        if isinstance(payload, str):
            payload = json.loads(payload)
        data = (payload or {}).get("data", {}) or {}

        try:
            dispatch_event(db, event_type, data)
        except UnsupportedEventError as exc:
            db.rollback()
            _record_rejected(db, row_id, str(exc))
            return STATUS_REJECTED
        except (PermanentWebhookError, ValidationError) as exc:
            db.rollback()
            _record_failure(db, row_id, attempts, max_attempts, str(exc), permanent=True)
            return STATUS_DEAD_LETTER
        except Exception as exc:  # noqa: BLE001 - deliberately broad, but RECORDED
            # Anything unexpected is treated as retryable, then dead-lettered.
            # This is the opposite of the old behaviour: nothing is swallowed,
            # every failure is attributable to an inbox row.
            db.rollback()
            return _record_failure(
                db, row_id, attempts, max_attempts, f"{type(exc).__name__}: {exc}", permanent=False
            )

        db.commit()
        _record_success(db, row_id)
        return STATUS_PROCESSED
    finally:
        db.close()


def process_due_events(limit: int = 50) -> Dict[str, int]:
    """
    Drain events that are due for (re)processing.

    This is the crash-recovery path: rows left ``pending`` by a restart, and
    ``failed`` rows whose backoff has elapsed. Intended to be driven by the
    scheduler or an ops call.
    """
    db = SessionLocal()
    try:
        rows = db.execute(
            text("""
                SELECT id FROM fis_webhook_events
                WHERE status = :pending
                   OR (status = :failed
                       AND (next_attempt_at IS NULL OR next_attempt_at <= NOW()))
                ORDER BY received_at ASC
                LIMIT :limit
                """),
            {"pending": STATUS_PENDING, "failed": STATUS_FAILED, "limit": limit},
        ).fetchall()
    finally:
        db.close()

    results: Dict[str, int] = {}
    for row in rows:
        status = process_inbox_event(str(row[0]))
        results[status] = results.get(status, 0) + 1
    return results


# =============================================================================
# SHARED HELPERS
# =============================================================================


def _resolve_card(db: Session, card_id: str) -> Tuple[str, str]:
    """
    Resolve an FIS-supplied card identifier to ``(card_uuid, user_id)``.

    Reads ``fis_cards`` — the table that actually exists. The previous code read
    a ``user_cards`` table that is defined in no migration, no model and no
    schema file, so every transaction event died on its first statement.

    Matching is deliberately restricted to the FIS card token and our own uuid.
    The old code also matched on last-four, which is ambiguous across cards and
    could attach a transaction to the WRONG user — unacceptable on a money path.
    """
    row = db.execute(
        text("""
            SELECT id, user_id
            FROM fis_cards
            WHERE fis_card_token = :card_id
               OR CAST(id AS TEXT) = :card_id
            LIMIT 1
            """),
        {"card_id": card_id},
    ).fetchone()

    if row is None:
        # Retryable rather than dropped: the card row may simply not have landed
        # yet. If it never does, the event dead-letters visibly.
        raise RetryableWebhookError(f"No fis_cards row for card identifier {card_id!r}")

    return str(row[0]), str(row[1])


def _insert_wallet_transaction(
    db: Session,
    *,
    user_id: str,
    transaction_type: str,
    amount: float,
    currency: str,
    status: str,
    description: str,
    external_transaction_id: str,
    related_external_id: Optional[str] = None,
    authorization_code: Optional[str] = None,
    on_conflict_status: Optional[str] = None,
) -> None:
    """
    Insert a wallet transaction keyed by its FIS natural key.

    ``id`` stays a real uuid; the FIS-supplied string lives in the dedicated
    ``external_transaction_id`` column, which carries the UNIQUE constraint that
    makes the insert idempotent.
    """
    conflict_clause = (
        "ON CONFLICT (external_transaction_id) DO UPDATE SET status = :conflict_status"
        if on_conflict_status
        else "ON CONFLICT (external_transaction_id) DO NOTHING"
    )

    params = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "transaction_type": transaction_type,
        "amount": amount,
        "currency": currency,
        "status": status,
        "description": description,
        "external_transaction_id": external_transaction_id,
        "related_external_id": related_external_id,
        "authorization_code": authorization_code,
    }
    if on_conflict_status:
        params["conflict_status"] = on_conflict_status

    db.execute(
        text(f"""
            INSERT INTO wallet_transactions
                (id, user_id, transaction_type, amount, currency, status, description,
                 external_transaction_id, related_external_id, authorization_code, created_at)
            VALUES
                (:id, :user_id, :transaction_type, :amount, :currency, :status, :description,
                 :external_transaction_id, :related_external_id, :authorization_code, NOW())
            {conflict_clause}
            """),
        params,
    )


# =============================================================================
# WEBHOOK HANDLERS
# =============================================================================
# Handlers take the caller's session, do NOT commit, and do NOT swallow errors.
# Transaction and failure bookkeeping belong to process_inbox_event().


def handle_transaction_event(db: Session, event_type: str, data: Dict[str, Any]) -> None:
    """Handle transaction webhook events — records transactions in wallet_transactions."""
    logger.info("Processing transaction event: %s", event_type)

    transaction_data = TransactionWebhookData(**data)
    _, user_id = _resolve_card(db, transaction_data.card_id)
    ext_id = transaction_data.transaction_id
    merchant = transaction_data.merchant_name or DEFAULT_TXN_DESCRIPTION

    if event_type == WebhookEventType.TRANSACTION_AUTHORIZED.value:
        # Authorization hold.
        _insert_wallet_transaction(
            db,
            user_id=user_id,
            transaction_type="payment",
            amount=transaction_data.amount,
            currency=transaction_data.currency,
            status="pending",
            description=merchant,
            external_transaction_id=ext_id,
            authorization_code=transaction_data.authorization_code,
        )

    elif event_type == WebhookEventType.TRANSACTION_POSTED.value:
        result = db.execute(
            text("""
                UPDATE wallet_transactions
                SET status = 'completed', completed_at = NOW()
                WHERE external_transaction_id = :ext_id
                """),
            {"ext_id": ext_id},
        )
        if result.rowcount == 0:
            # Authorization webhook was missed — insert as completed.
            _insert_wallet_transaction(
                db,
                user_id=user_id,
                transaction_type="payment",
                amount=transaction_data.amount,
                currency=transaction_data.currency,
                status="completed",
                description=merchant,
                external_transaction_id=ext_id,
                authorization_code=transaction_data.authorization_code,
            )

    elif event_type == WebhookEventType.TRANSACTION_DECLINED.value:
        decline_suffix = (
            f" (Declined: {transaction_data.decline_reason})"
            if transaction_data.decline_reason
            else " (Declined)"
        )
        _insert_wallet_transaction(
            db,
            user_id=user_id,
            transaction_type="payment",
            amount=transaction_data.amount,
            currency=transaction_data.currency,
            status="declined",
            description=merchant + decline_suffix,
            external_transaction_id=ext_id,
            authorization_code=transaction_data.authorization_code,
            on_conflict_status="declined",
        )

    elif event_type == WebhookEventType.TRANSACTION_REVERSED.value:
        result = db.execute(
            text("""
                UPDATE wallet_transactions
                SET status = 'reversed'
                WHERE external_transaction_id = :ext_id
                """),
            {"ext_id": ext_id},
        )
        if result.rowcount == 0:
            # Out-of-order delivery: the authorization has not landed yet.
            # Retry rather than drop.
            raise RetryableWebhookError(
                f"Cannot reverse unknown transaction {ext_id!r} — authorization not seen yet"
            )

    elif event_type == WebhookEventType.TRANSACTION_REFUNDED.value:
        _insert_wallet_transaction(
            db,
            user_id=user_id,
            transaction_type="refund",
            amount=transaction_data.amount,
            currency=transaction_data.currency,
            status="completed",
            description=f"Refund: {merchant}",
            # Derived natural key — now in a text column, not the uuid PK.
            external_transaction_id=f"rfnd_{ext_id}",
            related_external_id=ext_id,
        )
        db.execute(
            text("""
                UPDATE wallet_transactions
                SET status = 'refunded'
                WHERE external_transaction_id = :ext_id
                """),
            {"ext_id": ext_id},
        )

    else:
        raise UnsupportedEventError(f"Unhandled transaction event type: {event_type}")


def handle_card_event(db: Session, event_type: str, data: Dict[str, Any]) -> None:
    """Handle card webhook events — updates card status in fis_cards."""
    logger.info("Processing card event: %s", event_type)

    card_data = CardWebhookData(**data)

    # Only statuses permitted by the fis_cards CHECK constraint. Note
    # card.cancelled maps to 'closed': 'cancelled' is NOT an allowed value and
    # would have been rejected by the constraint.
    status_map = {
        WebhookEventType.CARD_ACTIVATED.value: "active",
        WebhookEventType.CARD_LOCKED.value: "locked",
        WebhookEventType.CARD_UNLOCKED.value: "active",
        WebhookEventType.CARD_FROZEN.value: "frozen",
        WebhookEventType.CARD_UNFROZEN.value: "active",
        WebhookEventType.CARD_CANCELLED.value: "closed",
    }

    new_status = status_map.get(event_type)
    if new_status:
        card_uuid, _ = _resolve_card(db, card_data.card_id)
        db.execute(
            text("UPDATE fis_cards SET status = :status, updated_at = NOW() WHERE id = :card_id"),
            {"status": new_status, "card_id": card_uuid},
        )
        logger.info("Card %s status updated to %s", card_data.card_id, new_status)
        return

    if event_type == WebhookEventType.CARD_SHIPPED.value:
        card_uuid, _ = _resolve_card(db, card_data.card_id)
        db.execute(
            text("""
                UPDATE fis_cards
                SET shipping_status = 'shipped', shipped_at = NOW(), updated_at = NOW()
                WHERE id = :card_id
                """),
            {"card_id": card_uuid},
        )
        logger.info("Card shipped: %s, tracking: %s", card_data.card_id, card_data.tracking_number)

    elif event_type == WebhookEventType.CARD_DELIVERED.value:
        card_uuid, _ = _resolve_card(db, card_data.card_id)
        db.execute(
            text("""
                UPDATE fis_cards
                SET shipping_status = 'delivered', delivered_at = NOW(), updated_at = NOW()
                WHERE id = :card_id
                """),
            {"card_id": card_uuid},
        )
        logger.info("Card delivered: %s", card_data.card_id)

    elif event_type == WebhookEventType.CARD_EXPIRING_SOON.value:
        # Notification-only: no state change is correct here.
        _resolve_card(db, card_data.card_id)
        logger.info("Card expiring soon: %s", card_data.card_id)

    else:
        raise UnsupportedEventError(f"Unhandled card event type: {event_type}")


def handle_pin_event(db: Session, event_type: str, data: Dict[str, Any]) -> None:
    """Handle PIN webhook events."""
    logger.info("Processing PIN event: %s", event_type)

    pin_data = PinWebhookData(**data)

    if event_type in (
        WebhookEventType.PIN_SET.value,
        WebhookEventType.PIN_CHANGED.value,
        WebhookEventType.PIN_UNLOCKED.value,
    ):
        _resolve_card(db, pin_data.card_id)
        logger.info("PIN event %s for card: %s", event_type, pin_data.card_id)

    elif event_type == WebhookEventType.PIN_LOCKED.value:
        _resolve_card(db, pin_data.card_id)
        logger.warning("PIN locked for card: %s", pin_data.card_id)

    elif event_type == WebhookEventType.PIN_ATTEMPTS_EXCEEDED.value:
        logger.warning("PIN attempts exceeded for card: %s — locking card", pin_data.card_id)
        card_uuid, _ = _resolve_card(db, pin_data.card_id)
        # The old code set a non-existent `is_active` column on a non-existent
        # table. Locking is expressed by fis_cards.status.
        db.execute(
            text("UPDATE fis_cards SET status = 'locked', updated_at = NOW() WHERE id = :card_id"),
            {"card_id": card_uuid},
        )

    else:
        raise UnsupportedEventError(f"Unhandled PIN event type: {event_type}")


def handle_fraud_event(db: Session, event_type: str, data: Dict[str, Any]) -> None:
    """Handle fraud webhook events — locks the card on high/critical severity."""
    logger.info("Processing fraud event: %s", event_type)

    fraud_data = FraudWebhookData(**data)

    if event_type not in (
        WebhookEventType.FRAUD_ALERT.value,
        WebhookEventType.FRAUD_SUSPECTED.value,
        WebhookEventType.FRAUD_CONFIRMED.value,
    ):
        raise UnsupportedEventError(f"Unhandled fraud event type: {event_type}")

    logger.warning("Fraud alert: %s - %s", fraud_data.alert_id, fraud_data.description)
    card_uuid, _ = _resolve_card(db, fraud_data.card_id)

    if fraud_data.severity in ("high", "critical"):
        logger.warning("High severity fraud — locking card %s", fraud_data.card_id)
        db.execute(
            text("UPDATE fis_cards SET status = 'locked', updated_at = NOW() WHERE id = :card_id"),
            {"card_id": card_uuid},
        )

    if event_type == WebhookEventType.FRAUD_CONFIRMED.value and fraud_data.transaction_id:
        db.execute(
            text("""
                UPDATE wallet_transactions
                SET status = 'fraudulent'
                WHERE external_transaction_id = :txn_id
                """),
            {"txn_id": fraud_data.transaction_id},
        )


def handle_wallet_event(db: Session, event_type: str, data: Dict[str, Any]) -> None:
    """Handle wallet token webhook events (Apple Pay, Google Pay, Samsung Pay)."""
    logger.info("Processing wallet event: %s", event_type)

    wallet_data = WalletWebhookData(**data)

    known = {
        WebhookEventType.WALLET_TOKEN_CREATED.value: "active",
        WebhookEventType.WALLET_TOKEN_ACTIVATED.value: "active",
        WebhookEventType.WALLET_TOKEN_SUSPENDED.value: "suspended",
        WebhookEventType.WALLET_TOKEN_RESUMED.value: "active",
        WebhookEventType.WALLET_TOKEN_DELETED.value: "deleted",
    }
    if event_type not in known:
        raise UnsupportedEventError(f"Unhandled wallet event type: {event_type}")

    _resolve_card(db, wallet_data.card_id)
    logger.info(
        "Wallet token %s (%s) -> %s",
        wallet_data.token_id,
        wallet_data.wallet_type,
        known[event_type],
    )


def handle_dispute_event(db: Session, event_type: str, data: Dict[str, Any]) -> None:
    """Handle dispute webhook events — credits the wallet on resolved disputes."""
    logger.info("Processing dispute event: %s", event_type)

    dispute_data = DisputeWebhookData(**data)

    if event_type not in (
        WebhookEventType.DISPUTE_CREATED.value,
        WebhookEventType.DISPUTE_UPDATED.value,
        WebhookEventType.DISPUTE_RESOLVED.value,
    ):
        raise UnsupportedEventError(f"Unhandled dispute event type: {event_type}")

    if event_type == WebhookEventType.DISPUTE_RESOLVED.value and dispute_data.credit_amount:
        logger.info(
            "Dispute resolved: %s, credit: %s",
            dispute_data.dispute_id,
            dispute_data.credit_amount,
        )
        row = db.execute(
            text("""
                SELECT user_id FROM wallet_transactions
                WHERE external_transaction_id = :txn_id
                LIMIT 1
                """),
            {"txn_id": dispute_data.transaction_id},
        ).fetchone()

        if row is None:
            # Do not silently drop a credit the customer is owed.
            raise RetryableWebhookError(
                f"Dispute credit for unknown transaction {dispute_data.transaction_id!r}"
            )

        _insert_wallet_transaction(
            db,
            user_id=str(row[0]),
            transaction_type="refund",
            amount=dispute_data.credit_amount,
            currency="USD",
            status="completed",
            description=f"Dispute credit: {dispute_data.dispute_id}",
            external_transaction_id=f"dispute_credit_{dispute_data.dispute_id}",
            related_external_id=dispute_data.transaction_id,
        )
    else:
        logger.info("Dispute event: %s for %s", event_type, dispute_data.dispute_id)


def handle_balance_event(db: Session, event_type: str, data: Dict[str, Any]) -> None:
    """
    Handle balance webhook events.

    These were declared in WebhookEventType but had no dispatch branch at all,
    so they were dropped with a 200.

    We validate and attribute the event, but deliberately do NOT write
    ``wallets.balance``: the FIS card available-balance is not the same quantity
    as the wallet ledger balance, and overwriting a ledger-derived balance from a
    card notification would corrupt it. Recording the event durably is the
    correct behaviour; the ledger stays authoritative.
    """
    logger.info("Processing balance event: %s", event_type)

    balance_data = BalanceWebhookData(**data)

    if event_type not in (
        WebhookEventType.BALANCE_LOW.value,
        WebhookEventType.BALANCE_UPDATED.value,
    ):
        raise UnsupportedEventError(f"Unhandled balance event type: {event_type}")

    _, user_id = _resolve_card(db, balance_data.card_id)

    if event_type == WebhookEventType.BALANCE_LOW.value:
        logger.warning(
            "Low balance for card %s (user %s): available=%s threshold=%s",
            balance_data.card_id,
            user_id,
            balance_data.available_balance,
            balance_data.threshold,
        )
    else:
        logger.info(
            "Balance updated for card %s (user %s): available=%s current=%s",
            balance_data.card_id,
            user_id,
            balance_data.available_balance,
            balance_data.current_balance,
        )


DISPATCH_TABLE = {
    "transaction.": handle_transaction_event,
    "card.": handle_card_event,
    "pin.": handle_pin_event,
    "fraud.": handle_fraud_event,
    "wallet.": handle_wallet_event,
    "dispute.": handle_dispute_event,
    "balance.": handle_balance_event,
}


def dispatch_event(db: Session, event_type: str, data: Dict[str, Any]) -> None:
    """Route an event to its handler. Unknown prefixes are explicitly rejected."""
    for prefix, handler in DISPATCH_TABLE.items():
        if event_type.startswith(prefix):
            handler(db, event_type, data)
            return
    raise UnsupportedEventError(f"Unknown webhook event type: {event_type}")


# =============================================================================
# WEBHOOK ENDPOINTS
# =============================================================================


@router.post("")
async def receive_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_fis_signature: Optional[str] = Header(None),
    x_fis_timestamp: Optional[str] = Header(None),
):
    """
    Receive FIS webhooks.

    Persist first, process second. The 200 means "durably stored", nothing more
    and nothing less.
    """
    body = await request.body()

    # --- Authenticate (fail-closed, constant-time) ---------------------------
    if not x_fis_signature or not x_fis_timestamp:
        logger.warning("Webhook request missing signature or timestamp headers")
        raise HTTPException(status_code=401, detail="Missing signature headers")

    if not verify_webhook_signature(body, x_fis_signature, x_fis_timestamp):
        logger.warning("Invalid webhook signature")
        raise HTTPException(status_code=401, detail="Invalid signature")

    # --- Bound the replay window --------------------------------------------
    if not verify_webhook_timestamp(x_fis_timestamp):
        raise HTTPException(status_code=400, detail="Stale or invalid webhook timestamp")

    # --- Parse ---------------------------------------------------------------
    try:
        payload = WebhookPayload(**json.loads(body))
    except Exception as exc:
        logger.error("Failed to parse webhook payload: %s", exc)
        raise HTTPException(status_code=400, detail="Invalid payload") from exc

    logger.info("Received FIS webhook: %s - %s", payload.event_type, payload.event_id)

    # --- PERSIST FIRST -------------------------------------------------------
    try:
        row_id, duplicate = store_webhook_event(payload, body, x_fis_signature, x_fis_timestamp)
    except Exception as exc:  # noqa: BLE001 - storage failure must be surfaced
        # We could not durably store the event. Do NOT claim success: answer with
        # a retryable status so FIS redelivers.
        logger.exception("Failed to persist FIS webhook %s: %s", payload.event_id, exc)
        raise HTTPException(
            status_code=503, detail="Webhook storage unavailable, please retry"
        ) from exc

    if duplicate:
        return {"received": True, "event_id": payload.event_id, "duplicate": True}

    # --- PROCESS SECOND ------------------------------------------------------
    # Best-effort low-latency processing. Durability does not depend on it: if
    # this never runs, process_due_events() picks the row up.
    #
    # While the card surface is dark we keep the event but do not act on it. The
    # 200 is still honest: it means "durably stored", which it is.
    if card_surface_enabled():
        background_tasks.add_task(process_inbox_event, row_id)
        deferred = False
    else:
        logger.info(
            "Card surface disabled — stored FIS webhook %s without processing",
            payload.event_id,
        )
        deferred = True

    return {
        "received": True,
        "event_id": payload.event_id,
        "inbox_id": row_id,
        "status": STATUS_PENDING,
        "processing_deferred": deferred,
    }


@router.get("/events")
async def list_webhook_events():
    """List all supported webhook event types."""
    return {
        "events": [
            {"type": event.value, "category": event.value.split(".")[0]}
            for event in WebhookEventType
        ]
    }


@router.get("/inbox")
async def list_inbox_events(
    status: Optional[str] = None,
    limit: int = 100,
    _admin=Depends(get_current_admin),
) -> Dict[str, Any]:
    """
    Inspect the webhook inbox — this is the dead-letter surface.

    Failures are queryable here instead of vanishing into a log line.
    """
    limit = max(1, min(limit, 500))
    db = SessionLocal()
    try:
        if status:
            rows = db.execute(
                text("""
                    SELECT id, event_id, event_type, status, attempts, max_attempts,
                           next_attempt_at, last_error, received_at, processed_at,
                           dead_lettered_at
                    FROM fis_webhook_events
                    WHERE status = :status
                    ORDER BY received_at DESC
                    LIMIT :limit
                    """),
                {"status": status, "limit": limit},
            ).fetchall()
        else:
            rows = db.execute(
                text("""
                    SELECT id, event_id, event_type, status, attempts, max_attempts,
                           next_attempt_at, last_error, received_at, processed_at,
                           dead_lettered_at
                    FROM fis_webhook_events
                    ORDER BY received_at DESC
                    LIMIT :limit
                    """),
                {"limit": limit},
            ).fetchall()

        counts = db.execute(
            text("SELECT status, COUNT(*) FROM fis_webhook_events GROUP BY status")
        ).fetchall()

        events: List[Dict[str, Any]] = [
            {
                "id": str(r[0]),
                "event_id": r[1],
                "event_type": r[2],
                "status": r[3],
                "attempts": r[4],
                "max_attempts": r[5],
                "next_attempt_at": r[6].isoformat() if r[6] else None,
                "last_error": r[7],
                "received_at": r[8].isoformat() if r[8] else None,
                "processed_at": r[9].isoformat() if r[9] else None,
                "dead_lettered_at": r[10].isoformat() if r[10] else None,
            }
            for r in rows
        ]
        return {"events": events, "counts": {r[0]: r[1] for r in counts}}
    finally:
        db.close()


@router.post("/inbox/{row_id}/replay")
async def replay_inbox_event(row_id: str, _admin=Depends(get_current_admin)) -> Dict[str, Any]:
    """
    Replay a dead-lettered (or otherwise stuck) event.

    Resets the row to ``pending`` and reprocesses it. The raw payload was stored
    on receipt, so there is always something to replay from.
    """
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
                UPDATE fis_webhook_events
                SET status = :pending, next_attempt_at = NULL, attempts = 0,
                    dead_lettered_at = NULL
                WHERE id = :id
                """),
            {"pending": STATUS_PENDING, "id": row_id},
        )
        db.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Inbox event not found")
    finally:
        db.close()

    status = process_inbox_event(row_id)
    return {"id": row_id, "status": status}


@router.post("/inbox/process-due")
async def process_due_inbox_events(
    limit: int = 50, _admin=Depends(get_current_admin)
) -> Dict[str, Any]:
    """
    Drain events due for (re)processing.

    This is the crash-recovery / retry driver — safe to call repeatedly and
    intended to be scheduled.
    """
    limit = max(1, min(limit, 500))
    return {"results": process_due_events(limit)}
