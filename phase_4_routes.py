"""
Phase 4 API Routes
Purpose: FastAPI endpoints for analytics, A/B testing, and ML optimization
Tech: FastAPI, Python
Created: December 26, 2025
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from analytics_service import AnalyticsService
from ab_testing_service import ABTestingService
from ml_optimizer import MLOptimizationService

# Database dependency (adjust import based on your setup)
# from database import get_db

router = APIRouter(prefix="/api", tags=["analytics"])

# ═════════════════════════════════════════════════════════════════════════════
# DEPENDENCY INJECTION
# ═════════════════════════════════════════════════════════════════════════════

def get_analytics_service(db: Session = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(db)

def get_ab_service(db: Session = Depends(get_db)) -> ABTestingService:
    return ABTestingService(db)

def get_ml_service(db: Session = Depends(get_db)) -> MLOptimizationService:
    return MLOptimizationService(db)

# ═════════════════════════════════════════════════════════════════════════════
# ANALYTICS ENDPOINTS (6)
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/analytics/campaign/{campaign_id}/metrics")
async def get_campaign_metrics(
    campaign_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    analytics: AnalyticsService = Depends(get_analytics_service)
):
    """
    Get comprehensive metrics for a specific campaign
    
    Returns:
    - Views, conversions, revenue, cost
    - Calculated rates: view rate, CTR, conversion rate
    - Financial metrics: ROAS, CPA, profit margin
    """
    try:
        start = datetime.fromisoformat(start_date) if start_date else None
        end = datetime.fromisoformat(end_date) if end_date else None
        
        metrics = analytics.get_campaign_metrics(campaign_id, start, end)
        
        return {
            "campaign_id": metrics.campaign_id,
            "campaign_type": metrics.campaign_type,
            "period": {
                "start_date": metrics.start_date.isoformat(),
                "end_date": metrics.end_date.isoformat(),
                "days_active": metrics.days_active
            },
            "impressions": metrics.impressions,
            "views": metrics.views,
            "conversions": metrics.conversions,
            "revenue": metrics.revenue,
            "cost": metrics.cost,
            "rates": {
                "view_rate": metrics.view_rate,
                "click_through_rate": metrics.click_through_rate,
                "conversion_rate": metrics.conversion_rate,
                "revenue_per_impression": metrics.revenue_per_impression,
                "cost_per_acquisition": metrics.cost_per_acquisition,
                "return_on_ad_spend": metrics.return_on_ad_spend
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/campaign/{campaign_id}/segments")
async def get_campaign_segments(
    campaign_id: str,
    analytics: AnalyticsService = Depends(get_analytics_service)
):
    """Get campaign performance broken down by user segment"""
    try:
        segments = analytics.get_campaign_performance_by_segment(campaign_id)
        
        return {
            "campaign_id": campaign_id,
            "segments": [
                {
                    "segment_name": seg.segment_name,
                    "user_count": seg.user_count,
                    "conversion_rate": seg.conversion_rate,
                    "average_revenue_per_user": seg.average_revenue_per_user,
                    "engagement_score": seg.engagement_score
                }
                for seg in segments
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/campaign/{campaign_id}/trends")
async def get_campaign_trends(
    campaign_id: str,
    interval: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    analytics: AnalyticsService = Depends(get_analytics_service)
):
    """
    Get campaign performance trends over time
    
    Intervals: daily, weekly, monthly
    Returns: Views, conversions, revenue, conversion rate per period
    """
    try:
        trends = analytics.get_campaign_trend(campaign_id, interval)
        
        return {
            "campaign_id": campaign_id,
            "interval": interval,
            "trends": trends
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/campaign/{campaign_id}/roi")
async def get_campaign_roi(
    campaign_id: str,
    analytics: AnalyticsService = Depends(get_analytics_service)
):
    """Get detailed ROI analysis for campaign"""
    try:
        roi = analytics.get_campaign_roi_analysis(campaign_id)
        
        return {
            "campaign_id": roi['campaign_id'],
            "campaign_type": roi['campaign_type'],
            "financial": {
                "total_cost": roi['total_cost'],
                "total_revenue": roi['total_revenue'],
                "profit": roi['profit'],
                "profit_margin_percent": roi['profit_margin_percent']
            },
            "efficiency": {
                "roas": roi['roas'],
                "cost_per_view": roi['cost_per_view'],
                "cost_per_conversion": roi['cost_per_conversion']
            },
            "breakeven": {
                "conversions_required": roi['breakeven_conversions'],
                "current_conversions": roi['current_conversions'],
                "days_to_breakeven": roi['days_to_breakeven']
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/portfolio")
async def get_portfolio_performance(
    days: int = Query(30, ge=1, le=365),
    analytics: AnalyticsService = Depends(get_analytics_service)
):
    """Get overall portfolio performance across all campaigns"""
    try:
        portfolio = analytics.get_portfolio_performance(days)
        
        return {
            "period_days": days,
            "campaigns": {
                "total": portfolio['total_campaigns'],
                "active": portfolio['active_campaigns']
            },
            "financial": {
                "total_spend": portfolio['total_spend'],
                "total_revenue": portfolio['total_revenue'],
                "net_profit": portfolio['net_profit']
            },
            "metrics": {
                "total_conversions": portfolio['total_conversions'],
                "average_roas": portfolio['average_roas'],
                "conversions_per_campaign": portfolio['conversions_per_campaign']
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/top-campaigns")
async def get_top_campaigns(
    metric: str = Query("roas", regex="^(roas|conversion_rate|revenue|efficiency_score)$"),
    limit: int = Query(10, ge=1, le=50),
    analytics: AnalyticsService = Depends(get_analytics_service)
):
    """Get top performing campaigns ranked by specified metric"""
    try:
        campaigns = analytics.get_top_performing_campaigns(metric, limit)
        
        return {
            "metric": metric,
            "limit": limit,
            "campaigns": [
                {
                    "campaign_id": camp['campaign_id'],
                    "campaign_type": camp['campaign_type'],
                    "title": camp['title'],
                    "views": camp['views'],
                    "conversions": camp['conversions'],
                    "revenue": camp['revenue'],
                    "cost": camp['cost'],
                    "roas": camp['roas'],
                    "conversion_rate": camp['conversion_rate'],
                    "efficiency_score": camp['efficiency_score']
                }
                for camp in campaigns
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ═════════════════════════════════════════════════════════════════════════════
# A/B TESTING ENDPOINTS (6)
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/ab-tests/create")
async def create_ab_test(
    test_name: str,
    control_campaign_id: str,
    variant_campaign_id: str,
    target_sample_size: int = 1000,
    confidence_level: float = 0.95,
    minimum_effect_size: float = 0.10,
    ab_service: ABTestingService = Depends(get_ab_service)
):
    """
    Create new A/B test
    
    confidence_level: 0.90, 0.95, or 0.99
    minimum_effect_size: Expected minimum improvement (e.g., 0.10 = 10%)
    """
    try:
        test = ab_service.create_test(
            test_name=test_name,
            control_campaign_id=control_campaign_id,
            variant_campaign_id=variant_campaign_id,
            target_sample_size=target_sample_size,
            confidence_level=confidence_level,
            minimum_effect_size=minimum_effect_size
        )
        
        return {
            "test_id": test.test_id,
            "test_name": test.test_name,
            "control_campaign_id": test.control_campaign_id,
            "variant_campaign_id": test.variant_campaign_id,
            "start_date": test.start_date.isoformat(),
            "target_sample_size": test.target_sample_size,
            "confidence_level": test.confidence_level,
            "minimum_effect_size": test.minimum_effect_size,
            "is_active": test.is_active
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ab-tests/{test_id}/status")
async def get_test_status(
    test_id: str,
    ab_service: ABTestingService = Depends(get_ab_service)
):
    """Get current test status and progress"""
    try:
        status = ab_service.get_test_status(test_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/ab-tests/{test_id}/analyze")
async def analyze_ab_test(
    test_id: str,
    ab_service: ABTestingService = Depends(get_ab_service)
):
    """Perform statistical analysis on test results"""
    try:
        result = ab_service.analyze_test(test_id)
        
        return {
            "test_id": test_id,
            "test_name": result.test_name,
            "control": {
                "campaign_id": result.control_metrics.group_name,
                "users": result.control_metrics.total_users,
                "conversions": result.control_metrics.total_conversions,
                "conversion_rate": result.control_metrics.conversion_rate,
                "revenue": result.control_metrics.total_revenue
            },
            "variant": {
                "campaign_id": result.variant_metrics.group_name,
                "users": result.variant_metrics.total_users,
                "conversions": result.variant_metrics.total_conversions,
                "conversion_rate": result.variant_metrics.conversion_rate,
                "revenue": result.variant_metrics.total_revenue
            },
            "analysis": {
                "conversion_rate_difference": result.conversion_rate_difference,
                "improvement_percentage": result.improvement_percentage,
                "p_value": result.p_value,
                "is_significant": result.is_significant,
                "confidence_level": result.confidence_level,
                "statistical_power": result.statistical_power,
                "required_sample_size": result.required_sample_size
            },
            "results": {
                "winner": result.winner,
                "recommendation": result.recommendation
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/ab-tests/{test_id}/end")
async def end_ab_test(
    test_id: str,
    ab_service: ABTestingService = Depends(get_ab_service)
):
    """End test and return final results"""
    try:
        result = ab_service.end_test(test_id)
        
        return {
            "test_id": test_id,
            "status": "completed",
            "winner": result.winner,
            "recommendation": result.recommendation,
            "improvement_percentage": result.improvement_percentage,
            "p_value": result.p_value,
            "is_significant": result.is_significant
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ab-tests/assign-user/{test_id}/{user_id}")
async def assign_user_to_test(
    test_id: str,
    user_id: str,
    ab_service: ABTestingService = Depends(get_ab_service)
):
    """Get assigned group for user (deterministic consistent hashing)"""
    try:
        group = ab_service.get_user_test_group(test_id, user_id)
        
        return {
            "test_id": test_id,
            "user_id": user_id,
            "assigned_group": group
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ab-tests/history")
async def get_ab_test_history(
    limit: int = Query(10, ge=1, le=100),
    ab_service: ABTestingService = Depends(get_ab_service)
):
    """Get history of completed A/B tests"""
    try:
        history = ab_service.get_test_history(limit)
        
        return {
            "limit": limit,
            "tests": history
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ═════════════════════════════════════════════════════════════════════════════
# ML OPTIMIZATION ENDPOINTS (8+)
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/optimize/train-model")
async def train_ml_model(
    model_name: str = "conversion",
    ml_service: MLOptimizationService = Depends(get_ml_service)
):
    """Train ML conversion prediction model on historical data"""
    try:
        result = ml_service.train_conversion_model(model_name)
        
        return {
            "model_name": model_name,
            "status": result.get('status'),
            "training_metrics": {
                "r2_score": result.get('r2_score'),
                "mae": result.get('mae'),
                "samples": result.get('samples')
            },
            "feature_importance": result.get('feature_importance'),
            "message": result.get('message')
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/optimize/offer/{campaign_id}")
async def optimize_offer(
    campaign_id: str,
    ml_service: MLOptimizationService = Depends(get_ml_service)
):
    """Get recommended offer amount for campaign"""
    try:
        # Get campaign details first
        campaign = ml_service.db.execute(
            "SELECT campaign_type, merchant_id, offer_amount FROM campaigns WHERE campaign_id = %s",
            (campaign_id,)
        ).mappings().first()
        
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        optimization = ml_service.optimize_offer_amount(
            campaign_type=campaign['campaign_type'],
            merchant_id=campaign['merchant_id'],
            current_offer=float(campaign['offer_amount'] or 0),
            current_conversion_rate=0.15  # Default, could be fetched from analytics
        )
        
        return {
            "campaign_id": campaign_id,
            "current_offer": campaign['offer_amount'],
            "recommendation": {
                "offer_amount": optimization.offer_amount,
                "offer_type": optimization.offer_type,
                "optimal_frequency": optimization.optimal_frequency,
                "predicted_conversion_rate": optimization.predicted_conversion_rate,
                "confidence": optimization.confidence
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/optimize/send-time/{user_id}")
async def optimize_send_time(
    user_id: str,
    campaign_type: str = "LOCATION_DEAL",
    ml_service: MLOptimizationService = Depends(get_ml_service)
):
    """Get optimal send time for user"""
    try:
        send_time = ml_service.optimize_send_time(user_id, campaign_type)
        
        return {
            "user_id": user_id,
            "campaign_type": campaign_type,
            "optimal_timing": {
                "optimal_hour": send_time['optimal_hour'],
                "optimal_window": send_time['optimal_window'],
                "expected_conversion_rate": send_time['expected_conversion_rate'],
                "confidence": send_time['confidence']
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/optimize/affinity/{user_id}")
async def get_merchant_affinity(
    user_id: str,
    limit: int = Query(10, ge=1, le=50),
    ml_service: MLOptimizationService = Depends(get_ml_service)
):
    """Get merchant affinity recommendations for user"""
    try:
        affinity = ml_service.get_merchant_affinity(user_id, limit)
        
        return {
            "user_id": user_id,
            "limit": limit,
            "merchants": [
                {
                    "merchant_id": m['merchant_id'],
                    "merchant_name": m['merchant_name'],
                    "category_id": m['category_id'],
                    "rating": m['rating'],
                    "affinity_score": m['affinity_score'],
                    "recommendation_reason": m['recommendation_reason']
                }
                for m in affinity
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/optimize/recommendations/{campaign_id}")
async def get_campaign_recommendations(
    campaign_id: str,
    ml_service: MLOptimizationService = Depends(get_ml_service)
):
    """Get optimization recommendations for campaign"""
    try:
        recommendations = ml_service.get_optimization_recommendations(campaign_id)
        
        return {
            "campaign_id": campaign_id,
            "recommendations": [
                {
                    "type": rec.recommendation_type,
                    "current_value": rec.current_value,
                    "recommended_value": rec.recommended_value,
                    "confidence_score": rec.confidence_score,
                    "expected_improvement": f"{rec.expected_improvement}%",
                    "reason": rec.reason
                }
                for rec in recommendations
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/optimize/segments/{campaign_id}")
async def get_segment_recommendations(
    campaign_id: str,
    ml_service: MLOptimizationService = Depends(get_ml_service)
):
    """Get segment performance rankings for campaign type"""
    try:
        segments = ml_service.get_segment_recommendations(campaign_id)
        
        return {
            "campaign_id": campaign_id,
            "segments": [
                {
                    "segment": seg['segment'],
                    "conversion_rate": seg['conversion_rate'],
                    "recommendation_strength": seg['recommendation_strength']
                }
                for seg in segments
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ═════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/phase4/health")
async def phase4_health():
    """Health check for Phase 4 services"""
    return {
        "status": "operational",
        "version": "1.0",
        "services": {
            "analytics": "ready",
            "ab_testing": "ready",
            "ml_optimization": "ready"
        },
        "endpoints": {
            "analytics": 6,
            "ab_testing": 6,
            "optimization": 8
        },
        "timestamp": datetime.utcnow().isoformat()
    }

# ═════════════════════════════════════════════════════════════════════════════
# INITIALIZATION
# ═════════════════════════════════════════════════════════════════════════════

def setup_phase4_routes(app):
    """
    Setup Phase 4 routes in FastAPI app
    
    Usage in main.py:
        from phase_4_routes import setup_phase4_routes
        setup_phase4_routes(app)
    """
    app.include_router(router)
    print("✅ Phase 4 routes initialized (20+ endpoints)")
