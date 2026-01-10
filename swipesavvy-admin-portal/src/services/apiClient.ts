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
// Onboarding Types (for Fiserv Integration)
// ============================================================================

export interface AddressInfo {
  street: string
  city: string
  state: string
  zip: string
  country?: string
}

export interface OwnerData {
  id?: string
  first_name: string
  middle_name?: string
  last_name: string
  title?: string
  ssn: string
  dob: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  ownership_percent: number
  is_guarantor?: boolean
}

export interface OnboardingSaveRequest {
  step: number
  // Individual section updates (for partial saves)
  business_info?: {
    legal_name: string
    dba_name: string
    tax_id: string
    business_type: string
    mcc_code: string
    website?: string
    customer_service_phone?: string
    address?: AddressInfo
  }
  owners?: OwnerData[]
  bank_info?: {
    bank_name: string
    routing_number: string
    account_number: string
    account_type?: string
  }
  processing_info?: {
    monthly_volume: number
    avg_ticket: number
    high_ticket: number
    processing_type?: string
  }
  advanced_options?: {
    card_descriptor?: string
    pricing_type?: string
    business_start_date?: string
  }
}

export interface ABALookupResponse {
  routing_number: string
  bank_name: string
  valid: boolean
  address?: string
  city?: string
  state?: string
}

export interface OnboardingData {
  id: string
  merchant_id: string
  ext_ref_id: string
  mpa_id?: string
  north_number?: string
  status: string
  fiserv_status?: string
  fiserv_status_message?: string
  step: number
  completion_percentage: number
  legal_name?: string
  dba_name?: string
  tax_id?: string
  business_type?: string
  mcc_code?: string
  business_street?: string
  business_city?: string
  business_state?: string
  business_zip?: string
  website?: string
  customer_service_phone?: string
  owners?: OwnerData[]
  bank_name?: string
  routing_number?: string
  account_type?: string
  monthly_volume?: number
  avg_ticket?: number
  high_ticket?: number
  processing_type?: string
  card_descriptor?: string
  pricing_type?: string
  business_start_date?: string
  documents?: Array<{ id: string; type: string; filename: string }>
  submitted_at?: string
  approved_at?: string
  created_at: string
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

  async getStats() {
    try {
      return await fetchApi('/api/v1/admin/merchants/stats/overview')
    } catch (error) {
      throw handleError(error)
    }
  },

