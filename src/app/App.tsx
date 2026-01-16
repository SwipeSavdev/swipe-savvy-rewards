import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';

// No splash screen - Expo will auto-hide it immediately
export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
