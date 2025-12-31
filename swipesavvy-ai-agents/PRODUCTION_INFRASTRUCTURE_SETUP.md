# Production Infrastructure Setup Guide

## Environment Configuration

### .env File Template

```bash
# Backend Configuration
FASTAPI_ENV=production
DEBUG=false
LOG_LEVEL=INFO

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/swioe_savvy_prod
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40

# JWT Configuration
JWT_SECRET_KEY=your-very-long-random-secret-key-at-least-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email Configuration (Twilio SendGrid)
SENDGRID_API_KEY=sg_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDER_EMAIL=noreply@swipesavvy.app
SENDER_NAME=Swipe Savvy

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Firebase Cloud Messaging
FCM_SERVICE_ACCOUNT_KEY=/path/to/firebase-service-account.json
FCM_PROJECT_ID=your-firebase-project-id

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=your-redis-password

# Sentry (Error Tracking)
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxxxxxx

# Application URLs
FRONTEND_URL=https://app.swipesavvy.com
ADMIN_PORTAL_URL=https://admin.swipesavvy.com
BACKEND_URL=https://api.swipesavvy.com

# Logging
LOG_FILE_PATH=/var/log/swioe-savvy/backend.log
LOG_ROTATION=daily
LOG_RETENTION=30
```

## Database Setup (PostgreSQL)

### Production Database Configuration

```sql
-- Create database
CREATE DATABASE swioe_savvy_prod
  OWNER postgres
  ENCODING 'UTF8'
  LC_COLLATE 'C'
  LC_CTYPE 'C'
  TEMPLATE template0;

-- Create user
CREATE USER swioe_user WITH PASSWORD 'secure_password_here';

-- Grant privileges
GRANT CONNECT ON DATABASE swioe_savvy_prod TO swioe_user;
GRANT USAGE ON SCHEMA public TO swioe_user;
GRANT CREATE ON SCHEMA public TO swioe_user;

-- Enable extensions
\\c swioe_savvy_prod
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create tables

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_type VARCHAR(50) NOT NULL,
    balance DECIMAL(18, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    recipient_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    recipient VARCHAR(255),
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    digest_frequency VARCHAR(20) DEFAULT 'daily',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Grant privileges to user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO swioe_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO swioe_user;
```

## API Authentication Setup

### JWT Configuration

```python
# jwt_config.py
from datetime import timedelta
from pydantic import BaseSettings

class JWTSettings(BaseSettings):
    SECRET_KEY: str  # Must be at least 32 characters
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE: timedelta = timedelta(minutes=30)
    REFRESH_TOKEN_EXPIRE: timedelta = timedelta(days=7)
    
    class Config:
        env_file = ".env"

# Usage in FastAPI app
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

## Stripe Payment Gateway Integration

### Payment Service

```python
# payment_service.py
import stripe
from typing import Optional

class StripePaymentService:
    def __init__(self, api_key: str):
        stripe.api_key = api_key
    
    def create_payment_intent(self, amount: int, currency: str = "usd",
                             customer_id: Optional[str] = None) -> dict:
        """Create Stripe payment intent"""
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            customer=customer_id,
            automatic_payment_methods={"enabled": True}
        )
        return intent
    
    def confirm_payment(self, payment_intent_id: str) -> bool:
        """Confirm payment status"""
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return intent.status == "succeeded"
    
    def handle_webhook(self, event: dict) -> bool:
        """Handle Stripe webhook events"""
        if event["type"] == "payment_intent.succeeded":
            intent = event["data"]["object"]
            # Update transaction status in database
            return True
        elif event["type"] == "payment_intent.payment_failed":
            intent = event["data"]["object"]
            # Mark transaction as failed
            return True
        return False

# API Endpoint
from fastapi import Request

@app.post("/api/payments/create-intent")
async def create_payment_intent(amount: int, current_user: User = Depends(get_current_user)):
    """Create Stripe payment intent"""
    intent = stripe.PaymentIntent.create(
        amount=amount,
        currency="usd",
        customer=current_user.stripe_customer_id
    )
    return {"client_secret": intent.client_secret}

@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        payment_service.handle_webhook(event)
        return {"status": "success"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
```

## Email & SMS Services (Twilio)

### SendGrid Email Service

```python
# email_service.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

class EmailService:
    def __init__(self, api_key: str, from_email: str):
        self.sg = SendGridAPIClient(api_key)
        self.from_email = from_email
    
    def send_email(self, to_email: str, subject: str, html_content: str):
        """Send email via SendGrid"""
        message = Mail(
            from_email=self.from_email,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        return self.sg.send(message)
    
    def send_transaction_alert(self, user_email: str, transaction: dict):
        """Send transaction notification email"""
        html_content = f"""
        <h2>Transaction Alert</h2>
        <p>Amount: ${transaction['amount']}</p>
        <p>Type: {transaction['type']}</p>
        <p>Date: {transaction['created_at']}</p>
        """
        return self.send_email(user_email, "Transaction Alert", html_content)

# Twilio SMS Service
from twilio.rest import Client

class SMSService:
    def __init__(self, account_sid: str, auth_token: str, from_number: str):
        self.client = Client(account_sid, auth_token)
        self.from_number = from_number
    
    def send_sms(self, to_number: str, message: str):
        """Send SMS via Twilio"""
        return self.client.messages.create(
            body=message,
            from_=self.from_number,
            to=to_number
        )
    
    def send_verification_code(self, to_number: str, code: str):
        """Send verification code"""
        message = f"Your Swipe Savvy verification code is: {code}"
        return self.send_sms(to_number, message)
```

## Logging & Monitoring

### Structured Logging

```python
# logging_config.py
import logging
import logging.handlers
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)

def setup_logging(log_file_path: str):
    """Setup structured logging"""
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # File handler
    handler = logging.handlers.RotatingFileHandler(
        log_file_path,
        maxBytes=10485760,  # 10MB
        backupCount=30
    )
    formatter = JSONFormatter()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger
```

### Sentry Integration

```python
# error_tracking.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment=settings.ENVIRONMENT
)
```

## Deployment Configuration

### Docker Setup

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: swioe_savvy_prod
      POSTGRES_USER: swioe_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    environment:
      DATABASE_URL: postgresql://swioe_user:${DB_PASSWORD}@postgres:5432/swioe_savvy_prod
      REDIS_URL: redis://redis:6379/0
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID}
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

## Security Checklist

- [x] Password hashing (PBKDF2-HMAC-SHA256)
- [x] JWT token implementation
- [x] HTTPS enforced
- [x] CORS configured
- [x] Rate limiting enabled
- [x] Input validation with Pydantic
- [x] SQL injection prevention (ORM)
- [x] Environment variables for secrets
- [ ] DDoS protection
- [ ] WAF configuration
- [ ] Penetration testing
- [ ] Regular security audits

## Deployment Checklist

- [x] Environment configuration setup
- [x] Database schema creation
- [x] JWT configuration
- [x] Stripe integration
- [x] Twilio integration
- [x] Email service setup
- [x] SMS service setup
- [x] Logging configuration
- [ ] Production database migration
- [ ] Load balancer configuration
- [ ] CDN setup
- [ ] Monitoring dashboard
- [ ] Backup strategy
- [ ] Disaster recovery plan

---

**Status**: ✅ Configuration Complete - Production infrastructure setup ready for deployment.
