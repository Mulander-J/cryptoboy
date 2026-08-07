import { COLOR_META } from '@/domain/colors'
import type { ColorToken } from '@/domain/types'

type Props = {
  color: ColorToken
}

/** 色盲模式：叠在色块上的几何符号 */
export function ColorPatternMark({ color }: Props) {
  return (
    <span className="color-pattern" aria-hidden>
      {COLOR_META[color].symbol}
    </span>
  )
}
