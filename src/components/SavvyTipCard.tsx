import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BRAND_COLORS, TYPOGRAPHY, SPACING } from '../theme';

export interface SavvyTipCardProps {
  title: string;
  description: string;
  icon?: string;
  backgroundColor?: string;
  iconColor?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  category?: 'tip' | 'alert' | 'info' | 'success';
}

export const SavvyTipCard: React.FC<SavvyTipCardProps> = ({
  title,
  description,
  icon = 'lightbulb-on-outline',
  backgroundColor = BRAND_COLORS.yellow,
  iconColor = BRAND_COLORS.navy,
  actionLabel,
  onActionPress,
  dismissible = true,
  onDismiss,
  category = 'tip',
}) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  const getCategoryStyles = () => {
    switch (category) {
      case 'alert':
        return {
          backgroundColor: `${BRAND_COLORS.danger}15`,
          borderColor: BRAND_COLORS.danger,
          iconColor: BRAND_COLORS.danger,
        };
      case 'info':
        return {
          backgroundColor: `${BRAND_COLORS.blue}15`,
          borderColor: BRAND_COLORS.blue,
          iconColor: BRAND_COLORS.blue,
        };
      case 'success':
        return {
          backgroundColor: `${BRAND_COLORS.green}15`,
          borderColor: BRAND_COLORS.green,
          iconColor: BRAND_COLORS.green,
        };
      case 'tip':
      default:
        return {
          backgroundColor: `${backgroundColor}25`,
          borderColor: backgroundColor,
          iconColor,
        };
    }
  };

  const categoryStyles = getCategoryStyles();

  return (
    <View style={[styles.container, { borderColor: categoryStyles.borderColor }]}>
      <View style={[styles.background, { backgroundColor: categoryStyles.backgroundColor }]}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={icon as any}
              size={24}
              color={categoryStyles.iconColor}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {actionLabel && (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: categoryStyles.iconColor }]}
                onPress={onActionPress}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionText, { color: categoryStyles.iconColor }]}>
                  {actionLabel}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {dismissible && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              activeOpacity={0.6}
            >
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={BRAND_COLORS.mediumGrey}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING[12],
  },
  background: {
    padding: SPACING[12],
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: SPACING[12],
    marginTop: SPACING[2],
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '600',
    color: BRAND_COLORS.navy,
    marginBottom: SPACING[4],
  },
  description: {
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.navy,
    marginBottom: SPACING[10],
    lineHeight: 20,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: SPACING[6],
    paddingHorizontal: SPACING[10],
    alignSelf: 'flex-start',
  },
  actionText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    fontSize: 13,
  },
  dismissButton: {
    padding: SPACING[4],
    marginLeft: SPACING[8],
  },
});
