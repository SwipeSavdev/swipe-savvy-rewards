"""
Database Connection and Session Management

Handles SQLAlchemy setup, connection pooling, and session management
for the SwipeSavvy backend.
"""

import os
from sqlalchemy import create_engine, event
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
