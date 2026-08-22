"""
Safety tests for the SwipeSavvy card / rewards surface.

These are regression tests for a specific, concrete production hazard: with
no card-processor or sponsor-bank agreement signed, the card surface was
live, ungated, and — when credentials were absent — FABRICATED successful
KYC approvals and card issuances that no caller could distinguish from real
ones.

Each test below pins one of the four properties that make the surface safe:

  1. Mock mode is OFF by default and is never inferred from missing config.
  2. Missing credentials in production REFUSE boot rather than degrade.
  3. The card surface returns a clean disabled response while dark.
  4. Every fabricated response carries a mock marker.

The env setup below runs before ``app`` is imported: app.core.config
validates JWT_SECRET_KEY at import time and app.database builds an engine
from DATABASE_URL, so both must be present. ``setdefault`` is used so a real
environment (CI with a Postgres service, for example) is never overridden.
"""

import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-at-least-32-characters-long")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("ENVIRONMENT", "development")
# The surface must be dark unless a test explicitly turns it on.
os.environ.pop("CARD_SURFACE_ENABLED", None)
os.environ.pop("FIS_MOCK_MODE", None)

import asyncio  # noqa: E402
import subprocess  # noqa: E402
import sys  # noqa: E402
import textwrap  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.boot_validation import (  # noqa: E402
    check_fis_credentials,
    check_fis_mock_mode,
    run_boot_validation,
    should_refuse_startup,
)
from app.core.card_surface import (  # noqa: E402
    CARD_SURFACE_DISABLED_CODE,
    CARD_SURFACE_ENV_VAR,
    card_surface_enabled,
)
from app.services.fis_global_service import (  # noqa: E402
    FISGlobalService,
    FISNotConfiguredError,
)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(autouse=True)
def clean_card_env(monkeypatch):
    """Every test starts from a known-dark, known-unconfigured baseline."""
    for var in (
        "CARD_SURFACE_ENABLED",
        "FIS_MOCK_MODE",
        "FIS_CLIENT_ID",
        "FIS_CLIENT_SECRET",
        "KYC_PROVIDER",
        "OFAC_SCREENING_PROVIDER",
    ):
        monkeypatch.delenv(var, raising=False)
    monkeypatch.setenv("ENVIRONMENT", "development")


# =============================================================================
# 1. MOCK MODE IS OFF BY DEFAULT AND NEVER INFERRED
# =============================================================================


class TestMockModeIsExplicitOptIn:
    def test_mock_mode_is_off_by_default(self):
        """No env, no credentials, no constructor arg — mock mode stays OFF."""
        service = FISGlobalService()
        assert service.mock_mode is False

    def test_missing_credentials_do_not_enable_mock_mode(self):
        """
        The SEV-0 regression. Absence of credentials used to flip the whole
        integration into a fabricator.
        """
        service = FISGlobalService(client_id="", client_secret="")
        assert service.credentials_present is False
        assert service.mock_mode is False, (
            "Missing credentials must NEVER infer mock mode — that is exactly "
            "how a mis-provisioned production deploy fabricated KYC approvals."
        )

    def test_missing_credentials_raise_instead_of_fabricating(self):
        """
        The only method that touches the network must refuse, loudly, rather
        than return a synthetic success.
        """
        service = FISGlobalService()
        with pytest.raises(FISNotConfiguredError) as excinfo:
            asyncio.get_event_loop().run_until_complete(
                service._make_request("POST", "kyc/verify", {"ssn": "000-00-0000"})
            )
        assert "FIS_CLIENT_ID" in str(excinfo.value)
        assert "NOT sent" in str(excinfo.value)

    def test_mock_mode_requires_explicit_env_opt_in(self, monkeypatch):
        monkeypatch.setenv("FIS_MOCK_MODE", "true")
        assert FISGlobalService().mock_mode is True

    def test_mock_mode_accepts_explicit_constructor_opt_in(self):
        assert FISGlobalService(mock_mode=True).mock_mode is True

    @pytest.mark.parametrize("value", ["", "false", "0", "no", "off", "False", "maybe"])
    def test_non_truthy_values_leave_mock_mode_off(self, monkeypatch, value):
        monkeypatch.setenv("FIS_MOCK_MODE", value)
        assert FISGlobalService().mock_mode is False

    def test_production_never_honours_mock_mode(self, monkeypatch):
        """Even an explicit request to fabricate is refused in production."""
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv("FIS_MOCK_MODE", "true")
        assert FISGlobalService().mock_mode is False

    def test_production_never_honours_mock_mode_via_constructor(self, monkeypatch):
        monkeypatch.setenv("ENVIRONMENT", "production")
        assert FISGlobalService(mock_mode=True).mock_mode is False


