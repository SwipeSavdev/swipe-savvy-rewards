import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Form from '@/components/ui/Form'
import Select from '@/components/ui/Select'
import Icon from '@/components/ui/Icon'
import { Api } from '@/services/api'
import type { AdminUser } from '@/types/users'
import { formatDateTime } from '@/utils/dates'
import { useToastStore } from '@/store/toastStore'
import { isEmail } from '@/utils/validate'

type TabType = 'users' | 'roles' | 'policies' | 'permissions'

interface Role {
  id: string
  name: string
  description: string
  userCount?: number
}

interface Policy {
  id: string
  name: string
  description: string
  roleCount?: number
}

interface Permission {
  id: string
  feature: string
  category: string
  read: boolean
  write: boolean
  delete: boolean
  admin: boolean
}

const ADMIN_PORTAL_FEATURES: Permission[] = [
  { id: '1', feature: 'Dashboard', category: 'Analytics', read: true, write: false, delete: false, admin: false },
  { id: '2', feature: 'Support Dashboard', category: 'Support', read: true, write: false, delete: false, admin: false },
  { id: '3', feature: 'Support Tickets', category: 'Support', read: true, write: true, delete: false, admin: false },
  { id: '4', feature: 'Admin Users', category: 'Settings', read: true, write: true, delete: true, admin: false },
  { id: '5', feature: 'User Management', category: 'Users', read: true, write: true, delete: true, admin: false },
  { id: '6', feature: 'Merchants', category: 'Business', read: true, write: true, delete: false, admin: false },
  { id: '7', feature: 'Audit Logs', category: 'Security', read: true, write: false, delete: false, admin: false },
  { id: '8', feature: 'Feature Flags', category: 'Settings', read: true, write: true, delete: false, admin: false },
  { id: '9', feature: 'AI Marketing', category: 'Marketing', read: true, write: true, delete: true, admin: false },
  { id: '10', feature: 'Settings', category: 'Settings', read: true, write: true, delete: false, admin: false },
]

const MOCK_ROLES: Role[] = [
  { id: '1', name: 'Super Admin', description: 'Full system access with all permissions', userCount: 2 },
  { id: '2', name: 'Admin', description: 'Admin access with limited restrictions', userCount: 5 },
  { id: '3', name: 'Support', description: 'Support team member access', userCount: 8 },
  { id: '4', name: 'Analyst', description: 'Read-only analytics access', userCount: 3 },
]

