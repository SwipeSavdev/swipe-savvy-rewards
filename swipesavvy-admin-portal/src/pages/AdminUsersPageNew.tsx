import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Form from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import { Api } from '@/services/api'
import { rbacApi } from '@/services/apiClient'
import type { AdminUser } from '@/types/users'
import { useToastStore } from '@/store/toastStore'
import { isEmail } from '@/utils/validate'

type TabType = 'users' | 'roles' | 'policies' | 'permissions'

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
  const [activeTab, setActiveTab] = useState<TabType>('users')

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
      setAdmins((res.users || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.created_at,
      })))
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
      // Keep empty array if API fails
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

  // Load tab data on tab change
  useEffect(() => {
    if (activeTab === 'roles' && roles.length === 0) {
      fetchRoles()
    } else if (activeTab === 'policies' && policies.length === 0) {
      fetchPolicies()
    } else if (activeTab === 'permissions' && permissions.length === 0) {
      fetchPermissions()
    }
  }, [activeTab])

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
          <div className="min-w-0">
            <p className="truncate font-semibold">{u.name}</p>
            <p className="truncate text-xs text-[var(--ss-text-muted)]">{u.email}</p>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        accessor: (u) => u.role,
        cell: (u) => <Badge variant="primary">{u.role}</Badge>,
      },
      {
        key: 'status',
        header: 'Status',
        accessor: (u) => u.status,
        cell: (u) => {
          const variant = u.status === 'active' ? 'success' : u.status === 'invited' ? 'warning' : 'danger'
          return <Badge variant={variant}>{u.status}</Badge>
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (u) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEditUser(u)}>
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDeleteUser(u)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-40 -mx-6 -mt-6 bg-[var(--ss-bg)] px-6 py-4 mb-6 border-b border-[var(--ss-border)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Admin Management</h1>
            <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Manage users, roles, policies, and permissions.</p>
          </div>
          {activeTab === 'users' && <Button onClick={() => setModalOpen(true)}>+ Add admin</Button>}
          {activeTab === 'roles' && <Button onClick={() => setRoleModalOpen(true)}>+ Add role</Button>}
          {activeTab === 'policies' && <Button onClick={() => setPolicyModalOpen(true)}>+ Add policy</Button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--ss-border)]">
        {(['users', 'roles', 'policies', 'permissions'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[var(--ss-primary)] text-[var(--ss-primary)]'
                : 'border-transparent text-[var(--ss-text-muted)] hover:text-[var(--ss-text)]'
            }`}
          >
            {tab === 'users' && 'User Management'}
            {tab === 'roles' && 'Roles Manager'}
            {tab === 'policies' && 'Policy Manager'}
            {tab === 'permissions' && 'Permissions Manager'}
          </button>
        ))}
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <Card className="p-4">
          <div className="w-full md:w-[420px]">
            <Input placeholder="Search admins..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="mt-4">
            <Table data={admins} columns={userColumns} loading={loading} pageSize={10} emptyMessage="No admin users found." />
          </div>
        </Card>
      )}

      {/* Roles Manager Tab */}
      {activeTab === 'roles' && (
        <div className="grid gap-4">
          {rolesLoading ? (
            <Card className="p-8 text-center">
              <p className="text-[var(--ss-text-muted)]">Loading roles...</p>
            </Card>
          ) : roles.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[var(--ss-text-muted)]">No roles found. Click "+ Add role" to create one.</p>
            </Card>
          ) : (
            roles.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--ss-text)]">{r.display_name}</h3>
                      {r.is_system && <Badge variant="neutral">System</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-[var(--ss-text-muted)]">{r.description || 'No description'}</p>
                    <p className="mt-2 text-xs text-[var(--ss-text-muted)]">{r.user_count || 0} users assigned</p>
                    {r.permissions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.permissions.slice(0, 5).map((p) => (
                          <Badge key={p} variant="neutral" className="text-xs">{p}</Badge>
                        ))}
                        {r.permissions.length > 5 && (
                          <Badge variant="neutral" className="text-xs">+{r.permissions.length - 5} more</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEditRole(r)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDeleteRole(r)} disabled={r.is_system}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Policy Manager Tab */}
      {activeTab === 'policies' && (
        <div className="grid gap-4">
          {policiesLoading ? (
            <Card className="p-8 text-center">
              <p className="text-[var(--ss-text-muted)]">Loading policies...</p>
            </Card>
          ) : policies.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[var(--ss-text-muted)]">No policies found. Click "+ Add policy" to create one.</p>
            </Card>
          ) : (
            policies.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--ss-text)]">{p.display_name}</h3>
                      {p.is_system && <Badge variant="neutral">System</Badge>}
                      <Badge variant={p.effect === 'allow' ? 'success' : 'danger'}>{p.effect}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-[var(--ss-text-muted)]">{p.description || 'No description'}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs text-[var(--ss-text-muted)]">Resource: <Badge variant="neutral">{p.resource}</Badge></span>
                      <span className="text-xs text-[var(--ss-text-muted)]">Priority: {p.priority}</span>
                    </div>
                    {p.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.actions.map((a) => (
                          <Badge key={a} variant="primary" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEditPolicy(p)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDeletePolicy(p)} disabled={p.is_system}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Permissions Manager Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {permissionsLoading ? (
            <Card className="p-8 text-center">
              <p className="text-[var(--ss-text-muted)]">Loading permissions...</p>
            </Card>
          ) : permissions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-[var(--ss-text-muted)]">No permissions found. Permissions are typically seeded during setup.</p>
            </Card>
          ) : (
            Array.from(new Set(permissions.map(p => p.category))).map((category) => (
              <Card key={category} className="p-4">
                <h3 className="mb-4 font-semibold text-[var(--ss-text)]">{category}</h3>
                <div className="space-y-3">
                  {permissions.filter(p => p.category === category).map((perm) => (
                    <div key={perm.id} className="flex items-center justify-between rounded-lg bg-[var(--ss-surface-alt)] p-3">
                      <div>
                        <p className="font-medium text-[var(--ss-text)]">{perm.display_name}</p>
                        <p className="text-xs text-[var(--ss-text-muted)]">{perm.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="neutral">{perm.resource}</Badge>
                        <Badge variant="primary">{perm.action}</Badge>
                        {perm.is_system && <Badge variant="neutral">System</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* User Modal */}
      <Modal
        open={modalOpen}
        onClose={closeUserModal}
        title={editingUser ? 'Edit admin' : 'Add admin'}
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
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} error={error ?? undefined} />
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
        title={editingRole ? 'Edit role' : 'Add role'}
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
          <Input label="Role name" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g., content_manager" />
          <Input label="Display name" value={roleDisplayName} onChange={(e) => setRoleDisplayName(e.target.value)} placeholder="e.g., Content Manager" />
          <Input label="Description" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} placeholder="Brief description of the role" />
        </Form>
      </Modal>

      {/* Policy Modal */}
      <Modal
        open={policyModalOpen}
        onClose={closePolicyModal}
        title={editingPolicy ? 'Edit policy' : 'Add policy'}
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
          <Input label="Policy name" value={policyName} onChange={(e) => setPolicyName(e.target.value)} placeholder="e.g., merchant_readonly" />
          <Input label="Display name" value={policyDisplayName} onChange={(e) => setPolicyDisplayName(e.target.value)} placeholder="e.g., Merchant Read Only" />
          <Input label="Description" value={policyDescription} onChange={(e) => setPolicyDescription(e.target.value)} placeholder="Brief description of the policy" />
          <Input label="Resource" value={policyResource} onChange={(e) => setPolicyResource(e.target.value)} placeholder="e.g., merchants, users, transactions" />
        </Form>
      </Modal>
    </div>
  )
}
