# SwipeSavvy Database Synchronization Guide

Comprehensive guide for synchronizing local and AWS databases, with AWS RDS as the source of truth.

## Overview

```
┌─────────────────┐                    ┌─────────────────┐
│  AWS RDS        │  ◄── Source of ──► │  Local PostgreSQL│
│  (Production)   │      Truth         │  (Development)   │
└─────────────────┘                    └─────────────────┘
         │                                      │
         │                                      │
    ┌────▼────┐                           ┌────▼────┐
    │ Prod    │                           │ Dev     │
    │ Data    │                           │ Data    │
    └─────────┘                           └─────────┘
```

**Important**: AWS RDS is ALWAYS the source of truth. Local databases should be synced FROM AWS, never the reverse (unless explicitly deploying schema changes).

---

## Prerequisites

### AWS Credentials
```bash
# Configure AWS CLI
aws configure

# Verify access
aws rds describe-db-instances --db-instance-identifier swipesavvy-postgres-prod
```

### RDS Connection Details
```bash
# Get from AWS Console or CLI
RDS_HOST="swipesavvy-postgres-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com"
RDS_PORT="5432"
RDS_DB="swipesavvy_db"
RDS_USER="swipesavvy_admin"
RDS_PASSWORD="your_rds_password"
```

### Local Database
```bash
LOCAL_HOST="127.0.0.1"
LOCAL_PORT="5432"
LOCAL_DB="swipesavvy_agents"
LOCAL_USER="postgres"
LOCAL_PASSWORD="your_local_password"
```

---

## Method 1: Full Database Sync (Recommended)

### Step 1: Create SSH Tunnel to RDS

Since RDS is not publicly accessible, connect through the EC2 instance:

```bash
# Create SSH tunnel
ssh -i ~/.ssh/swipesavvy-prod-key.pem \
  -L 5433:swipesavvy-postgres-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432 \
  -N ec2-user@[EC2_PUBLIC_IP] &

echo "Tunnel created on localhost:5433"
```

### Step 2: Export from AWS RDS

```bash
# Export full database
PGPASSWORD=$RDS_PASSWORD pg_dump \
  -h localhost \
  -p 5433 \
  -U $RDS_USER \
  -d $RDS_DB \
  --no-owner \
  --no-privileges \
  -F c \
  -f aws_backup_$(date +%Y%m%d_%H%M%S).dump

echo "Backup created: aws_backup_*.dump"
```

### Step 3: Import to Local Database

```bash
# Drop and recreate local database
dropdb $LOCAL_DB 2>/dev/null || true
createdb $LOCAL_DB

# Restore from backup
PGPASSWORD=$LOCAL_PASSWORD pg_restore \
  -h $LOCAL_HOST \
  -p $LOCAL_PORT \
  -U $LOCAL_USER \
  -d $LOCAL_DB \
  --no-owner \
  --no-privileges \
  -v \
  aws_backup_*.dump

echo "Local database synced with AWS!"
```

### Complete Sync Script

Save as `sync-from-aws.sh`:

