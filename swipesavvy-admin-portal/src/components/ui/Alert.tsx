import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import Icon from './Icon'

export type AlertVariant = 'success' | 'error' | 'warning' | 'info'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children?: ReactNode
  className?: string
}

const styles: Record<AlertVariant, string> = {
  success: 'border-[rgba(96,186,70,0.35)] bg-[rgba(96,186,70,0.10)] text-[var(--ss-text)]',
  error: 'border-[rgba(229,72,77,0.35)] bg-[var(--ss-danger-soft)] text-[var(--ss-text)]',
  warning: 'border-[rgba(250,185,21,0.35)] bg-[rgba(250,185,21,0.12)] text-[var(--ss-text)]',
  info: 'border-[rgba(35,83,147,0.35)] bg-[var(--ss-primary-soft)] text-[var(--ss-text)]',
}

const icon: Record<AlertVariant, Parameters<typeof Icon>[0]['name']> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'bell',
}

export default function Alert({ variant = 'info', title, children, className }: AlertProps) {
  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', styles[variant], className)} role="alert">
      <div className="mt-0.5 text-[var(--ss-primary)]">
        <Icon name={icon[variant]} className="h-5 w-5" title={variant} />
      </div>
      <div>
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {children ? <div className={cn('mt-0.5 text-sm text-[var(--ss-text-muted)]', title ? '' : 'text-[var(--ss-text)]')}>{children}</div> : null}
      </div>
    </div>
  )
}
