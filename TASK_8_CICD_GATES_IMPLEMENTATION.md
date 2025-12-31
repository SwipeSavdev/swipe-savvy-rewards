# Task 8: CI/CD Gates Implementation
## Regression Protection & Release Automation

**Date**: December 26, 2025  
**Status**: Implementation Ready  
**Objective**: Prevent regressions through automated gates on all PRs and releases

---

## 1. Executive Summary

This document defines **CI/CD pipeline gates** that enforce:
- **Lint + TypeCheck** on every PR
- **Unit test pass rate ≥ 95%**
- **Integration tests** for API changes
- **Contract test validation** for cross-repo changes
- **Security scanning** (SAST, dependency, secrets)
- **E2E smoke tests** before staging release
- **Performance regression detection**
- **Code coverage thresholds** (75%+ minimum)

---

## 2. GitHub Actions Pipeline Architecture

### Overall Pipeline Flow

```
┌─────────────────────────────────────────────────────────┐
│ Developer: Create Feature Branch & Push PR              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 1: Lint & TypeCheck (3 min)                        │
│ ├─ ESLint, Prettier                                     │
│ ├─ TypeScript strict mode                               │
│ ├─ Python flake8, mypy                                  │
│ └─ [REQUIRED] ❌ Blocks if fails                        │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐        ┌──────────────────────┐
│ Gate 2a:         │        │ Gate 2b:             │
│ Unit Tests       │        │ Integration Tests    │
│ (5 min)          │        │ (10 min)             │
│ ├─ Jest          │        │ ├─ Database setup    │
│ ├─ pytest        │        │ ├─ Sandbox vendors   │
│ ├─ Coverage ≥75% │        │ ├─ Webhook tests     │
│ └─ [REQUIRED]    │        │ └─ [CONDITIONAL]     │
└──────────────────┘        └──────────────────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 3: Contract Tests (5 min)                          │
│ ├─ Pact consumer tests                                  │
│ ├─ OpenAPI schema validation                            │
│ └─ [CONDITIONAL on API changes]                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 4: Security Scanning (5 min)                       │
│ ├─ SAST (SonarQube)                                     │
│ ├─ Dependency scan (Snyk)                               │
│ ├─ Secrets scanning (TruffleHog)                        │
│ └─ [REQUIRED]                                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 5: Code Review                                     │
│ ├─ 1+ approval required                                 │
│ ├─ All conversations resolved                           │
│ └─ [REQUIRED]                                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ ✅ PR APPROVED - Merge to main/develop                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 6: E2E Smoke Tests on Staging (15 min)             │
│ ├─ 18 critical user journeys                            │
│ ├─ Mobile + Admin portal                                │
│ ├─ Pass rate ≥ 95%                                      │
│ └─ [REQUIRED for release]                               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 7: Performance Regression Check (5 min)            │
│ ├─ Compare p95 latency vs baseline                      │
│ ├─ Alert if > 10% regression                            │
│ └─ [OPTIONAL review gate]                               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ 🚀 READY FOR PRODUCTION RELEASE                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Gate-by-Gate Configuration

### Gate 1: Lint & TypeCheck (PR Required)

```yaml
name: Lint & Type Check
on: [pull_request, push]

jobs:
  lint-mobile:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: swipesavvy-mobile-app
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint -- --format json --output-file lint-report.json || true
      - run: npm run typecheck
      - name: Comment Lint Results
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('swipesavvy-mobile-app/lint-report.json', 'utf8'));
            const errors = report.filter(f => f.messages.length > 0);
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `### ❌ Lint Failures\n\n${errors.map(e => `- ${e.filePath}: ${e.messages.length} issues`).join('\n')}`
            });

  lint-admin:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: swipesavvy-admin-portal
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run lint && npm run typecheck

  lint-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: swipesavvy-mobile-app
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: |
          pip install flake8 black mypy
          flake8 . --count --statistics
          black . --check
          mypy app --strict

  require-lint-pass:
    runs-on: ubuntu-latest
    needs: [lint-mobile, lint-admin, lint-backend]
    if: always()
    steps:
      - name: Check lint status
        if: |
          needs.lint-mobile.result == 'failure' ||
          needs.lint-admin.result == 'failure' ||
          needs.lint-backend.result == 'failure'
        run: exit 1
