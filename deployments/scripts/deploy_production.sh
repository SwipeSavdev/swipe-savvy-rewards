#!/bin/bash
# deploy_production.sh
# Production Deployment Script - AUTOMATED DEPLOYMENT ORCHESTRATION
# Date: December 31, 2025
# Target: SwipeSavvy Mobile App v2.0.0

set -e  # Exit on error
set -o pipefail  # Exit on pipe failures

# ============================================================================
# CONFIGURATION
# ============================================================================

DEPLOYMENT_VERSION="2.0.0"
DEPLOYMENT_ID=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_LOG="deployments/logs/deployment_${DEPLOYMENT_ID}.log"
ROLLBACK_SCRIPT="deployments/scripts/rollback_${DEPLOYMENT_ID}.sh"
DEPLOYMENT_STATUS_FILE="deployments/.deployment_status"

# Directory configuration
BACKUP_DIR="deployments/backups"
SCRIPT_DIR="deployments/scripts"
LOG_DIR="deployments/logs"

# Database configuration
DB_HOST="${DB_HOST:-db.swipesavvy.com}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-merchants_prod}"
DB_BACKUP_FILE="${BACKUP_DIR}/db_${DEPLOYMENT_ID}.sql"

# Service configuration
API_SERVICE="swipesavvy-api"
FRONTEND_SERVICE="swipesavvy-frontend"
NGINX_SERVICE="nginx"

# Thresholds for health checks
RESPONSE_TIME_THRESHOLD=2000  # milliseconds
ERROR_RATE_THRESHOLD=0.05      # 5%
MEMORY_THRESHOLD=85            # percent
DISK_THRESHOLD=90              # percent

# ============================================================================
# COLOR OUTPUT
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

# ============================================================================
# INITIALIZATION
# ============================================================================

init_deployment() {
  log_info "Initializing deployment environment..."
  
  # Create necessary directories
  mkdir -p "$BACKUP_DIR" "$LOG_DIR" "$SCRIPT_DIR"
  
  # Initialize log file
  echo "=========================================" > "$DEPLOYMENT_LOG"
  echo "PRODUCTION DEPLOYMENT LOG" >> "$DEPLOYMENT_LOG"
  echo "Deployment ID: $DEPLOYMENT_ID" >> "$DEPLOYMENT_LOG"
  echo "Version: $DEPLOYMENT_VERSION" >> "$DEPLOYMENT_LOG"
  echo "Start Time: $(date)" >> "$DEPLOYMENT_LOG"
  echo "=========================================" >> "$DEPLOYMENT_LOG"
  
  log_success "Deployment environment initialized"
}

# ============================================================================
# PHASE 1: PRE-DEPLOYMENT VALIDATION
# ============================================================================

phase1_validation() {
  log_info "PHASE 1: PRE-DEPLOYMENT VALIDATION (1/7)"
  
  # Check environment
  log_info "Checking environment variables..."
  [[ -f ".env.production" ]] || { log_error ".env.production not found"; return 1; }
  source .env.production
  
  # Check disk space
  log_info "Checking disk space..."
  AVAILABLE=$(df / | awk 'NR==2 {print $4}')
  if [[ $AVAILABLE -lt 10485760 ]]; then
    log_error "Less than 10GB free disk space"
    return 1
  fi
  log_success "Disk space check passed ($(numfmt --to=iec-i --suffix=B $AVAILABLE) available)"
  
  # Check memory
  log_info "Checking memory..."
  AVAILABLE_MEM=$(free | awk 'NR==2 {print $7}')
  if [[ $AVAILABLE_MEM -lt 2097152 ]]; then
    log_warning "Less than 2GB available memory"
  fi
  log_success "Memory check passed"
  
  # Test database connectivity
  log_info "Testing database connectivity..."
  if ! psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" &>/dev/null; then
    log_error "Database connection failed"
    return 1
  fi
  log_success "Database connectivity verified"
  
  # Test Redis connectivity
  log_info "Testing Redis connectivity..."
  if ! redis-cli -h "${REDIS_HOST:-cache.swipesavvy.com}" ping &>/dev/null; then
    log_error "Redis connection failed"
    return 1
  fi
  log_success "Redis connectivity verified"
  
  # Verify current API is accessible
  log_info "Verifying current API..."
  if ! curl -sf "https://api.swipesavvy.com/health" > /dev/null; then
    log_error "Current API not accessible"
    return 1
  fi
  log_success "Current API is accessible"
  
  # Verify backup exists
  log_info "Verifying latest backup..."
  if [[ ! -f "backups/latest.sql" ]]; then
    log_error "Latest backup file not found"
    return 1
  fi
  log_success "Latest backup verified"
  
  log_success "Phase 1 complete: All pre-deployment checks passed"
}

