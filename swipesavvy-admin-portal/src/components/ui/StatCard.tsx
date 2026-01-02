import { cn } from '@/utils/cn'
import { formatCompactNumber, formatCurrency } from '@/utils/format'
import Card from './Card'

export interface StatCardProps {
  label: string
  value: number
  format?: 'number' | 'currency' | 'compact'
  suffix?: string
  trendPct?: number
  trendDirection?: 'up' | 'down' | 'flat'
  className?: string
}

export default function StatCard({ label, value, format = 'compact', suffix, trendPct, trendDirection, className }: StatCardProps) {
  const formatted = format === 'currency' ? formatCurrency(value) : format === 'number' ? `${value}` : formatCompactNumber(value)
  const displayValue = suffix ? `${formatted}${suffix}` : formatted

  const showTrend = typeof trendPct === 'number' && trendDirection && trendDirection !== 'flat'
  const trendColor = trendDirection === 'down' ? 'text-[var(--ss-danger)]' : 'text-[var(--ss-success)]'
  const trendSymbol = trendDirection === 'down' ? '↓' : '↑'

  return (
    <Card hover className={cn('p-4 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 border-l-4 border-[#235393]', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#235393] dark:text-[#7ACD56] uppercase tracking-wide">{label}</p>
          <p className="mt-2 font-headline text-3xl font-bold text-transparent bg-gradient-to-r from-[#235393] to-[#1A3F7A] bg-clip-text">{displayValue}</p>
        </div>
        {showTrend ? (
          <div className={cn('rounded-[var(--ss-radius-pill)] bg-gradient-to-r px-3 py-2 text-xs font-bold text-white shadow-lg', trendDirection === 'down' ? 'from-red-500 to-red-600' : 'from-[#60BA46] to-[#4A9A35]')}>
            {trendSymbol} {Math.abs(trendPct!).toFixed(1)}%
          </div>
        ) : null}
      </div>
    </Card>
  )
}
