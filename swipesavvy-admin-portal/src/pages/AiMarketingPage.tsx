/**
 * AI Marketing Page - Enhanced Version
 * Features: Campaigns, Analytics Dashboard, A/B Testing, Audience Builder
 */

import ABTestingPanel from '@/components/marketing/ABTestingPanel'
import AudienceBuilder from '@/components/marketing/AudienceBuilder'
import MarketingAnalytics from '@/components/marketing/MarketingAnalytics'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Form from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Table, { type TableColumn } from '@/components/ui/Table'
import Tabs from '@/components/ui/Tabs'
import { Api } from '@/services/api'
import { useEventSubscription } from '@/store/eventBusStore'
import { useToastStore } from '@/store/toastStore'
import type { AiCampaign } from '@/types/aiMarketing'
import { formatDateTime } from '@/utils/dates'
import {
  BarChart3,
  CheckCircle,
  Edit,
  FlaskConical,
  Lightbulb,
  Loader,
  Megaphone,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface CampaignCopy {
  headline?: string
  description?: string
  cta?: string
  selling_points?: string[]
}

interface AudienceInsights {
  characteristics?: string
  opportunities?: string[]
  offer_recommendation?: string
  channels?: string[]
  challenges?: string[]
}

// ============================================================================
// CAMPAIGNS TAB COMPONENT
// ============================================================================

function CampaignsTab() {
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<AiCampaign[]>([])
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [showAiInsights, setShowAiInsights] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<AiCampaign | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [campaignCopy, setCampaignCopy] = useState<CampaignCopy | null>(null)
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsights | null>(null)

  const [name, setName] = useState('')
  const [objective, setObjective] = useState('activation')
  const [channel, setChannel] = useState('email')
  const [offerType, setOfferType] = useState('discount')
  const [offerValue, setOfferValue] = useState('10')
  const [offerUnit, setOfferUnit] = useState('percentage')
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState('')
  const [editStatus, setEditStatus] = useState('')

  const fetchCampaigns = async (shouldShowLoading = true) => {
    if (shouldShowLoading) setLoading(true)
    try {
      const res = await Api.aiCampaignsApi.listCampaigns(1, 100)
      setCampaigns(
        (res.campaigns || res || []).map((c: any) => ({
          id: c.id || c.campaign_id,
          name: c.name || c.campaign_name,
          description: c.description || '',
          objective: c.campaign_type?.includes('promotional') ? 'activation' : 'retention',
          status: c.status,
          type: c.campaign_type || c.type,
          targetAudience: c.target_pattern || '',
          audienceSize: 0,
          reach: 0,
          channel: 'email',
          startDate: c.created_at || c.startDate,
          endDate: '',
          budget: 0,
          spent: 0,
          engagement: 0,
          conversions: 0,
          roi: 0,
          createdBy: 'admin',
          lastUpdatedAt: c.updated_at,
          lastUpdated: c.updated_at,
          createdAt: c.created_at,
        }))
      )
    } catch (err: any) {
      console.error('Failed to fetch campaigns:', err)
      setCampaigns([])
    } finally {
      if (shouldShowLoading) setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (mounted) await fetchCampaigns(true)
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Subscribe to campaign events for cross-module updates
  useEventSubscription(
    ['campaign:created', 'campaign:updated', 'campaign:published', 'campaign:deleted'],
    () => {
      fetchCampaigns(false)
    }
  )

  const publishCampaign = async (campaignId: string) => {
    try {
      setPublishingId(campaignId)
      const result = await Api.aiCampaignsApi.publishCampaign(campaignId)

      if (result?.status === 'success') {
        pushToast({
          variant: 'success',
          title: 'Campaign published',
          message: 'Your campaign has been successfully published',
        })
        await fetchCampaigns(false)
      }
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Failed to publish campaign',
        message: error?.message || 'An error occurred while publishing the campaign',
      })
    } finally {
      setPublishingId(null)
    }
  }

  const openEditModal = (campaign: AiCampaign) => {
    setSelectedCampaign(campaign)
    setEditName(campaign.name)
    setEditDescription(campaign.targetAudience || '')
    setEditType(campaign.type || 'awareness')
    setEditStatus(campaign.status || 'draft')
    setEditOpen(true)
  }

  const updateCampaign = async () => {
    if (!selectedCampaign) return

    try {
      setLoading(true)
      await Api.aiCampaignsApi.updateCampaign(selectedCampaign.id, {
        name: editName,
        description: editDescription,
        campaign_type: editType,
        status: editStatus,
      })

      pushToast({
        variant: 'success',
        title: 'Campaign updated',
        message: 'Your campaign has been updated successfully',
      })

      await fetchCampaigns(false)
      setEditOpen(false)
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Failed to update campaign',
        message: error?.message || 'An error occurred while updating the campaign',
      })
    } finally {
      setLoading(false)
    }
  }

  const columns: TableColumn<AiCampaign>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Campaign',
        sortable: true,
        accessor: (c) => c.name,
        cell: (c) => (
          <div className="min-w-0">
            <p className="truncate font-semibold">{c.name}</p>
            <p className="truncate text-xs text-[var(--color-text-secondary)]">
              Objective: {c.objective} · Channel: {c.channel}
            </p>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        accessor: (c) => c.status,
        cell: (c) => {
          let variant: any = 'neutral'
          const status = c.status as string
          if (status === 'active' || status === 'running') {
            variant = 'success'
          } else if (status === 'draft') {
            variant = 'neutral'
          } else if (status === 'paused') {
            variant = 'warning'
          } else if (status === 'completed' || status === 'archived') {
            variant = 'danger'
          }
          return <Badge variant={variant}>{c.status}</Badge>
        },
      },
      {
        key: 'audienceSize',
        header: 'Audience',
        sortable: true,
        align: 'right',
        accessor: (c) => c.audienceSize,
        cell: (c) => (
          <span className="text-[var(--color-text-secondary)]">
            {(c.audienceSize ?? 0).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'lastUpdatedAt',
        header: 'Updated',
        sortable: true,
        accessor: (c) => c.lastUpdatedAt,
        cell: (c) => (
          <span className="text-[var(--color-text-secondary)]">
            {formatDateTime(c.lastUpdatedAt ?? '')}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'AI Insights',
        align: 'center',
        accessor: (c) => c.id,
        cell: (c) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openAIInsights(c)}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Enhance
          </Button>
        ),
      },
      {
        key: 'publish',
        header: 'Publish',
        align: 'center',
        accessor: (c) => c.id,
        cell: (c) => {
          if (c.status === 'draft') {
            return (
              <Button
                size="sm"
                variant="primary"
                onClick={() => publishCampaign(c.id)}
                disabled={publishingId === c.id}
                className="flex items-center gap-2"
              >
                {publishingId === c.id ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>
            )
          } else {
            let variant: any = 'neutral'
            const status = c.status as string
            if (status === 'active' || status === 'running') {
              variant = 'success'
            } else if (status === 'paused') {
              variant = 'warning'
            } else if (status === 'completed' || status === 'archived') {
              variant = 'danger'
            }
            return <Badge variant={variant}>{c.status}</Badge>
          }
        },
      },
      {
        key: 'edit',
        header: 'Edit',
        align: 'center',
        accessor: (c) => c.id,
        cell: (c) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(c)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        ),
      },
    ],
    [publishingId]
  )

  const generateAICopy = async () => {
    if (!selectedCampaign) return

    setAiLoading(true)
    try {
      const patterns = objective === 'activation' ? ['high_spender', 'new_shopper'] : ['frequent_shopper']

      const response = await Api.aiCampaignsApi.generateCopy({
        campaign_name: selectedCampaign.name || 'Campaign',
        target_patterns: patterns,
        campaign_type: selectedCampaign.type || 'promotional',
        audience_size: selectedCampaign.audienceSize || 1000,
        offer_value: offerValue,
      })

      if (response?.campaign_copy) {
        setCampaignCopy(response.campaign_copy)
        pushToast({ variant: 'success', title: 'Success', message: 'AI copy generated successfully' })
      } else {
        pushToast({ variant: 'error', title: 'Error', message: 'No copy generated' })
      }
    } catch (error: any) {
      pushToast({ variant: 'error', title: 'Error', message: error?.message || 'Failed to generate AI copy' })
    } finally {
      setAiLoading(false)
    }
  }

  const getAudienceInsights = async () => {
    if (!selectedCampaign) return

    setAiLoading(true)
    try {
      const patterns = objective === 'activation' ? ['high_spender', 'new_shopper'] : ['frequent_shopper']

      const response = await Api.aiCampaignsApi.getAudienceInsights({
        target_patterns: patterns,
        lookback_days: 90,
      })

      if (response?.insights) {
        setAudienceInsights(response.insights)
        pushToast({ variant: 'success', title: 'Success', message: 'Audience insights generated' })
      } else {
        pushToast({ variant: 'error', title: 'Error', message: 'No insights generated' })
      }
    } catch (error: any) {
      pushToast({ variant: 'error', title: 'Error', message: error?.message || 'Failed to get insights' })
    } finally {
      setAiLoading(false)
    }
  }

  const openAIInsights = async (campaign: AiCampaign) => {
    setSelectedCampaign(campaign)
    setShowAiInsights(true)
    setCampaignCopy(null)
    setAudienceInsights(null)
  }

  const onCreate = async () => {
    if (!name.trim()) {
      pushToast({ variant: 'error', title: 'Error', message: 'Campaign name is required' })
      return
    }

    try {
      setLoading(true)
      await Api.aiCampaignsApi.createCampaign({
        name: name.trim(),
        type: objective === 'activation' ? 'promotional' : 'retention',
        objective,
        channel,
        description: '',
        status: 'draft',
        offer_type: offerType,
        offer_value: parseFloat(offerValue) || 0,
        offer_unit: offerUnit,
      })

      pushToast({
        variant: 'success',
        title: 'Campaign created',
        message: `"${name}" has been created successfully.`,
      })

      await fetchCampaigns(false)

      setOpen(false)
      setName('')
      setOfferType('discount')
      setOfferValue('10')
      setOfferUnit('percentage')
    } catch (error: any) {
      pushToast({
        variant: 'error',
        title: 'Failed to create campaign',
        message: error?.message || 'An error occurred while creating the campaign',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Create and manage AI-assisted customer campaigns.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>New campaign</Button>
      </div>

      <Card className="p-4">
        <Table data={campaigns} columns={columns} loading={loading} pageSize={10} emptyMessage="No campaigns yet." />
      </Card>

      {/* Create Campaign Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New AI Campaign"
        description="Create a new marketing campaign. Configure your target audience, channel, and offer details."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        }
      >
        <Form
          spacing="md"
          onSubmit={(e) => {
            e.preventDefault()
            onCreate()
          }}
        >
          <Input
            label="Campaign name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Winback December"
          />
          <Select
            label="Objective"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            options={[
              { value: 'activation', label: 'Activation' },
              { value: 'retention', label: 'Retention' },
              { value: 'upsell', label: 'Upsell' },
              { value: 'winback', label: 'Winback' },
            ]}
          />
          <Select
            label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'push', label: 'Push' },
            ]}
          />
          <Select
            label="Offer Type"
            value={offerType}
            onChange={(e) => setOfferType(e.target.value)}
            options={[
              { value: 'discount', label: 'Discount' },
              { value: 'free_shipping', label: 'Free Shipping' },
              { value: 'bonus_points', label: 'Bonus Points' },
              { value: 'bogo', label: 'Buy One Get One' },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Offer Value"
              type="number"
              value={offerValue}
              onChange={(e) => setOfferValue(e.target.value)}
              placeholder="10"
            />
            <Select
              label="Unit"
              value={offerUnit}
              onChange={(e) => setOfferUnit(e.target.value)}
              options={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'amount', label: 'Amount ($)' },
              ]}
            />
          </div>
        </Form>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={selectedCampaign ? `Edit: ${selectedCampaign.name}` : 'Edit Campaign'}
        description="Update campaign details"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={updateCampaign} disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Campaign name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Campaign name"
          />
          <Input
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Campaign description"
          />
          <Select
            label="Type"
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            options={[
              { value: 'promotional', label: 'Promotional' },
              { value: 'retention', label: 'Retention' },
              { value: 'winback', label: 'Winback' },
            ]}
          />
          <Select
            label="Status"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'completed', label: 'Completed' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </Modal>

      {/* AI Insights Modal */}
      <Modal
        open={showAiInsights}
        onClose={() => setShowAiInsights(false)}
        title={selectedCampaign ? `AI Insights: ${selectedCampaign.name}` : 'AI Insights'}
        description="Generate AI-powered campaign copy, audience insights, and optimization recommendations"
      >
        <div className="space-y-6">
          {/* Campaign Copy Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-[var(--color-text-primary)]">
                <Sparkles className="h-5 w-5 text-[var(--color-status-info-text)]" />
                AI-Generated Copy
              </h3>
              <Button
                size="sm"
                onClick={generateAICopy}
                disabled={aiLoading}
                variant={campaignCopy ? 'outline' : 'primary'}
              >
                {aiLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {campaignCopy ? 'Regenerate' : 'Generate'}
              </Button>
            </div>
            {campaignCopy && (
              <Card className="space-y-3 bg-[var(--color-status-info-bg)] p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Headline</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                    {campaignCopy.headline}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Description</p>
                  <p className="mt-1 text-sm text-[var(--color-text-primary)]">{campaignCopy.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Call to Action</p>
                  <Badge variant="success" className="mt-1">
                    {campaignCopy.cta}
                  </Badge>
                </div>
                {campaignCopy.selling_points && campaignCopy.selling_points.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">Key Selling Points</p>
                    <ul className="mt-2 space-y-1">
                      {campaignCopy.selling_points.map((point, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                          <CheckCircle className="h-4 w-4 text-[var(--color-status-success-text)]" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Audience Insights Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-[var(--color-text-primary)]">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Audience Insights
              </h3>
              <Button
                size="sm"
                onClick={getAudienceInsights}
                disabled={aiLoading}
                variant={audienceInsights ? 'outline' : 'primary'}
              >
                {aiLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                {audienceInsights ? 'Refresh' : 'Analyze'}
              </Button>
            </div>
            {audienceInsights && (
              <Card className="space-y-3 bg-[var(--color-status-warning-bg)] p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Characteristics</p>
                  <p className="mt-1 text-sm text-[var(--color-text-primary)]">{audienceInsights.characteristics}</p>
                </div>
                {audienceInsights.opportunities && audienceInsights.opportunities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">Engagement Opportunities</p>
                    <ul className="mt-2 space-y-1">
                      {audienceInsights.opportunities.map((opp, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Recommended Offer</p>
                  <Badge variant="warning" className="mt-1">
                    {audienceInsights.offer_recommendation}
                  </Badge>
                </div>
                {audienceInsights.channels && (
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">Best Channels</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {audienceInsights.channels.map((ch, idx) => (
                        <Badge key={idx} variant="success">
                          {ch}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AiMarketingPage() {
  const tabItems = [
    {
      key: 'campaigns',
      label: 'Campaigns',
      icon: <Megaphone className="h-4 w-4" />,
      content: <CampaignsTab />,
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      content: <MarketingAnalytics />,
    },
    {
      key: 'ab-testing',
      label: 'A/B Testing',
      icon: <FlaskConical className="h-4 w-4" />,
      content: <ABTestingPanel />,
    },
    {
      key: 'audience',
      label: 'Audience Builder',
      icon: <Users className="h-4 w-4" />,
      content: <AudienceBuilder />,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-xl font-semibold text-[var(--color-text-primary)]">AI Marketing</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          AI-powered campaigns, analytics, A/B testing, and audience segmentation.
        </p>
      </div>

      <Tabs items={tabItems} />
    </div>
  )
}
