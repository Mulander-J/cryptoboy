import { sanitizeSpinSpeed, type FateCaseSpinSpeed } from '@/domain/fateCase'
import type { Difficulty, HintStyle, LevelConfig, TimerMode } from '@/domain/types'

/** 难度预设 1–5：一键套用一组默认值，仍可再改单项 */
export type PracticeIntensity = 1 | 2 | 3 | 4 | 5

export type CustomPracticeOptions = {
  intensity: PracticeIntensity
  colorCount: number
  allowRepeat: boolean
  hintStyle: HintStyle
  timed: boolean
  /** 限时时的秒数 */
  timeLimitSec: number
  /** 开启后由同伴设答案再换手开局（本地双人） */
  presetSecret: boolean
  /** 厄运时刻（默认关；与噩梦/无尽默认开不同；当前玩法左轮） */
  fateCase: boolean
  /** 自动开始：入场即开窗口 / 转盘 */
  fateCaseAutoStart: boolean
  /** 一枪定负（同无尽）；关则窗口内可连开（同噩梦） */
  fateCaseOneShot: boolean
  /** 码数速率 1–5 */
  fateCaseSpinSpeed: FateCaseSpinSpeed
}

export const COLOR_COUNT_OPTIONS = [4, 5, 6, 7, 8] as const
export const TIME_LIMIT_OPTIONS = [60, 90, 120, 180] as const
export const FATE_CASE_SPIN_SPEED_OPTIONS = [1, 2, 3, 4, 5] as const

export const DEFAULT_CUSTOM_PRACTICE: CustomPracticeOptions = {
  intensity: 3,
  colorCount: 6,
  allowRepeat: false,
  hintStyle: 'summary',
  timed: false,
  timeLimitSec: 90,
  presetSecret: false,
  fateCase: false,
  fateCaseAutoStart: false,
  fateCaseOneShot: false,
  fateCaseSpinSpeed: 3,
}

type FateCaseOpts =
  | 'presetSecret'
  | 'fateCase'
  | 'fateCaseAutoStart'
  | 'fateCaseOneShot'
  | 'fateCaseSpinSpeed'
type IntensityPreset = Omit<CustomPracticeOptions, 'intensity' | FateCaseOpts>

/** 5 档：2/3/5 对齐闯关简单 / 进阶 / 噩梦 */
const INTENSITY_PRESETS: Record<PracticeIntensity, IntensityPreset> = {
  1: { colorCount: 4, allowRepeat: false, hintStyle: 'column', timed: false, timeLimitSec: 120 },
  2: { colorCount: 6, allowRepeat: false, hintStyle: 'column', timed: false, timeLimitSec: 120 },
  3: { colorCount: 6, allowRepeat: false, hintStyle: 'summary', timed: false, timeLimitSec: 90 },
  4: { colorCount: 6, allowRepeat: true, hintStyle: 'summary', timed: true, timeLimitSec: 120 },
  5: { colorCount: 8, allowRepeat: true, hintStyle: 'summary', timed: true, timeLimitSec: 90 },
}

/** @deprecated 展示文案请用 i18n `m.intensity` */
export const INTENSITY_LABELS: Record<PracticeIntensity, string> = {
  1: 'Intro',
  2: 'Easy',
  3: 'Advanced',
  4: 'Master',
  5: 'Nightmare',
}

/** 闯关三档 → 难度预设（不改动 presetSecret / 厄运时刻项，由调用方合并保留） */
export function optionsFromDifficulty(
  difficulty: Difficulty,
): Omit<CustomPracticeOptions, FateCaseOpts> {
  const intensity: PracticeIntensity =
    difficulty === 'easy' ? 2 : difficulty === 'advanced' ? 3 : 5
  return applyIntensity(intensity)
}

