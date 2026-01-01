# AI Marketing Analytics Specification
## SwipeSavvy Platform — CMO-Grade Analytics Dashboard

**Version:** 1.0  
**Status:** Design Phase  
**Last Updated:** December 31, 2025  
**Audience:** Executive Leadership, Product, Engineering, Data Science

---

## PART 1: EXECUTIVE SUMMARY

### Overview
SwipeSavvy's AI Marketing Analytics system provides comprehensive visibility into campaign performance, user segmentation, engagement patterns, and revenue impact. Built on real-time data from backend AI marketing engine and mobile/web user behavior, this analytics platform enables:

- **Incrementality Testing:** Measure true campaign impact vs. baseline behavior
- **Audience Intelligence:** Behavioral pattern detection (8 persona types across 90-day window)
- **Campaign Optimization:** AI-driven recommendations for copy, targeting, budget allocation
- **ROI Tracking:** Multi-touch attribution, customer lifetime value alignment
- **Compliance Reporting:** Audit trails, consent management, regulatory adherence

### Strategic Context

**Business Problem:**
Without visibility into campaign performance and user segmentation, SwipeSavvy cannot:
- Prove marketing ROI to investors (Series A requirement)
- Optimize budget allocation across 8 campaign types
- Identify high-value user cohorts for retention
- Demonstrate incrementality vs. organic engagement

**Success Definition:**
Analytics system is successful when leadership can answer:
1. **"What was the true incremental impact of our campaign?"** (vs. what would users have done without it?)
2. **"Which user segments are most valuable and how do we reach them?"** (LTV, CAC, margin)
3. **"Where should we spend next $100k to maximize ROI?"** (Budget reallocation engine)
4. **"Are we compliant with regulations and customer consent?"** (Audit ready)
5. **"What's our projected marketing efficiency for Series A roadshow?"** (Leadership KPIs)

### Key Metrics (Executive Dashboard)

| Metric | Target | Owner | Cadence |
|--------|--------|-------|---------|
| **Campaign ROAS** | 3.5x+ | Perf Lead | Daily |
| **Incrementality Rate** | 40%+ | CMO | Weekly |
| **Avg Customer LTV** | $450+ | Rewards PM | Monthly |
| **Campaign CAC** | <$15 | CMO | Weekly |
| **Engagement Rate** | 25%+ (open) | Lifecycle Lead | Daily |
| **Segment Precision** | 80%+ | Data Science | Weekly |
| **System Uptime** | 99.5%+ | Engineering | Continuous |

### Expected Impact (90-Day Horizon)

| Phase | Deliverable | Business Impact |
|-------|-------------|-----------------|
| **30 Days (MVP)** | KPI Dashboard, Core Metrics, Basic Segments | Enable leadership reporting; seed incrementality data |
| **60 Days** | Funnel Analysis, Creative Insights, ROI Deep Dives | Enable budget reallocation; identify top performers |
| **90 Days** | Incrementality Engine, ML Segments, Action Center | Full optimization loop; Series A ready |

---

## PART 2: STAKEHOLDER PERSONAS

### 1. Chief Marketing Officer (CMO)
**Goal:** Prove marketing ROI to board/investors; allocate budget efficiently  
**Frustration:** No visibility into true campaign impact; can't answer "did our campaigns drive growth?"  
**Metrics They Care About:**
- Campaign ROAS (Return on Ad Spend)
- Incrementality % (true lift vs. baseline)
- CAC (Customer Acquisition Cost)
- Budget utilization & forecasts
- Month-over-month growth trends
- Competitive benchmarks

**Dashboard Needs:**
- Executive dashboard (1 page, 5 KPIs)
- Campaign performance leaderboard (ranked by ROAS, incrementality, volume)
- Budget allocation simulator (what if analysis)
- Cohort performance (by campaign type, region, user segment)
- Trend alerts (warn when ROAS drops below threshold)

**Action**: Export for board meetings, drill into underperforming campaigns

---

### 2. Performance Marketing Lead
**Goal:** Optimize campaigns in real-time; maximize ROAS  
**Frustration:** Can't diagnose why a campaign underperforms; lacks tactical data  
**Metrics They Care About:**
- CTR (Click-Through Rate) by campaign, creative, segment
- Conversion rate (browse → purchase)
- Cost per conversion
- Audience size (how many users matched the segment?)
- Impression volume & frequency
- Time to first conversion (speed)

**Dashboard Needs:**
- Real-time campaign card (live metrics, alerts)
- Creative performance breakdown (which headline/copy resonates?)
- Segment effectiveness (which behavioral patterns convert best?)
- A/B test interface (configure test, track results)
- Pause/activate controls (reduce ROAS threshold to auto-pause)
- Competitor view (how does our CTR compare to industry benchmark?)

**Action**: Pause underperforming campaigns, reallocate budget to winners, request copy variation test

---

### 3. Lifecycle/CRM Lead
**Goal:** Maximize customer retention; optimize re-engagement campaigns  
**Frustration:** Can't identify inactive users or predict churn; sends generic re-engagement  
**Metrics They Care About:**
- Churn rate (inactive users detected)
- Re-engagement rate (from inactive cohort)
- LTV by cohort (signup date, acquisition channel)
- Email/push open rates
- Campaign frequency (how often user sees offers)
- Win-back ROI (cost to re-engage vs. lifetime value recovered)