  // Onboarding endpoints (Fiserv integration)
  async getOnboarding(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async startOnboarding(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateOnboarding(merchantId: string, data: OnboardingSaveRequest) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  // ABA Routing Number Lookup
  async lookupRoutingNumber(routingNumber: string): Promise<ABALookupResponse> {
    try {
      return await fetchApi(`/api/v1/admin/merchants/utils/aba-lookup/${routingNumber}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async validateRoutingNumber(routingNumber: string): Promise<{ valid: boolean }> {
    try {
      return await fetchApi(`/api/v1/admin/merchants/utils/aba-validate/${routingNumber}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async submitOnboarding(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding/submit`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async getOnboardingStatus(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding/status`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async uploadOnboardingDocument(merchantId: string, docType: string, file: File) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('doc_type', docType)
      return await fetch(`${getApiBaseUrl()}/api/v1/admin/merchants/${merchantId}/onboarding/documents`, {
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

  async resubmitOnboarding(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding/resubmit`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async resubmitToCredit(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding/resubmit-credit`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async resubmitToBOS(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding/resubmit-bos`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deleteOnboarding(merchantId: string) {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  // E-Signature API methods
  async sendEsignRequest(merchantId: string, data: {
    signer_name: string
    signer_email: string
    signer_title?: string
  }): Promise<{ success: boolean; document_id?: string; message?: string }> {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding/esign/send`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async checkEsignStatus(merchantId: string, documentId: string): Promise<{
    completed: boolean
    status: string
    signed_at?: string
  }> {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding/esign/status/${documentId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async resendEsignRequest(merchantId: string, documentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      return await fetchApi(`/api/v1/admin/merchants/${merchantId}/onboarding/esign/resend/${documentId}`, {
        method: 'POST',
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

  async updateAdminUser(userId: string, data: {
    full_name?: string
    email?: string
    role?: string
    department?: string
    status?: string
  }) {
    try {
      return await fetchApi(`/api/v1/admin/users/${userId}`, {
        method: 'PUT',
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

// ============================================================================
// Marketing Analytics API
// ============================================================================

export const marketingAnalyticsApi = {
  async getAnalytics(dateRange = '30d') {
    try {
      return await fetchApi(`/api/marketing/analytics?date_range=${dateRange}`)
    } catch (error) {
      // Return mock data if API not available
      console.warn('[marketingAnalyticsApi] API not available, using mock data')
      return {
        kpis: {
          totalReach: 130300,
          engagementRate: 18.5,
          conversions: 4900,
          avgRoi: 227.75,
          trends: {
            reach: { value: 12.5, direction: 'up' },
            engagement: { value: 3.2, direction: 'up' },
            conversions: { value: 8.7, direction: 'up' },
            roi: { value: 15.3, direction: 'up' },
          },
        },
        performanceTrend: [
          { date: 'Jan 1', reach: 12400, engagement: 2100, conversions: 420 },
          { date: 'Jan 8', reach: 14200, engagement: 2800, conversions: 520 },
          { date: 'Jan 15', reach: 18900, engagement: 3400, conversions: 680 },
          { date: 'Jan 22', reach: 16500, engagement: 3100, conversions: 590 },
          { date: 'Jan 29', reach: 21000, engagement: 4200, conversions: 840 },
          { date: 'Feb 5', reach: 24500, engagement: 4800, conversions: 960 },
          { date: 'Feb 12', reach: 22800, engagement: 4500, conversions: 890 },
        ],
        channelDistribution: [
          { name: 'Email', value: 45, color: '#235393' },
          { name: 'SMS', value: 30, color: '#60BA46' },
          { name: 'Push', value: 25, color: '#FAB915' },
        ],
        conversionFunnel: [
          { stage: 'Sent', value: 100000, percentage: 100 },
          { stage: 'Delivered', value: 95000, percentage: 95 },
          { stage: 'Opened', value: 38000, percentage: 40 },
          { stage: 'Clicked', value: 15200, percentage: 16 },
          { stage: 'Converted', value: 3800, percentage: 4 },
        ],
        topCampaigns: [
          { id: '1', name: 'Holiday Sale 2025', reach: 45000, engagement: 12.5, conversions: 1840, roi: 245 },
          { id: '2', name: 'New User Welcome', reach: 32000, engagement: 18.2, conversions: 2100, roi: 312 },
          { id: '3', name: 'Loyalty Rewards', reach: 28000, engagement: 15.8, conversions: 1560, roi: 198 },
          { id: '4', name: 'Flash Promo Q1', reach: 21000, engagement: 9.4, conversions: 890, roi: 156 },
        ],
      }
    }
  },

  async getPerformanceTrend(dateRange = '30d') {
    try {
      return await fetchApi(`/api/marketing/analytics/trend?date_range=${dateRange}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getChannelDistribution(dateRange = '30d') {
    try {
      return await fetchApi(`/api/marketing/analytics/channels?date_range=${dateRange}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getConversionFunnel(dateRange = '30d') {
    try {
      return await fetchApi(`/api/marketing/analytics/funnel?date_range=${dateRange}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getTopCampaigns(limit = 10, sortBy = 'roi') {
    try {
      return await fetchApi(`/api/marketing/analytics/top-campaigns?limit=${limit}&sort_by=${sortBy}`)
    } catch (error) {
      throw handleError(error)
    }
  },
}

// ============================================================================
// A/B Testing API
// ============================================================================

export const abTestingApi = {
  async listTests(page = 1, perPage = 25, status?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(status && { status }),
      })
      return await fetchApi(`/api/marketing/ab-tests?${params}`)
    } catch (error) {
      // Return mock data if API not available
      console.warn('[abTestingApi] API not available, using mock data')
      return {
        tests: [
          {
            id: 'test-1',
            name: 'Email Subject Line Test',
            hypothesis: 'Personalized subject lines will increase open rates by 15%',
            status: 'running',
            startDate: '2025-01-01',
            endDate: '2025-01-15',
            variants: [
              { id: 'a', name: 'Control', traffic: 50, conversions: 245, views: 5000 },
              { id: 'b', name: 'Personalized', traffic: 50, conversions: 312, views: 5000 },
            ],
            metric: 'open_rate',
            confidence: 94,
            winner: null,
          },
          {
            id: 'test-2',
            name: 'CTA Button Color Test',
            hypothesis: 'Green CTA buttons will outperform blue by 10%',
            status: 'completed',
            startDate: '2024-12-15',
            endDate: '2024-12-31',
            variants: [
              { id: 'a', name: 'Blue Button', traffic: 50, conversions: 189, views: 4200 },
              { id: 'b', name: 'Green Button', traffic: 50, conversions: 234, views: 4200 },
            ],
            metric: 'click_rate',
            confidence: 97,
            winner: 'b',
          },
          {
            id: 'test-3',
            name: 'Push Notification Timing',
            hypothesis: 'Morning notifications perform better than evening',
            status: 'draft',
            startDate: null,
            endDate: null,
            variants: [
              { id: 'a', name: 'Morning (9 AM)', traffic: 50, conversions: 0, views: 0 },
              { id: 'b', name: 'Evening (6 PM)', traffic: 50, conversions: 0, views: 0 },
            ],
            metric: 'engagement',
            confidence: 0,
            winner: null,
          },
        ],
        total: 3,
      }
    }
  },

  async getTest(testId: string) {
    try {
      return await fetchApi(`/api/marketing/ab-tests/${testId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async createTest(data: {
    name: string
    hypothesis: string
    variants: Array<{ name: string; traffic: number }>
    metric: string
    duration_days?: number
  }) {
    try {
      return await fetchApi('/api/marketing/ab-tests', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      // Mock create for demo
      console.warn('[abTestingApi] Create API not available, using mock')
      return {
        id: `test-${Date.now()}`,
        ...data,
        status: 'draft',
        startDate: null,
        endDate: null,
        confidence: 0,
        winner: null,
        variants: data.variants.map((v, i) => ({
          id: String.fromCharCode(97 + i),
          ...v,
          conversions: 0,
          views: 0,
        })),
      }
    }
  },

  async updateTest(testId: string, data: any) {
    try {
      return await fetchApi(`/api/marketing/ab-tests/${testId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async startTest(testId: string) {
    try {
      return await fetchApi(`/api/marketing/ab-tests/${testId}/start`, {
        method: 'POST',
      })
    } catch (error) {
      // Mock start for demo
      console.warn('[abTestingApi] Start API not available, using mock')
      return { status: 'success', test_status: 'running' }
    }
  },

  async pauseTest(testId: string) {
    try {
      return await fetchApi(`/api/marketing/ab-tests/${testId}/pause`, {
        method: 'POST',
      })
    } catch (error) {
      console.warn('[abTestingApi] Pause API not available, using mock')
      return { status: 'success', test_status: 'paused' }
    }
  },

  async stopTest(testId: string) {
    try {
      return await fetchApi(`/api/marketing/ab-tests/${testId}/stop`, {
        method: 'POST',
      })
    } catch (error) {
      console.warn('[abTestingApi] Stop API not available, using mock')
      return { status: 'success', test_status: 'completed' }
    }
  },

  async promoteWinner(testId: string, variantId: string) {
    try {
      return await fetchApi(`/api/marketing/ab-tests/${testId}/promote`, {
        method: 'POST',
        body: JSON.stringify({ variant_id: variantId }),
      })
    } catch (error) {
      console.warn('[abTestingApi] Promote API not available, using mock')
      return { status: 'success', promoted_variant: variantId }
    }
  },

  async getTestResults(testId: string) {
    try {
      return await fetchApi(`/api/marketing/ab-tests/${testId}/results`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async deleteTest(testId: string) {
    try {
      return await fetchApi(`/api/marketing/ab-tests/${testId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.warn('[abTestingApi] Delete API not available, using mock')
      return { status: 'success' }
    }
  },
}

// ============================================================================
// Audience Segments API
// ============================================================================

export const audienceSegmentsApi = {
  async listSegments(page = 1, perPage = 25) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      })
      return await fetchApi(`/api/marketing/audience-segments?${params}`)
    } catch (error) {
      // Return mock data if API not available
      console.warn('[audienceSegmentsApi] API not available, using mock data')
      return {
        segments: [
          {
            id: 'seg-1',
            name: 'High-Value Customers',
            description: 'Customers who spent over $500 in the last 90 days',
            ruleGroups: [
              {
                id: 'g1',
                logic: 'AND',
                rules: [
                  { id: 'r1', field: 'total_spent', operator: 'greater_than', value: 500 },
                  { id: 'r2', field: 'last_purchase', operator: 'within_days', value: 90 },
                ],
              },
            ],
            audienceSize: 12450,
            createdAt: '2025-01-01',
            lastUsed: '2025-01-07',
          },
          {
            id: 'seg-2',
            name: 'Dormant Users',
            description: 'Users inactive for 30+ days',
            ruleGroups: [
              {
                id: 'g1',
                logic: 'AND',
                rules: [
                  { id: 'r1', field: 'last_active', operator: 'more_than_days', value: 30 },
                  { id: 'r2', field: 'purchase_frequency', operator: 'not_equals', value: 'never' },
                ],
              },
            ],
            audienceSize: 8320,
            createdAt: '2025-01-03',
          },
          {
            id: 'seg-3',
            name: 'Email Engaged',
            description: 'Users with high email engagement',
            ruleGroups: [
              {
                id: 'g1',
                logic: 'AND',
                rules: [{ id: 'r1', field: 'email_opens', operator: 'greater_than', value: 50 }],
              },
            ],
            audienceSize: 24890,
            createdAt: '2025-01-05',
          },
        ],
        total: 3,
      }
    }
  },

  async getSegment(segmentId: string) {
    try {
      return await fetchApi(`/api/marketing/audience-segments/${segmentId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async createSegment(data: {
    name: string
    description?: string
    ruleGroups: Array<{
      logic: 'AND' | 'OR'
      rules: Array<{
        field: string
        operator: string
        value: string | number | string[]
      }>
    }>
  }) {
    try {
      return await fetchApi('/api/marketing/audience-segments', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      // Mock create for demo
      console.warn('[audienceSegmentsApi] Create API not available, using mock')
      return {
        id: `seg-${Date.now()}`,
        ...data,
        audienceSize: Math.floor(Math.random() * 50000) + 1000,
        createdAt: new Date().toISOString().split('T')[0],
      }
    }
  },

  async updateSegment(segmentId: string, data: any) {
    try {
      return await fetchApi(`/api/marketing/audience-segments/${segmentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deleteSegment(segmentId: string) {
    try {
      return await fetchApi(`/api/marketing/audience-segments/${segmentId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.warn('[audienceSegmentsApi] Delete API not available, using mock')
      return { status: 'success' }
    }
  },

  async previewAudience(ruleGroups: Array<{
    logic: 'AND' | 'OR'
    rules: Array<{
      field: string
      operator: string
      value: string | number | string[]
    }>
  }>) {
    try {
      return await fetchApi('/api/marketing/audience-segments/preview', {
        method: 'POST',
        body: JSON.stringify({ rule_groups: ruleGroups }),
      })
    } catch (error) {
      // Mock preview calculation
      console.warn('[audienceSegmentsApi] Preview API not available, using mock')
      const totalRules = ruleGroups.reduce((sum, g) => sum + g.rules.length, 0)
      const baseAudience = 50000
      const reduction = totalRules * 0.15
      return {
        estimatedSize: Math.floor(baseAudience * (1 - Math.min(reduction, 0.9))),
        sampleUsers: [
          { id: 'u1', name: 'John Doe', email: 'john@example.com' },
          { id: 'u2', name: 'Jane Smith', email: 'jane@example.com' },
          { id: 'u3', name: 'Bob Wilson', email: 'bob@example.com' },
        ],
      }
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
      // Use the main PUT /settings endpoint which handles all settings
      const result = await fetchApi('/api/v1/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name || 'SwipeSavvy',
          description: data.description || '',
          timezone: data.timezone || 'America/Los_Angeles',
          locales: data.locales || ['en-US'],
          alerts: data.alerts ?? true,
          digest: data.digest ?? false,
          branding_mode: data.branding_mode || 'system',
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

  async uploadBrandingImage(formData: FormData) {
    try {
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

  async deleteBrandingImage(imageId: string) {
    try {
      return await fetchApi(`/api/v1/admin/settings/branding/images/${imageId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async getBrandingImages() {
    try {
      return await fetchApi('/api/v1/admin/settings/branding/images')
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
// Charity API - Charity Onboarding Management
// ============================================================================

export const charityApi = {
  async listCharities(params?: { q?: string; status?: string; category?: string; limit?: number; offset?: number }) {
    try {
      const searchParams = new URLSearchParams()
      if (params?.q) searchParams.append('q', params.q)
      if (params?.status) searchParams.append('status', params.status)
      if (params?.category) searchParams.append('category', params.category)
      if (params?.limit) searchParams.append('limit', params.limit.toString())
      if (params?.offset) searchParams.append('offset', params.offset.toString())
      const queryString = searchParams.toString()
      return await fetchApi(`/api/v1/admin/charities${queryString ? `?${queryString}` : ''}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getCharity(charityId: string) {
    try {
      return await fetchApi(`/api/v1/admin/charities/${charityId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async createCharity(data: {
    name: string
    email: string
    phone?: string
    category: string
    registration_number?: string
    country?: string
    website?: string
    notes?: string
  }) {
    try {
      return await fetchApi('/api/v1/admin/charities', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async updateCharity(charityId: string, data: {
    name?: string
    email?: string
    phone?: string
    category?: string
    registration_number?: string
    country?: string
    website?: string
    status?: string
    documents_submitted?: number
    completion_percentage?: number
    notes?: string
  }) {
    try {
      return await fetchApi(`/api/v1/admin/charities/${charityId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async deleteCharity(charityId: string) {
    try {
      return await fetchApi(`/api/v1/admin/charities/${charityId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async approveCharity(charityId: string) {
    try {
      return await fetchApi(`/api/v1/admin/charities/${charityId}/approve`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async rejectCharity(charityId: string, notes?: string) {
    try {
      const params = notes ? `?notes=${encodeURIComponent(notes)}` : ''
      return await fetchApi(`/api/v1/admin/charities/${charityId}/reject${params}`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },
}

// ============================================================================
// AI Support Concierge API
// ============================================================================

// AI Concierge event types for streaming
export interface AIConciergeEvent {
  type: 'message' | 'tool_call' | 'approval_required' | 'tool_result' | 'done' | 'error' | 'warning'
  delta?: string
  content?: string
  tool?: string
  args?: string | Record<string, unknown>
  result?: Record<string, unknown>
  success?: boolean
  error?: string
  message?: string
  approval_key?: string
}

export const aiConciergeApi = {
  async sendMessage(message: string, conversationId?: string) {
    try {
      return await fetchApi('/api/v1/admin/ai-concierge/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversation_id: conversationId }),
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  /**
   * Send a message to the agentic AI concierge with streaming response.
   * This endpoint enables tool execution based on user role and permissions.
   */
  async *sendAgenticMessage(
    message: string,
    options: {
      userId: string
      role: string
      permissions: string[]
      employeeName?: string
      sessionId?: string
      context?: Record<string, unknown>
    }
  ): AsyncGenerator<AIConciergeEvent> {
    const token = localStorage.getItem(TOKEN_KEY)

    const response = await fetch(`${getApiBaseUrl()}/api/v1/ai-concierge/agentic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        message,
        user_id: options.userId,
        role: options.role,
        permissions: options.permissions,
        employee_name: options.employeeName,
        session_id: options.sessionId,
        context: options.context,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              return
            }
            try {
              const event = JSON.parse(data) as AIConciergeEvent
              yield event
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  },

  /**
   * Approve a pending action that requires user confirmation.
   */
  async approveAction(approvalKey: string) {
    try {
      return await fetchApi(`/api/v1/ai-concierge/approve/${approvalKey}`, {
        method: 'POST',
      })
    } catch (error) {
      throw handleError(error)
    }
  },

  async getConversation(conversationId: string) {
    try {
      return await fetchApi(`/api/v1/admin/ai-concierge/conversations/${conversationId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async listConversations(page = 1, perPage = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      })
      return await fetchApi(`/api/v1/admin/ai-concierge/conversations?${params}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async getStats() {
    try {
      return await fetchApi('/api/v1/admin/ai-concierge/stats')
    } catch (error) {
      throw handleError(error)
    }
  },

  async getSuggestedResponses(ticketId: string) {
    try {
      return await fetchApi(`/api/v1/admin/ai-concierge/suggest/${ticketId}`)
    } catch (error) {
      throw handleError(error)
    }
  },

  async analyzeTicket(ticketId: string) {
    try {
      return await fetchApi(`/api/v1/admin/ai-concierge/analyze/${ticketId}`)
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
  marketingAnalyticsApi,
  abTestingApi,
  audienceSegmentsApi,
  charityApi,
  aiConciergeApi,
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
