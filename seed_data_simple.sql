-- SwipeSavvy Demo Data Seed Script - SIMPLIFIED
-- Populates databases with sample data

-- ============================================
-- swipesavvy_dev Database - Seed Data
-- ============================================

-- Insert Admin Users (email is unique)
INSERT INTO admin_users (email, password_hash, full_name, role, department, permissions, status) 
VALUES
('admin@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Admin User', 'admin', 'Executive', ARRAY['all'], 'active'),
('support@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Support Manager', 'support_manager', 'Support', ARRAY['view_users', 'view_support'], 'active'),
('finance@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Finance Officer', 'admin', 'Finance', ARRAY['view_merchants', 'view_reports'], 'active'),
('ops@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Operations Lead', 'admin', 'Operations', ARRAY['view_all'], 'active'),
('analyst@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Data Analyst', 'analyst', 'Analytics', ARRAY['view_reports'], 'active')
ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Insert Regular Users
INSERT INTO users (email, password_hash, name, status, role) 
VALUES
('john.doe@example.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'John Doe', 'active', 'user'),
('jane.smith@example.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Jane Smith', 'active', 'user'),
('merchant1@business.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Mike Johnson', 'active', 'merchant'),
('merchant2@business.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Sarah Williams', 'active', 'merchant'),
('support.agent@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Support Agent', 'active', 'support'),
('customer@gmail.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Alice Brown', 'active', 'user')
ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Insert Merchants
INSERT INTO merchants (name, email, phone, website, country, location, business_type, status, monthly_volume, transaction_count, success_rate, join_date) 
VALUES
('TechHub Solutions', 'contact@techhub.com', '+1-555-0101', 'https://techhub.com', 'USA', 'San Francisco', 'technology', 'active', 150000.00, 5200, 98.50, NOW() - INTERVAL '180 days'),
('FreshMart Grocery', 'info@freshmart.com', '+1-555-0102', 'https://freshmart.com', 'USA', 'New York', 'retail', 'active', 85000.00, 3100, 99.20, NOW() - INTERVAL '365 days'),
('Digital Marketing Pro', 'hello@digpronet.com', '+1-555-0103', 'https://digpro.net', 'USA', 'Los Angeles', 'services', 'active', 120000.00, 4500, 97.80, NOW() - INTERVAL '90 days'),
('Fashion Forward Boutique', 'sales@fashionforward.com', '+1-555-0104', 'https://fashionforward.com', 'USA', 'Miami', 'retail', 'active', 95000.00, 3800, 99.10, NOW() - INTERVAL '240 days')
ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Insert Support Tickets
INSERT INTO support_tickets (subject, description, customer_name, customer_email, status, priority, assigned_to, category, resolution_notes)
VALUES
('Payment Processing Issue', 'Unable to process payment on mobile app', 'John Doe', 'john@example.com', 'open', 'high', (SELECT id FROM admin_users WHERE email = 'support@swipesavvy.com' LIMIT 1), 'general', NULL),
('Account Verification Failed', 'Verification email not received', 'Jane Smith', 'jane@example.com', 'open', 'medium', (SELECT id FROM admin_users WHERE email = 'support@swipesavvy.com' LIMIT 1), 'general', NULL),
('Refund Request', 'Need to request refund for order', 'Mike Johnson', 'mike@example.com', 'in_progress', 'medium', (SELECT id FROM admin_users WHERE email = 'support@swipesavvy.com' LIMIT 1), 'general', NULL),
('Feature Request', 'Dark mode in app', 'Sarah Williams', 'sarah@example.com', 'closed', 'low', (SELECT id FROM admin_users WHERE email = 'analyst@swipesavvy.com' LIMIT 1), 'general', 'Forwarded to product team'),
('API Integration Error', 'Getting 401 errors from API', 'Alice Brown', 'alice@example.com', 'open', 'high', (SELECT id FROM admin_users WHERE email = 'ops@swipesavvy.com' LIMIT 1), 'general', NULL);

-- Insert Feature Flags
INSERT INTO feature_flags (name, display_name, description, enabled, rollout_percentage, environment, targeted_users)
VALUES
('dark_mode', 'Dark Mode', 'Enable dark mode UI theme', true, 100, 'production', ARRAY[]::text[]),
('new_dashboard', 'New Dashboard', 'New dashboard design', true, 50, 'production', ARRAY['admin@swipesavvy.com']),
('ai_recommendations', 'AI Recommendations', 'AI-powered recommendations', true, 25, 'production', ARRAY[]::text[]),
('payment_retries', 'Payment Retries', 'Automatic payment retry', true, 100, 'production', ARRAY[]::text[]),
('advanced_filters', 'Advanced Filters', 'Advanced filtering options', true, 40, 'production', ARRAY['support@swipesavvy.com'])
ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Insert AI Campaigns
INSERT INTO ai_campaigns (name, type, status, description, budget, spent, roi, conversions, engagement, audience_size, start_date, end_date)
VALUES
('Summer Sale 2025', 'email', 'active', 'Summer promotional campaign', 50000.00, 32500.00, 145.50, 2850, 8.50, 125000, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),
('Q1 Growth Initiative', 'email', 'active', 'Q1 merchant acquisition', 75000.00, 68000.00, 165.20, 1240, 12.30, 250000, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days'),
('Flash Deal Blitz', 'email', 'active', 'Weekend flash deals', 30000.00, 29500.00, 198.50, 3200, 15.20, 80000, NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days')
ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Insert Settings (only valid data types)
INSERT INTO settings (category, key, value, data_type, description)
VALUES
('general', 'app_name', 'SwipeSavvy', 'string', 'Application display name'),
('general', 'app_version', '1.2.0', 'string', 'Current app version'),
('general', 'support_email', 'support@swipesavvy.com', 'string', 'Support email'),
('billing', 'transaction_fee_percent', '2.9', 'string', 'Transaction fee percentage'),
('security', 'session_timeout_minutes', '30', 'string', 'Session timeout'),
('api', 'rate_limit_requests', '1000', 'string', 'API rate limit');

-- Insert Audit Logs (without null user_id)
INSERT INTO audit_logs (action, action_type, resource_type, resource_id, user_id, user_email, status, error_message, changes)
VALUES
('User created', 'create', 'users', (SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), (SELECT id FROM admin_users WHERE email = 'admin@swipesavvy.com' LIMIT 1), 'admin@swipesavvy.com', 'success', NULL, '{"email": "john@example.com"}'::jsonb),
('Merchant onboarded', 'create', 'merchants', (SELECT id FROM merchants WHERE email = 'contact@techhub.com' LIMIT 1), (SELECT id FROM admin_users WHERE email = 'ops@swipesavvy.com' LIMIT 1), 'ops@swipesavvy.com', 'success', NULL, '{"name": "TechHub"}'::jsonb),
('Feature flag enabled', 'update', 'feature_flags', (SELECT id FROM feature_flags WHERE name = 'dark_mode' LIMIT 1), (SELECT id FROM admin_users WHERE email = 'admin@swipesavvy.com' LIMIT 1), 'admin@swipesavvy.com', 'success', NULL, '{"enabled": true}'::jsonb),
('Support ticket updated', 'update', 'support_tickets', (SELECT id FROM support_tickets LIMIT 1), (SELECT id FROM admin_users WHERE email = 'support@swipesavvy.com' LIMIT 1), 'support@swipesavvy.com', 'success', NULL, '{"status": "open"}'::jsonb),
('Settings updated', 'update', 'settings', NULL, (SELECT id FROM admin_users WHERE email = 'admin@swipesavvy.com' LIMIT 1), 'admin@swipesavvy.com', 'success', NULL, '{"key": "app_version"}'::jsonb);

-- ============================================
-- swipesavvy_wallet Database - Seed Data
-- ============================================

-- Insert Wallets (unique per user_id)
INSERT INTO wallets (user_id, balance, currency, status)
VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 2500.75, 'USD', 'active'),
((SELECT id FROM users WHERE email = 'jane.smith@example.com' LIMIT 1), 1850.50, 'USD', 'active'),
((SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1), 45230.00, 'USD', 'active'),
((SELECT id FROM users WHERE email = 'merchant2@business.com' LIMIT 1), 32150.75, 'USD', 'active'),
((SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1), 500.00, 'USD', 'active')
ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance;

-- Insert Wallet Transactions
INSERT INTO wallet_transactions (user_id, transaction_type, amount, currency, status, description, reference_number)
VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 'transfer', 500.00, 'USD', 'completed', 'Initial funding', 'DEP-001'),
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 'transfer', 125.50, 'USD', 'completed', 'Payment to merchant', 'TXN-12345'),
((SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1), 'transfer', 2500.00, 'USD', 'completed', 'Received payment', 'TXN-12346'),
((SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1), 'transfer', 50.00, 'USD', 'completed', 'Payment to merchant', 'TXN-12347');

-- Insert Payment Methods
INSERT INTO payment_methods (user_id, type, token, last_four, expiry_date, is_default, status)
VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 'card', 'tok_visa_1234', '4242', '2026-12-31', true, 'active'),
((SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1), 'card', 'tok_visa_5555', '5555', '2027-03-31', true, 'active'),
((SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1), 'card', 'tok_visa_0000', '4111', '2025-09-30', true, 'active');
