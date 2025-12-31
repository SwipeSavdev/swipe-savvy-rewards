/**
 * Mobile App Database Initialization
 * Sets up SQLite database on app startup with proper error handling
 */

import { MobileAppDatabase } from './MobileAppDatabase';
import { MOBILE_DB_CONFIG, verifyDatabaseConfig } from './config';

export class DatabaseInitializer {
  private static instance: DatabaseInitializer;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseInitializer {
    if (!DatabaseInitializer.instance) {
      DatabaseInitializer.instance = new DatabaseInitializer();
    }
    return DatabaseInitializer.instance;
  }

  /**
   * Initialize database on app startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Database already initialized');
      return;
    }

    try {
      // Verify configuration
      const configCheck = verifyDatabaseConfig();
      if (!configCheck.valid) {
        throw new Error(
          `Database configuration invalid: ${configCheck.errors.join(', ')}`
        );
      }

      console.log('🔧 Initializing mobile app database...');
      console.log(`📦 Database: ${MOBILE_DB_CONFIG.DATABASE_NAME}`);
      console.log(`📋 Tables: ${Object.keys(MOBILE_DB_CONFIG.SYNC_TABLES).length + Object.keys(MOBILE_DB_CONFIG.LOCAL_ONLY_TABLES).length}`);

      // Initialize SQLite database
      const db = MobileAppDatabase.getInstance();
      await db.initialize();

      this.isInitialized = true;

      console.log('✅ Mobile app database initialized successfully');
      console.log('🚀 Ready for app usage');

      return;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get database instance
   */
  getDatabase(): MobileAppDatabase {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return MobileAppDatabase.getInstance();
  }

  /**
   * Check initialization status
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset database (for logout/cleanup)
   */
  async reset(): Promise<void> {
    try {
      console.log('🔄 Resetting database...');
      const db = MobileAppDatabase.getInstance();
      await db.clearAllData();
      console.log('✅ Database reset complete');
    } catch (error) {
      console.error('❌ Error resetting database:', error);
      throw error;
    }
  }

  /**
   * Cleanup and close database
   */
  async cleanup(): Promise<void> {
    try {
      const db = MobileAppDatabase.getInstance();
      await db.close();
      this.isInitialized = false;
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }
}
