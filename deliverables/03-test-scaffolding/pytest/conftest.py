"""
Swipe Savvy Platform - Pytest Configuration

Fixtures and configuration for backend Python tests.
"""

import pytest
import asyncio
from typing import Generator, AsyncGenerator
from unittest.mock import MagicMock, AsyncMock
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Import your app modules (adjust paths as needed)
# from app.main import app
# from app.database import Base, get_db
# from app.core.config import settings


# ==================== FIXTURES ====================


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_engine():
    """Create a test database engine using SQLite in-memory."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    yield engine
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(test_engine) -> Generator[Session, None, None]:
    """Create a new database session for each test."""
    # Import Base from your models
    # Base.metadata.create_all(bind=test_engine)

    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        # Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def mock_db_session():
    """Mock database session for unit tests that don't need real DB."""
    session = MagicMock(spec=Session)
    session.query.return_value.filter.return_value.first.return_value = None
    session.query.return_value.filter.return_value.all.return_value = []
    session.commit = MagicMock()
    session.rollback = MagicMock()
    session.add = MagicMock()
    session.delete = MagicMock()
    session.refresh = MagicMock()
    return session


@pytest.fixture
def client(db_session) -> Generator[TestClient, None, None]:
    """Create a test client with database session override."""
    # Uncomment and adjust when you have your app
    # def override_get_db():
    #     try:
    #         yield db_session
    #     finally:
    #         pass
    #
    # app.dependency_overrides[get_db] = override_get_db
    # with TestClient(app) as test_client:
    #     yield test_client
    # app.dependency_overrides.clear()

    # Placeholder
    yield MagicMock(spec=TestClient)


@pytest.fixture
async def async_client(db_session) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client."""
    # Uncomment when you have your app
    # async with AsyncClient(app=app, base_url="http://test") as ac:
    #     yield ac
    yield AsyncMock(spec=AsyncClient)


# ==================== AUTH FIXTURES ====================


@pytest.fixture
def test_user_data():
    """Sample user data for testing."""
    return {
        "id": "test-user-123",
        "email": "testuser@swipesavvy.test",
        "phone": "+15551234567",
        "kyc_status": "verified",
        "tier": "silver",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@pytest.fixture
def test_admin_data():
    """Sample admin user data for testing."""
    return {
        "id": "test-admin-456",
        "email": "admin@swipesavvy.com",
        "role": "admin",
        "permissions": ["users.read", "users.write", "merchants.read", "merchants.write"],
        "is_active": True,
    }


@pytest.fixture
def mock_jwt_token():
    """Generate a mock JWT token for testing."""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdC11c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.test"


@pytest.fixture
def auth_headers(mock_jwt_token):
    """Headers with authentication token."""
    return {
        "Authorization": f"Bearer {mock_jwt_token}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def test_headers():
    """Standard test headers with correlation IDs."""
    run_id = f"pytest-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    return {
        "Content-Type": "application/json",
        "X-Test-Run-Id": run_id,
        "X-Correlation-Id": f"{run_id}-001",
    }


# ==================== WALLET FIXTURES ====================


@pytest.fixture
def test_wallet_data():
    """Sample wallet data for testing."""
    return {
        "user_id": "test-user-123",
        "balance": 150.00,
        "pending_balance": 25.00,
        "currency": "USD",
    }


@pytest.fixture
def test_transaction_data():
    """Sample transaction data for testing."""
    return {
        "id": "tx-001",
        "user_id": "test-user-123",
        "type": "deposit",
        "amount": 50.00,
        "balance_after": 200.00,
        "status": "completed",
        "idempotency_key": "deposit-test-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@pytest.fixture
def generate_idempotency_key():
    """Factory fixture for generating idempotency keys."""
    counter = [0]

    def _generate(operation: str = "test") -> str:
        counter[0] += 1
        return f"{operation}-pytest-{datetime.now().strftime('%Y%m%d%H%M%S')}-{counter[0]}"

    return _generate


# ==================== REWARDS FIXTURES ====================


@pytest.fixture
def test_rewards_data():
    """Sample rewards data for testing."""
    return {
        "user_id": "test-user-123",
        "points_balance": 5000,
        "tier": "silver",
        "tier_progress": 0.65,
        "points_to_next_tier": 2500,
    }


@pytest.fixture
def test_boost_data():
    """Sample boost data for testing."""
    return {
        "id": "boost-001",
        "name": "Double Points Weekend",
        "multiplier": 2.0,
        "category": "all",
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
        "is_active": False,
    }


# ==================== MERCHANT FIXTURES ====================


@pytest.fixture
def test_merchant_data():
    """Sample merchant data for testing."""
    return {
        "id": "merchant-001",
        "name": "Coffee House",
        "category": "food_beverage",
        "status": "active",
        "reward_rate": 2.0,
        "address": "123 Main St, City, ST 12345",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


# ==================== MOCK EXTERNAL SERVICES ====================


@pytest.fixture
def mock_ses_client():
    """Mock AWS SES client for email testing."""
    mock = MagicMock()
    mock.send_email.return_value = {"MessageId": "test-message-id"}
    return mock


@pytest.fixture
def mock_redis_client():
    """Mock Redis client for cache testing."""
    mock = MagicMock()
    mock.get.return_value = None
    mock.set.return_value = True
    mock.delete.return_value = True
    mock.incr.return_value = 1
    mock.expire.return_value = True
    return mock


# ==================== HELPER FUNCTIONS ====================


def create_test_user(db_session, **kwargs):
    """Helper to create a test user in the database."""
    # Implement based on your User model
    pass


def create_test_transaction(db_session, user_id: str, **kwargs):
    """Helper to create a test transaction in the database."""
    # Implement based on your Transaction model
    pass


def create_test_merchant(db_session, **kwargs):
    """Helper to create a test merchant in the database."""
    # Implement based on your Merchant model
    pass


# ==================== PYTEST MARKERS ====================


def pytest_configure(config):
    """Configure custom pytest markers."""
    config.addinivalue_line("markers", "unit: mark test as a unit test")
    config.addinivalue_line("markers", "integration: mark test as an integration test")
    config.addinivalue_line("markers", "slow: mark test as slow running")
    config.addinivalue_line("markers", "auth: mark test as authentication related")
    config.addinivalue_line("markers", "wallet: mark test as wallet related")
    config.addinivalue_line("markers", "rewards: mark test as rewards related")
    config.addinivalue_line("markers", "admin: mark test as admin related")
