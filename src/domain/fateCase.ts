import { colorsForCount } from './colors'
import type { ColorToken, Difficulty, Guess, LevelConfig, Password } from './types'

/**
 * 厄运时刻（Fate Night）总称层。
 * 左轮（revolver）是玩法子集；视觉主题可映射到不同玩法，**当前全部主题默认左轮**。
 */

/** 收官窗口（ms）。与转速档联动：须整圈，避免半圈导致部分色球机会不均。 */
export const FATE_CASE_TIME_FLOOR_MS = 3_000

/** 玩法 id；扩展新玩法时在此联合类型追加（如 'iaido'） */
export type FateCasePlayMode = 'revolver'

export const FATE_CASE_PLAY_MODE_REVOLVER: FateCasePlayMode = 'revolver'

/** 未映射主题时的默认玩法 */
export const DEFAULT_FATE_CASE_PLAY_MODE: FateCasePlayMode = FATE_CASE_PLAY_MODE_REVOLVER

/**
 * 视觉主题 id → 厄运时刻玩法。
 * 左轮 ⊂ Fate Case；现有主题一律左轮，后续可按主题改挂其他玩法。
 */
export const THEME_FATE_CASE_PLAY_MODE: Readonly<Record<string, FateCasePlayMode>> = {
  classic: 'revolver',
  sanxingdui: 'revolver',
  xmas: 'revolver',
  cyber: 'revolver',
  cappuccino: 'revolver',
  'plum-snow': 'revolver',
  cny: 'revolver',
  panzer: 'revolver',
  americana: 'revolver',
}

/** 主题 / 显式配置 → 玩法；未知主题回落默认左轮 */
export function resolveFateCasePlayMode(
  themeId?: string | null,
  configPlayMode?: FateCasePlayMode,
): FateCasePlayMode {
  if (configPlayMode) return configPlayMode
  if (themeId != null && themeId !== '') {
    const mapped = THEME_FATE_CASE_PLAY_MODE[themeId]
    if (mapped) return mapped
  }
  return DEFAULT_FATE_CASE_PLAY_MODE
}

export function sanitizePlayMode(raw: unknown): FateCasePlayMode {
  if (raw === 'revolver') return 'revolver'
  return DEFAULT_FATE_CASE_PLAY_MODE
}

/** 转速档：窗口内整圈数 1→1 圈 … 5→5 圈（越高转越快、越难锁定；现属左轮玩法） */
export type FateCaseSpinSpeed = 1 | 2 | 3 | 4 | 5

/** 各档窗口内整圈数（与 FATE_CASE_SPIN_MS 对应） */
export const FATE_CASE_LAPS: Record<FateCaseSpinSpeed, number> = {
  1: 1,
  2: 2,
  3: 3, // 噩梦
  4: 4,
  5: 5, // 无尽
}

/** 一圈耗时 = 窗口 / 整圈数 */
export const FATE_CASE_SPIN_MS: Record<FateCaseSpinSpeed, number> = {
  1: FATE_CASE_TIME_FLOOR_MS / FATE_CASE_LAPS[1],
  2: FATE_CASE_TIME_FLOOR_MS / FATE_CASE_LAPS[2],
  3: FATE_CASE_TIME_FLOOR_MS / FATE_CASE_LAPS[3],
  4: FATE_CASE_TIME_FLOOR_MS / FATE_CASE_LAPS[4],
  5: FATE_CASE_TIME_FLOOR_MS / FATE_CASE_LAPS[5],
}

export function sanitizeSpinSpeed(raw: unknown): FateCaseSpinSpeed {
  const n = Math.round(Number(raw))
  if (n >= 1 && n <= 5) return n as FateCaseSpinSpeed
  return 3
}

/** 展示用码数：整圈数 ÷ 窗口秒数 × 100（如 5 圈/3s → 167） */
export function fateCaseSpeedRating(speed: FateCaseSpinSpeed): number {
  const sec = FATE_CASE_TIME_FLOOR_MS / 1000
  return Math.round((FATE_CASE_LAPS[sanitizeSpinSpeed(speed)] / sec) * 100)
}

/** 左轮弹巢选项：色或空弹（玩法专属字段，挂在 FateCasePhase 上） */
export type FateCaseChoice = ColorToken | 'blank'

