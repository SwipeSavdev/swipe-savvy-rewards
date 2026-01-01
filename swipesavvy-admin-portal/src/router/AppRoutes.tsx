import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AIMarketingPage as AIMarketingAnalyticsPage } from '@/features/ai-marketing-analytics'
import AdminUsersPage from '@/pages/AdminUsersPage'
import AiMarketingPage from '@/pages/AiMarketingPage'
import AISupportConciergePage from '@/pages/AISupportConciergePage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import AuditLogsPage from '@/pages/AuditLogsPage'
import DashboardPage from '@/pages/DashboardPage'
import FeatureFlagsPage from '@/pages/FeatureFlagsPage'
import LoginPage from '@/pages/LoginPage'
import MerchantsPage from '@/pages/MerchantsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import SettingsPage from '@/pages/SettingsPage'
import SupportDashboardPage from '@/pages/SupportDashboardPage'
import SupportTicketsPage from '@/pages/SupportTicketsPage'
import UsersPage from '@/pages/UsersPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/merchants" element={<MerchantsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SupportDashboardPage />} />
          <Route path="/support/tickets" element={<SupportTicketsPage />} />
          <Route path="/support/ai-concierge" element={<AISupportConciergePage />} />
          <Route path="/support/concierge" element={<AISupportConciergePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/analytics" element={<AIMarketingAnalyticsPage />} />
          <Route path="/admin/analytics/:view" element={<AIMarketingAnalyticsPage />} />
          <Route path="/tools/ai-marketing" element={<AiMarketingPage />} />
          <Route path="/tools/feature-flags" element={<FeatureFlagsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
