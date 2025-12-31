# Hermes Bytecode Error: "Cannot read property 'S' of undefined" - Solutions & Workarounds

## Overview

The error **"Cannot read property 'S' of undefined"** in React Native Expo projects using Hermes is typically a **bytecode transformation failure** that occurs during the bundling process. This error is specifically related to Hermes bytecode compilation through the Metro bundler.

---

## Root Causes

### 1. **Hermes Bytecode Transformation Issues**
- The Hermes engine attempts to compile JavaScript to bytecode (`.hbc` format) ahead-of-time
- When `transform.bytecode=1` is enabled in Metro configuration, Hermes bytecode compilation can fail on certain code patterns
- The error "Cannot read property 'S' of undefined" indicates a crash in the bytecode transformer itself (likely related to AST traversal where 'S' is an undefined property)

### 2. **Version Incompatibility**
- **Hermes version mismatch** with React Native version
- Hermes is bundled with React Native since v0.69
- Updating React Native without updating the compatible Hermes version causes transformation failures
- Babel transpilation differences between Hermes versions

### 3. **Metro Bundler Configuration**
- Incorrect or missing Metro configuration for Hermes
- Bytecode transformation enabled when code patterns aren't compatible
- Missing or outdated `metro.config.js` settings

### 4. **Package/Dependency Issues**
- **Third-party libraries with incompatible code** that Hermes bytecode compiler can't handle
- Code using features not yet supported by the specific Hermes version
- Transform plugins that generate code incompatible with bytecode compilation

### 5. **Code Pattern Issues**
- Complex object destructuring
- Certain template literal patterns
- Spread operators in specific contexts
- Optional chaining in edge cases
- Nullish coalescing operator usage patterns

---

## Known Solutions & Workarounds

### **Solution 1: Disable Hermes Bytecode (Quickest Fix)**

**For Expo Projects:**

In `app.json`:
```json
{
  "expo": {
    "ios": {
      "jsEngine": "jsc"
    }
  }
}
```

Or completely disable Hermes:
```json
{
  "expo": {
    "jsEngine": "jsc",
    "android": {
      "jsEngine": "jsc"
    }
  }
}
```

**For EAS Builds:**

In `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildConfiguration": "release"
      },
      "ios": {}
    }
  }
}
```

Trade-offs:
- ✅ Eliminates bytecode transformation errors
- ❌ Loses startup performance benefits (~30-50% slower startup)
- ❌ Slightly larger app bundle size
- ❌ Higher memory usage on low-end devices

---

### **Solution 2: Disable Bytecode Compilation While Keeping Hermes**

**Metro Configuration (`metro.config.js`):**

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable Hermes bytecode compilation
config.transformer.isHermes = false;
// OR explicitly disable bytecode
config.transformer = {
  ...config.transformer,
  bytecodeEnabled: false,
};

module.exports = config;
```

Benefits:
- ✅ Keeps Hermes runtime (performance improvements)
- ✅ Avoids bytecode transformation step
- ✅ Reduces build failures

Trade-offs:
- ❌ Slight startup time performance degradation (smaller than JSC though)
- ⚠️ Not all Hermes benefits are realized

---

### **Solution 3: Update React Native & Hermes to Latest Compatible Versions**

**Check compatibility:**
```bash
# In package.json, look at React Native version and corresponding Hermes
npm list react-native

# View Hermes version bundled with RN
npm list hermes-engine
```

**Update to latest:**
```bash
# Expo projects
expo upgrade

# OR manually update React Native
npm install react-native@latest

# For bare RN projects
npm install react-native@latest hermes-engine@latest
```

**Important:** After updating React Native, also update:
- `runtimeVersion` in `app.json` (for EAS Update)
- All native build caches (Android & iOS)

```json
{
  "expo": {
    "runtimeVersion": "50.0.0"  // Update this
  }
}
```

---

### **Solution 4: Clear Build Caches**

**For Expo Projects:**
```bash
# Clear Metro bundler cache
expo start --clear

# OR
rm -rf node_modules/.cache
rm -rf .expo

# Rebuild
expo prebuild --clean
```

**For EAS Builds:**
```bash
# Clear EAS cache
eas build --clear-cache

# For specific platform
eas build --platform android --clear-cache
eas build --platform ios --clear-cache
```

**For Android:**
```bash
cd android
./gradlew clean
cd ..
rm -rf android/app/build
rm -rf android/build
```

**For iOS:**
```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
rm -rf ios/Pods
```

---

### **Solution 5: Check & Fix Problematic Dependencies**

**Identify problematic packages:**

1. Check if any third-party libraries have known Hermes issues
2. Look for packages that haven't updated their code for modern Hermes versions

**Common problematic patterns:**

```javascript
// ❌ Can cause issues
const { a, b, ...rest } = largeObject;
const result = a ?? b ?? c;
const template = `${ deep.nested.property ?? 'default' }`;

