"""
FIS Global Payment One - Fraud & Security Service

Handles fraud and security operations:
- Fraud reporting
- Security alerts management
- Alert preferences
- Suspicious activity monitoring
- Real-time fraud screening
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, Field

from app.services.fis_global_service import (
    FISGlobalService,
    FISAPIResponse,
    get_fis_service
)

logger = logging.getLogger(__name__)


# =============================================================================
# ENUMS
# =============================================================================

class FraudType(str, Enum):
    """Types of fraud"""
    UNAUTHORIZED_TRANSACTION = "unauthorized_transaction"
    CARD_NOT_PRESENT = "card_not_present"
    COUNTERFEIT_CARD = "counterfeit_card"
    LOST_STOLEN = "lost_stolen"
    ACCOUNT_TAKEOVER = "account_takeover"
    IDENTITY_THEFT = "identity_theft"
    FRIENDLY_FRAUD = "friendly_fraud"
    OTHER = "other"


class AlertType(str, Enum):
    """Types of security alerts"""
    LARGE_TRANSACTION = "large_transaction"
    INTERNATIONAL_TRANSACTION = "international_transaction"
    CARD_NOT_PRESENT = "card_not_present"
    DECLINED_TRANSACTION = "declined_transaction"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    MULTIPLE_DECLINES = "multiple_declines"
    NEW_MERCHANT = "new_merchant"
    UNUSUAL_LOCATION = "unusual_location"
    PIN_ATTEMPT_FAILED = "pin_attempt_failed"
    CARD_LOCKED = "card_locked"


class AlertPriority(str, Enum):
    """Alert priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    """Alert statuses"""
    NEW = "new"
    ACKNOWLEDGED = "acknowledged"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class NotificationChannel(str, Enum):
    """Notification delivery channels"""
    PUSH = "push"
    SMS = "sms"
    EMAIL = "email"
    IN_APP = "in_app"


# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class FraudReport(BaseModel):
    """Fraud report request"""
    card_id: str
    transaction_id: Optional[str] = None
    fraud_type: FraudType
    description: str
    estimated_loss: Optional[Decimal] = None
    reported_to_police: bool = False
    police_report_number: Optional[str] = None
    suspected_date: Optional[date] = None
    additional_info: Optional[Dict[str, Any]] = None


class FraudReportResponse(BaseModel):
    """Fraud report response"""
    report_id: str
    card_id: str
    status: str
    created_at: datetime
    case_number: Optional[str] = None
    investigator_assigned: bool = False
    next_steps: List[str]


class SecurityAlert(BaseModel):
    """Security alert"""
    alert_id: str
    card_id: str
    alert_type: AlertType
    priority: AlertPriority
    status: AlertStatus
    title: str
    description: str
    transaction_id: Optional[str] = None
    amount: Optional[Decimal] = None
    merchant_name: Optional[str] = None
    location: Optional[Dict[str, str]] = None
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None


class AlertPreferences(BaseModel):
    """Alert preference settings"""
    # Transaction alerts
    alert_on_all_transactions: bool = False
    alert_on_large_transactions: bool = True
    large_transaction_threshold: Decimal = Field(default=Decimal("100.00"))
    alert_on_international: bool = True
    alert_on_card_not_present: bool = True
    alert_on_declined: bool = True

    # Security alerts
    alert_on_suspicious_activity: bool = True
    alert_on_pin_failures: bool = True
    alert_on_card_lock: bool = True

    # Notification channels
    notification_channels: List[NotificationChannel] = Field(
        default_factory=lambda: [NotificationChannel.PUSH, NotificationChannel.EMAIL]
    )

    # Quiet hours (no notifications)
    quiet_hours_enabled: bool = False
    quiet_hours_start: Optional[int] = None  # 0-23
    quiet_hours_end: Optional[int] = None  # 0-23


class TravelNotice(BaseModel):
    """Travel notice for card usage"""
    card_id: str
    start_date: date
    end_date: date
    destinations: List[str]  # Country codes
    notes: Optional[str] = None


# =============================================================================
# FIS FRAUD SERVICE
# =============================================================================

