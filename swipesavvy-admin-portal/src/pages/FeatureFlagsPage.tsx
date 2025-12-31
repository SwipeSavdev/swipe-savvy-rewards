import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import Modal from '@/components/ui/Modal'
import Slider from '@/components/ui/Slider'
import { Api } from '@/services/api'
import type { FeatureFlag } from '@/types/featureFlags'
import { useToastStore } from '@/store/toastStore'
import { formatDateTime } from '@/utils/dates'

const FEATURE_CATEGORIES = [
  { id: 'all', label: 'All Features' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'accounts', label: 'Account Management' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'ai_concierge', label: 'AI Concierge' },
  { id: 'support', label: 'Support' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'profile', label: 'Profile' },
  { id: 'design', label: 'Design & Theming' },
]

export default function FeatureFlagsPage() {
  console.log('[FeatureFlagsPage] RENDERING Component')
  
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [pending, setPending] = useState<FeatureFlag | null>(null)
  const [toggling, setToggling] = useState(false)
  const [rolloutValue, setRolloutValue] = useState(0)

  // Log component mount
  useEffect(() => {
    console.log('[FeatureFlagsPage] Component mounted')
    return () => console.log('[FeatureFlagsPage] Component unmounted')
  }, [])

  const fetchFlags = async (shouldShowLoading = true) => {
    if (shouldShowLoading) setLoading(true)
    try {
      const res = await Api.featureFlagsApi.listFlags(1, 200, query || undefined)
      
      // Null check with early return to prevent null reference
      if (!res) {
        console.error('[FeatureFlagsPage] Null response received from API')
        setFlags([])
        return
      }

      // Handle both { flags: [...] } and direct array responses
      const flagsArray = Array.isArray(res) ? res : (res.flags || [])
      
      // Type guard: ensure flags is array
      if (!Array.isArray(flagsArray)) {
        console.warn('[FeatureFlagsPage] Invalid flags array received:', flagsArray)
        setFlags([])
        return
      }

      setFlags(flagsArray.map((f: any) => ({
        id: f.id,
        key: f.name,
        name: f.displayName || f.name,
        displayName: f.displayName || f.name,
        description: f.description,
        enabled: f.enabled,
        status: f.enabled ? 'on' : 'off',
        rolloutPercentage: f.rolloutPercentage || 0,
        rolloutPct: f.rolloutPercentage || 0,
        targetedUsers: f.targetedUsers || [],
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        createdBy: f.createdBy,
        updatedBy: f.updatedBy || f.createdBy,
        environment: f.environment,
      })))
    } catch (err: any) {
      console.error('[FeatureFlagsPage] Error fetching flags:', err)
      pushToast({
        variant: 'error',
        title: 'Failed to load feature flags',
        message: err?.message || 'An error occurred while loading feature flags.',
      })
      setFlags([])
    } finally {
      if (shouldShowLoading) setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (mounted) await fetchFlags(true)
    })()
    return () => {
      mounted = false
    }
  }, [query])

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory
      const matchesQuery = !query || flag.name.toLowerCase().includes(query.toLowerCase()) ||
        (flag.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
      return matchesCategory && matchesQuery
    })
  }, [flags, selectedCategory, query])

  const handleRowClick = (flag: FeatureFlag) => {
    setPending(flag)
    setRolloutValue(flag.rolloutPercentage || 0)
  }

  const onConfirm = async () => {
    if (!pending) return
    setToggling(true)
    try {
      await Api.featureFlagsApi.toggleFlag(pending.id, pending.status === 'off')
      setFlags(flags.map(f => 
        f.id === pending.id ? { ...f, status: f.status === 'on' ? 'off' : 'on', enabled: f.status === 'off' } : f
      ))
      pushToast({
        variant: 'success',
        title: 'Feature flag updated',
        message: `${pending.name} has been ${pending.status === 'off' ? 'enabled' : 'disabled'}.`,
      })
      setPending(null)
    } catch (err: any) {
      pushToast({
        variant: 'error',
        title: 'Failed to update feature flag',
        message: err?.message || 'An error occurred.',
      })
    } finally {
      setToggling(false)
    }
  }

  const columns: TableColumn<FeatureFlag>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Feature',
        sortable: true,
        accessor: (f) => f.name,
        cell: (f) => (
          <div className="min-w-0">
            <p className="truncate font-semibold">{f.name}</p>
            <p className="truncate text-xs text-[var(--ss-text-muted)]">{f.description}</p>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        sortable: true,
        accessor: (f) => f.category || 'design',
        cell: (f) => <Badge variant="neutral">{(f.category || 'design').replace('_', ' ')}</Badge>,
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        accessor: (f) => f.status,
        cell: (f) => <Badge variant={f.status === 'on' ? 'success' : 'neutral'}>{f.status}</Badge>,
      },
      {
        key: 'rolloutPct',
        header: 'Rollout',
        sortable: true,
        accessor: (f) => f.rolloutPct,
        cell: (f) => (
          <div className="w-[160px]">
            <div className="flex items-center justify-between text-xs text-[var(--ss-text-muted)]">
              <span>{f.rolloutPct ?? 0}%</span>
            </div>
            <ProgressBar value={f.rolloutPct ?? 0} />
          </div>
        ),
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        sortable: true,
        accessor: (f) => f.updatedAt,
        cell: (f) => (
          <span className="text-sm text-[var(--ss-text-muted)]">
            {f.updatedAt ? formatDateTime(f.updatedAt) : 'N/A'}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--ss-text-primary)]">Feature Flags</h1>
        <p className="mt-2 text-[var(--ss-text-muted)]">
          Manage and control SwipeSavvy mobile app features by category
        </p>
      </div>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {FEATURE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[var(--ss-primary)] text-white'
                  : 'bg-[var(--ss-surface-alt)] text-[var(--ss-text-secondary)] hover:bg-[var(--ss-surface)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search features..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => fetchFlags(true)}>Reload</Button>
      </div>

      {/* Flags Table */}
      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-[var(--ss-text-muted)]">Loading feature flags...</p>
        </Card>
      ) : (
        filteredFlags.length > 0 && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[var(--ss-border)] bg-[var(--ss-surface-alt)]">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-xs font-semibold text-[var(--ss-text-secondary)] uppercase tracking-wide"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ss-border)]">
                  {filteredFlags.map((flag, idx) => (
                    <tr
                      key={flag.id || idx}
                      onClick={() => handleRowClick(flag)}
                      className="cursor-pointer hover:bg-[var(--ss-surface-alt)] transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-sm">
                          {col.cell ? col.cell(flag) : col.accessor ? col.accessor(flag) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {!loading && filteredFlags.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-[var(--ss-text-muted)]">No features found in this category</p>
        </Card>
      )}

      {/* Toggle Modal */}
      <Modal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title={pending ? `${pending.status === 'on' ? 'Disable' : 'Enable'} feature flag` : 'Feature flag'}
        description={pending?.name}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPending(null)} disabled={toggling}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={toggling}>
              {toggling ? 'Updating...' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4 text-sm text-[var(--ss-text-muted)]">
            {pending
              ? pending.status === 'on'
                ? `Disable "${pending.name}"? This feature will be turned off for all users.`
                : `Enable "${pending.name}"? This feature will be turned on for all users.`
              : ''}
          </div>

          {pending?.status !== 'on' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--ss-text)]">
                Rollout percentage
                <span className="ml-2 text-[var(--ss-text-muted)]">{rolloutValue}%</span>
              </label>
              <div className="px-2">
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={rolloutValue}
                  onChange={setRolloutValue}
                />
              </div>
              <p className="text-xs text-[var(--ss-text-muted)]">
                Control the percentage of users who will see this feature when enabled.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
