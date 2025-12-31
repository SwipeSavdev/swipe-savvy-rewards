# AI Agents to Mobile App Integration Plan

**Date**: December 23, 2025  
**Version**: 1.0  
**Status**: Planning Phase

---

## Executive Summary

This document defines the integration architecture between the **swipesavvy-ai-agents** backend (Python/FastAPI/Together.AI) and the **swipesavvy-mobile-app** (React Native) to deliver the AI Concierge experience to mobile users.

**Goal**: Enable mobile app users to interact with the AI Concierge through natural conversations while maintaining security, performance, and seamless UX.

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native)                │
│  ┌───────────────────────────────────────────────────┐     │
│  │         AI Concierge Chat Interface               │     │
│  │  - Chat UI (messages, typing indicator)          │     │
│  │  - Voice input (speech-to-text)                  │     │
│  │  - Quick actions (balance, transactions)         │     │
│  │  - Biometric confirmation for actions            │     │
│  └───────────────────────────────────────────────────┘     │
│                          │                                  │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │         AI Concierge SDK (@swipesavvy/ai-sdk)    │     │
│  │  - API client (axios + interceptors)             │     │
│  │  - WebSocket for streaming                       │     │
│  │  - Offline queue & retry                         │     │
│  │  - Response caching                              │     │
│  │  - TypeScript types                              │     │
│  └───────────────────────────────────────────────────┘     │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS/WSS
                           │ JWT Bearer Token
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   API GATEWAY / NGINX                       │
│  - SSL/TLS termination                                      │
│  - Rate limiting (per user)                                 │
│  - Load balancing                                           │
│  - CORS headers                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│            SWIPESAVVY-AI-AGENTS (FastAPI)                   │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  CONCIERGE SERVICE (Port 8000)              │           │
│  │  - POST /api/v1/chat (streaming)            │           │
│  │  - GET /api/v1/conversations/{id}           │           │
│  │  - WebSocket /ws/chat                       │           │
│  │  - GET /api/v1/health                       │           │
│  └─────────────────────────────────────────────┘           │
│                          │                                  │
│       ┌──────────────────┼──────────────────┐              │
│       │                  │                  │              │
│       ▼                  ▼                  ▼              │
│  ┌─────────┐      ┌─────────┐       ┌─────────┐          │
│  │   RAG   │      │Guardrails│       │  Tools  │          │
│  │ Service │      │ Service  │       │ Service │          │
│  │ :8001   │      │  :8002   │       │         │          │
│  └─────────┘      └─────────┘       └─────────┘          │
│       │                  │                  │              │
│       └──────────────────┼──────────────────┘              │
│                          ▼                                  │
│              ┌────────────────────┐                        │
│              │   Together.AI      │                        │
│              │   Llama 3.3 70B    │                        │
│              └────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND SERVICES (Java Spring Boot)            │
│  - Account Service (balances, transactions)                 │
│  - Transfer Service (money movement)                        │
│  - Rewards Service (points, redemption)                     │
│  - User Service (profile, preferences)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## API Integration

### Authentication Flow

```typescript
// Mobile app authentication flow

// 1. User logs into mobile app (existing OAuth/JWT flow)
const loginResponse = await authService.login(username, password);
const { accessToken, refreshToken, userId } = loginResponse;

// 2. Store tokens securely
await SecureStore.setItemAsync('accessToken', accessToken);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// 3. Initialize AI SDK with token
const aiClient = new SwipeSavvyAI({
  baseUrl: 'https://api.swipesavvy.com',
  accessToken: accessToken,
  userId: userId
});

// 4. SDK automatically includes token in all requests
// Authorization: Bearer <accessToken>
```

### API Endpoints

#### 1. Send Message (Streaming)

**Endpoint**: `POST /api/v1/chat`  
**Type**: Server-Sent Events (SSE) streaming

