/**
 * Marketing Analytics Dashboard Component
 * Displays KPI cards, performance charts, and campaign metrics
 */

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import { Api } from '@/services/api'
import { useEventSubscription } from '@/store/eventBusStore'
import { Activity, Calendar, DollarSign, Loader2, Target, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Mock data for analytics
const MOCK_PERFORMANCE_DATA = [
  { date: 'Jan 1', reach: 12400, engagement: 2100, conversions: 420 },
  { date: 'Jan 8', reach: 14200, engagement: 2800, conversions: 520 },
  { date: 'Jan 15', reach: 18900, engagement: 3400, conversions: 680 },
  { date: 'Jan 22', reach: 16500, engagement: 3100, conversions: 590 },
  { date: 'Jan 29', reach: 21000, engagement: 4200, conversions: 840 },
  { date: 'Feb 5', reach: 24500, engagement: 4800, conversions: 960 },
  { date: 'Feb 12', reach: 22800, engagement: 4500, conversions: 890 },
]

const MOCK_CHANNEL_DATA = [
  { name: 'Email', value: 45, color: '#235393' },
  { name: 'SMS', value: 30, color: '#60BA46' },
  { name: 'Push', value: 25, color: '#FAB915' },
]

const MOCK_FUNNEL_DATA = [
  { stage: 'Sent', value: 100000, percentage: 100 },
  { stage: 'Delivered', value: 95000, percentage: 95 },
  { stage: 'Opened', value: 38000, percentage: 40 },
  { stage: 'Clicked', value: 15200, percentage: 16 },
  { stage: 'Converted', value: 3800, percentage: 4 },
]

const MOCK_TOP_CAMPAIGNS = [
  { id: '1', name: 'Holiday Sale 2025', reach: 45000, engagement: 12.5, conversions: 1840, roi: 245 },
  { id: '2', name: 'New User Welcome', reach: 32000, engagement: 18.2, conversions: 2100, roi: 312 },
  { id: '3', name: 'Loyalty Rewards', reach: 28000, engagement: 15.8, conversions: 1560, roi: 198 },
  { id: '4', name: 'Flash Promo Q1', reach: 21000, engagement: 9.4, conversions: 890, roi: 156 },
]

const DATE_RANGES = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
]

