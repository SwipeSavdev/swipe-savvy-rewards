import { cn } from '@/utils/cn'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import Spinner from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  iconOnly?: boolean
}

const baseStyles = `
  inline-flex items-center justify-center gap-2
  font-semibold
  rounded-ss-lg
  transition-all duration-base
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  active:scale-[0.98]
`

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-ss-navy-500 to-ss-navy-600
    text-white
    shadow-ss-sm hover:shadow-ss-md
    hover:from-ss-navy-600 hover:to-ss-navy-700
    focus-visible:ring-ss-navy-500
  `,
  secondary: `
    bg-white dark:bg-ss-gray-800
    text-ss-navy-600 dark:text-ss-navy-300
    border-2 border-ss-navy-500 dark:border-ss-navy-400
    hover:bg-ss-navy-50 dark:hover:bg-ss-gray-700
    focus-visible:ring-ss-navy-500
  `,
  ghost: `
    bg-transparent
    text-ss-navy-600 dark:text-ss-navy-300
    hover:bg-ss-navy-50 dark:hover:bg-ss-gray-800
    focus-visible:ring-ss-navy-500
  `,
  danger: `
    bg-gradient-to-r from-ss-red-500 to-ss-red-600
    text-white
    shadow-ss-sm hover:shadow-ss-md
    hover:from-ss-red-600 hover:to-ss-red-700
    focus-visible:ring-ss-red-500
  `,
  success: `
    bg-gradient-to-r from-ss-green-500 to-ss-green-600
    text-white
    shadow-ss-sm hover:shadow-ss-md
    hover:from-ss-green-600 hover:to-ss-green-700
    focus-visible:ring-ss-green-500
  `,
  outline: `
    bg-transparent
    text-ss-gray-700 dark:text-ss-gray-300
    border border-ss-gray-300 dark:border-ss-gray-600
    hover:bg-ss-gray-50 dark:hover:bg-ss-gray-800
    hover:border-ss-gray-400 dark:hover:border-ss-gray-500
    focus-visible:ring-ss-gray-500
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
  xl: 'h-12 px-6 text-base gap-2.5',
}

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 w-7 p-0',
  sm: 'h-8 w-8 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-11 w-11 p-0',
  xl: 'h-12 w-12 p-0',
}

const spinnerSizes: Record<ButtonSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      iconOnly = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && <Spinner size={spinnerSizes[size]} />}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}

        {!iconOnly && children && (
          <span className={loading ? 'opacity-0' : undefined}>{children}</span>
        )}

        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

export { Button }
