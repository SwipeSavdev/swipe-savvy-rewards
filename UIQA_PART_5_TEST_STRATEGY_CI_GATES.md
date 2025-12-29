# 🧪 PART 5: TEST STRATEGY & CI GATES

**Date**: December 26, 2025  
**Status**: PART 5 - Test Strategy & CI Configuration ✅  
**Duration**: ~4 hours analysis & implementation  

---

## 📊 EXECUTIVE SUMMARY

**Test Pyramid Framework**: Unit (≥80%) → Component (≥70%) → E2E Smoke (≥95% stable)

**CI Gates** (All must pass before merge):
- ✅ Lint check (0 errors)
- ✅ TypeScript compilation (0 errors)
- ✅ Unit tests (≥95% pass rate)
- ✅ A11y violations (0 critical)
- ✅ Code coverage (≥70% for modified code)

**Per-Repo Status**:
- 📱 Mobile App: Ready (Jest configured, 5 tests)
- 💳 Mobile Wallet: Ready after setup (P0-1 from Part 4)
- 🖥️ Admin Portal: Ready after setup (P0-3 from Part 4)
- 🌐 Customer Website: Ready after modernization (P0-5 from Part 4)

---

## 🏛️ SECTION A: TEST PYRAMID FRAMEWORK

### Universal Test Pyramid (All Repos)

```
                    ⬆️ ⬆️ ⬆️
                   E2E SMOKE
                  (Manual + Auto)
                   [≥95% stable]
                   [3 consecutive runs]
                  /
                 /
               /━━━━━━━━━━\
              /             \
           A11Y TESTS    VISUAL
          REGRESSION     REGRESSION
           [0 critical]  (Percy)
              \             /
               \           /
                \         /
                 COMPONENT TESTS
                [≥70% coverage]
                [react-testing-lib]
                  /           \
                /               \
              UNIT TESTS        INTEGRATION
             [≥80% coverage]    TESTS
             [fast, isolated]   [API mocks]
              |             |
              v             v
         [100+ tests]    [20+ tests]
```

### Test Counts Per Repo

| Level | Mobile App | Mobile Wallet | Admin Portal | Website | Total |
|-------|:---:|:---:|:---:|:---:|:---:|
| **Unit** | 30+ | 20+ | 15+ | 15+ | **80+** |
| **Component** | 25+ | 20+ | 20+ | 15+ | **80+** |
| **A11y** | 10+ | 8+ | 8+ | 8+ | **34+** |
| **E2E Smoke** | 3 | 3 | 3 | 3 | **12** |
| **Integration** | 8+ | 8+ | 8+ | 5+ | **29+** |
| **TOTAL** | **76+** | **59+** | **54+** | **46+** | **235+** |

---

## 🎯 SECTION B: PER-REPO TEST STRATEGY

### 📱 MOBILE APP: swipesavvy-mobile-app

**Current Status**: ✅ Ready to Expand (5 existing tests)
**Target Coverage**: 75% (reasonable for RN)

#### Unit Tests (Target: 30+)

**Focus Areas**:
```
src/services/
├─ rewardsService.test.ts (5 tests)
│  ├─ calculateEarnings()
│  ├─ checkCap()
│  ├─ validateDonation()
│  ├─ formatBalance()
│  └─ error handling
│
├─ campaignService.test.ts (5 tests)
│  ├─ getCampaign()
│  ├─ filterBySegment()
│  ├─ checkEligibility()
│  ├─ formatOfferText()
│  └─ cache invalidation
│
└─ authService.test.ts (5 tests)
   ├─ login()
   ├─ logout()
   ├─ refreshToken()
   ├─ isAuthenticated()
   └─ getUser()

src/contexts/
├─ AuthContext.test.ts (4 tests)
├─ ThemeContext.test.ts (3 tests)
└─ NotificationContext.test.ts (3 tests)

src/utils/
├─ formatters.test.ts (5 tests)
└─ validators.test.ts (4 tests)

Total: 34+ unit tests
```

#### Component Tests (Target: 25+)

