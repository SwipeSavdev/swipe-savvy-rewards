-- =============================================================================
-- MERCHANT NETWORK DATABASE SCHEMA
-- =============================================================================
-- Purpose: Store merchant information, categories, locations, and user preferences
-- Created: December 26, 2025
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. MERCHANT CATEGORIES TABLE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchant_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(100),
    color_code VARCHAR(7),  -- Hex color for UI display
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample merchant categories
INSERT INTO merchant_categories (name, description, icon_name, color_code) VALUES
    ('Restaurants & Cafes', 'Dining and beverage establishments', 'utensils', '#FF6B6B'),
    ('Retail & Shopping', 'Clothing, electronics, general retail', 'shopping-bag', '#4ECDC4'),
    ('Grocery & Food', 'Supermarkets and food stores', 'shopping-cart', '#95E1D3'),
    ('Gas Stations', 'Fuel and convenience stores', 'gas-pump', '#FFD93D'),
    ('Hotels & Travel', 'Accommodations and travel services', 'hotel', '#6BCB77'),
    ('Entertainment', 'Movies, gaming, attractions', 'popcorn', '#FF8066'),
    ('Health & Wellness', 'Gyms, spas, pharmacies', 'heart', '#FF6B9D'),
    ('Services', 'Hair, auto, repairs, cleaning', 'wrench', '#9D84B7')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. MERCHANTS TABLE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR(50) UNIQUE NOT NULL,  -- For API references
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL REFERENCES merchant_categories(id),
    
    -- Location Info
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(300),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    
    -- Contact Info
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(300),
    
    -- Business Info
    operating_hours JSONB,  -- {monday: {open: "9:00", close: "21:00"}, ...}
    rating DECIMAL(3, 2),    -- Average rating 0-5
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB,          -- Store additional data like: {chain: "Starbucks", loyalty_program: true, ...}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT valid_coordinates CHECK (latitude >= -90 AND latitude <= 90 AND longitude >= -180 AND longitude <= 180)
);

-- Create spatial index for fast geofencing queries
CREATE INDEX idx_merchants_location ON merchants (latitude, longitude);
CREATE INDEX idx_merchants_category ON merchants (category_id);
CREATE INDEX idx_merchants_active ON merchants (is_active);
CREATE INDEX idx_merchants_featured ON merchants (is_featured);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. MERCHANT NETWORK TABLE (User Preferences)
-- ─────────────────────────────────────────────────────────────────────────
-- Tracks which merchants are in the system's "preferred network"
-- System uses these merchants for targeted campaigns
CREATE TABLE IF NOT EXISTS preferred_merchants (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL UNIQUE REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Network Status
    is_partner BOOLEAN DEFAULT TRUE,
    partnership_type VARCHAR(50),  -- 'premium', 'standard', 'trial'
    commission_rate DECIMAL(5, 2),  -- Percentage (0-100)
    
    -- Activity Tracking
    user_visits_total INTEGER DEFAULT 0,
    campaign_impressions INTEGER DEFAULT 0,
    campaign_conversions INTEGER DEFAULT 0,
    revenue_from_campaigns DECIMAL(10, 2) DEFAULT 0,
    
    -- Preferences
    preferred_campaign_types JSONB,  -- ["VIP", "Loyalty", "Location", ...]
    max_campaigns_per_month INTEGER DEFAULT 10,
    send_notifications BOOLEAN DEFAULT TRUE,
    
    -- Performance
    average_conversion_rate DECIMAL(5, 2),
    average_order_value DECIMAL(10, 2),
    customer_satisfaction DECIMAL(3, 2),
    
    -- Status
    active_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_preferred_merchants_active ON preferred_merchants (is_partner);
CREATE INDEX idx_preferred_merchants_visits ON preferred_merchants (user_visits_total);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. USER MERCHANT PREFERENCES TABLE
-- ─────────────────────────────────────────────────────────────────────────
-- Tracks which merchants individual users prefer
CREATE TABLE IF NOT EXISTS user_merchant_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Preference Data
    is_favorite BOOLEAN DEFAULT FALSE,
    visit_frequency VARCHAR(50),  -- 'never', 'rarely', 'occasionally', 'frequently', 'daily'
    average_spend DECIMAL(10, 2),
    last_visit TIMESTAMP,
    visit_count INTEGER DEFAULT 0,
    
    -- Notification Preferences
    notify_on_campaigns BOOLEAN DEFAULT TRUE,
    notify_on_special_offers BOOLEAN DEFAULT TRUE,
    notify_on_loyalty_points BOOLEAN DEFAULT TRUE,
    preferred_notification_channels VARCHAR(100),  -- 'email,sms,push'
    
    -- History
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, merchant_id)
);

