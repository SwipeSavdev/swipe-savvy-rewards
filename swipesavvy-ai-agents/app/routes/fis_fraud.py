"""
FIS Global Payment One - Fraud & Security API Routes

Handles:
- Fraud reporting
- Security alerts
- Alert preferences
- Travel notices
"""

import logging
from datetime import date
from decimal import Decimal
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.auth import verify_token_string
from app.core.card_ownership import get_owned_fis_card_ids, verify_card_ownership
from app.database import SessionLocal, get_db
from app.models import FISFraudAlert
from app.services.fis_fraud_service import (
    AlertPreferences,
    AlertPriority,
    AlertStatus,
    FISFraudService,
    FraudType,
    NotificationChannel,
    get_fis_fraud_service,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/fis", tags=["fis-fraud"])


# =============================================================================
# AUTHENTICATION
# =============================================================================


def require_auth(authorization: Optional[str] = Header(None)) -> str:
    """Require authentication - raises 401 if no valid token"""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        token = authorization.replace("Bearer ", "")
        user_id = verify_token_string(token)
        if not user_id:
            raise HTTPException(
                status_code=401, detail="Invalid token", headers={"WWW-Authenticate": "Bearer"}
            )
        return user_id
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# =============================================================================
# OWNERSHIP / SCOPING (PCI DSS 7.2.1)
# =============================================================================
#
# Authentication is not authorization. Every route in this module either:
#   * takes a caller-supplied card_id  -> verify_card_ownership(...)
#   * takes a report_id / alert_id     -> resolve the resource, then authorize
#   * returns a COLLECTION             -> scope to the caller's own cards
#
# FISFraudService is a pass-through to the upstream FIS API: there is no local
# fraud-report table, and the upstream collection endpoints accept only a
# single OPTIONAL card_id filter, so an absent filter returns every user's
# data. We therefore never issue an unscoped upstream collection query -- we
# fan out across exactly the cards the caller owns and merge the results.


def _scoped_card_ids(card_id: Optional[str], user_id: str) -> List[str]:
    """
    Resolve the set of cards a collection query may span.

    An explicit card_id must be owned by the caller. An omitted card_id means
    "all of mine" -- never "all of everyone's". A caller who owns no cards
    yields an empty list, and the caller must then return an empty result
    without contacting upstream at all.
    """
    if card_id:
        verify_card_ownership(card_id, user_id)
        return [card_id]
    return get_owned_fis_card_ids(user_id)


def _as_items(payload: Any) -> List[Any]:
    """Normalise an upstream collection payload to a list so per-card results can be merged."""
    if payload is None:
        return []
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("reports", "alerts", "items", "results", "data"):
            value = payload.get(key)
            if isinstance(value, list):
                return value
        return [payload]
    return [payload]


def _as_count(payload: Any) -> int:
    """Normalise an upstream count payload to an int so per-card counts can be summed."""
    if isinstance(payload, bool):
        return 0
    if isinstance(payload, int):
        return payload
    if isinstance(payload, dict):
        for key in ("count", "unread_count", "unread", "total"):
            value = payload.get(key)
            if isinstance(value, int) and not isinstance(value, bool):
                return value
    return 0


def _authorize_via_payload_card(
    resource: str, resource_id: str, payload: Any, user_id: str
) -> None:
    """
    Authorize a resource identified only by its own id, via the card it belongs to.

    Fails CLOSED: a payload carrying no card reference cannot be proven to
    belong to the caller, so it is refused rather than disclosed.
    """
    card_id = payload.get("card_id") if isinstance(payload, dict) else None
    if not card_id:
        logger.warning(
            f"{resource} {resource_id} carries no card reference; "
            f"refusing to disclose it to user {user_id}"
        )
        raise HTTPException(status_code=403, detail="Access denied")
    verify_card_ownership(card_id, user_id)


async def _authorize_alert(alert_id: str, user_id: str, fraud_service: FISFraudService) -> None:
    """
    Authorize access to a security alert.

    Local FISFraudAlert rows carry user_id directly and are authoritative when
    present; otherwise fall back to the owning card on the upstream payload.
    """
    db = SessionLocal()
    try:
        alert = (
            db.query(FISFraudAlert)
            .filter((FISFraudAlert.id == alert_id) | (FISFraudAlert.fis_alert_id == alert_id))
            .first()
        )
        if alert is not None:
            if str(alert.user_id) != str(user_id):
                logger.warning(
                    f"Alert ownership violation: user {user_id} attempted to access "
                    f"alert {alert_id} owned by {alert.user_id}"
                )
                raise HTTPException(status_code=403, detail="Access denied")
            return
    finally:
        db.close()

    response = await fraud_service.get_alert(alert_id)
    if not response.success:
        raise HTTPException(status_code=404, detail=response.error_message or "Alert not found")
    _authorize_via_payload_card("Alert", alert_id, response.data, user_id)


async def _authorize_report(report_id: str, user_id: str, fraud_service: FISFraudService):
    """
    Authorize access to a fraud report and return the already-fetched report.

    There is no local fraud-report table, so ownership is derived from the card
    the report is filed against.
    """
    response = await fraud_service.get_fraud_report(report_id)
    if not response.success:
        raise HTTPException(
            status_code=404, detail=response.error_message or "Fraud report not found"
        )
    _authorize_via_payload_card("Fraud report", report_id, response.data, user_id)
    return response


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================


class FraudReportRequest(BaseModel):
    """Request to report fraud"""

    card_id: str
    fraud_type: str
    description: str
    transaction_id: Optional[str] = None
    estimated_loss: Optional[float] = None
    reported_to_police: bool = False
    police_report_number: Optional[str] = None
    suspected_date: Optional[date] = None


class UpdateFraudReportRequest(BaseModel):
    """Request to update a fraud report"""

    description: Optional[str] = None
    reported_to_police: Optional[bool] = None
    police_report_number: Optional[str] = None


class AcknowledgeAlertRequest(BaseModel):
    """Request to acknowledge an alert"""

    notes: Optional[str] = None


class ResolveAlertRequest(BaseModel):
    """Request to resolve an alert"""

    resolution: str
    is_false_positive: bool = False


class AlertPreferencesRequest(BaseModel):
    """Request to set alert preferences"""

    alert_on_all_transactions: bool = False
    alert_on_large_transactions: bool = True
    large_transaction_threshold: float = 100.00
    alert_on_international: bool = True
    alert_on_card_not_present: bool = True
    alert_on_declined: bool = True
    alert_on_suspicious_activity: bool = True
    alert_on_pin_failures: bool = True
    alert_on_card_lock: bool = True
    notification_channels: List[str] = Field(default_factory=lambda: ["push", "email"])
    quiet_hours_enabled: bool = False
    quiet_hours_start: Optional[int] = None
    quiet_hours_end: Optional[int] = None


class TravelNoticeRequest(BaseModel):
    """Request to set a travel notice"""

    start_date: date
    end_date: date
    destinations: List[str]
    notes: Optional[str] = None


# =============================================================================
# FRAUD REPORTING ENDPOINTS
# =============================================================================


@router.post("/fraud/reports")
async def report_fraud(
    request: FraudReportRequest,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Report fraud on a card."""
    verify_card_ownership(request.card_id, user_id)
    try:
        fraud_type = FraudType(request.fraud_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid fraud type. Must be one of: {[t.value for t in FraudType]}",
        )

    response = await fraud_service.report_fraud(
        card_id=request.card_id,
        fraud_type=fraud_type,
        description=request.description,
        transaction_id=request.transaction_id,
        estimated_loss=Decimal(str(request.estimated_loss)) if request.estimated_loss else None,
        reported_to_police=request.reported_to_police,
        police_report_number=request.police_report_number,
        suspected_date=request.suspected_date,
    )

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to report fraud"
        )

    return {"success": True, "message": "Fraud reported successfully", "data": response.data}


@router.get("/fraud/reports")
async def get_fraud_reports(
    card_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """
    Get fraud reports belonging to the authenticated user.

    An explicit card_id must be owned by the caller. Omitting it returns the
    caller's OWN reports across all of their cards -- it does NOT return every
    user's reports, which is what the unscoped upstream query used to do.
    """
    reports: List[Any] = []
    for owned_card_id in _scoped_card_ids(card_id, user_id):
        response = await fraud_service.get_fraud_reports(card_id=owned_card_id, status=status)

        if not response.success:
            raise HTTPException(
                status_code=400, detail=response.error_message or "Failed to get fraud reports"
            )

        reports.extend(_as_items(response.data))

    return {"success": True, "data": reports}


@router.get("/fraud/reports/{report_id}")
async def get_fraud_report(
    report_id: str,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Get fraud report details."""
    response = await _authorize_report(report_id, user_id, fraud_service)

    return {"success": True, "data": response.data}


@router.put("/fraud/reports/{report_id}")
async def update_fraud_report(
    report_id: str,
    request: UpdateFraudReportRequest,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Update a fraud report."""
    await _authorize_report(report_id, user_id, fraud_service)

    updates = {}
    if request.description is not None:
        updates["description"] = request.description
    if request.reported_to_police is not None:
        updates["reported_to_police"] = request.reported_to_police
    if request.police_report_number is not None:
        updates["police_report_number"] = request.police_report_number

    response = await fraud_service.update_fraud_report(report_id, updates)

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to update fraud report"
        )

    return {"success": True, "message": "Fraud report updated"}


# =============================================================================
# SECURITY ALERTS ENDPOINTS
# =============================================================================


@router.get("/alerts")
async def get_alerts(
    card_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """
    Get security alerts belonging to the authenticated user.

    Scoped exactly like the fraud-report listing: an explicit card_id must be
    owned by the caller, and omitting it spans only the caller's own cards.
    """
    scoped_card_ids = _scoped_card_ids(card_id, user_id)

    alert_status = None
    if status:
        try:
            alert_status = AlertStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {[s.value for s in AlertStatus]}",
            )

    alert_priority = None
    if priority:
        try:
            alert_priority = AlertPriority(priority)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid priority. Must be one of: {[p.value for p in AlertPriority]}",
            )

    alerts: List[Any] = []
    for owned_card_id in scoped_card_ids:
        response = await fraud_service.get_alerts(
            card_id=owned_card_id,
            status=alert_status,
            priority=alert_priority,
            start_date=start_date,
            end_date=end_date,
        )

        if not response.success:
            raise HTTPException(
                status_code=400, detail=response.error_message or "Failed to get alerts"
            )

        alerts.extend(_as_items(response.data))

    return {"success": True, "data": alerts}


@router.get("/alerts/unread/count")
async def get_unread_alerts_count(
    card_id: Optional[str] = Query(None),
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """
    Get the count of unread alerts for the authenticated user.

    Scoped exactly like the alert listing: an explicit card_id must be owned by
    the caller, and omitting it counts only the caller's own cards.
    """
    count = 0
    for owned_card_id in _scoped_card_ids(card_id, user_id):
        response = await fraud_service.get_unread_alerts_count(owned_card_id)

        if not response.success:
            raise HTTPException(
                status_code=400, detail=response.error_message or "Failed to get alert count"
            )

        count += _as_count(response.data)

    return {"success": True, "data": {"count": count}}


@router.get("/alerts/{alert_id}")
async def get_alert(
    alert_id: str,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Get alert details."""
    await _authorize_alert(alert_id, user_id, fraud_service)
    response = await fraud_service.get_alert(alert_id)

    if not response.success:
        raise HTTPException(status_code=404, detail=response.error_message or "Alert not found")

    return {"success": True, "data": response.data}


@router.put("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    request: AcknowledgeAlertRequest,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Acknowledge a security alert."""
    await _authorize_alert(alert_id, user_id, fraud_service)
    response = await fraud_service.acknowledge_alert(alert_id=alert_id, notes=request.notes)

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to acknowledge alert"
        )

    return {"success": True, "message": "Alert acknowledged"}


@router.put("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    request: ResolveAlertRequest,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Resolve a security alert."""
    await _authorize_alert(alert_id, user_id, fraud_service)
    response = await fraud_service.resolve_alert(
        alert_id=alert_id,
        resolution=request.resolution,
        is_false_positive=request.is_false_positive,
    )

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to resolve alert"
        )

    return {"success": True, "message": "Alert resolved"}


# =============================================================================
# ALERT PREFERENCES ENDPOINTS
# =============================================================================


@router.get("/cards/{card_id}/alerts/preferences")
async def get_alert_preferences(
    card_id: str,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Get alert preferences for a card."""
    verify_card_ownership(card_id, user_id)
    response = await fraud_service.get_alert_preferences(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to get preferences"
        )

    return {"success": True, "data": response.data}


@router.put("/cards/{card_id}/alerts/preferences")
async def set_alert_preferences(
    card_id: str,
    request: AlertPreferencesRequest,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Set alert preferences for a card."""
    verify_card_ownership(card_id, user_id)
    # Parse notification channels
    notification_channels = []
    for ch in request.notification_channels:
        try:
            notification_channels.append(NotificationChannel(ch))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid notification channel: {ch}")

    preferences = AlertPreferences(
        alert_on_all_transactions=request.alert_on_all_transactions,
        alert_on_large_transactions=request.alert_on_large_transactions,
        large_transaction_threshold=Decimal(str(request.large_transaction_threshold)),
        alert_on_international=request.alert_on_international,
        alert_on_card_not_present=request.alert_on_card_not_present,
        alert_on_declined=request.alert_on_declined,
        alert_on_suspicious_activity=request.alert_on_suspicious_activity,
        alert_on_pin_failures=request.alert_on_pin_failures,
        alert_on_card_lock=request.alert_on_card_lock,
        notification_channels=notification_channels,
        quiet_hours_enabled=request.quiet_hours_enabled,
        quiet_hours_start=request.quiet_hours_start,
        quiet_hours_end=request.quiet_hours_end,
    )

    response = await fraud_service.set_alert_preferences(card_id, preferences)

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to set preferences"
        )

    return {"success": True, "message": "Alert preferences updated"}


# =============================================================================
# TRAVEL NOTICE ENDPOINTS
# =============================================================================


@router.post("/cards/{card_id}/travel-notices")
async def set_travel_notice(
    card_id: str,
    request: TravelNoticeRequest,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Set a travel notice for a card."""
    verify_card_ownership(card_id, user_id)
    response = await fraud_service.set_travel_notice(
        card_id=card_id,
        start_date=request.start_date,
        end_date=request.end_date,
        destinations=request.destinations,
        notes=request.notes,
    )

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to set travel notice"
        )

    return {"success": True, "message": "Travel notice set", "data": response.data}


@router.get("/cards/{card_id}/travel-notices")
async def get_travel_notices(
    card_id: str,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Get active travel notices for a card."""
    verify_card_ownership(card_id, user_id)
    response = await fraud_service.get_travel_notices(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to get travel notices"
        )

    return {"success": True, "data": response.data}


@router.delete("/cards/{card_id}/travel-notices/{notice_id}")
async def cancel_travel_notice(
    card_id: str,
    notice_id: str,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Cancel a travel notice."""
    verify_card_ownership(card_id, user_id)
    response = await fraud_service.cancel_travel_notice(card_id=card_id, notice_id=notice_id)

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to cancel travel notice"
        )

    return {"success": True, "message": "Travel notice cancelled"}


# =============================================================================
# RISK SCORE ENDPOINT
# =============================================================================


@router.get("/cards/{card_id}/risk-score")
async def get_risk_score(
    card_id: str,
    user_id: str = Depends(require_auth),
    fraud_service: FISFraudService = Depends(get_fis_fraud_service),
):
    """Get current risk score for a card."""
    verify_card_ownership(card_id, user_id)
    response = await fraud_service.get_risk_score(card_id)

    if not response.success:
        raise HTTPException(
            status_code=400, detail=response.error_message or "Failed to get risk score"
        )

    return {"success": True, "data": response.data}
