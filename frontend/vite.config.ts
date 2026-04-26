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
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/:': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