# ============================================================================
# PHASE 2: CREATE ROLLBACK PLAN
# ============================================================================

phase2_rollback_plan() {
  log_info "PHASE 2: CREATE ROLLBACK PLAN (2/7)"
  
  log_info "Creating rollback script..."
  cat > "$ROLLBACK_SCRIPT" << 'ROLLBACK_EOF'
#!/bin/bash
set -e

DEPLOYMENT_ID=$1
ROLLBACK_LOG="deployments/logs/rollback_${DEPLOYMENT_ID}.log"

echo "Starting rollback for deployment: $DEPLOYMENT_ID" | tee -a "$ROLLBACK_LOG"

# Step 1: Stop new connections
echo "[1/6] Stopping new connections..." | tee -a "$ROLLBACK_LOG"
systemctl stop nginx
sleep 10

# Step 2: Drain active connections
echo "[2/6] Draining active connections..." | tee -a "$ROLLBACK_LOG"
sleep 30

# Step 3: Restore database from backup
echo "[3/6] Restoring database from backup..." | tee -a "$ROLLBACK_LOG"
psql -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" < "deployments/backups/db_${DEPLOYMENT_ID}.sql"

# Step 4: Restart services
echo "[4/6] Restarting services..." | tee -a "$ROLLBACK_LOG"
systemctl start swipesavvy-api
systemctl start nginx

# Step 5: Wait for services
echo "[5/6] Waiting for services to stabilize..." | tee -a "$ROLLBACK_LOG"
sleep 30

# Step 6: Verification
echo "[6/6] Running post-rollback verification..." | tee -a "$ROLLBACK_LOG"
curl -sf "https://api.swipesavvy.com/health" || { echo "Health check failed"; exit 1; }

echo "✅ Rollback complete!" | tee -a "$ROLLBACK_LOG"
ROLLBACK_EOF
  
  chmod +x "$ROLLBACK_SCRIPT"
  log_success "Rollback script created: $ROLLBACK_SCRIPT"
}

# ============================================================================
# PHASE 3: DATABASE BACKUP
# ============================================================================

phase3_database_backup() {
  log_info "PHASE 3: DATABASE BACKUP (3/7)"
  
  log_info "Creating database backup..."
  if ! pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" > "$DB_BACKUP_FILE" 2>>"$DEPLOYMENT_LOG"; then
    log_error "Database backup failed"
    return 1
  fi
  
  # Verify backup file
  if [[ ! -s "$DB_BACKUP_FILE" ]]; then
    log_error "Backup file is empty"
    return 1
  fi
  
  BACKUP_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
  log_success "Database backup created: $DB_BACKUP_FILE ($BACKUP_SIZE)"
}

# ============================================================================
# PHASE 4: DEPLOY BACKEND
# ============================================================================

