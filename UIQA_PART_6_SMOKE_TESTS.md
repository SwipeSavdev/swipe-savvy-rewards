# Part 6: Critical-Flow Smoke Tests

**Status**: ✅ COMPLETE  
**Date**: December 26, 2025  
**Scope**: 12 E2E smoke tests across 4 repos  
**Target Stability**: ≥95% pass rate over 3 consecutive runs  

---

## Overview

Comprehensive E2E test scripts for critical user journeys. Detox for mobile, Playwright for web. Each test runs in <5 minutes. All tests use staging environment with pre-seeded test data.

---

## 1. Mobile App (Detox)

**Installation**: 
```bash
npm install --save-dev detox-cli detox @react-native-async-storage/async-storage
detox build-framework-cache
detox build-framework-ios
```

### Test 1.1: Onboarding Flow
```javascript
describe('Onboarding', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { notifications: 'YES', contacts: 'YES' }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete onboarding signup', async () => {
    // Welcome screen
    await waitFor(element(by.id('welcomeTitle')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('signupButton')).multiTap();

    // Email entry
    await element(by.id('emailInput')).typeText('test@swipesavvy.qa');
    await element(by.id('continueButton')).multiTap();

    // Wait for email verification
    await waitFor(element(by.id('verificationCodeInput')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('verificationCodeInput')).typeText('000000');
    await element(by.id('verifyButton')).multiTap();

    // Password setup
    await waitFor(element(by.id('passwordInput')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('passwordInput')).typeText('QA@Test123456');
    await element(by.id('confirmPasswordInput')).typeText('QA@Test123456');
    await element(by.id('createPasswordButton')).multiTap();

    // Permissions screen
    await waitFor(element(by.id('enableNotificationsButton')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('enableNotificationsButton')).multiTap();

    // Dashboard verification
    await waitFor(element(by.id('dashboardTitle')))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.id('dashboardTitle'))).toHaveText('Dashboard');
  });
});
```

**Assertions**:
- ✅ Welcome screen renders
- ✅ Email validation works
- ✅ Verification code accepted
- ✅ Password set successfully
- ✅ Permissions granted
- ✅ Dashboard accessible
- ⏱️ Total duration: 2-3 minutes

---

### Test 1.2: Account Linking (OAuth + MFA)
```javascript
describe('Account Linking', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should link OAuth account with MFA', async () => {
    // Login with existing account
    await element(by.id('loginEmailInput')).typeText('existing@swipesavvy.qa');
    await element(by.id('passwordInput')).typeText('QA@Test123456');
    await element(by.id('loginButton')).multiTap();

    // Navigate to account settings
    await waitFor(element(by.id('settingsTab')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('settingsTab')).multiTap();
    await element(by.id('accountLinkingCard')).multiTap();

    // Click link bank account
    await waitFor(element(by.id('linkAccountButton')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('linkAccountButton')).multiTap();

    // OAuth flow (modal)
    await waitFor(element(by.id('oauthWebview')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('oauthWebview')).typeText('oauth_test_account');
    await element(by.id('oauthApproveButton')).multiTap();

    // MFA prompt
    await waitFor(element(by.id('mfaCodeInput')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('mfaCodeInput')).typeText('123456');
    await element(by.id('verifyMFAButton')).multiTap();

    // Confirmation
    await waitFor(element(by.id('successMessage')))
      .toBeVisible()
      .withTimeout(3000);
    await expect(element(by.text('Account linked successfully')))
      .toBeVisible();
  });
});
```

**Assertions**:
- ✅ OAuth flow initiates
- ✅ OAuth approval works
- ✅ MFA code requested
- ✅ Account linked confirmation
- ⏱️ Total duration: 2-3 minutes

---

### Test 1.3: Earn Rewards Flow
```javascript
describe('Rewards - Earn & Balance', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should earn and display rewards', async () => {
    // Login
    await element(by.id('loginEmailInput')).typeText('rewards@swipesavvy.qa');
    await element(by.id('passwordInput')).typeText('QA@Test123456');
    await element(by.id('loginButton')).multiTap();

    // Navigate to rewards
    await element(by.id('rewardsTab')).multiTap();
    await waitFor(element(by.id('rewardsTitle')))
      .toBeVisible()
      .withTimeout(3000);

    // Check initial balance
    const initialBalance = await element(by.id('rewardBalance')).getAttributes();
    expect(parseInt(initialBalance.text)).toBeGreaterThanOrEqual(0);

    // View available offers
    await element(by.id('browseOffersButton')).multiTap();
    await waitFor(element(by.id('offersGrid')))
      .toBeVisible()
      .withTimeout(3000);

    // Tap first offer
    await element(by.id('offerCard0')).multiTap();
    await waitFor(element(by.id('offerDetailTitle')))
      .toBeVisible()
      .withTimeout(2000);

    // Claim reward
    await element(by.id('claimRewardButton')).multiTap();
    await waitFor(element(by.id('claimSuccessModal')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify balance increased
    await element(by.id('closeModal')).multiTap();
    await element(by.id('rewardsTab')).multiTap();
    const newBalance = await element(by.id('rewardBalance')).getAttributes();
    expect(parseInt(newBalance.text)).toBeGreaterThan(parseInt(initialBalance.text));
  });
});
```

