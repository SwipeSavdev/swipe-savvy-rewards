"""
Boot-time validation for the SwipeSavvy card / rewards surface.

Modelled on the equivalent in the sibling POS repo
(``backend/services/healthcare-service/src/bootstrap/boot-validation.ts``):
a small set of async checks, each of which throws a clear, actionable error,
run once at startup.

Why this exists
---------------
Until this module, this service had NO boot validation of any kind: the only
config validators covered ENVIRONMENT / DATABASE_URL / JWT / DEBUG, and the
FastAPI startup hook's body was entirely commented out. A production deploy
that failed to inject FIS credentials therefore booted healthy, reported
healthy, and began fabricating KYC approvals and card issuances.

Failure semantics
-----------------
**production** — a FATAL check failure calls ``os._exit(1)``. The process
never becomes healthy, so the orchestrator (ECS / Kubernetes) keeps the
PREVIOUS healthy task serving traffic and the operator gets one clean alarm
instead of a stream of fabricated approvals reaching real customers. This is
the whole point: refusing to start is safe, starting in stub mode is not.

**development / staging** — every failure is logged LOUDLY (CRITICAL, banner
framed) and the process continues, so engineers can run the stack without a
full production credential set.

Non-fatal checks (``fatal=False``) are informational in every environment and
never stop startup, even in production.

Adding a check: write a small async function that raises on failure with an
actionable message, and append it to the list in ``run_boot_validation()``.
"""

import asyncio
import inspect
import logging
import os
from dataclasses import dataclass
from typing import Awaitable, Callable, List, Optional, Union

from app.core.card_surface import CARD_SURFACE_ENV_VAR, card_surface_enabled, env_flag

logger = logging.getLogger(__name__)

# =============================================================================
# ENV VARS OWNED BY THIS MODULE
# =============================================================================

#: Explicit opt-in to fabricated FIS responses (see fis_global_service).
FIS_MOCK_MODE_ENV_VAR = "FIS_MOCK_MODE"

#: Identity-verification provider. Empty means "stub / not contracted".
KYC_PROVIDER_ENV_VAR = "KYC_PROVIDER"

#: Sanctions / watchlist screening provider. Empty means "stub / not contracted".
OFAC_PROVIDER_ENV_VAR = "OFAC_SCREENING_PROVIDER"

#: Sentinel meaning "deliberately not wired up yet".
STUB_PROVIDER_VALUES = {"", "stub", "mock", "none", "disabled", "todo"}


def _environment() -> str:
    return os.getenv("ENVIRONMENT", "development").strip().lower()


def is_production() -> bool:
    return _environment() == "production"


CheckFn = Callable[[], Union[Optional[str], Awaitable[Optional[str]]]]


@dataclass
class BootCheck:
    name: str
    fn: CheckFn
    #: Should a failure refuse startup in production? Default True.
    fatal: bool = True


# =============================================================================
# CHECKS
# =============================================================================


async def check_card_surface_kill_switch() -> str:
    """
    Report the state of the master kill switch.

    Informational, never fatal — a DARK surface is the correct, expected
    state today. What matters is that the state is unambiguous in the boot
    log, so nobody has to guess whether production is live.
    """
    if not card_surface_enabled():
        return (
            f"{CARD_SURFACE_ENV_VAR} is OFF — the card/rewards surface is DARK. "
            f"All FIS routes return 503. This is the expected state until the "
            f"card processor and sponsor bank agreements are signed."
        )
    return (
        f"{CARD_SURFACE_ENV_VAR} is ON — the card/rewards surface is LIVE and " f"serving requests."
    )


async def check_fis_mock_mode() -> str:
    """
    Production must never fabricate FIS responses.

    FATAL in production when mock mode is requested. The service itself also
    refuses to honour mock mode in production, so this check is the second of
    two independent guards — but it is the one that stops the process before
    a single request is served.
    """
    requested = env_flag(FIS_MOCK_MODE_ENV_VAR, "false")
    if requested and is_production():
        raise RuntimeError(
            f"{FIS_MOCK_MODE_ENV_VAR} is enabled while ENVIRONMENT=production. "
            f"Mock mode FABRICATES card issuances, KYC approvals and wallet "
            f"provisioning results. Refusing to start. Unset {FIS_MOCK_MODE_ENV_VAR} "
            f"and provision real FIS credentials."
        )
    if requested:
        return (
            f"{FIS_MOCK_MODE_ENV_VAR}=true in {_environment()} — FIS responses are "
            f"FABRICATED and marked mock=True. Never valid in production."
        )
    return f"{FIS_MOCK_MODE_ENV_VAR} is off — no fabricated FIS responses."


