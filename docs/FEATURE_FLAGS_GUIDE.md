# Feature Flags Implementation Guide

## Overview

The feature flag system allows the admin portal to control which features are served to mobile app users in real-time without requiring app updates. This enables:

- **Gradual rollout** of new features to a percentage of users
- **A/B testing** features with different user segments
- **Kill switches** to disable features if issues arise
- **Real-time control** from the admin dashboard

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Portal                          │
│  - Manage feature flags                                  │
│  - Toggle features on/off                               │
│  - Control rollout percentages                           │
│  - View analytics                                        │
└──────────────────────┬──────────────────────────────────┘
                       │ (API calls)
        ┌──────────────▼──────────────┐
        │   Backend API Endpoints     │
        │  /api/feature-flags/*       │
        │  /api/feature-flags/mobile/ │
        └──────────────┬──────────────┘
                       │ (JSON)
┌──────────────────────▼──────────────────────────────────┐
│              Mobile App                                  │
│  - Fetch feature flags on startup                        │
│  - Cache flags locally (30 min)                          │
│  - Check if features are enabled                         │
│  - Render features conditionally                         │
└─────────────────────────────────────────────────────────┘
```

## Feature Flag Properties

Each feature flag has:

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Unique identifier (e.g., `new_dashboard`) |
| `description` | string | Human-readable description |
| `enabled` | boolean | Master on/off switch |
| `rollout_percentage` | number | 0-100: percentage of users receiving the feature |
| `metadata` | object | Additional config (versions, limits, etc.) |
| `targeting_rules` | object | Advanced targeting by user attributes |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

## Rollout Percentage

The `rollout_percentage` controls what portion of users see a feature:

- **0%** → Feature disabled for all users
- **25%** → Feature enabled for ~25% of users (consistent per user)
- **50%** → Feature enabled for ~50% of users
- **100%** → Feature enabled for all users

**Important:** The rollout is consistent per user using hash-based bucketing. If User A gets feature X at 25% rollout, they'll always see it until the percentage changes.

## Admin Portal Usage

### Creating a Feature Flag

1. Navigate to **Feature Flags** in the sidebar
2. Click **New Flag**
3. Fill in:
   - **Name**: Unique identifier (snake_case recommended)
   - **Description**: What the feature does
   - **Enable by default**: Initial enabled state
   - **Rollout %**: Percentage of users (0-100)
4. Click **Create**

### Managing Flags

- **Toggle**: Click the enabled/disabled badge to turn flag on/off
- **Adjust Rollout**: Use the percentage slider (0-100%)
- **Delete**: Click the delete button (irreversible)
- **Refresh**: Click refresh to reload flags from backend

### Example Scenarios

**Gradual Rollout:**
1. Create flag `new_dashboard` with 0% rollout
2. Enable it (toggle on)
3. Gradually increase rollout: 10% → 25% → 50% → 100%
4. Monitor for issues and revert if needed

**A/B Testing:**
1. Create flag `experiment_variant_a` (50% rollout)
2. Create flag `experiment_variant_b` (50% rollout)
3. Mobile app shows one or the other based on enabled flags
4. Analyze user behavior differences

**Kill Switch:**
1. Feature has an issue in production
2. Toggle flag to disabled immediately
3. Mobile app stops showing feature within 30 minutes (cache expiry)
4. Deploy fix
5. Re-enable flag

## Backend API

### Endpoints

#### List All Flags
```
GET /api/feature-flags?page=1&page_size=50&enabled_only=false
```

Response:
```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "page_size": 50,
    "flags": [
      {
        "id": "uuid",
        "name": "new_dashboard",
        "description": "New dashboard redesign",
        "enabled": true,
        "rollout_percentage": 50,
        "created_at": "2025-12-25T10:00:00",
        "updated_at": "2025-12-25T12:00:00"
      }
    ]
  }
}
```

#### Create Flag
```
POST /api/feature-flags
Content-Type: application/json

{
  "name": "new_dashboard",
  "description": "New dashboard redesign",
  "enabled": true,
  "rollout_percentage": 0,
  "metadata": {}
}
```

#### Update Flag
```
PUT /api/feature-flags/{flag_id}
Content-Type: application/json

{
  "description": "Updated description",
  "rollout_percentage": 50
}
```

#### Toggle Flag
```
PATCH /api/feature-flags/{flag_id}/toggle?enabled=true
```

#### Delete Flag
```
DELETE /api/feature-flags/{flag_id}
```

#### Get Mobile Flags
```
GET /api/feature-flags/mobile/active?user_id=user123
```

Response:
```json
{
  "success": true,
  "data": {
    "flags": {
      "new_dashboard": {
        "enabled": true,
        "rollout_percentage": 50,
        "metadata": {}
      },
      "new_notifications": {
        "enabled": true,
        "rollout_percentage": 100,
        "metadata": {}
      }
    },
    "timestamp": "2025-12-25T12:30:00",
    "version": "1.0"
  }
}
```

## Mobile App Integration

### Setup

1. Add `FeatureFlagsProvider` to your app's context providers

```tsx
import { FeatureFlagsProvider } from '@/context/FeatureFlagsContext'

export default function App() {
  return (
    <FeatureFlagsProvider>
      <AppNavigator />
    </FeatureFlagsProvider>
  )
}
```

2. Import the hook in any component

```tsx
import { useFeatureFlags } from '@/context/FeatureFlagsContext'
```

### Usage Examples

#### Check if Feature is Enabled
```tsx
export function ChallengesScreen() {
  const { isFeatureEnabled } = useFeatureFlags()

  return (
    <View>
      {isFeatureEnabled('new_challenges_ui') && (
        <NewChallengesUI />
      )}
      {!isFeatureEnabled('new_challenges_ui') && (
        <LegacyChallengesUI />
      )}
    </View>
  )
}
```

#### Conditional Rendering
```tsx
export function Dashboard() {
  const { isFeatureEnabled } = useFeatureFlags()

  return (
    <View>
      <Header />
      {isFeatureEnabled('new_dashboard') && <NewDashboard />}
      {isFeatureEnabled('analytics_v2') && <AnalyticsV2 />}
      <Navigation />
    </View>
  )
}
```

#### Manually Refresh Flags
```tsx
export function SettingsScreen() {
  const { refreshFlags } = useFeatureFlags()

  return (
    <Button
      title="Check for feature updates"
      onPress={() => refreshFlags()}
    />
  )
}
```

### Caching Strategy

The mobile app:

1. **On startup**: Loads cached flags from AsyncStorage (fast)
2. **If cache invalid**: Fetches fresh flags from backend
3. **Fallback**: Uses old cached flags if fetch fails
4. **Background**: Refreshes flags every 30 minutes
5. **Manual**: User can manually trigger refresh

This ensures:
- **Fast startup** (uses cache)
- **Fresh data** (periodic refresh)
- **Reliability** (fallback to cache if offline)

## Best Practices

### Naming Conventions
```
✅ Good:
- new_dashboard
- payment_v2
- feature_notifications_beta

❌ Bad:
- newDashboard (use snake_case)
- feature1 (use descriptive names)
- temp (avoid temporary flags)
```

### Lifecycle Management

1. **Development**: Test with 0% rollout
2. **QA**: Enable with 10% rollout
3. **Beta**: Increase to 25-50% rollout
4. **Production**: Increase to 100%
5. **Mature**: Consider removing flag (feature becomes permanent)

### Monitoring

- Check feature flag toggle history in analytics
- Monitor crash rates after enabling flags
- A/B test new features against control group
- Set alerts for sudden behavior changes

### Cleanup

- Delete flags after 2-3 months of 100% rollout
- Remove flag checks from code if flag is always enabled
- Document why flags were disabled if they're kept in limbo

## Common Use Cases

### 1. Launch New Feature Safely
```
Week 1: 0% → 10% rollout (monitoring)
Week 2: 10% → 25% rollout (if good metrics)
Week 3: 25% → 50% rollout
Week 4: 50% → 100% rollout (full release)
```

### 2. A/B Test Feature
```
Create two flags:
- variant_a: 50% rollout
- variant_b: 50% rollout

Track which variant has better engagement
```

### 3. Emergency Kill Switch
```
Feature causes issues:
1. Toggle flag to disabled (instant)
2. Users see old feature within 30 minutes
3. Deploy fix to backend
4. Re-enable flag
```

### 4. Regional Feature Control
```
In metadata, add:
{
  "regions": ["US", "CA"],
  "min_app_version": "1.5.0"
}

Mobile app checks metadata before showing feature
```

## Troubleshooting

### Flags Not Appearing in Mobile App

1. Check flag is **enabled** in admin portal
2. Check **rollout percentage** > 0
3. Check flag was created with correct **name**
4. Clear AsyncStorage cache: 
   ```
   await AsyncStorage.removeItem('@feature_flags_cache')
   ```
5. Manually call `refreshFlags()` in app
6. Check network: backend must be accessible

### Mobile App Not Fetching Flags

1. Check backend URL in `FeatureFlagsContext.tsx`
2. Verify backend is running: `curl http://backend:8000/api/feature-flags/mobile/active`
3. Check network connectivity
4. Review console logs for fetch errors
5. Verify CORS headers if cross-origin

### Flag Changes Not Reflecting

- Mobile app caches for **30 minutes**
- User must open app after flag change to see it
- Force refresh via: pull-to-refresh or settings button
- Or manually call `refreshFlags()`

## Future Enhancements

Possible additions:

- [ ] User segments (target by user attributes)
- [ ] Schedule-based flags (enable at specific times)
- [ ] Gradual rollout automation (auto-increase %)
- [ ] Analytics dashboard (flag effectiveness)
- [ ] A/B test statistical significance calculator
- [ ] Flag dependency rules
- [ ] Flag approval workflow
- [ ] Audit logging of all changes
