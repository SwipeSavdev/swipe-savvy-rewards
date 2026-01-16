import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useGoalsStore } from '../store'
import { Card, Button, Modal, Input, ProgressBar, Skeleton, NoGoals } from '../components/ui'
import { formatCurrency, formatDate } from '../utils/format'
import { cn } from '../utils/cn'

export function GoalsPage() {
  const { goals, isLoading, fetchGoals, createGoal, deleteGoal, contribute } = useGoalsStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [contributeAmount, setContributeAmount] = useState('')

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const selectedGoal = goals.find((g) => g.id === selectedGoalId)

  const handleContribute = async () => {
    if (!selectedGoalId || !contributeAmount) return
    const amount = parseFloat(contributeAmount)
    if (isNaN(amount) || amount <= 0) return

    try {
      await contribute(selectedGoalId, amount)
      setShowContributeModal(false)
      setContributeAmount('')
      setSelectedGoalId(null)
    } catch (error) {
      console.error('Failed to contribute:', error)
    }
  }

  const handleDelete = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Savings Goals</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Track your progress towards financial goals
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Goals Summary */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Goals</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{goals.length}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Saved</p>
            <p className="text-2xl font-bold text-success-600 dark:text-success-400">
              {formatCurrency(goals.reduce((sum, g) => sum + g.currentAmount, 0))}
            </p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Total Target</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              {formatCurrency(goals.reduce((sum, g) => sum + g.targetAmount, 0))}
            </p>
          </Card>
        </div>
      )}

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <Skeleton className="w-12 h-12 rounded-full mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-8">
          <NoGoals onAction={() => setShowCreateModal(true)} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const isComplete = progress >= 100

            return (
              <Card key={goal.id} className="p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-2xl">
                    {goal.icon || '🎯'}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 rounded-md hover:bg-danger-50 dark:hover:bg-danger-900/30 text-neutral-400 hover:text-danger-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
                  {goal.name}
                </h3>

                {goal.deadline && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Target: {formatDate(goal.deadline)}
                  </p>
                )}

                <ProgressBar
                  value={Math.min(progress, 100)}
                  max={100}
                  color={isComplete ? 'success' : 'primary'}
                  className="mb-3"
                />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {formatCurrency(goal.targetAmount)}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedGoalId(goal.id)
                      setShowContributeModal(true)
                    }}
                    disabled={isComplete}
                  >
                    {isComplete ? 'Goal Complete!' : 'Add Funds'}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          await createGoal(data)
          setShowCreateModal(false)
        }}
      />

      {/* Contribute Modal */}
      <Modal
        open={showContributeModal}
        onClose={() => {
          setShowContributeModal(false)
          setContributeAmount('')
          setSelectedGoalId(null)
        }}
        title={`Add Funds to ${selectedGoal?.name || 'Goal'}`}
      >
        <div className="space-y-4">
          {selectedGoal && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-500">Current</span>
                <span className="font-medium">{formatCurrency(selectedGoal.currentAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Remaining</span>
                <span className="font-medium">
                  {formatCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)}
                </span>
              </div>
            </div>
          )}

          <Input
            label="Amount"
            type="number"
            value={contributeAmount}
            onChange={(e) => setContributeAmount(e.target.value)}
            prefix="$"
            placeholder="0.00"
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowContributeModal(false)
                setContributeAmount('')
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleContribute}>
              Add Funds
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; targetAmount: number; targetDate?: string; icon?: string }) => Promise<void>
}

function CreateGoalModal({ isOpen, onClose, onSubmit }: CreateGoalModalProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const icons = ['🎯', '🏠', '✈️', '🚗', '💻', '📱', '🎓', '💍', '🏖️', '💰']

  const handleSubmit = async () => {
    if (!name || !targetAmount) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        targetAmount: parseFloat(targetAmount),
        targetDate: targetDate || undefined,
        icon,
      })
      setName('')
      setTargetAmount('')
      setTargetDate('')
      setIcon('🎯')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Create New Goal">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {icons.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={cn(
                  'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                  icon === i
                    ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-500'
                    : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Goal Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Emergency Fund"
        />

        <Input
          label="Target Amount"
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          prefix="$"
          placeholder="0.00"
        />

        <Input
          label="Target Date (Optional)"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting || !name || !targetAmount}>
            Create Goal
          </Button>
        </div>
      </div>
    </Modal>
  )
}
