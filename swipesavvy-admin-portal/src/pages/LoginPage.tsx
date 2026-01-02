import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from ?? '/dashboard'

  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [email, setEmail] = useState('admin@swipesavvy.com')
  const [password, setPassword] = useState('Admin123!')
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
    <div className="min-h-screen bg-[var(--ss-bg)]">
      <div className="mx-auto flex min-h-screen max-w-[1200px] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface)] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ss-primary)] text-white font-semibold text-sm">
                SS
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--ss-text)]">Sign in</h2>
                <p className="text-sm text-[var(--ss-text-muted)]">SwipeSavvy Admin Portal</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--ss-text)] mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-3 py-2 border border-[var(--ss-border)] rounded-md text-[var(--ss-text)] bg-[var(--ss-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--ss-primary)]"
                  placeholder="admin@swipesavvy.com"
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--ss-text)] mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-3 py-2 border border-[var(--ss-border)] rounded-md text-[var(--ss-text)] bg-[var(--ss-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--ss-primary)]"
                  placeholder="Enter password"
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--ss-primary)] text-white font-medium py-2 px-4 rounded-md hover:bg-opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-muted)]">Demo credentials</p>
              <p className="mt-2 text-sm text-[var(--ss-text)]">
                Email: <code className="font-mono text-xs">admin@swipesavvy.com</code>
              </p>
              <p className="text-sm text-[var(--ss-text)]">
                Password: <code className="font-mono text-xs">TempPassword123!</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
