# Week 13: Soft Launch - Production Deployment Plan

**Week**: 13 (Post-MVP)  
**Phase**: Soft Launch - Internal Beta  
**Focus**: Production Deployment, Internal Testing, Monitoring  
**Duration**: December 23-29, 2025  
**Status**: 🚀 In Progress

---

## Overview

Week 13 marks the **first production deployment** of the SwipeSavvy AI Agents MVP. This soft launch phase focuses on deploying to production infrastructure, onboarding 10-20 internal beta testers, and validating the system under real-world conditions with close monitoring.

## Objectives

### Primary Goals
- ✅ Deploy all services to production environment
- ✅ Onboard 10-20 internal beta users
- ✅ Monitor system 24/7 for first 48 hours
- ✅ Achieve 0 critical (P0) bugs
- ✅ Validate all SLOs in production
- ✅ Collect user feedback and usage patterns

### Success Criteria
- **Availability**: ≥ 99.9% uptime during Week 13
- **Performance**: P95 latency < 1s, P99 < 2s
- **Error Rate**: < 1% of all requests
- **User Satisfaction**: ≥ 80% positive feedback from beta testers
- **Critical Bugs**: 0 P0 incidents
- **Response Time**: All P1 incidents resolved within 4 hours

---

## Week 13 Timeline

### Day 1 (Monday, Dec 23): Production Setup
**Focus**: Infrastructure provisioning and configuration

**Morning (9 AM - 12 PM)**:
- [ ] Provision production server/VM (AWS/GCP/Azure)
- [ ] Configure production PostgreSQL database
- [ ] Set up production Redis instance
- [ ] Install Docker and Docker Compose
- [ ] Configure firewall rules and security groups

