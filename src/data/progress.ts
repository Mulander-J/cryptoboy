import type { Difficulty } from '@/domain/types'
import {
  detectLocale,
  resolveInitialLocale,
  type Locale,
} from '@/i18n/types'
import { DEFAULT_THEME, resolveTheme, type ThemeId } from '@/ui/theme/themes'
import {
  DEFAULT_CUSTOM_PRACTICE,
  sanitizeOptions,
  type CustomPracticeOptions,
} from './customPractice'

const STORAGE_KEY = 'code-hack-progress-v2'
const LEGACY_KEY = 'code-hack-progress-v1'

export type DifficultyProgress = {
  unlocked: number
  cleared: number
  /** 各关最佳用时（ms）；三档均记「用时」，越短越好 */
  bestTimes: Record<string, number>
}

export type EndlessProgress = {
  /** 历史最高连胜（破译局数） */
  bestClears: number
}

export type Settings = {
  sound: boolean
  confirmSubmit: boolean
  /** 色盲图案：色块上叠加几何符号 */
  colorBlindPatterns: boolean
  seenTutorial: boolean
  theme: ThemeId
  locale: Locale
  /** 自定义练习上次选项 */
  customPractice: CustomPracticeOptions
}

export type ProgressState = {
  solo: Record<Difficulty, DifficultyProgress>
  endless: EndlessProgress
  settings: Settings
}

const emptyProgress = (): DifficultyProgress => ({
  unlocked: 1,
  cleared: 0,
  bestTimes: {},
})

const emptyEndless = (): EndlessProgress => ({ bestClears: 0 })

/** 设置默认：主题 classic、音效开、色盲关、确认关；语言见 resolveInitialLocale */
export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  confirmSubmit: false,
  colorBlindPatterns: false,
  seenTutorial: false,
  theme: DEFAULT_THEME,
  /** 占位；加载时由 resolveInitialLocale 覆盖 */
  locale: 'zh-CN',
  customPractice: DEFAULT_CUSTOM_PRACTICE,
}

const DEFAULT_PROGRESS: ProgressState = {
  solo: {
    easy: emptyProgress(),
    advanced: emptyProgress(),
    nightmare: emptyProgress(),
  },
  endless: emptyEndless(),
  settings: { ...DEFAULT_SETTINGS },
}

type LegacySolo = Partial<Record<Difficulty | 'challenge', Partial<DifficultyProgress>>>

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined'
}

function mergeDiff(
  base: DifficultyProgress,
  raw: Partial<DifficultyProgress> | undefined,
): DifficultyProgress {
  return {
    unlocked: raw?.unlocked ?? base.unlocked,
    cleared: raw?.cleared ?? base.cleared,
    bestTimes: { ...base.bestTimes, ...raw?.bestTimes },
  }
}

function resolveSettingsLocale(raw: Partial<Settings> | undefined): Locale {
  return resolveInitialLocale(raw?.locale)
}

function freshSettings(): Settings {
  return { ...DEFAULT_SETTINGS, locale: detectLocale() }
}

/** 从旧 challenge 键或 nightmare 键合并噩梦进度 */
function resolveNightmareProgress(solo: LegacySolo | undefined): DifficultyProgress {
  const fromNightmare = solo?.nightmare
  const fromChallenge = solo?.challenge
  if (fromNightmare) return mergeDiff(emptyProgress(), fromNightmare)
  if (fromChallenge) return mergeDiff(emptyProgress(), fromChallenge)
  return emptyProgress()
}

function normalizeProgress(parsed: {
  solo?: LegacySolo
  endless?: Partial<EndlessProgress>
  settings?: Partial<Settings>
}): ProgressState {
  return {
    solo: {
      easy: mergeDiff(emptyProgress(), parsed.solo?.easy),
      advanced: mergeDiff(emptyProgress(), parsed.solo?.advanced),
      nightmare: resolveNightmareProgress(parsed.solo),
    },
    endless: {
      bestClears: Math.max(0, Math.floor(parsed.endless?.bestClears ?? 0)),
    },
    settings: {
      ...DEFAULT_SETTINGS,
      ...parsed.settings,
      sound: typeof parsed.settings?.sound === 'boolean' ? parsed.settings.sound : true,
      confirmSubmit:
        typeof parsed.settings?.confirmSubmit === 'boolean'
          ? parsed.settings.confirmSubmit
          : false,
      colorBlindPatterns:
        typeof parsed.settings?.colorBlindPatterns === 'boolean'
          ? parsed.settings.colorBlindPatterns
          : false,
      theme: resolveTheme(parsed.settings?.theme),
      locale: resolveSettingsLocale(parsed.settings),
      customPractice: sanitizeOptions(parsed.settings?.customPractice),
    },
  }
}

