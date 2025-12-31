import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import Icon from './Icon'
import Pagination from './Pagination'
import Skeleton from './Skeleton'

export type ColumnAlign = 'left' | 'center' | 'right'

export interface TableColumn<T> {
  key: string
  header: ReactNode
  accessor?: (row: T) => any
  cell?: (row: T) => ReactNode
  sortable?: boolean
  align?: ColumnAlign
  className?: string
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
  className?: string
}

function sortValue(v: any) {
  if (v == null) return ''
  if (typeof v === 'number') return v
  if (typeof v === 'string') return v.toLowerCase()
  return String(v).toLowerCase()
}

export default function Table<T>({
  data,
  columns,
  pageSize = 10,
  loading,
  emptyMessage = 'No results found.',
  className,
}: TableProps<T>) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)

  const sorted = useMemo(() => {
    if (!sort) return data
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return data

    const get = col.accessor
      ? col.accessor
      : (row: any) => {
          // Try row[key] access for convenience
          return row?.[col.key]
        }

    const next = [...data].sort((a, b) => {
      const av = sortValue(get(a))
      const bv = sortValue(get(b))
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })

    return next
  }, [data, columns, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const clampedPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (clampedPage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, clampedPage, pageSize])

  const setSortKey = (key: string) => {
    setPage(1)
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-hidden rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface)] shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[var(--ss-surface-alt)]">
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key
                return (
                  <th
                    key={col.key}
                    className={cn(
                      'border-b border-[var(--ss-border)] px-4 py-3 text-left font-semibold text-[var(--ss-text)]',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.sortable && 'cursor-pointer select-none hover:text-[var(--ss-primary)]',
                      col.className,
                    )}
                    onClick={() => (col.sortable ? setSortKey(col.key) : undefined)}
                    scope="col"
                  >
                    <span className={cn('inline-flex items-center gap-2', col.align === 'right' && 'justify-end w-full')}>
                      {col.header}
                      {col.sortable ? (
                        <span className="text-[var(--ss-text-muted)]">
                          <Icon
                            name="chevron_down"
                            className={cn('h-4 w-4 transition-transform', isSorted && sort?.dir === 'asc' && 'rotate-180')}
                            title="Sort"
                          />
                        </span>
                      ) : null}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: Math.min(6, pageSize) }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--ss-border)] last:border-b-0">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[var(--ss-text-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageItems.map((row, idx) => (
                <tr key={idx} className="border-b border-[var(--ss-border)] last:border-b-0 hover:bg-[var(--ss-surface-alt)]">
                  {columns.map((col) => {
                    const content = col.cell ? col.cell(row) : col.accessor ? col.accessor(row) : (row as any)[col.key]
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-[var(--ss-text)]',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right',
                        )}
                      >
                        {content as ReactNode}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[var(--ss-text-muted)]">
            Page {clampedPage} of {totalPages}
          </p>
          <Pagination page={clampedPage} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      ) : null}
    </div>
  )
}
