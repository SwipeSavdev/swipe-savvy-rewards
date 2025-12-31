# 🚀 CI/CD Quick Reference Guide

**Last Updated:** January 19, 2025  
**For:** SwipeSavvy Development Team

---

## Workflow Overview (TL;DR)

| Workflow | Trigger | Duration | Purpose |
|----------|---------|----------|---------|
| **ci-nodejs.yml** | Push/PR | 15 min | Lint, type-check, build Node projects |
| **ci-python.yml** | Push/PR | 20 min | Lint, type-check, test Python project |
| **test-e2e.yml** | Manual/PR | 45 min | Run E2E & load tests |
| **security-audit.yml** | Daily 2 AM | 30 min | Scan dependencies for vulnerabilities |
| **deploy-docker.yml** | Any push | 30 min | Build & validate Docker images |
| **deploy-production.yml** | Tag push | 60 min | Deploy to staging/production |

---

## Quick Commands

### Push code to GitHub

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**What happens:**
1. ci-nodejs.yml runs (Node.js linting, type-check, build) ⏱️ 15 min
2. ci-python.yml runs (Python linting, type-check, test) ⏱️ 20 min
3. deploy-docker.yml runs (Docker build & validation) ⏱️ 30 min
4. All must pass before merge ✅

### Create a release

```bash
git tag v1.2.3
git push origin v1.2.3
```

**What happens:**
1. All CI workflows run ✅
2. Docker images built and pushed 📦
3. Deployed to staging automatically 🚀
4. Smoke tests run 🧪
5. Ready for production deployment (manual trigger available)

### Run E2E tests

```bash
# Go to GitHub Actions → test-e2e.yml → Run workflow
```

**Tests:**
- 10 Admin Portal Playwright tests ✅
- 10 Wallet Web Playwright tests ✅
- 3 k6 load test scenarios ✅

### Check security

```bash
# Go to GitHub Actions → security-audit.yml
# Runs daily at 2 AM UTC, or trigger manually
```

**Scans:**
- npm vulnerabilities 🔍
- Python vulnerabilities 🔍
- Bandit security issues 🔍
- Snyk vulnerabilities 🔍
- OWASP components 🔍

---

## Workflow Status

### Check if workflows are passing

1. Go to GitHub → Actions tab
2. Look for green checkmarks ✅ on latest runs
3. If red ❌, click to see error details

### Common Failures & Fixes

#### ESLint error: "line too long"

```bash
# Fix in project directory
npm run lint:fix
```

#### Black error: "code not formatted"

```bash
# Fix in swipesavvy-ai-agents
black app/
```

#### Type error: "Property 'x' is missing"

```bash
# Check TypeScript errors
npm run type-check
# or
npx tsc --noEmit
```

#### npm audit: "Critical vulnerability"

```bash
# Update package
npm update package-name
npm audit fix --force

# Commit updated package-lock.json
git add package-lock.json
git commit -m "Fix npm security vulnerability"
```

#### pytest failure: "Database connection error"

```bash
# CI runs PostgreSQL in Docker
# This usually works automatically
# If failing, check requirements-pinned.txt is valid
```

---

## Deployment

### Staging Deployment

**Automatic on:**
- Merge to main branch ✅

**Check status:**
1. Go to GitHub → Actions
2. Find "Deploy to Production" workflow
3. Look for "deploy-staging" job

### Production Deployment

**Manual trigger:**
1. Go to GitHub → Actions
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select "production" environment
5. Click "Run workflow"

**Automatic on:**
- Git tag: `git tag v1.2.3 && git push origin v1.2.3`

**Safety checks:**
- Pre-deployment verification ✅
- Backup creation 💾
- Smoke tests 🧪
- Automatic rollback on failure 🔄

---

## GitHub Secrets Setup (If Needed)

These should already be configured. If adding new secrets:

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add required secrets (ask DevOps team for values)

**Required secrets:**
- DOCKER_USERNAME
- DOCKER_PASSWORD
- DEPLOY_TOKEN
- SLACK_WEBHOOK

---

## Files to Know

### Configuration Files

```
.github/workflows/
├── ci-nodejs.yml           # Node.js CI pipeline
├── ci-python.yml           # Python CI pipeline
├── deploy-docker.yml       # Docker build pipeline
├── test-e2e.yml            # E2E & load tests
├── security-audit.yml      # Security scanning
└── deploy-production.yml   # Production deployment
```

### Documentation

