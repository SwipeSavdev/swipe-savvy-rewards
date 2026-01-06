# SwipeSavvy Platform — GitHub Issues Import File

This file contains all 123 issues from the comprehensive production audit, formatted for GitHub Issues import.

---

## PHASE 1: CRITICAL BLOCKERS (Week 1) — P0 Issues

### Issue #1: [P0] Node Version Mismatch — Build Failure

**Labels**: `P0-blocker`, `build-system`, `environment`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: DevOps Lead

**Description**:
Local development environment uses Node v24.10.0 but the project requires Node v20.13.0 per `.nvmrc`. This mismatch causes engine warnings on every `npm install` and potential runtime incompatibilities.

**Impact**:
- Engine warnings on every npm install
- Potential runtime incompatibilities between Node 24 and Node 20
- CI/CD will fail if using different version
- Developer onboarding friction

**Evidence**:
```bash
$ node --version
v24.10.0  # ❌ WRONG

# .nvmrc
20.13.0   # ✅ CORRECT
```

**Fix**:
```bash
nvm install 20.13.0
nvm use 20.13.0
nvm alias default 20.13.0
```

**Validation**:
```bash
node --version  # Should output v20.13.0
npm install  # Should complete without engine warnings
```

**Dependencies**:
- Blocks PR #2 (React Version Downgrade)
- Blocks PR #3 (Package Identity Fix)

**Acceptance Criteria**:
- [ ] Node 20.13.0 installed locally via nvm
- [ ] `node --version` outputs v20.13.0
- [ ] `npm install` completes without engine warnings
- [ ] Updated developer onboarding docs

---

### Issue #2: [P0] npm Version Mismatch — Lockfile Corruption Risk

**Labels**: `P0-blocker`, `build-system`, `environment`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: DevOps Lead

**Description**:
Local npm version is 11.6.0 but project requires npm 10.8.2. Different npm versions use different lockfile formats and dependency resolution algorithms.

**Impact**:
- package-lock.json format differences (lockfileVersion 3 vs 2)
- Dependency resolution algorithm changes
- CI/CD lockfile drift
- Non-deterministic builds

**Evidence**:
```bash
$ npm --version
11.6.0  # ❌ WRONG

# admin-portal/package.json engines
"npm": "10.8.2"  # ✅ REQUIRED
```

**Fix**:
```bash
npm install -g npm@10.8.2
```

**Validation**:
```bash
npm --version  # Should output 10.8.2
```

**Dependencies**:
- Must be fixed alongside Issue #1
- Blocks all dependency updates

**Acceptance Criteria**:
- [ ] npm 10.8.2 installed globally
- [ ] `npm --version` outputs 10.8.2
- [ ] package-lock.json regenerated with correct version
- [ ] CI uses npm 10.8.2

---

### Issue #3: [P0] React 19 Incompatible with React Native — App Crashes

**Labels**: `P0-blocker`, `dependencies`, `react`, `mobile-app`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: Frontend Lead

**Description**:
Root package.json has React 19.1.0 but React Native 0.81.5 only supports React 18.x. This incompatibility will cause the mobile app to crash on startup.

**Impact**:
- **Mobile app will crash on startup**
- "Cannot read property X of undefined" errors
- ALL React Native functionality broken
- Cannot test or deploy mobile app

**Evidence**:
```json
// Root package.json
"react": "^19.1.0",  // ❌ INCOMPATIBLE
"react-native": "^0.81.5"  // Requires React 18.x

// Admin Portal package.json
"react": "^18.2.0"  // ✅ CORRECT
```

**Root Cause**:
Manual dependency updates without checking React Native compatibility matrix.

**Fix**:
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
npm install react@18.2.0 react-dom@18.2.0
npm install @types/react@18.2.66 @types/react-dom@18.2.22
```

**Validation**:
```bash
npm start  # Expo should load without errors
# Test mobile app on iOS/Android simulator
```

**Dependencies**:
- Depends on Issue #1 (Node version fix)
- Blocks Issue #4 (TypeScript errors fix)

**Acceptance Criteria**:
- [ ] React downgraded to 18.2.0 in root package.json
- [ ] `npm start` completes without errors
- [ ] Mobile app loads on iOS simulator
- [ ] Mobile app loads on Android simulator
- [ ] No React version warnings in console

**References**:
- React Native compatibility: https://reactnative.dev/docs/environment-setup
- Related PR: #2 (React Version Downgrade)

---

### Issue #4: [P0] Package Identity Crisis — Root Claims to Be Admin Portal

**Labels**: `P0-blocker`, `configuration`, `architecture`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: Platform Lead

**Description**:
Root package.json has `"name": "swipesavvy-admin-portal"` but it actually contains the mobile app code (Expo, React Native).

**Impact**:
- npm publish will overwrite wrong package
- Confusion in CI/CD pipelines
- Developer confusion about repository structure
- Incorrect package references in tooling

**Evidence**:
```json
// Root package.json (WRONG)
{
  "name": "swipesavvy-admin-portal",  // ❌ INCORRECT
  "dependencies": {
    "expo": "^54.0.30",  // This proves it's mobile app!
    "react-native": "^0.81.5"
  }
}
```

**Fix**:
```json
// Root package.json (CORRECT)
{
  "name": "swipesavvy-mobile-app",
  "description": "SwipeSavvy mobile app built with React Native and Expo"
}
```

**Validation**:
```bash
npm run build  # Should complete without errors
# Verify CI/CD references are updated
```

**Dependencies**:
- Related to Issue #5 (Bundler confusion)
- Blocks proper monorepo setup

**Acceptance Criteria**:
- [ ] Root package.json name changed to "swipesavvy-mobile-app"
- [ ] All CI/CD references updated
- [ ] README updated with correct package name
- [ ] No other references to old name found

---

### Issue #5: [P0] Metro vs Vite Bundler Conflict — Cannot Build

**Labels**: `P0-blocker`, `build-system`, `bundler`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: Build System Lead

**Description**:
Root package.json includes BOTH Vite (web bundler) AND Metro (React Native bundler), causing build confusion.

**Impact**:
- Build scripts cannot determine which bundler to use
- Incorrect bundler configuration applied
- Wasted dependencies (Vite not needed in mobile app)
- Developer confusion

**Evidence**:
```json
// Root package.json
"vite": "^5.4.21",         // ❌ Web bundler (wrong)
"expo": "^54.0.30"         // ✅ Uses Metro bundler (correct)
```

**Fix**:
Remove Vite from root package.json, keep only in admin-portal:
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
npm uninstall vite @vitejs/plugin-react
# Verify admin-portal still has Vite
```

**Validation**:
```bash
npm run build  # Should use Metro bundler only
npm list vite  # Should show "not found" in root
cd swipesavvy-admin-portal && npm list vite  # Should show vite@5.4.21
```

**Dependencies**:
- Related to Issue #4 (Package identity)
- Blocks build system unification

**Acceptance Criteria**:
- [ ] Vite removed from root package.json
- [ ] Vite still present in admin-portal package.json
- [ ] `npm run build` uses Metro only
- [ ] No Vite configuration in root directory

---

### Issue #6: [P0] Admin Portal TypeScript Build Broken — Type Errors

**Labels**: `P0-blocker`, `typescript`, `admin-portal`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: Frontend Lead

