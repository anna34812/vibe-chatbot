import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEV_WEBHOOK_PATH = '/n8n-webhook'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const webhookUrl = env.VITE_N8N_WEBHOOK_URL?.trim() ?? ''

  /** GitHub Pages 프로젝트 페이지: 끝 슬래시 없이 들어와도 번들을 찾으려면 /저장소이름/ 이 필요함 (./ 는 깨짐) */
  const productionBase = (() => {
    const fromEnv = env.VITE_BASE_PATH?.trim()
    if (fromEnv) {
      return fromEnv.endsWith('/') ? fromEnv : `${fromEnv}/`
    }
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
    if (repo) return `/${repo}/`
    return '/'
  })()
  const base = command === 'serve' ? '/' : productionBase

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
    base,
    plugins: [react()],
    server: { proxy },
  }
})
