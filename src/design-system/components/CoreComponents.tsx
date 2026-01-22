import React from 'react';
import { Text, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../theme';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, padding = SPACING[4], style }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.panel,
          borderRadius: RADIUS.xl,
          borderWidth: 1,
          borderColor: colors.stroke,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'secondary',
  style,
  disabled,
}) => {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: RADIUS.pill,
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: colors.brand };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      default:
        return {
          ...base,
          backgroundColor: colors.panel2,
          borderWidth: 1,
          borderColor: colors.stroke,
        };
    }
  };

  const textStyle: TextStyle = {
    color: variant === 'primary' ? '#FFFFFF' : colors.text,
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: '600',
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[getButtonStyle(), style]}
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
};

interface AvatarProps {
  initials: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ initials, size = 40, style }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: RADIUS.md,
          backgroundColor: colors.brand,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: size * 0.4,
          fontWeight: '800',
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => {
  const { colors } = useTheme();

  const getBadgeStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: RADIUS.pill,
      paddingVertical: SPACING[1],
      paddingHorizontal: SPACING[2],
      alignSelf: 'flex-start',
      borderWidth: 1,
    };

    switch (variant) {
      case 'success':
        return { ...base, backgroundColor: colors.successBg, borderColor: colors.success };
      case 'warning':
        return { ...base, backgroundColor: colors.warningBg, borderColor: colors.warning };
      default:
        return { ...base, backgroundColor: colors.panel2, borderColor: colors.stroke };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      default:
        return colors.muted;
    }
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text
        style={{
          fontSize: TYPOGRAPHY.fontSize.meta,
          fontWeight: '600',
          color: getTextColor(),
        }}
      >
        {label}
      </Text>
    </View>
  );
};

interface IconBoxProps {
  icon: React.ReactNode;
  variant?: 'default' | 'green' | 'yellow' | 'deep';
  size?: number;
  style?: ViewStyle;
}

export const IconBox: React.FC<IconBoxProps> = ({
  icon,
  variant = 'default',
  size = 44,
  style,
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'green':
        return 'rgba(96, 186, 70, 0.12)';
      case 'yellow':
        return 'rgba(250, 185, 21, 0.16)';
      case 'deep':
        return 'rgba(19, 33, 54, 0.14)';
      default:
        return 'rgba(35, 83, 147, 0.14)';
    }
  };

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: RADIUS.lg,
          backgroundColor: getBackgroundColor(),
          borderWidth: 1,
          borderColor: colors.stroke,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {icon}
    </View>
  );
};
// Export all components from this file
export { TierProgressBar } from './TierProgressBar';
export { AmountChipSelector } from './AmountChipSelector';
export { PlatformGoalMeter } from './PlatformGoalMeter';
export { FeeDisclosure } from './FeeDisclosure';