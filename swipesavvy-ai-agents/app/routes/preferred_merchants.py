"""
Preferred Merchants & Deals API Routes

Provides endpoints for:
- Admin: Managing preferred merchants and deals
- Mobile: Fetching preferred merchants and deals for consumers
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from uuid import UUID
import logging
import math

from app.database import get_db
from app.models import PreferredMerchant, MerchantDeal, Merchant, MerchantSubscription

# Subscription tier configuration
SUBSCRIPTION_TIERS = {
    'platinum': {
        'placement_score': 100,
        'max_active_deals': 999,  # Unlimited
        'featured_placement': True,
        'banner_enabled': True,
        'priority_support': True,
        'analytics_access': True,
        'custom_branding': True,
        'monthly_fee': 499.00,
        'annual_fee': 4990.00,
    },
    'gold': {
        'placement_score': 75,
        'max_active_deals': 10,
        'featured_placement': True,
        'banner_enabled': False,
        'priority_support': True,
        'analytics_access': True,
        'custom_branding': True,
        'monthly_fee': 199.00,
        'annual_fee': 1990.00,
    },
    'silver': {
        'placement_score': 50,
        'max_active_deals': 5,
        'featured_placement': False,
        'banner_enabled': False,
        'priority_support': False,
        'analytics_access': True,
        'custom_branding': False,
        'monthly_fee': 99.00,
        'annual_fee': 990.00,
    },
    'bronze': {
        'placement_score': 25,
        'max_active_deals': 2,
        'featured_placement': False,
        'banner_enabled': False,
        'priority_support': False,
        'analytics_access': False,
        'custom_branding': False,
        'monthly_fee': 49.00,
        'annual_fee': 490.00,
    },
    'free': {
        'placement_score': 0,
        'max_active_deals': 1,
        'featured_placement': False,
        'banner_enabled': False,
        'priority_support': False,
        'analytics_access': False,
        'custom_branding': False,
        'monthly_fee': 0.00,
        'annual_fee': 0.00,
    }
}

logger = logging.getLogger(__name__)
router = APIRouter(tags=["preferred-merchants"])


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class LocationFilter(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_km: float = Field(default=10, ge=0.1, le=100)


class CreatePreferredMerchantRequest(BaseModel):
    merchant_id: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    category: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    cashback_percentage: float = 0.0
    bonus_points_multiplier: float = 1.0
    priority: int = 0
    is_featured: bool = False
    status: str = "active"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tags: List[str] = []


class UpdatePreferredMerchantRequest(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    category: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    cashback_percentage: Optional[float] = None
    bonus_points_multiplier: Optional[float] = None
    priority: Optional[int] = None
    is_featured: Optional[bool] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    tags: Optional[List[str]] = None


class CreateDealRequest(BaseModel):
    title: str
    description: Optional[str] = None
    deal_type: str  # percentage_off, fixed_amount, bogo, cashback_boost, points_multiplier, free_item
    discount_value: Optional[float] = None
    min_purchase: Optional[float] = None
    max_discount: Optional[float] = None
    terms_and_conditions: Optional[str] = None
    promo_code: Optional[str] = None
    redemption_limit: Optional[int] = None
    per_user_limit: int = 1
    image_url: Optional[str] = None
    priority: int = 0
    is_featured: bool = False
    status: str = "active"
    start_date: datetime
    end_date: datetime


class UpdateDealRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deal_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_purchase: Optional[float] = None
    max_discount: Optional[float] = None
    terms_and_conditions: Optional[str] = None
    promo_code: Optional[str] = None
    redemption_limit: Optional[int] = None
    per_user_limit: Optional[int] = None
    image_url: Optional[str] = None
    priority: Optional[int] = None
    is_featured: Optional[bool] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class SubscriptionResponse(BaseModel):
    id: str
    merchant_id: str
    tier: str
    placement_score: int
    max_active_deals: int
    featured_placement: bool
    banner_enabled: bool
    priority_support: bool
    analytics_access: bool
    monthly_fee: float
    billing_cycle: str
    status: str
    current_period_end: Optional[str]
    created_at: str


class PreferredMerchantResponse(BaseModel):
    id: str
    merchant_id: str
    merchant_name: str
    display_name: Optional[str]
    description: Optional[str]
    logo_url: Optional[str]
    banner_url: Optional[str]
    category: str
    latitude: Optional[float]
    longitude: Optional[float]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    cashback_percentage: float
    bonus_points_multiplier: float
    priority: int
    effective_priority: int  # priority + subscription placement_score
    is_featured: bool
    show_banner: bool
    subscription_tier: Optional[str]
    status: str
    start_date: Optional[str]
    end_date: Optional[str]
    tags: List[str]
    deals_count: int
    active_deals_limit: int
    distance_km: Optional[float] = None
    created_at: str


class DealResponse(BaseModel):
    id: str
    preferred_merchant_id: str
    merchant_name: str
    title: str
    description: Optional[str]
    deal_type: str
    discount_value: Optional[float]
    min_purchase: Optional[float]
    max_discount: Optional[float]
    terms_and_conditions: Optional[str]
    promo_code: Optional[str]
    redemption_limit: Optional[int]
    per_user_limit: int
    image_url: Optional[str]
    priority: int
    is_featured: bool
    status: str
    start_date: str
    end_date: str
    redemption_count: int
    view_count: int
    is_valid: bool
    created_at: str


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km using Haversine formula"""
    R = 6371  # Earth's radius in km

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c


