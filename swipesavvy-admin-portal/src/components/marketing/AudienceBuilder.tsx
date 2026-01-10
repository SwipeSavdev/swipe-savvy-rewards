/**
 * Audience Builder Component
 * Visual segmentation and targeting rule builder
 */

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronRight,
  Copy,
  DollarSign,
  Filter,
  Layers,
  Mail,
  MapPin,
  Plus,
  Save,
  ShoppingBag,
  Smartphone,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { useState } from 'react'

// Rule types and operators
type RuleCategory = 'demographics' | 'behavior' | 'transaction' | 'engagement'

interface RuleField {
  key: string
  label: string
  category: RuleCategory
  icon: React.ReactNode
  operators: string[]
  valueType: 'text' | 'number' | 'select' | 'date' | 'multiselect'
  options?: { value: string; label: string }[]
}

interface Rule {
  id: string
  field: string
  operator: string
  value: string | number | string[]
}

interface RuleGroup {
  id: string
  logic: 'AND' | 'OR'
  rules: Rule[]
}

interface SavedSegment {
  id: string
  name: string
  description: string
  ruleGroups: RuleGroup[]
  audienceSize: number
  createdAt: string
  lastUsed?: string
}

// Available fields for rules
const RULE_FIELDS: RuleField[] = [
  // Demographics
  { key: 'age', label: 'Age', category: 'demographics', icon: <User className="h-4 w-4" />, operators: ['equals', 'greater_than', 'less_than', 'between'], valueType: 'number' },
  { key: 'gender', label: 'Gender', category: 'demographics', icon: <User className="h-4 w-4" />, operators: ['equals', 'not_equals'], valueType: 'select', options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }] },
  { key: 'location', label: 'Location', category: 'demographics', icon: <MapPin className="h-4 w-4" />, operators: ['equals', 'contains', 'not_contains'], valueType: 'text' },
  { key: 'city', label: 'City', category: 'demographics', icon: <MapPin className="h-4 w-4" />, operators: ['equals', 'in'], valueType: 'text' },

  // Behavior
  { key: 'purchase_frequency', label: 'Purchase Frequency', category: 'behavior', icon: <ShoppingBag className="h-4 w-4" />, operators: ['equals', 'greater_than', 'less_than'], valueType: 'select', options: [{ value: 'never', label: 'Never' }, { value: 'once', label: 'Once' }, { value: 'occasional', label: 'Occasional (2-5)' }, { value: 'frequent', label: 'Frequent (6+)' }] },
  { key: 'last_active', label: 'Last Active', category: 'behavior', icon: <Activity className="h-4 w-4" />, operators: ['within_days', 'more_than_days'], valueType: 'number' },
  { key: 'app_usage', label: 'App Sessions', category: 'behavior', icon: <Smartphone className="h-4 w-4" />, operators: ['greater_than', 'less_than', 'between'], valueType: 'number' },
  { key: 'signup_date', label: 'Signup Date', category: 'behavior', icon: <Calendar className="h-4 w-4" />, operators: ['before', 'after', 'between'], valueType: 'date' },

  // Transaction
  { key: 'avg_spend', label: 'Average Spend', category: 'transaction', icon: <DollarSign className="h-4 w-4" />, operators: ['greater_than', 'less_than', 'between'], valueType: 'number' },
  { key: 'total_spent', label: 'Total Lifetime Spend', category: 'transaction', icon: <DollarSign className="h-4 w-4" />, operators: ['greater_than', 'less_than', 'between'], valueType: 'number' },
  { key: 'last_purchase', label: 'Days Since Purchase', category: 'transaction', icon: <ShoppingBag className="h-4 w-4" />, operators: ['within_days', 'more_than_days'], valueType: 'number' },
  { key: 'purchase_category', label: 'Purchase Category', category: 'transaction', icon: <Layers className="h-4 w-4" />, operators: ['includes', 'excludes'], valueType: 'multiselect', options: [{ value: 'electronics', label: 'Electronics' }, { value: 'fashion', label: 'Fashion' }, { value: 'food', label: 'Food & Dining' }, { value: 'travel', label: 'Travel' }, { value: 'entertainment', label: 'Entertainment' }] },

  // Engagement
  { key: 'email_opens', label: 'Email Open Rate', category: 'engagement', icon: <Mail className="h-4 w-4" />, operators: ['greater_than', 'less_than'], valueType: 'number' },
  { key: 'push_interactions', label: 'Push Interactions', category: 'engagement', icon: <Smartphone className="h-4 w-4" />, operators: ['greater_than', 'less_than', 'equals'], valueType: 'number' },
  { key: 'campaign_response', label: 'Campaign Responses', category: 'engagement', icon: <Activity className="h-4 w-4" />, operators: ['greater_than', 'less_than'], valueType: 'number' },
]

