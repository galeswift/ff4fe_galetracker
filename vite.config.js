import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Served at www.ff4fedraft.com/tracker/
  base: '/tracker/',
  plugins: [react()],
})
