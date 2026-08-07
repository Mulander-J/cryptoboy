import { COLOR_META, colorsForCount } from '../../domain/colors'
import type { ColorToken } from '../../domain/types'
import { useI18n } from '../../i18n'

type Props = {
  colorCount: number
  selected: ColorToken | null
  disabled?: boolean
  onPick: (color: ColorToken) => void
}

export function ColorPalette({ colorCount, selected, disabled, onPick }: Props) {
  const { m } = useI18n()
  const palette = colorsForCount(colorCount)
  return (
    <div className="color-palette" role="listbox" aria-label={m.device.paletteAria}>
      {palette.map((c) => (
        <button
          key={c}
          type="button"
          role="option"
          aria-selected={selected === c}
          className={`palette-swatch${selected === c ? ' selected' : ''}`}
          style={{ background: COLOR_META[c].hex }}
          disabled={disabled}
          onClick={() => onPick(c)}
          title={m.color[c]}
          aria-label={m.color[c]}
        />
      ))}
    </div>
  )
}
