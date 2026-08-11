import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createClock,
  elapsedMs,
  freeze,
  pause,
  resume,
  scoreBreakdown,
  scoreElapsedMs,
  tick,
  type GameClock,
  type FateCaseClockAnchor,
  type ScoreBreakdown,
} from '@/domain/clock'
import { FATE_CASE_TIME_FLOOR_MS } from '@/domain/fateCase'
import type { LevelConfig } from '@/domain/types'
import type { GameStatus } from '@/domain/types'

type Options = {
  config: Pick<LevelConfig, 'timerMode' | 'timeLimitMs' | 'fateCaseAutoStart'>
  helpOpen: boolean
  confirmOpen?: boolean
  gameStatus: GameStatus
  resetKey: number
  onExpire: () => void
}

const MAX_TICK_MS = 100

/** 主钟 UI 按秒刷新即可（formatMmSs） */
function displaySec(ms: number): number {
  return Math.floor(Math.max(0, ms) / 1000)
}

/** 收官剩余：100ms 一档，兼顾压迫条与抖动档位 */
function fatePublishBucket(ms: number): number {
  return Math.floor(Math.max(0, ms) / 100)
}

function clockUiChanged(prev: GameClock, next: GameClock): boolean {
  const urgentBand = (ms: number) => ms > 0 && ms <= 10_000
  return (
    prev.status !== next.status ||
    prev.mode !== next.mode ||
    displaySec(prev.displayedMs) !== displaySec(next.displayedMs) ||
    urgentBand(prev.displayedMs) !== urgentBand(next.displayedMs) ||
    prev.pauseReasons.length !== next.pauseReasons.length ||
    prev.pauseReasons.some((r, i) => r !== next.pauseReasons[i])
  )
}

export type GameClockApi = GameClock & {
  /** Fate Night 窗口剩余；未开始 / 非收官为 null */
  fateCaseRemainingMs: number | null
  /** Fate Night 是否已开 3s 窗口 */
  fateCaseLive: boolean
  /** 玩家确认后启动 Fate Night 3s（主钟已在入场时冻结） */
  startFateCaseWindow: () => void
  scoreElapsedMs: () => number
  scoreBreakdown: () => ScoreBreakdown
}

/**
 * 主钟：帮助 / 确认 / hidden 暂停；胜负或 Fate Night 入场冻结。
 * Fate Night：入场先冻主钟，等玩家手动开始后再走独立 3s；结算 = 入场前已用 + 收官消耗。
 */
