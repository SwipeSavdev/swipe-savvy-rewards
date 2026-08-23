"""
Card / rewards surface kill switch.

SwipeSavvy has NOT finalized agreements with its card processor or its
sponsor bank. Until those are signed, the entire FIS-backed card and
rewards surface must be provably DARK — not "probably unused", not
"gated in the mobile client", but refused server-side on every request.

Design constraints that shaped this module:

  * **Default OFF.** ``CARD_SURFACE_ENABLED`` is unset in every environment
    today, and unset means disabled. Turning the surface on is a deliberate,
    auditable act (setting an env var), never an accident of deployment.
  * **Server-side only.** Client-side gating is advisory at best; anyone can
    call the API directly. Enforcement lives in a FastAPI dependency that is
    attached to the routers themselves, so a newly added route under an
    already-gated router inherits the gate for free.
  * **No dependencies.** Deliberately free of the database, the ORM and the
    (currently broken — see FEATURE_FLAG_FOLLOWUP in the branch report)
    feature-flag system. A kill switch that can fail open because a table is
    missing or a model does not import is not a kill switch.
  * **Read at call time.** The env var is read on each check rather than
    frozen at import, so an operator flipping it does not depend on import
    ordering, and so tests can exercise both states.

Env vars introduced here:

  ``CARD_SURFACE_ENABLED``   default ``"false"``  — master kill switch.
"""

import logging
import os
from typing import Any, Dict

from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

#: Name of the master kill-switch env var.
CARD_SURFACE_ENV_VAR = "CARD_SURFACE_ENABLED"

#: The surface is OFF unless explicitly switched on.
CARD_SURFACE_DEFAULT = "false"

#: Stable machine-readable code returned when the surface is dark.
CARD_SURFACE_DISABLED_CODE = "CARD_SURFACE_DISABLED"

_TRUTHY = {"1", "true", "yes", "on", "enabled"}


def env_flag(name: str, default: str = "false") -> bool:
    """Parse a boolean env var. Anything not explicitly truthy is False."""
    return os.getenv(name, default).strip().lower() in _TRUTHY


def card_surface_enabled() -> bool:
    """
    True only when an operator has explicitly switched the card surface on.

    Absence of the variable, an empty value, or any non-truthy value all mean
    OFF. There is no configuration mistake that turns this on.
    """
    return env_flag(CARD_SURFACE_ENV_VAR, CARD_SURFACE_DEFAULT)


def card_surface_disabled_payload() -> Dict[str, Any]:
    """The clean, non-alarming body returned while the surface is dark."""
    return {
        "success": False,
        "error_code": CARD_SURFACE_DISABLED_CODE,
        "detail": (
            "The SwipeSavvy card and rewards surface is currently disabled. "
            "Card issuance, KYC, transactions, wallet provisioning and rewards "
            "endpoints are not available."
        ),
        "enabled": False,
    }


def require_card_surface_enabled() -> None:
    """
    FastAPI dependency that refuses every request while the surface is dark.

    Attach at the ROUTER level (``include_router(..., dependencies=[...])``)
    so the gate is inherited by every current and future route on that router
    and cannot be forgotten on a new endpoint.

    Returns 503 Service Unavailable — the surface is intentionally and
    temporarily off, which is a service-state condition, not a client error
    (400) and not an authorization decision (403). A 503 also keeps the
    endpoint out of "working, but you lack permission" territory for anyone
    probing the API.
    """
    if card_surface_enabled():
        return
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=card_surface_disabled_payload(),
    )
