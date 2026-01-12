import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { DataService, AIUserContext } from '../services/DataService';

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
    isVerified?: boolean;
    userTier?: string;
  };
}

/**
 * Customer mode configuration for mobile app
 * - No internal system details exposed
 * - Focus on customer-facing support
 * - Identity verification for sensitive actions
 */
export interface CustomerMode {
  enabled: boolean;
  requireVerification: boolean;
  allowedActions: string[];
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
  private dataService: DataService;
  private userContext: AIUserContext | null = null;
  private contextUpdateInterval: ReturnType<typeof setInterval> | null = null;
  private readonly customerMode: CustomerMode = {
    enabled: true, // Always customer mode in mobile app
    requireVerification: true,
    allowedActions: ['check_balance', 'view_transactions', 'get_rewards', 'request_support', 'escalate_to_human'],
  };

  constructor(config: AIClientConfig) {
    this.config = config;
    this.mockMode = process.env.MOCK_API === 'true' || Constants.expoConfig?.extra?.MOCK_API === 'true';
    
    // Get API URL from config, env vars, or app.json extra config
    const resolvedBaseUrl = config.baseUrl
      || process.env.EXPO_PUBLIC_API_URL
      || Constants.expoConfig?.extra?.API_BASE_URL
      || Constants.expoConfig?.extra?.AI_API_BASE_URL
      || 'https://api.swipesavvy.com';

    // Initialize data service for fetching user context
    this.dataService = new DataService(
      resolvedBaseUrl,
      config.accessToken,
      config.userId
    );

    console.log('🔧 AI Client Mock Mode:', this.mockMode, {
      processEnv: process.env.MOCK_API,
      expoConfig: Constants.expoConfig?.extra?.MOCK_API,
      baseUrl: resolvedBaseUrl
    });

    this.client = axios.create({
      baseURL: resolvedBaseUrl,
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
    let processedLength = 0; // Track how much of responseText we've processed
    let pendingData = ''; // Buffer for incomplete lines
    let isComplete = false;
    const eventQueue: ChatEvent[] = [];
    let resolveNext: ((value: ChatEvent) => void) | null = null;
    let rejectNext: ((error: Error) => void) | null = null;

    xhr.open('POST', `${this.config.baseUrl}/api/v1/ai-concierge`);
    xhr.setRequestHeader('Authorization', `Bearer ${this.config.accessToken}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Request-ID', this.generateRequestId());

    // Handle streaming data
    xhr.onprogress = () => {
      // Only get NEW data since last progress event
      const newData = xhr.responseText.substring(processedLength);
      if (!newData) return;

      processedLength = xhr.responseText.length;

      // Add new data to any pending incomplete data
      const dataToProcess = pendingData + newData;

      // Find the last complete line
      const lastNewlineIndex = dataToProcess.lastIndexOf('\n');
      if (lastNewlineIndex === -1) {
        // No complete lines yet, save all as pending
        pendingData = dataToProcess;
        return;
      }

      // Split into complete lines and pending data
      const completeData = dataToProcess.substring(0, lastNewlineIndex + 1);
      pendingData = dataToProcess.substring(lastNewlineIndex + 1);

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

  /**
   * Get user context with caching
   */
  async getUserContext(): Promise<AIUserContext | null> {
    try {
      this.userContext = await this.dataService.getUserContext();
      return this.userContext;
    } catch (error) {
      console.error('Failed to get user context:', error);
      return null;
    }
  }

  /**
   * Refresh user context (clear cache and fetch fresh data)
   */
  async refreshUserContext(): Promise<AIUserContext | null> {
    try {
      this.dataService.clearCache();
      return await this.getUserContext();
    } catch (error) {
      console.error('Failed to refresh user context:', error);
      return null;
    }
  }

  /**
   * Get cached user context
   */
  getCachedContext(): AIUserContext | null {
    return this.userContext;
  }

  /**
   * Build system prompt with user data
   */
  buildSystemPrompt(context?: AIUserContext): string {
    const ctx = context || this.userContext;
    
    const basePrompt = `You are SwipeSavvy, an intelligent financial AI assistant. You help users manage their personal finances, including checking balances, reviewing transactions, making transfers, paying bills, and earning rewards.

Key Responsibilities:
- Provide accurate financial information from the user's accounts
- Help with money transfers and payments
- Track spending and suggest savings opportunities
- Explain rewards and loyalty programs
- Answer questions about accounts and transactions
- Always confirm sensitive actions before execution`;

    if (!ctx) {
      return basePrompt;
    }

    const contextData = `

Current User Context:
- Name: ${ctx.user.name}
- Tier: ${ctx.user.tier}
- Total Balance: $${ctx.totalBalance.toFixed(2)}
- Monthly Spending: $${ctx.monthlySpending.toFixed(2)}

Accounts:
${ctx.accounts.map(acc => `- ${acc.name}: $${acc.balance.toFixed(2)}`).join('\n')}

Cards:
${ctx.cards.map(card => `- ${card.issuer} ${card.type} (•••• ${card.lastFour}): ${card.status}`).join('\n')}

Recent Rewards:
${ctx.rewards.slice(0, 3).map(reward => `- ${reward.name}: ${reward.description}`).join('\n')}

Linked Banks:
${ctx.linkedBanks.map(bank => `- ${bank.bank}: ${bank.status}`).join('\n')}

Use this context to provide personalized assistance. When users ask about their finances, refer to their actual data. Always be helpful, accurate, and proactive about financial wellness.`;

    return basePrompt + contextData;
  }

  /**
   * Build customer-facing system prompt (no internal details)
   * Used exclusively for mobile app customers
   */
  buildCustomerSystemPrompt(context?: AIUserContext): string {
    const ctx = context || this.userContext;

    const customerPrompt = `You are Savvy, SwipeSavvy's friendly AI assistant helping customers manage their finances and rewards.

Your Role:
- Help customers check balances, view transactions, and understand their rewards
- Answer questions about SwipeSavvy features and benefits
- Provide guidance on earning and redeeming rewards
- Assist with common account questions
- Connect customers with human support when needed

Important Guidelines:
1. NEVER mention internal systems, admin tools, or employee-facing features
2. NEVER process refunds or make account changes directly - guide customers through the app or escalate
3. For sensitive actions (transfers over $500, account changes, disputes), ALWAYS recommend verifying identity first
4. If a customer seems frustrated or the issue is complex, proactively offer to connect them with a human agent
5. Keep responses friendly, concise, and focused on solving the customer's problem
6. NEVER share information about other customers or internal processes

Escalation Triggers - Offer human support when:
- Customer mentions fraud, unauthorized transactions, or security concerns
- Issue involves account lockout or access problems
- Customer has tried multiple times without success
- Customer explicitly requests human support
- Transaction disputes or refund requests
- Technical errors that require investigation`;

    if (!ctx) {
      return customerPrompt;
    }

    // Add minimal customer context (no internal details)
    const customerContext = `

Customer Context:
- Name: ${ctx.user.name}
- Membership Tier: ${ctx.user.tier}
- Account Status: Active
- Rewards Available: ${ctx.rewards.length} active offers

Remember: Focus on helping ${ctx.user.name} with their immediate needs while maintaining security and privacy.`;

    return customerPrompt + customerContext;
  }

  /**
   * Check if action requires identity verification
   */
  requiresVerification(action: string): boolean {
    const sensitiveActions = [
      'transfer',
      'send_money',
      'change_password',
      'update_email',
      'update_phone',
      'close_account',
      'dispute_transaction',
      'request_refund',
      'link_bank',
      'unlink_bank',
    ];
    return sensitiveActions.some(a => action.toLowerCase().includes(a));
  }

  /**
   * Get allowed actions for customer mode
   */
  getAllowedActions(): string[] {
    return this.customerMode.allowedActions;
  }

  /**
   * Check if customer should be escalated to human support
   */
  shouldEscalateToHuman(messages: Array<{ role: string; content: string }>): {
    shouldEscalate: boolean;
    reason: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  } {
    const conversationText = messages.map(m => m.content).join(' ').toLowerCase();

    // Critical - immediate escalation
    const criticalKeywords = ['fraud', 'unauthorized', 'hacked', 'stolen', 'identity theft'];
    if (criticalKeywords.some(k => conversationText.includes(k))) {
      return {
        shouldEscalate: true,
        reason: 'Security concern detected',
        priority: 'critical',
      };
    }

    // High priority
    const highPriorityKeywords = ['locked out', 'cannot access', 'account frozen', 'missing money', 'wrong balance'];
    if (highPriorityKeywords.some(k => conversationText.includes(k))) {
      return {
        shouldEscalate: true,
        reason: 'Account access or balance issue',
        priority: 'high',
      };
    }

    // User explicitly requesting human
    const humanRequestKeywords = ['speak to human', 'real person', 'talk to agent', 'customer service', 'support agent'];
    if (humanRequestKeywords.some(k => conversationText.includes(k))) {
      return {
        shouldEscalate: true,
        reason: 'Customer requested human support',
        priority: 'medium',
      };
    }

    // Long conversation without resolution
    if (messages.length > 10) {
      const userMessages = messages.filter(m => m.role === 'user');
      if (userMessages.length > 5) {
        return {
          shouldEscalate: true,
          reason: 'Extended conversation may need human assistance',
          priority: 'low',
        };
      }
    }

    return {
      shouldEscalate: false,
      reason: '',
      priority: 'low',
    };
  }

  /**
   * Prepare escalation context for human handoff
   */
  prepareEscalationContext(
    messages: Array<{ role: string; content: string; timestamp?: Date }>,
    sessionId: string,
  ): {
    summary: string;
    customerIntent: string;
    attemptedResolutions: string[];
    sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry';
    keyDetails: Record<string, string>;
  } {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    // Extract customer intent from first few messages
    const firstUserMessages = userMessages.slice(0, 3).map(m => m.content).join(' ');

    // Analyze sentiment based on keywords
    const conversationText = userMessages.map(m => m.content).join(' ').toLowerCase();
    let sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry' = 'neutral';

    if (conversationText.includes('thank') || conversationText.includes('great') || conversationText.includes('helpful')) {
      sentiment = 'positive';
    } else if (conversationText.includes('angry') || conversationText.includes('terrible') || conversationText.includes('worst')) {
      sentiment = 'angry';
    } else if (conversationText.includes('frustrat') || conversationText.includes('annoying') || conversationText.includes('not working')) {
      sentiment = 'frustrated';
    }

    // Extract key details
    const keyDetails: Record<string, string> = {};

    // Look for transaction IDs
    const txnRegex = /txn[_-]?\w+|transaction[_\s]?id[:\s]*(\w+)/i;
    const txnMatch = txnRegex.exec(conversationText);
    if (txnMatch) {
      keyDetails['transaction_id'] = txnMatch[1] || txnMatch[0];
    }

    // Look for amounts
    const amountRegex = /\$[\d,]+\.?\d*/;
    const amountMatch = amountRegex.exec(conversationText);
    if (amountMatch) {
      keyDetails['amount_mentioned'] = amountMatch[0];
    }

    // Look for dates
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4})|yesterday|today|last week/i;
    const dateMatch = dateRegex.exec(conversationText);
    if (dateMatch) {
      keyDetails['date_mentioned'] = dateMatch[0];
    }

    return {
      summary: `Customer conversation (${messages.length} messages) - Session: ${sessionId}`,
      customerIntent: firstUserMessages.substring(0, 200),
      attemptedResolutions: assistantMessages.slice(-3).map(m => m.content.substring(0, 100)),
      sentiment,
      keyDetails,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
