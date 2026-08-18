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

/** 进度相关 localStorage 键（含已废弃键；升级清场时一并扫掉） */
const PROGRESS_STORAGE_KEYS = [STORAGE_KEY, LEGACY_KEY] as const

export type DifficultyProgress = {
  cleared: number
  /** 各关最佳用时（ms）；三档均记「用时」，越短越好 */
  bestTimes: Record<string, number>
  /** 周目（NG+），从 1 起；整档通关后可进下一周目，参与关卡种子 */
  cycle: number
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
  cleared: 0,
  bestTimes: {},
  cycle: 1,
})

/** 由已通关数衍生当前允许进入的最高关卡（最小 1，最大 maxLevels） */
export function getUnlockedLevel(p: DifficultyProgress, maxLevels: number): number {
  return Math.min(maxLevels, Math.max(1, p.cleared + 1))
}

const emptyEndless = (): EndlessProgress => ({ bestClears: 0 })

/** 设置默认：主题 cny（祥瑞新春）、音效开、色盲关、确认关；语言见 resolveInitialLocale */
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

function sanitizeCycle(raw: unknown, fallback: number): number {
  const n = Math.floor(Number(raw))
  return Number.isFinite(n) && n >= 1 ? n : fallback
}

function mergeDiff(
  base: DifficultyProgress,
  raw: Partial<DifficultyProgress> | undefined,
): DifficultyProgress {
  return {
    cleared: raw?.cleared ?? base.cleared,
    bestTimes: { ...base.bestTimes, ...raw?.bestTimes },
    cycle: sanitizeCycle(raw?.cycle, base.cycle),
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
        clearProgressStorageCache()
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
  _maxLevels: number,
  elapsedMs?: number,
): ProgressState {
  const cur = state.solo[difficulty]
  const cleared = Math.max(cur.cleared, levelIndex)
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
      [difficulty]: { ...cur, cleared, bestTimes },
    },
  }
  saveProgress(next)
  return next
}

/**
 * 开启下一周目（NG+）：须整档通关；解锁/通关/最佳用时归位，周目 +1（参与关卡种子）。
 */
export function startNextCycle(
  state: ProgressState,
  difficulty: Difficulty,
  maxLevels: number,
): ProgressState {
  const cur = state.solo[difficulty]
  if (cur.cleared < maxLevels) return state
  const next: ProgressState = {
    ...state,
    solo: {
      ...state.solo,
      [difficulty]: {
        cleared: 0,
        bestTimes: {},
        cycle: cur.cycle + 1,
      },
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
      cur.cleared > 0 ||
      cur.cycle > 1 ||
      Object.keys(cur.bestTimes).length > 0
    )
  })
  return soloHas || state.endless.bestClears > 0
}

/**
 * 清除进度相关 localStorage（含废弃键），不改内存态。
 * 升级废弃键、reset 清场、或需要彻底重写存档时调用；调用方负责再 `saveProgress`。
 */
export function clearProgressStorageCache(
  keys: readonly string[] = PROGRESS_STORAGE_KEYS,
): void {
  if (!canUseStorage()) return
  for (const key of keys) {
    try {
      localStorage.removeItem(key)
    } catch {
      // 隐私模式等：静默失败
    }
  }
}

/** 重置闯关与无尽进度；保留设置；顺带清掉废弃存档键后回写 */
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
  clearProgressStorageCache()
  saveProgress(next)
  return next
}
