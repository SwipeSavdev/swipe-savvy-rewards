# 🚀 Release Management Guide

**Version:** 1.0  
**Last Updated:** January 19, 2025  
**Owner:** Engineering Leadership & DevOps  
**Purpose:** Standardized release process for SwipeSavvy platform

---

## Table of Contents

1. [Release Types & Cadence](#release-types--cadence)
2. [Release Planning](#release-planning)
3. [Pre-Release Checklist](#pre-release-checklist)
4. [Release Day Procedures](#release-day-procedures)
5. [Deployment Procedures](#deployment-procedures)
6. [Rollback Procedures](#rollback-procedures)
7. [Post-Release Verification](#post-release-verification)
8. [Communication Templates](#communication-templates)

---

## Release Types & Cadence

### Type 1: Patch Releases (v1.2.3 → v1.2.4)

**When to Use:**
- Bug fixes only
- No feature additions
- No dependency updates
- Security fixes (when backporting)

**Cadence:** As needed (max 2x per week)  
**Decision Making:** Engineering lead approval only  
**Testing:** Smoke tests  
**Deployment:** Within 24 hours of merge  
**Rollback:** Always prepared (5-minute recovery)

**Release Timeline:**

```
Day 1: Bug fix merged to main
Day 1: Run security scan + smoke tests
Day 1: Create tag + deploy to production
Day 2: Monitor metrics (24 hours)
Day 3: Mark release as stable
```

**Example:** v1.0.0 → v1.0.1 (1 commit, bug fix)

### Type 2: Minor Releases (v1.2.0 → v1.3.0)

**When to Use:**
- New features (backward compatible)
- Performance improvements
- Documentation updates
- No breaking changes

**Cadence:** Every 2 weeks (Thursdays 2 PM UTC)  
**Decision Making:** Engineering leadership  
**Testing:** Full test suite + E2E tests  
**Deployment:** Within 2 hours of release  
**Rollback:** Tested, automated

**Release Timeline:**

```
Week 1 Mon: Plan next release (what features?)
Week 1 Wed: Cut release branch
Week 2 Mon: Code freeze (bug fixes only)
Week 2 Tue: Final testing + security scan
Week 2 Wed: Release day!
  14:00 UTC - Tag created, docker images built
  14:30 UTC - Deployed to staging, smoke tests
  15:00 UTC - Deploy to production
  15:30 UTC - Post-release verification
```

**Example:** v1.2.0 → v1.3.0 (5-10 features, no breaks)

### Type 3: Major Releases (v1.0.0 → v2.0.0)

**When to Use:**
- Breaking API changes
- Major architectural changes
- Significant feature set changes
- Database schema changes

**Cadence:** Quarterly (Jan, Apr, Jul, Oct)  
**Decision Making:** CTO + VP Eng approval  
**Testing:** Full suite + load tests + UAT  
**Deployment:** Friday mornings (support coverage)  
**Rollback:** Extensive testing, careful monitoring

**Release Timeline:**

```
Week 1: Plan major release
  - List all breaking changes
  - Assess impact on customers
  - Plan migration guide

Week 2-3: Development & implementation
  - Feature development
  - Breaking change implementation
  - Documentation updates

Week 4: Testing & validation
  - Full test execution
  - Load testing
  - User acceptance testing
  - Security audit

Week 5: Release
  Mon: Final checks + security audit
  Tue: Build docker images
  Wed: Deploy to staging, run all tests
  Thu: UAT sign-off
  Fri: Production deployment
  
Post-Release: Monitor 24/7 for 48 hours
```

**Example:** v1.0.0 → v2.0.0 (major refactor, breaking changes)

### Type 4: Hotfixes (Production Critical)

**When to Use:**
- Critical production issue
- Data corruption fix
- Security vulnerability patch
- Major functionality broken

**Cadence:** On demand (emergency)  
**Decision Making:** VP Eng approval  
**Testing:** Minimal (focused on issue)  
**Deployment:** Immediately  
**Rollback:** Immediately ready

**Release Timeline:**

```
Issue detected
  ↓ (within 15 min)
Emergency call initiated
  ↓ (within 30 min)
Hotfix developed + tested
  ↓ (within 1 hour)
Hotfix approved by VP Eng
  ↓ (immediately)
Deploy to production
  ↓ (monitor closely)
```

**Example:** v1.2.3 → v1.2.4 (critical data loss fix)

---

## Release Planning

### Phase 1: Pre-Planning (2 weeks before)

**Participants:** Product, Engineering, DevOps

**Step 1: Feature Selection**
```markdown
Release Date: [Date]
Target Version: v[X.Y.Z]

## Features Included
- [ ] Feature 1 - [PR link] - Status: [In Review/Ready]
- [ ] Feature 2 - [PR link] - Status: [In Review/Ready]
- [ ] Feature 3 - [PR link] - Status: [In Review/Ready]

## Breaking Changes
- [List any breaking changes]

## Database Migrations
- [List any schema changes]

## Deployment Steps
1. [Step 1]
2. [Step 2]
```

**Step 2: Capacity Planning**
- Assign release engineer
- Assign QA lead
- Identify deployment window
- Book communication channels

**Step 3: Communication Plan**
- Customers who will be affected
- Communication timing
- Status page updates
- Rollback notifications

### Phase 2: Preparation (1 week before)

**Participants:** Engineering, QA, DevOps

**Step 1: Documentation**
- [ ] Changelog written + reviewed
- [ ] Migration guide completed (if needed)
- [ ] API changes documented
- [ ] New features documented

**Step 2: Testing Plan**
- [ ] Test cases defined
- [ ] Test data prepared
- [ ] Test environments ready
- [ ] Load test scenario prepared

**Step 3: Rollback Plan**
- [ ] Rollback commands documented
- [ ] Rollback tested
- [ ] Fallback procedures defined
- [ ] Recovery time SLA: < 15 minutes

**Step 4: Release Notes Draft**
```markdown
# Release v1.3.0

**Release Date:** [Date]  
**Type:** Minor Release  

## New Features
- [Feature name] - [brief description]
- [Feature name] - [brief description]

## Bug Fixes
- [Bug name] - [JIRA ticket]

## Improvements
- Performance improvement: [X%]
- Reduced latency: [Y ms]

## Breaking Changes
None

## Upgrade Instructions
[Step-by-step upgrade guide]

## Rollback Instructions
If issues occur: [rollback command]
```

---

## Pre-Release Checklist

### 72 Hours Before Release

**Code Quality:**
- [ ] All PRs merged and reviewed
- [ ] No failing tests in main branch
- [ ] No linting errors (ESLint, Black, Flake8)
- [ ] TypeScript compilation passes
- [ ] npm audit: No critical vulnerabilities
- [ ] Safety check: No critical vulnerabilities
- [ ] Code coverage >= 80%

**Documentation:**
- [ ] Changelog updated
- [ ] README updated if needed
- [ ] API documentation current
- [ ] Migration guide written (if DB changes)
- [ ] Known issues documented

**Release Branch:**
- [ ] Release branch created: `release/v[version]`
- [ ] Version bump commits made
- [ ] All tests passing on release branch
- [ ] Security scan passed

### 24 Hours Before Release

**Final Verification:**
- [ ] Security audit completed
- [ ] Performance test results acceptable
- [ ] Load test results acceptable
- [ ] Staging deployment test successful
- [ ] Rollback procedure tested locally
- [ ] Docker images built (not pushed yet)
- [ ] All team members notified

**Communication:**
- [ ] Status page notice drafted
- [ ] Customer announcement prepared
- [ ] Slack channels notified
- [ ] Support team briefed on changes
- [ ] On-call engineer briefed

### Release Day (4 Hours Before)

**Final Checks:**
- [ ] Team members present and ready
- [ ] Deployment credentials verified
- [ ] Monitoring dashboards open
- [ ] Slack alerts configured
- [ ] Rollback commands tested again
- [ ] Emergency contact numbers available

**Pre-Deployment:**
- [ ] Last build verification
- [ ] Docker image signatures verified
- [ ] Database migration scripts tested
- [ ] Environment variables confirmed
- [ ] Zero in-flight deployments

---

## Release Day Procedures

### T-0: Release Start

**Timing:** [Scheduled release time, typically 14:00 UTC for minor, 06:00 UTC for major]

**Actions:**
1. **Create Git Tag**
   ```bash
   git tag v1.3.0
   git push origin v1.3.0
   ```
   
2. **Trigger GitHub Actions**
   - Tag push automatically triggers deploy-production.yml
   - Monitor GitHub Actions dashboard
   - Expected: Docker builds complete in ~30 min

3. **Post Status**
   ```
   📌 Release v1.3.0 started
   ⏱️ ETA: 2 hours
   🔗 Status: [link to GitHub Actions]
   ```

### T+30: Docker Builds Complete

**Verification:**
- [ ] All 3 Docker images built successfully
- [ ] Images tagged with version + "latest"
- [ ] Images pushed to container registry
- [ ] Image signatures verified

**Logs:**
```
✅ admin-portal built: ghcr.io/swipesavvy/admin-portal:v1.3.0
✅ wallet-web built: ghcr.io/swipesavvy/wallet-web:v1.3.0
✅ ai-agents built: ghcr.io/swipesavvy/ai-agents:v1.3.0
```

### T+45: Staging Deployment

**Actions:**
1. Deploy to staging environment
2. Run smoke tests
3. Verify all services healthy
4. Check logs for errors
5. Test critical workflows

**Verification:**
- [ ] Admin portal loads
- [ ] Wallet functionality works
- [ ] API endpoints respond correctly
- [ ] Database migrations completed
- [ ] Cache working correctly
- [ ] Error rates normal

### T+60: Production Deployment

**Pre-deployment Checks:**
- [ ] Final go/no-go decision
- [ ] All stakeholders ready
- [ ] Support team standing by
- [ ] Monitoring active

**Deployment:**
```bash
# Automated via GitHub Actions deploy-production.yml
# Manual approval required (2 approvers)

Steps:
1. Create pre-deployment backup
2. Deploy new containers
3. Execute database migrations
4. Warm up caches
5. Run smoke tests
6. Verify metrics
7. Post-deployment checks
```

**Post-Deployment Verification:**
- [ ] All services responding (200 OK)
- [ ] Error rate < 0.1%
- [ ] Latency p99 < 400ms
- [ ] Database queries successful
- [ ] Cache hit rate > 90%
- [ ] No critical logs

### T+90: Release Complete

**Documentation:**
1. GitHub release created with notes
2. Status page update: "✅ Released"
3. Changelog published
4. Customer announcement sent
5. Team notified in Slack

**Post-Release Actions:**
- [ ] Monitor metrics for 1 hour
- [ ] Respond to customer questions
- [ ] Document any issues found
- [ ] Schedule post-mortem if issues

---

## Deployment Procedures

### Pre-Deployment Backup

```bash
# Automated backup before production deployment

1. PostgreSQL dump to S3
   ```
   pg_dump swipesavvy_prod | gzip | aws s3 cp - \
     s3://backups/db-$(date +%Y%m%d-%H%M%S).sql.gz
   ```

2. Redis snapshot
   ```
   redis-cli BGSAVE
   aws s3 cp /var/lib/redis/dump.rdb \
     s3://backups/redis-$(date +%Y%m%d-%H%M%S).rdb
   ```

3. Configuration backup
   ```
   tar czf config-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
     /etc/swipesavvy/
   aws s3 cp ... s3://backups/
   ```

**Verification:**
- [ ] Backup size reasonable
- [ ] Backup can be restored (test)
- [ ] Backup location verified

### Database Migrations

```bash
# Execute before containers start

1. Pre-migration backup (see above)

2. Run migration script
   ```
   python manage.py migrate
   ```

3. Verify migration success
   ```
   SELECT version FROM schema_migrations 
   ORDER BY version DESC LIMIT 1;
   ```

4. Rollback if needed
   ```
   python manage.py downgrade -1
   ```

**Migration Checklist:**
- [ ] Backward compatible schema changes
- [ ] Data validation post-migration
- [ ] Index creation if needed
- [ ] Performance impact assessed
- [ ] Rollback tested
```

### Blue-Green Deployment (For Major Releases)

```
Current (Blue):    v1.2.0 - Production
Staging (Green):   v1.3.0 - Newly deployed

1. Deploy v1.3.0 to staging environment (Green)
2. Run all tests on Green
3. Warm up caches on Green
4. Switch load balancer: Blue → Green
5. Monitor metrics closely
6. Keep Blue ready for instant rollback
```

---

## Rollback Procedures

### Immediate Rollback (Emergency)

**Trigger Conditions:**
- Data corruption detected
- Critical feature broken
- Significant performance degradation
- Data loss occurring
- Security vulnerability introduced

**Time Limit:** Execute within 5 minutes of detection

```bash
# Step 1: Stop new version
docker-compose down
docker-compose -f docker-compose.v1.2.0.yml up -d

# Step 2: Verify rollback
curl https://api.swipesavvy.com/health

# Step 3: Restore data if needed
./scripts/restore-backup.sh backup-id

# Step 4: Clear caches
redis-cli FLUSHALL
redis-cli FLUSHDB

# Step 5: Verify services
- Health checks passing
- Error rate returning to normal
- Latency acceptable
- Data integrity verified
```

### Coordinated Rollback (Planned)

**When to Use:** Less urgent issues detected

```bash
# Step 1: Coordinate with team
- Get approval from VP Eng
- Notify support team
- Schedule communication
- Notify customers if needed

# Step 2: Execute rollback
git revert <commit>
git tag v1.3.1
git push origin v1.3.1

# Step 3: Follow standard deployment
# (deploys v1.3.1, which reverts to v1.2.0 behavior)

# Step 4: Communicate
- Post mortem scheduled
- Root cause analysis
- Fix planned for next release
```

### Rollback Verification Checklist

After any rollback:

- [ ] Services responding (HTTP 200)
- [ ] Database accessible
- [ ] Cache operational
- [ ] Metrics showing pre-rollback levels
- [ ] Error logs normal
- [ ] No customer impact ongoing
- [ ] Data integrity confirmed
- [ ] Team notified

---

## Post-Release Verification

### First Hour (T+1)

**Every 5 minutes:**
- Error rate monitoring (target: < 0.1%)
- Response time monitoring (p99 < 400ms)
- Resource utilization (CPU < 80%, memory < 85%)

**Every 15 minutes:**
- Database connection pool health
- Cache hit rate (should be > 90%)
- Queue depth (should be normal)
- Log analysis for warnings/errors

### First 24 Hours

**Hourly:**
- All metrics within expected ranges
- No critical log errors
- Customer feedback monitoring
- Support ticket volume normal

**Daily:**
- Full test suite re-run
- Security scan re-run
- Performance test
- Customer communication

### First Week

**Daily:**
- Metrics analysis
- Error rate trends
- Performance trends
- Customer feedback analysis

**End of Week:**
- Post-mortem (if issues)
- Performance review
- Customer satisfaction survey
- Lessons learned documented

---

## Communication Templates

### Pre-Release Announcement (3 days before)

```
Subject: Scheduled Maintenance: [Date] v[Version] Release

Dear Customers,

We are planning to release version [Version] on [Date] at [Time] UTC.

Features included:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Expected downtime: [X minutes]
Planned window: [Start time] - [End time] UTC

How this affects you:
- [Impact 1]
- [Impact 2]

Questions? Contact: support@swipesavvy.com

Thank you,
The SwipeSavvy Team
```

### Release In Progress

```
📌 Release v1.3.0 IN PROGRESS

⏱️ Started: [Time] UTC
🎯 Expected completion: [Time] UTC
🔗 Status: https://status.swipesavvy.com

Current step: Deploying to production

We'll update this message every 15 minutes.
```

### Release Complete

```
✅ Release v1.3.0 COMPLETED

⏱️ Release completed at [Time] UTC
📦 Deployment time: [X minutes]

New features:
- [Feature 1]
- [Feature 2]

Performance improvements:
- [Improvement 1] - [X% improvement]

Thank you for your patience!
Questions? support@swipesavvy.com
```

### Rollback Communication

```
⚠️ ROLLBACK NOTICE

We've identified an issue with v1.3.0 and are rolling back to v1.2.0.

Time: [Start time]
Expected completion: [End time]
ETA: [X minutes]

What happened:
[Brief explanation without technical jargon]

What we're doing:
- Rolling back to stable version
- Investigating root cause
- Preventing recurrence

Next steps:
- Post-mortem analysis
- Fix for next release
- Communication with affected customers

Thank you for your patience.
support@swipesavvy.com
```

---

## Release Decision Matrix

| Severity | Issue | Action | Timeline |
|----------|-------|--------|----------|
| Critical | Data loss | Rollback immediately | < 5 min |
| Critical | Security vuln | Rollback or hotfix | 24 hours |
| High | Feature broken | Rollback or hotfix | 1 hour |
| High | Performance issue | Investigate, maybe rollback | 4 hours |
| Medium | Minor bug | Patch in next minor | 2 weeks |
| Low | UI issue | Patch in next minor | 2 weeks |

---

## Tools & Resources

**Version Control:**
```bash
# Create release branch
git checkout -b release/v1.3.0

# Create release tag
git tag -a v1.3.0 -m "Release v1.3.0"
git push origin v1.3.0
```

**Monitoring:**
- Datadog: https://app.datadoghq.com
- Status Page: https://status.swipesavvy.com
- GitHub Actions: https://github.com/[repo]/actions

**Communication:**
- Slack: #releases
- Email: releases@swipesavvy.com
- Status Page: status.swipesavvy.com

---

## Sign-Off & Approval

This release management guide is approved by:

- [ ] CTO
- [ ] VP Engineering
- [ ] DevOps Lead
- [ ] QA Lead

**Effective Date:** January 19, 2025  
**Next Review:** April 19, 2025  

---

**Version:** 1.0  
**Last Updated:** January 19, 2025  
**Document Owner:** Engineering Leadership

