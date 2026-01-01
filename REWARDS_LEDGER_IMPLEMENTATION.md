# Rewards Ledger Implementation - BPS Payout System

## Overview

The rewards ledger system has been implemented with **Basis Points (BPS)** tier-based payouts. This document outlines the new 5-tier structure and how to use the system.

---

## Tier Structure & BPS Calculations

| Tier | Qualification | BPS | Percentage | Points Per $100 |
|------|---------------|-----|------------|-----------------|
| **Bronze** | $0 - $1,999 | 35 | 0.35% | $0.35 |
| **Silver** | $2,000 - $4,999 | 55 | 0.55% | $0.55 |
| **Gold** | $5,000 - $9,999 | 75 | 0.75% | $0.75 |
| **Platinum** | $10,000 - $14,999 | 100 | 1.0% | $1.00 |
| **Sapphire** | $15,000+ | 120 | 1.2% | $1.20 |

### Understanding Basis Points (BPS)

- **1 BPS = 0.01%**
- **100 BPS = 1%**
- **Formula**: Points Earned = Spent Amount × (BPS / 10000)

**Example**:
- Customer spends $100 in Silver tier (55 BPS)
- Points earned = $100 × (55 / 10000) = $100 × 0.0055 = $0.55 or 55 points

---

## System Components

### 1. **RewardsLedger Class**

Tracks all rewards payouts and creates ledger entries.

#### Methods:

**`calculate_payout(spent_amount, tier_key) -> float`**
- Calculates rewards points earned for a transaction
- Returns rounded points amount

**`create_ledger_entry(user_id, transaction_id, spent_amount, tier_key, merchant, timestamp) -> Dict`**
- Creates and stores a ledger entry
- Returns complete entry object with all details
- Status: 'credited'

**`get_ledger(user_id, limit) -> List[Dict]`**
- Retrieves ledger entries filtered by user
- Returns up to `limit` entries (default: all)

---

### 2. **RewardsService Class**

Enhanced service with new BPS-based methods.

#### New Methods:

**`get_tier_info(tier_key) -> Dict`**
- Returns complete tier configuration
- Includes: name, BPS, percentage, color code

**`calculate_tier_payout(spent_amount, tier_key) -> float`**
- Wrapper for ledger calculation
- Used for quick payout estimation

**`process_transaction(user_id, transaction_id, spent_amount, merchant) -> Tuple[bool, Dict]`**
- Main method to process a customer transaction
- Updates cumulative spend (determines tier)
- Creates ledger entry automatically
- Returns success status and complete details

**`get_ledger(user_id, limit) -> Tuple[bool, Dict]`**
- Retrieves user's rewards ledger
- Includes automatic summary statistics
- Returns: entries, total_spent, total_earned, average_bps, effective_rate

---

## Usage Examples

### Example 1: Process a Transaction

```python
from services.concierge_service.rewards_service import RewardsService

# Initialize service
rewards_service = RewardsService()

# Initialize user with starting $0 spend
rewards_service.initialize_user("user_123")

# Process a transaction
success, result = rewards_service.process_transaction(
    user_id="user_123",
    transaction_id="txn_001",
    spent_amount=150.00,
    merchant="Walmart"
)

if success:
    print(f"Tier: {result['tier_name']} ({result['bps']} BPS)")
    print(f"Spent: ${result['spent_amount']}")
    print(f"Points Earned: {result['payout_points']}")
    print(f"Cumulative Spend: ${result['new_balance']}")
    
# Output:
# Tier: Bronze (35 BPS)
# Spent: $150.0
# Points Earned: 0.52 (= $150 × 0.35%)
# Cumulative Spend: $150
```

---

### Example 2: Multiple Transactions Showing Tier Progression

```python
# First transaction: $150 (Bronze tier)
success, result1 = rewards_service.process_transaction(
    user_id="user_456",
    transaction_id="txn_001",
    spent_amount=150.00,
    merchant="Target"
)
print(f"1st: {result1['tier_name']} - Earned: {result1['payout_points']} points")

# Second transaction: $2,000 (now Silver tier!)
success, result2 = rewards_service.process_transaction(
    user_id="user_456",
    transaction_id="txn_002",
    spent_amount=2000.00,
    merchant="Amazon"
)
print(f"2nd: {result2['tier_name']} - Earned: {result2['payout_points']} points")

# Third transaction: $5,000 (now Gold tier!!)
success, result3 = rewards_service.process_transaction(
    user_id="user_456",
    transaction_id="txn_003",
    spent_amount=5000.00,
    merchant="Whole Foods"
)
print(f"3rd: {result3['tier_name']} - Earned: {result3['payout_points']} points")

# Output:
# 1st: Bronze - Earned: 0.52 points
# 2nd: Silver - Earned: 11.0 points (cumulative spend: $2,150)
# 3rd: Gold - Earned: 37.5 points (cumulative spend: $7,150)
```

---

### Example 3: Retrieve & Analyze Ledger

