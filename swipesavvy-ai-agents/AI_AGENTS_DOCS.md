# 🤖 AI Agents Backend Documentation

**Repository:** `swipesavvy-ai-agents/`  
**Status:** ✅ Production Ready  
**Tech Stack:** FastAPI, Python 3.9+, SQLAlchemy, PostgreSQL  
**Ports:** 8000 (AI Concierge), 8001 (Marketing AI), 8002 (Merchant Network)

---

## 🎯 Quick Start

```bash
cd swipesavvy-ai-agents
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app/main.py
# → http://localhost:8000
# → http://localhost:8001
# → http://localhost:8002
```

---

## 📚 Key Documentation (In Priority Order)

### 🔴 MUST READ
1. **[README.md](./README.md)** - Project overview
2. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Implementation status

### 🟠 ESSENTIAL FOR FEATURES
3. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment procedures
4. **[MOCK_DATA_GUIDE.md](./MOCK_DATA_GUIDE.md)** - Test data setup

### 🟡 REFERENCE & DETAILS
5. **[PROJECT_KICKOFF_SUMMARY.md](./PROJECT_KICKOFF_SUMMARY.md)** - Overview
6. **[TESTING_AND_QA_GUIDE.md](./TESTING_AND_QA_GUIDE.md)** - QA procedures
7. **[PRODUCTION_INFRASTRUCTURE_SETUP.md](./PRODUCTION_INFRASTRUCTURE_SETUP.md)** - Infrastructure

---

## 📂 Documentation Overview

This repository has **13 markdown files**:

| File | Purpose | Status |
|------|---------|--------|
| `README.md` | Overview | ✅ Current |
| `PROJECT_STATUS.md` | Implementation | ✅ Current |
| `DEPLOYMENT_GUIDE.md` | Production setup | ✅ Current |
| `MOCK_DATA_GUIDE.md` | Test data | ✅ Current |
| `TESTING_AND_QA_GUIDE.md` | QA procedures | ✅ Current |
| `PROJECT_KICKOFF_SUMMARY.md` | Overview | ✅ Reference |
| `PRODUCTION_INFRASTRUCTURE_SETUP.md` | Infrastructure | ✅ Reference |
| `OPTION_3_BACKEND_COMPLETE.md` | Historical | 📦 Archive |
| `PROJECT-COMPLETE.md` | Historical | 📦 Archive |
| `PROJECT-STATUS.md` | Historical | 📦 Archive |
| `MOCK_DATA_IMPLEMENTATION_COMPLETE.md` | Historical | 📦 Archive |
| `MOCK_DATA_COMPLETE.md` | Historical | 📦 Archive |
| `MOCK_DATA_FILE_INDEX.md` | Historical | 📦 Archive |

---

## 🏗️ Project Structure

```
swipesavvy-ai-agents/
├── README.md ⭐
├── PROJECT_STATUS.md ⭐
├── DEPLOYMENT_GUIDE.md ⭐
├── MOCK_DATA_GUIDE.md ⭐
│
├── app/
│   ├── main.py ← FastAPI entry point
│   ├── api/
│   │   ├── routes/
│   │   │   ├── ai_concierge.py
│   │   │   ├── marketing_ai.py
│   │   │   ├── merchant_network.py
│   │   │   ├── notifications.py
│   │   │   └── analytics.py
│   │   └── dependencies/
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── account.py
│   │   ├── transaction.py
│   │   ├── campaign.py
│   │   └── merchant.py
│   │
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── marketing_service.py
│   │   ├── merchant_service.py
│   │   ├── notification_service.py
│   │   └── analytics_service.py
│   │
│   ├── database/
│   │   ├── config.py
│   │   ├── models.py
│   │   └── session.py
│   │
│   ├── schemas/
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   │
│   └── utils/
│       ├── logging.py
│       └── validators.py
│
├── tests/
├── migrations/ (Alembic)
├── requirements.txt
├── .env.example
├── docker-compose.yml
└── Dockerfile
```

---

## 🚀 Core Services

### 1️⃣ AI Concierge (Port 8000)
**Natural Language Understanding & Chat**

