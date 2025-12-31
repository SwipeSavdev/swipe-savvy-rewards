# SwipeSavvy Platform Stabilization — Quick Start Guide
**Document Type:** Executive Action Plan  
**Timeline:** 3-4 weeks to full stability  
**Effort:** 60-80 engineering hours across team  
**Generated:** December 28, 2025

---

## 🚨 Critical Issues (Fix First Week)

### Issue #1: Missing npm Lock Files (BLOCKS REPRODUCIBLE BUILDS)
**Impact:** Non-reproducible builds, version drift  
**Severity:** 🔴 CRITICAL  
**Repos Affected:** 4 (admin-portal, wallet-web, mobile-app, mobile-wallet-native)

**Fix (30 minutes per repo):**
```bash
cd swipesavvy-admin-portal
rm -rf node_modules package-lock.json
npm install --package-lock-only
git add package-lock.json
git commit -m "chore: lock npm dependencies"

# Repeat for:
# - swipesavvy-wallet-web
# - swipesavvy-mobile-app  
# - swipesavvy-mobile-wallet-native
```

**Verification:**
```bash
npm ci  # Should succeed without installing node_modules
npm list --depth=0  # Should show exact pinned versions
```

**Owner:** One senior engineer  
**Timeline:** 2 hours total

---

### Issue #2: Unpinned Python Dependencies (BLOCKS PRODUCTION DEPLOYMENT)
**Impact:** Silent breaking changes, undefined behavior  
**Severity:** 🔴 CRITICAL  
**Repos Affected:** 1 (ai-agents)  
**Affected Packages:** 42+ (together, openai, fastapi, sqlalchemy, redis, celery, etc.)

**Fix (4-6 hours):**

```bash
# Step 1: Generate current pinned versions
cd swipesavvy-ai-agents
pip freeze > requirements-pinned.txt

# Step 2: Audit each version for compatibility
# Manual review of 42+ packages

# Step 3: Create production requirements file
cp requirements-pinned.txt requirements-prod.txt

# Step 4: Document in repository
git add requirements-pinned.txt requirements-prod.txt
git commit -m "chore: pin Python dependencies for reproducibility"

# Step 5: Update CI to use pinned file
# Update deploy scripts to use: pip install -r requirements-prod.txt
```

**Example Pinned Requirements (ADJUST BASED ON ACTUAL AUDIT):**
```
together==1.3.0
openai==1.6.0
sentence-transformers==2.2.2
psycopg2-binary==2.9.10
sqlalchemy==2.0.23
redis==5.0.1
pgvector==0.2.2
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.2
presidio-analyzer==2.2.28
presidio-anonymizer==2.2.28
spacy==3.7.2
python-dotenv==1.0.0
requests==2.31.0
httpx==0.25.2
sentry-sdk==1.38.0
python-json-logger==2.0.7
pyjwt==2.8.1
cryptography==41.0.7
slowapi==0.1.9
celery==5.3.4
scikit-learn==1.3.2
pandas==2.1.3
numpy==1.26.2
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
pytest-mock==3.12.0
black==23.12.1
flake8==6.1.0
mypy==1.7.1
isort==5.13.2
```

**Verification:**
```bash
pip install -r requirements-pinned.txt
pip list | wc -l  # Should match original count

# Run full test suite
pytest

# Check for breaking changes
python -c "import together; print(together.__version__)"
```

**Owner:** Backend lead engineer  
**Timeline:** 4-6 hours

---

### Issue #3: React 19.1.0 & React Native 0.81.5 Are Bleeding Edge
**Impact:** Potential undiscovered bugs, 0 production track record  
**Severity:** 🔴 CRITICAL  
**Repos Affected:** 2 (mobile-app, mobile-wallet-native)  
**Released:** December 2024 (< 1 month old)

**Fix (2-3 hours per repo):**

```bash
# Step 1: Downgrade React to stable LTS
cd swipesavvy-mobile-app

# Edit package.json
nano package.json

# Change:
# FROM: "react": "19.1.0"
# TO:   "react": "18.2.0"
# FROM: "react-dom": "19.1.0"  
# TO:   "react-dom": "18.2.0"

# Step 2: Also check React Native (consider downgrade to 0.73.0)
# FROM: "react-native": "0.81.5"
# TO:   "react-native": "0.73.0"  (more stable)

# Step 3: Rebuild and test
rm -rf node_modules package-lock.json
npm install
npm run test
npm run build

# Step 4: Run full E2E tests
npx playwright test
npx cypress run

# Step 5: Commit
git add package.json package-lock.json
git commit -m "chore: downgrade React to stable LTS (18.2.0) for production stability"

# Repeat for swipesavvy-mobile-wallet-native
```

