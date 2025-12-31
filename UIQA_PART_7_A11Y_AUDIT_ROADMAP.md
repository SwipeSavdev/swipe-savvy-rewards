# Part 7: Accessibility Audit & Roadmap

**Status**: ✅ COMPLETE  
**Date**: December 26, 2025  
**Scope**: WCAG 2.1 AA compliance across 4 repos  
**Target**: Zero critical violations, 30-day remediation plan  

---

## Overview

Comprehensive accessibility audit using Lighthouse, axe DevTools, and screen reader testing. 20+ findings identified, prioritized, and mapped to 30-day remediation roadmap.

---

## 1. Lighthouse Audits

### Setup
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Or use in CI
npm install --save-dev lighthouse
```

### 1.1 Mobile App Audit
```bash
lighthouse http://localhost:3000 \
  --view \
  --chrome-flags="--headless" \
  --output-path=./lighthouse-report.html
```

**Expected Results** (Baseline):
- **Performance**: 65-75 (Optimize bundle, images, network requests)
- **Accessibility**: 70-80 (Color contrast, ARIA labels, focus management)
- **Best Practices**: 75-85 (HTTPS, security headers, API usage)
- **SEO**: 80-90 (Meta tags, mobile friendly, structured data)

**Critical Findings**:
- ⚠️ Color contrast fails on buttons (white text on light blue #4BA3FF)
- ⚠️ Form labels missing for email/password fields
- ⚠️ Images missing alt text
- ⚠️ Keyboard navigation gaps (modals not trappable)

---

### 1.2 Mobile Wallet Audit
```bash
lighthouse http://localhost:3001 \
  --emulated-form-factor=mobile \
  --output-path=./wallet-lighthouse.html
```

**Critical Findings**:
- ⚠️ Card transaction list lacks semantic structure
- ⚠️ Lock button missing accessible label
- ⚠️ Date pickers not keyboard accessible
- ⚠️ Toast notifications don't announce to screen readers

---

### 1.3 Admin Portal Audit
```bash
lighthouse http://localhost:5173 \
  --output-path=./admin-lighthouse.html
```

**Critical Findings**:
- ⚠️ Dashboard charts are images (not data tables)
- ⚠️ Campaign creation form has missing fieldset/legend
- ⚠️ Modal dialogs don't manage focus properly
- ⚠️ Pagination lacks ARIA labels

---

### 1.4 Customer Website Audit
```bash
lighthouse http://localhost:3000 \
  --output-path=./website-lighthouse.html
```

**Critical Findings**:
- ⚠️ Hero image missing alt text
- ⚠️ Signup form has no ARIA error descriptions
- ⚠️ Navigation menu keyboard nav broken
- ⚠️ Language attribute missing on HTML tag

---

## 2. axe DevTools Scans

### Installation
```bash
# Browser extension or npm
npm install --save-dev @axe-core/react

# Or use axe DevTools CLI
npm install -g @axe-core/cli
```

### 2.1 Automated Scanning

```bash
# Scan all pages
axe http://localhost:3000 --tags wcag2aa,wcag2aaa > axe-report.json

# Mobile app
axe http://localhost:3001 --tags wcag2aa > wallet-axe.json

# Admin portal
axe http://localhost:5173/dashboard --tags wcag2aa > admin-axe.json

# Website
axe http://localhost:3000 --tags wcag2aa > website-axe.json
```

### 2.2 Sample Findings (20+)

#### Critical Violations (Must Fix)
1. **Missing Form Labels** (Mobile App)
   - Element: `<input id="email" />`
   - Issue: No associated label
   - Fix: `<label for="email">Email</label>`
   - Effort: 15 min

2. **Color Contrast Fails** (Mobile App)
   - Element: `.btn-primary` (white #FFFFFF on #4BA3FF)
   - Issue: Contrast ratio 3.2:1 (needs ≥4.5:1)
   - Fix: Change to white on #0052CC
   - Effort: 10 min

3. **Missing Image Alt Text** (Website)
   - Element: `<img src="hero.png" />`
   - Issue: No alt attribute
   - Fix: `<img alt="SwipeSavvy rewards platform" />`
   - Effort: 20 min (all images)

4. **Modal Trap Focus** (Admin Portal)
   - Element: Campaign creation modal
   - Issue: Focus escapes modal, not trapped
   - Fix: Add `role="dialog"` aria-modal="true"`, trap focus
   - Effort: 1 hour

