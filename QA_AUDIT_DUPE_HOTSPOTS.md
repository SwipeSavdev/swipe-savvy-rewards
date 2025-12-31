# QA Audit: Duplicate Packages & Multiple Copies Risk Report

**Audit Date:** 2025-12-29

---

## 1. Summary: Packages Installed at Multiple Versions

### Top 10 High-Risk Duplicate Packages

| # | Package | Versions | Dedup Count | Risk Level | Impact |
|---|---------|----------|-------------|-----------|--------|
| 1 | **react** | 19.1.0, 18.3.1 | 1715+ | 🔴 CRITICAL | Hooks errors, state corruption |
| 2 | **react-test-renderer** | 19.1.0, 19.2.3 | Multiple | 🟡 MEDIUM | Testing mismatch |
| 3 | **typescript** | 5.3.3, 5.4.5, 5.5.4, 5.9.3 | 4 versions | 🟡 LOW | Build type differences, acceptable |
| 4 | **@types/react** | 19.1.0, 18.2.66 | Multiple | 🟡 MEDIUM | Type mismatch in IDE |
| 5 | **@types/node** | Multiple versions | Multiple | 🟢 LOW | Type definitions variance |
| 6 | **babel-jest** | Multiple | 1715+ deduped | 🟢 LOW | Testing, deduplicated |
| 7 | **lodash** | (if present) | - | 🟢 LOW | Utility lib, safe to dedupe |
| 8 | **date-fns** | (if present) | - | 🟢 LOW | Utility lib, safe to dedupe |

**Key Finding:** 1715+ instances of deduped packages found, indicating aggressive hoisting

---

## 2. Critical Duplicate: React (BREAKING)

### Detailed Analysis

| Version | Location | Resolved By | Usage |
|---------|----------|-------------|-------|
| **19.1.0** | `/node_modules/react/` | Mobile app | Mobile app, @sentry/react |
| **18.3.1** | `/node_modules/react/` (duplicate) | Unknown transitive | Legacy navigation libs? |

### Why This Breaks Mobile App

React uses **singleton module pattern**. If two versions are present:

```javascript
// App.js (expects React 19.1.0)
import React from 'react';
const { useState } = React;  // ← Gets the 18.3.1 version!

function MyComponent() {
  const [state, setState] = useState(0);  // ← Hook from wrong version
  // Incompatibility → "Cannot read property 'S' of undefined"
}
```

### Resolution Path

1. **Remove 18.3.1** completely from node_modules
2. **Identify culprit** — Which transitive depends on `react@^18.x`?
3. **Upgrade or pin** that dependency to support `react@^19.x`

---

## 3. Medium-Risk Duplicates

### React Test Renderer (19.1.0 vs 19.2.3)

**Status:** Both compatible with React 19.x, but slight mismatch

**Resolution:** Pin to match React exactly:
```json
{
  "react-test-renderer": "^19.1.0"  // Match react@^19.1.0
}
```

---

### TypeScript Version Spread

**Severity:** Low (minor version differences)

| Version | Services | Acceptable? |
|---------|----------|------------|
| 5.3.3 | Mobile | ✅ Works fine |
| 5.4.5 | Next.js (pinned) | ✅ Locked by Next.js |
| 5.5.4 | Admin, Wallet | ✅ Latest in minor |
| 5.9.3 | Root (installed) | ✅ Latest |

**Recommendation:** ⚠️ **Keep as-is** — Different services have different needs. Breaking if unified.

---

### @types/react Mismatch

| Service | @types/react | react |  Mismatch? |
|---------|---|---|---|
| Mobile | 19.1.0 | 19.1.0 | ✅ NO |
| Admin | 18.2.66 | 18.2.0 | ⚠️ Minor (acceptable) |
| Website | 18.2.66 | 18.2.0 | ⚠️ Minor (acceptable) |
| Wallet | 18.2.66 | 18.2.0 | ⚠️ Minor (acceptable) |

**Recommendation:** ✅ **Acceptable** — Within service boundaries

---

## 4. Dependency Chain Analysis (Culprit Finding)

### Likely Sources of React 18.3.1

Run this to trace the dependency:
```bash
npm ls react@18.3.1
```

**Probable culprits:**
- `@react-navigation/*` versions that don't yet support React 19
- Test framework dependencies with pinned react@18.x
- Legacy library pulled in transitively

---

