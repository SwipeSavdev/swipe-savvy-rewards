"""
Resilience Patterns for Production Reliability
Implements circuit breakers, timeouts, retries, and fallbacks
"""

import asyncio
import time
import logging
from enum import Enum
from typing import Callable, Any, Optional, TypeVar, Generic
from dataclasses import dataclass
from datetime import datetime, timedelta

T = TypeVar('T')

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"  # Normal operation, allowing requests
    OPEN = "open"  # Failing, rejecting requests immediately
    HALF_OPEN = "half_open"  # Testing if service recovered


@dataclass
class CircuitBreakerConfig:
    """Configuration for circuit breaker"""
    failure_threshold: int = 5  # Failures before opening
    recovery_timeout: int = 60  # Seconds before attempting recovery
    max_half_open_calls: int = 3  # Calls allowed during half-open state
    name: str = "circuit_breaker"


class CircuitBreaker(Generic[T]):
    """
    Circuit Breaker Pattern
    Prevents cascading failures by stopping requests to failing services
    
    States:
    - CLOSED: Normal operation
    - OPEN: Service failing, reject requests immediately
    - HALF_OPEN: Service recovered, allow limited requests to verify
    """
    
    def __init__(self, config: CircuitBreakerConfig):
        self.config = config
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.half_open_count = 0
        self.last_failure_time: Optional[datetime] = None
        self.last_state_change = datetime.now()
    
    async def call(self, func: Callable[..., T], *args, **kwargs) -> T:
        """Execute function with circuit breaker protection"""
        
        # If circuit is open and recovery timeout has passed, try half-open
        if self.state == CircuitState.OPEN:
            if self._should_attempt_recovery():
                self.state = CircuitState.HALF_OPEN
                self.half_open_count = 0
                logger.info(f"{self.config.name}: Attempting recovery (HALF_OPEN)")
            else:
                raise Exception(f"Circuit breaker OPEN for {self.config.name}")
        
        # In half-open state, only allow limited calls
        if self.state == CircuitState.HALF_OPEN:
            if self.half_open_count >= self.config.max_half_open_calls:
                raise Exception(f"Circuit breaker HALF_OPEN, max calls exceeded for {self.config.name}")
            self.half_open_count += 1
        
        try:
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e
    
    def _on_success(self):
        """Handle successful call"""
        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            logger.info(f"{self.config.name}: Service recovered, circuit CLOSED")
        elif self.state == CircuitState.CLOSED:
            self.failure_count = 0
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        
        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.OPEN
            logger.error(f"{self.config.name}: Recovery failed, circuit OPEN")
        elif self.failure_count >= self.config.failure_threshold:
            self.state = CircuitState.OPEN
            logger.error(
                f"{self.config.name}: Failure threshold ({self.config.failure_threshold}) "
                f"exceeded, circuit OPEN"
            )
    
    def _should_attempt_recovery(self) -> bool:
        """Check if recovery timeout has elapsed"""
        if not self.last_failure_time:
            return True
        elapsed = (datetime.now() - self.last_failure_time).total_seconds()
        return elapsed >= self.config.recovery_timeout
    
    def get_state(self) -> str:
        """Get current circuit breaker state"""
        return self.state.value


@dataclass
class RetryConfig:
    """Configuration for retry logic"""
    max_retries: int = 3
    initial_delay: float = 1.0  # seconds
    max_delay: float = 60.0  # seconds
    exponential_base: float = 2.0
    jitter: bool = True


