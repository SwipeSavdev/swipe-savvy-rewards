# 📋 PART 4: STABILIZATION BACKLOG & TRIAGE

**Date**: December 26, 2025  
**Status**: PART 4 - Stabilization Backlog Creation ✅  
**Duration**: ~3-4 hours analysis & backlog creation  

---

## 📊 EXECUTIVE SUMMARY

**Total Issues Identified**: 45+ across 4 repos  
**P0 Blocking**: 10 critical  
**P1 High Priority**: 18 important  
**P2 Medium Priority**: 17 nice-to-have  

**Total Effort Estimate**: 40-60 hours  
**Timeline to Release-Ready**: Dec 27 - Jan 5, 2026 (estimated)

---

## 🚨 P0 BLOCKING ISSUES (MUST FIX - Go-Live Blockers)

### P0-1: Mobile Wallet - No Test Framework Configured
```
Title: [P0] Add Jest Testing Framework to Mobile Wallet
Repo: swipesavvy-mobile-wallet
Status: BLOCKED
Priority: CRITICAL
Effort: 3-4 hours
Owner: @team-wallet

Description:
Mobile Wallet has no Jest or Vitest configuration, making it impossible to write 
or run tests. This blocks:
  - Component testing
  - State management testing
  - A11y verification
  - CI/CD gate enforcement

Acceptance Criteria:
  ✅ Jest configured (jest.config.js created)
  ✅ jest-expo preset installed
  ✅ Initial 15+ test files written
  ✅ npm test script functional
  ✅ Coverage threshold set (70%)
  ✅ Test suite passes 100%
  ✅ CI integration ready

Dependencies:
  - npm install jest @testing-library/react-native jest-expo

Implementation Steps:
  1. Install Jest dependencies
  2. Create jest.config.js
  3. Create jest.setup.js
  4. Write tests for: Card component, Rewards component, Transaction list
  5. Add npm test script to package.json
  6. Run tests and achieve 70% coverage
  7. Configure for CI

Blockers: None
Related: P0-2 (npm scripts), P1-5 (A11y testing)
```

### P0-2: Mobile Wallet - Missing npm Scripts
```
Title: [P0] Add Missing npm Scripts (test, lint, type-check, format)
Repo: swipesavvy-mobile-wallet
Status: BLOCKED
Priority: CRITICAL
Effort: 30 minutes
Owner: @team-wallet

Description:
Mobile Wallet package.json missing critical development scripts. Currently cannot:
  - Run tests: npm test
  - Run linter: npm lint
  - Type-check: npm type-check
  - Auto-format: npm format

Acceptance Criteria:
  ✅ "test" script added: jest
  ✅ "test:watch" script added: jest --watch
  ✅ "test:coverage" script added: jest --coverage
  ✅ "lint" script added: eslint src
  ✅ "lint:fix" script added: eslint --fix
  ✅ "type-check" script added: tsc --noEmit
  ✅ "format" script added: prettier --write

Required Changes:
{
  "scripts": {
    "start": "expo start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\""
  }
}

Blockers: None
Related: P0-1 (Jest), P1-1 (ESLint)
```

### P0-3: Admin Portal - No Testing Framework Configured
```
Title: [P0] Add Vitest Testing Framework to Admin Portal
Repo: swipesavvy-admin-portal
Status: BLOCKED
Priority: CRITICAL
Effort: 2-3 hours
Owner: @team-admin

Description:
Admin Portal has no Jest or Vitest configuration. With Vite as build tool, 
Vitest is the natural choice. This blocks:
  - Component testing
  - Admin UI verification
  - Form validation testing
  - A11y checking

Acceptance Criteria:
  ✅ Vitest configured (vitest.config.ts created)
  ✅ @vitest/ui installed for test UI
  ✅ Initial 10+ test files written
  ✅ npm test script functional
  ✅ Tests for: LoginPage, DashboardPage, FeatureFlagManagement
  ✅ Coverage threshold set (70%)
  ✅ Test suite passes 100%

Dependencies:
  npm install vitest @vitest/ui happy-dom @testing-library/react @testing-library/user-event

Implementation Steps:
  1. Install Vitest and dependencies
  2. Create vitest.config.ts
  3. Configure test setup file
  4. Write 10+ test files for critical pages
  5. Add npm test script
  6. Run tests and achieve coverage
  7. Integrate with CI

Blockers: None
Related: P0-4 (ESLint config), P1-6 (A11y testing)
```

