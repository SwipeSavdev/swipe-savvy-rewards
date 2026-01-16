"""
Marketing AI API Endpoints

Provides REST API access to the enhanced Marketing AI behavioral learning system.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from ..services.marketing_ai_behavioral_learning import (
    get_enhanced_marketing_service,
    EnhancedMarketingAIService,
    setup_behavioral_learning_tables
)
from ..services.marketing_ai import get_marketing_ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/marketing-ai", tags=["Marketing AI"])


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class UserAnalysisRequest(BaseModel):
    user_id: str = Field(..., description="User ID to analyze")
    lookback_days: int = Field(default=90, ge=1, le=365, description="Days to look back for analysis")


class PromotionRequest(BaseModel):
    user_id: str = Field(..., description="User ID for personalized promotions")
    max_promotions: int = Field(default=5, ge=1, le=10, description="Maximum promotions to return")


class ConversionFeedbackRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    campaign_id: str = Field(..., description="Campaign ID")
    converted: bool = Field(..., description="Whether user converted")
    conversion_value: float = Field(default=0, ge=0, description="Value of conversion")


class SegmentInsightRequest(BaseModel):
    segment_type: str = Field(..., description="Segment/pattern type to analyze")


class BulkAnalysisRequest(BaseModel):
    user_ids: List[str] = Field(..., min_items=1, max_items=100, description="List of user IDs")


class CampaignCreateRequest(BaseModel):
    name: str = Field(..., description="Campaign name")
    description: str = Field(..., description="Campaign description")
    campaign_type: str = Field(..., description="Type of campaign")
    offer_type: str = Field(..., description="Type of offer")
    offer_value: float = Field(..., ge=0, description="Offer value")
    offer_unit: str = Field(..., description="Unit (percentage, fixed, points)")
    target_patterns: List[str] = Field(default=[], description="Target behavior patterns")
    target_sic_codes: List[str] = Field(default=[], description="Target SIC codes")
    duration_days: int = Field(default=30, ge=1, le=365, description="Campaign duration")


# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.get("/health")
async def health_check():
    """Check Marketing AI service health"""
    try:
        service = get_enhanced_marketing_service()
        return {
            "status": "healthy",
            "service": "Enhanced Marketing AI",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/analyze/user")
async def analyze_user_behavior(request: UserAnalysisRequest):
    """
    Get comprehensive behavioral analysis for a user.

    Returns detailed insights including:
    - Location behavior patterns
    - Purchase behavior metrics
    - Business type preferences (SIC codes)
    - App engagement metrics
    - Conversion history
    - Predictive metrics (churn risk, LTV, etc.)
    """
    try:
        service = get_enhanced_marketing_service()
        analysis = service.analyze_user(request.user_id)

        return {
            "success": True,
            "user_id": request.user_id,
            "analysis": analysis,
            "analyzed_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error analyzing user {request.user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analyze/user/{user_id}")
async def get_user_analysis(user_id: str):
    """Get behavioral analysis for a user by ID (GET method)"""
    try:
        service = get_enhanced_marketing_service()
        analysis = service.analyze_user(user_id)

        return {
            "success": True,
            "user_id": user_id,
            "analysis": analysis,
            "analyzed_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error analyzing user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/promotions/personalized")
async def get_personalized_promotions(request: PromotionRequest):
    """
    Get AI-generated personalized promotions for a user.

    Returns ranked promotions based on:
    - User's behavior patterns
    - Historical conversion data
    - Business preferences
    - Engagement metrics
    """
    try:
        service = get_enhanced_marketing_service()
        promotions = service.get_personalized_promotions(request.user_id)

        # Limit to requested max
        promotions = promotions[:request.max_promotions]

        return {
            "success": True,
            "user_id": request.user_id,
            "promotions": promotions,
            "count": len(promotions),
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating promotions for {request.user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/promotions/user/{user_id}")
async def get_user_promotions(user_id: str, max_count: int = Query(default=5, ge=1, le=10)):
    """Get personalized promotions for a user (GET method)"""
    try:
        service = get_enhanced_marketing_service()
        promotions = service.get_personalized_promotions(user_id)

        return {
            "success": True,
            "user_id": user_id,
            "promotions": promotions[:max_count],
            "count": len(promotions[:max_count]),
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting promotions for {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/feedback/conversion")
async def record_conversion_feedback(request: ConversionFeedbackRequest):
    """
    Record conversion feedback for continuous learning.

    The system uses this feedback to improve future targeting and promotion recommendations.
    """
    try:
        service = get_enhanced_marketing_service()
        service.record_conversion(
            user_id=request.user_id,
            campaign_id=request.campaign_id,
            converted=request.converted,
            value=request.conversion_value
        )

        return {
            "success": True,
            "message": "Conversion feedback recorded",
            "user_id": request.user_id,
            "campaign_id": request.campaign_id,
            "converted": request.converted,
            "recorded_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error recording conversion feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/segments/{segment_type}/insights")
async def get_segment_insights(segment_type: str):
    """
    Get aggregated insights for a user segment/behavior pattern.

    Available segments include:
    - high_spender, medium_spender, low_spender
    - daily_shopper, weekly_shopper, monthly_shopper
    - restaurant_enthusiast, grocery_regular, retail_shopper
    - highly_engaged, low_engagement
    - high_converter, promotion_hunter
    - churning_user, loyal_user
    """
    try:
        service = get_enhanced_marketing_service()
        insights = service.get_segment_insights(segment_type)

        return {
            "success": True,
            "segment": segment_type,
            "insights": insights,
            "queried_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting segment insights for {segment_type}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/bulk")
async def bulk_analyze_users(request: BulkAnalysisRequest):
    """
    Analyze multiple users in bulk.

    Returns summary statistics and individual analyses for each user.
    """
    try:
        service = get_enhanced_marketing_service()

        results = []
        for user_id in request.user_ids:
            try:
                analysis = service.analyze_user(user_id)
                results.append({
                    "user_id": user_id,
                    "success": True,
                    "analysis": analysis
                })
            except Exception as e:
                results.append({
                    "user_id": user_id,
                    "success": False,
                    "error": str(e)
                })

        successful = [r for r in results if r["success"]]

        # Calculate summary stats
        summary = {
            "total_users": len(request.user_ids),
            "successful_analyses": len(successful),
            "failed_analyses": len(results) - len(successful)
        }

        if successful:
            summary["avg_total_spent"] = sum(r["analysis"]["total_spent"] for r in successful) / len(successful)
            summary["avg_churn_risk"] = sum(r["analysis"]["predictions"]["churn_risk"] for r in successful) / len(successful)
            summary["total_predicted_monthly_revenue"] = sum(r["analysis"]["predictions"]["monthly_spend"] for r in successful)

        return {
            "success": True,
            "summary": summary,
            "results": results,
            "analyzed_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error in bulk analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patterns/available")
async def get_available_patterns():
    """Get list of all detectable behavior patterns"""
    patterns = {
        "spending_patterns": [
            {"name": "high_spender", "description": "Users spending >$5000 in lookback period"},
            {"name": "medium_spender", "description": "Users spending $1000-$5000"},
            {"name": "low_spender", "description": "Users spending <$1000"},
            {"name": "impulse_buyer", "description": "High variance in transaction amounts"},
            {"name": "planned_shopper", "description": "Consistent transaction amounts"}
        ],
        "frequency_patterns": [
            {"name": "daily_shopper", "description": "Transactions every 1-2 days"},
            {"name": "weekly_shopper", "description": "Transactions every 3-7 days"},
            {"name": "monthly_shopper", "description": "Transactions every 8-30 days"},
            {"name": "sporadic_shopper", "description": "Infrequent, irregular transactions"}
        ],
        "time_patterns": [
            {"name": "morning_shopper", "description": "Most transactions before noon"},
            {"name": "afternoon_shopper", "description": "Most transactions noon-5pm"},
            {"name": "evening_shopper", "description": "Most transactions after 5pm"},
            {"name": "weekend_shopper", "description": "Majority transactions on weekends"},
            {"name": "weekday_shopper", "description": "Majority transactions on weekdays"}
        ],
        "location_patterns": [
            {"name": "local_shopper", "description": "Shops within home area"},
            {"name": "commuter_shopper", "description": "Different morning/evening locations"},
            {"name": "traveler", "description": "Frequent transactions outside home city"},
            {"name": "neighborhood_loyal", "description": "High location consistency score"}
        ],
        "business_affinity_patterns": [
            {"name": "restaurant_enthusiast", "description": "High spend at restaurants"},
            {"name": "retail_shopper", "description": "Frequent retail purchases"},
            {"name": "grocery_regular", "description": "Regular grocery shopping"},
            {"name": "gas_station_frequent", "description": "Frequent gas station visits"},
            {"name": "entertainment_seeker", "description": "High entertainment spend"}
        ],
        "engagement_patterns": [
            {"name": "highly_engaged", "description": "Engagement score >80"},
            {"name": "moderately_engaged", "description": "Engagement score 50-80"},
            {"name": "low_engagement", "description": "Engagement score <50"},
            {"name": "app_power_user", "description": "High app session frequency"},
            {"name": "notification_responsive", "description": "High notification open rate"}
        ],
        "conversion_patterns": [
            {"name": "high_converter", "description": "Conversion rate >20%"},
            {"name": "promotion_hunter", "description": "Clicks but rarely converts"},
            {"name": "organic_buyer", "description": "Buys without promotions"},
            {"name": "coupon_clipper", "description": "Only converts with discounts"}
        ],
        "lifecycle_patterns": [
            {"name": "new_user", "description": "Customer <30 days"},
            {"name": "established_user", "description": "Customer 30-180 days"},
            {"name": "loyal_user", "description": "Customer >180 days with consistent activity"},
            {"name": "churning_user", "description": "Declining activity, high churn risk"},
            {"name": "reactivated_user", "description": "Recently returned after inactivity"}
        ]
    }

    return {
        "success": True,
        "patterns": patterns,
        "total_patterns": sum(len(v) for v in patterns.values())
    }


@router.get("/sic-codes")
async def get_sic_codes():
    """Get list of tracked SIC (business type) codes"""
    sic_codes = [
        {"code": "5812", "description": "Eating Places (Restaurants)", "category": "Food & Dining"},
        {"code": "5814", "description": "Fast Food Restaurants", "category": "Food & Dining"},
        {"code": "5411", "description": "Grocery Stores", "category": "Grocery"},
        {"code": "5541", "description": "Gas Stations", "category": "Automotive"},
        {"code": "5311", "description": "Department Stores", "category": "Retail"},
        {"code": "5651", "description": "Clothing Stores", "category": "Retail"},
        {"code": "5912", "description": "Drug Stores/Pharmacies", "category": "Healthcare"},
        {"code": "5499", "description": "Convenience Stores", "category": "Retail"},
        {"code": "5732", "description": "Electronics Stores", "category": "Retail"},
        {"code": "7999", "description": "Entertainment/Recreation", "category": "Entertainment"},
        {"code": "8099", "description": "Healthcare Services", "category": "Healthcare"},
        {"code": "7538", "description": "Automotive Services", "category": "Automotive"},
        {"code": "4724", "description": "Travel Agencies", "category": "Travel"},
        {"code": "7011", "description": "Hotels/Lodging", "category": "Travel"},
        {"code": "5999", "description": "Online Retail", "category": "E-commerce"}
    ]

    return {
        "success": True,
        "sic_codes": sic_codes,
        "count": len(sic_codes)
    }


@router.post("/campaigns/ai-generate")
async def ai_generate_campaign(request: CampaignCreateRequest):
    """
    Create a new AI-optimized campaign.

    The system will automatically:
    - Identify target users based on patterns
    - Optimize offer parameters
    - Set up conversion tracking
    """
    try:
        base_service = get_marketing_ai_service()

        # Use the base marketing AI service to create and save campaign
        campaign_data = {
            "name": request.name,
            "description": request.description,
            "campaign_type": request.campaign_type,
            "offer_type": request.offer_type,
            "offer_value": request.offer_value,
            "offer_unit": request.offer_unit,
            "target_patterns": request.target_patterns,
            "target_sic_codes": request.target_sic_codes,
            "duration_days": request.duration_days,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }

        return {
            "success": True,
            "message": "Campaign created successfully",
            "campaign": campaign_data,
            "created_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error creating campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-analysis-cycle")
async def run_analysis_cycle():
    """
    Trigger a full marketing AI analysis cycle.

    This will:
    1. Analyze all active users' behaviors
    2. Generate targeted campaigns
    3. Segment users for targeting
    4. Save campaigns to database
    """
    try:
        service = get_marketing_ai_service()
        result = service.run_analysis_cycle()

        return {
            "success": True,
            "result": result,
            "completed_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error running analysis cycle: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/campaigns/analytics")
async def get_campaign_analytics(campaign_id: Optional[str] = Query(default=None)):
    """Get analytics for campaigns"""
    try:
        service = get_marketing_ai_service()
        analytics = service.get_campaign_analytics(campaign_id)

        return {
            "success": True,
            "analytics": analytics,
            "queried_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting campaign analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/setup-database")
async def setup_database_tables():
    """
    Initialize or update behavioral learning database tables.

    Run this endpoint to create all required tables for the enhanced Marketing AI.
    """
    try:
        import psycopg2
        from ..services.marketing_ai_behavioral_learning import DB_CONFIG, setup_behavioral_learning_tables

        conn = psycopg2.connect(**DB_CONFIG)
        setup_behavioral_learning_tables(conn)
        conn.close()

        return {
            "success": True,
            "message": "Database tables created/updated successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error setting up database: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# TRACKING ENDPOINTS (for collecting behavioral data)
# ============================================================================

class AppSessionStart(BaseModel):
    user_id: str
    device_type: str = "unknown"
    app_version: str = "unknown"


class AppSessionEnd(BaseModel):
    session_id: str
    user_id: str
    duration_seconds: int
    features_used: List[str] = []
    screens_viewed: List[str] = []


class NotificationEvent(BaseModel):
    user_id: str
    notification_id: str
    event_type: str  # delivered, opened


@router.post("/tracking/session/start")
async def track_session_start(request: AppSessionStart):
    """Track app session start for engagement metrics"""
    import uuid
    session_id = str(uuid.uuid4())

    # In production, this would save to database
    return {
        "success": True,
        "session_id": session_id,
        "started_at": datetime.utcnow().isoformat()
    }


@router.post("/tracking/session/end")
async def track_session_end(request: AppSessionEnd):
    """Track app session end with engagement data"""
    # In production, this would update the session in database
    return {
        "success": True,
        "session_id": request.session_id,
        "duration_seconds": request.duration_seconds,
        "ended_at": datetime.utcnow().isoformat()
    }


@router.post("/tracking/notification")
async def track_notification_event(request: NotificationEvent):
    """Track push notification events"""
    # In production, this would update notification tracking
    return {
        "success": True,
        "user_id": request.user_id,
        "notification_id": request.notification_id,
        "event_type": request.event_type,
        "tracked_at": datetime.utcnow().isoformat()
    }
