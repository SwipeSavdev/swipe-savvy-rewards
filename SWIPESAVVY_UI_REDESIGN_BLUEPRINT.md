# SwipeSavvy UI/UX Redesign Blueprint
## Production-Ready Design System & Implementation Guide

**Version:** 2.0
**Date:** January 2026
**Prepared by:** Principal UI/UX Design Architect

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [UX Strategy Summary](#2-ux-strategy-summary)
3. [Design Tokens (Refined)](#3-design-tokens-refined)
4. [Component System](#4-component-system)
5. [Admin Portal Redesign](#5-admin-portal-redesign)
6. [Wallet Web Redesign](#6-wallet-web-redesign)
7. [UX Improvements Matrix](#7-ux-improvements-matrix)
8. [Frontend Handoff Notes](#8-frontend-handoff-notes)

---

## 1. Executive Summary

### Current State Analysis

After reviewing the existing codebase, the following issues were identified:

| Issue | Admin Portal | Wallet Web |
|-------|-------------|-----------|
| **Visual Density** | Overcrowded cards, thick borders | Moderate clutter |
| **Color Overuse** | Multiple competing gradients | Clean but inconsistent |
| **Shadow Heaviness** | Heavy box-shadows on every element | Appropriate |
| **Border Radius** | Over-rounded (24-32px everywhere) | Consistent |
| **Spacing** | Inconsistent padding/margins | Good baseline |
| **Typography Hierarchy** | Weak visual differentiation | Adequate |
| **Data Presentation** | Complex, overwhelming charts | N/A |

### Design Philosophy Shift

**FROM:** Heavy, decorative, gradient-heavy enterprise aesthetic
**TO:** Light, minimal, data-first fintech interface

**Core Principles:**
1. **Clarity Over Decoration** - Every element earns its place
2. **Breathing Room** - Generous whitespace, reduced cognitive load
3. **Subtle Depth** - Soft shadows, not heavy elevation
4. **Data First** - Information hierarchy drives layout
5. **Confident Restraint** - Calm color usage, no visual noise

---

## 2. UX Strategy Summary

### 2.1 Shared Design Language

Both applications share a **unified visual DNA** while serving different user needs:

```
┌────────────────────────────────────────────────────────────────┐
│                    SHARED FOUNDATION                          │
├────────────────────────────────────────────────────────────────┤
│  Typography: Barlow (body) + SF Pro Display (headings)        │
│  Color Palette: Navy/Green/Gold semantic system               │
│  Spacing Scale: 4px base unit                                 │
│  Border Radius: 8px default, 12px cards                       │
│  Shadows: Minimal, functional elevation only                  │
│  Icons: Lucide React (consistent 20px/24px sizing)           │
└────────────────────────────────────────────────────────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────────┐          ┌─────────────────────┐
│    ADMIN PORTAL     │          │     WALLET WEB      │
├─────────────────────┤          ├─────────────────────┤
│ • Data-dense tables │          │ • Card-based layout │
│ • Analytical charts │          │ • Action-oriented   │
│ • Multi-column views│          │ • Single-task focus │
│ • Neutral palette   │          │ • Warmer palette    │
│ • Efficiency-first  │          │ • Delight moments   │
└─────────────────────┘          └─────────────────────┘
```

### 2.2 UX Philosophy by Application

#### Admin Portal Philosophy
**User:** Operations team, executives, support staff
**Goal:** Fast scanning, efficient decision-making, zero friction

| Principle | Implementation |
|-----------|----------------|
| **Scannable** | Strong visual hierarchy with clear section breaks |
| **Dense but Clear** | Compact data presentation without overwhelm |
| **Actionable** | Primary actions always visible, secondary in context menus |
| **Trustworthy** | Professional, calm aesthetic that conveys stability |

#### Wallet Web Philosophy
**User:** End customers managing their finances
**Goal:** Confidence, clarity, quick task completion

| Principle | Implementation |
|-----------|----------------|
| **Reassuring** | Balance always visible, clear transaction states |
| **Simple** | One primary action per screen |
| **Delightful** | Subtle animations, rewarding interactions |
| **Accessible** | Large touch targets, clear contrast |

### 2.3 Complexity Reduction Strategy

**Before (Current):**
- 6+ colors competing per screen
- Heavy gradients on headers, cards, badges
- Thick borders (2-4px)
- Large border-radius (24-32px) making elements feel bulky
- Dense information without visual breathing room

**After (Redesigned):**
- 2-3 colors per screen + neutrals
- Single accent gradient (hero elements only)
- Hairline borders (1px) or borderless
- Moderate radius (8-12px) for refined look
- Strategic whitespace for scannability

---

## 3. Design Tokens (Refined)

### 3.1 Color System

```css
/* ═══════════════════════════════════════════════════════════════
   REFINED COLOR TOKENS - SwipeSavvy v2.0
   ═══════════════════════════════════════════════════════════════ */

:root {
  /* ─── Primary Brand ─── */
  --color-primary-50: #f0f4fa;
  --color-primary-100: #dce5f4;
  --color-primary-200: #b8cbe8;
  --color-primary-300: #8aa8d8;
  --color-primary-400: #5c85c8;
  --color-primary-500: #235393;  /* Brand Navy - PRIMARY */
  --color-primary-600: #1c4275;
  --color-primary-700: #153157;
  --color-primary-800: #0e213a;
  --color-primary-900: #07101d;

  /* ─── Success (Green) ─── */
  --color-success-50: #f0fdf4;
  --color-success-100: #dcfce7;
  --color-success-500: #60BA46;  /* Brand Green */
  --color-success-600: #4d9538;
  --color-success-700: #3a702a;

  /* ─── Warning (Gold) ─── */
  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #FAB915;  /* Brand Gold */
  --color-warning-600: #c89411;

  /* ─── Danger (Red) ─── */
  --color-danger-50: #fef2f2;
  --color-danger-100: #fee2e2;
  --color-danger-500: #E5484D;  /* Brand Red */
  --color-danger-600: #b73a3e;

  /* ─── Neutrals (Refined Gray Scale) ─── */
  --color-gray-25: #fcfcfd;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  /* ─── Semantic Aliases ─── */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-tertiary: var(--color-gray-400);
  --color-text-inverse: #ffffff;

  --color-bg-primary: #ffffff;
  --color-bg-secondary: var(--color-gray-50);
  --color-bg-tertiary: var(--color-gray-100);

  --color-border-light: var(--color-gray-200);
  --color-border-default: var(--color-gray-300);
  --color-border-strong: var(--color-gray-400);
}
```

### 3.2 Typography Scale

```css
:root {
  /* ─── Font Families ─── */
  --font-sans: 'Barlow', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'SF Pro Display', var(--font-sans);
  --font-mono: 'SF Mono', 'Fira Code', monospace;

  /* ─── Type Scale ─── */
  --text-xs: 0.75rem;     /* 12px - captions, badges */
  --text-sm: 0.875rem;    /* 14px - body small, labels */
  --text-base: 1rem;      /* 16px - body default */
  --text-lg: 1.125rem;    /* 18px - body large */
  --text-xl: 1.25rem;     /* 20px - heading 4 */
  --text-2xl: 1.5rem;     /* 24px - heading 3 */
  --text-3xl: 1.875rem;   /* 30px - heading 2 */
  --text-4xl: 2.25rem;    /* 36px - heading 1 */
  --text-5xl: 3rem;       /* 48px - display */

  /* ─── Line Heights ─── */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* ─── Font Weights ─── */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ─── Letter Spacing ─── */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}
```

### 3.3 Spacing System

```css
:root {
  /* ─── Base Unit: 4px ─── */
  --space-0: 0;
  --space-px: 1px;
  --space-0.5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1.5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2.5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-8: 2rem;        /* 32px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */

  /* ─── Component Spacing ─── */
  --card-padding: var(--space-5);        /* 20px - refined from 24px */
  --card-padding-lg: var(--space-6);     /* 24px */
  --section-gap: var(--space-6);         /* 24px between sections */
  --page-padding-x: var(--space-6);      /* 24px horizontal */
  --page-padding-y: var(--space-6);      /* 24px vertical */
  --input-padding-x: var(--space-3);     /* 12px */
  --input-padding-y: var(--space-2.5);   /* 10px */
}
```

### 3.4 Border Radius

```css
:root {
  /* ─── Radius Scale (Refined - Less Bulky) ─── */
  --radius-none: 0;
  --radius-sm: 4px;       /* Badges, small elements */
  --radius-md: 6px;       /* Buttons, inputs */
  --radius-lg: 8px;       /* Cards, dropdowns */
  --radius-xl: 12px;      /* Modals, large cards */
  --radius-2xl: 16px;     /* Hero sections only */
  --radius-full: 9999px;  /* Pills, avatars */
}
```

### 3.5 Shadows (Refined - Softer)

```css
:root {
  /* ─── Elevation Scale (Subtle) ─── */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);

  /* ─── Colored Shadows (Interaction States) ─── */
  --shadow-primary: 0 4px 14px 0 rgb(35 83 147 / 0.15);
  --shadow-success: 0 4px 14px 0 rgb(96 186 70 / 0.15);
  --shadow-danger: 0 4px 14px 0 rgb(229 72 77 / 0.15);

  /* ─── Focus Ring ─── */
  --ring-offset: 2px;
  --ring-width: 2px;
  --ring-color: rgb(35 83 147 / 0.4);
}
```

### 3.6 Motion & Transitions

```css
:root {
  /* ─── Durations ─── */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 200ms;
  --duration-slower: 300ms;

  /* ─── Easing ─── */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
```

---

## 4. Component System

### 4.1 Navigation Components

#### Sidebar (Admin Portal)

```
┌──────────────────────────────────────────────────────────────┐
│  BEFORE                    │  AFTER                          │
├──────────────────────────────────────────────────────────────┤
│  • 260px width             │  • 240px width (compact)        │
│  • Heavy gradient bg       │  • Solid white/gray-50 bg       │
│  • Thick dividers          │  • Subtle section headers       │
│  • Large icons (24px)      │  • 20px icons, tighter spacing  │
│  • Rounded item bg         │  • Left accent bar on active    │
│  • Shadow on container     │  • Borderless, clean edge       │
└──────────────────────────────────────────────────────────────┘
```

**Redesigned Sidebar Specification:**

```tsx
// Visual Structure
<aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen">
  {/* Logo Area - 64px height */}
  <div className="h-16 px-5 flex items-center border-b border-gray-100">
    <Logo className="h-8" />
  </div>

  {/* Navigation Groups */}
  <nav className="flex-1 overflow-y-auto py-4 px-3">
    {/* Group Label */}
    <span className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
      Main
    </span>

    {/* Nav Items */}
    <a className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive
        ? "bg-primary-50 text-primary-600 border-l-2 border-primary-500"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    )}>
      <Icon className="w-5 h-5" />
      <span>Dashboard</span>
    </a>
  </nav>

  {/* Footer */}
  <div className="p-4 border-t border-gray-100">
    <UserMenu />
  </div>
</aside>
```

**Do / Don't:**

| Do | Don't |
|----|----|
| Use left accent bar for active state | Use full background highlight |
| Keep icon + label alignment consistent | Mix icon sizes in nav |
| Use subtle hover states (bg-gray-50) | Use heavy shadows on hover |
| Group related items under headers | Flatten all items in single list |

---

#### Header (Top Bar)

```tsx
// Minimal Header - 64px height
<header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
  {/* Left: Breadcrumb or Page Title */}
  <div className="flex items-center gap-3">
    <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
    <span className="text-sm text-gray-400">/</span>
    <span className="text-sm text-gray-500">Overview</span>
  </div>

  {/* Right: Actions */}
  <div className="flex items-center gap-4">
    {/* Search */}
    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
      <Search className="w-5 h-5" />
    </button>

    {/* Notifications */}
    <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
      <Bell className="w-5 h-5" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
    </button>

    {/* Profile */}
    <AvatarMenu />
  </div>
</header>
```

---

### 4.2 Card Components

#### Standard Card

```tsx
// Base Card - Clean, minimal
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const cardVariants = {
  default: "bg-white border border-gray-200 rounded-lg",
  outlined: "bg-white border border-gray-300 rounded-lg",
  elevated: "bg-white rounded-lg shadow-sm",
  ghost: "bg-gray-50 rounded-lg"
};

const cardPadding = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6"
};

// Usage
<Card variant="default" padding="md" interactive>
  <CardHeader>
    <h3 className="text-base font-semibold text-gray-900">Card Title</h3>
    <p className="text-sm text-gray-500 mt-0.5">Supporting text</p>
  </CardHeader>
  <CardBody>{children}</CardBody>
  <CardFooter>{actions}</CardFooter>
</Card>
```

**Card Variants Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│  DEFAULT          │  OUTLINED         │  ELEVATED          │
│  ─────────────    │  ─────────────    │  ─────────────     │
│  │ Content   │    │  ┃ Content   ┃    │  ╭ Content   ╮     │
│  │           │    │  ┃           ┃    │  │           │     │
│  ─────────────    │  ─────────────    │  ╰───────────╯     │
│  1px gray-200     │  1px gray-300     │  shadow-sm         │
│  border           │  border           │  no border         │
└─────────────────────────────────────────────────────────────┘
```

---

#### Stat Card (KPI Display)

```tsx
// Refined Stat Card - Less Bulky
<div className="bg-white rounded-lg border border-gray-200 p-5">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">$284,739</p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="inline-flex items-center text-sm font-medium text-success-600">
          <TrendingUp className="w-4 h-4 mr-0.5" />
          12.5%
        </span>
        <span className="text-sm text-gray-400">vs last month</span>
      </div>
    </div>
    <div className="p-2.5 bg-primary-50 rounded-lg">
      <DollarSign className="w-5 h-5 text-primary-600" />
    </div>
  </div>
</div>
```

**Key Changes:**
- Reduced padding (p-5 from p-6)
- Smaller icon container (p-2.5 from p-3)
- Removed gradient backgrounds
- Subtle icon background tint

---

### 4.3 Data Display Components

#### Tables

```tsx
// Clean Data Table
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="bg-gray-50 border-b border-gray-200">
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Name
        </th>
        {/* ... */}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3.5 text-sm text-gray-900">
          {content}
        </td>
        {/* ... */}
      </tr>
    </tbody>
  </table>
</div>
```

**Table Guidelines:**

| Element | Specification |
|---------|---------------|
| Header bg | `bg-gray-50` (not gradient) |
| Header text | `text-xs uppercase tracking-wider text-gray-500` |
| Row height | 52px minimum (py-3.5) |
| Row hover | `bg-gray-50` (subtle) |
| Dividers | `divide-gray-100` (very light) |
| Actions column | Icon buttons only, no text |

---

#### Badges

```tsx
const badgeVariants = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-50 text-success-700",
  warning: "bg-warning-50 text-warning-700",
  danger: "bg-danger-50 text-danger-700",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

// Usage
<span className={cn(
  "inline-flex items-center font-medium rounded-md",
  badgeVariants.success,
  badgeSizes.sm
)}>
  Active
</span>
```

**Badge Rules:**
- Use soft backgrounds (50-level tints)
- Keep text readable (700-level for text)
- Avoid pill shape for status badges
- Reserve full-rounded for counts only

---

### 4.4 Form Components

#### Input Fields

```tsx
// Text Input - Clean
<div className="space-y-1.5">
  <label className="block text-sm font-medium text-gray-700">
    Email address
  </label>
  <input
    type="email"
    className={cn(
      "w-full px-3 py-2.5 rounded-md border transition-colors",
      "text-sm text-gray-900 placeholder:text-gray-400",
      "border-gray-300 hover:border-gray-400",
      "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
      "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
    )}
    placeholder="you@example.com"
  />
  <p className="text-sm text-gray-500">We'll never share your email.</p>
</div>
```

**Input States:**

| State | Border | Background | Ring |
|-------|--------|------------|------|
| Default | gray-300 | white | none |
| Hover | gray-400 | white | none |
| Focus | primary-500 | white | primary-500/20 |
| Error | danger-500 | danger-50 | danger-500/20 |
| Disabled | gray-200 | gray-50 | none |

---

#### Buttons

```tsx
const buttonVariants = {
  primary: cn(
    "bg-primary-600 text-white",
    "hover:bg-primary-700",
    "active:bg-primary-800",
    "focus-visible:ring-2 focus-visible:ring-primary-500/50"
  ),
  secondary: cn(
    "bg-white text-gray-700 border border-gray-300",
    "hover:bg-gray-50 hover:border-gray-400",
    "active:bg-gray-100"
  ),
  ghost: cn(
    "bg-transparent text-gray-600",
    "hover:bg-gray-100 hover:text-gray-900"
  ),
  danger: cn(
    "bg-danger-600 text-white",
    "hover:bg-danger-700"
  )
};

const buttonSizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2"
};

// Base button styles
<button className={cn(
  "inline-flex items-center justify-center font-medium rounded-md transition-colors",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  buttonVariants.primary,
  buttonSizes.md
)}>
  <Icon className="w-4 h-4" />
  Button Label
</button>
```

---

### 4.5 Feedback Components

#### Alerts

```tsx
const alertVariants = {
  info: "bg-primary-50 border-primary-200 text-primary-800",
  success: "bg-success-50 border-success-200 text-success-800",
  warning: "bg-warning-50 border-warning-200 text-warning-800",
  error: "bg-danger-50 border-danger-200 text-danger-800"
};

<div className={cn(
  "p-4 rounded-lg border flex gap-3",
  alertVariants.warning
)}>
  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
  <div>
    <h4 className="font-medium">Attention needed</h4>
    <p className="text-sm mt-1 opacity-90">
      Your account requires verification.
    </p>
  </div>
</div>
```

---

#### Toast Notifications

```tsx
// Positioned: bottom-right, 16px from edge
<div className={cn(
  "fixed bottom-4 right-4 z-50",
  "w-80 p-4 rounded-lg shadow-lg",
  "bg-white border border-gray-200",
  "animate-slide-up"
)}>
  <div className="flex gap-3">
    <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
    <div className="flex-1">
      <p className="font-medium text-gray-900">Success!</p>
      <p className="text-sm text-gray-500 mt-0.5">Changes saved.</p>
    </div>
    <button className="text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  </div>
</div>
```

---

### 4.6 Empty, Loading, and Error States

#### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="p-4 bg-gray-100 rounded-full mb-4">
    <Inbox className="w-8 h-8 text-gray-400" />
  </div>
  <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
  <p className="text-sm text-gray-500 mt-1 max-w-sm">
    When you make your first transaction, it will appear here.
  </p>
  <button className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
    <Plus className="w-4 h-4" />
    Add Transaction
  </button>
</div>
```

#### Skeleton Loading

```tsx
// Card Skeleton
<div className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
  <div className="flex justify-between">
    <div className="space-y-2">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-7 w-32 bg-gray-200 rounded" />
    </div>
    <div className="h-10 w-10 bg-gray-200 rounded-lg" />
  </div>
</div>
```

#### Error State

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="p-4 bg-danger-50 rounded-full mb-4">
    <AlertCircle className="w-8 h-8 text-danger-500" />
  </div>
  <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
  <p className="text-sm text-gray-500 mt-1 max-w-sm">
    We couldn't load this data. Please try again.
  </p>
  <button className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
    <RefreshCw className="w-4 h-4" />
    Retry
  </button>
</div>
```

---

## 5. Admin Portal Redesign

### 5.1 Page Structure Overview

```
┌────────────────────────────────────────────────────────────────────┐
│ ADMIN PORTAL INFORMATION ARCHITECTURE                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  MAIN NAVIGATION                                                   │
│  ├── Dashboard (Overview)                                          │
│  │   └── KPI Cards, Activity Feed, Quick Charts                   │
│  │                                                                 │
│  ├── Analytics                                                     │
│  │   ├── Overview                                                  │
│  │   └── Risk Reports                                             │
│  │                                                                 │
│  ├── Users                                                         │
│  │   └── User Management (List, Detail, Actions)                  │
│  │                                                                 │
│  ├── Merchants                                                     │
│  │   └── Merchant Network (List, Onboarding, Detail)             │
│  │                                                                 │
│  ├── Support                                                       │
│  │   ├── Dashboard (Metrics)                                      │
│  │   ├── Tickets (Triage Queue)                                   │
│  │   └── AI Concierge                                             │
│  │                                                                 │
│  ├── Administration                                                │
│  │   ├── Admin Users                                              │
│  │   ├── Roles & Permissions                                      │
│  │   ├── Policies                                                 │
│  │   └── Audit Logs                                               │
│  │                                                                 │
│  └── Settings                                                      │
│      ├── General                                                   │
│      └── Feature Flags                                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 5.2 Dashboard Page Redesign

**Layout Strategy:** 4-column grid, 24px gap

```
┌──────────────────────────────────────────────────────────────────┐
│  Dashboard                                              [Refresh] │
│  Platform health and recent activity                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │  Revenue    │ │  Users      │ │ Transactions │ │  Growth     │ │
│  │  $284,739   │ │  18.4K      │ │  142.8K      │ │  23.8%      │ │
│  │  ↑ 12.5%    │ │  ↑ 8.2%     │ │  ↓ 2.1%      │ │  ↑ 4.3%     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                   │
│  ┌────────────────────────────────┐ ┌────────────────────────────┐│
│  │  Transaction Volume            │ │  Revenue Trend             ││
│  │  [Area Chart]                  │ │  [Line Chart]              ││
│  │                                │ │                            ││
│  │                                │ │                            ││
│  └────────────────────────────────┘ └────────────────────────────┘│
│                                                                   │
│  ┌────────────────────────────────────────────────────────────────┤
│  │  Recent Activity                                    [View All] │
│  │  ─────────────────────────────────────────────────────────────│
│  │  • New merchant onboarded        TechStore Inc.    2 min ago  │
│  │  • High-value txn flagged        #TXN-892341       1 hour ago │
│  │  • System health check passed    All services      2 hours    │
│  └────────────────────────────────────────────────────────────────┘
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
1. Simplified header - just title + action
2. Stat cards in clean row with minimal decoration
3. Charts use soft fills, no heavy shadows
4. Activity list uses simple rows, no card wrapping

---

### 5.3 Support Tickets Page Redesign

**Layout Strategy:** Filterable table with severity-based visual indicators

```
┌──────────────────────────────────────────────────────────────────┐
│  Support Tickets                                     [+ New Ticket]│
│  Manage and triage customer support requests                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │  Open    │ │ In Prog  │ │ Critical │ │ Avg Time │             │
│  │   47     │ │   23     │ │    5     │ │  2.4 hrs │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────────┤
│  │ [Search...                    ] [Severity ▼] [Status ▼] [Type]│
│  ├────────────────────────────────────────────────────────────────┤
│  │ ● │ #TKT-001 │ Mobile wallet issue │ Critical │ Open │ 15 min │
│  │ ● │ #TKT-002 │ Login problem       │ High     │ Open │ 1 hr   │
│  │ ○ │ #TKT-003 │ Feature request     │ Low      │ Pending│ 24 hr │
│  │ ○ │ #TKT-004 │ Bug report          │ Medium   │ Resolved│ 4 hr │
│  └────────────────────────────────────────────────────────────────┘
│                                                                   │
│  ← 1 2 3 ... 12 →                                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Severity Visual System:**

| Severity | Indicator | Badge Style | Row Treatment |
|----------|-----------|-------------|---------------|
| Critical | Red dot (animated pulse) | bg-danger-50 text-danger-700 | Left red border accent |
| High | Orange dot | bg-warning-50 text-warning-700 | None |
| Medium | Blue dot | bg-primary-50 text-primary-700 | None |
| Low | Gray dot | bg-gray-100 text-gray-600 | None |

---

### 5.4 Analytics Page Redesign

**Layout Strategy:** KPI row + 2x2 chart grid

```
┌──────────────────────────────────────────────────────────────────┐
│  Analytics                                      [Export] [Refresh]│
│  Platform performance metrics and insights                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Period: [This Month ▼]    Compare: [Last Month ▼]               │
│                                                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │  Revenue    │ │  GMV        │ │  Users      │ │  Merchants  │ │
│  │  $67.2K     │ │  $1.2M      │ │  1,150      │ │  89         │ │
│  │  ↑ 18.5%    │ │  ↑ 12.3%    │ │  ↑ 9.2%     │ │  ↑ 5        │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Revenue Trend                                              │ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │            ╱╲    ╱╲                                      ││ │
│  │  │     ╱─────╱  ╲──╱  ╲────╱╲───────                       ││ │
│  │  │────╱                       ╲───                          ││ │
│  │  │ Jan  Feb  Mar  Apr  May  Jun                             ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────┐  ┌────────────────────────────────┐  │
│  │  Transaction Types     │  │  Top Merchants                 │  │
│  │  [Donut Chart]         │  │  [Bar Chart]                   │  │
│  └────────────────────────┘  └────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Chart Styling Guidelines:**

- **Colors:** Use muted brand palette
  - Primary line: `#235393` (navy)
  - Secondary: `#60BA46` (green)
  - Accent: `#FAB915` (gold)
- **Grid:** Subtle `#e5e7eb` with 3-3 dashed pattern
- **Labels:** `text-xs text-gray-500`
- **Tooltips:** White bg, subtle shadow, 8px radius

---

### 5.5 User Management Page Redesign

**Layout Strategy:** Tabbed interface with contextual actions

```
┌──────────────────────────────────────────────────────────────────┐
│  User Management                                   [+ Invite User]│
│  Manage platform users, roles, and permissions                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Users]  [Roles]  [Permissions]  [Policies]                     │
│  ═══════                                                          │
│                                                                   │
│  [Search users...              ] [Role ▼] [Status ▼]             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────────┤
│  │ ☑ │ Avatar │ Name          │ Email           │ Role    │ Status│
│  ├────────────────────────────────────────────────────────────────┤
│  │ ☐ │   JD   │ John Doe      │ john@...        │ Admin   │ Active│
│  │ ☐ │   AS   │ Alice Smith   │ alice@...       │ Support │ Active│
│  │ ☐ │   BJ   │ Bob Johnson   │ bob@...         │ Viewer  │ Invite│
│  └────────────────────────────────────────────────────────────────┘
│                                                                   │
│  Selected: 0    [Bulk Actions ▼]                                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Tab Content Structure:**

| Tab | Content |
|-----|---------|
| Users | Searchable table with bulk actions |
| Roles | Cards showing role name, description, user count, permission count |
| Permissions | Grouped list by category with toggle switches |
| Policies | Table with version, status, last modified |

---

## 6. Wallet Web Redesign

### 6.1 Page Structure Overview

```
┌────────────────────────────────────────────────────────────────────┐
│ WALLET WEB INFORMATION ARCHITECTURE                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  MAIN NAVIGATION (Tab Bar)                                         │
│  ├── Dashboard (Home)                                              │
│  │   └── Balance, Accounts, Recent Transactions, Quick Actions    │
│  │                                                                 │
│  ├── Transactions                                                  │
│  │   └── Full History with Filters                                │
│  │                                                                 │
│  ├── Cards                                                         │
│  │   └── Card List, Card Details, Actions                         │
│  │                                                                 │
│  ├── Rewards                                                       │
│  │   └── Points Balance, Available Offers, Redemption History     │
│  │                                                                 │
│  └── Settings                                                      │
│      └── Profile, Security, Notifications, Help                   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 6.2 Dashboard Page Redesign

**Layout Strategy:** Hero balance + Account cards + Transaction list

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Welcome back, John                                        │  │
│  │                                                            │  │
│  │  Total Balance                                             │  │
│  │  $18,140.77                                                │  │
│  │  ─────────────────────────                                 │  │
│  │  Across all accounts                                       │  │
│  │                                                            │  │
│  │  [Send Money]  [Add Funds]                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Your Accounts                                                    │
│  ┌─────────────────────────┐ ┌─────────────────────────┐        │
│  │ 🏦 Checking  ****1234  │ │ 💰 Savings   ****5678  │        │
│  │    $5,247.32           │ │    $12,893.45          │        │
│  └─────────────────────────┘ └─────────────────────────┘        │
│                                                                   │
│  Recent Activity                                       [See All >]│
│  ────────────────────────────────────────────────────────────────│
│  ↑ Starbucks              Food & Drink         -$5.75    Today  │
│  ↓ Salary Deposit         Income            +$3,250.00    Jan 5  │
│  ↑ Amazon                 Shopping            -$89.99    Jan 4  │
│  ↑ Gas Station            Transportation      -$45.20    Jan 3  │
│  ────────────────────────────────────────────────────────────────│
│                                                                   │
│  💰 Rewards Available: $124.50                        [Redeem >] │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**

1. **Hero Balance Section:**
   - Clean white/light background
   - Large, confident typography (text-4xl font-bold)
   - Subtle gradient accent (optional, for premium feel)
   - Two primary CTAs below balance

2. **Account Cards:**
   - Horizontal scroll on mobile
   - Subtle shadow, rounded-xl
   - Icon + Account type + Last 4 digits + Balance

3. **Transaction List:**
   - Minimal row design
   - Direction arrow (up=expense, down=income)
   - Category as secondary text
   - Amount right-aligned with date below

4. **Rewards Banner:**
   - Subtle gold accent
   - Single-line with action button

---

### 6.3 Transactions Page Redesign

```
┌──────────────────────────────────────────────────────────────────┐
│  Transactions                                                     │
│                                                                   │
│  [Search transactions...                        ]                │
│  [All Accounts ▼]  [All Categories ▼]  [Date Range ▼]           │
│                                                                   │
│  January 2026                                                     │
│  ────────────────────────────────────────────────────────────────│
│  ↑ Starbucks              Food & Drink         -$5.75    Jan 6  │
│  ↓ Salary Deposit         Income            +$3,250.00    Jan 5  │
│  ↑ Amazon                 Shopping            -$89.99    Jan 4  │
│  ────────────────────────────────────────────────────────────────│
│                                                                   │
│  December 2025                                                    │
│  ────────────────────────────────────────────────────────────────│
│  ↑ Netflix                Entertainment        -$15.99   Dec 28  │
│  ↑ Grocery Store          Groceries          -$127.45   Dec 27  │
│  ────────────────────────────────────────────────────────────────│
│                                                                   │
│  [Load More]                                                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Group transactions by month with sticky headers
- Use infinite scroll with "Load More" fallback
- Transaction detail on row click (slide-in panel)

---

### 6.4 Cards Page Redesign

```
┌──────────────────────────────────────────────────────────────────┐
│  Your Cards                                                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ╭───────────────────────────────────────────────────────╮ │  │
│  │  │                                                       │ │  │
│  │  │  SWIPESAVVY                              VISA         │ │  │
│  │  │                                                       │ │  │
│  │  │  •••• •••• •••• 4532                                  │ │  │
│  │  │  JOHN DOE                              05/28         │ │  │
│  │  │                                                       │ │  │
│  │  ╰───────────────────────────────────────────────────────╯ │  │
│  │                                                            │  │
│  │  Available Credit: $8,500.00                              │  │
│  │  Current Balance: $1,234.56                               │  │
│  │                                                            │  │
│  │  [View Details]  [Lock Card]  [Report Issue]              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────┐                                │
│  │  + Add New Card            │                                │
│  └─────────────────────────────┘                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Card Visual:**
- Realistic card rendering with gradient background
- Card network logo (Visa, Mastercard, etc.)
- Masked card number
- Clear expiry and name

**Actions:**
- View full card details (in secure modal)
- Lock/unlock card toggle
- Report lost/stolen
- Add to digital wallet

---

### 6.5 Rewards Page Redesign

```
┌──────────────────────────────────────────────────────────────────┐
│  Rewards                                                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ⭐ Your Rewards Balance                                   │  │
│  │                                                            │  │
│  │  $124.50                                                   │  │
│  │  ════════════════════════════════░░░░░  $25 to next tier   │  │
│  │                                                            │  │
│  │  [Redeem Now]                                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Available Offers                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │ 🎁          │ │ ☕          │ │ 🎬          │                │
│  │ $5 Off     │ │ Free Coffee │ │ Movie Ticket│                │
│  │ Amazon     │ │ Starbucks   │ │ AMC         │                │
│  │ 500 pts    │ │ 200 pts     │ │ 1000 pts    │                │
│  │ [Redeem]   │ │ [Redeem]    │ │ [Redeem]    │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                   │
│  Recent Redemptions                                               │
│  ────────────────────────────────────────────────────────────────│
│  ✓ $10 Amazon Gift Card            -1000 pts           Jan 2    │
│  ✓ Free Starbucks Drink             -200 pts           Dec 15   │
│  ────────────────────────────────────────────────────────────────│
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. UX Improvements Matrix

### 7.1 Admin Portal Improvements

#### Dashboard Page

| Level | Improvement | UX Principle | Implementation |
|-------|-------------|--------------|----------------|
| **Quick Win** | Remove gradient backgrounds from stat cards | Visual Clarity | Change `bg-gradient-*` to solid `bg-white` |
| **Medium** | Add sparkline trends inside stat cards | Data Density | Integrate tiny line chart showing 7-day trend |
| **Strategic** | Implement customizable dashboard widgets | User Control | Drag-drop widget system with save preferences |

#### Support Tickets Page

| Level | Improvement | UX Principle | Implementation |
|-------|-------------|--------------|----------------|
| **Quick Win** | Add animated pulse to critical severity indicator | Attention | CSS animation on red dot for critical tickets |
| **Medium** | Implement keyboard shortcuts for triage actions | Efficiency | 1=Critical, 2=High, 3=Medium, 4=Low assignments |
| **Strategic** | Add ticket clustering by similarity | Cognitive Load | ML-powered grouping of related issues |

#### Analytics Page

| Level | Improvement | UX Principle | Implementation |
|-------|-------------|--------------|----------------|
| **Quick Win** | Simplify chart legends to tooltips only | Declutter | Remove persistent legends, show on hover |
| **Medium** | Add comparison mode (vs. previous period) | Context | Toggle to overlay previous period data |
| **Strategic** | Implement natural language query for analytics | Accessibility | "Show me revenue last month" → chart |

#### User Management Page

| Level | Improvement | UX Principle | Implementation |
|-------|-------------|--------------|----------------|
| **Quick Win** | Add avatar initials for users without photos | Recognition | Generate colored initials (JD, AS) |
| **Medium** | Implement inline editing for user roles | Efficiency | Click role badge → dropdown → save |
| **Strategic** | Add role simulation mode | Error Prevention | "View as this role" to test permissions |

---

### 7.2 Wallet Web Improvements

#### Dashboard Page

| Level | Improvement | UX Principle | Implementation |
|-------|-------------|--------------|----------------|
| **Quick Win** | Increase balance font size to 48px | Visual Hierarchy | `text-5xl font-bold` |
| **Medium** | Add "hide balance" toggle | Privacy | Eye icon to mask balance in public |
| **Strategic** | Implement spending insights summary | Proactive Value | "You spent 15% more on food this week" |

#### Transactions Page

| Level | Improvement | UX Principle | Implementation |
|-------|-------------|--------------|----------------|
| **Quick Win** | Add merchant logos next to transaction names | Recognition | Use Clearbit Logo API or similar |
| **Medium** | Implement transaction categorization suggestions | Efficiency | ML-suggested categories with one-click accept |
| **Strategic** | Add receipt attachment capability | Completeness | Upload/photograph receipts per transaction |

#### Cards Page

| Level | Improvement | UX Principle | Implementation |
|-------|-------------|--------------|----------------|
| **Quick Win** | Add swipe gestures for card carousel | Touch Affordance | Horizontal swipe between cards |
| **Medium** | Implement instant card lock with biometric | Security | Face ID/fingerprint to lock immediately |
| **Strategic** | Add spend limits and alerts per card | Control | Set daily/weekly limits with notifications |

#### Rewards Page

| Level | Improvement | UX Principle | Implementation |
|-------|-------------|--------------|----------------|
| **Quick Win** | Add progress bar to next reward tier | Motivation | Visual progress indicator |
| **Medium** | Implement one-tap redemption | Efficiency | Skip confirmation for small rewards |
| **Strategic** | Add personalized reward recommendations | Relevance | Based on spending patterns |

---

## 8. Frontend Handoff Notes

### 8.1 Component-to-Code Mapping

```
┌────────────────────────────────────────────────────────────────────┐
│ COMPONENT MAPPING                                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ Design Component        →  Code Component                          │
│ ─────────────────────────────────────────────────────────────────  │
│ Sidebar                →  components/layout/Sidebar.tsx           │
│ Header                 →  components/layout/Header.tsx            │
│ Card                   →  components/ui/Card.tsx                  │
│ StatCard               →  components/ui/StatCard.tsx              │
│ Button                 →  components/ui/Button.tsx                │
│ Input                  →  components/ui/Input.tsx                 │
│ Select                 →  components/ui/Select.tsx                │
│ Badge                  →  components/ui/Badge.tsx                 │
│ Table                  →  components/ui/Table.tsx                 │
│ Modal                  →  components/ui/Modal.tsx                 │
│ Alert                  →  components/ui/Alert.tsx                 │
│ Toast                  →  components/ui/Toast.tsx                 │
│ Skeleton               →  components/ui/Skeleton.tsx              │
│ EmptyState             →  components/ui/EmptyState.tsx            │
│ Tabs                   →  components/ui/Tabs.tsx                  │
│ Dropdown               →  components/ui/DropdownMenu.tsx          │
│ Avatar                 →  components/ui/Avatar.tsx                │
│ Pagination             →  components/ui/Pagination.tsx            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 8.2 Responsive Breakpoints

```css
/* Tailwind Breakpoint System */
sm:  640px   /* Small tablets, large phones */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large monitors */

/* Layout Strategy by Breakpoint */
/* Mobile (<640px): Single column, bottom nav */
/* Tablet (640-1024px): 2 columns, collapsible sidebar */
/* Desktop (>1024px): Full layout, persistent sidebar */
```

**Responsive Patterns:**

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Sidebar | Hidden (hamburger) | Collapsed (icons) | Full (240px) |
| Stat Cards | 1 column | 2 columns | 4 columns |
| Charts | Full width | 2-up | 2-up with sidebar |
| Tables | Card view | Scrollable | Full table |
| Modals | Full screen | 480px centered | 640px centered |

### 8.3 Accessibility Checklist

| Requirement | Implementation |
|-------------|----------------|
| **Color Contrast** | All text meets WCAG 2.1 AA (4.5:1 for body, 3:1 for large text) |
| **Focus Indicators** | 2px ring with offset on all interactive elements |
| **Keyboard Navigation** | Tab order follows visual order, skip links for main content |
| **Screen Reader** | Semantic HTML, ARIA labels for icons, live regions for updates |
| **Touch Targets** | Minimum 44x44px for all buttons and links |
| **Motion** | Respect `prefers-reduced-motion` for animations |

### 8.4 Implementation Priority

```
┌────────────────────────────────────────────────────────────────────┐
│ IMPLEMENTATION ROADMAP                                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ PHASE 1: Foundation (Week 1-2)                                     │
│ ├── Update design tokens (tokens.css, tailwind.config.ts)         │
│ ├── Refactor Card component                                        │
│ ├── Refactor Button component                                      │
│ ├── Update Badge component                                         │
│ └── Apply new shadow/radius values globally                       │
│                                                                    │
│ PHASE 2: Layout (Week 2-3)                                         │
│ ├── Redesign Sidebar navigation                                    │
│ ├── Simplify Header component                                      │
│ ├── Update page layouts (padding, gaps)                           │
│ └── Implement responsive breakpoint adjustments                   │
│                                                                    │
│ PHASE 3: Data Components (Week 3-4)                               │
│ ├── Redesign Table component                                       │
│ ├── Update StatCard component                                      │
│ ├── Refine chart styling (recharts customization)                 │
│ └── Implement new Empty/Loading/Error states                      │
│                                                                    │
│ PHASE 4: Page Updates (Week 4-6)                                   │
│ ├── Dashboard page redesign                                        │
│ ├── Analytics page redesign                                        │
│ ├── Support Tickets page redesign                                  │
│ ├── User Management page redesign                                  │
│ └── Wallet Web all pages                                          │
│                                                                    │
│ PHASE 5: Polish (Week 6-7)                                         │
│ ├── Animation refinements                                          │
│ ├── Accessibility audit                                            │
│ ├── Performance optimization                                       │
│ └── Cross-browser testing                                          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 8.5 Code Style Guidelines

```tsx
// Component Structure Pattern
import { cn } from '@/utils/cn'
import { forwardRef, type ComponentProps } from 'react'

interface CardProps extends ComponentProps<'div'> {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg transition-colors',
          // Variant styles
          variant === 'default' && 'bg-white border border-gray-200',
          variant === 'outlined' && 'bg-white border border-gray-300',
          variant === 'elevated' && 'bg-white shadow-sm',
          // Padding styles
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-5',
          padding === 'lg' && 'p-6',
          // Custom classes
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
```

**Naming Conventions:**
- Components: PascalCase (`StatCard.tsx`)
- Utilities: camelCase (`formatCurrency.ts`)
- CSS Variables: `--color-*`, `--space-*`, `--radius-*`
- Tailwind Classes: Use `cn()` utility for conditional merging

---

## Appendix: Quick Reference

### Color Usage Cheatsheet

| Use Case | Light Mode | Dark Mode |
|----------|------------|-----------|
| Page background | `bg-gray-50` | `bg-gray-900` |
| Card background | `bg-white` | `bg-gray-800` |
| Primary text | `text-gray-900` | `text-gray-50` |
| Secondary text | `text-gray-600` | `text-gray-400` |
| Borders | `border-gray-200` | `border-gray-700` |
| Primary button | `bg-primary-600` | `bg-primary-500` |
| Success state | `text-success-600` | `text-success-400` |
| Danger state | `text-danger-600` | `text-danger-400` |

### Spacing Quick Reference

| Token | Value | Use Case |
|-------|-------|----------|
| `space-1` | 4px | Icon padding |
| `space-2` | 8px | Tight gaps |
| `space-3` | 12px | Input padding |
| `space-4` | 16px | Standard gap |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large gaps |

### Icon Size Reference

| Size | Pixels | Use Case |
|------|--------|----------|
| `w-4 h-4` | 16px | Inline with text |
| `w-5 h-5` | 20px | Standard icons |
| `w-6 h-6` | 24px | Navigation icons |
| `w-8 h-8` | 32px | Feature icons |
| `w-10 h-10` | 40px | Empty state icons |

---

**Document Version:** 2.0
**Last Updated:** January 2026
**Status:** Production Ready

---

*This blueprint provides a complete, implementable specification for the SwipeSavvy UI/UX redesign. All decisions are justified by UX principles and include concrete code examples for immediate implementation.*
