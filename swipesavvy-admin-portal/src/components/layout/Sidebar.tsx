/**
 * ============================================================================
 * SWIPESAVVY ADMIN PORTAL - SIDEBAR COMPONENT V5
 * COMPLETE RESET - Built from scratch
 * ============================================================================
 *
 * Design Philosophy: PRECISION OVER DELIGHT
 * - Collapsible navigation (240px → 56px)
 * - Navigation groups with clear hierarchy
 * - Active state with left accent indicator
 * - Icons + labels (icons only when collapsed)
 * - NO decorative elements
 *
 * Accessibility:
 * - Proper ARIA labels and roles
 * - Keyboard navigable
 * - Focus indicators
 * - Tooltips when collapsed
 */

import { BrandLogo } from '@/components/BrandAssets'
import Badge from '@/components/ui/Badge'
import { NAV_GROUPS } from '@/router/nav'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import {
    AlertCircle,
    BarChart3,
    ChevronDown,
    ChevronRight,
    Filter,
    Flag,
    Home,
    LayoutDashboard,
    Lock,
    MessageSquare,
    PanelLeft,
    PanelLeftClose,
    Settings,
    Shield,
    Sparkles,
    TrendingUp,
    Users,
    Wallet,
    type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

// =============================================================================
// ICON MAPPING
// =============================================================================

const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  home: Home,
  chat: MessageSquare,
  star: Sparkles,
  chart_line: TrendingUp,
  chart_bar: BarChart3,
  lock: Lock,
  shield: Shield,
  users: Users,
  alert_circle: AlertCircle,
  wallet: Wallet,
  settings: Settings,
  flag: Flag,
  filter: Filter,
}

// =============================================================================
// SIDEBAR COMPONENT
// =============================================================================

export default function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed)
  const openGroups = useUiStore((s) => s.openNavGroups)
  const toggleGroup = useUiStore((s) => s.toggleNavGroup)

  return (
    <aside
      className={cn(
        'flex h-full flex-col',
        'bg-[var(--color-bg-primary)]',
        'border-r border-[var(--color-border-primary)]',
        'transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-in-out)]',
        collapsed ? 'w-[var(--layout-sidebar-width-collapsed)]' : 'w-[var(--layout-sidebar-width)]'
      )}
      aria-label="Main navigation"
    >
      {/* ─────────────────────────────────────────────────────────────────────
          HEADER - Logo
          ───────────────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center h-[var(--layout-header-height)]',
          'px-[var(--spacing-4)]',
          'border-b border-[var(--color-border-primary)]',
          collapsed && 'justify-center px-[var(--spacing-2)]'
        )}
      >
        {collapsed ? (
          // Collapsed: Show icon only
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-action-primary-bg)]">
            <span className="text-[var(--font-size-sm)] font-bold text-[var(--color-action-primary-text)]">
              SS
            </span>
          </div>
        ) : (
          // Expanded: Show full logo
          <>
            <BrandLogo
              variant="colored"
              product="swipesavvy"
              width={140}
              className="dark:hidden"
            />
            <BrandLogo
              variant="white"
              product="swipesavvy"
              width={140}
              className="hidden dark:block"
            />
          </>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          NAVIGATION
          ───────────────────────────────────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-[var(--spacing-4)] px-[var(--spacing-3)]"
        aria-label="Main navigation"
      >
        {NAV_GROUPS.map((group) => {
          const isOpen = openGroups[group.key] !== false
          return (
            <div key={group.key} className="mb-[var(--spacing-5)]">
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className={cn(
                  'flex w-full items-center gap-[var(--spacing-2)]',
                  'px-[var(--spacing-3)] py-[var(--spacing-1-5)]',
                  'text-[var(--font-size-xs)] font-medium uppercase',
                  'tracking-[var(--letter-spacing-wider)]',
                  'text-[var(--color-text-tertiary)]',
                  'hover:text-[var(--color-text-secondary)]',
                  'transition-colors duration-[var(--duration-fast)]',
                  'rounded-[var(--radius-sm)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]',
                  collapsed && 'justify-center'
                )}
                aria-expanded={isOpen}
                aria-controls={`nav-group-${group.key}`}
              >
                {!collapsed && <span className="flex-1 text-left">{group.label}</span>}
                {!collapsed && (
                  isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  )
                )}
                {collapsed && <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />}
              </button>

              {/* Nav Items */}
              {((!collapsed && isOpen) || collapsed) && (
                <ul
                  id={`nav-group-${group.key}`}
                  className={cn(
                    'mt-[var(--spacing-1)] space-y-[var(--spacing-0-5)]',
                    collapsed && 'flex flex-col items-center'
                  )}
                >
                  {group.items.map((item) => {
                    const IconComponent = item.icon ? iconMap[item.icon] : null
                    return (
                      <li key={item.key}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              'group relative flex items-center gap-[var(--spacing-3)]',
                              'rounded-[var(--radius-sm)]',
                              'px-[var(--spacing-3)] py-[var(--spacing-2)]',
                              'text-[var(--font-size-sm)] font-medium',
                              'transition-colors duration-[var(--duration-fast)]',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]',
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-[var(--color-action-primary-bg)]'
                                : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-secondary)]',
                              collapsed && 'justify-center px-[var(--spacing-2)]'
                            )
                          }
                          title={collapsed ? item.label : undefined}
                        >
                          {({ isActive }) => (
                            <>
                              {/* Active Indicator - Left accent bar */}
                              {isActive && (
                                <span
                                  className={cn(
                                    'absolute left-0 top-1/2 -translate-y-1/2',
                                    'w-[2px] h-5 rounded-r-full',
                                    'bg-[var(--color-action-primary-bg)]',
                                    collapsed && 'h-4'
                                  )}
                                  aria-hidden="true"
                                />
                              )}

                              {/* Icon */}
                              {IconComponent && (
                                <IconComponent
                                  className={cn(
                                    'flex-shrink-0 w-5 h-5',
                                    isActive && 'text-[var(--color-action-primary-bg)]'
                                  )}
                                  aria-hidden="true"
                                />
                              )}

                              {/* Label */}
                              {!collapsed && (
                                <span className="flex-1 truncate">{item.label}</span>
                              )}

                              {/* Badge */}
                              {!collapsed && typeof item.badge === 'number' && (
                                <Badge status="info" size="sm" className="ml-auto">
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────
          FOOTER
          ───────────────────────────────────────────────────────────────────── */}
      <div className="border-t border-[var(--color-border-primary)] p-[var(--spacing-3)]">
        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          className={cn(
            'flex w-full items-center gap-[var(--spacing-2)]',
            'rounded-[var(--radius-sm)]',
            'px-[var(--spacing-3)] py-[var(--spacing-2)]',
            'text-[var(--font-size-sm)] text-[var(--color-text-tertiary)]',
            'hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-secondary)]',
            'transition-colors duration-[var(--duration-fast)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]',
            collapsed && 'justify-center px-[var(--spacing-2)]'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5" aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </button>

        {/* Copyright */}
        {!collapsed && (
          <p className="mt-[var(--spacing-3)] text-center text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]">
            © {new Date().getFullYear()} SwipeSavvy
          </p>
        )}
      </div>
    </aside>
  )
}
