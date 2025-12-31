# Team Training & Knowledge Transfer Summary

**Purpose:** Document training completed for SwipeSavvy platform stabilization initiative

**Last Updated:** December 28, 2025  
**Version:** 1.0  
**Training Period:** Week of December 28, 2025

---

## Training Overview

### What Was Delivered

This comprehensive training program enables your team to:
✅ Set up development environment correctly (30 minutes)
✅ Understand platform architecture and dependencies
✅ Run and deploy code following established procedures
✅ Troubleshoot common CI/CD failures
✅ Respond to critical incidents
✅ Follow governance policies and security procedures
✅ Release code confidently to production

### Who Should Attend

- **Developers:** Full training (onboarding + troubleshooting)
- **DevOps/SRE:** Full training + emergency procedures
- **QA/Testing:** Onboarding + CI/CD troubleshooting
- **Product Managers:** Architecture overview only
- **Stakeholders:** Status updates, incident response procedures

### Time Commitment

- **Onboarding Training:** 2 hours (hands-on)
- **CI/CD Deep Dive:** 1 hour (troubleshooting focus)
- **Governance Review:** 30 minutes (policies overview)
- **Emergency Procedures:** 1 hour (on-call only)
- **Live Q&A Session:** 1 hour
- **Self-Study:** 2 hours (guides + reference docs)

**Total: ~7.5 hours over 1-2 days**

---

## Document Guide: Which Document to Read When

### For New Developers

**Start here:**
1. **DEVELOPER_ONBOARDING_GUIDE.md** (90 min read)
   - Environment setup
   - First commit workflow
   - Testing locally
   - Common issues

**Then read:**
2. **CICD_TROUBLESHOOTING_GUIDE.md** (60 min read)
   - Understanding CI/CD failures
   - Quick fixes for common problems
   - How to read error messages

**Reference:**
3. **GOVERNANCE_POLICY.md** (30 min read)
   - What we do and why
   - Version pinning rules
   - Security standards

### For DevOps / On-Call Engineers

**Start here:**
1. **EMERGENCY_PROCEDURES_RUNBOOKS.md** (90 min read)
   - Critical vulnerability response
   - Production outage playbook
   - Database recovery
   - Security incident response

**Then read:**
2. **CICD_TROUBLESHOOTING_GUIDE.md** (60 min read)
   - Understanding all CI/CD workflows
   - Debugging failed checks
   - Performance optimization

**Reference:**
3. **GOVERNANCE_POLICY.md** (30 min read)
   - Vulnerability SLAs
   - Release procedures
   - Security standards

### For Engineering Leads

**Start here:**
1. **GOVERNANCE_POLICY.md** (45 min read)
   - Complete governance framework
   - Vulnerability SLAs
   - Release procedures

**Then read:**
2. **EMERGENCY_PROCEDURES_RUNBOOKS.md** (60 min read)
   - Escalation matrix
   - Communication procedures
   - Incident management

**Reference:**
3. **CICD_TROUBLESHOOTING_GUIDE.md** (30 min read)
   - Understanding failures to coach team
   - Performance optimization

### For QA / Testing Team

**Start here:**
1. **DEVELOPER_ONBOARDING_GUIDE.md** (90 min read)
   - Testing workflows
   - Running tests locally
   - CI/CD checks

**Then read:**
2. **CICD_TROUBLESHOOTING_GUIDE.md** (60 min read)
   - E2E test failures
   - Performance test failures
   - Debugging techniques

**Reference:**
3. **GOVERNANCE_POLICY.md** (20 min read)
   - Testing requirements
   - Coverage standards

---

## Key Concepts You Should Know

### 1. Version Pinning (Reproducible Builds)

**Why it matters:**
- Same code = same output (reproducible)
- Predictable behavior across team
- Easier to debug issues

**What we pin:**
- Node.js: 20.13.0 (exact)
- npm: 10.8.2 (exact)
- Python: 3.11.8 (exact)
- TypeScript: 5.5.4 (exact)
- All npm packages in package-lock.json
- All Python packages in requirements-pinned.txt

**What it means for you:**
```bash
# ✅ CORRECT: Uses exact versions
npm ci                    # Installs from lock file
source venv/bin/activate
pip install -r requirements-pinned.txt

# ❌ WRONG: May get different versions
npm install              # Could get different minor versions
pip install -r requirements.txt  # Could get any patch version
```

