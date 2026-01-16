"""
Marketing AI Behavioral Learning Service - Enhanced Customer Intelligence

This service extends the Marketing AI with advanced behavioral learning capabilities
to provide smarter, more personalized promotions based on:

- Location-based behavior patterns
- Purchase behavior and frequency analysis
- Average transaction amount tracking
- Business Type/SIC Code classification
- Business Category preferences
- Marketing conversion tracking and optimization
- App engagement metrics
- Session behavior analysis

The system learns from user interactions and continuously improves targeting accuracy.
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional, Tuple
from enum import Enum
import os
import json
from collections import defaultdict
from dataclasses import dataclass
import math

logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "swipesavvy_agents"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "password"),
}


# ============================================================================
# ENHANCED BEHAVIOR PATTERNS
# ============================================================================

class EnhancedBehaviorPattern(Enum):
    """Extended behavior patterns with granular classification"""
    # Spending Patterns
    HIGH_SPENDER = "high_spender"
    MEDIUM_SPENDER = "medium_spender"
    LOW_SPENDER = "low_spender"
    IMPULSE_BUYER = "impulse_buyer"
    PLANNED_SHOPPER = "planned_shopper"

    # Frequency Patterns
    DAILY_SHOPPER = "daily_shopper"
    WEEKLY_SHOPPER = "weekly_shopper"
    MONTHLY_SHOPPER = "monthly_shopper"
    SPORADIC_SHOPPER = "sporadic_shopper"

    # Time Patterns
    MORNING_SHOPPER = "morning_shopper"
    AFTERNOON_SHOPPER = "afternoon_shopper"
    EVENING_SHOPPER = "evening_shopper"
    WEEKEND_SHOPPER = "weekend_shopper"
    WEEKDAY_SHOPPER = "weekday_shopper"

    # Location Patterns
    LOCAL_SHOPPER = "local_shopper"
    COMMUTER_SHOPPER = "commuter_shopper"
    TRAVELER = "traveler"
    NEIGHBORHOOD_LOYAL = "neighborhood_loyal"

    # Business Type Affinity
    RESTAURANT_ENTHUSIAST = "restaurant_enthusiast"
    RETAIL_SHOPPER = "retail_shopper"
    GROCERY_REGULAR = "grocery_regular"
    GAS_STATION_FREQUENT = "gas_station_frequent"
    ENTERTAINMENT_SEEKER = "entertainment_seeker"
    HEALTHCARE_FOCUSED = "healthcare_focused"

    # Engagement Patterns
    HIGHLY_ENGAGED = "highly_engaged"
    MODERATELY_ENGAGED = "moderately_engaged"
    LOW_ENGAGEMENT = "low_engagement"
    APP_POWER_USER = "app_power_user"
    NOTIFICATION_RESPONSIVE = "notification_responsive"

    # Conversion Patterns
    HIGH_CONVERTER = "high_converter"
    PROMOTION_HUNTER = "promotion_hunter"
    ORGANIC_BUYER = "organic_buyer"
    COUPON_CLIPPER = "coupon_clipper"

    # Lifecycle Patterns
    NEW_USER = "new_user"
    ESTABLISHED_USER = "established_user"
    LOYAL_USER = "loyal_user"
    CHURNING_USER = "churning_user"
    REACTIVATED_USER = "reactivated_user"


class SICCategory(Enum):
    """Standard Industrial Classification categories"""
    RESTAURANTS = "5812"
    FAST_FOOD = "5814"
    GROCERY_STORES = "5411"
    GAS_STATIONS = "5541"
    DEPARTMENT_STORES = "5311"
    CLOTHING_STORES = "5651"
    PHARMACIES = "5912"
    CONVENIENCE_STORES = "5499"
    ELECTRONICS = "5732"
    ENTERTAINMENT = "7999"
    HEALTHCARE = "8099"
    AUTOMOTIVE = "7538"
    TRAVEL = "4724"
    HOTELS = "7011"
    ONLINE_RETAIL = "5999"


# ============================================================================
# ENHANCED DATA MODELS
# ============================================================================

@dataclass
class LocationBehavior:
    """Detailed location-based behavior analysis"""
    primary_city: str
    primary_zip: str
    location_diversity_score: float  # 0-1, how varied shopping locations are
    home_radius_km: float  # Average distance from primary location
    frequent_locations: List[Dict[str, Any]]  # List of top locations with metrics
    commute_pattern: Optional[str]  # Detected commute pattern
    travel_frequency: int  # Number of transactions outside home area
    geo_clusters: List[Dict[str, Any]]  # Clustered shopping zones


@dataclass
class PurchaseBehavior:
    """Detailed purchase behavior analysis"""
    total_transactions: int
    total_spent: float
    avg_transaction: float
    median_transaction: float
    max_transaction: float
    min_transaction: float
    std_deviation: float
    transaction_frequency_days: float  # Average days between transactions
    last_7_days_count: int
    last_30_days_count: int
    last_90_days_count: int
    spending_velocity: float  # Rate of spending change
    preferred_payment_time: str  # Morning/Afternoon/Evening
    preferred_payment_day: str  # Weekday/Weekend


@dataclass
class BusinessPreference:
    """Business type and category preferences"""
    sic_code: str
    sic_description: str
    category: str
    transaction_count: int
    total_spent: float
    avg_transaction: float
    affinity_score: float  # 0-100, strength of preference
    last_visit: datetime
    visit_frequency_days: float


@dataclass
class AppEngagement:
    """App engagement and session metrics"""
    total_sessions: int
    avg_session_duration_seconds: float
    total_time_in_app_minutes: float
    last_session_date: datetime
    sessions_last_7_days: int
    sessions_last_30_days: int
    most_used_features: List[str]
    notification_open_rate: float
    push_enabled: bool
    app_version: str
    device_type: str
    engagement_score: float  # 0-100


@dataclass
class ConversionHistory:
    """Marketing conversion tracking"""
    campaigns_received: int
    campaigns_opened: int
    campaigns_clicked: int
    campaigns_converted: int
    total_conversion_value: float
    avg_conversion_value: float
    best_performing_campaign_type: str
    best_performing_offer_type: str
    conversion_rate: float
    time_to_convert_hours: float
    last_conversion_date: Optional[datetime]
    responsive_channels: List[str]


@dataclass
class EnhancedUserBehavior:
    """Comprehensive user behavior profile with all metrics"""
    user_id: str
    created_at: datetime
    updated_at: datetime

    # Core metrics
    total_spent: float
    transaction_count: int
    avg_transaction: float
    days_as_customer: int
    days_since_last_activity: int

    # Detailed behavior profiles
    location_behavior: LocationBehavior
    purchase_behavior: PurchaseBehavior
    business_preferences: List[BusinessPreference]
    app_engagement: AppEngagement
    conversion_history: ConversionHistory

    # Detected patterns
    behavior_patterns: List[EnhancedBehaviorPattern]
    pattern_confidence_scores: Dict[str, float]

    # Predictive metrics
    predicted_monthly_spend: float
    churn_risk_score: float  # 0-100
    lifetime_value_estimate: float
    next_purchase_probability: float
    recommended_offer_types: List[str]


@dataclass
class BehavioralLearningModel:
    """Machine learning model state for behavioral predictions"""
    model_id: str
    model_type: str  # pattern_detection, churn_prediction, spend_prediction
    feature_weights: Dict[str, float]
    training_data_size: int
    accuracy_score: float
    last_trained: datetime
    version: str


# ============================================================================
# BEHAVIORAL LEARNING ENGINE
# ============================================================================

class BehavioralLearningEngine:
    """
    Advanced behavioral learning engine that tracks, analyzes, and learns
    from customer behaviors to provide smarter marketing recommendations.
    """

    def __init__(self, conn):
        self.conn = conn
        self.cursor = conn.cursor(cursor_factory=RealDictCursor)
        self._pattern_weights = self._load_pattern_weights()

    def _load_pattern_weights(self) -> Dict[str, float]:
        """Load learned pattern weights from database or use defaults"""
        default_weights = {
            "spending_weight": 0.25,
            "frequency_weight": 0.20,
            "location_weight": 0.15,
            "engagement_weight": 0.20,
            "conversion_weight": 0.20
        }

        try:
            self.cursor.execute("""
                SELECT feature_name, weight FROM behavioral_feature_weights
                WHERE is_active = true
            """)
            rows = self.cursor.fetchall()
            if rows:
                return {row['feature_name']: row['weight'] for row in rows}
        except Exception:
            pass

        return default_weights

    def analyze_enhanced_behavior(self, user_id: str, lookback_days: int = 90) -> EnhancedUserBehavior:
        """
        Perform comprehensive behavioral analysis for a user
        """
        try:
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=lookback_days)

            # Gather all behavior data in parallel queries
            transactions = self._get_transactions(user_id, cutoff_date)
            app_sessions = self._get_app_sessions(user_id, cutoff_date)
            campaign_interactions = self._get_campaign_interactions(user_id, cutoff_date)

            if not transactions:
                return self._create_empty_enhanced_behavior(user_id)

            # Build behavior profiles
            location_behavior = self._analyze_location_behavior(transactions)
            purchase_behavior = self._analyze_purchase_behavior(transactions)
            business_preferences = self._analyze_business_preferences(transactions)
            app_engagement = self._analyze_app_engagement(app_sessions, user_id)
            conversion_history = self._analyze_conversion_history(campaign_interactions)

            # Detect patterns
            patterns, confidence_scores = self._detect_enhanced_patterns(
                transactions, location_behavior, purchase_behavior,
                business_preferences, app_engagement, conversion_history
            )

            # Calculate predictive metrics
            predicted_spend = self._predict_monthly_spend(purchase_behavior, patterns)
            churn_risk = self._calculate_churn_risk(purchase_behavior, app_engagement)
            ltv = self._estimate_lifetime_value(purchase_behavior, conversion_history)
            next_purchase_prob = self._predict_next_purchase(purchase_behavior)
            recommended_offers = self._recommend_offer_types(patterns, conversion_history, business_preferences)

            # Get customer age
            self.cursor.execute("""
                SELECT created_at FROM users WHERE user_id = %s
            """, (user_id,))
            user_row = self.cursor.fetchone()
            created_at = user_row['created_at'] if user_row else datetime.now(timezone.utc)
            days_as_customer = (datetime.now(timezone.utc) - created_at).days

            return EnhancedUserBehavior(
                user_id=user_id,
                created_at=created_at,
                updated_at=datetime.now(timezone.utc),
                total_spent=purchase_behavior.total_spent,
                transaction_count=purchase_behavior.total_transactions,
                avg_transaction=purchase_behavior.avg_transaction,
                days_as_customer=days_as_customer,
                days_since_last_activity=self._get_days_since_last_activity(transactions),
                location_behavior=location_behavior,
                purchase_behavior=purchase_behavior,
                business_preferences=business_preferences,
                app_engagement=app_engagement,
                conversion_history=conversion_history,
                behavior_patterns=patterns,
                pattern_confidence_scores=confidence_scores,
                predicted_monthly_spend=predicted_spend,
                churn_risk_score=churn_risk,
                lifetime_value_estimate=ltv,
                next_purchase_probability=next_purchase_prob,
                recommended_offer_types=recommended_offers
            )

        except Exception as e:
            logger.error(f"Error in enhanced behavior analysis: {str(e)}")
            return self._create_empty_enhanced_behavior(user_id)

    def _get_transactions(self, user_id: str, cutoff_date: datetime) -> List[Dict]:
        """Get transaction data with business details"""
        try:
            self.cursor.execute("""
                SELECT
                    t.transaction_id,
                    t.amount,
                    t.category,
                    t.merchant_name,
                    t.merchant_location,
                    t.merchant_city,
                    t.merchant_zip,
                    t.merchant_sic_code,
                    t.transaction_date,
                    t.transaction_time,
                    EXTRACT(DOW FROM t.transaction_date) as day_of_week,
                    EXTRACT(HOUR FROM t.transaction_time) as hour_of_day
                FROM transactions t
                WHERE t.user_id = %s
                AND t.transaction_date >= %s
                ORDER BY t.transaction_date DESC
            """, (user_id, cutoff_date))
            return self.cursor.fetchall()
        except Exception as e:
            logger.error(f"Error fetching transactions: {str(e)}")
            return []

    def _get_app_sessions(self, user_id: str, cutoff_date: datetime) -> List[Dict]:
        """Get app session data"""
        try:
            self.cursor.execute("""
                SELECT
                    session_id,
                    start_time,
                    end_time,
                    duration_seconds,
                    device_type,
                    app_version,
                    features_used,
                    screens_viewed
                FROM app_sessions
                WHERE user_id = %s
                AND start_time >= %s
                ORDER BY start_time DESC
            """, (user_id, cutoff_date))
            return self.cursor.fetchall()
        except Exception:
            return []

    def _get_campaign_interactions(self, user_id: str, cutoff_date: datetime) -> List[Dict]:
        """Get marketing campaign interaction data"""
        try:
            self.cursor.execute("""
                SELECT
                    ci.interaction_id,
                    ci.campaign_id,
                    ci.interaction_type,
                    ci.interaction_time,
                    ci.channel,
                    ci.converted,
                    ci.conversion_value,
                    ci.time_to_convert_hours,
                    c.campaign_type,
                    c.offer_type
                FROM campaign_interactions ci
                JOIN ai_campaigns c ON ci.campaign_id = c.campaign_id
                WHERE ci.user_id = %s
                AND ci.interaction_time >= %s
                ORDER BY ci.interaction_time DESC
            """, (user_id, cutoff_date))
            return self.cursor.fetchall()
        except Exception:
            return []

    def _analyze_location_behavior(self, transactions: List[Dict]) -> LocationBehavior:
        """Analyze location-based behavior patterns"""
        if not transactions:
            return self._empty_location_behavior()

        # Calculate location metrics
        city_counts: dict[str, int] = defaultdict(int)
        zip_counts: dict[str, int] = defaultdict(int)
        location_details: dict[str, dict[str, float]] = defaultdict(lambda: {"count": 0.0, "total_spent": 0.0})

        for t in transactions:
            city = str(t.get('merchant_city', 'Unknown'))
            zip_code = str(t.get('merchant_zip', 'Unknown'))
            location = str(t.get('merchant_location', 'Unknown'))

            city_counts[city] += 1
            zip_counts[zip_code] += 1
            location_details[location]["count"] += 1
            location_details[location]["total_spent"] += float(t['amount'])

        # Find primary locations
        primary_city = max(city_counts.items(), key=lambda x: x[1])[0] if city_counts else "Unknown"
        primary_zip = max(zip_counts.items(), key=lambda x: x[1])[0] if zip_counts else "Unknown"

        # Calculate diversity score (1 = all same location, 0 = all different)
        unique_locations = len(location_details)
        total_transactions = len(transactions)
        diversity_score = 1 - (unique_locations / total_transactions) if total_transactions > 0 else 0

        # Build frequent locations list
        frequent_locations = [
            {
                "location": loc,
                "count": data["count"],
                "total_spent": data["total_spent"],
                "avg_spent": data["total_spent"] / data["count"] if data["count"] > 0 else 0,
                "percentage": (data["count"] / total_transactions * 100) if total_transactions > 0 else 0
            }
            for loc, data in sorted(location_details.items(), key=lambda x: x[1]["count"], reverse=True)[:10]
        ]

        # Detect travel (transactions outside primary city)
        travel_count = sum(1 for t in transactions if t.get('merchant_city') != primary_city)

        return LocationBehavior(
            primary_city=primary_city,
            primary_zip=primary_zip,
            location_diversity_score=diversity_score,
            home_radius_km=0,  # Would need geocoding for accurate calculation
            frequent_locations=frequent_locations,
            commute_pattern=self._detect_commute_pattern(transactions),
            travel_frequency=travel_count,
            geo_clusters=self._cluster_locations(frequent_locations)
        )

    def _analyze_purchase_behavior(self, transactions: List[Dict]) -> PurchaseBehavior:
        """Analyze detailed purchase behavior"""
        if not transactions:
            return self._empty_purchase_behavior()

        amounts = [float(t['amount']) for t in transactions]
        total_spent = sum(amounts)
        total_transactions = len(amounts)
        avg_transaction = total_spent / total_transactions if total_transactions > 0 else 0

        # Statistical measures
        sorted_amounts = sorted(amounts)
        median = sorted_amounts[len(sorted_amounts) // 2] if sorted_amounts else 0
        max_amount = max(amounts) if amounts else 0
        min_amount = min(amounts) if amounts else 0

        # Standard deviation
        mean = avg_transaction
        variance = sum((x - mean) ** 2 for x in amounts) / len(amounts) if amounts else 0
        std_dev = math.sqrt(variance)

        # Frequency analysis
        dates = [t['transaction_date'] for t in transactions if t.get('transaction_date')]
        if len(dates) >= 2:
            date_diffs = [(dates[i] - dates[i+1]).days for i in range(len(dates)-1)]
            avg_days_between = sum(date_diffs) / len(date_diffs) if date_diffs else 0
        else:
            avg_days_between = 0

        # Time period counts
        now = datetime.now(timezone.utc)
        last_7 = sum(1 for t in transactions if (now - t['transaction_date']).days <= 7)
        last_30 = sum(1 for t in transactions if (now - t['transaction_date']).days <= 30)
        last_90 = sum(1 for t in transactions if (now - t['transaction_date']).days <= 90)

        # Spending velocity (recent vs older spending)
        mid_point = len(transactions) // 2
        recent_spending = sum(float(t['amount']) for t in transactions[:mid_point])
        older_spending = sum(float(t['amount']) for t in transactions[mid_point:])
        velocity = ((recent_spending - older_spending) / older_spending * 100) if older_spending > 0 else 0

        # Preferred time analysis
        hours = [t.get('hour_of_day', 12) for t in transactions if t.get('hour_of_day') is not None]
        avg_hour = sum(hours) / len(hours) if hours else 12
        preferred_time = "Morning" if avg_hour < 12 else ("Afternoon" if avg_hour < 17 else "Evening")

        # Preferred day analysis
        days = [t.get('day_of_week', 0) for t in transactions if t.get('day_of_week') is not None]
        weekend_count = sum(1 for d in days if d in [0, 6])  # 0 is Sunday, 6 is Saturday
        preferred_day = "Weekend" if weekend_count > len(days) / 2 else "Weekday"

        return PurchaseBehavior(
            total_transactions=total_transactions,
            total_spent=total_spent,
            avg_transaction=avg_transaction,
            median_transaction=median,
            max_transaction=max_amount,
            min_transaction=min_amount,
            std_deviation=std_dev,
            transaction_frequency_days=avg_days_between,
            last_7_days_count=last_7,
            last_30_days_count=last_30,
            last_90_days_count=last_90,
            spending_velocity=velocity,
            preferred_payment_time=preferred_time,
            preferred_payment_day=preferred_day
        )

    def _analyze_business_preferences(self, transactions: List[Dict]) -> List[BusinessPreference]:
        """Analyze business type and category preferences"""
        if not transactions:
            return []

        # Use typed dict structure for SIC data
        sic_data: Dict[str, Dict[str, Any]] = {}

        for t in transactions:
            sic = str(t.get('merchant_sic_code', '0000'))
            if sic not in sic_data:
                sic_data[sic] = {
                    "count": 0,
                    "total_spent": 0.0,
                    "amounts": [],
                    "last_visit": None,
                    "category": "Unknown"
                }
            sic_data[sic]["count"] += 1
            sic_data[sic]["total_spent"] += float(t['amount'])
            sic_data[sic]["amounts"].append(float(t['amount']))
            sic_data[sic]["category"] = str(t.get('category', 'Unknown'))

            txn_date = t.get('transaction_date')
            if txn_date and (sic_data[sic]["last_visit"] is None or txn_date > sic_data[sic]["last_visit"]):
                sic_data[sic]["last_visit"] = txn_date

        # Calculate affinity scores and build preferences
        total_transactions = len(transactions)
        total_spent = sum(float(t['amount']) for t in transactions)

        preferences = []
        for sic, data in sic_data.items():
            count: int = data["count"]
            spent: float = data["total_spent"]
            frequency_score = (count / total_transactions * 50) if total_transactions > 0 else 0
            spend_score = (spent / total_spent * 50) if total_spent > 0 else 0
            affinity_score = frequency_score + spend_score

            avg_txn = spent / count if count > 0 else 0

            # Calculate visit frequency
            last_visit_date: Optional[datetime] = data["last_visit"]
            if last_visit_date:
                days_since = (datetime.now(timezone.utc) - last_visit_date).days
                visit_freq = count / (days_since + 1) if days_since >= 0 else 0
            else:
                visit_freq = 0

            preferences.append(BusinessPreference(
                sic_code=sic,
                sic_description=self._get_sic_description(sic),
                category=str(data["category"]),
                transaction_count=count,
                total_spent=spent,
                avg_transaction=avg_txn,
                affinity_score=min(100, affinity_score),
                last_visit=last_visit_date or datetime.now(timezone.utc),
                visit_frequency_days=1/visit_freq if visit_freq > 0 else 999
            ))

        # Sort by affinity score
        return sorted(preferences, key=lambda x: x.affinity_score, reverse=True)[:10]

    def _analyze_app_engagement(self, sessions: List[Dict], user_id: str) -> AppEngagement:
        """Analyze app engagement metrics"""
        if not sessions:
            return self._empty_app_engagement()

        total_sessions = len(sessions)
        durations = [s.get('duration_seconds', 0) for s in sessions]
        avg_duration = sum(durations) / len(durations) if durations else 0
        total_time = sum(durations) / 60  # Convert to minutes

        # Recent session counts
        now = datetime.now(timezone.utc)
        last_7 = sum(1 for s in sessions if (now - s['start_time']).days <= 7)
        last_30 = sum(1 for s in sessions if (now - s['start_time']).days <= 30)

        # Most used features
        feature_counts = defaultdict(int)
        for s in sessions:
            features = s.get('features_used', [])
            if isinstance(features, str):
                features = json.loads(features) if features else []
            for f in features:
                feature_counts[f] += 1

        most_used = [f for f, _ in sorted(feature_counts.items(), key=lambda x: x[1], reverse=True)[:5]]

        # Get notification metrics
        notification_open_rate = self._get_notification_open_rate(user_id)
        push_enabled = self._check_push_enabled(user_id)

        # Latest session info
        latest_session = sessions[0] if sessions else {}

        # Calculate engagement score
        engagement_score = self._calculate_engagement_score(
            total_sessions, avg_duration, last_7, last_30, notification_open_rate
        )

        return AppEngagement(
            total_sessions=total_sessions,
            avg_session_duration_seconds=avg_duration,
            total_time_in_app_minutes=total_time,
            last_session_date=latest_session.get('start_time', datetime.now(timezone.utc)),
            sessions_last_7_days=last_7,
            sessions_last_30_days=last_30,
            most_used_features=most_used,
            notification_open_rate=notification_open_rate,
            push_enabled=push_enabled,
            app_version=latest_session.get('app_version', 'unknown'),
            device_type=latest_session.get('device_type', 'unknown'),
            engagement_score=engagement_score
        )

    def _analyze_conversion_history(self, interactions: List[Dict]) -> ConversionHistory:
        """Analyze marketing conversion history"""
        if not interactions:
            return self._empty_conversion_history()

        received = len({i['campaign_id'] for i in interactions})
        opened = len([i for i in interactions if i['interaction_type'] == 'opened'])
        clicked = len([i for i in interactions if i['interaction_type'] == 'clicked'])
        converted = len([i for i in interactions if i.get('converted')])

        conversion_values = [i.get('conversion_value', 0) for i in interactions if i.get('converted')]
        total_value = sum(conversion_values)
        avg_value = total_value / len(conversion_values) if conversion_values else 0

        # Best performing campaign type
        campaign_conversions = defaultdict(int)
        offer_conversions = defaultdict(int)
        for i in interactions:
            if i.get('converted'):
                campaign_conversions[i.get('campaign_type', 'unknown')] += 1
                offer_conversions[i.get('offer_type', 'unknown')] += 1

        best_campaign = max(campaign_conversions.items(), key=lambda x: x[1])[0] if campaign_conversions else "none"
        best_offer = max(offer_conversions.items(), key=lambda x: x[1])[0] if offer_conversions else "none"

        # Conversion rate
        conversion_rate = (converted / received * 100) if received > 0 else 0

        # Average time to convert
        convert_times = [i.get('time_to_convert_hours', 0) for i in interactions if i.get('converted')]
        avg_time_to_convert = sum(convert_times) / len(convert_times) if convert_times else 0

        # Last conversion
        converted_interactions = [i for i in interactions if i.get('converted')]
        last_conversion = max(i['interaction_time'] for i in converted_interactions) if converted_interactions else None

        # Responsive channels
        channel_counts = defaultdict(int)
        for i in interactions:
            if i.get('converted'):
                channel_counts[i.get('channel', 'unknown')] += 1
        responsive_channels = [c for c, _ in sorted(channel_counts.items(), key=lambda x: x[1], reverse=True)]

        return ConversionHistory(
            campaigns_received=received,
            campaigns_opened=opened,
            campaigns_clicked=clicked,
            campaigns_converted=converted,
            total_conversion_value=total_value,
            avg_conversion_value=avg_value,
            best_performing_campaign_type=best_campaign,
            best_performing_offer_type=best_offer,
            conversion_rate=conversion_rate,
            time_to_convert_hours=avg_time_to_convert,
            last_conversion_date=last_conversion,
            responsive_channels=responsive_channels
        )

    def _detect_enhanced_patterns(
        self,
        _transactions: List[Dict],
        location: LocationBehavior,
        purchase: PurchaseBehavior,
        businesses: List[BusinessPreference],
        engagement: AppEngagement,
        conversions: ConversionHistory
    ) -> Tuple[List[EnhancedBehaviorPattern], Dict[str, float]]:
        """Detect enhanced behavioral patterns with confidence scores"""
        patterns = []
        confidence_scores = {}

        # Spending patterns
        if purchase.total_spent > 5000:
            patterns.append(EnhancedBehaviorPattern.HIGH_SPENDER)
            confidence_scores["high_spender"] = min(100, purchase.total_spent / 50)
        elif purchase.total_spent > 1000:
            patterns.append(EnhancedBehaviorPattern.MEDIUM_SPENDER)
            confidence_scores["medium_spender"] = 80
        else:
            patterns.append(EnhancedBehaviorPattern.LOW_SPENDER)
            confidence_scores["low_spender"] = 80

        # Impulse vs planned (based on transaction variance)
        if purchase.std_deviation > purchase.avg_transaction * 0.5:
            patterns.append(EnhancedBehaviorPattern.IMPULSE_BUYER)
            confidence_scores["impulse_buyer"] = 70
        else:
            patterns.append(EnhancedBehaviorPattern.PLANNED_SHOPPER)
            confidence_scores["planned_shopper"] = 70

        # Frequency patterns
        if purchase.transaction_frequency_days <= 1:
            patterns.append(EnhancedBehaviorPattern.DAILY_SHOPPER)
            confidence_scores["daily_shopper"] = 90
        elif purchase.transaction_frequency_days <= 7:
            patterns.append(EnhancedBehaviorPattern.WEEKLY_SHOPPER)
            confidence_scores["weekly_shopper"] = 85
        elif purchase.transaction_frequency_days <= 30:
            patterns.append(EnhancedBehaviorPattern.MONTHLY_SHOPPER)
            confidence_scores["monthly_shopper"] = 80
        else:
            patterns.append(EnhancedBehaviorPattern.SPORADIC_SHOPPER)
            confidence_scores["sporadic_shopper"] = 75

        # Time patterns
        if purchase.preferred_payment_time == "Morning":
            patterns.append(EnhancedBehaviorPattern.MORNING_SHOPPER)
            confidence_scores["morning_shopper"] = 75
        elif purchase.preferred_payment_time == "Afternoon":
            patterns.append(EnhancedBehaviorPattern.AFTERNOON_SHOPPER)
            confidence_scores["afternoon_shopper"] = 75
        else:
            patterns.append(EnhancedBehaviorPattern.EVENING_SHOPPER)
            confidence_scores["evening_shopper"] = 75

        if purchase.preferred_payment_day == "Weekend":
            patterns.append(EnhancedBehaviorPattern.WEEKEND_SHOPPER)
            confidence_scores["weekend_shopper"] = 80
        else:
            patterns.append(EnhancedBehaviorPattern.WEEKDAY_SHOPPER)
            confidence_scores["weekday_shopper"] = 80

        # Location patterns
        if location.location_diversity_score > 0.7:
            patterns.append(EnhancedBehaviorPattern.NEIGHBORHOOD_LOYAL)
            confidence_scores["neighborhood_loyal"] = location.location_diversity_score * 100
        elif location.travel_frequency > 5:
            patterns.append(EnhancedBehaviorPattern.TRAVELER)
            confidence_scores["traveler"] = min(100, location.travel_frequency * 10)
        else:
            patterns.append(EnhancedBehaviorPattern.LOCAL_SHOPPER)
            confidence_scores["local_shopper"] = 70

        # Business type affinity
        if businesses:
            top_biz = businesses[0]
            if top_biz.sic_code in ['5812', '5814']:
                patterns.append(EnhancedBehaviorPattern.RESTAURANT_ENTHUSIAST)
                confidence_scores["restaurant_enthusiast"] = top_biz.affinity_score
            elif top_biz.sic_code in ['5411']:
                patterns.append(EnhancedBehaviorPattern.GROCERY_REGULAR)
                confidence_scores["grocery_regular"] = top_biz.affinity_score
            elif top_biz.sic_code in ['5541']:
                patterns.append(EnhancedBehaviorPattern.GAS_STATION_FREQUENT)
                confidence_scores["gas_station_frequent"] = top_biz.affinity_score
            elif top_biz.sic_code in ['5311', '5651']:
                patterns.append(EnhancedBehaviorPattern.RETAIL_SHOPPER)
                confidence_scores["retail_shopper"] = top_biz.affinity_score

        # Engagement patterns
        if engagement.engagement_score >= 80:
            patterns.append(EnhancedBehaviorPattern.HIGHLY_ENGAGED)
            patterns.append(EnhancedBehaviorPattern.APP_POWER_USER)
            confidence_scores["highly_engaged"] = engagement.engagement_score
            confidence_scores["app_power_user"] = engagement.engagement_score
        elif engagement.engagement_score >= 50:
            patterns.append(EnhancedBehaviorPattern.MODERATELY_ENGAGED)
            confidence_scores["moderately_engaged"] = engagement.engagement_score
        else:
            patterns.append(EnhancedBehaviorPattern.LOW_ENGAGEMENT)
            confidence_scores["low_engagement"] = 100 - engagement.engagement_score

        if engagement.notification_open_rate > 0.5:
            patterns.append(EnhancedBehaviorPattern.NOTIFICATION_RESPONSIVE)
            confidence_scores["notification_responsive"] = engagement.notification_open_rate * 100

        # Conversion patterns
        if conversions.conversion_rate > 20:
            patterns.append(EnhancedBehaviorPattern.HIGH_CONVERTER)
            confidence_scores["high_converter"] = conversions.conversion_rate

        if conversions.campaigns_clicked > conversions.campaigns_converted * 2:
            patterns.append(EnhancedBehaviorPattern.PROMOTION_HUNTER)
            confidence_scores["promotion_hunter"] = 70

        if conversions.campaigns_received == 0 and purchase.total_transactions > 10:
            patterns.append(EnhancedBehaviorPattern.ORGANIC_BUYER)
            confidence_scores["organic_buyer"] = 80

        return patterns, confidence_scores

    def _predict_monthly_spend(self, purchase: PurchaseBehavior, patterns: List[EnhancedBehaviorPattern]) -> float:
        """Predict expected monthly spending based on behavior"""
        if purchase.total_transactions == 0:
            return 0

        # Base prediction on recent activity
        base_prediction = purchase.last_30_days_count * purchase.avg_transaction

        # Adjust based on spending velocity
        velocity_factor = 1 + (purchase.spending_velocity / 100)

        # Adjust based on patterns
        pattern_factor = 1.0
        if EnhancedBehaviorPattern.HIGH_SPENDER in patterns:
            pattern_factor *= 1.2
        if EnhancedBehaviorPattern.DAILY_SHOPPER in patterns:
            pattern_factor *= 1.3
        if EnhancedBehaviorPattern.CHURNING_USER in patterns:
            pattern_factor *= 0.5

        return base_prediction * velocity_factor * pattern_factor

    def _calculate_churn_risk(self, purchase: PurchaseBehavior, engagement: AppEngagement) -> float:
        """Calculate probability of customer churning"""
        risk_score = 0

        # Days since last activity
        days_inactive = (datetime.now(timezone.utc) - engagement.last_session_date).days if engagement.last_session_date else 999
        if days_inactive > 30:
            risk_score += 40
        elif days_inactive > 14:
            risk_score += 20
        elif days_inactive > 7:
            risk_score += 10

        # Negative spending velocity
        if purchase.spending_velocity < -20:
            risk_score += 30
        elif purchase.spending_velocity < 0:
            risk_score += 15

        # Low engagement
        if engagement.engagement_score < 30:
            risk_score += 20
        elif engagement.engagement_score < 50:
            risk_score += 10

        # Low recent activity
        if purchase.last_7_days_count == 0:
            risk_score += 10

        return min(100, risk_score)

    def _estimate_lifetime_value(self, purchase: PurchaseBehavior, conversions: ConversionHistory) -> float:
        """Estimate customer lifetime value"""
        # Simple LTV calculation: avg monthly spend * expected months * margin
        monthly_spend = purchase.last_30_days_count * purchase.avg_transaction
        expected_months = 24  # Base assumption
        margin = 0.15  # 15% margin assumption

        # Adjust based on conversion behavior
        if conversions.conversion_rate > 15:
            expected_months *= 1.5

        return monthly_spend * expected_months * margin

    def _predict_next_purchase(self, purchase: PurchaseBehavior) -> float:
        """Predict probability of purchase in next 7 days"""
        if purchase.transaction_frequency_days == 0:
            return 0.5

        # Higher frequency = higher probability
        if purchase.transaction_frequency_days <= 1:
            return 0.95
        elif purchase.transaction_frequency_days <= 3:
            return 0.85
        elif purchase.transaction_frequency_days <= 7:
            return 0.70
        elif purchase.transaction_frequency_days <= 14:
            return 0.50
        else:
            return 0.30

    def _recommend_offer_types(
        self,
        patterns: List[EnhancedBehaviorPattern],
        conversions: ConversionHistory,
        businesses: List[BusinessPreference]
    ) -> List[str]:
        """Recommend best offer types for user"""
        recommendations = []

        # Based on conversion history
        if conversions.best_performing_offer_type and conversions.best_performing_offer_type != "none":
            recommendations.append(conversions.best_performing_offer_type)

        # Based on patterns
        if EnhancedBehaviorPattern.HIGH_SPENDER in patterns:
            recommendations.append("vip_exclusive")
            recommendations.append("cashback")

        if EnhancedBehaviorPattern.PROMOTION_HUNTER in patterns:
            recommendations.append("discount")
            recommendations.append("bogo")

        if EnhancedBehaviorPattern.DAILY_SHOPPER in patterns:
            recommendations.append("loyalty_points")

        # Based on business preferences
        if businesses:
            top_category = businesses[0].category
            recommendations.append(f"category_{top_category.lower().replace(' ', '_')}")

        return list(dict.fromkeys(recommendations))[:5]  # Unique, top 5

    # Helper methods
    def _empty_location_behavior(self) -> LocationBehavior:
        return LocationBehavior(
            primary_city="Unknown",
            primary_zip="Unknown",
            location_diversity_score=0,
            home_radius_km=0,
            frequent_locations=[],
            commute_pattern=None,
            travel_frequency=0,
            geo_clusters=[]
        )

    def _empty_purchase_behavior(self) -> PurchaseBehavior:
        return PurchaseBehavior(
            total_transactions=0,
            total_spent=0,
            avg_transaction=0,
            median_transaction=0,
            max_transaction=0,
            min_transaction=0,
            std_deviation=0,
            transaction_frequency_days=0,
            last_7_days_count=0,
            last_30_days_count=0,
            last_90_days_count=0,
            spending_velocity=0,
            preferred_payment_time="Unknown",
            preferred_payment_day="Unknown"
        )

    def _empty_app_engagement(self) -> AppEngagement:
        return AppEngagement(
            total_sessions=0,
            avg_session_duration_seconds=0,
            total_time_in_app_minutes=0,
            last_session_date=datetime.now(timezone.utc),
            sessions_last_7_days=0,
            sessions_last_30_days=0,
            most_used_features=[],
            notification_open_rate=0,
            push_enabled=False,
            app_version="unknown",
            device_type="unknown",
            engagement_score=0
        )

    def _empty_conversion_history(self) -> ConversionHistory:
        return ConversionHistory(
            campaigns_received=0,
            campaigns_opened=0,
            campaigns_clicked=0,
            campaigns_converted=0,
            total_conversion_value=0,
            avg_conversion_value=0,
            best_performing_campaign_type="none",
            best_performing_offer_type="none",
            conversion_rate=0,
            time_to_convert_hours=0,
            last_conversion_date=None,
            responsive_channels=[]
        )

    def _create_empty_enhanced_behavior(self, user_id: str) -> EnhancedUserBehavior:
        return EnhancedUserBehavior(
            user_id=user_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            total_spent=0,
            transaction_count=0,
            avg_transaction=0,
            days_as_customer=0,
            days_since_last_activity=999,
            location_behavior=self._empty_location_behavior(),
            purchase_behavior=self._empty_purchase_behavior(),
            business_preferences=[],
            app_engagement=self._empty_app_engagement(),
            conversion_history=self._empty_conversion_history(),
            behavior_patterns=[],
            pattern_confidence_scores={},
            predicted_monthly_spend=0,
            churn_risk_score=100,
            lifetime_value_estimate=0,
            next_purchase_probability=0,
            recommended_offer_types=[]
        )

    def _get_days_since_last_activity(self, transactions: List[Dict]) -> int:
        if not transactions:
            return 999
        latest = transactions[0].get('transaction_date')
        if latest:
            return (datetime.now(timezone.utc) - latest).days
        return 999

    def _detect_commute_pattern(self, transactions: List[Dict]) -> Optional[str]:
        """Detect if user has a commute shopping pattern"""
        # Group by hour and location
        morning_locs = set()
        evening_locs = set()

        for t in transactions:
            hour = t.get('hour_of_day', 12)
            loc = t.get('merchant_location', '')

            if 6 <= hour <= 9:
                morning_locs.add(loc)
            elif 17 <= hour <= 20:
                evening_locs.add(loc)

        if morning_locs and evening_locs and morning_locs != evening_locs:
            return "commute_detected"
        return None

    def _cluster_locations(self, locations: List[Dict]) -> List[Dict]:
        """Simple location clustering"""
        if len(locations) <= 2:
            return [{"cluster_id": 1, "locations": locations, "type": "primary"}]

        clusters = []
        primary_cluster = locations[:3]
        clusters.append({"cluster_id": 1, "locations": primary_cluster, "type": "primary"})

        if len(locations) > 3:
            secondary_cluster = locations[3:]
            clusters.append({"cluster_id": 2, "locations": secondary_cluster, "type": "secondary"})

        return clusters

    def _get_sic_description(self, sic_code: str) -> str:
        """Get description for SIC code"""
        sic_descriptions = {
            "5812": "Eating Places (Restaurants)",
            "5814": "Fast Food Restaurants",
            "5411": "Grocery Stores",
            "5541": "Gas Stations",
            "5311": "Department Stores",
            "5651": "Clothing Stores",
            "5912": "Drug Stores/Pharmacies",
            "5499": "Convenience Stores",
            "5732": "Electronics Stores",
            "7999": "Entertainment/Recreation",
            "8099": "Healthcare Services",
            "7538": "Automotive Services",
            "4724": "Travel Agencies",
            "7011": "Hotels/Lodging",
            "5999": "Online Retail"
        }
        return sic_descriptions.get(sic_code, f"Business Type {sic_code}")

    def _get_notification_open_rate(self, user_id: str) -> float:
        """Get user's notification open rate"""
        try:
            self.cursor.execute("""
                SELECT
                    COUNT(*) as total,
                    COUNT(CASE WHEN opened = true THEN 1 END) as opened
                FROM push_notifications
                WHERE user_id = %s
                AND sent_at >= NOW() - INTERVAL '90 days'
            """, (user_id,))
            row = self.cursor.fetchone()
            if row and row['total'] > 0:
                return row['opened'] / row['total']
        except Exception:
            pass
        return 0.5  # Default assumption

    def _check_push_enabled(self, user_id: str) -> bool:
        """Check if user has push notifications enabled"""
        try:
            self.cursor.execute("""
                SELECT push_enabled FROM user_preferences WHERE user_id = %s
            """, (user_id,))
            row = self.cursor.fetchone()
            return row['push_enabled'] if row else True
        except Exception:
            return True

    def _calculate_engagement_score(
        self,
        total_sessions: int,
        avg_duration: float,
        last_7_sessions: int,
        _last_30_sessions: int,
        notification_rate: float
    ) -> float:
        """Calculate overall engagement score 0-100"""
        score = 0

        # Session frequency (max 30 points)
        if last_7_sessions >= 7:
            score += 30
        elif last_7_sessions >= 3:
            score += 20
        elif last_7_sessions >= 1:
            score += 10

        # Session duration (max 25 points)
        if avg_duration >= 300:  # 5+ minutes
            score += 25
        elif avg_duration >= 120:  # 2+ minutes
            score += 15
        elif avg_duration >= 30:  # 30+ seconds
            score += 5

        # Historical sessions (max 25 points)
        if total_sessions >= 50:
            score += 25
        elif total_sessions >= 20:
            score += 15
        elif total_sessions >= 5:
            score += 10

        # Notification responsiveness (max 20 points)
        score += notification_rate * 20

        return min(100, score)


