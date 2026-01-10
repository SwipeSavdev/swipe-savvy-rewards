/**
 * Audit Store - Centralized audit logging for all CRUD operations
 * Automatically captures events from the event bus and logs them
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEventBusStore, type EventType } from './eventBusStore'

export interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  module: string
  entityType: string
  entityId?: string
  entityName?: string
  userId?: string
  userName?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

interface AuditState {
  logs: AuditLogEntry[]
  maxLogs: number
  addLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void
  clearLogs: () => void
  getLogsByModule: (module: string) => AuditLogEntry[]
  getLogsByEntity: (entityType: string, entityId?: string) => AuditLogEntry[]
  getRecentLogs: (count?: number) => AuditLogEntry[]
}

// Generate unique ID for audit entries
const generateAuditId = () => `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

// Get current user info from auth store (if available)
const getCurrentUser = () => {
  try {
    const authData = localStorage.getItem('swipesavvy-auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      return {
        userId: parsed?.state?.user?.id || 'system',
        userName: parsed?.state?.user?.name || parsed?.state?.user?.email || 'System',
      }
    }
  } catch {
    // Ignore errors
  }
  return { userId: 'system', userName: 'System' }
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      logs: [],
      maxLogs: 1000, // Keep last 1000 logs

      addLog: (entry) => {
        const { userId, userName } = getCurrentUser()
        const newEntry: AuditLogEntry = {
          id: generateAuditId(),
          timestamp: new Date().toISOString(),
          userId,
          userName,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          ...entry,
        }

        set((state) => ({
          logs: [newEntry, ...state.logs].slice(0, state.maxLogs),
        }))

        // Also send to backend API (fire and forget)
        sendToBackend(newEntry).catch(() => {
          // Silently fail - local logging is primary
        })
      },

      clearLogs: () => set({ logs: [] }),

      getLogsByModule: (module) => {
        return get().logs.filter((log) => log.module === module)
      },

      getLogsByEntity: (entityType, entityId) => {
        return get().logs.filter(
          (log) => log.entityType === entityType && (!entityId || log.entityId === entityId)
        )
      },

      getRecentLogs: (count = 50) => {
        return get().logs.slice(0, count)
      },
    }),
    {
      name: 'swipesavvy-audit-logs',
      partialize: (state) => ({ logs: state.logs.slice(0, 100) }), // Only persist last 100 logs
    }
  )
)

// Send audit log to backend API
async function sendToBackend(entry: AuditLogEntry): Promise<void> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  try {
    await fetch(`${API_BASE}/api/admin/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
  } catch {
    // Silently fail
  }
}

// Map event types to audit actions
const EVENT_TO_AUDIT_MAP: Record<string, { action: string; module: string; entityType: string }> = {
  'merchant:created': { action: 'CREATE', module: 'merchants', entityType: 'merchant' },
  'merchant:updated': { action: 'UPDATE', module: 'merchants', entityType: 'merchant' },
  'merchant:deleted': { action: 'DELETE', module: 'merchants', entityType: 'merchant' },
  'merchant:status_changed': { action: 'STATUS_CHANGE', module: 'merchants', entityType: 'merchant' },
  'merchant:onboarding_completed': { action: 'ONBOARDING_COMPLETE', module: 'merchants', entityType: 'merchant' },

  'charity:approved': { action: 'APPROVE', module: 'charities', entityType: 'charity' },
  'charity:rejected': { action: 'REJECT', module: 'charities', entityType: 'charity' },
  'charity:created': { action: 'CREATE', module: 'charities', entityType: 'charity' },
  'charity:updated': { action: 'UPDATE', module: 'charities', entityType: 'charity' },

  'user:created': { action: 'CREATE', module: 'users', entityType: 'user' },
  'user:updated': { action: 'UPDATE', module: 'users', entityType: 'user' },
  'user:deleted': { action: 'DELETE', module: 'users', entityType: 'user' },
  'user:role_changed': { action: 'ROLE_CHANGE', module: 'users', entityType: 'user' },

  'ticket:created': { action: 'CREATE', module: 'support', entityType: 'ticket' },
  'ticket:updated': { action: 'UPDATE', module: 'support', entityType: 'ticket' },
  'ticket:status_changed': { action: 'STATUS_CHANGE', module: 'support', entityType: 'ticket' },
  'ticket:resolved': { action: 'RESOLVE', module: 'support', entityType: 'ticket' },
  'ticket:closed': { action: 'CLOSE', module: 'support', entityType: 'ticket' },

  'campaign:created': { action: 'CREATE', module: 'marketing', entityType: 'campaign' },
  'campaign:updated': { action: 'UPDATE', module: 'marketing', entityType: 'campaign' },
  'campaign:published': { action: 'PUBLISH', module: 'marketing', entityType: 'campaign' },
  'campaign:deleted': { action: 'DELETE', module: 'marketing', entityType: 'campaign' },

  'feature_flag:toggled': { action: 'TOGGLE', module: 'feature_flags', entityType: 'feature_flag' },
  'feature_flag:updated': { action: 'UPDATE', module: 'feature_flags', entityType: 'feature_flag' },
  'feature_flag:created': { action: 'CREATE', module: 'feature_flags', entityType: 'feature_flag' },

  'role:created': { action: 'CREATE', module: 'rbac', entityType: 'role' },
  'role:updated': { action: 'UPDATE', module: 'rbac', entityType: 'role' },
  'role:deleted': { action: 'DELETE', module: 'rbac', entityType: 'role' },

  'policy:created': { action: 'CREATE', module: 'rbac', entityType: 'policy' },
  'policy:updated': { action: 'UPDATE', module: 'rbac', entityType: 'policy' },
  'policy:deleted': { action: 'DELETE', module: 'rbac', entityType: 'policy' },

  'permission:created': { action: 'CREATE', module: 'rbac', entityType: 'permission' },
  'permission:deleted': { action: 'DELETE', module: 'rbac', entityType: 'permission' },

  'settings:updated': { action: 'UPDATE', module: 'settings', entityType: 'setting' },
}

// Initialize audit logging by subscribing to events
export function initializeAuditLogging(): () => void {
  const eventTypes = Object.keys(EVENT_TO_AUDIT_MAP) as EventType[]
  const unsubscribers: (() => void)[] = []

  eventTypes.forEach((eventType) => {
    const unsubscribe = useEventBusStore.getState().subscribe(eventType, (payload) => {
      const mapping = EVENT_TO_AUDIT_MAP[eventType]
      if (mapping) {
        const data = payload.data as Record<string, unknown> | undefined
        useAuditStore.getState().addLog({
          action: mapping.action,
          module: mapping.module,
          entityType: mapping.entityType,
          entityId: (data?.id || data?.entityId) as string | undefined,
          entityName: (data?.name || data?.entityName) as string | undefined,
          details: data,
        })
      }
    })
    unsubscribers.push(unsubscribe)
  })

  // Return cleanup function
  return () => {
    unsubscribers.forEach((unsub) => unsub())
  }
}

// Hook for manual audit logging
export function useAuditLog() {
  const addLog = useAuditStore((state) => state.addLog)

  return {
    logAction: (
      action: string,
      module: string,
      entityType: string,
      entityId?: string,
      entityName?: string,
      details?: Record<string, unknown>
    ) => {
      addLog({
        action,
        module,
        entityType,
        entityId,
        entityName,
        details,
      })
    },
    logCreate: (module: string, entityType: string, entityId?: string, entityName?: string) => {
      addLog({ action: 'CREATE', module, entityType, entityId, entityName })
    },
    logUpdate: (module: string, entityType: string, entityId?: string, entityName?: string, details?: Record<string, unknown>) => {
      addLog({ action: 'UPDATE', module, entityType, entityId, entityName, details })
    },
    logDelete: (module: string, entityType: string, entityId?: string, entityName?: string) => {
      addLog({ action: 'DELETE', module, entityType, entityId, entityName })
    },
  }
}