```

### Gate 2a: Unit Tests (PR Required)

```yaml
name: Unit Tests
on: [pull_request, push]

jobs:
  test-mobile-unit:
    runs-on: macos-latest
    defaults:
      run:
        working-directory: swipesavvy-mobile-app
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit -- --coverage --testPathPattern="__tests__"
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: mobile-unit
      - name: Check Coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq .total.lines.pct)
          if (( $(echo "$COVERAGE < 75" | bc -l) )); then
            echo "❌ Coverage below 75%: $COVERAGE%"
            exit 1
          fi

  test-admin-unit:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: swipesavvy-admin-portal
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: admin-unit

  test-backend-unit:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: swipesavvy-mobile-app
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: |
          pip install -r requirements-test.txt
          pytest tests/unit/ --cov=app --cov-report=xml --cov-report=html
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
          flags: backend-unit
      - name: Check Coverage
        run: |
          COVERAGE=$(grep -oP 'line-rate="\K[^"]+' coverage.xml | head -1)
          if (( $(echo "$COVERAGE < 0.75" | bc -l) )); then
            echo "❌ Coverage below 75%"
            exit 1
          fi

  require-unit-tests-pass:
    runs-on: ubuntu-latest
    needs: [test-mobile-unit, test-admin-unit, test-backend-unit]
    if: always()
    steps:
      - if: |
          needs.test-mobile-unit.result == 'failure' ||
          needs.test-admin-unit.result == 'failure' ||
          needs.test-backend-unit.result == 'failure'
        run: exit 1
```

### Gate 2b: Integration Tests (Conditional on API Changes)

```yaml
name: Integration Tests
on: [pull_request, push]

