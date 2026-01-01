# AI MARKETING ANALYTICS - ENVIRONMENT SETUP GUIDE
## Docker Compose, GitHub Actions, .env Templates, PostgreSQL Initialization
**Created:** December 31, 2025 | **Target:** Local dev, staging, production

---

## PART A: DOCKER COMPOSE (docker-compose.yml)

```yaml
version: '3.8'

services:
  # PostgreSQL 14 - Main database
  postgres:
    image: postgres:14-alpine
    container_name: ai-marketing-postgres
    environment:
      POSTGRES_DB: swipesavvy_agents
      POSTGRES_USER: marketing_admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-dev_password_change_me}
      POSTGRES_INITDB_ARGS: "-c max_connections=100 -c shared_buffers=256MB -c effective_cache_size=1GB"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./AI_MARKETING_ANALYTICS_MVP_01_DATABASE_SETUP.sql:/docker-entrypoint-initdb.d/01_schema.sql
      - ./scripts/init_pg_cron.sql:/docker-entrypoint-initdb.d/02_cron.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U marketing_admin"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ai-marketing-net

  # Redis - Caching layer
  redis:
    image: redis:7-alpine
    container_name: ai-marketing-redis
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ai-marketing-net

  # FastAPI backend
  backend:
    build:
      context: ./swipesavvy-ai-agents
      dockerfile: Dockerfile
    container_name: ai-marketing-backend
    environment:
      DATABASE_URL: postgresql://marketing_admin:${POSTGRES_PASSWORD:-dev_password_change_me}@postgres:5432/swipesavvy_agents
      REDIS_URL: redis://redis:6379/0
      LLM_API_KEY: ${LLM_API_KEY}
      LLM_BASE_URL: https://api.together.xyz
      ENVIRONMENT: ${ENVIRONMENT:-development}
      LOG_LEVEL: ${LOG_LEVEL:-INFO}
      WORKERS: ${WORKERS:-4}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./swipesavvy-ai-agents:/app
    command: >
      sh -c "
        alembic upgrade head &&
        gunicorn -w 4 -b 0.0.0.0:8000 --log-config=./logging.conf ai_marketing_analytics.main:app
      "
    networks:
      - ai-marketing-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # React frontend dev server
  frontend:
    image: node:18-alpine
    container_name: ai-marketing-frontend
    working_dir: /app
    environment:
      VITE_API_BASE_URL: http://localhost:8000
      NODE_ENV: ${NODE_ENV:-development}
    ports:
      - "5173:5173"
    volumes:
      - ./swipesavvy-admin-portal:/app
    command: npm run dev
    networks:
      - ai-marketing-net
    depends_on:
      - backend

  # Prometheus - Metrics collection
  prometheus:
    image: prom/prometheus:latest
    container_name: ai-marketing-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - ai-marketing-net
    depends_on:
      - backend

  # Grafana - Visualization & dashboards
  grafana:
    image: grafana/grafana:latest
    container_name: ai-marketing-grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_INSTALL_PLUGINS: ''
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana-dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana-datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml
    networks:
      - ai-marketing-net
    depends_on:
      - prometheus

  # PgAdmin - PostgreSQL web UI
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: ai-marketing-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@example.com}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
    ports:
      - "5050:80"
    networks:
      - ai-marketing-net
    depends_on:
      - postgres

networks:
  ai-marketing-net:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

---

## PART B: ENVIRONMENT VARIABLES (.env.example)

```bash
# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
DATABASE_URL=postgresql://marketing_admin:dev_password_change_me@localhost:5432/swipesavvy_agents
POSTGRES_USER=marketing_admin
POSTGRES_PASSWORD=dev_password_change_me
POSTGRES_DB=swipesavvy_agents

# ============================================================================
# REDIS CACHE
# ============================================================================
REDIS_URL=redis://localhost:6379/0
REDIS_TTL_KPI=1800  # 30 minutes
REDIS_TTL_CAMPAIGNS=3600  # 1 hour

