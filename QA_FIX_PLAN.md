# QA Audit: Fix Plan & Implementation - swipesavvy-mobile-app-v2

**Audit Date:** 2025-12-29  
**Status:** CRITICAL ISSUE FOUND — Workspace Architecture Incompatibility

---

## Issue Summary

The workspace has **fundamental architecture flaw**: Multiple React major versions required

| Service | React Requirement | Type |
|---------|---|---|
| swipesavvy-mobile-app-v2 | ^19.1.0 | React Native (Expo) |
| swipesavvy-admin-portal | ^18.2.0 | Web (Vite) |
| swipesavvy-customer-website-nextjs | 18.2.0 | Web (Next.js) |
| swipesavvy-wallet-web | ^18.2.0 | Web (Vite) |
| swipesavvy-ai-agents | (no React) | Python FastAPI |

**Root Cause:** npm workspaces cannot resolve conflicting peer dependencies across packages

---

## Two Valid Solutions

### **Solution A: Separate node_modules** (Recommended — LOWER RISK)

Keep each service isolated:

```
/swipesavvy-mobile-app-v2/node_modules/  ← React 19.1.0 (mobile)
/swipesavvy-admin-portal/node_modules/   ← React 18.2.0 (web)
/swipesavvy-customer-website-nextjs/node_modules/ ← React 18.2.0 (web)
/swipesavvy-wallet-web/node_modules/     ← React 18.2.0 (web)
/node_modules/                           ← Shared (non-conflicting only)
```

**Advantages:**
- ✅ Each service has correct React version
- ✅ No peer dependency conflicts
- ✅ Cleaner builds
- ✅ Easier to maintain independently

**Disadvantages:**
- ❌ More disk space (~1043 MB vs ~600 MB optimized)
- ❌ Duplicate tooling (eslint, babel, etc.)

**Implementation:** Remove all services from root `workspaces` array

---

### **Solution B: Upgrade Web Services to React 19** (HIGHER RISK)

Upgrade admin, wallet, website to React 19.1.0 everywhere

**Advantages:**
- ✅ Single React version across workspace
- ✅ Minimal disk footprint
- ✅ Unified testing/linting

**Disadvantages:**
- ❌ Next.js may not be fully compatible with React 19 yet
- ❌ Vite apps need testing
- ❌ High risk of breaking web apps

---

## **Recommended: Solution A** (Separate node_modules)

This is a **monorepo-like structure, not a true npm workspace**.

---

## Implementation Steps

### Step 1: Remove Workspace Declaration (Root)

**File:** `/package.json`

```json
{
  "name": "swipesavvy-workspace",
  "version": "1.0.0",
  "description": "SwipeSavvy Multi-Repo Workspace",
  "private": true
  // ❌ REMOVE: "workspaces": [...]
}
```

**Why:** Disabling workspaces prevents npm from trying to resolve all deps globally

---

### Step 2: Clean Install Per Service

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2

# Remove root node_modules (will cause bloat anyway)
rm -rf node_modules package-lock.json

# Each service installs independently
cd swipesavvy-mobile-app-v2 && npm install
cd ../swipesavvy-admin-portal && npm install
cd ../swipesavvy-customer-website-nextjs && npm install
cd ../swipesavvy-wallet-web && npm install
```

**Result:**
- Root: Minimal/no node_modules
- Each service: Own complete installation
- No conflicts

---

### Step 3: Add .gitignore for node_modules

```bash
# Workspace root .gitignore
echo "node_modules/" >> .gitignore
echo "*/node_modules/" >> .gitignore
```

---

### Step 4: Update CI/CD Scripts

Add to root `package.json` scripts:

```json
{
  "scripts": {
    "install:all": "npm --prefix swipesavvy-mobile-app-v2 install && npm --prefix swipesavvy-admin-portal install && npm --prefix swipesavvy-customer-website-nextjs install && npm --prefix swipesavvy-wallet-web install",
    "start:mobile": "npm --prefix swipesavvy-mobile-app-v2 start",
    "start:admin": "npm --prefix swipesavvy-admin-portal run dev",
    "start:website": "npm --prefix swipesavvy-customer-website-nextjs run dev",
    "start:wallet": "npm --prefix swipesavvy-wallet-web run dev"
  }
}
```

---

### Step 5: Document Service Independence

Create `/WORKSPACE_STRUCTURE.md`:

```markdown
# Workspace Structure

Each service is independent with its own Node dependencies.

## Services

1. **swipesavvy-mobile-app-v2** (React Native 0.81.5 + Expo)
   - React: ^19.1.0
   - Start: npm --prefix swipesavvy-mobile-app-v2 start

