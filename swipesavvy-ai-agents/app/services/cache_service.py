"""
Redis Cache Service for SwipeSavvy

Provides caching for:
- Session management
- Feature flags
- Rate limiting counters
- Frequently accessed data

Designed for high availability with connection pooling and automatic failover.
"""

import os
import json
import logging
from typing import Any, Optional, List, Dict, Union
from datetime import timedelta
import redis
from redis.connection import ConnectionPool
from functools import wraps

logger = logging.getLogger(__name__)

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
REDIS_MAX_CONNECTIONS = int(os.getenv("REDIS_MAX_CONNECTIONS", "50"))
REDIS_SOCKET_TIMEOUT = int(os.getenv("REDIS_SOCKET_TIMEOUT", "5"))
REDIS_RETRY_ON_TIMEOUT = os.getenv("REDIS_RETRY_ON_TIMEOUT", "true").lower() == "true"

# Cache key prefixes
CACHE_PREFIX = "swipesavvy:"
SESSION_PREFIX = f"{CACHE_PREFIX}session:"
FEATURE_FLAG_PREFIX = f"{CACHE_PREFIX}feature_flag:"
USER_CACHE_PREFIX = f"{CACHE_PREFIX}user:"
RATE_LIMIT_PREFIX = f"{CACHE_PREFIX}rate_limit:"

# Default TTLs (in seconds)
SESSION_TTL = 60 * 60 * 24  # 24 hours
FEATURE_FLAG_TTL = 60 * 5   # 5 minutes
USER_CACHE_TTL = 60 * 15    # 15 minutes
RATE_LIMIT_WINDOW = 60      # 1 minute


