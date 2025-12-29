# Phase 2 Test Execution - Quick Start Guide

**Updated**: December 26, 2025 20:35 UTC

## 🚀 Run Tests in 5 Minutes

### Option 1: Admin Portal E2E Tests (Recommended First)

```bash
# Terminal 1: Start admin portal dev server
cd /Users/macbookpro/Documents/swipesavvy-admin-portal
npm run dev

# Terminal 2: Run E2E tests (in a new terminal)
cd /Users/macbookpro/Documents/swipesavvy-admin-portal
npx playwright test tests/e2e.admin-portal.spec.ts --ui

# View results
npx playwright show-report
```

**Expected Duration**: 2-3 minutes  
**Expected Pass Rate**: 6-8 out of 9 tests  
**Common Issues**: Database not populated, auth token invalid

---

### Option 2: Mobile App API Contract Tests

```bash
# Terminal 1: Start backend API (if not already running)
cd /Users/macbookpro/Documents/swipesavvy-mobile-app
source .venv/bin/activate
python main.py

# Terminal 2: Run API tests (in a new terminal)
cd /Users/macbookpro/Documents/swipesavvy-mobile-app
npx playwright test tests/api-contracts.spec.ts

# View results
npx playwright show-report
```

**Expected Duration**: 1-2 minutes  
**Expected Pass Rate**: 12-15 out of 15 tests  
**Common Issues**: Backend not running, database connection error

---

### Option 3: Run Both Suites (Full Phase 2 Execution)

```bash
# Terminal 1: Start admin portal
cd /Users/macbookpro/Documents/swipesavvy-admin-portal && npm run dev

# Terminal 2: Start backend API
cd /Users/macbookpro/Documents/swipesavvy-mobile-app
source .venv/bin/activate && python main.py

# Terminal 3: Run both test suites
cd /Users/macbookpro/Documents/swipesavvy-admin-portal
npx playwright test tests/e2e.admin-portal.spec.ts
cd ../swipesavvy-mobile-app
npx playwright test tests/api-contracts.spec.ts

# View combined results
npx playwright show-report
```

**Expected Total Duration**: 4-5 minutes  
**Expected Combined Pass Rate**: ≥90%

---

## 📊 What's Ready

### Test Infrastructure ✅

| Component | Status | Details |
|-----------|--------|---------|
| **E2E Tests** | ✅ Ready | 9 tests in `swipesavvy-admin-portal/tests/e2e.admin-portal.spec.ts` |
| **API Tests** | ✅ Ready | 15 tests in `swipesavvy-mobile-app/tests/api-contracts.spec.ts` |
| **Playwright** | ✅ Installed | Both repos have `@playwright/test` installed |
| **Config Files** | ✅ Created | `playwright.config.ts` in both repos |
| **PII Logger** | ✅ Created | `pii_redaction_logger.py` in mobile-app |
| **CI/CD Config** | ✅ Created | `.gitlab-ci.yml` in mobile-app |
| **Documentation** | ✅ Complete | PHASE_2_SUMMARY.md, PHASE_2_TEST_EXECUTION_GUIDE.md |

---

## 🎯 Test Overview

### E2E Tests (Admin Portal)
```
✅ Admin Portal E2E - Critical Paths
  ├─ should login successfully with valid credentials
  ├─ should toggle feature flags and verify state change
  ├─ should view users list and filter by status
  ├─ should display analytics dashboard and verify metrics
  ├─ should view and filter audit logs
  ├─ should show error on invalid login
  └─ should redirect to login on session timeout

✅ Admin Portal Performance
  ├─ should load dashboard in under 3 seconds
  └─ should handle rapid feature flag toggles without errors
```

### API Contract Tests (Mobile App)
```
✅ Analytics Endpoints (4 tests)
✅ A/B Testing Endpoints (3 tests)
✅ Optimization Endpoints (3 tests)
✅ Error Handling (2 tests)
✅ Performance Baselines (2 tests)
✅ Integration Flows (1 test)
```

---

