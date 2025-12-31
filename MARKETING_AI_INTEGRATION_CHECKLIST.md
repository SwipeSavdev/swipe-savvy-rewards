# Marketing AI Service - Integration Checklist

## ✅ Backend Setup (swipesavvy-ai-agents)

### 1. Create Directories
- [ ] Create `app/services/` if not exists
- [ ] Create `app/scheduler/` if not exists
- [ ] Create `app/routes/marketing.py`

### 2. Add Core Files
- [ ] Copy `marketing_ai.py` → `app/services/`
- [ ] Copy `marketing_jobs.py` → `app/scheduler/`
- [ ] Copy `marketing.py` → `app/routes/`

### 3. Install Dependencies
```bash
pip install apscheduler>=3.10.4
pip install psycopg2-binary>=2.9.0
```
- [ ] APScheduler installed
- [ ] psycopg2 installed

### 4. Update main.py
```python
# Add imports
from app.routes import marketing
from app.scheduler.marketing_jobs import initialize_scheduler

# Add route
app.include_router(marketing.router)

# Add startup
@app.on_event("startup")
async def startup():
    initialize_scheduler()

# Add shutdown (optional)
@app.on_event("shutdown")
async def shutdown():
    from app.scheduler.marketing_jobs import get_scheduler
    scheduler = get_scheduler()
    if scheduler:
        scheduler.shutdown()
```
- [ ] marketing router added
- [ ] initialize_scheduler called
- [ ] No import errors

### 5. Create Database Tables

Run in PostgreSQL (swipesavvy_agents database):

```sql
-- Create marketing_campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    campaign_id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50),
    description TEXT,
    offer_type VARCHAR(50),
    offer_value DECIMAL(10,2),
    offer_unit VARCHAR(20),
    target_pattern VARCHAR(100),
    target_location VARCHAR(255),
    qualifying_criteria JSONB,
    duration_days INT DEFAULT 30,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaign_targets table
CREATE TABLE IF NOT EXISTS campaign_targets (
    target_id SERIAL PRIMARY KEY,
    campaign_id INT NOT NULL REFERENCES marketing_campaigns(campaign_id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'eligible',
    viewed_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_targets_campaign ON campaign_targets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_targets_user ON campaign_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created ON marketing_campaigns(created_at);

-- Verify
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'marketing_%';
```
- [ ] marketing_campaigns table created
- [ ] campaign_targets table created
- [ ] Indexes created
- [ ] Tables verified

### 6. Configure Environment Variables
Edit `.env` in backend:
```bash
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=swipesavvy_agents
DB_USER=postgres
DB_PASSWORD=your_password

MARKETING_ANALYSIS_HOUR=2
MARKETING_ANALYSIS_MINUTE=0
CAMPAIGN_CLEANUP_HOUR=3
CAMPAIGN_CLEANUP_MINUTE=0
```
- [ ] Database credentials set
- [ ] Scheduler times configured
- [ ] .env file saved

### 7. Verify Backend

Test endpoints:
```bash
# Start backend
uvicorn app.main:app --reload

# In another terminal
# Get campaigns
curl http://localhost:8000/api/marketing/campaigns

# Get segments
curl http://localhost:8000/api/marketing/segments

# Get status
curl http://localhost:8000/api/marketing/status

# Trigger analysis
curl -X POST http://localhost:8000/api/marketing/analysis/run-now
```
- [ ] Backend starts without errors
- [ ] Campaigns endpoint responds
- [ ] Segments endpoint responds
- [ ] Status endpoint responds
- [ ] Analysis can be triggered

---

## 📱 Mobile App Setup (swipesavvy-mobile-app)

### 1. Add Service File
- [ ] Copy `MarketingAPIService.ts` → `src/services/`

### 2. Update Imports
In files using campaigns:
```typescript
import { marketingAPI } from '@services/MarketingAPIService';
```
- [ ] Service imported correctly

### 3. Create Campaign Display Component

