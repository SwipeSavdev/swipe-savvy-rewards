# Mobile App Integration Plan - AI Chat Feature

**Project**: SwipeSavvy AI Chat Integration  
**Platform**: React Native (iOS & Android)  
**Timeline**: 3 weeks  
**Status**: Ready to Start  
**Date**: December 23, 2025

---

## Executive Summary

Integrate the SwipeSavvy AI Agents backend into the existing React Native mobile app, adding an AI-powered chat feature that allows users to manage banking operations through natural conversation.

**Goal**: Enable mobile users to chat with AI for banking tasks without leaving the app.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           SwipeSavvy Mobile App (React Native)          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │          New: AI Chat Screen                   │    │
│  │  - Chat Interface Component                    │    │
│  │  - Message List (user + AI bubbles)           │    │
│  │  - Input Field & Send Button                  │    │
│  │  - Quick Action Buttons                       │    │
│  │  - Transaction Confirmations                  │    │
│  └───────────────────┬────────────────────────────┘    │
│                      │                                   │
│  ┌───────────────────▼────────────────────────────┐    │
│  │          API Service Layer                     │    │
│  │  - AIAgentService.ts (new)                    │    │
│  │  - REST client for backend                    │    │
│  │  - Session management                         │    │
│  │  - WebSocket support (future)                 │    │
│  └───────────────────┬────────────────────────────┘    │
│                      │                                   │
│  ┌───────────────────▼────────────────────────────┐    │
│  │          State Management (Redux)              │    │
│  │  - chatSlice (new)                            │    │
│  │  - Messages, sessions, loading states         │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS REST API
                       ▼
┌─────────────────────────────────────────────────────────┐
│        AI Agents Backend (Already Complete!)            │
│        https://api.swipesavvy.com                       │
│  - POST /api/v1/chat (main endpoint)                   │
│  - GET /api/v1/sessions/:id (history)                  │
│  - DELETE /api/v1/sessions/:id (clear)                 │
└─────────────────────────────────────────────────────────┘
```

---

## Week-by-Week Plan

### **Week 1: Foundation & UI Components**

#### Day 1-2: Project Setup
- [ ] Create new feature branch: `feature/ai-chat-integration`
- [ ] Install dependencies:
  ```bash
  npm install @react-native-async-storage/async-storage
  npm install react-native-gifted-chat
  npm install axios
  npm install react-native-keyboard-aware-scroll-view
  ```
- [ ] Create folder structure:
  ```
  src/
  ├── features/
  │   └── ai-chat/
  │       ├── components/
  │       │   ├── ChatScreen.tsx
  │       │   ├── ChatBubble.tsx
  │       │   ├── QuickActions.tsx
  │       │   └── TransactionCard.tsx
  │       ├── services/
  │       │   └── AIAgentService.ts
  │       ├── store/
  │       │   └── chatSlice.ts
  │       └── types/
  │           └── chat.types.ts
  ```

#### Day 3-4: API Service Layer
Create `AIAgentService.ts`:

```typescript
// src/features/ai-chat/services/AIAgentService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.swipesavvy.com';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    tool_used?: string;
    action_performed?: string;
  };
}

export interface ChatSession {
  session_id: string;
  user_id: string;
  created_at: string;
  messages: ChatMessage[];
}

class AIAgentService {
  private apiKey: string | null = null;
  private sessionId: string | null = null;

  async initialize() {
    // Get API key from secure storage
    this.apiKey = await AsyncStorage.getItem('ai_agent_api_key');
    this.sessionId = await AsyncStorage.getItem('ai_chat_session_id');
  }

