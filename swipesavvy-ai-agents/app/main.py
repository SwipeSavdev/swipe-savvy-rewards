"""
SwipeSavvy Backend - Main Entry Point

This is the primary entry point for the SwipeSavvy backend API.
It aggregates all services (AI Concierge, Support System, etc.)
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import sys
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add services to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "services"))
sys.path.insert(0, str(Path(__file__).parent.parent / "shared"))

# Import configuration
from app.core.config import settings

# Import database and models
from app.database import init_db, Base, engine
from app import models  # This ensures all models are registered with SQLAlchemy

# Initialize database
try:
    init_db()
    logger.info("✅ Database initialized successfully")
except Exception as e:
    logger.error(f"❌ Database initialization failed: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="SwipeSavvy Backend API",
    description="Multi-service backend for SwipeSavvy Mobile Wallet",
    version="1.0.0"
)

# ============================================================================
# Rate Limiting Setup
# ============================================================================

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceeded errors"""
    logger.warning(f"Rate limit exceeded for {request.client.host}")
    return JSONResponse(
        status_code=429,
        content={
            "error": "Too many requests",
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": 60
        }
    )

# ============================================================================
# Security Middleware Stack
# ============================================================================

# Trusted Host Middleware - only in production with custom domain
# Disabled for now while using IP address instead of domain
# if settings.ENVIRONMENT == "production":
#     app.add_middleware(
#         TrustedHostMiddleware,
#         allowed_hosts=[
#             "api.swipesavvy.com",
#             "api-staging.swipesavvy.com",
#             "54.224.8.14",
#             "localhost",
#         ]
#     )

# CORS Middleware with environment-specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,  # Cache preflight for 10 minutes
    expose_headers=["X-Process-Time", "X-Request-ID"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    # Content Security
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Cache Control
    if settings.ENVIRONMENT == "production":
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    
    # HSTS for production
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
    
    # CSP (Content Security Policy) - Start permissive, tighten over time
    # In development, allow requests to localhost and 192.168.1.* for LAN access
    csp_connect_src = "'self'"
    if settings.ENVIRONMENT == "development":
        csp_connect_src = "'self' http://localhost:* http://127.0.0.1:* http://192.168.1.*:*"
    else:
        csp_connect_src = "'self' https://api.together.ai"
    
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self'; "
        f"connect-src {csp_connect_src}"
    )
    
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    """Liveness probe - is service running?"""
    return {
        "status": "healthy",
        "service": "swipesavvy-backend",
        "version": "1.0.0"
    }

@app.get("/ready")
async def readiness_check():
    """Readiness probe - is service ready to serve traffic?"""
    try:
        from app.database import SessionLocal
        from sqlalchemy import text
        
        # Check database connectivity
        db = SessionLocal()
        db_status = "ok"
        db_error = None
        
        try:
            # Use parameterized query for safety and clarity
            db.execute(text("SELECT 1"))
        except Exception as e:
            logger.error(f"Database check failed: {str(e)}")
            db_status = "failed"
            db_error = str(e)
        finally:
            # CRITICAL: Always close connection to prevent pool leak
            db.close()
        
        if db_status == "failed":
            return JSONResponse(
                status_code=503,
                content={
                    "status": "not_ready",
                    "checks": {
                        "database": "failed",
                        "reason": db_error
                    }
                }
            )
        
        return {
            "status": "ready",
            "checks": {
                "database": "ok",
                "cache": "ok",
            }
        }
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "reason": str(e)
            }
        )

# API root
@app.get("/")
async def root():
    return {
        "message": "SwipeSavvy Backend API",
        "version": "1.0.0",
        "services": {
            "ai_concierge": "/chat",
            "support": "/api/support",
            "docs": "/docs",
            "health": "/health",
            "ready": "/ready"
        }
    }

# Include support system routes
try:
    from app.routes.support import router as support_router
    app.include_router(support_router)
    logger.info("✅ Support system routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include support routes: {e}")

# Include AI Concierge routes
try:
    from app.routes.ai_concierge import router as ai_concierge_router
    app.include_router(ai_concierge_router)
    logger.info("✅ AI Concierge routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include AI Concierge routes: {e}")

# Include marketing routes
try:
    from app.routes.marketing import router as marketing_router
    app.include_router(marketing_router)
    logger.info("✅ Marketing routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include marketing routes: {e}")

# Include feature flags routes
try:
    from app.routes.feature_flags import router as feature_flags_router
    app.include_router(feature_flags_router)
    logger.info("✅ Feature flags routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include feature flags routes: {e}")

# Include admin authentication routes
try:
    from app.routes.admin_auth import router as admin_auth_router
    app.include_router(admin_auth_router)
    logger.info("✅ Admin authentication routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin auth routes: {e}")

# Include admin dashboard routes
try:
    from app.routes.admin_dashboard import router as admin_dashboard_router
    app.include_router(admin_dashboard_router)
    logger.info("✅ Admin dashboard routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin dashboard routes: {e}")

# Include admin users management routes
try:
    from app.routes.admin_users import router as admin_users_router
    app.include_router(admin_users_router)
    logger.info("✅ Admin users management routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin users routes: {e}")

# Include admin merchants management routes
try:
    from app.routes.admin_merchants import router as admin_merchants_router
    app.include_router(admin_merchants_router)
    logger.info("✅ Admin merchants routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin merchants routes: {e}")

# Include admin merchant onboarding routes (Fiserv integration)
try:
    from app.routes.admin_merchant_onboarding import router as admin_merchant_onboarding_router
    app.include_router(admin_merchant_onboarding_router)
    logger.info("✅ Admin merchant onboarding routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin merchant onboarding routes: {e}")

