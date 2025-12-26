import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "resetError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({ hasError: false, error: null });
            }
        });
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // Log to monitoring service in production
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50", children: _jsxs("div", { className: "text-center p-8 bg-white rounded-lg shadow-lg max-w-md", children: [_jsx(AlertCircle, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-gray-600 mb-6", children: this.state.error?.message || 'An unexpected error occurred' }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("button", { onClick: this.resetError, className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Try again"] }), _jsx("button", { onClick: () => window.location.href = '/', className: "flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition", children: "Go home" })] })] }) }));
        }
        return this.props.children;
    }
}
