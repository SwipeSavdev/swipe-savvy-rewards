# 🛠️ Security Remediation Implementation Guide
**SwipeSavvy Backend Security Fixes**

**Status:** Ready for Implementation  
**Estimated Time:** 2 weeks (Phase 1-4)  
**Priority:** CRITICAL → MEDIUM

---

## Phase 1: Critical Security Fixes (1 Week)
### Must Complete Before Production Release

---

## Fix #1: Secure JWT Secret Key Configuration

**File:** `swipesavvy-ai-agents/app/core/config.py`

**Current (Vulnerable):**
```python
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
```

**Fixed (Secure):**
```python
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)

class Settings:
    """Application settings"""
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    
    def __init__(self):
        """Validate JWT configuration on startup"""
        self._validate_jwt_config()
    
    def _validate_jwt_config(self):
        """Ensure JWT secret is secure"""
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

# Initialize and validate
try:
    settings = Settings()
    settings._validate_jwt_config()
except ValueError as e:
    raise ValueError(f"Configuration error: {str(e)}")
```

**Deployment Steps:**
```bash
# 1. Generate secure random key
JWT_SECRET=$(openssl rand -base64 32)
echo "Generated JWT_SECRET_KEY: $JWT_SECRET"

# 2. Add to .env file
cat >> swipesavvy-ai-agents/.env << EOF
JWT_SECRET_KEY=$JWT_SECRET
EOF

# 3. Test configuration loads
cd swipesavvy-ai-agents
python -c "from app.core.config import settings; print('✅ Config validated')"

# 4. Verify startup validation works
python -m pytest tests/ -v -k "config"
```

---

## Fix #2: Remove Hardcoded Demo Credentials

**Files:** 
- `swipesavvy-ai-agents/app/routes/admin_auth.py`

**Current (Vulnerable):**
```python
DEMO_USERS = {
    "admin@swipesavvy.com": {
        "id": "demo-admin-1",
        "name": "Admin User",
        "email": "admin@swipesavvy.com",
        "password": "Admin123!",  # ← HARDCODED PASSWORD
        "role": "admin",
        "status": "active"
    },
    # ... more hardcoded passwords
}
```

**Fixed (Secure):**
```python
import os
import json
import logging

logger = logging.getLogger(__name__)

def load_demo_users():
    """Load demo users from environment, not source code"""
    environment = os.getenv("ENVIRONMENT", "development")
    
    # Only load demo users in development
    if environment not in ["development", "testing"]:
        logger.warning("Demo users disabled in non-development environment")
        return {}
    
    # Load from environment variable
    demo_users_json = os.getenv("DEMO_USERS", "{}")
    try:
        DEMO_USERS = json.loads(demo_users_json)
        logger.info(f"Loaded {len(DEMO_USERS)} demo users")
        
        # Security: Never have hardcoded passwords
        for email, user_data in DEMO_USERS.items():
            if "password" in user_data:
                user_data["password_hash"] = get_password_hash(user_data.pop("password"))
        
        return DEMO_USERS
    except json.JSONDecodeError:
        logger.error("DEMO_USERS environment variable is not valid JSON")
        return {}

# Load demo users at startup
DEMO_USERS = load_demo_users()
```

**Environment Setup (.env):**
```bash
# Development environment only
ENVIRONMENT=development

# Demo users as JSON (passwords hashed on load)
DEMO_USERS={
  "admin@swipesavvy.com": {
    "id": "demo-admin-1",
    "name": "Admin User",
    "email": "admin@swipesavvy.com",
    "password": "TempPassword123!SecureMe",
    "role": "admin",
    "status": "active"
  },
  "support@swipesavvy.com": {
    "id": "demo-support-1",
    "name": "Support User",
    "email": "support@swipesavvy.com",
    "password": "TempPassword456!SecureMe",
    "role": "support",
    "status": "active"
  }
}
```

**Git Pre-commit Hook to Prevent Re-commit:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

if grep -r "password.*:.*['\"]" --include="*.py" app/ services/; then
    echo "❌ ERROR: Hardcoded passwords detected in Python files!"
    exit 1
fi

exit 0
```

**Deployment:**
```bash
# 1. Remove hardcoded passwords from source
git rm --cached app/routes/admin_auth.py
# (Edit file to remove hardcoded passwords)

# 2. Add demo users to .env
echo 'DEMO_USERS=...' >> swipesavvy-ai-agents/.env

# 3. Install pre-commit hook
chmod +x .git/hooks/pre-commit

