# Week 3: Security Hardening, Code Quality & E2E Testing (40 hours)

**Period:** January 8-12, 2025  
**Total Hours:** 40 hours allocated  
**Status:** 📋 SCHEDULED - Ready to begin after Week 2 sign-off

---

## Week 3 Objectives

### Task 3.1: Security Vulnerability Patching (12 hours)
**Objective:** Remediate all high-severity vulnerabilities and establish security baseline

#### Current Vulnerability Status
```
Admin Portal: 2 moderate (esbuild in vite)
Wallet Web: 2 moderate (esbuild in vite)
Mobile App: 9 (4 moderate, 5 high - React Native CLI tools)
Mobile Wallet: 5 (5 high - React Native CLI tools)
AI Agents: 0 critical ✅

Total: 18 vulnerabilities
Target: 0 critical, <5 high
```

#### Patching Strategy

**Part 1: Vite/esbuild Vulnerabilities (Web Projects) - 3 hours**

```bash
# Update Vite to latest stable
cd swipesavvy-admin-portal && npm update vite@latest --save
cd swipesavvy-wallet-web && npm update vite@latest --save

# Verify esbuild resolved
npm audit --depth=1

# Expected: esbuild vulnerability removed
```

**Part 2: React Native CLI Vulnerabilities (Mobile Apps) - 4 hours**

```bash
# Update React Native community CLI
cd swipesavvy-mobile-app && npm update @react-native-community/cli@latest --save
cd swipesavvy-mobile-wallet-native && npm update @react-native-community/cli@latest --save

# The ip package vulnerability should be transitively resolved
npm audit

# If still failing, update ip directly
npm update ip@latest --save
```

**Part 3: Audit and Documentation - 5 hours**

```bash
# Run comprehensive audits
npm audit --json > npm-audit-baseline.json
pip audit > pip-audit-baseline.txt

# Review results and document acceptable exceptions
# Create exception process document
# Add approved vulnerabilities list to governance policy
```

#### Vulnerability Assessment Criteria

**CRITICAL Vulnerabilities:** Must fix immediately
- Remote code execution (RCE)
- SQL injection risks
- Authentication bypass
- Privilege escalation

**HIGH Vulnerabilities:** Must fix before production
- Denial of service (DoS)
- Information disclosure
- Cross-site scripting (XSS) in dependencies
- Dependency confusion

**MODERATE Vulnerabilities:** Fix within 2 weeks
- Low impact security issues
- Dev environment only
- Non-critical features affected
- Requires user interaction

**LOW Vulnerabilities:** Fix within 1 month
- Minimal impact
- Outdated/deprecated packages
- No security risk if used correctly

#### Exception Approval Process

For vulnerabilities that cannot be fixed immediately:

1. **Document the Vulnerability**
   - CVE ID and severity
   - Impact assessment
   - Why it can't be fixed

2. **Mitigation Strategy**
   - Workaround or isolation
   - Reduced risk factors
   - Timeline for fix

3. **Approval**
   - Tech Lead review
   - Security team approval
   - Document approval

4. **Tracking**
   - Add to exceptions list
   - Review quarterly
   - Plan resolution

#### Testing After Patches

```bash
# After each patch, run:
npm install  # Regenerate lock files
npm run build  # Verify no breaking changes
npm test  # Run full test suite
npm audit  # Verify vulnerability resolved
```

---

### Task 3.2: Code Quality & Performance (14 hours)
**Objective:** Implement linting, formatting, and type checking across all projects

#### Part 1: JavaScript/TypeScript Tools Setup - 5 hours

**ESLint Configuration**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "@typescript-eslint/explicit-types": "warn"
  }
}
```

**Prettier Configuration**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**TypeScript Strict Mode**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Setup Steps:**
```bash
# For each project (admin-portal, wallet-web, mobile-app, mobile-wallet-native):

# Install dependencies
npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Create configs
cp .eslintrc.json.template .eslintrc.json
cp .prettierrc.json.template .prettierrc.json

# Run linter
npm run lint

# Auto-fix issues
npm run lint -- --fix