2. **swipesavvy-admin-portal** (React 18.2.0 + Vite)
   - React: ^18.2.0
   - Start: npm --prefix swipesavvy-admin-portal run dev

3. **swipesavvy-customer-website-nextjs** (React 18.2.0 + Next.js)
   - React: 18.2.0
   - Start: npm --prefix swipesavvy-customer-website-nextjs run dev

4. **swipesavvy-wallet-web** (React 18.2.0 + Vite)
   - React: ^18.2.0
   - Start: npm --prefix swipesavvy-wallet-web run dev

5. **swipesavvy-ai-agents** (Python FastAPI, no React)
   - Runtime: Python 3.11+
   - Start: python -m uvicorn app.main:app --port 8000

## Installation

```bash
npm run install:all
```

## Important Notes

- Each service manages its own node_modules
- React versions differ: mobile uses 19.x, web uses 18.x
- No shared npm workspace (prevents conflicts)
- Services are independent for CI/CD
```

---

## Detailed Fix Implementation

### Phase 1: Disable npm Workspaces

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2

# Step 1: Edit root package.json
# Remove "workspaces" array
```

**Current:**
```json
{
  "workspaces": [
    "swipesavvy-mobile-app-v2",
    "swipesavvy-ai-agents",
    "swipesavvy-admin-portal",
    "swipesavvy-wallet-web",
    "swipesavvy-customer-website"
  ]
}
```

**Target:**
```json
{
  // Remove workspaces entirely
}
```

---

### Phase 2: Clean Installation

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2

# Remove workspace-linked dependencies
rm -rf node_modules package-lock.json

# Install per service
cd swipesavvy-mobile-app-v2 && npm install
cd ../swipesavvy-admin-portal && npm install
cd ../swipesavvy-customer-website-nextjs && npm install
cd ../swipesavvy-wallet-web && npm install

# Verify no root-level node_modules
cd ../.. && ls -la | grep node_modules
```

---

### Phase 3: Update Root package.json

Add convenience scripts:

```json
{
  "scripts": {
    "install:all": "npm run install:mobile && npm run install:admin && npm run install:website && npm run install:wallet",
    "install:mobile": "npm --prefix ./swipesavvy-mobile-app-v2 install",
    "install:admin": "npm --prefix ./swipesavvy-admin-portal install",
    "install:website": "npm --prefix ./swipesavvy-customer-website-nextjs install",
    "install:wallet": "npm --prefix ./swipesavvy-wallet-web install",
    "start:mobile": "npm --prefix ./swipesavvy-mobile-app-v2 start",
    "start:admin": "npm --prefix ./swipesavvy-admin-portal run dev",
    "start:website": "npm --prefix ./swipesavvy-customer-website-nextjs run dev",
    "start:wallet": "npm --prefix ./swipesavvy-wallet-web run dev",
    "lint:all": "npm run lint --prefix ./swipesavvy-mobile-app-v2 && npm run lint --prefix ./swipesavvy-admin-portal",
    "test:all": "npm run test --prefix ./swipesavvy-mobile-app-v2 && npm run test --prefix ./swipesavvy-admin-portal"
  }
}
```

---

## Rollback Plan

If issues arise:

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2

# Restore backed-up root package.json
cp package.json.backup package.json

# Reinstall with workspaces
rm -rf node_modules
npm install
```

---

## Success Criteria

✅ Each service has correct React version:
```bash
npm --prefix swipesavvy-mobile-app-v2 ls react
npm --prefix swipesavvy-admin-portal ls react
```

✅ No npm warnings about invalid peer deps:
```bash
npm audit --prefix swipesavvy-mobile-app-v2
npm audit --prefix swipesavvy-admin-portal
```

✅ Services start cleanly:
```bash
npm run start:mobile  # Expo Metro starts
npm run start:admin   # Vite starts on 5173
```

✅ Total disk usage reasonable:
```bash
du -sh swipesavvy-*/node_modules
# ~450+ MB total (acceptable given independence)
```

---

## Summary

| Aspect | Solution A (Recommended) | Solution B (Risky) |
|--------|----------|----------|
| Compatibility | ✅ 100% | ⚠️ Needs testing |
| Disk Usage | 🟡 Higher (~1GB) | ✅ Lower (~600MB) |
| Maintenance | ✅ Easy | ❌ Complex |
| Risk | ✅ Low | 🔴 High |
| Timeframe | ✅ 1 hour | ⚠️ 8+ hours |

---

## Next Steps

→ **Implement Solution A:** Disable workspaces, verify each service installs correctly
→ **Then:** Run Validation (Step 6)

