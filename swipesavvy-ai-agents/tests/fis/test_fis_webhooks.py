"""
First test coverage for the FIS inbound webhook surface.

Before this suite the endpoint could not process a single event successfully:
it read a table that does not exist, every INSERT violated the uuid primary key,
several status writes violated a CHECK constraint, all six failure paths were
swallowed, and the endpoint returned 200 regardless — so the processor was told
"processed" and stopped retrying. That was total silent inbound data loss.

These tests pin the fixes:
  * a bad signature is rejected                     (test_bad_signature_*)
  * an event is durably stored BEFORE the ack       (test_event_is_durably_stored_*)
  * the ack is honest when storage fails            (test_ack_is_honest_*)
  * a duplicate delivery is a no-op                 (test_duplicate_*)
  * a stale timestamp is rejected                   (test_stale_*)
  * a processing failure dead-letters visibly       (test_*dead_letter*)
  * every previously-dying handler now completes    (TestHandlersAgainstRealSchema)
"""

import json
import uuid

import pytest
from sqlalchemy import text

from tests.fis.conftest import make_event, post_event, sign_body

pytestmark = pytest.mark.requires_db


def inbox_rows(db, **where):
    clause = " AND ".join(f"{k} = :{k}" for k in where) or "TRUE"
    return (
        db.execute(
            text(f"SELECT * FROM fis_webhook_events WHERE {clause} ORDER BY received_at"), where
        )
        .mappings()
        .all()
    )


def txn_rows(db, **where):
    clause = " AND ".join(f"{k} = :{k}" for k in where) or "TRUE"
    return (
        db.execute(text(f"SELECT * FROM wallet_transactions WHERE {clause}"), where)
        .mappings()
        .all()
    )


def fresh_session():
    """An INDEPENDENT connection — proves a row was really committed."""
    from app.database import SessionLocal

    return SessionLocal()


# =============================================================================
# Signature verification (was already correct — this locks it in)
# =============================================================================


class TestSignatureVerification:
    def test_missing_signature_headers_rejected(self, client, db):
        body = json.dumps(make_event("card.activated", {"card_id": "x"})).encode()
        response = client.post("/api/v1/webhooks/fis", content=body)
        assert response.status_code == 401
        assert inbox_rows(db) == []

    def test_bad_signature_rejected_and_nothing_stored(self, client, db, seeded_card):
        event = make_event("card.activated", {"card_id": seeded_card["card_token"]})
        response = post_event(client, event, signature="deadbeef" * 8)

        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid signature"
        # An unauthenticated event must not reach the inbox at all.
        assert inbox_rows(db) == []

    def test_signature_from_wrong_secret_rejected(self, client, db, seeded_card):
        event = make_event("card.activated", {"card_id": seeded_card["card_token"]})
        response = post_event(client, event, secret="not-the-real-secret")
        assert response.status_code == 401
        assert inbox_rows(db) == []

    def test_signature_is_fail_closed_without_a_configured_secret(self, monkeypatch):
        """No secret configured must mean 'reject', never 'allow'."""
        from app.routes import fis_webhooks

        class NoSecretService:
            webhook_secret = ""

        monkeypatch.setattr(fis_webhooks, "get_fis_service", lambda: NoSecretService())
        assert fis_webhooks.verify_webhook_signature(b"{}", "any", "123") is False

    def test_signature_comparison_is_constant_time(self):
        """Guard against a regression to `==`."""
        import inspect

        from app.routes import fis_webhooks

        source = inspect.getsource(fis_webhooks.verify_webhook_signature)
        assert "hmac.compare_digest" in source

    def test_valid_signature_accepted(self, client, db, seeded_card):
        event = make_event("card.activated", {"card_id": seeded_card["card_token"]})
        assert post_event(client, event).status_code == 200


# =============================================================================
# Replay window
# =============================================================================