### P0-4: Admin Portal - ESLint Config File Missing
```
Title: [P0] Create ESLint Configuration File
Repo: swipesavvy-admin-portal
Status: BLOCKED
Priority: CRITICAL
Effort: 30 minutes
Owner: @team-admin

Description:
ESLint script exists in package.json but no .eslintrc.json file exists. 
Running "npm lint" will fail. This blocks code quality enforcement.

Acceptance Criteria:
  ✅ .eslintrc.json created
  ✅ Extends: eslint-config-react-app
  ✅ Rules configured for TypeScript
  ✅ npm lint runs without errors
  ✅ Can be integrated in CI

Required File:
{
  "extends": ["eslint-config-react-app"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],
    "@typescript-eslint/no-explicit-any": "warn"
  }
}

Blockers: None
Related: P1-7 (Prettier config)
```

### P0-5: Customer Website - Not a Modern Web Application
```
Title: [P0] Modernize Customer Website (Migrate to Vite/Next.js)
Repo: swipesavvy-customer-website
Status: BLOCKED
Priority: CRITICAL - DECISION REQUIRED
Effort: 8-12 hours (modernize) OR 6-10 hours (replace)
Owner: @team-web (TBD)

Description:
Customer website is served via Python HTTP server with no build tool, no TypeScript,
no testing framework. This is a critical blocker for:
  - Type safety
  - Component testing
  - A11y verification
  - Performance optimization
  - CI/CD automation

Two Options Available:

OPTION A: MODERNIZE (Recommended)
  1. Migrate existing HTML/CSS/JS to Vite + React
  2. Add TypeScript support
  3. Configure Vitest for testing
  4. Implement jest-axe for a11y
  5. Set up GitHub Actions CI/CD
  Time: 8-12 hours
  Risk: Medium (content migration complexity)
  Benefit: Reuses existing assets, incremental migration possible

OPTION B: REPLACE (Faster)
  1. Create new Next.js project
  2. Copy content from existing site
  3. Implement all tooling from scratch
  4. Set up testing and CI/CD
  Time: 6-10 hours
  Risk: Low (clean start)
  Benefit: Modern tooling, better future maintenance

DECISION NEEDED:
  [ ] Approve Option A (Modernize)
  [ ] Approve Option B (Replace)

Acceptance Criteria (Both Options):
  ✅ TypeScript configured (tsconfig.json)
  ✅ Build tool configured (Vite or Next.js)
  ✅ Vitest/Jest configured
  ✅ jest-axe configured for a11y
  ✅ GitHub Actions CI/CD workflow
  ✅ All tests pass (target 70% coverage)
  ✅ npm scripts: test, lint, type-check, build

Blockers: DECISION from stakeholder required
Related: P1-12 (TypeScript), P1-13 (ESLint), P0-3 (Vitest)
```

