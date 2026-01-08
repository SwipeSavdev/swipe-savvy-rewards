/**
 * ============================================================================
 * SWIPESAVVY ADMIN PORTAL - TABLE COMPONENT V5
 * COMPLETE RESET - Built from scratch
 * ============================================================================
 *
 * Design Philosophy: PRECISION OVER DELIGHT
 * - High information density without clutter
 * - Clear column headers with sort indicators
 * - Alternating row backgrounds for scanability
 * - Row hover state for tracking
 * - Fixed header on scroll option
 * - Loading skeleton states
 * - Empty state with action
 *
 * Accessibility:
 * - Proper table semantics
 * - aria-sort for sortable columns
 * - Keyboard navigable sorting
 * - Screen reader friendly pagination
 */

import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import Pagination from './Pagination'

// =============================================================================
// TYPES
// =============================================================================

export type ColumnAlign = 'left' | 'center' | 'right'

export interface TableColumn<T> {
  /** Unique key for the column */
  readonly key: string
  /** Column header content */
  readonly header: ReactNode
  /** Function to extract cell value from row data */
  readonly accessor?: (row: T) => ReactNode
  /** Custom cell renderer (overrides accessor) */
  readonly cell?: (row: T) => ReactNode
  /** Enable sorting for this column */
  readonly sortable?: boolean
  /** Text alignment */
  readonly align?: ColumnAlign
  /** Additional CSS classes */
  readonly className?: string
  /** Fixed column width */
  readonly width?: string
  /** Minimum column width */
  readonly minWidth?: string
}