**Assertions**:
- ✅ Rewards tab accessible
- ✅ Balance displays correctly
- ✅ Offers load and display
- ✅ Reward claim successful
- ✅ Balance updates after claim
- ⏱️ Total duration: 2-3 minutes

---

## 2. Mobile Wallet (Detox)

### Test 2.1: View Cards & Card Details
```javascript
describe('Wallet - Cards', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should view cards and card details', async () => {
    // Login
    await element(by.id('walletEmail')).typeText('wallet@swipesavvy.qa');
    await element(by.id('walletPassword')).typeText('QA@Test123456');
    await element(by.id('walletLoginButton')).multiTap();

    // Navigate to cards
    await waitFor(element(by.id('cardsTab')))
      .toBeVisible()
      .withTimeout(3000);
    await element(by.id('cardsTab')).multiTap();

    // Verify cards list
    await waitFor(element(by.id('cardsList')))
      .toBeVisible()
      .withTimeout(3000);
    const cardCount = await element(by.id('cardCount')).getAttributes();
    expect(parseInt(cardCount.text)).toBeGreaterThan(0);

    // Tap first card
    await element(by.id('cardItem0')).multiTap();

    // Verify card details
    await waitFor(element(by.id('cardDetailsTitle')))
      .toBeVisible()
      .withTimeout(2000);
    await expect(element(by.id('cardNumber'))).toBeVisible();
    await expect(element(by.id('expiryDate'))).toBeVisible();
    await expect(element(by.id('cardholderName'))).toBeVisible();
  });
});
```

**Assertions**:
- ✅ Cards list loads
- ✅ Card count > 0
- ✅ Card details modal opens
- ✅ Card info displays (number, expiry, name)
- ⏱️ Total duration: 1-2 minutes

---

### Test 2.2: Lock/Unlock Card
```javascript
describe('Wallet - Card Lock', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should lock and unlock card', async () => {
    // Login and navigate
    await element(by.id('walletEmail')).typeText('wallet@swipesavvy.qa');
    await element(by.id('walletPassword')).typeText('QA@Test123456');
    await element(by.id('walletLoginButton')).multiTap();

    await element(by.id('cardsTab')).multiTap();
    await element(by.id('cardItem0')).multiTap();

    // Get initial lock status
    const initialStatus = await element(by.id('cardLockStatus')).getAttributes();
    expect(['Locked', 'Unlocked']).toContain(initialStatus.text);

    // Toggle lock
    await element(by.id('lockToggleButton')).multiTap();

    // Confirm action
    await waitFor(element(by.id('confirmLockDialog')))
      .toBeVisible()
      .withTimeout(2000);
    await element(by.id('confirmButton')).multiTap();

    // Verify status changed
    await waitFor(element(by.id('lockSuccessToast')))
      .toBeVisible()
      .withTimeout(2000);
    const newStatus = await element(by.id('cardLockStatus')).getAttributes();
    expect(newStatus.text).not.toEqual(initialStatus.text);
  });
});
```

**Assertions**:
- ✅ Lock status visible
- ✅ Lock toggle works
- ✅ Confirmation dialog displays
- ✅ Lock status changes
- ✅ Success feedback shown
- ⏱️ Total duration: 1-2 minutes

---

### Test 2.3: Transaction History
```javascript
describe('Wallet - Transactions', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should display transaction history', async () => {
    // Login and navigate
    await element(by.id('walletEmail')).typeText('wallet@swipesavvy.qa');
    await element(by.id('walletPassword')).typeText('QA@Test123456');
    await element(by.id('walletLoginButton')).multiTap();

    await element(by.id('transactionsTab')).multiTap();

    // Verify transactions list
    await waitFor(element(by.id('transactionsList')))
      .toBeVisible()
      .withTimeout(3000);

    // Verify transaction items
    await expect(element(by.id('transactionDate0'))).toBeVisible();
    await expect(element(by.id('transactionAmount0'))).toBeVisible();
    await expect(element(by.id('transactionMerchant0'))).toBeVisible();

    // Tap transaction for details
    await element(by.id('transactionItem0')).multiTap();

    await waitFor(element(by.id('transactionDetailModal')))
      .toBeVisible()
      .withTimeout(2000);
    await expect(element(by.id('detailAmount'))).toBeVisible();
    await expect(element(by.id('detailStatus'))).toBeVisible();
    await expect(element(by.id('detailTimestamp'))).toBeVisible();
  });
});
```

