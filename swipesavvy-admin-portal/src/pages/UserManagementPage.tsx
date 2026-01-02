import Badge from '@/components/ui/Badge'
import { BrandingKitIcon, BrandingKitIconButton } from '@/components/ui/BrandingKitIcon'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import { useState } from 'react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  lastActive: string
  createdAt: string
  department?: string
  permissions?: string[]
}

const MOCK_USERS: AdminUser[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@swipesavvy.com',
    role: 'Admin',
    status: 'active',
    lastActive: '2 hours ago',
    createdAt: '2025-01-15',
    department: 'Management',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@swipesavvy.com',
    role: 'Manager',
    status: 'active',
    lastActive: '30 minutes ago',
    createdAt: '2025-02-01',
    department: 'Operations',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@swipesavvy.com',
    role: 'Operator',
    status: 'active',
    lastActive: '1 hour ago',
    createdAt: '2025-03-10',
    department: 'Support',
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david.lee@swipesavvy.com',
    role: 'Admin',
    status: 'inactive',
    lastActive: '7 days ago',
    createdAt: '2025-01-20',
    department: 'Management',
  },
]

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    Admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Operator: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  }
  return colors[role] || colors['Operator']
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSuspend = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u,
      ),
    )
  }

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-gradient-to-r from-[#235393] to-[#1A3F7A] rounded-lg p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAB915]/20 rounded-lg">
            <BrandingKitIcon name="users" size="lg" className="text-[#FAB915]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-white/70 mt-1">Manage admin users, roles, and access permissions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-900/20 border-l-4 border-[#235393]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#235393] dark:text-[#7ACD56] uppercase">Total Users</span>
              <BrandingKitIcon name="users" size="md" className="text-[#235393]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#235393] to-[#1A3F7A] bg-clip-text">{users.length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-green-900/20 border-l-4 border-[#60BA46]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#60BA46] dark:text-[#7ACD56] uppercase">Active</span>
              <BrandingKitIcon name="check" size="md" className="text-[#60BA46]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#60BA46] to-[#4A9A35] bg-clip-text">{users.filter(u => u.status === 'active').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-yellow-50/30 dark:from-slate-900 dark:to-yellow-900/20 border-l-4 border-[#FAB915]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#FAB915] dark:text-[#FAB915] uppercase">Inactive</span>
              <BrandingKitIcon name="alert_circle" size="md" className="text-[#FAB915]" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-[#FAB915] to-[#FF8C00] bg-clip-text">{users.filter(u => u.status === 'inactive').length}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-white to-red-50/30 dark:from-slate-900 dark:to-red-900/20 border-l-4 border-red-500">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase">Suspended</span>
              <BrandingKitIcon name="lock" size="md" className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-600 to-red-700 bg-clip-text">{users.filter(u => u.status === 'suspended').length}</p>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <BrandingKitIcon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B4D4D] dark:text-[#A0A0A0]" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#235393]/20 rounded-lg bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#235393]/50"
          />
        </div>
        <Button className="gap-2">
          <BrandingKitIcon name="plus" size="sm" />
          Add User
        </Button>
      </div>

      <Card className="overflow-hidden border-l-4 border-[#60BA46]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-[#235393]/10 to-[#60BA46]/10 dark:from-slate-800 dark:to-slate-700 border-b border-[#235393]/20">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Department</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-[#235393] dark:text-[#7ACD56]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#235393]/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gradient-to-r hover:from-[#235393]/5 hover:to-[#60BA46]/5 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-[#235393] dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#235393] to-[#1A3F7A] flex items-center justify-center text-white text-xs font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#4B4D4D] dark:text-[#A0A0A0]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn('px-3 py-1.5 rounded-full text-xs font-semibold', getRoleColor(user.role))}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#4B4D4D] dark:text-[#A0A0A0]">{user.department}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'danger' : 'neutral'}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <BrandingKitIconButton
                      name="edit"
                      title="Edit user"
                      onClick={() => console.log('Edit user:', user.id)}
                    />
                    <BrandingKitIconButton
                      name={user.status === 'suspended' ? 'check' : 'alert_circle'}
                      onClick={() => handleSuspend(user.id)}
                      title={user.status === 'suspended' ? 'Unsuspend user' : 'Suspend user'}
                    />
                    <BrandingKitIconButton
                      name="trash"
                      onClick={() => handleDelete(user.id)}
                      title="Delete user"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredUsers.length === 0 && (
        <Card className="p-8 text-center">
          <BrandingKitIcon name="search" size="2xl" className="mx-auto mb-4 text-[#235393]/40 dark:text-[#7ACD56]/40" />
          <h3 className="text-lg font-semibold text-[#235393] dark:text-white mb-2">No users found</h3>
          <p className="text-[#4B4D4D] dark:text-[#A0A0A0]">Try adjusting your search criteria</p>
        </Card>
      )}
    </div>
  )
}
