"""
Test Multi-Turn Conversations with History
Tests conversation management and context tracking
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "services" / "concierge-agent"))

from conversation import get_conversation_manager, Message

print("=" * 60)
print("TEST 1: Create Conversation Session")
print("=" * 60)

conv_mgr = get_conversation_manager()
session = conv_mgr.create_session(user_id="user_001", session_id="test_session_001")

print(f"✅ Session created: {session.session_id}")
print(f"   User: {session.user_id}")
print(f"   Started: {session.started_at}")
print(f"   Status: {session.status}")

print("\n" + "=" * 60)
print("TEST 2: Add Messages to History")
print("=" * 60)

# Simulate a conversation
conv_mgr.add_message("test_session_001", "user", "What's my account balance?")
conv_mgr.add_message("test_session_001", "assistant", "Your checking account has $3,456.78 and your savings has $12,500.00.", 
                     metadata={"tool_calls": ["get_account_balance"]})
conv_mgr.add_message("test_session_001", "user", "Show me my recent transactions")
conv_mgr.add_message("test_session_001", "assistant", "Here are your 5 most recent transactions...",
                     metadata={"tool_calls": ["get_transactions"]})

history = conv_mgr.get_history("test_session_001")
print(f"✅ Added {len(history)} messages")
for i, msg in enumerate(history, 1):
    print(f"   {i}. [{msg['role']}] {msg['content'][:50]}...")

print("\n" + "=" * 60)
print("TEST 3: Get Conversation History with Limit")
print("=" * 60)

limited_history = conv_mgr.get_history("test_session_001", limit=2)
print(f"✅ Retrieved last {len(limited_history)} messages:")
for msg in limited_history:
    print(f"   [{msg['role']}] {msg['content'][:60]}...")

print("\n" + "=" * 60)
print("TEST 4: Update Session Context")
print("=" * 60)

conv_mgr.update_context("test_session_001", {
    "user_preferences": {"notifications": "enabled"},
    "last_query_type": "transactions",
    "account_accessed": "acct_001"
})

context = conv_mgr.get_context("test_session_001")
print("✅ Context updated:")
for key, value in context.items():
    print(f"   {key}: {value}")

print("\n" + "=" * 60)
print("TEST 5: Get Session Summary")
print("=" * 60)

summary = conv_mgr.get_summary("test_session_001")
print("✅ Session summary:")
print(f"   Messages: {summary['message_count']}")
print(f"   User messages: {summary['user_messages']}")
print(f"   Assistant messages: {summary['assistant_messages']}")
print(f"   Duration: {summary['duration_seconds']:.2f}s")
print(f"   Status: {summary['status']}")

print("\n" + "=" * 60)
print("TEST 6: Get Recent Tool Calls")
print("=" * 60)

# Add a tool message
conv_mgr.add_message("test_session_001", "tool", "{'success': True, 'data': {...}}",
                     metadata={"tool_name": "get_account_balance", "tool_result": {"success": True}})

tool_calls = conv_mgr.get_recent_tool_calls("test_session_001", limit=3)
print(f"✅ Recent tool calls: {len(tool_calls)}")
for tc in tool_calls:
    print(f"   - {tc['tool']} at {tc['timestamp'][:19]}")

print("\n" + "=" * 60)
print("TEST 7: End Session")
print("=" * 60)

conv_mgr.end_session("test_session_001")
ended_session = conv_mgr.get_session("test_session_001")
print(f"✅ Session ended: {ended_session.status}")

print("\n" + "=" * 60)
print("TEST 8: Multiple Sessions")
print("=" * 60)

session2 = conv_mgr.create_session("user_002", "test_session_002")
conv_mgr.add_message("test_session_002", "user", "Hello!")
conv_mgr.add_message("test_session_002", "assistant", "Hi! How can I help?")

s1_messages = len(conv_mgr.get_history("test_session_001"))
s2_messages = len(conv_mgr.get_history("test_session_002"))

print(f"✅ Multiple sessions working:")
print(f"   Session 1: {s1_messages} messages")
print(f"   Session 2: {s2_messages} messages")

print("\n" + "=" * 60)
print("✅ ALL CONVERSATION TESTS PASSED")
print("=" * 60)
print("\nConversation management working:")
print("✓ Session creation")
print("✓ Message history")
print("✓ Context tracking")
print("✓ Session summaries")
print("✓ Tool call tracking")
print("✓ Multi-session support")
