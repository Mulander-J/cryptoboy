import type { LevelConfig, TimerMode } from './types'

export type ClockPauseReason = 'help' | 'hidden'

export type ClockStatus = 'running' | 'paused' | 'frozen' | 'expired'

export type GameClock = {
  mode: TimerMode
  /** 正计时：已用 ms；倒计时：剩余 ms */
  displayedMs: number
  /** 倒计时初始限额；正计时为 0 */
  limitMs: number
  status: ClockStatus
  pauseReasons: readonly ClockPauseReason[]
}

export function createClock(config: Pick<LevelConfig, 'timerMode' | 'timeLimitMs'>): GameClock {
  if (config.timerMode === 'countdown') {
    const limitMs = Math.max(0, config.timeLimitMs ?? 0)
    return {
      mode: 'countdown',
      displayedMs: limitMs,
      limitMs,
      status: limitMs === 0 ? 'expired' : 'running',
      pauseReasons: [],
    }
  }
  return {
    mode: 'countup',
    displayedMs: 0,
    limitMs: 0,
    status: 'running',
    pauseReasons: [],
  }
}

/** 有效用时：正计时=显示值；倒计时=限额-剩余（胜负冻结后仍成立） */
export function elapsedMs(clock: GameClock): number {
  if (clock.mode === 'countup') return clock.displayedMs
  return Math.max(0, clock.limitMs - clock.displayedMs)
}

export function isUrgent(clock: GameClock, thresholdMs = 10_000): boolean {
  return (
    clock.mode === 'countdown' &&
    clock.status !== 'frozen' &&
    clock.displayedMs > 0 &&
    clock.displayedMs <= thresholdMs
  )
}

/**
 * 推进时钟。paused/frozen 不走时；countdown 到 0 → expired。
 */
export function tick(clock: GameClock, deltaMs: number): GameClock {
  if (clock.status !== 'running') return clock
  if (deltaMs <= 0) return clock

  if (clock.mode === 'countup') {
    return {
      ...clock,
      displayedMs: clock.displayedMs + deltaMs,
    }
  }

  const next = clock.displayedMs - deltaMs
  if (next <= 0) {
    return {
      ...clock,
      displayedMs: 0,
      status: 'expired',
    }
  }
  return { ...clock, displayedMs: next }
}

export function pause(clock: GameClock, reason: ClockPauseReason): GameClock {
  if (clock.status === 'frozen' || clock.status === 'expired') return clock
  if (clock.pauseReasons.includes(reason)) return clock
  return {
    ...clock,
    pauseReasons: [...clock.pauseReasons, reason],
    status: 'paused',
  }
}

export function resume(clock: GameClock, reason: ClockPauseReason): GameClock {
  if (clock.status === 'frozen' || clock.status === 'expired') return clock
  const pauseReasons = clock.pauseReasons.filter((r) => r !== reason)
  return {
    ...clock,
    pauseReasons,
    status: pauseReasons.length === 0 ? 'running' : 'paused',
  }
}

/** 胜负后冻结读数 */
export function freeze(clock: GameClock): GameClock {
  if (clock.status === 'frozen') return clock
  return {
    ...clock,
    status: 'frozen',
    pauseReasons: [],
  }
}

export function formatMmSs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
