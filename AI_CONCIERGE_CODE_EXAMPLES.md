# AI Concierge - Code Examples & Integration Patterns

## 1. Using DataService in Components

### Basic Data Fetching
```typescript
import { DataService } from '@ai-sdk/services/DataService';

// Initialize service
const dataService = new DataService(
  'http://localhost:8002/api/v1',
  accessToken,
  userId
);

// Fetch user context
const context = await dataService.getUserContext();
console.log(`User: ${context.user.name}`);
console.log(`Total Balance: $${context.totalBalance.toFixed(2)}`);
```

### Getting Specific Data
```typescript
// Just get accounts
const accounts = await dataService.getAccounts();

// Just get transactions
const transactions = await dataService.getRecentTransactions(10);

// Just get rewards
const rewards = await dataService.getRewards();

// Search transactions
const amazonPurchases = await dataService.searchTransactions('amazon');
```

---

## 2. Using Enhanced AIClient

### Get User Context
```typescript
import { useAIClient } from '@ai-sdk/AIProvider';

function MyComponent() {
  const aiClient = useAIClient();
  
  // Auto-fetch context
  const context = await aiClient.getUserContext();
  
  // Use context for system prompt
  const systemPrompt = aiClient.buildSystemPrompt(context);
  
  // Send message
  const stream = await aiClient.chat({
    message: "What's my balance?",
    session_id: sessionId
  });
}
```

### Refresh Context Mid-Conversation
```typescript
// Refresh user data during conversation
await aiClient.refreshUserContext();

// The next message will use fresh data
const stream = await aiClient.chat({
  message: "Did any new transactions come in?",
  session_id: sessionId
});
```

### Build Custom System Prompt
```typescript
const context = await aiClient.getUserContext();
const customPrompt = aiClient.buildSystemPrompt(context);

// Customize further if needed
const enhancedPrompt = customPrompt + `

SPECIAL INSTRUCTIONS:
- User is a frequent traveler, prioritize travel rewards
- Be extra helpful about booking flights
- Suggest travel insurance options`;

// Use custom prompt in requests
```

---

## 3. Using Enhanced useAIChat Hook

### Basic Usage with Auto Context
```typescript
import { useAIChat } from '@ai-sdk/hooks/useAIChat';

function ChatComponent() {
  // Auto-fetches context on mount
  const { 
    messages, 
    isLoading, 
    sendMessage,
    contextLoaded 
  } = useAIChat({
    autoFetchContext: true, // Fetch on mount
    sessionId: 'my-chat-session'
  });

  return (
    <View>
      {!contextLoaded && <Text>Loading financial data...</Text>}
      
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text>{item.content}</Text>}
      />
      
      <Input 
        onSubmit={(text) => sendMessage(text)}
        disabled={isLoading}
      />
    </View>
  );
}
```

### Refresh Context During Chat
```typescript
function ChatWithRefresh() {
  const { 
    messages, 
    sendMessage,
    refreshContext,
    contextLoaded
  } = useAIChat();

  const handleRefreshClick = async () => {
    // User clicked "Check for new transactions"
    await refreshContext();
    
    // Now send message with fresh data
    await sendMessage("Any new transactions?");
  };

  return (
    <View>
      <Button onPress={handleRefreshClick}>
        Refresh Data
      </Button>
      
      {/* Display messages */}
    </View>
  );
}
```

### Custom Options
```typescript
const { messages, sendMessage } = useAIChat({
  sessionId: 'user-123-chat',
  autoFetchContext: true,
  onError: (error) => {
    console.error('Chat failed:', error);
    // Show error to user
  }
});
```

---

## 4. In ChatScreen

### With Context Loading
```typescript
import { useAIChat } from '@ai-sdk/hooks/useAIChat';

export function ChatScreen() {
  const { 
    messages, 
    isLoading, 
    currentResponse, 
    sendMessage,
    contextLoaded 
  } = useAIChat({
    onError: (error) => console.error('Chat error:', error)
  });

  const quickActions = [
    {
      id: '1',
      label: 'Check Balance',
      prompt: "What's my current balance?"
    },
    {
      id: '2',
      label: 'Recent Transactions',
      prompt: 'Show my recent transactions'
    },
    {
      id: '3',
      label: 'Spending Analysis',
      prompt: 'How much did I spend this month?'
    }
  ];

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* Show loading while context is being fetched */}
      {!contextLoaded && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#235393" />
          <Text>Loading your financial data...</Text>
        </View>
      )}

      {/* Show quick actions */}
      {messages.length === 0 && (
        <QuickActions
          actions={quickActions}
          onAction={(action) => sendMessage(action.prompt)}
        />
      )}

      {/* Chat messages */}
      <FlatList
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={(item) => item.id}
      />

      {/* Typing indicator while waiting for response */}
      {isLoading && <TypingIndicator text={currentResponse} />}

      {/* Chat input */}
      <ChatInput 
        onSend={sendMessage} 
        disabled={isLoading}
      />
    </KeyboardAvoidingView>
  );
}
```

