import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration for URL Shortener frontend
 * React + TypeScript development server and build setup
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Proxy shortened links (alphanumeric with dashes/underscores)
      // Matches: /my-link, /abc123, but NOT /, /., etc.
      '^/[a-zA-Z0-9\\-_]+$': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
