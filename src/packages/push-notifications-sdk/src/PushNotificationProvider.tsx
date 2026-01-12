/**
 * PushNotificationProvider
 *
 * React context provider for push and in-app notifications.
 * Provides notification state and actions to all child components.
 */

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';

import { PushNotificationClient } from './client/PushNotificationClient';
import { usePushNotifications } from './hooks/usePushNotifications';
import { useInAppNotifications } from './hooks/useInAppNotifications';
import {
  PushNotificationConfig,
  InAppNotification,
  NotificationCategory,
  NotificationEventHandlers,
  DeviceRegistrationResponse,
  NotificationPreferences,
} from './types';

// Context types
interface PushNotificationContextValue {
  // Push notification state
  push: {
    isRegistered: boolean;
    isLoading: boolean;
    endpointArn: string | null;
    deviceToken: string | null;
    error: Error | null;
    permissionStatus: string | null;
    register: () => Promise<DeviceRegistrationResponse | null>;
    unregister: () => Promise<boolean>;
    requestPermissions: () => Promise<boolean>;
    setBadgeCount: (count: number) => Promise<void>;
    clearBadgeCount: () => Promise<void>;
    scheduleNotification: (
      title: string,
      body: string,
      data?: Record<string, unknown>
    ) => Promise<string>;
  };

  // In-app notification state
  inApp: {
    notifications: InAppNotification[];
    unreadCount: number;
    isLoading: boolean;
    isRefreshing: boolean;
    error: Error | null;
    hasMore: boolean;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<boolean>;
    markAllAsRead: (category?: NotificationCategory) => Promise<number>;
    deleteNotification: (notificationId: string) => Promise<boolean>;
    clearAll: (category?: NotificationCategory) => Promise<number>;
    filterByCategory: (category: NotificationCategory | null) => void;
    currentCategory: NotificationCategory | null;
  };

  // Client for direct API access
  client: PushNotificationClient;

  // Preferences
  getPreferences: () => Promise<NotificationPreferences>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<NotificationPreferences>;
}

// Create context
const PushNotificationContext = createContext<PushNotificationContextValue | null>(null);

// Provider props
interface PushNotificationProviderProps {
  config: PushNotificationConfig;
  children: ReactNode;
}

/**
 * PushNotificationProvider Component
 *
 * Wrap your app with this provider to enable push and in-app notifications.
 *
 * @example
 * ```tsx
 * <PushNotificationProvider
 *   config={{
 *     apiBaseUrl: 'https://api.swipesavvy.com',
 *     userId: user.id,
 *     authToken: authToken,
 *     platform: 'ios',
 *     handlers: {
 *       onNotificationReceived: (notification) => console.log('Received:', notification),
 *       onNotificationOpened: (notification) => handleDeepLink(notification.data?.deep_link),
 *     },
 *   }}
 * >
 *   <App />
 * </PushNotificationProvider>
 * ```
 */
export function PushNotificationProvider({
  config,
  children,
}: PushNotificationProviderProps): React.JSX.Element {
  // Create client
  const client = useMemo(
    () => new PushNotificationClient(config.apiBaseUrl, config.userId, config.authToken),
    [config.apiBaseUrl, config.userId, config.authToken]
  );

  // Use push notifications hook
  const pushNotifications = usePushNotifications({
    client,
    userId: config.userId,
    enabled: config.enablePush !== false,
    handlers: config.handlers,
  });

  // Use in-app notifications hook
  const inAppNotifications = useInAppNotifications({
    client,
    userId: config.userId,
    autoRefresh: true,
    refreshInterval: 30000,
    pageSize: 20,
  });

  // Preferences methods
  const getPreferences = useCallback(async () => {
    return client.getPreferences();
  }, [client]);

  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      return client.updatePreferences(prefs);
    },
    [client]
  );

  // Build context value
  const contextValue = useMemo<PushNotificationContextValue>(
    () => ({
      push: {
        isRegistered: pushNotifications.isRegistered,
        isLoading: pushNotifications.isLoading,
        endpointArn: pushNotifications.endpointArn,
        deviceToken: pushNotifications.deviceToken,
        error: pushNotifications.error,
        permissionStatus: pushNotifications.permissionStatus,
        register: pushNotifications.registerForPushNotifications,
        unregister: pushNotifications.unregisterFromPushNotifications,
        requestPermissions: pushNotifications.requestPermissions,
        setBadgeCount: pushNotifications.setBadgeCount,
        clearBadgeCount: pushNotifications.clearBadgeCount,
        scheduleNotification: pushNotifications.scheduleLocalNotification,
      },
      inApp: {
        notifications: inAppNotifications.notifications,
        unreadCount: inAppNotifications.unreadCount,
        isLoading: inAppNotifications.isLoading,
        isRefreshing: inAppNotifications.isRefreshing,
        error: inAppNotifications.error,
        hasMore: inAppNotifications.hasMore,
        refresh: inAppNotifications.refresh,
        loadMore: inAppNotifications.loadMore,
        markAsRead: inAppNotifications.markAsRead,
        markAllAsRead: inAppNotifications.markAllAsRead,
        deleteNotification: inAppNotifications.deleteNotification,
        clearAll: inAppNotifications.clearAll,
        filterByCategory: inAppNotifications.filterByCategory,
        currentCategory: inAppNotifications.currentCategory,
      },
      client,
      getPreferences,
      updatePreferences,
    }),
    [
      pushNotifications,
      inAppNotifications,
      client,
      getPreferences,
      updatePreferences,
    ]
  );

  return (
    <PushNotificationContext.Provider value={contextValue}>
      {children}
    </PushNotificationContext.Provider>
  );
}

/**
 * Hook to access push notification context
 *
 * @example
 * ```tsx
 * function NotificationBell() {
 *   const { inApp } = useNotifications();
 *   return <Badge count={inApp.unreadCount} />;
 * }
 * ```
 */
export function useNotifications(): PushNotificationContextValue {
  const context = useContext(PushNotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a PushNotificationProvider');
  }

  return context;
}

/**
 * Hook to access only push notification functionality
 */
export function usePush() {
  const { push } = useNotifications();
  return push;
}

/**
 * Hook to access only in-app notification functionality
 */
export function useInApp() {
  const { inApp } = useNotifications();
  return inApp;
}

export default PushNotificationProvider;
