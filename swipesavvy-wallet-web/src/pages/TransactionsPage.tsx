import { useState } from 'react'
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Card, Button } from '../components/ui'

export function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const transactions = [
    { id: 1, name: 'Starbucks Coffee', amount: -5.75, date: '2026-01-06', category: 'Food & Drink', status: 'completed' },
    { id: 2, name: 'Salary Deposit', amount: 3250.00, date: '2026-01-05', category: 'Income', status: 'completed' },
    { id: 3, name: 'Amazon Purchase', amount: -89.99, date: '2026-01-04', category: 'Shopping', status: 'completed' },
    { id: 4, name: 'Shell Gas Station', amount: -45.20, date: '2026-01-03', category: 'Transportation', status: 'completed' },
    { id: 5, name: 'Cashback Reward', amount: 12.50, date: '2026-01-02', category: 'Rewards', status: 'completed' },
    { id: 6, name: 'Whole Foods', amount: -123.45, date: '2026-01-01', category: 'Groceries', status: 'completed' },
    { id: 7, name: 'Netflix Subscription', amount: -15.99, date: '2025-12-31', category: 'Entertainment', status: 'completed' },
    { id: 8, name: 'Gym Membership', amount: -50.00, date: '2025-12-30', category: 'Health', status: 'completed' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Transactions</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            View and manage your transaction history
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <select className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-primary-500 outline-none">
            <option>All Categories</option>
            <option>Food & Drink</option>
            <option>Shopping</option>
            <option>Transportation</option>
            <option>Income</option>
          </select>
          <Button variant="secondary" className="justify-center">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.amount > 0
                          ? 'bg-success-50 dark:bg-success-900/30'
                          : 'bg-danger-50 dark:bg-danger-900/30'
                      }`}>
                        {transaction.amount > 0 ? (
                          <ArrowDownLeft className="w-5 h-5 text-success-600 dark:text-success-400" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                        )}
                      </div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-50">{transaction.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`font-semibold ${
                      transaction.amount > 0
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-neutral-900 dark:text-neutral-50'
                    }`}>
                      {transaction.amount > 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
