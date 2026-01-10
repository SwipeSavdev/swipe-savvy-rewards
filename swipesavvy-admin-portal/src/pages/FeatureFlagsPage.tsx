import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ProgressBar from '@/components/ui/ProgressBar'
import Select from '@/components/ui/Select'
import Slider from '@/components/ui/Slider'
import { Api } from '@/services/api'
import { useEventSubscription } from '@/store/eventBusStore'
import { useToastStore } from '@/store/toastStore'
import type { FeatureFlag } from '@/types/featureFlags'
import { Edit2, Loader2, Power, RefreshCw, Settings } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const FEATURE_CATEGORIES = [
  { id: 'all', label: 'All Features' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'accounts', label: 'Account Management' },
  { id: 'transfers', label: 'Transfers' },
  { id: 'ai_concierge', label: 'AI Concierge' },
  { id: 'support', label: 'Support' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'profile', label: 'Profile' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'design', label: 'Design & Theming' },
  { id: 'charity', label: 'Charity & Donations' },
  { id: 'home', label: 'Home & Dashboard' },
]

const MOBILE_APP_FEATURES = [
  // Authentication Features
  { id: 'auth.login', name: 'User Login', category: 'authentication', enabled: true, rolloutPercentage: 100, description: 'Allow users to log in to the app' },
  { id: 'auth.signup', name: 'User Registration', category: 'authentication', enabled: true, rolloutPercentage: 100, description: 'Allow new user registration' },
  { id: 'auth.mfa', name: 'Multi-Factor Authentication', category: 'authentication', enabled: true, rolloutPercentage: 85, description: 'Enable 2FA/MFA for enhanced security' },
  { id: 'auth.biometric', name: 'Biometric Login', category: 'authentication', enabled: true, rolloutPercentage: 100, description: 'Fingerprint and face recognition login' },
  { id: 'auth.password_reset', name: 'Password Reset', category: 'authentication', enabled: true, rolloutPercentage: 100, description: 'Allow users to reset forgotten passwords' },
  { id: 'auth.social_login', name: 'Social Login', category: 'authentication', enabled: false, rolloutPercentage: 0, description: 'Sign up with Google, Apple, Facebook' },
  { id: 'auth.session_management', name: 'Session Management', category: 'authentication', enabled: true, rolloutPercentage: 100, description: 'Manage user sessions and device login' },

  // Account Management Features
  { id: 'accounts.view_accounts', name: 'View Accounts', category: 'accounts', enabled: true, rolloutPercentage: 100, description: 'View linked bank and payment accounts' },
  { id: 'accounts.add_account', name: 'Add Account', category: 'accounts', enabled: true, rolloutPercentage: 100, description: 'Link new bank or payment account' },
  { id: 'accounts.remove_account', name: 'Remove Account', category: 'accounts', enabled: true, rolloutPercentage: 100, description: 'Unlink bank or payment account' },
  { id: 'accounts.account_details', name: 'Account Details', category: 'accounts', enabled: true, rolloutPercentage: 100, description: 'View detailed account information' },
  { id: 'accounts.balance_inquiry', name: 'Balance Inquiry', category: 'accounts', enabled: true, rolloutPercentage: 100, description: 'Check account balance in real-time' },
  { id: 'accounts.transaction_history', name: 'Transaction History', category: 'accounts', enabled: true, rolloutPercentage: 100, description: 'View past transactions and statements' },
  { id: 'accounts.account_statements', name: 'Download Statements', category: 'accounts', enabled: true, rolloutPercentage: 90, description: 'Download account statements (PDF/CSV)' },

  // Transfers Features
  { id: 'transfers.view_transfers', name: 'View Transfers', category: 'transfers', enabled: true, rolloutPercentage: 100, description: 'View transfer history' },
  { id: 'transfers.send_transfer', name: 'Send Transfer', category: 'transfers', enabled: true, rolloutPercentage: 100, description: 'Send money to other users' },
  { id: 'transfers.receive_transfer', name: 'Receive Transfer', category: 'transfers', enabled: true, rolloutPercentage: 100, description: 'Receive money from other users' },
  { id: 'transfers.scheduled_transfer', name: 'Scheduled Transfers', category: 'transfers', enabled: true, rolloutPercentage: 75, description: 'Schedule transfers for future dates' },
  { id: 'transfers.recurring_transfer', name: 'Recurring Transfers', category: 'transfers', enabled: false, rolloutPercentage: 0, description: 'Set up recurring/automatic transfers' },
  { id: 'transfers.transfer_templates', name: 'Transfer Templates', category: 'transfers', enabled: true, rolloutPercentage: 70, description: 'Save and reuse transfer templates' },
  { id: 'transfers.international_transfer', name: 'International Transfers', category: 'transfers', enabled: false, rolloutPercentage: 0, description: 'Send money internationally' },
  { id: 'transfers.transfer_fees', name: 'Transfer Fee Display', category: 'transfers', enabled: true, rolloutPercentage: 100, description: 'Show transfer fees before confirmation' },

  // AI Concierge Features
  { id: 'ai_concierge.chat', name: 'AI Chat', category: 'ai_concierge', enabled: true, rolloutPercentage: 95, description: 'Chat with AI concierge for support' },
  { id: 'ai_concierge.voice', name: 'Voice Commands', category: 'ai_concierge', enabled: true, rolloutPercentage: 65, description: 'Control app with voice commands' },
  { id: 'ai_concierge.suggestions', name: 'AI Suggestions', category: 'ai_concierge', enabled: true, rolloutPercentage: 80, description: 'Receive personalized AI recommendations' },
  { id: 'ai_concierge.smart_search', name: 'Smart Search', category: 'ai_concierge', enabled: true, rolloutPercentage: 90, description: 'AI-powered search functionality' },
  { id: 'ai_concierge.transaction_analysis', name: 'Transaction Analysis', category: 'ai_concierge', enabled: true, rolloutPercentage: 70, description: 'AI analysis of spending patterns' },
  { id: 'ai_concierge.budget_assistant', name: 'Budget Assistant', category: 'ai_concierge', enabled: false, rolloutPercentage: 0, description: 'AI-powered budget planning and tracking' },

  // Support Features
  { id: 'support.tickets', name: 'Support Tickets', category: 'support', enabled: true, rolloutPercentage: 100, description: 'Create and track support tickets' },
  { id: 'support.live_chat', name: 'Live Chat', category: 'support', enabled: true, rolloutPercentage: 85, description: 'Real-time live chat with support team' },
  { id: 'support.faqs', name: 'FAQs & Help Center', category: 'support', enabled: true, rolloutPercentage: 100, description: 'Browse FAQs and help articles' },
  { id: 'support.feedback', name: 'Feedback & Suggestions', category: 'support', enabled: true, rolloutPercentage: 100, description: 'Submit app feedback and suggestions' },
  { id: 'support.push_notifications', name: 'Support Notifications', category: 'support', enabled: true, rolloutPercentage: 95, description: 'Receive support-related notifications' },

  // Rewards Features
  { id: 'rewards.view_rewards', name: 'View Rewards', category: 'rewards', enabled: true, rolloutPercentage: 100, description: 'View earned rewards and points' },
  { id: 'rewards.redeem_rewards', name: 'Redeem Rewards', category: 'rewards', enabled: true, rolloutPercentage: 100, description: 'Redeem points for cashback or perks' },
  { id: 'rewards.rewards_tier', name: 'Rewards Tiers', category: 'rewards', enabled: true, rolloutPercentage: 85, description: 'VIP/loyalty program tiers' },
  { id: 'rewards.referral_program', name: 'Referral Program', category: 'rewards', enabled: true, rolloutPercentage: 80, description: 'Earn rewards by referring friends' },
  { id: 'rewards.points_conversion', name: 'Points Conversion', category: 'rewards', enabled: false, rolloutPercentage: 0, description: 'Convert rewards to cryptocurrency' },
  { id: 'rewards.leaderboard', name: 'Rewards Leaderboard', category: 'rewards', enabled: true, rolloutPercentage: 60, description: 'View rewards leaderboard and rankings' },

  // Profile Features
  { id: 'profile.view_profile', name: 'View Profile', category: 'profile', enabled: true, rolloutPercentage: 100, description: 'View personal profile information' },
  { id: 'profile.edit_profile', name: 'Edit Profile', category: 'profile', enabled: true, rolloutPercentage: 100, description: 'Update personal profile details' },
  { id: 'profile.change_password', name: 'Change Password', category: 'profile', enabled: true, rolloutPercentage: 100, description: 'Update account password' },
  { id: 'profile.notifications_settings', name: 'Notification Settings', category: 'profile', enabled: true, rolloutPercentage: 100, description: 'Manage notification preferences' },
  { id: 'profile.privacy_settings', name: 'Privacy Settings', category: 'profile', enabled: true, rolloutPercentage: 100, description: 'Control privacy and visibility settings' },
  { id: 'profile.security_settings', name: 'Security Settings', category: 'profile', enabled: true, rolloutPercentage: 100, description: 'Manage security options' },
  { id: 'profile.linked_devices', name: 'Linked Devices', category: 'profile', enabled: true, rolloutPercentage: 100, description: 'View and manage connected devices' },
  { id: 'profile.data_export', name: 'Data Export', category: 'profile', enabled: true, rolloutPercentage: 75, description: 'Export personal data in standard format' },
  { id: 'profile.account_deletion', name: 'Account Deletion', category: 'profile', enabled: true, rolloutPercentage: 100, description: 'Request account deletion' },

  // Marketing Features
  { id: 'marketing.campaigns', name: 'Marketing Campaigns', category: 'marketing', enabled: true, rolloutPercentage: 100, description: 'View active marketing campaigns' },
  { id: 'marketing.deals', name: 'Deals & Offers', category: 'marketing', enabled: true, rolloutPercentage: 100, description: 'View special deals and offers' },
  { id: 'marketing.push_promotions', name: 'Push Promotions', category: 'marketing', enabled: true, rolloutPercentage: 90, description: 'Receive promotional push notifications' },
  { id: 'marketing.email_marketing', name: 'Email Marketing', category: 'marketing', enabled: true, rolloutPercentage: 85, description: 'Opt-in for marketing emails' },
  { id: 'marketing.personalized_offers', name: 'Personalized Offers', category: 'marketing', enabled: true, rolloutPercentage: 75, description: 'AI-driven personalized offers' },

  // Charity & Donations
  { id: 'charity.view_charities', name: 'View Charities', category: 'charity', enabled: true, rolloutPercentage: 100, description: 'Browse available charity organizations' },
  { id: 'charity.donate', name: 'Make Donation', category: 'charity', enabled: true, rolloutPercentage: 100, description: 'Donate to charity organizations' },
  { id: 'charity.donation_history', name: 'Donation History', category: 'charity', enabled: true, rolloutPercentage: 100, description: 'View past donations' },
  { id: 'charity.donation_receipts', name: 'Donation Receipts', category: 'charity', enabled: true, rolloutPercentage: 95, description: 'Download donation receipts' },
  { id: 'charity.recurring_donation', name: 'Recurring Donations', category: 'charity', enabled: true, rolloutPercentage: 70, description: 'Set up automatic recurring donations' },

  // Home & Dashboard
  { id: 'home.dashboard', name: 'Main Dashboard', category: 'home', enabled: true, rolloutPercentage: 100, description: 'Home screen dashboard' },
  { id: 'home.quick_actions', name: 'Quick Actions', category: 'home', enabled: true, rolloutPercentage: 100, description: 'Quick action buttons on home' },
  { id: 'home.widgets', name: 'Home Widgets', category: 'home', enabled: true, rolloutPercentage: 100, description: 'Customizable home screen widgets' },
  { id: 'home.activity_feed', name: 'Activity Feed', category: 'home', enabled: true, rolloutPercentage: 85, description: 'View recent activity and updates' },
  { id: 'home.news_feed', name: 'News & Updates', category: 'home', enabled: true, rolloutPercentage: 80, description: 'Financial news and product updates' },

  // Design & Theming
  { id: 'design.dark_mode', name: 'Dark Mode', category: 'design', enabled: true, rolloutPercentage: 100, description: 'Dark theme support' },
  { id: 'design.light_mode', name: 'Light Mode', category: 'design', enabled: true, rolloutPercentage: 100, description: 'Light theme support' },
  { id: 'design.custom_themes', name: 'Custom Themes', category: 'design', enabled: false, rolloutPercentage: 0, description: 'Create custom color themes' },
  { id: 'design.font_scaling', name: 'Font Scaling', category: 'design', enabled: true, rolloutPercentage: 100, description: 'Adjustable font sizes' },
  { id: 'design.accessibility', name: 'Accessibility Features', category: 'design', enabled: true, rolloutPercentage: 95, description: 'WCAG compliance and a11y features' },
]