export type FateCasePhase = {
  /** 当前收官玩法；UI 可按此分支 */
  playMode: FateCasePlayMode
  hangingIndex: number
  /** 长度 4：锁格为已揭晓色，悬格为 null */
  locks: readonly (ColorToken | null)[]
  /** 左轮弹巢；其他玩法可忽略或另挂字段 */
  chamber: readonly FateCaseChoice[]
}

export type GameMode = 'solo' | 'practice' | 'endless'

/** 显式启用面：勿用 difficulty===nightmare alone（会误开限时试炼） */
export function resolveFateCaseEnabled(
  mode: GameMode,
  difficulty: Difficulty,
  configEnabled?: boolean,
): boolean {
  if (mode === 'endless') return true
  if (mode === 'solo') return difficulty === 'nightmare'
  return Boolean(configEnabled)
}

/** 噩梦手动开始；无尽自动开始；试炼跟随选项 */
export function resolveFateCaseAutoStart(
  mode: GameMode,
  _difficulty: Difficulty,
  configAutoStart?: boolean,
): boolean {
  if (mode === 'endless') return true
  if (mode === 'solo') return false
  return Boolean(configAutoStart)
}

/** 噩梦 3 档、无尽 5 档（最快）；试炼跟随选项（默认 3） */
export function resolveFateCaseSpinSpeed(
  mode: GameMode,
  difficulty: Difficulty,
  configSpeed?: FateCaseSpinSpeed | number,
): FateCaseSpinSpeed {
  if (mode === 'endless') return 5
  if (mode === 'solo' && difficulty === 'nightmare') return 3
  if (mode === 'practice') return sanitizeSpinSpeed(configSpeed)
  return 3
}

/**
 * 一枪定负：仅无尽。
 * 噩梦 / 试炼默认可连开至命中或超时；试炼可显式 `fateCaseOneShot: true`。
 */
export function resolveFateCaseOneShot(
  mode: GameMode,
  _difficulty: Difficulty,
  configOneShot?: boolean,
): boolean {
  if (mode === 'endless') return true
  if (mode === 'solo') return false
  return Boolean(configOneShot)
}

/** 悬格下标；无精确 3 锁时返回 -1 */
export function hangingSlotIndex(secret: Password, guess: Guess): number {
  let hanging = -1
  let exact = 0
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      exact++
    } else {
      hanging = i
    }
  }
  return exact === 3 ? hanging : -1
}

/** 悬格仍可能的颜色（尊重色板 / 重复规则） */
export function hangingCandidates(
  secret: Password,
  guess: Guess,
  config: Pick<LevelConfig, 'colorCount' | 'allowRepeat'>,
): ColorToken[] {
  const hanging = hangingSlotIndex(secret, guess)
  if (hanging < 0) return []

  const palette = colorsForCount(config.colorCount)
  if (config.allowRepeat) return [...palette]

  const used = new Set<ColorToken>()
  for (let i = 0; i < 4; i++) {
    if (i !== hanging) used.add(secret[i]!)
  }
  return palette.filter((c) => !used.has(c))
}

/** `|candidates|<=1` 时追加空弹，避免必中 */
export function buildChamber(candidates: readonly ColorToken[]): FateCaseChoice[] {
  if (candidates.length === 0) return ['blank']
  if (candidates.length <= 1) return [...candidates, 'blank']
  return [...candidates]
}

export function buildFateCasePhase(
  secret: Password,
  guess: Guess,
  config: Pick<LevelConfig, 'colorCount' | 'allowRepeat' | 'fateCasePlayMode'>,
): FateCasePhase | null {
  const hangingIndex = hangingSlotIndex(secret, guess)
  if (hangingIndex < 0) return null

  const locks: (ColorToken | null)[] = [null, null, null, null]
  for (let i = 0; i < 4; i++) {
    locks[i] = i === hangingIndex ? null : secret[i]!
  }

  const candidates = hangingCandidates(secret, guess, config)
  return {
    playMode: resolveFateCasePlayMode(null, config.fateCasePlayMode),
    hangingIndex,
    locks,
    chamber: buildChamber(candidates),
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

/** 入收官：统一重置窗口为 floor（不超过本局限额由 clock 侧处理） */
export function applyFateCaseTimeReset(
  _remainingMs: number,
  floorMs = FATE_CASE_TIME_FLOOR_MS,
): number {
  return floorMs
}