class TestReplayWindow:
    def test_stale_timestamp_rejected(self, client, db, seeded_card):
        import time

        stale = str(int(time.time()) - 3600)  # an hour old
        event = make_event("card.activated", {"card_id": seeded_card["card_token"]})
        response = post_event(client, event, timestamp=stale)

        assert response.status_code == 400
        assert "timestamp" in response.json()["detail"].lower()
        assert inbox_rows(db) == []

    def test_far_future_timestamp_rejected(self, client, db, seeded_card):
        import time

        future = str(int(time.time()) + 3600)
        event = make_event("card.activated", {"card_id": seeded_card["card_token"]})
        assert post_event(client, event, timestamp=future).status_code == 400
        assert inbox_rows(db) == []

    def test_timestamp_within_tolerance_accepted(self, client, seeded_card):
        import time

        from app.routes.fis_webhooks import WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS

        recent = str(int(time.time()) - (WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS - 30))
        event = make_event("card.activated", {"card_id": seeded_card["card_token"]})
        assert post_event(client, event, timestamp=recent).status_code == 200

    def test_captured_request_cannot_be_replayed_later(self, client, db, seeded_card):
        """
        The exact bytes + signature of a real past request must stop working once
        the window closes — that is the whole point of the freshness check.
        """
        import time

        old_ts = str(int(time.time()) - 7200)
        event = make_event("card.activated", {"card_id": seeded_card["card_token"]})
        body = json.dumps(event).encode()
        # A genuinely valid signature for that old timestamp.
        signature = sign_body(body, old_ts)

        response = client.post(
            "/api/v1/webhooks/fis",
            content=body,
            headers={"X-FIS-Signature": signature, "X-FIS-Timestamp": old_ts},
        )
        assert response.status_code == 400
        assert inbox_rows(db) == []

    @pytest.mark.parametrize(
        "raw,expected",
        [("not-a-timestamp", False), ("", False)],
    )
    def test_unparseable_timestamps_rejected(self, raw, expected):
        from app.routes.fis_webhooks import verify_webhook_timestamp

        assert verify_webhook_timestamp(raw) is expected

    def test_iso8601_timestamps_supported(self):
        from datetime import datetime, timezone

        from app.routes.fis_webhooks import verify_webhook_timestamp

        assert verify_webhook_timestamp(datetime.now(timezone.utc).isoformat()) is True

    def test_tolerance_is_a_named_constant(self):
        from app.routes import fis_webhooks

        assert isinstance(fis_webhooks.WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS, int)
        assert fis_webhooks.WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS > 0


# =============================================================================
# Persist first, process second
# =============================================================================


class TestDurableInbox:
    def test_event_is_durably_stored_before_acknowledgement(
        self, client, db, seeded_card, monkeypatch
    ):
        """
        With processing stubbed out entirely, the row must ALREADY be committed
        and visible from an independent connection by the time the 200 lands.
        That is what makes the acknowledgement honest.
        """
        from app.routes import fis_webhooks

        seen = {}

        def stub_process(row_id):
            # Observe inbox state at the moment processing is handed the row.
            other = fresh_session()
            try:
                seen["at_dispatch"] = other.execute(
                    text("SELECT status FROM fis_webhook_events WHERE id = :id"),
                    {"id": row_id},
                ).scalar()
            finally:
                other.close()

        monkeypatch.setattr(fis_webhooks, "process_inbox_event", stub_process)

        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_1",
                "card_id": seeded_card["card_token"],
                "amount": 10.0,
            },
        )
        response = post_event(client, event)

        assert response.status_code == 200
        assert response.json()["received"] is True

        # Committed and visible to a *different* session → durable before ack.
        assert seen["at_dispatch"] == "pending"

        rows = inbox_rows(db, event_id=event["event_id"])
        assert len(rows) == 1
        assert rows[0]["status"] == "pending"
        # The raw payload is retained, so there is something to replay from.
        assert json.loads(rows[0]["raw_body"])["event_id"] == event["event_id"]
        assert rows[0]["payload"]["data"]["transaction_id"] == "fis_txn_1"
        assert rows[0]["signature"]
        assert rows[0]["event_timestamp"]

    def test_ack_is_honest_when_storage_fails(self, client, db, seeded_card, monkeypatch):
        """A dropped event must NEVER be acknowledged as received."""
        from app.routes import fis_webhooks

        def boom(*args, **kwargs):
            raise RuntimeError("database is down")

        monkeypatch.setattr(fis_webhooks, "store_webhook_event", boom)

        event = make_event("card.activated", {"card_id": seeded_card["card_token"]})
        response = post_event(client, event)

        # 503 → the processor retries. The old code returned 200 here.
        assert response.status_code == 503
        assert inbox_rows(db) == []

    def test_pending_row_survives_a_lost_background_task(
        self, client, db, seeded_card, monkeypatch
    ):
        """
        Simulates a restart: the in-process task never runs. The work must still
        be recoverable, and the retry sweeper must pick it up.
        """
        from app.routes import fis_webhooks

        monkeypatch.setattr(fis_webhooks, "process_inbox_event", lambda row_id: None)

        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_restart",
                "card_id": seeded_card["card_token"],
                "amount": 25.5,
            },
        )
        assert post_event(client, event).status_code == 200
        assert inbox_rows(db, event_id=event["event_id"])[0]["status"] == "pending"
        assert txn_rows(db) == []  # nothing processed yet

        # Restore real processing, then let the sweeper recover the row.
        monkeypatch.undo()
        results = fis_webhooks.process_due_events()
        assert results.get("processed") == 1

        db.commit()
        assert inbox_rows(db, event_id=event["event_id"])[0]["status"] == "processed"
        assert len(txn_rows(db, external_transaction_id="fis_txn_restart")) == 1


