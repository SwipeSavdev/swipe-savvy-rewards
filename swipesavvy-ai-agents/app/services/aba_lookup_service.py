"""
ABA Routing Number Lookup Service

Provides bank name lookup from routing numbers using free APIs
with local caching for performance and reliability.
"""

import httpx
import logging
from typing import Optional, Dict
from functools import lru_cache
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class BankInfo(BaseModel):
    """Bank information from routing number lookup"""
    routing_number: str
    bank_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    valid: bool = True


# =============================================================================
# COMMON ROUTING NUMBERS CACHE
# Pre-populated with major US banks for instant lookup without API calls
# =============================================================================

COMMON_BANKS: Dict[str, str] = {
    # Chase
    "021000021": "JPMorgan Chase Bank, N.A.",
    "022300173": "JPMorgan Chase Bank, N.A.",
    "044000037": "JPMorgan Chase Bank, N.A.",
    "065400137": "JPMorgan Chase Bank, N.A.",
    "072000326": "JPMorgan Chase Bank, N.A.",
    "083000137": "JPMorgan Chase Bank, N.A.",
    "122100024": "JPMorgan Chase Bank, N.A.",
    "267084131": "JPMorgan Chase Bank, N.A.",
    "322271627": "JPMorgan Chase Bank, N.A.",

    # Bank of America
    "011000138": "Bank of America, N.A.",
    "011200365": "Bank of America, N.A.",
    "011400495": "Bank of America, N.A.",
    "021000322": "Bank of America, N.A.",
    "026009593": "Bank of America, N.A.",
    "051000017": "Bank of America, N.A.",
    "052001633": "Bank of America, N.A.",
    "053000196": "Bank of America, N.A.",
    "054001204": "Bank of America, N.A.",
    "063100277": "Bank of America, N.A.",
    "071000039": "Bank of America, N.A.",
    "121000358": "Bank of America, N.A.",

    # Wells Fargo
    "011100106": "Wells Fargo Bank, N.A.",
    "021101108": "Wells Fargo Bank, N.A.",
    "031001175": "Wells Fargo Bank, N.A.",
    "041215537": "Wells Fargo Bank, N.A.",
    "051400549": "Wells Fargo Bank, N.A.",
    "062000080": "Wells Fargo Bank, N.A.",
    "063107513": "Wells Fargo Bank, N.A.",
    "071101307": "Wells Fargo Bank, N.A.",
    "091000019": "Wells Fargo Bank, N.A.",
    "092905278": "Wells Fargo Bank, N.A.",
    "102000076": "Wells Fargo Bank, N.A.",
    "111900659": "Wells Fargo Bank, N.A.",
    "121000248": "Wells Fargo Bank, N.A.",
    "122000247": "Wells Fargo Bank, N.A.",

    # Citibank
    "021000089": "Citibank, N.A.",
    "031100209": "Citibank, N.A.",
    "052002166": "Citibank, N.A.",
    "071006486": "Citibank, N.A.",
    "113193532": "Citibank, N.A.",
    "122401710": "Citibank, N.A.",
    "266086554": "Citibank, N.A.",
    "321171184": "Citibank, N.A.",
    "322271724": "Citibank, N.A.",

    # US Bank
    "042000013": "U.S. Bank N.A.",
    "064000059": "U.S. Bank N.A.",
    "081000210": "U.S. Bank N.A.",
    "091000022": "U.S. Bank N.A.",
    "091215927": "U.S. Bank N.A.",
    "102000021": "U.S. Bank N.A.",
    "104000029": "U.S. Bank N.A.",
    "121122676": "U.S. Bank N.A.",
    "122105155": "U.S. Bank N.A.",
    "123103729": "U.S. Bank N.A.",

    # PNC Bank
    "031000053": "PNC Bank, N.A.",
    "041000124": "PNC Bank, N.A.",
    "042000398": "PNC Bank, N.A.",
    "043000096": "PNC Bank, N.A.",
    "051000017": "PNC Bank, N.A.",
    "054000030": "PNC Bank, N.A.",
    "071921891": "PNC Bank, N.A.",
    "083000108": "PNC Bank, N.A.",

    # Capital One
    "051405515": "Capital One, N.A.",
    "056073573": "Capital One, N.A.",
    "065000090": "Capital One, N.A.",
    "112200303": "Capital One, N.A.",
    "255071981": "Capital One, N.A.",
    "256078446": "Capital One 360",

    # TD Bank
    "011103093": "TD Bank, N.A.",
    "011400071": "TD Bank, N.A.",
    "021302567": "TD Bank, N.A.",
    "031101266": "TD Bank, N.A.",
    "036001808": "TD Bank, N.A.",
    "054001725": "TD Bank, N.A.",
    "211274450": "TD Bank, N.A.",

    # Truist (BB&T + SunTrust)
    "051000017": "Truist Bank",
    "053101121": "Truist Bank",
    "055002707": "Truist Bank",
    "061000104": "Truist Bank",
    "061113415": "Truist Bank",
    "063104668": "Truist Bank",
    "064000046": "Truist Bank",

    # Regions Bank
    "062000019": "Regions Bank",
    "063104915": "Regions Bank",
    "064000017": "Regions Bank",
    "065403626": "Regions Bank",
    "082000109": "Regions Bank",
    "111900785": "Regions Bank",

    # Fifth Third Bank
    "042000314": "Fifth Third Bank",
    "072405455": "Fifth Third Bank",
    "082001311": "Fifth Third Bank",
    "083001314": "Fifth Third Bank",
    "263079804": "Fifth Third Bank",

    # KeyBank
    "011200608": "KeyBank N.A.",
    "021300077": "KeyBank N.A.",
    "041001039": "KeyBank N.A.",
    "042201361": "KeyBank N.A.",
    "124000054": "KeyBank N.A.",

    # Huntington Bank
    "041000153": "Huntington National Bank",
    "044000024": "Huntington National Bank",
    "072000175": "Huntington National Bank",

    # Citizens Bank
    "011401533": "Citizens Bank, N.A.",
    "021313103": "Citizens Bank, N.A.",
    "036076150": "Citizens Bank, N.A.",
    "211070175": "Citizens Bank, N.A.",
    "241070417": "Citizens Bank, N.A.",

    # M&T Bank
    "011302838": "M&T Bank",
    "022000046": "M&T Bank",
    "031100092": "M&T Bank",
    "052001633": "M&T Bank",

    # First Republic (now part of Chase)
    "321081669": "First Republic Bank",

    # Charles Schwab
    "121202211": "Charles Schwab Bank",

    # Ally Bank
    "124003116": "Ally Bank",

    # Discover Bank
    "031100649": "Discover Bank",

    # Marcus by Goldman Sachs
    "124085024": "Goldman Sachs Bank USA",

    # Synchrony Bank
    "021213591": "Synchrony Bank",

    # American Express National Bank
    "124071889": "American Express National Bank",
}


