import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from './Spinner'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-0'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--ss-primary)] text-white shadow-sm hover:shadow-md hover:brightness-[0.98] focus-visible:shadow-md',
  secondary:
    'bg-[var(--ss-surface)] text-[var(--ss-primary)] border border-[var(--ss-border)] hover:border-[rgba(35,83,147,0.30)] hover:bg-[var(--ss-surface-alt)]',
  danger:
    'bg-[var(--ss-danger)] text-white shadow-sm hover:shadow-md hover:brightness-[0.98]',
  outline:
    'bg-transparent text-[var(--ss-text)] border border-[var(--ss-border)] hover:bg-[var(--ss-surface-alt)]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], 'ss-focus', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={16} /> : leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  )
}
