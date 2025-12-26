/**
 * CampaignsBanner.tsx
 * Horizontal scrolling banner of campaigns for home screen
 * Shows active campaigns in a visually appealing carousel
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ListRenderItem
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme'
import CampaignCard, { Campaign } from './CampaignCard'
import { MarketingAPIService } from '../../../services/MarketingAPIService'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width - SPACING.lg * 2

interface CampaignsBannerProps {
  onCampaignPress?: (campaign: Campaign) => void
  onConversion?: (campaignId: string, amount: number) => void
  containerStyle?: any
  limit?: number
  variant?: 'carousel' | 'grid' | 'stacked'
}

const CampaignsBanner: React.FC<CampaignsBannerProps> = ({
  onCampaignPress,
  onConversion,
  containerStyle,
  limit = 10,
  variant = 'carousel'
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const flatListRef = useRef<FlatList>(null)

  const marketingService = MarketingAPIService.getInstance()

  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await marketingService.getActiveCampaigns(limit)
      setCampaigns(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch campaigns:', err)
      setError('Unable to load campaigns')
      // Fallback to empty state
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchCampaigns()
  }

  const handleCampaignPress = (campaign: Campaign) => {
    if (onCampaignPress) {
      onCampaignPress(campaign)
    }
  }

  const handleConversion = (campaignId: string, amount: number) => {
    if (onConversion) {
      onConversion(campaignId, amount)
    }
  }

  const renderCarouselItem = ({ item }: { item: Campaign }) => (
    <CampaignCard
      campaign={item}
      onPress={handleCampaignPress}
      onConversion={handleConversion}
      variant="card"
    />
  )

  const renderGridItem = ({ item }: { item: Campaign }) => (
    <CampaignCard
      campaign={item}
      onPress={handleCampaignPress}
      onConversion={handleConversion}
      variant="banner"
    />
  )

  if (loading) {
    return (
      <View style={[styles.container, containerStyle, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.blue} />
        <Text style={styles.loadingText}>Loading campaigns...</Text>
      </View>
    )
  }

  if (error || campaigns.length === 0) {
    return (
      <View style={[styles.container, containerStyle, styles.emptyContainer]}>
        <MaterialCommunityIcons
          name="gift-outline"
          size={48}
          color={LIGHT_THEME.text.tertiary}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>
          {error ? 'Unable to Load Campaigns' : 'No Active Campaigns'}
        </Text>
        <Text style={styles.emptyText}>
          {error
            ? 'Please try again later'
            : 'Check back soon for exciting offers!'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={20}
            color={BRAND_COLORS.blue}
            style={styles.retryIcon}
          />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Carousel variant (horizontal scrolling)
  if (variant === 'carousel') {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>🎁 Exclusive Offers</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={BRAND_COLORS.blue}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          scrollEventThrottle={16}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + SPACING.lg}
          decelerationRate="fast"
        >
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onPress={handleCampaignPress}
              onConversion={handleConversion}
              variant="card"
            />
          ))}
        </ScrollView>

        {campaigns.length > 0 && (
          <View style={styles.pagination}>
            <Text style={styles.paginationText}>
              {campaigns.length} {campaigns.length === 1 ? 'offer' : 'offers'} available
            </Text>
            <MaterialCommunityIcons
              name="swipe-left"
              size={16}
              color={LIGHT_THEME.text.tertiary}
            />
          </View>
        )}
      </View>
    )
  }

  // Grid variant (vertical list of banners)
  if (variant === 'grid') {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>🎁 Exclusive Offers</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={BRAND_COLORS.blue}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={campaigns}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContainer}
        />
      </View>
    )
  }

  // Stacked variant (detailed cards)
  if (variant === 'stacked') {
    return (
      <View style={[styles.container, containerStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>🎁 Exclusive Offers</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={BRAND_COLORS.blue}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={campaigns}
          renderItem={({ item }) => (
            <CampaignCard
              campaign={item}
              onPress={handleCampaignPress}
              onConversion={handleConversion}
              variant="detailed"
            />
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.stackedContainer}
        />
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_THEME.background,
    paddingVertical: SPACING.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '700',
    color: LIGHT_THEME.text.primary
  },
  refreshButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: BRAND_COLORS.blue + '10'
  },

  // Loading & empty states
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: LIGHT_THEME.text.secondary,
    marginTop: SPACING.md
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: LIGHT_THEME.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: LIGHT_THEME.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: BRAND_COLORS.blue + '15',
    gap: SPACING.sm
  },
  retryIcon: {
    color: BRAND_COLORS.blue
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: BRAND_COLORS.blue
  },

  // Carousel styles
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm
  },
  paginationText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: LIGHT_THEME.text.tertiary,
    fontWeight: '500'
  },

  // Grid & stacked containers
  gridContainer: {
    paddingHorizontal: SPACING.lg
  },
  stackedContainer: {
    paddingHorizontal: 0
  }
})

export default CampaignsBanner
export type { Campaign }
