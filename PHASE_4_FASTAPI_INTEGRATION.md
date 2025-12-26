# Phase 4 FastAPI Integration Guide
## Complete Setup Instructions

**Status**: Ready to integrate  
**Date**: December 26, 2025  
**Estimated Integration Time**: 30-45 minutes

---

## Overview

This guide covers integrating all Phase 4 services (analytics, A/B testing, ML optimization) into your existing FastAPI application.

### Files to Integrate
1. `analytics_service.py` - Core analytics service
2. `ab_testing_service.py` - A/B testing framework
3. `ml_optimizer.py` - ML optimization engine
4. `phase_4_routes.py` - API endpoints (20+)
5. `phase_4_scheduler.py` - Automated background jobs

### Total Additions
- **2,400+ lines** of Python production code
- **20+ new API endpoints**
- **5 automated background jobs**
- **11 database tables**

---

## Step 1: Copy Service Files

Copy all service files to your backend directory:

```bash
# Copy Python services
cp analytics_service.py /path/to/backend/services/
cp ab_testing_service.py /path/to/backend/services/
cp ml_optimizer.py /path/to/backend/services/
cp phase_4_routes.py /path/to/backend/routes/
cp phase_4_scheduler.py /path/to/backend/scheduler/
```

---

## Step 2: Install Dependencies

```bash
# Install ML and statistics libraries
pip install scikit-learn scipy pandas numpy

# Verify installation
python -c "import sklearn, scipy; print('✅ ML dependencies installed')"
```

---

## Step 3: Run Database Migration

```bash
# Connect to PostgreSQL
psql -U postgres -d merchants_db

# Run schema migration
\i phase_4_schema.sql

# Verify tables created
\dt | grep -E 'analytics|ab_test|ml_'

# Expected output:
# campaign_analytics_daily
# campaign_segment_analytics
# campaign_trend_data
# ab_tests
# ab_test_assignments
# ab_test_results
# ml_models
# model_feature_importance
# campaign_optimizations
# offer_optimization_history
# user_optimal_send_times
# user_merchant_affinity
```

---

## Step 4: Update FastAPI Main Application

Add to your `main.py` or `app.py`:

```python
from fastapi import FastAPI
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

# Import Phase 4 modules
from services.analytics_service import AnalyticsService
from services.ab_testing_service import ABTestingService
from services.ml_optimizer import MLOptimizationService
from routes.phase_4_routes import setup_phase4_routes
from scheduler.phase_4_scheduler import init_phase4_scheduler, stop_phase4_scheduler

# Database dependency (adjust based on your setup)
from database import get_db, engine

# FastAPI app with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db = Session(engine)
    try:
        init_phase4_scheduler(db)
    except Exception as e:
        print(f"⚠️ Warning: Scheduler initialization failed: {e}")
    finally:
        db.close()
    
    yield
    
    # Shutdown
    stop_phase4_scheduler()

app = FastAPI(
    title="SwipeSavvy AI Marketing",
    version="2.0",
    lifespan=lifespan
)

# Setup Phase 4 routes (20+ endpoints)
setup_phase4_routes(app)

# Other routes...
@app.get("/health")
async def health_check():
    return {"status": "operational"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Step 5: Create Dependency Functions

Add to your dependency injection module:

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from services.analytics_service import AnalyticsService
from services.ab_testing_service import ABTestingService
from services.ml_optimizer import MLOptimizationService
from database import get_db

def get_analytics_service(db: Session = Depends(get_db)) -> AnalyticsService:
    """Dependency for analytics service"""
    return AnalyticsService(db)

def get_ab_service(db: Session = Depends(get_db)) -> ABTestingService:
    """Dependency for A/B testing service"""
    return ABTestingService(db)

def get_ml_service(db: Session = Depends(get_db)) -> MLOptimizationService:
    """Dependency for ML optimization service"""
    return MLOptimizationService(db)
```

---

## Step 6: Verify Integration

Test the installation:

```bash
# Start FastAPI server
python -m uvicorn main:app --reload

# In another terminal, test endpoints
curl http://localhost:8000/api/phase4/health
```

Expected response:
```json
{
  "status": "operational",
  "version": "1.0",
  "services": {
    "analytics": "ready",
    "ab_testing": "ready",
    "ml_optimization": "ready"
  },
  "endpoints": {
    "analytics": 6,
    "ab_testing": 6,
    "optimization": 8
  },
  "timestamp": "2025-12-26T..."
}
```

---

## API Endpoints

### Analytics Endpoints (6)

```
GET  /api/analytics/campaign/{campaign_id}/metrics
GET  /api/analytics/campaign/{campaign_id}/segments
GET  /api/analytics/campaign/{campaign_id}/trends
GET  /api/analytics/campaign/{campaign_id}/roi
GET  /api/analytics/portfolio
GET  /api/analytics/top-campaigns
```