def validate_routing_number(routing_number: str) -> bool:
    """
    Validate ABA routing number using checksum algorithm.

    The routing number checksum:
    3 * (d1 + d4 + d7) + 7 * (d2 + d5 + d8) + (d3 + d6 + d9) must be divisible by 10
    """
    # Must be exactly 9 digits
    if not routing_number.isdigit() or len(routing_number) != 9:
        return False

    digits = [int(d) for d in routing_number]

    checksum = (
        3 * (digits[0] + digits[3] + digits[6]) +
        7 * (digits[1] + digits[4] + digits[7]) +
        (digits[2] + digits[5] + digits[8])
    )

    return checksum % 10 == 0


@lru_cache(maxsize=1000)
def get_cached_bank_name(routing_number: str) -> Optional[str]:
    """Get bank name from cache (uses LRU cache decorator)"""
    return COMMON_BANKS.get(routing_number)


async def lookup_routing_number(routing_number: str) -> BankInfo:
    """
    Look up bank information from an ABA routing number.

    First checks local cache, then queries external API if needed.

    Args:
        routing_number: 9-digit ABA routing number

    Returns:
        BankInfo with bank details or error status
    """
    # Clean the input
    routing_number = routing_number.strip().replace("-", "").replace(" ", "")

    # Validate checksum
    if not validate_routing_number(routing_number):
        return BankInfo(
            routing_number=routing_number,
            bank_name="",
            valid=False
        )

    # Check local cache first
    cached_name = get_cached_bank_name(routing_number)
    if cached_name:
        logger.debug(f"ABA lookup cache hit: {routing_number}")
        return BankInfo(
            routing_number=routing_number,
            bank_name=cached_name,
            valid=True
        )

    # Query external API
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Use routingnumbers.info free API
            response = await client.get(
                f"https://www.routingnumbers.info/api/data.json",
                params={"rn": routing_number}
            )

            if response.status_code == 200:
                data = response.json()

                if data.get("message") == "OK":
                    bank_info = BankInfo(
                        routing_number=routing_number,
                        bank_name=data.get("customer_name", "Unknown Bank"),
                        address=data.get("address"),
                        city=data.get("city"),
                        state=data.get("state"),
                        zip_code=data.get("zip"),
                        phone=data.get("telephone"),
                        valid=True
                    )

                    # Add to local cache for future lookups
                    COMMON_BANKS[routing_number] = bank_info.bank_name

                    logger.info(f"ABA lookup success: {routing_number} -> {bank_info.bank_name}")
                    return bank_info
                else:
                    logger.warning(f"ABA lookup not found: {routing_number}")
                    return BankInfo(
                        routing_number=routing_number,
                        bank_name="Unknown Bank",
                        valid=True  # Valid format, just not in database
                    )
            else:
                logger.error(f"ABA lookup API error: {response.status_code}")

    except httpx.TimeoutException:
        logger.warning(f"ABA lookup timeout: {routing_number}")
    except Exception as e:
        logger.error(f"ABA lookup exception: {str(e)}")

    # Return basic valid response if API fails
    return BankInfo(
        routing_number=routing_number,
        bank_name="",  # Empty name indicates lookup failure
        valid=True  # Format is valid, lookup just failed
    )


