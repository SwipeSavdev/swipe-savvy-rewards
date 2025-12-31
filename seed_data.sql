-- SwipeSavvy Demo Data Seed Script
-- Populates all three databases with sample data

-- ============================================
-- swipesavvy_dev Database - Seed Data
-- ============================================

-- Insert Admin Users
INSERT INTO admin_users (email, password_hash, full_name, role, department, permissions, status) VALUES
('admin@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Admin User', 'admin', 'Executive', ARRAY['all'], 'active'),
('support@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Support Manager', 'support_manager', 'Support', ARRAY['view_users', 'view_support', 'view_reports'], 'active'),
('finance@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Finance Officer', 'admin', 'Finance', ARRAY['view_merchants', 'view_transactions', 'view_reports'], 'active'),
('ops@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Operations Lead', 'admin', 'Operations', ARRAY['view_all', 'manage_systems'], 'active'),
('analyst@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Data Analyst', 'analyst', 'Analytics', ARRAY['view_reports', 'view_analytics'], 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert Regular Users
INSERT INTO users (email, password_hash, name, status, role) VALUES
('john.doe@example.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'John Doe', 'active', 'user'),
('jane.smith@example.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Jane Smith', 'active', 'user'),
('merchant1@business.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Mike Johnson', 'active', 'merchant'),
('merchant2@business.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Sarah Williams', 'active', 'merchant'),
('support.agent@swipesavvy.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Support Agent', 'active', 'support'),
('customer@gmail.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Alice Brown', 'active', 'user'),
('inactive.user@example.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Bob Martin', 'inactive', 'user'),
('suspended@example.com', '$2b$12$5YhkPOEBvDBWP2EPw3Nt7.5K8Z5M6nPd9sKw8qKf9vVzJ7Q4GhMfa', 'Charlie Brown', 'suspended', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert Merchants
INSERT INTO merchants (name, email, phone, website, country, location, business_type, status, monthly_volume, transaction_count, success_rate, join_date) VALUES
('TechHub Solutions', 'contact@techhub.com', '+1-555-0101', 'https://techhub.com', 'USA', 'San Francisco', 'technology', 'active', 150000.00, 5200, 98.50, NOW() - INTERVAL '180 days'),
('FreshMart Grocery', 'info@freshmart.com', '+1-555-0102', 'https://freshmart.com', 'USA', 'New York', 'retail', 'active', 85000.00, 3100, 99.20, NOW() - INTERVAL '365 days'),
('Digital Marketing Pro', 'hello@digpronet.com', '+1-555-0103', 'https://digpro.net', 'USA', 'Los Angeles', 'services', 'active', 120000.00, 4500, 97.80, NOW() - INTERVAL '90 days'),
('Fashion Forward Boutique', 'sales@fashionforward.com', '+1-555-0104', 'https://fashionforward.com', 'USA', 'Miami', 'retail', 'active', 95000.00, 3800, 99.10, NOW() - INTERVAL '240 days'),
('Cloud Consulting Inc', 'business@cloudconsult.com', '+1-555-0105', 'https://cloudconsult.com', 'USA', 'Seattle', 'services', 'suspended', 50000.00, 1200, 96.50, NOW() - INTERVAL '120 days')
ON CONFLICT (email) DO NOTHING;

-- Insert Support Tickets
INSERT INTO support_tickets (subject, description, customer_name, customer_email, status, priority, assigned_to, category, resolution_notes) VALUES
('Payment Processing Issue', 'Unable to process payment on mobile app', 'John Doe', 'john@example.com', 'open', 'high', (SELECT id FROM admin_users WHERE email = 'support@swipesavvy.com' LIMIT 1), 'general', NULL),
('Account Verification Failed', 'Verification email not received', 'Jane Smith', 'jane@example.com', 'open', 'medium', (SELECT id FROM admin_users WHERE email = 'support@swipesavvy.com' LIMIT 1), 'general', NULL),
('Refund Request', 'Need to request refund for order #12345', 'Mike Johnson', 'mike@example.com', 'in_progress', 'medium', (SELECT id FROM admin_users WHERE email = 'support@swipesavvy.com' LIMIT 1), 'general', NULL),
('Feature Request - Dark Mode', 'Would like to see dark mode in the app', 'Sarah Williams', 'sarah@example.com', 'closed', 'low', (SELECT id FROM admin_users WHERE email = 'analyst@swipesavvy.com' LIMIT 1), 'general', 'Forwarded to product team'),
('API Integration Error', 'Getting 401 errors when calling merchant API', 'Alice Brown', 'alice@example.com', 'open', 'high', (SELECT id FROM admin_users WHERE email = 'ops@swipesavvy.com' LIMIT 1), 'general', NULL),
('Billing Discrepancy', 'Monthly bill seems higher than expected', 'Bob Martin', 'bob@example.com', 'closed', 'medium', (SELECT id FROM admin_users WHERE email = 'finance@swipesavvy.com' LIMIT 1), 'general', 'Resolved - billing corrected'),
('Performance Complaint', 'App is running slowly on iOS', 'Charlie Brown', 'charlie@example.com', 'in_progress', 'high', (SELECT id FROM admin_users WHERE email = 'support@swipesavvy.com' LIMIT 1), 'general', NULL),
('Merchant Onboarding', 'Help with merchant verification process', 'David Lee', 'david@example.com', 'open', 'medium', (SELECT id FROM admin_users WHERE email = 'ops@swipesavvy.com' LIMIT 1), 'general', NULL),
('Security Concern', 'Suspicious activity on my account', 'Eva Rodriguez', 'eva@example.com', 'in_progress', 'medium', (SELECT id FROM admin_users WHERE email = 'admin@swipesavvy.com' LIMIT 1), 'general', NULL),
('Withdrawal Issue', 'Cannot withdraw funds from wallet', 'Frank Wilson', 'frank@example.com', 'open', 'high', (SELECT id FROM admin_users WHERE email = 'finance@swipesavvy.com' LIMIT 1), 'general', NULL)
ON CONFLICT DO NOTHING;

-- Insert Feature Flags
INSERT INTO feature_flags (name, display_name, description, enabled, rollout_percentage, environment, targeted_users) VALUES
('dark_mode', 'Dark Mode', 'Enable dark mode UI theme', true, 100, 'production', ARRAY[]::text[]),
('new_dashboard', 'New Dashboard', 'New dashboard design', true, 50, 'production', ARRAY['admin@swipesavvy.com']),
('ai_recommendations', 'AI Recommendations', 'AI-powered merchant recommendations', true, 25, 'production', ARRAY[]::text[]),
('payment_retries', 'Payment Retries', 'Automatic payment retry mechanism', true, 100, 'production', ARRAY[]::text[]),
('beta_analytics', 'Beta Analytics', 'Beta analytics features', false, 0, 'development', ARRAY[]::text[]),
('webhook_v2', 'Webhook V2', 'Webhook API v2', true, 75, 'production', ARRAY[]::text[]),
('advanced_filters', 'Advanced Filters', 'Advanced filtering options', true, 40, 'production', ARRAY['support@swipesavvy.com']),
('instant_settlement', 'Instant Settlement', 'Instant settlement for merchants', false, 0, 'development', ARRAY[]::text[])
ON CONFLICT (name) DO NOTHING;

-- Insert AI Campaigns
INSERT INTO ai_campaigns (name, type, status, description, budget, spent, roi, conversions, engagement, audience_size, start_date, end_date) VALUES
('Summer Sale 2025', 'email', 'active', 'Summer promotional campaign targeting retail merchants', 50000.00, 32500.00, 145.50, 2850, 8.50, 125000, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),
('Q1 Growth Initiative', 'email', 'active', 'Q1 merchant acquisition campaign', 75000.00, 68000.00, 165.20, 1240, 12.30, 250000, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days'),
('Flash Deal Blitz', 'email', 'active', 'Weekend flash deals promotion', 30000.00, 29500.00, 198.50, 3200, 15.20, 80000, NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days'),
('AI Feature Launch', 'email', 'active', 'Launch campaign for new AI features', 60000.00, 45000.00, 127.80, 890, 9.70, 180000, NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days'),
('Retention Program', 'email', 'draft', 'Winter retention campaign', 45000.00, 0.00, 0.00, 0, 0.00, 200000, NOW() + INTERVAL '30 days', NOW() + INTERVAL '60 days')
ON CONFLICT (name) DO NOTHING;

-- Insert Settings
INSERT INTO settings (category, key, value, data_type, description) VALUES
('general', 'app_name', 'SwipeSavvy', 'string', 'Application display name'),
('general', 'app_version', '1.2.0', 'string', 'Current app version'),
('general', 'support_email', 'support@swipesavvy.com', 'string', 'Support email address'),
('general', 'business_hours', '09:00-17:00 EST', 'string', 'Business operating hours'),
('billing', 'transaction_fee_percent', '2.9', 'float', 'Transaction fee percentage'),
('billing', 'settlement_fee', '0.30', 'float', 'Settlement fee per transaction'),
('billing', 'min_withdrawal', '10.00', 'float', 'Minimum withdrawal amount'),
('billing', 'settlement_schedule', 'daily', 'string', 'How often settlements occur'),
('security', 'session_timeout_minutes', '30', 'integer', 'Session timeout in minutes'),
('security', 'require_2fa', 'false', 'boolean', 'Require two-factor authentication'),
('security', 'max_login_attempts', '5', 'integer', 'Maximum failed login attempts'),
('notification', 'send_email_notifications', 'true', 'boolean', 'Send email notifications'),
('notification', 'send_sms_notifications', 'true', 'boolean', 'Send SMS notifications'),
('notification', 'notification_delay_seconds', '5', 'integer', 'Delay before sending notifications'),
('api', 'rate_limit_requests', '1000', 'integer', 'API requests per minute'),
('api', 'api_version', 'v1.2', 'string', 'Current API version')
ON CONFLICT DO NOTHING;

-- Insert Audit Logs
INSERT INTO audit_logs (action, action_type, resource_type, resource_id, user_id, user_email, status, error_message, changes) VALUES
('User created', 'create', 'users', (SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), (SELECT id FROM admin_users WHERE email = 'admin@swipesavvy.com' LIMIT 1), 'admin@swipesavvy.com', 'success', NULL, '{"email": "john.doe@example.com", "role": "user"}'::jsonb),
('Merchant onboarded', 'create', 'merchants', (SELECT id FROM merchants WHERE email = 'contact@techhub.com' LIMIT 1), (SELECT id FROM admin_users WHERE email = 'ops@swipesavvy.com' LIMIT 1), 'ops@swipesavvy.com', 'success', NULL, '{"name": "TechHub Solutions", "status": "active"}'::jsonb),
('Payment processed', 'update', 'transactions', (SELECT id FROM merchants LIMIT 1), (SELECT id FROM admin_users WHERE email = 'finance@swipesavvy.com' LIMIT 1), 'finance@swipesavvy.com', 'success', NULL, '{"amount": 500.00, "status": "completed"}'::jsonb),
('Feature flag enabled', 'update', 'feature_flags', (SELECT id FROM feature_flags WHERE name = 'dark_mode' LIMIT 1), (SELECT id FROM admin_users WHERE email = 'admin@swipesavvy.com' LIMIT 1), 'admin@swipesavvy.com', 'success', NULL, '{"enabled": true, "rollout": 100}'::jsonb),
('Support ticket closed', 'update', 'support_tickets', (SELECT id FROM support_tickets WHERE subject = 'Account Verification Failed' LIMIT 1), (SELECT id FROM admin_users WHERE email = 'support@swipesavvy.com' LIMIT 1), 'support@swipesavvy.com', 'success', NULL, '{"status": "closed", "resolution": "verified"}'::jsonb),
('Failed login attempt', 'authentication', 'users', NULL, NULL, 'hacker@example.com', 'failure', 'Invalid credentials', '{"attempts": 1}'::jsonb),
('Database backup', 'create', 'system', NULL, (SELECT id FROM admin_users WHERE email = 'admin@swipesavvy.com' LIMIT 1), 'admin@swipesavvy.com', 'success', NULL, '{"size_gb": 2.5, "duration_seconds": 120}'::jsonb),
('Settings updated', 'update', 'settings', NULL, (SELECT id FROM admin_users WHERE email = 'admin@swipesavvy.com' LIMIT 1), 'admin@swipesavvy.com', 'success', NULL, '{"from": "1.1.9", "to": "1.2.0"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert Dashboard Analytics - Note: This table might not exist in all databases
-- INSERT INTO dashboard_analytics (date, total_users, new_users, total_transactions, transaction_volume, success_rate) VALUES
-- (NOW()::date, 15240, 245, 12500, 385000.00, 98.8),
-- (NOW()::date - INTERVAL '1 day', 15100, 198, 12100, 372000.00, 98.8);


-- ============================================
-- swipesavvy_ai Database - Seed Data
-- ============================================

-- Insert AI Models
INSERT INTO ai_models (name, version, model_type, status, accuracy, deployment_date, description, parameters) VALUES
('Merchant Recommendation Engine', '2.1', 'recommendation', 'active', 94.5, NOW() - INTERVAL '45 days', 'Recommends merchants based on user behavior', '{"layers": 5, "neurons": 256}'::jsonb),
('Fraud Detection Model', '1.8', 'classification', 'active', 99.2, NOW() - INTERVAL '60 days', 'Detects fraudulent transactions', '{"features": 45, "threshold": 0.85}'::jsonb),
('Revenue Prediction', '3.0', 'regression', 'active', 92.1, NOW() - INTERVAL '20 days', 'Predicts merchant revenue', '{"lookback_days": 90}'::jsonb),
('Churn Prediction', '1.5', 'classification', 'archived', 88.3, NOW() - INTERVAL '120 days', 'Predicts customer churn', '{"deprecated": true}'::jsonb),
('Sentiment Analysis', '2.2', 'nlp', 'active', 91.8, NOW() - INTERVAL '30 days', 'Analyzes customer feedback sentiment', '{"languages": ["en", "es"]}'::jsonb)
ON CONFLICT (name, version) DO NOTHING;
Note: These tables are replicated in all databases, so we'll just populate in swipesavvy_ai
-- Insert AI Models
-- INSERT INTO ai_models (name, version, model_type, status, accuracy, deployment_date) VALUES
-- ('Merchant Recommendation Engine', '2.1', 'recommendation', 'active', 94.5, NOW() - INTERVAL '45 days'),
-- ('Fraud Detection Model', '1.8', 'classification', 'active', 99.2, NOW() - INTERVAL '60 days');

-- Campaign performance data requires valid campaign IDs from ai_campaigns table
-- Will be populated after campaigns are verified to existWHERE email = 'john.doe@example.com' LIMIT 1), 2500.75, 'USD', 'active', true, 5000.00, 8000.00),
((SELECT id FROM users WHERE email = 'jane.smith@example.com' LIMIT 1), 1850.50, 'USD', 'active', true, 5000.00, 5500.00),
((SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1), 45230.00, 'USD', 'active', true, 50000.00, 125000.00),
((SELECT id FROM users WHERE email = 'merchant2@business.com' LIMIT 1), 32150.75, 'USD', 'active', true, 50000.00, 95000.00),
((SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1), 500.00, 'USD', 'active', false, 5000.00, 1000.00),
((SELECT id FROM users WHERE email = 'alice.brown@example.com' LIMIT 1), 750.25, 'USD', 'active', true, 5000.00, 2000.00)
ON CONFLICT DO NOTHING;

-- Insert Wallet Transactions
INSERT INTO wallet_transactions (wallet_id, type, amount, currency, status, description, reference_number, recipient, created_at) VALUES
((SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1) LIMIT 1), 'deposit', 500.00, 'USD', 'completed', 'Initial funding', 'DEP-001', NULL, NOW() - INTERVAL '30 days'),
((SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1) LIMIT 1), 'payment', 125.50, 'USD', 'completed', 'Payment to merchant', 'TXN-12345', 'merchant1@business.com', NOW() - INTERVAL '10 days'),
((SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1) LIMIT 1), 'withdrawal', 100.00, 'USD', 'completed', 'Withdrawal to bank', 'WTH-001', 'Bank Account ****1234', NOW() - INTERVAL '5 days'),
((SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1) LIMIT 1), 'payment', 2500.00, 'USD', 'completed', 'Received payment', 'TXN-12346', 'customer', NOW() - INTERVAL '2 days'),
((SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1) LIMIT 1), 'refund', 150.00, 'USD', 'completed', 'Customer refund', 'RFD-001', NULL, NOW() - INTERVAL '1 day'),
((SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'merchant2@business.com' LIMIT 1) LIMIT 1), 'deposit', 1000.00, 'USD', 'pending', 'Bank transfer in progress', 'DEP-002', NULL, NOW() - INTERVAL '3 hours'),
((SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1) LIMIT 1), 'payment', 50.00, 'USD', 'completed', 'Payment to merchant', 'TXN-12347', 'merchant1@business.com', NOW() - INTERVAL '6 hours'),
((SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1) LIMIT 1), 'deposit', 500.00, 'USD', 'failed', 'Card declined', 'DEP-003', NULL, NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;
) VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 2500.75, 'USD', 'active'),
((SELECT id FROM users WHERE email = 'jane.smith@example.com' LIMIT 1), 1850.50, 'USD', 'active'),
((SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1), 45230.00, 'USD', 'active'),
((SELECT id FROM users WHERE email = 'merchant2@business.com' LIMIT 1), 32150.75, 'USD', 'active'),
((SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1), 500.00, 'USD', 'active'),
((SELECT id FROM users WHERE email = 'alice.brown@example.com' LIMIT 1), 750.25, 'USD', 'active')
ON CONFLICT (user_id) DO NOTHING;

