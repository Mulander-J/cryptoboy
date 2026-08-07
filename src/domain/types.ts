/** 颜色与局内核心类型（零 UI） */

export const COLOR_IDS = ['R', 'O', 'Y', 'G', 'B', 'P', 'C', 'K'] as const
export type ColorToken = (typeof COLOR_IDS)[number]

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

/** 三档：普通 Easy/Advanced 正计时；challenge 限时倒计时 */
export type Difficulty = 'easy' | 'advanced' | 'challenge'
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
  challenge: 'Challenge',
}
