import { useCallback, useEffect, useState } from 'react'
import {
  customOptionsToLevelConfig,
  sanitizeOptions,
  type CustomPracticeOptions,
} from '../data/customPractice'
import { MAX_LEVELS } from '../data/levels'
import {
  getBestTime,
  loadProgress,
  markLevelCleared,
  updateSettings,
  type ProgressState,
} from '../data/progress'
import type { Difficulty } from '../domain/types'
import { HelpController } from '../features/help/HelpController'
import { AiCreatedBadge } from '../features/menu/AiCreatedBadge'
import { AppChrome } from '../features/menu/AppChrome'
import { CustomPracticeSetup } from '../features/menu/CustomPracticeSetup'
import { Menu, type Screen } from '../features/menu/Menu'
import { GameBoard } from '../features/solo/GameBoard'
import { I18nProvider, type Locale } from '../i18n'
import { applyTheme, type ThemeId } from '../ui/theme/themes'

export default function App() {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [screen, setScreen] = useState<Screen>({ name: 'menu' })
  const [customDraft, setCustomDraft] = useState<CustomPracticeOptions>(
    () => loadProgress().settings.customPractice,
  )

  useEffect(() => {
    applyTheme(progress.settings.theme)
  }, [progress.settings.theme])

  const markTutorialSeen = useCallback(() => {
    setProgress((p) => {
      if (p.settings.seenTutorial) return p
      return updateSettings(p, { seenTutorial: true })
    })
  }, [])

  const selectTheme = useCallback((theme: ThemeId) => {
    applyTheme(theme)
    setProgress((p) => updateSettings(p, { theme }))
  }, [])

  const selectLocale = useCallback((locale: Locale) => {
    setProgress((p) => updateSettings(p, { locale }))
  }, [])

  const startSolo = useCallback(
    (difficulty: Difficulty) => {
      const level = progress.solo[difficulty].unlocked
      setScreen({ name: 'solo', difficulty, level })
    },
    [progress],
  )

  const onClearLevel = useCallback(
    (difficulty: Difficulty, level: number, elapsedMs: number) => {
      setProgress((p) =>
        markLevelCleared(p, difficulty, level, MAX_LEVELS[difficulty], elapsedMs),
      )
    },
    [],
  )

  const saveCustomDraft = useCallback((next: CustomPracticeOptions) => {
    const clean = sanitizeOptions(next)
    setCustomDraft(clean)
    setProgress((p) => updateSettings(p, { customPractice: clean }))
  }, [])

  const startCustomPractice = useCallback(() => {
    const clean = sanitizeOptions(customDraft)
    setCustomDraft(clean)
    setProgress((p) => updateSettings(p, { customPractice: clean }))
    const cfg = customOptionsToLevelConfig(clean)
    setScreen({ name: 'practice', difficulty: cfg.difficulty })
  }, [customDraft])

  const practiceConfig =
    screen.name === 'practice'
      ? customOptionsToLevelConfig(progress.settings.customPractice)
      : undefined

  return (
    <I18nProvider locale={progress.settings.locale} onLocaleChange={selectLocale}>
      <HelpController
        initiallyOpen={!progress.settings.seenTutorial}
        onSeen={markTutorialSeen}
      >
        <AppChrome />
        <AiCreatedBadge />

        {screen.name === 'menu' ? (
          <Menu
            progress={progress}
            onStartSolo={startSolo}
            onOpenCustom={() => {
              setCustomDraft(progress.settings.customPractice)
              setScreen({ name: 'custom-setup' })
            }}
            onToggleSound={() =>
              setProgress((p) => updateSettings(p, { sound: !p.settings.sound }))
            }
            onSelectTheme={selectTheme}
          />
        ) : null}

        {screen.name === 'custom-setup' ? (
          <CustomPracticeSetup
            value={customDraft}
            onChange={saveCustomDraft}
            onStart={startCustomPractice}
            onBack={() => setScreen({ name: 'menu' })}
          />
        ) : null}

        {screen.name === 'solo' ? (
          <GameBoard
            key={`solo-${screen.difficulty}-${screen.level}`}
            mode="solo"
            difficulty={screen.difficulty}
            level={screen.level}
            sound={progress.settings.sound}
            bestTimeMs={getBestTime(progress, screen.difficulty, screen.level)}
            onClearLevel={(level, elapsedMs) =>
              onClearLevel(screen.difficulty, level, elapsedMs)
            }
            onNextLevel={() =>
              setScreen({
                name: 'solo',
                difficulty: screen.difficulty,
                level: Math.min(MAX_LEVELS[screen.difficulty], screen.level + 1),
              })
            }
            onMenu={() => setScreen({ name: 'menu' })}
          />
        ) : null}

        {screen.name === 'practice' && practiceConfig ? (
          <GameBoard
            key={`practice-${JSON.stringify(practiceConfig)}`}
            mode="practice"
            difficulty={practiceConfig.difficulty}
            level={0}
            customConfig={practiceConfig}
            sound={progress.settings.sound}
            onMenu={() => setScreen({ name: 'custom-setup' })}
          />
        ) : null}
      </HelpController>
    </I18nProvider>
  )
}
