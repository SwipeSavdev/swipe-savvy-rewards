"""
Tests for input validation and sanitization in concierge service
"""

import pytest
from services.concierge_service.models import (
    ChatRequest,
    SignupRequest,
    LoginRequest,
    TransactionRequest,
    CreateAccountRequest,
    InputSanitizer
)


# ============================================================================
# Input Sanitizer Tests
# ============================================================================

class TestInputSanitizer:
    """Test input sanitization utilities"""
    
    def test_sanitize_message_safe_input(self):
        """Safe message should pass through"""
        safe_msg = "Hello, what's my account balance?"
        result = InputSanitizer.sanitize_message(safe_msg)
        assert "Hello" in result
    
    def test_sanitize_message_xss_injection(self):
        """XSS injection attempt should be blocked"""
        xss_msg = "<script>alert('xss')</script>"
        with pytest.raises(ValueError, match="harmful"):
            InputSanitizer.sanitize_message(xss_msg)
    
    def test_sanitize_message_javascript_protocol(self):
        """JavaScript protocol should be blocked"""
        js_msg = "javascript:alert('xss')"
        with pytest.raises(ValueError, match="harmful"):
            InputSanitizer.sanitize_message(js_msg)
    
    def test_sanitize_message_event_handler(self):
        """Event handlers should be blocked"""
        event_msg = '<img src="x" onerror="alert(1)">'
        with pytest.raises(ValueError, match="harmful"):
            InputSanitizer.sanitize_message(event_msg)
    
    def test_sanitize_identifier_valid(self):
        """Valid identifier should pass"""
        valid_id = "user_123-abc"
        result = InputSanitizer.sanitize_identifier(valid_id)
        assert result == valid_id
    
    def test_sanitize_identifier_invalid(self):
        """Invalid identifier characters should be rejected"""
        invalid_id = "user@123"
        with pytest.raises(ValueError, match="invalid"):
            InputSanitizer.sanitize_identifier(invalid_id)
    
    def test_sanitize_string_length_check(self):
        """String exceeding max length should be rejected"""
        long_string = "x" * 300
        with pytest.raises(ValueError, match="exceeds"):
            InputSanitizer.sanitize_string(long_string, max_length=255)


# ============================================================================
# Chat Request Validation Tests
# ============================================================================

class TestChatRequest:
    """Test ChatRequest validation"""
    
    def test_chat_request_valid(self):
        """Valid chat request should be accepted"""
        request = ChatRequest(
            message="Hello, what's my account balance?",
            user_id="valid_user_123",
            session_id="session_456"
        )
        assert request.message is not None
    
    def test_chat_message_too_long(self):
        """Message exceeding max length should be rejected"""
        with pytest.raises(ValueError, match="max_length"):
            ChatRequest(
                message="x" * 3000,
                user_id="valid_user_123",
                session_id="session_456"
            )
    
    def test_chat_message_empty(self):
        """Empty message should be rejected"""
        with pytest.raises(ValueError, match="at least 1"):
            ChatRequest(
                message="",
                user_id="valid_user_123",
                session_id="session_456"
            )
    
    def test_chat_xss_injection(self):
        """XSS injection in message should be blocked"""
        with pytest.raises(ValueError, match="harmful"):
            ChatRequest(
                message="<script>alert('xss')</script>",
                user_id="valid_user_123",
                session_id="session_456"
            )
    
    def test_chat_user_id_invalid(self):
        """Invalid user ID should be rejected"""
        with pytest.raises(ValueError, match="invalid"):
            ChatRequest(
                message="Hello",
                user_id="user@invalid",  # @ is not allowed
                session_id="session_456"
            )
    
    def test_chat_session_id_too_short(self):
        """Session ID too short should be rejected"""
        with pytest.raises(ValueError, match="ensure this value has at least 10 characters"):
            ChatRequest(
                message="Hello",
                user_id="valid_user_123",
                session_id="sess"  # Too short
            )
    
    def test_chat_extra_fields_rejected(self):
        """Extra fields should be rejected"""
        with pytest.raises(ValueError, match="extra"):
            ChatRequest(
                message="Hello",
                user_id="valid_user_123",
                session_id="session_456",
                extra_field="not allowed"
            )


# ============================================================================
# Signup Request Tests
# ============================================================================