def get_subscription_for_merchant(merchant_id, db: Session) -> Optional[MerchantSubscription]:
    """Get active subscription for a merchant"""
    return db.query(MerchantSubscription).filter(
        MerchantSubscription.merchant_id == merchant_id,
        MerchantSubscription.status.in_(['active', 'trialing'])
    ).first()


def serialize_preferred_merchant(pm: PreferredMerchant, user_lat: float = None, user_lon: float = None, subscription: MerchantSubscription = None) -> dict:
    """Serialize a PreferredMerchant to response format with subscription info"""
    distance = None
    if user_lat and user_lon and pm.latitude and pm.longitude:
        distance = round(calculate_distance(user_lat, user_lon, pm.latitude, pm.longitude), 2)

    # Get subscription info
    sub_tier = subscription.tier if subscription else 'free'
    tier_config = SUBSCRIPTION_TIERS.get(sub_tier, SUBSCRIPTION_TIERS['free'])
    placement_score = subscription.placement_score if subscription else 0
    effective_priority = (pm.priority or 0) + placement_score

    # Check if features are allowed by subscription
    can_feature = tier_config['featured_placement']
    can_banner = tier_config['banner_enabled']

    return PreferredMerchantResponse(
        id=str(pm.id),
        merchant_id=str(pm.merchant_id),
        merchant_name=pm.merchant.name if pm.merchant else "Unknown",
        display_name=pm.display_name,
        description=pm.description,
        logo_url=pm.logo_url,
        banner_url=pm.banner_url if can_banner else None,
        category=pm.category,
        latitude=pm.latitude,
        longitude=pm.longitude,
        address=pm.address,
        city=pm.city,
        state=pm.state,
        zip_code=pm.zip_code,
        cashback_percentage=float(pm.cashback_percentage or 0),
        bonus_points_multiplier=float(pm.bonus_points_multiplier or 1),
        priority=pm.priority or 0,
        effective_priority=effective_priority,
        is_featured=pm.is_featured and can_feature,
        show_banner=pm.show_banner and can_banner if hasattr(pm, 'show_banner') else False,
        subscription_tier=sub_tier,
        status=pm.status,
        start_date=pm.start_date.isoformat() if pm.start_date else None,
        end_date=pm.end_date.isoformat() if pm.end_date else None,
        tags=pm.tags or [],
        active_deals_limit=tier_config['max_active_deals'],
        deals_count=pm.deals.count() if pm.deals else 0,
        distance_km=distance,
        created_at=pm.created_at.isoformat() if pm.created_at else None
    ).dict()


def serialize_deal(deal: MerchantDeal) -> dict:
    """Serialize a MerchantDeal to response format"""
    now = datetime.now(timezone.utc)
    is_valid = (
        deal.status == 'active' and
        deal.start_date <= now and
        deal.end_date >= now and
        (deal.redemption_limit is None or deal.redemption_count < deal.redemption_limit)
    )

    merchant_name = "Unknown"
    if deal.preferred_merchant and deal.preferred_merchant.merchant:
        merchant_name = deal.preferred_merchant.display_name or deal.preferred_merchant.merchant.name

    return DealResponse(
        id=str(deal.id),
        preferred_merchant_id=str(deal.preferred_merchant_id),
        merchant_name=merchant_name,
        title=deal.title,
        description=deal.description,
        deal_type=deal.deal_type,
        discount_value=float(deal.discount_value) if deal.discount_value else None,
        min_purchase=float(deal.min_purchase) if deal.min_purchase else None,
        max_discount=float(deal.max_discount) if deal.max_discount else None,
        terms_and_conditions=deal.terms_and_conditions,
        promo_code=deal.promo_code,
        redemption_limit=deal.redemption_limit,
        per_user_limit=deal.per_user_limit or 1,
        image_url=deal.image_url,
        priority=deal.priority or 0,
        is_featured=deal.is_featured or False,
        status=deal.status,
        start_date=deal.start_date.isoformat() if deal.start_date else None,
        end_date=deal.end_date.isoformat() if deal.end_date else None,
        redemption_count=deal.redemption_count or 0,
        view_count=deal.view_count or 0,
        is_valid=is_valid,
        created_at=deal.created_at.isoformat() if deal.created_at else None
    ).dict()


