import { cn } from '@/utils/cn'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'gradient'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  hoverable?: boolean
  clickable?: boolean
  children: ReactNode
}

const baseStyles = 'rounded-ss-lg transition-all duration-base'

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-white dark:bg-ss-gray-800
    border border-[var(--ss-border)]
  `,
  elevated: `
    bg-white dark:bg-ss-gray-800
    shadow-ss-md hover:shadow-ss-lg
    border border-transparent
  `,
  outlined: `
    bg-white dark:bg-ss-gray-800
    border-2 border-[var(--ss-border)]
    hover:border-[var(--ss-border-strong)]
  `,
  filled: `
    bg-ss-gray-50 dark:bg-ss-gray-800
    border border-transparent
  `,
  gradient: `
    bg-gradient-to-br from-ss-navy-500 to-ss-navy-700
    text-white
    shadow-ss-lg
    border border-transparent
  `,
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const hoverStyles = `
  hover:shadow-ss-lg
  hover:-translate-y-0.5
`

const clickableStyles = `
  cursor-pointer
  hover:shadow-ss-lg
  hover:-translate-y-0.5
  active:translate-y-0
  active:shadow-ss-md
`

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isHoverable = hoverable && !clickable

    const handleKeyDown = clickable
      ? (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
          }
        }
      : undefined

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          isHoverable && hoverStyles,
          clickable && clickableStyles,
          className
        )}
        {...(clickable && {
          onClick,
          onKeyDown: handleKeyDown,
          role: 'button',
          tabIndex: 0,
        })}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: ReactNode
  children?: ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, children, className, ...props }, ref) => {
    if (children) {
      return (
        <div ref={ref} className={cn('mb-4', className)} {...props}>
          {children}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('flex items-start justify-between mb-4', className)} {...props}>
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-[var(--ss-text-primary)]">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-[var(--ss-text-secondary)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0 ml-4">{action}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    )
  }
)

CardBody.displayName = 'CardBody'

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  align?: 'left' | 'center' | 'right' | 'between'
}

const footerAlignStyles: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, align = 'right', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 mt-4 pt-4 border-t border-[var(--ss-border)]',
          footerAlignStyles[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'

export default Card

export { Card }
