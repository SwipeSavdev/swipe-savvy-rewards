import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'
import Icon from './Icon'

export interface ModalProps {
  open: boolean
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  className?: string
}

export default function Modal({ open, title, description, children, footer, onClose, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full max-w-lg rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface)] shadow-md',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--ss-border)] p-4">
          <div>
            {title ? <h2 className="font-headline text-base font-semibold text-[var(--ss-text)]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-[var(--ss-text-muted)]">{description}</p> : null}
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-[var(--ss-text-muted)] hover:bg-[var(--ss-surface-alt)]"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">{children}</div>

        {footer ? <div className="border-t border-[var(--ss-border)] p-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
