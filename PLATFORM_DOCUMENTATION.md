# SwipeSavvy Platform Documentation

## Overview

SwipeSavvy is a comprehensive mobile wallet and rewards platform consisting of:
- **Mobile App** (React Native/Expo) - Customer-facing mobile wallet
- **Wallet Web** (React/Vite) - Customer web wallet interface
- **Admin Portal** (React/Vite) - Back-office management interface
- **Customer Website** (Next.js) - Marketing and landing pages
- **Backend API** (FastAPI/Python) - RESTful API services
- **AI Agents** - AI-powered concierge and support system

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              SwipeSavvy Platform                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  FRONTENDS                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Mobile App  │  │ Wallet Web  │  │Admin Portal │  │  Website    │              │
│  │(React Native)│  │(React/Vite)│  │(React/Vite) │  │ (Next.js)   │              │
│  │   PWA:3000  │  │   :3001    │  │   :5173     │  │   :8080     │              │
│  └──────┬──────┘  └──────┬─────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │               │                │                       │
│         └────────────────┴───────┬───────┴────────────────┘                       │
│                                  │                                                │
│  LOAD BALANCER                   ▼                                                │
│  ┌────────────────────────────────────────────────────────────────────┐          │
│  │              Application Load Balancer (ALB)                        │          │
│  │    • HTTPS termination (TLS 1.2+ only)                             │          │
│  │    • Host-based routing to target groups                           │          │
│  │    • SSL Policy: ELBSecurityPolicy-TLS13-1-2-2021-06              │          │
│  │    • ACM Certificate: *.swipesavvy.com (wildcard)                 │          │
│  │    • HTTP → HTTPS redirect (301)                                   │          │
│  │    • Access logs: S3 (90-day retention)                           │          │
│  └──────────────────────────────┬─────────────────────────────────────┘          │
│                                 │                                                │
│  COMPUTE                        ▼                                                │
│  ┌────────────────────────────────────────────────────────────────────┐          │
│  │              Auto Scaling Group (ASG)                               │          │
│  │    • Min: 2 instances | Max: 4 instances (production)             │          │
│  │    • Instance type: t3.large                                       │          │
│  │    • AMI: Amazon Linux 2023                                        │          │
│  │    • Multi-AZ: 2 availability zones (us-east-1a, us-east-1b)     │          │
│  │    • EBS: 50GB gp3 encrypted volumes                              │          │
│  │    • CloudWatch agent for metrics and logs                        │          │
│  └──────────────────────────────┬─────────────────────────────────────┘          │
│                                 │                                                │
│  DATA LAYER                     ▼                                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │
│  │   PostgreSQL     │  │      Redis       │  │   AI Services    │               │
│  │   (AWS RDS)      │  │  (ElastiCache)   │  │   (Together.AI)  │               │
│  │ • Version: 15.10 │  │ • Version: 7.0   │  │ • Llama 3.1 405B │               │
│  │ • Multi-AZ: Yes  │  │ • Multi-AZ: Yes  │  │ • Embeddings     │               │
│  │ • Backup: 7 days │  │ • Snapshot: 7 day│  │                  │               │
│  │ • Encrypted: KMS │  │ • Encrypted: Yes │  │                  │               │
│  │ • Perf Insights  │  │ • Auto failover  │  │                  │               │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘               │
│                                                                                    │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Production URLs

| Service | URL | Port |
|---------|-----|------|
| Backend API | https://api.swipesavvy.com | 8000 |
| Admin Portal | https://admin.swipesavvy.com | 5173 |
| Wallet Web | https://wallet.swipesavvy.com | 3001 |
| Customer Website | https://www.swipesavvy.com | 8080 |
| Mobile PWA | https://app.swipesavvy.com | 3000 |
| API Documentation | https://api.swipesavvy.com/docs | - |

---

## Infrastructure Details

### AWS Resources

| Service | Resource | Configuration |
|---------|----------|---------------|
| **VPC** | swipesavvy-prod-vpc | 10.0.0.0/16 CIDR, 2 AZs |
| **ALB** | swipesavvy-prod-alb | Public, HTTPS/HTTP listeners |
| **ASG** | swipesavvy-prod-asg | Min 2, Max 4 instances |
| **EC2** | t3.large | Amazon Linux 2023, 50GB gp3 |
| **RDS** | db.t3.medium | PostgreSQL 15.10, Multi-AZ |
| **ElastiCache** | cache.t3.medium | Redis 7.0, Multi-AZ |
| **ACM** | Wildcard cert | *.swipesavvy.com |
| **Route 53** | Hosted zone | swipesavvy.com |
| **CloudWatch** | Alarms & Logs | Full monitoring |
| **SNS** | Alerts topic | Email notifications |

