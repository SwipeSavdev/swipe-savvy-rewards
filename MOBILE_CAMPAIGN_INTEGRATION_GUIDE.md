# 📱 Mobile App Campaign Integration Guide

**Phase 2: Mobile App Campaign Display & Tracking**
**Status:** In Progress
**Target:** Enable users to see campaigns and track interactions

---

## 🎯 Overview

Users will now see active campaigns in the mobile app through:

1. **CampaignsBanner** - Horizontal carousel on home screen
2. **CampaignCard** - Individual campaign display (3 variants: card, banner, detailed)
3. **View Tracking** - Automatic tracking when campaign is displayed
4. **Conversion Tracking** - Track when user applies offer
5. **Notification Handling** - Respond to campaign push notifications

---

## 📦 Components Created

### 1. CampaignCard.tsx
**Purpose**: Display individual campaign with offer details
**Variants**:
- `card` - Large featured card (carousel)
- `banner` - Compact horizontal banner (list)
- `detailed` - Full details with apply button

**Features**:
- ✅ Campaign icon & color by type
- ✅ Offer value and type display
- ✅ View tracking on mount
- ✅ Conversion tracking on apply
- ✅ Merchant network info
- ✅ Expiry date
- ✅ Conversion rate badge

### 2. CampaignsBanner.tsx
**Purpose**: Display multiple campaigns in carousel/grid
**Variants**:
- `carousel` - Horizontal scroll (default, paging enabled)
- `grid` - Vertical list of banners
- `stacked` - Vertical list of detailed cards

**Features**:
- ✅ Fetch active campaigns from API
- ✅ Loading/empty states
- ✅ Refresh functionality
- ✅ Automatic view tracking
- ✅ Error handling with retry
- ✅ Responsive design

---

## 🔧 Installation Steps

### Step 1: Create Marketing Features Directory

```bash
mkdir -p /Users/macbookpro/Documents/swipesavvy-mobile-app/src/features/marketing/components
mkdir -p /Users/macbookpro/Documents/swipesavvy-mobile-app/src/features/marketing/screens
mkdir -p /Users/macbookpro/Documents/swipesavvy-mobile-app/src/features/marketing/hooks
```

### Step 2: Copy Components

The components have been created at:
- `src/features/marketing/components/CampaignCard.tsx`
- `src/features/marketing/components/CampaignsBanner.tsx`

### Step 3: Create Marketing Screens

#### CampaignsScreen.tsx

```typescript
// src/features/marketing/screens/CampaignsScreen.tsx
import React, { useCallback } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { LIGHT_THEME, SPACING } from '../../../design-system/theme'
import CampaignsBanner from '../components/CampaignsBanner'
import { Campaign } from '../components/CampaignCard'

type CampaignsScreenProps = {
  navigation: any
}

const CampaignsScreen: React.FC<CampaignsScreenProps> = ({ navigation }) => {
  const handleCampaignPress = useCallback((campaign: Campaign) => {
    navigation.navigate('CampaignDetail', { campaign })
  }, [navigation])

  const handleConversion = useCallback((campaignId: string, amount: number) => {
    console.log(`Campaign ${campaignId} converted for $${amount}`)
    // Could trigger celebration animation, update user balance, etc.
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={LIGHT_THEME.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <CampaignsBanner
          onCampaignPress={handleCampaignPress}
          onConversion={handleConversion}
          variant="carousel"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.background
  },
  content: {
    paddingVertical: SPACING.lg
  }
})

export default CampaignsScreen
```

### Step 4: Add Routes to Navigation

Update your navigation configuration:

```typescript
// src/navigation/AppNavigator.tsx
import CampaignsScreen from '../features/marketing/screens/CampaignsScreen'
import CampaignDetailScreen from '../features/marketing/screens/CampaignDetailScreen'

const Stack = createNativeStackNavigator()

export function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* ... other screens ... */}
      
      <Stack.Screen
        name="Campaigns"
        component={CampaignsScreen}
        options={{
          title: 'Exclusive Offers',
          headerShown: true
        }}
      />
      
      <Stack.Screen
        name="CampaignDetail"
        component={CampaignDetailScreen}
        options={{
          title: 'Offer Details',
          headerBackTitle: 'Back'
        }}
      />
    </Stack.Navigator>
  )
}
```

### Step 5: Add to Home Screen (Optional)

Display campaigns prominently on home:

