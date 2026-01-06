/**
 * CampaignCard.tsx
 * Individual campaign display component for mobile app
 * Shows campaign offer, merchant info, and conversion tracking
 */

// @ts-nocheck - Theme system incompatibility with marketing components

import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme'
import { MarketingAPIService } from '../../../services/MarketingAPIService'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width - SPACING.lg * 2

export interface Campaign {
  id: string
  name: string
  type: 'vip' | 'loyalty' | 'location' | 'reengagement' | 'welcome' | 'milestone' | 'challenge'
  content: string
  image?: string
  startDate: string
  endDate: string
  merchantNetwork?: string
  offerValue?: number
  offerType?: 'cashback' | 'discount' | 'points' | 'bonus'
  conversionRate?: number
  viewsCount?: number
  targetAudience?: string
}

interface CampaignCardProps {
  campaign: Campaign
  onPress?: (campaign: Campaign) => void
  onConversion?: (campaignId: string, amount: number) => void
  variant?: 'card' | 'banner' | 'detailed'
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onPress,
  onConversion,
  variant = 'card'
}) => {
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState(false)
  const [viewed, setViewed] = useState(false)

  const marketingService = MarketingAPIService.getInstance()

  // Track view when component mounts
  useEffect(() => {
    trackCampaignView()
  }, [campaign.id])

  const trackCampaignView = async () => {
    if (viewed) return

    try {
      setTracking(true)
      await marketingService.recordCampaignView(campaign.id)
      setViewed(true)
    } catch (error) {
      console.error('Failed to track campaign view:', error)
    } finally {
      setTracking(false)
    }
  }

  const handleCampaignTap = () => {
    if (onPress) {
      onPress(campaign)
    }
  }

  const handleApplyOffer = async () => {
    setLoading(true)
    try {
      // In a real app, this would complete the offer/transaction
      // For now, we'll track it as a conversion with a sample amount
      const amount = campaign.offerValue || 50

      await marketingService.recordCampaignConversion(
        campaign.id,
        amount,
        [
          {
            id: 'item_1',
            name: campaign.name,
            quantity: 1,
            price: amount
          }
        ]
      )

      if (onConversion) {
        onConversion(campaign.id, amount)
      }

      Alert.alert(
        'Success',
        `You've successfully applied the ${campaign.name} offer!`,
        [{ text: 'OK' }]
      )
    } catch (error) {
      console.error('Failed to record conversion:', error)
      Alert.alert('Error', 'Failed to apply offer. Please try again.', [
        { text: 'OK' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getCampaignIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      vip: '👑',
      loyalty: '⭐',
      location: '📍',
      reengagement: '🔄',
      welcome: '🎁',
      milestone: '🎯',
      challenge: '🎲'
    }
    return icons[type] || '✨'
  }

  const getCampaignColor = (type: string) => {
    const colors: { [key: string]: string } = {
      vip: BRAND_COLORS.purple,
      loyalty: BRAND_COLORS.orange,
      location: BRAND_COLORS.blue,
      reengagement: BRAND_COLORS.red,
      welcome: BRAND_COLORS.green,
      milestone: BRAND_COLORS.yellow,
      challenge: BRAND_COLORS.pink
    }
    return colors[type] || BRAND_COLORS.blue
  }

  if (variant === 'banner') {
    return (
      <TouchableOpacity
        style={[styles.banner, { backgroundColor: getCampaignColor(campaign.type) }]}
        onPress={handleCampaignTap}
        activeOpacity={0.7}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerIcon}>{getCampaignIcon(campaign.type)}</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle} numberOfLines={2}>
              {campaign.name}
            </Text>
            {campaign.offerValue && (
              <Text style={styles.bannerOffer}>
                {campaign.offerType === 'discount'
                  ? `${campaign.offerValue}% Off`
                  : campaign.offerType === 'cashback'
                  ? `${campaign.offerValue}% Cashback`
                  : `+${campaign.offerValue} Points`}
              </Text>
            )}
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={LIGHT_THEME.text.primary}
          />
        </View>
      </TouchableOpacity>
    )
  }

  if (variant === 'detailed') {
    return (
      <View
        style={[
          styles.detailedCard,
          { borderLeftColor: getCampaignColor(campaign.type) }
        ]}
      >
        <View style={styles.detailedHeader}>
          <View style={styles.detailedTitleContainer}>
            <Text style={styles.detailedIcon}>{getCampaignIcon(campaign.type)}</Text>
            <View style={styles.detailedTitleContent}>
              <Text style={styles.detailedTitle} numberOfLines={2}>
                {campaign.name}
              </Text>
              <Text style={styles.detailedType}>{campaign.type.toUpperCase()}</Text>
            </View>
          </View>
          {campaign.conversionRate && (
            <View style={styles.detailedBadge}>
              <Text style={styles.detailedBadgeText}>
                {campaign.conversionRate.toFixed(1)}%
              </Text>
              <Text style={styles.detailedBadgeLabel}>Convert</Text>
            </View>
          )}
        </View>

        <Text style={styles.detailedContent} numberOfLines={3}>
          {campaign.content}
        </Text>

        <View style={styles.detailedStats}>
          {campaign.viewsCount && (
            <View style={styles.detailedStat}>
              <MaterialCommunityIcons
                name="eye"
                size={16}
                color={BRAND_COLORS.blue}
              />
              <Text style={styles.detailedStatText}>
                {campaign.viewsCount.toLocaleString()} views
              </Text>
            </View>
          )}
          {campaign.offerValue && (
            <View style={styles.detailedStat}>
              <MaterialCommunityIcons
                name="gift"
                size={16}
                color={BRAND_COLORS.green}
              />
              <Text style={styles.detailedStatText}>
                {campaign.offerType === 'discount'
                  ? `${campaign.offerValue}% off`
                  : campaign.offerType === 'cashback'
                  ? `${campaign.offerValue}% back`
                  : `${campaign.offerValue} pts`}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.detailedButton,
            { backgroundColor: getCampaignColor(campaign.type) }
          ]}
          onPress={handleApplyOffer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={LIGHT_THEME.background} size="small" />
          ) : (
            <Text style={styles.detailedButtonText}>Apply Offer</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.detailedExpiry}>
          Expires {new Date(campaign.endDate).toLocaleDateString()}
        </Text>
      </View>
    )
  }

  // Default card variant
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCampaignTap}
      activeOpacity={0.8}
    >
      {campaign.image && (
        <Image
          source={{ uri: campaign.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}

      <View
        style={[
          styles.cardOverlay,
          { backgroundColor: getCampaignColor(campaign.type) }
        ]}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{getCampaignIcon(campaign.type)}</Text>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {campaign.name}
            </Text>
            {campaign.offerValue && (
              <Text style={styles.cardOffer}>
                {campaign.offerType === 'discount'
                  ? `${campaign.offerValue}% Off`
                  : campaign.offerType === 'cashback'
                  ? `${campaign.offerValue}% Cashback`
                  : `+${campaign.offerValue} Points`}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {campaign.content}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.cardStats}>
            {campaign.viewsCount && (
              <Text style={styles.cardStat}>👁️ {campaign.viewsCount.toLocaleString()}</Text>
            )}
            {campaign.conversionRate && (
              <Text style={styles.cardStat}>📈 {campaign.conversionRate.toFixed(1)}%</Text>
            )}
          </View>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={LIGHT_THEME.background}
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Banner styles
  banner: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md
  },
  bannerIcon: {
    fontSize: 28
  },
  bannerText: {
    flex: 1
  },
  bannerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: LIGHT_THEME.text.primary,
    marginBottom: SPACING.xs
  },
  bannerOffer: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: LIGHT_THEME.text.secondary,
    fontWeight: '500'
  },

  // Card styles
  card: {
    width: CARD_WIDTH,
    height: 180,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.75
  },
  cardContent: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md
  },
  cardIcon: {
    fontSize: 32
  },
  cardTitleContainer: {
    flex: 1
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: LIGHT_THEME.background,
    marginBottom: SPACING.xs
  },
  cardOffer: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: LIGHT_THEME.background,
    opacity: 0.9
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: LIGHT_THEME.background,
    opacity: 0.85,
    lineHeight: 18
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md
  },
  cardStats: {
    flexDirection: 'row',
    gap: SPACING.lg
  },
  cardStat: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: LIGHT_THEME.background,
    fontWeight: '500'
  },

  // Detailed card styles
  detailedCard: {
    backgroundColor: LIGHT_THEME.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md
  },
  detailedTitleContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.md
  },
  detailedIcon: {
    fontSize: 28
  },
  detailedTitleContent: {
    flex: 1
  },
  detailedTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: LIGHT_THEME.text.primary,
    marginBottom: SPACING.xs
  },
  detailedType: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: LIGHT_THEME.text.tertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  detailedBadge: {
    backgroundColor: BRAND_COLORS.blue + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignItems: 'center'
  },
  detailedBadgeText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: BRAND_COLORS.blue
  },
  detailedBadgeLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: BRAND_COLORS.blue,
    fontWeight: '500'
  },
  detailedContent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: LIGHT_THEME.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.md
  },
  detailedStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border
  },
  detailedStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  detailedStatText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: LIGHT_THEME.text.secondary,
    fontWeight: '500'
  },
  detailedButton: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm
  },
  detailedButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: LIGHT_THEME.background
  },
  detailedExpiry: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: LIGHT_THEME.text.tertiary,
    textAlign: 'center'
  }
})

export default CampaignCard
