import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  sanitizeOptions,
  type CustomPracticeOptions,
} from '@/data/customPractice'
import { MAX_LEVELS } from '@/data/levels'
import {
  loadProgress,
  markLevelCleared,
  resetSoloProgress,
  updateSettings,
  type ProgressState,
  type Settings,
} from '@/data/progress'
import type { Difficulty } from '@/domain/types'
import type { Locale } from '@/i18n'
import { applyTheme } from '@/ui/theme/themes'

type ProgressContextValue = {
  progress: ProgressState
  updateSettingsPatch: (patch: Partial<Settings>) => void
  selectLocale: (locale: Locale) => void
  resetProgress: () => void
  markTutorialSeen: () => void
  clearLevel: (difficulty: Difficulty, level: number, elapsedMs: number) => void
  saveCustomPractice: (next: CustomPracticeOptions) => CustomPracticeOptions
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())

  useEffect(() => {
    applyTheme(progress.settings.theme)
  }, [progress.settings.theme])

  const updateSettingsPatch = useCallback((patch: Partial<Settings>) => {
    if (patch.theme !== undefined) applyTheme(patch.theme)
    setProgress((p) => updateSettings(p, patch))
  }, [])

  const selectLocale = useCallback((locale: Locale) => {
    setProgress((p) => updateSettings(p, { locale }))
  }, [])

  const resetProgress = useCallback(() => {
    setProgress((p) => resetSoloProgress(p))
  }, [])

  const markTutorialSeen = useCallback(() => {
    setProgress((p) => {
      if (p.settings.seenTutorial) return p
      return updateSettings(p, { seenTutorial: true })
    })
  }, [])

  const clearLevel = useCallback(
    (difficulty: Difficulty, level: number, elapsedMs: number) => {
      setProgress((p) =>
        markLevelCleared(p, difficulty, level, MAX_LEVELS[difficulty], elapsedMs),
      )
    },
    [],
  )

  const saveCustomPractice = useCallback((next: CustomPracticeOptions) => {
    const clean = sanitizeOptions(next)
    setProgress((p) => updateSettings(p, { customPractice: clean }))
    return clean
  }, [])

  const value = useMemo(
    () => ({
      progress,
      updateSettingsPatch,
      selectLocale,
      resetProgress,
      markTutorialSeen,
      clearLevel,
      saveCustomPractice,
    }),
    [
      progress,
      updateSettingsPatch,
      selectLocale,
      resetProgress,
      markTutorialSeen,
      clearLevel,
      saveCustomPractice,
    ],
  )

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  )
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
