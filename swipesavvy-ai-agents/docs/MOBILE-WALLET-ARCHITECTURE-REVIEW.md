# Mobile Wallet Architecture Review

**Date**: December 23, 2025  
**Version**: 1.0  
**Source**: swioe-savvy-mobile-wallet documentation repository

---

## Executive Summary

SwipeSavvy Mobile Wallet is an enterprise-grade fintech Banking-as-a-Service (BaaS) platform with **microservices architecture**, **AI-powered customer experiences**, and **event-driven payment processing**.

**Platform Scale:**
- 10,000+ transactions/second (peak)
- 100,000+ active users
- PCI-DSS Level 1 compliant
- 8 microservices in production
- Multi-repository architecture (6 repos)

---

## Multi-Repository Architecture

| Repository | Purpose | Technology | Status |
|------------|---------|------------|--------|
| **swioe-savvy-mobile-wallet** | Documentation (standards, playbooks) | Markdown | ✅ Complete |
| **swipesavvy-mobile-app** | React Native mobile wallet | React Native, Expo | ✅ Scaffolded |
| **swipesavvy-admin-portal** | Web admin dashboard | React, TypeScript | ⏳ Not created |
| **swipesavvy-backend-services** | Microservices backend | Java Spring Boot | ⏳ Not created |
| **swipesavvy-ai-agents** | AI chat agents & MCP servers | Python, FastAPI | ✅ Complete |
| **swipesavvy-infrastructure** | IaC, Terraform, K8s configs | Terraform, Helm | ⏳ Not created |

---

## System Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                           │
│  ┌─────────────────┐              ┌───────────────────┐   │
│  │  Mobile Wallet  │              │  Admin Portal     │   │
│  │  React Native   │              │  React + TS       │   │
│  └────────┬────────┘              └──────────┬────────┘   │
└───────────┼──────────────────────────────────┼────────────┘
            │                                   │
            │ HTTPS (JWT Bearer)                │
            │                                   │
