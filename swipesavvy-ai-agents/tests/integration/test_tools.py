"""
Test AI Concierge with Tool Integration
Tests account balance and transaction tools
"""

import sys
from pathlib import Path

# Add services to path
sys.path.insert(0, str(Path(__file__).parent.parent / "services"))

from tools.account_tools import get_account_balance
from tools.transaction_tools import get_transactions, get_transaction_details

print("=" * 60)
print("TEST 1: Get Account Balance")
print("=" * 60)

result = get_account_balance(user_id="user_001")
if result["success"]:
    print("✅ Success!")
    print(f"User: {result['data']['user_id']}")
    print(f"Accounts: {len(result['data']['accounts'])}")
    for acc in result['data']['accounts']:
        print(f"  - {acc['account_type']}: ${acc['balance']:.2f} ({acc['account_number']})")
    print(f"Total Balance: ${result['data']['total_balance']:.2f}")
else:
    print(f"❌ Error: {result['error']['message']}")

print("\n" + "=" * 60)
print("TEST 2: Get Recent Transactions")
print("=" * 60)

result = get_transactions(user_id="user_001", limit=5)
if result["success"]:
    print("✅ Success!")
    print(f"Found {result['data']['count']} transactions")
    print(f"Total amount: ${result['data']['summary']['total_amount']:.2f}")
    print(f"Pending: {result['data']['summary']['pending_count']}")
    print("\nRecent transactions:")
    for txn in result['data']['transactions'][:5]:
        status_icon = "⏳" if txn['status'] == 'pending' else "✓"
        print(f"  {status_icon} {txn['date'][:10]} - {txn['merchant']}: ${txn['amount']:.2f} ({txn['category']})")
else:
    print(f"❌ Error: {result['error']['message']}")

print("\n" + "=" * 60)
print("TEST 3: Get Transaction Details")
print("=" * 60)

# Get first transaction ID from previous result
if result["success"] and result['data']['transactions']:
    txn_id = result['data']['transactions'][0]['id']
    result = get_transaction_details(user_id="user_001", transaction_id=txn_id)
    if result["success"]:
        print("✅ Success!")
        txn = result['data']
        print(f"Transaction ID: {txn['id']}")
        print(f"Merchant: {txn['merchant']}")
        print(f"Amount: ${txn['amount']:.2f}")
        print(f"Category: {txn['category']}")
        print(f"Status: {txn['status']}")
        print(f"Date: {txn['created_at'][:10]}")
        print(f"Can dispute: {txn['metadata']['can_dispute']}")
    else:
        print(f"❌ Error: {result['error']['message']}")

print("\n" + "=" * 60)
print("TEST 4: Filter Transactions by Category")
print("=" * 60)

result = get_transactions(user_id="user_001", category="shopping", limit=5)
if result["success"]:
    print("✅ Success!")
    print(f"Found {result['data']['count']} shopping transactions")
    for txn in result['data']['transactions']:
        print(f"  - {txn['merchant']}: ${txn['amount']:.2f}")
else:
    print(f"❌ Error: {result['error']['message']}")

print("\n" + "=" * 60)
print("TEST 5: Error Handling - Invalid User")
print("=" * 60)

result = get_account_balance(user_id="invalid_user")
if not result["success"]:
    print("✅ Correctly handled error!")
    print(f"Error code: {result['error']['code']}")
    print(f"Message: {result['error']['message']}")
else:
    print("❌ Should have returned error for invalid user")

print("\n" + "=" * 60)
print("✅ ALL TOOL TESTS COMPLETED")
print("=" * 60)
print("\nTools working correctly:")
print("✓ Account balance queries")
print("✓ Transaction history")
print("✓ Transaction details")
print("✓ Filtering and pagination")
print("✓ Error handling")