export function loadProgress(): ProgressState {
  if (!canUseStorage()) {
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      settings: freshSettings(),
    }
  }
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        const parsed = JSON.parse(legacy) as {
          solo?: LegacySolo
          settings?: Partial<Settings>
        }
        const migrated = normalizeProgress({
          solo: {
            easy: parsed.solo?.easy,
            advanced: parsed.solo?.advanced,
          },
          settings: parsed.settings,
        })
        saveProgress(migrated)
        return migrated
      }
      const fresh = {
        ...structuredClone(DEFAULT_PROGRESS),
        settings: freshSettings(),
      }
      saveProgress(fresh)
      return fresh
    }
    const parsed = JSON.parse(raw) as {
      solo?: LegacySolo
      endless?: Partial<EndlessProgress>
      settings?: Partial<Settings>
    }
    const normalized = normalizeProgress(parsed)
    // 若仍带旧 challenge 键，写回 nightmare 形态
    if (parsed.solo && 'challenge' in parsed.solo && !('nightmare' in parsed.solo)) {
      saveProgress(normalized)
    }
    return normalized
  } catch {
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      settings: freshSettings(),
    }
  }
}

export function saveProgress(state: ProgressState): void {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 配额或隐私模式：静默失败
  }
}

export function getBestTime(
  state: ProgressState,
  difficulty: Difficulty,
  levelIndex: number,
): number | undefined {
  return state.solo[difficulty].bestTimes[String(levelIndex)]
}

/**
 * 通关：解锁下一关，并在用时更短时更新最佳用时。
 */
export function markLevelCleared(
  state: ProgressState,
  difficulty: Difficulty,
  levelIndex: number,
  maxLevels: number,
  elapsedMs?: number,
): ProgressState {
  const cur = state.solo[difficulty]
  const cleared = Math.max(cur.cleared, levelIndex)
  const unlocked = Math.min(maxLevels, Math.max(cur.unlocked, levelIndex + 1))
  const bestTimes = { ...cur.bestTimes }
  if (typeof elapsedMs === 'number' && elapsedMs >= 0) {
    const key = String(levelIndex)
    const prev = bestTimes[key]
    if (prev === undefined || elapsedMs < prev) {
      bestTimes[key] = elapsedMs
    }
  }
  const next: ProgressState = {
    ...state,
    solo: {
      ...state.solo,
      [difficulty]: { unlocked, cleared, bestTimes },
    },
  }
  saveProgress(next)
  return next
}

export function recordEndlessClears(
  state: ProgressState,
  clears: number,
): ProgressState {
  const bestClears = Math.max(state.endless.bestClears, Math.max(0, Math.floor(clears)))
  if (bestClears === state.endless.bestClears) return state
  const next: ProgressState = {
    ...state,
    endless: { bestClears },
  }
  saveProgress(next)
  return next
}

export function updateSettings(
  state: ProgressState,
  patch: Partial<Settings>,
): ProgressState {
  const next: ProgressState = {
    ...state,
    settings: { ...state.settings, ...patch },
  }
  saveProgress(next)
  return next
}

/** 是否已有可清空的闯关/无尽进度 */
export function hasSoloProgress(state: ProgressState): boolean {
  const soloHas = (Object.keys(state.solo) as Difficulty[]).some((d) => {
    const cur = state.solo[d]
    return (
      cur.unlocked > 1 || cur.cleared > 0 || Object.keys(cur.bestTimes).length > 0
    )
  })
  return soloHas || state.endless.bestClears > 0
}

/** 重置闯关与无尽进度；保留设置 */
export function resetSoloProgress(state: ProgressState): ProgressState {
  const next: ProgressState = {
    ...state,
    solo: {
      easy: emptyProgress(),
      advanced: emptyProgress(),
      nightmare: emptyProgress(),
    },
    endless: emptyEndless(),
  }
  saveProgress(next)
  return next
}
