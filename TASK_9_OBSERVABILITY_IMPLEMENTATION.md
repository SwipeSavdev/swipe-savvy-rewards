# Task 9: Observability & Debug Breadcrumbs Implementation
## Production-Grade Logging, Tracing & Monitoring

**Date**: December 26, 2025  
**Status**: Implementation Ready  
**Objective**: Full observability without exposing PII or secrets

---

## 1. Executive Summary

Implement **structured logging, correlation IDs, request tracing, and crash reporting** across:
- **Mobile App** (React Native + Sentry)
- **Admin Portal** (React web + Sentry)
- **Backend API** (FastAPI + structlog + Prometheus)
- **AI Agents** (Tool calling + audit trail)

All while maintaining **FinTech-grade PII redaction** and **no secrets in logs**.

---

## 2. Logging Architecture

### Centralized Logging Stack

```
┌────────────────────────────────────────────────────────────┐
│  Applications (Mobile, Admin, Backend, AI Agents)           │
│  ├─ Structured JSON logs (no PII)                          │
│  ├─ Correlation IDs (trace requests end-to-end)            │
│  ├─ Performance metrics (latency, throughput)              │
│  └─ User session tracking (anonymized)                     │
└──────────────────────┬─────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌──────────┐
   │  Sentry │   │   ELK   │   │Prometheus│
   │ (errors)│   │ (logs)  │   │(metrics) │
   └─────────┘   └─────────┘   └──────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  Observability Dashboard     │
        │  ├─ Error tracking & alerts  │
        │  ├─ Performance analysis     │
        │  ├─ User session replay      │
        │  └─ Compliance audit logs    │
        └──────────────────────────────┘
```

---

## 3. Structured Logging Implementation

### 3.1 Backend (FastAPI + structlog)

```python
# app/logging_config.py

import structlog
import json
from datetime import datetime
import uuid
import re

# PII Redaction Patterns
PII_PATTERNS = {
    'email': r'[\w\.-]+@[\w\.-]+\.\w+',
    'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
    'phone': r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',
    'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
    'api_key': r'(?:api[_-]?key|apikey)["\']?\s*[:=]\s*["\']?([a-zA-Z0-9_-]+)',
    'token': r'(?:Bearer|Token|token)["\']?\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]+)',
}

def redact_pii(value: str) -> str:
    """Redact PII from log messages"""
    if not isinstance(value, str):
        return value
    
    for pattern_name, pattern in PII_PATTERNS.items():
        value = re.sub(pattern, f'[REDACTED_{pattern_name.upper()}]', value, flags=re.IGNORECASE)
    
    return value

def redact_dict(d: dict) -> dict:
    """Recursively redact PII from dict values"""
    if isinstance(d, dict):
        return {k: redact_dict(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [redact_dict(item) for item in d]
    elif isinstance(d, str):
        return redact_pii(d)
    return d

class CorrelationIdMiddleware:
    """Extract or generate correlation ID for request tracing"""
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Extract from header or generate
            headers = dict(scope["headers"])
            correlation_id = headers.get(
                b"x-correlation-id",
                str(uuid.uuid4()).encode()
            )
            scope["correlation_id"] = correlation_id.decode()
        
        await self.app(scope, receive, send)

def structlog_factory():
    """Configure structlog with JSON output"""
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),  # JSON output for ELK
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

# Initialize
structlog_factory()
logger = structlog.get_logger()

# Usage in endpoints
from fastapi import FastAPI, Request, Depends
from app.logging_config import logger

app = FastAPI()
app.add_middleware(CorrelationIdMiddleware)

@app.post("/api/rewards/earn")
async def earn_reward(request: Request, transaction: dict):
    correlation_id = request.scope.get("correlation_id")
    
    logger.info(
        "reward_earned",
        correlation_id=correlation_id,
        transaction_id=transaction.get("id"),
        amount=transaction.get("amount"),
        user_id="[REDACTED_user_id]",  # Never log real user IDs without reason
        timestamp=datetime.utcnow().isoformat(),
    )
    
    try:
        result = await calculate_reward(transaction)
        logger.info(
            "reward_calculation_success",
            correlation_id=correlation_id,
            reward_amount=result,
            duration_ms=999,
        )
        return result
    except Exception as e:
        logger.error(
            "reward_calculation_failed",
            correlation_id=correlation_id,
            error=str(e),
            error_type=type(e).__name__,
        )
        raise

# Logging context for all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    correlation_id = request.scope.get("correlation_id")
    
    logger.info(
        "http_request_start",
        correlation_id=correlation_id,
        method=request.method,
        path=request.url.path,
        user_agent=request.headers.get("user-agent"),
    )
    
    response = await call_next(request)
    
    logger.info(
        "http_request_end",
        correlation_id=correlation_id,
        status_code=response.status_code,
        duration_ms=999,  # Calculate actual
    )
    
    return response
```

