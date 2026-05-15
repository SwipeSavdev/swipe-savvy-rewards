# Rewards Performance Analytics Architecture

## 1. Backend service design

### Service overview
A Spring Boot service would host rewards analytics under a dedicated module such as `shop-savvy-rewards-analytics-service`.
The service would expose REST endpoints for the five required reporting APIs:
- `GET /api/v1/admin/rewards/performance/summary`
- `GET /api/v1/admin/rewards/performance/top-earners`
- `GET /api/v1/admin/rewards/performance/redemption-funnel`
- `GET /api/v1/admin/rewards/performance/tier-distribution`
- `GET /api/v1/admin/rewards/performance/merchant-breakdown`

Each endpoint would accept query parameters for `startDate`, `endDate`, `merchantIds`, and `tiers`.
Responses would be strongly typed DTOs matching the frontend contract.

### Example contract
`GET /api/v1/admin/rewards/performance/summary?startDate=2026-04-16&endDate=2026-05-15&merchantIds=m_1,m_2&tiers=Gold,Platinum`
Response:
```json
{
  "totals": {
    "pointsIssued": 283400,
    "pointsRedeemed": 127800,
    "activeEarners": 8740,
    "activeRedeemers": 3220,
    "redemptionRate": 45.2
  },
  "trend": [
    { "date": "2026-04-16", "issued": 8500, "redeemed": 4200 },
    ...
  ]
}
```

### Data schema and storage choice
For this workload, PostgreSQL is the preferred primary store.
Reasons:
- Strong relational modeling for merchants, customers, and tier membership.
- JSONB and aggregation support for analytics rollups.
- Transactional consistency for reward issuance and redemption events.

Core tables:
- `reward_events` (`id`, `created_at`, `merchant_id`, `customer_id`, `tier`, `points`, `event_type`, `source`, `metadata`)
- `merchant_profiles` (`merchant_id`, `name`, `tier`, `category`, `location`)
- `customer_rewards` (`customer_id`, `tier`, `balance`, `redeemed_total`)
- `reward_aggregates` materialized view for daily KPI slices.

### Index strategy
- `reward_events(created_at, merchant_id, event_type)` for date-range and funnel queries.
- `reward_events(merchant_id, tier)` for merchant/tier breakdown.
- `reward_events(customer_id)` for top-earner aggregation.
- `merchant_profiles(name)` for merchant lookup.

## 2. Kafka integration

Kafka is the right fit for streaming reward lifecycle events.
The pipeline would publish events such as:
- `reward.issued`
- `reward.viewed`
- `reward.redeemed`
- `reward.tier.changed`

A consumer layer would write those events into the analytics store and maintain pre-aggregated views.
Tradeoffs:
- Pre-aggregated materialized views give sub-second dashboard responses for operational reports.
- On-demand queries are simpler but risk slow responses for large time windows or multi-dimensional filters.
- I would use a hybrid architecture: stream events into a materialized view for the common summaries and keep on-demand queries for lower-frequency, detailed merchant troubleshooting.

## 3. PCI-DSS implications

### Field-level redaction examples
- Show customer display name only when the admin role allows it.
- Otherwise show masked identifiers such as `cust_****1234`.
- Never expose card PAN, CVV, card token, raw authorization response, or payment payloads.
- Avoid storing sensitive report filters or customer details in browser localStorage.

Rewards reports must exclude payment-sensitive data.
What is allowed:
- points totals, redemption rates, tier labels, merchant names, counts, performance metrics.
What is forbidden:
- PAN, CVV, cardholder data, full bank account numbers, raw authorization tokens.

Controls:
- Role-based access: only authorized admin/analytics roles may call rewards endpoints.
- Field-level redaction: customer data should be anonymized or scoped to non-sensitive identifiers.
- Audit logging: every report access and refresh should record actor, time, and query parameters.

## 4. Data-quality / evaluation harness

A data-quality harness should detect bad upstream reward events before they corrupt aggregates.
Key policies:
- Event schema validation on ingest (required fields, valid amounts, known event types).
- Duplicate and delta checks to catch repeated reward events.
- Aggregate reconciliation between raw event totals and materialized view totals.

I would also add an evaluation harness that runs known input event batches through the aggregation logic and compares the output against expected dashboard totals. This would catch issues like duplicate earn events, negative redemption values, missing merchant IDs, invalid tier changes, late-arriving events, and stale materialized views before bad data reaches the admin report.

Operational tooling:
- Scheduled validation jobs comparing daily event volumes to expected ranges.
- Alerts for drift, stale materialized views, or sudden spikes.
- Canary queries in lower environments to verify that analytics reports match source-of-truth event data.

## 5. SWR vs TanStack Query

I chose SWR for this frontend feature for these reasons:
- It is already installed and lightweight for read-only dashboard use.
- It supports stale-while-revalidate flows, deduping, and manual refresh semantics.
- The page is primarily reporting and does not need the mutation lifecycle complexity of TanStack Query.

TanStack Query would be a stronger option if the analytics experience required complex cache invalidation, optimistic updates, or multi-page query coordination. For this single-page report, SWR is the appropriate fit.

## 6. What I would build in two weeks instead of four hours

In a full two-week implementation I would add:
- A deployed Spring Boot analytics service with production-ready API contracts.
- Materialized views or a dedicated OLAP store for reward aggregates.
- Export / CSV download support and scheduled report snapshots.
- Permission-based report access and field-level masking.
- More merchant- and customer-level drill-down with joined customer cohort filters.
- Automated backend contract tests and reconciliation checks.

