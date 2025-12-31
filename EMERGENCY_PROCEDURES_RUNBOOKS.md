# Emergency Procedures & Operational Runbooks

**Purpose:** Step-by-step procedures for handling critical incidents and operational tasks

**Last Updated:** December 28, 2025  
**Version:** 1.0  
**Audience:** DevOps, On-Call Engineers

---

## Table of Contents

1. [Critical Vulnerability Response](#critical-vulnerability-response)
2. [Production Outage Response](#production-outage-response)
3. [Deployment Rollback](#deployment-rollback)
4. [Database Recovery](#database-recovery)
5. [Performance Degradation](#performance-degradation)
6. [Security Incident](#security-incident)
7. [Escalation Matrix](#escalation-matrix)
8. [Communication Templates](#communication-templates)

---

## Critical Vulnerability Response

### SLA: 24 Hours (CVSS 9.0+)

**Trigger:** CVSS score 9.0 or higher in npm audit, Safety, Bandit, or Snyk

### Immediate Actions (T+0 to T+15 minutes)

```
T+0:   Security scan detects critical vulnerability
│
├─→ T+1:  Alert triggers in Slack #critical-alerts
├─→ T+2:  On-call engineer acknowledges in Slack
├─→ T+5:  DevOps lead and Security lead notified
└─→ T+15: Initial assessment complete
```

**Step 1: Confirm Vulnerability (T+0-5 min)**

```bash
# Log into security dashboard
# Check vulnerability details:
# - Package name
# - Current version
# - Fixed version available?
# - Affected service (Node.js, Python, or both?)
# - False positive?

# Verify it affects our code
grep -r "vulnerable-package" .
# If grep returns 0 results → likely false positive

# Check if transitive (indirect) dependency
npm ls vulnerable-package

# Get full details
npm audit --json | jq '.vulnerabilities.package-name'
```

**Step 2: Assess Impact (T+5-15 min)**

```
❓ Is it actually being used in production code?
   YES → Move to immediate patch (see Step 3)
   NO  → Document exception, low priority
   
❓ Is a patch available?
   YES → Move to immediate patch (see Step 3)
   NO  → See "No Patch Available" below
   
❓ Can it be patched without major refactor?
   YES → Move to immediate patch (see Step 3)
   NO  → See "Can't Patch Immediately" below
```

**Step 3: Immediate Patch (T+15-120 min)**

```bash
# Create emergency branch
git checkout main
git pull origin main
git checkout -b security/critical-vulnerability-fix-YYYY-MM-DD

# Patch the vulnerability
# Option A: Update package
npm update vulnerable-package

# Option B: If update doesn't work
npm install vulnerable-package@X.X.X --save

# Option C: For Python
pip install --upgrade vulnerable-package

# Verify patch
npm audit  # Should show vulnerability as fixed
safety check  # For Python

# Run tests
npm test
pytest  # For Python projects

# Commit
git add package.json package-lock.json
git commit -m "security: patch critical vulnerability in vulnerable-package

Package: vulnerable-package
CVSS Score: 9.5
Fixed Version: X.X.X
Impact: [brief description]

Fixes security incident #[incident-id]"

git push origin security/critical-vulnerability-fix-YYYY-MM-DD
```

**Step 4: Expedited Review & Merge (T+120-180 min)**

```
- Security lead approves immediately
- No waiting for normal review cycle
- All tests must pass
- Direct merge to main (no PR requirement)

git checkout main
git pull origin main
git merge security/critical-vulnerability-fix-YYYY-MM-DD --ff-only
git push origin main

# Trigger emergency deployment
# Go to Actions → deploy-production.yml → Run workflow
# Select: production environment, specific commit hash
```

**Step 5: Verify Deployment (T+180-240 min)**

```bash
# Wait for deployment to production
# Verify in monitoring

# Check logs for errors
tail -f /var/log/swipesavvy/production.log

# Verify vulnerable package version
# In production, check: npm ls vulnerable-package
# Should show: vulnerable-package@X.X.X (patched version)

# Run smoke tests
curl https://api.swipesavvy.com/health
# Should return 200 OK

# Notify stakeholders: "Vulnerability patched and deployed"
```

### No Patch Available Scenario

```
Time: T+15 minutes
Question: Is there a patch available from maintainers?

IF YES:
  → Follow Immediate Patch flow above
  
IF NO:
  → Follow steps below:
```

```bash
# Step 1: Document the issue
cat > CRITICAL_VULN_NO_PATCH.md << 'EOF'
Vulnerability: [Name]
CVSS Score: 9.5
Package: vulnerable-package v1.0.0
Reported: [Date]
Status: NO PATCH AVAILABLE
Maintainer Status: Unmaintained / Fixed in v2.0 (breaking changes)

Mitigation:
1. [Specific mitigation if possible]
2. [Network isolation if needed]
3. [Input validation added]

Replacement Options:
1. [Alternative library A]
2. [Alternative library B]

Target Resolution: [Date + plan]
EOF

# Step 2: Implement mitigations
# Add input validation, network controls, etc.
# Example: Add WAF rules to block exploit patterns

# Step 3: Escalate
# Notify CISO, get risk acceptance
# Document in risk register

# Step 4: Plan replacement
# If no patch ever coming:
# - Plan migration to alternative package
# - Set timeline: next 30-60 days
```

### Can't Patch Immediately Scenario

```
Time: T+15 minutes
Question: Can we patch in the next 24 hours?

IF YES:
  → Follow Immediate Patch flow above
  
IF NO:
  → Follow steps below:
```

```bash
# Step 1: Temporary Mitigation
# If package can't be patched immediately, apply controls

# Option A: Remove from production
git checkout -b hotfix/isolate-vulnerable-package
# Remove import, replace with workaround
# Example: If old logging library, use built-in logs
git push, create emergency PR, merge

# Option B: Network isolation
# Add WAF rule: Block requests containing exploit pattern
# Example: If SQL injection risk, block SQL keywords in input

# Option C: Disable vulnerable feature
# If feature isn't critical:
# - Disable feature flag
# - Deploy without feature
# - Plan proper patch for next release

# Step 2: Escalate & Plan
# Notify engineering leadership
# Set realistic timeline to patch properly
# Get approval for temporary mitigation
```

---

## Production Outage Response

### SLA: Restore Service within 1 hour

**Trigger:** Service unavailable (HTTP 5xx, no responses, degraded performance <10 RPS)

### Incident Timeline

```
T+0:   Alert fires (service health check fails)
       ↓ (1 min)
T+1:   PagerDuty/Slack alert → On-call engineer
       ↓ (2 min)
T+3:   Engineer acknowledges, starts investigation
       ↓ (5 min)
T+8:   Root cause identified
       ↓ (varies)
T+N:   Fix applied (varies)
       ↓
T+N+5: Service restored and verified
       ↓
T+N+30: Incident review completed
```

### Step 1: Triage (T+0-5 min)

**Is service down?**
```bash
# Check health endpoint
curl https://api.swipesavvy.com/health
# Expected: 200 OK
# If: 5xx or no response → OUTAGE CONFIRMED

# Check monitoring dashboard
# Go to: Datadog/New Relic → SwipeSavvy Production
# Look for: Red alerts, spike in errors, resource exhaustion
```

**Which service is affected?**
```
❓ Admin Portal (swipesavvy-admin-portal)
   → Check: https://admin.swipesavvy.com
   → Check logs: [admin-portal logs endpoint]
   
❓ Customer Website (swipesavvy-customer-website)
   → Check: https://www.swipesavvy.com
   → Check logs: [website logs endpoint]
   
❓ Mobile App Backend (APIs)
   → Check: https://api.swipesavvy.com/health
   → Check logs: docker logs swipesavvy-api
   
❓ AI Agents Service (swipesavvy-ai-agents)
   → Check: https://api.swipesavvy.com/agents/health
   → Check logs: docker logs swipesavvy-agents
```

**Severity Assessment:**
```
🔴 CRITICAL: Core API down, no workaround (impacts >1000 users)
🟠 HIGH: Major feature unavailable (impacts >100 users)
🟡 MEDIUM: Non-critical feature down (impacts <100 users)
```

**Escalation:**
```
CRITICAL:
  → Notify VP Engineering immediately
  → Page on-call manager
  → Page database team
  → Post in #production-incident

HIGH:
  → Notify Engineering Lead
  → Post in #production-incident

MEDIUM:
  → Notify team lead
  → Post in #engineering-alerts
```

### Step 2: Investigate (T+5-15 min)

```bash
# Check resource usage
# CPU, Memory, Disk, Network
# Go to: Monitoring dashboard
# Look for: Spikes, maxed out resources

# Check logs for errors
# Example for Node.js
docker logs swipesavvy-api --tail 100 | grep -i error

# Example for Python
docker logs swipesavvy-agents --tail 100 | grep -i error

# Check recent deployments
git log --oneline -10
# Was something deployed in last 30 minutes?

# Check database status
# Ping DB: psql -h db.swipesavvy.com -U admin -d swipesavvy -c "SELECT 1"
# If connection fails → DB issue

# Check external dependencies
# Are third-party services down?
# Check: Stripe, SendGrid, AWS status pages
```

### Step 3: Identify Root Cause (T+15-30 min)

**Common Causes & Quick Fixes:**

| Cause | Signs | Fix | Time |
|-------|-------|-----|------|
| OOM (Out of Memory) | Memory 100%, crashes | Restart services | 2 min |
| Database down | Connection refused | Check DB, restart if needed | 5 min |
| Disk full | "no space left" error | Clean logs, increase space | 10 min |
| Deployment issue | Recent deploy before outage | Rollback deployment | 5 min |
| Network issue | DNS failures, no connectivity | Check network config | 10 min |
| Configuration problem | Invalid env vars | Verify config files | 5 min |

**Decision Tree:**

```
Is it OOM?
├─ YES → Restart containers (see Step 4)
└─ NO → Continue

Is it database?
├─ YES → Check DB connection (see Step 4)
└─ NO → Continue

Is it recent deployment?
├─ YES → Rollback (see Rollback section)
└─ NO → Continue

Is it resource exhaustion (CPU, Disk)?
├─ YES → Scale up (see Step 4)
└─ NO → Check logs for errors
```

### Step 4: Apply Fix

**Fix 1: Restart Services**
```bash
# For Docker Compose
docker-compose restart swipesavvy-api
docker-compose restart swipesavvy-agents
# Wait 30 seconds
docker-compose ps
# All should say "Up"

# Verify service restored
curl https://api.swipesavvy.com/health
# Should return 200
```

**Fix 2: Rollback Deployment**
```bash
# Find current deployment
git log --oneline -5
# Example output:
# a1b2c3d feat: add new feature
# x9y8z7w fix: previous fix
# etc.

# Rollback to previous known-good version
git reset --hard HEAD~1  # Go back 1 commit
git push -f origin main

# Wait for deployment to complete (CI/CD)
# Should automatically deploy rolled-back version

# Verify restored
curl https://api.swipesavvy.com/health
```

**Fix 3: Scale Up**
```bash
# If hitting resource limits
docker-compose up -d --scale api=3
# or in Kubernetes:
kubectl scale deployment/swipesavvy-api --replicas=5

# Monitor for improvement
watch curl https://api.swipesavvy.com/health
```

### Step 5: Verify Recovery (T+30-45 min)

```bash
# 1. Health checks pass
curl https://api.swipesavvy.com/health
# Status: 200 OK

# 2. User reports improving
# Monitor Slack for customer complaints

# 3. Metrics normalized
# Dashboard: errors down to <0.1%, response time normal

# 4. Log verification
docker logs swipesavvy-api | tail -50
# No errors in logs

# 5. Database queries responding
psql -h db.swipesavvy.com -U admin -c "SELECT COUNT(*) FROM users"
# Returns result quickly

echo "✅ Service restored"
```

### Step 6: Post-Incident (T+45-60 min)

```bash
# 1. Write incident report
cat > INCIDENT_REPORT_YYYY-MM-DD.md << 'EOF'
## Incident: [Service] Outage

**Time:** YYYY-MM-DD HH:MM to HH:MM (XX minutes)
**Severity:** CRITICAL/HIGH/MEDIUM
**Status:** RESOLVED

### Root Cause
[What actually broke]

### Timeline
- T+0: Alert fired
- T+5: Investigation started
- T+15: Root cause identified
- T+25: Fix applied
- T+30: Service restored

### Fix Applied
[What was done to fix it]

### Prevention
[What prevents this next time]

### Action Items
1. [Follow-up task]
2. [Follow-up task]
EOF

# 2. Share in Slack
# Post in #production-incident with:
# - Incident report
# - Timeline
# - Root cause
# - Follow-up actions

# 3. Schedule postmortem
# Team meeting within 24 hours to discuss prevention

# 4. Update runbooks
# If root cause was hidden by poor documentation:
# → Update this runbook
# → Update dashboards
# → Update alerts
```

---

## Deployment Rollback

### When to Rollback

Rollback immediately if:
- ❌ Critical errors in logs after deployment
- ❌ Service unavailable (5xx errors)
- ❌ Data corruption detected
- ❌ Major feature broken
- ⚠️ Performance degradation >50%

Do NOT rollback:
- ✅ Single minor feature broken (can fix with hotfix)
- ✅ Cosmetic UI issues
- ✅ Low-priority bugs
- ✅ Performance degradation <10%

### Rollback Procedure (5 minutes)

```bash
# Step 1: Verify current state
git log --oneline -3
# a1b2c3d (HEAD) feat: new feature (deployed 2 min ago)
# x9y8z7w fix: bug fix (deployed 1 hour ago)
# ...

# Step 2: Find rollback target
# Usually: previous commit or known good tag
TARGET="x9y8z7w"  # Previous working commit

# Step 3: Rollback
git reset --hard $TARGET
git push -f origin main
# ⚠️  Force push! Be careful!

# Step 4: Monitor deployment
# CI/CD automatically starts new deployment
# Takes ~5 minutes

# Step 5: Verify
curl https://api.swipesavvy.com/health
# Should return 200

# Step 6: Notify team
# Post in #production-incident:
# "Rolled back deployment [commit-hash]"
# "Service restored"
```

### Prevention: Better than Rollback

```
Prevent rollbacks by:
1. Test locally before pushing
2. Run CI/CD checks before merging
3. Gradual rollout (blue-green deployment)
4. Feature flags for new features
5. Monitoring and alerts
```

---

## Database Recovery

### Backup Information

```bash
# Automatic backups (daily 2 AM UTC)
# Location: AWS S3 bucket: swipesavvy-backups
# Retention: 30 days

# Latest backup
aws s3 ls s3://swipesavvy-backups/ --recursive --human-readable | tail -10

# Restore latest backup
./scripts/restore-database-latest.sh
# Time: ~10 minutes (depends on size)
```

### Step 1: Assess Damage (T+0-5 min)

```bash
# Test database connectivity
psql -h db.swipesavvy.com -U admin -d swipesavvy -c "SELECT COUNT(*) FROM users"

# If error: "connection refused" → DB is down
# If error: "database does not exist" → DB corrupted
# If slow response: → DB performance issue
```

### Step 2: Perform Recovery (T+5-20 min)

```bash
# Option A: Restart database
docker-compose restart db
# Wait 2 minutes
psql -h db.swipesavvy.com -U admin -d swipesavvy -c "SELECT 1"
# If successful → done

# Option B: Restore from backup
aws s3 cp s3://swipesavvy-backups/latest.sql.gz ./latest.sql.gz
gunzip latest.sql.gz
psql -h db.swipesavvy.com -U admin -d swipesavvy < latest.sql
# Takes ~10 minutes

# Option C: Restore to point-in-time
# Only if Option A & B don't work
# Requires professional help - escalate to DBA
```

### Step 3: Verify Data (T+20-30 min)

```bash
# Check record counts
psql -h db.swipesavvy.com -U admin -d swipesavvy << EOF
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'wallets', COUNT(*) FROM wallets;
EOF

# Compare to known baseline
# If counts significantly lower → data loss confirmed
```

### Step 4: Notify Users (if data loss)

```
"We identified a data issue affecting [scope].
We've restored from backup: [timestamp].
Any changes after that time may have been lost.
We apologize for the inconvenience."
```

---

## Performance Degradation

### SLA: Investigate within 15 min, resolve within 60 min

### Step 1: Measure Degradation (T+0-5 min)

```bash
# Check response times
# Dashboard → API Response Times
# Look for: Sudden spike in 95th percentile

# Check error rates
# Dashboard → Error Rate
# Look for: Spike in 5xx errors

# Check resource usage
# Dashboard → CPU, Memory, Disk, Network
# Look for: Spike or near-maximum
```

**Severity:**
```
🔴 CRITICAL: Response time >5s, error rate >5%
🟠 HIGH: Response time 1-5s, error rate 1-5%
🟡 MEDIUM: Response time 0.5-1s, error rate <1%
```

### Step 2: Identify Bottleneck (T+5-15 min)

```bash
# Check which endpoint is slow
# Enable detailed logging
# Restart with DEBUG=true

# Example: Slow database query
# Look at query logs
SELECT query, calls, mean_time FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;

# Example: Slow API endpoint
# Check application performance monitoring (APM)
# Look for: Slow controller, slow database query, etc.
```

### Step 3: Fix (T+15-60 min)

**Common Fixes:**

| Issue | Fix | Time |
|-------|-----|------|
| Slow query | Add index, optimize SQL | 5-15 min |
| N+1 queries | Use batch/join queries | 10-20 min |
| Memory leak | Restart service | 2 min |
| Cache miss | Warm cache, enable caching | 5-10 min |
| Resource limit | Scale up, optimize code | 10-30 min |

```bash
# Example: Add database index for slow query
psql -h db.swipesavvy.com -U admin -d swipesavvy << EOF
CREATE INDEX idx_users_email ON users(email);
EOF
# Index creation might take 5-10 minutes

# Verify improvement
psql -h db.swipesavvy.com -U admin -d swipesavvy << EOF
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
EOF
```

---

## Security Incident

### SLA: Initial response within 15 minutes

### Step 1: Containment (T+0-15 min)

```
STOP the bleeding:
1. If credentials compromised: rotate immediately
2. If data exposed: access logs show who accessed
3. If service compromised: isolate network
4. If malware detected: scan and quarantine
```

```bash
# Example: If API key compromised
# Revoke immediately
curl -X POST https://api.swipesavvy.com/admin/keys/revoke \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -d '{"key_id": "compromised_key_id"}'

# Generate new key
NEW_KEY=$(curl -X POST https://api.swipesavvy.com/admin/keys/generate)

# Rotate in all services
# Update environment variables
# Restart services
docker-compose restart swipesavvy-api swipesavvy-agents
```

### Step 2: Investigation (T+15-60 min)

```bash
# Gather evidence
# - Server logs
# - Access logs (who accessed what)
# - Database logs (what changed)
# - Network logs (unusual connections)

# Example: Access logs
grep "2024-01-15" /var/log/swipesavvy/access.log | grep -i "suspicious" | head -20

# Example: Database logs
grep "DROP TABLE" /var/log/swipesavvy/postgres.log

# Save all logs for analysis
tar czf incident-evidence-2024-01-15.tar.gz /var/log/swipesavvy/
```

### Step 3: Notify Stakeholders (T+60 min)

```
Required notifications:
- CEO / VP Product (business impact)
- VP Engineering (technical response)
- Legal (compliance requirements)
- Communications (customer notification)
- All affected customers (transparent communication)

Template:

Subject: SECURITY INCIDENT - Immediate Action Taken

We've identified a security incident affecting [component].

What happened:
[Plain English explanation]

Impact:
- Affected: [X users / Y data records]
- Exposure: [What information was exposed]

Actions taken:
- [Containment action]
- [Investigation action]
- [Remediation action]

Next steps:
- Monitoring for additional issues
- Full investigation report: [date]
- Recommended user action: [change password / no action / ...]
```

### Step 4: Remediation & Recovery (T+varies)

```bash
# Patch vulnerability
# See: Critical Vulnerability Response section

# Restore clean systems
# If compromised: rebuild from clean image
docker pull swipesavvy-api:latest-clean
docker-compose up -d

# Verify integrity
# Run security scans
bandit -r app/
safety check
npm audit

# Monitor for re-infection
# Watch logs for suspicious patterns
tail -f /var/log/swipesavvy/*.log | grep -i "error\|warning"
```

---

## Escalation Matrix

### Who to Contact by Incident Type

```
CRITICAL PRODUCTION OUTAGE:
  ├─ On-call Engineer → Acknowledge in Slack immediately
  ├─ Engineering Lead → Page for engineering decisions
  ├─ DevOps Lead → Page for infrastructure issues
  ├─ VP Engineering → Page for coordination
  └─ CEO → Notification only (business impact)

CRITICAL VULNERABILITY:
  ├─ Security Lead → Immediate assessment
  ├─ DevOps Lead → Deploy patch
  ├─ Engineering Lead → Code review
  └─ VP Engineering → Notification

DATA LOSS / CORRUPTION:
  ├─ DBA → Database recovery
  ├─ VP Engineering → Impact assessment
  ├─ Legal → Compliance review
  ├─ Communications → Customer notification
  └─ CEO → Notification

SECURITY BREACH:
  ├─ Security Team → Investigation
  ├─ Legal → Compliance (GDPR, breach notification laws)
  ├─ Communications → Public statement
  ├─ VP Engineering → Technical response
  └─ CEO → Public statement
```

### On-Call Rotation Schedule

```
Week Mon-Fri:
  ├─ 9 AM - 5 PM: Primary Engineer (in office)
  ├─ 5 PM - 9 AM: Secondary Engineer (on-call)
  └─ Weekends: Rotating schedule

Contact:
  ├─ Slack: @oncall (automated)
  ├─ PagerDuty: automatic escalation
  ├─ Phone: [number in runbook]
  └─ Escalation: After 15 min no response

Escalation Path:
  1. On-call engineer
  2. Engineering lead
  3. VP Engineering
  4. CTO
```

---

## Communication Templates

### Template 1: Initial Alert (T+0)

```
🚨 INCIDENT: [Service Name] Outage

Severity: [CRITICAL/HIGH/MEDIUM]
Status: Investigating
Time: [Start time]

Affected:
- Service: [Name]
- Users: ~[number]
- Impact: [Users can't login / Slow responses / Feature unavailable]

Actions:
- Engineers investigating
- Real-time updates in this thread
- Estimated fix: [timeframe]

Will update every 5 minutes.
```

### Template 2: Update (T+15, T+30, etc)

```
🔄 UPDATE: [Service Name] Outage

Root cause: [Identified / Still investigating]
[If identified]: We've identified [specific cause]

Current action:
- [What engineer is doing]
- [Expected next step]
- Estimated restoration: [time]

We appreciate your patience.
```

### Template 3: Resolution (T+N)

```
✅ RESOLVED: [Service Name] Outage

Status: Service fully restored
Time restored: [time]
Duration: [X minutes]
Root cause: [Specific technical cause]

What we'll do to prevent:
1. [Prevention action]
2. [Prevention action]
3. [Postmortem scheduled]: [date/time]

We apologize for the disruption.
```

### Template 4: Postmortem (Next business day)

```
📋 POSTMORTEM: [Service Name] Outage [Date]

Timeline:
- 14:30: Alert fired
- 14:35: Investigation started
- 14:50: Root cause identified
- 15:05: Fix deployed
- 15:10: Service restored

Root Cause Analysis:
[Detailed explanation of what broke and why]

Contributing Factors:
- [Thing that made it worse]
- [Thing that made it worse]

Preventive Measures:
1. [To prevent this specific issue]
2. [To catch this earlier]
3. [To reduce time to resolution]

Follow-up Items:
- [ ] [Task] - [Owner] - [Due date]
- [ ] [Task] - [Owner] - [Due date]

Questions?
```

---

## Quick Reference Checklist

### For Any Critical Incident

- [ ] Acknowledge alert in Slack immediately
- [ ] Assess severity (CRITICAL/HIGH/MEDIUM)
- [ ] Escalate if needed
- [ ] Begin investigation
- [ ] Identify root cause within 15 minutes
- [ ] Apply fix
- [ ] Verify resolution
- [ ] Write incident report
- [ ] Notify stakeholders
- [ ] Schedule postmortem

### Before You Deploy

- [ ] All tests pass locally
- [ ] All CI/CD checks pass
- [ ] Code review approved
- [ ] Feature flags set correctly
- [ ] Monitoring alerts configured
- [ ] Runbooks updated
- [ ] Team notified of deployment

### In Case of Emergency

**When in doubt, escalate:**
- Slack: @oncall or #critical-alerts
- Phone: [emergency number]
- Page: PagerDuty (automatic)

**Never:**
- Try to fix without understanding the problem
- Force push to main without approval
- Disable monitoring/alerting
- Ignore warnings or errors

---

**Remember: Rapid response matters more than perfect fixes. Fix fast, fix properly, prevent recurrence.**

**Questions? Post in #devops-support or reach out to on-call engineer**
