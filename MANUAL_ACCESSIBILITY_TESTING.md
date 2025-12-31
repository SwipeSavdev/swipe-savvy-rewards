# Manual Accessibility Testing Guide

**Date**: December 26, 2025  
**Application**: SwipeSavvy Mobile App  
**Tester**: QA Team  
**Server**: http://localhost:5173

---

## Quick Start

1. **Dev Server**: Running on port 5173
2. **Enable VoiceOver** (macOS): Press `Cmd + F5`
3. **Open Browser**: Navigate to http://localhost:5173
4. **Document Findings**: Use the test checklists below

---

## Testing Scope

This manual audit tests **9 known accessibility issues**:

1. ✅ Missing alt text on images
2. ✅ Insufficient color contrast
3. ✅ Missing form labels
4. ✅ Poor keyboard navigation
5. ✅ Missing ARIA attributes
6. ✅ Semantic HTML issues
7. ✅ Focus indicators not visible
8. ✅ Modal accessibility
9. ✅ Skip links missing

---

## Test 1: Keyboard Navigation

### Objective
Verify all interactive elements are accessible via keyboard and tab order is logical.

### Procedure

**Page**: Home/Dashboard

```
□ Press Tab - First interactive element should be highlighted
□ Continue Tab - Verify logical tab order (top-to-bottom, left-to-right)
□ Shift+Tab - Navigate backwards through elements
□ Enter key - Activate buttons and links
□ Space - Activate checkboxes and toggles
□ Arrow keys - Navigate within lists/menus

✓ All interactive elements reachable via keyboard
✓ Tab order is logical and sequential
✓ No keyboard traps (can escape from all elements)
✓ Focus follows tab order predictably
```

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________
- [ ] Issue 3: ________________

---

## Test 2: Screen Reader Testing (VoiceOver)

### Prerequisites
- macOS with VoiceOver enabled: `Cmd + F5`
- VoiceOver Commander: `Cmd + Opt + U`

### Objective
Verify page structure, headings, and content are announced correctly to screen readers.

### Procedure

**Enable Navigation**:
```
Cmd + ← (Left Arrow)     - Move to previous element
Cmd + → (Right Arrow)    - Move to next element
Cmd + ↓ (Down Arrow)     - Move into groups/lists
VO + H                   - Read headings (list all)
VO + F                   - Read form controls (list all)
VO + L                   - Read links (list all)
VO + I                   - Read images and alt text
```

### Page Structure Checklist

**Headings**:
```
□ H1 exists and describes page purpose
□ Heading hierarchy is logical (H1 → H2 → H3)
□ No skipped heading levels
□ Each section has proper heading
```

**Navigation**:
```
□ Navigation menu is announced as "navigation"
□ Menu items are announced as links
□ Active/current page is indicated
□ Tab order within nav is logical
```

**Forms** (if present):
```
□ All form labels announced with inputs
□ Required fields indicated
□ Error messages announced
□ Input types announced (text, password, etc.)
□ Form groups labeled correctly
```

**Images**:
```
□ All images have alt text
□ Alt text is descriptive (not "image" or "photo")
□ Decorative images marked as such
□ Complex images have detailed descriptions nearby
```

**Lists**:
```
□ Lists announced as lists with item count
□ List items numbered/bulleted appropriately
□ No semantic misuse (divs pretending to be lists)
```

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________
- [ ] Issue 3: ________________

---

## Test 3: Visual Accessibility

### 3.1 Color Contrast

**Tool**: Use Browser DevTools or online checker  
**Standard**: WCAG AA - 4.5:1 for text, 3:1 for large text

### Procedure

```
1. Open DevTools (Cmd + Opt + I)
2. Inspect text element
3. Note foreground and background colors
4. Check contrast ratio: https://webaim.org/resources/contrastchecker/
5. Mark as ✓ if ≥4.5:1, ✗ if <4.5:1
```

**Elements to Test**:
- [ ] Body text
- [ ] Buttons
- [ ] Links
- [ ] Form labels
- [ ] Error messages
- [ ] Disabled states
- [ ] Hover states

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

### 3.2 Focus Indicators

**Objective**: All interactive elements must have visible focus indicators.

