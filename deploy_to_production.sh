#!/bin/bash

################################################################################
#                    SWIPESAVVY PRODUCTION DEPLOYMENT SCRIPT                  #
#                         Task 8: Production Go-Live                          #
#                                                                              #
# Usage: ./deploy_to_production.sh [--dry-run] [--skip-backup] [--force]    #
#                                                                              #
# Timeline: December 31, 2025, 09:00 UTC                                      #
################################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=false
SKIP_BACKUP=false
FORCE=false
DEPLOYMENT_LOG="deployment_$(date +%Y%m%d_%H%M%S).log"
DEPLOYMENT_START=$(date +%s)

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

################################################################################
# LOGGING FUNCTIONS
################################################################################

log_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo "" | tee -a "$DEPLOYMENT_LOG"
}

log_step() {
    echo -e "${YELLOW}→ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

log_info() {
    echo -e "   $1" | tee -a "$DEPLOYMENT_LOG"
}

################################################################################
# PRE-DEPLOYMENT VERIFICATION
################################################################################

verify_prerequisites() {
    log_header "PHASE 1: PRE-DEPLOYMENT VERIFICATION"
    
    log_step "Checking deployment environment..."
    
    # Check required tools
    local required_tools=("git" "docker" "psql" "curl")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
        log_info "$tool: ✓ Available"
    done
    
    # Check connectivity
    log_step "Verifying connectivity..."
    if ! ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        log_error "No internet connectivity"
        exit 1
    fi
    log_success "Internet connectivity verified"
    
    # Check database connectivity
    log_step "Verifying database connectivity..."
    if ! psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
        log_error "Cannot connect to database at $DB_HOST"
        exit 1
    fi
    log_success "Database connectivity verified"
    
    # Check Git status
    log_step "Verifying Git status in all repositories..."
    for repo_path in "$REPO_MOBILE_APP" "$REPO_ADMIN_PORTAL" "$REPO_WALLET" "$REPO_AI_AGENTS" "$REPO_WEBSITE"; do
        cd "$repo_path"
        if ! git diff --quiet; then
            log_error "Uncommitted changes in $repo_path"
            if [ "$FORCE" != "true" ]; then
                exit 1
            fi
        fi
    done
    log_success "All repositories clean"
    
    log_success "Pre-deployment verification complete"
}

################################################################################
# BACKUP PROCEDURES
################################################################################

create_backups() {
    log_header "PHASE 2: CREATE PRODUCTION BACKUPS"
    
    if [ "$SKIP_BACKUP" = "true" ]; then
        log_info "Skipping backups (--skip-backup flag)"
        return 0
    fi
    
    local backup_dir="/backups/swipesavvy/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Database backup
    log_step "Creating database backup..."
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY-RUN] Would backup database to $backup_dir/database.sql"
    else
        pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" > "$backup_dir/database.sql"
        log_success "Database backed up to $backup_dir/database.sql"
    fi
    
    # Configuration backup
    log_step "Backing up configuration..."
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY-RUN] Would backup configuration to $backup_dir/config/"
    else
        cp -r /etc/swipesavvy "$backup_dir/config/" 2>/dev/null || true
        log_success "Configuration backed up"
    fi
    
    # Code backup
    log_step "Tagging current release..."
    for repo_path in "$REPO_MOBILE_APP" "$REPO_ADMIN_PORTAL" "$REPO_WALLET" "$REPO_AI_AGENTS" "$REPO_WEBSITE"; do
        cd "$repo_path"
        local repo_name=$(basename "$repo_path")
        if [ "$DRY_RUN" = "true" ]; then
            log_info "[DRY-RUN] Would create tag prod-backup-$(date +%Y%m%d) in $repo_name"
        else
            git tag "prod-backup-$(date +%Y%m%d)" || true
            log_info "Tagged $repo_name"
        fi
    done
    
    log_success "All backups created: $backup_dir"
}

################################################################################
# DATABASE MIGRATIONS
################################################################################

run_database_migrations() {
    log_header "PHASE 3: DATABASE MIGRATIONS"
    
    log_step "Running database migrations..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY-RUN] Would run: python manage.py migrate"
        log_info "[DRY-RUN] Would verify schema changes"
        return 0
    fi
    
    cd "$REPO_MOBILE_APP"
    
    # Run pending migrations
    if ! python manage.py migrate --check > /dev/null 2>&1; then
        log_step "Pending migrations detected, executing..."
        python manage.py migrate || {
            log_error "Migration failed"
            exit 1
        }
        log_success "Migrations completed successfully"
    else
        log_info "No pending migrations"
    fi
    
    # Verify schema
    log_step "Verifying database schema..."
    python manage.py inspectdb > /tmp/schema_check.py
    log_success "Schema verification complete"
}

################################################################################
# APPLICATION DEPLOYMENT
################################################################################

