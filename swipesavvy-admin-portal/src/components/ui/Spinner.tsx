import { cn } from '@/utils/cn'

export interface SpinnerProps {
  size?: number
  className?: string
}

export default function Spinner({ size = 18, className }: SpinnerProps) {
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-[rgba(255,255,255,0.55)] border-t-[rgba(255,255,255,1)] dark:border-[rgba(246,246,246,0.35)] dark:border-t-[rgba(246,246,246,0.95)]', className)}
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  )
}