const OPERATOR_LABELS: Record<string, string> = {
  equals: 'equals',
  not_equals: 'does not equal',
  greater_than: 'is greater than',
  less_than: 'is less than',
  between: 'is between',
  contains: 'contains',
  not_contains: 'does not contain',
  in: 'is one of',
  within_days: 'within last (days)',
  more_than_days: 'more than (days) ago',
  before: 'is before',
  after: 'is after',
  includes: 'includes',
  excludes: 'excludes',
}

const CATEGORY_LABELS: Record<RuleCategory, { label: string; icon: React.ReactNode }> = {
  demographics: { label: 'Demographics', icon: <User className="h-4 w-4" /> },
  behavior: { label: 'Behavior', icon: <Activity className="h-4 w-4" /> },
  transaction: { label: 'Transaction', icon: <DollarSign className="h-4 w-4" /> },
  engagement: { label: 'Engagement', icon: <Mail className="h-4 w-4" /> },
}

// Mock saved segments
const MOCK_SAVED_SEGMENTS: SavedSegment[] = [
  {
    id: 'seg-1',
    name: 'High-Value Customers',
    description: 'Customers who spent over $500 in the last 90 days',
    ruleGroups: [
      {
        id: 'g1',
        logic: 'AND',
        rules: [
          { id: 'r1', field: 'total_spent', operator: 'greater_than', value: 500 },
          { id: 'r2', field: 'last_purchase', operator: 'within_days', value: 90 },
        ],
      },
    ],
    audienceSize: 12450,
    createdAt: '2025-01-01',
    lastUsed: '2025-01-07',
  },
  {
    id: 'seg-2',
    name: 'Dormant Users',
    description: 'Users inactive for 30+ days',
    ruleGroups: [
      {
        id: 'g1',
        logic: 'AND',
        rules: [
          { id: 'r1', field: 'last_active', operator: 'more_than_days', value: 30 },
          { id: 'r2', field: 'purchase_frequency', operator: 'not_equals', value: 'never' },
        ],
      },
    ],
    audienceSize: 8320,
    createdAt: '2025-01-03',
  },
  {
    id: 'seg-3',
    name: 'Email Engaged',
    description: 'Users with high email engagement',
    ruleGroups: [
      {
        id: 'g1',
        logic: 'AND',
        rules: [
          { id: 'r1', field: 'email_opens', operator: 'greater_than', value: 50 },
        ],
      },
    ],
    audienceSize: 24890,
    createdAt: '2025-01-05',
  },
]

