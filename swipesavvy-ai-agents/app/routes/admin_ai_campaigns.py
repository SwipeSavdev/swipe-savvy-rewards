"""
Admin Portal - AI Campaigns Management Routes

Endpoints for managing AI marketing campaigns in the admin portal
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone
import logging
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AICampaign as AICampaignModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["admin-ai-campaigns"])

class CampaignResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str
    type: str
    startDate: Optional[str]
    endDate: Optional[str]
    budget: float
    spent: float
    reach: int
    engagement: float
    conversions: int
    roi: float
    createdBy: Optional[str]
    lastUpdated: str

class CampaignsListResponse(BaseModel):
    campaigns: List[CampaignResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

@router.get("/ai-campaigns")
async def list_ai_campaigns(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    campaign_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    List all AI marketing campaigns with pagination and filtering
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10, max: 100)
    - status: Filter by status (active, paused, scheduled, completed)
    - campaign_type: Filter by type (promotional, acquisition, retention, seasonal)
    - search: Search by name or description
    """
    try:
        query = db.query(AICampaignModel)
        
        if status:
            query = query.filter(AICampaignModel.status == status)
        
        if campaign_type:
            query = query.filter(AICampaignModel.type == campaign_type)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (AICampaignModel.name.ilike(search_pattern)) |
                (AICampaignModel.description.ilike(search_pattern))
            )
        
        total = query.count()
        total_pages = (total + per_page - 1) // per_page
        
        campaigns = query.offset((page - 1) * per_page).limit(per_page).all()
        
        return {
            "campaigns": [
                CampaignResponse(
                    id=str(c.id),
                    name=c.name,
                    description=c.description,
                    status=c.status,
                    type=c.type,
                    startDate=c.start_date.isoformat() if c.start_date else None,
                    endDate=c.end_date.isoformat() if c.end_date else None,
                    budget=float(c.budget or 0),
                    spent=float(c.spent or 0),
                    reach=c.audience_size or 0,
                    engagement=float(c.engagement or 0),
                    conversions=c.conversions or 0,
                    roi=float(c.roi or 0),
                    createdBy=str(c.created_by) if c.created_by else None,
                    lastUpdated=c.updated_at.isoformat() if c.updated_at else None
                )
                for c in campaigns
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error listing AI campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list AI campaigns")


@router.get("/ai-campaigns/{campaign_id}")
async def get_ai_campaign(campaign_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get a specific AI campaign by ID"""
    try:
        campaign = db.query(AICampaignModel).filter(AICampaignModel.id == campaign_id).first()
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        return {
            "success": True,
            "campaign": CampaignResponse(
                id=str(campaign.id),
                name=campaign.name,
                description=campaign.description,
                status=campaign.status,
                type=campaign.type,
                startDate=campaign.start_date.isoformat() if campaign.start_date else None,
                endDate=campaign.end_date.isoformat() if campaign.end_date else None,
                budget=float(campaign.budget or 0),
                spent=float(campaign.spent or 0),
                reach=campaign.audience_size or 0,
                engagement=float(campaign.engagement or 0),
                conversions=campaign.conversions or 0,
                roi=float(campaign.roi or 0),
                createdBy=str(campaign.created_by) if campaign.created_by else None,
                lastUpdated=campaign.updated_at.isoformat() if campaign.updated_at else None
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI campaign: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get AI campaign")


@router.put("/ai-campaigns/{campaign_id}/status")
async def update_campaign_status(
    campaign_id: str,
    status: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update campaign status"""
    try:
        campaign = db.query(AICampaignModel).filter(AICampaignModel.id == campaign_id).first()
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        valid_statuses = ['draft', 'active', 'paused', 'scheduled', 'completed', 'archived']
        if status not in valid_statuses:
            raise HTTPException(status_code=422, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        campaign.status = status
        campaign.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(campaign)
        
        return {
            "success": True,
            "message": f"Campaign status updated to {status}",
            "campaign": CampaignResponse(
                id=str(campaign.id),
                name=campaign.name,
                description=campaign.description,
                status=campaign.status,
                type=campaign.type,
                startDate=campaign.start_date.isoformat() if campaign.start_date else None,
                endDate=campaign.end_date.isoformat() if campaign.end_date else None,
                budget=float(campaign.budget or 0),
                spent=float(campaign.spent or 0),
                reach=campaign.audience_size or 0,
                engagement=float(campaign.engagement or 0),
                conversions=campaign.conversions or 0,
                roi=float(campaign.roi or 0),
                createdBy=str(campaign.created_by) if campaign.created_by else None,
                lastUpdated=campaign.updated_at.isoformat() if campaign.updated_at else None
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating campaign status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update campaign status")


@router.get("/ai-campaigns/stats/overview")
async def get_campaigns_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get AI campaigns overview statistics"""
    try:
        campaigns = db.query(AICampaignModel).all()
        
        active_count = sum(1 for c in campaigns if c.status == 'active')
        total_reach = sum(c.audience_size or 0 for c in campaigns)
        total_conversions = sum(c.conversions or 0 for c in campaigns)
        total_budget = sum(float(c.budget or 0) for c in campaigns)
        total_spent = sum(float(c.spent or 0) for c in campaigns)
        avg_roi = sum(float(c.roi or 0) for c in campaigns) / len(campaigns) if campaigns else 0
        best_performer = max(campaigns, key=lambda c: float(c.roi or 0)).name if campaigns else "N/A"
        
        return {
            "total_campaigns": len(campaigns),
            "active_campaigns": active_count,
            "total_reach": total_reach,
            "total_conversions": total_conversions,
            "total_budget": round(total_budget, 2),
            "total_spent": round(total_spent, 2),
            "avg_roi": round(avg_roi, 2),
            "best_performer": best_performer
        }
    except Exception as e:
        logger.error(f"Error getting campaigns stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get campaigns stats")
