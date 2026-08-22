"""
Cross-user authorization (IDOR) tests for the FIS wallet and fraud routes.

Every route in these modules is authenticated, but authentication is not
authorization: before this suite existed, any authenticated user could pass
another user's card_id and succeed.

The FIS service layer is faked (see conftest.RecordingService) and always
returns success, so every 403/404 asserted here is produced by the route's own
authorization logic rather than by an upstream failure. Nothing contacts a live
FIS endpoint.
"""

import uuid

FRAUD = "/api/v1/fis"
WALLET = "/api/v1/fis/cards"

TOKEN = "tok_example"
NOTICE = "notice_example"


# =============================================================================
# WALLET -- every route, both directions
# =============================================================================


def wallet_requests(card_id):
    """(label, method, path, json) for all 14 wallet routes, with valid bodies."""
    base = f"{WALLET}/{card_id}/wallet"
    apple = {
        "device_id": "d1",
        "device_type": "phone",
        "certificates": ["c"],
        "nonce": "n",
        "nonce_signature": "s",
    }
    google = {
        "device_id": "d1",
        "device_type": "phone",
        "wallet_account_id": "w1",
        "device_info": {},
    }
    samsung = {
        "device_id": "d1",
        "device_type": "phone",
        "wallet_user_id": "w1",
        "device_info": {},
    }
    return [
        ("apple_pay_eligibility", "GET", f"{base}/apple-pay/eligibility", None),
        ("apple_pay_provision", "POST", f"{base}/apple-pay/provision", apple),
        ("google_pay_eligibility", "GET", f"{base}/google-pay/eligibility", None),
        ("google_pay_provision", "POST", f"{base}/google-pay/provision", google),
        ("google_pay_push_token", "POST", f"{base}/google-pay/push-token", {"wallet_account_id": "w1"}),
        ("samsung_pay_provision", "POST", f"{base}/samsung-pay/provision", samsung),
        ("list_tokens", "GET", f"{base}/tokens", None),
        ("get_token", "GET", f"{base}/tokens/{TOKEN}", None),
        ("suspend_token", "POST", f"{base}/tokens/{TOKEN}/suspend", {"reason": "r"}),
        ("resume_token", "POST", f"{base}/tokens/{TOKEN}/resume", None),
        ("delete_token", "DELETE", f"{base}/tokens/{TOKEN}", {"reason": "r"}),
        ("suspend_all_tokens", "POST", f"{base}/tokens/suspend-all", {"reason": "r"}),
        ("delete_all_tokens", "DELETE", f"{base}/tokens", {"reason": "r"}),
        ("token_activity", "GET", f"{base}/tokens/{TOKEN}/activity", None),
    ]


def test_wallet_every_route_rejects_another_users_card(wallet_client, user_a, user_b):
    """User A must not touch any wallet surface of user B's card."""
    client, service = wallet_client()
    failures = []
    for label, method, path, body in wallet_requests(user_b.card_id):
        r = client.request(method, path, json=body, headers=user_a.headers)
        if r.status_code != 403:
            failures.append(f"{label}: expected 403, got {r.status_code} {r.text[:120]}")
    assert not failures, "wallet routes leaking across users:\n" + "\n".join(failures)
    assert service.calls == [], f"service was reached despite denial: {service.calls}"


def test_wallet_every_route_allows_the_owner(wallet_client, user_a):
    """The same 14 routes must still work for the card's owner."""
    client, service = wallet_client()
    failures = []
    for label, method, path, body in wallet_requests(user_a.card_id):
        r = client.request(method, path, json=body, headers=user_a.headers)
        if r.status_code != 200:
            failures.append(f"{label}: expected 200, got {r.status_code} {r.text[:120]}")
    assert not failures, "owner wrongly blocked:\n" + "\n".join(failures)
    assert len(service.calls) == 14


def test_wallet_delete_all_tokens_cross_user_is_denied(wallet_client, user_a, user_b):
    """Confirmed exploit path: deleting another user's wallet tokens."""
    client, service = wallet_client()
    r = client.request(
        "DELETE", f"{WALLET}/{user_b.card_id}/wallet/tokens", json={"reason": "x"},
        headers=user_a.headers,
    )
    assert r.status_code == 403
    assert service.calls == []


