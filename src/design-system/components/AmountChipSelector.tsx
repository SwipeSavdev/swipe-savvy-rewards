import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BRAND_COLORS, TYPOGRAPHY, SPACING } from '../theme';

export interface AmountChip {
  label: string;
  value: number;
}

export interface AmountChipSelectorProps {
  chips: AmountChip[];
  selectedValue?: number;
  onSelect: (amount: number) => void;
  customAmount?: number;
  onCustomChange?: (amount: number) => void;
  showCustomInput?: boolean;
  currency?: string;
  maxChips?: number;
}

export const AmountChipSelector: React.FC<AmountChipSelectorProps> = ({
  chips,
  selectedValue,
  onSelect,
  customAmount,
  onCustomChange,
  showCustomInput = true,
  currency = '$',
  maxChips = 4,
}) => {
  const [showCustom, setShowCustom] = useState(customAmount !== undefined);
  const visibleChips = chips.slice(0, maxChips);

  const handleChipPress = (amount: number) => {
    onSelect(amount);
    setShowCustom(false);
  };

  const handleCustomToggle = () => {
    setShowCustom(!showCustom);
    if (!showCustom) {
      onCustomChange?.(customAmount || 0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        {visibleChips.map((chip) => (
          <TouchableOpacity
            key={chip.value}
            style={[
              styles.chip,
              selectedValue === chip.value && styles.chipSelected,
            ]}
            onPress={() => handleChipPress(chip.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                selectedValue === chip.value && styles.chipTextSelected,
              ]}
            >
              {currency}
              {chip.value.toLocaleString()}
            </Text>
            {chip.label && (
              <Text
                style={[
                  styles.chipLabel,
                  selectedValue === chip.value && styles.chipLabelSelected,
                ]}
              >
                {chip.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {showCustomInput && (
          <TouchableOpacity
            style={[
              styles.chip,
              styles.customChip,
              showCustom && styles.chipSelected,
            ]}
            onPress={handleCustomToggle}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                styles.customChipText,
                showCustom && styles.chipTextSelected,
              ]}
            >
              {showCustom && customAmount
                ? `${currency}${customAmount.toLocaleString()}`
                : 'Other'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showCustom && showCustomInput && (
        <View style={styles.customInputContainer}>
          <Text style={styles.customInputLabel}>Enter Amount</Text>
          <View style={styles.customInputWrapper}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <TextInput
              style={styles.customInput}
              placeholder="0.00"
              placeholderTextColor={BRAND_COLORS.lightGrey}
              keyboardType="decimal-pad"
              value={customAmount?.toString() || ''}
              onChangeText={(text) => {
                const amount = parseFloat(text) || 0;
                onCustomChange?.(amount);
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING[12],
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  chip: {
    paddingVertical: SPACING[10],
    paddingHorizontal: SPACING[12],
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BRAND_COLORS.lightGrey,
    backgroundColor: BRAND_COLORS.white,
    minWidth: 70,
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: BRAND_COLORS.green,
    backgroundColor: `${BRAND_COLORS.green}15`,
  },
  chipText: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '600',
    color: BRAND_COLORS.navy,
    fontSize: 14,
  },
  chipTextSelected: {
    color: BRAND_COLORS.green,
  },
  chipLabel: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
    fontSize: 10,
    marginTop: 2,
  },
  chipLabelSelected: {
    color: BRAND_COLORS.green,
  },
  customChip: {
    borderColor: BRAND_COLORS.mediumGrey,
  },
  customChipText: {
    color: BRAND_COLORS.mediumGrey,
  },
  customInputContainer: {
    marginTop: SPACING[16],
    paddingHorizontal: SPACING[12],
  },
  customInputLabel: {
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.navy,
    fontWeight: '600',
    marginBottom: SPACING[8],
  },
  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND_COLORS.lightGrey,
    borderRadius: 8,
    paddingHorizontal: SPACING[12],
    backgroundColor: BRAND_COLORS.white,
  },
  currencySymbol: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: BRAND_COLORS.navy,
    marginRight: SPACING[4],
  },
  customInput: {
    flex: 1,
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[8],
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.navy,
    fontSize: 16,
  },
});
