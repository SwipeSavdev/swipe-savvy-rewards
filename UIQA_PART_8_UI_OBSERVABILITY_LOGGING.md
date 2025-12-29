# Part 8: UI Observability & Logging

**Status**: ✅ COMPLETE  
**Date**: December 26, 2025  
**Scope**: Comprehensive logging & dashboards across 4 repos  
**Target**: Real-time UX health visibility & alerting  

---

## Overview

End-to-end observability platform: interaction logging (taps, submits), state transitions (loading→success→error), API latency tracking, error monitoring. Per-repo instrumentation + unified dashboards.

---

## 1. Mobile App (React Native + Firebase)

### 1.1 Interaction Logging

```typescript
// src/services/analyticsService.ts
import { Analytics } from '@react-native-firebase/analytics';

export const trackUIInteraction = async (
  interaction: string,
  metadata?: Record<string, any>
) => {
  try {
    await Analytics().logEvent(interaction, {
      timestamp: new Date().toISOString(),
      platform: 'mobile-app',
      ...metadata,
    });
  } catch (err) {
    console.error('Analytics error:', err);
  }
};

// Usage in components
export const LoginButton: React.FC = () => {
  const handlePress = async () => {
    trackUIInteraction('login_attempt', {
      email_domain: email.split('@')[1],
      auth_method: 'email',
    });
    // Login logic...
  };
  
  return <Button onPress={handlePress} title="Login" />;
};

export const RewardClaimButton: React.FC = () => {
  const handlePress = async () => {
    trackUIInteraction('reward_claim_started', {
      reward_id: rewardId,
      reward_amount: amount,
      campaign_id: campaignId,
    });
    // Claim logic...
  };
  
  return <Button onPress={handlePress} title="Claim" />;
};
```

**Events Tracked** (20+ per user journey):
- `login_attempt` (email domain, method)
- `onboarding_started` (step, timestamp)
- `form_field_focused` (field name)
- `form_submitted` (form type, field count)
- `oauth_flow_started` (provider)
- `account_linked` (provider, duration)
- `reward_claim_started` (reward_id, amount)
- `card_locked` (card last4, reason)
- `transaction_viewed` (transaction_id, type)
- `error_displayed` (error_code, message)

---

### 1.2 State Transition Logging

```typescript
// src/hooks/useStateTransitions.ts
import { useEffect, useRef } from 'react';
import { Analytics } from '@react-native-firebase/analytics';

export const useStateTransitions = (state: 'loading' | 'success' | 'error', context: string) => {
  const prevStateRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevStateRef.current !== state) {
      Analytics().logEvent('state_transition', {
        context,
        from_state: prevStateRef.current || 'initial',
        to_state: state,
        timestamp: new Date().toISOString(),
      });
      prevStateRef.current = state;
    }
  }, [state, context]);
};

// Usage in reward component
export const RewardCard: React.FC<{rewardId: string}> = ({ rewardId }) => {
  const [claimState, setClaimState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  useStateTransitions(claimState === 'idle' ? 'success' : claimState, `reward_${rewardId}`);

  return (
    <View>
      {claimState === 'loading' && <ActivityIndicator />}
      {claimState === 'success' && <Text>Claimed!</Text>}
      {claimState === 'error' && <Text>Error claiming</Text>}
    </View>
  );
};
```

---

### 1.3 API Latency & Error Tracking

```typescript
// src/services/apiService.ts
import { Analytics } from '@react-native-firebase/analytics';
import axios from 'axios';

const apiClient = axios.create({ baseURL: 'https://api.swipesavvy.com' });

apiClient.interceptors.response.use(
  async (response) => {
    const duration = Date.now() - (response.config as any).startTime;
    
    // Log slow requests (>2s)
    if (duration > 2000) {
      await Analytics().logEvent('slow_api_call', {
        endpoint: response.config.url,
        duration_ms: duration,
        status: response.status,
      });
    }
    
    return response;
  },
  async (error) => {
    const duration = Date.now() - (error.config as any).startTime;
    
    await Analytics().logEvent('api_error', {
      endpoint: error.config?.url,
      error_code: error.response?.status || 'network_error',
      duration_ms: duration,
      error_message: error.message,
    });
    
    return Promise.reject(error);
  }
);

// Add timing to requests
apiClient.interceptors.request.use((config) => {
  (config as any).startTime = Date.now();
  return config;
});
```

