# GitHub Issues - Accessibility Findings

**Auto-generated Issue Templates**  
**Copy and paste these into GitHub Issues**  
**Replace placeholders with actual findings from manual testing**

---

## TEMPLATE: P0 - Critical Keyboard Navigation Issue

```markdown
# P0: Keyboard navigation blocked on [Component Name]

## Severity
**Critical** - Users unable to navigate with keyboard only

## WCAG Criterion
[2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) (Level A)

## Description
[Describe the exact keyboard navigation problem. Example: "Users cannot navigate to the submit button using Tab key. After tabbing through form fields, focus disappears."]

## Steps to Reproduce
1. Navigate to http://localhost:5173/[page]
2. Press Tab key repeatedly
3. Notice that [component] cannot be reached via keyboard
4. [Additional steps]

## Expected
All interactive elements should be reachable via keyboard navigation in logical tab order.

## Actual
[Specific behavior - e.g., "Focus is trapped in form, cannot reach submit button", "Tab key does not work on modal buttons"]

## Current Behavior
- Users relying on keyboard only cannot [specific task]
- VoiceOver/screen reader users affected
- Mobile keyboard users affected

## Suggested Fix
1. Ensure all interactive elements have `tabindex` or are semantic (`<button>`, `<a>`, `<input>`)
2. Test Tab/Shift+Tab navigation flow
3. Verify logical tab order matches visual layout
4. Add focus trap escape in modals (Escape key)

## Resources
- [WebAIM Keyboard Accessibility](https://webaim.org/articles/keyboard/)
- [MDN: Keyboard Navigation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-driven_User_Interfaces)

## Acceptance Criteria
- [ ] Element reachable via Tab key
- [ ] Focus indicator visible
- [ ] Tab order is logical
- [ ] No keyboard traps
- [ ] Manual testing passes
- [ ] PR reviewed

## Screenshots
[Add before/after or issue demonstration]
```

---

## TEMPLATE: P0 - Critical Color Contrast Issue

```markdown
# P0: Insufficient color contrast on [Element]

## Severity
**Critical** - Text unreadable for users with low vision

## WCAG Criterion
[1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) (Level AA)

## Description
[Element] has insufficient color contrast ratio of **[X:1]** (requires **4.5:1** for normal text).

## Location
- Page: [URL]
- Component: [Component name]
- Element: [Specific element - button, link, text, etc.]

## Current Colors
- Foreground: `#XXXXXX` [Color name]
- Background: `#XXXXXX` [Color name]
- Ratio: **X:1** ❌ (fails WCAG AA)

## Required Ratio
- Normal text: **4.5:1** (WCAG AA)
- Large text: **3:1** (WCAG AA)

## Suggested Fix
Option 1: Darken foreground color
- Change text to: `#XXXXXX` (achieves ~5:1)

Option 2: Lighten background color
- Change background to: `#XXXXXX` (achieves ~5:1)

Option 3: Use different color scheme
- [Alternative proposal]

## Resources
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 1.4.3 Explanation](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)

## Acceptance Criteria
- [ ] Contrast ratio ≥ 4.5:1
- [ ] Verified with contrast checker
- [ ] Visual design preserved
- [ ] All states checked (normal, hover, focus, disabled)
- [ ] Testing passed

## Testing Steps
1. Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
2. Enter foreground color: #XXXXXX
3. Enter background color: #XXXXXX
4. Verify ratio ≥ 4.5:1

## Screenshots
[Include before/after contrast checker results]
```

---

## TEMPLATE: P0 - Critical Missing Alt Text

```markdown
# P0: Missing alt text on images

## Severity
**Critical** - Images inaccessible to screen reader users

## WCAG Criterion
[1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html) (Level A)

## Description
The following images are missing `alt` attributes or have empty alt text:
- [Image location/page]: [Image description]
- [Image location/page]: [Image description]
- [Image location/page]: [Image description]

## Impact
- Screen reader users hear "image" with no context
- Search engines cannot index image content
- Mobile users on slow connections see no meaning if image fails to load

## Suggested Fix
Add descriptive `alt` attributes to all images:

```html
<!-- Before -->
<img src="logo.png" />

<!-- After -->
<img src="logo.png" alt="SwipeSavvy company logo" />
```

## Alt Text Guidelines
- **Descriptive**: Convey the purpose/meaning
- **Concise**: ~125 characters or less
- **Unique**: Different from surrounding text
- **Actionable**: If image is a button, describe the action
- **Decorative**: Use empty alt="" if purely decorative

## Examples
```html
<!-- Good: Descriptive -->
<img src="user.png" alt="User profile avatar" />

<!-- Good: Actionable button -->
<button><img src="expand.png" alt="Expand menu" /></button>

<!-- Good: Decorative -->
<img src="divider.png" alt="" />

<!-- Bad: Too vague -->
<img src="pic.png" alt="image" />

<!-- Bad: Too long -->
<img src="chart.png" alt="A very detailed description of a chart showing..." />
```