class RetryPolicy:
    """Implements exponential backoff with jitter"""
    
    def __init__(self, config: RetryConfig):
        self.config = config
    
    async def execute(
        self, 
        func: Callable[..., T],
        *args,
        retriable_exceptions: tuple = (Exception,),
        **kwargs
    ) -> T:
        """Execute function with retries"""
        
        last_exception: Optional[Exception] = None
        
        for attempt in range(self.config.max_retries):
            try:
                result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
                if attempt > 0:
                    logger.info(f"Retry succeeded on attempt {attempt + 1}")
                return result
            except Exception as e:
                if not isinstance(e, retriable_exceptions):
                    raise
                
                last_exception = e
                
                if attempt < self.config.max_retries - 1:
                    delay = self._calculate_delay(attempt)
                    logger.warning(
                        f"Attempt {attempt + 1} failed: {str(e)}. "
                        f"Retrying in {delay:.2f}s..."
                    )
                    await asyncio.sleep(delay)
        
        logger.error(f"All {self.config.max_retries} attempts failed")
        raise last_exception or Exception("All retries exhausted")
    
    def _calculate_delay(self, attempt: int) -> float:
        """Calculate exponential backoff with optional jitter"""
        delay = self.config.initial_delay * (self.config.exponential_base ** attempt)
        delay = min(delay, self.config.max_delay)
        
        if self.config.jitter:
            import random
            jitter = random.random() * delay * 0.1  # Up to 10% jitter
            delay += jitter
        
        return delay


class TimeoutError(Exception):
    """Raised when operation exceeds timeout"""
    pass


async def with_timeout(
    coro,
    timeout_seconds: float,
    operation_name: str = "operation"
) -> Any:
    """Execute coroutine with timeout"""
    try:
        return await asyncio.wait_for(coro, timeout=timeout_seconds)
    except asyncio.TimeoutError:
        logger.error(f"{operation_name} timed out after {timeout_seconds}s")
        raise TimeoutError(f"{operation_name} exceeded timeout of {timeout_seconds}s")


@dataclass
class BulkheadConfig:
    """Configuration for bulkhead isolation"""
    max_concurrent_calls: int = 10
    max_waiting_calls: int = 20
    name: str = "bulkhead"


class Bulkhead:
    """
    Bulkhead Pattern
    Limits concurrent calls to prevent resource exhaustion
    Like compartments in a ship - failure in one doesn't affect others
    """
    
    def __init__(self, config: BulkheadConfig):
        self.config = config
        self.semaphore = asyncio.Semaphore(config.max_concurrent_calls)
        self.waiting_count = 0
    
    async def execute(self, func: Callable[..., T], *args, **kwargs) -> T:
        """Execute function with bulkhead isolation"""
        
        if self.waiting_count >= self.config.max_waiting_calls:
            raise Exception(
                f"Bulkhead {self.config.name} queue full "
                f"(max waiting: {self.config.max_waiting_calls})"
            )
        
        self.waiting_count += 1
        try:
            async with self.semaphore:
                self.waiting_count -= 1
                result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
                return result
        except:
            self.waiting_count -= 1
            raise
    
    def get_metrics(self) -> dict:
        """Get bulkhead metrics"""
        return {
            "name": self.config.name,
            "available_permits": self.semaphore._value,
            "waiting_calls": self.waiting_count,
            "total_capacity": self.config.max_concurrent_calls
        }


