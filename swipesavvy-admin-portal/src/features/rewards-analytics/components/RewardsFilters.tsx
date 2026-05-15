import MultiSelect from '@/components/ui/MultiSelect'
import Select from '@/components/ui/Select'
import type { RewardsAnalyticsFilters } from '@/types/rewardsAnalytics'
import { RefreshCw } from 'lucide-react'

interface MerchantOption {
  value: string
  label: string
}

interface RewardsFiltersProps {
  filters: RewardsAnalyticsFilters
  merchantOptions: MerchantOption[]
  tierOptions: string[]
  onFiltersChange: (filters: RewardsAnalyticsFilters) => void
  onRefresh: () => void
  isRefreshing: boolean
}

const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' },
]

function formatDateInput(date: string) {
  return date
}

export default function RewardsFilters({
  filters,
  merchantOptions,
  tierOptions,
  onFiltersChange,
  onRefresh,
  isRefreshing,
}: RewardsFiltersProps) {
  const selectedRange = (() => {
    const now = new Date()
    const end = filters.endDate
    const start = filters.startDate

    const today = now.toISOString().slice(0, 10)
    const compareDate = (date: string, daysAgo: number) => {
      const d = new Date(now)
      d.setDate(d.getDate() - daysAgo)
      return d.toISOString().slice(0, 10)
    }

    if (start === compareDate(now.toISOString(), 6) && end === today) return '7d'
    if (start === compareDate(now.toISOString(), 29) && end === today) return '30d'
    if (start === compareDate(now.toISOString(), 89) && end === today) return '90d'
    if (start === compareDate(now.toISOString(), 364) && end === today) return '1y'
    return 'custom'
  })()

  const handleDateRangeChange = (value: string) => {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    let startDate = filters.startDate

    switch (value) {
      case '7d':
        startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        break
      case '30d':
        startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        break
      case '90d':
        startDate = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        break
      case '1y':
        startDate = new Date(now.getTime() - 364 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        break
      case 'custom':
      default:
        startDate = filters.startDate || today
    }

    onFiltersChange({
      ...filters,
      startDate,
      endDate: today,
    })
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <Select
              label="Date range"
              options={DATE_RANGE_OPTIONS}
              value={selectedRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-900">Start date</label>
            <input
              type="date"
              value={formatDateInput(filters.startDate)}
              onChange={(event) => onFiltersChange({ ...filters, startDate: event.target.value })}
              className="h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-900">End date</label>
            <input
              type="date"
              value={formatDateInput(filters.endDate)}
              onChange={(event) => onFiltersChange({ ...filters, endDate: event.target.value })}
              className="h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4" />
          {isRefreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MultiSelect
          label="Merchants"
          placeholder="Select merchants"
          options={merchantOptions}
          values={filters.merchantIds}
          onChange={(merchantIds) => onFiltersChange({ ...filters, merchantIds })}
        />
        <MultiSelect
          label="Tiers"
          placeholder="Select tiers"
          options={tierOptions.map((tier) => ({ value: tier, label: tier }))}
          values={filters.tiers}
          onChange={(tiers) => onFiltersChange({ ...filters, tiers })}
        />
      </div>
    </div>
  )
}
