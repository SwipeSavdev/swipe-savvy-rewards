# SwipeSavvy Production Deployment Runbook
**Version:** 1.0  
**Created:** December 28, 2025  
**Status:** PRODUCTION READY ✅  

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Deployment](#deployment)
6. [Verification](#verification)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Rollback](#rollback)
10. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Quick Start

```bash
# For experienced DevOps engineers - 3 commands to deploy:

# 1. Setup database
python setup_database.py

# 2. Start server
cd swipesavvy-mobile-app && python main.py

# 3. Verify
curl http://127.0.0.1:8888/health | python -m json.tool
```

---

## Prerequisites

### System Requirements
- **OS:** Linux or macOS
- **CPU:** 2+ cores
- **Memory:** 512MB+ RAM
- **Disk:** 1GB+ available
- **Python:** 3.10+ (3.11+ recommended)
- **PostgreSQL:** 12+ (13+ recommended)

### Software Requirements
- Git
- Python Virtual Environment
- PostgreSQL client tools

### Network Requirements
- Port 8888 accessible (or configured alternative)
- Database port 5432 accessible (or configured alternative)
- Outbound HTTPS for logging/monitoring (optional)

### Credentials Required
- PostgreSQL username and password
- Database name
- API configuration parameters

---

## Installation

### Step 1: Clone and Setup Environment

```bash
# Navigate to project directory
cd /path/to/swipesavvy-mobile-app-v2

# Activate virtual environment
source .venv/bin/activate

# Verify Python version
python --version  # Should be 3.10+

# Install/update dependencies
pip install -r requirements.txt
```

### Step 2: Verify Dependencies

```bash
# Test FastAPI installation
python -c "import fastapi; print('FastAPI OK')"

# Test SQLAlchemy
python -c "import sqlalchemy; print('SQLAlchemy OK')"

# Test PostgreSQL driver
python -c "import psycopg2; print('psycopg2 OK')"
```

### Step 3: Configure Environment

```bash
# Copy production environment file
cp .env.production .env

# Edit with your credentials
nano .env

# Verify PostgreSQL connection
psql -h localhost -U postgres -d swipesavvy_agents -c "SELECT 1"
```

---

## Configuration

### Environment Variables

```bash
# Database Configuration
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_NAME=swipesavvy_agents

# Server Configuration
export SERVER_HOST=0.0.0.0
export SERVER_PORT=8888
export ENVIRONMENT=production
export DEBUG=false

# Logging
export LOG_LEVEL=INFO
export LOG_FORMAT=json
export LOG_FILE=/var/log/swipesavvy/api.log

# Monitoring
export ENABLE_METRICS=true
export ENABLE_TRACING=true
export ENABLE_ERROR_TRACKING=true

# Features
export ENABLE_ANALYTICS=true
export ENABLE_AB_TESTING=true
export ENABLE_OPTIMIZATION=true
export ENABLE_PHASE4=true
```

### PostgreSQL Setup

```bash
# Create database
createdb swipesavvy_agents -U postgres

# Initialize schema
python setup_database.py

# Verify tables
psql -h localhost -U postgres -d swipesavvy_agents -c "\\dt"
```

### Verify Configuration

```bash
# Test configuration loading
cd swipesavvy-mobile-app
python -c "from config import ProductionConfig; print(ProductionConfig.get_summary())"
```

---

## Deployment

### Option 1: Direct Python Execution (Development)

```bash
cd swipesavvy-mobile-app
python main.py
```

**Output should show:**
```
🚀 Starting SwipeSavvy Backend API Server...
✅ Phase 2 services imported successfully
✅ Database connection successful
✅ Campaign routes registered (7 endpoints)
✅ User routes registered (5 endpoints)
✅ Admin routes registered (5 endpoints)
Application startup complete
```

### Option 2: Uvicorn with Workers (Production)

```bash
cd swipesavvy-mobile-app
python -m uvicorn main:app \
    --host 0.0.0.0 \
    --port 8888 \
    --workers 4 \
    --loop uvloop \
    --log-level info
```

### Option 3: Automated Deployment Script

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh

# Script will:
# 1. Verify environment
# 2. Check dependencies
# 3. Load configuration
# 4. Start API server
```

### Option 4: Systemd Service (Linux)

Create `/etc/systemd/system/swipesavvy.service`:

```ini
[Unit]
Description=SwipeSavvy Backend API
After=network.target postgresql.service

[Service]
Type=notify
User=swipesavvy
WorkingDirectory=/path/to/swipesavvy-mobile-app-v2
Environment="DB_HOST=localhost"
Environment="DB_PORT=5432"
Environment="DB_USER=postgres"
Environment="DB_PASSWORD=your_password"
Environment="DB_NAME=swipesavvy_agents"
ExecStart=/path/to/.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8888
ExecReload=/bin/kill -HUP $MAINPID
KillMode=process
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable swipesavvy
sudo systemctl start swipesavvy
sudo systemctl status swipesavvy
```

---

## Verification

### Health Check

```bash
# Test health endpoint
curl http://127.0.0.1:8888/health

# Expected response:
# {
#   "status": "healthy",
#   "database": "connected",
#   "version": "1.0.0"
# }
```

### API Endpoint Validation

```bash
# List all endpoints (Swagger UI)
curl http://127.0.0.1:8888/docs

# Test campaign endpoints
curl http://127.0.0.1:8888/api/campaigns
curl http://127.0.0.1:8888/api/users/1

# Test analytics
curl http://127.0.0.1:8888/api/analytics/campaigns/count
```

### Database Connection

```bash
# Verify database connectivity
psql -h localhost -U postgres -d swipesavvy_agents -c "SELECT COUNT(*) FROM campaign_analytics_daily"

# Check table status
psql -h localhost -U postgres -d swipesavvy_agents -c "\\dt+"
```

### Run Automated Tests

```bash
# Run all tests
python -m pytest tests/ -v

# Run specific test suite
python -m pytest tests/test_endpoints.py -v
python -m pytest tests/test_integration.py -v
python -m pytest tests/test_load.py -v
```

---

## Monitoring

### View Logs

```bash
# Console output
# Logs appear in terminal where server is running

# File logs (if configured)
tail -f /var/log/swipesavvy/api.log

# JSON structured logs
tail -f /var/log/swipesavvy/api.log | python -m json.tool
```

### Monitor Performance

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://127.0.0.1:8888/health

# Monitor processes
watch -n 1 'ps aux | grep main.py'

# Monitor database connections
psql -h localhost -U postgres -d swipesavvy_agents -c "SELECT count(*) FROM pg_stat_activity;"
```

### Monitoring Dashboard

The monitoring system collects metrics for:
- Request response times
- Error rates
- Database performance
- Memory usage
- Active connections
- Throughput (ops/sec)

Access via monitoring UI (if deployed):
- Prometheus: http://127.0.0.1:9090
- Grafana: http://127.0.0.1:3000

---

## Troubleshooting

### Issue: Database Connection Failed

**Error:** `"❌ Database connection failed"`

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   psql -h localhost -U postgres -c "SELECT 1"
   ```

2. Check credentials in .env file:
   ```bash
   cat .env | grep DB_
   ```

3. Test database exists:
   ```bash
   psql -h localhost -U postgres -l | grep swipesavvy
   ```

4. Create database if missing:
   ```bash
   python setup_database.py
   ```

### Issue: Port Already in Use

**Error:** `"Address already in use"`

**Solutions:**
1. Find process using port:
   ```bash
   lsof -i :8888
   ```

2. Kill existing process:
   ```bash
   kill -9 <PID>
   ```

3. Use different port:
   ```bash
   export SERVER_PORT=9000
   python main.py
   ```

### Issue: High Response Times

**Error:** Response times > 100ms

**Solutions:**
1. Check database performance:
   ```bash
   psql -h localhost -d swipesavvy_agents -c "\\d+ campaign_analytics_daily"
   ```

2. Monitor system resources:
   ```bash
   top  # Check CPU/Memory usage
   ```

3. Check for slow queries:
   ```bash
   tail -f /var/log/swipesavvy/api.log | grep "SLOW"
   ```

4. Increase connection pool:
   ```bash
   export DB_POOL_SIZE=30
   ```

### Issue: Memory Leak

**Error:** Memory usage continuously increasing

**Solutions:**
1. Check for open connections:
   ```bash
   psql -d swipesavvy_agents -c "SELECT count(*) FROM pg_stat_activity"
   ```

2. Restart server:
   ```bash
   systemctl restart swipesavvy
   ```

3. Monitor memory:
   ```bash
   watch -n 1 'ps aux | grep main.py | grep -v grep'
   ```

### Issue: 502 Bad Gateway

**Error:** Upstream server unavailable

**Solutions:**
1. Check if API server is running:
   ```bash
   curl http://127.0.0.1:8888/health
   ```

2. Check process status:
   ```bash
   ps aux | grep main.py
   ```

3. Check logs:
   ```bash
   tail -50 /var/log/swipesavvy/api.log
   ```

4. Restart server:
   ```bash
   systemctl restart swipesavvy
   ```

---

## Rollback

### If Deployment Fails

**Option 1: Stop Current Deployment**
```bash
# Kill the process
pkill -f "main.py"

# Or via systemd
systemctl stop swipesavvy
```

**Option 2: Revert to Previous Version**
```bash
# Git rollback
git checkout HEAD~1
source .venv/bin/activate
cd swipesavvy-mobile-app
python main.py
```

**Option 3: Database Rollback**
```bash
# Drop and recreate database
dropdb swipesavvy_agents -U postgres
python setup_database.py
```

### Verification After Rollback
```bash
# Verify service is running
curl http://127.0.0.1:8888/health

# Run test suite
python -m pytest tests/ -q
```

---

## Post-Deployment Checklist

### Immediate (First Hour)
- [ ] Server is running and accessible
- [ ] Health check endpoint returns 200 OK
- [ ] Database connectivity verified
- [ ] All 17 endpoints respond correctly
- [ ] Error logs contain no critical errors
- [ ] Response times are <100ms

### First Day
- [ ] Monitor CPU/Memory usage
- [ ] Monitor error rates (should be 0%)
- [ ] Verify database backups running
- [ ] Test all major workflows
- [ ] Review audit logs
- [ ] Verify alerting is functional

### First Week
- [ ] Performance metrics stable
- [ ] No unexpected error spikes
- [ ] Database size is stable
- [ ] Backup integrity verified
- [ ] Team trained on operations
- [ ] Documentation updated

### Ongoing
- [ ] Daily health checks
- [ ] Weekly backup verification
- [ ] Monthly performance review
- [ ] Quarterly security audit
- [ ] Annual capacity planning

---

## Support & Escalation

### Severity Levels

**CRITICAL (Immediate Action)**
- Service is down
- All endpoints returning 5xx errors
- Database is unreachable
- Data loss is occurring

**HIGH (Within 1 hour)**
- Degraded performance (>1s latency)
- Error rate > 5%
- Memory/CPU near limit
- Database connection pool exhausted

**MEDIUM (Within 4 hours)**
- Minor functionality broken
- Error rate 1-5%
- Slow responses (500-1000ms)
- Non-critical service down

**LOW (Next business day)**
- Feature requests
- Documentation updates
- Performance optimization
- Code cleanup

### Escalation Path
1. Alert → On-call engineer
2. No response → Engineering lead
3. No resolution → Director of Engineering
4. Critical only → CTO

---

## Additional Resources

- **API Documentation:** `/docs` (Swagger UI)
- **API Schema:** `/redoc` (ReDoc)
- **Health Status:** `/health`
- **Phase 8 Report:** `PHASE_8_COMPLETION_REPORT.md`
- **Monitoring Docs:** `swipesavvy-mobile-app/monitoring.py`
- **Configuration:** `swipesavvy-mobile-app/config.py`

---

**Deployment Runbook v1.0**  
**Status:** ✅ PRODUCTION READY  
**Last Updated:** December 28, 2025
