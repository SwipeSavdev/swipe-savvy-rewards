# Task 7: Comprehensive Test Strategy Implementation
## SwipeSavvy Platform - Test Pyramid & Automation Framework

**Date**: December 26, 2025  
**Status**: In Progress  
**Target**: Release-ready automation framework with 90%+ coverage

---

## 1. Executive Summary

This document implements a **test pyramid strategy** across the SwipeSavvy platform covering:
- **Unit Tests** (fast, isolated, high volume)
- **API/Integration Tests** (service-to-service contracts)
- **Contract Tests** (cross-repo change protection)
- **E2E Tests** (critical user journeys)
- **Security Tests** (OWASP, secrets, dependency scanning)
- **Performance Tests** (load, response time benchmarks)

---

## 2. Test Pyramid Architecture

```
                        ╔════════════════════╗
                        ║  E2E Tests (10%)   ║  → Manual + Critical flows
                        ║  Slow, Real env    ║  → Mobile + Admin portal
                        ╚════════════════════╝
                               △
                              ╱ ╲
                             ╱   ╲
                            ╱     ╲
                ╔═══════════════════════════════╗
                ║ Contract Tests & Security (20%)║
                ║ API contracts (Pact)          ║
                ║ OpenAPI validation            ║
                ║ DAST/dependency scanning      ║
                ╚═══════════════════════════════╝
                           △
                          ╱ ╲
                         ╱   ╲
                        ╱     ╲
        ╔═════════════════════════════════════════╗
        ║   API/Integration Tests (30%)           ║
        ║   Service interactions, webhooks        ║
        ║   Database integration tests            ║
        ║   Third-party sandbox integration       ║
        ╚═════════════════════════════════════════╝
                       △
                      ╱ ╲
                     ╱   ╲
                    ╱     ╲
    ╔═══════════════════════════════════════════════════╗
    ║        Unit Tests (40%)                          ║
    ║        Fast, isolated, high coverage             ║
    ║        Business logic, utilities, models         ║
    ║        Mock all external dependencies            ║
    ╚═══════════════════════════════════════════════════╝
```

---

## 3. Test Strategy by Repository

### 3.1 Mobile App (React Native) - `swipesavvy-mobile-app`

#### Unit Tests (40%)
```bash
# Framework: Jest + React Native Testing Library
# Location: src/**/__tests__/**/*.test.ts(x)
# Target: 85%+ coverage for business logic

jest --coverage --testPathPattern="__tests__" --maxWorkers=4
```

**Coverage targets**:
- Rewards calculation logic: 100%
- Transaction processing: 100%
- Gamification engines: 95%
- Account state management (Zustand): 90%
- Card/wallet utilities: 95%

**Key test modules**:
- `rewards.utils.test.ts` - Reward calculations, tiers, caps
- `transaction.engine.test.ts` - Auth/reversal/refund logic
- `gamification.logic.test.ts` - Badges, streaks, challenges
- `account.state.test.ts` - Redux/Zustand state mutations
- `kyc.validation.test.ts` - Identity verification rules

#### API/Integration Tests (30%)
```bash
# Framework: Jest + Supertest or Axios + MSW (Mock Service Worker)
# Location: src/**/__integration__/**/*.test.ts

jest --testPathPattern="__integration__" --runInBand
```

**Test scenarios**:
- Onboarding flow: signup → KYC/AML → account creation
- Account linking: OAuth redirect → token exchange → account link
- Rewards integration: earn event → service call → balance update
- Donation flow: select charity → API call → confirmation
- Support chat: message send → AI agent response → escalation

#### Contract Tests (20%)
```bash
# Framework: Pact or OpenAPI schema validation
# Location: tests/contracts/

pact-foundation verify --provider-base-url=http://localhost:8000
```

**Contracts**:
- Mobile ↔ Backend API contracts (request/response schemas)
- Mobile ↔ Third-party payment processor
- Mobile ↔ KYC/AML service
- Mobile ↔ Account linking aggregator

#### E2E Tests (10%)
```bash
# Framework: Detox or Maestro
# Location: e2e/

detox test-ios --configuration release --cleanup
detox test-android --configuration release --cleanup
```

