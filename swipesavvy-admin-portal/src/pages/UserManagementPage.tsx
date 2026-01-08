import axios from 'axios'
import { AlertCircle, Check, ChevronRight, Edit, FileText, Filter, Lock, Plus, Search, Shield, Trash2, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type TabKey = 'users' | 'roles' | 'permissions' | 'policies'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  lastActive: string
  createdAt: string
  department?: string
}

interface Role {
  id: string
  name: string
  description: string
  usersCount: number
  status: 'active' | 'inactive'
  createdAt: string
  permissions: number
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  rolesCount: number
}

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

const MOCK_USERS: AdminUser[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@swipesavvy.com', role: 'Admin', status: 'active', lastActive: '2 hours ago', createdAt: '2025-01-15', department: 'Management' },
  { id: '2', name: 'Michael Chen', email: 'michael.chen@swipesavvy.com', role: 'Manager', status: 'active', lastActive: '30 minutes ago', createdAt: '2025-02-01', department: 'Operations' },
  { id: '3', name: 'Emma Rodriguez', email: 'emma.rodriguez@swipesavvy.com', role: 'Operator', status: 'active', lastActive: '1 hour ago', createdAt: '2025-03-10', department: 'Support' },
  { id: '4', name: 'David Lee', email: 'david.lee@swipesavvy.com', role: 'Admin', status: 'inactive', lastActive: '7 days ago', createdAt: '2025-01-20', department: 'Management' },
]

const MOCK_ROLES: Role[] = [
  { id: '1', name: 'Super Admin', description: 'Full system access with all permissions', usersCount: 2, status: 'active', createdAt: '2025-01-01', permissions: 156 },
  { id: '2', name: 'Admin', description: 'Administrative access to main features', usersCount: 5, status: 'active', createdAt: '2025-01-05', permissions: 89 },
  { id: '3', name: 'Manager', description: 'Manage users and view analytics', usersCount: 12, status: 'active', createdAt: '2025-01-10', permissions: 45 },
  { id: '4', name: 'Operator', description: 'Limited access to operational features', usersCount: 8, status: 'active', createdAt: '2025-01-15', permissions: 18 },
  { id: '5', name: 'Viewer', description: 'Read-only access to dashboards', usersCount: 0, status: 'inactive', createdAt: '2025-01-20', permissions: 5 },
]

const CATEGORIES = ['User Management', 'Analytics', 'System', 'Support', 'Compliance']

const MOCK_PERMISSIONS: Permission[] = [
  { id: '1', name: 'View Users', description: 'View all users in the system', category: 'User Management', resource: 'users:read', rolesCount: 4 },
  { id: '2', name: 'Create User', description: 'Create new users', category: 'User Management', resource: 'users:create', rolesCount: 2 },
  { id: '3', name: 'Edit User', description: 'Edit user information', category: 'User Management', resource: 'users:update', rolesCount: 2 },
  { id: '4', name: 'Delete User', description: 'Delete users from system', category: 'User Management', resource: 'users:delete', rolesCount: 1 },
  { id: '5', name: 'View Analytics', description: 'View analytics dashboards', category: 'Analytics', resource: 'analytics:read', rolesCount: 4 },
  { id: '6', name: 'Export Reports', description: 'Export analytics reports', category: 'Analytics', resource: 'analytics:export', rolesCount: 2 },
  { id: '7', name: 'View Audit Logs', description: 'Access audit logs', category: 'System', resource: 'audit:read', rolesCount: 2 },
  { id: '8', name: 'Manage Feature Flags', description: 'Enable/disable features', category: 'System', resource: 'features:manage', rolesCount: 1 },
  { id: '9', name: 'View Support Tickets', description: 'View customer support tickets', category: 'Support', resource: 'support:read', rolesCount: 3 },
  { id: '10', name: 'Manage Support Tickets', description: 'Handle and resolve support tickets', category: 'Support', resource: 'support:update', rolesCount: 2 },
  { id: '11', name: 'View Compliance', description: 'View compliance reports', category: 'Compliance', resource: 'compliance:read', rolesCount: 2 },
  { id: '12', name: 'Manage Permissions', description: 'Manage user permissions', category: 'System', resource: 'permissions:manage', rolesCount: 1 },
]

