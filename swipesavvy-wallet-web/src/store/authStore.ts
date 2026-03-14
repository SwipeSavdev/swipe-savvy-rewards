import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'
import type { User } from '../types/api'

const TOKEN_KEY = 'wallet_auth_token'
const REFRESH_TOKEN_KEY = 'wallet_refresh_token'

interface PendingOtp {
  userId: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  pendingOtp: PendingOtp | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  verifyOtp: (code: string) => Promise<void>
  resendOtp: () => Promise<void>
  cancelOtp: () => void
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingOtp: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login({ email, password })
          if (response.otp_required && response.user_id) {
            set({
              pendingOtp: { userId: response.user_id, email },
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          const message = error instanceof Error
            ? error.message
            : (error as { message?: string })?.message || 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      verifyOtp: async (code: string) => {
        const { pendingOtp } = get()
        if (!pendingOtp) return

        set({ isLoading: true, error: null })
        try {
          const response = await authApi.verifyLoginOtp(pendingOtp.userId, code)
          localStorage.setItem(TOKEN_KEY, response.access_token)
          if (response.refresh_token) {
            localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)
          }
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            pendingOtp: null,
          })
        } catch (error) {
          const message = error instanceof Error
            ? error.message
            : (error as { message?: string })?.message || 'Verification failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      resendOtp: async () => {
        const { pendingOtp } = get()
        if (!pendingOtp) return

        set({ isLoading: true, error: null })
        try {
          await authApi.resendLoginOtp(pendingOtp.userId)
          set({ isLoading: false })
        } catch (error) {
          const message = error instanceof Error
            ? error.message
            : (error as { message?: string })?.message || 'Failed to resend code'
          set({ error: message, isLoading: false })
        }
      },

      cancelOtp: () => {
        set({ pendingOtp: null, error: null })
      },

      logout: () => {
        authApi.logout()
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          pendingOtp: null,
        })
      },

      register: async (_name: string, _email: string, _password: string) => {
        set({ isLoading: true, error: null })
        try {
          throw new Error('Registration not implemented')
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true })
        try {
          const user = await authApi.getCurrentUser()
          set({ user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authApi.updateProfile(updates)
          set({ user, isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Update failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      refreshToken: async () => {
        try {
          const user = await authApi.getCurrentUser()
          set({ user })
        } catch {
          get().logout()
        }
      },

      clearError: () => set({ error: null }),

      setToken: (token: string) => {
        localStorage.setItem(TOKEN_KEY, token)
        set({ token, isAuthenticated: true })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
