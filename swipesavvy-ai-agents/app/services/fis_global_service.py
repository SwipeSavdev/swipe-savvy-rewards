"""
FIS Global Payment One - Base Service

Core service for FIS Global CodeConnect API integration.
Handles authentication, HTTP requests, and common operations for:
- Card Issuance & Management
- PIN Management
- Card Controls
- Transaction Processing
- Fraud Detection
- Digital Wallet Provisioning

This is the base client that all FIS-specific services inherit from.
"""

import os
import logging
import hashlib
import hmac
import time
import json
import base64
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
import httpx
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


# =============================================================================
# ENUMS
# =============================================================================

class FISEnvironment(str, Enum):
    """FIS API environments"""
    SANDBOX = "sandbox"
    PRODUCTION = "production"


class FISCardStatus(str, Enum):
    """Card status codes from FIS"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    LOCKED = "locked"
    FROZEN = "frozen"
    LOST = "lost"
    STOLEN = "stolen"
    EXPIRED = "expired"
    CLOSED = "closed"
    PENDING_ACTIVATION = "pending_activation"


class FISCardType(str, Enum):
    """Card types"""
    VIRTUAL = "virtual"
    PHYSICAL = "physical"


class FISTransactionType(str, Enum):
    """Transaction types"""
    PURCHASE = "purchase"
    ATM_WITHDRAWAL = "atm_withdrawal"
    REFUND = "refund"
    TRANSFER = "transfer"
    FEE = "fee"
    ADJUSTMENT = "adjustment"


class FISTransactionStatus(str, Enum):
    """Transaction statuses"""
    PENDING = "pending"
    COMPLETED = "completed"
    DECLINED = "declined"
    REVERSED = "reversed"
    DISPUTED = "disputed"


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class FISAuthToken(BaseModel):
    """OAuth2 token response from FIS"""
    access_token: str
    token_type: str = "Bearer"
    expires_in: int = 3600
    scope: Optional[str] = None
    issued_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def is_expired(self) -> bool:
        """Check if token has expired"""
        expiry = self.issued_at + timedelta(seconds=self.expires_in - 60)  # 60s buffer
        return datetime.utcnow() >= expiry


class FISAPIResponse(BaseModel):
    """Standard FIS API response wrapper"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class FISCardData(BaseModel):
    """Card data from FIS"""
    card_id: str
    card_token: str
    card_type: FISCardType
    status: FISCardStatus
    last_four: str
    expiry_month: int
    expiry_year: int
    cardholder_name: str
    card_program: Optional[str] = None
    created_at: datetime
    activated_at: Optional[datetime] = None


class FISTransactionData(BaseModel):
    """Transaction data from FIS"""
    transaction_id: str
    card_id: str
    type: FISTransactionType
    status: FISTransactionStatus
    amount: float
    currency: str = "USD"
    merchant_name: Optional[str] = None
    merchant_category_code: Optional[str] = None
    merchant_city: Optional[str] = None
    merchant_country: Optional[str] = None
    authorization_code: Optional[str] = None
    created_at: datetime
    settled_at: Optional[datetime] = None


# =============================================================================
# FIS GLOBAL BASE SERVICE
# =============================================================================

