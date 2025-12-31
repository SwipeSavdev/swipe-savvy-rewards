import { useState, useCallback, useRef, useEffect } from 'react';
import { useAIClient } from '../AIProvider';
import { conversationCache } from '../utils/conversationCache';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  error?: boolean;
}

export interface UseAIChatOptions {
  sessionId?: string;
  onError?: (error: Error) => void;
  autoFetchContext?: boolean;
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [contextLoaded, setContextLoaded] = useState(false);
  const aiClient = useAIClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const sessionId = options.sessionId || 'default';
  const autoFetchContext = options.autoFetchContext !== false;

  // Load cached messages and fetch user context on mount
  useEffect(() => {
    async function initializeChat() {
      try {
        // Load cached messages
        const cached = await conversationCache.load(sessionId);
        if (cached && cached.length > 0) {
          setMessages(cached);
        }

        // Auto-fetch user context for personalized responses
        if (autoFetchContext && aiClient) {
          await aiClient.getUserContext();
          setContextLoaded(true);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setContextLoaded(true); // Still continue even if context fetch fails
      }
    }
    
    initializeChat();
  }, [sessionId, autoFetchContext, aiClient]);

  // Save messages to cache whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      conversationCache.save(sessionId, messages);
    }
  }, [messages, sessionId]);

  const sendMessage = useCallback(async (message: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentResponse('');

    abortControllerRef.current = new AbortController();

    try {
      const stream = await aiClient.chat({
        message,
        session_id: options.sessionId,
        context: {
          screen: 'ai-concierge',
          action: 'user-message',
        },
      });

      let fullResponse = '';
      let messageId = '';

      for await (const event of stream) {
        if (event.type === 'message') {
          fullResponse = event.content || '';
          setCurrentResponse(fullResponse);
        }

        if (event.type === 'done') {
          messageId = event.message_id || `asst-${Date.now()}`;
          const assistantMessage: Message = {
            id: messageId,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setCurrentResponse('');
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      options.onError?.(error as Error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setCurrentResponse('');
    } finally {
      setIsLoading(false);
    }
  }, [aiClient, options.sessionId, options.onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentResponse('');
  }, []);

  const refreshContext = useCallback(async () => {
    try {
      await aiClient.refreshUserContext();
    } catch (error) {
      console.error('Failed to refresh context:', error);
    }
  }, [aiClient]);

  return {
    messages,
    isLoading,
    currentResponse,
    sendMessage,
    clearMessages,
    refreshContext,
    contextLoaded,
  };
}
