import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';

export interface AIClientConfig {
  baseUrl: string;
  accessToken: string;
  userId: string;
  timeout?: number;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  context?: {
    screen?: string;
    action?: string;
  };
}

export interface ChatEvent {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'message' | 'done' | 'error';
  content?: string;
  delta?: string;
  final?: boolean;
  tool?: string;
  args?: any;
  result?: any;
  session_id?: string;
  message_id?: string;
  error?: string;
}

export class SwipeSavvyAI {
  private client: AxiosInstance;
  private config: AIClientConfig;
  private mockMode: boolean;

  constructor(config: AIClientConfig) {
    this.config = config;
    this.mockMode = process.env.MOCK_API === 'true' || Constants.expoConfig?.extra?.MOCK_API === 'true';
    
    console.log('🔧 AI Client Mock Mode:', this.mockMode, {
      processEnv: process.env.MOCK_API,
      expoConfig: Constants.expoConfig?.extra?.MOCK_API,
      baseUrl: config.baseUrl || Constants.expoConfig?.extra?.AI_API_BASE_URL
    });
    
    this.client = axios.create({
      baseURL: config.baseUrl || Constants.expoConfig?.extra?.AI_API_BASE_URL,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        config.headers['X-Request-ID'] = this.generateRequestId();
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Send a chat message with streaming response (React Native compatible)
   */
  async *chat(request: ChatRequest): AsyncIterable<ChatEvent> {
    if (this.mockMode) {
      yield* this.mockChatStream(request);
      return;
    }

    // Use XMLHttpRequest for React Native streaming support
    const xhr = new XMLHttpRequest();
    let buffer = '';
    let isComplete = false;
    const eventQueue: ChatEvent[] = [];
    let resolveNext: ((value: ChatEvent) => void) | null = null;
    let rejectNext: ((error: Error) => void) | null = null;

    xhr.open('POST', `${this.config.baseUrl}/api/v1/chat`);
    xhr.setRequestHeader('Authorization', `Bearer ${this.config.accessToken}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Request-ID', this.generateRequestId());

    // Handle streaming data
    xhr.onprogress = () => {
      const newData = xhr.responseText.substring(buffer.length);
      buffer = xhr.responseText;

      // Only process complete lines (ending with \n)
      const lastNewlineIndex = buffer.lastIndexOf('\n');
      if (lastNewlineIndex === -1) return; // No complete lines yet

      const completeData = buffer.substring(0, lastNewlineIndex + 1);
      const lines = completeData.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

        const data = trimmedLine.slice(6).trim();
        if (data === '[DONE]') continue;
        
        try {
          const event: ChatEvent = JSON.parse(data);
          if (resolveNext) {
            resolveNext(event);
            resolveNext = null;
          } else {
            eventQueue.push(event);
          }
        } catch (e) {
          // Skip incomplete JSON - it will be completed in next chunk
          if (data.length > 0) {
            console.debug('Skipping incomplete SSE chunk, waiting for complete data');
          }
        }
      }
    };

    xhr.onload = () => {
      isComplete = true;
      if (resolveNext) {
        resolveNext({ type: 'done', final: true } as ChatEvent);
        resolveNext = null;
      }
    };

    xhr.onerror = () => {
      const error = new Error('Network request failed');
      if (rejectNext) {
        rejectNext(error);
        rejectNext = null;
      }
      isComplete = true;
    };

    xhr.send(JSON.stringify({
      message: request.message,
      user_id: this.config.userId,
      session_id: request.session_id,
      context: request.context,
    }));

    // Generator that yields events from queue or waits for next event
    while (!isComplete || eventQueue.length > 0) {
      if (eventQueue.length > 0) {
        yield eventQueue.shift()!;
      } else if (!isComplete) {
        // Wait for next event
        try {
          const event = await new Promise<ChatEvent>((resolve, reject) => {
            resolveNext = resolve;
            rejectNext = reject;
            // Timeout after 30 seconds
            setTimeout(() => {
              if (resolveNext === resolve) {
                reject(new Error('Stream timeout'));
                resolveNext = null;
              }
            }, 30000);
          });
          yield event;
        } catch (error) {
          if (!isComplete) {
            throw error;
          }
          break;
        }
      } else {
        break;
      }
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(sessionId: string) {
    if (this.mockMode) {
      return {
        session_id: sessionId,
        messages: [],
        created_at: new Date().toISOString(),
      };
    }
    const response = await this.client.get(`/api/v1/conversations/${sessionId}`);
    return response.data;
  }

  /**
   * Mock chat stream for testing
   */
  private async *mockChatStream(request: ChatRequest): AsyncIterable<ChatEvent> {
    yield {
      type: 'thinking',
      content: 'Processing your request...',
    };

    await this.delay(500);

    const mockResponse = this.generateMockResponse(request.message);
    const words = mockResponse.split(' ');
    let currentMessage = '';

    for (const word of words) {
      currentMessage += (currentMessage ? ' ' : '') + word;
      yield {
        type: 'message',
        content: currentMessage,
        delta: word,
      };
      await this.delay(50);
    }

    yield {
      type: 'done',
      message_id: `mock-${Date.now()}`,
      session_id: request.session_id || 'mock-session',
      final: true,
    };
  }

  private generateMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('balance')) {
      return "Your current checking account balance is $2,547.83. Your savings account has $12,340.50. Is there anything else you'd like to know about your accounts?";
    }

    if (lowerMessage.includes('transaction') || lowerMessage.includes('recent')) {
      return "Here are your recent transactions: \n\n• Starbucks - $5.47 (Today)\n• Uber - $18.23 (Yesterday)\n• Amazon - $42.99 (2 days ago)\n• Whole Foods - $87.34 (3 days ago)\n\nWould you like more details about any of these transactions?";
    }

    if (lowerMessage.includes('transfer') || lowerMessage.includes('send')) {
      return "I can help you transfer money. To get started, I'll need to know:\n\n1. Which account to transfer from\n2. Where to send the money\n3. The amount\n\nWould you like to proceed with a transfer?";
    }

    if (lowerMessage.includes('bill') || lowerMessage.includes('pay')) {
      return "I can help you pay bills. You have 3 upcoming bills:\n\n• Electric Company - $124.50 (Due in 5 days)\n• Internet Service - $79.99 (Due in 8 days)\n• Credit Card - $342.18 (Due in 12 days)\n\nWhich bill would you like to pay?";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I'm your AI financial assistant! I can help you:\n\n• Check account balances\n• Review recent transactions\n• Transfer money between accounts\n• Pay bills\n• Set up savings goals\n• Answer questions about your spending\n\nWhat would you like to do today?";
    }

    return "I understand you're asking about: \"" + message + "\". I'm here to help with your banking needs. You can ask me about your balance, recent transactions, transfers, or bill payments. What would you like to know?";
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