-- Insert Wallet Transactions
INSERT INTO wallet_transactions (user_id, transaction_type, amount, currency, status, description, reference_number) VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 'transfer', 500.00, 'USD', 'completed', 'Initial funding', 'DEP-001'),
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 'transfer', 125.50, 'USD', 'completed', 'Payment to merchant', 'TXN-12345'),
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 'transfer', 100.00, 'USD', 'completed', 'Withdrawal to bank', 'WTH-001'),
((SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1), 'transfer', 2500.00, 'USD', 'completed', 'Received payment', 'TXN-12346'),
((SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1), 'transfer', 150.00, 'USD', 'completed', 'Customer refund', 'RFD-001'),
((SELECT id FROM users WHERE email = 'merchant2@business.com' LIMIT 1), 'transfer', 1000.00, 'USD', 'pending', 'Bank transfer in progress', 'DEP-002'),
((SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1), 'transfer', 50.00, 'USD', 'completed', 'Payment to merchant', 'TXN-12347'),
((SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1), 'transfer', 500.00, 'USD', 'failed', 'Card declined', 'DEP-003')
ON CONFLICT DO NOTHING;

-- Insert Payment Methods
INSERT INTO payment_methods (user_id, type, token, last_four, expiry_date, is_default, status) VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 'card', 'tok_visa_1234', '4242', '2026-12-31', true, 'active'),
((SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1), 'card', 'tok_debit_5678', '5555', '2025-06-30', false, 'active'),
((SELECT id FROM users WHERE email = 'merchant1@business.com' LIMIT 1), 'card', 'tok_bank_9999', '1234', '2028-12-31', true, 'active'),
((SELECT id FROM users WHERE email = 'merchant2@business.com' LIMIT 1), 'card', 'tok_visa_5555', '5555', '2027-03-31', true, 'active'),
((SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1), 'card', 'tok_visa_0000', '4111', '2025-09-30', true, 'active'),
((SELECT id FROM users WHERE email = 'customer@gmail.com' LIMIT 1), 'card', 'tok_google_123', 'xxxx', '2026-12-31', false, 'active')
ON CONFLICT DO NOTHING