  async sendMessage(message: string, userId: string): Promise<ChatMessage> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/chat`,
        {
          message,
          user_id: userId,
          session_id: this.sessionId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      // Store session ID for conversation continuity
      if (response.data.session_id) {
        this.sessionId = response.data.session_id;
        await AsyncStorage.setItem('ai_chat_session_id', this.sessionId);
      }

      return {
        id: response.data.message_id || Date.now().toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
        metadata: response.data.metadata,
      };
    } catch (error) {
      console.error('AI Agent API Error:', error);
      throw error;
    }
  }

  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/sessions/${sessionId}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      }
    );
    return response.data.messages;
  }

  async clearSession() {
    if (this.sessionId) {
      await axios.delete(
        `${API_BASE_URL}/api/v1/sessions/${this.sessionId}`,
        {
          headers: { 'Authorization': `Bearer ${this.apiKey}` },
        }
      );
      await AsyncStorage.removeItem('ai_chat_session_id');
      this.sessionId = null;
    }
  }
}

export default new AIAgentService();
```

#### Day 5: Redux State Management
Create `chatSlice.ts`:

```typescript
// src/features/ai-chat/store/chatSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AIAgentService, { ChatMessage } from '../services/AIAgentService';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sessionId: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  sessionId: null,
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, userId }: { message: string; userId: string }) => {
    await AIAgentService.initialize();
    const aiResponse = await AIAgentService.sendMessage(message, userId);
    return {
      userMessage: {
        id: Date.now().toString(),
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString(),
      },
      aiResponse,
    };
  }
);

export const loadSessionHistory = createAsyncThunk(
  'chat/loadHistory',
  async (sessionId: string) => {
    await AIAgentService.initialize();
    return await AIAgentService.getSessionHistory(sessionId);
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.sessionId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.userMessage);
        state.messages.push(action.payload.aiResponse);
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      .addCase(loadSessionHistory.fulfilled, (state, action) => {
        state.messages = action.payload;
      });
  },
});

export const { clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
```

---

### **Week 2: UI Implementation**

#### Day 6-7: Chat Screen Component
Create `ChatScreen.tsx`:

```typescript
// src/features/ai-chat/components/ChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, clearMessages } from '../store/chatSlice';
import ChatBubble from './ChatBubble';
import QuickActions from './QuickActions';

const ChatScreen = () => {
  const [inputText, setInputText] = useState('');
  const dispatch = useDispatch();
  const { messages, loading } = useSelector((state) => state.chat);
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (inputText.trim()) {
      dispatch(sendMessage({
        message: inputText.trim(),
        userId: 'current_user_id', // Get from auth context
      }));
      setInputText('');
    }
  };

  const handleQuickAction = (action: string) => {
    dispatch(sendMessage({
      message: action,
      userId: 'current_user_id',
    }));
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Quick Actions at top */}
      {messages.length === 0 && (
        <QuickActions onAction={handleQuickAction} />
      )}

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messageList}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading || !inputText.trim()}
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messageList: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ChatScreen;
```

#### Day 8-9: Chat Bubble Component

```typescript
// src/features/ai-chat/components/ChatBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../services/AIAgentService';

interface Props {
  message: ChatMessage;
}

const ChatBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser && styles.userText]}>
          {message.content}
        </Text>
        {message.metadata?.action_performed && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionText}>
              ✓ {message.metadata.action_performed}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  text: {
    fontSize: 16,
    color: '#000000',
  },
  userText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  actionBadge: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ChatBubble;
```

#### Day 10: Quick Actions Component

```typescript
// src/features/ai-chat/components/QuickActions.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onAction: (action: string) => void;
}

const quickActions = [
  { icon: '💰', label: 'Check Balance', action: "What's my balance?" },
  { icon: '📊', label: 'Recent Transactions', action: 'Show recent transactions' },
  { icon: '💸', label: 'Transfer Money', action: 'I want to transfer money' },
  { icon: '📄', label: 'Pay Bills', action: 'Help me pay a bill' },
];

const QuickActions: React.FC<Props> = ({ onAction }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What can I help you with?</Text>
      <View style={styles.grid}>
        {quickActions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => onAction(item.action)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333333',
  },
});

export default QuickActions;
```

---

### **Week 3: Integration & Testing**

#### Day 11-12: Navigation Integration

Add to app navigation:

```typescript
// src/navigation/MainNavigator.tsx
import ChatScreen from '../features/ai-chat/components/ChatScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      {/* Existing screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Accounts" component={AccountsScreen} />
      
      {/* New AI Chat screen */}
      <Stack.Screen 
        name="AIChat" 
        component={ChatScreen}
        options={{
          title: 'AI Assistant',
          headerRight: () => (
            <TouchableOpacity onPress={handleClearChat}>
              <Text>Clear</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
};
```

Add chat button to home screen:

```typescript
// src/screens/HomeScreen.tsx
<TouchableOpacity
  style={styles.aiChatButton}
  onPress={() => navigation.navigate('AIChat')}
>
  <Text style={styles.aiChatIcon}>🤖</Text>
  <Text style={styles.aiChatText}>AI Assistant</Text>
</TouchableOpacity>
```

#### Day 13-14: Testing

**Unit Tests**:
```typescript
// __tests__/AIAgentService.test.ts
import AIAgentService from '../src/features/ai-chat/services/AIAgentService';

describe('AIAgentService', () => {
  it('sends message and receives response', async () => {
    const response = await AIAgentService.sendMessage(
      "What's my balance?",
      'test_user_123'
    );
    expect(response).toHaveProperty('content');
    expect(response.role).toBe('assistant');
  });
});
```

**Integration Tests**:
- Test full conversation flow
- Test error handling
- Test session persistence
- Test quick actions

#### Day 15: Polish & Launch

- [ ] Add loading indicators
- [ ] Add error messages
- [ ] Add haptic feedback
- [ ] Add animations
- [ ] Performance optimization
- [ ] Submit for review

---

## API Integration Details

### Endpoints Used

**1. Send Message**
```typescript
POST https://api.swipesavvy.com/api/v1/chat
Headers: { Authorization: 'Bearer API_KEY' }
Body: {
  message: string,
  user_id: string,
  session_id?: string
}
Response: {
  response: string,
  session_id: string,
  message_id: string,
  metadata?: {
    tool_used?: string,
    action_performed?: string
  }
}
```

**2. Get Session History**
```typescript
GET https://api.swipesavvy.com/api/v1/sessions/:session_id
Headers: { Authorization: 'Bearer API_KEY' }
Response: {
  messages: ChatMessage[]
}
```

**3. Clear Session**
```typescript
DELETE https://api.swipesavvy.com/api/v1/sessions/:session_id
Headers: { Authorization: 'Bearer API_KEY' }
```

---

## Testing Plan

### Week 3 Testing Checklist

**Functional Testing**:
- [ ] Send message and receive response
- [ ] Multi-turn conversations maintain context
- [ ] Quick actions trigger correct queries
- [ ] Balance queries return correct data
- [ ] Transaction history displays properly
- [ ] Money transfers show confirmation
- [ ] Bill payments work correctly
- [ ] Error messages display appropriately
- [ ] Session persistence across app restarts
- [ ] Clear chat works correctly

**UI/UX Testing**:
- [ ] Chat bubbles display correctly
- [ ] Timestamps format properly
- [ ] Keyboard behavior is smooth
- [ ] Scroll to bottom on new messages
- [ ] Loading states show appropriately
- [ ] Quick actions easy to tap
- [ ] Text input handles multiline
- [ ] Send button enables/disables correctly

**Performance Testing**:
- [ ] Messages load quickly (<2s)
- [ ] Smooth scrolling with 100+ messages
- [ ] No memory leaks
- [ ] App responsive during API calls

**Error Handling**:
- [ ] Network errors show user-friendly message
- [ ] API errors handled gracefully
- [ ] Timeout errors display retry option
- [ ] Invalid responses don't crash app

---

## Deployment

### iOS Deployment

```bash
# 1. Bump version
cd ios && pod install

# 2. Build
npx react-native run-ios --configuration Release

# 3. Submit to App Store
# Use Xcode or Fastlane
```

### Android Deployment

```bash
# 1. Build release APK
cd android && ./gradlew assembleRelease

# 2. Sign APK
# Use Android Studio or command line

# 3. Submit to Play Store
```

---

## Success Metrics

**Launch Success Criteria**:
- [ ] 90% of test users can send messages successfully
- [ ] Average response time < 2 seconds
- [ ] Error rate < 5%
- [ ] User satisfaction > 4.0/5.0
- [ ] No P0 bugs in production

**Key Metrics to Track**:
- Daily active users
- Messages sent per user
- Conversation completion rate
- Average session length
- Feature usage (balance vs transfers vs bills)

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 1** | Foundation | API service, Redux store, folder structure |
| **Week 2** | UI Components | Chat screen, bubbles, quick actions |
| **Week 3** | Integration & Testing | Navigation, testing, polish, launch |

**Total Duration**: 3 weeks (15 working days)

**Go-Live Date**: Mid-January 2026

---

## Next Steps

1. ✅ Review and approve this plan
2. Create feature branch
3. Begin Week 1 Day 1 implementation
4. Set up CI/CD for mobile builds
5. Schedule weekly check-ins

---

**Status**: ✅ Ready to implement  
**Blockers**: None (backend API already complete)  
**Risk Level**: Low (stable API, proven technology stack)

This integration leverages the already-complete backend and adds a native mobile experience with minimal effort!
