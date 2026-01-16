/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number with commas
 */
export function formatNumber(
  num: number,
  options?: { decimals?: number; locale?: string }
): string {
  const { decimals = 0, locale = 'en-US' } = options || {}
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format number in compact notation (1.2K, 3.4M, etc.)
 */
export function formatCompact(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}

/**
 * Format percentage
 */
export function formatPercent(
  value: number,
  decimals: number = 1
): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

/**
 * Format percentage (alias for formatPercent without sign)
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date | string | undefined | null): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date

  // Check for invalid date
  if (Number.isNaN(d.getTime())) return ''

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format date as readable string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }

  return d.toLocaleDateString('en-US', optionsMap[format])
}

/**
 * Format card number with masking
 */
export function formatCardNumber(number: string): string {
  const last4 = number.slice(-4)
  return `•••• •••• •••• ${last4}`
}

/**
 * Mask account number
 */
export function maskAccountNumber(number: string): string {
  const last4 = number.slice(-4)
  return `****${last4}`
}