def test_wallet_apple_pay_provision_cross_user_is_denied(wallet_client, user_a, user_b):
    """Confirmed exploit path: provisioning a card you do not own."""
    client, service = wallet_client()
    _, _, path, body = wallet_requests(user_b.card_id)[1]
    r = client.post(path, json=body, headers=user_a.headers)
    assert r.status_code == 403
    assert service.calls == []


def test_wallet_unknown_card_is_404_not_200(wallet_client, user_a):
    client, service = wallet_client()
    r = client.get(f"{WALLET}/card_does_not_exist/wallet/tokens", headers=user_a.headers)
    assert r.status_code == 404
    assert service.calls == []


def test_wallet_requires_authentication(wallet_client, user_a):
    client, _ = wallet_client()
    r = client.get(f"{WALLET}/{user_a.card_id}/wallet/tokens")
    assert r.status_code == 401


# =============================================================================
# FRAUD -- card-scoped routes
# =============================================================================


def fraud_card_requests(card_id):
    """(label, method, path, json) for the six card-scoped fraud routes."""
    prefs = {"large_transaction_threshold": 100.0, "notification_channels": ["push"]}
    notice = {
        "start_date": "2030-01-01",
        "end_date": "2030-01-10",
        "destinations": ["FR"],
    }
    return [
        ("get_alert_preferences", "GET", f"{FRAUD}/cards/{card_id}/alerts/preferences", None),
        ("set_alert_preferences", "PUT", f"{FRAUD}/cards/{card_id}/alerts/preferences", prefs),
        ("set_travel_notice", "POST", f"{FRAUD}/cards/{card_id}/travel-notices", notice),
        ("get_travel_notices", "GET", f"{FRAUD}/cards/{card_id}/travel-notices", None),
        ("cancel_travel_notice", "DELETE", f"{FRAUD}/cards/{card_id}/travel-notices/{NOTICE}", None),
        ("get_risk_score", "GET", f"{FRAUD}/cards/{card_id}/risk-score", None),
    ]


def test_fraud_card_routes_reject_another_users_card(fraud_client, user_a, user_b):
    client, service = fraud_client()
    failures = []
    for label, method, path, body in fraud_card_requests(user_b.card_id):
        r = client.request(method, path, json=body, headers=user_a.headers)
        if r.status_code != 403:
            failures.append(f"{label}: expected 403, got {r.status_code} {r.text[:120]}")
    assert not failures, "fraud card routes leaking across users:\n" + "\n".join(failures)
    assert service.calls == []


def test_fraud_card_routes_allow_the_owner(fraud_client, user_a):
    client, service = fraud_client()
    failures = []
    for label, method, path, body in fraud_card_requests(user_a.card_id):
        r = client.request(method, path, json=body, headers=user_a.headers)
        if r.status_code != 200:
            failures.append(f"{label}: expected 200, got {r.status_code} {r.text[:120]}")
    assert not failures, "owner wrongly blocked:\n" + "\n".join(failures)


def test_risk_score_of_another_user_is_denied(fraud_client, user_a, user_b):
    """Confirmed exploit path: reading another user's risk score."""
    client, service = fraud_client()
    r = client.get(f"{FRAUD}/cards/{user_b.card_id}/risk-score", headers=user_a.headers)
    assert r.status_code == 403
    assert service.calls == []


def test_report_fraud_against_another_users_card_is_denied(fraud_client, user_a, user_b):
    client, service = fraud_client()
    r = client.post(
        f"{FRAUD}/fraud/reports",
        json={"card_id": user_b.card_id, "fraud_type": "card_lost", "description": "d"},
        headers=user_a.headers,
    )
    assert r.status_code == 403
    assert service.calls == []


# =============================================================================
# FRAUD -- collection scoping (the optional card_id that returned everything)
# =============================================================================


