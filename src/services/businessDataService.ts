/**
 * Business Data Service
 * Comprehensive data fetching service for the reporting dashboard
 * Integrates with real SwipeSavvy business data endpoints
 */

interface DateRange {
  startDate: string;
  endDate: string;
}

// ============================================================================
// TRANSACTION SERVICE
// ============================================================================

const transactionService = {
  /**
   * Get revenue summary and trend
   */
  async getRevenueSummary(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/transactions/analytics/revenue?${params}`);
      if (!response.ok) throw new Error('Failed to fetch revenue');
      return await response.json();
    } catch (error) {
      console.error('Revenue fetch error:', error);
      return { totalRevenue: 0, trend: 0, trendData: [] };
    }
  },

  /**
   * Get transaction volume metrics
   */
  async getTransactionVolume(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/transactions/analytics/volume?${params}`);
      if (!response.ok) throw new Error('Failed to fetch volume');
      return await response.json();
    } catch (error) {
      console.error('Volume fetch error:', error);
      return { totalTransactions: 0, trend: 0, volumeData: [] };
    }
  },

  /**
   * Get payment method breakdown
   */
  async getPaymentMethods(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/transactions/analytics/payment-methods?${params}`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return await response.json();
    } catch (error) {
      console.error('Payment methods fetch error:', error);
      return [];
    }
  },

  /**
   * Get revenue trend data for charting
   */
  async getRevenueTrend(filters: DateRange) {
    try {
      const params = new URLSearchParams({
        ...filters,
        granularity: 'daily'
      });
      const response = await fetch(`/api/transactions/analytics/trend?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trend');
      return await response.json();
    } catch (error) {
      console.error('Trend fetch error:', error);
      return [];
    }
  },

  /**
   * Get transaction status breakdown
   */
  async getTransactionStatus(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/transactions/analytics/by-status?${params}`);
      if (!response.ok) throw new Error('Failed to fetch status');
      return await response.json();
    } catch (error) {
      console.error('Transaction status fetch error:', error);
      return { completedCount: 0, pendingCount: 0, failedCount: 0 };
    }
  },

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit = 20) {
    try {
      const response = await fetch(`/api/transactions/recent?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch recent');
      return await response.json();
    } catch (error) {
      console.error('Recent transactions fetch error:', error);
      return [];
    }
  }
};

// ============================================================================
// USER SERVICE
// ============================================================================

const userService = {
  /**
   * Get active user count and metrics
   */
  async getActiveUsers(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/users/analytics/active?${params}`);
      if (!response.ok) throw new Error('Failed to fetch active users');
      return await response.json();
    } catch (error) {
      console.error('Active users fetch error:', error);
      return { count: 0, trend: 0, growthData: [] };
    }
  },

  /**
   * Get user growth trend data
   */
  async getUserGrowth(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/users/analytics/growth?${params}`);
      if (!response.ok) throw new Error('Failed to fetch growth');
      return await response.json();
    } catch (error) {
      console.error('User growth fetch error:', error);
      return [];
    }
  },

  /**
   * Get user retention metrics
   */
  async getUserRetention() {
    try {
      const response = await fetch('/api/users/analytics/retention');
      if (!response.ok) throw new Error('Failed to fetch retention');
      return await response.json();
    } catch (error) {
      console.error('Retention fetch error:', error);
      return { day1Retention: 0, day7Retention: 0, day30Retention: 0 };
    }
  },

  /**
   * Get user segments/cohorts
   */
  async getUserSegments() {
    try {
      const response = await fetch('/api/users/segments');
      if (!response.ok) throw new Error('Failed to fetch segments');
      return await response.json();
    } catch (error) {
      console.error('Segments fetch error:', error);
      return [];
    }
  }
};

// ============================================================================
// MERCHANT SERVICE
// ============================================================================

const merchantService = {
  /**
   * Get top merchants by revenue
   */
  async getTopMerchants(filters: DateRange, limit = 10) {
    try {
      const params = new URLSearchParams({
        ...filters,
        limit: limit.toString()
      });
      const response = await fetch(`/api/merchants/analytics/top?${params}`);
      if (!response.ok) throw new Error('Failed to fetch top merchants');
      return await response.json();
    } catch (error) {
      console.error('Top merchants fetch error:', error);
      return [];
    }
  },

  /**
   * Get merchant performance metrics
   */
  async getMerchantPerformance(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/merchants/analytics/performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch performance');
      return await response.json();
    } catch (error) {
      console.error('Merchant performance fetch error:', error);
      return { totalMerchants: 0, activePercentage: 0, byCategory: [] };
    }
  },

  /**
   * Get merchants by category
   */
  async getMerchantsByCategory() {
    try {
      const response = await fetch('/api/merchants/categories/analytics');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Merchant categories fetch error:', error);
      return [];
    }
  }
};

// ============================================================================
// ACCOUNT SERVICE
// ============================================================================

