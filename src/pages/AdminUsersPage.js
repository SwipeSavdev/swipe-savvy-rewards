import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Shield, Clock } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        role: 'agent',
        department: ''
    });
    useEffect(() => {
        fetchUsers();
    }, []);
    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Mock data for demo - in production, this would call the API
            const mockUsers = [
                {
                    admin_user_id: '1',
                    email: 'john@swipesavvy.com',
                    full_name: 'John Smith',
                    role: 'admin',
                    department: 'Management',
                    last_login: new Date(Date.now() - 3600000).toISOString(),
                    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
                },
                {
                    admin_user_id: '2',
                    email: 'sarah@swipesavvy.com',
                    full_name: 'Sarah Johnson',
                    role: 'supervisor',
                    department: 'Support',
                    last_login: new Date(Date.now() - 7200000).toISOString(),
                    created_at: new Date(Date.now() - 86400000 * 60).toISOString()
                },
                {
                    admin_user_id: '3',
                    email: 'mike@swipesavvy.com',
                    full_name: 'Mike Davis',
                    role: 'agent',
                    department: 'Technical Support',
                    last_login: new Date(Date.now() - 1800000).toISOString(),
                    created_at: new Date(Date.now() - 86400000 * 90).toISOString()
                },
                {
                    admin_user_id: '4',
                    email: 'emily@swipesavvy.com',
                    full_name: 'Emily Wilson',
                    role: 'agent',
                    department: 'Billing',
                    last_login: new Date(Date.now() - 10800000).toISOString(),
                    created_at: new Date(Date.now() - 86400000 * 45).toISOString()
                }
            ];
            setUsers(mockUsers);
        }
        catch (error) {
            console.error('Failed to fetch users:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleOpenModal = (user) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                department: user.department
            });
        }
        else {
            setEditingUser(null);
            setFormData({
                email: '',
                full_name: '',
                role: 'agent',
                department: ''
            });
        }
        setShowModal(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // In production, this would call the API
        console.log('Submitting user data:', formData);
        setShowModal(false);
        // Refresh users list
        await fetchUsers();
    };
    const handleDelete = async (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                // In production, this would call the API
                console.log('Deleting user:', userId);
                await fetchUsers();
            }
            catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'supervisor': return 'bg-purple-100 text-purple-800';
            case 'agent': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return _jsx(Shield, { className: "w-4 h-4" });
            case 'supervisor': return _jsx(Shield, { className: "w-4 h-4" });
            default: return _jsx(Users, { className: "w-4 h-4" });
        }
    };
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Admin Users" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage support team and admin access" })] }), _jsxs("button", { onClick: () => handleOpenModal(), className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2", children: [_jsx(Plus, { className: "w-5 h-5" }), "Add User"] })] }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden", children: loading ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "Loading users..." })) : users.length === 0 ? (_jsx("div", { className: "p-8 text-center text-gray-500", children: "No users found" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Role" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Department" }), _jsx("th", { className: "px-6 py-3 text-left text-sm font-semibold text-gray-900", children: "Last Login" }), _jsx("th", { className: "px-6 py-3 text-right text-sm font-semibold text-gray-900", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50 transition", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold", children: user.full_name.split(' ').map((n) => n[0]).join('') }), _jsx("span", { className: "font-medium text-gray-900", children: user.full_name })] }) }), _jsx("td", { className: "px-6 py-4 text-gray-600", children: user.email }), _jsx("td", { className: "px-6 py-4", children: _jsxs("span", { className: `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`, children: [getRoleIcon(user.role), user.role.charAt(0).toUpperCase() + user.role.slice(1)] }) }), _jsx("td", { className: "px-6 py-4 text-gray-600", children: user.department }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2 text-gray-600 text-sm", children: [_jsx(Clock, { className: "w-4 h-4" }), new Date(user.last_login).toLocaleDateString()] }) }), _jsx("td", { className: "px-6 py-4 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => handleOpenModal(user), className: "p-2 hover:bg-gray-100 rounded-lg transition", title: "Edit user", children: _jsx(Edit, { className: "w-4 h-4 text-gray-600" }) }), _jsx("button", { onClick: () => handleDelete(user.admin_user_id), className: "p-2 hover:bg-gray-100 rounded-lg transition", title: "Delete user", children: _jsx(Trash2, { className: "w-4 h-4 text-red-600" }) })] }) })] }, user.admin_user_id))) })] }) })) }), showModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl p-6 w-full max-w-md", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: editingUser ? 'Edit User' : 'Add New User' }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Name" }), _jsx("input", { type: "text", value: formData.full_name, onChange: (e) => setFormData({ ...formData, full_name: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Role" }), _jsxs("select", { value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "agent", children: "Agent" }), _jsx("option", { value: "supervisor", children: "Supervisor" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Department" }), _jsx("input", { type: "text", value: formData.department, onChange: (e) => setFormData({ ...formData, department: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: () => setShowModal(false), className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition", children: "Cancel" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition", children: editingUser ? 'Update' : 'Create' })] })] })] }) }))] }));
};
