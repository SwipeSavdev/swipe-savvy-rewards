import Badge from '@/components/ui/Badge'
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon'
import { NAV_GROUPS } from '@/router/nav'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)
  const openGroups = useUiStore((s) => s.openNavGroups)
  const toggleGroup = useUiStore((s) => s.toggleNavGroup)

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-white dark:bg-ss-gray-900',
        'border-r border-[var(--ss-border)]',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]',
      )}
    >
      {/* Header with Logo */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 border-b border-[var(--ss-border)]',
          'bg-gradient-to-r from-ss-navy-600 to-ss-navy-700',
          collapsed && 'justify-center px-2'
        )}
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-ss-lg bg-gradient-to-br from-ss-yellow-400 to-ss-yellow-500 shadow-ss-md">
          <span className="font-display text-lg font-bold text-ss-navy-800">SS</span>
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-white truncate">SwipeSavvy</p>
            <p className="text-xs text-white/70">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        {NAV_GROUPS.map((group) => {
          const isOpen = openGroups[group.key] !== false
          return (
            <div key={group.key} className="mb-4">
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-ss-md px-2 py-1.5',
                  'text-xs font-semibold uppercase tracking-wider',
                  'text-ss-gray-500 dark:text-ss-gray-400',
                  'hover:text-ss-navy-600 dark:hover:text-ss-navy-400',
                  'transition-colors duration-base',
                  collapsed && 'justify-center'
                )}
                aria-expanded={isOpen}
              >
                {!collapsed && <span className="flex-1 text-left">{group.label}</span>}
                {!collapsed && (
                  isOpen
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                )}
                {collapsed && <ChevronRight className="w-4 h-4" />}
              </button>

              {/* Nav Items */}
              {((!collapsed && isOpen) || collapsed) && (
                <div className={cn('mt-1 space-y-0.5', collapsed && 'flex flex-col items-center')}>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-ss-md px-3 py-2.5',
                          'text-sm font-medium',
                          'transition-all duration-base',
                          isActive
                            ? 'bg-ss-navy-50 text-ss-navy-700 dark:bg-ss-navy-900/50 dark:text-ss-navy-300'
                            : 'text-ss-gray-600 hover:bg-ss-gray-50 hover:text-ss-gray-900 dark:text-ss-gray-400 dark:hover:bg-ss-gray-800 dark:hover:text-ss-gray-200',
                          collapsed && 'justify-center px-2',
                        )
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Indicator */}
                          {isActive && (
                            <span
                              className={cn(
                                'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full',
                                'bg-ss-green-500',
                                collapsed && 'left-0 w-0.5 h-4'
                              )}
                            />
                          )}

                          {/* Icon */}
                          {item.icon && typeof item.icon === 'string' && (
                            <BrandingKitIcon
                              name={item.icon as any}
                              size="md"
                              className={cn(
                                'flex-shrink-0',
                                isActive ? 'text-ss-navy-600 dark:text-ss-navy-400' : ''
                              )}
                            />
                          )}

                          {/* Label */}
                          {!collapsed && (
                            <span className="flex-1 truncate">{item.label}</span>
                          )}

                          {/* Badge */}
                          {!collapsed && typeof item.badge === 'number' && (
                            <Badge
                              colorScheme="navy"
                              variant="soft"
                              size="sm"
                              className="ml-auto"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--ss-border)] p-3">
        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          className={cn(
            'flex w-full items-center gap-2 rounded-ss-md px-3 py-2',
            'text-sm text-ss-gray-500 dark:text-ss-gray-400',
            'hover:bg-ss-gray-50 hover:text-ss-gray-700',
            'dark:hover:bg-ss-gray-800 dark:hover:text-ss-gray-200',
            'transition-colors duration-base',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>

        {/* Copyright */}
        {!collapsed && (
          <p className="mt-3 text-center text-xs text-ss-gray-400 dark:text-ss-gray-500">
            © {new Date().getFullYear()} SwipeSavvy
          </p>
        )}
      </div>
    </aside>
  )
}
