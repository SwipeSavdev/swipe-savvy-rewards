import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { LogOut, User, Clock, Filter, Download } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const AuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('all');
    const [filterUser, setFilterUser] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    useEffect(() => {
        fetchLogs();
    }, [filterAction, filterUser]);
    const fetchLogs = async () => {
        try {
            setLoading(true);
            // Mock data for demo - in production, this would call the API
            const mockLogs = [
                {
                    log_id: '1',
                    admin_user_id: 'user1',
                    admin_email: 'john@swipesavvy.com',
                    action_type: 'ticket_updated',
                    resource_type: 'support_ticket',
                    resource_id: 'TICKET-001',
                    changes: { status: 'open -> in_progress' },
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                    ip_address: '192.168.1.1'
                },
                {
                    log_id: '2',
                    admin_user_id: 'user2',
                    admin_email: 'sarah@swipesavvy.com',
                    action_type: 'ticket_escalated',
                    resource_type: 'support_ticket',
                    resource_id: 'TICKET-002',
                    changes: { escalation_level: 'level_2' },
                    timestamp: new Date(Date.now() - 600000).toISOString(),
                    ip_address: '192.168.1.2'
                },
                {
                    log_id: '3',
                    admin_user_id: 'user1',
                    admin_email: 'john@swipesavvy.com',
                    action_type: 'user_created',
                    resource_type: 'admin_user',
                    resource_id: 'user3',
                    changes: { email: 'mike@swipesavvy.com' },
                    timestamp: new Date(Date.now() - 1200000).toISOString(),
                    ip_address: '192.168.1.1'
                },
                {
                    log_id: '4',
                    admin_user_id: 'user2',
                    admin_email: 'sarah@swipesavvy.com',
                    action_type: 'settings_updated',
                    resource_type: 'system_setting',
                    resource_id: 'max_response_time',
                    changes: { value: '24 -> 12' },
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    ip_address: '192.168.1.2'
                },
                {
                    log_id: '5',
                    admin_user_id: 'user1',
                    admin_email: 'john@swipesavvy.com',
                    action_type: 'login',
                    resource_type: 'admin_user',
                    resource_id: 'user1',
                    changes: {},
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    ip_address: '192.168.1.1'
                }
            ];
            setLogs(mockLogs);
        }
        catch (error) {
            console.error('Failed to fetch audit logs:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getActionBadgeColor = (action) => {
        switch (action) {
            case 'ticket_updated': return 'bg-blue-100 text-blue-800';
            case 'ticket_escalated': return 'bg-red-100 text-red-800';
            case 'user_created': return 'bg-green-100 text-green-800';
            case 'user_deleted': return 'bg-red-100 text-red-800';
            case 'settings_updated': return 'bg-purple-100 text-purple-800';
            case 'login': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getActionIcon = (action) => {
        switch (action) {
            case 'login': return _jsx(LogOut, { className: "w-4 h-4" });
            default: return _jsx(User, { className: "w-4 h-4" });
        }
    };
    const handleExport = () => {
        const csv = [
            ['Timestamp', 'User', 'Action', 'Resource', 'IP Address'],
            ...logs.map(log => [
                new Date(log.timestamp).toLocaleString(),
                log.admin_email,
                log.action_type,
                `${log.resource_type}/${log.resource_id}`,
                log.ip_address
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Audit Logs" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Track all system actions and changes" })] }), _jsxs("button", { onClick: handleExport, className: "px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2", children: [_jsx(Download, { className: "w-5 h-5" }), "Export"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Filter, { className: "w-4 h-4 inline mr-2" }), "Action Type"] }), _jsxs("select", { value: filterAction, onChange: (e) => setFilterAction(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Actions" }), _jsx("option", { value: "ticket_updated", children: "Ticket Updated" }), _jsx("option", { value: "ticket_escalated", children: "Ticket Escalated" }), _jsx("option", { value: "user_created", children: "User Created" }), _jsx("option", { value: "login", children: "Login" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "User" }), _jsxs("select", { value: filterUser, onChange: (e) => setFilterUser(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Users" }), _jsx("option", { value: "john@swipesavvy.com", children: "John Smith" }), _jsx("option", { value: "sarah@swipesavvy.com", children: "Sarah Johnson" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Date Range" }), _jsx("input", { type: "date", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden", children: loading ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "Loading audit logs..." })) : logs.length === 0 ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "No audit logs found" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Timestamp" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "User" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Action" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Resource" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "IP Address" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Changes" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: logs.map((log) => (_jsxs("tr", { className: "hover:bg-gray-50 transition", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx(Clock, { className: "w-4 h-4" }), new Date(log.timestamp).toLocaleString()] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-900 font-medium", children: log.admin_email }), _jsx("td", { className: "px-6 py-4", children: _jsxs("span", { className: `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action_type)}`, children: [getActionIcon(log.action_type), log.action_type.replace(/_/g, ' ')] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: _jsxs("code", { className: "text-xs bg-gray-100 px-2 py-1 rounded", children: [log.resource_type, "/", log.resource_id] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: _jsx("code", { className: "text-xs bg-gray-100 px-2 py-1 rounded", children: log.ip_address }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: _jsx("span", { className: "text-xs", children: Object.entries(log.changes).map(([k, v]) => `${k}: ${v}`).join(', ') || '-' }) })] }, log.log_id))) })] }) })) })] }));
};
