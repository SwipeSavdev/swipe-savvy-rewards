import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Tabs from '@/components/ui/Tabs'
import ProgressBar from '@/components/ui/ProgressBar'
import Icon from '@/components/ui/Icon'
import { Api } from '@/services/api'
import type { Merchant } from '@/types/merchants'
import { formatDate } from '@/utils/dates'
import { useToastStore } from '@/store/toastStore'
import { useEventSubscription } from '@/store/eventBusStore'

interface MerchantOnboarding {
  id: string
  merchant_id: string
  ext_ref_id: string
  mpa_id?: string
  north_number?: string
  status: string
  fiserv_status?: string
  step: number
  completion_percentage: number
  legal_name?: string
  dba_name?: string
  submitted_at?: string
  approved_at?: string
}

interface MerchantStats {
  total_merchants: number
  active_merchants: number
  suspended_merchants: number
  total_monthly_volume: number
  avg_success_rate: number
  top_performer: string
}

export default function MerchantsPage() {
  const navigate = useNavigate()
  const pushToast = useToastStore((s) => s.push)

  // Tab state
  const [activeTab, setActiveTab] = useState('merchants')

  // Merchants list state
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [stats, setStats] = useState<MerchantStats | null>(null)

  // Selected merchant & modals
  const [selected, setSelected] = useState<Merchant | null>(null)
  const [selectedOnboarding, setSelectedOnboarding] = useState<MerchantOnboarding | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [updating, setUpdating] = useState(false)

  // Create/Edit form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    location: '',
    business_type: '',
    startOnboarding: false,
  })

  // Fetch merchants
  const fetchMerchants = async () => {
    setLoading(true)
    try {
      const res = await Api.merchantsApi.listMerchants(
        1,
        100,
        status === 'all' ? undefined : status,
        query || undefined
      )
      setMerchants(
        (res.merchants || []).map((m: any) => ({
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
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await Api.merchantsApi.getStats()
      setStats(res)
    } catch (e) {
      console.warn('Could not fetch merchant stats')
    }
  }

  useEffect(() => {
    fetchMerchants()
    fetchStats()
  }, [query, status])

  // Subscribe to merchant events to auto-refresh
  useEventSubscription(
    ['merchant:created', 'merchant:updated', 'merchant:deleted', 'merchant:status_changed', 'merchant:onboarding_completed'],
    () => {
      fetchMerchants()
      fetchStats()
    }
  )

  // Fetch onboarding when merchant selected
  useEffect(() => {
    if (selected) {
      Api.merchantsApi.getOnboarding(selected.id).then((res) => {
        if (res.has_onboarding && res.onboarding) {
          setSelectedOnboarding(res.onboarding)
        } else {
          setSelectedOnboarding(null)
        }
      }).catch(() => setSelectedOnboarding(null))
    } else {
      setSelectedOnboarding(null)
    }
  }, [selected])

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
            <p className="truncate text-xs text-[var(--ss-text-muted)]">{m.category || m.email}</p>
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
            <p className="font-medium">{(m.transactionCount || 0).toLocaleString()}</p>
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
            {(m.monthlyVolume || 0).toLocaleString('en-US', {
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
          const variant =
            m.status === 'active' ? 'success' : m.status === 'pending' ? 'warning' : 'danger'
          return <Badge variant={variant}>{m.status}</Badge>
        },
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        accessor: (m) => m.createdAt,
        cell: (m) => (
          <span className="text-[var(--ss-text-muted)]">{formatDate(m.createdAt)}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        cell: (m) => (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setSelected(m)}>
              Manage
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelected(m)
                setFormData({
                  name: m.name,
                  email: m.email || '',
                  phone: m.phone || '',
                  website: '',
                  country: m.country || '',
                  location: m.location || '',
                  business_type: m.category || '',
                  startOnboarding: false,
                })
                setShowEditModal(true)
              }}
            >
              Edit
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const closeAll = () => {
    setSelected(null)
    setShowCreateModal(false)
    setShowEditModal(false)
    setShowDeleteConfirm(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      website: '',
      country: '',
      location: '',
      business_type: '',
      startOnboarding: false,
    })
  }

  // CRUD handlers
  const onCreate = async () => {
    if (!formData.name || !formData.email) {
      pushToast({ variant: 'error', title: 'Validation', message: 'Name and email are required.' })
      return
    }
    setUpdating(true)
    try {
      const res = await Api.merchantsApi.createMerchant({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        country: formData.country || undefined,
        location: formData.location || undefined,
        business_type: formData.business_type || undefined,
      })

      // Get the merchant ID from response
      const merchantId = res.merchant?.id || res.id

      pushToast({
        variant: 'success',
        title: 'Merchant Created',
        message: `${formData.name} has been created.`,
      })

      // If onboarding toggle is on, start onboarding and redirect
      if (formData.startOnboarding && merchantId) {
        try {
          await Api.merchantsApi.startOnboarding(merchantId)
          navigate(`/merchants/${merchantId}/onboarding`)
          return // Exit early - don't call closeAll which resets state
        } catch (onboardingError: any) {
          pushToast({
            variant: 'warning',
            title: 'Merchant Created',
            message: 'Merchant created but failed to start onboarding. You can start it from the Manage menu.',
          })
        }
      }

      fetchMerchants()
      closeAll()
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Create Failed',
        message: error?.message || 'Failed to create merchant.',
      })
    } finally {
      setUpdating(false)
    }
  }

  const onUpdate = async () => {
    if (!selected) return
    setUpdating(true)
    try {
      await Api.merchantsApi.updateMerchant(selected.id, {
        name: formData.name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        country: formData.country || undefined,
        location: formData.location || undefined,
        business_type: formData.business_type || undefined,
      })
      pushToast({
        variant: 'success',
        title: 'Merchant Updated',
        message: `${formData.name} has been updated.`,
      })
      fetchMerchants()
      closeAll()
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Update Failed',
        message: error?.message || 'Failed to update merchant.',
      })
    } finally {
      setUpdating(false)
    }
  }

  const onDelete = async () => {
    if (!selected) return
    setUpdating(true)
    try {
      await Api.merchantsApi.deleteMerchant(selected.id)
      pushToast({
        variant: 'warning',
        title: 'Merchant Deleted',
        message: `${selected.name} has been deleted.`,
      })
      fetchMerchants()
      closeAll()
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Delete Failed',
        message: error?.message || 'Failed to delete merchant.',
      })
    } finally {
      setUpdating(false)
    }
  }

  const onDisable = async () => {
    if (!selected) return
    setUpdating(true)
    try {
      await Api.merchantsApi.updateMerchantStatus(selected.id, 'disabled')
      pushToast({
        variant: 'warning',
        title: 'Merchant Disabled',
        message: `${selected.name} has been disabled.`,
      })
      fetchMerchants()
      closeAll()
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Update Failed',
        message: error?.message || 'Failed to suspend merchant.',
      })
    } finally {
      setUpdating(false)
    }
  }

  const onActivate = async () => {
    if (!selected) return
    setUpdating(true)
    try {
      await Api.merchantsApi.updateMerchantStatus(selected.id, 'active')
      pushToast({
        variant: 'success',
        title: 'Merchant Activated',
        message: `${selected.name} is now active.`,
      })
      fetchMerchants()
      closeAll()
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Update Failed',
        message: error?.message || 'Failed to activate merchant.',
      })
    } finally {
      setUpdating(false)
    }
  }

  const onStartOnboarding = async () => {
    if (!selected) return
    setUpdating(true)
    try {
      await Api.merchantsApi.startOnboarding(selected.id)
      navigate(`/merchants/${selected.id}/onboarding`)
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Onboarding Failed',
        message: error?.message || 'Failed to start onboarding.',
      })
    } finally {
      setUpdating(false)
    }
  }

  // Onboarding status badge
  const getOnboardingBadge = (onboarding: MerchantOnboarding | null) => {
    if (!onboarding) return null

    const statusMap: Record<string, { variant: 'info' | 'warning' | 'success' | 'danger'; label: string }> = {
      draft: { variant: 'info', label: 'Draft' },
      submitted: { variant: 'warning', label: 'Submitted' },
      pending_credit: { variant: 'warning', label: 'Pending Credit' },
      pending_bos: { variant: 'warning', label: 'Pending BOS' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
    }

    const config = statusMap[onboarding.status] || { variant: 'info' as const, label: onboarding.status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Stats cards for reporting tab
  const renderReportingTab = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-[var(--ss-text-muted)]">Total Merchants</p>
          <p className="text-2xl font-bold text-[var(--ss-text)]">{stats?.total_merchants || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-[var(--ss-text-muted)]">Active Merchants</p>
          <p className="text-2xl font-bold text-[var(--ss-success)]">{stats?.active_merchants || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-[var(--ss-text-muted)]">Suspended</p>
          <p className="text-2xl font-bold text-[var(--ss-danger)]">{stats?.suspended_merchants || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-[var(--ss-text-muted)]">Total Volume (Monthly)</p>
          <p className="text-2xl font-bold text-[var(--ss-text)]">
            {(stats?.total_monthly_volume || 0).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </p>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h3 className="font-semibold text-[var(--ss-text)] mb-4">Performance Overview</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--ss-text-muted)]">Average Success Rate</span>
              <span className="font-medium text-[var(--ss-text)]">
                {(stats?.avg_success_rate || 0).toFixed(1)}%
              </span>
            </div>
            <ProgressBar value={stats?.avg_success_rate || 0} max={100} />
          </div>
          <div className="pt-4 border-t border-[var(--ss-border)]">
            <p className="text-sm text-[var(--ss-text-muted)]">Top Performer</p>
            <p className="font-semibold text-[var(--ss-text)]">{stats?.top_performer || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Transaction Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-[var(--ss-text)] mb-4">Transaction Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ss-border)]">
                <th className="text-left py-2 text-[var(--ss-text-muted)]">Merchant</th>
                <th className="text-right py-2 text-[var(--ss-text-muted)]">Transactions</th>
                <th className="text-right py-2 text-[var(--ss-text-muted)]">Volume</th>
                <th className="text-right py-2 text-[var(--ss-text-muted)]">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {merchants.slice(0, 10).map((m) => (
                <tr key={m.id} className="border-b border-[var(--ss-border)]">
                  <td className="py-2 text-[var(--ss-text)]">{m.name}</td>
                  <td className="py-2 text-right text-[var(--ss-text)]">
                    {(m.transactionCount || 0).toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-[var(--ss-text)]">
                    {(m.monthlyVolume || 0).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </td>
                  <td className="py-2 text-right">
                    <Badge variant={m.successRate && m.successRate > 0.9 ? 'success' : 'warning'}>
                      {((m.successRate || 0) * 100).toFixed(0)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Merchants</h1>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">
            Manage merchants, onboarding, and view reporting.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icon name="plus" className="w-4 h-4 mr-2" />
          Add Merchant
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        items={[
          { key: 'merchants', label: 'Merchants', content: null },
          { key: 'reporting', label: 'Reporting', content: null },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'merchants' && (
        <Card className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-[420px]">
              <Input
                placeholder="Search merchants..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
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
            <Table
              data={merchants}
              columns={columns}
              loading={loading}
              pageSize={10}
              emptyMessage="No merchants found."
            />
          </div>
        </Card>
      )}

      {activeTab === 'reporting' && renderReportingTab()}

      {/* Create Merchant Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => !updating && closeAll()}
        title="Add New Merchant"
        description="Create a new merchant account"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeAll} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={updating}>
              {updating ? 'Creating...' : 'Create Merchant'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Business Name *"
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
            placeholder="Acme Corp"
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
            placeholder="contact@acme.com"
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1 555-123-4567"
          />
          <Input
            label="Website"
            value={formData.website}
            onChange={(e) => setFormData((f) => ({ ...f, website: e.target.value }))}
            placeholder="https://acme.com"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData((f) => ({ ...f, country: e.target.value }))}
              placeholder="United States"
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
              placeholder="New York, NY"
            />
          </div>
          <Input
            label="Business Type"
            value={formData.business_type}
            onChange={(e) => setFormData((f) => ({ ...f, business_type: e.target.value }))}
            placeholder="Retail, E-commerce, etc."
          />

          {/* Onboarding Toggle */}
          <div className="border-t border-[var(--ss-border)] pt-4 mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.startOnboarding}
                onChange={(e) => setFormData((f) => ({ ...f, startOnboarding: e.target.checked }))}
                className="w-5 h-5 rounded border-[var(--ss-border)] text-[var(--ss-primary)] focus:ring-[var(--ss-primary)]"
              />
              <div>
                <p className="font-medium text-[var(--ss-text)]">Start Processing Onboarding</p>
                <p className="text-sm text-[var(--ss-text-muted)]">
                  Begin Fiserv payment processing setup after creation
                </p>
              </div>
            </label>
          </div>
        </div>
      </Modal>

      {/* Edit Merchant Modal */}
      <Modal
        open={showEditModal}
        onClose={() => !updating && closeAll()}
        title="Edit Merchant"
        description={selected?.name || ''}
        footer={
          <div className="flex justify-between">
            <Button
              variant="danger"
              onClick={() => {
                setShowEditModal(false)
                setShowDeleteConfirm(true)
              }}
              disabled={updating}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeAll} disabled={updating}>
                Cancel
              </Button>
              <Button onClick={onUpdate} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Business Name"
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
          />
          <Input
            label="Website"
            value={formData.website}
            onChange={(e) => setFormData((f) => ({ ...f, website: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData((f) => ({ ...f, country: e.target.value }))}
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <Input
            label="Business Type"
            value={formData.business_type}
            onChange={(e) => setFormData((f) => ({ ...f, business_type: e.target.value }))}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => !updating && setShowDeleteConfirm(false)}
        title="Delete Merchant"
        description={`Are you sure you want to delete ${selected?.name}? This action cannot be undone.`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={updating}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDelete} disabled={updating}>
              {updating ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--ss-text-muted)]">
          All associated data including transactions and onboarding information will be permanently removed.
        </p>
      </Modal>

      {/* Manage Merchant Modal */}
      <Modal
        open={Boolean(selected) && !showEditModal && !showDeleteConfirm}
        onClose={closeAll}
        title={selected?.name || 'Merchant'}
        description={`${selected?.category || selected?.email || ''} | Created: ${
          selected?.createdAt ? formatDate(selected.createdAt) : '-'
        }`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeAll} disabled={updating}>
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
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--ss-text)]">Status</p>
                <p className="mt-1 text-[var(--ss-text-muted)]">{selected?.status || '-'}</p>
              </div>
              <Badge
                variant={
                  selected?.status === 'active'
                    ? 'success'
                    : selected?.status === 'pending'
                    ? 'warning'
                    : 'danger'
                }
              >
                {selected?.status}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4">
            <p className="font-semibold text-[var(--ss-text)]">Location</p>
            <p className="mt-1 text-[var(--ss-text-muted)]">
              {selected?.location || '-'}{selected?.country ? `, ${selected.country}` : ''}
            </p>
          </div>

          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4">
            <p className="font-semibold text-[var(--ss-text)]">Performance</p>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--ss-text-muted)]">Transactions</p>
                <p className="font-medium text-[var(--ss-text)]">
                  {(selected?.transactionCount || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--ss-text-muted)]">Monthly Volume</p>
                <p className="font-medium text-[var(--ss-text)]">
                  {(selected?.monthlyVolume || 0).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Onboarding Section */}
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-[var(--ss-text)]">Payment Processing</p>
              {getOnboardingBadge(selectedOnboarding)}
            </div>

            {selectedOnboarding ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--ss-text-muted)] mb-1">Onboarding Progress</p>
                  <ProgressBar
                    value={selectedOnboarding.completion_percentage}
                    max={100}
                  />
                  <p className="text-xs text-[var(--ss-text-muted)] mt-1">
                    Step {selectedOnboarding.step} of 6 - {selectedOnboarding.completion_percentage}%
                  </p>
                </div>
                {selectedOnboarding.ext_ref_id && (
                  <p className="text-xs text-[var(--ss-text-muted)]">
                    Ref: {selectedOnboarding.ext_ref_id}
                  </p>
                )}
                {selectedOnboarding.mpa_id && (
                  <p className="text-xs text-[var(--ss-text-muted)]">
                    MPA: {selectedOnboarding.mpa_id}
                  </p>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/merchants/${selected?.id}/onboarding`)}
                >
                  {selectedOnboarding.status === 'draft' ? 'Continue Onboarding' : 'View Details'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-[var(--ss-text-muted)] mb-3">
                  Payment processing not yet configured
                </p>
                <Button variant="secondary" size="sm" onClick={onStartOnboarding} disabled={updating}>
                  Start Processing Onboarding
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
