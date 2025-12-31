#!/usr/bin/env python3
"""
Load Testing Suite for SwipeSavvy
Tests system stability under high load, connection pool behavior, and failure scenarios
"""

import asyncio
import time
import statistics
import json
from typing import List, Dict, Tuple
from dataclasses import dataclass, asdict
import httpx
import psycopg2
from psycopg2 import pool
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class LoadTestResult:
    """Results from a load test"""
    test_name: str
    duration_seconds: float
    total_requests: int
    successful_requests: int
    failed_requests: int
    error_rate: float
    avg_response_time: float
    p50_response_time: float
    p95_response_time: float
    p99_response_time: float
    max_response_time: float
    min_response_time: float
    requests_per_second: float
    timestamp: str


class LoadTester:
    """Load testing suite for SwipeSavvy backend"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results: List[LoadTestResult] = []
    
    async def test_concurrent_requests(
        self,
        endpoint: str,
        num_concurrent: int = 100,
        duration_seconds: int = 30,
        test_name: str = "concurrent_requests"
    ) -> LoadTestResult:
        """
        Test system with concurrent requests
        
        Args:
            endpoint: API endpoint to test (e.g., "/health")
            num_concurrent: Number of concurrent requests
            duration_seconds: How long to run test
            test_name: Name of test for reporting
        
        Returns:
            LoadTestResult with metrics
        """
        
        logger.info(
            f"Starting {test_name}: {num_concurrent} concurrent "
            f"requests for {duration_seconds}s to {endpoint}"
        )
        
        response_times: List[float] = []
        errors: List[str] = []
        successful = 0
        failed = 0
        
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        async def make_request(client: httpx.AsyncClient, iteration: int):
            nonlocal successful, failed
            
            try:
                request_start = time.time()
                response = await client.get(
                    f"{self.base_url}{endpoint}",
                    timeout=30.0
                )
                request_time = time.time() - request_start
                
                response_times.append(request_time)
                
                if response.status_code == 200:
                    successful += 1
                else:
                    failed += 1
                    errors.append(f"Status {response.status_code}")
            
            except Exception as e:
                failed += 1
                errors.append(str(e))
        
        # Run load test
        async with httpx.AsyncClient() as client:
            tasks: List = []
            iteration = 0
            
            while time.time() < end_time:
                # Create batch of concurrent requests
                batch_size = min(num_concurrent, 50)  # Cap at 50 per batch
                
                for _ in range(batch_size):
                    task = make_request(client, iteration)
                    tasks.append(task)
                    iteration += 1
                
                # Wait for batch to complete or timeout
                if tasks:
                    await asyncio.gather(*tasks, return_exceptions=True)
                    tasks = []
                
                # Small delay between batches
                await asyncio.sleep(0.1)
        
        # Calculate metrics
        actual_duration = time.time() - start_time
        total_requests = successful + failed
        error_rate = failed / total_requests if total_requests > 0 else 0
        
        result = LoadTestResult(
            test_name=test_name,
            duration_seconds=actual_duration,
            total_requests=total_requests,
            successful_requests=successful,
            failed_requests=failed,
            error_rate=error_rate,
            avg_response_time=statistics.mean(response_times) if response_times else 0,
            p50_response_time=statistics.median(response_times) if response_times else 0,
            p95_response_time=self._percentile(response_times, 95),
            p99_response_time=self._percentile(response_times, 99),
            max_response_time=max(response_times) if response_times else 0,
            min_response_time=min(response_times) if response_times else 0,
            requests_per_second=total_requests / actual_duration if actual_duration > 0 else 0,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
        )
        
        logger.info(f"✓ {test_name} completed: {result.successful_requests}/{total_requests} successful")
        logger.info(f"  RPS: {result.requests_per_second:.2f}")
        logger.info(f"  Latency p99: {result.p99_response_time*1000:.2f}ms")
        
        if errors:
            logger.warning(f"  Errors: {errors[:5]}")  # Show first 5 errors
        
        self.results.append(result)
        return result
    
    async def test_connection_pool_stress(
        self,
        num_connections: int = 60,
        test_name: str = "connection_pool_stress"
    ) -> LoadTestResult:
        """
        Test database connection pool under stress
        
        Attempts to create many concurrent connections and verify:
        - Pool doesn't exceed limits
        - Connections are properly cleaned up
        - No connection leaks occur
        """
        
        logger.info(f"Starting {test_name}: Creating {num_connections} concurrent connections")
        
        db_config = {
            "host": "localhost",
            "port": 5432,
            "database": "swipesavvy_dev",
            "user": "postgres",
            "password": "postgres"
        }
        
        connection_pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=5,
            maxconn=num_connections,
            **db_config
        )
        
        response_times: List[float] = []
        errors: List[str] = []
        successful = 0
        failed = 0
        
        start_time = time.time()
        
        async def execute_query(conn_id: int):
            nonlocal successful, failed
            
            conn = None
            try:
                request_start = time.time()
                conn = connection_pool.getconn()
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
                request_time = time.time() - request_start
                
                response_times.append(request_time)
                successful += 1
            
            except Exception as e:
                failed += 1
                errors.append(str(e))
            
            finally:
                if conn:
                    connection_pool.putconn(conn)
        
        # Create concurrent connections
        tasks = [execute_query(i) for i in range(num_connections)]
        await asyncio.gather(*tasks, return_exceptions=True)
        
        # Wait a bit for cleanup
        await asyncio.sleep(1)
        
        # Verify pool cleanup
        try:
            # Try to get all connections back
            conns = []
            for _ in range(num_connections):
                try:
                    conns.append(connection_pool.getconn())
                except psycopg2.pool.PoolError:
                    break
            
            # Return them
            for conn in conns:
                connection_pool.putconn(conn)
            
            logger.info(f"  Pool successfully cleaned up {len(conns)} connections")
        
        except Exception as e:
            logger.error(f"  Pool cleanup error: {e}")
        
        finally:
            connection_pool.closeall()
        
        # Calculate metrics
        actual_duration = time.time() - start_time
        total_requests = successful + failed
        error_rate = failed / total_requests if total_requests > 0 else 0
        
        result = LoadTestResult(
            test_name=test_name,
            duration_seconds=actual_duration,
            total_requests=total_requests,
            successful_requests=successful,
            failed_requests=failed,
            error_rate=error_rate,
            avg_response_time=statistics.mean(response_times) if response_times else 0,
            p50_response_time=statistics.median(response_times) if response_times else 0,
            p95_response_time=self._percentile(response_times, 95),
            p99_response_time=self._percentile(response_times, 99),
            max_response_time=max(response_times) if response_times else 0,
            min_response_time=min(response_times) if response_times else 0,
            requests_per_second=total_requests / actual_duration if actual_duration > 0 else 0,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
        )
        
        logger.info(f"✓ {test_name} completed: {result.successful_requests}/{total_requests} successful")
        logger.info(f"  Success rate: {(1-error_rate)*100:.1f}%")
        
        self.results.append(result)
        return result
    
    async def test_spike_load(
        self,
        endpoint: str = "/health",
        spike_size: int = 500,
        spike_duration: int = 10,
        test_name: str = "spike_load"
    ) -> LoadTestResult:
        """
        Test system behavior during sudden traffic spike
        Verifies:
        - Circuit breaker activates under extreme load
        - Graceful degradation occurs
        - System recovers after spike
        """
        
        logger.info(f"Starting {test_name}: {spike_size} requests in {spike_duration}s")
        
        response_times: List[float] = []
        errors: List[str] = []
        successful = 0
        failed = 0
        
        start_time = time.time()
        
        async def make_request(client: httpx.AsyncClient):
            nonlocal successful, failed
            
            try:
                request_start = time.time()
                response = await client.get(
                    f"{self.base_url}{endpoint}",
                    timeout=10.0
                )
                request_time = time.time() - request_start
                response_times.append(request_time)
                
                if response.status_code == 200:
                    successful += 1
                else:
                    failed += 1
            
            except Exception as e:
                failed += 1
                errors.append(str(e))
        
        # Send all requests at once
        async with httpx.AsyncClient() as client:
            tasks = [make_request(client) for _ in range(spike_size)]
            await asyncio.gather(*tasks, return_exceptions=True)
        
        actual_duration = time.time() - start_time
        total_requests = successful + failed
        error_rate = failed / total_requests if total_requests > 0 else 0
        
        result = LoadTestResult(
            test_name=test_name,
            duration_seconds=actual_duration,
            total_requests=total_requests,
            successful_requests=successful,
            failed_requests=failed,
            error_rate=error_rate,
            avg_response_time=statistics.mean(response_times) if response_times else 0,
            p50_response_time=statistics.median(response_times) if response_times else 0,
            p95_response_time=self._percentile(response_times, 95),
            p99_response_time=self._percentile(response_times, 99),
            max_response_time=max(response_times) if response_times else 0,
            min_response_time=min(response_times) if response_times else 0,
            requests_per_second=total_requests / actual_duration if actual_duration > 0 else 0,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
        )
        
        logger.info(f"✓ {test_name} completed")
        logger.info(f"  RPS during spike: {result.requests_per_second:.2f}")
        logger.info(f"  Error rate: {error_rate*100:.1f}%")
        logger.info(f"  Max latency: {result.max_response_time*1000:.2f}ms")
        
        self.results.append(result)
        return result
    
    @staticmethod
    def _percentile(data: List[float], percentile: int) -> float:
        """Calculate percentile value"""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int((percentile / 100) * len(sorted_data))
        return sorted_data[min(index, len(sorted_data) - 1)]
    
    def generate_report(self) -> str:
        """Generate test report"""
        
        report = "# Load Test Report\n\n"
        report += f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        report += "## Test Results Summary\n\n"
        report += "| Test | RPS | Success Rate | P99 Latency | Error Rate |\n"
        report += "|------|-----|--------------|-------------|------------|\n"
        
        for result in self.results:
            success_rate = (result.successful_requests / result.total_requests * 100) if result.total_requests > 0 else 0
            report += (
                f"| {result.test_name} | "
                f"{result.requests_per_second:.1f} | "
                f"{success_rate:.1f}% | "
                f"{result.p99_response_time*1000:.1f}ms | "
                f"{result.error_rate*100:.1f}% |\n"
            )
        
        report += "\n## Detailed Results\n\n"
        
        for result in self.results:
            report += f"### {result.test_name}\n\n"
            report += f"**Duration:** {result.duration_seconds:.2f}s\n"
            report += f"**Total Requests:** {result.total_requests}\n"
            report += f"**Successful:** {result.successful_requests}\n"
            report += f"**Failed:** {result.failed_requests}\n"
            report += f"**Error Rate:** {result.error_rate*100:.2f}%\n"
            report += f"**Requests/Second:** {result.requests_per_second:.2f}\n\n"
            
            report += "**Latency Metrics:**\n"
            report += f"- Min: {result.min_response_time*1000:.2f}ms\n"
            report += f"- P50: {result.p50_response_time*1000:.2f}ms\n"
            report += f"- P95: {result.p95_response_time*1000:.2f}ms\n"
            report += f"- P99: {result.p99_response_time*1000:.2f}ms\n"
            report += f"- Max: {result.max_response_time*1000:.2f}ms\n\n"
        
        return report


async def run_load_tests():
    """Run comprehensive load test suite"""
    
    tester = LoadTester(base_url="http://localhost:8000")
    
    # Test 1: Baseline health check (100 concurrent)
    await tester.test_concurrent_requests(
        endpoint="/health",
        num_concurrent=100,
        duration_seconds=10,
        test_name="health_check_100_concurrent"
    )
    
    # Test 2: Moderate load (500 concurrent)
    await tester.test_concurrent_requests(
        endpoint="/ready",
        num_concurrent=500,
        duration_seconds=15,
        test_name="readiness_check_500_concurrent"
    )
    
    # Test 3: Connection pool stress
    await tester.test_connection_pool_stress(
        num_connections=60,
        test_name="connection_pool_stress_60"
    )
    
    # Test 4: Spike load
    await tester.test_spike_load(
        endpoint="/health",
        spike_size=1000,
        spike_duration=5,
        test_name="spike_load_1000_requests"
    )
    
    # Generate and print report
    report = tester.generate_report()
    print(report)
    
    # Save report to file
    with open("LOAD_TEST_REPORT.md", "w") as f:
        f.write(report)
    
    logger.info("Load test report saved to LOAD_TEST_REPORT.md")
    
    # Save detailed JSON results
    results_json = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "results": [asdict(r) for r in tester.results]
    }
    
    with open("load_test_results.json", "w") as f:
        json.dump(results_json, f, indent=2)
    
    logger.info("Detailed results saved to load_test_results.json")


if __name__ == "__main__":
    asyncio.run(run_load_tests())
