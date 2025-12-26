# PHASE 3: MERCHANT NETWORK & GEOFENCING - IMPLEMENTATION GUIDE

**Status:** ✅ READY TO IMPLEMENT  
**Date:** December 26, 2025  
**Estimated Time:** 3-4 days  
**Complexity:** High  

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Backend API Implementation](#backend-api-implementation)
4. [Mobile Location Tracking](#mobile-location-tracking)
5. [Integration with Campaigns](#integration-with-campaigns)
6. [Testing Procedures](#testing-procedures)
7. [Deployment Checklist](#deployment-checklist)
8. [Troubleshooting](#troubleshooting)

---

## OVERVIEW

### What's Being Built

**Merchant Network System** enables the AI Marketing system to:
- Store and manage merchant locations (restaurants, stores, gas stations, etc.)
- Define geofence zones around merchants (300-1000m radius)
- Track user locations in real-time
- Trigger location-based campaigns when users enter merchant zones
- Store user location history for analytics
- Track campaign conversions from geofence triggers

### Key Components

| Component | Purpose | Status |
|-----------|---------|--------|
| **Database Schema** | 7 tables for merchants, locations, geofences | ✅ Ready |
| **Merchant CRUD APIs** | Create/read/update/delete merchants | ✅ Ready |
| **Location Tracking Hook** | Real-time location with background tracking | ✅ Ready |
| **Geofencing Logic** | Detect when user enters/exits merchant zones | ✅ Ready |
| **Proximity Search** | Find nearby merchants | ✅ Ready |
| **Campaign Integration** | Trigger campaigns on geofence entry | ✅ Ready |
| **Analytics** | Track performance of location-based campaigns | ✅ Ready |

### User Flow

```
User opens app
    ↓
Location tracking enabled
    ↓
Background service tracks location every 60s
    ↓
User moves to store within geofence zone
    ↓
Geofence trigger detected
    ↓
Campaign queued for delivery
    ↓
Notification sent (Email, SMS, Push)
    ↓
User sees in-app campaign banner
    ↓
User scans offer at point of sale
    ↓
Conversion recorded
    ↓
Analytics updated
```

---

## DATABASE SETUP

### Prerequisites

- PostgreSQL 12+ running at localhost:5432
- Database user with CREATE TABLE permissions
- psql command-line tool

### Step 1: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create merchants database
CREATE DATABASE merchants_db;

# Connect to the new database
\c merchants_db
```

### Step 2: Run Schema Migration

```bash
# Using psql
psql -U postgres -d merchants_db -f merchants_schema.sql

# OR using Python
python -c "
import psycopg2
from pathlib import Path

conn = psycopg2.connect('dbname=merchants_db user=postgres')
cursor = conn.cursor()

with open('merchants_schema.sql', 'r') as f:
    cursor.execute(f.read())

conn.commit()
cursor.close()
conn.close()
print('Schema created successfully')
"
```

### Step 3: Verify Tables Created

```bash
psql -U postgres -d merchants_db -c "\dt"

# Expected output:
# merchant_categories
# merchants
# preferred_merchants
# user_merchant_preferences
# merchant_geofence_zones
# user_location_history
# merchant_campaign_triggers
```

### Step 4: Load Sample Data

```bash
# Sample merchants for testing
psql -U postgres -d merchants_db << 'EOF'

-- Insert sample merchants
INSERT INTO merchants (
  merchant_id, name, category_id, latitude, longitude,
  address, city, state, zip_code, phone, website, rating
) VALUES
  ('starbucks_main', 'Starbucks Coffee', 1, 37.7749, -122.4194, 
   '123 Market St', 'San Francisco', 'CA', '94102', '(415) 555-0100', 
   'starbucks.com', 4.8),
  ('target_downtown', 'Target', 2, 37.7750, -122.4180,
   '100 Market St', 'San Francisco', 'CA', '94102', '(415) 555-0101',
   'target.com', 4.5),
  ('whole_foods', 'Whole Foods Market', 3, 37.7748, -122.4200,
   '50 Market St', 'San Francisco', 'CA', '94102', '(415) 555-0102',
   'wholefoods.com', 4.7),
  ('shell_station', 'Shell Gas Station', 4, 37.7760, -122.4150,
   '200 Van Ness Ave', 'San Francisco', 'CA', '94102', '(415) 555-0103',
   'shell.com', 4.2);

-- Create geofence zones for each merchant
INSERT INTO merchant_geofence_zones (merchant_id, zone_name, zone_type, radius_meters)
SELECT id, name || ' - Main Zone', 'radius', 500 FROM merchants;

EOF
```

### Database Schema Overview

**merchant_categories** - Types of merchants
- Fast food, retail, gas stations, hotels, etc.
- 8 default categories provided

**merchants** - Actual merchant locations
- Location: latitude/longitude with spatial index
- Details: hours, rating, contact info
- Status: active/featured flags

**preferred_merchants** - Our partner merchants
- Commission rates, performance metrics
- User visits, campaign impressions/conversions
- Revenue tracking

**user_merchant_preferences** - Per-user merchant data
- Favorites, visit history, spend patterns
- Notification preferences
- Last visit and visit frequency

**merchant_geofence_zones** - Geofence boundaries
- Radius-based (circle) or polygon-based (custom shape)
- Trigger settings (dwell time, campaign trigger)

**user_location_history** - Location tracking data
- GPS coordinates with accuracy
- Nearest merchant and geofence info
- Device and app version for analytics

**merchant_campaign_triggers** - Campaign conversion tracking
- When/where campaigns are triggered
- Campaign delivery status
- User engagement and conversion data

---

## BACKEND API IMPLEMENTATION

### Step 1: Copy merchant API File

```bash
# Copy the merchant API to backend
cp merchants.py /path/to/backend/app/routers/merchants.py
```

### Step 2: Update Backend Main App

In your `main.py` or `app.py`, add the merchant router:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import merchants  # ADD THIS

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(merchants.router)  # ADD THIS

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Step 3: Verify Environment Variables

Create/update `.env` in backend:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/merchants_db

# Optional: SendGrid (from Phase 1)
SENDGRID_API_KEY=your_sendgrid_key_here

# Optional: Twilio (from Phase 1)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Location tracking
LOCATION_TRACKING_ENABLED=true
GEOFENCE_TRIGGER_ENABLED=true
```

### Step 4: Test Merchant APIs

```bash
# Start backend
cd /path/to/backend
python -m uvicorn main:app --reload --port 8000

# In another terminal, test APIs

# Get categories
curl http://localhost:8000/api/merchants/categories

# Create merchant
curl -X POST http://localhost:8000/api/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "test_merchant",
    "name": "Test Store",
    "category_id": 2,
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Test St",
    "city": "San Francisco"
  }'

# Get nearby merchants (within 1 mile of coordinates)
curl -X POST http://localhost:8000/api/merchants/nearby \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius_miles": 1.0,
    "limit": 20
  }'

# Track user location
curl -X POST http://localhost:8000/api/merchants/location/track \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy_meters": 10,
    "location_source": "gps"
  }'
```

### Available Merchant APIs

#### Merchant Management

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/merchants` | GET | List merchants | None |
| `/merchants` | POST | Create merchant | Admin |
| `/merchants/{id}` | GET | Get merchant details | None |
| `/merchants/{id}` | PUT | Update merchant | Admin |
| `/merchants/{id}` | DELETE | Delete merchant | Admin |
| `/merchants/categories` | GET | Get merchant categories | None |

#### Location & Geofencing

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/merchants/geofence/zones` | POST | Create geofence zone |
| `/merchants/geofence/merchant/{id}` | GET | Get merchant geofences |
| `/merchants/location/track` | POST | Track user location |
| `/merchants/nearby` | POST | Find nearby merchants |

#### User Preferences

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/merchants/user/{id}/favorites` | GET | Get user's favorite merchants |
| `/merchants/user/{id}/favorites/{merchant_id}` | POST | Add favorite |
| `/merchants/user/{id}/favorites/{merchant_id}` | DELETE | Remove favorite |

#### Analytics

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/merchants/network/performance` | GET | Overall network stats |
| `/merchants/{id}/analytics` | GET | Merchant performance |

---

## MOBILE LOCATION TRACKING

### Step 1: Install Dependencies

```bash
cd /path/to/mobile/app

# Install Expo Location
expo install expo-location expo-task-manager

# If using file-based dependency management
npm install --save expo-location expo-task-manager

# For iOS, also need background task permissions
expo install expo-background-fetch
```

### Step 2: Copy Location Tracking Hook

```bash
# Copy hook to mobile app
cp useLocationTracking.ts /path/to/mobile/app/hooks/useLocationTracking.ts
```

### Step 3: Configure App Permissions

Update `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermissions": "Allow $(PRODUCT_NAME) to access your location."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "SwipeSavvy needs your location to show nearby deals",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "SwipeSavvy uses your location to notify you about merchant offers when you're nearby",
        "UIBackgroundModes": [
          "location"
        ]
      }
    },
    "android": {
      "permissions": [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

### Step 4: Integrate into Main App

In your main app component:

```typescript
import { useLocationTracking } from './hooks/useLocationTracking';
import { MarketingAPIService } from './services/MarketingAPIService';

export default function App() {
  const { startTracking, isTracking, error } = useLocationTracking();

  useEffect(() => {
    const initializeLocation = async () => {
      // Initialize after user login
      const apiClient = MarketingAPIService.getInstance();
      const success = await startTracking(apiClient);
      
      if (!success) {
        console.warn('Location tracking failed:', error);
      }
    };

    initializeLocation();
  }, []);

  return (
    // Your app screens
    <View>
      {isTracking && <Text style={{color: 'green'}}>📍 Location tracking active</Text>}
      {error && <Text style={{color: 'red'}}>⚠️ {error}</Text>}
    </View>
  );
}
```

### Step 5: Create Location Settings Screen

```typescript
import { useLocationTracking } from '../hooks/useLocationTracking';
import { Switch, View, Text, Alert } from 'react-native';

export function LocationSettingsScreen() {
  const { isTracking, startTracking, stopTracking, updatePreferences } = useLocationTracking();
  const [trackingEnabled, setTrackingEnabled] = useState(isTracking);
  const [frequency, setFrequency] = useState('normal');

  const handleTrackingToggle = async (enabled) => {
    if (enabled) {
      const success = await startTracking(MarketingAPIService.getInstance());
      if (success) {
        setTrackingEnabled(true);
        Alert.alert('Location Tracking Enabled', 'We\'ll notify you about deals at nearby merchants');
      } else {
        Alert.alert('Error', 'Failed to enable location tracking');
      }
    } else {
      await stopTracking();
      setTrackingEnabled(false);
    }
  };

  const handleFrequencyChange = async (freq) => {
    await updatePreferences({ updateFrequency: freq });
    setFrequency(freq);
    Alert.alert('Updated', `Location update frequency set to ${freq}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location & Geofencing</Text>
      
      <View style={styles.setting}>
        <Text>Enable Location Tracking</Text>
        <Switch 
          value={trackingEnabled}
          onValueChange={handleTrackingToggle}
        />
      </View>

      {trackingEnabled && (
        <>
          <View style={styles.setting}>
            <Text>Update Frequency</Text>
            <Picker
              selectedValue={frequency}
              onValueChange={handleFrequencyChange}
            >
              <Picker.Item label="Frequent (30s)" value="frequent" />
              <Picker.Item label="Normal (60s)" value="normal" />
              <Picker.Item label="Battery Saver (5m)" value="battery_saver" />
            </Picker>
          </View>

          <Text style={styles.info}>
            ℹ️ Location tracking allows us to notify you about deals when you're near partner merchants.
            We respect your privacy and only share location data with your permission.
          </Text>
        </>
      )}
    </View>
  );
}
```

---

## INTEGRATION WITH CAMPAIGNS

### Step 1: Update Campaign Creation

When creating a campaign, specify target merchants:

```python
# In marketing API (backend)

@router.post("/api/marketing/campaigns/create")
async def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    # ... existing code ...
    
    # If campaign type is location-based
    if campaign.campaign_type == "Location":
        # Associate with merchant locations
        for merchant_id in campaign.merchant_ids:
            db.execute(
                text("""
                    INSERT INTO merchant_campaign_triggers (
                        campaign_id, merchant_id, trigger_type,
                        delivery_status
                    ) VALUES (:campaign_id, :merchant_id, :geofence_entry, :pending)
                """),
                {
                    "campaign_id": campaign.campaign_id,
                    "merchant_id": merchant_id,
                    "geofence_entry": "geofence_entry",
                    "pending": "pending"
                }
            )
```

### Step 2: Handle Geofence Triggers

When location service detects geofence entry:

```python
# In merchants.py - trigger_geofence_campaign function

async def trigger_geofence_campaign(
    user_id: str, merchant_id: int, geofence_zone_id: int,
    location_lat: float, location_lon: float
):
    """Triggered by background location service"""
    
    db = database.SessionLocal()
    
    try:
        # Get relevant campaigns for this merchant
        campaigns = db.execute(
            text("""
                SELECT c.campaign_id, c.title, c.offer_value, c.campaign_type
                FROM campaigns c
                WHERE c.is_active = TRUE
                  AND c.campaign_type = 'Location'
                  AND EXISTS (
                    SELECT 1 FROM preferred_merchants pm
                    WHERE pm.merchant_id = :merchant_id
                      AND pm.is_partner = TRUE
                  )
                LIMIT 1
            """),
            {"merchant_id": merchant_id}
        ).mappings().first()
        
        if campaigns:
            # Record trigger
            db.execute(
                text("""
                    INSERT INTO merchant_campaign_triggers (
                        campaign_id, merchant_id, user_id, trigger_type,
                        trigger_location, campaign_sent, delivery_status
                    ) VALUES (
                        :campaign_id, :merchant_id, :user_id,
                        :trigger_type, :location, FALSE, :status
                    )
                """),
                {
                    "campaign_id": campaigns['campaign_id'],
                    "merchant_id": merchant_id,
                    "user_id": user_id,
                    "trigger_type": "geofence_entry",
                    "location": json.dumps({"lat": location_lat, "lng": location_lon}),
                    "status": "pending"
                }
            )
            db.commit()
            
            # Queue for notification service
            from app.services.notification_service_enhanced import NotificationService
            notif_service = NotificationService()
            
            await notif_service.send_notification(
                user_ids=[user_id],
                title=campaigns['title'],
                content=f"Special offer: {campaigns['offer_value']}",
                channels=["PUSH", "IN_APP"],
                metadata={
                    "campaign_id": campaigns['campaign_id'],
                    "merchant_id": merchant_id,
                    "trigger_type": "geofence"
                }
            )
    
    finally:
        db.close()
```

### Step 3: Display Location-Based Campaigns in Mobile

Update `CampaignsBanner.tsx` to handle location-based variant:

```typescript
<CampaignsBanner
  variant="carousel"
  locationBased={true}  // NEW: Only show location-triggered campaigns
  geofenceTriggered={geofenceData}  // Data from background service
  onCampaignPress={handlePress}
/>
```

---

## TESTING PROCEDURES

### Backend Testing

#### 1. Database Tests

```bash
# Verify schema
psql -U postgres -d merchants_db -c "
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
"

# Check indexes
psql -U postgres -d merchants_db -c "
SELECT * FROM pg_indexes WHERE tablename LIKE 'merchant%';
"

# Count data
psql -U postgres -d merchants_db -c "
SELECT 'merchants' as table_name, COUNT(*) as count FROM merchants
UNION ALL SELECT 'merchant_categories', COUNT(*) FROM merchant_categories
UNION ALL SELECT 'preferred_merchants', COUNT(*) FROM preferred_merchants;
"
```

#### 2. API Tests

```bash
# Test location tracking with mock data
for i in {1..10}; do
  LAT=$(echo "37.7749 + $(($RANDOM % 20 - 10)) / 1000" | bc)
  LON=$(echo "-122.4194 + $(($RANDOM % 20 - 10)) / 1000" | bc)
  
  curl -s -X POST http://localhost:8000/api/merchants/location/track \
    -H "Content-Type: application/json" \
    -d "{
      \"user_id\": \"test_user\",
      \"latitude\": $LAT,
      \"longitude\": $LON,
      \"accuracy_meters\": 10
    }" | jq .
  
  sleep 2
done

# Check geofence triggers
curl http://localhost:8000/api/merchants/network/performance | jq .
```

#### 3. Geofencing Distance Calculation

```python
# Test haversine distance calculation
from merchants import haversine_distance

# Test: Starbucks (37.7749, -122.4194) to Target (37.7750, -122.4180)
distance = haversine_distance(37.7749, -122.4194, 37.7750, -122.4180)
print(f"Distance: {distance} miles")  # Should be ~0.1 miles

# Test: Point inside polygon
test_polygon = [
    {"lat": 37.7740, "lng": -122.4200},
    {"lat": 37.7760, "lng": -122.4200},
    {"lat": 37.7760, "lng": -122.4180},
    {"lat": 37.7740, "lng": -122.4180}
]

from merchants import is_point_in_polygon
inside = is_point_in_polygon(37.7750, -122.4190, test_polygon)
print(f"Point inside polygon: {inside}")  # Should be True
```

### Mobile Testing

#### 1. Permission Testing

```typescript
// Test location permissions
import * as Location from 'expo-location';

const testPermissions = async () => {
  const foreground = await Location.requestForegroundPermissionsAsync();
  console.log('Foreground:', foreground.status);  // Should be 'granted'
  
  const background = await Location.requestBackgroundPermissionsAsync();
  console.log('Background:', background.status);  // Should be 'granted'
};
```

#### 2. Location Tracking Test

```typescript
import { useLocationTracking } from '../hooks/useLocationTracking';
import { MarketingAPIService } from '../services/MarketingAPIService';

export function LocationTestScreen() {
  const [locations, setLocations] = useState([]);
  const { startTracking, getCurrentLocation } = useLocationTracking();

  const handleStartTest = async () => {
    const apiClient = MarketingAPIService.getInstance();
    await startTracking(apiClient);
    
    // Get location every 5 seconds for 30 seconds
    for (let i = 0; i < 6; i++) {
      const loc = await getCurrentLocation();
      setLocations(prev => [...prev, loc]);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };

  return (
    <View>
      <Button title="Start Location Test" onPress={handleStartTest} />
      <FlatList
        data={locations}
        renderItem={({ item }) => (
          <Text>{item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</Text>
        )}
      />
    </View>
  );
}
```

#### 3. Geofence Simulation

```typescript
// Manually test geofence trigger
const testGeofenceTrigger = async () => {
  const starbucksLat = 37.7749;
  const starbucksLon = -122.4194;
  
  // Simulate locations approaching geofence
  const testLocations = [
    { lat: 37.7700, lon: -122.4200 },  // 0.7 miles away
    { lat: 37.7725, lon: -122.4197 },  // 0.35 miles away
    { lat: 37.7740, lon: -122.4195 },  // 0.1 miles away (SHOULD TRIGGER)
    { lat: 37.7749, lon: -122.4194 },  // At merchant
  ];

  for (const loc of testLocations) {
    const response = await MarketingAPIService.getInstance().post(
      '/merchants/location/track',
      {
        user_id: 'test_user',
        latitude: loc.lat,
        longitude: loc.lon,
        accuracy_meters: 10
      }
    );
    
    console.log('Response:', response);
    // Should show: geofence_triggered: true (for last location)
  }
};
```

### Performance Testing

```bash
# Load test: Track 1000 user locations
ab -n 1000 -c 10 \
  -p location_payload.json \
  -T application/json \
  http://localhost:8000/api/merchants/location/track

# Test nearby merchant search with large dataset
time curl -X POST http://localhost:8000/api/merchants/nearby \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius_miles": 5.0,
    "limit": 100
  }'
```

### Acceptance Criteria

- ✅ Database schema created with all 7 tables
- ✅ All indexes created for performance
- ✅ Merchant CRUD APIs working
- ✅ Location tracking stores in database
- ✅ Geofence zones created and queryable
- ✅ Geofence triggers within 500m radius
- ✅ Nearby search returns merchants <2s latency
- ✅ Location permission flow works on both iOS and Android
- ✅ Background location tracking continues after app minimized
- ✅ Campaign triggers when entering geofence
- ✅ Campaign delivery within 5 seconds of geofence entry

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] Database backup created
- [ ] Schema migration tested on staging
- [ ] All merchant APIs tested
- [ ] Location permission flow tested on devices
- [ ] Background task configuration verified
- [ ] Notification system still working from Phase 1
- [ ] Campaign creation updated to support location type
- [ ] Geofence radius configured (recommended: 500m)
- [ ] Analytics queries verified
- [ ] Performance benchmarks met

### Database Migration (Production)

```bash
# 1. Backup existing database
pg_dump merchants_db > merchants_backup_$(date +%Y%m%d).sql

# 2. Create tables (migration already handles idempotency)
psql -U postgres -d merchants_db -f merchants_schema.sql

# 3. Verify
psql -U postgres -d merchants_db -c "\dt"
```

### Backend Deployment

```bash
# 1. Copy merchant API file
cp merchants.py /path/to/prod/backend/app/routers/

# 2. Update main.py with router import
# (See "Update Backend Main App" section)

# 3. Update requirements.txt (if needed)
# Already included dependencies should be satisfied

# 4. Restart backend
systemctl restart backend
# or
sudo supervisorctl restart api

# 5. Verify API is accessible
curl http://your-backend/api/merchants/categories
```

### Mobile Deployment

```bash
# 1. Copy location hook
cp useLocationTracking.ts /path/to/mobile/app/hooks/

# 2. Install dependencies
npm install expo-location expo-task-manager

# 3. Update app.json with permissions

# 4. Build and deploy
eas build --platform ios
eas build --platform android

# 5. Test location tracking on real devices
```

### Post-Deployment

- [ ] Verify all endpoints responding
- [ ] Test location tracking with real user
- [ ] Verify geofence trigger in logs
- [ ] Check campaign was delivered
- [ ] Confirm analytics recorded
- [ ] Monitor database performance
- [ ] Check error logs for issues
- [ ] Get user feedback on location tracking

---

## TROUBLESHOOTING

### Database Issues

**Problem: "relation merchant_categories does not exist"**
```bash
# Solution: Run schema migration
psql -U postgres -d merchants_db -f merchants_schema.sql

# Verify tables exist
psql -U postgres -d merchants_db -c "\dt merchant_*"
```

**Problem: Slow nearby merchant queries**
```bash
# Solution: Ensure spatial indexes exist
psql -U postgres -d merchants_db << 'EOF'
CREATE INDEX idx_merchants_location 
ON merchants (latitude, longitude);
CLUSTER merchants USING idx_merchants_location;
ANALYZE merchants;
EOF
```

### Backend Issues

**Problem: "ImportError: cannot import name 'merchants'"**
```python
# Solution: Ensure file is in correct location
# File should be: /path/to/backend/app/routers/merchants.py
# And imported in main.py as: from app.routers import merchants
```

**Problem: Location tracking returns 500 error**
```python
# Check logs for detailed error
tail -f /var/log/backend.log

# Common issues:
# 1. Database not running: psql -U postgres -c "SELECT 1"
# 2. Merchants table not populated: SELECT COUNT(*) FROM merchants;
# 3. User ID format issue: Must be string type
```

**Problem: Geofence never triggers**
```python
# 1. Verify geofence zone exists
SELECT * FROM merchant_geofence_zones 
WHERE merchant_id = YOUR_MERCHANT_ID;

# 2. Check radius_meters is reasonable (50-1000)
# 3. Verify campaign is active
SELECT * FROM campaigns 
WHERE merchant_id = YOUR_MERCHANT_ID 
AND is_active = TRUE;

# 4. Check trigger logs
SELECT * FROM merchant_campaign_triggers 
ORDER BY created_at DESC LIMIT 10;
```

### Mobile Issues

**Problem: "Location permission denied"**
```
Solution:
1. Check app.json permissions are configured
2. On iOS: Settings > SwipeSavvy > Location > Always
3. On Android: Settings > Apps > SwipeSavvy > Permissions > Location
4. Reinstall app if permissions were denied before
```

**Problem: Location tracking stops after app closed**
```
Solution:
1. Verify background mode enabled in app.json
2. Check UIBackgroundModes includes "location"
3. For Android 12+: Verify SCHEDULE_EXACT_ALARM permission
4. Ensure battery optimization isn't killing app
```

**Problem: "Cannot track location due to error"**
```typescript
// Debug code
import { useLocationTracking } from '../hooks/useLocationTracking';

const { error } = useLocationTracking();
console.log('Location error:', error);
```

### Integration Issues

**Problem: Campaign doesn't trigger on geofence entry**
```
Checklist:
1. ✅ Merchant exists and is active (is_active = true)
2. ✅ Campaign is active and location type
3. ✅ Geofence zone exists and is active
4. ✅ User location is tracking and updating
5. ✅ Notification service is configured (Phase 1)
6. ✅ Check merchant_campaign_triggers table
   SELECT * FROM merchant_campaign_triggers 
   WHERE user_id = 'your_user'
   ORDER BY created_at DESC;
```

**Problem: Location history not storing**
```bash
# Check if location tracking endpoint is being called
SELECT * FROM user_location_history 
WHERE user_id = 'your_user' 
ORDER BY created_at DESC LIMIT 5;

# If empty, check:
# 1. Is /api/merchants/location/track being called?
# 2. Add logging to track endpoint
# 3. Verify database connection is working
```

---

## SUCCESS METRICS

By the end of Phase 3, you should have:

✅ **Database:** 7 tables with 1000+ merchants loaded  
✅ **APIs:** All 12 endpoints tested and working  
✅ **Location Tracking:** Real-time updates every 60 seconds  
✅ **Geofencing:** Triggers within <2s of zone entry  
✅ **Mobile:** Location permission flow completed  
✅ **Integration:** Campaigns trigger automatically at geofence  
✅ **Analytics:** Campaign conversion tracking working  

**Performance Targets:**
- Nearby merchant search: <500ms
- Geofence trigger detection: <1s
- Location tracking accuracy: ±50m (GPS)
- Database query performance: <100ms

---

## NEXT PHASE

**Phase 4: Behavioral Learning & Optimization**

After Phase 3 completion, proceed to implement:
- Campaign performance analytics
- A/B testing framework
- Machine learning for optimization
- Real-time campaign adjustment
- ROI calculation per campaign type

Estimated duration: 5-7 days

---

## SUPPORT & RESOURCES

**Files Created:**
- `merchants_schema.sql` - Database schema (420 lines)
- `merchants.py` - Backend APIs (680 lines)
- `useLocationTracking.ts` - Mobile hook (480 lines)

**Documentation:**
- This guide: PHASE_3_MERCHANT_NETWORK_GUIDE.md
- API reference: API docs auto-generated by FastAPI at `/docs`
- Database reference: merchants_schema.sql (fully commented)

**Contact:**
For issues or questions, check:
1. Troubleshooting section (above)
2. Backend logs: `/var/log/backend.log`
3. Database logs: PostgreSQL logs
4. Mobile logs: React Native console

---

**Status:** READY TO DEPLOY ✅  
**Created:** December 26, 2025  
**Updated:** December 26, 2025  