# =============================================================================
# 4. EVERY FABRICATED RESPONSE CARRIES THE MOCK MARKER
# =============================================================================


class TestMockMarker:
    #: One endpoint per branch of _mock_response, including the generic
    #: catch-all that previously returned a bare success=True.
    ENDPOINTS = [
        ("POST", "cards/issue"),
        ("POST", "cards/card_1/activate"),
        ("POST", "cards/card_1/lock"),
        ("POST", "cards/card_1/unlock"),
        ("GET", "cards/card_1"),
        ("POST", "pin/set"),
        ("GET", "transactions"),
        ("POST", "wallet/apple/provision"),
        ("POST", "wallet/google/provision"),
        ("POST", "kyc/verify"),
        ("POST", "identity/check"),
        ("POST", "some/unmapped/endpoint"),  # the generic success=True path
    ]

    @pytest.mark.parametrize("method,endpoint", ENDPOINTS)
    def test_every_fabricated_response_is_marked(self, method, endpoint):
        service = FISGlobalService(mock_mode=True)
        response = asyncio.get_event_loop().run_until_complete(
            service._make_request(method, endpoint, {})
        )
        assert response.mock is True, (
            f"{method} {endpoint} returned a fabricated response with mock={response.mock}. "
            f"An unmarked fabrication is indistinguishable from a real FIS result."
        )

    def test_fabricated_kyc_approval_is_marked(self):
        """
        The single most dangerous fabrication: a synthetic 'approved' with a
        low risk score and a full set of passed checks.
        """
        service = FISGlobalService(mock_mode=True)
        response = asyncio.get_event_loop().run_until_complete(
            service._make_request("POST", "kyc/verify", {})
        )
        assert response.success is True
        assert response.data["status"] == "approved"
        assert response.mock is True, (
            "A fabricated KYC APPROVAL must be marked. Without the marker no "
            "caller, log line or audit record can tell it from a real approval."
        )

    def test_mock_marker_defaults_to_false(self):
        """
        A response that forgets to set the marker is treated as REAL, and so
        held to the real-response bar — never silently excused as a mock.
        """
        from app.services.fis_global_service import FISAPIResponse

        assert FISAPIResponse(success=True).mock is False

    def test_real_parsed_responses_are_not_marked_as_mock(self):
        """Responses parsed from an actual FIS HTTP reply must be mock=False."""
        import httpx

        service = FISGlobalService(client_id="id", client_secret="secret")
        parsed = service._parse_response(
            httpx.Response(200, json={"card_id": "real_card"})
        )
        assert parsed.success is True
        assert parsed.mock is False


# =============================================================================
# 2. BOOT VALIDATION
# =============================================================================


