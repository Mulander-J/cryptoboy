import { useRef, type PointerEvent } from 'react'
import { useI18n } from '../../i18n'

type Props = {
  disabled?: boolean
  onRotate: (direction: 1 | -1) => void
  onShortPress: () => void
  onLongPress: () => void
}

const LONG_MS = 500

export function OrangeKnob({
  disabled,
  onRotate,
  onShortPress,
  onLongPress,
}: Props) {
  const { m } = useI18n()
  const knobAria = m.device.knobAria
  const knobTitle = m.device.knobTitle
  const pointerId = useRef<number | null>(null)
  const lastAngle = useRef(0)
  const accum = useRef(0)
  const pressAt = useRef(0)
  const longFired = useRef(false)
  const dragged = useRef(false)
  const longTimer = useRef<number | null>(null)
  const knobRef = useRef<HTMLButtonElement>(null)

  function angleOf(clientX: number, clientY: number): number {
    const el = knobRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    return Math.atan2(clientY - cy, clientX - cx)
  }

  function clearLong() {
    if (longTimer.current !== null) {
      window.clearTimeout(longTimer.current)
      longTimer.current = null
    }
  }

  function onPointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (disabled) return
    e.currentTarget.setPointerCapture(e.pointerId)
    pointerId.current = e.pointerId
    const a = angleOf(e.clientX, e.clientY)
    lastAngle.current = a
    accum.current = 0
    pressAt.current = Date.now()
    longFired.current = false
    dragged.current = false
    clearLong()
    longTimer.current = window.setTimeout(() => {
      if (!dragged.current) {
        longFired.current = true
        onLongPress()
      }
    }, LONG_MS)
  }

  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (pointerId.current !== e.pointerId || disabled) return
    const a = angleOf(e.clientX, e.clientY)
    let delta = a - lastAngle.current
    if (delta > Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2
    lastAngle.current = a
    accum.current += delta

    const step = Math.PI / 6
    while (accum.current > step) {
      dragged.current = true
      clearLong()
      onRotate(1)
      accum.current -= step
    }
    while (accum.current < -step) {
      dragged.current = true
      clearLong()
      onRotate(-1)
      accum.current += step
    }
  }

  function onPointerUp(e: PointerEvent<HTMLButtonElement>) {
    if (pointerId.current !== e.pointerId) return
    clearLong()
    const elapsed = Date.now() - pressAt.current
    if (!longFired.current && !dragged.current && elapsed < LONG_MS) {
      onShortPress()
    }
    pointerId.current = null
  }

  return (
    <button
      ref={knobRef}
      type="button"
      className="orange-knob"
      disabled={disabled}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label={knobAria}
      title={knobTitle}
    >
      <span className="knob-mark" />
      <span className="knob-center" />
    </button>
  )
}
