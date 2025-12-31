import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { Card } from '../../../design-system/components/CoreComponents';
import { dataService } from '../../../services/DataService';

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
}

interface AnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  categories: CategorySpending[];
}

const MOCK_ANALYTICS: AnalyticsData = {
  totalIncome: 500000,
  totalExpenses: 285000,
  savings: 215000,
  categories: [
    { category: 'Food & Dining', amount: 85000, percentage: 30, icon: 'silverware-fork-knife', color: '#FF6B6B' },
    { category: 'Shopping', amount: 60000, percentage: 21, icon: 'shopping-bag', color: '#4ECDC4' },
    { category: 'Entertainment', amount: 45000, percentage: 16, icon: 'movie', color: '#95E1D3' },
    { category: 'Transportation', amount: 50000, percentage: 18, icon: 'car', color: '#FFB74D' },
    { category: 'Utilities', amount: 25000, percentage: 9, icon: 'flash', color: '#C1A0FF' },
    { category: 'Health', amount: 20000, percentage: 6, icon: 'heart', color: '#FF8A9E' },
  ],
};

const CHART_HEIGHT = 200;
const CHART_WIDTH = Dimensions.get('window').width - SPACING[8];

export function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(MOCK_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [timePeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch data based on timePeriod
      setAnalytics(MOCK_ANALYTICS);
    } catch (error) {
      setAnalytics(MOCK_ANALYTICS);
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
    },
    timePeriodContainer: {
      flexDirection: 'row',
      gap: SPACING[2],
      marginBottom: SPACING[4],
    },
    timePeriodButton: {
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      borderRadius: RADIUS.md,
      backgroundColor: LIGHT_THEME.panel2,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    timePeriodButtonActive: {
      backgroundColor: BRAND_COLORS.navy,
      borderColor: BRAND_COLORS.navy,
    },
    timePeriodText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    timePeriodTextActive: {
      color: '#FFFFFF',
    },
    summaryGrid: {
      flexDirection: 'row',
      gap: SPACING[3],
      marginBottom: SPACING[4],
    },
    summaryCard: {
      flex: 1,
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      padding: SPACING[3],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    summaryLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginBottom: SPACING[1],
    },
    summaryValue: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '800',
      color: LIGHT_THEME.text,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.h3,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginTop: SPACING[4],
      marginBottom: SPACING[3],
    },
    chartContainer: {
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      padding: SPACING[4],
      marginBottom: SPACING[4],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    chartBar: {
      height: 8,
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.sm,
      overflow: 'hidden',
      marginBottom: SPACING[3],
    },
    chartFill: {
      height: '100%',
      borderRadius: RADIUS.sm,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING[3],
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING[2],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING[3],
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    categoryAmount: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginTop: SPACING[1],
    },
    categoryPercentage: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    insightCard: {
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      padding: SPACING[3],
      marginBottom: SPACING[2],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[3],
    },
    insightIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      backgroundColor: BRAND_COLORS.yellow + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    insightText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '500',
      color: LIGHT_THEME.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const renderCategoryItem: ListRenderItem<CategorySpending> = ({ item }) => (
    <View style={styles.categoryItem}>
      <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
        <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.category}</Text>
        <Text style={styles.categoryAmount}>${(item.amount / 100).toFixed(2)}</Text>
      </View>
      <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  const savingsRate = ((analytics.savings / analytics.totalIncome) * 100).toFixed(1);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>

        <View style={styles.timePeriodContainer}>
          {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.timePeriodButton,
                timePeriod === period && styles.timePeriodButtonActive,
              ]}
              onPress={() => setTimePeriod(period)}
            >
              <Text
                style={[
                  styles.timePeriodText,
                  timePeriod === period && styles.timePeriodTextActive,
                ]}
              >
                {period === 'week' && 'Week'}
                {period === 'month' && 'Month'}
                {period === 'quarter' && 'Quarter'}
                {period === 'year' && 'Year'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryValue}>${(analytics.totalIncome / 100).toFixed(0)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryValue}>${(analytics.totalExpenses / 100).toFixed(0)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Saved</Text>
            <Text style={styles.summaryValue}>{savingsRate}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Spending by Category</Text>
        <FlatList
          data={analytics.categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.category}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>Financial Insights</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <MaterialCommunityIcons name="lightbulb" size={20} color={BRAND_COLORS.yellow} />
          </View>
          <Text style={styles.insightText}>You're saving {savingsRate}% of your income this month</Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <MaterialCommunityIcons name="trending-down" size={20} color={BRAND_COLORS.green} />
          </View>
          <Text style={styles.insightText}>Food & Dining is your largest expense category</Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <MaterialCommunityIcons name="target" size={20} color={BRAND_COLORS.green} />
          </View>
          <Text style={styles.insightText}>On track to reach your savings goals</Text>
        </View>
      </ScrollView>
    </View>
  );
}