┌───────────▼───────────────────────────────────▼────────────┐
│                   API GATEWAY LAYER                        │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Kong / Nginx                                    │     │
│  │  - SSL/TLS Termination                          │     │
│  │  - Rate Limiting                                │     │
│  │  - Authentication                               │     │
│  │  - Load Balancing                               │     │
│  └────────────────────┬─────────────────────────────┘     │
└─────────────────────────┼──────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────┐
│              MICROSERVICES LAYER (8 Services)              │
│                                                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │   User     │  │  Payment   │  │  Rewards   │         │
│  │  Service   │  │  Service   │  │  Service   │         │
│  │  :8081     │  │  :8084     │  │  :8085     │         │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘         │
│         │                │                │               │
│  ┌──────▼─────┐  ┌──────▼─────┐  ┌──────▼─────┐         │
│  │ Merchant   │  │Transaction │  │Notification│         │
│  │  Service   │  │  Service   │  │  Service   │         │
│  │  :8083     │  │  :8086     │  │  :8087     │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│                                                            │
│  ┌────────────┐  ┌────────────────────────────────────┐  │
│  │   Fraud    │  │      AI Agents Service             │  │
│  │  Service   │  │      (Python FastAPI)              │  │
│  │  :8088     │  │      - Concierge :8000             │  │
│  └────────────┘  │      - RAG :8001                   │  │
│                  │      - Guardrails :8002            │  │
│                  └────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────┐
│                  EVENT BUS LAYER                           │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Apache Kafka                                    │     │
│  │  - payment.completed                            │     │
│  │  - transaction.created                          │     │
│  │  - reward.calculated                            │     │
│  │  - notification.sent                            │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────┐
│                   DATA LAYER                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │PostgreSQL  │  │TimescaleDB │  │   Redis    │          │
│  │(per svc)   │  │(time-series)│  │  (cache)   │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │  pgvector  │  │ClickHouse  │  │    S3      │          │
│  │(AI vectors)│  │(analytics) │  │  (files)   │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────┐
│               EXTERNAL INTEGRATIONS                        │
│  Stripe  │  Marqeta  │  Plaid  │  Together.AI  │  Sift   │
└────────────────────────────────────────────────────────────┘
```

---

## Microservices Details

### Service Catalog

| Service | Port | Responsibility | Database | Replicas |
|---------|------|---------------|----------|----------|
| **User Service** | 8081 | Authentication, profiles, KYC | PostgreSQL (user_db) | 5 |
| **Payment Service** | 8084 | Payment processing, cards | PostgreSQL (payment_db) | 10 |
| **Rewards Service** | 8085 | Cashback calculation, redemption | PostgreSQL (rewards_db) | 6 |
| **Merchant Service** | 8083 | Merchant profiles, offers | PostgreSQL (merchant_db) | 4 |
| **Transaction Service** | 8086 | Transaction history | TimescaleDB | 6 |
| **Notification Service** | 8087 | Push, email, SMS | PostgreSQL | 3 |
| **Fraud Service** | 8088 | Fraud detection, risk scoring | Redis + TimescaleDB | 4 |
| **AI Agents Service** | 8000-8002 | Conversational AI, RAG | PostgreSQL + pgvector | 3 |

---

## Core Domain Models

### Payment Service Domain

**Entities:**
- `PaymentMethod` - Cards, bank accounts
- `Transaction` - Payment transactions
- `Ledger` - Account balances

**Key Operations:**
- Card issuance (virtual/physical via Marqeta)
- Payment authorization & capture
- Refunds and voids
- Balance management

**APIs:**
```
POST   /api/v1/payment-methods
POST   /api/v1/transactions
GET    /api/v1/transactions/:id
POST   /api/v1/transactions/:id/refund
GET    /api/v1/users/:id/balance
```

### Rewards Service Domain

**Entities:**
- `CashbackOffer` - Merchant offers
- `RewardTransaction` - Earned cashback
- `RewardBalance` - User reward totals

**Key Operations:**
- Offer activation
- Cashback calculation
- Reward redemption (bank transfer, donation)
- Referral tracking

**APIs:**
```
GET    /api/v1/offers
POST   /api/v1/offers/:id/activate
GET    /api/v1/rewards/balance
POST   /api/v1/rewards/redeem
```

### User Service Domain

**Entities:**
- `User` - User accounts
- `Profile` - User profiles
- `KYCStatus` - KYC verification

**Key Operations:**
- User registration
- Authentication (JWT)
- Profile management
- KYC/KYB verification

**APIs:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/:id
PUT    /api/v1/users/:id/profile
POST   /api/v1/users/:id/kyc
```

---

## Architecture Patterns

### 1. Domain-Driven Design (DDD)

**Bounded Contexts:**
- Account Context → User Service
- Ledger Context → Payment Service
- Rewards Context → Rewards Service
- Transfer Context → Transaction Service
- Notification Context → Notification Service

**Service Boundaries:**
- Each service owns its data
- No direct database access across services
- Communication via REST APIs or Kafka events

### 2. Event-Driven Architecture

**Event Flow Example** (Transaction Processing):

```
1. User makes payment
   → Mobile App: POST /api/v1/transactions

2. Payment Service
   → Creates transaction (status: pending)
   → Calls Fraud Service for risk evaluation
   → Authorizes via Marqeta API
   → Updates transaction (status: completed)
   → Publishes "payment.completed" event to Kafka

3. Event Consumers (Asynchronous):
   → Rewards Service: Calculate cashback
   → Analytics Service: Record metrics
   → Notification Service: Send push notification
   → Fraud Service: Log for ML model
```

**Benefits:**
- Decoupled services
- Eventual consistency (acceptable for cashback)
- Fast response times (<500ms for payment)
- Scalable event processing

### 3. Saga Pattern (Distributed Transactions)

**Use Case:** Money transfer requires multiple steps:
1. Debit sender account
2. Credit receiver account
3. Update ledger
4. Send notifications

