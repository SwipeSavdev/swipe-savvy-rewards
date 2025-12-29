import React, { createContext, useContext, useState, useEffect } from 'react';
import { SwipeSavvyAI, AIClientConfig } from './client/AIClient';
import { useAuthStore } from '@features/auth/stores/authStore';
import Constants from 'expo-constants';

interface AIContextValue {
  client: SwipeSavvyAI | null;
  isReady: boolean;
}

const AIContext = createContext<AIContextValue>({
  client: null,
  isReady: false,
});

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<SwipeSavvyAI | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (accessToken && userId) {
      const config: AIClientConfig = {
        baseUrl: Constants.expoConfig?.extra?.AI_API_BASE_URL || 'http://localhost:8000',
        accessToken,
        userId,
      };
      setClient(new SwipeSavvyAI(config));
    } else {
      setClient(null);
    }
  }, [accessToken, userId]);

  return (
    <AIContext.Provider value={{ client, isReady: !!client }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIClient() {
  const context = useContext(AIContext);
  if (!context.client) {
    throw new Error('AI client not initialized. Make sure user is authenticated.');
  }
  return context.client;
}
