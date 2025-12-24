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

  constructor(config: AIClientConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.baseUrl || Constants.expoConfig?.extra?.AI_API_BASE_URL,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        config.headers['X-Request-ID'] = this.generateRequestId();
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Send a chat message with streaming response
   */
  async *chat(request: ChatRequest): AsyncIterable<ChatEvent> {
    const response = await fetch(`${this.config.baseURL}/api/v1/chat`, {
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

  /**
   * Get conversation history
   */
  async getConversation(sessionId: string) {
    const response = await this.client.get(`/api/v1/conversations/${sessionId}`);
    return response.data;
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