**Request**:
```typescript
interface ChatRequest {
  message: string;
  user_id: string;
  session_id?: string;  // Optional, creates new if not provided
  context?: {
    screen?: string;  // Current screen for context
    action?: string;  // User's intended action
  };
}

// Example
const response = await aiClient.chat({
  message: "What's my balance?",
  user_id: "user_123",
  context: {
    screen: "home",
    action: "check_balance"
  }
});
```

**Response** (Streaming):
```typescript
// Stream of events
data: {"type":"thinking","content":"Checking your account balance..."}

data: {"type":"tool_call","tool":"get_account_balance","args":{"user_id":"user_123"}}

data: {"type":"tool_result","result":{"balance":"$1,234.56","account":"Checking ****1234"}}

data: {"type":"message","content":"Your checking account balance is ","delta":"Your"}

data: {"type":"message","content":"Your checking account balance is $","delta":"$"}

data: {"type":"message","content":"Your checking account balance is $1,234.56","delta":"1,234.56","final":true}

data: {"type":"done","session_id":"sess_abc123","message_id":"msg_xyz789"}
```

#### 2. Get Conversation History

**Endpoint**: `GET /api/v1/conversations/{session_id}`

**Response**:
```typescript
interface Conversation {
  session_id: string;
  user_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface Message {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
  timestamp: string;
}
```

#### 3. WebSocket Connection (Real-time)

**Endpoint**: `WS /ws/chat?token={jwt_token}`

**Benefits**:
- Real-time bi-directional communication
- Instant responses
- Typing indicators
- Connection status

**Message Format**:
```typescript
// Client → Server
{
  "type": "message",
  "content": "Transfer $100 to savings",
  "session_id": "sess_abc123"
}

// Server → Client (streaming response)
{
  "type": "response_start",
  "message_id": "msg_xyz789"
}

{
  "type": "response_chunk",
  "delta": "I can help you transfer $100 to your savings account."
}

{
  "type": "response_end",
  "message_id": "msg_xyz789"
}
```

---

## Mobile SDK Design

### Package Structure

```
packages/ai-sdk/
├── src/
│   ├── client/
│   │   ├── AIClient.ts           # Main SDK client
│   │   ├── StreamingClient.ts    # SSE streaming handler
│   │   └── WebSocketClient.ts    # WebSocket handler
│   ├── types/
│   │   ├── chat.ts               # Chat types
│   │   ├── messages.ts           # Message types
│   │   └── responses.ts          # Response types
│   ├── hooks/
│   │   ├── useAIChat.ts          # React hook for chat
│   │   ├── useConversation.ts    # Conversation history
│   │   └── useStreamingMessage.ts # Streaming messages
│   ├── cache/
│   │   └── ResponseCache.ts      # Response caching
│   └── index.ts
├── package.json
└── tsconfig.json
```

### SDK Implementation

```typescript
// packages/ai-sdk/src/client/AIClient.ts

import axios, { AxiosInstance } from 'axios';
import { EventSource } from 'react-native-sse';

export interface AIClientConfig {
  baseUrl: string;
  accessToken: string;
  userId: string;
  timeout?: number;
}

export class SwipeSavvyAI {
  private client: AxiosInstance;
  private config: AIClientConfig;
  private cache: ResponseCache;

  constructor(config: AIClientConfig) {
    this.config = config;
    this.cache = new ResponseCache();
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add request ID for tracing
        config.headers['X-Request-ID'] = generateRequestId();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle token refresh
        if (error.response?.status === 401) {
          await this.refreshToken();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Send a chat message with streaming response
   */
  async chat(request: ChatRequest): Promise<AsyncIterable<ChatEvent>> {
    const { message, session_id, context } = request;

    // Check cache first
    const cacheKey = this.cache.generateKey(message, session_id);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return this.streamCachedResponse(cached);
    }

    // Make streaming request
    const eventSource = new EventSource(
      `${this.config.baseUrl}/api/v1/chat`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          user_id: this.config.userId,
          session_id,
          context
        })
      }
    );

    return this.handleStreamingResponse(eventSource);
  }

  private async *handleStreamingResponse(
    eventSource: EventSource
  ): AsyncIterable<ChatEvent> {
    let fullMessage = '';
    
    for await (const event of eventSource) {
      const data = JSON.parse(event.data);
      
      yield data;
      
      if (data.type === 'message') {
        fullMessage = data.content;
      }
      
      if (data.type === 'done') {
        // Cache the complete response
        await this.cache.set(cacheKey, {
          message: fullMessage,
          session_id: data.session_id,
          message_id: data.message_id
        });
        break;
      }
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(sessionId: string): Promise<Conversation> {
    const response = await this.client.get(
      `/api/v1/conversations/${sessionId}`
    );
    return response.data;
  }

  /**
   * Get quick action response (balance, recent transactions)
   */
  async quickAction(action: QuickAction): Promise<QuickActionResponse> {
    const response = await this.client.post('/api/v1/quick-actions', {
      action: action.type,
      user_id: this.config.userId
    });
    return response.data;
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    // Implement token refresh logic
    // Update this.config.accessToken
  }
}
```