## Resources
- [WebAIM Alt Text](https://webaim.org/articles/alttext/)
- [WCAG 1.1.1 Explanation](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content)

## Acceptance Criteria
- [ ] All images have `alt` attributes
- [ ] Alt text is descriptive and meaningful
- [ ] Decorative images have `alt=""`
- [ ] Tested with screen reader
- [ ] No repetition of surrounding text

## Testing
```bash
# Find all images missing alt text:
# In DevTools Console:
document.querySelectorAll('img:not([alt])').length
```
```

---

## TEMPLATE: P1 - Major Focus Indicator Issue

```markdown
# P1: Focus indicator not visible on [Element]

## Severity
**Major** - Keyboard users cannot see what element has focus

## WCAG Criterion
[2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html) (Level AA)

## Description
When tabbing through the page, [element] has no visible focus indicator. Users cannot determine which element currently has keyboard focus.

## Location
- Page: [URL]
- Element: [Button, link, form field, etc.]

## Current Behavior
- Press Tab to navigate to [element]
- Element receives focus but no visual change
- No outline, border, or background color change
- Impossible to see where focus currently is

## Suggested Fix

**Option 1: Add focus outline** (Recommended)
```css
button:focus {
  outline: 3px solid #4A90E2;
  outline-offset: 2px;
}
```

**Option 2: Add focus styles**
```css
button:focus {
  background-color: #E8F1FF;
  border: 2px solid #4A90E2;
}
```

**Option 3: Use focus-visible** (Modern browsers)
```css
button:focus-visible {
  outline: 3px solid #4A90E2;
}
```

## Resources
- [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
- [WebAIM Keyboard Accessibility](https://webaim.org/articles/keyboard/)

## Acceptance Criteria
- [ ] Focus indicator visible on all states
- [ ] Contrast ratio ≥ 3:1 (outline vs background)
- [ ] Works on all interactive elements
- [ ] No `outline: none` without replacement
- [ ] Keyboard testing passes

## Testing
Press Tab to navigate through page and verify each element has clear focus indicator.
```

---

## TEMPLATE: P1 - Major Missing Form Label

```markdown
# P1: Form input missing associated label

## Severity
**Major** - Form unclear for screen reader users

## WCAG Criterion
[1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html) (Level A)

## Description
The following form inputs are not properly associated with labels:
- [Form field name/type]
- [Form field name/type]

## Current HTML
```html
<!-- Bad: No label association -->
<input type="text" name="email" placeholder="Email address" />

<!-- Bad: Label text but no association -->
<label>Email</label>
<input type="text" />
```

## Suggested Fix
```html
<!-- Good: <label> with for attribute -->
<label for="email">Email Address</label>
<input type="email" id="email" name="email" />

<!-- Good: Nested <label> -->
<label>
  Email Address
  <input type="email" name="email" />
</label>

<!-- Good: aria-label as fallback -->
<input type="email" aria-label="Email Address" />
```

## Resources
- [WebAIM Form Labels](https://webaim.org/articles/form_labels/)
- [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships)

## Acceptance Criteria
- [ ] All inputs have associated labels
- [ ] Label `for` attribute matches input `id`
- [ ] Tested with screen reader
- [ ] Placeholder is not used as label
- [ ] Required fields indicated

## Testing
```bash
# In DevTools Console, check for unassociated inputs:
document.querySelectorAll('input').forEach(input => {
  const label = document.querySelector(`label[for="${input.id}"]`);
  if (!label && !input.aria-label) {
    console.log('Missing label:', input);
  }
});
```
```

---

## TEMPLATE: P2 - Minor Missing Skip Link

```markdown
# P2: Skip navigation link missing

## Severity
**Minor** - Convenience feature for keyboard users

## WCAG Criterion
[2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html) (Level A) - Recommended

## Description
Users must Tab through repetitive navigation to reach main content. A skip link would improve usability.

## Suggested Implementation

```html
<!-- Add at very beginning of <body> -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- In page somewhere -->
<main id="main-content">
  <!-- Page content here -->
</main>

<!-- CSS to hide skip link until focused -->
<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

## Resources
- [WebAIM Skip Links](https://webaim.org/articles/skipnav/)
- [WCAG 2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html)

## Acceptance Criteria
- [ ] Skip link visible on Tab press
- [ ] Links to main content
- [ ] Keyboard accessible
- [ ] Focus moves to target
```

---

## Quick Copy-Paste Commands

**Create issue for keyboard navigation**:
```bash
gh issue create --title "P0: Keyboard navigation blocked on [component]" \
  --body "$(cat GITHUB_ISSUES.md | sed -n '/TEMPLATE: P0.*Keyboard/,/^---/p')"
```

**Create issue for color contrast**:
```bash
gh issue create --title "P0: Insufficient color contrast on [element]" \
  --body "$(cat GITHUB_ISSUES.md | sed -n '/TEMPLATE: P0.*Color/,/^---/p')"
```

**Create issue for missing alt text**:
```bash
gh issue create --title "P0: Missing alt text on images" \
  --body "$(cat GITHUB_ISSUES.md | sed -n '/TEMPLATE: P0.*Alt Text/,/^---/p')"
```

---

## Instructions

1. **For each finding**:
   - Copy the appropriate template
   - Replace `[placeholders]` with actual findings
   - Add specific page/component information
   - Include before/after details

2. **Before creating issue**:
   - Verify finding with manual testing
   - Capture screenshot/video evidence
   - Check WCAG criterion reference
   - Estimate fix complexity

3. **After creating issue**:
   - Add to project board
   - Assign to team member
   - Set priority/milestone
   - Link to this audit report

---

**Last Updated**: December 26, 2025  
**Audit Status**: Testing in Progress  
**Created Issues**: ___ of ___
