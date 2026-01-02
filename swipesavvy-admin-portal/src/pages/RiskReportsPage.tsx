import Badge from '@/components/ui/Badge'
import { BrandingKitIcon } from '@/components/ui/BrandingKitIcon'
import Card from '@/components/ui/Card'
import { useState } from 'react'

// Financial Model Data (from FIS Pricing Attachment & Risk Model)
const FINANCIAL_MODEL = {
  // Gross margin: 155 bps (0.0155 or 1.55%)
  grossMarginBps: 155,
  
  // Year 1 Baseline (250k customers, $800/month avg spend)
  year1Customers: 250000,
  year1AnnualSpend: 2400000000, // $2.4B
  year1AvgMonthlySpend: 800,
  avgTicketSize: 36,
  
  // FIS Costs breakdown
  fisCostsMonthly: 895209.13,
  fisOneTimeSetup: 52050,
  fisCostsBps: 44.76, // as % of spend
  
  // Rewards structure (Bronze base at 35 bps)
  rewardsTiers: {
    bronze: { bps: 35, range: '$0-$1,999/month' },
    silver: { bps: 55, range: '$2,000-$4,999/month' },
    gold: { bps: 75, range: '$5,000-$9,999/month' },
    platinum: { bps: 100, range: '$10,000-$14,999/month' },
    sapphire: { bps: 120, range: '$15,000+/month' },
  },
  baseTierBps: 35,
  
  // Cost structure (as bps of spend)
  totalCostBps: function() {
    return this.fisCostsBps + this.baseTierBps // 44.76 + 35 = 79.76 bps
  },
  netMarginBps: function() {
    return this.grossMarginBps - this.totalCostBps() // 155 - 79.76 = 75.24 bps
  },
  breakEvenBps: function() {
    return this.totalCostBps()
  }
}

// Calculate Year 1 metrics
const calculateMetrics = (year: number) => {
  const customers = FINANCIAL_MODEL.year1Customers * Math.pow(2, year - 1)
  const annualSpend = customers * FINANCIAL_MODEL.year1AvgMonthlySpend * 12
  const annualTransactions = (customers * FINANCIAL_MODEL.year1AvgMonthlySpend * 12) / FINANCIAL_MODEL.avgTicketSize
  const fisCostsAnnual = FINANCIAL_MODEL.fisCostsMonthly * 12 * Math.pow(2, year - 1)
  const rewardsAnnual = annualSpend * (FINANCIAL_MODEL.baseTierBps / 10000)
  const grossRevenue = annualSpend * (FINANCIAL_MODEL.grossMarginBps / 10000)
  const netMargin = grossRevenue - fisCostsAnnual - rewardsAnnual
  
  return {
    customers,
    annualSpend,
    annualTransactions,
    fisCostsAnnual,
    rewardsAnnual,
    grossRevenue,
    netMargin,
    netMarginBps: FINANCIAL_MODEL.netMarginBps()
  }
}

interface FinancialRisk {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: 'Margin Risk' | 'Cost Risk' | 'Volume Risk' | 'Compliance Risk'
  description: string
  impact: string
  mitigation: string
  probability: number // 0-100
  potentialLoss: string
}

