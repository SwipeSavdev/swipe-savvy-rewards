import React from 'react'
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface MarginRiskCardProps {
  rewardsCostPct: number
  grossMarginPct?: number
  thresholdPct?: number
}

export default function MarginRiskCard({
  rewardsCostPct,
  grossMarginPct = 1.55,
  thresholdPct = 45,
}: MarginRiskCardProps) {
  const isAtRisk = rewardsCostPct >= thresholdPct
  const margin = thresholdPct - rewardsCostPct
  const trendDirection = margin < 5 ? 'critical' : margin < 10 ? 'warning' : 'safe'

  const getStatusColor = () => {
    if (isAtRisk) return 'bg-red-50 border-red-200'
    if (trendDirection === 'warning') return 'bg-amber-50 border-amber-200'
    return 'bg-green-50 border-green-200'
  }

  const getTextColor = () => {
    if (isAtRisk) return 'text-red-900'
    if (trendDirection === 'warning') return 'text-amber-900'
    return 'text-green-900'
  }

  const getProgressColor = () => {
    if (isAtRisk) return '#ef4444'
    if (trendDirection === 'warning') return '#f59e0b'
    return '#10b981'
  }

  const progressPercent = (rewardsCostPct / thresholdPct) * 100

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={`font-semibold text-sm ${getTextColor()}`}>Gross Margin Protection</h3>
          <p className="text-xs opacity-75 mt-1">
            Rewards cost impact on {grossMarginPct}% margins
          </p>
        </div>
        {isAtRisk && (
          <AlertCircle className={`w-5 h-5 ${getTextColor()}`} />
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className={`text-lg font-bold ${getTextColor()}`}>
            {grossMarginPct.toFixed(2)}%
          </div>
          <div className="text-xs opacity-75">Gross Margin</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${getTextColor()}`}>
            {rewardsCostPct.toFixed(1)}%
          </div>
          <div className="text-xs opacity-75">Rewards Cost</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${getTextColor()}`}>
            {margin.toFixed(1)}%
          </div>
          <div className="text-xs opacity-75">Margin Left</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium opacity-75">Safe Threshold</span>
          <span className="text-xs font-bold">{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-current opacity-25">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.min(progressPercent, 100)}%`,
              backgroundColor: getProgressColor(),
            }}
          />
        </div>
        <div className="text-xs opacity-75 mt-2">
          {thresholdPct}% threshold
        </div>
      </div>

      {/* Risk Status */}
      <div className={`p-3 rounded-lg ${isAtRisk ? 'bg-red-100' : trendDirection === 'warning' ? 'bg-amber-100' : 'bg-green-100'}`}>
        <div className="flex items-center gap-2">
          {isAtRisk ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-700">
                ⚠️ AT RISK: Rewards costs exceed safe threshold!
              </span>
            </>
          ) : trendDirection === 'warning' ? (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                ⚠️ WARNING: Approaching safe threshold
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700">
                ✓ HEALTHY: Rewards costs within safe range
              </span>
            </>
          )}
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs opacity-60 mt-3 leading-relaxed">
        At {grossMarginPct}% gross margin, rewards costs exceeding {thresholdPct}% of revenue will result in
        margin erosion and potential losses. Current trajectory: {isAtRisk ? 'CRITICAL' : trendDirection === 'warning' ? 'WARNING' : 'SAFE'}.
      </p>
    </div>
  )
}
