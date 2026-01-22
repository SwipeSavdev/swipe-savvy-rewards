import { Slot } from 'expo-router';
import 'react-native-reanimated';

export default function RootLayout() {
  // Using Slot to render child routes - the index.tsx will render the actual SwipeSavvy app
  return <Slot />;
}