---

## 5. Building Custom AI Features

### Transaction Analysis
```typescript
import { DataService } from '@ai-sdk/services/DataService';

async function analyzeSpending(userId: string, accessToken: string) {
  const dataService = new DataService(
    'http://localhost:8002/api/v1',
    accessToken,
    userId
  );

  // Get user context
  const context = await dataService.getUserContext();
  
  // Get detailed analytics
  const analytics = await dataService.getSpendingAnalytics();
  
  // Build analysis message
  const analysis = `
Spending Analysis:
- Daily average: $${analytics.daily.toFixed(2)}
- Weekly total: $${analytics.weekly.toFixed(2)}
- Monthly total: $${analytics.monthly.toFixed(2)}

Top Categories:
${analytics.topCategories
  .map(cat => `- ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage}%)`)
  .join('\n')}

Year-to-date: $${context.totalBalance.toFixed(2)}
  `;
  
  return analysis;
}
```

### Smart Recommendations
```typescript
async function getRecommendations(context: AIUserContext) {
  const recommendations = [];

  // Check rewards usage
  if (context.rewards.some(r => r.name.includes('Fuel'))) {
    recommendations.push({
      title: 'Maximize Fuel Rewards',
      description: 'You have 2× points on fuel. Your next fuel purchase will earn double!'
    });
  }

  // Check savings potential
  if (context.monthlySpending > 2000) {
    recommendations.push({
      title: 'Consider a Savings Goal',
      description: 'Your monthly spending is high. Setting a goal could help.'
    });
  }

  // Check linked banks
  const pendingBanks = context.linkedBanks.filter(b => b.status === 'pending');
  if (pendingBanks.length > 0) {
    recommendations.push({
      title: 'Complete Bank Linking',
      description: `You have ${pendingBanks.length} pending bank connections.`
    });
  }

  return recommendations;
}
```

### Transaction Search
```typescript
async function searchAndAnalyze(
  userId: string,
  accessToken: string,
  searchQuery: string
) {
  const dataService = new DataService(
    'http://localhost:8002/api/v1',
    accessToken,
    userId
  );

  // Search transactions
  const results = await dataService.searchTransactions(searchQuery, 10);
  
  // Analyze results
  const total = results.reduce((sum, t) => sum + t.amount, 0);
  const count = results.length;
  const avgTransaction = total / count;

  return {
    query: searchQuery,
    found: count,
    total: total,
    average: avgTransaction,
    transactions: results,
    summary: `Found ${count} transactions for "${searchQuery}" totaling $${Math.abs(total).toFixed(2)}`
  };
}
```

---

## 6. Error Handling Patterns

### Graceful Degradation
```typescript
export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Try to fetch context
        const aiClient = useAIClient();
        const context = await aiClient.getUserContext();
        
        if (!context) {
          console.warn('Using mock data, API unavailable');
          // Continue with mock data
        }
      } catch (error) {
        // API failed, but chat still works
        setError('Using offline mode with mock data');
        console.error('Failed to fetch context:', error);
        // App continues functioning
      }
    };
    
    initializeChat();
  }, []);

  return (
    <View>
      {error && <Text style={styles.warning}>{error}</Text>}
      {/* Chat continues to work */}
    </View>
  );
}
```

### Request Retry
```typescript
async function fetchWithRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3
) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed, retrying...`);
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  
  throw lastError;
}

