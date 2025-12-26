# Marketing AI Service - Quick Reference

## 🚀 Quick Start

### Enable Marketing AI in Backend

1. **Add to `app/main.py`**:
```python
from app.routes import marketing
from app.scheduler.marketing_jobs import initialize_scheduler

app.include_router(marketing.router)

@app.on_event("startup")
async def startup():
    initialize_scheduler()
```

2. **Create Database Tables**:
```sql
CREATE TABLE marketing_campaigns (
    campaign_id SERIAL PRIMARY KEY,
    campaign_name VARCHAR(255),
    campaign_type VARCHAR(50),
    description TEXT,
    offer_type VARCHAR(50),
    offer_value DECIMAL(10,2),
    offer_unit VARCHAR(20),
    target_pattern VARCHAR(100),
    target_location VARCHAR(255),
    qualifying_criteria JSONB,
    duration_days INT,
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE campaign_targets (
    target_id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES marketing_campaigns(campaign_id),
    user_id VARCHAR(255),
    status VARCHAR(50),
    viewed_at TIMESTAMP,
    converted_at TIMESTAMP,
    created_at TIMESTAMP
);
```

3. **Install Dependencies**:
```bash
pip install apscheduler>=3.10.4
```

## 📡 API Endpoints

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/marketing/campaigns` | List campaigns |
| GET | `/api/marketing/campaigns/{id}` | Get campaign details |
| POST | `/api/marketing/campaigns/manual` | Create manual campaign |

### Segments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/marketing/segments` | List user segments |
| GET | `/api/marketing/segments/{pattern}` | Get segment details |

### Analytics & Control

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/marketing/analytics` | Get overall analytics |
| GET | `/api/marketing/status` | System status |
| POST | `/api/marketing/analysis/run-now` | Trigger analysis |
| POST | `/api/marketing/cleanup/run-now` | Trigger cleanup |

## 📊 Behavioral Patterns

```
HIGH_SPENDER        → 5% cashback (VIP)
FREQUENT_SHOPPER    → 10 bonus points per $1
LOCATION_CLUSTERED  → 15% location discount
SEASONAL_SPENDER    → $50 spending milestone
INACTIVE            → 20% re-engagement discount
NEW_SHOPPER         → 25% welcome discount
CATEGORY_FOCUSED    → Category promotions
```

## 🔧 Configuration

```bash
# .env file
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=swipesavvy_agents
DB_USER=postgres
DB_PASSWORD=password

# Scheduler times (24-hour format)
MARKETING_ANALYSIS_HOUR=2
MARKETING_ANALYSIS_MINUTE=0
CAMPAIGN_CLEANUP_HOUR=3
CAMPAIGN_CLEANUP_MINUTE=0
```

## 📱 Mobile App Integration

```typescript
// Fetch active campaigns
const response = await fetch('http://localhost:8000/api/marketing/campaigns?status=active');
const { campaigns } = await response.json();

// Display campaigns
campaigns.forEach(campaign => {
  console.log(`${campaign.campaign_name}: ${campaign.offer_value}${campaign.offer_unit}`);
});
```

## 🧪 Test Commands

```bash
# List campaigns
curl http://localhost:8000/api/marketing/campaigns

# Get segments
curl http://localhost:8000/api/marketing/segments

# Trigger analysis
curl -X POST http://localhost:8000/api/marketing/analysis/run-now

# Get status
curl http://localhost:8000/api/marketing/status
```

## 💾 Core Components

### `BehaviorAnalyzer`
Analyzes user transaction data and detects behavioral patterns.

### `CampaignBuilder`
Creates marketing campaigns based on detected patterns.

### `UserSegmentationEngine`
Matches users to campaigns and handles targeting criteria.

### `MarketingAIService`
Main service that coordinates analysis, campaign creation, and database storage.

### Scheduler Jobs
- `run_marketing_analysis()` - Daily analysis (2 AM default)
- `run_campaign_cleanup()` - Remove expired campaigns (3 AM default)

## 📈 Key Metrics

**Campaign Metrics**:
- Total targets
- Conversions
- Conversion rate
- Revenue generated

**Segment Metrics**:
- Segment size
- Total spending
- Avg transaction
- Top categories

## ⚙️ How It Works

```
1. Scheduler triggers analysis every day at 2 AM
2. BehaviorAnalyzer loads user transaction data (90-day window)
3. Detects behavioral patterns (7 different types)
4. CampaignBuilder creates targeted campaigns
5. UserSegmentationEngine matches users to campaigns
6. Campaigns saved to database with user targets
7. Marketing campaigns now active and ready to display
8. Scheduler cleanup removes expired campaigns at 3 AM
```

## 🎯 Campaign Creation Rules

| Pattern | Min Size | Campaign Created |
|---------|----------|------------------|
| HIGH_SPENDER | Any | VIP Campaign |
| FREQUENT_SHOPPER | Any | Loyalty Campaign |
| LOCATION_CLUSTERED | 3+ users per location | Location Campaigns |
| SEASONAL_SPENDER | Any | Milestone Campaign |
| INACTIVE | Any | Re-engagement Campaign |
| NEW_SHOPPER | Any | Welcome Campaign |

## 🔍 Behavioral Analysis

**Transactional Behavior**:
- Total spending amount
- Transaction frequency
- Average transaction size

**Geographic Patterns**:
- Top shopping locations
- Location frequency
- Location clustering

**Spending Trends**:
- Trend direction (up/down)
- Seasonality
- Spending velocity

**Shop Frequency**:
- Visits per location
- Multi-location engagement
- Location retention

## 📚 Files

| File | Purpose |
|------|---------|
| `app/services/marketing_ai.py` | Core AI service (1000+ lines) |
| `app/scheduler/marketing_jobs.py` | Scheduler jobs |
| `app/routes/marketing.py` | REST API endpoints |
| `MARKETING_AI_IMPLEMENTATION.md` | Full documentation |

## 🚨 Common Issues

**No campaigns generated?**
- Check transaction data exists in database
- Verify database connection
- Check scheduler logs

**Low conversion rates?**
- Adjust offer values in `CampaignBuilder`
- Modify targeting criteria
- Increase campaign duration

**Scheduler not running?**
- Verify APScheduler installed
- Check application startup logs
- Verify database connectivity

## 💡 Tips & Tricks

1. **Test Analysis Immediately**: Call `/api/marketing/analysis/run-now` to test without waiting for scheduler
2. **View User Segments**: Call `/api/marketing/segments` to see detected patterns
3. **Monitor Performance**: Check `/api/marketing/analytics` for conversion metrics
4. **Adjust Timing**: Edit `MARKETING_ANALYSIS_HOUR` to change analysis time
5. **Manual Campaigns**: Use `/api/marketing/campaigns/manual` for custom campaigns

## 🔄 Admin Portal Dashboard

Create `src/pages/MarketingDashboardPage.tsx`:
- Show active campaigns
- Display user segments
- Track conversion metrics
- Manage campaign lifecycle

## 🎓 Educational Resources

The Marketing AI Service demonstrates:
- **Pattern Recognition**: Detecting user behaviors from data
- **Automated Systems**: Scheduled task execution
- **Data Analysis**: Time-series analysis and trend detection
- **Targeting Logic**: Matching criteria to specific users
- **Campaign Generation**: Building personalized offers

---

**Status**: ✅ Ready to Deploy  
**Latest Version**: 1.0.0