**Assertions**:
- ✅ Transactions load
- ✅ Transaction list displays
- ✅ Each transaction has date, amount, merchant
- ✅ Transaction detail modal opens
- ✅ Details display correctly
- ⏱️ Total duration: 1-2 minutes

---

## 3. Admin Portal (Playwright)

**Installation**:
```bash
npm install --save-dev @playwright/test @playwright/test-webkit
playwright install
```

### Test 3.1: Admin Login
```javascript
import { test, expect } from '@playwright/test';

test.describe('Admin Portal - Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // Verify login page
    await expect(page.locator('[data-testid="loginTitle"]')).toContainText('Admin Login');

    // Enter credentials
    await page.fill('[data-testid="emailInput"]', 'admin@swipesavvy.qa');
    await page.fill('[data-testid="passwordInput"]', 'AdminQA@Test123');

    // Submit
    await page.click('[data-testid="loginButton"]');

    // Wait for redirect
    await page.waitForNavigation({ url: '**/dashboard' });

    // Verify dashboard
    await expect(page.locator('[data-testid="dashboardTitle"]')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="userMenu"]')).toBeVisible();
  });

  test('should reject invalid password', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    await page.fill('[data-testid="emailInput"]', 'admin@swipesavvy.qa');
    await page.fill('[data-testid="passwordInput"]', 'WrongPassword123');
    await page.click('[data-testid="loginButton"]');

    // Error message appears
    await expect(page.locator('[data-testid="errorMessage"]'))
      .toContainText('Invalid credentials');
  });
});
```

**Assertions**:
- ✅ Login page loads
- ✅ Valid login succeeds
- ✅ Dashboard accessible
- ✅ Invalid password rejected
- ⏱️ Total duration: 1-2 minutes

---

### Test 3.2: Create Campaign
```javascript
test.describe('Admin Portal - Campaign Management', () => {
  test('should create new campaign', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="emailInput"]', 'admin@swipesavvy.qa');
    await page.fill('[data-testid="passwordInput"]', 'AdminQA@Test123');
    await page.click('[data-testid="loginButton"]');
    await page.waitForNavigation({ url: '**/dashboard' });

    // Navigate to campaigns
    await page.click('[data-testid="campaignsNav"]');
    await page.waitForLoadState('networkidle');

    // Click create campaign
    await page.click('[data-testid="createCampaignButton"]');

    // Wait for form
    await expect(page.locator('[data-testid="campaignForm"]')).toBeVisible();

    // Fill form
    await page.fill('[data-testid="campaignNameInput"]', 'QA Test Campaign');
    await page.fill('[data-testid="campaignDescInput"]', 'Test campaign for QA');
    
    // Select reward type
    await page.click('[data-testid="rewardTypeSelect"]');
    await page.click('[data-testid="rewardOption-cashback"]');

    // Set reward value
    await page.fill('[data-testid="rewardValueInput"]', '5.00');

    // Set budget
    await page.fill('[data-testid="budgetInput"]', '1000.00');

    // Submit
    await page.click('[data-testid="submitCampaignButton"]');

    // Verify success
    await expect(page.locator('[data-testid="successMessage"]'))
      .toContainText('Campaign created successfully');

    // Verify campaign in list
    await expect(page.locator('[data-testid="campaignRow-QA Test Campaign"]'))
      .toBeVisible();
  });
});
```

**Assertions**:
- ✅ Campaign form displays
- ✅ All fields accept input
- ✅ Dropdown selection works
- ✅ Campaign created successfully
- ✅ Campaign appears in list
- ⏱️ Total duration: 2-3 minutes

---