class RedisCache:
    """Redis cache client with connection pooling and automatic reconnection."""

    _instance: Optional["RedisCache"] = None
    _pool: Optional[ConnectionPool] = None
    _client: Optional[redis.Redis] = None

    def __new__(cls):
        """Singleton pattern for Redis connection pool."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize Redis connection pool."""
        try:
            self._pool = ConnectionPool.from_url(
                REDIS_URL,
                max_connections=REDIS_MAX_CONNECTIONS,
                socket_timeout=REDIS_SOCKET_TIMEOUT,
                socket_connect_timeout=REDIS_SOCKET_TIMEOUT,
                retry_on_timeout=REDIS_RETRY_ON_TIMEOUT,
                decode_responses=True,  # Return strings instead of bytes
            )
            self._client = redis.Redis(connection_pool=self._pool)

            # Test connection
            self._client.ping()
            logger.info(f"Redis cache connected: {REDIS_URL.split('@')[-1]}")

        except redis.ConnectionError as e:
            logger.warning(f"Redis connection failed: {e}. Cache will be disabled.")
            self._client = None
        except Exception as e:
            logger.error(f"Redis initialization error: {e}")
            self._client = None

    @property
    def is_available(self) -> bool:
        """Check if Redis is available."""
        if self._client is None:
            return False
        try:
            self._client.ping()
            return True
        except (redis.ConnectionError, redis.TimeoutError):
            return False

    def get(self, key: str) -> Optional[str]:
        """Get a value from cache."""
        if not self.is_available:
            return None
        try:
            return self._client.get(key)
        except Exception as e:
            logger.error(f"Redis GET error for key {key}: {e}")
            return None

    def set(
        self,
        key: str,
        value: str,
        ttl: Optional[int] = None,
        nx: bool = False,
        xx: bool = False,
    ) -> bool:
        """Set a value in cache with optional TTL."""
        if not self.is_available:
            return False
        try:
            return self._client.set(key, value, ex=ttl, nx=nx, xx=xx)
        except Exception as e:
            logger.error(f"Redis SET error for key {key}: {e}")
            return False

    def delete(self, *keys: str) -> int:
        """Delete one or more keys."""
        if not self.is_available or not keys:
            return 0
        try:
            return self._client.delete(*keys)
        except Exception as e:
            logger.error(f"Redis DELETE error: {e}")
            return 0

    def exists(self, key: str) -> bool:
        """Check if a key exists."""
        if not self.is_available:
            return False
        try:
            return self._client.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis EXISTS error: {e}")
            return False

    def expire(self, key: str, ttl: int) -> bool:
        """Set TTL on a key."""
        if not self.is_available:
            return False
        try:
            return self._client.expire(key, ttl)
        except Exception as e:
            logger.error(f"Redis EXPIRE error: {e}")
            return False

    def incr(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment a counter."""
        if not self.is_available:
            return None
        try:
            return self._client.incr(key, amount)
        except Exception as e:
            logger.error(f"Redis INCR error: {e}")
            return None

    def get_json(self, key: str) -> Optional[Dict]:
        """Get and deserialize JSON from cache."""
        value = self.get(key)
        if value is None:
            return None
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in cache for key {key}")
            return None

    def set_json(
        self, key: str, value: Dict, ttl: Optional[int] = None
    ) -> bool:
        """Serialize and set JSON in cache."""
        try:
            return self.set(key, json.dumps(value), ttl=ttl)
        except (TypeError, ValueError) as e:
            logger.error(f"JSON serialization error: {e}")
            return False

    def mget(self, *keys: str) -> List[Optional[str]]:
        """Get multiple values at once."""
        if not self.is_available or not keys:
            return [None] * len(keys)
        try:
            return self._client.mget(keys)
        except Exception as e:
            logger.error(f"Redis MGET error: {e}")
            return [None] * len(keys)

    def mset(self, mapping: Dict[str, str]) -> bool:
        """Set multiple key-value pairs at once."""
        if not self.is_available or not mapping:
            return False
        try:
            return self._client.mset(mapping)
        except Exception as e:
            logger.error(f"Redis MSET error: {e}")
            return False

    def keys(self, pattern: str) -> List[str]:
        """Get keys matching a pattern. Use sparingly in production!"""
        if not self.is_available:
            return []
        try:
            return self._client.keys(pattern)
        except Exception as e:
            logger.error(f"Redis KEYS error: {e}")
            return []

    def flush_pattern(self, pattern: str) -> int:
        """Delete all keys matching a pattern."""
        keys = self.keys(pattern)
        if keys:
            return self.delete(*keys)
        return 0


# Global cache instance
cache = RedisCache()


# ==========================================
# Session Management
# ==========================================

class SessionManager:
    """Manages user sessions with Redis backend."""

    def __init__(self, cache_client: RedisCache = None):
        self.cache = cache_client or cache

    def create_session(
        self,
        user_id: str,
        session_data: Dict[str, Any],
        ttl: int = SESSION_TTL,
    ) -> str:
        """Create a new session and return the session ID."""
        import uuid
        session_id = str(uuid.uuid4())
        key = f"{SESSION_PREFIX}{session_id}"

        session_payload = {
            "user_id": user_id,
            "created_at": self._now_iso(),
            "last_accessed": self._now_iso(),
            **session_data,
        }

        if self.cache.set_json(key, session_payload, ttl=ttl):
            # Also store reverse lookup: user_id -> session_ids
            self._add_user_session(user_id, session_id)
            logger.info(f"Session created for user {user_id}: {session_id[:8]}...")
            return session_id

        return ""

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data by session ID."""
        key = f"{SESSION_PREFIX}{session_id}"
        session = self.cache.get_json(key)
        if session:
            # Update last accessed time
            session["last_accessed"] = self._now_iso()
            self.cache.set_json(key, session, ttl=SESSION_TTL)
        return session

    def update_session(self, session_id: str, data: Dict[str, Any]) -> bool:
        """Update session data."""
        session = self.get_session(session_id)
        if not session:
            return False

        session.update(data)
        session["last_accessed"] = self._now_iso()
        key = f"{SESSION_PREFIX}{session_id}"
        return self.cache.set_json(key, session, ttl=SESSION_TTL)

    def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        session = self.get_session(session_id)
        if session:
            self._remove_user_session(session["user_id"], session_id)
        key = f"{SESSION_PREFIX}{session_id}"
        return self.cache.delete(key) > 0

    def delete_user_sessions(self, user_id: str) -> int:
        """Delete all sessions for a user (logout from all devices)."""
        sessions = self._get_user_sessions(user_id)
        deleted = 0
        for session_id in sessions:
            if self.delete_session(session_id):
                deleted += 1
        return deleted

    def _add_user_session(self, user_id: str, session_id: str):
        """Track session ID for a user."""
        key = f"{USER_CACHE_PREFIX}{user_id}:sessions"
        sessions = self.cache.get_json(key) or []
        if session_id not in sessions:
            sessions.append(session_id)
            self.cache.set_json(key, sessions, ttl=SESSION_TTL)

    def _remove_user_session(self, user_id: str, session_id: str):
        """Remove session ID from user's session list."""
        key = f"{USER_CACHE_PREFIX}{user_id}:sessions"
        sessions = self.cache.get_json(key) or []
        if session_id in sessions:
            sessions.remove(session_id)
            self.cache.set_json(key, sessions, ttl=SESSION_TTL)

    def _get_user_sessions(self, user_id: str) -> List[str]:
        """Get all session IDs for a user."""
        key = f"{USER_CACHE_PREFIX}{user_id}:sessions"
        return self.cache.get_json(key) or []

    def _now_iso(self) -> str:
        """Get current time in ISO format."""
        from datetime import datetime
        return datetime.utcnow().isoformat()


# Global session manager
session_manager = SessionManager()


# ==========================================
# Feature Flag Cache
# ==========================================

class FeatureFlagCache:
    """Caches feature flags for fast access."""

    def __init__(self, cache_client: RedisCache = None):
        self.cache = cache_client or cache

    def get_flag(self, key: str) -> Optional[Dict[str, Any]]:
        """Get a feature flag from cache."""
        cache_key = f"{FEATURE_FLAG_PREFIX}{key}"
        return self.cache.get_json(cache_key)

    def set_flag(
        self,
        key: str,
        enabled: bool,
        rollout_percentage: int = 100,
        metadata: Dict = None,
    ) -> bool:
        """Set a feature flag in cache."""
        cache_key = f"{FEATURE_FLAG_PREFIX}{key}"
        flag_data = {
            "key": key,
            "enabled": enabled,
            "rollout_percentage": rollout_percentage,
            "metadata": metadata or {},
            "cached_at": self._now_iso(),
        }
        return self.cache.set_json(cache_key, flag_data, ttl=FEATURE_FLAG_TTL)

    def is_enabled(self, key: str, user_id: Optional[str] = None) -> bool:
        """Check if a feature flag is enabled for a user."""
        flag = self.get_flag(key)
        if not flag:
            return False

        if not flag.get("enabled", False):
            return False

        # Check rollout percentage
        rollout = flag.get("rollout_percentage", 100)
        if rollout >= 100:
            return True
        if rollout <= 0:
            return False

        # Deterministic rollout based on user_id
        if user_id:
            import hashlib
            hash_value = int(hashlib.md5(f"{key}:{user_id}".encode()).hexdigest(), 16)
            return (hash_value % 100) < rollout

        return True

    def invalidate_flag(self, key: str) -> bool:
        """Remove a flag from cache (will be reloaded from DB)."""
        cache_key = f"{FEATURE_FLAG_PREFIX}{key}"
        return self.cache.delete(cache_key) > 0

    def invalidate_all_flags(self) -> int:
        """Invalidate all cached flags."""
        return self.cache.flush_pattern(f"{FEATURE_FLAG_PREFIX}*")

    def get_all_flags(self) -> Dict[str, Dict]:
        """Get all cached feature flags."""
        keys = self.cache.keys(f"{FEATURE_FLAG_PREFIX}*")
        flags = {}
        for key in keys:
            flag_key = key.replace(FEATURE_FLAG_PREFIX, "")
            flag_data = self.cache.get_json(key)
            if flag_data:
                flags[flag_key] = flag_data
        return flags

    def sync_from_database(self, db_flags: List[Dict]) -> int:
        """Sync feature flags from database to cache."""
        synced = 0
        for flag in db_flags:
            if self.set_flag(
                key=flag["key"],
                enabled=flag.get("enabled", False),
                rollout_percentage=flag.get("rollout_percentage", 100),
                metadata=flag.get("metadata"),
            ):
                synced += 1
        logger.info(f"Synced {synced} feature flags to cache")
        return synced

    def _now_iso(self) -> str:
        from datetime import datetime
        return datetime.utcnow().isoformat()


# Global feature flag cache
feature_flag_cache = FeatureFlagCache()


# ==========================================
# Rate Limiting
# ==========================================

class RateLimiter:
    """Token bucket rate limiter using Redis."""

    def __init__(self, cache_client: RedisCache = None):
        self.cache = cache_client or cache

    def is_allowed(
        self,
        identifier: str,
        limit: int,
        window: int = RATE_LIMIT_WINDOW,
    ) -> tuple[bool, int]:
        """
        Check if request is allowed under rate limit.

        Args:
            identifier: Unique identifier (e.g., user_id, IP address)
            limit: Maximum requests allowed in window
            window: Time window in seconds

        Returns:
            Tuple of (is_allowed, remaining_requests)
        """
        key = f"{RATE_LIMIT_PREFIX}{identifier}"

        if not self.cache.is_available:
            # Allow if Redis is down
            return True, limit

        current = self.cache.incr(key)
        if current == 1:
            # First request in window, set expiry
            self.cache.expire(key, window)

        remaining = max(0, limit - current)
        allowed = current <= limit

        return allowed, remaining

    def get_usage(self, identifier: str) -> int:
        """Get current usage count for an identifier."""
        key = f"{RATE_LIMIT_PREFIX}{identifier}"
        value = self.cache.get(key)
        return int(value) if value else 0

    def reset(self, identifier: str) -> bool:
        """Reset rate limit for an identifier."""
        key = f"{RATE_LIMIT_PREFIX}{identifier}"
        return self.cache.delete(key) > 0


# Global rate limiter
rate_limiter = RateLimiter()


# ==========================================
# Decorator for caching function results
# ==========================================

def cached(
    prefix: str = "func:",
    ttl: int = 300,
    key_builder: callable = None,
):
    """
    Decorator to cache function results.

    Usage:
        @cached(prefix="users:", ttl=600)
        def get_user(user_id: str) -> Dict:
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Build cache key
            if key_builder:
                cache_key = f"{CACHE_PREFIX}{prefix}{key_builder(*args, **kwargs)}"
            else:
                # Default: use function name and args
                arg_str = ":".join(str(a) for a in args)
                kwarg_str = ":".join(f"{k}={v}" for k, v in sorted(kwargs.items()))
                cache_key = f"{CACHE_PREFIX}{prefix}{func.__name__}:{arg_str}:{kwarg_str}"

            # Try to get from cache
            cached_result = cache.get_json(cache_key)
            if cached_result is not None:
                return cached_result

            # Execute function
            result = func(*args, **kwargs)

            # Cache result
            if result is not None:
                cache.set_json(cache_key, result, ttl=ttl)

            return result

        return wrapper
    return decorator


# ==========================================
# Health Check
# ==========================================

def check_redis_health() -> Dict[str, Any]:
    """Check Redis health and return stats."""
    if not cache.is_available:
        return {
            "status": "unavailable",
            "connected": False,
        }

    try:
        info = cache._client.info()
        return {
            "status": "healthy",
            "connected": True,
            "version": info.get("redis_version"),
            "connected_clients": info.get("connected_clients"),
            "used_memory_human": info.get("used_memory_human"),
            "total_keys": sum(
                info.get(f"db{i}", {}).get("keys", 0)
                for i in range(16)
            ),
        }
    except Exception as e:
        return {
            "status": "error",
            "connected": False,
            "error": str(e),
        }
