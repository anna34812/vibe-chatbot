import { parseN8nResponse } from './parseN8nResponse'

/** 개발 모드에서 Vite `server.proxy`와 맞춘 경로 (vite.config.ts) */
const DEV_PROXY_PATH = '/n8n-webhook'

export class ChatApiError extends Error {
  readonly status: number
  readonly responseBody?: string

  constructor(message: string, status: number, responseBody?: string) {
    super(message)
    this.name = 'ChatApiError'
    this.status = status
    this.responseBody = responseBody
  }
}

/** 화면에 표시할 때 404·잘못된 경로 등 안내 문구 보강 */
export function formatChatApiError(e: ChatApiError): string {
  const body = e.responseBody?.slice(0, 1200) ?? ''
  let out = e.message
  if (body) out += `\n\n${body}`

  const lower = body.toLowerCase()
  const looksLikeWorkflowEditorUrl =
    e.status === 404 &&
    lower.includes('cannot post') &&
    lower.includes('workflow')

  if (looksLikeWorkflowEditorUrl) {
    out +=
      '\n\n※ 지금 넣은 주소는 웹훅이 아니라 워크플로 편집 화면 경로(/workflow/...)일 가능성이 큽니다. n8n에서 첫 노드인 Webhook을 열고 "Production URL"에 나온 주소(보통 .../webhook/...) 전체를 .env.local의 VITE_N8N_WEBHOOK_URL에 넣은 뒤 개발 서버를 재시작하세요.'
  }

  return out
}

function resolveRequestUrl(): string {
  const configured = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim()
  if (!configured) {
    throw new Error(
      'VITE_N8N_WEBHOOK_URL이 비어 있습니다. .env.example을 참고해 설정하세요.',
    )
  }
  // 로컬에서는 브라우저→n8n 직접 요청이 CORS로 막히는 경우가 많아 프록시 경로 사용
  if (import.meta.env.DEV) {
    return DEV_PROXY_PATH
  }
  return configured
}

export async function sendChatMessage(
  message: string,
  sessionId: string,
): Promise<string> {
  const url = resolveRequestUrl()

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
  })

  const text = await res.text()

  if (!res.ok) {
    throw new ChatApiError(
      `웹훅 요청 실패 (${res.status})`,
      res.status,
      text || undefined,
    )
  }

  return parseN8nResponse(text, res.headers.get('content-type'))
}
