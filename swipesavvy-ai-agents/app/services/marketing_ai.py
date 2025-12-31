"""
Marketing AI Service - Automated Campaign Creation & User Targeting

This service automatically analyzes user behavioral data and creates 
targeted marketing campaigns on a scheduled basis.

Features:
- Transactional behavior analysis
- Geographic spending patterns
- Spending trend detection
- Shop location frequency tracking
- Automatic campaign creation
- User segmentation & targeting
- Performance metrics tracking
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from enum import Enum
import os
import json
from collections import defaultdict
from dataclasses import dataclass
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "swipesavvy_agents"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "password"),
}


class BehaviorPattern(Enum):
    """User behavior patterns detected by the AI"""
    HIGH_SPENDER = "high_spender"
    FREQUENT_SHOPPER = "frequent_shopper"
    WEEKEND_SHOPPER = "weekend_shopper"
    CATEGORY_FOCUSED = "category_focused"
    LOCATION_CLUSTERED = "location_clustered"
    NEW_SHOPPER = "new_shopper"
    INACTIVE = "inactive"
    SEASONAL_SPENDER = "seasonal_spender"


class CampaignType(Enum):
    """Types of campaigns the AI can create"""
    DISCOUNT = "discount"
    CASHBACK = "cashback"
    LOYALTY = "loyalty"
    LOCATION_BASED = "location_based"
    CATEGORY_PROMOTION = "category_promotion"
    SPENDING_MILESTONE = "spending_milestone"
    RE_ENGAGEMENT = "re_engagement"
    VIP = "vip"


@dataclass
class UserBehavior:
    """User behavior profile"""
    user_id: str
    total_spent: float
    transaction_count: int
    avg_transaction: float
    primary_category: str
    top_locations: List[Dict[str, Any]]
    spending_trend: float  # percentage change
    patterns: List[BehaviorPattern]
    last_transaction: datetime
    days_inactive: int


@dataclass
class CampaignTarget:
    """Campaign targeting criteria"""
    pattern: BehaviorPattern
    min_spend: Optional[float] = None
    max_spend: Optional[float] = None
    categories: Optional[List[str]] = None
    locations: Optional[List[str]] = None
    min_transaction_count: Optional[int] = None
    days_since_activity: Optional[int] = None


class BehaviorAnalyzer:
    """Analyzes user behavioral data"""

    def __init__(self, conn):
        self.conn = conn
        self.cursor = conn.cursor(cursor_factory=RealDictCursor)

    def analyze_user_behavior(self, user_id: str, lookback_days: int = 90) -> UserBehavior:
        """
        Analyze a user's behavioral patterns
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=lookback_days)

            # Get transaction data
            self.cursor.execute("""
                SELECT 
                    t.transaction_id,
                    t.amount,
                    t.category,
                    t.merchant_location,
                    t.transaction_date,
                    t.merchant_name
                FROM transactions t
                WHERE t.user_id = %s
                AND t.transaction_date >= %s
                ORDER BY t.transaction_date DESC
            """, (user_id, cutoff_date))

            transactions = self.cursor.fetchall()

            if not transactions:
                return self._create_empty_behavior(user_id)

            # Calculate metrics
            total_spent = sum(float(t['amount']) for t in transactions)
            transaction_count = len(transactions)
            avg_transaction = total_spent / transaction_count if transaction_count > 0 else 0

            # Category analysis
            category_spending = defaultdict(float)
            for t in transactions:
                category_spending[t['category']] += float(t['amount'])
            primary_category = max(category_spending.items(), key=lambda x: x[1])[0]

            # Location analysis
            location_frequency = defaultdict(int)
            for t in transactions:
                location_frequency[t['merchant_location']] += 1

            top_locations = [
                {
                    "location": loc,
                    "frequency": count,
                    "percentage": (count / transaction_count * 100) if transaction_count > 0 else 0
                }
                for loc, count in sorted(location_frequency.items(), key=lambda x: x[1], reverse=True)[:5]
            ]

            # Spending trend (compare first half vs second half of period)
            mid_point = len(transactions) // 2
            first_half = sum(float(t['amount']) for t in transactions[mid_point:])
            second_half = sum(float(t['amount']) for t in transactions[:mid_point])
            spending_trend = ((second_half - first_half) / first_half * 100) if first_half > 0 else 0

            # Last transaction
            last_transaction = transactions[0]['transaction_date']
            days_inactive = (datetime.utcnow() - last_transaction).days

            # Detect patterns
            patterns = self._detect_patterns(
                total_spent, transaction_count, avg_transaction,
                days_inactive, spending_trend, len(top_locations)
            )

            return UserBehavior(
                user_id=user_id,
                total_spent=total_spent,
                transaction_count=transaction_count,
                avg_transaction=avg_transaction,
                primary_category=primary_category,
                top_locations=top_locations,
                spending_trend=spending_trend,
                patterns=patterns,
                last_transaction=last_transaction,
                days_inactive=days_inactive
            )

        except Exception as e:
            logger.error(f"Error analyzing user behavior: {str(e)}")
            return self._create_empty_behavior(user_id)

    def _detect_patterns(self, total_spent: float, transaction_count: int, 
                        avg_transaction: float, days_inactive: int, 
                        spending_trend: float, location_count: int) -> List[BehaviorPattern]:
        """Detect behavioral patterns"""
        patterns = []

        # High spender detection
        if total_spent > 5000:
            patterns.append(BehaviorPattern.HIGH_SPENDER)

        # Frequent shopper detection
        if transaction_count > 20:
            patterns.append(BehaviorPattern.FREQUENT_SHOPPER)

        # Location clustered detection
        if location_count <= 2 and transaction_count > 5:
            patterns.append(BehaviorPattern.LOCATION_CLUSTERED)

        # Spending trend detection
        if spending_trend > 20:
            patterns.append(BehaviorPattern.SEASONAL_SPENDER)

        # Inactivity detection
        if days_inactive > 30:
            patterns.append(BehaviorPattern.INACTIVE)

        # New shopper detection
        if transaction_count < 5 and days_inactive < 10:
            patterns.append(BehaviorPattern.NEW_SHOPPER)

        return patterns if patterns else [BehaviorPattern.CATEGORY_FOCUSED]

    def _create_empty_behavior(self, user_id: str) -> UserBehavior:
        """Create empty behavior profile"""
        return UserBehavior(
            user_id=user_id,
            total_spent=0,
            transaction_count=0,
            avg_transaction=0,
            primary_category="general",
            top_locations=[],
            spending_trend=0,
            patterns=[],
            last_transaction=datetime.utcnow(),
            days_inactive=999
        )

    def get_all_user_behaviors(self, limit: int = 1000) -> List[UserBehavior]:
        """Get behavior profiles for all active users"""
        try:
            self.cursor.execute("""
                SELECT DISTINCT user_id FROM transactions
                WHERE transaction_date >= NOW() - INTERVAL '90 days'
                LIMIT %s
            """, (limit,))

            users = self.cursor.fetchall()
            behaviors = []

            for user in users:
                behavior = self.analyze_user_behavior(user['user_id'])
                behaviors.append(behavior)

            return behaviors

        except Exception as e:
            logger.error(f"Error getting all user behaviors: {str(e)}")
            return []


