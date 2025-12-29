# SwipeSavvy Branding Guide

**Version**: 1.0  
**Last Updated**: December 2025  
**Status**: Active  

---

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Iconography](#iconography)
6. [Component Library](#component-library)
7. [Motion & Animation](#motion--animation)
8. [Dark Mode](#dark-mode)
9. [Usage Guidelines](#usage-guidelines)
10. [Implementation Examples](#implementation-examples)

---

## Brand Overview

### Brand Identity
**SwipeSavvy** is a modern, fintech-focused mobile wallet application designed with a sleek, tech-forward aesthetic. The brand emphasizes trust, simplicity, and accessibility with a sophisticated color palette and clean design language.

### Core Values
- **Modern**: Contemporary design with cutting-edge UX
- **Trustworthy**: Professional color palette and polished components
- **Accessible**: Clear typography, high contrast ratios
- **Efficient**: Minimal design with maximum functionality
- **Innovative**: Dynamic interactions and smooth animations

### Design Philosophy
SwipeSavvy uses a **minimalist design system** with:
- Glassmorphic elements for depth without clutter
- Generous whitespace for clarity
- Consistent spacing and alignment
- Smooth animations for interactive feedback
- Support for both light and dark modes

---

## Color System

### Primary Brand Colors

All color values are stored in `src/design-system/theme.ts`

#### Navy (Primary Brand Color)
- **Hex**: `#235393`
- **Name**: Brand Navy
- **Usage**: Primary buttons, navigation, key UI elements
- **Psychology**: Trust, stability, professionalism
- **RGB**: (35, 83, 147)

#### Deep Navy (Secondary Brand Color)
- **Hex**: `#132136`
- **Name**: Deep Navy / Brand Deep
- **Usage**: Text, dark theme backgrounds, high contrast elements
- **Psychology**: Authority, depth
- **RGB**: (19, 33, 54)

#### Brand Green (Accent - Success)
- **Hex**: `#60BA46`
- **Name**: Brand Green
- **Usage**: Success states, positive actions, completed transactions
- **Psychology**: Growth, approval, positivity
- **RGB**: (96, 186, 70)

#### Brand Yellow (Accent - Warning)
- **Hex**: `#FAB915`
- **Name**: Brand Yellow
- **Usage**: Warning alerts, pending states, calls-to-action
- **Psychology**: Attention, caution, optimism
- **RGB**: (250, 185, 21)

### Neutral Color Palette (Light Theme)

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `bg` | `#F6F6F6` | Page backgrounds, large surfaces |
| `panelSolid` | `#FFFFFF` | Card backgrounds, solid panels |
| `panel` | `rgba(255,255,255,0.82)` | Semi-transparent panels, glass effect |
| `panel2` | `rgba(255,255,255,0.65)` | Secondary panels, less prominent surfaces |
| `stroke` | `rgba(19,33,54,0.12)` | Borders, dividers, subtle lines |
| `text` | `#132136` | Primary text, high contrast |
| `muted` | `rgba(19,33,54,0.62)` | Secondary text, 62% opacity |
| `muted2` | `rgba(19,33,54,0.45)` | Tertiary text, low emphasis (45% opacity) |

### Ghost Backgrounds (Subtle Color Tints)

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `ghost` | `rgba(35,83,147,0.06)` | Subtle navy background (6% opacity) |
| `ghost2` | `rgba(35,83,147,0.10)` | Medium navy background (10% opacity) |

### Status Colors (Light Theme)

| Status | Color | Hex Value | Usage |
|--------|-------|-----------|-------|
| Success | Green | `#60BA46` | Approved transactions, success confirmations |
| Success BG | Green | `rgba(96,186,70,0.14)` | Success message backgrounds |
| Danger | Red | `#D64545` | Errors, failed transactions, destructive actions |
| Warning | Yellow | `#FAB915` | Alerts, pending states, important notices |
| Warning BG | Yellow | `rgba(250,185,21,0.16)` | Warning message backgrounds |

### Color Usage Rules

**Primary Actions**
- Use `#235393` (Brand Navy) for main CTAs
- Use `#60BA46` (Brand Green) for confirmations
- Use `#FAB915` (Brand Yellow) for secondary actions

**Text Hierarchy**
- Primary text: `#132136` (100% opacity)
- Secondary text: `rgba(19,33,54,0.62)` (62% opacity)
- Tertiary text: `rgba(19,33,54,0.45)` (45% opacity)

**Backgrounds**
- Large surfaces: `#F6F6F6` (light gray)
- Cards/Panels: `#FFFFFF` or `rgba(255,255,255,0.82)`
- Accent backgrounds: Use ghost colors at 6-10% opacity

---

## Typography

### Font Family

**Primary Font Stack**
```
ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif
```

**Monospace Font Stack** (for code, values)
```
ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
```

### Font Sizes

| Level | Size (dp) | Usage |
|-------|-----------|-------|
| Heading 1 (h1) | 28 | Page titles, hero content |
| Heading 2 (h2) | 18 | Section headers, card titles |
| Heading 3 (h3) | 15 | Subsection headers |
| Body | 14 | Standard body text, descriptions |
| Meta/Small | 12 | Captions, timestamps, secondary info |

### Font Weights

| Weight | Value | Name | Usage |
|--------|-------|------|-------|
| Regular | 400 | Regular | Body text, standard content |
| Medium | 500 | Medium | Slightly emphasized text |
| Semibold | 600 | Semibold | Button text, table headers |
| Bold | 700 | Bold | Section headers |
| Extrabold | 800 | Extrabold | Hero titles, brand headers |

### Line Heights

| Level | Value | Usage |
|-------|-------|-------|
| Tight | 1.1 | Titles, headlines |
| Normal | 1.45 | Body text, standard content |
| Relaxed | 1.55 | Long-form text, descriptions |

### Typography Examples

**Heading 1** - Page Title
- Font Size: 28px
- Font Weight: 700 (Bold)
- Line Height: 1.1
- Color: `#132136`
- Example: "Welcome to SwipeSavvy"

**Heading 2** - Section Header
- Font Size: 18px
- Font Weight: 600 (Semibold)
- Line Height: 1.1
- Color: `#132136`
- Example: "Recent Transactions"

**Body Text** - Standard Content
- Font Size: 14px
- Font Weight: 400 (Regular)
- Line Height: 1.45
- Color: `#132136` or `rgba(19,33,54,0.62)`
- Example: "Transfer $500 to savings account"

**Meta Text** - Secondary Information
- Font Size: 12px
- Font Weight: 400 (Regular)
- Line Height: 1.45
- Color: `rgba(19,33,54,0.62)` (muted)
- Example: "2 hours ago"

---

## Spacing & Layout

### Spacing Scale (4dp baseline)

SwipeSavvy uses a **4dp (density-independent pixel) baseline** for consistent spacing throughout the app.

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-0` | 0px | No spacing |
| `spacing-1` | 4px | Minimal gaps, micro spacing |
| `spacing-2` | 8px | Tight spacing between elements |
| `spacing-3` | 12px | Compact spacing |
| `spacing-4` | 16px | Default padding, standard spacing |
| `spacing-5` | 20px | Medium spacing |
| `spacing-6` | 24px | Comfortable spacing |
| `spacing-7` | 32px | Section spacing |
| `spacing-8` | 40px | Large spacing |
| `spacing-9` | 48px | Extra large spacing |
| `spacing-10` | 56px | Maximum spacing |

### Spacing Usage Examples

**Card Padding**
- Default: `spacing-4` (16px)
- Compact: `spacing-3` (12px)
- Spacious: `spacing-6` (24px)

**Margin Between Sections**
- Small gap: `spacing-4` (16px)
- Medium gap: `spacing-6` (24px)
- Large gap: `spacing-7` (32px)

**Button Padding**
- Vertical: `spacing-2` (8px)
- Horizontal: `spacing-3` (12px)
- Minimum tap target: 44px × 44px

### Layout Dimensions

| Property | Value | Purpose |
|----------|-------|---------|
| Phone Max Width | 420px | Maximum content width |
| Safe Area Padding | 16px | Edge margins on all devices |

---

## Border Radius

All border radius values create smooth, friendly corners appropriate for a fintech app.

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 10px | Subtle rounding, inputs |
| `radius-md` | 14px | Standard rounding, avatars |
| `radius-lg` | 18px | Card corners, larger components |
| `radius-xl` | 24px | Large card radius, modal borders |
| `radius-pill` | 999px | Fully rounded buttons, badges |

### Radius Usage Rules

- **Small components** (avatars, icons): `radius-md` (14px)
- **Cards, panels**: `radius-xl` (24px)
- **Buttons**: `radius-pill` (999px for fully rounded)
- **Input fields**: `radius-sm` to `radius-md` (10-14px)
- **Modals**: `radius-xl` (24px)

---

## Shadow System

SwipeSavvy uses shadows for elevation and depth without being heavy-handed.

### Standard Shadows

| Token | CSS Value | Elevation | Usage |
|-------|-----------|-----------|-------|
| `shadow1` | `0 1px 1px rgba(0,0,0,.06), 0 10px 30px rgba(0,0,0,.06)` | 1 | Subtle depth |
| `shadow2` | `0 2px 2px rgba(0,0,0,.08), 0 18px 60px rgba(0,0,0,.12)` | 2 | Medium depth |

### Elevation Shadows (Detailed)

| Level | CSS Value | Usage |
|-------|-----------|-------|
| Elevation 1 | `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)` | Slightly raised elements |
| Elevation 2 | `0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)` | Raised cards, buttons |
| Elevation 3 | `0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)` | Floating modals |
| Elevation 4 | `0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)` | Dropdowns, overlays |

### Shadow Usage

- **Flat/Subtle**: `shadow1` - Most common for cards
- **Medium**: `shadow2` - Modal dialogs, elevated panels
- **Interactive**: Use shadows on touch/focus states

---

## Component Library

### Existing Core Components

All components are located in `src/design-system/components/CoreComponents.tsx`

#### 1. Card Component

**Props**
```typescript
interface CardProps {
  children: React.ReactNode;
  padding?: number;        // Defaults to spacing-4 (16px)
  style?: ViewStyle;       // Custom styles
}
```

**Styling**
- Background: `panelSolid` (#FFFFFF)
- Border: 1px solid `stroke`
- Border Radius: `radius-xl` (24px)
- Shadow: `shadow1`

**Usage**
```tsx
<Card padding={SPACING[4]}>
  <Text>Card content</Text>
</Card>
```

**When to Use**
- Content containers
- Transaction items
- List items
- Grouped information

---

#### 2. Button Component

**Props**
```typescript
interface ButtonProps {
  onPress?: () => void;                      // Press handler
  children: React.ReactNode;                 // Button label
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle | ViewStyle[];           // Custom styles
  disabled?: boolean;                        // Disabled state
}
```

**Variants**

**Primary Button**
- Background: `#235393` (Brand Navy)
- Text Color: White
- Usage: Main actions, submissions
- Disabled Opacity: 0.5

**Secondary Button**
- Background: `panel2` (semi-transparent white)
- Border: 1px solid `stroke`
- Text Color: `text` (navy)
- Usage: Alternative actions, less prominent
- Disabled Opacity: 0.5

**Ghost Button**
- Background: Transparent
- Text Color: `text` (navy)
- Usage: Tertiary actions, minimal emphasis
- Disabled Opacity: 0.5

**Sizing**
- Padding Vertical: `spacing-2` (8px)
- Padding Horizontal: `spacing-3` (12px)
- Border Radius: `radius-pill` (999px)
- Minimum Height: 44px (touch target)

**Usage**
```tsx
<Button variant="primary" onPress={() => submit()}>
  Send Money
</Button>

<Button variant="secondary">Cancel</Button>

<Button variant="ghost" disabled>Learn More</Button>
```

---

#### 3. Avatar Component

**Props**
```typescript
interface AvatarProps {
  initials: string;       // 1-2 character initials
  size?: number;          // Defaults to 40px
  style?: ViewStyle;      // Custom styles
}
```

**Styling**
- Background: `#235393` (Brand Navy)
- Border Radius: `radius-md` (14px)
- Text Color: White
- Text Alignment: Center

**Sizes**
- Small: 32px
- Default: 40px
- Large: 56px

**Usage**
```tsx
<Avatar initials="JD" size={40} />
```

**When to Use**
- User profiles
- Contact representation
- Recipient indicators
- Team member identification

---

### Component Extension Guidelines

When adding new components to the library:

1. **Location**: Add to `src/design-system/components/`
2. **Design System Integration**
   - Import theme tokens from `src/design-system/theme.ts`
   - Use `SPACING`, `RADIUS`, `TYPOGRAPHY` constants
   - Follow color system for backgrounds and text
3. **TypeScript**
   - Define explicit interfaces for all props
   - Use proper type annotations
   - Support optional styling overrides
4. **Accessibility**
   - Ensure minimum 44px touch targets
   - Maintain color contrast ratios (4.5:1 for WCAG AA)
   - Use semantic prop naming
5. **Consistency**
   - Follow naming conventions (PascalCase)
   - Maintain consistent spacing patterns
   - Use established shadow and radius tokens
   - Support both light and dark themes

---

## Motion & Animation

### Animation Timing

| Duration | Value | Usage |
|----------|-------|-------|
| Fast | 150ms | Micro interactions, hover effects |
| Normal | 180ms | Standard transitions, state changes |
| Slow | 260ms | Modal entrances, complex animations |

### Animation Easing

**Standard Easing Function**
```
cubic-bezier(0.2, 0.8, 0.2, 1)
```

This creates a natural, snappy feel with slight overshoot.

### Animation Guidelines

**Recommended Uses**
- Button press feedback (fast, 150ms)
- Screen transitions (normal, 180ms)
- Modal or bottom sheet entrance (slow, 260ms)
- State changes with visual feedback (normal, 180ms)

**Animation Best Practices**
- Keep animations under 300ms for UI responsiveness
- Use consistent easing across all transitions
- Provide visual feedback on user interactions
- Avoid excessive animations that distract from content
- Use animations to guide user attention

### Common Animation Patterns

**Opacity Transition**
```
Duration: 150-180ms
Easing: cubic-bezier(0.2, 0.8, 0.2, 1)
Usage: Fading content in/out
```

**Scale Transition**
```
Duration: 150ms
Easing: cubic-bezier(0.2, 0.8, 0.2, 1)
Usage: Button press, expanding cards
```

**Slide Transition**
```
Duration: 180-260ms
Easing: cubic-bezier(0.2, 0.8, 0.2, 1)
Usage: Screen navigation, modal entrance
```

---

## Dark Mode

SwipeSavvy includes comprehensive dark mode support. All colors automatically adapt when dark mode is enabled.

### Dark Theme Color Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `bg` | `#F6F6F6` | `#0B111B` | Page background |
| `panelSolid` | `#FFFFFF` | `#121C2B` | Solid panel background |
| `panel` | `rgba(255,255,255,0.82)` | `rgba(19,33,54,0.62)` | Semi-transparent panel |
| `panel2` | `rgba(255,255,255,0.65)` | `rgba(19,33,54,0.46)` | Secondary panel |
| `text` | `#132136` | `rgba(246,246,246,0.92)` | Primary text (92% opacity) |
| `muted` | `rgba(19,33,54,0.62)` | `rgba(246,246,246,0.62)` | Secondary text |
| `muted2` | `rgba(19,33,54,0.45)` | `rgba(246,246,246,0.44)` | Tertiary text |
| `danger` | `#D64545` | `#FF6B6B` | Error color (brighter in dark) |

### Dark Mode Features

- All brand colors remain consistent
- Backgrounds use darker, lower-opacity navy
- Text uses light colors for contrast
- Status colors adjusted for dark mode readability
- Navigation glass effect updated for dark backgrounds

### Dark Mode Usage

Dark mode preference is managed through:
- User settings (ProfileScreen toggle)
- System-level preferences
- Automatic detection on app launch

---

## Navigation Design

### Navigation Structure

The app uses **nested navigation** with:
- **Root Stack Navigator**: Main navigation container
- **Tab Navigator**: Bottom navigation with 4 primary sections
- **Modal Group**: Secondary screens (Rewards, Profile)

### Bottom Navigation Colors (Light Mode)

| Element | Color | Hex Value |
|---------|-------|-----------|
| Background | `navGlass` | `rgba(255,255,255,0.78)` |
| Active Icon | `brand` | `#235393` |
| Inactive Icon | `muted` | `rgba(19,33,54,0.55)` |
| Shadow | `navShadow` | `0 -12px 40px rgba(19,33,54,0.10)` |

### Status Bar Colors

- **Light Mode**: `rgba(255,255,255,0.55)`
- **Dark Mode**: `rgba(18,28,43,0.55)`

---

## Icon System

### Icon Standards

- **Icon Size**: 24x24dp (standard), 20x20dp (small), 28x28dp (large)
- **Stroke Width**: 2dp (standard)
- **Color**: Matches text color based on state
- **Opacity**: See ICON_OPACITY values

### Icon Opacity States

| State | Opacity | Value |
|-------|---------|-------|
| Inactive | 55% | 0.55 |
| Active | 100% | 1.0 |

### Icon Colors

- **Active/Primary**: Brand Navy (`#235393`)
- **Inactive**: Muted (`rgba(19,33,54,0.55)`)
- **Success**: Brand Green (`#60BA46`)
- **Warning**: Brand Yellow (`#FAB915`)
- **Error**: Danger Red (`#D64545` or `#FF6B6B`)

### Icon Usage Rules

- Use consistent icon set across app
- Pair icons with labels in navigation
- Icons should be self-explanatory
- Maintain consistent stroke weight
- Scale icons appropriately (never distort)

---

## Glass Morphism Effects

SwipeSavvy uses subtle glass morphism for modern depth:

### Navigation Glass Effect
```
Background: rgba(255,255,255,0.78) (light mode)
            rgba(18,28,43,0.72) (dark mode)
Backdrop Filter: Blur 14px
Shadow: 0 -12px 40px rgba(19,33,54,0.10)
```

### Panel Glass Effect
```
Background: rgba(255,255,255,0.82) (light mode)
            rgba(19,33,54,0.62) (dark mode)
Border: 1px solid stroke color
```

### Implementation

Glass effects use:
- Semi-transparent backgrounds
- Blur filters (14px standard)
- Subtle shadows for depth
- Strategic placement for visual hierarchy

---

## Contrast & Accessibility

### Minimum Contrast Ratios

| Element | Ratio | Standard |
|---------|-------|----------|
| Large text (18px+) | 3:1 | WCAG AA |
| Normal text | 4.5:1 | WCAG AA |
| Disabled text | 3:1 | WCAG AA |

### Touch Target Sizes

- **Minimum**: 44x44dp (buttons, icons)
- **Recommended**: 48x48dp (frequently used)
- **Spacing**: Minimum 8dp between targets

### Color Accessibility

- Never rely on color alone for information
- Provide text labels with icons
- Use text patterns for status indication
- Maintain sufficient contrast ratios
- Test with accessibility tools regularly

---

## Usage Guidelines

### Do's ✅

- **Use consistent spacing** from the spacing scale
- **Apply brand colors** strategically (navy for primary, green for success, yellow for warnings)
- **Maintain typography hierarchy** using established font sizes and weights
- **Leverage component library** for consistency
- **Support dark mode** in all new features
- **Test accessibility** with screen readers and contrast checkers
- **Use proper touch targets** (minimum 44x44px)
- **Implement loading states** with consistent indicators
- **Provide visual feedback** on all interactions
- **Use meaningful icons** paired with labels

### Don'ts ❌

- **Don't introduce new colors** without design system approval
- **Don't mix font families** (stick to system sans-serif)
- **Don't break spacing scale** (use established spacing values)
- **Don't ignore dark mode** compatibility
- **Don't create tiny touch targets** (maintain 44px minimum)
- **Don't animate excessively** (keep animations under 300ms)
- **Don't use low-contrast text** (maintain 4.5:1 ratio)
- **Don't skip loading states** during async operations
- **Don't mix design patterns** (maintain consistency)
- **Don't create custom shadows** (use elevation system)

---

## Implementation Examples

### Example 1: Creating a Transaction Card

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  LIGHT_THEME,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  SHADOWS,
} from '@/design-system/theme';
import { Card } from '@/design-system/components/CoreComponents';

interface TransactionCardProps {
  merchant: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  merchant,
  amount,
  date,
  status,
}) => {
  const statusColor = {
    completed: LIGHT_THEME.brandGreen,
    pending: LIGHT_THEME.brandYellow,
    failed: LIGHT_THEME.danger,
  }[status];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
    },
    merchant: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: LIGHT_THEME.text,
      marginBottom: SPACING[1],
    },
    date: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    amount: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: statusColor,
    },
  });

  return (
    <Card padding={SPACING[4]}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.merchant}>{merchant}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
      </View>
    </Card>
  );
};
```

### Example 2: Creating a Form Input

```tsx
import React, { useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import {
  LIGHT_THEME,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
} from '@/design-system/theme';

interface FormInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const styles = StyleSheet.create({
    input: {
      borderRadius: RADIUS.md,
      paddingVertical: SPACING[3],
      paddingHorizontal: SPACING[4],
      fontSize: TYPOGRAPHY.fontSize.body,
      backgroundColor: LIGHT_THEME.panel,
      borderWidth: 1,
      borderColor: isFocused ? LIGHT_THEME.brand : LIGHT_THEME.stroke,
      color: LIGHT_THEME.text,
    },
  });

  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={LIGHT_THEME.muted2}
      value={value}
      onChangeText={onChangeText}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      secureTextEntry={secureTextEntry}
    />
  );
};
```

### Example 3: Creating a Status Badge

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  LIGHT_THEME,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
} from '@/design-system/theme';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'inactive' | 'alert';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
}) => {
  const statusConfig = {
    active: {
      bgColor: LIGHT_THEME.successBg,
      textColor: LIGHT_THEME.brandGreen,
    },
    pending: {
      bgColor: LIGHT_THEME.warningBg,
      textColor: LIGHT_THEME.brandYellow,
    },
    inactive: {
      bgColor: LIGHT_THEME.ghost,
      textColor: LIGHT_THEME.muted,
    },
    alert: {
      bgColor: 'rgba(214, 69, 69, 0.14)',
      textColor: LIGHT_THEME.danger,
    },
  }[status];

  const styles = StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      paddingVertical: SPACING[1],
      paddingHorizontal: SPACING[2],
      borderRadius: RADIUS.pill,
      backgroundColor: statusConfig.bgColor,
    },
    text: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
      color: statusConfig.textColor,
    },
  });

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};
```

