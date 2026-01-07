import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Flag,
  Users,
  Store,
  BarChart3,
  Sparkles,
  MessageCircle,
  Settings,
  Ticket,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Bot
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  path?: string
  icon: React.ComponentType<any>
  submenu?: NavItem[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },

  // Support System
  {
    label: 'Support System',
    icon: Ticket,
    submenu: [
      { label: 'Dashboard', path: '/support', icon: LayoutDashboard },
      { label: 'Tickets', path: '/support/tickets', icon: Ticket },
      { label: 'Savvy AI', path: '/support/concierge', icon: Bot }
    ]
  },

  // Administration
  {
    label: 'Administration',
    icon: Settings,
    submenu: [
      { label: 'Admin Users', path: '/admin/users', icon: Users },
      { label: 'Audit Logs', path: '/admin/audit-logs', icon: LogOut }
    ]
  },

  // Business
  {
    label: 'Business',
    icon: BarChart3,
    submenu: [
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
      { label: 'Risk Reports', path: '/analytics/risk-reports', icon: AlertTriangle },
      { label: 'Merchants', path: '/merchants', icon: Store },
      { label: 'Users', path: '/users', icon: Users }
    ]
  },

  // Tools
  { label: 'Feature Flags', path: '/tools/feature-flags', icon: Flag },
  { label: 'AI Marketing', path: '/tools/ai-marketing', icon: Sparkles },
  { label: 'Savvy Concierge', path: '/concierge', icon: MessageCircle },
  { label: 'Settings', path: '/settings', icon: Settings }
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Support System')

  const isMenuActive = (menu: NavItem) => {
    if (!menu.submenu) return false
    return menu.submenu.some(item => location.pathname === item.path)
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon
          const hasSubmenu = !!item.submenu
          const isActive = isMenuActive(item) || (item.path && location.pathname === item.path)
          const isExpanded = expandedMenu === item.label

          return (
            <div key={item.label}>
              {hasSubmenu ? (
                <button
                  onClick={() => setExpandedMenu(isExpanded ? null : item.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive || isExpanded
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              ) : (
                <button
                  onClick={() => navigate(item.path!)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )}

              {/* Submenu */}
              {hasSubmenu && isExpanded && (
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
                  {item.submenu!.map(subitem => {
                    const SubIcon = subitem.icon
                    const isSubActive = location.pathname === subitem.path
                    return (
                      <button
                        key={subitem.path}
                        onClick={() => navigate(subitem.path!)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                          isSubActive
                            ? 'bg-blue-100 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <SubIcon size={16} />
                        <span>{subitem.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
