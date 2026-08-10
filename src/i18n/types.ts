export const LOCALES = ['zh-CN', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'zh-CN'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** 浏览器语言 → 支持的 locale；未知则中文 */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]
  for (const raw of langs) {
    const lower = raw.toLowerCase()
    if (lower.startsWith('zh')) return 'zh-CN'
    if (lower.startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}

export function resolveLocale(value: unknown): Locale {
  if (isLocale(value)) return value
  return DEFAULT_LOCALE
}

/**
 * 语言：优先客户端检测；其次读缓存。
 * 有合法缓存（含用户手动切换写入）时用缓存，否则 detectLocale()。
 */
export function resolveInitialLocale(cached: unknown): Locale {
  if (isLocale(cached)) return cached
  return detectLocale()
}
