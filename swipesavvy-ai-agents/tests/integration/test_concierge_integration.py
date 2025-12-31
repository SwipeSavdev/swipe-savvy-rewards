"""
Integration tests for AI Concierge service

These tests verify end-to-end functionality with all services integrated.
"""

import pytest
from services.concierge_agent.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_concierge_health():
    """Test that concierge service is healthy"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_concierge_chat_endpoint():
    """Test basic chat functionality"""
    payload = {
        "user_id": "user_123",
        "message": "What's my balance?",
        "session_id": "test_session_1"
    }
    response = client.post("/api/v1/concierge/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "session_id" in data
    assert data["session_id"] == "test_session_1"


# TODO (Week 6): Add comprehensive integration tests
# - Test full conversation flow with RAG
# - Test guardrails integration
# - Test tool function calls
# - Test identity verification flow
# - Test handoff flow
# - Test error handling and retries
# - Test with real Together.AI API (in staging)


@pytest.mark.skip(reason="Requires Together.AI API key - implement in Week 4")
def test_concierge_with_real_llm():
    """Test concierge with real LLM API call"""
    pass


@pytest.mark.skip(reason="Requires database - implement in Week 2")
def test_concierge_with_database():
    """Test that conversation history is persisted"""
    pass