const FINANCIAL_RISKS: FinancialRisk[] = [
  {
    id: '1',
    title: 'Ticket Size Compression',
    severity: 'high',
    category: 'Cost Risk',
    description: 'Smaller average ticket sizes increase per-transaction processing costs. From $36 avg to $25 would increase transaction volume 44% with same spend.',
    impact: 'FIS costs increase 40-60% per transaction. Could reduce net margin by 15-25 bps.',
    mitigation: 'Implement minimum transaction thresholds, encourage larger purchases, optimize bundling strategies.',
    probability: 65,
    potentialLoss: '$180M-$360M annually (Year 1 baseline)'
  },
  {
    id: '2',
    title: 'Rewards Tier Migration',
    severity: 'high',
    category: 'Margin Risk',
    description: 'Portfolio shift from Bronze (35 bps) to higher tiers. 20% to Silver (55 bps) alone costs +4 bps.',
    impact: 'Every 10% customer shift to next tier costs ~2 bps of margin. At scale, this is $48M-$96M annually.',
    mitigation: 'Monitor tier distribution closely, adjust incentive structures, create spending friction at tier boundaries.',
    probability: 75,
    potentialLoss: '$96M-$240M annually (if 50% shift to Silver)'
  },
  {
    id: '3',
    title: 'Chargeback Rate Increase',
    severity: 'critical',
    category: 'Cost Risk',
    description: 'SecurLOCK™ processing is heavily influenced by chargeback/dispute volume. A 2% increase impacts $2-4M in fees.',
    impact: 'Chargeback handling costs scale dramatically. Could eliminate 20-40% of net margin at scale.',
    mitigation: 'Implement enhanced fraud detection, improve dispute resolution processes, monitor chargeback ratios weekly.',
    probability: 55,
    potentialLoss: '$200M+ annually (Year 3 if unchecked)'
  },
  {
    id: '4',
    title: 'Customer Acquisition Slowdown',
    severity: 'medium',
    category: 'Volume Risk',
    description: 'Ramp assumes 2x customer growth YoY (250k→500k→1M). Actual market conditions may yield only 50% growth.',
    impact: 'Year 3 revenue miss of $2.4B. Fixed costs become unbearable leverage on lower volumes.',
    mitigation: 'Diversify customer channels, reduce CAC, optimize retention, build strategic partnerships.',
    probability: 40,
    potentialLoss: '$600M-$1.2B (Year 3 impact)'
  },
  {
    id: '5',
    title: 'FIS Fee Increases',
    severity: 'high',
    category: 'Cost Risk',
    description: 'Attachment allows annual price adjustments. 10% increase = +4.5 bps cost. At scale, $108M+ annually.',
    impact: 'FIS fees could reach 50+ bps with escalations. Reduces margin from 155 bps to 105 bps+ in Year 3.',
    mitigation: 'Lock multi-year pricing, negotiate volume discounts, evaluate alternative processors.',
    probability: 80,
    potentialLoss: '$108M-$480M (depending on escalation)'
  },
  {
    id: '6',
    title: 'Rewards Funding Crisis',
    severity: 'high',
    category: 'Margin Risk',
    description: 'At Year 1 scale, rewards payout is $8.4M. Year 3 reaches $33.6M. Customer acquisition may outpace funding.',
    impact: 'Inability to fund promised rewards erodes customer trust, increases churn.',
    mitigation: 'Build rewards reserve fund, phase rewards rollout, tie to profitability milestones.',
    probability: 35,
    potentialLoss: 'Customer churn 20-50%, revenue loss $480M-$1.2B'
  },
  {
    id: '7',
    title: 'Network/Regulatory Changes',
    severity: 'medium',
    category: 'Compliance Risk',
    description: 'Card network rules, dispute timelines, or regulatory requirements could force process changes.',
    impact: 'Additional operational costs, potential system redesigns, staffing changes.',
    mitigation: 'Maintain compliance monitoring, build flexible architecture, budget regulatory cushion (5-10 bps).',
    probability: 45,
    potentialLoss: '$120M-$240M (10-20% margin erosion)'
  },
  {
    id: '8',
    title: 'Volume Driven Cost Non-Linearity',
    severity: 'medium',
    category: 'Cost Risk',
    description: 'FIS fees may not scale linearly. Tier-based pricing could create step-function cost increases.',
    impact: 'Cost jumps at volume thresholds consume margin improvements. Could swing $50-150M impact at scale.',
    mitigation: 'Negotiate smooth scaling clauses, stress-test pricing at 2x/5x current volume.',
    probability: 50,
    potentialLoss: '$50M-$150M (depending on tier structure)'
  },
]

const year1Metrics = calculateMetrics(1)
const year2Metrics = calculateMetrics(2)
const year3Metrics = calculateMetrics(3)

