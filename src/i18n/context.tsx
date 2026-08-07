import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { CATALOG, interpolate, type Messages } from './messages'
import { DEFAULT_LOCALE, type Locale } from './types'

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  m: Messages
  t: (template: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function applyDocumentLocale(locale: Locale, messages: Messages): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale === 'zh-CN' ? 'zh-CN' : 'en'
  document.title = messages.app.name
  const meta = document.querySelector('meta[name="description"]')
  if (meta) meta.setAttribute('content', messages.app.description)
}

type ProviderProps = {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  children: ReactNode
}

export function I18nProvider({ locale, onLocaleChange, children }: ProviderProps) {
  const m = CATALOG[locale] ?? CATALOG[DEFAULT_LOCALE]

  useEffect(() => {
    applyDocumentLocale(locale, m)
  }, [locale, m])

  const t = useCallback(
    (template: string, vars?: Record<string, string | number>) =>
      interpolate(template, vars),
    [],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale: onLocaleChange,
      m,
      t,
    }),
    [locale, onLocaleChange, m, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}