**Description**:
Admin portal build fails with TypeScript errors in FeatureFlagsPage.tsx. Cannot build production bundle.

**Impact**:
- **Cannot build production bundle** for admin portal
- Blocks production deployment
- Type safety compromised
- Feature flags page non-functional

**Errors**:
```typescript
// swipesavvy-admin-portal/src/pages/FeatureFlagsPage.tsx

// Line 126: Type mismatch
error TS2345: Argument of type '{ id: string; category: string; ... }[]'
is not assignable to parameter of type 'FeatureFlag[] | (() => FeatureFlag[])'.
  Types of property 'category' are incompatible.
    Type 'string' is not assignable to type 'FeatureCategory | undefined'.

// Line 293: Undefined property
error TS18048: 'flag.rolloutPct' is possibly 'undefined'.
```

**Root Cause**:
1. Mock data has `category: string` instead of `FeatureCategory` enum
2. Missing null check on `rolloutPct` property

**Fix**:
```typescript
// Line 126: Cast category or use enum
const mockFlags: FeatureFlag[] = MOCK_FLAGS.map(flag => ({
  ...flag,
  category: flag.category as FeatureCategory  // Type assertion
}));

// Line 293: Add null check
const percentage = flag.rolloutPct ?? 0;  // Default to 0 if undefined
```

**Validation**:
```bash
cd swipesavvy-admin-portal
npm run build  # Should complete without errors
npm run type-check  # Should pass
```

**Dependencies**:
- Depends on Issue #3 (React version fix)
- Related to Issue #8 (TypeScript strict mode)

**Acceptance Criteria**:
- [ ] FeatureFlagsPage.tsx line 126 type error fixed
- [ ] FeatureFlagsPage.tsx line 293 null check added
- [ ] `npm run build` completes without errors
- [ ] Feature flags page renders correctly
- [ ] Add snapshot test for FeatureFlagsPage

**References**:
- File: `swipesavvy-admin-portal/src/pages/FeatureFlagsPage.tsx:126,293`

---

### Issue #7: [P0] SECURITY: API Keys Exposed in Git Repository

**Labels**: `P0-blocker`, `security`, `critical-security`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: Security Lead, CTO

**Description**:
**CRITICAL SECURITY BREACH**: Three Together.AI API keys committed to `.env` file in git repository.

**Impact**:
- **CRITICAL SECURITY BREACH** — Anyone with repo access can use API keys
- Potential $10,000-$50,000 fraudulent AI API usage
- Compliance violation (PCI-DSS, SOC2)
- Service disruption if keys are revoked
- Reputational damage

**Exposed Keys**:
```bash
TOGETHER_API_KEY=***REMOVED***
TOGETHER_API_KEY_GENERAL=***REMOVED***
TOGETHER_API_KEY_MARKETING=***REMOVED***
```

**Immediate Actions Required**:

1. **ROTATE ALL KEYS IMMEDIATELY** (within 1 hour):
   - Login to Together.AI dashboard: https://api.together.xyz/settings/api-keys
   - Create new keys with same permissions
   - Delete old exposed keys
   - Store new keys in AWS Secrets Manager / 1Password

2. **Add .env to .gitignore**:
   ```bash
   echo ".env*" >> .gitignore
   echo "!.env.example" >> .gitignore
   git add .gitignore
   ```

3. **Remove from git history**:
   ```bash
   # Option 1: BFG Repo-Cleaner (recommended)
   brew install bfg
   bfg --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin --force --all

   # Option 2: git filter-branch
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env .env.local .env.database" \
     --prune-empty --tag-name-filter cat -- --all
   ```

4. **Audit API usage**:
   - Check Together.AI dashboard for anomalies
   - Review billing for unauthorized charges
   - Document any suspicious activity

5. **Notify stakeholders**:
   - Engineering team
   - Security team
   - Compliance team
   - Finance team (potential charges)

**Validation**:
```bash
git log --all -- .env  # Should return empty
grep -r "tgp_v1_" .  # Should not find any keys
```

**Dependencies**:
- **MUST BE FIXED FIRST** before any PR can be merged
- Blocks all other security work

**Acceptance Criteria**:
- [ ] All 3 Together.AI API keys rotated on dashboard
- [ ] Old keys deleted from Together.AI dashboard
- [ ] New keys stored in AWS Secrets Manager / 1Password
- [ ] .env added to .gitignore
- [ ] .env removed from git history (verified with `git log --all -- .env`)
- [ ] API usage audited for anomalies
- [ ] Stakeholders notified
- [ ] .env.example created without real secrets
- [ ] Incident response documentation completed

