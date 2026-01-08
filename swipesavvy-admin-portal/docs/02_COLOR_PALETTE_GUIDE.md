# Color Palette Guide

**Status**: ✅ ACTIVE  
**Last Updated**: January 7, 2026  
**Reference**: brand-design-system.css

---

## Table of Contents

1. [Brand Colors](#brand-colors)
2. [Neutral Palette](#neutral-palette)
3. [Semantic Colors](#semantic-colors)
4. [Usage Guidelines](#usage-guidelines)
5. [Dark Mode Colors](#dark-mode-colors)
6. [Accessibility](#accessibility)

---

## Brand Colors

### Navy - Primary Brand Color

**Hex**: `#235393`  
**CSS Variable**: `--color-brand-navy`  
**Usage**: Primary actions, buttons, headers, focus states, active navigation items

```css
.primary-button {
  background-color: var(--color-brand-navy);
  color: var(--color-action-primary-text);
}
```

**Variants**:
- Light: `#3a6db8` - Hover states, secondary applications
- Dark: `#1a3f7a` - Active/pressed states, deeper emphasis

### Deep - Darkest Brand Color

**Hex**: `#132136`  
**CSS Variable**: `--color-brand-deep`  
**Usage**: Dark backgrounds, deep text emphasis, footer areas

```css
.footer {
  background-color: var(--color-brand-deep);
  color: var(--color-white);
}
```

**Variants**:
- Light: `#1a2a3f` - Slightly lighter for contrast

### Green - Success Color

**Hex**: `#60ba46`  
**CSS Variable**: `--color-brand-green`  
**Usage**: Success messages, positive actions, confirmations, "go" actions

```css
.success-badge {
  background-color: var(--color-status-success-bg);
  border-color: var(--color-status-success-border);
  color: var(--color-status-success-text);
}
```

**Variants**:
- Dark: `#4a9a35` - Hover/active states
- Light: `#7acc5e` - Lighter backgrounds

### Yellow - Warning Color

**Hex**: `#fab915`  
**CSS Variable**: `--color-brand-yellow`  
**Usage**: Warnings, alerts, attention-needed states, caution messages

```css
.warning-badge {
  background-color: var(--color-status-warning-bg);
  border-color: var(--color-status-warning-border);
  color: var(--color-status-warning-text);
}
```

**Variants**:
- Dark: `#e8a60a` - Hover/active states
- Light: `#fcc548` - Lighter backgrounds

---

## Neutral Palette

### Greys (50-900 Scale)

Used for backgrounds, borders, and text hierarchy.

| Scale | Hex | Usage |
|-------|-----|-------|
| 50 | `#f9fafb` | Lightest background, subtle sections |
| 100 | `#f3f4f6` | Secondary background |
| 200 | `#e5e7eb` | Primary border, dividers |
| 300 | `#d1d5db` | Secondary border, subtle lines |
| 400 | `#9ca3af` | Placeholder text, disabled state |
| 500 | `#6b7280` | Tertiary text |
| 600 | `#4b5563` | Secondary text |
| 700 | `#374151` | Strong secondary text |
| 800 | `#1f2937` | Primary text (dark mode) |
| 900 | `#111827` | Darkest text, dark backgrounds |

### CSS Variables

```css
:root {
  --color-grey-50: #f9fafb;
  --color-grey-100: #f3f4f6;
  /* ... */
  --color-grey-900: #111827;
  
  --color-white: #ffffff;
  --color-black: #000000;
}
```

---

## Semantic Colors

### Success State

**Light Mode**:
- Background: `#ecfdf5` (light green tint)
- Border: `#86efac` (bright green)
- Text: `#166534` (dark green)
- Icon: `#60ba46` (brand green)

**Dark Mode**:
- Background: `rgba(96, 186, 70, 0.15)` (green with opacity)
- Border: `#60ba46` (brand green)
- Text: `#7acc5e` (light green)
- Icon: `#60ba46` (brand green)

```tsx
<div className="bg-[var(--color-status-success-bg)] border border-[var(--color-status-success-border)] text-[var(--color-status-success-text)]">
  ✓ Action completed successfully
</div>
```

### Warning State

**Light Mode**:
- Background: `#fffbeb` (light yellow tint)
- Border: `#fde047` (bright yellow)
- Text: `#92400e` (dark brown)
- Icon: `#fab915` (brand yellow)

**Dark Mode**:
- Background: `rgba(250, 185, 21, 0.15)` (yellow with opacity)
- Border: `#fab915` (brand yellow)
- Text: `#fcc548` (light yellow)
- Icon: `#fab915` (brand yellow)

### Danger/Error State

**Light Mode**:
- Background: `#fef2f2` (light red tint)
- Border: `#fecaca` (light red)
- Text: `#7f1d1d` (dark red)
- Icon: `#ef4444` (red)

**Dark Mode**:
- Background: `rgba(239, 68, 68, 0.15)` (red with opacity)
- Border: `#ef4444` (red)
- Text: `#fca5a5` (light pink)
- Icon: `#ef4444` (red)

### Info State

**Light Mode**:
- Background: `#eff6ff` (light blue tint)
- Border: `#bfdbfe` (light blue)
- Text: `#1e3a8a` (dark blue)
- Icon: `#235393` (brand navy)

**Dark Mode**:
- Background: `rgba(35, 83, 147, 0.15)` (navy with opacity)
- Border: `#7acd56` (green accent)
- Text: `#a8e4c3` (light cyan)
- Icon: `#60ba46` (green accent)

---

## Usage Guidelines

### Text Hierarchy

```tsx
// Primary text (high emphasis)
<p className="text-[var(--color-text-primary)]">Main content</p>

// Secondary text (medium emphasis)
<p className="text-[var(--color-text-secondary)]">Supplementary info</p>

// Tertiary text (low emphasis)
<p className="text-[var(--color-text-tertiary)]">Hints, helper text</p>

// Quaternary text (minimal emphasis)
<p className="text-[var(--color-text-quaternary)]">Very subtle text</p>
```

### Background Usage

```tsx
// Page background
<div className="bg-[var(--color-bg-page)]">Page content</div>

// Primary section
<div className="bg-[var(--color-bg-primary)]">Primary section</div>

// Secondary section
<div className="bg-[var(--color-bg-secondary)]">Secondary section</div>

// Tertiary section (subtle)
<div className="bg-[var(--color-bg-tertiary)]">Subtle background</div>
```

### Border Usage

```tsx
// Primary borders (stronger emphasis)
<div className="border border-[var(--color-border-primary)]">Card</div>

// Secondary borders (medium emphasis)
<div className="border border-[var(--color-border-secondary)]">Section</div>

// Tertiary borders (subtle)
<div className="border border-[var(--color-border-tertiary)]">Subtle</div>

// Focus borders (interactive elements)
<input className="focus:border-[var(--color-border-focus)]" />
```

### Action Colors

```tsx
// Primary action (navy)
<button className="bg-[var(--color-action-primary-bg)] text-[var(--color-action-primary-text)]">
  Primary Action
</button>

// Secondary action (grey)
<button className="bg-[var(--color-action-secondary-bg)] text-[var(--color-action-secondary-text)]">
  Secondary Action
</button>

// Ghost action (text only)
<button className="text-[var(--color-action-ghost-text)]">
  Ghost Action
</button>
```

---

## Dark Mode Colors

### Automatic Dark Mode Detection

The design system automatically switches colors based on system preference:

```css
/* Light mode (default) */
:root {
  --color-text-primary: #111827;
  --color-bg-page: #ffffff;
}

/* Dark mode (automatic) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: #f9fafb;
    --color-bg-page: #0f1419;
  }
}
```

### Manual Theme Switching

For manual control, use the `data-theme` attribute:

```html
<!-- Manual dark mode -->
<html data-theme="dark">
  <!-- Content uses dark mode colors -->
</html>
```

### Color Adjustments for Dark Mode

```css
/* In dark mode, text becomes lighter */
--color-text-primary: #f9fafb;      /* Was #111827 in light mode */
--color-text-secondary: #d1d5db;    /* Was #374151 in light mode */

/* Backgrounds become darker */
--color-bg-page: #0f1419;           /* Was #ffffff in light mode */
--color-bg-primary: #1a1f2e;        /* Was #f9fafb in light mode */
```

---

## Accessibility

### Contrast Ratios

All color combinations meet WCAG 2.1 AA standards:
- Normal text: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1 contrast ratio
- UI components: Minimum 3:1 contrast ratio

### Color Blind Friendly

The palette avoids red-green combinations and uses:
- Navy + Grey for primary distinction
- Blue-yellow combinations for warnings
- Sufficient lightness/darkness differences

### Usage Checklist

- ✅ Never use color alone to convey information
- ✅ Pair colors with icons, text, or patterns
- ✅ Ensure sufficient contrast in all modes
- ✅ Test with accessibility tools
- ✅ Validate with WCAG Color Contrast Analyzer

---

## Testing Colors

### Check Contrast Online

Use these tools:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WAVE Browser Extension: https://wave.webaim.org/extension/
- Lighthouse (Chrome DevTools): Built-in accessibility audit

### Test Dark Mode

```bash
# Force dark mode in DevTools
# Press Cmd+Shift+P
# Search for "Emulate CSS media feature prefers-color-scheme"
# Select "dark"
```

---

## Color Tokens Quick Reference

```tsx
// Brand Colors
var(--color-brand-navy)
var(--color-brand-deep)
var(--color-brand-green)
var(--color-brand-yellow)

// Text Colors
var(--color-text-primary)
var(--color-text-secondary)
var(--color-text-tertiary)
var(--color-text-inverse)

// Background Colors
var(--color-bg-page)
var(--color-bg-primary)
var(--color-bg-secondary)

// Status Colors
var(--color-status-success-bg)
var(--color-status-warning-bg)
var(--color-status-danger-bg)
var(--color-status-info-bg)

// Action Colors
var(--color-action-primary-bg)
var(--color-action-secondary-bg)
var(--color-action-ghost-text)
```

---

**Created**: January 7, 2026  
**Version**: 1.0  
**Status**: ✅ COMPLETE
