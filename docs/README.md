# SwipeSavvy Documentation Index

**Last Updated:** January 16, 2026
**Platform Status:** Production Ready (160/160 tests passing)

---

## Quick Start

| Document | Description |
|----------|-------------|
| [QUICK_START.md](../QUICK_START.md) | Local development setup |
| [PLATFORM_DOCUMENTATION.md](../PLATFORM_DOCUMENTATION.md) | Full architecture reference |
| [AWS_DEPLOYMENT_QUICKSTART.md](../AWS_DEPLOYMENT_QUICKSTART.md) | AWS deployment guide |

---

## Platform Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SwipeSavvy Platform                       │
├─────────────────────────────────────────────────────────────┤
│  Mobile App    Wallet Web    Admin Portal    Website        │
│  (Expo/RN)     (React)       (React)         (Next.js)      │
│      │             │             │               │          │
│      └─────────────┴──────┬──────┴───────────────┘          │
│                           │                                  │
│              Application Load Balancer (ALB)                │
│              (HTTPS, TLS 1.2+, Host-based routing)         │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │      FastAPI Backend    │                    │
│              │     (Python/Uvicorn)    │                    │
│              └────────────┬────────────┘                    │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│         │                 │                 │               │
│    PostgreSQL          Redis          Together.AI          │
│    (AWS RDS)       (ElastiCache)      (AI Services)        │
└─────────────────────────────────────────────────────────────┘
```

### Production URLs

| Service | URL |
|---------|-----|
| Backend API | https://api.swipesavvy.com |
| Admin Portal | https://admin.swipesavvy.com |
| Wallet Web | https://wallet.swipesavvy.com |
| Customer Website | https://www.swipesavvy.com |

---

## Repository Structure

```
swipesavvy-mobile-app-v2/
├── src/                          # Mobile app (React Native/Expo)
├── swipesavvy-ai-agents/         # Backend API (FastAPI)
├── swipesavvy-admin-portal/      # Admin portal (React/Vite)
├── swipesavvy-wallet-web/        # Wallet web app (React/Vite)
├── swipesavvy-customer-website-nextjs/  # Marketing website
├── infrastructure/               # Terraform IaC
│   └── terraform/
├── deliverables/                 # Test scaffolding
│   └── 03-test-scaffolding/
│       └── playwright/           # E2E tests
├── docs/                         # Documentation
└── assets/                       # Brand assets
```

---

## Documentation by Topic

### Setup & Development
- [QUICK_START.md](../QUICK_START.md) - Local development setup
- [PLATFORM_DOCUMENTATION.md](../PLATFORM_DOCUMENTATION.md) - Full platform reference

### Infrastructure & Deployment
- [AWS_DEPLOYMENT_QUICKSTART.md](../AWS_DEPLOYMENT_QUICKSTART.md) - Terraform deployment
- [infrastructure/GITHUB_SECRETS.md](../infrastructure/GITHUB_SECRETS.md) - CI/CD configuration

### Testing
- [deliverables/03-test-scaffolding/playwright/](../deliverables/03-test-scaffolding/playwright/) - E2E tests (60 tests)
- [swipesavvy-ai-agents/tests/](../swipesavvy-ai-agents/tests/) - API tests (100 tests)

### Component Documentation
- [swipesavvy-admin-portal/docs/](../swipesavvy-admin-portal/docs/) - Admin portal design system
- [swipesavvy-ai-agents/docs/](../swipesavvy-ai-agents/docs/) - Backend API documentation

---

## Infrastructure Configuration

### AWS Resources

| Service | Configuration |
|---------|---------------|
| ALB | HTTPS termination, host-based routing |
| ASG | Min 2, Max 4 t3.large instances |
| RDS | PostgreSQL 15.10, Multi-AZ, 7-day backups |
| ElastiCache | Redis 7.0, Multi-AZ, 7-day snapshots |
| ACM | Wildcard SSL (*.swipesavvy.com) |
| Route 53 | DNS with alias records |
| CloudWatch | Alarms and monitoring |

### Security
- TLS 1.2+ encryption in transit
- KMS encryption at rest
- VPC isolation with private subnets
- Role-based access control (RBAC)

---

## Test Coverage

| Component | Tests | Pass Rate |
|-----------|-------|-----------|
| API Backend | 100 | 100% |
| Frontend E2E | 60 | 100% |
| **Total** | **160** | **100%** |

### Running Tests

```bash
# API Tests
cd swipesavvy-ai-agents
python3 -m pytest tests/test_comprehensive_api.py -v

# E2E Tests
cd deliverables/03-test-scaffolding/playwright
npx playwright test
```

---

## Archived Documentation

Historical documentation has been moved to:
- `docs/archive/` - Old phase reports and legacy guides
- `docs/archive/legacy-guides/` - Superseded setup guides

---

## Contact

- **Technical Issues**: support@swipesavvy.com
- **Documentation Updates**: Submit PR to this repository

---

*Last Updated: January 16, 2026*
