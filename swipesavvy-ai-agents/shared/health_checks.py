"""
Enhanced health check endpoints for production readiness
"""

from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import Dict, Any
import time
import psutil
import os

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: float
    version: str
    uptime: float
    

class ReadinessResponse(BaseModel):
    """Readiness check response"""
    ready: bool
    checks: Dict[str, Any]
    timestamp: float


class LivenessResponse(BaseModel):
    """Liveness check response"""
    alive: bool
    timestamp: float
    memory_usage_mb: float
    cpu_percent: float


# Track service start time
START_TIME = time.time()


@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check():
    """Basic health check - service is running"""
    return HealthResponse(
        status="healthy",
        timestamp=time.time(),
        version=os.getenv("SERVICE_VERSION", "1.0.0-alpha"),
        uptime=time.time() - START_TIME
    )


@router.get("/ready", response_model=ReadinessResponse)
async def readiness_check():
    """
    Readiness check - service is ready to accept traffic
    Override this in each service to check dependencies
    """
    checks = {
        "service": "ready"
    }
    
    all_ready = all(v == "ready" or v is True for v in checks.values())
    
    return ReadinessResponse(
        ready=all_ready,
        checks=checks,
        timestamp=time.time()
    )


@router.get("/live", response_model=LivenessResponse, status_code=status.HTTP_200_OK)
async def liveness_check():
    """Liveness check - service is alive and responsive"""
    process = psutil.Process()
    
    return LivenessResponse(
        alive=True,
        timestamp=time.time(),
        memory_usage_mb=process.memory_info().rss / 1024 / 1024,
        cpu_percent=process.cpu_percent(interval=0.1)
    )


@router.get("/metrics")
async def metrics():
    """Prometheus-compatible metrics endpoint"""
    process = psutil.Process()
    uptime = time.time() - START_TIME
    
    metrics_text = f"""# HELP service_uptime_seconds Service uptime in seconds
# TYPE service_uptime_seconds gauge
service_uptime_seconds {uptime}

# HELP process_memory_bytes Memory usage in bytes
# TYPE process_memory_bytes gauge
process_memory_bytes {process.memory_info().rss}

# HELP process_cpu_percent CPU usage percentage
# TYPE process_cpu_percent gauge
process_cpu_percent {process.cpu_percent(interval=0.1)}

# HELP process_threads Number of threads
# TYPE process_threads gauge
process_threads {process.num_threads()}
"""
    
    return metrics_text