### 2. CI/CD Workflows (Automated Checks)

**What runs automatically when you push:**

1. **Code Quality:** ESLint, Prettier, Black, Flake8, MyPy
   - Enforces style consistency
   - Catches obvious bugs
   - Ensures type safety

2. **Security:** npm audit, Safety, Bandit, Snyk
   - Scans for known vulnerabilities
   - Fails on critical vulnerabilities
   - Alerts to high-risk dependencies

3. **Tests:** Jest, pytest, Playwright, k6
   - Runs unit tests (540 tests)
   - Runs E2E tests (20 scenarios)
   - Runs load tests (3 scenarios)
   - Must pass before merge

4. **Build:** Vite, TypeScript, Docker
   - Compiles and bundles code
   - Verifies no build errors
   - Creates optimized production artifacts

**Timeline:**
```
You push → CI/CD starts (T+0)
├─ ci-nodejs.yml (5-10 min)
├─ ci-python.yml (5-10 min)
├─ test-e2e.yml (10-15 min)
└─ security-audit.yml (5 min)

Total: 25-40 minutes for all checks
All must pass before you can merge
```

### 3. Governance Policies (Rules & Procedures)

**Vulnerability Remediation SLAs:**
```
Critical (CVSS 9.0+): Fix within 24 hours
High (CVSS 7.0-8.9): Fix within 1 week
Medium (CVSS 4.0-6.9): Fix within 2 weeks
Low (CVSS 0.0-3.9): Fix quarterly
```

**Release Types:**
```
Patch: Bug fixes, as-needed
Minor: New features, bi-weekly (Thursdays 2 PM UTC)
Major: Large changes, quarterly (Jan/Apr/Jul/Oct)
Hotfix: Critical issues, within 1 hour
```

**Code Quality Requirements:**
```
Test coverage: Minimum 80%
Type checking: Strict mode enabled
Linting: ESLint + Prettier for JavaScript
         Black + Flake8 + MyPy for Python
Security scanning: Daily automated scans + manual reviews
```

### 4. Dependency Management (Safe Updates)

**Three categories of dependencies:**

**Category A (Critical):** Core framework
```
Node.js 20.13.0
npm 10.8.2
React 18.2.0
Python 3.11.8
Update: Rare, requires extensive testing
```

**Category B (Important):** Major libraries
```
Express.js, Django, TensorFlow, etc.
Update: Bi-weekly, requires testing
```

**Category C (Standard):** Utility libraries
```
lodash, request, colors, etc.
Update: Monthly, requires security review
```

**Process for any update:**
```
1. Create PR with dependency change
2. CI/CD runs all tests
3. Code review approved
4. Merged to main
5. Automatically deployed

Timeline: Usually same day if no issues
```

---

## Hands-On Training Exercises

### Exercise 1: Local Setup (30 minutes)

**Goal:** Get development environment working

**Steps:**
```bash
# 1. Clone repo (2 min)
git clone https://github.com/swipesavvy/swipesavvy-mobile-app-v2.git
cd swipesavvy-mobile-app-v2

# 2. Set up Node.js (5 min)
nvm install 20.13.0
nvm use 20.13.0
npm --version  # Should be 10.8.2

# 3. Install Node project dependencies (8 min)
cd swipesavvy-admin-portal && npm ci && cd ..

# 4. Set up Python (5 min)
pyenv install 3.11.8
pyenv local 3.11.8

# 5. Install Python dependencies (8 min)
cd swipesavvy-ai-agents
python -m venv venv
source venv/bin/activate
pip install -r requirements-pinned.txt

# 6. Run tests (2 min)
pytest tests/ -v
```

**Success Criteria:**
- [ ] Node.js version is 20.13.0
- [ ] npm version is 10.8.2
- [ ] Python version is 3.11.8
- [ ] npm build succeeds
- [ ] pytest runs without errors

### Exercise 2: Making First Commit (45 minutes)

**Goal:** Submit a pull request following team standards

