import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'

const AppRoutes = lazy(() => 
  import('./router/AppRoutes').catch(err => {
    console.error('❌ Failed to load AppRoutes:', err)
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
  return (
    <Router>
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
