import { describe, expect, it } from 'vitest'
import type { LevelConfig, Password } from './types'
import { createSession, isGuessComplete, reduceSession } from './session'

const config: LevelConfig = {
  index: 1,
  colorCount: 6,
  allowRepeat: false,
  hintStyle: 'summary',
  difficulty: 'advanced',
  timerMode: 'countup',
}

const secret = ['R', 'O', 'Y', 'G'] as unknown as Password

describe('GameSession', () => {
  it('创建时处于 editing', () => {
    const s = createSession(secret, config)
    expect(s.status).toBe('editing')
    expect(s.attempts).toHaveLength(0)
    expect(s.cursor).toBe(0)
  })

  it('循环换色与移格', () => {
    let s = createSession(secret, config)
    s = reduceSession(s, { type: 'CYCLE_SLOT' })
    expect(s.currentGuess[0]).toBe('R')
    s = reduceSession(s, { type: 'NEXT_SLOT' })
    expect(s.cursor).toBe(1)
    s = reduceSession(s, { type: 'SET_SLOT', index: 1, color: 'B' })
    expect(s.currentGuess[1]).toBe('B')
  })

  it('未填满不可提交', () => {
    let s = createSession(secret, config)
    s = reduceSession(s, { type: 'SET_SLOT', index: 0, color: 'R' })
    s = reduceSession(s, { type: 'SUBMIT' })
    expect(s.attempts).toHaveLength(0)
    expect(isGuessComplete(s.currentGuess)).toBe(false)
  })

  it('猜对获胜', () => {
    let s = createSession(secret, config)
    for (let i = 0; i < 4; i++) {
      s = reduceSession(s, {
        type: 'SET_SLOT',
        index: i,
        color: secret[i]!,
      })
    }
    s = reduceSession(s, { type: 'SUBMIT' })
    expect(s.status).toBe('won')
    expect(s.attempts).toHaveLength(1)
    expect(s.attempts[0]!.feedback.exactCount).toBe(4)
  })

  it('七次用尽失败', () => {
    let s = createSession(secret, config)
    const wrong: Password = ['B', 'P', 'B', 'P'] as unknown as Password
    for (let n = 0; n < 7; n++) {
      for (let i = 0; i < 4; i++) {
        s = reduceSession(s, { type: 'SET_SLOT', index: i, color: wrong[i]! })
      }
      s = reduceSession(s, { type: 'SUBMIT' })
    }
    expect(s.status).toBe('lost')
    expect(s.loseReason).toBe('attempts')
    expect(s.attempts).toHaveLength(7)
  })

  it('Easy 提交带 perSlot', () => {
    const easyConfig: LevelConfig = { ...config, hintStyle: 'column', difficulty: 'easy' }
    let s = createSession(secret, easyConfig)
    const g: Password = ['R', 'Y', 'B', 'O'] as unknown as Password
    for (let i = 0; i < 4; i++) {
      s = reduceSession(s, { type: 'SET_SLOT', index: i, color: g[i]! })
    }
    s = reduceSession(s, { type: 'SUBMIT' })
    expect(s.attempts[0]!.feedback.perSlot).toEqual([
      'exact',
      'present',
      'absent',
      'present',
    ])
  })

  it('结束后忽略编辑，RESTART 重置', () => {
    let s = createSession(secret, config)
    for (let i = 0; i < 4; i++) {
      s = reduceSession(s, { type: 'SET_SLOT', index: i, color: secret[i]! })
    }
    s = reduceSession(s, { type: 'SUBMIT' })
    expect(s.status).toBe('won')
    s = reduceSession(s, { type: 'CYCLE_SLOT' })
    expect(s.currentGuess[0]).toBeNull()
    s = reduceSession(s, { type: 'RESTART', secret })
    expect(s.status).toBe('editing')
    expect(s.attempts).toHaveLength(0)
  })

  it('左轮一枪定负：失靶即负；命中即胜', () => {
    const revConfig: LevelConfig = {
      ...config,
      difficulty: 'nightmare',
      timerMode: 'countdown',
      timeLimitMs: 60_000,
      fateCaseEnabled: true,
      fateCaseOneShot: true,
    }
    let s = createSession(secret, revConfig)
    const almost: Password = ['R', 'O', 'Y', 'B'] as unknown as Password
    for (let i = 0; i < 4; i++) {
      s = reduceSession(s, { type: 'SET_SLOT', index: i, color: almost[i]! })
    }
    s = reduceSession(s, { type: 'SUBMIT' })
    expect(s.status).toBe('fateCase')
    expect(s.fateCase?.hangingIndex).toBe(3)

    const miss = reduceSession(s, { type: 'FIRE', choice: 'blank' })
    expect(miss.status).toBe('lost')
    expect(miss.loseReason).toBe('fateCase')
    expect(miss.fateCaseShot).toBe('blank')

    const hit = reduceSession(s, { type: 'FIRE', choice: 'G' })
    expect(hit.status).toBe('won')
    expect(hit.fateCaseShot).toBe('G')
  })

  it('厄运时刻可连开：失靶仍保持 fateCase，再开枪可胜', () => {
    const revConfig: LevelConfig = {
      ...config,
      difficulty: 'nightmare',
      timerMode: 'countdown',
      timeLimitMs: 60_000,
      fateCaseEnabled: true,
      fateCaseOneShot: false,
    }
    let s = createSession(secret, revConfig)
    const almost: Password = ['R', 'O', 'Y', 'B'] as unknown as Password
    for (let i = 0; i < 4; i++) {
      s = reduceSession(s, { type: 'SET_SLOT', index: i, color: almost[i]! })
    }
    s = reduceSession(s, { type: 'SUBMIT' })
    s = reduceSession(s, { type: 'FIRE', choice: 'blank' })
    expect(s.status).toBe('fateCase')
    expect(s.loseReason).toBeNull()
    expect(s.fateCaseShot).toBe('blank')
    s = reduceSession(s, { type: 'FIRE', choice: 'G' })
    expect(s.status).toBe('won')
    expect(s.fateCaseShot).toBe('G')
  })

  it('左轮优先于第 7 次 attempts 判负', () => {
    const revConfig: LevelConfig = { ...config, fateCaseEnabled: true }
    let s = createSession(secret, revConfig)
    const wrong: Password = ['B', 'P', 'B', 'P'] as unknown as Password
    for (let n = 0; n < 6; n++) {
      for (let i = 0; i < 4; i++) {
        s = reduceSession(s, { type: 'SET_SLOT', index: i, color: wrong[i]! })
      }
      s = reduceSession(s, { type: 'SUBMIT' })
    }
    const almost: Password = ['R', 'O', 'Y', 'B'] as unknown as Password
    for (let i = 0; i < 4; i++) {
      s = reduceSession(s, { type: 'SET_SLOT', index: i, color: almost[i]! })
    }
    s = reduceSession(s, { type: 'SUBMIT' })
    expect(s.status).toBe('fateCase')
    expect(s.loseReason).toBeNull()
    expect(s.attempts).toHaveLength(7)
  })

  it('左轮期间可 TIMEOUT；编辑动作忽略', () => {
    const revConfig: LevelConfig = { ...config, fateCaseEnabled: true }
    let s = createSession(secret, revConfig)
    const almost: Password = ['R', 'O', 'Y', 'B'] as unknown as Password
    for (let i = 0; i < 4; i++) {
      s = reduceSession(s, { type: 'SET_SLOT', index: i, color: almost[i]! })
    }
    s = reduceSession(s, { type: 'SUBMIT' })
    s = reduceSession(s, { type: 'CYCLE_SLOT' })
    expect(s.status).toBe('fateCase')
    s = reduceSession(s, { type: 'TIMEOUT' })
    expect(s.status).toBe('lost')
    expect(s.loseReason).toBe('timeout')
  })
})