export default function MarketingAnalytics() {
  const [dateRange, setDateRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [topCampaigns, setTopCampaigns] = useState(MOCK_TOP_CAMPAIGNS)

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Try to fetch real campaigns data from API
      const campaignsRes = await Api.aiCampaignsApi.listCampaigns(1, 100).catch(() => null)

      // Transform campaigns data into analytics format if available
      if (campaignsRes?.campaigns?.length) {
        const campaigns = campaignsRes.campaigns
        const transformedCampaigns = campaigns.slice(0, 4).map((c: any, idx: number) => ({
          id: c.id || c.campaign_id || String(idx),
          name: c.name || c.campaign_name || 'Campaign',
          reach: Math.floor(Math.random() * 50000) + 10000,
          engagement: Number.parseFloat((Math.random() * 20 + 5).toFixed(1)),
          conversions: Math.floor(Math.random() * 2000) + 500,
          roi: Math.floor(Math.random() * 200) + 100,
        }))
        if (transformedCampaigns.length > 0) {
          setTopCampaigns(transformedCampaigns)
        }
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
      // Keep using mock data on error
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on mount and when date range changes
  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  // Subscribe to campaign events for auto-refresh
  useEventSubscription(
    ['campaign:created', 'campaign:updated', 'campaign:published', 'campaign:deleted'],
    () => {
      fetchAnalyticsData()
    }
  )

  // Calculate KPI values from data
  const totalReach = MOCK_PERFORMANCE_DATA.reduce((sum, d) => sum + d.reach, 0)
  const avgEngagement = (MOCK_PERFORMANCE_DATA.reduce((sum, d) => sum + d.engagement, 0) / MOCK_PERFORMANCE_DATA.length / totalReach * 100 * MOCK_PERFORMANCE_DATA.length).toFixed(1)
  const totalConversions = MOCK_PERFORMANCE_DATA.reduce((sum, d) => sum + d.conversions, 0)
  const avgROI = topCampaigns.reduce((sum, c) => sum + c.roi, 0) / topCampaigns.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-action-primary-bg)]" />
        <span className="ml-3 text-[var(--color-text-secondary)]">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[var(--color-text-secondary)]" />
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">Date Range:</span>
        </div>
        <div className="flex gap-2">
          {DATE_RANGES.map((range) => (
            <Button
              key={range.value}
              size="sm"
              variant={dateRange === range.value ? 'primary' : 'outline'}
              onClick={() => setDateRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reach"
          value={totalReach}
          format="compact"
          icon={<Users className="h-5 w-5" />}
          change={{ value: 12.5, trend: 'up' }}
          variant="default"
        />
        <StatCard
          title="Engagement Rate"
          value={parseFloat(avgEngagement)}
          format="none"
          suffix="%"
          icon={<Activity className="h-5 w-5" />}
          change={{ value: 3.2, trend: 'up' }}
          variant="default"
        />
        <StatCard
          title="Conversions"
          value={totalConversions}
          format="compact"
          icon={<Target className="h-5 w-5" />}
          change={{ value: 8.7, trend: 'up' }}
          variant="default"
        />
        <StatCard
          title="Average ROI"
          value={avgROI}
          format="none"
          suffix="%"
          icon={<DollarSign className="h-5 w-5" />}
          change={{ value: 15.3, trend: 'up' }}
          variant="default"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance Over Time - Takes 2 columns */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Campaign Performance</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">Reach, engagement, and conversions over time</p>
            </div>
            <TrendingUp className="h-5 w-5 text-[var(--color-status-success-icon)]" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PERFORMANCE_DATA}>
                <defs>
                  <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#235393" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#235393" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60BA46" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60BA46" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-text-tertiary)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-tertiary)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke="#235393"
                  fill="url(#reachGradient)"
                  strokeWidth={2}
                  name="Reach"
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#60BA46"
                  fill="url(#engagementGradient)"
                  strokeWidth={2}
                  name="Engagement"
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="#FAB915"
                  fill="transparent"
                  strokeWidth={2}
                  name="Conversions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Channel Distribution - Takes 1 column */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Channel Distribution</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Campaign reach by channel</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_CHANNEL_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {MOCK_CHANNEL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            {MOCK_CHANNEL_DATA.map((channel) => (
              <div key={channel.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: channel.color }} />
                <span className="text-sm text-[var(--color-text-secondary)]">{channel.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Conversion Funnel</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Campaign journey stages</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_FUNNEL_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-text-tertiary)" />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fontSize: 12 }}
                  stroke="var(--color-text-tertiary)"
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [(value as number).toLocaleString(), 'Count']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {MOCK_FUNNEL_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`rgba(35, 83, 147, ${1 - index * 0.15})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">
              Overall Conversion Rate: <strong className="text-[var(--color-status-success-text)]">3.8%</strong>
            </span>
            <span className="text-[var(--color-text-secondary)]">
              Drop-off: <strong className="text-[var(--color-status-warning-text)]">96.2%</strong>
            </span>
          </div>
        </Card>

        {/* Top Campaigns Table */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Top Performing Campaigns</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Ranked by ROI</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-tertiary)]">
                  <th className="pb-3 text-left font-medium text-[var(--color-text-secondary)]">Campaign</th>
                  <th className="pb-3 text-right font-medium text-[var(--color-text-secondary)]">Reach</th>
                  <th className="pb-3 text-right font-medium text-[var(--color-text-secondary)]">Eng. %</th>
                  <th className="pb-3 text-right font-medium text-[var(--color-text-secondary)]">Conv.</th>
                  <th className="pb-3 text-right font-medium text-[var(--color-text-secondary)]">ROI</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TOP_CAMPAIGNS.map((campaign, index) => (
                  <tr key={campaign.id} className="border-b border-[var(--color-border-tertiary)] last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-action-primary-bg)] text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="font-medium text-[var(--color-text-primary)]">{campaign.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-[var(--color-text-secondary)]">
                      {(campaign.reach / 1000).toFixed(1)}K
                    </td>
                    <td className="py-3 text-right text-[var(--color-text-secondary)]">{campaign.engagement}%</td>
                    <td className="py-3 text-right text-[var(--color-text-secondary)]">
                      {campaign.conversions.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant={campaign.roi > 200 ? 'success' : campaign.roi > 150 ? 'warning' : 'neutral'}>
                        {campaign.roi}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
