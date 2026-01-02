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
      { key: 'support_dashboard', label: 'Dashboard', to: '/support', icon: 'home' },
      { key: 'support_tickets', label: 'Tickets', to: '/support/tickets', icon: 'chat', badge: 3 },
      { key: 'support_concierge', label: 'Savvy AI', to: '/support/concierge', icon: 'star' },
    ],
  },
  {
    key: 'administration',
    label: 'Administration',
    items: [
      { key: 'ai_marketing_analytics', label: 'AI Marketing Analytics', to: '/admin/analytics', icon: 'chart_line' },
      { key: 'audit_logs', label: 'Audit Logs', to: '/admin/audit-logs', icon: 'lock' },
      { key: 'user_management', label: 'User Management', to: '/admin/user/management', icon: 'users' },
      { key: 'roles_manager', label: 'Roles Manager', to: '/admin/user/roles', icon: 'shield' },
      { key: 'permissions_manager', label: 'Permissions Manager', to: '/admin/user/permissions', icon: 'lock' },
      { key: 'policy_manager', label: 'Policy Manager', to: '/admin/user/policies', icon: 'shield' },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    items: [
      { key: 'users', label: 'Users', to: '/users', icon: 'users' },
      { key: 'analytics', label: 'Analytics', to: '/analytics', icon: 'chart_bar' },
      { key: 'risk_reports', label: 'Risk Reports', to: '/analytics/risk-reports', icon: 'alert_circle' },
      { key: 'merchants', label: 'Merchants', to: '/merchants', icon: 'wallet' },
      { key: 'settings', label: 'Settings', to: '/settings', icon: 'settings' },
    ],
  },
  {
    key: 'tools',
    label: 'Tools',
    items: [
      { key: 'ai_marketing', label: 'AI Marketing', to: '/tools/ai-marketing', icon: 'star' },
      { key: 'feature_flags', label: 'Feature Flags', to: '/tools/feature-flags', icon: 'filter' },
    ],
  },
  {
    key: 'donations',
    label: 'Donations',
    items: [
      { key: 'charity_onboarding', label: 'Charity Onboarding', to: '/donations/charities', icon: 'flag' },
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