```bash
#!/bin/bash
set -e

# Configuration
EC2_IP="your_ec2_ip"
RDS_HOST="swipesavvy-postgres-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com"
RDS_USER="swipesavvy_admin"
RDS_DB="swipesavvy_db"
LOCAL_DB="swipesavvy_agents"
LOCAL_USER="postgres"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting database sync from AWS...${NC}"

# Prompt for passwords
read -sp "Enter AWS RDS password: " RDS_PASSWORD
echo
read -sp "Enter local PostgreSQL password: " LOCAL_PASSWORD
echo

# Create SSH tunnel
echo -e "${YELLOW}Creating SSH tunnel to RDS...${NC}"
ssh -i ~/.ssh/swipesavvy-prod-key.pem \
  -L 5433:$RDS_HOST:5432 \
  -N ec2-user@$EC2_IP &
TUNNEL_PID=$!
sleep 3

# Verify tunnel
if ! nc -z localhost 5433; then
  echo "Failed to create SSH tunnel"
  exit 1
fi

# Create backup filename
BACKUP_FILE="aws_backup_$(date +%Y%m%d_%H%M%S).dump"

# Export from AWS
echo -e "${YELLOW}Exporting from AWS RDS...${NC}"
PGPASSWORD=$RDS_PASSWORD pg_dump \
  -h localhost \
  -p 5433 \
  -U $RDS_USER \
  -d $RDS_DB \
  --no-owner \
  --no-privileges \
  -F c \
  -f $BACKUP_FILE

# Get backup size
BACKUP_SIZE=$(ls -lh $BACKUP_FILE | awk '{print $5}')
echo -e "${GREEN}Backup created: $BACKUP_FILE ($BACKUP_SIZE)${NC}"

# Drop and recreate local database
echo -e "${YELLOW}Recreating local database...${NC}"
PGPASSWORD=$LOCAL_PASSWORD dropdb -h localhost -U $LOCAL_USER $LOCAL_DB 2>/dev/null || true
PGPASSWORD=$LOCAL_PASSWORD createdb -h localhost -U $LOCAL_USER $LOCAL_DB

# Restore to local
echo -e "${YELLOW}Restoring to local database...${NC}"
PGPASSWORD=$LOCAL_PASSWORD pg_restore \
  -h localhost \
  -p 5432 \
  -U $LOCAL_USER \
  -d $LOCAL_DB \
  --no-owner \
  --no-privileges \
  $BACKUP_FILE

# Cleanup
kill $TUNNEL_PID 2>/dev/null || true

echo -e "${GREEN}✅ Database sync complete!${NC}"
echo -e "Backup file: $BACKUP_FILE"

# Verify
echo -e "${YELLOW}Verifying sync...${NC}"
PGPASSWORD=$LOCAL_PASSWORD psql -h localhost -U $LOCAL_USER -d $LOCAL_DB -c "\dt" | head -20
```

---

## Method 2: Schema-Only Sync

For syncing schema changes without data:

```bash
# Export schema only from AWS
PGPASSWORD=$RDS_PASSWORD pg_dump \
  -h localhost \
  -p 5433 \
  -U $RDS_USER \
  -d $RDS_DB \
  --schema-only \
  --no-owner \
  -f schema_$(date +%Y%m%d).sql

# Apply schema to local (preserves data)
PGPASSWORD=$LOCAL_PASSWORD psql \
  -h localhost \
  -U $LOCAL_USER \
  -d $LOCAL_DB \
  -f schema_$(date +%Y%m%d).sql
```

---

## Method 3: Selective Table Sync

Sync specific tables only:

```bash
# Export specific tables
PGPASSWORD=$RDS_PASSWORD pg_dump \
  -h localhost \
  -p 5433 \
  -U $RDS_USER \
  -d $RDS_DB \
  --table=users \
  --table=campaigns \
  --table=transactions \
  --no-owner \
  -F c \
  -f selective_backup.dump

# Restore specific tables (WARNING: drops existing data)
PGPASSWORD=$LOCAL_PASSWORD pg_restore \
  -h localhost \
  -U $LOCAL_USER \
  -d $LOCAL_DB \
  --clean \
  --if-exists \
  selective_backup.dump
```

---

## Method 4: Data-Only Sync (Preserve Local Schema)

When local schema differs but you need AWS data:

```bash
# Export data only
PGPASSWORD=$RDS_PASSWORD pg_dump \
  -h localhost \
  -p 5433 \
  -U $RDS_USER \
  -d $RDS_DB \
  --data-only \
  --disable-triggers \
  -f data_$(date +%Y%m%d).sql

# Clear local data and import
PGPASSWORD=$LOCAL_PASSWORD psql -h localhost -U $LOCAL_USER -d $LOCAL_DB << 'EOF'
-- Disable foreign key checks
SET session_replication_role = 'replica';

-- Truncate all tables (add tables as needed)
TRUNCATE users CASCADE;
TRUNCATE campaigns CASCADE;
TRUNCATE transactions CASCADE;

-- Re-enable
SET session_replication_role = 'origin';
EOF

# Import data
PGPASSWORD=$LOCAL_PASSWORD psql \
  -h localhost \
  -U $LOCAL_USER \
  -d $LOCAL_DB \
  -f data_$(date +%Y%m%d).sql
```

---

## Pushing Schema Changes to AWS

**CAUTION**: Only push schema changes, never overwrite production data.

### Step 1: Generate Migration

