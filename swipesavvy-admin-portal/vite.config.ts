import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    strictPort: false,
    host: '0.0.0.0',
    hmr: false,
  },
  build: {
    // Increase chunk size warning limit (chunks are large but acceptable for admin portal)
    chunkSizeWarningLimit: 600,
    // Manual chunks configuration for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunk
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            'zustand',
          ],
        },
      },
    },
  },
})
