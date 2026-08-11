import { useRef } from 'react'
import { SvgIcon } from '@/ui/icons'

type Props = {
  hint: string
  className?: string
}

/** 设置行 / 顶栏 info：fixed 定位，避免被 overflow 祖先裁切 */
export function InfoTipButton({ hint, className }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null)

  function placeTip() {
    const btn = btnRef.current
    const tip = btn?.querySelector<HTMLElement>('.menu-setting-tooltip')
    if (!btn || !tip) return

    const gap = 8
    const margin = 8
    const rect = btn.getBoundingClientRect()
    const tipH = tip.offsetHeight
    const tipW = tip.offsetWidth
    const placeBelow =
      rect.bottom + gap + tipH <= window.innerHeight - margin ||
      rect.top < tipH + gap + margin
    let top = placeBelow ? rect.bottom + gap : rect.top - tipH - gap
    let left = rect.left
    if (left + tipW > window.innerWidth - margin) {
      left = window.innerWidth - margin - tipW
    }
    if (left < margin) left = margin
    if (top < margin) top = margin

    btn.style.setProperty('--tip-left', `${Math.round(left)}px`)
    btn.style.setProperty('--tip-top', `${Math.round(top)}px`)
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className={className ? `menu-setting-info ${className}` : 'menu-setting-info'}
      aria-label={hint.replace(/\s*\n\s*/g, ' ')}
      onMouseEnter={placeTip}
      onFocus={placeTip}
    >
      <SvgIcon name="info-circle" size={14} />
      <span className="menu-setting-tooltip" role="tooltip">
        {hint}
      </span>
    </button>
  )
}