**Critical Components**:
```
src/components/
├─ CampaignCard.test.tsx (4 tests)
│  ├─ Renders campaign info
│  ├─ Eligibility check
│  ├─ CTA disabled state
│  └─ Accessibility (a11y)
│
├─ RewardCard.test.tsx (4 tests)
│  ├─ Display balance
│  ├─ Format currency
│  ├─ Donation button
│  └─ Accessible labels
│
├─ CardManager.test.tsx (4 tests)
│  ├─ List cards
│  ├─ Lock/unlock
│  ├─ Set default
│  └─ Delete card
│
├─ TransactionList.test.tsx (3 tests)
│  ├─ Display transactions
│  ├─ Filter/sort
│  └─ Load more
│
├─ Button.test.tsx (3 tests)
├─ Input.test.tsx (3 tests)
└─ Modal.test.tsx (3 tests)

Total: 27+ component tests
```

#### A11y Tests (Target: 10+)

**axe-core Integration**:
```javascript
// Example A11y test structure
describe('CampaignCard A11y', () => {
  test('should have no axe violations', async () => {
    const { container } = render(<CampaignCard {...props} />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
  
  test('should have proper ARIA labels', () => {
    const { getByRole } = render(<CampaignCard {...props} />)
    expect(getByRole('button', { name: /take offer/i })).toBeInTheDocument()
  })
  
  test('should be keyboard navigable', () => {
    const { getByRole } = render(<CampaignCard {...props} />)
    const button = getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
  })
})
```

#### E2E Smoke Tests (Detox)

**3 Critical Flows**:
1. **Onboarding Flow** (3 minutes)
   - Launch app
   - Sign up with email
   - KYC submission
   - Account confirmation

2. **Account Linking** (3 minutes)
   - Tap "Link Account"
   - OAuth login
   - MFA challenge (if required)
   - Return to app with token

3. **Earn Rewards** (3 minutes)
   - View campaign list
   - Tap campaign
   - Check eligibility
   - Earn rewards
   - View balance

#### Test Configuration

**jest.config.js** (Already configured):
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.ts(x)?', '**/?(*.)+(spec|test).ts(x)?'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

**jest.setup.js** (Existing):
```javascript
import '@testing-library/jest-native/extend-expect'
import 'jest-axe/extend-expect'
```

#### npm Scripts

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:update": "jest --updateSnapshot"
}
```

---

### 💳 MOBILE WALLET: swipesavvy-mobile-wallet

**Current Status**: 🔴 Needs Setup (P0-1 from Part 4)
**Action**: Install Jest (3-4 hours), then implement tests

#### Unit Tests (Target: 20+)

```
src/services/
├─ cardService.test.ts (6 tests)
│  ├─ getCards()
│  ├─ lockCard()
│  ├─ unlockCard()
│  ├─ setDefault()
│  ├─ deleteCard()
│  └─ error handling
│
├─ transactionService.test.ts (5 tests)
│  ├─ getTransactions()
│  ├─ filterByType()
│  ├─ getReceipt()
│  ├─ exportReceipt()
│  └─ pagination
│
├─ rewardsService.test.ts (5 tests)
└─ authService.test.ts (4 tests)

Total: 20+ unit tests
```

#### Component Tests (Target: 20+)

```
src/components/
├─ CardItem.test.tsx (4 tests)
├─ CardLockModal.test.tsx (4 tests)
├─ TransactionRow.test.tsx (3 tests)
├─ RewardsDisplay.test.tsx (3 tests)
├─ ReceiptModal.test.tsx (3 tests)
└─ LoadingSkeleton.test.tsx (3 tests)

Total: 20+ component tests
```

#### A11y Tests (Target: 8+)

```
- Card list accessibility
- Lock/unlock modal a11y
- Transaction filtering a11y
- Receipt export a11y
```

#### E2E Smoke Tests (Detox)

**3 Critical Flows**:
1. **View Cards** (2 min) - List → Detail → Transactions
2. **Lock Card** (3 min) - View → Tap Lock → Confirm → Verify
3. **Transaction History** (2 min) - List → Filter → Export

#### Setup Steps

```bash
cd swipesavvy-mobile-wallet

