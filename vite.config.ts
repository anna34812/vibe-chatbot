import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEV_WEBHOOK_PATH = '/n8n-webhook'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const webhookUrl = env.VITE_N8N_WEBHOOK_URL?.trim() ?? ''

  /**
   * 프로덕션은 ./ (상대 경로). GitHub Pages에서 /repo 처럼 끝 슬래시 없이 열면 ./assets 가 잘못 풀리므로
   * index.html 첫 스크립트에서 /repo/ 로 리다이렉트함.
   * 특수 배포만: .env에 VITE_BASE_PATH=/path/ 로 절대 base 지정.
   */
  const baseFromEnv = env.VITE_BASE_PATH?.trim()
  const base =
    command === 'serve'
      ? '/'
      : baseFromEnv
        ? baseFromEnv.endsWith('/')
          ? baseFromEnv
          : `${baseFromEnv}/`
        : './'

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
