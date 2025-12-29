// ============================================================================
// Backend Database Configuration
// Located: backend/config/database.ts (or database.py for Python)
// This file handles all database connections and pooling
// ============================================================================

import { Pool, PoolClient } from 'pg';

// ============================================================================
// CONNECTION CONFIGURATION
// ============================================================================

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  poolSize: number;
  idleTimeoutMillis: number;
  maxLifetimeMillis: number;
  connectionTimeoutMillis: number;
  reapIntervalMillis: number;
  keepAlives: boolean;
  keepAlivesIdleTimeoutMillis: number;
}

// Load configuration from environment variables
const getDatabaseConfig = (environment: string = 'development'): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'swipesavvy_db',
    user: process.env.DB_USER || 'swipesavvy_backend',
    password: process.env.DB_PASSWORD || 'secure_password_123',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    maxLifetimeMillis: parseInt(process.env.DB_MAX_LIFETIME || '1800000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
    reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000', 10),
    keepAlives: process.env.DB_KEEP_ALIVES !== 'false',
    keepAlivesIdleTimeoutMillis: parseInt(process.env.DB_KEEP_ALIVES_IDLE_TIMEOUT || '30000', 10),
  };
};

// ============================================================================
// CONNECTION POOL
// ============================================================================

class DatabasePool {
  private pool: Pool | null = null;
  private readonly config: DatabaseConfig;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 5;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Initialize the connection pool
   */
  async initialize(): Promise<void> {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        max: this.config.poolSize,
        idleTimeoutMillis: this.config.idleTimeoutMillis,
        maxLifetimeMillis: this.config.maxLifetimeMillis,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis,
        reapIntervalMillis: this.config.reapIntervalMillis,
        keepAlives: this.config.keepAlives,
        keepAlivesIdleTimeoutMillis: this.config.keepAlivesIdleTimeoutMillis,
      });

      // Test the connection
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();

      console.log('✓ Database connection pool initialized');
      console.log(`  Host: ${this.config.host}:${this.config.port}`);
      console.log(`  Database: ${this.config.database}`);
      console.log(`  Pool Size: ${this.config.poolSize}`);
      console.log(`  Server Time: ${result.rows[0].now}`);

      this.connectionAttempts = 0;
    } catch (error) {
      this.connectionAttempts++;
      console.error('✗ Failed to initialize database connection pool:', error);

      if (this.connectionAttempts < this.maxConnectionAttempts) {
        console.log(`Retrying in 5 seconds... (${this.connectionAttempts}/${this.maxConnectionAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.initialize();
      }

      throw new Error('Failed to connect to database after multiple attempts');
    }
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.connect();
  }

  /**
   * Execute a query
   */
  async query(text: string, values?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.query(text, values);
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('✓ Database connection pool closed');
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): { idle: number; waiting: number; idleCount: number } {
    if (!this.pool) {
      return { idle: 0, waiting: 0, idleCount: 0 };
    }
    return {
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      idleCount: this.pool.totalCount,
    };
  }
}

// ============================================================================
// READ-ONLY CONNECTION POOL
// ============================================================================

class ReadOnlyDatabasePool extends DatabasePool {
  constructor(config: DatabaseConfig) {
    super(config);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

let mainPool: DatabasePool | null = null;
let readOnlyPool: ReadOnlyDatabasePool | null = null;

export async function initializeDatabaseConnection(environment: string = 'development'): Promise<void> {
  const config = getDatabaseConfig(environment);
  mainPool = new DatabasePool(config);
  await mainPool.initialize();

  // Initialize read-only pool if different credentials provided
  if (process.env.DB_READ_USER) {
    const readOnlyConfig: DatabaseConfig = {
      ...config,
      user: process.env.DB_READ_USER,
      password: process.env.DB_READ_PASSWORD || config.password,
    };
    readOnlyPool = new ReadOnlyDatabasePool(readOnlyConfig);
    await readOnlyPool.initialize();
  }
}

export function getMainPool(): DatabasePool {
  if (!mainPool) {
    throw new Error('Database pool not initialized. Call initializeDatabaseConnection() first.');
  }
  return mainPool;
}

export function getReadOnlyPool(): DatabasePool {
  return readOnlyPool || getMainPool();
}

export async function closeDatabaseConnection(): Promise<void> {
  if (mainPool) {
    await mainPool.close();
    mainPool = null;
  }
  if (readOnlyPool) {
    await readOnlyPool.close();
    readOnlyPool = null;
  }
}

export async function query(text: string, values?: any[]): Promise<any> {
  return getMainPool().query(text, values);
}

export async function readQuery(text: string, values?: any[]): Promise<any> {
  return getReadOnlyPool().query(text, values);
}

export { DatabaseConfig, DatabasePool, ReadOnlyDatabasePool };