# =============================================================================
# Idempotency
# =============================================================================


class TestIdempotency:
    def test_duplicate_delivery_is_a_noop(self, client, db, seeded_card):
        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_dupe",
                "card_id": seeded_card["card_token"],
                "amount": 12.0,
            },
        )

        first = post_event(client, event)
        second = post_event(client, event)

        assert first.status_code == 200
        assert second.status_code == 200
        assert first.json().get("duplicate") is not True
        assert second.json()["duplicate"] is True

        # One inbox row, one wallet transaction — no double-spend.
        assert len(inbox_rows(db, event_id=event["event_id"])) == 1
        assert len(txn_rows(db, external_transaction_id="fis_txn_dupe")) == 1

    def test_event_id_uniqueness_is_enforced_by_the_database(self, db, seeded_card):
        """The idempotency backstop is a constraint, not just handler logic."""
        from sqlalchemy.exc import IntegrityError

        params = {
            "id1": str(uuid.uuid4()),
            "id2": str(uuid.uuid4()),
            "event_id": "evt_same",
        }
        db.execute(
            text(
                "INSERT INTO fis_webhook_events (id, event_id, event_type, raw_body) "
                "VALUES (:id1, :event_id, 'card.activated', '{}')"
            ),
            params,
        )
        db.commit()
        with pytest.raises(IntegrityError):
            db.execute(
                text(
                    "INSERT INTO fis_webhook_events (id, event_id, event_type, raw_body) "
                    "VALUES (:id2, :event_id, 'card.activated', '{}')"
                ),
                params,
            )
            db.commit()
        db.rollback()

    def test_redelivery_after_processing_does_not_duplicate_money(self, client, db, seeded_card):
        """A processor replaying yesterday's batch must not re-credit anyone."""
        event = make_event(
            "transaction.refunded",
            {
                "transaction_id": "fis_txn_refund_idem",
                "card_id": seeded_card["card_token"],
                "amount": 40.0,
            },
        )
        post_event(client, event)
        post_event(client, event)

        refunds = txn_rows(db, external_transaction_id="rfnd_fis_txn_refund_idem")
        assert len(refunds) == 1


# =============================================================================
# Failure handling: retry, backoff, dead-letter
# =============================================================================


