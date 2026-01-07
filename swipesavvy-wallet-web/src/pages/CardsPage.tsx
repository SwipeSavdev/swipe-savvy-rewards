import { CreditCard, Plus, Lock, Eye } from 'lucide-react'

export function CardsPage() {
  const cards = [
    { id: 1, name: 'Visa Platinum', last4: '4532', type: 'credit', balance: 1234.56, limit: 5000, expires: '12/26' },
    { id: 2, name: 'Mastercard Gold', last4: '8976', type: 'credit', balance: 567.89, limit: 3000, expires: '08/27' },
    { id: 3, name: 'Debit Card', last4: '1234', type: 'debit', balance: 5247.32, expires: '03/28' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Cards</h1>
          <p className="text-gray-600 mt-1">Manage your credit and debit cards</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
          <Plus className="w-5 h-5" />
          <span>Add New Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm opacity-80">{card.name}</span>
                <CreditCard className="w-8 h-8" />
              </div>

              <div className="mb-6">
                <div className="text-2xl font-mono tracking-wider">**** **** **** {card.last4}</div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs opacity-80 mb-1">Balance</div>
                  <div className="text-xl font-bold">${card.balance.toLocaleString()}</div>
                  {card.limit && (
                    <div className="text-xs opacity-80 mt-1">Limit: ${card.limit.toLocaleString()}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-80 mb-1">Expires</div>
                  <div className="font-mono">{card.expires}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                <button className="text-sm flex items-center space-x-1 hover:opacity-80 transition">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button className="text-sm flex items-center space-x-1 hover:opacity-80 transition">
                  <Lock className="w-4 h-4" />
                  <span>Lock Card</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
