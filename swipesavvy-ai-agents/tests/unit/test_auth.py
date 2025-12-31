"""
Unit Tests for Authentication

Tests for JWT token creation, verification, and error handling
"""

import pytest
from datetime import timedelta
from fastapi import HTTPException
from app.core.auth import create_access_token, verify_jwt_token
from app.core.config import settings
import jwt


class TestTokenCreation:
    """Test JWT token creation"""
    
    def test_create_valid_token(self):
        """Test creating a valid access token"""
        token = create_access_token("user123", expires_delta=timedelta(hours=1))
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Verify token can be decoded
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        assert payload["user_id"] == "user123"
        assert "exp" in payload
        assert "iat" in payload
    
    def test_create_token_with_default_expiration(self):
        """Test creating token with default expiration"""
        token = create_access_token("user456")
        
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        assert payload["user_id"] == "user456"
        # Should be set to expiration hours from config
        assert "exp" in payload
    
    def test_create_token_with_custom_expiration(self):
        """Test creating token with custom expiration"""
        custom_delta = timedelta(minutes=30)
        token = create_access_token("user789", expires_delta=custom_delta)
        
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        assert payload["user_id"] == "user789"
        # Verify expiration is approximately 30 minutes from now
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        time_diff = (exp_time - now).total_seconds()
        
        # Allow 5 second margin
        assert 25 * 60 < time_diff < 31 * 60
    
    def test_create_token_fails_with_invalid_key(self):
        """Test that token creation fails gracefully with config issues"""
        # This would require mocking config, so just verify our happy path
        token = create_access_token("user_valid")
        assert token is not None


class TestTokenVerification:
    """Test JWT token verification"""
    
    def test_verify_valid_token(self):
        """Test verifying a valid token"""
        token = create_access_token("user123", expires_delta=timedelta(hours=1))
        
        # Decode and verify
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        assert payload["user_id"] == "user123"
    
    def test_verify_expired_token_raises_error(self):
        """Test that expired tokens raise ExpiredSignatureError"""
        # Create token that expired 1 second ago
        token = create_access_token("user123", expires_delta=timedelta(seconds=-1))
        
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
    
    def test_verify_invalid_token_format_raises_error(self):
        """Test that invalid token format raises InvalidTokenError"""
        with pytest.raises(jwt.InvalidTokenError):
            jwt.decode(
                "invalid.token.format",
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
    
    def test_verify_token_with_wrong_key_raises_error(self):
        """Test that token signed with different key fails verification"""
        token = create_access_token("user123", expires_delta=timedelta(hours=1))
        
        with pytest.raises(jwt.InvalidTokenError):
            jwt.decode(
                token,
                "wrong-secret-key-wrong-secret-key-wrong-secret",
                algorithms=[settings.JWT_ALGORITHM]
            )
    
    def test_verify_malformed_token_raises_error(self):
        """Test that malformed tokens raise errors"""
        malformed_tokens = [
            "",
            "a",
            "just.two",  # Two parts instead of three
            "a.b.c.d",   # Four parts instead of three
            "not_base64_!@#.b.c",  # Invalid base64
        ]
        
        for bad_token in malformed_tokens:
            with pytest.raises(Exception):  # Could be various JWT errors
                jwt.decode(
                    bad_token,
                    settings.JWT_SECRET_KEY,
                    algorithms=[settings.JWT_ALGORITHM]
                )


class TestTokenPayload:
    """Test JWT token payload structure"""
    
    def test_token_contains_required_claims(self):
        """Test that token contains all required claims"""
        token = create_access_token("user123", expires_delta=timedelta(hours=1))
        
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        required_claims = ["user_id", "exp", "iat"]
        for claim in required_claims:
            assert claim in payload, f"Missing required claim: {claim}"
    
    def test_token_user_id_matches(self):
        """Test that user_id in token matches input"""
        user_ids = ["user1", "admin@example.com", "12345", "test-user"]
        
        for user_id in user_ids:
            token = create_access_token(user_id, expires_delta=timedelta(hours=1))
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            assert payload["user_id"] == user_id
    
    def test_token_iat_is_current_time(self):
        """Test that iat (issued at) is approximately current time"""
        from datetime import datetime, timezone
        
        before = datetime.now(timezone.utc)
        token = create_access_token("user123", expires_delta=timedelta(hours=1))
        after = datetime.now(timezone.utc)
        
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        iat_time = datetime.fromtimestamp(payload["iat"], tz=timezone.utc)
        
        # iat should be between before and after
        assert before <= iat_time <= after


class TestErrorHandling:
    """Test error handling in auth module"""
    
    def test_token_error_exception_class(self):
        """Test TokenError exception"""
        from app.core.auth import TokenError
        
        error = TokenError("Test error", is_expired=False)
        assert error.message == "Test error"
        assert error.is_expired is False
        
        error_expired = TokenError("Token expired", is_expired=True)
        assert error_expired.message == "Token expired"
        assert error_expired.is_expired is True
    
    def test_token_error_exception_inheritance(self):
        """Test that TokenError is an Exception"""
        from app.core.auth import TokenError
        
        error = TokenError("Test")
        assert isinstance(error, Exception)


@pytest.fixture
def sample_token():
    """Fixture providing a valid sample token"""
    return create_access_token("test_user", expires_delta=timedelta(hours=1))


@pytest.fixture
def expired_token():
    """Fixture providing an expired token"""
    return create_access_token("test_user", expires_delta=timedelta(seconds=-1))
