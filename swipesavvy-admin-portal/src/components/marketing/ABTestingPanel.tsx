/**
 * A/B Testing Panel Component
 * Manage and monitor A/B tests for marketing campaigns
 */

import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import { Activity, BarChart3, CheckCircle, Crown, FlaskConical, Pause, Play, Plus, Target, Trash2, TrendingUp, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface ABTest {
  id: string
  name: string
  hypothesis: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  variants: {
    id: string
    name: string
    description: string
    traffic: number
    impressions: number
    conversions: number
    conversionRate: number
  }[]
  successMetric: string
  trafficSplit: number
  startDate: string
  endDate?: string
  winner?: string
  confidence?: number
  createdAt: string
}

// Mock data for A/B tests
const MOCK_AB_TESTS: ABTest[] = [
  {
    id: 'test-1',
    name: 'Email Subject Line Test',
    hypothesis: 'Personalized subject lines will increase open rates by 15%',
    status: 'running',
    variants: [
      { id: 'a', name: 'Control', description: 'Standard subject line', traffic: 50, impressions: 12500, conversions: 2125, conversionRate: 17.0 },
      { id: 'b', name: 'Variant B', description: 'Personalized with name', traffic: 50, impressions: 12500, conversions: 2750, conversionRate: 22.0 },
    ],
    successMetric: 'open_rate',
    trafficSplit: 50,
    startDate: '2025-01-01',
    confidence: 94,
    createdAt: '2024-12-28',
  },
  {
    id: 'test-2',
    name: 'CTA Button Color',
    hypothesis: 'Green CTA buttons will outperform blue by 10%',
    status: 'completed',
    variants: [
      { id: 'a', name: 'Blue Button', description: 'Current blue CTA', traffic: 50, impressions: 25000, conversions: 1500, conversionRate: 6.0 },
      { id: 'b', name: 'Green Button', description: 'Test green CTA', traffic: 50, impressions: 25000, conversions: 2000, conversionRate: 8.0 },
    ],
    successMetric: 'click_rate',
    trafficSplit: 50,
    startDate: '2024-12-15',
    endDate: '2024-12-29',
    winner: 'b',
    confidence: 98,
    createdAt: '2024-12-14',
  },
  {
    id: 'test-3',
    name: 'Discount Amount Test',
    hypothesis: '15% discount will convert better than 10% discount',
    status: 'paused',
    variants: [
      { id: 'a', name: '10% Off', description: 'Standard discount', traffic: 50, impressions: 8000, conversions: 320, conversionRate: 4.0 },
      { id: 'b', name: '15% Off', description: 'Higher discount', traffic: 50, impressions: 8000, conversions: 440, conversionRate: 5.5 },
    ],
    successMetric: 'conversion_rate',
    trafficSplit: 50,
    startDate: '2025-01-05',
    confidence: 72,
    createdAt: '2025-01-04',
  },
]

const SUCCESS_METRICS = [
  { value: 'open_rate', label: 'Open Rate' },
  { value: 'click_rate', label: 'Click Rate' },
  { value: 'conversion_rate', label: 'Conversion Rate' },
  { value: 'revenue', label: 'Revenue per User' },
  { value: 'engagement', label: 'Engagement Score' },
]

export default function ABTestingPanel() {
  const [tests, setTests] = useState<ABTest[]>(MOCK_AB_TESTS)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)

  // Form state
  const [testName, setTestName] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [variantAName, setVariantAName] = useState('Control')
  const [variantADesc, setVariantADesc] = useState('')
  const [variantBName, setVariantBName] = useState('Variant B')
  const [variantBDesc, setVariantBDesc] = useState('')
  const [trafficSplit, setTrafficSplit] = useState(50)
  const [successMetric, setSuccessMetric] = useState('conversion_rate')

  const getStatusBadge = (status: ABTest['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="success">Running</Badge>
      case 'completed':
        return <Badge variant="info">Completed</Badge>
      case 'paused':
        return <Badge variant="warning">Paused</Badge>
      default:
        return <Badge variant="neutral">Draft</Badge>
    }
  }

  const handleCreateTest = () => {
    if (!testName.trim()) return

    const newTest: ABTest = {
      id: `test-${Date.now()}`,
      name: testName,
      hypothesis,
      status: 'draft',
      variants: [
        { id: 'a', name: variantAName, description: variantADesc, traffic: trafficSplit, impressions: 0, conversions: 0, conversionRate: 0 },
        { id: 'b', name: variantBName, description: variantBDesc, traffic: 100 - trafficSplit, impressions: 0, conversions: 0, conversionRate: 0 },
      ],
      successMetric,
      trafficSplit,
      startDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }

    setTests([newTest, ...tests])
    setShowCreateModal(false)
    resetForm()
  }

  const resetForm = () => {
    setTestName('')
    setHypothesis('')
    setVariantAName('Control')
    setVariantADesc('')
    setVariantBName('Variant B')
    setVariantBDesc('')
    setTrafficSplit(50)
    setSuccessMetric('conversion_rate')
  }

  const handleStartTest = (testId: string) => {
    setTests(tests.map(t => t.id === testId ? { ...t, status: 'running' as const } : t))
  }

  const handlePauseTest = (testId: string) => {
    setTests(tests.map(t => t.id === testId ? { ...t, status: 'paused' as const } : t))
  }

  const handlePromoteWinner = (testId: string, winnerId: string) => {
    setTests(tests.map(t =>
      t.id === testId
        ? { ...t, status: 'completed' as const, winner: winnerId, endDate: new Date().toISOString().split('T')[0] }
        : t
    ))
    setShowResultsModal(false)
  }

  const handleDeleteTest = (testId: string) => {
    setTests(tests.filter(t => t.id !== testId))
  }

  const viewResults = (test: ABTest) => {
    setSelectedTest(test)
    setShowResultsModal(true)
  }

  // Calculate overall stats
  const runningTests = tests.filter(t => t.status === 'running').length
  const completedTests = tests.filter(t => t.status === 'completed').length
  const avgLift = tests
    .filter(t => t.variants.length === 2)
    .reduce((sum, t) => {
      const varA = t.variants[0].conversionRate
      const varB = t.variants[1].conversionRate
      return sum + ((Math.max(varA, varB) - Math.min(varA, varB)) / Math.min(varA, varB) * 100)
    }, 0) / (tests.length || 1)

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-status-success-bg)] p-2">
              <Play className="h-5 w-5 text-[var(--color-status-success-icon)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Running Tests</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{runningTests}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-status-info-bg)] p-2">
              <CheckCircle className="h-5 w-5 text-[var(--color-status-info-icon)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Completed</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{completedTests}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-status-warning-bg)] p-2">
              <TrendingUp className="h-5 w-5 text-[var(--color-status-warning-icon)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Avg. Lift</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{avgLift.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--color-status-info-bg)] p-2">
              <FlaskConical className="h-5 w-5 text-[var(--color-status-info-icon)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Total Tests</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{tests.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Active A/B Tests</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">Manage and monitor your experiments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Test
        </Button>
      </div>

      {/* Tests Grid */}
      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id} className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              {/* Test Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold text-[var(--color-text-primary)]">{test.name}</h4>
                  {getStatusBadge(test.status)}
                  {test.winner && (
                    <Badge variant="success">
                      <Crown className="mr-1 h-3 w-3" />
                      Winner: {test.variants.find(v => v.id === test.winner)?.name}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{test.hypothesis}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span className="text-[var(--color-text-tertiary)]">
                    Metric: <strong className="text-[var(--color-text-secondary)]">
                      {SUCCESS_METRICS.find(m => m.value === test.successMetric)?.label}
                    </strong>
                  </span>
                  <span className="text-[var(--color-text-tertiary)]">
                    Split: <strong className="text-[var(--color-text-secondary)]">{test.trafficSplit}/{100 - test.trafficSplit}</strong>
                  </span>
                  {test.confidence && (
                    <span className="text-[var(--color-text-tertiary)]">
                      Confidence: <strong className={test.confidence >= 95 ? 'text-[var(--color-status-success-text)]' : 'text-[var(--color-text-secondary)]'}>
                        {test.confidence}%
                      </strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Comparison */}
              <div className="flex gap-4">
                {test.variants.map((variant, idx) => (
                  <div
                    key={variant.id}
                    className={`min-w-[140px] rounded-lg border p-3 ${
                      test.winner === variant.id
                        ? 'border-[var(--color-status-success-border)] bg-[var(--color-status-success-bg)]'
                        : 'border-[var(--color-border-tertiary)] bg-[var(--color-bg-secondary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{variant.name}</span>
                      {test.winner === variant.id && <Crown className="h-4 w-4 text-[var(--color-status-success-icon)]" />}
                    </div>
                    <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
                      {variant.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {variant.conversions.toLocaleString()} / {variant.impressions.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {test.status === 'draft' && (
                  <Button size="sm" variant="primary" onClick={() => handleStartTest(test.id)}>
                    <Play className="mr-1 h-4 w-4" /> Start
                  </Button>
                )}
                {test.status === 'running' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handlePauseTest(test.id)}>
                      <Pause className="mr-1 h-4 w-4" /> Pause
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => viewResults(test)}>
                      <BarChart3 className="mr-1 h-4 w-4" /> Results
                    </Button>
                  </>
                )}
                {test.status === 'paused' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleStartTest(test.id)}>
                      <Play className="mr-1 h-4 w-4" /> Resume
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => viewResults(test)}>
                      <BarChart3 className="mr-1 h-4 w-4" /> Results
                    </Button>
                  </>
                )}
                {test.status === 'completed' && (
                  <Button size="sm" variant="outline" onClick={() => viewResults(test)}>
                    <BarChart3 className="mr-1 h-4 w-4" /> View Results
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleDeleteTest(test.id)}>
                  <Trash2 className="h-4 w-4 text-[var(--color-status-danger-icon)]" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {tests.length === 0 && (
          <Card className="p-8 text-center">
            <FlaskConical className="mx-auto h-12 w-12 text-[var(--color-text-tertiary)]" />
            <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">No A/B Tests Yet</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Create your first experiment to start optimizing your campaigns
            </p>
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Test
            </Button>
          </Card>
        )}
      </div>

      {/* Create Test Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create A/B Test"
        description="Set up a new experiment to test campaign variations"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateTest} disabled={!testName.trim()}>Create Test</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Test Name"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g., Email Subject Line Test"
          />
          <Input
            label="Hypothesis"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            placeholder="e.g., Personalized subject lines will increase open rates"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-[var(--color-border-tertiary)] p-4">
              <h4 className="font-medium text-[var(--color-text-primary)]">Variant A (Control)</h4>
              <Input
                label="Name"
                value={variantAName}
                onChange={(e) => setVariantAName(e.target.value)}
                placeholder="Control"
              />
              <Input
                label="Description"
                value={variantADesc}
                onChange={(e) => setVariantADesc(e.target.value)}
                placeholder="Current version"
              />
            </div>
            <div className="space-y-3 rounded-lg border border-[var(--color-border-tertiary)] p-4">
              <h4 className="font-medium text-[var(--color-text-primary)]">Variant B</h4>
              <Input
                label="Name"
                value={variantBName}
                onChange={(e) => setVariantBName(e.target.value)}
                placeholder="Variant B"
              />
              <Input
                label="Description"
                value={variantBDesc}
                onChange={(e) => setVariantBDesc(e.target.value)}
                placeholder="Test variation"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                Traffic Split: {trafficSplit}% / {100 - trafficSplit}%
              </label>
              <input
                type="range"
                min="10"
                max="90"
                value={trafficSplit}
                onChange={(e) => setTrafficSplit(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <Select
              label="Success Metric"
              value={successMetric}
              onChange={(e) => setSuccessMetric(e.target.value)}
              options={SUCCESS_METRICS}
            />
          </div>
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal
        open={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        title={selectedTest ? `Results: ${selectedTest.name}` : 'Test Results'}
        description="Analyze test performance and choose a winner"
      >
        {selectedTest && (
          <div className="space-y-6">
            {/* Confidence Indicator */}
            <div className={`rounded-lg p-4 ${
              (selectedTest.confidence || 0) >= 95
                ? 'bg-[var(--color-status-success-bg)]'
                : (selectedTest.confidence || 0) >= 80
                ? 'bg-[var(--color-status-warning-bg)]'
                : 'bg-[var(--color-bg-secondary)]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-secondary)]">Statistical Confidence</p>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">
                    {selectedTest.confidence || 0}%
                  </p>
                </div>
                {(selectedTest.confidence || 0) >= 95 ? (
                  <CheckCircle className="h-8 w-8 text-[var(--color-status-success-icon)]" />
                ) : (
                  <Activity className="h-8 w-8 text-[var(--color-status-warning-icon)]" />
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                {(selectedTest.confidence || 0) >= 95
                  ? 'Results are statistically significant. You can confidently choose a winner.'
                  : 'Continue the test to reach statistical significance (95%).'}
              </p>
            </div>

            {/* Variant Comparison Chart */}
            <div>
              <h4 className="mb-3 font-medium text-[var(--color-text-primary)]">Conversion Rate Comparison</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedTest.variants}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                    <XAxis dataKey="name" stroke="var(--color-text-tertiary)" />
                    <YAxis stroke="var(--color-text-tertiary)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="conversionRate" radius={[4, 4, 0, 0]}>
                      {selectedTest.variants.map((variant, index) => (
                        <Cell
                          key={variant.id}
                          fill={variant.id === selectedTest.winner ? '#60BA46' : index === 0 ? '#235393' : '#FAB915'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedTest.variants.map((variant) => (
                <Card key={variant.id} className={`p-4 ${selectedTest.winner === variant.id ? 'ring-2 ring-[var(--color-status-success-border)]' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-[var(--color-text-primary)]">{variant.name}</h5>
                    {selectedTest.winner === variant.id && (
                      <Badge variant="success">
                        <Crown className="mr-1 h-3 w-3" /> Winner
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Impressions</span>
                      <span className="font-medium text-[var(--color-text-primary)]">{variant.impressions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Conversions</span>
                      <span className="font-medium text-[var(--color-text-primary)]">{variant.conversions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Conversion Rate</span>
                      <span className="font-bold text-[var(--color-text-primary)]">{variant.conversionRate.toFixed(2)}%</span>
                    </div>
                  </div>
                  {!selectedTest.winner && selectedTest.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={() => handlePromoteWinner(selectedTest.id, variant.id)}
                    >
                      <Target className="mr-1 h-4 w-4" /> Promote as Winner
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
