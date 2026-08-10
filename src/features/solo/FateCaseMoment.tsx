import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { formatMmSs } from '@/domain/clock'
import { COLOR_META } from '@/domain/colors'
import {
  FATE_CASE_SPIN_MS,
  FATE_CASE_TIME_FLOOR_MS,
  sanitizeSpinSpeed,
  type FateCaseChoice,
  type FateCasePhase,
  type FateCaseSpinSpeed,
} from '@/domain/fateCase'
import { isEditableTarget } from '@/features/help/shortcuts'
import { useI18n } from '@/i18n'
import { useColorBlindPatterns } from '@/ui/colorBlind/ColorBlindContext'
import { ColorPatternMark } from '@/ui/colorBlind/ColorPatternMark'
import { ModalBackdrop } from '@/ui/ModalBackdrop'

type Props = {
  phase: FateCasePhase
  /** 返回 hit/miss，便于多枪模式失靶后继续 */
  onFire: (choice: FateCaseChoice) => 'hit' | 'miss'
  /** 玩家确认后启动左轮 3s 窗口 */
  onStart: () => void
  /** 是否已进入开火阶段 */
  live: boolean
  /** 左轮独立倒计时剩余 ms；未开始可为 0 */
  remainingMs: number
  /** 转速 1–5；缺省 3 */
  spinSpeed?: FateCaseSpinSpeed
  /** 一枪定负（无尽）；false 时可连开至超时 */
  oneShot?: boolean
}

const GEAR_TEETH = 18

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** 外缘齿轮轮廓（尖齿 + 根槽） */
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

/**
 * 顶部光标对准哪一格：色球中心在 i * slice（0°=正上）。
 * CSS rotate(R) 顺时针后，球 i 在屏幕角 i*slice+R；取最靠近 0° 的那颗。
 */
function indexUnderCursor(rotationDeg: number, n: number): number {
  if (n <= 0) return -1
  const slice = 360 / n
  return ((Math.round(-rotationDeg / slice) % n) + n) % n
}

