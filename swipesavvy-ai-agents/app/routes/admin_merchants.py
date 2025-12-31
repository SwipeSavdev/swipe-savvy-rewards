"""
Admin Portal - Merchants Management Routes

Endpoints for managing merchants in the admin portal
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.models import Merchant as MerchantModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["admin-merchants"])

class MerchantResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    status: str
    joinDate: str
    transactionCount: int
    successRate: float
    monthlyVolume: float
    category: Optional[str]
    location: Optional[str]
    country: Optional[str]

class MerchantsListResponse(BaseModel):
    merchants: List[MerchantResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


@router.get("/merchants")
async def list_merchants(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    List all merchants with pagination and filtering
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10, max: 100)
    - status: Filter by status (active, suspended)
    - search: Search by name or email
    """
    try:
        query = db.query(MerchantModel)
        
        if status:
            query = query.filter(MerchantModel.status == status)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (MerchantModel.name.ilike(search_pattern)) |
                (MerchantModel.email.ilike(search_pattern))
            )
        
        total = query.count()
        total_pages = (total + per_page - 1) // per_page
        
        merchants = query.offset((page - 1) * per_page).limit(per_page).all()
        
        return {
            "merchants": [
                MerchantResponse(
                    id=str(m.id),
                    name=m.name,
                    email=m.email,
                    phone=m.phone,
                    status=m.status,
                    joinDate=m.join_date.isoformat() if m.join_date else None,
                    transactionCount=m.transaction_count or 0,
                    successRate=float(m.success_rate or 0),
                    monthlyVolume=float(m.monthly_volume or 0),
                    category=m.business_type,
                    location=m.location,
                    country=m.country
                )
                for m in merchants
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error listing merchants: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list merchants")


@router.get("/merchants/{merchant_id}")
async def get_merchant(merchant_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get a specific merchant by ID"""
    try:
        merchant = db.query(MerchantModel).filter(MerchantModel.id == merchant_id).first()
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        return {
            "success": True,
            "merchant": MerchantResponse(
                id=str(merchant.id),
                name=merchant.name,
                email=merchant.email,
                phone=merchant.phone,
                status=merchant.status,
                joinDate=merchant.join_date.isoformat() if merchant.join_date else None,
                transactionCount=merchant.transaction_count or 0,
                successRate=float(merchant.success_rate or 0),
                monthlyVolume=float(merchant.monthly_volume or 0),
                category=merchant.business_type,
                location=merchant.location,
                country=merchant.country
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting merchant: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get merchant")


@router.put("/merchants/{merchant_id}/status")
async def update_merchant_status(
    merchant_id: str,
    status: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update merchant status (active, suspended, disabled)"""
    try:
        merchant = db.query(MerchantModel).filter(MerchantModel.id == merchant_id).first()
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        valid_statuses = ['active', 'suspended', 'inactive', 'pending']
        if status not in valid_statuses:
            raise HTTPException(status_code=422, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        merchant.status = status
        merchant.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(merchant)
        
        return {
            "success": True,
            "message": f"Merchant status updated to {status}",
            "merchant": MerchantResponse(
                id=str(merchant.id),
                name=merchant.name,
                email=merchant.email,
                phone=merchant.phone,
                status=merchant.status,
                joinDate=merchant.join_date.isoformat() if merchant.join_date else None,
                transactionCount=merchant.transaction_count or 0,
                successRate=float(merchant.success_rate or 0),
                monthlyVolume=float(merchant.monthly_volume or 0),
                category=merchant.business_type,
                location=merchant.location,
                country=merchant.country
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating merchant status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update merchant status")


@router.get("/merchants/stats/overview")
async def get_merchants_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get merchants overview statistics"""
    try:
        merchants = db.query(MerchantModel).all()
        
        active = sum(1 for m in merchants if m.status == 'active')
        suspended = sum(1 for m in merchants if m.status == 'suspended')
        total_volume = sum(float(m.monthly_volume or 0) for m in merchants)
        avg_success_rate = (sum(float(m.success_rate or 0) for m in merchants) / len(merchants)) if merchants else 0
        
        top_merchant = max(merchants, key=lambda m: float(m.monthly_volume or 0)) if merchants else None
        
        return {
            "total_merchants": len(merchants),
            "active_merchants": active,
            "suspended_merchants": suspended,
            "total_monthly_volume": round(total_volume, 2),
            "avg_success_rate": round(avg_success_rate, 2),
            "top_performer": top_merchant.name if top_merchant else "N/A"
        }
    except Exception as e:
        logger.error(f"Error getting merchants stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get merchants stats")
