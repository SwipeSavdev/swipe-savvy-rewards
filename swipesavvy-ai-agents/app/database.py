"""
Database Connection and Session Management

Handles SQLAlchemy setup, connection pooling, and session management
for the SwipeSavvy backend. Also provides Redis cache integration.
"""

import os
from typing import Dict, Any
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
import logging

logger = logging.getLogger(__name__)

# Database URL - PostgreSQL for dev/production, SQLite for testing
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://localhost:5432/swipesavvy_dev"
)

# Check if using PostgreSQL
if "postgresql" in DATABASE_URL:
    # PostgreSQL engine with connection pooling
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=20,               # Number of persistent connections
        max_overflow=40,            # Additional connections when pool is saturated
        pool_pre_ping=True,         # Verify connections before using them
        pool_recycle=3600,          # Recycle connections after 1 hour
        pool_timeout=30,            # Wait 30 seconds for a connection
        echo=False,                 # Set to True for SQL logging
    )
    logger.info("✓ PostgreSQL connection pool configured: pool_size=20, max_overflow=40")
else:
    # SQLite engine for development
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
    logger.info("✓ SQLite engine configured")

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


def get_db():
    """Dependency injection function for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database - create all tables."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")


def reset_db():
    """Reset database - drop and recreate all tables."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("Database reset successfully")


def get_health_status() -> Dict[str, Any]:
    """Get health status of database and cache connections."""
    status = {
        "database": {"status": "unknown"},
        "cache": {"status": "unknown"},
    }

    # Check database connection
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        status["database"] = {
            "status": "healthy",
            "connected": True,
            "pool_size": engine.pool.size() if hasattr(engine.pool, 'size') else None,
        }
    except Exception as e:
        status["database"] = {
            "status": "unhealthy",
            "connected": False,
            "error": str(e),
        }

    # Check Redis cache
    try:
        from app.services.cache_service import check_redis_health
        status["cache"] = check_redis_health()
    except ImportError:
        status["cache"] = {
            "status": "unavailable",
            "connected": False,
            "message": "Redis cache service not configured",
        }
    except Exception as e:
        status["cache"] = {
            "status": "error",
            "connected": False,
            "error": str(e),
        }

    # Overall status
    db_healthy = status["database"].get("connected", False)
    cache_healthy = status["cache"].get("connected", False)

    if db_healthy and cache_healthy:
        status["overall"] = "healthy"
    elif db_healthy:
        status["overall"] = "degraded"  # DB up, cache down
    else:
        status["overall"] = "unhealthy"

    return status
