import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BRAND_COLORS, TYPOGRAPHY, SPACING } from '../theme';

/**
 * Edge Case Styling Utilities & Components
 * Handles all UI state refinements, error states, and edge cases
 */

// Account Relink State Component
export interface AccountRelinkStateProps {
  accountName: string;
  accountLast4: string;
  onRelinkPress: () => void;
  isRelinking?: boolean;
}

export const AccountRelinkState: React.FC<AccountRelinkStateProps> = ({
  accountName,
  accountLast4,
  onRelinkPress,
  isRelinking = false,
}) => {
  return (
    <View style={styles.relinkContainer}>
      <View style={styles.relinkWarning}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={20}
          color={BRAND_COLORS.danger}
        />
        <View style={styles.relinkTextContainer}>
          <Text style={styles.relinkTitle}>Action Required</Text>
          <Text style={styles.relinkSubtitle}>
            {accountName} ••••{accountLast4} needs to be relinked
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.relinkButton, isRelinking && styles.relinkButtonLoading]}
        onPress={onRelinkPress}
        disabled={isRelinking}
        activeOpacity={0.7}
      >
        <Text style={styles.relinkButtonText}>
          {isRelinking ? 'Relinking...' : 'Relink Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Tab Toggle Component with smooth transitions
export interface TabOption {
  label: string;
  value: string;
  icon?: string;
}

export interface TabToggleProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  variant?: 'pills' | 'underline';
  fullWidth?: boolean;
}

