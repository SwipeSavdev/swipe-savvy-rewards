/**
 * useLocation Hook
 *
 * React hook for managing device location and GPS tracking
 * using expo-location in React Native applications.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as ExpoLocation from 'expo-location';

import { LocationClient } from '../client/LocationClient';
import { Coordinates, DevicePosition, TrackDeviceResponse } from '../types';

interface UseLocationOptions {
  client: LocationClient;
  deviceId: string;
  enableTracking?: boolean;
  trackingInterval?: number; // milliseconds
  highAccuracy?: boolean;
  onPositionUpdate?: (position: DevicePosition) => void;
  onError?: (error: Error) => void;
}

interface UseLocationReturn {
  // State
  currentPosition: Coordinates | null;
  isLoading: boolean;
  isTracking: boolean;
  error: Error | null;
  permissionStatus: ExpoLocation.PermissionStatus | null;
  lastUpdate: Date | null;

  // Actions
  requestPermissions: () => Promise<boolean>;
  getCurrentPosition: () => Promise<Coordinates | null>;
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  updatePositionOnServer: () => Promise<TrackDeviceResponse | null>;
}

export function useLocation(options: UseLocationOptions): UseLocationReturn {
  const {
    client,
    deviceId,
    enableTracking = false,
    trackingInterval = 30000, // 30 seconds
    highAccuracy = true,
    onPositionUpdate,
    onError,
  } = options;

  // State
  const [currentPosition, setCurrentPosition] = useState<Coordinates | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<ExpoLocation.PermissionStatus | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Refs
  const locationSubscription = useRef<ExpoLocation.LocationSubscription | null>(
    null
  );
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Request location permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Request foreground permissions first
      const { status: foregroundStatus } =
        await ExpoLocation.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        setPermissionStatus(foregroundStatus);
        setError(new Error('Location permission denied'));
        return false;
      }

      // Optionally request background permissions for tracking
      if (enableTracking) {
        const { status: backgroundStatus } =
          await ExpoLocation.requestBackgroundPermissionsAsync();

        if (backgroundStatus !== 'granted') {
          console.warn(
            'Background location permission denied - tracking will only work in foreground'
          );
        }
      }

      setPermissionStatus(foregroundStatus);
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error requesting location permissions:', error);
      setError(error);
      onError?.(error);
      return false;
    }
  }, [enableTracking, onError]);

  /**
   * Get current device position
   */
  const getCurrentPosition = useCallback(async (): Promise<Coordinates | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check permissions
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const granted = await requestPermissions();
        if (!granted) {
          throw new Error('Location permission not granted');
        }
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: highAccuracy
          ? ExpoLocation.Accuracy.High
          : ExpoLocation.Accuracy.Balanced,
      });

      const position: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentPosition(position);
      setLastUpdate(new Date());

      return position;
    } catch (err) {
      const error = err as Error;
      console.error('Error getting current position:', error);
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [highAccuracy, requestPermissions, onError]);

  /**
   * Update position on server
   */
  const updatePositionOnServer =
    useCallback(async (): Promise<TrackDeviceResponse | null> => {
      try {
        const position = await getCurrentPosition();
        if (!position) return null;

        const response = await client.trackDevice({
          device_id: deviceId,
          latitude: position.latitude,
          longitude: position.longitude,
        });

        const devicePosition: DevicePosition = {
          device_id: deviceId,
          position,
          timestamp: response.timestamp,
        };

        onPositionUpdate?.(devicePosition);

        return response;
      } catch (err) {
        const error = err as Error;
        console.error('Error updating position on server:', error);
        onError?.(error);
        return null;
      }
    }, [client, deviceId, getCurrentPosition, onPositionUpdate, onError]);

  /**
   * Start location tracking
   */
  const startTracking = useCallback(async (): Promise<boolean> => {
    try {
      // Check permissions
      const granted = await requestPermissions();
      if (!granted) return false;

      // Check if location services are enabled
      const enabled = await ExpoLocation.hasServicesEnabledAsync();
      if (!enabled) {
        setError(new Error('Location services are disabled'));
        return false;
      }

      setIsTracking(true);

      // Start watching position
      locationSubscription.current = await ExpoLocation.watchPositionAsync(
        {
          accuracy: highAccuracy
            ? ExpoLocation.Accuracy.High
            : ExpoLocation.Accuracy.Balanced,
          timeInterval: trackingInterval,
          distanceInterval: 10, // Update if moved 10 meters
        },
        (location) => {
          const position: Coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          setCurrentPosition(position);
          setLastUpdate(new Date());

          // Notify callback
          const devicePosition: DevicePosition = {
            device_id: deviceId,
            position,
            accuracy: location.coords.accuracy ?? undefined,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
            timestamp: new Date(location.timestamp).toISOString(),
          };

          onPositionUpdate?.(devicePosition);
        }
      );

      // Also start interval for server updates
      trackingIntervalRef.current = setInterval(() => {
        updatePositionOnServer();
      }, trackingInterval);

      // Initial server update
      await updatePositionOnServer();

      console.log('Location tracking started');
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error starting location tracking:', error);
      setError(error);
      setIsTracking(false);
      onError?.(error);
      return false;
    }
  }, [
    requestPermissions,
    highAccuracy,
    trackingInterval,
    deviceId,
    onPositionUpdate,
    updatePositionOnServer,
    onError,
  ]);

  /**
   * Stop location tracking
   */
  const stopTracking = useCallback((): void => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    setIsTracking(false);
    console.log('Location tracking stopped');
  }, []);

  // Initialize permission status on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      setPermissionStatus(status);
    };

    checkPermissions();
  }, []);

  // Auto-start tracking if enabled
  useEffect(() => {
    if (enableTracking && permissionStatus === 'granted' && !isTracking) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enableTracking, permissionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    // State
    currentPosition,
    isLoading,
    isTracking,
    error,
    permissionStatus,
    lastUpdate,

    // Actions
    requestPermissions,
    getCurrentPosition,
    startTracking,
    stopTracking,
    updatePositionOnServer,
  };
}

export default useLocation;
