/**
 * Mobile App Database Configuration
 * Configures SQLite database for offline support and data persistence
 */

export const MOBILE_DB_CONFIG = {
  // Database name (will be created in device storage)
  DATABASE_NAME: 'swipesavvy_mobile.db',

  // Version for future migrations
  VERSION: 1,

  // Cache configuration
  CACHE: {
    // Default TTL in minutes
    DEFAULT_TTL: 30,
    // Conversation cache TTL
    CONVERSATION_TTL: 60,
    // User profile cache TTL
    USER_PROFILE_TTL: 120,
    // Support ticket cache TTL
    TICKET_TTL: 45,
  },

  // Offline queue configuration
  OFFLINE_QUEUE: {
    // Max retries for failed requests
    MAX_RETRIES: 3,
    // Retry delay in milliseconds
    RETRY_DELAY: 5000,
    // Queue cleanup interval (hours)
    CLEANUP_INTERVAL: 24,
  },

  // Auto-sync configuration
  AUTO_SYNC: {
    // Enable auto-sync
    ENABLED: true,
    // Sync interval in milliseconds
    INTERVAL: 30000, // 30 seconds
    // Sync on app resume
    SYNC_ON_RESUME: true,
    // Sync only on WiFi
    WIFI_ONLY: false,
  },

  // Tables to sync with backend
  SYNC_TABLES: [
    'chat_messages',
    'support_tickets',
    'ticket_messages',
    'transactions',
  ],

  // Tables to NOT sync (local only)
  LOCAL_ONLY_TABLES: [
    'cache',
    'offline_queue',
    'user_preferences',
  ],

  // Error handling
  ERROR_HANDLING: {
    // Log errors to console
    LOG_ERRORS: true,
    // Send errors to backend (when implemented)
    SEND_TO_BACKEND: false,
  },
};

/**
 * Get database file path (will vary by platform)
 */
export const getDatabasePath = (): string => {
  return MOBILE_DB_CONFIG.DATABASE_NAME;
};

/**
 * Verify database configuration
 */
export const verifyDatabaseConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!MOBILE_DB_CONFIG.DATABASE_NAME) {
    errors.push('DATABASE_NAME is not configured');
  }

  if (!MOBILE_DB_CONFIG.VERSION) {
    errors.push('VERSION is not configured');
  }

  if (MOBILE_DB_CONFIG.CACHE.DEFAULT_TTL <= 0) {
    errors.push('CACHE.DEFAULT_TTL must be greater than 0');
  }

  if (MOBILE_DB_CONFIG.OFFLINE_QUEUE.MAX_RETRIES < 0) {
    errors.push('OFFLINE_QUEUE.MAX_RETRIES cannot be negative');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
