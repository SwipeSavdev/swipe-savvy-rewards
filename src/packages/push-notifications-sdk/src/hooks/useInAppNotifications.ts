/**
 * useInAppNotifications Hook
 *
 * React hook for managing in-app notifications displayed within
 * the SwipeSavvy mobile application's notification center.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { PushNotificationClient } from '../client/PushNotificationClient';
import {
  InAppNotification,
  NotificationCategory,
  NotificationListData,
} from '../types';

interface UseInAppNotificationsOptions {
  client: PushNotificationClient;
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  pageSize?: number;
}

interface UseInAppNotificationsReturn {
  // State
  notifications: InAppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  hasMore: boolean;

  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: (category?: NotificationCategory) => Promise<number>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  clearAll: (category?: NotificationCategory) => Promise<number>;
  filterByCategory: (category: NotificationCategory | null) => void;
  filterUnreadOnly: (unreadOnly: boolean) => void;

  // Filters
  currentCategory: NotificationCategory | null;
  showUnreadOnly: boolean;
}

export function useInAppNotifications(
  options: UseInAppNotificationsOptions
): UseInAppNotificationsReturn {
  const {
    client,
    userId,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    pageSize = 20,
  } = options;

  // State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Filters
  const [currentCategory, setCurrentCategory] = useState<NotificationCategory | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Refs
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch notifications from server
   */
  const fetchNotifications = useCallback(
    async (reset: boolean = false): Promise<NotificationListData | null> => {
      try {
        const currentOffset = reset ? 0 : offset;

        const data = await client.getNotifications({
          category: currentCategory || undefined,
          unreadOnly: showUnreadOnly,
          limit: pageSize,
          offset: currentOffset,
        });

        return data;
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err as Error);
        return null;
      }
    },
    [client, offset, currentCategory, showUnreadOnly, pageSize]
  );

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async (): Promise<void> => {
    try {
      const count = await client.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [client]);

  /**
   * Refresh notifications (pull to refresh)
   */
  const refresh = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    setError(null);

    try {
      const data = await fetchNotifications(true);

      if (data) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
        setOffset(data.notifications.length);
        setHasMore(data.notifications.length >= pageSize);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchNotifications, pageSize]);

  /**
   * Load more notifications (infinite scroll)
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const data = await fetchNotifications(false);

      if (data) {
        setNotifications((prev) => [...prev, ...data.notifications]);
        setOffset((prev) => prev + data.notifications.length);
        setHasMore(data.notifications.length >= pageSize);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotifications, isLoading, hasMore, pageSize]);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        const success = await client.markAsRead(notificationId);

        if (success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        return success;
      } catch (err) {
        console.error('Error marking notification as read:', err);
        return false;
      }
    },
    [client]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(
    async (category?: NotificationCategory): Promise<number> => {
      try {
        const count = await client.markAllAsRead(category);

        if (count > 0) {
          // Update local state
          setNotifications((prev) =>
            prev.map((n) => {
              if (!category || n.category === category) {
                return { ...n, read: true };
              }
              return n;
            })
          );

          // Refresh unread count
          await fetchUnreadCount();
        }

        return count;
      } catch (err) {
        console.error('Error marking all as read:', err);
        return 0;
      }
    },
    [client, fetchUnreadCount]
  );

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(
    async (notificationId: string): Promise<boolean> => {
      try {
        const success = await client.deleteNotification(notificationId);

        if (success) {
          // Remove from local state
          setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

          // Update unread count if notification was unread
          const notification = notifications.find((n) => n.id === notificationId);
          if (notification && !notification.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }

        return success;
      } catch (err) {
        console.error('Error deleting notification:', err);
        return false;
      }
    },
    [client, notifications]
  );

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(
    async (category?: NotificationCategory): Promise<number> => {
      try {
        const count = await client.clearAllNotifications(category);

        if (count > 0) {
          if (category) {
            // Remove only notifications of that category
            setNotifications((prev) => prev.filter((n) => n.category !== category));
          } else {
            // Clear all
            setNotifications([]);
          }

          // Refresh unread count
          await fetchUnreadCount();
        }

        return count;
      } catch (err) {
        console.error('Error clearing notifications:', err);
        return 0;
      }
    },
    [client, fetchUnreadCount]
  );

  /**
   * Filter by category
   */
  const filterByCategory = useCallback((category: NotificationCategory | null): void => {
    setCurrentCategory(category);
    setOffset(0);
    setHasMore(true);
  }, []);

  /**
   * Filter unread only
   */
  const filterUnreadOnly = useCallback((unreadOnly: boolean): void => {
    setShowUnreadOnly(unreadOnly);
    setOffset(0);
    setHasMore(true);
  }, []);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);

      try {
        const data = await fetchNotifications(true);

        if (data) {
          setNotifications(data.notifications);
          setUnreadCount(data.unread_count);
          setOffset(data.notifications.length);
          setHasMore(data.notifications.length >= pageSize);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      initialLoad();
    }
  }, [userId, currentCategory, showUnreadOnly]); // Re-fetch when filters change

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;

    // Set up periodic refresh
    refreshTimerRef.current = setInterval(() => {
      // Only refresh if not currently loading
      if (!isLoading && !isRefreshing) {
        fetchUnreadCount();
      }
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, userId, isLoading, isRefreshing, fetchUnreadCount]);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    error,
    hasMore,

    // Actions
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    filterByCategory,
    filterUnreadOnly,

    // Filters
    currentCategory,
    showUnreadOnly,
  };
}

export default useInAppNotifications;