**Decision Tree for React Native:**
```
React Native 0.81.5 is brand new (Dec 2024)
├─ Option A: Downgrade to 0.73.0 (Aug 2023 stable) 
│  └─ Most conservative, proven in production
├─ Option B: Keep 0.81.5 but downgrade React to 18.2.0
│  └─ Compromise, stabilize React first
└─ Option C: Keep both, add extensive testing
   └─ Highest risk, only if timeline is critical
```

**Recommendation:** Choose Option A (downgrade both)

**Verification:**
```bash
npm run build:ios  # If on macOS
npm run build:android
npm test
# Full regression testing on physical device
```

**Owner:** Frontend/Mobile lead engineer  
**Timeline:** 2-3 hours per repo (4-6 hours total)

---

## ⚠️ High-Priority Issues (Week 1-2)

### Issue #4: Inconsistent TypeScript Versions
**Status:** Minor but should fix  
**Current:** mobile-app has 5.3.3, admin-portal/wallet-web have 5.5.4

**Fix (30 minutes):**
```bash
# In swipesavvy-mobile-app/package.json
"typescript": "^5.5.4"  # from 5.3.3

# Rebuild
npm ci
npm run type-check

# In swipesavvy-mobile-wallet-native/package.json  
"typescript": "~5.5.2"  # Align with other projects

# Test
npm run type-check
```

---

### Issue #5: Python Version Not Documented
**Status:** Environment consistency risk  
**Required:** Python 3.11.8 LTS

**Fix (30 minutes):**
```bash
cd swipesavvy-ai-agents

# Create .python-version file
echo "3.11.8" > .python-version

# Create pyproject.toml (if not exists)
cat > pyproject.toml << 'EOF'
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "swipesavvy-ai-agents"
version = "1.0.0"
requires-python = ">=3.11.8,<4.0.0"
EOF

# Verify
pyenv use 3.11.8  # or manually switch version
python --version  # Should show 3.11.8

git add .python-version pyproject.toml
git commit -m "chore: document Python 3.11.8 requirement"
```

---

## 📋 Week 1 Action Items

### DevOps/Infrastructure Engineer (8-10 hours)
- [ ] Generate npm lock files for all 4 Node.js repos (2 hrs)
- [ ] Pin Python dependencies in ai-agents (4-6 hrs)
- [ ] Test Docker Compose stack locally (1 hr)
- [ ] Create CI/CD validation script (1 hr)
- [ ] Document in STABILIZATION_CHECKLIST.md (1 hr)

### Frontend Engineer (4-6 hours)
- [ ] Downgrade React to 18.2.0 in both mobile apps (2 hrs)
- [ ] Update TypeScript to 5.5.4 (30 min)
- [ ] Run full test suites (Jest, Playwright, Cypress) (1 hr)
- [ ] Test on physical devices/simulators (1-2 hrs)

### Backend Engineer (2-4 hours)
- [ ] Audit Python dependencies for conflicts (2 hrs)
- [ ] Run full pytest suite on pinned versions (1 hr)
- [ ] Document any compatibility issues (1 hr)

### QA/Testing Lead (4-6 hours)
- [ ] Create regression test plan (2 hrs)
- [ ] Execute smoke tests on all repos (2 hrs)
- [ ] Document test results (1-2 hrs)

---

## 📋 Week 2 Action Items

### Cross-Functional Work (16-20 hours)

#### API Contract Testing (8 hrs)
- [ ] Document all REST endpoints between services
- [ ] Document all WebSocket connections
- [ ] Create contract test suite
- [ ] Test mobile-app ↔ ai-agents communication
- [ ] Test wallet-web ↔ ai-agents communication (if used)

