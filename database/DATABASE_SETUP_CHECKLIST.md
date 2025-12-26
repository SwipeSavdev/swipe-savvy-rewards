# 📋 DATABASE SETUP CHECKLIST & VERIFICATION

**Complete Setup Verification for SwipeSavvy Database**  
**Created:** December 26, 2025

---

## ✅ PRE-INSTALLATION CHECKLIST

Before running the database setup, verify these prerequisites:

### System Requirements
- [ ] PostgreSQL 12+ installed (13+ recommended)
- [ ] psql command available in PATH
- [ ] At least 10GB free disk space
- [ ] 2GB+ RAM available
- [ ] Network access to database host

### Verification Commands
```bash
# Check PostgreSQL version
psql --version
# Expected: psql (PostgreSQL) 13.x or higher

# Check disk space
df -h /
# Expected: At least 10GB free

# Check PostgreSQL service
pg_isready -h localhost
# Expected: accepting connections
```

### Access Requirements
- [ ] PostgreSQL superuser (postgres) password known
- [ ] Ability to create users and databases
- [ ] Write access to database directory
- [ ] Network connectivity to production DB (if applicable)

---

## 🚀 INSTALLATION STEPS

### Step 1: Prepare Environment (5 minutes)
- [ ] Create database directory: `mkdir -p database`
- [ ] Copy schema file: `cp swipesavvy_complete_schema.sql database/`
- [ ] Copy init script: `cp init_database.sh database/`
- [ ] Make script executable: `chmod +x database/init_database.sh`
- [ ] Copy config file: `cp database-config.ts database/`

### Step 2: Set Environment Variables (5 minutes)
```bash
# Development
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=swipesavvy_db
export DB_USER=postgres
export DB_PASSWORD=postgres

# OR for production
export DB_HOST=prod-db.example.com
export DB_PORT=5432
export DB_NAME=swipesavvy_prod
export DB_USER=postgres
export DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id db-password --query SecretString)
```

- [ ] Variables verified with: `echo $DB_HOST`

### Step 3: Run Initialization Script (5-10 minutes)
```bash
cd database/
./init_database.sh development
# OR
./init_database.sh production
```

- [ ] Script completed without errors
- [ ] Configuration file created: `.env.database.local`
- [ ] All 16 tables created
- [ ] All 20+ indexes created
- [ ] 10 feature flags seeded
- [ ] Users created: swipesavvy_backend, swipesavvy_analytics

### Step 4: Update Application Configuration (5 minutes)
- [ ] Copy `.env.example` to `.env`
- [ ] Update `DB_HOST` with your database host
- [ ] Update `DB_PORT` if using non-standard port
- [ ] Update `DB_USER` and `DB_PASSWORD`
- [ ] Update `DATABASE_URL` connection string
- [ ] Add `.env` to `.gitignore`

---

## 🔍 VERIFICATION CHECKLIST

### Database Connection (5 minutes)

**Test 1: Direct Connection**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c "SELECT version();"
```
- [ ] Connection successful
- [ ] PostgreSQL version displays

**Test 2: Table Verification**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c "\dt"
```
- [ ] All 16 tables listed
- [ ] Tables include: feature_flags, campaign_analytics_daily, ab_tests, etc.

**Test 3: Feature Flags Seeded**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c \
  "SELECT COUNT(*) as flag_count FROM feature_flags;"
```
- [ ] Result shows 10 flags
- [ ] Expected count: 10

**Test 4: Users Verification**
```bash
psql -h $DB_HOST -U postgres -d swipesavvy_db -c "\du"
```
- [ ] User `swipesavvy_backend` exists
- [ ] User `swipesavvy_analytics` exists
- [ ] Both users have correct permissions

### Index Verification (5 minutes)

**Test 5: Indexes Created**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c \
  "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';"
```
- [ ] Result shows 20+ indexes
- [ ] Indexes cover primary tables

**Test 6: Query Performance**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c \
  "EXPLAIN SELECT * FROM feature_flags WHERE key='tier_progress_bar';"
```
- [ ] Query uses index
- [ ] Execution plan shows index scan

### Views Verification (3 minutes)

**Test 7: Views Exist**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c "\dv"
```
- [ ] View `v_active_feature_flags` exists
- [ ] View `v_feature_flag_usage_summary` exists
- [ ] View `v_ab_test_summary` exists
- [ ] View `v_campaign_performance_summary` exists

### Functions & Triggers Verification (3 minutes)

**Test 8: Triggers Working**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c \
  "SELECT tgname FROM pg_trigger WHERE tgrelid='feature_flags'::regclass;"
```
- [ ] Triggers listed for feature_flags table
- [ ] Timestamp triggers active

---

## 📱 APPLICATION INTEGRATION TESTS

### Backend Service (10 minutes)

**Test 9: Backend Connection**
```bash
# In backend directory
npm start
# Or
python server.py
```
- [ ] Application starts without connection errors
- [ ] Logs show "Database connection pool initialized"
- [ ] API is responsive on port 8000

**Test 10: Feature Flags API**
```bash
curl -X GET http://localhost:8000/api/features/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 status
- [ ] Response includes all 10 feature flags
- [ ] Response is JSON formatted

**Test 11: Analytics API**
```bash
curl -X GET http://localhost:8000/api/analytics/campaign/1/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 status or 404 if no data
- [ ] Response includes metric fields

### Mobile App (10 minutes)

**Test 12: Mobile Database Service**
```typescript
// In mobile app
import { DatabaseService } from './services/DatabaseService';

