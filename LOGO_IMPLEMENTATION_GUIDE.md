# ShopSavvy Logo Implementation Guide

**Last Updated**: December 2025  
**Status**: Ready for Implementation

---

## Overview

The ShopSavvy branding has been integrated throughout the mobile app with three logo variants:

1. **Colored Logo** (Primary) - Full color with navy `S` and yellow/green icon
2. **White Logo** - For dark backgrounds and dark mode
3. **Black Logo** - For light backgrounds and print

---

## File Structure

```
assets/
└── logos/
    ├── shopsavvy-colored.png     ← Primary (navy + yellow/green)
    ├── shopsavvy-white.png       ← Dark mode / dark backgrounds
    ├── shopsavvy-black.png       ← Light backgrounds / print
    └── README.md                 ← Asset reference guide

src/
├── components/
│   ├── index.ts                  ← Component exports
│   ├── BrandHeader.tsx           ← Logo display component
│   ├── LoadingModal.tsx          ← Loading indicator with logo
│   ├── SplashScreen.tsx          ← Splash screen with logo
│
├── contexts/
│   └── LoadingContext.tsx        ← Global loading state management
│
└── app/
    └── providers/
        └── AppProviders.tsx      ← App setup with splash + loading
```

---

## Placement Throughout App

### 1. Splash Screen ✅
**Location**: `src/components/SplashScreen.tsx`  
**Shown**: When app first launches (2.5 seconds)  
**Logo Size**: 200x200px colored logo  
**Features**:
- Animated entrance with FadeInDown
- Tagline: "Your trusted shopping companion"
- Auto-dismisses after 2.5 seconds

**Setup**: Already integrated in `AppProviders.tsx`

### 2. Loading Modal ✅
**Location**: `src/components/LoadingModal.tsx`  
**Used**: During API calls and async operations  
**Logo Size**: 120x120px colored logo  
**Features**:
- Centered modal with spinner
- Optional message below logo
- Dimmed backdrop
- Can be full-screen or overlay

**Usage Example**:
```tsx
import { useLoading } from '@contexts/LoadingContext';

function MyScreen() {
  const { showLoading, hideLoading } = useLoading();

  const handleAction = async () => {
    showLoading('Processing...');
    try {
      // Do something async
    } finally {
      hideLoading();
    }
  };
}
```

### 3. Home Screen Header ✅
**Location**: `src/features/home/screens/HomeScreen.tsx`  
**Logo Size**: 120x60px (small variant)  
**Position**: Top of scrollable content, above balance card  
**Usage**: `<BrandHeader variant="full" size="small" />`

---

## Components Reference

### BrandHeader Component

**Props**:
```typescript
interface BrandHeaderProps {
  variant?: 'full' | 'icon-only' | 'text-only';  // Logo style
  size?: 'small' | 'medium' | 'large';            // Logo size
  style?: ViewStyle;                               // Custom styles
}
```

**Sizes**:
- `small`: 80x40px (headers, navigation)
- `medium`: 120x60px (cards, sections)
- `large`: 160x80px (splash screens, hero sections)

**Usage Examples**:

```tsx
// In header navigation
<BrandHeader variant="full" size="small" />

// In a hero section
<BrandHeader variant="full" size="large" style={{ marginVertical: 20 }} />

// As an icon-only logo
<BrandHeader variant="icon-only" size="medium" />
```

### LoadingModal Component

**Props**:
```typescript
interface LoadingModalProps {
  visible: boolean;              // Show/hide modal
  message?: string;              // Loading message text
  isFullScreen?: boolean;        // True = full screen, False = centered box
}
```

**Global Usage** (via context):
```tsx
import { useLoading } from '@contexts/LoadingContext';

const { showLoading, hideLoading, setLoadingMessage } = useLoading();

// Show loading
showLoading('Transferring funds...');

// Update message
setLoadingMessage('Processing payment...');

// Hide loading
hideLoading();
```

### SplashScreen Component

**Props**:
```typescript
interface SplashScreenProps {
  onComplete: () => void;  // Callback when splash completes
  duration?: number;       // Auto-hide duration (default: 2500ms)
}
```

**Current Setup**: Managed automatically by `AppProviders.tsx`

---

## Logo Placement Checklist

### ✅ Completed
- [x] Splash screen with logo (2.5s auto-dismiss)
- [x] Loading modal with logo (global via context)
- [x] Home screen header logo
- [x] Branding components created
- [x] Global loading context setup
- [x] App providers configured

### 📋 Recommended Future Placements
- [ ] Login/Signup screen header
- [ ] Settings/Profile screen header
- [ ] Transaction detail screens
- [ ] Empty state illustrations
- [ ] Error state displays
- [ ] Navigation bar icon (small logo)
- [ ] Rewards screen header
- [ ] Transfers screen header

---

## Adding Logo to New Screens

### Step 1: Import Component
```tsx
import { BrandHeader } from '@components/BrandHeader';
```

### Step 2: Add to JSX
```tsx
return (
  <View style={styles.container}>
    {/* Add logo header */}
    <BrandHeader variant="full" size="small" style={{ marginBottom: 16 }} />
    
    {/* Rest of screen content */}
  </View>
);
```

