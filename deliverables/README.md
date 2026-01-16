# Swipe Savvy Platform Deliverables

**Last Updated:** 2026-01-16

This folder contains completed deliverables for the Swipe Savvy Platform multi-agent testing and documentation framework.

---

## Folder Structure

```
deliverables/
├── 01-agent-prompts/
│   └── SWIPE_SAVVY_AGENT_PROMPTS.md    # Agent-specific runnable prompts
├── 02-repo-mapped-plans/
│   └── SWIPE_SAVVY_REPO_MAPPED_PLAN.md # Repo inventory & execution plan
├── 03-test-scaffolding/
│   ├── k6/
│   │   └── swipesavvy-load-scenarios.js  # k6 load test scenarios
│   ├── playwright/
│   │   ├── playwright.config.ts          # Playwright configuration
│   │   ├── tests/
│   │   │   ├── smoke.spec.ts             # Smoke tests
│   │   │   ├── admin/
│   │   │   │   ├── auth.spec.ts          # Admin auth tests
│   │   │   │   └── users.spec.ts         # User management tests
│   │   │   └── wallet/
│   │   │       ├── auth.spec.ts          # Wallet auth tests
│   │   │       ├── transactions.spec.ts  # Transaction tests
│   │   │       └── rewards.spec.ts       # Rewards tests
│   │   └── helpers/
│   │       └── sync.ts                   # Sync helpers
│   ├── jest/
│   │   ├── jest.config.ts                # Jest configuration
│   │   └── jest.setup.ts                 # Jest setup file
│   └── pytest/
│       ├── conftest.py                   # Pytest fixtures
│       └── pytest.ini                    # Pytest configuration
└── 04-mcp-kb/
    ├── kb-config.json                    # KB sync configuration
    ├── kb-sync.js                        # KB sync script
    └── kb-runbook.md                     # KB usage runbook
```

---

## Quick Start

### 1. Agent Prompts

Use the agent prompts for multi-agent workflows:

```bash
# Read agent prompts
cat 01-agent-prompts/SWIPE_SAVVY_AGENT_PROMPTS.md
```

Each agent (A-I) has a specific role:
- **Agent A**: Architecture & Sync Auditor
- **Agent B**: Backend Unit Test Factory
- **Agent C**: Frontend Unit Test Factory
- **Agent D**: Integration Testing Engineer
- **Agent E**: Contract Testing Engineer
- **Agent F**: E2E Workflow Engineer
- **Agent G**: Load & Peak Engineer
- **Agent H**: QA Gatekeeper
- **Agent I**: Security & Compliance Officer

### 2. Load Testing (k6)

```bash
# Run load tests
export BASE_URL=http://54.224.8.14:8000
k6 run 03-test-scaffolding/k6/swipesavvy-load-scenarios.js
```

### 3. E2E Testing (Playwright)

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run tests
cd 03-test-scaffolding/playwright
npx playwright test

# Run specific project
npx playwright test --project=smoke
npx playwright test --project=admin-chromium
npx playwright test --project=wallet-mobile
```

### 4. Unit Testing

**Frontend (Jest):**
```bash
# Copy config to your project
cp 03-test-scaffolding/jest/jest.config.ts ../swipesavvy-admin-portal/
cp 03-test-scaffolding/jest/jest.setup.ts ../swipesavvy-admin-portal/

# Run tests
npm test
```

**Backend (Pytest):**
```bash
# Copy config to your project
cp 03-test-scaffolding/pytest/conftest.py ../swipesavvy-ai-agents/tests/
cp 03-test-scaffolding/pytest/pytest.ini ../swipesavvy-ai-agents/

# Run tests
cd ../swipesavvy-ai-agents
pytest tests/ -v
```

### 5. KB Sync

```bash
# Run KB sync
cd 04-mcp-kb
node kb-sync.js --config ./kb-config.json

# View output
cat generated/index.md
```

---

## Environment Configuration

### Required Environment Variables

```bash
# API
export BASE_URL=http://54.224.8.14:8000
export API_URL=http://54.224.8.14:8000

# E2E Testing
export E2E_BASE_URL=http://localhost:3000
export ADMIN_URL=http://localhost:3000
export WALLET_URL=http://localhost:3001

# Test Identification
export TEST_RUN_ID=test-$(date +%Y%m%d%H%M%S)
```

---

## Test Tags

### Playwright Tags
- `@smoke` - Quick validation tests
- `@critical` - Must-pass tests
- `@admin` - Admin portal tests
- `@wallet` - Wallet web tests
- `@auth` - Authentication tests
- `@transactions` - Transaction tests
- `@rewards` - Rewards tests

### Pytest Markers
- `@unit` - Fast isolated tests
- `@integration` - Database/API tests
- `@auth` - Authentication tests
- `@wallet` - Wallet tests
- `@rewards` - Rewards tests
- `@rbac` - RBAC tests

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx playwright install --with-deps
      - run: npx playwright test --project=smoke

  load-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: deliverables/03-test-scaffolding/k6/swipesavvy-load-scenarios.js
        env:
          BASE_URL: ${{ secrets.STAGING_API_URL }}
```

---

## Related Documentation

- [Master Prompt](../SWIPE_SAVVY_MASTER_PROMPT.md) - Comprehensive platform reference
- [Backend API](../swipesavvy-ai-agents/app/routes/) - API route implementations
- [Mobile App](../src/) - React Native source code
- [Admin Portal](../swipesavvy-admin-portal/) - Admin dashboard
- [Wallet Web](../swipesavvy-wallet-web/) - Customer wallet webapp
