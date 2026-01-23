/**
 * TransactionLimitsScreen - View and manage transaction limits
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, TYPOGRAPHY, BRAND_COLORS } from '../../../design-system/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuthStore } from '../../auth/stores/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.swipesavvy.com/api/v1';

interface TransactionLimit {
  type: string;
  label: string;
  daily: number;
  monthly: number;
  used_daily: number;
  used_monthly: number;
  icon: string;
}

export function TransactionLimitsScreen() {
  const { colors } = useTheme();
  const { accessToken } = useAuthStore();

  const [limits, setLimits] = useState<TransactionLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/limits`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLimits(data.limits || []);
      } else {
        // Use mock data if API fails
        setLimits([
          {
            type: 'transfer',
            label: 'Transfers',
            daily: 5000,
            monthly: 50000,
            used_daily: 1250,
            used_monthly: 12500,
            icon: 'bank-transfer',
          },
          {
            type: 'payment',
            label: 'Payments',
            daily: 2500,
            monthly: 25000,
            used_daily: 500,
            used_monthly: 3200,
            icon: 'credit-card-outline',
          },
          {
            type: 'withdrawal',
            label: 'ATM Withdrawals',
            daily: 1000,
            monthly: 10000,
            used_daily: 0,
            used_monthly: 400,
            icon: 'cash',
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load limits:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return colors.danger;
    if (percentage >= 70) return BRAND_COLORS.orange;
    return colors.brand;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: SPACING[4],
      gap: SPACING[4],
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.body,
      color: colors.muted,
      marginBottom: SPACING[2],
    },
    limitCard: {
      backgroundColor: colors.panel2,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.stroke,
      padding: SPACING[4],
      gap: SPACING[4],
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING[3],
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.md,
      backgroundColor: colors.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      fontSize: TYPOGRAPHY.fontSize.body,
      fontWeight: '600',
      color: colors.text,
    },
    limitSection: {
      gap: SPACING[3],
    },
    limitRow: {
      gap: SPACING[2],
    },
    limitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    limitLabel: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
    },
    limitValues: {
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.text,
      fontWeight: '500',
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.panel,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    note: {
      backgroundColor: colors.panel2,
      padding: SPACING[3],
      borderRadius: RADIUS.lg,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING[2],
    },
    noteText: {
      flex: 1,
      fontSize: TYPOGRAPHY.fontSize.meta,
      color: colors.muted,
      lineHeight: 20,
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadLimits(); }} />
      }
    >
      <Text style={styles.description}>
        Your account has the following transaction limits. Limits reset daily at midnight and monthly
        on the 1st.
      </Text>

      {limits.map((limit) => (
        <View key={limit.type} style={styles.limitCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={limit.icon as any}
                size={24}
                color={colors.brand}
              />
            </View>
            <Text style={styles.cardTitle}>{limit.label}</Text>
          </View>

          <View style={styles.limitSection}>
            <View style={styles.limitRow}>
              <View style={styles.limitHeader}>
                <Text style={styles.limitLabel}>Daily Limit</Text>
                <Text style={styles.limitValues}>
                  {formatCurrency(limit.used_daily)} / {formatCurrency(limit.daily)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((limit.used_daily / limit.daily) * 100, 100)}%`,
                      backgroundColor: getProgressColor(limit.used_daily, limit.daily),
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.limitRow}>
              <View style={styles.limitHeader}>
                <Text style={styles.limitLabel}>Monthly Limit</Text>
                <Text style={styles.limitValues}>
                  {formatCurrency(limit.used_monthly)} / {formatCurrency(limit.monthly)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((limit.used_monthly / limit.monthly) * 100, 100)}%`,
                      backgroundColor: getProgressColor(limit.used_monthly, limit.monthly),
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.note}>
        <MaterialCommunityIcons name="information-outline" size={20} color={colors.muted} />
        <Text style={styles.noteText}>
          To request higher limits, please complete KYC verification or contact support with a valid
          reason for the increase.
        </Text>
      </View>
    </ScrollView>
  );
}
