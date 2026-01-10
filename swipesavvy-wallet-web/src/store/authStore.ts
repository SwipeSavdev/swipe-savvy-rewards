import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  accountNumber: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email: string, _password: string) => {
    // Mock login - in production, call real API
    const mockUser: User = {
      id: 'user-001',
      email,
      name: 'John Doe',
      accountNumber: '****1234',
    }

    const mockToken = 'mock-token-' + Date.now()

    localStorage.setItem('token', mockToken)
    localStorage.setItem('user', JSON.stringify(mockUser))

    set({ user: mockUser, token: mockToken, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  setUser: (user: User) => {
    set({ user })
  },
}))
