import { Suspense, lazy } from 'react'

const RewardsPerformanceAnalytics = lazy(
  () => import('@/features/rewards-analytics/RewardsPerformanceAnalytics'),
)

export default function RewardsPerformanceAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading rewards analytics...</div>}>
      <RewardsPerformanceAnalytics />
    </Suspense>
  )
}
