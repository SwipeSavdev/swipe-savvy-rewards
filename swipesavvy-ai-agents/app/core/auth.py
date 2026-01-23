"""
Authentication Utilities

JWT token generation, verification, and user authentication.
"""

import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


class TokenError(Exception):
    """Custom exception for token-related errors"""
    def __init__(self, message: str, is_expired: bool = False):
        self.message = message
        self.is_expired = is_expired
        super().__init__(message)


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    
    to_encode = {
        "user_id": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    
    try:
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    except Exception as e:
        logger.error(f"Failed to create access token: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create token")


def verify_token_string(token: str) -> str:
    """
    Verify a JWT token string and return the user_id.

    Args:
        token: The JWT token string (without 'Bearer ' prefix)

    Returns:
        The user_id from the token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("user_id") or payload.get("sub")
        if user_id is None:
            raise TokenError("Token missing user_id claim", is_expired=False)
        return user_id

    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        raise HTTPException(
            status_code=401,
            detail="Token expired. Please login again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Invalid token. Please login again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except TokenError as e:
        raise HTTPException(status_code=401, detail=e.message)
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Token verification failed")


def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    FastAPI dependency for verifying JWT tokens from Authorization header.
    Use this with Depends() in route definitions.
    """
    return verify_token_string(credentials.credentials)
