/**
 * SwipeSavvy Admin Portal - Bank-Grade Spinner Component
 * Version: 4.0
 */

import { cn } from '@/utils/cn'

export interface SpinnerProps {
  size?: number
  className?: string
  /** Color variant - defaults to 'light' for use on primary buttons */
  variant?: 'light' | 'dark' | 'primary'
}

const variantStyles = {
  light: 'border-white/40 border-t-white',
  dark: 'border-text-disabled border-t-text-primary',
  primary: 'border-interactive-primary/30 border-t-interactive-primary',
}

export default function Spinner({ size = 18, className, variant = 'light' }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2',
        variantStyles[variant],
        className
      )}
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  )
}
