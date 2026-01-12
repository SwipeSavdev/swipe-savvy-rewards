/**
 * WalletScreen - Main wallet view with balance, transactions, and actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { Card, Button, Badge, IconBox } from '../../../design-system/components/CoreComponents';
import { useAuthStore } from '../../auth/stores/authStore';
import { useWalletStore, WalletTransaction } from '../stores/walletStore';
import { dataService } from '../../../services/DataService';

type ActionButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
  colors: any;
};

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, colors }) => {
  const styles = StyleSheet.create({
    actionButton: {
      alignItems: 'center',
      gap: SPACING[2],
      flex: 1,
    },
    actionIconBox: {
      width: 56,
      height: 56,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.ghost,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.stroke,
    },
    actionLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: colors.text,
    },
  });

  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionIconBox}>
        <MaterialCommunityIcons name={icon as any} size={24} color={colors.brand} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

export function WalletScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const {
    balance,
    transactions,
    paymentMethods,
    isLoading,
    setBalance,
    setTransactions,
    setPaymentMethods,
    setLoading,
  } = useWalletStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);

      // Load wallet balance
      const walletData = await dataService.getWalletBalance();
      setBalance(walletData);

      // Load recent transactions
      const txns = await dataService.getWalletTransactions(10);
      setTransactions(txns);

      // Load payment methods
      const methods = await dataService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: balance.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionIcon = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'arrow-down-circle';
      case 'withdrawal':
        return 'arrow-up-circle';
      case 'transfer':
        return 'swap-horizontal';
      case 'payment':
        return 'cart';
      case 'refund':
        return 'cash-refund';
      default:
        return 'cash';
    }
  };

  const getTransactionColor = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return colors.success;
      case 'withdrawal':
      case 'payment':
        return colors.danger;
      default:
        return colors.brand;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      paddingHorizontal: SPACING[4],
      gap: SPACING[4],
    },
    balanceCard: {
      backgroundColor: colors.brand,
      borderRadius: RADIUS.xl,
      padding: SPACING[5],
      gap: SPACING[3],
    },
    balanceLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: 'rgba(255,255,255,0.75)',
      fontWeight: '500',
    },
    balanceAmount: {
      fontSize: 36,
      fontWeight: '800',
      color: 'white',
      letterSpacing: -1,
    },
    balanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING[2],
    },
    pendingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[1],
    },
    pendingLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: 'rgba(255,255,255,0.6)',
    },
    pendingAmount: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '600',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: SPACING[2],
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[2],
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: colors.text,
    },
    seeAllText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.brand,
      fontWeight: '600',
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING[3],
      gap: SPACING[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.stroke,
    },
    transactionIconBox: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    transactionInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    transactionDescription: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    transactionMeta: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    transactionAmount: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
    },
    paymentMethodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING[3],
      paddingHorizontal: SPACING[3],
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      marginBottom: SPACING[2],
      gap: SPACING[3],
    },
    paymentMethodInfo: {
      flex: 1,
      gap: SPACING[1],
    },
    paymentMethodTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    paymentMethodSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: SPACING[6],
      gap: SPACING[2],
    },
    emptyStateText: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const renderTransaction: ListRenderItem<WalletTransaction> = ({ item, index }) => {
    const isPositive = item.type === 'deposit' || item.type === 'refund';
    const iconColor = getTransactionColor(item.type);

    return (
      <View style={[styles.transactionItem, index === transactions.length - 1 && { borderBottomWidth: 0 }]}>
        <View style={[styles.transactionIconBox, { backgroundColor: `${iconColor}15` }]}>
          <MaterialCommunityIcons
            name={getTransactionIcon(item.type) as any}
            size={22}
            color={iconColor}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionMeta}>
            {formatDate(item.createdAt)} {item.recipientName && `• ${item.recipientName}`}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: isPositive ? colors.success : colors.text }]}>
          {isPositive ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
        </Text>
      </View>
    );
  };

  if (isLoading && transactions.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.brand} />
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
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance.available)}</Text>

          {balance.pending > 0 && (
            <View style={styles.pendingContainer}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.pendingLabel}>Pending:</Text>
              <Text style={styles.pendingAmount}>{formatCurrency(balance.pending)}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <Card padding={SPACING[4]}>
          <View style={styles.actionsContainer}>
            <ActionButton
              icon="plus"
              label="Add Money"
              onPress={() => navigation.navigate('AddMoney')}
              colors={colors}
            />
            <ActionButton
              icon="send"
              label="Send"
              onPress={() => navigation.navigate('Transfers')}
              colors={colors}
            />
            <ActionButton
              icon="arrow-down"
              label="Withdraw"
              onPress={() => navigation.navigate('Withdraw')}
              colors={colors}
            />
            <ActionButton
              icon="qrcode-scan"
              label="Scan"
              onPress={() => {}}
              colors={colors}
            />
          </View>
        </Card>

        {/* Recent Transactions */}
        <Card padding={SPACING[4]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length > 0 ? (
            <FlatList
              data={transactions.slice(0, 5)}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="wallet-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          )}
        </Card>

        {/* Payment Methods */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cards')}>
              <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.length > 0 ? (
            paymentMethods.slice(0, 2).map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.paymentMethodItem}
                onPress={() => navigation.navigate('Cards')}
              >
                <IconBox
                  icon={
                    <MaterialCommunityIcons
                      name={method.type === 'card' ? 'credit-card' : 'bank'}
                      size={20}
                      color={colors.brand}
                    />
                  }
                />
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodTitle}>
                    {method.type === 'card' ? method.brand : method.bankName} •••• {method.lastFour}
                  </Text>
                  <Text style={styles.paymentMethodSubtitle}>
                    {method.isDefault ? 'Default' : method.expiryDate ? `Expires ${method.expiryDate}` : ''}
                  </Text>
                </View>
                {method.isDefault && <Badge label="Default" variant="success" />}
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity
              style={styles.paymentMethodItem}
              onPress={() => navigation.navigate('Cards')}
            >
              <IconBox
                icon={<MaterialCommunityIcons name="plus" size={20} color={colors.brand} />}
              />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>Add Payment Method</Text>
                <Text style={styles.paymentMethodSubtitle}>Link a card or bank account</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
