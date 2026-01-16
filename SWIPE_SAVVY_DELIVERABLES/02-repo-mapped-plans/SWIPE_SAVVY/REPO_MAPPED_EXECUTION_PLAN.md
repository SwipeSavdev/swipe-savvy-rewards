# 🧭 Swipe Savvy Platform — Repo-Mapped Execution Plan

This is a **template plan**. Replace repo names, owners, endpoints, and timelines with your reality.

## 1) Repo Inventory (assumed)
- `swipesavvy-mobile-app-v2`
- `swipesavvy-wallet-web`
- `swipesavvy-admin-portal`
- `swipesavvy-merchant-portal`
- `swipesavvy-api-gateway`
- `swipesavvy-auth-service`
- `swipesavvy-user-service`
- `swipesavvy-merchant-service`
- `swipesavvy-ledger-service`
- `swipesavvy-payments-service`
- `swipesavvy-rewards-service`
- `swipesavvy-notifications-service`
- `swipesavvy-reporting-service`
- `swipesavvy-ai-services`
- `swipesavvy-infra`

## 2) Mapping: Repo → Type → Primary Responsibilities → Test Gates

| Repo | Type | Responsibilities | Must-Pass Test Gates |
|---|---|---|---|
| `swipesavvy-mobile-app-v2` | frontend | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-wallet-web` | frontend | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-admin-portal` | frontend | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-merchant-portal` | frontend | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-api-gateway` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-auth-service` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-user-service` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-merchant-service` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-ledger-service` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-payments-service` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-rewards-service` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-notifications-service` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-reporting-service` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-ai-services` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |
| `swipesavvy-infra` | backend/service | (fill) | unit, contract, integration, e2e (as applicable) |

## 3) Milestones
1. **Architecture baselining** (Agent A)
2. **Unit test wave 1 (highest risk)** (Agents B/C)
3. **Contracts + integration harness** (Agents D/E)
4. **E2E golden flows** (Agent F)
5. **Load/soak** (Agent G)
6. **CI gating + release governance** (Agent H)

## 4) Environment Variables
- Base URL: `SWIPE_SAVVY_BASE_URL` (for k6)
- E2E URL: `E2E_BASE_URL` (for Playwright)
- Test run id: `TEST_RUN_ID`

## 5) Risk Areas (fill)
- Payments/settlement
- Ledger invariants
- Sync conflicts
- Retry/DLQ behavior
- Peak concurrency

## 6) Commands (examples)
```bash
# Unit tests (JS/TS)
npm test

# Unit tests (Java)
mvn test  # or ./gradlew test

# Playwright
npx playwright test

# k6
export BASE_URL=https://env.example.com
k6 run testing/load/k6/scenarios.js
```
