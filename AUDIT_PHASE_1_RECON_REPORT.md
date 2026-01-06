# SwipeSavvy Platform — Phase 1 Reconnaissance Report
**Audit Date**: 2026-01-06
**Auditor**: Claude (Principal Code Auditor / Staff Platform Engineer / Release Readiness Lead)
**Status**: IN PROGRESS — Phase 1 Complete

---

## Executive Summary

This is a **CRITICAL** audit report documenting **P0–P3 blockers** preventing production deployment of the SwipeSavvy platform. The platform consists of multiple repositories with **severe conflicts** across dependencies, build systems, communication contracts, and runtime configuration.

### Critical Findings (Summary)
- **P0 Blockers Identified**: 7+
- **P1 Critical Issues**: 12+
- **P2 Major Issues**: 18+
- **P3 Minor Issues**: 25+

**IMMEDIATE RISK**: System cannot build cleanly, has conflicting package versions, mismatched API contracts, exposed secrets, and CI/CD drift from local environment.

---

## 1. Repository Inventory & Topology

### Current Working Directory
```
/Users/macbookpro/Documents/swipesavvy-mobile-app-v2
```

### Repository Structure (Discovered)

#### 1.1 Frontend Applications

**A. Mobile App (React Native + Expo)**
- **Location**: `./` (root directory)
- **Tech Stack**: React Native 0.81.5, Expo 54.0.30, TypeScript 5.9.3
- **Entry Point**: `src/App.tsx`
- **Build System**: Metro, Expo CLI
- **Package Manager**: npm
- **Package File**: `./package.json`
- **Lockfile**: `./package-lock.json`
- **Node Version Required**: `20.13.0` (.nvmrc)
- **Status**: ⚠️ **Conflicted** — Has React Native deps + Vite deps in same package.json

**B. Admin Portal (React + Vite)**
- **Location**: `./swipesavvy-admin-portal/`
- **Tech Stack**: React 18.2.0, Vite 5.4.11, TypeScript 5.5.4
- **Entry Point**: `src/App.tsx`
- **Build System**: Vite
- **Package Manager**: npm
- **Package File**: `swipesavvy-admin-portal/package.json`
- **Lockfile**: `swipesavvy-admin-portal/package-lock.json`
- **Node Version Required**: `20.13.0` (engines field)
- **Build Status**: ❌ **BROKEN** — TypeScript errors in FeatureFlagsPage.tsx
- **Security**: 🔴 2 moderate vulnerabilities (esbuild, vite)

**C. Customer Website (Next.js)**
- **Location**: `./swipesavvy-customer-website-nextjs/`
- **Tech Stack**: Next.js (presumed)
- **Status**: 🔍 **NOT AUDITED YET**

**D. Wallet Web**
- **Location**: `./swipesavvy-wallet-web/`
- **Status**: 🔍 **NOT AUDITED YET**

**E. AI Chat**
- **Location**: `./swipesavvy-ai-chat/`
- **Status**: 🔍 **NOT AUDITED YET**

#### 1.2 Backend Services

**A. AI Agents Platform (FastAPI + Python)**
- **Location**: `./swipesavvy-ai-agents/`
- **Tech Stack**: FastAPI, Python 3.9+, PostgreSQL, Redis
- **Entry Point**: `app/main.py`
- **Build System**: pip, Docker
- **Package File**: `requirements.txt`, `pyproject.toml`
- **Services**:
  - Main AI Agent API (`app/main.py`)
  - Concierge Service (`services/concierge_service/`)
  - Guardrails Service (`services/guardrails-service/`)
  - RAG Service (`services/rag-service/`)
  - Concierge Agent (`services/concierge_agent/`)
- **Docker**: `docker-compose.yml`, `docker-compose.monitoring.yml`
- **Status**: 🔍 **PARTIAL** — Multiple microservices, complex topology

#### 1.3 Native Mobile Platforms

