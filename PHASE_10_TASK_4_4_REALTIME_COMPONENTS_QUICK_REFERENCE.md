// PHASE 10 TASK 4.4: REAL-TIME COMPONENTS QUICK REFERENCE

// ============================================================================
// GETTING STARTED WITH REAL-TIME UPDATES
// ============================================================================

### 1. Import the WebSocket Service

```typescript
import { 
  useRealtimeDashboard,
  useRealtimeData,
  useSessionUpdates,
  useQueueUpdates,
  useAgentStatusUpdates,
  useLiveMetrics
} from '@services/websocket';
```

### 2. Use in Your Component

The simplest approach - use one of the ready-made components:

```typescript
import DashboardOverviewRealtime from '@components/chat/DashboardOverviewRealtime';
import ActiveSessionsListRealtime from '@components/chat/ActiveSessionsListRealtime';
import WaitingSessionsQueueRealtime from '@components/chat/WaitingSessionsQueueRealtime';
import AgentPerformancePanelRealtime from '@components/chat/AgentPerformancePanelRealtime';
import CustomerSatisfactionMetricsRealtime from '@components/chat/CustomerSatisfactionMetricsRealtime';
import MessageAnalyticsRealtime from '@components/chat/MessageAnalyticsRealtime';

// In ChatDashboardPage.tsx
export const ChatDashboardPage: React.FC = () => {
  return (
    <div className="dashboard">
      <DashboardOverviewRealtime timeRangeHours={24} />
      <ActiveSessionsListRealtime timeRangeHours={24} limit={10} />
      <WaitingSessionsQueueRealtime />
      <AgentPerformancePanelRealtime limit={10} />
      <CustomerSatisfactionMetricsRealtime timeRangeHours={24} />
      <MessageAnalyticsRealtime timeRangeHours={24} />
    </div>
  );
};
```

// ============================================================================
// USING INDIVIDUAL HOOKS
// ============================================================================

### Hook 1: useRealtimeDashboard()

Purpose: Check if connected and get the manager instance

```typescript
const { isConnected, manager } = useRealtimeDashboard();

// Use in JSX
{isConnected ? (
  <span className="live-badge">
    <span className="pulse" />
    Live Updates
  </span>
) : (
  <span>Connecting...</span>
)}
```

Features:
- Initializes WebSocket connection on component mount
- Returns connection status
- Returns manager instance for manual operations
- Handles cleanup on unmount

### Hook 2: useRealtimeData<T>(dataType, onData?)

Purpose: Subscribe to any message type

```typescript
const { data, error } = useRealtimeData('custom_event', (newData) => {
  console.log('Custom event received:', newData);
});

// Or access through state
useRealtimeData('session_update', (sessions) => {
  setActiveSessions(sessions);
});
```

Features:
- Generic subscription system
- Optional callback for immediate updates
- State management built-in
- Error handling

### Hook 3: useSessionUpdates(sessionId)

Purpose: Monitor changes to a specific session

```typescript
const { session, newMessage, typingUsers } = useSessionUpdates(sessionId);

return (
  <div>
    <h3>Session {session?.id}</h3>
    {newMessage && <p>New message: {newMessage.text}</p>}
    {typingUsers.length > 0 && (
      <p>{typingUsers.join(', ')} are typing...</p>
    )}
  </div>
);
```

Subscribes to:
- session_update
- message_created
- typing_indicator

### Hook 4: useQueueUpdates()

Purpose: Monitor waiting customer queue

```typescript
const { queueDepth, sessions } = useQueueUpdates();

return (
  <div>
    <h2>Waiting: {queueDepth} customers</h2>
    {sessions?.map((session) => (
      <QueueItem key={session.id} session={session} />
    ))}
  </div>
);
```

Subscribes to:
- queue_depth_changed
- queue_updated

Update Frequency: Every 5 seconds (critical)

### Hook 5: useAgentStatusUpdates()

Purpose: Track agent availability in real-time

```typescript
const agentStatusMap = useAgentStatusUpdates();

const agentStatus = agentStatusMap.get(agentId);

return (
  <div>
    <span className={`status-${agentStatus}`}>
      {agentStatus?.toUpperCase()}
    </span>
  </div>
);
```

Returns: Map<agentId, status>
Statuses: 'active', 'idle', 'offline', 'in_call'

Subscribes to:
- agent_status_changed

### Hook 6: useLiveMetrics()

