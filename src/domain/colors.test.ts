import { describe, expect, it } from 'vitest'
import { COLOR_META, colorsForCount } from './colors'
import { COLOR_IDS } from './types'

describe('COLOR_META', () => {
  it('八色各有互异色盲符号', () => {
    const symbols = COLOR_IDS.map((id) => COLOR_META[id].symbol)
    expect(symbols.every((s) => s.length > 0)).toBe(true)
    expect(new Set(symbols).size).toBe(COLOR_IDS.length)
  })
})

describe('colorsForCount', () => {
  it('八色按彩虹光谱排序', () => {
    expect(colorsForCount(8)).toEqual(['R', 'O', 'Y', 'G', 'C', 'B', 'P', 'K'])
  })

  it('六色集合不含青/粉，光谱序为红橙黄绿蓝紫', () => {
    expect(colorsForCount(6)).toEqual(['R', 'O', 'Y', 'G', 'B', 'P'])
  })

  it('七色加入青并插在绿蓝之间', () => {
    expect(colorsForCount(7)).toEqual(['R', 'O', 'Y', 'G', 'C', 'B', 'P'])
  })
})
