/**
 * Admin Portal Database Service
 * Manages PostgreSQL connection to swipesavvy_admin database
 */
import { Pool } from 'pg';
import { getConnectionConfig, ADMIN_DB_CONFIG, verifyAdminDbConfig, } from './database';
export class AdminDatabaseService {
    constructor() {
        Object.defineProperty(this, "pool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isConnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    static getInstance() {
        if (!AdminDatabaseService.instance) {
            AdminDatabaseService.instance = new AdminDatabaseService();
        }
        return AdminDatabaseService.instance;
    }
    /**
     * Initialize database connection pool
     */
    async initialize() {
        try {
            // Verify configuration
            const configCheck = verifyAdminDbConfig();
            if (!configCheck.valid) {
                throw new Error(`Database configuration invalid: ${configCheck.errors.join(', ')}`);
            }
            console.log('🔧 Initializing admin portal database connection...');
            const connectionConfig = getConnectionConfig();
            // Create connection pool
            this.pool = new Pool({
                ...connectionConfig,
                ...ADMIN_DB_CONFIG.POOL,
            });
            // Test connection
            const client = await this.pool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();
            this.isConnected = true;
            console.log('✅ Admin portal database connected successfully');
            console.log(`📊 Connection: ${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`);
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }
    /**
     * Execute query
     */
    async query(text, values) {
        if (!this.pool || !this.isConnected) {
            throw new Error('Database not connected');
        }
        try {
            return await this.pool.query(text, values);
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
    /**
     * Get admin users
     */
    async getAdminUsers() {
        const result = await this.query(`SELECT id, email, first_name, last_name, role, is_active, last_login, created_at
       FROM admin_users
       ORDER BY created_at DESC`);
        return result.rows;
    }
    /**
     * Get admin user by ID
     */
    async getAdminUserById(userId) {
        const result = await this.query(`SELECT id, email, first_name, last_name, role, permissions, is_active, last_login, created_at, updated_at
       FROM admin_users
       WHERE id = $1`, [userId]);
        return result.rows[0] || null;
    }
    /**
     * Get admin user by email
     */
    async getAdminUserByEmail(email) {
        const result = await this.query(`SELECT id, email, first_name, last_name, role, password_hash, permissions, is_active, created_at
       FROM admin_users
       WHERE email = $1`, [email]);
        return result.rows[0] || null;
    }
    /**
     * Create admin user
     */
    async createAdminUser(adminData) {
        const result = await this.query(`INSERT INTO admin_users (email, password_hash, first_name, last_name, role, permissions, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, first_name, last_name, role, created_at`, [
            adminData.email,
            adminData.password_hash,
            adminData.first_name,
            adminData.last_name,
            adminData.role,
            adminData.permissions || {},
        ]);
        return result.rows[0];
    }
    /**
     * Update last login
     */
    async updateLastLogin(userId) {
        await this.query(`UPDATE admin_users SET last_login = NOW() WHERE id = $1`, [userId]);
    }
    /**
     * Log audit action
     */
    async logAuditAction(auditData) {
        if (!ADMIN_DB_CONFIG.AUDIT.ENABLED) {
            return;
        }
        await this.query(`INSERT INTO admin_audit_logs (admin_id, action, resource_type, resource_id, changes, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`, [
            auditData.admin_id,
            auditData.action,
            auditData.resource_type,
            auditData.resource_id || null,
            auditData.changes ? JSON.stringify(auditData.changes) : null,
            auditData.ip_address || null,
        ]);
    }
    /**
     * Get audit logs
     */
    async getAuditLogs(filters) {
        let query = `SELECT * FROM admin_audit_logs`;
        const params = [];
        if (filters?.adminId) {
            query += ` WHERE admin_id = $1`;
            params.push(filters.adminId);
        }
        query += ` ORDER BY created_at DESC`;
        if (filters?.limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(filters.limit);
        }
        const result = await this.query(query, params);
        return result.rows;
    }
    /**
     * Get system settings
     */
    async getSystemSettings() {
        const result = await this.query(`SELECT setting_key, setting_value FROM system_settings`);
        const settings = {};
        result.rows.forEach((row) => {
            settings[row.setting_key] = row.setting_value;
        });
        return settings;
    }
    /**
     * Update system setting
     */
    async updateSystemSetting(key, value, adminId) {
        await this.query(`INSERT INTO system_settings (setting_key, setting_value, updated_by, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_by = $3, updated_at = NOW()`, [key, JSON.stringify(value), adminId]);
    }
    /**
     * Get dashboard metrics
     */
    async getDashboardMetrics(date) {
        const result = await this.query(`SELECT * FROM dashboard_metrics WHERE date = COALESCE($1::date, CURRENT_DATE)`, [date]);
        return result.rows[0] || null;
    }
    /**
     * Get admin activity summary
     */
    async getAdminActivitySummary() {
        const result = await this.query(`SELECT * FROM admin_activity_summary ORDER BY last_action_at DESC`);
        return result.rows;
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const result = await this.query('SELECT NOW()');
            return !!result.rows[0];
        }
        catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
    /**
     * Close connection pool
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            this.isConnected = false;
            console.log('✅ Database connection closed');
        }
    }
    /**
     * Get connection status
     */
    isConnectionActive() {
        return this.isConnected;
    }
}
