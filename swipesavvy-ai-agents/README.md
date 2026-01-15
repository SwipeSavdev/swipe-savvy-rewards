# SwipeSavvy Backend API & AI Agents

**Version:** 1.0.0
**Status:** Production
**Last Updated:** January 2026

---

## Overview

SwipeSavvy is an AI-powered merchant loyalty and rewards platform. This repository contains the backend API and AI agents powering:

- **Backend API** - FastAPI-based REST API for mobile app and admin portal
- **AI Concierge** - Customer-facing chatbot for website and mobile app
- **Admin Portal API** - Authentication, merchant management, analytics
- **Website Forms API** - Contact forms, demo requests, newsletter subscriptions

---

## Production URLs

| Service | URL |
|---------|-----|
| Customer Website | https://swipesavvy.com |
| Admin Portal | https://admin.swipesavvy.com |
| API Endpoint | https://api.swipesavvy.com |

---

## Tech Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy
- **Database**: PostgreSQL (AWS RDS)
- **Cache**: Redis
- **AI/ML**: Together.AI, OpenAI
- **Infrastructure**: AWS ECS Fargate, S3, CloudFront, Route 53
- **Email**: AWS SES
- **SMS**: AWS SNS

---

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- Docker (for deployment)

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/swipesavvy/swipesavvy-ai-agents.git
cd swipesavvy-ai-agents

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Running with Docker

```bash
# Build image
docker build -t swipe-savvy-api .

# Run container
docker run -p 8000:3000 --env-file .env swipe-savvy-api
```

---

## Project Structure

```
swipesavvy-ai-agents/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   └── config.py        # Configuration and settings
│   ├── models/
│   │   └── __init__.py      # SQLAlchemy models
│   ├── routes/
│   │   ├── admin_auth.py    # Admin authentication
│   │   ├── admin_users.py   # Admin user management
│   │   ├── user_auth.py     # Mobile user authentication
│   │   ├── website_concierge.py  # AI chatbot endpoint
│   │   └── website_forms.py # Contact/demo form handlers
│   └── database.py          # Database connection
├── services/
│   └── concierge_service/   # AI Concierge service
├── tests/                   # Unit and integration tests
├── alembic/                 # Database migrations
├── docs/                    # Documentation
├── Dockerfile               # Container configuration
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

---

## API Endpoints

### Health Check

```
GET /health
```

### Admin Authentication

```
POST /api/v1/admin/auth/login
POST /api/v1/admin/auth/refresh
POST /api/v1/admin/auth/logout
GET  /api/v1/admin/auth/me
```

### Website AI Concierge

```
POST /api/v1/website/concierge/chat
```

### Website Forms

```
POST /api/v1/website/forms/contact
POST /api/v1/website/forms/demo-request
POST /api/v1/website/forms/newsletter
```

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ENVIRONMENT` | `development`, `staging`, `production` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET_KEY` | JWT signing key (min 32 chars) | Yes |
| `AWS_REGION` | AWS region | Yes |
| `SES_FROM_EMAIL` | Sender email for notifications | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No |
| `TOGETHER_API_KEY` | Together.AI API key | No |

### CORS Origins

Production CORS is configured for:
- `https://swipesavvy.com`
- `https://www.swipesavvy.com`
- `https://admin.swipesavvy.com`
- `https://api.swipesavvy.com`
- `https://app.swipesavvy.com`

---

## Deployment

### AWS Infrastructure

See [AWS_INFRASTRUCTURE.md](AWS_INFRASTRUCTURE.md) for detailed AWS setup.

**Summary:**
- **ECS Cluster**: `swipe-savvy-prod`
- **ECR Repository**: `swipe-savvy-api`
- **RDS Instance**: `swipesavvy-postgres-prod`
- **CloudFront**: Website and Admin Portal CDN

### Deploy Backend API

```bash
# 1. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  858955002750.dkr.ecr.us-east-1.amazonaws.com

# 2. Build and push Docker image
docker build --platform linux/amd64 \
  -t 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipe-savvy-api:v1.0.0 .
docker push 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipe-savvy-api:v1.0.0

# 3. Update ECS task definition and service
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs update-service \
  --cluster swipe-savvy-prod \
  --service swipe-savvy-api-blue \
  --task-definition swipe-savvy-api:NEW_VERSION \
  --force-new-deployment
```

### Deploy Admin Portal

```bash
# 1. Build production bundle
cd ../swipesavvy-admin-portal
npm run build -- --mode production

# 2. Upload to S3
aws s3 sync dist/ s3://swipesavvy-admin-portal-prod/ --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id ESEUMWFFEW03U \
  --paths "/*"
```

### Deploy Customer Website

```bash
# 1. Upload to S3
aws s3 sync ./swipesavvy-customer-website-nextjs/ \
  s3://swipesavvy-website-prod/ --delete

# 2. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id EUVVZV7PZ373M \
  --paths "/*"
```

---

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_admin_auth.py -v
```

---

## Monitoring

### CloudWatch Logs

```bash
# View recent logs
aws logs tail /ecs/swipe-savvy-api --since 10m

# Filter for errors
aws logs filter-log-events \
  --log-group-name /ecs/swipe-savvy-api \
  --filter-pattern "ERROR"
```

### Health Checks

```bash
# API health
curl https://api.swipesavvy.com/health

# Check ECS service status
aws ecs describe-services \
  --cluster swipe-savvy-prod \
  --services swipe-savvy-api-blue
```

---

## Documentation

- [AWS Infrastructure](AWS_INFRASTRUCTURE.md) - AWS resource details
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Full deployment procedures
- [Production Infrastructure](PRODUCTION_INFRASTRUCTURE_SETUP.md) - Infrastructure setup
- [Database Migrations](MIGRATIONS_GUIDE.md) - Alembic migration guide

---

## Recent Changes

### January 2026

- Deployed admin portal to AWS (S3 + CloudFront)
- Configured custom domain `admin.swipesavvy.com`
- Fixed CORS configuration for production domains
- Added password validation (bcrypt 72-byte limit)
- Fixed SQLAlchemy model reserved keyword issue
- Mobile-optimized customer website deployed

---

## Security

- JWT authentication with HS256
- Password hashing with bcrypt
- CORS restricted to allowed origins
- Rate limiting enabled
- HTTPS enforced via CloudFront
- Security headers (CSP, X-Frame-Options, etc.)

---

## License

Proprietary - SwipeSavvy Inc. 2025-2026

---

## Support

For issues and questions:
- GitHub Issues: [swipesavvy/swipesavvy-ai-agents](https://github.com/swipesavvy/swipesavvy-ai-agents/issues)
- Email: support@swipesavvy.com
