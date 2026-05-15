# Shop Savvy POS — R1 Skill Assessment (Vashishta Reddy)

**Branch:** `skill-assessment/vashishta-reddy`
**Window:** Friday, May 15, 2026 — 1:00 PM ET (17:00 UTC) → 5:00 PM ET (21:00 UTC)
**Hard expiry:** 5:00 PM ET. Workstation auto-terminates at 5:10 PM ET.
**Final commit must be pushed by:** 4:55 PM ET.

> This file mirrors the brief sent in your pre-arrival email. The email is authoritative if anything conflicts. The 7 deliverables are **all required** — partial submissions will not be considered.

---

## Build target: Rewards Performance Analytics Module

Build a new **Rewards Performance Analytics** page in `swipesavvy-admin-portal/` that surfaces the operational reporting the rewards team needs day-to-day:

- Who's earning
- Who's redeeming
- Where the funnel breaks down
- How each tier is performing across the merchant network

**The frontend is the real ask.** The backend service that would feed it is your design memo (deliverable #7).

---

## The 7 Deliverables — All Required

### 1. Module structure
- New route `/analytics/rewards-performance` wired into `swipesavvy-admin-portal/src/router/AppRoutes.tsx`
- New page component under `src/features/rewards-analytics/` with sub-components
- Mirror the existing `src/features/dashboard/EnhancedDashboard.tsx` pattern (layout + lazy-loading)
- Types in `src/types/`
- Defend your file layout in `ARCHITECTURE.md`

### 2. Service / API client layer
- New `src/services/rewardsAnalyticsService.ts` in the admin portal
- Mirror the existing `businessDataService.ts` pattern
- Required methods:
  - `getRewardsActivitySummary`
  - `getTopEarners`
  - `getRedemptionFunnel`
  - `getTierDistribution`
  - `getMerchantBreakdown`
- Strongly-typed responses, auth-header injection, error handling with typed exceptions
- Backend endpoints don't exist yet — **mock the responses** but design URL shapes and request/response contracts as if a Spring Boot service were behind them (your design memo covers the backend)

### 3. Filter + date-range UI
- Reactive filter bar at the top of the page
- Date range picker, merchant multi-select, tier filter
- State synced to URL search params (so reports are shareable / bookmarkable)
- Filter changes trigger refetch
- No external date-picker library required — defend your choice if you add one

### 4. Visualizations (recharts, ≥ 4 chart types)
Use the already-installed `recharts` library. Render at minimum:
1. Time-series **LineChart** of points issued vs redeemed
2. Horizontal **BarChart** of top 10 customers by points balance
3. **FunnelChart** or stacked **BarChart** for the redemption funnel (eligible → viewed → redeemed)
4. **PieChart** or **RadialBar** for tier distribution

Charts must be responsive and styled to match the existing admin portal design system.

### 5. Performance + caching strategy
- Use the already-installed `swr` for data fetching
- Proper key strategy (include all filter inputs)
- `dedupingInterval`, `revalidateOnFocus` tuned for analytics use
- Manual **Refresh** button that bypasses cache
- Avoid the N+1 fetch pattern

This deliverable tests the "interactive speed for large-scale analytical data" claim from your resume.

### 6. Testing
- **Playwright E2E spec** under `swipesavvy-admin-portal/tests/`
- Reference: existing `tests/a11y.spec.ts`
- Cover at minimum:
  - Filter applies and triggers refetch
  - Charts render with the mocked data
  - Error state shows when the service rejects
  - Refresh-button bypasses cache
- Real assertions, not stubs
- Vitest unit tests for the service layer if time permits

### 7. Architecture Discussion
Commit `skill-assessment/ARCHITECTURE.md` at the **repo root** covering:

- **(a)** Backend service you'd build — Spring Boot + REST contract for the 5 endpoints, DB schema choice (PostgreSQL vs Cassandra given the analytics workload), indexing strategy
- **(b)** How Kafka would fit — rewards events streaming into pre-aggregated materialized views vs on-demand queries — tradeoffs
- **(c)** PCI-DSS implications — what reward / transaction data can vs cannot appear in reports, audit logging, role-based field-level redaction
- **(d)** Data-quality / eval harness — how you detect bad upstream events corrupting aggregates
- **(e)** SWR vs TanStack Query — tradeoffs given the existing tech stack
- **(f)** What you'd build in two weeks instead of four hours

---

## Rules of Engagement (recap)

| Rule | Detail |
|---|---|
| Connection method | **VS Code Remote-SSH only.** No raw `ssh`, no IntelliJ remote, no PuTTY, no browser shell, no AWS Session Manager. |
| Monitoring | A monitoring session runs for the full 4 hours. SSH logins, workspace edits, commits, and AWS API events are tracked. |
| 4-hour hard cap | Window expires 5:00 PM ET. Workstation auto-terminates 5:10 PM ET. |
| Submit through GitHub | Push to `skill-assessment/vashishta-reddy` only. Main is protected. |
| Push only from workstation | Workstation-bound deploy key is the only thing with push permission. Personal account is read-only. |
| AI tools | Claude / ChatGPT / Copilot are OK. A follow-up call will ask you to defend your design — if you can't explain your own submission it's a flag. |
| Deadline | Push final commit by 4:55 PM ET. Email Jason at `jason@swipesavvy.com` with subject "Skill Assessment R1 - Vashishta Reddy" linking your branch. |

---

## Notes
- **Submissions missing any deliverable will not be considered.**
- A comment saying "I would do X" is not an implementation.
- An empty test stub does not count.
- `ARCHITECTURE.md` is required, not optional.

Good luck.

— Jason Mayoral, Shop Savvy POS
