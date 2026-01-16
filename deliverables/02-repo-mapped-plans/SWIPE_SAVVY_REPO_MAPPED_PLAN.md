# Swipe Savvy Platform — Repo-Mapped Execution Plan

**Last Updated:** 2026-01-16
**Production Server:** 54.224.8.14 (EC2 t3.large)
**Database:** PostgreSQL (RDS)

---

## 1) Repo Inventory (Actual)

| Repo | Location | Status |
|------|----------|--------|
| `swipesavvy-mobile-app-v2` | `/Users/macbookpro/Documents/swipesavvy-mobile-app-v2` | Active - Main monorepo |
| `swipesavvy-ai-agents` | `swipesavvy-mobile-app-v2/swipesavvy-ai-agents/` | Active - Backend API |
| `swipesavvy-admin-portal` | `swipesavvy-mobile-app-v2/swipesavvy-admin-portal/` | Active - Admin Dashboard |
| `swipesavvy-wallet-web` | `swipesavvy-mobile-app-v2/swipesavvy-wallet-web/` | Active - Customer Wallet |

---

## 2) Mapping: Repo → Type → Primary Responsibilities → Test Gates

| Repo | Type | Responsibilities | Must-Pass Test Gates |
|------|------|------------------|---------------------|
| `swipesavvy-mobile-app-v2` | Frontend (React Native + Expo) | Customer mobile app: Authentication, Wallet, Rewards, Card linking, Push notifications, Biometric auth | Unit (Jest), Component (React Testing Library), E2E (Detox) |
| `swipesavvy-ai-agents` | Backend (FastAPI + Python) | Core API: Auth (JWT), Wallet operations, Rewards engine, Merchant management, KYC, Admin RBAC, Marketing AI | Unit (pytest), Integration (pytest + testcontainers), Contract (schemathesis), Load (k6) |
| `swipesavvy-admin-portal` | Frontend (React + Vite) | Admin dashboard: User management, Merchant approval, Analytics, RBAC management, Reports | Unit (Jest), Component (React Testing Library), E2E (Playwright) |
| `swipesavvy-wallet-web` | Frontend (React + Vite) | Customer wallet web: Balance, Transactions, Card management, Transfer, Rewards redemption | Unit (Jest), Component (React Testing Library), E2E (Playwright) |

---

## 3) API Endpoints Inventory

### Authentication (`/api/v1/auth/`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/request-otp` | POST | Public | Request OTP via email (SES) |
| `/auth/verify-otp` | POST | Public | Verify OTP and get JWT token |
| `/auth/refresh` | POST | Bearer | Refresh access token |
| `/auth/logout` | POST | Bearer | Invalidate session |

### Wallet (`/api/v1/wallet/`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/wallet/balance` | GET | Bearer | Get wallet balance |
| `/wallet/transactions` | GET | Bearer | List transactions (paginated) |
| `/wallet/deposit` | POST | Bearer | Deposit funds |
| `/wallet/withdraw` | POST | Bearer | Withdraw funds |
| `/wallet/transfer` | POST | Bearer | Transfer to another user |

### Rewards (`/api/v1/rewards/`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/rewards/points` | GET | Bearer | Get points balance |
| `/rewards/tiers` | GET | Public | List reward tiers |
| `/rewards/boosts` | GET | Bearer | Get available boosts |
| `/rewards/boosts/{id}/activate` | POST | Bearer | Activate a boost |
| `/rewards/leaderboard` | GET | Bearer | Get community leaderboard |
| `/rewards/redeem` | POST | Bearer | Redeem points |

### Admin (`/api/v1/admin/`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/admin/users` | GET | Admin | List all users |
| `/admin/users/{id}` | GET/PUT/DELETE | Admin | Manage user |
| `/admin/merchants` | GET/POST | Admin | Manage merchants |
| `/admin/roles` | GET/POST | Admin | RBAC role management |
| `/admin/policies` | GET/POST | Admin | RBAC policy management |
| `/admin/analytics` | GET | Admin | Dashboard analytics |

### Marketing AI (`/api/v1/marketing/`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/marketing/segments` | GET | Admin | List user segments |
| `/marketing/campaigns` | GET/POST | Admin | Manage campaigns |
| `/marketing/recommendations` | GET | Bearer | Get personalized offers |

---

## 4) Database Schema (Key Tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Customer accounts | id, email, phone, kyc_status, tier, created_at |
| `admin_users` | Admin portal users | id, email, role_id, is_active, last_login |
| `wallet_transactions` | All wallet operations | id, user_id, type, amount, balance_after, idempotency_key |
| `merchants` | Partner merchants | id, name, category, status, reward_rate, created_at |
| `rewards` | Points earned/redeemed | id, user_id, points, source, merchant_id, created_at |
| `roles` | RBAC roles | id, name, is_system_role, permissions |
| `policies` | RBAC policies | id, name, resource, action, effect |
| `linked_banks` | User bank accounts | id, user_id, bank_name, masked_account, plaid_token |
| `cards` | User payment cards | id, user_id, last_four, brand, is_primary |

