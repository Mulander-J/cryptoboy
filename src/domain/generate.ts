import { colorsForCount } from './colors'
import type { ColorToken, GenerateConfig, Password } from './types'

/** Mulberry32：确定性 PRNG */
export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * 由 seed + config 确定性生成 4 位密码。
 * MVP：默认无重复；allowRepeat 时可重复。
 */
export function generate(seed: number, config: GenerateConfig): Password {
  const palette = colorsForCount(config.colorCount)
  if (palette.length < 1) {
    throw new Error('颜色数无效')
  }
  if (!config.allowRepeat && palette.length < 4) {
    throw new Error('无重复模式下颜色数至少为 4')
  }

  const rng = createRng(seed)
  const result: ColorToken[] = []

  if (config.allowRepeat) {
    for (let i = 0; i < 4; i++) {
      const idx = Math.floor(rng() * palette.length)
      result.push(palette[idx]!)
    }
  } else {
    const pool = [...palette]
    for (let i = 0; i < 4; i++) {
      const idx = Math.floor(rng() * pool.length)
      result.push(pool[idx]!)
      pool.splice(idx, 1)
    }
  }

  return result as unknown as Password
}

/** 关卡种子：难度 + 关卡序号 → 稳定 hash */
export function levelSeed(difficulty: string, levelIndex: number, salt = 0xc0de): number {
  let h = salt >>> 0
  const key = `${difficulty}:${levelIndex}`
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 0x01000193)
  }
  return h >>> 0
}
