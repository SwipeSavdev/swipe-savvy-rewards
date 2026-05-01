"""
Sanctions Screening Service (BSA/AML Regulatory Requirement)

Screens individuals against sanctions lists during signup and periodic rescreening.

STUB IMPLEMENTATION: Awaiting sanctions screening API from our program manager
(Connect Financial). All screenings currently return pending_review status and
require manual compliance review.

When Connect Financial provides their API:
1. Set CONNECT_FINANCIAL_SCREENING_URL and CONNECT_FINANCIAL_API_KEY env vars
2. Implement the _screen_via_connect_financial() method
3. Set SCREENING_PROVIDER=connect_financial
"""

import logging
import os
from datetime import datetime
from enum import Enum
from typing import Optional

logger = logging.getLogger(__name__)


class ScreeningResult(str, Enum):
    CLEAR = "clear"
    MATCH = "match"
    POTENTIAL_MATCH = "potential_match"
    PENDING_REVIEW = "pending_review"
    ERROR = "error"


class SanctionsScreeningResponse:
    """Result of a sanctions screening check"""

    def __init__(
        self,
        result: ScreeningResult,
        score: float = 0.0,
        matches: Optional[list] = None,
        error_message: Optional[str] = None,
    ):
        self.result = result
        self.score = score
        self.matches = matches or []
        self.error_message = error_message
        self.screened_at = datetime.utcnow()

    @property
    def is_clear(self) -> bool:
        return self.result == ScreeningResult.CLEAR

    def to_dict(self) -> dict:
        return {
            "result": self.result.value,
            "score": self.score,
            "matches": self.matches,
            "error_message": self.error_message,
            "screened_at": self.screened_at.isoformat(),
        }


# Backward-compatible alias
OFACScreeningResponse = SanctionsScreeningResponse


class SanctionsScreeningService:
    """
    Sanctions screening service.

    STUB: Awaiting Connect Financial sanctions screening API from program manager.

    Configuration via environment variables:
    - SCREENING_PROVIDER: "stub" (default) or "connect_financial"
    - CONNECT_FINANCIAL_SCREENING_URL: URL for Connect Financial screening API
    - CONNECT_FINANCIAL_API_KEY: API key for Connect Financial
    """

    def __init__(self):
        self.provider = os.getenv("SCREENING_PROVIDER", "stub")
        self.api_url = os.getenv("CONNECT_FINANCIAL_SCREENING_URL", "")
        self.api_key = os.getenv("CONNECT_FINANCIAL_API_KEY", "")

    async def screen_individual(
        self,
        first_name: str,
        last_name: str,
        date_of_birth: Optional[str] = None,
        country: Optional[str] = None,
        address: Optional[str] = None,
    ) -> SanctionsScreeningResponse:
        """
        Screen an individual against sanctions lists.

        STUB: Returns pending_review until Connect Financial API is integrated.

        Args:
            first_name: Individual's first name
            last_name: Individual's last name
            date_of_birth: Date of birth (YYYY-MM-DD)
            country: Country code (ISO 3166-1 alpha-2)
            address: Street address

        Returns:
            SanctionsScreeningResponse with result
        """
        full_name = f"{first_name} {last_name}"
        logger.info(f"Screening individual: {full_name[:3]}*** against sanctions lists")

        try:
            if self.provider == "connect_financial" and self.api_url and self.api_key:
                return await self._screen_via_connect_financial(
                    first_name, last_name, date_of_birth, country, address
                )
            else:
                # Stub mode — all screenings require manual review
                logger.warning(
                    "Sanctions screening in stub mode — returning PENDING_REVIEW. "
                    "Awaiting Connect Financial API integration from program manager."
                )
                return SanctionsScreeningResponse(result=ScreeningResult.PENDING_REVIEW)
        except Exception as e:
            logger.error(f"Sanctions screening error: {e}")
            return SanctionsScreeningResponse(
                result=ScreeningResult.ERROR,
                error_message=str(e),
            )

    async def _screen_via_connect_financial(
        self,
        first_name: str,
        last_name: str,
        date_of_birth: Optional[str] = None,
        country: Optional[str] = None,
        address: Optional[str] = None,
    ) -> SanctionsScreeningResponse:
        """
        Screen using Connect Financial's sanctions screening API.

        TODO: Implement when Connect Financial provides API documentation and credentials.
        Expected integration:
        - POST {api_url}/v1/screening/individual
        - Auth: Bearer {api_key}
        - Body: { first_name, last_name, date_of_birth, country, address }
        - Response: { status, matches[], score }
        """
        logger.warning(
            "Connect Financial screening API not yet implemented — returning pending_review"
        )
        return SanctionsScreeningResponse(result=ScreeningResult.PENDING_REVIEW)


# Backward-compatible aliases
OFACScreeningService = SanctionsScreeningService

# Singleton instance
_screening_service: Optional[SanctionsScreeningService] = None


def get_sanctions_screening_service() -> SanctionsScreeningService:
    """Get or create the sanctions screening service singleton"""
    global _screening_service
    if _screening_service is None:
        _screening_service = SanctionsScreeningService()
    return _screening_service


# Backward-compatible alias
get_ofac_screening_service = get_sanctions_screening_service
