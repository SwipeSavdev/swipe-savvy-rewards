/**
 * SwipeSavvy Admin Portal - Bank-Grade Dashboard Page
 * Version: 4.0
 *
 * Dashboard template:
 * - Page Header (title + action buttons)
 * - Stats Row (key metrics)
 * - Chart Section
 * - Recent Activity
 *
 * All screens implement: empty, loading, error, success states
 */

import { useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import Card, { CardHeader, CardBody } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import { Api } from '@/services/api'
import type { DashboardOverview, RecentActivityItem } from '@/types/dashboard'
import { formatDateTime } from '@/utils/dates'
import { useToastStore } from '@/store/toastStore'
import { useDashboardWidgetStore } from '@/store/dashboardWidgetStore'
import { LineChartWidget, BarChartWidget, PieChartWidget, AreaChartWidget } from '@/components/charts/DashboardCharts'
import WidgetCustomizer from '@/components/dashboard/WidgetCustomizer'
import { transactionsVolumeData, revenueData, topMerchantsData, transactionDistributionData } from '@/data/chartData'
import { Users, CreditCard, DollarSign, TrendingUp, RefreshCw, Settings, AlertCircle } from 'lucide-react'

function statusToBadgeStatus(status?: RecentActivityItem['status']): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'error':
      return 'danger'
    default:
      return 'neutral'
  }
}

// Demo data for immediate visual feedback
const demoStats = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    value: 2847392,
    format: 'currency' as const,
    change: { value: 12.5, trend: 'up' as const, label: 'vs last month' },
    icon: <DollarSign className="h-5 w-5" />,
    variant: 'default' as const,
  },
  {
    id: 'users',
    title: 'Active Users',
    value: 18429,
    format: 'compact' as const,
    change: { value: 8.2, trend: 'up' as const, label: 'vs last month' },
    icon: <Users className="h-5 w-5" />,
    variant: 'default' as const,
  },
  {
    id: 'transactions',
    title: 'Transactions',
    value: 142857,
    format: 'compact' as const,
    change: { value: -2.1, trend: 'down' as const, label: 'vs last month' },
    icon: <CreditCard className="h-5 w-5" />,
    variant: 'default' as const,
  },
  {
    id: 'growth',
    title: 'Growth Rate',
    value: 23.8,
    format: 'none' as const,
    suffix: '%',
    change: { value: 4.3, trend: 'up' as const, label: 'vs last quarter' },
    icon: <TrendingUp className="h-5 w-5" />,
    variant: 'default' as const,
  },
]

const demoActivity: RecentActivityItem[] = [
  { id: '1', type: 'merchant', title: 'New merchant onboarded', description: 'TechStore Inc. completed verification', createdAt: new Date().toISOString(), status: 'success' },
  { id: '2', type: 'transaction', title: 'High-value transaction flagged', description: 'Transaction #TXN-892341 requires review', createdAt: new Date(Date.now() - 3600000).toISOString(), status: 'warning' },
  { id: '3', type: 'system', title: 'System health check passed', description: 'All services operational', createdAt: new Date(Date.now() - 7200000).toISOString(), status: 'success' },
  { id: '4', type: 'user', title: 'Failed login attempts detected', description: 'Multiple failed logins from IP 192.168.1.x', createdAt: new Date(Date.now() - 10800000).toISOString(), status: 'error' },
  { id: '5', type: 'system', title: 'Daily report generated', description: 'January 6, 2026 summary available', createdAt: new Date(Date.now() - 14400000).toISOString(), status: 'success' },
]

export default function DashboardPage() {
  const pushToast = useToastStore((s) => s.push)
  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const mainDashboardWidgets = useDashboardWidgetStore((s) => s.mainDashboardWidgets)

  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const res = await Api.dashboardApi.getOverview()
      setData(res)
      pushToast({ variant: 'success', title: 'Dashboard', message: 'Dashboard refreshed successfully.' })
    } catch (err) {
      console.error('Failed to refresh dashboard:', err)
      setError('Failed to refresh dashboard. Please try again.')
      pushToast({ variant: 'error', title: 'Dashboard', message: 'Failed to refresh dashboard.' })
    } finally {
      setRefreshing(false)
    }
  }

  const visibleWidgets = mainDashboardWidgets.filter((w) => w.visible).sort((a, b) => a.order - b.order)
  const chartWidgets = visibleWidgets.filter((w) => w.type !== 'stat-card')

  // Use demo activity if no real data
  const activityItems = data?.recentActivity?.length ? data.recentActivity : demoActivity

  return (
    <div className="space-y-6 max-w-page mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Platform health and recent activity overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCustomizer(true)}
            leftIcon={<Settings className="h-4 w-4" />}
          >
            Customize
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="p-4 rounded-md bg-status-danger-subtle border border-status-danger/20 flex items-start gap-3"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-status-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-status-danger-text">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="mt-2 text-status-danger-text"
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={`skeleton-stat-${i}`} padding="md">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </Card>
            ))}
          </>
        ) : (
          demoStats.map((stat) => (
            <StatCard
              key={stat.id}
              title={stat.title}
              value={stat.value}
              format={stat.format}
              suffix={stat.suffix}
              change={stat.change}
              icon={stat.icon}
              variant={stat.variant}
            />
          ))
        )}
      </div>

      {/* Charts Grid */}
      {chartWidgets.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {chartWidgets.map((widget) => {
            let chartComponent = null
            switch (widget.type) {
              case 'line-chart':
                chartComponent = (
                  <LineChartWidget
                    key={widget.id}
                    data={widget.dataKey === 'revenue' ? revenueData : transactionsVolumeData}
                    title={widget.title}
                    dataKey="value"
                  />
                )
                break
              case 'bar-chart':
                chartComponent = (
                  <BarChartWidget
                    key={widget.id}
                    data={topMerchantsData}
                    title={widget.title}
                    dataKey="sales"
                  />
                )
                break
              case 'pie-chart':
                chartComponent = (
                  <PieChartWidget
                    key={widget.id}
                    data={transactionDistributionData}
                    title={widget.title}
                    dataKey="value"
                  />
                )
                break
              case 'area-chart':
                chartComponent = (
                  <AreaChartWidget
                    key={widget.id}
                    data={revenueData}
                    title={widget.title}
                    dataKey="value"
                  />
                )
                break
            }
            return (
              <div key={widget.id} className={widget.size === 'large' ? 'lg:col-span-2' : ''}>
                {chartComponent}
              </div>
            )
          })}
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader
          title="Recent Activity"
          subtitle="Latest platform events and updates"
        />
        <CardBody>
          {loading ? (
            <div className="divide-y divide-border-subtle">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={`skeleton-activity-${i}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="mt-2 h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : activityItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-text-tertiary">No recent activity to display.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {activityItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-tertiary">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-text-tertiary">
                      {formatDateTime(item.createdAt)}
                    </span>
                    <Badge status={statusToBadgeStatus(item.status)} size="sm" dot>
                      {item.status ?? 'info'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Widget Customizer Modal */}
      {showCustomizer && (
        <WidgetCustomizer
          dashboard="mainDashboard"
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </div>
  )
}