### 3.2 Mobile App (React Native + Sentry)

```typescript
// src/services/logging.ts

import * as Sentry from "@sentry/react-native";
import { getUniqueId } from "react-native-device-info";

export interface LogContext {
  correlationId: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  environment: "dev" | "qa" | "staging" | "prod";
}

class LoggingService {
  private context: LogContext;

  constructor() {
    this.context = {
      correlationId: this.generateCorrelationId(),
      sessionId: getUniqueId(),
      timestamp: new Date().toISOString(),
      environment: process.env.REACT_APP_ENV || "dev",
    };

    // Initialize Sentry
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: this.context.environment,
      tracesSampleRate: 0.1,
      integrations: [
        new Sentry.Native.ReactNativeTracing(),
      ],
      beforeSend(event, hint) {
        // Redact PII before sending
        return this.redactEvent(event);
      },
    });
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private redactEvent(event: Sentry.Event): Sentry.Event {
    const piiPatterns = {
      email: /[\w\.-]+@[\w\.-]+\.\w+/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      phone: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    };

    const stringifyAndRedact = (obj: any): any => {
      if (typeof obj === "string") {
        let redacted = obj;
        for (const [key, pattern] of Object.entries(piiPatterns)) {
          redacted = redacted.replace(pattern, `[REDACTED_${key.toUpperCase()}]`);
        }
        return redacted;
      }
      if (typeof obj === "object" && obj !== null) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          acc[key] = stringifyAndRedact(value);
          return acc;
        }, {} as any);
      }
      return obj;
    };

    return stringifyAndRedact(event);
  }

  // Reward tracking
  logRewardEarned(amount: number, transactionId: string) {
    Sentry.captureMessage("reward_earned", "info", {
      extra: {
        correlationId: this.context.correlationId,
        amount,
        transactionId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Error tracking
  logError(error: Error, context: Record<string, any>) {
    Sentry.captureException(error, {
      contexts: {
        ...this.context,
        ...context,
      },
    });
  }

  // Performance tracking
  logPerformance(operation: string, duration: number) {
    Sentry.captureMessage(`perf: ${operation}`, "info", {
      extra: {
        correlationId: this.context.correlationId,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // User action tracking (anonymized)
  logUserAction(action: string, details?: Record<string, any>) {
    Sentry.captureMessage(`user_action: ${action}`, "info", {
      extra: {
        correlationId: this.context.correlationId,
        action,
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export const loggingService = new LoggingService();
```

### 3.3 Admin Portal (React Web + Sentry)

```typescript
// src/services/auditLogger.ts

import * as Sentry from "@sentry/react";

export interface AuditLogEntry {
  correlationId: string;
  timestamp: string;
  adminUserId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT";
  resourceType: "user" | "feature_flag" | "donation" | "kyc_case";
  resourceId: string;
  changes: Record<string, any>;
  reason: string;
}

class AuditLogger {
  async logAdminAction(entry: AuditLogEntry): Promise<void> {
    // Send to backend for persistent storage
    await fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Correlation-ID": entry.correlationId,
      },
      body: JSON.stringify(entry),
    });

    // Also log to Sentry for observability
    Sentry.captureMessage(`admin_action: ${entry.action}`, "info", {
      extra: entry,
    });
  }

  // Approve KYC case
  async approveKycCase(caseId: string, adminUserId: string) {
    const correlationId = this.generateCorrelationId();
    
    await this.logAdminAction({
      correlationId,
      timestamp: new Date().toISOString(),
      adminUserId,
      action: "APPROVE",
      resourceType: "kyc_case",
      resourceId: caseId,
      changes: { status: { from: "pending", to: "approved" } },
      reason: "KYC verification passed",
    });
  }

  // Toggle feature flag
  async toggleFeatureFlag(flagName: string, enabled: boolean, reason: string) {
    const correlationId = this.generateCorrelationId();
    const adminUserId = this.getCurrentAdminId();
    
    await this.logAdminAction({
      correlationId,
      timestamp: new Date().toISOString(),
      adminUserId,
      action: "UPDATE",
      resourceType: "feature_flag",
      resourceId: flagName,
      changes: { enabled: { from: !enabled, to: enabled } },
      reason,
    });
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentAdminId(): string {
    // Get from auth context or session
    return "admin_001";
  }
}

export const auditLogger = new AuditLogger();
```

