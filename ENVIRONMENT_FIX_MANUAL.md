# Manual Environment Fix Guide

**Issues**: #1 (Node Version Mismatch) + #2 (npm Version Mismatch)
**Priority**: P0 CRITICAL
**Time**: 30 minutes
**Date**: 2026-01-06

---

## Current State (INCORRECT)

```bash
$ node --version
v24.10.0  # ❌ WRONG - Should be v20.13.0

$ npm --version
11.6.0  # ❌ WRONG - Should be 10.8.2
```

---

## Required State (CORRECT)

```bash
$ node --version
v20.13.0  # ✅ CORRECT

$ npm --version
10.8.2  # ✅ CORRECT
```

---

## Fix Instructions (Step-by-Step)

### Step 1: Open a New Terminal

**IMPORTANT**: Do NOT use the current terminal. Open a fresh terminal window:
- On Mac: Press `Cmd + N` or open Terminal.app
- Make sure you're in your home directory: `cd ~`

### Step 2: Install Node 20.13.0 using nvm

```bash
# Load nvm (if not already loaded)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node 20.13.0
nvm install 20.13.0

# This will output something like:
# Downloading and installing node v20.13.0...
# Now using node v20.13.0 (npm v10.5.0)
```

### Step 3: Set Node 20.13.0 as Default

```bash
# Use Node 20.13.0
nvm use 20.13.0

# Set as default for all new terminal sessions
nvm alias default 20.13.0
```

### Step 4: Verify Node Version

```bash
# Check Node version
node --version
# Should output: v20.13.0
```

If it outputs `v20.13.0`, continue to Step 5. ✅

If it still shows `v24.10.0`, try:
```bash
# Restart terminal and verify nvm is loaded
which nvm
# Should output: nvm

# Try again
nvm use 20.13.0
node --version
```

### Step 5: Install npm 10.8.2

```bash
# Install the correct npm version globally
npm install -g npm@10.8.2

# This may take 1-2 minutes
```

### Step 6: Verify npm Version

```bash
# Check npm version
npm --version
# Should output: 10.8.2
```

### Step 7: Navigate to Project Directory

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
```

### Step 8: Clean and Reinstall Dependencies

```bash
# Remove old node_modules and lockfile
rm -rf node_modules
rm -f package-lock.json

# Clean npm cache
npm cache clean --force

# Reinstall dependencies with correct versions
npm install

# This may take 5-10 minutes
```

### Step 9: Verify Installation

```bash
# Should complete without engine warnings
# Look for output like:
# added XXX packages in XXs

# If you see warnings like:
# "npm WARN engine ... Unsupported engine"
# Something is still wrong - re-check Node/npm versions
```

### Step 10: Fix Admin Portal Dependencies

```bash
# Navigate to admin portal
cd swipesavvy-admin-portal

# Remove old dependencies
rm -rf node_modules
rm -f package-lock.json

# Reinstall
npm install

# Go back to root
cd ..
```

### Step 11: Test Build

```bash
# Try building the project
npm run build

# If it fails with TypeScript errors, that's expected (Issue #6)
# But it should NOT fail with engine or version errors
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] `node --version` outputs `v20.13.0`
- [ ] `npm --version` outputs `10.8.2`
- [ ] `npm install` completes without engine warnings
- [ ] `node_modules` directory exists
- [ ] `package-lock.json` exists and uses lockfileVersion 2
- [ ] Admin portal dependencies installed successfully

---

## If nvm Is Not Installed

If you get "nvm: command not found", install nvm first:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Add to shell profile (choose ONE based on your shell):

# For bash:
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc

# For zsh (default on modern Macs):
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc

# Reload shell configuration
source ~/.zshrc  # or source ~/.bashrc

# Verify nvm installed
nvm --version
# Should output: 0.39.0 or similar

# Now go back to Step 2 above
```

---

## Common Issues & Solutions

### Issue: "nvm: command not found"

**Solution**: nvm is not installed or not in PATH.
- Install nvm (see section above)
- Or reload shell: `source ~/.zshrc`

### Issue: "node --version" still shows v24.10.0

**Solution**: nvm not using correct version.
```bash
# Force use of Node 20.13.0
nvm use 20.13.0

# Verify
node --version

