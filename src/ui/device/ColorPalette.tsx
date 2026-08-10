import { COLOR_META, colorsForCount } from '@/domain/colors'
import type { ColorToken } from '@/domain/types'
import { useI18n } from '@/i18n'
import { useColorBlindPatterns } from '@/ui/colorBlind/ColorBlindContext'
import { ColorPatternMark } from '@/ui/colorBlind/ColorPatternMark'

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
  const showPattern = useColorBlindPatterns()
  const palette = colorsForCount(colorCount)
  const blocked = new Set(disabledColors ?? [])
  return (
    <div className="color-palette" role="listbox" aria-label={m.device.paletteAria}>
      {palette.map((c, i) => {
        const blockedHere = blocked.has(c) && selected !== c
        const keyNum = i + 1
        return (
          <div key={c} className="palette-item">
            <button
              type="button"
              role="option"
              aria-selected={selected === c}
              className={`palette-swatch${selected === c ? ' selected' : ''}${blockedHere ? ' blocked' : ''}`}
              style={{ background: COLOR_META[c].hex }}
              disabled={disabled || blockedHere}
              onClick={() => onPick(c)}
              title={`${keyNum}. ${m.color[c]}`}
              aria-label={`${keyNum}. ${m.color[c]}`}
            >
              {showPattern ? <ColorPatternMark color={c} /> : null}
            </button>
            <span className="palette-key" aria-hidden>
              {keyNum}
            </span>
          </div>
        )
      })}
    </div>
  )
}