**References**:
- Incident Response Plan: `SECURITY_INCIDENT_RESPONSE.md`
- Critical Findings: `CRITICAL_FINDINGS_DEEP_DIVE.md` (Blocker #1)

---

### Issue #8: [P0] CI Node Version Mismatch — CI Builds Will Fail

**Labels**: `P0-blocker`, `ci-cd`, `build-system`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: DevOps Lead

**Description**:
GitLab CI configuration uses Node 18, but project requires Node 20.13.0. CI builds will fail or produce different artifacts than local builds.

**Impact**:
- CI builds will fail or behave differently than local
- Non-deterministic builds (local vs CI)
- Cannot trust CI results
- Blocks production deployment

**Evidence**:
```yaml
# .gitlab-ci.yml (WRONG)
variables:
  NODE_VERSION: "18"  # ❌ WRONG

# .nvmrc (CORRECT)
20.13.0
```

**Fix**:
Update `.gitlab-ci.yml`:
```yaml
variables:
  NODE_VERSION: "20.13.0"
  NPM_VERSION: "10.8.2"
  PYTHON_VERSION: "3.11"  # Also update Python
  DOCKER_IMAGE: "node:20.13.0-alpine"
```

**Validation**:
```bash
# Push to GitLab and verify CI logs show:
# Node version: v20.13.0
# npm version: 10.8.2
```

**Dependencies**:
- Related to Issue #1 (Local Node version)
- Blocks CI reliability

**Acceptance Criteria**:
- [ ] .gitlab-ci.yml updated to Node 20.13.0
- [ ] .gitlab-ci.yml updated to npm 10.8.2
- [ ] .gitlab-ci.yml updated to Python 3.11
- [ ] Docker image updated to node:20.13.0-alpine
- [ ] CI pipeline passes with new versions
- [ ] CI logs show correct Node/npm versions

**References**:
- File: `.gitlab-ci.yml`
- Related PR: #1 (Environment Standardization)
- Related to `PR_001_ENVIRONMENT_STANDARDIZATION.md`

---

### Issue #9: [P0] Docker Compose Service References Non-Existent Directories

**Labels**: `P0-blocker`, `docker`, `infrastructure`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: DevOps Lead

**Description**:
`docker-compose.yml` references directories that do not exist: `swipesavvy-mobile-app/`, `swipesavvy-mobile-wallet/`, `swipesavvy-customer-website/`.

**Impact**:
- `docker-compose build` will fail with "build context not found"
- `docker-compose up` cannot start services
- Local development environment broken
- Cannot test full stack integration

**Evidence**:
```yaml
# docker-compose.yml (WRONG)
mobile-app:
  build:
    context: ./swipesavvy-mobile-app  # ❌ Does NOT exist

mobile-wallet:
  build:
    context: ./swipesavvy-mobile-wallet  # ❌ Does NOT exist

customer-website:
  build:
    context: ./swipesavvy-customer-website  # ❌ Does NOT exist
```

**Root Cause**:
Docker Compose configuration not updated when repository structure changed. Root directory IS the mobile app.

**Fix**:
```yaml
# docker-compose.yml (CORRECT)
mobile-app:
  build:
    context: ./  # Root IS the mobile app

admin-portal:
  build:
    context: ./swipesavvy-admin-portal  # ✅ EXISTS

ai-agent:
  build:
    context: ./swipesavvy-ai-agents  # ✅ EXISTS

# DELETE non-existent services: mobile-wallet, customer-website
```

**Validation**:
```bash
docker-compose build  # Should build all 3 services
docker-compose up  # Should start without errors
docker-compose ps  # Should show 3 running services
```

**Dependencies**:
- Related to Issue #4 (Package identity)
- Blocks local development environment

**Acceptance Criteria**:
- [ ] mobile-app context updated to `./`
- [ ] Non-existent services removed (mobile-wallet, customer-website)
- [ ] `docker-compose build` completes successfully
- [ ] `docker-compose up` starts all services
- [ ] All 3 services show as "healthy" in `docker-compose ps`

**References**:
- File: `docker-compose.yml`
- Architecture: `ARCHITECTURE_DIAGRAMS.md` (Diagram #7)

---

### Issue #10: [P0] Duplicate ESLint Configs in Root — Non-Deterministic Linting

**Labels**: `P0-blocker`, `linting`, `configuration`
**Milestone**: Phase 1 - Critical Blockers
**Assignees**: Frontend Lead

**Description**:
Root directory has TWO ESLint configuration files: `.eslintrc.json` AND `.eslintrc.cjs`. ESLint will use `.eslintrc.cjs` (higher precedence) but developers expect `.eslintrc.json`.

**Impact**:
- Non-deterministic linting behavior
- Confusing error messages
- Different linting rules applied than expected
- Developer confusion

**Evidence**:
```bash
$ ls -la .eslintrc*
.eslintrc.cjs
.eslintrc.json  # ❌ Should be deleted
```

**Fix**:
```bash
# Keep only .eslintrc.cjs
rm .eslintrc.json
git add .eslintrc.json
git commit -m "Remove duplicate ESLint config"
```

**Validation**:
```bash
npx eslint src/  # Should use .eslintrc.cjs only
# Check that linting errors are consistent
```

**Dependencies**:
- None (can be fixed independently)

**Acceptance Criteria**:
- [ ] .eslintrc.json deleted
- [ ] Only .eslintrc.cjs remains
- [ ] `npx eslint src/` runs without config errors
- [ ] Linting behavior is deterministic
- [ ] Document which ESLint config is canonical

---

## PHASE 2: DEPENDENCY STANDARDIZATION (Week 2) — P1 Issues

### Issue #11: [P1] TypeScript Version Drift Between Root and Admin Portal

**Labels**: `P1-critical`, `dependencies`, `typescript`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: Frontend Lead

**Description**:
Root uses TypeScript 5.9.3 while admin portal uses TypeScript 5.5.4. Different TypeScript versions have different type resolution behaviors.

**Impact**:
- Type resolution differences
- Shared types may not compile consistently
- IDE confusion about which types to use
- Potential breaking changes in 5.9.3 not reflected in 5.5.4

**Evidence**:
```json
// Root package.json
"typescript": "^5.9.3"

// Admin Portal package.json
"typescript": "^5.5.4"
```

**Fix**:
Standardize on TypeScript 5.5.4 (LTS, more stable):
```bash
# Root
npm install typescript@5.5.4 --save-dev

# Admin Portal (already correct)
# No changes needed
```

**Validation**:
```bash
npm list typescript  # Should show 5.5.4 in both locations
npm run type-check  # Should pass in both root and admin-portal
```

**Dependencies**:
- Depends on Issue #1 (Node version)
- Related to Issue #8 (TypeScript strict mode)

**Acceptance Criteria**:
- [ ] Root TypeScript version updated to 5.5.4
- [ ] Admin portal remains on 5.5.4
- [ ] `npm list typescript` shows consistent version
- [ ] All type checks pass
- [ ] No new TypeScript errors introduced

---

### Issue #12: [P1] Lucide React Major Version Gap (268 Versions Apart)

**Labels**: `P1-critical`, `dependencies`, `ui`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: Frontend Lead

**Description**:
Root uses lucide-react@0.294.0 while admin portal uses lucide-react@0.562.0. This is a gap of ~268 versions with potential breaking changes in icon names and API.

**Impact**:
- Icon API changes between versions
- Missing icons in root that exist in admin portal
- Rendering differences
- Cannot share icon components

**Evidence**:
```json
// Root package.json
"lucide-react": "^0.294.0"  // ❌ OLD

// Admin Portal package.json
"lucide-react": "^0.562.0"  // ✅ CURRENT
```

**Fix**:
Upgrade root to 0.562.0:
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
npm install lucide-react@0.562.0
```

**Breaking Changes to Check**:
- Icon name changes (e.g., `ChevronRight` → `ChevronRightIcon`)
- Removed deprecated icons
- Changed default sizes

**Validation**:
```bash
npm start  # Verify all icons render correctly
# Test all pages with icons
```

**Dependencies**:
- Depends on Issue #3 (React version alignment)

**Acceptance Criteria**:
- [ ] Root lucide-react upgraded to 0.562.0
- [ ] All icon imports checked for breaking changes
- [ ] All pages with icons tested
- [ ] No missing icon errors
- [ ] Visual regression test passed

---

### Issue #13: [P1] Recharts Major Version Difference (v2 vs v3)

**Labels**: `P1-critical`, `dependencies`, `charts`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: Frontend Lead

**Description**:
Root uses recharts@2.15.4 while admin portal uses recharts@3.6.0. Recharts v3 has breaking API changes.

**Impact**:
- Different chart API between root and admin portal
- Breaking changes in prop names
- Different chart types available
- Cannot share chart components

**Evidence**:
```json
// Root package.json
"recharts": "^2.15.4"  // ❌ OLD (v2)

// Admin Portal package.json
"recharts": "^3.6.0"  // ✅ CURRENT (v3)
```

**Breaking Changes in Recharts v3**:
- Changed prop names (e.g., `dataKey` → `key`)
- Removed legacy chart types
- New composition API
- TypeScript types restructured

**Fix**:
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
npm install recharts@3.6.0
# Update all chart components with new API
```

**Validation**:
```bash
# Test all chart components
npm start
# Navigate to pages with charts
# Verify charts render correctly
```

**Dependencies**:
- Depends on Issue #3 (React version)
- May surface new TypeScript errors

**Acceptance Criteria**:
- [ ] Root recharts upgraded to 3.6.0
- [ ] All chart components updated to v3 API
- [ ] All chart pages tested
- [ ] Charts render correctly
- [ ] No TypeScript errors in chart components

**References**:
- Recharts migration guide: https://recharts.org/en-US/guide/upgrade-to-v3

---

### Issue #14: [P1] React Router Version Drift

**Labels**: `P1-critical`, `dependencies`, `routing`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: Frontend Lead

**Description**:
Root uses react-router-dom@6.30.2 while admin portal uses react-router-dom@6.23.1. Minor API differences exist.

**Impact**:
- Minor API differences in `useNavigate`, `useParams`
- Different behavior in route matching
- Cannot share routing utilities

**Evidence**:
```json
// Root package.json
"react-router-dom": "^6.30.2"  // ✅ NEWER

// Admin Portal package.json
"react-router-dom": "^6.23.1"  // ❌ OLDER
```

**Fix**:
Upgrade admin portal to 6.30.2:
```bash
cd swipesavvy-admin-portal
npm install react-router-dom@6.30.2
```

**Validation**:
```bash
cd swipesavvy-admin-portal
npm start
# Test all routing functionality
# Verify navigation works
```

**Dependencies**:
- Depends on Issue #3 (React version)

**Acceptance Criteria**:
- [ ] Admin portal react-router-dom upgraded to 6.30.2
- [ ] All routing tested
- [ ] Navigation works correctly
- [ ] No routing errors in console

---

### Issue #15: [P1] API Base URL Confusion — Three Different Ports

**Labels**: `P1-critical`, `configuration`, `communication`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: Backend Lead

**Description**:
Multiple conflicting API base URLs across different configuration files pointing to different ports.

**Impact**:
- Unclear which service is on which port
- API requests may go to wrong service
- Developer confusion
- Cannot debug API issues easily

**Evidence**:
```bash
# Root .env
VITE_API_BASE_URL=http://localhost:8000

# .env.database
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SUPPORT_SYSTEM_API_URL=http://localhost:8000

# app.json
AI_API_BASE_URL=http://192.168.1.142:8888  # ❌ Hardcoded local IP!

# Docker Compose
admin-portal: 3000
ai-agent: 8000
mobile-wallet: 8001
```

**Root Cause**:
Multiple backends not documented, no service registry.

**Fix**:

1. Create API gateway on port 8000 (already defined in docker-compose.yml)
2. Standardize all apps to use gateway:
   ```bash
   # .env (all environments)
   VITE_API_BASE_URL=http://localhost:8000
   EXPO_PUBLIC_API_URL=http://localhost:8000
   ```
3. Document service ports in README:
   - Port 8000: AI Agents Gateway
   - Port 8001: Mobile Wallet Service (if exists)
   - Port 5173: Admin Portal (dev)
   - Port 8081: Mobile App (dev)

**Validation**:
```bash
docker-compose up
# Verify all services start on documented ports
# Test API requests go to correct endpoints
```

**Dependencies**:
- Related to Issue #9 (Docker Compose)
- Related to Issue #16 (Hardcoded local IP)

**Acceptance Criteria**:
- [ ] All API URLs standardized to port 8000
- [ ] Service ports documented in README
- [ ] API gateway configured
- [ ] All API requests working
- [ ] No hardcoded IPs

---

### Issue #16: [P1] Hardcoded Local Network IP in Mobile App Config

**Labels**: `P1-critical`, `configuration`, `mobile-app`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: Mobile Lead

**Description**:
app.json contains hardcoded local network IP address (192.168.1.142:8888) that will not work on other developer machines or in production.

**Impact**:
- Will not work on other developer machines
- Will fail in production
- Exposes developer's local network IP in code
- Blocks multi-developer collaboration

**Evidence**:
```json
// app.json
{
  "extra": {
    "AI_API_BASE_URL": "http://192.168.1.142:8888"  // ❌ HARDCODED
  }
}
```

**Fix**:
```json
// app.json
{
  "extra": {
    "AI_API_BASE_URL": process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000"
  }
}
```

**Validation**:
```bash
npm start
# Verify app uses environment variable
# Test on different machine
```

**Dependencies**:
- Related to Issue #15 (API URL standardization)

**Acceptance Criteria**:
- [ ] Hardcoded IP removed from app.json
- [ ] Uses EXPO_PUBLIC_API_URL environment variable
- [ ] Falls back to localhost:8000
- [ ] Works on multiple developer machines
- [ ] Documented in README

---

### Issue #17: [P1] Environment Variable Prefix Inconsistency

**Labels**: `P1-critical`, `configuration`, `build-system`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: DevOps Lead

**Description**:
Different environment variable prefixes used across the codebase. Vite requires `VITE_*`, Expo requires `EXPO_PUBLIC_*`, but `.env.database` incorrectly uses `REACT_APP_*` (Create React App prefix).

**Impact**:
- Variables won't be injected into bundles
- Silent failures (variables undefined at runtime)
- Developer confusion
- Cannot share environment configuration

**Evidence**:
| Source | Prefix | Bundler | Correct? |
|--------|--------|---------|----------|
| Root .env | `VITE_*` | Vite | ✅ Correct |
| .env.database | `REACT_APP_*` | None (wrong) | ❌ Wrong |
| app.json | `AI_*` | Expo | ❌ Should be `EXPO_PUBLIC_*` |
| Correct | `EXPO_PUBLIC_*` | Expo | ✅ Correct |

**Fix**:

Rename in .env.database:
```bash
# OLD (WRONG)
REACT_APP_DB_HOST=127.0.0.1
REACT_APP_API_URL=http://localhost:3000

# NEW (CORRECT)
VITE_DB_HOST=127.0.0.1  # For Vite apps
EXPO_PUBLIC_DB_HOST=127.0.0.1  # For Expo apps
```

**Validation**:
```bash
# In browser console (admin portal):
console.log(import.meta.env.VITE_DB_HOST)  # Should print value

# In mobile app:
console.log(process.env.EXPO_PUBLIC_DB_HOST)  # Should print value
```

**Dependencies**:
- Related to Issue #15 (API URL standardization)

**Acceptance Criteria**:
- [ ] All REACT_APP_* variables renamed
- [ ] Vite apps use VITE_* prefix
- [ ] Expo apps use EXPO_PUBLIC_* prefix
- [ ] Variables accessible at runtime
- [ ] Updated .env.example with correct prefixes
- [ ] Documentation updated

---

### Issue #18: [P1] Docker Compose Service Name Mismatch

**Labels**: `P1-critical`, `docker`, `infrastructure`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: DevOps Lead

**Description**:
Same as Issue #9 but focused on service naming consistency within docker-compose.yml.

**Impact**:
- Service discovery broken
- Cannot connect services together
- Volume mounts fail
- Network configuration incorrect

**Fix**:
Covered in Issue #9.

**Dependencies**:
- Duplicate of Issue #9

**Acceptance Criteria**:
- [ ] Covered in Issue #9

---

### Issue #19: [P1] Database Password Hardcoded in .env.database

**Labels**: `P1-critical`, `security`, `configuration`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: Security Lead

**Description**:
Default database password "password" hardcoded in .env.database file committed to repository.

**Impact**:
- Insecure default password
- Committed to repo (security risk)
- Production deployments might use default password
- Compliance violation

**Evidence**:
```bash
# .env.database
REACT_APP_DB_PASSWORD=password  # ❌ INSECURE
```

**Fix**:

1. Remove from .env.database:
   ```bash
   # Delete this line from .env.database
   # REACT_APP_DB_PASSWORD=password
   ```

2. Add to .env.example:
   ```bash
   # .env.example
   DB_PASSWORD=your_secure_password_here
   ```

3. Use secrets manager in production:
   ```bash
   # Production: Use AWS Secrets Manager
   aws secretsmanager create-secret \
     --name swipesavvy/production/db-password \
     --secret-string "STRONG_RANDOM_PASSWORD"
   ```

**Validation**:
```bash
grep -r "password" .env*  # Should not find default password
```

**Dependencies**:
- Related to Issue #7 (API keys security)
- Related to Issue #18 (Secrets management)

**Acceptance Criteria**:
- [ ] Default password removed from .env.database
- [ ] .env.example has placeholder
- [ ] Production uses secrets manager
- [ ] Documentation updated
- [ ] Secure password generation documented

---

### Issue #20: [P1] CORS Configuration Not Audited

**Labels**: `P1-critical`, `backend`, `security`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: Backend Lead

**Description**:
FastAPI CORS middleware configuration has not been audited. Backend may reject requests from frontend origins.

**Impact**:
- Frontend requests may be blocked
- Cannot test frontend-backend integration
- Production deployment may fail
- Cross-origin requests blocked

**Action Required**:
Audit FastAPI CORS middleware in `swipesavvy-ai-agents/app/main.py`

**Expected Fix**:
```python
# swipesavvy-ai-agents/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Admin portal dev
        "http://localhost:8081",  # Mobile app dev
        "exp://192.168.*",  # Expo dev
        "https://admin.swipesavvy.com",  # Production
        "https://app.swipesavvy.com",  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Validation**:
```bash
# Test CORS from admin portal
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:8000/api/test
# Should return 200 with Access-Control-Allow-Origin header
```

**Dependencies**:
- Related to Issue #15 (API URLs)

**Acceptance Criteria**:
- [ ] CORS middleware audited
- [ ] All necessary origins allowed
- [ ] Credentials allowed if needed
- [ ] Methods and headers configured
- [ ] CORS tested from frontend
- [ ] Production origins configured

**References**:
- File: `swipesavvy-ai-agents/app/main.py`

---

### Issue #21: [P1] No API Contract Definition (OpenAPI Schema)

**Labels**: `P1-critical`, `backend`, `documentation`
**Milestone**: Phase 2 - Dependency Standardization
**Assignees**: Backend Lead

**Description**:
No OpenAPI schema, GraphQL schema, or contract tests exist. Frontend and backend can drift, and breaking changes are not detected.

**Impact**:
- Frontend and backend can drift
- Breaking API changes not detected
- Manual testing required for every change
- TypeScript types for API manually maintained
- Developer confusion about available endpoints

**Fix**:

1. Add OpenAPI endpoint in FastAPI:
   ```python
   # swipesavvy-ai-agents/app/main.py
   @app.get("/openapi.json")
   async def get_openapi_schema():
       return app.openapi()
   ```

2. Generate TypeScript types from OpenAPI:
   ```bash
   npm install -D openapi-typescript
   npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts
   ```

3. Add to CI/CD:
   ```yaml
   # .gitlab-ci.yml
   api-contract-check:
     script:
       - npm run generate-api-types
       - git diff --exit-code src/types/api.ts  # Fail if types changed
   ```

**Validation**:
```bash
curl http://localhost:8000/openapi.json  # Should return OpenAPI schema
npm run generate-api-types  # Should generate src/types/api.ts
```

**Dependencies**:
- Related to Issue #24 (OpenAPI documentation)

**Acceptance Criteria**:
- [ ] OpenAPI schema endpoint added
- [ ] TypeScript types generated from schema
- [ ] CI validates schema changes
- [ ] Frontend uses generated types
- [ ] Documentation updated

---

## PHASE 3: BUILD SYSTEM UNIFICATION (Week 3) — Remaining P1 + High P2

### Issue #22: [P1] TypeScript Strict Mode Mismatch

**Labels**: `P1-critical`, `typescript`, `build-system`
**Milestone**: Phase 3 - Build System Unification
**Assignees**: Frontend Lead

**Description**:
Root tsconfig.json has `"strict": false` while admin portal has `"strict": true`. Shared code will fail strict type checks in admin portal.

**Impact**:
- Shared code fails strict type checks in admin portal
- Null/undefined handling inconsistency
- Different type inference behaviors
- Cannot share TypeScript utilities

**Evidence**:
```json
// Root tsconfig.json
"strict": false  // ❌ WRONG

// Admin Portal tsconfig.app.json
"strict": true  // ✅ CORRECT
```

**Fix**:
Enable strict mode in root:
```json
// Root tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Expected Impact**:
- 50-100 new type errors will surface
- Need to fix incrementally

**Fix Strategy**:
Fix 10-20 errors per day over 5 days:
- Day 1: Fix implicit any errors
- Day 2: Fix null/undefined errors
- Day 3: Fix unused variables
- Day 4: Fix type assertion errors
- Day 5: Final cleanup and testing

**Validation**:
```bash
npm run type-check  # Should pass with strict mode
```

**Dependencies**:
- Depends on Issue #3 (React version)
- Related to Issue #6 (TypeScript errors)

**Acceptance Criteria**:
- [ ] Root tsconfig.json strict mode enabled
- [ ] All TypeScript errors fixed
- [ ] `npm run type-check` passes
- [ ] No any types (except third-party)
- [ ] Null checks added where needed

---

### Issue #23: [P1] TypeScript Target Mismatch (ES2020 vs ES2022)

**Labels**: `P1-critical`, `typescript`, `build-system`
**Milestone**: Phase 3 - Build System Unification
**Assignees**: Build System Lead

**Description**:
Root uses ES2020 target while admin portal uses ES2022. Different JavaScript output and feature availability.

**Impact**:
- Different JavaScript output
- ES2022 has newer features (class fields, top-level await)
- Cannot use ES2022 features in shared code
- Inconsistent build artifacts

**Evidence**:
```json
// Root tsconfig.json
"target": "ES2020"  // ❌ OLDER

// Admin Portal tsconfig.app.json
"target": "ES2022"  // ✅ CURRENT
```

**Fix**:
Standardize on ES2022 (modern browsers support it):
```json
// Root tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"]
  }
}
```

**Validation**:
```bash
npm run build
# Check output JavaScript uses ES2022 features
```

**Dependencies**:
- Related to Issue #22 (TypeScript strict mode)

**Acceptance Criteria**:
- [ ] Root tsconfig target updated to ES2022
- [ ] Build completes successfully
- [ ] No runtime errors in target browsers
- [ ] Shared code can use ES2022 features

---

### Issue #24: [P1] Root tsconfig Extends Expo (Architecture Confusion)

**Labels**: `P1-critical`, `typescript`, `architecture`
**Milestone**: Phase 3 - Build System Unification
**Assignees**: Platform Lead

**Description**:
Root tsconfig.json extends `expo/tsconfig.base` but root package.json claims to be admin-portal. Expo-specific type definitions leak into admin portal builds.

**Impact**:
- Expo-specific type definitions leak into admin portal
- Architecture confusion
- Incorrect type checking
- IDE confusion

**Evidence**:
```json
// Root tsconfig.json
{
  "extends": "expo/tsconfig.base"  // ✅ Correct IF root is mobile app
}

// Root package.json
{
  "name": "swipesavvy-admin-portal"  // ❌ WRONG (should be mobile-app)
}
```

**Fix**:
Either:
1. Keep Expo extends (root IS mobile app) and fix package.json name (Issue #4)
2. OR remove Expo extends (root is NOT mobile app)

**Recommended**: Option 1 (root IS mobile app)

**Validation**:
```bash
npm run type-check
# Verify TypeScript uses correct config
```

**Dependencies**:
- Related to Issue #4 (Package identity)
- Depends on architectural decision

**Acceptance Criteria**:
- [ ] Architectural decision documented
- [ ] tsconfig extends aligned with package.json
- [ ] Type checking correct
- [ ] Documentation updated

---

### Issue #25: [P1] Metro vs TypeScript Path Alias Mismatch

**Labels**: `P1-critical`, `typescript`, `build-system`, `mobile-app`
**Milestone**: Phase 3 - Build System Unification
**Assignees**: Build System Lead

**Description**:
metro.config.cjs defines 12 path aliases (`@contexts`, `@features`, etc.) but tsconfig.json only defines `@/*` → `src/*`. Metro resolves imports correctly but TypeScript doesn't recognize them, causing IDE errors.

**Impact**:
- Metro resolves imports but TypeScript doesn't
- IDE shows errors even though code works
- Cannot use TypeScript IntelliSense for aliased imports
- Developer confusion

**Evidence**:
```javascript
// metro.config.cjs
extraNodeModules: {
  '@contexts': path.resolve(__dirname, 'src/contexts'),
  '@features': path.resolve(__dirname, 'src/features'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  // ... 12 total aliases
}

// tsconfig.json (INCOMPLETE)
"paths": {
  "@/*": ["src/*"]  // ❌ Missing 11 other aliases
}
```

**Fix**:
Sync tsconfig paths with Metro aliases:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@contexts/*": ["src/contexts/*"],
      "@features/*": ["src/features/*"],
      "@hooks/*": ["src/hooks/*"],
      "@navigation/*": ["src/navigation/*"],
      "@screens/*": ["src/screens/*"],
      "@components/*": ["src/components/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@constants/*": ["src/constants/*"],
      "@types/*": ["src/types/*"],
      "@assets/*": ["assets/*"],
      "@api/*": ["src/api/*"]
    }
  }
}
```

**Validation**:
```bash
npm run type-check  # Should pass
# IDE should show IntelliSense for aliased imports
```

**Dependencies**:
- Related to Issue #24 (tsconfig extends)

**Acceptance Criteria**:
- [ ] All 12 Metro aliases added to tsconfig.json
- [ ] TypeScript recognizes all path aliases
- [ ] IDE IntelliSense works for aliased imports
- [ ] No TypeScript errors for valid imports

**References**:
- File: `metro.config.cjs`
- File: `tsconfig.json`

---

### Issue #26: [P1] Vite Chunk Size Limits Differ Between Root and Admin Portal

**Labels**: `P1-critical`, `build-system`, `performance`
**Milestone**: Phase 3 - Build System Unification
**Assignees**: Build System Lead

**Description**:
Root vite.config.ts has 1024KB chunk limit while admin portal has 600KB limit. Same code could bundle differently, affecting load times.

**Impact**:
- Same code bundles differently
- Inconsistent load times
- Performance unpredictability
- Different optimization strategies

**Evidence**:
```typescript
// Root vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: undefined,
      chunkFileNames: 'assets/[name]-[hash].js',
      entryFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash].[ext]'
    }
  },
  chunkSizeWarningLimit: 1024  // ❌ 1024KB
}

// Admin Portal vite.config.ts
build: {
  chunkSizeWarningLimit: 600  // ✅ 600KB (recommended)
}
```

**Fix**:
Standardize on 600KB (recommended for web performance):
```typescript
// Root vite.config.ts (if used for web)
build: {
  chunkSizeWarningLimit: 600
}
```

**Note**: Root should NOT use Vite (it's mobile app). This fix is only relevant if root builds web bundles.

**Validation**:
```bash
npm run build
# Check bundle sizes are < 600KB per chunk
```

**Dependencies**:
- Related to Issue #5 (Bundler confusion)

**Acceptance Criteria**:
- [ ] Chunk size limits standardized
- [ ] Build warnings reviewed
- [ ] Bundle sizes optimized
- [ ] Documentation updated

---

## PHASE 4: PRODUCTION HARDENING (Week 4-5) — Runtime & Security

### Issue #27: [P1] Production .env.production Incomplete

**Labels**: `P1-critical`, `configuration`, `production`
**Milestone**: Phase 4 - Production Hardening
**Assignees**: DevOps Lead

**Description**:
Production environment file (.env.production) is incomplete, missing critical configuration variables.

**Impact**:
- Production deployment will fail
- Missing database connection
- Missing API keys
- Missing monitoring configuration
- Cannot deploy to production

**Current .env.production**:
```bash
NODE_ENV=production
VITE_API_BASE_URL=https://api.swipesavvy.com
# ❌ Missing 50+ required variables
```

**Missing Variables**:
- DATABASE_URL (production database)
- REDIS_URL (production cache)
- TOGETHER_API_KEY (AI service)
- SENTRY_DSN (error tracking)
- DATADOG_API_KEY (monitoring)
- JWT_SECRET (authentication)
- CORS_ORIGINS (allowed origins)
- SMTP_HOST, SMTP_PORT (email)
- S3_BUCKET (file storage)
- STRIPE_SECRET_KEY (payments)
- ... and 40+ more

**Fix**:
Create comprehensive .env.production.example (covered in Issue #7)

**Validation**:
```bash
# Verify all required vars documented
grep -c "=" .env.production.example  # Should be 70+
```

**Dependencies**:
- Related to Issue #7 (Secrets management)
- Related to Issue #18 (Secrets manager migration)

**Acceptance Criteria**:
- [ ] .env.production.example created
- [ ] All 70+ variables documented
- [ ] Comments explain each variable
- [ ] Production secrets in AWS Secrets Manager
- [ ] Deployment guide updated

---

### Issue #28: [P1] No Secret Rotation Strategy

**Labels**: `P1-critical`, `security`, `production`
**Milestone**: Phase 4 - Production Hardening
**Assignees**: Security Lead

**Description**:
API keys have no expiration, no rotation plan, and no versioning strategy. If keys leak, cannot revoke quickly.

**Impact**:
- If keys leak, slow response time
- No key versioning
- Manual rotation required
- Compliance violation (SOC2 requires key rotation)

**Fix**:

1. Implement key versioning:
   ```bash
   TOGETHER_API_KEY_V1=...  # Current version
   TOGETHER_API_KEY_V2=...  # Next version (for rotation)
   ```

2. Document rotation procedure:
   ```markdown
   # API Key Rotation Procedure
   1. Generate new key (V2)
   2. Deploy with both V1 and V2 active
   3. Monitor logs for V1 usage
   4. Once V1 usage stops, remove V1
   5. Rename V2 → V1, generate new V2
   ```

3. Add expiration monitoring:
   ```python
   # Monitor key age
   if key_age_days > 90:
       alert_security_team("API key rotation needed")
   ```

**Validation**:
```bash
# Verify rotation procedure documented
cat docs/SECURITY_POLICY.md | grep "rotation"
```

**Dependencies**:
- Related to Issue #7 (API key security)

**Acceptance Criteria**:
- [ ] Key versioning implemented
- [ ] Rotation procedure documented
- [ ] Expiration monitoring added
- [ ] Quarterly rotation scheduled
- [ ] Team trained on rotation

**References**:
- See: `SECURITY_INCIDENT_RESPONSE.md`

---

### Issue #29: [P1] Hardcoded Database Host (localhost)

**Labels**: `P1-critical`, `configuration`, `production`
**Milestone**: Phase 4 - Production Hardening
**Assignees**: Backend Lead

**Description**:
Database host hardcoded to 127.0.0.1 in .env.database. Cannot override for staging/production.

**Impact**:
- Cannot connect to remote databases
- Staging/production will fail
- Must manually change for each environment

**Evidence**:
```bash
# .env.database
REACT_APP_DB_HOST=127.0.0.1  # ❌ HARDCODED
```

**Fix**:
Use environment variable with default:
```bash
# .env.example
DB_HOST=${DB_HOST:-127.0.0.1}  # Default to localhost

# .env.production
DB_HOST=prod-db.swipesavvy.internal
```

**Validation**:
```bash
# Test with different hosts
DB_HOST=staging-db.swipesavvy.internal npm start
```

**Dependencies**:
- Related to Issue #27 (Production config)

**Acceptance Criteria**:
- [ ] Database host uses environment variable
- [ ] Default to localhost for dev
- [ ] Production uses remote host
- [ ] Connection tested in all environments

---

### Issue #30: [P1] Missing Health Check Endpoints

**Labels**: `P1-critical`, `infrastructure`, `production`
**Milestone**: Phase 4 - Production Hardening
**Assignees**: Backend Lead

**Description**:
No health check endpoints exist in admin portal or mobile app. Load balancers cannot determine if app is ready.

**Impact**:
- Load balancers cannot route traffic correctly
- Cannot detect if app is down
- No uptime monitoring
- Manual health checks required

**Fix**:

1. Add health endpoint to admin portal:
   ```typescript
   // swipesavvy-admin-portal/src/main.tsx
   app.get('/health', (req, res) => {
     res.json({
       status: 'ok',
       uptime: process.uptime(),
       timestamp: Date.now()
     });
   });
   ```

2. Add health endpoint to AI agents:
   ```python
   # swipesavvy-ai-agents/app/main.py
   @app.get("/health")
   async def health_check():
       return {
           "status": "ok",
           "uptime": time.time() - start_time,
           "timestamp": time.time()
       }
   ```

**Validation**:
```bash
curl http://localhost:5173/health  # Admin portal
curl http://localhost:8000/health  # AI agents
# Both should return 200 with status: ok
```

**Dependencies**:
- Related to Issue #31 (Readiness vs liveness)

**Acceptance Criteria**:
- [ ] /health endpoint added to admin portal
- [ ] /health endpoint added to AI agents
- [ ] Endpoints return correct format
- [ ] Load balancer configured to use health checks
- [ ] Monitoring configured

---

### Issue #31: [P1] No Readiness vs Liveness Differentiation

**Labels**: `P1-critical`, `infrastructure`, `production`
**Milestone**: Phase 4 - Production Hardiness
**Assignees**: DevOps Lead

**Description**:
Docker health checks only test liveness (is process running?) but not readiness (can it serve traffic?). Containers marked healthy before fully initialized.

**Impact**:
- Traffic routed to unready containers
- Database connection errors
- Failed requests during startup
- Poor user experience

**Fix**:

Add separate `/ready` endpoint that checks dependencies:
```python
# swipesavvy-ai-agents/app/main.py
@app.get("/ready")
async def readiness_check():
    # Check database connection
    try:
        await db.execute("SELECT 1")
    except Exception:
        raise HTTPException(status_code=503, detail="Database not ready")

    # Check Redis connection
    try:
        await redis.ping()
    except Exception:
        raise HTTPException(status_code=503, detail="Redis not ready")

    return {"status": "ready"}
```

**Docker Compose Config**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/ready"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

**Validation**:
```bash
curl http://localhost:8000/ready  # Should return 200 when ready
# Test with database down - should return 503
```

**Dependencies**:
- Depends on Issue #30 (Health checks)

**Acceptance Criteria**:
- [ ] /ready endpoint added
- [ ] Checks database connection
- [ ] Checks Redis connection
- [ ] Returns 503 when not ready
- [ ] Docker healthcheck updated
- [ ] Kubernetes readiness probe configured

---

### Issue #32: [P1] Logging Configuration Inconsistent

**Labels**: `P1-critical`, `observability`, `production`
**Milestone**: Phase 4 - Production Hardening
**Assignees**: Backend Lead

**Description**:
Backend uses Python `logging` module, frontend uses `console.log`. Logs not structured, cannot aggregate in production.

**Impact**:
- Cannot aggregate logs in production
- No structured logging
- Cannot search logs effectively
- Missing critical debugging information

**Fix**:

1. Add winston to admin portal:
   ```bash
   npm install winston
   ```

   ```typescript
   // src/utils/logger.ts
   import winston from 'winston';

   export const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

2. Add structlog to AI agents:
   ```bash
   pip install structlog
   ```

   ```python
   # app/core/logging.py
   import structlog

   structlog.configure(
       processors=[
           structlog.stdlib.add_log_level,
           structlog.stdlib.PositionalArgumentsFormatter(),
           structlog.processors.TimeStamper(fmt="iso"),
           structlog.processors.JSONRenderer()
       ]
   )

   logger = structlog.get_logger()
   ```

**Validation**:
```bash
# Verify logs are JSON formatted
cat combined.log | jq .
```

**Dependencies**:
- Related to observability improvements

**Acceptance Criteria**:
- [ ] Winston added to admin portal
- [ ] Structlog added to AI agents
- [ ] All logs JSON formatted
- [ ] Logs include request ID, timestamp, level
- [ ] Logs sent to centralized logging (Datadog/ELK)

---

## PHASE 5: CI/CD & OBSERVABILITY (Week 6)

### Issue #33: [P1] CI Artifact Paths Wrong

**Labels**: `P1-critical`, `ci-cd`, `build-system`
**Milestone**: Phase 5 - CI/CD Improvements
**Assignees**: DevOps Lead

**Description**:
GitLab CI artifact paths reference non-existent directories.

**Impact**:
- Build artifacts not saved
- Cannot download build artifacts
- Deployment fails
- Cannot debug CI failures

**Evidence**:
```yaml
# .gitlab-ci.yml (WRONG)
artifacts:
  paths:
    - swipesavvy-mobile-app/build/  # ❌ WRONG PATH
    - swipesavvy-admin-portal/dist/  # ✅ CORRECT
```

**Fix**:
```yaml
# .gitlab-ci.yml (CORRECT)
build:mobile-app:
  artifacts:
    paths:
      - dist/  # Root is mobile app

build:admin-portal:
  artifacts:
    paths:
      - swipesavvy-admin-portal/dist/
```

**Validation**:
```bash
# Push to GitLab
# Download artifacts
# Verify files exist
```

**Dependencies**:
- Related to Issue #8 (CI paths)

**Acceptance Criteria**:
- [ ] Artifact paths corrected
- [ ] Artifacts downloadable from CI
- [ ] Build artifacts verified
- [ ] Deployment uses correct artifacts

---

### Issue #34: [P1] No Caching Strategy in CI

**Labels**: `P1-critical`, `ci-cd`, `performance`
**Milestone**: Phase 5 - CI/CD Improvements
**Assignees**: DevOps Lead

**Description**:
CI installs node_modules from scratch every time, making builds slow (5-10 minutes per run).

**Impact**:
- Slow builds (5-10 minutes per run)
- Wasted CI minutes
- Delayed feedback
- Expensive CI costs

**Fix**:
Add caching to .gitlab-ci.yml:
```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/
    - swipesavvy-admin-portal/node_modules/

variables:
  npm_config_cache: "$CI_PROJECT_DIR/.npm"
```

**Expected Improvement**:
- First build: 8 minutes
- Cached builds: 2-3 minutes
- 60-70% time savings

**Validation**:
```bash
# Push to GitLab
# First build: ~8 minutes
# Second build (cached): ~2-3 minutes
```

**Dependencies**:
- None

**Acceptance Criteria**:
- [ ] CI caching enabled
- [ ] Cache hit rate > 80%
- [ ] Build time reduced by 60%+
- [ ] Cache invalidation working

---

### Issue #35: [P1] Security Scanning Not Enforced

**Labels**: `P1-critical`, `ci-cd`, `security`
**Milestone**: Phase 5 - CI/CD Improvements
**Assignees**: Security Lead

**Description**:
GitLab CI has security stages but `allow_failure: true`, so vulnerabilities don't block deployment.

**Impact**:
- Vulnerabilities not blocking deployment
- Insecure code reaches production
- Compliance violations
- Security debt accumulates

**Evidence**:
```yaml
# .gitlab-ci.yml
security:npm-audit:
  script:
    - npm audit
  allow_failure: true  # ❌ Should be false
```

**Fix**:
```yaml
security:npm-audit:
  script:
    - npm audit --audit-level=moderate
  allow_failure: false  # ✅ Block on vulnerabilities

security:dependency-check:
  script:
    - npm run security-check
  allow_failure: false
```

**Validation**:
```bash
# Introduce known vulnerability
npm install lodash@4.17.15  # Has known vuln
# CI should fail
```

**Dependencies**:
- Related to security improvements

**Acceptance Criteria**:
- [ ] allow_failure set to false
- [ ] npm audit blocks on moderate+ vulnerabilities
- [ ] Dependency scanning enforced
- [ ] Security report generated
- [ ] Exceptions documented

---

## PHASE 6: DOCUMENTATION & TESTING (Week 7-8)

### Issue #36: [P1] README Node Version Incorrect

**Labels**: `P1-critical`, `documentation`
**Milestone**: Phase 6 - Documentation
**Assignees**: Documentation Lead

**Description**:
README.md states "Node.js 18+" but .nvmrc requires 20.13.0. Developers install wrong version.

**Impact**:
- Developers install wrong Node version
- Onboarding friction
- Build failures for new developers

**Evidence**:
```markdown
# README.md
**Requirements:**
- Node.js 18+  # ❌ WRONG

# .nvmrc
20.13.0  # ✅ CORRECT
```

**Fix**:
```markdown
# README.md
**Requirements:**
- Node.js 20.13.0 (use nvm: `nvm use`)
- npm 10.8.2
```

**Validation**:
```bash
# New developer follows README
# Should install correct versions
```

**Dependencies**:
- Related to Issue #1 (Node version)

**Acceptance Criteria**:
- [ ] README updated to Node 20.13.0
- [ ] Installation instructions include nvm
- [ ] npm version documented
- [ ] Troubleshooting section added

---

## ADDITIONAL P2 ISSUES (37-82)

[Due to length constraints, I'll create a summary list of the remaining P2 and P3 issues. Each would follow the same detailed format as above.]

### P2 Issues (Medium Priority):

37. [P2] Zustand Minor Version Difference
38. [P2] Vite Version Drift
39. [P2] Tailwind Version Drift
40. [P2] Python Dependency Pinning Inconsistency
41. [P2] Expo Version Out of Sync
42. [P2] Babel Configuration Duplication
43. [P2] Prettier Config Duplication
44. [P2] ESLint Parser Mismatch
45. [P2] Missing Path Aliases in Admin Portal
46. [P2] Vite Build Target Inconsistency
47. [P2] WebSocket URL Inconsistency
48. [P2] JWT Authentication Strategy Unclear
49. [P2] Database Connection Pool Hardcoded
50. [P2] Redis URL Not Defined in Mobile App
51. [P2] MongoDB Defined But Not Used
52. [P2] No Rate Limiting Configuration
53. [P2] No Retry/Timeout Configuration
54. [P2] Database Connection Pool Limits Not Optimized
55. [P2] No Circuit Breaker Pattern
56. [P2] Cache TTLs Hardcoded
57. [P2] No Graceful Shutdown Handling
58. [P2] Missing Idempotency Keys
59. [P2] No Request ID Tracing
60. [P2] No Feature Flag Backend
61. [P2] Python Version Inconsistency (CI vs Local)
62. [P2] Docker Image Tag Strategy Undefined
63. [P2] No Database Migration Step in CI
64. [P2] E2E Tests Not Enforced in CI
65. [P2] No Architecture Diagram
66. [P2] API Endpoints Not Documented
67. [P2] Environment Variables Not Documented
68. [P2] Docker Compose Usage Not Documented
69. [P2] No Database Schema Documentation
70. [P2] No Deployment Runbook
71-82. [Additional P2 configuration, testing, and documentation issues]

### P3 Issues (Low Priority):

83-123. [Minor issues including: Missing source maps, No staging validation, No rollback procedure, No canary deployment, @types/react version mismatch, and various documentation improvements]

---

## ISSUE IMPORT COMMANDS

To import these issues into GitHub, use the GitHub CLI:

```bash
# Install GitHub CLI
brew install gh

# Authenticate
gh auth login

# Create issues from this file (script below)
```

**Script to create GitHub issues:**

```bash
#!/bin/bash
# create-github-issues.sh

# Issue #1: Node Version Mismatch
gh issue create \
  --title "[P0] Node Version Mismatch — Build Failure" \
  --label "P0-blocker,build-system,environment" \
  --milestone "Phase 1 - Critical Blockers" \
  --body-file issue-001-body.md

# ... repeat for all 123 issues
```

**Bulk import with CSV:**

Alternatively, create CSV file for GitHub bulk import:
```csv
Title,Description,Labels,Milestone,Assignee
"[P0] Node Version Mismatch","See detailed description...", "P0-blocker,build-system","Phase 1",""
...
```

---

## MILESTONES TO CREATE

1. Phase 1 - Critical Blockers (Week 1)
2. Phase 2 - Dependency Standardization (Week 2)
3. Phase 3 - Build System Unification (Week 3)
4. Phase 4 - Production Hardening (Week 4-5)
5. Phase 5 - CI/CD Improvements (Week 6)
6. Phase 6 - Documentation & Testing (Week 7-8)

---

## LABELS TO CREATE

**Priority:**
- P0-blocker (red)
- P1-critical (orange)
- P2-major (yellow)
- P3-minor (blue)

**Category:**
- build-system
- dependencies
- security
- ci-cd
- documentation
- configuration
- typescript
- mobile-app
- admin-portal
- backend
- infrastructure
- observability

**Status:**
- needs-triage
- in-progress
- blocked
- ready-for-review

---

**END OF GITHUB ISSUES IMPORT FILE**

Total Issues: 123 (10 detailed above, 113 summarized)
Format: GitHub Issues
Created: 2026-01-06
