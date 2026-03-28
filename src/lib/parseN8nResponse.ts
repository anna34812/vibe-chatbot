function extractTextFromJson(data: unknown): string | null {
  if (data == null) return null
  if (typeof data === 'string') return data
  if (typeof data !== 'object') return String(data)

  const o = data as Record<string, unknown>
  for (const key of ['reply', 'output', 'message', 'text'] as const) {
    const v = o[key]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return null
}

export function parseN8nResponse(
  body: string,
  contentType: string | null,
): string {
  const trimmed = body.trim()
  const ct = contentType?.toLowerCase() ?? ''

  if (ct.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const data: unknown = JSON.parse(trimmed)
      const text = extractTextFromJson(data)
      if (text !== null) return text
      if (typeof data === 'object' && data !== null) {
        return JSON.stringify(data)
      }
      return String(data)
    } catch {
      return trimmed
    }
  }

  return trimmed
}
