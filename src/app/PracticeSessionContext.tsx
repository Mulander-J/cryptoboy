import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  sanitizeOptions,
  type CustomPracticeOptions,
} from '@/data/customPractice'
import type { Password } from '@/domain/types'
import { useProgress } from './ProgressContext'

type PracticeSessionValue = {
  draft: CustomPracticeOptions
  setDraft: (next: CustomPracticeOptions) => void
  secret: Password | null
  setSecret: (secret: Password | null) => void
  clearSecret: () => void
  /** 打开练习设置页时同步进度里的草稿 */
  hydrateDraftFromProgress: () => void
}

const PracticeSessionContext = createContext<PracticeSessionValue | null>(null)

export function PracticeSessionProvider({ children }: { children: ReactNode }) {
  const { progress, saveCustomPractice } = useProgress()
  const [draft, setDraftState] = useState<CustomPracticeOptions>(() =>
    sanitizeOptions(progress.settings.customPractice),
  )
  const [secret, setSecret] = useState<Password | null>(null)

  const setDraft = useCallback(
    (next: CustomPracticeOptions) => {
      setDraftState(saveCustomPractice(next))
    },
    [saveCustomPractice],
  )

  const clearSecret = useCallback(() => {
    setSecret(null)
  }, [])

  const hydrateDraftFromProgress = useCallback(() => {
    setDraftState(sanitizeOptions(progress.settings.customPractice))
  }, [progress.settings.customPractice])

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      secret,
      setSecret,
      clearSecret,
      hydrateDraftFromProgress,
    }),
    [draft, setDraft, secret, clearSecret, hydrateDraftFromProgress],
  )

  return (
    <PracticeSessionContext.Provider value={value}>
      {children}
    </PracticeSessionContext.Provider>
  )
}

export function usePracticeSession(): PracticeSessionValue {
  const ctx = useContext(PracticeSessionContext)
  if (!ctx) {
    throw new Error('usePracticeSession must be used within PracticeSessionProvider')
  }
  return ctx
}
