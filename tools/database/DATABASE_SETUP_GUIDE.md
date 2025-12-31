# 🗄️ DATABASE SETUP & INTEGRATION GUIDE

**SwipeSavvy Complete Database Setup for All Applications**  
**Created:** December 26, 2025  
**Status:** Production Ready

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Database Architecture](#database-architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Connection Guide](#connection-guide)
6. [Schema Overview](#schema-overview)
7. [Integration with Applications](#integration-with-applications)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## 🚀 QUICK START

### For Developers (5 minutes)

```bash
# 1. Navigate to database directory
cd database/

# 2. Run initialization script
chmod +x init_database.sh
./init_database.sh development

# 3. Verify configuration
cat .env.database.local

# 4. Start using in your app!
```

### For DevOps/Production (10 minutes)

```bash
# 1. Set environment variables
export DB_HOST=prod-db.example.com
export DB_PORT=5432
export DB_NAME=swipesavvy_prod
export DB_USER=postgres
export DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id db-password --query SecretString --output text)

# 2. Run initialization
./init_database.sh production

# 3. Verify security
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\du"
```

---

## 🏗️ DATABASE ARCHITECTURE

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SwipeSavvy Database                          │
├─────────────────────────────────────────────────────────────────┤
│ Database: swipesavvy_db                                         │
│ PostgreSQL 13+ (compatible with 12+)                            │
│ Total Tables: 16                                                │
│ Indexes: 20+                                                    │
│ Views: 4                                                        │
│ Functions/Triggers: 5                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Table Groups

#### 1. Feature Flags (5 tables)
- `feature_flags` - Main configuration
- `feature_flag_rollouts` - Variant targeting
- `feature_flag_usage` - Access tracking
- `feature_flag_analytics` - Daily aggregates
- `feature_flag_audit_log` - Change history

#### 2. Analytics (2 tables)
- `campaign_analytics_daily` - Daily metrics
- `campaign_analytics_segments` - Segment breakdown

#### 3. A/B Testing (3 tables)
- `ab_tests` - Test configuration
- `ab_test_assignments` - User assignments
- `ab_test_results` - Statistical results

#### 4. ML Models (1 table)
- `ml_models` - Trained model versions

#### 5. User Optimization (3 tables)
- `user_merchant_affinity` - Preference scores
- `user_optimal_send_times` - Best contact times
- `campaign_optimizations` - Recommendations

---

## 📥 INSTALLATION

### Prerequisites

**System Requirements:**
- PostgreSQL 12+ (13+ recommended)
- 10+ GB disk space
- 2+ GB RAM allocated to PostgreSQL
- Network connectivity to database server

**Installation Check:**

```bash
# Check PostgreSQL version
psql --version

# If not installed, install PostgreSQL:
# macOS (Homebrew)
brew install postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Step 1: Download Schema Files

```bash
# Navigate to the database setup directory
cd /path/to/swipesavvy-mobile-app/tools/database

# Verify files exist
ls -la
# Should show:
# - swipesavvy_complete_schema.sql
# - init_database.sh
# - database-config.ts
# - DATABASE_SETUP_GUIDE.md (this file)
```

### Step 2: Prepare PostgreSQL

```bash
# Start PostgreSQL service
# macOS
brew services start postgresql@15

# Ubuntu/Debian
sudo systemctl start postgresql

# CentOS/RHEL
sudo systemctl start postgresql

# Windows (if installed as service, it starts automatically)

# Verify service is running
pg_isready -h localhost -p 5432
# Output: accepting connections
```

### Step 3: Create Superuser (if needed)

```bash
# Create superuser for initial setup
sudo -u postgres createuser --interactive
# Follow prompts

# Or use password authentication
sudo -u postgres psql -c "CREATE USER admin WITH SUPERUSER PASSWORD 'admin_pass';"
```

### Step 4: Run Initialization Script

```bash
# Make script executable
chmod +x init_database.sh

# Run with default settings (localhost, development)
./init_database.sh development

# Or specify remote database
DB_HOST=prod-db.example.com \
DB_PORT=5432 \
DB_USER=postgres \
DB_PASSWORD=your_password \
./init_database.sh production
```

---

## ⚙️ CONFIGURATION

### Environment Variables

Create a `.env` file in your application root:

```bash
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swipesavvy_db
DB_USER=swipesavvy_backend
DB_PASSWORD=secure_password_123

# Connection Pool
DB_POOL_SIZE=20
DB_IDLE_TIMEOUT=30000
DB_MAX_LIFETIME=1800000
DB_CONNECTION_TIMEOUT=10000

# Read-only Connection (Optional)
DB_READ_HOST=localhost
DB_READ_PORT=5432
DB_READ_USER=swipesavvy_analytics
DB_READ_PASSWORD=analytics_password_456

# Database URL (Alternative)
DATABASE_URL=postgresql://swipesavvy_backend:secure_password_123@localhost:5432/swipesavvy_db

# SSL/TLS (Production only)
DB_SSL=true
DB_SSL_MODE=require
DB_SSL_CERT=/path/to/client-cert.pem
DB_SSL_KEY=/path/to/client-key.pem
DB_SSL_ROOT_CERT=/path/to/ca-cert.pem
```

### Connection Pool Configuration

```typescript
// For optimal performance, adjust based on your workload
DB_POOL_SIZE=20              // Connections in pool
DB_IDLE_TIMEOUT=30000        // 30 seconds
DB_MAX_LIFETIME=1800000      // 30 minutes
DB_CONNECTION_TIMEOUT=10000  // 10 seconds

// For high-traffic environments
DB_POOL_SIZE=50
DB_IDLE_TIMEOUT=60000
DB_MAX_LIFETIME=3600000
```

### Database Users

Two users are created automatically:

**1. swipesavvy_backend** (Read/Write)
```sql
-- Used by: Backend API, scheduled jobs
-- Permissions: SELECT, INSERT, UPDATE, DELETE on all tables
-- Password: secure_password_123
```

**2. swipesavvy_analytics** (Read-Only)
```sql
-- Used by: Analytics dashboard, reporting
-- Permissions: SELECT only
-- Password: analytics_password_456
```

### Security Best Practices

```bash
# 1. Change default passwords (Production)
psql -h localhost -U postgres -d swipesavvy_db
ALTER USER swipesavvy_backend WITH PASSWORD 'new_secure_password';
ALTER USER swipesavvy_analytics WITH PASSWORD 'new_analytics_password';

# 2. Enable SSL/TLS (Production)
# Add to postgresql.conf:
ssl = on
ssl_cert_file = '/etc/postgresql/server.crt'
ssl_key_file = '/etc/postgresql/server.key'

# 3. Configure pg_hba.conf for SSL connections
# Add lines:
hostssl all all 0.0.0.0/0 cert
hostssl all all ::/0 cert

# 4. Enable encryption at rest
# Use encrypted filesystems or pgcrypto extension
```

---

## 🔗 CONNECTION GUIDE

### Backend (TypeScript/Node.js)

```typescript
// backend/server.ts
import { initializeDatabaseConnection, query } from './config/database';

async function main() {
  // Initialize database connection
  await initializeDatabaseConnection('production');

  // Use in endpoints
  app.get('/api/features', async (req, res) => {
    try {
      const result = await query(
        'SELECT * FROM feature_flags WHERE enabled = true'
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await closeDatabaseConnection();
    process.exit(0);
  });
}

main().catch(console.error);
```

### Backend (Python/FastAPI)

```python
# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Connection string from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://swipesavvy_backend:secure_password_123@localhost/swipesavvy_db"
)

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,
    echo=False,  # Set to True for debugging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Usage in routes
from fastapi import Depends

@app.get("/api/features")
def get_features(db: Session = Depends(get_db)):
    return db.query(FeatureFlag).filter(FeatureFlag.enabled == True).all()
```

### Mobile App (React Native)

```typescript
// src/services/DatabaseService.ts
import { api } from './api';

export class DatabaseService {
  // Get feature flags from backend
  static async getFeatureFlags(): Promise<FeatureFlag[]> {
    const response = await api.get('/api/features/all');
    return response.data;
  }

  // Check single flag
  static async checkFlag(flagKey: string): Promise<boolean> {
    const response = await api.get(`/api/features/check/${flagKey}`);
    return response.data.enabled;
  }

  // Get analytics
  static async getAnalytics(campaignId: string) {
    const response = await api.get(`/api/analytics/campaign/${campaignId}/metrics`);
    return response.data;
  }

  // Submit usage event
  static async trackFlagUsage(flagKey: string, value: boolean) {
    return api.post('/api/features/track-usage', {
      flag_key: flagKey,
      value_used: value,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Admin Portal (React)

```typescript
// src/services/DatabaseService.ts
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class AdminDatabaseService {
  // Get all flags for management
  static async getAllFlags() {
    const response = await axios.get(`${API_BASE}/api/features/all`);
    return response.data;
  }

  // Toggle feature flag
  static async toggleFlag(flagKey: string, enabled: boolean) {
    return axios.post(`${API_BASE}/api/features/${flagKey}/toggle`, {
      enabled,
    });
  }

  // Get analytics data
  static async getCampaignAnalytics(campaignId: string, dateRange: string) {
    return axios.get(
      `${API_BASE}/api/analytics/campaign/${campaignId}/metrics`,
      { params: { dateRange } }
    );
  }
}
```

---

## 📊 SCHEMA OVERVIEW

### Feature Flags Table

```sql
-- Main feature flag configuration
CREATE TABLE feature_flags (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,           -- tier_progress_bar
  name VARCHAR(255) NOT NULL,                 -- "Tier Progress Bar"
  description TEXT,
  category VARCHAR(50),                       -- UI, Advanced, Experimental
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0,       -- 0-100
  owner_email VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Example data
INSERT INTO feature_flags (key, name, category, enabled) VALUES
('tier_progress_bar', 'Tier Progress Bar', 'UI', true),
('social_sharing', 'Social Sharing', 'Advanced', true),
('community_feed', 'Community Feed', 'Experimental', false);
```

### Campaign Analytics Table

```sql
CREATE TABLE campaign_analytics_daily (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  roi DECIMAL(10, 2),
  created_at TIMESTAMP
);
```

### A/B Tests Table

```sql
CREATE TABLE ab_tests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  campaign_id INTEGER,
  hypothesis TEXT,
  control_variant VARCHAR(100),
  variant_a VARCHAR(100),
  variant_b VARCHAR(100),
  status VARCHAR(50),                         -- draft, running, completed
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  confidence_level FLOAT DEFAULT 95.0,
  created_at TIMESTAMP
);
```

---

## 🔌 INTEGRATION WITH APPLICATIONS

### Backend Service Integration

```python
# backend/services/feature_flag_service.py
from sqlalchemy import select
from database import SessionLocal
from models import FeatureFlag

class FeatureFlagService:
    def __init__(self):
        self.db = SessionLocal()

    def get_all_flags(self):
        """Get all feature flags"""
        query = select(FeatureFlag).where(FeatureFlag.deleted_at == None)
        return self.db.execute(query).scalars().all()

    def check_flag(self, flag_key: str) -> bool:
        """Check if a flag is enabled"""
        flag = self.db.query(FeatureFlag).filter(
            FeatureFlag.key == flag_key
        ).first()
        return flag.enabled if flag else False

    def toggle_flag(self, flag_key: str, enabled: bool):
        """Toggle a feature flag"""
        flag = self.db.query(FeatureFlag).filter(
            FeatureFlag.key == flag_key
        ).first()
        if flag:
            flag.enabled = enabled
            flag.updated_at = datetime.now()
            self.db.commit()
            return flag
        return None
```

### Mobile App Integration

```typescript
// src/services/FeatureFlagClient.ts
import { DatabaseService } from './DatabaseService';

export class FeatureFlagClient {
  private cache = new Map<string, { value: boolean; timestamp: number }>();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes

  async checkFlag(flagKey: string): Promise<boolean> {
    // Check cache first
    const cached = this.cache.get(flagKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.value;
    }

    // Fetch from backend
    const enabled = await DatabaseService.checkFlag(flagKey);

    // Update cache
    this.cache.set(flagKey, {
      value: enabled,
      timestamp: Date.now(),
    });

    return enabled;
  }
}

// Hook for React components
export const useFeatureFlag = (flagKey: string) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    FeatureFlagClient.checkFlag(flagKey).then(setEnabled);
  }, [flagKey]);

  return enabled;
};
```

### Admin Portal Integration

```typescript
// src/pages/FeatureFlagManagement.tsx
import React, { useEffect, useState } from 'react';
import { AdminDatabaseService } from '../services/DatabaseService';

export const FeatureFlagManagement = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminDatabaseService.getAllFlags().then(setFlags).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (flagKey: string, currentStatus: boolean) => {
    await AdminDatabaseService.toggleFlag(flagKey, !currentStatus);
    // Refresh flags
    const updated = await AdminDatabaseService.getAllFlags();
    setFlags(updated);
  };

  return (
    <div className="feature-flag-management">
      {flags.map(flag => (
        <FeatureFlagRow
          key={flag.id}
          flag={flag}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};
```

---

## ✅ TESTING

### Manual Connection Test

```bash
# Test connection with psql
psql -h localhost -U swipesavvy_backend -d swipesavvy_db

# Run test query
SELECT COUNT(*) FROM feature_flags;

# Should return something like:
# count
# -------
#    10
# (1 row)
```

### Test Feature Flags

```bash
# Get all flags
psql -h localhost -U swipesavvy_backend -d swipesavvy_db -c \
  "SELECT key, name, enabled FROM feature_flags ORDER BY category;"

# Toggle a flag
psql -h localhost -U swipesavvy_backend -d swipesavvy_db -c \
  "UPDATE feature_flags SET enabled = true WHERE key = 'community_feed';"

# Check analytics
psql -h localhost -U swipesavvy_backend -d swipesavvy_db -c \
  "SELECT COUNT(*) FROM feature_flag_usage WHERE accessed_at > NOW() - INTERVAL '1 day';"
```

### Test API Endpoints

```bash
# Get all feature flags
curl -X GET http://localhost:8000/api/features/all \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check specific flag
curl -X GET http://localhost:8000/api/features/check/tier_progress_bar \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get analytics
curl -X GET http://localhost:8000/api/analytics/campaign/1/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Toggle feature flag (admin only)
curl -X POST http://localhost:8000/api/features/tier_progress_bar/toggle \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

---

## 🐛 TROUBLESHOOTING

### Connection Issues

**Problem: "Cannot connect to database"**

```bash
# Solution 1: Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Solution 2: Check credentials
psql -h localhost -U postgres -c "\du"

# Solution 3: Check firewall (if remote)
nc -zv database.example.com 5432

# Solution 4: Check logs
tail -f /var/log/postgresql/postgresql.log
```

**Problem: "Database does not exist"**

```bash
# Solution: Create database manually
psql -h localhost -U postgres -c \
  "CREATE DATABASE swipesavvy_db WITH ENCODING UTF8;"

# Then run init script
./init_database.sh
```

### Performance Issues

**Problem: "Slow queries"**

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Analyze table
ANALYZE feature_flags;
REINDEX TABLE feature_flags;
```

**Problem: "Connection pool exhausted"**

```bash
# Solution: Increase pool size in .env
DB_POOL_SIZE=50

# Check current connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND query_start < NOW() - INTERVAL '30 minutes';
```

### Data Issues

**Problem: "Missing seed data"**

```sql
-- Reseed feature flags
DELETE FROM feature_flags WHERE created_by = 'system';
-- Then run init script again, or:
INSERT INTO feature_flags VALUES ... (from schema file)
```

---

## 🔧 MAINTENANCE

### Regular Backups

```bash
# Daily backup to file
pg_dump -h localhost -U swipesavvy_backend swipesavvy_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Automate with cron
0 2 * * * /path/to/backup.sh
```

### Monitor Database Health

```bash
# Check database size
psql -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname))
FROM pg_database ORDER BY pg_database_size(pg_database.datname) DESC;"

# Check table sizes
psql -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Check index usage
psql -c "SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"
```

### Optimization

```sql
-- Regular maintenance
VACUUM ANALYZE feature_flags;
REINDEX TABLE feature_flags;

-- Update statistics
ANALYZE;

-- Clear old audit logs (keep 90 days)
DELETE FROM feature_flag_audit_log 
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 📞 SUPPORT

**Quick Reference:**

| Component | Location | File |
|-----------|----------|------|
| Schema | `database/` | `swipesavvy_complete_schema.sql` |
| Setup Script | `database/` | `init_database.sh` |
| Config | `database/` | `database-config.ts` |
| This Guide | `database/` | `DATABASE_SETUP_GUIDE.md` |

**Connection Test Command:**

```bash
psql -h localhost -U swipesavvy_backend -d swipesavvy_db -c "SELECT 'Connected!' as status;"
```

**For Issues:**

1. Check PostgreSQL logs: `/var/log/postgresql/postgresql.log`
2. Verify credentials: `\du` in psql
3. Test connectivity: `pg_isready -h $DB_HOST -p $DB_PORT`
4. Review environment variables: `printenv | grep DB_`

---

**Generated:** December 26, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0

All applications can now connect to and use the SwipeSavvy database!
