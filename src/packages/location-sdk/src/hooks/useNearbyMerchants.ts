/**
 * useNearbyMerchants Hook
 *
 * React hook for searching and displaying nearby SwipeSavvy
 * partner merchants with cashback offers.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

import { LocationClient } from '../client/LocationClient';
import { Merchant, Coordinates, NearbyMerchantsRequest } from '../types';

interface UseNearbyMerchantsOptions {
  client: LocationClient;
  currentPosition: Coordinates | null;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  defaultRadius?: number; // meters
  partnersOnly?: boolean;
  maxResults?: number;
}

interface UseNearbyMerchantsReturn {
  // State
  merchants: Merchant[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  totalCount: number;

  // Actions
  refresh: () => Promise<void>;
  searchByCategory: (category: string) => Promise<void>;
  searchByRadius: (radiusMeters: number) => Promise<void>;
  clearResults: () => void;

  // Filters
  currentCategory: string | null;
  currentRadius: number;
}

export function useNearbyMerchants(
  options: UseNearbyMerchantsOptions
): UseNearbyMerchantsReturn {
  const {
    client,
    currentPosition,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute
    defaultRadius = 5000, // 5km
    partnersOnly = true,
    maxResults = 50,
  } = options;

  // State
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentRadius, setCurrentRadius] = useState(defaultRadius);

  // Refs
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<Coordinates | null>(null);

  /**
   * Fetch nearby merchants
   */
  const fetchMerchants = useCallback(
    async (isRefresh: boolean = false): Promise<void> => {
      if (!currentPosition) {
        console.log('No current position available for merchant search');
        return;
      }

      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const request: NearbyMerchantsRequest = {
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
          radius_meters: currentRadius,
          partners_only: partnersOnly,
          max_results: maxResults,
        };

        if (currentCategory) {
          request.category = currentCategory;
        }

        const response = await client.searchNearbyMerchants(request);

        // Sort by distance
        const sortedMerchants = response.merchants.sort(
          (a, b) => (a.distance_meters || 0) - (b.distance_meters || 0)
        );

        setMerchants(sortedMerchants);
        setTotalCount(response.total_count);
        lastPositionRef.current = currentPosition;
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching nearby merchants:', error);
        setError(error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      client,
      currentPosition,
      currentRadius,
      currentCategory,
      partnersOnly,
      maxResults,
    ]
  );

  /**
   * Refresh merchant list
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchMerchants(true);
  }, [fetchMerchants]);

  /**
   * Search by category
   */
  const searchByCategory = useCallback(
    async (category: string): Promise<void> => {
      setCurrentCategory(category || null);
      // fetchMerchants will be triggered by useEffect
    },
    []
  );

  /**
   * Search by radius
   */
  const searchByRadius = useCallback(
    async (radiusMeters: number): Promise<void> => {
      setCurrentRadius(radiusMeters);
      // fetchMerchants will be triggered by useEffect
    },
    []
  );

  /**
   * Clear results
   */
  const clearResults = useCallback((): void => {
    setMerchants([]);
    setTotalCount(0);
    setCurrentCategory(null);
    setCurrentRadius(defaultRadius);
  }, [defaultRadius]);

  // Initial fetch when position becomes available
  useEffect(() => {
    if (currentPosition && !isLoading) {
      // Check if position has changed significantly (more than 100m)
      if (lastPositionRef.current) {
        const distance = client.calculateDistanceLocal(
          currentPosition,
          lastPositionRef.current
        );
        if (distance.distance_meters < 100) {
          return; // Position hasn't changed significantly
        }
      }

      fetchMerchants();
    }
  }, [currentPosition, currentCategory, currentRadius]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !currentPosition) return;

    refreshTimerRef.current = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        fetchMerchants(true);
      }
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, currentPosition, isLoading, isRefreshing, fetchMerchants]);

  return {
    // State
    merchants,
    isLoading,
    isRefreshing,
    error,
    totalCount,

    // Actions
    refresh,
    searchByCategory,
    searchByRadius,
    clearResults,

    // Filters
    currentCategory,
    currentRadius,
  };
}

export default useNearbyMerchants;
