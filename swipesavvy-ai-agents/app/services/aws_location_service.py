"""
AWS Location Service for SwipeSavvy

Provides location-based services using AWS Location Service:
- Geocoding (address to coordinates)
- Reverse geocoding (coordinates to address)
- Place search (nearby merchants, ATMs, etc.)
- Geofencing (location-based triggers)
- Route calculation (directions)
- Device tracking (user location history)

Used for:
- Finding nearby merchants with cashback offers
- Location-based notifications
- Fraud detection (unusual transaction locations)
- Delivery tracking for rewards
"""

import os
import logging
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timezone
from enum import Enum
import json

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# AWS Location Service Resources
PLACE_INDEX_NAME = os.getenv("AWS_LOCATION_PLACE_INDEX", "swipesavvy-places")
MAP_NAME = os.getenv("AWS_LOCATION_MAP", "swipesavvy-map")
ROUTE_CALCULATOR_NAME = os.getenv("AWS_LOCATION_ROUTE_CALCULATOR", "swipesavvy-routes")
GEOFENCE_COLLECTION_NAME = os.getenv("AWS_LOCATION_GEOFENCE_COLLECTION", "swipesavvy-geofences")
TRACKER_NAME = os.getenv("AWS_LOCATION_TRACKER", "swipesavvy-tracker")

# Mock mode for development
MOCK_LOCATION = os.getenv("MOCK_LOCATION", "true").lower() == "true" or not AWS_ACCESS_KEY_ID


class TravelMode(str, Enum):
    """Travel modes for route calculation"""
    CAR = "Car"
    TRUCK = "Truck"
    WALKING = "Walking"


class DistanceUnit(str, Enum):
    """Distance units"""
    KILOMETERS = "Kilometers"
    MILES = "Miles"


class GeofenceEventType(str, Enum):
    """Geofence event types"""
    ENTER = "ENTER"
    EXIT = "EXIT"


