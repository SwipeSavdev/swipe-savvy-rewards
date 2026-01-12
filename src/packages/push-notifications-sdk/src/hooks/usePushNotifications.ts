/**
 * usePushNotifications Hook
 *
 * React hook for managing push notification registration and handling
 * in React Native applications using Expo Notifications.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform as RNPlatform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PushNotificationClient } from '../client/PushNotificationClient';
import {
  Platform,
  PushNotificationPayload,
  NotificationEventHandlers,
  DeviceRegistrationResponse,
} from '../types';

// Storage keys
const STORAGE_KEYS = {
  ENDPOINT_ARN: '@swipesavvy_push_endpoint_arn',
  DEVICE_TOKEN: '@swipesavvy_push_device_token',
  PUSH_ENABLED: '@swipesavvy_push_enabled',
};

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface UsePushNotificationsOptions {
  client: PushNotificationClient;
  userId: string;
  enabled?: boolean;
  handlers?: NotificationEventHandlers;
}

interface UsePushNotificationsReturn {
  // State
  isRegistered: boolean;
  isLoading: boolean;
  endpointArn: string | null;
  deviceToken: string | null;
  error: Error | null;
  permissionStatus: Notifications.PermissionStatus | null;

  // Actions
  registerForPushNotifications: () => Promise<DeviceRegistrationResponse | null>;
  unregisterFromPushNotifications: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  setBadgeCount: (count: number) => Promise<void>;
  clearBadgeCount: () => Promise<void>;
  scheduleLocalNotification: (
    title: string,
    body: string,
    data?: Record<string, unknown>,
    trigger?: Notifications.NotificationTriggerInput
  ) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

export function usePushNotifications(
  options: UsePushNotificationsOptions
): UsePushNotificationsReturn {
  const { client, userId, enabled = true, handlers } = options;

  // State
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [endpointArn, setEndpointArn] = useState<string | null>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);

  // Refs for listeners
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  /**
   * Get the platform type for API
   */
  const getPlatform = useCallback((): Platform => {
    if (RNPlatform.OS === 'ios') {
      // Use sandbox for development builds
      const isDev = __DEV__ || Constants.appOwnership === 'expo';
      return isDev ? 'ios_sandbox' : 'ios';
    }
    return 'android';
  }, []);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return false;
      }

      // Configure Android notification channel
      if (RNPlatform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        });

        // Create additional channels for different notification types
        await Notifications.setNotificationChannelAsync('transactions', {
          name: 'Transactions',
          importance: Notifications.AndroidImportance.HIGH,
          description: 'Transaction and payment notifications',
        });

        await Notifications.setNotificationChannelAsync('cashback', {
          name: 'Cashback & Rewards',
          importance: Notifications.AndroidImportance.DEFAULT,
          description: 'Cashback and rewards notifications',
        });

        await Notifications.setNotificationChannelAsync('security', {
          name: 'Security Alerts',
          importance: Notifications.AndroidImportance.MAX,
          description: 'Security and account alerts',
        });

        await Notifications.setNotificationChannelAsync('marketing', {
          name: 'Offers & Promotions',
          importance: Notifications.AndroidImportance.LOW,
          description: 'Marketing and promotional notifications',
        });
      }

      return true;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError(err as Error);
      return false;
    }
  }, []);

  /**
   * Register device for push notifications
   */
  const registerForPushNotifications =
    useCallback(async (): Promise<DeviceRegistrationResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if device supports push notifications
        if (!Device.isDevice) {
          throw new Error('Push notifications require a physical device');
        }

        // Request permissions
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          throw new Error('Push notification permission denied');
        }

        // Get push token
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });

        const token = tokenData.data;
        setDeviceToken(token);

        // Store token locally
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, token);

        // Register with backend
        const platform = getPlatform();
        const deviceName = `${Device.modelName || 'Unknown'} (${Device.osName} ${Device.osVersion})`;
        const appVersion = Constants.expoConfig?.version || '1.0.0';

        const response = await client.registerDevice(token, platform, deviceName, appVersion);

        if (response.success && response.endpoint_arn) {
          setEndpointArn(response.endpoint_arn);
          setIsRegistered(true);

          // Store endpoint ARN locally
          await AsyncStorage.setItem(STORAGE_KEYS.ENDPOINT_ARN, response.endpoint_arn);
          await AsyncStorage.setItem(STORAGE_KEYS.PUSH_ENABLED, 'true');

          // Call success handler
          handlers?.onRegistrationSuccess?.(response.endpoint_arn);

          console.log('Push notification registration successful:', response.endpoint_arn);
        } else {
          throw new Error(response.error || 'Registration failed');
        }

        return response;
      } catch (err) {
        const error = err as Error;
        console.error('Push notification registration error:', error);
        setError(error);
        handlers?.onRegistrationError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [client, getPlatform, requestPermissions, handlers]);

  /**
   * Unregister from push notifications
   */
  const unregisterFromPushNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      const storedArn = endpointArn || (await AsyncStorage.getItem(STORAGE_KEYS.ENDPOINT_ARN));

      if (storedArn) {
        await client.unregisterDevice(storedArn);
      }

      // Clear local storage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ENDPOINT_ARN,
        STORAGE_KEYS.DEVICE_TOKEN,
        STORAGE_KEYS.PUSH_ENABLED,
      ]);

      setIsRegistered(false);
      setEndpointArn(null);
      setDeviceToken(null);

      console.log('Push notification unregistration successful');
      return true;
    } catch (err) {
      console.error('Push notification unregistration error:', err);
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client, endpointArn]);

  /**
   * Set badge count
   */
  const setBadgeCount = useCallback(async (count: number): Promise<void> => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (err) {
      console.error('Error setting badge count:', err);
    }
  }, []);

  /**
   * Clear badge count
   */
  const clearBadgeCount = useCallback(async (): Promise<void> => {
    await setBadgeCount(0);
  }, [setBadgeCount]);

  /**
   * Schedule a local notification
   */
  const scheduleLocalNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: Record<string, unknown>,
      trigger?: Notifications.NotificationTriggerInput
    ): Promise<string> => {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || null, // null = immediate
      });

      return notificationId;
    },
    []
  );

  /**
   * Cancel a scheduled notification
   */
  const cancelNotification = useCallback(async (notificationId: string): Promise<void> => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }, []);

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check for existing registration
        const storedArn = await AsyncStorage.getItem(STORAGE_KEYS.ENDPOINT_ARN);
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
        const pushEnabled = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_ENABLED);

        if (storedArn && storedToken && pushEnabled === 'true') {
          setEndpointArn(storedArn);
          setDeviceToken(storedToken);
          setIsRegistered(true);
        }

        // Get current permission status
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);
      } catch (err) {
        console.error('Error initializing push notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    if (!enabled) return;

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const payload = notification.request.content as PushNotificationPayload;
      console.log('Notification received:', payload);
      handlers?.onNotificationReceived?.(payload);
    });

    // Listener for notification interactions (user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const payload = response.notification.request.content as PushNotificationPayload;
      console.log('Notification opened:', payload);
      handlers?.onNotificationOpened?.(payload);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [enabled, handlers]);

  // Auto-register if enabled and not registered
  useEffect(() => {
    if (enabled && !isRegistered && !isLoading && userId) {
      // Delay auto-registration to allow app to fully load
      const timer = setTimeout(() => {
        registerForPushNotifications();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [enabled, isRegistered, isLoading, userId, registerForPushNotifications]);

  return {
    // State
    isRegistered,
    isLoading,
    endpointArn,
    deviceToken,
    error,
    permissionStatus,

    // Actions
    registerForPushNotifications,
    unregisterFromPushNotifications,
    requestPermissions,
    setBadgeCount,
    clearBadgeCount,
    scheduleLocalNotification,
    cancelNotification,
    cancelAllNotifications,
  };
}

export default usePushNotifications;
