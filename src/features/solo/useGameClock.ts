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

export type GameClockApi = GameClock & {
  /** 左轮窗口剩余；未开始 / 非左轮为 null */
  fateCaseRemainingMs: number | null
  /** 左轮是否已开 3s 窗口 */
  fateCaseLive: boolean
  /** 玩家确认后启动左轮 3s（主钟已在入场时冻结） */
  startFateCaseWindow: () => void
  scoreElapsedMs: () => number
  scoreBreakdown: () => ScoreBreakdown
}

/**
 * 主钟：帮助 / 确认 / hidden 暂停；胜负或左轮入场冻结。
 * 左轮：入场先冻主钟，等玩家手动开始后再走独立 3s；结算 = 入场前已用 + 左轮消耗。
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

  const clockRef = useRef(clock)
  clockRef.current = clock
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire
  const expiredFired = useRef(false)
  const fateCaseExpireFired = useRef(false)
  const fateCaseAnchorRef = useRef<FateCaseClockAnchor | null>(null)
  const fateCaseFrozen = useRef(false)
  const fateCaseStarted = useRef(false)
  const lastFrameRef = useRef(performance.now())
  const helpOpenRef = useRef(helpOpen)
  helpOpenRef.current = helpOpen
  const confirmOpenRef = useRef(confirmOpen)
  confirmOpenRef.current = confirmOpen
  const gameStatusRef = useRef(gameStatus)
  gameStatusRef.current = gameStatus
  const autoStartRef = useRef(Boolean(config.fateCaseAutoStart))
  autoStartRef.current = Boolean(config.fateCaseAutoStart)

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
    setFateCaseRemainingMs(windowMs)
    setFateCaseLive(true)
    lastFrameRef.current = performance.now()
  }, [])

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
    setFateCaseRemainingMs(null)
    setFateCaseLive(false)
    lastFrameRef.current = performance.now()
  }, [resetKey, config.timerMode, config.timeLimitMs])

  // 帮助暂停
  useEffect(() => {
    setClock((c) => {
      const next = helpOpen ? pause(c, 'help') : resume(c, 'help')
      clockRef.current = next
      return next
    })
    lastFrameRef.current = performance.now()
  }, [helpOpen])

  // 提交确认弹层暂停
  useEffect(() => {
    setClock((c) => {
      const next = confirmOpen ? pause(c, 'confirm') : resume(c, 'confirm')
      clockRef.current = next
      return next
    })
    lastFrameRef.current = performance.now()
  }, [confirmOpen])

  // 页签隐藏暂停
  useEffect(() => {
    function onVis() {
      lastFrameRef.current = performance.now()
      setClock((c) => {
        const next = document.hidden
          ? pause(c, 'hidden')
          : resume(c, 'hidden')
        clockRef.current = next
        return next
      })
    }
    document.addEventListener('visibilitychange', onVis)
    if (document.hidden) onVis()
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // 左轮入场：冻结主钟；autoStart 则立刻开 3s，否则等玩家点开始
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
      setClock((c) => {
        const next = freeze(c)
        clockRef.current = next
        return next
      })
    }
  }, [gameStatus])

  // 推进：编辑态走主钟；左轮已开始后走独立窗口
  useEffect(() => {
    let raf = 0
    lastFrameRef.current = performance.now()

    function loop(now: number) {
      const status = gameStatusRef.current
      const pausedExtra =
        helpOpenRef.current ||
        confirmOpenRef.current ||
        (typeof document !== 'undefined' && document.hidden)

      if (status === 'fateCase' && fateCaseAnchorRef.current) {
        if (pausedExtra) {
          lastFrameRef.current = now
          raf = requestAnimationFrame(loop)
          return
        }
        const rawDelta = now - lastFrameRef.current
        lastFrameRef.current = now
        const delta = Math.min(Math.max(0, rawDelta), MAX_TICK_MS)
        const anchor = fateCaseAnchorRef.current
        const nextRem = Math.max(0, anchor.remainingMs - delta)
        if (nextRem !== anchor.remainingMs) {
          fateCaseAnchorRef.current = { ...anchor, remainingMs: nextRem }
          setFateCaseRemainingMs(nextRem)
        }
        if (nextRem <= 0 && !fateCaseExpireFired.current) {
          fateCaseExpireFired.current = true
          onExpireRef.current()
        }
        raf = requestAnimationFrame(loop)
        return
      }

      const prev = clockRef.current
      if (prev.status !== 'running') {
        lastFrameRef.current = now
        raf = requestAnimationFrame(loop)
        return
      }

      const rawDelta = now - lastFrameRef.current
      lastFrameRef.current = now
      const delta = Math.min(Math.max(0, rawDelta), MAX_TICK_MS)
      const next = tick(prev, delta)
      if (next !== prev) {
        clockRef.current = next
        setClock(next)
        if (next.status === 'expired' && !expiredFired.current) {
          expiredFired.current = true
          onExpireRef.current()
        }
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [resetKey])

  return {
    ...clock,
    fateCaseRemainingMs,
    fateCaseLive,
    startFateCaseWindow,
    scoreElapsedMs: getScoreElapsedMs,
    scoreBreakdown: getScoreBreakdown,
  }
}
