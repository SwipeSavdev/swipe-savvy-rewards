# Swipe Savvy Platform – Unified Multi-Agent Master Prompt
## Architecture • Engineering • QA • AI • GTM (Single Source of Truth)

**Version:** 1.0
**Last Updated:** 2026-01-16
**Products Covered:**
- Swipe Savvy Rewards Wallet
- Swipe Savvy Merchant Loyalty & CDP
- Swipe Savvy Admin & Merchant Portals
- Secure Bail Platform
- AI Tax Filing (Future)
- Shared Ledger, Payments, Rewards, AI Infrastructure

---

## 1. Mission
This document is the **authoritative master prompt** for designing, building, testing, scaling, and operating the **entire Swipe Savvy fintech ecosystem**.

It consolidates **all prior prompt context** into a **single multi-agent execution framework** spanning:
- Product & UX
- Backend & cloud architecture
- Payments & ledger correctness
- AI/agentic systems
- Multi-app sync
- Security & compliance
- QA & release governance
- GTM & scalability

No parallel documents override this file.

---

## 2. Core Non-Negotiables (Fintech-Grade)
1. Bank-grade security (PCI-DSS, SOC2 readiness).
2. Double-entry ledger integrity at all times.
3. Idempotent APIs and replay-safe events.
4. Deterministic multi-tenant isolation.
5. Full auditability of all user, merchant, and system actions.
6. 99.9%+ uptime architecture.
7. AI outputs must be explainable and bounded.
8. No shortcuts in testing or compliance.

---

## 3. Platform Architecture Overview

### Applications
| Application | Technology | URL/Location |
|-------------|------------|--------------|
| Mobile Wallet | React Native / Expo | `swipesavvy-mobile-app-v2/` |
| Merchant Portal | React / Vite | `swipesavvy-admin-portal/` |
| Admin Portal | React / Vite | `swipesavvy-admin-portal/` |
| Wallet Web | React / Vite | `swipesavvy-wallet-web/` |
| Backend API | FastAPI / Python | `swipesavvy-ai-agents/` |
| Campaign Pages | Next.js | `swipesavvy-customer-website-nextjs/` |

### Core Services
| Service | Purpose |
|---------|---------|
| Auth / Identity / RBAC | JWT authentication, role-based access control |
| Users & Merchants | User registration, profiles, merchant onboarding |
| Wallets & Accounts | Balance management, multi-account support |
| Payments & Card Processing | Transaction processing, card management |
| Ledger & Settlement | Double-entry bookkeeping, reconciliation |
| Rewards & Loyalty | Points, tiers, boosts, leaderboards |
| AI Marketing & BI | Campaign automation, behavioral analytics |
| Notifications | Push, email (SES), SMS (SNS) |
| Reporting | Analytics, audit logs, compliance reports |
| Integrations | Plaid, Stripe, third-party APIs |

### Infrastructure
| Component | Service/Technology |
|-----------|-------------------|
| Compute | AWS EC2 (t3.large), ALB, ASG |
| Database | PostgreSQL (RDS) |
| Cache | Redis (ElastiCache) |
| Messaging | Kafka / SNS-SQS |
| Storage | S3, CloudFront |
| Auth | IAM, SSM, JWT |
| CI/CD | GitHub Actions |
| Monitoring | CloudWatch, PM2 |

### Production Environment
- **Server IP:** 54.224.8.14
- **Instance ID:** i-066b60c34e5881d36
- **Instance Type:** t3.large
- **Security Group:** sg-044f81a2a626f07df

---

## 4. Multi-Agent Roles (Unified)

| Agent | Role | Responsibilities |
|-------|------|------------------|
| **Agent A** | Enterprise Architect & Sync Auditor | System design, cross-app consistency, API contracts |
| **Agent B** | Backend Platform Engineer | FastAPI services, business logic, integrations |
| **Agent C** | Frontend & Mobile Engineer | React/React Native, UI/UX implementation |
| **Agent D** | Database & Ledger Specialist | Schema design, migrations, ledger integrity |
| **Agent E** | AI/ML & Agentic Systems Engineer | Marketing AI, behavioral learning, predictions |
| **Agent F** | QA & Multi-App Testing Engineer | Test suites, E2E workflows, regression prevention |
| **Agent G** | Cloud & DevOps Engineer | AWS infrastructure, CI/CD, deployments |
| **Agent H** | Security, Compliance & Risk Officer | PCI-DSS, SOC2, vulnerability assessment |
| **Agent I** | Product, UX & GTM Strategist | Feature prioritization, market positioning |

Agents operate sequentially with documented outputs.

---

## 5. Testing & QA Framework