class TestDeadLettering:
    def test_processing_failure_lands_in_dead_letter_not_nowhere(self, client, db, seeded_card):
        """
        An event for a card we do not have is retryable, then terminal — and at
        every stage it stays visible with its payload and its error.
        """
        from app.routes import fis_webhooks

        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_orphan",
                "card_id": "fis_tok_does_not_exist",
                "amount": 5.0,
            },
        )
        assert post_event(client, event).status_code == 200

        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "failed"
        assert row["attempts"] == 1
        assert "fis_tok_does_not_exist" in row["last_error"]
        assert row["next_attempt_at"] is not None  # backoff scheduled

        # Burn through the remaining attempts.
        for _ in range(row["max_attempts"]):
            db.execute(
                text("UPDATE fis_webhook_events SET next_attempt_at = NULL WHERE id = :id"),
                {"id": row["id"]},
            )
            db.commit()
            fis_webhooks.process_inbox_event(str(row["id"]))

        db.commit()
        final = inbox_rows(db, event_id=event["event_id"])[0]
        assert final["status"] == "dead_letter"
        assert final["dead_lettered_at"] is not None
        assert final["last_error"]
        # The payload is still there — the event is replayable, not lost.
        assert json.loads(final["raw_body"])["data"]["transaction_id"] == "fis_txn_orphan"

    def test_dead_lettered_event_is_visible_on_the_inbox_endpoint(self, client, db, seeded_card):
        """The DLQ is a queryable surface, not a log line."""
        from app.routes.fis_webhooks import router  # noqa: F401
        from app.services.auth_service import get_current_admin

        db.execute(
            text(
                """
                INSERT INTO fis_webhook_events
                    (id, event_id, event_type, raw_body, status, attempts,
                     last_error, dead_lettered_at)
                VALUES (:id, 'evt_dead', 'transaction.authorized', '{}',
                        'dead_letter', 5, 'boom', NOW())
                """
            ),
            {"id": str(uuid.uuid4())},
        )
        db.commit()

        client.app.dependency_overrides[get_current_admin] = lambda: {"role": "admin"}
        try:
            response = client.get("/api/v1/webhooks/fis/inbox?status=dead_letter")
        finally:
            client.app.dependency_overrides.clear()

        assert response.status_code == 200
        body = response.json()
        assert body["counts"]["dead_letter"] == 1
        assert body["events"][0]["event_id"] == "evt_dead"
        assert body["events"][0]["last_error"] == "boom"

    def test_dead_lettered_event_can_be_replayed(self, client, db, seeded_card):
        """Recovery path: fix the cause, replay, and the work completes."""
        from app.services.auth_service import get_current_admin

        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_replay",
                "card_id": "fis_tok_arrives_late",
                "amount": 9.0,
            },
        )
        post_event(client, event)
        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "failed"

        # The card finally shows up.
        db.execute(
            text("UPDATE fis_cards SET fis_card_token = 'fis_tok_arrives_late'"),
        )
        db.commit()

        client.app.dependency_overrides[get_current_admin] = lambda: {"role": "admin"}
        try:
            response = client.post(f"/api/v1/webhooks/fis/inbox/{row['id']}/replay")
        finally:
            client.app.dependency_overrides.clear()

        assert response.status_code == 200
        assert response.json()["status"] == "processed"
        assert len(txn_rows(db, external_transaction_id="fis_txn_replay")) == 1

    def test_backoff_is_exponential_and_capped(self):
        from app.routes import fis_webhooks as w

        delays = [w.compute_retry_backoff_seconds(n) for n in range(1, 10)]
        assert delays[0] == w.RETRY_BACKOFF_BASE_SECONDS
        assert delays == sorted(delays)  # monotonic
        assert all(d <= w.RETRY_BACKOFF_MAX_SECONDS for d in delays)
        assert w.compute_retry_backoff_seconds(999) == w.RETRY_BACKOFF_MAX_SECONDS

    def test_no_handler_swallows_exceptions(self):
        """
        Regression guard for the six identical `except Exception: logger.error`
        blocks that made every failure invisible.
        """
        import inspect

        from app.routes import fis_webhooks

        for name in (
            "handle_transaction_event",
            "handle_card_event",
            "handle_pin_event",
            "handle_fraud_event",
            "handle_wallet_event",
            "handle_dispute_event",
            "handle_balance_event",
        ):
            source = inspect.getsource(getattr(fis_webhooks, name))
            assert "except Exception" not in source, f"{name} swallows exceptions"

    def test_claiming_prevents_double_processing(self, client, db, seeded_card):
        """A second processor picking up the same row must be a no-op."""
        from app.routes import fis_webhooks

        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_claim",
                "card_id": seeded_card["card_token"],
                "amount": 15.0,
            },
        )
        post_event(client, event)
        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "processed"

        assert fis_webhooks.process_inbox_event(str(row["id"])) == "skipped"
        assert len(txn_rows(db, external_transaction_id="fis_txn_claim")) == 1


# =============================================================================
# Every handler, against the real schema
# =============================================================================


