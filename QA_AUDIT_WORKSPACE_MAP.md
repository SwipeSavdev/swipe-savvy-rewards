# QA Audit: Workspace & Dependency Topology - swipesavvy-mobile-app-v2

**Audit Date:** 2025-12-29  
**Workspace Root:** `/Users/macbookpro/Documents/swipesavvy-mobile-app-v2`  
**Scope:** React Native Expo mobile app + 4 supporting services

---

## 1. Repository Structure

This is a **monorepo-like multi-service workspace** with a single shared root `node_modules` + individual service node_modules.

### Service Breakdown

| Service | Path | Type | Package Manager |
|---------|------|------|-----------------|
| Root Workspace | `/` | Workspace manifest | npm |
| Mobile App (Expo) | `/swipesavvy-mobile-app-v2` | React Native 0.81.5 + Expo SDK 54 | npm |
| Admin Portal | `/swipesavvy-admin-portal` | React 18.2.0 (Vite) | npm |
| Customer Website | `/swipesavvy-customer-website-nextjs` | React 18.2.0 (Next.js 14+) | npm |
| Wallet Web | `/swipesavvy-wallet-web` | React 18.2.0 (Vite) | npm |

---

## 2. Package Manager Detection

### Finding
- **Single Manager:** `npm` (only) ✅
- **Lockfiles Found:**
  - `/package-lock.json` (716 KB) — ROOT workspace
  - Individual lockfiles: None detected in subdirectories

### Rationale
Root lockfile governs all installs. Services inherit npm from root.

### Recommendation Status
✅ **CLEAN** — No mixed package managers, single source of truth

---

## 3. All package.json Locations

```
/package.json                                    (root workspace)
/swipesavvy-mobile-app-v2/package.json          (mobile app)
/swipesavvy-admin-portal/package.json           (admin portal)
/swipesavvy-customer-website-nextjs/package.json (customer site)
/swipesavvy-wallet-web/package.json             (wallet)
```

**Total:** 5 package.json files (1 root + 4 services)

---

## 4. Lockfile Analysis

### package-lock.json (Root)

| Attribute | Value |
|-----------|-------|
| File Size | 716 KB |
| Location | `/package-lock.json` |
| Type | npm v11 format |
| Lock Integrity | ✅ Present, structured |
| Freshness | Last generated: During latest npm install |

### No Service-Level Lockfiles ✅
- Admin Portal: No `package-lock.json` (inherits root)
- Customer Website: No `package-lock.json` (inherits root)
- Wallet Web: No `package-lock.json` (inherits root)

---

## 5. Dependency Strategy Assessment

### Current Setup: **Hoisted Root node_modules + Service Isolation**

```
/node_modules/                    ← 584 MB (shared across all services)
  ├── react@19.1.0 (for mobile)
  ├── react@18.3.1 (unexpected duplicate!)
  ├── react-native@0.81.5
  ├── typescript@5.9.3
  └── ...1355 packages total

/swipesavvy-mobile-app-v2/node_modules/     ← 136 MB (mobile-specific)
/swipesavvy-admin-portal/node_modules/      ← 3.9 MB (admin portal)
/swipesavvy-customer-website-nextjs/node_modules/ ← 316 MB (next.js)
/swipesavvy-wallet-web/node_modules/        ← 3.9 MB (wallet)
```

**Total Disk Usage:** ~1043 MB

### Issues Identified

#### 🔴 **CRITICAL: Duplicate React Versions**
- Root `node_modules` contains **two React versions:**
  - `react@19.1.0` (required by mobile app)
  - `react@18.3.1` (unexpected, likely stale)
  
**Impact:** Hooks errors, context loss, unpredictable behavior in mobile app

#### 🟡 **WARNING: Multiple node_modules Directories**
- 4 service-level node_modules directories
- Web services (Next.js, Vite) have bloated local installs (316 MB, 3.9 MB)
- Violates DRY principle but may be acceptable if intentional isolation is needed

---

## 6. Package Manager Policy Recommendation

| Policy | Current | Recommended | Priority |
|--------|---------|-------------|----------|
| Single package manager | ✅ npm only | ✅ Keep npm | Low |
| Single lockfile | ✅ Root only | ✅ Keep root | Low |
| Workspace mode (npm v7+) | ❌ Not enabled | ⚠️ Consider for future | Low |
| Duplicate prevention | 🔴 Multiple React | ✅ Fix via resolutions | **CRITICAL** |

---

## 7. Next Steps (Ordered by Risk)

1. **🔴 URGENT:** Remove duplicate React 18.3.1 from root node_modules (Step 2 of audit)
2. **🔴 URGENT:** Align all React versions (Step 3 of audit)
3. 🟡 **MEDIUM:** Consider npm workspace setup for cleaner dep management (future)
4. ✅ **LOW:** Document final strategy in package.json "packageManager" field

---

## Summary

| Attribute | Status | Notes |
|-----------|--------|-------|
| Package Manager | ✅ Single (npm) | No conflicts |
| Lockfiles | ✅ Single root | Authoritative |
| node_modules Count | ⚠️ 5 total | Root + 4 services |
| Duplicate Packages | 🔴 **CRITICAL** | React 18.3.1 + 19.1.0 |
| Monorepo Setup | ❌ Not enabled | Works, but fragile |

**Overall Status:** ⚠️ **FUNCTIONAL BUT FRAGILE** — Must fix React duplicates before proceeding

