import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminDashboardPage as SupportDashboardPage } from '@/pages/SupportDashboardPage';
import { SupportTicketsPage } from '@/pages/SupportTicketsPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { FeatureFlagsPage } from '@/pages/FeatureFlagsPage';
import { UsersPage } from '@/pages/UsersPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { MerchantsPage } from '@/pages/MerchantsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AIMarketingPage } from '@/pages/AIMarketingPage';
import { ConciergePage } from '@/pages/ConciergePage';
function PrivateLayout({ children }) {
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-auto", children: children })] })] }));
}
function App() {
    const { isAuthenticated } = useAuthStore();
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), isAuthenticated ? (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/dashboard", element: _jsx(PrivateLayout, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/support/dashboard", element: _jsx(PrivateLayout, { children: _jsx(SupportDashboardPage, {}) }) }), _jsx(Route, { path: "/support/tickets", element: _jsx(PrivateLayout, { children: _jsx(SupportTicketsPage, {}) }) }), _jsx(Route, { path: "/admin/users", element: _jsx(PrivateLayout, { children: _jsx(AdminUsersPage, {}) }) }), _jsx(Route, { path: "/admin/audit-logs", element: _jsx(PrivateLayout, { children: _jsx(AuditLogsPage, {}) }) }), _jsx(Route, { path: "/feature-flags", element: _jsx(PrivateLayout, { children: _jsx(FeatureFlagsPage, {}) }) }), _jsx(Route, { path: "/users", element: _jsx(PrivateLayout, { children: _jsx(UsersPage, {}) }) }), _jsx(Route, { path: "/analytics", element: _jsx(PrivateLayout, { children: _jsx(AnalyticsPage, {}) }) }), _jsx(Route, { path: "/merchants", element: _jsx(PrivateLayout, { children: _jsx(MerchantsPage, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(PrivateLayout, { children: _jsx(SettingsPage, {}) }) }), _jsx(Route, { path: "/ai-marketing", element: _jsx(PrivateLayout, { children: _jsx(AIMarketingPage, {}) }) }), _jsx(Route, { path: "/concierge", element: _jsx(PrivateLayout, { children: _jsx(ConciergePage, {}) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] })) : (_jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/login", replace: true }) }))] }) }));
}
export default App;