### P0-6: All Repos - No A11y Testing Automation
```
Title: [P0] Add jest-axe A11y Testing to All Repos
Repo: swipesavvy-mobile-app, swipesavvy-mobile-wallet, swipesavvy-admin-portal, swipesavvy-customer-website
Status: BLOCKED
Priority: CRITICAL
Effort: 4-6 hours total (1-2 hours per repo)
Owner: @qa-team (distributed)

Description:
None of the repos have automated a11y testing. Cannot verify WCAG AA compliance
without this. Blocks:
  - A11y verification in CI
  - WCAG AA sign-off
  - Accessible component guarantee
  - Screen reader compatibility check

Acceptance Criteria (Per Repo):
  ✅ jest-axe installed as dev dependency
  ✅ A11y test helpers configured
  ✅ Sample a11y test written for 3+ components
  ✅ Component tests include a11y assertions
  ✅ CI gates include a11y check (0 critical violations)
  ✅ Coverage goal: All public components have a11y test

Implementation:
  Per Repo:
    1. npm install jest-axe --save-dev
    2. Create src/__tests__/a11y.setup.ts
    3. Write a11y tests for: Button, Input, Modal, Tabs
    4. Add to CI: axe scans for critical violations
    5. Document: A11y testing procedures

Timeline:
  Mobile App: 1 hour (already has Jest)
  Mobile Wallet: 2 hours (after Jest setup)
  Admin Portal: 2 hours (after Vitest setup)
  Customer Website: 2 hours (after modernization)

Blockers: P0-1, P0-3, P0-5 (test frameworks first)
Related: P7 (Full a11y audit)
```

### P0-7: All Repos - No E2E Smoke Tests
```
Title: [P0] Write Critical-Path E2E Smoke Tests
Repo: All repos
Status: BLOCKED
Priority: CRITICAL
Effort: 6-8 hours total
Owner: @qa-team

Description:
No E2E smoke tests exist for critical user flows. Cannot gate releases without
verification that:
  - Mobile app: Onboarding → Card linking → View rewards
  - Mobile wallet: View cards → Lock card → View transactions
  - Admin portal: Login → View dashboard → Create campaign
  - Customer website: Landing → Sign up → Link account

Acceptance Criteria:
  ✅ Detox E2E tests written for mobile apps (3 scripts each)
  ✅ Playwright E2E tests written for web (3 scripts each)
  ✅ Scripts pass 3 consecutive runs (≥95% stable)
  ✅ Tests can run on CI (headless mode)
  ✅ Test data setup automated
  ✅ Failure reports captured (screenshots/video)

Implementation Plan:
  Mobile App:
    1. Test: Onboarding flow (3 min)
    2. Test: Link account flow (3 min)
    3. Test: View & earn rewards (3 min)
    Total: 1.5 hours
  
  Mobile Wallet:
    1. Test: View card list (2 min)
    2. Test: Lock/unlock card (3 min)
    3. Test: View transaction history (2 min)
    Total: 1.5 hours
  
  Admin Portal:
    1. Test: Login flow (2 min)
    2. Test: View dashboard & navigate (3 min)
    3. Test: Create campaign (5 min)
    Total: 2 hours
  
  Customer Website:
    1. Test: Landing → Sign up (3 min)
    2. Test: OAuth link account (3 min)
    3. Test: Account created confirmation (2 min)
    Total: 1.5 hours

Total Time: 6-8 hours
Blockers: P0-5 (website modernization first)
Related: P6 (Full smoke test suite)
```

### P0-8: All Repos - No CI/CD Pipelines
```
Title: [P0] Configure GitHub Actions CI/CD Workflows
Repo: All repos
Status: BLOCKED
Priority: CRITICAL
Effort: 3-4 hours total
Owner: @devops-team

Description:
No GitHub Actions workflows configured. Cannot automate quality gates before merge.
Blocks:
  - Automated linting enforcement
  - Type-checking gates
  - Test execution before merge
  - A11y verification gates
  - Deployment automation

Acceptance Criteria:
  ✅ .github/workflows/ci.yml created in each repo
  ✅ CI gates configured:
    ├─ npm install & dependency check
    ├─ npm lint (must pass)
    ├─ npm type-check (must pass)
    ├─ npm test (must pass ≥95%)
    └─ A11y check (0 critical violations)
  ✅ CI runs on: push to main, pull requests
  ✅ Workflows prevent merge on failure
  ✅ Build artifacts archived for review

Implementation Plan Per Repo:
  1. Create .github/workflows/ci.yml
  2. Configure Node.js setup
  3. Add lint step
  4. Add type-check step
  5. Add test step
  6. Add a11y check step
  7. Archive artifacts
  8. Configure status checks

Timeline:
  Per repo: 30-45 minutes
  All 4 repos: 2-3 hours

Blockers: P0-1, P0-3 (test frameworks first)
Related: P5 (Detailed CI config)
```