### React Hook for Chat

```typescript
// packages/ai-sdk/src/hooks/useAIChat.ts

import { useState, useCallback, useEffect } from 'react';
import { SwipeSavvyAI } from '../client/AIClient';

export interface UseAIChatOptions {
  sessionId?: string;
  onError?: (error: Error) => void;
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const aiClient = useAIClient(); // Get from context

  const sendMessage = useCallback(async (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentResponse('');

    try {
      const stream = await aiClient.chat({
        message,
        session_id: options.sessionId,
        context: {
          screen: getCurrentScreen() // From navigation context
        }
      });

      let fullResponse = '';
      
      for await (const event of stream) {
        if (event.type === 'message') {
          fullResponse = event.content;
          setCurrentResponse(fullResponse);
        }
        
        if (event.type === 'done') {
          // Add assistant message
          const assistantMessage: Message = {
            id: event.message_id,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setCurrentResponse('');
        }
      }
    } catch (error) {
      options.onError?.(error as Error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [aiClient, options.sessionId]);

  return {
    messages,
    isLoading,
    currentResponse,
    sendMessage
  };
}
```

---

## Mobile App Implementation

### Chat Screen Component

```typescript
// features/ai-concierge/screens/ChatScreen.tsx

import React from 'react';
import { View, FlatList, KeyboardAvoidingView } from 'react-native';
import { useAIChat } from '@swipesavvy/ai-sdk';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { QuickActions } from '../components/QuickActions';
import { TypingIndicator } from '../components/TypingIndicator';

export function ChatScreen() {
  const { messages, isLoading, currentResponse, sendMessage } = useAIChat({
    sessionId: useSessionId(),
    onError: handleError
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/* Quick Actions */}
      {messages.length === 0 && (
        <QuickActions
          onAction={(action) => sendMessage(action.prompt)}
          actions={[
            { id: '1', icon: 'wallet', label: 'Check Balance', prompt: "What's my balance?" },
            { id: '2', icon: 'list', label: 'Recent Transactions', prompt: 'Show recent transactions' },
            { id: '3', icon: 'transfer', label: 'Transfer Money', prompt: 'I want to transfer money' },
            { id: '4', icon: 'help', label: 'Help', prompt: 'How can you help me?' }
          ]}
        />
      )}

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />

      {/* Typing Indicator */}
      {isLoading && <TypingIndicator text={currentResponse} />}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="Ask me anything..."
      />
    </KeyboardAvoidingView>
  );
}
```

### Biometric Confirmation for Actions

```typescript
// features/ai-concierge/hooks/useBiometricConfirmation.ts

import * as LocalAuthentication from 'expo-local-authentication';

export function useBiometricConfirmation() {
  const confirmAction = async (action: string): Promise<boolean> => {
    // Check if biometric is available
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      // Fall back to PIN/password confirmation
      return showPINConfirmation(action);
    }

    // Show biometric prompt
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Confirm ${action}`,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false
    });

    return result.success;
  };

  return { confirmAction };
}

