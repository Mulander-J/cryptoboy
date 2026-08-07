import type { Difficulty, HintStyle, LevelConfig, TimerMode } from '@/domain/types'
import { practiceConfig } from './levels'

/** 难度系数 1–5：一键套用一组默认值，仍可再改单项 */
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
}

export const COLOR_COUNT_OPTIONS = [4, 5, 6, 7, 8] as const
export const TIME_LIMIT_OPTIONS = [60, 90, 120, 180] as const

export const DEFAULT_CUSTOM_PRACTICE: CustomPracticeOptions = {
  intensity: 3,
  colorCount: 6,
  allowRepeat: false,
  hintStyle: 'summary',
  timed: false,
  timeLimitSec: 90,
  presetSecret: false,
}

type IntensityPreset = Omit<CustomPracticeOptions, 'intensity' | 'presetSecret'>

const INTENSITY_PRESETS: Record<PracticeIntensity, IntensityPreset> = {
  1: { colorCount: 4, allowRepeat: false, hintStyle: 'column', timed: false, timeLimitSec: 120 },
  2: { colorCount: 5, allowRepeat: false, hintStyle: 'column', timed: false, timeLimitSec: 120 },
  3: { colorCount: 6, allowRepeat: false, hintStyle: 'summary', timed: false, timeLimitSec: 90 },
  4: { colorCount: 6, allowRepeat: true, hintStyle: 'summary', timed: true, timeLimitSec: 120 },
  5: { colorCount: 8, allowRepeat: true, hintStyle: 'summary', timed: true, timeLimitSec: 90 },
}

/** @deprecated 展示文案请用 i18n `m.intensity` */
export const INTENSITY_LABELS: Record<PracticeIntensity, string> = {
  1: 'Intro',
  2: 'Easy',
  3: 'Standard',
  4: 'Hard',
  5: 'Extreme',
}

/** Easy / Advanced / 限时 快捷复用（不改动 presetSecret，由调用方合并保留） */
export function optionsFromDifficulty(
  difficulty: Difficulty,
): Omit<CustomPracticeOptions, 'presetSecret'> {
  const base = practiceConfig(difficulty)
  return {
    intensity: difficulty === 'easy' ? 2 : difficulty === 'advanced' ? 3 : 5,
    colorCount: base.colorCount,
    allowRepeat: base.allowRepeat,
    hintStyle: base.hintStyle,
    timed: base.timerMode === 'countdown',
    timeLimitSec: Math.round((base.timeLimitMs ?? 90_000) / 1000),
  }
}

/** 套用难度系数推荐组合（不改动 presetSecret，由调用方合并保留） */
export function applyIntensity(
  intensity: PracticeIntensity,
): Omit<CustomPracticeOptions, 'presetSecret'> {
  return { intensity, ...INTENSITY_PRESETS[intensity] }
}

export function sanitizeOptions(raw: Partial<CustomPracticeOptions> | undefined): CustomPracticeOptions {
  const base = { ...DEFAULT_CUSTOM_PRACTICE, ...raw }
  let colorCount = Math.min(8, Math.max(4, Math.round(base.colorCount) || 6))
  const allowRepeat = Boolean(base.allowRepeat)
  if (!allowRepeat && colorCount < 4) colorCount = 4

  const timed = Boolean(base.timed)
  let timeLimitSec = Math.round(base.timeLimitSec) || 90
  if (!(TIME_LIMIT_OPTIONS as readonly number[]).includes(timeLimitSec)) {
    timeLimitSec = 90
  }

  const hintStyle: HintStyle = base.hintStyle === 'column' ? 'column' : 'summary'
  const intensity = ([1, 2, 3, 4, 5] as const).includes(base.intensity as PracticeIntensity)
    ? (base.intensity as PracticeIntensity)
    : 3
  const presetSecret = Boolean(base.presetSecret)

  return { intensity, colorCount, allowRepeat, hintStyle, timed, timeLimitSec, presetSecret }
}

export function customOptionsToLevelConfig(opts: CustomPracticeOptions): LevelConfig {
  const clean = sanitizeOptions(opts)
  const timerMode: TimerMode = clean.timed ? 'countdown' : 'countup'
  // difficulty 标签仅影响展示归类；自定义一律用 advanced 作载体除非限时
  const difficulty: Difficulty = clean.timed
    ? 'challenge'
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
  }
}
