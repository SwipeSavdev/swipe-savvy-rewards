# SwipeSavvy Mobile App - Troubleshooting Guide

## Runtime Error: "Cannot read property 'S' of undefined"

### Symptoms
- App compiles but fails at runtime with error: `[TypeError: Cannot read property 'S' of undefined]`
- Also may show: `[TypeError: Cannot read property 'default' of undefined]`
- Bundle shows errors in the format:
  ```
  ERROR  [TypeError: Cannot read property 'S' of undefined]
  ERROR  [TypeError: Cannot read property 'default' of undefined]
  ```

### Root Cause
This error occurs when React and React Native package versions are incompatible with the Expo version being used. Specifically, Expo 54 expects specific package versions that differ from what might be installed by default.

**Common Version Conflicts:**
- React version too old (18.3.1) when Expo 54 expects 19.1.0
- React DOM version mismatch
- React Native gesture handler version incompatible
- React Native screens version incompatible

### Solution Steps

#### Step 1: Identify the Version Mismatch
Run the Expo start command and check the warning output:
```bash
npx expo start --clear
```

Look for warnings like:
```
The following packages should be updated for best compatibility with the installed expo version:
  react@18.3.1 - expected version: 19.1.0
  react-dom@18.3.1 - expected version: 19.1.0
  react-native-gesture-handler@2.30.0 - expected version: ~2.28.0
  react-native-screens@4.19.0 - expected version: ~4.16.0
```

#### Step 2: Update React and React DOM
```bash
npm install react@19.1.0 react-dom@19.1.0 --legacy-peer-deps
```

#### Step 3: Update Native Navigation Packages
```bash
npm install react-native-gesture-handler@2.28.0 react-native-screens@4.16.0 --legacy-peer-deps
```

#### Step 4: Clear Metro Cache
```bash
rm -rf .metro-cache
```

#### Step 5: Restart Expo
```bash
npx expo start --clear
```

### Verification
The bundle should now compile successfully with output like:
```
iOS Bundled XXXms index.js (1125 modules)
```

No "Cannot read property" errors should appear.

### Prevention
- After installing Expo, run `npx expo start` at least once to identify version mismatches
- Address all version compatibility warnings before proceeding
- Keep a record of the working versions in this guide (see Appendix: Verified Working Versions)

---

## Watchman Warning: "MustScanSubDirs UserDroppedTo resolve"

### Symptoms
Warning in Expo output:
```
Recrawled this watch 1 time, most recently because:
MustScanSubDirs UserDroppedTo resolve, please review the information on
https://facebook.github.io/watchman/docs/troubleshooting.html#recrawl
```

### Root Cause
Watchman (file watcher for Metro) has encountered a directory structure change or cache issue.

### Quick Fix
```bash
watchman watch-del '/Users/macbookpro/Documents/swipesavvy-mobile-app-v2' ; \
watchman watch-project '/Users/macbookpro/Documents/swipesavvy-mobile-app-v2'
```

Or the nuclear option:
```bash
watchman watch-del-all
```

### Prevention
- This is usually non-critical and resolves on its own after rebuild
- If persistent, use the fix above

---

## Database Initialization Error: "SQLite.openDatabaseAsync is not a function"

### Symptoms
Error message:
```
ERROR  ❌ Error initializing database: 
[TypeError: SQLite.openDatabaseAsync is not a function (it is undefined)]
```

### Root Cause
The SQLite module import or API call is failing, usually due to:
1. expo-sqlite not being properly installed
2. Incorrect import syntax in DatabaseInitializer
3. Module loading order issues

### Solution Steps

#### Step 1: Ensure expo-sqlite is Installed
```bash
npm install expo-sqlite --legacy-peer-deps
```

#### Step 2: Check Database Initialization Code
Verify [src/database/DatabaseInitializer.ts](src/database/DatabaseInitializer.ts) has proper error handling:
```typescript
try {
  const db = await SQLite.openDatabaseAsync('swipesavvy_mobile.db');
  // ... initialization code
} catch (error) {
  console.error('Database initialization failed:', error);
  // Continue with fallback/mock database
}
```

#### Step 3: Clear Metro Cache and Restart
```bash
rm -rf .metro-cache
npx expo start --clear
```

### Prevention
- Database initialization should never block app startup
- Always wrap database operations in try/catch blocks
- Implement fallback to mock database for development/testing
- Log but don't throw errors during database initialization

---

## Module Resolution Error: "Requiring unknown module"

### Symptoms
```
ERROR  [Error: Requiring unknown module "1235". If you are sure the module 
exists, try restarting Metro. You may also want to run `yarn` or `npm install`.]
```

### Root Cause
Metro bundler cache is out of sync with the actual file system.

### Solution
```bash
# Complete reset
killall -9 node 2>/dev/null || true
sleep 2
rm -rf .metro-cache node_modules/.cache
npx expo start --clear
```

---

## CommonJS vs ES Module Errors

### Symptoms
Error mentioning `__dirname`, `require`, or module format issues when config files are `.js`

### Root Cause
Metro bundler and Babel expect `.cjs` (CommonJS) extension for configuration files in Expo projects.

