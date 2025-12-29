import { registerRootComponent } from 'expo';
import * as SplashScreenExpo from 'expo-splash-screen';
import App from './src/app/App';

// Hide native splash screen immediately before app renders
SplashScreenExpo.hideAsync().catch(err => console.warn('Failed to hide splash:', err));

registerRootComponent(App);