export default function RiskReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3>(1)
  
  const filteredRisks = selectedCategory 
    ? FINANCIAL_RISKS.filter((r) => r.category === selectedCategory) 
    : FINANCIAL_RISKS
  
  const currentMetrics = [year1Metrics, year2Metrics, year3Metrics][selectedYear - 1]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-l-4 border-red-700'
      case 'high':
        return 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-l-4 border-orange-700'
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-l-4 border-yellow-700'
      default:
        return 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-l-4 border-blue-700'
    }
  }

  const getRiskBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'danger'
      case 'high':
        return 'danger'
      case 'medium':
        return 'warning'
      default:
        return 'success'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Margin Risk': return 'trending_down'
      case 'Cost Risk': return 'chart_line'
      case 'Volume Risk': return 'users'
      case 'Compliance Risk': return 'shield'
      default: return 'alert_circle'
    }
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#235393] to-[#1A3F7A] rounded-lg p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#FAB915]/20 rounded-lg">
            <BrandingKitIcon name="chart_line" size="lg" className="text-[#FAB915]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Financial Risk & Margin Analysis</h1>
            <p className="text-white/70 mt-1">Monitor FIS costs, rewards payouts, and margin sustainability</p>
          </div>
        </div>
      </div>

      {/* Year Selection */}
      <Card className="p-4 bg-white dark:bg-slate-900">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedYear(1)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedYear === 1
                ? 'bg-[#235393] text-white'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Year 1 (250k customers)
          </button>
          <button
            onClick={() => setSelectedYear(2)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedYear === 2
                ? 'bg-[#235393] text-white'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Year 2 (500k customers)
          </button>
          <button
            onClick={() => setSelectedYear(3)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedYear === 3
                ? 'bg-[#235393] text-white'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Year 3 (1M customers)
          </button>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#235393] to-[#1A3F7A] text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase opacity-90">Gross Margin</span>
            <BrandingKitIcon name="trending_up" size="md" className="text-[#60BA46]" />
          </div>
          <p className="text-3xl font-bold">{FINANCIAL_MODEL.grossMarginBps} bps</p>
          <p className="text-xs opacity-75 mt-2">{(FINANCIAL_MODEL.grossMarginBps / 100).toFixed(2)}% of spend</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#60BA46] to-[#4A9034] text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase opacity-90">Net Margin</span>
            <BrandingKitIcon name="chart_bar" size="md" className="text-[#FAB915]" />
          </div>
          <p className="text-3xl font-bold">{FINANCIAL_MODEL.netMarginBps().toFixed(2)} bps</p>
          <p className="text-xs opacity-75 mt-2">After FIS & rewards</p>
        </Card>

        <Card className="bg-gradient-to-br from-[#FAB915] to-[#FF8C00] text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase opacity-90">FIS Costs</span>
            <BrandingKitIcon name="chart_line" size="md" className="text-white" />
          </div>
          <p className="text-3xl font-bold">{FINANCIAL_MODEL.fisCostsBps.toFixed(2)} bps</p>
          <p className="text-xs opacity-75 mt-2">Monthly: ${(FINANCIAL_MODEL.fisCostsMonthly).toLocaleString('en-US', {maximumFractionDigits: 0})}</p>
        </Card>

        <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase opacity-90">Rewards Cost</span>
            <BrandingKitIcon name="trending_down" size="md" className="text-yellow-300" />
          </div>
          <p className="text-3xl font-bold">{FINANCIAL_MODEL.baseTierBps} bps</p>
          <p className="text-xs opacity-75 mt-2">Bronze tier baseline</p>
        </Card>
      </div>

      {/* Financial Projection */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-bold text-[#235393] dark:text-white mb-4 flex items-center gap-2">
          <BrandingKitIcon name="chart_bar" size="md" />
          Year {selectedYear} Financial Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-[#235393] pl-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annual Spend Volume</p>
            <p className="text-2xl font-bold text-[#235393] dark:text-white">${(currentMetrics.annualSpend / 1000000000).toFixed(1)}B</p>
            <p className="text-xs text-gray-500 mt-1">{currentMetrics.customers.toLocaleString()} customers @ ${FINANCIAL_MODEL.year1AvgMonthlySpend}/mo</p>
          </div>
          <div className="border-l-4 border-[#60BA46] pl-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gross Revenue</p>
            <p className="text-2xl font-bold text-[#60BA46] dark:text-white">${(currentMetrics.grossRevenue / 1000000).toFixed(0)}M</p>
            <p className="text-xs text-gray-500 mt-1">{FINANCIAL_MODEL.grossMarginBps} bps on spend</p>
          </div>
          <div className="border-l-4 border-[#FAB915] pl-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Net Margin After Costs</p>
            <p className={`text-2xl font-bold ${currentMetrics.netMargin > 0 ? 'text-[#60BA46]' : 'text-red-600'} dark:text-white`}>
              ${(currentMetrics.netMargin / 1000000).toFixed(0)}M
            </p>
            <p className="text-xs text-gray-500 mt-1">{currentMetrics.netMarginBps.toFixed(2)} bps net</p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Cost Breakdown</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">FIS Annual Cost:</span>
              <span className="font-bold text-gray-900 dark:text-white">${(currentMetrics.fisCostsAnnual / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rewards Payout:</span>
              <span className="font-bold text-gray-900 dark:text-white">${(currentMetrics.rewardsAnnual / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Costs:</span>
              <span className="font-bold text-gray-900 dark:text-white">${((currentMetrics.fisCostsAnnual + currentMetrics.rewardsAnnual) / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transaction Volume:</span>
              <span className="font-bold text-gray-900 dark:text-white">{(currentMetrics.annualTransactions / 1000000).toFixed(1)}M txns</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Matrix */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-bold text-[#235393] dark:text-white mb-4 flex items-center gap-2">
          <BrandingKitIcon name="alert_circle" size="md" />
          Risk Severity Distribution
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600">
            <p className="text-2xl font-bold text-red-600">{FINANCIAL_RISKS.filter(r => r.severity === 'critical').length}</p>
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 mt-1">CRITICAL</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-600">
            <p className="text-2xl font-bold text-orange-600">{FINANCIAL_RISKS.filter(r => r.severity === 'high').length}</p>
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mt-1">HIGH</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-[#FAB915]">
            <p className="text-2xl font-bold text-[#FAB915]">{FINANCIAL_RISKS.filter(r => r.severity === 'medium').length}</p>
            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mt-1">MEDIUM</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-[#235393]">
            <p className="text-2xl font-bold text-[#235393]">{FINANCIAL_RISKS.filter(r => r.severity === 'low').length}</p>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mt-1">TOTAL</p>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <Card className="p-6 border-l-4 border-[#60BA46] bg-white dark:bg-slate-900">
        <h3 className="text-lg font-bold text-[#235393] dark:text-white mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: selectedCategory === null ? '#235393' : '#F3F4F6',
              color: selectedCategory === null ? 'white' : '#235393',
            }}
          >
            All ({FINANCIAL_RISKS.length})
          </button>
          {['Margin Risk', 'Cost Risk', 'Volume Risk', 'Compliance Risk'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: selectedCategory === cat ? '#235393' : '#F3F4F6',
                color: selectedCategory === cat ? 'white' : '#235393',
              }}
            >
              {cat} ({FINANCIAL_RISKS.filter(r => r.category === cat).length})
            </button>
          ))}
        </div>
      </Card>

      {/* Risk List */}
      <div className="grid gap-4">
        {filteredRisks.map((risk) => (
          <Card
            key={risk.id}
            className={`p-6 hover:shadow-lg transition-all ${getSeverityColor(
              risk.severity
            )}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                <div className="flex-shrink-0 mt-1">
                  <BrandingKitIcon name={getCategoryIcon(risk.category)} size="md" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold">{risk.title}</h3>
                    <Badge variant={getRiskBadge(risk.severity)}>
                      {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                    </Badge>
                    <Badge variant="neutral">{risk.category}</Badge>
                  </div>
                  <p className="text-sm mb-3">{risk.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-semibold block text-xs opacity-75 mb-1">PROBABILITY</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#235393] to-[#1A3F7A] h-2 rounded-full"
                            style={{ width: `${risk.probability}%` }}
                          />
                        </div>
                        <span className="font-semibold">{risk.probability}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold block text-xs opacity-75 mb-1">FINANCIAL IMPACT</span>
                      <p className="font-bold text-red-600 dark:text-red-400">{risk.potentialLoss}</p>
                    </div>
                    <div>
                      <span className="font-semibold block text-xs opacity-75 mb-1">OPERATIONAL IMPACT</span>
                      <p className="text-sm">{risk.impact}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-current border-opacity-20">
                    <span className="font-semibold block text-xs opacity-75 mb-1">MITIGATION STRATEGY</span>
                    <p className="text-sm">{risk.mitigation}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-[#60BA46]/10 to-[#FAB915]/10 border-l-4 border-[#60BA46] dark:from-slate-800 dark:to-slate-900">
        <h3 className="text-lg font-bold text-[#235393] dark:text-white mb-4 flex items-center gap-2">
          <BrandingKitIcon name="shield" size="md" />
          Risk Management Recommendations
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <BrandingKitIcon name="check_circle" size="md" className="text-[#60BA46] flex-shrink-0 mt-1" />
            <p className="text-sm"><span className="font-semibold">Monitor Margin Erosion:</span> Ticket size and rewards tier migration are the biggest margin threats. Implement weekly reporting and automated alerts.</p>
          </div>
          <div className="flex gap-3">
            <BrandingKitIcon name="check_circle" size="md" className="text-[#60BA46] flex-shrink-0 mt-1" />
            <p className="text-sm"><span className="font-semibold">Negotiate FIS Volume Discounts:</span> At Year 3 scale ($9.6B spend), you should be able to negotiate 5-15% cost reductions. Lock multi-year rates now.</p>
          </div>
          <div className="flex gap-3">
            <BrandingKitIcon name="check_circle" size="md" className="text-[#60BA46] flex-shrink-0 mt-1" />
            <p className="text-sm"><span className="font-semibold">Chargeback Prevention:</span> SecurLOCK™ is highly sensitive to dispute rates. Invest in fraud detection and dispute resolution to keep chargebacks below 0.5%.</p>
          </div>
          <div className="flex gap-3">
            <BrandingKitIcon name="check_circle" size="md" className="text-[#60BA46] flex-shrink-0 mt-1" />
            <p className="text-sm"><span className="font-semibold">Reserve Fund Strategy:</span> Build a 6-12 month rewards reserve fund ($50-100M) to weather tier migration and volume swings without funding stress.</p>
          </div>
          <div className="flex gap-3">
            <BrandingKitIcon name="check_circle" size="md" className="text-[#60BA46] flex-shrink-0 mt-1" />
            <p className="text-sm"><span className="font-semibold">Processor Diversification:</span> Evaluate alternative payment processors annually to maintain competitive leverage and reduce vendor lock-in risk.</p>
          </div>
        </div>
      </Card>
    </div>
  )}