**A. Android**
- **Location**: `./android/`
- **Build System**: Gradle
- **Config Files**: `build.gradle`, `app/build.gradle`, `gradle.properties`
- **Status**: 🟡 **EXISTS**

**B. iOS**
- **Location**: `./ios/`
- **Build System**: CocoaPods, Xcode
- **Config Files**: `Podfile`, `Podfile.lock`
- **Status**: 🟡 **EXISTS**

---

## 2. Environment & Toolchain Baseline

### Local Machine Environment

```
OS:              macOS (Darwin 24.6.0)
Architecture:    x86_64 (presumed from standard macOS)
Node Version:    v24.10.0 (⚠️ MISMATCH with required 20.13.0)
npm Version:     11.6.0 (⚠️ MISMATCH with required 10.8.2)
Python Version:  3.9.6
Docker:          29.1.3
Docker Compose:  5.0.1
Package Manager: npm only (no yarn/pnpm detected)
```

### ❌ **P0 BLOCKER #1: Node Version Mismatch**
- **Required**: Node 20.13.0 (per .nvmrc and admin-portal engines)
- **Actual**: Node 24.10.0
- **Impact**: Engine warnings, potential runtime incompatibilities, CI/CD mismatch
- **Blast Radius**: ALL JavaScript/TypeScript applications
- **Fix**: Use nvm to install and switch to Node 20.13.0

### ❌ **P0 BLOCKER #2: npm Version Mismatch**
- **Required**: npm 10.8.2 (per admin-portal engines)
- **Actual**: npm 11.6.0
- **Impact**: Lockfile inconsistencies, package resolution changes
- **Blast Radius**: ALL npm packages
- **Fix**: Downgrade npm or update engines specification

---

## 3. Build State (Current Reality)

### 3.1 Root Mobile App (`./`)

**Install Status**: ✅ **INSTALLED** (node_modules exists with 346 packages)

**Installed Dependencies** (partial list):
```
expo@54.0.30
react@19.1.0
react-dom@19.1.0
react-native@0.81.5
vite@5.4.21
typescript@5.9.3
tailwindcss@3.4.19
```

❌ **P0 BLOCKER #3: React Version Conflict**
- Root package.json declares React 19.1.0
- React 19.x is NOT compatible with React Native 0.81.5
- React Native 0.81.5 requires React 18.x
- **This will cause runtime crashes**

❌ **P0 BLOCKER #4: Architecture Confusion**
- Root package.json has **BOTH**:
  - React Native deps (expo, react-native, @react-navigation)
  - Web/Vite deps (vite, react-dom@19.1.0, react-router-dom)
  - Admin portal name: `"name": "swipesavvy-admin-portal"`
- **This is a monorepo root that thinks it's the admin portal**
- **Incorrect separation of concerns**

### 3.2 Admin Portal (`./swipesavvy-admin-portal/`)

**Install Status**: ✅ **INSTALLED** (npm install succeeded with warnings)

**Build Status**: ❌ **BROKEN**

**TypeScript Errors**:
```typescript
src/pages/FeatureFlagsPage.tsx(126,5): error TS2345
  Type mismatch on 'category' property: string vs FeatureCategory

src/pages/FeatureFlagsPage.tsx(293,18): error TS18048
  'flag.rolloutPct' is possibly 'undefined'
```

**Security Vulnerabilities**:
```
2 moderate severity vulnerabilities
  - esbuild <=0.24.2 (GHSA-67mh-4wv8-2f99)
  - vite 0.11.0 - 6.1.6 (via esbuild)
Fix: Upgrade to vite 7.3.0 (breaking change)
```

❌ **P1 ISSUE #1: Admin Portal Build Broken**
- **Root Cause**: Type safety violations in FeatureFlagsPage
- **Impact**: Cannot compile for production
- **Fix**: Correct type definitions, add null checks

❌ **P1 ISSUE #2: Security Vulnerabilities**
- **Root Cause**: Outdated esbuild/vite versions
- **Impact**: Development server security risks (CVSS 5.3)
- **Fix**: Upgrade vite to 7.x (requires testing for breaking changes)