class CampaignBuilder:
    """Builds marketing campaigns based on user behaviors"""

    def __init__(self, conn):
        self.conn = conn
        self.cursor = conn.cursor(cursor_factory=RealDictCursor)

    def create_campaigns_from_behaviors(self, behaviors: List[UserBehavior]) -> List[Dict[str, Any]]:
        """
        Create campaigns based on detected user behaviors
        """
        campaigns = []

        # Analyze patterns
        pattern_counts = defaultdict(int)
        for behavior in behaviors:
            for pattern in behavior.patterns:
                pattern_counts[pattern] += 1

        # Generate campaigns for detected patterns
        if pattern_counts[BehaviorPattern.HIGH_SPENDER] > 0:
            campaign = self._create_vip_campaign(behaviors)
            if campaign:
                campaigns.append(campaign)

        if pattern_counts[BehaviorPattern.FREQUENT_SHOPPER] > 0:
            campaign = self._create_loyalty_campaign(behaviors)
            if campaign:
                campaigns.append(campaign)

        if pattern_counts[BehaviorPattern.LOCATION_CLUSTERED] > 0:
            campaigns.extend(self._create_location_campaigns(behaviors))

        if pattern_counts[BehaviorPattern.INACTIVE] > 0:
            campaign = self._create_reengagement_campaign(behaviors)
            if campaign:
                campaigns.append(campaign)

        if pattern_counts[BehaviorPattern.NEW_SHOPPER] > 0:
            campaign = self._create_welcome_campaign(behaviors)
            if campaign:
                campaigns.append(campaign)

        if pattern_counts[BehaviorPattern.SEASONAL_SPENDER] > 0:
            campaign = self._create_spending_milestone_campaign(behaviors)
            if campaign:
                campaigns.append(campaign)

        return campaigns

    def _create_vip_campaign(self, behaviors: List[UserBehavior]) -> Optional[Dict[str, Any]]:
        """Create VIP/High spender campaign"""
        high_spenders = [b for b in behaviors if BehaviorPattern.HIGH_SPENDER in b.patterns]

        if not high_spenders:
            return None

        return {
            "campaign_type": CampaignType.VIP.value,
            "name": "VIP Exclusive Rewards",
            "description": "Exclusive benefits for our top spenders",
            "offer_type": "cashback",
            "offer_value": 5,  # 5% cashback
            "offer_unit": "percentage",
            "target_pattern": BehaviorPattern.HIGH_SPENDER.value,
            "target_count": len(high_spenders),
            "qualifying_criteria": {
                "min_spend": 5000,
                "min_transactions": 15
            },
            "duration_days": 30,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }

    def _create_loyalty_campaign(self, behaviors: List[UserBehavior]) -> Optional[Dict[str, Any]]:
        """Create loyalty/frequent shopper campaign"""
        frequent = [b for b in behaviors if BehaviorPattern.FREQUENT_SHOPPER in b.patterns]

        if not frequent:
            return None

        return {
            "campaign_type": CampaignType.LOYALTY.value,
            "name": "Loyalty Bonus Points",
            "description": "Earn bonus points on every purchase",
            "offer_type": "points",
            "offer_value": 10,  # 10 points per $1 spent
            "offer_unit": "percentage",
            "target_pattern": BehaviorPattern.FREQUENT_SHOPPER.value,
            "target_count": len(frequent),
            "qualifying_criteria": {
                "min_transactions": 10
            },
            "duration_days": 60,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }

    def _create_location_campaigns(self, behaviors: List[UserBehavior]) -> List[Dict[str, Any]]:
        """Create location-based campaigns"""
        campaigns = []
        location_clustered = [b for b in behaviors if BehaviorPattern.LOCATION_CLUSTERED in b.patterns]

        location_groups = defaultdict(list)
        for behavior in location_clustered:
            if behavior.top_locations:
                primary_location = behavior.top_locations[0]['location']
                location_groups[primary_location].append(behavior)

        for location, users in location_groups.items():
            if len(users) >= 3:  # Only create if targeting at least 3 users
                campaign = {
                    "campaign_type": CampaignType.LOCATION_BASED.value,
                    "name": f"Exclusive {location} Promotions",
                    "description": f"Special offers for shoppers in {location}",
                    "offer_type": "discount",
                    "offer_value": 15,  # 15% discount
                    "offer_unit": "percentage",
                    "target_pattern": BehaviorPattern.LOCATION_CLUSTERED.value,
                    "target_location": location,
                    "target_count": len(users),
                    "qualifying_criteria": {
                        "primary_location": location
                    },
                    "duration_days": 30,
                    "created_at": datetime.utcnow().isoformat(),
                    "status": "active"
                }
                campaigns.append(campaign)

        return campaigns

    def _create_reengagement_campaign(self, behaviors: List[UserBehavior]) -> Optional[Dict[str, Any]]:
        """Create re-engagement campaign for inactive users"""
        inactive = [b for b in behaviors if BehaviorPattern.INACTIVE in b.patterns]

        if not inactive:
            return None

        return {
            "campaign_type": CampaignType.RE_ENGAGEMENT.value,
            "name": "We Miss You - Come Back Offer",
            "description": "Special discount to welcome you back",
            "offer_type": "discount",
            "offer_value": 20,  # 20% discount
            "offer_unit": "percentage",
            "target_pattern": BehaviorPattern.INACTIVE.value,
            "target_count": len(inactive),
            "qualifying_criteria": {
                "days_since_transaction": 30
            },
            "duration_days": 14,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }

    def _create_welcome_campaign(self, behaviors: List[UserBehavior]) -> Optional[Dict[str, Any]]:
        """Create welcome campaign for new shoppers"""
        new_shoppers = [b for b in behaviors if BehaviorPattern.NEW_SHOPPER in b.patterns]

        if not new_shoppers:
            return None

        return {
            "campaign_type": CampaignType.DISCOUNT.value,
            "name": "New Customer Welcome Bonus",
            "description": "Special discount on your next purchase",
            "offer_type": "discount",
            "offer_value": 25,  # 25% discount
            "offer_unit": "percentage",
            "target_pattern": BehaviorPattern.NEW_SHOPPER.value,
            "target_count": len(new_shoppers),
            "qualifying_criteria": {
                "transaction_count_max": 5
            },
            "duration_days": 21,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }

    def _create_spending_milestone_campaign(self, behaviors: List[UserBehavior]) -> Optional[Dict[str, Any]]:
        """Create spending milestone campaign"""
        seasonal = [b for b in behaviors if BehaviorPattern.SEASONAL_SPENDER in b.patterns]

        if not seasonal:
            return None

        return {
            "campaign_type": CampaignType.SPENDING_MILESTONE.value,
            "name": "Spending Milestone Rewards",
            "description": "Bonus rewards when you reach spending milestones",
            "offer_type": "cashback",
            "offer_value": 50,  # $50 bonus
            "offer_unit": "fixed",
            "target_pattern": BehaviorPattern.SEASONAL_SPENDER.value,
            "target_count": len(seasonal),
            "qualifying_criteria": {
                "spending_threshold": 1000
            },
            "duration_days": 90,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }


