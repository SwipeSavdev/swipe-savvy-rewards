"""
Marketing AI REST API Routes

Endpoints for managing marketing campaigns, viewing analytics, 
and managing user segmentation
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any, List
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import json
import os
from pydantic import BaseModel

from app.services.marketing_ai import get_marketing_ai_service
from app.scheduler.marketing_jobs import schedule_marketing_analysis_now, schedule_campaign_cleanup_now

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketing", tags=["marketing"])

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "swipesavvy_agents"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "password"),
}


def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)


@router.get("/campaigns")
async def list_campaigns(
    status: Optional[str] = Query(None),
    campaign_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
) -> Dict[str, Any]:
    """
    List marketing campaigns with filters
    
    Query params:
    - status: Filter by campaign status (active, expired, paused)
    - campaign_type: Filter by campaign type
    - limit: Number of results (default: 50)
    - offset: Pagination offset (default: 0)
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = "SELECT * FROM ai_campaigns WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = %s"
            params.append(status)
        
        if campaign_type:
            query += " AND campaign_type = %s"
            params.append(campaign_type)
        
        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        campaigns = cursor.fetchall()
        
        # Get total count
        count_query = "SELECT COUNT(*) FROM ai_campaigns WHERE 1=1"
        count_params = []
        
        if status:
            count_query += " AND status = %s"
            count_params.append(status)
        
        if campaign_type:
            count_query += " AND campaign_type = %s"
            count_params.append(campaign_type)
        
        cursor.execute(count_query, count_params)
        total_count = cursor.fetchone()['count']
        
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "campaigns": [dict(c) for c in campaigns]
        }
    
    except Exception as e:
        logger.error(f"Error listing campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: int) -> Dict[str, Any]:
    """Get detailed campaign information with analytics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get campaign
        query = """
        SELECT 
            mc.*,
            COUNT(DISTINCT ct.user_id) as total_targets,
            COUNT(DISTINCT CASE WHEN ct.status = 'eligible' THEN ct.user_id END) as eligible_targets,
            COUNT(DISTINCT CASE WHEN ct.status = 'viewed' THEN ct.user_id END) as viewed_count,
            COUNT(DISTINCT CASE WHEN ct.status = 'converted' THEN ct.user_id END) as converted_count
        FROM ai_campaigns mc
        LEFT JOIN campaign_targets ct ON mc.campaign_id = ct.campaign_id
        WHERE mc.campaign_id = %s
        GROUP BY mc.campaign_id
        """
        
        cursor.execute(query, (campaign_id,))
        campaign = cursor.fetchone()
        
        if not campaign:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Get top targeting patterns
        pattern_query = """
        SELECT 
            ct.status,
            COUNT(*) as count,
            COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
        FROM campaign_targets ct
        WHERE ct.campaign_id = %s
        GROUP BY ct.status
        """
        
        cursor.execute(pattern_query, (campaign_id,))
        status_breakdown = [dict(row) for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        result = dict(campaign)
        result['status_breakdown'] = status_breakdown
        result['conversion_rate'] = (
            result['converted_count'] / result['total_targets'] * 100
            if result['total_targets'] > 0 else 0
        )
        
        return {
            "status": "success",
            "campaign": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/segments")
async def list_user_segments(
    min_size: int = Query(0),
    limit: int = Query(50)
) -> Dict[str, Any]:
    """
    List user segments based on detected behavior patterns
    
    Query params:
    - min_size: Minimum segment size (default: 0)
    - limit: Number of results (default: 50)
    """
    try:
        service = get_marketing_ai_service()
        behaviors = service.analyzer.get_all_user_behaviors(limit=1000)
        
        # Aggregate patterns
        from collections import defaultdict
        from enum import Enum
        
        pattern_segments = defaultdict(list)
        for behavior in behaviors:
            for pattern in behavior.patterns:
                pattern_segments[pattern.value].append(behavior)
        
        segments = []
        for pattern_name, users in sorted(pattern_segments.items(), key=lambda x: len(x[1]), reverse=True):
            if len(users) >= min_size:
                # Calculate metrics for segment
                total_spent = sum(u.total_spent for u in users)
                avg_spent = total_spent / len(users) if users else 0
                avg_transactions = sum(u.transaction_count for u in users) / len(users) if users else 0
                
                segments.append({
                    "pattern": pattern_name,
                    "size": len(users),
                    "total_spending": total_spent,
                    "avg_spending": avg_spent,
                    "avg_transactions": avg_transactions,
                    "percentage": len(users) / len(behaviors) * 100 if behaviors else 0
                })
        
        return {
            "status": "success",
            "total_users_analyzed": len(behaviors),
            "segment_count": len(segments),
            "segments": segments[:limit]
        }
    
    except Exception as e:
        logger.error(f"Error listing segments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/segments/{pattern}")
async def get_segment_details(pattern: str) -> Dict[str, Any]:
    """Get detailed information about a specific user segment"""
    try:
        service = get_marketing_ai_service()
        behaviors = service.analyzer.get_all_user_behaviors(limit=5000)
        
        # Filter by pattern
        segment_users = [
            b for b in behaviors 
            if any(p.value == pattern for p in b.patterns)
        ]
        
        if not segment_users:
            raise HTTPException(status_code=404, detail=f"Segment '{pattern}' not found or empty")
        
        # Calculate detailed metrics
        user_ids = [u.user_id for u in segment_users]
        total_spent = sum(u.total_spent for u in segment_users)
        avg_spent = total_spent / len(segment_users)
        avg_transactions = sum(u.transaction_count for u in segment_users) / len(segment_users)
        
        # Top categories
        from collections import Counter
        categories = Counter(u.primary_category for u in segment_users)
        top_categories = categories.most_common(5)
        
        # Top locations
        all_locations = []
        for u in segment_users:
            all_locations.extend([loc['location'] for loc in u.top_locations])
        
        location_counts = Counter(all_locations)
        top_locations = location_counts.most_common(5)
        
        return {
            "status": "success",
            "pattern": pattern,
            "segment_size": len(segment_users),
            "user_ids": user_ids,
            "metrics": {
                "total_spending": total_spent,
                "avg_spending": avg_spent,
                "avg_transactions": avg_transactions,
                "total_transactions": sum(u.transaction_count for u in segment_users)
            },
            "top_categories": [{"category": cat, "count": count} for cat, count in top_categories],
            "top_locations": [{"location": loc, "count": count} for loc, count in top_locations]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting segment details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_marketing_analytics() -> Dict[str, Any]:
    """Get overall marketing performance analytics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Active campaigns
        cursor.execute("""
        SELECT COUNT(*) as count FROM ai_campaigns WHERE status = 'active'
        """)
        active_campaigns = cursor.fetchone()['count']
        
        # Campaign types distribution
        cursor.execute("""
        SELECT campaign_type, COUNT(*) as count
        FROM ai_campaigns
        GROUP BY campaign_type
        """)
        campaign_types = [dict(row) for row in cursor.fetchall()]
        
        # Total targets across all campaigns
        cursor.execute("""
        SELECT COUNT(*) as total_targets
        FROM campaign_targets
        """)
        total_targets = cursor.fetchone()['total_targets']
        
        # Conversion metrics
        cursor.execute("""
        SELECT 
            COUNT(DISTINCT user_id) as converted_users,
            COUNT(*) as total_conversions
        FROM campaign_targets
        WHERE status = 'converted'
        """)
        conversion_data = cursor.fetchone()
        
        # Campaign performance
        cursor.execute("""
        SELECT 
            mc.campaign_name,
            mc.campaign_type,
            COUNT(DISTINCT ct.user_id) as target_count,
            COUNT(DISTINCT CASE WHEN ct.status = 'converted' THEN ct.user_id END) as conversions
        FROM ai_campaigns mc
        LEFT JOIN campaign_targets ct ON mc.campaign_id = ct.campaign_id
        WHERE mc.status = 'active'
        GROUP BY mc.campaign_id, mc.campaign_name, mc.campaign_type
        ORDER BY conversions DESC
        LIMIT 10
        """)
        top_campaigns = [dict(row) for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        conversion_rate = (
            conversion_data['converted_users'] / total_targets * 100
            if total_targets > 0 else 0
        )
        
        return {
            "status": "success",
            "summary": {
                "active_campaigns": active_campaigns,
                "total_targets": total_targets,
                "converted_users": conversion_data['converted_users'],
                "conversion_rate": conversion_rate
            },
            "campaign_types": campaign_types,
            "top_campaigns": top_campaigns
        }
    
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/campaigns/manual")
async def create_manual_campaign(
    campaign_name: str,
    campaign_type: str,
    offer_type: str = None,
    offer_value: float = None,
    offer_unit: str = None,
    description: str = "",
    target_pattern: Optional[str] = None,
    duration_days: int = 30,
) -> Dict[str, Any]:
    """Create a marketing campaign manually"""
    try:
        import uuid
        campaign_id = str(uuid.uuid4())
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
        INSERT INTO ai_campaigns 
        (id, name, type, description, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(query, (
            campaign_id,
            campaign_name,
            campaign_type,
            description,
            'draft',
            datetime.utcnow(),
            datetime.utcnow()
        ))
        
        conn.commit()
        
        logger.info(f"✅ Manual campaign {campaign_id} created")
        
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "campaign_id": campaign_id,
            "message": "Campaign created successfully"
        }
    
    except Exception as e:
        logger.error(f"Error creating campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/campaigns/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    campaign_type: Optional[str] = None,
    status: Optional[str] = None,
) -> Dict[str, Any]:
    """Update campaign details"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if campaign exists
        query = "SELECT id FROM ai_campaigns WHERE id = %s"
        cursor.execute(query, (campaign_id,))
        campaign = cursor.fetchone()
        
        if not campaign:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Build dynamic update query
        update_fields = []
        params = []
        
        if name is not None:
            update_fields.append("name = %s")
            params.append(name)
        
        if description is not None:
            update_fields.append("description = %s")
            params.append(description)
        
        if campaign_type is not None:
            update_fields.append("type = %s")
            params.append(campaign_type)
        
        if status is not None:
            # Validate status
            valid_statuses = ['draft', 'active', 'paused', 'completed', 'archived']
            if status not in valid_statuses:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
                )
            update_fields.append("status = %s")
            params.append(status)
        
        if not update_fields:
            cursor.close()
            conn.close()
            return {
                "status": "success",
                "campaign_id": campaign_id,
                "message": "No changes to update"
            }
        
        # Always update the updated_at field
        update_fields.append("updated_at = %s")
        params.append(datetime.utcnow())
        params.append(campaign_id)
        
        update_query = f"UPDATE ai_campaigns SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(update_query, params)
        conn.commit()
        
        logger.info(f"✅ Campaign {campaign_id} updated successfully")
        
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "campaign_id": campaign_id,
            "message": "Campaign updated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/campaigns/{campaign_id}/publish")
async def publish_campaign(campaign_id: str) -> Dict[str, Any]:
    """Publish a campaign from draft to active status"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # First check if campaign exists and is in draft status
        query = "SELECT id, status FROM ai_campaigns WHERE id = %s"
        cursor.execute(query, (campaign_id,))
        campaign = cursor.fetchone()
        
        if not campaign:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        if campaign['status'] != 'draft':
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail=f"Campaign is already {campaign['status']}, only draft campaigns can be published"
            )
        
        # Update status to active
        update_query = "UPDATE ai_campaigns SET status = %s, updated_at = %s WHERE id = %s"
        cursor.execute(update_query, ('active', datetime.utcnow(), campaign_id))
        conn.commit()
        
        logger.info(f"✅ Campaign {campaign_id} published successfully")
        
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "campaign_id": campaign_id,
            "message": "Campaign published successfully",
            "new_status": "active"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error publishing campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analysis/run-now")
async def trigger_analysis() -> Dict[str, Any]:
    """Trigger marketing analysis immediately"""
    try:
        result = schedule_marketing_analysis_now()
        return result
    except Exception as e:
        logger.error(f"Error triggering analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cleanup/run-now")
async def trigger_cleanup() -> Dict[str, Any]:
    """Trigger campaign cleanup immediately"""
    try:
        result = schedule_campaign_cleanup_now()
        return result
    except Exception as e:
        logger.error(f"Error triggering cleanup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_marketing_status() -> Dict[str, Any]:
    """Get current status of marketing AI system"""
    try:
        service = get_marketing_ai_service()
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get last analysis time
        cursor.execute("""
        SELECT MAX(created_at) as last_analysis FROM ai_campaigns
        """)
        last_analysis = cursor.fetchone()['last_analysis']
        
        # Get campaign counts
        cursor.execute("""
        SELECT status, COUNT(*) as count FROM ai_campaigns GROUP BY status
        """)
        statuses = {row['status']: row['count'] for row in cursor.fetchall()}
        
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "service_status": "operational",
            "last_analysis": last_analysis.isoformat() if last_analysis else None,
            "campaigns": {
                "active": statuses.get('active', 0),
                "expired": statuses.get('expired', 0),
                "paused": statuses.get('paused', 0)
            }
        }
    
    except Exception as e:
        logger.error(f"Error getting status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ===== AI MARKETING ENHANCED ENDPOINTS =====

from app.services.ai_marketing_enhanced import get_ai_marketing_enhanced


# Request models for AI endpoints
class GenerateCopyRequest(BaseModel):
    campaign_name: str
    target_patterns: List[str]
    campaign_type: str
    audience_size: int
    offer_value: Optional[str] = None


class AudienceInsightsRequest(BaseModel):
    target_patterns: List[str]
    lookback_days: int = 90


class OptimizeCampaignRequest(BaseModel):
    campaign_id: str
    reach: int
    engagement_rate: float
    click_rate: float
    conversion_rate: float
    roi: float
    cost_per_conversion: float


class PerformanceAnalysisRequest(BaseModel):
    campaign_id: str
    performance_data: Dict[str, Any]


@router.post("/ai/generate-copy")
async def generate_campaign_copy(request: GenerateCopyRequest) -> Dict[str, Any]:
    """
    Generate AI-powered campaign copy using Together.AI
    
    Creates compelling headlines, descriptions, CTAs, and selling points
    based on target audience patterns and campaign type.
    """
    try:
        ai_marketing = get_ai_marketing_enhanced()
        
        result = await ai_marketing.generate_campaign_copy(
            campaign_name=request.campaign_name,
            target_patterns=request.target_patterns,
            campaign_type=request.campaign_type,
            audience_size=request.audience_size,
            offer_value=request.offer_value
        )
        return result
    except Exception as e:
        logger.error(f"Error generating campaign copy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/audience-insights")
async def get_audience_insights(request: AudienceInsightsRequest) -> Dict[str, Any]:
    """
    Generate smart audience insights and segmentation recommendations
    
    Analyzes audience behavior and provides strategic recommendations
    for engagement opportunities, offers, and channels.
    """
    try:
        ai_marketing = get_ai_marketing_enhanced()
        
        result = await ai_marketing.get_audience_insights(
            target_patterns=request.target_patterns,
            lookback_days=request.lookback_days
        )
        return result
    except Exception as e:
        logger.error(f"Error getting audience insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/optimize")
async def optimize_campaign(request: OptimizeCampaignRequest) -> Dict[str, Any]:
    """
    Generate dynamic campaign optimization suggestions
    
    Analyzes current performance metrics and provides specific,
    actionable recommendations for improvement.
    """
    try:
        ai_marketing = get_ai_marketing_enhanced()
        metrics = {
            "reach": request.reach,
            "engagement_rate": request.engagement_rate,
            "click_rate": request.click_rate,
            "conversion_rate": request.conversion_rate,
            "roi": request.roi,
            "cost_per_conversion": request.cost_per_conversion
        }
        
        result = await ai_marketing.optimize_campaign(
            campaign_id=request.campaign_id,
            campaign_metrics=metrics
        )
        return result
    except Exception as e:
        logger.error(f"Error optimizing campaign: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/performance-analysis")
async def analyze_performance(request: PerformanceAnalysisRequest) -> Dict[str, Any]:
    """
    Generate natural language performance analysis
    
    Provides comprehensive analysis of campaign performance with
    insights, highlights, concerns, and actionable next steps.
    """
    try:
        ai_marketing = get_ai_marketing_enhanced()
        
        result = await ai_marketing.analyze_performance(
            campaign_id=request.campaign_id,
            performance_data=request.performance_data
        )
        return result
    except Exception as e:
        logger.error(f"Error analyzing performance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

