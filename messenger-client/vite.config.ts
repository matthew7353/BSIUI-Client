import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { SERVER_URL = 'http://localhost:8000' } = loadEnv(mode, process.cwd(), '')

  // The server does not send CORS headers, so the browser must reach it through a same-origin proxy.
  const proxy = {
    '/api': {
      target: SERVER_URL,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
  }

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  }
})
