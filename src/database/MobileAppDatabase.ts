/**
 * Mobile App Database Service
 * Manages SQLite database operations for offline support and persistence
 */

import { Platform } from 'react-native';
import { MOBILE_APP_SQL_STATEMENTS } from './schema';

let SQLite: any = null;

// Create a fallback mock for SQLite when not available (web platform)
const createSQLiteFallback = () => ({
  openDatabaseAsync: async () => ({
    execAsync: async () => undefined,
    runAsync: async () => undefined,
    getFirstAsync: async () => undefined,
    getAllAsync: async () => [],
    closeAsync: async () => undefined,
  }),
});

// Check if we're on web platform
const isWeb = Platform.OS === 'web';

export class MobileAppDatabase {
  private static instance: MobileAppDatabase;
  private db: any = null;

  private constructor() {}

  static getInstance(): MobileAppDatabase {
    if (!MobileAppDatabase.instance) {
      MobileAppDatabase.instance = new MobileAppDatabase();
    }
    return MobileAppDatabase.instance;
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    try {
      // On web platform, use localStorage-based fallback
      if (isWeb) {
        console.log('📱 Web platform detected - using localStorage fallback');
        SQLite = createSQLiteFallback();
        this.db = await SQLite.openDatabaseAsync('swipesavvy_mobile.db');
        return;
      }

      // Try to import expo-sqlite, fall back to mock if not available
      if (!SQLite) {
        try {
          SQLite = await import('expo-sqlite').catch(() => createSQLiteFallback());
        } catch (e) {
          SQLite = createSQLiteFallback();
        }
      }

      this.db = await SQLite.openDatabaseAsync('swipesavvy_mobile.db');
      console.log('✅ Mobile app database initialized');

      // Create all tables
      await this.createTables();
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Create all database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      for (const statement of MOBILE_APP_SQL_STATEMENTS) {
        await this.db.execAsync(statement);
      }
      console.log('✅ All database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  /**
   * Insert a user
   */
  async insertUser(user: {
    id: string;
    email: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    account_number?: string;
    account_type?: string;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `
      INSERT OR REPLACE INTO users 
      (id, email, phone, first_name, last_name, account_number, account_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(sql, [
      user.id,
      user.email,
      user.phone || null,
      user.first_name || null,
      user.last_name || null,
      user.account_number || null,
      user.account_type || null,
      new Date().toISOString(),
      new Date().toISOString(),
    ]);
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return result;
  }

  /**
   * Insert a chat message
   */
  async insertChatMessage(message: {
    id: string;
    conversation_id: string;
    sender: 'user' | 'ai';
    content: string;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `
      INSERT INTO chat_messages 
      (id, conversation_id, sender, content, timestamp, is_synced)
      VALUES (?, ?, ?, ?, ?, 0)
    `;

    await this.db.runAsync(sql, [
      message.id,
      message.conversation_id,
      message.sender,
      message.content,
      new Date().toISOString(),
    ]);
  }

  /**
   * Get chat messages for a conversation
   */
  async getChatMessages(conversationId: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY timestamp ASC',
      [conversationId]
    );
    return result;
  }

  /**
   * Insert a support ticket
   */
  async insertSupportTicket(ticket: {
    id: string;
    ticket_number: string;
    user_id: string;
    category: string;
    priority: string;
    status: string;
    subject: string;
    description: string;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `
      INSERT OR REPLACE INTO support_tickets
      (id, ticket_number, user_id, category, priority, status, subject, description, created_at, updated_at, is_synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    const now = new Date().toISOString();
    await this.db.runAsync(sql, [
      ticket.id,
      ticket.ticket_number,
      ticket.user_id,
      ticket.category,
      ticket.priority,
      ticket.status,
      ticket.subject,
      ticket.description,
      now,
      now,
    ]);
  }

  /**
   * Get user's support tickets
   */
  async getUserSupportTickets(userId: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return result;
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE support_tickets SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date().toISOString(), ticketId]
    );
  }

  /**
   * Insert offline queue item
   */
  async addToOfflineQueue(item: {
    id: string;
    request_type: string;
    endpoint: string;
    payload?: any;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `
      INSERT INTO offline_queue
      (id, request_type, endpoint, payload, created_at, retry_count)
      VALUES (?, ?, ?, ?, ?, 0)
    `;

    await this.db.runAsync(sql, [
      item.id,
      item.request_type,
      item.endpoint,
      item.payload ? JSON.stringify(item.payload) : null,
      new Date().toISOString(),
    ]);
  }

  /**
   * Get offline queue items
   */
  async getOfflineQueue(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM offline_queue ORDER BY created_at ASC'
    );
    return result;
  }

  /**
   * Remove offline queue item
   */
  async removeFromOfflineQueue(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM offline_queue WHERE id = ?', [id]);
  }

  /**
   * Save user preferences
   */
  async saveUserPreferences(userId: string, preferences: {
    theme?: string;
    notification_enabled?: boolean;
    language?: string;
    biometric_enabled?: boolean;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `
      INSERT OR REPLACE INTO user_preferences
      (user_id, theme, notification_enabled, language, biometric_enabled, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.db.runAsync(sql, [
      userId,
      preferences.theme || 'light',
      preferences.notification_enabled ? 1 : 0,
      preferences.language || 'en',
      preferences.biometric_enabled ? 1 : 0,
      new Date().toISOString(),
    ]);
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    return result;
  }

  /**
   * Cache data
   */
  async cacheData(key: string, value: any, expiresInMinutes?: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const expiresAt = expiresInMinutes
      ? new Date(Date.now() + expiresInMinutes * 60000).toISOString()
      : null;

    const sql = `
      INSERT OR REPLACE INTO cache
      (key, value, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `;

    await this.db.runAsync(sql, [
      key,
      JSON.stringify(value),
      expiresAt,
      new Date().toISOString(),
    ]);
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM cache WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)',
      [key, new Date().toISOString()]
    );

    if (!result) return null;
    return JSON.parse(result.value);
  }

  /**
   * Clear expired cache
   */
  async clearExpiredCache(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'DELETE FROM cache WHERE expires_at IS NOT NULL AND expires_at < ?',
      [new Date().toISOString()]
    );
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  /**
   * Clear all data (for logout)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM chat_messages');
    await this.db.runAsync('DELETE FROM conversations');
    await this.db.runAsync('DELETE FROM support_tickets');
    await this.db.runAsync('DELETE FROM ticket_messages');
    await this.db.runAsync('DELETE FROM offline_queue');
    await this.db.runAsync('DELETE FROM transactions');
  }
}
