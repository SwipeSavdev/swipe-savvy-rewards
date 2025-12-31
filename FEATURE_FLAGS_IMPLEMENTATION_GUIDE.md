# SwipeSavvy Mobile App - Feature Flags Setup Guide

## Overview

Feature flags have been implemented to manage all core SwipeSavvy mobile app features with categorization for easy administration. The system supports:

- ✅ **8 Feature Categories** (Authentication, Accounts, Transfers, AI Concierge, Support, Rewards, Profile, Design)
- ✅ **40+ Individual Features** across categories
- ✅ **Gradual Rollout** with percentage-based deployment
- ✅ **Admin Portal UI** with category filtering
- ✅ **Mobile App Integration** ready
- ✅ **Category-based Endpoints** for organized management

---

## Architecture

### 1. Database Schema (Updated)

**Feature Flag Model** (`swipesavvy-wallet-web/app/models/feature_flag.py`):
```python
class FeatureFlag(Base):
    __tablename__ = "feature_flags"
    
    id: String (UUID)
    name: String (unique)
    description: String (nullable)
    category: String (index) # NEW: Feature category
    enabled: Boolean
    rollout_percentage: Integer (0-100)
    targeting_rules: JSON (nullable)
    metadata: JSON (nullable)
    created_at: DateTime
    updated_at: DateTime
    created_by: String
    updated_by: String
```

**Feature Categories**:
- `authentication` - Login, sessions, security
- `accounts` - Bank linking, balance, account management
- `transfers` - Send/receive money, recipients
- `ai_concierge` - AI chat, streaming, support
- `support` - Tickets, escalation
- `rewards` - Points, leaderboard, donations
- `profile` - Settings, preferences
- `design` - Themes, UI, responsiveness

---

## Features by Category

### 1. Authentication (4 features)
- User Login
- Session Management
- Password Security
- User State Persistence

### 2. Account Management (6 features)
- Linked Bank Accounts
- Account Status Tracking
- Account Selection
- Account Balance Display
- Account Details
- Account Reconnection

### 3. Transfers (7 features)
- Send Money
- Receive Money
- Recipient Management
- Transfer History
- Amount Input
- Transfer Memo
- ACH Transfers

### 4. AI Concierge (7 features)
- AI Chat Interface
- Streaming Responses
- Quick Actions
- Context Awareness
- Human Handoff
- Customer Verification
- Typing Indicators

### 5. Support (3 features)
- Support Tickets
- Ticket Management
- Escalation Workflow

### 6. Rewards (4 features)
- Rewards Program
- Leaderboard
- Reward Donations
- Rewards Balance

### 7. Profile (3 features)
- User Settings
- Profile Information
- Account Preferences

### 8. Design & Theming (4 features)
- Dark Mode
- Responsive UI
- Design System
- Brand Colors

### Advanced Features (3 features)
- Offline Support
- Real-time Updates
- WebSocket Integration

---

## API Endpoints

### Admin Portal Endpoints

**List all flags (with pagination)**
```
GET /api/feature-flags?page=1&page_size=50&enabled_only=false
```

**Get all flags by category**
```
GET /api/feature-flags/categories/all
Response: {
  "categories": {
    "authentication": [...],
    "accounts": [...],
    ...
  }
}
```

**Get flags for specific category**
```
GET /api/feature-flags/category/{category_name}
Example: GET /api/feature-flags/category/authentication
```

**Create flag**
```
POST /api/feature-flags
{
  "name": "feature_name",
  "description": "Feature description",
  "category": "authentication",
  "enabled": true,
  "rollout_percentage": 100
}
```

**Toggle flag**
```
PATCH /api/feature-flags/{flag_id}/toggle?enabled=true
```

**Update flag**
```
PUT /api/feature-flags/{flag_id}
{
  "enabled": true,
  "rollout_percentage": 75,
  "description": "Updated description"
}
```

### Mobile App Endpoints

**Get active flags (with categories)**
```
GET /api/feature-flags/mobile/active?user_id={user_id}
Response: {
  "flags": {
    "feature_name": {
      "enabled": true,
      "category": "authentication",
      "rollout_percentage": 100,
      "metadata": {}
    }
  },
  "categories": {
    "authentication": ["feature_1", "feature_2"],
    ...
  }
}
```

---

## Setup Instructions

### Step 1: Database Migration

The `category` field has been added to the feature_flags table. Run migration:

```bash
# If using Alembic migrations
alembic upgrade head

# Or manually add the column:
ALTER TABLE feature_flags ADD COLUMN category VARCHAR(50) DEFAULT 'design' INDEX;
```

### Step 2: Seed Feature Flags

Populate the database with all 40+ features:

```bash
cd swipesavvy-wallet-web
python3 scripts/seed_feature_flags.py
```

Expected output:
```
✅ Successfully seeded 43 feature flags!

📊 Feature Flags by Category:
  - Authentication: 4 features
  - Accounts: 6 features
  - Transfers: 7 features
  - AI Concierge: 7 features
  - Support: 3 features
  - Rewards: 4 features
  - Profile: 3 features
  - Design: 4 features
  - Advanced: 3 features
```

### Step 3: Start Backend Server

```bash
cd swipesavvy-wallet-web
python3 -m uvicorn app.main:app --reload --port 8000
```

### Step 4: Start Admin Portal

```bash
cd swipesavvy-admin-portal
npm install
npm run dev
```

Visit: `http://localhost:5173/` → Navigate to **Feature Flags**

### Step 5: Integrate with Mobile App

