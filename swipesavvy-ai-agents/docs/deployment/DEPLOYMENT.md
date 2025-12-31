# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Together.AI API key
- PostgreSQL (local or cloud)
- 4GB+ RAM available

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd swipesavvy-ai-agents
git checkout Together-AI-Build
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.template .env

# Edit .env and add your credentials
nano .env  # or your preferred editor
```

**Required variables:**
- `TOGETHER_API_KEY`: Your Together.AI API key

### 3. Build and Run with Docker Compose

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### 4. Verify Deployment

```bash
# Check Concierge service
curl http://localhost:8000/health

# Check RAG service
curl http://localhost:8001/health

# Check Guardrails service
curl http://localhost:8002/health

# Test end-to-end
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my account balance?",
    "session_id": "test123",
    "user_id": "user456"
  }'
```

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Concierge | 8000 | Main AI agent service |
| RAG | 8001 | Semantic search & knowledge base |
| Guardrails | 8002 | Content safety & PII protection |
| PostgreSQL | 5432 | Database with pgvector |

## Production Deployment

### Environment Variables

See [.env.template](.env.template) for all configuration options.

**Critical settings for production:**

```bash
# Set production mode
PRODUCTION=true
DEBUG=false

# Use strong database password
POSTGRES_PASSWORD=<strong-random-password>

# Set appropriate log level
LOG_LEVEL=INFO

# Configure resource limits
TOGETHER_MAX_TOKENS=1000
RATE_LIMIT_TOKENS_PER_SECOND=10
```

### Resource Requirements

**Minimum (Development):**
- CPU: 2 cores
- RAM: 4GB
- Storage: 10GB

**Recommended (Production):**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 50GB+
- Database: Separate instance with SSD

### Docker Resource Limits

Add to docker-compose.yml for each service:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

### Database Setup

**Option 1: Docker (Development)**
- Included in docker-compose.yml
- Data persists in volume

**Option 2: External PostgreSQL (Production)**

```bash
# Set in .env
POSTGRES_HOST=your-db-host.com
POSTGRES_PORT=5432
POSTGRES_DB=swipesavvy_ai
POSTGRES_USER=swipesavvy
POSTGRES_PASSWORD=<secure-password>

# Initialize schema
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -f database/schema/init.sql
```

### Monitoring

**Health Checks:**
- `/health` - Basic health status
- `/ready` - Readiness probe
- `/live` - Liveness probe
- `/metrics` - Prometheus metrics

**Prometheus Configuration:**

```yaml
scrape_configs:
  - job_name: 'swipesavvy-concierge'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    
  - job_name: 'swipesavvy-rag'
    static_configs:
      - targets: ['localhost:8001']
      
  - job_name: 'swipesavvy-guardrails'
    static_configs:
      - targets: ['localhost:8002']
```

### Logging

All services use structured JSON logging:

```bash
# View logs
docker-compose logs -f concierge
docker-compose logs -f rag
docker-compose logs -f guardrails

# Search logs
docker-compose logs concierge | grep ERROR
docker-compose logs concierge | jq '.level == "ERROR"'
```

**Production log aggregation:**
- Configure log drivers in docker-compose.yml
- Send to centralized logging (ELK, Datadog, CloudWatch)

### Scaling

**Horizontal Scaling:**

```bash
# Scale Concierge service to 3 instances
docker-compose up -d --scale concierge=3

# Load balancer required (nginx, traefik, etc.)
```

**Vertical Scaling:**
- Increase Docker resource limits
- Upgrade instance size

## Maintenance

### Backup Database

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U swipesavvy swipesavvy_ai > backup.sql

# Restore
docker-compose exec -T postgres psql -U swipesavvy swipesavvy_ai < backup.sql
```

### Update Services

```bash
# Pull latest code
git pull origin Together-AI-Build

# Rebuild and restart
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Rolling Updates (Zero Downtime)

```bash
# Update one service at a time
docker-compose up -d --no-deps --build concierge
docker-compose up -d --no-deps --build rag
docker-compose up -d --no-deps --build guardrails
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check environment variables
docker-compose config

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connectivity
docker-compose exec concierge ping postgres

# Verify credentials
docker-compose exec postgres psql -U swipesavvy -d swipesavvy_ai -c "SELECT 1;"
```

### High Memory Usage

```bash
# Check resource usage
docker stats

# Restart service
docker-compose restart <service-name>

# Check for memory leaks in logs
docker-compose logs <service-name> | grep -i memory
```

### Together.AI API Errors

```bash
# Verify API key
echo $TOGETHER_API_KEY

# Test API directly
curl -X POST https://api.together.xyz/v1/chat/completions \
  -H "Authorization: Bearer $TOGETHER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "meta-llama/Llama-3.3-70B-Instruct-Turbo", "messages": [{"role": "user", "content": "test"}]}'

# Check circuit breaker status in logs
docker-compose logs concierge | grep circuit_breaker
```

## Security Checklist

- [ ] Strong database passwords
- [ ] TOGETHER_API_KEY stored securely
- [ ] HTTPS/TLS enabled
- [ ] Rate limiting configured
- [ ] Guardrails service active
- [ ] Database not publicly accessible
- [ ] Regular security updates
- [ ] Logs sanitized (no PII)
- [ ] Access control implemented
- [ ] Environment variables not in code

## Performance Optimization

- [ ] Database indexes created
- [ ] Connection pooling enabled
- [ ] Response caching implemented
- [ ] Static files compressed
- [ ] Rate limits tuned
- [ ] Circuit breakers configured
- [ ] Load balancing setup
- [ ] CDN for static assets (if any)

---

**Support**: See [docs/development/](../development/) for architecture details  
**Monitoring**: See [LOAD-TESTING.md](LOAD-TESTING.md) for performance baselines
