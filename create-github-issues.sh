#!/bin/bash
# create-github-issues.sh
# Automated GitHub Issues Creation Script for SwipeSavvy Platform Audit
# Generated: 2026-01-06
# Total Issues: 123

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SwipeSavvy GitHub Issues Creation${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}ERROR: GitHub CLI (gh) is not installed${NC}"
    echo "Install it with: brew install gh"
    echo "Or visit: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Not authenticated with GitHub. Running authentication...${NC}"
    gh auth login
fi

echo -e "${GREEN}✓ GitHub CLI authenticated${NC}"
echo ""

# Function to create issue
create_issue() {
    local title="$1"
    local label="$2"
    local milestone="$3"
    local body="$4"

    echo -e "${YELLOW}Creating: ${title}${NC}"

    gh issue create \
        --title "$title" \
        --label "$label" \
        --milestone "$milestone" \
        --body "$body" \
        2>&1 || echo -e "${RED}Failed to create issue: ${title}${NC}"
}

# Create milestones first
echo -e "${GREEN}Creating milestones...${NC}"
gh api repos/:owner/:repo/milestones -f title="Phase 1 - Critical Blockers" -f description="Week 1: P0 blockers that prevent ANY deployment" -f state="open" 2>/dev/null || echo "Milestone may already exist"
gh api repos/:owner/:repo/milestones -f title="Phase 2 - Dependency Standardization" -f description="Week 2: Align all dependency versions" -f state="open" 2>/dev/null || echo "Milestone may already exist"
gh api repos/:owner/:repo/milestones -f title="Phase 3 - Build System Unification" -f description="Week 3: Unify build configurations" -f state="open" 2>/dev/null || echo "Milestone may already exist"
gh api repos/:owner/:repo/milestones -f title="Phase 4 - Production Hardening" -f description="Week 4-5: Production readiness" -f state="open" 2>/dev/null || echo "Milestone may already exist"
gh api repos/:owner/:repo/milestones -f title="Phase 5 - CI/CD Improvements" -f description="Week 6: CI/CD optimization" -f state="open" 2>/dev/null || echo "Milestone may already exist"
gh api repos/:owner/:repo/milestones -f title="Phase 6 - Documentation & Testing" -f description="Week 7-8: Docs and tests" -f state="open" 2>/dev/null || echo "Milestone may already exist"

echo -e "${GREEN}✓ Milestones created${NC}"
echo ""

# Create labels
echo -e "${GREEN}Creating labels...${NC}"
gh label create "P0-blocker" --color "d73a4a" --description "P0 blocker - prevents deployment" --force 2>/dev/null || true
gh label create "P1-critical" --color "ff9800" --description "P1 critical - high priority" --force 2>/dev/null || true
gh label create "P2-major" --color "fbca04" --description "P2 major - medium priority" --force 2>/dev/null || true
gh label create "P3-minor" --color "0075ca" --description "P3 minor - low priority" --force 2>/dev/null || true
gh label create "build-system" --color "5319e7" --force 2>/dev/null || true
gh label create "dependencies" --color "0e8a16" --force 2>/dev/null || true
gh label create "security" --color "b60205" --force 2>/dev/null || true
gh label create "ci-cd" --color "1d76db" --force 2>/dev/null || true
gh label create "documentation" --color "0075ca" --force 2>/dev/null || true
gh label create "configuration" --color "d4c5f9" --force 2>/dev/null || true
gh label create "typescript" --color "007acc" --force 2>/dev/null || true
gh label create "mobile-app" --color "c2e0c6" --force 2>/dev/null || true
gh label create "admin-portal" --color "fef2c0" --force 2>/dev/null || true
gh label create "backend" --color "bfd4f2" --force 2>/dev/null || true
gh label create "infrastructure" --color "c5def5" --force 2>/dev/null || true
gh label create "observability" --color "f9d0c4" --force 2>/dev/null || true

echo -e "${GREEN}✓ Labels created${NC}"
echo ""

echo -e "${GREEN}Creating Phase 1 issues (P0 blockers)...${NC}"
echo ""

# Issue #1: Node Version Mismatch
create_issue \
    "[P0] Node Version Mismatch — Build Failure" \
    "P0-blocker,build-system,environment" \
    "Phase 1 - Critical Blockers" \
    "## Description
