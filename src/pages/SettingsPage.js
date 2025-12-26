import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Save, Eye, EyeOff, Bell, Lock, Palette } from 'lucide-react';
export function SettingsPage() {
    const [settings, setSettings] = useState({
        // App Settings
        appName: 'Swioe Savvy',
        appDescription: 'Financial wellness and mobile wallet platform',
        supportEmail: 'support@swioesavvy.com',
        supportPhone: '+1-800-SAVVY-NOW',
        // Feature Toggles
        enableChallenges: true,
        enableRewards: true,
        enableInvestments: false,
        enableCommunity: true,
        // Notification Settings
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        dailyDigest: true,
        weeklyReport: true,
        // Security
        requireMFA: false,
        sessionTimeout: 30,
        passwordMinLength: 8,
        enableBiometric: true,
        // Commission
        merchantCommission: 2.5,
        processsingFee: 1.8,
        refundPeriodDays: 30,
        // API Keys
        stripeApiKey: '****************************sk_test_abc123',
        twilioAccountSid: '****************************',
    });
    const [apiKeyVisible, setApiKeyVisible] = useState({
        stripe: false,
        twilio: false,
    });
    const [savedMessage, setSavedMessage] = useState('');
    const handleSave = () => {
        setSavedMessage('Settings saved successfully!');
        setTimeout(() => setSavedMessage(''), 3000);
    };
    return (_jsx("div", { className: "p-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Settings" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Configure platform settings and integrations" })] }), savedMessage && (_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-green-800", children: savedMessage })), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(Palette, { className: "w-5 h-5" }), "App Settings"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "App Name" }), _jsx("input", { type: "text", value: settings.appName, onChange: (e) => setSettings({ ...settings, appName: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "App Description" }), _jsx("textarea", { value: settings.appDescription, onChange: (e) => setSettings({ ...settings, appDescription: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "Support Email" }), _jsx("input", { type: "email", value: settings.supportEmail, onChange: (e) => setSettings({ ...settings, supportEmail: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "Support Phone" }), _jsx("input", { type: "tel", value: settings.supportPhone, onChange: (e) => setSettings({ ...settings, supportPhone: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Feature Toggles" }), _jsx("div", { className: "space-y-3", children: [
                                { key: 'enableChallenges', label: 'Challenges' },
                                { key: 'enableRewards', label: 'Rewards System' },
                                { key: 'enableInvestments', label: 'Investments (Beta)' },
                                { key: 'enableCommunity', label: 'Community Features' },
                            ].map((feature) => (_jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings[feature.key], onChange: (e) => setSettings({
                                            ...settings,
                                            [feature.key]: e.target.checked,
                                        }), className: "w-4 h-4 rounded border-gray-300" }), _jsx("span", { className: "text-gray-900", children: feature.label })] }, feature.key))) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(Bell, { className: "w-5 h-5" }), "Notification Settings"] }), _jsx("div", { className: "space-y-3", children: [
                                { key: 'emailNotifications', label: 'Email Notifications' },
                                { key: 'pushNotifications', label: 'Push Notifications' },
                                { key: 'smsNotifications', label: 'SMS Notifications' },
                                { key: 'dailyDigest', label: 'Daily Digest' },
                                { key: 'weeklyReport', label: 'Weekly Report' },
                            ].map((notif) => (_jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings[notif.key], onChange: (e) => setSettings({
                                            ...settings,
                                            [notif.key]: e.target.checked,
                                        }), className: "w-4 h-4 rounded border-gray-300" }), _jsx("span", { className: "text-gray-900", children: notif.label })] }, notif.key))) })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(Lock, { className: "w-5 h-5" }), "Security Settings"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.requireMFA, onChange: (e) => setSettings({ ...settings, requireMFA: e.target.checked }), className: "w-4 h-4 rounded border-gray-300" }), _jsx("span", { className: "text-gray-900", children: "Require Multi-Factor Authentication" })] }), _jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.enableBiometric, onChange: (e) => setSettings({ ...settings, enableBiometric: e.target.checked }), className: "w-4 h-4 rounded border-gray-300" }), _jsx("span", { className: "text-gray-900", children: "Enable Biometric Authentication" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "Session Timeout (minutes)" }), _jsx("input", { type: "number", value: settings.sessionTimeout, onChange: (e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "Min Password Length" }), _jsx("input", { type: "number", value: settings.passwordMinLength, onChange: (e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Commission Settings" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "Merchant Commission (%)" }), _jsx("input", { type: "number", step: "0.1", value: settings.merchantCommission, onChange: (e) => setSettings({ ...settings, merchantCommission: parseFloat(e.target.value) }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "Processing Fee (%)" }), _jsx("input", { type: "number", step: "0.1", value: settings.processsingFee, onChange: (e) => setSettings({ ...settings, processsingFee: parseFloat(e.target.value) }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "Refund Period (days)" }), _jsx("input", { type: "number", value: settings.refundPeriodDays, onChange: (e) => setSettings({ ...settings, refundPeriodDays: parseInt(e.target.value) }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] })] }), _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "API Keys" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "Stripe API Key" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: apiKeyVisible.stripe ? 'text' : 'password', value: settings.stripeApiKey, readOnly: true, className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" }), _jsx("button", { onClick: () => setApiKeyVisible({ ...apiKeyVisible, stripe: !apiKeyVisible.stripe }), className: "px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50", children: apiKeyVisible.stripe ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-900 mb-1", children: "Twilio Account SID" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: apiKeyVisible.twilio ? 'text' : 'password', value: settings.twilioAccountSid, readOnly: true, className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" }), _jsx("button", { onClick: () => setApiKeyVisible({ ...apiKeyVisible, twilio: !apiKeyVisible.twilio }), className: "px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50", children: apiKeyVisible.twilio ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { onClick: handleSave, className: "inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), "Save Settings"] }) })] }) }));
}
