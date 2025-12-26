import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY } from '../theme';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, padding = SPACING[4], style }) => {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: LIGHT_THEME.panel,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      padding,
    },
  });

  return <View style={[styles.card, style]}>{children}</View>;
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
  const styles = StyleSheet.create({
    button: {
      borderRadius: RADIUS.pill,
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
    },
    buttonPrimary: {
      backgroundColor: LIGHT_THEME.brand,
    },
    buttonSecondary: {
      backgroundColor: LIGHT_THEME.panel2,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    buttonGhost: {
      backgroundColor: 'transparent',
    },
    text: {
      color: variant === 'primary' ? 'white' : LIGHT_THEME.text,
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        style,
      ]}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

interface AvatarProps {
  initials: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ initials, size = 40, style }) => {
  const styles = StyleSheet.create({
    avatar: {
      width: size,
      height: size,
      borderRadius: RADIUS.md,
      backgroundColor: LIGHT_THEME.brand,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: 'white',
      fontSize: size * 0.4,
      fontWeight: '800',
    },
  });

  return (
    <View style={[styles.avatar, style]}>
      <Text style={styles.text}>{initials}</Text>
    </View>
  );
};

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => {
  const styles = StyleSheet.create({
    badge: {
      borderRadius: RADIUS.pill,
      paddingVertical: SPACING[1],
      paddingHorizontal: SPACING[2],
      alignSelf: 'flex-start',
    },
    badgeDefault: {
      backgroundColor: LIGHT_THEME.panel2,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    badgeSuccess: {
      backgroundColor: LIGHT_THEME.successBg,
      borderWidth: 1,
      borderColor: LIGHT_THEME.success,
    },
    badgeWarning: {
      backgroundColor: LIGHT_THEME.warningBg,
      borderWidth: 1,
      borderColor: LIGHT_THEME.warning,
    },
    text: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color:
        variant === 'success'
          ? LIGHT_THEME.success
          : variant === 'warning'
          ? LIGHT_THEME.warning
          : LIGHT_THEME.muted,
    },
  });

  return (
    <View
      style={[
        styles.badge,
        variant === 'default' && styles.badgeDefault,
        variant === 'success' && styles.badgeSuccess,
        variant === 'warning' && styles.badgeWarning,
        style,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
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

  const styles = StyleSheet.create({
    iconBox: {
      width: size,
      height: size,
      borderRadius: RADIUS.lg,
      backgroundColor: getBackgroundColor(),
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return <View style={[styles.iconBox, style]}>{icon}</View>;
};
