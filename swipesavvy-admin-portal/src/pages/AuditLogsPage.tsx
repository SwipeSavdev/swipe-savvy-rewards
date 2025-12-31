import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import { Api } from '@/services/api'
import type { AuditLogEntry } from '@/types/audit'
import { formatDateTime } from '@/utils/dates'

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await Api.auditLogsApi.listLogs(1, 200, undefined, query || undefined)
        if (mounted) {
          setLogs((res.logs || []).map((l: any) => {
            // Ensure action is a string
            const action = typeof l.action === 'string' ? l.action : JSON.stringify(l.action)
            return {
              id: l.id,
              action: action,
              actor: {
                id: l.userId || '',
                name: typeof l.userName === 'string' ? l.userName : 'Unknown User',
                email: typeof l.userEmail === 'string' ? l.userEmail : 'unknown@example.com',
              },
              target: l.resource ? {
                type: 'unknown' as any,
                id: l.resource,
                label: typeof l.resource === 'string' ? l.resource : JSON.stringify(l.resource),
              } : undefined,
              createdAt: l.timestamp || new Date().toISOString(),
            }
          }))
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [query])

  const columns: TableColumn<AuditLogEntry>[] = useMemo(
    () => [
      {
        key: 'action',
        header: 'Action',
        sortable: true,
        accessor: (l) => l.action,
        cell: (l) => <Badge variant="primary">{l.action}</Badge>,
      },
      {
        key: 'actor',
        header: 'Actor',
        sortable: true,
        accessor: (l) => l.actor.name,
        cell: (l) => (
          <div className="min-w-0">
            <p className="truncate font-semibold">{l.actor.name}</p>
            <p className="truncate text-xs text-[var(--ss-text-muted)]">{l.actor.email}</p>
          </div>
        ),
      },
      {
        key: 'target',
        header: 'Target',
        accessor: (l) => l.target?.id ?? '',
        cell: (l) => (
          <span className="text-sm text-[var(--ss-text-muted)]">
            {l.target ? `${l.target.label || l.target.id}` : '—'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Timestamp',
        sortable: true,
        accessor: (l) => l.createdAt,
        cell: (l) => <span className="text-sm text-[var(--ss-text-muted)]">{formatDateTime(l.createdAt)}</span>,
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Audit Logs</h1>
        <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Track sensitive actions for compliance and incident response.</p>
      </div>

      <Card className="p-4">
        <div className="w-full md:w-[420px]">
          <Input placeholder="Search logs..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="mt-4">
          <Table data={logs} columns={columns} loading={loading} pageSize={12} emptyMessage="No audit logs found." />
        </div>
      </Card>
    </div>
  )
}