async def batch_lookup_routing_numbers(routing_numbers: list[str]) -> Dict[str, BankInfo]:
    """
    Look up multiple routing numbers efficiently.

    Args:
        routing_numbers: List of routing numbers to look up

    Returns:
        Dict mapping routing numbers to BankInfo objects
    """
    results = {}

    for rn in routing_numbers:
        results[rn] = await lookup_routing_number(rn)

    return results


def get_routing_number_region(routing_number: str) -> Optional[str]:
    """
    Get the Federal Reserve district for a routing number.

    The first two digits indicate the Federal Reserve Bank district:
    01-12 = Federal Reserve Banks
    21-32 = Thrift institutions
    61-72 = Electronic payments
    80 = Traveler's checks
    """
    if not routing_number or len(routing_number) < 2:
        return None

    prefix = int(routing_number[:2])

    regions = {
        (1, 21, 61): "Boston",
        (2, 22, 62): "New York",
        (3, 23, 63): "Philadelphia",
        (4, 24, 64): "Cleveland",
        (5, 25, 65): "Richmond",
        (6, 26, 66): "Atlanta",
        (7, 27, 67): "Chicago",
        (8, 28, 68): "St. Louis",
        (9, 29, 69): "Minneapolis",
        (10, 30, 70): "Kansas City",
        (11, 31, 71): "Dallas",
        (12, 32, 72): "San Francisco",
    }

    for prefixes, region in regions.items():
        if prefix in prefixes:
            return region

    return None
