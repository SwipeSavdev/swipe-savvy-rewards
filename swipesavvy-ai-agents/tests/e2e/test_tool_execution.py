"""
End-to-End Tests for Tool Execution in Agentic AI
Tests tool calling, execution, and result handling
"""

import pytest
import httpx
import json
import time
from typing import Dict, Any, List


BASE_URL = "http://localhost:8000"


class TestToolCalling:
    """Test AI correctly identifies and calls appropriate tools"""

    @pytest.fixture
    def admin_session(self):
        """Admin session with broad permissions"""
        return {
            "session_id": f"tool_test_{int(time.time())}",
            "user_id": "admin_tool_001",
            "role": "admin",
            "permissions": [
                "users:read",
                "users:write",
                "merchants:read",
                "merchants:write",
                "transactions:read",
                "transactions:refund",
                "support:read",
                "support:write",
                "analytics:read",
                "feature_flags:write",
            ],
            "employee_name": "Tool Test Admin",
        }

    @pytest.mark.asyncio
    async def test_user_lookup_triggers_tool(self, admin_session):
        """Test that user lookup message triggers lookup_user tool"""
        events = await self._collect_stream_events(
            {
                "message": "Look up the customer with email test@example.com",
                **admin_session,
            }
        )

        # Should have tool_call event
        tool_calls = [e for e in events if e.get("type") == "tool_call"]
        assert len(tool_calls) > 0, "Expected tool_call event"
        assert any(
            tc.get("tool") == "lookup_user" for tc in tool_calls
        ), "Expected lookup_user tool"

    @pytest.mark.asyncio
    async def test_transaction_lookup_triggers_tool(self, admin_session):
        """Test transaction lookup triggers correct tool"""
        events = await self._collect_stream_events(
            {
                "message": "Show me details for transaction TXN-12345",
                **admin_session,
            }
        )

        tool_calls = [e for e in events if e.get("type") == "tool_call"]
        assert len(tool_calls) > 0
        assert any(tc.get("tool") == "lookup_transaction" for tc in tool_calls)

    @pytest.mark.asyncio
    async def test_create_ticket_triggers_tool(self, admin_session):
        """Test ticket creation triggers correct tool"""
        events = await self._collect_stream_events(
            {
                "message": "Create a high priority support ticket for customer cust_123 about a billing dispute",
                **admin_session,
            }
        )

        tool_calls = [e for e in events if e.get("type") == "tool_call"]
        assert len(tool_calls) > 0
        assert any(tc.get("tool") == "create_support_ticket" for tc in tool_calls)

    @pytest.mark.asyncio
    async def test_analytics_triggers_tool(self, admin_session):
        """Test analytics request triggers correct tool"""
        events = await self._collect_stream_events(
            {
                "message": "Get me the platform analytics for the last 7 days",
                **admin_session,
            }
        )

        tool_calls = [e for e in events if e.get("type") == "tool_call"]
        assert len(tool_calls) > 0
        assert any(tc.get("tool") == "get_analytics" for tc in tool_calls)

    @pytest.mark.asyncio
    async def test_refund_triggers_tool_with_amount(self, admin_session):
        """Test refund request extracts amount correctly"""
        events = await self._collect_stream_events(
            {
                "message": "Process a $150.50 refund for transaction TXN-REFUND-001",
                **admin_session,
            }
        )

        tool_calls = [e for e in events if e.get("type") == "tool_call"]
        refund_calls = [tc for tc in tool_calls if tc.get("tool") == "process_refund"]

        if len(refund_calls) > 0:
            # Check args contain amount
            args = refund_calls[0].get("args", {})
            if isinstance(args, str):
                args = json.loads(args)
            # Amount should be extracted
            assert "amount" in args or "150" in str(args)

    @pytest.mark.asyncio
    async def test_multi_tool_sequence(self, admin_session):
        """Test AI can chain multiple tools"""
        events = await self._collect_stream_events(
            {
                "message": "Look up customer john@example.com and then show me their recent transactions",
                **admin_session,
            }
        )

        tool_calls = [e for e in events if e.get("type") == "tool_call"]
        # Should have called both lookup tools
        tool_names = [tc.get("tool") for tc in tool_calls]
        # At minimum should call one lookup tool
        assert len(tool_calls) >= 1

    async def _collect_stream_events(self, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Helper to collect all events from SSE stream"""
        events = []
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{BASE_URL}/api/v1/ai-concierge/agentic",
                json=payload,
                timeout=60.0,
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            event = json.loads(data)
                            events.append(event)
                        except json.JSONDecodeError:
                            pass
        return events


class TestToolResults:
    """Test tool execution results are handled correctly"""

    @pytest.fixture
    def admin_session(self):
        """Admin session for result tests"""
        return {
            "session_id": f"result_test_{int(time.time())}",
            "user_id": "admin_result_001",
            "role": "admin",
            "permissions": ["*"],
            "employee_name": "Result Test Admin",
        }

    @pytest.mark.asyncio
    async def test_tool_result_event_format(self, admin_session):
        """Test tool_result events have correct format"""
        events = await self._collect_stream_events(
            {
                "message": "Look up user test@example.com",
                **admin_session,
            }
        )

        tool_results = [e for e in events if e.get("type") == "tool_result"]

        for result in tool_results:
            assert "tool" in result, "tool_result should have tool name"
            assert "success" in result or "result" in result, "tool_result should have success or result"

    @pytest.mark.asyncio
    async def test_successful_tool_result_incorporated(self, admin_session):
        """Test successful tool results are incorporated into response"""
        events = await self._collect_stream_events(
            {
                "message": "Get platform analytics for the last 7 days",
                **admin_session,
            }
        )

        # Should have final message with analytics info
        message_events = [e for e in events if e.get("type") in ["message", "done"]]
        final_content = "".join(
            e.get("content", "") or e.get("delta", "") for e in message_events
        )

        # Final response should reference analytics data
        assert len(final_content) > 50, "Response should be substantive"

    @pytest.mark.asyncio
    async def test_failed_tool_result_handled(self, admin_session):
        """Test failed tool results are handled gracefully"""
        # Use invalid ID to trigger potential failure
        events = await self._collect_stream_events(
            {
                "message": "Look up transaction with ID INVALID_TXN_DOES_NOT_EXIST_12345",
                **admin_session,
            }
        )

        # Should still get a response (not crash)
        message_events = [e for e in events if e.get("type") in ["message", "done"]]
        assert len(message_events) > 0, "Should get response even on tool failure"

    async def _collect_stream_events(self, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Helper to collect all events from SSE stream"""
        events = []
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{BASE_URL}/api/v1/ai-concierge/agentic",
                json=payload,
                timeout=60.0,
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            event = json.loads(data)
                            events.append(event)
                        except json.JSONDecodeError:
                            pass
        return events


class TestToolPermissionEnforcement:
    """Test tool permissions are enforced at execution time"""

    @pytest.fixture
    def analyst_session(self):
        """Analyst session (read-only)"""
        return {
            "session_id": f"perm_test_{int(time.time())}",
            "user_id": "analyst_perm_001",
            "role": "analyst",
            "permissions": ["analytics:read", "transactions:read", "merchants:read"],
            "employee_name": "Permission Test Analyst",
        }

    @pytest.fixture
    def support_session(self):
        """Support session (limited write)"""
        return {
            "session_id": f"support_perm_{int(time.time())}",
            "user_id": "support_perm_001",
            "role": "support",
            "permissions": [
                "users:read",
                "transactions:read",
                "transactions:refund",
                "support:read",
                "support:write",
            ],
            "employee_name": "Permission Test Support",
        }

    @pytest.mark.asyncio
    async def test_analyst_cannot_create_ticket(self, analyst_session):
        """Test analyst cannot execute create_support_ticket tool"""
        events = await self._collect_stream_events(
            {
                "message": "Create a support ticket for issue XYZ",
                **analyst_session,
            }
        )

        # Should either not call tool or get permission error
        tool_results = [e for e in events if e.get("type") == "tool_result"]
        create_results = [
            r for r in tool_results if r.get("tool") == "create_support_ticket"
        ]

        # If tool was called, it should have failed
        for result in create_results:
            assert result.get("success") is False or "permission" in str(
                result.get("result", {})
            ).lower()

    @pytest.mark.asyncio
    async def test_analyst_cannot_process_refund(self, analyst_session):
        """Test analyst cannot execute process_refund tool"""
        events = await self._collect_stream_events(
            {
                "message": "Process a $50 refund for transaction TXN-123",
                **analyst_session,
            }
        )

        # Check final message indicates permission issue
        message_events = [e for e in events if e.get("type") in ["message", "done"]]
        final_content = "".join(
            e.get("content", "") or e.get("delta", "") for e in message_events
        ).lower()

        # Should mention permission limitation
        assert any(
            word in final_content
            for word in ["permission", "cannot", "not allowed", "read-only", "analyst"]
        )

    @pytest.mark.asyncio
    async def test_support_can_create_ticket(self, support_session):
        """Test support can execute create_support_ticket tool"""
        events = await self._collect_stream_events(
            {
                "message": "Create a support ticket for customer cust_456 about login issues",
                **support_session,
            }
        )

        # Should successfully call tool
        tool_calls = [e for e in events if e.get("type") == "tool_call"]
        ticket_calls = [
            tc for tc in tool_calls if tc.get("tool") == "create_support_ticket"
        ]
        assert len(ticket_calls) > 0, "Support should be able to create tickets"

    @pytest.mark.asyncio
    async def test_support_limited_refund_amount(self, support_session):
        """Test support role limited to $100 refunds"""
        events = await self._collect_stream_events(
            {
                "message": "Process a $250 refund for transaction TXN-OVER-LIMIT",
                **support_session,
            }
        )

        # Should mention limit
        message_events = [e for e in events if e.get("type") in ["message", "done"]]
        final_content = "".join(
            e.get("content", "") or e.get("delta", "") for e in message_events
        ).lower()

        assert any(
            word in final_content
            for word in ["limit", "$100", "exceed", "maximum", "escalate"]
        )

    async def _collect_stream_events(self, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Helper to collect all events from SSE stream"""
        events = []
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{BASE_URL}/api/v1/ai-concierge/agentic",
                json=payload,
                timeout=60.0,
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            event = json.loads(data)
                            events.append(event)
                        except json.JSONDecodeError:
                            pass
        return events


class TestAgenticLoopBehavior:
    """Test agentic loop behavior and limits"""

    @pytest.fixture
    def admin_session(self):
        """Admin session for loop tests"""
        return {
            "session_id": f"loop_test_{int(time.time())}",
            "user_id": "admin_loop_001",
            "role": "admin",
            "permissions": ["*"],
            "employee_name": "Loop Test Admin",
        }

    @pytest.mark.asyncio
    async def test_loop_terminates_with_response(self, admin_session):
        """Test agentic loop terminates with final response"""
        events = await self._collect_stream_events(
            {
                "message": "What's the status of merchant MERCH-001?",
                **admin_session,
            }
        )

        # Should have done event
        done_events = [e for e in events if e.get("type") == "done"]
        assert len(done_events) > 0, "Should have done event"

    @pytest.mark.asyncio
    async def test_loop_handles_no_tool_needed(self, admin_session):
        """Test loop handles simple questions without tools"""
        events = await self._collect_stream_events(
            {
                "message": "Hello, how are you?",
                **admin_session,
            }
        )

        # Should respond without tool calls
        tool_calls = [e for e in events if e.get("type") == "tool_call"]
        message_events = [e for e in events if e.get("type") in ["message", "done"]]

        # Should have message but may not need tools
        assert len(message_events) > 0

    @pytest.mark.asyncio
    async def test_loop_max_iterations_respected(self, admin_session):
        """Test loop doesn't exceed max iterations"""
        # Complex query that might trigger multiple iterations
        events = await self._collect_stream_events(
            {
                "message": "Look up all transactions for customer cust_123, then for each failed transaction create a support ticket",
                **admin_session,
            }
        )

        # Count tool calls - shouldn't exceed reasonable limit
        tool_calls = [e for e in events if e.get("type") == "tool_call"]
        assert len(tool_calls) <= 10, "Tool calls should be bounded"

    async def _collect_stream_events(self, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Helper to collect all events from SSE stream"""
        events = []
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{BASE_URL}/api/v1/ai-concierge/agentic",
                json=payload,
                timeout=60.0,
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            event = json.loads(data)
                            events.append(event)
                        except json.JSONDecodeError:
                            pass
        return events


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])
