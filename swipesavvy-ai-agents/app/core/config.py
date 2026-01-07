"""
Application Configuration

Centralized configuration for all SwipeSavvy services.
Environment variables are loaded from .env file.
"""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)


class Settings:
    """Application settings with security validation"""
    
    # Environment
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    DEBUG = False  # Default to False for safety
    
    # CORS Configuration - environment-specific
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://192.168.1.142:3000",
        "http://192.168.1.142:5173",
        "http://192.168.1.142:5174",
    ]
    
    # Override for production
    if ENVIRONMENT == "production":
        CORS_ORIGINS = [
            "https://admin.swipesavvy.com",
            "https://wallet.swipesavvy.com",
            "https://swipesavvy.com",
            "http://54.224.8.14",
            "http://54.224.8.14:3001",
            "http://54.224.8.14:3002",
            "*",  # Allow all for now until DNS is configured
        ]
    
    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost/swipesavvy_dev"
    )
    
    # JWT - No default value, must be provided
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    
    # Authorize.Net (Phase 10)
    AUTHORIZE_NET_API_LOGIN_ID = os.getenv("AUTHORIZE_NET_API_LOGIN_ID", "")
    AUTHORIZE_NET_TRANSACTION_KEY = os.getenv("AUTHORIZE_NET_TRANSACTION_KEY", "")
    
    # Firebase (Phase 10 - Task 2)
    FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "{}")
    FIREBASE_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL", "")
    
    # Redis (Phase 11)
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # App settings
    APP_NAME = "SwipeSavvy"
    APP_VERSION = "1.0.0"
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # OpenAI (for AI features)
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Email service
    SMTP_SERVER = os.getenv("SMTP_SERVER", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    
    # Rate limiting
    RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "True").lower() == "true"
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
    
    def __init__(self):
        """Initialize and validate configuration on startup"""
        self._validate_environment()
        self._validate_jwt_config()
        self._set_debug_mode()
    
    def _validate_environment(self):
        """Validate ENVIRONMENT variable"""
        valid_envs = ["development", "staging", "production"]
        if self.ENVIRONMENT not in valid_envs:
            raise ValueError(
                f"ENVIRONMENT must be one of {valid_envs}, "
                f"got: {self.ENVIRONMENT}"
            )
        logger.info(f"✓ Environment: {self.ENVIRONMENT}")
    
    def _validate_jwt_config(self):
        """Ensure JWT secret is secure and properly configured"""
        if not self.JWT_SECRET_KEY:
            raise ValueError(
                "JWT_SECRET_KEY environment variable is required. "
                "Generate with: openssl rand -base64 32"
            )
        
        if len(self.JWT_SECRET_KEY) < 32:
            raise ValueError(
                f"JWT_SECRET_KEY must be at least 32 characters. "
                f"Current length: {len(self.JWT_SECRET_KEY)}"
            )
        
        if self.JWT_SECRET_KEY == "your-secret-key-change-in-production":
            raise ValueError("Do not use placeholder JWT_SECRET_KEY")
        
        logger.info("✓ JWT configuration validated")
    
    def _set_debug_mode(self):
        """Set DEBUG mode based on environment"""
        if self.ENVIRONMENT == "production":
            self.DEBUG = False  # Force off in production
            if os.getenv("DEBUG", "false").lower() == "true":
                raise ValueError("DEBUG must be False in production")
        else:
            self.DEBUG = os.getenv("DEBUG", "false").lower() == "true"
            if self.DEBUG:
                logger.warning("⚠️  WARNING: DEBUG mode enabled - do not use in production!")
    
    @property
    def allowed_origins(self):
        """Get CORS origins based on environment"""
        
        if self.ENVIRONMENT == "production":
            return [
                "https://api.swipesavvy.com",
                "https://app.swipesavvy.com",
                "https://admin.swipesavvy.com",
            ]
        
        elif self.ENVIRONMENT == "staging":
            return [
                "https://staging-api.swipesavvy.com",
                "https://staging-app.swipesavvy.com",
                "http://localhost:5173",  # For local testing
                "http://localhost:3000",
                "http://localhost:8081",
            ]
        
        else:  # development
            return [
                "http://localhost:8081",
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:8081",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000",
                "exp://localhost:8081",
            ]


# Initialize and validate settings on import
try:
    settings = Settings()
except ValueError as e:
    logger.error(f"Configuration validation failed: {str(e)}")
    raise
