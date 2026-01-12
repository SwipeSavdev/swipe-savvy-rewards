import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  RefreshControl,
  Share,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card, Badge } from '../../../design-system/components/CoreComponents';
import { dataService, MerchantDeal } from '../../../services/DataService';
import * as Clipboard from 'expo-clipboard';

const DEAL_TYPES = [
  { key: 'all', label: 'All Deals' },
  { key: 'percentage_off', label: '% Off' },
  { key: 'fixed_amount', label: '$ Off' },
  { key: 'cashback_boost', label: 'Cashback' },
  { key: 'points_multiplier', label: 'Points' },
  { key: 'bogo', label: 'BOGO' },
];

export function DealsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [deals, setDeals] = useState<MerchantDeal[]>([]);
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);

  const loadDeals = useCallback(async () => {
    try {
      const res = await dataService.getMerchantDeals({
        deal_type: selectedType === 'all' ? undefined : selectedType,
      });
      setDeals(res.deals || []);
    } catch (error) {
      console.debug('Error loading deals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDeals();
  }, [loadDeals]);

  const copyPromoCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', `Promo code "${code}" copied to clipboard`);
  };

  const shareDeal = async (deal: MerchantDeal) => {
    try {
      await Share.share({
        message: `Check out this deal at ${deal.merchant_name}: ${deal.title}${deal.promo_code ? ` - Use code: ${deal.promo_code}` : ''}`,
        title: deal.title,
      });
    } catch (error) {
      console.debug('Error sharing deal:', error);
    }
  };

  const formatDealValue = (deal: MerchantDeal): string => {
    if (deal.deal_type === 'percentage_off') {
      return `${deal.discount_value}%`;
    } else if (deal.deal_type === 'fixed_amount') {
      return `$${deal.discount_value}`;
    } else if (deal.deal_type === 'cashback_boost') {
      return `+${deal.discount_value}%`;
    } else if (deal.deal_type === 'points_multiplier') {
      return `${deal.discount_value}x`;
    } else if (deal.deal_type === 'bogo') {
      return 'BOGO';
    }
    return '';
  };

  const formatDealType = (type: string): string => {
    const typeMap: Record<string, string> = {
      percentage_off: 'Discount',
      fixed_amount: 'Savings',
      cashback_boost: 'Cashback',
      points_multiplier: 'Points',
      bogo: 'Buy One Get One',
      free_item: 'Free Item',
    };
    return typeMap[type] || type;
  };

  const formatExpiresIn = (endDate: string): { text: string; urgent: boolean } => {
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { text: 'Expired', urgent: true };
    if (diffDays === 1) return { text: 'Ends today!', urgent: true };
    if (diffDays <= 3) return { text: `${diffDays} days left`, urgent: true };
    if (diffDays <= 7) return { text: `${diffDays} days left`, urgent: false };
    return { text: `Ends ${end.toLocaleDateString()}`, urgent: false };
  };

  const getDealIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      percentage_off: 'percent',
      fixed_amount: 'currency-usd',
      cashback_boost: 'cash-refund',
      points_multiplier: 'star-circle',
      bogo: 'gift',
      free_item: 'gift-outline',
    };
    return iconMap[type] || 'tag';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      gap: SPACING[4],
    },
    // Filter Tabs
    filterScroll: {
      paddingHorizontal: SPACING[4],
    },
    filterTabs: {
      flexDirection: 'row',
      gap: SPACING[2],
    },
    filterTab: {
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      borderRadius: RADIUS.pill,
      backgroundColor: LIGHT_THEME.panel2,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    filterTabActive: {
      backgroundColor: BRAND_COLORS.navy,
      borderColor: BRAND_COLORS.navy,
    },
    filterTabText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '500',
      color: LIGHT_THEME.muted,
    },
    filterTabTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    // Deals List
    dealsSection: {
      paddingHorizontal: SPACING[4],
    },
    // Deal Card
    dealCard: {
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      marginBottom: SPACING[3],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    dealCardFeatured: {
      borderColor: BRAND_COLORS.yellow,
      borderWidth: 2,
    },
    dealHeader: {
      flexDirection: 'row',
      padding: SPACING[3],
      gap: SPACING[3],
    },
    dealIconBox: {
      width: 56,
      height: 56,
      borderRadius: RADIUS.lg,
      backgroundColor: BRAND_COLORS.yellow,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dealMainInfo: {
      flex: 1,
    },
    dealMerchant: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '500',
      color: LIGHT_THEME.muted,
      marginBottom: 2,
    },
    dealTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[1],
    },
    dealMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[2],
    },
    dealType: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: BRAND_COLORS.navy,
      fontWeight: '600',
    },
    dealExpiry: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    dealExpiryUrgent: {
      color: '#EF4444',
      fontWeight: '600',
    },
    dealValueBox: {
      alignItems: 'flex-end',
    },
    dealValue: {
      fontSize: 22,
      fontWeight: '800',
      color: BRAND_COLORS.deep,
      fontFamily: TYPOGRAPHY.fontFamily.mono,
    },
    dealValueLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    // Expanded Content
    dealExpanded: {
      paddingHorizontal: SPACING[3],
      paddingBottom: SPACING[3],
      borderTopWidth: 1,
      borderTopColor: LIGHT_THEME.stroke,
      paddingTop: SPACING[3],
    },
    dealDescription: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.text,
      lineHeight: 22,
      marginBottom: SPACING[3],
    },
    dealTerms: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      fontStyle: 'italic',
      marginBottom: SPACING[3],
    },
    dealPromoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: LIGHT_THEME.bg,
      borderRadius: RADIUS.md,
      padding: SPACING[3],
      marginBottom: SPACING[3],
      gap: SPACING[3],
    },
    dealPromoCode: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: '800',
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      color: BRAND_COLORS.deep,
      letterSpacing: 1,
    },
    dealPromoButton: {
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      backgroundColor: BRAND_COLORS.navy,
      borderRadius: RADIUS.md,
    },
    dealPromoButtonText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    dealActions: {
      flexDirection: 'row',
      gap: SPACING[2],
    },
    dealActionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      backgroundColor: LIGHT_THEME.bg,
      borderRadius: RADIUS.md,
      gap: SPACING[1],
    },
    dealActionText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: BRAND_COLORS.navy,
    },
    dealStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: SPACING[2],
      borderTopWidth: 1,
      borderTopColor: LIGHT_THEME.stroke,
      marginTop: SPACING[2],
    },
    dealStat: {
      alignItems: 'center',
    },
    dealStatValue: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    dealStatLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    // Featured Badge
    featuredBadge: {
      position: 'absolute',
      top: SPACING[2],
      right: SPACING[2],
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: BRAND_COLORS.yellow,
      paddingVertical: 2,
      paddingHorizontal: SPACING[2],
      borderRadius: RADIUS.pill,
    },
    featuredBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: BRAND_COLORS.deep,
    },
    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: SPACING[8],
      paddingHorizontal: SPACING[4],
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: LIGHT_THEME.muted,
      textAlign: 'center',
      marginTop: SPACING[3],
    },
    // Expand indicator
    expandIndicator: {
      alignItems: 'center',
      paddingVertical: SPACING[2],
      borderTopWidth: 1,
      borderTopColor: LIGHT_THEME.stroke,
    },
  });

  const renderDealCard: ListRenderItem<MerchantDeal> = ({ item }) => {
    const isExpanded = expandedDeal === item.id;
    const expiry = formatExpiresIn(item.end_date);

    return (
      <TouchableOpacity
        style={[styles.dealCard, item.is_featured && styles.dealCardFeatured]}
        activeOpacity={0.9}
        onPress={() => setExpandedDeal(isExpanded ? null : item.id)}
      >
        {item.is_featured && (
          <View style={styles.featuredBadge}>
            <MaterialCommunityIcons name="star" size={10} color={BRAND_COLORS.deep} />
            <Text style={styles.featuredBadgeText}>FEATURED</Text>
          </View>
        )}

        <View style={styles.dealHeader}>
          <View style={styles.dealIconBox}>
            <MaterialCommunityIcons
              name={getDealIcon(item.deal_type) as any}
              size={28}
              color={BRAND_COLORS.deep}
            />
          </View>

          <View style={styles.dealMainInfo}>
            <Text style={styles.dealMerchant}>{item.merchant_name}</Text>
            <Text style={styles.dealTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.dealMeta}>
              <Text style={styles.dealType}>{formatDealType(item.deal_type)}</Text>
              <Text style={[styles.dealExpiry, expiry.urgent && styles.dealExpiryUrgent]}>
                {expiry.text}
              </Text>
            </View>
          </View>

          <View style={styles.dealValueBox}>
            <Text style={styles.dealValue}>{formatDealValue(item)}</Text>
            <Text style={styles.dealValueLabel}>OFF</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.dealExpanded}>
            {item.description && (
              <Text style={styles.dealDescription}>{item.description}</Text>
            )}

            {item.terms_and_conditions && (
              <Text style={styles.dealTerms}>{item.terms_and_conditions}</Text>
            )}

            {item.promo_code && (
              <View style={styles.dealPromoSection}>
                <MaterialCommunityIcons name="ticket-percent" size={24} color={BRAND_COLORS.navy} />
                <Text style={styles.dealPromoCode}>{item.promo_code}</Text>
                <TouchableOpacity
                  style={styles.dealPromoButton}
                  onPress={() => copyPromoCode(item.promo_code!)}
                >
                  <Text style={styles.dealPromoButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.min_purchase && item.min_purchase > 0 && (
              <Text style={styles.dealTerms}>
                Minimum purchase: ${item.min_purchase.toFixed(2)}
              </Text>
            )}

            <View style={styles.dealActions}>
              <TouchableOpacity style={styles.dealActionButton} onPress={() => shareDeal(item)}>
                <MaterialCommunityIcons name="share-variant" size={16} color={BRAND_COLORS.navy} />
                <Text style={styles.dealActionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dealActionButton}>
                <MaterialCommunityIcons name="bookmark-outline" size={16} color={BRAND_COLORS.navy} />
                <Text style={styles.dealActionText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dealActionButton}>
                <MaterialCommunityIcons name="store" size={16} color={BRAND_COLORS.navy} />
                <Text style={styles.dealActionText}>View Store</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dealStats}>
              <View style={styles.dealStat}>
                <Text style={styles.dealStatValue}>{item.redemption_count}</Text>
                <Text style={styles.dealStatLabel}>Redeemed</Text>
              </View>
              <View style={styles.dealStat}>
                <Text style={styles.dealStatValue}>{item.view_count}</Text>
                <Text style={styles.dealStatLabel}>Views</Text>
              </View>
              <View style={styles.dealStat}>
                <Text style={styles.dealStatValue}>
                  {item.per_user_limit === 1 ? '1x' : `${item.per_user_limit}x`}
                </Text>
                <Text style={styles.dealStatLabel}>Per User</Text>
              </View>
            </View>
          </View>
        )}

        {!isExpanded && (
          <View style={styles.expandIndicator}>
            <MaterialCommunityIcons name="chevron-down" size={20} color={LIGHT_THEME.muted} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <View style={styles.filterTabs}>
            {DEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[styles.filterTab, selectedType === type.key && styles.filterTabActive]}
                onPress={() => setSelectedType(type.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedType === type.key && styles.filterTabTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Deals List */}
        <View style={styles.dealsSection}>
          {deals.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="tag-off" size={48} color={LIGHT_THEME.muted} />
              <Text style={styles.emptyText}>
                No deals found.{'\n'}Try selecting a different filter.
              </Text>
            </View>
          ) : (
            <FlatList
              data={deals}
              renderItem={renderDealCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default DealsScreen;
