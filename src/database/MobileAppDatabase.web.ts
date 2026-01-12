/**
 * Mobile App Database Service - Web Version
 * Uses localStorage as a fallback for web platform
 */

import { MOBILE_APP_SQL_STATEMENTS } from './schema';

// Web-based storage using localStorage
class WebStorage {
  private prefix = 'swipesavvy_db_';

  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  async get(key: string): Promise<any> {
    const item = localStorage.getItem(this.prefix + key);
    return item ? JSON.parse(item) : null;
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async getAll(prefix: string): Promise<any[]> {
    const results: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix + prefix)) {
        const value = localStorage.getItem(key);
        if (value) results.push(JSON.parse(value));
      }
    }
    return results;
  }

  async clear(prefix?: string): Promise<void> {
    if (prefix) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix + prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } else {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }
}

export class MobileAppDatabase {
  private static instance: MobileAppDatabase;
  private storage = new WebStorage();

  private constructor() {}

  static getInstance(): MobileAppDatabase {
    if (!MobileAppDatabase.instance) {
      MobileAppDatabase.instance = new MobileAppDatabase();
    }
    return MobileAppDatabase.instance;
  }

  async initialize(): Promise<void> {
    console.log('📱 Web platform - using localStorage for data persistence');
  }

  async insertUser(user: {
    id: string;
    email: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    account_number?: string;
    account_type?: string;
  }): Promise<void> {
    await this.storage.set(`user_${user.id}`, {
      ...user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async getUser(userId: string): Promise<any> {
    return this.storage.get(`user_${userId}`);
  }

  async insertChatMessage(message: {
    id: string;
    conversation_id: string;
    sender: 'user' | 'ai';
    content: string;
  }): Promise<void> {
    await this.storage.set(`chat_${message.id}`, {
      ...message,
      timestamp: new Date().toISOString(),
      is_synced: false,
    });
  }

  async getChatMessages(conversationId: string): Promise<any[]> {
    const messages = await this.storage.getAll('chat_');
    return messages
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

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
    const now = new Date().toISOString();
    await this.storage.set(`ticket_${ticket.id}`, {
      ...ticket,
      created_at: now,
      updated_at: now,
      is_synced: false,
    });
  }

  async getUserSupportTickets(userId: string): Promise<any[]> {
    const tickets = await this.storage.getAll('ticket_');
    return tickets
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async updateTicketStatus(ticketId: string, status: string): Promise<void> {
    const ticket = await this.storage.get(`ticket_${ticketId}`);
    if (ticket) {
      ticket.status = status;
      ticket.updated_at = new Date().toISOString();
      await this.storage.set(`ticket_${ticketId}`, ticket);
    }
  }

  async addToOfflineQueue(item: {
    id: string;
    request_type: string;
    endpoint: string;
    payload?: any;
  }): Promise<void> {
    await this.storage.set(`queue_${item.id}`, {
      ...item,
      created_at: new Date().toISOString(),
      retry_count: 0,
    });
  }

  async getOfflineQueue(): Promise<any[]> {
    const items = await this.storage.getAll('queue_');
    return items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async removeFromOfflineQueue(id: string): Promise<void> {
    await this.storage.remove(`queue_${id}`);
  }

  async saveUserPreferences(userId: string, preferences: {
    theme?: string;
    notification_enabled?: boolean;
    language?: string;
    biometric_enabled?: boolean;
  }): Promise<void> {
    await this.storage.set(`prefs_${userId}`, {
      ...preferences,
      updated_at: new Date().toISOString(),
    });
  }

  async getUserPreferences(userId: string): Promise<any> {
    return this.storage.get(`prefs_${userId}`);
  }

  async cacheData(key: string, value: any, expiresInMinutes?: number): Promise<void> {
    const expiresAt = expiresInMinutes
      ? new Date(Date.now() + expiresInMinutes * 60000).toISOString()
      : null;

    await this.storage.set(`cache_${key}`, {
      value,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    });
  }

  async getCachedData(key: string): Promise<any> {
    const cached = await this.storage.get(`cache_${key}`);
    if (!cached) return null;

    if (cached.expires_at && new Date(cached.expires_at) < new Date()) {
      await this.storage.remove(`cache_${key}`);
      return null;
    }

    return cached.value;
  }

  async clearExpiredCache(): Promise<void> {
    const items = await this.storage.getAll('cache_');
    const now = new Date();

    for (const item of items) {
      if (item.expires_at && new Date(item.expires_at) < now) {
        // Find and remove by key
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes('cache_')) {
            const value = localStorage.getItem(key);
            if (value) {
              const parsed = JSON.parse(value);
              if (parsed.expires_at === item.expires_at) {
                localStorage.removeItem(key);
                break;
              }
            }
          }
        }
      }
    }
  }

  async close(): Promise<void> {
    // No-op for web
  }

  async clearAllData(): Promise<void> {
    await this.storage.clear('chat_');
    await this.storage.clear('ticket_');
    await this.storage.clear('queue_');
    await this.storage.clear('cache_');
  }
}
