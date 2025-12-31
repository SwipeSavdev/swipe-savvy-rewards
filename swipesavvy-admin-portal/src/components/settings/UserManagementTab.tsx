import { useState } from 'react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useToastStore } from '@/store/toastStore'

interface User {
  id: string
  email: string
  name: string
  role: string
  status: 'active' | 'inactive'
  created_at: string
}

export default function UserManagementTab() {
  const pushToast = useToastStore((s) => s.push)
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@swipesavvy.com',
      name: 'Admin User',
      role: 'Administrator',
      status: 'active',
      created_at: '2025-01-01',
    },
    {
      id: '2',
      email: 'support@swipesavvy.com',
      name: 'Support Manager',
      role: 'Manager',
      status: 'active',
      created_at: '2025-01-05',
    },
    {
      id: '3',
      email: 'viewer@swipesavvy.com',
      name: 'Read-Only Viewer',
      role: 'Viewer',
      status: 'inactive',
      created_at: '2025-01-10',
    },
  ])
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')

  const addUser = () => {
    if (!newEmail || !newName) {
      pushToast({
        variant: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields.',
      })
      return
    }

    const user: User = {
      id: String(users.length + 1),
      email: newEmail,
      name: newName,
      role: 'Viewer',
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
    }

    setUsers([...users, user])
    setNewEmail('')
    setNewName('')
    pushToast({
      variant: 'success',
      title: 'User Added',
      message: `${newName} has been added successfully.`,
    })
  }

  const deleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
    pushToast({
      variant: 'success',
      title: 'User Removed',
      message: 'User has been removed from the system.',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--ss-text)]">Add New User</h2>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Create a new admin portal user account.</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@swipesavvy.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={addUser}>Add User</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--ss-text)]">Active Users</h2>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Manage and monitor admin portal users.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--ss-border)]">
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--ss-text)]">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--ss-text)]">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--ss-text)]">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--ss-text)]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--ss-text)]">Created</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--ss-text)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ss-border)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--ss-surface-alt)]">
                  <td className="px-4 py-3 text-sm text-[var(--ss-text)]">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-[var(--ss-text-muted)]">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-[var(--ss-text)]">{user.role}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--ss-text-muted)]">{user.created_at}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      Remove
                    </button>
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
