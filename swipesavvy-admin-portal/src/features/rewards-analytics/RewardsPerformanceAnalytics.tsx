import {
  getMerchantBreakdown,
  getRedemptionFunnel,
  getRewardsActivitySummary,
  getTierDistribution,
  getTopEarners,
} from '@/services/rewardsAnalyticsService'
import type {
  RewardsAnalyticsFilters,
  RewardsAnalyticsPageData
} from '@/types/rewardsAnalytics'
import {
  Clock,
  Sparkles,
  TrendingDown,
  Users
} from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import useSWR from 'swr'
import RewardsFilters from './components/RewardsFilters'

const staticMerchantOptions = [
  { value: 'm_1', label: 'Northside Market' },
  { value: 'm_2', label: 'Downtown Deli' },
  { value: 'm_3', label: 'City Grocer' },
  { value: 'm_4', label: 'Lakeview Market' },
  { value: 'm_5', label: 'Corner Café' },
  { value: 'm_6', label: 'Market Street' },
  { value: 'm_7', label: 'Southside Bistro' },
  { value: 'm_8', label: 'Evergreen Foods' },
]

const tierOptions = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function parseArrayParam(value: string | null): string[] {
  if (!value) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function parseFilters(searchParams: URLSearchParams): RewardsAnalyticsFilters {
  return {
    startDate: searchParams.get('startDate') || daysAgo(29),
    endDate: searchParams.get('endDate') || todayIso(),
    merchantIds: parseArrayParam(searchParams.get('merchantIds')),
    tiers: parseArrayParam(searchParams.get('tiers')),
  }
}

function buildSearchParams(filters: RewardsAnalyticsFilters) {
  const params = new URLSearchParams()
  params.set('startDate', filters.startDate)
  params.set('endDate', filters.endDate)
  if (filters.merchantIds.length) {
    params.set('merchantIds', filters.merchantIds.join(','))
  }
  if (filters.tiers.length) {
    params.set('tiers', filters.tiers.join(','))
  }
  return params
}

async function fetchRewardsAnalytics(filters: RewardsAnalyticsFilters): Promise<RewardsAnalyticsPageData> {
  const [summary, topEarners, redemptionFunnel, tierDistribution, merchantBreakdown] = await Promise.all([
    getRewardsActivitySummary(filters),
    getTopEarners(filters),
    getRedemptionFunnel(filters),
    getTierDistribution(filters),
    getMerchantBreakdown(filters),
  ])

  return { summary, topEarners, redemptionFunnel, tierDistribution, merchantBreakdown }
}

function getRangeLabel(filters: RewardsAnalyticsFilters) {
  const today = todayIso()
  const dateMap: Record<string, string> = {
    [daysAgo(6)]: '7d',
    [daysAgo(29)]: '30d',
    [daysAgo(89)]: '90d',
    [daysAgo(364)]: '1y',
  }
  return dateMap[filters.startDate] === '7d' && filters.endDate === today
    ? '7d'
    : dateMap[filters.startDate] === '30d' && filters.endDate === today
    ? '30d'
    : dateMap[filters.startDate] === '90d' && filters.endDate === today
    ? '90d'
    : dateMap[filters.startDate] === '1y' && filters.endDate === today
    ? '1y'
    : 'custom'
}

function summaryCard(label: string, value: string, hint: string, icon: ReactNode) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-900">{icon}</div>
      </div>
      <p className="mt-4 text-sm text-slate-600">{hint}</p>
    </div>
  )
}