class ResilientClient:
    """
    Combines multiple resilience patterns for robust service calls
    - Circuit breaker: prevent cascading failures
    - Retry: handle transient failures
    - Timeout: prevent hanging requests
    - Bulkhead: prevent resource exhaustion
    """
    
    def __init__(
        self,
        service_name: str,
        circuit_breaker_config: Optional[CircuitBreakerConfig] = None,
        retry_config: Optional[RetryConfig] = None,
        timeout_seconds: float = 30,
        bulkhead_config: Optional[BulkheadConfig] = None,
    ):
        self.service_name = service_name
        
        cb_config = circuit_breaker_config or CircuitBreakerConfig(name=service_name)
        self.circuit_breaker = CircuitBreaker(cb_config)
        
        retry_cfg = retry_config or RetryConfig()
        self.retry_policy = RetryPolicy(retry_cfg)
        
        self.timeout_seconds = timeout_seconds
        
        bh_config = bulkhead_config or BulkheadConfig(name=service_name)
        self.bulkhead = Bulkhead(bh_config)
    
    async def call(
        self,
        func: Callable[..., T],
        *args,
        operation_name: str = "",
        retriable: bool = True,
        **kwargs
    ) -> T:
        """
        Execute function with all resilience patterns
        
        Order of execution:
        1. Bulkhead: Check resource availability
        2. Circuit breaker: Check if service is available
        3. Timeout: Set execution time limit
        4. Retry: Handle transient failures
        """
        
        op_name = operation_name or f"{self.service_name}.call"
        
        async def bulkhead_wrapped():
            return await self.bulkhead.execute(
                self._circuit_breaker_call,
                func, retriable, op_name, *args,
                **kwargs
            )
        
        try:
            result = await with_timeout(
                bulkhead_wrapped(),
                self.timeout_seconds,
                op_name
            )
            return result
        except Exception as e:
            logger.error(f"{op_name} failed: {str(e)}")
            raise
    
    async def _circuit_breaker_call(
        self,
        func: Callable[..., T],
        retriable: bool,
        op_name: str,
        *args,
        **kwargs
    ) -> T:
        """Internal method for circuit breaker + retry execution"""
        
        if retriable:
            return await self.circuit_breaker.call(
                self.retry_policy.execute,
                func, *args,
                retriable_exceptions=(TimeoutError, ConnectionError),
                **kwargs
            )
        else:
            return await self.circuit_breaker.call(func, *args, **kwargs)
    
    def get_health(self) -> dict:
        """Get health status of resilient client"""
        return {
            "service": self.service_name,
            "circuit_breaker": self.circuit_breaker.get_state(),
            "bulkhead": self.bulkhead.get_metrics(),
            "timeout_seconds": self.timeout_seconds
        }


# Singleton instances for use in FastAPI
def create_resilient_clients() -> dict:
    """Create resilient clients for each external service"""
    
    return {
        "database": ResilientClient(
            "database",
            circuit_breaker_config=CircuitBreakerConfig(
                failure_threshold=5,
                recovery_timeout=60,
                max_half_open_calls=3,
                name="database"
            ),
            retry_config=RetryConfig(
                max_retries=3,
                initial_delay=0.5,
                max_delay=10.0
            ),
            timeout_seconds=30,
            bulkhead_config=BulkheadConfig(
                max_concurrent_calls=50,
                max_waiting_calls=100,
                name="database"
            )
        ),
        "external_api": ResilientClient(
            "external_api",
            circuit_breaker_config=CircuitBreakerConfig(
                failure_threshold=3,
                recovery_timeout=30,
                max_half_open_calls=1,
                name="external_api"
            ),
            retry_config=RetryConfig(
                max_retries=2,
                initial_delay=1.0,
                max_delay=30.0
            ),
            timeout_seconds=15,
            bulkhead_config=BulkheadConfig(
                max_concurrent_calls=20,
                max_waiting_calls=50,
                name="external_api"
            )
        ),
        "rate_limiter": ResilientClient(
            "rate_limiter",
            circuit_breaker_config=CircuitBreakerConfig(
                failure_threshold=10,
                recovery_timeout=120,
                max_half_open_calls=5,
                name="rate_limiter"
            ),
            retry_config=RetryConfig(
                max_retries=1,
                initial_delay=0.1,
                max_delay=5.0
            ),
            timeout_seconds=5,
            bulkhead_config=BulkheadConfig(
                max_concurrent_calls=100,
                max_waiting_calls=200,
                name="rate_limiter"
            )
        )
    }


if __name__ == "__main__":
    # Example usage
    async def main():
        # Example: Protected API call
        api_client = ResilientClient(
            "payment_api",
            timeout_seconds=10
        )
        
        async def make_payment(amount: float):
            # Simulated API call
            await asyncio.sleep(0.1)
            return {"status": "success", "amount": amount}
        
        result = await api_client.call(
            make_payment,
            100.0,
            operation_name="process_payment"
        )
        print(f"Payment result: {result}")
        print(f"Health: {api_client.get_health()}")
    
    asyncio.run(main())
