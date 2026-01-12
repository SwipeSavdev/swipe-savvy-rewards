/**
 * SwipeSavvy Location SDK
 *
 * A comprehensive SDK for location services including:
 * - GPS tracking and device location
 * - Nearby merchant discovery
 * - Geofencing and location-based triggers
 * - Route calculation and navigation
 * - Geocoding and reverse geocoding
 *
 * @example
 * ```tsx
 * import {
 *   LocationProvider,
 *   useLocationServices,
 *   useCurrentLocation,
 *   useMerchants,
 * } from '@swipesavvy/location-sdk';
 *
 * // Wrap your app
 * function App() {
 *   return (
 *     <LocationProvider config={locationConfig}>
 *       <MainApp />
 *     </LocationProvider>
 *   );
 * }
 *
 * // Use in components
 * function MerchantList() {
 *   const { merchants } = useLocationServices();
 *   return merchants.list.map(m => <MerchantCard key={m.merchant_id} merchant={m} />);
 * }
 * ```
 */

// Provider and context hooks
export {
  LocationProvider,
  useLocationServices,
  useCurrentLocation,
  useMerchants,
  useGeofences,
  useNavigation,
} from './LocationProvider';

// Individual hooks for direct use
export { useLocation } from './hooks/useLocation';
export { useNearbyMerchants } from './hooks/useNearbyMerchants';
export { useGeofencing } from './hooks/useGeofencing';
export { useRouting } from './hooks/useRouting';

// Client for advanced use cases
export { LocationClient } from './client/LocationClient';

// Types
export type {
  // Configuration
  LocationConfig,
  LocationAPIError,

  // Coordinates and geometry
  Coordinates,
  BoundingBox,

  // Geocoding
  GeocodedAddress,
  GeocodeRequest,
  GeocodeResponse,
  ReverseGeocodeRequest,
  ReverseGeocodeResponse,

  // Places and merchants
  PlaceCategory,
  Place,
  NearbySearchRequest,
  PlaceSearchRequest,
  PlaceSearchResponse,
  Merchant,
  NearbyMerchantsRequest,
  NearbyMerchantsResponse,

  // Routing
  TravelMode,
  DistanceUnit,
  RouteStep,
  RouteLeg,
  Route,
  RouteRequest,
  RouteResponse,
  RouteToMerchantRequest,
  RouteToMerchantResponse,

  // Geofencing
  GeofenceStatus,
  CircularGeofence,
  PolygonGeofence,
  Geofence,
  CreateCircularGeofenceRequest,
  CreatePolygonGeofenceRequest,
  GeofenceEvaluationResult,
  EvaluateGeofenceRequest,
  EvaluateGeofenceResponse,

  // Device tracking
  DevicePosition,
  TrackDeviceRequest,
  TrackDeviceResponse,
  DevicePositionHistory,
  GetPositionHistoryRequest,

  // Distance
  DistanceRequest,
  DistanceResponse,
} from './types';

// Default export
export { LocationProvider as default } from './LocationProvider';
