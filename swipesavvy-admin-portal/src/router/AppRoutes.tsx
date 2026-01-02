import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import { Navigate, Route, Routes } from 'react-router-dom'

import EnhancedDashboard from '@/features/dashboard/EnhancedDashboard'
import AdminUsersPage from '@/pages/AdminUsersPage'
import AiMarketingPage from '@/pages/AiMarketingPage'
import AISupportConciergePage from '@/pages/AISupportConciergePage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import AuditLogsPage from '@/pages/AuditLogsPage'
import CharityOnboardingPage from '@/pages/CharityOnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import EnhancedFeatureFlagsPage from '@/pages/EnhancedFeatureFlagsPage'
import IconSystemDemo from '@/pages/IconSystemDemo'
import LoginPage from '@/pages/LoginPage'
import MerchantsPage from '@/pages/MerchantsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import PermissionsManagerPage from '@/pages/PermissionsManagerPage'
import PolicyManagerPage from '@/pages/PolicyManagerPage'
import RiskReportsPage from '@/pages/RiskReportsPage'
import RolesManagerPage from '@/pages/RolesManagerPage'
import SettingsPage from '@/pages/SettingsPage'
import SupportDashboardPage from '@/pages/SupportDashboardPage'
import SupportTicketsPage from '@/pages/SupportTicketsPage'
import UserManagementPage from '@/pages/UserManagementPage'
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
          <Route path="/analytics/risk-reports" element={<RiskReportsPage />} />
          <Route path="/merchants" element={<MerchantsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SupportDashboardPage />} />
          <Route path="/support/tickets" element={<SupportTicketsPage />} />
          <Route path="/support/ai-concierge" element={<AISupportConciergePage />} />
          <Route path="/support/concierge" element={<AISupportConciergePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/user/management" element={<UserManagementPage />} />
          <Route path="/admin/user/roles" element={<RolesManagerPage />} />
          <Route path="/admin/user/permissions" element={<PermissionsManagerPage />} />
          <Route path="/admin/user/policies" element={<PolicyManagerPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/roles-permissions" element={<AdminUsersPage />} />
          <Route path="/admin/analytics" element={<EnhancedDashboard />} />
          <Route path="/admin/analytics/:view" element={<EnhancedDashboard />} />
          <Route path="/donations/charities" element={<CharityOnboardingPage />} />
          <Route path="/tools/ai-marketing" element={<AiMarketingPage />} />
          <Route path="/tools/feature-flags" element={<EnhancedFeatureFlagsPage />} />
          <Route path="/tools/icon-system" element={<IconSystemDemo />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
