import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/theme/theme.css'
import './ui/theme/themes.css'
import './ui/theme/buttons.css'
import './app/App.css'
import App from '@/app/App'
import { applyTheme, DEFAULT_THEME, resolveTheme } from '@/ui/theme/themes'
import { injectPixelFont } from '@/ui/theme/pixelFont'

injectPixelFont()

try {
  const raw = localStorage.getItem('code-hack-progress-v2')
  const theme = raw
    ? resolveTheme((JSON.parse(raw) as { settings?: { theme?: unknown } }).settings?.theme)
    : DEFAULT_THEME
  applyTheme(theme)
} catch {
  applyTheme(DEFAULT_THEME)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
