/**
 * SwipeSavvy Push Notifications SDK
 *
 * A comprehensive SDK for managing push notifications and in-app notifications
 * in the SwipeSavvy mobile application.
 *
 * Features:
 * - AWS SNS Push Notifications (iOS/Android)
 * - In-app notification center
 * - Notification preferences
 * - Local notification scheduling
 * - Badge count management
 *
 * @example
 * ```tsx
 * import {
 *   PushNotificationProvider,
 *   useNotifications,
 *   useInApp,
 *   usePush,
 * } from '@swipesavvy/push-notifications-sdk';
 *
 * // Wrap your app
 * function App() {
 *   return (
 *     <PushNotificationProvider
 *       config={{
 *         apiBaseUrl: 'https://api.swipesavvy.com',
 *         userId: user.id,
 *         authToken: token,
 *         platform: 'ios',
 *       }}
 *     >
 *       <MainApp />
 *     </PushNotificationProvider>
 *   );
 * }
 *
 * // Use in components
 * function NotificationBell() {
 *   const { inApp } = useNotifications();
 *   return <Badge count={inApp.unreadCount} />;
 * }
 * ```
 */

// Provider and hooks
export {
  PushNotificationProvider,
  useNotifications,
  usePush,
  useInApp,
} from './PushNotificationProvider';

// Individual hooks
export { usePushNotifications } from './hooks/usePushNotifications';
export { useInAppNotifications } from './hooks/useInAppNotifications';

// Client
export { PushNotificationClient } from './client/PushNotificationClient';

// Types
export type {
  Platform,
  NotificationCategory,
  NotificationPriority,
  NotificationType,
  DeviceRegistrationResponse,
  PushNotificationPayload,
  InAppNotification,
  NotificationPreferences,
  NotificationApiResponse,
  NotificationListData,
  UnreadCountData,
  NotificationEventHandlers,
  PushNotificationConfig,
  LocalNotification,
} from './types';