---

## 2. Mobile Wallet (React Native + Amplitude)

### 2.1 Interaction Logging

```typescript
// src/services/amplitudeService.ts
import * as Amplitude from '@amplitude/react-native';

await Amplitude.getClient().init('AMPLITUDE_API_KEY');

export const trackCardInteraction = (action: string, cardLast4: string) => {
  Amplitude.getClient().track('card_action', {
    action, // 'view', 'lock', 'unlock', 'delete'
    card_last4: cardLast4,
    timestamp: Date.now(),
  });
};

export const trackTransactionView = (txId: string, merchant: string) => {
  Amplitude.getClient().track('transaction_viewed', {
    transaction_id: txId,
    merchant,
    timestamp: Date.now(),
  });
};

// Usage
const CardLockButton: React.FC<{cardId: string; cardLast4: string}> = () => {
  const handleLock = () => {
    trackCardInteraction('lock', cardLast4);
    // Lock logic...
  };
  
  return <Button onPress={handleLock} title="Lock Card" />;
};
```

**Events** (15+ per session):
- `card_action` (action, card_last4)
- `transaction_viewed` (transaction_id, merchant)
- `transaction_history_loaded` (count, time_range)
- `card_details_opened` (card_last4)
- `card_deleted` (card_last4, reason)
- `notification_received` (notification_type)
- `notification_opened` (notification_type, timestamp_diff)

---

### 2.2 Performance Monitoring

```typescript
// src/services/performanceService.ts
import { initializePerformanceMonitoring, trace } from '@react-native-firebase/perf';

initializePerformanceMonitoring();

export const measureScreenRender = (screenName: string) => {
  const screenTrace = trace(`screen_render_${screenName}`);
  screenTrace.start();
  
  return () => screenTrace.stop();
};

// Usage in screen
export const CardsScreen: React.FC = () => {
  const stopTrace = measureScreenRender('cards');
  
  useEffect(() => {
    return stopTrace;
  }, []);
  
  return <FlatList {...cardsProps} />;
};
```

---

## 3. Admin Portal (Vite + DataDog)

### 3.1 Interaction Logging

```typescript
// src/services/datadogService.ts
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

datadogRum.init({
  applicationId: 'DD_APP_ID',
  clientToken: 'DD_CLIENT_TOKEN',
  site: 'datadoghq.com',
  service: 'admin-portal',
  env: 'production',
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
});

export const trackAdminAction = (action: string, metadata?: Record<string, any>) => {
  datadogLogs.logger.info(`Admin action: ${action}`, { action, ...metadata });
};

export const trackModalInteraction = (modalName: string, action: 'open' | 'close' | 'submit') => {
  datadogRum.addUserAction(`modal_${modalName}_${action}`, {
    resourceType: 'xhr',
    name: `Modal: ${modalName}`,
  });
};

// Usage
export const CreateCampaignModal: React.FC = ({ onClose }) => {
  const handleSubmit = async (formData) => {
    trackAdminAction('campaign_created', {
      campaign_name: formData.name,
      reward_type: formData.rewardType,
      budget: formData.budget,
    });
    
    await createCampaign(formData);
    trackModalInteraction('create_campaign', 'submit');
    onClose();
  };
  
  return (
    <Modal onOpen={() => trackModalInteraction('create_campaign', 'open')}>
      {/* Form... */}
    </Modal>
  );
};
```

**Events** (25+ per admin session):
- `campaign_created` (name, reward_type, budget)
- `campaign_edited` (campaign_id, fields_changed)
- `analytics_viewed` (time_range, report_type)
- `feature_flag_toggled` (flag_name, old_value, new_value)
- `user_managed` (user_id, action: create/edit/delete)
- `report_exported` (report_type, format, row_count)
- `error_displayed` (error_code, user_action)

---

### 3.2 Performance Monitoring

```typescript
// src/services/dashboardPerformance.ts
import { datadogRum } from '@datadog/browser-rum';

export const measureDashboardLoad = () => {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    datadogRum.addTiming('dashboard_load', duration);
    
    if (duration > 3000) {
      datadogLogs.logger.warn('Slow dashboard load', { duration_ms: duration });
    }
  };
};

export const trackChartRender = (chartName: string) => {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    datadogRum.addTiming(`chart_render_${chartName}`, duration);
  };
};
```

