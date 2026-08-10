import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/theme/theme.css'
import './ui/theme/themes.css'
import './ui/theme/buttons.css'
import './app/App.css'
import App from '@/app/App'
import { resolveInitialLocale } from '@/i18n/types'
import { applyTheme, DEFAULT_THEME, resolveTheme } from '@/ui/theme/themes'
import { injectPixelFont } from '@/ui/theme/pixelFont'

injectPixelFont()

try {
  const raw = localStorage.getItem('code-hack-progress-v2')
  const settings = raw
    ? (JSON.parse(raw) as { settings?: { theme?: unknown; locale?: unknown } }).settings
    : undefined
  applyTheme(settings ? resolveTheme(settings.theme) : DEFAULT_THEME)
  document.documentElement.lang =
    resolveInitialLocale(settings?.locale) === 'en' ? 'en' : 'zh-CN'
} catch {
  applyTheme(DEFAULT_THEME)
  document.documentElement.lang =
    resolveInitialLocale(undefined) === 'en' ? 'en' : 'zh-CN'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
