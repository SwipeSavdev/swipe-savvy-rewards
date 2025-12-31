"""
Production Monitoring & Observability Module
Purpose: Configure logging, metrics, and alerting for production
Created: December 28, 2025 - Phase 8 Production Deployment
"""

import os
import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict

# ═════════════════════════════════════════════════════════════════════════════
# LOGGING CONFIGURATION
# ═════════════════════════════════════════════════════════════════════════════

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        log_obj = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_obj)


def setup_logging(
    log_level: str = "INFO",
    log_format: str = "json",
    log_file: Optional[str] = None
) -> logging.Logger:
    """
    Configure production logging
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Log format (json or standard)
        log_file: Path to log file (optional)
    
    Returns:
        Configured logger instance
    """
    
    logger = logging.getLogger("swipesavvy")
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(getattr(logging, log_level.upper()))
    
    if log_format == "json":
        console_handler.setFormatter(JSONFormatter())
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    
    # File handler (if path provided)
    if log_file:
        try:
            os.makedirs(os.path.dirname(log_file), exist_ok=True)
            file_handler = logging.FileHandler(log_file)
            file_handler.setLevel(getattr(logging, log_level.upper()))
            
            if log_format == "json":
                file_handler.setFormatter(JSONFormatter())
            else:
                formatter = logging.Formatter(
                    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
                )
                file_handler.setFormatter(formatter)
            
            logger.addHandler(file_handler)
        except Exception as e:
            logger.error(f"Failed to setup file logging: {str(e)}")
    
    return logger


# ═════════════════════════════════════════════════════════════════════════════
# PERFORMANCE METRICS
# ═════════════════════════════════════════════════════════════════════════════

@dataclass
class PerformanceMetrics:
    """Container for performance metrics"""
    
    timestamp: str
    endpoint: str
    method: str
    status_code: int
    response_time_ms: float
    request_size_bytes: int = 0
    response_size_bytes: int = 0
    error: Optional[str] = None
    user_id: Optional[str] = None
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(asdict(self))
    
    def is_slow(self, threshold_ms: float = 1000) -> bool:
        """Check if response is slower than threshold"""
        return self.response_time_ms > threshold_ms
    
    def is_error(self) -> bool:
        """Check if response indicates an error"""
        return self.status_code >= 400


@dataclass
class SystemMetrics:
    """Container for system-level metrics"""
    
    timestamp: str
    active_connections: int
    db_pool_size: int
    memory_usage_mb: float
    cpu_usage_percent: float
    total_requests: int
    total_errors: int
    avg_response_time_ms: float
    p99_response_time_ms: float
    error_rate: float
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(asdict(self))
    
    def is_healthy(self) -> bool:
        """Determine if system metrics are healthy"""
        return (
            self.error_rate < 1.0 and  # Less than 1% error rate
            self.avg_response_time_ms < 100 and  # Average <100ms
            self.memory_usage_mb < 512  # Memory <512MB
        )


