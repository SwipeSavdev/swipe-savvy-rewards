# Setup for jason@swipesavvy.com

**Updated**: Project owner changed to `swipesavvyapp`

---

## 🔐 Step 1: Login with SwipeSavvy Account

You need to login with the Expo account that has access to `swipesavvyapp`:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Logout current account
npx eas logout

# Login with jason@swipesavvy.com
npx eas login
# Enter: jason@swipesavvy.com
# Enter: [password for this account]
```

---

## 🚀 Step 2: Initialize and Build

Once logged in with the correct account:

```bash
# Initialize EAS project under swipesavvyapp
npx eas init

# When prompted: "Would you like to create a project for @swipesavvyapp/swipesavvy-mobile-app?"
# Type: y
# Press: ENTER

# Build the app
npx eas build --profile development --platform ios
```

---

## ⚠️ Important Notes

### Account Requirements

The Expo account you login with must:
- Have access to the `swipesavvyapp` organization
- Have permission to create projects
- Be jason@swipesavvy.com or have admin access to swipesavvyapp

### If You Don't Have Access

If jason@swipesavvy.com doesn't have an Expo account yet:

**Option 1: Create Account for SwipeSavvy**
1. Go to https://expo.dev/signup
2. Create account with jason@swipesavvy.com
3. Login with `npx eas login`
4. Continue with build

**Option 2: Use Personal Account**
1. Change owner in [app.json](app.json:3) back to `austin.smith10`
2. Use current login
3. Build under personal account
4. Transfer later if needed

---

## 📋 Current Configuration

[app.json](app.json:3):
```json
{
  "expo": {
    "owner": "swipesavvyapp",
    "name": "SwipeSavvy",
    "slug": "swipesavvy-mobile-app"
  }
}
```

This means:
- Project will be created under the `swipesavvyapp` organization
- Need to be logged in with an account that has access to this org
- Project URL will be: `expo.dev/accounts/swipesavvyapp/projects/swipesavvy-mobile-app`

---

## 🔄 Alternative: Switch Back to Personal Account

If you want to build under austin.smith10 instead:

```bash
# You're already logged in as austin.smith10
# Just change the owner back

# Edit app.json and change line 3:
# "owner": "austin.smith10",

# Then proceed with build:
npx eas init
npx eas build --profile development --platform ios
```

---

## ✅ After Login

Once logged in with the correct account, follow these steps:

```bash
# 1. Initialize EAS project
npx eas init

# 2. Build the app
npx eas build --profile development --platform ios

# 3. Wait for build (15-20 minutes)

# 4. Install on simulator
npx expo install:ios

# 5. Start dev server
npx expo start --dev-client
```

---

## 🎯 Expected Result

After successful build:
- ✅ App launches directly to login (no splash delay)
- ✅ Email verification works (not SMS)
- ✅ Connected to AWS backend
- ✅ Project owned by swipesavvyapp organization

---

## 🆘 Troubleshooting

### "You don't have permission to create a project"

**Solution**: Either:
1. Get admin access to `swipesavvyapp` organization, OR
2. Change owner in app.json to your personal account

### "Invalid credentials"

**Solution**:
```bash
npx eas logout
npx eas login
# Re-enter credentials
```

### Still logged in as austin.smith10

**Solution**:
```bash
# Force logout
npx eas logout

# Clear credential cache
rm -rf ~/.expo

# Login again
npx eas login
```

---

## 📝 Summary

**Current Status**:
- ✅ All code ready
- ✅ Backend deployed to AWS
- ✅ Project configured for swipesavvyapp owner
- ⏳ Need to login with correct account

**Next Steps**:
1. Login with account that has access to swipesavvyapp
2. Run `npx eas init`
3. Run `npx eas build --profile development --platform ios`
4. Wait for build and test

**Or**: Change owner back to austin.smith10 if you want to build under personal account.