class FISFraudService:
    """
    Service for FIS fraud detection and security management.
    """

    def __init__(self, fis_service: Optional[FISGlobalService] = None):
        """
        Initialize fraud service.

        Args:
            fis_service: FIS Global service instance
        """
        self.fis = fis_service or get_fis_service()

    # =========================================================================
    # FRAUD REPORTING
    # =========================================================================

    async def report_fraud(
        self,
        card_id: str,
        fraud_type: FraudType,
        description: str,
        transaction_id: Optional[str] = None,
        estimated_loss: Optional[Decimal] = None,
        reported_to_police: bool = False,
        police_report_number: Optional[str] = None,
        suspected_date: Optional[date] = None,
        additional_info: Optional[Dict[str, Any]] = None
    ) -> FISAPIResponse:
        """
        Report fraud on a card.

        Args:
            card_id: FIS card ID
            fraud_type: Type of fraud
            description: Detailed description
            transaction_id: Related transaction ID (if applicable)
            estimated_loss: Estimated financial loss
            reported_to_police: Whether reported to police
            police_report_number: Police report number
            suspected_date: Date fraud suspected to have occurred
            additional_info: Any additional information

        Returns:
            FISAPIResponse with fraud report details
        """
        logger.info(f"Reporting fraud for card {card_id} - type: {fraud_type.value}")

        payload: Dict[str, Any] = {
            "card_id": card_id,
            "fraud_type": fraud_type.value,
            "description": description
        }

        if transaction_id:
            payload["transaction_id"] = transaction_id
        if estimated_loss is not None:
            payload["estimated_loss"] = float(estimated_loss)
        if reported_to_police:
            payload["reported_to_police"] = True
            if police_report_number:
                payload["police_report_number"] = police_report_number
        if suspected_date:
            payload["suspected_date"] = suspected_date.isoformat()
        if additional_info:
            payload["additional_info"] = additional_info

        response = await self.fis._make_request(
            method="POST",
            endpoint="/fraud/reports",
            data=payload
        )

        if response.success:
            logger.info(f"Fraud report created: {response.data.get('report_id')}")
        else:
            logger.error(f"Failed to create fraud report: {response.error_message}")

        return response

    async def get_fraud_report(self, report_id: str) -> FISAPIResponse:
        """
        Get fraud report details.

        Args:
            report_id: Fraud report ID

        Returns:
            FISAPIResponse with report details
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/fraud/reports/{report_id}"
        )

    async def get_fraud_reports(
        self,
        card_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Get fraud reports.

        Args:
            card_id: Optional card ID filter
            status: Optional status filter

        Returns:
            FISAPIResponse with reports list
        """
        params = {}
        if card_id:
            params["card_id"] = card_id
        if status:
            params["status"] = status

        return await self.fis._make_request(
            method="GET",
            endpoint="/fraud/reports",
            params=params
        )

    async def update_fraud_report(
        self,
        report_id: str,
        updates: Dict[str, Any]
    ) -> FISAPIResponse:
        """
        Update a fraud report with additional information.

        Args:
            report_id: Fraud report ID
            updates: Update data

        Returns:
            FISAPIResponse with updated report
        """
        logger.info(f"Updating fraud report {report_id}")

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/fraud/reports/{report_id}",
            data=updates
        )

    # =========================================================================
    # SECURITY ALERTS
    # =========================================================================

    async def get_alerts(
        self,
        card_id: Optional[str] = None,
        status: Optional[AlertStatus] = None,
        priority: Optional[AlertPriority] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> FISAPIResponse:
        """
        Get security alerts.

        Args:
            card_id: Optional card ID filter
            status: Optional status filter
            priority: Optional priority filter
            start_date: Optional start date
            end_date: Optional end date

        Returns:
            FISAPIResponse with alerts list
        """
        params = {}
        if card_id:
            params["card_id"] = card_id
        if status:
            params["status"] = status.value
        if priority:
            params["priority"] = priority.value
        if start_date:
            params["start_date"] = start_date.isoformat()
        if end_date:
            params["end_date"] = end_date.isoformat()

        return await self.fis._make_request(
            method="GET",
            endpoint="/alerts",
            params=params
        )

    async def get_alert(self, alert_id: str) -> FISAPIResponse:
        """
        Get alert details.

        Args:
            alert_id: Alert ID

        Returns:
            FISAPIResponse with alert details
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/alerts/{alert_id}"
        )

    async def acknowledge_alert(
        self,
        alert_id: str,
        notes: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Acknowledge a security alert.

        Args:
            alert_id: Alert ID
            notes: Optional acknowledgment notes

        Returns:
            FISAPIResponse with update status
        """
        logger.info(f"Acknowledging alert {alert_id}")

        payload = {"acknowledged": True}
        if notes:
            payload["notes"] = notes

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/alerts/{alert_id}/acknowledge",
            data=payload
        )

    async def resolve_alert(
        self,
        alert_id: str,
        resolution: str,
        is_false_positive: bool = False
    ) -> FISAPIResponse:
        """
        Resolve a security alert.

        Args:
            alert_id: Alert ID
            resolution: Resolution description
            is_false_positive: Whether this was a false positive

        Returns:
            FISAPIResponse with resolution status
        """
        logger.info(f"Resolving alert {alert_id}")

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/alerts/{alert_id}/resolve",
            data={
                "resolution": resolution,
                "is_false_positive": is_false_positive
            }
        )

    async def get_unread_alerts_count(
        self,
        card_id: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Get count of unread alerts.

        Args:
            card_id: Optional card ID filter

        Returns:
            FISAPIResponse with count
        """
        params = {}
        if card_id:
            params["card_id"] = card_id

        return await self.fis._make_request(
            method="GET",
            endpoint="/alerts/unread/count",
            params=params
        )

    # =========================================================================
    # ALERT PREFERENCES
    # =========================================================================

    async def get_alert_preferences(self, card_id: str) -> FISAPIResponse:
        """
        Get alert preferences for a card.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with preferences
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/alerts/preferences"
        )

    async def set_alert_preferences(
        self,
        card_id: str,
        preferences: AlertPreferences
    ) -> FISAPIResponse:
        """
        Set alert preferences for a card.

        Args:
            card_id: FIS card ID
            preferences: Alert preferences

        Returns:
            FISAPIResponse with updated preferences
        """
        logger.info(f"Setting alert preferences for card {card_id}")

        payload = {
            "alert_on_all_transactions": preferences.alert_on_all_transactions,
            "alert_on_large_transactions": preferences.alert_on_large_transactions,
            "large_transaction_threshold": float(preferences.large_transaction_threshold),
            "alert_on_international": preferences.alert_on_international,
            "alert_on_card_not_present": preferences.alert_on_card_not_present,
            "alert_on_declined": preferences.alert_on_declined,
            "alert_on_suspicious_activity": preferences.alert_on_suspicious_activity,
            "alert_on_pin_failures": preferences.alert_on_pin_failures,
            "alert_on_card_lock": preferences.alert_on_card_lock,
            "notification_channels": [ch.value for ch in preferences.notification_channels]
        }

        if preferences.quiet_hours_enabled:
            payload["quiet_hours"] = {
                "enabled": True,
                "start": preferences.quiet_hours_start,
                "end": preferences.quiet_hours_end
            }

        return await self.fis._make_request(
            method="PUT",
            endpoint=f"/cards/{card_id}/alerts/preferences",
            data=payload
        )

    # =========================================================================
    # TRAVEL NOTICES
    # =========================================================================

    async def set_travel_notice(
        self,
        card_id: str,
        start_date: date,
        end_date: date,
        destinations: List[str],
        notes: Optional[str] = None
    ) -> FISAPIResponse:
        """
        Set a travel notice to prevent false fraud alerts.

        Args:
            card_id: FIS card ID
            start_date: Travel start date
            end_date: Travel end date
            destinations: List of country codes
            notes: Optional notes

        Returns:
            FISAPIResponse with travel notice details
        """
        logger.info(f"Setting travel notice for card {card_id}: {destinations}")

        payload = {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "destinations": destinations
        }
        if notes:
            payload["notes"] = notes

        return await self.fis._make_request(
            method="POST",
            endpoint=f"/cards/{card_id}/travel-notices",
            data=payload
        )

    async def get_travel_notices(self, card_id: str) -> FISAPIResponse:
        """
        Get active travel notices for a card.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with travel notices
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/travel-notices"
        )

    async def cancel_travel_notice(
        self,
        card_id: str,
        notice_id: str
    ) -> FISAPIResponse:
        """
        Cancel a travel notice.

        Args:
            card_id: FIS card ID
            notice_id: Travel notice ID

        Returns:
            FISAPIResponse with cancellation status
        """
        logger.info(f"Cancelling travel notice {notice_id} for card {card_id}")

        return await self.fis._make_request(
            method="DELETE",
            endpoint=f"/cards/{card_id}/travel-notices/{notice_id}"
        )

    # =========================================================================
    # REAL-TIME FRAUD SCREENING
    # =========================================================================

    async def screen_transaction(
        self,
        card_id: str,
        amount: Decimal,
        merchant_id: str,
        merchant_name: str,
        mcc_code: str,
        location: Dict[str, str],
        channel: str
    ) -> FISAPIResponse:
        """
        Screen a transaction for fraud in real-time.

        This is typically called during authorization.

        Args:
            card_id: FIS card ID
            amount: Transaction amount
            merchant_id: Merchant ID
            merchant_name: Merchant name
            mcc_code: Merchant category code
            location: Transaction location
            channel: Transaction channel

        Returns:
            FISAPIResponse with screening result
        """
        logger.info(f"Screening transaction for card {card_id}: ${amount}")

        payload = {
            "card_id": card_id,
            "amount": float(amount),
            "merchant": {
                "id": merchant_id,
                "name": merchant_name,
                "mcc_code": mcc_code
            },
            "location": location,
            "channel": channel
        }

        return await self.fis._make_request(
            method="POST",
            endpoint="/fraud/screen",
            data=payload
        )

    async def get_risk_score(self, card_id: str) -> FISAPIResponse:
        """
        Get current risk score for a card.

        Args:
            card_id: FIS card ID

        Returns:
            FISAPIResponse with risk score and factors
        """
        return await self.fis._make_request(
            method="GET",
            endpoint=f"/cards/{card_id}/risk-score"
        )


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_fraud_service: Optional[FISFraudService] = None


def get_fis_fraud_service() -> FISFraudService:
    """Get or create singleton FIS Fraud service instance"""
    global _fraud_service
    if _fraud_service is None:
        _fraud_service = FISFraudService()
    return _fraud_service


# Export singleton
fis_fraud_service = get_fis_fraud_service()
