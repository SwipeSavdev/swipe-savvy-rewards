import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (email && password) {
                // Demo login - set token directly for testing
                localStorage.setItem('admin_token', 'demo-token-' + Date.now());
                // Update store
                useAuthStore.setState({
                    isAuthenticated: true,
                    token: 'demo-token-' + Date.now(),
                    user: { id: '1', email, name: 'Admin User', role: 'admin' }
                });
                navigate('/dashboard');
            }
            else {
                setError('Please enter email and password');
            }
        }
        catch (err) {
            setError('Login failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4", children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl p-8", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-white font-bold text-lg", children: "SP" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Admin Portal" }), _jsx("p", { className: "text-gray-600 text-sm mt-2", children: "Swioe Savvy Management" })] }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg", children: _jsx("p", { className: "text-red-700 text-sm", children: error }) })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "admin@example.com", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: e => setPassword(e.target.value), placeholder: "Enter your password", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition", required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Signing in...' : 'Sign In' })] }), _jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-xs text-gray-600 font-medium mb-2", children: "Demo Credentials:" }), _jsxs("p", { className: "text-xs text-gray-700", children: [_jsx("strong", { children: "Email:" }), " admin@example.com"] }), _jsxs("p", { className: "text-xs text-gray-700", children: [_jsx("strong", { children: "Password:" }), " Any password"] })] })] }) }) }));
}
