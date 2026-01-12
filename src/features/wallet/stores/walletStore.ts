/**
 * Wallet Store - Zustand store for wallet state management
 * Handles wallet balance, transactions, and payment methods
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  recipientName?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  lastFour: string;
  brand?: string;
  bankName?: string;
  isDefault: boolean;
  expiryDate?: string;
}

interface WalletState {
  // State
  balance: WalletBalance;
  transactions: WalletTransaction[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  setBalance: (balance: WalletBalance) => void;
  setTransactions: (transactions: WalletTransaction[]) => void;
  addTransaction: (transaction: WalletTransaction) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  balance: { available: 0, pending: 0, currency: 'USD' },
  transactions: [],
  paymentMethods: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setBalance: (balance) =>
        set({ balance, lastUpdated: new Date().toISOString() }),

      setTransactions: (transactions) => set({ transactions }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),

      setPaymentMethods: (paymentMethods) => set({ paymentMethods }),

      addPaymentMethod: (method) =>
        set((state) => ({
          paymentMethods: [...state.paymentMethods, method],
        })),

      removePaymentMethod: (id) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.filter((m) => m.id !== id),
        })),

      setDefaultPaymentMethod: (id) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.map((m) => ({
            ...m,
            isDefault: m.id === id,
          })),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        balance: state.balance,
        paymentMethods: state.paymentMethods,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
