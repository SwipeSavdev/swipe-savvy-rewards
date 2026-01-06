import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BRAND_COLORS, TYPOGRAPHY, SPACING } from '../design-system/theme';

interface Receipt {
  id: string;
  type: 'donation' | 'transfer' | 'savings';
  currency: string;
  amount: number;
  date: Date;
  recipient?: string;
  cause?: string;
  impact?: string;
}

interface ReceiptCardProps {
  receipt: Receipt;
  compact?: boolean;
  onShare?: (receipt: Receipt) => void;
  onDownload?: (receipt: Receipt) => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  receipt,
  compact = false,
  onShare,
  onDownload,
}) => {
  const getTypeColor = (): string => {
    switch (receipt.type) {
      case 'donation':
        return BRAND_COLORS.green;
      case 'transfer':
        return BRAND_COLORS.blue;
      case 'savings':
        return BRAND_COLORS.orange;
      default:
        return BRAND_COLORS.gray;
    }
  };

  return (
    <View style={[styles.receiptCard, compact && styles.receiptCardCompact]}>
      <View style={styles.receiptHeader}>
        <View
          style={[
            styles.receiptTypeIcon,
            { backgroundColor: getTypeColor() },
          ]}
        >
          <MaterialCommunityIcons
            name={receipt.type === 'donation' ? 'heart' : 'send'}
            size={20}
            color={BRAND_COLORS.white}
          />
        </View>

        <View style={styles.receiptInfo}>
          <Text style={styles.receiptType}>
            {receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}
          </Text>
          <Text style={styles.receiptDate}>
            {receipt.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        <Text style={[styles.receiptAmount, { color: getTypeColor() }]}>
          {receipt.currency}
          {receipt.amount.toFixed(2)}
        </Text>
      </View>

      {!compact && (
        <>
          <View style={styles.receiptDivider} />

          <View style={styles.receiptDetails}>
            {receipt.recipient && (
              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Recipient</Text>
                <Text style={styles.receiptDetailValue}>
                  {receipt.recipient}
                </Text>
              </View>
            )}

            {receipt.cause && (
              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Cause</Text>
                <Text style={styles.receiptDetailValue}>{receipt.cause}</Text>
              </View>
            )}

            {receipt.impact && (
              <View style={styles.receiptDetailRow}>
                <Text style={styles.receiptDetailLabel}>Impact</Text>
                <Text style={styles.receiptDetailValue}>
                  {receipt.impact}
                </Text>
              </View>
            )}
          </View>

          {(onShare || onDownload) && (
            <View style={styles.receiptActions}>
              {onShare && (
                <TouchableOpacity
                  style={styles.receiptAction}
                  onPress={() => onShare(receipt)}
                >
                  <MaterialCommunityIcons
                    name="share-variant"
                    size={18}
                    color={BRAND_COLORS.green}
                  />
                  <Text style={styles.receiptActionText}>Share</Text>
                </TouchableOpacity>
              )}

              {onDownload && (
                <TouchableOpacity
                  style={styles.receiptAction}
                  onPress={() => onDownload(receipt)}
                >
                  <MaterialCommunityIcons
                    name="download"
                    size={18}
                    color={BRAND_COLORS.blue}
                  />
                  <Text style={styles.receiptActionText}>Download</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  receiptCard: {
    backgroundColor: BRAND_COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND_COLORS.lightGray,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  receiptCardCompact: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  receiptTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptType: {
    ...TYPOGRAPHY.heading4,
    color: BRAND_COLORS.navy,
  },
  receiptDate: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.gray,
    marginTop: SPACING.xs,
  },
  receiptAmount: {
    ...TYPOGRAPHY.heading3,
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: BRAND_COLORS.lightGray,
    marginVertical: SPACING.md,
  },
  receiptDetails: {
    marginBottom: SPACING.md,
  },
  receiptDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  receiptDetailLabel: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.gray,
    fontWeight: '500',
  },
  receiptDetailValue: {
    ...TYPOGRAPHY.body3,
    color: BRAND_COLORS.navy,
    fontWeight: '600',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  receiptAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: BRAND_COLORS.lightGray,
  },
  receiptActionText: {
    ...TYPOGRAPHY.button,
    color: BRAND_COLORS.navy,
    marginLeft: SPACING.sm,
  },
});
