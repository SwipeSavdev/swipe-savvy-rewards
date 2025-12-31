# 🚀 Reporting Dashboard - Quick Start Guide

## 5-Minute Setup

### Step 1: Import the Dashboard
```typescript
import ReportingDashboard from '@/pages/ReportingDashboard';
```

### Step 2: Add to Your Router
```typescript
<Route path="/admin/reporting" element={<ReportingDashboard />} />
```

### Step 3: Verify API Endpoints
Ensure these 22 endpoints are available:
- `/api/transactions/analytics/*` (6 endpoints)
- `/api/users/analytics/*` (4 endpoints)
- `/api/merchants/analytics/*` (3 endpoints)
- `/api/accounts/analytics/*` (2 endpoints)
- `/api/rewards/*` (3 endpoints)
- `/api/features/*` (2 endpoints)
- `/api/ai-concierge/analytics/*` (3 endpoints)

See `API_ENDPOINTS_REPORTING.md` for full specifications.

### Step 4: Set Environment Variables
```env
REACT_APP_API_BASE_URL=http://your-api-domain
REACT_APP_API_TIMEOUT=30000
```

### Step 5: Access Dashboard
Navigate to: `http://localhost:3000/admin/reporting`

---

## 📊 What You'll See

### Default Dashboard Features
✅ 13 pre-configured widgets  
✅ Real-time data display  
✅ Date range filtering  
✅ Widget customization  
✅ Multi-format export  

### Available Widgets
1. **KPI Cards** - Revenue, Transactions, Users (with trends)
2. **Charts** - Revenue trend, Payment methods, Transaction volume
3. **Growth Charts** - User growth, Linked banks, Merchant categories
4. **Status Charts** - Transaction status breakdown
5. **Summaries** - Rewards metrics, AI concierge performance
6. **Tables** - Latest transactions with sorting

---

## 🎨 Customization (5 Minutes)

### Change Color Scheme
Edit any component file and modify Tailwind classes:
```tsx
// From:
className="bg-slate-800 text-slate-200"
// To:
className="bg-blue-900 text-blue-50"
```

### Add New Data Source
1. Add method to `businessDataService.ts`:
```typescript
const myService = {
  async getMyData(filters: DateRange) {
    const response = await fetch(`/api/my-endpoint?...`);
    return await response.json();
  }
};
```

2. Add to `useReportingData.ts` transformation
3. Add to `DATA_SOURCES` in `ReportBuilder.tsx`

### Create Custom Widget
1. Create new component in `/src/components/reporting/`
2. Add case to `renderWidget()` in `ReportingDashboard.tsx`
3. Update widget types

---

## 📋 Troubleshooting

### "No data appearing in widgets"
1. Check API endpoints are running
2. Verify endpoint URLs match `businessDataService.ts`
3. Check browser Network tab for errors
4. Verify authentication token

### "Widgets not updating on filter change"
1. Clear browser cache
2. Check date range is valid (start < end)
3. Verify React DevTools shows component re-render
4. Check for JavaScript errors in console

### "Export not working"
1. Check browser supports Blob API
2. Check CORS headers allow file download
3. Try different browser
4. Check data isn't corrupted

---

## 🔧 Configuration Options

### Environment Variables
```env
# API Configuration
REACT_APP_API_BASE_URL=http://api.local
REACT_APP_API_TIMEOUT=30000

# Feature Flags
REACT_APP_ENABLE_EXPORT_CSV=true
REACT_APP_ENABLE_EXPORT_JSON=true
REACT_APP_ENABLE_EXPORT_HTML=true
REACT_APP_ENABLE_OFFLINE_MODE=false

# Dashboard Settings
REACT_APP_REPORTING_REFRESH_INTERVAL=300000
REACT_APP_DEFAULT_DATE_RANGE=30
```

### Customize Default Layout
Edit `DEFAULT_WIDGETS` in `ReportingDashboard.tsx`:
```typescript
const DEFAULT_WIDGETS = [
  { id: 'my-widget', type: 'kpi', title: 'My Title', dataSource: 'my_data' }
];
```

---

## 📊 Data Sources Reference

