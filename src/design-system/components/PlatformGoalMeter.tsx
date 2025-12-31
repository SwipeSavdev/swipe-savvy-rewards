import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BRAND_COLORS, TYPOGRAPHY, SPACING } from '../theme';

export interface PlatformGoalMeterProps {
  currentAmount: number;
  goalAmount: number;
  unit: string; // e.g., "Points Donated", "Trees Planted", "Meals Provided"
  title?: string;
  subtitle?: string;
  showPercentage?: boolean;
  animateOnMount?: boolean;
  onGoalReached?: () => void;
}

export const PlatformGoalMeter: React.FC<PlatformGoalMeterProps> = ({
  currentAmount,
  goalAmount,
  unit,
  title = 'Platform Goal',
  subtitle = 'Community Impact',
  showPercentage = true,
  animateOnMount = false,
  onGoalReached,
}) => {
  const progress = Math.min((currentAmount / goalAmount) * 100, 100);
  const isGoalReached = currentAmount >= goalAmount;

  React.useEffect(() => {
    if (isGoalReached && onGoalReached) {
      onGoalReached();
    }
  }, [isGoalReached]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {showPercentage && (
          <Text style={[styles.percentageText, isGoalReached && styles.goalReachedText]}>
            {isGoalReached ? '✓ Goal!' : `${progress.toFixed(0)}%`}
          </Text>
        )}
      </View>

      <View style={styles.meterContainer}>
        <View style={styles.meterBackground}>
          <Animated.View
            style={[
              styles.meterFill,
              {
                width: `${progress}%`,
              },
            ]}
          />
          {isGoalReached && <View style={styles.goalLine} />}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Achieved</Text>
          <Text style={styles.statValue}>
            {currentAmount.toLocaleString()} {unit}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Goal</Text>
          <Text style={styles.statValue}>
            {goalAmount.toLocaleString()} {unit}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Remaining</Text>
          <Text style={[styles.statValue, isGoalReached && styles.goalReachedValue]}>
            {Math.max(0, goalAmount - currentAmount).toLocaleString()} {unit}
          </Text>
        </View>
      </View>

      {isGoalReached && (
        <View style={styles.celebrationBanner}>
          <Text style={styles.celebrationText}>🎉 Goal Reached! Keep going to make more impact!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[16],
    backgroundColor: BRAND_COLORS.white,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[16],
  },
  titleSection: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.headline,
    color: BRAND_COLORS.navy,
    marginBottom: SPACING[4],
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.mediumGrey,
  },
  percentageText: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: BRAND_COLORS.green,
    textAlign: 'right',
  },
  goalReachedText: {
    color: BRAND_COLORS.green,
  },
  meterContainer: {
    marginBottom: SPACING[16],
  },
  meterBackground: {
    height: 24,
    backgroundColor: BRAND_COLORS.lightGrey,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  meterFill: {
    height: '100%',
    backgroundColor: BRAND_COLORS.green,
    borderRadius: 12,
  },
  goalLine: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: 3,
    backgroundColor: BRAND_COLORS.navy,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.lightGrey,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.lightGrey,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
    marginBottom: SPACING[4],
  },
  statValue: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '600',
    color: BRAND_COLORS.navy,
  },
  goalReachedValue: {
    color: BRAND_COLORS.green,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: BRAND_COLORS.lightGrey,
  },
  celebrationBanner: {
    marginTop: SPACING[12],
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[12],
    backgroundColor: `${BRAND_COLORS.green}10`,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: BRAND_COLORS.green,
  },
  celebrationText: {
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.green,
    textAlign: 'center',
  },
});