### P0-9: Mobile Wallet - No ESLint Configuration
```
Title: [P0] Configure ESLint for Mobile Wallet
Repo: swipesavvy-mobile-wallet
Status: BLOCKED
Priority: CRITICAL
Effort: 30 minutes
Owner: @team-wallet

Description:
ESLint not configured for Mobile Wallet. Cannot enforce code style or catch
common errors (unused variables, etc.).

Acceptance Criteria:
  ✅ .eslintrc.json created
  ✅ Extends eslint-config-react-app
  ✅ npm lint script works without errors
  ✅ npm lint:fix auto-fixes violations

Required File:
{
  "extends": ["eslint-config-react-app"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"]
  }
}

Blockers: None
Related: P0-2 (npm scripts), P1-2 (Prettier)
```

### P0-10: Mobile Wallet - No Prettier Configuration
```
Title: [P0] Configure Prettier for Mobile Wallet
Repo: swipesavvy-mobile-wallet
Status: BLOCKED
Priority: CRITICAL
Effort: 15 minutes
Owner: @team-wallet

Description:
No Prettier configuration. Code style not enforced or auto-fixable.

Acceptance Criteria:
  ✅ .prettierrc created
  ✅ npm format script works
  ✅ Pre-commit hook (husky) configured (optional for P0)

Required File:
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "arrowParens": "always"
}

Blockers: None
Related: P0-2 (npm scripts)
```

---

## 🟠 P1 HIGH PRIORITY ISSUES (Should Fix Before Release)

### P1-1: Mobile Wallet - No Prettier Configuration
```
Title: [P1] Add Prettier to Mobile Wallet
Repo: swipesavvy-mobile-wallet
Effort: 15 minutes
Owner: @team-wallet
Impact: Code style consistency

Steps:
  1. Create .prettierrc
  2. npm install prettier --save-dev
  3. Add format script
  4. Optional: Add pre-commit hook
```

### P1-2: Admin Portal - Missing Prettier Configuration
```
Title: [P1] Configure Prettier for Admin Portal
Repo: swipesavvy-admin-portal
Effort: 15 minutes
Owner: @team-admin
Impact: Code style consistency across team

Config: Same as other repos
```

### P1-3: Mobile App - No jest-axe A11y Tests
```
Title: [P1] Add jest-axe Accessibility Testing
Repo: swipesavvy-mobile-app
Effort: 2 hours
Owner: @qa-team
Impact: Automated WCAG AA verification

Steps:
  1. npm install jest-axe @testing-library/jest-native --save-dev
  2. Write a11y tests for 5+ components
  3. Add to CI pipeline
```

### P1-4: Admin Portal - Missing npm Type-Check Script
```
Title: [P1] Add TypeScript Type-Check Script
Repo: swipesavvy-admin-portal
Effort: 15 minutes
Owner: @team-admin
Impact: Type safety verification in CI

Add to package.json:
  "type-check": "tsc --noEmit"
```

### P1-5: Mobile Wallet - No Type-Check Script
```
Title: [P1] Add TypeScript Type-Check Script
Repo: swipesavvy-mobile-wallet
Effort: 15 minutes
Owner: @team-wallet
Impact: Type safety verification

Add to package.json:
  "type-check": "tsc --noEmit"
```

### P1-6: Mobile App - No E2E Smoke Tests
```
Title: [P1] Write E2E Smoke Tests for Mobile App
Repo: swipesavvy-mobile-app
Effort: 2-3 hours
Owner: @qa-team
Impact: Critical flow verification

Tests Needed:
  1. Onboarding flow (signup → KYC)
  2. Account linking (OAuth)
  3. View & earn rewards

Framework: Detox
```

