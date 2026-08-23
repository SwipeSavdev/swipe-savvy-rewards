"""
Route-ordering regression tests for the FIS transaction routes.

FastAPI matches routes in declaration order, so a parameterised path declared
before its literal siblings permanently swallows them:
`/{card_id}/transactions/{transaction_id}` used to be declared above
`/summary`, `/categories` and `/merchants`, making all three unreachable -- they
returned the single-transaction handler instead, and no request could ever
reach them.

These tests resolve each path through the real router and assert *which*
handler answers, so re-introducing the ordering bug fails here rather than
silently in production.
"""

import pytest
from fastapi import FastAPI
from fastapi.routing import APIRoute

from app.routes.fis_transactions import router

PREFIX = "/api/v1/fis/cards"


def resolve(method, path):
    """Return the handler FastAPI would actually run for `path`."""
    app = FastAPI()
    app.include_router(router)
    for route in app.routes:
        if isinstance(route, APIRoute):
            match, _ = route.matches(
                {"type": "http", "path": path, "method": method, "path_params": {}}
            )
            if match.name == "FULL":
                return route.endpoint.__name__, route.path
    return None, None


@pytest.mark.parametrize(
    "literal,expected_handler",
    [
        ("summary", "get_transaction_summary"),
        ("categories", "get_spending_by_category"),
        ("merchants", "get_spending_by_merchant"),
        ("recent", "get_recent_transactions"),
        ("pending", "get_pending_transactions"),
    ],
)
def test_literal_transaction_paths_reach_their_own_handler(literal, expected_handler):
    handler, pattern = resolve("GET", f"{PREFIX}/card_1/transactions/{literal}")
    assert handler == expected_handler, (
        f"/{literal} resolved to {handler} ({pattern}) -- a parameterised route is "
        f"shadowing it. Declare literal paths before /{{transaction_id}}."
    )


def test_parameterised_transaction_path_still_resolves():
    """The catch-all must keep working for genuine transaction ids."""
    handler, _ = resolve("GET", f"{PREFIX}/card_1/transactions/txn_abc123")
    assert handler == "get_transaction"


def test_parameterised_route_is_declared_after_every_literal_sibling():
    """
    Guards the ordering itself, not just today's literals: any literal
    `/transactions/<name>` added below the catch-all would be unreachable.
    """
    app = FastAPI()
    app.include_router(router)
    catch_all = f"{PREFIX}/{{card_id}}/transactions/{{transaction_id}}"

    positions = [
        i for i, r in enumerate(app.routes) if isinstance(r, APIRoute) and r.path == catch_all
    ]
    assert positions, "catch-all route not found"
    catch_all_at = min(positions)

    shadowed = [
        r.path
        for i, r in enumerate(app.routes)
        if isinstance(r, APIRoute)
        and i > catch_all_at
        and r.path.startswith(f"{PREFIX}/{{card_id}}/transactions/")
        and "{transaction_id}" not in r.path
    ]
    assert not shadowed, f"declared after the catch-all and therefore unreachable: {shadowed}"