const MOCK_POLICIES: Policy[] = [
  { id: '1', name: 'Data Privacy Policy', description: 'Governs how user data is collected and processed', category: 'Privacy', status: 'active', version: '2.1', lastModified: '2025-12-15', appliedTo: 'All Users' },
  { id: '2', name: 'Terms of Service', description: 'Main terms and conditions for platform usage', category: 'Legal', status: 'active', version: '3.0', lastModified: '2025-11-20', appliedTo: 'All Users' },
  { id: '3', name: 'Security Policy', description: 'Security standards and best practices', category: 'Security', status: 'active', version: '1.5', lastModified: '2025-10-30', appliedTo: 'All Staff' },
  { id: '4', name: 'Cookie Policy', description: 'Information about cookies and tracking', category: 'Privacy', status: 'active', version: '1.2', lastModified: '2025-09-15', appliedTo: 'All Users' },
  { id: '5', name: 'Acceptable Use Policy', description: 'Guidelines for acceptable platform behavior', category: 'Legal', status: 'draft', version: '1.0', lastModified: '2025-12-01', appliedTo: 'All Users' },
]

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    Admin: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]',
    Manager: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]',
    Operator: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]',
    'Super Admin': 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]',
    Viewer: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]',
  }
  return colors[role] || 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]'
    case 'inactive':
      return 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
    case 'suspended':
      return 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]'
    case 'draft':
      return 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]'
    default:
      return 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS)
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS)
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('users')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Fetch data from backend
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [usersRes, rolesRes, policiesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/users`),
        axios.get(`${API_BASE_URL}/api/roles`),
        axios.get(`${API_BASE_URL}/api/policies`),
      ])

      setUsers(usersRes.data.users || usersRes.data || [])
      setRoles(rolesRes.data.roles || rolesRes.data || [])
      setPolicies(policiesRes.data.policies || policiesRes.data || [])
      // Keep permissions as mock for now since they're typically not CRUD-managed
      setPermissions(MOCK_PERMISSIONS)
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      // Fall back to mock data if API fails
      setUsers(MOCK_USERS)
      setRoles(MOCK_ROLES)
      setPermissions(MOCK_PERMISSIONS)
      setPolicies(MOCK_POLICIES)
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPermissions = selectedCategory
    ? permissions.filter((p) => p.category === selectedCategory)
    : permissions

  const groupedPermissions = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filteredPermissions.filter((p) => p.category === cat)
    return acc
  }, {} as Record<string, Permission[]>)

  const handleSuspendUser = async (id: string) => {
    try {
      const newStatus = users.find(u => u.id === id)?.status === 'suspended' ? 'active' : 'suspended'
      await axios.put(`${API_BASE_URL}/api/admin/users/${id}`, { status: newStatus })
      setUsers(users.map((u) => (u.id === id ? { ...u, status: newStatus as any } : u)))
    } catch (err) {
      console.error('Failed to update user:', err)
      setError('Failed to update user status')
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`)
      setUsers(users.filter((u) => u.id !== id))
    } catch (err) {
      console.error('Failed to delete user:', err)
      setError('Failed to delete user')
    }
  }

  const handleToggleRoleStatus = async (id: string) => {
    try {
      const role = roles.find(r => r.id === id)
      const newStatus = role?.status === 'active' ? 'inactive' : 'active'
      await axios.put(`${API_BASE_URL}/api/roles/${id}`, { status: newStatus })
      setRoles(roles.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r)))
    } catch (err) {
      console.error('Failed to update role:', err)
      setError('Failed to update role status')
    }
  }

  const handleDeleteRole = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/roles/${id}`)
      setRoles(roles.filter((r) => r.id !== id))
    } catch (err) {
      console.error('Failed to delete role:', err)
      setError('Failed to delete role')
    }
  }

  const handleDeletePermission = (id: string) => {
    // Permissions are typically read-only, but keep this for UI
    setPermissions(permissions.filter((p) => p.id !== id))
  }

  const handleDeletePolicy = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/policies/${id}`)
      setPolicies(policies.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Failed to delete policy:', err)
      setError('Failed to delete policy')
    }
  }

  const tabs = [
    { key: 'users' as TabKey, label: 'Users', icon: Users },
    { key: 'roles' as TabKey, label: 'Roles', icon: Shield },
    { key: 'permissions' as TabKey, label: 'Permissions', icon: Lock },
    { key: 'policies' as TabKey, label: 'Policy Manager', icon: FileText },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage admin users, roles, and access permissions</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">Using mock data as fallback. Please try refreshing the page.</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
          <p className="text-sm text-blue-800">Loading user management data...</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="p-3 bg-[var(--color-status-info-bg)] rounded-lg">
              <Users className="w-6 h-6 text-[var(--color-status-info-text)]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-[var(--color-status-success-text)] mt-1">{users.filter((u) => u.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-[var(--color-status-success-bg)] rounded-lg">
              <Check className="w-6 h-6 text-[var(--color-status-success-text)]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-3xl font-bold text-[var(--color-status-info-text)] mt-1">{roles.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Permissions</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{permissions.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[var(--color-status-info-border)] text-[var(--color-status-info-text)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Department</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit user">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          title={user.status === 'suspended' ? 'Unsuspend user' : 'Suspend user'}
                        >
                          {user.status === 'suspended' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Role Management</h2>
              <p className="text-sm text-gray-600">Create and manage user roles with specific permissions</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Create New Role
            </button>
          </div>

          <div className="grid gap-4">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{role.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(role.status)}`}>
                        {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 max-w-lg">{role.description}</p>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="bg-blue-50 px-4 py-2 rounded-lg">
                        <p className="text-gray-500 text-xs uppercase font-semibold">Users</p>
                        <p className="font-bold text-blue-600 text-lg">{role.usersCount}</p>
                      </div>
                      <div className="bg-purple-50 px-4 py-2 rounded-lg">
                        <p className="text-gray-500 text-xs uppercase font-semibold">Permissions</p>
                        <p className="font-bold text-purple-600 text-lg">{role.permissions}</p>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <p className="text-gray-500 text-xs uppercase font-semibold">Created</p>
                        <p className="font-bold text-gray-900">{role.createdAt}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit role">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleToggleRoleStatus(role.id)}
                      className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title={role.status === 'active' ? 'Disable role' : 'Enable role'}
                    >
                      {role.status === 'active' ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    </button>
                    {role.usersCount === 0 && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete role"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Permissions Management</h2>
              <p className="text-sm text-gray-600">Manage system permissions and access controls</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add Permission
            </button>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Filter:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({permissions.length})
              </button>
              {CATEGORIES.map((cat) => {
                const count = permissions.filter((p) => p.category === cat).length
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Permissions by Category */}
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(
              ([category, categoryPermissions]) =>
                categoryPermissions.length > 0 && (
                  <div key={category}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      {category}
                    </h3>
                    <div className="grid gap-3">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">{permission.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-mono">
                                  {permission.resource}
                                </span>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                                  Used by {permission.rolesCount} role{permission.rolesCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit permission">
                                <Edit className="w-4 h-4" />
                              </button>
                              {permission.rolesCount === 0 && (
                                <button
                                  onClick={() => handleDeletePermission(permission.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete permission"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Policy Management</h2>
              <p className="text-sm text-gray-600">Create and manage system policies and compliance documents</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Create Policy
            </button>
          </div>

          {/* Policy Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Policies</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{policies.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Policies</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{policies.filter((p) => p.status === 'active').length}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft Policies</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{policies.filter((p) => p.status === 'draft').length}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Policies Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Policy Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Version</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Applied To</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Last Modified</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {policies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{policy.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{policy.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{policy.category}</td>
                    <td className="px-6 py-4 text-gray-600">v{policy.version}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{policy.appliedTo}</td>
                    <td className="px-6 py-4 text-gray-600">{policy.lastModified}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit policy">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete policy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
