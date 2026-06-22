import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/kinal-admin/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5176,
    host: true,
    allowedHosts: true,
    proxy: {
      '/kinal-api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kinal-api/, '/api'),
      },
    },
  },
}))