### A/B Testing Endpoints (6)

```
POST /api/ab-tests/create
GET  /api/ab-tests/{test_id}/status
POST /api/ab-tests/{test_id}/analyze
POST /api/ab-tests/{test_id}/end
GET  /api/ab-tests/assign-user/{test_id}/{user_id}
GET  /api/ab-tests/history
```

### Optimization Endpoints (8+)

```
POST /api/optimize/train-model
GET  /api/optimize/offer/{campaign_id}
GET  /api/optimize/send-time/{user_id}
GET  /api/optimize/affinity/{user_id}
GET  /api/optimize/recommendations/{campaign_id}
GET  /api/optimize/segments/{campaign_id}
```

---

## Scheduled Jobs

The Phase 4 scheduler automatically runs these jobs:

| Job | Schedule | Purpose |
|-----|----------|---------|
| Daily Analytics Aggregation | 2 AM UTC | Aggregate campaign metrics |
| Weekly Model Retraining | Mon 3 AM UTC | Retrain ML models |
| Merchant Affinity Update | Every 6 hours | Update user-merchant scores |
| Optimal Send Time Update | 4 AM UTC | Calculate user timing preferences |
| Campaign Optimization | 5 AM UTC | Generate recommendations |

---

## Testing

### Test Analytics Service

```python
import requests

# Get campaign metrics
response = requests.get(
    "http://localhost:8000/api/analytics/campaign/camp_123/metrics"
)
assert response.status_code == 200
assert "views" in response.json()
print("✅ Analytics service working")
```

### Test A/B Testing Service

```python
# Create test
response = requests.post(
    "http://localhost:8000/api/ab-tests/create",
    json={
        "test_name": "Offer A/B Test",
        "control_campaign_id": "camp_control",
        "variant_campaign_id": "camp_variant",
        "target_sample_size": 1000,
        "confidence_level": 0.95
    }
)
assert response.status_code == 200
test_id = response.json()["test_id"]
print(f"✅ A/B test created: {test_id}")
```

### Test ML Optimization Service

```python
# Optimize offer
response = requests.get(
    "http://localhost:8000/api/optimize/offer/camp_123"
)
assert response.status_code == 200
assert "recommendation" in response.json()
print("✅ ML optimization working")
```

---

## Environment Variables

Add to your `.env` file if needed:

```env
# Phase 4 Configuration
PHASE4_ENABLE_SCHEDULER=true
PHASE4_DB_HOST=localhost
PHASE4_DB_PORT=5432
PHASE4_DB_NAME=merchants_db
PHASE4_DB_USER=postgres
PHASE4_MODEL_PATH=/path/to/models
```

---

## Performance Monitoring

Monitor Phase 4 performance:

```python
from sqlalchemy import text

# Check daily aggregation status
db.execute(text("""
    SELECT 
        COUNT(*) as records,
        MAX(date) as latest_date,
        AVG(views) as avg_views
    FROM campaign_analytics_daily
""")).scalar()

# Check scheduled job status
scheduler_instance.get_jobs()  # Returns list of running jobs
```

---

## Troubleshooting

### Issue: Model training fails

```
Solution: Ensure at least 10 campaigns with views
Command: SELECT COUNT(*) FROM campaigns WHERE created_at > NOW() - INTERVAL '90 days'
```

### Issue: Analytics queries are slow

```
Solution: Check indexes and database statistics
Commands:
  ANALYZE campaign_analytics_daily;
  REINDEX INDEX idx_analytics_campaign_date;
```

### Issue: A/B test shows insufficient data

```
Solution: Increase sample size or test duration
Check: SELECT COUNT(*) FROM ab_test_assignments WHERE test_id = 'test_id'
```

---

## Next Steps

1. **API Testing**: Thoroughly test all 20+ endpoints
2. **Dashboard Creation**: Build React components for analytics visualization
3. **Load Testing**: Stress test with 1000+ campaigns
4. **Production Deployment**: Deploy to staging then production

---

## Integration Checklist

- [ ] All service files copied to backend
- [ ] Dependencies installed (scikit-learn, scipy)
- [ ] Database migration completed
- [ ] main.py updated with Phase 4 imports
- [ ] Dependency injection configured
- [ ] Health check endpoint tested
- [ ] All 20+ API endpoints functional
- [ ] Scheduler running and logging
- [ ] Database tables verified
- [ ] Performance benchmarks met

---

## Support

For issues or questions, refer to:
- `PHASE_4_IMPLEMENTATION_GUIDE.md` - Complete documentation
- `PHASE_4_STARTUP_REPORT.txt` - Status and specifications
- `analytics_service.py` - Service docstrings
- `ab_testing_service.py` - Statistical details
- `ml_optimizer.py` - ML model information