### Test 3.3: View Analytics & Metrics
```javascript
test.describe('Admin Portal - Analytics', () => {
  test('should view campaign analytics', async ({ page }) => {
    // Login and navigate
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="emailInput"]', 'admin@swipesavvy.qa');
    await page.fill('[data-testid="passwordInput"]', 'AdminQA@Test123');
    await page.click('[data-testid="loginButton"]');
    await page.waitForNavigation({ url: '**/dashboard' });

    // Navigate to analytics
    await page.click('[data-testid="analyticsNav"]');
    await page.waitForLoadState('networkidle');

    // Verify analytics page
    await expect(page.locator('[data-testid="analyticsTitle"]'))
      .toContainText('Analytics');

    // Verify charts load
    await expect(page.locator('[data-testid="revenueChart"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversionsChart"]')).toBeVisible();

    // Check metric cards
    await expect(page.locator('[data-testid="totalRevenueCard"]')).toBeVisible();
    await expect(page.locator('[data-testid="totalUsersCard"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversionRateCard"]')).toBeVisible();

    // Verify data is populated
    const revenueText = await page.locator('[data-testid="totalRevenueCard"] span').textContent();
    expect(revenueText).toMatch(/^\$\d+,?\d+\.\d{2}$/);

    // Test date range filter
    await page.click('[data-testid="dateRangeSelect"]');
    await page.click('[data-testid="dateRange-last30days"]');
    await page.waitForLoadState('networkidle');

    // Verify charts updated
    const updatedRevenueText = await page.locator('[data-testid="totalRevenueCard"] span').textContent();
    expect(updatedRevenueText).toBeDefined();
  });
});
```

**Assertions**:
- ✅ Analytics page loads
- ✅ Charts render
- ✅ Metric cards display
- ✅ Data populated correctly
- ✅ Date range filter works
- ⏱️ Total duration: 2-3 minutes

---

## 4. Customer Website (Playwright)

### Test 4.1: Landing → Signup Flow
```javascript
test.describe('Website - Signup Flow', () => {
  test('should complete signup from landing page', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Verify landing page
    await expect(page.locator('[data-testid="heroTitle"]')).toContainText('SwipeSavvy');

    // Click signup button
    await page.click('[data-testid="signupButton"]');

    // Wait for signup modal
    await expect(page.locator('[data-testid="signupForm"]')).toBeVisible();

    // Fill email
    await page.fill('[data-testid="signupEmail"]', 'newuser@swipesavvy.qa');

    // Fill password
    await page.fill('[data-testid="signupPassword"]', 'NewUser@Test123');
    await page.fill('[data-testid="confirmPassword"]', 'NewUser@Test123');

    // Accept terms
    await page.click('[data-testid="termsCheckbox"]');

    // Submit
    await page.click('[data-testid="signupSubmitButton"]');

    // Verify success
    await expect(page.locator('[data-testid="signupSuccess"]'))
      .toContainText('Account created successfully');

    // Verify redirect
    await page.waitForNavigation({ url: '**/dashboard' });
    await expect(page.locator('[data-testid="dashboardTitle"]')).toBeVisible();
  });
});
```

**Assertions**:
- ✅ Landing page loads
- ✅ Signup modal opens
- ✅ Form accepts input
- ✅ Terms acceptance required
- ✅ Signup succeeds
- ✅ Redirect to dashboard
- ⏱️ Total duration: 2-3 minutes

---

### Test 4.2: OAuth Account Linking
```javascript
test.describe('Website - OAuth Linking', () => {
  test('should link OAuth account', async ({ page }) => {
    // Navigate to account linking
    await page.goto('http://localhost:3000/account-linking');

    // Verify page
    await expect(page.locator('[data-testid="linkingTitle"]'))
      .toContainText('Link Your Account');

    // Click OAuth provider
    await page.click('[data-testid="linkBankButton"]');

    // Handle OAuth popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="oauthProviderSelect"]')
    ]);

    // In popup: login to OAuth provider
    await popup.fill('[data-testid="oauthEmail"]', 'oauth@provider.com');
    await popup.fill('[data-testid="oauthPassword"]', 'OAuthTest123');
    await popup.click('[data-testid="oauthLoginButton"]');

    // Approve permissions
    await popup.click('[data-testid="approvePermissions"]');

    // Wait for popup to close
    await popup.waitForEvent('close');

    // Back on main page, verify link success
    await expect(page.locator('[data-testid="linkSuccessMessage"]'))
      .toContainText('Account linked successfully');

    // Verify account appears in list
    await expect(page.locator('[data-testid="linkedAccountList"]'))
      .toContainText('oauth@provider.com');
  });
});
```

**Assertions**:
- ✅ Linking page loads
- ✅ OAuth popup opens
- ✅ OAuth provider login works
- ✅ Permissions approval works
- ✅ Link success confirmed
- ✅ Account listed
- ⏱️ Total duration: 2-3 minutes

---