def test_fraud_report_listing_without_card_id_is_scoped_to_caller(fraud_client, user_a, user_b):
    """
    Omitting card_id must return only the caller's own reports.

    Previously this issued ONE unscoped upstream query, which returns every
    user's reports platform-wide.
    """
    client, service = fraud_client({"get_fraud_reports": lambda kw: {"reports": [{"card_id": kw["card_id"]}]}})
    r = client.get(f"{FRAUD}/fraud/reports", headers=user_a.headers)
    assert r.status_code == 200

    queried = service.cards_queried("get_fraud_reports")
    assert queried == [user_a.card_id], queried
    assert user_b.card_id not in queried
    assert None not in queried, "an unscoped upstream query was issued"

    returned = r.json()["data"]
    assert [row["card_id"] for row in returned] == [user_a.card_id]


def test_alert_listing_without_card_id_is_scoped_to_caller(fraud_client, user_a, user_b):
    client, service = fraud_client({"get_alerts": lambda kw: {"alerts": [{"card_id": kw["card_id"]}]}})
    r = client.get(f"{FRAUD}/alerts", headers=user_a.headers)
    assert r.status_code == 200

    queried = service.cards_queried("get_alerts")
    assert queried == [user_a.card_id], queried
    assert None not in queried, "an unscoped upstream query was issued"
    assert [row["card_id"] for row in r.json()["data"]] == [user_a.card_id]


def test_unread_count_without_card_id_is_scoped_to_caller(fraud_client, user_a, user_b):
    client, service = fraud_client({"get_unread_alerts_count": {"count": 3}})
    r = client.get(f"{FRAUD}/alerts/unread/count", headers=user_a.headers)
    assert r.status_code == 200

    queried = service.cards_queried("get_unread_alerts_count")
    assert queried == [user_a.card_id], queried
    assert r.json()["data"]["count"] == 3


def test_listings_reject_an_explicit_foreign_card_id(fraud_client, user_a, user_b):
    client, service = fraud_client()
    for path in (
        f"{FRAUD}/fraud/reports?card_id={user_b.card_id}",
        f"{FRAUD}/alerts?card_id={user_b.card_id}",
        f"{FRAUD}/alerts/unread/count?card_id={user_b.card_id}",
    ):
        r = client.get(path, headers=user_a.headers)
        assert r.status_code == 403, f"{path} -> {r.status_code}"
    assert service.calls == []


def test_caller_with_no_cards_gets_empty_and_never_calls_upstream(fraud_client, stranger):
    """A user who owns no cards must not fall back to an unscoped query."""
    client, service = fraud_client()
    r = client.get(f"{FRAUD}/fraud/reports", headers=stranger.headers)
    assert r.status_code == 200
    assert r.json()["data"] == []
    assert service.calls == [], f"upstream was contacted for a user with no cards: {service.calls}"


def test_listing_spans_every_card_the_caller_owns(fraud_client, user_a):
    """Scoping is per-user, not per-card: a second card of the caller is included."""
    from tests.unit.conftest import _make_card

    second = _make_card(user_a.user_id, f"card_a2_{uuid.uuid4().hex[:10]}")
    client, service = fraud_client({"get_fraud_reports": lambda kw: {"reports": [{"card_id": kw["card_id"]}]}})
    r = client.get(f"{FRAUD}/fraud/reports", headers=user_a.headers)
    assert r.status_code == 200
    assert sorted(service.cards_queried("get_fraud_reports")) == sorted([user_a.card_id, second])


# =============================================================================
# FRAUD -- resources keyed by their own id (fetch, then authorize)
# =============================================================================


def test_fraud_report_detail_of_another_users_card_is_denied(fraud_client, user_a, user_b):
    """Confirmed exploit path: reading another user's fraud report."""
    client, _ = fraud_client({"get_fraud_report": {"card_id": user_b.card_id}})
    r = client.get(f"{FRAUD}/fraud/reports/report_123", headers=user_a.headers)
    assert r.status_code == 403


def test_fraud_report_detail_allowed_for_owner(fraud_client, user_a):
    client, _ = fraud_client({"get_fraud_report": {"card_id": user_a.card_id}})
    r = client.get(f"{FRAUD}/fraud/reports/report_123", headers=user_a.headers)
    assert r.status_code == 200