# Format code
npm run format
```

#### Part 2: Python Tools Setup - 4 hours

**Black Configuration**
```python
[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'
exclude = '''
/(
    \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | _build
  | buck-out
  | build
  | dist
)/
'''
```

**Flake8 Configuration**
```ini
[flake8]
max-line-length = 100
exclude = .git,__pycache__,build,dist,.venv
ignore = E203,W503
```

**MyPy Configuration**
```ini
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_incomplete_defs = True
check_untyped_defs = True
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
warn_no_return = True
strict_optional = True
```

**Setup Steps:**
```bash
cd swipesavvy-ai-agents

# Install tools
pip install black flake8 mypy isort

# Format code
black app/ tests/

# Sort imports
isort app/ tests/

# Lint code
flake8 app/ tests/

# Type check
mypy app/
```

#### Part 3: Performance Baseline & Optimization - 5 hours

**Frontend Performance Metrics:**
```bash
# Run Lighthouse audit
npm run build
npm run preview
# In browser: Chrome DevTools → Lighthouse → Analyze

# Target scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >95
# - SEO: >95
```

**Backend Performance Metrics:**
```bash
# API endpoint benchmarking
wrk -t4 -c100 -d30s http://localhost:8000/api/wallet/balance

# Target:
# - Requests/sec: >500
# - Avg latency: <100ms
# - Max latency: <500ms
```

**Database Query Optimization:**
```sql
-- Identify slow queries
EXPLAIN ANALYZE
SELECT * FROM transactions 
WHERE user_id = '123' 
ORDER BY created_at DESC 
LIMIT 20;

-- Target: <50ms execution time
```

---

### Task 3.3: End-to-End Testing with Playwright (10 hours)
**Objective:** Implement comprehensive E2E test coverage for all critical user flows

#### Playwright Setup

```bash
npm install --save-dev @playwright/test

# Generate test file
npx playwright codegen http://localhost:5173
```

#### Web App E2E Tests (Admin Portal)

**Test Suite: 10 test cases**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Portal E2E', () => {
  
  test('User can login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('http://localhost:5173/dashboard');
    await expect(page.locator('text=Welcome, Admin')).toBeVisible();
  });

  test('Admin can view user list', async ({ page }) => {
    await page.goto('http://localhost:5173/users');
    
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(20);
    
    // Test pagination
    await page.click('button[aria-label="Next page"]');
    await expect(page).toHaveURL(/page=2/);
  });

  test('Admin can edit user details', async ({ page }) => {
    await page.goto('http://localhost:5173/users/user-123/edit');
    
    await page.fill('input[name="name"]', 'Updated Name');
    await page.fill('input[name="email"]', 'newemail@example.com');
    await page.click('button:has-text("Save Changes")');
    
    await expect(page.locator('text=User updated successfully')).toBeVisible();
  });

  test('Admin can search transactions', async ({ page }) => {
    await page.goto('http://localhost:5173/transactions');
    
    await page.fill('input[placeholder="Search transactions"]', 'wallet-123');
    await page.click('button:has-text("Search")');
    
    await expect(page.locator('text=wallet-123')).toBeVisible();
  });

  test('Admin can view transaction details', async ({ page }) => {
    await page.goto('http://localhost:5173/transactions/txn-789');
    
    await expect(page.locator('text=Transaction Details')).toBeVisible();
    await expect(page.locator('text=Status: Completed')).toBeVisible();
    await expect(page.locator('text=Amount: $100.00')).toBeVisible();
  });

  test('Admin can view analytics dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/analytics');
    
    await expect(page.locator('canvas')).toHaveCount(3); // Charts
    await expect(page.locator('text=Total Users:')).toBeVisible();
    await expect(page.locator('text=Total Transactions:')).toBeVisible();
  });

  test('Admin can export user data', async ({ page }) => {
    await page.goto('http://localhost:5173/users');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export CSV")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('users');
  });

  test('Admin can logout', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    
    await page.click('button[aria-label="User menu"]');
    await page.click('button:has-text("Logout")');
    
    await expect(page).toHaveURL('http://localhost:5173/login');
  });

  test('Unauthorized user cannot access dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    
    await expect(page).toHaveURL('http://localhost:5173/login');
  });

  test('Session expires after 1 hour of inactivity', async ({ page, context }) => {
    await page.goto('http://localhost:5173/login');
    
    // Simulate 1 hour passing
    await context.addCookies([{
      name: 'auth_token',
      value: 'expired-token',
      url: 'http://localhost:5173'
    }]);
    
    await page.goto('http://localhost:5173/dashboard');
    
    await expect(page).toHaveURL('http://localhost:5173/login');
  });
});
```

#### Wallet Portal E2E Tests

**Test Suite: 8 test cases**

```typescript
test.describe('Wallet Portal E2E', () => {
  
  test('User can view account balance', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    await expect(page.locator('text=Account Balance')).toBeVisible();
    await expect(page.locator('[data-testid="balance"]')).toContainText('$');
  });

  test('User can send transaction', async ({ page }) => {
    await page.goto('http://localhost:5174/send');
    
    await page.fill('input[name="recipient"]', '0x742d35Cc6634C0532925a3b844Bc9e7595f42172');
    await page.fill('input[name="amount"]', '50');
    await page.click('button:has-text("Send")');
    
    await expect(page.locator('text=Transaction sent successfully')).toBeVisible();
  });

  test('User can view transaction history', async ({ page }) => {
    await page.goto('http://localhost:5174/history');
    
    await expect(page.locator('text=Transaction History')).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(20);
  });

  test('User can request funds', async ({ page }) => {
    await page.goto('http://localhost:5174/request');
    
    await page.fill('input[name="amount"]', '100');
    await page.click('button:has-text("Generate Request")');
    
    await expect(page.locator('text=Share this link')).toBeVisible();
  });

  test('User can enable biometric login', async ({ page }) => {
    await page.goto('http://localhost:5174/settings');
    
    await page.click('input[name="biometric"]');
    await page.click('button:has-text("Enable")');
    
    await expect(page.locator('text=Biometric enabled')).toBeVisible();
  });

  test('User can download statements', async ({ page }) => {
    await page.goto('http://localhost:5174/history');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download PDF")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('statement');
  });

  test('User can filter transactions by date', async ({ page }) => {
    await page.goto('http://localhost:5174/history');
    
    await page.fill('input[type="date"][name="startDate"]', '2025-01-01');
    await page.fill('input[type="date"][name="endDate"]', '2025-01-05');
    await page.click('button:has-text("Filter")');
    
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('User can update profile', async ({ page }) => {
    await page.goto('http://localhost:5174/profile');
    
    await page.fill('input[name="phone"]', '+1234567890');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Profile updated')).toBeVisible();
  });
});
```

#### Mobile App E2E Tests

**Test Suite: 8 test cases (Simulator/Emulator)**

```bash
# Run on iOS Simulator
npm run detox:test:ios

# Run on Android Emulator
npm run detox:test:android

# Test cases:
# 1. App launches without crashing
# 2. User can login with valid credentials
# 3. User can view wallet balance
# 4. User can send transaction
# 5. User can receive transaction
# 6. User can view transaction history
# 7. User can scan QR code
# 8. User can logout
```

#### E2E Test Execution

```bash
# Run all E2E tests
npm run test:e2e

# Run with headed browser (visible)
npm run test:e2e -- --headed

# Generate HTML report
npm run test:e2e -- --reporter=html

# Run specific test file
npm run test:e2e -- tests/e2e/admin-portal.spec.ts
```

#### Performance Testing with E2E

```typescript
test('Page load performance', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});

test('API response time', async ({ page }) => {
  const startTime = Date.now();
  
  const response = await page.request.get('http://localhost:8000/api/wallet/balance', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const responseTime = Date.now() - startTime;
  expect(responseTime).toBeLessThan(100); // 100ms
  expect(response.status()).toBe(200);
});
```

---

### Task 3.4: Load Testing & Optimization (4 hours)
**Objective:** Verify performance under load and identify bottlenecks

#### Load Testing with k6

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:8000';
const AUTH_TOKEN = 'your-valid-token';

export default function () {
  const response = http.get(
    `${BASE_URL}/api/wallet/balance`,
    {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

#### Load Test Scenarios

**Scenario 1: Sustained Load (100 users)**
```bash
k6 run scenarios/sustained-load.js

# Expected Results:
# Requests/sec: >500
# P50 latency: <50ms
# P95 latency: <100ms
# P99 latency: <200ms
# Error rate: <1%
```

**Scenario 2: Spike Test (1000 users)**
```bash
k6 run scenarios/spike-test.js

# Expected Results:
# Peak Requests/sec: >2000
# P99 latency during spike: <500ms
# Error rate during spike: <5%
# Recovery time: <2 minutes
```

**Scenario 3: Soak Test (50 users for 2 hours)**
```bash
k6 run --duration=2h scenarios/soak-test.js

# Expected Results:
# Memory stable (no leaks)
# Latency consistent
# Error rate: <1%
# No timeout failures
```

---

## Week 3 Success Criteria

### Security
- [ ] 0 critical vulnerabilities
- [ ] npm audit clean
- [ ] pip audit clean
- [ ] Exceptions documented and approved

### Code Quality
- [ ] ESLint passes with 0 errors
- [ ] Prettier formatting consistent
- [ ] TypeScript strict mode compiles
- [ ] Python code passes Black, Flake8, MyPy
- [ ] Grade: A+ on code quality

### E2E Testing
- [ ] 18 E2E tests implemented
- [ ] 18/18 tests passing
- [ ] Web app tests (10)
- [ ] Wallet tests (8)
- [ ] 100% critical path coverage

### Performance
- [ ] Load test: 500+ req/s sustained
- [ ] Latency: <100ms p95
- [ ] No memory leaks (2-hour soak)
- [ ] Spike handling: <5% error rate

---

## Files to Create in Week 3

1. `.eslintrc.json` (4 projects)
2. `.prettierrc.json` (4 projects)
3. `tsconfig.json` (updated with strict mode)
4. `pyproject.toml` (Python)
5. `.flake8` (Python)
6. `e2e/admin-portal.spec.ts`
7. `e2e/wallet-portal.spec.ts`
8. `e2e/mobile-app.spec.ts`
9. `load-tests/sustained-load.js`
10. `load-tests/spike-test.js`
11. `load-tests/soak-test.js`
12. `WEEK_3_COMPLETION_SUMMARY.md`

---

## Estimated Timeline

| Day | Task | Hours | Status |
|-----|------|-------|--------|
| Wed | Security patching | 12 | 📋 |
| Thu | Code quality setup | 14 | 📋 |
| Fri | E2E testing | 10 | 📋 |
| Fri | Load testing | 4 | 📋 |

---

**Status:** 📋 Ready for Week 3 execution  
**Next Review:** January 12, 2025 (End of Week 3)  
**Target Platform Grade:** A- (after Week 3)

