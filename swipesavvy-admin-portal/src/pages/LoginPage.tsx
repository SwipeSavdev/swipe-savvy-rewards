/**
 * SwipeSavvy Admin Portal - Bank-Grade Login Page
 * Version: 4.0
 *
 * Bank-grade login requirements:
 * - Clear, professional appearance
 * - Accessible form with proper labels
 * - Error state handling
 * - Loading state feedback
 */

import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/dashboard'

  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: typeof fieldErrors = {}
    if (!email.includes('@')) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Password is required.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await login(email, password)
  }

  return (
    <div className="min-h-screen bg-bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-interactive-primary mb-4">
            <Lock className="w-7 h-7 text-interactive-primary-text" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">SwipeSavvy</h1>
          <p className="text-text-secondary mt-1">Admin Portal</p>
        </div>

        <Card variant="outlined" padding="lg">
          {/* Error Alert */}
          {error && (
            <div
              className="mb-6 p-4 rounded-md bg-status-danger-subtle border border-status-danger/20 flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-status-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-status-danger-text">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              errorText={fieldErrors.email}
              autoComplete="email"
              isRequired
            />

            {/* Password */}
            <div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-tertiary hover:text-text-primary transition-colors pointer-events-auto"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                errorText={fieldErrors.password}
                autoComplete="current-password"
                isRequired
              />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-default text-interactive-primary focus:ring-border-focus"
                />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-text-link hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 rounded-md bg-status-info-subtle border border-status-info/20">
            <p className="text-sm font-medium text-status-info-text mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1 text-sm text-status-info-text">
              <p>
                Email:{' '}
                <code className="bg-bg-surface px-1.5 py-0.5 rounded text-xs font-mono">
                  admin@swipesavvy.com
                </code>
              </p>
              <p>
                Password:{' '}
                <code className="bg-bg-surface px-1.5 py-0.5 rounded text-xs font-mono">
                  Admin123
                </code>
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-text-tertiary mt-6">
          © {new Date().getFullYear()} SwipeSavvy. All rights reserved.
        </p>
      </div>
    </div>
  )
}