jobs:
  detect-api-changes:
    runs-on: ubuntu-latest
    outputs:
      api-changed: ${{ steps.check.outputs.api-changed }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - id: check
        run: |
          if git diff origin/main -- '**/routes/**' '**/services/**' '**/api/**' | grep -q .; then
            echo "api-changed=true" >> $GITHUB_OUTPUT
          else
            echo "api-changed=false" >> $GITHUB_OUTPUT
          fi

  test-integration:
    runs-on: ubuntu-latest
    needs: detect-api-changes
    if: needs.detect-api-changes.outputs.api-changed == 'true'
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    defaults:
      run:
        working-directory: swipesavvy-mobile-app
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: |
          pip install -r requirements-test.txt
          pytest tests/integration/ -v --tb=short
      - name: Upload Integration Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-results
          path: test-results/

  test-integration-admin:
    runs-on: ubuntu-latest
    needs: detect-api-changes
    if: needs.detect-api-changes.outputs.api-changed == 'true'
    defaults:
      run:
        working-directory: swipesavvy-admin-portal
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run test:integration
```

### Gate 3: Contract Tests (Conditional on API Changes)

```yaml
name: Contract Tests
on: [pull_request, push]

jobs:
  detect-contract-changes:
    runs-on: ubuntu-latest
    outputs:
      changed: ${{ steps.check.outputs.changed }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - id: check
        run: |
          if git diff origin/main -- '**/openapi/**' '**/pact/**' '**/schemas/**'; then
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

  contract-tests:
    runs-on: ubuntu-latest
    needs: detect-contract-changes
    if: needs.detect-contract-changes.outputs.changed == 'true'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-python@v4
      - run: |
          # Run Pact consumer tests
          cd swipesavvy-mobile-app && npm run test:pact
          cd ../swipesavvy-admin-portal && npm run test:pact
          
          # Run OpenAPI validation
          cd ../swipesavvy-mobile-app && python -m pytest tests/contracts/test_openapi.py -v
```

### Gate 4: Security Scanning (PR Required)

```yaml
name: Security Scanning
on: [pull_request, push]

jobs:
  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: TruffleHog Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

  sast-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@master
        with:
          args: -Dsonar.sources=./swipesavvy-mobile-app/src,./swipesavvy-admin-portal/src
        env:
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-python@v4
      - name: npm audit (Mobile & Admin)
        run: |
          cd swipesavvy-mobile-app && npm audit --audit-level=moderate || true
          cd ../swipesavvy-admin-portal && npm audit --audit-level=moderate || true
      - name: pip audit (Backend)
        run: |
          cd swipesavvy-mobile-app && pip install pip-audit
          pip-audit --desc -v

  require-security-pass:
    runs-on: ubuntu-latest
    needs: [secrets-scan, sast-scan, dependency-scan]
    if: always()
    steps:
      - if: |
          needs.secrets-scan.result == 'failure' ||
          needs.sast-scan.result == 'failure'
        run: exit 1
```

### Gate 5: Code Review (GitHub Settings)

**Configure in repository settings (Protection Rules)**:

```yaml
Branch: main/develop
  ├─ Require 1 approval (or 2 for critical changes)
  ├─ Dismiss stale reviews
  ├─ Require code quality status checks to pass
  └─ Restrict who can push to matching branches (admins only)
```

### Gate 6: E2E Smoke Tests on Staging (Release Required)

```yaml
name: Staging Smoke Tests
on:
  workflow_dispatch:  # Manual trigger for releases
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  deploy-to-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging
        run: ./scripts/deploy-staging.sh
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          STAGING_URL: ${{ secrets.STAGING_URL }}
      - name: Wait for deployment
        run: sleep 60 && curl -f ${{ secrets.STAGING_URL }}/health

  smoke-tests-mobile:
    runs-on: macos-latest
    needs: deploy-to-staging
    defaults:
      run:
        working-directory: swipesavvy-mobile-app
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npx detox build-framework-cache ios && npx detox test-ios --configuration release --cleanup
      - name: Upload E2E Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: detox-results
          path: artifacts/

  smoke-tests-admin:
    runs-on: ubuntu-latest
    needs: deploy-to-staging
    defaults:
      run:
        working-directory: swipesavvy-admin-portal
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npx playwright test --reporter=html
      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  e2e-status-check:
    runs-on: ubuntu-latest
    needs: [smoke-tests-mobile, smoke-tests-admin]
    if: always()
    steps:
      - name: Check E2E Results
        if: |
          needs.smoke-tests-mobile.result == 'failure' ||
          needs.smoke-tests-admin.result == 'failure'
        run: |
          echo "❌ E2E tests failed - DO NOT RELEASE"
          exit 1
      - name: E2E Status Update
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ **E2E Smoke Tests PASSED** - Ready for production release'
            });
```

### Gate 7: Performance Regression Check (Optional Alert)

```yaml
name: Performance Regression Check
on: [pull_request, push]

jobs:
  performance-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: swipesavvy-mobile-app
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: |
          pip install k6 locust
          locust -f tests/performance/locustfile.py --headless -u 50 -r 10 --run-time 2m --csv=results
      - name: Compare to Baseline
        run: |
          CURRENT_P95=$(grep "requests" results_stats.csv | tail -1 | cut -d',' -f8)
          BASELINE_P95=$(cat performance-baseline.json | jq .p95)
          
          REGRESSION=$(echo "scale=2; ($CURRENT_P95 - $BASELINE_P95) / $BASELINE_P95 * 100" | bc)
          
          if (( $(echo "$REGRESSION > 10" | bc -l) )); then
            echo "⚠️ Performance regression detected: $REGRESSION%"
            exit 1
          fi
      - name: Update Baseline
        if: github.ref == 'refs/heads/main'
        run: |
          echo "{\"p95\": $CURRENT_P95, \"timestamp\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\"}" > performance-baseline.json
          git add performance-baseline.json
          git commit -m "Update performance baseline"

  post-regression-comment:
    runs-on: ubuntu-latest
    needs: performance-test
    if: failure()
    steps:
      - uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ **Performance Regression Detected** - Please review performance impact'
            });