```typescript
// src/features/home/screens/HomeScreen.tsx
import CampaignsBanner from '../marketing/components/CampaignsBanner'

export function HomeScreen() {
  return (
    <ScrollView>
      {/* ... other home screen content ... */}
      
      <CampaignsBanner
        limit={5}
        variant="carousel"
        containerStyle={{ marginVertical: SPACING.lg }}
      />
      
      {/* ... more content ... */}
    </ScrollView>
  )
}
```

---

## 📲 Using the Components

### Basic Usage - Carousel

```typescript
import CampaignsBanner from './components/CampaignsBanner'

<CampaignsBanner
  onCampaignPress={(campaign) => {
    // Handle campaign tap
    console.log('Campaign tapped:', campaign.id)
  }}
  onConversion={(campaignId, amount) => {
    // Handle offer applied
    console.log(`User spent $${amount} on campaign ${campaignId}`)
  }}
  limit={10}
  variant="carousel"
/>
```

### Grid Variant - List View

```typescript
<CampaignsBanner
  variant="grid"
  limit={5}
  onCampaignPress={handleCampaignPress}
/>
```

### Stacked Variant - Detailed List

```typescript
<CampaignsBanner
  variant="stacked"
  onCampaignPress={handleCampaignPress}
/>
```

---

## 📊 Tracking User Interactions

### View Tracking

Automatically tracked when campaign is displayed:

```typescript
// Happens automatically in CampaignCard
useEffect(() => {
  trackCampaignView() // Calls marketingService.recordCampaignView()
}, [campaign.id])
```

### Conversion Tracking

Tracked when user applies offer:

```typescript
const handleApplyOffer = async () => {
  await marketingService.recordCampaignConversion(
    campaign.id,
    amount,
    [{
      id: 'item_1',
      name: campaign.name,
      quantity: 1,
      price: amount
    }]
  )
}
```

### Custom Event Tracking

```typescript
// Track any custom action
import { analytics } from '../../../services/AnalyticsService'

analytics.trackEvent('campaign_interaction', {
  campaign_id: campaign.id,
  campaign_type: campaign.type,
  action: 'shared'
})
```

---

## 🔔 Handle Push Notifications

When user receives campaign notification:

```typescript
// src/services/NotificationHandler.ts
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { data } = notification.request.content
    
    if (data.campaign_id) {
      // Navigate to campaign
      navigation.navigate('CampaignDetail', {
        campaignId: data.campaign_id
      })
      
      // Track notification interaction
      analytics.trackEvent('notification_opened', {
        campaign_id: data.campaign_id,
        type: data.notification_type
      })
    }
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true
    }
  }
})
```

---

## 📱 Register Device Token

Register device for push notifications on app startup:

```typescript
// src/hooks/useNotificationSetup.ts
import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { dataService } from '../services/DataService'

export function useNotificationSetup(userId: string) {
  useEffect(() => {
    const registerDeviceToken = async () => {
      try {
        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync()
        
        if (status !== 'granted') {
          console.log('Notification permission denied')
          return
        }
        
        // Get device token
        const token = (
          await Notifications.getExpoPushTokenAsync()
        ).data
        
        // Register with backend
        await dataService.request('POST', '/api/notifications/device-token', {
          user_id: userId,
          device_token: token,
          platform: 'ios' // or 'android'
        })
        
        console.log('✅ Device token registered:', token)
      } catch (error) {
        console.error('Failed to register device token:', error)
      }
    }
    
    registerDeviceToken()
  }, [userId])
}

// Use in your main app component
export function App() {
  useNotificationSetup(currentUserId)
  
  return (
    // ... app content
  )
}
```

---

## 🎨 Customization

### Campaign Colors

Campaigns automatically get colors based on type:

```typescript
const getCampaignColor = (type: string) => {
  const colors: { [key: string]: string } = {
    vip: BRAND_COLORS.purple,        // 👑 VIP
    loyalty: BRAND_COLORS.orange,    // ⭐ Loyalty
    location: BRAND_COLORS.blue,     // 📍 Location
    reengagement: BRAND_COLORS.red,  // 🔄 Re-engagement
    welcome: BRAND_COLORS.green,     // 🎁 Welcome
    milestone: BRAND_COLORS.yellow,  // 🎯 Milestone
    challenge: BRAND_COLORS.pink     // 🎲 Challenge
  }
  return colors[type] || BRAND_COLORS.blue
}
```

### Campaign Icons