class UserSegmentationEngine:
    """Segments and targets users for campaigns"""

    def __init__(self, conn):
        self.conn = conn
        self.cursor = conn.cursor(cursor_factory=RealDictCursor)

    def segment_users_for_campaign(self, campaign: Dict[str, Any], 
                                   behaviors: List[UserBehavior]) -> List[str]:
        """
        Segment users that match campaign criteria
        
        Returns: List of user IDs to target
        """
        target_users = []
        criteria = campaign.get('qualifying_criteria', {})
        target_pattern = campaign.get('target_pattern')

        for behavior in behaviors:
            if self._matches_criteria(behavior, criteria, target_pattern):
                target_users.append(behavior.user_id)

        return target_users

    def _matches_criteria(self, behavior: UserBehavior, criteria: Dict[str, Any], 
                         pattern: str) -> bool:
        """Check if user matches campaign criteria"""
        # Check pattern match
        pattern_enum = BehaviorPattern(pattern)
        if pattern_enum not in behavior.patterns:
            return False

        # Check min spend
        min_spend = criteria.get('min_spend')
        if min_spend and behavior.total_spent < min_spend:
            return False

        # Check max spend
        max_spend = criteria.get('max_spend')
        if max_spend and behavior.total_spent > max_spend:
            return False

        # Check min transaction count
        min_txns = criteria.get('min_transactions')
        if min_txns and behavior.transaction_count < min_txns:
            return False

        # Check max transaction count
        max_txns = criteria.get('transaction_count_max')
        if max_txns and behavior.transaction_count > max_txns:
            return False

        # Check days since transaction
        days_since = criteria.get('days_since_transaction')
        if days_since and behavior.days_inactive < days_since:
            return False

        # Check location match
        location = criteria.get('primary_location')
        if location:
            primary_locations = [loc['location'] for loc in behavior.top_locations]
            if location not in primary_locations:
                return False

        return True