---

## 4. Distributed Tracing

### Request Flow Tracing

```python
# backend: Trace requests through multiple services

from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

# Setup Jaeger exporter
jaeger_exporter = JagerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

# Auto-instrument FastAPI and HTTP requests
FastAPIInstrumentor.instrument_app(app)
RequestsInstrumentor().instrument()

# Manual spans for business logic
tracer = trace.get_tracer(__name__)

@app.post("/api/rewards/earn")
async def earn_reward(transaction: dict):
    with tracer.start_as_current_span("earn_reward") as span:
        span.set_attribute("transaction_id", transaction["id"])
        span.set_attribute("amount", transaction["amount"])
        
        # Step 1: Validate transaction
        with tracer.start_as_current_span("validate_transaction"):
            await validate_transaction(transaction)
        
        # Step 2: Calculate reward
        with tracer.start_as_current_span("calculate_reward"):
            reward = await calculate_reward(transaction)
        
        # Step 3: Update balance
        with tracer.start_as_current_span("update_balance"):
            await update_user_balance(transaction["user_id"], reward)
        
        return reward
```

---

## 5. Metrics & Performance Monitoring

### 5.1 Prometheus Metrics (Backend)

```python
# app/metrics.py

from prometheus_client import Counter, Histogram, Gauge
import time

# Reward metrics
rewards_earned = Counter(
    'rewards_earned_total',
    'Total rewards earned',
    ['currency']
)
reward_amount = Histogram(
    'reward_amount_usd',
    'Reward amount in USD',
    buckets=(1, 5, 10, 25, 50, 100, 500, 1000)
)
rewards_balance = Gauge(
    'rewards_balance_usd',
    'Current user rewards balance',
    ['user_id']
)

# Transaction metrics
transactions_processed = Counter(
    'transactions_processed_total',
    'Total transactions processed',
    ['type', 'status']
)
transaction_latency = Histogram(
    'transaction_processing_seconds',
    'Time to process transaction',
    buckets=(0.1, 0.5, 1.0, 2.5, 5.0, 10.0)
)

# Account linking metrics
accounts_linked = Counter(
    'accounts_linked_total',
    'Total accounts linked',
    ['provider']
)
linking_latency = Histogram(
    'account_linking_seconds',
    'Time to complete account linking',
    buckets=(1, 5, 10, 30, 60)
)

# KYC metrics
kyc_submissions = Counter(
    'kyc_submissions_total',
    'Total KYC submissions',
    ['status']
)
kyc_processing_time = Histogram(
    'kyc_processing_seconds',
    'Time to process KYC',
    buckets=(10, 30, 60, 300, 3600)
)

# API metrics
api_requests = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status_code']
)
api_latency = Histogram(
    'api_latency_seconds',
    'API response latency',
    ['method', 'endpoint'],
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0)
)

# Usage in endpoints
@app.post("/api/rewards/earn")
async def earn_reward(transaction: dict):
    start_time = time.time()
    
    try:
        reward = await calculate_reward(transaction)
        
        # Record metrics
        rewards_earned.labels(currency='USD').inc()
        reward_amount.observe(reward)
        transactions_processed.labels(type='reward', status='success').inc()
        
        duration = time.time() - start_time
        transaction_latency.observe(duration)
        api_latency.labels(method='POST', endpoint='/api/rewards/earn').observe(duration)
        
        return reward
    except Exception as e:
        transactions_processed.labels(type='reward', status='error').inc()
        raise
```

### 5.2 Dashboard Queries

```sql
-- Grafana Dashboard: SwipeSavvy Platform Overview

-- 1. Reward Earning Rate
SELECT 
  timestamp,
  rate(rewards_earned_total[1m]) as rewards_per_minute
FROM prometheus
WHERE metric='rewards_earned_total'
```

