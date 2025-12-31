#!/bin/bash

# SwipeSavvy - Restart All Applications Script
# Restarts all running backend services and development servers

set -e

WORKSPACE_DIR="/Users/macbookpro/Documents/swipesavvy-mobile-app"
LOG_DIR="$WORKSPACE_DIR/logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Kill any existing processes
print_header "STEP 1: Stopping Running Processes"

print_info "Killing Node.js processes..."
pkill -f "npm start" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node " 2>/dev/null || true
sleep 1

print_info "Killing Python processes on port 8000..."
lsof -ti:8000 | xargs -r kill -9 2>/dev/null || true
sleep 1

print_info "Killing processes on development ports (5173, 3000, 8080, 8081, 19000, 19001)..."
for port in 5173 3000 8080 8081 19000 19001; do
    lsof -ti:$port | xargs -r kill -9 2>/dev/null || true
done
sleep 2

print_success "All processes stopped"

# Start applications
print_header "STEP 2: Starting Applications"

# 1. Mobile App (Expo) - Dev Mode
print_info "Starting Mobile App (Expo)..."
cd "$WORKSPACE_DIR"
npm start > "$LOG_DIR/mobile-app.log" 2>&1 &
MOBILE_APP_PID=$!
echo $MOBILE_APP_PID > "$LOG_DIR/mobile-app.pid"
print_success "Mobile App started (PID: $MOBILE_APP_PID, Dev Mode)"
sleep 3

# 2. Python Backend Services (FastAPI on port 8000)
print_info "Checking for Python virtual environment..."
if [ -d "$WORKSPACE_DIR/.venv" ]; then
    print_info "Starting AI Agents Backend (FastAPI)..."
    cd "$WORKSPACE_DIR"
    source .venv/bin/activate
    python3 main.py > "$LOG_DIR/fastapi-backend.log" 2>&1 &
    FASTAPI_PID=$!
    echo $FASTAPI_PID > "$LOG_DIR/fastapi-backend.pid"
    print_success "FastAPI Backend started (PID: $FASTAPI_PID, Port: 8000)"
else
    print_error "Virtual environment not found. Skipping FastAPI Backend."
fi
sleep 2

# Summary
print_header "STEP 3: Startup Summary"

echo ""
echo -e "${GREEN}Application Startup Complete!${NC}"
echo ""
echo -e "📱 ${BLUE}Mobile App${NC} (Expo Dev Mode)"
echo -e "   - PID: $MOBILE_APP_PID"
echo -e "   - Press 'w' for web, 'i' for iOS, 'a' for Android"
echo -e "   - Log: $LOG_DIR/mobile-app.log"
echo ""
if [ ! -z "$FASTAPI_PID" ]; then
    echo -e "🤖 ${BLUE}FastAPI Backend${NC}"
    echo -e "   - PID: $FASTAPI_PID"
    echo -e "   - URL: http://localhost:8000"
    echo -e "   - Docs: http://localhost:8000/docs"
    echo -e "   - Log: $LOG_DIR/fastapi-backend.log"
    echo ""
fi
echo -e "${YELLOW}📋 Logs Directory: $LOG_DIR${NC}"
echo ""

# Display running processes
print_header "Running Application Processes"
ps aux | grep -E "(npm start|python|expo)" | grep -v grep || echo "Checking processes..."
echo ""

print_success "All applications restarted successfully!"
print_info "To view logs: tail -f $LOG_DIR/*.log"