export const TabToggle: React.FC<TabToggleProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'pills',
  fullWidth = false,
}) => {
  return (
    <View style={[styles.tabContainer, fullWidth && styles.tabContainerFullWidth]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.value}
          style={[
            styles.tab,
            variant === 'pills' ? styles.tabPill : styles.tabUnderline,
            activeTab === tab.value &&
              (variant === 'pills' ? styles.tabPillActive : styles.tabUnderlineActive),
            fullWidth && styles.tabFullWidth,
          ]}
          onPress={() => onTabChange(tab.value)}
          activeOpacity={0.7}
        >
          {tab.icon && (
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={16}
              color={
                activeTab === tab.value ? BRAND_COLORS.white : BRAND_COLORS.mediumGrey
              }
              style={styles.tabIcon}
            />
          )}
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.value && styles.tabLabelActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Dropdown Selector with enhanced styling
export interface DropdownOption {
  label: string;
  value: string;
  icon?: string;
  subtext?: string;
}

export interface DropdownSelectorProps {
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  label,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <View style={styles.dropdownWrapper}>
      {label && <Text style={styles.dropdownLabel}>{label}</Text>}
      <TouchableOpacity
        style={[styles.dropdownButton, isOpen && styles.dropdownButtonActive]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownButtonContent}>
          {selectedOption?.icon && (
            <MaterialCommunityIcons
              name={selectedOption.icon as any}
              size={18}
              color={BRAND_COLORS.navy}
            />
          )}
          <View style={styles.dropdownButtonText}>
            <Text style={styles.dropdownButtonLabel}>
              {selectedOption?.label || placeholder}
            </Text>
            {selectedOption?.subtext && (
              <Text style={styles.dropdownButtonSubtext}>{selectedOption.subtext}</Text>
            )}
          </View>
        </View>
        <MaterialCommunityIcons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={BRAND_COLORS.mediumGrey}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          <ScrollView
            scrollEnabled={options.length > 5}
            nestedScrollEnabled={true}
            style={styles.dropdownMenuScroll}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownMenuItem,
                  selectedValue === option.value &&
                    styles.dropdownMenuItemActive,
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.6}
              >
                <View style={styles.dropdownMenuItemContent}>
                  {option.icon && (
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={18}
                      color={
                        selectedValue === option.value
                          ? BRAND_COLORS.green
                          : BRAND_COLORS.navy
                      }
                    />
                  )}
                  <View style={styles.dropdownMenuItemText}>
                    <Text
                      style={[
                        styles.dropdownMenuItemLabel,
                        selectedValue === option.value &&
                          styles.dropdownMenuItemLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.subtext && (
                      <Text
                        style={[
                          styles.dropdownMenuItemSubtext,
                          selectedValue === option.value &&
                            styles.dropdownMenuItemSubtextActive,
                        ]}
                      >
                        {option.subtext}
                      </Text>
                    )}
                  </View>
                </View>
                {selectedValue === option.value && (
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={BRAND_COLORS.green}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// Timeline/Activity Feed Item
export interface TimelineActivityProps {
  title: string;
  description?: string;
  timestamp: string;
  icon: string;
  iconColor?: string;
  amount?: number;
  status?: 'pending' | 'completed' | 'failed';
}

export const TimelineActivityItem: React.FC<TimelineActivityProps> = ({
  title,
  description,
  timestamp,
  icon,
  iconColor = BRAND_COLORS.green,
  amount,
  status = 'completed',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'failed':
        return BRAND_COLORS.danger;
      case 'pending':
        return BRAND_COLORS.yellow;
      case 'completed':
      default:
        return BRAND_COLORS.green;
    }
  };

  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, { backgroundColor: getStatusColor() }]}>
        <MaterialCommunityIcons name={icon as any} size={12} color={BRAND_COLORS.white} />
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>{title}</Text>
          <Text style={styles.timelineTimestamp}>{timestamp}</Text>
        </View>
        {description && <Text style={styles.timelineDescription}>{description}</Text>}
      </View>
      {amount && (
        <Text style={[styles.timelineAmount, { color: getStatusColor() }]}>
          ${amount.toFixed(2)}
        </Text>
      )}
    </View>
  );
};

// Empty State Component
export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
  iconColor = BRAND_COLORS.mediumGrey,
}) => {
  return (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons name={icon as any} size={48} color={iconColor} />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDescription}>{description}</Text>
      {actionLabel && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={onActionPress}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyStateButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Loading State Skeleton
export const SkeletonLoader: React.FC<{ height?: number; width?: string }> = ({
  height = 40,
  width = '100%',
}) => {
  return (
    <View
      style={[
        styles.skeletonLoader,
        { height, width },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  // Relink Account State
  relinkContainer: {
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[12],
    backgroundColor: `${BRAND_COLORS.danger}10`,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: BRAND_COLORS.danger,
  },
  relinkWarning: {
    flexDirection: 'row',
    marginBottom: SPACING[12],
  },
  relinkTextContainer: {
    marginLeft: SPACING[12],
    flex: 1,
  },
  relinkTitle: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '600',
    color: BRAND_COLORS.danger,
    marginBottom: SPACING[2],
  },
  relinkSubtitle: {
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.navy,
  },
  relinkButton: {
    backgroundColor: BRAND_COLORS.danger,
    paddingVertical: SPACING[10],
    borderRadius: 6,
    alignItems: 'center',
  },
  relinkButtonLoading: {
    opacity: 0.7,
  },
  relinkButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: BRAND_COLORS.white,
  },

  // Tab Toggle
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[8],
    marginBottom: SPACING[12],
  },
  tabContainerFullWidth: {
    paddingHorizontal: 0,
  },
  tab: {
    paddingVertical: SPACING[8],
    paddingHorizontal: SPACING[12],
    marginHorizontal: SPACING[4],
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabPill: {
    backgroundColor: BRAND_COLORS.lightGrey,
    borderRadius: 20,
  },
  tabPillActive: {
    backgroundColor: BRAND_COLORS.green,
  },
  tabUnderline: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND_COLORS.lightGrey,
  },
  tabUnderlineActive: {
    borderBottomColor: BRAND_COLORS.green,
  },
  tabFullWidth: {
    flex: 1,
  },
  tabIcon: {
    marginRight: SPACING[6],
  },
  tabLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: BRAND_COLORS.mediumGrey,
  },
  tabLabelActive: {
    color: BRAND_COLORS.white,
  },

  // Dropdown
  dropdownWrapper: {
    marginBottom: SPACING[12],
  },
  dropdownLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: BRAND_COLORS.navy,
    marginBottom: SPACING[6],
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderWidth: 1,
    borderColor: BRAND_COLORS.lightGrey,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.white,
  },
  dropdownButtonActive: {
    borderColor: BRAND_COLORS.green,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING[8],
  },
  dropdownButtonText: {
    flex: 1,
  },
  dropdownButtonLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: BRAND_COLORS.navy,
  },
  dropdownButtonSubtext: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
    marginTop: SPACING[2],
  },
  dropdownMenu: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BRAND_COLORS.green,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: BRAND_COLORS.white,
    maxHeight: 300,
    marginBottom: SPACING[8],
  },
  dropdownMenuScroll: {
    maxHeight: 300,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.lightGrey,
  },
  dropdownMenuItemActive: {
    backgroundColor: `${BRAND_COLORS.green}08`,
  },
  dropdownMenuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING[8],
  },
  dropdownMenuItemText: {
    flex: 1,
  },
  dropdownMenuItemLabel: {
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.navy,
  },
  dropdownMenuItemLabelActive: {
    fontWeight: '600',
    color: BRAND_COLORS.green,
  },
  dropdownMenuItemSubtext: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
    marginTop: SPACING[2],
  },
  dropdownMenuItemSubtextActive: {
    color: BRAND_COLORS.green,
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING[16],
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[12],
    marginTop: SPACING[2],
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  timelineTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: BRAND_COLORS.navy,
  },
  timelineTimestamp: {
    ...TYPOGRAPHY.caption,
    color: BRAND_COLORS.mediumGrey,
  },
  timelineDescription: {
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.mediumGrey,
  },
  timelineAmount: {
    ...TYPOGRAPHY.subtitle,
    fontWeight: '600',
  },

  // Empty State
  emptyStateContainer: {
    paddingVertical: SPACING[32],
    paddingHorizontal: SPACING[16],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.headline,
    color: BRAND_COLORS.navy,
    marginTop: SPACING[16],
    marginBottom: SPACING[8],
  },
  emptyStateDescription: {
    ...TYPOGRAPHY.body,
    color: BRAND_COLORS.mediumGrey,
    textAlign: 'center',
    marginBottom: SPACING[16],
  },
  emptyStateButton: {
    backgroundColor: BRAND_COLORS.green,
    paddingVertical: SPACING[10],
    paddingHorizontal: SPACING[20],
    borderRadius: 6,
  },
  emptyStateButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: BRAND_COLORS.white,
  },

  // Skeleton
  skeletonLoader: {
    backgroundColor: BRAND_COLORS.lightGrey,
    borderRadius: 6,
    marginBottom: SPACING[8],
  },
});