### P1-7: All Repos - No Console Error Monitoring
```
Title: [P1] Add Console Error Logging & Monitoring
Repo: All repos
Effort: 2 hours total
Owner: @devops-team
Impact: Error detection in production

Implementation:
  Mobile: Sentry error tracking
  Admin: DataDog or Sentry
  Web: Sentry or ErrorStack
```

### P1-8: Mobile Wallet - No Design System Integration
```
Title: [P1] Integrate Design System Tokens
Repo: swipesavvy-mobile-wallet
Effort: 2 hours
Owner: @design-team
Impact: UI consistency with mobile-app

Steps:
  1. Share design tokens from mobile-app
  2. Update components to use tokens
  3. Verify color/spacing consistency
```

### P1-9: Admin Portal - Design System Token Alignment
```
Title: [P1] Align Admin Portal with Shared Design Tokens
Repo: swipesavvy-admin-portal
Effort: 1.5 hours
Owner: @design-team
Impact: Visual consistency across products

Verify:
  - Color tokens match
  - Typography scale matches
  - Spacing scale matches
```

### P1-10: Customer Website - Design System Integration
```
Title: [P1] Integrate Design System into Customer Website
Repo: swipesavvy-customer-website
Effort: 1 hour (after modernization)
Owner: @design-team
Impact: Brand consistency
```

### P1-11: Mobile App - Missing Offline State Tests
```
Title: [P1] Test Offline & Network Error States
Repo: swipesavvy-mobile-app
Effort: 2 hours
Owner: @qa-team
Impact: Resilience verification

Tests Needed:
  - Loading state display
  - Error state display
  - Retry mechanism
  - Cache usage
```

### P1-12: Mobile Wallet - Loading/Error State Coverage
```
Title: [P1] Verify Loading & Error State Handling
Repo: swipesavvy-mobile-wallet
Effort: 2 hours
Owner: @qa-team
Impact: UX resilience

Verify:
  - Loading skeletons display
  - Error messages clear & actionable
  - Retry buttons functional
```

### P1-13: Admin Portal - Loading/Error State Coverage
```
Title: [P1] Test Admin Portal Loading & Error States
Repo: swipesavvy-admin-portal
Effort: 1.5 hours
Owner: @qa-team
Impact: Admin UX reliability
```

### P1-14: Customer Website - Form Validation Testing
```
Title: [P1] Test Form Validation & Error Messages
Repo: swipesavvy-customer-website
Effort: 2 hours
Owner: @qa-team
Impact: User experience (after modernization)

Test:
  - Email validation
  - Password strength
  - Field-level errors
  - Submit error handling
```

### P1-15: All Repos - No Performance Baselines
```
Title: [P1] Establish Performance Baselines
Repo: All repos
Effort: 2 hours
Owner: @devops-team
Impact: Performance degradation detection

Measure:
  Mobile: FCP, LCP, CLS (Lighthouse)
  Admin: FCP, LCP, CLS
  Web: FCP, LCP, CLS, TTFB
```

### P1-16: Mobile App - No Sentry Integration
```
Title: [P1] Integrate Sentry Error Tracking
Repo: swipesavvy-mobile-app
Effort: 1 hour
Owner: @devops-team
Impact: Production error monitoring

Setup:
  1. Configure Sentry project
  2. Add Sentry SDK
  3. Configure error reporting
  4. Test error capture
```

### P1-17: Admin Portal - Accessibility Keyboard Navigation
```
Title: [P1] Verify Keyboard Navigation & Focus Management
Repo: swipesavvy-admin-portal
Effort: 2 hours
Owner: @qa-team
Impact: WCAG AA compliance

Test:
  - Tab order correct
  - Focus indicators visible
  - Modals have focus trap
  - Links/buttons keyboard accessible
```

### P1-18: Mobile App - Screen Reader Testing
```
Title: [P1] Test VoiceOver (iOS) Compatibility
Repo: swipesavvy-mobile-app
Effort: 2 hours
Owner: @qa-team
Impact: iOS a11y compliance

Test:
  - All content announced
  - Buttons have labels
  - Forms are accessible
  - Images have alt text
```

