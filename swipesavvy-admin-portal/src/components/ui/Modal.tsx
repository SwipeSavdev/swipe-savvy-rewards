import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'
import Icon from './Icon'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

export interface ModalProps {
  open: boolean
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  className?: string
  size?: ModalSize
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
}

export default function Modal({ open, title, description, children, footer, onClose, className, size = 'lg' }: ModalProps) {
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full max-h-[85vh] flex flex-col rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] shadow-lg',
          sizeClasses[size],
          className,
        )}
      >
        <div className="flex-shrink-0 flex items-start justify-between gap-3 border-b border-[var(--color-border-primary)] p-4">
          <div>
            {title ? <h2 className="font-headline text-base font-semibold text-[var(--color-text-primary)]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p> : null}
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer ? <div className="flex-shrink-0 border-t border-[var(--color-border-primary)] p-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