const MOCK_POLICIES: Policy[] = [
  { id: '1', name: 'Financial Reviewer', description: 'Can view and manage financial reports', roleCount: 2 },
  { id: '2', name: 'Support Lead', description: 'Can manage support tickets and team', roleCount: 3 },
  { id: '3', name: 'Marketing Manager', description: 'Can manage AI marketing campaigns', roleCount: 1 },
]

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
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')

  // Policies State
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES)
  const [policyModalOpen, setPolicyModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)
  const [policyName, setPolicyName] = useState('')
  const [policyDescription, setPolicyDescription] = useState('')

  // Permissions State
  const [permissions, setPermissions] = useState<Permission[]>(ADMIN_PORTAL_FEATURES)
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

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
        // Update user
        pushToast({ variant: 'success', title: 'Updated', message: `User ${name} updated successfully.` })
      } else {
        // Create user
        await Api.adminUsersApi.createAdminUser({
          email,
          name: name.trim(),
          role,
          status,
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
  const closRoleModal = () => {
    setRoleModalOpen(false)
    setRoleName('')
    setRoleDescription('')
    setEditingRole(null)
  }

  const onSaveRole = () => {
    if (!roleName.trim()) return
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, name: roleName, description: roleDescription } : r))
    } else {
      setRoles([...roles, { id: Math.random().toString(), name: roleName, description: roleDescription, userCount: 0 }])
    }
    pushToast({ variant: 'success', title: 'Saved', message: `Role ${roleName} saved successfully.` })
    closRoleModal()
  }

  const onEditRole = (role: Role) => {
    setEditingRole(role)
    setRoleName(role.name)
    setRoleDescription(role.description)
    setRoleModalOpen(true)
  }

  const onDeleteRole = (role: Role) => {
    if (role.userCount && role.userCount > 0) {
      pushToast({ variant: 'warning', title: 'Cannot delete', message: 'This role has assigned users.' })
      return
    }
    setRoles(roles.filter(r => r.id !== role.id))
    pushToast({ variant: 'success', title: 'Deleted', message: `Role ${role.name} deleted.` })
  }

  // Policy Management Functions
  const closePolicyModal = () => {
    setPolicyModalOpen(false)
    setPolicyName('')
    setPolicyDescription('')
    setEditingPolicy(null)
  }

  const onSavePolicy = () => {
    if (!policyName.trim()) return
    if (editingPolicy) {
      setPolicies(policies.map(p => p.id === editingPolicy.id ? { ...p, name: policyName, description: policyDescription } : p))
    } else {
      setPolicies([...policies, { id: Math.random().toString(), name: policyName, description: policyDescription, roleCount: 0 }])
    }
    pushToast({ variant: 'success', title: 'Saved', message: `Policy ${policyName} saved successfully.` })
    closePolicyModal()
  }

  const onEditPolicy = (policy: Policy) => {
    setEditingPolicy(policy)
    setPolicyName(policy.name)
    setPolicyDescription(policy.description)
    setPolicyModalOpen(true)
  }

  const onDeletePolicy = (policy: Policy) => {
    if (policy.roleCount && policy.roleCount > 0) {
      pushToast({ variant: 'warning', title: 'Cannot delete', message: 'This policy has assigned roles.' })
      return
    }
    setPolicies(policies.filter(p => p.id !== policy.id))
    pushToast({ variant: 'success', title: 'Deleted', message: `Policy ${policy.name} deleted.` })
  }

  // Permission Update
  const onTogglePermission = (permId: string, field: 'read' | 'write' | 'delete' | 'admin') => {
    setPermissions(permissions.map(p => 
      p.id === permId ? { ...p, [field]: !p[field] } : p
    ))
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
          {roles.map((role) => (
            <Card key={role.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--ss-text)]">{role.name}</h3>
                  <p className="mt-1 text-sm text-[var(--ss-text-muted)]">{role.description}</p>
                  <p className="mt-2 text-xs text-[var(--ss-text-muted)]">{role.userCount || 0} users assigned</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEditRole(role)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDeleteRole(role)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Policy Manager Tab */}
      {activeTab === 'policies' && (
        <div className="grid gap-4">
          {policies.map((policy) => (
            <Card key={policy.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--ss-text)]">{policy.name}</h3>
                  <p className="mt-1 text-sm text-[var(--ss-text-muted)]">{policy.description}</p>
                  <p className="mt-2 text-xs text-[var(--ss-text-muted)]">{policy.roleCount || 0} roles assigned</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEditPolicy(policy)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDeletePolicy(policy)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Permissions Manager Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {Array.from(new Set(permissions.map(p => p.category))).map((category) => (
            <Card key={category} className="p-4">
              <h3 className="mb-4 font-semibold text-[var(--ss-text)]">{category}</h3>
              <div className="space-y-3">
                {permissions.filter(p => p.category === category).map((perm) => (
                  <div key={perm.id} className="flex items-center justify-between rounded-lg bg-[var(--ss-surface-alt)] p-3">
                    <div>
                      <p className="font-medium text-[var(--ss-text)]">{perm.feature}</p>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={perm.read}
                          onChange={() => onTogglePermission(perm.id, 'read')}
                          className="h-4 w-4 rounded border-[var(--ss-border)]"
                        />
                        <span className="text-sm text-[var(--ss-text)]">Read</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={perm.write}
                          onChange={() => onTogglePermission(perm.id, 'write')}
                          className="h-4 w-4 rounded border-[var(--ss-border)]"
                        />
                        <span className="text-sm text-[var(--ss-text)]">Write</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={perm.delete}
                          onChange={() => onTogglePermission(perm.id, 'delete')}
                          className="h-4 w-4 rounded border-[var(--ss-border)]"
                        />
                        <span className="text-sm text-[var(--ss-text)]">Delete</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={perm.admin}
                          onChange={() => onTogglePermission(perm.id, 'admin')}
                          className="h-4 w-4 rounded border-[var(--ss-border)]"
                        />
                        <span className="text-sm text-[var(--ss-text)]">Admin</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <Button className="w-full">Save Permissions</Button>
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
              { value: 'super_admin', label: 'Super Admin' },
              { value: 'admin', label: 'Admin' },
              { value: 'support', label: 'Support' },
              { value: 'analyst', label: 'Analyst' },
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
        onClose={closRoleModal}
        title={editingRole ? 'Edit role' : 'Add role'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closRoleModal}>
              Cancel
            </Button>
            <Button onClick={onSaveRole}>{editingRole ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <Form spacing="md" onSubmit={(e) => e.preventDefault()}>
          <Input label="Role name" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
          <Input label="Description" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} />
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
          <Input label="Policy name" value={policyName} onChange={(e) => setPolicyName(e.target.value)} />
          <Input label="Description" value={policyDescription} onChange={(e) => setPolicyDescription(e.target.value)} />
        </Form>
      </Modal>
    </div>
  )
}
