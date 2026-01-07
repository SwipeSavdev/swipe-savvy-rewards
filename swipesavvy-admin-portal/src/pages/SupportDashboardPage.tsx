import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Headphones, Ticket, Clock, CheckCircle, TrendingUp, TrendingDown, Star, ArrowUpRight, ChevronRight, RefreshCw } from 'lucide-react'

// Chart colors
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  gray: '#6b7280',
}

// Mock data for charts
const ticketTrendData = [
  { date: 'Mon', opened: 45, resolved: 38, pending: 12 },
  { date: 'Tue', opened: 52, resolved: 48, pending: 15 },
  { date: 'Wed', opened: 38, resolved: 42, pending: 10 },
  { date: 'Thu', opened: 65, resolved: 55, pending: 18 },
  { date: 'Fri', opened: 48, resolved: 52, pending: 14 },
  { date: 'Sat', opened: 28, resolved: 32, pending: 8 },
  { date: 'Sun', opened: 22, resolved: 25, pending: 6 },
]

const ticketsBySeverityData = [
  { name: 'Critical', value: 12, color: COLORS.danger },
  { name: 'High', value: 28, color: COLORS.warning },
  { name: 'Medium', value: 45, color: COLORS.primary },
  { name: 'Low', value: 35, color: COLORS.success },
]

const responseTimeData = [
  { hour: '9AM', avgTime: 15 },
  { hour: '10AM', avgTime: 12 },
  { hour: '11AM', avgTime: 18 },
  { hour: '12PM', avgTime: 25 },
  { hour: '1PM', avgTime: 22 },
  { hour: '2PM', avgTime: 14 },
  { hour: '3PM', avgTime: 16 },
  { hour: '4PM', avgTime: 20 },
  { hour: '5PM', avgTime: 28 },
]

const ticketTypeData = [
  { type: 'Mobile Wallet', count: 45, resolved: 38 },
  { type: 'Bug Reports', count: 32, resolved: 28 },
  { type: 'Application Issues', count: 28, resolved: 22 },
  { type: 'Account Access', count: 24, resolved: 20 },
  { type: 'Payment Issues', count: 20, resolved: 18 },
  { type: 'Feature Requests', count: 15, resolved: 10 },
]

const agentPerformanceData = [
  { name: 'Sarah J.', tickets: 45, avgTime: 12, satisfaction: 4.8 },
  { name: 'Michael C.', tickets: 38, avgTime: 15, satisfaction: 4.6 },
  { name: 'Emma R.', tickets: 52, avgTime: 10, satisfaction: 4.9 },
  { name: 'David L.', tickets: 28, avgTime: 18, satisfaction: 4.4 },
]

const recentTickets = [
  { id: 'TKT-001', subject: 'Cannot access mobile wallet', customer: 'John Smith', severity: 'critical', status: 'open', created: '10 min ago' },
  { id: 'TKT-002', subject: 'App crashes on payment', customer: 'Jane Doe', severity: 'high', status: 'in_progress', created: '25 min ago' },
  { id: 'TKT-003', subject: 'Transaction not showing', customer: 'Bob Wilson', severity: 'medium', status: 'open', created: '1 hour ago' },
  { id: 'TKT-004', subject: 'Password reset issue', customer: 'Alice Brown', severity: 'low', status: 'resolved', created: '2 hours ago' },
  { id: 'TKT-005', subject: 'Reward points missing', customer: 'Charlie Davis', severity: 'medium', status: 'in_progress', created: '3 hours ago' },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'medium':
      return 'bg-blue-100 text-blue-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-yellow-100 text-yellow-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'resolved':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function SupportDashboardPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1000))
    setRefreshing(false)
  }

  const stats = [
    { title: 'Open Tickets', value: 120, change: '+12', trend: 'up', icon: Ticket, color: 'blue' },
    { title: 'In Progress', value: 45, change: '-5', trend: 'down', icon: Clock, color: 'purple' },
    { title: 'Resolved Today', value: 38, change: '+8', trend: 'up', icon: CheckCircle, color: 'green' },
    { title: 'Avg Response Time', value: '18m', change: '-3m', trend: 'up', icon: TrendingUp, color: 'orange' },
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
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
            <p className="text-gray-600 mt-1">Ticket workload, SLA health, and team performance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    )}
                    <span className="text-green-600 text-sm">{stat.change}</span>
                    <span className="text-gray-500 text-sm">vs yesterday</span>
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
        {/* Ticket Trend */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Ticket Trend (7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ticketTrendData}>
              <defs>
                <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="opened" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorOpened)" name="Opened" />
              <Area type="monotone" dataKey="resolved" stroke={COLORS.success} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Severity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Tickets by Severity</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={ticketsBySeverityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ticketsBySeverityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {ticketsBySeverityData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.value} tickets</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Avg Response Time by Hour</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" unit="m" />
              <Tooltip formatter={(value) => [`${value} min`, 'Avg Response']} />
              <Line type="monotone" dataKey="avgTime" stroke={COLORS.purple} strokeWidth={3} dot={{ fill: COLORS.purple, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket Types */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Tickets by Type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ticketTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="type" type="category" stroke="#6b7280" width={110} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill={COLORS.primary} name="Total" radius={[0, 4, 4, 0]} />
              <Bar dataKey="resolved" fill={COLORS.success} name="Resolved" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tickets & Agent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-gray-900">Recent Tickets</h2>
            <Link to="/support/tickets" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(ticket.severity)}`}>
                      {ticket.severity}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                  <p className="text-xs text-gray-500">{ticket.customer} • {ticket.created}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-gray-900">Agent Performance</h2>
            <span className="text-sm text-gray-500">Today</span>
          </div>
          <div className="space-y-4">
            {agentPerformanceData.map((agent, index) => (
              <div key={agent.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      {agent.tickets} tickets
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {agent.avgTime}m avg
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {agent.satisfaction}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLA Status & Playbooks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Status */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-2">SLA Status</h2>
          <p className="text-sm text-gray-600 mb-6">Service Level Agreement performance</p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-900">First response within 1h</span>
                <span className="font-medium text-gray-900">92%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-900">Resolution within 24h</span>
                <span className="font-medium text-gray-900">78%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-900">Customer Satisfaction (CSAT)</span>
                <span className="font-medium text-gray-900">4.6 / 5</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-900">Escalation Rate</span>
                <span className="font-medium text-gray-900">8%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links / Playbooks */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-2">Support Playbooks</h2>
          <p className="text-sm text-gray-600 mb-6">Quick links for common issue categories</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Mobile Wallet Issues', icon: '📱', count: 45 },
              { name: 'Bug Reports', icon: '🐛', count: 32 },
              { name: 'Payment Problems', icon: '💳', count: 28 },
              { name: 'Account Access', icon: '🔐', count: 24 },
              { name: 'Refund Requests', icon: '💰', count: 20 },
              { name: 'Feature Requests', icon: '✨', count: 15 },
            ].map((playbook) => (
              <div
                key={playbook.name}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{playbook.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{playbook.name}</span>
                </div>
                <p className="text-xs text-gray-500">{playbook.count} active tickets</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
