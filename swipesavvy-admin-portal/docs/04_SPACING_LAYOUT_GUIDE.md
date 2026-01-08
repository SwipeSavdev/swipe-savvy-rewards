# Spacing & Layout Guide

**Status**: ✅ ACTIVE  
**Last Updated**: January 7, 2026  
**Reference**: brand-design-system.css

---

## Table of Contents

1. [Spacing Scale](#spacing-scale)
2. [Border Radius](#border-radius)
3. [Shadows](#shadows)
4. [Layout Patterns](#layout-patterns)
5. [Responsive Design](#responsive-design)
6. [Grid & Flexbox](#grid--flexbox)
7. [Spacing Examples](#spacing-examples)
8. [Common Layouts](#common-layouts)

---

## Spacing Scale

### The 8px Grid System

All spacing uses multiples of 8px for consistency and scalability.

| Scale | Pixels | Rem | CSS Variable | Usage |
|-------|--------|-----|--------------|-------|
| 1 | 8px | 0.5rem | `--spacing-1` | Tight spacing, small gaps |
| 2 | 16px | 1rem | `--spacing-2` | Default gap, padding |
| 3 | 24px | 1.5rem | `--spacing-3` | Section spacing |
| 4 | 32px | 2rem | `--spacing-4` | Container padding |
| 5 | 40px | 2.5rem | `--spacing-5` | Large sections |
| 6 | 48px | 3rem | `--spacing-6` | Page sections |
| 8 | 64px | 4rem | `--spacing-8` | Major spacing |

### Why 8px Grid?

✅ **Consistency**: All measurements align to the same scale  
✅ **Scalability**: Easy to create proportional designs  
✅ **Flexibility**: Odd numbers for special cases  
✅ **Responsive**: Easier to adjust for different screen sizes  
✅ **Development**: Simpler CSS and Tailwind usage  

### Usage Examples

```tsx
// Padding (internal spacing)
<div className="p-[var(--spacing-4)]">     {/* 32px padding */}
  Content with comfortable internal spacing
</div>

// Margin (external spacing)
<div className="mb-[var(--spacing-3)]">    {/* 24px margin-bottom */}
  Spaced from next element
</div>

// Gap (in flexbox/grid)
<div className="flex gap-[var(--spacing-2)]">  {/* 16px gap */}
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// X-axis padding (left & right)
<div className="px-[var(--spacing-4)]">    {/* 32px left & right */}
  Horizontally padded content
</div>

// Y-axis padding (top & bottom)
<div className="py-[var(--spacing-3)]">    {/* 24px top & bottom */}
  Vertically padded content
</div>
```

---

## Border Radius

### Radius Scale

Rounded corners create hierarchy and visual interest.

| Name | Pixels | CSS Variable | Usage |
|------|--------|--------------|-------|
| sm | 12px | `--radius-sm` | Small buttons, small components |
| md | 14px | `--radius-md` | Regular buttons, inputs, cards |
| lg | 20px | `--radius-lg` | Large containers, sections |
| xl | 28px | `--radius-xl` | Modal dialogs, large modals |
| full | 9999px | `--radius-full` | Pills, badges, circular elements |

### Usage Examples

```tsx
// Small radius (12px) - Buttons
<button className="rounded-[var(--radius-sm)] px-[var(--spacing-3)] py-[var(--spacing-1)]">
  Click me
</button>

// Medium radius (14px) - Input fields
<input 
  className="rounded-[var(--radius-md)] px-[var(--spacing-3)] py-[var(--spacing-2)] border"
  placeholder="Enter text"
/>

// Large radius (20px) - Cards
<div className="rounded-[var(--radius-lg)] bg-[var(--color-bg-primary)] p-[var(--spacing-4)]">
  Card content
</div>

// Extra large radius (28px) - Modals
<div className="rounded-[var(--radius-xl)] bg-white shadow-lg">
  <h2 className="p-[var(--spacing-4)]">Modal title</h2>
</div>

// Full radius (9999px) - Pills
<span className="rounded-[var(--radius-full)] bg-[var(--color-brand-green)] 
                  px-[var(--spacing-2)] py-[var(--spacing-1)] 
                  text-white text-[var(--font-size-xs)]">
  Active
</span>
```

---

## Shadows

### Shadow Scale

Shadows create depth and hierarchy in the interface.

| Name | Usage | CSS Variable |
|------|-------|--------------|
| Soft | Standard elevation, cards | `--shadow-soft` |
| Float | Higher elevation, modals | `--shadow-float` |

### Shadow Values

```css
--shadow-soft: 0 18px 50px rgba(0, 0, 0, 0.22);
--shadow-float: 0 30px 80px rgba(0, 0, 0, 0.33);
```

### Usage Examples

```tsx
// Soft shadow (standard cards)
<div className="bg-white rounded-[var(--radius-lg)] shadow-soft">
  Standard card with subtle shadow
</div>

// Float shadow (elevated elements)
<div className="bg-white rounded-[var(--radius-xl)] shadow-float">
  Modal or floating panel with prominent shadow
</div>

// No shadow (alternative)
<div className="border border-[var(--color-border-primary)]">
  Flat design with border instead of shadow
</div>

// Hover shadow (interactive feedback)
<div className="bg-white rounded-[var(--radius-lg)] 
                shadow-soft hover:shadow-float 
                transition-shadow duration-[var(--transition-normal)]">
  Interactive card with shadow on hover
</div>
```

---

## Layout Patterns

### Container Pattern

```tsx
// Standard container with max width and padding
<div className="max-w-[1200px] mx-auto px-[var(--spacing-4)]">
  <h1 className="text-[var(--font-size-2xl)] font-bold mb-[var(--spacing-4)]">
    Page Title
  </h1>
  {/* Content */}
</div>
```

### Card Pattern

```tsx
// Standard card layout
<div className="bg-[var(--color-bg-primary)] 
                rounded-[var(--radius-lg)] 
                p-[var(--spacing-4)] 
                shadow-soft">
  <h2 className="text-[var(--font-size-lg)] font-bold mb-[var(--spacing-2)]">
    Card Title
  </h2>
  <p className="text-[var(--color-text-secondary)] 
               text-[var(--font-size-sm)]">
    Card content
  </p>
</div>
```

### Stack Pattern (Vertical)

```tsx
// Vertical stack with consistent spacing
<div className="flex flex-col gap-[var(--spacing-3)]">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Row Pattern (Horizontal)

```tsx
// Horizontal row with consistent spacing
<div className="flex flex-row gap-[var(--spacing-2)] items-center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Grid Pattern

```tsx
// Two-column grid with gap
<div className="grid grid-cols-2 gap-[var(--spacing-4)]">
  <div className="bg-[var(--color-bg-primary)] p-[var(--spacing-3)]">
    Column 1
  </div>
  <div className="bg-[var(--color-bg-primary)] p-[var(--spacing-3)]">
    Column 2
  </div>
</div>
```

---

## Responsive Design

### Tailwind Breakpoints

```tsx
// Mobile-first approach
<div className="px-[var(--spacing-2)]         // Mobile
                sm:px-[var(--spacing-3)]      // 640px+
                md:px-[var(--spacing-4)]      // 768px+
                lg:px-[var(--spacing-6)]">    // 1024px+
  Responsive padding
</div>

// Font size adjustment
<h1 className="text-[var(--font-size-xl)]
               md:text-[var(--font-size-2xl)]
               lg:text-[var(--font-size-3xl)]">
  Responsive heading
</h1>

// Column adjustment
<div className="grid grid-cols-1 
                sm:grid-cols-2
                md:grid-cols-3
                lg:grid-cols-4
                gap-[var(--spacing-3)]">
  {/* Cards */}
</div>
```

---

## Grid & Flexbox

### Flexbox Layouts

```tsx
// Center content vertically and horizontally
<div className="flex items-center justify-center h-full">
  Centered content
</div>

// Space between items
<div className="flex justify-between items-center">
  <div>Left</div>
  <div>Right</div>
</div>

// Wrap on smaller screens
<div className="flex flex-wrap gap-[var(--spacing-2)]">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Column layout
<div className="flex flex-col gap-[var(--spacing-3)]">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Grid Layouts

```tsx
// Auto-fit responsive grid
<div className="grid auto-fit grid-cols-[minmax(250px,1fr)] gap-[var(--spacing-4)]">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>

// Fixed two-column layout
<div className="grid grid-cols-2 gap-[var(--spacing-4)] md:gap-[var(--spacing-6)]">
  <div>Left Column</div>
  <div>Right Column</div>
</div>
```

---

## Spacing Examples

### Complete Dashboard Layout

```tsx
// Full dashboard with proper spacing
<div className="min-h-screen bg-[var(--color-bg-page)]">
  {/* Header - 60px height */}
  <header className="h-[60px] bg-[var(--color-bg-primary)] 
                     border-b border-[var(--color-border-primary)]
                     px-[var(--spacing-4)]">
    {/* Header content */}
  </header>

  {/* Main content area */}
  <div className="flex">
    {/* Sidebar - 240px width */}
    <aside className="w-60 bg-[var(--color-bg-primary)]">
      {/* Sidebar content */}
    </aside>

    {/* Page content */}
    <main className="flex-1 p-[var(--spacing-6)]">
      {/* Content container with max width */}
      <div className="max-w-[1200px] mx-auto">
        {/* Page heading */}
        <h1 className="text-[var(--font-size-2xl)] font-bold 
                      mb-[var(--spacing-4)]">
          Dashboard
        </h1>

        {/* Cards grid */}
        <div className="grid grid-cols-1 
                       md:grid-cols-2 
                       lg:grid-cols-4
                       gap-[var(--spacing-4)]
                       mb-[var(--spacing-6)]">
          <div className="bg-[var(--color-bg-primary)] 
                         rounded-[var(--radius-lg)] 
                         p-[var(--spacing-4)]
                         shadow-soft">
            Card 1
          </div>
          {/* More cards */}
        </div>

        {/* Table section */}
        <div className="bg-[var(--color-bg-primary)] 
                       rounded-[var(--radius-lg)] 
                       p-[var(--spacing-4)]
                       shadow-soft">
          <h2 className="text-[var(--font-size-lg)] font-bold
                        mb-[var(--spacing-3)]">
            Recent Activity
          </h2>
          {/* Table content */}
        </div>
      </div>
    </main>
  </div>
</div>
```

---

## Common Layouts

### Form Layout

```tsx
<form className="space-y-[var(--spacing-4)]">
  <div>
    <label className="block text-[var(--font-size-sm)] font-medium
                      text-[var(--color-text-primary)]
                      mb-[var(--spacing-1)]">
      Email
    </label>
    <input 
      type="email"
      className="w-full rounded-[var(--radius-md)]
                 border border-[var(--color-border-primary)]
                 px-[var(--spacing-3)] py-[var(--spacing-2)]
                 text-[var(--font-size-base)]
                 focus:border-[var(--color-border-focus)]
                 focus:outline-none"
      placeholder="you@example.com"
    />
  </div>
  
  <div>
    <label className="block text-[var(--font-size-sm)] font-medium
                      text-[var(--color-text-primary)]
                      mb-[var(--spacing-1)]">
      Password
    </label>
    <input 
      type="password"
      className="w-full rounded-[var(--radius-md)]
                 border border-[var(--color-border-primary)]
                 px-[var(--spacing-3)] py-[var(--spacing-2)]
                 text-[var(--font-size-base)]
                 focus:border-[var(--color-border-focus)]"
      placeholder="••••••••"
    />
  </div>

  <button className="w-full bg-[var(--color-action-primary-bg)]
                    text-[var(--color-action-primary-text)]
                    rounded-[var(--radius-md)]
                    px-[var(--spacing-4)] py-[var(--spacing-2)]
                    font-medium
                    hover:bg-[var(--color-action-primary-bg-hover)]
                    transition-colors">
    Sign In
  </button>
</form>
```

---

## Spacing & Layout Tokens Quick Reference

```tsx
// Spacing scale
var(--spacing-1)    // 8px
var(--spacing-2)    // 16px
var(--spacing-3)    // 24px
var(--spacing-4)    // 32px
var(--spacing-5)    // 40px
var(--spacing-6)    // 48px
var(--spacing-8)    // 64px

// Border radius
var(--radius-sm)    // 12px
var(--radius-md)    // 14px
var(--radius-lg)    // 20px
var(--radius-xl)    // 28px
var(--radius-full)  // 9999px

// Shadows
var(--shadow-soft)
var(--shadow-float)
```

---

**Created**: January 7, 2026  
**Version**: 1.0  
**Status**: ✅ COMPLETE
