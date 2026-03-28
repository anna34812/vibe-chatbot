import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEV_WEBHOOK_PATH = '/n8n-webhook'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const webhookUrl = env.VITE_N8N_WEBHOOK_URL?.trim() ?? ''

  const proxy: Record<string, import('vite').ProxyOptions> = {}
  if (webhookUrl) {
    try {
      const parsed = new URL(webhookUrl)
      const pathWithSearch = parsed.pathname + parsed.search
      proxy[DEV_WEBHOOK_PATH] = {
        target: parsed.origin,
        changeOrigin: true,
        secure: true,
        rewrite: () => pathWithSearch,
      }
    } catch {
      /* invalid URL — no proxy */
    }
  }

  return {
    plugins: [react()],
    server: { proxy },
  }
})