// Usage
const context = await fetchWithRetry(() => 
  dataService.getUserContext()
);
```

---

## 7. Testing Examples

### Test DataService
```typescript
import { DataService } from '@ai-sdk/services/DataService';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    service = new DataService(
      'http://localhost:8002/api/v1',
      'test-token',
      'test-user'
    );
  });

  it('should fetch and cache user context', async () => {
    const context1 = await service.getUserContext();
    const context2 = await service.getUserContext();
    
    // Should return cached data (not make second request)
    expect(context1).toEqual(context2);
  });

  it('should calculate monthly spending', async () => {
    const context = await service.getUserContext();
    
    expect(context.monthlySpending).toBeGreaterThan(0);
    expect(context.monthlySpending).toBeLessThan(100000);
  });

  it('should search transactions', async () => {
    const results = await service.searchTransactions('amazon');
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(10);
  });
});
```

### Test useAIChat
```typescript
describe('useAIChat', () => {
  it('should auto-fetch context on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useAIChat({ autoFetchContext: true })
    );
    
    await waitForNextUpdate();
    
    expect(result.current.contextLoaded).toBe(true);
  });

  it('should send message with context', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useAIChat({ autoFetchContext: true })
    );
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.sendMessage("What's my balance?");
    });
    
    await waitForNextUpdate();
    
    expect(result.current.messages.length).toBeGreaterThan(0);
  });
});
```

---

## 8. Configuration Examples

### Environment Variables
```bash
# .env file
AI_API_BASE_URL=http://localhost:8002/api/v1
MOCK_API=false
CACHE_DURATION=300000  # 5 minutes
```

### App Configuration
```typescript
// app.json
{
  "expo": {
    "extra": {
      "AI_API_BASE_URL": "http://localhost:8002/api/v1",
      "MOCK_API": false
    }
  }
}
```

### DataService Options
```typescript
// Custom cache duration
const dataService = new DataService(
  'http://localhost:8002/api/v1',
  accessToken,
  userId
);

// Clear cache manually
dataService.clearCache();

// Or extend cache duration
const context = await dataService.getUserContext();
// Data cached for 5 minutes by default
```

---

## 9. Performance Optimization

### Efficient Caching
```typescript
// Cache hit (same object, no API call)
const context1 = await dataService.getUserContext();
const context2 = await dataService.getUserContext();
// context1 === context2 (same reference)

// Cache miss (5+ minutes since first fetch)
setTimeout(async () => {
  const context3 = await dataService.getUserContext();
  // context3 !== context1 (new API call made)
}, 6 * 60 * 1000);

// Force refresh
await dataService.refreshUserContext(); // New API call
```

### Parallel Data Fetching
```typescript
// BAD: Sequential (slow)
const profile = await dataService.getUserProfile();
const accounts = await dataService.getAccounts();
const cards = await dataService.getCards();

// GOOD: Parallel (fast - all done at same time)
const [profile, accounts, cards, transactions] = await Promise.all([
  dataService.getUserProfile(),
  dataService.getAccounts(),
  dataService.getCards(),
  dataService.getRecentTransactions()
]);
```

---

## 10. Real-World Usage Scenarios

### Scenario 1: User Opens AI Chat
```typescript
// 1. Component mounts
<ChatScreen />

// 2. Hook initializes with auto-fetch
useAIChat({ autoFetchContext: true })

// 3. DataService fetches data in parallel
// - GET /api/v1/users/123
// - GET /api/v1/users/123/accounts
// - GET /api/v1/users/123/cards
// - GET /api/v1/users/123/transactions
// - GET /api/v1/users/123/rewards
// - GET /api/v1/users/123/linked-banks

// 4. Loading indicator shows: "Loading your financial data..."

// 5. Data cached in memory (5 minutes)

// 6. Quick actions shown with context-aware prompts

// 7. User sees: "Check Balance", "Recent Transactions", etc.
```

### Scenario 2: User Asks "What's my balance?"
```typescript
// 1. User types message
sendMessage("What's my balance?")

// 2. useAIChat builds request with context
{
  message: "What's my balance?",
  session_id: "session-123",
  context: { screen: 'ai-concierge', action: 'user-message' }
}

// 3. AIClient injects user context in system prompt
// "User: Jordan Anderson, Tier: Silver, Balances: Checking $4,250.25, Savings $4,500.25"

// 4. Backend AI model receives request + context

// 5. AI generates response:
// "Your total balance is $8,750.50 (Checking: $4,250.25, Savings: $4,500.25)"

// 6. Response streamed to UI

// 7. Message added to conversation history

// 8. Message saved to local cache
```

### Scenario 3: User Goes Offline
```typescript
// 1. User loses internet connection

// 2. DataService returns cached context
// (if less than 5 minutes since last fetch)

// 3. AI uses cached data

// 4. Chat continues to work

// 5. User can view conversation history

// 6. New messages wait until connection restored

// 7. Message sent when online again
```

---

## Summary

The AI Concierge integration provides:
- ✅ Automatic context fetching
- ✅ Intelligent data caching
- ✅ Real-time account information
- ✅ Spending analysis
- ✅ Personalized recommendations
- ✅ Graceful offline support
- ✅ Error resilience

All implemented with clean, testable TypeScript code!