# 4. Verify deployment
grep -r "Admin123\|Support123\|Ops123" app/ || echo "✅ No hardcoded passwords found"
```

---

## Fix #3: Enforce Environment-Specific Configuration

**File:** `swipesavvy-ai-agents/app/core/config.py`

**Current (Vulnerable):**
```python
ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:5173",
    "http://127.0.0.1:8081",
    "exp://localhost:8081",
]

DEBUG = os.getenv("DEBUG", "False").lower() == "true"
```

**Fixed (Secure):**
```python
import os

class Settings:
    """Application settings with environment validation"""
    
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    DEBUG = False  # Default to False
    
    def __init__(self):
        """Initialize and validate configuration"""
        self._validate_environment()
    
    def _validate_environment(self):
        """Validate environment variable"""
        valid_envs = ["development", "staging", "production"]
        if self.ENVIRONMENT not in valid_envs:
            raise ValueError(
                f"ENVIRONMENT must be one of {valid_envs}, "
                f"got: {self.ENVIRONMENT}"
            )
        
        # DEBUG mode safety
        if self.ENVIRONMENT == "production":
            self.DEBUG = False  # Force off in production
            if os.getenv("DEBUG", "false").lower() == "true":
                raise ValueError("DEBUG must be False in production")
        else:
            self.DEBUG = os.getenv("DEBUG", "false").lower() == "true"
            if self.DEBUG:
                print("⚠️  WARNING: DEBUG mode enabled - do not use in production!")
    
    @property
    def ALLOWED_ORIGINS(self):
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
            ]
        
        else:  # development
            return [
                "http://localhost:8081",
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:8081",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000",
            ]
    
    @property
    def DATABASE_URL(self):
        """Get database URL from environment"""
        db_url = os.getenv("DATABASE_URL")
        
        if not db_url:
            if self.ENVIRONMENT == "production":
                raise ValueError("DATABASE_URL required in production")
            # Development default (without credentials)
            return "postgresql://localhost/swipesavvy_dev"
        
        # Validate URL format
        if not db_url.startswith(("postgresql://", "postgresql+psycopg2://")):
            raise ValueError("DATABASE_URL must use PostgreSQL driver")
        
        return db_url

# Global settings instance
settings = Settings()
```

**Environment Files:**

`.env.development`:
```bash
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=postgresql://postgres:postgres@localhost/swipesavvy_dev
JWT_SECRET_KEY=dev-key-change-for-real-production-key-must-be-long
```

`.env.staging`:
```bash
ENVIRONMENT=staging
DEBUG=false
DATABASE_URL=postgresql://user:pass@staging-db.internal/swipesavvy
JWT_SECRET_KEY=[SET_IN_CI/CD_SYSTEM]
TOGETHER_API_KEY=[SET_IN_CI/CD_SYSTEM]
```

`.env.production`:
```bash
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=[SET_IN_CI/CD_SYSTEM]
JWT_SECRET_KEY=[SET_IN_CI/CD_SYSTEM]
TOGETHER_API_KEY=[SET_IN_CI/CD_SYSTEM]
```

---

## Phase 2: High Priority Fixes (1-2 Weeks)

---

## Fix #4: Add Request Input Validation

**File:** `swipesavvy-ai-agents/services/concierge_service/main.py`

**Setup:**
```bash
pip install pydantic[email] python-multipart
```

**Current (Vulnerable):**
```python
class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: str
    context: dict
```

**Fixed (Secure):**
```python
from pydantic import BaseModel, Field, validator
from typing import Dict, Optional
import html
import re

class ContextData(BaseModel):
    """Validated context data structure"""
    account_type: str = Field(..., min_length=1, max_length=50)
    user_name: str = Field(..., min_length=1, max_length=100)
    
    @validator('account_type')
    def validate_account_type(cls, v):
        """Ensure account_type is from allowed list"""
        allowed_types = ['mobile_wallet', 'business', 'premium', 'student']
        if v not in allowed_types:
            raise ValueError(f'account_type must be one of {allowed_types}')
        return v
    
    @validator('user_name')
    def sanitize_user_name(cls, v):
        """Remove special characters from user name"""
        # Allow alphanumeric, spaces, hyphens, underscores
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError('user_name contains invalid characters')
        return v.strip()


