/**
 * Push Notification Client
 *
 * Client for interacting with the SwipeSavvy push notification backend.
 * Handles device registration, notification management, and preferences.
 */

import {
  Platform,
  DeviceRegistrationResponse,
  InAppNotification,
  NotificationApiResponse,
  NotificationListData,
  UnreadCountData,
  NotificationCategory,
  NotificationPreferences,
} from '../types';

export class PushNotificationClient {
  private baseUrl: string;
  private authToken: string;
  private userId: string;

  constructor(baseUrl: string, userId: string, authToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.userId = userId;
    this.authToken = authToken;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<NotificationApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`Push notification API error: ${endpoint}`, error);
      throw error;
    }
  }

  // ============================================================================
  // DEVICE REGISTRATION
  // ============================================================================

  /**
   * Register device for push notifications
   *
   * @param deviceToken - Platform-specific device token (APNS or FCM)
   * @param platform - Target platform (ios, ios_sandbox, android)
   * @param deviceName - Optional device name
   * @param appVersion - Optional app version
   * @returns Device registration response with endpoint ARN
   */
  async registerDevice(
    deviceToken: string,
    platform: Platform,
    deviceName?: string,
    appVersion?: string
  ): Promise<DeviceRegistrationResponse> {
    const response = await this.request<DeviceRegistrationResponse>(
      `/api/v1/push-notifications/register-device?user_id=${this.userId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          device_token: deviceToken,
          platform,
          device_name: deviceName,
          app_version: appVersion,
        }),
      }
    );

    return response.data || { success: false, error: 'No data returned' };
  }

  /**
   * Unregister device from push notifications
   *
   * @param endpointArn - AWS SNS endpoint ARN from registration
   */
  async unregisterDevice(endpointArn: string): Promise<boolean> {
    const response = await this.request<{ success: boolean }>(
      '/api/v1/push-notifications/unregister-device',
      {
        method: 'POST',
        body: JSON.stringify({ endpoint_arn: endpointArn }),
      }
    );

    return response.success;
  }

  // ============================================================================
  // IN-APP NOTIFICATIONS
  // ============================================================================

  /**
   * Get in-app notifications for the current user
   *
   * @param options - Query options (category, unreadOnly, limit, offset)
   * @returns List of notifications with pagination info
   */
  async getNotifications(options?: {
    category?: NotificationCategory;
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NotificationListData> {
    const params = new URLSearchParams({ user_id: this.userId });

    if (options?.category) params.append('category', options.category);
    if (options?.unreadOnly) params.append('unread_only', 'true');
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await this.request<NotificationListData>(
      `/api/v1/push-notifications/in-app?${params.toString()}`
    );

    return (
      response.data || {
        notifications: [],
        total_count: 0,
        unread_count: 0,
        limit: 50,
        offset: 0,
      }
    );
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.request<UnreadCountData>(
      `/api/v1/push-notifications/in-app/unread-count?user_id=${this.userId}`
    );

    return response.data?.unread_count || 0;
  }

  /**
   * Mark a notification as read
   *
   * @param notificationId - Notification ID to mark as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const response = await this.request<{ notification_id: string }>(
      `/api/v1/push-notifications/in-app/${notificationId}/read?user_id=${this.userId}`,
      { method: 'POST' }
    );

    return response.success;
  }

  /**
   * Mark all notifications as read
   *
   * @param category - Optional category filter
   * @returns Number of notifications marked as read
   */
  async markAllAsRead(category?: NotificationCategory): Promise<number> {
    const params = new URLSearchParams({ user_id: this.userId });
    if (category) params.append('category', category);

    const response = await this.request<{ count: number }>(
      `/api/v1/push-notifications/in-app/read-all?${params.toString()}`,
      { method: 'POST' }
    );

    return response.data?.count || 0;
  }

  /**
   * Delete a notification
   *
   * @param notificationId - Notification ID to delete
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const response = await this.request<{ notification_id: string }>(
      `/api/v1/push-notifications/in-app/${notificationId}?user_id=${this.userId}`,
      { method: 'DELETE' }
    );

    return response.success;
  }

  /**
   * Clear all notifications
   *
   * @param category - Optional category filter
   * @returns Number of notifications cleared
   */
  async clearAllNotifications(category?: NotificationCategory): Promise<number> {
    const params = new URLSearchParams({ user_id: this.userId });
    if (category) params.append('category', category);

    const response = await this.request<{ count: number }>(
      `/api/v1/push-notifications/in-app?${params.toString()}`,
      { method: 'DELETE' }
    );

    return response.data?.count || 0;
  }

  // ============================================================================
  // PREFERENCES
  // ============================================================================

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await this.request<{ preferences: NotificationPreferences }>(
      `/api/v1/notifications/preferences`
    );

    return (
      response.data?.preferences || {
        transactions: true,
        cashback: true,
        security: true,
        marketing: true,
        system: true,
        social: true,
        support: true,
        push_enabled: true,
        in_app_enabled: true,
        email_notifications: true,
        sms_notifications: true,
      }
    );
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const response = await this.request<{ preferences: NotificationPreferences }>(
      '/api/v1/notifications/preferences',
      {
        method: 'POST',
        body: JSON.stringify(preferences),
      }
    );

    return response.data?.preferences || preferences as NotificationPreferences;
  }
}

// Default export
export default PushNotificationClient;
