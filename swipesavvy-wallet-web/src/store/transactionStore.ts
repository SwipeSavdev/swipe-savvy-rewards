import { create } from 'zustand'
import { transactionsApi, type TransactionFilters } from '../services/api'
import type { Transaction } from '../types/api'

interface TransactionState {
  transactions: Transaction[]
  selectedTransaction: Transaction | null
  filters: TransactionFilters
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  isLoading: boolean
  error: string | null

  // Actions
  fetchTransactions: (reset?: boolean) => Promise<void>
  fetchMore: () => Promise<void>
  setFilters: (filters: Partial<TransactionFilters>) => void
  clearFilters: () => void
  selectTransaction: (transaction: Transaction | null) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  exportTransactions: (format: 'csv' | 'pdf') => Promise<string>
  clearError: () => void
}

const defaultFilters: TransactionFilters = {}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  selectedTransaction: null,
  filters: defaultFilters,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  isLoading: false,
  error: null,

  fetchTransactions: async (reset = true) => {
    const { filters, pagination } = get()
    set({ isLoading: true, error: null })

    try {
      const response = await transactionsApi.getTransactions({
        filters,
        page: reset ? 1 : pagination.page,
        limit: pagination.limit,
      })

      set({
        transactions: reset ? response.data : [...get().transactions, ...response.data],
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.data.length === response.limit,
        },
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch transactions'
      set({ error: message, isLoading: false })
    }
  },

  fetchMore: async () => {
    const { pagination, isLoading } = get()
    if (isLoading || !pagination.hasMore) return

    set((state) => ({
      pagination: { ...state.pagination, page: pagination.page + 1 },
    }))
    await get().fetchTransactions(false)
  },

  setFilters: (newFilters: Partial<TransactionFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }))
    get().fetchTransactions(true)
  },

  clearFilters: () => {
    set({ filters: defaultFilters })
    get().fetchTransactions(true)
  },

  selectTransaction: (transaction: Transaction | null) => {
    set({ selectedTransaction: transaction })
  },

  addTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
      pagination: {
        ...state.pagination,
        total: state.pagination.total + 1,
      },
    }))
  },

  updateTransaction: (id: string, updates: Partial<Transaction>) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      selectedTransaction:
        state.selectedTransaction?.id === id
          ? { ...state.selectedTransaction, ...updates }
          : state.selectedTransaction,
    }))
  },

  exportTransactions: async (format: 'csv' | 'pdf') => {
    const { filters } = get()
    set({ isLoading: true, error: null })

    try {
      const blob = await transactionsApi.exportTransactions({ format, filters })
      set({ isLoading: false })
      // Create download URL from blob
      return URL.createObjectURL(blob)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
