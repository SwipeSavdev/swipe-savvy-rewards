import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import DashboardWidget from '@/components/dashboard/DashboardWidget'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { Api } from '@/services/api'
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
  { id: 'ticket-trend', type: 'line', title: 'Ticket Volume Trend', subtitle: 'Last 30 days', dataKey: 'ticketTrend', enabled: true },
  { id: 'ticket-status', type: 'pie', title: 'Ticket Status Distribution', subtitle: 'Current breakdown', dataKey: 'ticketStatus', enabled: true },
  { id: 'resolution-by-category', type: 'bar', title: 'Avg Resolution Time by Category', subtitle: 'Hours to resolve', dataKey: 'resolutionByCategory', enabled: true },
  { id: 'response-time-trend', type: 'line', title: 'First Response Time Trend', subtitle: 'Last 30 days', dataKey: 'responseTimeTrend', enabled: true },
  { id: 'csat-scores', type: 'line', title: 'CSAT Scores Trend', subtitle: 'Last 30 days', dataKey: 'csatScores', enabled: true },
  { id: 'team-performance', type: 'bar', title: 'Team Member Performance', subtitle: 'Tickets resolved per person', dataKey: 'teamPerformance', enabled: true },
]

export default function SupportDashboardPageNew() {
  const pushToast = useToastStore((s) => s.push)
  const [widgets, setWidgets] = useState<Widget[]>(AVAILABLE_WIDGETS)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Mock data generator
  const generateMockData = () => {
    const days = 30
    
    const ticketTrendData = Array.from({ length: days }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 150 + 50),
    }))

    const ticketStatusData = [
      { label: 'Open', value: 245, color: '#ef4444' },
      { label: 'In Progress', value: 189, color: '#f59e0b' },
      { label: 'Resolved', value: 1827, color: '#10b981' },
      { label: 'Closed', value: 312, color: '#8b5cf6' },
    ]

    const resolutionByCategoryData = [
      { label: 'Technical Issue', value: 4.2 },
      { label: 'Billing', value: 2.8 },
      { label: 'Merchant Onboarding', value: 3.5 },
      { label: 'KYC Review', value: 5.1 },
      { label: 'Account Access', value: 1.9 },
    ]

    const responseTimeTrendData = Array.from({ length: days }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 45 + 15),
    }))

    const csatScoresData = Array.from({ length: days }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 10 + 35) / 10,
    }))

    const teamPerformanceData = [
      { label: 'Sarah Chen', value: 47 },
      { label: 'Marcus Johnson', value: 52 },
      { label: 'Elena Rodriguez', value: 38 },
      { label: 'Alex Kumar', value: 44 },
      { label: 'Jamie Wilson', value: 41 },
    ]

    return {
      stats: {
        openTickets: { value: 245, trendPct: 3.1, trendDirection: 'up' as const },
        inProgressTickets: { value: 189, trendPct: -1.2, trendDirection: 'down' as const },
        resolvedToday: { value: 34, trendPct: 4.8, trendDirection: 'up' as const },
        firstResponseHours: { value: 0.85, trendPct: -2.3, trendDirection: 'down' as const },
        csatAverage: { value: 4.2, trendPct: 1.5, trendDirection: 'up' as const },
        slaCompliance: { value: 92.5, trendPct: 0.8, trendDirection: 'up' as const },
      },
      ticketTrendData,
      ticketStatusData,
      resolutionByCategoryData,
      responseTimeTrendData,
      csatScoresData,
      teamPerformanceData,
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API calls once support endpoints are available
        // const ticketData = await Api.supportApi.getTicketMetrics()
        // const slaData = await Api.supportApi.getSLAMetrics()
        // setData({ ticketData, slaData, ... })

        const mockData = generateMockData()
        setData(mockData)
      } catch (error) {
        console.error('Failed to load support dashboard:', error)
        pushToast({
          variant: 'error',
          title: 'Support Dashboard',
          message: 'Failed to load dashboard data.',
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const toggleWidget = (widgetId: string) => {
    setWidgets((prev) => prev.map((w) => (w.id === widgetId ? { ...w, enabled: !w.enabled } : w)))
  }

  const resetWidgets = () => {
    setWidgets(AVAILABLE_WIDGETS)
    pushToast({ variant: 'success', title: 'Support Dashboard', message: 'Widgets reset to default.' })
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
          <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Support Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Ticket workload, SLA health, team performance, and customer satisfaction.</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-[var(--ss-surface-alt)] rounded transition-colors"
          title="Dashboard settings"
        >
          <Settings className="w-5 h-5 text-[var(--ss-text)]" />
        </button>
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
            <StatCard label="Open Tickets" value={data?.stats.openTickets.value ?? 0} trendPct={data?.stats.openTickets.trendPct} trendDirection={data?.stats.openTickets.trendDirection} />
            <StatCard label="In Progress" value={data?.stats.inProgressTickets.value ?? 0} trendPct={data?.stats.inProgressTickets.trendPct} trendDirection={data?.stats.inProgressTickets.trendDirection} />
            <StatCard label="Resolved Today" value={data?.stats.resolvedToday.value ?? 0} trendPct={data?.stats.resolvedToday.trendPct} trendDirection={data?.stats.resolvedToday.trendDirection} />
            <StatCard label="Response Time" value={data?.stats.firstResponseHours.value ?? 0} format="number" suffix="h" trendPct={data?.stats.firstResponseHours.trendPct} trendDirection={data?.stats.firstResponseHours.trendDirection} />
            <StatCard label="CSAT Score" value={data?.stats.csatAverage.value ?? 0} format="number" suffix="/5" trendPct={data?.stats.csatAverage.trendPct} trendDirection={data?.stats.csatAverage.trendDirection} />
            <StatCard label="SLA Compliance" value={data?.stats.slaCompliance.value ?? 0} suffix="%" trendPct={data?.stats.slaCompliance.trendPct} trendDirection={data?.stats.slaCompliance.trendDirection} />
          </>
        )}
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {enabledWidgets.map((widget) => {
          const chartData = renderChartData(widget.dataKey)

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
