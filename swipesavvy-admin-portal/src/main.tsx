import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Clear potentially problematic storage
localStorage.removeItem('admin_auth_token')
localStorage.removeItem('admin_user')

// Global error handling with detailed logging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  if (event.error) {
    console.error('Error details:', JSON.stringify(event.error, null, 2))
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled rejection:', event.reason)
  if (event.reason instanceof Error) {
    console.error('Error message:', event.reason.message)
    console.error('Error stack:', event.reason.stack)
  } else if (event.reason) {
    try {
      console.error('Rejection details:', JSON.stringify(event.reason, null, 2))
    } catch (e) {
      console.error('Rejection (raw):', event.reason)
    }
  }
  // Show error on page
  const root = document.getElementById('root')
  if (root && !root.textContent?.includes('Error')) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace; white-space: pre-wrap;">ERROR: ${event.reason?.message || event.reason || 'Unknown error'}</div>`
  }
})

const rootElement = document.getElementById('root')
console.log('✅ Root element found:', rootElement)

if (!rootElement) {
  throw new Error('Root element #root not found in DOM')
}

console.log('🚀 Mounting React app to #root')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
