import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AdminDashboardPage as SupportDashboardPage } from '@/pages/SupportDashboardPage'
import { SupportTicketsPage } from '@/pages/SupportTicketsPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { AuditLogsPage } from '@/pages/AuditLogsPage'
import { FeatureFlagsPage } from '@/pages/FeatureFlagsPage'
import { UsersPage } from '@/pages/UsersPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { MerchantsPage } from '@/pages/MerchantsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AIMarketingPage } from '@/pages/AIMarketingPage'
import { ConciergePage } from '@/pages/ConciergePage'

function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {isAuthenticated ? (
          <>
            {/* Main Dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateLayout>
                  <DashboardPage />
                </PrivateLayout>
              }
            />

            {/* Support System */}
            <Route
              path="/support/dashboard"
              element={
                <PrivateLayout>
                  <SupportDashboardPage />
                </PrivateLayout>
              }
            />
            <Route
              path="/support/tickets"
              element={
                <PrivateLayout>
                  <SupportTicketsPage />
                </PrivateLayout>
              }
            />

            {/* Administration */}
            <Route
              path="/admin/users"
              element={
                <PrivateLayout>
                  <AdminUsersPage />
                </PrivateLayout>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <PrivateLayout>
                  <AuditLogsPage />
                </PrivateLayout>
              }
            />

            {/* Features */}
            <Route
              path="/feature-flags"
              element={
                <PrivateLayout>
                  <FeatureFlagsPage />
                </PrivateLayout>
              }
            />

            {/* Business Pages */}
            <Route
              path="/users"
              element={
                <PrivateLayout>
                  <UsersPage />
                </PrivateLayout>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateLayout>
                  <AnalyticsPage />
                </PrivateLayout>
              }
            />
            <Route
              path="/merchants"
              element={
                <PrivateLayout>
                  <MerchantsPage />
                </PrivateLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateLayout>
                  <SettingsPage />
                </PrivateLayout>
              }
            />
            <Route
              path="/ai-marketing"
              element={
                <PrivateLayout>
                  <AIMarketingPage />
                </PrivateLayout>
              }
            />
            <Route
              path="/concierge"
              element={
                <PrivateLayout>
                  <ConciergePage />
                </PrivateLayout>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  )
}

export default App
