"""
Production Smoke Tests - Validate deployment
Run after production deployment to ensure all services are working
"""

import requests
import sys
import time
from typing import Dict, List, Tuple

# Configuration
BASE_URL = "http://localhost:8000"
RAG_URL = "http://localhost:8001"
GUARDRAILS_URL = "http://localhost:8002"
TIMEOUT = 10

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(name: str, status: str, message: str = ""):
    status_color = Colors.GREEN if status == "PASS" else Colors.RED
    print(f"{Colors.BLUE}[TEST]{Colors.END} {name}: {status_color}{status}{Colors.END} {message}")

def test_service_health(url: str, service_name: str) -> bool:
    """Test service health endpoint"""
    try:
        response = requests.get(f"{url}/health", timeout=TIMEOUT)
        if response.status_code == 200:
            log_test(f"{service_name} Health Check", "PASS")
            return True
        else:
            log_test(f"{service_name} Health Check", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test(f"{service_name} Health Check", "FAIL", str(e))
        return False

def test_concierge_chat() -> bool:
    """Test basic chat functionality"""
    try:
        payload = {
            "message": "Hello, what's my balance?",
            "user_id": "test_user_smoke_001"
        }
        response = requests.post(
            f"{BASE_URL}/api/v1/chat",
            json=payload,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            if "response" in data:
                log_test("Concierge Chat", "PASS")
                return True
            else:
                log_test("Concierge Chat", "FAIL", "Missing 'response' in reply")
                return False
        else:
            log_test("Concierge Chat", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("Concierge Chat", "FAIL", str(e))
        return False

def test_rag_search() -> bool:
    """Test RAG semantic search"""
    try:
        payload = {
            "query": "How do I transfer money?",
            "top_k": 3
        }
        response = requests.post(
            f"{RAG_URL}/search",
            json=payload,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            if "results" in data:
                log_test("RAG Semantic Search", "PASS")
                return True
            else:
                log_test("RAG Semantic Search", "FAIL", "Missing 'results'")
                return False
        else:
            log_test("RAG Semantic Search", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("RAG Semantic Search", "FAIL", str(e))
        return False

def test_guardrails_content_safety() -> bool:
    """Test content safety guardrails"""
    try:
        payload = {
            "text": "This is a safe message for testing"
        }
        response = requests.post(
            f"{GUARDRAILS_URL}/check/content-safety",
            json=payload,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            if "is_safe" in data:
                log_test("Guardrails Content Safety", "PASS")
                return True
            else:
                log_test("Guardrails Content Safety", "FAIL", "Missing 'is_safe'")
                return False
        else:
            log_test("Guardrails Content Safety", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("Guardrails Content Safety", "FAIL", str(e))
        return False

def test_guardrails_pii_detection() -> bool:
    """Test PII detection"""
    try:
        payload = {
            "text": "Hello, this is a test message without PII"
        }
        response = requests.post(
            f"{GUARDRAILS_URL}/check/pii",
            json=payload,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            if "contains_pii" in data:
                log_test("Guardrails PII Detection", "PASS")
                return True
            else:
                log_test("Guardrails PII Detection", "FAIL", "Missing 'contains_pii'")
                return False
        else:
            log_test("Guardrails PII Detection", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("Guardrails PII Detection", "FAIL", str(e))
        return False

def test_metrics_endpoint() -> bool:
    """Test metrics endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/metrics", timeout=TIMEOUT)
        
        if response.status_code == 200:
            # Check if it's Prometheus format
            if "http_requests_total" in response.text or "process_" in response.text:
                log_test("Metrics Endpoint", "PASS")
                return True
            else:
                log_test("Metrics Endpoint", "FAIL", "Invalid Prometheus format")
                return False
        else:
            log_test("Metrics Endpoint", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("Metrics Endpoint", "FAIL", str(e))
        return False

def test_response_time() -> bool:
    """Test that response time is acceptable"""
    try:
        start = time.time()
        payload = {"message": "Hello", "user_id": "test_perf_001"}
        response = requests.post(
            f"{BASE_URL}/api/v1/chat",
            json=payload,
            timeout=TIMEOUT
        )
        elapsed = time.time() - start
        
        if response.status_code == 200 and elapsed < 3.0:
            log_test("Response Time", "PASS", f"{elapsed:.2f}s")
            return True
        elif elapsed >= 3.0:
            log_test("Response Time", "FAIL", f"{elapsed:.2f}s (> 3s SLA)")
            return False
        else:
            log_test("Response Time", "FAIL", f"Status: {response.status_code}")
            return False
    except Exception as e:
        log_test("Response Time", "FAIL", str(e))
        return False

def main():
    print("\n" + "="*60)
    print(f"{Colors.BLUE}SwipeSavvy AI Agents - Production Smoke Tests{Colors.END}")
    print("="*60 + "\n")
    
    tests: List[Tuple[str, callable]] = [
        ("Service Health Checks", lambda: all([
            test_service_health(BASE_URL, "Concierge"),
            test_service_health(RAG_URL, "RAG"),
            test_service_health(GUARDRAILS_URL, "Guardrails")
        ])),
        ("Core Functionality", lambda: all([
            test_concierge_chat(),
            test_rag_search(),
        ])),
        ("Safety Features", lambda: all([
            test_guardrails_content_safety(),
            test_guardrails_pii_detection(),
        ])),
        ("Monitoring", lambda: test_metrics_endpoint()),
        ("Performance", lambda: test_response_time()),
    ]
    
    results = []
    for category, test_func in tests:
        print(f"\n{Colors.YELLOW}Running {category}...{Colors.END}")
        result = test_func()
        results.append(result)
        print()
    
    # Summary
    print("="*60)
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"{Colors.GREEN}✓ ALL TESTS PASSED ({passed}/{total}){Colors.END}")
        print("="*60 + "\n")
        return 0
    else:
        print(f"{Colors.RED}✗ SOME TESTS FAILED ({passed}/{total}){Colors.END}")
        print("="*60 + "\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
