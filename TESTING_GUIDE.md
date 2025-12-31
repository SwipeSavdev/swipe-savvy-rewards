# Testing Guide - Mobile App Endpoints & Screens

## Quick Start

### Prerequisites
- Backend API running on `http://localhost:8002/api`
- React Native development environment set up
- All endpoints registered in backend

### How to Run the App

```bash
# Start the development server
npm start
# or
expo start

# Run on iOS simulator
expo run:ios

# Run on Android simulator
expo run:android

# Run on web (for quick testing)
expo start --web
```

## Testing Endpoints & Screens

### 1. Home Screen - Transactions
**Screen Path**: `/Home`

**Endpoints Called**:
- `GET /api/transactions?limit=10`

**What to Test**:
1. Open the app, you're on HomeScreen by default
2. You should see recent transactions in a list
3. If network fails, mock data displays
4. Tap the "Cards" button to navigate to CardsScreen

**Expected Data**:
- Transaction list with title, amount, date, and icon
- Mock fallback: Amazon ($45.99), Top-up (+$200), Donation

---

### 2. Accounts Screen - Banks & Cards
**Screen Path**: `/Tab/Accounts`

**Endpoints Called**:
- `GET /api/banks/linked`
- `GET /api/cards` (when navigating to CardsScreen)

**What to Test**:
1. Tap the "Accounts" tab
2. See checking and savings account cards
3. Tap either account card → navigates to AccountBalanceDetailScreen
4. Tap "Manage" button in cards section → CardsScreen
5. Tap "+ Add a card" button → CardsScreen with modal open

**Expected Data**:
- Checking: $4,250.25
- Savings: $4,500.25
- Chase Bank (•••• 1920) - Connected
- Wells Fargo (•••• 4481) - Needs relink

---

### 3. Cards Screen (NEW)
**Screen Path**: `/Cards`

**Endpoints Called**:
- `GET /api/cards`
- `POST /api/cards` (when adding)

**How to Navigate**:
1. HomeScreen → Tap "Cards" button
2. AccountsScreen → Tap "Manage" or "+ Add a card"

**What to Test**:
1. **View Cards**: See list of saved cards (if any)
2. **Empty State**: If no cards, see "No cards added yet" with button
3. **Add Card Modal**:
   - Tap the "+" button in header
   - Enter card number (test: 4532015112830366)
   - Enter cardholder name (test: John Doe)
   - Enter expiry (test: 12/25)
   - Enter CVV (test: 123)
   - Tap "Add Card"
   - Success alert appears
   - List refreshes with new card

**Form Validation**:
- All fields required
- Card number: numeric only, max 16 chars
- Expiry: MM/YY format, max 5 chars
- CVV: numeric only, max 4 chars

---

### 4. Account Balance Detail (NEW)
**Screen Path**: `/AccountDetail`

**Endpoints Called**:
- `GET /api/accounts/{accountId}/balance`
- `GET /api/transactions?limit=20`

**How to Navigate**:
1. AccountsScreen → Tap on checking or savings account card

**What to Test**:
1. **Header**: Shows account name, type, current balance
2. **Color Coding**: 
   - Checking: Blue
   - Savings: Green
   - Credit: Orange
3. **Action Buttons**: "Send" and "Request" buttons (functional placeholders)
4. **Transaction List**: Shows recent transactions with:
   - Icon, title, date, amount, status
   - Negative amounts in red (payments/transfers)
   - Positive amounts in green (deposits/rewards)

**Back Navigation**: Tap back arrow to return to Accounts

---

### 5. Transfers Screen
**Screen Path**: `/Tab/Transfers`

**Endpoints Called**:
- `GET /api/transfers/recipients`
- `POST /api/transfers`

**What to Test**:
1. Tap "Transfers" tab
2. See recent recipients
3. Toggle between Send/Request
4. Enter recipient name (auto-complete)
5. Enter amount (pre-filled $50)
6. Select funding source (Checking/Savings)
7. Enter optional memo
8. Tap "Send" or "Request"
9. Confirmation alert appears

**Test Data**:
- Recipients: Jordan, Emma, Bank (ACH)
- Funding: Checking, Savings
- Amount validation

---

### 6. AI Concierge - Rewards Screen
**Screen Path**: `/Tab/AIConcierge`

**Endpoints Called**:
- `GET /api/rewards/points`
- `GET /api/rewards/boosts`

**What to Test**:
1. Tap "AI Assistant" tab (bottom tab bar)
2. See points card with available points
3. See boosts list (2× fuel, cafés, etc.)
4. Tap "Donate" button → RewardsDonateScreen
5. Tap "View Community" button → LeaderboardScreen

**Expected Data**:
- Available Points: 12,450
- Tier: Silver (68% progress)
- Boosts: 2× points on Fuel (active), Local cafés (inactive)

---

### 7. Donate Points Screen (NEW)
**Screen Path**: `/RewardsDonate`

**Endpoints Called**:
- `GET /api/rewards/points` (load current points)
- `POST /api/rewards/donate`

**How to Navigate**:
1. RewardsScreen → Tap "Donate" button
2. Click the "Donate Points" button in header

**What to Test**:
1. **Cause Selection**: 
   - Tap on a cause card (Food Relief, Education, Environment, Healthcare)
   - Selected cause highlights with blue border and checkmark