---

## File Structure Reference

Design system files are organized as follows:

```
src/design-system/
├── theme.ts                          # All design tokens
├── components/
│   └── CoreComponents.tsx            # Base component library
```

### Token Export Reference

All tokens are exported from `src/design-system/theme.ts`:

```typescript
// Colors
export const BRAND_COLORS = { ... };
export const LIGHT_THEME = { ... };
export const DARK_THEME = { ... };

// Spacing
export const SPACING = { ... };

// Border Radius
export const RADIUS = { ... };

// Shadows
export const SHADOWS = { ... };

// Typography
export const TYPOGRAPHY = { ... };

// Animation
export const ANIMATION = { ... };

// Other
export const ICON_OPACITY = { ... };
export const LAYOUT = { ... };
```

### Usage in Components

```tsx
import {
  LIGHT_THEME,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
} from '@/design-system/theme';
```

---

## Maintenance & Evolution

### Updating the Design System

When making changes to the design system:

1. **Update tokens** in `src/design-system/theme.ts`
2. **Update component** styling if affected
3. **Test** in both light and dark modes
4. **Document** changes in this guide
5. **Bump version** number at top of this file
6. **Notify team** of breaking changes

### Adding New Features

For new features, follow this checklist:

- [ ] Use existing design tokens
- [ ] Follow spacing scale
- [ ] Implement dark mode support
- [ ] Ensure accessibility (contrast, touch targets)
- [ ] Use component library where possible
- [ ] Add TypeScript types
- [ ] Test on multiple devices
- [ ] Update documentation if needed

