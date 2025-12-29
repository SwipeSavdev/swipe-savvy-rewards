import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card } from '../../../design-system/components/CoreComponents';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  icon: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Whole Foods Market', amount: 8950, date: 'Dec 20, 2024', icon: 'cart' },
  { id: '2', title: 'Trader Joe\'s', amount: 5230, date: 'Dec 18, 2024', icon: 'cart' },
  { id: '3', title: 'Sprouts Farmers', amount: 4120, date: 'Dec 16, 2024', icon: 'cart' },
  { id: '4', title: 'Costco', amount: 13850, date: 'Dec 12, 2024', icon: 'cart' },
];

export function BudgetDetailScreen() {
  const route = useRoute();
  const { budgetId } = route.params as { budgetId: string };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState({
    name: 'Groceries',
    limit: 50000,
    spent: 32150,
    color: BRAND_COLORS.green,
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setTransactions(MOCK_TRANSACTIONS);
    } catch (error) {
      setTransactions(MOCK_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: LIGHT_THEME.bg,
    },
    contentContainer: {
      paddingVertical: SPACING[4],
      paddingHorizontal: SPACING[4],
    },
    header: {
      marginBottom: SPACING[4],
    },
    title: {
      fontSize: TYPOGRAPHY.fontSize.h2,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[1],
    },
    progressCard: {
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      padding: SPACING[4],
      marginBottom: SPACING[4],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    progressLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginBottom: SPACING[2],
    },
    progressValues: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING[3],
    },
    progressValue: {
      fontSize: 18,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    progressPercentage: {
      fontSize: 16,
      fontWeight: '700',
      color: budget.color,
    },
    progressBar: {
      height: 12,
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.md,
      overflow: 'hidden',
      marginBottom: SPACING[3],
    },
    progressFill: {
      height: '100%',
      backgroundColor: budget.color,
      borderRadius: RADIUS.md,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: SPACING[3],
    },
    statBox: {
      flex: 1,
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.md,
      padding: SPACING[3],
      alignItems: 'center',
    },
    statLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginBottom: SPACING[1],
    },
    statValue: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[3],
      marginTop: SPACING[4],
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING[3],
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING[2],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      gap: SPACING[3],
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      backgroundColor: budget.color + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    transactionDate: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginTop: SPACING[1],
    },
    transactionAmount: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  const percentage = (budget.spent / budget.limit) * 100;
  const remaining = budget.limit - budget.spent;
  const avgSpent = budget.spent / 30;

  const renderTransaction: ListRenderItem<Transaction> = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <MaterialCommunityIcons name={item.icon as any} size={20} color={budget.color} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={styles.transactionAmount}>${(item.amount / 100).toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{budget.name}</Text>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Spending Progress</Text>

          <View style={styles.progressValues}>
            <Text style={styles.progressValue}>
              ${(budget.spent / 100).toFixed(2)} / ${(budget.limit / 100).toFixed(2)}
            </Text>
            <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(percentage, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>${(remaining / 100).toFixed(2)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Daily Avg</Text>
              <Text style={styles.statValue}>${(avgSpent / 100).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}
