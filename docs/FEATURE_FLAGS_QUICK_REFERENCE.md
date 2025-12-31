# Feature Flags - Quick Reference

## Admin Portal

**URL:** `http://localhost:5179/feature-flags`

### Create a Flag
1. Click **New Flag**
2. Fill form:
   - Name: `feature_name` (snake_case)
   - Description: What it does
   - Enable: Toggle on/off
   - Rollout: 0-100%
3. Click **Create**

### Manage Flags
| Action | How |
|--------|-----|
| Toggle On/Off | Click flag → Click toggle button |
| Change Rollout | Click flag → Adjust slider (0-100%) |
| Delete | Click flag → Click delete button |
| Refresh | Click refresh button (top right) |

## Mobile App

### Installation
Already done! `FeatureFlagsProvider` is in your `App.tsx`

### Usage
```tsx
import { useFeatureFlags } from '@/context/FeatureFlagsContext'

const { isFeatureEnabled, refreshFlags } = useFeatureFlags()

// Check if feature is enabled
if (isFeatureEnabled('my_feature')) {
  // Show feature
}

// Manually refresh flags
await refreshFlags()
```

### Caching
- **Cache duration:** 30 minutes
- **Auto refresh:** Every 30 minutes
- **Manual refresh:** Pull-to-refresh or call `refreshFlags()`
- **Fallback:** Uses cached flags if offline

## Backend API

**Base URL:** `http://localhost:8000`

### Create Flag
```bash
curl -X POST http://localhost:8000/api/feature-flags \
  -H "Content-Type: application/json" \
  -d '{
    "name": "new_feature",
    "description": "Feature description",
    "enabled": false,
    "rollout_percentage": 0
  }'
```

### List Flags
```bash
curl http://localhost:8000/api/feature-flags
```

### Toggle Flag
```bash
curl -X PATCH http://localhost:8000/api/feature-flags/{id}/toggle?enabled=true
```

### Update Rollout
```bash
curl -X PUT http://localhost:8000/api/feature-flags/{id} \
  -H "Content-Type: application/json" \
  -d '{"rollout_percentage": 50}'
```

### Get Mobile Flags
```bash
curl http://localhost:8000/api/feature-flags/mobile/active?user_id=user123
```

### Delete Flag
```bash
curl -X DELETE http://localhost:8000/api/feature-flags/{id}
```

## Rollout Percentages

| % | Status | Use Case |
|---|--------|----------|
| 0% | Off | Disabled, internal testing |
| 10% | Early | Internal team + QA |
| 25% | Beta | Beta testers, early adopters |
| 50% | Public Beta | Half of users |
| 100% | Live | All users |

## Naming Conventions

```
✅ new_dashboard
✅ challenges_filter
✅ achievements_system
✅ leaderboard_beta
✅ ai_advisor_v2

❌ newDashboard (use snake_case)
❌ feature1 (be descriptive)
❌ temp (avoid temporary names)
```

## Common Tasks

### Gradual Rollout
```
1. Create flag with 0% rollout (disabled)
2. Toggle enabled (toggle on)
3. Increase: 0% → 10% → 25% → 50% → 100%
4. Monitor metrics between each increase
```

### A/B Testing
```
1. Create flag_variant_a (50% rollout, enabled)
2. Create flag_variant_b (50% rollout, enabled)
3. In mobile app: show variant based on enabled flags
4. Compare metrics between variants
```

### Emergency Kill Switch
```
1. Feature causes issues
2. Toggle flag to disabled
3. Users revert within 30 minutes (cache expiry)
4. Deploy fix
5. Re-enable flag
```

## Debug Checklist

- [ ] Flag is **enabled** (toggle shows "Enabled")
- [ ] **Rollout % > 0** (not 0%)
- [ ] Flag **name matches exactly** in mobile code
- [ ] Backend is running (check `http://localhost:8000`)
- [ ] Mobile app has network access
- [ ] Check AsyncStorage cache: Settings → Developer → Clear Cache
- [ ] Check browser console for API errors
- [ ] Verify `FeatureFlagsProvider` in `App.tsx`

## Performance Tips

- Flags cached for 30 minutes (fast access)
- Minimal network traffic (only on refresh)
- Uses hash-based bucketing (efficient rollout)
- No extra app size (lightweight library)
- Works offline (uses cached flags)

## Files Modified/Created

### Backend
- `app/models/feature_flag.py` ✨ NEW
- `app/services/feature_flag_service.py` ✨ NEW
- `app/routes/feature_flags.py` ✨ NEW

### Admin Portal
- `src/pages/FeatureFlagsPage.tsx` 📝 UPDATED

### Mobile App
- `src/context/FeatureFlagsContext.tsx` ✨ NEW
- `App.tsx` 📝 UPDATED

### Documentation
- `docs/FEATURE_FLAGS_GUIDE.md` ✨ NEW
- `docs/RECOMMENDED_FEATURE_FLAGS.md` ✨ NEW
- `docs/FEATURE_FLAGS_USAGE_EXAMPLE.md` ✨ NEW
- `docs/FEATURE_FLAGS_IMPLEMENTATION_COMPLETE.md` ✨ NEW

## Resources

- **Full Guide:** `docs/FEATURE_FLAGS_GUIDE.md`
- **Recommended Flags:** `docs/RECOMMENDED_FEATURE_FLAGS.md`
- **Code Examples:** `docs/FEATURE_FLAGS_USAGE_EXAMPLE.md`
- **Implementation Details:** `docs/FEATURE_FLAGS_IMPLEMENTATION_COMPLETE.md`

---

**Need help?** Check the full documentation in `docs/` folder.