**Steps:**
```bash
# 1. Create feature branch
git checkout -b feat/training-feature
git push origin feat/training-feature

# 2. Make a change
# Edit swipesavvy-admin-portal/src/App.tsx
# Add simple comment or style change

# 3. Run local checks
npm run lint
npm run format
npm run type-check
npm test

# 4. Commit with semantic message
git add .
git commit -m "feat: add training exercise comment

This is a training exercise to practice:
- Creating feature branches
- Running local checks
- Following commit message standards
- Submitting PRs"

git push origin feat/training-feature

# 5. Create PR on GitHub
# Go to https://github.com/swipesavvy/swipesavvy-mobile-app-v2/pulls
# Click "New Pull Request"
# Select your branch
# Fill in PR template
```

**Success Criteria:**
- [ ] Branch created and pushed
- [ ] Local checks pass
- [ ] Commit message is semantic
- [ ] PR created with template filled
- [ ] CI/CD starts automatically
- [ ] All CI checks pass (green)

### Exercise 3: Fix a CI Failure (45 minutes)

**Goal:** Understand and fix a CI failure

**Scenario:** ESLint detects missing semicolon

**Steps:**
```bash
# 1. Introduce error (intentional)
# Add this line to a .ts file:
const x = 5  // Missing semicolon

git add .
git commit -m "test: introduce linting error"
git push

# 2. CI fails with ESLint error
# Go to PR → Checks tab
# Click on ci-nodejs.yml → Details
# See error message

# 3. Fix locally
npm run lint        # See exact error
npm run lint --fix  # Auto-fix

# 4. Commit fix
git add .
git commit -m "fix: resolve ESLint errors"
git push

# 5. CI runs again and passes
```

**Learning:**
- How to read CI error messages
- How to identify failing check
- How to fix locally
- How CI automatically re-runs

---

## Quick Reference Card

### For Daily Development

```bash
# Every morning
nvm use 20.13.0          # Verify Node.js version
npm ci                   # Install dependencies
source venv/bin/activate # Activate Python environment

# Before committing
npm run lint             # Check code style
npm run format           # Auto-fix style issues
npm run type-check       # Check TypeScript
npm test                 # Run all tests
npm audit               # Check security

# When submitting PR
git checkout -b feat/feature-name
git push origin feat/feature-name
# Create PR on GitHub

# After merging
# CI/CD automatically runs
# Deployment happens automatically to staging
```

### Common Commands Reference

| Task | Command |
|------|---------|
| Install exact versions | `npm ci` |
| Run development server | `npm run dev` |
| Run tests | `npm test` |
| Check code style | `npm run lint` |
| Fix code style | `npm run format` |
| Type checking | `npm run type-check` |
| Build for production | `npm run build` |
| Check dependencies | `npm audit` |

### When Something Goes Wrong

```bash
# 1. Try to understand error
Read error message carefully
Look for file name, line number, description

# 2. Search documentation
Check CICD_TROUBLESHOOTING_GUIDE.md
Look for error in troubleshooting matrix

# 3. Try suggested fix
Follow the steps for your specific error

# 4. Still stuck?
Post in Slack #dev-support with:
- Error message
- What you were doing
- What you've tried
```

---

## Key Contacts & Resources

### Team Contacts

| Role | Name | Slack | Expertise |
|------|------|-------|-----------|
| Engineering Lead | [Name] | @[name] | Architecture, decisions |
| Frontend Lead | [Name] | @[name] | React, TypeScript |
| Backend Lead | [Name] | @[name] | Python, APIs |
| DevOps Lead | [Name] | @[name] | CI/CD, deployment |
| QA Lead | [Name] | @[name] | Testing, quality |

### Slack Channels

| Channel | Purpose |
|---------|---------|
| #engineering | General engineering discussion |
| #dev-support | Help with development issues |
| #devops-support | Help with CI/CD/deployment issues |
| #production-incident | Production issues & incidents |
| #security | Security topics & vulnerabilities |

### Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| DEVELOPER_ONBOARDING_GUIDE.md | Setup & first commit | New developers |
| CICD_TROUBLESHOOTING_GUIDE.md | Fix CI failures | All developers |
| GOVERNANCE_POLICY.md | Policies & procedures | Everyone |
| EMERGENCY_PROCEDURES_RUNBOOKS.md | Incident response | On-call, DevOps |
| RELEASE_MANAGEMENT_GUIDE.md | How to release | DevOps, leads |
| SECURITY_VULNERABILITY_MANAGEMENT.md | Security procedures | Security, DevOps |

### External Resources

