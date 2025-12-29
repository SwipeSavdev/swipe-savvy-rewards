import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { SPACING } from '@design-system/theme';

interface BrandHeaderProps {
  variant?: 'full' | 'icon-only' | 'text-only';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const sizeConfig = {
  small: { width: 80, height: 40 },
  medium: { width: 120, height: 60 },
  large: { width: 160, height: 80 },
};

/**
 * Brand header component for displaying ShopSavvy logo
 * Used in navigation, headers, and key app screens
 */
export const BrandHeader: React.FC<BrandHeaderProps> = ({
  variant = 'icon-only',
  size = 'medium',
  style,
}) => {
  const { width, height } = sizeConfig[size];

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width,
      height,
      resizeMode: 'contain',
    },
  });

  // Select logo based on variant
  const getLogoSource = () => {
    switch (variant) {
      case 'icon-only':
        return require('../../assets/logos/shopsavvy-colored.png');
      case 'text-only':
        return require('../../assets/logos/shopsavvy-colored.png');
      case 'full':
      default:
        return require('../../assets/logos/shopsavvy-colored.png');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Image source={getLogoSource()} style={styles.logo} />
    </View>
  );
};
