import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingModal } from '../../components/LoadingModal';
import { SplashScreen } from '../../components/SplashScreen';
import { LoadingProvider, useLoading } from '../../contexts/LoadingContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { DatabaseInitializer } from '../../database/DatabaseInitializer';
import { AIProvider } from '../../packages/ai-sdk/src/AIProvider';

// Create query client with aggressive caching and performance optimizations
const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 20 * 60 * 1000, // 20 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        networkMode: 'always',
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

const queryClient = createOptimizedQueryClient();

interface AppProvidersProps {
  children: React.ReactNode;
}

function AppProvidersContent({ children }: AppProvidersProps) {
  const [splashVisible, setSplashVisible] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);
  const { isLoading, loadingMessage } = useLoading();

  // Initialize database on app startup
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const dbInitializer = DatabaseInitializer.getInstance();
        await dbInitializer.initialize();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Still allow app to continue even if database initialization fails
        setDbInitialized(true);
      }
    };

    initializeDatabase();
  }, []);

  const handleSplashComplete = React.useCallback(() => {
    setSplashVisible(false);
  }, []);

  // Show splash until both database and splash complete
  const shouldShowSplash = splashVisible || !dbInitialized;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AIProvider>
            {shouldShowSplash ? (
              <SplashScreen onComplete={handleSplashComplete} />
            ) : (
              <>
                {children}
                {/* Global Loading Modal */}
                <LoadingModal visible={isLoading} message={loadingMessage} />
              </>
            )}
          </AIProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <LoadingProvider>
      <ThemeProvider>
        <AppProvidersContent>{children}</AppProvidersContent>
      </ThemeProvider>
    </LoadingProvider>
  );
}
