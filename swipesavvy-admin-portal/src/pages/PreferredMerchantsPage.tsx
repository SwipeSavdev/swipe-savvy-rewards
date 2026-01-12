import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table, { type TableColumn } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Tabs from '@/components/ui/Tabs'
import Icon from '@/components/ui/Icon'
import { useToastStore } from '@/store/toastStore'
import { formatDate } from '@/utils/dates'

// ============================================================================
// Types
// ============================================================================

interface SubscriptionTier {
  name: string
  display_name: string
  placement_score: number
  max_active_deals: number
  featured_placement: boolean
  banner_enabled: boolean
  priority_support: boolean
  analytics_access: boolean
  custom_branding: boolean
  monthly_fee: number
  annual_fee: number
  annual_savings: number
}

interface Subscription {
  id: string
  merchant_id: string
  tier: string
  placement_score: number
  max_active_deals: number
  featured_placement: boolean
  banner_enabled: boolean
  monthly_fee: number
  billing_cycle: string
  status: string
  current_period_end?: string
  created_at: string
}

interface PreferredMerchant {
  id: string
  merchant_id: string
  merchant_name: string
  display_name?: string
  description?: string
  logo_url?: string
  banner_url?: string
  category: string
  latitude?: number
  longitude?: number
  address?: string
  city?: string
  state?: string
  zip_code?: string
  cashback_percentage: number
  bonus_points_multiplier: number
  priority: number
  effective_priority: number
  is_featured: boolean
  show_banner: boolean
  subscription_tier?: string
  status: string
  start_date?: string
  end_date?: string
  tags: string[]
  deals_count: number
  active_deals_limit: number
  created_at: string
}

interface MerchantDeal {
  id: string
  preferred_merchant_id: string
  merchant_name: string
  title: string
  description?: string
  deal_type: string
  discount_value?: number
  min_purchase?: number
  max_discount?: number
  terms_and_conditions?: string
  promo_code?: string
  redemption_limit?: number
  per_user_limit: number
  image_url?: string
  priority: number
  is_featured: boolean
  status: string
  start_date: string
  end_date: string
  redemption_count: number
  view_count: number
  is_valid: boolean
  created_at: string
}

// ============================================================================
// API Helper
// ============================================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_auth_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }

  return response.json()
}

// ============================================================================
// Component
// ============================================================================

