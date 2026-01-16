# 🚀 Quick Start - Fix & Deploy

**Last Updated**: January 16, 2026
**Status**: Ready to execute

---

## ⚡ TL;DR

```bash
# 1. Fix splash screen (5-10 min)
./rebuild-app.sh
npx expo run:ios

# 2. Deploy backend (5-15 min)
./deploy.sh

# 3. Verify
curl https://api.swipesavvy.com/health
```

---

## 📱 Step 1: Fix Splash Screen

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Run the rebuild script
./rebuild-app.sh

# Then run on your device
npx expo run:ios
```

**Result**: App opens directly to login with no delay!

---

## ☁️ Step 2: Deploy Backend

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Run the deployment script
./deploy.sh
```

**Result**: Latest code deployed to AWS!

---

## ✅ Step 3: Verify

```bash
# Check API health
curl https://api.swipesavvy.com/health

# Expected: {"status": "healthy", "version": "1.1.0"}
```

---

## 📚 Full Documentation

- [FIXES_SUMMARY.md](FIXES_SUMMARY.md) - Overview
- [SPLASH_SCREEN_FIX.md](SPLASH_SCREEN_FIX.md) - Detailed splash guide
- [GITHUB_ACTIONS_FIX.md](GITHUB_ACTIONS_FIX.md) - Deployment options

---

**Ready to start?** Just run the two scripts! 🎉
