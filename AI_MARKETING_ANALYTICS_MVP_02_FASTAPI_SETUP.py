# AI Marketing Analytics - FastAPI Backend Setup (MVP-002 & MVP-003)
# Created: December 31, 2025
# Purpose: FastAPI project structure, middleware, and KPI endpoint

# ============================================================================
# FILE STRUCTURE TO CREATE:
# ============================================================================
# ai_marketing_analytics/
# ├── __init__.py
# ├── main.py (this file - FastAPI app)
# ├── config.py (environment variables, database connection)
# ├── dependencies.py (shared dependencies, auth)
# ├── middleware/
# │   ├── __init__.py
# │   ├── logging.py (structured JSON logging)
# │   ├── audit.py (audit trail middleware)
# │   └── error_handler.py (error handling)
# ├── models/
# │   ├── __init__.py
# │   ├── schemas.py (Pydantic models)
# │   └── database.py (SQLAlchemy models)
# ├── routers/
# │   ├── __init__.py
# │   ├── kpi.py (KPI endpoints)
# │   ├── campaigns.py (campaign endpoints)
# │   ├── recommendations.py (recommendation endpoints)
# │   └── drilldown.py (drilldown endpoints)
# ├── services/
# │   ├── __init__.py
# │   ├── kpi_service.py (KPI business logic)
# │   ├── recommendation_service.py (recommendation logic)
# │   └── audit_service.py (audit logging)
# ├── utils/
# │   ├── __init__.py
# │   ├── metrics.py (Prometheus metrics)
# │   ├── cache.py (Redis caching)
# │   └── llm_client.py (LLM integration)
# └── jobs/
#     ├── __init__.py
#     └── scheduler.py (APScheduler background jobs)

# ============================================================================
# 1. main.py - FastAPI Application Setup
# ============================================================================

from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import Counter, Histogram, Gauge
import logging
import time
import json
import uuid
from datetime import datetime
from contextlib import asynccontextmanager

# Import middleware & routers (created below)
# from ai_marketing_analytics.middleware.logging import StructuredLoggingMiddleware
# from ai_marketing_analytics.middleware.audit import AuditLoggingMiddleware
# from ai_marketing_analytics.routers import kpi, campaigns, recommendations
# from ai_marketing_analytics.utils.metrics import setup_prometheus

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# 2. Prometheus Metrics Setup
# ============================================================================

# Request metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_latency = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint'],
    buckets=(0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0)
)

db_latency = Histogram(
    'db_query_duration_ms',
    'Database query latency in milliseconds',
    ['query_type'],
    buckets=(10, 50, 100, 200, 500, 1000)
)

cache_hits = Counter(
    'cache_hits_total',
    'Total cache hits',
    ['endpoint']
)

# Business metrics
kpi_freshness = Gauge(
    'kpi_freshness_minutes',
    'Minutes since KPI data was last refreshed',
    ['campaign_id']
)

recommendation_count = Gauge(
    'recommendations_pending',
    'Number of pending recommendations',
    ['recommendation_type']
)

job_duration = Histogram(
    'background_job_duration_seconds',
    'Background job execution duration',
    ['job_name'],
    buckets=(1, 5, 10, 30, 60, 300)
)

# ============================================================================
# 3. Structured Logging Middleware
# ============================================================================

class StructuredLoggingMiddleware:
    """
    Middleware that logs all requests/responses in structured JSON format
    for easy parsing by observability tools.
    """
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Store request_id in request state for later use
        request.state.request_id = request_id
        
        try:
            response = await call_next(request)
            
            # Collect metrics
            latency_ms = int((time.time() - start_time) * 1000)
            latency_sec = latency_ms / 1000
            
            status_code = response.status_code
            request_count.labels(
                method=request.method,
                endpoint=request.url.path,
                status=status_code
            ).inc()
            
            request_latency.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(latency_sec)
            
            # Structured log
            log_entry = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "request_id": request_id,
                "method": request.method,
                "endpoint": request.url.path,
                "status_code": status_code,
                "latency_ms": latency_ms,
                "user_agent": request.headers.get("user-agent", "unknown"),
                "ip_address": request.client.host if request.client else None
            }
            
            logger.info(json.dumps(log_entry))
            
            return response
        
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            
            request_count.labels(
                method=request.method,
                endpoint=request.url.path,
                status=500
            ).inc()
            
            log_entry = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "request_id": request_id,
                "method": request.method,
                "endpoint": request.url.path,
                "status_code": 500,
                "latency_ms": latency_ms,
                "error": str(e)
            }
            
            logger.error(json.dumps(log_entry))
            raise

# ============================================================================
# 4. Audit Logging Middleware
# ============================================================================

class AuditLoggingMiddleware:
    """
    Middleware that logs all POST/PUT/DELETE requests for audit trail.
    Stores in pii_access_log and api_request_log tables.
    """
    def __init__(self, app, db):
        self.app = app
        self.db = db
    
    async def __call__(self, request: Request, call_next):
        response = await call_next(request)
        
        # Only log write operations
        if request.method in ['POST', 'PUT', 'DELETE']:
            # Insert into api_request_log
            # INSERT INTO api_request_log (...)
            # VALUES (request_id, method, endpoint, status, user_id, ...)
            pass
        
        return response

