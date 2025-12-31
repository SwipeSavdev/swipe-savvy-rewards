# 📋 SwipeSavvy Platform Governance Policy

**Effective Date:** January 19, 2025  
**Version:** 1.0  
**Last Updated:** January 19, 2025  
**Status:** ✅ APPROVED  
**Owner:** DevOps & Engineering Leadership

---

## Table of Contents

1. [Overview](#overview)
2. [Dependency Management Policy](#dependency-management-policy)
3. [Version Pinning Rules](#version-pinning-rules)
4. [Update Approval Workflow](#update-approval-workflow)
5. [Vulnerability Remediation SLAs](#vulnerability-remediation-slas)
6. [Release Management Process](#release-management-process)
7. [Code Quality Standards](#code-quality-standards)
8. [Security Standards](#security-standards)
9. [Testing Requirements](#testing-requirements)
10. [Compliance & Audit](#compliance--audit)

---

## Overview

This governance policy establishes the standards, processes, and procedures for managing dependencies, versions, updates, vulnerabilities, and releases across the SwipeSavvy platform. The policy ensures:

✅ **Consistency** - All projects follow the same standards  
✅ **Security** - Vulnerabilities are detected and remediated on schedule  
✅ **Stability** - Changes are tested and approved before production  
✅ **Auditability** - All decisions are documented and traceable  
✅ **Compliance** - Industry best practices are followed  

**Scope:**
- All 4 Node.js projects (admin-portal, wallet-web, mobile-app, and their packages)
- 1 Python project (ai-agents)
- All containerized services (Docker images)
- All infrastructure components (PostgreSQL, Redis, etc.)

---

## Dependency Management Policy

### 1. Dependency Categories

Dependencies are classified into three categories:

#### **Category A: Production Critical**
- Required for core functionality
- Must be stable, well-maintained, and widely adopted
- Examples: React, Express, FastAPI, PostgreSQL driver

**Policy:**
- ✅ Update on schedule (quarterly)
- ✅ Major version updates: Once per quarter, after testing
- ✅ Minor/patch updates: Within 2 weeks of release
- ✅ Security patches: Within 24 hours (critical), 1 week (high)
- ✅ Requires: Full test suite + production smoke test

#### **Category B: Production Support**
- Supporting libraries that enhance functionality
- Should be stable with good maintenance
- Examples: Lodash, UUID, Date libraries, Logging

**Policy:**
- ✅ Update on schedule (bi-monthly)
- ✅ Major version updates: Quarterly
- ✅ Minor/patch updates: Within 4 weeks
- ✅ Security patches: Within 1 week (critical), 2 weeks (high)
- ✅ Requires: Relevant test suite + code review

#### **Category C: Development Only**
- Build tools, testing frameworks, linters
- Do not ship to production
- Examples: Jest, ESLint, Webpack, pytest

**Policy:**
- ✅ Update on schedule (monthly)
- ✅ Major version updates: Allowed with caution
- ✅ Minor/patch updates: Within 2 months
- ✅ Security patches: Per dev team discretion
- ✅ Requires: Code review only (no production impact)

### 2. Version Specification Strategy

#### **Node.js Ecosystem**

```
Specification: Node.js 20.13.0 LTS
npm: 10.8.2
Location: package.json engines field + .nvmrc file
Enforcement: ci-nodejs.yml workflow checks version on every commit
Update Window: Quarterly review, once per year major version
```

**Lock File Strategy:**
- ✅ `package-lock.json` committed to git (all 3 Node.js projects)
- ✅ Generated via `npm ci` (not `npm install`)
- ✅ Ensures reproducible builds across all environments
- ✅ No partial updates (full file regeneration)

#### **Python Ecosystem**

```
Specification: Python 3.11.8
Location: .python-version file + pyproject.toml
Enforcement: ci-python.yml workflow checks version on every commit
Update Window: Quarterly review, once per year major version
```

**Lock File Strategy:**
- ✅ `requirements-pinned.txt` with exact versions (44 packages)
- ✅ No version wildcards (^, ~, *)
- ✅ Generated via `pip freeze > requirements-pinned.txt`
- ✅ All packages pinned to exact versions for reproducibility

#### **TypeScript**

```
Version: 5.5.4
Location: package.json devDependencies (all 3 projects)
Enforcement: TypeScript compilation in ci-nodejs.yml
Update Window: Quarterly review
```

#### **Docker & Infrastructure**

```
PostgreSQL: 16-latest (stable major version)
Redis: 7-latest (stable major version)
Docker: Latest stable build tools
Enforcement: docker-compose.yml version specification
Update Window: Semi-annual review (June, December)
```

### 3. Dependency Audit Process

**Continuous Monitoring:**
- ✅ npm audit runs on every commit (ci-nodejs.yml)
- ✅ Safety check runs on every Python commit (ci-python.yml)
- ✅ Daily security scan (security-audit.yml at 2 AM UTC)
- ✅ Automated alerts on critical vulnerabilities

**Weekly Review:**
- ✅ DevOps team reviews audit reports
- ✅ Identifies new vulnerabilities
- ✅ Plans remediation for high/critical items
- ✅ Updates dependency status dashboard

**Monthly Review:**
- ✅ Full dependency health assessment
- ✅ Check for outdated packages
- ✅ Plan quarterly updates
- ✅ Review update strategy effectiveness

---

## Version Pinning Rules

### 1. What Must Be Pinned

**MUST Pin (Exact Versions):**
- ✅ Node.js: `20.13.0` (not `20.x.x` or `>=20.0.0`)
- ✅ npm: `10.8.2` (specified in engines field)
- ✅ Python: `3.11.8` (in .python-version file)
- ✅ TypeScript: `5.5.4` (exact version in package.json)
- ✅ All production npm packages (no ^, ~, wildcards)
- ✅ All Python packages (exact versions in requirements-pinned.txt)
- ✅ PostgreSQL: `16.x` (major version pinned)
- ✅ Redis: `7.x` (major version pinned)

**MUST NOT Pin (Allow Updates):**
- ❌ Development dependencies: May use minor version ranges (^, ~)
- ❌ Patch versions for patch-level fixes
- ❌ Pre-release versions (alpha, beta, rc)
- ❌ Git commit hashes for package versions

### 2. Version Specification Syntax

#### **package.json (Node.js)**

```json
{
  "engines": {
    "node": "20.13.0",
    "npm": "10.8.2"
  },
  "dependencies": {
    "react": "18.2.0",
    "express": "4.18.2"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@typescript-eslint/eslint-plugin": "6.10.0"
  }
}
```

**Rule:** Production dependencies = exact; dev dependencies = minor ranges OK

#### **requirements-pinned.txt (Python)**

```
Flask==2.3.2
SQLAlchemy==2.0.19
psycopg2-binary==2.9.7
redis==5.0.0
```

**Rule:** All packages exact versions, alphabetically sorted

#### **.nvmrc (Node.js)**

```
20.13.0
```

**Rule:** Single version, no ranges

#### **.python-version (Python)**

```
3.11.8
```

**Rule:** Single version, no ranges

### 3. Exception Process

**When can we deviate from exact pinning?**

Only with explicit approval:

1. **Security Emergency**
   - Critical vulnerability with no other workaround
   - Requires DevOps + Engineering lead approval
   - Documented in SECURITY_INCIDENT_LOG.md
   - Temporary exception (max 30 days)
   - Must update to exact version after vulnerability fixed

2. **Incompatible Dependencies**
   - Two dependencies require conflicting versions
   - Requires Architecture review + Tech lead approval
   - Document in DEPENDENCY_EXCEPTIONS.md
   - Review quarterly for resolution
   - Max 2 active exceptions at any time

3. **Beta/RC Dependencies**
   - Only for evaluation of upcoming releases
   - Requires DevOps + PM approval
   - Must be on separate branch, never main
   - Cannot ship to production
   - 30-day evaluation window

**Exception Template:**

```markdown
## Exception: [Package Name] v[Version]

**Reason:** [Specific reason - security, incompatibility, or evaluation]
**Approved By:** [Name] - [Role] - [Date]
**Valid Until:** [Date, max 30 days]
**Planned Resolution:** [How we'll fix this]
**Risk Assessment:** [Low/Medium/High]

**Conditions:**
- [ ] PR includes explanation
- [ ] No other workaround exists
- [ ] Approved by required stakeholders
- [ ] Calendar reminder set for review/update
```

---

## Update Approval Workflow

### 1. Dependency Update Request Process

```
Developer identifies update needed
         ↓
Create feature branch: feature/update-[package]-v[version]
         ↓
Update package version + lock files
         ↓
Run full test suite locally
         ↓
Create PR with update details
         ↓
Code review by 1 peer
         ↓
Automated tests pass (ci-nodejs.yml, ci-python.yml)
         ↓
Security scan passes (security-audit.yml)
         ↓
Approved by team lead (for production deps)
         ↓
Merge to main
         ↓
Deploy to staging (automatic)
         ↓
Smoke tests on staging
         ↓
Deploy to production (manual, requires 2 approvals)
```

### 2. Major Version Updates

**Timeline:** Quarterly update window  
**Process:**
1. DevOps researches breaking changes
2. Creates detailed assessment document
3. Proposes update in team meeting
4. Assigns engineer to implementation
5. Implementation on feature branch with tests
6. Code review + security scan
7. Staging test (min 2 hours)
8. Production deployment with rollback plan ready

**Approval Checklist:**

- [ ] All breaking changes documented
- [ ] Tests updated and passing (100% on affected code)
- [ ] No performance regressions
- [ ] No security vulnerabilities introduced
- [ ] Rollback plan tested
- [ ] Team lead approval
- [ ] Stakeholder approval (if business-critical)

**Rollback Plan Template:**

```markdown
## Rollback Plan: [Package] v[Old] → v[New]

**Rollback Command:**
npm update [package]@[old-version]
npm ci

**Verification Steps:**
1. npm list [package]
2. Run smoke tests
3. Check metrics dashboard

**Estimated Rollback Time:** [X minutes]
**Dependencies Affected:** [List dependent packages]
```

### 3. Security Update Approval

**Critical Vulnerabilities (CVSS >= 9.0):**
- ✅ Update within **24 hours** of patch release
- ✅ Skip normal review (security urgency)
- ✅ Post-merge review acceptable
- ✅ Automated deployment to production
- ✅ Notify team of change via Slack

**High Vulnerabilities (CVSS 7.0-8.9):**
- ✅ Update within **1 week**
- ✅ Standard review process
- ✅ Merge after approval
- ✅ Deploy to production within 24 hours
- ✅ Notify team via Slack

**Medium Vulnerabilities (CVSS 4.0-6.9):**
- ✅ Update within **2 weeks**
- ✅ Standard review process
- ✅ Include in regular deployment cycle
- ✅ Communicate in weekly update

**Low Vulnerabilities (CVSS < 4.0):**
- ✅ Update in quarterly cycle
- ✅ Bundle with other updates
- ✅ Standard review process

---

## Vulnerability Remediation SLAs

### 1. SLA Definitions

| Severity | CVSS Score | Detection | Remediation | SLA | Escalation |
|----------|-----------|-----------|-------------|-----|------------|
| **Critical** | 9.0-10.0 | Automated (immediate) | Within 24 hours | P1 | VP Eng immediately |
| **High** | 7.0-8.9 | Automated (immediate) | Within 1 week | P2 | Engineering lead within 2 hrs |
| **Medium** | 4.0-6.9 | Daily scan (2 AM) | Within 2 weeks | P3 | DevOps within 24 hrs |
| **Low** | 0.0-3.9 | Weekly review | Quarterly cycle | P4 | Monthly review |

### 2. Remediation Process

**Step 1: Detection** (0 min)
- Automated scanner identifies vulnerability
- GitHub notification sent to #security channel
- Slack alert: "@security-team new [SEVERITY] vuln"

**Step 2: Triage** (within 15 min for critical, 1 hr for high)
- Security team reviews vulnerability details
- Determines if applicable to our code
- Checks if already patched in current version
- Posts assessment in GitHub issue

**Step 3: Update** (per SLA above)
- Create PR with updated package
- Verify new version resolves vulnerability
- Run full test suite
- Merge and deploy

**Step 4: Verification** (within 1 hr of deployment)
- Run security scan on deployed version
- Confirm vulnerability gone
- Document closure in ticket

**Step 5: Communication** (immediately after verification)
- Post update in Slack
- Email security stakeholders
- Update dashboard

### 3. SLA Tracking Dashboard

**Maintained daily:**

```markdown
# Vulnerability Status Dashboard

## Critical Vulnerabilities: 0
Detection-to-Remediation Time: N/A

## High Vulnerabilities: 0
Detection-to-Remediation Time: N/A

## Medium Vulnerabilities: 0
Oldest: N/A
Days Remaining: N/A

## Low Vulnerabilities: 0
Oldest: N/A

## Monthly SLA Compliance
- Critical: 100% (0/0 on-time)
- High: 100% (0/0 on-time)
- Medium: 100% (0/0 on-time)
- Low: 100% (0/0 on-time)
```

### 4. False Positives & Exceptions

**False Positive Process:**
1. Security team reviews flagged vulnerability
2. Determines if actually applicable (usually version range, not installed, or irrelevant code path)
3. Documents reason
4. Requests exception from security tool
5. Logs in EXCEPTION_LOG.md

**Accepted Exceptions:**
- Sentry SDK vulnerabilities (monitoring only, sandboxed)
- Dev tool vulnerabilities (not in production)
- Transitive vulnerabilities with no exploitable path
- Vulnerabilities in code paths we don't use

**Max 3 accepted exceptions at any time**

---

## Release Management Process

### 1. Release Types

#### **Patch Release (v1.2.3 → v1.2.4)**
- Bug fixes only
- No feature additions
- No dependency updates
- Release frequency: As needed (max 2x per week)
- Testing: Smoke tests only
- Deployment: Within 24 hours of merge

#### **Minor Release (v1.2.0 → v1.3.0)**
- New features
- Backward compatible
- No breaking changes
- Release frequency: Every 2 weeks (Thursday 2 PM)
- Testing: Full test suite + E2E
- Deployment: Within 2 hours of release

#### **Major Release (v1.0.0 → v2.0.0)**
- Breaking changes allowed
- New features
- Architecture changes possible
- Release frequency: Quarterly (Jan, Apr, Jul, Oct)
- Testing: Full suite + load tests + UAT
- Deployment: Friday morning (time for rollback support)

### 2. Release Checklist

**Pre-Release (7 days before):**

- [ ] All PRs reviewed and merged
- [ ] Changelog updated
- [ ] Version number decided
- [ ] Release branch created: `release/v[version]`
- [ ] All tests passing on release branch
- [ ] Security audit passed
- [ ] Load test results acceptable
- [ ] Documentation updated

**Release Day:**

- [ ] Final security scan clean
- [ ] Git tag created: `git tag v[version]`
- [ ] GitHub release notes created
- [ ] Docker images built and pushed
- [ ] Staging deployment successful
- [ ] Smoke tests passed on staging
- [ ] Team notified of release window
- [ ] Monitoring dashboards active
- [ ] Production deployment executed
- [ ] Post-deployment verification completed

**Post-Release (24 hours after):**

- [ ] Monitor error rates (no increase)
- [ ] Monitor performance metrics (acceptable)
- [ ] Review customer feedback
- [ ] Create follow-up issues if needed
- [ ] Post-release report published
- [ ] Team debriefs

### 3. Version Numbering Scheme

**Format:** `vMAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`

**Examples:**
- `v1.0.0` - Initial release
- `v1.2.3` - Patch release (bug fix)
- `v1.3.0` - Minor release (new feature)
- `v2.0.0` - Major release (breaking changes)
- `v1.0.0-alpha.1` - Alpha pre-release
- `v1.0.0-rc.1` - Release candidate
- `v1.0.0+20250119` - Build metadata

**Increment Rules:**
- MAJOR: Breaking API changes, major refactors
- MINOR: Backward-compatible new features
- PATCH: Bug fixes, performance improvements, minor updates
- Reset MINOR & PATCH when MAJOR increments
- Reset PATCH when MINOR increments

### 4. Release Approval Matrix

| Release Type | Code Review | Tech Lead | VP Eng | Stakeholder |
|--------------|-------------|-----------|--------|-------------|
| Patch | Required | Notify | - | - |
| Minor | Required | Approve | - | Notify |
| Major | Required | Approve | Approve | Approve |
| Security | Post-merge OK | Notify | Notify | - |
| Hotfix | Required | Approve | Notify | Notify |

---

## Code Quality Standards

### 1. Linting Standards

#### **JavaScript/TypeScript (ESLint)**

```
Tool: ESLint 9.39.2
Config: eslint.config.mjs (flat config format)
Applied to: 3 Node.js projects

Rules:
- no-unused-vars: error
- no-console: warn (except in specific files)
- no-implicit-any: error (TypeScript)
- consistent-return: error
- eqeqeq: error (enforce === over ==)
- no-var: error (use const/let)

Enforcement: ci-nodejs.yml (fails on any error)
```

#### **Python (Flake8 + MyPy)**

```
Tools: Flake8 7.3.0, MyPy 1.19.1
Config: .flake8, pyproject.toml
Applied to: swipesavvy-ai-agents

Flake8 Rules:
- Line length: 88 characters (Black default)
- Ignore: E203, W503 (Black compatibility)
- Max complexity: 10 per function

MyPy Settings:
- python_version: 3.11
- strict: true
- warn_return_any: true
- disallow_untyped_defs: true

Enforcement: ci-python.yml (fails on errors)
```

### 2. Code Formatting Standards

#### **JavaScript/TypeScript (Prettier)**

```
Tool: Prettier 3.x
Config: .prettierrc (3 projects)

Settings:
- printWidth: 100
- tabWidth: 2
- useTabs: false
- semi: true
- singleQuote: true
- trailingComma: 'es5'
- bracketSpacing: true
- arrowParens: 'always'

Enforcement: ci-nodejs.yml (fails if not formatted)
```

#### **Python (Black)**

```
Tool: Black 25.12.0
Config: pyproject.toml

Settings:
- line-length: 88
- target-version: py311
- include: '"\.pyi?$"'
- extend-exclude: tests/fixtures

Enforcement: ci-python.yml (fails if not formatted)
```

### 3. Type Safety

#### **TypeScript**

```
Compiler: TypeScript 5.5.4
tsconfig.json settings:
- strict: true
- noImplicitAny: true
- strictNullChecks: true
- strictFunctionTypes: true
- noUnusedLocals: true
- noUnusedParameters: true
- noImplicitReturns: true

Enforcement: ci-nodejs.yml (compilation check)
```

#### **Python**

```
Tool: MyPy 1.19.1 (strict mode)
Requirements:
- All function arguments must have type hints
- All return types must be annotated
- No Any types allowed
- Strict optional checking enabled

Enforcement: ci-python.yml (type check)
```

### 4. Test Coverage Requirements

**Minimum Coverage Thresholds:**

| Category | Threshold | Enforcement |
|----------|-----------|-------------|
| **Statements** | 80% | Failed build if below |
| **Branches** | 75% | Failed build if below |
| **Functions** | 80% | Failed build if below |
| **Lines** | 80% | Failed build if below |

**Critical Paths:** 95%+ coverage required

**Exceptions:** Only with architecture team approval

---

## Security Standards

### 1. Security Scanning Tools

#### **npm audit (Node.js)**

```
Tool: npm audit (built-in)
Trigger: Every commit (ci-nodejs.yml)
Fail Condition: Any CRITICAL vulnerability
Configuration:
- audit-level: critical (minimum to fail)
- Production packages: Required
- Dev packages: Scan but don't fail
```

#### **Safety (Python)**

```
Tool: Safety
Trigger: Every commit (ci-python.yml)
Fail Condition: Any CRITICAL vulnerability
Configuration:
- Check against Safety DB
- Support local security policy file
```

#### **Bandit (Python)**

```
Tool: Bandit
Trigger: Every commit (ci-python.yml)
Scan Target: app/ directory only
Issues Reported:
- High: Trigger code review
- Medium: Log and track
- Low: Informational
```

#### **Snyk (Optional)**

```
Tool: Snyk
Trigger: Daily scan (security-audit.yml)
Benefits:
- Machine learning vulnerability detection
- Automatic remediation suggestions
- Detailed vulnerability analysis
Cost: [Enterprise feature]
```

#### **OWASP Dependency-Check**

```
Tool: OWASP Dependency-Check
Trigger: Daily scan (security-audit.yml)
Coverage:
- All programming languages
- NVD database
- CPE matching
Reports: JSON format, stored as artifacts
```

### 2. Static Analysis

**Required Tools:**

- ESLint: JavaScript/TypeScript linting
- Flake8: Python linting
- MyPy: Python type checking
- SonarQube: Optional (enterprise)

**Execution:** On every commit, must pass before merge

### 3. Sensitive Data Protection

**No secrets in code:**

- ✅ Use GitHub Secrets for sensitive values
- ✅ Use .env.example for structure
- ✅ Never commit .env files
- ✅ Pre-commit hooks check for secrets

**Encryption:**

- ✅ Database: Encrypted at rest
- ✅ API Keys: Encrypted in GitHub Secrets
- ✅ TLS: Enforced for all communications
- ✅ Passwords: Never logged, hashed in database

---

## Testing Requirements

### 1. Unit Test Requirements

**Minimum Coverage:** 80% of codebase

```
Jest (Node.js):
- Test files: *.test.ts (co-located with source)
- Execution: npm run test
- Coverage: npm run test:coverage
- Reports: HTML (target/coverage/)

pytest (Python):
- Test files: tests/ directory
- Execution: pytest
- Coverage: pytest --cov
- Reports: HTML (htmlcov/)
```

**Required Tests:**

- ✅ All business logic
- ✅ Error handling paths
- ✅ Edge cases
- ✅ Input validation
- ✅ State transitions

### 2. Integration Test Requirements

**Components:** PostgreSQL, Redis services

```
Execution: ci-python.yml (with services)
Requirements:
- API endpoint integration
- Database operations
- Cache operations
- Multi-service interactions

Minimum: 50% of workflows covered
```

### 3. E2E Test Requirements

**Execution:** test-e2e.yml (Playwright)

```
Scope: User workflows
Coverage:
- Admin Portal: 10 test scenarios
- Wallet Web: 10 test scenarios
- Critical paths: 100% coverage
- Browsers: Chromium, Firefox, WebKit

Execution: On demand or release
```

### 4. Load Test Requirements

**Execution:** test-e2e.yml (k6)

```
Scenarios:
- Sustained: 0→500 VUs over 5 min, hold 5 min
- Spike: 50→500 VUs in 10 sec
- Soak: 100 VUs for 30 min

Thresholds:
- p99 latency: < 400ms
- Error rate: < 0.1%
- Success: 99.9%

Execution: Before releases, on demand
```

---

## Compliance & Audit

### 1. Compliance Requirements

**Standards:**
- ✅ OWASP Top 10
- ✅ NIST Cybersecurity Framework
- ✅ PCI-DSS (if handling payment cards)
- ✅ GDPR (if handling EU user data)

**Annual Audit:** Conducted by external firm

### 2. Documentation & Logging

**What Gets Documented:**

- ✅ All dependency updates (PR, timestamp, approval)
- ✅ All vulnerability remediations (detection to fix)
- ✅ All security incidents (incident log)
- ✅ All policy exceptions (with approval)
- ✅ All deployments (version, timestamp, who, changes)

**Retention:** Minimum 2 years

### 3. Access Control

**GitHub Repository Access:**

- **Admins:** CTO, VP Eng, Lead DevOps
- **Maintain:** All senior engineers
- **Write:** All engineers (on branches)
- **Read:** All team members

**Production Secrets Access:**

- **Admins:** CTO, VP Eng, Lead DevOps
- **Limited:** On-call support engineer (read-only)

### 4. Audit Trail

**All changes tracked via:**

- ✅ Git commit history (code changes)
- ✅ GitHub Actions logs (CI/CD execution)
- ✅ GitHub Issues/PRs (discussions, approvals)
- ✅ Slack records (notifications, decisions)
- ✅ Security audit reports (vulnerability scans)

**Searchable, immutable, 2-year retention**

---

## Policy Review & Updates

### 1. Review Schedule

- **Quarterly:** DevOps team reviews policy effectiveness
- **Semi-Annually:** Engineering leadership reviews with DevOps
- **Annually:** Full audit with security team

### 2. Exception Tracking

Maintained in: `GOVERNANCE_EXCEPTIONS.md`

```markdown
# Active Policy Exceptions

| Package | Exception | Approved By | Valid Until | Reason |
|---------|-----------|-------------|-------------|--------|
| [name] | [type] | [person] | [date] | [reason] |
```

### 3. Policy Amendment Process

1. Identify needed change
2. Document rationale
3. Review with engineering leadership
4. Team discussion
5. Update this document
6. Announce change in team meeting
7. Archive old version

---

## Appendix: Tools & Commands

### Dependency Management Commands

```bash
# Check for npm vulnerabilities
npm audit

# Fix auto-fixable vulnerabilities
npm audit fix

# Update package
npm update package-name

# Pin specific version
npm install package-name@1.2.3

# Check Python vulnerabilities
safety check --file requirements-pinned.txt

# Update Python requirements
pip install --upgrade package-name
pip freeze > requirements-pinned.txt

# Check MyPy types
mypy app/

# Format with Black
black app/

# Lint with Flake8
flake8 app/
```

### Release Commands

```bash
# Create release tag
git tag v1.2.3
git push origin v1.2.3

# Create release branch
git checkout -b release/v1.2.3

# Update version in files
# (manual: package.json, pyproject.toml, etc.)

# Merge release branch
git checkout main
git merge release/v1.2.3
git push origin main
```

---

## Approval & Sign-Off

**Approved By:**
- [ ] CTO
- [ ] VP Engineering
- [ ] DevOps Lead
- [ ] Engineering Team Lead
- [ ] Security Officer

**Effective Date:** January 19, 2025  
**Next Review Date:** April 19, 2025  
**Document Owner:** DevOps Team

---

**Version History:**
- v1.0 (Jan 19, 2025) - Initial governance policy