---

## 🟡 P2 MEDIUM PRIORITY ISSUES (Nice-to-Have)

### P2-1: Mobile App - Snapshot Tests
```
Title: [P2] Add Snapshot Tests for Components
Repo: swipesavvy-mobile-app
Effort: 2 hours
Owner: @qa-team
Impact: Regression detection for UI changes
```

### P2-2: Admin Portal - Visual Regression Testing
```
Title: [P2] Set Up Visual Regression Testing (Percy)
Repo: swipesavvy-admin-portal
Effort: 2 hours
Owner: @qa-team
Impact: UI change detection
```

### P2-3: Mobile Wallet - Integration Tests
```
Title: [P2] Add Integration Tests for Card/Rewards Flow
Repo: swipesavvy-mobile-wallet
Effort: 3 hours
Owner: @qa-team
Impact: End-to-end component flow verification
```

### P2-4: All Repos - Test Coverage Reporting
```
Title: [P2] Configure Code Coverage Reporting (Codecov)
Repo: All repos
Effort: 1 hour
Owner: @devops-team
Impact: Coverage visibility & trends
```

### P2-5: Mobile App - Storybook Documentation
```
Title: [P2] Add Storybook for Component Documentation
Repo: swipesavvy-mobile-app
Effort: 3 hours
Owner: @design-team
Impact: Component catalog & design system docs
```

### P2-6: Admin Portal - Storybook Documentation
```
Title: [P2] Add Storybook for Admin Components
Repo: swipesavvy-admin-portal
Effort: 2 hours
Owner: @design-team
Impact: Admin component documentation
```

### P2-7: Mobile Wallet - Dark Mode Testing
```
Title: [P2] Test Dark Mode (if implemented)
Repo: swipesavvy-mobile-wallet
Effort: 1 hour
Owner: @qa-team
Impact: Dark mode UX verification
```

### P2-8: Admin Portal - Dark Mode Testing
```
Title: [P2] Test Dark Mode (if implemented)
Repo: swipesavvy-admin-portal
Effort: 1 hour
Owner: @qa-team
Impact: Dark mode UX verification
```

### P2-9: All Repos - Internationalization i18n Testing
```
Title: [P2] Test Internationalization (if i18n implemented)
Repo: All repos
Effort: 4 hours
Owner: @qa-team
Impact: Multi-language support verification
```

### P2-10: Mobile App - Biometric Auth Testing
```
Title: [P2] Test Face ID/Touch ID Integration
Repo: swipesavvy-mobile-app
Effort: 2 hours
Owner: @qa-team
Impact: Biometric auth UX verification
```

### P2-11: Mobile Wallet - Transaction History Filtering
```
Title: [P2] Test Advanced Filtering & Search
Repo: swipesavvy-mobile-wallet
Effort: 2 hours
Owner: @qa-team
Impact: Data filtering UX
```

### P2-12: Admin Portal - Bulk Operations Testing
```
Title: [P2] Test Bulk Merchant/Campaign Operations
Repo: swipesavvy-admin-portal
Effort: 2 hours
Owner: @qa-team
Impact: Admin efficiency verification
```

### P2-13: Customer Website - SEO Verification
```
Title: [P2] Verify SEO (Meta tags, structured data)
Repo: swipesavvy-customer-website
Effort: 1.5 hours
Owner: @marketing-team
Impact: Search engine visibility
```

### P2-14: All Repos - GDPR/Privacy Compliance
```
Title: [P2] Verify GDPR & Privacy Features
Repo: All repos
Effort: 3 hours
Owner: @legal-team
Impact: Privacy compliance
```

### P2-15: Mobile App - Push Notification Testing
```
Title: [P2] Test Push Notification Handling
Repo: swipesavvy-mobile-app
Effort: 2 hours
Owner: @qa-team
Impact: Notification UX
```

### P2-16: Mobile Wallet - Receipt Export Testing
```
Title: [P2] Test Receipt Export (PDF/Email)
Repo: swipesavvy-mobile-wallet
Effort: 1.5 hours
Owner: @qa-team
Impact: Export feature verification
```