def serialize_subscription(sub: MerchantSubscription) -> dict:
    """Serialize a MerchantSubscription to response format"""
    return {
        "id": str(sub.id),
        "merchant_id": str(sub.merchant_id),
        "tier": sub.tier,
        "placement_score": sub.placement_score,
        "max_active_deals": sub.max_active_deals,
        "featured_placement": sub.featured_placement,
        "banner_enabled": sub.banner_enabled,
        "priority_support": sub.priority_support,
        "analytics_access": sub.analytics_access,
        "custom_branding": sub.custom_branding,
        "monthly_fee": float(sub.monthly_fee) if sub.monthly_fee else 0,
        "annual_fee": float(sub.annual_fee) if sub.annual_fee else 0,
        "billing_cycle": sub.billing_cycle,
        "stripe_subscription_id": sub.stripe_subscription_id,
        "stripe_customer_id": sub.stripe_customer_id,
        "status": sub.status,
        "current_period_start": sub.current_period_start.isoformat() if sub.current_period_start else None,
        "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
        "onboarding_id": str(sub.onboarding_id) if sub.onboarding_id else None,
        "created_at": sub.created_at.isoformat() if sub.created_at else None,
        "updated_at": sub.updated_at.isoformat() if sub.updated_at else None,
    }


# ============================================================================
# ADMIN ENDPOINTS - PREFERRED MERCHANTS
# ============================================================================