**Dashboard Needs:**
- Cohort analysis (slice users by signup date, acquisition, value tier)
- Churn risk model (predict which users will go inactive in 30 days)
- Lifecycle stage visualization (new → active → at-risk → inactive)
- Re-engagement campaign results (A/B tests on win-back)
- Frequency capping (ensure users aren't overloaded with campaigns)
- Win-back ROI tracker (cost of re-engagement vs. recovered revenue)

**Action**: Create re-engagement segment for at-risk users, test new creative, adjust frequency

---

### 4. Rewards Product Manager
**Goal:** Grow rewards adoption; track economics (reward cost vs. incremental revenue)  
**Frustration:** Can't isolate rewards impact; unsure if cashback ROI is positive  
**Metrics They Care About:**
- Rewards adoption rate (% of users with active rewards)
- Rewards redemption rate (% of earned rewards redeemed)
- Incremental spend per reward user (incremental revenue minus reward cost)
- Rewards margin (gross margin after reward payout)
- Cohort economics (LTV with vs. without rewards)
- Seasonal patterns (rewards performance by season, holiday)

**Dashboard Needs:**
- Rewards cohort analysis (vs. non-reward users, same signup period)
- Economics dashboard (reward cost, incremental spend, net margin)
- Redemption funnel (earned → viewed → redeemed)
- Seasonal heatmap (when do users engage most?)
- Segment rewards performance (do HIGH_SPENDERS value rewards differently?)
- Payout trend (is rewards budget on track?)

**Action**: A/B test higher reward amounts, expand to seasonal campaigns, adjust payout tiers

---

### 5. Data Science / ML Owner
**Goal:** Build models for incrementality, segmentation, optimization  
**Frustration:** Data quality issues, misaligned definition of conversion, siloed data sources  
**Metrics They Care About:**
- Data freshness (lag time from event to analytics)
- Data completeness (% of users with full attribution trail)
- Model accuracy (incrementality model AUC, segment precision)
- Holdout group size & health (for incrementality testing)
- Feature importance (which attributes drive conversion?)
- Model drift detection (is model still valid?)

**Dashboard Needs:**
- Data quality monitor (freshness, completeness, schema validation)
- Model performance tracker (incrementality AUC, segment precision, lift)
- Feature importance dashboard (which user attributes matter most?)
- Holdout group dashboard (ensure size and balance)
- Model retraining schedule & logs
- Anomaly detection (unusual patterns in data)
- Experiment results portal (past A/B tests, statistical significance)

**Action**: Retrain incrementality model, investigate data quality spike, launch new segmentation model

---

### 6. Compliance / Risk Officer
**Goal:** Ensure regulatory compliance, manage consent, audit campaigns  
**Frustration:** Can't prove user consent for campaigns; audit trail is opaque  
**Metrics They Care About:**
- Consent rates (% of users who opted in to marketing)
- Unsubscribe rates (track by campaign, reason if available)
- GDPR/privacy violations (campaigns sent to opted-out users)
- Campaign audit trail (who created, when, what targeting used)
- Data access logs (who queried user data, when, why)
- Regulation alignment (GDPR, CCPA, state-level consent laws)

**Dashboard Needs:**
- Consent status dashboard (% opted-in by channel, region)
- Campaign audit log (immutable record of campaign config, targeting, budget)
- Unsubscribe trend (track by campaign, geography, reason)
- Privacy audit interface (query: "Show me all campaigns targeting <demographic>")
- Data access logs (immutable record of analytics queries)
- Compliance checklist (GDPR, CCPA, CASL, etc.)
- Sensitive data masking (hide PII in shared reports)

**Action**: Approve campaign targeting, review audit logs pre-launch, export compliance report

---

## PART 2 SUMMARY

Each persona brings distinct metrics, workflows, and actions. The analytics platform must serve all six simultaneously without being overwhelming. 

**Design Principle:** Dashboard is modular—each persona sees their relevant cards/sections first, but can drill deeper as needed.

---

---

# PART 3: DASHBOARD WIREFRAME & MODULE SPECIFICATIONS

---

## Layout Overview

### Dashboard Grid Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS DASHBOARD                          │
│  [Nav] Campaigns | Segments | Funnel | Insights | Compliance   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. EXECUTIVE KPI CARDS (Sticky Top)                    │   │
│  │ [ROAS] [Incrementality] [CAC] [LTV] [Engagement Rate]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────┬──────────────────────────┐   │
│  │ 2. CAMPAIGN LEADERBOARD      │ 3. SEGMENT PICKER       │   │
│  │ (Live | Past 7d | Past 30d)  │ (Filter by pattern)     │   │
│  │ Ranked: ROAS, Vol, Incrementality │ HIGH_SPENDER, etc. │   │
│  └──────────────────────────────┴──────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────┬──────────────────────────┐   │
│  │ 4. CAMPAIGN DETAIL (Selected) │ 5. CREATIVE BREAKDOWN  │   │
│  │ Real-time: Impressions, CTR,  │ Headline/Copy/CTA      │   │
│  │ Conversions, Revenue          │ Performance Ranking    │   │
│  └──────────────────────────────┴──────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────┬──────────────────────────┐   │
│  │ 6. CONVERSION FUNNEL          │ 7. ENGAGEMENT HEATMAP  │   │
│  │ View → Click → Browse → Buy   │ By Time/Day/Segment    │   │
│  │ Conversion rates at each step │ Identifies peak times   │   │
│  └──────────────────────────────┴──────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 8. ROI DEEP DIVE                                        │   │
│  │ Campaign Cost vs. Revenue / Incrementality vs. Organic  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────┬──────────────────────────┐   │
│  │ 9. SYSTEM HEALTH             │ 10. ACTION CENTER       │   │
│  │ Data Freshness, Model Perf    │ AI Recommendations      │   │
│  │ Uptime, Queue Depth          │ (Pause/Adjust/Test)    │   │
│  └──────────────────────────────┴──────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 11. COMPLIANCE AUDIT LOG                                │   │
│  │ Campaign creation, targeting changes, approvals         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Specifications (11 Modules)

### MODULE 1: EXECUTIVE KPI CARDS (Top, Sticky)

**Purpose:** CMO/Leadership glance view. One number per card, trend arrow, target threshold.

**Cards (5 Primary):**

| KPI | Display | Target | Action |
|-----|---------|--------|--------|
| **Campaign ROAS** | 3.2x ↑ 5% | 3.5x+ | Drill into campaigns with ROAS <2.5x |
| **Incrementality %** | 38% ↓ 2% | 40%+ | Review holdout group health |
| **Avg CAC** | $14.20 ↓ 8% | <$15 | Praise perf team; investigate high-cost segments |
| **Customer LTV** | $485 ↑ 3% | $450+ | Segment analysis; identify top 20% value drivers |
| **Engagement Rate** | 26% ↑ 1% | 25%+ | Time period selector (7d/30d/90d) |

**Interactions:**
- Click card → Drill into module (e.g., ROAS → Campaign Leaderboard)
- Hover → Show calculation formula + data freshness timestamp
- Threshold alert → Red background if below target for 3+ days
- Time period buttons: 7d, 30d, 90d, YTD

**Refresh:** Real-time (every 30 seconds for live campaigns)

---

### MODULE 2: CAMPAIGN LEADERBOARD

**Purpose:** Perf Lead identifies winners/losers; benchmark campaigns.

**Layout:** Table, sortable by any column

| Rank | Campaign Name | Type | Status | ROAS | CTR | Conversions | Revenue | CAC | Incrementality | Budget Used | Actions |
|------|---------------|------|--------|------|-----|-------------|---------|-----|-----------------|-------------|---------|
| 1 | Summer Spending Spree | DISCOUNT | Active | 4.2x | 3.8% | 1,284 | $18,450 | $11.20 | 48% | $14,500 / $20k | ⋮ |
| 2 | Weekend Shopper Cashback | CASHBACK | Active | 3.9x | 3.2% | 956 | $14,320 | $12.80 | 44% | $12,200 / $15k | ⋮ |
| 3 | New User Welcome | DISCOUNT | Active | 3.1x | 2.1% | 542 | $7,840 | $13.50 | 35% | $7,340 / $10k | ⋮ |

**Row Actions (⋮ menu):**
- View details (modal with all metrics)
- Pause campaign
- Adjust budget
- Request copy variation
- Download report
- View incrementality data

**Filters:**
- Status: Active, Paused, Completed, Scheduled
- Type: DISCOUNT, CASHBACK, LOYALTY, LOCATION_BASED, CATEGORY_PROMOTION, SPENDING_MILESTONE, RE_ENGAGEMENT, VIP
- Date range: Custom, Last 7 days, Last 30 days
- Segment: (ALL), HIGH_SPENDER, FREQUENT_SHOPPER, WEEKEND_SHOPPER, etc.

**Sort Options:** ROAS ↓, Volume ↑, CAC ↓, Incrementality ↓

---

### MODULE 3: SEGMENT PICKER & SUMMARY

**Purpose:** Lifecycle/Rewards PM filters campaigns/metrics by audience.

**Segment List (8 Patterns):**
```
HIGH_SPENDER (Top 20%)
  └─ 45,230 users | Avg Spend: $850 | LTV: $620
  └─ CTR on campaigns: 4.2% | Conversion: 18%
  
FREQUENT_SHOPPER (2+/week)
  └─ 78,450 users | Avg Spend: $380 | LTV: $420
  └─ CTR on campaigns: 3.1% | Conversion: 14%
  
WEEKEND_SHOPPER (70%+ on weekends)
  └─ 56,230 users | Avg Spend: $310 | LTV: $350
  └─ CTR on campaigns: 2.8% | Conversion: 12%
  
CATEGORY_FOCUSED (50%+ in 1 category)
  └─ 92,100 users | Avg Spend: $240 | LTV: $290
  └─ CTR on campaigns: 2.3% | Conversion: 9%
  
LOCATION_CLUSTERED (1-2 locations)
  └─ 34,560 users | Avg Spend: $420 | LTV: $510
  └─ CTR on campaigns: 3.5% | Conversion: 15%
  
NEW_SHOPPER (<30 days)
  └─ 12,890 users | Avg Spend: $180 | LTV: $280 (projected)
  └─ CTR on campaigns: 2.1% | Conversion: 8%
  
INACTIVE (>30 days no purchase)
  └─ 145,670 users | Avg Spend: $0 | LTV: $0 (churn risk)
  └─ Re-engagement CTR: 1.2% | Conversion: 3%
  
SEASONAL_SPENDER (3x+ variance)
  └─ 23,450 users | Avg Spend: $290 | LTV: $380
  └─ CTR on campaigns: 2.6% | Conversion: 11%
```

**Interactions:**
- Click segment → Highlight in all modules (leaderboard, funnel, etc.)
- Multi-select → Compare 2-3 segments side-by-side
- Refresh rates → Show when segment data was last updated

---

### MODULE 4: CAMPAIGN DETAIL (Selected)

**Purpose:** Perf Lead deep-dives into selected campaign.

**Content:**
```
SELECTED CAMPAIGN: "Summer Spending Spree" [DISCOUNT]
Created: July 1, 2025 | Updated: Dec 31, 2025
Status: [Active] [Pause] [End Campaign] | Budget: $20,000 | Spent: $14,500

REAL-TIME METRICS (Last 24 hours)
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Impressions  │ Clicks       │ CTR          │ Cost/Click   │
│ 384,230      │ 14,562       │ 3.8%         │ $0.99        │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Conversions  │ Conv Rate    │ Revenue      │ ROAS         │
│ 1,284        │ 8.8%         │ $18,450      │ 4.2x         │
└──────────────┴──────────────┴──────────────┴──────────────┘

SEGMENTS TARGETED
├─ HIGH_SPENDER: 45k users | CTR: 4.5% | Conv: 18%
├─ FREQUENT_SHOPPER: 78k users | CTR: 3.2% | Conv: 14%
└─ WEEKEND_SHOPPER: 56k users | CTR: 2.9% | Conv: 12%

PERFORMANCE OVER TIME (7-day graph)
[Line chart: Impressions, Clicks, Conversions, Revenue - stacked area]

HOURLY BREAKDOWN
[Heatmap: Time of day vs. performance metrics]
Peak hours: 7-9pm, 12-1pm (lunch break)

FREQUENCY DISTRIBUTION
[Bar chart: % of users seeing campaign 1x, 2x, 3x, 4x+]
Average frequency: 2.3x per user
```

**Actions:**
- [Pause Campaign] - immediate
- [Adjust Budget] - slider or input
- [Request Creative Variation] - test new copy
- [View Incrementality Data] - show graph
- [Download Report] - CSV/PDF

---

### MODULE 5: CREATIVE BREAKDOWN

**Purpose:** Perf Lead optimizes copy/imagery.

**Table: All creatives in campaign**

| Creative # | Headline | Body Snippet | CTA | Impressions | CTR | Conversions | Conv Rate | Revenue | ROAS | Notes |
|------------|----------|--------------|-----|-------------|-----|-------------|-----------|---------|------|-------|
| 1 | "50% Off Summer Sale" | "Shop now and save..." | "Shop Now" | 128,400 | 4.1% | 428 | 8.9% | $6,250 | 4.3x | 🔥 Best CTR |
| 2 | "Summer Spending Spree" | "Unlimited deals this weekend..." | "Join Now" | 115,650 | 3.5% | 380 | 8.4% | $5,840 | 4.0x | |
| 3 | "Exclusive Cashback Offer" | "Get paid to shop..." | "Activate" | 97,880 | 3.2% | 290 | 8.0% | $4,120 | 3.5x | Lower conv rate |
| 4 | "Weekend Flash Sale" | "Limited time. Limited stock..." | "Grab Deals" | 42,300 | 2.8% | 186 | 7.2% | $2,240 | 2.8x | ⚠️ Low ROAS |

**Actions per row:**
- Pause creative
- Boost (increase impression share)
- A/B test (clone + modify)
- View by segment (which segments respond best to this creative?)
- View incrementality (true lift for this creative)

**Bulk Actions:**
- Pause low-performers (ROAS < 3.0x)
- Boost top 2 creatives (+30% budget share)
- Create variation test (all creatives with new copy)

---

### MODULE 6: CONVERSION FUNNEL

**Purpose:** Lifecycle Lead identifies drop-off points.

**Funnel Chart:**
```
CONVERSION FUNNEL - Summer Spending Spree Campaign

┌─────────────────────────────────────────────────────┐
│ IMPRESSION (384,230 users)                          │
│ 100% baseline                                       │
└─────────────────────────────────────────────────────┘
                        ↓ 96.2% complete
┌─────────────────────────────────────────────────────┐
│ CLICK (14,562 users)                                │
│ 3.8% of impressions (CTR)                           │
│ [Adjust messaging if low - users not interested?]  │
└─────────────────────────────────────────────────────┘
                        ↓ 85.4% complete
┌─────────────────────────────────────────────────────┐
│ APP OPEN / LAND ON OFFER PAGE (12,435 users)       │
│ 85.4% of clicks                                     │
│ [Investigate if <80% - routing or UX issue?]       │
└─────────────────────────────────────────────────────┘
                        ↓ 78.2% complete
┌─────────────────────────────────────────────────────┐
│ ADD TO CART (9,711 users)                           │
│ 78.2% of page visits                                │
│ [Add-to-cart friction? Missing items?]              │
└─────────────────────────────────────────────────────┘
                        ↓ 13.2% complete
┌─────────────────────────────────────────────────────┐
│ PURCHASE (1,284 users)                              │
│ 13.2% of cart additions = 8.8% final conversion     │
│ [Checkout abandonment high? See abandonment data]  │
└─────────────────────────────────────────────────────┘

AVG ORDER VALUE: $14.35 | TOTAL REVENUE: $18,450
```

**Insights:**
- Strong CTR (3.8%) — messaging resonates
- Good app open rate (85.4%) — no routing issues
- Checkout abandonment is main bottleneck (86.8% cart → purchase drop)
- Action: Streamline checkout flow or review payment methods

**Comparison:**
- [Select comparison campaign or segment]
- Side-by-side funnel rates
- Identify best-converting path

---

### MODULE 7: ENGAGEMENT HEATMAP

**Purpose:** Lifecycle Lead & Data Science identify peak engagement windows.

**Heatmap: Day of Week vs. Hour of Day**

```
                  MON   TUE   WED   THU   FRI   SAT   SUN
       12am-1am  ░░░   ░░░   ░░░   ░░░   ░░░   ░░░   ░░░
       1am-2am   ░░░   ░░░   ░░░   ░░░   ░░░   ░░░   ░░░
       ...
       6am-7am   ░░░   ░░░   ░░░   ░░░   ░░░   ░░░   ░░░
       7am-8am   ░░░   ░░▒   ░░▒   ░░▒   ░░▓   ▒▒▓   ░░▓
       8am-9am   ░▒▓   ░▒▓   ░▒▓   ▒▒▓   ▓▓▓   ▓▓█   ░▒▓
       ...
       12pm-1pm  ▒▒▓   ▒▒▓   ▒▒▓   ▒▒▓   ▒▒▓   ░▒▒   ▒▒▓  (Lunch spike)
       1pm-2pm   ▒▒▓   ▒▒▓   ▒▒▓   ▒▒▓   ▒▒▓   ░▒▒   ▒▒▓
       ...
       6pm-7pm   ░▒▒   ░▒▒   ░▒▒   ░▒▒   ▒▒▓   ░░▒   ▒▒▓
       7pm-8pm   ▒▒▓   ▒▒▓   ▒▒▓   ▒▒▓   ▓▓█   ░▒▓   ▓▓█  (Evening peak)
       8pm-9pm   ▒▒▓   ▒▒▓   ▒▒▓   ▒▒▓   ▓▓█   ░▒▓   ▓▓█
       9pm-10pm  ▒▒▓   ▒▒▓   ▒▒▓   ▒▒▓   ▓▓█   ░▒▓   ▓▓█
       10pm-11pm ░▒▒   ░▒▒   ░▒▒   ░▒▒   ▒▒▓   ░░▒   ▒▒▓
       11pm-12am ░░▒   ░░▒   ░░▒   ░░▒   ░░▓   ░░▒   ░░▓

Legend: ░ = Low (0-20%)  ▒ = Medium (20-40%)  ▓ = High (40-60%)  █ = Peak (60%+)
```

**Insights:**
- Weekday evenings (7-9pm): Highest engagement
- Weekend mornings (8-10am): Secondary peak
- Weekday lunch (12-1pm): Tertiary peak
- Late night (11pm-6am): Lowest engagement

**Actions:**
- Schedule push notifications during peak hours
- Allocate more creatives to peak windows
- Test quiet times to build audience presence

**Segment Overlay:**
- [Select segment] → See heatmap for that segment only
- Example: WEEKEND_SHOPPER might peak Saturday morning vs. evening

---

### MODULE 8: ROI DEEP DIVE

**Purpose:** CMO & Rewards PM assess true incrementality and unit economics.

**Layout: 3-column comparison**

| Metric | With Campaign | Baseline (Holdout) | Increment | Incrementality % |
|--------|---------------|-------------------|-----------|------------------|
| **Impression Volume** | 384,230 | 0 | 384,230 | 100% |
| **Click Volume** | 14,562 | 82 | 14,480 | 99.4% |
| **Conversion Volume** | 1,284 | 58 | 1,226 | 95.5% |
| **Revenue (Gross)** | $18,450 | $840 | $17,610 | 95.5% |
| **Campaign Cost** | $14,500 | $0 | $14,500 | 100% |
| **Net Revenue** | $3,950 | $840 | $3,110 | 78.7% |
| **ROAS (Gross)** | 1.27x | N/A | 1.21x | — |
| **True Incrementality** | — | — | — | **95.5%** ✅ |

**Economics Breakdown:**
```
Total Users in Campaign: 384,230
├─ Treatment Group (91%): 349,650 users | 1,226 conversions | 0.35% conv rate
└─ Holdout Group (9%): 34,580 users | 58 conversions | 0.17% conv rate

Incremental Conversions: 1,226 - (58 × 10.1) = 1,226 - 586 = 640 users
True Increment: 640 / 1,226 = 52.2%

Wait — why is this lower than volume increment (95.5%)?
→ Likely explanation: High-value users in holdout group (organic behavior)
→ Action: Investigate user value distribution (LTV high vs. low in holdout)

Net Margin Analysis:
├─ Revenue per incremental user: $17,610 / 1,226 = $14.35
├─ Campaign cost per user: $14,500 / 1,226 = $11.82
├─ Margin per user: $14.35 - $11.82 = $2.53 ✅
└─ Gross Margin (before rewards/logistics): ~35%
```

**Comparison View:**
- [Select campaign 2 to compare]
- Side-by-side incrementality, economics
- Identify which campaign is more efficient

**Drill-in Options:**
- View by segment (which segments show highest incrementality?)
- View by creative (which copy drives true lift?)
- View over time (is incrementality declining after day 3?)

---

### MODULE 9: SYSTEM HEALTH

**Purpose:** Data Science & Engineering monitor platform reliability.

**Data Quality Metrics:**
```
DATA FRESHNESS
├─ Last event received: 34 seconds ago ✅
├─ Data lag (event to analytics): 2-4 seconds (Normal)
├─ Missing data %: 0.2% (Acceptable: <1%)
└─ Schema validation: 99.8% pass rate ✅

MODEL PERFORMANCE
├─ Incrementality model AUC: 0.87 ✅ (Target: 0.85+)
├─ Segment precision (actual vs. predicted): 82% ✅ (Target: 80%+)
├─ Holdout group balance: 91% treatment, 9% control ✅
├─ Model last retrained: 4 days ago
└─ Next retraining: Tomorrow 2am

SYSTEM UPTIME
├─ API availability: 99.96% (SLA: 99.5%) ✅
├─ Query latency (p95): 340ms (Target: <500ms) ✅
├─ Failed jobs (last 24h): 0 ✅
└─ Alert triggers: None

INFRASTRUCTURE
├─ Database connections: 42 / 100 available
├─ Cache hit rate: 94% ✅
├─ Queue depth: 2,340 jobs (Normal: <5,000)
└─ Cost-per-query: $0.0034 (On budget)
```

**Alerts Section:**
```
⚠️ WARNING: Segment rebuild taking longer than usual
   └─ Estimated time remaining: 23 minutes (normal: 8 min)
   └─ No action needed; will complete by 2pm

✅ All systems healthy
```

**Actions:**
- [Trigger model retrain now] (for debugging)
- [View query logs] (for data engineers)
- [Check infrastructure costs] (for finance)
- [Acknowledge alert] (for operations)

---

### MODULE 10: ACTION CENTER (AI Recommendations)

**Purpose:** Recommendations engine suggests next steps.

**Recommendation Cards (Priority Order):**

```
🔥 URGENT | Campaign "Summer Spending Spree" ROAS dropped to 2.8x
   ├─ Likely cause: Creative 4 ("Weekend Flash Sale") performing poorly
   ├─ Recommendation: Pause creative 4; reallocate 30% budget to creative 1
   ├─ Expected impact: +0.4x ROAS (12% improvement)
   └─ [Implement Now] [View Details] [Dismiss]

💰 OPTIMIZE | Reallocate budget from CAC-inefficient segment
   ├─ Segment: CATEGORY_FOCUSED CAC $18 vs. HIGH_SPENDER CAC $9
   ├─ Recommendation: Shift $2,000 from CATEGORY to HIGH_SPENDER
   ├─ Expected impact: +8% overall ROAS
   └─ [View Details] [Schedule] [Dismiss]

📊 TEST | Launch A/B test on creative messaging
   ├─ Current: "50% Off" (4.1% CTR) vs. Tested: "Limited Stock Alert" 
   ├─ Recommendation: 50/50 split, run 4 days, expect winner with 0.3% CTR lift
   ├─ Audience: WEEKEND_SHOPPER (highest variance)
   └─ [Launch Test] [Customize] [Dismiss]

🎯 SEGMENT | Target at-risk users with re-engagement campaign
   ├─ Segment: INACTIVE users (145k) with previous LTV >$300
   ├─ Recommendation: Win-back CASHBACK campaign, $3 reward, $1.5k budget
   ├─ Expected ROI: 2.1x (conservative estimate based on historical data)
   └─ [Create Campaign] [View Similar] [Dismiss]

📈 INSIGHT | Your WEEKEND_SHOPPER cohort is trending up
   ├─ 7-day growth: +3.2% in active users
   ├─ Avg spend growth: +5.8% YoY
   ├─ Recommendation: Increase weekend targeting allocation by 15%
   ├─ Expected impact: +$4,200 incremental revenue
   └─ [Implement] [View Segment] [Dismiss]
```

**Action Buttons:**
- [Implement Now] - Execute recommendation immediately
- [View Details] - Drill into calculation/logic
- [Schedule] - Pick date/time to execute
- [Customize] - Adjust parameters before executing
- [Dismiss] - Archive; don't show again

**Recommendation Logic (Transparency):**
- Show how each recommendation was calculated
- Link to source data/metrics
- Show confidence score (85% confidence, etc.)

---

### MODULE 11: COMPLIANCE AUDIT LOG

**Purpose:** Compliance Officer tracks campaign approvals & regulatory adherence.

**Audit Table (Immutable Log):**

| Timestamp | User | Action | Campaign | Target Segments | Consent Check | Status |
|-----------|------|--------|----------|-----------------|---------------|--------|
| 12/31 3:45pm | sarah@swipe.com (CMO) | Create | Summer Sale | HIGH_SPENDER, FREQUENT | ✅ 100% opt-in | APPROVED |
| 12/31 4:12pm | mike@swipe.com (Perf) | Adjust Budget | Summer Sale | (same) | ✅ Re-validated | APPROVED |
| 12/31 4:50pm | compliance@swipe.com | Approve | Summer Sale | (same) | ✅ Final sign-off | LIVE |
| 12/30 2:30pm | sarah@swipe.com (CMO) | Create | Re-engagement | INACTIVE | ⚠️ 78% opt-in | PENDING APPROVAL |
| 12/29 10:15am | mike@swipe.com (Perf) | Pause | Spring Promo | (all) | N/A | ARCHIVED |

**Regulatory Checks:**
```
GDPR COMPLIANCE
├─ Campaign scope: EU users only ✅
├─ Consent method: Double opt-in via email ✅
├─ Right to object: Unsubscribe link in every message ✅
├─ Data retention: 30-day cleanup scheduled ✅

CCPA COMPLIANCE (California)
├─ California users excluded from 3rd-party data ✅
├─ Sell data flag: Not sold (stored locally only) ✅
├─ Opt-out option: Provided on landing page ✅

CASL COMPLIANCE (Canada)
├─ Canadian users: Require express written consent ⚠️ (in progress)
├─ Unsubscribe mechanism: Functional ✅
├─ Sender identity: Clear in all messages ✅

STATE-LEVEL CONSENT (USA)
├─ Virginia, Colorado, Utah, Connecticut: Compliant ✅
├─ California CPRA: Compliant ✅
```

**Privacy Audit Interface:**
- [Export audit log] (CSV) for compliance review
- [View user consent trail] (trace specific user's consent history)
- [Run compliance scan] (pre-launch checklist)
- [Generate compliance report] (for legal/audit)

---

## Module Interaction Flow

### Typical CMO Workflow:
1. Open Executive KPI Cards (top)
2. See ROAS is 3.2x (below 3.5x target)
3. Click ROAS card → Jump to Campaign Leaderboard
4. Identify underperforming campaigns (ROAS <2.5x)
5. Click campaign → Campaign Detail + Creative Breakdown
6. Use Action Center to pause low-performers
7. Export report for board meeting

### Typical Perf Lead Workflow:
1. Open Campaign Leaderboard (sorted by ROAS desc)
2. Click top campaign "Summer Sale"
3. View Creative Breakdown → Identify best-performing creative
4. Use Action Center to [Pause low-performer creative]
5. Check Conversion Funnel → See checkout abandonment is 86%
6. Flag for product team to investigate
7. Drill into ROI Deep Dive → Confirm incrementality is solid (95%+)

### Typical Rewards PM Workflow:
1. Open Segment Picker
2. Filter by SEASONAL_SPENDER
3. View campaigns targeting this segment
4. See engagement peak at holidays
5. Use Action Center to [Create seasonal campaign]
6. Check economics: $12 CAC vs. $380 LTV = profitable
7. Scale budget allocation

---

---

# PART 4: METRICS DICTIONARY (25 Core Metrics)

---

## Metrics Overview

**25 metrics organized by 5 categories:**
1. **Campaign Performance (8):** ROAS, CTR, Conversion Rate, CAC, etc.
2. **Customer Value (5):** LTV, AOV, Repeat Rate, Margin, Cohort Value
3. **Engagement (4):** Open Rate, Click Rate, Frequency, Time to Convert
4. **Incrementality & Attribution (4):** Incrementality %, Holdout Lift, Net Incrementality, Attribution Model
5. **System Health (4):** Data Freshness, Model Accuracy, Uptime, Cost per Query

Each metric includes:
- **Definition:** What it measures
- **Formula:** SQL + calculation
- **Data Sources:** Tables required
- **Acceptable Range:** Healthy values
- **Visualization:** How to display
- **Owner:** Who monitors
- **Update Frequency:** Real-time, daily, weekly

---

## CATEGORY 1: CAMPAIGN PERFORMANCE (8 Metrics)

### 1. ROAS (Return on Ad Spend)

**Definition:** Revenue generated per dollar spent on campaign.

**Formula:**
```sql
SELECT
  campaign_id,
  SUM(CASE WHEN event_type = 'purchase' THEN order_value ELSE 0 END) / 
    (SELECT SUM(campaign_cost) FROM ai_campaigns WHERE campaign_id = c.campaign_id) AS roas
FROM campaign_metrics c
WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY campaign_id
```

**Data Source:** `campaign_metrics`, `ai_campaigns`  
**Acceptable Range:** 2.5x - 5.0x+  
**Visualization:** Card (display value), Trend line (7-day rolling avg)  
**Owner:** CMO, Perf Lead  
**Refresh:** Real-time (30s)

---

### 2. CTR (Click-Through Rate)

**Definition:** % of impressions that result in clicks.

**Formula:**
```sql
SELECT
  campaign_id,
  (COUNT(DISTINCT CASE WHEN event_type = 'click' THEN event_id END) /
   COUNT(DISTINCT CASE WHEN event_type = 'impression' THEN event_id END)) * 100 AS ctr_percent
FROM campaign_delivery
WHERE date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY campaign_id
```

**Data Source:** `campaign_delivery`  
**Acceptable Range:** 1.5% - 5.0%  
**Visualization:** Leaderboard (sortable), Trend vs. cohort (boxplot)  
**Owner:** Perf Lead  
**Refresh:** Real-time (1 min)

---

### 3. Conversion Rate (Campaign)

**Definition:** % of clicks that result in purchase (includes funnel steps: click → app open → add-to-cart → purchase).

**Formula:**
```sql
SELECT
  campaign_id,
  (COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN user_id END) /
   COUNT(DISTINCT CASE WHEN event_type = 'click' THEN user_id END)) * 100 AS conv_rate_percent
FROM campaign_delivery
WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY campaign_id
```

**Data Source:** `campaign_delivery`, user events  
**Acceptable Range:** 5% - 20%  
**Visualization:** Funnel chart (impression → click → purchase), Heatmap by segment  
**Owner:** Lifecycle Lead  
**Refresh:** Real-time (5 min)

---

### 4. CAC (Customer Acquisition Cost)

**Definition:** Campaign cost per new customer acquired.

**Formula:**
```sql
SELECT
  campaign_id,
  (SELECT SUM(campaign_cost) FROM ai_campaigns WHERE campaign_id = c.campaign_id) /
    COUNT(DISTINCT CASE WHEN is_new_customer = TRUE AND event_type = 'purchase' THEN user_id END) AS cac
FROM campaign_metrics c
WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY campaign_id
```

**Data Source:** `ai_campaigns`, `campaign_metrics`, `users` (first_purchase_date)  
**Acceptable Range:** <$20 per new customer  
**Visualization:** Card, Comparison table vs. target  
**Owner:** CMO, Perf Lead  
**Refresh:** Daily

---

### 5. Cost Per Click (CPC)

**Definition:** Average cost paid per click in campaign.

**Formula:**
```sql
SELECT
  campaign_id,
  (SELECT SUM(campaign_cost) FROM ai_campaigns WHERE campaign_id = c.campaign_id) /
    COUNT(DISTINCT CASE WHEN event_type = 'click' THEN event_id END) AS cpc
FROM campaign_delivery c
WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY campaign_id
```

**Data Source:** `ai_campaigns`, `campaign_delivery`  
**Acceptable Range:** $0.50 - $2.00  
**Visualization:** Trend line (7-day avg)  
**Owner:** Perf Lead  
**Refresh:** Real-time (1 hour)

---

### 6. Impression Volume

**Definition:** Total number of times campaign was shown to users.

**Formula:**
```sql
SELECT
  campaign_id,
  COUNT(*) as impression_count
FROM campaign_delivery
WHERE event_type = 'impression' AND date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY campaign_id
```

**Data Source:** `campaign_delivery`  
**Acceptable Range:** 50k - 1M+ (depends on audience size)  
**Visualization:** Counter card, Trend bar chart  
**Owner:** Perf Lead  
**Refresh:** Real-time (10 min)

---

### 7. Budget Utilization %

**Definition:** % of allocated budget actually spent.

**Formula:**
```sql
SELECT
  campaign_id,
  (SUM(campaign_cost) / ALLOCATED_BUDGET) * 100 AS budget_util_percent
FROM ai_campaigns
WHERE status IN ('active', 'completed')
GROUP BY campaign_id
```

**Data Source:** `ai_campaigns`  
**Acceptable Range:** 75% - 105% (allows slight overspend)  
**Visualization:** Progress bar, Card with percent  
**Owner:** CMO  
**Refresh:** Daily

---

### 8. Average Order Value (AOV)

**Definition:** Average revenue per purchase in campaign.

**Formula:**
```sql
SELECT
  campaign_id,
  SUM(order_value) / COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN transaction_id END) AS aov
FROM campaign_metrics
WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY campaign_id
```

**Data Source:** `campaign_metrics`  
**Acceptable Range:** $10 - $50 (varies by product mix)  
**Visualization:** Card, Comparison vs. baseline  
**Owner:** Rewards PM  
**Refresh:** Daily

---

## CATEGORY 2: CUSTOMER VALUE (5 Metrics)

### 9. Customer Lifetime Value (LTV)

**Definition:** Total revenue a customer generates over their lifetime with SwipeSavvy (12-month window).

**Formula:**
```sql
SELECT
  user_id,
  SUM(order_value) AS ltv_12m
FROM orders
WHERE DATE(order_date) >= DATE_SUB(DATE(user_signup_date), INTERVAL 12 MONTH)
  AND DATE(order_date) < NOW()
GROUP BY user_id
```

**Data Source:** `orders`, `users`  
**Acceptable Range:** $300 - $1,000+ (varies by cohort)  
**Visualization:** Cohort table, Histogram by segment  
**Owner:** Rewards PM, Lifecycle Lead  
**Refresh:** Weekly

---

### 10. CAC Payback Period

**Definition:** Months required for customer to generate revenue equal to acquisition cost.

**Formula:**
```sql
SELECT
  user_id,
  (acquisition_cost / (ltv_12m / 12)) AS payback_months
FROM (
  SELECT
    u.user_id,
    COALESCE(ac.campaign_cost, 0) as acquisition_cost,
    SUM(o.order_value) / 12 AS ltv_12m
  FROM users u
  LEFT JOIN acquisition_campaigns ac ON u.first_campaign_id = ac.campaign_id
  LEFT JOIN orders o ON u.user_id = o.user_id AND DATE(o.order_date) >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  GROUP BY u.user_id
)
```

**Data Source:** `users`, `acquisition_campaigns`, `orders`  
**Acceptable Range:** 1 - 6 months (faster is better)  
**Visualization:** Trend line, Histogram  
**Owner:** Rewards PM  
**Refresh:** Weekly

---

### 11. Repeat Purchase Rate

**Definition:** % of customers who make >1 purchase within 90 days.

**Formula:**
```sql
SELECT
  COUNT(DISTINCT CASE WHEN purchase_count >= 2 THEN user_id END) /
    COUNT(DISTINCT user_id) * 100 AS repeat_rate_percent
FROM (
  SELECT user_id, COUNT(*) as purchase_count
  FROM orders
  WHERE DATE(order_date) >= DATE_SUB(NOW(), INTERVAL 90 DAY)
  GROUP BY user_id
) purchases
```

**Data Source:** `orders`  
**Acceptable Range:** 25% - 50%  
**Visualization:** Card, Trend line (monthly)  
**Owner:** Lifecycle Lead  
**Refresh:** Weekly

---

### 12. Gross Margin per Segment

**Definition:** Revenue minus COGS minus campaign cost, per behavioral segment.

**Formula:**
```sql
SELECT
  bp.behavior_pattern,
  (SUM(o.order_value) - SUM(o.cogs) - SUM(c.campaign_cost)) /
    SUM(o.order_value) * 100 AS margin_percent
FROM orders o
JOIN users u ON o.user_id = u.user_id
JOIN behavioral_profiles bp ON u.user_id = bp.user_id
LEFT JOIN acquisition_campaigns c ON u.first_campaign_id = c.campaign_id
WHERE DATE(o.order_date) >= DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY bp.behavior_pattern
```

**Data Source:** `orders`, `users`, `behavioral_profiles`, `acquisition_campaigns`  
**Acceptable Range:** 20% - 40%  
**Visualization:** Bar chart by segment  
**Owner:** Rewards PM  
**Refresh:** Weekly

---

### 13. Cohort Retention (30/60/90 Day)

**Definition:** % of customers from a signup cohort who make >=1 purchase in month 1/2/3.

**Formula:**
```sql
SELECT
  DATE_TRUNC(DATE(signup_date), MONTH) as signup_cohort,
  COUNT(DISTINCT CASE WHEN DATEDIFF(DATE(first_purchase_date), DATE(signup_date)) <= 30 THEN user_id END) /
    COUNT(DISTINCT user_id) * 100 AS retention_30d,
  COUNT(DISTINCT CASE WHEN DATEDIFF(DATE(first_purchase_date), DATE(signup_date)) <= 60 THEN user_id END) /
    COUNT(DISTINCT user_id) * 100 AS retention_60d,
  COUNT(DISTINCT CASE WHEN DATEDIFF(DATE(first_purchase_date), DATE(signup_date)) <= 90 THEN user_id END) /
    COUNT(DISTINCT user_id) * 100 AS retention_90d
FROM users
GROUP BY signup_cohort
```

**Data Source:** `users`, `orders`  
**Acceptable Range:** 30% - 70% (monthly)  
**Visualization:** Line chart (cohorts over time)  
**Owner:** Lifecycle Lead  
**Refresh:** Weekly

---

## CATEGORY 3: ENGAGEMENT (4 Metrics)

### 14. Open Rate (Email/Push)

**Definition:** % of campaign messages that were opened.

**Formula:**
```sql
SELECT
  campaign_id,
  COUNT(DISTINCT CASE WHEN event_type = 'email_open' OR event_type = 'push_open' THEN user_id END) /
    COUNT(DISTINCT CASE WHEN event_type = 'email_sent' OR event_type = 'push_sent' THEN user_id END) * 100 AS open_rate_percent
FROM campaign_delivery
WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY campaign_id
```

**Data Source:** `campaign_delivery`  
**Acceptable Range:** 15% - 35%  
**Visualization:** Card, Comparison by campaign type  
**Owner:** Lifecycle Lead  
**Refresh:** Real-time (5 min)

---

### 15. Click Rate (Email/Push)

**Definition:** % of opened messages that result in click-through.

**Formula:**
```sql
SELECT
  campaign_id,
  COUNT(DISTINCT CASE WHEN event_type = 'click' THEN user_id END) /
    COUNT(DISTINCT CASE WHEN event_type = 'email_open' OR event_type = 'push_open' THEN user_id END) * 100 AS click_rate_percent
FROM campaign_delivery
WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY campaign_id
```

**Data Source:** `campaign_delivery`  
**Acceptable Range:** 5% - 20%  
**Visualization:** Card, Leaderboard  
**Owner:** Perf Lead  
**Refresh:** Real-time (5 min)

---

### 16. Average Message Frequency

**Definition:** Average number of times a user sees campaign message (impressions per exposed user).

**Formula:**
```sql
SELECT
  campaign_id,
  COUNT(CASE WHEN event_type = 'impression' THEN event_id END) /
    COUNT(DISTINCT CASE WHEN event_type = 'impression' THEN user_id END) AS avg_frequency
FROM campaign_delivery
WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY campaign_id
```

**Data Source:** `campaign_delivery`  
**Acceptable Range:** 1.5x - 3.5x  
**Visualization:** Histogram (distribution of user frequencies)  
**Owner:** Perf Lead  
**Refresh:** Daily

---

### 17. Time to First Conversion

**Definition:** Median hours from first impression to purchase for converting users.

**Formula:**
```sql
SELECT
  campaign_id,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY TIMESTAMPDIFF(HOUR, impression_time, purchase_time))
    AS median_hours_to_conversion
FROM (
  SELECT
    cd.campaign_id,
    MIN(cd.event_timestamp) as impression_time,
    MIN(CASE WHEN cd.event_type = 'purchase' THEN cd.event_timestamp END) as purchase_time
  FROM campaign_delivery cd
  WHERE cd.event_type IN ('impression', 'purchase')
  GROUP BY cd.campaign_id, cd.user_id
)
GROUP BY campaign_id
```

**Data Source:** `campaign_delivery`  
**Acceptable Range:** 0.5 - 72 hours  
**Visualization:** Box plot by campaign type  
**Owner:** Perf Lead  
**Refresh:** Daily

---

## CATEGORY 4: INCREMENTALITY & ATTRIBUTION (4 Metrics)

### 18. Incrementality % (True Lift)

**Definition:** % of conversions attributable to campaign (vs. would have occurred anyway).

**Formula:**
```sql
SELECT
  campaign_id,
  (treatment_conversions - (control_conversions * treatment_size / control_size)) /
    treatment_conversions * 100 AS incrementality_percent
FROM (
  SELECT
    campaign_id,
    COUNT(DISTINCT CASE WHEN treatment_group = 1 AND event_type = 'purchase' THEN user_id END) as treatment_conversions,
    COUNT(DISTINCT CASE WHEN treatment_group = 0 AND event_type = 'purchase' THEN user_id END) as control_conversions,
    COUNT(DISTINCT CASE WHEN treatment_group = 1 THEN user_id END) as treatment_size,
    COUNT(DISTINCT CASE WHEN treatment_group = 0 THEN user_id END) as control_size
  FROM campaign_delivery
  WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  GROUP BY campaign_id
)
```

**Data Source:** `campaign_delivery` (with treatment/control flags)  
**Acceptable Range:** 30% - 60% (brand campaigns 15-30%, performance 40-70%)  
**Visualization:** Card, Trend line (7-day rolling)  
**Owner:** CMO, Data Science  
**Refresh:** Weekly

---

### 19. Holdout Group Lift

**Definition:** Difference in conversion rate between treatment and control groups (absolute).

**Formula:**
```sql
SELECT
  campaign_id,
  (treatment_conv_rate - control_conv_rate) * 100 AS lift_percentage_points
FROM (
  SELECT
    campaign_id,
    COUNT(DISTINCT CASE WHEN treatment_group = 1 AND event_type = 'purchase' THEN user_id END) /
      COUNT(DISTINCT CASE WHEN treatment_group = 1 THEN user_id END) as treatment_conv_rate,
    COUNT(DISTINCT CASE WHEN treatment_group = 0 AND event_type = 'purchase' THEN user_id END) /
      COUNT(DISTINCT CASE WHEN treatment_group = 0 THEN user_id END) as control_conv_rate
  FROM campaign_delivery
  WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  GROUP BY campaign_id
)
```

**Data Source:** `campaign_delivery`  
**Acceptable Range:** +0.5% - +3.0%  
**Visualization:** Card with +/- indicator  
**Owner:** Data Science  
**Refresh:** Weekly

---

### 20. Net Incremental Revenue

**Definition:** True incremental revenue (after accounting for holdout baseline), minus campaign cost.

**Formula:**
```sql
SELECT
  campaign_id,
  (incremental_conversions * avg_order_value) - campaign_cost AS net_incremental_revenue
FROM (
  SELECT
    campaign_id,
    (treatment_conversions - (control_conversions * treatment_size / control_size)) as incremental_conversions,
    (SELECT SUM(campaign_cost) FROM ai_campaigns WHERE campaign_id = cd.campaign_id) as campaign_cost,
    (SELECT AVG(order_value) FROM orders WHERE ...) as avg_order_value
  FROM campaign_delivery cd
  WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  GROUP BY campaign_id
)
```

**Data Source:** `campaign_delivery`, `ai_campaigns`, `orders`  
**Acceptable Range:** >$0 (positive net revenue)  
**Visualization:** Card, Ranking table  
**Owner:** CMO  
**Refresh:** Weekly

---

### 21. Attribution Model Comparison

**Definition:** Compare revenue attribution using First-Touch, Last-Touch, Linear, and Time-Decay models.

**Formula:**
```sql
-- First-Touch Attribution
SELECT
  campaign_id,
  SUM(order_value) as attributed_revenue_first_touch
FROM (
  SELECT DISTINCT ON (user_id) campaign_id, order_value
  FROM order_events
  ORDER BY user_id, event_timestamp ASC
)

-- Last-Touch Attribution
SELECT
  campaign_id,
  SUM(order_value) as attributed_revenue_last_touch
FROM (
  SELECT DISTINCT ON (user_id) campaign_id, order_value
  FROM order_events
  ORDER BY user_id, event_timestamp DESC
)

-- Linear Attribution (split evenly across all touchpoints)
SELECT
  campaign_id,
  SUM(order_value / touch_count) as attributed_revenue_linear
FROM (
  SELECT campaign_id, order_value, COUNT(*) OVER (PARTITION BY user_id) as touch_count
  FROM order_events
)
```

**Data Source:** `order_events`  
**Acceptable Range:** Compare % spread (should show 10-30% variance between models)  
**Visualization:** Stacked bar chart (by model), Sankey diagram  
**Owner:** Data Science  
**Refresh:** Weekly

---

## CATEGORY 5: SYSTEM HEALTH (4 Metrics)

### 22. Data Freshness (Lag)

**Definition:** Time delay between event occurrence and availability in analytics.

**Formula:**
```sql
SELECT
  table_name,
  MAX(TIMESTAMPDIFF(MINUTE, event_timestamp, updated_at)) as max_lag_minutes,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY TIMESTAMPDIFF(MINUTE, event_timestamp, updated_at)) as p95_lag_minutes
FROM data_freshness_monitor
WHERE checked_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY table_name
```

**Data Source:** System monitoring table  
**Acceptable Range:** <5 minutes (p95)  
**Visualization:** Gauge chart, Alert if >10 min  
**Owner:** Engineering  
**Refresh:** Real-time (every 5 min)

---

### 23. Model Accuracy (Incrementality AUC)

**Definition:** Area Under Curve for incrementality prediction model (how well does it distinguish incrementality vs. baseline).

**Formula:**
```sql
SELECT
  model_version,
  auc_score,
  precision,
  recall,
  f1_score
FROM model_performance_logs
WHERE model_type = 'incrementality'
  AND evaluated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY evaluated_at DESC
LIMIT 1
```

**Data Source:** `model_performance_logs`  
**Acceptable Range:** 0.80 - 0.95 AUC  
**Visualization:** Card, Time series trend  
**Owner:** Data Science  
**Refresh:** Weekly (after model retraining)

---

### 24. System Uptime %

**Definition:** Percentage of time analytics services are available (API response time <1s).

**Formula:**
```sql
SELECT
  (COUNT(CASE WHEN response_time < 1000 AND status_code = 200 THEN 1 END) /
    COUNT(*)) * 100 AS uptime_percent
FROM api_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
```

**Data Source:** `api_logs`  
**Acceptable Range:** >99.5%  
**Visualization:** Gauge, Incident list  
**Owner:** Engineering  
**Refresh:** Real-time (1 min)

---

### 25. Cost Per Query

**Definition:** Average infrastructure cost (BigQuery, data warehouse) per analytics query.

**Formula:**
```sql
SELECT
  SUM(query_cost) / COUNT(DISTINCT query_id) AS cost_per_query_cents,
  SUM(query_cost) / 30 AS daily_cost_estimate
FROM bigquery_cost_logs
WHERE DATE(query_timestamp) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
```

**Data Source:** `bigquery_cost_logs`, billing data  
**Acceptable Range:** <$0.01 per query (or <$50/month total)  
**Visualization:** Card, Trend line, Breakdown by dashboard  
**Owner:** Engineering / Finance  
**Refresh:** Daily

---

## Summary Table: All 25 Metrics

| # | Metric | Owner | Refresh | Range | Priority |
|----|--------|-------|---------|-------|----------|
| 1 | ROAS | CMO | Real-time | 2.5x-5.0x+ | P0 |
| 2 | CTR | Perf Lead | Real-time | 1.5%-5.0% | P0 |
| 3 | Conversion Rate | Lifecycle | Real-time | 5%-20% | P0 |
| 4 | CAC | CMO | Daily | <$20 | P0 |
| 5 | CPC | Perf Lead | Hourly | $0.50-$2.00 | P1 |
| 6 | Impression Volume | Perf Lead | Real-time | 50k-1M | P1 |
| 7 | Budget Utilization % | CMO | Daily | 75%-105% | P1 |
| 8 | AOV | Rewards PM | Daily | $10-$50 | P1 |
| 9 | LTV | Rewards PM | Weekly | $300-$1k | P0 |
| 10 | CAC Payback Period | Rewards PM | Weekly | 1-6 months | P1 |
| 11 | Repeat Purchase Rate | Lifecycle | Weekly | 25%-50% | P1 |
| 12 | Gross Margin/Segment | Rewards PM | Weekly | 20%-40% | P1 |
| 13 | Cohort Retention | Lifecycle | Weekly | 30%-70% | P1 |
| 14 | Open Rate | Lifecycle | Real-time | 15%-35% | P2 |
| 15 | Click Rate | Perf Lead | Real-time | 5%-20% | P2 |
| 16 | Avg Frequency | Perf Lead | Daily | 1.5x-3.5x | P2 |
| 17 | Time to Conversion | Perf Lead | Daily | 0.5-72 hrs | P2 |
| 18 | Incrementality % | CMO | Weekly | 30%-60% | P0 |
| 19 | Holdout Lift | Data Science | Weekly | +0.5%-+3.0% | P1 |
| 20 | Net Incremental Revenue | CMO | Weekly | >$0 | P0 |
| 21 | Attribution Model | Data Science | Weekly | Variance 10-30% | P2 |
| 22 | Data Freshness | Engineering | Real-time | <5 min | P0 |
| 23 | Model Accuracy (AUC) | Data Science | Weekly | 0.80-0.95 | P1 |
| 24 | System Uptime % | Engineering | Real-time | >99.5% | P0 |
| 25 | Cost Per Query | Engineering | Daily | <$0.01 | P2 |

---

## Data Dependencies & Refresh Strategy

**Real-time (30s - 1 min):**
- ROAS, CTR, Conversion Rate, Impression Volume, Open/Click Rates, Data Freshness, Uptime

**Hourly:**
- CPC, Frequency distribution

**Daily:**
- CAC, AOV, Budget Util, LTV (initial), Cohort Retention, Model Accuracy, Cost/Query

**Weekly:**
- Full LTV, CAC Payback, Repeat Rate, Margin, Holdout Lift, Incrementality %, Net Revenue, Attribution

---

---

# PART 5: EVALUATION RUBRIC (7 Categories, 1-5 Scoring + Pass/Fail Gates)

---

## Overview

**Purpose:** Assess analytics system readiness, completeness, and business impact using a 7-category rubric.

**Scoring Model:**
- **1-5 Points** per category (based on implementation depth + quality)
- **Pass/Fail Gates** (hard requirements for each category; fail = system not ready)
- **Total Score:** 7-35 points
- **Target Score for Deployment:** 28+ (80%+)

**Evaluation Timeline:** Week 2, Week 4, Week 8 (30/60/90 day checkpoints)

---

## Category 1: Dashboard Completeness (5 points)

**Goal:** All 11 modules functional and accessible to intended users.

| Score | Criteria | Pass/Fail Gate | Evidence |
|-------|----------|---|----------|
| **5** | All 11 modules live, fully functional, all filters/sorts working | PASS | Screenshots, user testing logs |
| **4** | 10/11 modules live; 1 module partially functional (e.g., missing 1-2 filters) | PASS | Module completion checklist |
| **3** | 8-9/11 modules live; 2-3 modules partially functional | CONDITIONAL PASS | Known issues list with timeline |
| **2** | 6-7/11 modules live; several filters/sorts not working | FAIL | Not ready for public demo |
| **1** | <6 modules live; many basic features missing | FAIL | Major rework needed |
| **0** | Dashboard doesn't exist or is non-functional | FAIL | **BLOCKER** |

**Pass/Fail Gate:** Must score ≥3 (CONDITIONAL PASS = must fix within 2 weeks)

---

## Category 2: Data Accuracy & Freshness (5 points)

**Goal:** Metrics are calculated correctly and updated in real-time.

| Score | Criteria | Pass/Fail Gate | Evidence |
|-------|----------|---|----------|
| **5** | All 25 metrics calculated correctly; data lag <2 min for real-time metrics; 0 data discrepancies | PASS | Automated data validation tests (100% pass) |
| **4** | All 25 metrics calculated correctly; data lag 2-5 min; <0.5% discrepancies | PASS | Spot checks + audit logs |
| **3** | 22-24 metrics correct; data lag 5-10 min; <1% discrepancies (root cause identified) | CONDITIONAL PASS | Known bugs with fix timeline |
| **2** | 18-21 metrics correct; data lag >10 min; 1-2% discrepancies (cause unknown) | FAIL | Impacts key decisions |
| **1** | <18 metrics correct; significant lag; >2% discrepancies | FAIL | Unreliable for decision-making |
| **0** | Data not populating or severely incorrect (>50% errors) | FAIL | **BLOCKER** |

**Pass/Fail Gate:** Must score ≥3 (data accuracy is foundational; <3 = system not trustworthy)

---

## Category 3: Incrementality & Attribution (5 points)

**Goal:** True campaign lift measured and incrementality model is statistically valid.

| Score | Criteria | Pass/Fail Gate | Evidence |
|-------|----------|---|----------|
| **5** | Holdout groups running for all campaigns; incrementality model AUC 0.85+; attribution model chosen & validated | PASS | Statistical test results; holdout size logs |
| **4** | Holdout groups for 80%+ of campaigns; incrementality AUC 0.80-0.84; attribution model documented | PASS | Holdout allocation report |
| **3** | Holdout groups for 50-79% of campaigns; incrementality AUC 0.75-0.79; attribution model in progress | CONDITIONAL PASS | Holdout group expansion plan |
| **2** | Holdout groups <50% of campaigns; incrementality AUC 0.70-0.74; no attribution model | FAIL | Can't prove marketing ROI |
| **1** | No holdouts; incrementality not measured; AUC <0.70 | FAIL | Series A blocker |
| **0** | No incrementality measurement attempted | FAIL | **BLOCKER** |

**Pass/Fail Gate:** Must score ≥3 (critical for CMO credibility; <3 = can't defend campaign ROI)

---

## Category 4: User Adoption & Training (5 points)

**Goal:** All stakeholders trained and actively using analytics.

| Score | Criteria | Pass/Fail Gate | Evidence |
|-------|----------|---|----------|
| **5** | 90%+ of target users trained; >60% weekly active users; support tickets <5/week | PASS | Usage logs; training completion certificates |
| **4** | 80-89% trained; 40-60% weekly active; support tickets 5-10/week | PASS | Training attendance logs |
| **3** | 70-79% trained; 20-40% weekly active; support tickets 10-15/week | CONDITIONAL PASS | Training plan update; new tutorial videos |
| **2** | <70% trained; <20% weekly active; support tickets >15/week; many confused users | FAIL | Unclear value prop; UX issues |
| **1** | Minimal training; very low adoption; heavy support burden | FAIL | Dashboard perceived as useless |
| **0** | No users; no training; abandoned | FAIL | **BLOCKER** |

**Pass/Fail Gate:** Must score ≥3 (adoption validates product-market fit)

---

## Category 5: Integration & Data Sources (5 points)

**Goal:** All required data sources connected and data pipelines stable.

| Score | Criteria | Pass/Fail Gate | Evidence |
|-------|----------|---|----------|
| **5** | All data sources connected (campaigns, orders, user events, segments); 0 broken pipelines; ETL uptime 99.9%+ | PASS | Data lineage diagram; pipeline logs |
| **4** | 95%+ of sources connected; <1 broken pipeline; ETL uptime 99.5%+ | PASS | Source integration checklist |
| **3** | 90-94% of sources connected; 1-2 broken pipelines (known, <1 week fix); ETL uptime 98%+ | CONDITIONAL PASS | Pipeline repair plan with ETA |
| **2** | 80-89% of sources connected; 3+ broken pipelines; ETL uptime 95-98%; regular data gaps | FAIL | Critical data missing |
| **1** | <80% of sources connected; many broken pipelines; ETL uptime <95%; frequent outages | FAIL | Unreliable system |
| **0** | No data connections; pipelines down; no data flowing | FAIL | **BLOCKER** |

**Pass/Fail Gate:** Must score ≥3 (missing data sources = missing insights)

---

## Category 6: Compliance & Governance (5 points)

**Goal:** System compliant with regulations; audit-ready; data governance documented.

| Score | Criteria | Pass/Fail Gate | Evidence |
|-------|----------|---|----------|
| **5** | GDPR/CCPA/CASL compliant; audit log complete & immutable; PII properly masked; compliance checklist 100% | PASS | Legal review; compliance audit report |
| **4** | GDPR/CCPA compliant; audit log mostly complete; PII masked; compliance checklist 90%+ | PASS | Compliance officer sign-off |
| **3** | GDPR compliant; audit log partial; PII mostly masked; compliance checklist 75-89% | CONDITIONAL PASS | Compliance roadmap (30-day timeline) |
| **2** | Some compliance gaps; audit trail incomplete; PII sometimes visible; <75% compliance | FAIL | Regulatory risk |
| **1** | Major compliance gaps; no audit trail; PII exposed; <50% compliance | FAIL | Legal liability |
| **0** | No compliance measures; no audit log; PII fully exposed | FAIL | **BLOCKER** |

**Pass/Fail Gate:** Must score ≥3 (compliance = legal requirement, not optional)

---

## Category 7: Business Impact & ROI (5 points)

**Goal:** Analytics drive measurable business decisions and demonstrate ROI.

| Score | Criteria | Pass/Fail Gate | Evidence |
|-------|----------|---|----------|
| **5** | 5+ documented decisions driven by analytics; avg. decision impact +15%+ (ROAS, CTR, CAC); system ROI quantified | PASS | Decision logs; before/after metrics |
| **4** | 3-4 documented decisions; avg. impact +10-14%; system ROI estimated | PASS | Campaign optimization records |
| **3** | 1-2 documented decisions; avg. impact +5-9%; ROI not yet clear | CONDITIONAL PASS | Decision tracking plan; optimization roadmap |
| **2** | Dashboards viewed but no clear decisions made; impact <5% or unmeasured | FAIL | System seems "nice to have" |
| **1** | Dashboard rarely used; no documented impact | FAIL | Stakeholders questioning value |
| **0** | System created but unused; 0 impact | FAIL | **BLOCKER** |

**Pass/Fail Gate:** Must score ≥2 (business impact is ultimate validation)

---

## Scoring Matrix & Interpretation

### Scoring Table
```
Category                      | Score 1-5 | Weight | Weighted Contribution
-----------                   |---------  |--------|----------------------
1. Dashboard Completeness     |    4      |   1x   | 4 points
2. Data Accuracy & Freshness  |    4      |   1.5x | 6 points
3. Incrementality & Attribution |  3     |   1.5x | 4.5 points
4. User Adoption & Training   |    4      |   1x   | 4 points
5. Integration & Data Sources |    5      |   1.5x | 7.5 points
6. Compliance & Governance    |    4      |   1x   | 4 points
7. Business Impact & ROI      |    3      |   1x   | 3 points
-----------                   |           |        |
TOTAL SCORE                   |           |        | 32.5 / 42 points (77%)
```

### Readiness Levels

| Total Score | Status | Recommendation |
|-------------|--------|-----------------|
| **28-35** | 🟢 **READY FOR DEPLOYMENT** | Launch to users; celebrate! |
| **21-27** | 🟡 **CONDITIONAL READY** | Deploy with caveats (known issues documented); fix within 2 weeks |
| **14-20** | 🔴 **NOT READY** | Hold deployment; address critical gaps |
| **<14** | ⛔ **BLOCKED** | Major rework required; reassess timeline |

### Pass/Fail Assessment

**System is deployment-ready IF:**
- ✅ All 7 categories score ≥ Pass/Fail Gate (minimum ≥2 for Category 7; ≥3 for others)
- ✅ No **BLOCKER** items (0-score items)
- ✅ Total score ≥ 28

**Example: System with score 32 but Data Accuracy = 1 (BLOCKER):** 
- Status = **BLOCKED** (even though total score is high)
- Reason: Unreliable data discredits entire system
- Fix Required: Resolve data accuracy issues before launch

---

## Evaluation Checklist (Pre-Launch)

**Use this checklist 2 weeks before planned deployment:**

### Dashboard Completeness
- [ ] All 11 modules load without errors
- [ ] KPI cards display live data (refreshed within 30 sec)
- [ ] Campaign leaderboard sorts by ROAS, CTR, Volume
- [ ] Segment picker filters all downstream modules
- [ ] Campaign Detail shows real-time metrics + historical trends
- [ ] Creative Breakdown ranks creatives by CTR/ROAS
- [ ] Conversion Funnel shows all steps (impression → purchase)
- [ ] Engagement Heatmap displays correct peak times
- [ ] ROI Deep Dive compares treatment vs. holdout
- [ ] System Health shows <5 min data lag + >99.5% uptime
- [ ] Action Center displays 3+ recommendations
- [ ] Compliance Audit Log immutable + searchable

### Data Accuracy & Freshness
- [ ] Run data validation on all 25 metrics (check SQL correctness)
- [ ] Compare analytics values vs. source system (spot check 10 campaigns)
- [ ] Verify data lag: real-time metrics <2 min, daily metrics <24 hours
- [ ] Check for missing data (nulls) across tables
- [ ] Document any known discrepancies + reasons

### Incrementality & Attribution
- [ ] Holdout groups created for ≥50% of campaigns
- [ ] Incrementality model AUC ≥0.75
- [ ] Attribution model documented + tested
- [ ] Holdout randomization verified (no selection bias)
- [ ] Control group size adequate (sample size calculator)

### User Adoption & Training
- [ ] All 6 persona groups have training session scheduled
- [ ] Tutorial videos recorded (5 min each for top 3 use cases)
- [ ] Documentation written (Slack channel + wiki)
- [ ] Support process established (who answers questions?)
- [ ] Feedback loop set up (collect user issues weekly)

### Integration & Data Sources
- [ ] All required tables imported (campaigns, metrics, orders, users, segments)
- [ ] ETL pipelines tested & stable (7-day run without errors)
- [ ] Data lineage documented (which table feeds which metric?)
- [ ] Backup/recovery plan documented
- [ ] SLA for data freshness defined

### Compliance & Governance
- [ ] Legal review completed (GDPR, CCPA, CASL)
- [ ] Audit log implemented + tested
- [ ] PII masking rules applied + tested
- [ ] Data access controls implemented (role-based)
- [ ] Compliance officer approval obtained

### Business Impact & ROI
- [ ] Decision-making process documented (how will this analytics system be used?)
- [ ] Key stakeholders briefed on expected impact
- [ ] Baseline metrics established (pre-analytics)
- [ ] Success metrics defined (what counts as "working"?)
- [ ] Post-launch review scheduled (30-day check-in)

---

## Evaluation Timeline

| Checkpoint | Date | Owner | Actions |
|-----------|------|-------|---------|
| **Week 2** | Jan 13, 2026 | Product Lead | Run evaluation; identify gaps; prioritize fixes |
| **Week 4** | Jan 27, 2026 | Product Lead | Re-score; confirm pass/fail gates met; begin user training |
| **Week 8** | Feb 24, 2026 | CMO | Final evaluation; launch decision; begin metrics monitoring |

---

## Example Evaluation (Week 4)

**Product Lead completes evaluation:**

| Category | Score | Status | Notes | Action |
|----------|-------|--------|-------|--------|
| Dashboard | 4/5 | PASS | System Health module has 100ms latency (slow). Minor UX issue with segment picker. | Add pagination to dropdown; optimize System Health queries |
| Data Accuracy | 4/5 | PASS | CTR calculation shows 0.2% variance vs. marketing tool. Root cause identified: timezone handling. | Standardize to UTC; rerun validation |
| Incrementality | 3/5 | CONDITIONAL PASS | 60% of campaigns have holdouts; incrementality AUC 0.78. Need faster model retraining. | Schedule daily retraining; increase holdout % to 80% |
| User Adoption | 4/5 | PASS | 85% trained; 50% weekly active; 7 support tickets (minor questions). | Weekly office hours; create FAQ doc |
| Integration | 5/5 | PASS | All data sources live; ETL uptime 99.98%; no missing data. | Maintain status quo |
| Compliance | 4/5 | PASS | GDPR/CCPA compliant; audit log working; legal review done. Minor PII masking gap in exports. | Mask email in CSV exports |
| Business Impact | 3/5 | CONDITIONAL PASS | 2 documented optimizations (creative A/B test, segment reallocation); impact +8%. ROI calculation in progress. | Complete ROI analysis; document 2-3 more decisions |

**Result:** Total = 27/35 (77%) = 🟡 **CONDITIONAL READY**
- Recommendation: Fix System Health latency & CTR timezone issue; target launch in 1 week
- If issues resolved: ✅ Approved for deployment

---

# PART 5: INSTRUMENTATION PLAN & EVENT TAXONOMY

## Overview

To power the 25 metrics and 11 dashboard modules, SwipeSavvy must instrument three data collection surfaces:

1. **Mobile App (React Native):** User engagement, campaign interactions, purchase behavior
2. **Admin Portal (React/TS):** Marketer actions, campaign edits, dashboard usage
3. **Backend API (FastAPI):** Campaign delivery, segment assignment, model inference

This section defines:
- **Event Taxonomy:** 50+ standardized event types with schemas
- **Data Quality Framework:** Validation rules, deduplication, freshness guarantees
- **Instrumentation Roadmap:** Phase 1 (MVP), Phase 2 (Enhancement), Phase 3 (Advanced)
- **Integration Patterns:** How events flow into analytics pipeline

---

## Event Taxonomy

All events follow standard schema:

```json
{
  "event_id": "uuid",                    // Globally unique identifier
  "event_type": "string",                // campaign_view, campaign_click, etc.
  "timestamp": "ISO-8601",               // When event occurred (UTC)
  "user_id": "string",                   // SwipeSavvy user identifier
  "session_id": "string",                // Session identifier (mobile or web)
  "source": "string",                    // "mobile" | "admin_portal" | "backend"
  "properties": {},                      // Event-specific properties
  "context": {
    "app_version": "string",
    "platform": "string",                // "iOS" | "Android" | "Web"
    "user_segment": "string",            // HIGH_SPENDER, etc.
    "region": "string"
  }
}
```

### Campaign Events (Delivery & Engagement)

**1. campaign_delivered**
- **When:** Push/email campaign sent to user
- **Properties:**
  - `campaign_id` (uuid)
  - `campaign_type` ("DISCOUNT" | "CASHBACK" | "LOYALTY" | etc.)
  - `creative_id` (uuid) - which headline/body/CTA variant
  - `segment_id` (uuid) - which behavioral segment targeted
  - `delivery_channel` ("push" | "email" | "sms" | "in_app")
  - `scheduled_time` (ISO-8601) - when was it supposed to arrive?
  - `is_holdout` (boolean) - part of incrementality test holdout group?
  - `allocation_method` ("ai_optimized" | "random" | "manual")
- **Owner:** Backend API (AI engine)
- **Frequency:** Real-time
- **Expected Volume:** 50k-100k/day
- **Accepted Values:** campaign_id must match ai_campaigns table; segment_id must be valid behavioral pattern

**2. campaign_viewed**
- **When:** User opens/views campaign (push notification, email, in-app card)
- **Properties:**
  - `campaign_id` (uuid)
  - `creative_id` (uuid)
  - `view_duration_seconds` (int) - how long did they look?
  - `view_type` ("received" | "opened" | "clicked_cta")
  - `viewed_at` (ISO-8601)
  - `impression_position` (int) - position in campaign queue?
- **Owner:** Mobile App (native event tracking)
- **Frequency:** Real-time
- **Expected Volume:** 200k-500k/day
- **Quality Gate:** view_duration_seconds must be >= 0; timestamp must not be in future

**3. campaign_clicked**
- **When:** User clicks campaign CTA or link
- **Properties:**
  - `campaign_id` (uuid)
  - `creative_id` (uuid)
  - `click_type` ("cta" | "headline" | "image" | "deep_link")
  - `destination_url` (string) - where did it lead?
  - `time_to_click_seconds` (int) - seconds from view to click
- **Owner:** Mobile App
- **Frequency:** Real-time
- **Expected Volume:** 20k-50k/day

**4. campaign_converted**
- **When:** User makes purchase after campaign interaction
- **Properties:**
  - `campaign_id` (uuid)
  - `creative_id` (uuid)
  - `conversion_delay_seconds` (int) - how long after click/view?
  - `order_id` (uuid) - associated purchase
  - `order_value` (float) - revenue
  - `attribution_model` ("last_touch" | "first_touch" | "linear" | "time_decay")
  - `is_incremental` (boolean) - ML model prediction of incrementality
  - `incrementality_score` (float 0-1) - confidence in incrementality
- **Owner:** Backend API (post-purchase tracking)
- **Frequency:** Near real-time (within 1 min)
- **Expected Volume:** 5k-15k/day

**5. campaign_abandoned**
- **When:** Campaign delivered but user doesn't view within 7 days OR unsubscribes
- **Properties:**
  - `campaign_id` (uuid)
  - `reason` ("expired" | "unsubscribed" | "opt_out" | "deletion_requested")
  - `days_to_abandon` (int)
- **Owner:** Mobile App / Backend API
- **Frequency:** Batch (daily)
- **Expected Volume:** 5k-20k/day

### User Behavior Events

**6. user_segmented**
- **When:** User is assigned to behavioral segment (daily ML refresh)
- **Properties:**
  - `user_id` (string)
  - `segment_id` (uuid)
  - `segment_type` ("HIGH_SPENDER" | "FREQUENT_SHOPPER" | ... | "SEASONAL_SPENDER")
  - `segment_score` (float 0-1) - confidence of assignment
  - `previous_segment` (uuid) - what was their segment before?
  - `segment_change_reason` (string) - "increased_spend" | "reduced_frequency" | etc.
- **Owner:** Backend API (ML segmentation engine)
- **Frequency:** Daily (batch)
- **Expected Volume:** 50k-100k/day (only changes reported)

**7. user_purchased**
- **When:** User completes purchase transaction
- **Properties:**
  - `order_id` (uuid)
  - `user_id` (string)
  - `order_value` (float)
  - `order_category` (string) - what did they buy?
  - `order_timestamp` (ISO-8601)
  - `payment_method` ("card" | "wallet" | "other")
  - `promo_code_used` (boolean)
  - `promotional_discount` (float) - if applicable
  - `is_repeat_purchase` (boolean)
  - `days_since_last_purchase` (int)
- **Owner:** Backend API
- **Frequency:** Real-time
- **Expected Volume:** 5k-20k/day

**8. user_engaged**
- **When:** User opens app, views rewards, views catalog, etc.
- **Properties:**
  - `engagement_type` ("app_open" | "view_rewards" | "view_catalog" | "search" | "save_item")
  - `session_id` (string)
  - `session_duration_seconds` (int)
  - `screen_name` (string) - which screen viewed?
  - `search_query` (string, nullable) - if search_type, what did they search?
- **Owner:** Mobile App (via analytics SDK)
- **Frequency:** Real-time
- **Expected Volume:** 500k-1M/day

**9. user_unsubscribed**
- **When:** User opts out of campaigns
- **Properties:**
  - `user_id` (string)
  - `unsubscribe_type` ("all_campaigns" | "push_only" | "email_only" | "frequency_cap")
  - `unsubscribe_reason` (string) - "too_many_campaigns" | "not_relevant" | etc.
  - `previous_email_frequency` (int) - campaigns/week they were getting
- **Owner:** Mobile App / Admin Portal
- **Frequency:** Real-time
- **Expected Volume:** 500-2k/day

### Marketer Actions (Admin Portal)

**10. campaign_created**
- **When:** Marketer designs new campaign in admin portal
- **Properties:**
  - `campaign_id` (uuid)
  - `marketer_id` (string) - who created it?
  - `campaign_type` ("DISCOUNT" | "CASHBACK" | etc.)
  - `target_segment_id` (uuid)
  - `initial_budget` (float)
  - `template_used` (string, nullable) - did they use a template?
  - `time_to_completion_minutes` (int) - how long did creation take?
- **Owner:** Admin Portal
- **Frequency:** Real-time
- **Expected Volume:** 20-100/day

**11. campaign_launched**
- **When:** Marketer publishes campaign (moves to live status)
- **Properties:**
  - `campaign_id` (uuid)
  - `marketer_id` (string)
  - `actual_audience_size` (int) - how many users matched segment?
  - `scheduled_delivery_time` (ISO-8601)
  - `budget_approved` (float)
  - `ai_recommendation_applied` (boolean) - did they use AI copy/targeting?
  - `ai_recommendation_score` (float 0-1) - what was recommendation quality?
- **Owner:** Admin Portal
- **Frequency:** Real-time
- **Expected Volume:** 20-50/day

**12. campaign_paused**
- **When:** Marketer pauses active campaign
- **Properties:**
  - `campaign_id` (uuid)
  - `marketer_id` (string)
  - `pause_reason` ("manual" | "low_performance" | "budget_exceeded" | "user_feedback")
  - `time_to_pause_hours` (int) - how long did it run before pause?
  - `pause_metrics_snapshot` (JSON) - ROAS, CTR, conversions at pause time
- **Owner:** Admin Portal
- **Frequency:** Real-time
- **Expected Volume:** 5-20/day

**13. budget_reallocated**
- **When:** Marketer moves budget between campaigns/segments
- **Properties:**
  - `reallocation_id` (uuid)
  - `marketer_id` (string)
  - `from_campaign_id` (uuid)
  - `to_campaign_id` (uuid)
  - `amount` (float)
  - `reallocation_reason` ("performance" | "testing" | "manual" | "ai_recommendation")
  - `ai_recommendation_id` (uuid, nullable) - did this come from AI?
- **Owner:** Admin Portal
- **Frequency:** Real-time
- **Expected Volume:** 10-30/day

**14. dashboard_accessed**
- **When:** Marketer opens analytics dashboard
- **Properties:**
  - `user_id` (string)
  - `user_role` ("cmo" | "perf_lead" | "lifecycle_lead" | "rewards_pm" | "data_science" | "compliance")
  - `dashboard_section` (string) - which module/view? ("kpi" | "campaigns" | "segments" | "funnel" | "heatmap" | "roi" | "health" | "action_center" | "compliance")
  - `time_spent_seconds` (int) - how long did they stay?
  - `filters_applied` (JSON) - which date range, segments, campaigns filtered?
  - `export_requested` (boolean) - did they download/export data?
- **Owner:** Admin Portal
- **Frequency:** Real-time
- **Expected Volume:** 100-500/day

**15. creative_variant_tested**
- **When:** Marketer initiates A/B test with creative variants
- **Properties:**
  - `test_id` (uuid)
  - `campaign_id` (uuid)
  - `variant_a_creative_id` (uuid)
  - `variant_b_creative_id` (uuid)
  - `split_percentage` (int) - 50/50, 80/20, etc.
  - `test_duration_days` (int)
  - `primary_metric` (string) - "click_rate" | "conversion_rate" | "roas"
  - `statistical_significance_threshold` (float) - e.g., 0.95
- **Owner:** Admin Portal
- **Frequency:** Real-time
- **Expected Volume:** 5-20/day

### System & Quality Events

**16. data_refresh_completed**
- **When:** Metrics pipeline completes batch job (refreshes metrics table)
- **Properties:**
  - `refresh_id` (uuid)
  - `data_source` (string) - "campaign_events" | "user_behavior" | "orders"
  - `records_processed` (int)
  - `refresh_duration_seconds` (float)
  - `data_lag_seconds` (int) - how far behind real-time?
  - `errors_encountered` (int) - did any records fail validation?
  - `error_messages` (JSON, nullable)
- **Owner:** Backend API (data pipeline)
- **Frequency:** Continuous (every 1-5 minutes)
- **Expected Volume:** 500-1k/day

**17. metric_calculation_completed**
- **When:** Backend calculates metric (ROAS, CTR, LTV, etc.)
- **Properties:**
  - `metric_id` (string) - "roas" | "ctr" | "ltv" | etc.
  - `calculation_timestamp` (ISO-8601)
  - `calculation_duration_ms` (int) - performance
  - `result_value` (float)
  - `dimension_breakdown` (JSON) - broken down by campaign, segment, date, etc.
  - `data_completeness_percentage` (float 0-100) - % of expected data available?
- **Owner:** Backend API
- **Frequency:** Continuous
- **Expected Volume:** 1k-5k/day

**18. anomaly_detected**
- **When:** Data quality system flags unusual patterns
- **Properties:**
  - `anomaly_id` (uuid)
  - `metric_id` (string) - which metric is anomalous?
  - `anomaly_type` ("spike" | "drop" | "zero_value" | "duplicate" | "missing_data")
  - `anomaly_severity` ("critical" | "warning" | "info")
  - `expected_value` (float) - what we expected
  - `actual_value` (float) - what we got
  - `percentage_deviation` (float) - (actual - expected) / expected * 100
  - `affected_records` (int) - how many rows affected?
  - `auto_remediation_applied` (boolean) - did system fix it automatically?
- **Owner:** Data Science (quality monitoring)
- **Frequency:** Real-time (triggered)
- **Expected Volume:** 10-100/day

**19. model_inference_completed**
- **When:** ML model predicts incrementality/segment/recommendation
- **Properties:**
  - `model_name` (string) - "incrementality_model_v2" | "segment_classifier" | etc.
  - `inference_timestamp` (ISO-8601)
  - `input_record_id` (uuid) - what event/user triggered this?
  - `prediction` (float or string) - the model's output
  - `confidence_score` (float 0-1)
  - `inference_duration_ms` (int)
  - `feature_importance_top_3` (JSON) - which features mattered most?
- **Owner:** Backend API (ML pipeline)
- **Frequency:** Real-time (for events) or batch (for segment refresh)
- **Expected Volume:** 100k+/day

**20. user_action_recommended**
- **When:** AI generates recommendation (pause campaign, increase budget, test creative, etc.)
- **Properties:**
  - `recommendation_id` (uuid)
  - `recommendation_type` ("pause_campaign" | "increase_budget" | "decrease_budget" | "test_creative" | "expand_segment" | "focus_segment")
  - `target_entity_id` (uuid) - campaign_id, segment_id, etc.
  - `impact_projection` (JSON)
    - `projected_roas_change_percent` (float)
    - `projected_revenue_impact` (float)
    - `confidence_score` (float 0-1)
  - `confidence_level` ("high" | "medium" | "low")
  - `supporting_data` (JSON) - which metrics drove this?
  - `expiration_time` (ISO-8601) - when is this recommendation stale?
- **Owner:** Backend API (recommendation engine)
- **Frequency:** Real-time or batch
- **Expected Volume:** 50-200/day

---

## Data Collection Points

### Mobile App (React Native + Expo)

**Setup:** Amplitude or custom analytics SDK integrated at app initialization.

```typescript
// Event payload structure
interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  userId: string;
  sessionId: string;
  timestamp: ISO-8601;
}

// Examples:
analytics.track('campaign_viewed', {
  campaign_id: 'uuid-123',
  creative_id: 'uuid-456',
  view_duration_seconds: 3,
});

analytics.track('user_purchased', {
  order_id: 'uuid-789',
  order_value: 59.99,
  promo_code: 'SAVE20',
});
```

**Required Integration Points:**
1. **Campaign Card Component:** Emit `campaign_viewed`, `campaign_clicked` when user interacts
2. **Checkout Flow:** Emit `user_purchased` at payment success
3. **App Lifecycle:** Emit `user_engaged` on app open (session tracking)
4. **Rewards Section:** Emit `user_engaged` when viewing rewards balance
5. **Preferences/Settings:** Emit `user_unsubscribed` when opting out

**Data Quality Checks:**
- ✅ User ID must match authenticated user
- ✅ Timestamp must not be in future
- ✅ Session ID must be consistent within session
- ✅ Order IDs in purchase events must match backend orders table

### Admin Portal (React + TypeScript)

**Setup:** Custom event tracking via React Context + API wrapper.

```typescript
// Marketer action tracking
const trackMarketingAction = async (action: string, metadata: any) => {
  const payload = {
    event_type: action,
    properties: metadata,
    timestamp: new Date().toISOString(),
    user_id: currentUser.id,
  };
  await api.post('/analytics/events', payload);
};

// Usage:
trackMarketingAction('campaign_launched', {
  campaign_id: campaignData.id,
  budget: campaignData.budget,
  ai_recommendation_applied: true,
});
```

**Required Integration Points:**
1. **Campaign Builder:** Emit `campaign_created`, `campaign_launched`, `campaign_paused` at key workflow steps
2. **Dashboard Viewer:** Emit `dashboard_accessed` with section/filters/time spent
3. **Budget Allocation:** Emit `budget_reallocated` when moving funds
4. **A/B Testing:** Emit `creative_variant_tested` when launching test
5. **Performance Analysis:** Emit dashboard filter/export actions

**Data Quality Checks:**
- ✅ Marketer ID must be valid authenticated user
- ✅ Campaign IDs referenced must exist in ai_campaigns table
- ✅ Budget amounts must be positive
- ✅ Timestamps must be in chronological order per session

### Backend API (FastAPI)

**Setup:** Event emission directly in business logic (FastAPI dependencies, middleware).

```python
# In FastAPI route
@router.post("/campaigns/{campaign_id}/deliver")
async def deliver_campaign(campaign_id: str, db: Session):
    # Deliver campaign logic...
    
    # Emit event
    await analytics_service.track({
        "event_type": "campaign_delivered",
        "properties": {
            "campaign_id": campaign_id,
            "delivery_channel": "push",
            "is_holdout": is_in_holdout_group(user_id),
        },
        "timestamp": datetime.utcnow(),
    })
```

**Required Integration Points:**
1. **Campaign Delivery Service:** Emit `campaign_delivered` for every user-campaign pair
2. **Segmentation Engine:** Emit `user_segmented` after daily ML refresh
3. **Order Service:** Emit `user_purchased`, `campaign_converted` post-checkout
4. **ML Pipeline:** Emit `model_inference_completed`, `user_action_recommended`
5. **Data Pipeline:** Emit `data_refresh_completed`, `metric_calculation_completed`, `anomaly_detected`

**Data Quality Checks:**
- ✅ User IDs must exist in users table
- ✅ Campaign IDs must exist in ai_campaigns table
- ✅ Segment IDs must be valid behavioral patterns (HIGH_SPENDER, etc.)
- ✅ Timestamps must use UTC timezone
- ✅ Holdout group assignment must be deterministic (same user always in same group)

---

## Data Quality Framework

### Validation Rules

**At Ingestion Time:**

| Rule | Field(s) | Check | Action |
|------|---------|-------|--------|
| Non-null IDs | event_id, user_id | Must not be null or empty | Reject event |
| Valid UUID | campaign_id, creative_id, order_id | Must match UUID format | Reject event |
| Valid timestamp | timestamp | Must not be null, future, >30 days old | Reject event |
| Valid source | source | Must be "mobile" \| "admin_portal" \| "backend" | Reject event |
| Positive amounts | order_value, budget | Must be >= 0 | Reject event |
| Score ranges | incrementality_score, confidence_score | Must be 0.0 to 1.0 | Reject event |

**At Storage Time (Deduplication):**

- **Duplicate Detection:** event_id is globally unique; any duplicate rejected (last-write-wins for same event_id within 5 min window)
- **Late Arrivals:** Events with timestamp >24 hours old tagged `late_arrival=true` but still stored
- **Clock Skew:** If timestamp is >5 min in future, reject immediately

**At Query Time (Metrics Calculation):**

- **Missing Data:** If <90% of expected data available, metric marked `incomplete=true` with confidence% reported
- **Outlier Detection:** Values >3σ from rolling 7-day median flagged as potential anomalies
- **Data Freshness:** Metrics calculated from data older than SLA target emit warning (e.g., "ROAS based on 2-hour-old data")

### Data Freshness SLAs

| Event Type | Target Latency | Acceptable Latency | Grace Period |
|-----------|--------|--------|---------|
| **Campaign Events** (delivered, viewed, clicked) | <1 min | <5 min | 1 hour |
| **User Behavior** (purchased, engaged, segmented) | <5 min | <30 min | 4 hours |
| **Marketer Actions** (campaign created, paused) | <10 sec | <1 min | 30 min |
| **System Events** (refresh, anomaly, model inference) | <1 min | <5 min | 1 hour |
| **Metrics Calculation** | <5 min | <15 min | 1 hour |

**Definition:** 
- **Target:** 95% of events arrive within this latency
- **Acceptable:** 99% of events arrive within this latency
- **Grace Period:** If data not arrived by this time, backfill from alternative source

### Quality Metrics

Track these quality dimensions in `data_refresh_completed` events:

```json
{
  "data_quality_metrics": {
    "ingestion_rate_percent": 98.5,      // % of expected events received
    "validation_pass_rate_percent": 99.2, // % that pass validation rules
    "duplicate_rate_percent": 0.1,        // % identified as duplicates
    "late_arrival_rate_percent": 1.5,     // % arriving >24h late
    "data_freshness_minutes": 3,          // How old is the data?
    "completeness_percent": 97.8,         // % of rows with non-null required fields
    "schema_compliance_percent": 100      // % matching expected event schema
  }
}
```

**Quality Alerts:**
- 🔴 **Critical:** Ingestion rate <95% OR validation rate <95%
- 🟡 **Warning:** Data freshness >15 min OR completeness <90%
- 🔵 **Info:** Late arrival rate >5% OR duplicate rate >1%

---

## Instrumentation Roadmap

### Phase 1: MVP (Weeks 1-3)
**Goal:** Core campaign and user behavior events flowing; 8 critical metrics calculable.

**Scope:**
- ✅ Mobile app: `campaign_viewed`, `campaign_clicked`, `user_purchased`, `user_engaged`, `user_unsubscribed`
- ✅ Backend: `campaign_delivered`, `user_segmented`, `data_refresh_completed`
- ✅ Admin portal: `campaign_created`, `campaign_launched`, `campaign_paused`, `dashboard_accessed`
- ✅ Metrics: ROAS, CTR, Conv Rate, CAC, AOV, LTV, Engagement Rate, Budget Util %

**Deliverables:**
- Event schema documentation (this section)
- Analytics SDK integration (mobile + admin portal)
- Event validation rules implemented
- Data pipeline to aggregation tables
- 8 metrics queries written and tested

**Acceptance Criteria:**
- 100k+ events/day flowing
- Data freshness <5 min
- Validation pass rate >95%
- All 8 metrics calculation time <30 sec

### Phase 2: Enhancement (Weeks 4-6)
**Goal:** Incrementality testing, advanced attribution, all 25 metrics live.

**Scope:**
- ✅ Backend: `campaign_converted`, `anomaly_detected`, `model_inference_completed`, `user_action_recommended`
- ✅ Metrics: Add 17 more (LTV, CAC Payback, Repeat Rate, Incrementality %, Holdout Lift, etc.)
- ✅ Quality: Deduplication, late arrival handling, quality monitoring dashboard
- ✅ Testing: Set up holdout groups for 50%+ of campaigns

**Deliverables:**
- Attribution model comparison (last-touch vs. first-touch vs. linear)
- Incrementality calculation engine (holdout group diff testing)
- Anomaly detection system (flagging data quality issues)
- Quality monitoring dashboard (for data team)

**Acceptance Criteria:**
- All 25 metrics live and validated
- Incrementality AUC >0.75 on holdout test campaigns
- <1% duplicate rate
- Data freshness <5 min for 99%+ of events

### Phase 3: Advanced (Weeks 7-12)
**Goal:** AI-driven recommendations, optimization engine, advanced features.

**Scope:**
- ✅ Backend: `creative_variant_tested`, `budget_reallocated`
- ✅ Recommendations: Pause low-ROAS creatives, reallocate budget, test variants
- ✅ Optimization: Multi-armed bandit for creative allocation
- ✅ Forecasting: Revenue projection for next 7/30 days

**Deliverables:**
- Recommendation engine (scoring algorithms)
- Budget optimization engine (maximize total ROAS)
- Creative A/B testing framework
- 7/30-day revenue forecasting model

**Acceptance Criteria:**
- 50+ recommendations/week generated
- A/B test framework accepts test creation from UI
- Budget reallocations produce +5%+ ROAS improvement
- Forecasting accuracy >85% (MAPE)

---

## Schema Additions to Database

To support event tracking, add these tables:

```sql
-- Master events table
CREATE TABLE analytics.events (
  event_id UUID PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  session_id VARCHAR(255),
  source VARCHAR(50),
  properties JSONB,
  context JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ingestion_lag_seconds INT,
  CONSTRAINT valid_timestamp CHECK (timestamp <= CURRENT_TIMESTAMP)
);

CREATE INDEX idx_events_timestamp ON analytics.events(timestamp DESC);
CREATE INDEX idx_events_user ON analytics.events(user_id, timestamp DESC);
CREATE INDEX idx_events_type ON analytics.events(event_type, timestamp DESC);
CREATE INDEX idx_events_campaign ON analytics.events((properties->>'campaign_id'), timestamp DESC);

-- Data quality metrics (from data_refresh_completed events)
CREATE TABLE analytics.data_quality_log (
  refresh_id UUID PRIMARY KEY,
  refresh_timestamp TIMESTAMP NOT NULL,
  data_source VARCHAR(100),
  records_processed INT,
  refresh_duration_seconds FLOAT,
  data_lag_seconds INT,
  validation_pass_rate_percent FLOAT,
  ingestion_rate_percent FLOAT,
  duplicate_rate_percent FLOAT,
  error_count INT,
  error_messages JSONB,
  CONSTRAINT valid_refresh_percent CHECK (
    validation_pass_rate_percent >= 0 AND validation_pass_rate_percent <= 100
  )
);

CREATE INDEX idx_quality_timestamp ON analytics.data_quality_log(refresh_timestamp DESC);

-- Model inference log (tracking predictions)
CREATE TABLE analytics.model_predictions (
  prediction_id UUID PRIMARY KEY,
  model_name VARCHAR(255) NOT NULL,
  inference_timestamp TIMESTAMP NOT NULL,
  input_record_id UUID,
  prediction FLOAT,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  inference_duration_ms INT,
  feature_importance JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_model ON analytics.model_predictions(model_name, inference_timestamp DESC);
CREATE INDEX idx_predictions_confidence ON analytics.model_predictions(confidence_score DESC);
```

---

## Integration with Existing Tables

Events feed into existing metrics tables:

```
analytics.events
  ↓ (campaign_delivered, campaign_viewed, campaign_clicked)
  ↓
analytics.campaign_metrics
  ├─ CTR = SUM(campaign_clicked) / SUM(campaign_delivered)
  ├─ Conversion Rate = SUM(campaign_converted) / SUM(campaign_clicked)
  ├─ Impressions = SUM(campaign_delivered)
  └─ ROA = SUM(order_value FROM campaign_converted) / SUM(budget)

analytics.events
  ↓ (user_purchased)
  ↓
analytics.user_metrics
  ├─ LTV = SUM(order_value) per user (lifetime)
  ├─ AOV = AVG(order_value) per user per period
  ├─ CAC = SUM(campaign_budget) / COUNT(new_users) from campaign
  └─ Repeat Rate = Users with 2+ purchases

analytics.events
  ↓ (user_segmented)
  ↓
analytics.behavioral_profiles
  └─ Updated daily with latest segment assignments
```

---

# PART 6: ACTION CENTER LOGIC & RECOMMENDATION ENGINE

## Overview

The **Action Center** is the analytics system's most strategic feature—converting metrics insights into executable business decisions. It automatically generates recommendations for campaigns, budgets, creative variants, and segment targeting, with transparent reasoning and impact projections.

This section defines:
- **Recommendation Types:** 10 primary recommendation categories
- **Scoring Algorithms:** How recommendations are ranked by impact potential
- **Confidence Thresholds:** When recommendations are actionable vs. exploratory
- **Impact Projections:** How to estimate business outcomes
- **Explanation Transparency:** Why each recommendation was generated
- **Execution Model:** Manual review vs. auto-execution per recommendation type

---

## Recommendation Architecture

### High-Level Flow

```
Metrics → Anomaly Detection → Decision Rules → Scoring → Ranking → User Review → Execution

Step 1: Metrics updated in real-time (ROAS, CTR, CAC, LTV, etc.)
Step 2: Anomaly detection flags unusual patterns (spike, drop, outlier)
Step 3: Decision rules evaluate conditions (IF ROAS < 2.0 AND duration > 7 days...)
Step 4: Scoring algorithm assigns impact potential (0-100 points)
Step 5: Recommendations ranked by impact, confidence, priority
Step 6: User reviews recommendation + data in Action Center dashboard
Step 7: User executes (auto-apply, schedule, or dismiss)
```

---

## Recommendation Types

### Category 1: Campaign Performance — PAUSE CAMPAIGN

**Trigger Conditions:**
- Campaign has run ≥7 days AND ROAS < 2.0x (below profitability threshold)
- OR CTR < 1.0% AND campaign duration ≥5 days (engagement too low)
- OR spending > planned budget + 10% AND ROAS < 1.5x (budget overrun + poor performance)

**Data Required:**
- `campaign_metrics.roas` (calculated from campaign_converted events)
- `campaign_metrics.ctr` (clicks / impressions)
- `campaign_metrics.spend` vs. `ai_campaigns.budget`
- `campaign_metrics.days_active`

**Recommendation Structure:**

```json
{
  "recommendation_id": "uuid-12345",
  "recommendation_type": "pause_campaign",
  "priority": "high",
  "target_entity": {
    "entity_type": "campaign",
    "entity_id": "campaign-uuid-789",
    "entity_name": "Q1 New Year Discount Push"
  },
  "current_metrics": {
    "roas": 1.8,
    "ctr": 0.8,
    "daily_spend": 250,
    "total_spend": 1750,
    "days_active": 7,
    "conversions": 12,
    "cost_per_conversion": 145.83
  },
  "recommendation_reasoning": {
    "primary_reason": "ROAS below profitability threshold",
    "roas_threshold": 2.0,
    "ctr_threshold": 1.0,
    "supporting_evidence": [
      "ROAS of 1.8x is 10% below target 2.0x",
      "CTR of 0.8% is 20% below benchmark 1.0%",
      "Campaign has run 7 days (sufficient data for decision)"
    ]
  },
  "projected_impact": {
    "if_paused": {
      "daily_spend_saved": 250,
      "weekly_spend_saved": 1750,
      "estimated_averted_losses": 350,
      "confidence_score": 0.92
    },
    "if_continued": {
      "projected_weekly_spend": 1750,
      "projected_weekly_revenue": 3150,
      "projected_net_loss": 0
    }
  },
  "alternative_actions": [
    {
      "action": "reallocate_budget",
      "description": "Move $250/day to HIGH_SPENDER CASHBACK campaign (ROAS 4.2x)",
      "projected_impact": "+$3,500 weekly revenue"
    },
    {
      "action": "test_creative",
      "description": "Pause this segment + test new headline variant with 20% of budget",
      "projected_impact": "Better data on creative performance"
    }
  ],
  "execution_mode": "manual",
  "auto_execute": false,
  "review_deadline": "2026-01-07T12:00:00Z",
  "generated_at": "2026-01-01T09:30:00Z",
  "expiration_at": "2026-01-08T09:30:00Z"
}
```

**Scoring Algorithm (Pause Campaign):**
```
base_score = 50

// ROAS component (max 30 points)
if roas < 1.0:
  roas_score = 30
else if roas < 2.0:
  roas_score = 20 + (2.0 - roas) * 10  // Linear scale 20-30
else if roas < 3.0:
  roas_score = 10
else:
  roas_score = 0

// Duration component (reliability, max 10 points)
if days_active < 3:
  duration_score = 0  // Not enough data
else if days_active < 7:
  duration_score = 5
else:
  duration_score = 10

// CTR component (secondary signal, max 10 points)
if ctr < 0.5:
  ctr_score = 10
else if ctr < 1.0:
  ctr_score = 5
else:
  ctr_score = 0

final_score = base_score + roas_score + duration_score + ctr_score
confidence = 0.7 + (duration_score / 10) * 0.3  // Higher confidence with more days
```

**Example:**
- Campaign: ROAS 1.8, CTR 0.8%, days_active 7
- roas_score = 20 + (2.0 - 1.8) * 10 = 22
- duration_score = 10
- ctr_score = 5
- final_score = 50 + 22 + 10 + 5 = **87/100**
- confidence = 0.7 + (10/10) * 0.3 = **1.0** (100%)

---

### Category 2: Campaign Performance — REALLOCATE BUDGET

**Trigger Conditions:**
- Campaign A has ROAS > 3.5x AND is running at budget cap
- Campaign B has ROAS < 2.0x AND is still spending
- Moving $X from B to A would increase net revenue (estimated)

**Recommendation Structure:**

```json
{
  "recommendation_id": "uuid-54321",
  "recommendation_type": "reallocate_budget",
  "priority": "high",
  "target_entity": {
    "entity_type": "budget_reallocation",
    "from_campaign": "campaign-low-performer",
    "to_campaign": "campaign-high-performer"
  },
  "current_metrics": {
    "from_campaign": {
      "id": "campaign-789",
      "name": "Q1 New Year Discount",
      "current_spend": 250,
      "current_daily_spend": 50,
      "roas": 1.8,
      "current_budget": 2000
    },
    "to_campaign": {
      "id": "campaign-456",
      "name": "Premium Rewards Cashback",
      "current_spend": 500,
      "current_daily_spend": 100,
      "roas": 4.2,
      "current_budget": 3000,
      "budget_cap_reached": true
    }
  },
  "reallocation_proposal": {
    "amount": 150,
    "frequency": "daily",
    "total_weekly_reallocation": 1050,
    "duration_days": 7
  },
  "projected_impact": {
    "from_campaign_impact": {
      "spend_reduction": 150,
      "estimated_revenue_loss": 270,  // ROAS 1.8x
      "days_to_deplete": 12
    },
    "to_campaign_impact": {
      "spend_increase": 150,
      "estimated_revenue_gain": 630,  // ROAS 4.2x
      "new_daily_impressions": "+150",
      "new_daily_conversions": "+8"
    },
    "net_impact": {
      "weekly_net_gain": 2520,
      "monthly_net_gain": 10080,
      "confidence_score": 0.85
    }
  },
  "execution_mode": "scheduled",
  "auto_execute": false,
  "schedule": {
    "start_date": "2026-01-02T00:00:00Z",
    "end_date": "2026-01-08T23:59:59Z",
    "daily_reallocation_amount": 150
  },
  "safety_checks": {
    "to_campaign_budget_remaining": 2500,
    "to_campaign_can_absorb": true,
    "from_campaign_min_viable_spend": 100,
    "reallocation_feasible": true
  }
}
```

**Scoring Algorithm (Reallocate Budget):**
```
base_score = 40

// Performance gap (max 40 points)
performance_gap = roas_to - roas_from
if performance_gap > 2.5:
  gap_score = 40
else if performance_gap > 1.5:
  gap_score = 30
else if performance_gap > 0.5:
  gap_score = 15
else:
  gap_score = 0

// Feasibility (max 15 points)
if budget_available_in_from AND budget_available_in_to:
  feasibility_score = 15
else if budget_available_in_from:
  feasibility_score = 10
else:
  feasibility_score = 0

// Data quality (max 5 points)
if days_from_active >= 7 AND days_to_active >= 7:
  quality_score = 5
else:
  quality_score = 3

final_score = base_score + gap_score + feasibility_score + quality_score
confidence = 0.6 + (gap_score / 40) * 0.4
```

---

### Category 3: Creative Optimization — TEST CREATIVE VARIANT

**Trigger Conditions:**
- Campaign has run ≥5 days AND CTR < 1.5% benchmark
- OR competitor analysis shows similar campaigns have CTR 2.0%+ (creative underperforming)
- OR A/B test showed winning variant but it's not being used in production

**Recommendation Structure:**

```json
{
  "recommendation_id": "uuid-99999",
  "recommendation_type": "test_creative",
  "priority": "medium",
  "target_entity": {
    "entity_type": "campaign",
    "entity_id": "campaign-123",
    "entity_name": "Q1 New Year Discount Push"
  },
  "current_creative": {
    "creative_id": "creative-001",
    "headline": "Save 20% This New Year",
    "body": "Limited time offer on all rewards",
    "cta": "Shop Now",
    "current_ctr": 0.8,
    "current_engagement": "low"
  },
  "recommended_variant": {
    "hypothesis": "Sense of urgency + emoji might increase CTR by 30-50%",
    "variant_headline": "🎉 48-Hour Flash Sale: 20% Off Everything",
    "variant_body": "Only 48 hours left! Save on all your favorite rewards.",
    "variant_cta": "Grab Offer Now",
    "creative_id": "creative-variant-001",
    "variant_source": "ai_generated",
    "base_model": "gpt-4-turbo"
  },
  "test_design": {
    "test_type": "ab_test",
    "split_percentage": {
      "control": 80,
      "variant": 20
    },
    "duration_days": 5,
    "primary_metric": "ctr",
    "statistical_power": 0.80,
    "minimum_detectable_effect": 0.15,
    "sample_size_needed": 500,
    "estimated_test_duration": "3-5 days"
  },
  "projected_impact": {
    "base_ctr": 0.8,
    "projected_variant_ctr": 1.2,
    "ctr_improvement_percent": 50,
    "estimated_additional_clicks": 24,
    "estimated_additional_conversions": 3,
    "estimated_additional_revenue": 450,
    "confidence_interval_low": 0.20,
    "confidence_interval_high": 0.80,
    "success_probability": 0.72
  },
  "execution_mode": "requires_approval",
  "auto_execute": false,
  "next_steps": [
    "Review recommended creative variant",
    "Approve or request modification",
    "Launch A/B test with 20/80 split",
    "Monitor results daily",
    "Winner goes live if statistical significance achieved (p < 0.05)"
  ]
}
```

**Scoring Algorithm (Test Creative):**
```
base_score = 35

// CTR opportunity (max 35 points)
ctr_gap = benchmark_ctr - current_ctr
if ctr_gap > 1.0:
  ctr_score = 35
else if ctr_gap > 0.5:
  ctr_score = 25
else if ctr_gap > 0.2:
  ctr_score = 15
else:
  ctr_score = 5

// AI confidence in variant (max 20 points)
ai_confidence = variant_ml_confidence
ai_score = ai_confidence * 20

// Data sufficiency (max 10 points)
if days_active >= 5:
  data_score = 10
else if days_active >= 3:
  data_score = 5
else:
  data_score = 0

final_score = base_score + ctr_score + ai_score + data_score
confidence = 0.65 + (ai_score / 20) * 0.35
```

---

### Category 4: Audience Targeting — EXPAND SEGMENT / FOCUS SEGMENT

**Trigger Conditions (Expand):**
- Segment has ROAS > 3.5x AND segment size could increase by >20%
- OR adjacent segment shows similar performance but less saturated

**Trigger Conditions (Focus):**
- Segment has ROAS < 2.0x AND there's a higher-performing alternative
- OR segment has poor LTV trend and retention declining

**Recommendation Structure:**

```json
{
  "recommendation_id": "uuid-88888",
  "recommendation_type": "expand_segment",
  "priority": "medium",
  "target_entity": {
    "entity_type": "segment",
    "segment_type": "HIGH_SPENDER",
    "current_size": 45000,
    "segment_characteristics": {
      "min_annual_spend": 1000,
      "avg_purchase_frequency": 8.5,
      "avg_ltv": 1240
    }
  },
  "rationale": {
    "primary_reason": "ROAS exceeding targets; opportunity for scale",
    "segment_roas": 4.2,
    "segment_cac": 12.50,
    "segment_ltv": 1240,
    "ltv_to_cac_ratio": 99.2
  },
  "expansion_opportunity": {
    "expansion_type": "relax_spend_threshold",
    "current_threshold": "annual_spend >= $1000",
    "proposed_threshold": "annual_spend >= $750",
    "projected_new_size": 68000,
    "size_increase_percent": 51,
    "new_users_addressable": 23000
  },
  "projected_impact": {
    "estimated_additional_conversions": 184,
    "estimated_additional_revenue": 90200,
    "confidence_on_lower_tier": 0.72,
    "risk": {
      "lower_quality_users": true,
      "potential_ltv_dilution": 0.15,
      "worst_case_ltv": 1054,
      "worst_case_cac": 14.50,
      "worst_case_roi": 72.7
    }
  },
  "recommendation_with_safeguard": "Expand segment slowly with weekly cohort monitoring; revert if LTV drops >10%"
}
```

---

### Category 5: Timing & Frequency — ADJUST SEND FREQUENCY

**Trigger Conditions:**
- Unsubscribe rate > 5% on segment AND frequency is 3+ per week
- OR engagement rate declining week-over-week despite stable creative
- OR open rate > 30% but CTR < 2% (sending too much, people tired)

**Recommendation Structure:**

```json
{
  "recommendation_id": "uuid-77777",
  "recommendation_type": "adjust_frequency",
  "priority": "medium",
  "target_entity": {
    "entity_type": "segment",
    "segment_type": "FREQUENT_SHOPPER",
    "segment_size": 62000
  },
  "current_state": {
    "weekly_sends": 4,
    "weekly_open_rate": 28,
    "weekly_ctr": 1.5,
    "weekly_unsubscribe_rate": 6.2,
    "weekly_conversions": 420,
    "weekly_revenue": 8820
  },
  "proposed_change": {
    "new_weekly_sends": 2,
    "frequency_reduction_percent": 50
  },
  "projected_impact": {
    "immediate_impact": {
      "unsubscribe_rate_reduction_percent": 40,
      "estimated_unsubscribe_loss": 155,
      "retention_improvement": 3100
    },
    "engagement_impact": {
      "estimated_open_rate": 32,
      "estimated_ctr": 1.8,
      "open_rate_change_percent": 14,
      "ctr_change_percent": 20
    },
    "revenue_impact": {
      "estimated_weekly_conversions": 305,
      "estimated_weekly_revenue": 6405,
      "revenue_change_percent": -27,
      "retention_benefit_12m": 15000,
      "net_12m_impact": 2000
    }
  },
  "recommendation_rationale": "Short-term revenue dip (-27%) offset by long-term retention value (+12M). User satisfaction improves, reducing future churn."
}
```

---

### Additional Recommendation Types (Brief)

**6. Budget Increase (High Performer)**
- Trigger: Campaign ROAS > 4.0x AND budget utilization > 90%
- Action: Increase daily budget 20% to capitalize on high-performer
- Scoring: Performance gap (max 40) + Budget availability (max 20) + Days active (max 10)

**7. Change Segment Targeting**
- Trigger: Campaign performs 3x better in unexpected segment
- Action: Reallocate delivery to outperforming segment + test in others
- Scoring: Performance anomaly (max 40) + Data quality (max 15) + Risk (max 10)

**8. Launch Campaign Holdout Test**
- Trigger: Campaign running live but no incrementality measurement
- Action: Create holdout group (10%) to measure true lift
- Scoring: Business impact (max 40) + Data completeness (max 20) + Test duration (max 10)

**9. Improve Data Quality**
- Trigger: Metric data freshness > 30 min OR validation errors > 5%
- Action: Alert data team; trigger pipeline refresh; provide error details
- Scoring: Urgency (max 50) + System reliability (max 25)

**10. Compliance Flag**
- Trigger: Campaign targeting under-18 users OR consent missing
- Action: Pause campaign immediately; alert compliance officer
- Scoring: Risk severity (max 100) + User exposure (max varies)

---

## Recommendation Ranking & Prioritization

### Priority Levels

Each recommendation gets assigned priority based on:

```
Priority Score = Impact Score (0-100) × Urgency Factor (0-2.0) × Feasibility Score (0-1.0)

Impact Score:
- Campaign pause saving $5k/week untrustworthy spend: 90
- Budget reallocation with +$2k/week gain: 80
- Creative test with 50% improvement potential: 65
- Frequency adjustment with retention benefit: 55

Urgency Factor:
- Revenue hemorrhaging (ROAS < 1.0): 2.0 (CRITICAL)
- Poor performance (ROAS 1.5-2.0): 1.5 (HIGH)
- Optimization opportunity: 1.0 (MEDIUM)
- Nice-to-have improvement: 0.5 (LOW)

Feasibility Score:
- Can execute immediately (no dependencies): 1.0
- Requires one approval: 0.85
- Requires multiple approvals or data prep: 0.6
- Complex, many dependencies: 0.3
```

### Default Ranking

```
Rank | Recommendation Type | Typical Score Range | Auto-Execute?
-----|---------------------|-------------------|---------------
1    | Compliance Flag     | 95-100            | YES (immediate)
2    | Pause Campaign      | 70-95             | MANUAL (requires review)
3    | Budget Reallocation | 65-90             | MANUAL (requires approval)
4    | Adjust Frequency    | 50-75             | MANUAL (test first)
5    | Test Creative       | 50-70             | MANUAL (requires approval)
6    | Expand Segment      | 45-65             | MANUAL (high risk)
7    | Change Targeting    | 40-60             | MANUAL (exploratory)
8    | Launch Holdout      | 50-70             | MANUAL (product decision)
9    | Improve Data Quality| 40-80             | AUTO (if < 5% errors)
10   | Budget Increase     | 35-55             | MANUAL (verification)
```

---

## Action Center Dashboard UX

### View 1: Recommendation Queue

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 ACTION CENTER — 7 Recommendations                        │
├─────────────────────────────────────────────────────────────┤
│ Filter: [All ▼] [Priority ▼] [Status ▼] [Age ▼]             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 🔴 CRITICAL — Pause "Q1 Discount" Campaign                 │
│    ROAS 1.8x | Score: 87/100 | Confidence: 100%            │
│    Est. Weekly Savings: $350 | Review deadline: Jan 7       │
│    [View Details] [Pause Now] [Dismiss]                    │
│                                                               │
│ 🟠 HIGH — Reallocate $150/day to Premium Cashback           │
│    Net Impact: +$2,520/week | Score: 78/100 | 85% conf    │
│    From: Q1 Discount (ROAS 1.8x) To: Premium (ROAS 4.2x)   │
│    [View Details] [Schedule] [Dismiss]                      │
│                                                               │
│ 🟡 MEDIUM — Test Creative: New Headline Variant             │
│    Potential CTR Improvement: 50% | Score: 62/100           │
│    Revenue Upside: $450 | Test Duration: 3-5 days          │
│    [View Details] [Approve Test] [Dismiss]                 │
│                                                               │
│ More recommendations... [Show 4 of 7]                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### View 2: Recommendation Detail

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to Queue                                               │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ 🔴 PAUSE "Q1 DISCOUNT" CAMPAIGN                              │
│ Recommendation ID: uuid-12345 | Generated: 2 hours ago       │
│ Expiration: Jan 8, 9:30 AM | Auto-review: No                │
│                                                                │
│ ─────────────────────────────────────────────────────────────│
│ CURRENT PERFORMANCE                                           │
│ ─────────────────────────────────────────────────────────────│
│                                                                │
│ KPI              | Current | Target | Status                │
│ ─────────────────|---------|--------|───────                │
│ ROAS             | 1.8x    | 2.0x   | 🔴 Below              │
│ CTR              | 0.8%    | 1.0%   | 🔴 Below              │
│ Daily Spend      | $250    | $286   | 🟡 OK                │
│ Cost/Conversion  | $145.83 | $100   | 🔴 High              │
│ Days Running     | 7       | ≥5     | ✅ OK                │
│                                                                │
│ ─────────────────────────────────────────────────────────────│
│ WHY THIS RECOMMENDATION?                                      │
│ ─────────────────────────────────────────────────────────────│
│                                                                │
│ Primary Reason: ROAS 1.8x is 10% below profitability target │
│                                                                │
│ Supporting Evidence:                                         │
│ • ROAS has been consistently below 2.0x for last 3 days     │
│ • CTR (0.8%) is 20% below segment benchmark (1.0%)          │
│ • Cost-per-conversion ($145.83) is 46% above target ($100)  │
│ • Campaign has sufficient runtime (7 days) for decision      │
│                                                                │
│ Similar campaigns (FREQUENT_SHOPPER segment):               │
│   - Premium Rewards (ROAS 4.2x) ✅                           │
│   - Weekend Special (ROAS 3.1x) ✅                           │
│   - Flash Sale (ROAS 2.8x) ✅                                │
│ → This campaign significantly underperforming              │
│                                                                │
│ ─────────────────────────────────────────────────────────────│
│ PROJECTED IMPACT IF YOU ACT                                  │
│ ─────────────────────────────────────────────────────────────│
│                                                                │
│ Action: PAUSE CAMPAIGN                                       │
│ Timing: Immediately or schedule for later                    │
│                                                                │
│ If Paused Now:                                               │
│ • Daily Spend Saved: $250                                    │
│ • Weekly Spend Saved: $1,750                                 │
│ • Estimated Revenue That Would Be Lost: $3,150              │
│ • Net Loss Averted: $350 (breakeven point already passed)   │
│ • Confidence: 92%                                            │
│                                                                │
│ If Campaign Continues (7 more days):                        │
│ • Projected Additional Spend: $1,750                         │
│ • Projected Additional Revenue: $3,150 (at current ROAS)    │
│ • Net Result: $0 (break even, no upside)                     │
│                                                                │
│ ─────────────────────────────────────────────────────────────│
│ ALTERNATIVE ACTIONS                                          │
│ ─────────────────────────────────────────────────────────────│
│                                                                │
│ Instead of pausing, you could:                               │
│                                                                │
│ ✓ Reallocate Budget                                          │
│   Move $250/day to "Premium Rewards" (ROAS 4.2x)            │
│   Est. Weekly Revenue Increase: $2,520                       │
│   [Choose This Action]                                       │
│                                                                │
│ ✓ Test Creative Variant                                      │
│   Hypothesis: New headline might improve CTR by 30-50%       │
│   Risk: Might take 3-5 days to see results                   │
│   [Choose This Action]                                       │
│                                                                │
│ ✓ Adjust Targeting                                           │
│   Refocus on HIGH_SPENDER segment only                       │
│   Estimated ROAS Improvement: +0.5x                          │
│   [Choose This Action]                                       │
│                                                                │
│ ─────────────────────────────────────────────────────────────│
│                                                                │
│ [Pause Campaign Now] [Schedule Pause] [Dismiss] [Export]   │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Architecture

### Backend Service: RecommendationEngine

```python
# service/recommendation_engine.py

class RecommendationEngine:
    def __init__(self, db_session, analytics_service, ml_service):
        self.db = db_session
        self.analytics = analytics_service  # Metrics queries
        self.ml = ml_service                # AI copy generation, confidence scoring
    
    async def generate_recommendations(self, context: "Context") -> List[Recommendation]:
        """
        Main entry point: generates all applicable recommendations
        
        context = {
            "user_id": "marketer-123",
            "role": "perf_lead",
            "lookback_days": 7,
            "min_confidence": 0.65,
            "include_exploratory": True
        }
        """
        
        recommendations = []
        
        # Step 1: Fetch active campaigns
        campaigns = await self.db.query(Campaign).filter(
            Campaign.status == "live",
            Campaign.created_at > datetime.utcnow() - timedelta(days=14)
        ).all()
        
        # Step 2: Evaluate each campaign against decision rules
        for campaign in campaigns:
            metrics = await self.analytics.get_campaign_metrics(
                campaign_id=campaign.id,
                lookback_days=context["lookback_days"]
            )
            
            # Rule: Pause campaign if ROAS < 2.0 and duration >= 7 days
            if await self._should_pause_campaign(campaign, metrics):
                rec = await self._generate_pause_recommendation(campaign, metrics)
                if rec.confidence >= context["min_confidence"]:
                    recommendations.append(rec)
            
            # Rule: Reallocate budget if ROAS < 2.0 and high-performer exists
            if await self._should_reallocate_budget(campaign, metrics):
                rec = await self._generate_reallocation_recommendation(campaign, metrics)
                if rec.confidence >= context["min_confidence"]:
                    recommendations.append(rec)
            
            # Rule: Test creative if CTR < 1.5% and campaign age >= 5 days
            if await self._should_test_creative(campaign, metrics):
                rec = await self._generate_creative_test_recommendation(campaign, metrics)
                if rec.confidence >= context["min_confidence"]:
                    recommendations.append(rec)
        
        # Step 3: Score and rank all recommendations
        for rec in recommendations:
            rec.priority = self._calculate_priority(rec)
        
        recommendations.sort(key=lambda r: r.priority, reverse=True)
        
        # Step 4: Emit event
        await self._emit_event("recommendations_generated", {
            "count": len(recommendations),
            "top_recommendation": recommendations[0] if recommendations else None,
            "timestamp": datetime.utcnow()
        })
        
        return recommendations
    
    async def _should_pause_campaign(self, campaign: Campaign, metrics: Dict) -> bool:
        """Decision rule: Pause campaign if ROAS < 2.0 and duration >= 7 days"""
        roas = metrics.get("roas")
        days_active = (datetime.utcnow() - campaign.created_at).days
        ctr = metrics.get("ctr")
        
        return (
            (roas < 2.0 and days_active >= 7) or
            (ctr < 0.01 and days_active >= 5)
        )
    
    async def _generate_pause_recommendation(
        self, 
        campaign: Campaign, 
        metrics: Dict
    ) -> Recommendation:
        """Generate a pause recommendation with reasoning + projections"""
        
        roas = metrics["roas"]
        ctr = metrics["ctr"]
        daily_spend = metrics["daily_spend"]
        conversions = metrics["conversions"]
        
        # Determine primary reason
        primary_reason = (
            "ROAS below profitability threshold" if roas < 2.0 
            else "CTR below benchmark"
        )
        
        # Calculate impact score
        impact_score = self._score_pause_recommendation(roas, ctr, metrics["days_active"])
        
        # Estimate weekly savings if paused
        weekly_savings = daily_spend * 7
        estimated_averted_loss = weekly_savings - (conversions * metrics["revenue_per_conversion"])
        
        return Recommendation(
            recommendation_id=uuid.uuid4(),
            recommendation_type="pause_campaign",
            target_entity={"type": "campaign", "id": campaign.id},
            current_metrics=metrics,
            primary_reason=primary_reason,
            impact_score=impact_score,
            projected_impact={
                "weekly_spend_saved": weekly_savings,
                "estimated_averted_losses": estimated_averted_loss,
                "confidence_score": 0.92
            },
            execution_mode="manual",
            auto_execute=False
        )
    
    def _score_pause_recommendation(self, roas: float, ctr: float, days_active: int) -> int:
        """Scoring algorithm for pause recommendation"""
        base = 50
        
        # ROAS component
        if roas < 1.0:
            roas_score = 30
        elif roas < 2.0:
            roas_score = 20 + (2.0 - roas) * 10
        elif roas < 3.0:
            roas_score = 10
        else:
            roas_score = 0
        
        # Duration component
        if days_active < 3:
            duration_score = 0
        elif days_active < 7:
            duration_score = 5
        else:
            duration_score = 10
        
        # CTR component
        if ctr < 0.005:
            ctr_score = 10
        elif ctr < 0.01:
            ctr_score = 5
        else:
            ctr_score = 0
        
        return int(base + roas_score + duration_score + ctr_score)
```

### API Endpoints

```python
# routes/recommendations.py

@router.get("/recommendations")
async def list_recommendations(
    user_id: str,
    role: str,
    min_confidence: float = 0.65,
    limit: int = 10,
    db: Session = Depends(get_db)
) -> List[RecommendationResponse]:
    """
    GET /api/recommendations?user_id=...&role=perf_lead
    
    Returns top 10 recommendations ranked by priority
    """
    engine = RecommendationEngine(db)
    recommendations = await engine.generate_recommendations({
        "user_id": user_id,
        "role": role,
        "min_confidence": min_confidence,
        "include_exploratory": role == "data_science"
    })
    return recommendations[:limit]

@router.get("/recommendations/{recommendation_id}")
async def get_recommendation_detail(
    recommendation_id: str,
    db: Session = Depends(get_db)
) -> RecommendationDetail:
    """
    GET /api/recommendations/uuid-12345
    
    Returns full recommendation detail with all supporting data
    """
    rec = await db.query(Recommendation).filter(
        Recommendation.id == recommendation_id
    ).first()
    return rec.to_detail_response()

@router.post("/recommendations/{recommendation_id}/execute")
async def execute_recommendation(
    recommendation_id: str,
    action: str,  # "approve", "schedule", "dismiss", "modify"
    payload: Dict = None,
    user_id: str = None,
    db: Session = Depends(get_db)
) -> ExecutionResponse:
    """
    POST /api/recommendations/uuid-12345/execute
    body: { "action": "pause_campaign", "campaign_id": "c-456" }
    
    Executes recommendation (pause campaign, reallocate budget, etc.)
    Requires approval from user based on recommendation type
    """
    rec = await db.query(Recommendation).filter(
        Recommendation.id == recommendation_id
    ).first()
    
    # Verify user has authority to execute
    if not await _can_user_execute_recommendation(user_id, rec.recommendation_type):
        raise PermissionError(f"User {user_id} cannot execute {rec.recommendation_type}")
    
    # Execute based on type
    if rec.recommendation_type == "pause_campaign":
        await _execute_pause_campaign(rec, payload)
    elif rec.recommendation_type == "reallocate_budget":
        await _execute_budget_reallocation(rec, payload)
    elif rec.recommendation_type == "test_creative":
        await _execute_creative_test(rec, payload)
    
    # Log execution
    await db.query(RecommendationExecution).insert({
        "recommendation_id": recommendation_id,
        "user_id": user_id,
        "action": action,
        "executed_at": datetime.utcnow()
    })
    
    return ExecutionResponse(status="executed", recommendation_id=recommendation_id)
```

---

# PART 7: 30/60/90 DAY ENGINEERING BACKLOG

## Overview

This section breaks down implementation into three phases:
- **Day 30 (MVP):** Core dashboard with 8 metrics, basic events, real-time data pipeline
- **Day 60 (Enhancement):** All 25 metrics, incrementality testing, data quality monitoring
- **Day 90 (Advanced):** Recommendation engine, ML features, forecasting, optimization

Each phase includes user stories, technical tasks, estimates (story points), dependencies, and acceptance criteria.

---

## Day 30 Milestone: MVP — Core Analytics Dashboard Live

**Goals:**
- ✅ Dashboard accessible to CMO + Perf Lead roles
- ✅ 8 critical metrics calculating correctly
- ✅ Real-time data flowing (5-min freshness)
- ✅ Campaign performance view (leaderboard) operational
- ✅ Basic segment filtering working
- ✅ System health monitoring in place

**Timeline:** January 1-30, 2026

---

### Workstream 1: Backend Metrics & Data Pipeline (Est. 120 pts)

**Epic: Metrics Calculation Engine**

```
STORY 1.1: Implement ROAS metric calculation
As a Data Engineer
I want to calculate ROAS (revenue / spend) for each campaign
So that marketers can see return on ad spend

Story Points: 13

Acceptance Criteria:
✓ ROAS = SUM(order_value FROM orders matched to campaign) / SUM(campaign spend)
✓ Calculation runs every 5 minutes
✓ Handles edge cases (zero spend, no conversions)
✓ Results stored in analytics.campaign_metrics table
✓ Query latency < 1 second for 100 campaigns

Technical Tasks:
- [ ] Write SQL query for ROAS calculation (CTE-based)
- [ ] Create FastAPI endpoint: GET /metrics/roas
- [ ] Add tests (unit + integration)
- [ ] Document query + expected results
- [ ] Set up monitoring/alerting if ROAS invalid

Dependencies:
- orders table populated
- campaign_metrics table exists
- analytics DB accessible
```

```
STORY 1.2: Implement CTR metric calculation
As a Data Engineer
I want to calculate CTR (clicks / impressions) for each campaign
So that marketers can assess engagement

Story Points: 8

Acceptance Criteria:
✓ CTR = SUM(clicks) / SUM(impressions) per campaign
✓ Handles zero-impression campaigns (return NULL, not divide-by-zero)
✓ Updated every 5 minutes
✓ Results in analytics.campaign_metrics
✓ Matches GA/Segment CTR within 1%

Technical Tasks:
- [ ] Query campaign_events for campaign_delivered + campaign_clicked
- [ ] Handle NULL impressions gracefully
- [ ] Create endpoint: GET /metrics/ctr
- [ ] Test with mock data (1M impressions, 10k clicks)
- [ ] Add alerting for CTR < 0.5%

Dependencies:
- analytics.events table with campaign_delivered, campaign_clicked
- Event schema finalized
```

```
STORY 1.3: Implement Conversion Rate metric
Story Points: 8
(Similar structure: clicks to orders conversion; track at campaign level)
```

```
STORY 1.4: Implement CAC (Customer Acquisition Cost) metric
Story Points: 13
Technical: Sum campaign spend, count new customers, divide
Edge case: Identify "new" vs "repeat" customers
```

```
STORY 1.5: Implement AOV (Average Order Value) metric
Story Points: 5
Technical: AVG(order_value) grouped by campaign
```

```
STORY 1.6: Implement LTV (Lifetime Value) metric
Story Points: 21
Technical: SUM(lifetime orders) per user; challenges: retention window (90 days), future projection
```

```
STORY 1.7: Implement Engagement Rate metric (Email/Push)
Story Points: 8
Technical: SUM(opens) / SUM(sends) for campaigns in last 7 days
```

```
STORY 1.8: Implement Budget Utilization % metric
Story Points: 5
Technical: SUM(spend) / campaign.budget * 100; alert if >110%
```

**Epic: Data Pipeline Infrastructure**

```
STORY 1.9: Set up event ingestion pipeline
As an Infrastructure Engineer
I want to ingest 100k+ events/day from mobile + backend
So that metrics are calculated from real user data

Story Points: 21

Acceptance Criteria:
✓ Events from mobile app reach backend
✓ Events from backend services captured
✓ <5 second latency from event to storage
✓ Deduplication working (no duplicate event_ids)
✓ Failed events logged (for debugging)
✓ Throughput: 1k+ events/min sustained

Technical Tasks:
- [ ] Create FastAPI endpoint: POST /api/analytics/events (batched)
- [ ] Validate event schema against JSON schema
- [ ] Store in PostgreSQL analytics.events table
- [ ] Implement deduplication (ON CONFLICT DO NOTHING on event_id)
- [ ] Add retry logic for failed ingestion
- [ ] Test with load generator (50k events, measure latency)

Dependencies:
- analytics.events table created with proper indexes
- Event schema finalized
- Database connection pooling configured
```

```
STORY 1.10: Create metrics aggregation job (batch refresh)
Story Points: 13
Technical: Daily job to calculate all 8 metrics; refresh every 5 mins for active campaigns
```

```
STORY 1.11: Set up data quality checks
Story Points: 13
Technical: Validation rules (timestamp not in future, amounts positive, etc.); alert if pass rate < 95%
```

**Phase 1 Backend Total: 120 pts**

---

### Workstream 2: Frontend Dashboard UI (Est. 100 pts)

**Epic: Core Dashboard Layout & KPI Cards**

```
STORY 2.1: Build dashboard layout with 11 modules
As a Frontend Engineer
I want to create responsive grid layout for 11 dashboard modules
So that all information fits on screen without overwhelming

Story Points: 21

Acceptance Criteria:
✓ Desktop layout (1920x1080): All 11 modules visible without scrolling
✓ Tablet layout (768x1024): Responsive, 2-column grid
✓ Mobile layout (375x667): Stacked, scrollable
✓ Sticky header (KPI cards) on scroll
✓ <2 second initial load time
✓ Passes accessibility audit (WCAG 2.1 AA)

Technical Tasks:
- [ ] Create React component structure (Dashboard > Section > Module)
- [ ] Set up TailwindCSS grid (with responsive breakpoints)
- [ ] Build sticky header with KPI cards
- [ ] Implement error boundaries
- [ ] Create Storybook stories for each layout variant

Dependencies:
- React + TypeScript setup
- TailwindCSS configured
- Metrics APIs ready
```

```
STORY 2.2: Build KPI card component with live updates
Story Points: 13
Technical: Display ROAS, CAC, LTV, Engagement Rate with 5-min refresh
```

```
STORY 2.3: Build campaign leaderboard (sortable table)
Story Points: 13
Technical: Table with campaign name, ROAS, CTR, conversions, spend; sortable by each column
```

```
STORY 2.4: Build segment picker component
Story Points: 8
Technical: Dropdown to select HIGH_SPENDER, FREQUENT_SHOPPER, etc.; filter all metrics by segment
```

```
STORY 2.5: Build date range picker
Story Points: 5
Technical: Select date range (last 7 days, 30 days, custom); apply to all metrics
```

```
STORY 2.6: Build real-time metric update subscription (WebSocket)
Story Points: 21
Technical: WebSocket connection to receive metric updates every 5 min; auto-refresh KPI cards
```

**Phase 1 Frontend Total: 100 pts**

---

### Workstream 3: Mobile & Admin Portal Instrumentation (Est. 40 pts)

**Epic: Mobile App Event Tracking**

```
STORY 3.1: Integrate analytics SDK into mobile app
As a Mobile Engineer
I want to track key user events (campaign_viewed, campaign_clicked, user_purchased)
So that we can measure campaign impact

Story Points: 13

Acceptance Criteria:
✓ Events sent to backend within 10 seconds
✓ Session ID consistent within app session
✓ User ID correctly populated
✓ No PII in event properties (scrub emails, phone)
✓ Batching: up to 100 events per request

Technical Tasks:
- [ ] Create Analytics service class in mobile app
- [ ] Hook into campaign card component (emit campaign_viewed, campaign_clicked)
- [ ] Hook into checkout flow (emit user_purchased)
- [ ] Hook into app lifecycle (emit user_engaged on app_open)
- [ ] Test with mock events; verify backend receives them

Dependencies:
- Backend /api/analytics/events endpoint ready
- Campaign components identified (which files to instrument)
```

```
STORY 3.2: Implement purchase event tracking in checkout
Story Points: 8
Technical: Capture order_id, order_value, promo_code at payment success; emit user_purchased event
```

```
STORY 3.3: Implement unsubscribe tracking
Story Points: 5
Technical: When user taps "unsubscribe" in preferences, emit user_unsubscribed event
```

**Epic: Admin Portal Event Tracking**

```
STORY 3.4: Add campaign action tracking to admin portal
Story Points: 8
Technical: Emit campaign_created, campaign_launched, campaign_paused events when marketer takes action
```

**Phase 1 Mobile + Portal Total: 40 pts**

---

### Workstream 4: DevOps & Infrastructure (Est. 40 pts)

```
STORY 4.1: Set up analytics database schema + indexes
Story Points: 13

Acceptance Criteria:
✓ analytics.events table created with proper columns + constraints
✓ analytics.campaign_metrics table created
✓ Indexes on event_type, timestamp, user_id, campaign_id
✓ Partitioning by date for scalability
✓ Backup strategy in place

Technical Tasks:
- [ ] Write schema.sql with CREATE TABLE statements
- [ ] Create indexes on hot columns
- [ ] Set up daily backups
- [ ] Test restore procedure
- [ ] Document schema + table relationships
```

```
STORY 4.2: Set up monitoring + alerting for metrics pipeline
Story Points: 13

Acceptance Criteria:
✓ Alert if event ingestion drops below 10k/day
✓ Alert if metric calculation takes > 30 seconds
✓ Alert if data freshness > 15 minutes
✓ Dashboard showing pipeline health

Technical Tasks:
- [ ] Configure Prometheus metrics export (from FastAPI)
- [ ] Set up Grafana dashboard for pipeline health
- [ ] Create PagerDuty alerts for critical issues
- [ ] Test alert firing (inject bad data, verify alert)
```

```
STORY 4.3: Set up CI/CD for analytics services
Story Points: 14

Acceptance Criteria:
✓ GitHub Actions runs tests on every PR
✓ Auto-deploy to staging on main branch
✓ Deploy to production requires approval + smoke tests pass
✓ Rollback procedure documented

Technical Tasks:
- [ ] Create GitHub Actions workflow
- [ ] Add test coverage requirements (>80%)
- [ ] Set up staging environment
- [ ] Create deployment checklist + runbook
```

**Phase 1 DevOps Total: 40 pts**

---

### Phase 1 Summary

| Workstream | Story Points | Effort (weeks) | Team |
|-----------|---------|--------|------|
| Backend | 120 | 3 | 2 Data Eng + 1 Platform Eng |
| Frontend | 100 | 2.5 | 2 Frontend Eng |
| Mobile + Portal | 40 | 1 | 1 Mobile Eng |
| DevOps | 40 | 1 | 1 Platform Eng |
| **Total** | **300** | **~4 weeks** | **6-7 people** |

**Phase 1 Go-Live Readiness:**
- ✅ 8 metrics live and validated
- ✅ Dashboard renders without errors
- ✅ 100k+ events/day flowing
- ✅ Data freshness <5 minutes
- ✅ System uptime >95%

---

## Day 60 Milestone: Enhancement — Full Feature Set Live

**Goals:**
- ✅ All 25 metrics calculating + validated
- ✅ Incrementality testing for 50%+ of campaigns
- ✅ Data quality monitoring + anomaly detection
- ✅ A/B testing framework operational
- ✅ Advanced modules (ROI Deep Dive, Creative Breakdown, Compliance Log) live

**Timeline:** January 31 - February 27, 2026

---

### Workstream 1: Advanced Metrics (Est. 85 pts)

```
STORY 5.1: Implement incrementality/holdout group testing
As a Data Science Engineer
I want to measure true campaign impact by comparing treatment vs. holdout groups
So that we can prove incrementality to investors

Story Points: 21

Acceptance Criteria:
✓ 10% of campaign recipients assigned to holdout (no campaign)
✓ Holdout assignment deterministic (same user always in same group)
✓ Incrementality metric = (treatment_conversion_rate - holdout_conversion_rate) / holdout
✓ Calculated daily with confidence intervals
✓ AUC score for model > 0.75

Technical Tasks:
- [ ] Modify campaign delivery to create holdout groups
- [ ] Store holdout assignment in user_segment table
- [ ] Query: SELECT COUNT(conversions) FROM holdout vs treatment
- [ ] Calculate p-value (statistical significance)
- [ ] Create visualization: treatment vs holdout funnel

Dependencies:
- campaign_converted events flowing with accurate attribution
- Statistical test library (scipy.stats) integrated
```

```
STORY 5.2: Implement multi-touch attribution model
Story Points: 13
Technical: Track user journey (view → click → purchase); assign credit via last-touch, first-touch, linear, time-decay
```

```
STORY 5.3: Implement CAC Payback Period metric
Story Points: 8
Technical: Time (weeks) for cumulative LTV to exceed CAC; helps with unit economics
```

```
STORY 5.4: Implement Cohort Retention (30/60/90 day)
Story Points: 13
Technical: Cohort analysis; for users acquired in week X, what % return in week X+4/8/12
```

```
STORY 5.5: Implement advanced engagement metrics (open rate, click rate, frequency)
Story Points: 13
Technical: Email/push specific; SUM(opens) / SUM(sends), etc.
```

**Workstream 1 Total: 85 pts**

---

### Workstream 2: Data Quality & Monitoring (Est. 55 pts)

```
STORY 6.1: Implement anomaly detection system
As a Data Science Engineer
I want to detect unusual patterns in metrics (spikes, drops, zero values)
So that we catch data quality issues immediately

Story Points: 21

Acceptance Criteria:
✓ System detects metric spikes >3σ from 7-day rolling median
✓ System detects drops >30%
✓ System detects zero values when expecting non-zero
✓ Alerts sent to data team within 1 minute
✓ False positive rate <5%

Technical Tasks:
- [ ] Implement statistical anomaly detector (zscore, IQR, etc.)
- [ ] Create anomaly_detected event type
- [ ] Build anomaly dashboard (what anomalies have been detected recently)
- [ ] Test with synthetic data (inject spikes, verify detection)

Dependencies:
- metrics_calculated_completed events flowing
- Time-series data available
```

```
STORY 6.2: Implement data quality monitoring dashboard
Story Points: 13
Technical: Show ingestion rate, validation pass rate, duplicate rate, data freshness, completeness
```

```
STORY 6.3: Implement reconciliation reports (our data vs marketing tools)
Story Points: 13
Technical: Daily report comparing CTR, conversions, spend vs Google Ads, Segment, etc.
```

```
STORY 6.4: Implement late arrival + backfill logic
Story Points: 8
Technical: If event arrives >24h late, backfill into metrics; re-run affected calculations
```

**Workstream 2 Total: 55 pts**

---

### Workstream 3: A/B Testing Framework (Est. 60 pts)

```
STORY 7.1: Implement A/B test creation + management
As a Product Manager
I want to launch creative variant A/B tests from the UI
So that we can test hypotheses and measure CTR/conversion improvements

Story Points: 21

Acceptance Criteria:
✓ UI form to create test (select campaign, control variant, variant, split %)
✓ Test randomly splits users 50/50 or custom split
✓ Results dashboard shows control vs variant performance
✓ Statistical significance indicator (p-value displayed)
✓ Winner declared when p < 0.05 (or manual override)

Technical Tasks:
- [ ] Create test_experiments table in DB
- [ ] Create FastAPI endpoint: POST /experiments (create test)
- [ ] Modify campaign delivery to check if user in test, assign control/variant
- [ ] Implement statistical test (two-proportion z-test)
- [ ] Create results dashboard component

Dependencies:
- campaign_viewed, campaign_clicked events flowing
- analytics.events properly tagged with test_id
```

```
STORY 7.2: Implement test duration + sample size calculator
Story Points: 13
Technical: Based on expected baseline rate, effect size, power; calculate duration needed
```

```
STORY 7.3: Implement test results dashboard
Story Points: 13
Technical: Show control vs variant CTR, conversion rate, ROAS; p-value; confidence intervals
```

```
STORY 7.4: Implement auto-winner + rollout logic
Story Points: 13
Technical: If winner detected, option to auto-rollout variant to 100%; log decision
```

**Workstream 3 Total: 60 pts**

---

### Workstream 4: Frontend Modules (Est. 70 pts)

```
STORY 8.1: Build Creative Breakdown module
As a Performance Lead
I want to see which headlines/bodies/CTAs perform best
So that I can optimize creative direction

Story Points: 21

Acceptance Criteria:
✓ Table showing top 10 creatives by CTR / ROAS
✓ Sortable by each metric
✓ Filter by campaign, date range
✓ Hover to see creative preview (headline + body + CTA)
✓ Performance trend line (CTR over time for each creative)

Technical Tasks:
- [ ] Create component: CreativeBreakdown
- [ ] Query: SELECT creative_id, CTR, ROAS, ... GROUP BY creative_id
- [ ] Add chart: CTR trend line for top 3 creatives
- [ ] Test with 100+ creatives; measure render performance
```

```
STORY 8.2: Build Conversion Funnel module
Story Points: 13
Technical: Waterfall showing delivery → view → click → purchase; drop-off % at each stage
```

```
STORY 8.3: Build Engagement Heatmap module
Story Points: 13
Technical: 2D heatmap (rows = days, cols = hours); color intensity = engagement rate
```

```
STORY 8.4: Build Campaign Detail module (drill-down)
Story Points: 13
Technical: Clicking campaign in leaderboard shows detailed metrics + segment breakdown
```

```
STORY 8.5: Build ROI Deep Dive module
Story Points: 10
Technical: Show treatment vs holdout side-by-side; incrementality %; net margin
```

**Workstream 4 Total: 70 pts**

---

### Workstream 5: Mobile + Backend Instrumentation (Est. 30 pts)

```
STORY 9.1: Implement A/B test event tracking on mobile
Story Points: 8
Technical: Track which variant user received; emit in campaign_viewed + campaign_clicked events
```

```
STORY 9.2: Implement attribution event chain on backend
Story Points: 13
Technical: Link user journey (campaign_viewed → campaign_clicked → user_purchased); emit campaign_converted
```

```
STORY 9.3: Implement segment refresh on mobile
Story Points: 9
Technical: Daily fetch latest user segment from backend; use in analytics events
```

**Workstream 5 Total: 30 pts**

---

### Phase 2 Summary

| Workstream | Story Points | Effort | Team |
|-----------|---------|--------|------|
| Advanced Metrics | 85 | 2.5 weeks | 2 Data Sci + 1 Data Eng |
| Data Quality | 55 | 1.5 weeks | 1 Data Eng |
| A/B Testing | 60 | 2 weeks | 1 Backend + 1 Frontend |
| Frontend Modules | 70 | 2 weeks | 2 Frontend |
| Mobile + Backend | 30 | 1 week | 1 Mobile + 1 Backend |
| **Total** | **300** | **~4 weeks** | **~7-8 people** |

**Phase 2 Go-Live Readiness:**
- ✅ All 25 metrics live and validated (±1%)
- ✅ Incrementality AUC > 0.75
- ✅ A/B testing framework operational (10+ tests running)
- ✅ Data quality monitoring active (anomaly detection working)
- ✅ Advanced dashboard modules fully functional

---

## Day 90 Milestone: Advanced — Recommendation Engine & Optimization Live

**Goals:**
- ✅ Action Center generating 50+ recommendations/week
- ✅ Budget optimization engine running
- ✅ ML features for segment prediction
- ✅ Revenue forecasting (7/30-day projections)
- ✅ Compliance reporting automated

**Timeline:** February 28 - March 31, 2026

---

### Workstream 1: Recommendation Engine (Est. 100 pts)

```
STORY 10.1: Implement recommendation scoring engine
As a Backend Engineer
I want to score recommendations (pause campaign, reallocate budget, test creative)
So that we surface highest-impact actions first

Story Points: 34

Acceptance Criteria:
✓ 10 recommendation types implemented
✓ Each has scoring algorithm (0-100 points)
✓ Confidence scoring (0-1.0) based on data quality
✓ Recommendations ranked by priority (impact × urgency × feasibility)
✓ Generation latency <5 seconds for 100 campaigns

Technical Tasks:
- [ ] Create RecommendationEngine service class (see Part 6)
- [ ] Implement scoring algorithms for all 10 types
- [ ] Create recommendation_generated events
- [ ] Test: generate 100 recommendations, verify scores make sense
- [ ] Add API endpoint: GET /recommendations

Dependencies:
- All 25 metrics live
- campaign_metrics table with proper data
- incrementality calculations available
```

```
STORY 10.2: Implement recommendation explanation + reasoning
Story Points: 13
Technical: For each recommendation, show: primary reason, supporting evidence, alternatives, risk factors
```

```
STORY 10.3: Implement recommendation execution + audit logging
Story Points: 13
Technical: User clicks "Pause Campaign" → executes API call → updates campaign status → logs decision
```

```
STORY 10.4: Build Action Center UI (queue + detail view)
Story Points: 21
Technical: Recommendation queue view + detail view with full reasoning + alternatives (see Part 6)
```

```
STORY 10.5: Implement recommendation A/B testing (measure lift)
Story Points: 19
Technical: Track whether user followed recommendation + measure actual impact
```

**Workstream 1 Total: 100 pts**

---

### Workstream 2: Advanced ML Features (Est. 80 pts)

```
STORY 11.1: Implement customer churn prediction model
As a Data Science Engineer
I want to predict which customers are at risk of churning
So that we can proactively re-engage them

Story Points: 34

Acceptance Criteria:
✓ Model predicts churn probability (0-1.0) for each user
✓ AUC-ROC > 0.80 on validation set
✓ Retrains daily
✓ Features: purchase frequency, spend trend, engagement, days since purchase
✓ Predictions available via API: GET /users/{user_id}/churn_risk

Technical Tasks:
- [ ] Feature engineering: compute user features in DB
- [ ] Train logistic regression model (scikit-learn)
- [ ] Test on 3-month holdout data
- [ ] Create daily retraining job
- [ ] Export predictions to user_metrics table
- [ ] Create alert if churn rate rising

Dependencies:
- user_purchased events flowing
- user_engaged events flowing
```

```
STORY 11.2: Implement next-best-action recommendation model
Story Points: 23
Technical: For each user, recommend best offer type (DISCOUNT, CASHBACK, LOYALTY) based on purchase history
```

```
STORY 11.3: Implement budget allocation optimizer
Story Points: 23
Technical: Given budget constraint, recommend allocation across campaigns to maximize total ROAS
```

**Workstream 2 Total: 80 pts**

---

### Workstream 3: Forecasting & Projection (Est. 50 pts)

```
STORY 12.1: Implement 7-day revenue forecast
As a CMO
I want to see projected revenue for next 7 days
So that I can plan marketing spend

Story Points: 21

Acceptance Criteria:
✓ Forecast generated daily
✓ Accuracy (MAPE) > 85% on validation data
✓ Includes confidence intervals (50%, 80%, 95%)
✓ Breakout by segment
✓ Includes effect of active campaigns

Technical Tasks:
- [ ] Pull historical revenue data (30-day lookback)
- [ ] Implement ARIMA or Prophet model
- [ ] Feature engineer: day-of-week, campaign active, seasonality
- [ ] Validate on holdout period
- [ ] Create forecast table + API endpoint
- [ ] Dashboard: show forecast vs actual (updated daily)
```

```
STORY 12.2: Implement 30-day revenue forecast
Story Points: 21
Technical: Longer horizon; include campaign projections; higher uncertainty bounds
```

```
STORY 12.3: Implement campaign ROI projection
Story Points: 8
Technical: Given campaign parameters, project ROAS + revenue if continues for N days
```

**Workstream 3 Total: 50 pts**

---

### Workstream 4: Compliance & Governance (Est. 40 pts)

```
STORY 13.1: Implement compliance audit log
As a Compliance Officer
I want to see audit trail of all campaigns (created, launched, paused, deleted)
So that we can prove GDPR/CCPA compliance

Story Points: 21

Acceptance Criteria:
✓ Immutable log: campaign ID, action, timestamp, user, reason
✓ PII masking: email/phone never logged
✓ Retention: 7 years minimum
✓ Export: CSV + PDF reports
✓ Module: searchable, filterable by date/campaign/action

Technical Tasks:
- [ ] Create audit_log table (immutable)
- [ ] Emit audit_log events for all campaign actions
- [ ] Implement read-only API: GET /compliance/audit
- [ ] Create Compliance Audit Log UI component
- [ ] Implement export (CSV, JSON, PDF)
- [ ] Test: verify PII is never logged
```

```
STORY 13.2: Implement consent tracking + enforcement
Story Points: 13
Technical: Store user opt-in/opt-out status; enforce at campaign delivery time
```

```
STORY 13.3: Implement GDPR data deletion request handler
Story Points: 6
Technical: When user requests deletion, purge from analytics.events + user_metrics; retain audit log only
```

**Workstream 4 Total: 40 pts**

---

### Workstream 5: Performance & Scale (Est. 50 pts)

```
STORY 14.1: Optimize database queries for 10M+ events/day
As a Data Engineer
I want to ensure queries stay <1 second even at 10x current traffic
So that dashboard remains responsive

Story Points: 21

Acceptance Criteria:
✓ All metric queries run in <1 second
✓ Dashboard initial load <2 seconds
✓ Can handle 10k QPS
✓ Index strategy optimized (no N+1 queries)
✓ Query plans reviewed + approved

Technical Tasks:
- [ ] Profile slow queries (EXPLAIN ANALYZE)
- [ ] Add missing indexes on hot columns
- [ ] Implement materialized views for expensive aggregations
- [ ] Set up query caching (Redis) for stable metrics
- [ ] Load test with 10k concurrent users
- [ ] Document query optimization guidelines
```

```
STORY 14.2: Implement caching strategy (Redis)
Story Points: 13
Technical: Cache metrics for 5 min; invalidate on new events; TTL strategy
```

```
STORY 14.3: Implement rate limiting + authentication
Story Points: 16
Technical: API keys for external integrations; rate limit 100 req/min per key
```

**Workstream 5 Total: 50 pts**

---

### Workstream 6: Mobile & Portal Polish (Est. 30 pts)

```
STORY 15.1: Add offline support to mobile analytics
Story Points: 13
Technical: Queue events locally if network down; sync when online
```

```
STORY 15.2: Implement dashboard theme switching (dark mode)
Story Points: 8
Technical: User preference toggle; persist in localStorage
```

```
STORY 15.3: Implement export functionality (PDF + Excel)
Story Points: 9
Technical: Dashboard → export dashboard snapshot as PDF; metrics table as Excel
```

**Workstream 6 Total: 30 pts**

---

### Phase 3 Summary

| Workstream | Story Points | Effort | Team |
|-----------|---------|--------|------|
| Recommendation Engine | 100 | 3 weeks | 1 Backend + 1 ML Eng + 1 Frontend |
| Advanced ML | 80 | 2.5 weeks | 2 Data Science |
| Forecasting | 50 | 1.5 weeks | 1 Data Science |
| Compliance | 40 | 1 week | 1 Compliance + 1 Backend |
| Performance | 50 | 1.5 weeks | 1 Data Eng + 1 Backend |
| Mobile + Portal | 30 | 1 week | 1 Mobile + 1 Frontend |
| **Total** | **350** | **~4.5 weeks** | **~8-9 people** |

**Phase 3 Go-Live Readiness:**
- ✅ Action Center generating 50+ recommendations/week
- ✅ ML models deployed (churn, next-best-action, budget optimization)
- ✅ Revenue forecasts 85%+ accurate
- ✅ Compliance audit log live + exportable
- ✅ System scales to 10M events/day without degradation
- ✅ Dashboard fully optimized (all queries <1s)

---

## 90-Day Program Summary

### Overall Roadmap

```
Week 1-2  (Jan 1-14):    Backend + Frontend foundation; event pipeline live
Week 3-4  (Jan 15-28):   8 metrics live; basic dashboard operational
Week 5-6  (Jan 29-Feb 11): All 25 metrics; incrementality testing; A/B framework
Week 7-8  (Feb 12-25):   Data quality monitoring; advanced modules; compliance
Week 9-10 (Feb 26-Mar 11): Recommendation engine; churn + budget opt models
Week 11-12 (Mar 12-25):  Forecasting; performance optimization; final polish
Week 13    (Mar 26-31):  Hardening; testing; launch readiness review
```

### Resource Plan

```
Role | Phase 1 | Phase 2 | Phase 3 | Total (FTE)
-----|---------|---------|---------|----------
Backend Engineer | 2 | 1.5 | 2 | ~1.5 FTE over 12 weeks
Frontend Engineer | 2 | 2 | 1.5 | ~1.5 FTE over 12 weeks
Data Engineer | 1 | 1.5 | 2 | ~1.5 FTE over 12 weeks
Data Scientist | 0 | 1 | 2 | ~1 FTE (starts week 5)
Mobile Engineer | 1 | 0.5 | 0.5 | ~0.3 FTE
DevOps Engineer | 1 | 0.5 | 1 | ~0.8 FTE
Product Manager | 1 | 1 | 1 | 1 FTE
QA Engineer | 1 | 1 | 1 | 1 FTE
Compliance | 0 | 0 | 1 | ~0.3 FTE (weeks 9-13)
```

**Total: ~7-8 people, ~12 weeks, ~1000 story points**

### Dependencies & Critical Path

```
Critical Path (must complete in order):
1. Database schema + event ingestion (blocks everything)
2. Backend metrics calculations (blocks frontend)
3. Frontend dashboard (blocks user acceptance)
4. Mobile instrumentation (blocks metrics accuracy)
5. Data quality monitoring (enables A/B testing)
6. A/B testing framework (enables advanced features)
7. Recommendation engine (final feature)

Parallel Workstreams (can happen simultaneously):
- Frontend modules can build in parallel with metrics
- Mobile instrumentation can happen parallel to backend
- DevOps can setup infra while engineers build features
```

### Risk Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Data quality issues causing wrong metrics | HIGH | MEDIUM | Early validation; reconciliation reports with marketing tools |
| Events not flowing from mobile app | HIGH | MEDIUM | Spike integration early; load testing week 1 |
| Database performance degrades at scale | HIGH | LOW | Query optimization + caching from day 1 |
| Team availability / scope creep | MEDIUM | MEDIUM | Strict sprint planning; cut non-critical features |
| Incrementality model accuracy low | MEDIUM | MEDIUM | Start with simple holdout test; iterate |

---

# PART 8: FINAL SPECIFICATION & DEPLOYMENT CHECKLIST

## Table of Contents

This comprehensive specification includes 8 parts:

| Part | Title | Pages | Topics |
|------|-------|-------|--------|
| 1 | Executive Summary | ~15 | Business problem, success criteria, CMO-grade features, 6 stakeholder personas |
| 2 | Dashboard Wireframe | ~20 | 11-module layout, module specs, interaction flows, sample data |
| 3 | Metrics Dictionary | ~25 | 25 metrics with SQL formulas, data sources, visualizations, ownership |
| 4 | Evaluation Rubric | ~20 | 7-category scoring (1-5 pts each), pass/fail gates, readiness thresholds |
| 5 | Instrumentation Plan | ~35 | 20 event types, data collection points, quality framework, 3-phase roadmap |
| 6 | Action Center Logic | ~45 | 10 recommendation types, scoring algorithms, backend service, UX flows |
| 7 | 30/60/90 Day Backlog | ~40 | 1000 story points across 3 phases, resource planning, critical path |
| 8 | Deployment Checklist | ~20 | Pre-launch tasks, runbook, monitoring, rollback, success metrics |
| **Total** | **Complete Specification** | **~220 pages** | **Enterprise-ready analytics platform** |

---

## Quick Reference Guide

### MVP Metrics (Day 30)
- ROAS, CTR, Conversion Rate, CAC, AOV, LTV, Engagement Rate, Budget Utilization %

### Full Metrics (Day 60)
- All 8 MVP + CAC Payback Period, Repeat Purchase Rate, Gross Margin, Cohort Retention, Open Rate, Click Rate, Avg Frequency, Time to Conversion, Incrementality %, Holdout Lift, Net Incremental Revenue, Attribution Model, Data Freshness, Model Accuracy, System Uptime, Cost Per Query

### 10 Recommendation Types
1. Pause Campaign (ROAS < 2.0x for 7+ days)
2. Reallocate Budget (move to high performer)
3. Test Creative (improve CTR via A/B)
4. Expand/Focus Segment (scale/cut)
5. Adjust Frequency (reduce unsubscribes)
6. Budget Increase (capitalize on winners)
7. Change Targeting (leverage anomalies)
8. Launch Holdout (measure incrementality)
9. Improve Data Quality (system health)
10. Compliance Flag (immediate risk)

### Key Success Metrics

| Metric | Target | Cadence | Owner |
|--------|--------|---------|-------|
| Campaign ROAS | 3.5x+ | Daily | Perf Lead |
| Incrementality % | 40%+ | Weekly | CMO |
| Dashboard Uptime | 99.5%+ | Continuous | Engineering |
| Data Freshness | <5 min | Continuous | Data Eng |
| User Adoption | 70%+ trained | Weekly | Product |
| Recommendation Accept Rate | 30%+ | Weekly | Product |

---

## Pre-Launch Deployment Checklist

### Database & Infrastructure (Target: Complete by Day 10)

**Database Setup:**
- [ ] PostgreSQL analytics schema created + tested
  - [ ] analytics.events table with proper constraints + indexes
  - [ ] analytics.campaign_metrics table
  - [ ] analytics.data_quality_log table
  - [ ] analytics.model_predictions table
  - [ ] Daily partitioning by date configured
- [ ] Backup strategy implemented + tested
  - [ ] Daily backups scheduled
  - [ ] Restore procedure tested (full + point-in-time)
  - [ ] Backup retention: 90 days
- [ ] Database monitoring + alerting active
  - [ ] Alert if CPU > 80%
  - [ ] Alert if disk > 85%
  - [ ] Alert if replication lag > 10s
  - [ ] Query performance baseline captured

**Infrastructure Setup:**
- [ ] Kubernetes cluster (or container orchestration) configured
  - [ ] 3+ node clusters for HA
  - [ ] Auto-scaling policies set (scale up if CPU > 70%)
  - [ ] Pod disruption budgets configured
- [ ] Load balancer configured
  - [ ] Health checks every 10s
  - [ ] Sticky sessions enabled for admin portal
- [ ] SSL/TLS certificates provisioned
  - [ ] All endpoints HTTPS
  - [ ] Certificate renewal automated
- [ ] VPC networking configured
  - [ ] Database not accessible from internet
  - [ ] Analytics service internal only
  - [ ] Firewall rules restrictive

**Monitoring & Alerting:**
- [ ] Prometheus metrics export configured
- [ ] Grafana dashboards created
  - [ ] Infrastructure health (CPU, memory, disk, network)
  - [ ] Pipeline health (event rate, freshness, error rate)
  - [ ] Application performance (API latency, error rate, QPS)
- [ ] PagerDuty alerts configured
  - [ ] SEV1: System down, data loss
  - [ ] SEV2: Degraded performance, data quality
  - [ ] SEV3: Non-critical issues
- [ ] Logging aggregation (ELK / DataDog)
  - [ ] All services sending logs
  - [ ] 30-day retention
  - [ ] Keyword alerts for "ERROR" set up

---

### Backend Services (Target: Complete by Day 15)

**API Services:**
- [ ] Metrics calculation service deployed
  - [ ] All 8 MVP metrics tested
  - [ ] Query latency < 1 sec per metric
  - [ ] Calculation job runs every 5 min (success rate 99%+)
  - [ ] Error handling + retry logic working
- [ ] Event ingestion service deployed
  - [ ] POST /api/analytics/events endpoint working
  - [ ] Batch processing (1k+ events/min)
  - [ ] Deduplication logic tested
  - [ ] Event validation passing >95%
- [ ] Authentication + authorization working
  - [ ] API keys issued to frontend/mobile
  - [ ] Rate limiting active (100 req/min per key)
  - [ ] CORS properly configured
- [ ] Error handling + logging
  - [ ] All errors logged with request ID
  - [ ] Errors returned with user-friendly messages
  - [ ] No sensitive data in error messages

**Data Pipeline:**
- [ ] ETL jobs scheduled + tested
  - [ ] Daily aggregation jobs running successfully
  - [ ] Data quality checks passing >95%
  - [ ] Failed rows logged for investigation
  - [ ] Alerting for pipeline failures configured
- [ ] Data validation rules implemented
  - [ ] Null ID validation
  - [ ] UUID format validation
  - [ ] Timestamp range validation (not future, not >30 days old)
  - [ ] Amount validation (positive values)
- [ ] Backfill process documented + tested
  - [ ] Late arrival handling (>24h old)
  - [ ] Ability to recompute metrics from raw events
  - [ ] Rollback procedure tested

**Database:**
- [ ] Schema + indexes created + tested
  - [ ] Queries executing in <1 sec
  - [ ] No N+1 queries
  - [ ] Stats updated after initial load
- [ ] Data quality baseline established
  - [ ] Row counts per table
  - [ ] Sample data verified by business team
  - [ ] Reconciliation with marketing tools within 1%

---

### Frontend Dashboard (Target: Complete by Day 18)

**Dashboard Components:**
- [ ] All 11 modules rendering without errors
  - [ ] KPI cards loading + refreshing
  - [ ] Campaign leaderboard displaying correctly
  - [ ] Segment picker functional
  - [ ] Campaign detail drilldown working
  - [ ] Advanced modules (creative breakdown, funnel, etc.) showing data
- [ ] Responsiveness tested
  - [ ] Desktop (1920x1080): All modules visible
  - [ ] Tablet (768x1024): Layout reflows correctly
  - [ ] Mobile (375x667): Scrollable, readable
- [ ] Performance optimized
  - [ ] Initial load < 2 seconds
  - [ ] Metric refresh < 500ms
  - [ ] No layout shift after load (CLS < 0.1)
  - [ ] Lighthouse score > 90
- [ ] Accessibility verified
  - [ ] WCAG 2.1 AA compliance
  - [ ] Keyboard navigation working
  - [ ] Screen reader friendly
  - [ ] Color contrast > 4.5:1

**Features:**
- [ ] Role-based access control working
  - [ ] CMO sees all campaigns + budgets
  - [ ] Perf Lead sees metrics + creative breakdown
  - [ ] Compliance Officer sees audit log
  - [ ] Data Science sees model metrics
- [ ] Filters + date ranges working
  - [ ] Campaign filter
  - [ ] Segment filter
  - [ ] Date range picker
  - [ ] Filters persist in URL
- [ ] Export functionality working
  - [ ] CSV export of metrics
  - [ ] PDF export of dashboard snapshot
- [ ] Notifications working
  - [ ] Alerts for anomalies
  - [ ] Recommendation alerts
  - [ ] Email digest (opt-in)

**Testing:**
- [ ] Unit tests written + passing
  - [ ] Components render correctly
  - [ ] Props handled properly
  - [ ] Edge cases handled
- [ ] Integration tests written + passing
  - [ ] Data loads from API
  - [ ] Filters update view correctly
  - [ ] Exports work end-to-end
- [ ] E2E tests in Cypress/Playwright
  - [ ] User journeys tested
  - [ ] Cross-browser compatibility verified (Chrome, Safari, Firefox)
  - [ ] Mobile browser testing done

---

### Mobile & Admin Portal Instrumentation (Target: Complete by Day 18)

**Mobile App:**
- [ ] Analytics SDK integrated + working
  - [ ] Events sending to backend
  - [ ] Session tracking working
  - [ ] User ID correctly populated
  - [ ] Batching working (100 events per batch)
  - [ ] Offline queuing working (queue events when offline)
- [ ] Campaign events tracked
  - [ ] campaign_viewed: 100+ test events sent
  - [ ] campaign_clicked: Verified in backend logs
  - [ ] user_purchased: Order data captured correctly
  - [ ] user_engaged: App open + screen view tracked
- [ ] Data quality verified
  - [ ] No PII in events (emails masked, phone removed)
  - [ ] Timestamps correct (not in future)
  - [ ] User IDs match authenticated users
- [ ] Testing on real devices
  - [ ] iOS device: Events flowing
  - [ ] Android device: Events flowing
  - [ ] Network issues handled gracefully

**Admin Portal:**
- [ ] Campaign actions tracked
  - [ ] campaign_created event: Emitted correctly
  - [ ] campaign_launched event: Data captured
  - [ ] campaign_paused event: Working properly
  - [ ] budget_reallocated event: Amounts correct
- [ ] Dashboard usage tracked
  - [ ] dashboard_accessed events generated
  - [ ] Time spent calculated
  - [ ] Section/module clicks recorded
- [ ] A/B testing events
  - [ ] creative_variant_tested event format correct
  - [ ] Test randomization working
  - [ ] Results calculation accurate

---

### Data Quality & Monitoring (Target: Complete by Day 20)

**Data Quality Checks:**
- [ ] Validation rules passing >95% of events
  - [ ] Non-null ID validation
  - [ ] UUID format validation
  - [ ] Timestamp validation
  - [ ] Amount range validation
- [ ] Deduplication working
  - [ ] 0% duplicate events in production
  - [ ] Late arrivals (>24h old) handled correctly
  - [ ] Event_id uniqueness enforced at DB level
- [ ] Anomaly detection baseline established
  - [ ] Metrics baseline captured (last 30 days)
  - [ ] Anomaly detection algorithm configured
  - [ ] False positive rate < 5% on test data
- [ ] Reconciliation process established
  - [ ] Daily reconciliation job running
  - [ ] CTR within 1% of marketing platform (e.g., Segment)
  - [ ] Spend matches campaign management system
  - [ ] Order totals match accounting system
- [ ] Data quality monitoring dashboard live
  - [ ] Ingestion rate monitoring
  - [ ] Validation pass rate displayed
  - [ ] Data freshness metrics
  - [ ] Duplicate detection results
  - [ ] Anomaly flagging log

**Alerting:**
- [ ] Critical alerts configured
  - [ ] Ingestion rate drops below 10k/day
  - [ ] Validation pass rate < 95%
  - [ ] Data freshness > 15 min
  - [ ] Database errors > 5% of requests
- [ ] Testing + verification
  - [ ] Inject bad data, verify alert fires
  - [ ] Stop metrics job, verify alert
  - [ ] Fill up disk 90%, verify alert
  - [ ] PagerDuty notification working

---

### User Adoption & Training (Target: Complete by Day 22)

**Documentation:**
- [ ] User guides written + reviewed
  - [ ] Dashboard user guide (how to read metrics)
  - [ ] Segment selection guide
  - [ ] Recommendation interpretation guide
  - [ ] Compliance/audit log guide
- [ ] Video tutorials recorded
  - [ ] "Getting Started" (5 min)
  - [ ] "Reading Your Campaign KPIs" (5 min)
  - [ ] "Using the Action Center" (5 min)
  - [ ] "Interpreting A/B Tests" (5 min)
- [ ] FAQ document created
  - [ ] "Why is my ROAS so low?"
  - [ ] "How is incrementality calculated?"
  - [ ] "What's a holdout group?"
  - [ ] "Why doesn't my CTR match Google Ads?"
- [ ] Runbook created for support team
  - [ ] Common issues + solutions
  - [ ] Escalation path defined
  - [ ] Known limitations documented

**Training:**
- [ ] Training sessions scheduled
  - [ ] CMO training (30 min): Dashboard, KPIs, decision-making
  - [ ] Perf Lead training (45 min): Metrics, A/B testing, recommendations
  - [ ] Rewards PM training (30 min): Segment analysis, LTV, economics
  - [ ] Data Science training (60 min): Model details, incremental ity, forecast interpretation
  - [ ] Compliance training (30 min): Audit log, data access, GDPR
- [ ] Attendance tracking
  - [ ] Target: 70%+ of team trained before launch
  - [ ] Sign-off document collected
- [ ] Feedback collected
  - [ ] Post-training survey sent
  - [ ] Common questions/pain points identified
  - [ ] Follow-up training scheduled if needed
- [ ] Support process established
  - [ ] Slack channel for questions
  - [ ] Office hours scheduled (weekly)
  - [ ] Response SLA: 24 hours for non-critical, 1 hour for critical

---

### Security & Compliance (Target: Complete by Day 23)

**Security:**
- [ ] API authentication working
  - [ ] All endpoints require API key or auth token
  - [ ] Rate limiting enforced
  - [ ] No sensitive data in logs
- [ ] Data encryption
  - [ ] Database passwords encrypted
  - [ ] API keys never logged in plaintext
  - [ ] Transit encryption (HTTPS) enforced
- [ ] Access control
  - [ ] RBAC implemented (CMO, Perf Lead, Compliance, etc.)
  - [ ] Audit log of all data access
  - [ ] PII masking rules enforced (emails, phone numbers)
- [ ] Security testing
  - [ ] Penetration test completed (by external firm, optional)
  - [ ] OWASP Top 10 review done
  - [ ] SQL injection + XSS testing passed

**Compliance:**
- [ ] Legal review completed
  - [ ] Terms of Service reviewed by legal
  - [ ] Privacy Policy updated
  - [ ] GDPR/CCPA compliance verified
- [ ] Audit log implemented
  - [ ] All campaign actions logged (create, launch, pause, delete)
  - [ ] User actions logged (dashboard access, exports)
  - [ ] Log immutability verified
  - [ ] 7-year retention configured
- [ ] Consent tracking
  - [ ] User opt-in/opt-out status captured
  - [ ] Enforcement at campaign delivery (don't send to opted-out users)
  - [ ] Verified with compliance team
- [ ] Data deletion
  - [ ] GDPR deletion request handler working
  - [ ] Purges user from analytics tables
  - [ ] Retains audit log (for legal)
  - [ ] Documented + tested

---

### Testing & QA (Target: Complete by Day 24)

**Functional Testing:**
- [ ] Happy path tested
  - [ ] User logs in → views dashboard → metrics display correctly
  - [ ] User filters by segment → metrics update
  - [ ] User clicks campaign → detail view loads
  - [ ] User hovers over metric → tooltip shows data source
- [ ] Edge cases tested
  - [ ] Zero campaigns: Dashboard handles gracefully
  - [ ] No data for date range: Shows "no data" message
  - [ ] Network timeout: Error message displayed
  - [ ] Invalid credentials: Rejected + error shown
- [ ] Error handling
  - [ ] API errors: User-friendly message shown
  - [ ] Database errors: Logged + user notified
  - [ ] Network errors: Retry logic working
  - [ ] Permission errors: Access denied message shown

**Performance Testing:**
- [ ] Load testing completed
  - [ ] 100 concurrent users: Dashboard responsive
  - [ ] 1000 concurrent users: No errors
  - [ ] API response time tracked (target: <500ms)
  - [ ] Database query time tracked (target: <1s)
- [ ] Stress testing
  - [ ] 10k events/min ingestion tested
  - [ ] Memory usage stable (no leaks)
  - [ ] Recovery after spike documented
- [ ] Scalability assessment
  - [ ] Horizontal scaling tested
  - [ ] Can handle 10x current load documented

**User Acceptance Testing (UAT):**
- [ ] UAT environment matches production
  - [ ] Same data volume (anonymized)
  - [ ] Same infrastructure setup
  - [ ] Same third-party integrations (Segment, GA, etc.)
- [ ] Business team testing
  - [ ] CMO: Tests that ROAS matches expectations
  - [ ] Perf Lead: Tests CTR + conversion metrics
  - [ ] Data Science: Tests incrementality calculations
  - [ ] Compliance: Tests audit log + access control
- [ ] Sign-off obtained
  - [ ] Business approval form signed
  - [ ] Known issues documented
  - [ ] Go/no-go decision recorded

---

### Final Verification (Target: Complete by Day 25)

**Production Readiness:**
- [ ] All checklist items above verified + signed off
- [ ] Runbook reviewed + tested by team
- [ ] Rollback procedure tested + documented
- [ ] Incident response plan in place
- [ ] On-call rotation established
- [ ] Post-launch monitoring plan finalized

**Communication Plan:**
- [ ] Launch announcement prepared (CEO + team)
- [ ] Internal comms scheduled
  - [ ] Day -1: "Going live tomorrow"
  - [ ] Day 0 (morning): "We're live!"
  - [ ] Day 0 (evening): "First insights"
- [ ] External comms (if applicable)
  - [ ] Press release drafted
  - [ ] Investor update prepared
- [ ] Escalation contacts established
  - [ ] Engineering lead: [Name, phone, email]
  - [ ] Product lead: [Name, phone, email]
  - [ ] Data lead: [Name, phone, email]

---

## Deployment Runbook

### Pre-Deployment (T-2 Hours)

1. **Database backup**
   ```bash
   # Full backup of production database
   pg_dump --host=prod-db --username=admin --format=custom \
     swipesavvy_analytics > backup_$(date +%Y%m%d_%H%M%S).sql
   # Verify backup file size > 1GB
   ```

2. **Notify team**
   - Send Slack message to #analytics-team: "Deployment starting at [time]"
   - Ensure on-call engineer is available
   - Pause any non-urgent database operations

3. **Health check (current system)**
   ```bash
   # Verify current system healthy
   curl -s https://analytics.swipesavvy.com/health | jq
   # Check: status = "healthy", uptime > 1 hour
   ```

### Deployment (T-0 to T+30 Min)

**Phase 1: Database Migrations (T-0 to T+5)**
```bash
# Run schema migrations
psql --host=prod-db --username=admin swipesavvy_analytics < migrations/001_schema.sql
psql --host=prod-db --username=admin swipesavvy_analytics < migrations/002_indexes.sql
psql --host=prod-db --username=admin swipesavvy_analytics < migrations/003_triggers.sql

# Verify tables created
psql --host=prod-db --username=admin swipesavvy_analytics \
  --command="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='analytics';"
# Expected: 4 tables (events, campaign_metrics, data_quality_log, model_predictions)
```

**Phase 2: Backend Services (T+5 to T+15)**
```bash
# Deploy backend services (Docker containers)
kubectl set image deployment/metrics-service \
  metrics-service=analytics:v1.0.0 --record

kubectl set image deployment/event-service \
  event-service=analytics:v1.0.0 --record

kubectl set image deployment/recommendation-service \
  recommendation-service=analytics:v1.0.0 --record

# Wait for rollout
kubectl rollout status deployment/metrics-service --timeout=5m
kubectl rollout status deployment/event-service --timeout=5m
kubectl rollout status deployment/recommendation-service --timeout=5m

# Health checks
curl -s https://api.analytics.swipesavvy.com/health | jq
```

**Phase 3: Frontend (T+15 to T+20)**
```bash
# Deploy frontend
kubectl set image deployment/analytics-dashboard \
  dashboard=analytics-ui:v1.0.0 --record

kubectl rollout status deployment/analytics-dashboard --timeout=5m

# Verify via web
curl -s https://analytics.swipesavvy.com | grep -i "dashboard" | head -5
```

**Phase 4: Smoke Tests (T+20 to T+30)**
```bash
# Test event ingestion
curl -X POST https://api.analytics.swipesavvy.com/api/analytics/events \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "campaign_delivered",
    "campaign_id": "test-campaign-123",
    "user_id": "test-user-456",
    "timestamp": "2026-01-01T00:00:00Z"
  }'
# Expected: 200 OK

# Test metrics API
curl -s https://api.analytics.swipesavvy.com/metrics/roas?campaign_id=top_campaign | jq
# Expected: { "roas": 3.5, "confidence": 0.92 }

# Test dashboard loads
curl -s https://analytics.swipesavvy.com | grep -c "Action Center"
# Expected: > 0

# Check error logs
kubectl logs deployment/metrics-service --tail=50 | grep -i error
# Expected: No ERROR entries
```

---

## Post-Launch Monitoring Plan

### First 24 Hours (Intensive)

**Monitoring Dashboard (Grafana)**
- Panel 1: Event ingestion rate (should be >10k/hour)
- Panel 2: Metrics API latency (should be <500ms p95)
- Panel 3: Database CPU (should be <60%)
- Panel 4: Error rate (should be <1%)
- Panel 5: Dashboard page load time (should be <2s)

**Alarms to Watch**
- Event ingestion rate < 5k/hour → Page on-call engineer
- API error rate > 5% → Page on-call engineer
- Database CPU > 80% → Investigate + consider scaling
- Dashboard uptime < 99% → Investigate + consider rollback

**Actions if Issues**
- If event ingestion down: Check mobile app SDK; verify API keys; check backend logs
- If metrics wrong: Re-run validation against known good data; check SQL formulas
- If performance bad: Check database query execution; verify indexes; check for resource contention
- If critical issue: Trigger rollback procedure (see below)

### Days 2-7 (Elevated)

**Daily Review**
- Morning: Review overnight logs + alerts
- Afternoon: Metrics reconciliation (vs. marketing tools)
- Evening: Team sync on issues + resolutions

**Monitoring Focus**
- Data quality: Validation pass rate, duplicate rate, late arrivals
- Metrics accuracy: Compare ROAS, CTR, LTV with manual calculations (sample 10 campaigns)
- Performance: API latency p95/p99, database query time distribution
- User adoption: Dashboard login count, feature usage, error count from frontend

**Actions**
- If data quality issue: Pause metrics, investigate, backfill
- If metrics inaccurate: Audit SQL formulas, check data sources, recalculate
- If performance degraded: Optimize queries, add indexes, scale services
- If users struggling: Send tips via Slack, offer extra training, fix UX issues

### Weeks 2-4 (Monitoring)

**Weekly Reviews**
- Monday 10am: Full team sync (engineering, product, business)
- Wednesday: Data quality deep-dive (with data lead)
- Friday: User feedback review + feature requests

**Metrics to Track**
- System health: Uptime %, query latency, error rate
- Data quality: Ingestion rate, validation pass rate, reconciliation variance
- User adoption: Active users, features used, session duration, NPS
- Business impact: Recommendations generated, accepted, impact measured

---

## Rollback Procedure

**Trigger Rollback If:**
- System uptime < 95% for >1 hour
- Data corruption detected
- Metrics wildly inaccurate (>10% variance)
- Critical security vulnerability discovered
- Business has decided to abort

**Rollback Steps (T-0 to T+15 Min):**

1. **Notify team** (T-0)
   - Announce in Slack: "ROLLBACK IN PROGRESS"
   - Alert stakeholders

2. **Pause ingestion** (T-2)
   ```bash
   # Stop backend from accepting events (temporarily)
   kubectl patch deployment event-service -p '{"spec":{"replicas":0}}'
   ```

3. **Restore database** (T-5)
   ```bash
   # Restore from backup taken before deployment
   pg_restore --host=prod-db --username=admin --clean \
     --dbname=swipesavvy_analytics backup_20260101_000000.sql
   # Verify restore succeeded
   ```

4. **Roll back services** (T-10)
   ```bash
   # Revert to previous version
   kubectl rollout undo deployment/metrics-service
   kubectl rollout undo deployment/event-service
   kubectl rollout undo deployment/analytics-dashboard
   
   # Wait for rollout
   kubectl rollout status deployment/metrics-service --timeout=5m
   ```

5. **Verification** (T+15)
   ```bash
   # Verify previous version running
   kubectl get pods -l app=metrics-service
   
   # Health check
   curl -s https://api.analytics.swipesavvy.com/health
   
   # Dashboard accessible
   curl -s https://analytics.swipesavvy.com | head -20
   ```

6. **Communication** (T+15)
   - Post-mortem: "We've rolled back to previous version"
   - Investigation: "We'll investigate X and retry deployment"
   - Schedule: "Retry deployment on [date/time]"

---

## Success Metrics & KPIs

### Launch Success Criteria

| Metric | Target | Threshold | Owner |
|--------|--------|-----------|-------|
| **System Uptime** | 99.5%+ | <95% = rollback | Engineering |
| **Data Freshness** | <5 min | >15 min = alert | Data Eng |
| **Metrics Accuracy** | ±1% vs manual | >5% variance = investigate | Data Science |
| **Dashboard Load Time** | <2s | >5s = optimize | Frontend |
| **API Error Rate** | <1% | >5% = page on-call | Backend |
| **User Adoption** | 70%+ trained | <50% = extend training | Product |

### 90-Day Business Impact Targets

| Metric | Target | Timeline |
|--------|--------|----------|
| **Marketing Efficiency** | +5% | Day 30 (from recommendations) |
| **Campaign ROI** | +8% | Day 60 (from optimization) |
| **Time to Decision** | -70% | Day 30 (faster insights) |
| **Team Productivity** | +20 hours/week saved | Day 60 (automated reporting) |
| **Incrementality Proof** | 40%+ | Day 60 (for Series A) |
| **Churn Reduction** | -3% | Day 90 (from predictions) |

---

## Series A Pitch Talking Points

### Problem Solved
"SwipeSavvy had zero visibility into true campaign ROI. Without incrementality testing or attribution, we couldn't prove marketing impact to investors or optimize budget allocation. Traditional BI tools required months of implementation and didn't provide actionable recommendations."

### Solution Built
"We built an AI-powered marketing analytics platform that:
- Measures true incrementality vs. baseline behavior (holdout testing)
- Provides 10 automated recommendation types (pause, reallocate, test creative, etc.)
- Predicts customer churn + next-best-actions
- Forecasts 7/30-day revenue with 85%+ accuracy
- Delivers 25 metrics in real-time (5-min freshness)
- Maintains full audit trail for compliance (GDPR/CCPA)"

### Key Metrics to Show
- **Incrementality Rate:** 40%+ of campaign impact is truly incremental
- **Campaign ROAS:** Increased from 2.2x to 3.5x (59% improvement) via analytics-driven optimization
- **Time to Insight:** Decreased from 2 weeks (manual analysis) to 5 minutes (dashboard)
- **Marketing Efficiency:** +5% revenue from recommendations in first 30 days
- **Churn Prevention:** Identified 12% of users at risk, recovered 8% retention

### Competitive Advantage
- **Speed:** Real-time insights vs. competitors' daily/weekly reporting
- **Automation:** 50+ recommendations/week generated automatically vs. manual analysis
- **Accuracy:** 40%+ incrementality measurement (many competitors can't measure this)
- **Integration:** Works with existing stack (Segment, GA, campaign manager tools)
- **Compliance:** Purpose-built for GDPR/CCPA from day 1

### Go-to-Market
- **Day 1 (Launch):** Internal team access + CMO dashboard live
- **Month 1:** Perf Lead + Rewards PM training + initial recommendations
- **Month 2:** A/B testing framework live + ML features online
- **Month 3:** Action Center recommendations auto-executing + forecasting live

### Financial Impact (Example Numbers)
- **Marketing spend:** $500k/month
- **Incrementality unlock:** +$100k/month (20% of spend was waste, now optimized)
- **Churn prevention:** -$50k/month (retain 8% more customers at $6k CAC)
- **Net impact:** +$150k/month (+30% marketing efficiency) OR cut spend by 20% while maintaining same output

---

## Implementation Success Factors

**Critical for Success:**
1. **Commitment:** C-suite + product + engineering aligned on 12-week timeline
2. **Data Quality:** Ensure campaign/order/user data is clean before analytics depends on it
3. **Instrumentation:** Mobile + backend must emit events correctly; don't rush this
4. **Validation:** Manually verify metrics match expected values (sample 10 campaigns)
5. **Training:** 70%+ team trained before launch; live training + office hours critical
6. **Support:** Dedicated on-call for first month; Slack channel for questions

**Common Pitfalls to Avoid:**
1. Starting with too many metrics (stick to MVP 8 for first 30 days)
2. Skipping data quality checks (leads to wrong metric values)
3. Not coordinating with mobile team early (event tracking integration late)
4. Deploying without runbook/rollback plan (unable to recover from issues)
5. Launching without user training (adoption fails)

---

## Conclusion

This 8-part AI Marketing Analytics Specification provides everything needed to build and deploy an enterprise-grade analytics platform for SwipeSavvy.

**What You Get:**
- ✅ Complete analytics architecture (25 metrics, 11 dashboard modules, 10 recommendation types)
- ✅ Detailed technical specifications (SQL formulas, event schemas, algorithms, APIs)
- ✅ Full implementation roadmap (1000 story points, 12-week timeline, 8-person team)
- ✅ Deployment guide (pre-launch checklist, runbook, rollback, monitoring)
- ✅ Investor-ready proof of marketing ROI (incrementality, forecasting, recommendations)

**Next Actions:**
1. **Week 1:** Review specification; assign teams to workstreams
2. **Week 2:** Spike on database schema + event integration (de-risk critical path)
3. **Week 3:** Start Phase 1 development (backend metrics + frontend MVP)
4. **Week 4-6:** Build Phase 1 (parallel workstreams)
5. **Week 7-10:** Build Phase 2 (A/B testing, data quality, advanced metrics)
6. **Week 11-14:** Build Phase 3 (recommendations, ML, forecasting)
7. **Week 15:** Deploy + launch to users

**Success Criteria:**
- 🎯 Day 30: 8 metrics live, dashboard operational, 70%+ team trained
- 🎯 Day 60: All 25 metrics, A/B testing, incrementality AUC > 0.75
- 🎯 Day 90: Recommendations generating, ML models deployed, ready for Series A pitch

---

**Specification Complete**

*This comprehensive specification is ready for implementation. Good luck!*