async def check_fis_credentials() -> str:
    """
    A LIVE card surface in production requires real FIS credentials.

    Only fatal when the surface is actually switched on: with the kill switch
    off, no FIS route is reachable, so absent credentials are not yet a
    production hazard — and refusing to boot over them would block every
    unrelated endpoint in this service for no safety gain.
    """
    client_id = os.getenv("FIS_CLIENT_ID", "").strip()
    client_secret = os.getenv("FIS_CLIENT_SECRET", "").strip()
    present = bool(client_id and client_secret)

    if present:
        return "FIS_CLIENT_ID and FIS_CLIENT_SECRET are present."

    if is_production() and card_surface_enabled():
        raise RuntimeError(
            "FIS_CLIENT_ID / FIS_CLIENT_SECRET are absent while "
            f"ENVIRONMENT=production and {CARD_SURFACE_ENV_VAR} is ON. The card "
            "surface would serve live traffic against an unconfigured processor. "
            "Refusing to start. Either provision the FIS credentials, or set "
            f"{CARD_SURFACE_ENV_VAR}=false to keep the surface dark."
        )

    return (
        "FIS credentials absent — FIS requests will raise FISNotConfiguredError "
        f"(surface enabled={card_surface_enabled()}, environment={_environment()})."
    )


async def _check_provider(env_var: str, human_name: str) -> str:
    value = os.getenv(env_var, "").strip().lower()
    configured = value not in STUB_PROVIDER_VALUES

    if configured:
        return f"{human_name} provider configured ({env_var}={value})."

    if is_production() and card_surface_enabled():
        raise RuntimeError(
            f"{env_var} is unset or set to a stub value while ENVIRONMENT=production "
            f"and {CARD_SURFACE_ENV_VAR} is ON. {human_name} would run in STUB mode, "
            f"which approves everyone. Refusing to start. Configure a real "
            f"{human_name} provider, or set {CARD_SURFACE_ENV_VAR}=false."
        )

    return (
        f"{human_name} provider NOT configured ({env_var} is stub/empty) — "
        f"acceptable only because the card surface is dark or this is not production."
    )


async def check_kyc_provider() -> str:
    """Identity verification must not be a stub on a live production surface."""
    return await _check_provider(KYC_PROVIDER_ENV_VAR, "KYC")


async def check_ofac_provider() -> str:
    """Sanctions screening must not be a stub on a live production surface."""
    return await _check_provider(OFAC_PROVIDER_ENV_VAR, "OFAC/sanctions screening")


# =============================================================================
# RUNNER
# =============================================================================


def _default_checks() -> List[BootCheck]:
    return [
        BootCheck("card-surface-kill-switch", check_card_surface_kill_switch, fatal=False),
        BootCheck("fis-mock-mode", check_fis_mock_mode),
        BootCheck("fis-credentials", check_fis_credentials),
        BootCheck("kyc-provider", check_kyc_provider),
        BootCheck("ofac-screening-provider", check_ofac_provider),
    ]


def should_refuse_startup(fatal_failure_count: int, production: bool) -> bool:
    """Pure predicate, split out so it is directly testable."""
    return production and fatal_failure_count > 0


async def run_boot_validation(
    checks: Optional[List[BootCheck]] = None,
    exit_on_failure: bool = True,
) -> List[str]:
    """
    Run every boot check.

    Returns the list of FATAL check names that failed (empty when all good).
    In production, a non-empty list terminates the process unless
    ``exit_on_failure=False`` (used by tests).
    """
    checks = checks if checks is not None else _default_checks()
    production = is_production()
    fatal_failures: List[str] = []
    warn_failures: List[str] = []

    logger.info(
        "Running %d card-surface boot validation checks (ENVIRONMENT=%s)…",
        len(checks),
        _environment(),
    )

    for check in checks:
        try:
            result = check.fn()
            if inspect.isawaitable(result):
                result = await result
            logger.info("  ✓ %s — %s", check.name, result or "ok")
        except Exception as exc:  # noqa: BLE001 - a check may raise anything
            if check.fatal:
                fatal_failures.append(check.name)
                logger.critical("  ✗ FATAL %s — %s", check.name, exc)
            else:
                warn_failures.append(check.name)
                logger.warning("  ⚠ WARN  %s — %s", check.name, exc)

    if not fatal_failures and not warn_failures:
        logger.info("All %d card-surface boot checks passed.", len(checks))
        return []

    if fatal_failures:
        banner = "=" * 78
        if should_refuse_startup(len(fatal_failures), production):
            logger.critical(banner)
            logger.critical(
                "BOOT VALIDATION FAILED IN PRODUCTION — %d FATAL error(s): %s",
                len(fatal_failures),
                ", ".join(fatal_failures),
            )
            logger.critical(
                "Refusing to start. The orchestrator will not mark this task healthy "
                "and the previous task definition continues serving traffic. "
                "Fix the configuration above and redeploy."
            )
            logger.critical(banner)
            if exit_on_failure:
                logging.shutdown()
                os._exit(1)
        else:
            logger.critical(banner)
            logger.critical(
                "BOOT VALIDATION FAILED with %d FATAL error(s): %s — "
                "CONTINUING because ENVIRONMENT=%s is not production. "
                "This configuration WOULD REFUSE TO START in production.",
                len(fatal_failures),
                ", ".join(fatal_failures),
                _environment(),
            )
            logger.critical(banner)

    return fatal_failures


def run_boot_validation_sync(**kwargs) -> List[str]:
    """Convenience wrapper for non-async callers."""
    return asyncio.get_event_loop().run_until_complete(run_boot_validation(**kwargs))