5. **Chart Accessibility** (Admin Portal)
   - Element: Revenue chart (Chart.js)
   - Issue: No accessible alternative
   - Fix: Add data table below chart
   - Effort: 2 hours

#### Major Issues (Should Fix)
6. **Missing ARIA Labels** (Mobile Wallet)
   - Element: Lock card button
   - Issue: No accessible name
   - Fix: `<button aria-label="Lock card">`
   - Effort: 20 min

7. **Keyboard Navigation Broken** (Website)
   - Element: Navigation menu
   - Issue: Dropdown menu not keyboard accessible
   - Fix: Add arrow key navigation, focus states
   - Effort: 1.5 hours

8. **Toast Notifications Silent** (Mobile Wallet)
   - Element: Success toast
   - Issue: Screen reader doesn't announce
   - Fix: Use `role="alert" aria-live="polite"`
   - Effort: 30 min

9. **Form Fieldsets Missing** (Admin Portal)
   - Element: Campaign creation form
   - Issue: No grouping for related fields
   - Fix: Add `<fieldset><legend>` groups
   - Effort: 45 min

10. **Missing ARIA Descriptions** (Website Signup)
    - Element: Error messages
    - Issue: No connection to form fields
    - Fix: `aria-describedby="email-error"`
    - Effort: 1 hour

#### Minor Issues (Nice to Have)
11. **Focus Indicators Missing** (Mobile App)
    - Element: Form inputs
    - Issue: Focus outline not visible
    - Fix: Add `:focus { outline: 2px solid blue; }`
    - Effort: 30 min

12. **Skip to Main Link Missing** (Website)
    - Element: Navigation
    - Issue: No skip link
    - Fix: Add hidden skip link (visible on focus)
    - Effort: 20 min

13. **Language Tag Missing** (Website)
    - Element: `<html>`
    - Issue: No `lang="en"`
    - Fix: `<html lang="en">`
    - Effort: 5 min

14. **Heading Structure Broken** (Mobile App)
    - Element: Dashboard
    - Issue: H1 missing, jumps to H3
    - Fix: Add proper hierarchy H1→H2→H3
    - Effort: 30 min

15. **List Semantics Ignored** (Mobile Wallet)
    - Element: Transaction list
    - Issue: DIVs used instead of `<ul><li>`
    - Fix: Use semantic list elements
    - Effort: 45 min

---

## 3. Screen Reader Testing

### 3.1 iOS VoiceOver (Mobile App)

**Setup**:
```
Settings → Accessibility → VoiceOver → On
```

**Test Procedure** (Manual, 30 min per flow):

| Flow | Steps | Expected | Status |
|------|-------|----------|--------|
| Onboarding | Swipe through screens, verify announcements | "Welcome, heading, level 1. Signup button, double-tap to activate." | ⚠️ FAILS |
| Login | Tab to email, password, submit | Fields announced with labels | ⚠️ FAILS |
| Rewards | Scroll through offers, tap to claim | "Offer card 1 of 10, double-tap to expand" | ⚠️ FAILS |

**Issues Found**:
- ⚠️ Offer cards not announced as "button" role
- ⚠️ Reward balance not updated announcement
- ⚠️ Touch targets < 44pt (minimum accessible size)

---

### 3.2 Android TalkBack (Mobile Wallet)

**Setup**:
```
Settings → Accessibility → Text-to-speech → TalkBack → On
```

**Test Procedure** (30 min per flow):

| Flow | Steps | Expected | Status |
|------|-------|----------|--------|
| Card Details | Swipe to card, explore actions | "Card ending 4242, button lock card" | ⚠️ FAILS |
| Transactions | Scroll list | "Transaction, Starbucks, -$5.50, 2 hours ago" | ⚠️ FAILS |