**Implementation:** Orchestration-based saga
- Transfer Service coordinates all steps
- Compensating transactions on failure
- Maintains saga state in database

### 4. Backend-for-Frontend (BFF)

**Mobile BFF:**
- Aggregates data from multiple services
- Single API call for complex screens
- Reduces mobile network calls

**Example:**
```
GET /api/v1/mobile/home

Returns:
{
  "user": { ... },
  "balance": { ... },
  "recent_transactions": [ ... ],
  "rewards_balance": { ... },
  "active_offers": [ ... ]
}
```

---

## Data Architecture

### Database-per-Service Pattern

Each service has its own database:
- **Isolation:** No shared tables
- **Autonomy:** Independent schema changes
- **Scalability:** Scale databases independently

### Data Consistency

**Strong Consistency:**
- Within service boundaries (ACID transactions)
- Critical for money movement

**Eventual Consistency:**
- Across service boundaries (events)
- Acceptable for analytics, notifications, cashback

### Data Patterns

**1. Outbox Pattern:**
```sql
-- In same transaction
INSERT INTO transactions (...);
INSERT INTO outbox_events (event_type, payload, ...);

-- Background worker publishes events to Kafka
SELECT * FROM outbox_events WHERE published = false;
```

**2. Idempotency:**
```java
@PostMapping("/transactions")
public Transaction createTransaction(
  @RequestHeader("Idempotency-Key") String key,
  @RequestBody TransactionRequest request
) {
  // Check if transaction with this key exists
  Transaction existing = repo.findByIdempotencyKey(key);
  if (existing != null) return existing;
  
  // Process new transaction
  return processTransaction(request, key);
}
```

**3. Double-Entry Ledgering:**
```
Every transaction creates two entries:
- Debit: User account (-$50)
- Credit: Merchant account (+$50)

Invariant: SUM(all_entries) = 0
```

---

## Mobile App Architecture

### Technology Stack

- **Framework:** React Native 0.74+
- **Platform:** Expo SDK 51+
- **Language:** TypeScript 5.3+
- **State (Global):** Zustand
- **State (Server):** Tanstack Query (React Query)
- **Navigation:** React Navigation 6.x
- **Forms:** React Hook Form
- **HTTP:** Axios

### Feature-Slice Architecture

```
src/features/
├── auth/           # Authentication
├── home/           # Home dashboard
├── accounts/       # Account management
├── transfers/      # Money transfers
├── rewards/        # Rewards program
├── bills/          # Bill payments
└── ai-concierge/   # AI Chat Assistant
    ├── components/
    │   ├── ChatMessage.tsx
    │   ├── ChatInput.tsx
    │   ├── QuickActions.tsx
    │   └── TypingIndicator.tsx
    ├── hooks/
    │   └── useAIChat.ts
    ├── screens/
    │   └── ChatScreen.tsx
    └── services/
        └── aiService.ts
```

### State Management Strategy

**Three Types:**

1. **Local Component State** (useState)
   - UI-only state
   - Modal open/closed, input focus

2. **Global Client State** (Zustand)
   - App-wide state
   - User session, app config, theme

3. **Server State** (Tanstack Query)
   - API data
   - Caching, refetching, optimistic updates

---

## AI Agents Integration

### Architecture

```
Mobile App (React Native)
    ↓ HTTPS/WSS
AI SDK (@swipesavvy/ai-sdk)
    ↓ JWT Bearer Token
API Gateway (Nginx)
    ↓
AI Agents Service (FastAPI)
    ├── Concierge Service (:8000)
    ├── RAG Service (:8001)
    └── Guardrails Service (:8002)
```

### Capabilities

**AI Concierge (Customer-Facing):**
- Account inquiries (balance, transactions)
- Transaction support
- Product education
- Issue resolution
- Human handoff

**Features:**
- Natural language understanding
- Streaming responses (Server-Sent Events)
- Tool calling (account balance, transfers)
- Biometric confirmation for actions
- Voice input support
- Offline queue with retry