export function useGameClock({
  config,
  helpOpen,
  confirmOpen = false,
  gameStatus,
  resetKey,
  onExpire,
}: Options): GameClockApi {
  const [clock, setClock] = useState(() => {
    let c = createClock(config)
    if (typeof document !== 'undefined' && document.hidden) {
      c = pause(c, 'hidden')
    }
    return c
  })
  const [fateCaseRemainingMs, setFateCaseRemainingMs] = useState<number | null>(null)
  const [fateCaseLive, setFateCaseLive] = useState(false)
  /** 唤醒 rAF（开始收官 / 页签恢复等） */
  const [loopEpoch, setLoopEpoch] = useState(0)

  const clockRef = useRef(clock)
  clockRef.current = clock
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire
  const expiredFired = useRef(false)
  const fateCaseExpireFired = useRef(false)
  const fateCaseAnchorRef = useRef<FateCaseClockAnchor | null>(null)
  const fateCaseFrozen = useRef(false)
  const fateCaseStarted = useRef(false)
  const fatePublishBucketRef = useRef<number | null>(null)
  const lastFrameRef = useRef(performance.now())
  const helpOpenRef = useRef(helpOpen)
  helpOpenRef.current = helpOpen
  const confirmOpenRef = useRef(confirmOpen)
  confirmOpenRef.current = confirmOpen
  const gameStatusRef = useRef(gameStatus)
  gameStatusRef.current = gameStatus
  const autoStartRef = useRef(Boolean(config.fateCaseAutoStart))
  autoStartRef.current = Boolean(config.fateCaseAutoStart)

  const bumpLoop = useCallback(() => {
    setLoopEpoch((n) => n + 1)
  }, [])

  const publishClock = useCallback((next: GameClock) => {
    const prev = clockRef.current
    clockRef.current = next
    if (clockUiChanged(prev, next)) setClock(next)
  }, [])

  const getScoreElapsedMs = useCallback(
    () => scoreElapsedMs(clockRef.current, fateCaseAnchorRef.current),
    [],
  )
  const getScoreBreakdown = useCallback(
    () => scoreBreakdown(clockRef.current, fateCaseAnchorRef.current),
    [],
  )

  const startFateCaseWindow = useCallback(() => {
    if (gameStatusRef.current !== 'fateCase') return
    if (fateCaseStarted.current) return
    fateCaseStarted.current = true

    const windowMs = FATE_CASE_TIME_FLOOR_MS
    fateCaseAnchorRef.current = {
      baseElapsedMs: elapsedMs(clockRef.current),
      windowMs,
      remainingMs: windowMs,
    }
    fateCaseExpireFired.current = false
    fatePublishBucketRef.current = fatePublishBucket(windowMs)
    setFateCaseRemainingMs(windowMs)
    setFateCaseLive(true)
    lastFrameRef.current = performance.now()
    bumpLoop()
  }, [bumpLoop])

  // 新局 / 重试
  useEffect(() => {
    let next = createClock(config)
    if (document.hidden) next = pause(next, 'hidden')
    if (helpOpen) next = pause(next, 'help')
    if (confirmOpen) next = pause(next, 'confirm')
    clockRef.current = next
    setClock(next)
    expiredFired.current = false
    fateCaseExpireFired.current = false
    fateCaseFrozen.current = false
    fateCaseStarted.current = false
    fateCaseAnchorRef.current = null
    fatePublishBucketRef.current = null
    setFateCaseRemainingMs(null)
    setFateCaseLive(false)
    lastFrameRef.current = performance.now()
  }, [resetKey, config.timerMode, config.timeLimitMs])

  // 帮助暂停（读 clockRef，避免秒级 UI 节流后 React state 落后）
  useEffect(() => {
    const next = helpOpen
      ? pause(clockRef.current, 'help')
      : resume(clockRef.current, 'help')
    clockRef.current = next
    setClock(next)
    lastFrameRef.current = performance.now()
  }, [helpOpen])

  // 提交确认弹层暂停
  useEffect(() => {
    const next = confirmOpen
      ? pause(clockRef.current, 'confirm')
      : resume(clockRef.current, 'confirm')
    clockRef.current = next
    setClock(next)
    lastFrameRef.current = performance.now()
  }, [confirmOpen])

  // 页签隐藏暂停；恢复时唤醒 rAF
  useEffect(() => {
    function onVis() {
      lastFrameRef.current = performance.now()
      const next = document.hidden
        ? pause(clockRef.current, 'hidden')
        : resume(clockRef.current, 'hidden')
      clockRef.current = next
      setClock(next)
      if (!document.hidden) bumpLoop()
    }
    document.addEventListener('visibilitychange', onVis)
    if (document.hidden) onVis()
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [bumpLoop])

  // Fate Night 入场：冻结主钟；autoStart 则立刻开 3s，否则等玩家点开始
  useEffect(() => {
    if (gameStatus !== 'fateCase') return
    if (fateCaseFrozen.current) return
    fateCaseFrozen.current = true

    const frozen = freeze(clockRef.current)
    clockRef.current = frozen
    setClock(frozen)
    lastFrameRef.current = performance.now()

    if (autoStartRef.current) {
      fateCaseStarted.current = true
      const windowMs = FATE_CASE_TIME_FLOOR_MS
      fateCaseAnchorRef.current = {
        baseElapsedMs: elapsedMs(frozen),
        windowMs,
        remainingMs: windowMs,
      }
      fateCaseExpireFired.current = false
      fatePublishBucketRef.current = fatePublishBucket(windowMs)
      setFateCaseRemainingMs(windowMs)
      setFateCaseLive(true)
    } else {
      setFateCaseRemainingMs(null)
      setFateCaseLive(false)
    }
  }, [gameStatus])

  // 胜负冻结主钟
  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      const next = freeze(clockRef.current)
      clockRef.current = next
      setClock(next)
    }
  }, [gameStatus])

  // 推进：仅在编辑走时 / 收官 live 时跑 rAF；暂停与终局停转，靠 deps / bumpLoop 唤醒
  useEffect(() => {
    let raf = 0
    lastFrameRef.current = performance.now()

    function loop(now: number) {
      const status = gameStatusRef.current
      if (status === 'won' || status === 'lost') return

      const pausedExtra =
        helpOpenRef.current ||
        confirmOpenRef.current ||
        (typeof document !== 'undefined' && document.hidden)

      if (status === 'fateCase' && fateCaseAnchorRef.current) {
        if (pausedExtra) {
          lastFrameRef.current = now
          return
        }
        const rawDelta = now - lastFrameRef.current
        lastFrameRef.current = now
        const delta = Math.min(Math.max(0, rawDelta), MAX_TICK_MS)
        const anchor = fateCaseAnchorRef.current
        const nextRem = Math.max(0, anchor.remainingMs - delta)
        if (nextRem !== anchor.remainingMs) {
          fateCaseAnchorRef.current = { ...anchor, remainingMs: nextRem }
          const bucket = fatePublishBucket(nextRem)
          if (
            nextRem === 0 ||
            fatePublishBucketRef.current === null ||
            bucket !== fatePublishBucketRef.current
          ) {
            fatePublishBucketRef.current = bucket
            setFateCaseRemainingMs(nextRem)
          }
        }
        if (nextRem <= 0 && !fateCaseExpireFired.current) {
          fateCaseExpireFired.current = true
          onExpireRef.current()
          return
        }
        raf = requestAnimationFrame(loop)
        return
      }

      // 收官未开窗：主钟已冻，无需空转
      if (status === 'fateCase') return

      const prev = clockRef.current
      if (prev.status !== 'running') {
        lastFrameRef.current = now
        return
      }

      const rawDelta = now - lastFrameRef.current
      lastFrameRef.current = now
      const delta = Math.min(Math.max(0, rawDelta), MAX_TICK_MS)
      const next = tick(prev, delta)
      if (next !== prev) {
        publishClock(next)
        if (next.status === 'expired' && !expiredFired.current) {
          expiredFired.current = true
          onExpireRef.current()
          return
        }
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [resetKey, gameStatus, helpOpen, confirmOpen, loopEpoch, publishClock])

  return {
    ...clock,
    fateCaseRemainingMs,
    fateCaseLive,
    startFateCaseWindow,
    scoreElapsedMs: getScoreElapsedMs,
    scoreBreakdown: getScoreBreakdown,
  }
}
