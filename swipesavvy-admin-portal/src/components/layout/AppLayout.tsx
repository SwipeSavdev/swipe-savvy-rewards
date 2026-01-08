/**
 * SwipeSavvy Admin Portal - Bank-Grade App Layout
 * Version: 4.0
 *
 * Main layout structure:
 * ┌─────────────────────────────────────────────────────┐
 * │ Header (64px fixed)                                 │
 * │ ┌─────────┬───────────────────────────────────────┐ │
 * │ │Sidebar  │ Main Content Area                     │ │
 * │ │(240px)  │ (scrollable)                          │ │
 * │ └─────────┴───────────────────────────────────────┘ │
 * └─────────────────────────────────────────────────────┘
 */

import { useUiStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const mobileOpen = useUiStore((s) => s.sidebarMobileOpen)
  const setMobileOpen = useUiStore((s) => s.setSidebarMobileOpen)
  const theme = useUiStore((s) => s.theme)
  const location = useLocation()

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, setMobileOpen])

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        <div
          className={cn(
            'fixed inset-0 z-50 lg:hidden',
            mobileOpen ? 'block' : 'hidden'
          )}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[var(--color-bg-overlay)] backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar drawer */}
          <div className="absolute inset-y-0 left-0 h-full">
            <Sidebar />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto bg-[var(--color-bg-page)] 
                       p-[var(--spacing-2)] 
                       md:p-[var(--spacing-3)] 
                       lg:p-[var(--spacing-4)]"
            tabIndex={-1}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