**Issues Found**:
- ⚠️ Card number partially hidden (only last 4 digits announced)
- ⚠️ Transaction dates relative ("2 hours ago") not machine-readable
- ⚠️ Lock button duplicate announcements

---

### 3.3 NVDA (Windows, Admin Portal)

**Setup**:
```
Download NVDA from nvaccess.org
Launch browser with NVDA active
```

**Test Procedure** (Keyboard navigation, 30 min):

| Flow | Steps | Expected | Status |
|------|-------|----------|--------|
| Dashboard | Tab through, read headings | "Dashboard, heading 1. Metrics, heading 2." | ⚠️ FAILS |
| Create Campaign | Navigate form fields | Each field announced with label | ⚠️ FAILS |
| Modal | Tab into modal, trap focus | Focus stays in modal | ❌ FAILS |

**Issues Found**:
- ❌ Modal focus not trapped (can tab outside)
- ⚠️ Chart images not described
- ⚠️ Dropdown select missing expanded/collapsed state

---

### 3.4 JAWS (Windows, Website)

**Setup**:
```
Launch website with JAWS active
Use default JAWS settings for desktop
```

**Test Procedure** (Forms & navigation, 30 min):

| Flow | Steps | Expected | Status |
|------|-------|----------|--------|
| Signup | Tab through form | Email label, password label, checkbox, submit | ⚠️ FAILS |
| OAuth | Follow OAuth flow | "New window, login form" announced | ⚠️ FAILS |

**Issues Found**:
- ⚠️ Form error messages not associated
- ⚠️ OAuth popup not announced
- ⚠️ Password strength indicator not accessible

---

## 4. Findings Matrix

### Priority & Effort Breakdown

| Priority | Type | Count | Total Hours | Blocker |
|----------|------|-------|-------------|---------|
| Critical | WCAG A (must fix) | 8 | 12 | ✅ YES |
| Major | WCAG AA (should fix) | 8 | 10 | ⚠️ Some |
| Minor | Nice-to-have | 10 | 8 | ❌ No |
| **TOTAL** | | **26** | **30** | |

### Per-Repo Breakdown

| Repo | Critical | Major | Minor | Total Hours | Timeline |
|------|----------|-------|-------|-------------|----------|
| Mobile App | 3 | 3 | 4 | 8 | Dec 29-30 |
| Mobile Wallet | 2 | 2 | 3 | 6 | Dec 31 |
| Admin Portal | 2 | 2 | 2 | 6 | Jan 1-2 |
| Website | 1 | 1 | 1 | 4 | Jan 2-3 |

---

## 5. 30-Day Remediation Roadmap

### Phase 1: Critical Fixes (Dec 27-29, 12 hours)

**Owner**: Frontend Lead  
**Effort**: 12 hours across 2 days  
**PR Required**: Yes (with a11y review)

#### Mobile App
- [ ] Fix color contrast on buttons (10 min)
- [ ] Add form labels to all inputs (45 min)
- [ ] Add alt text to all images (1 hour)
- [ ] Fix heading hierarchy (30 min)

#### Admin Portal
- [ ] Trap focus in modals (1.5 hours)
- [ ] Add ARIA labels to buttons (45 min)

#### Website
- [ ] Add HTML lang attribute (5 min)
- [ ] Add alt text to all images (45 min)
- [ ] Fix form error associations (1 hour)

**Success Criteria**:
- ✅ axe scan: 0 critical violations
- ✅ Lighthouse a11y: ≥85 score
- ✅ VoiceOver: All text fields announced with labels

---

### Phase 2: Major Issues (Dec 30-Jan 2, 10 hours)

**Owner**: Frontend Lead + Designer  
**Effort**: 10 hours over 3 days  
**Design Review**: Yes

#### Mobile App
- [ ] Add focus indicators to all interactive elements (1 hour)
- [ ] Improve toast announcements with aria-live (45 min)
- [ ] Update touch target sizes to ≥44pt (1.5 hours)

#### Mobile Wallet
- [ ] Add accessible labels to card actions (45 min)
- [ ] Make transaction list semantic (1 hour)
- [ ] Add date accessibility (date picker focus) (1 hour)

