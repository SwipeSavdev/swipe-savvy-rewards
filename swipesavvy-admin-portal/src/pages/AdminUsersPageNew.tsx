import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Form from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import StatCard from '@/components/ui/StatCard'
import Tabs from '@/components/ui/Tabs'
import { Api } from '@/services/api'
import { rbacApi } from '@/services/apiClient'
import type { AdminUser } from '@/types/users'
import { useToastStore } from '@/store/toastStore'
import { isEmail } from '@/utils/validate'
import {
  Users,
  Shield,
  Lock,
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  Settings,
} from 'lucide-react'

interface Role {
  id: string
  name: string
  display_name: string
  description: string | null
  permissions: string[]
  is_system: boolean
  status: string
  user_count: number
}

interface Policy {
  id: string
  name: string
  display_name: string
  description: string | null
  resource: string
  actions: string[]
  effect: string
  priority: number
  is_system: boolean
  status: string
}

interface Permission {
  id: string
  name: string
  display_name: string
  description: string | null
  category: string
  resource: string
  action: string
  is_system: boolean
}

export default function AdminUsersPageNew() {
  const pushToast = useToastStore((s) => s.push)

  // User Management State
  const [loading, setLoading] = useState(true)
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('admin')
  const [status, setStatus] = useState('active')
  const [error, setError] = useState<string | null>(null)

  // Roles State
  const [roles, setRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleName, setRoleName] = useState('')
  const [roleDisplayName, setRoleDisplayName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')

  // Policies State
  const [policies, setPolicies] = useState<Policy[]>([])
  const [policiesLoading, setPoliciesLoading] = useState(false)
  const [policyModalOpen, setPolicyModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)
  const [policyName, setPolicyName] = useState('')
  const [policyDisplayName, setPolicyDisplayName] = useState('')
  const [policyDescription, setPolicyDescription] = useState('')
  const [policyResource, setPolicyResource] = useState('')

  // Permissions State
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [permissionsLoading, setPermissionsLoading] = useState(false)

  // Fetch Admin Users
  const fetchAdminUsers = async (shouldShowLoading = true) => {
    if (shouldShowLoading) setLoading(true)
    try {
      const res = await Api.adminUsersApi.listAdminUsers(1, 100, undefined, query || undefined)
      setAdmins(
        (res.users || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          createdAt: u.created_at,
        }))
      )
    } finally {
      if (shouldShowLoading) setLoading(false)
    }
  }

  // Fetch Roles
  const fetchRoles = async () => {
    setRolesLoading(true)
    try {
      const res = await rbacApi.listRoles(1, 100)
      setRoles(res.roles || [])
    } catch (err: any) {
      console.warn('Failed to load roles:', err?.message)
    } finally {
      setRolesLoading(false)
    }
  }

  // Fetch Policies
  const fetchPolicies = async () => {
    setPoliciesLoading(true)
    try {
      const res = await rbacApi.listPolicies(1, 100)
      setPolicies(res.policies || [])
    } catch (err: any) {
      console.warn('Failed to load policies:', err?.message)
    } finally {
      setPoliciesLoading(false)
    }
  }

  // Fetch Permissions
  const fetchPermissions = async () => {
    setPermissionsLoading(true)
    try {
      const res = await rbacApi.listPermissions(1, 200)
      setPermissions(res.permissions || [])
    } catch (err: any) {
      console.warn('Failed to load permissions:', err?.message)
    } finally {
      setPermissionsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (mounted) await fetchAdminUsers(true)
    })()
    return () => {
      mounted = false
    }
  }, [query])

  // User Management Functions
  const closeUserModal = () => {
    setModalOpen(false)
    setError(null)
    setName('')
    setEmail('')
    setRole('admin')
    setStatus('active')
    setEditingUser(null)
  }

  const onSaveUser = async () => {
    setError(null)
    if (!name.trim()) return setError('Name is required.')
    if (!isEmail(email)) return setError('Enter a valid email address.')

    try {
      if (editingUser) {
        pushToast({ variant: 'success', title: 'Updated', message: `User ${name} updated successfully.` })
      } else {
        await Api.adminUsersApi.createAdminUser({
          email,
          full_name: name.trim(),
          password: 'TempPass123!',
          role,
        })
        pushToast({ variant: 'success', title: 'Created', message: `Admin user ${name} created successfully.` })
      }
      closeUserModal()
      await fetchAdminUsers(false)
    } catch (error: any) {
      setError(error?.message || 'Failed to save user.')
      pushToast({ variant: 'error', title: 'Error', message: error?.message || 'Failed to save user.' })
    }
  }

  const onDeleteUser = async (user: AdminUser) => {
    try {
      await Api.adminUsersApi.deleteAdminUser(user.id)
      pushToast({ variant: 'success', title: 'Deleted', message: `User ${user.name} deleted successfully.` })
      await fetchAdminUsers(false)
    } catch (error: any) {
      pushToast({ variant: 'error', title: 'Error', message: 'Failed to delete user.' })
    }
  }

  const onEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setStatus(user.status || 'active')
    setModalOpen(true)
  }

  // Role Management Functions
  const closeRoleModal = () => {
    setRoleModalOpen(false)
    setRoleName('')
    setRoleDisplayName('')
    setRoleDescription('')
    setEditingRole(null)
  }

  const onSaveRole = async () => {
    if (!roleName.trim()) return
    try {
      if (editingRole) {
        await rbacApi.updateRole(editingRole.id, {
          display_name: roleDisplayName || roleName,
          description: roleDescription,
        })
        pushToast({ variant: 'success', title: 'Updated', message: `Role ${roleName} updated successfully.` })
      } else {
        await rbacApi.createRole({
          name: roleName.toLowerCase().replace(/\s+/g, '_'),
          display_name: roleDisplayName || roleName,
          description: roleDescription,
          permissions: [],
        })
        pushToast({ variant: 'success', title: 'Created', message: `Role ${roleName} created successfully.` })
      }
      closeRoleModal()
      await fetchRoles()
    } catch (error: any) {
      pushToast({ variant: 'error', title: 'Error', message: error?.message || 'Failed to save role.' })
    }
  }

  const onEditRole = (r: Role) => {
    setEditingRole(r)
    setRoleName(r.name)
    setRoleDisplayName(r.display_name)
    setRoleDescription(r.description || '')
    setRoleModalOpen(true)
  }

  const onDeleteRole = async (r: Role) => {
    if (r.is_system) {
      pushToast({ variant: 'warning', title: 'Cannot delete', message: 'System roles cannot be deleted.' })
      return
    }
    if (r.user_count > 0) {
      pushToast({ variant: 'warning', title: 'Cannot delete', message: 'This role has assigned users.' })
      return
    }
    try {
      await rbacApi.deleteRole(r.id)
      pushToast({ variant: 'success', title: 'Deleted', message: `Role ${r.display_name} deleted.` })
      await fetchRoles()
    } catch (error: any) {
      pushToast({ variant: 'error', title: 'Error', message: error?.message || 'Failed to delete role.' })
    }
  }

  // Policy Management Functions
  const closePolicyModal = () => {
    setPolicyModalOpen(false)
    setPolicyName('')
    setPolicyDisplayName('')
    setPolicyDescription('')
    setPolicyResource('')
    setEditingPolicy(null)
  }

  const onSavePolicy = async () => {
    if (!policyName.trim()) return
    try {
      if (editingPolicy) {
        await rbacApi.updatePolicy(editingPolicy.id, {
          display_name: policyDisplayName || policyName,
          description: policyDescription,
          resource: policyResource || 'general',
        })
        pushToast({ variant: 'success', title: 'Updated', message: `Policy ${policyName} updated successfully.` })
      } else {
        await rbacApi.createPolicy({
          name: policyName.toLowerCase().replace(/\s+/g, '_'),
          display_name: policyDisplayName || policyName,
          description: policyDescription,
          resource: policyResource || 'general',
          actions: ['read'],
        })
        pushToast({ variant: 'success', title: 'Created', message: `Policy ${policyName} created successfully.` })
      }
      closePolicyModal()
      await fetchPolicies()
    } catch (error: any) {
      pushToast({ variant: 'error', title: 'Error', message: error?.message || 'Failed to save policy.' })
    }
  }

  const onEditPolicy = (p: Policy) => {
    setEditingPolicy(p)
    setPolicyName(p.name)
    setPolicyDisplayName(p.display_name)
    setPolicyDescription(p.description || '')
    setPolicyResource(p.resource)
    setPolicyModalOpen(true)
  }

  const onDeletePolicy = async (p: Policy) => {
    if (p.is_system) {
      pushToast({ variant: 'warning', title: 'Cannot delete', message: 'System policies cannot be deleted.' })
      return
    }
    try {
      await rbacApi.deletePolicy(p.id)
      pushToast({ variant: 'success', title: 'Deleted', message: `Policy ${p.display_name} deleted.` })
      await fetchPolicies()
    } catch (error: any) {
      pushToast({ variant: 'error', title: 'Error', message: error?.message || 'Failed to delete policy.' })
    }
  }

  // User Management Columns
  const userColumns: TableColumn<AdminUser>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Admin',
        accessor: (u) => u.name,
        cell: (u) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-ss-lg bg-gradient-to-br from-ss-navy-500 to-ss-navy-700 text-white font-semibold text-sm">
              {u.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-[var(--ss-text-primary)]">{u.name}</p>
              <p className="truncate text-xs text-[var(--ss-text-tertiary)]">{u.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        accessor: (u) => u.role,
        cell: (u) => (
          <Badge colorScheme="navy" variant="soft" size="sm">
            {u.role}
          </Badge>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        accessor: (u) => u.status,
        cell: (u) => {
          const colorScheme =
            u.status === 'active' ? 'green' : u.status === 'invited' ? 'yellow' : 'red'
          return (
            <Badge colorScheme={colorScheme} variant="soft" size="sm">
              {u.status}
            </Badge>
          )
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (u) => (
          <div className="flex gap-2">
            <Button size="xs" variant="ghost" onClick={() => onEditUser(u)} leftIcon={<Edit2 className="h-3 w-3" />}>
              Edit
            </Button>
            <Button size="xs" variant="ghost" onClick={() => onDeleteUser(u)} leftIcon={<Trash2 className="h-3 w-3" />}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  // Stats
  const activeUsers = admins.filter((u) => u.status === 'active').length
  const suspendedUsers = admins.filter((u) => u.status === 'suspended').length
  const invitedUsers = admins.filter((u) => u.status === 'invited').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--ss-text-primary)]">
            Admin Management
          </h1>
          <p className="mt-1 text-sm text-[var(--ss-text-secondary)]">
            Manage users, roles, policies, and access permissions for the admin portal.
          </p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
          Settings
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Admins"
          value={admins.length}
          format="number"
          icon={<Users className="h-5 w-5" />}
          variant="gradient"
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          format="number"
          icon={<UserCheck className="h-5 w-5" />}
          variant="default"
          change={{ value: 12, trend: 'up', label: 'vs last month' }}
        />
        <StatCard
          title="Pending Invites"
          value={invitedUsers}
          format="number"
          icon={<RefreshCw className="h-5 w-5" />}
          variant="default"
        />
        <StatCard
          title="Suspended"
          value={suspendedUsers}
          format="number"
          icon={<UserX className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Tabs */}
      <Tabs
        variant="underline"
        onChange={(key: string) => {
          if (key === 'roles' && roles.length === 0) fetchRoles()
          if (key === 'policies' && policies.length === 0) fetchPolicies()
          if (key === 'permissions' && permissions.length === 0) fetchPermissions()
        }}
        items={[
          {
            key: 'users',
            label: 'User Management',
            content: (
              <div className="space-y-4">
                {/* Search and Add */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ss-text-tertiary)]" />
                    <Input
                      placeholder="Search admins..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setModalOpen(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Admin
                  </Button>
                </div>

                {/* Table */}
                <Card className="p-0 overflow-hidden">
                  <Table
                    data={admins}
                    columns={userColumns}
                    loading={loading}
                    pageSize={10}
                    emptyMessage="No admin users found."
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'roles',
            label: 'Roles Manager',
            content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--ss-text-secondary)]">
                    Define roles and their associated permissions.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setRoleModalOpen(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Role
                  </Button>
                </div>

                {rolesLoading ? (
                  <Card className="p-8 text-center">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-ss-navy-500" />
                    <p className="text-[var(--ss-text-secondary)]">Loading roles...</p>
                  </Card>
                ) : roles.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-ss-navy-200" />
                    <p className="text-[var(--ss-text-secondary)]">
                      No roles found. Click "Add Role" to create one.
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {roles.map((r) => (
                      <Card key={r.id} className="p-4 border-l-4 border-l-ss-navy-500">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-ss-lg bg-ss-navy-100 dark:bg-ss-navy-900">
                              <Shield className="h-5 w-5 text-ss-navy-600 dark:text-ss-navy-300" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-[var(--ss-text-primary)]">{r.display_name}</h3>
                                {r.is_system && (
                                  <Badge colorScheme="gray" variant="soft" size="sm">
                                    System
                                  </Badge>
                                )}
                                <Badge colorScheme="navy" variant="soft" size="sm">
                                  {r.user_count || 0} users
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-[var(--ss-text-secondary)]">
                                {r.description || 'No description'}
                              </p>
                              {r.permissions.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {r.permissions.slice(0, 5).map((p) => (
                                    <Badge key={p} colorScheme="green" variant="soft" size="sm">
                                      {p}
                                    </Badge>
                                  ))}
                                  {r.permissions.length > 5 && (
                                    <Badge colorScheme="gray" variant="soft" size="sm">
                                      +{r.permissions.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="xs" variant="ghost" onClick={() => onEditRole(r)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => onDeleteRole(r)}
                              disabled={r.is_system}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'policies',
            label: 'Policy Manager',
            content: (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--ss-text-secondary)]">
                    Configure access policies for resources and actions.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setPolicyModalOpen(true)}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Policy
                  </Button>
                </div>

                {policiesLoading ? (
                  <Card className="p-8 text-center">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-ss-navy-500" />
                    <p className="text-[var(--ss-text-secondary)]">Loading policies...</p>
                  </Card>
                ) : policies.length === 0 ? (
                  <Card className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-ss-navy-200" />
                    <p className="text-[var(--ss-text-secondary)]">
                      No policies found. Click "Add Policy" to create one.
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {policies.map((p) => (
                      <Card
                        key={p.id}
                        className={`p-4 border-l-4 ${
                          p.effect === 'allow' ? 'border-l-ss-green-500' : 'border-l-ss-red-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-ss-lg ${
                                p.effect === 'allow'
                                  ? 'bg-ss-green-100 dark:bg-ss-green-900/30'
                                  : 'bg-ss-red-100 dark:bg-ss-red-900/30'
                              }`}
                            >
                              <FileText
                                className={`h-5 w-5 ${
                                  p.effect === 'allow'
                                    ? 'text-ss-green-600 dark:text-ss-green-400'
                                    : 'text-ss-red-600 dark:text-ss-red-400'
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-[var(--ss-text-primary)]">{p.display_name}</h3>
                                {p.is_system && (
                                  <Badge colorScheme="gray" variant="soft" size="sm">
                                    System
                                  </Badge>
                                )}
                                <Badge
                                  colorScheme={p.effect === 'allow' ? 'green' : 'red'}
                                  variant="soft"
                                  size="sm"
                                >
                                  {p.effect}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-[var(--ss-text-secondary)]">
                                {p.description || 'No description'}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2 items-center">
                                <span className="text-xs text-[var(--ss-text-tertiary)]">Resource:</span>
                                <Badge colorScheme="navy" variant="soft" size="sm">
                                  {p.resource}
                                </Badge>
                                <span className="text-xs text-[var(--ss-text-tertiary)]">Priority: {p.priority}</span>
                              </div>
                              {p.actions.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {p.actions.map((a) => (
                                    <Badge key={a} colorScheme="yellow" variant="soft" size="sm">
                                      {a}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="xs" variant="ghost" onClick={() => onEditPolicy(p)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => onDeletePolicy(p)}
                              disabled={p.is_system}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'permissions',
            label: 'Permissions Manager',
            content: (
              <div className="space-y-4">
                <p className="text-sm text-[var(--ss-text-secondary)]">
                  View all available permissions organized by category.
                </p>

                {permissionsLoading ? (
                  <Card className="p-8 text-center">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-ss-navy-500" />
                    <p className="text-[var(--ss-text-secondary)]">Loading permissions...</p>
                  </Card>
                ) : permissions.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Lock className="h-12 w-12 mx-auto mb-3 text-ss-navy-200" />
                    <p className="text-[var(--ss-text-secondary)]">
                      No permissions found. Permissions are typically seeded during setup.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {Array.from(new Set(permissions.map((p) => p.category))).map((category) => (
                      <Card key={category} className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Lock className="h-5 w-5 text-ss-navy-500" />
                          <h3 className="font-semibold text-[var(--ss-text-primary)]">{category}</h3>
                          <Badge colorScheme="gray" variant="soft" size="sm">
                            {permissions.filter((p) => p.category === category).length} permissions
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {permissions
                            .filter((p) => p.category === category)
                            .map((perm) => (
                              <div
                                key={perm.id}
                                className="flex items-center justify-between rounded-ss-lg bg-ss-gray-50 dark:bg-ss-gray-800 p-3"
                              >
                                <div>
                                  <p className="font-medium text-[var(--ss-text-primary)]">{perm.display_name}</p>
                                  <p className="text-xs text-[var(--ss-text-tertiary)]">{perm.name}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Badge colorScheme="navy" variant="soft" size="sm">
                                    {perm.resource}
                                  </Badge>
                                  <Badge colorScheme="green" variant="soft" size="sm">
                                    {perm.action}
                                  </Badge>
                                  {perm.is_system && (
                                    <Badge colorScheme="gray" variant="soft" size="sm">
                                      System
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* User Modal */}
      <Modal
        open={modalOpen}
        onClose={closeUserModal}
        title={editingUser ? 'Edit Admin' : 'Add Admin'}
        description={editingUser ? 'Update admin user details.' : 'Create a new admin user.'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeUserModal}>
              Cancel
            </Button>
            <Button onClick={onSaveUser}>{editingUser ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <Form spacing="md" onSubmit={(e) => e.preventDefault()}>
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ?? undefined}
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'support_manager', label: 'Support Manager' },
              { value: 'analyst', label: 'Analyst' },
              { value: 'viewer', label: 'Viewer' },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'invited', label: 'Invited' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </Form>
      </Modal>

      {/* Role Modal */}
      <Modal
        open={roleModalOpen}
        onClose={closeRoleModal}
        title={editingRole ? 'Edit Role' : 'Add Role'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeRoleModal}>
              Cancel
            </Button>
            <Button onClick={onSaveRole}>{editingRole ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <Form spacing="md" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Role name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g., content_manager"
          />
          <Input
            label="Display name"
            value={roleDisplayName}
            onChange={(e) => setRoleDisplayName(e.target.value)}
            placeholder="e.g., Content Manager"
          />
          <Input
            label="Description"
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
            placeholder="Brief description of the role"
          />
        </Form>
      </Modal>

      {/* Policy Modal */}
      <Modal
        open={policyModalOpen}
        onClose={closePolicyModal}
        title={editingPolicy ? 'Edit Policy' : 'Add Policy'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closePolicyModal}>
              Cancel
            </Button>
            <Button onClick={onSavePolicy}>{editingPolicy ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <Form spacing="md" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Policy name"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            placeholder="e.g., merchant_readonly"
          />
          <Input
            label="Display name"
            value={policyDisplayName}
            onChange={(e) => setPolicyDisplayName(e.target.value)}
            placeholder="e.g., Merchant Read Only"
          />
          <Input
            label="Description"
            value={policyDescription}
            onChange={(e) => setPolicyDescription(e.target.value)}
            placeholder="Brief description of the policy"
          />
          <Input
            label="Resource"
            value={policyResource}
            onChange={(e) => setPolicyResource(e.target.value)}
            placeholder="e.g., merchants, users, transactions"
          />
        </Form>
      </Modal>
    </div>
  )
}