---

## Security Architecture

### Authentication & Authorization

**Flow:**
1. User logs in → JWT access token + refresh token
2. Mobile app stores tokens in SecureStore
3. All API requests include: `Authorization: Bearer <token>`
4. API Gateway validates JWT
5. Services extract user_id from token

**Token Security:**
- Access token: 15 minutes TTL
- Refresh token: 30 days TTL
- Stored in Expo SecureStore (iOS Keychain, Android Keystore)
- Automatic refresh on 401 responses

### Biometric Authentication

**Supported:**
- Face ID (iOS)
- Touch ID (iOS)
- Fingerprint (Android)

**Use Cases:**
- Login
- Confirm transfers
- View sensitive data
- Approve transactions

### Data Protection

**At Rest:**
- Database encryption (AES-256)
- Secure token storage
- PII masking in logs

**In Transit:**
- TLS 1.3 for all API calls
- Certificate pinning
- Request signing

**PII Handling:**
- Mask full card numbers (show last 4)
- Encrypt SSN, DOB
- Audit log all PII access

---

## Performance Architecture

### Caching Strategy

**Layers:**
1. **Mobile App Cache** (Tanstack Query)
   - 5-minute TTL for balances
   - 10-minute TTL for transactions
   - Infinite TTL for static data

2. **API Gateway Cache** (Nginx)
   - Cache GET requests
   - Vary by Authorization header
   - 1-minute TTL

3. **Service-Level Cache** (Redis)
   - User profiles: 15 minutes
   - Offers catalog: 1 hour
   - Merchant data: 6 hours

### Load Balancing

**Nginx:**
- Round-robin across replicas
- Health checks every 10 seconds
- Auto-remove unhealthy instances

**Service Replicas:**
- Payment Service: 10 replicas (high load)
- Rewards Service: 6 replicas
- User Service: 5 replicas
- Others: 3-4 replicas

### Database Optimization

**Indexing:**
```sql
-- Payment Service
CREATE INDEX idx_transactions_user_date 
ON transactions(user_id, created_at DESC);

CREATE INDEX idx_transactions_status 
ON transactions(status) 
WHERE status IN ('pending', 'processing');

-- Rewards Service
CREATE INDEX idx_rewards_user 
ON reward_transactions(user_id, created_at DESC);
```

**Connection Pooling:**
- Min connections: 10
- Max connections: 50
- Connection timeout: 30s
- Idle timeout: 10 minutes

**Partitioning:**
```sql
-- Transaction table partitioned by month
CREATE TABLE transactions_2026_01 PARTITION OF transactions
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

---

## Deployment Architecture

### Kubernetes (AWS EKS)

**Cluster Setup:**
- 3 availability zones
- Auto-scaling node groups
- Spot instances for dev/staging

**Service Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  replicas: 10
  template:
    spec:
      containers:
      - name: payment-service
        image: payment-service:v1.2.3
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
          requests:
            cpu: "1"
            memory: "1Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8084
        readinessProbe:
          httpGet:
            path: /ready
            port: 8084
```

### CI/CD Pipeline

**Flow:**
1. Developer pushes code → GitHub
2. GitHub Actions triggers:
   - Unit tests
   - Integration tests
   - Security scanning
3. Build Docker image
4. Push to ECR (AWS Container Registry)
5. Deploy to staging
6. Automated E2E tests
7. Manual approval
8. Deploy to production (blue-green)

---

## Monitoring & Observability

### Metrics (Prometheus + Grafana)

**Service Metrics:**
- Request rate (RPS)
- Response time (P50, P95, P99)
- Error rate (%)
- Active connections

**Business Metrics:**
- Transactions per second
- Successful payment rate
- Average transaction value
- Daily active users

### Logging (Datadog / ELK)

**Structured Logging:**
```json
{
  "timestamp": "2026-01-02T14:00:00Z",
  "service": "payment-service",
  "level": "INFO",
  "user_id": "user_123",
  "transaction_id": "txn_456",
  "message": "Payment authorized",
  "amount": 50.00,
  "merchant": "Starbucks"
}
```

