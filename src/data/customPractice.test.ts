import { describe, expect, it } from 'vitest'
import {
  applyIntensity,
  customOptionsToLevelConfig,
  optionsFromDifficulty,
  sanitizeOptions,
} from './customPractice'

describe('customPractice', () => {
  it('难度预设套用默认组合', () => {
    const o = applyIntensity(5)
    expect(o.colorCount).toBe(8)
    expect(o.allowRepeat).toBe(true)
    expect(o.timed).toBe(true)
    expect('presetSecret' in o).toBe(false)
  })

  it('闯关三档映射到难度预设 2/3/5', () => {
    const easy = optionsFromDifficulty('easy')
    expect(easy.intensity).toBe(2)
    expect(easy.hintStyle).toBe('column')
    expect(easy.timed).toBe(false)

    expect(optionsFromDifficulty('advanced').intensity).toBe(3)

    const nm = optionsFromDifficulty('nightmare')
    expect(nm.intensity).toBe(5)
    expect(nm.timed).toBe(true)
    expect(nm.allowRepeat).toBe(true)
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