CREATE INDEX idx_user_merchant_user_id ON user_merchant_preferences (user_id);
CREATE INDEX idx_user_merchant_favorite ON user_merchant_preferences (is_favorite);
CREATE INDEX idx_user_merchant_frequency ON user_merchant_preferences (visit_frequency);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. MERCHANT GEOFENCE ZONES TABLE
-- ─────────────────────────────────────────────────────────────────────────
-- Define geofence boundaries for each merchant
CREATE TABLE IF NOT EXISTS merchant_geofence_zones (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Geofence Definition
    zone_name VARCHAR(100),
    zone_type VARCHAR(50),  -- 'radius' or 'polygon'
    
    -- For radius-based geofencing
    radius_meters INTEGER,  -- Radius in meters (typical: 300-1000)
    
    -- For polygon-based geofencing (JSON array of coordinates)
    polygon_coordinates JSONB,  -- [{lat: x, lng: y}, {lat: x, lng: y}, ...]
    
    -- Zone Configuration
    is_active BOOLEAN DEFAULT TRUE,
    trigger_campaign BOOLEAN DEFAULT TRUE,  -- Should entering trigger campaign?
    trigger_dwell_time_minutes INTEGER DEFAULT 2,  -- Min time in zone before trigger
    
    -- History
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_geofence_merchant ON merchant_geofence_zones (merchant_id);
CREATE INDEX idx_geofence_active ON merchant_geofence_zones (is_active);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. USER LOCATION HISTORY TABLE
-- ─────────────────────────────────────────────────────────────────────────
-- Track user locations for analytics and geofencing
CREATE TABLE IF NOT EXISTS user_location_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- Location Info
    accuracy_meters INTEGER,
    address VARCHAR(300),
    location_source VARCHAR(50),  -- 'gps', 'wifi', 'cellular'
    
    -- Merchant Association
    nearest_merchant_id INTEGER REFERENCES merchants(id),
    distance_to_nearest_meters INTEGER,
    is_in_geofence BOOLEAN DEFAULT FALSE,
    geofence_zone_id INTEGER REFERENCES merchant_geofence_zones(id),
    
    -- Metadata
    device_id VARCHAR(100),
    app_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_coords CHECK (latitude >= -90 AND latitude <= 90 AND longitude >= -180 AND longitude <= 180)
);

CREATE INDEX idx_location_user_id ON user_location_history (user_id);
CREATE INDEX idx_location_merchant ON user_location_history (nearest_merchant_id);
CREATE INDEX idx_location_geofence ON user_location_history (is_in_geofence);
CREATE INDEX idx_location_created ON user_location_history (created_at);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. MERCHANT CAMPAIGN TRIGGERS TABLE
-- ─────────────────────────────────────────────────────────────────────────
-- Track when campaigns are triggered by geofencing
CREATE TABLE IF NOT EXISTS merchant_campaign_triggers (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(50) NOT NULL,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    user_id VARCHAR(50) NOT NULL,
    
    -- Trigger Info
    trigger_type VARCHAR(50),  -- 'geofence_entry', 'geofence_dwell', 'proximity'
    trigger_location JSONB,     -- {lat: x, lng: y, accuracy: meters}
    
    -- Campaign Delivery
    campaign_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    delivery_channel VARCHAR(50),  -- 'email', 'sms', 'push', 'in_app'
    delivery_status VARCHAR(50),   -- 'pending', 'sent', 'failed', 'delivered'
    
    -- User Response
    user_viewed BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP,
    user_interacted BOOLEAN DEFAULT FALSE,
    interacted_at TIMESTAMP,
    interaction_type VARCHAR(100),  -- 'clicked_offer', 'saved', 'shared', etc.
    
    -- Conversion
    converted BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMP,
    conversion_value DECIMAL(10, 2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaign_trigger_campaign ON merchant_campaign_triggers (campaign_id);
CREATE INDEX idx_campaign_trigger_user ON merchant_campaign_triggers (user_id);
CREATE INDEX idx_campaign_trigger_merchant ON merchant_campaign_triggers (merchant_id);
CREATE INDEX idx_campaign_trigger_sent ON merchant_campaign_triggers (campaign_sent);
CREATE INDEX idx_campaign_trigger_converted ON merchant_campaign_triggers (converted);

-- ─────────────────────────────────────────────────────────────────────────
-- VIEWS FOR COMMON QUERIES
-- ─────────────────────────────────────────────────────────────────────────

-- View: Merchant Network Performance
CREATE OR REPLACE VIEW merchant_network_performance AS
SELECT 
    m.id,
    m.merchant_id,
    m.name,
    mc.name as category,
    pm.user_visits_total,
    pm.campaign_impressions,
    pm.campaign_conversions,
    CASE 
        WHEN pm.campaign_impressions > 0 
        THEN ROUND((pm.campaign_conversions::float / pm.campaign_impressions * 100)::numeric, 2)
        ELSE 0
    END as conversion_rate_percent,
    pm.revenue_from_campaigns,
    pm.customer_satisfaction,
    m.rating,
    m.is_active,
    pm.is_partner
FROM merchants m
JOIN merchant_categories mc ON m.category_id = mc.id
JOIN preferred_merchants pm ON m.id = pm.merchant_id
ORDER BY pm.revenue_from_campaigns DESC;

-- View: User Favorite Merchants with Details
CREATE OR REPLACE VIEW user_favorite_merchants_view AS
SELECT 
    ump.user_id,
    m.id,
    m.merchant_id,
    m.name,
    m.latitude,
    m.longitude,
    m.address,
    mc.name as category,
    m.rating,
    ump.visit_count,
    ump.average_spend,
    ump.last_visit,
    ump.visit_frequency
FROM user_merchant_preferences ump
JOIN merchants m ON ump.merchant_id = m.id
JOIN merchant_categories mc ON m.category_id = mc.id
WHERE ump.is_favorite = TRUE AND m.is_active = TRUE;

-- View: Nearby Merchants for Location-Based Campaigns
CREATE OR REPLACE VIEW nearby_merchants_view AS
SELECT 
    m.id,
    m.merchant_id,
    m.name,
    m.latitude,
    m.longitude,
    m.address,
    mc.name as category,
    m.rating,
    pm.commission_rate,
    pm.is_partner,
    mgz.zone_type,
    mgz.radius_meters
FROM merchants m
JOIN merchant_categories mc ON m.category_id = mc.id
LEFT JOIN preferred_merchants pm ON m.id = pm.merchant_id
LEFT JOIN merchant_geofence_zones mgz ON m.id = mgz.merchant_id
WHERE m.is_active = TRUE AND mgz.is_active = TRUE
ORDER BY pm.is_partner DESC, m.rating DESC;

-- =============================================================================
-- END MERCHANT NETWORK DATABASE SCHEMA
-- =============================================================================
