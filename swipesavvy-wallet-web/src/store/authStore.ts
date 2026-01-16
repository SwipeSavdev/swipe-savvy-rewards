import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'
import type { User } from '../types/api'

const TOKEN_KEY = 'wallet_auth_token'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
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

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login({ email, password })
          localStorage.setItem(TOKEN_KEY, response.token)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: () => {
        authApi.logout()
        localStorage.removeItem(TOKEN_KEY)
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      register: async (_name: string, _email: string, _password: string) => {
        set({ isLoading: true, error: null })
        try {
          // Registration endpoint would be added to authApi when needed
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
        // Token refresh is handled automatically in apiClient
        // This is a placeholder for manual refresh if needed
        try {
          // Fetch profile to verify token is valid
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