### SSL/TLS Configuration

| Setting | Value |
|---------|-------|
| Certificate ARN | `arn:aws:acm:us-east-1:858955002750:certificate/8924078e-db8a-4bf1-a6ea-8a1f4fe814be` |
| Domains Covered | `swipesavvy.com`, `*.swipesavvy.com` |
| SSL Policy | `ELBSecurityPolicy-TLS13-1-2-2021-06` |
| Minimum TLS | TLS 1.2 |
| Validation | DNS (Route 53) |

### Database Configuration

| Setting | Production | Dev/Staging |
|---------|------------|-------------|
| Engine | PostgreSQL 15.10 | PostgreSQL 15.10 |
| Instance | db.t3.medium | db.t3.micro |
| Storage | 100GB gp3 | 20GB gp2 |
| Multi-AZ | Enabled | Disabled |
| Backup Retention | 7 days | 1 day |
| Backup Window | 03:00-04:00 UTC | 03:00-04:00 UTC |
| Maintenance Window | Mon 04:00-05:00 UTC | Mon 04:00-05:00 UTC |
| Deletion Protection | Enabled | Disabled |
| Performance Insights | Enabled (7 days) | Disabled |

### CloudWatch Alarms

| Alarm | Threshold | Action |
|-------|-----------|--------|
| ALB 5XX Errors | > 10 in 60s | SNS Alert |
| ALB Response Time | > 2 seconds | SNS Alert |
| RDS CPU | > 80% | SNS Alert |
| RDS Connections | > 80% of max | SNS Alert |
| Redis CPU | > 75% | SNS Alert |
| Redis Memory | > 80% | SNS Alert |
| EC2 CPU (scale up) | > 80% | Add instance |
| EC2 CPU (scale down) | < 30% | Remove instance |

---

## API Endpoints Reference

### Health & Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Liveness probe - service health |
| `/ready` | GET | Readiness probe - database connectivity |
| `/` | GET | API root - service information |

### User Authentication (`/api/v1/auth`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/signup` | POST | User registration |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/logout` | POST | User logout |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/verify-email` | POST | Email verification |
| `/api/v1/auth/resend-verification` | POST | Resend verification email |

### Admin Authentication (`/api/v1/admin/auth`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/auth/login` | POST | Admin login |
| `/api/v1/admin/auth/logout` | POST | Admin logout |
| `/api/v1/admin/auth/refresh` | POST | Refresh admin token |

### Mobile API Endpoints (`/api/v1`)

#### Accounts & Wallet

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/accounts` | GET | List user accounts |
| `/api/v1/wallet/balance` | GET | Get wallet balance |
| `/api/v1/wallet/transactions` | GET | Get wallet transactions |
| `/api/v1/wallet/payment-methods` | GET | List payment methods |

#### Transfers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/transfers` | GET | List transfers |
| `/api/v1/transfers` | POST | Create transfer |
| `/api/v1/transfers/recipients` | GET | List transfer recipients |

#### Rewards

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/rewards/points` | GET | Get reward points |
| `/api/v1/rewards/boosts` | GET | Get active boosts |
| `/api/v1/rewards/leaderboard` | GET | Get leaderboard |

#### Analytics & Goals

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/analytics` | GET | Get spending analytics |
| `/api/v1/goals` | GET | List savings goals |
| `/api/v1/goals` | POST | Create savings goal |
| `/api/v1/goals/{id}` | PUT | Update savings goal |
| `/api/v1/goals/{id}` | DELETE | Delete savings goal |
| `/api/v1/budgets` | GET | List budgets |
| `/api/v1/budgets` | POST | Create budget |

#### Banking & Cards

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/banks/linked` | GET | List linked banks |
| `/api/v1/cards` | GET | List user cards |
| `/api/v1/user/preferences` | GET | Get user preferences |
| `/api/v1/user/preferences` | PUT | Update preferences |

### Admin Dashboard (`/api/admin`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard/stats` | GET | Dashboard statistics |
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/{id}` | GET | Get user details |
| `/api/admin/merchants` | GET | List merchants |
| `/api/admin/support/tickets` | GET | List support tickets |
| `/api/admin/feature-flags` | GET | List feature flags |

### Support System (`/api/support`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/support/tickets` | GET | List user tickets |
| `/api/support/tickets` | POST | Create ticket |
| `/api/support/tickets/{id}` | GET | Get ticket details |
| `/api/support/tickets/{id}/messages` | POST | Add message |

### AI Concierge

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send chat message |
| `/api/v1/ai-concierge/agentic` | POST | Role-aware AI chat |

