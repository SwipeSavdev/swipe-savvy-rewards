"""
Secure Pydantic models with input validation for concierge service.

Implements:
- Field length validation
- Character restrictions
- XSS prevention
- Injection attack prevention
- Email validation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict
import html
import re
from datetime import datetime

# ============================================================================
# Validation Utilities
# ============================================================================

class InputSanitizer:
    """Sanitize user input to prevent attacks"""
    
    @staticmethod
    def sanitize_message(text: str) -> str:
        """Sanitize message to prevent XSS/injection attacks"""
        # HTML escape to prevent injection
        sanitized = html.escape(text).strip()
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'<\s*script',  # Script tags
            r'javascript:',  # JavaScript protocol
            r'on\w+\s*=',  # Event handlers (onclick, onload, etc.)
            r'<\s*iframe',  # Iframe tags
            r'<\s*object',  # Object tags
            r'<\s*embed',  # Embed tags
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, sanitized, re.IGNORECASE):
                raise ValueError('Message contains potentially harmful content')
        
        return sanitized
    
    @staticmethod
    def sanitize_identifier(text: str) -> str:
        """Sanitize identifiers (IDs, session IDs)"""
        # Only allow alphanumeric, hyphens, underscores
        if not re.match(r'^[a-zA-Z0-9_-]+$', text):
            raise ValueError('Identifier contains invalid characters')
        return text
    
    @staticmethod
    def sanitize_string(text: str, max_length: int = 255) -> str:
        """Basic string sanitization"""
        sanitized = text.strip()
        if len(sanitized) > max_length:
            raise ValueError(f'String exceeds maximum length of {max_length}')
        # Remove any control characters
        sanitized = ''.join(char for char in sanitized if ord(char) >= 32)
        return sanitized


# ============================================================================
# Context Models
# ============================================================================

class ContextData(BaseModel):
    """Validated context data structure"""
    account_type: str = Field(..., min_length=1, max_length=50)
    user_name: str = Field(..., min_length=1, max_length=100)
    optional_data: Optional[Dict] = None
    
    @validator('account_type')
    def validate_account_type(cls, v):
        """Ensure account_type is from allowed list"""
        allowed_types = [
            'mobile_wallet', 
            'business', 
            'premium', 
            'student',
            'standard',
            'corporate'
        ]
        if v not in allowed_types:
            raise ValueError(f'account_type must be one of {allowed_types}')
        return v
    
    @validator('user_name')
    def sanitize_user_name(cls, v):
        """Remove special characters from user name"""
        # Allow alphanumeric, spaces, hyphens, underscores, periods
        if not re.match(r'^[a-zA-Z0-9\s\-_.\']+$', v):
            raise ValueError('user_name contains invalid characters')
        return v.strip()


# ============================================================================
# Chat Models with Validation
# ============================================================================

class ChatRequest(BaseModel):
    """Validated chat request with input constraints"""
    message: str = Field(
        ..., 
        min_length=1, 
        max_length=2000,
        description="User message (1-2000 characters)"
    )
    user_id: str = Field(
        ..., 
        min_length=10, 
        max_length=50,
        pattern="^[a-zA-Z0-9_-]+$",
        description="User ID (alphanumeric, dash, underscore)"
    )
    session_id: str = Field(
        ..., 
        min_length=10, 
        max_length=50,
        pattern="^[a-zA-Z0-9_-]+$",
        description="Session ID (alphanumeric, dash, underscore)"
    )
    context: Optional[ContextData] = None
    
    @validator('message')
    def sanitize_message(cls, v):
        """Sanitize message to prevent XSS/injection"""
        return InputSanitizer.sanitize_message(v)
    
    @validator('user_id', 'session_id')
    def validate_identifiers(cls, v):
        """Validate identifier format"""
        return InputSanitizer.sanitize_identifier(v)
    
    class Config:
        """Pydantic config"""
        # Prevent extra fields to avoid confusion
        extra = "forbid"
        # Show field validation errors
        validate_assignment = True


# ============================================================================
# Authentication Models
# ============================================================================

class SignupRequest(BaseModel):
    """Signup request with password strength validation"""
    email: str = Field(
        ..., 
        min_length=5, 
        max_length=255,
        pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    password: str = Field(..., min_length=12)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        # Check for uppercase
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        # Check for lowercase
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        # Check for digit
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        # Check for special character
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', v):
            raise ValueError('Password must contain at least one special character')
        
        return v
    
    @validator('first_name', 'last_name')
    def sanitize_names(cls, v):
        """Remove special characters from names"""
        if not re.match(r'^[a-zA-Z\s\-\.\']+$', v):
            raise ValueError('Name contains invalid characters')
        return v.strip()
    
    class Config:
        extra = "forbid"


class LoginRequest(BaseModel):
    """Login request"""
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1, max_length=255)
    
    class Config:
        extra = "forbid"


# ============================================================================
# Transaction Models
# ============================================================================

class TransactionRequest(BaseModel):
    """Create transaction request"""
    amount: float = Field(..., gt=0, le=1000000)  # Positive, max 1M
    transaction_type: str = Field(..., min_length=1, max_length=50)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    
    @validator('transaction_type')
    def validate_transaction_type(cls, v):
        """Ensure transaction_type is valid"""
        allowed_types = ['deposit', 'withdrawal', 'transfer', 'payment', 'refund']
        if v.lower() not in allowed_types:
            raise ValueError(f'transaction_type must be one of {allowed_types}')
        return v.lower()
    
    @validator('category', 'description')
    def sanitize_optional_fields(cls, v):
        """Sanitize optional text fields"""
        if v is None:
            return v
        return InputSanitizer.sanitize_string(v)
    
    class Config:
        extra = "forbid"


# ============================================================================
# Account Models
# ============================================================================

class CreateAccountRequest(BaseModel):
    """Create account request"""
    account_type: str = Field(..., min_length=1, max_length=50)
    account_name: str = Field(..., min_length=1, max_length=100)
    initial_balance: float = Field(default=0, ge=0, le=1000000)
    
    @validator('account_type')
    def validate_account_type(cls, v):
        """Validate account type"""
        allowed_types = ['checking', 'savings', 'investment', 'credit']
        if v.lower() not in allowed_types:
            raise ValueError(f'account_type must be one of {allowed_types}')
        return v.lower()
    
    @validator('account_name')
    def sanitize_account_name(cls, v):
        """Sanitize account name"""
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError('account_name contains invalid characters')
        return v.strip()
    
    class Config:
        extra = "forbid"


# ============================================================================
# Response Models
# ============================================================================

class ChatResponse(BaseModel):
    """Chat response"""
    success: bool
    response: Optional[str] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        extra = "forbid"


class ErrorResponse(BaseModel):
    """Error response"""
    success: bool = False
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        extra = "forbid"