# ============================================================================
# LLM API CONFIGURATION
# ============================================================================
LLM_API_KEY=your_together_ai_api_key_here
LLM_BASE_URL=https://api.together.xyz
LLM_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
LLM_REQUEST_TIMEOUT_MS=5000
LLM_ENABLE_CACHING=true

# ============================================================================
# FASTAPI CONFIGURATION
# ============================================================================
ENVIRONMENT=development
LOG_LEVEL=INFO
DEBUG=True
WORKERS=4
UVICORN_HOST=0.0.0.0
UVICORN_PORT=8000
UVICORN_LOG_CONFIG=./logging.conf

# ============================================================================
# SECURITY & AUTHENTICATION
# ============================================================================
JWT_SECRET_KEY=your_secret_key_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# ============================================================================
# OBSERVABILITY
# ============================================================================
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=8001
PROMETHEUS_METRICS_PATH=/metrics
GRAFANA_PASSWORD=admin
GRAFANA_USERNAME=admin

# ============================================================================
# PII & COMPLIANCE
# ============================================================================
PII_AUDIT_LOG_RETENTION_DAYS=2555  # 7 years
GDPR_ENABLED=true
CCPA_ENABLED=true
PII_ACCESS_CONFIRMATION_REQUIRED=true

# ============================================================================
# BACKGROUND JOBS (APScheduler)
# ============================================================================
SCHEDULER_ENABLED=true
SCHEDULER_JOB_STORE_URL=postgresql://marketing_admin:dev_password_change_me@localhost:5432/swipesavvy_agents
RECOMMENDATION_EVAL_INTERVAL_MINUTES=30
DATA_FRESHNESS_WARNING_MINUTES=5

# ============================================================================
# REACT / FRONTEND
# ============================================================================
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Marketing Analytics Dashboard
NODE_ENV=development

# ============================================================================
# PGADMIN (LOCAL DEVELOPMENT ONLY)
# ============================================================================
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin

# ============================================================================
# TESTING & CI/CD
# ============================================================================
TEST_DATABASE_URL=postgresql://marketing_admin:test_password@localhost:5432/swipesavvy_agents_test
PYTEST_VERBOSITY=2
COVERAGE_THRESHOLD=80
```

**To use:**
```bash
cp .env.example .env
# Edit .env with your actual secrets (never commit .env)
source .env
docker-compose up -d
```

---

## PART C: POSTGRESQL INITIALIZATION SCRIPTS

### File: scripts/init_pg_cron.sql

```sql
-- Initialize PostgreSQL extensions required for materialized view refresh automation

-- Enable pg_cron extension (if not already installed)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Note: These commands assume pg_cron is installed on the Postgres instance.
-- Installation: ALTER SYSTEM set shared_preload_libraries = 'pg_cron';
-- Then restart PostgreSQL server.

-- Add cron jobs for materialized view refresh (see main schema file for details)
-- Jobs are created in the main schema file to ensure all MVs exist first.

-- Verify pg_cron installation
SELECT * FROM cron.job ORDER BY jobid DESC LIMIT 5;

-- Monitor cron job execution
SELECT * FROM cron.job_run_details WHERE start_time > NOW() - INTERVAL '1 day' ORDER BY start_time DESC LIMIT 20;
```

### File: scripts/create_test_data.sql

```sql
-- Insert test data for development & testing

-- Test campaigns
INSERT INTO ai_campaigns (name, status, channel, subject_line, preheader, created_at)
VALUES
  ('Black Friday 2025', 'active', 'email', 'Biggest sale of the year!', 'Up to 50% off', NOW()),
  ('New Year Promo', 'active', 'email', 'New year, new deals', 'Fresh starts deserve fresh deals', NOW()),
  ('Product Launch', 'draft', 'sms', 'New product alert', 'Check it out', NOW()),
  ('Re-engagement Campaign', 'paused', 'push', 'We miss you!', 'Come back for exclusive offers', NOW())
ON CONFLICT DO NOTHING;

