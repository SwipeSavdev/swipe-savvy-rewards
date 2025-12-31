import { useState, useEffect } from 'react'
import { Plus, Trash2, Search, UserCheck, UserX } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'merchant' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  last_login?: string
  total_transactions?: number
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'user' as const,
  })

  // Load users
  const loadUsers = async () => {
    setLoading(true)
    try {
      // Mock data for demo
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'user',
          status: 'active',
          created_at: '2025-01-15',
          last_login: '2025-12-24',
          total_transactions: 45,
        },
        {
          id: '2',
          email: 'jane@example.com',
          name: 'Jane Smith',
          role: 'merchant',
          status: 'active',
          created_at: '2025-02-20',
          last_login: '2025-12-23',
          total_transactions: 120,
        },
        {
          id: '3',
          email: 'bob@example.com',
          name: 'Bob Wilson',
          role: 'user',
          status: 'inactive',
          created_at: '2025-03-10',
          total_transactions: 5,
        },
      ]
      setUsers(mockUsers)
      filterUsers(mockUsers, searchTerm, roleFilter, statusFilter)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = (
    userList: User[],
    search: string,
    role: string,
    status: string
  ) => {
    let filtered = userList

    if (search) {
      filtered = filtered.filter(
        u =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (role !== 'all') {
      filtered = filtered.filter(u => u.role === role)
    }

    if (status !== 'all') {
      filtered = filtered.filter(u => u.status === status)
    }

    setFilteredUsers(filtered)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers(users, searchTerm, roleFilter, statusFilter)
  }, [searchTerm, roleFilter, statusFilter])

  const handleCreate = async () => {
    if (!formData.email || !formData.name) {
      alert('Email and name are required')
      return
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name,
      role: formData.role,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
    }

    setUsers([newUser, ...users])
    setFormData({ email: '', name: '', role: 'user' })
    setShowForm(false)
    alert('User created successfully!')
  }

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    setUsers(
      users.map(u =>
        u.id === user.id ? { ...u, status: newStatus as any } : u
      )
    )
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      merchant: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="merchant">Merchant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="merchant">Merchant</option>
            <option value="user">User</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Transactions</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.total_transactions || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.created_at}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'active' ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No users found</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm">Active Users</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm">Merchants</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {users.filter(u => u.role === 'merchant').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm">Total Transactions</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {users.reduce((sum, u) => sum + (u.total_transactions || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