# If still wrong, check which node is being used
which node
# Should output: /Users/macbookpro/.nvm/versions/node/v20.13.0/bin/node

# If it shows something else, nvm is not in PATH correctly
```

### Issue: "npm install" hangs or takes very long

**Solution**: Network issues or corrupted cache.
```bash
# Stop the install (Ctrl+C)

# Clear cache
npm cache clean --force

# Try again with verbose output
npm install --verbose
```

### Issue: "Engine mismatch" warnings during npm install

**Solution**: Still using wrong Node or npm version.
```bash
# Double-check versions
node --version  # Must be v20.13.0
npm --version   # Must be 10.8.2

# If wrong, repeat Steps 2-6
```

### Issue: package-lock.json shows "lockfileVersion": 3

**Solution**: Generated with npm 11, need to regenerate with npm 10.
```bash
# Ensure npm 10.8.2 is installed
npm --version

# If wrong, reinstall npm
npm install -g npm@10.8.2

# Remove lockfile
rm package-lock.json

# Regenerate with correct npm
npm install
```

---

## Post-Fix Actions

After successfully fixing Node and npm versions:

### 1. Update Shell Profile (Permanent Fix)

Add to `~/.zshrc` (or `~/.bashrc` for bash):

```bash
# Node Version Manager (nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Auto-load .nvmrc when entering directory
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

Then reload:
```bash
source ~/.zshrc
```

### 2. Verify .nvmrc File

Check that `.nvmrc` exists in project root:
```bash
cat .nvmrc
# Should output: 20.13.0
```

If missing, create it:
```bash
echo "20.13.0" > .nvmrc
```

### 3. Update package.json Engines

Verify `package.json` has correct engines:
```json
{
  "engines": {
    "node": "20.13.0",
    "npm": "10.8.2"
  }
}
```

### 4. Enable Engine Strict Mode

Create/update `.npmrc`:
```bash
echo "engine-strict=true" > .npmrc
```

This will make npm FAIL if wrong Node/npm version is used.

### 5. Test in New Terminal

Open a brand new terminal window and verify:
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2

# Should auto-load Node 20.13.0 from .nvmrc
node --version  # v20.13.0
npm --version   # 10.8.2
```

---

## Rollback Plan

If the fix causes issues, rollback:

```bash
# Switch back to Node 24.10.0
nvm use 24.10.0

# Reinstall npm 11
npm install -g npm@11.6.0

# Restore old dependencies
rm -rf node_modules
rm package-lock.json

# Restore from git (if you have a backup)
git checkout package-lock.json

npm install
```

---

## Success Criteria

✅ Issue #1 (Node) is fixed when:
- [ ] `node --version` outputs `v20.13.0`
- [ ] nvm is set to use Node 20.13.0 by default
- [ ] New terminals auto-load Node 20.13.0
- [ ] No engine warnings during `npm install`

✅ Issue #2 (npm) is fixed when:
- [ ] `npm --version` outputs `10.8.2`
- [ ] package-lock.json uses lockfileVersion 2
- [ ] npm install completes without errors
- [ ] Dependencies install correctly

---

## Time Estimate

- Fresh install with nvm already set up: **15 minutes**
- Install nvm + fix: **30 minutes**
- If issues occur: **Add 15-30 minutes for troubleshooting**

---

## Next Steps After Fix

Once Node and npm versions are correct:

1. **Fix Issue #3**: React Version Downgrade
2. **Fix Issue #4**: Package Identity
3. **Fix Issue #5**: Bundler Conflict
4. **Fix Issue #6**: TypeScript Build Errors
5. **Complete Issue #7**: API Key Rotation (USER ACTION REQUIRED)
6. **Fix Issue #8**: CI Node Version
7. **Fix Issue #9**: Docker Compose Paths
8. **Fix Issue #10**: ESLint Configs

See [PR_001_ENVIRONMENT_STANDARDIZATION.md](PR_001_ENVIRONMENT_STANDARDIZATION.md) for complete Phase 1 plan.

---

**Created**: 2026-01-06
**Status**: Ready to Execute
**Estimated Time**: 30 minutes
**Priority**: P0 CRITICAL

---

**END OF MANUAL ENVIRONMENT FIX GUIDE**
