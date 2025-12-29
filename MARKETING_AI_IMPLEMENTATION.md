# Marketing AI Service - Complete Implementation Guide

## 🎯 Overview

This guide documents the complete Marketing AI Service implementation that automatically analyzes user behavioral data and creates targeted marketing campaigns using intelligent scheduling.

## 📋 Architecture

### System Components

```
Marketing AI Service
├── BehaviorAnalyzer
│   ├── Analyze transactional behavior
│   ├── Detect geographic patterns
│   ├── Track spending trends
│   └── Identify shop locations
│
├── CampaignBuilder
│   ├── VIP/High Spender Campaigns
│   ├── Loyalty Campaigns
│   ├── Location-Based Campaigns
│   ├── Re-engagement Campaigns
│   ├── Welcome Campaigns
│   └── Spending Milestone Campaigns
│
├── UserSegmentationEngine
│   ├── Pattern matching
│   ├── Criteria validation
│   └── User targeting
│
└── MarketingAIService (Main Service)
    ├── Initialize connections
    ├── Run analysis cycles
    ├── Save campaigns to DB
    └── Track analytics
```

### Scheduler Integration

```
APScheduler
├── Marketing Analysis Job
│   └── Runs daily at 2:00 AM (configurable)
│       └── Analyzes 1000+ users
│       └── Creates up to 7 campaigns
│
└── Campaign Cleanup Job
    └── Runs daily at 3:00 AM (configurable)
        └── Marks expired campaigns
```

## 🔍 Behavioral Pattern Detection

### Patterns Detected

| Pattern | Criteria | Campaign Focus |
|---------|----------|-----------------|
| **HIGH_SPENDER** | Total spent > $5,000 | VIP benefits, exclusive rewards |
| **FREQUENT_SHOPPER** | Transactions > 20 | Loyalty points, bonus multipliers |
| **LOCATION_CLUSTERED** | Uses 1-2 locations | Location-specific promotions |
| **SEASONAL_SPENDER** | Spending trend > 20% | Milestone rewards, seasonal offers |
| **INACTIVE** | No activity > 30 days | Re-engagement discounts |
| **NEW_SHOPPER** | < 5 transactions, active < 10 days | Welcome bonuses |
| **CATEGORY_FOCUSED** | Default pattern | Category-specific promotions |

### Data Analysis Dimensions

1. **Transactional Behavior**
   - Total spending amount
   - Transaction frequency
   - Average transaction size
   - Category preferences

2. **Geographic Patterns**
   - Primary shopping locations
   - Location frequency
   - Geographic clusters
   - Location loyalty

3. **Spending Trends**
   - Trend direction (increasing/decreasing)
   - Seasonality detection
   - Spending velocity
   - Milestone tracking

4. **Shop Frequency**
   - Visits per location
   - Location preference distribution
   - Multi-location engagement
   - Location retention

## 🎬 Campaign Types

### 1. VIP Campaign
- **Target**: High spenders (> $5,000 total)
- **Offer**: 5% cashback
- **Duration**: 30 days
- **Impact**: Premium user retention

### 2. Loyalty Campaign
- **Target**: Frequent shoppers (> 20 transactions)
- **Offer**: 10 bonus points per $1 spent
- **Duration**: 60 days
- **Impact**: Engagement increase

### 3. Location-Based Campaign
- **Target**: Location-clustered users
- **Offer**: 15% discount at primary location
- **Duration**: 30 days
- **Impact**: Location-specific traffic

### 4. Re-engagement Campaign
- **Target**: Inactive users (> 30 days)
- **Offer**: 20% discount
- **Duration**: 14 days
- **Impact**: Win-back inactive users

### 5. Welcome Campaign
- **Target**: New shoppers (< 5 transactions)
- **Offer**: 25% discount
- **Duration**: 21 days
- **Impact**: First-time buyer conversion

### 6. Spending Milestone Campaign
- **Target**: Seasonal spenders (> 20% trend)
- **Offer**: $50 bonus at $1,000 spend
- **Duration**: 90 days
- **Impact**: Increase spending magnitude

## 📊 Database Schema

### marketing_campaigns Table

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
```

### campaign_targets Table

```sql
CREATE TABLE campaign_targets (
    target_id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES marketing_campaigns(campaign_id),
    user_id VARCHAR(255),
    status VARCHAR(50),
    viewed_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    created_at TIMESTAMP
);
```

### campaign_performance Table

```sql
CREATE TABLE campaign_performance (
    performance_id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES marketing_campaigns(campaign_id),
    total_targets INT,
    views INT,
    conversions INT,
    conversion_rate DECIMAL(5,2),
    revenue_generated DECIMAL(12,2),
    created_at TIMESTAMP
);
```

## 🚀 API Endpoints

### Campaign Management

```
GET  /api/marketing/campaigns
     List all campaigns with filters
     Query params: status, campaign_type, limit, offset