**Critical journeys** (18 high-priority flows):
1. New user signup → KYC pass → account active
2. KYC fail → manual review → resubmit → pass
3. Existing user login → locked account → unlock via support
4. Add primary card → set as default → verify in wallet
5. Add secondary card → make default → verify in wallet
6. Link bank account → MFA → successful link
7. Relink bank account → expired token → re-authenticate
8. Unlink bank account → verify removed
9. Earn reward from transaction → verify balance
10. Reward cap applied → verify no over-reward
11. Chargeback received → reward reversed
12. Donate rewards → charity selected → donation complete
13. Gamification challenge completed → badge awarded
14. Streak maintained → bonus tier applied
15. AI support query → response received
16. Support escalation to human → ticket created
17. Profile update → change synced to backend
18. Logout → session cleared → login again

---

### 3.2 Admin Portal (React Web) - `swipesavvy-admin-portal`

#### Unit Tests (40%)
```bash
# Framework: Jest + React Testing Library
# Location: src/**/__tests__/**/*.test.ts(x)

npm run test -- --coverage --testPathPattern="__tests__"
```

**Coverage targets**:
- Admin data components: 90%
- Feature flag toggles: 95%
- User management forms: 85%
- Analytics dashboard: 80%

#### API/Integration Tests (30%)
```bash
# Framework: Jest + Supertest (mock backend)

npm run test:integration
```

**Test scenarios**:
- Admin login → session → logout
- User search → filter → export CSV
- Suspension/unsuspension flow
- Feature flag toggle → verification
- Audit log retrieval → filter by user/action/date
- Rewards override → reason logged
- Donation status tracking
- KYC case management → manual review → approval/rejection

#### Contract Tests (20%)
```bash
# Framework: OpenAPI schema validation

npm run test:contracts
```

**Contracts**:
- Admin Portal ↔ Backend API (8+ endpoints per role)
- Admin ↔ Third-party APIs (if applicable)

#### E2E Tests (10%)
```bash
# Framework: Playwright or Cypress
# Location: cypress/e2e/ or playwright/tests/

npx playwright test --reporter=html
npx cypress run --headless
```

**Critical admin journeys** (12 flows):
1. Support agent login → view tickets → respond → mark resolved
2. Compliance reviewer login → view KYC cases → approve/reject
3. Finance ops login → view donation reconciliation → export report
4. Admin login → toggle feature flag → verify in mobile app
5. Admin login → view analytics dashboard → drill down
6. Admin login → search user → view account status
7. Admin login → suspend user → verify in mobile (blocked)
8. Admin login → unsuspend user → verify in mobile (unblocked)
9. Admin login → view audit logs → filter by user
10. Admin login → view rewards pool balance
11. Admin login → process rewards donation payout
12. Admin login → view system health dashboard

---

### 3.3 Backend API (Python FastAPI) - `swipesavvy-mobile-app`

#### Unit Tests (40%)
```bash
# Framework: pytest
# Location: tests/unit/

pytest tests/unit/ -v --cov=app --cov-report=html
```

**Coverage targets**:
- Business logic services: 95%
- Reward calculation: 100%
- Validation functions: 100%
- Error handlers: 90%

**Key modules**:
- `tests/unit/services/rewards_engine_test.py`
- `tests/unit/services/account_linking_test.py`
- `tests/unit/services/kyc_aml_test.py`
- `tests/unit/services/gamification_test.py`
- `tests/unit/models/transactions_test.py`

#### API/Integration Tests (30%)
```bash
# Framework: pytest + FastAPI TestClient

pytest tests/integration/ -v --cov=app
```

**Test scenarios**:
- POST /api/users/signup → KYC check → account created
- POST /api/auth/login → JWT issued
- POST /api/accounts/link → OAuth redirect → token stored
- POST /api/rewards/earn → balance updated
- POST /api/donations/donate → confirmation sent
- GET /api/rewards/balance → current balance
- GET /api/user/status → account status returned
- POST /api/gamification/challenge-complete → badge awarded
- GET /api/support/messages → chat history
- POST /api/support/escalate → ticket created

#### Contract Tests (20%)
```bash
# Framework: Pact-Python

pytest tests/contracts/ -v
```

**Contracts**:
- Backend ↔ Mobile API schemas (request/response)
- Backend ↔ KYC/AML provider schemas
- Backend ↔ Payment processor webhooks
- Backend ↔ Admin portal API schemas