## 🔍 Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| "Browser not installed" | `npx playwright install chromium` |
| "Port 5173 in use" | `lsof -i :5173 \| grep -v COMMAND \| awk '{print $2}' \| xargs kill -9` |
| "Port 8000 in use" | `lsof -i :8000 \| grep -v COMMAND \| awk '{print $2}' \| xargs kill -9` |
| "Database connection error" | Verify PostgreSQL running: `psql -U postgres` |
| "Tests timeout (30s)" | Increase timeout in `playwright.config.ts` to 60000 |
| "Auth failures in tests" | Check admin user exists: `SELECT * FROM users WHERE email='admin@swipesavvy.local';` |

---

## 📈 Success Metrics

### Phase 2.1: E2E Test Execution
- ✅ Install Playwright
- ✅ Create test suite (9 tests)
- ✅ Run tests locally
- **Target**: ≥95% pass rate (9/9 tests)
- **Baseline**: ≥78% pass rate (7/9 tests)

### Phase 2.2: API Contract Test Execution
- ✅ Install Playwright
- ✅ Create test suite (15 tests)
- ✅ Run tests locally
- **Target**: ≥95% pass rate (15/15 tests)
- **Baseline**: ≥87% pass rate (13/15 tests)

### Combined Phase 2
- **Total Tests**: 24 (9 E2E + 15 API)
- **Target Pass Rate**: ≥95% (≥23 passing)
- **Minimum Acceptable**: ≥90% (≥22 passing)

---

## 📝 Test Results Template

```
╔══════════════════════════════════════════════════════════════╗
║           PHASE 2 TEST EXECUTION RESULTS                    ║
╚══════════════════════════════════════════════════════════════╝

E2E TESTS (Admin Portal)
├─ Total: 9
├─ Passed: __/9
├─ Failed: __/9
├─ Skipped: __/9
└─ Pass Rate: __%

API CONTRACT TESTS (Mobile App)
├─ Total: 15
├─ Passed: __/15
├─ Failed: __/15
├─ Skipped: __/15
└─ Pass Rate: __%

COMBINED RESULTS
├─ Total: 24
├─ Passed: __/24
├─ Failed: __/24
└─ Pass Rate: __%

STATUS: [ ] PASS (≥23/24) [ ] MARGINAL (22/24) [ ] FAIL (<22/24)

NEXT STEPS:
[ ] Review failures and debug
[ ] Fix failing tests
[ ] Re-run test suite
[ ] Generate HTML report
[ ] Proceed to unit tests

Generated: [DATE/TIME]
Duration: [MINUTES] minutes
```

---

## 🎓 Test Development Workflow

After running tests for the first time:

### For Failing Tests
1. Review test failure message in report
2. Check if it's a test issue or code issue
3. Update test selectors (data-testid) if needed
4. Verify test data exists in database
5. Re-run specific test: `npx playwright test -g "test name"`

### For Flaky Tests
1. Increase timeout if test is timing out
2. Add explicit waits for elements
3. Check if server is responding slowly
4. Consider environment factors (network, CPU)

### For Performance Tests
1. Check if baseline metrics are realistic
2. Profile application (DevTools → Performance)
3. Identify bottlenecks
4. Optimize if needed, or adjust baseline

---

## 📞 Getting Help

### Playwright Resources
- **Docs**: https://playwright.dev
- **API Reference**: https://playwright.dev/docs/api/class-test
- **Best Practices**: https://playwright.dev/docs/best-practices
- **Debugging**: https://playwright.dev/docs/debug

### SwipeSavvy Docs
- **PHASE_2_SUMMARY.md**: Overall Phase 2 summary
- **PHASE_2_TEST_EXECUTION_GUIDE.md**: Detailed execution guide
- **.gitlab-ci.yml**: CI/CD pipeline configuration

---

**Phase 2 Status**: 🟡 Infrastructure Complete, Awaiting Execution  
**Next Action**: Run E2E tests using Option 1 above  
**Time to Complete Phase 2**: 2-4 hours (including fixes and unit tests)

---
