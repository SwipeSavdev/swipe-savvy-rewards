/**
 * Push Notifications SDK Types
 *
 * Type definitions for push notifications and in-app notifications
 */

// Platform types
export type Platform = 'ios' | 'ios_sandbox' | 'android';

// Notification categories
export type NotificationCategory =
  | 'transaction'
  | 'cashback'
  | 'security'
  | 'account'
  | 'marketing'
  | 'system'
  | 'social'
  | 'support';

// Notification priority levels
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Push notification types (from server)
export type NotificationType =
  | 'transaction'
  | 'cashback'
  | 'security'
  | 'marketing'
  | 'system'
  | 'chat';

// Device registration response
export interface DeviceRegistrationResponse {
  success: boolean;
  endpoint_arn?: string;
  platform?: string;
  status?: string;
  error?: string;
}

// Push notification payload
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: string;
  notification_type?: NotificationType;
  action?: string;
  deep_link?: string;
}

// In-app notification
export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  icon?: string;
  image_url?: string;
  action_url?: string;
  action_type?: 'navigate' | 'open_url' | 'dismiss';
  data?: Record<string, unknown>;
  read: boolean;
  dismissed: boolean;
  created_at: string;
  expires_at?: string;
}

// Notification preferences
export interface NotificationPreferences {
  transactions: boolean;
  cashback: boolean;
  security: boolean;
  marketing: boolean;
  system: boolean;
  social: boolean;
  support: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

// API Response types
export interface NotificationApiResponse<T = unknown> {
  success: boolean;
  message: string;
  timestamp: string;
  data?: T;
}

// Notification list response
export interface NotificationListData {
  notifications: InAppNotification[];
  total_count: number;
  unread_count: number;
  limit: number;
  offset: number;
}

// Unread count response
export interface UnreadCountData {
  unread_count: number;
}

// Notification event handlers
export interface NotificationEventHandlers {
  onNotificationReceived?: (notification: PushNotificationPayload) => void;
  onNotificationOpened?: (notification: PushNotificationPayload) => void;
  onNotificationDismissed?: (notification: PushNotificationPayload) => void;
  onRegistrationSuccess?: (endpointArn: string) => void;
  onRegistrationError?: (error: Error) => void;
}

// SDK Configuration
export interface PushNotificationConfig {
  apiBaseUrl: string;
  userId: string;
  authToken: string;
  platform: Platform;
  enablePush?: boolean;
  enableInApp?: boolean;
  handlers?: NotificationEventHandlers;
}

// Local notification for scheduling
export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  scheduledAt?: Date;
  badge?: number;
  sound?: string;
}
