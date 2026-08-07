import { describe, expect, it } from 'vitest'
import {
  applyIntensity,
  customOptionsToLevelConfig,
  optionsFromDifficulty,
  sanitizeOptions,
} from './customPractice'

describe('customPractice', () => {
  it('难度系数套用默认组合', () => {
    const o = applyIntensity(5)
    expect(o.colorCount).toBe(8)
    expect(o.allowRepeat).toBe(true)
    expect(o.timed).toBe(true)
    expect('presetSecret' in o).toBe(false)
  })

  it('快捷档复用 Easy/挑战', () => {
    const easy = optionsFromDifficulty('easy')
    expect(easy.hintStyle).toBe('column')
    expect(easy.timed).toBe(false)

    const ch = optionsFromDifficulty('challenge')
    expect(ch.timed).toBe(true)
    expect(ch.allowRepeat).toBe(true)
  })

  it('转为 LevelConfig', () => {
    const cfg = customOptionsToLevelConfig({
      intensity: 4,
      colorCount: 7,
      allowRepeat: true,
      hintStyle: 'summary',
      timed: true,
      timeLimitSec: 60,
      presetSecret: true,
    })
    expect(cfg.colorCount).toBe(7)
    expect(cfg.timerMode).toBe('countdown')
    expect(cfg.timeLimitMs).toBe(60_000)
  })

  it('sanitize 校正非法值并默认 presetSecret', () => {
    const o = sanitizeOptions({ colorCount: 99, timeLimitSec: 12, hintStyle: 'nope' as never })
    expect(o.colorCount).toBe(8)
    expect(o.timeLimitSec).toBe(90)
    expect(o.hintStyle).toBe('summary')
    expect(o.presetSecret).toBe(false)
  })

  it('sanitize 保留 presetSecret', () => {
    expect(sanitizeOptions({ presetSecret: true }).presetSecret).toBe(true)
  })
})
