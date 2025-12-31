import { NavLink } from 'react-router-dom'
import { NAV_GROUPS } from '@/router/nav'
import { cn } from '@/utils/cn'
import { useUiStore } from '@/store/uiStore'
import Icon from '@/components/ui/Icon'
import Badge from '@/components/ui/Badge'

export default function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const openGroups = useUiStore((s) => s.openNavGroups)
  const toggleGroup = useUiStore((s) => s.toggleNavGroup)

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-[var(--ss-border)] bg-[var(--ss-surface)]',
        collapsed ? 'w-[76px]' : 'w-[280px]',
      )}
    >
      <div className={cn('flex items-center gap-2 border-b border-[var(--ss-border)] p-4', collapsed && 'justify-center')}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ss-primary)] text-white font-semibold">
          SS
        </div>
        {!collapsed ? (
          <div>
            <p className="font-headline text-sm font-semibold text-[var(--ss-text)]">SwipeSavvy</p>
            <p className="text-xs text-[var(--ss-text-muted)]">Admin Portal</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 overflow-auto p-2">
        {NAV_GROUPS.map((group) => {
          const isOpen = openGroups[group.key]
          return (
            <div key={group.key} className="mb-2">
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-muted)] hover:bg-[var(--ss-surface-alt)]',
                  collapsed && 'justify-center',
                )}
                aria-expanded={isOpen}
              >
                {!collapsed ? <span>{group.label}</span> : <Icon name="chevron_right" className="h-4 w-4" />}
                {!collapsed ? (
                  <Icon name={isOpen ? 'chevron_down' : 'chevron_right'} className="h-4 w-4" />
                ) : null}
              </button>

              {(!collapsed && isOpen) || collapsed ? (
                <div className={cn('mt-1 space-y-1', collapsed && 'flex flex-col items-center')}>
                  {group.items.map((item) => (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[var(--ss-primary-soft)] text-[var(--ss-primary)]'
                            : 'text-[var(--ss-text)] hover:bg-[var(--ss-surface-alt)]',
                          collapsed && 'justify-center px-2',
                        )
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      {item.icon && typeof item.icon === 'string' ? (
                        <Icon
                          name={item.icon as any}
                          className={cn(
                            'h-5 w-5 text-[var(--ss-text-muted)] group-[.active]:text-[var(--ss-primary)]',
                          )}
                        />
                      ) : null}
                      {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
                      {!collapsed && typeof item.badge === 'number' ? (
                        <Badge variant="primary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      ) : null}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>

      <div className={cn('border-t border-[var(--ss-border)] p-3', collapsed && 'flex justify-center')}>
        <p className={cn('text-xs text-[var(--ss-text-muted)]', collapsed && 'hidden')}>
          © {new Date().getFullYear()} SwipeSavvy
        </p>
      </div>
    </aside>
  )
}
