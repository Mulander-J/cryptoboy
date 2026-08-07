import { colorsForCount } from './colors'
import { isGuessComplete, toGuess } from './session'
import type { ColorToken, EditableGuess, GenerateConfig, Password } from './types'

/**
 * 将编辑中的四槽校验为合法密码。
 * 不完整、越出调色板、或违反「禁止重复」时返回 null。
 */
export function resolvePassword(
  guess: EditableGuess,
  config: GenerateConfig,
): Password | null {
  if (!isGuessComplete(guess)) return null
  const password = toGuess(guess)
  if (!password) return null

  const palette = new Set(colorsForCount(config.colorCount))
  for (const c of password) {
    if (!palette.has(c)) return null
  }

  if (!config.allowRepeat) {
    const seen = new Set<string>()
    for (const c of password) {
      if (seen.has(c)) return null
      seen.add(c)
    }
  }

  return password
}

/** 其他槽已占用的颜色（当前槽除外）；用于禁止重复时的输入约束 */
export function colorsUsedElsewhere(
  guess: EditableGuess,
  slotIndex: number,
): ColorToken[] {
  const used: ColorToken[] = []
  for (let i = 0; i < guess.length; i++) {
    if (i === slotIndex) continue
    const c = guess[i]
    if (c != null) used.push(c)
  }
  return used
}

/** 在调色板内按方向换色，可选跳过已占用色 */
export function cycleColorInPalette(
  current: ColorToken | null,
  palette: readonly ColorToken[],
  direction: 1 | -1,
  blocked: ReadonlySet<ColorToken> = new Set(),
): ColorToken | null {
  const available = palette.filter((c) => !blocked.has(c))
  if (available.length === 0) return null
  if (current === null || !available.includes(current)) {
    return direction === 1 ? available[0]! : available[available.length - 1]!
  }
  const idx = available.indexOf(current)
  return available[(idx + direction + available.length) % available.length]!
}
