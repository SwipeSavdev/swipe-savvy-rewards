import { Gift, TrendingUp, Star, DollarSign } from 'lucide-react'

export function RewardsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Rewards & Cashback</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-warning to-yellow-500 rounded-2xl p-6 text-white shadow-lg">
          <Gift className="w-10 h-10 mb-4" />
          <div className="text-sm opacity-90 mb-2">Available Rewards</div>
          <div className="text-4xl font-bold">$124.50</div>
          <button className="mt-4 w-full bg-white text-warning font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition">
            Redeem Now
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <TrendingUp className="w-10 h-10 text-success mb-4" />
          <div className="text-sm text-gray-600 mb-2">Earned This Month</div>
          <div className="text-4xl font-bold text-gray-900">$47.25</div>
          <div className="text-sm text-success mt-2">+15.3% from last month</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <Star className="w-10 h-10 text-primary-500 mb-4" />
          <div className="text-sm text-gray-600 mb-2">Rewards Points</div>
          <div className="text-4xl font-bold text-gray-900">12,450</div>
          <div className="text-sm text-gray-600 mt-2">Worth $124.50</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Rewards</h2>
        <div className="space-y-3">
          {[
            { merchant: 'Starbucks', amount: 2.50, date: '2026-01-06', type: '5% cashback' },
            { merchant: 'Amazon', amount: 8.99, date: '2026-01-04', type: '10% cashback' },
            { merchant: 'Shell', amount: 1.35, date: '2026-01-03', type: '3% cashback' },
          ].map((reward, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{reward.merchant}</div>
                  <div className="text-sm text-gray-600">{reward.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-success">+${reward.amount}</div>
                <div className="text-sm text-gray-600">{new Date(reward.date).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