class FISGlobalService:
    """
    Base service for FIS Global Payment One API.

    Provides:
    - OAuth2 authentication
    - HTTP client with retry logic
    - Request signing
    - Error handling
    """

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        api_url: Optional[str] = None,
        environment: Optional[str] = None,
        webhook_secret: Optional[str] = None
    ):
        """
        Initialize FIS Global service.

        Args:
            client_id: FIS OAuth2 client ID
            client_secret: FIS OAuth2 client secret
            api_url: FIS API base URL
            environment: 'sandbox' or 'production'
            webhook_secret: Secret for verifying webhook signatures
        """
        self.client_id = client_id or os.getenv("FIS_CLIENT_ID", "")
        self.client_secret = client_secret or os.getenv("FIS_CLIENT_SECRET", "")
        self.webhook_secret = webhook_secret or os.getenv("FIS_WEBHOOK_SECRET", "")

        # Determine environment
        env_str = environment or os.getenv("FIS_ENVIRONMENT", "sandbox")
        self.environment = FISEnvironment(env_str.lower())

        # Set API URL based on environment
        if api_url:
            self.api_url = api_url.rstrip('/')
        elif self.environment == FISEnvironment.PRODUCTION:
            self.api_url = os.getenv(
                "FIS_API_URL",
                "https://api-gw.fisglobal.com"
            ).rstrip('/')
        else:
            # UAT/Sandbox environment
            self.api_url = os.getenv(
                "FIS_API_URL",
                "https://api-gw-uat.fisglobal.com"
            ).rstrip('/')

        # Authentication token cache
        self._auth_token: Optional[FISAuthToken] = None

        # HTTP client
        self._client: Optional[httpx.AsyncClient] = None

        # Check if service is configured
        self.mock_mode = not (self.client_id and self.client_secret)

        if self.mock_mode:
            logger.warning(
                "FIS Global service running in MOCK mode - "
                "FIS_CLIENT_ID and FIS_CLIENT_SECRET not configured"
            )
        else:
            logger.info(
                f"FIS Global service initialized - Environment: {self.environment.value}"
            )

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                follow_redirects=True
            )
        return self._client

    async def close(self):
        """Close HTTP client"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # =========================================================================
    # AUTHENTICATION
    # =========================================================================

    async def _get_auth_token(self) -> str:
        """
        Get OAuth2 access token, refreshing if expired.

        Returns:
            Access token string
        """
        if self.mock_mode:
            return "mock_access_token"

        # Check if we have a valid cached token
        if self._auth_token and not self._auth_token.is_expired:
            return self._auth_token.access_token

        # Request new token
        client = await self._get_client()

        # FIS uses Basic Auth with base64 encoded consumer_key:consumer_secret
        credentials = f"{self.client_id}:{self.client_secret}"
        basic_auth = base64.b64encode(credentials.encode()).decode()

        try:
            response = await client.post(
                f"{self.api_url}/token",
                data={
                    "grant_type": "client_credentials"
                },
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": f"Basic {basic_auth}"
                }
            )

            if response.status_code == 200:
                data = response.json()
                self._auth_token = FISAuthToken(
                    access_token=data["access_token"],
                    token_type=data.get("token_type", "Bearer"),
                    expires_in=data.get("expires_in", 3600),
                    scope=data.get("scope")
                )
                logger.info("FIS OAuth2 token obtained successfully")
                return self._auth_token.access_token
            else:
                logger.error(f"FIS OAuth2 token request failed: {response.text}")
                raise Exception(f"Failed to obtain FIS access token: {response.status_code}")

        except Exception as e:
            logger.error(f"FIS authentication error: {str(e)}")
            raise

    def _generate_request_signature(
        self,
        method: str,
        path: str,
        timestamp: str,
        body: Optional[str] = None
    ) -> str:
        """
        Generate HMAC signature for request authentication.

        Args:
            method: HTTP method
            path: Request path
            timestamp: ISO timestamp
            body: Request body JSON string

        Returns:
            Base64 encoded HMAC-SHA256 signature
        """
        message = f"{method}\n{path}\n{timestamp}"
        if body:
            message += f"\n{body}"

        signature = hmac.new(
            self.client_secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        return signature

    # =========================================================================
    # HTTP REQUESTS
    # =========================================================================

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        retry_count: int = 3
    ) -> FISAPIResponse:
        """
        Make authenticated HTTP request to FIS API.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint (without base URL)
            data: Request body data
            params: Query parameters
            headers: Additional headers
            retry_count: Number of retries on failure

        Returns:
            FISAPIResponse object
        """
        if self.mock_mode:
            return self._mock_response(method, endpoint, data)

        client = await self._get_client()
        token = await self._get_auth_token()

        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        timestamp = datetime.utcnow().isoformat() + "Z"

        # Build headers
        request_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Request-Timestamp": timestamp,
            "X-Request-ID": self._generate_request_id()
        }

        # Add signature if we have a secret
        if self.client_secret:
            body_str = json.dumps(data) if data else None
            signature = self._generate_request_signature(
                method.upper(), endpoint, timestamp, body_str
            )
            request_headers["X-Request-Signature"] = signature

        if headers:
            request_headers.update(headers)

        # Make request with retry logic
        last_error = None
        for attempt in range(retry_count):
            try:
                if method.upper() == "GET":
                    response = await client.get(url, params=params, headers=request_headers)
                elif method.upper() == "POST":
                    response = await client.post(url, json=data, params=params, headers=request_headers)
                elif method.upper() == "PUT":
                    response = await client.put(url, json=data, params=params, headers=request_headers)
                elif method.upper() == "DELETE":
                    response = await client.delete(url, params=params, headers=request_headers)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")

                return self._parse_response(response)

            except httpx.TimeoutException as e:
                last_error = e
                logger.warning(f"FIS API timeout (attempt {attempt + 1}/{retry_count}): {str(e)}")
                if attempt < retry_count - 1:
                    await self._exponential_backoff(attempt)

            except httpx.RequestError as e:
                last_error = e
                logger.warning(f"FIS API request error (attempt {attempt + 1}/{retry_count}): {str(e)}")
                if attempt < retry_count - 1:
                    await self._exponential_backoff(attempt)

        # All retries failed
        logger.error(f"FIS API request failed after {retry_count} attempts: {str(last_error)}")
        return FISAPIResponse(
            success=False,
            error_code="REQUEST_FAILED",
            error_message=f"Request failed after {retry_count} attempts: {str(last_error)}"
        )

    def _parse_response(self, response: httpx.Response) -> FISAPIResponse:
        """Parse HTTP response into FISAPIResponse"""
        try:
            data = response.json() if response.content else {}
        except json.JSONDecodeError:
            data = {}

        if response.status_code >= 200 and response.status_code < 300:
            return FISAPIResponse(
                success=True,
                data=data,
                request_id=response.headers.get("X-Request-ID")
            )
        else:
            return FISAPIResponse(
                success=False,
                data=data,
                error_code=data.get("error_code", f"HTTP_{response.status_code}"),
                error_message=data.get("error_message", data.get("message", response.text)),
                request_id=response.headers.get("X-Request-ID")
            )

    async def _exponential_backoff(self, attempt: int):
        """Exponential backoff delay between retries"""
        import asyncio
        delay = min(2 ** attempt, 30)  # Max 30 seconds
        await asyncio.sleep(delay)

    def _generate_request_id(self) -> str:
        """Generate unique request ID"""
        import uuid
        return f"ss-{uuid.uuid4().hex[:16]}"

    # =========================================================================
    # WEBHOOK VERIFICATION
    # =========================================================================

    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str,
        timestamp: str
    ) -> bool:
        """
        Verify webhook signature from FIS.

        Args:
            payload: Raw webhook payload bytes
            signature: X-FIS-Signature header value
            timestamp: X-FIS-Timestamp header value

        Returns:
            True if signature is valid
        """
        if not self.webhook_secret:
            logger.warning("Webhook secret not configured, skipping verification")
            return True

        # Recreate the signed message
        message = f"{timestamp}.{payload.decode('utf-8')}"

        expected_signature = hmac.new(
            self.webhook_secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_signature, signature)

    # =========================================================================
    # MOCK RESPONSES (for development without FIS credentials)
    # =========================================================================

    def _mock_response(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None
    ) -> FISAPIResponse:
        """Generate mock response for development mode"""
        logger.info(f"FIS MOCK: {method} {endpoint}")

        # Generate mock responses based on endpoint
        if "cards" in endpoint:
            if method.upper() == "POST" and "issue" in endpoint:
                return self._mock_card_issuance(data)
            elif "activate" in endpoint:
                return self._mock_card_activation(data)
            elif "lock" in endpoint or "unlock" in endpoint:
                return self._mock_card_lock(endpoint)
            else:
                return self._mock_card_details()

        elif "pin" in endpoint:
            return self._mock_pin_operation(endpoint, data)

        elif "transactions" in endpoint:
            return self._mock_transactions()

        elif "wallet" in endpoint:
            return self._mock_wallet_operation(endpoint, data)

        elif "kyc" in endpoint or "identity" in endpoint:
            return self._mock_kyc_operation(endpoint, data)

        # Default mock response
        return FISAPIResponse(
            success=True,
            data={"message": "Mock response", "endpoint": endpoint},
            request_id=self._generate_request_id()
        )

    def _mock_card_issuance(self, data: Optional[Dict] = None) -> FISAPIResponse:
        """Mock card issuance response"""
        import uuid
        card_id = f"card_{uuid.uuid4().hex[:12]}"
        return FISAPIResponse(
            success=True,
            data={
                "card_id": card_id,
                "card_token": f"tok_{uuid.uuid4().hex}",
                "card_type": data.get("card_type", "virtual") if data else "virtual",
                "status": "pending_activation",
                "last_four": "4242",
                "expiry_month": 12,
                "expiry_year": 2028,
                "cardholder_name": data.get("cardholder_name", "JOHN DOE") if data else "JOHN DOE",
                "created_at": datetime.utcnow().isoformat()
            },
            request_id=self._generate_request_id()
        )

    def _mock_card_activation(self, data: Optional[Dict] = None) -> FISAPIResponse:
        """Mock card activation response"""
        return FISAPIResponse(
            success=True,
            data={
                "status": "active",
                "activated_at": datetime.utcnow().isoformat(),
                "message": "Card activated successfully"
            },
            request_id=self._generate_request_id()
        )

    def _mock_card_lock(self, endpoint: str) -> FISAPIResponse:
        """Mock card lock/unlock response"""
        is_lock = "lock" in endpoint and "unlock" not in endpoint
        return FISAPIResponse(
            success=True,
            data={
                "status": "locked" if is_lock else "active",
                "updated_at": datetime.utcnow().isoformat(),
                "message": f"Card {'locked' if is_lock else 'unlocked'} successfully"
            },
            request_id=self._generate_request_id()
        )

    def _mock_card_details(self) -> FISAPIResponse:
        """Mock card details response"""
        return FISAPIResponse(
            success=True,
            data={
                "card_id": "card_mock123456",
                "card_token": "tok_mock_abcdef",
                "card_type": "virtual",
                "status": "active",
                "last_four": "4242",
                "expiry_month": 12,
                "expiry_year": 2028,
                "cardholder_name": "JOHN DOE",
                "created_at": "2024-01-01T00:00:00Z",
                "activated_at": "2024-01-01T00:01:00Z"
            },
            request_id=self._generate_request_id()
        )

    def _mock_pin_operation(self, endpoint: str, data: Optional[Dict] = None) -> FISAPIResponse:
        """Mock PIN operation response"""
        return FISAPIResponse(
            success=True,
            data={
                "message": "PIN operation completed successfully",
                "operation": endpoint.split("/")[-1],
                "timestamp": datetime.utcnow().isoformat()
            },
            request_id=self._generate_request_id()
        )

    def _mock_transactions(self) -> FISAPIResponse:
        """Mock transactions list response"""
        return FISAPIResponse(
            success=True,
            data={
                "transactions": [
                    {
                        "transaction_id": "tx_mock001",
                        "type": "purchase",
                        "status": "completed",
                        "amount": 42.50,
                        "currency": "USD",
                        "merchant_name": "AMAZON.COM",
                        "merchant_category_code": "5411",
                        "created_at": "2024-01-15T10:30:00Z"
                    },
                    {
                        "transaction_id": "tx_mock002",
                        "type": "purchase",
                        "status": "completed",
                        "amount": 15.99,
                        "currency": "USD",
                        "merchant_name": "STARBUCKS",
                        "merchant_category_code": "5814",
                        "created_at": "2024-01-14T08:15:00Z"
                    }
                ],
                "total": 2,
                "page": 1,
                "per_page": 25
            },
            request_id=self._generate_request_id()
        )

    def _mock_wallet_operation(self, endpoint: str, data: Optional[Dict] = None) -> FISAPIResponse:
        """Mock digital wallet operation response"""
        import uuid
        return FISAPIResponse(
            success=True,
            data={
                "token_id": f"dpan_{uuid.uuid4().hex[:16]}",
                "wallet_type": "apple_pay" if "apple" in endpoint else "google_pay",
                "status": "active",
                "provisioned_at": datetime.utcnow().isoformat(),
                "device_name": "iPhone 15 Pro"
            },
            request_id=self._generate_request_id()
        )

    def _mock_kyc_operation(self, endpoint: str, data: Optional[Dict] = None) -> FISAPIResponse:
        """Mock KYC operation response"""
        return FISAPIResponse(
            success=True,
            data={
                "verification_id": f"kyc_{self._generate_request_id()}",
                "status": "approved",
                "risk_score": 15,
                "checks_passed": ["identity", "address", "ofac", "watchlist"],
                "verified_at": datetime.utcnow().isoformat()
            },
            request_id=self._generate_request_id()
        )


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_fis_service: Optional[FISGlobalService] = None


def get_fis_service() -> FISGlobalService:
    """Get or create singleton FIS Global service instance"""
    global _fis_service
    if _fis_service is None:
        _fis_service = FISGlobalService()
    return _fis_service


def create_fis_service(
    client_id: Optional[str] = None,
    client_secret: Optional[str] = None,
    **kwargs
) -> FISGlobalService:
    """Create new FIS Global service instance with custom config"""
    return FISGlobalService(
        client_id=client_id,
        client_secret=client_secret,
        **kwargs
    )


# Export singleton
fis_global_service = get_fis_service()
