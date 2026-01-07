"""
SwipeSavvy FastAPI Backend Server
Purpose: Main entry point for Phase 4 - Behavioral Learning API
Tech: FastAPI, Python, PostgreSQL
Created: December 26, 2025

This server provides APIs for:
- Campaign Analytics (6 endpoints)
- A/B Testing (6 endpoints)
- ML Optimization (8+ endpoints)
- Feature Flags
- Scheduled Jobs (5 jobs)
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
import psycopg2
from psycopg2 import sql

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ═════════════════════════════════════════════════════════════════════════════
# PHASE 2 IMPORTS: API Services (User, Campaign, Admin)
# ═════════════════════════════════════════════════════════════════════════════
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from tools.backend.services import (
        setup_campaign_routes,
        setup_user_routes,
        setup_admin_routes
    )
    logger.info("✅ Phase 2 services imported successfully")
except ImportError as e:
    logger.warning(f"⚠️  Could not import Phase 2 services: {str(e)}")
    setup_campaign_routes = None
    setup_user_routes = None
    setup_admin_routes = None

# Load environment variables
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'swipesavvy_agents')

# Database connection
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

logger.info(f"Connecting to database at {DB_HOST}:{DB_PORT}/{DB_NAME}")

try:
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=40,
        pool_pre_ping=True,
        echo=False
    )
    
    # Test connection
    with engine.connect() as connection:
        logger.info("✅ Database connection successful")
    
except Exception as e:
    logger.error(f"❌ Database connection failed: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Get database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ═════════════════════════════════════════════════════════════════════════════
# LIFESPAN CONTEXT MANAGER
# ═════════════════════════════════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle app startup and shutdown"""
    logger.info("🚀 Starting SwipeSavvy Backend API Server...")
    
    # Startup
    try:
        # Verify database tables exist
        db = SessionLocal()
        result = db.execute(
            text("""
                SELECT EXISTS(
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = 'campaign_analytics_daily'
                )
            """)
        )
        tables_exist = result.scalar()
        if tables_exist:
            logger.info("✅ Analytics tables verified")
        else:
            logger.warning("⚠️  Analytics tables not found - run mock data ingestion")
        db.close()
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down SwipeSavvy Backend API Server...")
    engine.dispose()

# ═════════════════════════════════════════════════════════════════════════════
# CREATE FASTAPI APP
# ═════════════════════════════════════════════════════════════════════════════

app = FastAPI(
    title="SwipeSavvy API",
    description="Backend API for SwipeSavvy Mobile App - Phase 4: Behavioral Learning",
    version="1.0.0",
    lifespan=lifespan
)

# ═════════════════════════════════════════════════════════════════════════════
# CORS MIDDLEWARE
# ═════════════════════════════════════════════════════════════════════════════

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Admin Portal
        "http://localhost:5173",      # Admin Portal (Vite)
        "http://localhost:8080",      # Mobile Web
        "http://localhost:8081",      # Expo Metro
        "http://192.168.1.142:3000",  # Admin Portal (Network)
        "http://192.168.1.142:5173",  # Admin Portal (Network)
        "http://192.168.1.142:8081",  # Expo Metro (Network)
        "*"                            # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK ENDPOINT
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Verify database is accessible
        result = db.execute(text("SELECT 1"))
        db_ok = result.scalar() == 1
        
        return {
            "status": "healthy",
            "database": "connected" if db_ok else "disconnected",
            "timestamp": str(__import__('datetime').datetime.now()),
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": str(__import__('datetime').datetime.now())
        }

@app.get("/api/phase4/health")
async def phase4_health(db: Session = Depends(get_db)):
    """Phase 4 specific health check"""
    try:
        db.execute(text("SELECT COUNT(*) FROM campaign_analytics_daily LIMIT 1"))
        return {"status": "ok", "phase4": "ready"}
    except Exception as e:
        return {"status": "ok", "phase4": "tables_not_ready", "note": str(e)}

# ═════════════════════════════════════════════════════════════════════════════
# ROOT ENDPOINT
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "SwipeSavvy Backend API",
        "version": "1.0.0",
        "phase": "Phase 4 - Behavioral Learning",
        "endpoints": {
            "health": "/health",
            "phase4_health": "/api/phase4/health",
            "docs": "/docs",
            "analytics": "/api/analytics/*",
            "ab_testing": "/api/ab-tests/*",
            "optimization": "/api/optimize/*",
        },
        "database": {
            "host": DB_HOST,
            "port": DB_PORT,
            "name": DB_NAME
        },
        "documentation": "Available at /docs (Swagger UI) or /redoc (ReDoc)"
    }

