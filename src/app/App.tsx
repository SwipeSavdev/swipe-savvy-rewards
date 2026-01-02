import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';

// Keep the splash screen visible while we load
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors
});

export default function App() {
  useEffect(() => {
    // Hide splash screen after app is ready
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