class TestSignupRequest:
    """Test SignupRequest validation"""
    
    def test_signup_valid(self):
        """Valid signup request should be accepted"""
        request = SignupRequest(
            email="user@example.com",
            password="SecurePass123!",
            first_name="John",
            last_name="Doe"
        )
        assert request.email == "user@example.com"
    
    def test_signup_password_too_short(self):
        """Password shorter than 12 characters should be rejected"""
        with pytest.raises(ValueError, match="at least 12"):
            SignupRequest(
                email="user@example.com",
                password="Short1!",  # Only 7 characters
                first_name="John",
                last_name="Doe"
            )
    
    def test_signup_password_no_uppercase(self):
        """Password without uppercase should be rejected"""
        with pytest.raises(ValueError, match="uppercase"):
            SignupRequest(
                email="user@example.com",
                password="securepass123!",
                first_name="John",
                last_name="Doe"
            )
    
    def test_signup_password_no_lowercase(self):
        """Password without lowercase should be rejected"""
        with pytest.raises(ValueError, match="lowercase"):
            SignupRequest(
                email="user@example.com",
                password="SECUREPASS123!",
                first_name="John",
                last_name="Doe"
            )
    
    def test_signup_password_no_digit(self):
        """Password without digit should be rejected"""
        with pytest.raises(ValueError, match="digit"):
            SignupRequest(
                email="user@example.com",
                password="SecurePass!",
                first_name="John",
                last_name="Doe"
            )
    
    def test_signup_password_no_special(self):
        """Password without special character should be rejected"""
        with pytest.raises(ValueError, match="special"):
            SignupRequest(
                email="user@example.com",
                password="SecurePass123",
                first_name="John",
                last_name="Doe"
            )
    
    def test_signup_invalid_email(self):
        """Invalid email format should be rejected"""
        with pytest.raises(ValueError):
            SignupRequest(
                email="not-an-email",
                password="SecurePass123!",
                first_name="John",
                last_name="Doe"
            )
    
    def test_signup_invalid_name_characters(self):
        """Invalid characters in names should be rejected"""
        with pytest.raises(ValueError, match="invalid"):
            SignupRequest(
                email="user@example.com",
                password="SecurePass123!",
                first_name="John@123",  # Invalid characters
                last_name="Doe"
            )


# ============================================================================
# Transaction Request Tests
# ============================================================================

class TestTransactionRequest:
    """Test TransactionRequest validation"""
    
    def test_transaction_valid(self):
        """Valid transaction request should be accepted"""
        request = TransactionRequest(
            amount=100.50,
            transaction_type="transfer",
            description="Payment to John"
        )
        assert request.amount == 100.50
    
    def test_transaction_negative_amount(self):
        """Negative amount should be rejected"""
        with pytest.raises(ValueError, match="greater than 0"):
            TransactionRequest(
                amount=-50,
                transaction_type="transfer"
            )
    
    def test_transaction_zero_amount(self):
        """Zero amount should be rejected"""
        with pytest.raises(ValueError, match="greater than 0"):
            TransactionRequest(
                amount=0,
                transaction_type="transfer"
            )
    
    def test_transaction_amount_too_large(self):
        """Amount exceeding maximum should be rejected"""
        with pytest.raises(ValueError, match="less than or equal to"):
            TransactionRequest(
                amount=2000000,  # Exceeds 1M limit
                transaction_type="transfer"
            )
    
    def test_transaction_invalid_type(self):
        """Invalid transaction type should be rejected"""
        with pytest.raises(ValueError, match="deposit|withdrawal|transfer|payment|refund"):
            TransactionRequest(
                amount=100,
                transaction_type="invalid_type"
            )


# ============================================================================
# Account Creation Tests
# ============================================================================

class TestCreateAccountRequest:
    """Test CreateAccountRequest validation"""
    
    def test_create_account_valid(self):
        """Valid account creation request should be accepted"""
        request = CreateAccountRequest(
            account_type="checking",
            account_name="Main Checking",
            initial_balance=1000
        )
        assert request.account_type == "checking"
    
    def test_create_account_invalid_type(self):
        """Invalid account type should be rejected"""
        with pytest.raises(ValueError, match="checking|savings|investment|credit"):
            CreateAccountRequest(
                account_type="invalid",
                account_name="My Account"
            )
    
    def test_create_account_negative_balance(self):
        """Negative initial balance should be rejected"""
        with pytest.raises(ValueError, match="greater than or equal to"):
            CreateAccountRequest(
                account_type="checking",
                account_name="My Account",
                initial_balance=-100
            )
    
    def test_create_account_invalid_name_characters(self):
        """Invalid characters in account name should be rejected"""
        with pytest.raises(ValueError, match="invalid"):
            CreateAccountRequest(
                account_type="checking",
                account_name="My@Account#123"
            )


# ============================================================================
# Integration Tests
# ============================================================================

class TestValidationIntegration:
    """Integration tests for multiple validation scenarios"""
    
    def test_sql_injection_attempt_in_message(self):
        """SQL injection attempt should be blocked"""
        with pytest.raises(ValueError, match="harmful"):
            ChatRequest(
                message="'; DROP TABLE users; --",
                user_id="valid_user_123",
                session_id="session_456"
            )
    
    def test_command_injection_attempt(self):
        """Command injection attempt should be blocked"""
        with pytest.raises(ValueError, match="harmful"):
            ChatRequest(
                message="; rm -rf /",
                user_id="valid_user_123",
                session_id="session_456"
            )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
