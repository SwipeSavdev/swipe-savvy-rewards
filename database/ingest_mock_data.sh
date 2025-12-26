#!/bin/bash

# SwipeSavvy Mock Data Ingestion Script
# Populates database with real merchant and transaction data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="${SCRIPT_DIR}/ingest_mock_data.py"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      SwipeSavvy Mock Data Ingestion Tool                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Python script exists
if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo -e "${RED}✗ Python script not found: $PYTHON_SCRIPT${NC}"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 is not installed${NC}"
    exit 1
fi

# Check dependencies
echo -e "${BLUE}Checking dependencies...${NC}"
python3 -c "import psycopg2" 2>/dev/null || {
    echo -e "${BLUE}Installing psycopg2...${NC}"
    pip install psycopg2-binary > /dev/null
}

echo -e "${GREEN}✓ Dependencies OK${NC}"
echo ""

# Run ingestion
echo -e "${BLUE}Starting data ingestion...${NC}"
echo ""

python3 "$PYTHON_SCRIPT"

RESULT=$?

echo ""
if [ $RESULT -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Data Ingestion Completed Successfully!           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✓ Campaign Analytics: Populated${NC}"
    echo -e "${GREEN}✓ Segment Analytics: Populated${NC}"
    echo -e "${GREEN}✓ A/B Tests: Populated${NC}"
    echo -e "${GREEN}✓ A/B Assignments: Populated${NC}"
    echo -e "${GREEN}✓ User Affinity: Populated${NC}"
    echo -e "${GREEN}✓ Optimal Send Times: Populated${NC}"
    echo -e "${GREEN}✓ Campaign Optimizations: Populated${NC}"
    echo ""
    echo "Verify data with:"
    echo "  psql -U swipesavvy_backend -d swipesavvy_db -c 'SELECT COUNT(*) FROM campaign_analytics_daily;'"
else
    echo -e "${RED}✗ Data ingestion failed${NC}"
    exit 1
fi
