#!/bin/bash
# Mock Data Setup Script
# Loads test data into the database for the Marketing AI system

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Mock Data Loader for SwipeSavvy${NC}"
echo -e "${BLUE}========================================${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/.."

# Check if we're in the right directory
if [ ! -f "$BACKEND_DIR/app/main.py" ]; then
    echo -e "${RED}Error: Could not find backend directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Backend directory: $BACKEND_DIR${NC}"

# Check for merchant CSV file
MERCHANT_CSV="/Users/macbookpro/Documents/Mock Data/MerchantList-North.csv"
if [ ! -f "$MERCHANT_CSV" ]; then
    echo -e "${RED}Error: Merchant file not found at $MERCHANT_CSV${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found merchant data${NC}"

# Set default values
MOCK_USERS=${1:-100}
MOCK_TRANSACTIONS=${2:-50}
CLEAR_FIRST=${3:-false}

echo -e "${YELLOW}Configuration:${NC}"
echo "  Mock Users: $MOCK_USERS"
echo "  Transactions per User: $MOCK_TRANSACTIONS"
echo "  Clear Existing: $CLEAR_FIRST"
echo ""

# Load environment
cd "$BACKEND_DIR"
if [ -f ".env" ]; then
    echo -e "${BLUE}Loading environment from .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}Warning: No .env file found, using defaults${NC}"
fi

# Run the mock data loader
echo -e "${BLUE}Starting mock data loader...${NC}"
echo ""

export MOCK_USERS=$MOCK_USERS
export MOCK_TRANSACTIONS=$MOCK_TRANSACTIONS
export MOCK_CLEAR=$CLEAR_FIRST

python3 -c "
import sys
sys.path.insert(0, '$BACKEND_DIR')
from app.utils.mock_data_loader import main
main()
"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Mock data loaded successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}You can now test the Marketing AI with:${NC}"
    echo "  curl http://localhost:8000/api/marketing/analysis/run-now"
else
    echo -e "${RED}Failed to load mock data${NC}"
fi

exit $exit_code