#### Webhook Tests (15% overlap with integration)
```bash
# Framework: pytest + webhook replay utility

pytest tests/integration/webhooks/ -v
```

**Webhook scenarios**:
- Payment auth webhook → balance updated
- Payment reversal webhook → rewards reversed
- KYC completion webhook → account unlocked
- Account linking completion webhook → account linked
- Donation payout webhook → confirmation sent
- Webhook replay safety (idempotency)

#### Performance Tests (5% overlap)
```bash
# Framework: locust or k6

locust -f tests/performance/locustfile.py --host=http://localhost:8000
k6 run tests/performance/load-test.js --vus=50 --duration=5m
```

**Performance benchmarks**:
- POST /api/rewards/earn: p95 < 200ms
- GET /api/rewards/balance: p95 < 100ms
- POST /api/users/signup: p95 < 500ms (includes KYC)
- GET /api/support/messages: p95 < 150ms

---

### 3.4 Mobile Wallet (React Native) - `swipesavvy-mobile-wallet`

#### Unit Tests (40%)
```bash
# Framework: Jest

jest --coverage --testPathPattern="__tests__"
```

**Coverage**:
- Card state management: 95%
- Transaction formatting: 100%
- PIN/security logic: 95%
- Card issuance logic: 90%

#### API/Integration Tests (30%)
```bash
# Integration with payment processor, card issuance

jest --testPathPattern="__integration__" --runInBand
```

#### E2E Tests (10%)
```bash
# Framework: Detox

detox test-ios e2e/card-flows.e2e.js
```

**Flows**:
1. Add card → card details entered → validation passed
2. Set as default → verified
3. Remove card → verified removed
4. Card replaced → new card received
5. Transaction auth → confirmed
6. Transaction reversal → balance adjusted
7. Contactless payment → worked
8. PIN change → verified

---

### 3.5 AI Agents Service - `swipesavvy-ai-agents`

#### Unit Tests (40%)
```bash
# Framework: pytest

pytest tests/unit/ -v --cov=agents
```

**Coverage**:
- Prompt templates: 90%
- Tool calling logic: 95%
- Response sanitization: 100%
- PII detection: 100%

#### Safety/Security Tests (25%)
```bash
# Framework: pytest + custom security assertions

pytest tests/security/ -v
```

**Test scenarios**:
- Prompt injection attempts → safely refused
- PII in request → detected and masked
- Unsafe tool calls → blocked
- Out-of-scope questions → polite refusal
- Token limits → graceful truncation
- Rate limiting → applied

#### Integration Tests (30%)
```bash
# Integration with knowledge base, tools, escalation

pytest tests/integration/ -v
```

---

## 4. Test Data & Environments

### Test Data Management

```
tests/fixtures/
├── users/
│   ├── valid_user.json
│   ├── kyc_pass.json
│   ├── kyc_fail.json
│   ├── duplicate_identity.json
│   └── sanctions_hit.json (sandbox)
├── accounts/
│   ├── valid_bank_account.json
│   └── expired_oauth_token.json
├── cards/
│   ├── valid_card.json
│   ├── fraud_card.json (sandbox)
│   └── declined_card.json (sandbox)
├── transactions/
│   ├── auth.json
│   ├── reversal.json
│   ├── refund.json
│   └── chargeback.json
└── reset_scripts/
    ├── reset_qa.sh
    ├── reset_staging.sh
    └── reset_users_test_data.sh
```

### Environments

| Environment | Purpose | Data | External Services |
|---|---|---|---|
| **Local** | Development | Reset daily | Mocked (MSW, Pact) |
| **Integration** | CI/CD gate | Persistent test data | Sandbox (KYC, BaaS, etc) |
| **QA/System Test** | Feature testing | Weekly refresh | Sandbox + real-like behavior |
| **Staging** | Release candidate | Prod-like (no PII) | Sandbox (full fidelity) |
| **UAT** | User acceptance | Copy of prod schema | Sandbox |
| **Production** | Live | Real user data | Real vendors |

---

## 5. Mocking & Sandbox Strategy

### Mocking Layers

