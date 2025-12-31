"""
PII Redaction Logger for SwipeSavvy Platform
Masks sensitive data in logs to prevent data leakage
"""

import re
import json
import logging
from typing import Any, Dict
from datetime import datetime
from functools import wraps
import uuid

class PIIRedactor:
    """Redacts personally identifiable information from logs and data"""
    
    # PII Patterns
    PATTERNS = {
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
        'phone': r'\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b',
        'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        'ip_address': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
        'jwt': r'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.?[A-Za-z0-9_-]*',
        'api_key': r'(?i)(?:api[_-]?key|apikey|secret)[=:\s]+([a-zA-Z0-9_\-]{20,})',
        'password': r'(?i)(?:password|passwd|pwd)[=:\s]+([^\s,;}\]]+)',
    }
    
    REDACTION_REPLACEMENTS = {
        'email': '[REDACTED_EMAIL]',
        'ssn': '[REDACTED_SSN]',
        'phone': '[REDACTED_PHONE]',
        'credit_card': '[REDACTED_CARD]',
        'ip_address': '[REDACTED_IP]',
        'jwt': '[REDACTED_JWT]',
        'api_key': '[REDACTED_API_KEY]',
        'password': '[REDACTED_PASSWORD]',
    }
    
    @classmethod
    def redact_string(cls, text: str) -> str:
        """Redact PII from string"""
        if not isinstance(text, str):
            return text
        
        for pattern_name, pattern in cls.PATTERNS.items():
            replacement = cls.REDACTION_REPLACEMENTS[pattern_name]
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
        return text
    
    @classmethod
    def redact_dict(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively redact PII from dictionary"""
        if not isinstance(data, dict):
            return data
        
        redacted = {}
        for key, value in data.items():
            # Redact key names that indicate sensitive fields
            if any(sensitive in key.lower() for sensitive in ['password', 'token', 'secret', 'key', 'email', 'phone', 'ssn', 'card', 'pin']):
                redacted[key] = '[REDACTED]'
            elif isinstance(value, dict):
                redacted[key] = cls.redact_dict(value)
            elif isinstance(value, list):
                redacted[key] = [cls.redact_dict(item) if isinstance(item, dict) else cls.redact_string(str(item)) if isinstance(item, str) else item for item in value]
            elif isinstance(value, str):
                redacted[key] = cls.redact_string(value)
            else:
                redacted[key] = value
        
        return redacted
    
    @classmethod
    def redact_json(cls, json_str: str) -> str:
        """Redact PII from JSON string"""
        try:
            data = json.loads(json_str)
            redacted = cls.redact_dict(data)
            return json.dumps(redacted)
        except (json.JSONDecodeError, TypeError):
            return cls.redact_string(json_str)


class StructuredLogger:
    """Structured logging with correlation IDs and PII redaction"""
    
    def __init__(self, name: str, redact_pii: bool = True):
        self.logger = logging.getLogger(name)
        self.redact_pii = redact_pii
        self.correlation_id = None
    
    def set_correlation_id(self, correlation_id: str = None):
        """Set or generate correlation ID for request tracing"""
        self.correlation_id = correlation_id or str(uuid.uuid4())
        return self.correlation_id
    
    def _prepare_message(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare message with correlation ID and PII redaction"""
        message = {
            'timestamp': datetime.utcnow().isoformat(),
            'correlation_id': self.correlation_id or str(uuid.uuid4()),
            **data
        }
        
        if self.redact_pii:
            message = PIIRedactor.redact_dict(message)
        
        return message
    
    def info(self, message: str, **kwargs):
        """Log info with structured data"""
        data = self._prepare_message({'level': 'INFO', 'message': message, **kwargs})
        self.logger.info(json.dumps(data))
    
    def warning(self, message: str, **kwargs):
        """Log warning with structured data"""
        data = self._prepare_message({'level': 'WARNING', 'message': message, **kwargs})
        self.logger.warning(json.dumps(data))
    
    def error(self, message: str, **kwargs):
        """Log error with structured data"""
        data = self._prepare_message({'level': 'ERROR', 'message': message, **kwargs})
        self.logger.error(json.dumps(data))
    
    def debug(self, message: str, **kwargs):
        """Log debug with structured data"""
        data = self._prepare_message({'level': 'DEBUG', 'message': message, **kwargs})
        self.logger.debug(json.dumps(data))
    
    def audit(self, action: str, user_id: str = None, resource: str = None, result: str = 'success', **kwargs):
        """Log audit trail event"""
        data = self._prepare_message({
            'level': 'AUDIT',
            'action': action,
            'user_id': user_id,
            'resource': resource,
            'result': result,
            **kwargs
        })
        self.logger.info(f"AUDIT: {json.dumps(data)}")


def log_request(logger: StructuredLogger):
    """Decorator to log API requests with PII redaction"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            correlation_id = logger.set_correlation_id()
            
            try:
                result = func(*args, **kwargs)
                logger.info(
                    f"Request completed: {func.__name__}",
                    function=func.__name__,
                    status='success',
                    correlation_id=correlation_id
                )
                return result
            except Exception as e:
                logger.error(
                    f"Request failed: {func.__name__}",
                    function=func.__name__,
                    error=str(e),
                    error_type=type(e).__name__,
                    correlation_id=correlation_id
                )
                raise
        
        return wrapper
    return decorator


def log_database_query(logger: StructuredLogger):
    """Decorator to log database queries with PII redaction"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            query_start = datetime.utcnow()
            
            try:
                result = func(*args, **kwargs)
                query_duration = (datetime.utcnow() - query_start).total_seconds()
                
                logger.debug(
                    f"Database query: {func.__name__}",
                    function=func.__name__,
                    duration_ms=query_duration * 1000,
                    status='success'
                )
                return result
            except Exception as e:
                query_duration = (datetime.utcnow() - query_start).total_seconds()
                logger.error(
                    f"Database query failed: {func.__name__}",
                    function=func.__name__,
                    duration_ms=query_duration * 1000,
                    error=str(e)
                )
                raise
        
        return wrapper
    return decorator


# Module-level logger instance
logger = StructuredLogger(__name__)

# Usage examples:
# logger.info("User login", user_id=123, ip_address="192.168.1.1")
# logger.audit("feature_flag_toggled", user_id=1, resource="ff_payment", action="enable")
# logger.error("Payment failed", user_id=123, error_code="DECLINED")
