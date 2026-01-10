import { AlertCircle, Check, ChevronRight, Edit, FileText, Filter, Lock, Plus, Search, Shield, Trash2, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Api } from '@/services/api'
import { useEventSubscription } from '@/store/eventBusStore'
import { useToastStore } from '@/store/toastStore'

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
  displayName?: string
  description: string
  usersCount: number
  status: 'active' | 'inactive'
  createdAt: string
  permissions: string[] | number  // Can be array of permission names or count
  isSystem?: boolean
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
  // Store original API data for proper editing
  resource?: string
  actions?: string[]
  effect?: string
  priority?: number
}

const MOCK_USERS: AdminUser[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@swipesavvy.com', role: 'admin', status: 'active', lastActive: '2 hours ago', createdAt: '2025-01-15', department: 'Management' },
  { id: '2', name: 'Michael Chen', email: 'michael.chen@swipesavvy.com', role: 'support_manager', status: 'active', lastActive: '30 minutes ago', createdAt: '2025-02-01', department: 'Operations' },
  { id: '3', name: 'Emma Rodriguez', email: 'emma.rodriguez@swipesavvy.com', role: 'analyst', status: 'active', lastActive: '1 hour ago', createdAt: '2025-03-10', department: 'Support' },
  { id: '4', name: 'David Lee', email: 'david.lee@swipesavvy.com', role: 'viewer', status: 'inactive', lastActive: '7 days ago', createdAt: '2025-01-20', department: 'Management' },
]

const MOCK_ROLES: Role[] = [
  { id: '1', name: 'Super Admin', description: 'Full system access with all permissions', usersCount: 2, status: 'active', createdAt: '2025-01-01', permissions: 156 },
  { id: '2', name: 'Admin', description: 'Administrative access to main features', usersCount: 5, status: 'active', createdAt: '2025-01-05', permissions: 89 },
  { id: '3', name: 'Manager', description: 'Manage users and view analytics', usersCount: 12, status: 'active', createdAt: '2025-01-10', permissions: 45 },
  { id: '4', name: 'Operator', description: 'Limited access to operational features', usersCount: 8, status: 'active', createdAt: '2025-01-15', permissions: 18 },
  { id: '5', name: 'Viewer', description: 'Read-only access to dashboards', usersCount: 0, status: 'inactive', createdAt: '2025-01-20', permissions: 5 },
]

const DEFAULT_PERMISSION_permissionCategories = ['User Management', 'Merchant Management', 'Transaction Management', 'Analytics', 'Settings', 'Support', 'Administration', 'System', 'Compliance']

// Policy categories (different from permission categories)
const DEFAULT_POLICY_permissionCategories = ['Privacy', 'Security', 'Legal', 'Compliance', 'Operational']

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
    admin: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]',
    support_manager: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]',
    analyst: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]',
    viewer: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]',
  }
  return colors[role.toLowerCase()] || 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
}