### Step 3: Add to Stylesheet (Optional)
```typescript
const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: SPACING[4],
    paddingTop: SPACING[3],
  },
});
```

---

## Dark Mode Support

The branding components automatically adapt to dark mode:

### Colored Logo (Current Default)
- Uses `#235393` (Brand Navy) - visible on both light and dark
- Uses `#FAB915` (Brand Yellow) - visible on both light and dark
- Uses `#60BA46` (Brand Green) - visible on both light and dark

### For Dark Mode Specific Screens
Use the white logo:
```tsx
// In a dark mode screen, use:
<Image
  source={require('@assets/logos/shopsavvy-white.png')}
  style={{ width: 120, height: 60 }}
/>
```

---

## API for Loading States

The global loading modal is available throughout the app via context:

### Show Loading During API Calls
```tsx
import { useLoading } from '@contexts/LoadingContext';

function TransfersScreen() {
  const { showLoading, hideLoading } = useLoading();
  
  const submitTransfer = async () => {
    showLoading('Processing transfer...');
    try {
      await dataService.submitTransfer(transferData);
      Alert.alert('Success', 'Transfer completed');
    } catch (error) {
      Alert.alert('Error', 'Transfer failed');
    } finally {
      hideLoading();
    }
  };
  
  return <Button onPress={submitTransfer}>Send</Button>;
}
```

### Show Loading with Custom Message
```tsx
const { showLoading, setLoadingMessage } = useLoading();

showLoading('Verifying payment method...');
// Later:
setLoadingMessage('Processing transfer...');
// Later:
setLoadingMessage('Confirming transaction...');
// Finally:
hideLoading();
```

---

## File Paths Reference

### Components
- **Splash Screen**: `src/components/SplashScreen.tsx`
- **Loading Modal**: `src/components/LoadingModal.tsx`
- **Brand Header**: `src/components/BrandHeader.tsx`
- **Component Exports**: `src/components/index.ts`

### Contexts
- **Loading Context**: `src/contexts/LoadingContext.tsx`

### Providers
- **App Providers**: `src/app/providers/AppProviders.tsx`

### Assets
- **Logo Folder**: `assets/logos/`
- **Logo Files**: 
  - `assets/logos/shopsavvy-colored.png`
  - `assets/logos/shopsavvy-white.png`
  - `assets/logos/shopsavvy-black.png`

### Active Usage
- **Home Screen**: `src/features/home/screens/HomeScreen.tsx` (includes BrandHeader)

---

## Testing Checklist

- [ ] Splash screen appears for 2.5 seconds on app launch
- [ ] Splash screen auto-dismisses and shows app
- [ ] Loading modal appears when fetching data
- [ ] Logo displays correctly in splash screen
- [ ] Logo displays correctly in loading modal
- [ ] Logo displays correctly in HomeScreen header
- [ ] Loading context works globally
- [ ] Dark mode doesn't break logo display
- [ ] All logo variants render at correct sizes
- [ ] No console errors related to image loading

---

## Image Files Status

### ⚠️ PNG Files Need to Be Added

The three PNG files are not yet in the repository. To complete the setup:

1. **Obtain the PNG files**:
   - `shopsavvy-colored.png` (navy + yellow/green logo)
   - `shopsavvy-white.png` (white/outline logo)
   - `shopsavvy-black.png` (black logo)

2. **Place them in**:
   ```
   assets/logos/
   ├── shopsavvy-colored.png
   ├── shopsavvy-white.png
   └── shopsavvy-black.png
   ```

3. **No code changes needed** - All components are already configured to use these files

---

## Troubleshooting

### Logo Not Showing
1. Check that PNG files are in `assets/logos/` with correct names
2. Verify file paths in components match the import paths
3. Clear cache: `npm start -- --clear`

### Splash Screen Doesn't Appear
1. Check `AppProviders.tsx` has SplashScreen component
2. Verify splash screen duration (default: 2500ms)
3. Check that navigation isn't interfering

### Loading Modal Not Working
1. Ensure `LoadingProvider` wraps your app (already done in AppProviders)
2. Use hook inside wrapped components: `useLoading()`
3. Call `showLoading()` and `hideLoading()` appropriately

### Images Blurry/Distorted
1. Use correct PNG files with proper resolution
2. Adjust width/height to maintain aspect ratio
3. Use `resizeMode: 'contain'` for proper scaling

---

## Next Steps

1. **Add PNG Files**: Place the three logo PNG files in `assets/logos/`
2. **Test Splash Screen**: Launch app and verify 2.5 second splash
3. **Test Loading Modal**: Trigger an API call and verify modal appears
4. **Add to More Screens**: Use the checklist above to add logos to other screens
5. **Refinement**: Adjust sizes/placement as needed per design

---

## Summary

✅ **Implemented**:
- Splash screen component with animated logo
- Loading modal component with spinner and logo
- Brand header component for reusable logo display
- Global loading context for app-wide loading state
- Home screen integration with logo header
- Full dark mode support

📋 **Pending**:
- PNG image files placement in `assets/logos/`
- Logo integration to additional screens (Auth, Transfers, Rewards, etc.)

**Status**: Code-complete and ready for image file addition and testing