---

## 5) Milestones & Agent Assignments

| Phase | Agent | Deliverables | Dependencies |
|-------|-------|--------------|--------------|
| 1. Architecture Baseline | Agent A | system-map.md, api-inventory.md, risk-register.md | None |
| 2. Unit Tests (Backend) | Agent B | tests/unit/test_auth.py, test_wallet.py, test_rewards.py | Phase 1 |
| 2. Unit Tests (Frontend) | Agent C | __tests__/components/, __tests__/hooks/, __tests__/stores/ | Phase 1 |
| 3. Integration Tests | Agent D | tests/integration/test_db.py, test_api_flows.py | Phase 2 |
| 3. Contract Tests | Agent E | tests/contract/openapi_spec.yaml, test_contracts.py | Phase 2 |
| 4. E2E Tests | Agent F | testing/e2e/playwright/ | Phase 3 |
| 5. Load Tests | Agent G | testing/load/k6/scenarios.js | Phase 4 |
| 6. CI Gates | Agent H | .github/workflows/quality-gate.yml | Phase 5 |
| Parallel: Security | Agent I | docs/security/audit.md | Any time |

---

## 6) Environment Variables

### Backend (swipesavvy-ai-agents)
```bash
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/swipesavvy
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@swipesavvy.com
REDIS_URL=redis://localhost:6379
```

### Frontend (Mobile/Web)
```bash
EXPO_PUBLIC_API_URL=https://api.swipesavvy.com
EXPO_PUBLIC_WS_URL=wss://api.swipesavvy.com/ws
VITE_API_URL=https://api.swipesavvy.com
VITE_WS_URL=wss://api.swipesavvy.com/ws
```

### Testing
```bash
SWIPE_SAVVY_BASE_URL=http://54.224.8.14:8000
E2E_BASE_URL=http://localhost:3000
TEST_RUN_ID=auto-generated
TEST_DB_URL=postgresql://test:test@localhost:5433/swipesavvy_test
```

---

## 7) Risk Areas & Mitigations

| Risk Area | Impact | Mitigation | Test Coverage |
|-----------|--------|------------|---------------|
| Wallet Balance Consistency | High | Idempotency keys, DB transactions | Integration + Load tests |
| Auth Token Leakage | Critical | Short expiry, secure storage, refresh tokens | Security audit |
| Rewards Calculation Drift | Medium | Fixed-point arithmetic, audit log | Unit + Contract tests |
| Concurrent Wallet Operations | High | Row-level locking, optimistic concurrency | Load tests |
| Data Sync (Mobile ↔ Web ↔ Admin) | Medium | WebSocket events, polling fallback | E2E sync assertions |
| KYC Data Exposure | Critical | Encryption, access logging, RBAC | Security audit |

---

## 8) Commands Reference

### Development
```bash
# Backend
cd swipesavvy-ai-agents
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Mobile App
cd swipesavvy-mobile-app-v2
npm install
npx expo start

# Admin Portal
cd swipesavvy-admin-portal
npm install && npm run dev

# Wallet Web
cd swipesavvy-wallet-web
npm install && npm run dev
```

### Testing
```bash
# Backend unit tests
cd swipesavvy-ai-agents
pytest tests/ -v --cov=app --cov-report=html

# Frontend unit tests
npm test -- --coverage

# E2E tests (Playwright)
npx playwright test

# Load tests (k6)
export BASE_URL=http://54.224.8.14:8000
k6 run testing/load/k6/scenarios.js
```

### Deployment
```bash
# SSH to production
ssh -i ~/.ssh/swipesavvy.pem ec2-user@54.224.8.14

# Restart services
pm2 restart swipesavvy-backend
pm2 restart swipesavvy-admin
pm2 restart swipesavvy-wallet

# View logs
pm2 logs swipesavvy-backend --lines 100

# Check service status
pm2 status
```

---

## 9) CI/CD Pipeline Stages

```yaml
stages:
  - lint          # ESLint, Flake8, Prettier
  - unit-test     # pytest, jest
  - build         # Docker images, npm build
  - integration   # DB tests, API tests
  - contract      # OpenAPI validation
  - e2e           # Playwright smoke tests
  - load          # k6 (staging only)
  - security      # npm audit, safety check
  - deploy        # Staging/Production
```

---

## 10) Quality Gates (Go/No-Go)

| Gate | Threshold | Blocking |
|------|-----------|----------|
| Unit Test Coverage | >= 80% | Yes |
| All Unit Tests Pass | 100% | Yes |
| Integration Tests Pass | 100% | Yes |
| Contract Compliance | 100% | Yes |
| E2E Smoke Tests Pass | 100% | Yes |
| Security Vulnerabilities | 0 Critical/High | Yes |
| Load Test p95 Latency | < 1500ms | No (warning) |
| Load Test Error Rate | < 1% | No (warning) |
