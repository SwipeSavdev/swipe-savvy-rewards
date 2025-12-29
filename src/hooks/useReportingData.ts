/**
 * useReportingData Hook
 * Fetches real business data from the SwipeSavvy API
 * Handles data transformation and error management
 */

import { useEffect, useState, useCallback } from 'react';
import { businessData } from '@/services/businessDataService';

export interface DateFilter {
  startDate: string;
  endDate: string;
}

export interface ReportingData {
  [key: string]: any;
}

export interface UseReportingDataReturn {
  data: ReportingData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReportingData(filters: DateFilter): UseReportingDataReturn {
  const [data, setData] = useState<ReportingData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformData = useCallback((rawData: any) => {
    // Transform API responses into widget-compatible format
    const transformed: ReportingData = {};

    // Revenue KPI
    if (rawData.revenue) {
      transformed.revenue = {
        value: rawData.revenue.totalRevenue || 0,
        trend: rawData.revenue.trend || 0,
        label: 'Total Revenue'
      };
    }

    // Transaction Volume KPI
    if (rawData.volume) {
      transformed.transactions = {
        value: rawData.volume.totalTransactions || 0,
        trend: rawData.volume.trend || 0,
        label: 'Total Transactions'
      };
    }

    // Active Users KPI
    if (rawData.activeUsers) {
      transformed.users = {
        value: rawData.activeUsers.count || 0,
        trend: rawData.activeUsers.trend || 0,
        label: 'Active Users'
      };
    }

    // Revenue Trend Chart Data
    if (rawData.revenueTrend && Array.isArray(rawData.revenueTrend)) {
      transformed.revenue_trend = rawData.revenueTrend.map((item: any) => ({
        date: item.date || '',
        amount: item.amount || 0,
        trend: item.trend || 0
      }));
    }

    // Transaction Volume Chart Data
    if (rawData.volume?.volumeData && Array.isArray(rawData.volume.volumeData)) {
      transformed.transaction_volume = rawData.volume.volumeData.map((item: any) => ({
        date: item.date || '',
        count: item.count || 0,
        amount: item.amount || 0
      }));
    }

    // Payment Methods Pie Chart Data
    if (rawData.paymentMethods && Array.isArray(rawData.paymentMethods)) {
      transformed.payment_methods = rawData.paymentMethods.map((item: any) => ({
        name: item.method || 'Unknown',
        value: item.amount || 0,
        percentage: item.percentage || 0
      }));
    }

    // Top Merchants Bar Chart Data
    if (rawData.topMerchants && Array.isArray(rawData.topMerchants)) {
      transformed.top_merchants = rawData.topMerchants.map((item: any) => ({
        name: item.merchantName || 'Unknown',
        value: item.totalRevenue || 0,
        transactions: item.transactionCount || 0
      }));
    }

    // Recent Transactions Table Data
    if (rawData.recentTransactions && Array.isArray(rawData.recentTransactions)) {
      transformed.latest_transactions = {
        columns: ['Transaction ID', 'Merchant', 'Amount', 'Date', 'Status'],
        rows: rawData.recentTransactions.map((item: any) => ({
          transactionId: item.transactionId || item.id || 'N/A',
          merchantName: item.merchantName || 'Unknown',
          amount: item.amount || 0,
          date: item.date || '',
          status: item.status || 'pending'
        }))
      };
    }

    // User Growth Chart Data
    if (rawData.userGrowth && Array.isArray(rawData.userGrowth)) {
      transformed.user_growth = rawData.userGrowth.map((item: any) => ({
        date: item.date || '',
        count: item.count || 0,
        newCount: item.newCount || 0
      }));
    }

    // Linked Banks Bar Chart Data
    if (rawData.linkedBanks && Array.isArray(rawData.linkedBanks)) {
      transformed.linked_banks = rawData.linkedBanks.map((item: any) => ({
        name: item.bankName || 'Unknown',
        value: item.count || 0,
        active: item.activeAccounts || 0
      }));
    }

    // Transaction Status Pie Chart Data
    if (rawData.transactionStatus) {
      transformed.transaction_status = [
        {
          name: 'Completed',
          value: rawData.transactionStatus.completedCount || 0
        },
        {
          name: 'Pending',
          value: rawData.transactionStatus.pendingCount || 0
        },
        {
          name: 'Failed',
          value: rawData.transactionStatus.failedCount || 0
        }
      ];
    }

    // Merchant Categories Pie Chart Data
    if (rawData.merchantCategories && Array.isArray(rawData.merchantCategories)) {
      transformed.merchant_categories = rawData.merchantCategories.map((item: any) => ({
        name: item.category || 'Unknown',
        value: item.amount || 0,
        merchants: item.merchantCount || 0
      }));
    }

    // Rewards Metrics Summary
    if (rawData.rewardsMetrics) {
      transformed.rewards_metrics = {
        totalPointsIssued: rawData.rewardsMetrics.totalPointsIssued || 0,
        totalPointsRedeemed: rawData.rewardsMetrics.totalPointsRedeemed || 0,
        redemptionRate: rawData.rewardsMetrics.redemptionRate || 0,
        activeProgramCount: rawData.rewardsMetrics.activeProgramCount || 0,
        avgPointsPerUser: rawData.rewardsMetrics.avgPointsPerUser || 0
      };
    }

    // AI Concierge Metrics Summary
    if (rawData.chatMetrics) {
      transformed.ai_metrics = {
        totalConversations: rawData.chatMetrics.totalConversations || 0,
        conversationTrend: rawData.chatMetrics.conversationTrend || 0,
        avgResponseTime: rawData.chatMetrics.avgResponseTime || 0,
        successRate: rawData.chatMetrics.successRate || 0
      };
    }

    return transformed;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch comprehensive metrics from dashboard service
      const rawData = await businessData.dashboardService.getComprehensiveMetrics(filters);

      // Transform API responses to widget format
      const transformedData = transformData(rawData);

      setData(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reporting data';
      setError(errorMessage);
      console.error('Reporting data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, transformData]);

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [filters, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useReportingData;
