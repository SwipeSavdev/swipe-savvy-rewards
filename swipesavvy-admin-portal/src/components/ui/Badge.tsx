import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

export interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-[var(--ss-primary-soft)] text-[var(--ss-primary)] border-[rgba(35,83,147,0.25)]',
  success: 'bg-[rgba(96,186,70,0.15)] text-[var(--ss-success)] border-[rgba(96,186,70,0.25)]',
  warning: 'bg-[rgba(250,185,21,0.15)] text-[var(--ss-warning)] border-[rgba(250,185,21,0.25)]',
  danger: 'bg-[var(--ss-danger-soft)] text-[var(--ss-danger)] border-[rgba(229,72,77,0.25)]',
  neutral: 'bg-[var(--ss-surface-alt)] text-[var(--ss-text)] border-[var(--ss-border)]',
}

export default function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[var(--ss-radius-pill)] border px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
