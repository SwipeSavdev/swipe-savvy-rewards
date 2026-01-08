import Badge from '@/components/ui/Badge'
import { BrandingKitIcon, BrandingKitIconButton } from '@/components/ui/BrandingKitIcon'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import axios from 'axios'
import { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  rolesCount: number
}

const CATEGORIES = ['User Management', 'Analytics', 'System', 'Support', 'Compliance']

const MOCK_PERMISSIONS: Permission[] = [
  {
    id: '1',
    name: 'View Users',
    description: 'View all users in the system',
    category: 'User Management',
    resource: 'users:read',
    rolesCount: 4,
  },
  {
    id: '2',
    name: 'Create User',
    description: 'Create new users',
    category: 'User Management',
    resource: 'users:create',
    rolesCount: 2,
  },
  {
    id: '3',
    name: 'Edit User',
    description: 'Edit user information',
    category: 'User Management',
    resource: 'users:update',
    rolesCount: 2,
  },
  {
    id: '4',
    name: 'Delete User',
    description: 'Delete users from system',
    category: 'User Management',
    resource: 'users:delete',
    rolesCount: 1,
  },
  {
    id: '5',
    name: 'View Analytics',
    description: 'View analytics dashboards',
    category: 'Analytics',
    resource: 'analytics:read',
    rolesCount: 4,
  },
  {
    id: '6',
    name: 'Export Reports',
    description: 'Export analytics reports',
    category: 'Analytics',
    resource: 'analytics:export',
    rolesCount: 2,
  },
  {
    id: '7',
    name: 'View Audit Logs',
    description: 'Access audit logs',
    category: 'System',
    resource: 'audit:read',
    rolesCount: 2,
  },
  {
    id: '8',
    name: 'Manage Feature Flags',
    description: 'Enable/disable features',
    category: 'System',
    resource: 'features:manage',
    rolesCount: 1,
  },
  {
    id: '9',
    name: 'View Support Tickets',
    description: 'View customer support tickets',
    category: 'Support',
    resource: 'support:read',
    rolesCount: 3,
  },
  {
    id: '10',
    name: 'Manage Support Tickets',
    description: 'Handle and resolve support tickets',
    category: 'Support',
    resource: 'support:update',
    rolesCount: 2,
  },
  {
    id: '11',
    name: 'View Compliance',
    description: 'View compliance reports',
    category: 'Compliance',
    resource: 'compliance:read',
    rolesCount: 2,
  },
  {
    id: '12',
    name: 'Manage Permissions',
    description: 'Manage user permissions',
    category: 'System',
    resource: 'permissions:manage',
    rolesCount: 1,
  },
]

export default function PermissionsManagerPage() {
  const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch permissions on mount
  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      setError(null)
      // Try to fetch from API, but permissions are often just read-only
      const response = await axios.get(`${API_BASE_URL}/api/permissions`)
      setPermissions(response.data.permissions || response.data || MOCK_PERMISSIONS)
    } catch (err: any) {
      console.error('Failed to fetch permissions:', err)
      setError(err.message || 'Failed to fetch permissions')
    } finally {
      setLoading(false)
    }
  }

  const filteredPermissions = selectedCategory
    ? permissions.filter((p) => p.category === selectedCategory)
    : permissions

  const handleDeletePermission = async (id: string) => {
    try {
      // Permissions are typically read-only, so this may not be available on API
      await axios.delete(`${API_BASE_URL}/api/permissions/${id}`)
      setPermissions(permissions.filter((p) => p.id !== id))
    } catch (err: any) {
      console.error('Failed to delete permission:', err)
      setError('Permissions cannot be deleted (read-only)')
    }
  }

  const groupedByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = filteredPermissions.filter((p) => p.category === cat)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-gradient-to-r from-[#235393] to-[#1A3F7A] rounded-lg p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAB915]/20 rounded-lg">
            <BrandingKitIcon name="lock" size="lg" className="text-[#FAB915]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Permissions Manager</h1>
            <p className="text-white/70 mt-1">Manage system permissions and access controls</p>
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
            <p className="text-sm text-blue-800">Loading permissions...</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 border-l-4 border-[#235393]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#235393] dark:text-[#7ACD56] uppercase">Total Permissions</span>
              <BrandingKitIcon name="lock" size="md" className="text-[#235393]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#235393] to-[#1A3F7A] bg-clip-text">{permissions.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-900/20 border-l-4 border-[#60BA46]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#60BA46] dark:text-[#7ACD56] uppercase">Categories</span>
              <BrandingKitIcon name="filter" size="md" className="text-[#60BA46]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#60BA46] to-[#4A9A35] bg-clip-text">{CATEGORIES.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-900 dark:to-yellow-900/20 border-l-4 border-[#FAB915]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#FAB915] dark:text-[#FAB915] uppercase">Assigned To Roles</span>
              <BrandingKitIcon name="shield" size="md" className="text-[#FAB915]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#FAB915] to-[#FF8C00] bg-clip-text">{Math.max(...permissions.map(p => p.rolesCount))}</p>
          </div>
        </Card>
      </div>

      <Button className="gap-2 mb-4">
        <BrandingKitIcon name="plus" size="sm" />
        Add Permission
      </Button>

      <Card className="p-6 border-l-4 border-[#60BA46]">
        <h3 className="text-lg font-bold text-[#235393] dark:text-white mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'primary' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className="text-sm"
          >
            All ({permissions.length})
          </Button>
          {CATEGORIES.map((cat) => {
            const count = permissions.filter((p) => p.category === cat).length
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'primary' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className="text-sm"
              >
                {cat} ({count})
              </Button>
            )
          })}
        </div>
      </Card>

      <div className="space-y-6">
        {Object.entries(groupedByCategory).map(
          ([category, categoryPermissions]) =>
            categoryPermissions.length > 0 && (
              <div key={category}>
                <h3 className="text-lg font-bold text-[#235393] dark:text-white mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-[#235393]/20 to-[#60BA46]/20 rounded">
                    <BrandingKitIcon name="shield" size="md" className="text-[#235393]" />
                  </div>
                  {category}
                </h3>
                <div className="grid gap-3">
                  {categoryPermissions.map((permission) => (
                    <Card key={permission.id} className="p-4 hover:shadow-lg hover:border-[#235393]/25 transition-all border-l-4 border-[#60BA46]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-[#235393] dark:text-white mb-1">
                            {permission.name}
                          </h4>
                          <p className="text-sm text-[#4B4D4D] dark:text-[#A0A0A0] mb-3">
                            {permission.description}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs">
                            <Badge variant="neutral" className="bg-gradient-to-r from-[#235393]/10 to-[#60BA46]/10 text-[#235393] dark:text-[#7ACD56] border border-[#235393]/20">
                              {permission.resource}
                            </Badge>
                            <span className="px-3 py-1 bg-gradient-to-r from-[#235393]/5 to-[#60BA46]/5 rounded text-[#4B4D4D] dark:text-[#A0A0A0]">
                              Used by {permission.rolesCount} role{permission.rolesCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <BrandingKitIconButton
                            name="edit"
                            title="Edit permission"
                            onClick={() => console.log('Edit permission:', permission.id)}
                          />
                          {permission.rolesCount === 0 && (
                            <BrandingKitIconButton
                              name="trash"
                              onClick={() => handleDeletePermission(permission.id)}
                              title="Delete permission"
                            />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  )
}
