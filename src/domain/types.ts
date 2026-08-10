/** 颜色与局内核心类型（零 UI） */

/** 彩虹光谱序：红 → 橙 → 黄 → 绿 → 青 → 蓝 → 紫 → 粉 */
export const COLOR_IDS = ['R', 'O', 'Y', 'G', 'C', 'B', 'P', 'K'] as const
export type ColorToken = (typeof COLOR_IDS)[number]

/** 解锁序：前 6 色不含青/粉；第 7 加青、第 8 加粉（与光谱序可不同） */
export const COLOR_UNLOCK_ORDER: readonly ColorToken[] = [
  'R',
  'O',
  'Y',
  'G',
  'B',
  'P',
  'C',
  'K',
]

export const PASSWORD_LENGTH = 4
export const MAX_ATTEMPTS = 7

export type Password = readonly [ColorToken, ColorToken, ColorToken, ColorToken]
export type Guess = readonly [ColorToken, ColorToken, ColorToken, ColorToken]
export type EditableGuess = [ColorToken | null, ColorToken | null, ColorToken | null, ColorToken | null]

export type SlotHint = 'exact' | 'present' | 'absent'

export type Feedback = {
  exactCount: number
  presentCount: number
  /** Easy 按列直示；Advanced 不填 */
  perSlot?: readonly SlotHint[]
}

export type Attempt = {
  guess: Guess
  feedback: Feedback
  rowIndex: number
}

/** 闯关三档：Easy/Advanced 正计时；nightmare 倒计时 */
export type Difficulty = 'easy' | 'advanced' | 'nightmare'
export type HintStyle = 'column' | 'summary'
export type GameStatus = 'editing' | 'won' | 'lost'
export type LoseReason = 'attempts' | 'timeout'
export type TimerMode = 'countup' | 'countdown'

export type LevelConfig = {
  index: number
  colorCount: number
  allowRepeat: boolean
  hintStyle: HintStyle
  difficulty: Difficulty
  timerMode: TimerMode
  /** 倒计时限额（ms）；正计时不设 */
  timeLimitMs?: number
}

export type GenerateConfig = {
  colorCount: number
  allowRepeat: boolean
}

/** @deprecated 展示文案请用 i18n `m.difficulty` */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  advanced: 'Advanced',
  nightmare: 'Nightmare',
}