```
┌─────────────────────────────────────────────┐
│  Unit Tests: 100% Mocked                   │
│  Dependencies injected, no real I/O         │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│  Integration Tests: Selective Real          │
│  Database: Real (test DB)                   │
│  Third-party: Mocked or Sandbox             │
│  Message Queue: Real (test instance)        │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│  E2E Tests: Real Dependencies              │
│  Database: Test instance                    │
│  APIs: Sandbox (KYC, BaaS, etc)            │
│  Frontend: Real app                         │
└─────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────┐
│  Staging: Prod-like                        │
│  No real user data                          │
│  Sandbox vendors                            │
│  Full fidelity testing                      │
└─────────────────────────────────────────────┘
```

### Sandbox Vendors (Assumed)

| Service | Sandbox URL | Test Credentials |
|---|---|---|
| **KYC/AML** | https://sandbox-kyc.vendor.com | test_user_pass.json |
| **BaaS (Accounts)** | https://sandbox-baas.vendor.com | sandbox_api_key.json |
| **Payment Processing** | https://sandbox-payments.vendor.com | test_cards.json |
| **Account Linking** | https://sandbox-linking.vendor.com | test_oauth.json |
| **Messaging/Email** | sandbox | seed_emails.json |

---

## 6. Test Automation Frameworks Setup

### Mobile App (React Native)

```bash
# Install Detox for E2E
cd swipesavvy-mobile-app
npm install --save-dev detox-cli detox detox-config detox-server

# Install Jest + React Native Testing Library for unit tests
npm install --save-dev @testing-library/react-native jest ts-jest @types/jest

# Configure Jest
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.ts(x)?', '**/?(*.)+(spec).ts(x)?'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
EOF
```

### Admin Portal (React Web)

```bash
cd swipesavvy-admin-portal

# Install Playwright for E2E
npm install --save-dev @playwright/test

# Install Jest + React Testing Library
npm install --save-dev jest ts-jest @testing-library/react @testing-library/jest-dom

# Configure Jest
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.ts(x)?'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
EOF

# Configure Playwright
npx playwright install
cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
EOF
```

### Backend (Python FastAPI)

```bash
cd swipesavvy-mobile-app  # Backend directory

# Install pytest + plugins
pip install pytest pytest-cov pytest-asyncio pytest-mock fastapi httpx

# Create conftest.py for fixtures
cat > tests/conftest.py << 'EOF'
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()
EOF

# Configure pytest
cat > pytest.ini << 'EOF'
[pytest]
minversion = 6.0
addopts = -ra -q --strict-markers
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
EOF
```

---

## 7. Test Execution Strategy

### Daily CI Pipeline

```yaml
name: Test Pipeline

on: [push, pull_request]

jobs:
  mobile-unit-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd swipesavvy-mobile-app && npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v3

  admin-unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd swipesavvy-admin-portal && npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v3

  backend-unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: cd swipesavvy-mobile-app && pip install -r requirements-test.txt
      - run: pytest tests/unit/ --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v3

  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run test:contracts  # All repos with contract tests
      - run: pytest tests/contracts/ -v  # Backend

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements-test.txt
      - run: pytest tests/integration/ --cov=app
      - run: cd swipesavvy-admin-portal && npm run test:integration

  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd swipesavvy-mobile-app && npm ci && npm run lint && npm run typecheck
      - run: cd swipesavvy-admin-portal && npm ci && npm run lint && npm run typecheck
```

### Pre-Release E2E Tests

```bash
# Run on staging before release
./scripts/run-smoke-tests-staging.sh

# Output example:
# ✅ E2E Test Results (Staging)
# ├─ User Signup & KYC: PASS
# ├─ Account Linking: PASS
# ├─ Rewards Earning: PASS
# ├─ Donation Flow: PASS
# ├─ Support Chat: PASS
# ├─ Admin Functions: PASS
# ├─ Feature Flags: PASS
# └─ Performance Check: PASS
# 
# Overall: 18/18 flows passed in 487 seconds
# Status: ✅ CLEAR FOR PRODUCTION
```

---

## 8. Coverage Targets & Metrics

| Layer | Language | Target | Tool | Success Criteria |
|---|---|---|---|---|
| **Unit** | TS/Python | 75%+ | Jest/pytest + codecov | Green badge, no excludes |
| **Integration** | Multi | 60%+ | pytest/Jest + Supertest | All critical paths covered |
| **Contract** | OpenAPI/Pact | 100% | Pact/OpenAPI validator | All contracts verified |
| **E2E** | TS/RN | 18 journeys | Detox/Playwright/Cypress | 95%+ pass rate, <5m each |
| **Security** | Python/TS | 100% | SAST/DAST/dependency scan | 0 critical, <5 high |
| **Performance** | Python | p95 < SLA | locust/k6 | All endpoints green |

