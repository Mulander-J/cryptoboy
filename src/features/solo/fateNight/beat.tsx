import { useMemo, type CSSProperties, type RefObject } from 'react'
import { COLOR_META } from '@/domain/colors'
import { useColorBlindPatterns } from '@/ui/colorBlind/ColorBlindContext'
import { ColorPatternMark } from '@/ui/colorBlind/ColorPatternMark'
import { FateNightCursor } from './base'
import type { FateNightStageProps } from './types'

/** 节拍音符：扁砖块形（宽 > 高）；全员同尺寸保公平 */
const NOTE_W_PX = 42
const NOTE_H_PX = 22
/** 均匀空隙；随机间隔会破坏各色对准窗口均等 */
const GAP_PX = 14
const STEP_PX = NOTE_W_PX + GAP_PX

/** Beat：色砖匀速横滚，顶部光标为判定线 */
export function FateNightBeatStage({
  chamber,
  live,
  rotation,
  cursorIndex,
  shakeLevel,
  stageAria,
  motionRef,
}: FateNightStageProps) {
  const showPattern = useColorBlindPatterns()
  const n = chamber.length
  const beatCells = useMemo(() => {
    const loop = [...chamber, ...chamber]
    return loop.map((choice, i) => ({ choice, i, slot: i % Math.max(n, 1) }))
  }, [chamber, n])

  const stripPx = Math.max(n, 1) * STEP_PX
  const offsetPx = ((rotation % 360) / 360) * stripPx

  return (
    <div className={`fate-case-beat-stage${!live ? ' dimmed' : ''}`}>
      <div className="fate-case-cursor fate-case-beat-cursor" aria-hidden>
        <FateNightCursor size={18} />
      </div>
      <div className={`fate-case-wheel-shake shake-${shakeLevel}`}>
        <div
          className="fate-case-beat"
          role="img"
          aria-label={stageAria}
          style={
            {
              '--beat-note-w': `${NOTE_W_PX}px`,
              '--beat-note-h': `${NOTE_H_PX}px`,
              '--beat-gap': `${GAP_PX}px`,
              '--beat-step': `${STEP_PX}px`,
            } as CSSProperties
          }
        >
          <div className="fate-case-beat-window">
            <span className="fate-case-beat-rail rail-top" aria-hidden />
            <span className="fate-case-beat-rail rail-bot" aria-hidden />
            <div
              ref={motionRef as RefObject<HTMLDivElement | null>}
              className="fate-case-beat-strip"
              data-strip-px={stripPx}
              data-note-half={NOTE_W_PX / 2}
              style={{
                width: stripPx * 2,
                transform: `translateX(calc(-${NOTE_W_PX / 2}px - ${offsetPx}px))`,
              }}
            >
              {beatCells.map(({ choice, i, slot }) => {
                const isBlank = choice === 'blank'
                const color = isBlank ? null : choice
                const active = live && slot === cursorIndex
                return (
                  <div key={`${choice}-${i}`} className="fate-case-beat-step">
                    <div
                      className={`fate-case-beat-note${active ? ' active' : ''}${isBlank ? ' blank' : ''}`}
                      style={color ? { background: COLOR_META[color].hex } : undefined}
                    >
                      {isBlank ? (
                        <span className="fate-case-beat-mark" aria-hidden>
                          ∅
                        </span>
                      ) : showPattern && color ? (
                        <ColorPatternMark color={color} />
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
            <span className="fate-case-beat-judge" aria-hidden />
            <span className="fate-case-beat-reticle" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}
