import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML =
    '<p style="padding:1rem;font-family:system-ui,sans-serif">#root 가 없습니다.</p>'
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    rootEl.innerHTML =
      '<p style="padding:1rem;font-family:system-ui,sans-serif;line-height:1.5">앱을 시작하지 못했습니다: ' +
      msg +
      '</p>'
  }
}