# ============================================================================
# ADAPTIVE PROMOTION ENGINE
# ============================================================================

class AdaptivePromotionEngine:
    """
    Creates and optimizes promotions based on learned behaviors.
    Continuously improves targeting based on conversion feedback.
    """

    def __init__(self, conn):
        self.conn = conn
        self.cursor = conn.cursor(cursor_factory=RealDictCursor)
        self.learning_engine = BehavioralLearningEngine(conn)

    def generate_personalized_promotions(self, user_id: str) -> List[Dict[str, Any]]:
        """Generate personalized promotions for a specific user"""
        behavior = self.learning_engine.analyze_enhanced_behavior(user_id)
        promotions = []

        # Generate promotions based on patterns and preferences
        for pattern in behavior.behavior_patterns:
            promotion = self._create_promotion_for_pattern(pattern, behavior)
            if promotion:
                promotions.append(promotion)

        # Add business-specific promotions
        for biz_pref in behavior.business_preferences[:3]:
            promotion = self._create_business_promotion(biz_pref, behavior)
            if promotion:
                promotions.append(promotion)

        # Score and rank promotions
        scored_promotions = self._score_promotions(promotions, behavior)

        return sorted(scored_promotions, key=lambda x: x.get('score', 0), reverse=True)[:5]

    def _create_promotion_for_pattern(
        self,
        pattern: EnhancedBehaviorPattern,
        behavior: EnhancedUserBehavior
    ) -> Optional[Dict[str, Any]]:
        """Create a promotion based on detected pattern"""
        promotion_templates = {
            EnhancedBehaviorPattern.HIGH_SPENDER: {
                "type": "vip",
                "name": "VIP Exclusive - Premium Rewards",
                "description": "As one of our top customers, enjoy exclusive premium benefits",
                "offer_type": "cashback",
                "offer_value": 5,
                "offer_unit": "percentage"
            },
            EnhancedBehaviorPattern.DAILY_SHOPPER: {
                "type": "loyalty",
                "name": "Daily Rewards Bonus",
                "description": "Extra rewards for your daily purchases",
                "offer_type": "points_multiplier",
                "offer_value": 2,
                "offer_unit": "multiplier"
            },
            EnhancedBehaviorPattern.CHURNING_USER: {
                "type": "reengagement",
                "name": "We Miss You!",
                "description": "Come back and enjoy a special welcome discount",
                "offer_type": "discount",
                "offer_value": 25,
                "offer_unit": "percentage"
            },
            EnhancedBehaviorPattern.PROMOTION_HUNTER: {
                "type": "flash_sale",
                "name": "Flash Deal Alert",
                "description": "Limited time offer just for you",
                "offer_type": "discount",
                "offer_value": 20,
                "offer_unit": "percentage"
            },
            EnhancedBehaviorPattern.NOTIFICATION_RESPONSIVE: {
                "type": "instant",
                "name": "Instant Reward",
                "description": "Claim your instant reward now",
                "offer_type": "fixed_reward",
                "offer_value": 5,
                "offer_unit": "dollars"
            },
            EnhancedBehaviorPattern.NEIGHBORHOOD_LOYAL: {
                "type": "local",
                "name": f"Shop Local in {behavior.location_behavior.primary_city}",
                "description": f"Extra rewards at your favorite {behavior.location_behavior.primary_city} spots",
                "offer_type": "location_bonus",
                "offer_value": 10,
                "offer_unit": "percentage"
            }
        }

        template = promotion_templates.get(pattern)
        if not template:
            return None

        return {
            **template,
            "target_pattern": pattern.value,
            "confidence_score": behavior.pattern_confidence_scores.get(pattern.value, 50),
            "valid_days": 14,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

    def _create_business_promotion(
        self,
        biz_pref: BusinessPreference,
        _behavior: EnhancedUserBehavior
    ) -> Optional[Dict[str, Any]]:
        """Create promotion based on business type preference"""
        if biz_pref.affinity_score < 30:
            return None

        return {
            "type": "category",
            "name": f"Bonus at {biz_pref.sic_description}",
            "description": f"Earn extra rewards at your favorite {biz_pref.category} spots",
            "offer_type": "category_bonus",
            "offer_value": min(15, int(biz_pref.affinity_score / 10) + 5),
            "offer_unit": "percentage",
            "target_sic": biz_pref.sic_code,
            "target_category": biz_pref.category,
            "affinity_score": biz_pref.affinity_score,
            "valid_days": 30,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

    def _score_promotions(
        self,
        promotions: List[Dict[str, Any]],
        behavior: EnhancedUserBehavior
    ) -> List[Dict[str, Any]]:
        """Score promotions based on likelihood of conversion"""
        for promo in promotions:
            score = 50  # Base score

            # Boost based on historical conversion for similar offers
            if behavior.conversion_history.best_performing_offer_type == promo.get('offer_type'):
                score += 30

            # Boost based on pattern confidence
            confidence = promo.get('confidence_score', 50)
            score += confidence * 0.2

            # Boost based on engagement
            if behavior.app_engagement.engagement_score > 70:
                score += 10

            # Reduce if user rarely converts
            if behavior.conversion_history.conversion_rate < 5:
                score -= 20

            promo['score'] = min(100, max(0, score))

        return promotions

    def learn_from_conversion(self, user_id: str, campaign_id: str, converted: bool, value: float = 0):
        """Update learning models based on conversion feedback"""
        try:
            # Record the conversion
            self.cursor.execute("""
                INSERT INTO conversion_feedback
                (user_id, campaign_id, converted, conversion_value, feedback_time)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, campaign_id, converted, value, datetime.now(timezone.utc)))

            # Update campaign stats
            if converted:
                self.cursor.execute("""
                    UPDATE ai_campaigns
                    SET conversions = conversions + 1,
                        total_conversion_value = total_conversion_value + %s
                    WHERE campaign_id = %s
                """, (value, campaign_id))

            self.conn.commit()

            # Trigger model retraining if enough new data
            self._check_retrain_threshold()

        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error recording conversion feedback: {str(e)}")

    def _check_retrain_threshold(self):
        """Check if enough data for model retraining"""
        try:
            self.cursor.execute("""
                SELECT COUNT(*) as count FROM conversion_feedback
                WHERE feedback_time >= NOW() - INTERVAL '24 hours'
            """)
            row = self.cursor.fetchone()
            if row and row['count'] >= 100:
                self._retrain_models()
        except Exception:
            pass

    def _retrain_models(self):
        """Retrain behavioral models with new data - placeholder for ML model retraining"""
        logger.info("Retraining behavioral models with new conversion data...")


# ============================================================================
# ENHANCED MARKETING AI SERVICE
# ============================================================================

class EnhancedMarketingAIService:
    """
    Enhanced Marketing AI Service with behavioral learning capabilities
    """

    def __init__(self):
        self.conn: Optional[Any] = None
        self.learning_engine: Optional[BehavioralLearningEngine] = None
        self.promotion_engine: Optional[AdaptivePromotionEngine] = None

    def initialize(self):
        """Initialize the enhanced service"""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            self.learning_engine = BehavioralLearningEngine(self.conn)
            self.promotion_engine = AdaptivePromotionEngine(self.conn)
            logger.info("✅ Enhanced Marketing AI Service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Enhanced Marketing AI: {str(e)}")
            raise

    def _ensure_initialized(self):
        """Ensure service is initialized"""
        if self.learning_engine is None or self.promotion_engine is None or self.conn is None:
            raise RuntimeError("Service not initialized. Call initialize() first.")

    def analyze_user(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive behavioral analysis for a user"""
        self._ensure_initialized()
        assert self.learning_engine is not None
        behavior = self.learning_engine.analyze_enhanced_behavior(user_id)
        return self._behavior_to_dict(behavior)

    def get_personalized_promotions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get personalized promotions for a user"""
        self._ensure_initialized()
        assert self.promotion_engine is not None
        return self.promotion_engine.generate_personalized_promotions(user_id)

    def record_conversion(self, user_id: str, campaign_id: str, converted: bool, value: float = 0):
        """Record conversion feedback for learning"""
        self._ensure_initialized()
        assert self.promotion_engine is not None
        self.promotion_engine.learn_from_conversion(user_id, campaign_id, converted, value)

    def get_segment_insights(self, segment_type: str) -> Dict[str, Any]:
        """Get insights for a user segment"""
        self._ensure_initialized()
        assert self.conn is not None
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            # Get users by segment pattern
            cursor.execute("""
                SELECT
                    user_id,
                    behavior_patterns,
                    total_spent,
                    churn_risk_score,
                    predicted_monthly_spend
                FROM user_behavior_profiles
                WHERE %s = ANY(behavior_patterns)
                LIMIT 1000
            """, (segment_type,))

            users = cursor.fetchall()

            if not users:
                return {"segment": segment_type, "count": 0}

            return {
                "segment": segment_type,
                "count": len(users),
                "avg_spend": sum(u['total_spent'] for u in users) / len(users),
                "avg_churn_risk": sum(u['churn_risk_score'] for u in users) / len(users),
                "predicted_revenue": sum(u['predicted_monthly_spend'] for u in users)
            }
        except Exception as e:
            logger.error(f"Error getting segment insights: {str(e)}")
            return {"segment": segment_type, "error": str(e)}

    def _behavior_to_dict(self, behavior: EnhancedUserBehavior) -> Dict[str, Any]:
        """Convert behavior object to dictionary"""
        return {
            "user_id": behavior.user_id,
            "total_spent": behavior.total_spent,
            "transaction_count": behavior.transaction_count,
            "avg_transaction": behavior.avg_transaction,
            "days_as_customer": behavior.days_as_customer,
            "days_since_last_activity": behavior.days_since_last_activity,
            "location": {
                "primary_city": behavior.location_behavior.primary_city,
                "primary_zip": behavior.location_behavior.primary_zip,
                "diversity_score": behavior.location_behavior.location_diversity_score,
                "frequent_locations": behavior.location_behavior.frequent_locations[:5],
                "travel_frequency": behavior.location_behavior.travel_frequency
            },
            "purchase": {
                "frequency_days": behavior.purchase_behavior.transaction_frequency_days,
                "spending_velocity": behavior.purchase_behavior.spending_velocity,
                "preferred_time": behavior.purchase_behavior.preferred_payment_time,
                "preferred_day": behavior.purchase_behavior.preferred_payment_day,
                "last_7_days": behavior.purchase_behavior.last_7_days_count,
                "last_30_days": behavior.purchase_behavior.last_30_days_count
            },
            "business_preferences": [
                {
                    "sic_code": bp.sic_code,
                    "category": bp.category,
                    "affinity_score": bp.affinity_score,
                    "transaction_count": bp.transaction_count
                }
                for bp in behavior.business_preferences[:5]
            ],
            "app_engagement": {
                "engagement_score": behavior.app_engagement.engagement_score,
                "total_sessions": behavior.app_engagement.total_sessions,
                "sessions_last_7_days": behavior.app_engagement.sessions_last_7_days,
                "notification_open_rate": behavior.app_engagement.notification_open_rate,
                "most_used_features": behavior.app_engagement.most_used_features
            },
            "conversion_history": {
                "conversion_rate": behavior.conversion_history.conversion_rate,
                "campaigns_converted": behavior.conversion_history.campaigns_converted,
                "best_offer_type": behavior.conversion_history.best_performing_offer_type,
                "responsive_channels": behavior.conversion_history.responsive_channels
            },
            "patterns": [p.value for p in behavior.behavior_patterns],
            "pattern_confidence": behavior.pattern_confidence_scores,
            "predictions": {
                "monthly_spend": behavior.predicted_monthly_spend,
                "churn_risk": behavior.churn_risk_score,
                "lifetime_value": behavior.lifetime_value_estimate,
                "next_purchase_probability": behavior.next_purchase_probability
            },
            "recommended_offers": behavior.recommended_offer_types
        }


# ============================================================================
# DATABASE SCHEMA FOR BEHAVIORAL LEARNING
# ============================================================================

BEHAVIORAL_LEARNING_SCHEMA = """
-- App sessions tracking
CREATE TABLE IF NOT EXISTS app_sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    device_type VARCHAR(50),
    app_version VARCHAR(20),
    features_used JSONB DEFAULT '[]',
    screens_viewed JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_sessions_user ON app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_sessions_time ON app_sessions(start_time);

-- Campaign interactions tracking
CREATE TABLE IF NOT EXISTS campaign_interactions (
    interaction_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    campaign_id INTEGER NOT NULL,
    interaction_type VARCHAR(20) NOT NULL, -- sent, opened, clicked, converted
    interaction_time TIMESTAMP DEFAULT NOW(),
    channel VARCHAR(30), -- push, email, in_app, sms
    converted BOOLEAN DEFAULT FALSE,
    conversion_value DECIMAL(12, 2) DEFAULT 0,
    time_to_convert_hours DECIMAL(10, 2),
    FOREIGN KEY (campaign_id) REFERENCES ai_campaigns(campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_interactions_user ON campaign_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_interactions_campaign ON campaign_interactions(campaign_id);

-- Push notifications tracking
CREATE TABLE IF NOT EXISTS push_notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    notification_type VARCHAR(50),
    title VARCHAR(200),
    body TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered BOOLEAN DEFAULT FALSE,
    opened BOOLEAN DEFAULT FALSE,
    opened_at TIMESTAMP,
    campaign_id INTEGER
);

CREATE INDEX IF NOT EXISTS idx_push_notifications_user ON push_notifications(user_id);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id VARCHAR(50) PRIMARY KEY,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    preferred_channel VARCHAR(20) DEFAULT 'push',
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Behavioral feature weights (for ML model)
CREATE TABLE IF NOT EXISTS behavioral_feature_weights (
    feature_id SERIAL PRIMARY KEY,
    feature_name VARCHAR(100) UNIQUE NOT NULL,
    weight DECIMAL(5, 4) DEFAULT 0.1,
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Conversion feedback for learning
CREATE TABLE IF NOT EXISTS conversion_feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    campaign_id INTEGER NOT NULL,
    converted BOOLEAN NOT NULL,
    conversion_value DECIMAL(12, 2) DEFAULT 0,
    feedback_time TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (campaign_id) REFERENCES ai_campaigns(campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_conversion_feedback_time ON conversion_feedback(feedback_time);

-- User behavior profiles (cached analysis results)
CREATE TABLE IF NOT EXISTS user_behavior_profiles (
    user_id VARCHAR(50) PRIMARY KEY,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    avg_transaction DECIMAL(10, 2) DEFAULT 0,
    behavior_patterns TEXT[] DEFAULT '{}',
    pattern_confidence JSONB DEFAULT '{}',
    churn_risk_score DECIMAL(5, 2) DEFAULT 0,
    predicted_monthly_spend DECIMAL(10, 2) DEFAULT 0,
    lifetime_value_estimate DECIMAL(12, 2) DEFAULT 0,
    engagement_score DECIMAL(5, 2) DEFAULT 0,
    last_analyzed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default feature weights
INSERT INTO behavioral_feature_weights (feature_name, weight) VALUES
    ('spending_weight', 0.25),
    ('frequency_weight', 0.20),
    ('location_weight', 0.15),
    ('engagement_weight', 0.20),
    ('conversion_weight', 0.20)
ON CONFLICT (feature_name) DO NOTHING;

-- Add SIC code column to transactions if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transactions' AND column_name = 'merchant_sic_code') THEN
        ALTER TABLE transactions ADD COLUMN merchant_sic_code VARCHAR(10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transactions' AND column_name = 'merchant_city') THEN
        ALTER TABLE transactions ADD COLUMN merchant_city VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transactions' AND column_name = 'merchant_zip') THEN
        ALTER TABLE transactions ADD COLUMN merchant_zip VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'transactions' AND column_name = 'transaction_time') THEN
        ALTER TABLE transactions ADD COLUMN transaction_time TIME;
    END IF;
END $$;

-- Add conversion tracking to ai_campaigns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'ai_campaigns' AND column_name = 'conversions') THEN
        ALTER TABLE ai_campaigns ADD COLUMN conversions INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'ai_campaigns' AND column_name = 'total_conversion_value') THEN
        ALTER TABLE ai_campaigns ADD COLUMN total_conversion_value DECIMAL(12, 2) DEFAULT 0;
    END IF;
END $$;
"""


def setup_behavioral_learning_tables(conn):
    """Initialize behavioral learning database tables"""
    try:
        cursor = conn.cursor()
        cursor.execute(BEHAVIORAL_LEARNING_SCHEMA)
        conn.commit()
        logger.info("✅ Behavioral learning tables created/updated successfully")
    except Exception as e:
        conn.rollback()
        logger.error(f"Error setting up behavioral learning tables: {str(e)}")
        raise


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

_enhanced_marketing_instance = None

def get_enhanced_marketing_service() -> EnhancedMarketingAIService:
    """Get or create Enhanced Marketing AI service"""
    global _enhanced_marketing_instance

    if _enhanced_marketing_instance is None:
        _enhanced_marketing_instance = EnhancedMarketingAIService()
        _enhanced_marketing_instance.initialize()

    return _enhanced_marketing_instance
