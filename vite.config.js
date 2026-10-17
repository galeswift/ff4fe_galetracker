import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Served from the root of tracker.galeswift.com
  base: '/',
  plugins: [react()],
})
