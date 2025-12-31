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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LIGHT_THEME, SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { dataService } from '../../../services/DataService';

interface CategoryAnalysis {
  category: string;
  currentMonth: number;
  previousMonth: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
  lastUpdated: string;
}

interface TrendData {
  date: string;
  amount: number;
}

const MOCK_ANALYSIS: CategoryAnalysis[] = [
  {
    category: 'Food & Dining',
    currentMonth: 85000,
    previousMonth: 92000,
    trend: 'down',
    icon: 'silverware-fork-knife',
    color: '#FF6B6B',
    lastUpdated: 'Today',
  },
  {
    category: 'Shopping',
    currentMonth: 60000,
    previousMonth: 45000,
    trend: 'up',
    icon: 'shopping-bag',
    color: '#4ECDC4',
    lastUpdated: 'Today',
  },
  {
    category: 'Entertainment',
    currentMonth: 45000,
    previousMonth: 48000,
    trend: 'down',
    icon: 'movie',
    color: '#95E1D3',
    lastUpdated: 'Today',
  },
  {
    category: 'Transportation',
    currentMonth: 50000,
    previousMonth: 50000,
    trend: 'stable',
    icon: 'car',
    color: '#FFB74D',
    lastUpdated: 'Today',
  },
  {
    category: 'Utilities',
    currentMonth: 25000,
    previousMonth: 28000,
    trend: 'down',
    icon: 'flash',
    color: '#C1A0FF',
    lastUpdated: 'Today',
  },
  {
    category: 'Health',
    currentMonth: 20000,
    previousMonth: 15000,
    trend: 'up',
    icon: 'heart',
    color: '#FF8A9E',
    lastUpdated: 'Today',
  },
];

export function SpendingAnalysisScreen() {
  const [analysis, setAnalysis] = useState<CategoryAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'amount' | 'trend' | 'category'>('amount');

  useEffect(() => {
    loadAnalysis();
  }, [sortBy]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      let sorted = [...MOCK_ANALYSIS];
      
      if (sortBy === 'amount') {
        sorted.sort((a, b) => b.currentMonth - a.currentMonth);
      } else if (sortBy === 'trend') {
        const trendOrder = { up: 0, stable: 1, down: 2 };
        sorted.sort((a, b) => trendOrder[a.trend] - trendOrder[b.trend]);
      } else {
        sorted.sort((a, b) => a.category.localeCompare(b.category));
      }
      
      setAnalysis(sorted);
    } catch (error) {
      setAnalysis(MOCK_ANALYSIS);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'minus';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return '#FF6B6B';
    if (trend === 'down') return BRAND_COLORS.green;
    return LIGHT_THEME.muted;
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
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
      marginBottom: SPACING[3],
    },
    sortContainer: {
      flexDirection: 'row',
      gap: SPACING[2],
    },
    sortButton: {
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[3],
      borderRadius: RADIUS.md,
      backgroundColor: LIGHT_THEME.panel2,
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    sortButtonActive: {
      backgroundColor: BRAND_COLORS.navy,
      borderColor: BRAND_COLORS.navy,
    },
    sortText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    sortTextActive: {
      color: '#FFFFFF',
    },
    insightCard: {
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      padding: SPACING[3],
      marginBottom: SPACING[4],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    insightTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: LIGHT_THEME.text,
      marginBottom: SPACING[1],
    },
    insightText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    categoryItem: {
      backgroundColor: LIGHT_THEME.panelSolid,
      borderRadius: RADIUS.lg,
      padding: SPACING[3],
      marginBottom: SPACING[2],
      borderWidth: 1,
      borderColor: LIGHT_THEME.stroke,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING[3],
      gap: SPACING[2],
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '700',
      color: LIGHT_THEME.text,
    },
    categorySubtext: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
      marginTop: SPACING[1],
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING[1],
      paddingHorizontal: SPACING[2],
      borderRadius: RADIUS.md,
      backgroundColor: LIGHT_THEME.panel2,
      gap: SPACING[1],
    },
    trendText: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      fontWeight: '600',
      color: LIGHT_THEME.text,
    },
    comparisonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING[2],
      paddingHorizontal: SPACING[2],
      backgroundColor: LIGHT_THEME.panel2,
      borderRadius: RADIUS.md,
      marginBottom: SPACING[2],
    },
    comparisonLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: LIGHT_THEME.muted,
    },
    comparisonValue: {
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

  const renderAnalysisItem: ListRenderItem<CategoryAnalysis> = ({ item }) => {
    const changePercent = getPercentageChange(item.currentMonth, item.previousMonth);
    const change = item.currentMonth - item.previousMonth;

    return (
      <View style={styles.categoryItem}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
            <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.category}</Text>
            <Text style={styles.categorySubtext}>Updated {item.lastUpdated}</Text>
          </View>
          <View style={[styles.trendBadge, { backgroundColor: getTrendColor(item.trend) + '20' }]}>
            <MaterialCommunityIcons
              name={getTrendIcon(item.trend) as any}
              size={16}
              color={getTrendColor(item.trend)}
            />
            <Text style={[styles.trendText, { color: getTrendColor(item.trend) }]}>
              {Math.abs(changePercent).toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>This Month</Text>
          <Text style={styles.comparisonValue}>${(item.currentMonth / 100).toFixed(2)}</Text>
        </View>

        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Last Month</Text>
          <Text style={styles.comparisonValue}>${(item.previousMonth / 100).toFixed(2)}</Text>
        </View>

        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Change</Text>
          <Text style={[styles.comparisonValue, { color: getTrendColor(item.trend) }]}>
            {change > 0 ? '+' : ''} ${(change / 100).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BRAND_COLORS.navy} />
      </View>
    );
  }

  const upTrendCount = analysis.filter(a => a.trend === 'up').length;
  const downTrendCount = analysis.filter(a => a.trend === 'down').length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Spending Analysis</Text>
        </View>

        <View style={styles.sortContainer}>
          {(['amount', 'trend', 'category'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortButton,
                sortBy === option && styles.sortButtonActive,
              ]}
              onPress={() => setSortBy(option)}
            >
              <Text
                style={[
                  styles.sortText,
                  sortBy === option && styles.sortTextActive,
                ]}
              >
                {option === 'amount' && 'Amount'}
                {option === 'trend' && 'Trend'}
                {option === 'category' && 'Category'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Month-over-Month Trends</Text>
          <Text style={styles.insightText}>
            {upTrendCount} categories increased, {downTrendCount} decreased
          </Text>
        </View>

        <FlatList
          data={analysis}
          renderItem={renderAnalysisItem}
          keyExtractor={(item) => item.category}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}
