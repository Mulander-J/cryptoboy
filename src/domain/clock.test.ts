import { describe, expect, it } from 'vitest'
import {
  createClock,
  elapsedMs,
  formatMmSs,
  freeze,
  isUrgent,
  pause,
  resume,
  scoreElapsedMs,
  setCountdownRemaining,
  tick,
} from './clock'

describe('GameClock', () => {
  it('正计时累加', () => {
    let c = createClock({ timerMode: 'countup' })
    c = tick(c, 1500)
    c = tick(c, 500)
    expect(c.displayedMs).toBe(2000)
    expect(elapsedMs(c)).toBe(2000)
    expect(formatMmSs(c.displayedMs)).toBe('00:02')
  })

  it('暂停不走时', () => {
    let c = createClock({ timerMode: 'countup' })
    c = tick(c, 1000)
    c = pause(c, 'help')
    expect(c.status).toBe('paused')
    c = tick(c, 5000)
    expect(c.displayedMs).toBe(1000)
    c = resume(c, 'help')
    expect(c.status).toBe('running')
    c = tick(c, 500)
    expect(c.displayedMs).toBe(1500)
  })

  it('多原因暂停需全部解除才继续', () => {
    let c = createClock({ timerMode: 'countdown', timeLimitMs: 60_000 })
    c = pause(c, 'help')
    c = pause(c, 'hidden')
    c = resume(c, 'help')
    expect(c.status).toBe('paused')
    c = tick(c, 1000)
    expect(c.displayedMs).toBe(60_000)
    c = resume(c, 'hidden')
    expect(c.status).toBe('running')
  })

  it('resume 无对应 pause 时保持同一引用', () => {
    const c = createClock({ timerMode: 'countup' })
    expect(resume(c, 'help')).toBe(c)
  })

  it('倒计时超时 → expired', () => {
    let c = createClock({ timerMode: 'countdown', timeLimitMs: 3000 })
    c = tick(c, 2500)
    expect(c.status).toBe('running')
    expect(isUrgent(c)).toBe(true)
    c = tick(c, 1000)
    expect(c.status).toBe('expired')
    expect(c.displayedMs).toBe(0)
  })

  it('通关冻结后不再走时', () => {
    let c = createClock({ timerMode: 'countup' })
    c = tick(c, 4500)
    c = freeze(c)
    expect(c.status).toBe('frozen')
    c = tick(c, 9999)
    expect(c.displayedMs).toBe(4500)
    c = pause(c, 'help')
    expect(c.status).toBe('frozen')
  })

  it('倒计时用时 = 限额 - 剩余', () => {
    let c = createClock({ timerMode: 'countdown', timeLimitMs: 90_000 })
    c = tick(c, 30_000)
    expect(elapsedMs(c)).toBe(30_000)
    c = freeze(c)
    expect(elapsedMs(c)).toBe(30_000)
  })

  it('setCountdownRemaining 统一重置倒计时剩余', () => {
    let c = createClock({ timerMode: 'countdown', timeLimitMs: 60_000 })
    c = tick(c, 10_000)
    expect(c.displayedMs).toBe(50_000)
    c = setCountdownRemaining(c, 5_000)
    expect(c.displayedMs).toBe(5_000)

    let up = createClock({ timerMode: 'countup' })
    up = tick(up, 500)
    expect(setCountdownRemaining(up, 5_000).displayedMs).toBe(500)
  })

  it('setCountdownRemaining 可从 expired 拉回', () => {
    let c = createClock({ timerMode: 'countdown', timeLimitMs: 2_000 })
    c = tick(c, 2_000)
    expect(c.status).toBe('expired')
    c = setCountdownRemaining(c, 5_000)
    expect(c.displayedMs).toBe(2_000)
    expect(c.status).toBe('running')
  })

  it('scoreElapsedMs：主钟冻结 + Fate Night 窗口消耗记账', () => {
    let c = createClock({ timerMode: 'countdown', timeLimitMs: 120_000 })
    c = tick(c, 30_000)
    expect(elapsedMs(c)).toBe(30_000)

    const anchor = {
      baseElapsedMs: elapsedMs(c),
      windowMs: 5_000,
      remainingMs: 5_000,
    }
    expect(scoreElapsedMs(c, anchor)).toBe(30_000)
    expect(
      scoreElapsedMs(c, { ...anchor, remainingMs: 3_000 }),
    ).toBe(32_000)
  })
})
