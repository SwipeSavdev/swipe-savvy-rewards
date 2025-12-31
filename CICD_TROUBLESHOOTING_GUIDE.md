# CI/CD Troubleshooting & Runbook Guide

**Purpose:** Help developers diagnose and fix CI/CD pipeline failures quickly

**Last Updated:** December 28, 2025  
**Version:** 1.0  
**Audience:** All developers

---

## Quick Troubleshooting Matrix

| Symptom | Most Likely Cause | Solution |
|---------|-------------------|----------|
| "npm ERR! code ERESOLVE" | Dependency conflict | Section: [NPM Dependency Issues](#npm-dependency-issues) |
| Red ESLint check | Code style violation | Section: [ESLint Failures](#eslint-failures) |
| Red TypeScript check | Type mismatch | Section: [TypeScript Failures](#typescript-failures) |
| Red Security Audit | Known vulnerability | Section: [Security Scan Failures](#security-scan-failures) |
| Red Test check | Test assertion failed | Section: [Test Failures](#test-failures) |
| Red Python import check | Python dependency missing | Section: [Python Import Issues](#python-import-issues) |
| Build takes too long | Cache issue or large bundle | Section: [Slow Build Performance](#slow-build-performance) |
| Workflow not triggering | GitHub Actions configuration | Section: [Workflow Not Triggering](#workflow-not-triggering) |

---

## Understanding GitHub Actions Workflow

### Workflow Anatomy

```
Pull Request Created
         ↓
GitHub Actions Triggered
         ↓
┌────────────────────────────────────────┐
│   ci-nodejs.yml (5-10 min)            │
│  ├─ version-check                     │
│  ├─ lock-file-validation              │
│  ├─ lint (ESLint)                     │
│  ├─ type-check (TypeScript)           │
│  ├─ build                             │
│  └─ npm audit (security)              │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│   ci-python.yml (5-10 min)            │
│  ├─ version-check                     │
│  ├─ dependency-check                  │
│  ├─ lint (Black, Flake8)              │
│  ├─ type-check (MyPy)                 │
│  └─ test (pytest)                     │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│   test-e2e.yml (10-15 min)            │
│  ├─ admin-portal E2E tests (10 tests) │
│  ├─ wallet-web E2E tests (10 tests)   │
│  └─ k6 load tests (3 scenarios)       │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│   security-audit.yml (5 min)          │
│  ├─ npm audit                         │
│  ├─ Safety (Python)                   │
│  ├─ Bandit (Python)                   │
│  └─ Snyk (optional)                   │
└────────────────────────────────────────┘
         ↓
All Checks Pass → Ready to Merge ✅
```

### Viewing Workflow Status

1. **In GitHub PR:** Scroll to "Checks" tab
2. **Detailed logs:** Click on failing check → "View details"
3. **Full workflow:** Go to "Actions" tab in repo → select workflow run

---

## Node.js CI/CD Issues

### ESLint Failures

**Error Message Example:**
```
error  Unexpected var, use let or const instead (no-var)
```

**Quick Fix:**
```bash
# See what ESLint found
npm run lint

# Auto-fix what's possible (80% of issues)
npm run lint -- --fix

# Manually fix the rest (ESLint should tell you line number)
# Common issues:
# - var keyword (use const/let instead)
# - Missing semicolons
# - Extra whitespace
```

**If still failing after --fix:**
```bash
# Check which rules are failing
npm run lint -- --format json > lint-report.json

# Look at the rule name and check eslintrc
cat .eslintrc.json

# If rule is too strict, discuss with team about changing it
```

**Prevention:**
- Enable ESLint in your IDE (see onboarding guide)
- Format on save (Prettier handles 90% of style issues)
- Run `npm run lint` before pushing

### TypeScript Failures

**Error Message Example:**
```
error TS2339: Property 'email' does not exist on type 'User'
```

**Quick Fix:**
```bash
# See all TypeScript errors
npm run type-check

# Find the exact file and line number
# Open that file and hover to see error details in IDE

# Common fixes:
# - Add missing type annotation: const user: User = ...
# - Import missing type: import type { User } from './types'
# - Fix property name: user.email not user.mail
```

**Understanding TypeScript Errors:**

```typescript
// ❌ Error: Property 'email' does not exist
type User = { id: number; name: string };
const user: User = { id: 1, name: "John", email: "john@example.com" };
                                          ^^^^^ ← Added property not in type

// ✅ Fix: Add property to type
type User = { id: number; name: string; email: string };
const user: User = { id: 1, name: "John", email: "john@example.com" };
```

**Prevention:**
- Use strict TypeScript mode
- Run `npm run type-check` before pushing
- Enable TypeScript checking in IDE

### NPM Dependency Issues

**Error Message Example:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Quick Fix:**
```bash
# Option 1: Delete and reinstall (best)
rm -rf node_modules package-lock.json
npm ci

# Option 2: Force resolution (only if necessary)
npm install --legacy-peer-deps
# BUT: report issue to team lead!

# Option 3: Check what's conflicting
npm ls  # Shows dependency tree
```

**Understanding Dependency Conflicts:**

```json
// package.json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "some-library": "1.0.0"  // requires "react": "^17.0.0"
  }
}
// Conflict: react 18.2.0 but some-library wants 17.x
```

**Solutions:**
1. Update conflicting library to newer version
2. Check if newer library version supports React 18
3. Remove library if not essential
4. If no solution exists, document exception and escalate

**Prevention:**
- Use `npm ci` not `npm install`
- Check compatibility before adding dependencies
- Run `npm audit` before committing

### Build Failures

**Error Message Example:**
```
error in vite build
The entry file (src/main.tsx) does not exist
```

**Quick Fix:**
```bash
# Verify all required files exist
ls src/main.tsx
ls src/index.html

# Verify build config
cat vite.config.ts

# Try building locally first
npm run build

# Check output for actual error message (scroll up in logs)
```

**Common Build Issues:**

| Error | Cause | Fix |
|-------|-------|-----|
| "entry file does not exist" | File moved/deleted | Create missing file |
| "Module not found" | Import path wrong | Fix import path |
| "Cannot find module" | Dependency missing | Run `npm ci` |
| "SyntaxError" | Invalid code | Fix syntax error |
| "Out of memory" | Build too large | Check for circular deps |

**Prevention:**
- Run `npm run build` locally before pushing
- Keep bundle size reasonable
- Avoid circular dependencies

---

## Python CI/CD Issues

### Python Import Failures

**Error Message Example:**
```
ModuleNotFoundError: No module named 'pandas'
```

**Quick Fix:**
```bash
# Activate virtual environment
cd swipesavvy-ai-agents
source venv/bin/activate  # Windows: venv\Scripts\activate

# Verify requirements are installed
pip install -r requirements-pinned.txt

# Check what's installed
pip list | grep pandas  # Check specific package

# If still missing
pip install pandas==<version from requirements-pinned.txt>
```

**Understanding Python Dependencies:**

```bash
# requirements-pinned.txt has exact versions
pandas==2.1.3
numpy==1.24.0
flask==3.0.0

# Never use:
pip install pandas  # Gets latest, may not match tests

# Always use:
pip install -r requirements-pinned.txt
# Gets EXACT versions specified
```

**Prevention:**
- Always activate venv before running code
- Use `pip install -r requirements-pinned.txt`
- Never add new dependencies without team discussion

### Python Linting Failures (Black/Flake8)

**Error Message Example:**
```
error: cannot format stdin: Cannot parse: 1:22: f'{key}'
```

**Quick Fix:**
```bash
# Activate venv
source venv/bin/activate

# Auto-format with Black
black app/

# Check style with Flake8
flake8 app/

# Fix remaining issues manually
# Common issues:
# - Line too long: break into multiple lines
# - Unused imports: remove them
# - Multiple blank lines: reduce to 1-2
```

**Understanding Black Formatting:**

```python
# ❌ Before (Black reformats)
def calculate_total(items: List[Dict[str, Any]]) -> float:
    return sum([item['price'] * item['quantity'] for item in items if item.get('active')])

# ✅ After (Black formats for readability)
def calculate_total(items: List[Dict[str, Any]]) -> float:
    return sum(
        [
            item["price"] * item["quantity"]
            for item in items
            if item.get("active")
        ]
    )
```

**Prevention:**
- Enable Black formatter in IDE
- Run `black .` before committing
- Enable format-on-save in IDE

### Python Type-Check Failures (MyPy)

**Error Message Example:**
```
error: Argument 1 to "process_data" has incompatible type "str"; expected "int"
```

**Quick Fix:**
```bash
# See what MyPy found
mypy app/

# Add type annotations
# ❌ Without types
def process_data(value):
    return value * 2

# ✅ With types
def process_data(value: int) -> int:
    return value * 2

# Use type comments if needed
data = get_data()  # type: List[str]
```

**Prevention:**
- Add type hints to all functions
- Run `mypy app/` before pushing
- Enable MyPy checking in IDE

### Python Test Failures

**Error Message Example:**
```
FAILED tests/test_auth.py::test_login_success - AssertionError: expected 200 but got 401
```

**Quick Fix:**
```bash
# Run test locally first
pytest tests/test_auth.py::test_login_success -v

# Understand what failed
# -v = verbose (shows assertion details)
# -s = show print statements
# -x = stop on first failure

# Check test file for what it expects
cat tests/test_auth.py | grep -A 10 "def test_login_success"

# Fix the issue (usually in the code, not test)
```

**Understanding Test Failures:**

```python
# Test expects login to return 200
def test_login_success(client):
    response = client.post('/login', json={'user': 'test', 'password': 'pass'})
    assert response.status_code == 200
    assert response.json()['token'] is not None

# If failing:
# 1. Check what status code actually returned (add print)
# 2. Check if login endpoint exists
# 3. Check if database has test data
# 4. Check if dependencies are running (PostgreSQL, Redis)
```

**Prevention:**
- Run `pytest` locally before pushing
- Write tests as you write code
- Keep test data in fixtures

---

## Security Scan Failures

### npm Audit Issues

**Error Message Example:**
```
npm audit
19 vulnerabilities found

High          | Prototype Pollution           | express-validator 6.14.0
High          | Regular Expression DoS       | lodash 4.17.20
```

**Quick Fix:**
```bash
# See detailed report
npm audit

# Try auto-fix (fixes many)
npm audit fix

# See what changed
git diff package-lock.json

# If auto-fix doesn't work
npm update <package-name>

# Manual fix if needed
# Edit package.json to newer safe version
npm ci
```

**Understanding Vulnerability Severity:**

| Severity | SLA | Action |
|----------|-----|--------|
| Critical (CVSS 9.0+) | 24 hours | Fix immediately, escalate |
| High (CVSS 7.0-8.9) | 1 week | Create issue, plan fix |
| Medium (CVSS 4.0-6.9) | 2 weeks | Schedule in sprint |
| Low (CVSS 0.0-3.9) | Quarterly | Track, fix when convenient |

**If Can't Fix Immediately:**
```bash
# Document exception request
# Create issue with:
# - Package name and vulnerability
# - Why it can't be fixed now
# - Target fix date
# - Risk assessment

# Example:
# Issue: "Critical: lodash prototype pollution vulnerability"
# Why can't fix: "Library X requires lodash 4.17.20, doesn't support 4.17.21"
# Fix date: "Jan 15, 2026 (when we can update library X)"
# Risk: "Mitigated by input validation in endpoints"
```

**Prevention:**
- Run `npm audit` before committing
- Update dependencies regularly
- Don't ignore high/critical vulnerabilities

### Python Safety/Bandit Issues

**Error Message Example:**
```
[HIGH] Use of insecure MD5 hash function.
File: app/auth.py, Line 42
```

**Quick Fix:**
```bash
# See what Safety found
safety check

# See what Bandit found
bandit -r app/

# Fix the issue (usually code change)
# Example: Use hashlib.sha256 instead of md5
import hashlib

# ❌ Insecure
password_hash = hashlib.md5(password.encode()).hexdigest()

# ✅ Secure
password_hash = hashlib.sha256(password.encode()).hexdigest()

# Verify fix
bandit -r app/
```

**Prevention:**
- Review security best practices
- Use established libraries for crypto
- Run `safety check` and `bandit -r app/` before pushing

---

## Test Failures

### E2E Test Failures

**Error Message Example:**
```
Timeout 30000ms exceeded. Waiting for locator('.login-button')
```

**Quick Fix:**
```bash
# Run E2E tests locally
npm run test:e2e

# Check if app is running
npm run dev
# In another terminal: npm run test:e2e

# Understand what failed
# - Timeout: element didn't appear in time
# - Not found: selector is wrong or page changed
# - Wrong value: assertion didn't match

# Fix:
# 1. Update selector if page changed
# 2. Add wait if timing issue
# 3. Check if app logic changed
```

**Understanding E2E Tests:**

```javascript
// Playwright test example
test('user can login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  
  // Wait for element and fill
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // Click button
  await page.click('button:has-text("Login")');
  
  // Wait and verify
  await page.waitForNavigation();
  await expect(page).toHaveURL('**/dashboard');
});
```

**Prevention:**
- Run E2E tests before pushing
- Use stable selectors (test-id attributes)
- Don't make tests dependent on timing

### Load Test Failures

**Error Message Example:**
```
FAILED RPS exceeded threshold: 95% > 90%
```

**Quick Fix:**
```bash
# Run load test locally
npm run test:load

# Check what scenario failed
# - Sustained load: handles continuous traffic
# - Spike load: handles sudden traffic spike
# - Soak test: handles sustained load over time

# Fix:
# 1. Optimize slow endpoints
# 2. Add caching
# 3. Scale resources
# 4. If can't improve: discuss threshold with team

# Example optimization
# ❌ Slow: Queries database for each request
# ✅ Fast: Cache results, use indexes
```

**Prevention:**
- Run load tests before pushing
- Monitor endpoint performance
- Optimize slow queries

---

## Slow Build Performance

### Diagnosing Slow Builds

```bash
# Measure build time
npm run build

# Detailed analysis
npm run build -- --debug

# Check bundle size
npm run build
# Look for output like: "dist/index.js 1.5mb (gzip: 450kb)"
# If too large:
# - Remove unused dependencies
# - Use dynamic imports
# - Enable tree-shaking
```

### Common Performance Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Cache not working | Node modules changed | Delete `node_modules/`, run `npm ci` |
| Large bundle | Unused code/deps | Use `npm ls` to find bloat |
| Slow transpilation | TypeScript overhead | Enable incremental compilation |
| Slow tests | Too many/slow tests | Run only affected tests |

---

## Workflow Not Triggering

### Debugging Workflow Triggers

**Check:** Workflows only run on:
- Push to `main` branch
- Pull requests (any branch)
- Scheduled times (daily, weekly)

**If workflow not running:**

```bash
# Check workflow file syntax
# Workflows are in: .github/workflows/*.yml

# Common issues:
# 1. Branch name typo
# 2. Workflow not enabled in Settings
# 3. Event not specified
# 4. Syntax error in YAML

# Verify workflow is enabled:
# GitHub → Settings → Actions → General → Workflows enabled

# Check syntax:
# GitHub → Actions → View workflow file → Checks section
```

**Manual Trigger (if needed):**
```bash
# Some workflows support manual trigger
# Go to: Actions → [Workflow Name] → "Run workflow" button
```

---

## Getting More Information

### Accessing Workflow Logs

1. **GitHub UI:**
   - Pull Request → Checks tab → Click failing check → View logs
   
2. **Via Command Line:**
   ```bash
   # List recent workflow runs
   gh run list
   
   # View logs of specific run
   gh run view <run-id> --log
   ```

3. **Artifacts:**
   - Some workflows upload test reports
   - Download from Artifacts section in Actions tab

### Contacting DevOps Team

For issues you can't resolve:

```
Slack: #devops-support
Message template:

I have a failing CI check: [NAME]
PR: #[NUMBER]
Error: [ERROR MESSAGE]
Steps I've tried:
1. [First thing]
2. [Second thing]

Repository link: [LINK]
Expected behavior: [WHAT SHOULD HAPPEN]
```

---

## Prevention Checklist

Before pushing any code:

- [ ] Run locally: `npm test && npm run build`
- [ ] Check linting: `npm run lint`
- [ ] Check types: `npm run type-check`
- [ ] Check security: `npm audit`
- [ ] Format code: `npm run format`
- [ ] All tests pass: `npm test`
- [ ] No console errors in app
- [ ] Commit message is semantic

**For Python:**
- [ ] Activate venv
- [ ] Run tests: `pytest`
- [ ] Check format: `black . && flake8 .`
- [ ] Check types: `mypy app/`
- [ ] Check security: `safety check && bandit -r app/`

---

## Quick Reference Commands

### Node.js
```bash
npm ci                    # Install dependencies exactly
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run all tests
npm run lint             # Check code style
npm run format           # Fix code style
npm run type-check       # Check TypeScript
npm audit               # Check security
```

### Python
```bash
source venv/bin/activate      # Activate environment
pip install -r requirements-pinned.txt  # Install deps
pytest                        # Run all tests
pytest -v                     # Verbose output
pytest -s                     # Show prints
black .                       # Format code
flake8 app/                  # Check style
mypy app/                    # Check types
safety check                 # Check security
bandit -r app/              # Check for security issues
```

### Git
```bash
git status               # See changes
git add .               # Stage all changes
git commit -m "msg"     # Commit with message
git push                # Push to remote
git pull                # Get latest
```

---

## Summary

**When CI fails:**
1. Click on failing check in GitHub
2. Read error message carefully
3. Use this guide to find solution
4. Apply fix locally
5. Re-run locally to verify fix works
6. Push changes (CI will re-run)
7. If still stuck, ask in #devops-support

**Best practice:** Run all checks locally BEFORE pushing:
```bash
npm test && npm run build && npm run lint && npm audit && npm run type-check
```

**Remember:** Fixing locally is 10x faster than fixing in CI!

---

**Still need help? Post in #devops-support with error message and PR link**
