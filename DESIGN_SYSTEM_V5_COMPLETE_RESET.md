# SwipeSavvy Design System V5 — Complete Reset

## Overview

This document defines **two separate design systems** for distinct user experiences:

1. **Admin UX** — Bank-grade internal operations console
2. **Consumer UX** — Trust-first resume creation platform

Both systems enforce:
- Full UI/UX reset (no legacy reuse)
- Bank-grade trust heuristics
- FinTech-style dark mode requirements
- WCAG 2.2 AA accessibility compliance

---

# PART 1: ADMIN UX DESIGN SYSTEM

## Design Philosophy

> **Precision over delight.**

The Admin UX is designed for operators, support staff, and compliance users who need:
- Absolute clarity of system state
- Zero ambiguity in actions
- High information density without clutter
- Safe handling of sensitive user and financial data

### Core Principles

1. **Visual Discipline** — Neutral colors only; status colors for status only
2. **Data Integrity** — Read vs Write actions clearly separated
3. **Cognitive Safety** — Predictable, consistent patterns everywhere
4. **Long Session Optimization** — Reduced eye strain for 8+ hour shifts

---

## Admin Color System

### Light Mode

```css
/* Background Hierarchy */
--admin-bg-canvas: #F8FAFC;        /* Page background - slate-50 */
--admin-bg-surface: #FFFFFF;       /* Cards, panels */
--admin-bg-elevated: #FFFFFF;      /* Modals, dropdowns */
--admin-bg-subtle: #F1F5F9;        /* Muted sections - slate-100 */
--admin-bg-muted: #E2E8F0;         /* Disabled - slate-200 */

/* Text Hierarchy */
--admin-text-primary: #0F172A;     /* slate-900 */
--admin-text-secondary: #475569;   /* slate-600 */
--admin-text-tertiary: #64748B;    /* slate-500 */
--admin-text-disabled: #94A3B8;    /* slate-400 */
--admin-text-inverse: #FFFFFF;

/* Border System */
--admin-border-subtle: #E2E8F0;    /* slate-200 */
--admin-border-default: #CBD5E1;   /* slate-300 */
--admin-border-strong: #94A3B8;    /* slate-400 */
--admin-border-focus: #2563EB;     /* blue-600 */
```

### Dark Mode (True Dark — NOT inverted light)

```css
/* Background Hierarchy - Deep charcoal, NO pure black (#000) */
--admin-bg-canvas: #0C0F14;        /* Deep charcoal base */
--admin-bg-surface: #151922;       /* Card surfaces */
--admin-bg-elevated: #1E232E;      /* Elevated elements */
--admin-bg-subtle: #12161D;        /* Muted sections */
--admin-bg-muted: #1E232E;         /* Disabled states */

/* Text Hierarchy */
--admin-text-primary: #F1F5F9;     /* slate-100 */
--admin-text-secondary: #94A3B8;   /* slate-400 */
--admin-text-tertiary: #64748B;    /* slate-500 */
--admin-text-disabled: #475569;    /* slate-600 */
--admin-text-inverse: #0F172A;

/* Border System */
--admin-border-subtle: #1E232E;
--admin-border-default: #2D3748;
--admin-border-strong: #475569;
--admin-border-focus: #3B82F6;     /* blue-500 */
```

### Status Colors (ONLY for status indication)

```css
/* Success - For completed actions, healthy states */
--admin-status-success: #16A34A;
--admin-status-success-subtle: #DCFCE7;
--admin-status-success-text: #166534;
--admin-status-success-dark: #22C55E;
--admin-status-success-subtle-dark: #14532D;

/* Warning - For attention required, pending states */
--admin-status-warning: #CA8A04;
--admin-status-warning-subtle: #FEF9C3;
--admin-status-warning-text: #854D0E;
--admin-status-warning-dark: #EAB308;
--admin-status-warning-subtle-dark: #422006;

/* Danger - For errors, destructive actions, critical alerts */
--admin-status-danger: #DC2626;
--admin-status-danger-subtle: #FEE2E2;
--admin-status-danger-text: #991B1B;
--admin-status-danger-dark: #EF4444;
--admin-status-danger-subtle-dark: #450A0A;

/* Info - For informational states, neutral highlights */
--admin-status-info: #2563EB;
--admin-status-info-subtle: #DBEAFE;
--admin-status-info-text: #1E40AF;
--admin-status-info-dark: #3B82F6;
--admin-status-info-subtle-dark: #1E3A8A;
```

---

## Admin Typography

