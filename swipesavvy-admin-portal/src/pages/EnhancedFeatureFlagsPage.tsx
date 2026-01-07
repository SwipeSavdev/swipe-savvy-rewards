import Badge from '@/components/ui/Badge'
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { featureFlagsApi } from '@/services/apiClient'
import { useState, useEffect, useCallback } from 'react'

interface FeatureFlag {
  id: number
  key: string
  name: string
  description: string
  category: string
  enabled: boolean
  rolloutPercentage: number
  ownerEmail: string | null
  createdAt: string
  updatedAt: string
}

interface CreateFlagForm {
  key: string
  name: string
  description: string
  category: string
  enabled: boolean
  rolloutPercentage: number
}

const CATEGORIES = ['UI', 'Advanced', 'Experimental', 'Rollout']

export default function EnhancedFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  const [createForm, setCreateForm] = useState<CreateFlagForm>({
    key: '',
    name: '',
    description: '',
    category: 'UI',
    enabled: false,
    rolloutPercentage: 0,
  })

  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await featureFlagsApi.listFlags(1, 200)
      setFlags(result.flags || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load feature flags'
      setError(errorMessage)
      console.error('Failed to load feature flags:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFlags()
  }, [fetchFlags])

  const filteredFlags = selectedCategory
    ? flags.filter((f) => f.category === selectedCategory)
    : flags

  const toggleFlag = async (id: number, currentEnabled: boolean) => {
    try {
      await featureFlagsApi.toggleFlag(String(id), !currentEnabled)
      setFlags(flags.map((f) => (f.id === id ? { ...f, enabled: !currentEnabled } : f)))
    } catch (err: unknown) {
      console.error('Failed to toggle flag:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to toggle flag: ' + errorMessage)
    }
  }

  const handleCreateFlag = async () => {
    if (!createForm.key || !createForm.name) {
      alert('Key and Name are required')
      return
    }
    try {
      setCreateLoading(true)
      await featureFlagsApi.createFlag({
        key: createForm.key,
        name: createForm.name,
        description: createForm.description,
        category: createForm.category,
        enabled: createForm.enabled,
        rolloutPercentage: createForm.rolloutPercentage,
      })
      setShowCreateModal(false)
      setCreateForm({
        key: '',
        name: '',
        description: '',
        category: 'UI',
        enabled: false,
        rolloutPercentage: 0,
      })
      await fetchFlags()
    } catch (err: unknown) {
      console.error('Failed to create flag:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to create flag: ' + errorMessage)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteFlag = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the flag "${name}"?`)) {
      return
    }
    try {
      setDeleteLoading(id)
      await featureFlagsApi.deleteFlag(String(id))
      setFlags(flags.filter((f) => f.id !== id))
    } catch (err: unknown) {
      console.error('Failed to delete flag:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to delete flag: ' + errorMessage)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleUpdateRollout = async (id: number, rollout: number) => {
    try {
      await featureFlagsApi.updateRollout(String(id), rollout)
      setFlags(flags.map((f) => (f.id === id ? { ...f, rolloutPercentage: rollout } : f)))
    } catch (err: unknown) {
      console.error('Failed to update rollout:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to update rollout: ' + errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#235393]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchFlags}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-gradient-to-r from-[#235393] to-[#1A3F7A] rounded-lg p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAB915]/20 rounded-lg">
            <BrandingKitIcon name="filter" size="lg" className="text-[#FAB915]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Feature Flags</h1>
            <p className="text-white/70 mt-1">Manage feature flags and rollouts for mobile app and web platforms</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 border-l-4 border-[#235393]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#235393] dark:text-[#7ACD56] uppercase">Total Flags</span>
              <BrandingKitIcon name="filter" size="md" className="text-[#235393]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#235393] to-[#1A3F7A] bg-clip-text">{flags.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-900/20 border-l-4 border-[#60BA46]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#60BA46] dark:text-[#7ACD56] uppercase">Enabled</span>
              <BrandingKitIcon name="check" size="md" className="text-[#60BA46]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#60BA46] to-[#4A9A35] bg-clip-text">{flags.filter(f => f.enabled).length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-900 dark:to-yellow-900/20 border-l-4 border-[#FAB915]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#FAB915] dark:text-[#FAB915] uppercase">Disabled</span>
              <BrandingKitIcon name="close" size="md" className="text-[#FAB915]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#FAB915] to-[#FF8C00] bg-clip-text">{flags.filter(f => !f.enabled).length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-900/20 border-l-4 border-purple-500">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase">Categories</span>
              <BrandingKitIcon name="menu" size="md" className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text">{CATEGORIES.length}</p>
          </div>
        </Card>
      </div>

      <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
        <BrandingKitIcon name="plus" size="sm" />
        Create Feature Flag
      </Button>

      <Card className="p-6 border-l-4 border-[#60BA46]">
        <h3 className="text-lg font-bold text-[#235393] dark:text-white mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant={selectedCategory === null ? 'primary' : 'outline'} onClick={() => setSelectedCategory(null)} className="text-sm">
            All ({flags.length})
          </Button>
          {CATEGORIES.map((cat) => {
            const count = flags.filter((f) => f.category === cat).length
            return (
              <Button key={cat} variant={selectedCategory === cat ? 'primary' : 'outline'} onClick={() => setSelectedCategory(cat)} className="text-sm">
                {cat} ({count})
              </Button>
            )
          })}
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredFlags.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-[#4B4D4D] dark:text-[#A0A0A0]">No feature flags found. Create your first flag to get started.</p>
          </Card>
        ) : (
          filteredFlags.map((flag) => (
            <Card key={flag.id} className="p-6 hover:shadow-lg hover:border-[#235393]/25 transition-all border-l-4 border-[#60BA46]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-[#235393] dark:text-white">{flag.name}</h3>
                    <Badge variant={flag.enabled ? 'success' : 'neutral'}>{flag.enabled ? 'Enabled' : 'Disabled'}</Badge>
                    <Badge variant="primary">{flag.category}</Badge>
                  </div>
                  <p className="text-[#4B4D4D] dark:text-[#A0A0A0] mb-2 text-sm font-mono">{flag.key}</p>
                  <p className="text-[#4B4D4D] dark:text-[#A0A0A0] mb-4">{flag.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-6">
                    <div className="bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 dark:from-slate-800 dark:to-slate-700 px-4 py-2 rounded">
                      <p className="text-[#4B4D4D] dark:text-[#A0A0A0] text-xs uppercase font-semibold">Rollout</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={flag.rolloutPercentage}
                          onChange={(e) => handleUpdateRollout(flag.id, Number.parseInt(e.target.value))}
                          className="w-20 h-2"
                        />
                        <p className="font-bold text-[#235393] dark:text-[#7ACD56]">{flag.rolloutPercentage}%</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 dark:from-slate-800 dark:to-slate-700 px-4 py-2 rounded">
                      <p className="text-[#4B4D4D] dark:text-[#A0A0A0] text-xs uppercase font-semibold">Created</p>
                      <p className="font-bold text-[#235393] dark:text-[#7ACD56]">{flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 dark:from-slate-800 dark:to-slate-700 px-4 py-2 rounded">
                      <p className="text-[#4B4D4D] dark:text-[#A0A0A0] text-xs uppercase font-semibold">Updated</p>
                      <p className="font-bold text-[#235393] dark:text-[#7ACD56]">{flag.updatedAt ? new Date(flag.updatedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={flag.enabled} onChange={() => toggleFlag(flag.id, flag.enabled)} className="w-5 h-5" />
                    <span className="text-sm font-semibold text-[#235393] dark:text-[#7ACD56]">{flag.enabled ? 'On' : 'Off'}</span>
                  </label>
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteFlag(flag.id, flag.name)}
                    disabled={deleteLoading === flag.id}
                  >
                    {deleteLoading === flag.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Flag Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-[#235393] dark:text-white mb-4">Create Feature Flag</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="flag-key" className="block text-sm font-semibold text-[#4B4D4D] dark:text-[#A0A0A0] mb-1">Key (identifier)</label>
                <input
                  id="flag-key"
                  type="text"
                  value={createForm.key}
                  onChange={(e) => setCreateForm({ ...createForm, key: e.target.value.toLowerCase().replaceAll(/\s+/g, '_') })}
                  placeholder="e.g., enable_dark_mode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-800 dark:border-slate-600"
                />
              </div>
              <div>
                <label htmlFor="flag-name" className="block text-sm font-semibold text-[#4B4D4D] dark:text-[#A0A0A0] mb-1">Display Name</label>
                <input
                  id="flag-name"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g., Enable Dark Mode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-800 dark:border-slate-600"
                />
              </div>
              <div>
                <label htmlFor="flag-desc" className="block text-sm font-semibold text-[#4B4D4D] dark:text-[#A0A0A0] mb-1">Description</label>
                <textarea
                  id="flag-desc"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="What does this flag control?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-800 dark:border-slate-600"
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="flag-category" className="block text-sm font-semibold text-[#4B4D4D] dark:text-[#A0A0A0] mb-1">Category</label>
                <select
                  id="flag-category"
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-slate-800 dark:border-slate-600"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="flag-rollout" className="block text-sm font-semibold text-[#4B4D4D] dark:text-[#A0A0A0] mb-1">Rollout Percentage: {createForm.rolloutPercentage}%</label>
                <input
                  id="flag-rollout"
                  type="range"
                  min="0"
                  max="100"
                  value={createForm.rolloutPercentage}
                  onChange={(e) => setCreateForm({ ...createForm, rolloutPercentage: Number.parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="flag-enabled"
                  type="checkbox"
                  checked={createForm.enabled}
                  onChange={(e) => setCreateForm({ ...createForm, enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="flag-enabled" className="text-sm font-semibold text-[#4B4D4D] dark:text-[#A0A0A0]">Enabled by default</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateFlag} disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Flag'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
