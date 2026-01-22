/**
 * FISCardsScreen - FIS Global Payment One Card Management
 *
 * Displays user's FIS debit cards with controls:
 * - Card list with status
 * - Lock/unlock functionality
 * - Quick actions (view transactions, controls, PIN)
 * - Issue new card option
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
// Using View with backgroundColor since expo-linear-gradient not installed
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../../design-system/components/CoreComponents';
import { useFISCardStore } from '../stores/fisCardStore';
import type { FISCard } from '../../../services/FISCardService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING[4] * 2;
const CARD_HEIGHT = 200;

type CardGradient = [string, string];

const CARD_GRADIENTS: Record<string, CardGradient> = {
  visa: ['#1a1f71', '#2c3e9e'],
  mastercard: ['#eb001b', '#f79e1b'],
  default: ['#0B1F3A', '#1a3a5c'],
};

interface DebitCardProps {
  card: FISCard;
  onPress: () => void;
  onLockToggle: () => void;
  isLocking: boolean;
}

const DebitCardComponent: React.FC<DebitCardProps> = ({ card, onPress, onLockToggle, isLocking }) => {
  const gradient = CARD_GRADIENTS[card.cardNetwork] || CARD_GRADIENTS.default;
  const isLocked = card.status === 'locked' || card.status === 'frozen';

  const cardStyles = StyleSheet.create({
    cardContainer: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: RADIUS.xl,
      overflow: 'hidden',
      marginBottom: SPACING[4],
    },
    gradient: {
      flex: 1,
      padding: SPACING[4],
      justifyContent: 'space-between',
    },
    lockedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    lockedText: {
      color: 'white',
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      marginTop: SPACING[2],
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardType: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    cardBrand: {
      color: 'white',
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    cardNumber: {
      color: 'white',
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '600',
      letterSpacing: 4,
      marginTop: SPACING[4],
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    cardholderName: {
      color: 'white',
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '500',
      textTransform: 'uppercase',
    },
    expiryLabel: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: TYPOGRAPHY.fontSize.xs,
    },
    expiryDate: {
      color: 'white',
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
    },
    lockButton: {
      position: 'absolute',
      top: SPACING[3],
      right: SPACING[3],
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: RADIUS.pill,
      padding: SPACING[2],
    },
    statusBadge: {
      position: 'absolute',
      top: SPACING[3],
      left: SPACING[3],
    },
    nickname: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: TYPOGRAPHY.fontSize.meta,
      marginTop: SPACING[1],
    },
  });

  const getStatusColor = () => {
    switch (card.status) {
      case 'active':
        return '#4CAF50';
      case 'locked':
        return '#FF9800';
      case 'frozen':
        return '#F44336';
      case 'pending':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={cardStyles.cardContainer}>
        <View style={[cardStyles.gradient, { backgroundColor: gradient[0] }]}>
          <View style={cardStyles.cardHeader}>
            <View>
              <Text style={cardStyles.cardType}>
                {card.cardType === 'virtual' ? 'Virtual Card' : 'Debit Card'}
              </Text>
              {card.nickname && <Text style={cardStyles.nickname}>{card.nickname}</Text>}
            </View>
            <Text style={cardStyles.cardBrand}>{card.cardNetwork}</Text>
          </View>

          <Text style={cardStyles.cardNumber}>•••• •••• •••• {card.lastFour}</Text>

          <View style={cardStyles.cardFooter}>
            <View>
              <Text style={cardStyles.cardholderName}>{card.cardholderName}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={cardStyles.expiryLabel}>EXPIRES</Text>
              <Text style={cardStyles.expiryDate}>
                {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
              </Text>
            </View>
          </View>

          {/* Lock Button */}
          <TouchableOpacity
            style={cardStyles.lockButton}
            onPress={onLockToggle}
            disabled={isLocking}
          >
            {isLocking ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialCommunityIcons
                name={isLocked ? 'lock' : 'lock-open-outline'}
                size={20}
                color="white"
              />
            )}
          </TouchableOpacity>

          {/* Status Badge */}
          {card.status !== 'active' && (
            <View style={[cardStyles.statusBadge, { backgroundColor: getStatusColor(), paddingHorizontal: SPACING[2], paddingVertical: SPACING[1], borderRadius: RADIUS.sm }]}>
              <Text style={{ color: 'white', fontSize: TYPOGRAPHY.fontSize.xs, fontWeight: '600', textTransform: 'uppercase' }}>
                {card.status}
              </Text>
            </View>
          )}

          {/* Locked Overlay */}
          {isLocked && (
            <View style={cardStyles.lockedOverlay}>
              <MaterialCommunityIcons name="lock" size={48} color="white" />
              <Text style={cardStyles.lockedText}>Card {card.status === 'frozen' ? 'Frozen' : 'Locked'}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export function FISCardsScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const {
    cards,
    isLoading,
    error,
    fetchCards,
    lockCard,
    unlockCard,
    selectCard,
  } = useFISCardStore();

  const [refreshing, setRefreshing] = useState(false);
  const [lockingCardId, setLockingCardId] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCards();
    setRefreshing(false);
  }, [fetchCards]);

  const handleLockToggle = async (card: FISCard) => {
    const isLocked = card.status === 'locked' || card.status === 'frozen';
    const action = isLocked ? 'unlock' : 'lock';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Card`,
      `Are you sure you want to ${action} this card ending in ${card.lastFour}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: isLocked ? 'default' : 'destructive',
          onPress: async () => {
            setLockingCardId(card.id);
            try {
              if (isLocked) {
                await unlockCard(card.id);
              } else {
                await lockCard(card.id, 'User requested lock');
              }
            } catch (err) {
              Alert.alert('Error', `Failed to ${action} card`);
            } finally {
              setLockingCardId(null);
            }
          },
        },
      ]
    );
  };

  const handleCardPress = (card: FISCard) => {
    selectCard(card.id);
    navigation.navigate('FISCardDetail', { cardId: card.id });
  };

  const handleIssueCard = () => {
    navigation.navigate('FISIssueCard');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      paddingHorizontal: SPACING[4],
      paddingBottom: SPACING[10],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[4],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      marginTop: SPACING[1],
    },
    issueButton: {
      backgroundColor: colors.brand,
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      borderRadius: RADIUS.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[1],
    },
    issueButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: TYPOGRAPHY.fontSize.meta,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING[6],
      marginTop: SPACING[10],
    },
    emptyIcon: {
      marginBottom: SPACING[4],
    },
    emptyTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING[2],
      textAlign: 'center',
    },
    emptyText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      textAlign: 'center',
      marginBottom: SPACING[4],
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING[3],
      marginTop: SPACING[2],
    },
    quickActionCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      padding: SPACING[3],
      borderWidth: 1,
      borderColor: colors.stroke,
    },
    quickActionIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      backgroundColor: `${colors.brand}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING[2],
    },
    quickActionTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    quickActionSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      marginTop: SPACING[1],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: colors.text,
      marginTop: SPACING[4],
      marginBottom: SPACING[3],
    },
    errorContainer: {
      backgroundColor: `${colors.danger}15`,
      borderRadius: RADIUS.md,
      padding: SPACING[3],
      marginBottom: SPACING[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[2],
    },
    errorText: {
      color: colors.danger,
      fontSize: TYPOGRAPHY.fontSize.meta,
      flex: 1,
    },
  });

  if (isLoading && cards.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={{ color: colors.muted, marginTop: SPACING[2] }}>Loading your cards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Cards</Text>
            <Text style={styles.subtitle}>{cards.length} card{cards.length !== 1 ? 's' : ''} linked</Text>
          </View>
          <TouchableOpacity style={styles.issueButton} onPress={handleIssueCard}>
            <Ionicons name="add" size={18} color="white" />
            <Text style={styles.issueButtonText}>New Card</Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Cards List */}
        {cards.length > 0 ? (
          <>
            {cards.map((card) => (
              <DebitCardComponent
                key={card.id}
                card={card}
                onPress={() => handleCardPress(card)}
                onLockToggle={() => handleLockToggle(card)}
                isLocking={lockingCardId === card.id}
              />
            ))}

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => cards.length > 0 && navigation.navigate('FISCardTransactions', { cardId: cards[0].id })}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialCommunityIcons name="format-list-bulleted" size={22} color={colors.brand} />
                </View>
                <Text style={styles.quickActionTitle}>Transactions</Text>
                <Text style={styles.quickActionSubtitle}>View card activity</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => cards.length > 0 && navigation.navigate('FISCardControls', { cardId: cards[0].id })}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialCommunityIcons name="tune-vertical" size={22} color={colors.brand} />
                </View>
                <Text style={styles.quickActionTitle}>Card Controls</Text>
                <Text style={styles.quickActionSubtitle}>Limits & settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => cards.length > 0 && navigation.navigate('FISPinManagement', { cardId: cards[0].id })}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialCommunityIcons name="lock-outline" size={22} color={colors.brand} />
                </View>
                <Text style={styles.quickActionTitle}>PIN</Text>
                <Text style={styles.quickActionSubtitle}>Set or change PIN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('FISDigitalWallet')}
              >
                <View style={styles.quickActionIcon}>
                  <MaterialCommunityIcons name="wallet-outline" size={22} color={colors.brand} />
                </View>
                <Text style={styles.quickActionTitle}>Digital Wallet</Text>
                <Text style={styles.quickActionSubtitle}>Apple Pay, Google Pay</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="credit-card-plus-outline" size={80} color={colors.stroke} />
            </View>
            <Text style={styles.emptyTitle}>No Cards Yet</Text>
            <Text style={styles.emptyText}>
              Get your SwipeSavvy debit card to start earning rewards on every purchase.
            </Text>
            <Button onPress={handleIssueCard}>
              Get Your First Card
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default FISCardsScreen;