// Test feature flag access
const flags = await DatabaseService.getFeatureFlags();
console.log('Flags:', flags);
```
- [ ] Successfully retrieves flags
- [ ] No connection errors
- [ ] Flags cached properly

**Test 13: Mobile Feature Flag Hook**
```typescript
// In component
const isEnabled = useFeatureFlag('tier_progress_bar');
console.log('Flag enabled:', isEnabled);
```
- [ ] Hook returns boolean value
- [ ] Value matches database setting
- [ ] Hook updates on flag toggle

### Admin Portal (10 minutes)

**Test 14: Admin Features API**
```bash
curl -X GET http://localhost:8000/api/features/all \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
- [ ] Returns all flags
- [ ] Includes enabled status
- [ ] Response formatted correctly

**Test 15: Admin Toggle Functionality**
```bash
curl -X POST http://localhost:8000/api/features/community_feed/toggle \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```
- [ ] Returns 200 success
- [ ] Flag status updated in database
- [ ] Update visible in next query

**Test 16: Admin Analytics Access**
```bash
curl -X GET http://localhost:8000/api/features/all \
  -H "Authorization: Bearer ADMIN_TOKEN" | jq '.[0]'
```
- [ ] Admin can view analytics
- [ ] Usage data populated
- [ ] Response includes all fields

---

## 🔒 SECURITY VERIFICATION

### Access Control (5 minutes)

**Test 17: Backend User Permissions**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c \
  "INSERT INTO feature_flags (key, name, enabled) VALUES ('test', 'Test', true);"
```
- [ ] INSERT succeeds
- [ ] Backend user can write

**Test 18: Analytics User Restrictions**
```bash
psql -h $DB_HOST -U swipesavvy_analytics -d swipesavvy_db -c \
  "DELETE FROM feature_flags WHERE id = 999;"
```
- [ ] DELETE fails (permission denied)
- [ ] Analytics user is read-only

**Test 19: Audit Logging**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c \
  "SELECT * FROM feature_flag_audit_log ORDER BY created_at DESC LIMIT 1;"
```
- [ ] Audit log entries exist
- [ ] Changes are tracked
- [ ] Timestamp recorded

### Data Integrity (3 minutes)

**Test 20: Foreign Key Constraints**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c \
  "SELECT constraint_type FROM information_schema.table_constraints 
   WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'feature_flag_rollouts';"
```
- [ ] Foreign keys defined
- [ ] Referential integrity enforced

---

## 📊 PERFORMANCE BASELINE

### Establish Performance Metrics (5 minutes)

**Test 21: Query Performance**
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c \
  "SELECT COUNT(*) FROM feature_flag_usage WHERE accessed_at > NOW() - INTERVAL '24 hours';"
```
- [ ] Query completes in < 100ms
- [ ] Uses indexes efficiently

**Test 22: Connection Pool**
```bash
# Check active connections
psql -h $DB_HOST -U postgres -d swipesavvy_db -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname='swipesavvy_db';"
```
- [ ] Connection count reasonable
- [ ] Below pool size limit (20)

---

## 🔄 POST-INSTALLATION TASKS

### Configuration Files (5 minutes)
- [ ] `.env` file created in project root
- [ ] Environment variables populated
- [ ] `.env` added to `.gitignore`
- [ ] Database credentials rotated (production)
- [ ] Backup configuration enabled

### Monitoring Setup (5 minutes)
- [ ] Database monitoring enabled
- [ ] Alerts configured
- [ ] Logging verified
- [ ] Backup schedule confirmed
- [ ] Log retention set

### Documentation (5 minutes)
- [ ] Team notified of database ready
- [ ] Connection credentials distributed securely
- [ ] Documentation updated
- [ ] Runbooks created
- [ ] On-call procedures documented

### Backup & Recovery (5 minutes)
- [ ] First backup created: `pg_dump ... > initial_backup.sql`
- [ ] Backup location verified
- [ ] Restore procedure tested
- [ ] Recovery plan documented
- [ ] Point-in-time recovery enabled

---

## 🎯 FINAL SIGN-OFF

### Pre-Production Checklist
- [ ] All 16 tables created
- [ ] All 20+ indexes created
- [ ] 10 feature flags seeded
- [ ] 2 database users created
- [ ] Audit logging functional
- [ ] Foreign keys enforced

### Application Integration
- [ ] Backend connects successfully
- [ ] Mobile app accesses database
- [ ] Admin portal manages flags
- [ ] All APIs functional
- [ ] No error logs

### Security & Performance
- [ ] Access control verified
- [ ] Data encrypted in transit (SSL)
- [ ] Query performance acceptable
- [ ] Connection pooling working
- [ ] Audit trail operational

### Documentation & Training
- [ ] Setup guide completed
- [ ] Team trained on access
- [ ] Backup procedures known
- [ ] Support contacts identified
- [ ] Escalation procedures clear

---

## 📞 QUICK REFERENCE

### Connection Test
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c "SELECT 'Ready!' as status;"
```

### View All Tables
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c "\dt"
```

### Count Tables
```bash
psql -h $DB_HOST -U swipesavvy_backend -d swipesavvy_db -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
```

### View Configuration
```bash
cat .env.database.local
```

### Stop Database
```bash
# macOS
brew services stop postgresql@15

# Ubuntu/Debian
sudo systemctl stop postgresql

# CentOS/RHEL
sudo systemctl stop postgresql
```

---

## ✅ SIGN-OFF

**Database Setup Completed:** ___________  
**Date:** ___________  
**Verified By:** ___________  
**Environment:** ___________  

**Notes:**

---

**Status:** ✅ Ready for Production  
**All Systems Go!**
