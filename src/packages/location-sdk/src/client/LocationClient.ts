/**
 * LocationClient
 *
 * API client for AWS Location Service integration.
 * Handles all location-related API calls including geocoding,
 * place search, routing, geofencing, and device tracking.
 */

import {
  GeocodeRequest,
  GeocodeResponse,
  ReverseGeocodeRequest,
  ReverseGeocodeResponse,
  NearbySearchRequest,
  PlaceSearchRequest,
  PlaceSearchResponse,
  NearbyMerchantsRequest,
  NearbyMerchantsResponse,
  RouteRequest,
  RouteResponse,
  RouteToMerchantRequest,
  RouteToMerchantResponse,
  CreateCircularGeofenceRequest,
  CreatePolygonGeofenceRequest,
  Geofence,
  EvaluateGeofenceRequest,
  EvaluateGeofenceResponse,
  TrackDeviceRequest,
  TrackDeviceResponse,
  DevicePosition,
  DevicePositionHistory,
  GetPositionHistoryRequest,
  DistanceRequest,
  DistanceResponse,
  Coordinates,
  LocationAPIError,
} from '../types';

export class LocationClient {
  private baseUrl: string;
  private authToken: string;
  private userId: string;

  constructor(apiBaseUrl: string, userId: string, authToken: string) {
    this.baseUrl = apiBaseUrl.replace(/\/$/, '');
    this.userId = userId;
    this.authToken = authToken;
  }

