import { COLOR_META, colorsForCount } from '../../domain/colors'
import type { ColorToken } from '../../domain/types'
import { useI18n } from '../../i18n'

type Props = {
  colorCount: number
  selected: ColorToken | null
  disabled?: boolean
  /** 禁止点选的颜色（如设密时已占用且不允许重复） */
  disabledColors?: readonly ColorToken[]
  onPick: (color: ColorToken) => void
}

export function ColorPalette({
  colorCount,
  selected,
  disabled,
  disabledColors,
  onPick,
}: Props) {
  const { m } = useI18n()
  const palette = colorsForCount(colorCount)
  const blocked = new Set(disabledColors ?? [])
  return (
    <div className="color-palette" role="listbox" aria-label={m.device.paletteAria}>
      {palette.map((c) => {
        const blockedHere = blocked.has(c) && selected !== c
        return (
          <button
            key={c}
            type="button"
            role="option"
            aria-selected={selected === c}
            className={`palette-swatch${selected === c ? ' selected' : ''}${blockedHere ? ' blocked' : ''}`}
            style={{ background: COLOR_META[c].hex }}
            disabled={disabled || blockedHere}
            onClick={() => onPick(c)}
            title={m.color[c]}
            aria-label={m.color[c]}
          />
        )
      })}
    </div>
  )
}