# 1. Install Jest & dependencies (P0-1)
npm install --save-dev jest @testing-library/react-native jest-expo

# 2. Create jest.config.js
# Copy from mobile-app, adjust paths as needed

# 3. Create jest.setup.js
# Copy from mobile-app

# 4. Add npm scripts (P0-2)
# Edit package.json, add test scripts

# 5. Write 20+ unit tests (3 hours)
# Focus on: card operations, transactions, state management

# 6. Write 20+ component tests (2 hours)
# Focus on: card display, modals, lists

# 7. Run tests
npm test

# 8. Measure coverage
npm run test:coverage
```

---

### 🖥️ ADMIN PORTAL: swipesavvy-admin-portal

**Current Status**: 🔴 Needs Setup (P0-3 from Part 4)
**Action**: Install Vitest (2-3 hours), then implement tests

#### Unit Tests (Target: 15+)

```
src/services/
├─ merchantService.test.ts (5 tests)
├─ campaignService.test.ts (5 tests)
├─ analyticsService.test.ts (5 tests)

Total: 15+ unit tests
```

#### Component Tests (Target: 20+)

```
src/pages/
├─ LoginPage.test.tsx (3 tests)
├─ DashboardPage.test.tsx (3 tests)
├─ MerchantsPage.test.tsx (4 tests)
├─ CampaignsPage.test.tsx (4 tests)
├─ AnalyticsPage.test.tsx (3 tests)
└─ SettingsPage.test.tsx (3 tests)

src/components/
├─ DataTable.test.tsx (3 tests)
└─ FilterPanel.test.tsx (2 tests)

Total: 20+ component tests
```

#### A11y Tests (Target: 8+)

```
- Form accessibility (login, create campaign)
- Table keyboard navigation
- Modal focus management
- Button/link labeling
```

#### E2E Smoke Tests (Playwright)

**3 Critical Flows**:
1. **Login & Dashboard** (2 min) - Email → Password → View KPIs
2. **Create Campaign** (5 min) - Form fill → Validation → Submit
3. **View Analytics** (3 min) - Select campaign → View metrics → Export

#### Setup Steps

```bash
cd swipesavvy-admin-portal

# 1. Install Vitest & dependencies (P0-3)
npm install --save-dev vitest @vitest/ui happy-dom @testing-library/react @testing-library/user-event

# 2. Create vitest.config.ts
# Configure test environment as happy-dom

# 3. Create test setup file
# Configure testing library defaults

# 4. Add npm scripts (P0-4)
# Edit package.json

# 5. Create .eslintrc.json (P0-4)
# Configure ESLint for TypeScript

# 6. Write tests (4-5 hours)
# Unit: API services
# Component: Pages & critical components
# A11y: Form accessibility

# 7. Run tests
npm test

# 8. Check coverage
npm run test:coverage
```

#### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

### 🌐 CUSTOMER WEBSITE: swipesavvy-customer-website

**Current Status**: 🔴 Needs Modernization (P0-5 from Part 4)
**Action**: Modernize to Vite/Next.js (8-12 hours), then implement tests

#### Unit Tests (Target: 15+)

```
src/services/
├─ authService.test.ts (5 tests)
├─ integrationService.test.ts (5 tests)
└─ formService.test.ts (5 tests)

Total: 15+ unit tests
```

#### Component Tests (Target: 15+)

```
src/components/
├─ Hero.test.tsx (2 tests)
├─ SignupForm.test.tsx (4 tests)
├─ FeatureCard.test.tsx (3 tests)
├─ Testimonial.test.tsx (2 tests)
└─ Footer.test.tsx (2 tests)

src/pages/
├─ Landing.test.tsx (2 tests)
└─ Signup.test.tsx (2 tests)

Total: 15+ component tests
```

#### A11y Tests (Target: 8+)

```
- Form accessibility
- Semantic HTML
- Color contrast
- Navigation accessibility
```

#### E2E Smoke Tests (Playwright)

**3 Critical Flows**:
1. **Landing → Sign Up** (2 min) - View → Click CTA → Form submit
2. **OAuth Link Account** (3 min) - Auth provider flow → Return
3. **Account Confirmation** (1 min) - Redirect → Verify email

#### Setup (After Modernization)

```bash
cd swipesavvy-customer-website