# ═════════════════════════════════════════════════════════════════════════════
# ADMIN AUTHENTICATION ENDPOINT
# ═════════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/v1/admin/auth/login")
async def admin_login(request: LoginRequest):
    """
    Admin authentication endpoint
    For development: accepts any credentials and returns mock token
    """
    # Simple mock authentication for development
    # In production, this should verify credentials against database
    return {
        "token": "mock-jwt-token-" + str(int(__import__('datetime').datetime.now().timestamp())),
        "session": {
            "user": {
                "id": "admin-001",
                "email": request.email,
                "name": "Admin User",
                "role": "admin",
                "permissions": ["read", "write", "delete", "admin"]
            },
            "token": "mock-jwt-token-" + str(int(__import__('datetime').datetime.now().timestamp())),
            "expires_at": str(__import__('datetime').datetime.now() + __import__('datetime').timedelta(hours=24))
        },
        "user": {
            "id": "admin-001",
            "email": request.email,
            "name": "Admin User",
            "role": "admin"
        }
    }

# ═════════════════════════════════════════════════════════════════════════════
# IMPORT AND REGISTER PHASE 4 ROUTES
# ═════════════════════════════════════════════════════════════════════════════

logger.info("Registering Phase 4 routes...")

try:
    # Import the routes router
    # Note: Uncomment when phase_4_routes.py is fully integrated
    # from phase_4_routes import router as phase4_router
    # app.include_router(phase4_router)
    logger.info("⚠️  Phase 4 routes module commented out - enable when phase_4_routes fully integrates")
    
except ImportError as e:
    logger.warning(f"Could not import Phase 4 routes: {str(e)}")
    logger.info("Falling back to basic endpoints only")

# ═════════════════════════════════════════════════════════════════════════════
# IMPORT AND REGISTER PHASE 2 ROUTES (User, Campaign, Admin APIs)
# ═════════════════════════════════════════════════════════════════════════════

logger.info("Registering Phase 2 service routes...")

if setup_campaign_routes and setup_user_routes and setup_admin_routes:
    try:
        setup_campaign_routes(app)
        logger.info("✅ Campaign routes registered (7 endpoints)")
        
        setup_user_routes(app)
        logger.info("✅ User routes registered (5 endpoints)")
        
        setup_admin_routes(app)
        logger.info("✅ Admin routes registered (5 endpoints)")
        
        logger.info("✅ Phase 2 services fully integrated (17 endpoints total)")
    except Exception as e:
        logger.error(f"Error registering Phase 2 routes: {str(e)}")
else:
    logger.warning("Phase 2 services not available - skipping route registration")

# ═════════════════════════════════════════════════════════════════════════════
# SAMPLE ANALYTICS ENDPOINTS (for testing without full phase_4_routes)
# ═════════════════════════════════════════════════════════════════════════════

@app.get("/api/analytics/campaigns/count")
async def get_campaigns_count(db: Session = Depends(get_db)):
    """Get total number of campaigns"""
    try:
        result = db.execute(text("SELECT COUNT(*) as count FROM campaign_analytics_daily"))
        count = result.scalar() or 0
        return {"campaigns_count": count, "status": "ok"}
    except Exception as e:
        return {"campaigns_count": 0, "status": "error", "error": str(e)}

@app.get("/api/analytics/health")
async def analytics_health(db: Session = Depends(get_db)):
    """Health check for analytics data"""
    try:
        db.execute(text("SELECT 1 FROM campaign_analytics_daily LIMIT 1"))
        return {"analytics": "ready", "data_available": True}
    except Exception as e:
        return {"analytics": "initializing", "data_available": False, "note": str(e)}

@app.get("/api/ab-tests/count")
async def get_ab_tests_count(db: Session = Depends(get_db)):
    """Get total number of A/B tests"""
    try:
        result = db.execute(text("SELECT COUNT(*) as count FROM ab_tests"))
        count = result.scalar() or 0
        return {"ab_tests_count": count, "status": "ok"}
    except Exception as e:
        return {"ab_tests_count": 0, "status": "error", "error": str(e)}

@app.get("/api/optimize/affinity/summary")
async def get_affinity_summary(db: Session = Depends(get_db)):
    """Get user merchant affinity summary"""
    try:
        result = db.execute(text("""
            SELECT 
                COUNT(*) as total_affinities,
                ROUND(AVG(affinity_score)::numeric, 2) as avg_affinity,
                MAX(affinity_score) as max_affinity,
                MIN(affinity_score) as min_affinity
            FROM user_merchant_affinity
        """))
        data = result.fetchone()
        return {
            "total_affinities": data[0],
            "avg_affinity": float(data[1] or 0),
            "max_affinity": float(data[2] or 0),
            "min_affinity": float(data[3] or 0),
            "status": "ok"
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

# ═════════════════════════════════════════════════════════════════════════════
# STARTUP EVENT
# ═════════════════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup():
    """Called on app startup"""
    logger.info("═" * 80)
    logger.info("SwipeSavvy Backend API - Startup Complete")
    logger.info("═" * 80)
    logger.info(f"Server running on: http://0.0.0.0:8000")
    logger.info(f"Documentation: http://localhost:8000/docs")
    logger.info(f"Database: {DB_HOST}:{DB_PORT}/{DB_NAME}")
    logger.info("═" * 80)

# ═════════════════════════════════════════════════════════════════════════════
# RUN SERVER (for development)
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting Uvicorn server...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8888,
        log_level="info"
    )