@router.post("/api/v1/admin/preferred-merchants")
async def create_preferred_merchant(
    request: CreatePreferredMerchantRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Create a new preferred merchant configuration"""
    try:
        # Verify merchant exists
        merchant = db.query(Merchant).filter(Merchant.id == request.merchant_id).first()
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")

        # Check if already a preferred merchant
        existing = db.query(PreferredMerchant).filter(
            PreferredMerchant.merchant_id == request.merchant_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Merchant is already a preferred merchant")

        pm = PreferredMerchant(
            merchant_id=request.merchant_id,
            display_name=request.display_name or merchant.name,
            description=request.description,
            logo_url=request.logo_url,
            banner_url=request.banner_url,
            category=request.category,
            latitude=request.latitude,
            longitude=request.longitude,
            address=request.address,
            city=request.city,
            state=request.state,
            zip_code=request.zip_code,
            cashback_percentage=request.cashback_percentage,
            bonus_points_multiplier=request.bonus_points_multiplier,
            priority=request.priority,
            is_featured=request.is_featured,
            status=request.status,
            start_date=request.start_date,
            end_date=request.end_date,
            tags=request.tags,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(pm)
        db.commit()
        db.refresh(pm)

        return {
            "success": True,
            "message": "Preferred merchant created successfully",
            "preferred_merchant": serialize_preferred_merchant(pm)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating preferred merchant: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/admin/preferred-merchants")
async def list_preferred_merchants_admin(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_featured: Optional[bool] = Query(None),
    subscription_tier: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """List all preferred merchants (admin view) with subscription info"""
    try:
        query = db.query(PreferredMerchant).options(joinedload(PreferredMerchant.merchant))

        if status:
            query = query.filter(PreferredMerchant.status == status)
        if category:
            query = query.filter(PreferredMerchant.category == category)
        if is_featured is not None:
            query = query.filter(PreferredMerchant.is_featured == is_featured)
        if search:
            search_pattern = f"%{search}%"
            query = query.join(Merchant).filter(
                or_(
                    PreferredMerchant.display_name.ilike(search_pattern),
                    Merchant.name.ilike(search_pattern)
                )
            )

        total = query.count()
        total_pages = (total + per_page - 1) // per_page

        merchants = query.order_by(
            PreferredMerchant.priority.desc(),
            PreferredMerchant.created_at.desc()
        ).offset((page - 1) * per_page).limit(per_page).all()

        # Fetch subscriptions for all merchants
        merchant_ids = [pm.merchant_id for pm in merchants]
        subscriptions = db.query(MerchantSubscription).filter(
            MerchantSubscription.merchant_id.in_(merchant_ids),
            MerchantSubscription.status.in_(['active', 'trialing'])
        ).all()
        sub_map = {str(s.merchant_id): s for s in subscriptions}

        # Filter by subscription tier if specified
        result_merchants = []
        for pm in merchants:
            sub = sub_map.get(str(pm.merchant_id))
            effective_tier = sub.tier if sub else 'free'
            if subscription_tier and effective_tier != subscription_tier:
                continue
            result_merchants.append(serialize_preferred_merchant(pm, subscription=sub))

        return {
            "preferred_merchants": result_merchants,
            "total": total if not subscription_tier else len(result_merchants),
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error listing preferred merchants: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/admin/preferred-merchants/{pm_id}")
async def get_preferred_merchant_admin(
    pm_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get a specific preferred merchant with details and subscription info"""
    try:
        pm = db.query(PreferredMerchant).options(
            joinedload(PreferredMerchant.merchant)
        ).filter(PreferredMerchant.id == pm_id).first()

        if not pm:
            raise HTTPException(status_code=404, detail="Preferred merchant not found")

        # Get subscription
        subscription = get_subscription_for_merchant(pm.merchant_id, db)

        # Get active deals
        now = datetime.now(timezone.utc)
        active_deals = pm.deals.filter(
            and_(
                MerchantDeal.status == 'active',
                MerchantDeal.start_date <= now,
                MerchantDeal.end_date >= now
            )
        ).all()

        return {
            "success": True,
            "preferred_merchant": serialize_preferred_merchant(pm, subscription=subscription),
            "subscription": serialize_subscription(subscription) if subscription else None,
            "active_deals": [serialize_deal(d) for d in active_deals]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting preferred merchant: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/v1/admin/preferred-merchants/{pm_id}")
async def update_preferred_merchant(
    pm_id: str,
    request: UpdatePreferredMerchantRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update a preferred merchant configuration"""
    try:
        pm = db.query(PreferredMerchant).filter(PreferredMerchant.id == pm_id).first()
        if not pm:
            raise HTTPException(status_code=404, detail="Preferred merchant not found")

        update_data = request.dict(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(pm, field, value)

        pm.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(pm)

        return {
            "success": True,
            "message": "Preferred merchant updated successfully",
            "preferred_merchant": serialize_preferred_merchant(pm)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating preferred merchant: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/v1/admin/preferred-merchants/{pm_id}")
async def delete_preferred_merchant(
    pm_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Delete a preferred merchant and all its deals"""
    try:
        pm = db.query(PreferredMerchant).filter(PreferredMerchant.id == pm_id).first()
        if not pm:
            raise HTTPException(status_code=404, detail="Preferred merchant not found")

        # Delete associated deals first
        db.query(MerchantDeal).filter(MerchantDeal.preferred_merchant_id == pm_id).delete()
        db.delete(pm)
        db.commit()

        return {
            "success": True,
            "message": "Preferred merchant and deals deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting preferred merchant: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ADMIN ENDPOINTS - DEALS
# ============================================================================

@router.post("/api/v1/admin/preferred-merchants/{pm_id}/deals")
async def create_deal(
    pm_id: str,
    request: CreateDealRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Create a new deal for a preferred merchant"""
    try:
        pm = db.query(PreferredMerchant).filter(PreferredMerchant.id == pm_id).first()
        if not pm:
            raise HTTPException(status_code=404, detail="Preferred merchant not found")

        deal = MerchantDeal(
            preferred_merchant_id=pm_id,
            title=request.title,
            description=request.description,
            deal_type=request.deal_type,
            discount_value=request.discount_value,
            min_purchase=request.min_purchase,
            max_discount=request.max_discount,
            terms_and_conditions=request.terms_and_conditions,
            promo_code=request.promo_code,
            redemption_limit=request.redemption_limit,
            per_user_limit=request.per_user_limit,
            image_url=request.image_url,
            priority=request.priority,
            is_featured=request.is_featured,
            status=request.status,
            start_date=request.start_date,
            end_date=request.end_date,
            redemption_count=0,
            view_count=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(deal)
        db.commit()
        db.refresh(deal)

        return {
            "success": True,
            "message": "Deal created successfully",
            "deal": serialize_deal(deal)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating deal: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/admin/deals")
async def list_all_deals_admin(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    deal_type: Optional[str] = Query(None),
    is_featured: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """List all deals across all merchants (admin view)"""
    try:
        query = db.query(MerchantDeal).options(
            joinedload(MerchantDeal.preferred_merchant).joinedload(PreferredMerchant.merchant)
        )

        if status:
            query = query.filter(MerchantDeal.status == status)
        if deal_type:
            query = query.filter(MerchantDeal.deal_type == deal_type)
        if is_featured is not None:
            query = query.filter(MerchantDeal.is_featured == is_featured)

        total = query.count()
        total_pages = (total + per_page - 1) // per_page

        deals = query.order_by(
            MerchantDeal.priority.desc(),
            MerchantDeal.created_at.desc()
        ).offset((page - 1) * per_page).limit(per_page).all()

        return {
            "deals": [serialize_deal(d) for d in deals],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error listing deals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/v1/admin/deals/{deal_id}")
async def update_deal(
    deal_id: str,
    request: UpdateDealRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update a deal"""
    try:
        deal = db.query(MerchantDeal).filter(MerchantDeal.id == deal_id).first()
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")

        update_data = request.dict(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(deal, field, value)

        deal.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(deal)

        return {
            "success": True,
            "message": "Deal updated successfully",
            "deal": serialize_deal(deal)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating deal: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/v1/admin/deals/{deal_id}")
async def delete_deal(
    deal_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Delete a deal"""
    try:
        deal = db.query(MerchantDeal).filter(MerchantDeal.id == deal_id).first()
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")

        db.delete(deal)
        db.commit()

        return {
            "success": True,
            "message": "Deal deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting deal: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# MOBILE/CONSUMER ENDPOINTS
# ============================================================================

@router.get("/api/v1/merchants/preferred")
async def get_preferred_merchants_consumer(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    category: Optional[str] = Query(None),
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180),
    radius_km: float = Query(50, ge=0.1, le=100),
    featured_only: bool = Query(False),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get preferred merchants for consumers.
    Sorted by effective_priority (base priority + subscription placement score).
    Optionally filter by location and category.
    """
    try:
        now = datetime.now(timezone.utc)

        query = db.query(PreferredMerchant).options(
            joinedload(PreferredMerchant.merchant)
        ).filter(
            PreferredMerchant.status == 'active',
            or_(
                PreferredMerchant.start_date.is_(None),
                PreferredMerchant.start_date <= now
            ),
            or_(
                PreferredMerchant.end_date.is_(None),
                PreferredMerchant.end_date >= now
            )
        )

        if category:
            query = query.filter(PreferredMerchant.category == category)

        if featured_only:
            query = query.filter(PreferredMerchant.is_featured == True)

        # Get all matching merchants first
        all_merchants = query.all()

        # Fetch subscriptions for all merchants to calculate effective_priority
        merchant_ids = [pm.merchant_id for pm in all_merchants]
        subscriptions = db.query(MerchantSubscription).filter(
            MerchantSubscription.merchant_id.in_(merchant_ids),
            MerchantSubscription.status.in_(['active', 'trialing'])
        ).all()
        sub_map = {str(s.merchant_id): s for s in subscriptions}

        # Calculate effective priority and prepare for sorting
        merchants_with_priority = []
        for pm in all_merchants:
            sub = sub_map.get(str(pm.merchant_id))
            placement_score = sub.placement_score if sub else 0
            effective_priority = (pm.priority or 0) + placement_score
            is_featured = pm.is_featured and (sub.featured_placement if sub else False)
            merchants_with_priority.append((pm, sub, effective_priority, is_featured))

        # Sort by featured status first, then by effective_priority
        merchants_with_priority.sort(key=lambda x: (-int(x[3]), -x[2]))

        # Filter by distance if location provided
        if latitude is not None and longitude is not None:
            filtered = []
            for pm, sub, eff_priority, is_feat in merchants_with_priority:
                if pm.latitude and pm.longitude:
                    dist = calculate_distance(latitude, longitude, pm.latitude, pm.longitude)
                    if dist <= radius_km:
                        filtered.append((pm, sub, eff_priority, is_feat, dist))
                else:
                    # Include merchants without location data
                    filtered.append((pm, sub, eff_priority, is_feat, None))

            # Re-sort: featured first, then by distance (nearby), then by effective_priority
            filtered.sort(key=lambda x: (
                -int(x[3]),  # Featured first
                x[4] if x[4] is not None else float('inf'),  # Distance
                -x[2]  # Effective priority
            ))
            merchants_with_priority = [(pm, sub, ep, feat) for pm, sub, ep, feat, _ in filtered]

        # Paginate
        total = len(merchants_with_priority)
        total_pages = (total + per_page - 1) // per_page
        start = (page - 1) * per_page
        end = start + per_page
        paginated = merchants_with_priority[start:end]

        return {
            "preferred_merchants": [
                serialize_preferred_merchant(pm, latitude, longitude, subscription=sub)
                for pm, sub, _, _ in paginated
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error getting preferred merchants: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/merchants/preferred/{pm_id}")
async def get_preferred_merchant_consumer(
    pm_id: str,
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get a specific preferred merchant with active deals and subscription info"""
    try:
        now = datetime.now(timezone.utc)

        pm = db.query(PreferredMerchant).options(
            joinedload(PreferredMerchant.merchant)
        ).filter(
            PreferredMerchant.id == pm_id,
            PreferredMerchant.status == 'active'
        ).first()

        if not pm:
            raise HTTPException(status_code=404, detail="Merchant not found")

        # Get subscription for placement info
        subscription = get_subscription_for_merchant(pm.merchant_id, db)

        # Get active deals
        active_deals = pm.deals.filter(
            and_(
                MerchantDeal.status == 'active',
                MerchantDeal.start_date <= now,
                MerchantDeal.end_date >= now
            )
        ).order_by(
            MerchantDeal.is_featured.desc(),
            MerchantDeal.priority.desc()
        ).all()

        return {
            "success": True,
            "merchant": serialize_preferred_merchant(pm, latitude, longitude, subscription=subscription),
            "deals": [serialize_deal(d) for d in active_deals]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting merchant details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/deals")
async def get_deals_consumer(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    category: Optional[str] = Query(None),
    deal_type: Optional[str] = Query(None),
    featured_only: bool = Query(False),
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180),
    radius_km: float = Query(50, ge=0.1, le=100),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get all active deals for consumers"""
    try:
        now = datetime.now(timezone.utc)

        query = db.query(MerchantDeal).options(
            joinedload(MerchantDeal.preferred_merchant).joinedload(PreferredMerchant.merchant)
        ).join(PreferredMerchant).filter(
            MerchantDeal.status == 'active',
            MerchantDeal.start_date <= now,
            MerchantDeal.end_date >= now,
            PreferredMerchant.status == 'active'
        )

        if category:
            query = query.filter(PreferredMerchant.category == category)

        if deal_type:
            query = query.filter(MerchantDeal.deal_type == deal_type)

        if featured_only:
            query = query.filter(MerchantDeal.is_featured == True)

        # Get all matching deals
        all_deals = query.order_by(
            MerchantDeal.is_featured.desc(),
            MerchantDeal.priority.desc(),
            MerchantDeal.end_date.asc()  # Expiring soon first
        ).all()

        # Filter by location if provided
        if latitude is not None and longitude is not None:
            filtered = []
            for deal in all_deals:
                pm = deal.preferred_merchant
                if pm and pm.latitude and pm.longitude:
                    dist = calculate_distance(latitude, longitude, pm.latitude, pm.longitude)
                    if dist <= radius_km:
                        filtered.append(deal)
                else:
                    # Include deals without location
                    filtered.append(deal)
            all_deals = filtered

        # Paginate
        total = len(all_deals)
        total_pages = (total + per_page - 1) // per_page
        start = (page - 1) * per_page
        end = start + per_page
        deals = all_deals[start:end]

        # Increment view count for displayed deals
        for deal in deals:
            deal.view_count = (deal.view_count or 0) + 1
        db.commit()

        return {
            "deals": [serialize_deal(d) for d in deals],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error getting deals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/deals/{deal_id}")
async def get_deal_details(
    deal_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get details of a specific deal"""
    try:
        now = datetime.now(timezone.utc)

        deal = db.query(MerchantDeal).options(
            joinedload(MerchantDeal.preferred_merchant).joinedload(PreferredMerchant.merchant)
        ).filter(
            MerchantDeal.id == deal_id,
            MerchantDeal.status == 'active',
            MerchantDeal.start_date <= now,
            MerchantDeal.end_date >= now
        ).first()

        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found or expired")

        # Increment view count
        deal.view_count = (deal.view_count or 0) + 1
        db.commit()

        return {
            "success": True,
            "deal": serialize_deal(deal),
            "merchant": serialize_preferred_merchant(deal.preferred_merchant) if deal.preferred_merchant else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting deal details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/deals/featured")
async def get_featured_deals(
    limit: int = Query(10, ge=1, le=20),
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get featured deals for homepage display"""
    try:
        now = datetime.now(timezone.utc)

        query = db.query(MerchantDeal).options(
            joinedload(MerchantDeal.preferred_merchant).joinedload(PreferredMerchant.merchant)
        ).join(PreferredMerchant).filter(
            MerchantDeal.status == 'active',
            MerchantDeal.is_featured == True,
            MerchantDeal.start_date <= now,
            MerchantDeal.end_date >= now,
            PreferredMerchant.status == 'active'
        ).order_by(
            MerchantDeal.priority.desc()
        ).limit(limit)

        deals = query.all()

        return {
            "featured_deals": [serialize_deal(d) for d in deals]
        }
    except Exception as e:
        logger.error(f"Error getting featured deals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/merchants/preferred/categories")
async def get_merchant_categories(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get list of available merchant categories"""
    try:
        categories = db.query(PreferredMerchant.category).filter(
            PreferredMerchant.status == 'active'
        ).distinct().all()

        return {
            "categories": [c[0] for c in categories if c[0]]
        }
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# SUBSCRIPTION MANAGEMENT ENDPOINTS
# ============================================================================

class CreateSubscriptionRequest(BaseModel):
    """Request model for creating a merchant subscription"""
    merchant_id: str
    tier: str = Field(..., description="Subscription tier: platinum, gold, silver, bronze, free")
    billing_cycle: str = Field(default="monthly", description="monthly or annual")
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    onboarding_id: Optional[str] = None


class UpdateSubscriptionRequest(BaseModel):
    """Request model for updating a subscription"""
    tier: Optional[str] = None
    billing_cycle: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    status: Optional[str] = None


@router.get("/api/v1/subscriptions/tiers")
async def get_subscription_tiers() -> Dict[str, Any]:
    """
    Get available subscription tiers and their benefits.
    This endpoint is public for display during onboarding.
    """
    tiers_info = []
    for tier_name, config in SUBSCRIPTION_TIERS.items():
        tiers_info.append({
            "name": tier_name,
            "display_name": tier_name.capitalize(),
            "placement_score": config["placement_score"],
            "max_active_deals": config["max_active_deals"],
            "featured_placement": config["featured_placement"],
            "banner_enabled": config["banner_enabled"],
            "priority_support": config["priority_support"],
            "analytics_access": config["analytics_access"],
            "custom_branding": config["custom_branding"],
            "monthly_fee": config["monthly_fee"],
            "annual_fee": config["annual_fee"],
            "annual_savings": round(config["monthly_fee"] * 12 - config["annual_fee"], 2)
        })

    # Sort by placement_score descending (highest tier first)
    tiers_info.sort(key=lambda x: x["placement_score"], reverse=True)

    return {
        "tiers": tiers_info
    }


@router.post("/api/v1/admin/subscriptions")
async def create_merchant_subscription(
    request: CreateSubscriptionRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Create a subscription for a merchant.
    This is typically called during merchant onboarding when they select a tier.
    """
    try:
        # Verify merchant exists
        merchant = db.query(Merchant).filter(Merchant.id == request.merchant_id).first()
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")

        # Check if subscription already exists
        existing = db.query(MerchantSubscription).filter(
            MerchantSubscription.merchant_id == request.merchant_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Merchant already has a subscription. Use PUT to update."
            )

        # Validate tier
        if request.tier not in SUBSCRIPTION_TIERS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid tier. Must be one of: {', '.join(SUBSCRIPTION_TIERS.keys())}"
            )

        tier_config = SUBSCRIPTION_TIERS[request.tier]

        # Calculate billing period
        now = datetime.now(timezone.utc)
        if request.billing_cycle == "annual":
            from dateutil.relativedelta import relativedelta
            period_end = now + relativedelta(years=1)
        else:
            from dateutil.relativedelta import relativedelta
            period_end = now + relativedelta(months=1)

        subscription = MerchantSubscription(
            merchant_id=request.merchant_id,
            tier=request.tier,
            monthly_fee=tier_config["monthly_fee"],
            annual_fee=tier_config["annual_fee"],
            billing_cycle=request.billing_cycle,
            stripe_subscription_id=request.stripe_subscription_id,
            stripe_customer_id=request.stripe_customer_id,
            max_active_deals=tier_config["max_active_deals"],
            featured_placement=tier_config["featured_placement"],
            banner_enabled=tier_config["banner_enabled"],
            priority_support=tier_config["priority_support"],
            analytics_access=tier_config["analytics_access"],
            custom_branding=tier_config["custom_branding"],
            placement_score=tier_config["placement_score"],
            status="active",
            current_period_start=now,
            current_period_end=period_end,
            onboarding_id=request.onboarding_id,
            created_at=now,
            updated_at=now
        )

        db.add(subscription)
        db.commit()
        db.refresh(subscription)

        logger.info(f"Created {request.tier} subscription for merchant {request.merchant_id}")

        return {
            "success": True,
            "message": f"Subscription created successfully with {request.tier} tier",
            "subscription": serialize_subscription(subscription)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/admin/subscriptions/{merchant_id}")
async def get_merchant_subscription(
    merchant_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get subscription details for a merchant"""
    try:
        subscription = db.query(MerchantSubscription).filter(
            MerchantSubscription.merchant_id == merchant_id
        ).first()

        if not subscription:
            # Return free tier info if no subscription
            return {
                "success": True,
                "has_subscription": False,
                "effective_tier": "free",
                "tier_benefits": SUBSCRIPTION_TIERS["free"]
            }

        return {
            "success": True,
            "has_subscription": True,
            "subscription": serialize_subscription(subscription)
        }
    except Exception as e:
        logger.error(f"Error getting subscription: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/v1/admin/subscriptions/{merchant_id}")
async def update_merchant_subscription(
    merchant_id: str,
    request: UpdateSubscriptionRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Update a merchant's subscription.
    Used for tier upgrades/downgrades or status changes.
    """
    try:
        subscription = db.query(MerchantSubscription).filter(
            MerchantSubscription.merchant_id == merchant_id
        ).first()

        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")

        # If tier is being changed, update all tier-related fields
        if request.tier and request.tier != subscription.tier:
            if request.tier not in SUBSCRIPTION_TIERS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid tier. Must be one of: {', '.join(SUBSCRIPTION_TIERS.keys())}"
                )

            tier_config = SUBSCRIPTION_TIERS[request.tier]
            subscription.tier = request.tier
            subscription.monthly_fee = tier_config["monthly_fee"]
            subscription.annual_fee = tier_config["annual_fee"]
            subscription.max_active_deals = tier_config["max_active_deals"]
            subscription.featured_placement = tier_config["featured_placement"]
            subscription.banner_enabled = tier_config["banner_enabled"]
            subscription.priority_support = tier_config["priority_support"]
            subscription.analytics_access = tier_config["analytics_access"]
            subscription.custom_branding = tier_config["custom_branding"]
            subscription.placement_score = tier_config["placement_score"]

            logger.info(f"Merchant {merchant_id} changed tier to {request.tier}")

        # Update other fields if provided
        if request.billing_cycle:
            subscription.billing_cycle = request.billing_cycle
        if request.stripe_subscription_id:
            subscription.stripe_subscription_id = request.stripe_subscription_id
        if request.stripe_customer_id:
            subscription.stripe_customer_id = request.stripe_customer_id
        if request.status:
            subscription.status = request.status

        subscription.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(subscription)

        return {
            "success": True,
            "message": "Subscription updated successfully",
            "subscription": serialize_subscription(subscription)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating subscription: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/v1/admin/subscriptions/{merchant_id}")
async def cancel_merchant_subscription(
    merchant_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Cancel a merchant's subscription.
    Sets status to 'cancelled' but keeps the record for history.
    """
    try:
        subscription = db.query(MerchantSubscription).filter(
            MerchantSubscription.merchant_id == merchant_id
        ).first()

        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")

        subscription.status = "cancelled"
        subscription.updated_at = datetime.now(timezone.utc)
        db.commit()

        logger.info(f"Cancelled subscription for merchant {merchant_id}")

        return {
            "success": True,
            "message": "Subscription cancelled successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling subscription: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/v1/admin/subscriptions")
async def list_all_subscriptions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    tier: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """List all merchant subscriptions (admin view)"""
    try:
        query = db.query(MerchantSubscription)

        if tier:
            query = query.filter(MerchantSubscription.tier == tier)
        if status:
            query = query.filter(MerchantSubscription.status == status)

        total = query.count()
        total_pages = (total + per_page - 1) // per_page

        subscriptions = query.order_by(
            MerchantSubscription.placement_score.desc(),
            MerchantSubscription.created_at.desc()
        ).offset((page - 1) * per_page).limit(per_page).all()

        return {
            "subscriptions": [serialize_subscription(s) for s in subscriptions],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error listing subscriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))