# 1. Set up Vitest (same as admin portal)
npm install --save-dev vitest @vitest/ui happy-dom @testing-library/react

# 2. Create vitest.config.ts
# Copy from admin portal

# 3. Write tests (2-3 hours)
# Focus on: forms, authentication, integration

# 4. Run tests
npm test
```

---

## ⚙️ SECTION C: CI GATE CONFIGURATION

### GitHub Actions Workflow Template

**`.github/workflows/ci.yml`** (All Repos)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
        continue-on-error: false
      
      - name: Run Prettier check
        run: npm run format -- --check
        continue-on-error: false

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript type-check
        run: npm run type-check
        continue-on-error: false

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit & component tests
        run: npm test -- --coverage
        continue-on-error: false
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check for a11y violations
        run: |
          npm test -- --testNamePattern="a11y"
        continue-on-error: false

  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test, a11y]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        continue-on-error: false
      
      - name: Archive build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/
          retention-days: 7
```

### CI Gate Rules (GitHub)

**Branch Protection Rules**:
```
Require status checks to pass before merging:
  ✅ lint
  ✅ type-check
  ✅ test (coverage ≥70%)
  ✅ a11y (0 critical violations)
  ✅ build (must succeed)

Require PR reviews: 1 approval
Require code owner reviews: Yes
Dismiss stale reviews: Yes
Require branches to be up to date: Yes
```

---

## 📊 SECTION D: CODE COVERAGE TARGETS

### Coverage Thresholds (All Repos)

```javascript
// jest.config.js or vitest.config.ts
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
  // Higher thresholds for critical areas
  './src/services/**': {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  './src/components/**': {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75,
  },
}
```

### Per-Repo Coverage Targets

| Repo | Current | Target | Unit | Component | A11y |
|------|---------|--------|------|-----------|------|
| Mobile App | ~30% | **70%** | 80% | 75% | 100% |
| Mobile Wallet | **0%** | **70%** | 75% | 70% | 95% |
| Admin Portal | **0%** | **70%** | 75% | 70% | 95% |
| Website | **0%** | **70%** | 70% | 65% | 90% |

### Coverage Badges

Add to README.md:
```markdown
![Coverage Badge](https://img.shields.io/codecov/c/gh/swipesavvy/mobile-app/main)
```

---

## 🚀 SECTION E: TESTING PROCEDURES

### Pre-Commit Hook (Optional but Recommended)

**husky + lint-staged**:

```bash
npm install husky lint-staged --save-dev
npx husky install
```

**.husky/pre-commit**:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**package.json**:
```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": "eslint --fix",
    "src/**/*.{ts,tsx,json}": "prettier --write"
  }
}
```

### Running Tests Locally

**Unit Tests Only**:
```bash
npm test -- --testPathPattern="\.test\." --coverage
```

**Component Tests Only**:
```bash
npm test -- --testPathPattern="\.test\.tsx" 
```

**A11y Tests Only**:
```bash
npm test -- --testNamePattern="a11y|accessibility"
```

**Watch Mode** (Development):
```bash
npm run test:watch
```

**Update Snapshots**:
```bash
npm test -- -u
```

### Test Report Generation

**Coverage Report**:
```bash
npm run test:coverage
# View in: coverage/lcov-report/index.html
```

**JUnit XML Report** (for CI):
```bash
npm test -- --reporters=default --reporters=jest-junit
```

---

## 📋 SECTION F: TESTING SCHEDULE

### Phase 1: Setup (Dec 27-28)
```
Mobile Wallet: Install Jest (4 hours)
Admin Portal: Install Vitest (3 hours)
Customer Website: Modernize or replace (8-12 hours)
All Repos: Add jest-axe (4-6 hours)
```

### Phase 2: Unit Tests (Dec 29-30)
```
Mobile Wallet: 20+ unit tests (3 hours)
Admin Portal: 15+ unit tests (2 hours)
Customer Website: 15+ unit tests (2 hours)
Mobile App: Expand from 5 → 30+ tests (2 hours)
```

