import { describe, expect, it } from 'vitest'
import { generate, levelSeed } from './generate'

describe('generate', () => {
  it('相同 seed + config 结果一致', () => {
    const a = generate(42, { colorCount: 6, allowRepeat: false })
    const b = generate(42, { colorCount: 6, allowRepeat: false })
    expect(a).toEqual(b)
  })

  it('不同 seed 通常不同', () => {
    const a = generate(1, { colorCount: 6, allowRepeat: false })
    const b = generate(2, { colorCount: 6, allowRepeat: false })
    expect(a).not.toEqual(b)
  })

  it('无重复：四色互异', () => {
    for (let seed = 0; seed < 50; seed++) {
      const pwd = generate(seed, { colorCount: 6, allowRepeat: false })
      expect(new Set(pwd).size).toBe(4)
    }
  })

  it('颜色落在调色板内', () => {
    const palette = new Set(['R', 'O', 'Y', 'G'])
    const pwd = generate(99, { colorCount: 4, allowRepeat: false })
    for (const c of pwd) {
      expect(palette.has(c)).toBe(true)
    }
  })

  it('无重复且颜色不足时抛错', () => {
    expect(() => generate(1, { colorCount: 3, allowRepeat: false })).toThrow()
  })
})

describe('levelSeed', () => {
  it('同难度同关卡稳定', () => {
    expect(levelSeed('easy', 1)).toBe(levelSeed('easy', 1))
  })

  it('不同关卡不同种子', () => {
    expect(levelSeed('easy', 1)).not.toBe(levelSeed('easy', 2))
  })
})
