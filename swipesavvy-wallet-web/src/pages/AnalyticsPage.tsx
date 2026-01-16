import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Lightbulb, ChevronRight } from 'lucide-react'
import { useAnalyticsStore } from '../store'
import { Card, Skeleton } from '../components/ui'
import { formatCurrency, formatPercentage } from '../utils/format'
import { cn } from '../utils/cn'

type Period = '7d' | '30d' | '90d' | '1y'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B']

export function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const {
    overview,
    spendingByCategory,
    monthlyTrends,
    insights,
    topMerchants,
    isLoading,
    fetchAll,
  } = useAnalyticsStore()

  useEffect(() => {
    fetchAll(period)
  }, [period, fetchAll])

  const periods: { value: Period; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Analytics</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Track your spending patterns and financial health
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                period === p.value
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="Income"
          value={overview?.totalIncome || 0}
          icon={<TrendingUp className="w-5 h-5" />}
          color="success"
          isLoading={isLoading}
        />
        <OverviewCard
          title="Expenses"
          value={overview?.totalExpenses || 0}
          icon={<TrendingDown className="w-5 h-5" />}
          color="danger"
          isLoading={isLoading}
        />
        <OverviewCard
          title="Savings"
          value={overview?.totalSavings || 0}
          icon={<PiggyBank className="w-5 h-5" />}
          color="primary"
          isLoading={isLoading}
        />
        <OverviewCard
          title="Savings Rate"
          value={overview?.savingsRate || 0}
          icon={<DollarSign className="w-5 h-5" />}
          color="warning"
          isPercentage
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending by Category */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Spending by Category
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Skeleton className="w-40 h-40 rounded-full" />
            </div>
          ) : spendingByCategory.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-neutral-500">
              No data available
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={spendingByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {spendingByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-neutral-800 p-2 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
                            <p className="text-sm font-medium">{data.category}</p>
                            <p className="text-xs text-neutral-500">{formatCurrency(data.amount)}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {spendingByCategory.slice(0, 5).map((item, index) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 flex-1 truncate">
                      {item.category}
                    </span>
                    <span className="text-xs font-medium">{formatPercentage(item.percentage)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Monthly Trends */}
        <Card className="lg:col-span-2 p-5">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Income vs Expenses
          </h2>
          {isLoading ? (
            <Skeleton className="w-full h-48" />
          ) : monthlyTrends.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-neutral-500">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success-500" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger-500" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Expenses</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Top Merchants
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : topMerchants.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">No data available</div>
          ) : (
            <div className="space-y-3">
              {topMerchants.map((merchant, index) => (
                <div key={merchant.merchantId} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">
                      {merchant.merchantName}
                    </p>
                    <p className="text-xs text-neutral-500">{merchant.transactionCount} transactions</p>
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                    {formatCurrency(merchant.totalSpent)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Insights */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-warning-500" />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              AI Insights
            </h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No insights available yet. Keep using your account to get personalized insights.
            </div>
          ) : (
            <div className="space-y-3">
              {insights.slice(0, 4).map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                        {insight.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{insight.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

interface OverviewCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'success' | 'danger' | 'primary' | 'warning'
  isPercentage?: boolean
  isLoading?: boolean
}

function OverviewCard({ title, value, icon, color, isPercentage, isLoading }: OverviewCardProps) {
  const colorClasses = {
    success: 'bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-400',
    danger: 'bg-danger-50 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400',
    primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    warning: 'bg-warning-50 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
  }

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-24 h-7" />
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color])}>
          {icon}
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{title}</span>
      </div>
      <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
        {isPercentage ? formatPercentage(value) : formatCurrency(value)}
      </div>
    </Card>
  )
}
