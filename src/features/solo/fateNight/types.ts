import type { RefObject } from 'react'
import type { FateCaseChoice, FateCaseDifficultyTier, FateCasePhase } from '@/domain/fateCase'

export type FateNightWatcherProps = {
  phase: FateCasePhase
  /** 返回 hit/miss，便于多枪模式未中后继续 */
  onFire: (choice: FateCaseChoice) => 'hit' | 'miss'
  /** 玩家确认后启动 3s 窗口 */
  onStart: () => void
  /** 是否已进入定色阶段 */
  live: boolean
  /** 独立倒计时剩余 ms；未开始可为 0 */
  remainingMs: number
  /** 难度档 1–5；缺省 3 */
  difficulty?: FateCaseDifficultyTier
  /** 一次机会定负（无尽）；false 时可连试至超时 */
  oneShot?: boolean
}

export type FateNightShakeLevel = 'none' | 'soft' | 'mild' | 'hard' | 'critical'

export type FateNightStageProps = {
  chamber: FateCasePhase['chamber']
  live: boolean
  rotation: number
  cursorIndex: number
  shakeLevel: FateNightShakeLevel
  stageAria: string
  /** 平滑转动目标；rAF 直写 transform，避免每帧 setState */
  motionRef: RefObject<HTMLElement | null>
}