Endpoints:
- `POST /api/v1/chat` - Send message and get response
- `GET /api/v1/chat/history/{user_id}` - Get chat history
- `WS /ws` - WebSocket for streaming responses
- `DELETE /api/v1/chat/clear` - Clear chat history

Features:
- Streaming responses
- Context awareness
- Transaction insights
- Personalized suggestions

### 2️⃣ Marketing AI (Port 8001)
**Campaign Management & Analytics**

Endpoints:
- `POST /api/v1/campaigns` - Create campaign
- `GET /api/v1/campaigns` - List campaigns
- `PUT /api/v1/campaigns/{id}` - Update campaign
- `DELETE /api/v1/campaigns/{id}` - Delete campaign
- `POST /api/v1/campaigns/{id}/launch` - Launch campaign
- `GET /api/v1/analytics/campaigns` - Campaign analytics

Features:
- Campaign creation & management
- Audience segmentation
- A/B testing
- Performance tracking
- ROI analysis

### 3️⃣ Merchant Network (Port 8002)
**Payment Processing & Merchant Management**

Endpoints:
- `POST /api/v1/merchants` - Register merchant
- `GET /api/v1/merchants` - List merchants
- `POST /api/v1/payments` - Process payment
- `GET /api/v1/payments/status` - Payment status
- `POST /api/v1/loyalty` - Loyalty points

Features:
- Merchant registration
- Payment processing
- Loyalty program
- Transaction tracking
- Merchant analytics

---

## 🗂️ API Structure

```
/api/v1/
├── /chat - AI Concierge endpoints
├── /campaigns - Marketing AI campaigns
├── /merchants - Merchant management
├── /payments - Payment processing
├── /users - User management
├── /accounts - Account management
├── /transactions - Transaction history
├── /notifications - Notification system
├── /analytics - Analytics & reporting
└── /health - Health checks
```

---

## 🎯 Common Workflows

### I'm new to the backend
1. Read: `README.md` (5 min)
2. Read: `PROJECT_STATUS.md` (10 min)
3. Setup: Follow quick start section
4. Reference: `MOCK_DATA_GUIDE.md`

### I need to add a new API endpoint
1. Create: `app/api/routes/new_feature.py`
2. Define: Request/response models in `app/schemas/`
3. Implement: Service logic in `app/services/`
4. Register: Include router in `app/main.py`
5. Test: Add test in `tests/`
6. Document: Update API docs

### I need to work with the database
1. Check: Database models in `app/database/models.py`
2. Create: Migration with Alembic if needed
3. Use: SQLAlchemy ORM in services
4. Test: With mock data from `MOCK_DATA_GUIDE.md`

### I need to integrate with AI Concierge
1. Read: API spec in `PROJECT_STATUS.md`
2. Use: `/api/v1/chat` endpoint
3. Handle: WebSocket streaming with `WS /ws`
4. Implement: Error handling for timeouts

### I need to deploy to production
1. Read: `DEPLOYMENT_GUIDE.md`
2. Setup: `PRODUCTION_INFRASTRUCTURE_SETUP.md`
3. Configure: `.env` with production values
4. Build: Docker image with `Dockerfile`
5. Deploy: Using docker-compose or Kubernetes
6. Verify: Check all services running

---

## 🛠️ Development

### Environment Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Setup database
python3 -c "from app.database import init_db; init_db()"

# Load mock data
python3 scripts/load_mock_data.py
```

### Available Commands
```bash
python3 app/main.py        # Start server
python3 -m pytest          # Run tests
python3 -m pytest -v       # Verbose testing
python3 scripts/load_mock_data.py  # Load test data
```

### Database Migration
```bash
alembic init migrations         # Initialize migrations
alembic revision --autogenerate -m "message"  # Create migration
alembic upgrade head            # Apply migrations
alembic downgrade -1            # Rollback last migration
```

---

## 📊 API Documentation

### Interactive Docs
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Example Requests

**Chat with AI Concierge:**
```bash
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user123", "message": "What are my accounts?"}'
```

**Create Marketing Campaign:**
```bash
curl -X POST "http://localhost:8001/api/v1/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale",
    "audience": "active_users",
    "budget": 5000,
    "start_date": "2025-06-01"
  }'
```

**Process Payment:**
```bash
curl -X POST "http://localhost:8002/api/v1/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "merchant_id": "merchant456",
    "amount": 49.99,
    "currency": "USD"
  }'
