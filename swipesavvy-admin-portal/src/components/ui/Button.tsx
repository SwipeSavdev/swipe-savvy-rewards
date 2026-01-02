import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from './Spinner'

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
    'bg-gradient-to-r from-[#235393] via-[#2E5FB8] to-[#1A3F7A] text-white shadow-md hover:shadow-xl hover:brightness-[0.95] focus-visible:shadow-xl transition-all duration-200',
  secondary:
    'bg-gradient-to-r from-[#60BA46] to-[#4A9A35] text-white shadow-md hover:shadow-xl hover:brightness-[0.95] transition-all duration-200',
  danger:
    'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-xl hover:brightness-[0.95] transition-all duration-200',
  outline:
    'bg-transparent text-[#235393] border-2 border-[#235393] hover:bg-gradient-to-r hover:from-[#235393]/10 hover:to-[#60BA46]/10 transition-all duration-200 dark:text-[#7ACD56] dark:border-[#7ACD56]',
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
