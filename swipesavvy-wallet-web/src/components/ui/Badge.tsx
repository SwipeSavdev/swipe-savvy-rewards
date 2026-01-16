import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'sm' | 'md'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
    const variants = {
      default:
        'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300',
      success:
        'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400',
      warning:
        'bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400',
      danger:
        'bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400',
      info:
        'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
      outline:
        'bg-transparent border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-badge',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Status dot badge
export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'online' | 'offline' | 'away' | 'busy'
  label?: string
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, label, ...props }, ref) => {
    const statusColors = {
      online: 'bg-success-500',
      offline: 'bg-neutral-400',
      away: 'bg-warning-500',
      busy: 'bg-danger-500',
    }

    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center gap-1.5', className)}
        {...props}
      >
        <span className={cn('w-2 h-2 rounded-full', statusColors[status])} />
        {label && (
          <span className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
            {label || status}
          </span>
        )}
      </span>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'