# Include admin support tickets management routes
try:
    from app.routes.admin_support import router as admin_support_router
    app.include_router(admin_support_router)
    logger.info("✅ Admin support tickets routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin support routes: {e}")

# Include admin feature flags management routes
try:
    from app.routes.admin_feature_flags import router as admin_feature_flags_router
    app.include_router(admin_feature_flags_router)
    logger.info("✅ Admin feature flags routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin feature flags routes: {e}")

# Include admin AI campaigns management routes
try:
    from app.routes.admin_ai_campaigns import router as admin_ai_campaigns_router
    app.include_router(admin_ai_campaigns_router)
    logger.info("✅ Admin AI campaigns routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin AI campaigns routes: {e}")

# Include admin audit logs management routes
try:
    from app.routes.admin_audit_logs import router as admin_audit_logs_router
    app.include_router(admin_audit_logs_router)
    logger.info("✅ Admin audit logs routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin audit logs routes: {e}")

# Include admin settings management routes
try:
    from app.routes.admin_settings import router as admin_settings_router
    app.include_router(admin_settings_router)
    logger.info("✅ Admin settings routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin settings routes: {e}")

# Include admin RBAC (Role-Based Access Control) routes
try:
    from app.routes.admin_rbac import router as admin_rbac_router
    app.include_router(admin_rbac_router)
    logger.info("✅ Admin RBAC routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin RBAC routes: {e}")

# Include admin charity management routes
try:
    from app.routes.admin_charities import router as admin_charities_router
    app.include_router(admin_charities_router, prefix="/api")
    logger.info("✅ Admin charity routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include admin charity routes: {e}")

# Include user authentication routes (Signup, Login, Verification)
try:
    from app.routes.user_auth import router as user_auth_router
    app.include_router(user_auth_router)
    logger.info("✅ User authentication routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include user auth routes: {e}")

# Include user KYC routes (Document upload, Identity verification, OFAC)
try:
    from app.routes.user_kyc import router as user_kyc_router
    app.include_router(user_kyc_router)
    logger.info("✅ User KYC routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include user KYC routes: {e}")

# Include payment routes (Phase 10)
try:
    from app.routes.payments import router as payments_router
    app.include_router(payments_router)
    logger.info("✅ Payment routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include payment routes: {e}")

# Include notification routes (Phase 10 - Task 2)
try:
    from app.routes.notifications import router as notifications_router
    app.include_router(notifications_router)
    logger.info("✅ Notification routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include notification routes: {e}")

# Include chat routes (Phase 10 - Task 3)
try:
    from app.routes.chat import router as chat_router
    app.include_router(chat_router)
    logger.info("✅ Chat routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include chat routes: {e}")

# Include chat dashboard routes (Phase 10 - Task 4)
try:
    from app.routes.chat_dashboard import router as chat_dashboard_router
    app.include_router(chat_dashboard_router)
    logger.info("✅ Chat dashboard routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include chat dashboard routes: {e}")

# Include mobile API routes (Accounts, Wallet, Analytics, Goals, Budgets, Leaderboard)
try:
    from app.routes.mobile_api import router as mobile_api_router
    app.include_router(mobile_api_router)
    logger.info("✅ Mobile API routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include mobile API routes: {e}")

# Include AWS Location Service routes (Geocoding, Places, Routing, Geofencing, Tracking)
try:
    from app.routes.location import router as location_router
    app.include_router(location_router)
    logger.info("✅ Location services routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include location routes: {e}")

# Include Preferred Merchants routes (Merchants, Deals, Subscriptions)
try:
    from app.routes.preferred_merchants import router as preferred_merchants_router
    app.include_router(preferred_merchants_router)
    logger.info("✅ Preferred merchants routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not include preferred merchants routes: {e}")

# Include AI Concierge routes (existing)
try:
    from concierge_service.main import app as concierge_app
    app.mount("/concierge", concierge_app)
    logger.info("✅ AI Concierge routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not mount concierge service: {e}")

# Include RAG service routes
try:
    from rag_service.main import app as rag_app
    app.mount("/rag", rag_app)
    logger.info("✅ RAG service routes included")
except Exception as e:
    logger.warning(f"⚠️ Could not mount RAG service: {e}")

# Catch-all for unmatched routes
@app.get("/api/{path_name:path}")
async def catch_all(path_name: str):
    return {"message": f"Endpoint /{path_name} not found", "status": 404}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": "error"}
    )


# ============================================================================
# Startup and Shutdown Event Handlers for Background Tasks
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize background tasks on server startup"""
    try:
        # Background dashboard broadcast tasks disabled due to schema mismatches
        # Re-enable after aligning ChatDashboardService models with database schema
        # from app.tasks.dashboard_broadcast import dashboard_tasks
        # await dashboard_tasks.start_background_tasks()
        # logger.info("✅ Dashboard background tasks started")
        logger.info("⚠️ Dashboard background tasks disabled (schema mismatch)")
    except Exception as e:
        logger.error(f"❌ Failed to start dashboard tasks: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup background tasks on server shutdown"""
    try:
        # Background tasks disabled - see startup_event
        # from app.tasks.dashboard_broadcast import dashboard_tasks
        # await dashboard_tasks.stop_background_tasks()
        logger.info("✅ Dashboard background tasks shutdown complete")
    except Exception as e:
        logger.error(f"❌ Failed to stop dashboard tasks: {e}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port, reload=True)
