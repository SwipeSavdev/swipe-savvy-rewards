"""
Shared fixtures for the FIS route authorization tests.

Self-contained by construction: a throwaway SQLite file backs the ownership
lookups and the FIS service layer is replaced with in-process fakes, so nothing
here contacts a live FIS endpoint. (The FIS client mocks itself when no
credentials are present, but these tests never rely on that either.)

The environment must be configured BEFORE `app.database` is imported, because
that module builds its engine at import time from DATABASE_URL.
"""

import os
import tempfile
import uuid

_TMP_DIR = tempfile.mkdtemp(prefix="fis-route-tests-")

# File-backed (not :memory:) so every pooled connection sees the same rows.
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_TMP_DIR}/fis_test.db")
os.environ.setdefault("JWT_SECRET_KEY", "unit-test-jwt-secret-key-not-a-real-secret-0123456789")

# The FIS surface is separately gated by an availability kill switch that
# defaults to OFF. These tests mount the routers directly (see the client
# fixtures below) rather than importing app.main, so router-level gating there
# cannot reach them -- but the flag is set anyway so that a future move to the
# real app object cannot silently turn every assertion into a vacuous 503.
# The owner-allowed tests assert an exact 200 for this reason: a 503 fails them
# loudly instead of being mistaken for "access denied".
os.environ.setdefault("CARD_SURFACE_ENABLED", "true")

import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import JSON, String  # noqa: E402
from sqlalchemy.dialects.postgresql import JSONB  # noqa: E402

from app.core.auth import create_access_token  # noqa: E402
from app.database import SessionLocal, engine  # noqa: E402
from app.models import FISCard, FISFraudAlert  # noqa: E402
from app.services.fis_global_service import FISAPIResponse  # noqa: E402

# =============================================================================
# DATABASE
# =============================================================================
#
# These models are Postgres-shaped. Two column types need adapting to run them
# on SQLite, and NEITHER weakens what the tests exercise:
#
#   UUID  -> String(36). On Postgres the UUID bind processor is a no-op and the
#            raw string is handed to psycopg2 (verified against the postgresql
#            dialect), so production compares strings too. SQLite's UUID
#            processor instead demands a uuid.UUID object and raises on any
#            string. String(36) reproduces the Postgres behaviour.
#   JSONB -> JSON. Storage detail only; nothing here reads the column.


def _sqlite_compatible(table):
    for column in table.columns:
        if column.type.__class__.__name__ == "UUID":
            column.type = String(36)
        elif isinstance(column.type, JSONB):
            column.type = JSON()
    return table


@pytest.fixture(scope="session", autouse=True)
def _fis_tables():
    """Create the tables the ownership checks read."""
    for model in (FISCard, FISFraudAlert):
        _sqlite_compatible(model.__table__).create(engine, checkfirst=True)
    yield


def _make_card(user_id: str, fis_card_id: str) -> str:
    db = SessionLocal()
    try:
        card = FISCard(
            id=str(uuid.uuid4()),
            user_id=user_id,
            fis_card_id=fis_card_id,
            fis_card_token=f"tok_{uuid.uuid4().hex}",
            card_type="virtual",
            status="active",
            last_four="4242",
            expiry_month=12,
            expiry_year=2030,
            cardholder_name="TEST USER",
        )
        db.add(card)
        db.commit()
        return fis_card_id
    finally:
        db.close()


class Actor:
    """An authenticated user plus a card they own."""

    def __init__(self, label: str):
        self.user_id = str(uuid.uuid4())
        self.card_id = _make_card(self.user_id, f"card_{label}_{uuid.uuid4().hex[:10]}")
        self.token = create_access_token(self.user_id)

    @property
    def headers(self):
        return {"Authorization": f"Bearer {self.token}"}


@pytest.fixture
def user_a():
    return Actor("a")


@pytest.fixture
def user_b():
    return Actor("b")


@pytest.fixture
def stranger():
    """An authenticated user who owns no cards at all."""

    class _NoCards:
        def __init__(self):
            self.user_id = str(uuid.uuid4())
            self.token = create_access_token(self.user_id)

        @property
        def headers(self):
            return {"Authorization": f"Bearer {self.token}"}

    return _NoCards()


# =============================================================================
# FAKE FIS SERVICE LAYER
# =============================================================================


class RecordingService:
    """
    Stand-in for FISFraudService / FISWalletService.

    Records every call so a test can assert *which* cards were queried, and
    returns success for everything -- so any 403/404 a test observes was
    produced by the route's authorization logic, never by the service.
    """

    def __init__(self, payloads=None):
        self.calls = []
        self._payloads = payloads or {}

    def _record(self, name, **kwargs):
        self.calls.append((name, kwargs))

    def cards_queried(self, name):
        return [kw.get("card_id") for n, kw in self.calls if n == name]

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)

        async def call(*args, **kwargs):
            if args:
                kwargs = dict(kwargs)
                kwargs.setdefault("card_id", args[0])
            self._record(name, **kwargs)
            payload = self._payloads.get(name, {"ok": True})
            if callable(payload):
                payload = payload(kwargs)
            return FISAPIResponse(success=True, data=payload)

        return call


@pytest.fixture
def fraud_client():
    """TestClient for the fraud router with a recording fake service."""
    from app.routes import fis_fraud

    def _build(payloads=None):
        service = RecordingService(payloads)
        app = FastAPI()
        app.include_router(fis_fraud.router)
        app.dependency_overrides[fis_fraud.get_fis_fraud_service] = lambda: service
        return TestClient(app), service

    return _build


@pytest.fixture
def wallet_client():
    """TestClient for the wallet router with a recording fake service."""
    from app.routes import fis_wallet

    def _build(payloads=None):
        service = RecordingService(payloads)
        app = FastAPI()
        app.include_router(fis_wallet.router)
        app.dependency_overrides[fis_wallet.get_fis_wallet_service] = lambda: service
        return TestClient(app), service

    return _build
