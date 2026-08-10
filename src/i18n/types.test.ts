import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectLocale, resolveInitialLocale } from './types'

describe('resolveInitialLocale', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('有合法缓存时用缓存', () => {
    vi.stubGlobal('navigator', { language: 'en-US', languages: ['en-US'] })
    expect(resolveInitialLocale('zh-CN')).toBe('zh-CN')
  })

  it('无缓存时客户端检测', () => {
    vi.stubGlobal('navigator', { language: 'en-GB', languages: ['en-GB'] })
    expect(resolveInitialLocale(undefined)).toBe('en')
    expect(detectLocale()).toBe('en')
  })

  it('非法缓存回退检测', () => {
    vi.stubGlobal('navigator', { language: 'zh-TW', languages: ['zh-TW'] })
    expect(resolveInitialLocale('fr')).toBe('zh-CN')
  })
})