class ChatRequest(BaseModel):
    """Validated chat request with input constraints"""
    message: str = Field(
        ..., 
        min_length=1, 
        max_length=2000,
        description="User message (1-2000 characters)"
    )
    user_id: str = Field(
        ..., 
        min_length=10, 
        max_length=50,
        regex="^[a-zA-Z0-9_-]+$",
        description="User ID (alphanumeric, dash, underscore)"
    )
    session_id: str = Field(
        ..., 
        min_length=10, 
        max_length=50,
        regex="^[a-zA-Z0-9_-]+$",
        description="Session ID (alphanumeric, dash, underscore)"
    )
    context: ContextData = Field(
        ...,
        description="User context data"
    )
    
    @validator('message')
    def sanitize_message(cls, v):
        """Sanitize message to prevent XSS/injection"""
        # HTML escape to prevent injection
        sanitized = html.escape(v).strip()
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'<\s*script',  # Script tags
            r'javascript:',  # JavaScript protocol
            r'on\w+\s*=',  # Event handlers
            r'<\s*iframe',  # Iframe tags
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, sanitized, re.IGNORECASE):
                raise ValueError('Message contains potentially harmful content')
        
        return sanitized
    
    class Config:
        """Pydantic config"""
        # Prevent extra fields
        extra = "forbid"
        # Show field validation errors
        validate_assignment = True


# Usage in route
@router.post("/api/v1/chat", response_class=StreamingResponse)
async def chat_endpoint(
    request: ChatRequest,  # ← Automatic validation here
    user_id: str = Depends(verify_jwt_token)
) -> StreamingResponse:
    """
    Chat endpoint with validated input.
    
    Pydantic automatically:
    - Validates min/max length
    - Enforces regex patterns
    - Sanitizes input
    - Rejects extra fields
    - Returns 422 on invalid input
    """
    
    # Verify user owns this chat
    if request.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="User ID mismatch"
        )
    
    # Input is guaranteed valid at this point
    return await process_chat(request)
```

**Test Input Validation:**
```python
# tests/test_chat_validation.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_message_too_long():
    """Message exceeds max length"""
    response = client.post("/concierge/api/v1/chat", json={
        "message": "x" * 3000,  # Over 2000 char limit
        "user_id": "valid_user_id",
        "session_id": "valid_session_id",
        "context": {"account_type": "mobile_wallet", "user_name": "Test"}
    })
    assert response.status_code == 422
    assert "max_length" in str(response.json())

def test_chat_xss_injection():
    """XSS injection attempt blocked"""
    response = client.post("/concierge/api/v1/chat", json={
        "message": "<script>alert('xss')</script>",
        "user_id": "valid_user_id",
        "session_id": "valid_session_id",
        "context": {"account_type": "mobile_wallet", "user_name": "Test"}
    })
    assert response.status_code == 422
    assert "harmful" in str(response.json()).lower()

def test_chat_valid_input():
    """Valid input accepted"""
    response = client.post("/concierge/api/v1/chat", json={
        "message": "Hello, what's my account balance?",
        "user_id": "valid_user_123",
        "session_id": "session_456",
        "context": {"account_type": "mobile_wallet", "user_name": "John"}
    })
    assert response.status_code == 200
    # Should stream response...
```

---

## Fix #5: Implement Rate Limiting

**Install:**
```bash
pip install slowapi
```

**File:** `swipesavvy-ai-agents/app/main.py`

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter

# Custom error handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={
            "error": "Too many requests",
            "detail": "Rate limit exceeded. Please try again later.",
            "retry_after": 60
        }
    )

# Apply to routes with different limits
@app.post("/api/v1/chat")
@limiter.limit("100/minute")  # 100 requests per minute per IP
async def chat(request: ChatRequest):
    """Chat endpoint with rate limiting"""
    pass

@app.post("/api/v1/admin/auth/login")
@limiter.limit("5/minute")  # Stricter limit for auth
async def login(request: LoginRequest):
    """Login endpoint with aggressive rate limiting"""
    pass

@app.post("/api/v1/admin/users")
@limiter.limit("10/minute")  # User creation limited
async def create_user(request: CreateUserRequest):
    """Create user with rate limiting"""
    pass

# Health check - no rate limit
@app.get("/health")
async def health():
    """Health check (no rate limiting)"""
    pass
```

**Configuration (`.env`):**
```bash
# Rate limiting configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_CHAT=100/minute
RATE_LIMIT_AUTH=5/minute
RATE_LIMIT_USER_CREATION=10/minute
```

---

## Fix #6: Add Security Headers

**File:** `swipesavvy-ai-agents/app/main.py`

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.core.config import settings

app = FastAPI(title="SwipeSavvy API")

# Security Middleware Stack