export default function PreferredMerchantsPage() {
  const pushToast = useToastStore((s) => s.push)

  // Tab state
  const [activeTab, setActiveTab] = useState('merchants')

  // Loading states
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Data
  const [merchants, setMerchants] = useState<PreferredMerchant[]>([])
  const [deals, setDeals] = useState<MerchantDeal[]>([])
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([])
  const [allMerchants, setAllMerchants] = useState<{ id: string; name: string }[]>([])

  // Filters
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')

  // Modals
  const [showCreateMerchantModal, setShowCreateMerchantModal] = useState(false)
  const [showEditMerchantModal, setShowEditMerchantModal] = useState(false)
  const [showCreateDealModal, setShowCreateDealModal] = useState(false)
  const [showEditDealModal, setShowEditDealModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Selected items
  const [selectedMerchant, setSelectedMerchant] = useState<PreferredMerchant | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<MerchantDeal | null>(null)

  // Form data
  const [merchantForm, setMerchantForm] = useState({
    merchant_id: '',
    display_name: '',
    description: '',
    category: 'retail',
    cashback_percentage: 0,
    bonus_points_multiplier: 1,
    priority: 0,
    is_featured: false,
    status: 'active',
    tags: '',
  })

  const [dealForm, setDealForm] = useState({
    title: '',
    description: '',
    deal_type: 'percentage_off',
    discount_value: 0,
    min_purchase: 0,
    max_discount: 0,
    promo_code: '',
    redemption_limit: 0,
    per_user_limit: 1,
    priority: 0,
    is_featured: false,
    start_date: '',
    end_date: '',
  })

  const [subscriptionForm, setSubscriptionForm] = useState({
    tier: 'free',
    billing_cycle: 'monthly',
  })

  // ============================================================================
  // Fetch Functions
  // ============================================================================

  const fetchPreferredMerchants = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status !== 'all') params.append('status', status)
      if (category !== 'all') params.append('category', category)
      if (tierFilter !== 'all') params.append('subscription_tier', tierFilter)
      if (query) params.append('search', query)

      const res = await fetchApi(`/api/v1/admin/preferred-merchants?${params.toString()}`)
      setMerchants(res.preferred_merchants || [])
    } catch (e: any) {
      pushToast({ variant: 'error', title: 'Error', message: e.message || 'Failed to fetch merchants' })
    } finally {
      setLoading(false)
    }
  }

  const fetchDeals = async () => {
    try {
      const res = await fetchApi('/api/v1/admin/deals')
      setDeals(res.deals || [])
    } catch (e: any) {
      console.warn('Could not fetch deals', e)
    }
  }

  const fetchSubscriptionTiers = async () => {
    try {
      const res = await fetchApi('/api/v1/subscriptions/tiers')
      setSubscriptionTiers(res.tiers || [])
    } catch (e: any) {
      console.warn('Could not fetch subscription tiers', e)
    }
  }

  const fetchAllMerchants = async () => {
    try {
      const res = await fetchApi('/api/v1/admin/merchants?per_page=1000')
      setAllMerchants((res.merchants || []).map((m: any) => ({ id: m.id, name: m.name })))
    } catch (e: any) {
      console.warn('Could not fetch all merchants', e)
    }
  }

  useEffect(() => {
    fetchPreferredMerchants()
    fetchDeals()
    fetchSubscriptionTiers()
    fetchAllMerchants()
  }, [])

  useEffect(() => {
    fetchPreferredMerchants()
  }, [query, status, category, tierFilter])

  // ============================================================================
  // CRUD Handlers - Merchants
  // ============================================================================

  const createMerchant = async () => {
    if (!merchantForm.merchant_id) {
      pushToast({ variant: 'error', title: 'Validation', message: 'Please select a merchant' })
      return
    }
    setUpdating(true)
    try {
      await fetchApi('/api/v1/admin/preferred-merchants', {
        method: 'POST',
        body: JSON.stringify({
          ...merchantForm,
          tags: merchantForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      pushToast({ variant: 'success', title: 'Success', message: 'Preferred merchant created' })
      fetchPreferredMerchants()
      closeAllModals()
    } catch (e: any) {
      pushToast({ variant: 'error', title: 'Error', message: e.message })
    } finally {
      setUpdating(false)
    }
  }

  const updateMerchant = async () => {
    if (!selectedMerchant) return
    setUpdating(true)
    try {
      await fetchApi(`/api/v1/admin/preferred-merchants/${selectedMerchant.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          display_name: merchantForm.display_name || undefined,
          description: merchantForm.description || undefined,
          category: merchantForm.category,
          cashback_percentage: merchantForm.cashback_percentage,
          bonus_points_multiplier: merchantForm.bonus_points_multiplier,
          priority: merchantForm.priority,
          is_featured: merchantForm.is_featured,
          status: merchantForm.status,
          tags: merchantForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      pushToast({ variant: 'success', title: 'Success', message: 'Merchant updated' })
      fetchPreferredMerchants()
      closeAllModals()
    } catch (e: any) {
      pushToast({ variant: 'error', title: 'Error', message: e.message })
    } finally {
      setUpdating(false)
    }
  }

  const deleteMerchant = async () => {
    if (!selectedMerchant) return
    setUpdating(true)
    try {
      await fetchApi(`/api/v1/admin/preferred-merchants/${selectedMerchant.id}`, {
        method: 'DELETE',
      })
      pushToast({ variant: 'warning', title: 'Deleted', message: 'Merchant removed from preferred list' })
      fetchPreferredMerchants()
      closeAllModals()
    } catch (e: any) {
      pushToast({ variant: 'error', title: 'Error', message: e.message })
    } finally {
      setUpdating(false)
    }
  }

  // ============================================================================
  // CRUD Handlers - Deals
  // ============================================================================

  const createDeal = async () => {
    if (!selectedMerchant || !dealForm.title) {
      pushToast({ variant: 'error', title: 'Validation', message: 'Title is required' })
      return
    }
    setUpdating(true)
    try {
      await fetchApi(`/api/v1/admin/preferred-merchants/${selectedMerchant.id}/deals`, {
        method: 'POST',
        body: JSON.stringify({
          ...dealForm,
          status: 'active',
        }),
      })
      pushToast({ variant: 'success', title: 'Success', message: 'Deal created' })
      fetchDeals()
      closeAllModals()
    } catch (e: any) {
      pushToast({ variant: 'error', title: 'Error', message: e.message })
    } finally {
      setUpdating(false)
    }
  }

  const updateDeal = async () => {
    if (!selectedDeal) return
    setUpdating(true)
    try {
      await fetchApi(`/api/v1/admin/deals/${selectedDeal.id}`, {
        method: 'PUT',
        body: JSON.stringify(dealForm),
      })
      pushToast({ variant: 'success', title: 'Success', message: 'Deal updated' })
      fetchDeals()
      closeAllModals()
    } catch (e: any) {
      pushToast({ variant: 'error', title: 'Error', message: e.message })
    } finally {
      setUpdating(false)
    }
  }

  const deleteDeal = async () => {
    if (!selectedDeal) return
    setUpdating(true)
    try {
      await fetchApi(`/api/v1/admin/deals/${selectedDeal.id}`, {
        method: 'DELETE',
      })
      pushToast({ variant: 'warning', title: 'Deleted', message: 'Deal deleted' })
      fetchDeals()
      closeAllModals()
    } catch (e: any) {
      pushToast({ variant: 'error', title: 'Error', message: e.message })
    } finally {
      setUpdating(false)
    }
  }

  // ============================================================================
  // CRUD Handlers - Subscriptions
  // ============================================================================

  const updateSubscription = async () => {
    if (!selectedMerchant) return
    setUpdating(true)
    try {
      // Check if subscription exists
      const existing = await fetchApi(`/api/v1/admin/subscriptions/${selectedMerchant.merchant_id}`)

      if (existing.has_subscription) {
        await fetchApi(`/api/v1/admin/subscriptions/${selectedMerchant.merchant_id}`, {
          method: 'PUT',
          body: JSON.stringify(subscriptionForm),
        })
      } else {
        await fetchApi('/api/v1/admin/subscriptions', {
          method: 'POST',
          body: JSON.stringify({
            merchant_id: selectedMerchant.merchant_id,
            ...subscriptionForm,
          }),
        })
      }
      pushToast({ variant: 'success', title: 'Success', message: 'Subscription updated' })
      fetchPreferredMerchants()
      closeAllModals()
    } catch (e: any) {
      pushToast({ variant: 'error', title: 'Error', message: e.message })
    } finally {
      setUpdating(false)
    }
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  const closeAllModals = () => {
    setShowCreateMerchantModal(false)
    setShowEditMerchantModal(false)
    setShowCreateDealModal(false)
    setShowEditDealModal(false)
    setShowSubscriptionModal(false)
    setShowDeleteConfirm(false)
    setSelectedMerchant(null)
    setSelectedDeal(null)
    resetForms()
  }

  const resetForms = () => {
    setMerchantForm({
      merchant_id: '',
      display_name: '',
      description: '',
      category: 'retail',
      cashback_percentage: 0,
      bonus_points_multiplier: 1,
      priority: 0,
      is_featured: false,
      status: 'active',
      tags: '',
    })
    setDealForm({
      title: '',
      description: '',
      deal_type: 'percentage_off',
      discount_value: 0,
      min_purchase: 0,
      max_discount: 0,
      promo_code: '',
      redemption_limit: 0,
      per_user_limit: 1,
      priority: 0,
      is_featured: false,
      start_date: '',
      end_date: '',
    })
    setSubscriptionForm({
      tier: 'free',
      billing_cycle: 'monthly',
    })
  }

  const getTierBadgeVariant = (tier?: string): 'info' | 'warning' | 'success' | 'danger' => {
    switch (tier) {
      case 'platinum': return 'success'
      case 'gold': return 'warning'
      case 'silver': return 'info'
      case 'bronze': return 'info'
      default: return 'info'
    }
  }

  // ============================================================================
  // Table Columns
  // ============================================================================

  const merchantColumns: TableColumn<PreferredMerchant>[] = useMemo(() => [
    {
      key: 'merchant',
      header: 'Merchant',
      sortable: true,
      accessor: (m) => m.display_name || m.merchant_name,
      cell: (m) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{m.display_name || m.merchant_name}</p>
          <p className="truncate text-xs text-[var(--ss-text-muted)]">{m.category}</p>
        </div>
      ),
    },
    {
      key: 'subscription',
      header: 'Subscription',
      sortable: true,
      accessor: (m) => m.subscription_tier || 'free',
      cell: (m) => (
        <Badge variant={getTierBadgeVariant(m.subscription_tier)}>
          {(m.subscription_tier || 'free').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      accessor: (m) => m.effective_priority,
      cell: (m) => (
        <div>
          <p className="font-medium">{m.effective_priority}</p>
          <p className="text-xs text-[var(--ss-text-muted)]">Base: {m.priority}</p>
        </div>
      ),
    },
    {
      key: 'rewards',
      header: 'Rewards',
      cell: (m) => (
        <div className="text-sm">
          <p>{m.cashback_percentage}% cashback</p>
          <p className="text-xs text-[var(--ss-text-muted)]">{m.bonus_points_multiplier}x points</p>
        </div>
      ),
    },
    {
      key: 'deals',
      header: 'Deals',
      sortable: true,
      accessor: (m) => m.deals_count,
      cell: (m) => (
        <div>
          <p className="font-medium">{m.deals_count}</p>
          <p className="text-xs text-[var(--ss-text-muted)]">max: {m.active_deals_limit}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (m) => m.status,
      cell: (m) => {
        const variant = m.status === 'active' ? 'success' : m.status === 'paused' ? 'warning' : 'danger'
        return (
          <div className="flex items-center gap-2">
            <Badge variant={variant}>{m.status}</Badge>
            {m.is_featured && <Badge variant="info">Featured</Badge>}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (m) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMerchant(m)
              setSubscriptionForm({
                tier: m.subscription_tier || 'free',
                billing_cycle: 'monthly',
              })
              setShowSubscriptionModal(true)
            }}
          >
            Subscription
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMerchant(m)
              setShowCreateDealModal(true)
            }}
          >
            + Deal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMerchant(m)
              setMerchantForm({
                merchant_id: m.merchant_id,
                display_name: m.display_name || '',
                description: m.description || '',
                category: m.category,
                cashback_percentage: m.cashback_percentage,
                bonus_points_multiplier: m.bonus_points_multiplier,
                priority: m.priority,
                is_featured: m.is_featured,
                status: m.status,
                tags: m.tags.join(', '),
              })
              setShowEditMerchantModal(true)
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ], [])

  const dealColumns: TableColumn<MerchantDeal>[] = useMemo(() => [
    {
      key: 'deal',
      header: 'Deal',
      sortable: true,
      accessor: (d) => d.title,
      cell: (d) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{d.title}</p>
          <p className="truncate text-xs text-[var(--ss-text-muted)]">{d.merchant_name}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      accessor: (d) => d.deal_type,
      cell: (d) => (
        <Badge variant="info">{d.deal_type.replace('_', ' ')}</Badge>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      cell: (d) => (
        <span className="font-medium">
          {d.deal_type === 'percentage_off' ? `${d.discount_value}%` : `$${d.discount_value}`}
        </span>
      ),
    },
    {
      key: 'redemptions',
      header: 'Redemptions',
      sortable: true,
      accessor: (d) => d.redemption_count,
      cell: (d) => (
        <div>
          <p className="font-medium">{d.redemption_count}</p>
          <p className="text-xs text-[var(--ss-text-muted)]">
            {d.redemption_limit ? `of ${d.redemption_limit}` : 'unlimited'}
          </p>
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      cell: (d) => (
        <div className="text-sm">
          <p>{formatDate(d.start_date)}</p>
          <p className="text-xs text-[var(--ss-text-muted)]">to {formatDate(d.end_date)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (d) => {
        const variant = d.is_valid ? 'success' : d.status === 'paused' ? 'warning' : 'danger'
        return (
          <div className="flex items-center gap-2">
            <Badge variant={variant}>{d.is_valid ? 'Active' : d.status}</Badge>
            {d.is_featured && <Badge variant="info">Featured</Badge>}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (d) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDeal(d)
              setDealForm({
                title: d.title,
                description: d.description || '',
                deal_type: d.deal_type,
                discount_value: d.discount_value || 0,
                min_purchase: d.min_purchase || 0,
                max_discount: d.max_discount || 0,
                promo_code: d.promo_code || '',
                redemption_limit: d.redemption_limit || 0,
                per_user_limit: d.per_user_limit,
                priority: d.priority,
                is_featured: d.is_featured,
                start_date: d.start_date?.split('T')[0] || '',
                end_date: d.end_date?.split('T')[0] || '',
              })
              setShowEditDealModal(true)
            }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ], [])

  // ============================================================================
  // Render - Subscription Tiers Overview
  // ============================================================================

  const renderTiersTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {subscriptionTiers.map((tier) => (
          <Card key={tier.name} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge variant={getTierBadgeVariant(tier.name)}>{tier.display_name}</Badge>
              <span className="text-lg font-bold text-[var(--ss-text)]">
                ${tier.monthly_fee}/mo
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--ss-text-muted)]">Placement Score</span>
                <span className="font-medium">{tier.placement_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ss-text-muted)]">Max Deals</span>
                <span className="font-medium">{tier.max_active_deals === 999 ? 'Unlimited' : tier.max_active_deals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ss-text-muted)]">Featured</span>
                <span className="font-medium">{tier.featured_placement ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ss-text-muted)]">Banner</span>
                <span className="font-medium">{tier.banner_enabled ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ss-text-muted)]">Analytics</span>
                <span className="font-medium">{tier.analytics_access ? 'Yes' : 'No'}</span>
              </div>
            </div>
            {tier.annual_savings > 0 && (
              <p className="mt-3 text-xs text-[var(--ss-success)]">
                Save ${tier.annual_savings.toFixed(0)} with annual billing
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">
            Preferred Merchants
          </h1>
          <p className="mt-1 text-sm text-[var(--ss-text-muted)]">
            Manage preferred merchants, subscription tiers, and deals
          </p>
        </div>
        <Button onClick={() => setShowCreateMerchantModal(true)}>
          <Icon name="plus" className="w-4 h-4 mr-2" />
          Add Preferred Merchant
        </Button>
      </div>

      <Tabs
        items={[
          { key: 'merchants', label: 'Preferred Merchants', content: null },
          { key: 'deals', label: 'All Deals', content: null },
          { key: 'tiers', label: 'Subscription Tiers', content: null },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'merchants' && (
        <Card className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <div className="w-full md:w-[320px]">
              <Input
                placeholder="Search merchants..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'paused', label: 'Paused' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
              <Select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Tiers' },
                  { value: 'platinum', label: 'Platinum' },
                  { value: 'gold', label: 'Gold' },
                  { value: 'silver', label: 'Silver' },
                  { value: 'bronze', label: 'Bronze' },
                  { value: 'free', label: 'Free' },
                ]}
              />
            </div>
          </div>

          <Table
            data={merchants}
            columns={merchantColumns}
            loading={loading}
            pageSize={10}
            emptyMessage="No preferred merchants found."
          />
        </Card>
      )}

      {activeTab === 'deals' && (
        <Card className="p-4">
          <Table
            data={deals}
            columns={dealColumns}
            loading={loading}
            pageSize={10}
            emptyMessage="No deals found."
          />
        </Card>
      )}

      {activeTab === 'tiers' && renderTiersTab()}

      {/* Create Merchant Modal */}
      <Modal
        open={showCreateMerchantModal}
        onClose={() => !updating && closeAllModals()}
        title="Add Preferred Merchant"
        description="Select a merchant to add to the preferred list"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeAllModals} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={createMerchant} disabled={updating}>
              {updating ? 'Creating...' : 'Add Merchant'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Merchant *"
            value={merchantForm.merchant_id}
            onChange={(e) => setMerchantForm(f => ({ ...f, merchant_id: e.target.value }))}
            options={[
              { value: '', label: 'Choose a merchant...' },
              ...allMerchants.map(m => ({ value: m.id, label: m.name })),
            ]}
          />
          <Input
            label="Display Name"
            value={merchantForm.display_name}
            onChange={(e) => setMerchantForm(f => ({ ...f, display_name: e.target.value }))}
            placeholder="Optional custom display name"
          />
          <Input
            label="Description"
            value={merchantForm.description}
            onChange={(e) => setMerchantForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description"
          />
          <Select
            label="Category"
            value={merchantForm.category}
            onChange={(e) => setMerchantForm(f => ({ ...f, category: e.target.value }))}
            options={[
              { value: 'retail', label: 'Retail' },
              { value: 'restaurant', label: 'Restaurant' },
              { value: 'grocery', label: 'Grocery' },
              { value: 'gas', label: 'Gas Station' },
              { value: 'entertainment', label: 'Entertainment' },
              { value: 'travel', label: 'Travel' },
              { value: 'services', label: 'Services' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cashback %"
              type="number"
              min={0}
              max={100}
              value={merchantForm.cashback_percentage}
              onChange={(e) => setMerchantForm(f => ({ ...f, cashback_percentage: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Points Multiplier"
              type="number"
              min={1}
              step={0.5}
              value={merchantForm.bonus_points_multiplier}
              onChange={(e) => setMerchantForm(f => ({ ...f, bonus_points_multiplier: parseFloat(e.target.value) || 1 }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Priority"
              type="number"
              min={0}
              value={merchantForm.priority}
              onChange={(e) => setMerchantForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))}
            />
            <Select
              label="Status"
              value={merchantForm.status}
              onChange={(e) => setMerchantForm(f => ({ ...f, status: e.target.value }))}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={merchantForm.is_featured}
              onChange={(e) => setMerchantForm(f => ({ ...f, is_featured: e.target.checked }))}
              className="rounded border-[var(--ss-border)]"
            />
            <span className="text-sm text-[var(--ss-text)]">Featured merchant</span>
          </label>
          <Input
            label="Tags (comma-separated)"
            value={merchantForm.tags}
            onChange={(e) => setMerchantForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="new, popular, exclusive"
          />
        </div>
      </Modal>

      {/* Edit Merchant Modal */}
      <Modal
        open={showEditMerchantModal}
        onClose={() => !updating && closeAllModals()}
        title="Edit Preferred Merchant"
        description={selectedMerchant?.merchant_name || ''}
        footer={
          <div className="flex justify-between">
            <Button
              variant="danger"
              onClick={() => {
                setShowEditMerchantModal(false)
                setShowDeleteConfirm(true)
              }}
              disabled={updating}
            >
              Remove
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeAllModals} disabled={updating}>
                Cancel
              </Button>
              <Button onClick={updateMerchant} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={merchantForm.display_name}
            onChange={(e) => setMerchantForm(f => ({ ...f, display_name: e.target.value }))}
          />
          <Input
            label="Description"
            value={merchantForm.description}
            onChange={(e) => setMerchantForm(f => ({ ...f, description: e.target.value }))}
          />
          <Select
            label="Category"
            value={merchantForm.category}
            onChange={(e) => setMerchantForm(f => ({ ...f, category: e.target.value }))}
            options={[
              { value: 'retail', label: 'Retail' },
              { value: 'restaurant', label: 'Restaurant' },
              { value: 'grocery', label: 'Grocery' },
              { value: 'gas', label: 'Gas Station' },
              { value: 'entertainment', label: 'Entertainment' },
              { value: 'travel', label: 'Travel' },
              { value: 'services', label: 'Services' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cashback %"
              type="number"
              min={0}
              max={100}
              value={merchantForm.cashback_percentage}
              onChange={(e) => setMerchantForm(f => ({ ...f, cashback_percentage: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Points Multiplier"
              type="number"
              min={1}
              step={0.5}
              value={merchantForm.bonus_points_multiplier}
              onChange={(e) => setMerchantForm(f => ({ ...f, bonus_points_multiplier: parseFloat(e.target.value) || 1 }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Priority"
              type="number"
              min={0}
              value={merchantForm.priority}
              onChange={(e) => setMerchantForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))}
            />
            <Select
              label="Status"
              value={merchantForm.status}
              onChange={(e) => setMerchantForm(f => ({ ...f, status: e.target.value }))}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'paused', label: 'Paused' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={merchantForm.is_featured}
              onChange={(e) => setMerchantForm(f => ({ ...f, is_featured: e.target.checked }))}
              className="rounded border-[var(--ss-border)]"
            />
            <span className="text-sm text-[var(--ss-text)]">Featured merchant</span>
          </label>
          <Input
            label="Tags (comma-separated)"
            value={merchantForm.tags}
            onChange={(e) => setMerchantForm(f => ({ ...f, tags: e.target.value }))}
          />
        </div>
      </Modal>

      {/* Subscription Modal */}
      <Modal
        open={showSubscriptionModal}
        onClose={() => !updating && closeAllModals()}
        title="Manage Subscription"
        description={`${selectedMerchant?.merchant_name || ''} - Current: ${selectedMerchant?.subscription_tier?.toUpperCase() || 'FREE'}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeAllModals} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={updateSubscription} disabled={updating}>
              {updating ? 'Saving...' : 'Update Subscription'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Subscription Tier"
            value={subscriptionForm.tier}
            onChange={(e) => setSubscriptionForm(f => ({ ...f, tier: e.target.value }))}
            options={subscriptionTiers.map(t => ({
              value: t.name,
              label: `${t.display_name} - $${t.monthly_fee}/mo`,
            }))}
          />
          <Select
            label="Billing Cycle"
            value={subscriptionForm.billing_cycle}
            onChange={(e) => setSubscriptionForm(f => ({ ...f, billing_cycle: e.target.value }))}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'annual', label: 'Annual (Save up to 17%)' },
            ]}
          />
          {subscriptionTiers.find(t => t.name === subscriptionForm.tier) && (
            <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4">
              <h4 className="font-semibold text-[var(--ss-text)] mb-2">Tier Benefits</h4>
              <div className="space-y-1 text-sm text-[var(--ss-text-muted)]">
                <p>Placement Score: {subscriptionTiers.find(t => t.name === subscriptionForm.tier)?.placement_score}</p>
                <p>Max Active Deals: {subscriptionTiers.find(t => t.name === subscriptionForm.tier)?.max_active_deals === 999 ? 'Unlimited' : subscriptionTiers.find(t => t.name === subscriptionForm.tier)?.max_active_deals}</p>
                <p>Featured Placement: {subscriptionTiers.find(t => t.name === subscriptionForm.tier)?.featured_placement ? 'Yes' : 'No'}</p>
                <p>Banner Enabled: {subscriptionTiers.find(t => t.name === subscriptionForm.tier)?.banner_enabled ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Create Deal Modal */}
      <Modal
        open={showCreateDealModal}
        onClose={() => !updating && closeAllModals()}
        title="Create Deal"
        description={`For ${selectedMerchant?.merchant_name || ''}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeAllModals} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={createDeal} disabled={updating}>
              {updating ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title *"
            value={dealForm.title}
            onChange={(e) => setDealForm(f => ({ ...f, title: e.target.value }))}
            placeholder="20% Off Your Purchase"
          />
          <Input
            label="Description"
            value={dealForm.description}
            onChange={(e) => setDealForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Get 20% off on all items"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Deal Type"
              value={dealForm.deal_type}
              onChange={(e) => setDealForm(f => ({ ...f, deal_type: e.target.value }))}
              options={[
                { value: 'percentage_off', label: 'Percentage Off' },
                { value: 'fixed_amount', label: 'Fixed Amount' },
                { value: 'bogo', label: 'Buy One Get One' },
                { value: 'cashback_boost', label: 'Cashback Boost' },
                { value: 'points_multiplier', label: 'Points Multiplier' },
                { value: 'free_item', label: 'Free Item' },
              ]}
            />
            <Input
              label="Discount Value"
              type="number"
              min={0}
              value={dealForm.discount_value}
              onChange={(e) => setDealForm(f => ({ ...f, discount_value: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Purchase ($)"
              type="number"
              min={0}
              value={dealForm.min_purchase}
              onChange={(e) => setDealForm(f => ({ ...f, min_purchase: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Max Discount ($)"
              type="number"
              min={0}
              value={dealForm.max_discount}
              onChange={(e) => setDealForm(f => ({ ...f, max_discount: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <Input
            label="Promo Code"
            value={dealForm.promo_code}
            onChange={(e) => setDealForm(f => ({ ...f, promo_code: e.target.value }))}
            placeholder="SAVE20"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Redemption Limit"
              type="number"
              min={0}
              value={dealForm.redemption_limit}
              onChange={(e) => setDealForm(f => ({ ...f, redemption_limit: parseInt(e.target.value) || 0 }))}
              placeholder="0 = unlimited"
            />
            <Input
              label="Per User Limit"
              type="number"
              min={1}
              value={dealForm.per_user_limit}
              onChange={(e) => setDealForm(f => ({ ...f, per_user_limit: parseInt(e.target.value) || 1 }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              value={dealForm.start_date}
              onChange={(e) => setDealForm(f => ({ ...f, start_date: e.target.value }))}
            />
            <Input
              label="End Date *"
              type="date"
              value={dealForm.end_date}
              onChange={(e) => setDealForm(f => ({ ...f, end_date: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dealForm.is_featured}
              onChange={(e) => setDealForm(f => ({ ...f, is_featured: e.target.checked }))}
              className="rounded border-[var(--ss-border)]"
            />
            <span className="text-sm text-[var(--ss-text)]">Featured deal</span>
          </label>
        </div>
      </Modal>

      {/* Edit Deal Modal */}
      <Modal
        open={showEditDealModal}
        onClose={() => !updating && closeAllModals()}
        title="Edit Deal"
        description={selectedDeal?.title || ''}
        footer={
          <div className="flex justify-between">
            <Button
              variant="danger"
              onClick={deleteDeal}
              disabled={updating}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeAllModals} disabled={updating}>
                Cancel
              </Button>
              <Button onClick={updateDeal} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={dealForm.title}
            onChange={(e) => setDealForm(f => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Description"
            value={dealForm.description}
            onChange={(e) => setDealForm(f => ({ ...f, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Deal Type"
              value={dealForm.deal_type}
              onChange={(e) => setDealForm(f => ({ ...f, deal_type: e.target.value }))}
              options={[
                { value: 'percentage_off', label: 'Percentage Off' },
                { value: 'fixed_amount', label: 'Fixed Amount' },
                { value: 'bogo', label: 'Buy One Get One' },
                { value: 'cashback_boost', label: 'Cashback Boost' },
                { value: 'points_multiplier', label: 'Points Multiplier' },
                { value: 'free_item', label: 'Free Item' },
              ]}
            />
            <Input
              label="Discount Value"
              type="number"
              min={0}
              value={dealForm.discount_value}
              onChange={(e) => setDealForm(f => ({ ...f, discount_value: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={dealForm.start_date}
              onChange={(e) => setDealForm(f => ({ ...f, start_date: e.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={dealForm.end_date}
              onChange={(e) => setDealForm(f => ({ ...f, end_date: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dealForm.is_featured}
              onChange={(e) => setDealForm(f => ({ ...f, is_featured: e.target.checked }))}
              className="rounded border-[var(--ss-border)]"
            />
            <span className="text-sm text-[var(--ss-text)]">Featured deal</span>
          </label>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => !updating && setShowDeleteConfirm(false)}
        title="Remove Preferred Merchant"
        description={`Are you sure you want to remove ${selectedMerchant?.merchant_name} from the preferred list?`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={updating}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteMerchant} disabled={updating}>
              {updating ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[var(--ss-text-muted)]">
          This will remove the merchant from the preferred list and delete all associated deals.
        </p>
      </Modal>
    </div>
  )
}