class MarketingAIService:
    """Main Marketing AI Service"""

    def __init__(self):
        self.conn = None
        self.analyzer = None
        self.builder = None
        self.segmentation = None

    def initialize(self):
        """Initialize the service"""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            self.analyzer = BehaviorAnalyzer(self.conn)
            self.builder = CampaignBuilder(self.conn)
            self.segmentation = UserSegmentationEngine(self.conn)
            logger.info("✅ Marketing AI Service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Marketing AI Service: {str(e)}")
            raise

    def run_analysis_cycle(self) -> Dict[str, Any]:
        """
        Run a complete marketing AI analysis cycle:
        1. Analyze user behaviors
        2. Create campaigns
        3. Segment users for targeting
        4. Save campaigns to database
        """
        try:
            logger.info("🤖 Starting marketing AI analysis cycle...")

            # Step 1: Analyze behaviors
            logger.info("📊 Analyzing user behaviors...")
            behaviors = self.analyzer.get_all_user_behaviors()
            logger.info(f"Analyzed {len(behaviors)} users")

            if not behaviors:
                logger.warning("No user behaviors to analyze")
                return {"status": "no_data", "campaigns_created": 0}

            # Step 2: Create campaigns
            logger.info("🎯 Creating marketing campaigns...")
            campaigns = self.builder.create_campaigns_from_behaviors(behaviors)
            logger.info(f"Created {len(campaigns)} campaigns")

            # Step 3: Segment users and save campaigns
            campaign_results = []
            for campaign in campaigns:
                try:
                    # Segment users for this campaign
                    target_users = self.segmentation.segment_users_for_campaign(campaign, behaviors)
                    
                    # Save campaign
                    campaign['target_user_ids'] = target_users
                    campaign['target_count'] = len(target_users)
                    
                    self._save_campaign(campaign)
                    campaign_results.append(campaign)
                    
                    logger.info(f"Created campaign '{campaign['name']}' targeting {len(target_users)} users")
                
                except Exception as e:
                    logger.error(f"Error processing campaign {campaign.get('name')}: {str(e)}")
                    continue

            return {
                "status": "success",
                "users_analyzed": len(behaviors),
                "campaigns_created": len(campaign_results),
                "campaigns": campaign_results
            }

        except Exception as e:
            logger.error(f"Error in analysis cycle: {str(e)}")
            return {"status": "error", "error": str(e)}

    def _save_campaign(self, campaign: Dict[str, Any]):
        """Save campaign to database"""
        try:
            cursor = self.conn.cursor()
            
            # Save marketing campaign
            query = """
            INSERT INTO ai_campaigns 
            (campaign_name, campaign_type, description, offer_type, offer_value, 
             offer_unit, target_pattern, target_location, qualifying_criteria, 
             duration_days, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING campaign_id
            """
            
            cursor.execute(query, (
                campaign['name'],
                campaign['campaign_type'],
                campaign['description'],
                campaign['offer_type'],
                campaign['offer_value'],
                campaign['offer_unit'],
                campaign.get('target_pattern'),
                campaign.get('target_location'),
                json.dumps(campaign.get('qualifying_criteria', {})),
                campaign['duration_days'],
                campaign['status'],
                datetime.utcnow()
            ))
            
            campaign_id = cursor.fetchone()[0]
            
            # Save campaign targets
            if campaign.get('target_user_ids'):
                for user_id in campaign['target_user_ids']:
                    target_query = """
                    INSERT INTO campaign_targets (campaign_id, user_id, status, created_at)
                    VALUES (%s, %s, %s, %s)
                    """
                    cursor.execute(target_query, (campaign_id, user_id, 'eligible', datetime.utcnow()))
            
            self.conn.commit()
            logger.info(f"Saved campaign {campaign_id} with {len(campaign.get('target_user_ids', []))} targets")
            
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error saving campaign: {str(e)}")
            raise

    def get_campaign_analytics(self, campaign_id: Optional[str] = None) -> Dict[str, Any]:
        """Get analytics for campaigns"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            if campaign_id:
                # Get specific campaign
                query = """
                SELECT 
                    mc.*,
                    COUNT(DISTINCT ct.user_id) as total_targets,
                    COUNT(DISTINCT CASE WHEN ct.status = 'converted' THEN ct.user_id END) as conversions
                FROM ai_campaigns mc
                LEFT JOIN campaign_targets ct ON mc.campaign_id = ct.campaign_id
                WHERE mc.campaign_id = %s
                GROUP BY mc.campaign_id
                """
                cursor.execute(query, (campaign_id,))
            else:
                # Get all campaigns
                query = """
                SELECT 
                    mc.*,
                    COUNT(DISTINCT ct.user_id) as total_targets,
                    COUNT(DISTINCT CASE WHEN ct.status = 'converted' THEN ct.user_id END) as conversions
                FROM ai_campaigns mc
                LEFT JOIN campaign_targets ct ON mc.campaign_id = ct.campaign_id
                GROUP BY mc.campaign_id
                ORDER BY mc.created_at DESC
                LIMIT 50
                """
                cursor.execute(query)
            
            result = cursor.fetchall()
            
            if campaign_id:
                return dict(result[0]) if result else {}
            
            return [dict(row) for row in result]
            
        except Exception as e:
            logger.error(f"Error getting campaign analytics: {str(e)}")
            return {}


# Singleton instance
_marketing_ai_instance = None

def get_marketing_ai_service() -> MarketingAIService:
    """Get or create Marketing AI service"""
    global _marketing_ai_instance
    
    if _marketing_ai_instance is None:
        _marketing_ai_instance = MarketingAIService()
        _marketing_ai_instance.initialize()
    
    return _marketing_ai_instance