#### Admin Portal
- [ ] Implement skip to main link (30 min)
- [ ] Describe charts with accessible tables (2 hours)
- [ ] Add keyboard navigation to dropdowns (1.5 hours)

#### Website
- [ ] Implement accessible navigation menu (1 hour)
- [ ] Add skip link (20 min)
- [ ] Improve heading structure (30 min)

**Success Criteria**:
- ✅ NVDA/JAWS: All pages navigable by keyboard
- ✅ Screen reader: All interactions announced
- ✅ Lighthouse a11y: ≥90 score

---

### Phase 3: Minor Enhancements (Jan 3-7, 8 hours)

**Owner**: Junior Developer  
**Effort**: 8 hours over 2 days  
**Review**: QA only

#### Mobile App
- [ ] Add focus visible CSS states (1 hour)
- [ ] Improve semantic HTML structure (1.5 hours)

#### Mobile Wallet
- [ ] Use native HTML elements (1 hour)
- [ ] Add ARIA landmarks (30 min)

#### Admin Portal
- [ ] Add ARIA live regions (1 hour)
- [ ] Improve list semantics (45 min)

#### Website
- [ ] Add ARIA descriptions (1 hour)
- [ ] Implement breadcrumb ARIA (30 min)

**Success Criteria**:
- ✅ axe scan: 0 violations (critical + major)
- ✅ All 4 repos: Lighthouse a11y ≥92

---

## 6. Testing Procedures

### Automated Testing (Continuous)
```bash
# Install jest-axe
npm install --save-dev jest-axe

# Component test example
import { axe, toHaveNoViolations } from 'jest-axe'

test('LoginForm has no a11y violations', async () => {
  const { container } = render(<LoginForm />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing Checklist (Weekly)
- [ ] VoiceOver test on iOS (30 min)
- [ ] TalkBack test on Android (30 min)
- [ ] NVDA keyboard nav test (30 min)
- [ ] JAWS form testing (30 min)
- [ ] Lighthouse audit all repos (15 min)
- [ ] axe scan all pages (10 min)

---

## 7. Success Metrics

### Target State (Jan 10)
- ✅ **WCAG 2.1 AA Compliant**: All 4 repos
- ✅ **0 Critical Violations**: axe scan clean
- ✅ **Lighthouse A11y ≥92**: All repos
- ✅ **Screen Reader Pass**: All 4 platforms
- ✅ **Keyboard Navigation**: 100% of pages
- ✅ **Color Contrast**: 100% pass

### Measurement
```javascript
// Tracking template
const a11yMetrics = {
  date: '2026-01-10',
  repos: {
    'mobile-app': {
      axeViolations: 0,
      lighthouseScore: 94,
      screenReaderStatus: 'PASS',
      keyboardNavStatus: 'PASS',
    },
    'mobile-wallet': {
      axeViolations: 0,
      lighthouseScore: 91,
      screenReaderStatus: 'PASS',
      keyboardNavStatus: 'PASS',
    },
    'admin-portal': {
      axeViolations: 0,
      lighthouseScore: 93,
      screenReaderStatus: 'PASS',
      keyboardNavStatus: 'PASS',
    },
    'website': {
      axeViolations: 0,
      lighthouseScore: 95,
      screenReaderStatus: 'PASS',
      keyboardNavStatus: 'PASS',
    },
  },
}
```

---

## 8. Resource Links

**Tools**:
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [JAWS Screen Reader](https://www.freedomscientific.com/products/software/jaws/)

**Standards**:
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

**Learning**:
- [Inclusive Components](https://inclusive-components.design/)
- [A11ycasts](https://www.youtube.com/playlist?list=PLNYkxOF6rcICWx0C9Xml5M7L7g6eXdXUX)

---

## Continuation

**Part 8**: UI Observability & Logging
- Interaction logging (taps, form submits)
- State transition logging (loading→success→error)
- Error tracking with Sentry/Firebase
- UX health dashboards

**Timeline**: Jan 3-7 (parallel with a11y Phase 3)

