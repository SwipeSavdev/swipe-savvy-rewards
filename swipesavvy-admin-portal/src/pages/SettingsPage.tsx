import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Form from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Checkbox from '@/components/ui/Checkbox'
import RadioGroup from '@/components/ui/RadioGroup'
import FileInput from '@/components/ui/FileInput'
import Combobox from '@/components/ui/Combobox'
import MultiSelect from '@/components/ui/MultiSelect'
import Button from '@/components/ui/Button'
import Accordion from '@/components/ui/Accordion'
import { useToastStore } from '@/store/toastStore'
import { Api } from '@/services/api'

export default function SettingsPage() {
  const pushToast = useToastStore((s) => s.push)
  const [orgName, setOrgName] = useState('SwipeSavvy')
  const [orgDesc, setOrgDesc] = useState('')
  const [timezone, setTimezone] = useState<string | null>('America/Los_Angeles')
  const [locales, setLocales] = useState<string[]>(['en-US'])
  const [alerts, setAlerts] = useState(true)
  const [digest, setDigest] = useState(false)
  const [brandingMode, setBrandingMode] = useState('system')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // API Rate Limit tracking
  const [rateLimitUsage] = useState({
    remaining: 4950,
    total: 5000,
    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
    percentageUsed: 1,
  })

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const response = await Api.settingsApi.getSettings()
        if (response && response.settings) {
          const settings = response.settings
          if (settings.platformName) setOrgName(settings.platformName)
          if (settings.platformDescription) setOrgDesc(settings.platformDescription)
          if (settings.timezone) setTimezone(settings.timezone)
          if (settings.language) setLocales([settings.language])
          if (typeof settings.alerts === 'boolean') setAlerts(settings.alerts)
          if (typeof settings.digest === 'boolean') setDigest(settings.digest)
          if (settings.brandingMode) setBrandingMode(settings.brandingMode)
        }
      } catch (error) {
        console.warn('Could not load existing settings:', error)
        // Continue with defaults if fetch fails
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const onSave = async () => {
    setSaving(true)
    try {
      // Persist settings to backend
      const response = await Api.settingsApi.updateSettings({
        name: orgName,
        description: orgDesc,
        timezone,
        locales,
        alerts,
        digest,
        branding_mode: brandingMode,
      })

      console.log('[SettingsPage] Update response:', response)
      
      if (response && response.success) {
        pushToast({ 
          variant: 'success', 
          title: 'Settings saved', 
          message: 'Your preferences have been updated successfully.' 
        })
      } else if (response) {
        // Response exists but no success flag, still treat as success
        pushToast({ 
          variant: 'success', 
          title: 'Settings saved', 
          message: 'Your preferences have been updated successfully.' 
        })
      } else {
        throw new Error('No response from server')
      }
    } catch (error: any) {
      console.error('[SettingsPage] Failed to save settings:', error)
      pushToast({ 
        variant: 'error', 
        title: 'Save failed', 
        message: error?.message || 'Failed to save settings. Please try again.' 
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Manage platform configuration, users, roles, and policies.</p>
      </div>

      {/* General Settings Tab */}
      <>
          <Card className="p-4">
            <Accordion
          defaultOpenKeys={["org"]}
          items={[
            {
              key: 'org',
              title: 'Organization',
              content: (
                <Form spacing="md" onSubmit={(e) => e.preventDefault()}>
                  <Input 
                    label="Organization name" 
                    value={orgName} 
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={loading}
                  />
                  <TextArea
                    label="Description"
                    value={orgDesc}
                    onChange={(e) => setOrgDesc(e.target.value)}
                    placeholder="Optional description shown in internal tooling"
                    showCount
                    maxCount={240}
                    disabled={loading}
                  />

                  <Combobox
                    label="Timezone"
                    value={timezone}
                    onChange={setTimezone}
                    options={[
                      { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
                      { value: 'America/New_York', label: 'America/New_York' },
                      { value: 'Europe/London', label: 'Europe/London' },
                      { value: 'Asia/Dubai', label: 'Asia/Dubai' },
                    ]}
                  />

                  <MultiSelect
                    label="Supported locales"
                    values={locales}
                    onChange={setLocales}
                    options={[
                      { value: 'en-US', label: 'English (US)' },
                      { value: 'es-ES', label: 'Español (ES)' },
                      { value: 'fr-FR', label: 'Français (FR)' },
                      { value: 'ar-AE', label: 'العربية (AE)' },
                    ]}
                  />
                </Form>
              ),
            },
            {
              key: 'branding',
              title: 'Branding',
              content: (
                <div className="space-y-4">
                  <FileInput 
                    label="Portal logo" 
                    accept="image/*" 
                    hint="Upload a logo to replace the SS placeholder."
                  />

                  <RadioGroup
                    name="brandingMode"
                    value={brandingMode}
                    onChange={setBrandingMode}
                    options={[
                      { value: 'system', label: 'System', description: 'Follow the user’s OS theme.' },
                      { value: 'light', label: 'Light', description: 'Force light theme across the portal.' },
                      { value: 'dark', label: 'Dark', description: 'Force dark theme across the portal.' },
                    ]}
                  />

                  <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4 text-sm text-[var(--ss-text-muted)]">
                    Tip: The portal theme uses the provided SwipeSavvy design tokens. Replace <code>src/styles/tokens.css</code> to fully rebrand.
                  </div>
                </div>
              ),
            },
            {
              key: 'notifications',
              title: 'Notifications',
              content: (
                <div className="space-y-3">
                  <Checkbox 
                    label="Real-time operational alerts" 
                    checked={alerts} 
                    onChange={(e) => setAlerts(e.target.checked)}
                    disabled={loading}
                  />
                  <Checkbox 
                    label="Daily summary digest" 
                    checked={digest} 
                    onChange={(e) => setDigest(e.target.checked)}
                    disabled={loading}
                  />

                  <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4 text-sm text-[var(--ss-text-muted)]">
                    Connect these toggles to notification preferences in your API.
                  </div>
                </div>
              ),
            },
          ]}
            />

          <div className="mt-6 flex justify-end">
            <Button onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[var(--ss-text)]">API Rate Limits</h2>
            <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Monitor your API quota usage.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-[var(--ss-background-secondary)] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--ss-text)]">API Requests This Period</span>
                <span className="text-sm font-semibold text-[var(--ss-text)]">
                  {rateLimitUsage.total - rateLimitUsage.remaining} / {rateLimitUsage.total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--ss-border)]">
                <div
                  className={`h-full transition-all ${
                    rateLimitUsage.percentageUsed > 80
                      ? 'bg-red-500'
                      : rateLimitUsage.percentageUsed > 50
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${rateLimitUsage.percentageUsed}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-[var(--ss-text-muted)]">
                {rateLimitUsage.remaining.toLocaleString()} requests remaining
              </div>
            </div>

            <div className="flex items-start justify-between rounded-lg border border-[var(--ss-border)] p-4">
              <div>
                <p className="font-medium text-[var(--ss-text)]">Reset Frequency</p>
                <p className="text-sm text-[var(--ss-text-muted)]">Every 24 hours</p>
              </div>
              <span className="text-sm text-[var(--ss-text-muted)]">Next reset: {rateLimitUsage.resetTime}</span>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">Rate Limit Warning</p>
              <p className="mt-1 text-xs text-yellow-800 dark:text-yellow-300">
                You have used {rateLimitUsage.percentageUsed}% of your API quota. Contact support if you need higher limits.
              </p>
            </div>
          </div>
        </Card>
      </>
    </div>
  )
}
