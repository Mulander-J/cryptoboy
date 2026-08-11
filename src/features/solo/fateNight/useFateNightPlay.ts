import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  FATE_CASE_SPIN_MS,
  FATE_CASE_TIME_FLOOR_MS,
  type FateCaseChoice,
  type FateCaseDifficultyTier,
  type FateCasePhase,
} from '@/domain/fateCase'
import { isEditableTarget } from '@/features/help/shortcuts'
import type { FateNightShakeLevel } from './types'

function revolverIndexUnderCursor(phaseDeg: number, n: number): number {
  if (n <= 0) return -1
  const slice = 360 / n
  return ((Math.round(-phaseDeg / slice) % n) + n) % n
}

function beatIndexUnderCursor(phaseDeg: number, n: number): number {
  if (n <= 0) return -1
  const slice = 360 / n
  return ((Math.round(phaseDeg / slice) % n) + n) % n
}

function applyMotionTransform(
  el: HTMLElement,
  rotation: number,
  isBeat: boolean,
) {
  if (isBeat) {
    const stripPx = Number(el.dataset.stripPx) || 0
    const noteHalf = Number(el.dataset.noteHalf) || 0
    const offsetPx = ((rotation % 360) / 360) * stripPx
    el.style.transform = `translateX(calc(-${noteHalf}px - ${offsetPx}px))`
  } else {
    el.style.transform = `rotate(${rotation}deg)`
  }
}

type Args = {
  playMode: FateCasePhase['playMode']
  chamber: FateCasePhase['chamber']
  onFire: (choice: FateCaseChoice) => 'hit' | 'miss'
  onStart: () => void
  live: boolean
  remainingMs: number
  difficulty: FateCaseDifficultyTier
  oneShot: boolean
}

/** 收官共用：上膛、滚动相位、定色 / 键盘、失中闪、加压抖动 */
export function useFateNightPlay({
  playMode,
  chamber,
  onFire,
  onStart,
  live,
  remainingMs,
  difficulty,
  oneShot,
}: Args) {
  const isBeat = playMode === 'beat'
  const [reduceMotion, setReduceMotion] = useState(false)
  const [armed, setArmed] = useState(false)
  const [missFlash, setMissFlash] = useState(false)
  /** 仅在光标槽位变化时更新，供高亮；平滑动画走 motionRef DOM */
  const [rotation, setRotation] = useState(0)
  const [cursorIndex, setCursorIndex] = useState(-1)
  const motionRef = useRef<HTMLElement | null>(null)
  const rotationRef = useRef(0)
  const cursorIndexRef = useRef(-1)
  const armedRef = useRef(false)
  const firedRef = useRef(false)
  const oneShotRef = useRef(oneShot)
  oneShotRef.current = oneShot
  const liveRef = useRef(live)
  liveRef.current = live
  const onStartRef = useRef(onStart)
  onStartRef.current = onStart
  const isBeatRef = useRef(isBeat)
  isBeatRef.current = isBeat
  const spinMs = FATE_CASE_SPIN_MS[difficulty]
  const spinMsRef = useRef(spinMs)
  spinMsRef.current = spinMs
  const missTimerRef = useRef(0)

  const n = chamber.length
  const chamberRef = useRef(chamber)
  const onFireRef = useRef(onFire)
  chamberRef.current = chamber
  onFireRef.current = onFire

  const beatStepMs = spinMs / Math.max(n, 1)

  function fireAtCursor() {
    if (!liveRef.current || !armedRef.current || firedRef.current) return
    const len = chamberRef.current.length
    const idx = isBeatRef.current
      ? beatIndexUnderCursor(rotationRef.current, len)
      : revolverIndexUnderCursor(rotationRef.current, len)
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

  useEffect(() => {
    if (!live) {
      setArmed(false)
      armedRef.current = false
      rotationRef.current = 0
      cursorIndexRef.current = -1
      setRotation(0)
      setCursorIndex(-1)
      const el = motionRef.current
      if (el) el.style.transform = ''
      return
    }
    const armDelay = reduceMotion ? 0 : 220
    const t = window.setTimeout(() => {
      setArmed(true)
      armedRef.current = true
    }, armDelay)
    return () => window.clearTimeout(t)
  }, [live, reduceMotion])

  useEffect(() => {
    if (!live || reduceMotion) return
    let raf = 0
    let last = performance.now()
    function loop(now: number) {
      const dt = Math.min(48, Math.max(0, now - last))
      last = now
      rotationRef.current =
        (rotationRef.current + (dt * 360) / spinMsRef.current) % 360
      const el = motionRef.current
      if (el) applyMotionTransform(el, rotationRef.current, isBeatRef.current)

      const len = chamberRef.current.length
      const idx = isBeatRef.current
        ? beatIndexUnderCursor(rotationRef.current, len)
        : revolverIndexUnderCursor(rotationRef.current, len)
      if (idx !== cursorIndexRef.current) {
        cursorIndexRef.current = idx
        setCursorIndex(idx)
        setRotation(rotationRef.current)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [live, reduceMotion])

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

  const urgent = live && remainingMs <= 2_000
  const shakeLevel: FateNightShakeLevel =
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

  return {
    isBeat,
    reduceMotion,
    armed,
    missFlash,
    rotation,
    cursorIndex,
    motionRef: motionRef as RefObject<HTMLElement | null>,
    beatStepMs,
    urgent,
    shakeLevel,
    timePressure,
    fireAtCursor,
  }
}
