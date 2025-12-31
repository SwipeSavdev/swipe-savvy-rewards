import { useState } from 'react'
import { Plus, Search, Star } from 'lucide-react'

interface Merchant {
  id: string
  name: string
  email: string
  category: string
  status: 'active' | 'inactive' | 'pending'
  rating: number
  revenue: number
  transactions: number
  joined_date: string
}

export function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([
    {
      id: '1',
      name: 'Tech Store Pro',
      email: 'contact@techstore.com',
      category: 'Electronics',
      status: 'active',
      rating: 4.8,
      revenue: 45000,
      transactions: 521,
      joined_date: '2025-01-20',
    },
    {
      id: '2',
      name: 'Fashion Hub',
      email: 'hello@fashionhub.com',
      category: 'Fashion',
      status: 'active',
      rating: 4.6,
      revenue: 38000,
      transactions: 412,
      joined_date: '2025-02-10',
    },
    {
      id: '3',
      name: 'Food Delivery Co',
      email: 'support@foodco.com',
      category: 'Food & Beverage',
      status: 'pending',
      rating: 0,
      revenue: 0,
      transactions: 0,
      joined_date: '2025-12-20',
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Electronics',
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.email) {
      alert('Name and email are required')
      return
    }

    const newMerchant: Merchant = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      category: formData.category,
      status: 'pending',
      rating: 0,
      revenue: 0,
      transactions: 0,
      joined_date: new Date().toISOString().split('T')[0],
    }

    setMerchants([newMerchant, ...merchants])
    setFormData({ name: '', email: '', category: 'Electronics' })
    setShowForm(false)
    alert('Merchant created successfully!')
  }

  const filteredMerchants = merchants.filter(
    m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const topMerchants = [...merchants]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3)

  const totalRevenue = merchants
    .filter(m => m.status === 'active')
    .reduce((sum, m) => sum + m.revenue, 0)

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Merchants</h1>
            <p className="text-gray-600 mt-2">Manage merchant partners and commissions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Merchant
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm">Total Merchants</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{merchants.length}</p>
            <p className="text-green-600 text-sm mt-2">
              {merchants.filter(m => m.status === 'active').length} active
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">${(totalRevenue / 1000).toFixed(1)}k</p>
            <p className="text-blue-600 text-sm mt-2">From active merchants</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {merchants.reduce((sum, m) => sum + m.transactions, 0).toLocaleString()}
            </p>
            <p className="text-purple-600 text-sm mt-2">All time</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-sm">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {(
                merchants
                  .filter(m => m.rating > 0)
                  .reduce((sum, m) => sum + m.rating, 0) / merchants.filter(m => m.rating > 0).length
              ).toFixed(1)}
            </p>
            <p className="text-yellow-600 text-sm mt-2">Active merchants</p>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Merchant</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Merchant Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
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

        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Merchants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{merchant.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{merchant.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{merchant.category}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-semibold text-green-600">${merchant.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transactions</span>
                    <span className="font-semibold">{merchant.transactions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Revenue</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Transactions</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{merchant.name}</p>
                      <p className="text-sm text-gray-600">{merchant.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{merchant.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(merchant.status)}`}>
                      {merchant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${merchant.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{merchant.transactions}</td>
                  <td className="px-6 py-4">
                    {merchant.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{merchant.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