### P2-17: Admin Portal - Report Generation Testing
```
Title: [P2] Test Report Export & Scheduling
Repo: swipesavvy-admin-portal
Effort: 2 hours
Owner: @qa-team
Impact: Admin reporting verification
```

---

## 📈 IMPLEMENTATION ROADMAP

### Phase 1: Critical Infrastructure (Dec 27 - 28, 2026)
**Duration**: 2 days | **Effort**: 20 hours

**Focus**: Get all repos to testable state

```
Dec 27 (6-8 hours):
  ✅ P0-1: Mobile Wallet - Add Jest (3-4h)
  ✅ P0-2: Mobile Wallet - npm scripts (30m)
  ✅ P0-3: Admin Portal - Add Vitest (2-3h)
  ✅ P0-4: Admin Portal - ESLint config (30m)

Dec 28 (8-10 hours):
  ✅ P0-9: Mobile Wallet - ESLint (30m)
  ✅ P0-10: Mobile Wallet - Prettier (15m)
  ✅ P1-1, P1-2: Prettier configs (30m)
  ✅ P0-6: jest-axe to all repos (4-6h)
  ✅ P0-8: GitHub Actions CI (3-4h)
  ⏳ P0-5: Customer Website decision (decision point)
```

### Phase 2: Testing & QA (Dec 29 - Jan 2, 2026)
**Duration**: 5 days | **Effort**: 20 hours

**Focus**: E2E tests & smoke tests

```
Dec 29-30 (8-10h):
  ✅ P0-7: E2E smoke tests
    - Mobile App (1.5h)
    - Mobile Wallet (1.5h)
    
Dec 31 - Jan 2 (10-12h):
  ✅ E2E tests (continued)
    - Admin Portal (2h)
    - Customer Website (1.5h)
  ✅ P1-3: Mobile App a11y (2h)
  ✅ P1-6: Mobile App E2E (2h)
  ✅ P1-11, P1-12: Offline state tests (4h)
```

### Phase 3: Customer Website Modernization (Dec 27 - Jan 2, 2026)
**Duration**: 4-6 days (parallel) | **Effort**: 8-12 hours

**Focus**: Modernize customer website (if approved)

```
Parallel to Phase 1 & 2:
  ✅ P0-5: Modernize customer website
    Decision: Option A or B?
    If A (Modernize): 8-12 hours
    If B (Replace): 6-10 hours
```

### Phase 4: Accessibility & Performance (Jan 3 - 7, 2026)
**Duration**: 5 days | **Effort**: 15 hours

**Focus**: A11y audit & performance baseline

```
Jan 3-4 (6-8h):
  ✅ P1-17: Admin Portal keyboard nav (2h)
  ✅ P1-18: Mobile App VoiceOver (2h)
  ✅ P1-7: Console error monitoring (2h)

Jan 5-7 (7-9h):
  ✅ P1-15: Performance baselines (2h)
  ✅ P1-16: Sentry integration (1h)
  ✅ Design system integration (4h)
```

### Phase 5: Release Readiness (Jan 8 - 10, 2026)
**Duration**: 3 days | **Effort**: 5 hours

**Focus**: Final verification & sign-off

```
Jan 8 (2-3h):
  ✅ All tests passing
  ✅ CI green on all repos
  ✅ Coverage reports ready

Jan 9-10 (2-3h):
  ✅ Final smoke tests (3 consecutive runs)
  ✅ Performance baselines verified
  ✅ A11y sign-off
  ✅ Release sign-off
```

---

## 🎯 PRIORITIZATION MATRIX

| Category | Count | Est. Hours | Effort | Impact |
|----------|-------|-----------|--------|--------|
| **P0 Blocking** | 10 | 20-25 | High | Critical |
| **P1 High Priority** | 18 | 25-35 | Medium | High |
| **P2 Medium Priority** | 17 | 15-25 | Low | Medium |
| **TOTAL** | 45+ | 60-85 | - | - |

