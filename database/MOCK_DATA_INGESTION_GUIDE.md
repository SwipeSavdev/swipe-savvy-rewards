# Mock Data Ingestion Guide

## Overview

This guide explains how to populate the SwipeSavvy database with realistic sample data derived from actual merchant and payment transaction data.

**Source Data:**
- `MerchantList-North.csv` - 50+ merchants with location and contact info
- `PaymentSummary-North(12_1_2020-12_25_2025).csv` - Transaction data spanning 5 years

**Generated Tables:**
- ✅ `campaign_analytics_daily` - 90 days of daily metrics (4,500+ records)
- ✅ `campaign_analytics_segments` - Segment-level analytics (27,000+ records)
- ✅ `ab_tests` - 20 A/B test configurations
- ✅ `ab_test_assignments` - User assignments to tests (20,000+ records)
- ✅ `user_merchant_affinity` - User preferences (15,000+ records)
- ✅ `user_optimal_send_times` - Send time optimizations (500 users)
- ✅ `campaign_optimizations` - Recommendations (100+ records)

---

## Prerequisites

### 1. Database Setup
Ensure the database is initialized with the schema:

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app/database
./init_database.sh production
```

### 2. Python Dependencies

Install required packages:

```bash
pip install psycopg2-binary
```

### 3. Environment Variables

The ingestion script uses these PostgreSQL connection settings (defaults provided):

```bash
DB_HOST=localhost          # PostgreSQL host
DB_PORT=5432              # PostgreSQL port
DB_NAME=swipesavvy_db     # Database name
DB_USER=swipesavvy_backend # Database user
DB_PASSWORD=secure_password_123  # Database password
```

For production, set environment variables:

```bash
export DB_HOST=prod-db.example.com
export DB_PASSWORD=your_production_password
```

---

## Quick Start

### Option 1: Using the Shell Wrapper (Recommended)

```bash
chmod +x /Users/macbookpro/Documents/swipesavvy-mobile-app/database/ingest_mock_data.sh
./ingest_mock_data.sh
```

### Option 2: Direct Python Execution

```bash
python3 /Users/macbookpro/Documents/swipesavvy-mobile-app/database/ingest_mock_data.py
```

### Option 3: Docker Container

```bash
docker run -e DB_HOST=host.docker.internal \
  -v /Users/macbookpro/Documents/swipesavvy-mobile-app:/app \
  python:3.11 \
  bash -c "pip install psycopg2-binary && python /app/database/ingest_mock_data.py"
