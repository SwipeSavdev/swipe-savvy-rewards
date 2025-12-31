import { Users, TrendingUp, Gift, Activity } from 'lucide-react'

const kpis = [
  {
    title: 'Active Users',
    value: '1.2K',
    change: '+12%',
    icon: Users,
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Total Transactions',
    value: '$45.6K',
    change: '+8%',
    icon: TrendingUp,
    color: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    title: 'Points Earned',
    value: '125.4K',
    change: '+24%',
    icon: Gift,
    color: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
  {
    title: 'System Health',
    value: '99.8%',
    change: '+0.1%',
    icon: Activity,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
]

const activities = [
  { id: 1, action: 'New user registered', time: '2 minutes ago' },
  { id: 2, action: 'Transaction completed', time: '5 minutes ago' },
  { id: 3, action: 'Points redeemed', time: '12 minutes ago' },
  { id: 4, action: 'Offer activated', time: '1 hour ago' },
  { id: 5, action: 'System backup completed', time: '3 hours ago' },
]

export function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your platform overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.title} className="bg-white rounded-lg shadow p-6">
              <div className={`w-12 h-12 rounded-lg ${kpi.color} flex items-center justify-center mb-4`}>
                <Icon size={24} className={kpi.iconColor} />
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{kpi.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
              <p className="text-green-600 text-sm font-medium mt-2">{kpi.change}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
              <p className="text-gray-700 font-medium">{activity.action}</p>
              <span className="text-gray-500 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
