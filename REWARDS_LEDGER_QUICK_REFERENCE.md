# Rewards Ledger - Quick Reference

## 5-Tier BPS Payout Structure

### Tier Breakdown
```
TIER        QUALIFICATION    BPS   RATE      EXAMPLE
Bronze      $0 - $1,999      35    0.35%     $100 spent = $0.35 earned
Silver      $2,000 - $4,999  55    0.55%     $100 spent = $0.55 earned
Gold        $5,000 - $9,999  75    0.75%     $100 spent = $0.75 earned
Platinum    $10,000 - $14,999 100  1.0%      $100 spent = $1.00 earned
Sapphire    $15,000+         120  1.2%      $100 spent = $1.20 earned
```

## Core Methods

### Process a Transaction
```python
success, result = rewards_service.process_transaction(
    user_id="user_123",
    transaction_id="txn_001",
    spent_amount=500.00,
    merchant="Target"
)

# Returns:
# {
#   "success": True,
#   "tier": "silver",
#   "tier_name": "Silver",
#   "bps": 55,
#   "payout_points": 2.75,  # $500 × 0.55%
#   "new_balance": 2500,    # Cumulative spend
#   "ledger_entry": {...}
# }
```

### Get User Ledger
```python
success, ledger = rewards_service.get_ledger(
    user_id="user_123",
    limit=50
)

# Returns:
# {
#   "user_id": "user_123",
#   "entries": [
#     {
#       "ledger_id": "...",
#       "spent_amount": 500.00,
#       "payout_points": 2.75,
#       "tier": "silver",
#       "merchant": "Target",
#       "timestamp": "2025-12-31T10:00:00",
#       ...
#     },
#     ...
#   ],
#   "summary": {
#     "total_spent": 5000.00,
#     "total_earned": 35.75,
#     "average_bps": 71.5,
#     "effective_rate": "0.715%"
#   }
# }
```

### Get Tier Info
```python
tier_info = rewards_service.get_tier_info("platinum")

# Returns:
# {
#   "name": "Platinum",
#   "min_spend": 10000,
#   "max_spend": 14999,
#   "bps": 100,
#   "percentage": 1.0,
#   "color": "#e5e4e2"
# }
```

### Calculate Payout
```python
points = rewards_service.calculate_tier_payout(
    spent_amount=100.00,
    tier_key="gold"
)
# Returns: 0.75 points ($100 × 0.75%)
```

## BPS Formula

$$\text{Points Earned} = \text{Spent Amount} \times \frac{\text{BPS}}{10000}$$

### Examples

| Amount | Tier | BPS | Calculation | Points |
|--------|------|-----|-------------|--------|
| $100 | Bronze | 35 | 100 × 0.0035 | 0.35 |
| $100 | Silver | 55 | 100 × 0.0055 | 0.55 |
| $500 | Gold | 75 | 500 × 0.0075 | 3.75 |
| $1000 | Platinum | 100 | 1000 × 0.01 | 10.00 |
| $10000 | Sapphire | 120 | 10000 × 0.012 | 120.00 |

## Tier Milestones

Customers progress through tiers based on **cumulative spending**:

- **Bronze**: $0 - $1,999
- **Silver**: $2,000+ (0.20 BPS increase)
- **Gold**: $5,000+ (0.20 BPS increase)
- **Platinum**: $10,000+ (0.25 BPS increase)
- **Sapphire**: $15,000+ (0.20 BPS increase)

## Implementation Files

```
swipesavvy-wallet-web/services/concierge_service/rewards_service.py
swipesavvy-ai-chat/services/concierge_service/rewards_service.py
swipesavvy-mobile-app-v2/swipesavvy-ai-agents/services/concierge_service/rewards_service.py
```

## Classes

### RewardsLedger
- `calculate_payout(spent_amount, tier_key)` → float
- `create_ledger_entry(user_id, transaction_id, spent_amount, tier_key, merchant)` → Dict
- `get_ledger(user_id, limit)` → List[Dict]

### RewardsService
- `process_transaction(user_id, transaction_id, spent_amount, merchant)` → Tuple[bool, Dict]
- `get_ledger(user_id, limit)` → Tuple[bool, Dict]
- `get_tier_info(tier_key)` → Dict
- `calculate_tier_payout(spent_amount, tier_key)` → float
- `_get_tier(points)` → str (based on cumulative spend)
- `get_user_points(user_id)` → Tuple[bool, Dict] (with tier & next milestone)

## Key Features

✅ Automatic tier progression based on cumulative spending  
✅ BPS-based transparent payout calculation  
✅ Complete ledger history with merchant tracking  
✅ Summary statistics (total spent, earned, average BPS, effective rate)  
✅ Next tier milestone tracking  
✅ UUID-based ledger entry tracking  

## Testing Scenario

```python
# Initialize service and user
rewards_service = RewardsService()
rewards_service.initialize_user("demo_user")

# Spend progression example
txns = [
    ("txn_1", 500.00, "Walmart", "bronze"),      # 35 BPS
    ("txn_2", 1500.00, "Target", "bronze"),      # 35 BPS
    ("txn_3", 1500.00, "Amazon", "silver"),      # 55 BPS (total: $3,500)
    ("txn_4", 3000.00, "Whole Foods", "gold"),   # 75 BPS (total: $6,500)
    ("txn_5", 5000.00, "Costco", "platinum"),    # 100 BPS (total: $11,500)
]

for txn_id, amount, merchant, expected_tier in txns:
    success, result = rewards_service.process_transaction(
        user_id="demo_user",
        transaction_id=txn_id,
        spent_amount=amount,
        merchant=merchant
    )
    assert result["tier"] == expected_tier
    print(f"✓ {merchant}: {amount} → {result['payout_points']} pts ({expected_tier})")
```

Expected Output:
```
✓ Walmart: 500.0 → 1.75 pts (bronze)
✓ Target: 1500.0 → 5.25 pts (bronze)
✓ Amazon: 1500.0 → 8.25 pts (silver)
✓ Whole Foods: 3000.0 → 22.5 pts (gold)
✓ Costco: 5000.0 → 50.0 pts (platinum)
```

---

**Full Documentation**: See `REWARDS_LEDGER_IMPLEMENTATION.md`
