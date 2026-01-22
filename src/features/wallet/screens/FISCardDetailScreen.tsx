/**
 * FISCardDetailScreen - Detailed view of a single FIS card
 *
 * Features:
 * - Card visualization
 * - Lock/unlock/freeze controls
 * - Recent transactions
 * - Card controls (spending limits, channels)
 * - PIN management
 * - Replace/cancel card options
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
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Using View with backgroundColor instead of expo-linear-gradient
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Card } from '../../../design-system/components/CoreComponents';
import { useFISCardStore } from '../stores/fisCardStore';
import type { FISCardControls } from '../../../services/FISCardService';

type RouteParams = {
  FISCardDetail: { cardId: string };
};

type CardGradient = [string, string];

const CARD_GRADIENTS: Record<string, CardGradient> = {
  visa: ['#1a1f71', '#2c3e9e'],
  mastercard: ['#eb001b', '#f79e1b'],
  default: ['#0B1F3A', '#1a3a5c'],
};

export function FISCardDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'FISCardDetail'>>();
  const { cardId } = route.params;
  const { colors } = useTheme();

  const {
    cards,
    cardControls,
    transactions,
    isLoading,
    fetchCard,
    fetchCardControls,
    fetchRecentTransactions,
    lockCard,
    unlockCard,
    freezeCard,
    unfreezeCard,
    setChannelControls,
  } = useFISCardStore();

  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const card = cards.find(c => c.id === cardId);
  const controls = cardControls[cardId];
  const cardTransactions = transactions[cardId] || [];

  useEffect(() => {
    loadCardData();
  }, [cardId]);

  const loadCardData = async () => {
    await Promise.all([
      fetchCard(cardId),
      fetchCardControls(cardId),
      fetchRecentTransactions(cardId, 5),
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCardData();
    setRefreshing(false);
  }, [cardId]);

  const handleLockToggle = async () => {
    if (!card) return;
    const isLocked = card.status === 'locked';
    const action = isLocked ? 'unlock' : 'lock';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Card`,
      `Are you sure you want to ${action} this card?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: isLocked ? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading('lock');
            if (isLocked) {
              await unlockCard(cardId);
            } else {
              await lockCard(cardId, 'User requested lock');
            }
            setActionLoading(null);
          },
        },
      ]
    );
  };

  const handleFreezeToggle = async () => {
    if (!card) return;
    const isFrozen = card.status === 'frozen';
    const action = isFrozen ? 'unfreeze' : 'freeze';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Card`,
      isFrozen
        ? 'This will reactivate your card for transactions.'
        : 'This will immediately block all transactions. Use this if you suspect fraud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: isFrozen ? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading('freeze');
            if (isFrozen) {
              await unfreezeCard(cardId);
            } else {
              await freezeCard(cardId, 'User suspected fraud');
            }
            setActionLoading(null);
          },
        },
      ]
    );
  };

  const handleChannelToggle = async (channel: keyof FISCardControls, enabled: boolean) => {
    if (!controls) return;
    setActionLoading(channel);
    await setChannelControls(cardId, { [channel]: enabled });
    setActionLoading(null);
  };

  const handleReplaceCard = () => {
    Alert.alert(
      'Replace Card',
      'Why do you need a replacement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lost',
          onPress: () => navigation.navigate('FISReplaceCard', { cardId, reason: 'lost' }),
        },
        {
          text: 'Stolen',
          style: 'destructive',
          onPress: () => navigation.navigate('FISReplaceCard', { cardId, reason: 'stolen' }),
        },
        {
          text: 'Damaged',
          onPress: () => navigation.navigate('FISReplaceCard', { cardId, reason: 'damaged' }),
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardContainer: {
      borderRadius: RADIUS.xl,
      overflow: 'hidden',
      marginBottom: SPACING[4],
    },
    cardGradient: {
      padding: SPACING[4],
      height: 200,
      justifyContent: 'space-between',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
      textAlign: 'center',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
    statusBadge: {
      paddingHorizontal: SPACING[2],
      paddingVertical: SPACING[1],
      borderRadius: RADIUS.sm,
      marginTop: SPACING[1],
    },
    statusText: {
      color: 'white',
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: SPACING[4],
    },
    actionButton: {
      alignItems: 'center',
      gap: SPACING[1],
    },
    actionIconBox: {
      width: 52,
      height: 52,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.panel2,
      borderWidth: 1,
      borderColor: colors.stroke,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.text,
      fontWeight: '500',
    },
    section: {
      marginBottom: SPACING[4],
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[3],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: colors.text,
    },
    seeAll: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.brand,
      fontWeight: '600',
    },
    controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.stroke,
    },
    controlInfo: {
      flex: 1,
      marginRight: SPACING[3],
    },
    controlTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    controlSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      marginTop: SPACING[1],
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.stroke,
      gap: SPACING[3],
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    transactionInfo: {
      flex: 1,
    },
    transactionMerchant: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    transactionDate: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    transactionAmount: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
    },
    dangerButton: {
      marginTop: SPACING[4],
      borderColor: colors.danger,
      borderWidth: 1,
    },
    dangerButtonText: {
      color: colors.danger,
    },
  });

  if (!card) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  const gradient = CARD_GRADIENTS[card.cardNetwork] || CARD_GRADIENTS.default;
  const isLocked = card.status === 'locked';
  const isFrozen = card.status === 'frozen';

  const getStatusColor = () => {
    switch (card.status) {
      case 'active': return colors.success;
      case 'locked': return '#FF9800';
      case 'frozen': return colors.danger;
      case 'pending': return '#2196F3';
      default: return colors.muted;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        {/* Card Visual */}
        <View style={styles.cardContainer}>
          <View style={[styles.cardGradient, { backgroundColor: gradient[0] }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardType}>
                  {card.cardType === 'virtual' ? 'Virtual Card' : 'Debit Card'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                  <Text style={styles.statusText}>{card.status}</Text>
                </View>
              </View>
              <Text style={styles.cardBrand}>{card.cardNetwork}</Text>
            </View>

            <Text style={styles.cardNumber}>•••• •••• •••• {card.lastFour}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.cardholderName}>{card.cardholderName}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.expiryLabel}>EXPIRES</Text>
                <Text style={styles.expiryDate}>
                  {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLockToggle} disabled={!!actionLoading}>
            <View style={[styles.actionIconBox, isLocked && { backgroundColor: '#FF980020', borderColor: '#FF9800' }]}>
              {actionLoading === 'lock' ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <MaterialCommunityIcons
                  name={isLocked ? 'lock' : 'lock-open-outline'}
                  size={24}
                  color={isLocked ? '#FF9800' : colors.brand}
                />
              )}
            </View>
            <Text style={styles.actionLabel}>{isLocked ? 'Unlock' : 'Lock'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleFreezeToggle} disabled={!!actionLoading}>
            <View style={[styles.actionIconBox, isFrozen && { backgroundColor: `${colors.danger}20`, borderColor: colors.danger }]}>
              {actionLoading === 'freeze' ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <MaterialCommunityIcons
                  name={isFrozen ? 'snowflake-off' : 'snowflake'}
                  size={24}
                  color={isFrozen ? colors.danger : colors.brand}
                />
              )}
            </View>
            <Text style={styles.actionLabel}>{isFrozen ? 'Unfreeze' : 'Freeze'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FISPinManagement', { cardId })}
          >
            <View style={styles.actionIconBox}>
              <MaterialCommunityIcons name="dialpad" size={24} color={colors.brand} />
            </View>
            <Text style={styles.actionLabel}>PIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReplaceCard}>
            <View style={styles.actionIconBox}>
              <MaterialCommunityIcons name="credit-card-refresh" size={24} color={colors.brand} />
            </View>
            <Text style={styles.actionLabel}>Replace</Text>
          </TouchableOpacity>
        </View>

        {/* Card Controls */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Card Controls</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FISCardControls', { cardId })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Online Purchases</Text>
              <Text style={styles.controlSubtitle}>Allow e-commerce transactions</Text>
            </View>
            <Switch
              value={controls?.ecommerceEnabled ?? true}
              onValueChange={(value) => handleChannelToggle('ecommerceEnabled', value)}
              disabled={actionLoading === 'ecommerceEnabled'}
              trackColor={{ false: colors.stroke, true: colors.brand }}
            />
          </View>

          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>ATM Withdrawals</Text>
              <Text style={styles.controlSubtitle}>Allow cash withdrawals</Text>
            </View>
            <Switch
              value={controls?.atmEnabled ?? true}
              onValueChange={(value) => handleChannelToggle('atmEnabled', value)}
              disabled={actionLoading === 'atmEnabled'}
              trackColor={{ false: colors.stroke, true: colors.brand }}
            />
          </View>

          <View style={[styles.controlRow, { borderBottomWidth: 0 }]}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>International</Text>
              <Text style={styles.controlSubtitle}>Allow foreign transactions</Text>
            </View>
            <Switch
              value={controls?.internationalEnabled ?? false}
              onValueChange={(value) => handleChannelToggle('internationalEnabled', value)}
              disabled={actionLoading === 'internationalEnabled'}
              trackColor={{ false: colors.stroke, true: colors.brand }}
            />
          </View>
        </Card>

        {/* Recent Transactions */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FISCardTransactions', { cardId })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {cardTransactions.length > 0 ? (
            cardTransactions.slice(0, 5).map((tx, index) => {
              const isCredit = tx.transactionType === 'refund';
              return (
                <View key={tx.id} style={[styles.transactionItem, index === 4 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.transactionIcon, { backgroundColor: `${isCredit ? colors.success : colors.brand}15` }]}>
                    <MaterialCommunityIcons
                      name={tx.transactionType === 'atm_withdrawal' ? 'cash' : 'cart'}
                      size={20}
                      color={isCredit ? colors.success : colors.brand}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionMerchant}>{tx.merchantName || 'Transaction'}</Text>
                    <Text style={styles.transactionDate}>{formatDate(tx.timestamp)}</Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: isCredit ? colors.success : colors.text }]}>
                    {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: SPACING[4] }}>
              <MaterialCommunityIcons name="receipt" size={40} color={colors.stroke} />
              <Text style={{ color: colors.muted, marginTop: SPACING[2] }}>No transactions yet</Text>
            </View>
          )}
        </Card>

        {/* Danger Zone */}
        <Card style={{ ...styles.section, marginTop: SPACING[4] }}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING[3] }]}>Card Management</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('FISTravelNotice', { cardId })}
            style={styles.controlRow}
          >
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>Travel Notice</Text>
              <Text style={styles.controlSubtitle}>Notify us about your travel plans</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('FISReportFraud', { cardId })}
            style={[styles.controlRow, { borderBottomWidth: 0 }]}
          >
            <View style={styles.controlInfo}>
              <Text style={[styles.controlTitle, { color: colors.danger }]}>Report Fraud</Text>
              <Text style={styles.controlSubtitle}>Report unauthorized activity</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}

export default FISCardDetailScreen;