### Notifications

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/notifications` | GET | List notifications |
| `/api/v1/notifications/{id}/read` | POST | Mark as read |

### Feature Flags

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/feature-flags` | GET | Get user feature flags |

---

## Testing

### Test Coverage Summary

| Component | Tests | Pass Rate |
|-----------|-------|-----------|
| **API Backend** | 100 | 100% |
| **Frontend E2E** | 60 | 100% |
| **Total** | 160 | **100%** |

### Running API Tests

```bash
# Navigate to backend directory
cd swipesavvy-ai-agents

# Run comprehensive API tests
python3 -m pytest tests/test_comprehensive_api.py -v

# Run with coverage
python3 -m pytest tests/test_comprehensive_api.py --cov=app --cov-report=html
```

### Running E2E Tests (Playwright)

```bash
# Navigate to test directory
cd deliverables/03-test-scaffolding/playwright

# Install dependencies
npm install

# Run all tests
npx playwright test

# Run specific project
npx playwright test --project=admin-chromium
npx playwright test --project=wallet-chromium

# Run with UI
npx playwright test --ui
```

### Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| Health Checks | 3 | Service health endpoints |
| User Auth | 10 | Signup, login, session flows |
| Admin Auth | 5 | Admin login, RBAC |
| Mobile API | 40 | All mobile endpoints |
| Admin Dashboard | 10 | Dashboard, users, merchants |
| Support | 5 | Ticket system |
| AI Concierge | 5 | Chat endpoints |
| Rewards | 15 | Points, boosts, leaderboard |
| Analytics | 7 | Spending analytics |

---

## Deployment

### Terraform Infrastructure

```bash
# Navigate to infrastructure directory
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan changes
terraform plan -var-file="terraform.tfvars"

# Apply changes
terraform apply -var-file="terraform.tfvars"

# Destroy (use with caution)
terraform destroy -var-file="terraform.tfvars"
```

### Key Terraform Modules

| Module | Purpose |
|--------|---------|
| `modules/vpc` | VPC, subnets, routing, VPC endpoints |
| `modules/acm` | SSL certificate management |
| `modules/alb` | Load balancer, target groups, listeners |
| `modules/rds` | PostgreSQL database |
| `modules/elasticache` | Redis cache |
| `modules/ec2` | Auto Scaling Group, launch template |
| `modules/dns` | Route 53 DNS records |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET_KEY` | JWT signing secret |
| `TOGETHER_API_KEY` | AI service API key |
| `SENDGRID_API_KEY` | Email service API key |
| `AWS_REGION` | AWS region (us-east-1) |
| `ENVIRONMENT` | production/staging/development |
| `CORS_ORIGINS` | Allowed CORS origins |

---

## Security Features

### Implemented

- [x] JWT authentication with refresh tokens
- [x] Password hashing (bcrypt)
- [x] Rate limiting (slowapi)
- [x] CORS configuration
- [x] Security headers (X-Frame-Options, CSP, HSTS)
- [x] Input validation (Pydantic)
- [x] SQL injection prevention (SQLAlchemy ORM)
- [x] Role-based access control (RBAC)
- [x] TLS 1.2+ encryption in transit
- [x] KMS encryption at rest (RDS, EBS)
- [x] VPC isolation with private subnets
- [x] Security groups with least privilege

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `super_admin` | Full system access | All operations, no limits |
| `admin` | General admin | Most operations, $10k refund limit |
| `support` | Customer support | Read + support ops, $100 refund limit |
| `analyst` | Data analyst | Read-only access |

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "detail": "Error message",
  "type": "error_type",
  "code": "ERROR_CODE"
}
```

---

## Repository Structure

```
swipesavvy-mobile-app-v2/
├── src/                          # Mobile app source (React Native)
├── swipesavvy-ai-agents/         # Backend API (FastAPI)
├── swipesavvy-admin-portal/      # Admin portal (React/Vite)
├── swipesavvy-wallet-web/        # Wallet web app (React/Vite)
├── swipesavvy-customer-website-nextjs/  # Marketing website
├── infrastructure/               # Terraform IaC
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── modules/
├── deliverables/                 # Test scaffolding, docs
│   └── 03-test-scaffolding/
│       └── playwright/           # E2E tests
├── docs/                         # Documentation
└── assets/                       # Brand assets
```

---

## Contact & Support

- **Technical Issues**: support@swipesavvy.com
- **Documentation**: https://docs.swipesavvy.com
- **API Status**: https://status.swipesavvy.com

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Jan 2026 | Infrastructure upgrade to ALB/ASG, Multi-AZ |
| 1.0.0 | Jan 2026 | Initial production release |

---

*Last Updated: January 16, 2026*
