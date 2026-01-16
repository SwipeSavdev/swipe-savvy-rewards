import { create } from 'zustand'

/**
 * Event types for cross-store communication
 * Used primarily for WebSocket updates and real-time sync
 */
export type EventType =
  // Balance events
  | 'balance:updated'
  | 'balance:pending_changed'
  // Transaction events
  | 'transaction:created'
  | 'transaction:updated'
  | 'transaction:status_changed'
  // Rewards events
  | 'rewards:points_earned'
  | 'rewards:points_redeemed'
  | 'rewards:tier_changed'
  | 'rewards:boost_activated'
  | 'rewards:boost_expired'
  // Goal events
  | 'goal:created'
  | 'goal:updated'
  | 'goal:progress_changed'
  | 'goal:completed'
  // Budget events
  | 'budget:created'
  | 'budget:updated'
  | 'budget:threshold_reached'
  | 'budget:exceeded'
  // Card events
  | 'card:status_changed'
  | 'card:transaction_declined'
  // Transfer events
  | 'transfer:initiated'
  | 'transfer:completed'
  | 'transfer:failed'
  // Connection events
  | 'connection:established'
  | 'connection:lost'
  | 'connection:reconnecting'

export interface EventPayload {
  type: EventType
  data: unknown
  timestamp: number
  source?: 'websocket' | 'api' | 'local'
}

type EventHandler = (payload: EventPayload) => void

interface EventBusState {
  // Event history for debugging
  recentEvents: EventPayload[]
  maxEventHistory: number

  // Connection state
  isConnected: boolean
  lastEventTime: number | null

  // Actions
  emit: (type: EventType, data: unknown, source?: EventPayload['source']) => void
  subscribe: (type: EventType | EventType[], handler: EventHandler) => () => void
  setConnected: (connected: boolean) => void
  clearHistory: () => void
}

// Store handlers outside of zustand for performance
const handlers = new Map<EventType, Set<EventHandler>>()

export const useEventBusStore = create<EventBusState>((set, get) => ({
  recentEvents: [],
  maxEventHistory: 50,
  isConnected: false,
  lastEventTime: null,

  emit: (type, data, source = 'local') => {
    const payload: EventPayload = {
      type,
      data,
      timestamp: Date.now(),
      source,
    }

    // Add to history
    set((state) => ({
      recentEvents: [payload, ...state.recentEvents].slice(0, state.maxEventHistory),
      lastEventTime: payload.timestamp,
    }))

    // Notify handlers
    const typeHandlers = handlers.get(type)
    if (typeHandlers) {
      typeHandlers.forEach((handler) => {
        try {
          handler(payload)
        } catch (error) {
          console.error(`Event handler error for ${type}:`, error)
        }
      })
    }
  },

  subscribe: (types, handler) => {
    const typeArray = Array.isArray(types) ? types : [types]

    typeArray.forEach((type) => {
      if (!handlers.has(type)) {
        handlers.set(type, new Set())
      }
      handlers.get(type)!.add(handler)
    })

    // Return unsubscribe function
    return () => {
      typeArray.forEach((type) => {
        handlers.get(type)?.delete(handler)
      })
    }
  },

  setConnected: (connected) => {
    set({ isConnected: connected })
    get().emit(
      connected ? 'connection:established' : 'connection:lost',
      { connected },
      'websocket'
    )
  },

  clearHistory: () => {
    set({ recentEvents: [] })
  },
}))

// Convenience hook for subscribing to events
export function useEventSubscription(
  types: EventType | EventType[],
  handler: EventHandler,
  deps: unknown[] = []
) {
  // This would be used with useEffect in React components
  // The actual implementation would be in a custom hook file
  return { types, handler, deps }
}
