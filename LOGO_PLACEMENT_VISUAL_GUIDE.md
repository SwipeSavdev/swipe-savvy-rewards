# ShopSavvy Logo Placement - Visual Guide

## App User Flow with Logo Placements

```
┌─────────────────────────────────────┐
│                                     │
│      SPLASH SCREEN (App Launch)     │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   ShopSavvy Colored Logo    │   │
│   │      (200x200px)            │   │
│   │                             │   │
│   │  Your trusted shopping      │   │
│   │  companion                  │   │
│   └─────────────────────────────┘   │
│                                     │
│   [Auto-dismisses after 2.5s]       │
│                                     │
└─────────────────────────────────────┘
              ⬇️ (Transition)
┌─────────────────────────────────────┐
│                                     │
│        HOME SCREEN / MAIN APP       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   ShopSavvy Brand Header      │  │  ← Logo Placement #1
│  │      (80x40px small)          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Balance: $4,250.25          │   │
│  │  [Send] [Request] [Scan/Pay] │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Recent Transactions:        │   │
│  │  • Amazon -$45.99            │   │
│  │  • Top-up +$200.00           │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
              ⬇️ (During async operations)
┌─────────────────────────────────────┐
│                                     │
│      LOADING MODAL (Global)         │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   ShopSavvy Colored Logo    │   │  ← Logo Placement #2
│   │      (120x120px)            │   │
│   │          ⊙⊙⊙               │   │
│   │      [Spinner]              │   │
│   │                             │   │
│   │    Processing transfer...   │   │
│   └─────────────────────────────┘   │
│                                     │
│   [Shown during API calls]          │
│                                     │
└─────────────────────────────────────┘
```

---

## Detailed Placements

### Placement #1: Splash Screen ✅ Implemented
**When**: App launch  
**Duration**: 2.5 seconds  
**Logo**: Colored (200x200px)  
**Animation**: FadeInDown entrance  

```
Screen Layout:
┌─────────────────────────────────┐
│                                 │
│                                 │
│     🔷 ShopSavvy Logo 🟡        │
│                                 │
│                                 │
│    Your trusted shopping        │
│    companion                    │
│                                 │
└─────────────────────────────────┘
```

### Placement #2: Loading Modal ✅ Implemented (waiting for PNG)
**When**: During API calls  
**Location**: Center of screen (overlay)  
**Logo**: Colored (120x120px)  
**Spinner**: Below logo  
**Message**: Customizable text  

```
Screen Layout:
┌─────────────────────────────────┐
│  [Background dimmed]            │
│                                 │
│   ┌─────────────────────────┐   │
│   │  🔷 ShopSavvy Logo 🟡  │   │
│   │                         │   │
│   │      [Spinning...]      │   │
│   │                         │   │
│   │   Processing payment    │   │
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Placement #3: Home Screen Header ✅ Implemented
**When**: On home screen view  
**Location**: Top of scrollable content  
**Logo**: Colored (80x40px small)  
**Spacing**: 8px below header  

```
Screen Layout:
┌─────────────────────────────────┐
│  🔷 ShopSavvy 🟡 [small]       │  ← Logo
├─────────────────────────────────┤
│                                 │
│  💰 Available (Checking)         │
│     $4,250.25                   │
│  [Send] [Request] [Scan/Pay]    │
│                                 │
└─────────────────────────────────┘
```

---

## Logo Sizes Reference

| Size | Dimensions | Usage |
|------|-----------|-------|
| **Small** | 80×40px | Navigation headers, HomeScreen header |
| **Medium** | 120×60px | Card headers, section headers |
| **Large** | 160×80px | Hero sections, splash screens |

### Actual Implementation:
- **Splash Screen**: 200×200px (custom size, full hero)
- **Loading Modal**: 120×120px (medium size)
- **Home Header**: 80×40px (small size)

---

## Recommended Additional Placements

### Future Screens to Add Logos

#### Login Screen
```
┌─────────────────────────────────┐
│  🔷 ShopSavvy 🟡 [large]       │  ← Logo (160×80px)
│                                 │
│  [Email input]                  │
│  [Password input]               │
│  [Login button]                 │
│                                 │
│  Don't have an account?         │
│  [Sign up]                      │
└─────────────────────────────────┘
```

#### Signup Screen
```
┌─────────────────────────────────┐
│  🔷 ShopSavvy 🟡 [small]       │  ← Logo (80×40px)
│                                 │
│  [Full name input]              │
│  [Email input]                  │
│  [Password input]               │
│  [Sign up button]               │
└─────────────────────────────────┘
```

#### Transfers Screen
```
┌─────────────────────────────────┐
│  🔷 ShopSavvy 🟡 [small]       │  ← Logo (80×40px)
├─────────────────────────────────┤
│                                 │
│  Send Money                     │
│  [Recipient chip]               │
│  [Amount input]                 │
│  [Review & Confirm]             │
│                                 │
└─────────────────────────────────┘
```

#### Rewards Screen
```
┌─────────────────────────────────┐
│  🔷 ShopSavvy 🟡 [small]       │  ← Logo (80×40px)
├─────────────────────────────────┤
│                                 │
│  🏅 Points: 12,450              │
│  ⭐ Next tier: Gold             │
│  🎯 Challenges                  │
│  👥 Community                   │
│                                 │
└─────────────────────────────────┘
```

#### Profile Screen
```
┌─────────────────────────────────┐
│  🔷 ShopSavvy 🟡 [small]       │  ← Logo (80×40px)
├─────────────────────────────────┤
│                                 │
│  Profile                        │
│  [User avatar]                  │
│  [User name]                    │
│  [Settings toggles]             │
│  [Logout]                       │
│                                 │
└─────────────────────────────────┘
```

---

## Color Legend

🔷 = Navy Blue (`#235393` - Brand Navy)  
🟡 = Yellow (`#FAB915` - Brand Yellow)  
🟢 = Green (`#60BA46` - Brand Green)  