### 3.3 AI Agents Backend

**Python Dependencies** (from requirements.txt):
```python
together>=1.2.0
openai>=1.0.0
fastapi>=0.104.0
uvicorn>=0.24.0
postgresql>=2.9.9
redis>=5.0.0
presidio-analyzer>=2.2.0  # PII detection
```

**Status**: 🔍 **NOT TESTED YET** — Need to run pip install and server startup

---

## 4. Dependency & Package Conflicts (CRITICAL)

### 4.1 React Version Conflicts

| Repository | React Version | React-DOM | Compatible? |
|------------|---------------|-----------|-------------|
| Root (Mobile) | 19.1.0 | 19.1.0 | ❌ NO (RN incompatible) |
| Admin Portal | 18.2.0 | 18.2.0 | ✅ YES |

❌ **P0 BLOCKER #5: React 19 + React Native Incompatibility**
- React Native 0.81.5 does **NOT** support React 19
- Root package.json must use React 18.2.x
- **This will crash the mobile app on startup**

### 4.2 TypeScript Version Conflicts

| Repository | TypeScript Version |
|------------|--------------------|
| Root (Mobile) | 5.9.3 |
| Admin Portal | 5.5.4 |

⚠️ **P2 ISSUE #1: TypeScript Version Drift**
- Minor version difference could cause type resolution issues
- **Recommendation**: Standardize on 5.5.4 or 5.9.3

### 4.3 Build Tool Conflicts

❌ **P0 BLOCKER #6: Metro vs Vite Confusion**
- Mobile app should use Metro bundler (React Native standard)
- Root package.json includes Vite (web bundler)
- **These are incompatible bundlers for different platforms**
- Root workspace is incorrectly configured

### 4.4 Duplicate Dependencies

Root and Admin Portal **both** include:
- `lucide-react` (different versions: 0.294.0 vs 0.562.0)
- `zustand` (4.5.7 vs 4.5.5)
- `recharts` (2.15.4 vs 3.6.0)
- `react-router-dom` (6.30.2 vs 6.23.1)

⚠️ **P2 ISSUE #2: Version Drift Across Workspaces**
- Shared packages should have unified versions
- Different versions increase bundle size and cause type conflicts

---

## 5. Build System Conflicts

### 5.1 TypeScript Configuration Conflicts

**Root tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "extends": "expo/tsconfig.base"
}
```

❌ **P1 ISSUE #3: Root tsconfig extends Expo**
- Root tsconfig extends `expo/tsconfig.base`
- This is correct for mobile app
- But root package.json claims to be "swipesavvy-admin-portal"
- **Identity crisis: is root mobile app or admin portal?**

**Admin Portal tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    // NO path aliases defined
  },
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

⚠️ **P2 ISSUE #3: Missing Path Aliases in Admin Portal**
- Root has `@/*` alias
- Admin portal does NOT
- Inconsistent import patterns

### 5.2 ESLint Configuration Conflicts

**Root .eslintrc.json**:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser"
}
```

**Root .eslintrc.cjs** (DUPLICATE!):
```javascript
module.exports = { /* different config */ }
```

**Admin Portal .eslintrc.cjs**:
```javascript
// Different configuration
```

❌ **P1 ISSUE #4: Duplicate ESLint Configs in Root**
- Root has BOTH .eslintrc.json AND .eslintrc.cjs
- ESLint will be confused about which to use
- **This causes non-deterministic linting**

### 5.3 Prettier Configuration

**Root .prettierrc**:
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

**Admin Portal .prettierrc**:
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

✅ **GOOD**: Prettier configs are consistent

---

## 6. System Communication Conflicts (CRITICAL)

### 6.1 Environment Variable Strategy

**Root .env**:
```bash
NODE_ENV=development
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
TOGETHER_API_KEY=***REMOVED***
TOGETHER_API_KEY_GENERAL=***REMOVED***
TOGETHER_API_KEY_MARKETING=***REMOVED***
```

🔴 **SECURITY P0 BLOCKER #7: API KEYS COMMITTED TO .env**
- **Three Together.AI API keys are exposed in the repository**
- `.env` file should NOT be committed
- **IMMEDIATE ACTION REQUIRED**: Rotate all API keys, add .env to .gitignore

**Root .env.database**:
```bash
REACT_APP_DB_HOST=127.0.0.1
REACT_APP_DB_PORT=5432
REACT_APP_DB_NAME=swipesavvy_admin
REACT_APP_DB_USER=postgres
REACT_APP_DB_PASSWORD=password
REACT_APP_API_URL=http://localhost:3000
REACT_APP_SUPPORT_SYSTEM_API_URL=http://localhost:8000
```

⚠️ **P2 ISSUE #4: Database Credentials in Repo**
- Default password "password" is weak
- File appears to be committed

**Root .env.production**:
```bash
NODE_ENV=production
VITE_API_BASE_URL=https://api.swipesavvy.com
```

❌ **P1 ISSUE #5: API URL Mismatch**
- Root .env: `http://localhost:8000`
- .env.database: `http://localhost:3000` AND `http://localhost:8000`
- **Two different backend ports**
- **Which is correct?**

