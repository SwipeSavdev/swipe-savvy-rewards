# Dark Mode Implementation Guide

**Status**: ✅ ACTIVE  
**Last Updated**: January 7, 2026  
**Reference**: brand-design-system.css

---

## Table of Contents

1. [How Dark Mode Works](#how-dark-mode-works)
2. [System Preference Detection](#system-preference-detection)
3. [Manual Theme Switching](#manual-theme-switching)
4. [Color Adjustments](#color-adjustments)
5. [Testing Dark Mode](#testing-dark-mode)
6. [Implementation Patterns](#implementation-patterns)
7. [Common Pitfalls](#common-pitfalls)

---

## How Dark Mode Works

### CSS Media Query

The design system uses `prefers-color-scheme` to automatically detect system preference:

```css
/* Light mode (default) */
:root {
  --color-bg-page: #ffffff;
  --color-text-primary: #111827;
  --color-border-primary: #e5e7eb;
}

/* Dark mode (automatic when system is in dark mode) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-page: #0f1419;
    --color-text-primary: #f9fafb;
    --color-border-primary: #3a4557;
  }
}
```

### CSS Variables Approach

All components use CSS variables that change based on the system theme:

```tsx
// No conditional rendering needed!
<div className="bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
  This automatically adjusts for dark mode
</div>
```

---

## System Preference Detection

### Checking Current Theme

```tsx
// React component to detect current theme
import { useEffect, useState } from 'react'

export function useColorScheme() {
  const [scheme, setScheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setScheme('dark')
    } else {
      setScheme('light')
    }

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setScheme(e.matches ? 'dark' : 'light')
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return scheme
}

// Usage
function MyComponent() {
  const scheme = useColorScheme()
  return <div>Current theme: {scheme}</div>
}
```

### Browser/OS Settings

Dark mode is controlled by the user's OS settings:

**macOS**:
- System Settings > Appearance > Dark

**Windows 11**:
- Settings > Personalization > Colors > Dark

**iOS**:
- Settings > Display & Brightness > Dark

**Android**:
- Settings > Display > Dark Theme

---

## Manual Theme Switching

### Using data-theme Attribute

For apps that allow manual theme toggle:

```tsx
// Toggle theme manually
import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  useEffect(() => {
    const html = document.documentElement
    
    if (theme === 'system') {
      // Remove data-theme to use system preference
      html.removeAttribute('data-theme')
    } else {
      // Force theme
      html.setAttribute('data-theme', theme)
    }

    // Save preference
    localStorage.setItem('theme-preference', theme)
  }, [theme])

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme-preference')
    if (saved) {
      setTheme(saved as any)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => 
      prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'
    )
  }

  return { theme, setTheme, toggleTheme }
}

// Usage
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? '🌙' : theme === 'dark' ? '☀️' : '🖥️'}
      {theme}
    </button>
  )
}
```

### HTML Attribute Selector

In CSS, you can also target the `data-theme` attribute:

```css
/* Override for manual dark mode */
[data-theme="dark"] {
  --color-bg-page: #0f1419;
  --color-text-primary: #f9fafb;
  --color-border-primary: #3a4557;
}

/* Override for manual light mode */
[data-theme="light"] {
  --color-bg-page: #ffffff;
  --color-text-primary: #111827;
  --color-border-primary: #e5e7eb;
}
```

---

## Color Adjustments

### Light Mode Colors

```css
:root {
  /* Backgrounds */
  --color-bg-page: #ffffff;
  --color-bg-primary: #f9fafb;
  --color-bg-secondary: #f3f4f6;
  --color-bg-tertiary: #e5e7eb;
  
  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-tertiary: #6b7280;
  --color-text-inverse: #ffffff;
  
  /* Borders */
  --color-border-primary: #e5e7eb;
  --color-border-secondary: #d1d5db;
  --color-border-tertiary: #9ca3af;
}
```

### Dark Mode Colors

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Backgrounds - Much darker */
    --color-bg-page: #0f1419;           /* Almost black */
    --color-bg-primary: #1a1f2e;        /* Very dark blue-grey */
    --color-bg-secondary: #252d3f;      /* Dark blue-grey */
    --color-bg-tertiary: #3a4557;       /* Medium dark grey */
    
    /* Text - Much lighter */
    --color-text-primary: #f9fafb;      /* Near white */
    --color-text-secondary: #d1d5db;    /* Light grey */
    --color-text-tertiary: #9ca3af;     /* Medium grey */
    --color-text-inverse: #111827;      /* Dark grey */
    
    /* Borders - Lighter than backgrounds */
    --color-border-primary: #3a4557;    /* Medium dark */
    --color-border-secondary: #4b5563;  /* Slightly lighter */
    --color-border-tertiary: #6b7280;   /* Even lighter */
  }
}
```

### Key Differences

| Element | Light Mode | Dark Mode | Why Different |
|---------|-----------|-----------|---------------|
| **Background** | White `#fff` | Very dark `#0f1419` | Reduce eye strain |
| **Text** | Very dark `#111` | Very light `#f9f` | Maintain contrast |
| **Borders** | Light grey `#e5e` | Medium grey `#3a4` | Visible against dark bg |
| **Links** | Navy `#235` | Light green `#7ac` | Better visibility in dark |

---

## Testing Dark Mode

### Emulate in Browser DevTools

**Chrome DevTools**:
1. Open DevTools (F12)
2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
3. Search "Emulate CSS media feature prefers-color-scheme"
4. Select "dark" or "light"

**Firefox Developer Tools**:
1. Open Inspector
2. Go to Settings > Preferences
3. Enable "Emulate print media"
4. Or use about:config to set `ui.systemUsesDarkTheme = 1`

### Force System Dark Mode

**macOS**:
```bash
# Temporarily enable dark mode in Terminal
defaults write -g AppleInterfaceStyle -string Dark
# Restart to apply
```

**Testing Checklist**:
- [ ] Text is readable (sufficient contrast)
- [ ] Buttons are visible and clickable
- [ ] Icons are properly colored
- [ ] Links are distinguishable
- [ ] Cards have proper borders
- [ ] Status colors are clear
- [ ] Inputs have visible borders

### Testing Tools

```tsx
// Test component for dark mode
<div className="space-y-4 p-8">
  {/* Light backgrounds - should be very dark in dark mode */}
  <div className="bg-[var(--color-bg-primary)]">
    Primary background
  </div>

  {/* Text - should be very light in dark mode */}
  <p className="text-[var(--color-text-primary)]">
    Primary text
  </p>

  {/* Borders - should be visible */}
  <div className="border border-[var(--color-border-primary)]">
    Bordered element
  </div>

  {/* Status colors - should be readable */}
  <div className="bg-[var(--color-status-success-bg)]
                  text-[var(--color-status-success-text)]">
    Success message
  </div>
</div>
```

---

## Implementation Patterns

### Component with Dark Mode

```tsx
// All components automatically work in dark mode!
// No special handling needed

export function Card({ children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)]',
        'bg-[var(--color-bg-primary)]',           // Auto-adjusts
        'text-[var(--color-text-primary)]',       // Auto-adjusts
        'border border-[var(--color-border-primary)]', // Auto-adjusts
        'shadow-soft',
        props.className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Usage - works in both light and dark mode
<Card>
  <h2>This card works perfectly in dark mode!</h2>
  <p>No special handling required.</p>
</Card>
```

### Conditional Styling (Rarely Needed)

If you truly need different styling in dark mode:

```tsx
// Using media queries (preferred)
const styles = css`
  background-color: var(--color-bg-page);

  @media (prefers-color-scheme: dark) {
    // Usually not needed - variables handle it
  }
`

// Or using data-theme (for manual toggle)
const styles = css`
  background-color: var(--color-bg-page);

  [data-theme="dark"] & {
    // Dark mode specific styles
  }
`
```

### Brand Colors in Dark Mode

```tsx
// Brand colors stay the same in both modes
// Navy is navy in both light and dark mode
<button className="bg-[var(--color-brand-navy)]
                   text-[var(--color-action-primary-text)]">
  // Navy background in light mode
  // Navy background in dark mode (with adjusted text color for visibility)
</button>
```

---

## Common Pitfalls

### ❌ Using Hardcoded Colors

```tsx
// DON'T - Hardcoded colors don't respond to dark mode
<div className="bg-white text-black">
  This won't work in dark mode!
</div>

// DO - Use CSS variables
<div className="bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
  This works perfectly in dark mode
</div>
```

### ❌ Not Testing Dark Mode

```tsx
// Always test your components in dark mode!
// Open DevTools and toggle prefers-color-scheme
```

### ❌ Insufficient Contrast

```tsx
// DON'T - May not have enough contrast in dark mode
<p className="text-gray-500">Low contrast text</p>

// DO - Use semantic color tokens
<p className="text-[var(--color-text-tertiary)]">
  Properly contrasted text
</p>
```

### ❌ Different Images for Dark Mode

```tsx
// Usually NOT NEEDED - design system handles colors
// Only use if image actually depends on background

// DO - Let the design system handle colors
<img src="/logo.svg" alt="Logo" />

// Sometimes needed - different image versions
import logoDark from '/logo-dark.svg'
import logoLight from '/logo-light.svg'
const logo = isDarkMode ? logoDark : logoLight
```

---

## Migration Guide

### For Existing Components

If you have components using hardcoded colors:

```tsx
// Before
export function Card() {
  return (
    <div className="bg-white text-black border border-gray-200">
      Card content
    </div>
  )
}

// After
export function Card() {
  return (
    <div className="bg-[var(--color-bg-primary)] 
                    text-[var(--color-text-primary)]
                    border border-[var(--color-border-primary)]">
      Card content
    </div>
  )
}
```

---

## Quick Reference

```tsx
// Light backgrounds
var(--color-bg-page)        // Page background
var(--color-bg-primary)     // Primary sections
var(--color-bg-secondary)   // Secondary sections

// Light text
var(--color-text-primary)      // Main text
var(--color-text-secondary)    // Secondary text
var(--color-text-tertiary)     // Tertiary text

// Borders
var(--color-border-primary)    // Main borders
var(--color-border-secondary)  // Secondary borders

// Status colors (auto-adjust)
var(--color-status-success-bg)
var(--color-status-warning-bg)
var(--color-status-danger-bg)

// All these automatically use dark mode colors when needed!
```

---

**Created**: January 7, 2026  
**Version**: 1.0  
**Status**: ✅ COMPLETE
