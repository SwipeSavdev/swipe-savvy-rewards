# Typography Guide

**Status**: ✅ ACTIVE  
**Last Updated**: January 7, 2026  
**Reference**: brand-design-system.css

---

## Table of Contents

1. [Font Families](#font-families)
2. [Font Sizes](#font-sizes)
3. [Font Weights](#font-weights)
4. [Line Heights](#line-heights)
5. [Text Styles](#text-styles)
6. [Usage Examples](#usage-examples)
7. [Dark Mode](#dark-mode)
8. [Accessibility](#accessibility)

---

## Font Families

### Primary Font - System UI Sans-Serif

Used for all body text, labels, headings, and UI elements.

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 
             Helvetica, Arial, sans-serif;
```

**Why System UI?**
- Loads instantly (no network requests)
- Familiar to users (matches their OS)
- Optimized for readability on screen
- Excellent accessibility support

### Secondary Font - Monospace

Used for code, technical information, and data display.

```css
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, 
             Consolas, Liberation Mono, Courier New, monospace;
```

**Usage**: Code blocks, timestamps, IDs, technical values

```tsx
<code className="font-mono text-sm">
  const data = await fetchUsers();
</code>
```

---

## Font Sizes

### Size Scale (Relative to 16px base)

| Name | Size | Pixels | CSS Variable | Usage |
|------|------|--------|--------------|-------|
| xs | 0.75rem | 12px | `--font-size-xs` | Captions, hints, badges |
| sm | 0.875rem | 14px | `--font-size-sm` | Labels, secondary text |
| base | 1rem | 16px | `--font-size-base` | Body text, paragraphs |
| lg | 1.125rem | 18px | `--font-size-lg` | Subheadings |
| xl | 1.25rem | 20px | `--font-size-xl` | Section headings |
| 2xl | 1.5rem | 24px | `--font-size-2xl` | Major headings |
| 3xl | 1.875rem | 30px | `--font-size-3xl` | Page titles |
| 4xl | 2.25rem | 36px | `--font-size-4xl` | Hero headings |

### Usage Examples

```tsx
// Extra small (12px) - Captions
<span className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
  Last updated: 2 hours ago
</span>

// Small (14px) - Labels & secondary text
<label className="text-[var(--font-size-sm)] font-medium">
  Email Address
</label>

// Base (16px) - Body text
<p className="text-[var(--font-size-base)]">
  This is the main body text that users read.
</p>

// Large (18px) - Subheadings
<h3 className="text-[var(--font-size-lg)] font-bold">
  Section Title
</h3>

// Extra large (20px) - Section headings
<h2 className="text-[var(--font-size-xl)] font-bold">
  Page Section
</h2>

// 2xl (24px) - Major headings
<h1 className="text-[var(--font-size-2xl)] font-bold">
  Dashboard Overview
</h1>
```

---

## Font Weights

### Weight Scale

| Name | Value | CSS Variable | Usage |
|------|-------|--------------|-------|
| Light | 300 | `--font-weight-light` | Deemphasized text |
| Normal | 400 | `--font-weight-normal` | Body text (default) |
| Medium | 500 | `--font-weight-medium` | Labels, emphasis |
| Semibold | 600 | `--font-weight-semibold` | Subheadings, strong |
| Bold | 700 | `--font-weight-bold` | Headings, strong emphasis |

### Usage Examples

```tsx
// Light (300) - Deemphasized text
<span style={{ fontWeight: 'var(--font-weight-light)' }}>
  Subtle information
</span>

// Normal (400) - Default body text
<p className="font-normal">
  Regular body paragraph
</p>

// Medium (500) - Labels and form text
<label className="font-[var(--font-weight-medium)]">
  Username
</label>

// Semibold (600) - Stronger emphasis
<h3 className="font-semibold">
  Important Section
</h3>

// Bold (700) - Headings and maximum emphasis
<h1 className="font-bold">
  Page Title
</h1>
```

### Weight Combinations

**For Headings**:
```tsx
<h1 className="text-[var(--font-size-2xl)] font-bold">
  Main Heading
</h1>
```

**For Subheadings**:
```tsx
<h2 className="text-[var(--font-size-lg)] font-semibold">
  Section Heading
</h2>
```

**For Body Text**:
```tsx
<p className="text-[var(--font-size-base)] font-normal">
  Regular paragraph text
</p>
```

**For Labels**:
```tsx
<label className="text-[var(--font-size-sm)] font-medium">
  Form Label
</label>
```

---

## Line Heights

### Line Height Scale

| Name | Ratio | CSS Variable | Usage |
|------|-------|--------------|-------|
| Tight | 1.2 | `--line-height-tight` | Headings, titles |
| Normal | 1.5 | `--line-height-normal` | Body text, paragraphs |
| Relaxed | 1.75 | `--line-height-relaxed` | Longer paragraphs, descriptions |

### Usage Examples

```tsx
// Tight (1.2) - Headings
<h1 style={{ lineHeight: 'var(--line-height-tight)' }} className="text-[var(--font-size-2xl)] font-bold">
  Page Title
</h1>

// Normal (1.5) - Body text
<p style={{ lineHeight: 'var(--line-height-normal)' }} className="text-[var(--font-size-base)]">
  This is standard body text with comfortable spacing between lines.
</p>

// Relaxed (1.75) - Long-form content
<article style={{ lineHeight: 'var(--line-height-relaxed)' }}>
  Longer articles and documentation benefit from relaxed line height.
</article>
```

### Why Line Height Matters

- **Tight (1.2)**: Good for short, bold headings
- **Normal (1.5)**: Best for most body text and standard UI
- **Relaxed (1.75)**: Better for longer paragraphs and readability

---

## Text Styles

### Predefined Text Hierarchies

```tsx
// Heading 1 (Page title)
<h1 className="text-[var(--font-size-2xl)] font-bold 
                text-[var(--color-text-primary)]
                leading-[var(--line-height-tight)]">
  Page Title
</h1>

// Heading 2 (Section title)
<h2 className="text-[var(--font-size-xl)] font-semibold
                text-[var(--color-text-primary)]
                leading-[var(--line-height-tight)]">
  Section Title
</h2>

// Heading 3 (Subsection)
<h3 className="text-[var(--font-size-lg)] font-semibold
                text-[var(--color-text-primary)]
                leading-[var(--line-height-normal)]">
  Subsection
</h3>

// Body text (Paragraphs)
<p className="text-[var(--font-size-base)] font-normal
              text-[var(--color-text-secondary)]
              leading-[var(--line-height-normal)]">
  This is body text used for the main content.
</p>

// Small text (Labels, captions)
<span className="text-[var(--font-size-sm)] font-medium
                 text-[var(--color-text-tertiary)]
                 leading-[var(--line-height-normal)]">
  Helper text or label
</span>

// Extra small (Captions, hints)
<span className="text-[var(--font-size-xs)] font-normal
                 text-[var(--color-text-quaternary)]
                 leading-[var(--line-height-normal)]">
  Last updated: January 7, 2026
</span>
```

---

## Usage Examples

### Complete Component Example

```tsx
// Card with typography hierarchy
<div className="bg-[var(--color-bg-primary)] p-[var(--spacing-4)] rounded-[var(--radius-md)]">
  {/* Heading */}
  <h2 className="text-[var(--font-size-xl)] font-bold 
                  text-[var(--color-text-primary)]
                  mb-[var(--spacing-2)]">
    Dashboard Overview
  </h2>
  
  {/* Description */}
  <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]
                 mb-[var(--spacing-3)]
                 leading-[var(--line-height-normal)]">
    View key metrics and performance indicators for the current period.
  </p>
  
  {/* Data table with proper typography */}
  <table>
    <thead>
      <tr>
        <th className="text-[var(--font-size-sm)] font-medium 
                       text-[var(--color-text-primary)]
                       text-left">
          Metric
        </th>
        <th className="text-[var(--font-size-sm)] font-medium
                       text-[var(--color-text-primary)]
                       text-right">
          Value
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="text-[var(--font-size-base)] text-[var(--color-text-secondary)]">
          Active Users
        </td>
        <td className="text-[var(--font-size-base)] font-semibold 
                       text-[var(--color-brand-navy)]
                       text-right">
          1,234
        </td>
      </tr>
    </tbody>
  </table>
  
  {/* Footer note */}
  <p className="text-[var(--font-size-xs)] text-[var(--color-text-quaternary)]
                 mt-[var(--spacing-3)]">
    Last updated: 2 hours ago
  </p>
</div>
```

---

## Dark Mode

Typography remains consistent in dark mode with automatic color adjustments:

```tsx
// Text automatically adjusts for readability in dark mode
<p className="text-[var(--color-text-primary)]">
  This text is #111827 in light mode and #f9fafb in dark mode
</p>
```

### Dark Mode Considerations

- Primary text becomes lighter (#f9fafb)
- Secondary text becomes less dark (#d1d5db)
- Sufficient contrast is maintained automatically
- No special dark mode adjustments needed

---

## Accessibility

### Best Practices

✅ **DO**:
- Use semantic HTML tags (h1, h2, h3, p, etc.)
- Maintain proper heading hierarchy
- Ensure sufficient contrast ratios
- Use font weights for emphasis, not color alone

❌ **DON'T**:
- Skip heading levels (h1 → h3)
- Use color alone to convey information
- Make text too small or large
- Use ALL CAPS for long passages

### Font Size Accessibility

```tsx
// ✅ Good - Readable size
<p className="text-[var(--font-size-base)]">
  This text is 16px and readable
</p>

// ✅ Good - Buttons are large enough
<button className="py-[var(--spacing-2)] px-[var(--spacing-3)] 
                    text-[var(--font-size-sm)]">
  Click me
</button>

// ❌ Avoid - Too small
<p className="text-[0.625rem]">
  This is hard to read
</p>
```

### Heading Hierarchy

```tsx
// ✅ Correct hierarchy
<h1>Page Title</h1>
<h2>Section 1</h2>
<h3>Subsection 1.1</h3>
<p>Content</p>
<h3>Subsection 1.2</h3>
<p>Content</p>

// ❌ Wrong - Skips levels
<h1>Page Title</h1>
<h3>Skipped h2!</h3>
```

---

## Typography Tokens Quick Reference

```tsx
// Font families
var(--font-sans)
var(--font-mono)

// Font sizes
var(--font-size-xs)    // 12px
var(--font-size-sm)    // 14px
var(--font-size-base)  // 16px
var(--font-size-lg)    // 18px
var(--font-size-xl)    // 20px
var(--font-size-2xl)   // 24px
var(--font-size-3xl)   // 30px
var(--font-size-4xl)   // 36px

// Font weights
var(--font-weight-light)      // 300
var(--font-weight-normal)     // 400
var(--font-weight-medium)     // 500
var(--font-weight-semibold)   // 600
var(--font-weight-bold)       // 700

// Line heights
var(--line-height-tight)      // 1.2
var(--line-height-normal)     // 1.5
var(--line-height-relaxed)    // 1.75
```

---

**Created**: January 7, 2026  
**Version**: 1.0  
**Status**: ✅ COMPLETE
