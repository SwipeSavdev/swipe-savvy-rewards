"""
Merchant Network Management API
Purpose: Handle merchant CRUD operations, geofencing, location tracking, and proximity-based campaigns
Created: December 26, 2025
Tech: FastAPI, PostgreSQL, Geofencing
"""

from fastapi import APIRouter, HTTPException, Query, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
import json
import math
import logging
from sqlalchemy import text, and_, or_
from sqlalchemy.orm import Session
import database

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/merchants", tags=["merchants"])

# ═════════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ═════════════════════════════════════════════════════════════════════════════

class MerchantCategory(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    icon_name: Optional[str] = None
    color_code: Optional[str] = None
    is_active: bool = True


class MerchantCreate(BaseModel):
    merchant_id: str
    name: str
    description: Optional[str] = None
    category_id: int
    
    # Location
    latitude: float
    longitude: float
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    
    # Contact
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    
    # Operating hours format: {day: {open: "HH:MM", close: "HH:MM"}}
    operating_hours: Optional[dict] = None
    
    # Metadata
    metadata: Optional[dict] = None


class MerchantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    operating_hours: Optional[dict] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    metadata: Optional[dict] = None


class MerchantResponse(BaseModel):
    id: int
    merchant_id: str
    name: str
    description: Optional[str]
    category_id: int
    latitude: float
    longitude: float
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    rating: Optional[float]
    total_reviews: int
    is_active: bool
    is_featured: bool
    created_at: datetime


class LocationData(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    accuracy_meters: Optional[int] = None
    address: Optional[str] = None
    location_source: str = "gps"  # gps, wifi, cellular
    device_id: Optional[str] = None
    app_version: Optional[str] = None


class GeofenceZoneCreate(BaseModel):
    merchant_id: int
    zone_name: Optional[str] = None
    zone_type: str = "radius"  # radius or polygon
    radius_meters: Optional[int] = 500  # Default 500m
    polygon_coordinates: Optional[List[dict]] = None
    is_active: bool = True
    trigger_campaign: bool = True
    trigger_dwell_time_minutes: int = 2


class PreferredMerchantUpdate(BaseModel):
    partnership_type: Optional[str] = None
    commission_rate: Optional[float] = None
    max_campaigns_per_month: Optional[int] = None
    preferred_campaign_types: Optional[List[str]] = None


class NearbyMerchantsRequest(BaseModel):
    latitude: float
    longitude: float
    radius_miles: float = 1.0  # Default 1 mile search radius
    category_id: Optional[int] = None
    limit: int = 20


# ═════════════════════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═════════════════════════════════════════════════════════════════════════════

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates in miles using Haversine formula
    """
    R = 3959  # Earth's radius in miles
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c


def is_point_in_polygon(lat: float, lon: float, polygon: List[dict]) -> bool:
    """
    Check if a point is inside a polygon using ray casting algorithm
    polygon: [{lat: x, lng: y}, ...]
    """
    x, y = lon, lat
    n = len(polygon)
    inside = False
    
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]["lng"], polygon[i]["lat"]
        xj, yj = polygon[j]["lng"], polygon[j]["lat"]
        
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    
    return inside


def get_db():
    """Database dependency"""
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ═════════════════════════════════════════════════════════════════════════════
# MERCHANT CRUD ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/categories", response_model=List[MerchantCategory])
async def get_merchant_categories(db: Session = Depends(get_db)):
    """Get all merchant categories"""
    try:
        categories = db.execute(
            text("SELECT * FROM merchant_categories WHERE is_active = TRUE ORDER BY name")
        ).mappings().all()
        return [dict(row) for row in categories]
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch categories")


@router.post("/", response_model=MerchantResponse)
async def create_merchant(merchant: MerchantCreate, db: Session = Depends(get_db)):
    """Create new merchant"""
    try:
        query = text("""
            INSERT INTO merchants (
                merchant_id, name, description, category_id, 
                latitude, longitude, address, city, state, zip_code,
                phone, email, website, operating_hours, metadata
            ) VALUES (
                :merchant_id, :name, :description, :category_id,
                :latitude, :longitude, :address, :city, :state, :zip_code,
                :phone, :email, :website, :operating_hours, :metadata
            )
            RETURNING id, merchant_id, name, description, category_id,
                     latitude, longitude, address, city, state, zip_code,
                     phone, email, website, rating, total_reviews, 
                     is_active, is_featured, created_at
        """)
        
        result = db.execute(query, {
            "merchant_id": merchant.merchant_id,
            "name": merchant.name,
            "description": merchant.description,
            "category_id": merchant.category_id,
            "latitude": merchant.latitude,
            "longitude": merchant.longitude,
            "address": merchant.address,
            "city": merchant.city,
            "state": merchant.state,
            "zip_code": merchant.zip_code,
            "phone": merchant.phone,
            "email": merchant.email,
            "website": merchant.website,
            "operating_hours": json.dumps(merchant.operating_hours) if merchant.operating_hours else None,
            "metadata": json.dumps(merchant.metadata) if merchant.metadata else None
        }).mappings().first()
        
        db.commit()
        return dict(result)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating merchant: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{merchant_id}", response_model=MerchantResponse)
async def get_merchant(merchant_id: str, db: Session = Depends(get_db)):
    """Get merchant by merchant_id"""
    try:
        result = db.execute(
            text("""
                SELECT id, merchant_id, name, description, category_id,
                       latitude, longitude, address, city, state, zip_code,
                       phone, email, website, rating, total_reviews,
                       is_active, is_featured, created_at
                FROM merchants
                WHERE merchant_id = :merchant_id
            """),
            {"merchant_id": merchant_id}
        ).mappings().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Merchant not found")
        return dict(result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching merchant: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch merchant")


@router.put("/{merchant_id}", response_model=MerchantResponse)
async def update_merchant(
    merchant_id: str,
    merchant: MerchantUpdate,
    db: Session = Depends(get_db)
):
    """Update merchant"""
    try:
        # Build dynamic update query
        updates = []
        params = {"merchant_id": merchant_id}
        
        if merchant.name is not None:
            updates.append("name = :name")
            params["name"] = merchant.name
        if merchant.description is not None:
            updates.append("description = :description")
            params["description"] = merchant.description
        if merchant.latitude is not None:
            updates.append("latitude = :latitude")
            params["latitude"] = merchant.latitude
        if merchant.longitude is not None:
            updates.append("longitude = :longitude")
            params["longitude"] = merchant.longitude
        if merchant.address is not None:
            updates.append("address = :address")
            params["address"] = merchant.address
        if merchant.city is not None:
            updates.append("city = :city")
            params["city"] = merchant.city
        if merchant.state is not None:
            updates.append("state = :state")
            params["state"] = merchant.state
        if merchant.zip_code is not None:
            updates.append("zip_code = :zip_code")
            params["zip_code"] = merchant.zip_code
        if merchant.phone is not None:
            updates.append("phone = :phone")
            params["phone"] = merchant.phone
        if merchant.email is not None:
            updates.append("email = :email")
            params["email"] = merchant.email
        if merchant.website is not None:
            updates.append("website = :website")
            params["website"] = merchant.website
        if merchant.rating is not None:
            updates.append("rating = :rating")
            params["rating"] = merchant.rating
        if merchant.is_active is not None:
            updates.append("is_active = :is_active")
            params["is_active"] = merchant.is_active
        if merchant.is_featured is not None:
            updates.append("is_featured = :is_featured")
            params["is_featured"] = merchant.is_featured
        if merchant.operating_hours is not None:
            updates.append("operating_hours = :operating_hours")
            params["operating_hours"] = json.dumps(merchant.operating_hours)
        if merchant.metadata is not None:
            updates.append("metadata = :metadata")
            params["metadata"] = json.dumps(merchant.metadata)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        updates.append("updated_at = CURRENT_TIMESTAMP")
        
        query = f"""
            UPDATE merchants
            SET {', '.join(updates)}
            WHERE merchant_id = :merchant_id
            RETURNING id, merchant_id, name, description, category_id,
                     latitude, longitude, address, city, state, zip_code,
                     phone, email, website, rating, total_reviews,
                     is_active, is_featured, created_at
        """
        
        result = db.execute(text(query), params).mappings().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        db.commit()
        return dict(result)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating merchant: {e}")
        raise HTTPException(status_code=500, detail="Failed to update merchant")


@router.delete("/{merchant_id}")
async def delete_merchant(merchant_id: str, db: Session = Depends(get_db)):
    """Delete merchant (soft delete by setting is_active=False)"""
    try:
        db.execute(
            text("UPDATE merchants SET is_active = FALSE WHERE merchant_id = :merchant_id"),
            {"merchant_id": merchant_id}
        )
        db.commit()
        return {"message": "Merchant deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting merchant: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete merchant")


@router.get("/", response_model=List[MerchantResponse])
async def list_merchants(
    category_id: Optional[int] = None,
    is_featured: Optional[bool] = None,
    limit: int = Query(50, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """List merchants with optional filters"""
    try:
        query = "SELECT id, merchant_id, name, description, category_id, latitude, longitude, address, city, state, zip_code, phone, email, website, rating, total_reviews, is_active, is_featured, created_at FROM merchants WHERE is_active = TRUE"
        params = {}
        
        if category_id is not None:
            query += " AND category_id = :category_id"
            params["category_id"] = category_id
        
        if is_featured is not None:
            query += " AND is_featured = :is_featured"
            params["is_featured"] = is_featured
        
        query += " ORDER BY rating DESC LIMIT :limit OFFSET :offset"
        params["limit"] = limit
        params["offset"] = offset
        
        results = db.execute(text(query), params).mappings().all()
        return [dict(row) for row in results]
    except Exception as e:
        logger.error(f"Error listing merchants: {e}")
        raise HTTPException(status_code=500, detail="Failed to list merchants")


# ═════════════════════════════════════════════════════════════════════════════
# GEOFENCING ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/geofence/zones", response_model=dict)
async def create_geofence_zone(zone: GeofenceZoneCreate, db: Session = Depends(get_db)):
    """Create geofence zone for merchant"""
    try:
        query = text("""
            INSERT INTO merchant_geofence_zones (
                merchant_id, zone_name, zone_type, radius_meters,
                polygon_coordinates, is_active, trigger_campaign,
                trigger_dwell_time_minutes
            ) VALUES (
                :merchant_id, :zone_name, :zone_type, :radius_meters,
                :polygon_coordinates, :is_active, :trigger_campaign,
                :trigger_dwell_time_minutes
            )
            RETURNING id, merchant_id, zone_name, zone_type, radius_meters,
                     polygon_coordinates, is_active, trigger_campaign,
                     trigger_dwell_time_minutes, created_at
        """)
        
        result = db.execute(query, {
            "merchant_id": zone.merchant_id,
            "zone_name": zone.zone_name,
            "zone_type": zone.zone_type,
            "radius_meters": zone.radius_meters,
            "polygon_coordinates": json.dumps(zone.polygon_coordinates) if zone.polygon_coordinates else None,
            "is_active": zone.is_active,
            "trigger_campaign": zone.trigger_campaign,
            "trigger_dwell_time_minutes": zone.trigger_dwell_time_minutes
        }).mappings().first()
        
        db.commit()
        return {
            "id": result.id,
            "merchant_id": result.merchant_id,
            "zone_name": result.zone_name,
            "zone_type": result.zone_type,
            "radius_meters": result.radius_meters,
            "is_active": result.is_active,
            "created_at": result.created_at.isoformat()
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating geofence zone: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/geofence/merchant/{merchant_id}", response_model=List[dict])
async def get_merchant_geofences(merchant_id: int, db: Session = Depends(get_db)):
    """Get all geofence zones for a merchant"""
    try:
        results = db.execute(
            text("""
                SELECT id, merchant_id, zone_name, zone_type, radius_meters,
                       is_active, trigger_campaign, trigger_dwell_time_minutes,
                       created_at
                FROM merchant_geofence_zones
                WHERE merchant_id = :merchant_id AND is_active = TRUE
            """),
            {"merchant_id": merchant_id}
        ).mappings().all()
        
        return [dict(row) for row in results]
    except Exception as e:
        logger.error(f"Error fetching geofences: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch geofences")


# ═════════════════════════════════════════════════════════════════════════════
# LOCATION TRACKING ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/location/track")
async def track_user_location(
    location: LocationData,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Track user location and check for geofence triggers
    This endpoint is called frequently from mobile app
    """
    try:
        # Find nearest merchant
        merchants = db.execute(
            text("""
                SELECT id, latitude, longitude
                FROM merchants
                WHERE is_active = TRUE
                LIMIT 1000
            """)
        ).mappings().all()
        
        nearest_merchant = None
        min_distance = float('inf')
        
        for merchant in merchants:
            distance = haversine_distance(
                location.latitude, location.longitude,
                merchant['latitude'], merchant['longitude']
            )
            if distance < min_distance:
                min_distance = distance
                nearest_merchant = merchant
        
        # Check for geofence triggers
        geofence_triggered = False
        geofence_zone_id = None
        
        if nearest_merchant:
            geofences = db.execute(
                text("""
                    SELECT id, zone_type, radius_meters, polygon_coordinates,
                           trigger_campaign, trigger_dwell_time_minutes
                    FROM merchant_geofence_zones
                    WHERE merchant_id = :merchant_id AND is_active = TRUE
                """),
                {"merchant_id": nearest_merchant['id']}
            ).mappings().all()
            
            for geofence in geofences:
                if geofence['zone_type'] == 'radius':
                    distance_m = min_distance * 1609.34  # Convert miles to meters
                    if distance_m <= geofence['radius_meters']:
                        geofence_triggered = True
                        geofence_zone_id = geofence['id']
                        break
                elif geofence['zone_type'] == 'polygon':
                    polygon = json.loads(geofence['polygon_coordinates']) if geofence['polygon_coordinates'] else []
                    if is_point_in_polygon(location.latitude, location.longitude, polygon):
                        geofence_triggered = True
                        geofence_zone_id = geofence['id']
                        break
        
        # Store location history
        db.execute(
            text("""
                INSERT INTO user_location_history (
                    user_id, latitude, longitude, accuracy_meters, address,
                    location_source, nearest_merchant_id, distance_to_nearest_meters,
                    is_in_geofence, geofence_zone_id, device_id, app_version
                ) VALUES (
                    :user_id, :latitude, :longitude, :accuracy_meters, :address,
                    :location_source, :nearest_merchant_id, :distance_to_nearest_meters,
                    :is_in_geofence, :geofence_zone_id, :device_id, :app_version
                )
            """),
            {
                "user_id": location.user_id,
                "latitude": location.latitude,
                "longitude": location.longitude,
                "accuracy_meters": location.accuracy_meters,
                "address": location.address,
                "location_source": location.location_source,
                "nearest_merchant_id": nearest_merchant['id'] if nearest_merchant else None,
                "distance_to_nearest_meters": int(min_distance * 1609.34) if nearest_merchant else None,
                "is_in_geofence": geofence_triggered,
                "geofence_zone_id": geofence_zone_id,
                "device_id": location.device_id,
                "app_version": location.app_version
            }
        )
        db.commit()
        
        # Trigger campaign if geofence entered (background task)
        if geofence_triggered and nearest_merchant:
            background_tasks.add_task(
                trigger_geofence_campaign,
                user_id=location.user_id,
                merchant_id=nearest_merchant['id'],
                geofence_zone_id=geofence_zone_id,
                location_lat=location.latitude,
                location_lon=location.longitude
            )
        
        return {
            "success": True,
            "nearest_merchant_id": nearest_merchant['id'] if nearest_merchant else None,
            "distance_miles": round(min_distance, 2),
            "geofence_triggered": geofence_triggered,
            "campaign_queued": geofence_triggered
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error tracking location: {e}")
        raise HTTPException(status_code=500, detail="Failed to track location")


async def trigger_geofence_campaign(user_id: str, merchant_id: int, geofence_zone_id: int, location_lat: float, location_lon: float):
    """Background task to trigger campaigns when user enters merchant geofence"""
    try:
        db = database.SessionLocal()
        
        # Get active campaigns for this merchant
        campaigns = db.execute(
            text("""
                SELECT c.id, c.campaign_id, c.title, c.offer_value,
                       c.offer_type, c.campaign_type
                FROM campaigns c
                JOIN preferred_merchants pm ON c.merchant_id = pm.merchant_id
                WHERE pm.merchant_id = :merchant_id
                  AND c.is_active = TRUE
                  AND c.start_date <= CURRENT_TIMESTAMP
                  AND c.end_date >= CURRENT_TIMESTAMP
                LIMIT 1
            """),
            {"merchant_id": merchant_id}
        ).mappings().all()
        
        if campaigns:
            # Record trigger event
            campaign = campaigns[0]
            db.execute(
                text("""
                    INSERT INTO merchant_campaign_triggers (
                        campaign_id, merchant_id, user_id, trigger_type,
                        trigger_location, delivery_status
                    ) VALUES (
                        :campaign_id, :merchant_id, :user_id, :trigger_type,
                        :trigger_location, :delivery_status
                    )
                """),
                {
                    "campaign_id": campaign['campaign_id'],
                    "merchant_id": merchant_id,
                    "user_id": user_id,
                    "trigger_type": "geofence_entry",
                    "trigger_location": json.dumps({"lat": location_lat, "lng": location_lon}),
                    "delivery_status": "pending"
                }
            )
            db.commit()
            
            logger.info(f"Geofence campaign triggered for user {user_id} at merchant {merchant_id}")
        
        db.close()
    except Exception as e:
        logger.error(f"Error triggering geofence campaign: {e}")


# ═════════════════════════════════════════════════════════════════════════════
# PROXIMITY-BASED SEARCH ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/nearby", response_model=List[dict])
async def find_nearby_merchants(
    request: NearbyMerchantsRequest,
    db: Session = Depends(get_db)
):
    """
    Find merchants near given coordinates
    Returns merchants within specified radius, sorted by distance and rating
    """
    try:
        # Get all active merchants
        merchants = db.execute(
            text("""
                SELECT m.id, m.merchant_id, m.name, m.latitude, m.longitude,
                       m.address, m.city, mc.name as category, m.rating,
                       pm.is_partner, pm.commission_rate
                FROM merchants m
                JOIN merchant_categories mc ON m.category_id = mc.id
                LEFT JOIN preferred_merchants pm ON m.id = pm.merchant_id
                WHERE m.is_active = TRUE
                LIMIT 5000
            """)
        ).mappings().all()
        
        radius_miles = request.radius_miles
        
        # Calculate distances and filter
        nearby = []
        for merchant in merchants:
            distance = haversine_distance(
                request.latitude, request.longitude,
                merchant['latitude'], merchant['longitude']
            )
            
            if distance <= radius_miles:
                nearby.append({
                    "id": merchant['id'],
                    "merchant_id": merchant['merchant_id'],
                    "name": merchant['name'],
                    "latitude": float(merchant['latitude']),
                    "longitude": float(merchant['longitude']),
                    "address": merchant['address'],
                    "city": merchant['city'],
                    "category": merchant['category'],
                    "rating": float(merchant['rating']) if merchant['rating'] else 0,
                    "distance_miles": round(distance, 2),
                    "is_partner": merchant['is_partner'],
                    "commission_rate": float(merchant['commission_rate']) if merchant['commission_rate'] else 0
                })
        
        # Sort by distance, then by rating
        nearby.sort(key=lambda x: (x['distance_miles'], -x['rating']))
        
        return nearby[:request.limit]
    except Exception as e:
        logger.error(f"Error finding nearby merchants: {e}")
        raise HTTPException(status_code=500, detail="Failed to find nearby merchants")


@router.get("/user/{user_id}/favorites", response_model=List[dict])
async def get_user_favorite_merchants(user_id: str, db: Session = Depends(get_db)):
    """Get user's favorite merchants"""
    try:
        results = db.execute(
            text("""
                SELECT m.id, m.merchant_id, m.name, m.latitude, m.longitude,
                       m.address, m.city, mc.name as category, m.rating,
                       ump.visit_count, ump.average_spend, ump.last_visit
                FROM user_merchant_preferences ump
                JOIN merchants m ON ump.merchant_id = m.id
                JOIN merchant_categories mc ON m.category_id = mc.id
                WHERE ump.user_id = :user_id AND ump.is_favorite = TRUE
                      AND m.is_active = TRUE
                ORDER BY ump.visit_count DESC
            """),
            {"user_id": user_id}
        ).mappings().all()
        
        return [dict(row) for row in results]
    except Exception as e:
        logger.error(f"Error fetching user favorites: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch favorites")


@router.post("/user/{user_id}/favorites/{merchant_id}")
async def add_favorite_merchant(user_id: str, merchant_id: int, db: Session = Depends(get_db)):
    """Add merchant to user's favorites"""
    try:
        db.execute(
            text("""
                INSERT INTO user_merchant_preferences (user_id, merchant_id, is_favorite)
                VALUES (:user_id, :merchant_id, TRUE)
                ON CONFLICT (user_id, merchant_id) DO UPDATE SET is_favorite = TRUE
            """),
            {"user_id": user_id, "merchant_id": merchant_id}
        )
        db.commit()
        return {"message": "Merchant added to favorites"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error adding favorite: {e}")
        raise HTTPException(status_code=500, detail="Failed to add favorite")


@router.delete("/user/{user_id}/favorites/{merchant_id}")
async def remove_favorite_merchant(user_id: str, merchant_id: int, db: Session = Depends(get_db)):
    """Remove merchant from user's favorites"""
    try:
        db.execute(
            text("""
                UPDATE user_merchant_preferences
                SET is_favorite = FALSE
                WHERE user_id = :user_id AND merchant_id = :merchant_id
            """),
            {"user_id": user_id, "merchant_id": merchant_id}
        )
        db.commit()
        return {"message": "Merchant removed from favorites"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error removing favorite: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove favorite")


# ═════════════════════════════════════════════════════════════════════════════
# ANALYTICS ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/network/performance", response_model=dict)
async def get_network_performance(db: Session = Depends(get_db)):
    """Get overall merchant network performance"""
    try:
        result = db.execute(
            text("""
                SELECT 
                    COUNT(DISTINCT m.id) as total_merchants,
                    COUNT(DISTINCT CASE WHEN pm.is_partner THEN m.id END) as partner_merchants,
                    SUM(pm.user_visits_total) as total_visits,
                    SUM(pm.campaign_impressions) as total_impressions,
                    SUM(pm.campaign_conversions) as total_conversions,
                    SUM(pm.revenue_from_campaigns) as total_revenue,
                    ROUND(AVG(m.rating), 2) as avg_rating,
                    ROUND(100.0 * SUM(pm.campaign_conversions) / NULLIF(SUM(pm.campaign_impressions), 0), 2) as conversion_rate
                FROM merchants m
                LEFT JOIN preferred_merchants pm ON m.id = pm.merchant_id
                WHERE m.is_active = TRUE
            """)
        ).mappings().first()
        
        return {
            "total_merchants": result['total_merchants'],
            "partner_merchants": result['partner_merchants'],
            "total_visits": result['total_visits'] or 0,
            "total_impressions": result['total_impressions'] or 0,
            "total_conversions": result['total_conversions'] or 0,
            "total_revenue": float(result['total_revenue'] or 0),
            "average_rating": float(result['avg_rating'] or 0),
            "conversion_rate_percent": float(result['conversion_rate'] or 0)
        }
    except Exception as e:
        logger.error(f"Error fetching network performance: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch performance data")


@router.get("/{merchant_id}/analytics", response_model=dict)
async def get_merchant_analytics(merchant_id: int, db: Session = Depends(get_db)):
    """Get analytics for specific merchant"""
    try:
        result = db.execute(
            text("""
                SELECT 
                    m.name, m.rating, m.total_reviews,
                    pm.user_visits_total as visits,
                    pm.campaign_impressions as impressions,
                    pm.campaign_conversions as conversions,
                    pm.revenue_from_campaigns as revenue,
                    pm.average_conversion_rate,
                    pm.average_order_value,
                    pm.customer_satisfaction,
                    pm.active_since
                FROM merchants m
                LEFT JOIN preferred_merchants pm ON m.id = pm.merchant_id
                WHERE m.id = :merchant_id
            """),
            {"merchant_id": merchant_id}
        ).mappings().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        return {
            "name": result['name'],
            "rating": float(result['rating'] or 0),
            "total_reviews": result['total_reviews'],
            "visits": result['visits'] or 0,
            "impressions": result['impressions'] or 0,
            "conversions": result['conversions'] or 0,
            "revenue": float(result['revenue'] or 0),
            "conversion_rate": float(result['average_conversion_rate'] or 0),
            "average_order_value": float(result['average_order_value'] or 0),
            "customer_satisfaction": float(result['customer_satisfaction'] or 0),
            "active_since": result['active_since'].isoformat() if result['active_since'] else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching merchant analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")


if __name__ == "__main__":
    logger.info("Merchant Network API initialized")