- **GitHub:** https://github.com/swipesavvy/swipesavvy-mobile-app-v2
- **CI/CD Status:** https://github.com/swipesavvy/swipesavvy-mobile-app-v2/actions
- **Monitoring:** [Internal monitoring dashboard]
- **Status Page:** https://status.swipesavvy.com

---

## Training Completion Checklist

Use this checklist to verify all team members have completed training:

### All Team Members
- [ ] Read GOVERNANCE_POLICY.md
- [ ] Understand version pinning and why it matters
- [ ] Understand CI/CD workflow and what it checks
- [ ] Know how to escalate critical issues

### Developers
- [ ] Completed DEVELOPER_ONBOARDING_GUIDE.md
- [ ] Environment setup verified (Node 20.13.0, Python 3.11.8)
- [ ] First commit exercise completed
- [ ] Read CICD_TROUBLESHOOTING_GUIDE.md
- [ ] Know 5 common ESLint fixes
- [ ] Can interpret error messages

### DevOps / On-Call Engineers
- [ ] Read EMERGENCY_PROCEDURES_RUNBOOKS.md
- [ ] Understand critical vulnerability SLAs
- [ ] Know outage response steps
- [ ] Know deployment rollback procedure
- [ ] Can access monitoring dashboard
- [ ] On-call phone number configured

### Team Leads
- [ ] Read GOVERNANCE_POLICY.md fully
- [ ] Understand escalation matrix
- [ ] Know communication procedures
- [ ] Ready to lead postmortem meetings

### QA / Testing
- [ ] Read DEVELOPER_ONBOARDING_GUIDE.md (testing section)
- [ ] Can run tests locally
- [ ] Understand E2E test failures
- [ ] Can troubleshoot load test issues

---

## Assessment & Verification

### Quick Knowledge Check

**Question 1:** What Node.js version do we use?
**Answer:** 20.13.0 (exact, pinned)

**Question 2:** What's the SLA for a critical vulnerability?
**Answer:** 24 hours to fix

**Question 3:** What does `npm ci` do differently than `npm install`?
**Answer:** Uses exact versions from package-lock.json, reproducible

**Question 4:** What are the 4 main CI/CD workflows?
**Answer:** 
- ci-nodejs.yml (linting, testing, building)
- ci-python.yml (linting, testing for Python)
- test-e2e.yml (Playwright E2E + k6 load tests)
- security-audit.yml (vulnerability scanning)

**Question 5:** What's the rollback procedure?
**Answer:** git reset --hard [previous-commit], git push -f, CI/CD redeploys

---

## Feedback & Iteration

**This training is a living document.** Please provide feedback:

### Report Issues
Found an error in docs? Missing information?
- Create issue: https://github.com/swipesavvy/swipesavvy-mobile-app-v2/issues
- Or message: @engineering-lead in Slack

### Suggest Improvements
Have ideas to make training better?
- Comment on #training-feedback in Slack
- In your training feedback form

### Track Updates
Training docs updated when:
- New technology introduced
- Process changes
- Lessons learned from incidents

Last update: December 28, 2025
Next review: January 30, 2026

---

## Success Metrics

Your team is ready when:

✅ **Setup:** 100% of developers can set up environment in <30 minutes
✅ **Knowledge:** 100% of team understands CI/CD workflows
✅ **Procedures:** 100% of developers follow governance policies
✅ **Responsiveness:** On-call handles incidents per runbooks
✅ **Quality:** All PR checks pass before merge
✅ **Security:** Zero critical vulnerabilities slip through
✅ **Communication:** Team communicates clearly during incidents

---

## Next Steps

1. **This Week:**
   - [ ] Developers complete onboarding exercises (1-2)
   - [ ] Team reads governance policy
   - [ ] On-call team reviews emergency procedures

2. **Next Week:**
   - [ ] All team members trained
   - [ ] Training assessment completed
   - [ ] Questions answered in Slack

3. **Ongoing:**
   - [ ] Reference docs when needed
   - [ ] Ask in Slack if unclear
   - [ ] Provide feedback for improvements
   - [ ] Help new team members onboard

---

**Congratulations!** Your team now has all the knowledge and tools to maintain and improve the SwipeSavvy platform with confidence.

**Questions? Ask in #dev-support or #devops-support**

**Ready to start? Begin with DEVELOPER_ONBOARDING_GUIDE.md**