const accountService = {
  /**
   * Get linked bank account statistics
   */
  async getLinkedBanks(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/accounts/analytics/linked-banks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch linked banks');
      return await response.json();
    } catch (error) {
      console.error('Linked banks fetch error:', error);
      return [];
    }
  },

  /**
   * Get account creation trends
   */
  async getAccountCreationTrend(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/accounts/analytics/creation-trend?${params}`);
      if (!response.ok) throw new Error('Failed to fetch creation trend');
      return await response.json();
    } catch (error) {
      console.error('Account creation trend fetch error:', error);
      return [];
    }
  }
};

// ============================================================================
// REWARDS SERVICE
// ============================================================================

const rewardsService = {
  /**
   * Get overall rewards metrics
   */
  async getRewardsMetrics(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/rewards/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch rewards metrics');
      return await response.json();
    } catch (error) {
      console.error('Rewards metrics fetch error:', error);
      return {
        totalPointsIssued: 0,
        totalPointsRedeemed: 0,
        redemptionRate: 0,
        activeProgramCount: 0,
        avgPointsPerUser: 0
      };
    }
  },

  /**
   * Get top reward recipients
   */
  async getTopRecipients(limit = 10) {
    try {
      const response = await fetch(`/api/rewards/top-recipients?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch recipients');
      return await response.json();
    } catch (error) {
      console.error('Top recipients fetch error:', error);
      return [];
    }
  },

  /**
   * Get reward redemption rates
   */
  async getRedemptionRate() {
    try {
      const response = await fetch('/api/rewards/redemption-rate');
      if (!response.ok) throw new Error('Failed to fetch redemption rate');
      return await response.json();
    } catch (error) {
      console.error('Redemption rate fetch error:', error);
      return { redemptionRate: 0, avgTimeToRedeem: 0, redemptionsByType: [] };
    }
  }
};

// ============================================================================
// FEATURE FLAGS SERVICE
// ============================================================================

const featureFlagsService = {
  /**
   * Get feature adoption rates
   */
  async getFeatureAdoption(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/features/adoption?${params}`);
      if (!response.ok) throw new Error('Failed to fetch adoption');
      return await response.json();
    } catch (error) {
      console.error('Feature adoption fetch error:', error);
      return [];
    }
  },

  /**
   * Get overall feature usage statistics
   */
  async getUsageStats() {
    try {
      const response = await fetch('/api/features/usage-stats');
      if (!response.ok) throw new Error('Failed to fetch usage stats');
      return await response.json();
    } catch (error) {
      console.error('Usage stats fetch error:', error);
      return {
        totalFeatures: 0,
        activeFeatures: 0,
        avgAdoptionRate: 0,
        topFeatures: []
      };
    }
  }
};

// ============================================================================
// AI CONCIERGE SERVICE
// ============================================================================

const aiConciergeService = {
  /**
   * Get chat metrics
   */
  async getChatMetrics(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/ai-concierge/analytics/chats?${params}`);
      if (!response.ok) throw new Error('Failed to fetch chat metrics');
      return await response.json();
    } catch (error) {
      console.error('Chat metrics fetch error:', error);
      return {
        totalConversations: 0,
        conversationTrend: 0,
        avgResponseTime: 0,
        successRate: 0
      };
    }
  },

  /**
   * Get conversation statistics
   */
  async getConversationStats(filters: DateRange) {
    try {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`/api/ai-concierge/analytics/conversations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch conversation stats');
      return await response.json();
    } catch (error) {
      console.error('Conversation stats fetch error:', error);
      return [];
    }
  },

  /**
   * Get user satisfaction metrics
   */
  async getSatisfactionMetrics() {
    try {
      const response = await fetch('/api/ai-concierge/analytics/satisfaction');
      if (!response.ok) throw new Error('Failed to fetch satisfaction');
      return await response.json();
    } catch (error) {
      console.error('Satisfaction metrics fetch error:', error);
      return {
        satisfactionScore: 0,
        satisfactionTrend: 0,
        netPromoterScore: 0,
        feedbackCount: 0
      };
    }
  }
};

// ============================================================================
// DASHBOARD SERVICE - Comprehensive data aggregation
// ============================================================================

const dashboardService = {
  /**
   * Get all comprehensive metrics at once
   * Uses Promise.allSettled for resilience - doesn't fail on partial errors
   */
  async getComprehensiveMetrics(filters: DateRange) {
    const results = await Promise.allSettled([
      transactionService.getRevenueSummary(filters),
      transactionService.getTransactionVolume(filters),
      transactionService.getPaymentMethods(filters),
      transactionService.getRevenueTrend(filters),
      transactionService.getTransactionStatus(filters),
      transactionService.getRecentTransactions(10),
      userService.getActiveUsers(filters),
      userService.getUserGrowth(filters),
      merchantService.getTopMerchants(filters, 5),
      merchantService.getMerchantsByCategory(),
      accountService.getLinkedBanks(filters),
      rewardsService.getRewardsMetrics(filters),
      aiConciergeService.getChatMetrics(filters)
    ]);

    // Extract values from settled promises
    const [
      revenue,
      volume,
      paymentMethods,
      revenueTrend,
      transactionStatus,
      recentTransactions,
      activeUsers,
      userGrowth,
      topMerchants,
      merchantCategories,
      linkedBanks,
      rewardsMetrics,
      chatMetrics
    ] = results.map((result) =>
      result.status === 'fulfilled' ? result.value : null
    );

    return {
      revenue,
      volume,
      paymentMethods,
      revenueTrend,
      transactionStatus,
      recentTransactions,
      activeUsers,
      userGrowth,
      topMerchants,
      merchantCategories,
      linkedBanks,
      rewardsMetrics,
      chatMetrics
    };
  }
};

// ============================================================================
// Export all services
// ============================================================================

export const businessData = {
  transactionService,
  userService,
  merchantService,
  accountService,
  rewardsService,
  featureFlagsService,
  aiConciergeService,
  dashboardService
};

export default businessData;
