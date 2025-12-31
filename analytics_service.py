"""
Campaign Analytics Service
Purpose: Aggregate, analyze, and optimize campaign performance data
Tech: Python, NumPy/SciPy, PostgreSQL
Created: December 26, 2025
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from decimal import Decimal
import json
import logging
import math
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# ═════════════════════════════════════════════════════════════════════════════
# DATA MODELS
# ═════════════════════════════════════════════════════════════════════════════

@dataclass
class CampaignMetrics:
    """Campaign performance metrics"""
    campaign_id: str
    campaign_type: str
    impressions: int
    views: int
    clicks: int
    conversions: int
    revenue: float
    cost: float
    
    # Calculated metrics
    view_rate: float  # views / impressions
    click_through_rate: float  # clicks / views
    conversion_rate: float  # conversions / clicks
    revenue_per_impression: float
    cost_per_acquisition: float
    return_on_ad_spend: float  # revenue / cost
    
    # Time data
    start_date: datetime
    end_date: datetime
    days_active: int


@dataclass
class SegmentPerformance:
    """Performance by user segment"""
    segment_name: str
    user_count: int
    conversion_rate: float
    average_revenue_per_user: float
    engagement_score: float


@dataclass
class ABTestResult:
    """A/B test comparison results"""
    test_id: str
    control_campaign_id: str
    variant_campaign_id: str
    
    control_conversions: int
    variant_conversions: int
    control_conversion_rate: float
    variant_conversion_rate: float
    
    improvement_percentage: float
    statistical_significance: float  # p-value
    confidence_level: str  # "95%", "99%", etc
    winner: str  # "control" or "variant"
    recommendation: str


# ═════════════════════════════════════════════════════════════════════════════
# ANALYTICS SERVICE
# ═════════════════════════════════════════════════════════════════════════════

class AnalyticsService:
    """Main analytics aggregation and analysis service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ─────────────────────────────────────────────────────────────────────────
    # CAMPAIGN METRICS
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_campaign_metrics(
        self,
        campaign_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> CampaignMetrics:
        """
        Aggregate campaign performance metrics
        
        Args:
            campaign_id: Campaign identifier
            start_date: Filter start date (default: campaign start)
            end_date: Filter end date (default: today)
        """
        
        # Get campaign info
        campaign = self.db.execute(
            text("""
                SELECT id, campaign_id, campaign_type, title, cost,
                       start_date, end_date, is_active
                FROM campaigns
                WHERE campaign_id = :campaign_id
            """),
            {"campaign_id": campaign_id}
        ).mappings().first()
        
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")
        
        # Use campaign dates if not provided
        start = start_date or campaign['start_date']
        end = end_date or campaign['end_date']
        
        # Get view and conversion data
        metrics = self.db.execute(
            text("""
                SELECT 
                    COUNT(DISTINCT cv.id) as views,
                    COUNT(DISTINCT CASE WHEN cc.id IS NOT NULL THEN cv.id END) as conversions,
                    COALESCE(SUM(cc.conversion_amount), 0) as revenue
                FROM campaign_views cv
                LEFT JOIN campaign_conversions cc ON cv.id = cc.view_id
                WHERE cv.campaign_id = :campaign_id
                  AND cv.created_at >= :start_date
                  AND cv.created_at <= :end_date
            """),
            {
                "campaign_id": campaign['id'],
                "start_date": start,
                "end_date": end
            }
        ).mappings().first()
        
        # Get impressions (may be from user_segments or estimated)
        impressions_result = self.db.execute(
            text("""
                SELECT COUNT(DISTINCT user_id) as impression_count
                FROM campaign_impressions
                WHERE campaign_id = :campaign_id
                  AND created_at >= :start_date
                  AND created_at <= :end_date
            """),
            {
                "campaign_id": campaign['id'],
                "start_date": start,
                "end_date": end
            }
        ).mappings().first()
        
        views = metrics['views'] or 0
        conversions = metrics['conversions'] or 0
        revenue = float(metrics['revenue'] or 0)
        impressions = impressions_result['impression_count'] or max(views * 3, 100)
        cost = float(campaign['cost'] or 0)
        
        # Calculate rates
        view_rate = views / impressions if impressions > 0 else 0
        ctr = 1.0 if views == 0 else 1.0  # Simplified: assume all views are clicks
        conversion_rate = conversions / views if views > 0 else 0
        rpi = revenue / impressions if impressions > 0 else 0
        cpa = cost / conversions if conversions > 0 else cost
        roas = revenue / cost if cost > 0 else 0
        
        days_active = (end - start).days + 1
        
        return CampaignMetrics(
            campaign_id=campaign['campaign_id'],
            campaign_type=campaign['campaign_type'],
            impressions=impressions,
            views=views,
            clicks=views,  # Simplified
            conversions=conversions,
            revenue=revenue,
            cost=cost,
            view_rate=round(view_rate, 4),
            click_through_rate=round(ctr, 4),
            conversion_rate=round(conversion_rate, 4),
            revenue_per_impression=round(rpi, 4),
            cost_per_acquisition=round(cpa, 2),
            return_on_ad_spend=round(roas, 2),
            start_date=start,
            end_date=end,
            days_active=days_active
        )
    
    def get_campaign_performance_by_segment(
        self,
        campaign_id: str
    ) -> List[SegmentPerformance]:
        """Get campaign performance broken down by user segment"""
        
        campaign = self.db.execute(
            text("SELECT id FROM campaigns WHERE campaign_id = :campaign_id"),
            {"campaign_id": campaign_id}
        ).mappings().first()
        
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")
        
        segments = self.db.execute(
            text("""
                SELECT 
                    us.segment_name,
                    COUNT(DISTINCT us.user_id) as user_count,
                    COUNT(DISTINCT cc.id) as conversions,
                    COUNT(DISTINCT cv.id) as views,
                    COALESCE(SUM(cc.conversion_amount), 0) as revenue
                FROM user_segments us
                LEFT JOIN campaign_views cv ON us.user_id = cv.user_id
                    AND cv.campaign_id = :campaign_id
                LEFT JOIN campaign_conversions cc ON cv.id = cc.view_id
                WHERE us.segment_name IS NOT NULL
                GROUP BY us.segment_name
            """),
            {"campaign_id": campaign['id']}
        ).mappings().all()
        
        results = []
        for seg in segments:
            views = seg['views'] or 0
            conversions = seg['conversions'] or 0
            revenue = float(seg['revenue'] or 0)
            user_count = seg['user_count'] or 1
            
            conv_rate = conversions / views if views > 0 else 0
            arpu = revenue / user_count if user_count > 0 else 0
            
            # Simple engagement score (0-100)
            engagement = min(100, (conv_rate * 100) + (views / max(user_count, 1) * 10))
            
            results.append(SegmentPerformance(
                segment_name=seg['segment_name'],
                user_count=user_count,
                conversion_rate=round(conv_rate, 4),
                average_revenue_per_user=round(arpu, 2),
                engagement_score=round(engagement, 2)
            ))
        
        return sorted(results, key=lambda x: x.conversion_rate, reverse=True)
    
    def get_campaign_trend(
        self,
        campaign_id: str,
        interval: str = 'daily'  # daily, weekly, monthly
    ) -> List[Dict]:
        """
        Get campaign performance trend over time
        
        Args:
            campaign_id: Campaign identifier
            interval: Time interval for grouping
        """
        
        campaign = self.db.execute(
            text("SELECT id FROM campaigns WHERE campaign_id = :campaign_id"),
            {"campaign_id": campaign_id}
        ).mappings().first()
        
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")
        
        # Determine date truncation
        truncate = {
            'daily': "DATE(cv.created_at)",
            'weekly': "DATE_TRUNC('week', cv.created_at)",
            'monthly': "DATE_TRUNC('month', cv.created_at)"
        }.get(interval, "DATE(cv.created_at)")
        
        trends = self.db.execute(
            text(f"""
                SELECT 
                    {truncate} as period,
                    COUNT(DISTINCT cv.id) as views,
                    COUNT(DISTINCT cc.id) as conversions,
                    COALESCE(SUM(cc.conversion_amount), 0) as revenue
                FROM campaign_views cv
                LEFT JOIN campaign_conversions cc ON cv.id = cc.view_id
                WHERE cv.campaign_id = :campaign_id
                GROUP BY {truncate}
                ORDER BY period
            """),
            {"campaign_id": campaign['id']}
        ).mappings().all()
        
        results = []
        for trend in trends:
            views = trend['views'] or 0
            conversions = trend['conversions'] or 0
            revenue = float(trend['revenue'] or 0)
            
            results.append({
                'period': trend['period'].isoformat() if trend['period'] else None,
                'views': views,
                'conversions': conversions,
                'revenue': round(revenue, 2),
                'conversion_rate': round(conversions / views if views > 0 else 0, 4)
            })
        
        return results
    
    def get_campaign_roi_analysis(
        self,
        campaign_id: str
    ) -> Dict:
        """Calculate detailed ROI analysis"""
        
        metrics = self.get_campaign_metrics(campaign_id)
        
        # Cost breakdown
        total_cost = metrics.cost
        cost_per_view = total_cost / metrics.views if metrics.views > 0 else 0
        cost_per_conversion = metrics.cost_per_acquisition
        
        # Revenue analysis
        total_revenue = metrics.revenue
        profit = total_revenue - total_cost
        profit_margin = (profit / total_revenue * 100) if total_revenue > 0 else 0
        
        # Breakeven analysis
        breakeven_conversions = math.ceil(total_cost / (total_revenue / metrics.conversions if metrics.conversions > 0 else 1))
        
        return {
            'campaign_id': metrics.campaign_id,
            'campaign_type': metrics.campaign_type,
            'total_cost': round(total_cost, 2),
            'total_revenue': round(total_revenue, 2),
            'profit': round(profit, 2),
            'profit_margin_percent': round(profit_margin, 2),
            'roas': metrics.return_on_ad_spend,
            'cost_per_view': round(cost_per_view, 4),
            'cost_per_conversion': round(cost_per_conversion, 2),
            'breakeven_conversions': breakeven_conversions,
            'current_conversions': metrics.conversions,
            'days_to_breakeven': breakeven_conversions / (metrics.conversions / metrics.days_active) if metrics.conversions > 0 else float('inf')
        }
    
    # ─────────────────────────────────────────────────────────────────────────
    # AGGREGATED ANALYTICS
    # ─────────────────────────────────────────────────────────────────────────
    
    def get_portfolio_performance(self, days: int = 30) -> Dict:
        """Get overall performance across all active campaigns"""
        
        since = datetime.utcnow() - timedelta(days=days)
        
        portfolio = self.db.execute(
            text("""
                SELECT 
                    COUNT(DISTINCT c.id) as total_campaigns,
                    COUNT(DISTINCT CASE WHEN c.is_active THEN c.id END) as active_campaigns,
                    SUM(c.cost) as total_spend,
                    COUNT(DISTINCT cv.id) as total_views,
                    COUNT(DISTINCT cc.id) as total_conversions,
                    COALESCE(SUM(cc.conversion_amount), 0) as total_revenue,
                    COALESCE(SUM(cc.conversion_amount), 0) - SUM(c.cost) as net_profit
                FROM campaigns c
                LEFT JOIN campaign_views cv ON c.id = cv.campaign_id
                    AND cv.created_at >= :since
                LEFT JOIN campaign_conversions cc ON cv.id = cc.view_id
                WHERE c.created_at >= :since
            """),
            {"since": since}
        ).mappings().first()
        
        total_spend = float(portfolio['total_spend'] or 0)
        total_revenue = float(portfolio['total_revenue'] or 0)
        total_conversions = portfolio['total_conversions'] or 0
        
        return {
            'days': days,
            'total_campaigns': portfolio['total_campaigns'] or 0,
            'active_campaigns': portfolio['active_campaigns'] or 0,
            'total_spend': round(total_spend, 2),
            'total_revenue': round(total_revenue, 2),
            'net_profit': round(total_revenue - total_spend, 2),
            'total_conversions': total_conversions,
            'average_roas': round(total_revenue / total_spend if total_spend > 0 else 0, 2),
            'conversions_per_campaign': round(total_conversions / max(portfolio['active_campaigns'] or 1, 1), 1)
        }
    
    def get_top_performing_campaigns(self, metric: str = 'roas', limit: int = 10) -> List[Dict]:
        """Get top performing campaigns by specified metric"""
        
        valid_metrics = ['roas', 'conversion_rate', 'revenue', 'efficiency_score']
        if metric not in valid_metrics:
            raise ValueError(f"Invalid metric: {metric}")
        
        campaigns = self.db.execute(
            text("""
                SELECT 
                    c.campaign_id,
                    c.campaign_type,
                    c.title,
                    c.cost,
                    COUNT(DISTINCT cv.id) as views,
                    COUNT(DISTINCT cc.id) as conversions,
                    COALESCE(SUM(cc.conversion_amount), 0) as revenue
                FROM campaigns c
                LEFT JOIN campaign_views cv ON c.id = cv.campaign_id
                LEFT JOIN campaign_conversions cc ON cv.id = cc.view_id
                WHERE c.is_active = TRUE
                GROUP BY c.id, c.campaign_id, c.campaign_type, c.title, c.cost
                HAVING COUNT(DISTINCT cv.id) > 0
            """)
        ).mappings().all()
        
        results = []
        for camp in campaigns:
            views = camp['views'] or 0
            conversions = camp['conversions'] or 0
            revenue = float(camp['revenue'] or 0)
            cost = float(camp['cost'] or 0)
            
            conv_rate = conversions / views if views > 0 else 0
            roas = revenue / cost if cost > 0 else 0
            efficiency = (conversions / views) * (revenue / max(cost, 1)) if views > 0 else 0
            
            sort_value = {
                'roas': roas,
                'conversion_rate': conv_rate,
                'revenue': revenue,
                'efficiency_score': efficiency
            }[metric]
            
            results.append({
                'campaign_id': camp['campaign_id'],
                'campaign_type': camp['campaign_type'],
                'title': camp['title'],
                'views': views,
                'conversions': conversions,
                'revenue': round(revenue, 2),
                'cost': round(cost, 2),
                'roas': round(roas, 2),
                'conversion_rate': round(conv_rate, 4),
                'efficiency_score': round(efficiency, 2),
                'sort_metric_value': sort_value
            })
        
        results.sort(key=lambda x: x['sort_metric_value'], reverse=True)
        return results[:limit]
    
    # ─────────────────────────────────────────────────────────────────────────
    # COMPARISON & COHORT ANALYSIS
    # ─────────────────────────────────────────────────────────────────────────
    
    def compare_campaigns(self, campaign_ids: List[str]) -> List[Dict]:
        """Compare multiple campaigns side-by-side"""
        
        results = []
        for camp_id in campaign_ids:
            try:
                metrics = self.get_campaign_metrics(camp_id)
                roi = self.get_campaign_roi_analysis(camp_id)
                
                results.append({
                    'campaign_id': camp_id,
                    'views': metrics.views,
                    'conversions': metrics.conversions,
                    'conversion_rate': metrics.conversion_rate,
                    'revenue': round(metrics.revenue, 2),
                    'cost': round(metrics.cost, 2),
                    'roas': metrics.return_on_ad_spend,
                    'roi': roi
                })
            except ValueError:
                continue
        
        return results
    
    def get_cohort_performance(self, cohort_date: datetime) -> Dict:
        """Analyze performance for users acquired on specific date"""
        
        next_date = cohort_date + timedelta(days=1)
        
        cohort = self.db.execute(
            text("""
                SELECT 
                    COUNT(DISTINCT u.id) as cohort_size,
                    COUNT(DISTINCT cv.id) as views,
                    COUNT(DISTINCT cc.id) as conversions,
                    COALESCE(SUM(cc.conversion_amount), 0) as revenue
                FROM users u
                LEFT JOIN campaign_views cv ON u.id = cv.user_id
                LEFT JOIN campaign_conversions cc ON cv.id = cc.view_id
                WHERE DATE(u.created_at) = :cohort_date
                  AND (cc.created_at IS NULL OR DATE(cc.created_at) <= DATE(NOW() + INTERVAL '7 days'))
            """),
            {"cohort_date": cohort_date.date()}
        ).mappings().first()
        
        cohort_size = cohort['cohort_size'] or 1
        views = cohort['views'] or 0
        conversions = cohort['conversions'] or 0
        revenue = float(cohort['revenue'] or 0)
        
        return {
            'cohort_date': cohort_date.date().isoformat(),
            'cohort_size': cohort_size,
            'total_views': views,
            'total_conversions': conversions,
            'total_revenue': round(revenue, 2),
            'views_per_user': round(views / cohort_size, 2),
            'conversion_rate': round(conversions / views if views > 0 else 0, 4),
            'revenue_per_user': round(revenue / cohort_size, 2)
        }


if __name__ == "__main__":
    logger.info("Analytics Service initialized")
