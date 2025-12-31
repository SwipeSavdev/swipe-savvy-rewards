# PHASE 5 - TASK 4: User Acceptance Testing (UAT) Procedures

**Status**: 🔄 In Progress
**Date**: December 26, 2025
**Target Completion**: December 28, 2025

---

## Table of Contents

1. [UAT Overview](#uat-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [UAT Test Categories](#uat-test-categories)
4. [Authentication & User Management Tests](#authentication--user-management-tests)
5. [Notification System Tests](#notification-system-tests)
6. [Campaign Management Tests](#campaign-management-tests)
7. [Merchant Network Tests](#merchant-network-tests)
8. [Analytics & Reporting Tests](#analytics--reporting-tests)
9. [AI Concierge Tests](#ai-concierge-tests)
10. [Performance & Load Tests](#performance--load-tests)
11. [Security & Compliance Tests](#security--compliance-tests)
12. [Sign-Off Procedures](#sign-off-procedures)

---

## UAT Overview

### Purpose
Validate that SwipeSavvy mobile application meets all business requirements and user expectations through comprehensive manual testing across all core features.

### Scope
- **Mobile App**: React Native iOS/Android
- **Backend APIs**: FastAPI services
- **Database**: PostgreSQL with all schema
- **AI Services**: Concierge AI, ML optimization
- **Analytics**: Campaign tracking, user behavior

### Success Criteria
- ✅ 100% test case execution
- ✅ 95%+ test cases passing
- ✅ All critical defects resolved
- ✅ Performance metrics met
- ✅ Security validations passed
- ✅ Business stakeholder sign-off

### Test Environment
- **Mobile**: Expo Go + development build
- **Backend**: FastAPI on localhost:8000
- **Database**: PostgreSQL development instance
- **Test Duration**: 3-5 business days
- **Test Team**: 2-3 QA testers

---

## Test Environment Setup

### Prerequisites

#### Mobile Device Setup
```bash
# Install Expo Go
- iOS: Download from App Store
- Android: Download from Google Play

# Connect to development server
expo start
# Scan QR code with Expo Go app
```

#### Backend Setup
```bash
# Start FastAPI server
cd /Users/macbookpro/Documents/swipesavvy-backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Verify health check
curl http://localhost:8000/api/health
# Expected: {"status": "ok"}
```

#### Database Setup
```bash
# Verify PostgreSQL is running
psql -U postgres -d merchants_db -c "SELECT version();"

# Load test data
psql -U postgres -d merchants_db < test_data.sql

# Verify tables
psql -U postgres -d merchants_db -c "\dt"
```

#### Test Accounts

**Admin User**
- Email: `admin@swipesavvy.test`
- Password: `AdminTest123!`
- Role: Administrator
- Permissions: Full access

**Merchant User**
- Email: `merchant@swipesavvy.test`
- Password: `MerchantTest123!`
- Role: Merchant
- Permissions: Campaign management, analytics

**Customer User**
- Email: `customer@swipesavvy.test`
- Password: `CustomerTest123!`
- Role: Customer
- Permissions: View notifications, offers

### Test Environment Checklist

- [ ] Mobile devices connected and updated
- [ ] Expo development server running
- [ ] FastAPI backend running on port 8000
- [ ] PostgreSQL database accessible
- [ ] Test accounts created
- [ ] Network connectivity verified
- [ ] API documentation accessible

---

## UAT Test Categories

### Category Distribution

| Category | Test Cases | Priority | Est. Time |
|----------|-----------|----------|-----------|
| Authentication & User Mgmt | 20 | CRITICAL | 2 hours |
| Notifications | 25 | CRITICAL | 2.5 hours |
| Campaign Management | 30 | HIGH | 3 hours |
| Merchant Network | 20 | HIGH | 2 hours |
| Analytics & Reporting | 20 | MEDIUM | 2 hours |
| AI Concierge | 15 | MEDIUM | 2 hours |
| Performance & Load | 10 | MEDIUM | 1.5 hours |
| Security & Compliance | 15 | CRITICAL | 2 hours |
| **TOTAL** | **155** | - | **17 hours** |

### Test Execution Order

1. **Phase 1** (Day 1): Authentication & User Management
2. **Phase 2** (Day 1-2): Notifications, Campaign Management
3. **Phase 3** (Day 2): Merchant Network, Analytics
4. **Phase 4** (Day 3): AI Concierge, Performance, Security

---

## Authentication & User Management Tests

### A-1: User Registration

**Test Case A-1.1**: Basic Registration
- **Steps**:
  1. Navigate to Sign Up screen
  2. Enter email: `newuser@test.com`
  3. Enter password: `TestPass123!`
  4. Confirm password: `TestPass123!`
  5. Accept terms & conditions
  6. Click "Sign Up"
- **Expected Result**: Account created, welcome email sent, redirected to onboarding
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case A-1.2**: Duplicate Email Handling
- **Steps**:
  1. Attempt registration with existing email `admin@swipesavvy.test`
  2. Submit form
- **Expected Result**: Error message "Email already registered"
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-1.3**: Invalid Email Format
- **Steps**:
  1. Enter email: `invalidemail`
  2. Try to submit
- **Expected Result**: Validation error "Invalid email format"
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-1.4**: Password Requirements
- **Steps**:
  1. Enter password: `short`
  2. Observe validation message
- **Expected Result**: Error "Password must be 8+ characters with uppercase, lowercase, number, special character"
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-1.5**: Password Confirmation Match
- **Steps**:
  1. Enter password: `TestPass123!`
  2. Confirm password: `TestPass124!`
  3. Try to submit
- **Expected Result**: Error "Passwords do not match"
- **Priority**: HIGH
- **Status**: ⏳ Pending

### A-2: User Login

**Test Case A-2.1**: Valid Login
- **Steps**:
  1. Navigate to Login screen
  2. Enter email: `customer@swipesavvy.test`
  3. Enter password: `CustomerTest123!`
  4. Click "Log In"
- **Expected Result**: Login successful, redirected to home dashboard
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case A-2.2**: Invalid Password
- **Steps**:
  1. Enter email: `customer@swipesavvy.test`
  2. Enter incorrect password: `WrongPassword123!`
  3. Click "Log In"
- **Expected Result**: Error "Invalid email or password"
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case A-2.3**: Non-existent Account
- **Steps**:
  1. Enter email: `nonexistent@test.com`
  2. Enter any password
  3. Click "Log In"
- **Expected Result**: Error "User not found"
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case A-2.4**: Session Persistence
- **Steps**:
  1. Log in successfully
  2. Close app completely
  3. Reopen app
- **Expected Result**: User remains logged in, no re-authentication needed
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-2.5**: Remember Me Function
- **Steps**:
  1. Check "Remember Me" before login
  2. Log in successfully
  3. Log out
  4. Return to app
- **Expected Result**: Login credentials pre-filled on return
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### A-3: Password Management

**Test Case A-3.1**: Password Reset Request
- **Steps**:
  1. Click "Forgot Password"
  2. Enter email: `customer@swipesavvy.test`
  3. Click "Send Reset Link"
- **Expected Result**: Confirmation "Check your email for reset instructions"
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-3.2**: Password Reset Completion
- **Steps**:
  1. Click reset link from email
  2. Enter new password: `NewPass123!`
  3. Confirm password: `NewPass123!`
  4. Click "Reset Password"
- **Expected Result**: Password updated, redirected to login
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-3.3**: Expired Reset Link
- **Steps**:
  1. Request password reset
  2. Wait 24+ hours
  3. Attempt to use reset link
- **Expected Result**: Error "Reset link has expired"
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case A-3.4**: Change Password (Authenticated)
- **Steps**:
  1. Log in as `customer@swipesavvy.test`
  2. Navigate to Settings > Security
  3. Enter current password: `CustomerTest123!`
  4. Enter new password: `UpdatedPass123!`
  5. Confirm: `UpdatedPass123!`
  6. Click "Update Password"
- **Expected Result**: Password changed, confirmation message shown
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-3.5**: Weak Password Rejection
- **Steps**:
  1. Attempt to set password: `123456`
  2. Click "Update"
- **Expected Result**: Error "Password must meet complexity requirements"
- **Priority**: HIGH
- **Status**: ⏳ Pending

### A-4: Two-Factor Authentication

**Test Case A-4.1**: Enable 2FA
- **Steps**:
  1. Log in as authenticated user
  2. Navigate to Settings > Security > 2FA
  3. Click "Enable Two-Factor Authentication"
  4. Scan QR code with authenticator app
  5. Enter verification code
  6. Save recovery codes
  7. Click "Enable"
- **Expected Result**: 2FA enabled, success message shown, recovery codes displayed
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-4.2**: Login with 2FA
- **Steps**:
  1. Log in with email and password
  2. Enter 6-digit code from authenticator app
  3. Click "Verify"
- **Expected Result**: Login successful
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-4.3**: Invalid 2FA Code
- **Steps**:
  1. Log in, enter wrong 6-digit code
  2. Click "Verify"
- **Expected Result**: Error "Invalid code, try again"
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case A-4.4**: Recovery Code Usage
- **Steps**:
  1. Log in (2FA enabled)
  2. Lost authenticator app
  3. Click "Use Recovery Code"
  4. Enter one of saved recovery codes
  5. Click "Verify"
- **Expected Result**: Login successful, recovery code marked as used
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### A-5: User Profile Management

**Test Case A-5.1**: View Profile
- **Steps**:
  1. Log in as authenticated user
  2. Navigate to Profile
- **Expected Result**: Profile info displayed (name, email, phone, avatar)
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case A-5.2**: Update Profile Information
- **Steps**:
  1. Navigate to Profile > Edit
  2. Update name to "Updated Name"
  3. Update phone to "+1 (555) 123-4567"
  4. Click "Save Changes"
- **Expected Result**: Profile updated, confirmation message shown
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case A-5.3**: Upload Profile Picture
- **Steps**:
  1. Navigate to Profile > Edit
  2. Click on avatar
  3. Select image from device
  4. Crop image (if needed)
  5. Click "Save"
- **Expected Result**: Avatar updated immediately
- **Priority**: LOW
- **Status**: ⏳ Pending

**Test Case A-5.4**: Invalid Profile Data
- **Steps**:
  1. Navigate to Profile > Edit
  2. Enter invalid phone: `abc123`
  3. Click "Save Changes"
- **Expected Result**: Error "Invalid phone number format"
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### A-6: Role-Based Access Control

**Test Case A-6.1**: Admin Access
- **Steps**:
  1. Log in as `admin@swipesavvy.test`
  2. Check visible features
- **Expected Result**: All admin features available (user management, reports, settings)
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case A-6.2**: Merchant Access
- **Steps**:
  1. Log in as `merchant@swipesavvy.test`
  2. Check visible features
- **Expected Result**: Merchant features available (campaigns, analytics, merchants)
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case A-6.3**: Customer Access
- **Steps**:
  1. Log in as `customer@swipesavvy.test`
  2. Check visible features
- **Expected Result**: Customer features available (notifications, profile, settings)
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case A-6.4**: Access Control Enforcement
- **Steps**:
  1. Log in as customer
  2. Attempt to access admin panel via URL
- **Expected Result**: Access denied, redirected to dashboard
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

---

## Notification System Tests

### N-1: Notification Delivery

**Test Case N-1.1**: Push Notification Reception
- **Steps**:
  1. Log in as customer on mobile
  2. Admin sends test notification
  3. Observe notification arrival
- **Expected Result**: Notification appears in foreground or system tray within 2 seconds
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case N-1.2**: Background Notification Handling
- **Steps**:
  1. Log in as customer
  2. Send app to background
  3. Admin sends notification
  4. Check system tray
- **Expected Result**: Notification appears in system tray, app badge incremented
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case N-1.3**: Notification Content Display
- **Steps**:
  1. Receive notification with:
     - Title: "Exclusive Offer"
     - Body: "20% off selected items"
     - Image URL: valid image
  2. Tap notification
- **Expected Result**: Content displays correctly with proper formatting and image
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case N-1.4**: Multiple Simultaneous Notifications
- **Steps**:
  1. Send 5 notifications in quick succession
  2. Observe notification center
- **Expected Result**: All 5 notifications appear, chronological order maintained
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case N-1.5**: Notification Persistence
- **Steps**:
  1. Receive 3 notifications
  2. Close app completely
  3. Reopen app
- **Expected Result**: All notifications still visible in notification center
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### N-2: Notification Actions

**Test Case N-2.1**: Notification Tap Action
- **Steps**:
  1. Receive notification
  2. Tap on notification
- **Expected Result**: App opens, navigation to relevant content (campaign/offer)
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case N-2.2**: Custom Action Buttons
- **Steps**:
  1. Receive notification with buttons: "Accept", "Decline"
  2. Tap "Accept"
- **Expected Result**: Action recorded in backend, user redirected appropriately
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case N-2.3**: Deep Linking
- **Steps**:
  1. Receive notification linking to specific offer
  2. Tap notification
- **Expected Result**: App opens directly to that offer's details page
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case N-2.4**: Notification Dismissal
- **Steps**:
  1. Receive 2 notifications
  2. Swipe to dismiss first notification
- **Expected Result**: First notification removed, second remains
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case N-2.5**: Clear All Notifications
- **Steps**:
  1. Receive multiple notifications
  2. Click "Clear All" in notification center
- **Expected Result**: All notifications cleared
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### N-3: Notification Settings

**Test Case N-3.1**: Enable/Disable Notifications
- **Steps**:
  1. Navigate to Settings > Notifications
  2. Toggle "Push Notifications" off
  3. Send test notification
- **Expected Result**: No notification received while disabled
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case N-3.2**: Notification Category Preferences
- **Steps**:
  1. Navigate to Settings > Notifications
  2. Disable "Promotional Offers"
  3. Send promotional notification
- **Expected Result**: Promotional notification not received; transactional notification still received
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case N-3.3**: Quiet Hours Configuration
- **Steps**:
  1. Navigate to Settings > Notifications > Quiet Hours
  2. Set quiet hours: 10 PM - 8 AM
  3. Send notification during quiet hours
- **Expected Result**: Notification silenced (no sound/vibration), visible in notification center
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case N-3.4**: Notification Sound/Vibration
- **Steps**:
  1. Navigate to Settings > Notifications
  2. Set sound to custom notification tone
  3. Set vibration to "strong"
  4. Receive notification
- **Expected Result**: Custom sound plays, strong vibration felt
- **Priority**: LOW
- **Status**: ⏳ Pending

### N-4: Notification Analytics

**Test Case N-4.1**: Notification Delivery Tracking
- **Steps**:
  1. Admin sends notification to 100 users
  2. Navigate to Analytics > Notifications
- **Expected Result**: "Delivered: 100" shown, delivery timestamp logged
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case N-4.2**: Click-Through Rate Tracking
- **Steps**:
  1. Send notification to 50 users
  2. 30 users click notification
  3. Check analytics
- **Expected Result**: CTR calculated as 60% (30/50)
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case N-4.3**: Conversion Tracking
- **Steps**:
  1. Send notification with special offer code
  2. 15 users redeem offer
  3. Check analytics
- **Expected Result**: "Conversions: 15" displayed, conversion rate calculated
- **Priority**: HIGH
- **Status**: ⏳ Pending

---

## Campaign Management Tests

### C-1: Campaign Creation

**Test Case C-1.1**: Create Basic Campaign
- **Steps**:
  1. Log in as merchant
  2. Navigate to Campaigns > Create
  3. Fill fields:
     - Name: "Holiday Sale 2025"
     - Description: "25% off winter collection"
     - Start Date: Today
     - End Date: 30 days from now
     - Budget: $1,000
  4. Click "Create Campaign"
- **Expected Result**: Campaign created successfully, ID displayed
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case C-1.2**: Campaign with Targeting
- **Steps**:
  1. Create campaign
  2. Set targeting:
     - Age: 18-45
     - Location: California
     - Purchase history: Apparel
  3. Save campaign
- **Expected Result**: Campaign created with 234 users matching criteria
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case C-1.3**: Campaign with Schedule
- **Steps**:
  1. Create campaign
  2. Set schedule: Send at 6 PM daily for 7 days
  3. Save campaign
- **Expected Result**: Campaign scheduled, notifications queued
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case C-1.4**: Campaign Validation
- **Steps**:
  1. Attempt to create campaign with:
     - Empty name
     - End date before start date
     - Negative budget
  2. Try to save
- **Expected Result**: Validation errors shown, campaign not saved
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case C-1.5**: Campaign with Creative Assets
- **Steps**:
  1. Create campaign
  2. Upload banner image (1024x512)
  3. Set campaign message
  4. Add call-to-action button
  5. Save
- **Expected Result**: Assets stored, preview displays correctly
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### C-2: Campaign Management

**Test Case C-2.1**: View Campaign List
- **Steps**:
  1. Log in as merchant
  2. Navigate to Campaigns
- **Expected Result**: All campaigns listed with status, reach, and engagement metrics
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case C-2.2**: Edit Campaign
- **Steps**:
  1. Open campaign "Holiday Sale 2025"
  2. Change end date to 45 days
  3. Change budget to $1,500
  4. Click "Save Changes"
- **Expected Result**: Campaign updated, changes reflected in list
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case C-2.3**: Pause Campaign
- **Steps**:
  1. Open active campaign
  2. Click "Pause Campaign"
  3. Confirm pause
- **Expected Result**: Campaign paused, no further notifications sent
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case C-2.4**: Resume Campaign
- **Steps**:
  1. Open paused campaign
  2. Click "Resume Campaign"
- **Expected Result**: Campaign resumed, remaining notifications queued
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case C-2.5**: Duplicate Campaign
- **Steps**:
  1. Open campaign
  2. Click "Duplicate"
  3. Modify name to "Holiday Sale 2025 - Repeat"
  4. Save
- **Expected Result**: New campaign created with same settings
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### C-3: Campaign Analytics

**Test Case C-3.1**: View Campaign Metrics
- **Steps**:
  1. Open campaign with 1000 delivered notifications
  2. Click "Analytics"
- **Expected Result**: Display shows:
     - Delivered: 1000
     - Opened: 450 (45% CTR)
     - Clicked: 180 (18% CTA)
     - Converted: 85 (8.5% conversion)
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case C-3.2**: View Campaign Timeline
- **Steps**:
  1. Open campaign analytics
  2. View timeline for "Last 7 Days"
- **Expected Result**: Line graph showing daily performance trend
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case C-3.3**: Campaign ROI Calculation
- **Steps**:
  1. Open campaign with:
     - Budget: $1000
     - Revenue Generated: $4500
  2. Check ROI metric
- **Expected Result**: ROI displayed as 350% (or 4.5x)
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case C-3.4**: Campaign Segment Performance
- **Steps**:
  1. Open campaign analytics
  2. View "Performance by Segment"
- **Expected Result**: Table showing engagement metrics for each audience segment
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

---

## Merchant Network Tests

### M-1: Merchant Registration

**Test Case M-1.1**: Add New Merchant
- **Steps**:
  1. Log in as admin or network manager
  2. Navigate to Merchants > Add Merchant
  3. Enter:
     - Business Name: "Coffee & Co."
     - Category: Food & Beverage
     - Location: "123 Main St, San Francisco, CA"
     - Contact Email: merchant@coffeeandco.test
  4. Click "Add Merchant"
- **Expected Result**: Merchant created, unique ID assigned
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case M-1.2**: Merchant Category Selection
- **Steps**:
  1. Add merchant with category: "Retail"
  2. Check available sub-categories
- **Expected Result**: Sub-categories displayed (Apparel, Electronics, Home, etc.)
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case M-1.3**: Merchant Validation
- **Steps**:
  1. Attempt to add merchant with:
     - Empty business name
     - Invalid email format
     - No location
- **Expected Result**: Validation errors shown, merchant not created
- **Priority**: HIGH
- **Status**: ⏳ Pending

### M-2: Merchant Collaboration

**Test Case M-2.1**: Create Merchant Network
- **Steps**:
  1. Log in as merchant
  2. Navigate to Network > Create Network
  3. Enter network details:
     - Name: "Bay Area Retailers Alliance"
     - Partner merchants: Select 5 merchants
  4. Save
- **Expected Result**: Network created, members assigned
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case M-2.2**: Cross-Merchant Campaign
- **Steps**:
  1. Create campaign within network
  2. All 5 partner merchants can send notifications
  3. Customers see unified campaign
- **Expected Result**: Campaign reaches customers across all merchants
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case M-2.3**: Merchant Affinity Tracking
- **Steps**:
  1. User visits Merchant A
  2. System tracks affinity score
  3. Check merchant network recommendations
- **Expected Result**: Similar merchants recommended based on affinity
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

---

## Analytics & Reporting Tests

### R-1: User Behavior Analytics

**Test Case R-1.1**: Track User Activity
- **Steps**:
  1. User performs sequence:
     - Opens app
     - Views 3 offers
     - Clicks promotional notification
     - Makes purchase
  2. Navigate to Analytics > User Activity
- **Expected Result**: User journey displayed chronologically
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case R-1.2**: Segment Analysis
- **Steps**:
  1. Navigate to Analytics > Segments
  2. View "High-Value Customers" segment
- **Expected Result**: Segment shows 287 users, average LTV $450, engagement 85%
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case R-1.3**: Cohort Analysis
- **Steps**:
  1. Create cohort: "Users who signed up in December 2025"
  2. Track retention over 4 weeks
- **Expected Result**: Week 1: 100%, Week 2: 85%, Week 3: 72%, Week 4: 61%
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### R-2: Campaign Reporting

**Test Case R-2.1**: Generate Campaign Report
- **Steps**:
  1. Navigate to Reports > Campaigns
  2. Select date range: Last 30 days
  3. Click "Generate Report"
- **Expected Result**: PDF report generated showing all KPIs
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case R-2.2**: Export Campaign Data
- **Steps**:
  1. Open campaign analytics
  2. Click "Export as CSV"
- **Expected Result**: CSV file downloaded with campaign data
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case R-2.3**: Scheduled Report Delivery
- **Steps**:
  1. Navigate to Reports > Scheduled
  2. Create weekly campaign report email
  3. Set delivery: Every Monday at 9 AM
- **Expected Result**: Report sent automatically each Monday
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

---

## AI Concierge Tests

### AI-1: AI Recommendation Engine

**Test Case AI-1.1**: Personalized Recommendations
- **Steps**:
  1. Log in as customer with purchase history:
     - Electronics: 5 purchases
     - Apparel: 2 purchases
     - Books: 1 purchase
  2. Navigate to "Recommended for You"
- **Expected Result**: Electronics offers ranked #1 based on purchase history
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case AI-1.2**: Real-Time Offer Optimization
- **Steps**:
  1. User views product
  2. AI analyzes user profile, time, location
  3. Optimal discount offer presented
- **Expected Result**: User most likely to accept offer shown (e.g., 20% discount)
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case AI-1.3**: Next Best Action
- **Steps**:
  1. After user makes purchase
  2. AI recommends next action
- **Expected Result**: Relevant product suggestion or loyalty reward offered
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### AI-2: AI Conversational Features

**Test Case AI-2.1**: Ask AI Assistant
- **Steps**:
  1. Open AI Concierge
  2. Ask: "What offers are available for me?"
  3. Wait for response
- **Expected Result**: AI provides 3-5 personalized offer recommendations
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case AI-2.2**: Offer Negotiation
- **Steps**:
  1. Ask AI: "Can you get me a better deal on this product?"
  2. Observe AI response
- **Expected Result**: AI negotiates better offer or explains why not possible
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

**Test Case AI-2.3**: AI Learns from Feedback
- **Steps**:
  1. AI recommends offer
  2. User indicates "Not Interested"
  3. Check future recommendations
- **Expected Result**: Similar offers not recommended, AI learns user preference
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

---

## Performance & Load Tests

### P-1: Response Time

**Test Case P-1.1**: Login Response Time
- **Steps**:
  1. Measure login time from form submit to dashboard loaded
- **Expected Result**: < 2 seconds
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case P-1.2**: Campaign List Load Time
- **Steps**:
  1. Load campaigns page with 100+ campaigns
  2. Measure page load time
- **Expected Result**: < 3 seconds
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case P-1.3**: Analytics Dashboard Load
- **Steps**:
  1. Load analytics with 12 charts and 1000+ data points
- **Expected Result**: < 5 seconds
- **Priority**: MEDIUM
- **Status**: ⏳ Pending

### P-2: Load Testing

**Test Case P-2.1**: Concurrent Users (100)
- **Steps**:
  1. Simulate 100 concurrent users logging in
  2. Monitor system performance
- **Expected Result**: No errors, <3 second response time
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case P-2.2**: Concurrent Campaigns (1000 active)
- **Steps**:
  1. System processing 1000 active campaigns
  2. Send 500K notifications simultaneously
- **Expected Result**: All notifications delivered within 5 minutes
- **Priority**: HIGH
- **Status**: ⏳ Pending

---

## Security & Compliance Tests

### S-1: Data Security

**Test Case S-1.1**: Password Encryption
- **Steps**:
  1. Check database for password hashes
  2. Verify bcrypt or equivalent used
- **Expected Result**: Passwords hashed with salt
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case S-1.2**: API Authentication
- **Steps**:
  1. Attempt to access API without token
  2. Make valid API call with token
- **Expected Result**: Without token: 401 error; With token: Successful response
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case S-1.3**: Data Encryption in Transit
- **Steps**:
  1. Monitor network traffic
  2. Verify HTTPS used for all requests
- **Expected Result**: All requests use TLS 1.2+, no plaintext data
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

### S-2: Access Control

**Test Case S-2.1**: Session Timeout
- **Steps**:
  1. Log in
  2. Leave app idle for 15 minutes
  3. Attempt to take action
- **Expected Result**: Session expired, re-authentication required
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case S-2.2**: CORS Headers
- **Steps**:
  1. Check API CORS configuration
- **Expected Result**: Only authorized origins allowed
- **Priority**: HIGH
- **Status**: ⏳ Pending

**Test Case S-2.3**: SQL Injection Prevention
- **Steps**:
  1. Attempt to inject SQL in search field: `'; DROP TABLE users; --`
- **Expected Result**: Query parameterized, injection prevented
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

### S-3: Compliance

**Test Case S-3.1**: GDPR Right to Erasure
- **Steps**:
  1. User requests account deletion
  2. Check GDPR compliance
- **Expected Result**: All personal data deleted, backup retention logged
- **Priority**: CRITICAL
- **Status**: ⏳ Pending

**Test Case S-3.2**: Data Privacy Policy
- **Steps**:
  1. Access privacy policy from app
  2. Verify current and accurate
- **Expected Result**: Policy accessible, describes all data usage
- **Priority**: HIGH
- **Status**: ⏳ Pending

---

## Sign-Off Procedures

### UAT Sign-Off Form

**Test Result Summary**
```
┌─────────────────────────────────────────────────────┐
│ UAT SIGN-OFF FORM                                   │
├─────────────────────────────────────────────────────┤
│ Project: SwipeSavvy Mobile App - Phase 5            │
│ Date: _______________                              │
│ UAT Lead: _______________                          │
│                                                     │
│ OVERALL TEST RESULTS                                │
├─────────────────────────────────────────────────────┤
│ Total Test Cases: 155                               │
│ Executed: _____ / 155                               │
│ Passed: _____ / 155                                 │
│ Failed: _____ / 155                                 │
│ Blocked: _____ / 155                                │
│ Pass Rate: _____%                                   │
│                                                     │
│ CATEGORY RESULTS                                    │
├─────────────────────────────────────────────────────┤
│ Authentication & User Mgmt: ____ / 20               │
│ Notifications:              ____ / 25               │
│ Campaign Management:        ____ / 30               │
│ Merchant Network:           ____ / 20               │
│ Analytics & Reporting:      ____ / 20               │
│ AI Concierge:              ____ / 15                │
│ Performance & Load:        ____ / 10                │
│ Security & Compliance:     ____ / 15                │
│                                                     │
│ CRITICAL ISSUES                                     │
├─────────────────────────────────────────────────────┤
│ Count: _____                                        │
│ Issues: _______________                             │
│ ___________________________                          │
│ ___________________________                          │
│                                                     │
│ HIGH PRIORITY ISSUES                                │
├─────────────────────────────────────────────────────┤
│ Count: _____                                        │
│ Issues: _______________                             │
│ ___________________________                          │
│                                                     │
│ SIGN-OFF AUTHORIZATION                              │
├─────────────────────────────────────────────────────┤
│ QA Lead:                                            │
│ Signature: _________________ Date: _______          │
│                                                     │
│ Project Manager:                                    │
│ Signature: _________________ Date: _______          │
│                                                     │
│ Business Stakeholder:                               │
│ Signature: _________________ Date: _______          │
│                                                     │
│ DECISION                                            │
├─────────────────────────────────────────────────────┤
│ [ ] APPROVED FOR PRODUCTION                         │
│ [ ] APPROVED WITH CONDITIONS                        │
│ [ ] REJECTED - FURTHER TESTING REQUIRED             │
│                                                     │
│ Comments:                                           │
│ ___________________________________                 │
│ ___________________________________                 │
│ ___________________________________                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Defect Log Template

```
DEFECT #001
┌─────────────────────────────────────┐
│ Test Case: A-1.1 Basic Registration │
│ Status: FAILED                      │
│ Priority: HIGH                      │
│ Severity: MAJOR                     │
├─────────────────────────────────────┤
│ Description:                        │
│ Registration fails with validation  │
│ error on valid email format         │
│                                     │
│ Steps to Reproduce:                 │
│ 1. Navigate to Sign Up              │
│ 2. Enter: test@example.com          │
│ 3. Click Sign Up                    │
│                                     │
│ Expected: Success                   │
│ Actual: Error "Invalid email"       │
│                                     │
│ Root Cause: Email regex too strict  │
│ Fix: Update regex pattern           │
│                                     │
│ Assignee: Dev Lead                  │
│ Due Date: _______________           │
│ Status: [ ] Fixed [ ] Testing       │
└─────────────────────────────────────┘
```

### Approval Criteria

**For Production Approval**:
- ✅ Pass Rate ≥ 95% (at least 147/155 tests passing)
- ✅ Zero CRITICAL defects in production
- ✅ All HIGH priority issues resolved or approved
- ✅ Performance benchmarks met
- ✅ Security validations passed
- ✅ All stakeholders signed off

**Conditional Approval** (if approved):
- ✅ Pass Rate ≥ 90% (at least 140/155 tests)
- ✅ CRITICAL issues have documented workarounds
- ✅ Fixed in patch release within 1 week
- ✅ Customer notification plan in place

**Rejection Criteria**:
- ❌ Pass Rate < 90%
- ❌ Unresolved CRITICAL defects
- ❌ Unresolved security vulnerabilities
- ❌ Performance below thresholds

---

## Testing Best Practices

### Test Execution Guidelines

1. **Test in Isolation**
   - Clear app cache between test categories
   - Reset database to clean state before critical tests
   - Use separate test accounts for each test case

2. **Document Findings**
   - Screenshot failures immediately
   - Record video of complex interactions
   - Note exact error messages
   - Document environmental details (device, OS version)

3. **Regression Testing**
   - Re-test all FAILED cases after fixes
   - Run smoke tests before next category
   - Verify no side effects from bug fixes

4. **User Experience Validation**
   - Test with actual user workflows
   - Verify navigation is intuitive
   - Check for confusing error messages
   - Validate visual design consistency

### Device Testing Matrix

| Device | OS Version | Status |
|--------|-----------|--------|
| iPhone 13 | iOS 17.2 | ⏳ To Test |
| iPhone 15 | iOS 17.2 | ⏳ To Test |
| Pixel 6 | Android 14 | ⏳ To Test |
| Pixel 8 | Android 15 | ⏳ To Test |
| iPad Air | iOS 17.2 | ⏳ To Test |

---

## Timeline & Resource Allocation

### UAT Schedule

**Phase 1: Day 1 (8 hours)**
- Authentication & User Management (20 tests)
- Notification System - Basic (15 tests)
- **Total**: 35 tests

**Phase 2: Day 1-2 (12 hours)**
- Notifications - Advanced (10 tests)
- Campaign Management (30 tests)
- **Total**: 40 tests

**Phase 3: Day 2-3 (10 hours)**
- Merchant Network (20 tests)
- Analytics & Reporting (20 tests)
- **Total**: 40 tests

**Phase 4: Day 3-4 (7 hours)**
- AI Concierge (15 tests)
- Performance & Load (10 tests)
- Security & Compliance (15 tests)
- **Total**: 40 tests

### Team Allocation

**QA Lead** (40 hours)
- Coordinate testing schedule
- Maintain defect log
- Perform critical test cases
- Review and approve sign-off

**QA Tester 1** (30 hours)
- Execute assigned test cases
- Document results
- Capture screenshots/videos
- Report defects

**QA Tester 2** (30 hours)
- Execute assigned test cases
- Regression testing
- Performance testing
- Sign-off documentation

---

## Tools & Resources

### Testing Tools
- **Mobile**: Expo Go, Xcode/Android Studio
- **API**: Postman or curl
- **Performance**: Lighthouse, Web Vitals
- **Monitoring**: Datadog, CloudWatch
- **Defect Tracking**: JIRA
- **Documentation**: Confluence

### Test Data
- Test accounts (5 user types)
- Sample campaigns (10 pre-created)
- Test merchants (15 registered)
- Mock notifications ready

---

## Conclusion

This UAT Procedures document provides a comprehensive framework for validating SwipeSavvy mobile application before production deployment. The 155 test cases cover all critical functionality, ensuring quality and reliability.

**Next Steps**:
1. Review and approve UAT plan with stakeholders
2. Prepare test environment per Setup section
3. Distribute test cases to team members
4. Begin Phase 1 testing on Day 1
5. Document all findings in defect log
6. Complete sign-off by Day 4

---

**Document Version**: 1.0
**Last Updated**: December 26, 2025
**Status**: Ready for UAT Execution