// Usage in AI response handler
async function handleTransferRequest(amount: number, toAccount: string) {
  const { confirmAction } = useBiometricConfirmation();
  
  const confirmed = await confirmAction(
    `transfer $${amount} to ${toAccount}`
  );

  if (!confirmed) {
    return {
      message: "Transfer cancelled. You can try again when you're ready.",
      action_cancelled: true
    };
  }

  // Proceed with transfer
  return await executeTransfer(amount, toAccount);
}
```

---

## Offline Support

### Offline Queue

```typescript
// packages/ai-sdk/src/cache/OfflineQueue.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

interface QueuedRequest {
  id: string;
  request: ChatRequest;
  timestamp: number;
  retries: number;
}

export class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private readonly maxRetries = 3;

  async enqueue(request: ChatRequest): Promise<void> {
    const queuedRequest: QueuedRequest = {
      id: generateId(),
      request,
      timestamp: Date.now(),
      retries: 0
    };

    this.queue.push(queuedRequest);
    await this.persist();
  }

  async processQueue(aiClient: SwipeSavvyAI): Promise<void> {
    // Only process if online
    if (!isOnline()) return;

    for (const item of this.queue) {
      try {
        await aiClient.chat(item.request);
        // Remove from queue on success
        this.queue = this.queue.filter(q => q.id !== item.id);
      } catch (error) {
        item.retries++;
        if (item.retries >= this.maxRetries) {
          // Remove after max retries
          this.queue = this.queue.filter(q => q.id !== item.id);
        }
      }
    }

    await this.persist();
  }

  private async persist(): Promise<void> {
    await AsyncStorage.setItem(
      'ai_offline_queue',
      JSON.stringify(this.queue)
    );
  }

  async restore(): Promise<void> {
    const stored = await AsyncStorage.getItem('ai_offline_queue');
    if (stored) {
      this.queue = JSON.parse(stored);
    }
  }
}
```

---

## Performance Optimization

### Response Caching

```typescript
// packages/ai-sdk/src/cache/ResponseCache.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export class ResponseCache {
  private readonly ttl = 5 * 60 * 1000; // 5 minutes
  private readonly prefix = 'ai_cache_';

  generateKey(message: string, sessionId?: string): string {
    const normalized = message.toLowerCase().trim();
    return `${this.prefix}${sessionId || 'global'}_${hash(normalized)}`;
  }

  async get(key: string): Promise<CachedResponse | null> {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    
    // Check if expired
    if (Date.now() - timestamp > this.ttl) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return data;
  }

  async set(key: string, data: CachedResponse): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }

  // Cache common queries
  async warmCache(commonQueries: string[]): Promise<void> {
    // Pre-cache responses for common queries like "balance", "recent transactions"
  }
}
```

---

## Security Considerations

### 1. Token Management

```typescript
// Secure token storage
import * as SecureStore from 'expo-secure-store';

export class TokenManager {
  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('access_token');
  }

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('access_token', token);
  }

  async refreshToken(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    // Call refresh endpoint
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    const { access_token } = await response.json();
    await this.setAccessToken(access_token);
    return access_token;
  }
}
```

### 2. Request Signing

```typescript
// Sign requests to prevent tampering
function signRequest(request: ChatRequest, secret: string): string {
  const payload = JSON.stringify(request);
  return hmacSHA256(payload, secret);
}

// Add signature to request
client.interceptors.request.use((config) => {
  config.headers['X-Signature'] = signRequest(config.data, userSecret);
  return config;
});
```

### 3. Sensitive Data Masking

```typescript
// Mask sensitive data in UI
function maskAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/\d(?=\d{4})/g, '*');
}

// Display: "Checking ****1234" instead of full number
```

---

## Error Handling

```typescript
export enum AIErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE'
}

export class AIError extends Error {
  constructor(
    public code: AIErrorCode,
    message: string,
    public recoverable: boolean = true
  ) {
    super(message);
  }
}