**Afternoon (1 PM - 5 PM)**:
- [ ] Configure SSL/TLS certificates (Let's Encrypt)
- [ ] Set up domain/subdomain (api.swipesavvy.com)
- [ ] Configure environment variables (.env.production)
- [ ] Set up production monitoring (Prometheus + Grafana)
- [ ] Configure log aggregation

**Evening Checkpoint**:
- Infrastructure provisioned ✓
- Security configured ✓
- Monitoring ready ✓

### Day 2 (Tuesday, Dec 24): Initial Deployment
**Focus**: Deploy services and validate

**Morning (9 AM - 12 PM)**:
- [ ] Clone repository to production server
- [ ] Configure production environment variables
- [ ] Run database migrations
- [ ] Deploy services via Docker Compose
- [ ] Verify all health checks pass

**Afternoon (1 PM - 5 PM)**:
- [ ] Run smoke tests against production
- [ ] Verify Together.AI API connectivity
- [ ] Test all 4 banking operations
- [ ] Validate guardrails service
- [ ] Verify RAG service with knowledge base

**Evening Checkpoint**:
- All services deployed ✓
- Health checks passing ✓
- Smoke tests passing ✓

### Day 3 (Wednesday, Dec 25): Beta User Onboarding
**Focus**: Onboard first internal users

**Morning (9 AM - 12 PM)**:
- [ ] Prepare beta user welcome email
- [ ] Create internal user accounts (10 users)
- [ ] Send onboarding instructions
- [ ] Schedule orientation call
- [ ] Provide feedback submission form

**Afternoon (1 PM - 5 PM)**:
- [ ] Conduct beta user orientation (30 min)
- [ ] Monitor first user sessions
- [ ] Track initial feedback
- [ ] Observe usage patterns
- [ ] Fix any immediate issues

**Evening Checkpoint**:
- 10 users onboarded ✓
- First sessions successful ✓
- Feedback collected ✓

### Day 4 (Thursday, Dec 26): Intensive Monitoring
**Focus**: 24/7 monitoring and optimization

**All Day**:
- [ ] Monitor all metrics continuously
- [ ] Review logs for errors/warnings
- [ ] Track response times
- [ ] Monitor database performance
- [ ] Check Together.AI API usage
- [ ] Respond to any incidents per runbook
- [ ] Tune performance based on real usage

**Metrics to Watch**:
- Request rate and latency
- Error rates by service
- Database connection pool usage
- Memory and CPU utilization
- Together.AI API rate limits
- Guardrails trigger rates

### Day 5 (Friday, Dec 27): Expand Beta + Optimization
**Focus**: Onboard remaining users, optimize

**Morning (9 AM - 12 PM)**:
- [ ] Onboard additional 10 internal users (total: 20)
- [ ] Review first 3 days of metrics
- [ ] Identify optimization opportunities
- [ ] Implement quick wins (caching, etc.)

**Afternoon (1 PM - 5 PM)**:
- [ ] Performance tuning based on data
- [ ] Fix any P1/P2 bugs discovered
- [ ] Update documentation with learnings
- [ ] Adjust alert thresholds if needed

**Evening Checkpoint**:
- 20 total users active ✓
- Performance optimized ✓
- No critical bugs ✓

### Day 6-7 (Weekend, Dec 28-29): Continuous Monitoring
**Focus**: Maintain stability, collect data

**Activities**:
- [ ] Monitor system continuously (on-call)
- [ ] Collect user feedback surveys
- [ ] Analyze usage patterns
- [ ] Document lessons learned
- [ ] Prepare Week 13 summary
- [ ] Plan Week 14-15 limited beta

**End of Week Checkpoint**:
- Full week of production operation ✓
- User feedback collected ✓
- Metrics validated ✓
- Ready for limited beta ✓

---

## Infrastructure Requirements

### Production Server Specifications

**Recommended Minimum**:
- **Provider**: AWS EC2, GCP Compute Engine, or Azure VM
- **Instance Type**: 
  - AWS: t3.xlarge (4 vCPU, 16 GB RAM)
  - GCP: n2-standard-4 (4 vCPU, 16 GB RAM)
  - Azure: Standard_D4s_v3 (4 vCPU, 16 GB RAM)
- **Storage**: 100 GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Region**: US-East (or closest to users)

### Database (PostgreSQL)

**Option 1: Managed Service** (Recommended for MVP)
- AWS RDS PostgreSQL 14+
- GCP Cloud SQL for PostgreSQL
- Azure Database for PostgreSQL

**Specifications**:
- Instance: db.t3.medium (2 vCPU, 4 GB RAM)
- Storage: 50 GB SSD with auto-scaling
- Backups: Automated daily, 7-day retention
- Multi-AZ: Not required for soft launch

**Option 2: Self-Hosted** (if cost-sensitive)
- PostgreSQL 14+ with pgvector extension
- 2 CPU cores, 4 GB RAM dedicated
- Automated backups via cron

### Redis (Session Store)

**Option 1: Managed** (Recommended)
- AWS ElastiCache for Redis
- GCP Memorystore for Redis
- Azure Cache for Redis

**Specifications**:
- Instance: cache.t3.micro (0.5 GB RAM)
- Single node (no replication for soft launch)

**Option 2: Self-Hosted**
- Redis 7.x
- 1 GB RAM dedicated

### Network & Security

**Domain & SSL**:
- Domain: `api.swipesavvy.com` (or subdomain)
- SSL/TLS: Let's Encrypt (free, auto-renewal)
- Certificate: Wildcard cert for all services

**Firewall Rules**:
- Port 443 (HTTPS): Open to public
- Port 80 (HTTP): Redirect to 443
- Port 22 (SSH): Restricted to office IP
- Port 5432 (PostgreSQL): Internal only
- Port 6379 (Redis): Internal only
- Port 9090 (Prometheus): Internal only
- Port 3000 (Grafana): VPN/office IP only

**Security Groups**:
- App servers can access database
- App servers can access Redis
- Monitoring can scrape metrics
- No direct public database access

---

## Deployment Checklist

### Pre-Deployment Validation

- [ ] All Week 12 items complete (✅ Done)
- [ ] Launch checklist reviewed (150+ items)
- [ ] Production infrastructure provisioned
- [ ] SSL certificates obtained
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Smoke tests prepared
- [ ] Monitoring dashboards ready
- [ ] Alert rules configured
- [ ] On-call rotation scheduled
- [ ] Rollback plan documented
- [ ] Stakeholders notified

### Deployment Steps

**1. Prepare Server**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

**2. Clone Repository**:
```bash
cd /opt
sudo git clone https://github.com/swipesavvy/ai-agents.git
cd ai-agents
sudo git checkout Together-AI-Build
```

**3. Configure Environment**:
```bash
# Copy template
sudo cp .env.template .env.production

# Edit with production values
sudo nano .env.production
```

**Production Environment Variables**:
```bash
# Together.AI
TOGETHER_AI_API_KEY=your_production_api_key_here
TOGETHER_AI_MODEL=meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo

# Database
DATABASE_URL=postgresql://user:password@prod-db.region.rds.amazonaws.com:5432/swipesavvy_prod
POSTGRES_USER=swipesavvy_prod
POSTGRES_PASSWORD=<strong_password>
POSTGRES_DB=swipesavvy_ai_agents

# Redis
REDIS_URL=redis://prod-redis.region.cache.amazonaws.com:6379/0

# Environment
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# Services
CONCIERGE_PORT=8000
RAG_PORT=8001
GUARDRAILS_PORT=8002

# Security
SECRET_KEY=<generate_random_secret>
ALLOWED_HOSTS=api.swipesavvy.com
CORS_ORIGINS=https://app.swipesavvy.com

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Monitoring
PROMETHEUS_ENABLED=true
METRICS_PORT=9090
```

**4. Run Database Migrations**:
```bash
# Connect to production database
sudo docker-compose -f docker-compose.prod.yml run --rm concierge python scripts/migrate.py
```

**5. Deploy Services**:
```bash
# Start all services
sudo docker-compose -f docker-compose.prod.yml up -d

# Verify services are running
sudo docker-compose -f docker-compose.prod.yml ps

# Check logs
sudo docker-compose -f docker-compose.prod.yml logs -f
```

**6. Verify Health Checks**:
```bash
# Concierge health
curl https://api.swipesavvy.com/health

# RAG health
curl https://api.swipesavvy.com/rag/health

# Guardrails health
curl https://api.swipesavvy.com/guardrails/health
```

**7. Run Smoke Tests**:
```bash
# Run production smoke tests
sudo docker-compose -f docker-compose.prod.yml run --rm test pytest tests/smoke/
```

### Post-Deployment Validation

- [ ] All services return 200 on /health
- [ ] Prometheus scraping metrics
- [ ] Grafana dashboards loading
- [ ] Alerts configured and firing (test)
- [ ] Logs flowing to aggregation
- [ ] SSL certificate valid
- [ ] Domain resolving correctly
- [ ] Together.AI API responding
- [ ] Database connections stable
- [ ] Redis sessions working

---

## Beta Testing Plan

### Internal Beta Users (Target: 10-20)

**Selection Criteria**:
- Technical background (can provide detailed feedback)
- Familiar with SwipeSavvy platform
- Available for 1 week of testing
- Can attend orientation session
- Willing to provide feedback

**User Roles**:
- 5 Product/Engineering team members
- 5 Customer Success team members
- 5 Finance/Operations team members
- 5 Executive/Leadership team members

### Onboarding Process

**1. Welcome Email Template**:
```
Subject: SwipeSavvy AI Agents - Beta Testing Invitation

Hi [Name],

You've been selected to participate in the soft launch of SwipeSavvy AI Agents! 

What is it?
An AI-powered conversational assistant that helps users with banking operations using natural language.

Beta Testing Period: Dec 23-29, 2025

What you'll do:
• Attend 30-min orientation (Dec 25, 10 AM)
• Test the AI assistant with real queries
• Provide feedback via survey
• Report any bugs or issues

Access:
• URL: https://api.swipesavvy.com
• Your account: [email]
• Temporary password: [password]

Looking forward to your feedback!

SwipeSavvy AI Team
```

**2. Orientation Session** (30 minutes):
- Introduction to AI Agents (5 min)
- Demo of key features (10 min)
- How to test effectively (5 min)
- How to submit feedback (5 min)
- Q&A (5 min)

**3. Testing Instructions**:
```markdown
# Beta Testing Guide

## What to Test

1. **Basic Queries**
   - "What's my account balance?"
   - "Show me recent transactions"
   - "Transfer $50 to savings"
   - "Pay my electricity bill"

2. **Complex Scenarios**
   - Multi-turn conversations
   - Follow-up questions
   - Error recovery
   - Edge cases

3. **Safety Features**
   - Try inappropriate queries
   - Test with PII
   - Try prompt injection

## How to Provide Feedback

Use this form: [Feedback Form URL]

**What to report**:
- Bugs or errors
- Confusing responses
- Slow performance
- Feature requests
- Overall experience

## Support

Questions? Contact: ai-agents@swipesavvy.com
Urgent issues? Slack: #ai-agents-beta
```

**4. Feedback Collection**:

**Survey Questions**:
1. Overall satisfaction (1-5 stars)
2. Ease of use (1-5)
3. Response accuracy (1-5)
4. Response speed (1-5)
5. Would you use this feature? (Yes/No/Maybe)
6. What did you like most?
7. What needs improvement?
8. Any bugs encountered?
9. Feature requests?
10. Additional comments?

### Success Metrics

**Quantitative**:
- Active users: 15/20 (75% engagement)
- Average session duration: > 5 minutes
- Queries per user: > 10
- Successful query rate: > 90%
- Average satisfaction: > 4.0/5.0

**Qualitative**:
- Positive sentiment in feedback
- Feature requests collected
- Usability issues identified
- Bugs discovered and prioritized

---

## Monitoring & Incident Response

### 24/7 Monitoring (First 48 Hours)

**On-Call Schedule**:
- **Day 1 (Dec 24)**: Primary engineer on-call 24h
- **Day 2 (Dec 25)**: Rotate to backup engineer
- **Days 3-7**: Standard on-call rotation (8h shifts)

**Monitoring Checklist (Every 2 Hours)**:
- [ ] Check Grafana dashboards
- [ ] Review error logs
- [ ] Verify all services healthy
- [ ] Check response times
- [ ] Monitor database connections
- [ ] Review Together.AI API usage
- [ ] Check disk space
- [ ] Verify backup completion

### Alerts to Watch

**Critical (P0 - Immediate Response)**:
- Any service down (health check failing)
- Error rate > 5%
- P95 latency > 3s
- Database connection failures
- Disk space > 90%

**Warning (P1 - 1 Hour Response)**:
- Error rate > 2%
- P95 latency > 1.5s
- Memory usage > 80%
- Together.AI rate limit warnings

**Info (P2 - Next Business Day)**:
- Error rate > 1%
- P95 latency > 1s
- Unusual traffic patterns

### Incident Response Process

**1. Acknowledge** (< 5 min):
- Respond to alert
- Update status page
- Notify team in Slack

**2. Assess** (< 10 min):
- Check dashboards
- Review logs
- Determine severity
- Identify affected users

**3. Mitigate** (< 30 min):
- Follow runbook procedures
- Implement quick fix
- Roll back if necessary
- Update stakeholders

**4. Resolve**:
- Root cause analysis
- Permanent fix
- Verify resolution
- Update documentation

**5. Post-Incident**:
- Incident report
- Lessons learned
- Update runbooks
- Improve monitoring

---

## Performance Tuning

### Based on Real Usage Data

**Day 1-2: Collect Baseline**:
- Monitor all metrics
- Identify bottlenecks
- Note user patterns
- Track slow queries

**Day 3-4: Quick Wins**:
- Implement response caching
- Optimize slow database queries
- Tune connection pool sizes
- Adjust worker counts

**Day 5-7: Advanced Optimization**:
- Horizontal scaling if needed
- Database read replicas
- CDN for static assets
- Advanced caching strategies

### Expected Optimizations

**Caching Strategy**:
```python
# Cache frequently asked questions
cache_ttl = {
    "balance": 300,  # 5 minutes
    "transactions": 600,  # 10 minutes
    "knowledge_base": 3600,  # 1 hour
}
```

**Database Optimization**:
- Add indexes on frequently queried columns
- Optimize pgvector queries
- Connection pooling (max 20 connections)
- Query timeout: 5 seconds

**API Optimization**:
- Response compression (gzip)
- Keep-alive connections
- Request batching where possible
- Circuit breaker tuning

---

## Risk Mitigation

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Production outage | Low | Critical | Rollback plan ready, on-call 24/7 |
| Performance issues | Medium | High | Load testing done, monitoring active |
| Security vulnerability | Low | Critical | Security audit complete, guardrails active |
| Together.AI API issues | Medium | High | Circuit breaker, fallback responses |
| Database corruption | Low | Critical | Automated backups, tested restore |
| User confusion | High | Medium | Orientation, clear documentation |

### Contingency Plans

**Plan A: Green Light** (Everything works)
- Proceed with beta testing
- Collect feedback
- Minor tuning only

**Plan B: Yellow Light** (Minor issues)
- Fix P1/P2 bugs quickly
- Continue with limited users
- Delay full rollout if needed

**Plan C: Red Light** (Critical issues)
- Pause new user onboarding
- Fix critical bugs
- Rollback if necessary
- Reschedule soft launch

---

## Success Criteria Review

### Must Achieve (Go/No-Go for Week 14)

- ✅ Availability ≥ 99.9%
- ✅ P95 latency < 1s
- ✅ Error rate < 1%
- ✅ 0 P0 incidents
- ✅ User satisfaction ≥ 80%
- ✅ All smoke tests passing

### Nice to Have

- P95 latency < 500ms
- User satisfaction ≥ 90%
- 20/20 beta users active
- Feature requests collected
- Performance improvements identified

---

## Deliverables

### Documentation

- [ ] Week 13 deployment summary
- [ ] Production environment documentation
- [ ] Beta user feedback report
- [ ] Performance tuning notes
- [ ] Incident reports (if any)
- [ ] Lessons learned document

### Code/Config

- [ ] Production environment config
- [ ] Database migration scripts
- [ ] Monitoring dashboard configs
- [ ] Alert rule updates
- [ ] Performance optimizations

### Metrics Report

- [ ] Uptime statistics
- [ ] Performance metrics (P50/P95/P99)
- [ ] Error rate analysis
- [ ] User engagement metrics
- [ ] Together.AI API usage
- [ ] Cost analysis

---

## Week 14-15 Preparation

If Week 13 is successful, prepare for **Limited Beta** (100-200 users):

**Activities**:
- Review Week 13 feedback
- Implement top user requests
- Fix all P1/P2 bugs
- Scale infrastructure
- Prepare customer onboarding
- Create support documentation
- Train support team

**Timeline**:
- Week 14: Expand to 50 users
- Week 15: Expand to 100-200 users
- Week 16: General availability

---

## Notes

- Focus on stability over features
- Collect detailed user feedback
- Fix bugs quickly
- Monitor closely for first 48h
- Document everything
- Prepare for scale

---

**Status**: 🚀 Ready to Launch  
**Next Step**: Provision production infrastructure  
**Timeline**: Dec 23-29, 2025  
**Team**: On-call and ready

**Let's ship it!** 🎉