| Source | Type | Description |
|--------|------|-------------|
| `revenue` | KPI | Total revenue with trend |
| `transactions` | KPI | Transaction count |
| `users` | KPI | Active users |
| `revenue_trend` | Chart | Revenue over time |
| `payment_methods` | Pie Chart | Payment breakdown |
| `top_merchants` | Bar Chart | Top merchants |
| `user_growth` | Line Chart | User growth trend |
| `latest_transactions` | Table | Recent transactions |
| `rewards_metrics` | Summary | Rewards stats |
| `ai_metrics` | Summary | AI performance |
| (And 4 more...) | ... | See DYNAMIC_REPORTING_GUIDE.md |

---

## 🎯 Common Tasks

### Add a New Widget
1. Click "➕ Add Widget" button
2. Select widget type (KPI, Chart, Table, Summary)
3. Enter title
4. Choose data source
5. Click "Create Widget"

### Remove a Widget
1. Click "✏️ Edit Layout"
2. Click "✕" on widget
3. Click "✓ Done Editing"

### Change Layout
1. Click "Default", "Compact", or "Analytics"
2. Dashboard updates immediately

### Filter by Date Range
1. Click date input fields
2. Select start and end dates
3. Data updates automatically

### Export Data
1. Click "📥 Export"
2. Select format (JSON, CSV, HTML)
3. File downloads automatically

---

## 🚀 Performance Tips

### Optimize for Speed
- Use "Compact" layout for dashboard with 15+ widgets
- Implement pagination for tables with 1000+ rows
- Cache frequently accessed data
- Use CDN for static assets

### Monitor Performance
- Check API response times in Network tab
- Monitor widget render times in React DevTools
- Check Lighthouse scores
- Track Core Web Vitals

### Best Practices
- Limit widgets to 15-20 per dashboard
- Use appropriate chart types (line for trends, pie for distributions)
- Aggregate data at API level, not frontend
- Cache expensive queries (30+ minute TTL)

---

## 🧪 Testing Checklist

- [ ] Dashboard loads without errors
- [ ] All 13 default widgets display
- [ ] Filters update data
- [ ] Widget CRUD operations work
- [ ] Export generates valid files
- [ ] Error states display properly
- [ ] Performance acceptable (< 2s load)
- [ ] Mobile responsive
- [ ] Keyboard navigable

---

## 📚 Documentation Map

| Document | Purpose |
|----------|---------|
| [DYNAMIC_REPORTING_GUIDE.md](./admin-portal/DYNAMIC_REPORTING_GUIDE.md) | Complete feature & architecture guide |
| [API_ENDPOINTS_REPORTING.md](./admin-portal/API_ENDPOINTS_REPORTING.md) | API specifications (22 endpoints) |
| [REPORTING_INTEGRATION_CHECKLIST.md](./admin-portal/REPORTING_INTEGRATION_CHECKLIST.md) | Backend integration & deployment |
| [REPORTING_DASHBOARD_INDEX.md](./admin-portal/REPORTING_DASHBOARD_INDEX.md) | Complete file reference |

---

## 🆘 Support

### If Components Don't Load
1. Check TypeScript compilation
2. Verify all imports are correct
3. Check `tsconfig.json` paths
4. Run `npm install` for dependencies

### If API Calls Fail
1. Verify endpoints exist
2. Check authentication token
3. Inspect Network tab
4. Review API error logs

### If Data Doesn't Display
1. Check API response format
2. Review data transformation logic
3. Check browser console for errors
4. Verify date range has data

---

## 💡 Pro Tips

✨ **Keyboard Shortcuts** (when implemented)
- `Ctrl+K` - Command palette
- `Ctrl+E` - Export menu
- `Ctrl+F` - Filter focus
- `Ctrl+R` - Refresh data

✨ **Performance Tricks**
- Use "Analytics" layout for chart-heavy viewing
- Set longer date ranges to reduce API calls
- Disable real-time refresh when not needed
- Use CSV export for large datasets

✨ **User Experience**
- Save your custom layouts
- Use quick preset filters
- Bookmark reports with specific filters
- Export important reports for sharing

---

## 🎉 You're Ready!

Your Dynamic Reporting Dashboard is ready to use. Start exploring your business data with these powerful analytics tools!

**Next Step:** Implement the 22 backend API endpoints (see `API_ENDPOINTS_REPORTING.md`)

---

**Version:** 1.0  
**Last Updated:** December 26, 2025  
**Status:** ✅ Ready to Use