export interface TableProps<T> {
  /** Array of data items */
  readonly data: T[]
  /** Column definitions */
  readonly columns: TableColumn<T>[]
  /** Items per page (enables pagination) */
  readonly pageSize?: number
  /** Show loading skeleton */
  readonly loading?: boolean
  /** Message when data is empty */
  readonly emptyMessage?: string
  /** Icon for empty state */
  readonly emptyIcon?: ReactNode
  /** Action button for empty state */
  readonly emptyAction?: ReactNode
  /** Additional CSS classes */
  readonly className?: string
  /** Sticky header on scroll */
  readonly stickyHeader?: boolean
  /** Compact row height */
  readonly compact?: boolean
  /** Row click handler */
  readonly onRowClick?: (row: T, index: number) => void
  /** Striped rows (alternating background) */
  readonly striped?: boolean
  /** Get unique key for row */
  readonly getRowKey?: (row: T, index: number) => string | number
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function sortValue(v: unknown): string | number {
  if (v == null) return ''
  if (typeof v === 'number') return v
  if (typeof v === 'string') return v.toLowerCase()
  return String(v).toLowerCase()
}

// =============================================================================
// SKELETON ROW COMPONENT
// =============================================================================

function SkeletonRow({ columns, compact }: Readonly<{ columns: number; compact?: boolean }>) {
  return (
    <tr className="border-b border-[var(--color-border-primary)] last:border-b-0">
      {Array.from({ length: columns }).map((_, j) => (
        <td key={`skeleton-cell-${j}`} className={cn('px-4', compact ? 'py-2' : 'py-3')}>
          <div className="skeleton h-4 w-full rounded-[var(--radius-xs)]" />
        </td>
      ))}
    </tr>
  )
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyState({
  columns,
  message,
  icon,
  action,
}: Readonly<{
  columns: number
  message: string
  icon?: ReactNode
  action?: ReactNode
}>) {
  return (
    <tr>
      <td colSpan={columns} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-[var(--spacing-3)]">
          {icon && (
            <span className="text-[var(--color-text-tertiary)]" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]">
            {message}
          </span>
          {action && <div className="mt-[var(--spacing-2)]">{action}</div>}
        </div>
      </td>
    </tr>
  )
}

// =============================================================================
// SORT ICON COMPONENT
// =============================================================================

function SortIcon({ active, direction }: Readonly<{ active: boolean; direction?: 'asc' | 'desc' }>) {
  return (
    <svg
      className={cn(
        'w-4 h-4 transition-transform',
        active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]',
        active && direction === 'asc' && 'rotate-180'
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// =============================================================================
// TABLE COMPONENT
// =============================================================================

export default function Table<T>({
  data,
  columns,
  pageSize = 10,
  loading = false,
  emptyMessage = 'No results found.',
  emptyIcon,
  emptyAction,
  className,
  stickyHeader = false,
  compact = false,
  onRowClick,
  striped = true,
  getRowKey,
}: TableProps<T>) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)

  // Sort data
  const sorted = useMemo(() => {
    if (!sort) return data
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return data

    const get = col.accessor ?? ((row: T) => (row as Record<string, unknown>)?.[col.key])

    return [...data].sort((a, b) => {
      const av = sortValue(get(a))
      const bv = sortValue(get(b))
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, columns, sort])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const clampedPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (clampedPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, clampedPage, pageSize])

  // Handle sort click
  const handleSort = (key: string) => {
    setPage(1)
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  // Row styling
  const rowHeight = compact ? 'h-[var(--component-table-row-height-compact)]' : 'h-[var(--component-table-row-height)]'
  const cellPadding = compact ? 'px-4 py-2' : 'px-4 py-3'

  return (
    <div className={cn('w-full', className)}>
      {/* Table container */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[var(--font-size-sm)]">
            {/* Header */}
            <thead
              className={cn(
                'bg-[var(--color-bg-secondary)]',
                stickyHeader && 'sticky top-0 z-[var(--z-sticky)]'
              )}
            >
              <tr>
                {columns.map((col) => {
                  const isSorted = sort?.key === col.key
                  return (
                    <th
                      key={col.key}
                      className={cn(
                        'h-[var(--component-table-header-height)]',
                        'px-4',
                        'text-left text-[var(--font-size-xs)] font-semibold',
                        'uppercase tracking-[var(--letter-spacing-wider)]',
                        'text-[var(--color-text-secondary)]',
                        'border-b border-[var(--color-border-primary)]',
                        'whitespace-nowrap',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        col.sortable && [
                          'cursor-pointer select-none',
                          'hover:text-[var(--color-text-primary)]',
                          'hover:bg-[var(--color-bg-tertiary)]',
                          'transition-colors duration-[var(--duration-fast)]',
                        ],
                        col.className
                      )}
                      style={{
                        width: col.width,
                        minWidth: col.minWidth,
                      }}
                      onClick={() => col.sortable && handleSort(col.key)}
                      onKeyDown={(e) => {
                        if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          handleSort(col.key)
                        }
                      }}
                      scope="col"
                      tabIndex={col.sortable ? 0 : undefined}
                      role={col.sortable ? 'button' : undefined}
                      aria-sort={
                        isSorted
                          ? sort?.dir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          col.align === 'right' && 'justify-end w-full',
                          col.align === 'center' && 'justify-center w-full'
                        )}
                      >
                        {col.header}
                        {col.sortable && (
                          <SortIcon active={isSorted} direction={sort?.dir} />
                        )}
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: Math.min(6, pageSize) }).map((_, i) => (
                  <SkeletonRow key={`skeleton-row-${i}`} columns={columns.length} compact={compact} />
                ))
              ) : pageItems.length === 0 ? (
                // Empty state
                <EmptyState
                  columns={columns.length}
                  message={emptyMessage}
                  icon={emptyIcon}
                  action={emptyAction}
                />
              ) : (
                // Data rows
                pageItems.map((row, idx) => {
                  const rowKey = getRowKey ? getRowKey(row, idx) : idx
                  const isClickable = Boolean(onRowClick)

                  return (
                    <tr
                      key={rowKey}
                      className={cn(
                        rowHeight,
                        'border-b border-[var(--color-border-primary)] last:border-b-0',
                        'transition-colors duration-[var(--duration-fast)]',
                        'hover:bg-[var(--color-bg-secondary)]',
                        striped && idx % 2 === 1 && 'bg-[var(--color-bg-page)]',
                        isClickable && [
                          'cursor-pointer',
                          'focus-visible:outline-none',
                          'focus-visible:ring-2',
                          'focus-visible:ring-inset',
                          'focus-visible:ring-[var(--color-border-focus)]',
                        ]
                      )}
                      onClick={() => onRowClick?.(row, idx)}
                      onKeyDown={(e) => {
                        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          onRowClick?.(row, idx)
                        }
                      }}
                      tabIndex={isClickable ? 0 : undefined}
                      role={isClickable ? 'button' : undefined}
                    >
                      {columns.map((col) => {
                        // Determine cell content with clear priority
                        let content: ReactNode
                        if (col.cell) {
                          content = col.cell(row)
                        } else if (col.accessor) {
                          content = col.accessor(row)
                        } else {
                          content = (row as Record<string, unknown>)[col.key] as ReactNode
                        }

                        return (
                          <td
                            key={col.key}
                            className={cn(
                              cellPadding,
                              'text-[var(--color-text-primary)]',
                              col.align === 'center' && 'text-center',
                              col.align === 'right' && 'text-right'
                            )}
                          >
                            {content}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && sorted.length > pageSize && (
        <div className="mt-[var(--spacing-4)] flex items-center justify-between">
          <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
            Showing{' '}
            <span className="font-medium text-[var(--color-text-primary)]">
              {(clampedPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-[var(--color-text-primary)]">
              {Math.min(clampedPage * pageSize, sorted.length)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-[var(--color-text-primary)]">
              {sorted.length}
            </span>{' '}
            results
          </p>
          <Pagination
            page={clampedPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
