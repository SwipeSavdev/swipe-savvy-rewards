#!/bin/bash

# ============================================================================
# SWIPESAVVY DATABASE INITIALIZATION SCRIPT
# Setup PostgreSQL database with all tables, indexes, and seed data
# Usage: ./init_database.sh [environment]
# ============================================================================

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-swipesavvy_db}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
ENVIRONMENT="${1:-development}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

log_info "Starting SwipeSavvy database initialization..."
log_info "Environment: $ENVIRONMENT"
log_info "Database: $DB_HOST:$DB_PORT/$DB_NAME"

# Check if psql is available
if ! command -v psql &> /dev/null; then
  log_error "psql command not found. Please install PostgreSQL client tools."
  exit 1
fi

log_success "PostgreSQL client tools found"

# Check if schema file exists
if [ ! -f "$SCRIPT_DIR/swipesavvy_complete_schema.sql" ]; then
  log_error "Schema file not found: $SCRIPT_DIR/swipesavvy_complete_schema.sql"
  exit 1
fi

log_success "Schema file found"

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

log_info "Attempting to connect to PostgreSQL server..."

# Test connection
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" &> /dev/null; then
  log_success "Connection successful"
else
  log_error "Cannot connect to PostgreSQL. Check host, port, and credentials."
  exit 1
fi

# ============================================================================
# CREATE DATABASE
# ============================================================================

log_info "Creating database '$DB_NAME'..."

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres << EOF
SELECT 'CREATE DATABASE $DB_NAME WITH ENCODING UTF8 LC_COLLATE "en_US.UTF-8" LC_CTYPE "en_US.UTF-8"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME') \gexec
EOF

log_success "Database ready"

# ============================================================================
# RUN SCHEMA FILE
# ============================================================================

log_info "Running schema file..."

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -f "$SCRIPT_DIR/swipesavvy_complete_schema.sql" \
  -v ON_ERROR_STOP=1

if [ $? -eq 0 ]; then
  log_success "Schema created successfully"
else
  log_error "Failed to create schema"
  exit 1
fi

# ============================================================================
# VERIFY TABLES WERE CREATED
# ============================================================================

log_info "Verifying table creation..."

TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
  SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'
")

if [ "$TABLE_COUNT" -gt 0 ]; then
  log_success "Database contains $TABLE_COUNT tables"
else
  log_error "No tables found in database"
  exit 1
fi

# ============================================================================
# VERIFY KEY TABLES
# ============================================================================

log_info "Verifying key tables exist..."

TABLES=(
  "feature_flags"
  "feature_flag_usage"
  "feature_flag_analytics"
  "campaign_analytics_daily"
  "ab_tests"
  "ab_test_assignments"
  "ab_test_results"
  "ml_models"
  "user_merchant_affinity"
  "user_optimal_send_times"
  "campaign_optimizations"
)

for table in "${TABLES[@]}"; do
  TABLE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$table' AND table_schema = 'public'
  ")
  
  if [ "$TABLE_EXISTS" -eq 1 ]; then
    echo -e "${GREEN}✓${NC} $table"
  else
    echo -e "${RED}✗${NC} $table"
    log_error "Table $table not found"
    exit 1
  fi
done

# ============================================================================
# VERIFY INDEXES
# ============================================================================

log_info "Verifying indexes..."

INDEX_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
  SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname NOT LIKE 'pg_toast%'
")

log_success "Found $INDEX_COUNT indexes"

# ============================================================================
# VERIFY VIEWS
# ============================================================================

log_info "Verifying views..."

VIEW_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
  SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public'
")

log_success "Found $VIEW_COUNT views"

# ============================================================================
# VERIFY FUNCTIONS AND TRIGGERS
# ============================================================================

log_info "Verifying functions and triggers..."

FUNCTION_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
  SELECT COUNT(*) FROM pg_proc WHERE pronamespace = 'public'::regnamespace
")

TRIGGER_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
  SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public'
")

log_success "Found $FUNCTION_COUNT functions and $TRIGGER_COUNT triggers"

# ============================================================================
# VERIFY SEED DATA
# ============================================================================

log_info "Verifying seed data..."

FF_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
  SELECT COUNT(*) FROM feature_flags
")

log_success "Found $FF_COUNT feature flags seeded"

# ============================================================================
# CREATE ENVIRONMENT-SPECIFIC CONFIGURATION
# ============================================================================

log_info "Creating environment-specific configuration..."

case "$ENVIRONMENT" in
  development)
    log_info "Development configuration"
    ;;
  staging)
    log_info "Staging configuration"
    ;;
  production)
    log_warning "Production configuration - Consider using secure password management"
    ;;
  *)
    log_warning "Unknown environment: $ENVIRONMENT"
    ;;
esac

# ============================================================================
# GENERATE CONNECTION DETAILS
# ============================================================================

log_info "Generating connection details..."

cat > "$SCRIPT_DIR/.env.database.local" << EOF
# Database Connection Details
# Generated: $(date)
# Environment: $ENVIRONMENT

DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=swipesavvy_backend
DB_PASSWORD=secure_password_123
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_MAX_LIFETIME=1800000

# Read-only connection for analytics
DB_READ_HOST=$DB_HOST
DB_READ_PORT=$DB_PORT
DB_READ_NAME=$DB_NAME
DB_READ_USER=swipesavvy_analytics
DB_READ_PASSWORD=analytics_password_456

# Connection string
DATABASE_URL=postgresql://swipesavvy_backend:secure_password_123@$DB_HOST:$DB_PORT/$DB_NAME

# Connection pool settings
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=30
DATABASE_MAX_LIFETIME=1800
EOF

log_success "Created .env.database.local"

# ============================================================================
# DISPLAY SUMMARY
# ============================================================================

log_success "Database initialization COMPLETE!"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              DATABASE SETUP SUMMARY                        ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ Database:              $DB_NAME"
echo "║ Host:                  $DB_HOST:$DB_PORT"
echo "║ Tables:                $TABLE_COUNT"
echo "║ Indexes:               $INDEX_COUNT"
echo "║ Views:                 $VIEW_COUNT"
echo "║ Functions/Triggers:    $FUNCTION_COUNT / $TRIGGER_COUNT"
echo "║ Feature Flags Seeded:  $FF_COUNT"
echo "║ Environment:           $ENVIRONMENT"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ Users Created:                                             ║"
echo "║   - swipesavvy_backend (read/write)                       ║"
echo "║   - swipesavvy_analytics (read-only)                      ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ Connection String:                                         ║"
echo "║ postgresql://swipesavvy_backend@$DB_HOST:$DB_PORT/$DB_NAME"
echo "║                                                            ║"
echo "║ Configuration saved to: .env.database.local                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

log_info "Next steps:"
echo "  1. Update your application configuration with connection details"
echo "  2. Configure backend to use DATABASE_URL environment variable"
echo "  3. Test mobile app connection: see DATABASE_SETUP_GUIDE.md"
echo "  4. Test admin portal connection: see DATABASE_SETUP_GUIDE.md"
echo "  5. Monitor database with: psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
echo ""

log_success "All done! Your SwipeSavvy database is ready for use."
