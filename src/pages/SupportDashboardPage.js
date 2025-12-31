import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Ticket, AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const AdminDashboardPage = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);
    const fetchMetrics = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/support/dashboard/metrics`);
            setMetrics(response.data.metrics);
        }
        catch (error) {
            console.error('Failed to fetch metrics:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getResolutionRate = () => {
        if (!metrics)
            return 0;
        const total = metrics.total_tickets || 1;
        return Math.round((metrics.resolved / total) * 100);
    };
    const chartData = [
        { name: 'Open', value: metrics?.open_tickets || 0, fill: '#3b82f6' },
        { name: 'In Progress', value: metrics?.in_progress || 0, fill: '#8b5cf6' },
        { name: 'Resolved', value: metrics?.resolved || 0, fill: '#10b981' }
    ];
    const timelineData = [
        { day: 'Mon', tickets: 12, resolved: 8 },
        { day: 'Tue', tickets: 15, resolved: 11 },
        { day: 'Wed', tickets: 10, resolved: 9 },
        { day: 'Thu', tickets: 18, resolved: 14 },
        { day: 'Fri', tickets: 22, resolved: 18 },
        { day: 'Sat', tickets: 8, resolved: 6 },
        { day: 'Sun', tickets: 5, resolved: 5 }
    ];
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Admin Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Support system overview and metrics" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Tickets" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: metrics?.total_tickets || 0 })] }), _jsx("div", { className: "p-3 bg-blue-100 rounded-lg", children: _jsx(Ticket, { className: "w-6 h-6 text-blue-600" }) })] }) }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Open Tickets" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: metrics?.open_tickets || 0 }), _jsxs("p", { className: "text-xs text-gray-500 mt-2", children: [metrics?.high_priority_open || 0, " high priority"] })] }), _jsx("div", { className: "p-3 bg-red-100 rounded-lg", children: _jsx(AlertCircle, { className: "w-6 h-6 text-red-600" }) })] }) }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "In Progress" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: metrics?.in_progress || 0 }), _jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["Avg: ", metrics?.average_response_time_hours || 0, "h"] })] }), _jsx("div", { className: "p-3 bg-purple-100 rounded-lg", children: _jsx(Clock, { className: "w-6 h-6 text-purple-600" }) })] }) }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Resolved" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: metrics?.resolved || 0 }), _jsxs("p", { className: "text-xs text-gray-500 mt-2", children: [getResolutionRate(), "% resolution rate"] })] }), _jsx("div", { className: "p-3 bg-green-100 rounded-lg", children: _jsx(CheckCircle, { className: "w-6 h-6 text-green-600" }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: [_jsx("h2", { className: "font-bold text-lg text-gray-900 mb-6", children: "Ticket Status Distribution" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: chartData, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 5, dataKey: "value", children: chartData.map((entry, index) => (_jsx(Cell, { fill: entry.fill }, `cell-${index}`))) }), _jsx(Tooltip, {}), _jsx(Legend, {})] }) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: [_jsx("h2", { className: "font-bold text-lg text-gray-900 mb-6", children: "Weekly Ticket Trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: timelineData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "day" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "tickets", stroke: "#3b82f6" }), _jsx(Line, { type: "monotone", dataKey: "resolved", stroke: "#10b981" })] }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-blue-100 rounded-lg", children: _jsx(TrendingUp, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Avg Response Time" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [metrics?.average_response_time_hours || 0, "h"] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-green-100 rounded-lg", children: _jsx(CheckCircle, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Resolution Rate" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [getResolutionRate(), "%"] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm p-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-red-100 rounded-lg", children: _jsx(AlertCircle, { className: "w-6 h-6 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "High Priority Open" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: metrics?.high_priority_open || 0 })] })] }) })] })] }));
};
