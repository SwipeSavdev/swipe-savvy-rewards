import { useEffect, useState } from 'react'
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

function statusToVariant(status?: RecentActivityItem['status']): Parameters<typeof Badge>[0]['variant'] {
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

  useEffect(() => {
    // Don't fetch data on mount - user can click refresh
  }, [])

  const getStatCardData = (type: string) => {
    if (!data) return { value: 0, trendPct: 0, trendDirection: 'flat' as const }
    switch (type) {
      case 'users':
        return data.stats.users
      case 'transactions':
        return data.stats.transactions
      case 'revenue':
        return data.stats.revenue
      case 'growth':
        return data.stats.growth
      default:
        return { value: 0, trendPct: 0, trendDirection: 'flat' as const }
    }
  }

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'stat-card':
        const statData = getStatCardData(widget.dataKey)
        return (
          <StatCard
            key={widget.id}
            label={widget.title}
            value={statData.value}
            trendPct={statData.trendPct}
            trendDirection={statData.trendDirection}
            format={widget.dataKey === 'revenue' ? 'currency' : widget.dataKey === 'growth' ? 'number' : 'number'}
          />
        )
      case 'line-chart':
        return (
          <LineChartWidget
            key={widget.id}
            data={widget.dataKey === 'revenue' ? revenueData : transactionsVolumeData}
            title={widget.title}
            dataKey="value"
          />
        )
      case 'bar-chart':
        return (
          <BarChartWidget
            key={widget.id}
            data={topMerchantsData}
            title={widget.title}
            dataKey="sales"
          />
        )
      case 'pie-chart':
        return (
          <PieChartWidget
            key={widget.id}
            data={transactionDistributionData}
            title={widget.title}
            dataKey="value"
          />
        )
      case 'area-chart':
        return (
          <AreaChartWidget
            key={widget.id}
            data={revenueData}
            title={widget.title}
            dataKey="value"
          />
        )
      default:
        return null
    }
  }

  const visibleWidgets = mainDashboardWidgets.filter((w) => w.visible).sort((a, b) => a.order - b.order)

  const statWidgets = visibleWidgets.filter((w) => w.type === 'stat-card')
  const chartWidgets = visibleWidgets.filter((w) => w.type !== 'stat-card')

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-40 -mx-6 -mt-6 bg-[var(--ss-bg)] px-6 py-4 mb-6 border-b border-[var(--ss-border)] flex items-end justify-between">
        <div>
          <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Overview of platform health and recent operational activity.</p>
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
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            leftIcon={<Icon name="refresh" className="h-4 w-4" />}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[98px] w-full" />)
          : statWidgets.map((widget) => renderWidget(widget))}
      </div>

      {/* Charts Grid */}
      {chartWidgets.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {chartWidgets.map((widget) => {
            const chartComponent = renderWidget(widget)
            return (
              <div key={widget.id} className={widget.size === 'large' ? 'lg:col-span-2' : ''}>
                {chartComponent}
              </div>
            )
          })}
        </div>
      )}

      {/* Recent Activity */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-headline text-sm font-semibold text-[var(--ss-text)]">Recent activity</p>
            <p className="mt-1 text-xs text-[var(--ss-text-muted)]">Most recent user, merchant, and support events.</p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-[var(--ss-border)]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3">
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="mt-2 h-4 w-2/3" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))
          ) : data?.recentActivity?.length ? (
            data.recentActivity.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--ss-text)]">{item.title}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--ss-text-muted)]">{item.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--ss-text-muted)]">{formatDateTime(item.createdAt)}</span>
                  <Badge variant={statusToVariant(item.status)}>{item.status ?? 'info'}</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-sm text-[var(--ss-text-muted)]">No recent activity.</div>
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
