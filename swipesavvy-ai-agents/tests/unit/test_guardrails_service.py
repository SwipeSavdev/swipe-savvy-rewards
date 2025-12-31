"""
Unit tests for Guardrails service
"""

import pytest
import sys
from pathlib import Path

# Add services directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "services/guardrails-service"))

from main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint returns service info"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Guardrails Service"
    assert data["status"] == "healthy"


def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data


def test_check_endpoint_input():
    """Test guardrails check endpoint with input direction"""
    payload = {
        "message": "What is my account balance?",
        "direction": "input",
        "user_id": "user_123"
    }
    response = client.post("/api/v1/guardrails/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "safe" in data
    assert "violations" in data
    assert "masked_message" in data
    assert "confidence" in data


def test_check_endpoint_output():
    """Test guardrails check endpoint with output direction"""
    payload = {
        "message": "Your balance is $1,234.56",
        "direction": "output"
    }
    response = client.post("/api/v1/guardrails/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "safe" in data


# TODO (Week 3): Add real guardrails tests
# - Test PII detection and masking
# - Test prompt injection detection
# - Test refusal patterns
# - Test content moderation
# - Test various PII types (SSN, credit card, phone, email, address)
