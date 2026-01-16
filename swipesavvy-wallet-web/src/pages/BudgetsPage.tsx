import { useEffect, useState } from 'react'
import { Plus, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react'
import { useBudgetStore } from '../store'
import { Card, Button, Modal, Input, Select, CircularProgress, Skeleton, NoBudgets, Badge } from '../components/ui'
import { formatCurrency } from '../utils/format'
import { cn } from '../utils/cn'

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Bills & Utilities',
  'Health & Fitness',
  'Travel',
  'Personal Care',
  'Education',
  'Other',
]

export function BudgetsPage() {
  const { budgets, summary, alerts, isLoading, fetchBudgets, fetchSummary, fetchAlerts, createBudget, deleteBudget } = useBudgetStore()
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchBudgets()
    fetchSummary()
    fetchAlerts()
  }, [fetchBudgets, fetchSummary, fetchAlerts])

  const handleDelete = async (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(budgetId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Budgets</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Set spending limits and track your expenses
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Budget
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="p-4 border-warning-200 dark:border-warning-800 bg-warning-50 dark:bg-warning-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-warning-800 dark:text-warning-200">Budget Alerts</h3>
              <ul className="mt-2 space-y-1">
                {alerts.map((alert) => (
                  <li key={alert.budgetId} className="text-sm text-warning-700 dark:text-warning-300">
                    {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Budgeted</p>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              {formatCurrency(summary.totalBudgeted)}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Spent</p>
            <p className="text-xl font-bold text-danger-600 dark:text-danger-400">
              {formatCurrency(summary.totalSpent)}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Remaining</p>
            <p className="text-xl font-bold text-success-600 dark:text-success-400">
              {formatCurrency(summary.totalRemaining)}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Over Budget</p>
            <p className={cn(
              'text-xl font-bold',
              summary.budgetsOverLimit > 0
                ? 'text-danger-600 dark:text-danger-400'
                : 'text-success-600 dark:text-success-400'
            )}>
              {summary.budgetsOverLimit}
            </p>
          </Card>
        </div>
      )}

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="w-16 h-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </Card>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <Card className="p-8">
          <NoBudgets onAction={() => setShowCreateModal(true)} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const percentage = budget.percentage
            const isOverBudget = percentage > 100
            const isNearLimit = percentage >= 80 && percentage < 100

            return (
              <Card key={budget.id} className="p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
                      {budget.category}
                    </h3>
                    <Badge
                      variant={budget.period === 'monthly' ? 'info' : 'default'}
                      size="sm"
                      className="mt-1"
                    >
                      {budget.period}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 rounded-md hover:bg-danger-50 dark:hover:bg-danger-900/30 text-neutral-400 hover:text-danger-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <CircularProgress
                      value={Math.min(percentage, 100)}
                      size={60}
                      strokeWidth={6}
                      color={isOverBudget ? 'danger' : isNearLimit ? 'warning' : 'primary'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Spent</span>
                    <span className={cn(
                      'font-medium',
                      isOverBudget ? 'text-danger-600 dark:text-danger-400' : 'text-neutral-900 dark:text-neutral-50'
                    )}>
                      {formatCurrency(budget.spentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Budget</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-50">
                      {formatCurrency(budget.budgetAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Remaining</span>
                    <span className={cn(
                      'font-medium',
                      budget.remaining < 0
                        ? 'text-danger-600 dark:text-danger-400'
                        : 'text-success-600 dark:text-success-400'
                    )}>
                      {formatCurrency(Math.max(0, budget.remaining))}
                    </span>
                  </div>
                </div>

                {isOverBudget && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2 text-danger-600 dark:text-danger-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        Over budget by {formatCurrency(budget.spentAmount - budget.budgetAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {!isOverBudget && percentage >= 100 && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">On track!</span>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await createBudget(data)
          setShowCreateModal(false)
        }}
        existingCategories={budgets.map((b) => b.category)}
      />
    </div>
  )
}

interface CreateBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { category: string; amount: number; period: 'weekly' | 'monthly' }) => Promise<void>
  existingCategories: string[]
}

function CreateBudgetModal({ isOpen, onClose, onSubmit, existingCategories }: CreateBudgetModalProps) {
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableCategories = CATEGORIES.filter((c) => !existingCategories.includes(c))

  const handleSubmit = async () => {
    if (!category || !amount) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        category,
        amount: parseFloat(amount),
        period,
      })
      setCategory('')
      setAmount('')
      setPeriod('monthly')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Create New Budget">
      <div className="space-y-4">
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: '', label: 'Select a category' },
            ...availableCategories.map((c) => ({ value: c, label: c })),
          ]}
        />

        <Input
          label="Budget Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          prefix="$"
          placeholder="0.00"
        />

        <Select
          label="Period"
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'weekly' | 'monthly')}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'weekly', label: 'Weekly' },
          ]}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting || !category || !amount}>
            Create Budget
          </Button>
        </div>
      </div>
    </Modal>
  )
}
