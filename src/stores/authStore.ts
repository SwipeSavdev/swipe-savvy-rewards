import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('admin_token'),
  isAuthenticated: !!localStorage.getItem('admin_token'),

  login: async (email: string, password: string) => {
    try {
      // Demo mode - no backend required
      if (!email || !password) {
        throw new Error('Email and password required')
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      const demoToken = 'demo_token_' + Date.now()
      const demoUser = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        role: 'admin',
      }

      localStorage.setItem('admin_token', demoToken)
      set({ 
        user: demoUser, 
        token: demoToken, 
        isAuthenticated: true 
      })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
