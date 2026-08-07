import type { ColorToken } from '../../domain/types'
import { COLOR_META } from '../../domain/colors'
import { useI18n } from '../../i18n'

type Props = {
  color: ColorToken | null
  active?: boolean
  onClick?: () => void
  disabled?: boolean
}

const LED_VAR: Record<ColorToken, string> = {
  R: 'var(--led-r)',
  O: 'var(--led-o)',
  Y: 'var(--led-y)',
  G: 'var(--led-g)',
  B: 'var(--led-b)',
  P: 'var(--led-p)',
  C: 'var(--led-c)',
  K: 'var(--led-k)',
}

export function LedCell({ color, active = false, onClick, disabled }: Props) {
  const { m } = useI18n()
  const lit = color !== null
  const hex = lit ? COLOR_META[color].hex : undefined

  return (
    <button
      type="button"
      className={`led-cell${lit ? ' lit' : ''}${active ? ' active' : ''}`}
      style={
        lit
          ? {
              background: LED_VAR[color],
              boxShadow: `0 0 10px ${hex}, 0 0 18px ${hex}99, inset 0 0 6px #ffffff55`,
            }
          : undefined
      }
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-label={lit ? m.color[color] : m.device.emptySlot}
    />
  )
}