class TestHandlersAgainstRealSchema:
    """
    Each of these died on the old code — on the missing `user_cards` table, on
    the uuid primary key, or on the status CHECK constraint.
    """

    def test_transaction_authorized_inserts_pending(self, client, db, seeded_card):
        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_auth",
                "card_id": seeded_card["card_token"],
                "amount": 42.50,
                "authorization_code": "AUTH01",
            },
        )
        assert post_event(client, event).status_code == 200

        rows = txn_rows(db, external_transaction_id="fis_txn_auth")
        assert len(rows) == 1
        assert rows[0]["status"] == "pending"
        assert rows[0]["user_id"] == uuid.UUID(seeded_card["user_id"])
        assert float(rows[0]["amount"]) == 42.50
        assert rows[0]["authorization_code"] == "AUTH01"
        # The primary key is a real uuid — the FIS string lives in its own column.
        assert isinstance(rows[0]["id"], uuid.UUID)
        assert str(rows[0]["id"]) != "fis_txn_auth"

    def test_transaction_posted_completes_the_authorization(self, client, db, seeded_card):
        base = {"card_id": seeded_card["card_token"], "amount": 30.0}
        post_event(
            client,
            make_event("transaction.authorized", {**base, "transaction_id": "fis_txn_posted"}),
        )
        post_event(
            client, make_event("transaction.posted", {**base, "transaction_id": "fis_txn_posted"})
        )

        rows = txn_rows(db, external_transaction_id="fis_txn_posted")
        assert len(rows) == 1  # updated in place, not duplicated
        assert rows[0]["status"] == "completed"
        assert rows[0]["completed_at"] is not None

    def test_transaction_posted_without_a_prior_authorization(self, client, db, seeded_card):
        post_event(
            client,
            make_event(
                "transaction.posted",
                {
                    "transaction_id": "fis_txn_late",
                    "card_id": seeded_card["card_token"],
                    "amount": 7.0,
                },
            ),
        )
        rows = txn_rows(db, external_transaction_id="fis_txn_late")
        assert len(rows) == 1
        assert rows[0]["status"] == "completed"

    def test_transaction_declined_writes_declined_status(self, client, db, seeded_card):
        """'declined' violated the old CHECK constraint."""
        post_event(
            client,
            make_event(
                "transaction.declined",
                {
                    "transaction_id": "fis_txn_decl",
                    "card_id": seeded_card["card_token"],
                    "amount": 99.0,
                    "decline_reason": "insufficient_funds",
                },
            ),
        )

        rows = txn_rows(db, external_transaction_id="fis_txn_decl")
        assert len(rows) == 1
        assert rows[0]["status"] == "declined"
        assert "insufficient_funds" in rows[0]["description"]

    def test_transaction_reversed_writes_reversed_status(self, client, db, seeded_card):
        """'reversed' violated the old CHECK constraint."""
        base = {"card_id": seeded_card["card_token"], "amount": 20.0}
        post_event(
            client, make_event("transaction.authorized", {**base, "transaction_id": "fis_txn_rev"})
        )
        post_event(
            client, make_event("transaction.reversed", {**base, "transaction_id": "fis_txn_rev"})
        )

        assert txn_rows(db, external_transaction_id="fis_txn_rev")[0]["status"] == "reversed"

    def test_reversal_of_an_unseen_transaction_is_retried_not_dropped(
        self, client, db, seeded_card
    ):
        event = make_event(
            "transaction.reversed",
            {
                "transaction_id": "fis_txn_unknown_rev",
                "card_id": seeded_card["card_token"],
                "amount": 20.0,
            },
        )
        post_event(client, event)
        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "failed"
        assert "fis_txn_unknown_rev" in row["last_error"]

    def test_transaction_refunded_creates_a_credit_with_a_derived_key(
        self, client, db, seeded_card
    ):
        """`rfnd_<id>` used to be forced into the uuid primary key."""
        base = {"card_id": seeded_card["card_token"], "amount": 60.0}
        post_event(
            client, make_event("transaction.authorized", {**base, "transaction_id": "fis_txn_ref"})
        )
        post_event(
            client,
            make_event(
                "transaction.refunded",
                {**base, "transaction_id": "fis_txn_ref", "merchant_name": "Coffee"},
            ),
        )

        original = txn_rows(db, external_transaction_id="fis_txn_ref")[0]
        assert original["status"] == "refunded"  # violated the old CHECK

        credit = txn_rows(db, external_transaction_id="rfnd_fis_txn_ref")
        assert len(credit) == 1
        assert credit[0]["transaction_type"] == "refund"
        assert credit[0]["status"] == "completed"
        assert credit[0]["related_external_id"] == "fis_txn_ref"
        assert isinstance(credit[0]["id"], uuid.UUID)
        assert "Coffee" in credit[0]["description"]

    @pytest.mark.parametrize(
        "event_type,expected_status",
        [
            ("card.activated", "active"),
            ("card.locked", "locked"),
            ("card.unlocked", "active"),
            ("card.frozen", "frozen"),
            ("card.unfrozen", "active"),
            # 'cancelled' is NOT an allowed fis_cards status — 'closed' is.
            ("card.cancelled", "closed"),
        ],
    )
    def test_card_status_events_update_fis_cards(
        self, client, db, seeded_card, event_type, expected_status
    ):
        post_event(client, make_event(event_type, {"card_id": seeded_card["card_token"]}))

        status = db.execute(
            text("SELECT status FROM fis_cards WHERE id = :id"),
            {"id": seeded_card["card_id"]},
        ).scalar()
        assert status == expected_status

    def test_card_shipped_and_delivered_record_shipping_state(self, client, db, seeded_card):
        post_event(
            client,
            make_event(
                "card.shipped",
                {
                    "card_id": seeded_card["card_token"],
                    "tracking_number": "1Z999",
                },
            ),
        )
        row = (
            db.execute(
                text("SELECT shipping_status, shipped_at FROM fis_cards WHERE id = :id"),
                {"id": seeded_card["card_id"]},
            )
            .mappings()
            .one()
        )
        assert row["shipping_status"] == "shipped"
        assert row["shipped_at"] is not None

        post_event(
            client,
            make_event(
                "card.delivered",
                {
                    "card_id": seeded_card["card_token"],
                },
            ),
        )
        row = (
            db.execute(
                text("SELECT shipping_status, delivered_at FROM fis_cards WHERE id = :id"),
                {"id": seeded_card["card_id"]},
            )
            .mappings()
            .one()
        )
        assert row["shipping_status"] == "delivered"
        assert row["delivered_at"] is not None

    def test_pin_attempts_exceeded_locks_the_card(self, client, db, seeded_card):
        """The old code set `is_active` on `user_cards` — neither exists."""
        event = make_event(
            "pin.attempts_exceeded",
            {
                "card_id": seeded_card["card_token"],
                "failed_attempts": 3,
            },
        )
        post_event(client, event)

        assert inbox_rows(db, event_id=event["event_id"])[0]["status"] == "processed"
        status = db.execute(
            text("SELECT status FROM fis_cards WHERE id = :id"),
            {"id": seeded_card["card_id"]},
        ).scalar()
        assert status == "locked"

    @pytest.mark.parametrize("event_type", ["pin.set", "pin.changed", "pin.locked"])
    def test_other_pin_events_complete(self, client, db, seeded_card, event_type):
        event = make_event(event_type, {"card_id": seeded_card["card_token"]})
        post_event(client, event)
        assert inbox_rows(db, event_id=event["event_id"])[0]["status"] == "processed"

    def test_fraud_high_severity_locks_the_card(self, client, db, seeded_card):
        post_event(
            client,
            make_event(
                "fraud.alert",
                {
                    "alert_id": "alert_1",
                    "card_id": seeded_card["card_token"],
                    "severity": "critical",
                    "description": "card testing",
                },
            ),
        )
        status = db.execute(
            text("SELECT status FROM fis_cards WHERE id = :id"),
            {"id": seeded_card["card_id"]},
        ).scalar()
        assert status == "locked"

    def test_fraud_confirmed_marks_the_transaction_fraudulent(self, client, db, seeded_card):
        """'fraudulent' violated the old CHECK constraint."""
        post_event(
            client,
            make_event(
                "transaction.authorized",
                {
                    "transaction_id": "fis_txn_fraud",
                    "card_id": seeded_card["card_token"],
                    "amount": 500.0,
                },
            ),
        )
        post_event(
            client,
            make_event(
                "fraud.confirmed",
                {
                    "alert_id": "alert_2",
                    "card_id": seeded_card["card_token"],
                    "transaction_id": "fis_txn_fraud",
                    "severity": "high",
                    "description": "confirmed fraud",
                },
            ),
        )

        assert txn_rows(db, external_transaction_id="fis_txn_fraud")[0]["status"] == "fraudulent"

    def test_low_severity_fraud_does_not_lock_the_card(self, client, db, seeded_card):
        post_event(
            client,
            make_event(
                "fraud.suspected",
                {
                    "alert_id": "alert_3",
                    "card_id": seeded_card["card_token"],
                    "severity": "low",
                    "description": "minor anomaly",
                },
            ),
        )
        status = db.execute(
            text("SELECT status FROM fis_cards WHERE id = :id"),
            {"id": seeded_card["card_id"]},
        ).scalar()
        assert status == "active"

    @pytest.mark.parametrize(
        "event_type",
        [
            "wallet.token_created",
            "wallet.token_activated",
            "wallet.token_suspended",
            "wallet.token_resumed",
            "wallet.token_deleted",
        ],
    )
    def test_wallet_token_events_complete(self, client, db, seeded_card, event_type):
        event = make_event(
            event_type,
            {
                "token_id": "tok_1",
                "card_id": seeded_card["card_token"],
                "wallet_type": "apple_pay",
            },
        )
        post_event(client, event)
        assert inbox_rows(db, event_id=event["event_id"])[0]["status"] == "processed"

    def test_dispute_resolved_credits_the_wallet(self, client, db, seeded_card):
        """`dispute_credit_<id>` used to be forced into the uuid primary key."""
        post_event(
            client,
            make_event(
                "transaction.authorized",
                {
                    "transaction_id": "fis_txn_disputed",
                    "card_id": seeded_card["card_token"],
                    "amount": 75.0,
                },
            ),
        )
        post_event(
            client,
            make_event(
                "dispute.resolved",
                {
                    "dispute_id": "dsp_1",
                    "card_id": seeded_card["card_token"],
                    "transaction_id": "fis_txn_disputed",
                    "status": "resolved",
                    "credit_amount": 75.0,
                },
            ),
        )

        credit = txn_rows(db, external_transaction_id="dispute_credit_dsp_1")
        assert len(credit) == 1
        assert credit[0]["transaction_type"] == "refund"
        assert float(credit[0]["amount"]) == 75.0
        assert credit[0]["related_external_id"] == "fis_txn_disputed"
        assert isinstance(credit[0]["id"], uuid.UUID)

    def test_dispute_credit_for_unknown_transaction_is_not_dropped(self, client, db, seeded_card):
        """Money owed to a customer must never vanish quietly."""
        event = make_event(
            "dispute.resolved",
            {
                "dispute_id": "dsp_2",
                "card_id": seeded_card["card_token"],
                "transaction_id": "fis_txn_never_seen",
                "credit_amount": 20.0,
            },
        )
        post_event(client, event)

        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "failed"
        assert "fis_txn_never_seen" in row["last_error"]

    @pytest.mark.parametrize("event_type", ["dispute.created", "dispute.updated"])
    def test_dispute_lifecycle_events_complete(self, client, db, seeded_card, event_type):
        event = make_event(
            event_type,
            {
                "dispute_id": "dsp_3",
                "card_id": seeded_card["card_token"],
                "transaction_id": "fis_txn_x",
            },
        )
        post_event(client, event)
        assert inbox_rows(db, event_id=event["event_id"])[0]["status"] == "processed"