Create `src/components/CampaignsBanner.tsx`:
```typescript
import { useEffect, useState } from 'react';
import { marketingAPI } from '@services/MarketingAPIService';

export function CampaignsBanner() {
  const [campaigns, setCampaigns] = useState([]);
  
  useEffect(() => {
    marketingAPI.getActiveCampaigns(5).then(setCampaigns);
  }, []);

  return (
    <div className="campaigns-section">
      {campaigns.map(campaign => (
        <div key={campaign.campaign_id} className="campaign-card">
          <h3>{campaign.campaign_name}</h3>
          <p>{campaign.description}</p>
        </div>
      ))}
    </div>
  );
}
```
- [ ] Component created
- [ ] Component displays campaigns
- [ ] No TypeScript errors

### 4. Add Campaign View Tracking

In campaign display:
```typescript
const handleCampaignView = async (campaignId: number) => {
  await marketingAPI.recordCampaignView(campaignId);
};

const handleCampaignClick = (campaign: Campaign) => {
  handleCampaignView(campaign.campaign_id);
  // Navigate to campaign details
};
```
- [ ] View tracking added
- [ ] Click handlers updated

### 5. Add Conversion Tracking

In checkout/purchase screen:
```typescript
const handlePurchaseComplete = async (amount: number, items: any[]) => {
  const campaignId = route.params.campaignId;
  
  if (campaignId) {
    await marketingAPI.recordCampaignConversion(
      campaignId,
      amount,
      items
    );
  }
  
  // Complete purchase
};
```
- [ ] Conversion tracking added
- [ ] Checkout flow updated

### 6. Configure API URL

Update `src/services/MarketingAPIService.ts`:
```typescript
const apiURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const service = new MarketingAPIService(apiURL);
```

Or in environment:
```bash
# .env or app.json
REACT_APP_API_URL=http://your-api-server:8000
```
- [ ] API URL configured
- [ ] Environment variable set

### 7. Verify Mobile Integration

```bash
# Build and run mobile app
npm start

# Or with Expo
expo start

# Check console logs for API calls
```
- [ ] App starts without errors
- [ ] Campaigns load from API
- [ ] No network errors in console

---

## 🔧 Admin Portal Setup (swipesavvy-admin-portal)

### 1. Create Marketing Dashboard Page

Create `src/pages/MarketingDashboardPage.tsx`:
```typescript
import { useEffect, useState } from 'react';
import axios from 'axios';

export function MarketingDashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Fetch campaigns
    axios.get('http://localhost:8000/api/marketing/campaigns?limit=10')
      .then(res => setCampaigns(res.data.campaigns));

    // Fetch analytics
    axios.get('http://localhost:8000/api/marketing/analytics')
      .then(res => setAnalytics(res.data));
  }, []);

  return (
    <div className="marketing-dashboard">
      <h1>Marketing Campaigns</h1>
      
      <div className="dashboard-grid">
        {/* Campaign list */}
        <div className="campaigns-section">
          <h2>Active Campaigns</h2>
          {campaigns.map(campaign => (
            <div key={campaign.campaign_id} className="campaign-card">
              <h3>{campaign.campaign_name}</h3>
              <p>Type: {campaign.campaign_type}</p>
              <p>Targets: {campaign.total_targets}</p>
            </div>
          ))}
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="analytics-section">
            <h2>Performance</h2>
            <p>Active Campaigns: {analytics.summary.active_campaigns}</p>
            <p>Total Targets: {analytics.summary.total_targets}</p>
            <p>Conversions: {analytics.summary.converted_users}</p>
            <p>Conv Rate: {analytics.summary.conversion_rate.toFixed(2)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
```
- [ ] Dashboard page created
- [ ] Components render without errors

### 2. Add Admin Menu Item

Update `src/components/Sidebar.tsx`:
```typescript
// Add to navigation
{
  label: 'Marketing AI',
  submenu: [
    { label: 'Dashboard', path: '/marketing' },
    { label: 'Campaigns', path: '/marketing/campaigns' },
    { label: 'Segments', path: '/marketing/segments' },
  ]
}
```
- [ ] Menu item added
- [ ] Routes configured

### 3. Add Route

Update `src/App.tsx`:
```typescript
import { MarketingDashboardPage } from './pages/MarketingDashboardPage';

// In router
<Route path="/marketing" element={<MarketingDashboardPage />} />
```
- [ ] Route added
- [ ] Navigation works

