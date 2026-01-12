/**
 * LocationProvider
 *
 * React context provider for location services.
 * Provides location state and actions to all child components.
 */

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';

import { LocationClient } from './client/LocationClient';
import { useLocation } from './hooks/useLocation';
import { useNearbyMerchants } from './hooks/useNearbyMerchants';
import { useGeofencing } from './hooks/useGeofencing';
import { useRouting } from './hooks/useRouting';
import {
  LocationConfig,
  Coordinates,
  DevicePosition,
  Merchant,
  Geofence,
  Route,
  TravelMode,
  GeocodeRequest,
  GeocodeResponse,
  ReverseGeocodeRequest,
  ReverseGeocodeResponse,
  PlaceSearchRequest,
  PlaceSearchResponse,
  CreateCircularGeofenceRequest,
  CreatePolygonGeofenceRequest,
  GeofenceEvaluationResult,
  TrackDeviceResponse,
} from './types';

// Context types
interface LocationContextValue {
  // Current location
  location: {
    currentPosition: Coordinates | null;
    isLoading: boolean;
    isTracking: boolean;
    error: Error | null;
    permissionStatus: string | null;
    lastUpdate: Date | null;
    requestPermissions: () => Promise<boolean>;
    getCurrentPosition: () => Promise<Coordinates | null>;
    startTracking: () => Promise<boolean>;
    stopTracking: () => void;
    updatePositionOnServer: () => Promise<TrackDeviceResponse | null>;
  };

  // Nearby merchants
  merchants: {
    list: Merchant[];
    isLoading: boolean;
    isRefreshing: boolean;
    error: Error | null;
    totalCount: number;
    currentCategory: string | null;
    currentRadius: number;
    refresh: () => Promise<void>;
    searchByCategory: (category: string) => Promise<void>;
    searchByRadius: (radiusMeters: number) => Promise<void>;
    clearResults: () => void;
  };

  // Geofencing
  geofencing: {
    geofences: Geofence[];
    activeGeofences: string[];
    isLoading: boolean;
    isMonitoring: boolean;
    error: Error | null;
    loadGeofences: () => Promise<void>;
    createCircularGeofence: (
      request: CreateCircularGeofenceRequest
    ) => Promise<Geofence | null>;
    createPolygonGeofence: (
      request: CreatePolygonGeofenceRequest
    ) => Promise<Geofence | null>;
    deleteGeofence: (geofenceId: string) => Promise<boolean>;
    evaluatePosition: (
      position?: Coordinates
    ) => Promise<GeofenceEvaluationResult[]>;
    startMonitoring: () => void;
    stopMonitoring: () => void;
  };

  // Routing
  routing: {
    route: Route | null;
    destination: Coordinates | null;
    destinationMerchant: Merchant | null;
    isLoading: boolean;
    error: Error | null;
    formattedDistance: string | null;
    formattedDuration: string | null;
    travelMode: TravelMode;
    calculateRoute: (
      destination: Coordinates,
      travelMode?: TravelMode
    ) => Promise<Route | null>;
    calculateRouteToMerchant: (
      merchantId: string,
      travelMode?: TravelMode
    ) => Promise<Route | null>;
    clearRoute: () => void;
    setTravelMode: (mode: TravelMode) => void;
  };

  // Client for direct API access
  client: LocationClient;

  // Utility methods
  geocode: (request: GeocodeRequest) => Promise<GeocodeResponse>;
  reverseGeocode: (
    request: ReverseGeocodeRequest
  ) => Promise<ReverseGeocodeResponse>;
  searchPlaces: (request: PlaceSearchRequest) => Promise<PlaceSearchResponse>;
  calculateDistance: (origin: Coordinates, destination: Coordinates) => number;
  formatDistance: (meters: number, useImperial?: boolean) => string;
  formatDuration: (seconds: number) => string;
}

// Create context
const LocationContext = createContext<LocationContextValue | null>(null);

// Provider props
interface LocationProviderProps {
  config: LocationConfig;
  children: ReactNode;
}

/**
 * LocationProvider Component
 *
 * Wrap your app with this provider to enable location services.
 *
 * @example
 * ```tsx
 * <LocationProvider
 *   config={{
 *     apiBaseUrl: 'https://api.swipesavvy.com',
 *     userId: user.id,
 *     authToken: authToken,
 *     deviceId: deviceId,
 *     enableTracking: true,
 *     onGeofenceEnter: (id) => console.log('Entered geofence:', id),
 *   }}
 * >
 *   <App />
 * </LocationProvider>
 * ```
 */