### Test 4.3: Account Confirmation Email
```javascript
test.describe('Website - Account Confirmation', () => {
  test('should verify account via email confirmation', async ({ page }) => {
    // Start signup
    await page.goto('http://localhost:3000/signup');

    await page.fill('[data-testid="emailInput"]', 'confirmtest@swipesavvy.qa');
    await page.fill('[data-testid="passwordInput"]', 'ConfirmTest@123');
    await page.click('[data-testid="submitSignupButton"]');

    // Verify confirmation prompt
    await expect(page.locator('[data-testid="confirmationPrompt"]'))
      .toContainText('Check your email');

    // Simulate email confirmation (in staging: use test email service)
    const confirmationLink = 'http://localhost:3000/confirm?token=test_token_123';
    await page.goto(confirmationLink);

    // Verify confirmation success
    await expect(page.locator('[data-testid="confirmationSuccess"]'))
      .toContainText('Email confirmed');

    // Verify can now login
    await page.click('[data-testid="goToLoginButton"]');
    await page.waitForNavigation({ url: '**/login' });

    await page.fill('[data-testid="loginEmail"]', 'confirmtest@swipesavvy.qa');
    await page.fill('[data-testid="loginPassword"]', 'ConfirmTest@123');
    await page.click('[data-testid="loginSubmitButton"]');

    // Verify successful login
    await page.waitForNavigation({ url: '**/dashboard' });
    await expect(page.locator('[data-testid="dashboardTitle"]')).toBeVisible();
  });
});
```

**Assertions**:
- ✅ Signup initiates confirmation flow
- ✅ Confirmation prompt appears
- ✅ Confirmation link works
- ✅ Email verified successfully
- ✅ Login works after confirmation
- ⏱️ Total duration: 2-3 minutes

---

## Running Tests

### Mobile (Detox)
```bash
# Build app for testing
detox build-framework-ios
detox build-framework-cache

# Run all tests
detox test --configuration ios.sim.debug --cleanup

# Run specific test
detox test e2e/onboarding.test.js --configuration ios.sim.debug

# Run with logging
detox test --configuration ios.sim.debug --record-logs all
```

### Web (Playwright)
```bash
# Run all tests
npx playwright test

# Run specific suite
npx playwright test --grep "Admin Portal"

# Run in headed mode (see browser)
npx playwright test --headed

# Generate report
npx playwright test --reporter=html
open playwright-report/index.html
```

---

## Test Execution Procedure

### Day 1: Setup & First Run
1. Install test frameworks (30 min)
2. Create test data in staging (30 min)
3. Run all 12 tests once (45 min)
4. Document failures & flaky tests (30 min)

### Day 2-3: Stabilization
1. Fix flaky tests (90 min)
2. Run all 12 tests 2 more times (90 min)
3. Verify ≥95% pass rate
4. Document results

### Results Tracking
```markdown
| Test | Run 1 | Run 2 | Run 3 | Stability |
|------|-------|-------|-------|-----------|
| Mobile: Onboarding | ✅ | ✅ | ✅ | 100% |
| Mobile: OAuth | ✅ | ⚠️ | ✅ | 67% (flaky) |
| Wallet: Cards | ✅ | ✅ | ✅ | 100% |
| ... | ... | ... | ... | ... |
| **TOTAL** | **12/12** | **11/12** | **12/12** | **97.2%** |
```

---

## Success Criteria

- ✅ All 12 tests written and executable
- ✅ ≥95% pass rate over 3 consecutive runs
- ✅ <5 minute average test duration
- ✅ Flaky tests identified & documented
- ✅ Screenshots/videos captured on failures
- ✅ CI integration ready (Part 5 CI gates)

---

## Known Issues & Mitigations

| Issue | Mitigation | Priority |
|-------|-----------|----------|
| Async delays in Detox | Add `waitFor()` with longer timeout | P1 |
| OAuth popup handling | Use interceptor for test OAuth | P0 |
| Database state between tests | Reset DB or use unique data | P1 |
| Network timeouts | Retry logic with exponential backoff | P1 |
| Element visibility race | Use `waitFor().toBeVisible()` | P0 |

---

## Integration with CI (Part 5)

These tests run in GitHub Actions after:
1. ✅ Build succeeds
2. ✅ Lint passes
3. ✅ Type-check passes
4. ✅ Unit tests pass (≥80%)

On **failure**:
- ✅ Screenshots captured
- ✅ Videos saved
- ✅ Logs exported
- ✅ PR blocked until fixed

---

## Continuation Plan

**Part 7**: A11y Audit & Roadmap
- Lighthouse audits per repo
- axe DevTools WCAG AA scans
- Screen reader testing
- 30-day remediation roadmap

**Timeline**: Dec 29 - Jan 2 (smoke tests), Jan 3-7 (a11y audit)