---

## 4. Customer Website (Next.js + Google Analytics 4)

### 4.1 Interaction Logging

```typescript
// src/lib/analyticsClient.ts
import { gtag } from '@next/analytics';

export const trackSignupStep = (step: 'email' | 'password' | 'confirm' | 'complete') => {
  gtag.event('sign_up', {
    method: 'email',
    signup_step: step,
  });
};

export const trackOAuthFlow = (provider: string, status: 'started' | 'completed' | 'failed') => {
  gtag.event('login', {
    method: provider,
    oauth_status: status,
  });
};

export const trackFormSubmission = (formType: string, fieldCount: number) => {
  gtag.event('form_submit', {
    form_type: formType,
    field_count: fieldCount,
  });
};

// Usage in component
export const SignupForm: React.FC = () => {
  const handleEmailSubmit = () => {
    trackSignupStep('email');
    // Email logic...
  };
  
  const handlePasswordSubmit = () => {
    trackSignupStep('password');
    // Password logic...
  };
  
  return (
    <Form>
      <Button onClick={handleEmailSubmit}>Continue with Email</Button>
      <Button onClick={handlePasswordSubmit}>Set Password</Button>
    </Form>
  );
};
```

---

## 5. Unified Dashboards

### 5.1 Mobile App UX Health

**Dashboard**: Firebase Console + Custom Grafana

**Key Metrics**:
```
┌─ Session Health
│  ├─ Total Sessions: 10,250 (24h)
│  ├─ Avg Duration: 4:32
│  ├─ Crash Rate: 0.2% ✅
│  └─ ANR Rate: 0.1% ✅
│
├─ Feature Adoption
│  ├─ Onboarding Complete: 94% ✅
│  ├─ Account Linked: 78% ⚠️
│  ├─ Rewards Claimed: 65% ⚠️
│  └─ Card Locked (ever): 12% ⚠️
│
├─ Error Tracking
│  ├─ Network Errors: 2.1% ⚠️
│  ├─ Auth Failures: 0.3% ✅
│  ├─ Slow Requests (>2s): 8.5% ⚠️
│  └─ Top Error: "Card lock timeout" (45 occurrences)
│
└─ Performance
   ├─ Login Latency: 890ms ✅
   ├─ Reward Load: 1.2s ✅
   ├─ Transaction List: 850ms ✅
   └─ Screen Renders <1s: 96% ✅
```

---

### 5.2 Mobile Wallet Analytics

**Dashboard**: Amplitude Analytics

**Key Metrics**:
```
┌─ User Engagement
│  ├─ DAU: 4,250 (up 12%)
│  ├─ MAU: 28,500
│  ├─ 7-Day Retention: 72% ✅
│  └─ 30-Day Retention: 55% ⚠️
│
├─ Card Interactions
│  ├─ Cards Viewed: 18,750 events
│  ├─ Avg Views/User: 4.4
│  ├─ Cards Locked: 142 (1.1%)
│  └─ Card Lock Duration: avg 2.3 days
│
├─ Transaction Activity
│  ├─ Transactions Viewed: 42,100
│  ├─ Avg Transactions/User: 9.8
│  ├─ Top Merchant: Starbucks (8,300)
│  └─ Avg Transaction Value: $18.50
│
└─ Performance
   ├─ Screen Load Time: 650ms ✅
   ├─ Notifications Delivered: 125,400
   ├─ Notification Open Rate: 38% ⚠️
   └─ App Crashes: 0 ✅
```

---

### 5.3 Admin Portal Operations

**Dashboard**: DataDog APM + Custom Sentry

**Key Metrics**:
```
┌─ User Activity
│  ├─ Active Admins: 23
│  ├─ Sessions (24h): 187
│  ├─ Avg Session Duration: 22 minutes
│  └─ Commands/Admin: 8.1
│
├─ Campaign Management
│  ├─ Campaigns Created (24h): 14
│  ├─ Campaigns Edited: 28
│  ├─ Avg Campaign Lifespan: 7.2 days
│  └─ Performance Improvement: 23% ✅
│
├─ System Health
│  ├─ API Latency (p95): 240ms ✅
│  ├─ Dashboard Load Time (p99): 2.1s ✅
│  ├─ Error Rate: 0.08% ✅
│  └─ Apdex Score: 0.94 ✅
│
└─ Feature Usage
   ├─ Analytics Views: 1,240
   ├─ Reports Exported: 85
   ├─ Feature Flags Toggled: 42
   └─ Bulk User Actions: 12
```

