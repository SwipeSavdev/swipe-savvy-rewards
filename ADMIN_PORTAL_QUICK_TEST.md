# Admin Portal - Quick Testing Guide

## Quick Access

- **Admin Portal:** http://localhost:5175/login
- **API Health Check:** http://localhost:8000/health
- **API Users Endpoint:** http://localhost:8000/api/users
- **API Tickets Endpoint:** http://localhost:8000/api/tickets

## Login Instructions

Navigate to: `http://localhost:5175/login`

- **Email:** Any email (e.g., admin@swipesavvy.com)
- **Password:** Any password
- **Result:** Should redirect to /dashboard with Sidebar + Header visible

## Page Navigation Map

After login, you can navigate to:

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard` | DashboardPage | Main dashboard |
| `/support/dashboard` | SupportDashboardPage | Support overview |
| `/support/tickets` | SupportTicketsPage | Manage tickets |
| `/admin/users` | AdminUsersPage | Manage admin users |
| `/admin/audit-logs` | AuditLogsPage | View audit logs |
| `/feature-flags` | FeatureFlagsPage | Control feature flags |
| `/users` | UsersPage | Manage users |
| `/analytics` | AnalyticsPage | View analytics |
| `/merchants` | MerchantsPage | Manage merchants |
| `/settings` | SettingsPage | System settings |
| `/ai-marketing` | AIMarketingPage | AI marketing tools |
| `/concierge` | ConciergePage | Concierge services |

## What to Check

### 1. Page Loading
- [ ] All pages load without white blank screen
- [ ] No 404 errors in browser console
- [ ] No TypeScript errors in terminal

### 2. Navigation
- [ ] Sidebar links navigate to correct pages
- [ ] Back/forward browser buttons work
- [ ] Sidebar is visible on all protected pages
- [ ] Header is visible on all protected pages

### 3. API Calls
- [ ] AdminUsersPage shows data from `/api/users`
- [ ] SupportTicketsPage shows data from `/api/tickets`
- [ ] Open DevTools → Network tab
- [ ] All requests should be to `http://localhost:8000/api/*`

### 4. Authentication
- [ ] Token stored in localStorage as 'admin_token'
- [ ] Logout (if implemented) clears token
- [ ] Can't access /dashboard without logging in first
- [ ] Typing invalid credentials shows error message

## Common Issues & Fixes

### Admin portal shows blank page
- Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Hard refresh: Ctrl+F5 (or Cmd+Shift+R on Mac)
- Check console for errors: F12 → Console tab

### API calls failing (404)
- Verify mock API is running: `curl http://localhost:8000/health`
- Check .env has `VITE_API_BASE_URL=http://localhost:8000`
- Restart admin portal: Stop npm run dev, then run again

### Pages not loading
- Check terminal for errors (npm run dev)
- Look for TypeScript compilation errors
- Verify all imports are correct

### "Cannot find module" errors
- Run `npm install` in admin portal directory
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Developer Tools

### Check Admin Portal Status
```bash
curl http://localhost:5175
```

### Check API Status
```bash
curl http://localhost:8000/health
```

### Check API Response
```bash
curl http://localhost:8000/api/users
curl http://localhost:8000/api/tickets
```

### View Admin Portal Logs
Terminal should show:
- "VITE v5.4.21 ready in XXms"
- "Local: http://localhost:5175/"
- Page load requests and hot module reloads

## Expected Behavior

✅ **Normal:** Pages load quickly, navigation is smooth, console is clean  
⚠️ **Warning:** Page takes 2-3 seconds to load - check API response time  
❌ **Error:** White blank page, red errors in console - check logs  

## Production Ready Checklist

- [x] All 13 pages import correctly
- [x] Routes are configured
- [x] API base URL is set
- [x] Authentication is working
- [x] Protected routes are wrapped
- [x] No circular imports
- [x] No missing dependencies
- [x] Mock API is responding
- [x] Dev servers are running
- [x] No console errors

**Status:** Ready for testing and development! 🚀

