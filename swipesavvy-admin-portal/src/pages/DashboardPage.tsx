import { useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { Api } from '@/services/api'
import type { DashboardOverview, RecentActivityItem } from '@/types/dashboard'
import { formatDateTime } from '@/utils/dates'
import { useToastStore } from '@/store/toastStore'
import { useDashboardWidgetStore } from '@/store/dashboardWidgetStore'
import { LineChartWidget, BarChartWidget, PieChartWidget, AreaChartWidget } from '@/components/charts/DashboardCharts'
import WidgetCustomizer from '@/components/dashboard/WidgetCustomizer'
import { transactionsVolumeData, revenueData, topMerchantsData, transactionDistributionData } from '@/data/chartData'
import { Users, CreditCard, DollarSign, TrendingUp } from 'lucide-react'

function statusToColorScheme(status?: RecentActivityItem['status']): 'green' | 'yellow' | 'red' | 'gray' {
  switch (status) {
    case 'success':
      return 'green'
    case 'warning':
      return 'yellow'
    case 'error':
      return 'red'
    default:
      return 'gray'
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
    variant: 'gradient' as const,
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

const demoActivity = [
  { id: '1', title: 'New merchant onboarded', description: 'TechStore Inc. completed verification', createdAt: new Date().toISOString(), status: 'success' as const },
  { id: '2', title: 'High-value transaction flagged', description: 'Transaction #TXN-892341 requires review', createdAt: new Date(Date.now() - 3600000).toISOString(), status: 'warning' as const },
  { id: '3', title: 'System health check passed', description: 'All services operational', createdAt: new Date(Date.now() - 7200000).toISOString(), status: 'success' as const },
  { id: '4', title: 'Failed login attempts detected', description: 'Multiple failed logins from IP 192.168.1.x', createdAt: new Date(Date.now() - 10800000).toISOString(), status: 'error' as const },
  { id: '5', title: 'Daily report generated', description: 'January 6, 2026 summary available', createdAt: new Date(Date.now() - 14400000).toISOString(), status: 'success' as const },
]

export default function DashboardPage() {
  const pushToast = useToastStore((s) => s.push)
  const [loading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const mainDashboardWidgets = useDashboardWidgetStore((s) => s.mainDashboardWidgets)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await Api.dashboardApi.getOverview()
      setData(res)
      pushToast({ variant: 'success', title: 'Dashboard', message: 'Dashboard refreshed successfully.' })
    } catch (error) {
      console.error('Failed to refresh dashboard:', error)
      pushToast({ variant: 'error', title: 'Dashboard', message: 'Failed to refresh dashboard. Please try again.' })
    } finally {
      setRefreshing(false)
    }
  }

  const visibleWidgets = mainDashboardWidgets.filter((w) => w.visible).sort((a, b) => a.order - b.order)
  const chartWidgets = visibleWidgets.filter((w) => w.type !== 'stat-card')

  // Use demo activity if no real data
  const activityItems = data?.recentActivity?.length ? data.recentActivity : demoActivity

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--ss-text-primary)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ss-text-secondary)]">
            Overview of platform health and recent operational activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomizer(true)}
            leftIcon={<Icon name="settings" className="h-4 w-4" />}
          >
            Customize
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            leftIcon={<Icon name="refresh" className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat Cards Grid - Using Demo Data */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton key="skeleton-stat-1" className="h-[140px] w-full rounded-ss-xl" />
            <Skeleton key="skeleton-stat-2" className="h-[140px] w-full rounded-ss-xl" />
            <Skeleton key="skeleton-stat-3" className="h-[140px] w-full rounded-ss-xl" />
            <Skeleton key="skeleton-stat-4" className="h-[140px] w-full rounded-ss-xl" />
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

      {/* Recent Activity - Always show demo data */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[var(--ss-text-primary)]">
              Recent Activity
            </h2>
            <p className="mt-0.5 text-sm text-[var(--ss-text-secondary)]">
              Most recent user, merchant, and support events.
            </p>
          </div>
        </div>

        <div className="divide-y divide-[var(--ss-border)]">
          {loading ? (
            <>
              {['skeleton-activity-1', 'skeleton-activity-2', 'skeleton-activity-3', 'skeleton-activity-4', 'skeleton-activity-5'].map((id) => (
                <div key={id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </>
          ) : (
            activityItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--ss-text-primary)]">{item.title}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--ss-text-tertiary)]">{item.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--ss-text-tertiary)]">{formatDateTime(item.createdAt)}</span>
                  <Badge colorScheme={statusToColorScheme(item.status)} variant="soft" size="sm">
                    {item.status ?? 'info'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
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
