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
    expect('fateCase' in o).toBe(false)
    expect('fateCaseAutoStart' in o).toBe(false)
    expect('fateCaseOneShot' in o).toBe(false)
    expect('fateCaseDifficulty' in o).toBe(false)
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
      fateCase: true,
      fateCaseAutoStart: true,
      fateCaseOneShot: true,
      fateCaseDifficulty: 5,
    })
    expect(cfg.colorCount).toBe(7)
    expect(cfg.timerMode).toBe('countdown')
    expect(cfg.timeLimitMs).toBe(60_000)
    expect(cfg.fateCaseEnabled).toBe(true)
    expect(cfg.fateCaseAutoStart).toBe(true)
    expect(cfg.fateCaseOneShot).toBe(true)
    expect(cfg.fateCaseDifficulty).toBe(5)
  })

  it('sanitize 校正非法值并默认厄运子项；intensity 恒为 3', () => {
    const o = sanitizeOptions({
      colorCount: 99,
      timeLimitSec: 12,
      hintStyle: 'nope' as never,
      intensity: 5,
      fateCaseDifficulty: 9 as never,
    })
    expect(o.colorCount).toBe(8)
    expect(o.timeLimitSec).toBe(90)
    expect(o.hintStyle).toBe('summary')
    expect(o.presetSecret).toBe(false)
    expect(o.fateCase).toBe(false)
    expect(o.fateCaseAutoStart).toBe(false)
    expect(o.fateCaseOneShot).toBe(false)
    expect(o.fateCaseDifficulty).toBe(3)
    expect(o.intensity).toBe(3)
  })

  it('sanitize 保留 presetSecret / fateCase 子项', () => {
    expect(sanitizeOptions({ presetSecret: true }).presetSecret).toBe(true)
    expect(sanitizeOptions({ fateCase: true }).fateCase).toBe(true)
    expect(sanitizeOptions({ fateCase: true, fateCaseAutoStart: true }).fateCaseAutoStart).toBe(
      true,
    )
    expect(sanitizeOptions({ fateCaseOneShot: true }).fateCaseOneShot).toBe(true)
    expect(sanitizeOptions({ fateCaseDifficulty: 2 }).fateCaseDifficulty).toBe(2)
  })

  it('限时试炼 difficulty=nightmare 但 fateCase 默认关', () => {
    const cfg = customOptionsToLevelConfig({
      intensity: 5,
      colorCount: 8,
      allowRepeat: true,
      hintStyle: 'summary',
      timed: true,
      timeLimitSec: 90,
      presetSecret: false,
      fateCase: false,
      fateCaseAutoStart: true,
      fateCaseOneShot: true,
      fateCaseDifficulty: 4,
    })
    expect(cfg.difficulty).toBe('nightmare')
    expect(cfg.fateCaseEnabled).toBe(false)
    expect(cfg.fateCaseAutoStart).toBe(false)
    expect(cfg.fateCaseDifficulty).toBe(4)
    // 总开关关时不带出一枪定负
    expect(cfg.fateCaseOneShot).toBe(false)
  })
})
