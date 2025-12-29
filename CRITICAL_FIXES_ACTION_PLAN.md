# Immediate Action Plan: Fix Critical Test Failures

**Date**: December 26, 2025  
**Priority**: 🔴 CRITICAL - BLOCKING PRODUCTION DEPLOYMENT  
**Target**: Resolve by EOD Dec 26 or Jan 1 (before Jan 10 go-live)  

---

## Executive Summary

**Two critical issues found in testing sessions must be fixed before deployment**:

1. ⚠️ **Admin Portal**: SavvyAIConcierge.tsx has broken JSX syntax (lines 530-670)
2. ⚠️ **AI Agents**: main.py has Python syntax error at line 408

**Impact**: Builds fail → Tests cannot run → Cannot deploy  
**Resolution**: 45 minutes to fix both issues and re-test  
**Owner**: Development team (1 person per repo)

---

## Issue #1: Admin Portal JSX Errors (15 min fix)

### Command to Start Fix

```bash
cd /Users/macbookpro/Documents/swipesavvy-admin-portal
code src/components/SavvyAIConcierge.tsx  # or: nano <file>
```

### Specific Problems to Fix

**Problem 1: Line 565 - Missing Button Tag Opening**
```jsx
// WRONG:
className="concierge-message-button"
  onClick={() => setIsOpen(false)}

// RIGHT:
<button className="concierge-message-button"
  onClick={() => setIsOpen(false)}
>
```

**Problem 2: Lines 665-680 - Malformed JSX**
- Check that every `<div>`, `<span>`, `<button>` has matching closing tag
- Check that all `{` have matching `}`
- Check that all parentheses are balanced in JSX expressions

**Problem 3: HTML Entities in Strings**
- If you see strings with `>` in them, escape as `&gt;`
- If you see strings with `<` in them, escape as `&lt;`
- Example: `"x > 5"` should be `"x &gt; 5"` if inside JSX text

### Verification

```bash
# After fixes, run:
npm run build

# Expected output:
# ✅ No TypeScript errors
# ✅ Build completes in <30 seconds
# ✅ dist/ folder created
```

### If Build Still Fails

1. Check TypeScript errors: `npm run tsc --noEmit`
2. Review error line numbers carefully
3. Ensure no missing closing tags with VSCode's bracket matching
4. Try: `Ctrl+K Ctrl+0` (fold all) to see structure clearly

---

## Issue #2: AI Agents Python Syntax Error (15 min fix)

### Command to Start Fix

```bash
cd /Users/macbookpro/Documents/swipesavvy-ai-agents
python3 -c "import ast; ast.parse(open('services/concierge_agent/main.py').read())" 2>&1
```

This will show the exact line and error.

### Steps to Fix

**Step 1: Identify the Error**
```bash
python3 services/concierge_agent/main.py
# This will show: SyntaxError: invalid syntax at line 408
```

**Step 2: Open and Fix the File**
```bash
nano services/concierge_agent/main.py
# Go to line 408 (Ctrl+G in nano)
```

**Step 3: Common Syntax Issues to Check**
- ❌ Unclosed parenthesis: `func(arg1, arg2`
- ❌ Unclosed string: `message = "hello`
- ❌ Unclosed bracket: `data = [1, 2, 3`
- ❌ Invalid comment: `#comment without proper syntax`
- ❌ Bad indentation: mixing tabs and spaces

**Step 4: Fix Import Paths in Tests**
```bash
# Find test files:
find tests/ -name "*.py" -type f

# For each file, check imports:
grep -n "from conversation import\|from handoff import" tests/**/*.py

# Fix the paths from absolute to relative:
# from conversation import ...  →  from ..services.concierge_agent.conversation import ...
```

**Step 5: Install Missing Dependency**
```bash
pip3 install pytest-cov
```

### Verification

```bash
# After fixes, run:
python3 -c "import ast; ast.parse(open('services/concierge_agent/main.py').read())" && echo "✅ Syntax OK"

# Then:
python3 -m pytest tests/ -v

# Expected output:
# ✅ 48 items collected (no errors)
# ✅ Tests run (pass/fail is OK, no ModuleNotFoundError)
```

---

## Validation Checklist

**Admin Portal - After JSX Fixes**:
- [ ] Open `src/components/SavvyAIConcierge.tsx`
- [ ] Verify lines 530-670 have proper JSX structure
- [ ] Run `npm run build`
- [ ] Confirm 0 TypeScript errors
- [ ] Confirm 0 warnings (except pre-existing)
- [ ] App loads in browser (if running locally)

**AI Agents - After Python Fixes**:
- [ ] Open `services/concierge_agent/main.py`
- [ ] Verify line 408 has valid Python syntax
- [ ] Run `python3 -c "import ast; ast.parse(...)"`
- [ ] Confirm no SyntaxError
- [ ] Update test imports if needed
- [ ] Run `python3 -m pytest tests/ -v`
- [ ] Confirm 48 tests collected (or similar number)

---

## Full Fix Walkthrough (45 Minutes Total)

### Timeline

```
00:00 - 15:00: Fix Admin Portal JSX
  └─ Open file
  └─ Fix broken tags
  └─ Run build
  └─ Verify no errors

15:00 - 30:00: Fix AI Agents Python
  └─ Open file
  └─ Fix syntax error
  └─ Update test imports
  └─ Install dependencies
  └─ Verify pytest collection

30:00 - 45:00: Full Test Run
  └─ Run smoke tests (12 E2E)
  └─ Run unit tests (all repos)
  └─ Generate test reports
  └─ Update PR/Merge Request
```

---

## Escalation Path

**If fix takes >30 min on one issue**:
1. Document the error
2. Take a screenshot/copy the full error message
3. Post in #engineering Slack channel
4. Tag original developer of SavvyAIConcierge.tsx or main.py
5. Ask for 15-min pair debugging session

**If unable to fix**:
1. Document exactly what was tried
2. Note any error messages
3. Create GitHub issue with:
   - File path
   - Line number
   - Current code
   - Expected code
   - Error message
4. Assign to code owner

---

## Post-Fix Deployment Readiness

**Once both issues are fixed**, complete checklist:

```
✅ Admin Portal builds without errors
✅ AI Agents tests collect without errors
✅ All 12 smoke tests pass (100%)
✅ All unit tests pass (≥95%)
✅ Zero critical violations
✅ Performance targets met
✅ Stakeholder sign-off obtained
✅ Ready for January 10 go-live
```

---

## Resources

- 📄 [TEST_RESULTS_REPORT.md](./TEST_RESULTS_REPORT.md) - Full details of both issues
- 📄 [TESTING_SESSION_FIXES_APPLIED.md](./TESTING_SESSION_FIXES_APPLIED.md) - Detailed fix procedures
- 📄 [UIQA_PART_10_FINALIZATION_SIGN_OFF.md](./UIQA_PART_10_FINALIZATION_SIGN_OFF.md) - Sign-off template

---

## Success Criteria

```
┌──────────────────────────────────────────┐
│ ✅ Both Issues Fixed                    │
│ ✅ All Tests Pass (≥95%)               │
│ ✅ All Builds Succeed                  │
│ ✅ Ready for Production Deployment      │
└──────────────────────────────────────────┘
```

**Target**: EOD December 26 or January 1, 2026  
**Go-Live**: January 10, 2026
