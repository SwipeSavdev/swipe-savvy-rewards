import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './FeatureFlagAnalytics.css';
const FeatureFlagAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [selectedFlag, setSelectedFlag] = useState(null);
    const [timeRange, setTimeRange] = useState(7);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);
    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            // In a real implementation, fetch actual analytics
            const mockData = [
                {
                    flag_key: 'tier_progress_bar',
                    flag_name: 'Tier Progress Bar',
                    total_users: 12450,
                    total_interactions: 34820,
                    completion_rate: 87.5,
                    engagement_score: 8.2,
                    period_days: timeRange,
                    daily_data: generateMockDailyData(timeRange),
                },
                {
                    flag_key: 'social_sharing',
                    flag_name: 'Social Sharing',
                    total_users: 8920,
                    total_interactions: 15640,
                    completion_rate: 72.3,
                    engagement_score: 7.1,
                    period_days: timeRange,
                    daily_data: generateMockDailyData(timeRange),
                },
                {
                    flag_key: 'receipt_generation',
                    flag_name: 'Receipt Generation',
                    total_users: 6450,
                    total_interactions: 12340,
                    completion_rate: 81.2,
                    engagement_score: 7.8,
                    period_days: timeRange,
                    daily_data: generateMockDailyData(timeRange),
                },
            ];
            setAnalyticsData(mockData);
            if (mockData.length > 0) {
                setSelectedFlag(mockData[0].flag_key);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    const generateMockDailyData = (days) => {
        const data = [];
        for (let i = days; i > 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                users: Math.floor(Math.random() * 2000) + 500,
                interactions: Math.floor(Math.random() * 5000) + 1000,
                completions: Math.floor(Math.random() * 4000) + 500,
            });
        }
        return data;
    };
    const selectedAnalytics = analyticsData.find((data) => data.flag_key === selectedFlag);
    if (loading)
        return _jsx("div", { className: "ffa-container", children: _jsx("div", { className: "ffa-loading", children: "Loading..." }) });
    return (_jsxs("div", { className: "ffa-container", children: [_jsxs("div", { className: "ffa-header", children: [_jsx("h1", { children: "\uD83D\uDCCA Feature Flag Analytics" }), _jsx("p", { children: "Monitor feature usage, engagement, and performance metrics" })] }), error && _jsx("div", { className: "ffa-error", children: error }), _jsx("div", { className: "ffa-controls", children: _jsxs("div", { className: "ffa-time-range", children: [_jsx("label", { children: "Time Range:" }), _jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(parseInt(e.target.value)), children: [_jsx("option", { value: 1, children: "Last 24 Hours" }), _jsx("option", { value: 7, children: "Last 7 Days" }), _jsx("option", { value: 30, children: "Last 30 Days" }), _jsx("option", { value: 90, children: "Last 90 Days" })] })] }) }), _jsxs("div", { className: "ffa-main-grid", children: [_jsxs("div", { className: "ffa-flag-list", children: [_jsx("h3", { children: "Features" }), _jsx("div", { className: "ffa-flags", children: analyticsData.map((data) => (_jsxs("div", { className: `ffa-flag-item ${selectedFlag === data.flag_key ? 'active' : ''}`, onClick: () => setSelectedFlag(data.flag_key), children: [_jsx("div", { className: "ffa-flag-name", children: data.flag_name }), _jsxs("div", { className: "ffa-flag-stats", children: [_jsxs("span", { children: [data.total_users.toLocaleString(), " users"] }), _jsxs("span", { children: [data.engagement_score.toFixed(1), "/10 engagement"] })] })] }, data.flag_key))) })] }), selectedAnalytics && (_jsxs("div", { className: "ffa-analytics-main", children: [_jsxs("div", { className: "ffa-metrics-grid", children: [_jsxs("div", { className: "ffa-metric-card", children: [_jsx("div", { className: "ffa-metric-label", children: "Total Users" }), _jsx("div", { className: "ffa-metric-value", children: selectedAnalytics.total_users.toLocaleString() }), _jsx("div", { className: "ffa-metric-change", children: "+12% from previous period" })] }), _jsxs("div", { className: "ffa-metric-card", children: [_jsx("div", { className: "ffa-metric-label", children: "Total Interactions" }), _jsx("div", { className: "ffa-metric-value", children: selectedAnalytics.total_interactions.toLocaleString() }), _jsx("div", { className: "ffa-metric-change", children: "+8% from previous period" })] }), _jsxs("div", { className: "ffa-metric-card", children: [_jsx("div", { className: "ffa-metric-label", children: "Completion Rate" }), _jsxs("div", { className: "ffa-metric-value", children: [selectedAnalytics.completion_rate.toFixed(1), "%"] }), _jsx("div", { className: "ffa-progress-bar", children: _jsx("div", { className: "ffa-progress-fill", style: { width: `${selectedAnalytics.completion_rate}%` } }) })] }), _jsxs("div", { className: "ffa-metric-card", children: [_jsx("div", { className: "ffa-metric-label", children: "Engagement Score" }), _jsxs("div", { className: "ffa-metric-value", children: [selectedAnalytics.engagement_score.toFixed(1), "/10"] }), _jsx("div", { className: "ffa-engagement-bar", children: _jsx("div", { className: "ffa-engagement-fill", style: { width: `${(selectedAnalytics.engagement_score / 10) * 100}%` } }) })] })] }), _jsxs("div", { className: "ffa-chart-container", children: [_jsx("h3", { children: "Daily Trends" }), _jsx("div", { className: "ffa-chart", children: selectedAnalytics.daily_data.map((day, index) => (_jsxs("div", { className: "ffa-chart-column", children: [_jsxs("div", { className: "ffa-chart-bars", children: [_jsx("div", { className: "ffa-chart-bar users", style: {
                                                                height: `${(day.users / 2500) * 100}%`,
                                                            }, title: `Users: ${day.users}` }), _jsx("div", { className: "ffa-chart-bar interactions", style: {
                                                                height: `${(day.interactions / 6000) * 100}%`,
                                                            }, title: `Interactions: ${day.interactions}` })] }), _jsx("div", { className: "ffa-chart-date", children: new Date(day.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    }) })] }, index))) }), _jsxs("div", { className: "ffa-chart-legend", children: [_jsxs("span", { children: [_jsx("span", { className: "ffa-legend-color users" }), " Users"] }), _jsxs("span", { children: [_jsx("span", { className: "ffa-legend-color interactions" }), " Interactions"] })] })] }), _jsxs("div", { className: "ffa-variants-container", children: [_jsx("h3", { children: "A/B Test Variants" }), _jsx("div", { className: "ffa-variants-grid", children: [
                                            {
                                                name: 'Control',
                                                percentage: 50,
                                                users: selectedAnalytics.total_users / 2,
                                                conversions: Math.floor((selectedAnalytics.total_users / 2) * 0.85),
                                                conversion_rate: 85.2,
                                            },
                                            {
                                                name: 'Treatment',
                                                percentage: 50,
                                                users: selectedAnalytics.total_users / 2,
                                                conversions: Math.floor((selectedAnalytics.total_users / 2) * 0.88),
                                                conversion_rate: 88.5,
                                            },
                                        ].map((variant) => (_jsxs("div", { className: "ffa-variant-card", children: [_jsx("h4", { children: variant.name }), _jsxs("div", { className: "ffa-variant-stat", children: [_jsx("span", { children: "Sample Size:" }), _jsx("strong", { children: variant.users.toLocaleString() })] }), _jsxs("div", { className: "ffa-variant-stat", children: [_jsx("span", { children: "Conversions:" }), _jsx("strong", { children: variant.conversions.toLocaleString() })] }), _jsxs("div", { className: "ffa-variant-stat", children: [_jsx("span", { children: "Conversion Rate:" }), _jsxs("strong", { children: [variant.conversion_rate.toFixed(1), "%"] })] }), _jsx("div", { className: "ffa-variant-progress", children: _jsx("div", { className: "ffa-variant-fill", style: { width: `${variant.conversion_rate}%` } }) })] }, variant.name))) })] })] }))] })] }));
};
export default FeatureFlagAnalytics;
