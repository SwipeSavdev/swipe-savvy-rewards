import Badge from '@/components/ui/Badge'
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon'
import { NAV_GROUPS } from '@/router/nav'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const openGroups = useUiStore((s) => s.openNavGroups)
  const toggleGroup = useUiStore((s) => s.toggleNavGroup)

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-[var(--ss-border)] bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800',
        collapsed ? 'w-[76px]' : 'w-[280px]',
      )}
    >
      <div className={cn('flex items-center gap-2 border-b border-[var(--ss-border)] bg-gradient-to-r from-[#235393] to-[#1A3F7A] p-4', collapsed && 'justify-center')}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FAB915] to-[#FF8C00] text-white font-semibold shadow-md">
          SS
        </div>
        {!collapsed ? (
          <div>
            <p className="font-headline text-sm font-semibold text-white">SwipeSavvy</p>
            <p className="text-xs text-white/70">Admin Portal</p>
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
                  'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#235393] hover:bg-gradient-to-r hover:from-[#60BA46]/20 hover:to-[#60BA46]/10 transition-colors dark:text-[#7ACD56]',
                  collapsed && 'justify-center',
                )}
                aria-expanded={isOpen}
              >
                {!collapsed ? <span>{group.label}</span> : <BrandingKitIcon name="chevron_right" size="sm" />}
                {!collapsed ? (
                  <BrandingKitIcon name={isOpen ? 'chevron_down' : 'chevron_right'} size="sm" />
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
                          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-gradient-to-r from-[#60BA46]/25 to-[#60BA46]/10 text-[#235393] font-semibold border-l-4 border-[#60BA46] dark:text-[#7ACD56]'
                            : 'text-[#4B4D4D] hover:bg-gradient-to-r hover:from-[#235393]/10 hover:to-[#60BA46]/10 dark:text-[#A0A0A0] dark:hover:from-[#2E5FB8]/20 dark:hover:to-[#7ACD56]/10',
                          collapsed && 'justify-center px-2 border-l-0',
                        )
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      {item.icon && typeof item.icon === 'string' ? (
                        <BrandingKitIcon
                          name={item.icon as any}
                          size="md"
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
