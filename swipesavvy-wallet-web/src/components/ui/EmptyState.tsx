import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Button, type ButtonProps } from './Button'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: ButtonProps['variant']
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-6 h-6 text-neutral-400" />}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Specific empty states
export function NoTransactions({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      title="No transactions yet"
      description="Your transaction history will appear here once you start using your wallet."
      action={
        onAction
          ? { label: 'Add Money', onClick: onAction }
          : undefined
      }
    />
  )
}

export function NoGoals({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      title="No savings goals"
      description="Start saving for what matters by creating your first goal."
      action={{ label: 'Create Goal', onClick: onAction }}
    />
  )
}

export function NoBudgets({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      title="No budgets set"
      description="Take control of your spending by setting up budgets for different categories."
      action={{ label: 'Create Budget', onClick: onAction }}
    />
  )
}

export function NoCards({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      title="No cards added"
      description="Add a debit or credit card to start making purchases and earning rewards."
      action={{ label: 'Add Card', onClick: onAction }}
    />
  )
}

export function NoResults({ query }: { query?: string }) {
  return (
    <EmptyState
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try a different search.`
          : "Try adjusting your filters or search terms."
      }
    />
  )
}
