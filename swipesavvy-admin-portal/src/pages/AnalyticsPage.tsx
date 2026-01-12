import axios from 'axios'
import { Activity, AlertCircle, ArrowDownRight, ArrowUpRight, Calendar, CreditCard, DollarSign, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

// Default/fallback data
const DEFAULT_REVENUE_DATA = [
  { month: 'Jan', revenue: 45000, transactions: 1200, users: 850 },
  { month: 'Feb', revenue: 52000, transactions: 1450, users: 920 },
  { month: 'Mar', revenue: 48000, transactions: 1300, users: 880 },
  { month: 'Apr', revenue: 61000, transactions: 1680, users: 1050 },
  { month: 'May', revenue: 55000, transactions: 1520, users: 980 },
  { month: 'Jun', revenue: 67000, transactions: 1850, users: 1150 },
  { month: 'Jul', revenue: 72000, transactions: 2100, users: 1280 },
  { month: 'Aug', revenue: 69000, transactions: 1950, users: 1220 },
  { month: 'Sep', revenue: 78000, transactions: 2250, users: 1380 },
  { month: 'Oct', revenue: 82000, transactions: 2400, users: 1450 },
  { month: 'Nov', revenue: 88000, transactions: 2600, users: 1580 },
  { month: 'Dec', revenue: 95000, transactions: 2850, users: 1720 },
]

const transactionTypeData = [
  { name: 'Card Payments', value: 45, fill: '#3b82f6' },
  { name: 'Mobile Wallet', value: 30, fill: '#8b5cf6' },
  { name: 'Bank Transfer', value: 15, fill: '#10b981' },
  { name: 'Cash Back', value: 10, fill: '#f59e0b' },
]

const merchantPerformance = [
  { name: 'Retail', transactions: 4500, revenue: 125000 },
  { name: 'Food & Beverage', transactions: 3200, revenue: 89000 },
  { name: 'Healthcare', transactions: 1800, revenue: 156000 },
  { name: 'Entertainment', transactions: 2100, revenue: 67000 },
  { name: 'Services', transactions: 2800, revenue: 94000 },
]

const dailyActivity = [
  { time: '00:00', transactions: 120 },
  { time: '04:00', transactions: 45 },
  { time: '08:00', transactions: 320 },
  { time: '12:00', transactions: 580 },
  { time: '16:00', transactions: 450 },
  { time: '20:00', transactions: 380 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [revenueData, setRevenueData] = useState(DEFAULT_REVENUE_DATA)
  const [transactionTypeData, setTransactionTypeData] = useState([
    { name: 'Card Payments', value: 45, fill: '#3b82f6' },
    { name: 'Mobile Wallet', value: 30, fill: '#8b5cf6' },
    { name: 'Bank Transfer', value: 15, fill: '#10b981' },
    { name: 'Cash Back', value: 10, fill: '#f59e0b' },
  ])
  const [merchantPerformance, setMerchantPerformance] = useState([
    { name: 'Retail', transactions: 4500, revenue: 125000 },
    { name: 'Food & Beverage', transactions: 3200, revenue: 89000 },
    { name: 'Healthcare', transactions: 1800, revenue: 156000 },
    { name: 'Entertainment', transactions: 2100, revenue: 67000 },
    { name: 'Services', transactions: 2800, revenue: 94000 },
  ])
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: '$812,000', change: '+12.5%', trend: 'up' as const, icon: DollarSign, color: 'blue' },
    { title: 'Transactions', value: '24,150', change: '+8.2%', trend: 'up' as const, icon: CreditCard, color: 'purple' },
    { title: 'Active Users', value: '15,420', change: '+15.3%', trend: 'up' as const, icon: Users, color: 'green' },
    { title: 'Avg Transaction', value: '$33.62', change: '-2.1%', trend: 'down' as const, icon: Activity, color: 'orange' },
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get days param from dateRange
      const daysMap: Record<string, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365,
      }
      const days = daysMap[dateRange] || 30

      // If using mock API, skip the real API call and use default data
      if (USE_MOCK_API) {
        setLoading(false)
        return
      }

      // Fetch overview stats and chart data in parallel
      const [overviewRes, transactionRes, revenueRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/admin/analytics/overview`),
        axios.get(`${API_BASE_URL}/api/v1/admin/analytics/transactions`, { params: { days } }),
        axios.get(`${API_BASE_URL}/api/v1/admin/analytics/revenue`, { params: { days } }),
      ])

      // Update stats from API
      if (overviewRes.data) {
        const overview = overviewRes.data
        setStats([
          {
            title: 'Total Revenue',
            value: `$${(overview.totalRevenue || 812000).toLocaleString()}`,
            change: `+${overview.revenueChange || 12.5}%`,
            trend: (overview.revenueChange || 12.5) >= 0 ? 'up' : 'down',
            icon: DollarSign,
            color: 'blue',
          },
          {
            title: 'Transactions',
            value: (overview.totalTransactions || 24150).toLocaleString(),
            change: `+${overview.transactionChange || 8.2}%`,
            trend: (overview.transactionChange || 8.2) >= 0 ? 'up' : 'down',
            icon: CreditCard,
            color: 'purple',
          },
          {
            title: 'Active Users',
            value: (overview.activeUsers || 15420).toLocaleString(),
            change: `+${overview.userChange || 15.3}%`,
            trend: (overview.userChange || 15.3) >= 0 ? 'up' : 'down',
            icon: Users,
            color: 'green',
          },
          {
            title: 'Avg Transaction',
            value: `$${(overview.avgTransaction || 33.62).toFixed(2)}`,
            change: `${overview.avgTransactionChange || -2.1}%`,
            trend: (overview.avgTransactionChange || -2.1) >= 0 ? 'up' : 'down',
            icon: Activity,
            color: 'orange',
          },
        ])
      }

      // Update chart data
      if (transactionRes.data?.transactions) {
        setRevenueData(transactionRes.data.transactions)
      }
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err)
      setError(err.message || 'Failed to fetch analytics data')
      // Keep using default data as fallback
    } finally {
      setLoading(false)
    }
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string }> = {
      blue: { bg: 'bg-[var(--color-status-info-bg)]', icon: 'text-[var(--color-status-info-text)]' },
      purple: { bg: 'bg-[var(--color-status-info-bg)]', icon: 'text-[var(--color-status-info-text)]' },
      green: { bg: 'bg-[var(--color-status-success-bg)]', icon: 'text-[var(--color-status-success-text)]' },
      orange: { bg: 'bg-[var(--color-status-warning-bg)]', icon: 'text-[var(--color-status-warning-text)]' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track performance metrics and business insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">Using fallback data. Please try refreshing the page.</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
            <p className="text-sm text-blue-800">Loading analytics data...</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorClasses = getColorClasses(stat.color)
          return (
            <div key={stat.title} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-[var(--color-status-success-text)]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-[var(--color-status-danger-text)]" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-[var(--color-status-success-text)] text-sm' : 'text-[var(--color-status-danger-text)] text-sm'}>
                      {stat.change}
                    </span>
                    <span className="text-[var(--color-text-tertiary)] text-sm">vs last period</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
                  <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Types */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Transaction Types</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={transactionTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {transactionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant Performance */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Merchant Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={merchantPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Daily Activity Pattern</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="transactions" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions & Users Trend */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-6">Transactions & Users Growth</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis yAxisId="left" stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={2} name="Transactions" />
            <Line yAxisId="right" type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} name="Active Users" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
