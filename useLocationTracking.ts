/**
 * Location Tracking Hook for Mobile App
 * Purpose: Handle real-time location tracking with geofencing
 * Tech: React Native, Expo Location, Background Tasks
 * Created: December 26, 2025
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Constants
const LOCATION_TRACKING_TASK = 'location-tracking-task';
const LOCATION_UPDATE_INTERVAL = 60000; // 60 seconds in production, 10s for testing
const MINIMUM_DISTANCE_CHANGE = 50; // meters
const GEOFENCE_CHECK_INTERVAL = 120000; // 2 minutes

// ═════════════════════════════════════════════════════════════════════════════
// LOCATION SERVICE CLASS
// ═════════════════════════════════════════════════════════════════════════════

class LocationService {
  constructor() {
    this.isTracking = false;
    this.lastLocationUpdate = null;
    this.userPreferences = null;
    this.apiClient = null;
  }

  /**
   * Initialize location service
   */
  async init(apiClient) {
    this.apiClient = apiClient;
    
    // Request location permissions
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== 'granted') {
      console.warn('Foreground location permission not granted');
      return false;
    }

    // Request background location permissions (iOS 11+, Android 10+)
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      const background = await Location.requestBackgroundPermissionsAsync();
      if (background.status !== 'granted') {
        console.warn('Background location permission not granted');
        // Continue anyway - foreground will still work
      }
    }

    return true;
  }

  /**
   * Start location tracking
   */
  async startTracking(userId) {
    if (this.isTracking) {
      console.log('Location tracking already active');
      return true;
    }

    try {
      // Load user preferences
      const prefs = await AsyncStorage.getItem('userLocationPreferences');
      this.userPreferences = prefs ? JSON.parse(prefs) : {
        enableTracking: true,
        enableGeofencing: true,
        updateFrequency: 'normal', // 'frequent', 'normal', 'battery_saver'
        shareLocation: true
      };

      // Configure tracking based on preferences
      const updateInterval = this._getUpdateInterval(this.userPreferences.updateFrequency);

      // Start foreground location updates
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: updateInterval,
        distanceInterval: MINIMUM_DISTANCE_CHANGE,
        foregroundService: {
          notificationTitle: 'SwipeSavvy Location Tracking',
          notificationBody: 'Getting location for nearby deals',
          notificationColor: '#FF6B6B'
        },
        deferredUpdatesInterval: 5000 // Batch updates every 5 seconds
      });

      this.isTracking = true;
      await AsyncStorage.setItem('isLocationTracking', 'true');
      console.log('Location tracking started');

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  async stopTracking() {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      this.isTracking = false;
      await AsyncStorage.setItem('isLocationTracking', 'false');
      console.log('Location tracking stopped');
      return true;
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      return false;
    }
  }

  /**
   * Get current location (single request)
   */
  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        timestamp: location.timestamp
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Track location update with server
   */
  async trackLocationUpdate(userId, location, deviceId, appVersion) {
    if (!this.apiClient) {
      console.warn('API client not initialized');
      return false;
    }

    try {
      const response = await this.apiClient.post('/merchants/location/track', {
        user_id: userId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy_meters: Math.round(location.accuracy),
        address: location.address || null,
        location_source: 'gps',
        device_id: deviceId,
        app_version: appVersion
      });

      // Handle campaign trigger
      if (response.data.geofence_triggered && response.data.campaign_queued) {
        console.log('Campaign triggered at merchant:', response.data.nearest_merchant_id);
        // Show notification or update UI
      }

      return response.data;
    } catch (error) {
      console.error('Error tracking location:', error);
      // Queue for later if offline
      await this._queueLocationUpdate(userId, location, deviceId, appVersion);
      return null;
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async getAddressFromCoords(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        return `${addr.street || ''} ${addr.city || ''}, ${addr.region || ''} ${addr.postalCode || ''}`.trim();
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Queue location update for offline support
   */
  async _queueLocationUpdate(userId, location, deviceId, appVersion) {
    try {
      const queue = await AsyncStorage.getItem('locationUpdateQueue');
      const updates = queue ? JSON.parse(queue) : [];

      updates.push({
        user_id: userId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy_meters: Math.round(location.accuracy),
        device_id: deviceId,
        app_version: appVersion,
        timestamp: Date.now()
      });

      // Keep only last 100 updates
      if (updates.length > 100) {
        updates.shift();
      }

      await AsyncStorage.setItem('locationUpdateQueue', JSON.stringify(updates));
    } catch (error) {
      console.error('Error queueing location update:', error);
    }
  }

  /**
   * Process queued location updates
   */
  async processQueuedUpdates(userId) {
    if (!this.apiClient) return;

    try {
      const queue = await AsyncStorage.getItem('locationUpdateQueue');
      if (!queue) return;

      const updates = JSON.parse(queue);
      if (updates.length === 0) return;

      // Process in batches of 10
      for (let i = 0; i < updates.length; i += 10) {
        const batch = updates.slice(i, i + 10);
        
        for (const update of batch) {
          if (update.user_id === userId) {
            await this.apiClient.post('/merchants/location/track', update);
          }
        }
      }

      // Clear queue
      await AsyncStorage.setItem('locationUpdateQueue', JSON.stringify([]));
      console.log('Processed queued location updates');
    } catch (error) {
      console.error('Error processing queued updates:', error);
    }
  }

  /**
   * Get update interval based on preference
   */
  _getUpdateInterval(frequency) {
    switch (frequency) {
      case 'frequent':
        return 30000; // 30 seconds
      case 'battery_saver':
        return 300000; // 5 minutes
      default:
        return LOCATION_UPDATE_INTERVAL; // 60 seconds
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();

// ═════════════════════════════════════════════════════════════════════════════
// BACKGROUND TASK DEFINITION
// ═════════════════════════════════════════════════════════════════════════════

// Define background task for location updates
if (!TaskManager.isTaskDefined(LOCATION_TRACKING_TASK)) {
  TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
    if (error) {
      console.error('Location tracking error:', error);
      return;
    }

    if (data) {
      const { locations } = data;
      if (locations && locations.length > 0) {
        const location = locations[locations.length - 1];
        
        try {
          // Get stored user ID and device info
          const userId = await AsyncStorage.getItem('userId');
          const deviceId = await AsyncStorage.getItem('deviceId');
          const appVersion = require('../../app.json').expo.version;

          // Get address
          const address = await locationService.getAddressFromCoords(
            location.coords.latitude,
            location.coords.longitude
          );

          // Track update (queued if offline)
          await locationService.trackLocationUpdate(
            userId,
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
              address
            },
            deviceId,
            appVersion
          );

          console.log('Location updated:', location.coords);
        } catch (error) {
          console.error('Error in location tracking task:', error);
        }
      }
    }
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// REACT HOOK FOR COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * useLocationTracking Hook
 * Usage:
 * const { location, isTracking, startTracking, stopTracking, error } = useLocationTracking();
 */
export const useLocationTracking = () => {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const trackingRef = useRef(null);
  const userId = useRef(null);

  // Initialize on mount
  useEffect(() => {
    const initTracking = async () => {
      try {
        // Get user ID
        const stored = await AsyncStorage.getItem('userId');
        userId.current = stored;

        // Check if was tracking
        const wasTracking = await AsyncStorage.getItem('isLocationTracking');
        if (wasTracking === 'true') {
          setIsTracking(true);
        }
      } catch (err) {
        console.error('Error initializing tracking:', err);
      }
    };

    initTracking();
  }, []);

  // Start tracking
  const startTracking = useCallback(async (apiClient) => {
    try {
      const initialized = await locationService.init(apiClient);
      if (!initialized) {
        setError('Location permission denied');
        return false;
      }

      const success = await locationService.startTracking(userId.current);
      if (success) {
        setIsTracking(true);
        setError(null);

        // Get initial location
        const loc = await locationService.getCurrentLocation();
        if (loc) {
          setLocation(loc);
        }

        return true;
      } else {
        setError('Failed to start tracking');
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    try {
      const success = await locationService.stopTracking();
      if (success) {
        setIsTracking(false);
        return true;
      } else {
        setError('Failed to stop tracking');
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc) {
        setLocation(loc);
        return loc;
      }
      return null;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Update location preferences
  const updatePreferences = useCallback(async (preferences) => {
    try {
      const current = await AsyncStorage.getItem('userLocationPreferences');
      const merged = { ...JSON.parse(current || '{}'), ...preferences };
      await AsyncStorage.setItem('userLocationPreferences', JSON.stringify(merged));
      locationService.userPreferences = merged;
      return true;
    } catch (err) {
      console.error('Error updating preferences:', err);
      return false;
    }
  }, []);

  return {
    location,
    isTracking,
    error,
    startTracking,
    stopTracking,
    getCurrentLocation,
    updatePreferences,
    processQueuedUpdates: () => locationService.processQueuedUpdates(userId.current)
  };
};

export default useLocationTracking;
