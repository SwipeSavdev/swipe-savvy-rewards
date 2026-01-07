import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { Users, DollarSign, CreditCard, Activity, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react'

const revenueData = [
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

  const stats = [
    {
      title: 'Total Revenue',
      value: '$812,000',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: 'Transactions',
      value: '24,150',
      change: '+8.2%',
      trend: 'up',
      icon: CreditCard,
      color: 'purple',
    },
    {
      title: 'Active Users',
      value: '15,420',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'green',
    },
    {
      title: 'Avg Transaction',
      value: '$33.62',
      change: '-2.1%',
      trend: 'down',
      icon: Activity,
      color: 'orange',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string }> = {
      blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
      purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
      green: { bg: 'bg-green-100', icon: 'text-green-600' },
      orange: { bg: 'bg-orange-100', icon: 'text-orange-600' },
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
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm">vs last period</span>
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