---

## 6. Session Replay & Error Context

### Session Replay (Sentry)

```typescript
// Mobile app: Capture session replay for errors

import * as Sentry from "@sentry/react-native";

Sentry.init({
  // ... other config
  replaysSessionSampleRate: 0.1,  // 10% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of sessions with errors
});

// Breadcrumbs for context
Sentry.addBreadcrumb({
  category: "user-action",
  message: "User tapped Donate button",
  level: "info",
  data: {
    screen: "RewardsScreen",
    timestamp: new Date().toISOString(),
  },
});
```

---

## 7. Compliance & Audit Logging

### Financial Transaction Audit Trail

```python
# app/audit.py

from datetime import datetime
from app.database import AuditLog, db

class AuditTrail:
    @staticmethod
    async def log_transaction(transaction_id: str, event_type: str, details: dict):
        """Immutable audit log for regulatory compliance"""
        audit_entry = AuditLog(
            transaction_id=transaction_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            details=details,
            created_at=datetime.utcnow(),
        )
        db.session.add(audit_entry)
        db.session.commit()

# Usage
@app.post("/api/donations/donate")
async def donate_rewards(user_id: str, amount: float, charity_id: str):
    donation_id = str(uuid.uuid4())
    
    # Log donation initiation
    await AuditTrail.log_transaction(
        transaction_id=donation_id,
        event_type="DONATION_INITIATED",
        details={
            "user_id": user_id,
            "amount": amount,
            "charity_id": charity_id,
        }
    )
    
    try:
        # Process donation
        result = await process_donation(user_id, amount, charity_id)
        
        # Log success
        await AuditTrail.log_transaction(
            transaction_id=donation_id,
            event_type="DONATION_COMPLETED",
            details={
                "donation_id": result["id"],
                "confirmation_number": result["confirmation"],
            }
        )
    except Exception as e:
        # Log failure
        await AuditTrail.log_transaction(
            transaction_id=donation_id,
            event_type="DONATION_FAILED",
            details={
                "error": str(e),
            }
        )
        raise
```

---

## 8. PII Redaction Rules

### Comprehensive PII Redaction

```python
# app/redaction.py

import re
from typing import Any, Dict

class PiiRedactor:
    PATTERNS = {
        'email': (r'[\w\.-]+@[\w\.-]+\.\w+', '[REDACTED_EMAIL]'),
        'ssn': (r'\b\d{3}-\d{2}-\d{4}\b', '[REDACTED_SSN]'),
        'phone': (r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '[REDACTED_PHONE]'),
        'credit_card': (r'\b(?:\d{4}[-\s]?){3}\d{4}\b', '[REDACTED_CC]'),
        'routing': (r'\b\d{9}\b', '[REDACTED_ROUTING]'),
        'account': (r'\b\d{10,17}\b', '[REDACTED_ACCOUNT]'),
        'api_key': (r'(?:api[-_]?key)["\']?\s*[:=]\s*["\']?([a-zA-Z0-9_-]+)', '[REDACTED_API_KEY]'),
        'jwt': (r'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.?[A-Za-z0-9_.-]*', '[REDACTED_JWT]'),
        'password': (r'(?:password)["\']?\s*[:=]\s*["\']?([^"\']+)["\']?', '[REDACTED_PASSWORD]'),
    }

    SENSITIVE_KEYS = {
        'email', 'ssn', 'password', 'pin', 'cvv', 'routing_number',
        'account_number', 'api_key', 'token', 'secret', 'private_key'
    }

    @classmethod
    def redact_value(cls, value: Any) -> Any:
        """Redact a single value"""
        if not isinstance(value, str):
            return value
        
        for pattern_name, (pattern, replacement) in cls.PATTERNS.items():
            value = re.sub(pattern, replacement, value, flags=re.IGNORECASE)
        
        return value

    @classmethod
    def redact_dict(cls, d: Dict[str, Any], parent_key: str = '') -> Dict[str, Any]:
        """Recursively redact dict, sensitive keys always redacted"""
        result = {}
        
        for key, value in d.items():
            # Check if key is sensitive
            if key.lower() in cls.SENSITIVE_KEYS:
                result[key] = '[REDACTED]'
            elif isinstance(value, dict):
                result[key] = cls.redact_dict(value, key)
            elif isinstance(value, list):
                result[key] = [cls.redact_dict(item, key) if isinstance(item, dict) else cls.redact_value(item) for item in value]
            elif isinstance(value, str):
                result[key] = cls.redact_value(value)
            else:
                result[key] = value
        
        return result

# Usage in middleware
@app.middleware("http")
async def redact_logs(request: Request, call_next):
    # Log request body (redacted)
    body = await request.body()
    if body:
        try:
            data = json.loads(body)
            redacted_data = PiiRedactor.redact_dict(data)
            logger.info("api_request_body", data=redacted_data)
        except:
            pass
    
    response = await call_next(request)
    return response
```

