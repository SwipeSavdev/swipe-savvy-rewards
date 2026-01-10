import { useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type TabsVariant = 'default' | 'pills' | 'underline'

export interface TabItem {
  key: string
  label: string
  content: ReactNode
  badge?: number
}

export interface TabsProps {
  items: TabItem[]
  value?: string
  onChange?: (_key: string) => void
  variant?: TabsVariant
  className?: string
}

export default function Tabs({ items, value, onChange, variant = 'default', className }: TabsProps) {
  const [internal, setInternal] = useState(items[0]?.key)
  const active = value ?? internal

  const setActive = (key: string) => {
    onChange?.(key)
    if (!onChange) setInternal(key)
  }

  const tabStyle: Record<TabsVariant, string> = {
    default: 'rounded-md border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-1',
    pills: 'rounded-full bg-[var(--color-bg-secondary)] p-1',
    underline: 'border-b border-[var(--color-border-primary)]',
  }

  const buttonBase = 'text-sm font-medium transition-colors'

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex items-center gap-1', tabStyle[variant])}>
        {items.map((t) => {
          const isActive = t.key === active
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                buttonBase,
                variant === 'underline'
                  ? cn(
                      'relative px-3 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                      isActive && 'text-[var(--color-action-primary-bg)]',
                    )
                  : cn(
                      'rounded-md px-3 py-2',
                      isActive
                        ? 'bg-[var(--color-action-primary-bg)] text-[var(--color-action-primary-text)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]',
                    ),
              )}
              aria-current={isActive}
            >
              <span className="inline-flex items-center gap-2">
                {t.label}
                {typeof t.badge === 'number' ? (
                  <span className="rounded-full bg-[var(--color-bg-tertiary)] px-2 py-0.5 text-xs text-[var(--color-text-tertiary)]">
                    {t.badge}
                  </span>
                ) : null}
              </span>
              {variant === 'underline' && isActive ? (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--color-action-primary-bg)]" />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {items.map((t) => (t.key === active ? <div key={t.key}>{t.content}</div> : null))}
      </div>
    </div>
  )
}