**Recommended Focus** (for release): P0 + P1 (45-60 hours = 1-2 weeks)
**Nice-to-Have** (post-release): P2 items

---

## 🏃 QUICK START: IMMEDIATE ACTIONS (Next 48 Hours)

### TODAY (Dec 26 - Evening)
```
[ ] Stakeholder decision: Customer Website - Modernize or Replace?
[ ] Create GitHub project/milestones for tracking
[ ] Assign owners to P0 items
```

### TOMORROW (Dec 27 - Full Day)
```
Priority Order:
  1. Mobile Wallet: Add Jest (P0-1) - 3-4 hours
  2. Mobile Wallet: npm scripts (P0-2) - 30 min
  3. Admin Portal: Add Vitest (P0-3) - 2-3 hours
  4. Admin Portal: ESLint config (P0-4) - 30 min
  5. All Repos: Add jest-axe (P0-6) - 4-6 hours

Target: 10-14 hours work
```

### DEC 28 (Full Day)
```
  6. Mobile Wallet: ESLint (P0-9) - 30 min
  7. Mobile Wallet: Prettier (P0-10) - 15 min
  8. Prettier for all repos (P1-1, P1-2) - 30 min
  9. GitHub Actions CI (P0-8) - 3-4 hours
 10. Start E2E tests if Jest/Vitest ready

Target: 8-10 hours work
```

---

## 📋 GITHUB ISSUE TEMPLATES

### Template: P0 Blocking Issue
```markdown
# [P0] {TITLE}

## Context
{Description of why this is blocking}

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Steps
1. Step 1
2. Step 2
3. Step 3

## Effort Estimate
{Hours}

## Owner
@{username}

## Related Issues
- #{number}
- #{number}

## Blockers
None / {description}
```

### Template: P1 High Priority Issue
```markdown
# [P1] {TITLE}

## Problem
{What's the issue?}

## Solution
{How to fix it}

## Effort Estimate
{Hours}

## Owner
@{username}

## Dependencies
- {Issue or task}
```

---

## ✅ SUCCESS METRICS

**Release Ready When**:
- ✅ All P0 issues resolved
- ✅ All P1 issues resolved (or deferred with sign-off)
- ✅ Test coverage ≥70% across all repos
- ✅ A11y critical violations = 0
- ✅ CI green on all 4 repos
- ✅ E2E smoke tests pass 3 consecutive runs
- ✅ Performance baselines established

---

## 📊 EFFORT SUMMARY

| Dimension | Estimate |
|-----------|----------|
| P0 Issues | 20-25 hours |
| P1 Issues | 25-35 hours |
| P2 Issues | 15-25 hours |
| **Total Stabilization** | **60-85 hours** |
| **Timeline** | **2-3 weeks** |

---

## 🎯 NEXT STEPS (PART 5)

**PART 5: Test Strategy & CI Gates** will:

1. ✅ Use this backlog as input
2. 📋 Define test pyramid per repo (unit/component/E2E)
3. 🎯 Create CI gate configurations
4. 📊 Set coverage targets
5. ✨ Configure GitHub Actions workflows

**Timeline**: Dec 29-30 (EST 4 hours)

---

**PART 4 Status**: ✅ STABILIZATION BACKLOG CREATED

**Deliverables**:
- ✅ 45+ issues identified and prioritized
- ✅ P0 (10), P1 (18), P2 (17) buckets created
- ✅ Effort estimates for all items
- ✅ Implementation roadmap (5 phases)
- ✅ Owner assignments (TBD pending stakeholder review)
- ✅ GitHub issue templates ready
- ✅ Quick-start action items for next 48 hours

**Critical Blocking Items** (P0): 10 items requiring 20-25 hours
**Should-Do Items** (P1): 18 items requiring 25-35 hours
**Nice-to-Have Items** (P2): 17 items for post-release

Say **"Ready for PART 5"** to proceed with Test Strategy & CI Gates configuration.