## 5. Duplicate Package Prevention Strategy

### Current State
- **npm ls output:** 1715+ deduped instances
- **Root cause:** Aggressive dependency hoisting by npm
- **Status:** Working but fragile

### Recommended Approach: npm overrides

Add to `/package.json`:
```json
{
  "overrides": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-test-renderer": "^19.1.0"
  }
}
```

**Effect:** Forces all transitive deps to use these exact versions, preventing 18.3.1 installation

---

## 6. Service-Level Duplicate Review

### Admin Portal (3.9 MB, separate node_modules)

**Likely Contents:**
- React 18.2.0 + dependencies
- Vite tooling
- TypeScript 5.5.4

**Question:** Does admin portal install its own React, or inherit from root?

**Recommendation:**
- If independent service: Keep local node_modules
- If shared workspace: Consolidate to root

---

### Customer Website (316 MB, separate node_modules)

**Likely Contents:**
- React 18.2.0 + Next.js entire toolchain
- Large build tools (Webpack, etc.)
- All Next.js plugins

**Question:** Is this installed independently or part of monorepo?

**Recommendation:**
- If standalone Next.js project: Keep it (expected bloat)
- If should share root: Consider npm workspaces

---

### Wallet Web (3.9 MB, separate node_modules)

**Likely Contents:**
- React 18.2.0 + Vite
- Similar to admin portal

**Recommendation:** Review if separate install is necessary

---

## 7. Bloat Analysis

### Current Disk Usage

```
Root node_modules:      584 MB  (1355 packages)
Mobile node_modules:    136 MB  (subset of root)
Admin node_modules:     3.9 MB  (Vite + React 18)
Website node_modules:   316 MB  (Next.js full)
Wallet node_modules:    3.9 MB  (Vite + React 18)
─────────────────────────────────
TOTAL:                  1043 MB
```

### Optimization Target

If we consolidate:
- Root: 500-600 MB (no duplicates)
- Web services: 0 MB (use root)
- **Savings:** ~300-400 MB

**Trade-off:** Less service isolation, more shared deps

---

## 8. Action Plan (Ordered by Impact)

### P0: Remove React 18.3.1 (CRITICAL)

```bash
# Step 1: Identify culprit
npm ls react@18.3.1

# Step 2: Remove stale version
rm -rf /node_modules/react
rm -rf /node_modules/react-dom

# Step 3: Fresh install
npm install

# Step 4: Verify only 19.1.0 present
npm ls react
```

### P1: Add npm overrides (HIGH)

Update `/package.json`:
```json
{
  "overrides": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-test-renderer": "^19.1.0"
  }
}
```

Then reinstall:
```bash
npm install
```

### P2: Verify React Navigation Compatibility (MEDIUM)

```bash
npm info @react-navigation/native@6.1.18 peerDependencies
# If requires ^18.x, upgrade to:
npm install @react-navigation/native@latest
```

### P3: Audit Service node_modules (LOW)

```bash
# Check if services can share root
ls swipesavvy-admin-portal/node_modules
ls swipesavvy-wallet-web/node_modules

# If independent, document policy
# If redundant, consider consolidation
```

---

## 9. Duplicate Prevention Guardrails

### Pre-commit Check

Add to `.husky/pre-commit`:
```bash
# Prevent dual React versions
if [ $(npm ls react 2>&1 | grep -c "invalid:") -gt 0 ]; then
  echo "ERROR: Multiple React versions detected!"
  exit 1
fi
```

### CI/CD Check

Add to GitHub Actions:
```yaml
- name: Check for duplicate packages
  run: |
    npm ls react
    npm ls typescript
    npm audit
```

---

## 10. Summary Table

| Duplicate | Current | Target | Fix | Risk |
|-----------|---------|--------|-----|------|
| react (18.3.1) | Present | Remove | Delete from node_modules | 🔴 CRITICAL |
| react-test-renderer (19.2.3) | 19.1.0 + 19.2.3 | ^19.1.0 | Pin version | 🟡 MEDIUM |
| typescript spread | 5.3-5.9 | Keep as-is | Document | 🟢 LOW |
| @types/react mismatch | Present | Keep isolated | Document | 🟢 LOW |
| Service node_modules | 5 total | Consolidate? | Review policy | 🟡 MEDIUM |

---

## Next Steps

→ **Proceed to Step 5:** Create Fix Plan & Implementation

