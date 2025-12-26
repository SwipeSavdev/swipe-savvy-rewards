/**
 * Admin Portal PostgreSQL Database Configuration
 * Configures connection to swipesavvy_admin database
 */

export const ADMIN_DB_CONFIG = {
  // PostgreSQL Connection
  CONNECTION: {
    host: process.env.REACT_APP_DB_HOST || 'localhost',
    port: parseInt(process.env.REACT_APP_DB_PORT || '5432', 10),
    database: process.env.REACT_APP_DB_NAME || 'swipesavvy_admin',
    username: process.env.REACT_APP_DB_USER || 'postgres',
    password: process.env.REACT_APP_DB_PASSWORD || 'password',
    ssl: process.env.REACT_APP_DB_SSL === 'true', // Enable in production
  },

  // Connection Pool
  POOL: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },

  // Query Configuration
  QUERY: {
    // Query timeout in milliseconds
    TIMEOUT: 30000,
    // Max query retries
    MAX_RETRIES: 3,
    // Retry delay in milliseconds
    RETRY_DELAY: 1000,
  },

  // Audit Configuration
  AUDIT: {
    // Enable audit logging
    ENABLED: true,
    // Log all admin actions
    LOG_ACTIONS: true,
    // Log data changes
    LOG_CHANGES: true,
    // Keep audit logs for (days)
    RETENTION_DAYS: 90,
  },

  // Cache Configuration
  CACHE: {
    // Enable query result caching
    ENABLED: true,
    // Default cache TTL in seconds
    DEFAULT_TTL: 300,
    // Admin list cache TTL
    ADMIN_LIST_TTL: 600,
    // Audit logs cache TTL
    AUDIT_LOGS_TTL: 60,
  },

  // Error Handling
  ERROR_HANDLING: {
    // Log database errors
    LOG_ERRORS: true,
    // Detailed error logging
    DETAILED_LOGGING: process.env.NODE_ENV === 'development',
  },
};

/**
 * Build PostgreSQL connection string
 */
export const getConnectionString = (): string => {
  const config = ADMIN_DB_CONFIG.CONNECTION;
  return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
};

/**
 * Get connection config
 */
export const getConnectionConfig = () => {
  const config = ADMIN_DB_CONFIG.CONNECTION;
  return {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl,
  };
};

/**
 * Verify database configuration
 */
export const verifyAdminDbConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const config = ADMIN_DB_CONFIG.CONNECTION;

  if (!config.host) {
    errors.push('Database host is not configured');
  }

  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push('Database port is invalid');
  }

  if (!config.database) {
    errors.push('Database name is not configured');
  }

  if (!config.username) {
    errors.push('Database username is not configured');
  }

  if (!config.password && process.env.NODE_ENV === 'production') {
    errors.push('Database password is required in production');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get environment variables for admin portal
 */
export const getRequiredEnvVars = () => {
  return [
    'REACT_APP_DB_HOST',
    'REACT_APP_DB_PORT',
    'REACT_APP_DB_NAME',
    'REACT_APP_DB_USER',
    'REACT_APP_DB_PASSWORD',
    'REACT_APP_API_URL',
  ];
};