GET  /api/marketing/campaigns/{campaign_id}
     Get detailed campaign with analytics

POST /api/marketing/campaigns/manual
     Create a campaign manually
     Body: {name, type, description, offer_type, offer_value, offer_unit, criteria}

GET  /api/marketing/analytics
     Get overall marketing analytics
```

### User Segmentation

```
GET  /api/marketing/segments
     List all user segments by behavior pattern
     Query params: min_size, limit

GET  /api/marketing/segments/{pattern}
     Get detailed segment information
     Returns: user_ids, metrics, top categories, top locations
```

### Scheduler Control

```
POST /api/marketing/analysis/run-now
     Trigger marketing analysis immediately
     Returns: analysis results and created campaigns

POST /api/marketing/cleanup/run-now
     Trigger campaign cleanup immediately

GET  /api/marketing/status
     Get current system status
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=swipesavvy_agents
DB_USER=postgres
DB_PASSWORD=password

# Scheduler (times in 24-hour format)
MARKETING_ANALYSIS_HOUR=2          # 2:00 AM
MARKETING_ANALYSIS_MINUTE=0
CAMPAIGN_CLEANUP_HOUR=3            # 3:00 AM
CAMPAIGN_CLEANUP_MINUTE=0
```

### Customizing Schedules

Edit `app/scheduler/marketing_jobs.py`:

```python
# Change analysis time to 6:00 PM daily
scheduler.add_job(
    run_marketing_analysis,
    CronTrigger(hour=18, minute=0),  # 6 PM
    id='marketing_analysis'
)
```

## 📱 Mobile App Integration

### Display Marketing Campaigns

Add to mobile app's home screen:

```typescript
import { useEffect, useState } from 'react';
import axios from 'axios';

