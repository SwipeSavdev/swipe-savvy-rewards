# Find the Actual Error in Xcode

When you see the "Build Failed" popup with a wrench icon, follow these steps to find what went wrong:

---

## 🔍 Step 1: Click "Show" in the Popup

The popup should have a button that says **"Show"** or **"Details"**.

**Click it** - this will take you to the error.

---

## 🔍 Step 2: Open Issue Navigator

If you closed the popup:

1. Look at the **left sidebar** in Xcode
2. At the top of the sidebar, you'll see a row of icons
3. Click the **⚠️ icon** (it's usually red when there are errors)
4. This is the **Issue Navigator**
5. You'll see a list of all errors

---

## 🔍 Step 3: Read the Error

In the Issue Navigator:

1. Look for **red ❌** symbols (errors)
2. Click on an error to expand it
3. Read the error message

**Common error messages:**

### "Signing for 'SwipeSavvy' requires a development team"
→ This is a **code signing error** (most common)

### "Command PhaseScriptExecution failed"
→ This is a **build script error**

### "No such module 'ExpoModulesCore'"
→ This is a **missing dependency error**

### "Build input file cannot be found"
→ This is a **missing file error**

---

## 🛠️ Quick Fix Based on Error

### If it says "Signing" or "development team":

**In Xcode:**
1. Click the **blue "SwipeSavvy" icon** at the top of left sidebar
2. In the main area, make sure **"SwipeSavvy"** is selected (not "Pods")
3. Click the **"Signing & Capabilities"** tab (top of main area)
4. Check the box: **"Automatically manage signing"**
5. From the **"Team"** dropdown, select your **Apple ID**
6. Click the **▶ Play button** to build again

---

### If it says "Command PhaseScriptExecution failed":

**Run this in Terminal:**
```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
./fix-and-build.sh
```

Then in Xcode:
- Product → Clean Build Folder (⇧⌘K)
- Product → Run (⌘R)

---

### If it says "No such module":

**In Terminal:**
```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
export LANG=en_US.UTF-8
cd ios && pod install && cd ..
```

**In Xcode:**
- Close Xcode
- Reopen: `open ios/SwipeSavvy.xcworkspace`
- Product → Clean Build Folder (⇧⌘K)
- Product → Run (⌘R)

---

## 📸 Alternative: Screenshot Method

If you can't find the error:

1. Take a **screenshot** of the Xcode window showing the error
2. Or copy the error text from the Issue Navigator
3. Share it with me

---

## 🎯 Most Likely: Code Signing

The most common first-time build error is code signing.

**Try this first:**

1. **Blue "SwipeSavvy" icon** (left sidebar, top)
2. **"Signing & Capabilities"** tab
3. ✅ **"Automatically manage signing"** checkbox
4. Select your **Apple ID** from "Team"
5. **▶ Build** again

This fixes 90% of first-time build failures!

---

## Summary

**Right now, do this:**

1. Click **⚠️ icon** in Xcode's left sidebar
2. Look at the **red ❌ errors**
3. Tell me what the first error says
4. Or try the **code signing fix** above

What does the error say? 🔍
