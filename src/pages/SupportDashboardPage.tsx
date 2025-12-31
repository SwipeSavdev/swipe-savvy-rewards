import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users
} from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/support/dashboard/metrics`)
      setMetrics(response.data.metrics)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getResolutionRate = () => {
    if (!metrics) return 0
    const total = metrics.total_tickets || 1
    return Math.round((metrics.resolved / total) * 100)
  }

  const chartData = [
    { name: 'Open', value: metrics?.open_tickets || 0, fill: '#3b82f6' },
    { name: 'In Progress', value: metrics?.in_progress || 0, fill: '#8b5cf6' },
    { name: 'Resolved', value: metrics?.resolved || 0, fill: '#10b981' }
  ]

  const timelineData = [
    { day: 'Mon', tickets: 12, resolved: 8 },
    { day: 'Tue', tickets: 15, resolved: 11 },
    { day: 'Wed', tickets: 10, resolved: 9 },
    { day: 'Thu', tickets: 18, resolved: 14 },
    { day: 'Fri', tickets: 22, resolved: 18 },
    { day: 'Sat', tickets: 8, resolved: 6 },
    { day: 'Sun', tickets: 5, resolved: 5 }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Support system overview and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.total_tickets || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tickets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.open_tickets || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                {metrics?.high_priority_open || 0} high priority
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.in_progress || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                Avg: {metrics?.average_response_time_hours || 0}h
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.resolved || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                {getResolutionRate()}% resolution rate
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Ticket Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-6">Weekly Ticket Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tickets" stroke="#3b82f6" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics?.average_response_time_hours || 0}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">{getResolutionRate()}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority Open</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.high_priority_open || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
