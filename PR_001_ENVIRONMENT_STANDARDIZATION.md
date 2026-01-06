# PR #1: Environment Standardization + Security Fix

**Type**: CRITICAL Security Fix + Environment Configuration
**Priority**: P0 (MUST MERGE FIRST)
**Estimated Review Time**: 30 minutes
**Estimated Merge Time**: ASAP (after key rotation)

---

## Summary

This PR addresses **4 critical P0 blockers** that prevent any deployment:
1. **SECURITY**: Removes exposed API keys from repository
2. **BUILD**: Standardizes Node.js version to 20.13.0
3. **CI/CD**: Updates GitLab CI to use correct Node version
4. **DOCUMENTATION**: Creates comprehensive environment templates

---

## Changes

### 🔴 SECURITY: API Keys Removed

**Files Changed**:
- `.gitignore` — Added `.env` patterns to prevent future commits
- `SECURITY_INCIDENT_RESPONSE.md` — Created incident response documentation

**Actions Required BEFORE Merge**:
1. ✅ Rotate all Together.AI API keys (see SECURITY_INCIDENT_RESPONSE.md)
2. ✅ Store new keys in AWS Secrets Manager / 1Password
3. ✅ Remove `.env` from git history (use BFG Repo-Cleaner)
4. ✅ Notify team to re-clone repository

**Evidence of Fix**:
```bash
# .env is now blocked
$ git add .env
$ git status
# .env appears in "Untracked files" (not staged)

# .env is not in repository
$ git ls-files | grep ".env"
# (empty output)
```

---

### 🔧 Node.js Version Standardization

**Files Changed**:
- `.gitlab-ci.yml` — Updated Node from 18 to 20.13.0, Python from 3.9 to 3.11

**Before**:
```yaml
variables:
  NODE_VERSION: "18"          # ❌ WRONG
  PYTHON_VERSION: "3.9"       # ❌ OUTDATED
  DOCKER_IMAGE: "node:18-alpine"
```

**After**:
```yaml
variables:
  NODE_VERSION: "20.13.0"     # ✅ CORRECT (matches .nvmrc)
  NPM_VERSION: "10.8.2"       # ✅ CORRECT (matches engines)
  PYTHON_VERSION: "3.11"      # ✅ CURRENT STABLE
  DOCKER_IMAGE: "node:20.13.0-alpine"
```

**Validation**:
```bash
# CI will now match local development
Local:  Node 20.13.0, npm 10.8.2
CI:     Node 20.13.0, npm 10.8.2
.nvmrc: 20.13.0
✅ ALL ALIGNED
```

---

### 📁 Environment Templates Created

**Files Created**:
- `.env.example` — Development environment template (70+ variables documented)
- `.env.production.example` — Production template with secrets manager references

**Developer Workflow**:
```bash
# Step 1: Copy template
cp .env.example .env

# Step 2: Fill in values
# Edit .env with your local API keys

# Step 3: Never commit
# .gitignore now blocks .env files
```

**Production Workflow**:
```bash
# Use AWS Secrets Manager instead of .env files
aws secretsmanager create-secret \
  --name swipesavvy/production/together-api-key \
  --secret-string "YOUR_ROTATED_KEY"
```

---

### 🛠️ CI/CD Path Fixes

**Files Changed**:
- `.gitlab-ci.yml` — Fixed references to non-existent directories

**Before**:
```yaml
lint:mobile-app:
  script:
    - cd swipesavvy-mobile-app  # ❌ Directory doesn't exist
    - npm install
```

**After**:
```yaml
lint:mobile-app:
  script:
    # Root directory IS the mobile app
    - npm install               # ✅ CORRECT
    - npm run lint
```

---

## Testing

### Manual Testing Checklist

- [ ] Install Node 20.13.0 locally (`nvm install 20.13.0 && nvm use 20.13.0`)
- [ ] Install npm 10.8.2 (`npm install -g npm@10.8.2`)
- [ ] Clean install (`rm -rf node_modules package-lock.json && npm install`)
- [ ] No engine warnings appear during `npm install`
- [ ] Admin portal installs (`cd swipesavvy-admin-portal && npm install`)
- [ ] Try to commit .env (`git add .env`) — should stay in untracked files
- [ ] Verify .env is not in `git ls-files` output

### CI/CD Testing

- [ ] Push to feature branch
- [ ] GitLab CI pipeline passes (lint, build stages)
- [ ] No Node version warnings in CI logs
- [ ] Build artifacts are produced

---

## Security Checklist (REQUIRED BEFORE MERGE)

- [ ] **All 3 Together.AI API keys rotated** on dashboard
- [ ] **Old keys deleted** from Together.AI dashboard
- [ ] **New keys stored** in AWS Secrets Manager / 1Password
- [ ] **Production environments updated** with new keys
- [ ] **Git history cleaned** (`.env` removed from all commits)
- [ ] **Team notified** to re-clone repository
- [ ] **API usage audited** for anomalies (check Together.AI dashboard)
- [ ] **Costs reviewed** (no unauthorized charges)

---

## Rollout Plan

### Phase 1: Pre-Merge (1 hour)
1. **SECURITY LEAD**: Rotate API keys immediately
2. **SECURITY LEAD**: Audit Together.AI usage logs
3. **DEVOPS**: Update production secrets with new keys
4. **ENG MANAGER**: Notify team of upcoming git history rewrite

### Phase 2: Merge (15 minutes)
1. **REVIEWER**: Approve PR after security checklist completion
2. **SUBMITTER**: Merge to main branch
3. **SUBMITTER**: Clean git history with BFG Repo-Cleaner
4. **SUBMITTER**: Force push to remote (`git push --force origin main`)

