import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import DashboardPageNew from './DashboardPageNew'
import NotFoundPage from './NotFoundPage'
import SupportDashboardPage from './SupportDashboardPage'

const AiMarketingPage = lazy(() => import('./AiMarketingPage'))
const AnalyticsPage = lazy(() => import('./AnalyticsPage'))
const ChatDashboardPage = lazy(() => import('./ChatDashboardPage'))
const SupportTicketsPage = lazy(() => import('./SupportTicketsPage'))
const AISupportConciergePage = lazy(() => import('./AISupportConciergePage'))
const MerchantsPage = lazy(() => import('./MerchantsPage'))
const PreferredMerchantsPage = lazy(() => import('./PreferredMerchantsPage'))
const UsersPage = lazy(() => import('./UsersPage'))
const AdminUsersPage = lazy(() => import('./AdminUsersPage'))
const SettingsPage = lazy(() => import('./SettingsPage'))
const FeatureFlagsPage = lazy(() => import('./FeatureFlagsPage'))
const AuditLogsPage = lazy(() => import('./AuditLogsPage'))

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      fontSize: '18px'
    }}>
      Loading...
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPageNew />} />
        <Route path="/dashboard" element={<DashboardPageNew />} />
        <Route path="/tools/ai-marketing" element={
          <Suspense fallback={<LoadingFallback />}>
            <AiMarketingPage />
          </Suspense>
        } />
        <Route path="/analytics" element={
          <Suspense fallback={<LoadingFallback />}>
            <AnalyticsPage />
          </Suspense>
        } />
        <Route path="/chat" element={
          <Suspense fallback={<LoadingFallback />}>
            <ChatDashboardPage />
          </Suspense>
        } />
        <Route path="/support" element={
          <Suspense fallback={<LoadingFallback />}>
            <SupportDashboardPage />
          </Suspense>
        } />
        <Route path="/support/tickets" element={
          <Suspense fallback={<LoadingFallback />}>
            <SupportTicketsPage />
          </Suspense>
        } />
        <Route path="/support/concierge" element={
          <Suspense fallback={<LoadingFallback />}>
            <AISupportConciergePage />
          </Suspense>
        } />
        <Route path="/merchants" element={
          <Suspense fallback={<LoadingFallback />}>
            <MerchantsPage />
          </Suspense>
        } />
        <Route path="/merchants/preferred" element={
          <Suspense fallback={<LoadingFallback />}>
            <PreferredMerchantsPage />
          </Suspense>
        } />
        <Route path="/users" element={
          <Suspense fallback={<LoadingFallback />}>
            <UsersPage />
          </Suspense>
        } />
        <Route path="/admin/users" element={
          <Suspense fallback={<LoadingFallback />}>
            <AdminUsersPage />
          </Suspense>
        } />
        <Route path="/settings" element={
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage />
          </Suspense>
        } />
        <Route path="/feature-flags" element={
          <Suspense fallback={<LoadingFallback />}>
            <FeatureFlagsPage />
          </Suspense>
        } />
        <Route path="/audit-logs" element={
          <Suspense fallback={<LoadingFallback />}>
            <AuditLogsPage />
          </Suspense>
        } />
        <Route path="/admin/audit-logs" element={
          <Suspense fallback={<LoadingFallback />}>
            <AuditLogsPage />
          </Suspense>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