export function LocationProvider({
  config,
  children,
}: LocationProviderProps): React.JSX.Element {
  // Create client
  const client = useMemo(
    () => new LocationClient(config.apiBaseUrl, config.userId, config.authToken),
    [config.apiBaseUrl, config.userId, config.authToken]
  );

  // Use location hook
  const locationHook = useLocation({
    client,
    deviceId: config.deviceId || `device_${config.userId}`,
    enableTracking: config.enableTracking,
    trackingInterval: config.trackingInterval,
    onPositionUpdate: config.onLocationUpdate,
    onError: config.onError,
  });

  // Use nearby merchants hook
  const merchantsHook = useNearbyMerchants({
    client,
    currentPosition: locationHook.currentPosition,
    autoRefresh: true,
    refreshInterval: 60000,
  });

  // Use geofencing hook
  const geofencingHook = useGeofencing({
    client,
    currentPosition: locationHook.currentPosition,
    enableMonitoring: config.enableTracking,
    onGeofenceEnter: config.onGeofenceEnter
      ? (id, gf) => config.onGeofenceEnter?.(id)
      : undefined,
    onGeofenceExit: config.onGeofenceExit
      ? (id, gf) => config.onGeofenceExit?.(id)
      : undefined,
    onError: config.onError,
  });

  // Use routing hook
  const routingHook = useRouting({
    client,
    currentPosition: locationHook.currentPosition,
  });

  // Utility methods
  const geocode = useCallback(
    async (request: GeocodeRequest) => {
      return client.geocode(request);
    },
    [client]
  );

  const reverseGeocode = useCallback(
    async (request: ReverseGeocodeRequest) => {
      return client.reverseGeocode(request);
    },
    [client]
  );

  const searchPlaces = useCallback(
    async (request: PlaceSearchRequest) => {
      return client.searchPlaces(request);
    },
    [client]
  );

  const calculateDistance = useCallback(
    (origin: Coordinates, destination: Coordinates) => {
      return client.calculateDistanceLocal(origin, destination).distance_meters;
    },
    [client]
  );

  const formatDistance = useCallback(
    (meters: number, useImperial: boolean = false) => {
      return client.formatDistance(meters, useImperial);
    },
    [client]
  );

  const formatDuration = useCallback(
    (seconds: number) => {
      return client.formatDuration(seconds);
    },
    [client]
  );

  // Build context value
  const contextValue = useMemo<LocationContextValue>(
    () => ({
      location: {
        currentPosition: locationHook.currentPosition,
        isLoading: locationHook.isLoading,
        isTracking: locationHook.isTracking,
        error: locationHook.error,
        permissionStatus: locationHook.permissionStatus,
        lastUpdate: locationHook.lastUpdate,
        requestPermissions: locationHook.requestPermissions,
        getCurrentPosition: locationHook.getCurrentPosition,
        startTracking: locationHook.startTracking,
        stopTracking: locationHook.stopTracking,
        updatePositionOnServer: locationHook.updatePositionOnServer,
      },
      merchants: {
        list: merchantsHook.merchants,
        isLoading: merchantsHook.isLoading,
        isRefreshing: merchantsHook.isRefreshing,
        error: merchantsHook.error,
        totalCount: merchantsHook.totalCount,
        currentCategory: merchantsHook.currentCategory,
        currentRadius: merchantsHook.currentRadius,
        refresh: merchantsHook.refresh,
        searchByCategory: merchantsHook.searchByCategory,
        searchByRadius: merchantsHook.searchByRadius,
        clearResults: merchantsHook.clearResults,
      },
      geofencing: {
        geofences: geofencingHook.geofences,
        activeGeofences: geofencingHook.activeGeofences,
        isLoading: geofencingHook.isLoading,
        isMonitoring: geofencingHook.isMonitoring,
        error: geofencingHook.error,
        loadGeofences: geofencingHook.loadGeofences,
        createCircularGeofence: geofencingHook.createCircularGeofence,
        createPolygonGeofence: geofencingHook.createPolygonGeofence,
        deleteGeofence: geofencingHook.deleteGeofence,
        evaluatePosition: geofencingHook.evaluatePosition,
        startMonitoring: geofencingHook.startMonitoring,
        stopMonitoring: geofencingHook.stopMonitoring,
      },
      routing: {
        route: routingHook.route,
        destination: routingHook.destination,
        destinationMerchant: routingHook.destinationMerchant,
        isLoading: routingHook.isLoading,
        error: routingHook.error,
        formattedDistance: routingHook.formattedDistance,
        formattedDuration: routingHook.formattedDuration,
        travelMode: routingHook.travelMode,
        calculateRoute: routingHook.calculateRoute,
        calculateRouteToMerchant: routingHook.calculateRouteToMerchant,
        clearRoute: routingHook.clearRoute,
        setTravelMode: routingHook.setTravelMode,
      },
      client,
      geocode,
      reverseGeocode,
      searchPlaces,
      calculateDistance,
      formatDistance,
      formatDuration,
    }),
    [
      locationHook,
      merchantsHook,
      geofencingHook,
      routingHook,
      client,
      geocode,
      reverseGeocode,
      searchPlaces,
      calculateDistance,
      formatDistance,
      formatDuration,
    ]
  );

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook to access location context
 *
 * @example
 * ```tsx
 * function MerchantMap() {
 *   const { location, merchants } = useLocationServices();
 *   return <Map center={location.currentPosition} markers={merchants.list} />;
 * }
 * ```
 */
export function useLocationServices(): LocationContextValue {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      'useLocationServices must be used within a LocationProvider'
    );
  }

  return context;
}

/**
 * Hook to access only current location
 */
export function useCurrentLocation() {
  const { location } = useLocationServices();
  return location;
}

/**
 * Hook to access only nearby merchants
 */
export function useMerchants() {
  const { merchants } = useLocationServices();
  return merchants;
}

/**
 * Hook to access only geofencing features
 */
export function useGeofences() {
  const { geofencing } = useLocationServices();
  return geofencing;
}

/**
 * Hook to access only routing features
 */
export function useNavigation() {
  const { routing } = useLocationServices();
  return routing;
}

export default LocationProvider;