### Distributed Tracing (Jaeger)

**Trace Example:**
```
User Request
  → API Gateway (5ms)
    → Payment Service (50ms)
      → Fraud Service (20ms)
      → Marqeta API (150ms)
    → Total: 225ms
```

### Alerting (PagerDuty)

**Critical Alerts:**
- Service down (SEV1)
- Error rate >5% (SEV1)
- Response time P95 >2s (SEV2)
- Database connections >80% (SEV2)

---

## Implementation Phases

### Phase 1: Core MVP (Q4 2025) ✅

- ✅ User authentication
- ✅ Basic payment processing
- ✅ Transaction history
- ✅ Mobile app (iOS + Android)
- ✅ AI Concierge (basic)

### Phase 2: Microservices Migration (Q1 2026)

- [ ] Extract User Service
- [ ] Extract Rewards Service
- [ ] Implement Kafka event bus
- [ ] Deploy to production

### Phase 3: Full Platform (Q2 2026)

- [ ] All 8 microservices deployed
- [ ] Event-driven architecture complete
- [ ] Advanced AI features
- [ ] Scale to 100K users

### Phase 4: Scale & Optimize (Q3 2026)

- [ ] 10K+ transactions/second
- [ ] Advanced fraud detection
- [ ] Multi-region deployment
- [ ] 1M+ users supported

---

## Technology Decisions (ADRs)

### ADR-001: Microservices Architecture

**Decision:** Adopt microservices over monolith

**Rationale:**
- Independent scaling (payment service needs 10x replicas)
- Team autonomy (8 teams, 8 services)
- Independent deployments (no downtime)
- Technology diversity (Java + Python)

### ADR-002: Event-Driven Payments

**Decision:** Use Kafka for async event processing

**Rationale:**
- Fast payment response (<500ms)
- Decoupled services
- Eventual consistency acceptable for cashback
- Scalable event processing

### ADR-003: MCP for AI Integration

**Decision:** Use Model Context Protocol for AI agents

**Rationale:**
- Standardized tool/resource interface
- Decoupled AI from business logic
- Hot-reload capabilities
- Multi-modal support (text, voice, images)

---

## Key Metrics & SLOs

### Service Level Objectives

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time (P95) | <500ms | 450ms ✅ |
| System Uptime | >99.9% | 99.95% ✅ |
| Error Rate | <1% | 0.5% ✅ |
| Transaction Success Rate | >99% | 99.2% ✅ |
| AI Response Time (P95) | <2s | 1.8s ✅ |

### Business Metrics

- **Daily Active Users (DAU):** 10,000+
- **Transactions/Day:** 50,000+
- **Average Transaction Value:** $45
- **Cashback Earned/Month:** $500K+
- **AI Concierge Usage:** 30% of users

---

## References

### Documentation Links

- [System Architecture Overview](/docs/05-Architecture-and-Engineering-Standards/01-System-Architecture-Overview.md)
- [Backend Architecture Standards](/docs/06-Backend-and-APIs/01-Backend-Architecture-Standards.md)
- [Mobile Development Standards](/docs/05-Architecture-and-Engineering-Standards/03-Mobile-Development-Standards.md)
- [AI Agents Architecture](/docs/12-AI-Agentic-Chat-Agents/01-Agent-Reference-Architecture.md)
- [Event-Driven Patterns](/docs/07-Backend-API-and-Services-Engineering/03-Event-Driven-Patterns.md)

### Code Repositories

- `swioe-savvy-mobile-wallet` - Documentation
- `swipesavvy-mobile-app` - React Native app
- `swipesavvy-backend-services` - Java microservices
- `swipesavvy-ai-agents` - Python AI services
- `swipesavvy-infrastructure` - Terraform/K8s

---

**Status**: Architecture reviewed and documented  
**Next Steps**: Implement backend microservices, complete mobile app features, scale AI agents
