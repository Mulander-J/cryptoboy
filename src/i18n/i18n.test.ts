import { describe, expect, it } from 'vitest'
import { CATALOG, interpolate, localeShapeKeys } from './messages'
import { isLocale, resolveLocale } from './types'

describe('i18n catalog', () => {
  it('zh-CN / en 均含 CryptoBoy 与完整主题', () => {
    expect(CATALOG['zh-CN'].app.name).toBe('CryptoBoy')
    expect(CATALOG.en.app.name).toBe('CryptoBoy')
    expect(Object.keys(CATALOG['zh-CN'].theme.labels)).toHaveLength(9)
    expect(Object.keys(CATALOG.en.theme.labels)).toHaveLength(9)
    expect(CATALOG['zh-CN'].help.steps).toHaveLength(CATALOG.en.help.steps.length)
  })

  it('两语 JSON 结构键对齐', () => {
    expect(localeShapeKeys(CATALOG['zh-CN'])).toEqual(localeShapeKeys(CATALOG.en))
  })

  it('resolveLocale 与插值', () => {
    expect(isLocale('en')).toBe(true)
    expect(resolveLocale('nope')).toBe('zh-CN')
    expect(interpolate('第 {level} 关', { level: 3 })).toBe('第 3 关')
  })
})
