import type { CSSProperties } from 'react'
import { useI18n } from '@/i18n'
import { FateNightBase } from './base'
import { FateNightBeatStage } from './beat'
import { FateNightRevolverStage } from './revolver'
import type { FateNightWatcherProps } from './types'
import { useFateNightPlay } from './useFateNightPlay'

export type { FateNightWatcherProps } from './types'

/** Fate Night 收官观战层：外壳共用，舞台按 playMode 挂 beat / revolver */
export function FateNightWatcher({
  phase,
  onFire,
  onStart,
  live,
  remainingMs,
  difficulty = 3,
  oneShot = false,
}: FateNightWatcherProps) {
  const { m } = useI18n()
  const play = useFateNightPlay({
    playMode: phase.playMode,
    chamber: phase.chamber,
    onFire,
    onStart,
    live,
    remainingMs,
    difficulty,
    oneShot,
  })

  const subtitle = play.isBeat
    ? m.game.fateCaseSubtitleBeat
    : m.game.fateCaseSubtitleRevolver
  const stageAria = play.isBeat ? m.game.fateCaseBeatAria : m.game.fateCaseChamberAria
  const readyHint = play.isBeat ? m.game.fateCaseReadyBeat : m.game.fateCaseReadyRevolver
  const actionLabel = play.isBeat ? m.game.fateCaseLock : m.game.fateCaseFire

  const hint = !live
    ? null
    : play.missFlash
      ? m.game.fateCaseMissRetry
      : play.armed
        ? readyHint
        : m.game.fateCaseSpinning

  const stageProps = {
    chamber: phase.chamber,
    live,
    rotation: play.rotation,
    cursorIndex: play.cursorIndex,
    shakeLevel: play.shakeLevel,
    stageAria,
    motionRef: play.motionRef,
  }

  return (
    <FateNightBase
      titleId="fate-night-watcher-title"
      playClass={play.isBeat ? 'play-beat' : 'play-revolver'}
      live={live}
      reduceMotion={play.reduceMotion}
      urgent={play.urgent}
      missFlash={play.missFlash}
      timePressure={play.timePressure}
      styleExtra={
        play.isBeat
          ? ({ '--beat-step-ms': `${play.beatStepMs}ms` } as CSSProperties)
          : undefined
      }
      subtitle={subtitle}
      hint={hint}
      remainingMs={remainingMs}
      locks={phase.locks}
      actionLabel={actionLabel}
      armed={play.armed}
      onStart={onStart}
      onAction={play.fireAtCursor}
    >
      {play.isBeat ? (
        <FateNightBeatStage {...stageProps} />
      ) : (
        <FateNightRevolverStage {...stageProps} />
      )}
    </FateNightBase>
  )
}
