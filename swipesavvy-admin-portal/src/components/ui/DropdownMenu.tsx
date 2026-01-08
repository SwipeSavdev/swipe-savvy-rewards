import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useOutsideClick } from '@/utils/dom'
import Icon from './Icon'
import type { IconName } from './icons'

export type DropdownItemVariant = 'default' | 'danger'

export interface DropdownItem {
  key: string
  label: string
  icon?: IconName
  onSelect?: () => void
  href?: string
  variant?: DropdownItemVariant
  disabled?: boolean
}

export interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
  menuClassName?: string
}

export default function DropdownMenu({ trigger, items, align = 'right', className, menuClassName }: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)

  useOutsideClick(ref, () => setOpen(false), open)

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex">
        {trigger}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-2 min-w-[200px] rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          <div className="p-1">
            {items.map((item) => {
              const isDanger = item.variant === 'danger'
              const content = (
                <span className="flex items-center gap-2">
                  {item.icon ? <Icon name={item.icon} className="h-4 w-4" /> : null}
                  <span className="truncate">{item.label}</span>
                </span>
              )

              const common = cn(
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                item.disabled
                  ? 'cursor-not-allowed opacity-60'
                  : isDanger
                    ? 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20'
                    : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700',
              )

              if (item.href) {
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    className={common}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    {content}
                  </a>
                )
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  className={common}
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onSelect?.()
                    setOpen(false)
                  }}
                >
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
