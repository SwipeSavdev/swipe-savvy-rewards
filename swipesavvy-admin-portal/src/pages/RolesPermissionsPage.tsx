import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { type TableColumn } from '@/components/ui/Table'
import { useToastStore } from '@/store/toastStore'
import { useMemo, useState } from 'react'

interface Permission {
  id: string
  key: string
  label: string
  description: string
  resource: string
  action: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  usersCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

interface Policy {
  id: string
  name: string
  description: string
  rules: PolicyRule[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PolicyRule {
  condition: string
  effect: 'allow' | 'deny'
  resources: string[]
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'perm-001',
    key: 'auth.login',
    label: 'Login',
    description: 'Allow user login to the application',
    resource: 'Authentication',
    action: 'login',
  },
  {
    id: 'perm-002',
    key: 'auth.logout',
    label: 'Logout',
    description: 'Allow user logout',
    resource: 'Authentication',
    action: 'logout',
  },
  {
    id: 'perm-003',
    key: 'auth.mfa',
    label: 'Multi-Factor Authentication',
    description: 'Enable MFA setup and management',
    resource: 'Authentication',
    action: 'manage_mfa',
  },
  {
    id: 'perm-004',
    key: 'accounts.view',
    label: 'View Accounts',
    description: 'View account information',
    resource: 'Account Management',
    action: 'view',
  },
  {
    id: 'perm-005',
    key: 'accounts.create',
    label: 'Create Accounts',
    description: 'Create new accounts',
    resource: 'Account Management',
    action: 'create',
  },
  {
    id: 'perm-006',
    key: 'accounts.edit',
    label: 'Edit Accounts',
    description: 'Edit account details',
    resource: 'Account Management',
    action: 'edit',
  },
  {
    id: 'perm-007',
    key: 'accounts.delete',
    label: 'Delete Accounts',
    description: 'Delete accounts',
    resource: 'Account Management',
    action: 'delete',
  },
  {
    id: 'perm-008',
    key: 'transfers.view',
    label: 'View Transfers',
    description: 'View transfer history',
    resource: 'Transfers',
    action: 'view',
  },
  {
    id: 'perm-009',
    key: 'transfers.send',
    label: 'Send Transfers',
    description: 'Send money transfers',
    resource: 'Transfers',
    action: 'send',
  },
  {
    id: 'perm-010',
    key: 'transfers.approve',
    label: 'Approve Transfers',
    description: 'Approve pending transfers',
    resource: 'Transfers',
    action: 'approve',
  },
  {
    id: 'perm-011',
    key: 'ai_concierge.access',
    label: 'AI Concierge Access',
    description: 'Access AI concierge service',
    resource: 'AI Concierge',
    action: 'access',
  },
  {
    id: 'perm-012',
    key: 'ai_concierge.admin',
    label: 'AI Concierge Admin',
    description: 'Manage AI concierge settings',
    resource: 'AI Concierge',
    action: 'admin',
  },
  {
    id: 'perm-013',
    key: 'profile.view',
    label: 'View Profile',
    description: 'View profile information',
    resource: 'Profile',
    action: 'view',
  },
  {
    id: 'perm-014',
    key: 'profile.edit',
    label: 'Edit Profile',
    description: 'Edit profile information',
    resource: 'Profile',
    action: 'edit',
  },
  {
    id: 'perm-015',
    key: 'rewards.view',
    label: 'View Rewards',
    description: 'View rewards and points',
    resource: 'Rewards',
    action: 'view',
  },
  {
    id: 'perm-016',
    key: 'rewards.redeem',
    label: 'Redeem Rewards',
    description: 'Redeem rewards',
    resource: 'Rewards',
    action: 'redeem',
  },
  {
    id: 'perm-017',
    key: 'marketing.view',
    label: 'View Marketing',
    description: 'View marketing campaigns',
    resource: 'Marketing',
    action: 'view',
  },
  {
    id: 'perm-018',
    key: 'marketing.manage',
    label: 'Manage Marketing',
    description: 'Manage marketing campaigns',
    resource: 'Marketing',
    action: 'manage',
  },
  {
    id: 'perm-019',
    key: 'support.submit',
    label: 'Submit Support Tickets',
    description: 'Submit support tickets',
    resource: 'Support',
    action: 'submit',
  },
  {
    id: 'perm-020',
    key: 'support.manage',
    label: 'Manage Support',
    description: 'Manage support tickets',
    resource: 'Support',
    action: 'manage',
  },
  {
    id: 'perm-021',
    key: 'charity.donate',
    label: 'Donate to Charity',
    description: 'Donate to charity organizations',
    resource: 'Donations',
    action: 'donate',
  },
  {
    id: 'perm-022',
    key: 'charity.manage',
    label: 'Manage Charities',
    description: 'Manage charity organizations',
    resource: 'Donations',
    action: 'manage',
  },
]

const MOCK_ROLES: Role[] = [
  {
    id: 'role-001',
    name: 'Super Admin',
    description: 'Full system access and control',
    permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
    usersCount: 2,
    isSystem: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'role-002',
    name: 'Admin',
    description: 'Administrative access to most features',
    permissions: AVAILABLE_PERMISSIONS.filter((p) => !p.key.includes('delete')).map((p) => p.id),
    usersCount: 5,
    isSystem: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'role-003',
    name: 'Support Agent',
    description: 'Handle customer support and inquiries',
    permissions: [
      'perm-001',
      'perm-004',
      'perm-008',
      'perm-013',
      'perm-015',
      'perm-019',
      'perm-020',
    ],
    usersCount: 12,
    isSystem: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'role-004',
    name: 'Merchant',
    description: 'Merchant account access',
    permissions: [
      'perm-001',
      'perm-004',
      'perm-006',
      'perm-008',
      'perm-013',
      'perm-014',
      'perm-015',
      'perm-017',
    ],
    usersCount: 45,
    isSystem: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'role-005',
    name: 'User',
    description: 'Standard user access',
    permissions: [
      'perm-001',
      'perm-004',
      'perm-008',
      'perm-009',
      'perm-013',
      'perm-014',
      'perm-015',
      'perm-016',
      'perm-017',
      'perm-019',
      'perm-021',
    ],
    usersCount: 1250,
    isSystem: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
]

const MOCK_POLICIES: Policy[] = [
  {
    id: 'policy-001',
    name: 'Default Access Policy',
    description: 'Standard access policy for all users',
    rules: [
      {
        condition: 'role:user',
        effect: 'allow',
        resources: ['auth:*', 'accounts:*', 'profile:*'],
      },
    ],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'policy-002',
    name: 'Enhanced Security Policy',
    description: 'Enforces MFA and additional security measures',
    rules: [
      {
        condition: 'ip_not_whitelisted',
        effect: 'deny',
        resources: ['transfers:*', 'rewards:redeem'],
      },
      {
        condition: 'mfa_enabled',
        effect: 'allow',
        resources: ['transfers:approve', 'admin:*'],
      },
    ],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
  {
    id: 'policy-003',
    name: 'Data Protection Policy',
    description: 'Ensures user data protection and privacy',
    rules: [
      {
        condition: 'gdpr_compliant',
        effect: 'allow',
        resources: ['profile:view', 'data:export'],
      },
      {
        condition: 'consent_required',
        effect: 'deny',
        resources: ['marketing:*'],
      },
    ],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  },
]

export default function RolesPermissionsPage() {
  const pushToast = useToastStore((s) => s.push)
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'policies'>('roles')
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES)
  const [query, setQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedPermissions: [] as string[],
  })

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query.toLowerCase()) ||
        role.description.toLowerCase().includes(query.toLowerCase()),
    )
  }, [roles, query])

  const filteredPolicies = useMemo(() => {
    return policies.filter(
      (policy) =>
        policy.name.toLowerCase().includes(query.toLowerCase()) ||
        policy.description.toLowerCase().includes(query.toLowerCase()),
    )
  }, [policies, query])

  const handleCreateRole = () => {
    setSelectedRole(null)
    setFormData({ name: '', description: '', selectedPermissions: [] })
    setShowRoleModal(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      selectedPermissions: role.permissions,
    })
    setShowRoleModal(true)
  }

  const handleSaveRole = () => {
    if (!formData.name.trim()) {
      pushToast({
        variant: 'error',
        title: 'Validation Error',
        message: 'Role name is required',
      })
      return
    }

    if (selectedRole) {
      setRoles(
        roles.map((r) =>
          r.id === selectedRole.id
            ? {
                ...r,
                name: formData.name,
                description: formData.description,
                permissions: formData.selectedPermissions,
                updatedAt: new Date().toISOString(),
              }
            : r,
        ),
      )
      pushToast({
        variant: 'success',
        title: 'Role Updated',
        message: `${formData.name} has been updated successfully.`,
      })
    } else {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        permissions: formData.selectedPermissions,
        usersCount: 0,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setRoles([...roles, newRole])
      pushToast({
        variant: 'success',
        title: 'Role Created',
        message: `${formData.name} has been created successfully.`,
      })
    }

    setShowRoleModal(false)
  }

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (role?.isSystem) {
      pushToast({
        variant: 'error',
        title: 'Cannot Delete',
        message: 'System roles cannot be deleted.',
      })
      return
    }

    setRoles(roles.filter((r) => r.id !== roleId))
    pushToast({
      variant: 'success',
      title: 'Role Deleted',
      message: 'Role has been deleted successfully.',
    })
  }

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter((p) => p !== permissionId)
        : [...prev.selectedPermissions, permissionId],
    }))
  }

  const roleColumns: TableColumn<Role>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Role Name',
        sortable: true,
        accessor: (r) => r.name,
        cell: (r) => (
          <div className="min-w-0">
            <p className="font-semibold">{r.name}</p>
            <p className="text-xs text-[var(--ss-text-muted)]">{r.description}</p>
          </div>
        ),
      },
      {
        key: 'permissions',
        header: 'Permissions',
        accessor: (r) => r.permissions.length,
        cell: (r) => (
          <span className="inline-flex items-center rounded-full bg-[var(--ss-surface-alt)] px-3 py-1 text-sm font-medium">
            {r.permissions.length} permissions
          </span>
        ),
      },
      {
        key: 'usersCount',
        header: 'Users',
        sortable: true,
        accessor: (r) => r.usersCount,
        cell: (r) => <span className="font-medium">{r.usersCount}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        accessor: (r) => (r.isSystem ? 'system' : 'custom'),
        cell: (r) => (
          <Badge variant={r.isSystem ? 'neutral' : 'success'}>
            {r.isSystem ? 'System' : 'Custom'}
          </Badge>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        accessor: () => 'actions',
        cell: (r) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditRole(r)}
            >
              Edit
            </Button>
            {!r.isSystem && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteRole(r.id)}
              >
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ],
    [],
  )

  const policyColumns: TableColumn<Policy>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Policy Name',
        accessor: (p) => p.name,
        cell: (p) => (
          <div className="min-w-0">
            <p className="font-semibold">{p.name}</p>
            <p className="text-xs text-[var(--ss-text-muted)]">{p.description}</p>
          </div>
        ),
      },
      {
        key: 'rules',
        header: 'Rules',
        accessor: (p) => p.rules.length,
        cell: (p) => (
          <span className="text-sm font-medium">{p.rules.length} rules</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        accessor: (p) => (p.isActive ? 'active' : 'inactive'),
        cell: (p) => (
          <Badge variant={p.isActive ? 'success' : 'neutral'}>
            {p.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [],
  )

  const getPermissionLabel = (permId: string) => {
    return AVAILABLE_PERMISSIONS.find((p) => p.id === permId)?.label || permId
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--ss-text-primary)]">
          Roles & Permissions
        </h1>
        <p className="mt-2 text-[var(--ss-text-muted)]">
          Manage user roles, permissions, and access control policies
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--ss-border)]">
        {(['roles', 'permissions', 'policies'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-[var(--ss-primary)] text-[var(--ss-primary)]'
                : 'text-[var(--ss-text-muted)] hover:text-[var(--ss-text-secondary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <Input
          placeholder={`Search ${activeTab}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        {activeTab === 'roles' && (
          <Button onClick={handleCreateRole}>Create Role</Button>
        )}
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--ss-border)] bg-[var(--ss-surface-alt)]">
                <tr>
                  {roleColumns.map((col) => (
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
                {filteredRoles.map((role, idx) => (
                  <tr
                    key={role.id || idx}
                    className="hover:bg-[var(--ss-surface-alt)] transition-colors"
                  >
                    {roleColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm">
                        {col.cell ? col.cell(role) : col.accessor ? col.accessor(role) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {Array.from(new Set(AVAILABLE_PERMISSIONS.map((p) => p.resource))).map(
            (resource) => (
              <Card key={resource} className="p-4">
                <h3 className="mb-4 text-lg font-semibold">{resource}</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {AVAILABLE_PERMISSIONS.filter((p) => p.resource === resource).map(
                    (perm) => (
                      <div key={perm.id} className="flex items-start gap-3 rounded-lg border border-[var(--ss-border)] p-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{perm.label}</p>
                          <p className="text-xs text-[var(--ss-text-muted)]">
                            {perm.description}
                          </p>
                          <code className="mt-1 text-xs bg-[var(--ss-surface-alt)] px-2 py-1 rounded block w-fit">
                            {perm.key}
                          </code>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </Card>
            ),
          )}
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[var(--ss-border)] bg-[var(--ss-surface-alt)]">
                <tr>
                  {policyColumns.map((col) => (
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
                {filteredPolicies.map((policy, idx) => (
                  <tr
                    key={policy.id || idx}
                    className="hover:bg-[var(--ss-surface-alt)] transition-colors"
                  >
                    {policyColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm">
                        {col.cell ? col.cell(policy) : col.accessor ? col.accessor(policy) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Role Modal */}
      <Modal
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={selectedRole ? 'Edit Role' : 'Create Role'}
        description={selectedRole ? `Editing ${selectedRole.name}` : 'Create a new role'}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRoleModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--ss-text)] mb-2">
              ROLE NAME
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Content Manager"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--ss-text)] mb-2">
              DESCRIPTION
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this role"
            />
          </div>

          {/* Permissions Matrix */}
          <div>
            <button
              type="button"
              onClick={() => setShowPermissionMatrix(!showPermissionMatrix)}
              className="text-sm font-medium text-[var(--ss-primary)] hover:underline"
            >
              {showPermissionMatrix ? '▼ Hide' : '▶ Show'} Permission Matrix ({formData.selectedPermissions.length} selected)
            </button>

            {showPermissionMatrix && (
              <div className="mt-4 max-h-96 space-y-3 overflow-y-auto rounded-lg border border-[var(--ss-border)] p-4 bg-[var(--ss-surface-alt)]">
                {Array.from(new Set(AVAILABLE_PERMISSIONS.map((p) => p.resource))).map(
                  (resource) => (
                    <div key={resource} className="space-y-2">
                      <h4 className="font-semibold text-sm">{resource}</h4>
                      <div className="space-y-1 ml-4">
                        {AVAILABLE_PERMISSIONS.filter((p) => p.resource === resource).map(
                          (perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-[var(--ss-surface)] p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{perm.label}</span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