```css
/* Font Stack */
--admin-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--admin-font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

/* Type Scale */
--admin-text-xs: 0.6875rem;       /* 11px - Timestamps, badges */
--admin-text-sm: 0.8125rem;       /* 13px - Table cells, secondary */
--admin-text-base: 0.875rem;      /* 14px - Body text */
--admin-text-lg: 1rem;            /* 16px - Subheadings */
--admin-text-xl: 1.125rem;        /* 18px - Section titles */
--admin-text-2xl: 1.25rem;        /* 20px - Page titles */
--admin-text-3xl: 1.5rem;         /* 24px - Dashboard headers */

/* Font Weights */
--admin-font-normal: 400;
--admin-font-medium: 500;
--admin-font-semibold: 600;

/* Line Heights */
--admin-leading-tight: 1.25;
--admin-leading-normal: 1.5;
--admin-leading-relaxed: 1.625;
```

---

## Admin Spacing System (4px base grid)

```css
--admin-space-0: 0;
--admin-space-1: 0.25rem;         /* 4px */
--admin-space-2: 0.5rem;          /* 8px */
--admin-space-3: 0.75rem;         /* 12px */
--admin-space-4: 1rem;            /* 16px */
--admin-space-5: 1.25rem;         /* 20px */
--admin-space-6: 1.5rem;          /* 24px */
--admin-space-8: 2rem;            /* 32px */
--admin-space-10: 2.5rem;         /* 40px */
--admin-space-12: 3rem;           /* 48px */
--admin-space-16: 4rem;           /* 64px */
```

---

## Admin Component Specifications

### Tables

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER ROW                                                          │
│ Height: 40px                                                        │
│ Background: bg-subtle                                               │
│ Font: text-xs, font-semibold, text-secondary, uppercase            │
│ Letter-spacing: 0.05em                                              │
├─────────────────────────────────────────────────────────────────────┤
│ DATA ROW                                                            │
│ Height: 48px                                                        │
│ Background: bg-surface (alternating: bg-subtle)                    │
│ Font: text-sm, text-primary                                         │
│ Border-bottom: border-subtle                                        │
├─────────────────────────────────────────────────────────────────────┤
│ HOVER STATE                                                         │
│ Background: bg-subtle                                               │
│ Transition: 100ms                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Buttons

| Variant   | Background          | Text              | Border            |
|-----------|---------------------|-------------------|-------------------|
| Primary   | interactive-primary | white             | none              |
| Secondary | bg-surface          | text-primary      | border-default    |
| Ghost     | transparent         | text-secondary    | none              |
| Danger    | transparent         | status-danger     | status-danger     |
| Danger-fill | status-danger     | white             | none              |

**Button Sizes:**
- `sm`: 28px height, text-xs, px-3
- `md`: 36px height, text-sm, px-4
- `lg`: 44px height, text-base, px-5

### Form Inputs

```
┌─────────────────────────────────────────────────────────────────────┐
│ LABEL                                                               │
│ Font: text-sm, font-medium, text-secondary                         │
│ Margin-bottom: 6px                                                  │
├─────────────────────────────────────────────────────────────────────┤
│ INPUT FIELD                                                         │
│ Height: 40px                                                        │
│ Background: bg-surface                                              │
│ Border: border-default (1px)                                        │
│ Border-radius: 6px                                                  │
│ Padding: 10px 12px                                                  │
│ Font: text-base, text-primary                                       │
│                                                                     │
│ :focus                                                              │
│ Border: border-focus                                                │
│ Box-shadow: focus-ring (0 0 0 3px rgba(37, 99, 235, 0.15))        │
│                                                                     │
│ :disabled                                                           │
│ Background: bg-muted                                                │
│ Color: text-disabled                                                │
│ Cursor: not-allowed                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ HELPER TEXT                                                         │
│ Font: text-xs, text-tertiary                                       │
│ Margin-top: 4px                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Cards

```
┌─────────────────────────────────────────────────────────────────────┐
│ CARD                                                                │
│ Background: bg-surface                                              │
│ Border: border-subtle (1px)                                         │
│ Border-radius: 8px                                                  │
│ Box-shadow: shadow-sm                                               │
│ Padding: 20px                                                       │
│                                                                     │
│ CARD HEADER                                                         │
│ Padding-bottom: 16px                                                │
│ Border-bottom: border-subtle                                        │
│ Margin-bottom: 16px                                                 │
│                                                                     │
│ CARD TITLE                                                          │
│ Font: text-lg, font-semibold, text-primary                         │
│                                                                     │
│ CARD DESCRIPTION                                                    │
│ Font: text-sm, text-secondary                                       │
│ Margin-top: 4px                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Badges / Status Indicators

```css
/* Badge Base */
display: inline-flex;
align-items: center;
padding: 2px 8px;
border-radius: 4px;
font-size: 11px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.025em;

/* Status Variants */
.badge-success { background: status-success-subtle; color: status-success-text; }
.badge-warning { background: status-warning-subtle; color: status-warning-text; }
.badge-danger  { background: status-danger-subtle; color: status-danger-text; }
.badge-info    { background: status-info-subtle; color: status-info-text; }
.badge-neutral { background: bg-subtle; color: text-secondary; }
```

