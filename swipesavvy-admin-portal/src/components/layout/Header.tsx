/**
 * ============================================================================
 * SWIPESAVVY ADMIN PORTAL - HEADER COMPONENT V5
 * COMPLETE RESET - Built from scratch
 * ============================================================================
 *
 * Design Philosophy: PRECISION OVER DELIGHT
 * - Mobile menu button (left)
 * - Breadcrumbs (center-left)
 * - Search (center) - optional
 * - Notifications (right)
 * - Theme toggle (right)
 * - User menu (right)
 *
 * Accessibility:
 * - Skip to content link
 * - Proper ARIA labels
 * - Keyboard navigable
 * - Focus indicators
 */

import DropdownMenu from '@/components/ui/DropdownMenu'
import Input from '@/components/ui/Input'
import { buildBreadcrumbs } from '@/router/breadcrumbs'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  LogIn,
} from 'lucide-react'

// =============================================================================
// HEADER COMPONENT
// =============================================================================

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const breadcrumbs = buildBreadcrumbs(location.pathname)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const theme = useUiStore((s) => s.theme)
  const setSidebarMobileOpen = useUiStore((s) => s.setSidebarMobileOpen)

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const pushToast = useToastStore((s) => s.push)

  return (
    <header
      className={cn(
        'sticky top-0 z-[var(--z-sticky)]',
        'h-[var(--layout-header-height)]',
        'border-b border-[var(--color-border-primary)]',
        'bg-[var(--color-bg-primary)]'
      )}
    >
      {/* Skip to content - Accessibility */}
      <a
        href="#main-content"
        className={cn(
          'skip-to-content',
          'absolute -top-full left-[var(--spacing-4)]',
          'z-[var(--z-max)]',
          'px-[var(--spacing-4)] py-[var(--spacing-2)]',
          'bg-[var(--color-action-primary-bg)] text-[var(--color-action-primary-text)]',
          'font-medium text-[var(--font-size-sm)]',
          'rounded-[var(--radius-sm)]',
          'focus:top-[var(--spacing-4)]',
          'transition-[top] duration-[var(--duration-fast)]'
        )}
      >
        Skip to content
      </a>

      <div className="flex h-full items-center justify-between gap-[var(--spacing-3)] px-[var(--spacing-4)]">
        {/* ─────────────────────────────────────────────────────────────────────
            LEFT - Mobile menu button
            ───────────────────────────────────────────────────────────────────── */}
        <button
          type="button"
          className={cn(
            'rounded-[var(--radius-sm)] p-[var(--spacing-2)]',
            'text-[var(--color-text-secondary)]',
            'hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
            'transition-colors duration-[var(--duration-fast)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]',
            'lg:hidden'
          )}
          onClick={() => setSidebarMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* ─────────────────────────────────────────────────────────────────────
            CENTER - Breadcrumbs and Search
            ───────────────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 items-center justify-start gap-[var(--spacing-4)]">
          {/* Breadcrumbs */}
          <nav
            className="hidden min-w-0 items-center gap-[var(--spacing-1)] text-[var(--font-size-sm)] sm:flex"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center gap-[var(--spacing-1)]">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex min-w-0 items-center gap-[var(--spacing-1)]">
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className={cn(
                        'truncate text-[var(--color-text-secondary)]',
                        'hover:text-[var(--color-text-primary)]',
                        'transition-colors duration-[var(--duration-fast)]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:rounded-[var(--radius-xs)]'
                      )}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className="truncate text-[var(--color-text-primary)] font-medium"
                      aria-current="page"
                    >
                      {crumb.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight
                      className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Search */}
          <div className="hidden w-[320px] max-w-full lg:block">
            <Input
              placeholder="Search..."
              leftIcon={<Search className="w-4 h-4" />}
              size="sm"
              aria-label="Search"
            />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            RIGHT - Actions
            ───────────────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-[var(--spacing-1)]">
          {/* Notifications */}
          <DropdownMenu
            trigger={
              <span
                className={cn(
                  'relative inline-flex h-10 w-10 items-center justify-center',
                  'rounded-[var(--radius-sm)]',
                  'text-[var(--color-text-secondary)]',
                  'hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
                  'transition-colors duration-[var(--duration-fast)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]'
                )}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {/* Notification indicator */}
                <span
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-status-warning-icon)]"
                  aria-label="You have unread notifications"
                />
              </span>
            }
            items={[
              {
                key: 'n1',
                label: 'New ticket: Card declined',
                icon: 'chat',
                onSelect: () => {
                  navigate('/support-tickets')
                  pushToast({
                    variant: 'info',
                    title: 'Support Tickets',
                    message: 'Navigating to support tickets.',
                  })
                },
              },
              {
                key: 'n2',
                label: 'Merchant onboarding pending',
                icon: 'finance',
                onSelect: () => {
                  navigate('/merchants')
                  pushToast({
                    variant: 'warning',
                    title: 'Merchants',
                    message: 'Navigating to merchant management.',
                  })
                },
              },
              {
                key: 'n3',
                label: 'Settlement batch completed',
                icon: 'check_circle',
                onSelect: () => {
                  pushToast({
                    variant: 'success',
                    title: 'Payments',
                    message: 'Batch processed successfully.',
                  })
                },
              },
            ]}
          />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center',
              'rounded-[var(--radius-sm)]',
              'text-[var(--color-text-secondary)]',
              'hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]',
              'transition-colors duration-[var(--duration-fast)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]'
            )}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          {/* User Menu or Sign In Button */}
          {isAuthenticated ? (
            <DropdownMenu
              trigger={
                <span
                  className={cn(
                    'flex items-center gap-[var(--spacing-2)]',
                    'rounded-[var(--radius-sm)] p-[var(--spacing-2)]',
                    'hover:bg-[var(--color-bg-secondary)]',
                    'transition-colors duration-[var(--duration-fast)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]'
                  )}
                  aria-label="User menu"
                >
                  {/* Avatar */}
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center',
                      'rounded-[var(--radius-sm)]',
                      'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]',
                      'text-[var(--font-size-sm)] font-semibold'
                    )}
                    aria-hidden="true"
                  >
                    {user?.name
                      ?.split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('') ?? 'A'}
                  </span>
                  {/* Name & Role */}
                  <span className="hidden sm:block text-left">
                    <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text-primary)] leading-tight">
                      {user?.name ?? 'System Admin'}
                    </p>
                    <p className="text-[var(--font-size-xs)] text-[var(--color-text-tertiary)] leading-tight">
                      {user?.role ?? 'admin'}
                    </p>
                  </span>
                  <ChevronDown
                    className="hidden h-4 w-4 text-[var(--color-text-tertiary)] sm:block"
                    aria-hidden="true"
                  />
                </span>
              }
              items={[
                {
                  key: 'profile',
                  label: 'Profile',
                  icon: 'profile',
                  onSelect: () => {
                    pushToast({
                      variant: 'info',
                      title: 'Profile',
                      message: 'User profile page coming soon.',
                    })
                  },
                },
                {
                  key: 'settings',
                  label: 'Settings',
                  icon: 'settings',
                  onSelect: () => navigate('/settings'),
                },
                {
                  key: 'theme',
                  label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
                  icon: 'sparkles',
                  onSelect: toggleTheme,
                },
                {
                  key: 'logout',
                  label: 'Sign out',
                  icon: 'lock',
                  variant: 'danger',
                  onSelect: () => {
                    logout()
                    navigate('/login')
                  },
                },
              ]}
            />
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={cn(
                'inline-flex items-center gap-[var(--spacing-2)]',
                'h-10 px-[var(--spacing-4)]',
                'rounded-[var(--radius-sm)]',
                'bg-[var(--color-action-primary-bg)] text-[var(--color-action-primary-text)]',
                'hover:bg-[var(--color-action-primary-bg-hover)]',
                'transition-colors duration-[var(--duration-fast)]',
                'font-medium text-[var(--font-size-sm)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]'
              )}
              aria-label="Sign in"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