```

---

## 4. Status Checks Configuration

### GitHub Protected Branch Settings

```yaml
Branch Protection Rules for: main
├─ Require status checks to pass before merging:
│  ├─ lint-mobile
│  ├─ lint-admin
│  ├─ lint-backend
│  ├─ test-mobile-unit
│  ├─ test-admin-unit
│  ├─ test-backend-unit
│  ├─ contract-tests (required if API changed)
│  ├─ secrets-scan
│  ├─ sast-scan
│  └─ dependency-scan
│
├─ Require reviews before merging:
│  ├─ 1 approval (standard)
│  └─ 2 approvals (for api/, database/, auth/ changes)
│
├─ Dismiss stale pull request approvals when new commits are pushed
├─ Require code review from code owners
├─ Require status checks to pass before merging
└─ Include administrators in restriction
```

---

## 5. Rollback & Hotfix Gates

### Hotfix Branch Protection

```yaml
Branch: hotfix/*
├─ Require status checks (all gates except E2E)
├─ Require 1 approval from release team
├─ Allow direct push from release lead (for emergency patches)
└─ Auto-merge to main + develop after approval
```

### Automatic Rollback Trigger

```yaml
name: Automatic Rollback on Production Error
on:
  repository_dispatch:
    types: [production-error]

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Get Last Stable Release
        run: |
          LAST_STABLE=$(git describe --tags --abbrev=0 --match="v*-stable")
          echo "ROLLBACK_VERSION=$LAST_STABLE" >> $GITHUB_ENV
      - name: Execute Rollback
        run: ./scripts/rollback-to-version.sh ${{ env.ROLLBACK_VERSION }}
      - name: Run Smoke Tests
        run: |
          ./scripts/run-smoke-tests.sh
          if [ $? -eq 0 ]; then
            echo "✅ Rollback successful"
          else
            echo "❌ Rollback failed - manual intervention required"
            exit 1
          fi
      - name: Notify Team
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 PRODUCTION ROLLBACK EXECUTED',
              body: `Rolled back to ${process.env.ROLLBACK_VERSION}`
            });
```

---

## 6. Release Automation Pipeline

### Automated Versioning & Release

```yaml
name: Release Pipeline
on:
  push:
    branches: [main]
    paths:
      - 'package.json'

jobs:
  version-bump:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.semver.outputs.version }}
    steps:
      - uses: actions/checkout@v3
      - id: semver
        run: |
          VERSION=$(cat package.json | jq -r .version)
          echo "version=$VERSION" >> $GITHUB_OUTPUT
      - name: Create Release Tag
        run: |
          git tag -a v${{ steps.semver.outputs.version }} -m "Release v${{ steps.semver.outputs.version }}"
          git push origin v${{ steps.semver.outputs.version }}

  staging-deploy:
    runs-on: ubuntu-latest
    needs: version-bump
    steps:
      - uses: actions/checkout@v3
        with:
          ref: v${{ needs.version-bump.outputs.version }}
      - run: ./scripts/deploy-staging.sh

  staging-validation:
    runs-on: ubuntu-latest
    needs: staging-deploy
    steps:
      - run: ./scripts/run-smoke-tests.sh
      - run: ./scripts/run-performance-baseline.sh

  production-approval:
    runs-on: ubuntu-latest
    needs: [version-bump, staging-validation]
    environment:
      name: production
      reviewers:
        - release-lead
        - tech-lead
    steps:
      - name: Wait for Approval
        run: echo "⏳ Awaiting production release approval..."

  production-deploy:
    runs-on: ubuntu-latest
    needs: [version-bump, production-approval]
    steps:
      - uses: actions/checkout@v3
        with:
          ref: v${{ needs.version-bump.outputs.version }}
      - name: Deploy Mobile App
        run: ./scripts/deploy-mobile.sh
      - name: Deploy Admin Portal
        run: ./scripts/deploy-admin-portal.sh
      - name: Deploy Backend
        run: ./scripts/deploy-backend.sh
      - name: Run Post-Deploy Smoke Tests
        run: ./scripts/run-smoke-tests-production.sh

  post-deploy-monitoring:
    runs-on: ubuntu-latest
    needs: production-deploy
    strategy:
      matrix:
        check: [health, performance, errors, logs]
    steps:
      - name: Monitor ${{ matrix.check }}
        run: ./scripts/monitor-${{ matrix.check }}.sh
      - name: Alert on Issues
        if: failure()
        run: ./scripts/alert-incidents.sh
```

---

## 7. Gate Bypass & Emergency Procedures

### Emergency Release Process

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-issue-xxx main

# 2. Make fix with minimal changes
# ... commit changes ...

# 3. Create PR with labels
git push origin hotfix/critical-issue-xxx
gh pr create --title "HOTFIX: " --body "..." --label "hotfix,urgent"

# 4. After approval, merge directly (gates auto-pass for hotfixes)
gh pr merge --squash

# 5. Tag release
git tag -a v1.2.3-hotfix-1 -m "Hotfix release"
git push origin v1.2.3-hotfix-1

# 6. Deploy immediately
./scripts/deploy-production-hotfix.sh v1.2.3-hotfix-1
```

---

## 8. Monitoring & Alerting

### Gate Health Dashboard

```bash
#!/bin/bash
# scripts/gate-health-dashboard.sh

echo "📊 CI/CD Gate Health Report"
echo "============================="
echo ""

# Last 7 days of builds
echo "Passing Rate (Last 7 days):"
gh run list --branch main --limit 50 --json conclusion,name \
  | jq -r '.[] | "\(.name): \(.conclusion)"' \
  | sort | uniq -c

echo ""
echo "Flaky Tests (Failures in last 3 runs):"
gh run list --branch main --limit 30 --json databaseId,conclusion \
  | jq -r '.[] | select(.conclusion == "failure") | .databaseId' \
  | head -3 \
  | while read run; do
    gh run view $run --json jobs
  done

echo ""
echo "Gate Timing (Average):"
echo "  Lint & TypeCheck: ~3 min"
echo "  Unit Tests: ~8 min"
echo "  Integration Tests: ~12 min"
echo "  Security Scanning: ~5 min"
echo "  Total PR to Merge: ~30 min"
```

---

## 9. Team Runbook

### What to do when a gate fails

| Gate | Common Cause | Fix |
|---|---|---|
| **Lint** | Code style | `npm run lint -- --fix` |
| **TypeCheck** | Type error | Review error message, fix types |
| **Unit Tests** | Logic error | Debug test, fix code or test |
| **Integration** | DB/external issue | Check vendor sandbox status, reset data |
| **Contract** | API schema mismatch | Update Pact contract, regenerate |
| **Security** | Secrets/vulns | Remove secrets, update dependency |
| **E2E** | Test flake | Re-run, debug screenshot/video |
| **Performance** | Regression | Optimize code or update baseline |

### How to request gate bypass

1. **Minor changes** (docs, comments): 
   - Add `[skip-tests]` label to PR
   - Requires 2 approvals

2. **Hotfix releases**: 
   - Use `hotfix/*` branch
   - Automatic gate pass after security approval

3. **Deliberate gate fail** (intentional design):
   - Document reason in PR description
   - Requires tech lead approval + ticket reference

---

## 10. Success Criteria

By end of Task 8, we will have:

- ✅ All 7 gates configured and functional
- ✅ GitHub protected branch rules enforced
- ✅ All status checks passing on main branch
- ✅ E2E smoke tests passing 95%+ rate
- ✅ Zero secrets in repository
- ✅ Dependency scanning enabled
- ✅ Automated release pipeline tested
- ✅ Rollback procedure verified
- ✅ Team trained on gate bypass procedures
- ✅ Dashboard monitoring active

---

## Next Steps (Task 9)

→ **Add Observability & Debug Breadcrumbs** for production monitoring