class TestBootValidation:
    def _run(self, **kwargs):
        return asyncio.get_event_loop().run_until_complete(
            run_boot_validation(exit_on_failure=False, **kwargs)
        )

    def test_dark_surface_in_production_boots_clean(self, monkeypatch):
        """
        Today's real production state: production, no FIS credentials, no KYC
        provider — but the surface is dark, so nothing is reachable and boot
        must succeed. Refusing to boot here would take down every unrelated
        endpoint for no safety gain.
        """
        monkeypatch.setenv("ENVIRONMENT", "production")
        assert self._run() == []

    def test_missing_credentials_in_live_production_refuses_boot(self, monkeypatch):
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv(CARD_SURFACE_ENV_VAR, "true")
        failures = self._run()
        assert "fis-credentials" in failures

    def test_stub_kyc_and_ofac_in_live_production_refuse_boot(self, monkeypatch):
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv(CARD_SURFACE_ENV_VAR, "true")
        failures = self._run()
        assert "kyc-provider" in failures
        assert "ofac-screening-provider" in failures

    def test_mock_mode_in_production_refuses_boot_even_when_dark(self, monkeypatch):
        """
        Unlike the credential checks, mock mode is fatal in production
        regardless of the kill switch: a production process configured to
        fabricate is a misconfiguration we never run with.
        """
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv("FIS_MOCK_MODE", "true")
        assert "fis-mock-mode" in self._run()

    def test_fully_configured_live_production_boots(self, monkeypatch):
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv(CARD_SURFACE_ENV_VAR, "true")
        monkeypatch.setenv("FIS_CLIENT_ID", "real-client-id")
        monkeypatch.setenv("FIS_CLIENT_SECRET", "real-client-secret")
        monkeypatch.setenv("KYC_PROVIDER", "alloy")
        monkeypatch.setenv("OFAC_SCREENING_PROVIDER", "comply-advantage")
        assert self._run() == []

    @pytest.mark.parametrize("environment", ["development", "staging"])
    def test_non_production_warns_but_does_not_refuse(self, monkeypatch, environment):
        """Engineers must be able to run the stack without production secrets."""
        monkeypatch.setenv("ENVIRONMENT", environment)
        monkeypatch.setenv(CARD_SURFACE_ENV_VAR, "true")
        failures = self._run()
        # The checks pass outright outside production — nothing is fatal.
        assert failures == []
        assert should_refuse_startup(len(failures), production=False) is False

    def test_should_refuse_startup_only_in_production(self):
        assert should_refuse_startup(1, production=True) is True
        assert should_refuse_startup(1, production=False) is False
        assert should_refuse_startup(0, production=True) is False

    def test_individual_checks_raise_with_actionable_messages(self, monkeypatch):
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv(CARD_SURFACE_ENV_VAR, "true")
        with pytest.raises(RuntimeError) as excinfo:
            asyncio.get_event_loop().run_until_complete(check_fis_credentials())
        assert "FIS_CLIENT_ID" in str(excinfo.value)
        assert CARD_SURFACE_ENV_VAR in str(excinfo.value)

        monkeypatch.setenv("FIS_MOCK_MODE", "true")
        with pytest.raises(RuntimeError) as excinfo:
            asyncio.get_event_loop().run_until_complete(check_fis_mock_mode())
        assert "FABRICATE" in str(excinfo.value).upper()

    def test_production_boot_failure_exits_the_process(self):
        """
        Proves the real failure mode end to end: a production process with a
        live card surface and no credentials must TERMINATE, so the
        orchestrator keeps the previous healthy task serving.

        Run in a subprocess because the production path calls os._exit(1),
        which would take the test runner with it.
        """
        script = textwrap.dedent(
            """
            import asyncio
            from app.core.boot_validation import run_boot_validation
            asyncio.get_event_loop().run_until_complete(run_boot_validation())
            print("REACHED-CODE-AFTER-BOOT-VALIDATION")
            """
        )
        env = dict(os.environ)
        env.update(
            {
                "ENVIRONMENT": "production",
                "CARD_SURFACE_ENABLED": "true",
                "JWT_SECRET_KEY": "test-secret-key-at-least-32-characters-long",
                "DATABASE_URL": "sqlite://",
                "PYTHONPATH": REPO_ROOT,
            }
        )
        for var in ("FIS_CLIENT_ID", "FIS_CLIENT_SECRET", "KYC_PROVIDER", "OFAC_SCREENING_PROVIDER"):
            env.pop(var, None)

        result = subprocess.run(
            [sys.executable, "-c", script],
            cwd=REPO_ROOT,
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 1, (
            f"Expected exit code 1, got {result.returncode}.\n"
            f"stdout={result.stdout}\nstderr={result.stderr}"
        )
        assert "REACHED-CODE-AFTER-BOOT-VALIDATION" not in result.stdout
        assert "BOOT VALIDATION FAILED IN PRODUCTION" in result.stderr

    def test_non_production_boot_failure_does_not_exit(self):
        """The mirror image: staging warns loudly and keeps running."""
        script = textwrap.dedent(
            """
            import asyncio
            from app.core.boot_validation import run_boot_validation
            asyncio.get_event_loop().run_until_complete(run_boot_validation())
            print("REACHED-CODE-AFTER-BOOT-VALIDATION")
            """
        )
        env = dict(os.environ)
        env.update(
            {
                "ENVIRONMENT": "staging",
                "CARD_SURFACE_ENABLED": "true",
                "FIS_MOCK_MODE": "true",
                "JWT_SECRET_KEY": "test-secret-key-at-least-32-characters-long",
                "DATABASE_URL": "sqlite://",
                "PYTHONPATH": REPO_ROOT,
            }
        )
        result = subprocess.run(
            [sys.executable, "-c", script],
            cwd=REPO_ROOT,
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stderr
        assert "REACHED-CODE-AFTER-BOOT-VALIDATION" in result.stdout


# =============================================================================
# 3. THE KILL SWITCH
# =============================================================================


@pytest.fixture(scope="module")
def client():
    """
    TestClient over the REAL application, so these assertions cover the
    actual wiring in app/main.py rather than a stand-in app. Entering the
    context manager fires the startup event, which also exercises the
    boot-validation hook.
    """
    from app.main import app as real_app

    # base_url must use an allowed host: app/main.py installs
    # TrustedHostMiddleware, which rejects TestClient's default "testserver"
    # with a 400 before any route or dependency is reached.
    with TestClient(real_app, base_url="http://localhost") as test_client:
        yield test_client


class TestKillSwitch:
    #: One representative route per gated FIS router.
    GATED_ROUTES = [
        ("POST", "/api/v1/fis/cards/issue/virtual"),      # fis_cards
        ("GET", "/api/v1/fis/cards"),                      # fis_cards
        ("GET", "/api/v1/fis/cards/card_1/transactions"),  # fis_transactions
        ("GET", "/api/v1/fis/alerts"),                     # fis_fraud
        ("POST", "/api/v1/fis/cards/card_1/wallet/apple-pay/provision"),  # fis_wallet
        ("POST", "/api/v1/webhooks/fis"),                  # fis_webhooks
    ]

    def test_kill_switch_defaults_to_off(self, monkeypatch):
        monkeypatch.delenv(CARD_SURFACE_ENV_VAR, raising=False)
        assert card_surface_enabled() is False

    @pytest.mark.parametrize("value", ["true", "1", "yes", "on", "enabled", "TRUE"])
    def test_kill_switch_turns_on_only_for_truthy_values(self, monkeypatch, value):
        monkeypatch.setenv(CARD_SURFACE_ENV_VAR, value)
        assert card_surface_enabled() is True

    @pytest.mark.parametrize("value", ["", "false", "0", "no", "off", "disabled", "yes please"])
    def test_kill_switch_stays_off_for_everything_else(self, monkeypatch, value):
        monkeypatch.setenv(CARD_SURFACE_ENV_VAR, value)
        assert card_surface_enabled() is False

    @pytest.mark.parametrize("method,path", GATED_ROUTES)
    def test_dark_surface_returns_clean_disabled_response(self, client, monkeypatch, method, path):
        monkeypatch.delenv(CARD_SURFACE_ENV_VAR, raising=False)
        response = client.request(method, path, json={})
        assert response.status_code == 503, (
            f"{method} {path} returned {response.status_code} while the card "
            f"surface is dark — it must be refused server-side."
        )
        detail = response.json()["detail"]
        assert detail["error_code"] == CARD_SURFACE_DISABLED_CODE
        assert detail["enabled"] is False
        assert detail["success"] is False

    def test_disabled_response_precedes_authentication(self, client, monkeypatch):
        """
        The gate must fire before auth, so an unauthenticated prober learns
        only that the surface is off — and so a VALID token cannot reach a
        card endpoint while the surface is dark either.
        """
        monkeypatch.delenv(CARD_SURFACE_ENV_VAR, raising=False)
        response = client.get(
            "/api/v1/fis/cards", headers={"Authorization": "Bearer not-a-real-token"}
        )
        assert response.status_code == 503

    def test_api_fixes_kyc_router_is_not_mounted(self, client):
        """
        Documents the state found on main: app/routes/api_fixes.py is not
        registered in app/main.py, so POST /api/v1/kyc/submit is unreachable
        today. The hardening below matters anyway — the endpoint is one
        include_router call away from being live.
        """
        response = client.post("/api/v1/kyc/submit", json={"document_type": "passport"})
        assert response.status_code != 200
        assert "submission_id" not in response.text

    def test_kyc_submit_is_gated_when_mounted(self, monkeypatch):
        """
        Mount the api_fixes router on a scratch app and prove the hardened
        endpoint refuses while the surface is dark — instead of its previous
        behaviour of accepting any non-empty Authorization header, storing
        nothing, and replying {"success": true, "status": "pending_review"}.
        """
        from fastapi import FastAPI

        from app.routes.api_fixes import router as api_fixes_router

        monkeypatch.delenv(CARD_SURFACE_ENV_VAR, raising=False)
        scratch = FastAPI()
        scratch.include_router(api_fixes_router)

        with TestClient(scratch) as scratch_client:
            response = scratch_client.post(
                "/api/v1/kyc/submit",
                json={"document_type": "passport"},
                headers={"Authorization": "literally anything"},
            )

        assert response.status_code == 503
        assert response.json()["detail"]["error_code"] == CARD_SURFACE_DISABLED_CODE
        assert "submission_id" not in response.text

    def test_kyc_submit_rejects_a_bogus_token_when_the_surface_is_live(self, monkeypatch):
        """
        With the surface ON, the endpoint must still reject an invalid token.
        Previously it checked only that the header was PRESENT.
        """
        from fastapi import FastAPI

        from app.routes.api_fixes import router as api_fixes_router

        monkeypatch.setenv(CARD_SURFACE_ENV_VAR, "true")
        scratch = FastAPI()
        scratch.include_router(api_fixes_router)

        with TestClient(scratch) as scratch_client:
            response = scratch_client.post(
                "/api/v1/kyc/submit",
                json={"document_type": "passport"},
                headers={"Authorization": "literally anything"},
            )

        assert response.status_code == 401
        assert "submission_id" not in response.text

    def test_every_fis_route_is_gated(self, client):
        """
        Structural guard: enumerate EVERY registered FIS route and assert the
        kill-switch dependency is in its resolved dependency chain. This is
        what stops a future router or endpoint from being added ungated.
        """
        from app.core.card_surface import require_card_surface_enabled
        from app.main import app as real_app

        def dependency_calls(dependant):
            calls = []
            for sub in dependant.dependencies:
                if sub.call is not None:
                    calls.append(sub.call)
                calls.extend(dependency_calls(sub))
            return calls

        fis_routes = [
            route
            for route in real_app.routes
            if "/fis" in getattr(route, "path", "") and hasattr(route, "dependant")
        ]
        assert len(fis_routes) > 0, "No FIS routes registered — the guard would be vacuous."

        ungated = [
            f"{sorted(route.methods)} {route.path}"
            for route in fis_routes
            if require_card_surface_enabled not in dependency_calls(route.dependant)
        ]
        assert not ungated, (
            f"{len(ungated)} FIS route(s) are NOT behind the card-surface kill "
            f"switch:\n  " + "\n  ".join(ungated)
        )
