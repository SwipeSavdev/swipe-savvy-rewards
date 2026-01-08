import Badge from '@/components/ui/Badge'
import { BrandingKitIcon, BrandingKitIconButton } from '@/components/ui/BrandingKitIcon'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import axios from 'axios'
import { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface Policy {
  id: string
  name: string
  description: string
  category: string
  status: 'active' | 'inactive' | 'draft'
  version: string
  lastModified: string
  appliedTo: string
}

const MOCK_POLICIES: Policy[] = [
  {
    id: '1',
    name: 'Data Privacy Policy',
    description: 'Governs how user data is collected and processed',
    category: 'Privacy',
    status: 'active',
    version: '2.1',
    lastModified: '2025-12-15',
    appliedTo: 'All Users',
  },
  {
    id: '2',
    name: 'Terms of Service',
    description: 'Main terms and conditions for platform usage',
    category: 'Legal',
    status: 'active',
    version: '3.0',
    lastModified: '2025-11-20',
    appliedTo: 'All Users',
  },
  {
    id: '3',
    name: 'Security Policy',
    description: 'Security standards and best practices',
    category: 'Security',
    status: 'active',
    version: '1.5',
    lastModified: '2025-10-30',
    appliedTo: 'All Staff',
  },
]

export default function PolicyManagerPage() {
  const [policies, setpolicies] = useState<Policy[]>(MOCK_POLICIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch policies on mount
  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/api/policies`)
      setpolicies(response.data.policies || response.data || MOCK_POLICIES)
    } catch (err: any) {
      console.error('Failed to fetch policies:', err)
      setError(err.message || 'Failed to fetch policies')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/policies/${id}`)
      setpolicies(policies.filter((p) => p.id !== id))
    } catch (err: any) {
      console.error('Failed to delete policy:', err)
      setError('Failed to delete policy')
    }
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-gradient-to-r from-[#235393] to-[#1A3F7A] rounded-lg p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAB915]/20 rounded-lg">
            <BrandingKitIcon name="shield" size="lg" className="text-[#FAB915]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Policy Manager</h1>
            <p className="text-white/70 mt-1">Create and manage system policies and compliance documents</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="bg-red-50 border border-red-200">
          <div className="p-4 flex items-center gap-3">
            <div className="text-red-600">
              <BrandingKitIcon name="alert_circle" size="md" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600">✕</button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="bg-blue-50 border border-blue-200">
          <div className="p-4 flex items-center gap-3">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-sm text-blue-800">Loading policies...</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 border-l-4 border-[#235393]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#235393] dark:text-[#7ACD56] uppercase">Total Policies</span>
              <BrandingKitIcon name="shield" size="md" className="text-[#235393]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#235393] to-[#1A3F7A] bg-clip-text">{policies.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-900/20 border-l-4 border-[#60BA46]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#60BA46] dark:text-[#7ACD56] uppercase">Active</span>
              <BrandingKitIcon name="check" size="md" className="text-[#60BA46]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#60BA46] to-[#4A9A35] bg-clip-text">{policies.filter(p => p.status === 'active').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-900 dark:to-yellow-900/20 border-l-4 border-[#FAB915]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#FAB915] dark:text-[#FAB915] uppercase">Drafts</span>
              <BrandingKitIcon name="alert_circle" size="md" className="text-[#FAB915]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#FAB915] to-[#FF8C00] bg-clip-text">{policies.filter(p => p.status === 'draft').length}</p>
          </div>
        </Card>
      </div>

      <Button className="gap-2">
        <BrandingKitIcon name="plus" size="sm" />
        Create Policy
      </Button>

      <Card className="overflow-hidden border-l-4 border-[#60BA46]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-[#235393]/10 to-[#60BA46]/10 dark:from-slate-800 dark:to-slate-700 border-b border-[#235393]/20">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Policy Name</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Category</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Version</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Last Modified</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#235393]/10">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gradient-to-r hover:from-[#235393]/5 hover:to-[#60BA46]/5 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#235393] dark:text-white">{policy.name}</td>
                  <td className="px-6 py-4 text-[#4B4D4D] dark:text-[#A0A0A0]">{policy.category}</td>
                  <td className="px-6 py-4 text-[#4B4D4D] dark:text-[#A0A0A0]">v{policy.version}</td>
                  <td className="px-6 py-4">
                    <Badge variant={policy.status === 'active' ? 'success' : policy.status === 'draft' ? 'neutral' : 'danger'}>
                      {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-[#4B4D4D] dark:text-[#A0A0A0]">{policy.lastModified}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <BrandingKitIconButton name="edit" title="Edit policy" onClick={() => console.log('Edit policy:', policy.id)} />
                    <BrandingKitIconButton name="trash" onClick={() => handleDelete(policy.id)} title="Delete policy" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
