import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LogOut, Settings } from 'lucide-react';
export function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsx("header", { className: "bg-white shadow-sm border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx("span", { className: "text-white font-bold text-sm", children: "SP" }) }), _jsx("h1", { className: "text-xl font-semibold text-gray-900", children: "Admin Portal" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [user && _jsx("span", { className: "text-sm text-gray-600", children: user.name }), _jsx("button", { onClick: () => navigate('/settings'), className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(Settings, { size: 20, className: "text-gray-600" }) }), _jsx("button", { onClick: handleLogout, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(LogOut, { size: 20, className: "text-gray-600" }) })] })] }) }));
}
