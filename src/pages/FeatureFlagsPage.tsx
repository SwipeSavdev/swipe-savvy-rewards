import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCw, ChevronDown } from 'lucide-react'

// Mock API for feature flags
const mockFlags: FeatureFlag[] = [
  {
    id: '1',
    name: 'new_dashboard',
    description: 'New dashboard redesign',
    enabled: true,
    rollout_percentage: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const api = {
  get: async () => {
    return { data: { success: true, data: { flags: mockFlags } } }
  },
  post: async (_url: string, data: any) => {
    const newFlag: FeatureFlag = {
      ...data,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockFlags.push(newFlag)
    return { data: { success: true, data: newFlag } }
  },
  patch: async (_url: string) => {
    return { data: { success: true, data: { id: '1', name: 'test', description: '', enabled: true, rollout_percentage: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } } }
  },
  put: async (_url: string, data: any) => {
    return { data: { success: true, data: { id: '1', name: 'test', description: '', ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } } }
  },
  delete: async (_url: string) => {
    return { data: { success: true } }
  },
}

interface FeatureFlag {
  id: string
  name: string
  description?: string
  enabled: boolean
  rollout_percentage: number
  created_at: string
  updated_at: string
}

export function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: false,
    rollout_percentage: 0,
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Load feature flags
  const loadFlags = async () => {
    setLoading(true)
    try {
      const response = await api.get()
      if (response.data.success) {
        setFlags(response.data.data.flags)
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFlags()
  }, [])

  // Create feature flag
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Feature flag name is required')
      return
    }

    try {
      const response = await api.post('/api/feature-flags', {
        name: formData.name,
        description: formData.description,
        enabled: formData.enabled,
        rollout_percentage: formData.rollout_percentage,
        metadata: {},
      })

      if (response.data.success) {
        setFlags([response.data.data, ...flags])
        setFormData({ name: '', description: '', enabled: false, rollout_percentage: 0 })
        setShowForm(false)
        alert('Feature flag created successfully!')
      }
    } catch (error) {
      console.error('Failed to create feature flag:', error)
      alert('Error creating feature flag')
    }
  }

  // Toggle feature flag
  const handleToggle = async (flagId: string, currentState: boolean) => {
    try {
      const response = await api.patch(`/api/feature-flags/${flagId}/toggle?enabled=${!currentState}`)
      if (response.data.success) {
        setFlags(flags.map(f => f.id === flagId ? response.data.data : f))
      }
    } catch (error) {
      console.error('Failed to toggle feature flag:', error)
    }
  }

  // Update rollout percentage
  const handleUpdateRollout = async (flagId: string, percentage: number) => {
    try {
      const response = await api.put(`/api/feature-flags/${flagId}`, {
        rollout_percentage: percentage,
      })
      if (response.data.success) {
        setFlags(flags.map(f => f.id === flagId ? response.data.data : f))
      }
    } catch (error) {
      console.error('Failed to update rollout percentage:', error)
    }
  }

  // Delete feature flag
  const handleDelete = async (flagId: string) => {
    if (!window.confirm('Are you sure you want to delete this feature flag?')) {
      return
    }

    try {
      const response = await api.delete(`/api/feature-flags/${flagId}`)
      if (response.data.success) {
        setFlags(flags.filter(f => f.id !== flagId))
      }
    } catch (error) {
      console.error('Failed to delete feature flag:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
            <p className="text-gray-600 mt-2">Control which features are served to mobile app users</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={loadFlags}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Flag
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Feature Flag</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Flag name (e.g., new_dashboard)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-700">Enable by default</span>
                </label>
              </div>
              <div>
                <label className="text-gray-700 text-sm">Rollout %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.rollout_percentage}
                  onChange={(e) => setFormData({ ...formData, rollout_percentage: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 mt-2">Loading feature flags...</p>
          </div>
        )}

        {/* Flags List */}
        {!loading && flags.length > 0 && (
          <div className="space-y-4">
            {flags.map((flag) => (
              <div key={flag.id} className="bg-white rounded-lg border border-gray-200">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                  onClick={() => setExpandedId(expandedId === flag.id ? null : flag.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{flag.name}</h3>
                    {flag.description && (
                      <p className="text-gray-600 text-sm mt-1">{flag.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedId === flag.id ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === flag.id && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-4">
                    {/* Toggle Button */}
                    <div>
                      <button
                        onClick={() => handleToggle(flag.id, flag.enabled)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          flag.enabled
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {flag.enabled ? 'Disable Flag' : 'Enable Flag'}
                      </button>
                    </div>

                    {/* Rollout Controls */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">Rollout Percentage</label>
                        <span className="text-sm font-semibold text-gray-900">{flag.rollout_percentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={flag.rollout_percentage}
                        onChange={(e) => handleUpdateRollout(flag.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        {flag.rollout_percentage === 0
                          ? '🔴 Feature is off for all users'
                          : flag.rollout_percentage === 100
                          ? '🟢 Feature is on for all users'
                          : `🟡 Feature will be enabled for ${flag.rollout_percentage}% of users`}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t border-gray-300">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">ID:</span> {flag.id}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">Created:</span> {new Date(flag.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">Updated:</span> {new Date(flag.updated_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-end pt-2 border-t border-gray-300">
                      <button
                        onClick={() => handleDelete(flag.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && flags.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No feature flags yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Flag
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
