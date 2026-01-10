import { useState, useEffect } from 'react'
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Line, Area } from 'recharts'
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Shield, Users, Activity, ChevronRight, RefreshCw, Download, Filter, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Chart colors
const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  warning: '#f97316',
  muted: '#6b7280',
}

// Financial Model Data
const FINANCIAL_MODEL = {
  grossMarginBps: 155,
  year1Customers: 250000,
  year1AnnualSpend: 2400000000,
  year1AvgMonthlySpend: 800,
  avgTicketSize: 36,
  fisCostsMonthly: 895209.13,
  fisOneTimeSetup: 52050,
  fisCostsBps: 44.76,
  rewardsTiers: {
    bronze: { bps: 35, range: '$0-$1,999/month' },
    silver: { bps: 55, range: '$2,000-$4,999/month' },
    gold: { bps: 75, range: '$5,000-$9,999/month' },
    platinum: { bps: 100, range: '$10,000-$14,999/month' },
    sapphire: { bps: 120, range: '$15,000+/month' },
  },
  baseTierBps: 35,
  totalCostBps: function () {
    return this.fisCostsBps + this.baseTierBps
  },
  netMarginBps: function () {
    return this.grossMarginBps - this.totalCostBps()
  },
}

// Calculate Year metrics
const calculateMetrics = (year: number) => {
  const customers = FINANCIAL_MODEL.year1Customers * Math.pow(2, year - 1)
  const annualSpend = customers * FINANCIAL_MODEL.year1AvgMonthlySpend * 12
  const fisCostsAnnual = FINANCIAL_MODEL.fisCostsMonthly * 12 * Math.pow(2, year - 1)
  const rewardsAnnual = annualSpend * (FINANCIAL_MODEL.baseTierBps / 10000)
  const grossRevenue = annualSpend * (FINANCIAL_MODEL.grossMarginBps / 10000)
  const netMargin = grossRevenue - fisCostsAnnual - rewardsAnnual

  return {
    customers,
    annualSpend,
    fisCostsAnnual,
    rewardsAnnual,
    grossRevenue,
    netMargin,
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
  probability: number
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
    potentialLoss: '$180M-$360M annually',
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
    potentialLoss: '$96M-$240M annually',
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
    potentialLoss: '$200M+ annually',
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
    potentialLoss: '$600M-$1.2B',
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
    potentialLoss: '$108M-$480M',
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
    potentialLoss: '$480M-$1.2B in churn',
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
    potentialLoss: '$120M-$240M',
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
    potentialLoss: '$50M-$150M',
  },
]

// Chart data
const riskBySeverityData = [
  { name: 'Critical', value: FINANCIAL_RISKS.filter((r) => r.severity === 'critical').length, color: CHART_COLORS.danger },
  { name: 'High', value: FINANCIAL_RISKS.filter((r) => r.severity === 'high').length, color: CHART_COLORS.warning },
  { name: 'Medium', value: FINANCIAL_RISKS.filter((r) => r.severity === 'medium').length, color: CHART_COLORS.accent },
  { name: 'Low', value: FINANCIAL_RISKS.filter((r) => r.severity === 'low').length, color: CHART_COLORS.secondary },
]

const riskByCategoryData = [
  { category: 'Cost Risk', count: FINANCIAL_RISKS.filter((r) => r.category === 'Cost Risk').length, avgProbability: 63 },
  { category: 'Margin Risk', count: FINANCIAL_RISKS.filter((r) => r.category === 'Margin Risk').length, avgProbability: 55 },
  { category: 'Volume Risk', count: FINANCIAL_RISKS.filter((r) => r.category === 'Volume Risk').length, avgProbability: 40 },
  { category: 'Compliance Risk', count: FINANCIAL_RISKS.filter((r) => r.category === 'Compliance Risk').length, avgProbability: 45 },
]

const marginTrendData = [
  { year: 'Y1', grossMargin: 155, fisCosts: 44.76, rewards: 35, netMargin: 75.24 },
  { year: 'Y2', grossMargin: 155, fisCosts: 48, rewards: 42, netMargin: 65 },
  { year: 'Y3', grossMargin: 155, fisCosts: 52, rewards: 50, netMargin: 53 },
  { year: 'Y4', grossMargin: 155, fisCosts: 55, rewards: 55, netMargin: 45 },
  { year: 'Y5', grossMargin: 155, fisCosts: 58, rewards: 60, netMargin: 37 },
]

const riskProbabilityData = FINANCIAL_RISKS.map((risk) => ({
  name: risk.title.split(' ').slice(0, 2).join(' '),
  probability: risk.probability,
  severity: risk.severity === 'critical' ? 100 : risk.severity === 'high' ? 75 : risk.severity === 'medium' ? 50 : 25,
}))