Purpose: Get dashboard metrics in real-time

```typescript
const metrics = useLiveMetrics();

return (
  <div className="stats">
    <StatCard label="Total Sessions" value={metrics?.total_sessions} />
    <StatCard label="Active" value={metrics?.active_sessions} />
    <StatCard label="Waiting" value={metrics?.waiting_sessions} />
  </div>
);
```

Subscribes to:
- metrics_updated

Update Frequency: Every 10 seconds

// ============================================================================
// REQUEST FUNCTIONS FOR ON-DEMAND DATA
// ============================================================================

Import:
```typescript
import { 
  requestSessionUpdate,
  requestQueueUpdate,
  requestMetricsUpdate
} from '@services/websocket';
```

### requestSessionUpdate(sessionId)

```typescript
const handleRefresh = async () => {
  await requestSessionUpdate(sessionId);
  // Server will respond with latest session data
};

// In JSX
<button onClick={handleRefresh}>
  Refresh Sessions
</button>
```

### requestQueueUpdate()

```typescript
const handleRefresh = async () => {
  await requestQueueUpdate();
  // Server will respond with updated queue
};
```

### requestMetricsUpdate()

```typescript
const handleRefresh = async () => {
  await requestMetricsUpdate();
  // Server will respond with fresh metrics
};
```

// ============================================================================
// STYLING REAL-TIME COMPONENTS
// ============================================================================

CSS Classes Available:

```css
/* Live status */
.live-badge { }           /* Green live indicator */
.live-badge.critical { }  /* Red critical indicator */
.pulse { }                /* Pulsing dot */
.live-dot { }             /* Status indicator */

/* Components */
.live { }                 /* Component when connected */
.table-row.live { }       /* Table row animated */
.stat-card.live { }       /* Stat card highlighted */
.queue-item.live { }      /* Queue item glowing */

/* States */
.loading { }              /* Loading state */
.disconnected { }         /* Disconnected state */
.empty-state.success { }  /* No data state */
```

Example: Style a component while connected

```typescript
<div className={`dashboard ${isConnected ? 'live' : ''}`}>
  {isConnected && (
    <span className="live-badge">
      <span className="pulse" />
      Live Updates
    </span>
  )}
</div>
```

// ============================================================================
// HANDLING DISCONNECTIONS & ERRORS
// ============================================================================

### Auto-Reconnection

The WebSocket manager automatically reconnects if connection drops:

```
Attempt 1: Wait 3 seconds
Attempt 2: Wait 6 seconds
Attempt 3: Wait 12 seconds
Attempt 4: Wait 24 seconds
Attempt 5: Wait 48 seconds
After 5 failed attempts: Give up and log error
```

You can handle reconnection in your component:

```typescript
const { isConnected } = useRealtimeDashboard();

useEffect(() => {
  if (!isConnected) {
    // Show reconnecting UI
    console.log('Reconnecting...');
  }
}, [isConnected]);
```

### Fallback Polling

All real-time components have fallback polling:

- ActiveSessions: 30-second fallback polling
- WaitingQueue: 3-second fallback polling (critical)
- Other components: Component-specific polling

Fallback triggers automatically when:
- WebSocket not connected
- WebSocket unavailable
- User manually requests refresh

### Error Handling

```typescript
const { data, error } = useRealtimeData('event_type');

if (error) {
  return <ErrorMessage message={error} />;
}

if (!data) {
  return <LoadingSpinner />;
}

return <DataDisplay data={data} />;
```

// ============================================================================
// INTEGRATION PATTERN (DO THIS FOR CUSTOM COMPONENTS)
// ============================================================================

If you need to create a new real-time component, follow this pattern:

```typescript
import React, { useEffect, useState } from 'react';
import { useRealtimeDashboard, useRealtimeData } from '@services/websocket';
import { apiClient } from '@services/api';

interface MyComponentProps {
  // Your props
}

const MyRealTimeComponent: React.FC<MyComponentProps> = (props) => {
  const [data, setData] = useState<DataType | null>(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealtimeDashboard();

  // Initial fetch from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/v1/endpoint');
        setData(response.data);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Subscribe to real-time updates
  useRealtimeData('event_type', (newData) => {
    setData(newData);
    setLastUpdate(new Date().toLocaleTimeString());
  });

  if (loading && !data) {
    return <div>Loading...</div>;
  }

  return (
    <div className={isConnected ? 'live' : ''}>
      {isConnected && (
        <>
          <span className="live-badge">
            <span className="pulse" />
            Live Updates
          </span>
          <span className="last-update">Updated: {lastUpdate}</span>
        </>
      )}
      {/* Your component content */}
    </div>
  );
};

export default MyRealTimeComponent;
```

