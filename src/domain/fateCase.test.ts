import { describe, expect, it } from 'vitest'
import type { Guess, Password } from './types'
import {
  FATE_CASE_SPIN_MS,
  FATE_CASE_TIME_FLOOR_MS,
  buildChamber,
  buildFateCasePhase,
  hangingCandidates,
  hangingSlotIndex,
  resolveFateCasePlayMode,
  resolveFateCaseRuntime,
  THEME_FATE_CASE_PLAY_MODE,
  resolveShot,
  sanitizeFateCaseDifficulty,
} from './fateCase'

const secret = ['R', 'O', 'Y', 'G'] as unknown as Password

describe('fateCase', () => {
  it('sanitizeFateCaseDifficulty；各档整周期均分窗口', () => {
    expect(sanitizeFateCaseDifficulty(1)).toBe(1)
    expect(sanitizeFateCaseDifficulty(5)).toBe(5)
    expect(sanitizeFateCaseDifficulty(0)).toBe(3)
    expect(sanitizeFateCaseDifficulty(9)).toBe(3)
    for (const tier of [1, 2, 3, 4, 5] as const) {
      expect(FATE_CASE_TIME_FLOOR_MS / FATE_CASE_SPIN_MS[tier]).toBe(tier)
    }
  })

  it('resolveFateCaseRuntime：噩梦/无尽默认；试炼跟随开关', () => {
    expect(resolveFateCaseRuntime('solo', 'nightmare').enabled).toBe(true)
    expect(resolveFateCaseRuntime('solo', 'easy').enabled).toBe(false)
    expect(resolveFateCaseRuntime('endless', 'nightmare').enabled).toBe(true)
    expect(resolveFateCaseRuntime('practice', 'advanced', { fateCaseEnabled: true }).enabled).toBe(
      true,
    )
    expect(resolveFateCaseRuntime('practice', 'nightmare', {}).enabled).toBe(false)

    const nightmare = resolveFateCaseRuntime('solo', 'nightmare')
    expect(nightmare).toMatchObject({ difficulty: 3, autoStart: false, oneShot: false })

    const endless = resolveFateCaseRuntime('endless', 'nightmare')
    expect(endless).toMatchObject({ difficulty: 5, autoStart: true, oneShot: true })

    const practice = resolveFateCaseRuntime('practice', 'advanced', {
      fateCaseDifficulty: 2,
      fateCaseAutoStart: true,
      fateCaseOneShot: true,
    })
    expect(practice).toMatchObject({ difficulty: 2, autoStart: true, oneShot: true })
  })

  it('主题映射：americana→revolver；其余→beat；显式配置优先', () => {
    expect(THEME_FATE_CASE_PLAY_MODE.americana).toBe('revolver')
    expect(resolveFateCasePlayMode('americana')).toBe('revolver')
    expect(resolveFateCasePlayMode('classic')).toBe('beat')
    expect(resolveFateCasePlayMode(undefined)).toBe('beat')
    expect(resolveFateCasePlayMode('americana', 'beat')).toBe('beat')
  })

  it('hangingSlotIndex：exact 3 才有悬格', () => {
    expect(hangingSlotIndex(secret, ['R', 'O', 'Y', 'B'] as unknown as Guess)).toBe(3)
    expect(hangingSlotIndex(secret, ['R', 'O', 'B', 'P'] as unknown as Guess)).toBe(-1)
    expect(hangingSlotIndex(secret, ['R', 'O', 'Y', 'G'] as unknown as Guess)).toBe(-1)
  })

  it('buildChamber：唯一候选项追加空弹', () => {
    const guess = ['R', 'O', 'Y', 'B'] as unknown as Guess
    expect(hangingCandidates(secret, guess, { colorCount: 4, allowRepeat: false })).toEqual(['G'])
    expect(buildChamber(['G'])).toEqual(['G', 'blank'])
    expect(buildChamber(['G', 'B'])).not.toContain('blank')
    expect(
      hangingCandidates(secret, guess, { colorCount: 6, allowRepeat: true }),
    ).toHaveLength(6)
  })

  it('buildFateCasePhase 与 resolveShot', () => {
    const guess = ['R', 'O', 'Y', 'B'] as unknown as Guess
    const phase = buildFateCasePhase(secret, guess, { colorCount: 6, allowRepeat: true })
    expect(phase).toMatchObject({
      playMode: 'beat',
      hangingIndex: 3,
      locks: ['R', 'O', 'Y', null],
    })
    expect(resolveShot('G', secret, 3)).toBe('hit')
    expect(resolveShot('B', secret, 3)).toBe('miss')
    expect(resolveShot('blank', secret, 3)).toBe('miss')
    expect(
      buildFateCasePhase(secret, guess, {
        colorCount: 6,
        allowRepeat: true,
        fateCasePlayMode: 'revolver',
      })!.playMode,
    ).toBe('revolver')
  })
})
