import ChartPlaceholder from '@/components/charts/ChartPlaceholder'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import Tabs from '@/components/ui/Tabs'
import ProgressBar from '@/components/ui/ProgressBar'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-xl font-semibold text-[var(--ss-text)]">Analytics</h1>
        <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Performance insights across users, transactions, and revenue.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active users" value={24690} trendPct={4.2} trendDirection="up" />
        <StatCard label="Transactions" value={187420} trendPct={1.1} trendDirection="up" />
        <StatCard label="Revenue" value={412340} format="currency" trendPct={-0.7} trendDirection="down" />
        <StatCard label="Conversion" value={23} format="number" trendPct={0.4} trendDirection="up" />
      </div>

      <Tabs
        variant="underline"
        items={[
          {
            key: 'overview',
            label: 'Overview',
            content: (
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartPlaceholder title="Active Users" subtitle="Last 30 days" />
                <ChartPlaceholder title="Revenue" subtitle="Last 30 days" />
              </div>
            ),
          },
          {
            key: 'funnels',
            label: 'Funnels',
            content: (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-4">
                  <p className="font-headline text-sm font-semibold text-[var(--ss-text)]">Onboarding funnel</p>
                  <p className="mt-1 text-xs text-[var(--ss-text-muted)]">Illustrative placeholder (replace with real data)</p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--ss-text)]">Started</span>
                        <span className="text-[var(--ss-text-muted)]">100%</span>
                      </div>
                      <ProgressBar value={100} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--ss-text)]">KYC completed</span>
                        <span className="text-[var(--ss-text-muted)]">72%</span>
                      </div>
                      <ProgressBar value={72} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--ss-text)]">First transaction</span>
                        <span className="text-[var(--ss-text-muted)]">38%</span>
                      </div>
                      <ProgressBar value={38} />
                    </div>
                  </div>
                </Card>

                <ChartPlaceholder title="Cohort Retention" subtitle="Weekly cohorts" />
              </div>
            ),
          },
          {
            key: 'exports',
            label: 'Exports',
            content: (
              <Card className="p-4">
                <p className="font-headline text-sm font-semibold text-[var(--ss-text)]">Export data</p>
                <p className="mt-1 text-sm text-[var(--ss-text-muted)]">Placeholder: connect to reporting jobs / data warehouse.</p>
                <div className="mt-4 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4 text-sm text-[var(--ss-text-muted)]">
                  Add scheduled exports, CSV download, and API keys here.
                </div>
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}
