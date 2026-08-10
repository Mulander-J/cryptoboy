import { describe, expect, it } from 'vitest'
import { resolveFateCasePlayMode, THEME_FATE_CASE_PLAY_MODE } from '@/domain/fateCase'
import { CATALOG } from '@/i18n/messages'
import { DEFAULT_THEME, isThemeId, resolveTheme, THEME_IDS, THEMES } from './themes'

describe('themes catalog', () => {
  it('主题列表齐全且与 meta 对齐', () => {
    expect(THEME_IDS).toHaveLength(9)
    expect(THEMES.map((t) => t.id)).toEqual([...THEME_IDS])
    expect(THEME_IDS[0]).toBe('classic')
    expect(CATALOG['zh-CN'].theme.labels.xmas).toBe('欢乐圣诞')
    expect(CATALOG['zh-CN'].theme.labels.cny).toBe('祥瑞新春')
    expect(CATALOG.en.theme.labels.xmas).toBe('Christmas')
    // 绿系邻近：堆目 → 圣诞
    expect(THEME_IDS.indexOf('xmas') - THEME_IDS.indexOf('sanxingdui')).toBe(1)
    // 红金邻近：寻梅 → 新春 → 战车 → 美国
    expect(THEME_IDS.indexOf('cny') - THEME_IDS.indexOf('plum-snow')).toBe(1)
    expect(THEME_IDS.indexOf('panzer') - THEME_IDS.indexOf('cny')).toBe(1)
    expect(THEME_IDS.indexOf('americana') - THEME_IDS.indexOf('panzer')).toBe(1)
  })

  it('三色点：外壳 + 旋钮 + 按钮', () => {
    for (const t of THEMES) {
      expect(t.swatchShell).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(t.swatchKnob).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(t.swatchButton).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('resolveTheme 校验、迁移与回退', () => {
    expect(resolveTheme('xmas')).toBe('xmas')
    expect(resolveTheme('cny')).toBe('cny')
    expect(resolveTheme('nope')).toBe(DEFAULT_THEME)
    expect(resolveTheme('macintosh')).toBe('classic')
    expect(isThemeId('cny')).toBe(true)
  })

  it('全部主题默认厄运时刻玩法为左轮', () => {
    for (const id of THEME_IDS) {
      expect(THEME_FATE_CASE_PLAY_MODE[id]).toBe('revolver')
      expect(resolveFateCasePlayMode(id)).toBe('revolver')
    }
  })
})
