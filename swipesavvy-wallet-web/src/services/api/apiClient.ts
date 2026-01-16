import type { ApiError } from '../../types/api'

// Configuration
// API calls go through the same CloudFront distribution (wallet.swipesavvy.com/api/*)
// which proxies to the backend, avoiding CORS issues
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN_KEY = 'wallet_auth_token'
const REFRESH_TOKEN_KEY = 'wallet_refresh_token'

// Timeout and retry settings
const REQUEST_TIMEOUT = 10000 // 10 seconds
const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 1000 // 1 second base delay for exponential backoff

/**
 * Get the auth token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Set the auth token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Remove auth tokens
 */
export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * Check if error is retryable
 */
function isRetryable(status: number): boolean {
  return status >= 500 || status === 429 || status === 408
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function getRetryDelay(attempt: number): number {
  const baseDelay = RETRY_DELAY_BASE * Math.pow(2, attempt)
  const jitter = Math.random() * 1000
  return Math.min(baseDelay + jitter, 60000) // Cap at 60 seconds
}

/**
 * Refresh the access token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) return null

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Refresh failed')
    }

    const data = await response.json()
    setToken(data.token)
    return data.token
  } catch {
    clearTokens()
    return null
  }
}

/**
 * Main fetch wrapper with auth, retries, and error handling
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  let attempt = 0
  let lastError: ApiError | null = null

  while (attempt <= MAX_RETRIES) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      // Get fresh token
      const token = getToken()

      // Build headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
      }

      // Make request
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle response
      if (response.ok) {
        // Handle 204 No Content
        if (response.status === 204) {
          return {} as T
        }
        return await response.json()
      }

      // Handle 401 - try token refresh once
      if (response.status === 401 && attempt === 0) {
        const newToken = await refreshAccessToken()
        if (newToken) {
          attempt++ // Don't count this as a retry
          continue
        }
        // Refresh failed, redirect to login
        window.location.href = '/login'
        throw { message: 'Session expired', status: 401 }
      }

      // Handle other errors
      let errorBody: { detail?: string; message?: string } = {}
      try {
        errorBody = await response.json()
      } catch {
        // Ignore JSON parse errors
      }

      const error: ApiError = {
        message: errorBody.detail || errorBody.message || response.statusText,
        status: response.status,
        details: errorBody as Record<string, unknown>,
      }

      // Check if retryable
      if (isRetryable(response.status) && attempt < MAX_RETRIES) {
        lastError = error
        const delay = getRetryDelay(attempt)
        await sleep(delay)
        attempt++
        continue
      }

      throw error
    } catch (error) {
      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError: ApiError = {
          message: 'Request timed out',
          status: 408,
        }

        if (attempt < MAX_RETRIES) {
          lastError = timeoutError
          const delay = getRetryDelay(attempt)
          await sleep(delay)
          attempt++
          continue
        }

        throw timeoutError
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          status: 0,
        }

        if (attempt < MAX_RETRIES) {
          lastError = networkError
          const delay = getRetryDelay(attempt)
          await sleep(delay)
          attempt++
          continue
        }

        throw networkError
      }

      // Re-throw API errors
      throw error
    }
  }

  // Should not reach here, but throw last error if it does
  throw lastError || { message: 'Request failed', status: 500 }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
}