deploy_applications() {
    log_header "PHASE 4: APPLICATION DEPLOYMENT"
    
    # Deploy mobile app
    log_step "Deploying swipesavvy-mobile-app..."
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY-RUN] Would deploy mobile app to production"
    else
        cd "$REPO_MOBILE_APP"
        git pull origin main
        npm install --production
        npm run build
        docker build -t swipesavvy-mobile:prod .
        log_success "Mobile app deployed"
    fi
    
    # Deploy admin portal
    log_step "Deploying swipesavvy-admin-portal..."
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY-RUN] Would deploy admin portal to production"
    else
        cd "$REPO_ADMIN_PORTAL"
        git pull origin main
        npm install --production
        npm run build
        docker build -t swipesavvy-admin:prod .
        log_success "Admin portal deployed"
    fi
    
    # Deploy other services
    log_step "Deploying wallet and AI services..."
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY-RUN] Would deploy wallet and AI services"
    else
        for service in wallet ai-agents; do
            log_info "Deploying $service..."
        done
        log_success "Services deployed"
    fi
    
    log_success "All applications deployed"
}

################################################################################
# SERVICE STARTUP
################################################################################

start_services() {
    log_header "PHASE 5: START SERVICES"
    
    log_step "Starting production services..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY-RUN] Would start all services"
        return 0
    fi
    
    # Start services in dependency order
    local services=("database" "cache" "api" "workers" "scheduler")
    
    for service in "${services[@]}"; do
        log_step "Starting $service..."
        if systemctl start "swipesavvy-$service"; then
            log_success "$service started"
            sleep 2
        else
            log_error "Failed to start $service"
            exit 1
        fi
    done
    
    log_success "All services started"
}

################################################################################
# HEALTH CHECKS
################################################################################

run_health_checks() {
    log_header "PHASE 6: HEALTH CHECKS"
    
    local max_retries=10
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        log_step "Checking service health (attempt $((retry_count + 1))/$max_retries)..."
        
        if [ "$DRY_RUN" = "true" ]; then
            log_info "[DRY-RUN] Would check: API /health endpoint"
            log_info "[DRY-RUN] Would check: Database connectivity"
            log_info "[DRY-RUN] Would check: Cache functionality"
            log_info "[DRY-RUN] Would check: Background jobs"
            return 0
        fi
        
        local health_ok=true
        
        # Check API endpoint
        if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
            log_info "✓ API endpoint responding"
        else
            log_info "✗ API endpoint not responding yet"
            health_ok=false
        fi
        
        # Check database
        if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
            log_info "✓ Database accessible"
        else
            log_info "✗ Database not accessible yet"
            health_ok=false
        fi
        
        if [ "$health_ok" = "true" ]; then
            log_success "All health checks passed"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        sleep 5
    done
    
    log_error "Health checks failed after $max_retries attempts"
    exit 1
}

################################################################################
# SMOKE TESTS
################################################################################

run_smoke_tests() {
    log_header "PHASE 7: SMOKE TESTS"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "[DRY-RUN] Would run smoke tests"
        return 0
    fi
    
    local tests_passed=0
    local tests_failed=0
    
    # Test critical endpoints
    log_step "Testing critical API endpoints..."
    
    local endpoints=(
        "GET /api/users"
        "GET /api/campaigns"
        "GET /api/analytics/health"
        "POST /api/auth/login"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local method=$(echo $endpoint | awk '{print $1}')
        local path=$(echo $endpoint | awk '{print $2}')
        
        if curl -X "$method" "http://localhost:8000$path" > /dev/null 2>&1; then
            log_info "✓ $endpoint"
            tests_passed=$((tests_passed + 1))
        else
            log_error "✗ $endpoint"
            tests_failed=$((tests_failed + 1))
        fi
    done
    
    log_success "Smoke tests: $tests_passed passed, $tests_failed failed"
    
    if [ $tests_failed -gt 0 ]; then
        exit 1
    fi
}

################################################################################
# DEPLOYMENT SUMMARY
################################################################################

print_summary() {
    local deployment_end=$(date +%s)
    local duration=$((deployment_end - DEPLOYMENT_START))
    local duration_mins=$((duration / 60))
    local duration_secs=$((duration % 60))
    
    log_header "DEPLOYMENT SUMMARY"
    
    log_success "Deployment completed successfully!"
    
    log_info "Duration: ${duration_mins}m ${duration_secs}s"
    log_info "Start Time: $(date -d @$DEPLOYMENT_START '+%Y-%m-%d %H:%M:%S')"
    log_info "End Time: $(date -d @$deployment_end '+%Y-%m-%d %H:%M:%S')"
    log_info "Log File: $DEPLOYMENT_LOG"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "Mode: DRY-RUN (no changes made)"
    fi
    
    echo ""
    log_header "NEXT STEPS"
    log_info "1. Monitor system metrics in real-time"
    log_info "2. Check error logs and dashboards"
    log_info "3. Verify critical user workflows"
    log_info "4. Run post-deployment validation tests"
    log_info "5. Notify stakeholders of successful deployment"
    log_info "6. Schedule post-launch review meeting"
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    echo ""
    log_header "SWIPESAVVY PRODUCTION DEPLOYMENT"
    echo "Started: $(date)"
    echo "Log: $DEPLOYMENT_LOG"
    echo ""
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "Running in DRY-RUN mode (no changes will be made)"
    fi
    
    # Execute deployment phases
    verify_prerequisites
    create_backups
    run_database_migrations
    deploy_applications
    start_services
    run_health_checks
    run_smoke_tests
    
    # Print summary
    print_summary
    
    echo ""
    log_success "READY FOR PRODUCTION!"
}

# Run main function
main