export default function AudienceBuilder() {
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>(MOCK_SAVED_SEGMENTS)
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([
    { id: 'initial', logic: 'AND', rules: [] },
  ])
  const [expandedCategories, setExpandedCategories] = useState<RuleCategory[]>(['demographics', 'behavior'])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [segmentName, setSegmentName] = useState('')
  const [segmentDescription, setSegmentDescription] = useState('')
  const [estimatedAudience, setEstimatedAudience] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const toggleCategory = (category: RuleCategory) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const addRule = (groupId: string, field: RuleField) => {
    setRuleGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: [
                ...group.rules,
                {
                  id: `rule-${Date.now()}`,
                  field: field.key,
                  operator: field.operators[0],
                  value: field.valueType === 'number' ? 0 : '',
                },
              ],
            }
          : group
      )
    )
  }

  const updateRule = (groupId: string, ruleId: string, updates: Partial<Rule>) => {
    setRuleGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.map((rule) =>
                rule.id === ruleId ? { ...rule, ...updates } : rule
              ),
            }
          : group
      )
    )
  }

  const removeRule = (groupId: string, ruleId: string) => {
    setRuleGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, rules: group.rules.filter((r) => r.id !== ruleId) }
          : group
      )
    )
  }

  const addRuleGroup = () => {
    setRuleGroups((prev) => [
      ...prev,
      { id: `group-${Date.now()}`, logic: 'OR', rules: [] },
    ])
  }

  const removeRuleGroup = (groupId: string) => {
    if (ruleGroups.length > 1) {
      setRuleGroups((prev) => prev.filter((g) => g.id !== groupId))
    }
  }

  const toggleGroupLogic = (groupId: string) => {
    setRuleGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, logic: group.logic === 'AND' ? 'OR' : 'AND' }
          : group
      )
    )
  }

  const calculateAudience = async () => {
    setIsCalculating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const totalRules = ruleGroups.reduce((sum, g) => sum + g.rules.length, 0)
    const baseAudience = 50000
    const reduction = totalRules * 0.15
    setEstimatedAudience(Math.floor(baseAudience * (1 - Math.min(reduction, 0.9))))
    setIsCalculating(false)
  }

  const saveSegment = () => {
    if (!segmentName.trim()) return

    const newSegment: SavedSegment = {
      id: `seg-${Date.now()}`,
      name: segmentName,
      description: segmentDescription,
      ruleGroups,
      audienceSize: estimatedAudience || 0,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setSavedSegments([newSegment, ...savedSegments])
    setShowSaveModal(false)
    setSegmentName('')
    setSegmentDescription('')
  }

  const loadSegment = (segment: SavedSegment) => {
    setRuleGroups(segment.ruleGroups)
    setEstimatedAudience(segment.audienceSize)
  }

  const deleteSegment = (segmentId: string) => {
    setSavedSegments((prev) => prev.filter((s) => s.id !== segmentId))
  }

  const getFieldByKey = (key: string) => RULE_FIELDS.find((f) => f.key === key)

  const totalRules = ruleGroups.reduce((sum, g) => sum + g.rules.length, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rule Builder - Left Side */}
        <div className="lg:col-span-2 space-y-4">
          {/* Field Selector */}
          <Card className="p-4">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              <Filter className="mr-2 inline h-5 w-5" />
              Add Targeting Rules
            </h3>
            <div className="space-y-2">
              {(Object.keys(CATEGORY_LABELS) as RuleCategory[]).map((category) => (
                <div key={category} className="rounded-lg border border-[var(--color-border-tertiary)]">
                  <button
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-[var(--color-bg-secondary)]"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-2">
                      {CATEGORY_LABELS[category].icon}
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {CATEGORY_LABELS[category].label}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {RULE_FIELDS.filter((f) => f.category === category).length}
                      </Badge>
                    </div>
                    {expandedCategories.includes(category) ? (
                      <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    )}
                  </button>
                  {expandedCategories.includes(category) && (
                    <div className="border-t border-[var(--color-border-tertiary)] p-3">
                      <div className="flex flex-wrap gap-2">
                        {RULE_FIELDS.filter((f) => f.category === category).map((field) => (
                          <Button
                            key={field.key}
                            size="sm"
                            variant="outline"
                            onClick={() => addRule(ruleGroups[0].id, field)}
                          >
                            {field.icon}
                            <span className="ml-1">{field.label}</span>
                            <Plus className="ml-1 h-3 w-3" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Active Rules */}
          {ruleGroups.map((group, groupIndex) => (
            <Card key={group.id} className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-[var(--color-text-primary)]">
                    {groupIndex === 0 ? 'Targeting Rules' : `Additional Group ${groupIndex + 1}`}
                  </h4>
                  {group.rules.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleGroupLogic(group.id)}
                      className="text-xs"
                    >
                      Match{' '}
                      <Badge variant={group.logic === 'AND' ? 'info' : 'warning'} size="sm" className="ml-1">
                        {group.logic}
                      </Badge>
                    </Button>
                  )}
                </div>
                {groupIndex > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => removeRuleGroup(group.id)}>
                    <Trash2 className="h-4 w-4 text-[var(--color-status-danger-icon)]" />
                  </Button>
                )}
              </div>

              {group.rules.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-[var(--color-border-tertiary)] p-6 text-center">
                  <Filter className="mx-auto h-8 w-8 text-[var(--color-text-tertiary)]" />
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Click a field above to add targeting rules
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {group.rules.map((rule, ruleIndex) => {
                    const field = getFieldByKey(rule.field)
                    if (!field) return null

                    return (
                      <div
                        key={rule.id}
                        className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--color-bg-secondary)] p-3"
                      >
                        {ruleIndex > 0 && (
                          <Badge variant={group.logic === 'AND' ? 'info' : 'warning'} size="sm">
                            {group.logic}
                          </Badge>
                        )}
                        <div className="flex items-center gap-2 font-medium text-[var(--color-text-primary)]">
                          {field.icon}
                          {field.label}
                        </div>
                        <Select
                          value={rule.operator}
                          onChange={(e) => updateRule(group.id, rule.id, { operator: e.target.value })}
                          options={field.operators.map((op) => ({
                            value: op,
                            label: OPERATOR_LABELS[op] || op,
                          }))}
                          className="w-auto"
                        />
                        {field.valueType === 'select' && field.options ? (
                          <Select
                            value={rule.value as string}
                            onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                            options={field.options}
                            className="w-auto"
                          />
                        ) : field.valueType === 'number' ? (
                          <Input
                            type="number"
                            value={rule.value as number}
                            onChange={(e) =>
                              updateRule(group.id, rule.id, { value: parseInt(e.target.value) || 0 })
                            }
                            className="w-24"
                          />
                        ) : (
                          <Input
                            type={field.valueType === 'date' ? 'date' : 'text'}
                            value={rule.value as string}
                            onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                            className="w-40"
                          />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeRule(group.id, rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-[var(--color-status-danger-icon)]" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          ))}

          {/* Add Rule Group Button */}
          <Button variant="outline" onClick={addRuleGroup} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add OR Group
          </Button>
        </div>

        {/* Audience Preview & Saved Segments - Right Side */}
        <div className="space-y-4">
          {/* Audience Preview */}
          <Card className="overflow-hidden">
            {/* Header with dark background */}
            <div className="bg-[var(--color-action-primary-bg)] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  <Users className="mr-2 inline h-5 w-5" />
                  Audience Preview
                </h3>
                {totalRules > 0 && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                    {totalRules} rule{totalRules !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Visual Audience Circle */}
              <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full border-8 border-[var(--color-bg-tertiary)]" />
                {/* Progress circle */}
                {estimatedAudience !== null && (
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 144 144">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      fill="none"
                      stroke="var(--color-action-primary-bg)"
                      strokeWidth="8"
                      strokeDasharray={`${Math.min((estimatedAudience / 50000) * 402, 402)} 402`}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {/* Center content */}
                <div className="z-10 text-center">
                  {isCalculating ? (
                    <div className="flex flex-col items-center">
                      <Activity className="h-8 w-8 animate-pulse text-[var(--color-action-primary-bg)]" />
                      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Calculating...</p>
                    </div>
                  ) : estimatedAudience !== null ? (
                    <>
                      <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                        {estimatedAudience >= 1000
                          ? `${(estimatedAudience / 1000).toFixed(1)}K`
                          : estimatedAudience.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">users</p>
                    </>
                  ) : (
                    <>
                      <Users className="mx-auto h-8 w-8 text-[var(--color-text-tertiary)]" />
                      <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">No estimate</p>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              {estimatedAudience !== null && (
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[var(--color-status-success-bg)] p-3 text-center">
                    <p className="text-lg font-bold text-[var(--color-status-success-text)]">
                      {((estimatedAudience / 50000) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">of total users</p>
                  </div>
                  <div className="rounded-lg bg-[var(--color-status-info-bg)] p-3 text-center">
                    <p className="text-lg font-bold text-[var(--color-status-info-text)]">
                      {ruleGroups.length}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">rule group{ruleGroups.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}

              {/* Empty state hint */}
              {totalRules === 0 && (
                <div className="mb-6 rounded-lg border-2 border-dashed border-[var(--color-action-primary-bg)]/30 bg-[var(--color-action-primary-bg)]/5 p-4 text-center">
                  <Filter className="mx-auto h-6 w-6 text-[var(--color-action-primary-bg)]" />
                  <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
                    Add targeting rules to estimate your audience size
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={calculateAudience}
                  disabled={totalRules === 0 || isCalculating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-action-primary-bg)] px-4 py-3 font-semibold text-white shadow-md transition-all hover:bg-[var(--color-action-primary-bg)]/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <Activity className="h-5 w-5 animate-spin" /> Calculating...
                    </>
                  ) : (
                    <>
                      <Activity className="h-5 w-5" /> Calculate Audience
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  disabled={totalRules === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[var(--color-action-primary-bg)] px-4 py-3 font-semibold text-[var(--color-action-primary-bg)] transition-all hover:bg-[var(--color-action-primary-bg)]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-5 w-5" /> Save Segment
                </button>
              </div>
            </div>
          </Card>

          {/* Saved Segments */}
          <Card className="p-4">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
              <Layers className="mr-2 inline h-5 w-5" />
              Saved Segments
            </h3>

            {savedSegments.length === 0 ? (
              <p className="text-center text-sm text-[var(--color-text-tertiary)]">
                No saved segments yet
              </p>
            ) : (
              <div className="space-y-3">
                {savedSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="rounded-lg border border-[var(--color-border-tertiary)] p-3 hover:bg-[var(--color-bg-secondary)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-[var(--color-text-primary)]">{segment.name}</h4>
                        <p className="text-xs text-[var(--color-text-secondary)]">{segment.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="info" size="sm">
                            <Users className="mr-1 h-3 w-3" />
                            {segment.audienceSize.toLocaleString()}
                          </Badge>
                          <span className="text-xs text-[var(--color-text-tertiary)]">
                            Created {segment.createdAt}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => loadSegment(segment)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteSegment(segment.id)}>
                          <Trash2 className="h-4 w-4 text-[var(--color-status-danger-icon)]" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Save Segment Modal */}
      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Audience Segment"
        description="Save this segment for use in campaigns"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveSegment} disabled={!segmentName.trim()}>
              Save Segment
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Segment Name"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            placeholder="e.g., High-Value Customers"
          />
          <Input
            label="Description"
            value={segmentDescription}
            onChange={(e) => setSegmentDescription(e.target.value)}
            placeholder="Brief description of this segment"
          />
          <div className="rounded-lg bg-[var(--color-bg-secondary)] p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              This segment contains <strong>{totalRules}</strong> rule
              {totalRules !== 1 ? 's' : ''} across <strong>{ruleGroups.length}</strong> group
              {ruleGroups.length !== 1 ? 's' : ''}
            </p>
            {estimatedAudience !== null && (
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Estimated audience: <strong>{estimatedAudience.toLocaleString()}</strong> users
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
