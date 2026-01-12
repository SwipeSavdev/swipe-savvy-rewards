/**
 * useRouting Hook
 *
 * React hook for calculating routes and navigation
 * between locations using AWS Location Service.
 */

import { useState, useCallback } from 'react';

import { LocationClient } from '../client/LocationClient';
import {
  Route,
  Coordinates,
  TravelMode,
  Merchant,
  RouteRequest,
} from '../types';

interface UseRoutingOptions {
  client: LocationClient;
  currentPosition: Coordinates | null;
  defaultTravelMode?: TravelMode;
  useImperialUnits?: boolean;
}

interface UseRoutingReturn {
  // State
  route: Route | null;
  destination: Coordinates | null;
  destinationMerchant: Merchant | null;
  isLoading: boolean;
  error: Error | null;

  // Computed
  formattedDistance: string | null;
  formattedDuration: string | null;

  // Actions
  calculateRoute: (
    destination: Coordinates,
    travelMode?: TravelMode
  ) => Promise<Route | null>;
  calculateRouteToMerchant: (
    merchantId: string,
    travelMode?: TravelMode
  ) => Promise<Route | null>;
  clearRoute: () => void;

  // Settings
  travelMode: TravelMode;
  setTravelMode: (mode: TravelMode) => void;
}

export function useRouting(options: UseRoutingOptions): UseRoutingReturn {
  const {
    client,
    currentPosition,
    defaultTravelMode = 'car',
    useImperialUnits = false,
  } = options;

  // State
  const [route, setRoute] = useState<Route | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [destinationMerchant, setDestinationMerchant] =
    useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>(defaultTravelMode);

  /**
   * Calculate route to a destination
   */
  const calculateRoute = useCallback(
    async (
      dest: Coordinates,
      mode?: TravelMode
    ): Promise<Route | null> => {
      if (!currentPosition) {
        setError(new Error('Current position not available'));
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const request: RouteRequest = {
          origin: currentPosition,
          destination: dest,
          travel_mode: mode || travelMode,
        };

        const response = await client.calculateRoute(request);

        if (response.routes.length > 0) {
          const calculatedRoute = response.routes[0];
          setRoute(calculatedRoute);
          setDestination(dest);
          setDestinationMerchant(null);
          return calculatedRoute;
        }

        throw new Error('No route found');
      } catch (err) {
        const error = err as Error;
        console.error('Error calculating route:', error);
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, currentPosition, travelMode]
  );

  /**
   * Calculate route to a merchant
   */
  const calculateRouteToMerchant = useCallback(
    async (merchantId: string, mode?: TravelMode): Promise<Route | null> => {
      if (!currentPosition) {
        setError(new Error('Current position not available'));
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await client.routeToMerchant({
          origin_latitude: currentPosition.latitude,
          origin_longitude: currentPosition.longitude,
          merchant_id: merchantId,
          travel_mode: mode || travelMode,
        });

        setRoute(response.route);
        setDestination(response.merchant.coordinates);
        setDestinationMerchant(response.merchant);

        return response.route;
      } catch (err) {
        const error = err as Error;
        console.error('Error calculating route to merchant:', error);
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, currentPosition, travelMode]
  );

  /**
   * Clear current route
   */
  const clearRoute = useCallback((): void => {
    setRoute(null);
    setDestination(null);
    setDestinationMerchant(null);
    setError(null);
  }, []);

  // Computed values
  const formattedDistance = route
    ? client.formatDistance(route.distance_meters, useImperialUnits)
    : null;

  const formattedDuration = route
    ? client.formatDuration(route.duration_seconds)
    : null;

  return {
    // State
    route,
    destination,
    destinationMerchant,
    isLoading,
    error,

    // Computed
    formattedDistance,
    formattedDuration,

    // Actions
    calculateRoute,
    calculateRouteToMerchant,
    clearRoute,

    // Settings
    travelMode,
    setTravelMode,
  };
}

export default useRouting;
