import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hoverable = false, children, ...props }, ref) => {
    const variants = {
      default:
        'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
      gradient:
        'bg-gradient-card text-white relative overflow-hidden',
      outlined:
        'bg-transparent border-2 border-neutral-300 dark:border-neutral-600',
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4 sm:p-5',
      lg: 'p-5 sm:p-6',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-card',
          variants[variant],
          paddings[padding],
          hoverable && 'transition-shadow duration-normal hover:shadow-card-hover cursor-pointer',
          className
        )}
        {...props}
      >
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-card-shine pointer-events-none" />
        )}
        <div className={variant === 'gradient' ? 'relative' : ''}>{children}</div>
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-700', className)}
      {...props}
    >
      <div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
)

CardHeader.displayName = 'CardHeader'

// Card Content
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

// Card Footer
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-700', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'