In your mobile app code, check flags before rendering features:

```typescript
// Example: Conditionally show AI Concierge
const { flags } = useFeatureFlags();

if (flags['ai_chat_interface']) {
  return <ChatScreen />;
}
```

---

## Admin Portal UI

The Feature Flags page now includes:

1. **Category Filter Buttons** (9 buttons):
   - All Features
   - Authentication
   - Account Management
   - Transfers
   - AI Concierge
   - Support
   - Rewards
   - Profile
   - Design & Theming

2. **Feature Table with Columns**:
   - Feature Name (with description)
   - Category Badge
   - Status (On/Off)
   - Rollout % (with progress bar)
   - Last Updated

3. **Search** - Quick filter by name/description

4. **Toggle Modal** - Enable/disable features with confirmation

---

## Feature Flag Management Strategy

### Development Phase
- All flags enabled at **100% rollout**
- Test features as they're built
- Use categories to organize by feature module

### Beta Phase
- Gradually increase rollout percentage
- Example: `transfers` at 50% for internal beta
- Use targeting rules for specific user groups

### Production
- Progressive rollout starting at 10%
- Monitor metrics and increase gradually
- Disable immediately if issues detected

### Maintenance
- `rollout_percentage`: Control feature availability
- `enabled`: Completely on/off switch
- `targeting_rules`: Advanced filtering (by user_id, device, etc.)
- `metadata`: Store feature-specific config

---

## Service Layer

The `FeatureFlagService` in `swipesavvy-wallet-web/app/services/feature_flag_service.py` provides:

```python
# Core operations
create_flag(db, flag_data, user_id)
get_flag(db, flag_id)
get_flag_by_name(db, name)
list_flags(db, page, page_size, enabled_only)
update_flag(db, flag_id, flag_data, user_id)
delete_flag(db, flag_id)
toggle_flag(db, flag_id, enabled, user_id)

# Category operations
get_flags_by_category(db, category)
get_all_by_categories(db)

# Mobile operations
get_mobile_flags(db, user_id)  # Respects rollout %
_should_include_flag(flag, user_id)  # Hash-based rollout
```

---

## Rollout Strategy Example

### Send Money Feature
1. **Development**: `enabled=true, rollout=100%`
2. **Beta (Week 1)**: `enabled=true, rollout=25%` (internal team)
3. **Beta (Week 2)**: `enabled=true, rollout=50%` (beta users)
4. **Beta (Week 3)**: `enabled=true, rollout=75%`
5. **Production**: `enabled=true, rollout=100%` (full release)

### AI Concierge Feature
1. **Development**: `enabled=true, rollout=100%`
2. **Beta**: `enabled=true, rollout=50%` (premium users)
3. **Production**: `enabled=true, rollout=100%`

---

## Monitoring & Debugging

### Check Flag Status
```bash
curl http://localhost:8000/api/feature-flags/categories/all
```

### Check Single Category
```bash
curl http://localhost:8000/api/feature-flags/category/transfers
```

### Check Mobile Flags
```bash
curl "http://localhost:8000/api/feature-flags/mobile/active?user_id=user123"
```

### Admin Portal
Visit `http://localhost:5173/feature-flags` to:
- View all flags by category
- Toggle flags on/off
- Adjust rollout percentages
- See last update time and user

---

## Best Practices

1. **Naming Convention**: Use snake_case for flag names
   - ✅ `ai_chat_interface`
   - ❌ `aiChatInterface`

2. **Descriptions**: Always provide clear, concise descriptions
   - ✅ "Enable AI chat for natural language questions"
   - ❌ "Chat thing"

3. **Rollout**: Start conservative, increase gradually
   - Never jump from 0% to 100% in production
   - Monitor metrics at each step

4. **Categories**: Keep features in appropriate categories
   - Makes filtering and management easier
   - Helps mobile app organize permissions

5. **Cleanup**: Remove flags after full rollout
   - Delete flags that are permanently enabled
   - Keep temporarily disabled features for quick recovery

---

## Troubleshooting

### Flags not appearing in admin portal
1. Check database has `category` column
2. Verify flags were seeded correctly
3. Check API response in browser console

### Feature still disabled after enabling flag
1. Confirm flag `enabled=true` in database
2. Check `rollout_percentage` > 0
3. Verify mobile app is calling the `/mobile/active` endpoint
4. Check if user's hash falls within rollout bucket

### Category filter not working
1. Verify `category` field is populated for all flags
2. Check type definitions include `FeatureCategory`
3. Clear admin portal cache and reload

---

## Files Modified

### Backend (swipesavvy-wallet-web)
- ✅ `app/models/feature_flag.py` - Added category field and enum
- ✅ `app/services/feature_flag_service.py` - Added category methods
- ✅ `app/routes/feature_flags.py` - Added category endpoints
- ✅ `scripts/seed_feature_flags.py` - Created seed script (NEW)

### Admin Portal (swipesavvy-admin-portal)
- ✅ `src/pages/FeatureFlagsPage.tsx` - Added category filtering UI
- ✅ `src/types/featureFlags.ts` - Added category type definitions

---

## Next Steps

1. **Database Migration** - Run migrations to add `category` column
2. **Seed Data** - Execute seed script to populate 40+ features
3. **Test Admin Portal** - Verify category filtering works
4. **Mobile Integration** - Add feature flag checks to mobile screens
5. **Rollout Plan** - Define rollout strategy for each feature

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify API responses in browser dev tools
3. Check server logs for errors
4. Review feature flag service implementation