def test_fraud_report_update_of_another_users_card_is_denied(fraud_client, user_a, user_b):
    client, service = fraud_client({"get_fraud_report": {"card_id": user_b.card_id}})
    r = client.put(
        f"{FRAUD}/fraud/reports/report_123", json={"description": "hijacked"},
        headers=user_a.headers,
    )
    assert r.status_code == 403
    assert "update_fraud_report" not in [n for n, _ in service.calls], "mutation ran before denial"


def test_alert_routes_of_another_users_card_are_denied(fraud_client, user_a, user_b):
    payloads = {"get_alert": {"card_id": user_b.card_id}}
    for method, path, body in (
        ("GET", f"{FRAUD}/alerts/alert_1", None),
        ("PUT", f"{FRAUD}/alerts/alert_1/acknowledge", {"notes": "n"}),
        ("PUT", f"{FRAUD}/alerts/alert_1/resolve", {"resolution": "r"}),
    ):
        client, service = fraud_client(payloads)
        r = client.request(method, path, json=body, headers=user_a.headers)
        assert r.status_code == 403, f"{path} -> {r.status_code}"
        assert "acknowledge_alert" not in [n for n, _ in service.calls]
        assert "resolve_alert" not in [n for n, _ in service.calls]


def test_alert_routes_allowed_for_owner(fraud_client, user_a):
    payloads = {"get_alert": {"card_id": user_a.card_id}}
    for method, path, body in (
        ("GET", f"{FRAUD}/alerts/alert_1", None),
        ("PUT", f"{FRAUD}/alerts/alert_1/acknowledge", {"notes": "n"}),
        ("PUT", f"{FRAUD}/alerts/alert_1/resolve", {"resolution": "r"}),
    ):
        client, _ = fraud_client(payloads)
        r = client.request(method, path, json=body, headers=user_a.headers)
        assert r.status_code == 200, f"{path} -> {r.status_code} {r.text[:120]}"


def test_unattributable_resource_fails_closed(fraud_client, user_a):
    """
    A payload with no card reference cannot be proven to belong to the caller,
    so it must be refused rather than disclosed.
    """
    client, _ = fraud_client({"get_fraud_report": {"message": "no card reference here"}})
    r = client.get(f"{FRAUD}/fraud/reports/report_123", headers=user_a.headers)
    assert r.status_code == 403


def test_fraud_requires_authentication(fraud_client):
    client, _ = fraud_client()
    assert client.get(f"{FRAUD}/fraud/reports").status_code == 401


def _seed_alert(user_id, card_id, fis_alert_id):
    """Insert a local FISFraudAlert row, which carries user_id directly."""
    from datetime import datetime

    from app.database import SessionLocal
    from app.models import FISFraudAlert

    db = SessionLocal()
    try:
        db.add(
            FISFraudAlert(
                id=str(uuid.uuid4()),
                card_id=card_id,
                user_id=user_id,
                fis_alert_id=fis_alert_id,
                alert_type="suspicious_transaction",
                severity="high",
                status="open",
                alerted_at=datetime.utcnow(),
            )
        )
        db.commit()
    finally:
        db.close()


def test_local_alert_row_is_authoritative_and_blocks_other_users(fraud_client, user_a, user_b):
    """
    When a local FISFraudAlert row exists it decides ownership directly, without
    trusting (or even fetching) the upstream payload.
    """
    alert_id = f"alert_{uuid.uuid4().hex[:10]}"
    _seed_alert(user_b.user_id, user_b.card_id, alert_id)

    # Upstream would claim the alert belongs to A; the local row must win.
    client, service = fraud_client({"get_alert": {"card_id": user_a.card_id}})
    r = client.get(f"{FRAUD}/alerts/{alert_id}", headers=user_a.headers)
    assert r.status_code == 403
    assert service.calls == [], "upstream was consulted even though the local row settled it"


def test_local_alert_row_allows_its_owner(fraud_client, user_a):
    alert_id = f"alert_{uuid.uuid4().hex[:10]}"
    _seed_alert(user_a.user_id, user_a.card_id, alert_id)

    client, _ = fraud_client({"get_alert": {"card_id": user_a.card_id}})
    r = client.get(f"{FRAUD}/alerts/{alert_id}", headers=user_a.headers)
    assert r.status_code == 200
