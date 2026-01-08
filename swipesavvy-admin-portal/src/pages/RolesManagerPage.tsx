import Badge from '@/components/ui/Badge'
import { BrandingKitIcon, BrandingKitIconButton } from '@/components/ui/BrandingKitIcon'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import axios from 'axios'
import { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface Role {
  id: string
  name: string
  description: string
  usersCount: number
  status: 'active' | 'inactive'
  createdAt: string
  permissions?: number
}

const MOCK_ROLES: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    usersCount: 2,
    status: 'active',
    createdAt: '2025-01-01',
    permissions: 156,
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Administrative access to main features',
    usersCount: 5,
    status: 'active',
    createdAt: '2025-01-05',
    permissions: 89,
  },
  {
    id: '3',
    name: 'Manager',
    description: 'Manage users and view analytics',
    usersCount: 12,
    status: 'active',
    createdAt: '2025-01-10',
    permissions: 45,
  },
  {
    id: '4',
    name: 'Operator',
    description: 'Limited access to operational features',
    usersCount: 8,
    status: 'active',
    createdAt: '2025-01-15',
    permissions: 18,
  },
  {
    id: '5',
    name: 'Viewer',
    description: 'Read-only access to dashboards',
    usersCount: 0,
    status: 'inactive',
    createdAt: '2025-01-20',
    permissions: 5,
  },
]

export default function RolesManagerPage() {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/api/roles`)
      setRoles(response.data.roles || response.data || MOCK_ROLES)
    } catch (err: any) {
      console.error('Failed to fetch roles:', err)
      setError(err.message || 'Failed to fetch roles')
      // Keep mock data as fallback
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/roles/${id}`)
      setRoles(roles.filter((r) => r.id !== id))
    } catch (err: any) {
      console.error('Failed to delete role:', err)
      setError('Failed to delete role')
    }
  }

  const handleToggleStatus = async (id: string) => {
    const role = roles.find(r => r.id === id)
    if (!role) return

    const newStatus = role.status === 'active' ? 'inactive' : 'active'

    try {
      await axios.put(`${API_BASE_URL}/api/roles/${id}`, { status: newStatus })
      setRoles(
        roles.map((r) =>
          r.id === id ? { ...r, status: newStatus } : r,
        ),
      )
    } catch (err: any) {
      console.error('Failed to update role status:', err)
      setError('Failed to update role status')
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
            <h1 className="text-3xl font-bold">Roles Manager</h1>
            <p className="text-white/70 mt-1">Create and manage user roles with specific permissions</p>
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
              <p className="text-xs text-red-600 mt-1">Using fallback data. Please try refreshing.</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              ✕
            </button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="bg-blue-50 border border-blue-200">
          <div className="p-4 flex items-center gap-3">
            <div className="animate-spin">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
            <p className="text-sm text-blue-800">Loading roles...</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 border-l-4 border-[#235393]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#235393] dark:text-[#7ACD56] uppercase">Total Roles</span>
              <BrandingKitIcon name="shield" size="md" className="text-[#235393]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#235393] to-[#1A3F7A] bg-clip-text">{roles.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-900/20 border-l-4 border-[#60BA46]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#60BA46] dark:text-[#7ACD56] uppercase">Active Roles</span>
              <BrandingKitIcon name="check" size="md" className="text-[#60BA46]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#60BA46] to-[#4A9A35] bg-clip-text">{roles.filter(r => r.status === 'active').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-900 dark:to-yellow-900/20 border-l-4 border-[#FAB915]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#FAB915] dark:text-[#FAB915] uppercase">Users Assigned</span>
              <BrandingKitIcon name="users" size="md" className="text-[#FAB915]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#FAB915] to-[#FF8C00] bg-clip-text">{roles.reduce((sum, r) => sum + r.usersCount, 0)}</p>
          </div>
        </Card>
      </div>

      <Button className="gap-2 mb-4">
        <BrandingKitIcon name="plus" size="sm" />
        Create New Role
      </Button>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="p-6 hover:shadow-lg hover:border-[#235393]/25 transition-all border-l-4 border-[#60BA46]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#235393] dark:text-white">{role.name}</h3>
                  <Badge variant={role.status === 'active' ? 'success' : 'neutral'}>
                    {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-[#4B4D4D] dark:text-[#A0A0A0] mb-4 max-w-lg">{role.description}</p>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 dark:from-slate-800 dark:to-slate-700 px-4 py-2 rounded">
                    <p className="text-[#4B4D4D] dark:text-[#A0A0A0] text-xs uppercase font-semibold">Users</p>
                    <p className="font-bold text-[#235393] dark:text-[#7ACD56] text-lg">
                      {role.usersCount}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 dark:from-slate-800 dark:to-slate-700 px-4 py-2 rounded">
                    <p className="text-[#4B4D4D] dark:text-[#A0A0A0] text-xs uppercase font-semibold">Permissions</p>
                    <p className="font-bold text-[#235393] dark:text-[#7ACD56] text-lg">{role.permissions}</p>
                  </div>
                  <div className="bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 dark:from-slate-800 dark:to-slate-700 px-4 py-2 rounded">
                    <p className="text-[#4B4D4D] dark:text-[#A0A0A0] text-xs uppercase font-semibold">Created</p>
                    <p className="font-bold text-[#235393] dark:text-white">{role.createdAt}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BrandingKitIconButton
                  name="edit"
                  title="Edit role"
                  onClick={() => console.log('Edit role:', role.id)}
                />
                <BrandingKitIconButton
                  name={role.status === 'active' ? 'lock' : 'check'}
                  onClick={() => handleToggleStatus(role.id)}
                  title={role.status === 'active' ? 'Disable role' : 'Enable role'}
                />
                {role.usersCount === 0 && (
                  <BrandingKitIconButton
                    name="trash"
                    onClick={() => handleDeleteRole(role.id)}
                    title="Delete role"
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
