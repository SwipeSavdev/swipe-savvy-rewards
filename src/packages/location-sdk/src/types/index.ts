/**
 * Location SDK Types
 *
 * Type definitions for AWS Location Service integration
 * in the SwipeSavvy mobile application.
 */

// Coordinate types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  southwest: Coordinates;
  northeast: Coordinates;
}

// Geocoding types
export interface GeocodedAddress {
  label: string;
  address_number?: string;
  street?: string;
  municipality?: string;
  region?: string;
  sub_region?: string;
  postal_code?: string;
  country?: string;
  coordinates: Coordinates;
  relevance?: number;
}

export interface GeocodeRequest {
  address: string;
  bias_position?: Coordinates;
  filter_countries?: string[];
  max_results?: number;
}

export interface GeocodeResponse {
  results: GeocodedAddress[];
}

export interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
  max_results?: number;
}

export interface ReverseGeocodeResponse {
  results: GeocodedAddress[];
}

// Place search types
export type PlaceCategory =
  | 'restaurant'
  | 'coffee_shop'
  | 'gas_station'
  | 'grocery'
  | 'shopping'
  | 'entertainment'
  | 'hotel'
  | 'bank'
  | 'atm'
  | 'pharmacy'
  | 'hospital'
  | 'parking';

export interface Place {
  place_id: string;
  label: string;
  name?: string;
  address?: string;
  municipality?: string;
  region?: string;
  country?: string;
  postal_code?: string;
  coordinates: Coordinates;
  categories?: string[];
  phone_number?: string;
  opening_hours?: string[];
  distance_meters?: number;
}

export interface NearbySearchRequest {
  latitude: number;
  longitude: number;
  radius_meters?: number;
  categories?: PlaceCategory[];
  max_results?: number;
}

export interface PlaceSearchRequest {
  query: string;
  bias_position?: Coordinates;
  filter_countries?: string[];
  max_results?: number;
}

export interface PlaceSearchResponse {
  results: Place[];
}

// Merchant types (SwipeSavvy specific)
export interface Merchant extends Place {
  merchant_id: string;
  cashback_percentage?: number;
  is_partner: boolean;
  logo_url?: string;
  rating?: number;
  review_count?: number;
}

export interface NearbyMerchantsRequest {
  latitude: number;
  longitude: number;
  radius_meters?: number;
  category?: string;
  partners_only?: boolean;
  max_results?: number;
}

export interface NearbyMerchantsResponse {
  merchants: Merchant[];
  total_count: number;
}

// Routing types
export type TravelMode = 'car' | 'truck' | 'walking' | 'bicycle';
export type DistanceUnit = 'kilometers' | 'miles';

export interface RouteStep {
  distance_meters: number;
  duration_seconds: number;
  start_position: Coordinates;
  end_position: Coordinates;
  instruction?: string;
}

export interface RouteLeg {
  distance_meters: number;
  duration_seconds: number;
  start_position: Coordinates;
  end_position: Coordinates;
  steps: RouteStep[];
}

export interface Route {
  distance_meters: number;
  duration_seconds: number;
  legs: RouteLeg[];
  geometry?: Coordinates[];
  summary?: string;
}

export interface RouteRequest {
  origin: Coordinates;
  destination: Coordinates;
  travel_mode?: TravelMode;
  departure_time?: string;
  avoid_tolls?: boolean;
  avoid_ferries?: boolean;
}

export interface RouteResponse {
  routes: Route[];
}

export interface RouteToMerchantRequest {
  origin_latitude: number;
  origin_longitude: number;
  merchant_id: string;
  travel_mode?: TravelMode;
}

export interface RouteToMerchantResponse {
  route: Route;
  merchant: Merchant;
}

// Geofencing types
export type GeofenceStatus = 'active' | 'inactive' | 'deleted';

export interface CircularGeofence {
  geofence_id: string;
  center: Coordinates;
  radius_meters: number;
  status: GeofenceStatus;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface PolygonGeofence {
  geofence_id: string;
  polygon: Coordinates[];
  status: GeofenceStatus;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export type Geofence = CircularGeofence | PolygonGeofence;

export interface CreateCircularGeofenceRequest {
  geofence_id: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  metadata?: Record<string, unknown>;
}

export interface CreatePolygonGeofenceRequest {
  geofence_id: string;
  polygon: Coordinates[];
  metadata?: Record<string, unknown>;
}

export interface GeofenceEvaluationResult {
  geofence_id: string;
  is_inside: boolean;
  distance_meters?: number;
}

export interface EvaluateGeofenceRequest {
  latitude: number;
  longitude: number;
  geofence_ids?: string[];
}

export interface EvaluateGeofenceResponse {
  results: GeofenceEvaluationResult[];
}

// Device tracking types
export interface DevicePosition {
  device_id: string;
  position: Coordinates;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TrackDeviceRequest {
  device_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  metadata?: Record<string, unknown>;
}

export interface TrackDeviceResponse {
  success: boolean;
  device_id: string;
  timestamp: string;
}

export interface DevicePositionHistory {
  device_id: string;
  positions: DevicePosition[];
  total_count: number;
}

export interface GetPositionHistoryRequest {
  device_id: string;
  start_time?: string;
  end_time?: string;
  max_results?: number;
}

// Distance calculation
export interface DistanceRequest {
  origin: Coordinates;
  destination: Coordinates;
}

export interface DistanceResponse {
  distance_meters: number;
  distance_km: number;
  distance_miles: number;
}

// SDK Configuration
export interface LocationConfig {
  apiBaseUrl: string;
  authToken: string;
  userId: string;
  deviceId?: string;
  enableTracking?: boolean;
  trackingInterval?: number; // milliseconds
  onLocationUpdate?: (position: DevicePosition) => void;
  onGeofenceEnter?: (geofenceId: string) => void;
  onGeofenceExit?: (geofenceId: string) => void;
  onError?: (error: Error) => void;
}

// API Error
export interface LocationAPIError {
  error: string;
  detail?: string;
  status_code?: number;
}