Local development environment uses Node v24.10.0 but the project requires Node v20.13.0 per \`.nvmrc\`. This mismatch causes engine warnings on every \`npm install\` and potential runtime incompatibilities.

## Impact
- Engine warnings on every npm install
- Potential runtime incompatibilities between Node 24 and Node 20
- CI/CD will fail if using different version
- Developer onboarding friction

## Evidence
\`\`\`bash
$ node --version
v24.10.0  # ❌ WRONG

# .nvmrc
20.13.0   # ✅ CORRECT
\`\`\`

## Fix
\`\`\`bash
nvm install 20.13.0
nvm use 20.13.0
nvm alias default 20.13.0
\`\`\`

## Validation
\`\`\`bash
node --version  # Should output v20.13.0
npm install  # Should complete without engine warnings
\`\`\`

## Dependencies
- Blocks PR #2 (React Version Downgrade)
- Blocks PR #3 (Package Identity Fix)

## Acceptance Criteria
- [ ] Node 20.13.0 installed locally via nvm
- [ ] \`node --version\` outputs v20.13.0
- [ ] \`npm install\` completes without engine warnings
- [ ] Updated developer onboarding docs"

# Issue #2: npm Version Mismatch
create_issue \
    "[P0] npm Version Mismatch — Lockfile Corruption Risk" \
    "P0-blocker,build-system,environment" \
    "Phase 1 - Critical Blockers" \
    "## Description
Local npm version is 11.6.0 but project requires npm 10.8.2. Different npm versions use different lockfile formats and dependency resolution algorithms.

## Impact
- package-lock.json format differences (lockfileVersion 3 vs 2)
- Dependency resolution algorithm changes
- CI/CD lockfile drift
- Non-deterministic builds

## Evidence
\`\`\`bash
$ npm --version
11.6.0  # ❌ WRONG

# admin-portal/package.json engines
\"npm\": \"10.8.2\"  # ✅ REQUIRED
\`\`\`

## Fix
\`\`\`bash
npm install -g npm@10.8.2
\`\`\`

## Validation
\`\`\`bash
npm --version  # Should output 10.8.2
\`\`\`

## Dependencies
- Must be fixed alongside Issue #1
- Blocks all dependency updates

## Acceptance Criteria
- [ ] npm 10.8.2 installed globally
- [ ] \`npm --version\` outputs 10.8.2
- [ ] package-lock.json regenerated with correct version
- [ ] CI uses npm 10.8.2"

# Issue #3: React 19 Incompatibility
create_issue \
    "[P0] React 19 Incompatible with React Native — App Crashes" \
    "P0-blocker,dependencies,react,mobile-app" \
    "Phase 1 - Critical Blockers" \
    "## Description
Root package.json has React 19.1.0 but React Native 0.81.5 only supports React 18.x. This incompatibility will cause the mobile app to crash on startup.

## Impact
- **Mobile app will crash on startup**
- \"Cannot read property X of undefined\" errors
- ALL React Native functionality broken
- Cannot test or deploy mobile app

## Evidence
\`\`\`json
// Root package.json
\"react\": \"^19.1.0\",  // ❌ INCOMPATIBLE
\"react-native\": \"^0.81.5\"  // Requires React 18.x

// Admin Portal package.json
\"react\": \"^18.2.0\"  // ✅ CORRECT
\`\`\`

## Root Cause
Manual dependency updates without checking React Native compatibility matrix.

## Fix
\`\`\`bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
npm install react@18.2.0 react-dom@18.2.0
npm install @types/react@18.2.66 @types/react-dom@18.2.22
\`\`\`

## Validation
\`\`\`bash
npm start  # Expo should load without errors
# Test mobile app on iOS/Android simulator
\`\`\`

## Dependencies
- Depends on Issue #1 (Node version fix)
- Blocks Issue #4 (TypeScript errors fix)

## Acceptance Criteria
- [ ] React downgraded to 18.2.0 in root package.json
- [ ] \`npm start\` completes without errors
- [ ] Mobile app loads on iOS simulator
- [ ] Mobile app loads on Android simulator
- [ ] No React version warnings in console

## References
- React Native compatibility: https://reactnative.dev/docs/environment-setup
- Related PR: #2 (React Version Downgrade)"

# Issue #4: Package Identity Crisis
create_issue \
    "[P0] Package Identity Crisis — Root Claims to Be Admin Portal" \
    "P0-blocker,configuration,architecture" \
    "Phase 1 - Critical Blockers" \
    "## Description
Root package.json has \`\"name\": \"swipesavvy-admin-portal\"\` but it actually contains the mobile app code (Expo, React Native).

## Impact
- npm publish will overwrite wrong package
- Confusion in CI/CD pipelines
- Developer confusion about repository structure
- Incorrect package references in tooling

## Evidence
\`\`\`json
// Root package.json (WRONG)
{
  \"name\": \"swipesavvy-admin-portal\",  // ❌ INCORRECT
  \"dependencies\": {
    \"expo\": \"^54.0.30\",  // This proves it's mobile app!
    \"react-native\": \"^0.81.5\"
  }
}
\`\`\`

## Fix
\`\`\`json
// Root package.json (CORRECT)
{
  \"name\": \"swipesavvy-mobile-app\",
  \"description\": \"SwipeSavvy mobile app built with React Native and Expo\"
}
\`\`\`

## Validation
\`\`\`bash
npm run build  # Should complete without errors
# Verify CI/CD references are updated
\`\`\`

## Dependencies
- Related to Issue #5 (Bundler confusion)
- Blocks proper monorepo setup

## Acceptance Criteria
- [ ] Root package.json name changed to \"swipesavvy-mobile-app\"
- [ ] All CI/CD references updated
- [ ] README updated with correct package name
- [ ] No other references to old name found"

# Issue #5: Bundler Confusion
create_issue \
    "[P0] Metro vs Vite Bundler Conflict — Cannot Build" \
    "P0-blocker,build-system,bundler" \
    "Phase 1 - Critical Blockers" \
    "## Description
Root package.json includes BOTH Vite (web bundler) AND Metro (React Native bundler), causing build confusion.

## Impact
- Build scripts cannot determine which bundler to use
- Incorrect bundler configuration applied
- Wasted dependencies (Vite not needed in mobile app)
- Developer confusion

## Evidence
\`\`\`json
// Root package.json
\"vite\": \"^5.4.21\",         // ❌ Web bundler (wrong)
\"expo\": \"^54.0.30\"         // ✅ Uses Metro bundler (correct)
\`\`\`

## Fix
Remove Vite from root package.json, keep only in admin-portal:
\`\`\`bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
npm uninstall vite @vitejs/plugin-react
# Verify admin-portal still has Vite
\`\`\`

## Validation
\`\`\`bash
npm run build  # Should use Metro bundler only
npm list vite  # Should show \"not found\" in root
cd swipesavvy-admin-portal && npm list vite  # Should show vite@5.4.21
\`\`\`

## Dependencies
- Related to Issue #4 (Package identity)
- Blocks build system unification

## Acceptance Criteria
- [ ] Vite removed from root package.json
- [ ] Vite still present in admin-portal package.json
- [ ] \`npm run build\` uses Metro only
- [ ] No Vite configuration in root directory"

# Issue #6: TypeScript Build Broken
create_issue \
    "[P0] Admin Portal TypeScript Build Broken — Type Errors" \
    "P0-blocker,typescript,admin-portal" \
    "Phase 1 - Critical Blockers" \
    "## Description
Admin portal build fails with TypeScript errors in FeatureFlagsPage.tsx. Cannot build production bundle.

## Impact
- **Cannot build production bundle** for admin portal
- Blocks production deployment
- Type safety compromised
- Feature flags page non-functional

## Errors
\`\`\`typescript
// swipesavvy-admin-portal/src/pages/FeatureFlagsPage.tsx

// Line 126: Type mismatch
error TS2345: Argument of type '{ id: string; category: string; ... }[]'
is not assignable to parameter of type 'FeatureFlag[] | (() => FeatureFlag[])'.
  Types of property 'category' are incompatible.
    Type 'string' is not assignable to type 'FeatureCategory | undefined'.

// Line 293: Undefined property
error TS18048: 'flag.rolloutPct' is possibly 'undefined'.
\`\`\`

## Root Cause
1. Mock data has \`category: string\` instead of \`FeatureCategory\` enum
2. Missing null check on \`rolloutPct\` property

## Fix
\`\`\`typescript
// Line 126: Cast category or use enum
const mockFlags: FeatureFlag[] = MOCK_FLAGS.map(flag => ({
  ...flag,
  category: flag.category as FeatureCategory  // Type assertion
}));

// Line 293: Add null check
const percentage = flag.rolloutPct ?? 0;  // Default to 0 if undefined
\`\`\`

## Validation
\`\`\`bash
cd swipesavvy-admin-portal
npm run build  # Should complete without errors
npm run type-check  # Should pass
\`\`\`

## Dependencies
- Depends on Issue #3 (React version fix)
- Related to Issue #8 (TypeScript strict mode)

## Acceptance Criteria
- [ ] FeatureFlagsPage.tsx line 126 type error fixed
- [ ] FeatureFlagsPage.tsx line 293 null check added
- [ ] \`npm run build\` completes without errors
- [ ] Feature flags page renders correctly
- [ ] Add snapshot test for FeatureFlagsPage

## References
- File: [swipesavvy-admin-portal/src/pages/FeatureFlagsPage.tsx:126](swipesavvy-admin-portal/src/pages/FeatureFlagsPage.tsx#L126)
- File: [swipesavvy-admin-portal/src/pages/FeatureFlagsPage.tsx:293](swipesavvy-admin-portal/src/pages/FeatureFlagsPage.tsx#L293)"

# Issue #7: SECURITY - API Keys Exposed
create_issue \
    "[P0] SECURITY: API Keys Exposed in Git Repository" \
    "P0-blocker,security,critical-security" \
    "Phase 1 - Critical Blockers" \
    "## 🚨 CRITICAL SECURITY BREACH

Three Together.AI API keys committed to \`.env\` file in git repository.

## Impact
- **CRITICAL SECURITY BREACH** — Anyone with repo access can use API keys
- Potential \$10,000-\$50,000 fraudulent AI API usage
- Compliance violation (PCI-DSS, SOC2)
- Service disruption if keys are revoked
- Reputational damage

## Exposed Keys
\`\`\`bash
TOGETHER_API_KEY=***REMOVED***
TOGETHER_API_KEY_GENERAL=***REMOVED***
TOGETHER_API_KEY_MARKETING=***REMOVED***
\`\`\`

## Immediate Actions Required

### 1. ROTATE ALL KEYS IMMEDIATELY (within 1 hour)
- Login to Together.AI dashboard: https://api.together.xyz/settings/api-keys
- Create new keys with same permissions
- Delete old exposed keys
- Store new keys in AWS Secrets Manager / 1Password

### 2. Add .env to .gitignore
\`\`\`bash
echo \".env*\" >> .gitignore
echo \"!.env.example\" >> .gitignore
git add .gitignore
\`\`\`

### 3. Remove from git history
\`\`\`bash
# Option 1: BFG Repo-Cleaner (recommended)
brew install bfg
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all

# Option 2: git filter-branch
git filter-branch --force --index-filter \\
  \"git rm --cached --ignore-unmatch .env .env.local .env.database\" \\
  --prune-empty --tag-name-filter cat -- --all
\`\`\`

### 4. Audit API usage
- Check Together.AI dashboard for anomalies
- Review billing for unauthorized charges
- Document any suspicious activity

### 5. Notify stakeholders
- Engineering team
- Security team
- Compliance team
- Finance team (potential charges)

## Validation
\`\`\`bash
git log --all -- .env  # Should return empty
grep -r \"tgp_v1_\" .  # Should not find any keys
\`\`\`

## Dependencies
- **MUST BE FIXED FIRST** before any PR can be merged
- Blocks all other security work

## Acceptance Criteria
- [ ] All 3 Together.AI API keys rotated on dashboard
- [ ] Old keys deleted from Together.AI dashboard
- [ ] New keys stored in AWS Secrets Manager / 1Password
- [ ] .env added to .gitignore
- [ ] .env removed from git history (verified with \`git log --all -- .env\`)
- [ ] API usage audited for anomalies
- [ ] Stakeholders notified
- [ ] .env.example created without real secrets
- [ ] Incident response documentation completed

## References
- Incident Response Plan: [SECURITY_INCIDENT_RESPONSE.md](SECURITY_INCIDENT_RESPONSE.md)
- Critical Findings: [CRITICAL_FINDINGS_DEEP_DIVE.md](CRITICAL_FINDINGS_DEEP_DIVE.md) (Blocker #1)"

# Issue #8: CI Node Version Mismatch
create_issue \
    "[P0] CI Node Version Mismatch — CI Builds Will Fail" \
    "P0-blocker,ci-cd,build-system" \
    "Phase 1 - Critical Blockers" \
    "## Description
GitLab CI configuration uses Node 18, but project requires Node 20.13.0. CI builds will fail or produce different artifacts than local builds.

## Impact
- CI builds will fail or behave differently than local
- Non-deterministic builds (local vs CI)
- Cannot trust CI results
- Blocks production deployment

## Evidence
\`\`\`yaml
# .gitlab-ci.yml (WRONG)
variables:
  NODE_VERSION: \"18\"  # ❌ WRONG

# .nvmrc (CORRECT)
20.13.0
\`\`\`

## Fix
Update \`.gitlab-ci.yml\`:
\`\`\`yaml
variables:
  NODE_VERSION: \"20.13.0\"
  NPM_VERSION: \"10.8.2\"
  PYTHON_VERSION: \"3.11\"  # Also update Python
  DOCKER_IMAGE: \"node:20.13.0-alpine\"
\`\`\`

## Validation
\`\`\`bash
# Push to GitLab and verify CI logs show:
# Node version: v20.13.0
# npm version: 10.8.2
\`\`\`

## Dependencies
- Related to Issue #1 (Local Node version)
- Blocks CI reliability

## Acceptance Criteria
- [ ] .gitlab-ci.yml updated to Node 20.13.0
- [ ] .gitlab-ci.yml updated to npm 10.8.2
- [ ] .gitlab-ci.yml updated to Python 3.11
- [ ] Docker image updated to node:20.13.0-alpine
- [ ] CI pipeline passes with new versions
- [ ] CI logs show correct Node/npm versions

## References
- File: [.gitlab-ci.yml](.gitlab-ci.yml)
- Related PR: #1 (Environment Standardization)
- Related to [PR_001_ENVIRONMENT_STANDARDIZATION.md](PR_001_ENVIRONMENT_STANDARDIZATION.md)"

# Issue #9: Docker Compose Paths Wrong
create_issue \
    "[P0] Docker Compose Service References Non-Existent Directories" \
    "P0-blocker,docker,infrastructure" \
    "Phase 1 - Critical Blockers" \
    "## Description
\`docker-compose.yml\` references directories that do not exist: \`swipesavvy-mobile-app/\`, \`swipesavvy-mobile-wallet/\`, \`swipesavvy-customer-website/\`.

## Impact
- \`docker-compose build\` will fail with \"build context not found\"
- \`docker-compose up\` cannot start services
- Local development environment broken
- Cannot test full stack integration

## Evidence
\`\`\`yaml
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
\`\`\`

## Root Cause
Docker Compose configuration not updated when repository structure changed. Root directory IS the mobile app.

## Fix
\`\`\`yaml
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
\`\`\`

## Validation
\`\`\`bash
docker-compose build  # Should build all 3 services
docker-compose up  # Should start without errors
docker-compose ps  # Should show 3 running services
\`\`\`

## Dependencies
- Related to Issue #4 (Package identity)
- Blocks local development environment

## Acceptance Criteria
- [ ] mobile-app context updated to \`./\`
- [ ] Non-existent services removed (mobile-wallet, customer-website)
- [ ] \`docker-compose build\` completes successfully
- [ ] \`docker-compose up\` starts all services
- [ ] All 3 services show as \"healthy\" in \`docker-compose ps\`

## References
- File: [docker-compose.yml](docker-compose.yml)
- Architecture: [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) (Diagram #7)"

# Issue #10: Duplicate ESLint Configs
create_issue \
    "[P0] Duplicate ESLint Configs in Root — Non-Deterministic Linting" \
    "P0-blocker,linting,configuration" \
    "Phase 1 - Critical Blockers" \
    "## Description
Root directory has TWO ESLint configuration files: \`.eslintrc.json\` AND \`.eslintrc.cjs\`. ESLint will use \`.eslintrc.cjs\` (higher precedence) but developers expect \`.eslintrc.json\`.

## Impact
- Non-deterministic linting behavior
- Confusing error messages
- Different linting rules applied than expected
- Developer confusion

## Evidence
\`\`\`bash
$ ls -la .eslintrc*
.eslintrc.cjs
.eslintrc.json  # ❌ Should be deleted
\`\`\`

## Fix
\`\`\`bash
# Keep only .eslintrc.cjs
rm .eslintrc.json
git add .eslintrc.json
git commit -m \"Remove duplicate ESLint config\"
\`\`\`

## Validation
\`\`\`bash
npx eslint src/  # Should use .eslintrc.cjs only
# Check that linting errors are consistent
\`\`\`

## Dependencies
- None (can be fixed independently)

## Acceptance Criteria
- [ ] .eslintrc.json deleted
- [ ] Only .eslintrc.cjs remains
- [ ] \`npx eslint src/\` runs without config errors
- [ ] Linting behavior is deterministic
- [ ] Document which ESLint config is canonical"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Phase 1 Issues Created: 10 P0 Blockers${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}To create remaining 113 issues (P1, P2, P3):${NC}"
echo "1. Review the issues in GitHub"
echo "2. Run this script again with --all flag (when implemented)"
echo "3. Or manually create remaining issues from GITHUB_ISSUES_IMPORT.md"
echo ""
echo -e "${GREEN}View issues: gh issue list --limit 100${NC}"
echo ""
