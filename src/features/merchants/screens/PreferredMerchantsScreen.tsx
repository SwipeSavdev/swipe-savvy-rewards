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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { dataService, PreferredMerchant, MerchantDeal } from '../../../services/DataService';
import { useLocationServices } from '../../../packages/location-sdk/src';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'view-grid' },
  { key: 'restaurant', label: 'Food', icon: 'food' },
  { key: 'retail', label: 'Retail', icon: 'shopping' },
  { key: 'grocery', label: 'Grocery', icon: 'cart' },
  { key: 'gas', label: 'Gas', icon: 'gas-station' },
  { key: 'entertainment', label: 'Fun', icon: 'movie-open' },
  { key: 'travel', label: 'Travel', icon: 'airplane' },
];

export function PreferredMerchantsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [merchants, setMerchants] = useState<PreferredMerchant[]>([]);
  const [featuredDeals, setFeaturedDeals] = useState<MerchantDeal[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Location services integration
  const { location, formatDistance } = useLocationServices();
  const { currentPosition, isLoading: locationLoading, requestPermissions, getCurrentPosition } = location;

  // Request location on mount
  useEffect(() => {
    const initLocation = async () => {
      const granted = await requestPermissions();
      if (granted) {
        setLocationEnabled(true);
        await getCurrentPosition();
      }
    };
    initLocation();
  }, [requestPermissions, getCurrentPosition]);

  const loadData = useCallback(async () => {
    try {
      const [merchantsRes, dealsRes] = await Promise.all([
        dataService.getPreferredMerchants({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          latitude: currentPosition?.latitude,
          longitude: currentPosition?.longitude,
        }),
        dataService.getMerchantDeals({ featured_only: true }),
      ]);
      setMerchants(merchantsRes.preferred_merchants || []);
      setFeaturedDeals(dealsRes.deals || []);
    } catch (error) {
      console.debug('Error loading merchants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, currentPosition]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'platinum':
        return '#7C3AED';
      case 'gold':
        return '#F59E0B';
      case 'silver':
        return '#6B7280';
      case 'bronze':
        return '#B45309';
      default:
        return LIGHT_THEME.muted;
    }
  };

  const getCategoryIcon = (category: string): string => {
    const cat = CATEGORIES.find((c) => c.key === category);
    return cat?.icon || 'store';
  };

  const formatDealValue = (deal: MerchantDeal): string => {
    if (deal.deal_type === 'percentage_off') {
      return `${deal.discount_value}% OFF`;
    } else if (deal.deal_type === 'fixed_amount') {
      return `$${deal.discount_value} OFF`;
    } else if (deal.deal_type === 'cashback_boost') {
      return `+${deal.discount_value}% Cashback`;
    } else if (deal.deal_type === 'points_multiplier') {
      return `${deal.discount_value}x Points`;
    }
    return deal.title;
  };

  const formatExpiresIn = (endDate: string): string => {
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Ends today';
    if (diffDays <= 7) return `${diffDays} days left`;
    return `Ends ${end.toLocaleDateString()}`;
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
    // Category Tabs
    categoryScroll: {
      paddingHorizontal: SPACING[4],
    },
    categoryTabs: {
      flexDirection: 'row',
      gap: SPACING[2],
    },
    categoryTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      borderRadius: RADIUS.pill,
      backgroundColor: LIGHT_THEME.panel2,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      gap: SPACING[1],
    },
    categoryTabActive: {
      backgroundColor: BRAND_COLORS.yellow,
      borderColor: BRAND_COLORS.yellow,
    },
    categoryTabText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '500',
      color: LIGHT_THEME.muted,
    },
    categoryTabTextActive: {
      color: BRAND_COLORS.deep,
      fontWeight: '600',
    },
    // Featured Deals Section
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING[4],
      marginBottom: SPACING[2],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[1],
    },
    seeAllText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: BRAND_COLORS.navy,
    },
    dealsScroll: {
      paddingLeft: SPACING[4],
    },
    dealCard: {
      width: 280,
      marginRight: SPACING[3],
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    dealHeader: {
      backgroundColor: BRAND_COLORS.yellow,
      padding: SPACING[3],
    },
    dealMerchant: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '500',
      color: 'rgba(19,33,54,0.7)',
    },
    dealValue: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: '800',
      color: BRAND_COLORS.deep,
      marginTop: SPACING[1],
    },
    dealBody: {
      padding: SPACING[3],
    },
    dealTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[1],
    },
    dealExpiry: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    dealPromo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING[2],
      padding: SPACING[2],
      backgroundColor: LIGHT_THEME.bg,
      borderRadius: RADIUS.md,
      gap: SPACING[2],
    },
    dealPromoCode: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      fontFamily: TYPOGRAPHY.fontFamily.mono,
      color: BRAND_COLORS.deep,
    },
    // Merchant List
    merchantsSection: {
      paddingHorizontal: SPACING[4],
    },
    merchantCard: {
      flexDirection: 'row',
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.lg,
      padding: SPACING[3],
      marginBottom: SPACING[3],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      gap: SPACING[3],
    },
    merchantFeatured: {
      borderColor: BRAND_COLORS.yellow,
      borderWidth: 2,
    },
    merchantIcon: {
      width: 56,
      height: 56,
      borderRadius: RADIUS.lg,
      backgroundColor: LIGHT_THEME.bg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    merchantLogo: {
      width: 56,
      height: 56,
      borderRadius: RADIUS.lg,
    },
    merchantInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    merchantNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[2],
      marginBottom: SPACING[1],
    },
    merchantName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    merchantCategory: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    merchantRewards: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[3],
      marginTop: SPACING[1],
    },
    rewardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[1],
    },
    rewardText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: BRAND_COLORS.navy,
    },
    merchantRight: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    dealsCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[1],
      paddingVertical: SPACING[1],
      paddingHorizontal: SPACING[2],
      backgroundColor: BRAND_COLORS.yellow,
      borderRadius: RADIUS.pill,
    },
    dealsCountText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '700',
      color: BRAND_COLORS.deep,
    },
    tierBadge: {
      marginTop: SPACING[2],
      paddingVertical: 2,
      paddingHorizontal: SPACING[2],
      borderRadius: RADIUS.pill,
    },
    tierBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
    // Distance
    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginTop: SPACING[1],
    },
    distanceText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
  });

  const renderDealCard: ListRenderItem<MerchantDeal> = ({ item }) => (
    <TouchableOpacity style={styles.dealCard} activeOpacity={0.8}>
      <View style={styles.dealHeader}>
        <Text style={styles.dealMerchant}>{item.merchant_name}</Text>
        <Text style={styles.dealValue}>{formatDealValue(item)}</Text>
      </View>
      <View style={styles.dealBody}>
        <Text style={styles.dealTitle}>{item.title}</Text>
        <Text style={styles.dealExpiry}>{formatExpiresIn(item.end_date)}</Text>
        {item.promo_code && (
          <View style={styles.dealPromo}>
            <MaterialCommunityIcons name="ticket-percent" size={16} color={BRAND_COLORS.navy} />
            <Text style={styles.dealPromoCode}>{item.promo_code}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMerchantCard: ListRenderItem<PreferredMerchant> = ({ item }) => (
    <TouchableOpacity
      style={[styles.merchantCard, item.is_featured && styles.merchantFeatured]}
      activeOpacity={0.8}
    >
      <View style={styles.merchantIcon}>
        {item.logo_url ? (
          <Image source={{ uri: item.logo_url }} style={styles.merchantLogo} />
        ) : (
          <MaterialCommunityIcons
            name={getCategoryIcon(item.category) as any}
            size={28}
            color={BRAND_COLORS.navy}
          />
        )}
      </View>

      <View style={styles.merchantInfo}>
        <View style={styles.merchantNameRow}>
          <Text style={styles.merchantName}>{item.display_name || item.merchant_name}</Text>
          {item.is_featured && (
            <MaterialCommunityIcons name="star" size={16} color={BRAND_COLORS.yellow} />
          )}
        </View>
        <Text style={styles.merchantCategory}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
        <View style={styles.merchantRewards}>
          <View style={styles.rewardItem}>
            <MaterialCommunityIcons name="cash-refund" size={14} color={BRAND_COLORS.navy} />
            <Text style={styles.rewardText}>{item.cashback_percentage}%</Text>
          </View>
          <View style={styles.rewardItem}>
            <MaterialCommunityIcons name="multiplication" size={14} color={BRAND_COLORS.navy} />
            <Text style={styles.rewardText}>{item.bonus_points_multiplier}x pts</Text>
          </View>
        </View>
        {item.distance_km !== undefined && locationEnabled && (
          <View style={styles.distanceBadge}>
            <MaterialCommunityIcons name="map-marker" size={12} color={LIGHT_THEME.muted} />
            <Text style={styles.distanceText}>{formatDistance(item.distance_km * 1000)} away</Text>
          </View>
        )}
      </View>

      <View style={styles.merchantRight}>
        {item.deals_count > 0 && (
          <View style={styles.dealsCount}>
            <MaterialCommunityIcons name="tag" size={12} color={BRAND_COLORS.deep} />
            <Text style={styles.dealsCountText}>{item.deals_count} deals</Text>
          </View>
        )}
        {item.subscription_tier && item.subscription_tier !== 'free' && (
          <View
            style={[
              styles.tierBadge,
              { backgroundColor: `${getTierColor(item.subscription_tier)}20` },
            ]}
          >
            <Text style={[styles.tierBadgeText, { color: getTierColor(item.subscription_tier) }]}>
              {item.subscription_tier}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <View style={styles.categoryTabs}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryTab, selectedCategory === cat.key && styles.categoryTabActive]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={16}
                  color={selectedCategory === cat.key ? BRAND_COLORS.deep : LIGHT_THEME.muted}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === cat.key && styles.categoryTabTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Featured Deals */}
        {featuredDeals.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hot Deals</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={BRAND_COLORS.navy} />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={featuredDeals}
              renderItem={renderDealCard}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dealsScroll}
            />
          </View>
        )}

        {/* Preferred Merchants */}
        <View style={styles.merchantsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'All Partners' : `${CATEGORIES.find(c => c.key === selectedCategory)?.label} Partners`}
            </Text>
          </View>

          {merchants.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="store-search" size={48} color={LIGHT_THEME.muted} />
              <Text style={styles.emptyText}>
                No merchants found in this category.{'\n'}Try selecting a different category.
              </Text>
            </View>
          ) : (
            <FlatList
              data={merchants}
              renderItem={renderMerchantCard}
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

export default PreferredMerchantsScreen;