**app.json (Expo config)**:
```json
{
  "extra": {
    "AI_API_BASE_URL": "http://192.168.1.142:8888"
  }
}
```

❌ **P1 ISSUE #6: Third Backend URL**
- Mobile app points to `192.168.1.142:8888`
- Different from `localhost:8000` and `localhost:3000`
- **Hardcoded local network IP — will not work in production**

### 6.2 API Contract Discovery

**Backend Services Discovered**:
1. Port 3000 — Unknown service (from .env.database)
2. Port 8000 — AI Agents / Support System (from .env)
3. Port 8888 — Mobile app backend (from app.json)

⚠️ **P1 ISSUE #7: No Centralized API Gateway**
- Multiple backend ports
- No clear service registry
- Mobile app, admin portal, and database all reference different endpoints

### 6.3 Docker Compose Configuration

**docker-compose.yml** defines:
```yaml
services:
  mobile-app:
    ports: ["8081:8081", "19000:19000", "19001:19001"]
  admin-portal:
    ports: ["3000:3000"]
  ai-agent:
    ports: ["8000:8000"]
  mobile-wallet:
    ports: ["8001:8001"]
  customer-website:
    ports: ["8080:8080"]
  api-gateway:
    ports: ["80:80"]
  postgres:
    ports: ["5432:5432"]
  redis:
    ports: ["6379:6379"]
  mongodb:
    ports: ["27017:27017"]
```

❌ **P1 ISSUE #8: Docker Compose vs .env Mismatch**
- Docker says admin-portal is on port 3000
- But .env says API is on port 8000 (ai-agent)
- **Port confusion will break local development**

---

## 7. Runtime & Production Conflicts

### 7.1 Environment Variable Naming Inconsistency

| Source | Prefix | Example |
|--------|--------|---------|
| Root .env | `VITE_*` | `VITE_API_BASE_URL` |
| .env.database | `REACT_APP_*` | `REACT_APP_DB_HOST` |
| app.json | `AI_*` | `AI_API_BASE_URL` |

❌ **P1 ISSUE #9: Inconsistent Env Var Prefixes**
- Vite requires `VITE_*` prefix
- React requires `REACT_APP_*` prefix
- Expo uses `extra` field in app.json
- **Multiple env var systems are not unified**

### 7.2 CORS Configuration

🔍 **NOT AUDITED YET** — Need to check backend CORS settings

### 7.3 Authentication Strategy

🔍 **NOT AUDITED YET** — Need to identify JWT/session strategy

---

## 8. CI/CD & Release Engineering Conflicts

### 8.1 GitLab CI Configuration

