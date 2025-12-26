"""
A/B Testing Framework
Purpose: Statistical testing and optimization for campaign variations
Tech: Python, SciPy, NumPy, PostgreSQL
Created: December 26, 2025
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from decimal import Decimal
import math
import hashlib
import logging
from sqlalchemy import text
from sqlalchemy.orm import Session
from scipy import stats

logger = logging.getLogger(__name__)

# ═════════════════════════════════════════════════════════════════════════════
# DATA MODELS
# ═════════════════════════════════════════════════════════════════════════════

@dataclass
class ABTestConfig:
    """Configuration for A/B test"""
    test_id: str
    test_name: str
    control_campaign_id: str
    variant_campaign_id: str
    start_date: datetime
    end_date: Optional[datetime]
    target_sample_size: int  # Per group
    confidence_level: float  # 0.95 or 0.99
    minimum_effect_size: float  # Expected minimum improvement
    is_active: bool


@dataclass
class TestMetrics:
    """Metrics for a single test group (control or variant)"""
    group_name: str  # "control" or "variant"
    total_users: int
    total_impressions: int
    total_clicks: int
    total_conversions: int
    total_revenue: float
    
    # Calculated
    click_rate: float
    conversion_rate: float
    revenue_per_user: float
    revenue_per_impression: float


@dataclass
class TestResult:
    """Statistical test result"""
    test_id: str
    test_name: str
    control_metrics: TestMetrics
    variant_metrics: TestMetrics
    
    # Statistical results
    conversion_rate_difference: float  # variant - control
    improvement_percentage: float  # (variant - control) / control * 100
    
    # Statistical significance
    p_value: float
    confidence_level: str  # "90%", "95%", "99%"
    is_significant: bool
    
    # Winner determination
    winner: str  # "control", "variant", or "no_winner"
    recommendation: str
    
    # Power analysis
    statistical_power: float
    required_sample_size: int


# ═════════════════════════════════════════════════════════════════════════════
# A/B TESTING SERVICE
# ═════════════════════════════════════════════════════════════════════════════

class ABTestingService:
    """A/B testing framework with statistical analysis"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ─────────────────────────────────────────────────────────────────────────
    # TEST MANAGEMENT
    # ─────────────────────────────────────────────────────────────────────────
    
    def create_test(
        self,
        test_name: str,
        control_campaign_id: str,
        variant_campaign_id: str,
        target_sample_size: int = 1000,
        confidence_level: float = 0.95,
        minimum_effect_size: float = 0.10  # 10% improvement
    ) -> ABTestConfig:
        """
        Create new A/B test
        
        Args:
            test_name: Human-readable test name
            control_campaign_id: Control group campaign
            variant_campaign_id: Variant group campaign
            target_sample_size: Users per group
            confidence_level: 0.90, 0.95, or 0.99
            minimum_effect_size: Minimum improvement to detect
        """
        
        # Validate campaigns exist
        for camp_id in [control_campaign_id, variant_campaign_id]:
            camp = self.db.execute(
                text("SELECT id FROM campaigns WHERE campaign_id = :id"),
                {"id": camp_id}
            ).mappings().first()
            if not camp:
                raise ValueError(f"Campaign {camp_id} not found")
        
        test_id = hashlib.md5(
            f"{control_campaign_id}_{variant_campaign_id}_{datetime.utcnow()}".encode()
        ).hexdigest()[:12]
        
        # Create in database
        self.db.execute(
            text("""
                INSERT INTO ab_tests (
                    test_id, test_name, control_campaign_id, variant_campaign_id,
                    start_date, target_sample_size, confidence_level, 
                    minimum_effect_size, is_active
                )
                VALUES (
                    :test_id, :test_name, :control_id, :variant_id,
                    :start_date, :sample_size, :confidence, :effect_size, true
                )
            """),
            {
                "test_id": test_id,
                "test_name": test_name,
                "control_id": control_campaign_id,
                "variant_id": variant_campaign_id,
                "start_date": datetime.utcnow(),
                "sample_size": target_sample_size,
                "confidence": confidence_level,
                "effect_size": minimum_effect_size
            }
        )
        self.db.commit()
        
        logger.info(f"Created A/B test: {test_id} ({test_name})")
        
        return ABTestConfig(
            test_id=test_id,
            test_name=test_name,
            control_campaign_id=control_campaign_id,
            variant_campaign_id=variant_campaign_id,
            start_date=datetime.utcnow(),
            end_date=None,
            target_sample_size=target_sample_size,
            confidence_level=confidence_level,
            minimum_effect_size=minimum_effect_size,
            is_active=True
        )
    
    def get_test_status(self, test_id: str) -> Dict:
        """Get current test status and progress"""
        
        test = self.db.execute(
            text("""
                SELECT * FROM ab_tests WHERE test_id = :test_id
            """),
            {"test_id": test_id}
        ).mappings().first()
        
        if not test:
            raise ValueError(f"Test {test_id} not found")
        
        # Get metrics for both groups
        control_metrics = self._get_test_group_metrics(
            test['control_campaign_id'], 'control'
        )
        variant_metrics = self._get_test_group_metrics(
            test['variant_campaign_id'], 'variant'
        )
        
        # Calculate progress
        control_progress = min(
            100,
            (control_metrics.total_users / test['target_sample_size']) * 100
        )
        variant_progress = min(
            100,
            (variant_metrics.total_users / test['target_sample_size']) * 100
        )
        
        return {
            'test_id': test_id,
            'test_name': test['test_name'],
            'is_active': test['is_active'],
            'start_date': test['start_date'].isoformat(),
            'end_date': test['end_date'].isoformat() if test['end_date'] else None,
            'control': {
                'campaign_id': test['control_campaign_id'],
                'users': control_metrics.total_users,
                'target': test['target_sample_size'],
                'progress_percent': round(control_progress, 1)
            },
            'variant': {
                'campaign_id': test['variant_campaign_id'],
                'users': variant_metrics.total_users,
                'target': test['target_sample_size'],
                'progress_percent': round(variant_progress, 1)
            },
            'can_end_test': control_metrics.total_users >= test['target_sample_size'] or 
                           variant_metrics.total_users >= test['target_sample_size']
        }
    
    # ─────────────────────────────────────────────────────────────────────────
    # TEST METRICS
    # ─────────────────────────────────────────────────────────────────────────
    
    def _get_test_group_metrics(
        self,
        campaign_id: str,
        group_name: str
    ) -> TestMetrics:
        """Get metrics for a test group"""
        
        campaign = self.db.execute(
            text("SELECT id FROM campaigns WHERE campaign_id = :id"),
            {"id": campaign_id}
        ).mappings().first()
        
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")
        
        metrics = self.db.execute(
            text("""
                SELECT 
                    COUNT(DISTINCT cv.user_id) as unique_users,
                    COUNT(DISTINCT cv.id) as total_views,
                    COUNT(DISTINCT cc.id) as conversions,
                    COALESCE(SUM(cc.conversion_amount), 0) as revenue
                FROM campaign_views cv
                LEFT JOIN campaign_conversions cc ON cv.id = cc.view_id
                WHERE cv.campaign_id = :campaign_id
            """),
            {"campaign_id": campaign['id']}
        ).mappings().first()
        
        users = metrics['unique_users'] or 0
        impressions = metrics['total_views'] or 1  # Avoid division by zero
        conversions = metrics['conversions'] or 0
        revenue = float(metrics['revenue'] or 0)
        
        click_rate = 1.0  # Simplified
        conv_rate = conversions / impressions if impressions > 0 else 0
        rev_per_user = revenue / users if users > 0 else 0
        rev_per_imp = revenue / impressions if impressions > 0 else 0
        
        return TestMetrics(
            group_name=group_name,
            total_users=users,
            total_impressions=impressions,
            total_clicks=impressions,  # Simplified
            total_conversions=conversions,
            total_revenue=revenue,
            click_rate=round(click_rate, 4),
            conversion_rate=round(conv_rate, 4),
            revenue_per_user=round(rev_per_user, 2),
            revenue_per_impression=round(rev_per_imp, 4)
        )
    
    # ─────────────────────────────────────────────────────────────────────────
    # STATISTICAL ANALYSIS
    # ─────────────────────────────────────────────────────────────────────────
    
    def analyze_test(self, test_id: str) -> TestResult:
        """
        Perform statistical analysis on test results
        Uses Chi-squared test for conversion rates
        """
        
        test = self.db.execute(
            text("SELECT * FROM ab_tests WHERE test_id = :id"),
            {"test_id": test_id}
        ).mappings().first()
        
        if not test:
            raise ValueError(f"Test {test_id} not found")
        
        # Get metrics for both groups
        control_metrics = self._get_test_group_metrics(
            test['control_campaign_id'], 'control'
        )
        variant_metrics = self._get_test_group_metrics(
            test['variant_campaign_id'], 'variant'
        )
        
        # Chi-squared test for conversion rates
        control_conversions = control_metrics.total_conversions
        control_non_conversions = control_metrics.total_impressions - control_conversions
        variant_conversions = variant_metrics.total_conversions
        variant_non_conversions = variant_metrics.total_impressions - variant_conversions
        
        # Contingency table
        contingency_table = [
            [control_conversions, control_non_conversions],
            [variant_conversions, variant_non_conversions]
        ]
        
        # Perform chi-squared test
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
        
        # Determine significance threshold
        confidence_level = test['confidence_level']
        alpha = 1 - confidence_level
        is_significant = p_value < alpha
        
        # Calculate improvement
        control_rate = control_metrics.conversion_rate
        variant_rate = variant_metrics.conversion_rate
        
        rate_difference = variant_rate - control_rate
        improvement_pct = (rate_difference / control_rate * 100) if control_rate > 0 else 0
        
        # Determine winner
        if not is_significant:
            winner = "no_winner"
            recommendation = "Insufficient statistical power. Continue test or increase sample size."
        elif rate_difference > 0:
            winner = "variant"
            recommendation = f"Variant wins with {improvement_pct:.1f}% improvement. Deploy variant."
        else:
            winner = "control"
            recommendation = "Control performs better. Keep control, improve variant, retry."
        
        # Calculate power
        power = self._calculate_statistical_power(
            control_conversions,
            control_metrics.total_impressions,
            variant_conversions,
            variant_metrics.total_impressions,
            confidence_level
        )
        
        # Calculate required sample size for significant result
        required_size = self._calculate_required_sample_size(
            control_rate,
            test['minimum_effect_size'],
            confidence_level
        )
        
        conf_str = f"{int(confidence_level * 100)}%"
        
        result = TestResult(
            test_id=test_id,
            test_name=test['test_name'],
            control_metrics=control_metrics,
            variant_metrics=variant_metrics,
            conversion_rate_difference=round(rate_difference, 4),
            improvement_percentage=round(improvement_pct, 2),
            p_value=round(p_value, 4),
            confidence_level=conf_str,
            is_significant=is_significant,
            winner=winner,
            recommendation=recommendation,
            statistical_power=round(power, 3),
            required_sample_size=int(required_size)
        )
        
        # Save result to database
        self.db.execute(
            text("""
                INSERT INTO ab_test_results (
                    test_id, p_value, is_significant, winner,
                    control_conv_rate, variant_conv_rate, improvement_percent,
                    analyzed_at
                )
                VALUES (
                    :test_id, :p_value, :is_sig, :winner,
                    :control_rate, :variant_rate, :improvement,
                    :now
                )
            """),
            {
                "test_id": test_id,
                "p_value": float(p_value),
                "is_sig": is_significant,
                "winner": winner,
                "control_rate": float(control_rate),
                "variant_rate": float(variant_rate),
                "improvement": float(improvement_pct),
                "now": datetime.utcnow()
            }
        )
        self.db.commit()
        
        return result
    
    def _calculate_statistical_power(
        self,
        control_conversions: int,
        control_total: int,
        variant_conversions: int,
        variant_total: int,
        confidence_level: float
    ) -> float:
        """
        Calculate statistical power of test
        Power = probability of detecting true effect
        """
        
        control_rate = control_conversions / control_total if control_total > 0 else 0
        variant_rate = variant_conversions / variant_total if variant_total > 0 else 0
        
        # Simple approximation
        if control_rate == 0 or variant_rate == 0:
            return 0.0
        
        effect_size = abs(variant_rate - control_rate)
        pooled_rate = (control_conversions + variant_conversions) / (control_total + variant_total)
        
        # Simplified power calculation
        n = min(control_total, variant_total)
        se = math.sqrt(2 * pooled_rate * (1 - pooled_rate) / n)
        z_alpha = 1.96 if confidence_level == 0.95 else 2.576
        z_beta = effect_size / se - z_alpha
        
        power = stats.norm.cdf(z_beta)
        return max(0, min(1, power))
    
    def _calculate_required_sample_size(
        self,
        baseline_rate: float,
        effect_size: float,
        confidence_level: float
    ) -> float:
        """
        Calculate required sample size to detect effect with power
        Uses two-proportion z-test formula
        """
        
        if baseline_rate == 0:
            return float('inf')
        
        variant_rate = baseline_rate * (1 + effect_size)
        
        # Z-scores
        z_alpha = 1.96 if confidence_level == 0.95 else 2.576
        z_beta = 0.84  # 80% power
        
        p1 = baseline_rate
        p2 = variant_rate
        p_pool = (p1 + p2) / 2
        
        numerator = (z_alpha + z_beta) ** 2 * (p_pool * (1 - p_pool))
        denominator = (p1 - p2) ** 2
        
        n = (2 * numerator / denominator) if denominator > 0 else float('inf')
        return n
    
    # ─────────────────────────────────────────────────────────────────────────
    # TEST MANAGEMENT
    # ─────────────────────────────────────────────────────────────────────────
    
    def end_test(self, test_id: str) -> TestResult:
        """End test and return final result"""
        
        # Analyze test
        result = self.analyze_test(test_id)
        
        # Mark as inactive
        self.db.execute(
            text("UPDATE ab_tests SET is_active = FALSE, end_date = :now WHERE test_id = :id"),
            {"id": test_id, "now": datetime.utcnow()}
        )
        self.db.commit()
        
        logger.info(f"Test ended: {test_id}, Winner: {result.winner}")
        return result
    
    def get_test_history(self, limit: int = 10) -> List[Dict]:
        """Get history of completed tests"""
        
        tests = self.db.execute(
            text("""
                SELECT * FROM ab_test_results
                ORDER BY analyzed_at DESC
                LIMIT :limit
            """),
            {"limit": limit}
        ).mappings().all()
        
        results = []
        for test in tests:
            results.append({
                'test_id': test['test_id'],
                'p_value': round(float(test['p_value']), 4),
                'is_significant': test['is_significant'],
                'winner': test['winner'],
                'improvement_percent': round(float(test['improvement_percent']), 2),
                'analyzed_at': test['analyzed_at'].isoformat(),
                'control_rate': round(float(test['control_conv_rate']), 4),
                'variant_rate': round(float(test['variant_conv_rate']), 4)
            })
        
        return results
    
    # ─────────────────────────────────────────────────────────────────────────
    # USER ASSIGNMENT (CONSISTENT HASHING)
    # ─────────────────────────────────────────────────────────────────────────
    
    def assign_user_to_group(self, test_id: str, user_id: str) -> str:
        """
        Deterministically assign user to control or variant group
        Uses consistent hashing to ensure same user always gets same group
        """
        
        hash_input = f"{test_id}_{user_id}".encode()
        hash_value = int(hashlib.md5(hash_input).hexdigest(), 16)
        
        # 50/50 split
        group = "control" if hash_value % 2 == 0 else "variant"
        
        # Store assignment
        self.db.execute(
            text("""
                INSERT INTO ab_test_assignments (test_id, user_id, assigned_group)
                VALUES (:test_id, :user_id, :group)
                ON CONFLICT (test_id, user_id) DO UPDATE SET assigned_group = :group
            """),
            {"test_id": test_id, "user_id": user_id, "group": group}
        )
        self.db.commit()
        
        return group
    
    def get_user_test_group(self, test_id: str, user_id: str) -> str:
        """Get assigned group for user, assigning if needed"""
        
        assignment = self.db.execute(
            text("""
                SELECT assigned_group FROM ab_test_assignments
                WHERE test_id = :test_id AND user_id = :user_id
            """),
            {"test_id": test_id, "user_id": user_id}
        ).mappings().first()
        
        if assignment:
            return assignment['assigned_group']
        
        # Assign if not exists
        return self.assign_user_to_group(test_id, user_id)


if __name__ == "__main__":
    logger.info("A/B Testing Service initialized")
