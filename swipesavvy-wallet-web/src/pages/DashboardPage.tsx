import { Wallet, TrendingUp, CreditCard, Gift, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const accounts = [
    { id: 1, name: 'Checking Account', number: '****1234', balance: 5247.32, type: 'checking' },
    { id: 2, name: 'Savings Account', number: '****5678', balance: 12893.45, type: 'savings' },
  ]

  const recentTransactions = [
    { id: 1, name: 'Starbucks', amount: -5.75, date: '2026-01-06', type: 'expense', category: 'Food & Drink' },
    { id: 2, name: 'Salary Deposit', amount: 3250.00, date: '2026-01-05', type: 'income', category: 'Salary' },
    { id: 3, name: 'Amazon', amount: -89.99, date: '2026-01-04', type: 'expense', category: 'Shopping' },
    { id: 4, name: 'Gas Station', amount: -45.20, date: '2026-01-03', type: 'expense', category: 'Transportation' },
    { id: 5, name: 'Cashback Reward', amount: 12.50, date: '2026-01-02', type: 'income', category: 'Rewards' },
  ]

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your accounts today.</p>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total Balance</span>
          </div>
          <div className="text-3xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-sm opacity-80 mt-1">Across all accounts</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-success" />
            <span className="text-sm text-gray-600">This Month</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">$487.23</div>
          <div className="text-sm text-success mt-1">+12.3% from last month</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-primary-500" />
            <span className="text-sm text-gray-600">Cards Active</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600 mt-1">2 credit, 1 debit</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Gift className="w-8 h-8 text-warning" />
            <span className="text-sm text-gray-600">Rewards</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">$124.50</div>
          <div className="text-sm text-warning mt-1">Available to redeem</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>
            <button className="text-primary-500 hover:text-primary-600 font-medium text-sm">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary-500 transition cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-600">{account.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-lg">
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{account.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowDownLeft className="w-5 h-5 text-success" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-danger" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{transaction.name}</div>
                    <div className="text-xs text-gray-600">{transaction.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-success' : 'text-gray-900'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 text-primary-500 hover:text-primary-600 font-medium text-sm py-2 border border-primary-500 rounded-lg hover:bg-primary-50 transition">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  )
}
