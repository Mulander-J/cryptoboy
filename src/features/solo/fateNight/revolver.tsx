import { useMemo, type RefObject } from 'react'
import { COLOR_META } from '@/domain/colors'
import { useColorBlindPatterns } from '@/ui/colorBlind/ColorBlindContext'
import { FateNightCursor } from './base'
import type { FateNightStageProps } from './types'

const GEAR_TEETH = 18

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function gearOutlinePath(
  cx: number,
  cy: number,
  tipR: number,
  rootR: number,
  teeth: number,
): string {
  const step = 360 / teeth
  const pts: string[] = []
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step
    const aTip0 = a0 + step * 0.18
    const aTip1 = a0 + step * 0.42
    const aRoot1 = a0 + step * 0.58
    const aNext = a0 + step
    const push = (r: number, deg: number) => {
      const p = polar(cx, cy, r, deg)
      pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    }
    push(rootR, a0)
    push(tipR, aTip0)
    push(tipR, aTip1)
    push(rootR, aRoot1)
    push(rootR, aNext)
  }
  return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`
}

/** Revolver：齿轮弹巢旋转，顶部光标对准当前膛 */
export function FateNightRevolverStage({
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
  const slice = 360 / Math.max(n, 1)

  const gearPath = useMemo(
    () => gearOutlinePath(50, 50, 49.2, 44.6, GEAR_TEETH),
    [],
  )

  const chambers = useMemo(() => {
    const cx = 50
    const cy = 50
    const ringR = 27
    const holeR = Math.min(10.5, Math.max(6.5, 40 / Math.max(n, 1)))
    return chamber.map((choice, i) => {
      const mid = i * slice
      const pos = polar(cx, cy, ringR, mid)
      return { choice, i, cx: pos.x, cy: pos.y, holeR }
    })
  }, [chamber, slice, n])

  const boltHoles = useMemo(() => {
    const r = 38.5
    return Array.from({ length: 6 }, (_, i) => polar(50, 50, r, i * 60 + 15))
  }, [])

  return (
    <div className={`fate-case-wheel-stage${!live ? ' dimmed' : ''}`}>
      <div className="fate-case-cursor" aria-hidden>
        <FateNightCursor size={22} />
      </div>
      <div className={`fate-case-wheel-shake shake-${shakeLevel}`}>
        <div
          ref={motionRef as RefObject<HTMLDivElement | null>}
          className="fate-case-wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
          role="img"
          aria-label={stageAria}
        >
          <svg viewBox="0 0 100 100" className="fate-case-wheel-svg">
            <defs>
              <radialGradient id="fate-case-drum-face" cx="38%" cy="32%" r="70%">
                <stop offset="0%" stopColor="#d8dce2" />
                <stop offset="45%" stopColor="#9aa3ad" />
                <stop offset="100%" stopColor="#5c6570" />
              </radialGradient>
              <radialGradient id="fate-case-gear-metal" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#c5ccd4" />
                <stop offset="55%" stopColor="#7a8490" />
                <stop offset="100%" stopColor="#3e4650" />
              </radialGradient>
              <radialGradient id="fate-case-drum-hub" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#eceff2" />
                <stop offset="100%" stopColor="#6a7380" />
              </radialGradient>
              <filter id="fate-case-ball-shade" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0.6" stdDeviation="0.5" floodOpacity="0.35" />
              </filter>
            </defs>

            <path d={gearPath} className="fate-case-gear-teeth" fill="url(#fate-case-gear-metal)" />
            <path d={gearPath} className="fate-case-gear-teeth-edge" fill="none" />

            <circle cx="50" cy="50" r="42.2" fill="url(#fate-case-drum-face)" />
            <circle cx="50" cy="50" r="42.2" className="fate-case-drum-ring" fill="none" />
            <circle cx="50" cy="50" r="40.4" className="fate-case-drum-inner-ring" fill="none" />

            {boltHoles.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="2.1" className="fate-case-bolt-well" />
                <circle cx={p.x} cy={p.y} r="1.15" className="fate-case-bolt-pin" />
              </g>
            ))}

            {chambers.map(({ choice, i, cx, cy, holeR }) => {
              const isBlank = choice === 'blank'
              const color = isBlank ? null : choice
              const active = i === cursorIndex
              return (
                <g key={`${choice}-${i}`}>
                  <circle cx={cx} cy={cy} r={holeR + 1.6} className="fate-case-chamber-well" />
                  <circle cx={cx} cy={cy} r={holeR + 0.4} className="fate-case-chamber-bore" />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={holeR - 0.2}
                    className={`fate-case-ball${active ? ' active' : ''}${isBlank ? ' blank' : ''}`}
                    fill={color ? COLOR_META[color].hex : '#2a2f36'}
                    filter="url(#fate-case-ball-shade)"
                    aria-hidden
                  />
                  {isBlank ? (
                    <text
                      x={cx}
                      y={cy}
                      className="fate-case-ball-mark"
                      textAnchor="middle"
                      dominantBaseline="central"
                      aria-hidden
                    >
                      ∅
                    </text>
                  ) : showPattern ? (
                    <text
                      x={cx}
                      y={cy}
                      className="fate-case-ball-mark"
                      textAnchor="middle"
                      dominantBaseline="central"
                      aria-hidden
                    >
                      {COLOR_META[color!].symbol}
                    </text>
                  ) : null}
                </g>
              )
            })}

            <circle cx="50" cy="50" r="9.5" fill="url(#fate-case-drum-hub)" />
            <circle cx="50" cy="50" r="9.5" className="fate-case-hub-ring" fill="none" />
            <circle cx="50" cy="50" r="3.2" className="fate-case-hub-pin" />
          </svg>
        </div>
      </div>
    </div>
  )
}
