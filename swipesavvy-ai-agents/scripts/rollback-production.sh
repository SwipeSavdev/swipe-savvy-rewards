#!/bin/bash
# Production Rollback Script for SwipeSavvy AI Agents
# Usage: sudo ./scripts/rollback-production.sh [commit_hash]

set -e

echo "========================================="
echo "SwipeSavvy AI Agents - Production Rollback"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEPLOY_DIR="/opt/swipesavvy-ai-agents"
BACKUP_DIR="/var/backups/swipesavvy-ai-agents"
COMPOSE_FILE="docker-compose.prod.yml"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root or with sudo"
    exit 1
fi

cd "$DEPLOY_DIR"

# Determine rollback target
if [ -z "$1" ]; then
    # No commit specified, rollback to previous commit
    ROLLBACK_COMMIT=$(git rev-parse HEAD~1)
    log_info "No commit specified, rolling back to previous commit"
else
    ROLLBACK_COMMIT=$1
    log_info "Rolling back to specified commit: $ROLLBACK_COMMIT"
fi

log_warn "Current commit: $(git rev-parse HEAD)"
log_warn "Target commit: $ROLLBACK_COMMIT"
echo ""

# Confirm rollback
read -p "Are you sure you want to rollback? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_info "Rollback cancelled"
    exit 0
fi

echo ""
log_info "Starting rollback at $(date)"

# Backup current database
log_info "Backing up current database..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_before_rollback_$TIMESTAMP.sql"
mkdir -p "$BACKUP_DIR"

source .env.production 2>/dev/null || true
if [ -n "$POSTGRES_USER" ]; then
    docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE" 2>/dev/null && gzip "$BACKUP_FILE"
    log_info "Database backed up ✓"
fi

# Stop services
log_info "Stopping services..."
docker-compose -f "$COMPOSE_FILE" stop
log_info "Services stopped ✓"

# Checkout target commit
log_info "Checking out commit $ROLLBACK_COMMIT..."
git checkout "$ROLLBACK_COMMIT"
log_info "Code rolled back ✓"

# Rebuild and start
log_info "Rebuilding and starting services..."
docker-compose -f "$COMPOSE_FILE" build --no-cache
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for health
log_info "Waiting for services..."
sleep 15

# Verify
if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    log_info "Rollback completed successfully! ✓"
else
    log_error "Rollback completed but services may need attention"
fi

echo ""
log_info "Rolled back to $ROLLBACK_COMMIT"
docker-compose -f "$COMPOSE_FILE" ps
