import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatCompact,
  formatPercent,
  formatPercentage,
  formatRelativeDate,
  formatDate,
  formatCardNumber,
  maskAccountNumber,
} from './format'

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })

    it('should format negative amounts', () => {
      expect(formatCurrency(-500)).toBe('-$500.00')
    })

    it('should handle different currencies', () => {
      expect(formatCurrency(100, 'EUR', 'de-DE')).toContain('100')
    })

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(100.999)).toBe('$101.00')
      expect(formatCurrency(100.001)).toBe('$100.00')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('should support decimal places option', () => {
      expect(formatNumber(1234.5678, { decimals: 2 })).toBe('1,234.57')
      expect(formatNumber(1234, { decimals: 0 })).toBe('1,234')
    })

    it('should handle zero and negative numbers', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(-5000)).toBe('-5,000')
    })
  })

  describe('formatCompact', () => {
    it('should format large numbers compactly', () => {
      expect(formatCompact(1000)).toBe('1K')
      expect(formatCompact(1500)).toBe('1.5K')
      expect(formatCompact(1000000)).toBe('1M')
    })

    it('should not compact small numbers', () => {
      expect(formatCompact(500)).toBe('500')
    })
  })

  describe('formatPercent', () => {
    it('should format positive percentages with + sign', () => {
      expect(formatPercent(15)).toBe('+15.0%')
      expect(formatPercent(0.5)).toBe('+0.5%')
    })

    it('should format negative percentages', () => {
      expect(formatPercent(-10)).toBe('-10.0%')
    })

    it('should respect decimal places', () => {
      expect(formatPercent(15.567, 2)).toBe('+15.57%')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages without sign', () => {
      expect(formatPercentage(15)).toBe('15.0%')
      expect(formatPercentage(-10)).toBe('-10.0%')
    })

    it('should respect decimal places', () => {
      expect(formatPercentage(15.567, 2)).toBe('15.57%')
    })
  })

  describe('formatRelativeDate', () => {
    it('should return "Today" for today', () => {
      const today = new Date()
      expect(formatRelativeDate(today)).toBe('Today')
    })

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(formatRelativeDate(yesterday)).toBe('Yesterday')
    })

    it('should return "X days ago" for recent dates', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago')
    })

    it('should return formatted date for older dates', () => {
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      const result = formatRelativeDate(twoWeeksAgo)
      expect(result).toMatch(/\w+ \d+/)
    })

    it('should handle string dates', () => {
      const today = new Date().toISOString()
      expect(formatRelativeDate(today)).toBe('Today')
    })

    it('should handle null and undefined', () => {
      expect(formatRelativeDate(null)).toBe('')
      expect(formatRelativeDate(undefined)).toBe('')
    })

    it('should handle invalid dates', () => {
      expect(formatRelativeDate('invalid-date')).toBe('')
    })
  })

  describe('formatDate', () => {
    it('should format in short format', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const result = formatDate(date, 'short')
      expect(result).toContain('Jan')
    })

    it('should format in medium format', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const result = formatDate(date, 'medium')
      expect(result).toContain('Jan')
      expect(result).toContain('2024')
    })

    it('should format in long format', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date, 'long')
      expect(result).toContain('January')
      expect(result).toContain('2024')
    })
  })

  describe('formatCardNumber', () => {
    it('should mask card number showing last 4 digits', () => {
      expect(formatCardNumber('4532123456781234')).toBe('•••• •••• •••• 1234')
    })
  })

  describe('maskAccountNumber', () => {
    it('should mask account number showing last 4 digits', () => {
      expect(maskAccountNumber('123456789012')).toBe('****9012')
    })
  })
})
