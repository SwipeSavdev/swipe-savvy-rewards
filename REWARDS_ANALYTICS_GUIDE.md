# Rewards Program Analytics Dashboard

## Overview
Enhanced dashboard with comprehensive rewards program analytics and margin risk management. Monitors customer tiers, rewards cost impact, and profitability warnings.

## New Widgets

### 1. Customers by Rewards Tier (Pie Chart)
**ID:** `customers-by-tier`  
**Type:** Pie Chart  
**Data Points:**
- **Bronze Tier:** 45,230 customers (blue - #a3622d)
- **Silver Tier:** 28,450 customers (silver - #c0c0c0)
- **Gold Tier:** 15,680 customers (gold - #ffd700)
- **Platinum Tier:** 8,920 customers (white/silver - #e5e4e2)

**Purpose:** Visualizes customer distribution across rewards tiers to understand program engagement and high-value customer concentration.

**Key Insights:**
- 45% of customers are in Bronze tier (retention focus)
- 29% in Silver tier (moderate engagement)
- 16% in Gold tier (high value)
- 9% in Platinum tier (VIP customers)

---

### 2. Rewards Cost vs Margin Risk (MarginRiskCard)
**ID:** `rewards-cost-analysis`  
**Type:** Custom Risk Assessment Card  

#### Key Metrics:
- **Gross Margin:** 1.55% (baseline)
- **Current Rewards Cost:** 38.5% of revenue
- **Safe Threshold:** 45% of revenue
- **Margin Remaining:** 6.5%

#### Risk Levels:
| Status | Threshold | Color | Risk |
|--------|-----------|-------|------|
| HEALTHY | < 35% | 🟢 Green | Low - Safe operations |
| WARNING | 35-44% | 🟡 Amber | Approaching threshold |
| AT RISK | ≥ 45% | 🔴 Red | **CRITICAL - Margin erosion** |

#### Why This Matters:
With only **1.55% gross margin**, if rewards costs exceed **45% of revenue**:
- You lose money on rewards spending
- Each additional customer acquisition becomes unprofitable
- Existing customer benefits erode margins
- Break-even point approaches dangerously

**Formula:**
```
Safe Margin = (Gross Margin %) - (Rewards Cost % - Safe Threshold %)
Example: 1.55% - (45% - 38.5%) = -40.95% → AT RISK
```

#### Real-World Impact:
If 1M customers generate $100M revenue:
- Gross profit: $1.55M
- Rewards at 38.5%: $38.5M cost
- Rewards at 45%+: Program unprofitable

---

### 3. Rewards Points Utilization (Line Chart)
**ID:** `rewards-points-utilization`  
**Type:** Line Chart  
**Data:** Daily points redeemed (last 30 days)  

**Purpose:** Tracks redemption velocity and spending patterns across the rewards program.

**Key Metrics:**
- Daily redemption volume: 200K - 1M points
- Trend analysis: Identify peak redemption periods
- Anomaly detection: Unusual redemption spikes

**Insights:**
- Monitor if redemptions correlate with marketing campaigns
- Identify seasonal patterns (holidays, weekends)
- Detect fraudulent or suspicious redemption activity

---

## Updated Key Statistics

The dashboard now displays 6 key metrics instead of 4:

| Metric | Type | Purpose |
|--------|------|---------|
| **Fraud Cases** | Count | Security tracking |
| **Transactions** | Count | Volume metrics |
| **Risk Level** | Status | Overall platform risk |
| **Risk Score** | Numeric | Quantified risk |
| **Rewards Cost** | Percentage | Program cost impact |
| **Customers** | Count | Program participation |

All metrics include trend indicators (↑↓) showing growth/decline.

---

## MarginRiskCard Component

### Features:
1. **Color-Coded Status:**
   - 🟢 Green: Safe (< 35% cost)
   - 🟡 Yellow: Warning (35-44% cost)
   - 🔴 Red: At Risk (≥ 45% cost)

2. **Key Metrics Display:**
   - Gross margin percentage
   - Current rewards cost percentage
   - Remaining margin buffer

3. **Visual Progress Bar:**
   - Shows progression to safe threshold
   - Updates in real-time
   - Visual warning at critical levels

4. **Risk Assessment:**
   - Clear status message
   - Actionable warnings
   - Business context explanation

### Props:
```typescript
interface MarginRiskCardProps {
  rewardsCostPct: number      // Current rewards cost as % of revenue
  grossMarginPct?: number     // Gross margin (default: 1.55%)
  thresholdPct?: number       // Safety threshold (default: 45%)
}
```

### Example Usage:
```tsx
<MarginRiskCard 
  rewardsCostPct={38.5} 
  grossMarginPct={1.55}
  thresholdPct={45}
/>
```

---

## Data Structure

### Mock Data Format:
```typescript
{
  stats: {
    totalFraudCases: { value: 726, trendPct: 12.5, trendDirection: 'up' },
    totalTransactions: { value: 156240, trendPct: 8.2, trendDirection: 'up' },
    riskLevel: { value: 'Medium', trendPct: -2.1, trendDirection: 'down' },
    avgRiskScore: { value: 34, trendPct: 5.3, trendDirection: 'up' },
    rewardsCostPct: { value: 38.5, trendPct: 2.3, trendDirection: 'up' },
    customersInProgram: { value: 98280, trendPct: 6.8, trendDirection: 'up' }
  },
  customersByTier: [
    { label: 'Bronze', value: 45230, color: '#a3622d' },
    { label: 'Silver', value: 28450, color: '#c0c0c0' },
    { label: 'Gold', value: 15680, color: '#ffd700' },
    { label: 'Platinum', value: 8920, color: '#e5e4e2' }
  ],
  rewardsCostAnalysis: [
    { label: 'Gross Margin\n(1.55%)', value: 1.55 },
    { label: 'Rewards Cost\n(38.5%)', value: 38.5 },
    { label: 'Safe Threshold\n(45%)', value: 45 }
  ],
  rewardsPointsUtilization: [
    { label: 'Day 1', value: 487234 },
    { label: 'Day 2', value: 523156 },
    // ... 28 more days
  ]
}
```

---

## API Integration

### Ready for Connection:
Replace mock data with actual API endpoints:

```typescript
// Example API calls to implement
const getRewardsData = async () => {
  const [
    tierData,
    costData,
    pointsData,
    statsData
  ] = await Promise.all([
    Api.rewards.getCustomersByTier(),
    Api.rewards.getCostAnalysis(),
    Api.rewards.getPointsUtilization(30),
    Api.rewards.getStats()
  ])
  
  return {
    customersByTier: tierData,
    rewardsCostAnalysis: costData,
    rewardsPointsUtilization: pointsData,
    stats: statsData
  }
}
```

### Recommended Endpoints:
1. `GET /api/rewards/customers/by-tier` - Customer tier distribution
2. `GET /api/rewards/cost-analysis?period=30` - Cost metrics
3. `GET /api/rewards/points/utilization?days=30` - Redemption data
4. `GET /api/rewards/stats` - Summary statistics

---

## Widget Configuration

### Enabling/Disabling Widgets:
Click the **Settings** button in the dashboard header to toggle widgets:

- ✅ Fraud Cases Trend
- ✅ Risk Level Distribution
- ✅ Fraud Cases by Type
- ✅ Transaction Volume
- ✅ High Risk Merchants
- ✅ Daily Security Alerts
- ✅ **Customers by Rewards Tier** (NEW)
- ✅ **Rewards Cost vs Margin Risk** (NEW)
- ✅ **Rewards Points Utilization** (NEW)

### Default Configuration:
All 9 widgets are enabled by default. Customize your view by disabling less relevant widgets.

---

## Business Rules & Alerts

### Margin Risk Warnings:

**🟢 GREEN (Healthy)**
- Rewards cost: < 35% of revenue
- Status: Sustainable
- Action: Maintain current strategy

**🟡 AMBER (Warning)**
- Rewards cost: 35-44% of revenue
- Status: Approaching threshold
- Action: Monitor closely, reduce cost or increase revenue

**🔴 RED (Critical)**
- Rewards cost: ≥ 45% of revenue
- Status: **MARGIN EROSION**
- Action: Immediate intervention required

### Intervention Strategies:
1. **Increase Revenue:**
   - Raise merchant commission rates
   - Expand merchant base
   - Increase transaction volume

2. **Reduce Costs:**
   - Adjust tier benefits
   - Increase point value requirements
   - Implement spending caps

3. **Rebalance Program:**
   - Adjust tier thresholds
   - Change redemption rates
   - Modify earning rates

---

## Metrics Definitions

### Gross Margin (1.55%)
The profit remaining after direct costs (transaction processing, fraud, settlements).

### Rewards Cost (%)
Total cost of customer rewards as a percentage of platform revenue.

### Safe Threshold (45%)
Maximum rewards cost that maintains profitability given 1.55% gross margin.

### Customers by Tier
Segmentation of active customers across Bronze, Silver, Gold, Platinum tiers.

### Points Utilization
Daily volume of rewards points redeemed by customers.

---

## Data Refresh

### Current: Mock Data
Widgets display simulated data for testing and development.

### Implementation Steps:
1. Add API client methods in `/src/services/api.ts`
2. Create rewards API module
3. Update `DashboardPageNew.tsx` to call actual endpoints
4. Implement error handling and loading states
5. Add data caching for performance

### Recommended Refresh Intervals:
- **Tier Distribution:** Every 6 hours
- **Cost Metrics:** Daily
- **Points Utilization:** Hourly (real-time recommended)
- **Stats:** Every 30 minutes

---

## Files Modified

- ✅ `src/pages/DashboardPageNew.tsx` - Added 3 new widgets and stats
- ✅ `src/components/cards/MarginRiskCard.tsx` - New risk assessment component
- ✅ `src/components/ui/StatCard.tsx` - Added suffix prop for units
- ✅ Mock data generator - Expanded with rewards data structures

---

## Next Steps

### Phase 1: Basic Integration (Week 1)
- Connect to rewards API endpoints
- Replace mock data with real data
- Validate data accuracy

### Phase 2: Advanced Features (Week 2)
- Add date range filters
- Implement data export (CSV/PDF)
- Add customizable thresholds

### Phase 3: Real-time Updates (Week 3)
- WebSocket integration for live updates
- Real-time alerts when threshold approached
- Email/Slack notifications

### Phase 4: Predictive Analytics (Week 4)
- Trend forecasting
- Anomaly detection
- Automated recommendations

---

## Support

For questions about rewards analytics or integration, refer to:
- API Documentation: `COMPLETE_API_REFERENCE_v1_2_0.md`
- Dashboard Guide: `DASHBOARD_CUSTOMIZATION_GUIDE.md`
- AI Support: Use the AI Concierge in the sidebar