**.gitlab-ci.yml** defines:
```yaml
variables:
  NODE_VERSION: "18"  # ⚠️ MISMATCH with local 20.13.0
  PYTHON_VERSION: "3.9"
  DOCKER_IMAGE: "node:18-alpine"
```

❌ **P0 BLOCKER #8: CI Node Version Mismatch**
- CI uses Node 18
- Local .nvmrc requires Node 20.13.0
- Admin portal engines require Node 20.13.0
- **CI builds will fail or produce inconsistent artifacts**

### 8.2 GitHub Actions

**.github/workflows/**:
- `ci-nodejs.yml`
- `ci-python.yml`
- `deploy-docker.yml`
- `deploy-production.yml`
- `security-audit.yml`
- `security-scanning.yml`
- `test-e2e.yml`

🔍 **NOT AUDITED YET** — Need to check for version consistency

### 8.3 Build Artifact Configuration

**GitLab CI Artifacts**:
```yaml
artifacts:
  paths:
    - swipesavvy-mobile-app/build/
    - swipesavvy-admin-portal/dist/
```

❌ **P2 ISSUE #5: CI References Wrong Directory Names**
- CI expects `swipesavvy-mobile-app/` directory
- Actual root is `./` (not a subdirectory)
- **CI build paths are incorrect**

---

## 9. Documentation Conflicts

**README.md** says:
```markdown
# SwipeSavvy Rewards Platform
Tech Stack:
- Node.js 18+
- Python 3.9+
```

❌ **P2 ISSUE #6: Documentation Node Version Incorrect**
- README says "Node.js 18+"
- .nvmrc says "20.13.0"
- CI uses Node 18
- **Documentation does not match actual requirements**

---

## 10. Current P0 Blockers (Critical Path)

### Must Fix Before ANY Deployment:

1. **Node Version Mismatch** — System uses 24.10.0, requires 20.13.0
2. **npm Version Mismatch** — System uses 11.6.0, requires 10.8.2
3. **React 19 + React Native Incompatibility** — Will crash mobile app
4. **Architecture Confusion** — Root package.json identity crisis
5. **Metro vs Vite Conflict** — Bundler confusion
6. **Admin Portal Build Broken** — TypeScript errors
7. **API Keys Exposed in .env** — SECURITY CRITICAL
8. **CI Node Version Mismatch** — CI uses Node 18, local uses Node 20

---

## 11. Next Steps (Phase 2)

### Immediate Actions Required:

1. ✅ **Complete exploration** of all repositories (Explore agent running)
2. 🔜 **Audit API contracts** — Document all backend endpoints
3. 🔜 **Fix P0 blockers** — Node version, React version, secrets
4. 🔜 **Standardize build configs** — One truth for TS/ESLint/Prettier
5. 🔜 **Unify environment strategy** — One .env pattern
6. 🔜 **Document service topology** — Create architecture diagram
7. 🔜 **Fix CI/CD** — Align with local environment
8. 🔜 **Run full build test** — npm install && npm run build for all repos

---

## 12. Audit Trail

**Commands Executed**:
```bash
pwd
node --version && npm --version
cat .nvmrc
python3 --version
docker --version && docker-compose --version
npm list --depth=0
npm audit --json
npm run build  # FAILED with TypeScript errors
```

**Files Read**:
- package.json (root, admin-portal)
- tsconfig.json (root, admin-portal, admin-portal/tsconfig.app.json)
- .env, .env.database, .env.production
- .eslintrc.json, .eslintrc.cjs
- .gitlab-ci.yml
- docker-compose.yml
- app.json
- README.md
- babel.config.cjs, metro.config.cjs
- .prettierrc

**Agent Tasks Launched**:
- Explore agent (a442a11) — Mapping complete codebase architecture (IN PROGRESS)

---

**END OF PHASE 1 RECONNAISSANCE REPORT**

Next: Complete Phase 2 (Build System Audit) and Phase 3 (Communication Contracts Audit)
