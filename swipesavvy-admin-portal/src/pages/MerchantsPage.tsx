import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Api } from '@/services/api'
import type { Merchant } from '@/types/merchants'
import { formatDate } from '@/utils/dates'
import { useToastStore } from '@/store/toastStore'

export default function MerchantsPage() {
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const [selected, setSelected] = useState<Merchant | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const res = await Api.merchantsApi.listMerchants(
          1,
          100,
          status === 'all' ? undefined : status,
          query || undefined
        )
        if (mounted) setMerchants((res.merchants || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          category: m.category,
          status: m.status,
          createdAt: m.joinDate || m.created_at,
          joinDate: m.joinDate,
          location: m.location,
          country: m.country,
          transactionCount: m.transactionCount,
          successRate: m.successRate,
          monthlyVolume: m.monthlyVolume,
          avgTransaction: m.avgTransaction,
        })))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [query, status])

  const columns: TableColumn<Merchant>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Merchant',
        sortable: true,
        accessor: (m) => m.name,
        cell: (m) => (
          <div className="min-w-0">
            <p className="truncate font-semibold">{m.name}</p>
            <p className="truncate text-xs text-[var(--ss-text-muted)]">{m.category}</p>
          </div>
        ),
      },
      {
        key: 'transactions',
        header: 'Transactions',
        sortable: true,
        accessor: (m) => m.transactionCount || 0,
        cell: (m) => (
          <div>
            <p className="font-medium">{m.transactionCount || 0}</p>
            <p className="text-xs text-[var(--ss-text-muted)]">
              {m.successRate ? `${(m.successRate * 100).toFixed(0)}% success` : 'N/A'}
            </p>
          </div>
        ),
      },
      {
        key: 'volume',
        header: 'Monthly Volume',
        sortable: true,
        accessor: (m) => m.monthlyVolume || 0,
        cell: (m) => (
          <span className="font-medium">
            {((m.monthlyVolume || 0) / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </span>
        ),
      },
      {
        key: 'avgTransaction',
        header: 'Avg Transaction',
        sortable: true,
        accessor: (m) => m.avgTransaction || 0,
        cell: (m) => (
          <span className="text-[var(--ss-text-muted)]">
            {((m.avgTransaction || 0) / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        accessor: (m) => m.status,
        cell: (m) => {
          const variant = m.status === 'active' ? 'success' : m.status === 'pending' ? 'warning' : 'danger'
          return <Badge variant={variant}>{m.status}</Badge>
        },
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        accessor: (m) => m.createdAt,
        cell: (m) => <span className="text-[var(--ss-text-muted)]">{formatDate(m.createdAt)}</span>,
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        cell: (m) => (
          <Button variant="outline" size="sm" onClick={() => setSelected(m)}>
            Manage
          </Button>
        ),
      },
    ],
    [],
  )

  const close = () => setSelected(null)
  const [updating, setUpdating] = useState(false)

  const onDisable = async () => {
    if (!selected) return
    setUpdating(true)
    try {
      await Api.merchantsApi.updateMerchantStatus(selected.id, 'disabled')
      pushToast({ variant: 'warning', title: 'Merchant updated', message: `${selected.name} has been disabled.` })
      // Refresh merchants list
      const res = await Api.merchantsApi.listMerchants(
        1,
        100,
        status === 'all' ? undefined : (status as any),
        query || undefined
      )
      setMerchants(res.items)
      close()
    } catch (error) {
      console.error('Failed to disable merchant:', error)
      pushToast({ variant: 'error', title: 'Update failed', message: 'Failed to update merchant. Please try again.' })
    } finally {
      setUpdating(false)
    }
  }

  const onActivate = async () => {
    if (!selected) return
    setUpdating(true)
    try {
      await Api.merchantsApi.updateMerchantStatus(selected.id, 'active')
      pushToast({ variant: 'success', title: 'Merchant updated', message: `${selected.name} is now active.` })
      // Refresh merchants list
      const res = await Api.merchantsApi.listMerchants(
        1,
        100,
        status === 'all' ? undefined : (status as any),
        query || undefined
      )
      setMerchants(res.items)
      close()
    } catch (error) {
      console.error('Failed to activate merchant:', error)
      pushToast({ variant: 'error', title: 'Update failed', message: 'Failed to update merchant. Please try again.' })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Merchants</h1>
        <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Review onboarding progress and operational status.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-[420px]">
            <Input placeholder="Search merchants..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="w-full md:w-[220px]">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'disabled', label: 'Disabled' },
              ]}
            />
          </div>
        </div>

        <div className="mt-4">
          <Table data={merchants} columns={columns} loading={loading} pageSize={10} emptyMessage="No merchants found." />
        </div>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={close}
        title={selected ? selected.name : 'Merchant'}
        description={`Category: ${selected?.category ?? '-'} | Created: ${selected?.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '-'}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={close} disabled={updating}>
              Close
            </Button>
            {selected?.status !== 'disabled' && (
              <Button variant="danger" onClick={onDisable} disabled={updating}>
                {updating ? 'Updating...' : 'Disable'}
              </Button>
            )}
            {selected?.status !== 'active' && (
              <Button onClick={onActivate} disabled={updating}>
                {updating ? 'Updating...' : 'Activate'}
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4">
            <p className="font-semibold text-[var(--ss-text)]">Location</p>
            <p className="mt-1 text-[var(--ss-text-muted)]">{selected?.location ?? '-'}</p>
          </div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4">
            <p className="font-semibold text-[var(--ss-text)]">Status</p>
            <p className="mt-1 text-[var(--ss-text-muted)]">{selected?.status ?? '-'}</p>
          </div>
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4">
            <p className="font-semibold text-[var(--ss-text)]">Category</p>
            <p className="mt-1 text-[var(--ss-text-muted)]">{selected?.category ?? '-'}</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
