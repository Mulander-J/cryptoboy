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
  gameStatus: GameStatus
  /** 时钟重置键（重试时递增） */
  resetKey: number
  onExpire: () => void
}

/**
 * 局内时钟：rAF 推进；帮助 / document.hidden 暂停；胜负冻结；超时回调。
 */
export function useGameClock({
  config,
  helpOpen,
  gameStatus,
  resetKey,
  onExpire,
}: Options): GameClock {
  const [clock, setClock] = useState(() => createClock(config))
  const clockRef = useRef(clock)
  clockRef.current = clock
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire
  const expiredFired = useRef(false)

  // 新局 / 重试
  useEffect(() => {
    const next = createClock(config)
    clockRef.current = next
    setClock(next)
    expiredFired.current = false
  }, [resetKey, config.timerMode, config.timeLimitMs])

  // 帮助暂停
  useEffect(() => {
    setClock((c) => {
      const next = helpOpen ? pause(c, 'help') : resume(c, 'help')
      clockRef.current = next
      return next
    })
  }, [helpOpen])

  // 页签隐藏暂停
  useEffect(() => {
    function onVis() {
      setClock((c) => {
        const next =
          document.hidden ? pause(c, 'hidden') : resume(c, 'hidden')
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
    let last = performance.now()

    function loop(now: number) {
      const delta = now - last
      last = now
      const prev = clockRef.current
      if (prev.status === 'running') {
        const next = tick(prev, delta)
        if (next !== prev) {
          clockRef.current = next
          setClock(next)
          if (next.status === 'expired' && !expiredFired.current) {
            expiredFired.current = true
            onExpireRef.current()
          }
        }
      }
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [resetKey])

  return clock
}
