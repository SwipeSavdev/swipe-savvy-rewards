import { cn } from '../../utils/cn'

export interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  label?: string
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  }

  return (
    <div className={cn('space-y-1', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
          )}
          {showLabel && (
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden',
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Circular Progress
export interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: 'primary' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const colors = {
    primary: 'text-primary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-danger-500',
  }

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-neutral-200 dark:text-neutral-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn('transition-all duration-300', colors[color])}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  )
}
