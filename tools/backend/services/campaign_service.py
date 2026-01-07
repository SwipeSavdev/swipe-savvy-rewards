"""
Campaign Management API Service
Handles campaign CRUD operations, targeting, and status management
File: /tools/backend/services/campaign_service.py
Created: December 28, 2025
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
from typing import List, Optional, Dict, Any
from decimal import Decimal
from enum import Enum
import sys
from pathlib import Path

# Import get_db from main module
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Temporary placeholder for get_db until main is properly imported
def get_db():
    """Temporary placeholder get_db function"""
    pass

# ============================================================================
# ENUMS & MODELS
# ============================================================================

class CampaignType(str, Enum):
    LOCATION_DEAL = "LOCATION_DEAL"
    EMAIL_OFFER = "EMAIL_OFFER"
    SEASONAL = "SEASONAL"
    LOYALTY_BOOST = "LOYALTY_BOOST"
    FLASH_SALE = "FLASH_SALE"

class CampaignStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class OfferType(str, Enum):
    FIXED_DISCOUNT = "FIXED_DISCOUNT"
    PERCENTAGE = "PERCENTAGE"
    BOGO = "BOGO"
    FREE_SHIPPING = "FREE_SHIPPING"
    OTHER = "OTHER"

# ============================================================================
# CAMPAIGN SERVICE
# ============================================================================

class CampaignService:
    """Service for managing marketing campaigns"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_campaign(
        self,
        name: str,
        campaign_type: CampaignType,
        offer_amount: Decimal,
        offer_type: OfferType,
        start_date: datetime,
        end_date: Optional[datetime] = None,
        target_segment: Optional[str] = None,
        description: Optional[str] = None,
        created_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create new campaign"""
        try:
            campaign_id = f"camp-{int(datetime.utcnow().timestamp())}"
            
            # TODO: Insert into campaigns table
            # For now, return mock response for testing
            return {
                "campaign_id": campaign_id,
                "name": name,
                "type": campaign_type.value,
                "status": "draft",
                "offer_amount": float(offer_amount),
                "offer_type": offer_type.value,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat() if end_date else None,
                "created_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise Exception(f"Failed to create campaign: {str(e)}")
    
    def get_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Get campaign details"""
        try:
            # TODO: Query campaigns table
            # For now, return mock response
            return {
                "campaign_id": campaign_id,
                "name": "Sample Campaign",
                "type": "LOCATION_DEAL",
                "status": "running",
                "offer_amount": 10.00,
                "offer_type": "FIXED_DISCOUNT"
            }
        except Exception as e:
            raise Exception(f"Failed to get campaign: {str(e)}")
    
    def list_campaigns(
        self,
        status: Optional[CampaignStatus] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """List all campaigns with optional filtering"""
        try:
            # TODO: Query campaigns table with filters
            # For now, return mock response
            return {
                "campaigns": [
                    {
                        "campaign_id": "camp-001",
                        "name": "Holiday Promotion",
                        "type": "SEASONAL",
                        "status": "running",
                        "created_at": datetime.utcnow().isoformat()
                    }
                ],
                "total": 1,
                "limit": limit,
                "offset": offset
            }
        except Exception as e:
            raise Exception(f"Failed to list campaigns: {str(e)}")
    
    def update_campaign(
        self,
        campaign_id: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Update campaign fields"""
        try:
            # TODO: Update campaigns table
            return {"campaign_id": campaign_id, "updated": True}
        except Exception as e:
            raise Exception(f"Failed to update campaign: {str(e)}")
    
    def delete_campaign(self, campaign_id: str) -> bool:
        """Delete campaign (soft delete - set status to archived)"""
        try:
            # TODO: Update campaigns.status = 'archived'
            return True
        except Exception as e:
            raise Exception(f"Failed to delete campaign: {str(e)}")
    
    def launch_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Launch campaign (change status from draft to running)"""
        try:
            # TODO: Update campaigns.status = 'running', start_date = NOW()
            return {
                "campaign_id": campaign_id,
                "status": "running",
                "launched_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise Exception(f"Failed to launch campaign: {str(e)}")
    
    def pause_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Pause running campaign"""
        try:
            # TODO: Update campaigns.status = 'paused'
            return {
                "campaign_id": campaign_id,
                "status": "paused"
            }
        except Exception as e:
            raise Exception(f"Failed to pause campaign: {str(e)}")

# ============================================================================
# FASTAPI ROUTER
# ============================================================================

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])

def get_campaign_service(db: Session = Depends(get_db)) -> CampaignService:
    """Dependency injection for campaign service"""
    return CampaignService(db)

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("")
async def list_campaigns(
    status: Optional[CampaignStatus] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: CampaignService = Depends(get_campaign_service)
):
    """
    List all campaigns with optional filtering
    
    Query Parameters:
    - status: Filter by campaign status (draft, running, paused, completed, archived)
    - limit: Number of results to return (default 20, max 100)
    - offset: Number of results to skip for pagination (default 0)
    
    Response:
    {
      "campaigns": [...],
      "total": integer,
      "limit": integer,
      "offset": integer
    }
    """
    try:
        result = service.list_campaigns(status, limit, offset)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_campaign(
    name: str = Query(..., min_length=1),
    campaign_type: CampaignType = Query(...),
    offer_amount: float = Query(..., gt=0),
    offer_type: OfferType = Query(...),
    start_date: str = Query(...),  # ISO 8601 format
    end_date: Optional[str] = Query(None),
    target_segment: Optional[str] = Query(None),
    description: Optional[str] = Query(None),
    service: CampaignService = Depends(get_campaign_service)
):
    """
    Create new marketing campaign
    
    Query Parameters:
    - name: Campaign name (required)
    - campaign_type: Type of campaign (required)
    - offer_amount: Offer value in dollars (required, must be > 0)
    - offer_type: Type of offer (FIXED_DISCOUNT, PERCENTAGE, etc.)
    - start_date: Campaign start date in ISO 8601 format (required)
    - end_date: Campaign end date in ISO 8601 format (optional)
    - target_segment: Target user segment (optional)
    - description: Campaign description (optional)
    
    Response:
    {
      "campaign_id": "camp-001",
      "name": "Holiday Promotion",
      "type": "SEASONAL",
      "status": "draft",
      "created_at": "2025-12-28T10:30:00Z"
    }
    """
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date) if end_date else None
        
        result = service.create_campaign(
            name=name,
            campaign_type=campaign_type,
            offer_amount=Decimal(str(offer_amount)),
            offer_type=offer_type,
            start_date=start,
            end_date=end,
            target_segment=target_segment,
            description=description
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{campaign_id}")
async def get_campaign(
    campaign_id: str,
    service: CampaignService = Depends(get_campaign_service)
):
    """
    Get campaign details
    
    Path Parameters:
    - campaign_id: Campaign identifier
    
    Response:
    {
      "campaign_id": "camp-001",
      "name": "Holiday Promotion",
      "type": "SEASONAL",
      "status": "running",
      "offer_amount": 10.00,
      "offer_type": "FIXED_DISCOUNT",
      ...
    }
    """
    try:
        result = service.get_campaign(campaign_id)
        if not result:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    name: Optional[str] = Query(None),
    status: Optional[CampaignStatus] = Query(None),
    end_date: Optional[str] = Query(None),
    service: CampaignService = Depends(get_campaign_service)
):
    """
    Update campaign (partial update)
    
    Path Parameters:
    - campaign_id: Campaign identifier
    
    Query Parameters (optional):
    - name: New campaign name
    - status: New status
    - end_date: New end date
    
    Response:
    {
      "campaign_id": "camp-001",
      "updated": true,
      "updated_at": "2025-12-28T10:30:00Z"
    }
    """
    try:
        updates = {}
        if name:
            updates['name'] = name
        if status:
            updates['status'] = status.value
        if end_date:
            updates['end_date'] = datetime.fromisoformat(end_date)
        
        result = service.update_campaign(campaign_id, **updates)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    service: CampaignService = Depends(get_campaign_service)
):
    """
    Delete campaign (soft delete - archives the campaign)
    
    Path Parameters:
    - campaign_id: Campaign identifier
    
    Response:
    {
      "campaign_id": "camp-001",
      "deleted": true,
      "status": "archived"
    }
    """
    try:
        service.delete_campaign(campaign_id)
        return {
            "campaign_id": campaign_id,
            "deleted": True,
            "status": "archived"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{campaign_id}/launch")
async def launch_campaign(
    campaign_id: str,
    service: CampaignService = Depends(get_campaign_service)
):
    """
    Launch campaign (transition from draft to running)
    
    Path Parameters:
    - campaign_id: Campaign identifier
    
    Response:
    {
      "campaign_id": "camp-001",
      "status": "running",
      "launched_at": "2025-12-28T10:30:00Z"
    }
    """
    try:
        result = service.launch_campaign(campaign_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{campaign_id}/pause")
async def pause_campaign(
    campaign_id: str,
    service: CampaignService = Depends(get_campaign_service)
):
    """
    Pause running campaign
    
    Path Parameters:
    - campaign_id: Campaign identifier
    
    Response:
    {
      "campaign_id": "camp-001",
      "status": "paused"
    }
    """
    try:
        result = service.pause_campaign(campaign_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# SETUP FUNCTION
# ============================================================================

def setup_campaign_routes(app):
    """
    Setup campaign routes in FastAPI app
    
    Usage in main.py:
        from campaign_service import setup_campaign_routes
        setup_campaign_routes(app)
    
    This will register all campaign endpoints:
    - GET    /api/campaigns
    - POST   /api/campaigns
    - GET    /api/campaigns/{campaign_id}
    - PUT    /api/campaigns/{campaign_id}
    - DELETE /api/campaigns/{campaign_id}
    - POST   /api/campaigns/{campaign_id}/launch
    - POST   /api/campaigns/{campaign_id}/pause
    """
    app.include_router(router)
    print("✅ Campaign service routes initialized (7 endpoints)")
