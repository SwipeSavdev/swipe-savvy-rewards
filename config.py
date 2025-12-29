"""
Production Configuration Module
Purpose: Load and validate environment configuration for production deployment
"""

import os
from typing import Optional

class ProductionConfig:
    """Production environment configuration"""
    
    # Database
    DB_HOST: str = os.getenv('DB_HOST', 'localhost')
    DB_PORT: int = int(os.getenv('DB_PORT', '5432'))
    DB_USER: str = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD: str = os.getenv('DB_PASSWORD', '')
    DB_NAME: str = os.getenv('DB_NAME', 'swipesavvy_agents')
    
    # Connection Pool
    DB_POOL_SIZE: int = int(os.getenv('DB_POOL_SIZE', '20'))
    DB_MAX_OVERFLOW: int = int(os.getenv('DB_MAX_OVERFLOW', '40'))
    DB_POOL_TIMEOUT: int = int(os.getenv('DB_POOL_TIMEOUT', '30'))
    DB_POOL_RECYCLE: int = int(os.getenv('DB_POOL_RECYCLE', '3600'))
    
    # Server
    SERVER_HOST: str = os.getenv('SERVER_HOST', '0.0.0.0')
    SERVER_PORT: int = int(os.getenv('SERVER_PORT', '8000'))
    ENVIRONMENT: str = os.getenv('ENVIRONMENT', 'production')
    DEBUG: bool = os.getenv('DEBUG', 'false').lower() == 'true'
    
    # Logging
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT: str = os.getenv('LOG_FORMAT', 'json')
    LOG_FILE: str = os.getenv('LOG_FILE', '/var/log/swipesavvy/api.log')
    
    # Monitoring
    ENABLE_METRICS: bool = os.getenv('ENABLE_METRICS', 'true').lower() == 'true'
    ENABLE_TRACING: bool = os.getenv('ENABLE_TRACING', 'true').lower() == 'true'
    ENABLE_ERROR_TRACKING: bool = os.getenv('ENABLE_ERROR_TRACKING', 'true').lower() == 'true'
    
    # Redis/Caching
    ENABLE_REDIS: bool = os.getenv('ENABLE_REDIS', 'false').lower() == 'true'
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379')
    
    # Performance
    MAX_QUERY_TIME_MS: int = int(os.getenv('MAX_QUERY_TIME_MS', '1000'))
    SLOW_QUERY_LOG: bool = os.getenv('SLOW_QUERY_LOG', 'true').lower() == 'true'
    
    # Feature Flags
    ENABLE_ANALYTICS: bool = os.getenv('ENABLE_ANALYTICS', 'true').lower() == 'true'
    ENABLE_AB_TESTING: bool = os.getenv('ENABLE_AB_TESTING', 'true').lower() == 'true'
    ENABLE_OPTIMIZATION: bool = os.getenv('ENABLE_OPTIMIZATION', 'true').lower() == 'true'
    ENABLE_PHASE4: bool = os.getenv('ENABLE_PHASE4', 'true').lower() == 'true'
    
    @classmethod
    def get_database_url(cls) -> str:
        """Construct database URL from configuration"""
        return f"postgresql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}"
    
    @classmethod
    def validate(cls) -> tuple[bool, list[str]]:
        """Validate configuration for production"""
        errors = []
        
        # Check critical database settings
        if not cls.DB_HOST:
            errors.append("DB_HOST is required")
        if not cls.DB_USER:
            errors.append("DB_USER is required")
        if not cls.DB_PASSWORD and cls.ENVIRONMENT == 'production':
            errors.append("DB_PASSWORD should be set in production")
        if not cls.DB_NAME:
            errors.append("DB_NAME is required")
        
        # Check server settings
        if cls.SERVER_PORT < 1 or cls.SERVER_PORT > 65535:
            errors.append(f"Invalid SERVER_PORT: {cls.SERVER_PORT}")
        
        # Check pool settings
        if cls.DB_POOL_SIZE < 1:
            errors.append(f"Invalid DB_POOL_SIZE: {cls.DB_POOL_SIZE}")
        if cls.DB_MAX_OVERFLOW < 0:
            errors.append(f"Invalid DB_MAX_OVERFLOW: {cls.DB_MAX_OVERFLOW}")
        
        return len(errors) == 0, errors
    
    @classmethod
    def get_summary(cls) -> dict:
        """Get configuration summary for logging"""
        return {
            "database": {
                "host": cls.DB_HOST,
                "port": cls.DB_PORT,
                "name": cls.DB_NAME,
                "pool_size": cls.DB_POOL_SIZE,
                "max_overflow": cls.DB_MAX_OVERFLOW,
            },
            "server": {
                "host": cls.SERVER_HOST,
                "port": cls.SERVER_PORT,
                "environment": cls.ENVIRONMENT,
                "debug": cls.DEBUG,
            },
            "monitoring": {
                "metrics": cls.ENABLE_METRICS,
                "tracing": cls.ENABLE_TRACING,
                "error_tracking": cls.ENABLE_ERROR_TRACKING,
            },
            "features": {
                "analytics": cls.ENABLE_ANALYTICS,
                "ab_testing": cls.ENABLE_AB_TESTING,
                "optimization": cls.ENABLE_OPTIMIZATION,
                "phase4": cls.ENABLE_PHASE4,
            }
        }
