"""
Error handling utilities and resilience patterns
Provides retry logic, circuit breakers, and timeout handling
"""

import time
import asyncio
from typing import Callable, Any, Optional, TypeVar, List
from functools import wraps
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum


T = TypeVar('T')


class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"  # Normal operation
    OPEN = "open"      # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Configuration for circuit breaker"""
    failure_threshold: int = 5  # Failures before opening
    success_threshold: int = 2  # Successes to close from half-open
    timeout_seconds: int = 60   # Time before half-open attempt
    

class CircuitBreaker:
    """Circuit breaker pattern implementation"""
    
    def __init__(self, config: CircuitBreakerConfig = None):
        self.config = config or CircuitBreakerConfig()
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: Optional[datetime] = None
    
    def call(self, func: Callable[..., T], *args, **kwargs) -> T:
        """Execute function with circuit breaker protection"""
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                raise CircuitBreakerOpenError(
                    f"Circuit breaker is OPEN. "
                    f"Last failure: {self.last_failure_time}"
                )
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
    
    async def call_async(self, func: Callable[..., T], *args, **kwargs) -> T:
        """Execute async function with circuit breaker protection"""
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                raise CircuitBreakerOpenError(
                    f"Circuit breaker is OPEN. "
                    f"Last failure: {self.last_failure_time}"
                )
        
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
    
    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to attempt reset"""
        if not self.last_failure_time:
            return True
        
        elapsed = datetime.utcnow() - self.last_failure_time
        return elapsed.total_seconds() >= self.config.timeout_seconds
    
    def _on_success(self):
        """Handle successful call"""
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.config.success_threshold:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
        else:
            self.failure_count = 0
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()
        
        if self.failure_count >= self.config.failure_threshold:
            self.state = CircuitState.OPEN


class CircuitBreakerOpenError(Exception):
    """Raised when circuit breaker is open"""
    pass


def retry_with_backoff(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    max_delay: float = 60.0,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """Decorator for retrying function with exponential backoff"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt < max_retries:
                        # Exponential backoff with jitter
                        import random
                        jitter = random.uniform(0, 0.1 * delay)
                        sleep_time = min(delay + jitter, max_delay)
                        
                        await asyncio.sleep(sleep_time)
                        delay *= backoff_factor
                    else:
                        raise
            
            # Should not reach here, but raise last exception if it does
            raise last_exception
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt < max_retries:
                        import random
                        jitter = random.uniform(0, 0.1 * delay)
                        sleep_time = min(delay + jitter, max_delay)
                        
                        time.sleep(sleep_time)
                        delay *= backoff_factor
                    else:
                        raise
            
            raise last_exception
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


async def with_timeout(coro, timeout_seconds: float, 
                       error_message: str = "Operation timed out"):
    """Execute coroutine with timeout"""
    try:
        return await asyncio.wait_for(coro, timeout=timeout_seconds)
    except asyncio.TimeoutError:
        raise TimeoutError(f"{error_message} (timeout: {timeout_seconds}s)")


class RateLimiter:
    """Token bucket rate limiter"""
    
    def __init__(self, rate: float, capacity: int):
        """
        Args:
            rate: Tokens per second
            capacity: Maximum tokens in bucket
        """
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_update = time.time()
    
    def acquire(self, tokens: int = 1) -> bool:
        """Try to acquire tokens"""
        self._refill()
        
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False
    
    async def acquire_async(self, tokens: int = 1, timeout: float = 10.0) -> bool:
        """Async acquire with waiting"""
        start_time = time.time()
        
        while True:
            if self.acquire(tokens):
                return True
            
            if time.time() - start_time >= timeout:
                return False
            
            # Wait a bit before retrying
            await asyncio.sleep(0.1)
    
    def _refill(self):
        """Refill tokens based on elapsed time"""
        now = time.time()
        elapsed = now - self.last_update
        
        # Add tokens based on rate
        new_tokens = elapsed * self.rate
        self.tokens = min(self.capacity, self.tokens + new_tokens)
        self.last_update = now


class ValidationError(Exception):
    """Raised when input validation fails"""
    pass


def validate_user_input(text: str, max_length: int = 1000) -> str:
    """Validate and sanitize user input"""
    if not text or not isinstance(text, str):
        raise ValidationError("Input must be a non-empty string")
    
    # Strip whitespace
    text = text.strip()
    
    if len(text) == 0:
        raise ValidationError("Input cannot be empty")
    
    if len(text) > max_length:
        raise ValidationError(
            f"Input too long ({len(text)} chars, max {max_length})"
        )
    
    # Remove control characters
    text = ''.join(char for char in text if ord(char) >= 32 or char == '\n')
    
    return text


def validate_session_id(session_id: str) -> str:
    """Validate session ID format"""
    if not session_id or not isinstance(session_id, str):
        raise ValidationError("Session ID must be a non-empty string")
    
    if len(session_id) > 100:
        raise ValidationError("Session ID too long")
    
    # Only allow alphanumeric, hyphens, underscores
    if not all(c.isalnum() or c in '-_' for c in session_id):
        raise ValidationError("Session ID contains invalid characters")
    
    return session_id


def validate_user_id(user_id: str) -> str:
    """Validate user ID format"""
    if not user_id or not isinstance(user_id, str):
        raise ValidationError("User ID must be a non-empty string")
    
    if len(user_id) > 100:
        raise ValidationError("User ID too long")
    
    if not all(c.isalnum() or c in '-_' for c in user_id):
        raise ValidationError("User ID contains invalid characters")
    
    return user_id


# Example usage
if __name__ == "__main__":
    # Circuit breaker example
    cb = CircuitBreaker(CircuitBreakerConfig(failure_threshold=3))
    
    def flaky_operation():
        import random
        if random.random() < 0.5:
            raise Exception("Simulated failure")
        return "Success"
    
    for i in range(10):
        try:
            result = cb.call(flaky_operation)
            print(f"Attempt {i}: {result} (state: {cb.state.value})")
        except Exception as e:
            print(f"Attempt {i}: Failed - {e} (state: {cb.state.value})")
        time.sleep(0.5)
    
    # Rate limiter example
    limiter = RateLimiter(rate=2.0, capacity=5)  # 2 tokens/sec, max 5
    
    for i in range(10):
        if limiter.acquire():
            print(f"Request {i}: Allowed")
        else:
            print(f"Request {i}: Rate limited")
        time.sleep(0.3)
