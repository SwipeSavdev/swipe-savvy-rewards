import { useState } from 'react'
import { Save, Eye, EyeOff, Bell, Lock, Palette } from 'lucide-react'

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
  })

  const [apiKeyVisible, setApiKeyVisible] = useState({
    stripe: false,
    twilio: false,
  })

  const [savedMessage, setSavedMessage] = useState('')

  const handleSave = () => {
    setSavedMessage('Settings saved successfully!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform settings and integrations</p>
        </div>

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-green-800">
            {savedMessage}
          </div>
        )}

        {/* App Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            App Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">App Name</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">App Description</label>
              <textarea
                value={settings.appDescription}
                onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Support Phone</label>
                <input
                  type="tel"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Toggles</h2>
          <div className="space-y-3">
            {[
              { key: 'enableChallenges', label: 'Challenges' },
              { key: 'enableRewards', label: 'Rewards System' },
              { key: 'enableInvestments', label: 'Investments (Beta)' },
              { key: 'enableCommunity', label: 'Community Features' },
            ].map((feature) => (
              <label key={feature.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[feature.key as keyof typeof settings] as boolean}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      [feature.key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-900">{feature.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </h2>
          <div className="space-y-3">
            {[
              { key: 'emailNotifications', label: 'Email Notifications' },
              { key: 'pushNotifications', label: 'Push Notifications' },
              { key: 'smsNotifications', label: 'SMS Notifications' },
              { key: 'dailyDigest', label: 'Daily Digest' },
              { key: 'weeklyReport', label: 'Weekly Report' },
            ].map((notif) => (
              <label key={notif.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[notif.key as keyof typeof settings] as boolean}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      [notif.key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-900">{notif.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security Settings
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireMFA}
                onChange={(e) => setSettings({ ...settings, requireMFA: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-900">Require Multi-Factor Authentication</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableBiometric}
                onChange={(e) => setSettings({ ...settings, enableBiometric: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-900">Enable Biometric Authentication</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Min Password Length
                </label>
                <input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) =>
                    setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Merchant Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.merchantCommission}
                onChange={(e) =>
                  setSettings({ ...settings, merchantCommission: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Processing Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.processsingFee}
                onChange={(e) =>
                  setSettings({ ...settings, processsingFee: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Refund Period (days)
              </label>
              <input
                type="number"
                value={settings.refundPeriodDays}
                onChange={(e) =>
                  setSettings({ ...settings, refundPeriodDays: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Stripe API Key</label>
              <div className="flex gap-2">
                <input
                  type={apiKeyVisible.stripe ? 'text' : 'password'}
                  value={settings.stripeApiKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => setApiKeyVisible({ ...apiKeyVisible, stripe: !apiKeyVisible.stripe })}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {apiKeyVisible.stripe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Twilio Account SID</label>
              <div className="flex gap-2">
                <input
                  type={apiKeyVisible.twilio ? 'text' : 'password'}
                  value={settings.twilioAccountSid}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => setApiKeyVisible({ ...apiKeyVisible, twilio: !apiKeyVisible.twilio })}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {apiKeyVisible.twilio ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
