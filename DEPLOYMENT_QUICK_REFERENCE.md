# ⚡ DEPLOYMENT QUICK REFERENCE CARD

**Print & Post in War Room**  
**Keep with Deployment Lead at All Times**

---

## 🎯 ONE-PAGE MISSION BRIEF

```
MISSION: Deploy SwipeSavvy v2.0.0 to Production
DATE:    January 1, 2026 (Tuesday)
TIME:    12:00 AM - 2:00 AM UTC
DURATION: 2 hours
STATUS:  READY TO GO ✅
```

---

## 📅 TIMELINE AT A GLANCE

```
11:00 PM (Dec 31)  Deployment team assembled
11:45 PM (Dec 31)  Final green light
12:00 AM (Jan 1)   Canary: 5% traffic routed
12:30 AM (Jan 1)   Decision: Proceed or rollback?
1:00 AM  (Jan 1)   Full deployment: 100% traffic
1:30 AM  (Jan 1)   Smoke tests: Run 20 tests
2:00 AM  (Jan 1)   Go-live announcement 🚀
```

---

## 🚨 SUCCESS = All 3 Must Be True

```
✅ 20/20 smoke tests pass
✅ Error rate < 0.1%
✅ Response time < 200ms
```

---

## 🚀 DEPLOYMENT COMMANDS

### Start Deployment
```bash
./deploy_production.sh --mode=canary --traffic=5%
```

### Full Deployment
```bash
./deploy_production.sh --mode=full --traffic=100%
```

### Rollback (if needed)
```bash
./rollback_production.sh --version=1.0.0 --force
```

### Run Smoke Tests
```bash
./scripts/smoke_tests.sh --mode=production
```

---

## 📊 CRITICAL METRICS

### Watch These Every 10 Minutes

```
Metric                    Green        Yellow       Red
──────────────────────────────────────────────────────
API Error Rate           < 0.1%       0.1-0.5%    > 0.5%
P99 Response Time        < 200ms      200-300ms   > 300ms
Database Connections     < 50%        50-80%      > 80%
CPU Usage                < 60%        60-70%      > 70%
Memory Usage             < 70%        70-80%      > 80%
Notification Queue       < 1000       1000-5000   > 5000
Active Users             > 100        50-100      < 50
```

---

## 🔴 ROLLBACK TRIGGERS

**Execute rollback immediately if ANY**:
```
✗ Error rate > 2% for 5 minutes
✗ Response time > 500ms for 10 minutes
✗ Database connection failures (>10%)
✗ Data corruption detected
✗ Notification delivery < 95%
✗ Deployment lead calls it
```

---

## 📞 TEAM RESPONSIBILITIES

```
Deployment Lead
  └─ Make go/no-go decisions
  └─ Monitor overall status
  └─ Authorize rollback if needed

DevOps Engineer
  └─ Execute deployment script
  └─ Monitor infrastructure metrics
  └─ Handle deployment issues

Backend Lead
  └─ Monitor API performance
  └─ Watch application logs
  └─ Troubleshoot backend issues

Database Admin
  └─ Monitor database performance
  └─ Watch replication lag
  └─ Verify data integrity

QA Lead
  └─ Execute smoke tests
  └─ Verify test results
  └─ Confirm success/failure

Product Lead
  └─ Prepare announcements
  └─ Notify stakeholders
  └─ Handle customer communication

Support Lead
  └─ Monitor support tickets
  └─ Brief support team
  └─ Escalate issues
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

```
30 Minutes Before Deployment:

INFRASTRUCTURE
  [ ] Database backup complete
  [ ] All services healthy
  [ ] Monitoring dashboards active
  [ ] Logs accessible

TEAM
  [ ] All members in war room
  [ ] Slack channel active
  [ ] Zoom meeting started
  [ ] PagerDuty armed

SYSTEMS
  [ ] Rollback script tested
  [ ] Smoke tests run in staging (20/20)
  [ ] Environment variables verified
  [ ] API endpoints responding

DOCUMENTATION
  [ ] Runbook printed
  [ ] Emergency contacts visible
  [ ] Success criteria clear
  [ ] Communication script ready
```

---

## 🎯 DECISION POINTS

### At 12:30 AM: Canary Go/No-Go
```
QUESTION: Are canary metrics healthy?
  
  ✅ YES → Proceed to full deployment
  ❌ NO → Execute rollback, reschedule
```

### At 1:30 AM: Full Deployment Validation
```
QUESTION: Are all smoke tests passing?
  
  ✅ YES → Proceed to announcement
  ❌ NO → Decision: Fix or rollback?
```

### At 2:00 AM: Go-Live Announcement
```
QUESTION: Is system production-ready?
  
  ✅ YES → Announce go-live 🚀
  ❌ NO → Execute rollback, plan retry
```

---

## 📊 GRAFANA DASHBOARDS TO OPEN

Open these tabs before deployment:

```
1. API Health & Performance
   └─ URL: https://grafana.internal/d/api-health
   
2. Database Performance
   └─ URL: https://grafana.internal/d/db-perf
   
3. Application Metrics
   └─ URL: https://grafana.internal/d/app-metrics
   
4. Infrastructure
   └─ URL: https://grafana.internal/d/infra

5. Alerts & Events
   └─ URL: https://grafana.internal/d/alerts
```

---

## 🆘 IF SOMETHING GOES WRONG

### First 5 Minutes: Investigate
```
[ ] Check error logs
[ ] Review metric graphs
[ ] Look for error patterns
[ ] Ask: What changed?
```

### 5-10 Minutes: Escalate
```
[ ] Page on-call engineers
[ ] Gather logs/metrics
[ ] Brief deployment lead
[ ] Prepare rollback
```

### 10+ Minutes: Decide
```
[ ] Can we fix it quickly?
   YES → Fix and continue
   NO → Execute rollback
```

---

## 📞 EMERGENCY CONTACTS

```
Deployment Lead
  Phone: +1-XXX-XXX-XXXX
  Slack: @deployment-lead

On-Call Engineer
  Phone: +1-XXX-XXX-XXXX
  Slack: @on-call

VP Engineering
  Phone: +1-XXX-XXX-XXXX
  Slack: @vp-engineering

War Room Zoom
  Link: https://zoom.us/j/XXXXXXXXX
```

---

## ✅ SUCCESS CRITERIA

### Canary Phase (12:00-12:30 AM)
```
✅ Error rate < 0.5%
✅ Response time < 300ms
✅ No new error types
✅ Database healthy
✅ No alerts triggered
```

### Full Deployment (1:00-1:30 AM)
```
✅ Error rate < 0.1%
✅ Response time < 200ms
✅ All endpoints working
✅ Database performing
✅ Notifications flowing
```

### Smoke Tests (1:30-2:00 AM)
```
✅ 20/20 tests pass
✅ No timeouts
✅ All data validated
✅ No new issues
```

### Overall Success (2:00 AM)
```
✅ All above criteria met
✅ Team confirms ready
✅ Announcement sent
✅ System stable
✅ Monitoring active
```

---

## 🎉 YOU'VE GOT THIS!

**Remember**:
- Trust the process
- Follow the procedures
- Watch the metrics
- Make quick decisions
- Celebrate success

**Status**: 🟢 ALL SYSTEMS GO

**Let's deploy! 🚀**

---

**Keep this card visible throughout deployment**

**Generated**: December 26, 2025  
**Version**: 1.0  
**Status**: READY FOR PRODUCTION

