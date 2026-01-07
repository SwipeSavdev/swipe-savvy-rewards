/**
 * Real API Client for SwipeSavvy Admin Portal
 * 
 * Replaces MockApi with actual HTTP requests to the backend.
 * Handles authentication, error handling, and response formatting.
 */

// Check if we should use mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

// Validate and configure API base URL
function validateApiUrl(): string {
  // If mock API is explicitly enabled, we'll handle it differently
  if (USE_MOCK_API) {
    return 'mock://api' // Dummy URL that we'll intercept
  }
  
  const apiUrl = import.meta.env.VITE_API_BASE_URL
  
  if (!apiUrl && import.meta.env.PROD) {
    throw new Error('VITE_API_BASE_URL environment variable is required in production')
  }
  
  if (apiUrl) {
    try {
      new URL(apiUrl) // Validates URL format
      return apiUrl
    } catch {
      throw new Error(`Invalid API URL: ${apiUrl}`)
    }
  }
  
  // Default: Use the same host as the current page for LAN/localhost access
  // This allows the frontend to reach the backend regardless of IP address
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000`
  }
  
  return 'http://127.0.0.1:8000'
}

// Lazy initialization of API_BASE_URL - ensure it's called at runtime
let API_BASE_URL: string | null = null

function getApiBaseUrl(): string {
  if (!API_BASE_URL) {
    API_BASE_URL = validateApiUrl()
  }
  return API_BASE_URL
}
const TOKEN_KEY = 'admin_auth_token'
const USER_KEY = 'admin_user'

// ============================================================================
// Type Definitions
// ============================================================================

interface ApiErrorDetails {
  code?: string
  [key: string]: unknown
}

export interface ApiError {
  message: string
  status: number
  details?: ApiErrorDetails
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  timestamp: string
}

// ============================================================================
// Loading State Management
// ============================================================================

interface ApiLoadingState {
  loadingCount: number
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

// Simple loading state management without external dependencies
let apiLoadingState: ApiLoadingState = {
  loadingCount: 0,
  isLoading: false,
  startLoading() {
    this.loadingCount++
    this.isLoading = true
  },
  stopLoading() {
    this.loadingCount = Math.max(0, this.loadingCount - 1)
    this.isLoading = this.loadingCount > 0
  }
}

export function isApiLoading(): boolean {
  return apiLoadingState.isLoading
}

export function getLoadingCount(): number {
  return apiLoadingState.loadingCount
}

// ============================================================================
// Error Handling
// ============================================================================

function handleError(error: any): ApiError {
  // If it's already an Error object with just a message
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 0,
    }
  }
  
  // If it has a response structure (from our fetch error throwing)
  if (error.response) {
    return {
      message: error.response.data?.detail || error.message,
      status: error.response.status,
      details: error.response.data,
    }
  }

  // If it's our custom error object from fetch
  if (error.message) {
    return {
      message: error.message,
      status: error.status || 0,
      details: error.details,
    }
  }

  return {
    message: 'An error occurred',
    status: 0,
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}, retries = 3): Promise<any> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const token = localStorage.getItem(TOKEN_KEY)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      apiLoadingState.startLoading()

      const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      })

      // Handle 401 - Token expired, try to refresh
      if (response.status === 401) {
        const storedToken = localStorage.getItem(TOKEN_KEY)
        if (storedToken) {
          try {
            const refreshResponse = await fetch(`${getApiBaseUrl()}/api/v1/admin/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: storedToken }),
            })

            if (refreshResponse.ok) {
              const data = await refreshResponse.json()
              localStorage.setItem(TOKEN_KEY, data.token)
              clearTimeout(timeoutId)
              apiLoadingState.stopLoading()
              
              // Retry original request with new token
              return fetchApi(endpoint, options, 1)
            }
          } catch (error) {
            // Refresh failed - redirect to login
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
          }
        }
      }

      if (!response.ok) {
        // Don't retry on auth errors or 4xx client errors (except 408, 429)
        if (response.status >= 400 && response.status < 500 && 
            response.status !== 408 && response.status !== 429) {
          const data = await response.json().catch(() => ({}))
          clearTimeout(timeoutId)
          apiLoadingState.stopLoading()
          const errorMessage = data?.detail || response.statusText || `HTTP ${response.status}`
          console.error('[FetchAPI] 4xx Error:', { status: response.status, errorMessage, data, endpoint })
          const err = new Error(errorMessage) as any
          err.status = response.status
          err.details = data
          throw err
        }

        // Retryable errors: 5xx or rate limit (429) or timeout (408)
        if (attempt < retries - 1) {
          const delay = 1000 * Math.pow(2, attempt) // Exponential backoff
          await new Promise(r => setTimeout(r, delay))
          continue
        }

        const data = await response.json().catch(() => ({}))
        clearTimeout(timeoutId)
        apiLoadingState.stopLoading()
        const errorMessage = data?.detail || response.statusText || `HTTP ${response.status}`
        console.error('[FetchAPI] 5xx Error:', { status: response.status, errorMessage, data, endpoint })
        const err = new Error(errorMessage) as any
        err.status = response.status
        err.details = data
        throw err
      }

      clearTimeout(timeoutId)
      const result = await response.json()
      apiLoadingState.stopLoading()
      return result

    } catch (error: any) {
      clearTimeout(timeoutId)
      apiLoadingState.stopLoading()

      if (error.name === 'AbortError') {
        // Retry on timeout
        if (attempt < retries - 1) {
          const delay = 1000 * Math.pow(2, attempt)
          await new Promise(r => setTimeout(r, delay))
          continue
        }
        throw new Error(`Request timeout after ${retries} attempts to ${endpoint}`)
      }

      // Non-retryable error
      throw error
    }
  }
}

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  async login(email: string, password: string) {
    // Use mock API if enabled
    if (USE_MOCK_API) {
      const mockApi = await import('./mockApi')
      return mockApi.login({ email, password })
    }

    try {
      console.log('[AuthAPI] Login attempt:', { email, apiUrl: API_BASE_URL })
      const data = await fetchApi('/api/v1/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      console.log('[AuthAPI] Login success:', data)
      const token = data.token || data.session?.token
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.session.user))

      return data
    } catch (error: any) {
      console.error('[AuthAPI] Login error:', error)
      const message = error?.message || error?.response?.data?.detail || 'Login failed'
      throw new Error(message)
    }
  },

  async logout() {
    try {
      await fetchApi('/api/v1/admin/auth/logout', { method: 'POST' })
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      return { success: true }
    } catch (error) {
      throw handleError(error)
    }
  },

  async refreshToken() {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) throw new Error('No token available')

      const data = await fetchApi('/api/v1/admin/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })

      localStorage.setItem(TOKEN_KEY, data.token)
      return data
    } catch (error) {
      throw handleError(error)
    }
  },

  async getCurrentUser() {
    try {
      return await fetchApi('/api/v1/admin/auth/me')
    } catch (error) {
      throw handleError(error)
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getStoredUser() {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },
}

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardApi = {
  async getOverview() {
    try {
      return await fetchApi('/api/v1/admin/dashboard/overview')
    } catch (error) {
      throw handleError(error)
    }
  },

  async getAnalyticsOverview() {
    try {
      return await fetchApi('/api/v1/admin/analytics/overview')
    } catch (error) {
      throw handleError(error)
    }
  },

  async getTransactionsChart(days = 30) {
    try {
      return await fetchApi(`/api/v1/admin/analytics/transactions?days=${days}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getRevenueChart(days = 30) {
    try {
      return await fetchApi(`/api/v1/admin/analytics/revenue?days=${days}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getOnboardingFunnel() {
    try {
      return await fetchApi('/api/v1/admin/analytics/funnel/onboarding')
    } catch (error) {
      throw handleError(error)
    }
  },

  async getCohortRetention(cohortWeek?: string) {
    try {
      const params = cohortWeek ? `?cohort_week=${cohortWeek}` : ''
      return await fetchApi(`/api/v1/admin/analytics/cohort/retention${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },
}

// ============================================================================
// Support API
// ============================================================================

export const supportApi = {
  async getStats() {
    try {
      return await fetchApi('/api/v1/admin/support/stats')
    } catch (error) {
      throw handleError(error)
    }
  },
}

// ============================================================================
// Placeholder APIs (to be implemented in subsequent phases)
// ============================================================================

export const usersApi = {
  async listUsers(page = 1, perPage = 25, status?: string, search?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(status && { status }),
        ...(search && { search }),
      })
      return await fetchApi(`/api/v1/admin/users?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getUser(userId: string) {
    try {
      return await fetchApi(`/api/v1/admin/users/${userId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async createUser(data: { email: string; name: string; phone?: string; invite?: boolean }) {
    try {
      return await fetchApi('/api/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateUserStatus(userId: string, status: string, reason?: string) {
    try {
      return await fetchApi(`/api/v1/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deleteUser(userId: string) {
    try {
      return await fetchApi(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async getStats() {
    try {
      return await fetchApi('/api/v1/admin/users/stats/overview')
    } catch (error) {
      throw handleError(error)
    }
  },
}

export const merchantsApi = {
  async listMerchants(page = 1, perPage = 25, status?: string, search?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(status && { status }),
        ...(search && { search }),
      })
      return await fetchApi(`/api/v1/admin/merchants?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getMerchant(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateMerchantStatus(merchantId: string, status: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async createMerchant(data: {
    name: string
    email: string
    phone?: string
    website?: string
    country?: string
    location?: string
    business_type?: string
  }) {
    try {
      return await fetchApi('/api/v1/admin/merchants', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateMerchant(merchantId: string, data: {
    name?: string
    email?: string
    phone?: string
    website?: string
    country?: string
    location?: string
    business_type?: string
  }) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deleteMerchant(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },
}

export const adminUsersApi = {
  async listAdminUsers(page = 1, perPage = 25, role?: string, search?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(role && { role }),
        ...(search && { search }),
      })
      return await fetchApi(`/api/v1/admin/users?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getAdminUser(userId: string) {
    try {
      return await fetchApi(`/api/v1/admin/users/${userId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async inviteAdminUser(data: { email: string; name: string; role: string }) {
    try {
      return await fetchApi('/api/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateAdminUserRole(userId: string, role: string) {
    try {
      return await fetchApi(`/api/v1/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async createAdminUser(data: { email: string; full_name: string; password: string; role: string }) {
    try {
      return await fetchApi('/api/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deleteAdminUser(userId: string) {
    try {
      return await fetchApi(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },
}

export const supportTicketsApi = {
  async listTickets(page = 1, perPage = 25, status?: string, category?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(status && { status }),
        ...(category && { category }),
      })
      return await fetchApi(`/api/v1/admin/support/tickets?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getTicket(ticketId: string) {
    try {
      return await fetchApi(`/api/v1/admin/support/tickets/${ticketId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateTicketStatus(ticketId: string, status: string) {
    try {
      return await fetchApi(`/api/v1/admin/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async addNote(ticketId: string, note: string) {
    try {
      return await fetchApi(`/api/v1/admin/support/tickets/${ticketId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: note }),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async createTicket(data: any) {
    try {
      return await fetchApi('/api/v1/admin/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateTicket(ticketId: string, data: any) {
    try {
      return await fetchApi(`/api/v1/admin/support/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deleteTicket(ticketId: string) {
    try {
      return await fetchApi(`/api/v1/admin/support/tickets/${ticketId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },
}

export const featureFlagsApi = {
  async listFlags(page = 1, perPage = 200, search?: string, environment?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(search && { search }),
        ...(environment && { environment }),
      })
      const result = await fetchApi(`/api/v1/admin/feature-flags?${params}`)
      return result
    } catch (error: any) {
      console.warn('[featureFlagsApi] Real API failed, falling back to mock data:', error?.message)
      // Fallback to mock API
      const { getFeatureFlags } = await import('./mockApi')
      const mockResult = await getFeatureFlags({ page, pageSize: perPage, search })
      return { flags: mockResult.items }
    }
  },

  async getFlag(flagId: string) {
    try {
      return await fetchApi(`/api/v1/admin/feature-flags/${flagId}`)
    } catch (error: any) {
      console.warn('[featureFlagsApi] Real API failed for getFlag:', error?.message)
      throw handleError(error)
    }
  },

  async createFlag(data: {
    key: string
    name: string
    description?: string
    category?: string
    enabled?: boolean
    rolloutPercentage?: number
    ownerEmail?: string
  }) {
    try {
      return await fetchApi('/api/v1/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error: unknown) {
      console.error('[featureFlagsApi] Failed to create flag:', error instanceof Error ? error.message : error)
      throw handleError(error)
    }
  },

  async updateFlag(flagId: string, data: {
    name?: string
    description?: string
    category?: string
    enabled?: boolean
    rolloutPercentage?: number
    ownerEmail?: string
  }) {
    try {
      return await fetchApi(`/api/v1/admin/feature-flags/${flagId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error: unknown) {
      console.error('[featureFlagsApi] Failed to update flag:', error instanceof Error ? error.message : error)
      throw handleError(error)
    }
  },

  async deleteFlag(flagId: string) {
    try {
      return await fetchApi(`/api/v1/admin/feature-flags/${flagId}`, {
        method: 'DELETE',
      })
    } catch (error: any) {
      console.error('[featureFlagsApi] Failed to delete flag:', error?.message)
      throw handleError(error)
    }
  },

  async toggleFlag(flagId: string, enabled: boolean) {
    try {
      return await fetchApi(`/api/v1/admin/feature-flags/${flagId}/toggle`, {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
      })
    } catch (error: any) {
      console.warn('[featureFlagsApi] Real API failed for toggleFlag:', error?.message)
      throw handleError(error)
    }
  },

  async updateRollout(flagId: string, rollout: number) {
    try {
      return await fetchApi(`/api/v1/admin/feature-flags/${flagId}/rollout`, {
        method: 'PUT',
        body: JSON.stringify({ rollout }),
      })
    } catch (error: any) {
      console.warn('[featureFlagsApi] Real API failed for updateRollout:', error?.message)
      throw handleError(error)
    }
  },

  async getStats() {
    try {
      return await fetchApi('/api/v1/admin/feature-flags/stats/overview')
    } catch (error: any) {
      console.warn('[featureFlagsApi] Real API failed for getStats:', error?.message)
      return { total_flags: 0, enabled_flags: 0, disabled_flags: 0, avg_rollout: 0 }
    }
  },
}

export const aiCampaignsApi = {
  async listCampaigns(page = 1, perPage = 25) {
    try {
      const params = new URLSearchParams({
        offset: ((page - 1) * perPage).toString(),
        limit: perPage.toString(),
      })
      return await fetchApi(`/api/marketing/campaigns?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getCampaign(campaignId: string) {
    try {
      return await fetchApi(`/api/v1/admin/ai-campaigns/${campaignId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async createCampaign(data: any) {
    try {
      const params = new URLSearchParams({
        campaign_name: data.name || '',
        campaign_type: data.type || '',
        offer_type: data.offer_type || '',
        offer_value: (data.offer_value || 0).toString(),
        offer_unit: data.offer_unit || 'percentage',
        description: data.description || '',
        target_pattern: data.target_pattern || '',
        duration_days: (data.duration_days || 30).toString(),
      })
      return await fetchApi(`/api/marketing/campaigns/manual?${params}`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateCampaignStatus(campaignId: string, status: string) {
    try {
      return await fetchApi(`/api/v1/admin/ai-campaigns/${campaignId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async getCampaignMetrics(campaignId: string) {
    try {
      return await fetchApi(`/api/v1/admin/ai-campaigns/${campaignId}/metrics`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async duplicateCampaign(campaignId: string) {
    try {
      return await fetchApi(`/api/v1/admin/ai-campaigns/${campaignId}/duplicate`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async publishCampaign(campaignId: string) {
    try {
      return await fetchApi(`/api/marketing/campaigns/${campaignId}/publish`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async generateCopy(data: any) {
    try {
      return await fetchApi(`/api/marketing/ai/generate-copy`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async getAudienceInsights(data: any) {
    try {
      return await fetchApi(`/api/marketing/ai/audience-insights`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateCampaign(campaignId: string, data: any) {
    try {
      const params = new URLSearchParams()
      if (data.name) params.append('name', data.name)
      if (data.description) params.append('description', data.description)
      if (data.campaign_type) params.append('campaign_type', data.campaign_type)
      if (data.status) params.append('status', data.status)
      
      const url = `/api/marketing/campaigns/${campaignId}?${params}`
      console.log('updateCampaign API call - URL:', url)
      console.log('updateCampaign API call - data:', data)
      console.log('updateCampaign API call - params:', Object.fromEntries(params))
      
      const response = await fetchApi(url, {
        method: 'PUT',
      })
      
      console.log('updateCampaign API response:', response)
      return response
    } catch (error) {
      console.error('updateCampaign API error:', error)
      throw handleError(error)
    }
  },
}

export const auditLogsApi = {
  async listLogs(page = 1, perPage = 50, action?: string, actor?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(action && { action }),
        ...(actor && { actor }),
      })
      return await fetchApi(`/api/v1/admin/audit-logs?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getLog(logId: string) {
    try {
      return await fetchApi(`/api/v1/admin/audit-logs/${logId}`)
    } catch (error) {
      throw handleError(error)
    }
  },
}

export const settingsApi = {
  async getSettings() {
    try {
      return await fetchApi('/api/v1/admin/settings')
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateSettings(data: any) {
    try {
      // Update general settings category
      const result = await fetchApi('/api/v1/admin/settings/general', {
        method: 'PUT',
        body: JSON.stringify({
          platformName: data.name || 'SwipeSavvy',
          platformDescription: data.description || '',
          timezone: data.timezone || 'America/Los_Angeles',
          language: (data.locales && data.locales[0]) || 'en-US',
        }),
      })
      return result
    } catch (error) {
      throw handleError(error)
    }
  },

  async uploadBrandingAsset(type: string, file: File) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      return await fetch(`${getApiBaseUrl()}/api/v1/admin/settings/branding/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        },
      }).then((r) => r.json())
    } catch (error) {
      throw handleError(error)
    }
  },

  async getApiQuotas() {
    try {
      return await fetchApi('/api/v1/admin/settings/api-quotas')
    } catch (error) {
      throw handleError(error)
    }
  },
}

// ============================================================================
// RBAC (Role-Based Access Control) API
// ============================================================================

export const rbacApi = {
  // Roles
  async listRoles(page = 1, perPage = 25, status?: string, search?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(status && { status }),
        ...(search && { search }),
      })
      return await fetchApi(`/api/v1/admin/roles?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getRole(roleId: string) {
    try {
      return await fetchApi(`/api/v1/admin/roles/${roleId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async createRole(data: {
    name: string
    display_name: string
    description?: string
    permissions: string[]
  }) {
    try {
      return await fetchApi('/api/v1/admin/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateRole(roleId: string, data: {
    display_name?: string
    description?: string
    permissions?: string[]
    status?: string
  }) {
    try {
      return await fetchApi(`/api/v1/admin/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deleteRole(roleId: string) {
    try {
      return await fetchApi(`/api/v1/admin/roles/${roleId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  // Policies
  async listPolicies(page = 1, perPage = 25, status?: string, resource?: string, search?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(status && { status }),
        ...(resource && { resource }),
        ...(search && { search }),
      })
      return await fetchApi(`/api/v1/admin/policies?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getPolicy(policyId: string) {
    try {
      return await fetchApi(`/api/v1/admin/policies/${policyId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async createPolicy(data: {
    name: string
    display_name: string
    description?: string
    resource: string
    actions: string[]
    conditions?: Record<string, any>
    effect?: string
    priority?: number
  }) {
    try {
      return await fetchApi('/api/v1/admin/policies', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updatePolicy(policyId: string, data: {
    display_name?: string
    description?: string
    resource?: string
    actions?: string[]
    conditions?: Record<string, any>
    effect?: string
    priority?: number
    status?: string
  }) {
    try {
      return await fetchApi(`/api/v1/admin/policies/${policyId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deletePolicy(policyId: string) {
    try {
      return await fetchApi(`/api/v1/admin/policies/${policyId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  // Permissions
  async listPermissions(page = 1, perPage = 100, category?: string, resource?: string, search?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(category && { category }),
        ...(resource && { resource }),
        ...(search && { search }),
      })
      return await fetchApi(`/api/v1/admin/permissions?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getPermission(permissionId: string) {
    try {
      return await fetchApi(`/api/v1/admin/permissions/${permissionId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async createPermission(data: {
    name: string
    display_name: string
    description?: string
    category: string
    resource: string
    action: string
  }) {
    try {
      return await fetchApi('/api/v1/admin/permissions', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deletePermission(permissionId: string) {
    try {
      return await fetchApi(`/api/v1/admin/permissions/${permissionId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  // Stats & Utilities
  async getRbacStats() {
    try {
      return await fetchApi('/api/v1/admin/rbac/stats')
    } catch (error) {
      throw handleError(error)
    }
  },

  async migrateRbacTables() {
    try {
      return await fetchApi('/api/v1/admin/rbac/migrate', {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async seedRbacData() {
    try {
      return await fetchApi('/api/v1/admin/rbac/seed', {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },
}

// ============================================================================
// Backward Compatibility - apiClient object
// ============================================================================

// Axios-style HTTP methods for backward compatibility
async function get(endpoint: string, config?: any) {
  const headers = {
    ...(config?.headers || {}),
  }
  const response = await fetchApi(endpoint, { headers })
  return { data: response, status: 200 }
}

async function post(endpoint: string, data?: any, config?: any) {
  const headers = {
    ...(config?.headers || {}),
  }
  const response = await fetchApi(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    headers,
  })
  return { data: response, status: 200 }
}

async function put(endpoint: string, data?: any, config?: any) {
  const headers = {
    ...(config?.headers || {}),
  }
  const response = await fetchApi(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers,
  })
  return { data: response, status: 200 }
}

export const apiClient = {
  get,
  post,
  put,
  authApi,
  supportApi,
  dashboardApi,
  usersApi,
  merchantsApi,
  adminUsersApi,
  supportTicketsApi,
  featureFlagsApi,
  aiCampaignsApi,
  auditLogsApi,
  settingsApi,
  rbacApi,
}

// ============================================================================
// Utility Functions
// ============================================================================

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAuthHeader() {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}