export default function RewardsPerformanceAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(
  () => parseFilters(searchParams),
  [searchParams],
)

  const key = useMemo(
    () => [
      'rewards-performance',
      filters.startDate,
      filters.endDate,
      filters.merchantIds.join(','),
      filters.tiers.join(','),
    ],
    [filters.startDate, filters.endDate, filters.merchantIds, filters.tiers],
  )

  const { data, error, isLoading, isValidating, mutate } = useSWR(key, () => fetchRewardsAnalytics(filters), {
    dedupingInterval: 45_000,
    revalidateOnFocus: false,
  })

  const onFiltersChange = (updatedFilters: RewardsAnalyticsFilters) => {
    setSearchParams(buildSearchParams(updatedFilters), { replace: true })
  }

  const refresh = async () => {
  await mutate(
    () => fetchRewardsAnalytics(filters),
    {
      revalidate: true,
      populateCache: true,
    },
  )
}

  const selectedRange = getRangeLabel(filters)
  const loadingMessage = isLoading ? 'Loading rewards analytics…' : isValidating ? 'Updating insights…' : null

  const activeMerchantsLabel = filters.merchantIds.length ? `${filters.merchantIds.length} selected` : 'All merchants'
  const activeTiersLabel = filters.tiers.length ? `${filters.tiers.length} selected` : 'All tiers'

  return (
    <div className="space-y-6 px-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Rewards Performance Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Track who is earning and redeeming rewards, uncover funnel blockages, and compare tier performance across the merchant network.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-slate-900/5 px-4 py-2 text-sm text-slate-700">
            {filters.startDate} → {filters.endDate}
          </div>
          <div className="rounded-2xl bg-slate-900/5 px-4 py-2 text-sm text-slate-700">
            {activeMerchantsLabel} · {activeTiersLabel}
          </div>
        </div>
      </div>

      <RewardsFilters
        filters={filters}
        merchantOptions={staticMerchantOptions}
        tierOptions={tierOptions}
        onFiltersChange={onFiltersChange}
        onRefresh={refresh}
        isRefreshing={Boolean(isValidating)}
      />

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p className="font-semibold">Unable to load rewards analytics</p>
          <p className="mt-2">{(error as any)?.message || 'Please try refreshing the report.'}</p>
        </div>
      ) : null}

      {loadingMessage ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">{loadingMessage}</div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        {summaryCard(
          'Points issued',
          data ? data.summary.totals.pointsIssued.toLocaleString() : '--',
          'Total points issued in the selected range',
          <Sparkles className="h-6 w-6" />,
        )}
        {summaryCard(
          'Points redeemed',
          data ? data.summary.totals.pointsRedeemed.toLocaleString() : '--',
          'Total points redeemed in the selected range',
          <TrendingDown className="h-6 w-6" />,
        )}
        {summaryCard(
          'Active earners',
          data ? data.summary.totals.activeEarners.toLocaleString() : '--',
          'Customers with reward activity this period',
          <Users className="h-6 w-6" />,
        )}
        {summaryCard(
          'Redemption rate',
          data ? `${data.summary.totals.redemptionRate.toFixed(1)}%` : '--',
          'Share of eligible points redeemed',
          <Clock className="h-6 w-6" />,
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section data-testid="rewards-line-chart" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Points issued versus redeemed</h2>
              <p className="text-sm text-slate-500">Time-series view of reward activity.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{selectedRange}</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.summary.trend ?? []} margin={{ top: 10, right: 24, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#cbd5e1' }} />
                <Line type="monotone" dataKey="issued" stroke="#2563eb" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="redeemed" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section data-testid="tier-distribution-chart" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Tier distribution</h2>
            <p className="text-sm text-slate-500">How membership tiers stack across active rewards users.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.tierDistribution ?? []}
                  dataKey="share"
                  nameKey="tier"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {(data?.tierDistribution ?? []).map((entry, index) => (
                    <Cell
                      key={`slice-${entry.tier}`}
                      fill={['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section data-testid="top-earners-chart" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Top earners by points balance</h2>
              <p className="text-sm text-slate-500">Horizontal ranking of the most active reward earners.</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(data?.topEarners ?? []).slice(0, 10).map((item) => ({
                  ...item,
                  name: `${item.name} · ${item.tier}`,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 24, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} tick={{ fill: '#334155' }} />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="pointsBalance" fill="#2563eb" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section data-testid="merchant-breakdown" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Redemption funnel</h2>
            <p className="text-sm text-slate-500">Eligible rewards, views, and completed redemptions.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ stage: 'Rewards funnel', ...Object.fromEntries((data?.redemptionFunnel ?? []).map((item) => [item.stage.toLowerCase(), item.value])) }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="category" dataKey="stage" hide />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="eligible" stackId="a" fill="#38bdf8" />
                <Bar dataKey="viewed" stackId="a" fill="#60a5fa" />
                <Bar dataKey="redeemed" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Merchant breakdown</h2>
            <p className="text-sm text-slate-500">How each merchant is converting reward activity.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-700">
            {data?.merchantBreakdown.length ?? 0} merchants
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(data?.merchantBreakdown ?? []).slice(0, 6).map((merchant) => (
            <div key={merchant.merchantId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{merchant.merchantName}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{merchant.tier}</p>
                </div>
                <div className="rounded-2xl bg-slate-900/5 px-3 py-2 text-xs font-semibold text-slate-900">{merchant.redemptionRate.toFixed(0)}%</div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Issued:</span> {merchant.pointsIssued.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Redeemed:</span> {merchant.pointsRedeemed.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
