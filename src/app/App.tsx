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
    // Hide splash screen immediately - go straight to login
    SplashScreen.hideAsync().catch(() => {
      // Ignore errors
    });
  }, []);

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
