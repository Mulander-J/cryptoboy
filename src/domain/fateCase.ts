import { colorsForCount } from './colors'
import type { ColorToken, Difficulty, Guess, LevelConfig, Password } from './types'

/**
 * Fate Night（厄运时刻）领域：触发、难度档、候选项、命中判定。
 * 玩法 UI：features/solo/fateNight；规格：PRODUCT §3.7。
 */

export const FATE_CASE_TIME_FLOOR_MS = 3_000

export type FateCasePlayMode = 'revolver' | 'beat'
export type FateCaseDifficultyTier = 1 | 2 | 3 | 4 | 5
export type FateCaseChoice = ColorToken | 'blank'
export type GameMode = 'solo' | 'practice' | 'endless'

export type FateCasePhase = {
  playMode: FateCasePlayMode
  hangingIndex: number
  locks: readonly (ColorToken | null)[]
  chamber: readonly FateCaseChoice[]
}

const DEFAULT_PLAY_MODE: FateCasePlayMode = 'beat'

/** 仅非默认主题；未列出 → beat */
export const THEME_FATE_CASE_PLAY_MODE: Readonly<Partial<Record<string, FateCasePlayMode>>> = {
  americana: 'revolver',
}

/** 档位 → 一周期耗时（窗口 3s ÷ 周期数；噩梦 3、无尽 5） */
export const FATE_CASE_SPIN_MS: Record<FateCaseDifficultyTier, number> = {
  1: FATE_CASE_TIME_FLOOR_MS / 1,
  2: FATE_CASE_TIME_FLOOR_MS / 2,
  3: FATE_CASE_TIME_FLOOR_MS / 3,
  4: FATE_CASE_TIME_FLOOR_MS / 4,
  5: FATE_CASE_TIME_FLOOR_MS / 5,
}

/** 校验难度档 1–5 */
export function sanitizeFateCaseDifficulty(raw: unknown): FateCaseDifficultyTier {
  const n = Math.round(Number(raw))
  return n >= 1 && n <= 5 ? (n as FateCaseDifficultyTier) : 3
}

export function resolveFateCasePlayMode(
  themeId?: string | null,
  configPlayMode?: FateCasePlayMode,
): FateCasePlayMode {
  if (configPlayMode) return configPlayMode
  if (themeId) return THEME_FATE_CASE_PLAY_MODE[themeId] ?? DEFAULT_PLAY_MODE
  return DEFAULT_PLAY_MODE
}

/** 按模式一次解析：启用 / 自动开始 / 一次机会 / 难度 / 玩法 */
export function resolveFateCaseRuntime(
  mode: GameMode,
  difficulty: Difficulty,
  config: {
    fateCaseEnabled?: boolean
    fateCaseAutoStart?: boolean
    fateCaseOneShot?: boolean
    fateCaseDifficulty?: FateCaseDifficultyTier | number
    fateCasePlayMode?: FateCasePlayMode
  } = {},
  themeId?: string | null,
) {
  const practice = mode === 'practice'
  return {
    enabled:
      mode === 'endless' ||
      (mode === 'solo' && difficulty === 'nightmare') ||
      (practice && Boolean(config.fateCaseEnabled)),
    autoStart: mode === 'endless' || (practice && Boolean(config.fateCaseAutoStart)),
    oneShot: mode === 'endless' || (practice && Boolean(config.fateCaseOneShot)),
    difficulty:
      mode === 'endless'
        ? (5 as const)
        : practice
          ? sanitizeFateCaseDifficulty(config.fateCaseDifficulty)
          : (3 as const),
    playMode: resolveFateCasePlayMode(themeId, config.fateCasePlayMode),
  }
}

/** 悬格下标；非精确三锁返回 -1 */
export function hangingSlotIndex(secret: Password, guess: Guess): number {
  let hanging = -1
  let exact = 0
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) exact++
    else hanging = i
  }
  return exact === 3 ? hanging : -1
}

export function hangingCandidates(
  secret: Password,
  guess: Guess,
  config: Pick<LevelConfig, 'colorCount' | 'allowRepeat'>,
): ColorToken[] {
  const hanging = hangingSlotIndex(secret, guess)
  if (hanging < 0) return []

  const palette = colorsForCount(config.colorCount)
  if (config.allowRepeat) return [...palette]

  const used = new Set(secret.filter((_, i) => i !== hanging) as ColorToken[])
  return palette.filter((c) => !used.has(c))
}

/** 候选项唯一时追加空弹，避免必中 */
export function buildChamber(candidates: readonly ColorToken[]): FateCaseChoice[] {
  if (candidates.length === 0) return ['blank']
  if (candidates.length === 1) return [candidates[0]!, 'blank']
  return [...candidates]
}

export function buildFateCasePhase(
  secret: Password,
  guess: Guess,
  config: Pick<LevelConfig, 'colorCount' | 'allowRepeat' | 'fateCasePlayMode'>,
): FateCasePhase | null {
  const hangingIndex = hangingSlotIndex(secret, guess)
  if (hangingIndex < 0) return null

  const locks = secret.map((c, i) => (i === hangingIndex ? null : c)) as (ColorToken | null)[]
  return {
    playMode: resolveFateCasePlayMode(null, config.fateCasePlayMode),
    hangingIndex,
    locks,
    chamber: buildChamber(hangingCandidates(secret, guess, config)),
  }
}

export function resolveShot(
  choice: FateCaseChoice,
  secret: Password,
  hangingIndex: number,
): 'hit' | 'miss' {
  if (choice === 'blank') return 'miss'
  return choice === secret[hangingIndex] ? 'hit' : 'miss'
}
