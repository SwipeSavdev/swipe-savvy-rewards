import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BRAND_COLORS, TYPOGRAPHY, SPACING } from '../theme';

export interface TierProgressBarProps {
  currentTier: string;
  nextTier?: string;
  progress: number; // 0-100
  pointsEarned: number;
  pointsToNextTier: number;
  showLabels?: boolean;
  compact?: boolean;
  onPress?: () => void;
}

const TIER_COLORS = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
  Diamond: '#87CEEB',
};

export const TierProgressBar: React.FC<TierProgressBarProps> = ({
  currentTier,
  nextTier,
  progress,
  pointsEarned,
  pointsToNextTier,
  showLabels = true,
  compact = false,
  onPress,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const tierColor = TIER_COLORS[currentTier as keyof typeof TIER_COLORS] || BRAND_COLORS.navy;

  return (
    <View style={[styles.container, compact && styles.compactContainer]} onTouchEnd={onPress}>
      {showLabels && !compact && (
        <View style={styles.tierLabelContainer}>
          <View style={styles.tierInfo}>
            <Text style={styles.currentTierLabel}>Current Tier</Text>
            <Text style={[styles.tierName, { color: tierColor }]}>{currentTier}</Text>
          </View>
          {nextTier && (
            <View style={styles.tierInfo}>
              <Text style={styles.nextTierLabel}>Next Tier</Text>
              <Text style={styles.nextTierName}>{nextTier}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.progressSection}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${clampedProgress}%`,
                backgroundColor: tierColor,
              },
            ]}
          />
        </View>

        {showLabels && (
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{clampedProgress.toFixed(0)}%</Text>
            <Text style={styles.pointsText}>
              {pointsEarned} / {pointsToNextTier} points
            </Text>
          </View>
        )}
      </View>

      {!compact && (
        <View style={styles.milestoneContainer}>
          <View style={styles.milestoneItem}>
            <View style={[styles.milestoneDot, { backgroundColor: tierColor }]} />
            <Text style={styles.milestoneText}>{currentTier}</Text>
          </View>
          {nextTier && (
            <>
              <View style={styles.milestoneLine} />
              <View style={styles.milestoneItem}>
                <View style={[styles.milestoneDot, { backgroundColor: BRAND_COLORS.lightGrey }]} />
                <Text style={styles.milestoneText}>{nextTier}</Text>
              </View>
            </>
          )}
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
  compactContainer: {
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[12],
  },
  tierLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING[16],
  },
  tierInfo: {
    flex: 1,
  },
  currentTierLabel: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
    marginBottom: SPACING[4],
  },
  tierName: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '600',
  },
  nextTierLabel: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
    marginBottom: SPACING[4],
  },
  nextTierName: {
    ...TYPOGRAPHY.subtitle,
    color: BRAND_COLORS.mediumGrey,
  },
  progressSection: {
    marginBottom: SPACING[16],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: BRAND_COLORS.lightGrey,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING[8],
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: BRAND_COLORS.navy,
  },
  pointsText: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING[12],
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.lightGrey,
  },
  milestoneItem: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING[4],
  },
  milestoneText: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
    fontSize: 10,
  },
  milestoneLine: {
    height: 1,
    flex: 1,
    backgroundColor: BRAND_COLORS.lightGrey,
    marginHorizontal: SPACING[8],
  },
});