/** 左轮时刻：先手动开始 → 揭三锁 + 齿轮轮盘；光标对准后开枪 */
export function FateCaseMoment({
  phase,
  onFire,
  onStart,
  live,
  remainingMs,
  spinSpeed = 3,
  oneShot = false,
}: Props) {
  const { m } = useI18n()
  const showPattern = useColorBlindPatterns()
  const [reduceMotion, setReduceMotion] = useState(false)
  const [armed, setArmed] = useState(false)
  const [missFlash, setMissFlash] = useState(false)
  const [rotation, setRotation] = useState(0)
  const rotationRef = useRef(0)
  const armedRef = useRef(false)
  const firedRef = useRef(false)
  const oneShotRef = useRef(oneShot)
  oneShotRef.current = oneShot
  const liveRef = useRef(live)
  liveRef.current = live
  const onStartRef = useRef(onStart)
  onStartRef.current = onStart
  const spinMs = FATE_CASE_SPIN_MS[sanitizeSpinSpeed(spinSpeed)]
  const spinMsRef = useRef(spinMs)
  spinMsRef.current = spinMs
  const titleId = 'fate-case-moment-title'
  const urgent = live && remainingMs <= 2_000
  const missTimerRef = useRef(0)

  const n = phase.chamber.length
  const slice = 360 / Math.max(n, 1)
  const chamberRef = useRef(phase.chamber)
  const onFireRef = useRef(onFire)
  chamberRef.current = phase.chamber
  onFireRef.current = onFire

  const gearPath = useMemo(
    () => gearOutlinePath(50, 50, 49.2, 44.6, GEAR_TEETH),
    [],
  )

  const chambers = useMemo(() => {
    const cx = 50
    const cy = 50
    const ringR = 27
    const holeR = Math.min(10.5, Math.max(6.5, 40 / Math.max(n, 1)))
    return phase.chamber.map((choice, i) => {
      // 第 0 格在正上方，与顶部箭头对齐
      const mid = i * slice
      const pos = polar(cx, cy, ringR, mid)
      return { choice, i, mid, cx: pos.x, cy: pos.y, holeR }
    })
  }, [phase.chamber, slice, n])

  const boltHoles = useMemo(() => {
    const r = 38.5
    return Array.from({ length: 6 }, (_, i) => polar(50, 50, r, i * 60 + 15))
  }, [])

  const cursorIndex = live ? indexUnderCursor(rotation, n) : -1

  function fireAtCursor() {
    if (!liveRef.current || !armedRef.current || firedRef.current) return
    const idx = indexUnderCursor(rotationRef.current, chamberRef.current.length)
    const choice = chamberRef.current[idx]
    if (choice == null) return
    firedRef.current = true
    const outcome = onFireRef.current(choice)
    if (outcome === 'miss' && !oneShotRef.current) {
      setMissFlash(true)
      window.clearTimeout(missTimerRef.current)
      missTimerRef.current = window.setTimeout(() => {
        setMissFlash(false)
        firedRef.current = false
      }, 320)
    }
  }

  useEffect(() => {
    return () => window.clearTimeout(missTimerRef.current)
  }, [])

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduceMotion(reduce)
  }, [])

  // 进入开火阶段后再短暂上膛，避免误触
  useEffect(() => {
    if (!live) {
      setArmed(false)
      armedRef.current = false
      return
    }
    const armDelay = reduceMotion ? 0 : 220
    const t = window.setTimeout(() => {
      setArmed(true)
      armedRef.current = true
    }, armDelay)
    return () => window.clearTimeout(t)
  }, [live, reduceMotion])

  // 仅开火阶段持续转
  useEffect(() => {
    if (!live || reduceMotion) return
    let raf = 0
    let last = performance.now()
    function loop(now: number) {
      const dt = Math.min(48, Math.max(0, now - last))
      last = now
      rotationRef.current =
        (rotationRef.current + (dt * 360) / spinMsRef.current) % 360
      setRotation(rotationRef.current)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [live, reduceMotion])

  // Space / Enter：准备阶段开始；开火阶段开枪
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isEditableTarget(e.target)) return
      if (e.key !== ' ' && e.key !== 'Enter') return
      e.preventDefault()
      if (!liveRef.current) {
        onStartRef.current()
        return
      }
      fireAtCursor()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const hint = !live
    ? oneShot
      ? m.game.fateCaseIntroOneShot
      : m.game.fateCaseIntro
    : missFlash
      ? m.game.fateCaseMissRetry
      : armed
        ? m.game.fateCaseReady
        : m.game.fateCaseSpinning

  /** 随倒计时加压抖动：越紧越晃 */
  const shakeLevel =
    !live || reduceMotion
      ? 'none'
      : remainingMs <= 500
        ? 'critical'
        : remainingMs <= 1_000
          ? 'hard'
          : remainingMs <= 2_000
            ? 'mild'
            : 'soft'
  const timePressure = live
    ? Math.min(1, Math.max(0, 1 - remainingMs / FATE_CASE_TIME_FLOOR_MS))
    : 0

  return (
    <ModalBackdrop className="fate-case-backdrop" labelledBy={titleId}>
      <div
        className={[
          'fate-case-moment',
          live ? (reduceMotion ? 'ready' : 'spinning') : 'intro',
          urgent ? 'is-urgent' : '',
          missFlash ? 'is-miss-flash' : '',
          reduceMotion ? 'reduce-motion' : 'has-entrance',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ '--fate-case-pressure': String(timePressure) } as CSSProperties}
      >
        <div className="fate-case-fx" aria-hidden>
          <span className="fate-case-flash" />
          <span className="fate-case-slash slash-a" />
          <span className="fate-case-slash slash-b" />
          <span className="fate-case-corner c-tl" />
          <span className="fate-case-corner c-br" />
        </div>

        <div className="fate-case-title-wrap">
          <h2 id={titleId}>
            <span className="fate-case-title-text">{m.game.fateCasePlayTitle}</span>
          </h2>
        </div>
        <p className="fate-case-moment-hint">{hint}</p>

        {live ? (
          <p
            className={`fate-case-countdown${urgent ? ' urgent' : ''}`}
            aria-live="polite"
          >
            <span className="fate-case-countdown-label">{m.game.fateCaseTimer}</span>
            <span className="fate-case-countdown-digits">{formatMmSs(remainingMs)}</span>
          </p>
        ) : (
          <p className="fate-case-countdown waiting" aria-live="polite">
            <span className="fate-case-countdown-label">{m.game.fateCaseTimer}</span>
            <span className="fate-case-countdown-digits">--:--</span>
          </p>
        )}

        <div className="fate-case-locks" aria-hidden>
          {phase.locks.map((color, i) => (
            <div
              key={i}
              className={`fate-case-lock ${color ? 'locked' : 'hanging'}`}
              style={
                {
                  ...(color ? { background: COLOR_META[color].hex } : null),
                  '--lock-i': String(i),
                } as CSSProperties
              }
            >
              {color && showPattern ? <ColorPatternMark color={color} /> : null}
              {!color ? '?' : null}
            </div>
          ))}
        </div>

        <div className={`fate-case-wheel-stage${!live ? ' dimmed' : ''}`}>
          <div className="fate-case-cursor" aria-hidden>
            <svg viewBox="0 0 24 18" className="fate-case-cursor-mark" width="22" height="16">
              <path d="M12 16 L2 2 H22 Z" />
            </svg>
          </div>
          <div className={`fate-case-wheel-shake shake-${shakeLevel}`}>
          <div
            className="fate-case-wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
            role="img"
            aria-label={m.game.fateCaseChamberAria}
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

              {/* 外齿轮 */}
              <path d={gearPath} className="fate-case-gear-teeth" fill="url(#fate-case-gear-metal)" />
              <path d={gearPath} className="fate-case-gear-teeth-edge" fill="none" />

              {/* 鼓面 */}
              <circle cx="50" cy="50" r="42.2" fill="url(#fate-case-drum-face)" />
              <circle cx="50" cy="50" r="42.2" className="fate-case-drum-ring" fill="none" />
              <circle cx="50" cy="50" r="40.4" className="fate-case-drum-inner-ring" fill="none" />

              {/* 固定螺栓孔 */}
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
                    <circle
                      cx={cx}
                      cy={cy}
                      r={holeR + 1.6}
                      className="fate-case-chamber-well"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={holeR + 0.4}
                      className="fate-case-chamber-bore"
                    />
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

        {!live ? (
          <button
            type="button"
            className="btn btn-primary fate-case-fire-btn"
            onClick={() => onStart()}
          >
            {m.game.fateCaseStart}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary fate-case-fire-btn"
            disabled={!armed}
            onClick={fireAtCursor}
          >
            {m.game.fateCaseFire}
          </button>
        )}
      </div>
    </ModalBackdrop>
  )
}
