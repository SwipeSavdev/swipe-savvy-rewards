# Feature Flags - Quick Reference Card

## 🎯 What Are Feature Flags?

Feature flags are toggles that control which features are available in the SwipeSavvy mobile app. They allow you to:
- Enable/disable features instantly without code changes
- Roll out features gradually (0-100%)
- Test features in production safely
- Fix issues by disabling features quickly

---

## 📂 Feature Categories (8 Total)

| Category | Features | Purpose |
|----------|----------|---------|
| **Authentication** | 4 | User login, sessions, security |
| **Accounts** | 6 | Bank linking, balances, account management |
| **Transfers** | 7 | Send/receive money, recipients |
| **AI Concierge** | 7 | AI chat, streaming, support escalation |
| **Support** | 3 | Support tickets, management, escalation |
| **Rewards** | 4 | Points, leaderboard, donations |
| **Profile** | 3 | Settings, preferences, user info |
| **Design** | 4 | Themes, UI, responsiveness |

**Total**: 40 core features + 3 advanced features = **43 total**

---

## 🚀 Admin Portal Workflow

### 1. View All Features by Category
1. Go to `http://localhost:5173/feature-flags`
2. Click a category button to filter
3. See features, status, and rollout %

### 2. Enable/Disable a Feature
1. Click on any feature row
2. Modal appears with toggle
3. Click "Confirm" to save

### 3. Adjust Rollout Percentage
1. Click on feature to open modal
2. Use slider to set 0-100%
3. Click "Confirm" to apply

### 4. Search Features
1. Use search box to find by name
2. Filters across all categories
3. Type to narrow results

---

## 📊 Feature Rollout Checklist

When rolling out a new feature:

- [ ] **Development** (internal)
  - Set: `enabled=ON, rollout=100%`
  - Test thoroughly

- [ ] **Beta Phase 1** (early access)
  - Set: `enabled=ON, rollout=25%`
  - Monitor for issues

- [ ] **Beta Phase 2** (expanded)
  - Set: `enabled=ON, rollout=50%`
  - Gather user feedback

- [ ] **Beta Phase 3** (near full)
  - Set: `enabled=ON, rollout=75%`
  - Verify stability

- [ ] **Full Launch**
  - Set: `enabled=ON, rollout=100%`
  - Remove if permanently on

---

## 🔧 Common Tasks

### Enable a Feature
```
Find flag → Click → Toggle ON → Confirm
```

### Disable Broken Feature
```
Find flag → Click → Toggle OFF → Confirm
```

### Test with 25% of Users
```
Find flag → Click → Set rollout to 25% → Confirm
```

### Hide Feature Completely
```
Find flag → Click → Toggle OFF → Confirm
```

### Delete Permanently Enabled Feature
```
Find flag → Click delete icon → Confirm
```

---

## ⚠️ Important Rules

1. **Always start conservative** - Never jump 0% → 100%
2. **Monitor each phase** - Watch for user complaints
3. **Have rollback plan** - Can instantly disable if issues
4. **Test in beta first** - Don't deploy untested features
5. **Document changes** - Note what you changed and why

---

## 🔍 Quick Status Check

| Status | What It Means |
|--------|---------------|
| **ON at 100%** | Feature available to all users |
| **ON at 50%** | Feature available to half the users (hash-based) |
| **ON at 0%** | Feature disabled (essentially OFF) |
| **OFF** | Feature completely disabled |

---

## 📈 Rollout Example: Send Money Feature

```
Monday:   disabled (under development)
Tuesday:  enabled, 25% (give to core team)
         - No crashes, positive feedback
Wednesday: enabled, 50% (give to 50% of users)
         - Works well, users like it
Thursday:  enabled, 75% (broader audience)
         - Still stable, very positive
Friday:    enabled, 100% (all users)
         - Feature fully launched! 🎉
```

---

## 🆘 Troubleshooting

**"Feature still disabled after I enabled it"**
- Make sure you clicked "Confirm"
- Check if rollout % is greater than 0%
- Mobile app might need to refresh

**"I can't find a feature"**
- Try searching by feature name
- Check the right category
- Refresh the page

**"Feature is crashing users"**
- Click the feature
- Toggle it OFF immediately
- Disable to stop the issue
- Investigate and fix in code
- Re-enable when ready

---

## 📱 Features by Module (Mobile App)

### User Onboarding
- User Login
- Session Management
- Password Security

### Money Management
- Account Linking
- View Balances
- Send Money
- Receive Money
- Transfer History

### Smart Assistant
- AI Chat Interface
- Quick Actions
- Context Awareness
- Human Escalation

### User Engagement
- Rewards Program
- Leaderboard
- Support Tickets

### Customization
- Dark Mode
- Preferences
- Profile Settings

---

## 🔐 Security Notes

- Feature flags are **not** a security mechanism
- Don't use for hiding sensitive data
- Use for **feature availability** only
- Backend still validates everything
- Flags control UI only, not permissions

---

## 📞 Getting Help

**API Documentation**: Check the implementation guide
**Logs**: Watch the server terminal for errors
**Database**: Check feature_flags table directly:
```sql
SELECT name, category, enabled, rollout_percentage 
FROM feature_flags 
ORDER BY category, name;
```

---

## ✅ Pre-Launch Checklist

Before launching a major feature:

- [ ] Feature works in development (100%)
- [ ] Feature tested in beta (25-75%)
- [ ] No crash reports
- [ ] Users giving positive feedback
- [ ] Performance is acceptable
- [ ] Documentation is updated
- [ ] Rollback plan is ready
- [ ] Team is on standby
- [ ] Ready to go to 100%

---

**Last Updated**: December 30, 2025
**Flags Implemented**: 43 features across 8 categories
**Admin Portal**: ✅ Live at http://localhost:5173/feature-flags
**Backend API**: ✅ Ready at http://localhost:8000/api/feature-flags