-- Test campaign metrics (last 30 days)
INSERT INTO campaign_metrics (campaign_id, measurement_date, sends, opens, clicks, conversions, unsubscribes)
SELECT c.id, DATE(NOW()) - (generate_series(0, 29) || ' days')::interval, 
       FLOOR(RANDOM() * 50000)::int,  -- sends: 0-50k
       FLOOR(RANDOM() * 15000)::int,  -- opens: 0-15k
       FLOOR(RANDOM() * 3000)::int,   -- clicks: 0-3k
       FLOOR(RANDOM() * 450)::int,    -- conversions: 0-450
       FLOOR(RANDOM() * 100)::int     -- unsubscribes: 0-100
FROM ai_campaigns c
WHERE c.status IN ('active', 'paused')
ON CONFLICT DO NOTHING;

-- Test campaign costs
INSERT INTO campaign_costs (campaign_id, cost_date, channel, spend_amount, currency, cost_type)
SELECT c.id, DATE(NOW()) - (generate_series(0, 29) || ' days')::interval,
       c.channel,
       FLOOR(RANDOM() * 2500 + 100)::numeric / 100,  -- spend: $1-$25
       'USD',
       'total'
FROM ai_campaigns c
WHERE c.status = 'active'
ON CONFLICT DO NOTHING;

-- Test campaign attribution
INSERT INTO campaign_attribution (campaign_id, attributed_conversions, attributed_revenue, attribution_model, measurement_date)
SELECT c.id, FLOOR(RANDOM() * 400)::int, FLOOR(RANDOM() * 20000 + 1000)::numeric,
       'last_click', DATE(NOW()) - (generate_series(0, 29) || ' days')::interval
FROM ai_campaigns c
WHERE c.status = 'active'
ON CONFLICT DO NOTHING;

-- Test recommendations
INSERT INTO recommendation_decisions (campaign_id, recommendation_type, confidence_score, decision, created_at, expected_impact)
SELECT c.id, ARRAY['test_creative', 'optimize_send_time', 'increase_budget', 'pause_low_roi'][FLOOR(RANDOM() * 4 + 1)],
       FLOOR(RANDOM() * 100 + 50) / 100.0,  -- confidence: 0.50-1.00
       ARRAY['pending', 'pending', 'accepted'][FLOOR(RANDOM() * 3 + 1)],
       NOW() - INTERVAL '7 days' + (generate_series(0, 6) || ' days')::interval,
       FLOOR(RANDOM() * 5000)::numeric
FROM ai_campaigns c
WHERE c.status = 'active'
ON CONFLICT DO NOTHING;

