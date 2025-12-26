import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({
    babel: {
      plugins: ['@babel/plugin-syntax-dynamic-import'],
    },
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    headers: {
      'Cache-Control': 'public, max-age=0',
    },
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react'],
          'vendor-state': ['zustand'],
          'vendor-http': ['axios'],
          'pages-auth': ['./src/pages/LoginPage.tsx'],
          'pages-dashboard': ['./src/pages/DashboardPage.tsx'],
          'pages-admin': [
            './src/pages/AdminUsersPage.tsx',
            './src/pages/AuditLogsPage.tsx',
          ],
          'pages-support': [
            './src/pages/SupportDashboardPage.tsx',
            './src/pages/SupportTicketsPage.tsx',
          ],
          'pages-business': [
            './src/pages/UsersPage.tsx',
            './src/pages/AnalyticsPage.tsx',
            './src/pages/MerchantsPage.tsx',
            './src/pages/SettingsPage.tsx',
          ],
          'pages-features': [
            './src/pages/FeatureFlagsPage.tsx',
            './src/pages/AIMarketingPage.tsx',
            './src/pages/ConciergePage.tsx',
          ],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|gif|svg/.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
      },
    },
    chunkSizeWarningLimit: 1024,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios', 'lucide-react'],
  },
})