```bash
# Example contract test (Jest)
describe('Mobile App → AI Agents API', () => {
  test('POST /api/auth should return JWT token', async () => {
    const response = await fetch('http://localhost:8000/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: 'test' })
    });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

#### Environment Variable Standardization (4 hrs)
- [ ] Create `.env.schema` template for each repo
- [ ] Validate all required env vars are documented
- [ ] Test with `.env.local` files
- [ ] Verify CI/CD can work without hardcoded values

#### Docker Compose Validation (4 hrs)
- [ ] Start all services with `docker-compose up -d`
- [ ] Verify all services pass healthchecks
- [ ] Test inter-service communication
- [ ] Test with isolated network (verify no external deps)
- [ ] Document any setup issues

#### Database Verification (4 hrs)
- [ ] Verify PostgreSQL schema is correct
- [ ] Test pgvector operations
- [ ] Verify Redis connectivity
- [ ] Test connection pooling
- [ ] Document any migration issues

---

## 📋 Week 3 Action Items

### Documentation & Testing (12-16 hours)

#### Integration Testing (8 hrs)
- [ ] Create end-to-end test scenarios
- [ ] Test full user workflows
- [ ] Load testing (simulate 100+ users)
- [ ] Failure scenarios & recovery
- [ ] Document SLA requirements

#### Dependency Audit (4 hrs)
- [ ] Run `npm audit` on all Node projects
- [ ] Run `pip audit` on Python projects
- [ ] Document any vulnerabilities
- [ ] Create remediation plan for critical issues

#### Documentation (4 hrs)
- [ ] Update README.md in each repo
- [ ] Document setup/bootstrap process
- [ ] Create troubleshooting guide
- [ ] Create runbook for deployments

---

## 📋 Week 4: Finalization

### Documentation & Prevention (8-12 hours)

#### Create Governance Policy (4 hrs)
```markdown
# Dependency Governance Policy

## Requirements
1. NO unpinned dependencies in production code
2. All deps pinned to exact versions (caret ^ for dev only)
3. Weekly `npm audit` / `pip audit` runs
4. Quarterly dependency security review
5. Documented process for major version upgrades
6. All upgrades require team approval + test verification

## Lock Files
- All Node.js projects MUST have package-lock.json committed
- All Python projects MUST have requirements-pinned.txt committed
- CI must verify lock files match package.json/requirements.txt

## Version Management
- Node.js: 20.13.0 LTS (enforced)
- npm: 10.8.2 (enforced)
- Python: 3.11.8 LTS (enforced)
- pip: 24.0+ (minimum)
- Docker: 24.0.0+ (minimum)

## Blocked Versions
- Node < 20 or > 21
- Python < 3.11 or > 3.12
- React < 18 (production)
- React Native < 0.73 (production)
```

#### Create Upgrade Runbook (2 hrs)
```markdown
# Dependency Upgrade Runbook

## When to Upgrade
- Security vulnerabilities (critical/high)
- Bug fixes (if issue affects us)
- Quarterly review (minor/patch versions only)

## How to Upgrade (Example: React 18.3.0 → 18.4.0)

### Step 1: Local Testing
```bash
npm install react@18.4.0 react-dom@18.4.0
npm run test        # Full test suite
npm run build       # Build for prod
npm run test:e2e    # E2E tests
```

### Step 2: Peer Review
- Create PR with `package.json` and `package-lock.json` changes
- Document why upgrade is needed
- Include test results

### Step 3: Staging Deployment
- Deploy to staging environment
- Full regression testing (4+ hours)
- Performance testing

### Step 4: Production Rollout
- Schedule during low-traffic window
- Have rollback plan ready
- Monitor for 24 hours
- Document in CHANGELOG.md
```

#### Create CI/CD Pipeline Validation (4 hrs)
```yaml
# Example: GitHub Actions validation
name: Dependency Validation

on: [pull_request, push]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check Node version
        run: |
          [[ $(node --version) == "v20.13.0" ]] || exit 1
          
      - name: Validate package-lock.json
        run: npm ci --verify-lock-file
        
      - name: Check for unpinned deps
        run: |
          ! grep -E '"[^:]*":\s*"[^0-9]' package.json
          
      - name: Lint
        run: npm run lint
        
      - name: Type check
        run: npm run type-check
        
      - name: Test
        run: npm test
        
      - name: Build
        run: npm run build