---

## 9. Test Case Examples

### Example 1: Rewards Calculation (Unit Test)

```python
# tests/unit/services/rewards_engine_test.py

def test_reward_calculation_basic():
    """Verify basic reward earning (5% of transaction)"""
    transaction = Transaction(amount=100.00, merchant_id="shop123")
    expected_reward = 5.00
    
    reward = RewardsEngine.calculate(transaction)
    
    assert reward == expected_reward

def test_reward_cap_applied():
    """Verify monthly reward cap"""
    user = User(tier="standard", monthly_rewards_earned=48.00)
    transaction = Transaction(amount=100.00)  # Would earn 5.00
    engine = RewardsEngine(user=user)
    
    # Cap is 50.00, so only 2.00 can be earned
    reward = engine.calculate(transaction)
    
    assert reward == 2.00
    assert user.monthly_rewards_earned == 50.00

def test_excluded_merchant_no_reward():
    """Verify excluded merchants earn no reward"""
    transaction = Transaction(
        amount=100.00, 
        merchant_id="excluded123"
    )
    
    reward = RewardsEngine.calculate(transaction)
    
    assert reward == 0.0

def test_chargeback_reverses_reward():
    """Verify chargeback reverses associated reward"""
    original_tx = Transaction(amount=100.00, id="tx123")
    original_reward = 5.00
    user = User(rewards_balance=105.00)
    
    chargeback = Chargeback(original_transaction_id="tx123")
    engine = RewardsEngine(user=user)
    
    new_balance = engine.process_chargeback(chargeback)
    
    assert new_balance == 100.00  # 105 - 5
```

### Example 2: KYC Integration (Integration Test)

```python
# tests/integration/onboarding_test.py

@pytest.mark.asyncio
async def test_kyc_pass_flow(client):
    """Complete user signup → KYC pass → account active"""
    
    # 1. User signup
    signup_data = {
        "email": "test_kyc_pass_001@example.com",
        "password": "TestPass123!",
        "first_name": "John",
        "last_name": "Doe",
    }
    response = await client.post("/api/users/signup", json=signup_data)
    assert response.status_code == 201
    user_id = response.json()["id"]
    
    # 2. Initiate KYC
    kyc_data = {
        "ssn": "123-45-6789",  # Synthetic
        "dob": "1990-01-01",
        "document_id": "DL12345",
        "address": "123 Main St, City, State 12345",
    }
    response = await client.post(f"/api/users/{user_id}/kyc/submit", json=kyc_data)
    assert response.status_code == 202  # Accepted
    kyc_job_id = response.json()["job_id"]
    
    # 3. Simulate KYC completion (sandbox)
    await asyncio.sleep(1)
    response = await client.get(f"/api/users/{user_id}/kyc/status")
    assert response.json()["status"] in ["pending", "passed"]
    
    # If pending, simulate webhook
    if response.json()["status"] == "pending":
        # In test: call webhook handler directly
        kyc_complete_event = {
            "user_id": user_id,
            "status": "passed",
            "timestamp": datetime.utcnow().isoformat(),
        }
        await process_kyc_webhook(kyc_complete_event)
    
    # 4. Verify account is active
    response = await client.get(f"/api/users/{user_id}/status")
    assert response.json()["account_status"] == "active"
    assert response.json()["kyc_status"] == "passed"

@pytest.mark.asyncio
async def test_kyc_fail_manual_review(client):
    """KYC fail → manual review path"""
    
    signup_data = {...}
    user_resp = await client.post("/api/users/signup", json=signup_data)
    user_id = user_resp.json()["id"]
    
    # Submit KYC with flagged info
    kyc_data = {"ssn": "000-00-0000"}  # Invalid
    response = await client.post(f"/api/users/{user_id}/kyc/submit", json=kyc_data)
    
    # Simulate KYC failure
    await process_kyc_webhook({
        "user_id": user_id,
        "status": "failed",
        "reason": "invalid_identity",
    })
    
    # Verify account in manual review
    response = await client.get(f"/api/users/{user_id}/status")
    assert response.json()["account_status"] == "manual_review"
    assert response.json()["kyc_status"] == "rejected"
    
    # Verify admin can see case
    admin_response = await client.get(
        "/api/admin/kyc-cases",
        headers={"Authorization": "Bearer admin_token"}
    )
    cases = admin_response.json()["cases"]
    assert any(c["user_id"] == user_id for c in cases)
```

