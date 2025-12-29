/**
 * Mobile App SQLite Database Schema
 * Local storage for offline support and data persistence
 */

export const MOBILE_APP_SCHEMA = {
  version: 1,
  tables: {
    // User & Auth
    users: {
      name: 'users',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY' },
        { name: 'email', type: 'TEXT UNIQUE NOT NULL' },
        { name: 'phone', type: 'TEXT' },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'account_number', type: 'TEXT' },
        { name: 'account_type', type: 'TEXT' },
        { name: 'kyc_verified', type: 'INTEGER DEFAULT 0' },
        { name: 'created_at', type: 'TEXT' },
        { name: 'updated_at', type: 'TEXT' },
      ],
    },
    // Chat & Conversations
    conversations: {
      name: 'conversations',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY' },
        { name: 'user_id', type: 'TEXT NOT NULL' },
        { name: 'session_id', type: 'TEXT' },
        { name: 'title', type: 'TEXT' },
        { name: 'last_message', type: 'TEXT' },
        { name: 'last_message_at', type: 'TEXT' },
        { name: 'created_at', type: 'TEXT' },
      ],
    },
    chat_messages: {
      name: 'chat_messages',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY' },
        { name: 'conversation_id', type: 'TEXT NOT NULL' },
        { name: 'sender', type: 'TEXT' }, // 'user' or 'ai'
        { name: 'content', type: 'TEXT NOT NULL' },
        { name: 'timestamp', type: 'TEXT' },
        { name: 'is_synced', type: 'INTEGER DEFAULT 0' },
      ],
    },
    // Support Tickets (Local Cache)
    support_tickets: {
      name: 'support_tickets',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY' },
        { name: 'ticket_number', type: 'TEXT UNIQUE' },
        { name: 'user_id', type: 'TEXT NOT NULL' },
        { name: 'category', type: 'TEXT' },
        { name: 'priority', type: 'TEXT' },
        { name: 'status', type: 'TEXT' },
        { name: 'subject', type: 'TEXT' },
        { name: 'description', type: 'TEXT' },
        { name: 'created_at', type: 'TEXT' },
        { name: 'updated_at', type: 'TEXT' },
        { name: 'is_synced', type: 'INTEGER DEFAULT 0' },
      ],
    },
    ticket_messages: {
      name: 'ticket_messages',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY' },
        { name: 'ticket_id', type: 'TEXT NOT NULL' },
        { name: 'sender_id', type: 'TEXT' },
        { name: 'sender_type', type: 'TEXT' },
        { name: 'message_text', type: 'TEXT NOT NULL' },
        { name: 'created_at', type: 'TEXT' },
        { name: 'is_synced', type: 'INTEGER DEFAULT 0' },
      ],
    },
    // Offline Queue
    offline_queue: {
      name: 'offline_queue',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY' },
        { name: 'request_type', type: 'TEXT NOT NULL' },
        { name: 'endpoint', type: 'TEXT NOT NULL' },
        { name: 'payload', type: 'TEXT' }, // JSON stringified
        { name: 'created_at', type: 'TEXT' },
        { name: 'retry_count', type: 'INTEGER DEFAULT 0' },
      ],
    },
    // Cache
    cache: {
      name: 'cache',
      columns: [
        { name: 'key', type: 'TEXT PRIMARY KEY' },
        { name: 'value', type: 'TEXT NOT NULL' },
        { name: 'expires_at', type: 'TEXT' },
        { name: 'created_at', type: 'TEXT' },
      ],
    },
    // Transactions
    transactions: {
      name: 'transactions',
      columns: [
        { name: 'id', type: 'TEXT PRIMARY KEY' },
        { name: 'user_id', type: 'TEXT NOT NULL' },
        { name: 'type', type: 'TEXT' },
        { name: 'amount', type: 'REAL' },
        { name: 'currency', type: 'TEXT' },
        { name: 'status', type: 'TEXT' },
        { name: 'description', type: 'TEXT' },
        { name: 'created_at', type: 'TEXT' },
        { name: 'is_synced', type: 'INTEGER DEFAULT 0' },
      ],
    },
    // Settings & Preferences
    user_preferences: {
      name: 'user_preferences',
      columns: [
        { name: 'user_id', type: 'TEXT PRIMARY KEY' },
        { name: 'theme', type: 'TEXT' }, // 'light' or 'dark'
        { name: 'notification_enabled', type: 'INTEGER DEFAULT 1' },
        { name: 'language', type: 'TEXT DEFAULT "en"' },
        { name: 'biometric_enabled', type: 'INTEGER DEFAULT 0' },
        { name: 'updated_at', type: 'TEXT' },
      ],
    },
  },
};

/**
 * SQL creation statements for mobile app
 */
export const MOBILE_APP_SQL_STATEMENTS = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    account_number TEXT,
    account_type TEXT,
    kyc_verified INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  )`,

  // Conversations table
  `CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT,
    title TEXT,
    last_message TEXT,
    last_message_at TEXT,
    created_at TEXT
  )`,

  // Chat messages table
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender TEXT,
    content TEXT NOT NULL,
    timestamp TEXT,
    is_synced INTEGER DEFAULT 0
  )`,

  // Support tickets table
  `CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE,
    user_id TEXT NOT NULL,
    category TEXT,
    priority TEXT,
    status TEXT,
    subject TEXT,
    description TEXT,
    created_at TEXT,
    updated_at TEXT,
    is_synced INTEGER DEFAULT 0
  )`,

  // Ticket messages table
  `CREATE TABLE IF NOT EXISTS ticket_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    sender_id TEXT,
    sender_type TEXT,
    message_text TEXT NOT NULL,
    created_at TEXT,
    is_synced INTEGER DEFAULT 0
  )`,

  // Offline queue table
  `CREATE TABLE IF NOT EXISTS offline_queue (
    id TEXT PRIMARY KEY,
    request_type TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    payload TEXT,
    created_at TEXT,
    retry_count INTEGER DEFAULT 0
  )`,

  // Cache table
  `CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    expires_at TEXT,
    created_at TEXT
  )`,

  // Transactions table
  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT,
    amount REAL,
    currency TEXT,
    status TEXT,
    description TEXT,
    created_at TEXT,
    is_synced INTEGER DEFAULT 0
  )`,

  // User preferences table
  `CREATE TABLE IF NOT EXISTS user_preferences (
    user_id TEXT PRIMARY KEY,
    theme TEXT,
    notification_enabled INTEGER DEFAULT 1,
    language TEXT DEFAULT 'en',
    biometric_enabled INTEGER DEFAULT 0,
    updated_at TEXT
  )`,

  // Create indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)`,
  `CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id)`,
  `CREATE INDEX IF NOT EXISTS idx_offline_queue_created_at ON offline_queue(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`,
];