# =============================================================================
# Balance events — declared but never dispatched
# =============================================================================


class TestBalanceEvents:
    @pytest.mark.parametrize("event_type", ["balance.low", "balance.updated"])
    def test_balance_events_are_handled_not_silently_dropped(
        self, client, db, seeded_card, event_type
    ):
        event = make_event(
            event_type,
            {
                "card_id": seeded_card["card_token"],
                "available_balance": 12.34,
                "current_balance": 12.34,
                "threshold": 25.0,
            },
        )
        assert post_event(client, event).status_code == 200

        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "processed"

    def test_balance_event_does_not_overwrite_the_wallet_ledger(self, client, db, seeded_card):
        """
        A card available-balance notification is not the wallet ledger balance.
        Deliberately non-mutating — asserted so nobody "helpfully" wires it up.
        """
        db.execute(
            text(
                "INSERT INTO wallets (id, user_id, balance, currency, status) "
                "VALUES (:id, :user_id, 500.00, 'USD', 'active')"
            ),
            {"id": str(uuid.uuid4()), "user_id": seeded_card["user_id"]},
        )
        db.commit()

        post_event(
            client,
            make_event(
                "balance.updated",
                {
                    "card_id": seeded_card["card_token"],
                    "available_balance": 1.00,
                },
            ),
        )

        balance = db.execute(
            text("SELECT balance FROM wallets WHERE user_id = :uid"),
            {"uid": seeded_card["user_id"]},
        ).scalar()
        assert float(balance) == 500.00


