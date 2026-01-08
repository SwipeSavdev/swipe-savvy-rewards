import { cn } from '@/utils/cn'
import { formatCompactNumber, formatCurrency } from '@/utils/format'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

export type StatCardVariant = 'default' | 'gradient' | 'outlined'

export interface StatCardProps {
  readonly title?: string
  readonly value: number | string
  readonly format?: 'number' | 'currency' | 'compact' | 'none'
  readonly prefix?: string
  readonly suffix?: string
  readonly change?: {
    readonly value: number
    readonly trend: 'up' | 'down' | 'neutral'
    readonly label?: string
  }
  readonly icon?: ReactNode
  readonly variant?: StatCardVariant
  readonly action?: {
    readonly label: string
    readonly onClick: () => void
  }
  readonly sparklineData?: number[]
  readonly className?: string
  /** @deprecated Use `title` instead */
  readonly label?: string
  /** @deprecated Use `change.value` instead */
  readonly trendPct?: number
  /** @deprecated Use `change.trend` instead */
  readonly trendDirection?: 'up' | 'down' | 'flat'
}

interface MiniSparklineProps {
  readonly data: number[]
  readonly className?: string
}

const variantStyles: Record<StatCardVariant, string> = {
  default: `
    bg-white dark:bg-neutral-800
    border border-neutral-200 dark:border-neutral-700
  `,
  gradient: `
    bg-gradient-primary
    text-white
    shadow-md
  `,
  outlined: `
    bg-transparent
    border border-neutral-300 dark:border-neutral-600
  `,
}

function MiniSparkline({ data, className }: MiniSparklineProps) {
  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 24
  const padding = 2

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
    </svg>
  )
}

function formatValue(val: number | string, format: string): string {
  if (typeof val === 'string') return val
  switch (format) {
    case 'currency':
      return formatCurrency(val)
    case 'number':
      return val.toLocaleString()
    case 'compact':
      return formatCompactNumber(val)
    default:
      return String(val)
  }
}

function getTrendIcon(trend: 'up' | 'down' | 'neutral' | undefined) {
  if (trend === 'up') return TrendingUp
  if (trend === 'down') return TrendingDown
  return Minus
}

function getTrendColorClass(
  trend: 'up' | 'down' | 'neutral' | undefined,
  isGradient: boolean
): string {
  if (trend === 'up') {
    return isGradient ? 'text-success-300' : 'text-success-600'
  }
  if (trend === 'down') {
    return isGradient ? 'text-danger-300' : 'text-danger-600'
  }
  return isGradient ? 'text-white/60' : 'text-neutral-500'
}

function mapLegacyTrendDirection(direction: 'up' | 'down' | 'flat' | undefined): 'up' | 'down' | 'neutral' {
  if (direction === 'up') return 'up'
  if (direction === 'down') return 'down'
  return 'neutral'
}

function buildResolvedChange(
  change: { value: number; trend: 'up' | 'down' | 'neutral'; label?: string } | undefined,
  trendPct: number | undefined,
  trendDirection: 'up' | 'down' | 'flat' | undefined
): { value: number; trend: 'up' | 'down' | 'neutral'; label?: string } | undefined {
  if (change) return change
  if (trendPct === undefined) return undefined
  return {
    value: trendPct,
    trend: mapLegacyTrendDirection(trendDirection),
  }
}

export default function StatCard({
  title,
  value,
  format = 'compact',
  prefix,
  suffix,
  change,
  icon,
  variant = 'default',
  action,
  sparklineData,
  className,
  label,
  trendPct,
  trendDirection,
}: StatCardProps) {
  const resolvedTitle = title ?? label ?? ''
  const resolvedChange = buildResolvedChange(change, trendPct, trendDirection)

  const formattedValue = formatValue(value, format)
  const displayValue = `${prefix || ''}${formattedValue}${suffix || ''}`

  const isGradient = variant === 'gradient'
  const textPrimaryClass = isGradient ? 'text-white' : 'text-neutral-900 dark:text-neutral-50'
  const textSecondaryClass = isGradient ? 'text-white/70' : 'text-neutral-500 dark:text-neutral-400'
  const iconBgClass = isGradient ? 'bg-white/20' : 'bg-primary-50 dark:bg-primary-900/30'
  const iconColorClass = isGradient ? 'text-white' : 'text-primary-600 dark:text-primary-400'

  const TrendIcon = getTrendIcon(resolvedChange?.trend)
  const trendColorClass = getTrendColorClass(resolvedChange?.trend, isGradient)

  return (
    <div
      className={cn(
        'rounded-lg p-5 transition-colors duration-normal',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-sm font-medium', textSecondaryClass)}>
            {resolvedTitle}
          </p>
          <p className={cn('mt-2 text-2xl font-semibold tracking-tight', textPrimaryClass)}>
            {displayValue}
          </p>
        </div>

        {icon && (
          <div className={cn('p-2.5 rounded-lg', iconBgClass, iconColorClass)}>
            {icon}
          </div>
        )}
      </div>

      {resolvedChange && (
        <div className={cn('mt-3 flex items-center gap-1.5', trendColorClass)}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {resolvedChange.value > 0 ? '+' : ''}{resolvedChange.value.toFixed(1)}%
          </span>
          {resolvedChange.label && (
            <span className={cn('text-sm', textSecondaryClass)}>
              {resolvedChange.label}
            </span>
          )}
        </div>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className={cn('mt-3', isGradient ? 'text-white/60' : 'text-primary-400')}>
          <MiniSparkline data={sparklineData} />
        </div>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'mt-4 text-sm font-medium transition-colors',
            isGradient
              ? 'text-white/80 hover:text-white'
              : 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
          )}
        >
          {action.label} →
        </button>
      )}
    </div>
  )
}

export { StatCard }