### Procedure

```
□ Tab to each button - Focus outline visible (not just color change)?
□ Tab to each link - Focus indicator visible?
□ Tab to form inputs - Focus styling clear?
□ Focus indicator is not removed (outline: none without replacement)
□ Focus indicator has sufficient contrast
```

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## Test 4: Form Accessibility

### Objective
Verify forms are properly labeled, structured, and announced.

**Only applicable if forms present on page**

### Procedure

```
For each form input:

□ Associated <label> element exists
□ Label text is descriptive
□ Label visually proximate to input
□ Required fields marked with *
□ Input type is semantic (type="email", type="password", etc.)
□ Placeholder ≠ label
□ Error messages linked to inputs
□ Success states are announced
```

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## Test 5: Semantic HTML

### Objective
Verify proper semantic HTML elements are used.

### Procedure

**In Browser DevTools**:

```
□ Main content in <main> element
□ Navigation in <nav> element
□ Related links in <footer> (if applicable)
□ Headings use <h1>-<h6> (not <span> or <div>)
□ Buttons use <button> (not <div onclick=...>)
□ Links use <a> (not <span onclick=...>)
□ Form inputs use <input>, <textarea>, <select>
□ Lists use <ul>/<ol> and <li>
□ No excessive use of <div> for structure
□ ARIA roles only when semantic element unavailable
```

### Issues Found
- [ ] Issue 1: ________________
- [ ] Issue 2: ________________

---

## Test 6: Responsive & Mobile

### Procedure

**If testing on mobile/responsive view**:

```
□ Touch targets ≥48x48 pixels
□ Buttons/links easily tappable
□ No horizontal scrolling for content
□ Zoom functionality works (not disabled)
□ Text is readable without zoom (≥16px)
□ Touch order follows visual order
```

### Issues Found
- [ ] Issue 1: ________________

---

## Test 7: Modal/Dialog Accessibility

**Only applicable if modals present**

### Procedure

```
□ Modal announced when opens
□ Focus trapped within modal
□ Close button easily accessible
□ Escape key closes modal
□ Backdrop not clickable or disabled
□ Focus returns to trigger element on close
□ Modal role or dialog element used
□ aria-modal="true" present
□ Modal announced by screen reader
```

### Issues Found
- [ ] Issue 1: ________________

---

## Test 8: Skip Links

### Procedure

```
□ Skip to main content link exists
□ Link appears on Tab (visible or on focus)
□ Link skips repetitive navigation
□ Link points to <main> or main content area
□ Skip link is keyboard accessible
□ Skip link works as expected
```

### Issues Found
- [ ] Issue 1: ________________

---

## Recording Issues

Use this format for each finding:

```
Issue #: [P0|P1|P2]
Title: [Clear, descriptive title]
Page: [Where it occurs]
Description: [What's the problem?]
WCAG Criterion: [e.g., 1.4.3 Contrast (Minimum)]
Steps to Reproduce:
  1. ...
  2. ...
Expected: [What should happen?]
Actual: [What actually happens?]
Screenshot: [If applicable]
```

---

## Summary Checklist

**Test Coverage**:
- [x] Test 1: Keyboard Navigation
- [x] Test 2: Screen Reader
- [x] Test 3: Visual Accessibility
- [x] Test 4: Form Accessibility
- [x] Test 5: Semantic HTML
- [x] Test 6: Responsive
- [x] Test 7: Modals
- [x] Test 8: Skip Links

**Findings Summary**:
- Total Issues Found: ___
- P0 (Critical): ___
- P1 (Major): ___
- P2 (Minor): ___

**Tester Name**: ________________  
**Date**: ________________  
**Time Spent**: ________________

---

## Next Steps

1. ✅ Create GitHub issues for all P0 violations
2. ✅ Assign owners for remediation
3. ✅ Schedule follow-up audit after fixes
4. ✅ Add automated tests to CI/CD

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Keyboard Accessibility](https://webaim.org/articles/keyboard/)
- [Screen Reader Testing](https://www.nvaccess.org/download/)
- [VoiceOver Gestures (macOS)](https://www.apple.com/accessibility/voiceover/info/guide/)
