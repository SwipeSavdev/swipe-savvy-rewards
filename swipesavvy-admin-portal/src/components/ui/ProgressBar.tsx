import { cn } from '@/utils/cn'

export interface ProgressBarProps {
  value: number
  max?: number
  className?: string
}

export default function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-[var(--ss-radius-pill)] bg-[var(--ss-surface-alt)]', className)}>
      <div className="h-full bg-[var(--ss-primary)]" style={{ width: `${pct}%` }} />
    </div>
  )
}