### Test Coverage Requirements
| Category | Minimum | Target |
|----------|---------|--------|
| Unit Tests | 1,000 | 1,500+ |
| Integration Tests | 200 | 300+ |
| E2E Tests | 50 | 100+ |
| Load Tests | 200 concurrent | 500+ concurrent |

### Quality Gates
- All tests must pass before merge
- Code coverage minimum: 80%
- No critical security vulnerabilities
- Performance benchmarks met
- API contract validation

### Test Categories
1. **Health & Connectivity** - API availability, database connections
2. **Authentication** - Login, OTP, token refresh, logout
3. **User Management** - CRUD, profiles, preferences
4. **Wallet & Transactions** - Balances, transfers, history
5. **Rewards & Points** - Earning, redemption, tiers
6. **Merchants** - Onboarding, management, analytics
7. **Support & Tickets** - Creation, assignment, resolution
8. **Feature Flags & Notifications** - Toggle management, delivery
9. **KYC & Compliance** - Verification workflows, status tracking
10. **Integration** - Cross-service workflows, sync validation

---

## 6. AI & Automation Principles

### Marketing AI Service
- Behavioral learning from user interactions
- Predictive analytics for churn, engagement
- Automated campaign optimization
- A/B testing framework

### Agentic Workflows
- Replace manual operations where safe
- AI assists (never overrides) financial decisions
- Full human-override capability required
- Explainable outputs mandatory

### AI Boundaries
- No autonomous financial transactions
- Human approval for campaigns > $1000 spend
- Audit trail for all AI decisions
- Kill switch for all AI features

---

## 7. Release Governance

### Deployment Strategy
| Environment | Strategy | Approval |
|-------------|----------|----------|
| Development | Direct push | Developer |
| Staging | PR merge | Team lead |
| Production | Blue/green + Canary | QA + Security |

### Feature Flags
- All new features behind flags
- Gradual rollout (1% → 10% → 50% → 100%)
- Instant kill capability
- Flag state audit logging

### Go / No-Go Criteria
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Rollback plan documented
- [ ] On-call engineer assigned

---

## 8. Security & Compliance

### Standards
| Standard | Status | Target Date |
|----------|--------|-------------|
| PCI-DSS Level 1 | In Progress | Q2 2026 |
| SOC2 Type II | Planning | Q3 2026 |
| GDPR | Compliant | Current |
| CCPA | Compliant | Current |

### Security Requirements
- All endpoints require authentication (except health/public)
- JWT tokens with 24-hour expiration
- Rate limiting on all APIs
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- HTTPS only (TLS 1.3)

### Audit Requirements
- All user actions logged
- All admin actions logged with IP
- Financial transactions immutable
- 7-year retention for compliance

---

## 9. API Standards

### Authentication
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-01-16T16:20:17.712437+00:00"
}
```

### Error Response
```json
{
  "detail": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-01-16T16:20:17.712437+00:00"
}
```

### Versioning
- API version in URL: `/api/v1/...`
- Breaking changes require new version
- Deprecation notice 90 days minimum

---

## 10. Brand Guidelines

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Navy Blue | #235393 | Primary, headers |
| Green | #60BA46 | Success, CTAs |
| Yellow/Gold | #FAB915 | Highlights, rewards |
| White | #FFFFFF | Backgrounds |
| Gray | #6B7280 | Secondary text |

### Typography
- Primary Font: Inter (web), System (mobile)
- Heading Scale: 32/24/20/18/16
- Body: 14-16px

### Border Radius
- Cards: 12px
- Buttons: 8px
- Inputs: 6px

---

## 11. Outcome

When executed correctly, Swipe Savvy becomes:
- A **fintech-grade super-platform**
- Fully auditable, scalable, AI-powered
- Ready for enterprise merchants, banks, and investors
- Compliant with financial regulations
- Trusted by users for their financial data

---

## 12. Quick Reference

### SSH Access
```bash
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@54.224.8.14
```

### Service Management
```bash
pm2 list                          # View all services
pm2 restart swipesavvy-backend    # Restart API
pm2 logs swipesavvy-backend       # View logs
```

### Key Directories (Server)
```
/var/www/swipesavvy/              # Backend API
/var/www/swipesavvy-admin-portal/ # Admin Portal
/var/www/swipesavvy-wallet-web/   # Wallet Web
/var/www/swipesavvy-mobile/       # Mobile assets
```

### AWS Resources
```bash
aws ec2 describe-instances --instance-ids i-066b60c34e5881d36
aws logs get-log-events --log-group-name "/ecs/swipe-savvy-api"
```

---

**END OF SWIPE SAVVY MASTER FILE**