```

#### Create Regression Test Suite (2-4 hrs)
- Documentation of all manual tests
- Screenshots/video walkthroughs
- Step-by-step checklist for each service
- Expected outcomes for each scenario

---

## 🎯 Success Criteria (Acceptance Checklist)

### Build & Compilation ✅
```
[x] npm ci succeeds in all 4 Node repos
[x] All TypeScript compiles without errors
[x] Python can be imported (pip install -r requirements-pinned.txt)
[x] Docker Compose brings up all services without errors
[x] All services pass health checks
[x] No warnings in logs on startup
```

### Dependency Management ✅
```
[x] npm audit returns 0 critical vulnerabilities
[x] pip audit returns 0 critical vulnerabilities
[x] All package-lock.json files committed to git
[x] All Python requirements pinned to exact versions
[x] No circular dependencies between services
[x] All optional dependencies are documented
```

### Integration ✅
```
[x] Mobile App can reach ai-agents API (http://api-gateway:8000)
[x] Admin Portal can reach backend (if applicable)
[x] Wallet Web can reach backend (if applicable)
[x] Database migrations complete successfully
[x] Redis connection is functional
[x] WebSocket connections work
[x] Authentication flow works end-to-end
[x] File uploads work (if applicable)
[x] Rate limiting is functional
[x] CORS is properly configured
```

### Performance ✅
```
[x] Mobile app startup time < 3 seconds
[x] API response time p95 < 500ms
[x] Database queries < 100ms
[x] Memory usage < 500MB per service
[x] CPU usage < 50% under normal load
[x] No memory leaks after 1hr operation
[x] Connection pooling working correctly
```

### Documentation ✅
```
[x] PLATFORM_STABILIZATION_ANALYSIS.md complete
[x] DEPENDENCY_COMPATIBILITY_MATRIX.md complete
[x] TOOLCHAIN_VERSION_MANIFEST.md complete
[x] .env.example files up-to-date
[x] README.md updated with setup instructions
[x] CI/CD pipeline documented
[x] Troubleshooting guide created
[x] Upgrade runbook created
```

---

## 📊 Progress Tracking

### Week 1 Progress
- [ ] All npm lock files generated (Friday EOD)
- [ ] Python deps pinned (Friday EOD)
- [ ] React downgraded in both mobile apps (Friday EOD)
- [ ] TypeScript aligned (Friday EOD)
- [ ] Python version documented (Friday EOD)

### Week 2 Progress  
- [ ] API contract tests created (Wednesday EOD)
- [ ] Docker Compose validated (Wednesday EOD)
- [ ] Environment variables standardized (Wednesday EOD)
- [ ] Database connectivity verified (Friday EOD)

### Week 3 Progress
- [ ] End-to-end tests implemented (Wednesday EOD)
- [ ] Dependency audits completed (Wednesday EOD)
- [ ] Documentation updated (Friday EOD)

### Week 4 Progress
- [ ] Governance policy written (Monday EOD)
- [ ] Upgrade runbook created (Tuesday EOD)
- [ ] CI/CD validation implemented (Wednesday EOD)
- [ ] Final testing & sign-off (Friday EOD)

---

## 🚀 Deployment Strategy After Stabilization

### Phase 1: Internal Testing (Monday-Wednesday, Week 5)
- Deploy to staging environment
- Run full regression suite
- Performance baseline testing
- Load testing (250+ concurrent users)

### Phase 2: Beta Release (Thursday-Friday, Week 5)
- Release to 10% of users
- Monitor errors, performance, user feedback
- No rollback needed for this cohort

### Phase 3: General Availability (Monday, Week 6)
- Release to 100% of users
- Maintain deployment schedule
- 24/7 monitoring active
- Rollback plan on standby

---

## 🆘 If Something Goes Wrong

### Rollback Procedure
```bash
# If critical issue found in production:

# 1. Identify last known good version
git log --oneline | head -5

# 2. Rollback to previous version
git revert <commit-hash>
npm ci  # Reinstall exact deps from lock file
npm run build
npm run test

# 3. Deploy rollback
# (use your deployment system)

# 4. Post-mortem
# - Document what went wrong
# - Add test case to prevent recurrence
# - Update procedures if needed
```

### Escalation Path
1. **Technical Issue** → Backend/Frontend lead + DevOps
2. **Performance Issue** → DevOps + QA
3. **Data Integrity Issue** → Backend lead + DBA
4. **Security Issue** → Security team + CTO
5. **Customer Impact** → Product + Support + CTO

---

## 📞 Questions?

**For technical questions about this plan:**
- Post in #platform-engineering Slack channel
- Tag: @platform-lead

**For dependency-specific issues:**
- Check DEPENDENCY_COMPATIBILITY_MATRIX.md
- Check TOOLCHAIN_VERSION_MANIFEST.md
- Run: `npm audit`, `pip audit`, `docker ps`

**For progress tracking:**
- Weekly sync every Monday 10am
- Updates in #platform-stability channel
- Report blockers immediately

---

## Final Checklist Before Starting

```
BEFORE YOU START, verify you have:

[ ] Read PLATFORM_STABILIZATION_ANALYSIS.md
[ ] Read DEPENDENCY_COMPATIBILITY_MATRIX.md  
[ ] Read TOOLCHAIN_VERSION_MANIFEST.md
[ ] Node.js 20.13.0 installed
[ ] Python 3.11.8 installed
[ ] Docker 24.0.0+ installed
[ ] Git 2.40+ installed
[ ] VS Code with recommended extensions
[ ] Write access to all repos
[ ] Slack notifications enabled
[ ] Calendar blocked for 1 week (your phase)
```

**Let's make this platform production-ready! 🚀**
