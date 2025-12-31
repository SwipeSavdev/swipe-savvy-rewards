import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BRAND_COLORS, TYPOGRAPHY, SPACING } from '../theme';

export interface FeeDisclosureProps {
  transactionAmount: number;
  feeAmount: number;
  totalAmount: number;
  estimatedArrival?: string;
  feeType?: 'standard' | 'express' | 'instant';
  showBreakdown?: boolean;
  currency?: string;
}

export const FeeDisclosure: React.FC<FeeDisclosureProps> = ({
  transactionAmount,
  feeAmount,
  totalAmount,
  estimatedArrival,
  feeType = 'standard',
  showBreakdown = true,
  currency = '$',
}) => {
  const feePercentage = ((feeAmount / transactionAmount) * 100).toFixed(2);

  const getFeeTypeInfo = () => {
    switch (feeType) {
      case 'express':
        return { label: 'Express', icon: 'flash', color: BRAND_COLORS.yellow };
      case 'instant':
        return { label: 'Instant', icon: 'lightning-bolt', color: BRAND_COLORS.green };
      case 'standard':
      default:
        return { label: 'Standard', icon: 'clock-outline', color: BRAND_COLORS.mediumGrey };
    }
  };

  const feeInfo = getFeeTypeInfo();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.feeTypeContainer}>
          <MaterialCommunityIcons
            name={feeInfo.icon as any}
            size={16}
            color={feeInfo.color}
          />
          <Text style={[styles.feeTypeLabel, { color: feeInfo.color }]}>
            {feeInfo.label}
          </Text>
        </View>
        {estimatedArrival && (
          <Text style={styles.arrivalTime}>{estimatedArrival}</Text>
        )}
      </View>

      {showBreakdown && (
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Transaction Amount</Text>
            <Text style={styles.breakdownValue}>
              {currency}
              {transactionAmount.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.breakdownRow, styles.feeRow]}>
            <View style={styles.feeLabel}>
              <Text style={styles.breakdownLabel}>Processing Fee</Text>
              <Text style={styles.feePercentage}>({feePercentage}%)</Text>
            </View>
            <Text style={[styles.breakdownValue, styles.feeValue]}>
              {currency}
              {feeAmount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {currency}
              {totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.disclaimerContainer}>
        <MaterialCommunityIcons
          name="information-outline"
          size={14}
          color={BRAND_COLORS.mediumGrey}
        />
        <Text style={styles.disclaimerText}>
          Fee disclosed before confirmation. You can modify it until you submit.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[12],
    backgroundColor: BRAND_COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND_COLORS.lightGrey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[12],
  },
  feeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
  },
  feeTypeLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  arrivalTime: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
  },
  breakdownContainer: {
    marginBottom: SPACING[12],
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[8],
  },
  feeRow: {
    paddingTop: SPACING[8],
  },
  breakdownLabel: {
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.navy,
  },
  feeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
  },
  feePercentage: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
  },
  breakdownValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: BRAND_COLORS.navy,
  },
  feeValue: {
    color: BRAND_COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: BRAND_COLORS.lightGrey,
    marginVertical: SPACING[8],
  },
  totalRow: {
    paddingVertical: SPACING[8],
  },
  totalLabel: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: BRAND_COLORS.navy,
  },
  totalValue: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: BRAND_COLORS.green,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[6],
    paddingTop: SPACING[8],
    paddingHorizontal: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.lightGrey,
  },
  disclaimerText: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
    flex: 1,
    lineHeight: 16,
  },
});
