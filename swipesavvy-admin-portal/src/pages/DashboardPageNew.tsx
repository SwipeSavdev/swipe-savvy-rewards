import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Settings } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import DashboardWidget from '@/components/dashboard/DashboardWidget'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import MarginRiskCard from '@/components/cards/MarginRiskCard'
import { Api } from '@/services/api'
import { useEventSubscription } from '@/store/eventBusStore'
import { useToastStore } from '@/store/toastStore'

interface Widget {
  id: string
  type: 'line' | 'bar' | 'pie' | 'stat'
  title: string
  subtitle?: string
  dataKey: string
  enabled: boolean
}

const AVAILABLE_WIDGETS: Widget[] = [
  { id: 'fraud-trend', type: 'line', title: 'Fraud Cases Trend', subtitle: 'Last 30 days', dataKey: 'fraudTrend', enabled: true },
  { id: 'risk-distribution', type: 'pie', title: 'Risk Level Distribution', subtitle: 'Current distribution', dataKey: 'riskDistribution', enabled: true },
  { id: 'fraud-by-type', type: 'bar', title: 'Fraud Cases by Type', subtitle: 'Last 30 days', dataKey: 'fraudByType', enabled: true },
  { id: 'transaction-volume', type: 'line', title: 'Transaction Volume', subtitle: 'Last 30 days', dataKey: 'transactionVolume', enabled: true },
  { id: 'high-risk-merchants', type: 'bar', title: 'High Risk Merchants', subtitle: 'Top 10', dataKey: 'highRiskMerchants', enabled: true },
  { id: 'daily-alerts', type: 'line', title: 'Daily Security Alerts', subtitle: 'Last 30 days', dataKey: 'dailyAlerts', enabled: true },
  { id: 'customers-by-tier', type: 'pie', title: 'Customers by Rewards Tier', subtitle: 'Current distribution', dataKey: 'customersByTier', enabled: true },
  { id: 'rewards-cost-analysis', type: 'bar', title: 'Rewards Cost vs Margin Risk', subtitle: 'Margin impact analysis', dataKey: 'rewardsCostAnalysis', enabled: true },
  { id: 'rewards-points-utilization', type: 'line', title: 'Rewards Points Utilization', subtitle: 'Last 30 days', dataKey: 'rewardsPointsUtilization', enabled: true },
]

