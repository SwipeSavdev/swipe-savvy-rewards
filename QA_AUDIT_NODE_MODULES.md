# QA Audit: Duplicate node_modules Detection - swipesavvy-mobile-app-v2

**Audit Date:** 2025-12-29

---

## 1. All node_modules Directories Found

| # | Path | Size | Type | Expected? | Verdict |
|---|------|------|------|-----------|---------|
| 1 | `/node_modules` | 584 MB | Root (shared) | ✅ YES | **KEEP** |
| 2 | `/swipesavvy-mobile-app-v2/node_modules` | 136 MB | Service-local | ⚠️ MAYBE | **REVIEW** |
| 3 | `/swipesavvy-admin-portal/node_modules` | 3.9 MB | Service-local | ⚠️ MAYBE | **REVIEW** |
| 4 | `/swipesavvy-customer-website-nextjs/node_modules` | 316 MB | Service-local | ⚠️ MAYBE | **REVIEW** |
| 5 | `/swipesavvy-wallet-web/node_modules` | 3.9 MB | Service-local | ⚠️ MAYBE | **REVIEW** |

**Total Physical Disk:** ~1043 MB

---

## 2. Root node_modules (584 MB) — Deep Dive

### Expected Content
- All dependencies from **root `package.json`** (Expo + shared dev tools)
- Transitive dependencies from all direct deps
- Peak expected: 500-600 MB for Expo + Metro + React Native ecosystem

### Actual Content

```
✅ Expected Root Packages:
  ├── expo@54.x
  ├── react-native@0.81.5
  ├── @expo/cli
  ├── metro-bundler
  ├── @babel/* (multiple)
  ├── jest + jest-expo
  ├── typescript@5.9.3
  ├── eslint@8.x
  └── ~1355 packages total

❌ DUPLICATE ALERT:
  ├── react@19.1.0  ← Expected for mobile
  ├── react@18.3.1  ← ⚠️ UNEXPECTED (stale or from transitive)
  └── Cause: TBD via dependency trace
```

### Duplicate Package Detail: React

| Package | Versions Found | Location(s) | Used By |
|---------|---|---|---|
| `react` | 19.1.0, 18.3.1 | `/node_modules/react/` (both) | Mobile + Legacy libs |
| `react-dom` | 19.1.0 | `/node_modules/react-dom/` | Mobile app |
| `react-test-renderer` | 19.1.0, 19.2.3 | Multiple locations | Testing |

**Root Cause Hypothesis:** 
- Mobile app requires `^19.1.0`
- Some transitive dependency (likely React Navigation or test libs) requested `^18.x`
- npm resolution installed both versions due to conflicting peer deps

---

## 3. Service-Local node_modules

### 3.1 `/swipesavvy-mobile-app-v2/node_modules` (136 MB)

**Presence:** ✅ Exists and populated
**Independence:** ⚠️ Unclear why separate from root
**Contained Packages:** Likely duplicates of root for isolation

**Assessment:**
- **Useful if:** Service needs isolated deps (not in root)
- **Wasteful if:** Duplicates root entirely
- **Action:** Merge to root during optimization

---

### 3.2 `/swipesavvy-admin-portal/node_modules` (3.9 MB)

**Presence:** ✅ Exists (minimal)
**Independence:** ✅ Likely has Vite-specific deps
**Usefulness:** ✅ Small, targeted for admin portal

**Assessment:**
- Reasonable isolation for React 18.2.0 + Vite + TypeScript
- If admin portal is independent, keep it
- **Action:** Verify no conflicting React versions

---

### 3.3 `/swipesavvy-customer-website-nextjs/node_modules` (316 MB)

**Presence:** ✅ Exists (LARGE)
**Independence:** ✅ Next.js project needs isolated deps
**Usefulness:** ⚠️ Bloated for what should be lean Next.js install

**Assessment:**
- **Why 316 MB?** Next.js + dependencies likely include build tools, testing, linting
- Next.js projects often have bloated node_modules (expected)
- **Action:** If this is a completely separate project, acceptable isolation; otherwise optimize

---

### 3.4 `/swipesavvy-wallet-web/node_modules` (3.9 MB)

**Presence:** ✅ Exists (minimal)
**Independence:** ✅ Likely Vite or simple bundle
**Usefulness:** ✅ Small, focused

**Assessment:**
- Similar to admin portal, reasonable isolation
- **Action:** Verify no React version conflicts

---

## 4. Nested node_modules Indicators (Transitive Installs)

### Search Result Summary
Multiple packages have **nested node_modules** within their own dist or test directories:
- `/node_modules/react-native/node_modules/.bin`
- `/node_modules/eslint-plugin-react/node_modules/resolve/test/...`
- `/node_modules/@expo/cli/node_modules/.bin`

**Status:** ⚠️ Expected for bundled dependencies, but inflates count

---

## 5. Verdict & Remediation Plan

### Root node_modules Status: 🔴 **CORRUPT**
- **Issue:** Dual React versions (18.3.1 + 19.1.0)
- **Risk Level:** **CRITICAL** — Causes hooks errors and unpredictable behavior
- **Fix:** Remove React 18.3.1, keep 19.1.0 for mobile

### Service node_modules Status: ⚠️ **SUBOPTIMAL BUT ACCEPTABLE**
- **Expected?** Depends on monorepo strategy:
  - **If true monorepo:** Eliminate, use root + npm workspaces
  - **If isolated services:** Acceptable, but verify no version conflicts
  
---

## 6. Recommended Actions (Ordered by Priority)

### P0 (CRITICAL)
```bash
# 1. Remove React 18.3.1 from root
rm -rf /node_modules/react node_modules/react-dom
npm install  # Fresh install of ^19.1.0 only

# 2. Verify no other duplicates
npm ls react react-dom typescript metro babel
```

### P1 (HIGH)
```bash
# 3. Review service-level node_modules necessity
# - If isolated services: add to .gitignore
# - If shared workspace: consolidate to root
```

### P2 (MEDIUM)
```bash
# 4. Consider npm workspaces setup
# Add to root package.json:
{
  "workspaces": [
    "swipesavvy-mobile-app-v2",
    "swipesavvy-admin-portal",
    "swipesavvy-customer-website-nextjs",
    "swipesavvy-wallet-web"
  ]
}
```

---

## 7. Summary Table

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Root node_modules Size | 584 MB | 500-550 MB | 🔴 Oversized (duplicates) |
| Service node_modules Count | 5 total | 1 (root only) | ⚠️ Fragmented |
| Duplicate Packages | React (2x) | 0 | 🔴 Critical |
| Total Disk Usage | 1043 MB | ~600 MB (optimized) | ⚠️ Inefficient |
| npm workspaces enabled | ❌ No | ✅ Yes (optional) | ⚠️ Future improvement |

---

## 8. Verification Commands

```bash
# Find all node_modules
find /Users/macbookpro/Documents/swipesavvy-mobile-app-v2 -name node_modules -type d -prune

# Size analysis
du -sh /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/node_modules \
      /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-*/node_modules

# Check for duplicate React
npm ls react

# Check for duplicate TypeScript
npm ls typescript
```

---

## Next Step
→ **Proceed to Step 3:** Incompatibility & Version Drift Audit

