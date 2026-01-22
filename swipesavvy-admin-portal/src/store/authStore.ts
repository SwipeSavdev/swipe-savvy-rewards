import { Api } from '@/services/api'
import type { AuthUser } from '@/types/auth'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (_email: string, _password: string) => Promise<void>
  logout: () => void
  autoLoginWithDemo: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const res = await Api.authApi.login(email, password)
          set({
            user: res.session.user,
            token: res.session.token,
            isAuthenticated: true,
            loading: false,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed.'
          console.error('authStore: Login error:', message)
          set({ error: message, loading: false, user: null, token: null, isAuthenticated: false })
        }
      },
      autoLoginWithDemo: async () => {
        const { isAuthenticated } = get()
        if (isAuthenticated) {
          return
        }
        // Add a small delay to prevent rapid repeated login attempts that trigger rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
        try {
          await get().login('admin@swipesavvy.com', 'SwipeSavvy2025!')
        } catch (_err) {
          // Don't throw - let the user login manually from the login page
        }
      },
      logout: () => {
        if (get().isAuthenticated) {
          // Optionally log to audit service in a real implementation.
        }
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'ss_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