# 1. Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "api.swipesavvy.com",
        "api-staging.swipesavvy.com",
        "localhost",
        "127.0.0.1"
    ] if settings.ENVIRONMENT == "production" else ["*"]
)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,  # Cache preflight for 10 minutes
    expose_headers=["X-Process-Time"],
)

# 3. Security Headers Middleware
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
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self'; "
        "connect-src 'self' https://api.together.ai"
    )
    
    return response
```

**Test Security Headers:**
```bash
# Test HTTPS enforcement
curl -I http://localhost:8000/health

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

---

## Phase 3: Medium Priority Fixes (2-3 Weeks)

---

## Fix #7: Standardize Password Hashing

**File:** `swipesavvy-ai-agents/services/concierge_service/auth_service.py`

**Current (Inconsistent):**
```python
def hash_password(self, password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${hash_obj.hex()}"
```

**Fixed (Consistent bcrypt):**
```python
from passlib.context import CryptContext
from pydantic import BaseModel, Field, validator
import re

# Single source of truth for password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # OWASP recommended
)

class AuthService:
    """Authentication service with secure password handling"""
    
    def __init__(self):
        self.pwd_context = pwd_context
        self.users = {}
        self.tokens = {}
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against bcrypt hash"""
        return self.pwd_context.verify(password, hashed)


class PasswordValidator:
    """Password strength validation"""
    
    MIN_LENGTH = 12
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGIT = True
    REQUIRE_SPECIAL = True
    
    @staticmethod
    def validate(password: str) -> tuple[bool, str]:
        """Validate password strength"""
        
        if len(password) < PasswordValidator.MIN_LENGTH:
            return False, f"Password must be at least {PasswordValidator.MIN_LENGTH} characters"
        
        if PasswordValidator.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            return False, "Password must contain uppercase letter"
        
        if PasswordValidator.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            return False, "Password must contain lowercase letter"
        
        if PasswordValidator.REQUIRE_DIGIT and not re.search(r'\d', password):
            return False, "Password must contain digit"
        
        if PasswordValidator.REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?]', password):
            return False, "Password must contain special character"
        
        return True, "Password is strong"


class SignupRequest(BaseModel):
    """Signup request with password validation"""
    email: str = Field(..., min_length=5, max_length=255, regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    password: str = Field(..., min_length=12)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        is_valid, message = PasswordValidator.validate(v)
        if not is_valid:
            raise ValueError(message)
        return v


# Usage in routes
@router.post("/signup")
async def signup(request: SignupRequest):
    """User signup with validated password"""
    auth_service = AuthService()
    
    # Hash password using bcrypt
    password_hash = auth_service.hash_password(request.password)
    
    user = {
        "email": request.email,
        "password_hash": password_hash,  # Never store plaintext
        "first_name": request.first_name,
        "last_name": request.last_name,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Save to database
    return {"user_id": user_id, "email": user["email"]}
```

---

## Fix #8: Implement Sensitive Data Logging Filter

**File:** `swipesavvy-ai-agents/shared/logging_config.py`

```python
import logging
import re
from typing import Pattern
import json

class SensitiveDataFilter(logging.Filter):
    """Remove sensitive data from logs"""
    
    # Patterns to redact
    REDACTION_PATTERNS = [
        # API Keys and Tokens
        (r'(?:api[_-]?key|token|bearer|authorization)["\'\s=:]+([a-zA-Z0-9_\-\.]+)', 'API_KEY'),
        (r'(?:password|passwd|pwd)["\'\s=:]+([^"\s,}]+)', 'PASSWORD'),
        (r'(?:secret)["\'\s=:]+([^"\s,}]+)', 'SECRET'),
        
        # Database credentials
        (r'(?:database_url|db_url)["\'\s=:]+postgresql://([^/]+)@([^/]+)', 'DATABASE_URL'),
        
        # Email addresses (partial redaction)
        (r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', r'\1@***.***'),
        
        # Credit card numbers (basic pattern)
        (r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', 'CARD_NUMBER'),
        
        # SSN pattern
        (r'\b\d{3}-\d{2}-\d{4}\b', 'SSN'),
        
        # JWT tokens
        (r'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', 'JWT_TOKEN'),
    ]
    
    def filter(self, record: logging.LogRecord) -> bool:
        """Filter sensitive data from log record"""
        try:
            # Process message
            if isinstance(record.msg, str):
                record.msg = self._redact(record.msg)
            
            # Process args
            if record.args:
                if isinstance(record.args, dict):
                    record.args = {
                        k: self._redact(str(v)) if v else v 
                        for k, v in record.args.items()
                    }
                elif isinstance(record.args, tuple):
                    record.args = tuple(
                        self._redact(str(arg)) if arg else arg 
                        for arg in record.args
                    )
            
            # Process exc_info if present
            if record.exc_text:
                record.exc_text = self._redact(record.exc_text)
            
        except Exception:
            # Don't crash if filtering fails
            pass
        
        return True
    
    @staticmethod
    def _redact(text: str) -> str:
        """Apply all redaction patterns to text"""
        for pattern, replacement in SensitiveDataFilter.REDACTION_PATTERNS:
            try:
                text = re.sub(pattern, f'[{replacement}]', text, flags=re.IGNORECASE)
            except Exception:
                continue
        
        return text


def setup_logging():
    """Configure logging with security"""
    
    # Get root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Add sensitive data filter to all handlers
    sensitive_filter = SensitiveDataFilter()
    for handler in logger.handlers:
        handler.addFilter(sensitive_filter)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.addFilter(sensitive_filter)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    
    return logger


# Usage
logger = setup_logging()
```