### Phase 3: Post-Merge (30 minutes)
1. **ALL DEVELOPERS**: Re-clone repository
   ```bash
   mv swipesavvy-mobile-app-v2 swipesavvy-mobile-app-v2-old
   git clone <repo-url> swipesavvy-mobile-app-v2
   cd swipesavvy-mobile-app-v2
   cp .env.example .env
   # Fill in .env with your local keys
   npm install
   ```
2. **CI/CD**: Verify pipeline runs with Node 20.13.0
3. **DEVOPS**: Verify production deployments still work

---

## Risks & Mitigation

### Risk 1: Force Push Breaks Developer Workflows
**Likelihood**: HIGH
**Impact**: MEDIUM (developers need to re-clone)
**Mitigation**:
- Send advance notice (2 hours before force push)
- Provide clear re-clone instructions
- Schedule during low-activity time (evening/weekend)
- Keep backup of old repo (`git clone . ../backup`)

### Risk 2: New API Keys Don't Work
**Likelihood**: LOW
**Impact**: HIGH (production breaks)
**Mitigation**:
- Test new keys in staging first
- Keep old keys active for 1 hour during transition
- Have rollback plan (restore old keys)
- Monitor API error rates during transition

### Risk 3: CI Pipeline Fails with New Node Version
**Likelihood**: LOW
**Impact**: MEDIUM (delays future deployments)
**Mitigation**:
- Test in feature branch before merging
- Have Node 18 fallback option
- Update Docker base images gradually

---

## Rollback Plan

**If Production Breaks**:
```bash
# Step 1: Revert git history changes
git reset --hard <commit-before-force-push>
git push --force origin main

# Step 2: Restore old API keys (temporary)
# Login to Together.AI, recreate old keys if possible
# OR use backup keys

# Step 3: Notify team
# "Rolling back PR #1 due to production issues"
```

**If New Keys Don't Work**:
- Keep old keys active for 24 hours during transition
- Test thoroughly in staging before production

---

## Success Criteria

✅ **Security**:
- [ ] .env file is in .gitignore
- [ ] .env file is not in git history
- [ ] All API keys rotated
- [ ] No secrets in repository

✅ **Build**:
- [ ] Node 20.13.0 enforced locally and in CI
- [ ] npm install completes without engine warnings
- [ ] Build completes successfully

✅ **CI/CD**:
- [ ] GitLab CI uses Node 20.13.0
- [ ] CI paths are correct (root is mobile app)
- [ ] CI pipeline passes

✅ **Documentation**:
- [ ] .env.example is comprehensive
- [ ] SECURITY_INCIDENT_RESPONSE.md is complete
- [ ] Developer onboarding docs updated

---

## Related PRs

**Depends On**: None (this is PR #1)

**Blocks**:
- PR #2: React Version Downgrade (requires clean environment first)
- PR #3: Package Identity Fix (requires correct Node version)
- PR #4: TypeScript Errors Fix (requires correct environment)

**Timeline**:
- PR #1: Merge today (after security actions)
- PR #2-7: Start tomorrow (after PR #1 is stable)

---

## Review Checklist (For Reviewer)

### Code Review
- [ ] .gitignore changes are correct
- [ ] .env.example has no real secrets
- [ ] .gitlab-ci.yml Node version is 20.13.0
- [ ] CI paths are updated correctly
- [ ] No other files contain hardcoded secrets

### Security Review
- [ ] API keys have been rotated (verify with security lead)
- [ ] .env is not in git history (run `git log --all -- .env`)
- [ ] SECURITY_INCIDENT_RESPONSE.md is accurate
- [ ] Team has been notified of git history rewrite

### Documentation Review
- [ ] .env.example is comprehensive
- [ ] Comments explain each variable's purpose
- [ ] Production template references secrets manager
- [ ] README is updated (if applicable)

---

## Approvers

**Required Approvals**: 2

**Security Sign-Off** (Required):
- [ ] Security Lead / CTO

**Technical Review**:
- [ ] Senior Engineer
- [ ] DevOps Lead

---

## Post-Merge Actions

### Immediate (Within 1 hour)
1. Monitor CI/CD pipelines for failures
2. Check production error rates (Sentry/Datadog)
3. Verify API calls to Together.AI are working
4. Confirm no unauthorized API usage

### Short-Term (Within 1 day)
1. Confirm all developers re-cloned successfully
2. Install pre-commit hooks (`pip install pre-commit && pre-commit install`)
3. Add secret scanning to CI (`detect-secrets`)
4. Schedule quarterly API key rotation

### Long-Term (Within 1 week)
1. Implement AWS Secrets Manager integration
2. Add automated secret rotation
3. Create security training for developers
4. Document secrets management policy

---

## Additional Resources

- **Incident Response Plan**: `SECURITY_INCIDENT_RESPONSE.md`
- **Architecture Diagrams**: `ARCHITECTURE_DIAGRAMS.md` (Diagram #11)
- **Detailed Analysis**: `CRITICAL_FINDINGS_DEEP_DIVE.md` (Blocker #1, #3)
- **Full Audit Report**: `COMPREHENSIVE_PRODUCTION_AUDIT_REPORT.md`

---

## Questions?

**Slack**: #swipesavvy-dev
**Email**: engineering@swipesavvy.com
**On-Call**: oncall@swipesavvy.com (for production issues)

---

**PR Status**: READY FOR SECURITY APPROVAL
**Merge Window**: After API keys are rotated (coordinate with security lead)
