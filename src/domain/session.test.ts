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
})