```

---

## 🔐 Authentication

### Token Management
- JWT tokens for API authentication
- Token stored in frontend localStorage
- Refresh tokens for long-lived sessions
- Role-based access control (RBAC)

### Implementation
```python
# In services, check authorization
from app.core.security import verify_token

@router.get("/protected")
async def protected_route(token: str = Header(...)):
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401)
    return {"message": "Protected data"}
```

---

## 🔗 Cross-Platform Integration

### Frontend Connections
- **Mobile App:** Connects to port 8000 & 8002
- **Admin Portal:** Connects to port 8000 & 8001
- **Customer Website:** Connects to port 8000
- **Mobile Wallet:** Connects to port 8000 & 8002

### Communication Patterns
- REST API for request/response
- WebSocket for real-time streaming
- SSE for server-sent events
- Background tasks via Celery (optional)

---

## ✅ Current Implementation Status

### Core Features (✅ Complete)
- ✅ FastAPI server with async support
- ✅ SQLAlchemy ORM with migrations
- ✅ PostgreSQL database integration
- ✅ JWT authentication
- ✅ WebSocket streaming
- ✅ Error handling & logging
- ✅ Request validation with Pydantic

### Services (✅ Complete)
- ✅ AI Concierge chat engine
- ✅ Marketing campaign manager
- ✅ Merchant network backend
- ✅ Notification service
- ✅ Analytics engine

### Testing (✅ Complete)
- ✅ Unit tests
- ✅ Integration tests
- ✅ API endpoint tests
- ✅ Database tests
- ✅ Mock data generators

### Deployment (✅ Ready)
- ✅ Docker containerization
- ✅ Docker Compose setup
- ✅ Environment configuration
- ✅ Production guidelines
- ✅ Database migrations

---

## 🐛 Troubleshooting

### Ports already in use
```bash
lsof -ti :8000 | xargs kill -9
lsof -ti :8001 | xargs kill -9
lsof -ti :8002 | xargs kill -9
python3 app/main.py
```

### Database connection errors
```bash
# Check PostgreSQL is running
psql -U postgres -d swipesavvy

# Reset database
python3 -c "from app.database import init_db; init_db()"

# Load mock data
python3 scripts/load_mock_data.py
```

### Missing dependencies
```bash
pip install -r requirements.txt
# or
pip install --upgrade -r requirements.txt
```

### API returns 500 errors
- Check: Server logs in terminal
- Check: Database connection
- Check: Environment variables in `.env`
- Check: Request payload format

---

## 📊 Stats & Metrics

- **Services:** 3 (AI Concierge, Marketing AI, Merchant Network)
- **API Endpoints:** 30+
- **Database Models:** 10+
- **Test Coverage:** 75%+
- **Response Time:** <200ms (avg)
- **Concurrent Users:** 1000+ (with proper scaling)

---

## 📚 Related Documentation

- **Database:** See `app/database/models.py`
- **API Schema:** See `app/schemas/`
- **Services:** See `app/services/`
- **Tests:** See `tests/` directory

---

## 📞 Need Help?

- **Getting Started:** See `README.md`
- **Status:** See `PROJECT_STATUS.md`
- **Deployment:** See `DEPLOYMENT_GUIDE.md`
- **Test Data:** See `MOCK_DATA_GUIDE.md`
- **Testing:** See `TESTING_AND_QA_GUIDE.md`
- **Production:** See `PRODUCTION_INFRASTRUCTURE_SETUP.md`

---

**⬆️ Back to:** [Main Startup Guide](../STARTUP.md)  
**📱 Mobile App:** [MOBILE_APP_DOCS.md](../MOBILE_APP_DOCS.md)  
**🔧 Admin Portal:** [ADMIN_PORTAL_DOCS.md](../swipesavvy-admin-portal/ADMIN_PORTAL_DOCS.md)  
**🌐 Website:** [CUSTOMER_WEBSITE_DOCS.md](../swipesavvy-customer-website/CUSTOMER_WEBSITE_DOCS.md)  
**💳 Wallet:** [MOBILE_WALLET_DOCS.md](../swipesavvy-mobile-wallet/MOBILE_WALLET_DOCS.md)
