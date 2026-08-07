import { useEffect, useRef, useState } from 'react'
import {
  createClock,
  freeze,
  pause,
  resume,
  tick,
  type GameClock,
} from '@/domain/clock'
import type { LevelConfig } from '@/domain/types'
import type { GameStatus } from '@/domain/types'

type Options = {
  config: Pick<LevelConfig, 'timerMode' | 'timeLimitMs'>
  /** 帮助打开时暂停 */
  helpOpen: boolean
  /** 提交确认弹层打开时暂停 */
  confirmOpen?: boolean
  gameStatus: GameStatus
  /** 时钟重置键（重试时递增） */
  resetKey: number
  onExpire: () => void
}

/** 单帧最大推进，防止后台回来后把离开时长一次性加上 */
const MAX_TICK_MS = 100

/**
 * 局内时钟：rAF 推进；帮助 / 确认弹层 / document.hidden 暂停；胜负冻结；超时回调。
 */
export function useGameClock({
  config,
  helpOpen,
  confirmOpen = false,
  gameStatus,
  resetKey,
  onExpire,
}: Options): GameClock {
  const [clock, setClock] = useState(() => {
    let c = createClock(config)
    if (typeof document !== 'undefined' && document.hidden) {
      c = pause(c, 'hidden')
    }
    return c
  })
  const clockRef = useRef(clock)
  clockRef.current = clock
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire
  const expiredFired = useRef(false)
  /** rAF 上一帧时间；暂停/隐藏时必须同步刷新，避免恢复后巨量 delta */
  const lastFrameRef = useRef(performance.now())

  // 新局 / 重试
  useEffect(() => {
    let next = createClock(config)
    if (document.hidden) next = pause(next, 'hidden')
    if (helpOpen) next = pause(next, 'help')
    if (confirmOpen) next = pause(next, 'confirm')
    clockRef.current = next
    setClock(next)
    expiredFired.current = false
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

  // 页签 / App 切换隐藏时暂停
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

  // 胜负冻结
  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      setClock((c) => {
        const next = freeze(c)
        clockRef.current = next
        return next
      })
    }
  }, [gameStatus])

  // 推进
  useEffect(() => {
    let raf = 0
    lastFrameRef.current = performance.now()

    function loop(now: number) {
      const prev = clockRef.current
      if (prev.status !== 'running') {
        // 暂停期间仍刷新基准，避免恢复后把后台时间算进去
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

  return clock
}
