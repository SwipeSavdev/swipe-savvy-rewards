/**
 * API Configuration Module
 * Handles all API endpoint configurations and base URL setup
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000'
const API_TIMEOUT = parseInt((import.meta.env.VITE_API_TIMEOUT as string) || '30000', 10)

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
}

/**
 * Build full API endpoint URL
 */
export const getApiUrl = (endpoint: string): string => {
  const base = API_BASE_URL.replace(/\/$/, '')
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${base}${path}`
}

/**
 * Fetch wrapper with automatic token injection
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = getApiUrl(endpoint)
  const token = localStorage.getItem('admin_token')

  const headers = new Headers({
    ...apiConfig.headers,
    ...options.headers,
  })

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * JSON API call wrapper
 */
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await apiFetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export default apiConfig