```bash
# Using Alembic (in swipesavvy-ai-agents)
cd swipesavvy-ai-agents
alembic revision --autogenerate -m "description_of_changes"
```

### Step 2: Review Migration

```bash
# Review generated migration
cat alembic/versions/[new_migration].py
```

### Step 3: Apply to AWS (via SSH tunnel)

```bash
# Create tunnel
ssh -i ~/.ssh/swipesavvy-prod-key.pem \
  -L 5433:$RDS_HOST:5432 \
  -N ec2-user@$EC2_IP &

# Set connection to use tunnel
export DATABASE_URL="postgresql://$RDS_USER:$RDS_PASSWORD@localhost:5433/$RDS_DB"

# Run migration
alembic upgrade head
```

---

## Verify Sync Status

### Compare Row Counts

```bash
#!/bin/bash
# compare-databases.sh

echo "=== Database Comparison ==="

# Tables to compare
TABLES="users campaigns transactions merchants rewards"

for table in $TABLES; do
  AWS_COUNT=$(PGPASSWORD=$RDS_PASSWORD psql -h localhost -p 5433 -U $RDS_USER -d $RDS_DB -t -c "SELECT COUNT(*) FROM $table")
  LOCAL_COUNT=$(PGPASSWORD=$LOCAL_PASSWORD psql -h localhost -U $LOCAL_USER -d $LOCAL_DB -t -c "SELECT COUNT(*) FROM $table")

  echo "$table: AWS=$AWS_COUNT | Local=$LOCAL_COUNT"
done
```

### Compare Schema

```bash
# Export both schemas
PGPASSWORD=$RDS_PASSWORD pg_dump -h localhost -p 5433 -U $RDS_USER -d $RDS_DB --schema-only > aws_schema.sql
PGPASSWORD=$LOCAL_PASSWORD pg_dump -h localhost -U $LOCAL_USER -d $LOCAL_DB --schema-only > local_schema.sql

# Compare
diff aws_schema.sql local_schema.sql
```

---

## Scheduled Sync (Cron)

For regular syncs during development:

```bash
# Edit crontab
crontab -e

# Add daily sync at 6 AM
0 6 * * * /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/sync-from-aws.sh >> /tmp/db-sync.log 2>&1
```

---

## Troubleshooting

### SSH Tunnel Issues

```bash
# Check if tunnel is active
lsof -i :5433

# Kill existing tunnels
pkill -f "ssh.*5433"

# Test RDS connection through tunnel
PGPASSWORD=$RDS_PASSWORD psql -h localhost -p 5433 -U $RDS_USER -d $RDS_DB -c "SELECT 1"
```

### Permission Errors

```bash
# Verify RDS security group allows EC2
# Check VPC peering if applicable
aws rds describe-db-instances --db-instance-identifier swipesavvy-postgres-prod \
  --query 'DBInstances[0].VpcSecurityGroups'
```

### Large Database Timeouts

```bash
# For large databases, use parallel jobs
pg_dump ... -j 4 -F d -f backup_dir/
pg_restore ... -j 4 backup_dir/
```

### Sequence Reset Issues

```bash
# After restore, reset sequences to max values
PGPASSWORD=$LOCAL_PASSWORD psql -h localhost -U $LOCAL_USER -d $LOCAL_DB << 'EOF'
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('campaigns', 'id'), COALESCE(MAX(id), 1)) FROM campaigns;
-- Add more tables as needed
EOF
```

---

## Best Practices

1. **Always backup before sync** - Keep at least 3 recent backups
2. **Never push data to production** - Only schema migrations
3. **Test migrations locally first** - Apply to local, verify, then push to AWS
4. **Use timestamps in backup names** - Easy identification and cleanup
5. **Document schema changes** - Keep migration history in version control
6. **Sanitize sensitive data** - For development copies, mask PII

---

## Related Documentation

- [QUICK_START_LOCAL.md](./QUICK_START_LOCAL.md) - Local development setup
- [QUICK_START_AWS.md](./QUICK_START_AWS.md) - AWS deployment guide
- [swipesavvy-ai-agents/MIGRATIONS_GUIDE.md](./swipesavvy-ai-agents/MIGRATIONS_GUIDE.md) - Alembic migrations
