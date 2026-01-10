/**
 * Event Bus Store - Cross-module communication for real-time updates
 *
 * This store enables different pages/modules to communicate with each other
 * when CRUD operations happen. For example, when a merchant is created,
 * the dashboard can refresh its stats automatically.
 */

import { create } from 'zustand'

// Event types for cross-module communication
export type EventType =
  // Merchant events
  | 'merchant:created'
  | 'merchant:updated'
  | 'merchant:deleted'
  | 'merchant:status_changed'
  | 'merchant:onboarding_started'
  | 'merchant:onboarding_completed'
  | 'merchant:onboarding_submitted'
  // Charity events
  | 'charity:created'
  | 'charity:updated'
  | 'charity:deleted'
  | 'charity:approved'
  | 'charity:rejected'
  // User events
  | 'user:created'
  | 'user:updated'
  | 'user:deleted'
  | 'user:status_changed'
  | 'admin_user:created'
  | 'admin_user:updated'
  | 'admin_user:deleted'
  // Support events
  | 'ticket:created'
  | 'ticket:updated'
  | 'ticket:status_changed'
  | 'ticket:assigned'
  | 'ticket:resolved'
  | 'ticket:closed'
  // Campaign events
  | 'campaign:created'
  | 'campaign:updated'
  | 'campaign:published'
  | 'campaign:paused'
  | 'campaign:deleted'
  // Feature flag events
  | 'feature_flag:toggled'
  | 'feature_flag:created'
  | 'feature_flag:updated'
  | 'feature_flag:deleted'
  // RBAC events
  | 'role:created'
  | 'role:updated'
  | 'role:deleted'
  | 'policy:created'
  | 'policy:updated'
  | 'policy:deleted'
  | 'permission:created'
  | 'permission:deleted'
  // Settings events
  | 'settings:updated'
  | 'branding:updated'
  // Dashboard events
  | 'dashboard:refresh'
  // Audit events
  | 'audit:logged'

export interface EventPayload {
  type: EventType
  data?: any
  timestamp: number
  source?: string // Which page/component triggered the event
}

type EventHandler = (payload: EventPayload) => void

interface EventBusState {
  // Last events by type for components that mount after the event
  lastEvents: Partial<Record<EventType, EventPayload>>
  // Subscribers
  subscribers: Map<EventType, Set<EventHandler>>
  // Actions
  emit: (type: EventType, data?: any, source?: string) => void
  subscribe: (type: EventType, handler: EventHandler) => () => void
  subscribeMany: (types: EventType[], handler: EventHandler) => () => void
  getLastEvent: (type: EventType) => EventPayload | undefined
  clearLastEvent: (type: EventType) => void
}

export const useEventBusStore = create<EventBusState>()((set, get) => ({
  lastEvents: {},
  subscribers: new Map(),

  emit: (type, data, source) => {
    const payload: EventPayload = {
      type,
      data,
      timestamp: Date.now(),
      source,
    }

    // Store as last event of this type
    set((state) => ({
      lastEvents: {
        ...state.lastEvents,
        [type]: payload,
      },
    }))

    // Notify all subscribers
    const handlers = get().subscribers.get(type)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload)
        } catch (error) {
          console.error(`[EventBus] Error in handler for ${type}:`, error)
        }
      })
    }

    // Also emit to wildcard subscribers (dashboard:refresh triggers on any data change)
    if (type !== 'dashboard:refresh' && type !== 'audit:logged') {
      const dashboardHandlers = get().subscribers.get('dashboard:refresh')
      if (dashboardHandlers) {
        dashboardHandlers.forEach((handler) => {
          try {
            handler(payload)
          } catch (error) {
            console.error('[EventBus] Error in dashboard refresh handler:', error)
          }
        })
      }
    }

    // Log for debugging in development
    if (import.meta.env.DEV) {
      console.log(`[EventBus] ${type}`, { data, source })
    }
  },

  subscribe: (type, handler) => {
    const { subscribers } = get()

    if (!subscribers.has(type)) {
      subscribers.set(type, new Set())
    }

    subscribers.get(type)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = get().subscribers.get(type)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  },

  subscribeMany: (types, handler) => {
    const unsubscribers = types.map((type) => get().subscribe(type, handler))

    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  },

  getLastEvent: (type) => {
    return get().lastEvents[type]
  },

  clearLastEvent: (type) => {
    set((state) => {
      const { [type]: _, ...rest } = state.lastEvents
      return { lastEvents: rest }
    })
  },
}))

// Convenience hook for subscribing to events in components
import { useEffect } from 'react'

export function useEventSubscription(
  types: EventType | EventType[],
  handler: EventHandler,
  deps: any[] = []
) {
  const subscribe = useEventBusStore((s) => s.subscribe)
  const subscribeMany = useEventBusStore((s) => s.subscribeMany)

  useEffect(() => {
    const eventTypes = Array.isArray(types) ? types : [types]
    const unsubscribe = eventTypes.length === 1
      ? subscribe(eventTypes[0], handler)
      : subscribeMany(eventTypes, handler)

    return unsubscribe
  }, [types, ...deps])
}

// Helper to emit events from anywhere (including API calls)
export const eventBus = {
  emit: (type: EventType, data?: any, source?: string) => {
    useEventBusStore.getState().emit(type, data, source)
  },
  subscribe: (type: EventType, handler: EventHandler) => {
    return useEventBusStore.getState().subscribe(type, handler)
  },
}