### Design Review Checklist

Before shipping new screens/components:

- [ ] Colors match brand palette
- [ ] Typography follows established hierarchy
- [ ] Spacing uses design system scale
- [ ] Border radius consistent with style
- [ ] Shadows applied appropriately
- [ ] Dark mode fully supported
- [ ] Accessible contrast ratios
- [ ] Touch targets minimum 44x44px
- [ ] Animations smooth and purposeful
- [ ] Icons consistent and properly sized

---

## Support & Questions

**Location**: `src/design-system/`  
**Owner**: Design Team  
**Last Updated**: December 2025  

For questions about the design system or to propose changes, refer to the design tokens in `theme.ts` or review component implementations in `CoreComponents.tsx`.

---

## Quick Reference Table

| Element | Token | Value |
|---------|-------|-------|
| **Primary Color** | `brand` | `#235393` |
| **Success Color** | `brandGreen` | `#60BA46` |
| **Warning Color** | `brandYellow` | `#FAB915` |
| **Text Primary** | `text` | `#132136` |
| **Background** | `bg` | `#F6F6F6` |
| **Default Padding** | `spacing-4` | 16px |
| **Card Radius** | `radius-xl` | 24px |
| **Button Radius** | `radius-pill` | 999px |
| **Standard Animation** | `duration.normal` | 180ms |
| **Body Font Size** | `fontSize.body` | 14px |
| **Heading Font Size** | `fontSize.h2` | 18px |

---

**END OF BRANDING GUIDE**
