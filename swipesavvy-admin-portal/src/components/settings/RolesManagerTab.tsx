import { useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useToastStore } from '@/store/toastStore'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  users_count: number
}

export default function RolesManagerTab() {
  const pushToast = useToastStore((s) => s.push)
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrator',
      description: 'Full system access and control',
      permissions: ['read', 'write', 'delete', 'admin'],
      users_count: 1,
    },
    {
      id: '2',
      name: 'Manager',
      description: 'Can manage support tickets and view analytics',
      permissions: ['read', 'write', 'support'],
      users_count: 1,
    },
    {
      id: '3',
      name: 'Viewer',
      description: 'Read-only access to dashboards and reports',
      permissions: ['read'],
      users_count: 1,
    },
  ])
  const [newRole, setNewRole] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const addRole = () => {
    if (!newRole || !newDesc) {
      pushToast({
        variant: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields.',
      })
      return
    }

    const role: Role = {
      id: String(roles.length + 1),
      name: newRole,
      description: newDesc,
      permissions: ['read'],
      users_count: 0,
    }

    setRoles([...roles, role])
    setNewRole('')
    setNewDesc('')
    pushToast({
      variant: 'success',
      title: 'Role Created',
      message: `${newRole} role has been created successfully.`,
    })
  }

  const deleteRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id))
    pushToast({
      variant: 'success',
      title: 'Role Deleted',
      message: 'Role has been removed from the system.',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--ss-text)]">Create New Role</h2>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Define custom roles and permissions for your team.</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Role Name"
            placeholder="e.g., Content Manager"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Describe this role's responsibilities..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={addRole}>Create Role</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--ss-text)]">Available Roles</h2>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Manage roles and assign permissions.</p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-lg border border-[var(--ss-border)] p-4 hover:bg-[var(--ss-surface-alt)]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--ss-text)]">{role.name}</h3>
                  <p className="mt-1 text-sm text-[var(--ss-text-muted)]">{role.description}</p>
                </div>
                <button
                  onClick={() => deleteRole(role.id)}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Delete
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs font-medium text-[var(--ss-text-muted)]">Permissions:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {role.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="rounded-full bg-[var(--ss-primary-soft)] px-2 py-1 text-xs text-[var(--ss-primary)]"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ml-auto">
                  <p className="text-sm text-[var(--ss-text)]">
                    <strong>{role.users_count}</strong> user{role.users_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