const year1Metrics = calculateMetrics(1)
const year2Metrics = calculateMetrics(2)
const year3Metrics = calculateMetrics(3)

export default function RiskReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3>(1)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'recommendations'>('overview')

  // Fetch risk data on mount
  useEffect(() => {
    fetchRiskData()
  }, [])

  const fetchRiskData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/api/analytics/risk-reports`)
      // Store response data if needed, otherwise use default data
      if (response.data) {
        console.log('Risk data loaded:', response.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch risk data:', err)
      setError(err.message || 'Failed to fetch risk data')
      // Continue with default data
    } finally {
      setLoading(false)
    }
  }

  const filteredRisks = selectedCategory
    ? FINANCIAL_RISKS.filter((r) => r.category === selectedCategory)
    : FINANCIAL_RISKS

  const currentMetrics = [year1Metrics, year2Metrics, year3Metrics][selectedYear - 1]

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 1000))
    setRefreshing(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Margin Risk':
        return <TrendingDown className="h-5 w-5" />
      case 'Cost Risk':
        return <DollarSign className="h-5 w-5" />
      case 'Volume Risk':
        return <Users className="h-5 w-5" />
      case 'Compliance Risk':
        return <Shield className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const stats = [
    {
      title: 'Gross Margin',
      value: `${FINANCIAL_MODEL.grossMarginBps} bps`,
      change: 'Fixed rate',
      trend: 'neutral',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      title: 'Net Margin',
      value: `${FINANCIAL_MODEL.netMarginBps().toFixed(1)} bps`,
      change: '-12.3% after costs',
      trend: 'down',
      icon: Activity,
      color: 'purple',
    },
    {
      title: 'FIS Costs',
      value: `${FINANCIAL_MODEL.fisCostsBps.toFixed(1)} bps`,
      change: '+4.2% vs target',
      trend: 'up',
      icon: DollarSign,
      color: 'orange',
    },
    {
      title: 'Risk Score',
      value: '72/100',
      change: 'Elevated risk',
      trend: 'down',
      icon: AlertTriangle,
      color: 'red',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string }> = {
      blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
      purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
      orange: { bg: 'bg-orange-100', icon: 'text-orange-600' },
      red: { bg: 'bg-red-100', icon: 'text-red-600' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/analytics" className="text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">Analytics</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Dashboard</h1>
          <p className="text-gray-600 mt-1">Financial risk analysis, margin sustainability, and FIS cost monitoring</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorClasses = getColorClasses(stat.color)
          return (
            <div key={stat.title} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
                  <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Year Selection */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Projection Year:</span>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {[1, 2, 3].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year as 1 | 2 | 3)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    selectedYear === year
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Year {year} ({(FINANCIAL_MODEL.year1Customers * Math.pow(2, year - 1) / 1000).toFixed(0)}k customers)
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Annual Spend Volume</p>
            <p className="text-lg font-bold text-gray-900">
              ${(currentMetrics.annualSpend / 1000000000).toFixed(1)}B
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'overview', label: 'Risk Overview' },
            { key: 'risks', label: 'Risk Register' },
            { key: 'recommendations', label: 'Recommendations' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Severity Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-6">Risk Severity Distribution</h2>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={riskBySeverityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskBySeverityData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {riskBySeverityData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.value} risks</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk by Category */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-6">Risks by Category</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={riskByCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis dataKey="category" type="category" stroke="#6b7280" fontSize={11} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} name="Risk Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Margin Trend */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Margin Erosion Projection</h2>
                <p className="text-sm text-gray-600">5-year forecast of margin compression</p>
              </div>
              <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                <TrendingDown className="h-3 w-3" />
                -50% by Y5
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={marginTrendData}>
                <defs>
                  <linearGradient id="netMarginGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 180]} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="netMargin" stroke={CHART_COLORS.secondary} fill="url(#netMarginGradient)" name="Net Margin (bps)" />
                <Line type="monotone" dataKey="grossMargin" stroke={CHART_COLORS.primary} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Gross Margin (bps)" />
                <Bar dataKey="fisCosts" fill={CHART_COLORS.warning} name="FIS Costs (bps)" />
                <Bar dataKey="rewards" fill={CHART_COLORS.accent} name="Rewards (bps)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Probability & Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-6">Risk Probability Assessment</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={riskProbabilityData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                  <PolarRadiusAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} />
                  <Radar name="Probability" dataKey="probability" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-6">Year {selectedYear} Financial Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <span className="text-sm font-medium text-gray-900">Gross Revenue</span>
                  <span className="text-lg font-bold text-blue-600">${(currentMetrics.grossRevenue / 1000000).toFixed(0)}M</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                  <span className="text-sm font-medium text-gray-900">FIS Annual Cost</span>
                  <span className="text-lg font-bold text-red-600">-${(currentMetrics.fisCostsAnnual / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                  <span className="text-sm font-medium text-gray-900">Rewards Payout</span>
                  <span className="text-lg font-bold text-yellow-600">-${(currentMetrics.rewardsAnnual / 1000000).toFixed(1)}M</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                    <span className="text-sm font-medium text-gray-900">Net Margin</span>
                    <span className="text-lg font-bold text-green-600">${(currentMetrics.netMargin / 1000000).toFixed(0)}M</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {currentMetrics.customers.toLocaleString()} customers • ${FINANCIAL_MODEL.year1AvgMonthlySpend}/mo avg
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risks Tab */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Filter:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({FINANCIAL_RISKS.length})
              </button>
              {['Margin Risk', 'Cost Risk', 'Volume Risk', 'Compliance Risk'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat} ({FINANCIAL_RISKS.filter((r) => r.category === cat).length})
                </button>
              ))}
            </div>
          </div>

          {/* Risk Cards */}
          <div className="space-y-4">
            {filteredRisks.map((risk) => (
              <div
                key={risk.id}
                className={`bg-white rounded-lg border shadow-sm p-6 border-l-4 ${
                  risk.severity === 'critical'
                    ? 'border-l-red-500'
                    : risk.severity === 'high'
                    ? 'border-l-orange-500'
                    : risk.severity === 'medium'
                    ? 'border-l-yellow-500'
                    : 'border-l-green-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      risk.severity === 'critical' || risk.severity === 'high'
                        ? 'bg-red-100 text-red-600'
                        : risk.severity === 'medium'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {getCategoryIcon(risk.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{risk.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(risk.severity)}`}>
                        {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {risk.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{risk.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Probability</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${risk.probability}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{risk.probability}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Financial Impact</p>
                        <p className="text-sm font-bold text-red-600">{risk.potentialLoss}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Operational Impact</p>
                        <p className="text-sm text-gray-600">{risk.impact}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Mitigation Strategy</p>
                      <p className="text-sm text-gray-600">{risk.mitigation}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-500">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">Risk Management Recommendations</h2>
                <p className="text-sm text-gray-600">Strategic actions to mitigate identified risks</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: 'Monitor Margin Erosion',
                  description: 'Ticket size and rewards tier migration are the biggest margin threats. Implement weekly reporting and automated alerts.',
                  priority: 'Critical',
                },
                {
                  title: 'Negotiate FIS Volume Discounts',
                  description: 'At Year 3 scale ($9.6B spend), negotiate 5-15% cost reductions. Lock multi-year rates now.',
                  priority: 'High',
                },
                {
                  title: 'Chargeback Prevention',
                  description: 'SecurLOCK™ is highly sensitive to dispute rates. Invest in fraud detection to keep chargebacks below 0.5%.',
                  priority: 'High',
                },
                {
                  title: 'Reserve Fund Strategy',
                  description: 'Build a 6-12 month rewards reserve fund ($50-100M) to weather tier migration and volume swings.',
                  priority: 'Medium',
                },
                {
                  title: 'Processor Diversification',
                  description: 'Evaluate alternative payment processors annually to maintain competitive leverage and reduce vendor lock-in.',
                  priority: 'Medium',
                },
              ].map((rec, index) => (
                <div
                  key={rec.title}
                  className="flex items-start gap-4 p-4 rounded-lg bg-white border border-gray-200"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'High'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Tier Structure */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-6">Rewards Tier Structure & Risk</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="pb-3 font-medium">Tier</th>
                    <th className="pb-3 font-medium">Spend Range</th>
                    <th className="pb-3 font-medium text-right">Reward Rate</th>
                    <th className="pb-3 font-medium text-right">Margin Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(FINANCIAL_MODEL.rewardsTiers).map(([tier, data]) => (
                    <tr key={tier} className="border-b border-gray-100 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              tier === 'bronze'
                                ? 'bg-amber-600'
                                : tier === 'silver'
                                ? 'bg-gray-400'
                                : tier === 'gold'
                                ? 'bg-yellow-400'
                                : tier === 'platinum'
                                ? 'bg-purple-400'
                                : 'bg-blue-400'
                            }`}
                          />
                          <span className="font-medium text-gray-900 capitalize">{tier}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{data.range}</td>
                      <td className="py-3 text-right font-semibold text-gray-900">{data.bps} bps</td>
                      <td className="py-3 text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            data.bps <= 35
                              ? 'bg-green-100 text-green-800'
                              : data.bps <= 75
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {data.bps <= 35 ? 'Low' : data.bps <= 75 ? 'Medium' : 'High'} Risk
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
