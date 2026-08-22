"""
Test harness for the FIS webhook surface.

Fully self-contained: every payload is a local fixture and no test ever contacts
a live FIS endpoint (SwipeSavvy has no finalised processor agreement, so the
suite must never depend on one). The only external dependency is a throwaway
PostgreSQL, because the bugs being covered here — a uuid primary key, a CHECK
constraint, a UNIQUE index — only exist in a real database.

Spin one up with:

    docker run -d --name fis-webhook-test-pg --rm \
        -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fis_webhook_test \
        -p 5455:5432 postgres:16-alpine

Override with TEST_DATABASE_URL if yours lives elsewhere.
"""

import hashlib
import hmac
import os
import time
import uuid
from typing import Any, Dict, Optional

import pytest

# ---------------------------------------------------------------------------
# Environment MUST be set before any app module is imported: app.database
# builds its engine at import time, and the FIS service singleton reads
# FIS_WEBHOOK_SECRET when it is constructed at import time.
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5455/fis_webhook_test",
)
# Forced, never inherited — a test run must never point at an ambient database.
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")

WEBHOOK_SECRET = "test-fis-webhook-secret"
os.environ["FIS_WEBHOOK_SECRET"] = WEBHOOK_SECRET

# The card-surface kill switch defaults to OFF. Without this, every processing
# assertion below would pass vacuously against a surface that never ran.
# Tests that specifically exercise the dark surface flip it back themselves.
os.environ["CARD_SURFACE_ENABLED"] = "true"


def sign_body(body: bytes, timestamp: str, secret: str = WEBHOOK_SECRET) -> str:
    """Produce the signature FIS would send for this body/timestamp pair."""
    signed_payload = f"{timestamp}.{body.decode('utf-8')}"
    return hmac.new(
        secret.encode("utf-8"), signed_payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()


def now_ts() -> str:
    return str(int(time.time()))


@pytest.fixture(scope="session")
def database_url() -> str:
    """Skip the whole suite (loudly) if no test database is reachable."""
    sqlalchemy = pytest.importorskip("sqlalchemy")
    try:
        engine = sqlalchemy.create_engine(TEST_DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("SELECT 1"))
        engine.dispose()
    except Exception as exc:  # noqa: BLE001
        pytest.skip(
            f"No test database at {TEST_DATABASE_URL} ({exc}). "
            "Start one: docker run -d --name fis-webhook-test-pg --rm "
            "-e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fis_webhook_test "
            "-p 5455:5432 postgres:16-alpine"
        )
    return TEST_DATABASE_URL


@pytest.fixture(scope="session")
def migrated(database_url):
    """
    Bring the test database to the real alembic head.

    Deliberately runs the ACTUAL migration chain rather than a hand-written test
    schema, so these tests fail if the migration and the handler ever disagree.
    """
    from alembic import command
    from alembic.config import Config

    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    cfg = Config(os.path.join(root, "alembic.ini"))
    cfg.set_main_option("script_location", os.path.join(root, "alembic"))
    cfg.set_main_option("sqlalchemy.url", database_url)
    command.upgrade(cfg, "head")
    return database_url


@pytest.fixture()
def db(migrated):
    """A clean database plus a seeded user and FIS card, per test."""
    from sqlalchemy import text

    from app.database import SessionLocal

    session = SessionLocal()
    session.execute(
        text(
            "TRUNCATE fis_webhook_events, wallet_transactions, fis_cards, users "
            "RESTART IDENTITY CASCADE"
        )
    )
    session.commit()
    yield session
    session.close()


@pytest.fixture()
def seeded_card(db) -> Dict[str, str]:
    """A user with an FIS card. Returns the ids the webhooks will reference."""
    from sqlalchemy import text

    user_id = str(uuid.uuid4())
    card_id = str(uuid.uuid4())
    card_token = "fis_tok_test_0001"

    db.execute(
        text("""
            INSERT INTO users (id, email, password_hash, name, status, role)
            VALUES (:id, :email, 'x', 'Test User', 'active', 'user')
            """),
        {"id": user_id, "email": f"user-{user_id[:8]}@example.test"},
    )
    db.execute(
        text("""
            INSERT INTO fis_cards
                (id, user_id, fis_card_token, card_type, status, last_four,
                 card_network, cardholder_name)
            VALUES
                (:id, :user_id, :token, 'virtual', 'active', '4242', 'visa', 'Test User')
            """),
        {"id": card_id, "user_id": user_id, "token": card_token},
    )
    db.commit()
    return {"user_id": user_id, "card_id": card_id, "card_token": card_token}


@pytest.fixture()
def client(migrated):
    """A minimal app carrying only the webhook router (no app.main import)."""
    from fastapi import FastAPI
    from fastapi.testclient import TestClient

    from app.routes import fis_webhooks

    app = FastAPI()
    app.include_router(fis_webhooks.router)
    return TestClient(app)


def make_event(
    event_type: str,
    data: Dict[str, Any],
    event_id: Optional[str] = None,
    timestamp: Optional[str] = None,
) -> Dict[str, Any]:
    """Build a fixture webhook payload."""
    return {
        "event_id": event_id or f"evt_{uuid.uuid4().hex[:16]}",
        "event_type": event_type,
        "timestamp": timestamp or now_ts(),
        "data": data,
    }


def post_event(
    client,
    event: Dict[str, Any],
    timestamp: Optional[str] = None,
    signature: Optional[str] = None,
    secret: str = WEBHOOK_SECRET,
):
    """POST a fixture event with a correctly signed (or deliberately not) header."""
    import json

    body = json.dumps(event).encode("utf-8")
    ts = timestamp or now_ts()
    sig = signature if signature is not None else sign_body(body, ts, secret)
    return client.post(
        "/api/v1/webhooks/fis",
        content=body,
        headers={
            "X-FIS-Signature": sig,
            "X-FIS-Timestamp": ts,
            "Content-Type": "application/json",
        },
    )