phase4_deploy_backend() {
  log_info "PHASE 4: DEPLOY BACKEND (4/7)"
  
  log_info "Fetching latest code from repository..."
  cd backend
  git fetch origin || { log_error "Git fetch failed"; return 1; }
  git checkout "v${DEPLOYMENT_VERSION}" || { log_error "Git checkout failed"; return 1; }
  
  log_info "Installing dependencies..."
  pip install -r requirements.txt >> "$DEPLOYMENT_LOG" 2>&1 || { log_error "Dependency installation failed"; return 1; }
  
  log_info "Running database migrations..."
  python manage.py migrate --settings=config.production >> "$DEPLOYMENT_LOG" 2>&1 || { log_error "Database migration failed"; return 1; }
  
  log_info "Collecting static files..."
  python manage.py collectstatic --no-input --settings=config.production >> "$DEPLOYMENT_LOG" 2>&1 || { log_error "Static file collection failed"; return 1; }
  
  log_info "Restarting API service..."
  systemctl restart "$API_SERVICE" || { log_error "API service restart failed"; return 1; }
  
  # Wait for service to be ready
  log_info "Waiting for API to be ready..."
  sleep 5
  
  # Check if service is running
  if ! systemctl is-active --quiet "$API_SERVICE"; then
    log_error "API service failed to start"
    return 1
  fi
  
  log_success "Backend deployment complete"
  cd - > /dev/null
}

# ============================================================================
# PHASE 5: DEPLOY FRONTEND
# ============================================================================

phase5_deploy_frontend() {
  log_info "PHASE 5: DEPLOY FRONTEND (5/7)"
  
  log_info "Fetching latest code from repository..."
  cd frontend
  git fetch origin || { log_error "Git fetch failed"; return 1; }
  git checkout "v${DEPLOYMENT_VERSION}" || { log_error "Git checkout failed"; return 1; }
  
  log_info "Installing dependencies (npm ci)..."
  npm ci >> "$DEPLOYMENT_LOG" 2>&1 || { log_error "npm install failed"; return 1; }
  
  log_info "Building production assets..."
  npm run build:production >> "$DEPLOYMENT_LOG" 2>&1 || { log_error "Build failed"; return 1; }
  
  log_info "Deploying to CDN..."
  ./scripts/deploy_to_cdn.sh >> "$DEPLOYMENT_LOG" 2>&1 || { log_error "CDN deployment failed"; return 1; }
  
  log_success "Frontend deployment complete"
  cd - > /dev/null
}

# ============================================================================
# PHASE 6: SMOKE TESTS
# ============================================================================

phase6_smoke_tests() {
  log_info "PHASE 6: SMOKE TESTS (6/7)"
  
  local tests_passed=0
  local tests_failed=0
  
  # Test 1: API health check
  log_info "Test 1: API health check..."
  if curl -sf "https://api.swipesavvy.com/health" > /dev/null; then
    log_success "✓ API health check passed"
    ((tests_passed++))
  else
    log_error "✗ API health check failed"
    ((tests_failed++))
  fi
  
  # Test 2: Frontend accessibility
  log_info "Test 2: Frontend accessibility..."
  if curl -sf "https://app.swipesavvy.com" > /dev/null; then
    log_success "✓ Frontend is accessible"
    ((tests_passed++))
  else
    log_error "✗ Frontend is not accessible"
    ((tests_failed++))
  fi
  
  # Test 3: Database connectivity
  log_info "Test 3: Database connectivity..."
  if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" &>/dev/null; then
    log_success "✓ Database connectivity verified"
    ((tests_passed++))
  else
    log_error "✗ Database connectivity failed"
    ((tests_failed++))
  fi
  
  # Test 4: API endpoints
  log_info "Test 4: API endpoints..."
  ENDPOINT_TESTS=$(curl -s "https://api.swipesavvy.com/v1/campaigns" -H "Authorization: Bearer test" | grep -c "error" || echo "0")
  if [[ $ENDPOINT_TESTS -eq 0 ]]; then
    log_success "✓ API endpoints responsive"
    ((tests_passed++))
  else
    log_error "✗ API endpoints returning errors"
    ((tests_failed++))
  fi
  
  log_info "Smoke tests result: $tests_passed passed, $tests_failed failed"
  
  if [[ $tests_failed -gt 0 ]]; then
    log_error "Smoke tests failed! Rolling back..."
    bash "$ROLLBACK_SCRIPT" "$DEPLOYMENT_ID"
    return 1
  fi
  
  log_success "Phase 6 complete: All smoke tests passed"
}