/** 套用难度预设推荐组合（不改动 presetSecret / 厄运时刻项，由调用方合并保留） */
export function applyIntensity(
  intensity: PracticeIntensity,
): Omit<CustomPracticeOptions, FateCaseOpts> {
  return { intensity, ...INTENSITY_PRESETS[intensity] }
}

export function sanitizeOptions(raw: Partial<CustomPracticeOptions> | undefined): CustomPracticeOptions {
  // 兼容旧键 revolver* → fateCase*
  const legacy = raw as Partial<CustomPracticeOptions> & {
    revolver?: boolean
    revolverAutoStart?: boolean
    revolverOneShot?: boolean
    revolverSpinSpeed?: unknown
  }
  const base = {
    ...DEFAULT_CUSTOM_PRACTICE,
    ...raw,
    fateCase: legacy.fateCase ?? legacy.revolver ?? DEFAULT_CUSTOM_PRACTICE.fateCase,
    fateCaseAutoStart:
      legacy.fateCaseAutoStart ??
      legacy.revolverAutoStart ??
      DEFAULT_CUSTOM_PRACTICE.fateCaseAutoStart,
    fateCaseOneShot:
      legacy.fateCaseOneShot ??
      legacy.revolverOneShot ??
      DEFAULT_CUSTOM_PRACTICE.fateCaseOneShot,
    fateCaseSpinSpeed:
      legacy.fateCaseSpinSpeed ??
      legacy.revolverSpinSpeed ??
      DEFAULT_CUSTOM_PRACTICE.fateCaseSpinSpeed,
  }
  let colorCount = Math.min(8, Math.max(4, Math.round(base.colorCount) || 6))
  const allowRepeat = Boolean(base.allowRepeat)
  if (!allowRepeat && colorCount < 4) colorCount = 4

  const timed = Boolean(base.timed)
  let timeLimitSec = Math.round(base.timeLimitSec) || 90
  if (!(TIME_LIMIT_OPTIONS as readonly number[]).includes(timeLimitSec)) {
    timeLimitSec = 90
  }

  const hintStyle: HintStyle = base.hintStyle === 'column' ? 'column' : 'summary'
  // intensity 仅作 UI 快捷档位，不持久化回显；存盘恒为默认 3
  const intensity: PracticeIntensity = 3
  const presetSecret = Boolean(base.presetSecret)
  const fateCase = Boolean(base.fateCase)
  const fateCaseAutoStart = Boolean(base.fateCaseAutoStart)
  const fateCaseOneShot = Boolean(base.fateCaseOneShot)
  const fateCaseSpinSpeed = sanitizeSpinSpeed(base.fateCaseSpinSpeed)

  return {
    intensity,
    colorCount,
    allowRepeat,
    hintStyle,
    timed,
    timeLimitSec,
    presetSecret,
    fateCase,
    fateCaseAutoStart,
    fateCaseOneShot,
    fateCaseSpinSpeed,
  }
}

export function customOptionsToLevelConfig(opts: CustomPracticeOptions): LevelConfig {
  const clean = sanitizeOptions(opts)
  const timerMode: TimerMode = clean.timed ? 'countdown' : 'countup'
  // difficulty 标签仅影响展示归类；自定义一律用 advanced 作载体除非限时
  const difficulty: Difficulty = clean.timed
    ? 'nightmare'
    : clean.hintStyle === 'column'
      ? 'easy'
      : 'advanced'

  return {
    index: 0,
    colorCount: clean.colorCount,
    allowRepeat: clean.allowRepeat,
    hintStyle: clean.hintStyle,
    difficulty,
    timerMode,
    timeLimitMs: clean.timed ? clean.timeLimitSec * 1000 : undefined,
    fateCaseEnabled: clean.fateCase,
    fateCaseAutoStart: clean.fateCase ? clean.fateCaseAutoStart : false,
    fateCaseSpinSpeed: clean.fateCaseSpinSpeed,
    fateCaseOneShot: clean.fateCase ? clean.fateCaseOneShot : false,
  }
}