**Test Logging Filter:**
```python
# Test that sensitive data is redacted
logger.info("User logged in with API_KEY=super_secret_key_12345")
# Output: "User logged in with [API_KEY]"

logger.error("Database connection failed: postgresql://user:password@db.internal/app")
# Output: "Database connection failed: [DATABASE_URL]"
```

---

## Phase 4: Ongoing Improvements (Monthly)

---

## Fix #9: Setup Automated Dependency Scanning

**Install Snyk:**
```bash
npm install -g snyk
cd swipesavvy-ai-agents
snyk auth
snyk test
snyk monitor  # Continuous monitoring
```

**Or use Dependabot (GitHub):**
1. Go to repository Settings
2. Enable "Dependabot" under "Code security and analysis"
3. Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/swipesavvy-ai-agents"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    reviewers:
      - "security-team"
```

---

## Implementation Checklist

### Phase 1 (Critical - Complete ASAP)
- [ ] Generate secure JWT_SECRET_KEY
- [ ] Update `.env` with new secret
- [ ] Remove hardcoded demo passwords
- [ ] Load demo users from environment
- [ ] Add environment validation
- [ ] Set CORS origins per environment
- [ ] Enforce DEBUG=False in production

### Phase 2 (High Priority - 1-2 weeks)
- [ ] Add Pydantic input validation
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Test all endpoints with validators
- [ ] Monitor rate limit effectiveness

### Phase 3 (Medium Priority - 2-3 weeks)
- [ ] Migrate all passwords to bcrypt
- [ ] Add password strength requirements
- [ ] Implement sensitive data logging filter
- [ ] Audit all logs for PII
- [ ] Test logging redaction

### Phase 4 (Ongoing)
- [ ] Setup dependency scanning (Snyk/Dependabot)
- [ ] Weekly security reviews
- [ ] Monthly penetration testing
- [ ] Quarterly compliance audits

---

## Testing & Validation

### Security Test Suite
```bash
# Run all security tests
pytest tests/security/ -v

# Test input validation
pytest tests/test_chat_validation.py -v

# Test rate limiting
pytest tests/test_rate_limiting.py -v

# Test authentication
pytest tests/test_auth_security.py -v

# Scan for vulnerabilities
bandit -r swipesavvy-ai-agents/

# Check for hardcoded secrets
detect-secrets scan swipesavvy-ai-agents/
```

### Manual Testing
```bash
# Test invalid JWT
curl -X POST http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer invalid.token.here"
# Expected: 401 Unauthorized

# Test oversized input
curl -X POST http://localhost:8000/concierge/api/v1/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"$(python -c 'print("x"*3000)')\",...}"
# Expected: 422 Unprocessable Entity

# Test rate limiting
for i in {1..150}; do curl http://localhost:8000/health; done
# Expected: 429 Too Many Requests after 100 requests
```

---

## Support & References

**Documentation:**
- [OWASP Top 10 - 2021](https://owasp.org/Top10/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Pydantic Validation](https://docs.pydantic.dev/latest/concepts/validators/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

**Tools:**
- Bandit (Python security linting)
- Snyk (Dependency scanning)
- SonarQube (Code quality)
- OWASP ZAP (Automated scanning)

**Timeline:** 4 weeks total implementation  
**Status:** Ready for sprint planning  
**Approval Required:** Security team + Engineering lead

---

**Report Generated:** December 30, 2025  
**Last Updated:** December 30, 2025  
**Next Review:** January 13, 2026 (Phase 1 completion)
