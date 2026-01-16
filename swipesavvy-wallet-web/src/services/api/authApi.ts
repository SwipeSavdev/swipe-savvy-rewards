import { api, setToken, clearTokens } from './apiClient'
import type { User, LoginRequest, LoginResponse } from '../../types/api'

export const authApi = {
  /**
   * Login with email and password
   * Uses wallet-specific endpoint that returns token directly
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/v1/auth/wallet/login', credentials)
    if (response.token) {
      setToken(response.token)
    }
    return response
  },

  /**
   * Logout - clear tokens
   */
  logout: (): void => {
    clearTokens()
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/api/v1/user/me')
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    return api.put<User>('/api/v1/user/me', data)
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    return api.post('/api/v1/auth/change-password', {
      currentPassword,
      newPassword,
    })
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string): Promise<void> => {
    return api.post('/api/v1/auth/forgot-password', { email })
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    return api.post('/api/v1/auth/reset-password', { token, newPassword })
  },
}
