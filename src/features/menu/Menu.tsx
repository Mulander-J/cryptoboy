import type { Difficulty } from '../../domain/types'
import type { ProgressState } from '../../data/progress'
import { challengeTimeLimitMs } from '../../data/levels'
import { formatMmSs } from '../../domain/clock'
import { useI18n } from '../../i18n'
import { MenuSettingRow } from '../../ui/MenuSettingRow'
import type { ThemeId } from '../../ui/theme/themes'
import { useHelp } from '../help/HelpController'
import { LocaleSwitcher } from './LocaleSwitcher'
import { SoundToggle } from './SoundToggle'
import { ThemePicker } from './ThemePicker'

export type Screen =
  | { name: 'menu' }
  | { name: 'solo'; difficulty: Difficulty; level: number }
  | { name: 'custom-setup' }
  | { name: 'practice'; difficulty: Difficulty }

type Props = {
  progress: ProgressState
  onStartSolo: (difficulty: Difficulty) => void
  onOpenCustom: () => void
  onToggleSound: () => void
  onSelectTheme: (theme: ThemeId) => void
}

export function Menu({
  progress,
  onStartSolo,
  onOpenCustom,
  onToggleSound,
  onSelectTheme,
}: Props) {
  const { m, t } = useI18n()
  const { openHelp } = useHelp()
  const challengeLv = progress.solo.challenge.unlocked
  const challengeLimit = formatMmSs(challengeTimeLimitMs(challengeLv))
  const soundOn = progress.settings.sound

  return (
    <div className="menu-screen">
      <div className="menu-hero">
        <div className="menu-device-preview" aria-hidden />
        <h1>{m.app.name}</h1>
        <p>{m.app.tagline}</p>
      </div>

      <div className="menu-cards">
        <section className="menu-block">
          <h2>{m.menu.soloTitle}</h2>
          <div className="menu-row">
            <button type="button" className="btn btn-primary" onClick={() => onStartSolo('easy')}>
              {m.difficulty.easy} · {t(m.menu.levelBtn, { level: progress.solo.easy.unlocked })}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onStartSolo('advanced')}
            >
              {m.difficulty.advanced} ·{' '}
              {t(m.menu.levelBtn, { level: progress.solo.advanced.unlocked })}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onStartSolo('challenge')}
            >
              {m.difficulty.challenge} · {t(m.menu.levelBtn, { level: challengeLv })}
            </button>
          </div>
          <p className="menu-hint">{t(m.menu.soloHint, { limit: challengeLimit })}</p>
        </section>

        <section className="menu-block">
          <h2>{m.menu.practiceTitle}</h2>
          <div className="menu-row">
            <button type="button" className="btn btn-secondary" onClick={onOpenCustom}>
              {m.menu.practiceCta}
            </button>
          </div>
          <p className="menu-hint">{m.menu.practiceHint}</p>
        </section>

        <section className="menu-block">
          <h2>{m.menu.helpTitle}</h2>

          <MenuSettingRow label={m.menu.helpLabel}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={openHelp}>
              {m.menu.helpTutorial}
            </button>
          </MenuSettingRow>

          <MenuSettingRow label={m.menu.themeLabel}>
            <ThemePicker
              variant="inline"
              current={progress.settings.theme}
              onSelect={onSelectTheme}
            />
          </MenuSettingRow>

          <MenuSettingRow label={m.lang.label}>
            <LocaleSwitcher />
          </MenuSettingRow>

          <MenuSettingRow label={m.menu.soundLabel}>
            <SoundToggle
              on={soundOn}
              onChange={(next) => {
                if (next !== soundOn) onToggleSound()
              }}
            />
          </MenuSettingRow>

          <p className="menu-hint">{m.menu.helpHint}</p>
        </section>
      </div>
    </div>
  )
}
