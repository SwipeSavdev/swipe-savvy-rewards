import { cn } from '@/utils/cn'

export interface DividerProps {
  text?: string
  className?: string
}

export default function Divider({ text, className }: DividerProps) {
  return (
    <div className={cn('relative my-4', className)}>
      <div className="h-px w-full bg-[var(--ss-border)]" />
      {text ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[var(--ss-radius-pill)] bg-[var(--ss-bg)] px-3 text-xs text-[var(--ss-text-muted)]">
          {text}
        </span>
      ) : null}
    </div>
  )
}