class MetricsCollector:
    """Collect and aggregate performance metrics"""
    
    def __init__(self, logger: logging.Logger):
        """Initialize metrics collector"""
        self.logger = logger
        self.metrics: list[PerformanceMetrics] = []
        self.system_metrics: list[SystemMetrics] = []
    
    def record_request(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        response_time_ms: float,
        error: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> None:
        """Record a request metric"""
        metric = PerformanceMetrics(
            timestamp=datetime.utcnow().isoformat(),
            endpoint=endpoint,
            method=method,
            status_code=status_code,
            response_time_ms=response_time_ms,
            error=error,
            user_id=user_id
        )
        
        self.metrics.append(metric)
        
        # Log slow requests
        if metric.is_slow(threshold_ms=500):
            self.logger.warning(
                f"Slow request detected: {method} {endpoint} "
                f"({response_time_ms:.1f}ms)"
            )
        
        # Log errors
        if metric.is_error():
            self.logger.error(
                f"Request failed: {method} {endpoint} "
                f"({status_code}) - {error or 'Unknown error'}"
            )
    
    def record_system_metrics(
        self,
        active_connections: int,
        db_pool_size: int,
        memory_usage_mb: float,
        cpu_usage_percent: float,
        total_requests: int,
        total_errors: int,
        avg_response_time_ms: float,
        p99_response_time_ms: float
    ) -> None:
        """Record system-level metrics"""
        error_rate = (total_errors / max(total_requests, 1)) * 100
        
        metric = SystemMetrics(
            timestamp=datetime.utcnow().isoformat(),
            active_connections=active_connections,
            db_pool_size=db_pool_size,
            memory_usage_mb=memory_usage_mb,
            cpu_usage_percent=cpu_usage_percent,
            total_requests=total_requests,
            total_errors=total_errors,
            avg_response_time_ms=avg_response_time_ms,
            p99_response_time_ms=p99_response_time_ms,
            error_rate=error_rate
        )
        
        self.system_metrics.append(metric)
        
        # Check health
        if not metric.is_healthy():
            self.logger.warning(
                f"System metrics degraded: "
                f"Error rate {error_rate:.1f}%, "
                f"Avg response {avg_response_time_ms:.1f}ms"
            )
    
    def get_summary(self) -> Dict[str, Any]:
        """Get metrics summary"""
        if not self.metrics:
            return {"status": "no_metrics", "total_requests": 0}
        
        response_times = [m.response_time_ms for m in self.metrics]
        errors = sum(1 for m in self.metrics if m.is_error())
        
        return {
            "total_requests": len(self.metrics),
            "total_errors": errors,
            "error_rate_percent": (errors / len(self.metrics)) * 100,
            "response_time_stats": {
                "min_ms": min(response_times),
                "max_ms": max(response_times),
                "avg_ms": sum(response_times) / len(response_times),
                "p99_ms": sorted(response_times)[int(len(response_times) * 0.99)]
            }
        }


# ═════════════════════════════════════════════════════════════════════════════
# ALERTING
# ═════════════════════════════════════════════════════════════════════════════

@dataclass
class Alert:
    """Alert notification"""
    
    severity: str  # CRITICAL, WARNING, INFO
    title: str
    message: str
    timestamp: str
    details: Dict[str, Any]
    
    def to_json(self) -> str:
        """Convert to JSON"""
        return json.dumps(asdict(self))


class AlertManager:
    """Manage alerting based on metrics"""
    
    def __init__(self, logger: logging.Logger):
        """Initialize alert manager"""
        self.logger = logger
        self.alerts: list[Alert] = []
        self.thresholds = {
            "error_rate_percent": 5.0,
            "avg_response_time_ms": 1000.0,
            "p99_response_time_ms": 2000.0,
            "memory_usage_mb": 512.0
        }
    
    def check_metrics(self, metrics: SystemMetrics) -> list[Alert]:
        """Check metrics against thresholds and generate alerts"""
        new_alerts = []
        
        # Error rate check
        if metrics.error_rate > self.thresholds["error_rate_percent"]:
            alert = Alert(
                severity="CRITICAL",
                title="High Error Rate",
                message=f"Error rate is {metrics.error_rate:.1f}%",
                timestamp=metrics.timestamp,
                details={
                    "total_requests": metrics.total_requests,
                    "total_errors": metrics.total_errors,
                    "error_rate": metrics.error_rate
                }
            )
            new_alerts.append(alert)
            self.logger.error(f"ALERT: {alert.title} - {alert.message}")
        
        # Response time check
        if metrics.avg_response_time_ms > self.thresholds["avg_response_time_ms"]:
            alert = Alert(
                severity="WARNING",
                title="Slow Average Response Time",
                message=f"Average response time is {metrics.avg_response_time_ms:.1f}ms",
                timestamp=metrics.timestamp,
                details={
                    "avg_response_time_ms": metrics.avg_response_time_ms,
                    "p99_response_time_ms": metrics.p99_response_time_ms
                }
            )
            new_alerts.append(alert)
            self.logger.warning(f"ALERT: {alert.title}")
        
        # P99 latency check
        if metrics.p99_response_time_ms > self.thresholds["p99_response_time_ms"]:
            alert = Alert(
                severity="WARNING",
                title="High P99 Latency",
                message=f"P99 latency is {metrics.p99_response_time_ms:.1f}ms",
                timestamp=metrics.timestamp,
                details={
                    "p99_response_time_ms": metrics.p99_response_time_ms
                }
            )
            new_alerts.append(alert)
            self.logger.warning(f"ALERT: {alert.title}")
        
        # Memory check
        if metrics.memory_usage_mb > self.thresholds["memory_usage_mb"]:
            alert = Alert(
                severity="WARNING",
                title="High Memory Usage",
                message=f"Memory usage is {metrics.memory_usage_mb:.1f}MB",
                timestamp=metrics.timestamp,
                details={
                    "memory_usage_mb": metrics.memory_usage_mb
                }
            )
            new_alerts.append(alert)
            self.logger.warning(f"ALERT: {alert.title}")
        
        self.alerts.extend(new_alerts)
        return new_alerts
    
    def get_active_alerts(self) -> list[Alert]:
        """Get active critical alerts"""
        return [a for a in self.alerts if a.severity == "CRITICAL"]


# ═════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═════════════════════════════════════════════════════════════════════════════

@dataclass
class HealthStatus:
    """System health status"""
    
    timestamp: str
    status: str  # healthy, degraded, unhealthy
    database: str  # connected, disconnected
    api_server: str  # running, stopped
    memory_mb: float
    uptime_seconds: float
    total_requests: int
    error_count: int
    last_error: Optional[str] = None
    
    def to_json(self) -> str:
        """Convert to JSON"""
        return json.dumps(asdict(self))


class HealthChecker:
    """Monitor and report system health"""
    
    def __init__(self, logger: logging.Logger):
        """Initialize health checker"""
        self.logger = logger
        self.start_time = datetime.utcnow()
    
    def get_health_status(
        self,
        db_connected: bool,
        server_running: bool,
        memory_mb: float,
        error_count: int,
        total_requests: int,
        last_error: Optional[str] = None
    ) -> HealthStatus:
        """Get current health status"""
        uptime = (datetime.utcnow() - self.start_time).total_seconds()
        
        # Determine overall status
        if not db_connected or not server_running:
            status = "unhealthy"
        elif error_count > total_requests * 0.05:  # More than 5% errors
            status = "degraded"
        else:
            status = "healthy"
        
        return HealthStatus(
            timestamp=datetime.utcnow().isoformat(),
            status=status,
            database="connected" if db_connected else "disconnected",
            api_server="running" if server_running else "stopped",
            memory_mb=memory_mb,
            uptime_seconds=uptime,
            total_requests=total_requests,
            error_count=error_count,
            last_error=last_error
        )


# ═════════════════════════════════════════════════════════════════════════════
# INITIALIZATION
# ═════════════════════════════════════════════════════════════════════════════

def initialize_monitoring():
    """Initialize all monitoring components"""
    
    # Get configuration from environment
    log_level = os.getenv('LOG_LEVEL', 'INFO')
    log_format = os.getenv('LOG_FORMAT', 'json')
    log_file = os.getenv('LOG_FILE', '/var/log/swipesavvy/api.log')
    
    # Setup logging
    logger = setup_logging(
        log_level=log_level,
        log_format=log_format,
        log_file=log_file
    )
    
    # Create monitoring components
    metrics_collector = MetricsCollector(logger)
    alert_manager = AlertManager(logger)
    health_checker = HealthChecker(logger)
    
    logger.info("✅ Monitoring and observability initialized")
    logger.info(f"   Log level: {log_level}")
    logger.info(f"   Log format: {log_format}")
    logger.info(f"   Log file: {log_file}")
    
    return {
        "logger": logger,
        "metrics": metrics_collector,
        "alerts": alert_manager,
        "health": health_checker
    }


if __name__ == "__main__":
    # Test monitoring setup
    monitoring = initialize_monitoring()
    
    print("✅ Monitoring components initialized successfully")
    print("\nComponents:")
    print("  - Logger: " + monitoring["logger"].name)
    print("  - Metrics Collector: Ready")
    print("  - Alert Manager: Ready")
    print("  - Health Checker: Ready")
