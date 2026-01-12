# SwipeSavvy Platform Documentation

## Overview

SwipeSavvy is a comprehensive mobile wallet platform consisting of:
- **Mobile App** (React Native/Expo) - Customer-facing mobile wallet
- **Admin Portal** (React/Vite) - Back-office management interface
- **Backend API** (FastAPI/Python) - RESTful API services
- **AI Agents** - AI-powered concierge and support system

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SwipeSavvy Platform                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │  Mobile App  │    │ Admin Portal │    │     Backend Services      │  │
│  │ (React Native)│    │ (React/Vite) │    │       (FastAPI)          │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────────┘  │
│         │                   │                       │                   │
│         └───────────────────┼───────────────────────┘                   │
│                             │                                           │
│                    ┌────────▼────────┐                                  │
│                    │  API Gateway    │                                  │
│                    │ api.swipesavvy  │                                  │
│                    │     .com        │                                  │
│                    └────────┬────────┘                                  │
│                             │                                           │
│         ┌───────────────────┼───────────────────┐                      │
│         │                   │                   │                      │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐               │
│  │  PostgreSQL │    │    Redis    │    │ AI Services │               │
│  │  (AWS RDS)  │    │   (Cache)   │    │ (Together)  │               │
│  └─────────────┘    └─────────────┘    └─────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Production URLs

| Service | URL |
|---------|-----|
| Backend API | https://api.swipesavvy.com |
| Admin Portal | https://admin.swipesavvy.com |
| API Documentation | https://api.swipesavvy.com/docs |

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

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | Mobile app users |
| `admin_users` | Admin portal users |
| `wallet_transactions` | Wallet transaction history |
| `support_tickets` | Customer support tickets |
| `ticket_messages` | Support ticket messages |

### Financial Tables

| Table | Description |
|-------|-------------|
| `savings_goals` | User savings goals |
| `budgets` | User budget tracking |
| `linked_banks` | Connected bank accounts |
| `payment_methods` | Saved payment methods |
| `user_cards` | Virtual/physical cards |

### Settings Tables

| Table | Description |
|-------|-------------|
| `user_preferences` | User app preferences |
| `feature_flags` | Feature flag configurations |
| `app_settings` | Application settings |

---

## Authentication

### JWT Tokens

All API requests require JWT authentication:

```bash
Authorization: Bearer <access_token>
```

### Token Expiration

| Token Type | Expiration |
|------------|------------|
| Access Token | 30 minutes |
| Refresh Token | 7 days |

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `super_admin` | Full system access | All operations, no limits |
| `admin` | General admin | Most operations, $10k refund limit |
| `support` | Customer support | Read + support ops, $100 refund limit |
| `analyst` | Data analyst | Read-only access |

---

## Mobile App Screens

### Connected Screens (Production Ready)

| Screen | Status | API Integration |
|--------|--------|-----------------|
| Home | ✅ Complete | `/api/v1/accounts`, `/api/v1/wallet/balance` |
| Login | ✅ Complete | `/api/v1/auth/login` |
| Signup | ✅ Complete | `/api/v1/auth/signup` |
| Wallet | ✅ Complete | `/api/v1/wallet/*` |
| Transfers | ✅ Complete | `/api/v1/transfers/*` |
| Rewards | ✅ Complete | `/api/v1/rewards/*` |
| Profile | ✅ Complete | `/api/v1/user/*` |
| Cards | ✅ Complete | `/api/v1/cards` |
| Analytics | ✅ Complete | `/api/v1/analytics` |
| Savings Goals | ✅ Complete | `/api/v1/goals` |
| Budgets | ✅ Complete | `/api/v1/budgets` |
| Chat (AI) | ✅ Complete | `/chat` |
| Support | ✅ Complete | `/api/support/*` |
| Leaderboard | ✅ Complete | `/api/v1/rewards/leaderboard` |

---

## Admin Portal Features

### Dashboard
- Total users, transactions, revenue
- Recent activity feed
- Quick action buttons

### User Management
- View/search users
- KYC status management
- Account actions (suspend, verify)

### Merchant Management
- Merchant onboarding (Fiserv integration)
- Transaction history
- Fee configuration

### Support System
- Ticket queue management
- AI-assisted responses
- Escalation workflow

### Feature Flags
- Enable/disable features
- A/B testing
- Gradual rollouts

### Analytics
- Transaction trends
- User growth metrics
- Revenue reports

---

## Testing

### Running E2E Tests

```bash
# Navigate to backend directory
cd swipesavvy-ai-agents

# Run all E2E tests
python3 -m pytest tests/e2e/test_platform_e2e.py -v --asyncio-mode=auto

# Run specific test class
python3 -m pytest tests/e2e/test_platform_e2e.py::TestMobileAPIEndpoints -v

# Run with coverage
python3 -m pytest tests/e2e/test_platform_e2e.py --cov=app --cov-report=html
```

### Test Categories

| Category | Tests | Description |
|----------|-------|-------------|
| Health Checks | 3 | Service health endpoints |
| User Auth | 3 | Signup, login flows |
| Admin Auth | 2 | Admin login |
| Mobile API | 12 | All mobile endpoints |
| Admin Dashboard | 3 | Dashboard stats |
| Support | 2 | Ticket system |
| AI Concierge | 2 | Chat endpoints |
| Security | 4 | CORS, headers, rate limiting |
| **Total** | **35** | All passing |

### Manual Testing

```bash
# Test health endpoint
curl https://api.swipesavvy.com/health

# Test user signup
curl -X POST https://api.swipesavvy.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!",...}'

# Test admin login
curl -X POST https://api.swipesavvy.com/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swipesavvy.com","password":"Admin123!"}'
```

---

## Deployment

### Infrastructure (AWS)

| Service | Resource | Purpose |
|---------|----------|---------|
| EC2 | t3.medium | Backend API server |
| RDS | PostgreSQL 15 | Database |
| ElastiCache | Redis | Session/cache |
| CloudWatch | Logs | Monitoring |
| Route53 | DNS | Domain management |

### Deployment Commands

```bash
# SSH to production server
ssh -i swipesavvy-key.pem ec2-user@54.224.8.14

# Restart backend service
pm2 restart swipesavvy-backend

# View logs
pm2 logs swipesavvy-backend

# Check status
pm2 status
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | JWT signing secret |
| `TOGETHER_API_KEY` | AI service API key |
| `AWS_REGION` | AWS region |
| `ENVIRONMENT` | production/development |
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

### Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

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

## Contact & Support

- **Technical Issues**: support@swipesavvy.com
- **Documentation**: https://docs.swipesavvy.com
- **API Status**: https://status.swipesavvy.com

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial production release |

---

*Last Updated: January 12, 2026*
