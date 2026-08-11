import type { LevelConfig, TimerMode } from './types'

export type ClockPauseReason = 'help' | 'hidden' | 'confirm'

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

/**
 * 厄运时刻双计时锚点：主钟冻结在入场瞬间；收官另跑 windowMs。
 * 结算用时 = baseElapsedMs + (windowMs - remainingMs)。
 */
export type FateCaseClockAnchor = {
  baseElapsedMs: number
  windowMs: number
  /** 收官窗口剩余 ms */
  remainingMs: number
}

export type ScoreBreakdown = {
  baseMs: number
  fateCaseMs: number
  totalMs: number
}

export function fateCaseConsumedMs(anchor: FateCaseClockAnchor): number {
  return Math.max(0, anchor.windowMs - anchor.remainingMs)
}

/** 结算 / 最佳用时：有收官锚点时用真实耗时，否则同 elapsedMs */
export function scoreElapsedMs(
  clock: GameClock,
  fateCase: FateCaseClockAnchor | null,
): number {
  if (!fateCase) return elapsedMs(clock)
  return fateCase.baseElapsedMs + fateCaseConsumedMs(fateCase)
}

export function scoreBreakdown(
  clock: GameClock,
  fateCase: FateCaseClockAnchor | null,
): ScoreBreakdown {
  if (!fateCase) {
    const total = elapsedMs(clock)
    return { baseMs: total, fateCaseMs: 0, totalMs: total }
  }
  const fateCaseMs = fateCaseConsumedMs(fateCase)
  return {
    baseMs: fateCase.baseElapsedMs,
    fateCaseMs,
    totalMs: fateCase.baseElapsedMs + fateCaseMs,
  }
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
  if (!clock.pauseReasons.includes(reason)) return clock
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

/**
 * 倒计时入 Fate Night：剩余统一重置为 remainingMs（不超过本局限额）；
 * 可从 expired 拉回；正计时不变。
 */
export function setCountdownRemaining(clock: GameClock, remainingMs: number): GameClock {
  if (clock.mode !== 'countdown') return clock
  if (clock.status === 'frozen') return clock
  const target = Math.min(Math.max(0, remainingMs), clock.limitMs)
  if (target <= 0) {
    return { ...clock, displayedMs: 0, status: 'expired', pauseReasons: [] }
  }
  return {
    ...clock,
    displayedMs: target,
    status: clock.pauseReasons.length === 0 ? 'running' : 'paused',
  }
}

export function formatMmSs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
