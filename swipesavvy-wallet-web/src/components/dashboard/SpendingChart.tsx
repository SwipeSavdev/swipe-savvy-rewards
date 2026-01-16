import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Link } from 'react-router-dom'
import { TrendingUp, ChevronRight } from 'lucide-react'
import { formatCurrency, formatPercentage } from '../../utils/format'
import { cn } from '../../utils/cn'
import { Card, Skeleton } from '../ui'
import type { SpendingCategory } from '../../types/api'

interface SpendingChartProps {
  data: SpendingCategory[]
  totalSpent: number
  period?: string
  isLoading?: boolean
  className?: string
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#64748B', // Gray
]

export function SpendingChart({
  data,
  totalSpent,
  period = 'This Month',
  isLoading,
  className,
}: SpendingChartProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-5', className)}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center justify-center">
          <Skeleton className="w-40 h-40 rounded-full" />
        </div>
        <div className="space-y-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-20 flex-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // Ensure data is an array before processing
  const safeData = Array.isArray(data) ? data : []

  // Take top 5 categories and group the rest as "Other"
  const topCategories = safeData.slice(0, 5)
  const otherCategories = safeData.slice(5)
  const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.amount, 0)
  const otherPercentage = otherCategories.reduce((sum, cat) => sum + cat.percentage, 0)

  const chartData = [
    ...topCategories,
    ...(otherTotal > 0 ? [{
      category: 'Other',
      amount: otherTotal,
      percentage: otherPercentage,
    }] : []),
  ]

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neutral-400" />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Spending
          </h2>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-md">
          {period}
        </span>
      </div>

      {safeData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No spending data yet
          </p>
        </div>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as SpendingCategory
                      return (
                        <div className="bg-white dark:bg-neutral-800 p-2 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700">
                          <p className="text-xs font-medium text-neutral-900 dark:text-neutral-50">
                            {data.category}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatCurrency(data.amount)} ({formatPercentage(data.percentage)})
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                  {formatCurrency(totalSpent)}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-4">
            {chartData.slice(0, 4).map((item, index) => (
              <div key={item.category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-neutral-600 dark:text-neutral-400 flex-1 truncate">
                  {item.category}
                </span>
                <span className="text-xs font-medium text-neutral-900 dark:text-neutral-50">
                  {formatPercentage(item.percentage)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
        <Link
          to="/analytics"
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          View Analytics
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  )
}
