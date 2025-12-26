#!/bin/bash
################################################################################
# Pre-Deployment Validation Script
# Phase 5 Task 8.2 - Pre-Deployment
# Automated infrastructure, service, and data validation
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_LOG="deployments/pre_deployment_$(date +%Y%m%d_%H%M%S).log"
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Create log directory
mkdir -p deployments

################################################################################
# Utility Functions
################################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
  ((CHECKS_PASSED++))
}

log_warning() {
  echo -e "${YELLOW}[!]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
  ((CHECKS_WARNING++))
}

log_error() {
  echo -e "${RED}[✗]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
  ((CHECKS_FAILED++))
}

print_section() {
  echo "" | tee -a "$DEPLOYMENT_LOG"
  echo "═══════════════════════════════════════════════════════════════════" | tee -a "$DEPLOYMENT_LOG"
  echo "$1" | tee -a "$DEPLOYMENT_LOG"
  echo "═══════════════════════════════════════════════════════════════════" | tee -a "$DEPLOYMENT_LOG"
}

print_subsection() {
  echo "" | tee -a "$DEPLOYMENT_LOG"
  echo "─── $1" | tee -a "$DEPLOYMENT_LOG"
}

################################################################################
# Section 1: Infrastructure Validation
################################################################################

validate_frontend_server() {
  print_subsection "Frontend Server"
  
  # Ping frontend
  if ping -c 1 app.swipesavvy.com &> /dev/null; then
    log_success "Frontend server responding to ping"
  else
    log_error "Frontend server not responding to ping"
    return 1
  fi
  
  # Check SSL certificate
  local cert_output=$(openssl s_client -connect app.swipesavvy.com:443 -servername app.swipesavvy.com 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
  if [[ $? -eq 0 ]]; then
    log_success "SSL certificate valid"
    echo "$cert_output" | tee -a "$DEPLOYMENT_LOG"
  else
    log_error "SSL certificate validation failed"
    return 1
  fi
  
  # Check HTTP 200 response
  local status=$(curl -s -o /dev/null -w "%{http_code}" https://app.swipesavvy.com)
  if [[ "$status" == "200" ]] || [[ "$status" == "301" ]]; then
    log_success "Frontend returning HTTP $status"
  else
    log_error "Frontend returning HTTP $status (expected 200/301)"
    return 1
  fi
}

validate_backend_server() {
  print_subsection "Backend Server"
  
  # Ping backend
  if ping -c 1 api.swipesavvy.com &> /dev/null; then
    log_success "Backend server responding to ping"
  else
    log_error "Backend server not responding"
    return 1
  fi
  
  # Check API health endpoint
  local health=$(curl -s http://api.swipesavvy.com:8000/api/phase4/health)
  if [[ $? -eq 0 ]]; then
    log_success "Backend health endpoint responding"
    echo "$health" | tee -a "$DEPLOYMENT_LOG"
  else
    log_error "Backend health endpoint not responding"
    return 1
  fi
  
  # Check critical API endpoints
  local endpoints=("/api/campaigns" "/api/users" "/api/merchants")
  for endpoint in "${endpoints[@]}"; do
    local status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test" http://api.swipesavvy.com:8000$endpoint)
    if [[ "$status" == "200" ]] || [[ "$status" == "401" ]]; then
      log_success "Endpoint $endpoint responding (HTTP $status)"
    else
      log_warning "Endpoint $endpoint returned HTTP $status"
    fi
  done
}

validate_load_balancer() {
  print_subsection "Load Balancer"
  
  if curl -s -I https://swipesavvy.com | grep -q "200\|301"; then
    log_success "Load balancer responding"
  else
    log_error "Load balancer not responding correctly"
    return 1
  fi
}

validate_dns() {
  print_subsection "DNS Resolution"
  
  local dns_result=$(nslookup swipesavvy.com 8.8.8.8 2>/dev/null | grep -A1 "Name:")
  if [[ ! -z "$dns_result" ]]; then
    log_success "DNS resolution working"
    echo "$dns_result" | tee -a "$DEPLOYMENT_LOG"
  else
    log_error "DNS resolution failed"
    return 1
  fi
}

################################################################################
# Section 2: Service Dependencies
################################################################################

validate_database() {
  print_subsection "PostgreSQL Database"
  
  # Check if database is running
  if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
    log_success "Database connection successful"
  else
    log_error "Cannot connect to database"
    return 1
  fi
  
  # Check database tables
  local table_count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
  if [[ $table_count -gt 20 ]]; then
    log_success "Database has $table_count tables"
  else
    log_warning "Database has only $table_count tables (expected > 20)"
  fi
  
  # Check critical tables exist
  local critical_tables=("users" "campaigns" "merchants" "notifications")
  for table in "${critical_tables[@]}"; do
    if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1 FROM $table LIMIT 1;" &>/dev/null; then
      local count=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;")
      log_success "Table $table exists ($count rows)"
    else
      log_error "Table $table not found or inaccessible"
      return 1
    fi
  done
}

validate_redis() {
  print_subsection "Redis Cache"
  
  # Check Redis connectivity
  if redis-cli -h "$REDIS_HOST" ping &>/dev/null; then
    log_success "Redis connection successful"
  else
    log_error "Cannot connect to Redis"
    return 1
  fi
  
  # Check Redis memory
  local mem_info=$(redis-cli -h "$REDIS_HOST" info memory)
  if [[ ! -z "$mem_info" ]]; then
    log_success "Redis memory info retrieved"
    echo "$mem_info" | head -10 | tee -a "$DEPLOYMENT_LOG"
  else
    log_error "Cannot retrieve Redis memory info"
    return 1
  fi
}

validate_email_service() {
  print_subsection "Email Service (SMTP)"
  
  # Test SMTP connectivity
  if timeout 5 bash -c "exec 3<>/dev/tcp/$SMTP_SERVER/$SMTP_PORT" 2>/dev/null; then
    log_success "SMTP server responding on port $SMTP_PORT"
  else
    log_warning "Cannot verify SMTP connectivity (may require auth)"
  fi
}

validate_external_services() {
  print_subsection "External Services"
  
  # Check Sentry DSN
  if [[ ! -z "$SENTRY_DSN" ]]; then
    log_success "Sentry DSN configured"
  else
    log_warning "Sentry DSN not configured"
  fi
  
  # Check Stripe API
  if [[ ! -z "$STRIPE_API_KEY" ]]; then
    log_success "Stripe API key configured"
  else
    log_warning "Stripe API key not configured"
  fi
}

################################################################################
# Section 3: Application Deployment
################################################################################

validate_backend_deployment() {
  print_subsection "Backend Application"
  
  # Check if Python version correct
  local python_version=$(python --version 2>&1)
  if [[ $python_version =~ "3.10" ]] || [[ $python_version =~ "3.11" ]]; then
    log_success "Python version correct: $python_version"
  else
    log_warning "Python version is $python_version (expected 3.10+)"
  fi
  
  # Check if required packages installed
  if python -c "import fastapi; import sqlalchemy; import redis; print('OK')" &>/dev/null; then
    log_success "Core Python packages installed"
  else
    log_error "Missing required Python packages"
    return 1
  fi
  
  # Check if .env.production exists
  if [[ -f ".env.production" ]]; then
    log_success ".env.production file exists"
  else
    log_error ".env.production file not found"
    return 1
  fi
}

validate_frontend_deployment() {
  print_subsection "Frontend Application"
  
  # Check if build directory exists
  if [[ -d "frontend/build" ]]; then
    log_success "Frontend build directory exists"
  else
    log_warning "Frontend build directory not found (may build on deploy)"
  fi
  
  # Check if Node modules installed
  if [[ -d "frontend/node_modules" ]]; then
    local module_count=$(find frontend/node_modules -maxdepth 1 -type d | wc -l)
    log_success "Frontend node_modules exists ($module_count modules)"
  else
    log_warning "Frontend node_modules not found"
  fi
  
  # Check Node.js version
  if command -v node &> /dev/null; then
    local node_version=$(node --version)
    log_success "Node.js installed: $node_version"
  else
    log_warning "Node.js not found in PATH"
  fi
}

################################################################################
# Section 4: Security Verification
################################################################################

validate_security() {
  print_subsection "Security Configuration"
  
  # Check for hardcoded secrets in git
  if git log -p | grep -i "password\|secret\|api_key" &>/dev/null; then
    log_warning "Possible hardcoded secrets found in git history"
  else
    log_success "No obvious hardcoded secrets in recent commits"
  fi
  
  # Check environment variables
  if [[ ! -z "$DATABASE_URL" ]] && [[ ! -z "$REDIS_URL" ]] && [[ ! -z "$SECRET_KEY" ]]; then
    log_success "Critical environment variables set"
  else
    log_error "Missing critical environment variables"
    return 1
  fi
  
  # Check .env.production permissions
  if [[ -f ".env.production" ]]; then
    local perms=$(stat -c "%a" .env.production 2>/dev/null || stat -f "%OLp" .env.production | cut -c 3-)
    if [[ "$perms" == "600" ]] || [[ "$perms" == "640" ]]; then
      log_success ".env.production has secure permissions ($perms)"
    else
      log_warning ".env.production has permissions $perms (should be 600)"
    fi
  fi
}

################################################################################
# Section 5: Backup Verification
################################################################################

validate_backups() {
  print_subsection "Backup Status"
  
  # Check latest database backup
  if [[ -d "backups" ]]; then
    local latest_backup=$(ls -t backups/db_*.sql 2>/dev/null | head -1)
    if [[ ! -z "$latest_backup" ]]; then
      local backup_age=$(($(date +%s) - $(stat -c %Y "$latest_backup" 2>/dev/null || stat -f %m "$latest_backup")))
      local backup_hours=$((backup_age / 3600))
      local backup_size=$(du -h "$latest_backup" | cut -f1)
      
      if [[ $backup_hours -lt 24 ]]; then
        log_success "Latest backup: $latest_backup ($backup_size, $backup_hours hours old)"
      else
        log_warning "Latest backup is $backup_hours hours old (should be < 24)"
      fi
    else
      log_error "No database backups found"
      return 1
    fi
  else
    log_warning "Backups directory not found"
  fi
  
  # Check rollback script exists
  if [[ -f "scripts/rollback_production.sh" ]]; then
    log_success "Rollback script exists"
  else
    log_error "Rollback script not found at scripts/rollback_production.sh"
    return 1
  fi
}

################################################################################
# Section 6: System Resources
################################################################################

validate_system_resources() {
  print_subsection "System Resources"
  
  # Check disk space
  local available_disk=$(df / | awk 'NR==2 {print $4}')
  if [[ $available_disk -gt 10485760 ]]; then
    local disk_gb=$((available_disk / 1048576))
    log_success "Sufficient disk space: ${disk_gb}GB free"
  else
    log_error "Insufficient disk space: less than 10GB free"
    return 1
  fi
  
  # Check memory
  local available_mem=$(free | awk 'NR==2 {print $7}')
  if [[ $available_mem -gt 2097152 ]]; then
    local mem_gb=$((available_mem / 1048576))
    log_success "Sufficient memory: ${mem_gb}GB free"
  else
    log_warning "Limited memory: less than 2GB free"
  fi
  
  # Check CPU
  local cpu_count=$(nproc)
  log_success "CPU cores available: $cpu_count"
}

################################################################################
# Main Execution
################################################################################

main() {
  echo "" | tee "$DEPLOYMENT_LOG"
  echo "╔════════════════════════════════════════════════════════════════╗" | tee -a "$DEPLOYMENT_LOG"
  echo "║    PHASE 5 TASK 8.2 - PRE-DEPLOYMENT VALIDATION                ║" | tee -a "$DEPLOYMENT_LOG"
  echo "║    Automated Infrastructure & Service Verification             ║" | tee -a "$DEPLOYMENT_LOG"
  echo "╚════════════════════════════════════════════════════════════════╝" | tee -a "$DEPLOYMENT_LOG"
  echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S %Z')" | tee -a "$DEPLOYMENT_LOG"
  echo "Log file: $DEPLOYMENT_LOG" | tee -a "$DEPLOYMENT_LOG"
  
  # Load environment
  if [[ -f ".env.production" ]]; then
    set -a
    source .env.production
    set +a
  fi
  
  # Run validation sections
  print_section "SECTION 1: INFRASTRUCTURE VALIDATION"
  validate_frontend_server || true
  validate_backend_server || true
  validate_load_balancer || true
  validate_dns || true
  
  print_section "SECTION 2: SERVICE DEPENDENCIES"
  validate_database || true
  validate_redis || true
  validate_email_service || true
  validate_external_services || true
  
  print_section "SECTION 3: APPLICATION DEPLOYMENT"
  validate_backend_deployment || true
  validate_frontend_deployment || true
  
  print_section "SECTION 4: SECURITY VERIFICATION"
  validate_security || true
  
  print_section "SECTION 5: BACKUP VERIFICATION"
  validate_backups || true
  
  print_section "SECTION 6: SYSTEM RESOURCES"
  validate_system_resources || true
  
  # Print summary
  print_section "VALIDATION SUMMARY"
  echo "" | tee -a "$DEPLOYMENT_LOG"
  echo "✓ Checks Passed:  $CHECKS_PASSED" | tee -a "$DEPLOYMENT_LOG"
  echo "⚠ Warnings:      $CHECKS_WARNING" | tee -a "$DEPLOYMENT_LOG"
  echo "✗ Checks Failed: $CHECKS_FAILED" | tee -a "$DEPLOYMENT_LOG"
  echo "" | tee -a "$DEPLOYMENT_LOG"
  
  if [[ $CHECKS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}✓ ALL PRE-DEPLOYMENT CHECKS PASSED${NC}" | tee -a "$DEPLOYMENT_LOG"
    echo "Status: READY FOR DEPLOYMENT" | tee -a "$DEPLOYMENT_LOG"
    echo "" | tee -a "$DEPLOYMENT_LOG"
    return 0
  else
    echo -e "${RED}✗ DEPLOYMENT BLOCKED - ISSUES FOUND${NC}" | tee -a "$DEPLOYMENT_LOG"
    echo "Status: NOT READY FOR DEPLOYMENT" | tee -a "$DEPLOYMENT_LOG"
    echo "Review log file: $DEPLOYMENT_LOG" | tee -a "$DEPLOYMENT_LOG"
    echo "" | tee -a "$DEPLOYMENT_LOG"
    return 1
  fi
}

# Run main function
main
exit $?
