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
        // Function form, not the { name: [modules] } record form.
        //
        // The record form stopped type-checking when vite/rollup tightened
        // `output.manualChunks`: the union no longer resolves to the record
        // variant, so `tsc -b --noEmit` failed with
        //   TS2769 ... 'vendor' does not exist in type 'ManualChunksFunction'
        // That is what blocked the vite 5 -> 6 bumps (#113, #122) — the bump
        // was correct, this config was written against the older typing.
        //
        // The function form is valid in BOTH vite 5 and 6, so this is
        // forward-compatible rather than a pin, and produces the same single
        // `vendor` chunk from the same four packages.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|react-router-dom|zustand)[\\/]/.test(id)) {
            return 'vendor'
          }
          return
        },
      },
    },
  },
})
