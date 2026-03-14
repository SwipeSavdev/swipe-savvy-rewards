import { api, setToken, clearTokens } from './apiClient'
import type { User, LoginRequest, LoginResponse, VerifyOtpResponse } from '../../types/api'

const REFRESH_TOKEN_KEY = 'wallet_refresh_token'

export const authApi = {
  /**
   * Login with email and password.
   * Returns OTP requirement — tokens come from verifyLoginOtp.
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/api/v1/auth/login', credentials)
  },

  /**
   * Verify OTP code after login to receive JWT tokens.
   */
  verifyLoginOtp: async (userId: string, code: string): Promise<VerifyOtpResponse> => {
    const response = await api.post<VerifyOtpResponse>('/api/v1/auth/verify-login-otp', {
      user_id: userId,
      code,
    })
    if (response.access_token) {
      setToken(response.access_token)
      if (response.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)
      }
    }
    return response
  },

  /**
   * Resend OTP code
   */
  resendLoginOtp: async (userId: string): Promise<{ success: boolean; message?: string }> => {
    return api.post('/api/v1/auth/resend-login-otp', { user_id: userId })
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
      current_password: currentPassword,
      new_password: newPassword,
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
    return api.post('/api/v1/auth/reset-password', { token, new_password: newPassword })
  },
}
