import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon'
import DropdownMenu from '@/components/ui/DropdownMenu'
import Icon from '@/components/ui/Icon'
import Input from '@/components/ui/Input'
import { buildBreadcrumbs } from '@/router/breadcrumbs'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { useUiStore } from '@/store/uiStore'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const breadcrumbs = buildBreadcrumbs(location.pathname)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const theme = useUiStore((s) => s.theme)
  const setSidebarMobileOpen = useUiStore((s) => s.setSidebarMobileOpen)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const pushToast = useToastStore((s) => s.push)

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ss-border)] bg-gradient-to-r from-[#235393] via-[#2E5FB8] to-[#1A3F7A] shadow-lg">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          className="rounded-md p-2 text-white hover:bg-white/20 transition-colors lg:hidden"
          onClick={() => setSidebarMobileOpen(true)}
          aria-label="Open menu"
        >
          <BrandingKitIcon name="menu" size="md" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <nav className="hidden min-w-0 items-center gap-2 text-sm text-white/70 sm:flex">
            {breadcrumbs.map((c, i) => (
              <div key={i} className="flex min-w-0 items-center gap-2">
                {c.to ? (
                  <Link to={c.to} className="truncate hover:text-white transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="truncate text-white/90">{c.label}</span>
                )}
                {i < breadcrumbs.length - 1 ? <span className="text-white/50">/</span> : null}
              </div>
            ))}
          </nav>

          <div className="hidden w-[420px] max-w-full lg:block">
            <Input
              placeholder="Search users, tickets, merchants..."
              leftSlot={<BrandingKitIcon name="search" size="sm" />}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu
            trigger={
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/20 transition-colors">
                <BrandingKitIcon name="bell" size="md" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-400 shadow-lg" />
              </span>
            }
            items={[
              {
                key: 'n1',
                label: 'New ticket: Card declined',
                icon: 'chat',
                onSelect: () => {
                  navigate('/support-tickets')
                  pushToast({ variant: 'info', title: 'Support Tickets', message: 'Navigating to support tickets.' })
                },
              },
              {
                key: 'n2',
                label: 'Merchant onboarding pending',
                icon: 'finance',
                onSelect: () => {
                  navigate('/merchants')
                  pushToast({ variant: 'warning', title: 'Merchants', message: 'Navigating to merchant management.' })
                },
              },
              {
                key: 'n3',
                label: 'Settlement batch completed',
                icon: 'check_circle',
                onSelect: () => {
                  pushToast({ variant: 'success', title: 'Payments', message: 'Batch processed successfully. View details in Finance.' })
                },
              },
            ]}
          />

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--ss-text-muted)] hover:bg-[var(--ss-surface-alt)]"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon name="settings" className="h-5 w-5" />
          </button>

          <DropdownMenu
            trigger={
              <span className="flex items-center gap-2 rounded-md p-2 hover:bg-[var(--ss-surface-alt)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--ss-primary-soft)] text-[var(--ss-primary)] font-semibold">
                  {user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('') ?? 'A'}
                </span>
                <span className="hidden sm:block">
                  <p className="text-sm font-semibold text-[var(--ss-text)] leading-4">{user?.name ?? 'Admin'}</p>
                  <p className="text-xs text-[var(--ss-text-muted)] leading-4">{user?.role ?? 'admin'}</p>
                </span>
                <Icon name="chevron_down" className="hidden h-4 w-4 text-[var(--ss-text-muted)] sm:block" />
              </span>
            }
            items={[
              { 
                key: 'profile', 
                label: 'Profile', 
                icon: 'profile', 
                onSelect: () => {
                  pushToast({ variant: 'info', title: 'Profile', message: 'User profile page coming soon.' })
                  // Future: navigate('/profile')
                }
              },
              { 
                key: 'settings', 
                label: 'Settings', 
                icon: 'settings', 
                onSelect: () => navigate('/settings')
              },
              { 
                key: 'theme', 
                label: theme === 'dark' ? 'Switch to Light' : 'Switch to Dark', 
                icon: 'sparkles', 
                onSelect: toggleTheme 
              },
              { 
                key: 'logout', 
                label: 'Sign out', 
                icon: 'lock', 
                variant: 'danger', 
                onSelect: () => {
                  logout()
                  navigate('/login')
                }
              },
            ]}
          />
        </div>
      </div>
    </header>
  )
}
