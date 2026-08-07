import { describe, expect, it } from 'vitest'
import { CATALOG } from '../../i18n/messages'
import { GAME_SHORTCUT_KEYS, isEditableTarget } from './shortcuts'

describe('shortcuts helpers', () => {
  it('快捷键表非空且含 Enter / Esc / 数字选色', () => {
    expect(GAME_SHORTCUT_KEYS.length).toBeGreaterThanOrEqual(4)
    const joined = GAME_SHORTCUT_KEYS.map((r) => r.keys).join('|')
    expect(joined).toMatch(/Enter/)
    expect(joined).toMatch(/Esc/)
    expect(joined).toMatch(/1/)
    expect(CATALOG.en.shortcuts).toHaveLength(GAME_SHORTCUT_KEYS.length)
    expect(CATALOG['zh-CN'].shortcuts.some((s) => s.keys.includes('Enter'))).toBe(true)
  })

  it('空目标不算可编辑', () => {
    expect(isEditableTarget(null)).toBe(false)
  })
})
