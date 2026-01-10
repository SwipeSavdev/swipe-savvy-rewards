import { Suspense, lazy, useEffect } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import LoginPage from './pages/LoginPage'
import { initializeAuditLogging } from './store/auditStore'
import './styles/brand-design-system.css'

const AppRoutes = lazy(() => 
  import('./router/AppRoutes').catch(err => {
    console.error('[ERROR] Failed to load AppRoutes:', err)
    throw err
  })
)

function LoadingFallback() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontSize: '18px'
    }}>
      Loading...
    </div>
  )
}

export default function App() {
  // Initialize audit logging on app mount
  useEffect(() => {
    const cleanup = initializeAuditLogging()
    return cleanup
  }, [])

  return (
    <Router>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  )
}
