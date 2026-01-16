"""
Location Services API Routes for SwipeSavvy

Provides endpoints for:
- Geocoding and reverse geocoding
- Nearby merchant/place search
- Route calculation
- Geofence management
- Device location tracking
- Location-based merchant offers

Uses AWS Location Service for all geospatial operations.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from pydantic import BaseModel, Field, validator
from datetime import datetime, timezone, timedelta
import logging

from app.database import get_db
from app.models import PreferredMerchant
from sqlalchemy import and_

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/location", tags=["location"])

# Initialize service
location_service = None

try:
    from app.services.aws_location_service import (
        aws_location_service,
        TravelMode,
        DistanceUnit
    )
    location_service = aws_location_service
    logger.info("AWS Location Service initialized")
except Exception as e:
    logger.warning(f"AWS Location Service initialization deferred: {e}")


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class Coordinates(BaseModel):
    """Geographic coordinates"""
    longitude: float = Field(..., ge=-180, le=180, description="Longitude")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude")


class GeocodeRequest(BaseModel):
    """Request to geocode an address"""
    address: str = Field(..., min_length=1, description="Address to geocode")
    bias_longitude: Optional[float] = Field(None, description="Bias longitude")
    bias_latitude: Optional[float] = Field(None, description="Bias latitude")
    max_results: int = Field(5, ge=1, le=50, description="Maximum results")


class ReverseGeocodeRequest(BaseModel):
    """Request to reverse geocode coordinates"""
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)
    max_results: int = Field(5, ge=1, le=50)


class NearbySearchRequest(BaseModel):
    """Request to search for nearby places"""
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)
    radius_km: float = Field(5.0, ge=0.1, le=50, description="Search radius in km")
    categories: Optional[List[str]] = Field(None, description="Place categories to filter")
    max_results: int = Field(20, ge=1, le=100)


class PlaceSearchRequest(BaseModel):
    """Request to search for places by query"""
    query: str = Field(..., min_length=1, description="Search query")
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    max_results: int = Field(10, ge=1, le=50)


class RouteRequest(BaseModel):
    """Request to calculate a route"""
    origin_longitude: float = Field(..., ge=-180, le=180)
    origin_latitude: float = Field(..., ge=-90, le=90)
    destination_longitude: float = Field(..., ge=-180, le=180)
    destination_latitude: float = Field(..., ge=-90, le=90)
    travel_mode: str = Field("Car", description="Travel mode: Car, Truck, Walking")
    waypoints: Optional[List[Coordinates]] = Field(None, description="Intermediate stops")
    avoid_tolls: bool = Field(False)
    avoid_ferries: bool = Field(False)
    distance_unit: str = Field("Kilometers", description="Kilometers or Miles")

    @validator('travel_mode')
    def validate_travel_mode(cls, v):
        valid = ['Car', 'Truck', 'Walking']
        if v not in valid:
            raise ValueError(f'travel_mode must be one of: {valid}')
        return v

    @validator('distance_unit')
    def validate_distance_unit(cls, v):
        valid = ['Kilometers', 'Miles']
        if v not in valid:
            raise ValueError(f'distance_unit must be one of: {valid}')
        return v


class GeofenceRequest(BaseModel):
    """Request to create a geofence"""
    geofence_id: str = Field(..., min_length=1, max_length=100, description="Unique geofence ID")
    center_longitude: float = Field(..., ge=-180, le=180)
    center_latitude: float = Field(..., ge=-90, le=90)
    radius_meters: float = Field(..., ge=1, le=100000, description="Radius in meters")
    metadata: Optional[dict] = Field(None, description="Optional metadata")


class PolygonGeofenceRequest(BaseModel):
    """Request to create a polygon geofence"""
    geofence_id: str = Field(..., min_length=1, max_length=100)
    polygon: List[Coordinates] = Field(..., min_items=3, description="Polygon vertices")
    metadata: Optional[dict] = Field(None)


class DevicePositionUpdate(BaseModel):
    """Update device position"""
    device_id: str = Field(..., description="Device identifier")
    longitude: float = Field(..., ge=-180, le=180)
    latitude: float = Field(..., ge=-90, le=90)
    accuracy_meters: Optional[float] = Field(None, ge=0, description="Position accuracy")
    properties: Optional[dict] = Field(None, description="Additional properties")


class LocationResponse(BaseModel):
    """Standard location API response"""
    success: bool
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    data: Optional[dict] = None


# ============================================================================
# GEOCODING ENDPOINTS
# ============================================================================

@router.post("/geocode", response_model=LocationResponse)
async def geocode_address(
    request: GeocodeRequest,
    db: Session = Depends(get_db)
):
    """
    Convert an address to geographic coordinates.

    **Request Body:**
    - address: The address to geocode
    - bias_longitude, bias_latitude: Optional bias location
    - max_results: Maximum number of results (1-50)

    **Returns:**
    - results: List of matching locations with coordinates
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        bias_position = None
        if request.bias_longitude is not None and request.bias_latitude is not None:
            bias_position = (request.bias_longitude, request.bias_latitude)

        result = await location_service.geocode(
            address=request.address,
            bias_position=bias_position,
            max_results=request.max_results
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Geocoding failed"))

        return LocationResponse(
            success=True,
            message=f"Found {len(result.get('results', []))} location(s)",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Geocode error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reverse-geocode", response_model=LocationResponse)
async def reverse_geocode(
    request: ReverseGeocodeRequest,
    db: Session = Depends(get_db)
):
    """
    Convert geographic coordinates to an address.

    **Request Body:**
    - longitude, latitude: Coordinates to reverse geocode
    - max_results: Maximum number of results

    **Returns:**
    - results: List of matching addresses
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.reverse_geocode(
            longitude=request.longitude,
            latitude=request.latitude,
            max_results=request.max_results
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Reverse geocoding failed"))

        return LocationResponse(
            success=True,
            message=f"Found {len(result.get('results', []))} address(es)",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reverse geocode error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# PLACE SEARCH ENDPOINTS
# ============================================================================

@router.post("/nearby", response_model=LocationResponse)
async def search_nearby_places(
    request: NearbySearchRequest,
    db: Session = Depends(get_db)
):
    """
    Search for places near a location.

    **Request Body:**
    - longitude, latitude: Center point
    - radius_km: Search radius in kilometers
    - categories: Optional category filter (e.g., ["restaurant", "atm"])
    - max_results: Maximum results

    **Returns:**
    - results: List of nearby places with distance
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.search_nearby(
            longitude=request.longitude,
            latitude=request.latitude,
            categories=request.categories,
            radius_km=request.radius_km,
            max_results=request.max_results
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Search failed"))

        return LocationResponse(
            success=True,
            message=f"Found {len(result.get('results', []))} nearby place(s)",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Nearby search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=LocationResponse)
async def search_places(
    request: PlaceSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Search for places by name or query.

    **Request Body:**
    - query: Search query (e.g., "Starbucks", "ATM")
    - longitude, latitude: Optional bias location
    - max_results: Maximum results

    **Returns:**
    - results: List of matching places
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.search_places(
            query=request.query,
            longitude=request.longitude,
            latitude=request.latitude,
            max_results=request.max_results
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Search failed"))

        return LocationResponse(
            success=True,
            message=f"Found {len(result.get('results', []))} place(s)",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Place search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/nearby-merchants", response_model=LocationResponse)
async def get_nearby_merchants(
    longitude: float = Query(..., ge=-180, le=180),
    latitude: float = Query(..., ge=-90, le=90),
    radius_km: float = Query(5.0, ge=0.1, le=50),
    cashback_only: bool = Query(False, description="Only show merchants with cashback"),
    db: Session = Depends(get_db)
):
    """
    Get nearby merchants with cashback offers.

    This is a specialized endpoint that combines location search
    with merchant/cashback data.

    **Query Parameters:**
    - longitude, latitude: User's location
    - radius_km: Search radius
    - cashback_only: Filter to only merchants with active cashback

    **Returns:**
    - merchants: List of nearby merchants with cashback rates
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        # Get nearby places
        result = await location_service.search_nearby(
            longitude=longitude,
            latitude=latitude,
            radius_km=radius_km,
            max_results=50
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Search failed"))

        # Join with merchant database to get actual cashback rates
        places = result.get("results", [])

        # Get merchants from database within the search radius
        # Using Haversine formula to calculate distance:
        # distance = 2 * R * asin(sqrt(sin²((lat2-lat1)/2) + cos(lat1) * cos(lat2) * sin²((lon2-lon1)/2)))
        from math import radians, cos, sin, asin, sqrt

        def haversine_distance(lon1, lat1, lon2, lat2):
            """Calculate distance in km between two points"""
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            km = 6371 * c  # Radius of earth in kilometers
            return km

        # Query merchants from database
        db_merchants = db.query(PreferredMerchant).filter(
            PreferredMerchant.status == 'active'
        ).all()

        # Helper function to match place with merchant
        def find_matching_merchant(place, merchants, user_lon, user_lat, max_radius):
            """Find matching merchant for a place"""
            place_name = place.get('name', '').lower()
            for merchant in merchants:
                if (merchant.latitude and merchant.longitude and
                    haversine_distance(user_lon, user_lat, merchant.longitude, merchant.latitude) <= max_radius):
                    merchant_name = (merchant.display_name or '').lower()
                    if place_name in merchant_name or merchant_name in place_name:
                        return merchant
            return None

        # Helper function to enrich place with merchant data
        def enrich_place_with_merchant(place, merchant):
            """Add merchant data to place"""
            if merchant:
                place['merchant_id'] = str(merchant.merchant_id)
                place['cashback_rate'] = float(merchant.cashback_percentage) if merchant.cashback_percentage else 0.0
                place['bonus_points_multiplier'] = float(merchant.bonus_points_multiplier) if merchant.bonus_points_multiplier else 1.0
                place['is_featured'] = merchant.is_featured
                place['category'] = merchant.category
                place['logo_url'] = merchant.logo_url
            else:
                place['cashback_rate'] = 0.0
                place['bonus_points_multiplier'] = 1.0
                place['is_featured'] = False
            return place

        # Filter merchants within radius and enrich with cashback data
        enriched_merchants = []
        for place in places:
            matched_merchant = find_matching_merchant(place, db_merchants, longitude, latitude, radius_km)
            enriched_place = enrich_place_with_merchant(place, matched_merchant)
            enriched_merchants.append(enriched_place)

        # Filter if cashback_only is requested
        if cashback_only:
            enriched_merchants = [m for m in enriched_merchants if m.get('cashback_rate', 0) > 0]

        # Sort by cashback rate (highest first)
        enriched_merchants.sort(key=lambda x: x.get('cashback_rate', 0), reverse=True)

        return LocationResponse(
            success=True,
            message=f"Found {len(enriched_merchants)} nearby merchant(s)",
            data={
                "merchants": enriched_merchants,
                "center": {"longitude": longitude, "latitude": latitude},
                "radius_km": radius_km,
                "total_with_cashback": sum(1 for m in enriched_merchants if m.get('cashback_rate', 0) > 0)
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Nearby merchants error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ROUTE CALCULATION ENDPOINTS
# ============================================================================

@router.post("/route", response_model=LocationResponse)
async def calculate_route(
    request: RouteRequest,
    db: Session = Depends(get_db)
):
    """
    Calculate a route between two points.

    **Request Body:**
    - origin_longitude, origin_latitude: Starting point
    - destination_longitude, destination_latitude: Ending point
    - travel_mode: Car, Truck, or Walking
    - waypoints: Optional intermediate stops
    - avoid_tolls, avoid_ferries: Route preferences
    - distance_unit: Kilometers or Miles

    **Returns:**
    - route: Route details with distance, duration, and steps
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        origin = (request.origin_longitude, request.origin_latitude)
        destination = (request.destination_longitude, request.destination_latitude)

        waypoints = None
        if request.waypoints:
            waypoints = [(wp.longitude, wp.latitude) for wp in request.waypoints]

        travel_mode = TravelMode(request.travel_mode)
        distance_unit = DistanceUnit(request.distance_unit)

        result = await location_service.calculate_route(
            origin=origin,
            destination=destination,
            travel_mode=travel_mode,
            waypoints=waypoints,
            avoid_tolls=request.avoid_tolls,
            avoid_ferries=request.avoid_ferries,
            distance_unit=distance_unit
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Route calculation failed"))

        return LocationResponse(
            success=True,
            message="Route calculated",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Route calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/route-to-merchant", response_model=LocationResponse)
async def route_to_merchant(
    user_longitude: float = Query(..., ge=-180, le=180),
    user_latitude: float = Query(..., ge=-90, le=90),
    merchant_longitude: float = Query(..., ge=-180, le=180),
    merchant_latitude: float = Query(..., ge=-90, le=90),
    travel_mode: str = Query("Car"),
    db: Session = Depends(get_db)
):
    """
    Get directions to a merchant location.

    **Query Parameters:**
    - user_longitude, user_latitude: User's current location
    - merchant_longitude, merchant_latitude: Merchant location
    - travel_mode: Car, Truck, or Walking
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.calculate_route(
            origin=(user_longitude, user_latitude),
            destination=(merchant_longitude, merchant_latitude),
            travel_mode=TravelMode(travel_mode)
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Route calculation failed"))

        return LocationResponse(
            success=True,
            message="Directions calculated",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Route to merchant error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# GEOFENCE ENDPOINTS
# ============================================================================

@router.post("/geofence", response_model=LocationResponse)
async def create_geofence(
    request: GeofenceRequest,
    db: Session = Depends(get_db)
):
    """
    Create a circular geofence.

    Used for location-based notifications (e.g., notify user when near a merchant).

    **Request Body:**
    - geofence_id: Unique identifier
    - center_longitude, center_latitude: Center point
    - radius_meters: Radius in meters
    - metadata: Optional metadata
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.create_geofence(
            geofence_id=request.geofence_id,
            center=(request.center_longitude, request.center_latitude),
            radius_meters=request.radius_meters,
            metadata=request.metadata
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Geofence creation failed"))

        return LocationResponse(
            success=True,
            message="Geofence created",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create geofence error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/geofence/polygon", response_model=LocationResponse)
async def create_polygon_geofence(
    request: PolygonGeofenceRequest,
    db: Session = Depends(get_db)
):
    """
    Create a polygon geofence.

    Used for complex geographic areas (e.g., shopping districts).

    **Request Body:**
    - geofence_id: Unique identifier
    - polygon: List of coordinates forming the polygon
    - metadata: Optional metadata
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        polygon_coords = [(p.longitude, p.latitude) for p in request.polygon]

        result = await location_service.create_polygon_geofence(
            geofence_id=request.geofence_id,
            polygon=polygon_coords,
            metadata=request.metadata
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Geofence creation failed"))

        return LocationResponse(
            success=True,
            message="Polygon geofence created",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create polygon geofence error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/geofence/{geofence_id}", response_model=LocationResponse)
async def delete_geofence(
    geofence_id: str,
    db: Session = Depends(get_db)
):
    """Delete a geofence."""
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.delete_geofence(geofence_id)

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Deletion failed"))

        return LocationResponse(
            success=True,
            message="Geofence deleted",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete geofence error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/geofences", response_model=LocationResponse)
async def list_geofences(
    max_results: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """List all geofences."""
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.list_geofences(max_results=max_results)

        return LocationResponse(
            success=True,
            message=f"Found {len(result.get('geofences', []))} geofence(s)",
            data=result
        )

    except Exception as e:
        logger.error(f"List geofences error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/geofence/evaluate", response_model=LocationResponse)
async def evaluate_geofences(
    device_id: str = Query(..., description="Device identifier"),
    longitude: float = Query(..., ge=-180, le=180),
    latitude: float = Query(..., ge=-90, le=90),
    db: Session = Depends(get_db)
):
    """
    Evaluate which geofences contain a position.

    Used to check if a user is near a merchant with active offers.
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.evaluate_geofences(
            device_id=device_id,
            position=(longitude, latitude)
        )

        return LocationResponse(
            success=True,
            message="Geofences evaluated",
            data=result
        )

    except Exception as e:
        logger.error(f"Evaluate geofences error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# DEVICE TRACKING ENDPOINTS
# ============================================================================

@router.post("/track", response_model=LocationResponse)
async def update_device_position(
    request: DevicePositionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a device's position for tracking.

    Used for tracking user location for:
    - Nearby merchant notifications
    - Fraud detection (unusual transaction locations)
    - Delivery tracking

    **Request Body:**
    - device_id: Device identifier
    - longitude, latitude: Current position
    - accuracy_meters: Position accuracy
    - properties: Additional metadata
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.update_device_position(
            device_id=request.device_id,
            position=(request.longitude, request.latitude),
            accuracy=request.accuracy_meters,
            position_properties=request.properties
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Position update failed"))

        return LocationResponse(
            success=True,
            message="Position updated",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update position error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/track/{device_id}", response_model=LocationResponse)
async def get_device_position(
    device_id: str,
    db: Session = Depends(get_db)
):
    """Get the latest position for a device."""
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        result = await location_service.get_device_position(device_id)

        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error", "Device not found"))

        return LocationResponse(
            success=True,
            message="Position retrieved",
            data=result
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get position error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/track/{device_id}/history", response_model=LocationResponse)
async def get_device_position_history(
    device_id: str,
    hours: int = Query(24, ge=1, le=168, description="Hours of history"),
    max_results: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get position history for a device.

    **Query Parameters:**
    - device_id: Device identifier
    - hours: Number of hours of history (1-168)
    - max_results: Maximum positions to return
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        start_time = datetime.now(timezone.utc) - timedelta(hours=hours)

        result = await location_service.get_device_position_history(
            device_id=device_id,
            start_time=start_time,
            max_results=max_results
        )

        return LocationResponse(
            success=True,
            message=f"Retrieved {len(result.get('positions', []))} position(s)",
            data=result
        )

    except Exception as e:
        logger.error(f"Get position history error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@router.get("/distance", response_model=LocationResponse)
async def calculate_distance(
    lon1: float = Query(..., ge=-180, le=180),
    lat1: float = Query(..., ge=-90, le=90),
    lon2: float = Query(..., ge=-180, le=180),
    lat2: float = Query(..., ge=-90, le=90)
):
    """
    Calculate the distance between two points.

    Uses the Haversine formula for accurate distance calculation.

    **Returns:**
    - distance_km: Distance in kilometers
    - distance_miles: Distance in miles
    """
    if not location_service:
        raise HTTPException(status_code=503, detail="Location service not available")

    try:
        distance_km = location_service.calculate_distance(
            point1=(lon1, lat1),
            point2=(lon2, lat2)
        )

        return LocationResponse(
            success=True,
            message="Distance calculated",
            data={
                "distance_km": round(distance_km, 3),
                "distance_miles": round(distance_km * 0.621371, 3),
                "point1": {"longitude": lon1, "latitude": lat1},
                "point2": {"longitude": lon2, "latitude": lat2}
            }
        )

    except Exception as e:
        logger.error(f"Calculate distance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
