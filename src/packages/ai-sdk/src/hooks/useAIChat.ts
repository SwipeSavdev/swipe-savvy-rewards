import { useState, useCallback, useRef, useEffect } from 'react';
import { useAIClient } from '../AIProvider';

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
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const aiClient = useAIClient();
  const abortControllerRef = useRef<AbortController | null>(null);

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

  return {
    messages,
    isLoading,
    currentResponse,
    sendMessage,
    clearMessages,
  };
}