```typescript
const getCampaignIcon = (type: string) => {
  const icons: { [key: string]: string } = {
    vip: '👑',
    loyalty: '⭐',
    location: '📍',
    reengagement: '🔄',
    welcome: '🎁',
    milestone: '🎯',
    challenge: '🎲'
  }
  return icons[type] || '✨'
}
```

---

## 🧪 Testing

### Test Campaign Display

```bash
# Check that campaigns load
adb logcat | grep "Campaign"

# Should see:
# ✅ Fetched 5 campaigns
# ✅ Campaign view tracked
# ✅ Campaign conversion tracked
```

### Test Notifications

```bash
# Send test notification via admin portal
curl -X POST http://localhost:8000/api/notifications/send/push \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "device_token": "your_device_token",
    "title": "Test Campaign",
    "body": "Tap to see exclusive offer"
  }'
```

### Manual Testing Checklist

- [ ] Campaigns load on app startup
- [ ] Campaign carousel scrolls smoothly
- [ ] "Apply Offer" button works
- [ ] Conversion is tracked to backend
- [ ] View tracking works (check analytics)
- [ ] Push notifications open campaigns
- [ ] Device token is registered
- [ ] Offline mode handled gracefully

---

## 📈 Analytics Integration

Track all campaign interactions:

```typescript
// Marketing-specific events
analytics.trackEvent('campaign_viewed', {
  campaign_id: string,
  campaign_type: string,
  position: number
})

analytics.trackEvent('campaign_conversion', {
  campaign_id: string,
  campaign_type: string,
  amount: number,
  reward_type: string
})

analytics.trackEvent('campaign_shared', {
  campaign_id: string,
  platform: string
})

analytics.trackEvent('notification_received', {
  campaign_id: string,
  channel: 'push' | 'sms' | 'email'
})

analytics.trackEvent('notification_opened', {
  campaign_id: string,
  channel: 'push' | 'sms' | 'email'
})
```

---

## 🐛 Troubleshooting

### Campaigns Not Loading

**Problem**: CampaignsBanner shows empty state
**Solution**:
1. Check backend is running: `http://localhost:8000/api/marketing/campaigns`
2. Verify API URL in `MarketingAPIService`
3. Check network tab in dev tools
4. Review console logs for errors

### View Tracking Not Working

**Problem**: Views not incrementing in admin portal
**Solution**:
1. Verify `recordCampaignView()` is called
2. Check backend notification service logs
3. Ensure user ID is set correctly
4. Check database queries are executing

### Crashes on Campaign Tap

**Problem**: App crashes when accessing campaign detail
**Solution**:
1. Ensure Campaign detail screen exists
2. Check navigation props are passed correctly
3. Verify campaign data structure matches interface
4. Review error boundary logs

### Push Notifications Not Received

**Problem**: Campaign push notifications not arriving
**Solution**:
1. Verify device token is registered
2. Check notification permissions granted
3. Verify Firebase credentials are set
4. Check Twilio logs for SMS issues
5. Verify SendGrid for email delivery

---

## 🚀 Next Steps

After campaigns display is working:

1. **Analytics Dashboard** - View real-time campaign performance
2. **User Preferences** - Let users manage campaign notifications
3. **Deep Linking** - Link from notifications directly to campaigns
4. **A/B Testing** - Test different campaign variations
5. **Personalization** - Show campaigns based on user segment

---

## 📚 Component API Reference

### CampaignCard Props

```typescript
interface CampaignCardProps {
  campaign: Campaign
  onPress?: (campaign: Campaign) => void
  onConversion?: (campaignId: string, amount: number) => void
  variant?: 'card' | 'banner' | 'detailed'
}
```

### CampaignsBanner Props

```typescript
interface CampaignsBannerProps {
  onCampaignPress?: (campaign: Campaign) => void
  onConversion?: (campaignId: string, amount: number) => void
  containerStyle?: any
  limit?: number
  variant?: 'carousel' | 'grid' | 'stacked'
}
```

### Campaign Data Model

```typescript
interface Campaign {
  id: string
  name: string
  type: 'vip' | 'loyalty' | 'location' | 'reengagement' | 'welcome' | 'milestone' | 'challenge'
  content: string
  image?: string
  startDate: string
  endDate: string
  merchantNetwork?: string
  offerValue?: number
  offerType?: 'cashback' | 'discount' | 'points' | 'bonus'
  conversionRate?: number
  viewsCount?: number
  targetAudience?: string
}
```

---

**Time to Implement**: ~2-3 hours
**Complexity**: Medium
**Impact**: Critical - enables user engagement with campaigns

