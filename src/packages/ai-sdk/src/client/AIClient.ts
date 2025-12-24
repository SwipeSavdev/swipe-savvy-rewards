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
      expoConfig: Constants.expoConfig?.extra?.MOCK_API
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

  async *chat(request: ChatRequest): AsyncIterable<ChatEvent> {
    if (this.mockMode) {
      yield* this.mockChatStream(request);
      return;
    }

    const response = await fetch(`${this.config.baseUrl}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: request.message,
        user_id: this.config.userId,
        session_id: request.session_id,
        context: request.context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          
          try {
            const event: ChatEvent = JSON.parse(data);
            yield event;
          } catch (e) {
            console.error('Failed to parse event:', e);
          }
        }
      }
    }
  }

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
