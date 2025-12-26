import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, UserCheck, UserX } from 'lucide-react';
export function UsersPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        role: 'user',
    });
    // Load users
    const loadUsers = async () => {
        setLoading(true);
        try {
            // Mock data for demo
            const mockUsers = [
                {
                    id: '1',
                    email: 'john@example.com',
                    name: 'John Doe',
                    role: 'user',
                    status: 'active',
                    created_at: '2025-01-15',
                    last_login: '2025-12-24',
                    total_transactions: 45,
                },
                {
                    id: '2',
                    email: 'jane@example.com',
                    name: 'Jane Smith',
                    role: 'merchant',
                    status: 'active',
                    created_at: '2025-02-20',
                    last_login: '2025-12-23',
                    total_transactions: 120,
                },
                {
                    id: '3',
                    email: 'bob@example.com',
                    name: 'Bob Wilson',
                    role: 'user',
                    status: 'inactive',
                    created_at: '2025-03-10',
                    total_transactions: 5,
                },
            ];
            setUsers(mockUsers);
            filterUsers(mockUsers, searchTerm, roleFilter, statusFilter);
        }
        catch (error) {
            console.error('Failed to load users:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const filterUsers = (userList, search, role, status) => {
        let filtered = userList;
        if (search) {
            filtered = filtered.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) ||
                u.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (role !== 'all') {
            filtered = filtered.filter(u => u.role === role);
        }
        if (status !== 'all') {
            filtered = filtered.filter(u => u.status === status);
        }
        setFilteredUsers(filtered);
    };
    useEffect(() => {
        loadUsers();
    }, []);
    useEffect(() => {
        filterUsers(users, searchTerm, roleFilter, statusFilter);
    }, [searchTerm, roleFilter, statusFilter]);
    const handleCreate = async () => {
        if (!formData.email || !formData.name) {
            alert('Email and name are required');
            return;
        }
        const newUser = {
            id: Date.now().toString(),
            email: formData.email,
            name: formData.name,
            role: formData.role,
            status: 'active',
            created_at: new Date().toISOString().split('T')[0],
        };
        setUsers([newUser, ...users]);
        setFormData({ email: '', name: '', role: 'user' });
        setShowForm(false);
        alert('User created successfully!');
    };
    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== userId));
        }
    };
    const handleToggleStatus = (user) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    };
    const getRoleColor = (role) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            merchant: 'bg-blue-100 text-blue-800',
            user: 'bg-gray-100 text-gray-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };
    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };
    return (_jsx("div", { className: "p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Users" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Manage user accounts and permissions" })] }), _jsxs("button", { onClick: () => setShowForm(true), className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add User"] })] }), showForm && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-8", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Create New User" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [_jsx("input", { type: "email", placeholder: "Email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("input", { type: "text", placeholder: "Full Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsxs("select", { value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "user", children: "User" }), _jsx("option", { value: "merchant", children: "Merchant" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleCreate, className: "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700", children: "Create" }), _jsx("button", { onClick: () => setShowForm(false), className: "px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50", children: "Cancel" })] })] })), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-3 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search by email or name...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }) }), _jsxs("select", { value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Roles" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "merchant", children: "Merchant" }), _jsx("option", { value: "user", children: "User" })] }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "suspended", children: "Suspended" })] })] }), !loading && filteredUsers.length > 0 && (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Role" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Transactions" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Joined" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: filteredUsers.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: user.name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: user.email }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`, children: user.role }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`, children: user.status }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: user.total_transactions || 0 }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: user.created_at }), _jsx("td", { className: "px-6 py-4 text-sm", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleToggleStatus(user), className: "p-2 text-blue-600 hover:bg-blue-50 rounded-lg", title: user.status === 'active' ? 'Deactivate' : 'Activate', children: user.status === 'active' ? (_jsx(UserCheck, { className: "w-4 h-4" })) : (_jsx(UserX, { className: "w-4 h-4" })) }), _jsx("button", { onClick: () => handleDelete(user.id), className: "p-2 text-red-600 hover:bg-red-50 rounded-lg", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, user.id))) })] }) })), !loading && filteredUsers.length === 0 && (_jsx("div", { className: "text-center py-12 bg-white rounded-lg border border-gray-200", children: _jsx("p", { className: "text-gray-500 mb-4", children: "No users found" }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mt-8", children: [_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Total Users" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: users.length })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Active Users" }), _jsx("p", { className: "text-3xl font-bold text-green-600 mt-2", children: users.filter(u => u.status === 'active').length })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Merchants" }), _jsx("p", { className: "text-3xl font-bold text-blue-600 mt-2", children: users.filter(u => u.role === 'merchant').length })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("p", { className: "text-gray-600 text-sm", children: "Total Transactions" }), _jsx("p", { className: "text-3xl font-bold text-purple-600 mt-2", children: users.reduce((sum, u) => sum + (u.total_transactions || 0), 0) })] })] })] }) }));
}
