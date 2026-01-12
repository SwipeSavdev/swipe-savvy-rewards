/**
 * useGeofencing Hook
 *
 * React hook for managing geofences and monitoring
 * enter/exit events for location-based features.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as ExpoLocation from 'expo-location';

import { LocationClient } from '../client/LocationClient';
import {
  Geofence,
  Coordinates,
  GeofenceEvaluationResult,
  CreateCircularGeofenceRequest,
  CreatePolygonGeofenceRequest,
} from '../types';

interface UseGeofencingOptions {
  client: LocationClient;
  currentPosition: Coordinates | null;
  enableMonitoring?: boolean;
  monitoringInterval?: number; // milliseconds
  onGeofenceEnter?: (geofenceId: string, geofence: Geofence) => void;
  onGeofenceExit?: (geofenceId: string, geofence: Geofence) => void;
  onError?: (error: Error) => void;
}

interface UseGeofencingReturn {
  // State
  geofences: Geofence[];
  activeGeofences: string[]; // IDs of geofences user is currently inside
  isLoading: boolean;
  isMonitoring: boolean;
  error: Error | null;

  // Actions
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
}

export function useGeofencing(
  options: UseGeofencingOptions
): UseGeofencingReturn {
  const {
    client,
    currentPosition,
    enableMonitoring = false,
    monitoringInterval = 10000, // 10 seconds
    onGeofenceEnter,
    onGeofenceExit,
    onError,
  } = options;

  // State
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [activeGeofences, setActiveGeofences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const geofenceMapRef = useRef<Map<string, Geofence>>(new Map());

  /**
   * Load all geofences from server
   */
  const loadGeofences = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await client.getGeofences();
      setGeofences(response.geofences);

      // Update geofence map for quick lookup
      geofenceMapRef.current.clear();
      response.geofences.forEach((gf) => {
        geofenceMapRef.current.set(gf.geofence_id, gf);
      });
    } catch (err) {
      const error = err as Error;
      console.error('Error loading geofences:', error);
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [client, onError]);

  /**
   * Create a circular geofence
   */
  const createCircularGeofence = useCallback(
    async (
      request: CreateCircularGeofenceRequest
    ): Promise<Geofence | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const geofence = await client.createCircularGeofence(request);

        // Add to local state
        setGeofences((prev) => [...prev, geofence]);
        geofenceMapRef.current.set(geofence.geofence_id, geofence);

        return geofence;
      } catch (err) {
        const error = err as Error;
        console.error('Error creating circular geofence:', error);
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, onError]
  );

  /**
   * Create a polygon geofence
   */
  const createPolygonGeofence = useCallback(
    async (request: CreatePolygonGeofenceRequest): Promise<Geofence | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const geofence = await client.createPolygonGeofence(request);

        // Add to local state
        setGeofences((prev) => [...prev, geofence]);
        geofenceMapRef.current.set(geofence.geofence_id, geofence);

        return geofence;
      } catch (err) {
        const error = err as Error;
        console.error('Error creating polygon geofence:', error);
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, onError]
  );

  /**
   * Delete a geofence
   */
  const deleteGeofence = useCallback(
    async (geofenceId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await client.deleteGeofence(geofenceId);

        if (result.success) {
          // Remove from local state
          setGeofences((prev) =>
            prev.filter((gf) => gf.geofence_id !== geofenceId)
          );
          setActiveGeofences((prev) =>
            prev.filter((id) => id !== geofenceId)
          );
          geofenceMapRef.current.delete(geofenceId);
        }

        return result.success;
      } catch (err) {
        const error = err as Error;
        console.error('Error deleting geofence:', error);
        setError(error);
        onError?.(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [client, onError]
  );

  /**
   * Evaluate if a position is inside geofences
   */
  const evaluatePosition = useCallback(
    async (position?: Coordinates): Promise<GeofenceEvaluationResult[]> => {
      const evalPosition = position || currentPosition;
      if (!evalPosition) {
        return [];
      }

      try {
        const response = await client.evaluateGeofences({
          latitude: evalPosition.latitude,
          longitude: evalPosition.longitude,
        });

        // Process enter/exit events
        const newActiveGeofences = response.results
          .filter((r) => r.is_inside)
          .map((r) => r.geofence_id);

        // Check for enter events
        newActiveGeofences.forEach((geofenceId) => {
          if (!activeGeofences.includes(geofenceId)) {
            const geofence = geofenceMapRef.current.get(geofenceId);
            if (geofence) {
              console.log('Geofence enter:', geofenceId);
              onGeofenceEnter?.(geofenceId, geofence);
            }
          }
        });

        // Check for exit events
        activeGeofences.forEach((geofenceId) => {
          if (!newActiveGeofences.includes(geofenceId)) {
            const geofence = geofenceMapRef.current.get(geofenceId);
            if (geofence) {
              console.log('Geofence exit:', geofenceId);
              onGeofenceExit?.(geofenceId, geofence);
            }
          }
        });

        setActiveGeofences(newActiveGeofences);

        return response.results;
      } catch (err) {
        const error = err as Error;
        console.error('Error evaluating geofences:', error);
        onError?.(error);
        return [];
      }
    },
    [client, currentPosition, activeGeofences, onGeofenceEnter, onGeofenceExit, onError]
  );

  /**
   * Start geofence monitoring
   */
  const startMonitoring = useCallback((): void => {
    if (isMonitoring) return;

    setIsMonitoring(true);

    // Start periodic evaluation
    monitoringIntervalRef.current = setInterval(() => {
      if (currentPosition) {
        evaluatePosition(currentPosition);
      }
    }, monitoringInterval);

    // Initial evaluation
    if (currentPosition) {
      evaluatePosition(currentPosition);
    }

    console.log('Geofence monitoring started');
  }, [isMonitoring, monitoringInterval, currentPosition, evaluatePosition]);

  /**
   * Stop geofence monitoring
   */
  const stopMonitoring = useCallback((): void => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    setIsMonitoring(false);
    console.log('Geofence monitoring stopped');
  }, []);

  // Load geofences on mount
  useEffect(() => {
    loadGeofences();
  }, []);

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (enableMonitoring && geofences.length > 0 && currentPosition) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enableMonitoring, geofences.length > 0, currentPosition !== null]);

  // Evaluate when position changes (if monitoring)
  useEffect(() => {
    if (isMonitoring && currentPosition) {
      evaluatePosition(currentPosition);
    }
  }, [currentPosition, isMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    // State
    geofences,
    activeGeofences,
    isLoading,
    isMonitoring,
    error,

    // Actions
    loadGeofences,
    createCircularGeofence,
    createPolygonGeofence,
    deleteGeofence,
    evaluatePosition,
    startMonitoring,
    stopMonitoring,
  };
}

export default useGeofencing;
