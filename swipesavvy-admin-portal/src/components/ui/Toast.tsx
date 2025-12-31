import { cn } from '@/utils/cn'
import Icon from './Icon'
import type { ToastItem } from '@/store/toastStore'

export default function Toast({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const variantStyles: Record<ToastItem['variant'], string> = {
    success: 'border-[rgba(96,186,70,0.35)] bg-[var(--ss-surface)]',
    error: 'border-[rgba(229,72,77,0.35)] bg-[var(--ss-surface)]',
    warning: 'border-[rgba(250,185,21,0.35)] bg-[var(--ss-surface)]',
    info: 'border-[rgba(35,83,147,0.35)] bg-[var(--ss-surface)]',
  }

  const icon: Record<ToastItem['variant'], Parameters<typeof Icon>[0]['name']> = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'bell',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-[380px] rounded-lg border p-4 shadow-md',
        variantStyles[toast.variant],
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[var(--ss-primary)]">
          <Icon name={icon[toast.variant]} className="h-5 w-5" />
        </div>

        <div className="flex-1">
          {toast.title ? <p className="text-sm font-semibold text-[var(--ss-text)]">{toast.title}</p> : null}
          <p className={cn('text-sm', toast.title ? 'mt-0.5 text-[var(--ss-text-muted)]' : 'text-[var(--ss-text)]')}>
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          className="rounded-md p-1 text-[var(--ss-text-muted)] hover:bg-[var(--ss-surface-alt)]"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