// Display-friendly role names
const getRoleDisplayName = (role: string) => {
  const displayNames: Record<string, string> = {
    admin: 'Admin',
    support_manager: 'Support Manager',
    analyst: 'Analyst',
    viewer: 'Viewer',
  }
  return displayNames[role.toLowerCase()] || role
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

export default function UserManagementPage() {
  const pushToast = useToastStore((s) => s.push)
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS)
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES)
  const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS)
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('users')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Dynamic categories - can be extended by users
  const [permissionCategories, setPermissionCategories] = useState<string[]>(DEFAULT_PERMISSION_permissionCategories)
  const [policyCategories, setPolicyCategories] = useState<string[]>(DEFAULT_POLICY_permissionCategories)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryType, setCategoryType] = useState<'permission' | 'policy'>('permission')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState<{
    name: string
    email: string
    role: string
    department: string
    status: 'active' | 'inactive' | 'suspended'
  }>({
    name: '',
    email: '',
    role: 'analyst',
    department: '',
    status: 'active'
  })
  const [addingUser, setAddingUser] = useState(false)

  // Edit user modal state
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [savingUser, setSavingUser] = useState(false)

  // Role modal state
  const [showAddRoleModal, setShowAddRoleModal] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '', status: 'active' as 'active' | 'inactive', permissions: [] as string[] })
  const [addingRole, setAddingRole] = useState(false)

  // Edit role modal state
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [savingRole, setSavingRole] = useState(false)
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([])

  // Permission modal state
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false)
  const [newPermission, setNewPermission] = useState({ name: '', description: '', category: 'User Management', resource: '' })
  const [addingPermission, setAddingPermission] = useState(false)

  // Edit permission modal state
  const [showEditPermissionModal, setShowEditPermissionModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [savingPermission, setSavingPermission] = useState(false)

  // Policy modal state
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false)
  const [newPolicy, setNewPolicy] = useState({ name: '', description: '', category: 'Privacy', status: 'draft' as 'active' | 'inactive' | 'draft', appliedTo: 'All Users' })
  const [addingPolicy, setAddingPolicy] = useState(false)

  // Edit policy modal state
  const [showEditPolicyModal, setShowEditPolicyModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)
  const [savingPolicy, setSavingPolicy] = useState(false)

  // Fetch data from backend
  useEffect(() => {
    fetchAllData()
  }, [])

  // Subscribe to user/role events for auto-refresh
  useEventSubscription(
    ['admin_user:created', 'admin_user:updated', 'admin_user:deleted', 'role:created', 'role:updated', 'role:deleted', 'policy:created', 'policy:updated', 'policy:deleted'],
    () => {
      fetchAllData()
    }
  )

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel using unified API
      const [usersRes, rolesRes, policiesRes, permissionsRes] = await Promise.all([
        Api.adminUsersApi.listAdminUsers(1, 100),
        Api.rbacApi.listRoles(1, 100),
        Api.rbacApi.listPolicies(1, 100),
        Api.rbacApi.listPermissions(1, 100),
      ])

      // Map users from API response
      const usersData = usersRes?.users || usersRes || []
      const mappedUsers: AdminUser[] = usersData.map((u: any) => ({
        id: u.id,
        name: u.name || u.full_name,
        email: u.email,
        role: u.role,
        status: u.status,
        lastActive: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
        createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
        department: u.department,
      }))
      setUsers(mappedUsers.length > 0 ? mappedUsers : MOCK_USERS)

      // Map roles from API response - keep full permissions array
      const rolesData = rolesRes?.roles || rolesRes || []
      const mappedRoles: Role[] = rolesData.map((r: any) => ({
        id: r.id,
        name: r.name,  // Keep the actual role name (e.g., 'admin', 'support_manager')
        displayName: r.display_name || r.name,
        description: r.description || '',
        usersCount: r.user_count || 0,
        status: r.status,
        createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
        permissions: Array.isArray(r.permissions) ? r.permissions : [],  // Keep full array
        isSystem: r.is_system || false,
      }))
      setRoles(mappedRoles.length > 0 ? mappedRoles : MOCK_ROLES)

      // Map policies from API response - store original API data for editing
      const mapResourceToCategory = (resource: string): string => {
        const categoryMap: Record<string, string> = {
          '*': 'Security',
          'support': 'Support',
          'analytics': 'Analytics',
          'users': 'User Management',
          'merchants': 'Merchant Management',
          'transactions': 'Transaction Management',
          'settings': 'Settings',
          'rbac': 'Administration',
        }
        return categoryMap[resource] || 'Security'
      }
      const mapActionsToAppliedTo = (actions: string[]): string => {
        if (!actions || actions.length === 0) return 'All Users'
        if (actions.includes('*')) return 'All Users'
        if (actions.includes('read') && actions.includes('write')) return 'All Staff'
        if (actions.includes('read')) return 'All Users'
        return 'All Staff'
      }
      const policiesData = policiesRes?.policies || policiesRes || []
      const mappedPolicies: Policy[] = policiesData.map((p: any) => ({
        id: p.id,
        name: p.display_name || p.name,
        description: p.description || '',
        category: mapResourceToCategory(p.resource),
        status: p.status,
        version: '1.0',
        lastModified: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '',
        appliedTo: mapActionsToAppliedTo(p.actions),
        // Store original API data
        resource: p.resource,
        actions: p.actions || [],
        effect: p.effect,
        priority: p.priority,
      }))
      setPolicies(mappedPolicies.length > 0 ? mappedPolicies : MOCK_POLICIES)

      // Map permissions from API response
      const permissionsData = permissionsRes?.permissions || permissionsRes || []
      const mappedPermissions: Permission[] = permissionsData.map((p: any) => ({
        id: p.id,
        name: p.display_name || p.name,
        description: p.description || '',
        category: p.category || 'General',
        resource: p.name || p.resource,  // p.name is like 'users:read'
        rolesCount: 0, // API doesn't return this, could be calculated
      }))
      setPermissions(mappedPermissions.length > 0 ? mappedPermissions : MOCK_PERMISSIONS)

    } catch (err: any) {
      console.error('Failed to fetch user management data:', err)
      // Fall back to mock data if API fails
      setUsers(MOCK_USERS)
      setRoles(MOCK_ROLES)
      setPermissions(MOCK_PERMISSIONS)
      setPolicies(MOCK_POLICIES)
      const errorMsg = err?.message || 'Failed to fetch data'
      setError(`API Error: ${errorMsg}`)
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

  const groupedPermissions = permissionCategories.reduce((acc, cat) => {
    acc[cat] = filteredPermissions.filter((p) => p.category === cat)
    return acc
  }, {} as Record<string, Permission[]>)

  const handleSuspendUser = async (id: string) => {
    try {
      const newStatus = users.find(u => u.id === id)?.status === 'suspended' ? 'active' : 'suspended'
      await Api.adminUsersApi.updateAdminUser(id, { status: newStatus })
      setUsers(users.map((u) => (u.id === id ? { ...u, status: newStatus as any } : u)))
      pushToast({ variant: 'success', title: 'User Updated', message: `User status changed to ${newStatus}` })
    } catch (err) {
      console.error('Failed to update user:', err)
      setError('Failed to update user status')
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      await Api.adminUsersApi.deleteAdminUser(id)
      setUsers(users.filter((u) => u.id !== id))
      pushToast({ variant: 'success', title: 'User Deleted', message: 'User has been removed' })
    } catch (err) {
      console.error('Failed to delete user:', err)
      setError('Failed to delete user')
    }
  }

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setShowEditUserModal(true)
  }

  const handleSaveUser = async () => {
    if (!editingUser) return
    setSavingUser(true)
    try {
      await Api.adminUsersApi.updateAdminUser(editingUser.id, {
        full_name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        department: editingUser.department,
        status: editingUser.status,
      })
      setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)))
      setShowEditUserModal(false)
      setEditingUser(null)
      pushToast({ variant: 'success', title: 'User Saved', message: 'User details have been updated' })
    } catch (err) {
      console.error('Failed to save user:', err)
      setError('Failed to save user')
    } finally {
      setSavingUser(false)
    }
  }

  const handleToggleRoleStatus = async (id: string) => {
    try {
      const role = roles.find(r => r.id === id)
      const newStatus = role?.status === 'active' ? 'inactive' : 'active'
      await Api.rbacApi.updateRole(id, { status: newStatus })
      setRoles(roles.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r)))
      pushToast({ variant: 'success', title: 'Role Updated', message: `Role status changed to ${newStatus}` })
    } catch (err) {
      console.error('Failed to update role:', err)
      setError('Failed to update role status')
    }
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    // Set the permissions - handle both array and number formats
    const perms = Array.isArray(role.permissions) ? role.permissions : []
    console.log('Edit Role - role:', role.name)
    console.log('  role.permissions:', role.permissions)
    console.log('  perms to set:', perms)
    console.log('  available permissions resources:', permissions.slice(0, 5).map(p => p.resource))
    console.log('  first permission match check:', perms.length > 0 && permissions.length > 0 ? `${perms[0]} includes ${permissions[0].resource} = ${perms.includes(permissions[0].resource)}` : 'N/A')
    setSelectedRolePermissions(perms)
    setShowEditRoleModal(true)
  }

  const handleSaveRole = async () => {
    if (!editingRole) return
    setSavingRole(true)
    try {
      await Api.rbacApi.updateRole(editingRole.id, {
        display_name: editingRole.displayName || editingRole.name,
        description: editingRole.description,
        permissions: selectedRolePermissions,
        status: editingRole.status,
      })
      // Update local state
      setRoles(roles.map((r) => (r.id === editingRole.id ? {
        ...editingRole,
        permissions: selectedRolePermissions
      } : r)))
      setShowEditRoleModal(false)
      setEditingRole(null)
      setSelectedRolePermissions([])
      pushToast({ variant: 'success', title: 'Role Saved', message: 'Role has been updated' })
    } catch (err) {
      console.error('Failed to save role:', err)
      setError('Failed to save role')
    } finally {
      setSavingRole(false)
    }
  }

  const togglePermissionForRole = (permissionName: string) => {
    setSelectedRolePermissions(prev =>
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    )
  }

  const handleDeleteRole = async (id: string) => {
    try {
      await Api.rbacApi.deleteRole(id)
      setRoles(roles.filter((r) => r.id !== id))
      pushToast({ variant: 'success', title: 'Role Deleted', message: 'Role has been removed' })
    } catch (err) {
      console.error('Failed to delete role:', err)
      setError('Failed to delete role')
    }
  }

  const handleDeletePermission = async (id: string) => {
    try {
      await Api.rbacApi.deletePermission(id)
      setPermissions(permissions.filter((p) => p.id !== id))
      pushToast({ variant: 'success', title: 'Permission Deleted', message: 'Permission has been removed' })
    } catch (err) {
      console.error('Failed to delete permission:', err)
      setError('Failed to delete permission')
    }
  }

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission)
    setShowEditPermissionModal(true)
  }

  const handleSavePermission = async () => {
    if (!editingPermission) return
    setSavingPermission(true)
    try {
      // Note: There's no updatePermission endpoint, permissions are typically read-only
      // For now we just update local state
      setPermissions(permissions.map((p) => (p.id === editingPermission.id ? editingPermission : p)))
      setShowEditPermissionModal(false)
      setEditingPermission(null)
      pushToast({ variant: 'success', title: 'Permission Updated', message: 'Permission has been updated locally' })
    } catch (err) {
      console.error('Failed to save permission:', err)
      setError('Failed to save permission')
    } finally {
      setSavingPermission(false)
    }
  }

  const handleDeletePolicy = async (id: string) => {
    try {
      await Api.rbacApi.deletePolicy(id)
      setPolicies(policies.filter((p) => p.id !== id))
      pushToast({ variant: 'success', title: 'Policy Deleted', message: 'Policy has been removed' })
    } catch (err) {
      console.error('Failed to delete policy:', err)
      setError('Failed to delete policy')
    }
  }

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicy(policy)
    setShowEditPolicyModal(true)
  }

  const handleSavePolicy = async () => {
    if (!editingPolicy) return
    setSavingPolicy(true)
    try {
      await Api.rbacApi.updatePolicy(editingPolicy.id, {
        display_name: editingPolicy.name,
        description: editingPolicy.description,
        resource: editingPolicy.category.toLowerCase(),
        effect: 'allow',
        status: editingPolicy.status,
      })
      setPolicies(policies.map((p) => (p.id === editingPolicy.id ? editingPolicy : p)))
      setShowEditPolicyModal(false)
      setEditingPolicy(null)
      pushToast({ variant: 'success', title: 'Policy Saved', message: 'Policy has been updated' })
    } catch (err) {
      console.error('Failed to save policy:', err)
      setError('Failed to save policy')
    } finally {
      setSavingPolicy(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      setError('Name and email are required')
      return
    }

    try {
      setAddingUser(true)
      const response = await Api.adminUsersApi.createAdminUser({
        full_name: newUser.name,
        email: newUser.email,
        password: 'TempPassword123!', // Temporary password, user should reset
        role: newUser.role, // Role is already in correct format (admin, support_manager, analyst, viewer)
      })

      // Add the new user to state
      const createdUser: AdminUser = {
        id: response?.id || `${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        status: newUser.status,
        lastActive: 'Never',
        createdAt: new Date().toLocaleDateString()
      }
      setUsers([createdUser, ...users])

      // Reset form and close modal
      setNewUser({ name: '', email: '', role: 'analyst', department: '', status: 'active' })
      setShowAddUserModal(false)
      pushToast({ variant: 'success', title: 'User Created', message: `${newUser.name} has been added` })
    } catch (err: any) {
      console.error('Failed to add user:', err)
      setError(err?.message || 'Failed to create user')
    } finally {
      setAddingUser(false)
    }
  }

  const handleAddRole = async () => {
    if (!newRole.name.trim()) {
      setError('Role name is required')
      return
    }
    try {
      setAddingRole(true)
      const response = await Api.rbacApi.createRole({
        name: newRole.name.toLowerCase().replaceAll(/\s+/g, '_'),
        display_name: newRole.name,
        description: newRole.description,
        permissions: [],
      })

      const createdRole: Role = {
        id: response?.role?.id || response?.id || `${Date.now()}`,
        name: newRole.name,
        description: newRole.description,
        usersCount: 0,
        status: newRole.status,
        createdAt: new Date().toLocaleDateString(),
        permissions: 0
      }
      setRoles([createdRole, ...roles])
      setNewRole({ name: '', description: '', status: 'active', permissions: [] })
      setShowAddRoleModal(false)
      pushToast({ variant: 'success', title: 'Role Created', message: `${newRole.name} has been added` })
    } catch (err: any) {
      console.error('Failed to add role:', err)
      setError(err?.message || 'Failed to create role')
    } finally {
      setAddingRole(false)
    }
  }

  const handleAddPermission = async () => {
    if (!newPermission.name.trim() || !newPermission.resource.trim()) {
      setError('Permission name and resource are required')
      return
    }
    try {
      setAddingPermission(true)
      // Parse resource to extract action (e.g., "users:read" -> resource="users", action="read")
      const [resource, action] = newPermission.resource.includes(':')
        ? newPermission.resource.split(':')
        : [newPermission.resource, 'read']

      const response = await Api.rbacApi.createPermission({
        name: newPermission.resource,
        display_name: newPermission.name,
        description: newPermission.description,
        category: newPermission.category,
        resource: resource,
        action: action,
      })

      const createdPermission: Permission = {
        id: response?.permission?.id || response?.id || `${Date.now()}`,
        name: newPermission.name,
        description: newPermission.description,
        category: newPermission.category,
        resource: newPermission.resource,
        rolesCount: 0
      }
      setPermissions([createdPermission, ...permissions])
      setNewPermission({ name: '', description: '', category: 'User Management', resource: '' })
      setShowAddPermissionModal(false)
      pushToast({ variant: 'success', title: 'Permission Created', message: `${newPermission.name} has been added` })
    } catch (err: any) {
      console.error('Failed to add permission:', err)
      setError(err?.message || 'Failed to create permission')
    } finally {
      setAddingPermission(false)
    }
  }

  const handleAddPolicy = async () => {
    if (!newPolicy.name.trim()) {
      setError('Policy name is required')
      return
    }
    try {
      setAddingPolicy(true)
      const response = await Api.rbacApi.createPolicy({
        name: newPolicy.name.toLowerCase().replaceAll(/\s+/g, '_'),
        display_name: newPolicy.name,
        description: newPolicy.description,
        resource: newPolicy.category.toLowerCase(),
        actions: ['read', 'write'],
        effect: 'allow',
        priority: 10,
      })

      const createdPolicy: Policy = {
        id: response?.policy?.id || response?.id || `${Date.now()}`,
        name: newPolicy.name,
        description: newPolicy.description,
        category: newPolicy.category,
        status: newPolicy.status,
        version: '1.0',
        lastModified: new Date().toLocaleDateString(),
        appliedTo: newPolicy.appliedTo
      }
      setPolicies([createdPolicy, ...policies])
      setNewPolicy({ name: '', description: '', category: 'Privacy', status: 'draft', appliedTo: 'All Users' })
      setShowAddPolicyModal(false)
      pushToast({ variant: 'success', title: 'Policy Created', message: `${newPolicy.name} has been added` })
    } catch (err: any) {
      console.error('Failed to add policy:', err)
      setError(err?.message || 'Failed to create policy')
    } finally {
      setAddingPolicy(false)
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">Using mock data as fallback. Check browser console for details.</p>
          </div>
          <button
            onClick={() => { setError(null); fetchAllData(); }}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
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
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
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
                        {getRoleDisplayName(user.role)}
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
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit user"
                        >
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
            <button
              onClick={() => setShowAddRoleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
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
                        <p className="font-bold text-purple-600 text-lg">{Array.isArray(role.permissions) ? role.permissions.length : role.permissions}</p>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <p className="text-gray-500 text-xs uppercase font-semibold">Created</p>
                        <p className="font-bold text-gray-900">{role.createdAt}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditRole(role)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit role">
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
            <button
              onClick={() => setShowAddPermissionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
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
              {permissionCategories.map((cat) => {
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
                              <button
                                onClick={() => handleEditPermission(permission)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit permission"
                              >
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
            <button
              onClick={() => setShowAddPolicyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
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
                        <button
                          onClick={() => handleEditPolicy(policy)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit policy"
                        >
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

      {/* Add User Modal */}
      <Modal
        open={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddUserModal(false)} disabled={addingUser}>
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={addingUser || !newUser.name.trim() || !newUser.email.trim()}
            >
              {addingUser ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="John Smith"
          />
          <Input
            label="Email *"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="john.smith@swipesavvy.com"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'Support Manager', value: 'support_manager' },
                { label: 'Analyst', value: 'analyst' },
                { label: 'Viewer', value: 'viewer' },
              ]}
            />
            <Input
              label="Department"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              placeholder="Operations"
            />
          </div>
          <Select
            label="Status"
            value={newUser.status}
            onChange={(e) => setNewUser({ ...newUser, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </div>
      </Modal>

      {/* Edit User Modal - RBAC Source of Truth */}
      <Modal
        open={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false)
          setEditingUser(null)
        }}
        title="Manage User Access"
        size="3xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowEditUserModal(false)
              setEditingUser(null)
            }} disabled={savingUser}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={savingUser || !editingUser?.name.trim() || !editingUser?.email.trim()}
            >
              {savingUser ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        {editingUser && (
          <div className="space-y-6">
            {/* RBAC Relationship Diagram */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Access Control Chain</h3>
              <div className="flex items-center justify-between gap-2">
                {/* User */}
                <div className="flex-1 p-3 bg-white rounded-lg border-2 border-blue-400 text-center shadow-sm">
                  <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <div className="font-semibold text-sm text-gray-900">{editingUser.name}</div>
                  <div className="text-xs text-gray-500">User</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                {/* Role */}
                <div className="flex-1 p-3 bg-white rounded-lg border-2 border-green-400 text-center shadow-sm">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <div className="font-semibold text-sm text-gray-900">
                    {roles.find(r => r.name === editingUser.role)?.displayName || editingUser.role}
                  </div>
                  <div className="text-xs text-gray-500">Role</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                {/* Permissions */}
                <div className="flex-1 p-3 bg-white rounded-lg border-2 border-orange-400 text-center shadow-sm">
                  <Lock className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                  <div className="font-semibold text-sm text-gray-900">
                    {(() => {
                      const role = roles.find(r => r.name === editingUser.role)
                      const perms = role && Array.isArray(role.permissions) ? role.permissions : []
                      return perms.length
                    })()} Permissions
                  </div>
                  <div className="text-xs text-gray-500">Access Rights</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                {/* Policies */}
                <div className="flex-1 p-3 bg-white rounded-lg border-2 border-purple-400 text-center shadow-sm">
                  <FileText className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                  <div className="font-semibold text-sm text-gray-900">
                    {policies.filter(p => p.status === 'active').length} Policies
                  </div>
                  <div className="text-xs text-gray-500">Governance</div>
                </div>
              </div>
            </div>

            {/* User Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                User Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="John Smith"
                />
                <Input
                  label="Email *"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="john.smith@swipesavvy.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Department"
                  value={editingUser.department || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  placeholder="Operations"
                />
                <Select
                  label="Status"
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                    { label: 'Suspended', value: 'suspended' },
                  ]}
                />
              </div>
            </div>

            {/* Role Assignment Section */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Role Assignment
                <span className="ml-auto text-xs font-normal text-gray-500 normal-case">
                  Role determines all permissions for this user
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {roles.filter(r => r.status === 'active').map((role) => {
                  const isSelected = editingUser.role === role.name
                  const rolePermissions = Array.isArray(role.permissions) ? role.permissions : []
                  return (
                    <label
                      key={role.id}
                      className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        checked={isSelected}
                        onChange={() => setEditingUser({ ...editingUser, role: role.name })}
                        className="mt-1 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{role.displayName || role.name}</span>
                          {role.isSystem && (
                            <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">System</span>
                          )}
                          <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full ml-auto">
                            {rolePermissions.length} permissions
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">{role.usersCount} users</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Permissions Granted by Role */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600" />
                Permissions Granted by Role
                <span className="ml-auto text-xs font-normal text-gray-500 normal-case">
                  {(() => {
                    const role = roles.find(r => r.name === editingUser.role)
                    const perms = role && Array.isArray(role.permissions) ? role.permissions : []
                    return `${perms.length} total permissions`
                  })()}
                </span>
              </h3>
              {(() => {
                const selectedRole = roles.find(r => r.name === editingUser.role)
                const rolePermissions = selectedRole && Array.isArray(selectedRole.permissions) ? selectedRole.permissions : []

                if (rolePermissions.length === 0) {
                  return (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-orange-300" />
                      <p className="text-orange-800 font-medium">No permissions assigned</p>
                      <p className="text-sm text-orange-600 mt-1">This role has no permissions. Edit the role to add permissions.</p>
                    </div>
                  )
                }

                // Group permissions by resource category
                const groupedPerms: Record<string, string[]> = {}
                rolePermissions.forEach(perm => {
                  const category = perm.split(':')[0] || 'Other'
                  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1)
                  if (!groupedPerms[displayCategory]) groupedPerms[displayCategory] = []
                  groupedPerms[displayCategory].push(perm)
                })

                return (
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {Object.entries(groupedPerms).map(([category, perms]) => (
                      <div key={category} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="font-medium text-sm text-orange-800 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          {category}
                          <span className="ml-auto text-xs text-orange-600">({perms.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {perms.map((perm, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-white text-orange-700 rounded border border-orange-200">
                              {perm.split(':')[1] || perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Policies Affecting This User */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Policies Affecting This User
                <span className="ml-auto text-xs font-normal text-gray-500 normal-case">
                  Based on role permissions
                </span>
              </h3>
              {(() => {
                const selectedRole = roles.find(r => r.name === editingUser.role)
                const rolePermissions = selectedRole && Array.isArray(selectedRole.permissions) ? selectedRole.permissions : []

                // Find policies that affect this user's permissions
                const affectingPolicies = policies.filter(p => {
                  if (p.status !== 'active') return false
                  if (p.resource === '*') return true // Universal policies
                  return rolePermissions.some(perm => perm.startsWith(p.resource + ':'))
                })

                if (affectingPolicies.length === 0) {
                  return (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-purple-300" />
                      <p className="text-purple-800">No specific policies apply</p>
                    </div>
                  )
                }

                return (
                  <div className="grid grid-cols-2 gap-3">
                    {affectingPolicies.map((policy) => (
                      <div key={policy.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm text-purple-900">{policy.name}</div>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            policy.effect === 'allow' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {policy.effect || 'allow'}
                          </span>
                        </div>
                        <div className="text-xs text-purple-600 mt-1">{policy.description}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                            Resource: {policy.resource || '*'}
                          </span>
                          {policy.actions && policy.actions.length > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                              Actions: {policy.actions.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Role Modal */}
      <Modal
        open={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        title="Create New Role"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddRoleModal(false)} disabled={addingRole}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRole}
              disabled={addingRole || !newRole.name.trim()}
            >
              {addingRole ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Role Name *"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            placeholder="e.g. Content Editor"
          />
          <Input
            label="Description"
            value={newRole.description}
            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
            placeholder="Brief description of role responsibilities"
          />
          <Select
            label="Status"
            value={newRole.status}
            onChange={(e) => setNewRole({ ...newRole, status: e.target.value as 'active' | 'inactive' })}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        </div>
      </Modal>

      {/* Edit Role Modal with Permissions - Shows users, permissions, and policies */}
      <Modal
        open={showEditRoleModal}
        onClose={() => {
          setShowEditRoleModal(false)
          setEditingRole(null)
          setSelectedRolePermissions([])
        }}
        title="Edit Role & Assign Permissions"
        size="4xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowEditRoleModal(false)
              setEditingRole(null)
              setSelectedRolePermissions([])
            }} disabled={savingRole}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              disabled={savingRole || !editingRole?.name.trim()}
            >
              {savingRole ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        {editingRole && (
          <div className="space-y-6">
            {/* RBAC Relationship Summary */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Role Impact Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-lg border-2 border-blue-400 text-center shadow-sm">
                  <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <div className="font-bold text-xl text-gray-900">{editingRole.usersCount}</div>
                  <div className="text-xs text-gray-500">Users Assigned</div>
                </div>
                <div className="p-3 bg-white rounded-lg border-2 border-orange-400 text-center shadow-sm">
                  <Lock className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                  <div className="font-bold text-xl text-gray-900">{selectedRolePermissions.length}</div>
                  <div className="text-xs text-gray-500">Permissions</div>
                </div>
                <div className="p-3 bg-white rounded-lg border-2 border-purple-400 text-center shadow-sm">
                  <FileText className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                  <div className="font-bold text-xl text-gray-900">
                    {policies.filter(p => p.status === 'active' && (p.resource === '*' || selectedRolePermissions.some(perm => perm.startsWith(p.resource + ':')))).length}
                  </div>
                  <div className="text-xs text-gray-500">Policies Apply</div>
                </div>
                <div className="p-3 bg-white rounded-lg border-2 border-green-400 text-center shadow-sm">
                  <Shield className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <div className="font-bold text-xl text-gray-900">
                    {new Set(selectedRolePermissions.map(p => p.split(':')[0])).size}
                  </div>
                  <div className="text-xs text-gray-500">Resource Areas</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                Changes to this role will affect <strong>{editingRole.usersCount} users</strong> and their access to <strong>{selectedRolePermissions.length} permissions</strong>
              </p>
            </div>

            {/* Role Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Role Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Role Name"
                  value={editingRole.displayName || editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, displayName: e.target.value })}
                  placeholder="e.g. Content Editor"
                />
                <Select
                  label="Status"
                  value={editingRole.status}
                  onChange={(e) => setEditingRole({ ...editingRole, status: e.target.value as 'active' | 'inactive' })}
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                />
              </div>
              <Input
                label="Description"
                value={editingRole.description}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                placeholder="Brief description of role responsibilities"
              />
            </div>

            {/* Users with This Role */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users with This Role ({editingRole.usersCount})
              </h3>
              {(() => {
                const usersWithRole = users.filter(u => u.role === editingRole.name)
                if (usersWithRole.length === 0) {
                  return (
                    <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                      No users are currently assigned to this role.
                    </div>
                  )
                }
                return (
                  <div className="flex flex-wrap gap-2">
                    {usersWithRole.slice(0, 8).map(user => (
                      <div key={user.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                    {usersWithRole.length > 8 && (
                      <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg">
                        <span className="text-sm text-gray-600">+{usersWithRole.length - 8} more users</span>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Permissions Assignment */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Assign Permissions
                </h3>
                <span className="text-sm text-gray-500">{selectedRolePermissions.length} selected</span>
              </div>
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {permissionCategories.map((category) => {
                  const categoryPermissions = permissions.filter((p) => p.category === category)
                  if (categoryPermissions.length === 0) return null
                  return (
                    <div key={category} className="border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700 flex items-center justify-between">
                        <span>{category}</span>
                        <span className="text-xs text-gray-400">
                          {categoryPermissions.filter(p => selectedRolePermissions.includes(p.resource)).length}/{categoryPermissions.length}
                        </span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {categoryPermissions.map((permission) => {
                          const isSelected = selectedRolePermissions.includes(permission.resource)
                          return (
                            <label
                              key={permission.id}
                              className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePermissionForRole(permission.resource)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                                <div className="text-xs text-gray-500">{permission.description}</div>
                              </div>
                              <span className={`text-xs font-mono px-2 py-1 rounded ${isSelected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {permission.resource}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Related Policies */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Related Policies
              </h3>
              {(() => {
                // Find policies that might apply based on selected permissions
                const relatedPolicies = policies.filter(policy => {
                  if (policy.resource === '*') return true // Admin policies
                  return selectedRolePermissions.some(p => p.startsWith(policy.resource + ':'))
                })

                if (relatedPolicies.length === 0) {
                  return (
                    <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                      No policies are related to the selected permissions.
                    </div>
                  )
                }

                return (
                  <div className="flex flex-wrap gap-2">
                    {relatedPolicies.map(policy => (
                      <span key={policy.id} className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                        {policy.name}
                        <span className="ml-1 text-purple-400">({policy.resource || '*'})</span>
                      </span>
                    ))}
                  </div>
                )
              })()}
            </div>

            {editingRole.isSystem && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>System Role:</strong> This is a built-in role. Some restrictions may apply.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Permission Modal */}
      <Modal
        open={showAddPermissionModal}
        onClose={() => setShowAddPermissionModal(false)}
        title="Add New Permission"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddPermissionModal(false)} disabled={addingPermission}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPermission}
              disabled={addingPermission || !newPermission.name.trim() || !newPermission.resource.trim()}
            >
              {addingPermission ? 'Adding...' : 'Add Permission'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Permission Name *"
            value={newPermission.name}
            onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
            placeholder="e.g. View Reports"
          />
          <Input
            label="Description"
            value={newPermission.description}
            onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
            placeholder="What this permission allows"
          />
          <Select
            label="Category"
            value={newPermission.category}
            onChange={(e) => setNewPermission({ ...newPermission, category: e.target.value })}
            options={[
              { label: '── + Add New Category ──', value: '__new__' },
              ...permissionCategories.map((cat) => ({ label: cat, value: cat })),
            ]}
          />
          {newPermission.category === '__new__' && (
            <div className="space-y-2">
              <Input
                label="New Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCategoryName.trim() && !permissionCategories.includes(newCategoryName.trim())) {
                    const trimmedName = newCategoryName.trim()
                    setPermissionCategories([...permissionCategories, trimmedName])
                    setNewPermission({ ...newPermission, category: trimmedName })
                    setNewCategoryName('')
                  }
                }}
                disabled={!newCategoryName.trim()}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Category
              </button>
            </div>
          )}
          <Input
            label="Resource Identifier *"
            value={newPermission.resource}
            onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value })}
            placeholder="e.g. reports:read"
          />
        </div>
      </Modal>

      {/* Edit Permission Modal - Shows which roles use this permission */}
      <Modal
        open={showEditPermissionModal}
        onClose={() => {
          setShowEditPermissionModal(false)
          setEditingPermission(null)
        }}
        title="Edit Permission"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowEditPermissionModal(false)
              setEditingPermission(null)
            }} disabled={savingPermission}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePermission}
              disabled={savingPermission || !editingPermission?.name.trim() || !editingPermission?.resource.trim()}
            >
              {savingPermission ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        {editingPermission && (
          <div className="space-y-6">
            {/* Permission Impact Summary */}
            {(() => {
              const rolesWithPerm = roles.filter(role => {
                const rolePerms = Array.isArray(role.permissions) ? role.permissions : []
                return rolePerms.includes(editingPermission.resource)
              })
              const totalUsersAffected = rolesWithPerm.reduce((sum, r) => sum + r.usersCount, 0)
              const relatedPolicies = policies.filter(p => {
                const permResource = editingPermission.resource.split(':')[0]
                return p.resource === '*' || p.resource === permResource
              })

              return (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Permission Impact</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-lg border-2 border-green-400 text-center shadow-sm">
                      <Shield className="w-6 h-6 mx-auto mb-1 text-green-600" />
                      <div className="font-bold text-xl text-gray-900">{rolesWithPerm.length}</div>
                      <div className="text-xs text-gray-500">Roles Use This</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border-2 border-blue-400 text-center shadow-sm">
                      <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                      <div className="font-bold text-xl text-gray-900">{totalUsersAffected}</div>
                      <div className="text-xs text-gray-500">Users Affected</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border-2 border-purple-400 text-center shadow-sm">
                      <FileText className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                      <div className="font-bold text-xl text-gray-900">{relatedPolicies.length}</div>
                      <div className="text-xs text-gray-500">Policies Govern</div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Permission Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600" />
                Permission Details
              </h3>
              <Input
                label="Permission Name *"
                value={editingPermission.name}
                onChange={(e) => setEditingPermission({ ...editingPermission, name: e.target.value })}
                placeholder="e.g. View Reports"
              />
              <Input
                label="Description"
                value={editingPermission.description}
                onChange={(e) => setEditingPermission({ ...editingPermission, description: e.target.value })}
                placeholder="What this permission allows"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Category"
                    value={editingPermission.category}
                    onChange={(e) => setEditingPermission({ ...editingPermission, category: e.target.value })}
                    options={[
                      { label: '── + Add New Category ──', value: '__new__' },
                      ...permissionCategories.map((cat) => ({ label: cat, value: cat })),
                    ]}
                  />
                  {editingPermission.category === '__new__' && (
                    <div className="mt-2 space-y-2">
                      <Input
                        label="New Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategoryName.trim() && !permissionCategories.includes(newCategoryName.trim())) {
                            const trimmedName = newCategoryName.trim()
                            setPermissionCategories([...permissionCategories, trimmedName])
                            setEditingPermission({ ...editingPermission, category: trimmedName })
                            setNewCategoryName('')
                          }
                        }}
                        disabled={!newCategoryName.trim()}
                        className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Add Category
                      </button>
                    </div>
                  )}
                </div>
                <Input
                  label="Resource Identifier *"
                  value={editingPermission.resource}
                  onChange={(e) => setEditingPermission({ ...editingPermission, resource: e.target.value })}
                  placeholder="e.g. reports:read"
                />
              </div>
            </div>

            {/* Roles Using This Permission */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Roles Using This Permission
                <span className="ml-auto text-xs font-normal text-gray-500 normal-case">
                  {(() => {
                    const count = roles.filter(role => {
                      const rolePerms = Array.isArray(role.permissions) ? role.permissions : []
                      return rolePerms.includes(editingPermission.resource)
                    }).length
                    return `${count} role${count !== 1 ? 's' : ''}`
                  })()}
                </span>
              </h3>
              {(() => {
                const rolesWithPermission = roles.filter(role => {
                  const rolePerms = Array.isArray(role.permissions) ? role.permissions : []
                  return rolePerms.includes(editingPermission.resource)
                })

                if (rolesWithPermission.length === 0) {
                  return (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-green-300" />
                      <p className="text-green-800 font-medium">No roles assigned</p>
                      <p className="text-sm text-green-600 mt-1">This permission is not used by any role yet.</p>
                    </div>
                  )
                }

                return (
                  <div className="grid gap-2 max-h-48 overflow-y-auto">
                    {rolesWithPermission.map(role => (
                      <div key={role.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Shield className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{role.displayName || role.name}</p>
                            <p className="text-xs text-gray-500">{role.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(role.status)}`}>
                            {role.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{role.usersCount} users</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Policies That Govern This Permission */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Policies Governing This Permission
              </h3>
              {(() => {
                const permResource = editingPermission.resource.split(':')[0]
                const relatedPolicies = policies.filter(p =>
                  p.status === 'active' && (p.resource === '*' || p.resource === permResource)
                )

                if (relatedPolicies.length === 0) {
                  return (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center text-purple-600 text-sm">
                      No specific policies govern this permission.
                    </div>
                  )
                }

                return (
                  <div className="grid grid-cols-2 gap-2">
                    {relatedPolicies.map(policy => (
                      <div key={policy.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="font-medium text-sm text-purple-900">{policy.name}</div>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            policy.effect === 'allow' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {policy.effect || 'allow'}
                          </span>
                        </div>
                        <div className="text-xs text-purple-600 mt-1">Resource: {policy.resource || '*'}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Policy Modal */}
      <Modal
        open={showAddPolicyModal}
        onClose={() => setShowAddPolicyModal(false)}
        title="Create New Policy"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddPolicyModal(false)} disabled={addingPolicy}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPolicy}
              disabled={addingPolicy || !newPolicy.name.trim()}
            >
              {addingPolicy ? 'Creating...' : 'Create Policy'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Policy Name *"
            value={newPolicy.name}
            onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
            placeholder="e.g. Password Policy"
          />
          <Input
            label="Description"
            value={newPolicy.description}
            onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
            placeholder="Brief description of the policy"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={newPolicy.category}
              onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
              options={[
                { label: 'Privacy', value: 'Privacy' },
                { label: 'Security', value: 'Security' },
                { label: 'Legal', value: 'Legal' },
                { label: 'Compliance', value: 'Compliance' },
              ]}
            />
            <Select
              label="Status"
              value={newPolicy.status}
              onChange={(e) => setNewPolicy({ ...newPolicy, status: e.target.value as 'active' | 'inactive' | 'draft' })}
              options={[
                { label: 'Draft', value: 'draft' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
            />
          </div>
          <Select
            label="Applied To"
            value={newPolicy.appliedTo}
            onChange={(e) => setNewPolicy({ ...newPolicy, appliedTo: e.target.value })}
            options={[
              { label: 'All Users', value: 'All Users' },
              { label: 'All Staff', value: 'All Staff' },
              { label: 'Admins Only', value: 'Admins Only' },
              { label: 'External Partners', value: 'External Partners' },
            ]}
          />
        </div>
      </Modal>

      {/* Edit Policy Modal - Shows resource, actions, and related roles */}
      <Modal
        open={showEditPolicyModal}
        onClose={() => {
          setShowEditPolicyModal(false)
          setEditingPolicy(null)
        }}
        title="Edit Policy"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowEditPolicyModal(false)
              setEditingPolicy(null)
            }} disabled={savingPolicy}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePolicy}
              disabled={savingPolicy || !editingPolicy?.name.trim()}
            >
              {savingPolicy ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        {editingPolicy && (
          <div className="space-y-6">
            {/* Policy Impact Summary */}
            {(() => {
              const relatedPerms = permissions.filter(p => {
                const permResource = p.resource.split(':')[0]
                return editingPolicy.resource === '*' || permResource === editingPolicy.resource
              })
              const affectedRoles = roles.filter(role => {
                const rolePerms = Array.isArray(role.permissions) ? role.permissions : []
                if (editingPolicy.resource === '*') return true
                return rolePerms.some(p => p.startsWith(editingPolicy.resource + ':'))
              })
              const totalUsersAffected = affectedRoles.reduce((sum, r) => sum + r.usersCount, 0)

              return (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Policy Scope & Impact</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-white rounded-lg border-2 border-purple-400 text-center shadow-sm">
                      <FileText className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                      <div className="font-bold text-sm text-gray-900">{editingPolicy.resource || '*'}</div>
                      <div className="text-xs text-gray-500">Resource</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border-2 border-orange-400 text-center shadow-sm">
                      <Lock className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                      <div className="font-bold text-xl text-gray-900">{relatedPerms.length}</div>
                      <div className="text-xs text-gray-500">Permissions</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border-2 border-green-400 text-center shadow-sm">
                      <Shield className="w-6 h-6 mx-auto mb-1 text-green-600" />
                      <div className="font-bold text-xl text-gray-900">{affectedRoles.length}</div>
                      <div className="text-xs text-gray-500">Roles Affected</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border-2 border-blue-400 text-center shadow-sm">
                      <Users className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                      <div className="font-bold text-xl text-gray-900">{totalUsersAffected}</div>
                      <div className="text-xs text-gray-500">Users Affected</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    This policy <strong className={editingPolicy.effect === 'deny' ? 'text-red-600' : 'text-green-600'}>
                      {editingPolicy.effect === 'deny' ? 'DENIES' : 'ALLOWS'}
                    </strong> access to <strong>{editingPolicy.resource || 'all resources'}</strong> for <strong>{totalUsersAffected} users</strong>
                  </p>
                </div>
              )
            })()}

            {/* Policy Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Policy Details
              </h3>
              <Input
                label="Policy Name *"
                value={editingPolicy.name}
                onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                placeholder="e.g. Password Policy"
              />
              <Input
                label="Description"
                value={editingPolicy.description}
                onChange={(e) => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
                placeholder="Brief description of the policy"
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={editingPolicy.status}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, status: e.target.value as 'active' | 'inactive' | 'draft' })}
                  options={[
                    { label: 'Draft', value: 'draft' },
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                />
                <Select
                  label="Effect"
                  value={editingPolicy.effect || 'allow'}
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, effect: e.target.value })}
                  options={[
                    { label: 'Allow', value: 'allow' },
                    { label: 'Deny', value: 'deny' },
                  ]}
                />
              </div>
            </div>

            {/* Resource & Actions */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Resource & Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="font-mono text-sm text-gray-900">{editingPolicy.resource || '*'}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      {editingPolicy.resource === '*' ? 'Applies to all resources' : `Applies to ${editingPolicy.resource} resource`}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Actions</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex flex-wrap gap-1">
                      {(editingPolicy.actions || ['*']).map((action, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded border border-green-200">
                          {action === '*' ? 'All Actions' : action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="font-medium text-gray-900">{editingPolicy.priority || 0}</span>
                  <p className="text-xs text-gray-500 mt-1">Higher priority policies are evaluated first</p>
                </div>
              </div>
            </div>

            {/* Related Permissions */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Related Permissions
              </h3>
              {(() => {
                // Find permissions that match this policy's resource
                const relatedPerms = permissions.filter(p => {
                  const permResource = p.resource.split(':')[0]
                  return editingPolicy.resource === '*' || permResource === editingPolicy.resource
                })

                if (relatedPerms.length === 0) {
                  return (
                    <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                      No permissions match this policy's resource.
                    </div>
                  )
                }

                return (
                  <div className="flex flex-wrap gap-2">
                    {relatedPerms.slice(0, 10).map(perm => (
                      <span key={perm.id} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {perm.name} ({perm.resource})
                      </span>
                    ))}
                    {relatedPerms.length > 10 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{relatedPerms.length - 10} more
                      </span>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Roles Affected by This Policy */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Roles Affected by This Policy
              </h3>
              {(() => {
                // Find roles that have permissions matching this policy's resource
                const affectedRoles = roles.filter(role => {
                  const rolePerms = Array.isArray(role.permissions) ? role.permissions : []
                  if (editingPolicy.resource === '*') return true // Admin Full Access affects all
                  return rolePerms.some(p => p.startsWith(editingPolicy.resource + ':'))
                })

                if (affectedRoles.length === 0) {
                  return (
                    <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                      No roles are affected by this policy.
                    </div>
                  )
                }

                return (
                  <div className="grid gap-2">
                    {affectedRoles.map(role => (
                      <div key={role.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Shield className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{role.displayName || role.name}</p>
                            <p className="text-xs text-gray-500">{role.usersCount} users assigned</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(role.status)}`}>
                          {role.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
