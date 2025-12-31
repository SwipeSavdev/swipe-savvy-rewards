"""
Example Gold Set - Account Balance Queries

This is a sample gold set for evaluating agent performance on
account balance related queries.

Format:
{
    "input": "User query",
    "expected_tool_calls": ["tool_name"],
    "expected_response_type": "response_category",
    "expected_tone": "friendly|professional|empathetic",
    "should_handoff": false,
    "requires_verification": true,
    "category": "use_case_category",
    "difficulty": "easy|medium|hard",
    "notes": "Additional context for evaluators"
}
"""

gold_set_account_balance = [
    {
        "input": "What's my balance?",
        "expected_tool_calls": ["get_account_balance"],
        "expected_response_type": "account_balance",
        "expected_tone": "friendly",
        "should_handoff": False,
        "requires_verification": True,
        "category": "account_balance",
        "difficulty": "easy",
        "notes": "Most common query, should be handled quickly"
    },
    {
        "input": "How much money do I have?",
        "expected_tool_calls": ["get_account_balance"],
        "expected_response_type": "account_balance",
        "expected_tone": "friendly",
        "should_handoff": False,
        "requires_verification": True,
        "category": "account_balance",
        "difficulty": "easy",
        "notes": "Natural language variation of balance query"
    },
    {
        "input": "Can you check my balance?",
        "expected_tool_calls": ["get_account_balance"],
        "expected_response_type": "account_balance",
        "expected_tone": "friendly",
        "should_handoff": False,
        "requires_verification": True,
        "category": "account_balance",
        "difficulty": "easy",
        "notes": "Polite request form"
    },
    {
        "input": "balance",
        "expected_tool_calls": ["get_account_balance"],
        "expected_response_type": "account_balance",
        "expected_tone": "friendly",
        "should_handoff": False,
        "requires_verification": True,
        "category": "account_balance",
        "difficulty": "easy",
        "notes": "Single word query, should still understand intent"
    },
    {
        "input": "What's my available balance?",
        "expected_tool_calls": ["get_account_balance"],
        "expected_response_type": "account_balance",
        "expected_tone": "friendly",
        "should_handoff": False,
        "requires_verification": True,
        "category": "account_balance",
        "difficulty": "easy",
        "notes": "Specific about available vs pending"
    },
    {
        "input": "Do I have enough money to buy a $50 item?",
        "expected_tool_calls": ["get_account_balance"],
        "expected_response_type": "account_balance",
        "expected_tone": "friendly",
        "should_handoff": False,
        "requires_verification": True,
        "category": "account_balance",
        "difficulty": "medium",
        "notes": "Should check balance and compare to $50"
    },
    {
        "input": "What's my balance? I think there's an error.",
        "expected_tool_calls": ["get_account_balance"],
        "expected_response_type": "account_balance",
        "expected_tone": "empathetic",
        "should_handoff": False,
        "requires_verification": True,
        "category": "account_balance",
        "difficulty": "medium",
        "notes": "User suspects an issue, use empathetic tone"
    },
    {
        "input": "Show me my account balance and recent transactions",
        "expected_tool_calls": ["get_account_balance", "get_recent_transactions"],
        "expected_response_type": "account_balance_and_transactions",
        "expected_tone": "friendly",
        "should_handoff": False,
        "requires_verification": True,
        "category": "account_balance",
        "difficulty": "medium",
        "notes": "Multi-part query requiring two tool calls"
    },
    {
        "input": "I don't recognize the balance showing. Can you explain?",
        "expected_tool_calls": ["get_account_balance", "get_recent_transactions"],
        "expected_response_type": "account_balance_and_transactions",
        "expected_tone": "empathetic",
        "should_handoff": False,
        "requires_verification": True,
        "category": "account_balance",
        "difficulty": "hard",
        "notes": "May need to show recent transactions to explain balance"
    },
    {
        "input": "What's my balance in my other account?",
        "expected_tool_calls": [],
        "expected_response_type": "clarification_needed",
        "expected_tone": "professional",
        "should_handoff": False,
        "requires_verification": False,
        "category": "account_balance",
        "difficulty": "medium",
        "notes": "Should ask for clarification - which account?"
    }
]


gold_set_metadata = {
    "version": "1.0.0",
    "created_date": "2025-12-23",
    "category": "account_balance",
    "total_examples": len(gold_set_account_balance),
    "difficulty_distribution": {
        "easy": 5,
        "medium": 4,
        "hard": 1
    },
    "coverage": [
        "Direct balance queries",
        "Natural language variations",
        "Multi-part queries",
        "Edge cases and errors",
        "Clarification scenarios"
    ],
    "notes": "This is a starter gold set for Week 7 evaluation"
}


if __name__ == "__main__":
    import json
    
    output = {
        "metadata": gold_set_metadata,
        "examples": gold_set_account_balance
    }
    
    print(json.dumps(output, indent=2))
    print(f"\nTotal examples: {len(gold_set_account_balance)}")