2. **Amount Selection**:
   - Tap quick buttons (100, 250, 500, 1000)
   - OR enter custom amount
3. **Donation**:
   - Tap "Donate Points"
   - Alert shows confirmation with cause name
   - Points balance updates
   - Returns to previous screen

**Validation**:
- Must select a cause
- Amount must be > 0
- Amount must be ≤ available points
- Success shows points were donated

**Test Case**: 
- Available: 12,450 points
- Select: Food Relief
- Amount: 500 points
- Expected: "You've donated 500 points to Food Relief"

---

### 8. Leaderboard Screen (NEW)
**Screen Path**: `/Leaderboard`

**Endpoints Called**:
- `GET /api/rewards/leaderboard`

**How to Navigate**:
1. RewardsScreen → Tap "View Community" button
2. RewardsDonateScreen → Navigate back then to Leaderboard

**What to Test**:
1. **Rankings**: See users ranked 1-8 with medals (🥇🥈🥉) or # numbers
2. **Tier Badges**: See color-coded tiers (Platinum, Gold, Silver, Bronze)
3. **Filter**:
   - Tap "Weekly" / "Monthly" / "All Time"
   - Data updates (or uses same mock data)
4. **Stats**: Shows points and donations for each user

**Sample Data**:
```
🥇 Alex Chen - 15.4K points, 5.0K donated (Platinum)
🥈 Jordan Smith - 12.9K points, 3.5K donated (Gold)
🥉 Emma Davis - 11.2K points, 2.8K donated (Gold)
#4 Michael Brown - 9.9K points, 2.0K donated (Silver)
```

---

### 9. Profile Screen
**Screen Path**: `/Profile`

**Endpoints Called**:
- `GET /api/user/preferences`
- `PUT /api/user/preferences`

**How to Navigate**:
1. Tap profile icon (top right on HomeScreen or in navigation)
2. Or swipe from sidebar/navigation

**What to Test**:
1. **Load Preferences**: See current dark mode and notification settings
2. **Toggle Dark Mode**: 
   - Switch toggle
   - Tap confirm
   - Alert shows "Saved"
   - UI updates (or shows dark mode)
3. **Toggle Notifications**:
   - Switch toggle
   - Changes saved to backend
4. **User Info**: Shows logged-in user details

**Expected Settings**:
- Dark Mode: OFF (by default)
- Notifications: ON (by default)

---

## Error Scenarios to Test

### Network Errors
1. Disconnect from WiFi/internet
2. Screens should display mock data (graceful fallback)
3. Error alerts should show

### Validation Errors
1. **Cards Screen**: 
   - Leave field blank → Alert "Fill in all fields"
   - Enter invalid card number → Handled in field
2. **Donate Screen**:
   - Don't select cause → Alert "Select a cause"
   - Enter 0 amount → Alert "Must be > 0"
   - Enter amount > available → Alert "Only have X points"

### API Errors
1. Backend returns error (500, 400, etc.)
2. App should show error alert
3. Fallback to mock data where applicable

---

## Performance Testing

### Loading States
- [ ] Spinners show while loading
- [ ] After data loads, UI updates smoothly
- [ ] No frozen UI during API calls

### Navigation
- [ ] Screens transition smoothly
- [ ] Back button works on all screens
- [ ] No duplicate navigation

### Data Updates
- [ ] Pull to refresh works (AccountBalanceDetailScreen)
- [ ] Manual refresh works
- [ ] Data persists when returning to screen

---

## Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start
```

### Screens Not Loading
- Check MainStack.tsx imports
- Verify screen components export correctly
- Check for TypeScript errors: `npm run type-check`

### API Calls Not Working
- Verify backend is running on port 8002
- Check network connection
- Check browser DevTools network tab
- Check DataService.ts for correct endpoints

### Mock Data Not Showing
- Delete app and reinstall
- Clear app cache
- Check network connectivity (errors trigger mock data)

---

## Test Results Template

```
Date: ____
Tester: ____

HomeScreen:
- [ ] Transactions load
- [ ] "Cards" button works

AccountsScreen:
- [ ] Accounts display
- [ ] Linked banks load
- [ ] Navigate to AccountDetail
- [ ] Navigate to CardsScreen

CardsScreen:
- [ ] Cards list displays
- [ ] Add card modal opens
- [ ] Form validation works
- [ ] Card adds successfully

AccountDetailScreen:
- [ ] Balance displays
- [ ] Transactions load
- [ ] Back button works

TransfersScreen:
- [ ] Recipients load
- [ ] Send/Request toggle works
- [ ] Transfer submits

RewardsScreen:
- [ ] Points load
- [ ] Boosts load
- [ ] Donate button works
- [ ] Community button works

RewardsDonateScreen:
- [ ] Causes display
- [ ] Amount selection works
- [ ] Donation completes

LeaderboardScreen:
- [ ] Leaderboard loads
- [ ] Filter works
- [ ] Rankings display

ProfileScreen:
- [ ] Preferences load
- [ ] Dark mode toggle works
- [ ] Notifications toggle works
```

---

## Contact & Support

For issues or questions, check:
1. `ENDPOINTS_AND_SCREENS_SUMMARY.md` - Full implementation details
2. `src/services/DataService.ts` - API methods
3. `src/app/navigation/MainStack.tsx` - Navigation setup
4. Individual screen files for implementation details
