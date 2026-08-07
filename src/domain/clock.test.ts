import { describe, expect, it } from 'vitest'
import {
  createClock,
  elapsedMs,
  formatMmSs,
  freeze,
  isUrgent,
  pause,
  resume,
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
})
