import type { ColorToken } from './types'
import { COLOR_IDS } from './types'

export type ColorMeta = {
  id: ColorToken
  name: string
  hex: string
  symbol: string
}

export const COLOR_META: Record<ColorToken, ColorMeta> = {
  R: { id: 'R', name: '红', hex: '#E53935', symbol: '△' },
  O: { id: 'O', name: '橙', hex: '#FB8C00', symbol: '○' },
  Y: { id: 'Y', name: '黄', hex: '#FDD835', symbol: '□' },
  G: { id: 'G', name: '绿', hex: '#43A047', symbol: '◇' },
  B: { id: 'B', name: '蓝', hex: '#1E88E5', symbol: '+' },
  P: { id: 'P', name: '紫', hex: '#8E24AA', symbol: '★' },
  C: { id: 'C', name: '青', hex: '#00ACC1', symbol: '◎' },
  K: { id: 'K', name: '粉', hex: '#EC407A', symbol: '✦' },
}

/** MVP 默认 6 色（不含青/粉） */
export const DEFAULT_COLOR_COUNT = 6

export function colorsForCount(colorCount: number): ColorToken[] {
  const n = Math.min(Math.max(colorCount, 1), COLOR_IDS.length)
  return COLOR_IDS.slice(0, n)
}

export function nextColor(
  current: ColorToken | null,
  palette: readonly ColorToken[],
): ColorToken {
  if (palette.length === 0) {
    throw new Error('调色板为空')
  }
  if (current === null) {
    return palette[0]!
  }
  const idx = palette.indexOf(current)
  if (idx < 0) {
    return palette[0]!
  }
  return palette[(idx + 1) % palette.length]!
}
