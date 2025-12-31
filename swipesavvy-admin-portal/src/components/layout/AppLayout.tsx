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
    <div className="min-h-screen bg-[var(--ss-bg)]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar */}
        <div className={cn('fixed inset-0 z-50 lg:hidden', mobileOpen ? 'block' : 'hidden')}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 h-full">
            <Sidebar />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