---

## Admin Screen Requirements

Each admin screen MUST define:

1. **Empty State** — What users see when there's no data
2. **Loading State** — Skeleton loaders, not spinners
3. **Error State** — Clear error message with recovery action
4. **Success Confirmation** — Toast or inline confirmation

### Admin Screens to Build

| Screen | Purpose | Key Components |
|--------|---------|----------------|
| Admin Login | Secure authentication | MFA support, audit logging |
| Dashboard | System overview | Stat cards, activity feed |
| User Management | View/manage users | Data table, filters, bulk actions |
| User Detail | Single user view | Profile, activity, permissions |
| Subscription Management | Billing oversight | Plan details, payment history |
| AI Usage Logs | AI interaction audit | Log viewer, search, export |
| Audit Logs | System event history | Immutable log viewer |
| System Health | Infrastructure status | Status indicators, alerts |
| Roles & Permissions | RBAC management | Role editor, permission matrix |
| Settings | System configuration | Form-based settings |

---

# PART 2: CONSUMER UX DESIGN SYSTEM

## Design Philosophy

> **Trust, clarity, and emotional safety.**

The Consumer UX must feel like a digital banking app while remaining friendly and easy to use. Users are entering sensitive personal and career data.

### Core Principles

1. **Trust First** — Users must feel safe entering personal data
2. **Guided Journey** — Step-by-step progress toward resume export
3. **Calm Aesthetic** — No overwhelming visuals or sudden changes
4. **AI Transparency** — Clear labeling when AI is involved

---

## Consumer Color System

### Light Mode

```css
/* Background Hierarchy */
--consumer-bg-canvas: #FFFFFF;        /* Pure white base */
--consumer-bg-surface: #FFFFFF;       /* Cards */
--consumer-bg-elevated: #FFFFFF;      /* Modals */
--consumer-bg-subtle: #F9FAFB;        /* Sections - gray-50 */
--consumer-bg-muted: #F3F4F6;         /* Disabled - gray-100 */

/* Text Hierarchy */
--consumer-text-primary: #111827;     /* gray-900 */
--consumer-text-secondary: #4B5563;   /* gray-600 */
--consumer-text-tertiary: #6B7280;    /* gray-500 */
--consumer-text-disabled: #9CA3AF;    /* gray-400 */
--consumer-text-inverse: #FFFFFF;

/* Border System */
--consumer-border-subtle: #F3F4F6;    /* gray-100 */
--consumer-border-default: #E5E7EB;   /* gray-200 */
--consumer-border-strong: #D1D5DB;    /* gray-300 */
--consumer-border-focus: #2563EB;     /* blue-600 */

/* Primary Accent - Used sparingly for primary actions only */
--consumer-accent: #2563EB;           /* blue-600 */
--consumer-accent-hover: #1D4ED8;     /* blue-700 */
--consumer-accent-light: #EFF6FF;     /* blue-50 */
```

### Dark Mode (True Dark — Calm, not harsh)

```css
/* Background Hierarchy */
--consumer-bg-canvas: #111827;        /* gray-900 */
--consumer-bg-surface: #1F2937;       /* gray-800 */
--consumer-bg-elevated: #374151;      /* gray-700 */
--consumer-bg-subtle: #1F2937;        /* gray-800 */
--consumer-bg-muted: #374151;         /* gray-700 */

/* Text Hierarchy */
--consumer-text-primary: #F9FAFB;     /* gray-50 */
--consumer-text-secondary: #D1D5DB;   /* gray-300 */
--consumer-text-tertiary: #9CA3AF;    /* gray-400 */
--consumer-text-disabled: #6B7280;    /* gray-500 */
--consumer-text-inverse: #111827;

/* Border System */
--consumer-border-subtle: #374151;    /* gray-700 */
--consumer-border-default: #4B5563;   /* gray-600 */
--consumer-border-strong: #6B7280;    /* gray-500 */
--consumer-border-focus: #3B82F6;     /* blue-500 */

/* Primary Accent */
--consumer-accent: #3B82F6;           /* blue-500 */
--consumer-accent-hover: #2563EB;     /* blue-600 */
--consumer-accent-light: #1E3A8A;     /* blue-900 */
```

---

## Consumer Typography