### 4. Verify Admin Portal

```bash
# Start admin portal
npm start

# Check for:
# - Marketing menu appears
# - Dashboard loads
# - Campaigns display
# - No console errors
```
- [ ] Admin portal starts
- [ ] Marketing menu visible
- [ ] Dashboard loads data

---

## 📊 Testing Checklist

### Unit Tests
- [ ] BehaviorAnalyzer tests
- [ ] CampaignBuilder tests
- [ ] UserSegmentationEngine tests
- [ ] MarketingAPIService tests

### Integration Tests
- [ ] Database connections work
- [ ] API endpoints respond
- [ ] Campaigns created successfully
- [ ] Users targeted correctly
- [ ] Conversions recorded

### End-to-End Tests
```bash
# 1. Trigger analysis
curl -X POST http://localhost:8000/api/marketing/analysis/run-now

# 2. Check campaigns created
curl http://localhost:8000/api/marketing/campaigns

# 3. View segments
curl http://localhost:8000/api/marketing/segments

# 4. Check analytics
curl http://localhost:8000/api/marketing/analytics

# 5. Mobile app loads campaigns
# (Check browser console)

# 6. Admin portal shows dashboard
# (Visual verification)
```
- [ ] All 6 steps complete successfully
- [ ] No errors in any step

### Load Testing
- [ ] Test with 1000+ users
- [ ] Test with multiple campaigns
- [ ] Verify database performance
- [ ] Check API response times

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation reviewed
- [ ] Database backed up
- [ ] Environment variables configured
- [ ] API URLs updated for production

### Deployment Steps
1. [ ] Deploy backend to production
2. [ ] Verify database tables exist
3. [ ] Verify scheduler starts
4. [ ] Deploy mobile app
5. [ ] Deploy admin portal
6. [ ] Verify all connections work
7. [ ] Monitor logs for errors

### Post-Deployment
- [ ] Monitor scheduler logs
- [ ] Check campaign creation
- [ ] Verify conversions tracked
- [ ] Monitor API performance
- [ ] Check database disk usage
- [ ] Verify email/notifications work

---

## 📝 Documentation Checklist

- [ ] MARKETING_AI_IMPLEMENTATION.md reviewed
- [ ] MARKETING_AI_QUICK_REFERENCE.md reviewed
- [ ] MARKETING_AI_COMPLETE.md reviewed
- [ ] API documentation complete
- [ ] Setup guide distributed
- [ ] Team trained on system

---

## 🔒 Security Checklist

- [ ] Authentication added to API endpoints
- [ ] Rate limiting implemented
- [ ] SQL injection prevention
- [ ] User data encrypted
- [ ] GDPR compliance verified
- [ ] Audit logging enabled
- [ ] Error messages sanitized
- [ ] Environment variables secured

---

## 📞 Support Resources

### For Backend Issues
- Check `MARKETING_AI_IMPLEMENTATION.md` Troubleshooting section
- Review scheduler logs
- Verify database connection
- Test API endpoints directly

### For Mobile Issues
- Check network requests in developer tools
- Verify API URL configuration
- Clear app cache
- Check MarketingAPIService logs

### For Admin Portal Issues
- Check browser console
- Verify API connectivity
- Check user permissions
- Clear browser cache

---

## 🎉 Completion Criteria

- [ ] All files created/updated
- [ ] All tests passing
- [ ] All endpoints responding
- [ ] Database tables created
- [ ] Scheduler running
- [ ] Mobile app integrating campaigns
- [ ] Admin portal displaying dashboards
- [ ] Conversions being tracked
- [ ] Documentation complete
- [ ] Team trained

---

## ✨ Final Notes

Once all checklist items are complete:

1. **System is Live** ✅
2. **Campaigns Running Automatically** ✅
3. **Users Receiving Targeted Offers** ✅
4. **ROI Being Tracked** ✅
5. **Teams Have Visibility** ✅

---

**Status**: Ready for Integration  
**Estimated Setup Time**: 2-4 hours  
**Support**: Review documentation for most issues  
**Version**: 1.0.0

Good luck! 🚀
