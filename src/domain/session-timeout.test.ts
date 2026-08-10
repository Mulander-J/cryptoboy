import { describe, expect, it } from 'vitest'
import type { LevelConfig, Password } from './types'
import { createSession, reduceSession } from './session'

const nightmareConfig: LevelConfig = {
  index: 1,
  colorCount: 8,
  allowRepeat: true,
  hintStyle: 'summary',
  difficulty: 'nightmare',
  timerMode: 'countdown',
  timeLimitMs: 60_000,
}

const secret = ['R', 'O', 'Y', 'G'] as unknown as Password

describe('TIMEOUT 判负', () => {
  it('编辑中超时 → lost + timeout', () => {
    let s = createSession(secret, nightmareConfig)
    s = reduceSession(s, { type: 'TIMEOUT' })
    expect(s.status).toBe('lost')
    expect(s.loseReason).toBe('timeout')
  })

  it('已胜利后忽略 TIMEOUT', () => {
    let s = createSession(secret, nightmareConfig)
    for (let i = 0; i < 4; i++) {
      s = reduceSession(s, { type: 'SET_SLOT', index: i, color: secret[i]! })
    }
    s = reduceSession(s, { type: 'SUBMIT' })
    expect(s.status).toBe('won')
    s = reduceSession(s, { type: 'TIMEOUT' })
    expect(s.status).toBe('won')
    expect(s.loseReason).toBeNull()
  })
})