# ============================================================================
# 5. FastAPI Application
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("AI Marketing Analytics Backend starting...")
    # Initialize APScheduler, load cache, etc.
    yield
    # Shutdown
    logger.info("AI Marketing Analytics Backend shutting down...")

app = FastAPI(
    title="AI Marketing Analytics API",
    description="KPI dashboard and recommendation engine for SwipeSavvy",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add structured logging middleware
app.add_middleware(StructuredLoggingMiddleware)

# Include routers (will be created in separate files)
# app.include_router(kpi.router, prefix="/api/v1", tags=["KPI"])
# app.include_router(campaigns.router, prefix="/api/v1", tags=["Campaigns"])
# app.include_router(recommendations.router, prefix="/api/v1", tags=["Recommendations"])

# ============================================================================
# 6. Health Check Endpoint
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint for load balancer / monitoring."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0"
    }

# ============================================================================
# 7. KPI Endpoint (MVP-002)
# ============================================================================

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date

class KPIMetrics(BaseModel):
    """Response model for KPI endpoint."""
    campaign_id: int
    campaign_name: str
    measurement_date: date
    total_sends: int
    total_opens: int
    total_clicks: int
    total_conversions: int
    total_spend: float
    open_rate: float = Field(description="Percentage")
    click_rate: float
    conversion_rate: float
    cost_per_conversion: float
    roi: float = Field(description="Return on investment ratio")
    
    class Config:
        json_schema_extra = {
            "example": {
                "campaign_id": 123,
                "campaign_name": "Holiday Sale 2025",
                "measurement_date": "2025-12-31",
                "total_sends": 50000,
                "total_opens": 15000,
                "total_clicks": 3000,
                "total_conversions": 450,
                "total_spend": 2500.00,
                "open_rate": 30.00,
                "click_rate": 20.00,
                "conversion_rate": 15.00,
                "cost_per_conversion": 5.56,
                "roi": 2.5
            }
        }

@app.get("/api/v1/kpi", response_model=List[KPIMetrics])
async def get_kpi(
    campaign_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    request: Request = None
):
    """
    Get KPI metrics for campaigns.
    
    Query Parameters:
    - campaign_id: Filter by single campaign (optional)
    - start_date: Start of date range (optional, default: last 30 days)
    - end_date: End of date range (optional, default: today)
    
    Returns:
    - List of KPI metrics with open_rate, click_rate, conversion_rate, ROI
    
    Performance SLO: <100ms (p95)
    Cache: 30-minute TTL via Redis
    """
    
    # TODO: Implement actual query using fn_get_kpi_summary()
    # 1. Check Redis cache with cache_key = f"kpi:{campaign_id}:{start_date}:{end_date}"
    # 2. If cache hit, increment counter, return cached data
    # 3. If cache miss:
    #    a. Call function: SELECT * FROM fn_get_kpi_summary(...)
    #    b. Measure DB latency
    #    c. Store in Redis with 30-min TTL
    #    d. Return results
    
    # Placeholder response
    return [
        KPIMetrics(
            campaign_id=123,
            campaign_name="Holiday Sale 2025",
            measurement_date=date(2025, 12, 31),
            total_sends=50000,
            total_opens=15000,
            total_clicks=3000,
            total_conversions=450,
            total_spend=2500.00,
            open_rate=30.00,
            click_rate=20.00,
            conversion_rate=15.00,
            cost_per_conversion=5.56,
            roi=2.5
        )
    ]

# ============================================================================
# 8. Configuration & Dependencies
# ============================================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Read from environment or .env file
DATABASE_URL = "postgresql://user:password@localhost:5432/swipesavvy_agents"
REDIS_URL = "redis://localhost:6379"

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================================
# 9. Error Handler
# ============================================================================

from fastapi import HTTPException

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom error response format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "request_id": getattr(request.state, "request_id", None)
        }
    )

# ============================================================================
# 10. Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_config=None  # Use custom JSON logging
    )

# ============================================================================
# DEPLOYMENT NOTES
# ============================================================================
# 1. Install dependencies:
#    pip install fastapi uvicorn sqlalchemy psycopg2-binary redis pydantic prometheus-client apscheduler
#
# 2. Set environment variables (.env file):
#    DATABASE_URL=postgresql://user:password@localhost:5432/swipesavvy_agents
#    REDIS_URL=redis://localhost:6379
#    LLM_API_KEY=your_together_ai_key
#    LLM_BASE_URL=https://api.together.xyz
#
# 3. Run with gunicorn for production:
#    gunicorn -w 4 -b 0.0.0.0:8000 ai_marketing_analytics.main:app
#
# 4. Monitor metrics at:
#    GET /metrics (Prometheus scrape endpoint)
#
# 5. API docs available at:
#    http://localhost:8000/docs (Swagger UI)
#    http://localhost:8000/redoc (ReDoc)