export function MarketingCampaignsBanner() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/marketing/campaigns?status=active&limit=3')
      .then(res => setCampaigns(res.data.campaigns))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="campaigns-banner">
      {campaigns.map(campaign => (
        <div key={campaign.campaign_id} className="campaign-card">
          <h3>{campaign.campaign_name}</h3>
          <p>{campaign.description}</p>
          <p className="offer">
            {campaign.offer_value}{campaign.offer_unit === 'percentage' ? '%' : '$'} {campaign.offer_type}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### Track Campaign Conversions

```typescript
// When user makes a purchase after viewing campaign
async function recordCampaignConversion(campaignId: number, userId: string) {
  await axios.post(
    `http://localhost:8000/api/marketing/campaigns/${campaignId}/convert`,
    { user_id: userId }
  );
}
```

## 📈 Performance Metrics

### Key Metrics Tracked

1. **Campaign Metrics**
   - Total targets per campaign
   - Views/impressions
   - Conversions
   - Conversion rate
   - Revenue generated

2. **Segment Metrics**
   - Segment size
   - Total spending
   - Average transaction size
   - Category distribution

3. **System Metrics**
   - Analysis cycles completed
   - Campaigns generated
   - Average targeting accuracy
   - System performance

## 🔄 Analysis Cycle Flow

```
START Analysis Cycle
│
├─→ 1. Analyze User Behaviors (max 1000 users)
│   └─→ Load transaction data (90-day lookback)
│   └─→ Calculate behavioral metrics
│   └─→ Detect patterns
│
├─→ 2. Create Campaigns
│   └─→ Generate VIP campaign if needed
│   └─→ Generate Loyalty campaign if needed
│   └─→ Generate Location campaigns (up to 5)
│   └─→ Generate Re-engagement campaign if needed
│   └─→ Generate Welcome campaign if needed
│   └─→ Generate Milestone campaign if needed
│
├─→ 3. Segment Users
│   └─→ Match users to campaign criteria
│   └─→ Calculate targeting precision
│   └─→ Prepare user lists
│
├─→ 4. Save to Database
│   └─→ Insert campaigns
│   └─→ Insert campaign targets
│   └─→ Insert performance records
│
└─→ END: Return results
```

## 🛠 Installation & Setup

### 1. Add Dependencies

```bash
pip install apscheduler>=3.10.4
pip install psycopg2-binary>=2.9.0
```

### 2. Create Database Tables

```sql
-- Run these in swipesavvy_agents database

CREATE TABLE IF NOT EXISTS marketing_campaigns (
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
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_targets (
    target_id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES marketing_campaigns(campaign_id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'eligible',
    viewed_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_targets_campaign ON campaign_targets(campaign_id);
CREATE INDEX idx_campaign_targets_user ON campaign_targets(user_id);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
```

### 3. Update main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.routes import support, marketing  # Add marketing
from app.scheduler.marketing_jobs import initialize_scheduler  # Add

# Initialize FastAPI
app = FastAPI(title="SwipeSavvy AI Agents", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(support.router)
app.include_router(marketing.router)  # Add

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting MarketingAI Agents...")
    initialize_scheduler()  # Add

@app.on_event("shutdown")
async def shutdown_event():
    scheduler = get_scheduler()  # Add
    if scheduler:
        scheduler.shutdown()  # Add

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🧪 Testing the Service

### Test Behavioral Analysis

```bash
curl -X GET "http://localhost:8000/api/marketing/segments"
```

Expected response:
```json
{
  "status": "success",
  "total_users_analyzed": 523,
  "segment_count": 7,
  "segments": [
    {
      "pattern": "high_spender",
      "size": 145,
      "total_spending": 850000,
      "avg_spending": 5862.07,
      "percentage": 27.7
    }
  ]
}
```

### Test Campaign Creation

```bash
curl -X POST "http://localhost:8000/api/marketing/analysis/run-now"
```

### Test Campaign List

```bash
curl -X GET "http://localhost:8000/api/marketing/campaigns?status=active"
```

## 📊 Admin Portal Integration

Create new admin page `src/pages/MarketingDashboardPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function MarketingDashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    fetchCampaigns();
    fetchSegments();
  }, []);

  const fetchCampaigns = async () => {
    const res = await fetch('http://localhost:8000/api/marketing/campaigns?limit=10');
    const data = await res.json();
    setCampaigns(data.campaigns);
  };

  const fetchSegments = async () => {
    const res = await fetch('http://localhost:8000/api/marketing/segments?limit=10');
    const data = await res.json();
    setSegments(data.segments);
  };

  return (
    <div className="marketing-dashboard">
      <h1>Marketing AI Dashboard</h1>
      
      {/* Active Campaigns */}
      <div className="campaigns-grid">
        {campaigns.map(campaign => (
          <div key={campaign.campaign_id} className="campaign-card">
            <h3>{campaign.campaign_name}</h3>
            <p>{campaign.campaign_type}</p>
            <p>Targets: {campaign.total_targets}</p>
          </div>
        ))}
      </div>

      {/* User Segments */}
      <div className="segments-chart">
        <h2>User Segments by Behavior</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={segments}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pattern" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="size" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

## 🔐 Security Considerations

1. **Authentication**
   - All API endpoints should require authentication
   - Use JWT tokens for API access

2. **Data Privacy**
   - Never expose personal user information in API responses
   - Hash sensitive data
   - Implement GDPR compliance

3. **Rate Limiting**
   - Limit API requests per user
   - Implement exponential backoff
   - Cache frequently accessed data

## 🐛 Troubleshooting

### Issue: Scheduler not running
**Solution**: Check logs for startup errors, verify APScheduler is installed

### Issue: No campaigns generated
**Solution**: Ensure transaction data exists in swipesavvy_agents database

### Issue: Database connection fails
**Solution**: Verify database credentials in .env file

### Issue: Low conversion rates
**Solution**: Adjust offer values, targeting criteria, or campaign duration

## 📚 Related Documentation

- [API_AND_ADMIN_INTEGRATION.md](./API_AND_ADMIN_INTEGRATION.md) - Support system integration
- [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) - Database configuration
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development setup

## 🎓 Key Concepts

### Behavioral Pattern Detection
The system analyzes user transaction history to identify distinct behavioral patterns. Each pattern triggers specific marketing campaigns optimized for that user segment.

### Automated Campaign Creation
Rather than manually creating campaigns, the AI system automatically generates targeted campaigns based on detected user patterns and spending behaviors.

### Smart User Targeting
Campaigns automatically identify and target only users who match specific criteria, improving conversion rates and ROI.

### Continuous Analysis
The scheduler runs periodic analysis cycles to continuously update segments and create new campaigns based on evolving user behaviors.

## 🚦 Next Steps

1. Deploy to production environment
2. Configure database with production credentials
3. Set up monitoring and alerts
4. Create admin portal UI for campaign management
5. Implement mobile app campaign display
6. Track conversion metrics and optimize campaigns

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: ✅ Complete and Ready for Integration
