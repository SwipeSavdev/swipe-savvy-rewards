import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Skeleton from '@/components/ui/Skeleton'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { Api } from '@/services/api'
import type { SupportDashboardStats } from '@/types/support'
import { useDashboardWidgetStore } from '@/store/dashboardWidgetStore'
import { LineChartWidget, BarChartWidget, PieChartWidget } from '@/components/charts/DashboardCharts'
import WidgetCustomizer from '@/components/dashboard/WidgetCustomizer'
import { ticketsByPriorityData, resolutionTimeData, ticketStatusDistributionData } from '@/data/chartData'

export default function SupportDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SupportDashboardStats | null>(null)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const supportDashboardWidgets = useDashboardWidgetStore((s) => s.supportDashboardWidgets)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(false)
      try {
        const res = await Api.supportApi.getStats()
        if (mounted) setStats(res)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'stat-card':
        switch (widget.dataKey) {
          case 'openTickets':
            return (
              <StatCard
                key={widget.id}
                label="Open tickets"
                value={stats?.openTickets ?? 0}
                format="number"
                trendPct={3.1}
                trendDirection="up"
              />
            )
          case 'inProgress':
            return (
              <StatCard
                key={widget.id}
                label="In progress"
                value={stats?.inProgressTickets ?? 0}
                format="number"
                trendPct={-1.2}
                trendDirection="down"
              />
            )
          case 'resolvedToday':
            return (
              <StatCard
                key={widget.id}
                label="Resolved today"
                value={stats?.resolvedToday ?? 0}
                format="number"
                trendPct={4.8}
                trendDirection="up"
              />
            )
          case 'firstResponse':
            return (
              <StatCard
                key={widget.id}
                label="First response"
                value={Math.round(stats?.firstResponseTimeHours ?? 0)}
                format="number"
                trendPct={-0.6}
                trendDirection="up"
              />
            )
          default:
            return null
        }
      case 'line-chart':
        return (
          <LineChartWidget
            key={widget.id}
            data={resolutionTimeData}
            title={widget.title}
            dataKey="hours"
          />
        )
      case 'bar-chart':
        return (
          <BarChartWidget
            key={widget.id}
            data={ticketsByPriorityData}
            title={widget.title}
            dataKey="count"
          />
        )
      case 'pie-chart':
        return (
          <PieChartWidget
            key={widget.id}
            data={ticketStatusDistributionData}
            title={widget.title}
            dataKey="value"
          />
        )
      default:
        return null
    }
  }

  const visibleWidgets = supportDashboardWidgets.filter((w) => w.visible).sort((a, b) => a.order - b.order)
  const statWidgets = visibleWidgets.filter((w) => w.type === 'stat-card')
  const chartWidgets = visibleWidgets.filter((w) => w.type !== 'stat-card')

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-40 -mx-6 -mt-6 bg-[var(--ss-bg)] px-6 py-4 mb-6 border-b border-[var(--ss-border)] flex items-end justify-between">
        <div>
          <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Support Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Ticket workload, SLA health, and team throughput.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomizer(true)}
          leftIcon={<Icon name="settings" className="h-4 w-4" />}
        >
          Customize
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[98px] w-full" />)
        ) : (
          statWidgets.map((widget) => renderWidget(widget))
        )}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <p className="font-headline text-sm font-semibold text-[var(--ss-text)]">SLA status</p>
          <p className="mt-1 text-xs text-[var(--ss-text-muted)]">Service Level Agreement performance</p>

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ss-text)]">First response within 1h</span>
                <span className="text-[var(--ss-text-muted)]">{Math.round(stats?.slaMetrics?.firstResponseSLA ?? 0)}%</span>
              </div>
              <ProgressBar value={Math.round(stats?.slaMetrics?.firstResponseSLA ?? 0)} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ss-text)]">Resolution within 24h</span>
                <span className="text-[var(--ss-text-muted)]">{Math.round(stats?.slaMetrics?.resolutionSLA ?? 0)}%</span>
              </div>
              <ProgressBar value={Math.round(stats?.slaMetrics?.resolutionSLA ?? 0)} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ss-text)]">CSAT</span>
                <span className="text-[var(--ss-text-muted)]">{(stats?.slaMetrics?.csat ?? 0).toFixed(1)} / 5</span>
              </div>
              <ProgressBar value={Math.round((stats?.slaMetrics?.csat ?? 0) * 20)} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <p className="font-headline text-sm font-semibold text-[var(--ss-text)]">Playbooks</p>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Quick links for common issue categories.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Card declines', 'Chargebacks', 'Merchant onboarding', 'KYC review', 'Refunds', 'Account access'].map((p) => (
              <div key={p} className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4 text-sm">
                <p className="font-semibold text-[var(--ss-text)]">{p}</p>
                <p className="mt-1 text-xs text-[var(--ss-text-muted)]">Placeholder docs link</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Widget Customizer Modal */}
      {showCustomizer && (
        <WidgetCustomizer
          dashboard="supportDashboard"
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </div>
  )
}
