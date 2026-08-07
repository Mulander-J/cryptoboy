import type { Difficulty } from '../domain/types'
import {
  DEFAULT_LOCALE,
  detectLocale,
  resolveLocale,
  type Locale,
} from '../i18n/types'
import { DEFAULT_THEME, resolveTheme, type ThemeId } from '../ui/theme/themes'
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

export type Settings = {
  sound: boolean
  confirmSubmit: boolean
  seenTutorial: boolean
  theme: ThemeId
  locale: Locale
  /** 自定义练习上次选项 */
  customPractice: CustomPracticeOptions
}

export type ProgressState = {
  solo: Record<Difficulty, DifficultyProgress>
  settings: Settings
}

const emptyProgress = (): DifficultyProgress => ({
  unlocked: 1,
  cleared: 0,
  bestTimes: {},
})

const DEFAULT_PROGRESS: ProgressState = {
  solo: {
    easy: emptyProgress(),
    advanced: emptyProgress(),
    challenge: emptyProgress(),
  },
  settings: {
    sound: true,
    confirmSubmit: false,
    seenTutorial: false,
    theme: DEFAULT_THEME,
    locale: DEFAULT_LOCALE,
    customPractice: DEFAULT_CUSTOM_PRACTICE,
  },
}

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
  if (raw && 'locale' in raw && raw.locale != null) {
    return resolveLocale(raw.locale)
  }
  return detectLocale()
}

export function loadProgress(): ProgressState {
  if (!canUseStorage()) {
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      settings: { ...DEFAULT_PROGRESS.settings, locale: detectLocale() },
    }
  }
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        const parsed = JSON.parse(legacy) as ProgressState
        const migrated: ProgressState = {
          solo: {
            easy: mergeDiff(emptyProgress(), parsed.solo?.easy),
            advanced: mergeDiff(emptyProgress(), parsed.solo?.advanced),
            challenge: emptyProgress(),
          },
          settings: {
            ...DEFAULT_PROGRESS.settings,
            ...parsed.settings,
            theme: resolveTheme(parsed.settings?.theme),
            locale: resolveSettingsLocale(parsed.settings),
            customPractice: sanitizeOptions(parsed.settings?.customPractice),
          },
        }
        saveProgress(migrated)
        return migrated
      }
      const fresh = {
        ...structuredClone(DEFAULT_PROGRESS),
        settings: { ...DEFAULT_PROGRESS.settings, locale: detectLocale() },
      }
      saveProgress(fresh)
      return fresh
    }
    const parsed = JSON.parse(raw) as ProgressState
    return {
      solo: {
        easy: mergeDiff(emptyProgress(), parsed.solo?.easy),
        advanced: mergeDiff(emptyProgress(), parsed.solo?.advanced),
        challenge: mergeDiff(emptyProgress(), parsed.solo?.challenge),
      },
      settings: {
        ...DEFAULT_PROGRESS.settings,
        ...parsed.settings,
        theme: resolveTheme(parsed.settings?.theme),
        locale: resolveSettingsLocale(parsed.settings),
        customPractice: sanitizeOptions(parsed.settings?.customPractice),
      },
    }
  } catch {
    return {
      ...structuredClone(DEFAULT_PROGRESS),
      settings: { ...DEFAULT_PROGRESS.settings, locale: detectLocale() },
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
