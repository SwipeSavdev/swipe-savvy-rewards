import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

export function useInactivityLogout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Don't set a new timer if user is not authenticated
    if (!isAuthenticated) {
      return
    }

    // Set a new timer for logout after inactivity
    timeoutRef.current = setTimeout(() => {
      console.log('[useInactivityLogout] User inactive for 5 minutes, logging out...')
      logout()
    }, INACTIVITY_TIMEOUT)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timer when user logs out
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      return
    }

    // List of events that indicate user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    // Add event listeners for user activity
    const handleActivity = () => {
      console.log('[useInactivityLogout] User activity detected, resetting timer')
      resetTimer()
    }

    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    // Initial timer setup
    resetTimer()

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isAuthenticated, logout])
}