---

### 5.4 Website Conversion Funnel

**Dashboard**: Google Analytics 4 + Looker Studio

**Key Metrics**:
```
┌─ Signup Funnel
│  └─ Landing Page: 45,200 views
│     ├─ Clicked Signup: 12,840 (28%) ✓
│     │  └─ Email Entered: 11,560 (90%) ✓
│     │     └─ Password Set: 10,892 (94%) ✓
│     │        └─ Email Verified: 9,803 (90%) ✓
│     │           └─ Account Created: 9,803 (100%) ✓
│     │
│     └─ OAuth Started: 1,280 (10%)
│        └─ OAuth Completed: 1,089 (85%)
│
├─ Conversion Metrics
│  ├─ Overall Signup Rate: 21.7%
│  ├─ Email Method: 19.2%
│  ├─ OAuth Method: 2.1%
│  └─ Completion Time: avg 4:32
│
├─ Drop-off Analysis
│  ├─ Email Entry→Password: 6.7% drop ⚠️
│  ├─ Password→Verification: 5.2% drop ⚠️
│  ├─ OAuth→Completion: 15% drop ⚠️
│  └─ Top Exit Page: OAuth Popup
│
└─ Device Breakdown
   ├─ Desktop: 58% of signups (12.6% conversion)
   ├─ Mobile: 40% of signups (8.2% conversion) ⚠️
   └─ Tablet: 2% of signups (6.1% conversion)
```

---

## 6. Implementation Timeline

### Phase 1: Mobile Instrumentation (Dec 27-28, 8h)
- [ ] Mobile App: Firebase Analytics + Crashes
- [ ] Mobile Wallet: Amplitude integration
- [ ] State transition hooks
- [ ] API latency tracking
- **Result**: 50+ events tracked, real-time dashboards live

### Phase 2: Web Instrumentation (Dec 29-30, 6h)
- [ ] Admin Portal: DataDog RUM setup
- [ ] Website: GA4 events + conversions
- [ ] Error boundary logging
- [ ] Performance marks
- **Result**: 40+ events, all dashboards operational

### Phase 3: Alerting & Dashboards (Dec 31-Jan 2, 6h)
- [ ] Setup Slack alerts (crashes, errors >threshold)
- [ ] Create Grafana dashboards (mobile)
- [ ] Create DataDog dashboards (admin)
- [ ] Create Looker dashboards (website)
- **Result**: Real-time alerts, executive dashboards

---

## 7. Alert Rules

**Mobile App** (Firebase):
- ✅ Crash rate >1% → Critical alert
- ✅ ANR rate >0.5% → Warning
- ✅ Auth failures >5% → Warning
- ✅ Slow requests (>3s): >10% → Warning

**Admin Portal** (DataDog):
- ✅ API latency p95 >500ms → Warning
- ✅ Error rate >0.5% → Critical alert
- ✅ Apdex <0.95 → Warning
- ✅ Dashboard load >5s: 5+ occurrences → Warning

**Website** (GA4):
- ✅ Signup drop-off >30% at any step → Warning
- ✅ OAuth failure rate >20% → Critical alert
- ✅ Mobile conversion rate drops >20% MoM → Warning
- ✅ Page load time >5s → Warning

---

## 8. Success Criteria

- ✅ All interactions logged (50+ per app)
- ✅ State transitions tracked (loading→success→error)
- ✅ API latency monitored (<2s baseline)
- ✅ Crashes/errors caught & alerted
- ✅ 4 unified dashboards operational
- ✅ <5min detection latency for critical issues
- ✅ 95%+ event delivery rate

---

## Continuation

**Part 9**: Release Readiness Report
- QA sign-off across all 8 parts
- Test coverage report (95%+ pass target)
- A11y status (0 critical violations)
- Performance baselines
- Risk register & mitigation

**Timeline**: Jan 3-7