```

---

## Data Generation Details

### Campaign Analytics Daily (90 days × 50 campaigns)

**Record Count:** ~4,500

**Metrics Generated:**
- Impressions: 1,000-10,000 per day
- Clicks: 2-8% of impressions
- Conversions: 5-20% of clicks
- Revenue: $25-150 per conversion
- ROI, CTR, Conversion Rate, AOV: Calculated

**Sample Query:**
```sql
SELECT campaign_id, date, impressions, clicks, conversions, revenue, roi
FROM campaign_analytics_daily
ORDER BY date DESC, roi DESC
LIMIT 10;
```

### Segment Analytics (6 segments × 50 campaigns × 90 days)

**Record Count:** ~27,000

**Segments:** age_18_25, age_26_35, age_36_45, age_45plus, mobile, desktop

**Metrics:**
- User counts per segment
- Conversions
- Revenue
- Retention rates

**Sample Query:**
```sql
SELECT campaign_id, segment_name, date, users_count, conversions, revenue
FROM campaign_analytics_segments
WHERE segment_name = 'mobile'
ORDER BY date DESC
LIMIT 20;
```

### A/B Tests (20 tests)

**Record Count:** 20

**Test Structure:**
- Control group + 2 variants (A/B)
- 95% confidence level
- 80% statistical power
- Sample sizes: 1,000-10,000 users
- Statuses: running, completed, paused

**Sample Query:**
```sql
SELECT id, name, status, sample_size, confidence_level, start_date, end_date
FROM ab_tests
WHERE status = 'running'
ORDER BY created_at DESC;
```

### A/B Test Assignments (20,000+ records)

**Record Count:** ~20,000 (test_id × user_count)

**Structure:**
- Links users to test variants
- Random variant assignment (control/A/B)
- Tracks assignment timestamp

**Sample Query:**
```sql
SELECT test_id, variant_assigned, COUNT(*) as user_count
FROM ab_test_assignments
GROUP BY test_id, variant_assigned
ORDER BY test_id;
```

### User Merchant Affinity (15,000+ records)

**Record Count:** ~15,000 (500 users × 30 merchants)

**Metrics:**
- Affinity scores: 0.0-1.0
- Interaction counts: 0-50
- Purchase counts: 0-20
- Average transaction value: $10-200

**Use Cases:**
- Personalized merchant recommendations
- User preference tracking
- Merchant analytics

**Sample Query:**
```sql
SELECT user_id, merchant_id, affinity_score, purchase_count, avg_transaction_value
FROM user_merchant_affinity
WHERE affinity_score > 0.7
ORDER BY affinity_score DESC
LIMIT 50;
```

### Optimal Send Times (500 records)

**Record Count:** 500 unique users

**Metrics:**
- Optimal hour: 9-20 (business hours)
- Optimal day: 0-6 (Sunday-Saturday)
- Confidence score: 0.6-0.99
- Open rates by time period
- Engagement score

**Use Cases:**
- Optimal notification timing
- Email send time optimization
- Campaign scheduling

**Sample Query:**
```sql
SELECT user_id, optimal_hour, optimal_day_of_week, confidence_score, engagement_score
FROM user_optimal_send_times
WHERE confidence_score > 0.8
ORDER BY engagement_score DESC
LIMIT 20;
```

### Campaign Optimizations (100+ recommendations)

**Record Count:** 100-150

**Recommendation Types:**
- offer: Pricing/discount adjustments
- timing: Send time optimization
- audience: Segment targeting changes
- creative: Message/visual changes
- channel: Distribution channel changes

**Metrics:**
- Confidence score: 0.6-0.99
- Potential uplift: 5-50%
- Implementation effort: low/medium/high
- Priority: 1-10

**Sample Query:**
```sql
SELECT campaign_id, recommendation_type, recommendation_text, 
       confidence_score, potential_uplift_percent, priority
FROM campaign_optimizations
ORDER BY priority DESC, confidence_score DESC
LIMIT 20;
```

---

## Verification Commands

### Check Total Records Inserted

```sql
-- Campaign Analytics
SELECT 'campaign_analytics_daily' as table_name, COUNT(*) as record_count 
FROM campaign_analytics_daily
UNION ALL
SELECT 'campaign_analytics_segments', COUNT(*) FROM campaign_analytics_segments
UNION ALL
SELECT 'ab_tests', COUNT(*) FROM ab_tests
UNION ALL
SELECT 'ab_test_assignments', COUNT(*) FROM ab_test_assignments
UNION ALL
SELECT 'user_merchant_affinity', COUNT(*) FROM user_merchant_affinity
UNION ALL
SELECT 'user_optimal_send_times', COUNT(*) FROM user_optimal_send_times
UNION ALL
SELECT 'campaign_optimizations', COUNT(*) FROM campaign_optimizations;
```

### View Sample Data

```bash
# Campaign analytics
psql -U swipesavvy_backend -d swipesavvy_db \
  -c "SELECT * FROM campaign_analytics_daily LIMIT 5;"

# A/B tests
psql -U swipesavvy_backend -d swipesavvy_db \
  -c "SELECT id, name, status, sample_size FROM ab_tests LIMIT 5;"

# User affinity
psql -U swipesavvy_backend -d swipesavvy_db \
  -c "SELECT * FROM user_merchant_affinity WHERE affinity_score > 0.8 LIMIT 5;"
```

### Check Database Size

```bash
psql -U swipesavvy_backend -d swipesavvy_db \
  -c "SELECT pg_size_pretty(pg_database_size('swipesavvy_db')) as database_size;"
```

---

## Troubleshooting

### Connection Refused

**Error:** `psycopg2.OperationalError: could not connect to server`

**Solution:**
1. Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Check database exists: `psql -l | grep swipesavvy_db`
3. Verify credentials in `.env` file

### Permission Denied

**Error:** `permission denied for schema public`

**Solution:**
```bash
# Re-initialize database with proper permissions
./init_database.sh production
```

### Out of Memory

**Error:** `out of memory` during segment analytics generation

**Solution:**
Edit `ingest_mock_data.py` and reduce batch sizes:
```python
batch_size = 500  # Reduce from 1000
```

### Duplicate Key Violations

**Error:** `duplicate key value violates unique constraint`

**Solution:**
The script includes `ON CONFLICT DO UPDATE` clauses. Run again safely or clear data:
```sql
DELETE FROM campaign_analytics_daily;
DELETE FROM campaign_analytics_segments;
-- etc.
```

---

## Advanced Usage

### Custom Data Generation

Modify the generator methods in `ingest_mock_data.py`:

```python
# Example: Generate 180 days instead of 90
def generate_campaign_analytics(self, merchants, start_date=None):
    # Change: for day_offset in range(180):
    ...
