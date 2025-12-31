import { cn } from '@/utils/cn'
import Button from './Button'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export default function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const clampedPage = Math.max(1, Math.min(totalPages, page))

  const windowSize = 5
  const half = Math.floor(windowSize / 2)
  let start = Math.max(1, clampedPage - half)
  const end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)

  const pages = range(start, end)

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} aria-label="Pagination">
      <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={clampedPage === 1}>
        First
      </Button>
      <Button variant="outline" size="sm" onClick={() => onPageChange(clampedPage - 1)} disabled={clampedPage === 1}>
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {start > 1 ? <span className="px-2 text-sm text-[var(--ss-text-muted)]">…</span> : null}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'h-9 rounded-md px-3 text-sm transition-colors',
              p === clampedPage
                ? 'bg-[var(--ss-primary)] text-white'
                : 'border border-[var(--ss-border)] bg-[var(--ss-surface)] text-[var(--ss-text)] hover:bg-[var(--ss-surface-alt)]',
            )}
            aria-current={p === clampedPage}
          >
            {p}
          </button>
        ))}
        {end < totalPages ? <span className="px-2 text-sm text-[var(--ss-text-muted)]">…</span> : null}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(clampedPage + 1)}
        disabled={clampedPage === totalPages}
      >
        Next
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={clampedPage === totalPages}
      >
        Last
      </Button>
    </div>
  )
}
