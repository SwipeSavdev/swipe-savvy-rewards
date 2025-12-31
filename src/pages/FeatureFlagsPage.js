import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, ChevronDown } from 'lucide-react';
// Mock API for feature flags
const mockFlags = [
    {
        id: '1',
        name: 'new_dashboard',
        description: 'New dashboard redesign',
        enabled: true,
        rollout_percentage: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];
const api = {
    get: async () => {
        return { data: { success: true, data: { flags: mockFlags } } };
    },
    post: async (_url, data) => {
        const newFlag = {
            ...data,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        mockFlags.push(newFlag);
        return { data: { success: true, data: newFlag } };
    },
    patch: async (_url) => {
        return { data: { success: true, data: { id: '1', name: 'test', description: '', enabled: true, rollout_percentage: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } } };
    },
    put: async (_url, data) => {
        return { data: { success: true, data: { id: '1', name: 'test', description: '', ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } } };
    },
    delete: async (_url) => {
        return { data: { success: true } };
    },
};
export function FeatureFlagsPage() {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        enabled: false,
        rollout_percentage: 0,
    });
    const [expandedId, setExpandedId] = useState(null);
    // Load feature flags
    const loadFlags = async () => {
        setLoading(true);
        try {
            const response = await api.get();
            if (response.data.success) {
                setFlags(response.data.data.flags);
            }
        }
        catch (error) {
            console.error('Failed to load feature flags:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadFlags();
    }, []);
    // Create feature flag
    const handleCreate = async () => {
        if (!formData.name.trim()) {
            alert('Feature flag name is required');
            return;
        }
        try {
            const response = await api.post('/api/feature-flags', {
                name: formData.name,
                description: formData.description,
                enabled: formData.enabled,
                rollout_percentage: formData.rollout_percentage,
                metadata: {},
            });
            if (response.data.success) {
                setFlags([response.data.data, ...flags]);
                setFormData({ name: '', description: '', enabled: false, rollout_percentage: 0 });
                setShowForm(false);
                alert('Feature flag created successfully!');
            }
        }
        catch (error) {
            console.error('Failed to create feature flag:', error);
            alert('Error creating feature flag');
        }
    };
    // Toggle feature flag
    const handleToggle = async (flagId, currentState) => {
        try {
            const response = await api.patch(`/api/feature-flags/${flagId}/toggle?enabled=${!currentState}`);
            if (response.data.success) {
                setFlags(flags.map(f => f.id === flagId ? response.data.data : f));
            }
        }
        catch (error) {
            console.error('Failed to toggle feature flag:', error);
        }
    };
    // Update rollout percentage
    const handleUpdateRollout = async (flagId, percentage) => {
        try {
            const response = await api.put(`/api/feature-flags/${flagId}`, {
                rollout_percentage: percentage,
            });
            if (response.data.success) {
                setFlags(flags.map(f => f.id === flagId ? response.data.data : f));
            }
        }
        catch (error) {
            console.error('Failed to update rollout percentage:', error);
        }
    };
    // Delete feature flag
    const handleDelete = async (flagId) => {
        if (!window.confirm('Are you sure you want to delete this feature flag?')) {
            return;
        }
        try {
            const response = await api.delete(`/api/feature-flags/${flagId}`);
            if (response.data.success) {
                setFlags(flags.filter(f => f.id !== flagId));
            }
        }
        catch (error) {
            console.error('Failed to delete feature flag:', error);
        }
    };
    return (_jsx("div", { className: "p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Feature Flags" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Control which features are served to mobile app users" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("button", { onClick: loadFlags, className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs("button", { onClick: () => setShowForm(true), className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Flag"] })] })] }), showForm && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-8", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Create Feature Flag" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [_jsx("input", { type: "text", placeholder: "Flag name (e.g., new_dashboard)", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("input", { type: "text", placeholder: "Description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("div", { children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: formData.enabled, onChange: (e) => setFormData({ ...formData, enabled: e.target.checked }), className: "rounded" }), _jsx("span", { className: "text-gray-700", children: "Enable by default" })] }) }), _jsxs("div", { children: [_jsx("label", { className: "text-gray-700 text-sm", children: "Rollout %" }), _jsx("input", { type: "number", min: "0", max: "100", value: formData.rollout_percentage, onChange: (e) => setFormData({ ...formData, rollout_percentage: parseInt(e.target.value) }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleCreate, className: "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700", children: "Create" }), _jsx("button", { onClick: () => setShowForm(false), className: "px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50", children: "Cancel" })] })] })), loading && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "inline-block animate-spin", children: _jsx(RefreshCw, { className: "w-8 h-8 text-blue-600" }) }), _jsx("p", { className: "text-gray-600 mt-2", children: "Loading feature flags..." })] })), !loading && flags.length > 0 && (_jsx("div", { className: "space-y-4", children: flags.map((flag) => (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200", children: [_jsxs("div", { className: "p-6 cursor-pointer hover:bg-gray-50 flex justify-between items-center", onClick: () => setExpandedId(expandedId === flag.id ? null : flag.id), children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: flag.name }), flag.description && (_jsx("p", { className: "text-gray-600 text-sm mt-1", children: flag.description }))] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `px-3 py-1 rounded-lg text-sm font-medium ${flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: flag.enabled ? 'Enabled' : 'Disabled' }), _jsx(ChevronDown, { className: `w-5 h-5 text-gray-400 transition-transform ${expandedId === flag.id ? 'transform rotate-180' : ''}` })] })] }), expandedId === flag.id && (_jsxs("div", { className: "px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-4", children: [_jsx("div", { children: _jsx("button", { onClick: () => handleToggle(flag.id, flag.enabled), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${flag.enabled
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'}`, children: flag.enabled ? 'Disable Flag' : 'Enable Flag' }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Rollout Percentage" }), _jsxs("span", { className: "text-sm font-semibold text-gray-900", children: [flag.rollout_percentage, "%"] })] }), _jsx("input", { type: "range", min: "0", max: "100", value: flag.rollout_percentage, onChange: (e) => handleUpdateRollout(flag.id, parseInt(e.target.value)), className: "w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" }), _jsx("p", { className: "text-xs text-gray-600 mt-2", children: flag.rollout_percentage === 0
                                                    ? '🔴 Feature is off for all users'
                                                    : flag.rollout_percentage === 100
                                                        ? '🟢 Feature is on for all users'
                                                        : `🟡 Feature will be enabled for ${flag.rollout_percentage}% of users` })] }), _jsxs("div", { className: "pt-4 border-t border-gray-300", children: [_jsxs("p", { className: "text-xs text-gray-600", children: [_jsx("span", { className: "font-semibold", children: "ID:" }), " ", flag.id] }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [_jsx("span", { className: "font-semibold", children: "Created:" }), " ", new Date(flag.created_at).toLocaleString()] }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [_jsx("span", { className: "font-semibold", children: "Updated:" }), " ", new Date(flag.updated_at).toLocaleString()] })] }), _jsx("div", { className: "flex justify-end pt-2 border-t border-gray-300", children: _jsxs("button", { onClick: () => handleDelete(flag.id), className: "inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700", children: [_jsx(Trash2, { className: "w-4 h-4 mr-2" }), "Delete"] }) })] }))] }, flag.id))) })), !loading && flags.length === 0 && (_jsxs("div", { className: "text-center py-12 bg-white rounded-lg border border-gray-200", children: [_jsx("p", { className: "text-gray-500 mb-4", children: "No feature flags yet" }), _jsxs("button", { onClick: () => setShowForm(true), className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create First Flag"] })] }))] }) }));
}
