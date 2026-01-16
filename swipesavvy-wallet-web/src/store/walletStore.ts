import { create } from 'zustand'
import { walletApi } from '../services/api'
import type { Account, WalletBalance, PaymentMethod } from '../types/api'

interface WalletState {
  accounts: Account[]
  balance: WalletBalance | null
  paymentMethods: PaymentMethod[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchAccounts: () => Promise<void>
  fetchBalance: () => Promise<void>
  fetchPaymentMethods: () => Promise<void>
  addMoney: (amount: number, paymentMethodId: string) => Promise<void>
  withdraw: (amount: number, bankAccountId: string) => Promise<void>
  addPaymentMethod: (token: string, type: PaymentMethod['type']) => Promise<void>
  removePaymentMethod: (id: string) => Promise<void>
  setDefaultPaymentMethod: (id: string) => Promise<void>
  updateBalance: (balance: Partial<WalletBalance>) => void
  clearError: () => void
}

export const useWalletStore = create<WalletState>((set, get) => ({
  accounts: [],
  balance: null,
  paymentMethods: [],
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null })
    try {
      const accounts = await walletApi.getAccounts()
      set({ accounts, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch accounts'
      set({ error: message, isLoading: false })
    }
  },

  fetchBalance: async () => {
    set({ isLoading: true, error: null })
    try {
      const balance = await walletApi.getWalletBalance()
      set({ balance, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch balance'
      set({ error: message, isLoading: false })
    }
  },

  fetchPaymentMethods: async () => {
    set({ isLoading: true, error: null })
    try {
      const paymentMethods = await walletApi.getPaymentMethods()
      set({ paymentMethods, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch payment methods'
      set({ error: message, isLoading: false })
    }
  },

  addMoney: async (amount: number, paymentMethodId: string) => {
    set({ isLoading: true, error: null })
    try {
      await walletApi.addMoney(amount, paymentMethodId)
      // Refetch balance after transaction
      await get().fetchBalance()
      set({ isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add money'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  withdraw: async (amount: number, bankAccountId: string) => {
    set({ isLoading: true, error: null })
    try {
      await walletApi.withdraw(amount, bankAccountId)
      // Refetch balance after transaction
      await get().fetchBalance()
      set({ isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to withdraw'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  addPaymentMethod: async (_token: string, _type: PaymentMethod['type']) => {
    set({ isLoading: true, error: null })
    try {
      // Note: addPaymentMethod API not yet implemented - refetch methods instead
      await get().fetchPaymentMethods()
      set({ isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add payment method'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  removePaymentMethod: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await walletApi.removePaymentMethod(id)
      set({
        paymentMethods: get().paymentMethods.filter((m) => m.id !== id),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove payment method'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  setDefaultPaymentMethod: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await walletApi.setDefaultPaymentMethod(id)
      set({
        paymentMethods: get().paymentMethods.map((m) => ({
          ...m,
          isDefault: m.id === id,
        })),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set default'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateBalance: (balanceUpdate: Partial<WalletBalance>) => {
    const currentBalance = get().balance
    if (currentBalance) {
      set({
        balance: { ...currentBalance, ...balanceUpdate },
      })
    }
  },

  clearError: () => set({ error: null }),
}))
