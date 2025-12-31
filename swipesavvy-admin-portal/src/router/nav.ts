export interface NavItem {
  key: string
  label: string
  to: string
  icon?: string
  badge?: number
}

export interface NavGroup {
  key: string
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: 'main',
    label: 'Main',
    items: [{ key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: 'dashboard' }],
  },
  {
    key: 'support',
    label: 'Support',
    items: [
      { key: 'support_dashboard', label: 'Dashboard', to: '/support', icon: 'support' },
      { key: 'support_tickets', label: 'Tickets', to: '/support/tickets', icon: 'chat', badge: 3 },
      { key: 'support_concierge', label: 'AI Concierge', to: '/support/concierge', icon: 'sparkles' },
    ],
  },
  {
    key: 'administration',
    label: 'Administration',
    items: [
      { key: 'admin_users', label: 'Admin Users', to: '/admin/users', icon: 'profile' },
      { key: 'audit_logs', label: 'Audit Logs', to: '/admin/audit-logs', icon: 'lock' },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    items: [
      { key: 'users', label: 'Users', to: '/users', icon: 'community' },
      { key: 'analytics', label: 'Analytics', to: '/analytics', icon: 'leaderboard' },
      { key: 'merchants', label: 'Merchants', to: '/merchants', icon: 'finance' },
      { key: 'settings', label: 'Settings', to: '/settings', icon: 'settings' },
    ],
  },
  {
    key: 'tools',
    label: 'Tools',
    items: [
      { key: 'ai_marketing', label: 'AI Marketing', to: '/tools/ai-marketing', icon: 'sparkles' },
      { key: 'feature_flags', label: 'Feature Flags', to: '/tools/feature-flags', icon: 'filter' },
    ],
  },
]

export const ROUTE_LABELS: Record<string, string> = NAV_GROUPS.flatMap((g) => g.items).reduce(
  (acc, item) => {
    acc[item.to] = item.label
    return acc
  },
  {} as Record<string, string>,
)
