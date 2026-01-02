import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { LIGHT_THEME, SPACING, TYPOGRAPHY } from '../design-system/theme';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 3500,
}) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING[8],
    },
    logo: {
      width: 280,
      height: 120,
      resizeMode: 'contain',
    },
    loadingContainer: {
      position: 'absolute',
      bottom: SPACING[8],
      alignItems: 'center',
    },
    spinner: {
      marginBottom: SPACING[4],
    },
    loadingText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.muted,
      fontWeight: '500',
    },
    footer: {
      position: 'absolute',
      bottom: SPACING[2],
      width: '100%',
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
      color: LIGHT_THEME.muted2,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        {/* ShopSavvy Colored Logo */}
        <Image
          source={require('../../assets/logos/shopsavvy-colored.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#4A90E2"
          style={styles.spinner}
        />
        <Text style={styles.loadingText}>Downloading 100.00%</Text>
      </View>
    </SafeAreaView>
  );
};
