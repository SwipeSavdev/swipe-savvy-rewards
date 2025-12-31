import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card, Button } from '../../../design-system/components/CoreComponents';
import { dataService, Account, Transaction } from '../../../services/DataService';

export function AccountBalanceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { accountId, accountName, accountType } = route.params || {};

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    header: {
      paddingHorizontal: SPACING[4],
      paddingVertical: SPACING[4],
      backgroundColor: getAccountColor(accountType || 'checking'),
    },
    backButton: {
      marginBottom: SPACING[3],
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: 'white',
      marginBottom: SPACING[2],
    },
    headerSubtitle: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: SPACING[3],
    },
    balanceSection: {
      alignItems: 'flex-start',
      marginBottom: SPACING[3],
    },
    balanceLabel: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: TYPOGRAPHY.fontSize.meta,
      marginBottom: SPACING[2],
    },
    balanceValue: {
      color: 'white',
      fontSize: 32,
      fontWeight: '700',
      marginBottom: SPACING[3],
    },
    actionButtons: {
      flexDirection: 'row',
      gap: SPACING[3],
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: SPACING[3],
      paddingVertical: SPACING[2],
      borderRadius: RADIUS.md,
      gap: SPACING[2],
    },
    actionButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: TYPOGRAPHY.fontSize.meta,
    },
    contentContainer: {
      padding: SPACING[4],
      paddingBottom: SPACING[10],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '600',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[3],
      marginTop: SPACING[4],
    },
    transactionItem: {
      padding: SPACING[3],
      marginBottom: SPACING[2],
      borderBottomWidth: 1,
      borderBottomColor: LIGHT_THEME.stroke,
    },
    transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[2],
    },
    transactionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: LIGHT_THEME.bg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    transactionTitle: {
      flex: 1,
      marginLeft: SPACING[3],
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    transactionAmount: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    transactionAmountNegative: {
      color: '#FF3B30',
    },
    transactionAmountPositive: {
      color: '#34C759',
    },
    transactionSubtitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING[2],
    },
    transactionDate: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    transactionStatus: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      fontWeight: '500',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: SPACING[8],
    },
    emptyText: {
      color: LIGHT_THEME.muted,
      fontSize: TYPOGRAPHY.fontSize.body,
      marginTop: SPACING[3],
    },
  });

  function getAccountColor(type: string): string {
    switch (type) {
      case 'checking':
        return '#007AFF';
      case 'savings':
        return '#34C759';
      case 'credit':
        return '#FF9500';
      default:
        return BRAND_COLORS.navy;
    }
  }

  useEffect(() => {
    loadAccountData();
  }, [accountId]);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      
      // Load balance
      if (accountId) {
        const bal = await dataService.getAccountBalance(accountId);
        setBalance(bal);
      }

      // Load transactions
      const txns = await dataService.getTransactions(20);
      setTransactions(txns);
    } catch (error) {
      console.error('Failed to load account data:', error);
      Alert.alert('Error', 'Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAccountData();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.balanceSection}>
          <Text style={styles.headerTitle}>{accountName}</Text>
          <Text style={styles.headerSubtitle}>
            {accountType?.charAt(0).toUpperCase() + accountType?.slice(1)} Account
          </Text>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceValue}>
            ${balance.toFixed(2)}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Navigate to transfers screen
              }}
            >
              <MaterialCommunityIcons name="arrow-right" size={18} color="white" />
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Navigate to transfers screen
              }}
            >
              <MaterialCommunityIcons name="arrow-left" size={18} color="white" />
              <Text style={styles.actionButtonText}>Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="history"
              size={48}
              color={LIGHT_THEME.stroke}
            />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((txn) => {
            const iconName = (() => {
              switch (txn.type) {
                case 'payment':
                  return 'credit-card';
                case 'transfer':
                  return 'swap-horizontal';
                case 'deposit':
                  return 'arrow-down';
                case 'reward':
                  return 'gift';
                default:
                  return 'wallet';
              }
            })();

            return (
              <View key={txn.id} style={styles.transactionItem}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionIconContainer}>
                    <MaterialCommunityIcons
                      name={iconName as any}
                      size={20}
                      color={getAccountColor(accountType || 'checking')}
                    />
                  </View>
                  <Text style={styles.transactionTitle}>{txn.title}</Text>
                  <Text
                    style={[
                      styles.transactionAmount,
                      txn.type === 'payment' || txn.type === 'transfer'
                        ? styles.transactionAmountNegative
                        : styles.transactionAmountPositive,
                    ]}
                  >
                    {txn.type === 'payment' || txn.type === 'transfer' ? '-' : '+'}
                    ${Math.abs(txn.amount).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.transactionSubtitle}>
                  <Text style={styles.transactionDate}>
                    {formatDate(txn.timestamp)}
                  </Text>
                  <Text style={styles.transactionStatus}>
                    {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
