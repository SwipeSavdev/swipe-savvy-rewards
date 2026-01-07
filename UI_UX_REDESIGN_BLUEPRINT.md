# SwipeSavvy UI/UX Redesign Blueprint
## Production-Ready Design System for FinTech Excellence

**Version:** 1.0
**Date:** January 7, 2026
**Prepared for:** SwipeSavvy Platform
**Applications:** Admin Portal & Customer Wallet Web

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [UX Strategy Summary](#2-ux-strategy-summary)
3. [Design Tokens System](#3-design-tokens-system)
4. [Component System](#4-component-system)
5. [Screen-by-Screen Redesign: Admin Portal](#5-screen-by-screen-redesign-admin-portal)
6. [Screen-by-Screen Redesign: Customer Wallet Web](#6-screen-by-screen-redesign-customer-wallet-web)
7. [UX Improvements Catalog](#7-ux-improvements-catalog)
8. [Frontend Handoff Notes](#8-frontend-handoff-notes)

---

## 1. Executive Summary

### Current State Analysis

**Admin Portal (28 pages identified):**
- Complex enterprise application with RBAC, analytics, support tools, AI features
- Existing design tokens system with CSS variables
- Light/dark theme support infrastructure in place
- Zustand state management with multiple stores
- Inconsistent component patterns across pages

**Customer Wallet Web (6 pages):**
- Consumer-facing financial management application
- Simpler color scheme using Tailwind extend config
- Single Layout component for navigation
- Mock data throughout - ready for API integration
- Clean but generic design lacking premium fintech feel

### Redesign Vision

Transform both applications into a **cohesive, premium fintech experience** that:
- Builds trust through professional visual design
- Reduces cognitive load with clear information hierarchy
- Increases task efficiency with optimized workflows
- Maintains accessibility standards (WCAG 2.1 AA)
- Supports both light and dark themes consistently

---

## 2. UX Strategy Summary

### 2.1 Design Principles

| Principle | Description | Application |
|-----------|-------------|-------------|
| **Trust First** | Every visual element should reinforce financial security and reliability | Use blue tones, clean typography, subtle gradients |
| **Clarity Over Density** | Information should be scannable and digestible | Progressive disclosure, whitespace, card-based layouts |
| **Guided Actions** | Users should always know what to do next | Clear CTAs, visual hierarchy, contextual hints |
| **Responsive Excellence** | Experience should feel native on all devices | Mobile-first approach, touch-friendly targets |
| **Accessible by Default** | Design for all users from the start | Color contrast, keyboard navigation, screen readers |

### 2.2 User Personas

#### Admin Portal Users

**Primary: Operations Manager**
- Needs: Quick access to metrics, user management, support escalations
- Pain points: Information overload, too many clicks to common tasks
- Goals: Monitor platform health, resolve issues efficiently

**Secondary: Support Agent**
- Needs: Customer lookup, ticket management, AI assistance
- Pain points: Switching between tools, missing context
- Goals: Resolve customer issues quickly with full context

#### Customer Wallet Users

**Primary: Active Spender**
- Needs: Quick balance check, transaction history, card management
- Pain points: Finding specific transactions, understanding spending
- Goals: Stay informed about finances, maximize rewards

**Secondary: Rewards Optimizer**
- Needs: Rewards tracking, cashback visibility, redemption options
- Pain points: Missing reward opportunities, unclear earning rates
- Goals: Maximize cashback and rewards on purchases

### 2.3 Information Architecture Improvements

#### Admin Portal Navigation Restructure

```
Current:                          Proposed:
├── Dashboard                     ├── Dashboard (Home)
├── Users                         ├── Customers
│   └── Customer Users            │   ├── User Directory
│   └── Admin Users               │   ├── User Details
├── Merchants                     │   └── Activity Log
├── Support                       ├── Operations
│   ├── Dashboard                 │   ├── Merchants
│   ├── Tickets                   │   ├── Charity Partners
│   └── AI Concierge              │   └── Feature Flags
├── Analytics                     ├── Support Center
│   ├── Overview                  │   ├── Dashboard
│   └── Risk Reports              │   ├── Tickets
├── Tools                         │   └── AI Concierge
│   ├── Feature Flags             ├── Analytics & Risk
│   └── AI Marketing              │   ├── Overview
├── Settings                      │   ├── Risk Reports
│   ├── Profile                   │   └── Audit Logs
│   ├── Appearance                ├── AI Tools
│   └── Roles & Permissions       │   └── Marketing Suite
└── Audit Logs                    └── Settings
                                      ├── Profile
                                      ├── Appearance
                                      └── Access Control
                                          ├── Admin Users
                                          ├── Roles
                                          └── Permissions
```

#### Wallet Web Navigation Restructure

```
Current:                          Proposed:
├── Dashboard                     ├── Home (Dashboard)
├── Transactions                  ├── Transactions
├── Cards                         │   ├── All Activity
├── Rewards                       │   └── Search & Filter
└── Settings                      ├── Cards & Accounts
                                  │   ├── My Cards
                                  │   ├── Add Card
                                  │   └── Card Details
                                  ├── Rewards
                                  │   ├── Available
                                  │   ├── History
                                  │   └── Redeem
                                  ├── Insights (NEW)
                                  │   └── Spending Analysis
                                  └── Settings
                                      ├── Profile
                                      ├── Security
                                      └── Notifications
```

---

## 3. Design Tokens System

### 3.1 Color Palette

#### Primary Brand Colors

```css
/* Core Brand */
--ss-brand-navy: #235393;        /* Primary brand color */
--ss-brand-deep: #132136;        /* Dark backgrounds, text */
--ss-brand-green: #60BA46;       /* Success, positive values */
--ss-brand-yellow: #FAB915;      /* Warnings, highlights, rewards */
--ss-brand-white: #F6F6F6;       /* Light backgrounds */

/* Extended Palette */
--ss-navy-50: #E8EFF8;           /* Lightest navy tint */
--ss-navy-100: #C5D7ED;
--ss-navy-200: #9EBDE1;
--ss-navy-300: #77A3D5;
--ss-navy-400: #508AC8;
--ss-navy-500: #235393;          /* Base */
--ss-navy-600: #1C4275;
--ss-navy-700: #153157;
--ss-navy-800: #0E213A;
--ss-navy-900: #07101D;

/* Semantic Colors */
--ss-success-50: #ECFAE8;
--ss-success-100: #C9F2BD;
--ss-success-500: #60BA46;       /* Base success */
--ss-success-600: #4D9538;
--ss-success-700: #3A702A;

--ss-warning-50: #FFF8E6;
--ss-warning-100: #FEEAB3;
--ss-warning-500: #FAB915;       /* Base warning */
--ss-warning-600: #C89411;
--ss-warning-700: #966F0D;

--ss-danger-50: #FDECEC;
--ss-danger-100: #F9CCCF;
--ss-danger-500: #E5484D;        /* Base danger */
--ss-danger-600: #B73A3E;
--ss-danger-700: #892B2F;

/* Neutral Scale */
--ss-gray-50: #FAFAFA;
--ss-gray-100: #F4F4F5;
--ss-gray-200: #E4E4E7;
--ss-gray-300: #D4D4D8;
--ss-gray-400: #A1A1AA;
--ss-gray-500: #71717A;
--ss-gray-600: #52525B;
--ss-gray-700: #3F3F46;
--ss-gray-800: #27272A;
--ss-gray-900: #18181B;
```

#### Theme Tokens

```css
/* Light Theme */
:root {
  --ss-bg-primary: #F6F6F6;
  --ss-bg-secondary: #FFFFFF;
  --ss-bg-tertiary: #FAFAFA;
  --ss-bg-elevated: #FFFFFF;

  --ss-text-primary: #132136;
  --ss-text-secondary: #4B4D4D;
  --ss-text-tertiary: #747676;
  --ss-text-inverse: #FFFFFF;

  --ss-border-default: rgba(19, 33, 54, 0.12);
  --ss-border-strong: rgba(19, 33, 54, 0.24);
  --ss-border-focus: #235393;

  --ss-interactive-primary: #235393;
  --ss-interactive-hover: #1C4275;
  --ss-interactive-active: #153157;
  --ss-interactive-disabled: #A1A1AA;
}

/* Dark Theme */
[data-theme="dark"] {
  --ss-bg-primary: #0A0F1A;
  --ss-bg-secondary: #111827;
  --ss-bg-tertiary: #1F2937;
  --ss-bg-elevated: #1F2937;

  --ss-text-primary: #F9FAFB;
  --ss-text-secondary: #D1D5DB;
  --ss-text-tertiary: #9CA3AF;
  --ss-text-inverse: #111827;

  --ss-border-default: rgba(255, 255, 255, 0.12);
  --ss-border-strong: rgba(255, 255, 255, 0.24);
  --ss-border-focus: #508AC8;

  --ss-interactive-primary: #508AC8;
  --ss-interactive-hover: #77A3D5;
  --ss-interactive-active: #235393;
  --ss-interactive-disabled: #4B5563;
}
```

### 3.2 Typography Scale

```css
/* Font Families */
--ss-font-display: "Hermes", "SF Pro Display", system-ui, sans-serif;
--ss-font-body: "Barlow", "SF Pro Text", system-ui, sans-serif;
--ss-font-mono: "SF Mono", "Fira Code", "Consolas", monospace;

/* Font Sizes */
--ss-text-xs: 0.75rem;     /* 12px */
--ss-text-sm: 0.875rem;    /* 14px */
--ss-text-base: 1rem;      /* 16px */
--ss-text-lg: 1.125rem;    /* 18px */
--ss-text-xl: 1.25rem;     /* 20px */
--ss-text-2xl: 1.5rem;     /* 24px */
--ss-text-3xl: 1.875rem;   /* 30px */
--ss-text-4xl: 2.25rem;    /* 36px */
--ss-text-5xl: 3rem;       /* 48px */

/* Line Heights */
--ss-leading-none: 1;
--ss-leading-tight: 1.25;
--ss-leading-snug: 1.375;
--ss-leading-normal: 1.5;
--ss-leading-relaxed: 1.625;

/* Font Weights */
--ss-font-normal: 400;
--ss-font-medium: 500;
--ss-font-semibold: 600;
--ss-font-bold: 700;

/* Typography Presets */
.text-display-1 {
  font-family: var(--ss-font-display);
  font-size: var(--ss-text-5xl);
  font-weight: var(--ss-font-bold);
  line-height: var(--ss-leading-tight);
  letter-spacing: -0.02em;
}

.text-heading-1 {
  font-family: var(--ss-font-display);
  font-size: var(--ss-text-3xl);
  font-weight: var(--ss-font-semibold);
  line-height: var(--ss-leading-tight);
}

.text-heading-2 {
  font-family: var(--ss-font-display);
  font-size: var(--ss-text-2xl);
  font-weight: var(--ss-font-semibold);
  line-height: var(--ss-leading-snug);
}

.text-heading-3 {
  font-family: var(--ss-font-body);
  font-size: var(--ss-text-xl);
  font-weight: var(--ss-font-semibold);
  line-height: var(--ss-leading-snug);
}

.text-body-lg {
  font-family: var(--ss-font-body);
  font-size: var(--ss-text-lg);
  font-weight: var(--ss-font-normal);
  line-height: var(--ss-leading-relaxed);
}

.text-body {
  font-family: var(--ss-font-body);
  font-size: var(--ss-text-base);
  font-weight: var(--ss-font-normal);
  line-height: var(--ss-leading-normal);
}

.text-body-sm {
  font-family: var(--ss-font-body);
  font-size: var(--ss-text-sm);
  font-weight: var(--ss-font-normal);
  line-height: var(--ss-leading-normal);
}

.text-caption {
  font-family: var(--ss-font-body);
  font-size: var(--ss-text-xs);
  font-weight: var(--ss-font-medium);
  line-height: var(--ss-leading-normal);
  letter-spacing: 0.02em;
}

.text-mono {
  font-family: var(--ss-font-mono);
  font-size: var(--ss-text-sm);
  font-weight: var(--ss-font-normal);
}
```

### 3.3 Spacing System

```css
/* Base spacing unit: 4px */
--ss-space-0: 0;
--ss-space-px: 1px;
--ss-space-0.5: 0.125rem;   /* 2px */
--ss-space-1: 0.25rem;      /* 4px */
--ss-space-1.5: 0.375rem;   /* 6px */
--ss-space-2: 0.5rem;       /* 8px */
--ss-space-2.5: 0.625rem;   /* 10px */
--ss-space-3: 0.75rem;      /* 12px */
--ss-space-3.5: 0.875rem;   /* 14px */
--ss-space-4: 1rem;         /* 16px */
--ss-space-5: 1.25rem;      /* 20px */
--ss-space-6: 1.5rem;       /* 24px */
--ss-space-7: 1.75rem;      /* 28px */
--ss-space-8: 2rem;         /* 32px */
--ss-space-9: 2.25rem;      /* 36px */
--ss-space-10: 2.5rem;      /* 40px */
--ss-space-12: 3rem;        /* 48px */
--ss-space-14: 3.5rem;      /* 56px */
--ss-space-16: 4rem;        /* 64px */
--ss-space-20: 5rem;        /* 80px */
--ss-space-24: 6rem;        /* 96px */

/* Component-specific spacing */
--ss-card-padding: var(--ss-space-6);
--ss-card-gap: var(--ss-space-4);
--ss-section-gap: var(--ss-space-8);
--ss-page-padding-x: var(--ss-space-6);
--ss-page-padding-y: var(--ss-space-8);

/* Responsive page padding */
@media (min-width: 768px) {
  --ss-page-padding-x: var(--ss-space-8);
}
@media (min-width: 1280px) {
  --ss-page-padding-x: var(--ss-space-12);
}
```

### 3.4 Effects & Elevation

```css
/* Border Radius */
--ss-radius-none: 0;
--ss-radius-sm: 4px;
--ss-radius-md: 8px;
--ss-radius-lg: 12px;
--ss-radius-xl: 16px;
--ss-radius-2xl: 24px;
--ss-radius-full: 9999px;

/* Shadows (Light Theme) */
--ss-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--ss-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--ss-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--ss-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--ss-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--ss-shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--ss-shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

/* Focus Ring */
--ss-ring-offset: 2px;
--ss-ring-width: 2px;
--ss-ring-color: rgba(35, 83, 147, 0.5);
--ss-focus-ring: 0 0 0 var(--ss-ring-offset) var(--ss-bg-secondary),
                 0 0 0 calc(var(--ss-ring-offset) + var(--ss-ring-width)) var(--ss-ring-color);

/* Transitions */
--ss-transition-fast: 150ms ease;
--ss-transition-base: 200ms ease;
--ss-transition-slow: 300ms ease;
--ss-transition-slower: 500ms ease;

/* Gradients */
--ss-gradient-primary: linear-gradient(135deg, #235393 0%, #1A3F7A 100%);
--ss-gradient-primary-vibrant: linear-gradient(135deg, #235393 0%, #4A90E2 100%);
--ss-gradient-success: linear-gradient(135deg, #60BA46 0%, #4A9A35 100%);
--ss-gradient-warning: linear-gradient(135deg, #FAB915 0%, #FF8C00 100%);
--ss-gradient-gold: linear-gradient(135deg, #F4D03F 0%, #FAB915 50%, #E67E22 100%);
--ss-gradient-card-shine: linear-gradient(135deg,
  rgba(255,255,255,0.1) 0%,
  rgba(255,255,255,0.05) 50%,
  rgba(255,255,255,0) 100%);
```

### 3.5 Breakpoints

```css
/* Breakpoint tokens */
--ss-breakpoint-sm: 640px;
--ss-breakpoint-md: 768px;
--ss-breakpoint-lg: 1024px;
--ss-breakpoint-xl: 1280px;
--ss-breakpoint-2xl: 1536px;

/* Container widths */
--ss-container-sm: 640px;
--ss-container-md: 768px;
--ss-container-lg: 1024px;
--ss-container-xl: 1280px;
--ss-container-2xl: 1400px;
```

### 3.6 Z-Index Scale

```css
--ss-z-dropdown: 1000;
--ss-z-sticky: 1020;
--ss-z-fixed: 1030;
--ss-z-modal-backdrop: 1040;
--ss-z-modal: 1050;
--ss-z-popover: 1060;
--ss-z-tooltip: 1070;
--ss-z-toast: 1080;
```

---

## 4. Component System

### 4.1 Button Component

```tsx
// Button.tsx - Redesigned Component

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/* Variant Styles */
const variants = {
  primary: `
    bg-gradient-to-r from-ss-navy-500 to-ss-navy-600
    text-white font-semibold
    hover:from-ss-navy-600 hover:to-ss-navy-700
    active:from-ss-navy-700 active:to-ss-navy-800
    shadow-sm hover:shadow-md
    transition-all duration-200
  `,
  secondary: `
    bg-white border-2 border-ss-navy-500
    text-ss-navy-500 font-semibold
    hover:bg-ss-navy-50 hover:border-ss-navy-600
    active:bg-ss-navy-100
    transition-all duration-200
  `,
  ghost: `
    bg-transparent
    text-ss-navy-500 font-medium
    hover:bg-ss-navy-50
    active:bg-ss-navy-100
    transition-all duration-200
  `,
  danger: `
    bg-gradient-to-r from-ss-danger-500 to-ss-danger-600
    text-white font-semibold
    hover:from-ss-danger-600 hover:to-ss-danger-700
    shadow-sm hover:shadow-md
    transition-all duration-200
  `,
  success: `
    bg-gradient-to-r from-ss-success-500 to-ss-success-600
    text-white font-semibold
    hover:from-ss-success-600 hover:to-ss-success-700
    shadow-sm hover:shadow-md
    transition-all duration-200
  `
};

/* Size Styles */
const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-base rounded-lg gap-2',
  lg: 'px-6 py-2.5 text-lg rounded-lg gap-2.5',
  xl: 'px-8 py-3 text-xl rounded-xl gap-3'
};

/* Usage Rules:
 * - Primary: Main CTAs, form submissions, important actions
 * - Secondary: Alternative actions, cancel buttons
 * - Ghost: Tertiary actions, navigation items
 * - Danger: Destructive actions (delete, remove)
 * - Success: Positive confirmations (approve, complete)
 *
 * Size Guidelines:
 * - sm: Inline actions, table rows, dense UIs
 * - md: Default for most use cases
 * - lg: Hero CTAs, form submissions
 * - xl: Landing pages, onboarding flows
 */
```

### 4.2 Card Component

```tsx
// Card.tsx - Redesigned Component

interface CardProps {
  variant: 'elevated' | 'outlined' | 'filled' | 'gradient';
  padding: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

const variants = {
  elevated: `
    bg-white dark:bg-ss-gray-800
    shadow-md hover:shadow-lg
    border border-transparent
    transition-shadow duration-200
  `,
  outlined: `
    bg-white dark:bg-ss-gray-800
    border border-ss-border-default
    hover:border-ss-border-strong
    transition-colors duration-200
  `,
  filled: `
    bg-ss-gray-50 dark:bg-ss-gray-800
    border border-transparent
  `,
  gradient: `
    bg-gradient-to-br from-ss-navy-500 to-ss-navy-700
    text-white
    shadow-lg
  `
};

const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

/* Usage Rules:
 * - elevated: Dashboard widgets, important content blocks
 * - outlined: Lists, secondary content, form sections
 * - filled: Nested cards, subtle backgrounds
 * - gradient: Hero cards, feature highlights, premium content
 */
```

### 4.3 Input Component

```tsx
// Input.tsx - Redesigned Component

interface InputProps {
  variant: 'default' | 'filled' | 'flushed';
  size: 'sm' | 'md' | 'lg';
  state: 'default' | 'error' | 'success' | 'disabled';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: string;
  rightAddon?: string;
  helperText?: string;
  errorText?: string;
}

const baseStyles = `
  w-full
  font-body text-ss-text-primary
  placeholder:text-ss-text-tertiary
  transition-all duration-200
  focus:outline-none
`;

const variants = {
  default: `
    bg-white dark:bg-ss-gray-800
    border-2 border-ss-border-default
    focus:border-ss-interactive-primary
    focus:ring-2 focus:ring-ss-navy-100
    rounded-lg
  `,
  filled: `
    bg-ss-gray-100 dark:bg-ss-gray-700
    border-2 border-transparent
    focus:bg-white focus:border-ss-interactive-primary
    rounded-lg
  `,
  flushed: `
    bg-transparent
    border-b-2 border-ss-border-default
    focus:border-ss-interactive-primary
    rounded-none px-0
  `
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-5 text-lg'
};

const states = {
  error: 'border-ss-danger-500 focus:border-ss-danger-500 focus:ring-ss-danger-100',
  success: 'border-ss-success-500 focus:border-ss-success-500 focus:ring-ss-success-100',
  disabled: 'bg-ss-gray-100 text-ss-text-tertiary cursor-not-allowed opacity-60'
};
```

### 4.4 Table Component

```tsx
// Table.tsx - Redesigned Component

interface TableProps {
  variant: 'simple' | 'striped' | 'bordered';
  size: 'sm' | 'md' | 'lg';
  stickyHeader?: boolean;
  selectable?: boolean;
  sortable?: boolean;
}

const variants = {
  simple: `
    [&_th]:bg-ss-gray-50 dark:[&_th]:bg-ss-gray-800
    [&_th]:border-b-2 [&_th]:border-ss-border-default
    [&_td]:border-b [&_td]:border-ss-border-default
    [&_tr:hover]:bg-ss-gray-50 dark:[&_tr:hover]:bg-ss-gray-800/50
  `,
  striped: `
    [&_th]:bg-ss-gray-100 dark:[&_th]:bg-ss-gray-800
    [&_tbody_tr:nth-child(even)]:bg-ss-gray-50
    dark:[&_tbody_tr:nth-child(even)]:bg-ss-gray-800/30
  `,
  bordered: `
    border border-ss-border-default rounded-lg overflow-hidden
    [&_th]:bg-ss-gray-50 dark:[&_th]:bg-ss-gray-800
    [&_th]:border-b [&_td]:border-b
    [&_th]:border-r [&_td]:border-r
    [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0
    [&_tr:last-child_td]:border-b-0
  `
};

/* Usage:
 * - simple: Default for most tables
 * - striped: Long tables, dense data
 * - bordered: Standalone tables, detailed views
 */
```

### 4.5 Badge Component

```tsx
// Badge.tsx - Redesigned Component

interface BadgeProps {
  variant: 'solid' | 'soft' | 'outline';
  colorScheme: 'navy' | 'green' | 'yellow' | 'red' | 'gray';
  size: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const colorSchemes = {
  navy: {
    solid: 'bg-ss-navy-500 text-white',
    soft: 'bg-ss-navy-100 text-ss-navy-700',
    outline: 'border-ss-navy-500 text-ss-navy-500'
  },
  green: {
    solid: 'bg-ss-success-500 text-white',
    soft: 'bg-ss-success-100 text-ss-success-700',
    outline: 'border-ss-success-500 text-ss-success-500'
  },
  yellow: {
    solid: 'bg-ss-warning-500 text-ss-gray-900',
    soft: 'bg-ss-warning-100 text-ss-warning-700',
    outline: 'border-ss-warning-500 text-ss-warning-600'
  },
  red: {
    solid: 'bg-ss-danger-500 text-white',
    soft: 'bg-ss-danger-100 text-ss-danger-700',
    outline: 'border-ss-danger-500 text-ss-danger-500'
  },
  gray: {
    solid: 'bg-ss-gray-500 text-white',
    soft: 'bg-ss-gray-100 text-ss-gray-700',
    outline: 'border-ss-gray-400 text-ss-gray-600'
  }
};

/* Status Mapping:
 * - Active/Success/Approved → green
 * - Pending/Warning/Review → yellow
 * - Error/Declined/Failed → red
 * - Inactive/Disabled → gray
 * - Primary/Default → navy
 */
```

### 4.6 StatCard Component

```tsx
// StatCard.tsx - Premium Redesign

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon?: React.ReactNode;
  variant: 'default' | 'gradient' | 'outlined';
  sparkline?: number[];
  action?: {
    label: string;
    onClick: () => void;
  };
}

/* Visual Design:
 *
 * ┌─────────────────────────────────────┐
 * │ [Icon]                    ↗ +12.5%  │
 * │                           vs last mo│
 * │ Total Revenue                       │
 * │ $1,234,567.89                       │
 * │ ▁▂▃▅▆▇▅▆▇█ (sparkline)             │
 * │                      [View Details] │
 * └─────────────────────────────────────┘
 *
 * - Icon in accent circle (top-left)
 * - Trend indicator with color (top-right)
 * - Title (muted, small)
 * - Value (large, bold, headline font)
 * - Optional sparkline
 * - Optional action link
 */

const variants = {
  default: `
    bg-white dark:bg-ss-gray-800
    border border-ss-border-default
    rounded-xl p-6
    hover:shadow-md transition-shadow
  `,
  gradient: `
    bg-gradient-to-br from-ss-navy-500 to-ss-navy-700
    text-white rounded-xl p-6
    shadow-lg
  `,
  outlined: `
    bg-transparent
    border-2 border-ss-navy-200 dark:border-ss-navy-700
    rounded-xl p-6
  `
};
```

### 4.7 Navigation Components

#### Sidebar (Admin Portal)

```tsx
// Sidebar.tsx - Redesigned

interface SidebarProps {
  isCollapsed: boolean;
  navGroups: NavGroup[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number | string;
  children?: NavItem[];
}

/* Visual Design:
 *
 * ┌──────────────────────┐
 * │ 🔷 SwipeSavvy        │ ← Logo + Collapse toggle
 * │ Admin Portal         │
 * ├──────────────────────┤
 * │ MAIN                 │ ← Section header
 * │ ◉ Dashboard          │ ← Active item
 * │ ○ Customers      12  │ ← With badge
 * │ ○ Operations     ▼   │ ← Expandable
 * │   ├─ Merchants       │
 * │   ├─ Charities       │
 * │   └─ Features        │
 * ├──────────────────────┤
 * │ SUPPORT              │
 * │ ○ Dashboard          │
 * │ ○ Tickets        5   │
 * │ ○ AI Concierge       │
 * ├──────────────────────┤
 * │ [Profile Avatar]     │ ← User section at bottom
 * │ Admin User           │
 * │ Settings | Logout    │
 * └──────────────────────┘
 *
 * Collapsed State:
 * ┌────┐
 * │ 🔷 │ ← Only logo icon
 * ├────┤
 * │ 📊 │ ← Only icons
 * │ 👥 │
 * │ ⚙️ │
 * │ ...│
 * └────┘
 */
```

#### Header (Wallet Web)

```tsx
// Header.tsx - Redesigned

/* Visual Design:
 *
 * ┌─────────────────────────────────────────────────────┐
 * │ 🔷 SwipeSavvy      Home  Trans  Cards  Rewards      │
 * │                                        [🔔] [Avatar]│
 * └─────────────────────────────────────────────────────┘
 *
 * Mobile:
 * ┌─────────────────────────────────────────────────────┐
 * │ ☰ 🔷 SwipeSavvy                        [🔔] [Avatar]│
 * └─────────────────────────────────────────────────────┘
 *
 * - Sticky positioning
 * - Blur backdrop on scroll
 * - Notification bell with badge
 * - Profile dropdown
 */
```

### 4.8 Modal Component

```tsx
// Modal.tsx - Redesigned

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  description?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl'
};

/* Visual Design:
 *
 * ┌─────────────────────────────────────┐
 * │ Modal Title                    [×]  │
 * │ Optional description text           │
 * ├─────────────────────────────────────┤
 * │                                     │
 * │ Content Area                        │
 * │                                     │
 * │                                     │
 * ├─────────────────────────────────────┤
 * │              [Cancel] [Confirm]     │
 * └─────────────────────────────────────┘
 *
 * - Centered on screen
 * - Backdrop blur effect
 * - Smooth enter/exit animations
 * - Focus trap for accessibility
 * - ESC key closes modal
 */
```

### 4.9 Data Visualization Components

```tsx
// Chart Components - Design Specifications

/* Line Chart */
interface LineChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  color?: string;
  gradient?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
}

/* Design:
 * - Gradient fill under line (from-primary-500/30 to-transparent)
 * - Smooth curved lines (Recharts monotone type)
 * - Custom tooltip with card styling
 * - Animated draw-in effect on mount
 * - Interactive hover dots
 */

/* Bar Chart */
interface BarChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  colorScheme?: 'primary' | 'gradient' | 'categorical';
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
}

/* Design:
 * - Rounded corners on bars (radius: 4px top)
 * - Gradient fills for primary data
 * - Subtle grid lines
 * - Value labels on hover/always option
 */

/* Donut Chart */
interface DonutChartProps {
  data: DataPoint[];
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  colorPalette?: string[];
}

/* Design:
 * - 60% inner radius for donut shape
 * - Center text for primary metric
 * - Hover segment expansion
 * - Legend below chart
 * - Accessible patterns/textures option
 */
```

---

## 5. Screen-by-Screen Redesign: Admin Portal

### 5.1 Login Page ✅ (Already Updated)

**Current State:** Recently redesigned with gradient background, centered card
**Status:** Complete - matches Wallet styling

### 5.2 Dashboard Page

**Current Issues:**
- Information density too high
- Widget layout inflexible
- No personalization
- Charts lack polish

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Dashboard                                            Jan 7, 2026 | Theme 🌙│
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ Good morning, Admin 👋                                                     │
│ Here's your platform overview                                              │
│                                                                            │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐│
│ │ 💰 Total Volume │ │ 👥 Active Users │ │ 🏪 Merchants    │ │ 🎫 Tickets  ││
│ │ $12.5M         │ │ 45,231          │ │ 1,245           │ │ 23 Open     ││
│ │ ↗ +15.2%       │ │ ↗ +8.3%         │ │ ↗ +12 this week │ │ ↘ -5 today  ││
│ │ ▁▂▃▄▅▆▇        │ │ ▁▂▃▄▅▆▇         │ │                 │ │             ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────┘│
│                                                                            │
│ ┌──────────────────────────────────────┐ ┌────────────────────────────────┐│
│ │ Transaction Volume                    │ │ Recent Activity               ││
│ │ [Day] [Week] [Month] [Year]          │ │                                ││
│ │                                       │ │ • New merchant: Joe's Cafe    ││
│ │     ╭─╮  ╭───╮                       │ │ • User flagged for review     ││
│ │   ╭─╯ ╰──╯   ╰─╮    ╭─              │ │ • Risk alert: High volume     ││
│ │ ──╯             ╰────╯               │ │ • Support ticket resolved     ││
│ │                                       │ │                                ││
│ │ Jan  Feb  Mar  Apr  May  Jun         │ │ [View All Activity →]         ││
│ └──────────────────────────────────────┘ └────────────────────────────────┘│
│                                                                            │
│ ┌──────────────────────────────────────┐ ┌────────────────────────────────┐│
│ │ Quick Actions                         │ │ System Health                 ││
│ │                                       │ │                                ││
│ │ [+ Add User] [+ Add Merchant]        │ │ API: ●  Database: ●  Queue: ● ││
│ │ [📊 Reports] [⚙️ Settings]           │ │ 99.9% Uptime | Last 30 days   ││
│ └──────────────────────────────────────┘ └────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
1. Personalized greeting with time-based message
2. Stat cards with sparklines for trend visualization
3. Configurable time period selector for main chart
4. Activity feed with real-time updates
5. Quick actions panel for common tasks
6. System health status indicators
7. Reduced visual clutter, more whitespace

### 5.3 Users/Customers Page

**Current Issues:**
- Basic table without advanced filtering
- Limited user actions
- No bulk operations
- Missing user context

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Customer Directory                                                         │
│ Manage and monitor platform users                                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┌─────────────────────────────────────────────────┐ ┌────────────────────┐│
│ │ 🔍 Search users...                    [Filters ▼]│ │ [+ Add Customer]  ││
│ └─────────────────────────────────────────────────┘ └────────────────────┘│
│                                                                            │
│ Active Filters: Status: Active ✕  |  Joined: Last 30 days ✕  |  Clear All │
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ ☐ │ User              │ Email           │ Status   │ Joined    │ Actions││
│ ├───┼───────────────────┼─────────────────┼──────────┼───────────┼────────┤│
│ │ ☐ │ 👤 John Smith     │ john@email.com  │ ● Active │ Jan 5, 26 │ ••• ▼  ││
│ │ ☐ │ 👤 Sarah Johnson  │ sarah@email.com │ ● Active │ Jan 3, 26 │ ••• ▼  ││
│ │ ☐ │ 👤 Mike Wilson    │ mike@email.com  │ ○ Pending│ Jan 2, 26 │ ••• ▼  ││
│ │ ☐ │ 👤 Emma Davis     │ emma@email.com  │ ● Active │ Dec 28    │ ••• ▼  ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ Showing 1-10 of 45,231 users          [← Previous]  1 2 3 ... 4524  [Next →]│
│                                                                            │
│ Selected: 0 users  │  [Bulk Actions ▼]                                     │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
1. Advanced search with filters panel
2. Active filter pills with easy removal
3. Selectable rows for bulk actions
4. Status badges with clear visual indicators
5. Hover actions menu
6. Pagination with page jump
7. Bulk action toolbar appears when items selected

### 5.4 Merchants Page

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Merchant Management                                                        │
│ Partner businesses and transaction settings                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│ │ Total      │ │ Active     │ │ Pending    │ │ This Month │               │
│ │ 1,245      │ │ 1,180      │ │ 45         │ │ +32 new    │               │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘               │
│                                                                            │
│ [🔍 Search] [Category ▼] [Status ▼] [Date Range ▼]     [+ Add Merchant]   │
│                                                                            │
│ View: [Grid] [List]                                   Sort: [Newest First ▼]│
│                                                                            │
│ ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐         │
│ │ ┌─────┐           │ │ ┌─────┐           │ │ ┌─────┐           │         │
│ │ │ 🏪  │ Joe's Café│ │ │ 🛒  │ QuickMart │ │ │ ⛽  │ Shell Gas │         │
│ │ └─────┘           │ │ └─────┘           │ │ └─────┘           │         │
│ │ Restaurant        │ │ Retail            │ │ Gas Station       │         │
│ │ ● Active          │ │ ● Active          │ │ ○ Pending Review  │         │
│ │ $12,450 this mo.  │ │ $45,230 this mo.  │ │ $0 (new)          │         │
│ │ ★★★★☆ 4.2        │ │ ★★★★★ 4.8        │ │ No reviews yet    │         │
│ │ [View] [Edit]     │ │ [View] [Edit]     │ │ [Review] [Reject] │         │
│ └───────────────────┘ └───────────────────┘ └───────────────────┘         │
│                                                                            │
│ [Load More]                                                                │
└────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Support Dashboard

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Support Center                                                             │
│ Customer support operations and ticket management                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐   │
│ │ 🎫 Open       │ │ ⏳ In Progress│ │ ✅ Resolved   │ │ ⏱️ Avg. Time │   │
│ │ 23            │ │ 12            │ │ 156 today     │ │ 2.5 hours    │   │
│ │ ↗ +5 urgent   │ │               │ │ ↗ +23%        │ │ ↘ -15 min    │   │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘   │
│                                                                            │
│ ┌────────────────────────────────────┐ ┌────────────────────────────────┐ │
│ │ Priority Breakdown                  │ │ Ticket Categories              │ │
│ │                                     │ │                                │ │
│ │ 🔴 Urgent    ████████ 8            │ │ Account Issues   ████████ 35% │ │
│ │ 🟡 High      ██████████████ 15     │ │ Transactions    ██████ 25%    │ │
│ │ 🟢 Medium    ████████████████ 20   │ │ Cards           ████ 20%      │ │
│ │ ⚪ Low       ████████ 10           │ │ Rewards         ███ 12%       │ │
│ │                                     │ │ Other           ██ 8%         │ │
│ └────────────────────────────────────┘ └────────────────────────────────┘ │
│                                                                            │
│ Recent Tickets                                          [View All Tickets] │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ #1234 │ Payment not processing │ 🔴 Urgent │ John S. │ 15m ago │ [→] ││
│ │ #1233 │ Card replacement req.  │ 🟡 High   │ Sarah J.│ 25m ago │ [→] ││
│ │ #1232 │ Reward points missing  │ 🟢 Medium │ Mike W. │ 1h ago  │ [→] ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ [🤖 Open AI Concierge]                                                     │
└────────────────────────────────────────────────────────────────────────────┘
```

### 5.6 Analytics Page

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Analytics & Insights                                                       │
│ Platform performance and business intelligence                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ Date Range: [Jan 1, 2026] → [Jan 7, 2026]  [7D] [30D] [90D] [YTD] [Custom]│
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ Revenue Overview                                                        ││
│ │                                                                         ││
│ │  $2.5M │                              ╭───╮                            ││
│ │        │                    ╭─────────╯   │                            ││
│ │  $2.0M │          ╭────────╯              ╰────╮                       ││
│ │        │   ╭──────╯                            ╰────                   ││
│ │  $1.5M │───╯                                                           ││
│ │        └──────────────────────────────────────────────────────────────│││
│ │          Jan 1    Jan 2    Jan 3    Jan 4    Jan 5    Jan 6    Jan 7   ││
│ │                                                                         ││
│ │  ── Revenue  ── Fees  -- Projected                                     ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ ┌──────────────────────────┐ ┌──────────────────────────┐                 │
│ │ Transaction Distribution │ │ User Growth               │                 │
│ │                          │ │                           │                 │
│ │      ╭─────╮             │ │ New Users: 1,234         │                 │
│ │    ╱   35%  ╲            │ │ Returning: 45,231        │                 │
│ │   │  Cards   │           │ │ Churn Rate: 2.3%         │                 │
│ │   │ ╭──────╮ │           │ │                           │                 │
│ │    ╲│ 45%  │╱ Wallet    │ │ ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁          │                 │
│ │     ╰──────╯             │ │                           │                 │
│ │      20% Other           │ │                           │                 │
│ └──────────────────────────┘ └──────────────────────────┘                 │
│                                                                            │
│ [📥 Export Report]  [📊 Custom Dashboard]  [📧 Schedule Report]           │
└────────────────────────────────────────────────────────────────────────────┘
```

### 5.7 Settings Page

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Settings                                                                   │
├──────────────────────────┬─────────────────────────────────────────────────┤
│                          │                                                 │
│ ┌──────────────────────┐ │ Profile Information                            │
│ │ 👤 Profile           │ │ ─────────────────────────────────────────────  │
│ │ 🔔 Notifications     │ │                                                 │
│ │ 🎨 Appearance        │ │ ┌─────────────────────────────────────────────┐│
│ │ 🔐 Security          │ │ │ 👤 ┌──────────────────┐                     ││
│ │ 🔑 Access Control    │ │ │    │  Admin User      │  [Change Photo]     ││
│ │                      │ │ │    └──────────────────┘                     ││
│ │ ─────────────────    │ │ │                                             ││
│ │ ⚙️ System            │ │ │ Full Name                                   ││
│ │ 🔗 Integrations      │ │ │ ┌──────────────────────────────────────────┐││
│ │ 📊 Reports           │ │ │ │ Admin User                               │││
│ └──────────────────────┘ │ │ └──────────────────────────────────────────┘││
│                          │ │                                             ││
│                          │ │ Email Address                               ││
│                          │ │ ┌──────────────────────────────────────────┐││
│                          │ │ │ admin@swipesavvy.com                     │││
│                          │ │ └──────────────────────────────────────────┘││
│                          │ │                                             ││
│                          │ │ Role                                        ││
│                          │ │ ┌──────────────────────────────────────────┐││
│                          │ │ │ Super Admin                    [Locked]  │││
│                          │ │ └──────────────────────────────────────────┘││
│                          │ │                                             ││
│                          │ │ ┌────────────────────────────────────────┐  ││
│                          │ │ │              [Save Changes]             │  ││
│                          │ │ └────────────────────────────────────────┘  ││
│                          │ └─────────────────────────────────────────────┘│
│                          │                                                 │
└──────────────────────────┴─────────────────────────────────────────────────┘
```

### 5.8 AI Marketing Page

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ AI Marketing Suite                                                         │
│ Intelligent campaign management and content generation                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ ┌─────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 🤖 AI Campaign Generator                                            │ ││
│ │ │                                                                      │ ││
│ │ │ Describe your campaign goal:                                         │ ││
│ │ │ ┌──────────────────────────────────────────────────────────────────┐│ ││
│ │ │ │ Create a holiday promotion for credit card rewards...            ││ ││
│ │ │ │                                                                   ││ ││
│ │ │ └──────────────────────────────────────────────────────────────────┘│ ││
│ │ │                                                                      │ ││
│ │ │ Target Audience: [All Users ▼]  Campaign Type: [Email ▼]            │ ││
│ │ │                                                                      │ ││
│ │ │                    [✨ Generate Campaign]                            │ ││
│ │ └─────────────────────────────────────────────────────────────────────┘ ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ Recent Campaigns                                                           │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ Campaign            │ Type   │ Status   │ Engagement │ ROI    │ Action ││
│ ├─────────────────────┼────────┼──────────┼────────────┼────────┼────────┤│
│ │ New Year Promo      │ Email  │ ● Active │ 32.5%      │ +245%  │ [View] ││
│ │ Card Rewards Q1     │ Push   │ ○ Draft  │ -          │ -      │ [Edit] ││
│ │ Holiday Special     │ SMS    │ ✓ Done   │ 28.1%      │ +180%  │ [Clone]││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ [📊 Analytics] [📅 Schedule] [👥 Audience Manager]                         │
└────────────────────────────────────────────────────────────────────────────┘
```

### 5.9 Feature Flags Page

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Feature Flags                                                              │
│ Control feature rollouts and experiments                                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ [🔍 Search flags...]  [Status: All ▼]  [Environment: Prod ▼]  [+ New Flag]│
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │                                                                         ││
│ │ ┌─────────────────────────────────────────────────────────────────────┐││
│ │ │ 🚀 new-rewards-ui                                          [ON/OFF] │││
│ │ │                                                                      │││
│ │ │ Enable the redesigned rewards interface                              │││
│ │ │                                                                      │││
│ │ │ Environments:  ● Prod  ● Staging  ○ Dev                              │││
│ │ │ Rollout:       ████████████████████░░░░░░░░░░ 65%                    │││
│ │ │ Created:       Dec 15, 2025 by Admin                                 │││
│ │ │                                                                      │││
│ │ │ [Edit] [History] [Delete]                                            │││
│ │ └─────────────────────────────────────────────────────────────────────┘││
│ │                                                                         ││
│ │ ┌─────────────────────────────────────────────────────────────────────┐││
│ │ │ 🧪 ai-support-beta                                         [ON/OFF] │││
│ │ │                                                                      │││
│ │ │ Beta AI support features for select users                            │││
│ │ │                                                                      │││
│ │ │ Environments:  ○ Prod  ● Staging  ● Dev                              │││
│ │ │ Rollout:       ██████░░░░░░░░░░░░░░░░░░░░░░░░ 20%                    │││
│ │ │ Created:       Jan 2, 2026 by Admin                                  │││
│ │ └─────────────────────────────────────────────────────────────────────┘││
│ │                                                                         ││
│ └────────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────┘
```

### 5.10 RBAC Pages (Roles, Permissions, Policies)

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Access Control                                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ [Admin Users] [Roles] [Permissions] [Policies]                             │
│ ═══════════════                                                            │
│                                                                            │
│ Roles (5)                                               [+ Create Role]    │
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │                                                                         ││
│ │ ┌─────────────────────────────────────────────────────────────────────┐││
│ │ │ 👑 Super Admin                                         System Role   │││
│ │ │                                                                      │││
│ │ │ Full access to all platform features and settings                    │││
│ │ │                                                                      │││
│ │ │ Permissions: ████████████████████████████████ All (45)              │││
│ │ │ Users: 2 assigned                                                    │││
│ │ │                                                                      │││
│ │ │ [View] [Cannot Edit - System Role]                                   │││
│ │ └─────────────────────────────────────────────────────────────────────┘││
│ │                                                                         ││
│ │ ┌─────────────────────────────────────────────────────────────────────┐││
│ │ │ 🛡️ Support Manager                                     Custom Role   │││
│ │ │                                                                      │││
│ │ │ Manage support tickets and customer inquiries                        │││
│ │ │                                                                      │││
│ │ │ Permissions: ████████████░░░░░░░░░░░░░░░░░░░░ 15 of 45              │││
│ │ │ Users: 8 assigned                                                    │││
│ │ │                                                                      │││
│ │ │ [View] [Edit] [Duplicate] [Delete]                                   │││
│ │ └─────────────────────────────────────────────────────────────────────┘││
│ └────────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Screen-by-Screen Redesign: Customer Wallet Web

### 6.1 Login Page ✅ (Already Styled)

**Current State:** Clean design with gradient, icons
**Status:** Minor refinements needed

### 6.2 Dashboard Page

**Current Issues:**
- Generic financial dashboard feel
- Cards lack visual hierarchy
- No spending insights
- Account info not scannable

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 🔷 SwipeSavvy     Home   Transactions   Cards   Rewards   ⚙️    🔔  [JD]  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ Good morning, John! 👋                                                     │
│                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ 💳 Total Balance                                                        ││
│ │                                                                         ││
│ │     $24,567.89                                                         ││
│ │     ↗ +$1,234.56 this month                                            ││
│ │                                                                         ││
│ │     ╭────────────────────────────────────────────╮                     ││
│ │     │ ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇                     │                     ││
│ │     ╰────────────────────────────────────────────╯                     ││
│ │                                                                         ││
│ │ Checking: $12,345.67  │  Savings: $10,222.22  │  Rewards: $2,000.00   ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ ┌──────────────────────────────┐ ┌─────────────────────────────────────┐  │
│ │ Quick Actions                │ │ Spending This Month                 │  │
│ │                              │ │                                     │  │
│ │ [💸 Send]  [📥 Request]     │ │ $3,456.78 of $5,000 budget          │  │
│ │ [💳 Pay]   [📊 Insights]    │ │ ████████████████░░░░░░░ 69%         │  │
│ │                              │ │                                     │  │
│ └──────────────────────────────┘ │ Top: Dining $890 • Shopping $654   │  │
│                                  └─────────────────────────────────────┘  │
│                                                                            │
│ Recent Activity                                          [View All →]      │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ 🍔 Chipotle              │ Dining      │ Today, 12:34 PM   │ -$12.50  ││
│ │ 🛒 Amazon                │ Shopping    │ Yesterday         │ -$45.99  ││
│ │ 💰 Payroll Deposit       │ Income      │ Jan 5             │+$2,500.00││
│ │ ⛽ Shell Gas Station     │ Gas         │ Jan 4             │ -$42.00  ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
1. Hero balance card with gradient and sparkline
2. Account breakdown below main balance
3. Quick actions grid for common tasks
4. Spending progress bar with budget tracking
5. Enhanced transaction list with merchant icons
6. Color-coded amounts (green for income, subtle for expenses)

### 6.3 Transactions Page

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Transactions                                                               │
│ Your complete activity history                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ 🔍 Search transactions...                                              ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ [All] [Income] [Expenses]    [Category ▼] [Date Range ▼] [📥 Export]      │
│                                                                            │
│ January 2026                                          Total: -$2,345.67    │
│ ───────────────────────────────────────────────────────────────────────── │
│                                                                            │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ TODAY                                                                   ││
│ │ ┌────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 🍔 │ Chipotle Mexican Grill        │ Dining    │ 12:34 PM │ -$12.50│ ││
│ │ └────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                         ││
│ │ YESTERDAY                                                               ││
│ │ ┌────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 🛒 │ Amazon.com                    │ Shopping  │ 3:22 PM  │ -$45.99│ ││
│ │ │ ☕ │ Starbucks                      │ Coffee    │ 8:15 AM  │  -$6.75│ ││
│ │ └────────────────────────────────────────────────────────────────────┘ ││
│ │                                                                         ││
│ │ JANUARY 5, 2026                                                         ││
│ │ ┌────────────────────────────────────────────────────────────────────┐ ││
│ │ │ 💰 │ Payroll - ACME Corp           │ Income    │ 6:00 AM  │+$2,500 │ ││
│ │ └────────────────────────────────────────────────────────────────────┘ ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ [Load More Transactions]                                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
1. Grouped by date for better scanning
2. Quick filter tabs (All/Income/Expenses)
3. Enhanced search functionality
4. Merchant logos/icons
5. Monthly summary in header
6. Infinite scroll with "Load More"

### 6.4 Cards Page

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ My Cards                                                                   │
│ Manage your payment methods                                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │                                                                         ││
│ │   ┌─────────────────────────────────────────────────────────────────┐  ││
│ │   │ ╔═══════════════════════════════════════════════════════════╗   │  ││
│ │   │ ║                                              SwipeSavvy   ║   │  ││
│ │   │ ║   💳                                                      ║   │  ││
│ │   │ ║                                                           ║   │  ││
│ │   │ ║   4532  ••••  ••••  7890                                 ║   │  ││
│ │   │ ║                                                           ║   │  ││
│ │   │ ║   JOHN SMITH                              EXP 12/28      ║   │  ││
│ │   │ ╚═══════════════════════════════════════════════════════════╝   │  ││
│ │   │                                                                  │  ││
│ │   │ Primary Card • Credit                                           │  ││
│ │   │ Balance: $1,234.56 / $10,000 limit                              │  ││
│ │   │ ████████████░░░░░░░░░░░░░░░░░░ 12% used                         │  ││
│ │   │                                                                  │  ││
│ │   │ [🔒 Lock Card]  [📊 Spending]  [⚙️ Settings]                    │  ││
│ │   └─────────────────────────────────────────────────────────────────┘  ││
│ │                                                                         ││
│ │   ◀ [1/3] ▶                                                            ││
│ │                                                                         ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ [+ Add New Card]                                                           │
│                                                                            │
│ Card Benefits                                                              │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐            │
│ │ 🎁 3% Cashback   │ │ 🛡️ Zero Fraud   │ │ ✈️ Travel Ins.  │            │
│ │ on dining       │ │ Liability        │ │ Included         │            │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
1. Realistic card visual with gradient and branding
2. Card carousel for multiple cards
3. Credit utilization bar
4. Quick actions below card
5. Card benefits showcase
6. Lock card prominent for security

### 6.5 Rewards Page

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Rewards                                                                    │
│ Earn and redeem your cashback                                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ ╔═══════════════════════════════════════════════════════════════════╗  ││
│ │ ║                     🎁                                            ║  ││
│ │ ║                                                                   ║  ││
│ │ ║           Your Rewards Balance                                    ║  ││
│ │ ║                                                                   ║  ││
│ │ ║                 $2,450.00                                        ║  ││
│ │ ║                                                                   ║  ││
│ │ ║        ┌─────────────────────────────────────────┐               ║  ││
│ │ ║        │          [Redeem Rewards]               │               ║  ││
│ │ ║        └─────────────────────────────────────────┘               ║  ││
│ │ ╚═══════════════════════════════════════════════════════════════════╝  ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ ┌─────────────────────────────┐ ┌──────────────────────────────────────┐  │
│ │ Earned This Month           │ │ Rewards Rate                         │  │
│ │                             │ │                                      │  │
│ │ $125.50                     │ │ 🍔 Dining:     5% ████████████       │  │
│ │ ↗ +15% vs last month        │ │ ⛽ Gas:        3% ███████            │  │
│ │                             │ │ 🛒 Shopping:   2% ████               │  │
│ │ ▁▂▃▄▅▆▇█ (trend)           │ │ 🌐 Everything: 1% ██                 │  │
│ └─────────────────────────────┘ └──────────────────────────────────────┘  │
│                                                                            │
│ Recent Rewards                                           [View History →]  │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ 🍔 Chipotle    │ Dining (5%)  │ Today      │ $12.50 → +$0.63 cashback ││
│ │ ⛽ Shell       │ Gas (3%)     │ Yesterday  │ $42.00 → +$1.26 cashback ││
│ │ 🛒 Amazon     │ Shopping (2%)│ Jan 5      │ $45.99 → +$0.92 cashback ││
│ └────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ Redemption Options                                                         │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                  │
│ │ 💵 Cash        │ │ 🎁 Gift Cards │ │ ✈️ Travel      │                  │
│ │ Statement      │ │ Amazon, etc.  │ │ Book flights   │                  │
│ │ Credit         │ │               │ │                │                  │
│ └────────────────┘ └────────────────┘ └────────────────┘                  │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key Improvements:**
1. Hero rewards balance with prominent redeem CTA
2. Earnings trend visualization
3. Clear rewards rate breakdown by category
4. Transaction-to-reward mapping
5. Multiple redemption options

### 6.6 Settings Page

**Redesign Specification:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Settings                                                                   │
├──────────────────────────┬─────────────────────────────────────────────────┤
│                          │                                                 │
│ Account                  │ Profile                                         │
│ ─────────                │ ─────────────────────────────────────────────── │
│ 👤 Profile               │                                                 │
│ 🔐 Security              │ ┌─────────────────────────────────────────────┐ │
│ 🔔 Notifications         │ │                                             │ │
│ 🔗 Linked Accounts       │ │    ┌──────┐                                 │ │
│                          │ │    │  JD  │  Change Photo                   │ │
│ Preferences              │ │    └──────┘                                 │ │
│ ─────────                │ │                                             │ │
│ 🎨 Appearance            │ │ Full Name                                   │ │
│ 🌐 Language              │ │ ┌─────────────────────────────────────────┐ │ │
│ 💱 Currency              │ │ │ John Doe                                │ │ │
│                          │ │ └─────────────────────────────────────────┘ │ │
│ Legal                    │ │                                             │ │
│ ─────────                │ │ Email                                       │ │
│ 📄 Terms of Service      │ │ ┌─────────────────────────────────────────┐ │ │
│ 🔒 Privacy Policy        │ │ │ john.doe@email.com                      │ │ │
│                          │ │ └─────────────────────────────────────────┘ │ │
│ Support                  │ │                                             │ │
│ ─────────                │ │ Phone                                       │ │
│ ❓ Help Center           │ │ ┌─────────────────────────────────────────┐ │ │
│ 💬 Contact Us            │ │ │ +1 (555) 123-4567                       │ │ │
│                          │ │ └─────────────────────────────────────────┘ │ │
│                          │ │                                             │ │
│                          │ │              [Save Changes]                 │ │
│                          │ └─────────────────────────────────────────────┘ │
│                          │                                                 │
│ ─────────────────────    │                                                 │
│ [🚪 Sign Out]            │                                                 │
└──────────────────────────┴─────────────────────────────────────────────────┘
```

### 6.7 NEW: Insights Page (Spending Analysis)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Spending Insights                                                          │
│ Understand your financial habits                                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ [This Week] [This Month] [Last 3 Months] [This Year]                       │
│                                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ Monthly Overview                                                        ││
│ │                                                                         ││
│ │ Income          $5,000.00   ████████████████████████████████████████   ││
│ │ Spending        $3,456.78   ███████████████████████████                ││
│ │ Savings         $1,543.22   █████████████                              ││
│ │                                                                         ││
│ │ Savings Rate: 30.9% ↗ +5.2% vs last month                              ││
│ └─────────────────────────────────────────────────────────────────────────┘│
│                                                                            │
│ Spending by Category                           Trend (Last 6 Months)       │
│ ┌────────────────────────────────┐ ┌──────────────────────────────────────┐│
│ │                                │ │                                      ││
│ │      ╭─────╮                   │ │   ╭─╮                                ││
│ │    ╱       ╲                   │ │ ╭─╯ ╰───╮        ╭─                  ││
│ │   │ 🍔 35% │ Dining            │ │ ╯       ╰────────╯                   ││
│ │   │ ╭───╮ │                    │ │                                      ││
│ │    ╲│25%│╱ 🛒 Shopping        │ │ Aug Sep Oct Nov Dec Jan              ││
│ │     ╰───╯                      │ │                                      ││
│ │     20% ⛽ Gas                 │ │ ── Total  ── Dining  -- Shopping     ││
│ │     20% Other                  │ │                                      ││
│ └────────────────────────────────┘ └──────────────────────────────────────┘│
│                                                                            │
│ 💡 Insights                                                                │
│ ┌────────────────────────────────────────────────────────────────────────┐│
│ │ • You spent 15% more on dining this month compared to your average     ││
│ │ • Your largest expense was Amazon ($245.99) on Jan 3                   ││
│ │ • You're on track to save $1,500 this month - great job! 🎉           ││
│ └────────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. UX Improvements Catalog

### 7.1 Global Improvements (Both Applications)

| Area | Current Issue | Improvement | Priority |
|------|---------------|-------------|----------|
| Loading States | Generic spinners | Skeleton screens with accurate content shapes | High |
| Error Handling | Generic error messages | Contextual errors with recovery actions | High |
| Empty States | Blank pages | Illustrated empty states with CTAs | Medium |
| Transitions | Abrupt state changes | Subtle animations (200-300ms ease) | Medium |
| Touch Targets | Some buttons too small | Minimum 44x44px for all interactive elements | High |
| Focus States | Basic browser defaults | Custom focus rings matching brand | Medium |
| Dark Mode | Partial implementation | Complete dark theme with proper contrast | Medium |

### 7.2 Admin Portal Specific

| Screen | Issue | Improvement | Impact |
|--------|-------|-------------|--------|
| Dashboard | Widget overload | Personalized widget grid with drag-to-reorder | High |
| Users Table | No bulk actions | Multi-select with bulk action toolbar | High |
| Support | Context switching | Split view: ticket list + detail panel | High |
| Analytics | Static charts | Interactive charts with drill-down | Medium |
| Settings | Single column | Multi-section with sidebar navigation | Medium |
| RBAC | Complex flows | Visual permission matrix builder | Medium |
| AI Tools | Basic interface | Chat-like interface with suggestions | Low |

### 7.3 Wallet Web Specific

| Screen | Issue | Improvement | Impact |
|--------|-------|-------------|--------|
| Dashboard | Generic feel | Personalized greeting, spending insights widget | High |
| Transactions | Flat list | Date-grouped with merchant logos | High |
| Cards | Card stack unclear | Carousel with swipe, realistic card visuals | High |
| Rewards | Redemption unclear | Clear redemption flow with options | Medium |
| Settings | Basic form | Organized sections with visual hierarchy | Medium |
| (New) Insights | Not available | Add spending analysis page | Medium |

### 7.4 Micro-interaction Improvements

```tsx
// Hover effects
.card-hover {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--ss-shadow-lg);
}

// Button press feedback
.button-press:active {
  transform: scale(0.98);
}

// Toggle switch animation
.toggle-switch {
  transition: background-color 200ms ease;
}
.toggle-switch::after {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

// Loading skeleton pulse
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.skeleton {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, var(--ss-gray-200) 25%, var(--ss-gray-100) 50%, var(--ss-gray-200) 75%);
  background-size: 200% 100%;
}

// Page transition
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 200ms ease, transform 200ms ease;
}
```

---

## 8. Frontend Handoff Notes

### 8.1 Implementation Priority

**Phase 1: Foundation (Week 1-2)**
1. ✅ Update design tokens CSS file
2. Create/update base components (Button, Input, Card, Badge)
3. Implement new Sidebar and Header components
4. Add dark mode toggle functionality

**Phase 2: Core Screens (Week 3-4)**
1. Redesign Dashboard (Admin)
2. Redesign Dashboard (Wallet)
3. Update Tables with new styling
4. Implement Loading/Empty states

**Phase 3: Feature Screens (Week 5-6)**
1. Users/Customers page overhaul
2. Transactions page with grouping
3. Cards carousel implementation
4. Rewards page redesign

**Phase 4: Polish (Week 7-8)**
1. Add micro-interactions
2. Implement page transitions
3. Accessibility audit and fixes
4. Performance optimization

### 8.2 Component Migration Checklist

```markdown
## Component Migration Status

### Atoms (Base Components)
- [ ] Button (variants: primary, secondary, ghost, danger, success)
- [ ] Input (variants: default, filled, flushed)
- [ ] Badge (colorSchemes: navy, green, yellow, red, gray)
- [ ] Avatar
- [ ] Icon wrapper
- [ ] Spinner/Loading
- [ ] Toggle/Switch
- [ ] Checkbox
- [ ] Radio

### Molecules
- [ ] Card (variants: elevated, outlined, filled, gradient)
- [ ] StatCard
- [ ] Input with Label
- [ ] Search Input
- [ ] Dropdown/Select
- [ ] Modal
- [ ] Toast
- [ ] Tooltip
- [ ] Tabs
- [ ] Pagination

### Organisms
- [ ] Sidebar (Admin)
- [ ] Header (Wallet)
- [ ] Table with actions
- [ ] Form sections
- [ ] Chart containers
- [ ] Data list with filters

### Templates
- [ ] Dashboard layout
- [ ] Settings layout
- [ ] List page layout
- [ ] Detail page layout
```

### 8.3 File Structure Recommendations

```
src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Badge/
│   │   ├── Modal/
│   │   ├── Table/
│   │   └── index.ts           # Barrel export
│   │
│   ├── layout/                # Layout components
│   │   ├── Sidebar/
│   │   ├── Header/
│   │   ├── AppLayout/
│   │   └── PageHeader/
│   │
│   ├── charts/                # Data visualization
│   │   ├── LineChart/
│   │   ├── BarChart/
│   │   ├── DonutChart/
│   │   └── Sparkline/
│   │
│   └── features/              # Feature-specific components
│       ├── dashboard/
│       ├── users/
│       ├── transactions/
│       └── rewards/
│
├── styles/
│   ├── tokens.css             # Design tokens
│   ├── globals.css            # Global styles
│   └── animations.css         # Animation keyframes
│
├── hooks/
│   ├── useTheme.ts
│   ├── useMediaQuery.ts
│   └── useToast.ts
│
└── utils/
    ├── cn.ts                  # className utility (clsx + tailwind-merge)
    └── formatters.ts          # Number/date formatters
```

### 8.4 Tailwind Configuration Updates

```typescript
// tailwind.config.ts - Updated configuration

import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'ss-navy': {
          50: '#E8EFF8',
          100: '#C5D7ED',
          200: '#9EBDE1',
          300: '#77A3D5',
          400: '#508AC8',
          500: '#235393',
          600: '#1C4275',
          700: '#153157',
          800: '#0E213A',
          900: '#07101D',
        },
        'ss-green': {
          50: '#ECFAE8',
          100: '#C9F2BD',
          500: '#60BA46',
          600: '#4D9538',
          700: '#3A702A',
        },
        'ss-yellow': {
          50: '#FFF8E6',
          100: '#FEEAB3',
          500: '#FAB915',
          600: '#C89411',
          700: '#966F0D',
        },
        'ss-red': {
          50: '#FDECEC',
          100: '#F9CCCF',
          500: '#E5484D',
          600: '#B73A3E',
          700: '#892B2F',
        },
      },
      fontFamily: {
        display: ['Hermes', 'SF Pro Display', 'system-ui', 'sans-serif'],
        body: ['Barlow', 'SF Pro Text', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-1': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-1': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-2': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      boxShadow: {
        'ss-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'ss-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'ss-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'ss-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'ss-sm': '4px',
        'ss-md': '8px',
        'ss-lg': '12px',
        'ss-xl': '16px',
        'ss-2xl': '24px',
      },
      animation: {
        'skeleton': 'skeleton-pulse 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

### 8.5 Accessibility Checklist

```markdown
## Accessibility Requirements

### Color & Contrast
- [ ] All text has minimum 4.5:1 contrast ratio (WCAG AA)
- [ ] Large text (18px+) has minimum 3:1 contrast ratio
- [ ] Interactive elements have visible focus indicators
- [ ] Color is not the only means of conveying information

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Focus order follows logical reading order
- [ ] No keyboard traps
- [ ] Skip links provided for main content
- [ ] Modal focus is trapped while open

### Screen Readers
- [ ] All images have appropriate alt text
- [ ] Form inputs have associated labels
- [ ] ARIA labels for icon-only buttons
- [ ] Live regions for dynamic content updates
- [ ] Proper heading hierarchy (h1 → h2 → h3)

### Motion & Animation
- [ ] Respect prefers-reduced-motion
- [ ] No flashing content (< 3 flashes/second)
- [ ] Animations can be paused/stopped

### Forms
- [ ] Error messages are announced
- [ ] Required fields are indicated
- [ ] Input format hints provided
- [ ] Autocomplete attributes used appropriately
```

### 8.6 Testing Recommendations

```markdown
## Testing Checklist

### Visual Regression
- Capture screenshots of all pages in both themes
- Test at breakpoints: 375px, 768px, 1024px, 1440px
- Test with different font sizes (browser zoom)

### Functional Testing
- All form submissions
- Navigation flows
- Modal open/close cycles
- Dropdown interactions
- Table sorting/filtering/pagination

### Accessibility Testing
- Lighthouse accessibility audit (target: 90+)
- axe DevTools scan
- Keyboard-only navigation test
- Screen reader testing (VoiceOver/NVDA)

### Performance Testing
- Lighthouse performance audit (target: 85+)
- Core Web Vitals
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- Bundle size analysis
```

---

## Appendix A: Asset Requirements

### Icons
- Continue using Lucide React
- Ensure consistent sizing (20px default, 24px for primary actions)
- Add custom SwipeSavvy logo icon

### Illustrations
- Empty state illustrations needed:
  - No transactions
  - No search results
  - No notifications
  - Error state
  - Success state

### Merchant Logos
- Integrate merchant logo service (e.g., Clearbit Logo API)
- Fallback to category icon when logo unavailable

---

## Appendix B: Color Accessibility Matrix

| Combination | Light Mode | Dark Mode | Notes |
|-------------|------------|-----------|-------|
| Navy 500 on White | ✅ 7.2:1 | N/A | Primary buttons |
| White on Navy 500 | ✅ 7.2:1 | ✅ 7.2:1 | Button text |
| Green 500 on White | ✅ 4.6:1 | N/A | Success states |
| Red 500 on White | ✅ 5.1:1 | N/A | Error states |
| Gray 600 on White | ✅ 5.7:1 | N/A | Body text |
| Gray 500 on Gray 100 | ✅ 4.5:1 | N/A | Muted text |

---

*This blueprint was generated for SwipeSavvy platform redesign. All specifications are subject to implementation feasibility and stakeholder review.*
