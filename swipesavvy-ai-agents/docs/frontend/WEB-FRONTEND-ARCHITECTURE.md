# Web Frontend Architecture - AI Chat Dashboard

**Project**: SwipeSavvy AI Chat Web Application  
**Stack**: Next.js 14, React, TypeScript, Tailwind CSS  
**Timeline**: 4 weeks  
**Status**: Architecture Design  
**Date**: December 23, 2025

---

## Executive Summary

Build a standalone web application for SwipeSavvy AI Agents, providing a full-featured chat interface with admin dashboard, analytics, and user management capabilities.

**Goal**: Comprehensive web experience for both end-users and administrators.

---

## Technology Stack

```
Frontend Framework:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript 5
├── Tailwind CSS 3
└── shadcn/ui components

State Management:
├── Zustand (lightweight, simple)
└── React Query (server state)

Authentication:
├── NextAuth.js
└── JWT tokens

Real-time:
├── Socket.io (future)
└── Server-Sent Events (SSE)

Testing:
├── Jest
├── React Testing Library
└── Playwright (E2E)

Deployment:
├── Vercel (recommended)
└── Docker + nginx (self-hosted)
```

---

## Application Architecture

```
┌────────────────────────────────────────────────────────┐
│         Web Application (Next.js 14 App Router)        │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │            User-Facing Routes                    │ │
│  │  /               → Landing page                  │ │
│  │  /chat           → Main chat interface           │ │
│  │  /login          → Authentication                │ │
│  │  /dashboard      → User dashboard                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │            Admin Routes                          │ │
│  │  /admin                   → Admin dashboard      │ │
│  │  /admin/conversations     → All conversations    │ │
│  │  /admin/users             → User management      │ │
│  │  /admin/analytics         → Usage analytics      │ │
│  │  /admin/settings          → System settings      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │            API Routes (Next.js API)              │ │
│  │  /api/chat          → Proxy to backend API       │ │
│  │  /api/auth          → NextAuth endpoints         │ │
│  │  /api/sessions      → Session management         │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────┬─────────────────────────────────┘
                       │ HTTPS REST API
                       ▼
┌────────────────────────────────────────────────────────┐
│          SwipeSavvy AI Agents Backend                  │
│          https://api.swipesavvy.com                    │
└────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
swipesavvy-web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── analytics/
│   │   │   ├── conversations/
│   │   │   ├── users/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   └── sessions/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── QuickActions.tsx
│   │   └── ConversationList.tsx
│   ├── dashboard/
│   │   ├── StatCards.tsx
│   │   ├── UsageChart.tsx
│   │   └── RecentActivity.tsx
│   ├── admin/
│   │   ├── ConversationTable.tsx
│   │   ├── UserTable.tsx
│   │   └── AnalyticsDashboard.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ... (shadcn/ui components)
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── api/
│   │   ├── aiAgentClient.ts
│   │   └── apiClient.ts
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useSessions.ts
│   │   └── useAuth.ts
│   ├── stores/
│   │   ├── chatStore.ts
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── chat.types.ts
│   │   └── user.types.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
├── public/
│   ├── images/
│   └── icons/
├── styles/
│   └── globals.css
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Week-by-Week Implementation

### **Week 1: Project Setup & Core Infrastructure**

#### Day 1: Initialize Project

```bash
# Create Next.js app
npx create-next-app@latest swipesavvy-web \
  --typescript \
  --tailwind \
  --app \
  --use-npm

cd swipesavvy-web

# Install dependencies
npm install \
  zustand \
  @tanstack/react-query \
  next-auth \
  axios \
  socket.io-client \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  class-variance-authority \
  clsx \
  tailwind-merge \
  lucide-react

npm install -D \
  @types/node \
  @types/react \
  @types/react-dom \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @playwright/test
```

#### Day 2-3: API Client & Services

```typescript
// lib/api/aiAgentClient.ts
import axios, { AxiosInstance } from 'axios';

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

export interface SendMessageRequest {
  message: string;
  user_id: string;
  session_id?: string;
}

export interface SendMessageResponse {
  response: string;
  session_id: string;
  message_id: string;
  metadata?: Record<string, any>;
}

class AIAgentClient {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey?: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
    });
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await this.client.post('/api/v1/chat', request);
    return response.data;
  }

  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await this.client.get(`/api/v1/sessions/${sessionId}`);
    return response.data.messages;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.client.delete(`/api/v1/sessions/${sessionId}`);
  }

  async getSessions(userId: string): Promise<any[]> {
    const response = await this.client.get(`/api/v1/users/${userId}/sessions`);
    return response.data.sessions;
  }
}

export const aiAgentClient = new AIAgentClient(
  process.env.NEXT_PUBLIC_AI_API_URL || 'https://api.swipesavvy.com',
  process.env.AI_API_KEY
);

export default aiAgentClient;
```

#### Day 4-5: State Management with Zustand

```typescript
// lib/stores/chatStore.ts
import { create } from 'zustand';
import { ChatMessage } from '../types/chat.types';
import aiAgentClient from '../api/aiAgentClient';

interface ChatState {
  messages: ChatMessage[];
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  
  sendMessage: (message: string, userId: string) => Promise<void>;
  loadHistory: (sessionId: string) => Promise<void>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: null,
  loading: false,
  error: null,

