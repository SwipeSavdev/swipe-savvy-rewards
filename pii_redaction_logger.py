"""
PII Redaction Logger for SwipeSavvy Platform
Prevents sensitive data leakage in logs with pattern-based redaction
"""

import re
import json
import uuid
from typing import Any, Dict, Optional
from datetime import datetime
from functools import wraps
import logging


class PIIRedactor:
    """Redacts personally identifiable information from strings and objects"""
    
    PATTERNS = {
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
        'phone': r'\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b',
        'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        'ip_address': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
        'jwt': r'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',
        'api_key': r'(?:api[_-]?key|apikey)["\']?\s*[:=]\s*["\']?[A-Za-z0-9_-]{32,}["\']?',
        'password': r'(?:password|passwd|pwd)["\']?\s*[:=]\s*["\']?([^"\'\s]+)["\']?'
    }
    
    REPLACEMENTS = {
        'email': '[REDACTED_EMAIL]',
        'ssn': '[REDACTED_SSN]',
        'phone': '[REDACTED_PHONE]',
        'credit_card': '[REDACTED_CARD]',
        'ip_address': '[REDACTED_IP]',
        'jwt': '[REDACTED_JWT]',
        'api_key': '[REDACTED_API_KEY]',
        'password': '[REDACTED_PASSWORD]'
    }
    
    @classmethod
    def redact_string(cls, text: str) -> str:
        """Redact PII patterns from a string"""
        if not isinstance(text, str):
            return text
        
        redacted = text
        for pattern_name, pattern in cls.PATTERNS.items():
            replacement = cls.REPLACEMENTS[pattern_name]
            redacted = re.sub(pattern, replacement, redacted, flags=re.IGNORECASE)
        
        return redacted
    
    @classmethod
    def redact_dict(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively redact PII from dictionary"""
        if not isinstance(data, dict):
            return data
        
        redacted = {}
        for key, value in data.items():
            if isinstance(value, str):
                redacted[key] = cls.redact_string(value)
            elif isinstance(value, dict):
                redacted[key] = cls.redact_dict(value)
            elif isinstance(value, list):
                redacted[key] = [
                    cls.redact_dict(item) if isinstance(item, dict)
                    else cls.redact_string(item) if isinstance(item, str)
                    else item
                    for item in value
                ]
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
    
    def __init__(self, name: str, correlation_id: Optional[str] = None):
        self.name = name
        self.correlation_id = correlation_id or str(uuid.uuid4())
        self.logger = logging.getLogger(name)
    
    def _format_message(self, level: str, message: str, **kwargs) -> Dict[str, Any]:
        """Format log message with metadata"""
        redacted_kwargs = PIIRedactor.redact_dict(kwargs) if kwargs else {}
        
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'correlation_id': self.correlation_id,
            'level': level,
            'logger': self.name,
            'message': PIIRedactor.redact_string(message),
            **redacted_kwargs
        }
    
    def info(self, message: str, **kwargs):
        """Log info level"""
        log_data = self._format_message('INFO', message, **kwargs)
        self.logger.info(json.dumps(log_data))
    
    def warning(self, message: str, **kwargs):
        """Log warning level"""
        log_data = self._format_message('WARNING', message, **kwargs)
        self.logger.warning(json.dumps(log_data))
    
    def error(self, message: str, **kwargs):
        """Log error level"""
        log_data = self._format_message('ERROR', message, **kwargs)
        self.logger.error(json.dumps(log_data))
    
    def debug(self, message: str, **kwargs):
        """Log debug level"""
        log_data = self._format_message('DEBUG', message, **kwargs)
        self.logger.debug(json.dumps(log_data))
    
    def audit(self, action: str, user_id: Optional[int] = None, 
              resource: Optional[str] = None, result: Optional[str] = None, **kwargs):
        """Log audit trail entry"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'correlation_id': self.correlation_id,
            'level': 'AUDIT',
            'logger': self.name,
            'action': action,
            'user_id': user_id,
            'resource': resource,
            'result': result,
            **PIIRedactor.redact_dict(kwargs)
        }
        self.logger.info(json.dumps(log_data))


def log_request(func):
    """Decorator to log function requests and responses"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger = StructuredLogger(func.__module__)
        
        logger.info(
            f"Function call: {func.__name__}",
            function=func.__name__,
            args_count=len(args),
            kwargs_keys=list(kwargs.keys())
        )
        
        try:
            result = func(*args, **kwargs)
            logger.info(
                f"Function completed: {func.__name__}",
                function=func.__name__,
                status='success'
            )
            return result
        except Exception as e:
            logger.error(
                f"Function failed: {func.__name__}",
                function=func.__name__,
                error=str(e),
                error_type=type(e).__name__
            )
            raise
    
    return wrapper


def log_database_query(func):
    """Decorator to log database queries"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger = StructuredLogger(func.__module__)
        
        logger.debug(
            f"Database query: {func.__name__}",
            function=func.__name__,
            query_type='select' if 'query' in func.__name__.lower() else 'write'
        )
        
        try:
            result = func(*args, **kwargs)
            logger.debug(
                f"Query completed: {func.__name__}",
                function=func.__name__,
                rows_affected=len(result) if isinstance(result, list) else 1
            )
            return result
        except Exception as e:
            logger.error(
                f"Query failed: {func.__name__}",
                function=func.__name__,
                error=str(e)
            )
            raise
    
    return wrapper


# Initialize root logger
def setup_logging(level=logging.INFO):
    """Setup structured logging configuration"""
    logging.basicConfig(
        level=level,
        format='%(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('app.log')
        ]
    )


if __name__ == '__main__':
    # Test PII redaction
    setup_logging()
    
    test_text = "User email@example.com called at 555-123-4567 with card 4532-1111-2222-3333"
    print(f"Original: {test_text}")
    print(f"Redacted: {PIIRedactor.redact_string(test_text)}")
    
    test_dict = {
        'user_email': 'user@example.com',
        'phone': '(555) 123-4567',
        'ip_address': '192.168.1.1',
        'nested': {
            'password': 'SecurePass123!'
        }
    }
    print(f"\nOriginal dict: {test_dict}")
    print(f"Redacted dict: {PIIRedactor.redact_dict(test_dict)}")
    
    # Test structured logger
    logger = StructuredLogger('test_logger')
    logger.info("Test message", user_id=123, email="user@example.com")
    logger.audit("USER_LOGIN", user_id=123, resource="admin_portal", result="success")
