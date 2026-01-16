import { useEffect, useRef } from 'react'
import { wsManager, type WSBalanceUpdate, type WSTransactionCreated, type WSRewardEarned, type WSGoalProgress, type WSBudgetAlert } from '../services/websocket'
import { useAuthStore, useWalletStore, useTransactionStore, useRewardsStore, useGoalsStore, useBudgetStore, useEventBusStore, useToastStore } from '../store'

const WS_URL = import.meta.env.VITE_WS_URL || ''
const WS_ENABLED = import.meta.env.VITE_WS_ENABLED === 'true'

/**
 * Hook for real-time sync via WebSocket
 * Automatically connects when authenticated and updates stores
 * WebSocket is disabled by default until backend WebSocket support is configured
 */
export function useRealTimeSync() {
  const { token, isAuthenticated } = useAuthStore()
  const { updateBalance } = useWalletStore()
  const { addTransaction, updateTransaction } = useTransactionStore()
  const { updatePoints } = useRewardsStore()
  const { updateGoalProgress } = useGoalsStore()
  const { updateBudgetSpending, fetchAlerts } = useBudgetStore()
  const { emit, setConnected } = useEventBusStore()
  const { success, warning, info } = useToastStore()

  const cleanupRef = useRef<(() => void)[]>([])

  useEffect(() => {
    // WebSocket disabled - skip connection
    if (!WS_ENABLED || !WS_URL) {
      return
    }

    if (!isAuthenticated || !token) {
      wsManager.disconnect()
      return
    }

    // Connect to WebSocket
    wsManager.connect({
      url: WS_URL,
      token,
    }).catch((error) => {
      console.error('WebSocket connection failed:', error)
    })

    // Subscribe to events
    const unsubscribers: (() => void)[] = []

    // Auth success
    unsubscribers.push(
      wsManager.on('auth_success', () => {
        setConnected(true)
        emit('connection:established', {}, 'websocket')
      })
    )

    // Auth error
    unsubscribers.push(
      wsManager.on('auth_error', (data: { message?: string }) => {
        setConnected(false)
        console.error('WebSocket auth error:', data.message)
      })
    )

    // Balance updates
    unsubscribers.push(
      wsManager.on<WSBalanceUpdate>('balance_update', (data) => {
        updateBalance(data)
        emit('balance:updated', data, 'websocket')
      })
    )

    // New transactions
    unsubscribers.push(
      wsManager.on<WSTransactionCreated>('transaction_created', (data) => {
        addTransaction({
          id: data.id,
          amount: data.amount,
          title: data.merchantName,
          category: data.category,
          type: data.type === 'credit' ? 'deposit' : 'payment',
          status: data.status as 'completed' | 'pending' | 'failed',
          timestamp: data.createdAt,
          description: data.merchantName,
          currency: 'USD',
        })
        emit('transaction:created', data, 'websocket')

        // Show notification
        if (data.type === 'credit') {
          success('Money Received', `+$${data.amount.toFixed(2)} from ${data.merchantName}`)
        }
      })
    )

    // Transaction updates
    unsubscribers.push(
      wsManager.on<{ id: string; status: string }>('transaction_updated', (data) => {
        updateTransaction(data.id, { status: data.status as 'completed' | 'pending' | 'failed' })
        emit('transaction:updated', data, 'websocket')
      })
    )

    // Rewards earned
    unsubscribers.push(
      wsManager.on<WSRewardEarned>('reward_earned', (data) => {
        updatePoints({
          available: data.totalPoints,
          tier: data.tier as 'bronze' | 'silver' | 'gold',
        })
        emit('rewards:points_earned', data, 'websocket')

        // Show notification
        info('Points Earned!', `+${data.points} points: ${data.reason}`)
      })
    )

    // Goal progress
    unsubscribers.push(
      wsManager.on<WSGoalProgress>('goal_progress', (data) => {
        updateGoalProgress(data.goalId, data.currentAmount)
        emit('goal:progress_changed', data, 'websocket')

        // Show notification if goal completed
        if (data.percentComplete >= 100) {
          success('Goal Completed!', 'Congratulations on reaching your savings goal!')
        }
      })
    )

    // Budget alerts
    unsubscribers.push(
      wsManager.on<WSBudgetAlert>('budget_alert', (data) => {
        updateBudgetSpending(data.budgetId, data.spent)
        fetchAlerts()
        emit('budget:threshold_reached', data, 'websocket')

        // Show notification
        if (data.alertType === 'over_limit') {
          warning('Budget Exceeded', `You've exceeded your ${data.category} budget`)
        } else {
          info('Budget Alert', `You've used ${data.percentUsed}% of your ${data.category} budget`)
        }
      })
    )

    // Store cleanup functions
    cleanupRef.current = unsubscribers

    // Cleanup on unmount
    return () => {
      cleanupRef.current.forEach((unsub) => unsub())
      cleanupRef.current = []
      wsManager.disconnect()
      setConnected(false)
    }
    // Note: Store functions are stable references from Zustand, only re-run on auth changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token])

  return {
    isConnected: wsManager.isConnected(),
    connectionState: wsManager.getState(),
  }
}

/**
 * Hook to subscribe to specific WebSocket events
 */
export function useWSEvent<T>(
  eventType: Parameters<typeof wsManager.on>[0],
  handler: (data: T) => void
) {
  useEffect(() => {
    const unsubscribe = wsManager.on<T>(eventType, handler)
    return unsubscribe
  }, [eventType, handler])
}