Full Logo: Combines Navy S with Yellow/Green Icon

---

## Implementation Status

### ✅ Complete (Ready)
- [x] Splash screen with logo (auto-displays on launch)
- [x] Loading modal with logo (global context)
- [x] Home screen header logo
- [x] All components created
- [x] All context/providers set up
- [x] TypeScript types verified (0 errors)

### ⏳ Pending (Needs PNG Files)
- [ ] Place `shopsavvy-colored.png` in `assets/logos/`
- [ ] Place `shopsavvy-white.png` in `assets/logos/`
- [ ] Place `shopsavvy-black.png` in `assets/logos/`

### 📋 Future (When Complete)
- [ ] Add logos to Login/Signup screens
- [ ] Add logos to Transfers screen
- [ ] Add logos to Rewards screen
- [ ] Add logos to Profile/Settings screen
- [ ] Add logos to Accounts screen
- [ ] Consider dark mode variants

---

## Dark Mode Considerations

### Current Implementation
- Colored logo works on both light and dark backgrounds
- Navy and yellow/green colors have good contrast

### Future Enhancements
- White logo for dark mode screens
- Black logo for light print/PDFs
- Automatic logo selection based on theme

---

## Testing Each Placement

### Splash Screen
1. Build and run app
2. Observe splash for 2.5 seconds
3. Verify logo is centered and visible
4. Verify smooth transition to home

### Loading Modal
1. In HomeScreen, trigger async action
2. `showLoading('Loading...')` in code
3. Modal should appear centered with logo
4. Verify spinner rotates
5. Call `hideLoading()` when done
6. Modal should dismiss smoothly

### Home Screen Header
1. Navigate to home screen
2. Logo should be visible at top
3. Verify correct size (small)
4. Scroll content below, logo stays visible
5. Check spacing looks balanced

---

## Asset File Names

The components expect these exact file names in `assets/logos/`:

```
shopsavvy-colored.png    ← Colored version (primary)
shopsavvy-white.png      ← White/outline version
shopsavvy-black.png      ← Black version
```

Make sure filenames match exactly (case-sensitive on macOS/Linux).

---

## Summary

| Placement | File | Size | Status |
|-----------|------|------|--------|
| Splash Screen | `SplashScreen.tsx` | 200×200px | ✅ Ready |
| Loading Modal | `LoadingModal.tsx` | 120×120px | ✅ Ready |
| Home Header | `HomeScreen.tsx` | 80×40px | ✅ Ready |

**Total Placements**: 3 ✅  
**Code Ready**: Yes ✅  
**PNG Files Needed**: Yes ⏳  

**Next Step**: Add the three PNG files to `assets/logos/` and test!
