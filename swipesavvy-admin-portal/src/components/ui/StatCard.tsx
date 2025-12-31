import Card from './Card'
import { cn } from '@/utils/cn'
import { formatCompactNumber, formatCurrency } from '@/utils/format'

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
    <Card hover className={cn('p-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--ss-text-muted)]">{label}</p>
          <p className="mt-1 font-headline text-2xl font-semibold text-[var(--ss-text)]">{displayValue}</p>
        </div>
        {showTrend ? (
          <div className={cn('rounded-[var(--ss-radius-pill)] bg-[var(--ss-surface-alt)] px-2 py-1 text-xs font-medium', trendColor)}>
            {trendSymbol} {Math.abs(trendPct!).toFixed(1)}%
          </div>
        ) : null}
      </div>
    </Card>
  )
}
