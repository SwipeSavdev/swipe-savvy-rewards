#!/bin/bash
# Health Check Monitoring Script
# Usage: ./scripts/monitor-health.sh [interval_seconds]

INTERVAL=${1:-30}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local name=$1
    local url=$2
    
    if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}[✓]${NC} $name is healthy"
        return 0
    else
        echo -e "${RED}[✗]${NC} $name is unhealthy!"
        return 1
    fi
}

check_response_time() {
    local name=$1
    local url=$2
    local threshold=${3:-2}
    
    start=$(date +%s.%N)
    if curl -sf --max-time 10 "$url" > /dev/null 2>&1; then
        end=$(date +%s.%N)
        duration=$(echo "$end - $start" | bc)
        
        if (( $(echo "$duration > $threshold" | bc -l) )); then
            echo -e "${YELLOW}[!]${NC} $name response: ${duration}s (threshold: ${threshold}s)"
        else
            echo -e "${GREEN}[✓]${NC} $name response: ${duration}s"
        fi
    fi
}

echo "========================================="
echo "SwipeSavvy AI - Health Monitor"
echo "Interval: ${INTERVAL}s"
echo "========================================="

while true; do
    clear
    echo "Health Check - $(date)"
    echo "========================================="
    
    # Check services
    check_service "Concierge" "http://localhost:8000/health"
    check_service "RAG" "http://localhost:8001/health"
    check_service "Guardrails" "http://localhost:8002/health"
    check_service "Prometheus" "http://localhost:9090/-/healthy"
    check_service "Grafana" "http://localhost:3000/api/health"
    
    echo ""
    
    # Check response times
    check_response_time "Concierge" "http://localhost:8000/health" 2
    check_response_time "RAG" "http://localhost:8001/health" 1
    
    echo ""
    
    # System resources
    echo "System Resources:"
    echo "Disk: $(df -h / | awk 'NR==2 {print $5}') used"
    echo "Memory: $(free -m | awk 'NR==2 {printf "%.0f%%", $3/$2*100}') used"
    
    echo ""
    echo "Next check in ${INTERVAL}s... (Ctrl+C to stop)"
    sleep "$INTERVAL"
done
