#!/bin/bash

# SwipeSavvy Production Deployment Script
# Purpose: Deploy and start the API in production mode
# Created: December 28, 2025 - Phase 8 Production Deployment

set -e

echo "═══════════════════════════════════════════════════════════════════════════"
echo "                    SwipeSavvy Production Deployment"
echo "═══════════════════════════════════════════════════════════════════════════"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_DIR="$SCRIPT_DIR"

echo "📁 Project Directory: $PROJECT_DIR"
echo "📁 App Directory: $APP_DIR"
echo ""

# ═════════════════════════════════════════════════════════════════════════════
# STEP 1: Verify Environment
# ═════════════════════════════════════════════════════════════════════════════

echo "▶ Step 1: Verifying environment..."

if [ ! -f "$PROJECT_DIR/.venv/bin/activate" ]; then
    echo "❌ Virtual environment not found at $PROJECT_DIR/.venv"
    echo "   Please run: python -m venv .venv"
    exit 1
fi

source "$PROJECT_DIR/.venv/bin/activate"
echo "✅ Virtual environment activated"

if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    echo "❌ Production environment file not found"
    echo "   Please create .env.production with database credentials"
    exit 1
fi

echo "✅ Production environment file found"
echo ""

# ═════════════════════════════════════════════════════════════════════════════
# STEP 2: Verify Dependencies
# ═════════════════════════════════════════════════════════════════════════════

echo "▶ Step 2: Verifying dependencies..."

python -c "import fastapi; print('✅ FastAPI installed')" || {
    echo "❌ FastAPI not installed"
    exit 1
}

python -c "import sqlalchemy; print('✅ SQLAlchemy installed')" || {
    echo "❌ SQLAlchemy not installed"
    exit 1
}

python -c "import psycopg2; print('✅ psycopg2 installed')" || {
    echo "❌ psycopg2 not installed"
    exit 1
}

echo ""

# ═════════════════════════════════════════════════════════════════════════════
# STEP 3: Verify Code Syntax
# ═════════════════════════════════════════════════════════════════════════════

echo "▶ Step 3: Verifying code syntax..."

cd "$APP_DIR"

python -m py_compile main.py && echo "✅ main.py syntax valid" || {
    echo "❌ main.py has syntax errors"
    exit 1
}

python -m py_compile config.py && echo "✅ config.py syntax valid" || {
    echo "❌ config.py has syntax errors"
    exit 1
}

echo ""

# ═════════════════════════════════════════════════════════════════════════════
# STEP 4: Load Configuration
# ═════════════════════════════════════════════════════════════════════════════

echo "▶ Step 4: Loading configuration..."

export $(cat "$PROJECT_DIR/.env.production" | grep -v '#' | xargs)

echo "   Database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "   Server: $SERVER_HOST:$SERVER_PORT"
echo "   Environment: $ENVIRONMENT"
echo "✅ Configuration loaded"
echo ""

# ═════════════════════════════════════════════════════════════════════════════
# STEP 5: Create Log Directory
# ═════════════════════════════════════════════════════════════════════════════

echo "▶ Step 5: Setting up logging..."

LOG_DIR=$(dirname "$LOG_FILE")
mkdir -p "$LOG_DIR" 2>/dev/null || true

if [ -d "$LOG_DIR" ]; then
    echo "✅ Log directory ready: $LOG_DIR"
else
    echo "⚠️  Could not create log directory, using stdout"
fi

echo ""

# ═════════════════════════════════════════════════════════════════════════════
# STEP 6: Start API Server
# ═════════════════════════════════════════════════════════════════════════════

echo "▶ Step 6: Starting API server..."
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"

cd "$APP_DIR"

# Start with uvicorn
python -m uvicorn main:app \
    --host "$SERVER_HOST" \
    --port "$SERVER_PORT" \
    --workers 4 \
    --loop uvloop \
    --log-level "$LOG_LEVEL" \
    --access-log

