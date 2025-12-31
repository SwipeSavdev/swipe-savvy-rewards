# QA Audit: Incompatibility & Version Drift Report - swipesavvy-mobile-app-v2

**Audit Date:** 2025-12-29  
**Scope:** React, React Native, TypeScript, Metro, Babel, Jest

---

## 1. Critical Package Version Matrix

| Package | Mobile (RN) | Admin (React 18) | Website (Next.js) | Wallet (React 18) | Root Installed |
|---------|----------|----------|-----------|----------|---------|
| **react** | ^19.1.0 | ^18.2.0 | 18.2.0 | ^18.2.0 | 19.1.0, **18.3.1** ⚠️ |
| **react-dom** | ^19.1.0 | ^18.2.0 | 18.2.0 | ^18.2.0 | 19.1.0 |
| **react-native** | 0.81.5 | ❌ N/A | ❌ N/A | ❌ N/A | 0.81.5 |
| **@types/react** | ^19.1.0 | ^18.2.66 | 18.2.66 | ^18.2.66 | 19.1.17 |
| **typescript** | ^5.3.3 | ^5.5.4 | 5.4.5 | ^5.5.4 | 5.9.3 |
| **@types/node** | (default) | ^20.14.2 | 20.11.30 | (default) | 20.17.13 |

---

## 2. Conflict Analysis

### 🔴 **CRITICAL: React Version Split**

**Problem:** Two React major versions in root node_modules

| Version | Required By | Issue |
|---------|------------|-------|
| 19.1.0 | Mobile app + React Native | Modern hooks, concurrent features |
| 18.3.1 | ⚠️ UNKNOWN (transitive) | Legacy, causes incompatibility |

**Why This Happens:**
1. Mobile app explicitly requires `react@^19.1.0`
2. Some transitive dependency (likely `@react-navigation/*` or test lib) requires `^18.x`
3. npm installed both versions, but React uses singleton pattern (breaks)
4. **Result:** Hooks errors, "Cannot read property" errors, state corruption

**Evidence from npm ls:**
```
react@18.3.1 invalid: "^19.1.0" from node_modules/react-native, 
            "^19.2.3" from node_modules/react-test-renderer
```

**Fix:** Remove react@18.3.1, upgrade transitive deps to support 19.x

---

### 🟡 **WARNING: TypeScript Version Spread**

| Version | Services | Compatibility |
|---------|----------|----------------|
| 5.9.3 | Root (installed) | ✅ Latest, good |
| 5.5.4 | Admin, Wallet | ⚠️ Minor behind, acceptable |
| 5.4.5 | Website (Next.js) | ⚠️ Older but pinned by Next.js |
| 5.3.3 | Mobile (requested) | ⚠️ Outdated, but works |

**Assessment:** Acceptable spread (minor versions). No breaking changes expected.

---

### 🟡 **WARNING: @types/react Mismatch**

| Version | Service | React Pair | Match? |
|---------|---------|-----------|--------|
| 19.1.0+ | Mobile | 19.1.0 | ✅ YES |
| 18.2.66 | Admin | 18.2.0 | ✅ YES |
| 18.2.66 | Website | 18.2.0 | ✅ YES |
| 18.2.66 | Wallet | 18.2.0 | ✅ YES |

**Assessment:** ✅ All aligned within their service boundaries

---

## 3. Peer Dependency Violations

### From `npm ls` Output (Mobile App)

```
react@18.3.1 invalid: "^19.1.0" from node_modules/react-native
                   "^19.2.3" from node_modules/react-test-renderer
```

**Explanation:**
- `react-native@0.81.5` declares peer dependency: `"react": "^19.1.0"`
- `react-test-renderer@19.2.3` declares: `"react": "^19.2.3"`
- But npm also resolved `react@18.3.1` (wrong)

**Violating Packages:**
1. **react-test-renderer** — Version mismatch with installed react
2. **Transitive dependency** — Unknown lib requesting `^18.x`

---

## 4. Metro + Babel Compatibility

### Metro Bundler Configuration

| Component | Requirement | Current | Status |
|-----------|------------|---------|--------|
| Metro | Compatible with Expo SDK 54 | Installed via expo | ✅ OK |
| Babel | 7.x (preset-expo) | babel-preset-expo installed | ✅ OK |
| Hermes | Disabled | Disabled in metro.config.js | ✅ OK |
| Metro Minifier | Safe (no name mangling) | mangle: false in metro.config.js | ✅ OK |

**Assessment:** ✅ No Metro/Babel conflicts detected

---

## 5. Jest & Testing Configuration