class AWSLocationService:
    """AWS Location Service client for SwipeSavvy"""

    def __init__(self):
        self.mock_mode = MOCK_LOCATION
        self.location_client = None
        self.place_index = PLACE_INDEX_NAME
        self.map_name = MAP_NAME
        self.route_calculator = ROUTE_CALCULATOR_NAME
        self.geofence_collection = GEOFENCE_COLLECTION_NAME
        self.tracker_name = TRACKER_NAME

        if not self.mock_mode:
            try:
                self.location_client = boto3.client(
                    'location',
                    region_name=AWS_REGION,
                    aws_access_key_id=AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
                )
                logger.info(f"AWS Location Service initialized in region: {AWS_REGION}")
            except Exception as e:
                logger.error(f"Failed to initialize AWS Location Service: {e}")
                self.mock_mode = True
        else:
            logger.info("AWS Location Service running in MOCK mode")

    # ========================================================================
    # GEOCODING
    # ========================================================================

    async def geocode(
        self,
        address: str,
        bias_position: Optional[Tuple[float, float]] = None,
        max_results: int = 5
    ) -> Dict[str, Any]:
        """
        Convert an address to coordinates (geocoding).

        Args:
            address: The address to geocode
            bias_position: Optional (longitude, latitude) to bias results
            max_results: Maximum number of results (1-50)

        Returns:
            Dict with results containing coordinates and place details
        """
        if self.mock_mode:
            logger.info(f"[MOCK GEOCODE] Address: {address}")
            return {
                "success": True,
                "results": [{
                    "place_id": "mock_place_123",
                    "label": address,
                    "coordinates": {
                        "longitude": -73.9857,
                        "latitude": 40.7484
                    },
                    "address": {
                        "street": "350 5th Ave",
                        "city": "New York",
                        "state": "NY",
                        "postal_code": "10118",
                        "country": "USA"
                    },
                    "relevance": 1.0
                }]
            }

        try:
            params = {
                "IndexName": self.place_index,
                "Text": address,
                "MaxResults": max_results
            }

            if bias_position:
                params["BiasPosition"] = list(bias_position)

            response = self.location_client.search_place_index_for_text(**params)

            results = []
            for result in response.get("Results", []):
                place = result.get("Place", {})
                geometry = place.get("Geometry", {})
                point = geometry.get("Point", [0, 0])

                results.append({
                    "place_id": result.get("PlaceId"),
                    "label": place.get("Label"),
                    "coordinates": {
                        "longitude": point[0],
                        "latitude": point[1]
                    },
                    "address": {
                        "street": place.get("Street"),
                        "city": place.get("Municipality"),
                        "state": place.get("Region"),
                        "postal_code": place.get("PostalCode"),
                        "country": place.get("Country")
                    },
                    "relevance": result.get("Relevance", 0)
                })

            return {"success": True, "results": results}

        except ClientError as e:
            logger.error(f"Geocoding error: {e}")
            return {"success": False, "error": str(e), "results": []}

    async def reverse_geocode(
        self,
        longitude: float,
        latitude: float,
        max_results: int = 5
    ) -> Dict[str, Any]:
        """
        Convert coordinates to an address (reverse geocoding).

        Args:
            longitude: Longitude coordinate
            latitude: Latitude coordinate
            max_results: Maximum number of results

        Returns:
            Dict with address results
        """
        if self.mock_mode:
            logger.info(f"[MOCK REVERSE GEOCODE] Coords: {longitude}, {latitude}")
            return {
                "success": True,
                "results": [{
                    "label": "350 5th Ave, New York, NY 10118, USA",
                    "coordinates": {
                        "longitude": longitude,
                        "latitude": latitude
                    },
                    "address": {
                        "street": "350 5th Ave",
                        "city": "New York",
                        "state": "NY",
                        "postal_code": "10118",
                        "country": "USA"
                    },
                    "distance": 0
                }]
            }

        try:
            response = self.location_client.search_place_index_for_position(
                IndexName=self.place_index,
                Position=[longitude, latitude],
                MaxResults=max_results
            )

            results = []
            for result in response.get("Results", []):
                place = result.get("Place", {})

                results.append({
                    "label": place.get("Label"),
                    "coordinates": {
                        "longitude": longitude,
                        "latitude": latitude
                    },
                    "address": {
                        "street": place.get("Street"),
                        "city": place.get("Municipality"),
                        "state": place.get("Region"),
                        "postal_code": place.get("PostalCode"),
                        "country": place.get("Country")
                    },
                    "distance": result.get("Distance", 0)
                })

            return {"success": True, "results": results}

        except ClientError as e:
            logger.error(f"Reverse geocoding error: {e}")
            return {"success": False, "error": str(e), "results": []}

    # ========================================================================
    # PLACE SEARCH
    # ========================================================================

    async def search_nearby(
        self,
        longitude: float,
        latitude: float,
        categories: Optional[List[str]] = None,
        radius_km: float = 5.0,
        max_results: int = 20
    ) -> Dict[str, Any]:
        """
        Search for places near a location.

        Args:
            longitude: Center longitude
            latitude: Center latitude
            categories: Optional categories (e.g., ["restaurant", "atm", "gas_station"])
            radius_km: Search radius in kilometers
            max_results: Maximum results to return

        Returns:
            Dict with nearby places
        """
        if self.mock_mode:
            logger.info(f"[MOCK NEARBY SEARCH] Center: {longitude}, {latitude}, Radius: {radius_km}km")
            return {
                "success": True,
                "results": [
                    {
                        "place_id": "mock_merchant_1",
                        "name": "Starbucks",
                        "label": "Starbucks, 123 Main St, New York, NY",
                        "coordinates": {
                            "longitude": longitude + 0.001,
                            "latitude": latitude + 0.001
                        },
                        "categories": ["coffee_shop", "restaurant"],
                        "distance_km": 0.15,
                        "cashback_rate": 3.0
                    },
                    {
                        "place_id": "mock_merchant_2",
                        "name": "Target",
                        "label": "Target, 456 Broadway, New York, NY",
                        "coordinates": {
                            "longitude": longitude - 0.002,
                            "latitude": latitude + 0.001
                        },
                        "categories": ["department_store", "shopping"],
                        "distance_km": 0.32,
                        "cashback_rate": 2.5
                    },
                    {
                        "place_id": "mock_atm_1",
                        "name": "Chase ATM",
                        "label": "Chase Bank ATM, 789 5th Ave, New York, NY",
                        "coordinates": {
                            "longitude": longitude + 0.0005,
                            "latitude": latitude - 0.001
                        },
                        "categories": ["atm", "bank"],
                        "distance_km": 0.18,
                        "cashback_rate": None
                    }
                ]
            }

        try:
            # Calculate bounding box from radius
            # Approximate: 1 degree latitude = 111km, 1 degree longitude varies
            lat_offset = radius_km / 111.0
            lon_offset = radius_km / (111.0 * abs(cos(radians(latitude))))

            filter_bbox = [
                longitude - lon_offset,
                latitude - lat_offset,
                longitude + lon_offset,
                latitude + lat_offset
            ]

            params = {
                "IndexName": self.place_index,
                "Position": [longitude, latitude],
                "MaxResults": max_results,
                "FilterBBox": filter_bbox
            }

            if categories:
                params["FilterCategories"] = categories

            response = self.location_client.search_place_index_for_position(**params)

            results = []
            for result in response.get("Results", []):
                place = result.get("Place", {})
                geometry = place.get("Geometry", {})
                point = geometry.get("Point", [longitude, latitude])

                results.append({
                    "place_id": result.get("PlaceId"),
                    "name": place.get("Label", "").split(",")[0],
                    "label": place.get("Label"),
                    "coordinates": {
                        "longitude": point[0],
                        "latitude": point[1]
                    },
                    "categories": place.get("Categories", []),
                    "distance_km": result.get("Distance", 0) / 1000,  # Convert to km
                    "cashback_rate": None  # Would be populated from merchant database
                })

            return {"success": True, "results": results}

        except ClientError as e:
            logger.error(f"Nearby search error: {e}")
            return {"success": False, "error": str(e), "results": []}

    async def search_places(
        self,
        query: str,
        longitude: Optional[float] = None,
        latitude: Optional[float] = None,
        max_results: int = 10
    ) -> Dict[str, Any]:
        """
        Search for places by name/query.

        Args:
            query: Search query (e.g., "Starbucks", "ATM near me")
            longitude: Optional bias longitude
            latitude: Optional bias latitude
            max_results: Maximum results

        Returns:
            Dict with matching places
        """
        if self.mock_mode:
            logger.info(f"[MOCK PLACE SEARCH] Query: {query}")
            return {
                "success": True,
                "results": [{
                    "place_id": "mock_search_1",
                    "name": query,
                    "label": f"{query}, New York, NY",
                    "coordinates": {
                        "longitude": longitude or -73.9857,
                        "latitude": latitude or 40.7484
                    },
                    "categories": ["business"],
                    "relevance": 0.95
                }]
            }

        try:
            params = {
                "IndexName": self.place_index,
                "Text": query,
                "MaxResults": max_results
            }

            if longitude is not None and latitude is not None:
                params["BiasPosition"] = [longitude, latitude]

            response = self.location_client.search_place_index_for_text(**params)

            results = []
            for result in response.get("Results", []):
                place = result.get("Place", {})
                geometry = place.get("Geometry", {})
                point = geometry.get("Point", [0, 0])

                results.append({
                    "place_id": result.get("PlaceId"),
                    "name": place.get("Label", "").split(",")[0],
                    "label": place.get("Label"),
                    "coordinates": {
                        "longitude": point[0],
                        "latitude": point[1]
                    },
                    "categories": place.get("Categories", []),
                    "relevance": result.get("Relevance", 0)
                })

            return {"success": True, "results": results}

        except ClientError as e:
            logger.error(f"Place search error: {e}")
            return {"success": False, "error": str(e), "results": []}

    # ========================================================================
    # ROUTE CALCULATION
    # ========================================================================

    async def calculate_route(
        self,
        origin: Tuple[float, float],
        destination: Tuple[float, float],
        travel_mode: TravelMode = TravelMode.CAR,
        waypoints: Optional[List[Tuple[float, float]]] = None,
        avoid_tolls: bool = False,
        avoid_ferries: bool = False,
        distance_unit: DistanceUnit = DistanceUnit.KILOMETERS
    ) -> Dict[str, Any]:
        """
        Calculate a route between two points.

        Args:
            origin: Starting point (longitude, latitude)
            destination: Ending point (longitude, latitude)
            travel_mode: Mode of travel
            waypoints: Optional intermediate stops
            avoid_tolls: Avoid toll roads
            avoid_ferries: Avoid ferries
            distance_unit: Unit for distance

        Returns:
            Dict with route details including distance, duration, and steps
        """
        if self.mock_mode:
            logger.info(f"[MOCK ROUTE] From: {origin} To: {destination}")
            return {
                "success": True,
                "route": {
                    "distance_km": 5.2,
                    "duration_minutes": 12,
                    "summary": "Via Broadway and 5th Ave",
                    "bounds": {
                        "southwest": {"longitude": origin[0], "latitude": origin[1]},
                        "northeast": {"longitude": destination[0], "latitude": destination[1]}
                    },
                    "legs": [{
                        "distance_km": 5.2,
                        "duration_minutes": 12,
                        "start_position": {"longitude": origin[0], "latitude": origin[1]},
                        "end_position": {"longitude": destination[0], "latitude": destination[1]},
                        "steps": [
                            {
                                "distance_km": 0.3,
                                "duration_minutes": 1,
                                "instruction": "Head north on Broadway",
                                "start_position": {"longitude": origin[0], "latitude": origin[1]}
                            },
                            {
                                "distance_km": 2.5,
                                "duration_minutes": 5,
                                "instruction": "Turn right onto 5th Ave",
                                "start_position": {"longitude": origin[0] + 0.003, "latitude": origin[1] + 0.005}
                            },
                            {
                                "distance_km": 2.4,
                                "duration_minutes": 6,
                                "instruction": "Continue to destination",
                                "start_position": {"longitude": destination[0] - 0.01, "latitude": destination[1] - 0.01}
                            }
                        ]
                    }],
                    "geometry": {
                        "line_string": [
                            list(origin),
                            [origin[0] + 0.003, origin[1] + 0.005],
                            [destination[0] - 0.01, destination[1] - 0.01],
                            list(destination)
                        ]
                    }
                }
            }

        try:
            params = {
                "CalculatorName": self.route_calculator,
                "DeparturePosition": list(origin),
                "DestinationPosition": list(destination),
                "TravelMode": travel_mode.value,
                "DistanceUnit": distance_unit.value,
                "CarModeOptions": {
                    "AvoidTolls": avoid_tolls,
                    "AvoidFerries": avoid_ferries
                }
            }

            if waypoints:
                params["WaypointPositions"] = [list(wp) for wp in waypoints]

            response = self.location_client.calculate_route(**params)

            legs = []
            for leg in response.get("Legs", []):
                steps = []
                for step in leg.get("Steps", []):
                    start_pos = step.get("StartPosition", [0, 0])
                    steps.append({
                        "distance_km": step.get("Distance", 0),
                        "duration_minutes": step.get("DurationSeconds", 0) / 60,
                        "instruction": step.get("GeometryOffset"),  # Would need instruction from geometry
                        "start_position": {
                            "longitude": start_pos[0],
                            "latitude": start_pos[1]
                        }
                    })

                start = leg.get("StartPosition", [0, 0])
                end = leg.get("EndPosition", [0, 0])
                legs.append({
                    "distance_km": leg.get("Distance", 0),
                    "duration_minutes": leg.get("DurationSeconds", 0) / 60,
                    "start_position": {"longitude": start[0], "latitude": start[1]},
                    "end_position": {"longitude": end[0], "latitude": end[1]},
                    "steps": steps
                })

            summary = response.get("Summary", {})
            return {
                "success": True,
                "route": {
                    "distance_km": summary.get("Distance", 0),
                    "duration_minutes": summary.get("DurationSeconds", 0) / 60,
                    "summary": summary.get("DataSource", ""),
                    "legs": legs,
                    "geometry": {
                        "line_string": response.get("Legs", [{}])[0].get("Geometry", {}).get("LineString", [])
                    }
                }
            }

        except ClientError as e:
            logger.error(f"Route calculation error: {e}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # GEOFENCING
    # ========================================================================

    async def create_geofence(
        self,
        geofence_id: str,
        center: Tuple[float, float],
        radius_meters: float,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Create a circular geofence.

        Args:
            geofence_id: Unique identifier for the geofence
            center: Center point (longitude, latitude)
            radius_meters: Radius in meters
            metadata: Optional metadata properties

        Returns:
            Dict with creation result
        """
        if self.mock_mode:
            logger.info(f"[MOCK GEOFENCE CREATE] ID: {geofence_id}, Center: {center}, Radius: {radius_meters}m")
            return {
                "success": True,
                "geofence_id": geofence_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

        try:
            geofence_entry = {
                "GeofenceId": geofence_id,
                "Geometry": {
                    "Circle": {
                        "Center": list(center),
                        "Radius": radius_meters
                    }
                }
            }

            if metadata:
                geofence_entry["GeofenceProperties"] = metadata

            response = self.location_client.put_geofence(
                CollectionName=self.geofence_collection,
                GeofenceId=geofence_id,
                Geometry=geofence_entry["Geometry"],
                GeofenceProperties=metadata or {}
            )

            return {
                "success": True,
                "geofence_id": geofence_id,
                "created_at": response.get("CreateTime", "").isoformat() if response.get("CreateTime") else None,
                "updated_at": response.get("UpdateTime", "").isoformat() if response.get("UpdateTime") else None
            }

        except ClientError as e:
            logger.error(f"Geofence creation error: {e}")
            return {"success": False, "error": str(e)}

    async def create_polygon_geofence(
        self,
        geofence_id: str,
        polygon: List[Tuple[float, float]],
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Create a polygon geofence.

        Args:
            geofence_id: Unique identifier
            polygon: List of (longitude, latitude) points forming the polygon
            metadata: Optional metadata

        Returns:
            Dict with creation result
        """
        if self.mock_mode:
            logger.info(f"[MOCK POLYGON GEOFENCE] ID: {geofence_id}, Points: {len(polygon)}")
            return {
                "success": True,
                "geofence_id": geofence_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

        try:
            # Ensure polygon is closed (first and last point same)
            polygon_coords = [list(p) for p in polygon]
            if polygon_coords[0] != polygon_coords[-1]:
                polygon_coords.append(polygon_coords[0])

            response = self.location_client.put_geofence(
                CollectionName=self.geofence_collection,
                GeofenceId=geofence_id,
                Geometry={
                    "Polygon": [polygon_coords]
                },
                GeofenceProperties=metadata or {}
            )

            return {
                "success": True,
                "geofence_id": geofence_id,
                "created_at": response.get("CreateTime", "").isoformat() if response.get("CreateTime") else None
            }

        except ClientError as e:
            logger.error(f"Polygon geofence creation error: {e}")
            return {"success": False, "error": str(e)}

    async def delete_geofence(self, geofence_id: str) -> Dict[str, Any]:
        """Delete a geofence."""
        if self.mock_mode:
            logger.info(f"[MOCK GEOFENCE DELETE] ID: {geofence_id}")
            return {"success": True, "geofence_id": geofence_id}

        try:
            self.location_client.batch_delete_geofence(
                CollectionName=self.geofence_collection,
                GeofenceIds=[geofence_id]
            )
            return {"success": True, "geofence_id": geofence_id}

        except ClientError as e:
            logger.error(f"Geofence deletion error: {e}")
            return {"success": False, "error": str(e)}

    async def list_geofences(self, max_results: int = 100) -> Dict[str, Any]:
        """List all geofences in the collection."""
        if self.mock_mode:
            return {
                "success": True,
                "geofences": [
                    {
                        "geofence_id": "merchant_starbucks_123",
                        "status": "ACTIVE",
                        "created_at": "2024-01-01T00:00:00Z"
                    },
                    {
                        "geofence_id": "merchant_target_456",
                        "status": "ACTIVE",
                        "created_at": "2024-01-02T00:00:00Z"
                    }
                ]
            }

        try:
            response = self.location_client.list_geofences(
                CollectionName=self.geofence_collection,
                MaxResults=max_results
            )

            geofences = []
            for entry in response.get("Entries", []):
                geofences.append({
                    "geofence_id": entry.get("GeofenceId"),
                    "status": entry.get("Status"),
                    "created_at": entry.get("CreateTime", "").isoformat() if entry.get("CreateTime") else None,
                    "updated_at": entry.get("UpdateTime", "").isoformat() if entry.get("UpdateTime") else None
                })

            return {"success": True, "geofences": geofences}

        except ClientError as e:
            logger.error(f"List geofences error: {e}")
            return {"success": False, "error": str(e), "geofences": []}

    async def evaluate_geofences(
        self,
        device_id: str,
        position: Tuple[float, float]
    ) -> Dict[str, Any]:
        """
        Evaluate which geofences a position is inside.

        Args:
            device_id: Device identifier
            position: Current position (longitude, latitude)

        Returns:
            Dict with geofence evaluation results
        """
        if self.mock_mode:
            logger.info(f"[MOCK GEOFENCE EVAL] Device: {device_id}, Position: {position}")
            return {
                "success": True,
                "device_id": device_id,
                "inside_geofences": ["merchant_starbucks_123"],
                "position": {"longitude": position[0], "latitude": position[1]}
            }

        try:
            response = self.location_client.batch_evaluate_geofences(
                CollectionName=self.geofence_collection,
                DevicePositionUpdates=[{
                    "DeviceId": device_id,
                    "Position": list(position),
                    "SampleTime": datetime.now(timezone.utc)
                }]
            )

            # Get geofence events
            events = []
            for error in response.get("Errors", []):
                events.append({
                    "device_id": error.get("DeviceId"),
                    "error": error.get("Error", {}).get("Message")
                })

            return {
                "success": True,
                "device_id": device_id,
                "position": {"longitude": position[0], "latitude": position[1]},
                "errors": events if events else None
            }

        except ClientError as e:
            logger.error(f"Geofence evaluation error: {e}")
            return {"success": False, "error": str(e)}

    # ========================================================================
    # DEVICE TRACKING
    # ========================================================================

    async def update_device_position(
        self,
        device_id: str,
        position: Tuple[float, float],
        accuracy: Optional[float] = None,
        position_properties: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Update a device's position for tracking.

        Args:
            device_id: Device identifier
            position: Current position (longitude, latitude)
            accuracy: Optional position accuracy in meters
            position_properties: Optional metadata

        Returns:
            Dict with update result
        """
        if self.mock_mode:
            logger.info(f"[MOCK POSITION UPDATE] Device: {device_id}, Position: {position}")
            return {
                "success": True,
                "device_id": device_id,
                "position": {"longitude": position[0], "latitude": position[1]},
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        try:
            update = {
                "DeviceId": device_id,
                "Position": list(position),
                "SampleTime": datetime.now(timezone.utc)
            }

            if accuracy:
                update["Accuracy"] = {"Horizontal": accuracy}

            if position_properties:
                update["PositionProperties"] = position_properties

            response = self.location_client.batch_update_device_position(
                TrackerName=self.tracker_name,
                Updates=[update]
            )

            errors = response.get("Errors", [])
            if errors:
                return {"success": False, "errors": errors}

            return {
                "success": True,
                "device_id": device_id,
                "position": {"longitude": position[0], "latitude": position[1]},
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        except ClientError as e:
            logger.error(f"Position update error: {e}")
            return {"success": False, "error": str(e)}

    async def get_device_position(self, device_id: str) -> Dict[str, Any]:
        """Get the latest position for a device."""
        if self.mock_mode:
            logger.info(f"[MOCK GET POSITION] Device: {device_id}")
            return {
                "success": True,
                "device_id": device_id,
                "position": {"longitude": -73.9857, "latitude": 40.7484},
                "accuracy": 10.0,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        try:
            response = self.location_client.get_device_position(
                TrackerName=self.tracker_name,
                DeviceId=device_id
            )

            position = response.get("Position", [0, 0])
            return {
                "success": True,
                "device_id": device_id,
                "position": {"longitude": position[0], "latitude": position[1]},
                "accuracy": response.get("Accuracy", {}).get("Horizontal"),
                "timestamp": response.get("ReceivedTime", "").isoformat() if response.get("ReceivedTime") else None,
                "properties": response.get("PositionProperties", {})
            }

        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                return {"success": False, "error": "Device not found"}
            logger.error(f"Get position error: {e}")
            return {"success": False, "error": str(e)}

    async def get_device_position_history(
        self,
        device_id: str,
        start_time: datetime,
        end_time: Optional[datetime] = None,
        max_results: int = 100
    ) -> Dict[str, Any]:
        """
        Get position history for a device.

        Args:
            device_id: Device identifier
            start_time: Start of time range
            end_time: End of time range (defaults to now)
            max_results: Maximum results

        Returns:
            Dict with position history
        """
        if self.mock_mode:
            logger.info(f"[MOCK POSITION HISTORY] Device: {device_id}")
            return {
                "success": True,
                "device_id": device_id,
                "positions": [
                    {
                        "position": {"longitude": -73.9857, "latitude": 40.7484},
                        "timestamp": "2024-01-01T10:00:00Z"
                    },
                    {
                        "position": {"longitude": -73.9860, "latitude": 40.7490},
                        "timestamp": "2024-01-01T10:30:00Z"
                    }
                ]
            }

        try:
            params = {
                "TrackerName": self.tracker_name,
                "DeviceId": device_id,
                "StartTimeInclusive": start_time,
                "MaxResults": max_results
            }

            if end_time:
                params["EndTimeExclusive"] = end_time

            response = self.location_client.get_device_position_history(**params)

            positions = []
            for entry in response.get("DevicePositions", []):
                pos = entry.get("Position", [0, 0])
                positions.append({
                    "position": {"longitude": pos[0], "latitude": pos[1]},
                    "accuracy": entry.get("Accuracy", {}).get("Horizontal"),
                    "timestamp": entry.get("ReceivedTime", "").isoformat() if entry.get("ReceivedTime") else None
                })

            return {
                "success": True,
                "device_id": device_id,
                "positions": positions
            }

        except ClientError as e:
            logger.error(f"Position history error: {e}")
            return {"success": False, "error": str(e), "positions": []}

    # ========================================================================
    # UTILITY METHODS
    # ========================================================================

    @staticmethod
    def calculate_distance(
        point1: Tuple[float, float],
        point2: Tuple[float, float]
    ) -> float:
        """
        Calculate distance between two points using Haversine formula.

        Args:
            point1: First point (longitude, latitude)
            point2: Second point (longitude, latitude)

        Returns:
            Distance in kilometers
        """
        from math import radians, sin, cos, sqrt, atan2

        lon1, lat1 = point1
        lon2, lat2 = point2

        R = 6371  # Earth's radius in kilometers

        lat1, lat2, lon1, lon2 = map(radians, [lat1, lat2, lon1, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))

        return R * c

    @staticmethod
    def is_point_in_radius(
        center: Tuple[float, float],
        point: Tuple[float, float],
        radius_km: float
    ) -> bool:
        """Check if a point is within a radius of a center point."""
        distance = AWSLocationService.calculate_distance(center, point)
        return distance <= radius_km


# Singleton instance
aws_location_service = AWSLocationService()


# Convenience functions
async def geocode_address(address: str) -> Dict[str, Any]:
    """Geocode an address to coordinates."""
    return await aws_location_service.geocode(address)


async def reverse_geocode_position(longitude: float, latitude: float) -> Dict[str, Any]:
    """Reverse geocode coordinates to an address."""
    return await aws_location_service.reverse_geocode(longitude, latitude)


async def find_nearby_merchants(
    longitude: float,
    latitude: float,
    radius_km: float = 5.0
) -> Dict[str, Any]:
    """Find nearby merchants with cashback offers."""
    return await aws_location_service.search_nearby(longitude, latitude, radius_km=radius_km)


async def calculate_route_to_merchant(
    origin: Tuple[float, float],
    destination: Tuple[float, float]
) -> Dict[str, Any]:
    """Calculate route to a merchant."""
    return await aws_location_service.calculate_route(origin, destination)