  sendMessage: async (message: string, userId: string) => {
    set({ loading: true, error: null });
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    set({ messages: [...get().messages, userMessage] });

    try {
      const response = await aiAgentClient.sendMessage({
        message,
        user_id: userId,
        session_id: get().sessionId || undefined,
      });

      const aiMessage: ChatMessage = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        metadata: response.metadata,
      };

      set({
        messages: [...get().messages, aiMessage],
        sessionId: response.session_id,
        loading: false,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Failed to send message',
      });
    }
  },

  loadHistory: async (sessionId: string) => {
    set({ loading: true });
    try {
      const messages = await aiAgentClient.getSessionHistory(sessionId);
      set({ messages, sessionId, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  clearMessages: () => {
    set({ messages: [], sessionId: null, error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
```

---

### **Week 2: Chat Interface & User Dashboard**

#### Day 6-8: Main Chat Interface

```typescript
// components/chat/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/stores/chatStore';
import { useSession } from 'next-auth/react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import QuickActions from './QuickActions';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatInterface() {
  const { data: session } = useSession();
  const { messages, loading, sendMessage } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (session?.user?.id) {
      await sendMessage(message, session.user.id);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            Hi! What can I help you with today?
          </h2>
          <QuickActions onAction={handleQuickAction} />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-pulse">AI is typing...</div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={loading}
          placeholder="Ask me anything about your account..."
        />
      </div>
    </div>
  );
}
```

```typescript
// components/chat/MessageBubble.tsx
import { ChatMessage } from '@/lib/types/chat.types';
import { cn } from '@/lib/utils';

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {message.metadata?.action_performed && (
          <div className="mt-2 flex items-center space-x-2 text-xs">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              ✓ {message.metadata.action_performed}
            </span>
          </div>
        )}
        
        <p className="text-xs mt-1 opacity-70">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
```

```typescript
// components/chat/ChatInput.tsx
import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end space-x-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[60px] max-h-[200px] resize-none"
        rows={2}
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        size="icon"
        className="h-[60px] w-[60px]"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
```

#### Day 9-10: User Dashboard

```typescript
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react';
import StatCards from '@/components/dashboard/StatCards';
import UsageChart from '@/components/dashboard/UsageChart';
import RecentConversations from '@/components/dashboard/RecentConversations';

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of your AI assistant usage</p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <StatCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<div>Loading chart...</div>}>
          <UsageChart />
        </Suspense>

        <Suspense fallback={<div>Loading conversations...</div>}>
          <RecentConversations />
        </Suspense>
      </div>
    </div>
  );
}
```

---

### **Week 3: Admin Dashboard & Analytics**

#### Day 11-13: Admin Analytics Dashboard

```typescript
// app/(admin)/admin/analytics/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function AnalyticsPage() {
  // Fetch analytics data
  const stats = {
    totalConversations: 1234,
    totalMessages: 5678,
    activeUsers: 234,
    avgResponseTime: '1.2s',
    successRate: '94.5%',
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalConversations}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalMessages}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.avgResponseTime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.successRate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversations" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgTime" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

#### Day 14-15: Conversation Management

```typescript
// components/admin/ConversationTable.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';

export default function ConversationTable() {
  const [conversations, setConversations] = useState([]);

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conversations.map((conv) => (
            <TableRow key={conv.id}>
              <TableCell className="font-mono text-sm">{conv.session_id}</TableCell>
              <TableCell>{conv.user_email}</TableCell>
              <TableCell>{conv.message_count}</TableCell>
              <TableCell>{new Date(conv.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${
                  conv.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>
                  {conv.is_active ? 'Active' : 'Ended'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### **Week 4: Testing, Polish & Deployment**

#### Day 16-17: Testing

```typescript
// __tests__/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '@/components/chat/ChatInterface';
import { useChatStore } from '@/lib/stores/chatStore';

jest.mock('@/lib/stores/chatStore');

describe('ChatInterface', () => {
  it('sends message when user clicks send', async () => {
    const mockSendMessage = jest.fn();
    (useChatStore as any).mockReturnValue({
      messages: [],
      loading: false,
      sendMessage: mockSendMessage,
    });

    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/ask me anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message', expect.any(String));
    });
  });
});
```

#### Day 18-19: Performance Optimization & Polish

- Implement lazy loading for images
- Add skeleton loaders
- Optimize bundle size
- Add animations with Framer Motion
- Implement dark mode
- Add accessibility features (ARIA labels)

#### Day 20: Deployment

```bash
# Deploy to Vercel
vercel deploy --prod

# Or self-host with Docker
docker build -t swipesavvy-web .
docker run -p 3000:3000 swipesavvy-web
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_AI_API_URL=https://api.swipesavvy.com
AI_API_KEY=your_api_key_here
NEXTAUTH_SECRET=generate_random_secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Advantages**:
- Zero configuration
- Automatic HTTPS
- Global CDN
- Automatic scaling
- Preview deployments

### Option 2: Docker + Self-Hosted

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Success Metrics

**Launch Criteria**:
- [ ] All core features working
- [ ] 95%+ test coverage
- [ ] Lighthouse score > 90
- [ ] No accessibility violations
- [ ] Sub-2s page load time

**Key Metrics**:
- Page load time
- Time to interactive
- Conversation completion rate
- User satisfaction score
- Daily active users

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 1** | Setup & Infrastructure | Project setup, API client, state management |
| **Week 2** | Chat & Dashboard | Chat interface, user dashboard, quick actions |
| **Week 3** | Admin Features | Analytics dashboard, conversation management |
| **Week 4** | Polish & Launch | Testing, optimization, deployment |

**Total Duration**: 4 weeks (20 working days)

**Go-Live Date**: Late January 2026

---

**Status**: ✅ Architecture complete, ready to implement  
**Risk Level**: Low (proven tech stack, stable backend API)
