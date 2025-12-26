import { useState } from 'react'
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

interface ChartData {
  label: string
  value: number
}

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30days')

  // Mock data
  const revenueData: ChartData[] = [
    { label: 'Jan', value: 12000 },
    { label: 'Feb', value: 15000 },
    { label: 'Mar', value: 18000 },
    { label: 'Apr', value: 22000 },
    { label: 'May', value: 25000 },
    { label: 'Jun', value: 28000 },
  ]

  const userGrowthData: ChartData[] = [
    { label: 'Jan', value: 1000 },
    { label: 'Feb', value: 1500 },
    { label: 'Mar', value: 2200 },
    { label: 'Apr', value: 3100 },
    { label: 'May', value: 4200 },
    { label: 'Jun', value: 5500 },
  ]

  const maxRevenue = Math.max(...revenueData.map(d => d.value))
  const maxUsers = Math.max(...userGrowthData.map(d => d.value))

  const SimpleChart = ({ data, max, color }: { data: ChartData[], max: number, color: string }) => (
    <div className="flex items-end gap-3 h-40">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center">
          <div className="text-xs text-gray-500 mb-2">${(d.value / 1000).toFixed(0)}k</div>
          <div
            className={`w-full ${color} rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
            style={{ height: `${(d.value / max) * 100}%` }}
            title={`${d.label}: $${d.value}`}
          />
          <div className="text-xs text-gray-600 mt-2">{d.label}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">Track platform metrics and performance</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$145,200</p>
                <p className="text-green-600 text-sm mt-2">↑ 12% from last period</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">5,542</p>
                <p className="text-blue-600 text-sm mt-2">↑ 8% from last period</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12,450</p>
                <p className="text-purple-600 text-sm mt-2">↑ 15% from last period</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm">Avg Transaction Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$11.65</p>
                <p className="text-orange-600 text-sm mt-2">↑ 3% from last period</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
            <SimpleChart data={revenueData} max={maxRevenue} color="bg-green-500" />
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
            <SimpleChart data={userGrowthData} max={maxUsers} color="bg-blue-500" />
          </div>
        </div>

        {/* Top Performing Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Features</h2>
            <div className="space-y-4">
              {[
                { name: 'Challenges', usage: 4521, percentage: 85 },
                { name: 'Rewards', usage: 3245, percentage: 68 },
                { name: 'Transfers', usage: 2890, percentage: 58 },
                { name: 'Investments', usage: 1542, percentage: 35 },
              ].map((feature) => (
                <div key={feature.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                    <span className="text-sm text-gray-600">{feature.usage.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${feature.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Segments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Segments</h2>
            <div className="space-y-4">
              {[
                { name: 'Active Daily', count: 2100, color: 'bg-green-100 text-green-800' },
                { name: 'Weekly Users', count: 1800, color: 'bg-blue-100 text-blue-800' },
                { name: 'Monthly Users', count: 1200, color: 'bg-purple-100 text-purple-800' },
                { name: 'Inactive', count: 442, color: 'bg-gray-100 text-gray-800' },
              ].map((segment) => (
                <div key={segment.name} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">{segment.name}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${segment.color}`}>
                    {segment.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
          <div className="space-y-3">
            {[
              { stage: 'App Opened', count: 5542, percentage: 100 },
              { stage: 'Completed Profile', count: 4821, percentage: 87 },
              { stage: 'First Transaction', count: 3456, percentage: 62 },
              { stage: 'Second Transaction', count: 2147, percentage: 39 },
              { stage: 'Active User (30+ days)', count: 1245, percentage: 22 },
            ].map((step) => (
              <div key={step.stage}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{step.stage}</span>
                  <span className="text-sm text-gray-600">{step.count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${step.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
