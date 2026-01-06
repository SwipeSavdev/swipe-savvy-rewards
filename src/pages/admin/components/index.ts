/**
 * Dashboard Components Index
 * Central export for all Phase 4 dashboard components
 * 
 * Exports:
 * - AnalyticsDashboard
 * - ABTestingInterface
 * - OptimizationRecommendations
 */

export { AnalyticsDashboard } from './AnalyticsDashboard';
export { ABTestingInterface } from './ABTestingInterface';
export { OptimizationRecommendations } from './OptimizationRecommendations';

// Re-export types if needed
// @ts-ignore - Types are internal to components
export type { CampaignMetrics, SegmentPerformance, TrendData, PortfolioMetrics } from './AnalyticsDashboard';
// @ts-ignore - Types are internal to components
export type { ABTest, TestResult, TestHistory } from './ABTestingInterface';
// @ts-ignore - Types are internal to components
export type { Recommendation, OfferOptimization, SendTimeOptimization, MerchantAffinity } from './OptimizationRecommendations';

// Dashboard component group
export const DashboardComponents = {
  AnalyticsDashboard: () => import('./AnalyticsDashboard'),
  ABTestingInterface: () => import('./ABTestingInterface'),
  OptimizationRecommendations: () => import('./OptimizationRecommendations'),
};

export default {
  AnalyticsDashboard: () => import('./AnalyticsDashboard'),
  ABTestingInterface: () => import('./ABTestingInterface'),
  OptimizationRecommendations: () => import('./OptimizationRecommendations'),
};
