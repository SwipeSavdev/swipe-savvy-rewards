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

import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { cn } from '@/utils/cn'
import { useUiStore } from '@/store/uiStore'
import { useEffect } from 'react'

export default function AppLayout() {
  const mobileOpen = useUiStore((s) => s.sidebarMobileOpen)
  const setMobileOpen = useUiStore((s) => s.setSidebarMobileOpen)
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, setMobileOpen])

  return (
    <div className="min-h-screen bg-bg-canvas">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
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
            'fixed inset-0 z-modal-backdrop lg:hidden',
            mobileOpen ? 'block' : 'hidden'
          )}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-bg-inverse/50 backdrop-blur-sm"
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
            className="flex-1 p-4 md:p-6 lg:p-8"
            tabIndex={-1}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
