export type AuditAction =
  | 'login'
  | 'logout'
  | 'user_create'
  | 'user_update'
  | 'user_suspend'
  | 'merchant_update'
  | 'feature_flag_update'
  | 'support_ticket_update'

export interface AuditLogEntry {
  id: string
  actor: {
    id: string
    name: string
    email: string
  }
  action: AuditAction
  target?: {
    type: 'user' | 'merchant' | 'support_ticket' | 'feature_flag'
    id: string
    label?: string
  }
  ip?: string
  userAgent?: string
  createdAt: string
  meta?: Record<string, unknown>
}
