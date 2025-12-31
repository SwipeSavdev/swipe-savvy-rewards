#!/bin/bash
# Production Deployment Script for SwipeSavvy AI Agents
# Usage: ./scripts/deploy-production.sh

set -e  # Exit on error

echo "========================================="
echo "SwipeSavvy AI Agents - Production Deploy"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/opt/swipesavvy-ai-agents"
BACKUP_DIR="/var/backups/swipesavvy-ai-agents"
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.prod.yml"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root or with sudo"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if .env.production exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "$ENV_FILE not found. Copy from .env.production.template and configure."
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

backup_database() {
    log_info "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
    
    # Load environment variables
    source "$ENV_FILE"
    
    # Backup database
    docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        log_info "Database backed up to $BACKUP_FILE ✓"
        
        # Compress backup
        gzip "$BACKUP_FILE"
        log_info "Backup compressed ✓"
        
        # Keep only last 7 days of backups
        find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete
        log_info "Old backups cleaned up ✓"
    else
        log_warn "Database backup failed (might be first deployment)"
    fi
}

pull_latest_code() {
    log_info "Pulling latest code..."
    
    cd "$DEPLOY_DIR"
    
    # Fetch latest changes
    git fetch origin
    
    # Show what will be deployed
    CURRENT_COMMIT=$(git rev-parse HEAD)
    LATEST_COMMIT=$(git rev-parse origin/Together-AI-Build)
    
    if [ "$CURRENT_COMMIT" = "$LATEST_COMMIT" ]; then
        log_info "Already on latest commit"
    else
        log_info "Current: $CURRENT_COMMIT"
        log_info "Latest:  $LATEST_COMMIT"
        
        # Show changes
        git log --oneline "$CURRENT_COMMIT..$LATEST_COMMIT"
        
        # Pull changes
        git pull origin Together-AI-Build
        log_info "Code updated ✓"
    fi
}

run_database_migrations() {
    log_info "Running database migrations..."
    
    # Check if migration script exists
    if [ -f "scripts/migrate.py" ]; then
        docker-compose -f "$COMPOSE_FILE" run --rm concierge python scripts/migrate.py
        log_info "Migrations complete ✓"
    else
        log_warn "No migration script found, skipping"
    fi
}

build_and_deploy() {
    log_info "Building and deploying services..."
    
    # Build images
    log_info "Building Docker images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Pull base images
    log_info "Pulling base images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Start services with zero-downtime deployment
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans
    
    log_info "Services deployed ✓"
}

wait_for_health() {
    log_info "Waiting for services to become healthy..."
    
    MAX_ATTEMPTS=30
    ATTEMPT=0
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if docker-compose -f "$COMPOSE_FILE" ps | grep -q "unhealthy"; then
            log_warn "Some services still unhealthy, waiting... ($((ATTEMPT+1))/$MAX_ATTEMPTS)"
            sleep 5
            ATTEMPT=$((ATTEMPT+1))
        else
            log_info "All services healthy ✓"
            return 0
        fi
    done
    
    log_error "Services failed to become healthy after $MAX_ATTEMPTS attempts"
    docker-compose -f "$COMPOSE_FILE" ps
    return 1
}

run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Test concierge health
    if curl -sf http://localhost:8000/health > /dev/null; then
        log_info "Concierge health check passed ✓"
    else
        log_error "Concierge health check failed"
        return 1
    fi
    
    # Test RAG health
    if curl -sf http://localhost:8001/health > /dev/null; then
        log_info "RAG health check passed ✓"
    else
        log_error "RAG health check failed"
        return 1
    fi
    
    # Test Guardrails health
    if curl -sf http://localhost:8002/health > /dev/null; then
        log_info "Guardrails health check passed ✓"
    else
        log_error "Guardrails health check failed"
        return 1
    fi
    
    log_info "All smoke tests passed ✓"
    return 0
}

show_service_status() {
    log_info "Service status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    log_info ""
    log_info "Resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
}

# Main deployment flow
main() {
    echo ""
    log_info "Starting deployment at $(date)"
    echo ""
    
    # Pre-deployment
    check_prerequisites
    backup_database
    pull_latest_code
    
    # Deployment
    run_database_migrations
    build_and_deploy
    
    # Post-deployment validation
    if wait_for_health; then
        if run_smoke_tests; then
            show_service_status
            
            echo ""
            log_info "========================================="
            log_info "Deployment completed successfully! ✓"
            log_info "========================================="
            echo ""
            log_info "Next steps:"
            log_info "1. Monitor Grafana dashboards at https://monitoring.swipesavvy.com"
            log_info "2. Check logs: docker-compose -f $COMPOSE_FILE logs -f"
            log_info "3. Verify metrics: curl http://localhost:8000/metrics"
            echo ""
        else
            log_error "Smoke tests failed!"
            log_warn "Consider rolling back with: ./scripts/rollback-production.sh"
            exit 1
        fi
    else
        log_error "Services failed health checks!"
        log_warn "Consider rolling back with: ./scripts/rollback-production.sh"
        exit 1
    fi
}

# Run main function
main