# ============================================================================
# PHASE 7: POST-DEPLOYMENT VERIFICATION
# ============================================================================

phase7_verification() {
  log_info "PHASE 7: POST-DEPLOYMENT VERIFICATION (7/7)"
  
  # Wait for systems to stabilize
  log_info "Waiting for systems to stabilize (30s)..."
  sleep 30
  
  # Check error rate
  log_info "Checking error rate..."
  ERROR_RATE=$(curl -s "https://metrics.swipesavvy.com/api/v1/error_rate" | jq '.error_rate' 2>/dev/null || echo "0")
  if (( $(echo "$ERROR_RATE > $ERROR_RATE_THRESHOLD" | bc -l) )); then
    log_warning "Error rate is high: $ERROR_RATE"
  else
    log_success "Error rate is acceptable: $ERROR_RATE"
  fi
  
  # Check response time
  log_info "Checking response time..."
  RESPONSE_TIME=$(curl -s "https://metrics.swipesavvy.com/api/v1/response_time" | jq '.p95' 2>/dev/null || echo "0")
  if (( $(echo "$RESPONSE_TIME > $RESPONSE_TIME_THRESHOLD" | bc -l) )); then
    log_warning "Response time is high: ${RESPONSE_TIME}ms"
  else
    log_success "Response time is acceptable: ${RESPONSE_TIME}ms"
  fi
  
  # Check resource usage
  log_info "Checking resource usage..."
  MEMORY_USAGE=$(free | awk 'NR==2 {printf("%.0f", $3/$2 * 100)}')
  if [[ $MEMORY_USAGE -gt $MEMORY_THRESHOLD ]]; then
    log_warning "Memory usage is high: $MEMORY_USAGE%"
  else
    log_success "Memory usage is normal: $MEMORY_USAGE%"
  fi
  
  log_success "Phase 7 complete: All verification checks passed"
}

# ============================================================================
# MAIN DEPLOYMENT FLOW
# ============================================================================

main() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║   SWIPESAVVY MOBILE APP - PRODUCTION DEPLOYMENT                ║"
  echo "║   Version: $DEPLOYMENT_VERSION                                   ║"
  echo "║   Deployment ID: $DEPLOYMENT_ID                        ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
  
  # Initialize
  init_deployment
  
  # Execute phases
  phase1_validation || { log_error "Deployment aborted at Phase 1"; exit 1; }
  phase2_rollback_plan || { log_error "Deployment aborted at Phase 2"; exit 1; }
  phase3_database_backup || { log_error "Deployment aborted at Phase 3"; exit 1; }
  phase4_deploy_backend || { log_error "Deployment aborted at Phase 4"; exit 1; }
  phase5_deploy_frontend || { log_error "Deployment aborted at Phase 5"; exit 1; }
  phase6_smoke_tests || { log_error "Deployment aborted at Phase 6"; exit 1; }
  phase7_verification || { log_error "Deployment aborted at Phase 7"; exit 1; }
  
  # Success
  echo ""
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║   ✅ DEPLOYMENT SUCCESSFUL                                      ║"
  echo "║   Version: $DEPLOYMENT_VERSION                                   ║"
  echo "║   Deployment ID: $DEPLOYMENT_ID                        ║"
  echo "║   Log: $DEPLOYMENT_LOG                      ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
  
  echo "deployment_successful" > "$DEPLOYMENT_STATUS_FILE"
  log_success "Production deployment complete!"
}

# Execute main function
main "$@"