### Phase 3: Component Tests (Dec 31-Jan 2)
```
All Repos: 20-25 component tests per repo (6-8 hours)
Focus: High-risk components, forms, state management
```

### Phase 4: A11y & E2E (Jan 3-5)
```
All Repos: A11y tests (4-6 hours)
Mobile Apps: Detox smoke tests (3 hours)
Web: Playwright smoke tests (3 hours)
```

### Phase 5: CI/CD (Jan 6-8)
```
All Repos: GitHub Actions workflows (3-4 hours)
Configure branch protection rules (30 min)
Dry-run CI with real PRs (1 hour)
```

---

## ✅ SUCCESS CRITERIA

**Test Coverage**:
- ✅ All repos: ≥70% line coverage
- ✅ Critical services: ≥80% coverage
- ✅ All public components: ≥75% coverage

**CI Compliance**:
- ✅ 0 lint errors on main
- ✅ 0 TypeScript errors on main
- ✅ ≥95% test pass rate
- ✅ 0 critical a11y violations

**Test Stability**:
- ✅ E2E smoke tests: ≥95% stable (3 consecutive runs)
- ✅ Flaky tests: <5% of test suite
- ✅ Test execution time: <10 min for full suite

**Documentation**:
- ✅ Testing guide written
- ✅ Coverage reports automated
- ✅ CI/CD runbook documented

---

## 📚 SECTION G: TESTING RESOURCES & TOOLS

### Testing Libraries (Recommended)

**Mobile (React Native)**:
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react-native": "^12.0.0",
    "jest-axe": "^7.0.0",
    "jest-mock-axios": "^4.6.0",
    "detox": "^20.0.0",
    "detox-cli": "^20.0.0"
  }
}
```

**Web (React)**:
```json
{
  "devDependencies": {
    "vitest": "^0.34.0",
    "@vitest/ui": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest-axe": "^7.0.0",
    "playwright": "^1.40.0"
  }
}
```

### Tools & Services

| Tool | Purpose | Cost | Setup Time |
|------|---------|------|------------|
| Codecov | Coverage tracking | Free | 30 min |
| Percy | Visual regression | Free tier | 1 hour |
| GitHub Actions | CI/CD | Free | 1-2 hours |
| Sentry | Error tracking | Free tier | 30 min |
| Lighthouse CI | Performance | Free | 30 min |

---

## 🎯 NEXT STEPS (PART 6)

**PART 6: Critical-Flow Smoke Tests** will:

1. ✅ Use this test strategy as baseline
2. 📋 Write 10+ E2E smoke test scripts
3. 🚀 Execute 3 consecutive clean runs
4. 📊 Document test results & stability metrics
5. 🐛 Identify and fix flaky tests

**Timeline**: Jan 3-5 (EST 6-8 hours)

---

## 📋 FILES & TEMPLATES READY

✅ GitHub Actions CI workflow template  
✅ jest.config.js (Mobile App - existing)  
✅ vitest.config.ts (Admin Portal template)  
✅ Coverage threshold configs  
✅ Pre-commit hook setup  
✅ Test report templates  

---

**PART 5 Status**: ✅ TEST STRATEGY DEFINED

**Deliverables**:
- ✅ Test pyramid framework (unit/component/E2E)
- ✅ Per-repo testing targets (235+ tests total)
- ✅ GitHub Actions CI configuration
- ✅ Code coverage thresholds (70% target)
- ✅ Testing procedures & commands
- ✅ Success criteria & acceptance
- ✅ 5-phase implementation schedule

**Test Targets**:
- Mobile App: 76+ tests (70% coverage)
- Mobile Wallet: 59+ tests (after Jest setup)
- Admin Portal: 54+ tests (after Vitest setup)
- Website: 46+ tests (after modernization)
- **Total**: 235+ tests across 4 repos

**CI Gates** (All must pass):
- ✅ Lint: 0 errors
- ✅ TypeScript: 0 errors
- ✅ Tests: ≥95% pass rate
- ✅ A11y: 0 critical violations
- ✅ Build: Success

Say **"Ready for PART 6"** to proceed with Critical-Flow Smoke Tests & E2E execution.

