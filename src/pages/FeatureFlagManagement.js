import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './FeatureFlagManagement.css';
const FeatureFlagManagement = () => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showToggleConfirm, setShowToggleConfirm] = useState(null);
    useEffect(() => {
        fetchFeatureFlags();
    }, []);
    const fetchFeatureFlags = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/features/all');
            if (!response.ok)
                throw new Error('Failed to fetch feature flags');
            const data = await response.json();
            setFlags(Object.values(data));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    const toggleFeatureFlag = async (flagKey) => {
        try {
            const response = await fetch(`/api/features/${flagKey}/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok)
                throw new Error('Failed to toggle feature flag');
            // Update local state
            setFlags(flags.map(flag => flag.key === flagKey ? { ...flag, enabled: !flag.enabled } : flag));
            setShowToggleConfirm(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };
    const setRolloutPercentage = async (flagKey, percentage) => {
        try {
            const response = await fetch(`/api/features/${flagKey}/rollout?percentage=${percentage}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            if (!response.ok)
                throw new Error('Failed to set rollout percentage');
            setFlags(flags.map(flag => flag.key === flagKey
                ? { ...flag, rollout_percentage: percentage }
                : flag));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };
    const filteredFlags = flags.filter(flag => {
        const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory;
        const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flag.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    const getCategoryColor = (category) => {
        const colors = {
            ui: '#235393',
            advanced: '#60BA46',
            experimental: '#FAB915',
            rollout: '#132136',
        };
        return colors[category] || '#ccc';
    };
    if (loading)
        return _jsx("div", { className: "ff-container", children: _jsx("div", { className: "ff-loading", children: "Loading..." }) });
    return (_jsxs("div", { className: "ff-container", children: [_jsxs("div", { className: "ff-header", children: [_jsx("h1", { children: "\u2699\uFE0F Feature Flag Management" }), _jsx("p", { children: "Control feature rollouts, A/B testing, and experimental features" })] }), error && _jsx("div", { className: "ff-error", children: error }), _jsxs("div", { className: "ff-controls", children: [_jsx("div", { className: "ff-search-wrapper", children: _jsx("input", { type: "text", className: "ff-search", placeholder: "Search features...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }) }), _jsx("div", { className: "ff-category-filters", children: ['all', 'ui', 'advanced', 'experimental', 'rollout'].map(cat => (_jsxs("button", { className: `ff-category-btn ${selectedCategory === cat ? 'active' : ''}`, onClick: () => setSelectedCategory(cat), children: [cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1), _jsx("span", { className: "ff-count", children: cat === 'all'
                                        ? flags.length
                                        : flags.filter(f => f.category === cat).length })] }, cat))) })] }), _jsx("div", { className: "ff-flags-grid", children: filteredFlags.map(flag => (_jsxs("div", { className: "ff-flag-card", children: [_jsxs("div", { className: "ff-flag-header", children: [_jsxs("div", { className: "ff-flag-title", children: [_jsx("h3", { children: flag.name }), _jsx("span", { className: "ff-category-badge", style: { backgroundColor: getCategoryColor(flag.category) }, children: flag.category })] }), _jsxs("div", { className: "ff-toggle-switch", children: [_jsx("input", { type: "checkbox", id: `toggle-${flag.key}`, checked: flag.enabled, onChange: () => setShowToggleConfirm(flag.key), className: "ff-checkbox" }), _jsx("label", { htmlFor: `toggle-${flag.key}`, className: "ff-toggle-label", children: _jsx("span", { className: flag.enabled ? 'on' : 'off', children: flag.enabled ? 'ON' : 'OFF' }) })] })] }), _jsx("p", { className: "ff-description", children: flag.description }), flag.rollout_percentage !== undefined && (_jsxs("div", { className: "ff-rollout-section", children: [_jsxs("label", { className: "ff-rollout-label", children: ["Rollout: ", flag.rollout_percentage, "%"] }), _jsx("input", { type: "range", min: "0", max: "100", value: flag.rollout_percentage, onChange: (e) => setRolloutPercentage(flag.key, parseInt(e.target.value)), className: "ff-rollout-slider" })] })), _jsx("div", { className: "ff-metadata", children: flag.updated_at && (_jsxs("span", { className: "ff-date", children: ["Updated: ", new Date(flag.updated_at).toLocaleDateString()] })) }), showToggleConfirm === flag.key && (_jsx("div", { className: "ff-confirm-modal", children: _jsxs("div", { className: "ff-confirm-content", children: [_jsxs("p", { children: [flag.enabled ? 'Disable' : 'Enable', " ", flag.name, "?"] }), _jsxs("div", { className: "ff-confirm-buttons", children: [_jsxs("button", { onClick: () => toggleFeatureFlag(flag.key), className: "ff-confirm-btn confirm", children: ["Yes, ", flag.enabled ? 'Disable' : 'Enable'] }), _jsx("button", { onClick: () => setShowToggleConfirm(null), className: "ff-confirm-btn cancel", children: "Cancel" })] })] }) }))] }, flag.key))) }), filteredFlags.length === 0 && (_jsx("div", { className: "ff-empty", children: _jsx("p", { children: "No features found matching your search" }) })), _jsxs("div", { className: "ff-stats", children: [_jsxs("div", { className: "ff-stat", children: [_jsx("h4", { children: "Total Features" }), _jsx("p", { className: "ff-stat-value", children: flags.length })] }), _jsxs("div", { className: "ff-stat", children: [_jsx("h4", { children: "Enabled" }), _jsx("p", { className: "ff-stat-value", children: flags.filter(f => f.enabled).length })] }), _jsxs("div", { className: "ff-stat", children: [_jsx("h4", { children: "Disabled" }), _jsx("p", { className: "ff-stat-value", children: flags.filter(f => !f.enabled).length })] }), _jsxs("div", { className: "ff-stat", children: [_jsx("h4", { children: "Experimental" }), _jsx("p", { className: "ff-stat-value", children: flags.filter(f => f.category === 'experimental').length })] })] })] }));
};
export default FeatureFlagManagement;