// ✅ More reliable
const { a, b } = largeObject;
const rest = { ...largeObject };
delete rest.a;
delete rest.b;
const result = a !== null && a !== undefined ? a : (b !== null && b !== undefined ? b : c);
```

**For Expo projects, check problematic packages:**
```bash
npm audit
# Check for packages with Hermes incompatibility notes
```

---

### **Solution 6: Metro Bundler Configuration Optimization**

**Comprehensive `metro.config.js` for stability:**

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for Hermes
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native/Libraries/Animated/nodes/AnimatedNode'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

// Optionally disable bytecode if issues persist
// config.transformer.bytecodeEnabled = false;

module.exports = config;
```

---

### **Solution 7: Babel Configuration Adjustments**

**Check `babel.config.js`:**

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Ensure compatibility
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-logical-assignment-operators',
      ['@babel/plugin-proposal-optional-chaining', { loose: true }],
      ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: true }],
    ],
  };
};
```

---

## Diagnostic Steps

### **1. Check Hermes is Actually Being Used**

```javascript
// In your app code
const isHermes = !!global.HermesInternal;
console.log('Using Hermes:', isHermes);
```

### **2. Test Build Locally**

```bash
# For Expo
expo prebuild --clean
npx eas build --local --platform android

# For bare React Native
./gradlew assembleRelease
```

### **3. Check Metro Output**

```bash
# Enable verbose logging
expo start --verbose

# Look for bytecode transformation errors in output
```

### **4. Isolate Problematic Code**

1. Create a minimal reproducible example
2. Comment out large sections of code
3. Rebuild to identify which import/module causes the issue
4. Replace problematic dependency or rewrite code

---

## Configuration by Use Case

### **For Development (Fastest)**
```json
{
  "expo": {
    "jsEngine": "jsc",
    "plugins": ["expo-dev-client"]
  }
}
```

### **For EAS Preview Builds (Balanced)**
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### **For Production (Safest, if Issues Persist)**
```json
{
  "expo": {
    "jsEngine": "jsc"
  },
  "build": {
    "production": {
      "node": "18.0.0"
    }
  }
}
```

---

## Version Compatibility Reference

| React Native | Bundled Hermes | Status |
|---|---|---|
| 0.82+ | 0.12.x+ | ✅ Latest |
| 0.81 | 0.12.x | ✅ Stable |
| 0.80 | 0.11.x | ⚠️ Older |
| 0.79 | 0.11.x | ⚠️ Older |
| < 0.69 | Not bundled | ❌ Manual install |

**Best Practice:** Always update React Native and let the bundled Hermes come with it. Don't mix versions.

---

## Prevention Strategies

1. **Keep dependencies updated**: Run `npm update` and `expo upgrade` regularly
2. **Use EAS Build**: Let EAS handle native compilation concerns
3. **Test on real devices**: Bytecode issues sometimes only appear on devices, not simulators
4. **Monitor build logs**: Look for Hermes warnings/errors early
5. **Start with JSC in development**: Use Hermes only for production if uncertain
6. **Use development builds**: `expo-dev-client` for faster iteration during development

---

## When to Use Each Solution

| Scenario | Recommended Solution |
|---|---|
| **Blocked on production build** | Solution 1 (Disable Hermes temporarily) |
| **Want Hermes benefits, have build errors** | Solution 2 (Disable bytecode only) |
| **Haven't updated React Native in months** | Solution 3 (Update RN + Hermes) |
| **Build fails mysteriously after changes** | Solution 4 (Clear caches) |
| **Specific package causing issues** | Solution 5 (Fix dependencies) |
| **Ongoing bytecode compilation crashes** | Solution 6 (Metro optimization) |
| **Custom Babel setup conflicts** | Solution 7 (Babel config) |

---

## Reporting Issues

If you encounter this error and solutions don't work:

1. **GitHub Issues:**
   - [facebook/hermes](https://github.com/facebook/hermes/issues)
   - [facebook/react-native](https://github.com/facebook/react-native/issues)
   - [expo/expo](https://github.com/expo/expo/issues)

2. **Include in bug report:**
   ```
   - React Native version
   - Hermes version
   - Expo SDK version (if applicable)
   - Full error stack trace
   - Minimal reproducible example
   - Platform (Android/iOS)
   - Build tool (EAS/local/other)
   ```

3. **Community Support:**
   - [Expo Discord](https://chat.expo.dev/)
   - [React Native Community Slack](https://slack.react-native.community/)

---

## Summary

The "Cannot read property 'S' of undefined" error is a **Hermes bytecode transformation failure**. The quickest solution is disabling Hermes or bytecode, but longer-term, updating React Native and checking dependencies is recommended. For production apps, consider using JavaScript Core (JSC) temporarily while investigating the root cause.

**Recommended approach:**
1. Immediately: Use Solution 1 or 2 to unblock
2. Short-term: Update React Native (Solution 3)
3. Long-term: Monitor Hermes/RN compatibility, maintain dependency updates
