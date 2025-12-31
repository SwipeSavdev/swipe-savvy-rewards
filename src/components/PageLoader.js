import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
export function PageLoader() {
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" }), _jsx("p", { className: "text-gray-600 font-medium", children: "Loading page..." })] }) }));
}