```
WEEK_4_CICD_DOCUMENTATION.md     # Full technical docs
DEPLOYMENT_READINESS_CHECKLIST   # Setup checklist
WEEK_4_TASK_4_1_COMPLETE.md      # Completion report
CI_CD_QUICK_REFERENCE.md         # This guide
```

---

## Version Specifications

**You must use these versions:**

```
Node.js:  20.13.0  (check .nvmrc files)
npm:      10.8.2   (check package.json engines)
Python:   3.11.8   (check .python-version)
TypeScript: 5.5.4  (check package.json)
```

**Verify locally:**
```bash
node --version    # v20.13.0
npm --version     # 10.8.2
python --version  # 3.11.8
```

---

## Code Quality Requirements

**These must pass before merge:**

| Tool | Language | Check |
|------|----------|-------|
| ESLint | JavaScript/TypeScript | Linting rules |
| Prettier | JavaScript/TypeScript | Code formatting |
| TypeScript | TypeScript | Type safety |
| Black | Python | Code formatting |
| Flake8 | Python | Linting rules |
| MyPy | Python | Type safety |

**Fix locally before pushing:**

```bash
# Node.js projects
npm run lint       # Check errors
npm run lint:fix   # Auto-fix errors
npm run format     # Format with Prettier

# Python project (ai-agents)
black app/         # Auto-format
flake8 app/        # Check linting
mypy app/          # Check types
```

---

## Testing

### Unit Tests (Before Push)

```bash
# Node.js projects
npm run test

# Python project
pytest
```

### E2E Tests (On Demand)

```bash
# Go to GitHub Actions → test-e2e.yml → Run workflow
# Or locally:
npm run test:e2e  # In admin-portal or wallet-web
```

### Load Tests (On Demand)

```bash
# Go to GitHub Actions → test-e2e.yml → Check k6 results
# Runs 3 scenarios:
# - Sustained: 0→500 VUs over 5 min, hold 5 min
# - Spike: 50→500 VUs in 10 sec
# - Soak: 100 VUs for 30 min (main branch only)
```

---

## Help & Support

### Workflow Failed - What Now?

1. Click the ❌ red mark in GitHub Actions
2. Look for the failed job (usually in red)
3. Click "View all" to expand the logs
4. Search for "Error:" in the output
5. Compare with common failures above

### Still Stuck?

1. **ESLint/Black issues?** → Run fix commands locally first
2. **Test failures?** → Check test output, debug locally with `npm test`
3. **Docker build fails?** → Check Dockerfile syntax
4. **Deployment fails?** → Check secret configuration, rollback available
5. **Ask DevOps team** → Slack channel or email

### Resources

- CI/CD Docs: [WEEK_4_CICD_DOCUMENTATION.md](WEEK_4_CICD_DOCUMENTATION.md)
- Setup Guide: [DEPLOYMENT_READINESS_CHECKLIST.md](DEPLOYMENT_READINESS_CHECKLIST.md)
- Completion Report: [WEEK_4_TASK_4_1_COMPLETE.md](WEEK_4_TASK_4_1_COMPLETE.md)

---

## Best Practices

✅ **DO:**
- Keep dependencies pinned (no ^ or ~ in versions)
- Run linting locally before pushing
- Use meaningful commit messages
- Test locally before creating PR
- Request reviews from teammates
- Merge PRs from develop to main only

❌ **DON'T:**
- Force push to main branch
- Bypass CI/CD checks
- Commit with console.log/print statements
- Add secrets to code (use GitHub Secrets)
- Deploy directly to production manually
- Ignore linting or test failures

---

## Timeline

**Week 4 Progress:**

| Task | Status | Hours |
|------|--------|-------|
| 4.1 CI/CD Setup | ✅ COMPLETE | 8/16 |
| 4.2 Governance Policy | 🟡 IN PROGRESS | 0/10 |
| 4.3 Team Training | ⏳ NEXT | 0/10 |
| 4.4 Final Sign-Off | 📋 SCHEDULED | 0/4 |

**Overall:**
- **Weeks 1-3:** ✅ 120/120 hours complete
- **Week 4:** 🟡 8/40 hours in progress
- **Total:** 128/200 hours (64%)

---

**Questions?** Ask your team lead or DevOps engineer.  
**Need help?** Check the CI/CD Documentation file linked above.  
**Found a bug?** Report to #devops on Slack.

---

*Last updated: January 19, 2025*  
*For: SwipeSavvy Development Team*
