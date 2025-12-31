"""
Authentication Service with Secure Password Hashing
Handles user signup, login, and token management
"""

import secrets
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple
from passlib.context import CryptContext

# ============================================================================
# Password Hashing Configuration
# ============================================================================

# Single source of truth for password hashing - bcrypt with 12 rounds
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # OWASP recommended minimum
)


# ============================================================================
# Password Strength Validation
# ============================================================================

class PasswordValidator:
    """Password strength validation per OWASP guidelines"""
    
    MIN_LENGTH = 12
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGIT = True
    REQUIRE_SPECIAL = True
    
    @staticmethod
    def validate(password: str) -> Tuple[bool, str]:
        """
        Validate password strength.
        
        Returns:
            Tuple of (is_valid, message)
        """
        
        if len(password) < PasswordValidator.MIN_LENGTH:
            return False, f"Password must be at least {PasswordValidator.MIN_LENGTH} characters"
        
        if PasswordValidator.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if PasswordValidator.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if PasswordValidator.REQUIRE_DIGIT and not re.search(r'\d', password):
            return False, "Password must contain at least one digit"
        
        if PasswordValidator.REQUIRE_SPECIAL:
            if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', password):
                return False, "Password must contain at least one special character"
        
        return True, "Password is strong"


# ============================================================================
# Authentication Service
# ============================================================================

class AuthService:
    """In-memory auth service for development with secure password hashing"""
    
    def __init__(self):
        # In-memory stores: {email: user_data}, {token: token_data}
        self.users: Dict[str, Dict] = {}
        self.tokens: Dict[str, Dict] = {}
        self.sessions: Dict[str, Dict] = {}
        self.pwd_context = pwd_context
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt (12 rounds)"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against bcrypt hash"""
        try:
            return self.pwd_context.verify(password, hashed)
        except Exception:
            return False
    
    def generate_token(self) -> str:
        """Generate secure token"""
        return secrets.token_urlsafe(32)
    
    def generate_user_id(self) -> str:
        """Generate unique user ID"""
        return f"user_{secrets.token_hex(8)}"
    
    def signup(self, email: str, password: str, first_name: str, last_name: str) -> Tuple[bool, Dict]:
        """Create new user account with password strength validation"""
        # Check if user exists
        if email in self.users:
            return False, {"error": "User already exists"}
        
        if not email or not password:
            return False, {"error": "Email and password required"}
        
        # Validate password strength
        is_valid, message = PasswordValidator.validate(password)
        if not is_valid:
            return False, {"error": message}
        
        # Create user
        user_id = self.generate_user_id()
        password_hash = self.hash_password(password)
        
        user = {
            "user_id": user_id,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "password_hash": password_hash,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "points": 1000,  # Starting points
            "verified": True,
        }
        
        self.users[email] = user
        
        # Generate tokens
        access_token = self.generate_token()
        refresh_token = self.generate_token()
        expires_in = 3600  # 1 hour
        expires_at = (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat()
        
        self.tokens[access_token] = {
            "user_id": user_id,
            "email": email,
            "expires_at": expires_at,
            "refresh_token": refresh_token,
        }
        
        return True, {
            "user": {
                "id": user_id,
                "email": email,
                "firstName": first_name,
                "lastName": last_name,
                "createdAt": user["created_at"],
                "points": 1000,
            },
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "expiresIn": expires_in,
        }
    
    def login(self, email: str, password: str) -> Tuple[bool, Dict]:
        """Authenticate user with secure password verification"""
        if not email or not password:
            return False, {"error": "Email and password required"}
        
        if email not in self.users:
            return False, {"error": "Invalid email or password"}
        
        user = self.users[email]
        
        if not self.verify_password(password, user["password_hash"]):
            return False, {"error": "Invalid email or password"}
        
        # Generate tokens
        access_token = self.generate_token()
        refresh_token = self.generate_token()
        expires_in = 3600
        expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()
        
        self.tokens[access_token] = {
            "user_id": user["user_id"],
            "email": email,
            "expires_at": expires_at,
            "refresh_token": refresh_token,
        }
        
        return True, {
            "user": {
                "id": user["user_id"],
                "email": email,
                "firstName": user["first_name"],
                "lastName": user["last_name"],
                "createdAt": user["created_at"],
                "points": user.get("points", 0),
            },
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "expiresIn": expires_in,
        }
    
    def refresh(self, refresh_token: str) -> Tuple[bool, Dict]:
        """Refresh access token"""
        # Find token by refresh_token
        access_token = None
        for token, data in self.tokens.items():
            if data.get("refresh_token") == refresh_token:
                access_token = token
                break
        
        if not access_token:
            return False, {"error": "Invalid refresh token"}
        
        token_data = self.tokens[access_token]
        user_id = token_data["user_id"]
        email = token_data["email"]
        
        # Generate new access token
        new_access_token = self.generate_token()
        expires_in = 3600
        expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()
        
        self.tokens[new_access_token] = {
            "user_id": user_id,
            "email": email,
            "expires_at": expires_at,
            "refresh_token": refresh_token,
        }
        
        # Clean up old token
        del self.tokens[access_token]
        
        return True, {
            "accessToken": new_access_token,
            "expiresIn": expires_in,
        }
    
    def verify_token(self, access_token: str) -> Tuple[bool, Optional[Dict]]:
        """Verify access token"""
        if access_token not in self.tokens:
            return False, None
        
        token_data = self.tokens[access_token]
        
        # Check expiration
        expires_at = datetime.fromisoformat(token_data["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            del self.tokens[access_token]
            return False, None
        
        return True, token_data
