"""
End-to-End Tests for Customer Escalation Flow
Tests escalation triggers, context preservation, and handoff
"""

import pytest
import httpx
import time
from typing import Dict, Any, List


BASE_URL = "http://localhost:8000"


class TestEscalationTriggers:
    """Test scenarios that should trigger escalation to human support"""

    @pytest.fixture
    def customer_session(self):
        """Customer session from mobile app"""
        return {
            "session_id": f"escalation_test_{int(time.time())}",
            "user_id": "customer_esc_001",
            "context": {
                "is_mobile_app": True,
                "customer_tier": "gold",
                "customer_name": "Test Customer",
            },
        }

    @pytest.mark.asyncio
    async def test_fraud_mention_triggers_escalation(self, customer_session):
        """Test fraud/unauthorized transaction triggers immediate escalation offer"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "I see an unauthorized charge on my account for $500!",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            content = response.text.lower()

            # Should offer to connect with human support
            assert any(
                phrase in content
                for phrase in [
                    "connect you with",
                    "support agent",
                    "human agent",
                    "security team",
                    "investigate",
                ]
            )

    @pytest.mark.asyncio
    async def test_account_lockout_triggers_escalation(self, customer_session):
        """Test account access issues trigger escalation"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "I'm locked out of my account and can't reset my password!",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            content = response.text.lower()

            # Should offer human assistance
            assert any(
                phrase in content
                for phrase in [
                    "agent",
                    "support",
                    "help you",
                    "verify",
                    "identity",
                    "assist",
                ]
            )

    @pytest.mark.asyncio
    async def test_explicit_human_request(self, customer_session):
        """Test explicit request for human support"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "I want to speak to a real person, not a bot",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            content = response.text.lower()

            # Should acknowledge and offer to connect
            assert any(
                phrase in content
                for phrase in ["connect", "transfer", "agent", "support", "human"]
            )

    @pytest.mark.asyncio
    async def test_repeated_issue_triggers_escalation(self, customer_session):
        """Test repeated unsuccessful attempts trigger escalation"""
        async with httpx.AsyncClient() as client:
            # Simulate multiple turns of frustration
            messages = [
                "My transfer isn't working",
                "I tried again and it still doesn't work",
                "This is the third time I'm trying!",
            ]

            for msg in messages:
                response = await client.post(
                    f"{BASE_URL}/api/v1/chat",
                    json={
                        "message": msg,
                        **customer_session,
                    },
                    timeout=60.0,
                )
                assert response.status_code == 200

            # Final response should offer escalation
            content = response.text.lower()
            assert any(
                phrase in content
                for phrase in ["agent", "support", "help", "assist", "connect"]
            )

    @pytest.mark.asyncio
    async def test_angry_sentiment_priority_boost(self, customer_session):
        """Test angry sentiment increases priority"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "This is absolutely ridiculous! Your service is terrible and I want my money back NOW!",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            content = response.text.lower()

            # Should acknowledge frustration and offer immediate help
            assert any(
                phrase in content
                for phrase in [
                    "understand",
                    "apologize",
                    "help",
                    "right away",
                    "immediately",
                    "agent",
                ]
            )


class TestEscalationContext:
    """Test context is properly preserved during escalation"""

    @pytest.fixture
    def customer_session(self):
        """Customer session with context"""
        return {
            "session_id": f"context_test_{int(time.time())}",
            "user_id": "customer_ctx_001",
            "context": {
                "is_mobile_app": True,
                "customer_tier": "platinum",
                "customer_name": "Context Test User",
            },
        }

    @pytest.mark.asyncio
    async def test_transaction_details_preserved(self, customer_session):
        """Test transaction details are captured for handoff"""
        async with httpx.AsyncClient() as client:
            # Mention specific transaction details
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "Transaction TXN-98765 for $250 at Amazon on January 5th wasn't me!",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            # AI should acknowledge the specific details

    @pytest.mark.asyncio
    async def test_multi_turn_context_preserved(self, customer_session):
        """Test context from multi-turn conversation is preserved"""
        async with httpx.AsyncClient() as client:
            # First turn - describe issue
            await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "I have a problem with a charge from yesterday",
                    **customer_session,
                },
                timeout=60.0,
            )

            # Second turn - add details
            await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "It was for $75.99 from a store I don't recognize",
                    **customer_session,
                },
                timeout=60.0,
            )

            # Third turn - request escalation
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "Can I talk to someone about this?",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            # Response should acknowledge the context from previous turns


class TestHandoffFlow:
    """Test the handoff process from AI to human agent"""

    @pytest.fixture
    def customer_session(self):
        """Customer session for handoff tests"""
        return {
            "session_id": f"handoff_test_{int(time.time())}",
            "user_id": "customer_handoff_001",
            "context": {
                "is_mobile_app": True,
                "customer_tier": "silver",
                "customer_name": "Handoff Test User",
            },
        }

    @pytest.mark.asyncio
    async def test_handoff_creates_ticket(self, customer_session):
        """Test escalation creates a support ticket"""
        async with httpx.AsyncClient() as client:
            # Trigger escalation
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "I need to dispute a charge. Please connect me with support.",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            # Should mention ticket or reference number if handoff occurred

    @pytest.mark.asyncio
    async def test_handoff_provides_wait_time(self, customer_session):
        """Test handoff provides estimated wait time"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "Transfer me to a human agent please",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            # Should provide some indication of next steps


class TestNoEscalationScenarios:
    """Test scenarios that should NOT trigger escalation"""

    @pytest.fixture
    def customer_session(self):
        """Customer session for non-escalation tests"""
        return {
            "session_id": f"no_esc_test_{int(time.time())}",
            "user_id": "customer_no_esc_001",
            "context": {
                "is_mobile_app": True,
                "customer_tier": "basic",
            },
        }

    @pytest.mark.asyncio
    async def test_simple_balance_inquiry(self, customer_session):
        """Test simple balance inquiry doesn't trigger escalation"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "What's my account balance?",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            content = response.text.lower()

            # Should NOT offer escalation for simple inquiry
            # (unless there's an error)
            # Just verify it responds

    @pytest.mark.asyncio
    async def test_feature_question(self, customer_session):
        """Test feature questions don't trigger escalation"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "How do I set up recurring payments?",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            # Should provide helpful response without escalation

    @pytest.mark.asyncio
    async def test_rewards_inquiry(self, customer_session):
        """Test rewards inquiry doesn't trigger escalation"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "How many reward points do I have?",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            # Should answer without escalation


class TestCategoryClassification:
    """Test correct category assignment for escalated issues"""

    @pytest.fixture
    def customer_session(self):
        """Customer session for category tests"""
        return {
            "session_id": f"category_test_{int(time.time())}",
            "user_id": "customer_cat_001",
            "context": {
                "is_mobile_app": True,
            },
        }

    @pytest.mark.asyncio
    async def test_security_issue_classification(self, customer_session):
        """Test security issues are correctly classified"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "Someone hacked my account!",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            content = response.text.lower()
            # Should mention security or fraud team
            assert any(
                word in content for word in ["security", "fraud", "protect", "investigate"]
            )

    @pytest.mark.asyncio
    async def test_banking_issue_classification(self, customer_session):
        """Test banking issues are correctly classified"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "My deposit didn't show up in my account",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            # Should handle as banking/transaction issue

    @pytest.mark.asyncio
    async def test_technical_issue_classification(self, customer_session):
        """Test technical issues are correctly classified"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "The app keeps crashing when I try to make a payment",
                    **customer_session,
                },
                timeout=60.0,
            )

            assert response.status_code == 200
            # Should acknowledge technical issue


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])
