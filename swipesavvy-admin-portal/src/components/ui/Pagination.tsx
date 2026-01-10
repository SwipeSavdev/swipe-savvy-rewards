/**
 * SwipeSavvy Admin Portal - Bank-Grade Pagination Component
 * Version: 4.0
 *
 * Clear page info with accessible navigation
 */

import { cn } from '@/utils/cn'
import Button from './Button'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (_page: number) => void
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
    <nav
      className={cn('flex flex-wrap items-center gap-2', className)}
      aria-label="Pagination"
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={clampedPage === 1}
        aria-label="Go to first page"
      >
        First
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(clampedPage - 1)}
        disabled={clampedPage === 1}
        aria-label="Go to previous page"
      >
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {start > 1 && (
          <span className="px-2 text-sm text-text-tertiary" aria-hidden="true">
            …
          </span>
        )}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'h-8 min-w-[32px] rounded-md px-3 text-sm font-medium transition-all duration-fast',
              p === clampedPage
                ? 'bg-interactive-primary text-interactive-primary-text'
                : 'bg-bg-surface border border-border-default text-text-primary hover:bg-bg-subtle hover:border-border-strong'
            )}
            aria-current={p === clampedPage ? 'page' : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <span className="px-2 text-sm text-text-tertiary" aria-hidden="true">
            …
          </span>
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(clampedPage + 1)}
        disabled={clampedPage === totalPages}
        aria-label="Go to next page"
      >
        Next
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={clampedPage === totalPages}
        aria-label="Go to last page"
      >
        Last
      </Button>
    </nav>
  )
}