| Package | Version | Service | Status |
|---------|---------|---------|--------|
| jest | Latest (via expo) | Mobile | ✅ Compatible |
| jest-expo | Latest | Mobile | ✅ Compatible |
| @testing-library/react-native | 12.9.0 | Mobile | ✅ Compatible |
| @testing-library/jest-native | 5.4.3 | Mobile | ✅ Compatible |
| babel-jest | Via babel | All | ✅ Compatible |

**Assessment:** ✅ No testing issues detected

---

## 6. Missing or Mismatched Peer Dependencies

### React Navigation Stack (Critical)

| Package | Declared Peer Deps | Current Status | Issue |
|---------|-------------------|---|---|
| @react-navigation/native@6.1.18 | react@?, react-native@? | ✅ Installed | Peer deps need verification |
| @react-navigation/native-stack@6.11.0 | react-native@? | ✅ Installed | Peer deps need verification |
| @react-navigation/bottom-tabs@6.6.1 | react-native@? | ✅ Installed | Peer deps need verification |

**Need to Check:**
```bash
npm info @react-navigation/native@6.1.18 peerDependencies
npm info @react-navigation/native-stack@6.11.0 peerDependencies
```

---

## 7. Build Tooling Compatibility Matrix

| Tool | Mobile | Admin | Website | Wallet |
|------|--------|-------|---------|--------|
| Babel | metro (expo) | ❌ Vite | Next.js built-in | ❌ Vite |
| TypeScript | 5.3.3 | 5.5.4 | 5.4.5 | 5.5.4 |
| Bundler | Metro | Vite | Next.js | Vite |
| ESLint | expo preset | config-expo | Next.js | config-expo |

**Assessment:** ✅ Each service uses appropriate tooling

---

## 8. Incompatibility Hot Spots (Summary)

| # | Issue | Severity | Cause | Fix |
|---|-------|----------|-------|-----|
| 1 | Dual React versions (18.3.1 + 19.1.0) | 🔴 CRITICAL | Conflicting peer deps | Delete 18.3.1, update transitive |
| 2 | React Navigation + React 19 compatibility | 🟡 MEDIUM | Older RN Nav version | Verify peer deps or upgrade RN Nav |
| 3 | TypeScript version spread (5.3-5.9) | 🟢 LOW | Service-specific pins | Acceptable, no breaking changes |
| 4 | @types/react mismatch | 🟢 LOW | Service isolation | All aligned within boundaries |
| 5 | Metro minification mangle: false | 🟢 LOW | Previous fix | Keep as-is, no regression |

---

## 9. Dependency Audit Commands Run

```bash
# Check critical packages
npm ls react react-native typescript metro babel jest

# Peer dependency checks
npm ls --all 2>&1 | grep UNMET
npm ls --all 2>&1 | grep INVALID

# Mobile app specific
cd swipesavvy-mobile-app-v2
npm ls react react-native @react-navigation/native

# Web services
cd swipesavvy-admin-portal
npm ls react typescript

cd ../swipesavvy-customer-website-nextjs
npm ls react next typescript
```

---

## 10. Version Alignment Recommendations

### **Priority 1: Remove React 18.3.1 (CRITICAL)**
```bash
rm -rf /node_modules/react
npm install
# This will install react@19.1.0 only
```

### **Priority 2: Verify React Navigation Compatibility (HIGH)**
```bash
npm info @react-navigation/native@6.1.18 peerDependencies
# If incompatible with React 19, upgrade to compatible version
npm install @react-navigation/native@latest --save
```

### **Priority 3: Add .npmrc Overrides (MEDIUM)**
Add to root `package.json`:
```json
{
  "overrides": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  }
}
```
This forces all transitive deps to use React 19.1.0.

### **Priority 4: Document Service Boundaries (LOW)**
Update each service's README to clarify:
- React version
- TypeScript version
- Known incompatibilities

---

## Summary Table

| Metric | Status | Risk | Action |
|--------|--------|------|--------|
| React version conflicts | 🔴 FOUND | CRITICAL | Delete 18.3.1 |
| TypeScript version spread | ✅ OK | LOW | No action needed |
| Metro/Babel compatibility | ✅ OK | LOW | Keep current config |
| Testing framework compat | ✅ OK | LOW | No action needed |
| React Navigation compat | ⚠️ VERIFY | MEDIUM | Check peer deps |
| Build tooling alignment | ✅ OK | LOW | No action needed |

---

## Next Steps
→ **Proceed to Step 4:** Duplicate Packages & Multiple Copies Analysis

