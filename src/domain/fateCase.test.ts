import { describe, expect, it } from 'vitest'
import type { Guess, Password } from './types'
import {
  FATE_CASE_LAPS,
  FATE_CASE_SPIN_MS,
  FATE_CASE_TIME_FLOOR_MS,
  applyFateCaseTimeReset,
  buildChamber,
  buildFateCasePhase,
  hangingCandidates,
  hangingSlotIndex,
  resolveFateCaseAutoStart,
  resolveFateCaseEnabled,
  resolveFateCaseOneShot,
  resolveFateCasePlayMode,
  resolveFateCaseSpinSpeed,
  THEME_FATE_CASE_PLAY_MODE,
  resolveShot,
  fateCaseSpeedRating,
  sanitizeSpinSpeed,
} from './fateCase'

const secret = ['R', 'O', 'Y', 'G'] as unknown as Password

describe('fateCase', () => {
  it('sanitizeSpinSpeed；各档均为整圈（避免半圈不公平）', () => {
    expect(sanitizeSpinSpeed(1)).toBe(1)
    expect(sanitizeSpinSpeed(5)).toBe(5)
    expect(sanitizeSpinSpeed(0)).toBe(3)
    expect(sanitizeSpinSpeed(9)).toBe(3)
    for (const speed of [1, 2, 3, 4, 5] as const) {
      const laps = FATE_CASE_TIME_FLOOR_MS / FATE_CASE_SPIN_MS[speed]
      expect(laps).toBe(FATE_CASE_LAPS[speed])
      expect(Number.isInteger(laps)).toBe(true)
    }
    expect(FATE_CASE_LAPS[4]).toBe(4)
    expect(FATE_CASE_LAPS[5]).toBe(5)
    expect(fateCaseSpeedRating(1)).toBe(33) // 1/3*100 · 慢易瞄
    expect(fateCaseSpeedRating(5)).toBe(167) // 5/3*100 · 快难锁
  })

  it('resolveFateCaseEnabled：噩梦/无尽开，试炼跟随开关，限时试炼不因 difficulty 误开', () => {
    expect(resolveFateCaseEnabled('solo', 'nightmare')).toBe(true)
    expect(resolveFateCaseEnabled('solo', 'easy')).toBe(false)
    expect(resolveFateCaseEnabled('solo', 'advanced')).toBe(false)
    expect(resolveFateCaseEnabled('endless', 'nightmare')).toBe(true)
    expect(resolveFateCaseEnabled('practice', 'nightmare', false)).toBe(false)
    expect(resolveFateCaseEnabled('practice', 'nightmare', true)).toBe(true)
    expect(resolveFateCaseEnabled('practice', 'advanced', true)).toBe(true)
  })

  it('噩梦转速 3 手动开始；无尽转速 5 自动开始；试炼跟随选项', () => {
    expect(resolveFateCaseSpinSpeed('solo', 'nightmare')).toBe(3)
    expect(resolveFateCaseAutoStart('solo', 'nightmare')).toBe(false)
    expect(resolveFateCaseOneShot('solo', 'nightmare')).toBe(false)
    expect(resolveFateCaseSpinSpeed('endless', 'nightmare')).toBe(5)
    expect(resolveFateCaseAutoStart('endless', 'nightmare')).toBe(true)
    expect(resolveFateCaseOneShot('endless', 'nightmare')).toBe(true)
    expect(resolveFateCaseSpinSpeed('practice', 'advanced', 2)).toBe(2)
    expect(resolveFateCaseAutoStart('practice', 'advanced', true)).toBe(true)
    expect(resolveFateCaseAutoStart('practice', 'advanced', false)).toBe(false)
    expect(resolveFateCaseOneShot('practice', 'advanced')).toBe(false)
    expect(resolveFateCaseOneShot('practice', 'advanced', true)).toBe(true)
  })

  it('左轮 ⊂ Fate Case：全部主题默认 revolver；显式配置优先', () => {
    for (const id of Object.keys(THEME_FATE_CASE_PLAY_MODE)) {
      expect(resolveFateCasePlayMode(id)).toBe('revolver')
    }
    expect(resolveFateCasePlayMode(undefined)).toBe('revolver')
    expect(resolveFateCasePlayMode('unknown-theme')).toBe('revolver')
    expect(resolveFateCasePlayMode('classic', 'revolver')).toBe('revolver')
  })

  it('hangingSlotIndex：exact 3 才有悬格', () => {
    const g3 = ['R', 'O', 'Y', 'B'] as unknown as Guess
    expect(hangingSlotIndex(secret, g3)).toBe(3)
    const g2 = ['R', 'O', 'B', 'P'] as unknown as Guess
    expect(hangingSlotIndex(secret, g2)).toBe(-1)
    const g4 = ['R', 'O', 'Y', 'G'] as unknown as Guess
    expect(hangingSlotIndex(secret, g4)).toBe(-1)
  })

  it('无重复 4 色：候选项唯一 → 弹巢含空弹', () => {
    const guess = ['R', 'O', 'Y', 'B'] as unknown as Guess
    const candidates = hangingCandidates(secret, guess, {
      colorCount: 4,
      allowRepeat: false,
    })
    expect(candidates).toEqual(['G'])
    expect(buildChamber(candidates)).toEqual(['G', 'blank'])
  })

  it('无重复 5 色：两候选项 → 不加空弹', () => {
    const guess = ['R', 'O', 'Y', 'B'] as unknown as Guess
    const candidates = hangingCandidates(secret, guess, {
      colorCount: 5,
      allowRepeat: false,
    })
    expect(candidates).toHaveLength(2)
    expect(buildChamber(candidates)).not.toContain('blank')
  })

  it('可重复：色板全开 → 不加空弹', () => {
    const guess = ['R', 'O', 'Y', 'B'] as unknown as Guess
    const candidates = hangingCandidates(secret, guess, {
      colorCount: 6,
      allowRepeat: true,
    })
    expect(candidates).toHaveLength(6)
    expect(buildChamber(candidates)).toHaveLength(6)
    expect(buildChamber(candidates)).not.toContain('blank')
  })

  it('buildFateCasePhase 与 resolveShot', () => {
    const guess = ['R', 'O', 'Y', 'B'] as unknown as Guess
    const phase = buildFateCasePhase(secret, guess, {
      colorCount: 6,
      allowRepeat: true,
    })
    expect(phase).not.toBeNull()
    expect(phase!.playMode).toBe('revolver')
    expect(phase!.hangingIndex).toBe(3)
    expect(phase!.locks).toEqual(['R', 'O', 'Y', null])
    expect(resolveShot('G', secret, 3)).toBe('hit')
    expect(resolveShot('B', secret, 3)).toBe('miss')
    expect(resolveShot('blank', secret, 3)).toBe('miss')
  })

  it('倒计时入左轮统一重置为 3s', () => {
    expect(FATE_CASE_TIME_FLOOR_MS).toBe(3_000)
    expect(applyFateCaseTimeReset(500)).toBe(FATE_CASE_TIME_FLOOR_MS)
    expect(applyFateCaseTimeReset(10_000)).toBe(FATE_CASE_TIME_FLOOR_MS)
  })
})