# =============================================================================
# Unknown events
# =============================================================================


class TestUnknownEvents:
    def test_unknown_event_type_is_rejected_visibly(self, client, db, seeded_card):
        """Still a 200 (do not make FIS retry forever) — but recorded, not dropped."""
        event = make_event("chargeback.opened", {"whatever": True})
        assert post_event(client, event).status_code == 200

        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "rejected"
        assert "chargeback.opened" in row["last_error"]
        assert row["raw_body"]  # still replayable if we later add a handler

    def test_unknown_subtype_of_a_known_family_is_rejected(self, client, db, seeded_card):
        event = make_event("card.melted", {"card_id": seeded_card["card_token"]})
        post_event(client, event)
        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "rejected"

    def test_malformed_payload_is_a_400(self, client, db):
        import time

        body = b"{not json"
        ts = str(int(time.time()))
        response = client.post(
            "/api/v1/webhooks/fis",
            content=body,
            headers={"X-FIS-Signature": sign_body(body, ts), "X-FIS-Timestamp": ts},
        )
        assert response.status_code == 400
        assert inbox_rows(db) == []

    def test_event_type_catalogue_is_still_served(self, client):
        response = client.get("/api/v1/webhooks/fis/events")
        assert response.status_code == 200
        types = {e["type"] for e in response.json()["events"]}
        assert "balance.low" in types
        assert "transaction.refunded" in types