```

### Selective Ingestion

Run Python script with custom logic:

```python
from database.ingest_mock_data import MockDataIngester

ingester = MockDataIngester()
ingester.connect()

# Generate only campaign analytics
analytics = ingester.generate_campaign_analytics(merchants)
ingester.insert_campaign_analytics(analytics)

ingester.disconnect()
```

### Direct CSV Import (PostgreSQL)

For very large datasets, use native PostgreSQL COPY:

```sql
\COPY campaign_analytics_daily FROM 'data.csv' WITH (FORMAT CSV, HEADER);
```

---

## Performance Metrics

Expected ingestion times on modern hardware:

| Operation | Records | Time |
|-----------|---------|------|
| Campaign Analytics | 4,500 | ~5 sec |
| Segment Analytics | 27,000 | ~30 sec |
| A/B Tests | 20 | <1 sec |
| A/B Assignments | 20,000 | ~20 sec |
| User Affinity | 15,000 | ~15 sec |
| Send Times | 500 | ~2 sec |
| Optimizations | 100+ | ~1 sec |
| **Total** | **~67,000** | **~75 sec** |

**Database Size After Ingestion:** ~50-100 MB

---

## Cleanup & Reset

### Delete All Mock Data

```bash
cat << 'EOF' | psql -U swipesavvy_backend -d swipesavvy_db

DELETE FROM campaign_optimizations;
DELETE FROM user_optimal_send_times;
DELETE FROM user_merchant_affinity;
DELETE FROM ab_test_assignments;
DELETE FROM ab_test_results;
DELETE FROM ab_tests;
DELETE FROM campaign_analytics_segments;
DELETE FROM campaign_analytics_daily;

SELECT 'Data cleared' as status;

EOF
```

### Reinitialize Database

```bash
./init_database.sh production  # Clears and reinitializes all tables
./ingest_mock_data.sh           # Repopulates with fresh data
```

---

## Integration with Applications

### Backend (Node.js/TypeScript)

```typescript
import { query } from './database-config';

// Query analytics
const analytics = await query(
  'SELECT * FROM campaign_analytics_daily WHERE campaign_id = $1 ORDER BY date DESC',
  [campaignId]
);

// Use in API
app.get('/api/analytics/campaign/:id/metrics', async (req, res) => {
  const data = await query(
    'SELECT * FROM campaign_analytics_daily WHERE campaign_id = $1',
    [req.params.id]
  );
  res.json(data.rows);
});
```

### Mobile App (React Native)

```typescript
// Fetch optimizations
const optimizations = await fetch(
  `${API_URL}/api/optimize/recommendations/${campaignId}`
).then(r => r.json());

// Display in UI
optimizations.forEach(opt => {
  console.log(`${opt.recommendation_type}: ${opt.recommendation_text}`);
});
```

### Admin Portal (React)

```typescript
// Dashboard queries
const dashboardData = {
  analytics: await fetchAnalytics(),
  abTests: await fetchAbTests(),
  recommendations: await fetchRecommendations(),
};
```

---

## Next Steps

1. ✅ **Run ingestion** - `./ingest_mock_data.sh`
2. ✅ **Verify data** - Run verification queries above
3. ✅ **Test applications** - Run backend, mobile, admin to verify connectivity
4. ✅ **Monitor performance** - Check query times and database size
5. ✅ **Schedule jobs** - Set up scheduled aggregation jobs (2AM, 3AM, etc.)

---

## Support & Documentation

For more information, see:
- [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md) - Complete setup procedures
- [DATABASE_SETUP_CHECKLIST.md](DATABASE_SETUP_CHECKLIST.md) - Verification procedures
- [swipesavvy_complete_schema.sql](swipesavvy_complete_schema.sql) - Schema definition

---

**Generated:** December 26, 2025
**Status:** ✅ READY FOR PRODUCTION