// Error recovery
function handleAIError(error: AIError): void {
  switch (error.code) {
    case AIErrorCode.NETWORK_ERROR:
      // Queue for retry when online
      offlineQueue.enqueue(request);
      showToast('Message queued. Will send when online.');
      break;
    
    case AIErrorCode.AUTH_ERROR:
      // Refresh token and retry
      await tokenManager.refreshToken();
      retry(request);
      break;
    
    case AIErrorCode.RATE_LIMIT:
      // Show friendly message
      showToast('Too many requests. Please wait a moment.');
      break;
    
    case AIErrorCode.TIMEOUT:
      // Offer retry
      showRetryDialog(request);
      break;
  }
}
```

---

## Analytics & Monitoring

### Track AI Interactions

```typescript
// Track AI events
analytics.track('ai_message_sent', {
  user_id: userId,
  session_id: sessionId,
  message_length: message.length,
  has_context: !!context
});

analytics.track('ai_response_received', {
  user_id: userId,
  session_id: sessionId,
  response_time_ms: responseTime,
  had_tool_calls: toolCalls.length > 0,
  user_satisfied: true // From follow-up feedback
});

analytics.track('ai_action_executed', {
  user_id: userId,
  action_type: 'transfer',
  confirmed_with_biometric: true,
  success: true
});
```

---

## Testing Strategy

### 1. Unit Tests

```typescript
describe('SwipeSavvyAI', () => {
  it('should stream chat responses', async () => {
    const client = new SwipeSavvyAI(mockConfig);
    const stream = await client.chat({ message: 'test' });
    
    const events = [];
    for await (const event of stream) {
      events.push(event);
    }
    
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'message' })
    );
  });

  it('should handle offline requests', async () => {
    setOffline();
    await client.chat({ message: 'test' });
    expect(offlineQueue.length).toBe(1);
  });
});
```

### 2. Integration Tests

```typescript
it('should complete full chat flow', async () => {
  // Render chat screen
  const { getByPlaceholder, getByText } = render(<ChatScreen />);
  
  // Type message
  const input = getByPlaceholder('Ask me anything...');
  fireEvent.changeText(input, "What's my balance?");
  fireEvent.press(getByText('Send'));
  
  // Wait for response
  await waitFor(() => {
    expect(getByText(/Your.*balance.*is/i)).toBeTruthy();
  });
});
```

---

## Deployment Checklist

### Mobile App Release

- [ ] AI SDK published to npm (`@swipesavvy/ai-sdk`)
- [ ] Environment variables configured (API URL, timeouts)
- [ ] SSL pinning implemented
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics configured
- [ ] Biometric auth tested on devices
- [ ] Offline mode tested
- [ ] Token refresh flow tested
- [ ] Rate limiting handled gracefully
- [ ] App Store / Play Store screenshots with AI Concierge

### Backend Release

- [ ] CORS configured for mobile app
- [ ] Rate limiting per user
- [ ] WebSocket support enabled
- [ ] Streaming endpoints tested
- [ ] Token validation working
- [ ] Monitoring dashboards include mobile metrics
- [ ] Load tested for mobile traffic patterns

---

## Success Metrics

### Technical Metrics
- Response time P95 < 2s (including network)
- Streaming latency < 500ms to first token
- Offline queue success rate > 95%
- Token refresh success rate > 99%
- Crash-free rate > 99.5%

### User Engagement
- AI Concierge daily active users > 30%
- Average messages per session > 3
- Action completion rate > 70% (for transfers, payments)
- User satisfaction > 4.0/5

---

## Next Steps

1. **Week 1-2**: Build and publish AI SDK
2. **Week 3-4**: Integrate into mobile app
3. **Week 5**: Internal testing
4. **Week 6**: Beta release to mobile users
5. **Week 7**: Public launch

---

**Status**: Ready for implementation  
**Owner**: Mobile Team + AI Team  
**Review Date**: Weekly during implementation