Key points:
1. Initial API fetch for data
2. useRealtimeDashboard() for connection status
3. useRealtimeData() for subscriptions
4. Show live indicator when isConnected
5. Update timestamp on each update
6. Handle loading state

// ============================================================================
// TESTING REAL-TIME UPDATES
// ============================================================================

### Manual Testing

1. Start the backend server:
```bash
cd swipesavvy-ai-agents
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start the admin portal:
```bash
cd swipesavvy-admin-portal
npm run dev
```

3. Open browser console (F12)

4. Navigate to chat dashboard

5. Check console for logs:
```
✅ WebSocket service initialized
✅ Connected to dashboard WebSocket
✅ Auth successful
✅ Message received: metrics_updated
```

6. Verify live badge appears

7. Check that data updates every 5-10 seconds

### Debugging

Enable verbose logging:

```typescript
// In websocket.ts manager
private handleMessage(message: any) {
  console.log('WebSocket message received:', message); // Add this
  // ... rest of handler
}
```

Monitor network tab:
- Open DevTools > Network > WS
- Should see single WebSocket connection
- Messages should flow continuously
- No ERR_WEBSOCKET errors

Monitor timeline:
- Real-time updates should arrive every 5-10 seconds
- No gaps > 30 seconds (heartbeat keeps alive)
- No connection disconnects

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

1. Use specific hooks instead of generic useRealtimeData
   - useQueueUpdates() instead of useRealtimeData('queue_updated')
   - Provides better type safety and convenience

2. Avoid subscribing to same event multiple times
   - Use shared state management if multiple components need same data
   - Or lift state up to parent

3. Memoize callbacks to prevent unnecessary re-renders
```typescript
const handleData = useCallback((newData) => {
  setData(newData);
}, []);

useRealtimeData('event_type', handleData);
```

4. Use shouldComponentUpdate or React.memo for expensive components
```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexChart data={data} />;
});
```

5. Disable animations on low-end devices
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

// ============================================================================
// COMMON PATTERNS
// ============================================================================

### Pattern 1: Live Count Display

```typescript
const LiveCount: React.FC<{label: string}> = ({ label }) => {
  const metrics = useLiveMetrics();
  const { isConnected } = useRealtimeDashboard();
  
  return (
    <div className={`count-card ${isConnected ? 'live' : ''}`}>
      {isConnected && <span className="live-dot" />}
      <span className="label">{label}</span>
      <span className="value">{metrics?.count}</span>
    </div>
  );
};
```

### Pattern 2: Live Table with Updates

```typescript
const LiveTable: React.FC<{columns: Column[]}> = ({ columns }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const { isConnected } = useRealtimeDashboard();
  
  useRealtimeData('row_updated', (updatedRows) => {
    setRows(updatedRows);
  });
  
  return (
    <table className={isConnected ? 'live' : ''}>
      {/* Table with live-class on rows */}
    </table>
  );
};
```

### Pattern 3: Live Status Indicator

```typescript
const LiveStatus: React.FC<{agentId: string}> = ({ agentId }) => {
  const statusMap = useAgentStatusUpdates();
  const status = statusMap.get(agentId);
  
  return (
    <div className="status-indicator">
      <div className={`dot status-${status}`} />
      <span>{status?.toUpperCase()}</span>
    </div>
  );
};
```

### Pattern 4: Live Form with Updates

```typescript
const LiveForm: React.FC<{sessionId: string}> = ({ sessionId }) => {
  const { session } = useSessionUpdates(sessionId);
  const { isConnected } = useRealtimeDashboard();
  
  useEffect(() => {
    if (session?.updated) {
      // Form data updated from server
      updateForm(session);
    }
  }, [session]);
  
  return (
    <form>
      {isConnected && <span className="sync-indicator">Syncing...</span>}
      {/* Form fields */}
    </form>
  );
};
```

// ============================================================================
// READY TO USE!
// ============================================================================

All 6 enhanced components are fully functional and ready to integrate
into your ChatDashboardPage component. No further implementation needed.

Just import them and add to your dashboard page JSX!