# =============================================================================
# Card-surface kill switch (CARD_SURFACE_ENABLED)
# =============================================================================


class TestDarkCardSurface:
    """
    The switch gates PROCESSING, not ingestion.

    A dark surface must never cost us an inbound settlement event: processor
    retry horizons are finite, so rejecting at the door turns a long maintenance
    window into permanent loss. We store, we do not act, and we drain later.
    """

    def test_dark_surface_still_stores_the_event(self, client, db, seeded_card, monkeypatch):
        monkeypatch.setenv("CARD_SURFACE_ENABLED", "false")

        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_dark",
                "card_id": seeded_card["card_token"],
                "amount": 88.0,
            },
        )
        response = post_event(client, event)

        assert response.status_code == 200
        assert response.json()["processing_deferred"] is True

        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "pending"
        # Nothing was acted on...
        assert txn_rows(db, external_transaction_id="fis_txn_dark") == []
        # ...and no retry budget was burned: deferral is not failure.
        assert row["attempts"] == 0
        assert row["last_error"] is None
        assert row["dead_lettered_at"] is None

    def test_events_received_while_dark_drain_once_enabled(
        self, client, db, seeded_card, monkeypatch
    ):
        monkeypatch.setenv("CARD_SURFACE_ENABLED", "false")
        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_drain",
                "card_id": seeded_card["card_token"],
                "amount": 17.0,
            },
        )
        assert post_event(client, event).status_code == 200
        assert txn_rows(db, external_transaction_id="fis_txn_drain") == []

        # Surface comes back up.
        monkeypatch.setenv("CARD_SURFACE_ENABLED", "true")
        from app.routes import fis_webhooks

        results = fis_webhooks.process_due_events()

        assert results.get("processed") == 1
        db.commit()
        assert inbox_rows(db, event_id=event["event_id"])[0]["status"] == "processed"
        assert len(txn_rows(db, external_transaction_id="fis_txn_drain")) == 1

    def test_sweeper_defers_rather_than_failing_while_dark(
        self, client, db, seeded_card, monkeypatch
    ):
        monkeypatch.setenv("CARD_SURFACE_ENABLED", "false")
        event = make_event(
            "transaction.authorized",
            {
                "transaction_id": "fis_txn_defer",
                "card_id": seeded_card["card_token"],
                "amount": 3.0,
            },
        )
        post_event(client, event)

        from app.routes import fis_webhooks

        # Repeated sweeps while dark must not erode the retry budget.
        for _ in range(10):
            assert fis_webhooks.process_due_events() == {"deferred": 1}

        db.commit()
        row = inbox_rows(db, event_id=event["event_id"])[0]
        assert row["status"] == "pending"
        assert row["attempts"] == 0

    def test_signature_is_still_enforced_while_dark(self, client, db, seeded_card, monkeypatch):
        """A dark surface must not become an unauthenticated write path."""
        monkeypatch.setenv("CARD_SURFACE_ENABLED", "false")
        event = make_event("card.activated", {"card_id": seeded_card["card_token"]})

        assert post_event(client, event, signature="00" * 32).status_code == 401
        assert inbox_rows(db) == []

    def test_switch_defaults_to_off(self, monkeypatch):
        monkeypatch.delenv("CARD_SURFACE_ENABLED", raising=False)
        from app.routes import fis_webhooks

        assert fis_webhooks.card_surface_enabled() is False
