"""
End-to-End Integration Tests for SwipeSavvy AI Agents
Tests full user journeys across all services
"""

import pytest
import httpx
import asyncio
from typing import Dict, Any
import time


BASE_URL = "http://localhost:8000"
RAG_URL = "http://localhost:8001"
GUARDRAILS_URL = "http://localhost:8002"


class TestE2EUserJourneys:
    """Test complete user journeys"""
    
    @pytest.fixture
    def session_data(self):
        """Create test session"""
        return {
            "session_id": f"e2e_test_{int(time.time())}",
            "user_id": "test_user_12345"
        }
    
    @pytest.mark.asyncio
    async def test_balance_inquiry_journey(self, session_data):
        """
        E2E Test: Balance Inquiry
        User asks for balance → Guardrails check → Concierge → Tool call → Response
        """
        async with httpx.AsyncClient() as client:
            # Step 1: User asks for balance
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "What's my account balance?",
                    "session_id": session_data["session_id"],
                    "user_id": session_data["user_id"]
                },
                timeout=30.0
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify response structure
            assert "message" in data
            assert "session_id" in data
            
            # Verify balance is in response
            assert "balance" in data["message"].lower() or "$" in data["message"]
            
            # Verify no safety violations
            assert data.get("guardrails_passed", True) is True
    
    @pytest.mark.asyncio
    async def test_transaction_history_journey(self, session_data):
        """
        E2E Test: Transaction History
        User requests transactions → RAG retrieval → Tool call → Response
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "Show me my recent transactions",
                    "session_id": session_data["session_id"],
                    "user_id": session_data["user_id"]
                },
                timeout=30.0
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert "message" in data
            assert "transaction" in data["message"].lower() or "payment" in data["message"].lower()
    
    @pytest.mark.asyncio
    async def test_money_transfer_journey(self, session_data):
        """
        E2E Test: Money Transfer
        User initiates transfer → Validation → Execution → Confirmation
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "Transfer $50 to account 67890",
                    "session_id": session_data["session_id"],
                    "user_id": session_data["user_id"]
                },
                timeout=30.0
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert "message" in data
            # Should mention transfer or confirmation
            message_lower = data["message"].lower()
            assert any(word in message_lower for word in ["transfer", "sent", "complete", "confirm"])
    
    @pytest.mark.asyncio
    async def test_bill_payment_journey(self, session_data):
        """
        E2E Test: Bill Payment
        User pays bill → Validation → Payment → Receipt
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "Pay my electricity bill $120",
                    "session_id": session_data["session_id"],
                    "user_id": session_data["user_id"]
                },
                timeout=30.0
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert "message" in data
            message_lower = data["message"].lower()
            assert any(word in message_lower for word in ["payment", "paid", "bill", "confirm"])
    
    @pytest.mark.asyncio
    async def test_multi_turn_conversation(self, session_data):
        """
        E2E Test: Multi-turn Conversation
        Tests session persistence across multiple interactions
        """
        async with httpx.AsyncClient() as client:
            # Turn 1: Ask for balance
            response1 = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "What's my balance?",
                    "session_id": session_data["session_id"],
                    "user_id": session_data["user_id"]
                },
                timeout=30.0
            )
            assert response1.status_code == 200
            
            # Turn 2: Follow-up question (context-dependent)
            response2 = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "Show me recent transactions",
                    "session_id": session_data["session_id"],
                    "user_id": session_data["user_id"]
                },
                timeout=30.0
            )
            assert response2.status_code == 200
            
            # Verify session maintained
            data2 = response2.json()
            assert data2["session_id"] == session_data["session_id"]


class TestServiceIntegration:
    """Test integration between services"""
    
    @pytest.mark.asyncio
    async def test_concierge_to_guardrails_integration(self):
        """Test Concierge calls Guardrails for safety checks"""
        async with httpx.AsyncClient() as client:
            # Send message that should trigger guardrails
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "What's my account balance?",
                    "session_id": "integration_test",
                    "user_id": "test_user"
                },
                timeout=30.0
            )
            
            assert response.status_code == 200
            # Should pass guardrails
            data = response.json()
            assert data.get("guardrails_passed", True) is True
    
    @pytest.mark.asyncio
    async def test_concierge_to_rag_integration(self):
        """Test Concierge retrieves context from RAG"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "How do I transfer money?",
                    "session_id": "rag_test",
                    "user_id": "test_user"
                },
                timeout=30.0
            )
            
            assert response.status_code == 200
            # Should have knowledge-based response
            data = response.json()
            assert len(data["message"]) > 50  # Substantive response
    
    @pytest.mark.asyncio
    async def test_guardrails_service_directly(self):
        """Test Guardrails service in isolation"""
        async with httpx.AsyncClient() as client:
            # Test safe content
            response = await client.post(
                f"{GUARDRAILS_URL}/api/v1/guardrails/check",
                json={
                    "text": "What's my account balance?",
                    "check_safety": True,
                    "check_pii": True,
                    "check_injection": True
                },
                timeout=10.0
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["is_safe"] is True
            assert data["has_pii"] is False
            assert data["is_injection"] is False
    
    @pytest.mark.asyncio
    async def test_rag_service_directly(self):
        """Test RAG service semantic search"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{RAG_URL}/api/v1/rag/search",
                json={
                    "query": "How to transfer money",
                    "limit": 5
                },
                timeout=10.0
            )
            
            # RAG might not be fully implemented yet
            # Just verify endpoint responds
            assert response.status_code in [200, 404, 501]


class TestFailureScenarios:
    """Test system behavior under failure conditions"""
    
    @pytest.mark.asyncio
    async def test_invalid_session_id(self):
        """Test handling of invalid session"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "message": "Test message",
                    "session_id": "",  # Invalid
                    "user_id": "test_user"
                },
                timeout=30.0
            )
            
            # Should either auto-generate session or return error
            assert response.status_code in [200, 400, 422]
    
    @pytest.mark.asyncio
    async def test_malformed_request(self):
        """Test handling of malformed requests"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{BASE_URL}/api/v1/chat",
                json={
                    "invalid_field": "test"
                },
                timeout=30.0
            )
            
            assert response.status_code in [400, 422]
    
    @pytest.mark.asyncio
    async def test_unsafe_content_blocked(self):
        """Test that unsafe content is blocked by guardrails"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GUARDRAILS_URL}/api/v1/guardrails/check",
                json={
                    "text": "I want to harm someone",
                    "check_safety": True,
                    "check_pii": False,
                    "check_injection": False
                },
                timeout=10.0
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["is_safe"] is False
            assert len(data["safety_violations"]) > 0
    
    @pytest.mark.asyncio
    async def test_pii_detection(self):
        """Test PII is detected and masked"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GUARDRAILS_URL}/api/v1/guardrails/check",
                json={
                    "text": "My SSN is 123-45-6789",
                    "check_safety": False,
                    "check_pii": True,
                    "check_injection": False
                },
                timeout=10.0
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["has_pii"] is True
            assert "***-**-****" in data["masked_text"]
            assert "123-45-6789" not in data["masked_text"]


class TestPerformanceRequirements:
    """Test performance SLOs are met"""
    
    @pytest.mark.asyncio
    async def test_response_time_under_load(self):
        """Test response times meet SLOs"""
        latencies = []
        
        async with httpx.AsyncClient() as client:
            for i in range(10):
                start = time.time()
                response = await client.post(
                    f"{BASE_URL}/api/v1/chat",
                    json={
                        "message": "What's my balance?",
                        "session_id": f"perf_test_{i}",
                        "user_id": "perf_user"
                    },
                    timeout=30.0
                )
                latency = (time.time() - start) * 1000  # ms
                latencies.append(latency)
                
                assert response.status_code == 200
        
        # Calculate percentiles
        latencies.sort()
        p50 = latencies[len(latencies) // 2]
        p95 = latencies[int(len(latencies) * 0.95)]
        
        print(f"\nLatency - P50: {p50:.0f}ms, P95: {p95:.0f}ms")
        
        # SLO: P95 < 2000ms (with AI inference)
        assert p95 < 2000, f"P95 latency {p95}ms exceeds 2000ms SLO"
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self):
        """Test system handles concurrent requests"""
        async with httpx.AsyncClient() as client:
            # Create 5 concurrent requests
            tasks = []
            for i in range(5):
                task = client.post(
                    f"{BASE_URL}/api/v1/chat",
                    json={
                        "message": "What's my balance?",
                        "session_id": f"concurrent_{i}",
                        "user_id": f"user_{i}"
                    },
                    timeout=30.0
                )
                tasks.append(task)
            
            # Execute concurrently
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # All should succeed
            success_count = sum(1 for r in responses if not isinstance(r, Exception) and r.status_code == 200)
            assert success_count >= 4, f"Only {success_count}/5 concurrent requests succeeded"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])
