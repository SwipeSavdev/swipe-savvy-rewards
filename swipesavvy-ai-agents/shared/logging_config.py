"""
Structured logging configuration for AI Concierge services
Provides consistent logging across all microservices with PII redaction
"""

import logging
import json
import time
import re
import sys
from typing import Any, Dict, Optional
from datetime import datetime
from functools import wraps
import traceback


# ============================================================================
# Sensitive Data Redaction Filter
# ============================================================================

class SensitiveDataFilter(logging.Filter):
    """Remove sensitive data from logs to prevent PII leakage"""
    
    # Patterns to redact with their replacement labels
    REDACTION_PATTERNS = [
        # API Keys and Tokens
        (r'(?:api[_-]?key|token|bearer|authorization)["\'\s=:]+([a-zA-Z0-9_\-\.]+)', 'API_KEY'),
        (r'(?:access[_-]?token|refresh[_-]?token)["\'\s=:]+([a-zA-Z0-9_\-\.]+)', 'TOKEN'),
        
        # Passwords
        (r'(?:password|passwd|pwd)["\'\s=:]+([^"\s,}]+)', 'PASSWORD'),
        
        # Secret Keys
        (r'(?:secret)["\'\s=:]+([^"\s,}]+)', 'SECRET'),
        (r'(?:secret[_-]?key)["\'\s=:]+([^"\s,}]+)', 'SECRET_KEY'),
        
        # Database credentials
        (r'(?:database_url|db_url|DATABASE_URL)["\'\s=:]+postgresql://([^/]+)@([^/]+)', 'DATABASE_URL'),
        
        # Email addresses (partial redaction)
        (r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', r'\1@***'),
        
        # Credit card numbers
        (r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', 'CARD_NUMBER'),
        
        # Social Security Numbers
        (r'\b\d{3}-\d{2}-\d{4}\b', 'SSN'),
        
        # JWT tokens
        (r'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', 'JWT_TOKEN'),
    ]
    
    def filter(self, record: logging.LogRecord) -> bool:
        """Filter sensitive data from log record"""
        try:
            # Process message
            if isinstance(record.msg, str):
                record.msg = self._redact(record.msg)
            
            # Process args
            if record.args:
                if isinstance(record.args, dict):
                    record.args = {
                        k: self._redact(str(v)) if v else v 
                        for k, v in record.args.items()
                    }
                elif isinstance(record.args, tuple):
                    record.args = tuple(
                        self._redact(str(arg)) if arg else arg 
                        for arg in record.args
                    )
            
            # Process exception text
            if record.exc_text:
                record.exc_text = self._redact(record.exc_text)
            
        except Exception as e:
            print(f"Warning: Sensitive data filter failed: {str(e)}", file=sys.stderr)
        
        return True
    
    @staticmethod
    def _redact(text: str) -> str:
        """Apply all redaction patterns to text"""
        for pattern, replacement in SensitiveDataFilter.REDACTION_PATTERNS:
            try:
                text = re.sub(pattern, f'[{replacement}]', text, flags=re.IGNORECASE)
            except Exception:
                continue
        return text


class StructuredLogger:
    """Structured JSON logger for microservices with PII redaction"""
    
    def __init__(self, service_name: str, log_level: str = "INFO"):
        self.service_name = service_name
        self.logger = logging.getLogger(service_name)
        self.logger.setLevel(getattr(logging, log_level))
        
        # Remove existing handlers
        self.logger.handlers.clear()
        
        # Add sensitive data filter
        sensitive_filter = SensitiveDataFilter()
        self.logger.addFilter(sensitive_filter)
        
        # Add console handler with JSON formatter
        handler = logging.StreamHandler()
        handler.addFilter(sensitive_filter)
        handler.setFormatter(JSONFormatter())
        self.logger.addHandler(handler)
    
    def _log(self, level: str, message: str, **kwargs):
        """Internal logging method with structured data"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "level": level,
            "message": message,
            **kwargs
        }
        
        log_method = getattr(self.logger, level.lower())
        log_method(json.dumps(log_data))
    
    def info(self, message: str, **kwargs):
        """Log info level message"""
        self._log("INFO", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning level message"""
        self._log("WARNING", message, **kwargs)
    
    def error(self, message: str, error: Optional[Exception] = None, **kwargs):
        """Log error level message"""
        if error:
            kwargs["error_type"] = type(error).__name__
            kwargs["error_message"] = str(error)
            kwargs["traceback"] = traceback.format_exc()
        self._log("ERROR", message, **kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log debug level message"""
        self._log("DEBUG", message, **kwargs)
    
    def metric(self, metric_name: str, value: float, unit: str = "", **kwargs):
        """Log performance metric"""
        self._log("INFO", f"METRIC: {metric_name}", 
                 metric_name=metric_name,
                 metric_value=value,
                 metric_unit=unit,
                 **kwargs)
    
    def api_call(self, method: str, endpoint: str, status_code: int, 
                 duration_ms: float, **kwargs):
        """Log API call"""
        self._log("INFO", f"API: {method} {endpoint}",
                 http_method=method,
                 http_endpoint=endpoint,
                 http_status=status_code,
                 duration_ms=duration_ms,
                 **kwargs)
    
    def llm_call(self, model: str, prompt_tokens: int, completion_tokens: int,
                 duration_ms: float, **kwargs):
        """Log LLM API call"""
        self._log("INFO", f"LLM: {model}",
                 model=model,
                 prompt_tokens=prompt_tokens,
                 completion_tokens=completion_tokens,
                 total_tokens=prompt_tokens + completion_tokens,
                 duration_ms=duration_ms,
                 **kwargs)
    
    def tool_call(self, tool_name: str, success: bool, duration_ms: float, **kwargs):
        """Log tool execution"""
        self._log("INFO", f"TOOL: {tool_name}",
                 tool_name=tool_name,
                 success=success,
                 duration_ms=duration_ms,
                 **kwargs)


class JSONFormatter(logging.Formatter):
    """JSON formatter for log records"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        try:
            # If message is already JSON, return it
            return record.getMessage()
        except Exception:
            # Fallback to basic formatting
            return json.dumps({
                "timestamp": datetime.utcnow().isoformat(),
                "level": record.levelname,
                "message": record.getMessage()
            })


def log_execution_time(logger: StructuredLogger, operation: str):
    """Decorator to log function execution time"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                logger.metric(f"{operation}_duration", duration_ms, "ms",
                            operation=operation, success=True)
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                logger.error(f"{operation} failed", error=e,
                           operation=operation, duration_ms=duration_ms)
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                logger.metric(f"{operation}_duration", duration_ms, "ms",
                            operation=operation, success=True)
                return result
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                logger.error(f"{operation} failed", error=e,
                           operation=operation, duration_ms=duration_ms)
                raise
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


def get_logger(service_name: str, log_level: str = "INFO") -> StructuredLogger:
    """Get or create a structured logger for a service"""
    return StructuredLogger(service_name, log_level)


# Example usage
if __name__ == "__main__":
    logger = get_logger("example-service")
    
    logger.info("Service started", version="1.0.0", port=8000)
    logger.metric("startup_time", 250.5, "ms")
    logger.api_call("POST", "/api/chat", 200, 1234.5, user_id="user_123")
    logger.llm_call("llama-3.3-70b", 150, 50, 2345.6, user_id="user_123")
    logger.tool_call("get_account_balance", True, 123.4, user_id="user_123")
    
    try:
        raise ValueError("Example error")
    except Exception as e:
        logger.error("Operation failed", error=e, operation="example")
