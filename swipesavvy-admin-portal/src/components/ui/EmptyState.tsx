import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import Icon from './Icon'
import type { IconName } from './icons'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: IconName
  illustrationSrc?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ title, description, icon = 'dashboard', illustrationSrc, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface)] p-8 text-center', className)}>
      {illustrationSrc ? (
        <img src={illustrationSrc} alt="" className="mb-4 h-32 w-auto opacity-90" />
      ) : (
        <div className="mb-4 rounded-lg bg-[var(--ss-surface-alt)] p-3 text-[var(--ss-primary)]">
          <Icon name={icon} className="h-6 w-6" />
        </div>
      )}

      <h3 className="font-headline text-base font-semibold text-[var(--ss-text)]">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-[var(--ss-text-muted)]">{description}</p> : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