### Example 3: Rewards Donation E2E (Mobile + Backend)

```javascript
// e2e/donation-flow.e2e.js (Detox)

describe('Rewards Donation Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete rewards donation flow', async () => {
    // 1. Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('TestPass123!');
    await element(by.id('login-button')).multiTap();
    await waitFor(element(by.text('Home'))).toBeVisible().withTimeout(5000);

    // 2. Navigate to rewards
    await element(by.id('tab-rewards')).tap();
    await expect(element(by.text('Rewards Balance'))).toBeVisible();
    
    const balanceText = await element(by.id('rewards-balance')).getAttributes();
    const currentBalance = parseFloat(balanceText.text.replace('$', ''));
    
    // 3. Open donation modal
    await element(by.id('donate-button')).tap();
    await expect(element(by.text('Select Charity'))).toBeVisible();

    // 4. Search for charity
    await element(by.id('charity-search')).typeText('Red Cross');
    await element(by.text('Red Cross')).multiTap();
    await expect(element(by.text('Donation Amount'))).toBeVisible();

    // 5. Enter donation amount
    const donationAmount = '10.00';
    await element(by.id('donation-amount-input')).typeText(donationAmount);
    
    // 6. Confirm donation
    await element(by.id('confirm-donation-button')).multiTap();
    await waitFor(element(by.text('Donation Successful!'))).toBeVisible().withTimeout(5000);

    // 7. Verify receipt
    await expect(element(by.text(`Donated $${donationAmount}`))).toBeVisible();
    await expect(element(by.text('Red Cross'))).toBeVisible();
    
    // 8. Close receipt
    await element(by.id('receipt-close-button')).tap();

    // 9. Verify balance updated
    await element(by.id('rewards-balance')).multiTap(); // Refresh
    const newBalanceText = await element(by.id('rewards-balance')).getAttributes();
    const newBalance = parseFloat(newBalanceText.text.replace('$', ''));
    
    expect(newBalance).toBe(currentBalance - parseFloat(donationAmount));
  });
});
```

---

## 10. Test Execution Commands

### Run All Tests (Full Suite)

```bash
#!/bin/bash
# scripts/run-all-tests.sh

echo "🧪 Running Full Test Suite..."
echo ""

# Mobile App
echo "📱 Mobile App Tests..."
cd swipesavvy-mobile-app
npm run test -- --coverage
MOBILE_RESULT=$?

# Admin Portal
echo "🖥️  Admin Portal Tests..."
cd ../swipesavvy-admin-portal
npm run test -- --coverage
ADMIN_RESULT=$?

# Backend
echo "🔧 Backend Tests..."
cd ../swipesavvy-mobile-app  # Backend is here
pytest tests/unit/ tests/integration/ --cov=app
BACKEND_RESULT=$?

echo ""
echo "📊 Test Summary:"
echo "  Mobile: $([ $MOBILE_RESULT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "  Admin: $([ $ADMIN_RESULT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "  Backend: $([ $BACKEND_RESULT -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"

exit $(($MOBILE_RESULT + $ADMIN_RESULT + $BACKEND_RESULT))
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Contract tests
npm run test:contracts

# E2E tests (mobile)
detox test-ios e2e --configuration release

# E2E tests (admin portal)
npx playwright test --reporter=html

# Performance tests
npm run test:performance
```

---

## 11. Success Criteria

By end of Task 7, we will have:

- ✅ Test pyramid framework established across all 5 repos
- ✅ Unit test infrastructure (Jest + pytest) configured
- ✅ Integration test infrastructure with sandbox vendors
- ✅ Contract test framework (Pact/OpenAPI) ready
- ✅ E2E test framework (Detox + Playwright/Cypress) configured
- ✅ Security test framework integrated
- ✅ 18+ critical user journeys documented with test cases
- ✅ Coverage targets defined and tracked
- ✅ CI/CD pipeline prepared for Task 8
- ✅ All test frameworks can execute with single commands

---

## Next Steps (Task 8)

→ **Implement CI/CD gates** to enforce test requirements on all PRs and releases

