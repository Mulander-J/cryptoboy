import { describe, expect, it } from 'vitest'
import { COLOR_META } from './colors'
import { COLOR_IDS } from './types'

describe('COLOR_META', () => {
  it('八色各有互异色盲符号', () => {
    const symbols = COLOR_IDS.map((id) => COLOR_META[id].symbol)
    expect(symbols.every((s) => s.length > 0)).toBe(true)
    expect(new Set(symbols).size).toBe(COLOR_IDS.length)
  })
})