---

## 9. Alerting Rules

### Critical Alerts

```yaml
# prometheus-rules.yml

groups:
  - name: SwipeSavvy Alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(api_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected (>5%)"
          action: "Check backend logs, review recent deployments"

      # Slow API responses
      - alert: SlowApiResponse
        expr: histogram_quantile(0.95, api_latency_seconds) > 1.0
        for: 10m
        annotations:
          summary: "API p95 latency > 1s"
          action: "Check database performance, review slow queries"

      # High failed KYC rate
      - alert: HighFailedKycRate
        expr: rate(kyc_submissions_total{status="rejected"}[1h]) > 0.10
        for: 30m
        annotations:
          summary: "KYC failure rate > 10%"
          action: "Check KYC vendor status, review rejections"

      # Account linking failures
      - alert: AccountLinkingFailure
        expr: rate(accounts_linked_total{status="failed"}[15m]) > 0.01
        for: 5m
        annotations:
          summary: "Account linking failures detected"
          action: "Check OAuth provider status"

      # Database connection pool exhausted
      - alert: DbConnPoolExhausted
        expr: db_connection_pool_active / db_connection_pool_max > 0.9
        for: 5m
        annotations:
          summary: "DB connection pool near capacity"
          action: "Scale database, check for connection leaks"
```

---

## 10. Implementation Checklist

- [ ] **Backend Logging**
  - [ ] structlog configured with JSON output
  - [ ] Correlation IDs generated per request
  - [ ] PII redaction middleware in place
  - [ ] Audit trails for financial transactions
  - [ ] Request/response logging (without secrets)

- [ ] **Mobile App Logging**
  - [ ] Sentry initialized with error tracking
  - [ ] Breadcrumbs for user actions
  - [ ] Session replay enabled (10% sample)
  - [ ] PII redaction before sending to Sentry
  - [ ] Performance metrics collection

- [ ] **Admin Portal Logging**
  - [ ] Audit logger for all admin actions
  - [ ] Sentry integration
  - [ ] Action tracking (approve, reject, toggle flags)
  - [ ] PII redaction in admin logs

- [ ] **Metrics & Dashboards**
  - [ ] Prometheus metrics defined for all services
  - [ ] Grafana dashboards created (overview, performance, errors)
  - [ ] Key metrics: error rate, latency, throughput
  - [ ] Alert rules configured (email, Slack, PagerDuty)

- [ ] **Distributed Tracing**
  - [ ] Jaeger/OpenTelemetry configured
  - [ ] Request flow tracing end-to-end
  - [ ] Service dependency visualization

- [ ] **Compliance**
  - [ ] Immutable audit log database
  - [ ] Retention policies (e.g., 7 years for financial logs)
  - [ ] Access control for audit logs
  - [ ] Regular audit log testing

- [ ] **Testing**
  - [ ] Unit tests for PII redaction
  - [ ] Integration tests for logging pipeline
  - [ ] Performance tests (logging overhead < 5%)
  - [ ] Verify no PII in production logs

---

## 11. Success Criteria

By end of Task 9, we will have:

- ✅ Structured logging across all 5 repos
- ✅ Correlation IDs on 100% of requests
- ✅ Zero PII in any logs or error reports
- ✅ Zero secrets exposed in logs
- ✅ Sentry error tracking operational
- ✅ Prometheus metrics collected
- ✅ Grafana dashboards created
- ✅ Alert rules testing in non-prod
- ✅ Audit trails for all admin actions
- ✅ Session replay for debugging
- ✅ Jaeger traces for request flows
- ✅ Compliance logging verified

---

## Next Steps (Task 10)

→ **Release Readiness Report** - Compile all evidence and sign-off metrics