  /**
   * Update authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Update user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1/location${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.authToken}`,
      'X-User-ID': this.userId,
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData: LocationAPIError = await response.json().catch(() => ({
        error: `HTTP ${response.status}`,
        detail: response.statusText,
      }));
      throw new Error(errorData.detail || errorData.error || 'Request failed');
    }

    return response.json();
  }

  // ==================== Geocoding ====================

  /**
   * Convert address to coordinates (geocode)
   */
  async geocode(request: GeocodeRequest): Promise<GeocodeResponse> {
    return this.request<GeocodeResponse>('/geocode', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Convert coordinates to address (reverse geocode)
   */
  async reverseGeocode(
    request: ReverseGeocodeRequest
  ): Promise<ReverseGeocodeResponse> {
    return this.request<ReverseGeocodeResponse>('/reverse-geocode', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ==================== Place Search ====================

  /**
   * Search for nearby places by category
   */
  async searchNearby(
    request: NearbySearchRequest
  ): Promise<PlaceSearchResponse> {
    return this.request<PlaceSearchResponse>('/nearby', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Search for places by text query
   */
  async searchPlaces(
    request: PlaceSearchRequest
  ): Promise<PlaceSearchResponse> {
    return this.request<PlaceSearchResponse>('/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Search for nearby SwipeSavvy partner merchants
   */
  async searchNearbyMerchants(
    request: NearbyMerchantsRequest
  ): Promise<NearbyMerchantsResponse> {
    return this.request<NearbyMerchantsResponse>('/nearby-merchants', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ==================== Routing ====================

  /**
   * Calculate route between two points
   */
  async calculateRoute(request: RouteRequest): Promise<RouteResponse> {
    return this.request<RouteResponse>('/route', {
      method: 'POST',
      body: JSON.stringify({
        origin_latitude: request.origin.latitude,
        origin_longitude: request.origin.longitude,
        destination_latitude: request.destination.latitude,
        destination_longitude: request.destination.longitude,
        travel_mode: request.travel_mode || 'car',
        departure_time: request.departure_time,
        avoid_tolls: request.avoid_tolls,
        avoid_ferries: request.avoid_ferries,
      }),
    });
  }

  /**
   * Get route to a specific merchant
   */
  async routeToMerchant(
    request: RouteToMerchantRequest
  ): Promise<RouteToMerchantResponse> {
    return this.request<RouteToMerchantResponse>('/route-to-merchant', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ==================== Geofencing ====================

  /**
   * Create a circular geofence
   */
  async createCircularGeofence(
    request: CreateCircularGeofenceRequest
  ): Promise<Geofence> {
    return this.request<Geofence>('/geofence', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Create a polygon geofence
   */
  async createPolygonGeofence(
    request: CreatePolygonGeofenceRequest
  ): Promise<Geofence> {
    return this.request<Geofence>('/geofence/polygon', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get all geofences
   */
  async getGeofences(): Promise<{ geofences: Geofence[] }> {
    return this.request<{ geofences: Geofence[] }>('/geofences', {
      method: 'GET',
    });
  }

  /**
   * Delete a geofence
   */
  async deleteGeofence(geofenceId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/geofence/${geofenceId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Evaluate if a position is inside geofences
   */
  async evaluateGeofences(
    request: EvaluateGeofenceRequest
  ): Promise<EvaluateGeofenceResponse> {
    return this.request<EvaluateGeofenceResponse>('/geofence/evaluate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ==================== Device Tracking ====================

  /**
   * Update device position
   */
  async trackDevice(request: TrackDeviceRequest): Promise<TrackDeviceResponse> {
    return this.request<TrackDeviceResponse>('/track', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get current device position
   */
  async getDevicePosition(deviceId: string): Promise<DevicePosition> {
    return this.request<DevicePosition>(`/track/${deviceId}`, {
      method: 'GET',
    });
  }

  /**
   * Get device position history
   */
  async getPositionHistory(
    request: GetPositionHistoryRequest
  ): Promise<DevicePositionHistory> {
    const params = new URLSearchParams();
    if (request.start_time) params.append('start_time', request.start_time);
    if (request.end_time) params.append('end_time', request.end_time);
    if (request.max_results)
      params.append('max_results', String(request.max_results));

    const queryString = params.toString();
    const endpoint = `/track/${request.device_id}/history${queryString ? `?${queryString}` : ''}`;

    return this.request<DevicePositionHistory>(endpoint, {
      method: 'GET',
    });
  }

  // ==================== Utilities ====================

  /**
   * Calculate distance between two points
   */
  async calculateDistance(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<DistanceResponse> {
    return this.request<DistanceResponse>('/distance', {
      method: 'POST',
      body: JSON.stringify({
        origin_latitude: origin.latitude,
        origin_longitude: origin.longitude,
        destination_latitude: destination.latitude,
        destination_longitude: destination.longitude,
      }),
    });
  }

  /**
   * Calculate distance locally using Haversine formula
   * (no API call needed)
   */
  calculateDistanceLocal(
    origin: Coordinates,
    destination: Coordinates
  ): DistanceResponse {
    const R = 6371000; // Earth's radius in meters

    const lat1Rad = (origin.latitude * Math.PI) / 180;
    const lat2Rad = (destination.latitude * Math.PI) / 180;
    const deltaLat =
      ((destination.latitude - origin.latitude) * Math.PI) / 180;
    const deltaLon =
      ((destination.longitude - origin.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = R * c;

    return {
      distance_meters: distanceMeters,
      distance_km: distanceMeters / 1000,
      distance_miles: distanceMeters / 1609.344,
    };
  }

  /**
   * Check if a point is within a radius of another point
   * (no API call needed)
   */
  isWithinRadius(
    point: Coordinates,
    center: Coordinates,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistanceLocal(point, center);
    return distance.distance_meters <= radiusMeters;
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number, useImperial: boolean = false): string {
    if (useImperial) {
      const miles = meters / 1609.344;
      if (miles < 0.1) {
        const feet = meters * 3.28084;
        return `${Math.round(feet)} ft`;
      }
      return `${miles.toFixed(1)} mi`;
    } else {
      if (meters < 1000) {
        return `${Math.round(meters)} m`;
      }
      return `${(meters / 1000).toFixed(1)} km`;
    }
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)} sec`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${remainingMinutes} min`;
  }
}

export default LocationClient;