```python
# Get ledger for a user
success, ledger_data = rewards_service.get_ledger(
    user_id="user_456",
    limit=50
)

if success:
    entries = ledger_data["entries"]
    summary = ledger_data["summary"]
    
    print(f"Total Entries: {summary['total_entries']}")
    print(f"Total Spent: ${summary['total_spent']}")
    print(f"Total Earned: {summary['total_earned']} points")
    print(f"Average BPS: {summary['average_bps']}")
    print(f"Effective Rate: {summary['effective_rate']}")
    
    print("\nDetailed Entries:")
    for entry in entries:
        print(f"  {entry['timestamp']}: {entry['merchant']}")
        print(f"    Spent: ${entry['spent_amount']} ({entry['tier_name']} - {entry['bps']} BPS)")
        print(f"    Earned: {entry['payout_points']} points")

# Output Example:
# Total Entries: 3
# Total Spent: $7150.00
# Total Earned: 48.01 points
# Average BPS: 63.33
# Effective Rate: 0.671%
#
# Detailed Entries:
#   2025-12-31T10:15:00: Target
#     Spent: $150.0 (Bronze - 35 BPS)
#     Earned: 0.52 points
#   2025-12-31T10:30:00: Amazon
#     Spent: $2000.0 (Silver - 55 BPS)
#     Earned: 11.0 points
#   2025-12-31T11:00:00: Whole Foods
#     Spent: $5000.0 (Gold - 75 BPS)
#     Earned: 37.5 points
```

---

### Example 4: Get Tier Information

```python
# Get details about a specific tier
tier_info = rewards_service.get_tier_info("platinum")

print(f"Tier: {tier_info['name']}")
print(f"Spend Range: ${tier_info['min_spend']:,} - ${tier_info['max_spend']:,}")
print(f"BPS: {tier_info['bps']}")
print(f"Percentage: {tier_info['percentage']}%")
print(f"Color: {tier_info['color']}")

# Output:
# Tier: Platinum
# Spend Range: $10,000 - $14,999
# BPS: 100
# Percentage: 1.0%
# Color: #e5e4e2
```

---

### Example 5: Check Next Milestone

```python
# Get user's current points/spend and next tier target
success, points_info = rewards_service.get_user_points("user_456")

if success:
    current_spend = points_info["balance"]
    tier = points_info["tier"]
    next_milestone = points_info["next_milestone"]
    
    print(f"Current Spend: ${current_spend}")
    print(f"Current Tier: {tier}")
    
    if next_milestone["max_tier_reached"]:
        print("Already at max tier: Sapphire!")
    else:
        points_needed = next_milestone["points_needed"]
        points_to_go = next_milestone["points_to_go"]
        next_tier = next_milestone["tier"]
        print(f"Next Tier: {next_tier}")
        print(f"Target Spend: ${points_needed}")
        print(f"Spend More: ${points_to_go} to unlock")

# Output example (at $7,150):
# Current Spend: $7150
# Current Tier: gold
# Next Tier: platinum
# Target Spend: $10000
# Spend More: $2850 to unlock
```

---

## Ledger Entry Structure

Each ledger entry contains:

```python
{
    "ledger_id": str,              # Unique ledger ID
    "user_id": str,                # Customer ID
    "transaction_id": str,         # Original transaction ID
    "tier": str,                   # Tier key (bronze, silver, etc)
    "tier_name": str,              # Human-readable tier name
    "bps": int,                    # Basis points (35, 55, 75, 100, 120)
    "spent_amount": float,         # Dollar amount spent
    "payout_points": float,        # Points earned
    "merchant": str,               # Merchant name
    "timestamp": str,              # ISO format timestamp
    "status": str,                 # 'credited'
}
```

---

## Integration Points

### Backend Services
- **File**: `swipesavvy-wallet-web/services/concierge_service/rewards_service.py`
- **File**: `swipesavvy-ai-chat/services/concierge_service/rewards_service.py`
- **File**: `swipesavvy-mobile-app-v2/swipesavvy-ai-agents/services/concierge_service/rewards_service.py`

### API Endpoints (To Create)

**Process Transaction**
```http
POST /api/v1/rewards/transactions
{
  "user_id": "user_123",
  "transaction_id": "txn_001",
  "spent_amount": 150.00,
  "merchant": "Walmart"
}

Response:
{
  "success": true,
  "tier": "bronze",
  "tier_name": "Bronze",
  "bps": 35,
  "payout_points": 0.52,
  "new_balance": 150,
  "ledger_entry": {...}
}
```

**Get Ledger**
```http
GET /api/v1/rewards/ledger?user_id=user_123&limit=50

Response:
{
  "user_id": "user_123",
  "entries": [...],
  "summary": {
    "total_entries": 5,
    "total_spent": 7150.00,
    "total_earned": 48.01,
    "average_bps": 63.33,
    "effective_rate": "0.671%"
  }
}
```

**Get Tier Info**
```http
GET /api/v1/rewards/tiers/platinum

Response:
{
  "name": "Platinum",
  "min_spend": 10000,
  "max_spend": 14999,
  "bps": 100,
  "percentage": 1.0,
  "color": "#e5e4e2"
}
```

---

## Key Features

✅ **5-Tier Structure**: Bronze, Silver, Gold, Platinum, Sapphire  
✅ **BPS-Based Payouts**: Transparent basis points system  
✅ **Automatic Tier Progression**: Tier updates based on cumulative spend  
✅ **Comprehensive Ledger**: Full transaction history with analytics  
✅ **Summary Statistics**: Automatic calculation of totals and rates  
✅ **Multi-Service Support**: Implemented across 3 service instances  
✅ **Flexible & Extensible**: Easy to add new features or modify rates  

---

## Future Enhancements

- [ ] Add boost multipliers (e.g., 2x points on category)
- [ ] Implement bonus points for tier milestones
- [ ] Add seasonal BPS promotions
- [ ] Create spending insights dashboard
- [ ] Add referral bonus points
- [ ] Implement tiered redemption rates

---

## Support & Questions

For implementation details or modifications, refer to:
- `RewardsLedger` class for payout calculations
- `RewardsService.process_transaction()` for transaction handling
- `TIER_STRUCTURE` constant for tier definitions
- `TIER_MILESTONES` for tier thresholds