```css
/* Font Stack - Friendlier than Admin */
--consumer-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--consumer-font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;

/* Type Scale - Slightly larger than Admin */
--consumer-text-xs: 0.75rem;         /* 12px */
--consumer-text-sm: 0.875rem;        /* 14px */
--consumer-text-base: 1rem;          /* 16px */
--consumer-text-lg: 1.125rem;        /* 18px */
--consumer-text-xl: 1.25rem;         /* 20px */
--consumer-text-2xl: 1.5rem;         /* 24px */
--consumer-text-3xl: 1.875rem;       /* 30px */
--consumer-text-4xl: 2.25rem;        /* 36px */

/* Font Weights */
--consumer-font-normal: 400;
--consumer-font-medium: 500;
--consumer-font-semibold: 600;
--consumer-font-bold: 700;
```

---

## Consumer Component Specifications

### Progress Indicator

```
Step 1         Step 2         Step 3         Step 4
  ●──────────────●──────────────○──────────────○
Contact       Experience     Education      Review

Active: accent color, filled circle
Completed: accent color, check icon
Upcoming: border-default, empty circle
```

### Autosave Indicator

```
┌─────────────────────────────────────────────────────────────────────┐
│ AUTOSAVE STATUS                                                     │
│ Position: Fixed, bottom-right corner                                │
│ States:                                                             │
│   - Saving: "Saving..." with subtle pulse animation                │
│   - Saved: "All changes saved" with checkmark                      │
│   - Error: "Unable to save" with retry button                      │
│                                                                     │
│ Visibility: Appears on change, fades after 3s on success          │
└─────────────────────────────────────────────────────────────────────┘
```

### AI Assistance Panel

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🤖 AI SUGGESTION                                                    │
│─────────────────────────────────────────────────────────────────────│
│                                                                     │
│ "Consider quantifying your achievements. For example:"             │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ "Led team of 5 engineers" → "Led team of 5 engineers,          ││
│ │  reducing deployment time by 40%"                               ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ [Why this suggestion?]          [Apply]  [Dismiss]                 │
│                                                                     │
│─────────────────────────────────────────────────────────────────────│
│ ⚠️ AI suggestions are optional. You're always in control.          │
└─────────────────────────────────────────────────────────────────────┘
```

### Confirmation Dialogs

**Destructive Action Pattern:**
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ⚠️  Delete this resume?                                           │
│                                                                     │
│  This action cannot be undone. Your resume "Software Engineer      │
│  Resume v2" will be permanently deleted.                           │
│                                                                     │
│  Type "DELETE" to confirm:                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│                              [Cancel]  [Delete Forever]             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Consumer Screen Requirements

### Consumer Screens to Build

| Screen | Purpose | Key Patterns |
|--------|---------|--------------|
| Landing | First impression | Value prop, trust signals |
| Sign Up / Login | Authentication | Simple forms, social auth |
| Template Selection | Choose starting point | Gallery with preview |
| Resume Editor | Core product | Multi-step, autosave |
| AI Assist Panel | Optional AI help | Transparency, control |
| ATS Feedback | Job description match | Score, suggestions |
| Export | Generate final output | Format options, preview |
| History | View past exports | List, restore |
| Account | Profile management | Settings, billing |
| Billing | Subscription | Plan comparison, payment |

---

# PART 3: SHARED NON-NEGOTIABLES

## Accessibility Requirements

### WCAG 2.2 AA Compliance (MANDATORY)

- [ ] Color contrast: 4.5:1 for normal text, 3:1 for large text
- [ ] Focus indicators: Visible on all interactive elements
- [ ] Keyboard navigation: All actions achievable without mouse
- [ ] Screen reader support: Proper ARIA labels and roles
- [ ] Touch targets: Minimum 44x44px
- [ ] Motion: Respect `prefers-reduced-motion`
- [ ] Error identification: Clear error messages with instructions

### Dark Pattern Prohibition

The following patterns are **BANNED**:

- Pre-checked boxes for upsells
- Confusing double negatives
- Hidden costs or fees
- Fake urgency ("Only 3 left!")
- Disguised ads
- Forced continuity traps
- Misdirection in UI

---

## Visual Regression Protection

All components must have:
- Storybook stories covering all states
- Visual regression tests via Chromatic or Percy
- Screenshot comparisons in CI pipeline

---

## Implementation Checklist

### Before Any Component Ships

- [ ] Light mode tested
- [ ] Dark mode tested
- [ ] Empty state defined
- [ ] Loading state defined
- [ ] Error state defined
- [ ] Keyboard navigable
- [ ] Screen reader tested
- [ ] Touch target size verified
- [ ] Color contrast checked
- [ ] Reduced motion respected
- [ ] No dark patterns present

---

## Success Criteria

### Admin UX Success
Operators feel:
- In control of the system
- Confident in data accuracy
- Protected from mistakes
- Able to audit and act without ambiguity

### Consumer UX Success
Users feel:
- Safe entering personal data
- Guided through the process
- In control of AI suggestions
- Confident exporting their resume

**If either fails, the UX is incomplete.**
