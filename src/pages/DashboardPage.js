import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Users, TrendingUp, Gift, Activity } from 'lucide-react';
const kpis = [
    {
        title: 'Active Users',
        value: '1.2K',
        change: '+12%',
        icon: Users,
        color: 'bg-blue-50',
        iconColor: 'text-blue-600',
    },
    {
        title: 'Total Transactions',
        value: '$45.6K',
        change: '+8%',
        icon: TrendingUp,
        color: 'bg-green-50',
        iconColor: 'text-green-600',
    },
    {
        title: 'Points Earned',
        value: '125.4K',
        change: '+24%',
        icon: Gift,
        color: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
    },
    {
        title: 'System Health',
        value: '99.8%',
        change: '+0.1%',
        icon: Activity,
        color: 'bg-purple-50',
        iconColor: 'text-purple-600',
    },
];
const activities = [
    { id: 1, action: 'New user registered', time: '2 minutes ago' },
    { id: 2, action: 'Transaction completed', time: '5 minutes ago' },
    { id: 3, action: 'Points redeemed', time: '12 minutes ago' },
    { id: 4, action: 'Offer activated', time: '1 hour ago' },
    { id: 5, action: 'System backup completed', time: '3 hours ago' },
];
export function DashboardPage() {
    return (_jsxs("div", { className: "p-8 space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Dashboard" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Welcome back! Here's your platform overview." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: kpis.map(kpi => {
                    const Icon = kpi.icon;
                    return (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("div", { className: `w-12 h-12 rounded-lg ${kpi.color} flex items-center justify-center mb-4`, children: _jsx(Icon, { size: 24, className: kpi.iconColor }) }), _jsx("h3", { className: "text-gray-600 text-sm font-medium", children: kpi.title }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: kpi.value }), _jsx("p", { className: "text-green-600 text-sm font-medium mt-2", children: kpi.change })] }, kpi.title));
                }) }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-900 mb-4", children: "Recent Activity" }), _jsx("div", { className: "space-y-4", children: activities.map(activity => (_jsxs("div", { className: "flex items-center justify-between py-3 border-b border-gray-200 last:border-0", children: [_jsx("p", { className: "text-gray-700 font-medium", children: activity.action }), _jsx("span", { className: "text-gray-500 text-sm", children: activity.time })] }, activity.id))) })] })] }));
}
