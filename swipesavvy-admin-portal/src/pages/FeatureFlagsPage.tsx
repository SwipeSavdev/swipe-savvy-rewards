import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ProgressBar from '@/components/ui/ProgressBar'
import Slider from '@/components/ui/Slider'
import { type TableColumn } from '@/components/ui/Table'
import { useToastStore } from '@/store/toastStore'
import type { FeatureFlag } from '@/types/featureFlags'
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
  console.log('[FeatureFlagsPage] RENDERING Component')
  
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(false)
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
      category: f.category as any, // Type assertion for categories not in FeatureCategory type
    }))
  )
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [pending, setPending] = useState<FeatureFlag | null>(null)
  const [toggling, setToggling] = useState(false)
  const [rolloutValue, setRolloutValue] = useState(0)

  // Log component mount
  useEffect(() => {
    console.log('[FeatureFlagsPage] Component mounted')
    return () => console.log('[FeatureFlagsPage] Component unmounted')
  }, [])

  const fetchFlags = async (shouldShowLoading = true) => {
    // Try to fetch from real API, fallback to local mock data
    if (shouldShowLoading) setLoading(true)
    try {
      const { Api } = await import('@/services/api')
      const res = await Api.featureFlagsApi.listFlags(1, 200)
      if (res.flags && res.flags.length > 0) {
        setFlags(res.flags.map((f: any) => ({
          id: f.id,
          key: f.name,
          name: f.displayName || f.name,
          displayName: f.displayName || f.name,
          description: f.description,
          enabled: f.enabled,
          status: f.enabled ? 'on' : 'off' as const,
          rolloutPercentage: f.rolloutPercentage,
          rolloutPct: f.rolloutPercentage,
          targetedUsers: f.targetedUsers || [],
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
          createdBy: f.createdBy || 'system',
          updatedBy: 'system',
          environment: f.environment || 'production',
          category: 'authentication' as any,
        })))
      }
    } catch (err) {
      console.warn('API unavailable, using local feature flags data')
      // Keep using MOBILE_APP_FEATURES mock data
    } finally {
      if (shouldShowLoading) setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (mounted) await fetchFlags(true)
    })()
    return () => {
      mounted = false
    }
  }, [query])

  const filteredFlags = useMemo(() => {
    return flags.filter((flag: any) => {
      const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory
      const matchesQuery = !query || flag.name.toLowerCase().includes(query.toLowerCase()) ||
        (flag.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
      return matchesCategory && matchesQuery
    })
  }, [flags, selectedCategory, query])

  const handleRowClick = (flag: FeatureFlag) => {
    handleToggleFeature(flag)
  }

  const onConfirm = async () => {
    if (!pending) return
    setToggling(true)
    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      setFlags(flags.map((f) =>
        f.id === pending.id
          ? {
              ...f,
              status: f.status === 'on' ? 'off' : 'on',
              enabled: f.status === 'off',
              updatedAt: new Date().toISOString(),
            }
          : f,
      ))
      pushToast({
        variant: 'success',
        title: 'Feature flag updated',
        message: `${pending.name} has been ${pending.status === 'off' ? 'enabled' : 'disabled'}.`,
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

  const columns: TableColumn<FeatureFlag>[] = useMemo(
    () => [],
    []
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--ss-text-primary)]">Feature Flags</h1>
        <p className="mt-2 text-[var(--ss-text-muted)]">
          Manage and control SwipeSavvy mobile app features by category
        </p>
      </div>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {FEATURE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[var(--ss-primary)] text-white'
                  : 'bg-[var(--ss-surface-alt)] text-[var(--ss-text-secondary)] hover:bg-[var(--ss-surface)]'
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
                    <h3 className="font-semibold text-[var(--ss-text-primary)]">
                      {flag.name}
                    </h3>
                    <p className="text-xs text-[var(--ss-text-muted)] mt-1">
                      {flag.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={flag.status === 'on' ? 'success' : 'neutral'}>
                    {flag.status === 'on' ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <span className="text-xs text-[var(--ss-text-muted)]">
                    {flag.rolloutPct ?? 0}% rollout
                  </span>
                </div>
                {(flag.rolloutPct ?? 0) < 100 && flag.status === 'on' && (
                  <div className="mt-3">
                    <ProgressBar value={flag.rolloutPct ?? 0} />
                    <p className="text-xs text-[var(--ss-text-muted)] mt-1">
                      Rolling out to {flag.rolloutPct ?? 0}% of users
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleToggleFeature(flag)}
                className={`mt-4 px-4 py-2 rounded-lg font-medium transition-all ${
                  flag.status === 'on'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {flag.status === 'on' ? 'Disable' : 'Enable'}
              </button>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredFlags.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-[var(--ss-text-muted)]">No features found in this category</p>
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
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4 text-sm text-[var(--ss-text-muted)]">
            {pending
              ? pending.status === 'on'
                ? `Disable "${pending.name}"? This feature will be turned off for all users.`
                : `Enable "${pending.name}"? This feature will be turned on for all users.`
              : ''}
          </div>

          {pending?.status !== 'on' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--ss-text)]">
                Rollout percentage
                <span className="ml-2 text-[var(--ss-text-muted)]">{rolloutValue}%</span>
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
              <p className="text-xs text-[var(--ss-text-muted)]">
                Control the percentage of users who will see this feature when enabled.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