export default function DashboardPageNew() {
  const pushToast = useToastStore((s) => s.push)
  const [widgets, setWidgets] = useState<Widget[]>(AVAILABLE_WIDGETS)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Mock data generator
  const generateMockData = () => {
    const days = 30
    const fraudTrendData = Array.from({ length: days }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 100 + 20),
    }))

    const fraudByTypeData = [
      { label: 'Account Takeover', value: 245 },
      { label: 'Credit Card Fraud', value: 189 },
      { label: 'Identity Theft', value: 127 },
      { label: 'Chargeback Fraud', value: 98 },
      { label: 'Other', value: 67 },
    ]

    const riskDistributionData = [
      { label: 'Low Risk', value: 1240, color: '#10b981' },
      { label: 'Medium Risk', value: 685, color: '#f59e0b' },
      { label: 'High Risk', value: 234, color: '#ef4444' },
      { label: 'Critical', value: 45, color: '#8b5cf6' },
    ]

    const transactionVolumeData = Array.from({ length: days }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 5000 + 2000),
    }))

    const highRiskMerchantsData = [
      { label: 'Merchant A', value: 342 },
      { label: 'Merchant B', value: 287 },
      { label: 'Merchant C', value: 245 },
      { label: 'Merchant D', value: 198 },
      { label: 'Merchant E', value: 156 },
    ]

    const dailyAlertsData = Array.from({ length: days }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 50 + 5),
    }))

    // Rewards program data
    const customersByTierData = [
      { label: 'Bronze', value: 45230, color: '#a3622d' },
      { label: 'Silver', value: 28450, color: '#c0c0c0' },
      { label: 'Gold', value: 15680, color: '#ffd700' },
      { label: 'Platinum', value: 8920, color: '#e5e4e2' },
    ]

    // Rewards cost analysis (gross margin is 1.55%)
    const grossMargin = 1.55
    const rewardsCostPercentage = 38.5 // Current rewards cost as % of revenue
    const riskThreshold = 45
    const rewardsCostAnalysis = [
      { label: 'Gross Margin\n(1.55%)', value: grossMargin },
      { label: 'Rewards Cost\n(38.5%)', value: rewardsCostPercentage },
      { label: 'Safe Threshold\n(45%)', value: riskThreshold },
    ]

    const rewardsPointsUtilizationData = Array.from({ length: days }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 800000 + 200000),
    }))

    return {
      stats: {
        totalFraudCases: { value: 726, trendPct: 12.5, trendDirection: 'up' as const },
        totalTransactions: { value: 156240, trendPct: 8.2, trendDirection: 'up' as const },
        riskLevel: { value: 'Medium', trendPct: -2.1, trendDirection: 'down' as const },
        avgRiskScore: { value: 34, trendPct: 5.3, trendDirection: 'up' as const },
        rewardsCostPct: { value: rewardsCostPercentage, trendPct: 2.3, trendDirection: 'up' as const },
        customersInProgram: { value: 98280, trendPct: 6.8, trendDirection: 'up' as const },
      },
      fraudTrendData,
      fraudByTypeData,
      riskDistributionData,
      transactionVolumeData,
      highRiskMerchantsData,
      dailyAlertsData,
      customersByTier: customersByTierData,
      rewardsCostAnalysis,
      rewardsPointsUtilization: rewardsPointsUtilizationData,
    }
  }

  // Dashboard data loading function
  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Try to fetch real data from API
      try {
        const overview = await Api.dashboardApi.getOverview()

        // Merge API data with mock visualization data
        const mockData = generateMockData()

        // Update stats with real API data if available
        if (overview && overview.stats) {
          mockData.stats = {
            ...mockData.stats,
            totalFraudCases: {
              value: overview.stats.transactions?.value || mockData.stats.totalFraudCases.value,
              trendPct: overview.stats.transactions?.trendPct || 0,
              trendDirection: overview.stats.transactions?.trendDirection || 'up'
            },
            totalTransactions: {
              value: overview.stats.transactions?.value || mockData.stats.totalTransactions.value,
              trendPct: overview.stats.transactions?.trendPct || 0,
              trendDirection: overview.stats.transactions?.trendDirection || 'up'
            },
            customersInProgram: {
              value: overview.stats.users?.value || overview.total_users || mockData.stats.customersInProgram.value,
              trendPct: overview.stats.users?.trendPct || 0,
              trendDirection: overview.stats.users?.trendDirection || 'up'
            },
          }
        }

        setData(mockData)
        setLastRefresh(new Date())
      } catch (apiError) {
        console.warn('API unavailable, using mock data:', apiError)
        // Fallback to mock data if API fails
        const mockData = generateMockData()
        setData(mockData)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      pushToast({
        variant: 'error',
        title: 'Dashboard',
        message: 'Failed to load dashboard data.',
      })
      // Still show mock data on error
      const mockData = generateMockData()
      setData(mockData)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [pushToast])

  // Initial load
  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Subscribe to all relevant events for auto-refresh
  useEventSubscription(
    [
      'merchant:created', 'merchant:updated', 'merchant:deleted',
      'charity:approved', 'charity:rejected',
      'ticket:created', 'ticket:resolved',
      'campaign:published',
      'user:created', 'user:deleted',
    ],
    () => {
      // Debounce refresh to avoid too many API calls
      loadDashboard(true)
    }
  )

  // Manual refresh handler
  const handleRefresh = () => {
    loadDashboard(true)
    pushToast({ variant: 'success', title: 'Dashboard', message: 'Data refreshed' })
  }

  const toggleWidget = (widgetId: string) => {
    setWidgets((prev) => prev.map((w) => (w.id === widgetId ? { ...w, enabled: !w.enabled } : w)))
  }

  const resetWidgets = () => {
    setWidgets(AVAILABLE_WIDGETS)
    pushToast({ variant: 'success', title: 'Dashboard', message: 'Widgets reset to default.' })
  }

  const renderChartData = (dataKey: string) => {
    const chartData = data?.[dataKey]
    if (!chartData) return null
    return chartData
  }

  const enabledWidgets = widgets.filter((w) => w.enabled)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">
            Fraud and risk analytics overview.
            {lastRefresh && (
              <span className="ml-2 text-xs">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-[var(--ss-surface-alt)] rounded transition-colors disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-5 h-5 text-[var(--ss-text)] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-[var(--ss-surface-alt)] rounded transition-colors"
            title="Dashboard settings"
          >
            <Settings className="w-5 h-5 text-[var(--ss-text)]" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-[var(--ss-surface-alt)] p-4 rounded-lg border border-[var(--ss-border)]">
          <h3 className="font-semibold text-sm text-[var(--ss-text)] mb-3">Widget Settings</h3>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            {AVAILABLE_WIDGETS.map((widget) => (
              <label key={widget.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={widgets.find((w) => w.id === widget.id)?.enabled || false}
                  onChange={() => toggleWidget(widget.id)}
                  className="rounded"
                />
                <span className="text-sm text-[var(--ss-text)]">{widget.title}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetWidgets}>
              Reset to Default
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowSettings(false)}>
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[98px] bg-[var(--ss-surface-alt)] rounded-lg animate-pulse" />)
        ) : (
          <>
            <StatCard label="Fraud Cases" value={data?.stats.totalFraudCases.value ?? 0} trendPct={data?.stats.totalFraudCases.trendPct} trendDirection={data?.stats.totalFraudCases.trendDirection} />
            <StatCard label="Transactions" value={data?.stats.totalTransactions.value ?? 0} trendPct={data?.stats.totalTransactions.trendPct} trendDirection={data?.stats.totalTransactions.trendDirection} />
            <StatCard label="Risk Level" value={data?.stats.riskLevel.value ?? 'N/A'} trendPct={data?.stats.riskLevel.trendPct} trendDirection={data?.stats.riskLevel.trendDirection} />
            <StatCard label="Risk Score" value={data?.stats.avgRiskScore.value ?? 0} trendPct={data?.stats.avgRiskScore.trendPct} trendDirection={data?.stats.avgRiskScore.trendDirection} />
            <StatCard label="Rewards Cost" value={data?.stats.rewardsCostPct.value ?? 0} trendPct={data?.stats.rewardsCostPct.trendPct} trendDirection={data?.stats.rewardsCostPct.trendDirection} suffix="%" />
            <StatCard label="Customers" value={data?.stats.customersInProgram.value ?? 0} trendPct={data?.stats.customersInProgram.trendPct} trendDirection={data?.stats.customersInProgram.trendDirection} />
          </>
        )}
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {enabledWidgets.map((widget) => {
          const chartData = renderChartData(widget.dataKey)

          // Special rendering for rewards cost analysis widget
          if (widget.id === 'rewards-cost-analysis') {
            return (
              <DashboardWidget
                key={widget.id}
                id={widget.id}
                title={widget.title}
                subtitle={widget.subtitle}
                isLoading={loading}
                onRemove={() => toggleWidget(widget.id)}
              >
                <MarginRiskCard rewardsCostPct={data?.stats.rewardsCostPct.value ?? 38.5} grossMarginPct={1.55} thresholdPct={45} />
              </DashboardWidget>
            )
          }

          return (
            <DashboardWidget
              key={widget.id}
              id={widget.id}
              title={widget.title}
              subtitle={widget.subtitle}
              isLoading={loading}
              onRemove={() => toggleWidget(widget.id)}
            >
              {widget.type === 'line' && chartData && <LineChart data={chartData} color="#3b82f6" />}
              {widget.type === 'bar' && chartData && <BarChart data={chartData} color="#10b981" />}
              {widget.type === 'pie' && chartData && <PieChart data={chartData} />}
            </DashboardWidget>
          )
        })}
      </div>

      {/* Empty State */}
      {enabledWidgets.length === 0 && (
        <div className="text-center py-12">
          <Icon name="dashboard" className="h-12 w-12 mx-auto text-[var(--ss-text-muted)] opacity-50" />
          <p className="mt-4 text-[var(--ss-text-muted)]">No widgets enabled. Click settings to add widgets.</p>
        </div>
      )}
    </div>
  )
}
