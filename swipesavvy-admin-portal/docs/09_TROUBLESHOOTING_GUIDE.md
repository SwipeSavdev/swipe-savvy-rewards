# Troubleshooting Guide

**Status**: ✅ ACTIVE  
**Last Updated**: January 7, 2026  
**Quick Solutions for Common Issues

---

## Table of Contents

1. [Color Issues](#color-issues)
2. [Spacing Issues](#spacing-issues)
3. [Typography Issues](#typography-issues)
4. [Component Issues](#component-issues)
5. [Dark Mode Issues](#dark-mode-issues)
6. [Accessibility Issues](#accessibility-issues)
7. [Performance Issues](#performance-issues)
8. [Build Issues](#build-issues)

---

## Color Issues

### Problem: Colors Don't Appear Correct

**Symptoms**: 
- Colors look different than expected
- Colors don't match design specifications
- Colors are too bright or too dark

**Solutions**:

1. **Check if using CSS variables**
   ```tsx
   // ❌ Wrong - Hardcoded colors
   <div className="bg-white text-black">

   // ✅ Correct - CSS variables
   <div className="bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
   ```

2. **Verify variable syntax**
   ```tsx
   // ❌ Wrong - Missing brackets
   <div className="text-var(--color-text-primary)">

   // ✅ Correct - With brackets and hyphens
   <div className="text-[var(--color-text-primary)]">
   ```

3. **Check CSS variable is defined**
   ```bash
   # Search for the variable in brand-design-system.css
   grep --color-text-primary /src/styles/brand-design-system.css
   ```

4. **Clear browser cache**
   ```bash
   # Hard reload in browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   ```

### Problem: Inconsistent Colors Across Components

**Solutions**:
1. Use semantic variables instead of color names
2. Always use CSS variables, never hardcode colors
3. Run color audit: `npm run audit:colors`

### Problem: Colors Don't Change in Dark Mode

**Solutions**:
1. Check that CSS variable values are defined in `@media (prefers-color-scheme: dark)`
2. Test with DevTools: F12 → Cmd+Shift+P → "Emulate CSS media feature prefers-color-scheme" → dark
3. Verify no hardcoded colors override CSS variables

---

## Spacing Issues

### Problem: Elements Too Close Together

**Symptoms**:
- Padding feels tight
- Buttons/inputs feel cramped
- Content feels condensed

**Solutions**:

1. **Use spacing scale correctly**
   ```tsx
   // ❌ Wrong - Arbitrary spacing
   <div className="p-5">

   // ✅ Correct - Use spacing scale
   <div className="p-[var(--spacing-3)]">  {/* 24px */}
   ```

2. **Use correct spacing token**
   ```tsx
   // Check spacing scale:
   // --spacing-1: 8px
   // --spacing-2: 16px
   // --spacing-3: 24px (good default)
   // --spacing-4: 32px (for larger sections)
   ```

3. **Add margin between sections**
   ```tsx
   <div className="space-y-[var(--spacing-3)]">
     <section>Item 1</section>
     <section>Item 2</section>
   </div>
   ```

### Problem: Elements Too Far Apart

**Solutions**:
- Use `--spacing-2` (16px) instead of `--spacing-3` (24px)
- Check for excessive gaps in flexbox
- Reduce bottom margin on elements

### Problem: Inconsistent Padding

**Solutions**:
1. Use `px-[var(--spacing-X)]` and `py-[var(--spacing-Y)]` consistently
2. Create component-level padding standards
3. Use `p-[var(--spacing-4)]` as default padding

---

## Typography Issues

### Problem: Text Too Small or Too Large

**Symptoms**:
- Hard to read text
- Text doesn't match design
- Labels are unreadable

**Solutions**:

1. **Use correct font size**
   ```tsx
   // Font sizes:
   // --font-size-xs: 12px (captions)
   // --font-size-sm: 14px (labels)
   // --font-size-base: 16px (body)
   // --font-size-lg: 18px (subheadings)
   // --font-size-xl: 20px (headings)
   // --font-size-2xl: 24px (large headings)

   // ✅ Correct usage
   <p className="text-[var(--font-size-base)]">Body text</p>
   <h2 className="text-[var(--font-size-xl)]">Heading</h2>
   ```

2. **Check line height**
   ```tsx
   // Tight (1.2) for headings
   // Normal (1.5) for body
   // Relaxed (1.75) for long text

   <p className="leading-[var(--line-height-normal)]">
     Body text with good line height
   </p>
   ```

3. **Verify font weight**
   ```tsx
   // Light (300) - Rarely used
   // Normal (400) - Default
   // Medium (500) - Labels
   // Semibold (600) - Subheadings
   // Bold (700) - Headings

   <h1 className="font-bold">Main heading</h1>
   ```

### Problem: Text Not Readable

**Solutions**:
1. Check contrast ratio (must be 4.5:1 for normal text)
2. Ensure using proper text color variables
3. Test with accessibility tools: WebAIM Contrast Checker

### Problem: Fonts Look Different

**Solutions**:
1. Verify font family is loaded: `font-[family-name]`
2. Check CSS: `--font-sans` or `--font-mono`
3. System fonts load instantly, no delay expected

---

## Component Issues

### Problem: Button Doesn't Look Right

**Symptoms**:
- Button styling incomplete
- Text not visible
- Wrong size

**Solutions**:

1. **Use Button component from ui library**
   ```tsx
   // ❌ Wrong - Custom button without styles
   <button>Click me</button>

   // ✅ Correct - Use Button component
   <Button variant="primary" size="md">Click me</Button>
   ```

2. **Check variant and size**
   ```tsx
   // Variants: primary, secondary, outline, danger
   // Sizes: sm, md, lg

   <Button variant="primary" size="md">
     Save
   </Button>
   ```

3. **Verify all required props**
   - `variant` - Button appearance
   - `size` - Button size
   - `disabled` - Disabled state
   - `loading` - Loading state

### Problem: Input Field Not Styled

**Solutions**:
1. Use Input component from ui library
2. Ensure `label` and `id` props are provided
3. Check error state is displayed

### Problem: Modal Not Appearing

**Solutions**:
1. Check `isOpen` prop is true
2. Verify modal portal is mounted in layout
3. Check z-index: modal should have high z-index

---

## Dark Mode Issues

### Problem: Colors Wrong in Dark Mode

**Symptoms**:
- Text hard to read in dark mode
- Colors look wrong
- Contrast too low

**Solutions**:

1. **Test dark mode properly**
   ```
   DevTools → Cmd+Shift+P → "Emulate CSS media feature prefers-color-scheme" → dark
   ```

2. **Check CSS variable definitions**
   ```css
   /* Should have dark mode overrides */
   @media (prefers-color-scheme: dark) {
     :root {
       /* Dark mode variable values */
     }
   }
   ```

3. **Use semantic color variables**
   ```tsx
   // ✅ Correct - Let system handle colors
   <p className="text-[var(--color-text-primary)]">

   // ❌ Wrong - Hardcoded won't work in dark mode
   <p className="text-black">
   ```

### Problem: Dark Mode Not Detected

**Solutions**:
1. Check system preference: OS > Settings > Dark Mode
2. Force dark mode in DevTools
3. Check browser support (all modern browsers support this)

### Problem: Manual Theme Toggle Not Working

**Solutions**:
1. Check `data-theme` attribute on HTML element
2. Verify JavaScript is applying attribute correctly
3. Check localStorage is saving preference

---

## Accessibility Issues

### Problem: Focus Indicator Not Visible

**Symptoms**:
- Can't see which element has keyboard focus
- Cannot navigate with Tab key

**Solutions**:

1. **Add focus-visible styles**
   ```tsx
   <button className="focus-visible:outline-2 
                      focus-visible:outline-[var(--color-border-focus)]">
     Click me
   </button>
   ```

2. **Don't remove outline**
   ```tsx
   // ❌ Wrong - Removes accessibility
   <button className="focus:outline-none">

   // ✅ Correct - Style outline
   <button className="focus-visible:outline-2 focus-visible:ring">
   ```

3. **Test keyboard navigation**
   - Use Tab key to navigate
   - All interactive elements should have focus indicator

### Problem: Screen Reader Not Working

**Solutions**:
1. Add ARIA labels: `aria-label="Close"`
2. Use semantic HTML: `<button>`, `<input>`, `<nav>`
3. Add alt text to images: `alt="Description"`
4. Test with screen reader: NVDA (Windows) or VoiceOver (Mac)

### Problem: Form Inputs Not Labeled

**Solutions**:
```tsx
// ✅ Correct - Proper label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ❌ Wrong - Missing label
<input placeholder="Email" />
```

---

## Performance Issues

### Problem: Page Loads Slowly

**Solutions**:
1. Check for unused CSS variables
2. Minimize number of CSS custom properties
3. Use CSS variables instead of inline styles

### Problem: CSS File Too Large

**Solutions**:
1. Remove unused variables
2. Consolidate similar colors
3. Use standard CSS variable naming

### Problem: Theme Switching Slow

**Solutions**:
1. Use CSS variables instead of JavaScript
2. Avoid repainting entire page
3. Use hardware acceleration: `will-change: color`

---

## Build Issues

### Problem: CSS Custom Properties Not Working

**Symptoms**:
- Variables show up as undefined
- Build fails
- Styles not applied

**Solutions**:

1. **Check CSS file is imported**
   ```tsx
   // In main entry point (main.tsx)
   import '@/styles/brand-design-system.css'
   import '@/index.css'
   ```

2. **Verify CSS syntax**
   ```css
   /* ✅ Correct */
   :root {
     --color-brand-navy: #235393;
   }

   /* ❌ Wrong - Missing semicolon */
   :root {
     --color-brand-navy: #235393
   }
   ```

3. **Check Tailwind config**
   ```javascript
   // tailwind.config.ts should reference variables
   theme: {
     colors: {
       // Using CSS variables
     }
   }
   ```

### Problem: Tailwind Classes Not Applied

**Solutions**:
1. Check class syntax: `className="text-[var(...)]"`
2. Verify Tailwind is scanning correct files
3. Rebuild project: `npm run build`

### Problem: Dark Mode Not Building

**Solutions**:
1. Check Tailwind dark mode config
2. Verify CSS media query syntax
3. Build with: `npm run build`

---

## Quick Diagnostics

### Run These Commands

```bash
# Check CSS variables are defined
grep "color-brand" src/styles/brand-design-system.css

# Check Tailwind config
npx tailwind --version

# Rebuild styles
npm run build:css

# Check for errors
npm run lint:css

# Audit accessibility
npm run audit:a11y
```

### Browser DevTools Checks

1. **Colors Tab**: DevTools → Elements → Styles
2. **Variables Tab**: Find CSS variable definitions
3. **Computed Tab**: Check final computed values
4. **Dark Mode Emulation**: Cmd+Shift+P → prefers-color-scheme

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Search for similar issues
3. ✅ Check brand-design-system.css
4. ✅ Test in browser DevTools
5. ✅ Clear cache and rebuild

### When Reporting Issues

Include:
- What you were trying to do
- What happened (error message)
- What you expected
- Steps to reproduce
- Browser and OS
- Screenshots

### Resources

- [Brand Design System Overview](./01_BRAND_DESIGN_SYSTEM_OVERVIEW.md)
- [Color Palette Guide](./02_COLOR_PALETTE_GUIDE.md)
- [Typography Guide](./03_TYPOGRAPHY_GUIDE.md)
- [Spacing & Layout Guide](./04_SPACING_LAYOUT_GUIDE.md)

---

**Created**: January 7, 2026  
**Version**: 1.0  
**Status**: ✅ COMPLETE