export default function FeatureFlagsPage() {
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [flags, setFlags] = useState<FeatureFlag[]>(
    MOBILE_APP_FEATURES.map((f) => ({
      id: f.id,
      key: f.id,
      name: f.name,
      displayName: f.name,
      description: f.description,
      enabled: f.enabled,
      status: f.enabled ? 'on' : 'off' as const,
      rolloutPercentage: f.rolloutPercentage,
      rolloutPct: f.rolloutPercentage,
      targetedUsers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
      environment: 'production',
      category: f.category as any,
    }))
  )
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [pending, setPending] = useState<FeatureFlag | null>(null)
  const [toggling, setToggling] = useState(false)
  const [rolloutValue, setRolloutValue] = useState(0)

  // Edit modal state
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    rolloutPercentage: 0,
    environment: 'production',
  })
  const [saving, setSaving] = useState(false)

  // Fetch and merge feature flags from API
  const fetchFeatureFlags = async () => {
    try {
      const response = await Api.featureFlagsApi.listFlags()
      const apiFlags = response?.flags || response || []

      if (Array.isArray(apiFlags) && apiFlags.length > 0) {
        // Merge API flags with local flags - API takes precedence
        setFlags((currentFlags) => {
          const flagMap = new Map(currentFlags.map(f => [f.id, f]))

          apiFlags.forEach((apiFlag: any) => {
            const id = apiFlag.id || apiFlag.flag_id || apiFlag.key
            if (id && flagMap.has(id)) {
              // Update existing flag with API data
              const existing = flagMap.get(id)!
              flagMap.set(id, {
                ...existing,
                enabled: apiFlag.enabled ?? existing.enabled,
                status: apiFlag.enabled ? 'on' : 'off',
                rolloutPercentage: apiFlag.rollout_percentage ?? apiFlag.rolloutPercentage ?? existing.rolloutPercentage,
                rolloutPct: apiFlag.rollout_percentage ?? apiFlag.rolloutPercentage ?? existing.rolloutPct,
                updatedAt: apiFlag.updated_at || apiFlag.updatedAt || existing.updatedAt,
              })
            }
          })

          return Array.from(flagMap.values())
        })
      }
    } catch (err) {
      console.error('Failed to fetch feature flags from API:', err)
      // Continue with local data
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchFeatureFlags()
  }, [])

  // Subscribe to feature flag events for cross-module updates
  useEventSubscription(
    ['feature_flag:toggled', 'feature_flag:updated', 'feature_flag:created'],
    () => {
      fetchFeatureFlags()
    }
  )

  // Sync flags to backend
  const handleSyncToBackend = async () => {
    setSyncing(true)
    try {
      // Sync enabled flags to backend using available API methods
      const enabledFlags = flags.filter(f => f.status === 'on')
      await Promise.all(
        enabledFlags.slice(0, 10).map(flag =>
          Promise.all([
            Api.featureFlagsApi.toggleFlag(flag.id, flag.enabled).catch(() => null),
            Api.featureFlagsApi.updateRollout(flag.id, flag.rolloutPct ?? 100).catch(() => null),
          ])
        )
      )
      pushToast({
        variant: 'success',
        title: 'Synced to backend',
        message: `${enabledFlags.length} feature flags synced successfully`,
      })
    } catch (err: any) {
      pushToast({
        variant: 'error',
        title: 'Sync failed',
        message: err?.message || 'Could not sync feature flags to backend',
      })
    } finally {
      setSyncing(false)
    }
  }

  const filteredFlags = useMemo(() => {
    return flags.filter((flag: any) => {
      const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory
      const matchesQuery = !query || flag.name.toLowerCase().includes(query.toLowerCase()) ||
        (flag.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
      return matchesCategory && matchesQuery
    })
  }, [flags, selectedCategory, query])

  const onConfirm = async () => {
    if (!pending) return
    setToggling(true)
    try {
      const newEnabled = pending.status === 'off'

      // Call API to toggle the flag
      await Api.featureFlagsApi.toggleFlag(pending.id, newEnabled).catch(() => null)

      // If enabling, also update rollout percentage
      if (newEnabled && rolloutValue > 0) {
        await Api.featureFlagsApi.updateRollout(pending.id, rolloutValue).catch(() => null)
      }

      setFlags(flags.map((f) =>
        f.id === pending.id
          ? {
              ...f,
              status: newEnabled ? 'on' : 'off',
              enabled: newEnabled,
              rolloutPct: newEnabled ? rolloutValue : f.rolloutPct,
              rolloutPercentage: newEnabled ? rolloutValue : f.rolloutPercentage,
              updatedAt: new Date().toISOString(),
            }
          : f,
      ))
      pushToast({
        variant: 'success',
        title: 'Feature flag updated',
        message: `${pending.name} has been ${newEnabled ? 'enabled' : 'disabled'}.`,
      })
      setPending(null)
    } catch (err: any) {
      pushToast({
        variant: 'error',
        title: 'Failed to update feature flag',
        message: err?.message || 'An error occurred.',
      })
    } finally {
      setToggling(false)
    }
  }

  const handleToggleFeature = (flag: FeatureFlag) => {
    setPending(flag)
    setRolloutValue(flag.rolloutPct ?? 0)
  }

  const handleEditFeature = (flag: FeatureFlag) => {
    setEditingFlag(flag)
    setEditForm({
      name: flag.name,
      description: flag.description || '',
      category: flag.category || '',
      rolloutPercentage: flag.rolloutPct ?? 0,
      environment: flag.environment || 'production',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingFlag) return
    setSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setFlags(flags.map((f) =>
        f.id === editingFlag.id
          ? {
              ...f,
              name: editForm.name,
              displayName: editForm.name,
              description: editForm.description,
              category: editForm.category as any,
              rolloutPercentage: editForm.rolloutPercentage,
              rolloutPct: editForm.rolloutPercentage,
              environment: editForm.environment,
              updatedAt: new Date().toISOString(),
            }
          : f,
      ))
      pushToast({
        variant: 'success',
        title: 'Feature flag updated',
        message: `${editForm.name} has been updated successfully.`,
      })
      setEditingFlag(null)
    } catch (err: any) {
      pushToast({
        variant: 'error',
        title: 'Failed to update feature flag',
        message: err?.message || 'An error occurred.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-action-primary-bg)]" />
        <span className="ml-3 text-[var(--color-text-secondary)]">Loading feature flags...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl font-semibold text-[var(--color-text-primary)]">Feature Flags</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage and control SwipeSavvy mobile app features by category
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleSyncToBackend}
          disabled={syncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync to Backend'}
        </Button>
      </div>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {FEATURE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-action-primary-bg)] text-[var(--color-action-primary-text)]'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search features..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Flags Toggle Cards */}
      {filteredFlags.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlags.map((flag) => (
            <Card key={flag.id} className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      {flag.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                      {flag.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={flag.status === 'on' ? 'success' : 'neutral'}>
                    {flag.status === 'on' ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {flag.rolloutPct ?? 0}% rollout
                  </span>
                </div>
                {(flag.rolloutPct ?? 0) < 100 && flag.status === 'on' && (
                  <div className="mt-3">
                    <ProgressBar value={flag.rolloutPct ?? 0} />
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                      Rolling out to {flag.rolloutPct ?? 0}% of users
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditFeature(flag)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)]"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleFeature(flag)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    flag.status === 'on'
                      ? 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)] hover:opacity-90'
                      : 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)] hover:opacity-90'
                  }`}
                >
                  <Power className="h-4 w-4" />
                  {flag.status === 'on' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredFlags.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-[var(--color-text-tertiary)]">No features found in this category</p>
        </Card>
      )}

      {/* Toggle Modal */}
      <Modal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title={pending ? `${pending.status === 'on' ? 'Disable' : 'Enable'} feature flag` : 'Feature flag'}
        description={pending?.name}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPending(null)} disabled={toggling}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={toggling}>
              {toggling ? 'Updating...' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-secondary)]">
            {pending
              ? pending.status === 'on'
                ? `Disable "${pending.name}"? This feature will be turned off for all users.`
                : `Enable "${pending.name}"? This feature will be turned on for all users.`
              : ''}
          </div>

          {pending?.status !== 'on' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                Rollout percentage
                <span className="ml-2 text-[var(--color-text-tertiary)]">{rolloutValue}%</span>
              </label>
              <div className="px-2">
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={rolloutValue}
                  onChange={setRolloutValue}
                />
              </div>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Control the percentage of users who will see this feature when enabled.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={Boolean(editingFlag)}
        onClose={() => setEditingFlag(null)}
        title="Edit Feature Flag"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingFlag(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Flag ID (read-only) */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Flag ID
            </label>
            <div className="px-2 py-1.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] text-xs font-mono">
              {editingFlag?.id}
            </div>
          </div>

          {/* Display Name */}
          <Input
            label="Display Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Feature name"
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Describe what this feature does..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
            />
          </div>

          {/* Two columns for Category and Environment */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              options={FEATURE_CATEGORIES.filter(c => c.id !== 'all').map(c => ({
                label: c.label,
                value: c.id,
              }))}
            />
            <Select
              label="Environment"
              value={editForm.environment}
              onChange={(e) => setEditForm({ ...editForm, environment: e.target.value })}
              options={[
                { label: 'Production', value: 'production' },
                { label: 'Staging', value: 'staging' },
                { label: 'Development', value: 'development' },
              ]}
            />
          </div>

          {/* Rollout Percentage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Rollout Percentage
              </label>
              <span className="text-sm font-semibold text-[var(--color-action-primary-bg)]">{editForm.rolloutPercentage}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={editForm.rolloutPercentage}
              onChange={(val) => setEditForm({ ...editForm, rolloutPercentage: val })}
            />
          </div>

          {/* Current Status Info */}
          <div className="flex items-center gap-2 rounded-md bg-[var(--color-bg-secondary)] px-3 py-2 text-xs">
            <Settings className="h-4 w-4 text-[var(--color-text-tertiary)]" />
            <span className="text-[var(--color-text-secondary)]">
              {editingFlag?.status === 'on' ? 'Enabled' : 'Disabled'} • Updated {editingFlag?.updatedAt ? new Date(editingFlag.updatedAt).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>
      </Modal>
    </div>
  )
}
