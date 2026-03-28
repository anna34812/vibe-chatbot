import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import './App.css'
import {
  ChatApiError,
  formatChatApiError,
  sendChatMessage,
} from './lib/chatApi'

const SESSION_STORAGE_KEY = 'chatbot_session_id'

type Role = 'user' | 'assistant'

type ChatMessage = {
  id: string
  role: Role
  content: string
}

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_STORAGE_KEY, id)
  }
  return id
}

function App() {
  const [sessionId, setSessionId] = useState(getOrCreateSessionId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const startNewChat = () => {
    const next = crypto.randomUUID()
    localStorage.setItem(SESSION_STORAGE_KEY, next)
    setSessionId(next)
    setMessages([])
    setError(null)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setError(null)
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const reply = await sendChatMessage(text, sessionId)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
        },
      ])
    } catch (e) {
      if (e instanceof ChatApiError) {
        setError(formatChatApiError(e))
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('알 수 없는 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (ev: KeyboardEvent<HTMLTextAreaElement>) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault()
      void send()
    }
  }

  return (
    <div className="chat">
      <header className="chat__header">
        <h1 className="chat__title">채팅</h1>
        <div className="chat__headerActions">
          <span className="chat__session" title={sessionId}>
            세션: {sessionId.slice(0, 8)}…
          </span>
          <button type="button" className="chat__btnSecondary" onClick={startNewChat}>
            새 대화
          </button>
        </div>
      </header>

      <div className="chat__messages" role="log" aria-live="polite">
        {messages.length === 0 && (
          <p className="chat__empty">메시지를 입력하고 전송하세요.</p>
        )}
        <ul className="chat__list">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`chat__bubble chat__bubble--${m.role}`}
            >
              <span className="chat__bubbleLabel">
                {m.role === 'user' ? '나' : '응답'}
              </span>
              <div className="chat__bubbleContent">{m.content}</div>
            </li>
          ))}
        </ul>
        {loading && (
          <p className="chat__status" aria-busy="true">
            응답 대기 중…
          </p>
        )}
        <div ref={listEndRef} />
      </div>

      {error && (
        <div className="chat__error" role="alert">
          {error}
        </div>
      )}

      <div className="chat__composer">
        <textarea
          className="chat__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="메시지 입력 (Enter 전송, Shift+Enter 줄바꿈)"
          rows={3}
          disabled={loading}
          aria-label="메시지"
        />
        <button
          type="button"
          className="chat__btnPrimary"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
        >
          전송
        </button>
      </div>
    </div>
  )
}

export default App
