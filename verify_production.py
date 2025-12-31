#!/usr/bin/env python3
"""
Production API Verification Script
Purpose: Verify all 17 endpoints are working in production
Created: December 28, 2025 - Phase 8 Production Deployment
"""

import os
import sys
import time
import json
import subprocess
import signal
from typing import Dict, List, Tuple
import requests
from requests.exceptions import ConnectionError, Timeout

# Configuration
API_BASE_URL = "http://127.0.0.1:8888"
API_TIMEOUT = 5
STARTUP_TIMEOUT = 30

class ProductionVerification:
    """Verify production API deployment"""
    
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.server_process = None
        self.results = {
            "health_endpoints": [],
            "campaign_endpoints": [],
            "user_endpoints": [],
            "admin_endpoints": [],
            "analytics_endpoints": [],
            "summary": {}
        }
    
    def start_server(self) -> bool:
        """Start the FastAPI server"""
        try:
            print("▶ Starting API server...")
            
            # Set environment variables
            env = os.environ.copy()
            env['DB_HOST'] = 'localhost'
            env['DB_PORT'] = '5432'
            env['DB_USER'] = 'postgres'
            env['DB_PASSWORD'] = 'postgres'
            env['DB_NAME'] = 'swipesavvy_agents'
            
            # Start server
            script_dir = os.path.dirname(os.path.abspath(__file__))
            app_dir = os.path.join(script_dir, 'swipesavvy-mobile-app')
            
            self.server_process = subprocess.Popen(
                ['python', 'main.py'],
                cwd=app_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid
            )
            
            print("✅ Server process started (PID: {})".format(self.server_process.pid))
            
            # Wait for server to be ready
            return self.wait_for_server()
            
        except Exception as e:
            print(f"❌ Failed to start server: {str(e)}")
            return False
    
    def wait_for_server(self, timeout: int = STARTUP_TIMEOUT) -> bool:
        """Wait for server to start"""
        print(f"▶ Waiting for server to start (timeout: {timeout}s)...")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f"{self.base_url}/", timeout=1)
                if response.status_code < 500:
                    print("✅ Server is ready")
                    return True
            except (ConnectionError, Timeout):
                time.sleep(0.5)
        
        print("❌ Server did not start within timeout")
        return False
    
    def stop_server(self):
        """Stop the FastAPI server"""
        if self.server_process:
            try:
                os.killpg(os.getpgid(self.server_process.pid), signal.SIGTERM)
                print("✅ Server stopped")
            except:
                pass
    
    def test_endpoint(self, method: str, path: str, name: str, 
                     expected_status: int = 200) -> Tuple[bool, Dict]:
        """Test a single endpoint"""
        try:
            url = f"{self.base_url}{path}"
            
            if method.upper() == "GET":
                response = requests.get(url, timeout=API_TIMEOUT)
            else:
                response = requests.post(url, timeout=API_TIMEOUT)
            
            success = response.status_code in [200, 201, expected_status]
            result = {
                "name": name,
                "path": path,
                "method": method,
                "status": response.status_code,
                "success": success,
                "response_time_ms": response.elapsed.total_seconds() * 1000
            }
            
            return success, result
            
        except Exception as e:
            return False, {
                "name": name,
                "path": path,
                "method": method,
                "error": str(e),
                "success": False
            }
    
    def run_verification(self) -> bool:
        """Run complete verification suite"""
        print("\n" + "═" * 80)
        print("Production API Verification Suite")
        print("═" * 80 + "\n")
        
        # Start server
        if not self.start_server():
            return False
        
        time.sleep(2)  # Extra wait time
        
        # Define endpoints to test (17 total)
        endpoints = {
            "health_endpoints": [
                ("GET", "/health", "Health Check"),
                ("GET", "/api/phase4/health", "Phase 4 Health Check"),
                ("GET", "/", "Root Endpoint"),
            ],
            "campaign_endpoints": [
                ("GET", "/api/campaigns", "List Campaigns"),
                ("GET", "/api/campaigns/1", "Get Campaign"),
                ("POST", "/api/campaigns", "Create Campaign"),
                ("PUT", "/api/campaigns/1", "Update Campaign"),
                ("DELETE", "/api/campaigns/1", "Delete Campaign"),
                ("GET", "/api/campaigns/1/performance", "Campaign Performance"),
                ("GET", "/api/campaigns/stats", "Campaign Stats"),
            ],
            "user_endpoints": [
                ("GET", "/api/users", "List Users"),
                ("GET", "/api/users/1", "Get User"),
                ("POST", "/api/users", "Create User"),
                ("PUT", "/api/users/1", "Update User"),
                ("GET", "/api/users/1/accounts", "User Accounts"),
                ("GET", "/api/users/1/transactions", "User Transactions"),
            ],
            "admin_endpoints": [
                ("GET", "/api/admin/health", "Admin Health"),
                ("GET", "/api/admin/users", "Admin Users List"),
                ("GET", "/api/admin/audit-logs", "Audit Logs"),
            ]
        }
        
        # Run tests
        print("▶ Testing Health Endpoints...")
        for method, path, name in endpoints["health_endpoints"]:
            success, result = self.test_endpoint(method, path, name)
            self.results["health_endpoints"].append(result)
            status = "✅" if success else "❌"
            print(f"  {status} {name:40} {result['status']:3d}  {result.get('response_time_ms', 'N/A'):.1f}ms")
        
        print("\n▶ Testing Campaign Endpoints...")
        for method, path, name in endpoints["campaign_endpoints"]:
            success, result = self.test_endpoint(method, path, name)
            self.results["campaign_endpoints"].append(result)
            status = "✅" if success else "❌"
            print(f"  {status} {name:40} {result.get('status', 'ERR'):3} {result.get('response_time_ms', 0):.1f}ms")
        
        print("\n▶ Testing User Endpoints...")
        for method, path, name in endpoints["user_endpoints"]:
            success, result = self.test_endpoint(method, path, name)
            self.results["user_endpoints"].append(result)
            status = "✅" if success else "❌"
            print(f"  {status} {name:40} {result.get('status', 'ERR'):3} {result.get('response_time_ms', 0):.1f}ms")
        
        print("\n▶ Testing Admin Endpoints...")
        for method, path, name in endpoints["admin_endpoints"]:
            success, result = self.test_endpoint(method, path, name)
            self.results["admin_endpoints"].append(result)
            status = "✅" if success else "❌"
            print(f"  {status} {name:40} {result.get('status', 'ERR'):3} {result.get('response_time_ms', 0):.1f}ms")
        
        # Test analytics endpoints
        print("\n▶ Testing Analytics Endpoints...")
        analytics_endpoints = [
            ("GET", "/api/analytics/campaigns/count", "Campaigns Count"),
            ("GET", "/api/analytics/health", "Analytics Health"),
            ("GET", "/api/ab-tests/count", "A/B Tests Count"),
            ("GET", "/api/optimize/affinity/summary", "Affinity Summary"),
        ]
        
        for method, path, name in analytics_endpoints:
            success, result = self.test_endpoint(method, path, name)
            self.results["analytics_endpoints"].append(result)
            status = "✅" if success else "❌"
            print(f"  {status} {name:40} {result.get('status', 'ERR'):3} {result.get('response_time_ms', 0):.1f}ms")
        
        # Calculate summary
        all_results = (
            self.results["health_endpoints"] +
            self.results["campaign_endpoints"] +
            self.results["user_endpoints"] +
            self.results["admin_endpoints"] +
            self.results["analytics_endpoints"]
        )
        
        passed = sum(1 for r in all_results if r.get('success'))
        total = len(all_results)
        
        self.results["summary"] = {
            "total_endpoints": total,
            "passed": passed,
            "failed": total - passed,
            "success_rate": (passed / total * 100) if total > 0 else 0
        }
        
        # Print summary
        print("\n" + "═" * 80)
        print("Verification Summary")
        print("═" * 80)
        print(f"Total Endpoints Tested: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {self.results['summary']['success_rate']:.1f}%")
        print("═" * 80)
        
        # Cleanup
        self.stop_server()
        
        return self.results["summary"]["success_rate"] >= 90.0


def main():
    """Main entry point"""
    
    verification = ProductionVerification()
    
    try:
        success = verification.run_verification()
        
        # Save results to file
        results_file = "/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/PRODUCTION_VERIFICATION_RESULTS.json"
        with open(results_file, 'w') as f:
            json.dump(verification.results, f, indent=2)
        
        print(f"\n✅ Results saved to {results_file}")
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        verification.stop_server()
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Verification failed: {str(e)}")
        verification.stop_server()
        sys.exit(1)


if __name__ == "__main__":
    main()
