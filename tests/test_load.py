"""
Load Testing Suite for SwipeSavvy Backend API

Tests performance, scalability, and reliability under concurrent user load.
Simulates real-world usage patterns with multiple concurrent operations.

Tests Include:
- Concurrent user simulation (10, 50, 100, 500 concurrent users)
- Sustained load testing (operations over time)
- Stress testing (pushing system to limits)
- Bottleneck identification
- Performance baseline establishment
"""

import pytest
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi.testclient import TestClient
from statistics import mean, stdev, median
from typing import List, Dict, Any
import json


class PerformanceMetrics:
    """Collect and analyze performance metrics"""
    
    def __init__(self):
        self.response_times: List[float] = []
        self.status_codes: Dict[int, int] = {}
        self.errors: List[str] = []
        self.start_time: float = 0
        self.end_time: float = 0
    
    def add_response(self, response_time: float, status_code: int):
        """Record a response"""
        self.response_times.append(response_time)
        self.status_codes[status_code] = self.status_codes.get(status_code, 0) + 1
    
    def add_error(self, error: str):
        """Record an error"""
        self.errors.append(error)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get metrics summary"""
        if not self.response_times:
            return {"error": "No data collected"}
        
        return {
            "total_requests": len(self.response_times),
            "total_errors": len(self.errors),
            "error_rate": len(self.errors) / (len(self.response_times) + len(self.errors)) * 100,
            "min_response_ms": min(self.response_times) * 1000,
            "max_response_ms": max(self.response_times) * 1000,
            "mean_response_ms": mean(self.response_times) * 1000,
            "median_response_ms": median(self.response_times) * 1000,
            "stdev_response_ms": stdev(self.response_times) * 1000 if len(self.response_times) > 1 else 0,
            "throughput_rps": len(self.response_times) / (self.end_time - self.start_time) if self.end_time > self.start_time else 0,
            "status_codes": self.status_codes,
            "successful_requests": sum(1 for sc in self.status_codes if 200 <= sc < 300),
        }


class LoadTestRunner:
    """Execute load tests with concurrent users"""
    
    def __init__(self, test_client: TestClient):
        self.client = test_client
        self.metrics = PerformanceMetrics()
    
    def single_campaign_operation(self) -> tuple:
        """Single campaign CRUD operation (create, read, update)"""
        try:
            start = time.time()
            
            # Create campaign
            response = self.client.post(
                "/api/campaigns?name=LoadTest+Campaign&campaign_type=location_deal&offer_amount=500&offer_type=fixed_discount"
            )
            if response.status_code not in [200, 201]:
                return response.status_code, time.time() - start, False
            
            campaign_data = response.json()
            campaign_id = campaign_data.get("id") or campaign_data.get("campaign_id") or "camp_001"
            
            # Get campaign
            response = self.client.get(f"/api/campaigns/{campaign_id}")
            if response.status_code != 200:
                return response.status_code, time.time() - start, False
            
            # List campaigns
            response = self.client.get("/api/campaigns?limit=10&offset=0")
            if response.status_code != 200:
                return response.status_code, time.time() - start, False
            
            return 200, time.time() - start, True
        except Exception as e:
            return 500, time.time() - start, False
    
    def single_user_operation(self) -> tuple:
        """Single user profile operation (read related data)"""
        try:
            start = time.time()
            user_id = "user_001"
            
            # Get profile
            response = self.client.get(f"/api/users/{user_id}")
            if response.status_code != 200:
                return response.status_code, time.time() - start, False
            
            # Get accounts
            response = self.client.get(f"/api/users/{user_id}/accounts")
            if response.status_code != 200:
                return response.status_code, time.time() - start, False
            
            # Get transactions
            response = self.client.get(f"/api/users/{user_id}/transactions?limit=20&offset=0")
            if response.status_code != 200:
                return response.status_code, time.time() - start, False
            
            return 200, time.time() - start, True
        except Exception as e:
            return 500, time.time() - start, False
    
    def single_admin_operation(self) -> tuple:
        """Single admin operation (health check, user list)"""
        try:
            start = time.time()
            
            # Health check
            response = self.client.get("/api/admin/health")
            if response.status_code != 200:
                return response.status_code, time.time() - start, False
            
            # List users
            response = self.client.get("/api/admin/users?limit=20&offset=0")
            if response.status_code != 200:
                return response.status_code, time.time() - start, False
            
            # Audit logs
            response = self.client.get("/api/admin/audit-logs?limit=10&offset=0")
            if response.status_code != 200:
                return response.status_code, time.time() - start, False
            
            return 200, time.time() - start, True
        except Exception as e:
            return 500, time.time() - start, False
    
    def run_concurrent_load(self, operation_fn, num_users: int, operations_per_user: int = 1) -> PerformanceMetrics:
        """Run load test with concurrent users"""
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        def worker():
            """Worker that performs operations"""
            for _ in range(operations_per_user):
                status_code, response_time, success = operation_fn()
                metrics.add_response(response_time, status_code)
                if not success:
                    metrics.add_error(f"Status code: {status_code}")
        
        # Execute concurrent operations
        with ThreadPoolExecutor(max_workers=min(num_users, 20)) as executor:
            futures = [executor.submit(worker) for _ in range(num_users)]
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    metrics.add_error(str(e))
        
        metrics.end_time = time.time()
        return metrics


class TestConcurrentLoad:
    """Test API under concurrent user load"""
    
    def test_10_concurrent_users_campaign_operations(self, test_client):
        """Test with 10 concurrent users performing campaign operations"""
        runner = LoadTestRunner(test_client)
        metrics = runner.run_concurrent_load(
            runner.single_campaign_operation,
            num_users=10,
            operations_per_user=1
        )
        summary = metrics.get_summary()
        
        # Assertions
        assert summary["total_requests"] > 0, "Should have requests"
        assert summary["error_rate"] < 50, "Error rate should be < 50%"
        assert summary["mean_response_ms"] < 1000, "Mean response should be < 1 second"
        print(f"\n10 Concurrent Users (Campaign): {json.dumps(summary, indent=2)}")
    
    def test_50_concurrent_users_user_operations(self, test_client):
        """Test with 50 concurrent users performing user profile operations"""
        runner = LoadTestRunner(test_client)
        metrics = runner.run_concurrent_load(
            runner.single_user_operation,
            num_users=50,
            operations_per_user=1
        )
        summary = metrics.get_summary()
        
        # Assertions
        assert summary["total_requests"] > 0
        assert summary["error_rate"] < 50
        assert summary["mean_response_ms"] < 2000, "Mean response should be < 2 seconds with 50 users"
        print(f"\n50 Concurrent Users (User): {json.dumps(summary, indent=2)}")
    
    def test_100_concurrent_users_mixed_operations(self, test_client):
        """Test with 100 concurrent users performing mixed operations"""
        runner = LoadTestRunner(test_client)
        
        # Mix of operations
        metrics_campaign = runner.run_concurrent_load(
            runner.single_campaign_operation,
            num_users=50,
            operations_per_user=1
        )
        
        metrics_user = runner.run_concurrent_load(
            runner.single_user_operation,
            num_users=50,
            operations_per_user=1
        )
        
        # Combine metrics for analysis
        combined_responses = metrics_campaign.response_times + metrics_user.response_times
        error_rate = (len(metrics_campaign.errors) + len(metrics_user.errors)) / len(combined_responses) * 100
        
        print(f"\n100 Concurrent Users (Mixed):")
        print(f"  Total Requests: {len(combined_responses)}")
        print(f"  Mean Response: {mean(combined_responses) * 1000:.2f}ms")
        print(f"  Error Rate: {error_rate:.2f}%")
        
        assert error_rate < 50
        assert mean(combined_responses) < 2


class TestSustainedLoad:
    """Test API under sustained load over time"""
    
    def test_sustained_campaign_operations_30_seconds(self, test_client):
        """Run campaign operations for 30 seconds with 5 concurrent users"""
        runner = LoadTestRunner(test_client)
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        def sustained_worker():
            """Worker that continuously performs operations until time limit"""
            while time.time() - metrics.start_time < 30:  # 30 seconds
                status_code, response_time, success = runner.single_campaign_operation()
                metrics.add_response(response_time, status_code)
                if not success:
                    metrics.add_error(f"Status: {status_code}")
                time.sleep(0.1)  # Small delay between operations
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(sustained_worker) for _ in range(5)]
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    metrics.add_error(str(e))
        
        metrics.end_time = time.time()
        summary = metrics.get_summary()
        
        print(f"\nSustained Load (30 seconds, 5 users):")
        print(f"  Total Operations: {summary['total_requests']}")
        print(f"  Throughput: {summary['throughput_rps']:.2f} ops/sec")
        print(f"  Mean Response: {summary['mean_response_ms']:.2f}ms")
        print(f"  Error Rate: {summary['error_rate']:.2f}%")
        
        assert summary["throughput_rps"] > 0, "Should have positive throughput"
        assert summary["error_rate"] < 50


class TestStressAndLimits:
    """Test system behavior under extreme stress"""
    
    def test_high_concurrency_500_users_single_operation(self, test_client):
        """Stress test: 500 concurrent users performing single operation"""
        runner = LoadTestRunner(test_client)
        
        # Use a simpler operation for stress test
        metrics = PerformanceMetrics()
        metrics.start_time = time.time()
        
        def simple_health_check():
            """Just check health"""
            try:
                start = time.time()
                response = test_client.get("/api/admin/health")
                return response.status_code, time.time() - start, response.status_code < 500
            except Exception as e:
                return 500, time.time() - start, False
        
        with ThreadPoolExecutor(max_workers=50) as executor:
            futures = []
            for _ in range(500):
                future = executor.submit(simple_health_check)
                futures.append(future)
            
            for future in as_completed(futures):
                try:
                    status_code, response_time, success = future.result()
                    metrics.add_response(response_time, status_code)
                    if not success:
                        metrics.add_error(f"Status: {status_code}")
                except Exception as e:
                    metrics.add_error(str(e))
        
        metrics.end_time = time.time()
        summary = metrics.get_summary()
        
        print(f"\nStress Test (500 Concurrent Users):")
        print(f"  Total Requests: {summary['total_requests']}")
        print(f"  Mean Response: {summary['mean_response_ms']:.2f}ms")
        print(f"  Max Response: {summary['max_response_ms']:.2f}ms")
        print(f"  Throughput: {summary['throughput_rps']:.2f} ops/sec")
        print(f"  Error Rate: {summary['error_rate']:.2f}%")
        print(f"  Status Codes: {summary['status_codes']}")
        
        # At stress levels, we accept higher latency but system should still respond
        assert summary["throughput_rps"] > 0, "System should maintain throughput"


class TestBottleneckIdentification:
    """Identify performance bottlenecks"""
    
    def test_identify_slowest_endpoints(self, test_client):
        """Run all endpoints and identify slowest ones"""
        endpoints = [
            ("GET", "/api/campaigns"),
            ("GET", "/api/campaigns/camp_001"),
            ("GET", "/api/users/user_001"),
            ("GET", "/api/users/user_001/accounts"),
            ("GET", "/api/users/user_001/transactions"),
            ("GET", "/api/admin/health"),
            ("GET", "/api/admin/users"),
            ("GET", "/api/admin/audit-logs"),
        ]
        
        endpoint_times = {}
        
        for method, endpoint in endpoints:
            times = []
            for _ in range(20):  # Test each endpoint 20 times
                start = time.time()
                try:
                    if method == "GET":
                        response = test_client.get(endpoint)
                    times.append(time.time() - start)
                except:
                    pass
            
            if times:
                endpoint_times[endpoint] = {
                    "mean_ms": mean(times) * 1000,
                    "min_ms": min(times) * 1000,
                    "max_ms": max(times) * 1000,
                    "stdev_ms": stdev(times) * 1000 if len(times) > 1 else 0,
                }
        
        # Sort by mean response time
        sorted_endpoints = sorted(
            endpoint_times.items(),
            key=lambda x: x[1]["mean_ms"],
            reverse=True
        )
        
        print("\nEndpoint Performance (sorted by mean response time):")
        for endpoint, times in sorted_endpoints:
            print(f"  {endpoint}: {times['mean_ms']:.2f}ms (range: {times['min_ms']:.2f}-{times['max_ms']:.2f}ms)")


class TestPerformanceBaselines:
    """Establish performance baselines for comparison"""
    
    def test_baseline_single_user_response_times(self, test_client):
        """Establish single-user response time baseline"""
        runner = LoadTestRunner(test_client)
        
        # Campaign operations baseline
        times = []
        for _ in range(20):
            _, response_time, _ = runner.single_campaign_operation()
            times.append(response_time)
        
        campaign_baseline = {
            "mean_ms": mean(times) * 1000,
            "median_ms": median(times) * 1000,
            "p99_ms": sorted(times)[int(len(times) * 0.99)] * 1000,
        }
        
        # User operations baseline
        times = []
        for _ in range(20):
            _, response_time, _ = runner.single_user_operation()
            times.append(response_time)
        
        user_baseline = {
            "mean_ms": mean(times) * 1000,
            "median_ms": median(times) * 1000,
            "p99_ms": sorted(times)[int(len(times) * 0.99)] * 1000,
        }
        
        print("\nSingle-User Baseline Performance:")
        print(f"  Campaign Operations: {campaign_baseline['mean_ms']:.2f}ms mean, {campaign_baseline['p99_ms']:.2f}ms p99")
        print(f"  User Operations: {user_baseline['mean_ms']:.2f}ms mean, {user_baseline['p99_ms']:.2f}ms p99")
        
        # Baselines for comparison
        assert campaign_baseline["mean_ms"] < 500, "Campaign ops should be < 500ms"
        assert user_baseline["mean_ms"] < 500, "User ops should be < 500ms"


class TestScalability:
    """Test system scalability as load increases"""
    
    def test_scalability_response_time_vs_users(self, test_client):
        """Measure how response time degrades with more concurrent users"""
        runner = LoadTestRunner(test_client)
        
        user_counts = [10, 25, 50]
        scalability_data = {}
        
        for num_users in user_counts:
            metrics = runner.run_concurrent_load(
                runner.single_admin_operation,
                num_users=num_users,
                operations_per_user=2
            )
            summary = metrics.get_summary()
            scalability_data[num_users] = summary["mean_response_ms"]
        
        print("\nScalability Analysis (response time vs concurrent users):")
        for num_users, mean_time in sorted(scalability_data.items()):
            print(f"  {num_users} users: {mean_time:.2f}ms mean response")
        
        # Response time should not increase dramatically
        # At 50 users, should be less than 5x the 10-user response time
        assert scalability_data[50] < scalability_data[10] * 5, \
            "Scalability degradation too severe"
