import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: (_error: Error) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true, error: _error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error)
    console.error('Error Info:', errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const errorMessage = this.state.error.message || 'Unknown error'
      const errorStack = this.state.error.stack || ''
      console.error('ErrorBoundary rendering error:', errorMessage, errorStack)
      return (
        this.props.fallback?.(this.state.error) || (
          <div style={{ padding: '20px', color: '#d32f2f', backgroundColor: '#ffebee', border: '2px solid #d32f2f', borderRadius: '4px', margin: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
            <h2 style={{ marginTop: 0, color: '#d32f2f' }}>Error in Application</h2>
            <p><strong>Message:</strong></p>
            <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '300px' }}>{errorMessage}</pre>
            {errorStack && (
              <>
                <p><strong>Stack:</strong></p>
                <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '200px', fontSize: '12px' }}>{errorStack}</pre>
              </>
            )}
            <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Reload Page
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