### Solution
Ensure these files use `.cjs` extension:
- **metro.config.cjs** (not .js)
- **babel.config.cjs** (not .js)

### Prevention
✅ Always use `.cjs` for configuration files in Expo/Metro projects

---

## Path Alias Resolution Errors (@contexts, @features, etc.)

### Symptoms
```
ERROR: Cannot find module '@contexts/...'
ERROR: Cannot find module '@features/...'
```

### Root Cause
Metro bundler doesn't fully support TypeScript path aliases without additional configuration. Path aliases work in IDE (TypeScript) but fail at runtime.

### Solution
Replace all path aliases with relative imports:
- ❌ `import { ThemeContext } from '@contexts/ThemeContext'`
- ✅ `import { ThemeContext } from '../../contexts/ThemeContext'`

### Files Modified (Verified)
- src/app/navigation/RootNavigator.tsx
- src/app/navigation/MainStack.tsx
- src/app/navigation/AuthStack.tsx
- src/components/SplashScreen.tsx
- src/components/LoadingModal.tsx
- src/contexts/ThemeContext.tsx
- src/packages/ai-sdk/src/AIProvider.tsx
- src/database/MobileAppDatabase.ts
- src/features/ai-concierge/screens/ChatScreen.tsx
- And 5+ other component files

### Prevention
- Use relative imports from the start for mobile/Expo projects
- Reserve path aliases for web-only projects or configure Metro explicitly
- Prefer relative imports for readability and compatibility

---

## Splash Screen Not Dismissing

### Symptoms
- App loads but splash screen never goes away
- or splash screen flashes and app crashes

### Root Cause
Improper splash screen lifecycle management or missing `expo-splash-screen` package

### Solution
Verify [src/app/App.tsx](src/app/App.tsx) implements proper lifecycle:
```typescript
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
```

### Key Points
- Call `preventAutoHideAsync()` before rendering
- Use `useEffect` to hide splash after app initializes
- Always wrap with `.catch()` to ignore errors
- Set timeout to allow app to render first

---

## Quick Fix Checklist

Use this checklist when the app won't start:

- [ ] Check Expo version warnings for package mismatches
- [ ] Update React/React Native packages to Expo-recommended versions
- [ ] Clear Metro cache: `rm -rf .metro-cache`
- [ ] Kill Expo process: `killall -9 node`
- [ ] Restart: `npx expo start --clear`
- [ ] Verify imports use relative paths, not `@` aliases
- [ ] Check App.tsx has proper splash screen management
- [ ] Verify DatabaseInitializer has try/catch error handling
- [ ] Check package.json has all required dependencies
- [ ] Run `npm install --legacy-peer-deps` if new errors appear

---

## Development Environment Setup

### Verified Working Versions
These versions have been tested and work together:

```json
{
  "expo": "^54.0.30",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-native": "0.81.5",
  "react-native-gesture-handler": "2.28.0",
  "react-native-screens": "4.16.0",
  "react-native-safe-area-context": "^4.14.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/native-stack": "^6.10.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "@tanstack/react-query": "^5.12.0",
  "zustand": "^4.4.0",
  "expo-sqlite": "^14.1.0",
  "expo-splash-screen": "^0.27.0"
}
```

### Installation Command
```bash
npm install --legacy-peer-deps
```

Always use `--legacy-peer-deps` with Expo projects due to numerous peer dependency conflicts.

---

## Getting Help

### When Error Occurs
1. Note the exact error message
2. Check the Warnings section at Expo startup
3. Refer to the appropriate section in this guide
4. Follow the Solution Steps exactly
5. If issue persists, try the Complete Reset (below)

### Complete Reset (Last Resort)
```bash
killall -9 node 2>/dev/null || true
killall -9 expo 2>/dev/null || true
sleep 2

# Full clean
rm -rf .metro-cache node_modules/.cache ~/.expo ~/.npm
npm cache clean --force

# Reinstall
npm install --legacy-peer-deps

# Restart
npx expo start --clear
```

### Before Reporting Issues
- Verify you're using recommended package versions (see Appendix)
- Check you're using relative imports, not `@` aliases
- Confirm all dependencies are installed (`npm list`)
- Try a complete reset
- Check that `index.js` exports the App correctly

---

## Appendix: File Checklist

Verify these critical files are in place:

### Configuration Files
- ✅ metro.config.cjs (not .js)
- ✅ babel.config.cjs (not .js)
- ✅ app.json with proper jsEngine and hermes settings
- ✅ index.js with proper Expo registration

### App Entry Point
- ✅ src/app/App.tsx with splash screen management
- ✅ src/app/providers/AppProviders.tsx with all providers
- ✅ src/app/navigation/RootNavigator.tsx

### Critical Dependencies
- ✅ expo-splash-screen installed
- ✅ react-native-gesture-handler installed
- ✅ react-native-screens installed
- ✅ react-native-safe-area-context installed
- ✅ expo-sqlite installed
- ✅ All imports use relative paths (no `@` aliases)

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Metro Bundler Guide](https://metrobundler.dev/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Expo CLI Reference](https://docs.expo.dev/more/expo-cli/)

---

**Last Updated:** January 1, 2026
**Verified With:** Expo 54.0.30, React 19.1.0, React Native 0.81.5