-- Verify test data
SELECT 'Campaigns' as table_name, COUNT(*) as row_count FROM ai_campaigns
UNION ALL
SELECT 'Campaign Metrics', COUNT(*) FROM campaign_metrics
UNION ALL
SELECT 'Campaign Costs', COUNT(*) FROM campaign_costs
UNION ALL
SELECT 'Campaign Attribution', COUNT(*) FROM campaign_attribution
UNION ALL
SELECT 'Recommendations', COUNT(*) FROM recommendation_decisions;
```

---

## PART D: GITHUB ACTIONS CI/CD PIPELINE

### File: .github/workflows/deploy.yml

```yaml
name: AI Marketing Analytics - CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # =========================================================================
  # LINT & TEST (Python backend)
  # =========================================================================
  lint-and-test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14-alpine
        env:
          POSTGRES_DB: swipesavvy_agents_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        working-directory: ./swipesavvy-ai-agents
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio pylint flake8
      
      - name: Lint with flake8
        working-directory: ./swipesavvy-ai-agents
        run: |
          flake8 ai_marketing_analytics --count --select=E9,F63,F7,F82 --show-source --statistics
          flake8 ai_marketing_analytics --count --exit-zero --max-line-length=120 --statistics
      
      - name: Lint with pylint
        working-directory: ./swipesavvy-ai-agents
        run: |
          pylint ai_marketing_analytics --disable=R,C --fail-under=8.0 || true
      
      - name: Run unit tests
        working-directory: ./swipesavvy-ai-agents
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/swipesavvy_agents_test
          REDIS_URL: redis://localhost:6379/0
        run: |
          pytest tests/unit --cov=ai_marketing_analytics --cov-report=xml --cov-report=term-missing
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./swipesavvy-ai-agents/coverage.xml
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false

  # =========================================================================
  # LINT & TEST (React frontend)
  # =========================================================================
  lint-and-test-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: './swipesavvy-admin-portal/package-lock.json'
      
      - name: Install dependencies
        working-directory: ./swipesavvy-admin-portal
        run: npm ci
      
      - name: Lint with ESLint
        working-directory: ./swipesavvy-admin-portal
        run: npm run lint -- --max-warnings=0
      
      - name: Run component tests
        working-directory: ./swipesavvy-admin-portal
        run: npm run test -- --coverage --watchAll=false
      
      - name: Build production bundle
        working-directory: ./swipesavvy-admin-portal
        run: npm run build
      
      - name: Check bundle size
        working-directory: ./swipesavvy-admin-portal
        run: |
          BUNDLE_SIZE=$(wc -c < dist/index.js)
          MAX_SIZE=500000  # 500KB
          if [ "$BUNDLE_SIZE" -gt "$MAX_SIZE" ]; then
            echo "Bundle size ($BUNDLE_SIZE) exceeds max ($MAX_SIZE)"
            exit 1
          fi

  # =========================================================================
  # BUILD & PUSH DOCKER IMAGES
  # =========================================================================
  build-backend:
    needs: lint-and-test-backend
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push backend image
        uses: docker/build-push-action@v4
        with:
          context: ./swipesavvy-ai-agents
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
          cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:latest
          cache-to: type=inline

  # =========================================================================
  # INTEGRATION TESTS (Docker Compose)
  # =========================================================================
  integration-tests:
    needs: [lint-and-test-backend, lint-and-test-frontend]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Compose
        run: docker-compose --version
      
      - name: Create .env file
        run: |
          cat > .env << EOF
          POSTGRES_PASSWORD=test_password
          ENVIRONMENT=testing
          LLM_API_KEY=test_key
          EOF
      
      - name: Start services
        run: docker-compose up -d --wait
      
      - name: Wait for backend health
        run: |
          for i in {1..30}; do
            curl -f http://localhost:8000/health && exit 0
            sleep 2
          done
          exit 1
      
      - name: Run integration tests
        run: |
          docker-compose exec -T backend pytest tests/integration --tb=short
      
      - name: Check Prometheus metrics
        run: |
          curl -s http://localhost:9090/api/v1/query?query=up | jq .
      
      - name: Stop services
        if: always()
        run: docker-compose down -v

  # =========================================================================
  # DEPLOY TO STAGING (on develop branch)
  # =========================================================================
  deploy-staging:
    needs: [build-backend, integration-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to staging
        env:
          STAGING_HOST: ${{ secrets.STAGING_HOST }}
          STAGING_USER: ${{ secrets.STAGING_USER }}
          STAGING_SSH_KEY: ${{ secrets.STAGING_SSH_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$STAGING_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H $STAGING_HOST >> ~/.ssh/known_hosts
          
          ssh $STAGING_USER@$STAGING_HOST << 'EOF'
            cd /opt/ai-marketing-analytics
            git fetch origin develop
            git checkout develop
            docker-compose -f docker-compose.staging.yml pull
            docker-compose -f docker-compose.staging.yml up -d
            docker-compose -f docker-compose.staging.yml run --rm backend alembic upgrade head
          EOF

  # =========================================================================
  # DEPLOY TO PRODUCTION (on main branch, requires approval)
  # =========================================================================
  deploy-production:
    needs: [build-backend, integration-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        env:
          PROD_HOST: ${{ secrets.PROD_HOST }}
          PROD_USER: ${{ secrets.PROD_USER }}
          PROD_SSH_KEY: ${{ secrets.PROD_SSH_KEY }}
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
        run: |
          mkdir -p ~/.ssh
          echo "$PROD_SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          ssh-keyscan -H $PROD_HOST >> ~/.ssh/known_hosts
          
          ssh $PROD_USER@$PROD_HOST << 'EOF'
            cd /opt/ai-marketing-analytics
            git fetch origin main
            git checkout main
            
            # Backup current state
            docker-compose -f docker-compose.prod.yml exec -T backend pg_dump $DATABASE_URL > /backups/pre_deploy.sql
            
            # Deploy
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head
            
            # Health check
            sleep 10
            curl -f http://localhost:8000/health || exit 1
          EOF
      
      - name: Notify Slack
        if: success()
        run: |
          curl -X POST ${{ env.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text": "AI Marketing Analytics deployed to production ✅"}'
```

---

## PART E: ENGINEER SETUP GUIDE

### Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/swipesavvy/ai-marketing-analytics.git
cd ai-marketing-analytics

# 2. Copy environment template
cp .env.example .env
# Edit .env: set LLM_API_KEY and other secrets

# 3. Start all services with Docker Compose
docker-compose up -d

# 4. Initialize database (run once)
docker-compose exec backend python -m alembic upgrade head
docker-compose exec backend python -m scripts.create_test_data

# 5. Verify services
# Backend: http://localhost:8000/docs (Swagger UI)
# Frontend: http://localhost:5173
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
# PgAdmin: http://localhost:5050 (admin@example.com/admin)
```

### Manual Local Setup (if not using Docker)

```bash
# Backend setup
cd swipesavvy-ai-agents
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
source ../.env
uvicorn ai_marketing_analytics.main:app --reload

# Frontend setup (new terminal)
cd swipesavvy-admin-portal
npm install
npm run dev
```

### Running Tests

```bash
# Unit tests (backend)
docker-compose exec backend pytest tests/unit -v --cov=ai_marketing_analytics

# Integration tests (backend)
docker-compose exec backend pytest tests/integration -v

# Component tests (frontend)
docker-compose exec frontend npm run test

# All tests
npm run ci  # runs entire CI/CD locally
```

### Database Migrations

```bash
# Create new migration (after schema change)
docker-compose exec backend alembic revision --autogenerate -m "add_new_column"

# Apply migrations
docker-compose exec backend alembic upgrade head

# Rollback
docker-compose exec backend alembic downgrade -1
```

### Monitoring

```bash
# View logs
docker-compose logs backend -f
docker-compose logs postgres -f

# Access Grafana dashboard
# http://localhost:3000
# Add Prometheus datasource: http://prometheus:9090

# Query metrics
curl http://localhost:9090/api/v1/query?query=http_requests_total
```

### Troubleshooting

**Port 5432 already in use:**
```bash
docker-compose down
# OR kill process: lsof -ti:5432 | xargs kill -9
```

**Database connection error:**
```bash
# Check if Postgres is healthy
docker-compose ps
docker-compose logs postgres

# Reset database
docker volume rm ai-marketing-analytics_postgres_data
docker-compose up postgres -d
```

**Frontend blank page:**
```bash
# Clear node_modules & reinstall
cd swipesavvy-admin-portal
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment (Staging)
- [ ] All tests pass (unit, integration, component)
- [ ] Code review approved by 2+ engineers
- [ ] Database migrations tested on staging
- [ ] Performance tests pass (latency SLOs)
- [ ] Security audit completed (RBAC, PII gating, SQL injection)
- [ ] Monitoring configured (Prometheus, Grafana, alerts)

### Deployment (Main → Production)
- [ ] Infrastructure ready (database backups, load balancer, CDN)
- [ ] Environment variables configured (secrets manager)
- [ ] Smoke tests pass in production environment
- [ ] Runbooks reviewed and on-call team briefed
- [ ] Rollback plan documented and tested

### Post-Deployment (First 24 hours)
- [ ] Monitor error rate <0.1%
- [ ] Monitor latency p95 <200ms
- [ ] Monitor data freshness <5 minutes
- [ ] No PII access violations logged
- [ ] Recommendation acceptance >20%

---

**END OF SETUP GUIDE**

*For additional help:*
- *Docker: https://docs.docker.com*
- *PostgreSQL: https://www.postgresql.org/docs*
- *FastAPI: https://fastapi.tiangolo.com*
- *React: https://react.dev*
- *GitHub Actions: https://docs.github.com/actions*
