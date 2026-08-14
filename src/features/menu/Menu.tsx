import type { Difficulty } from '@/domain/types'
import { type ProgressState, type Settings } from '@/data/progress'
import { useI18n } from '@/i18n'
import { MenuSettingRow } from '@/ui/MenuSettingRow'
import { THEME_IDS } from '@/ui/theme/themes'
import { useHelp } from '@/features/help/HelpController'
import { SvgIcon } from '@/ui/icons'
import { HeroTags } from './HeroTags'
import { ColorBlindToggle } from './ColorBlindToggle'
import { ConfirmSubmitToggle } from './ConfirmSubmitToggle'
import { LocaleSwitcher } from './LocaleSwitcher'
import { SoundToggle } from './SoundToggle'
import { ThemePicker } from './ThemePicker'

const REPO_URL = 'https://github.com/Mulander-J/cryptoboy'

type Props = {
  progress: ProgressState
  onStartSolo: (difficulty: Difficulty) => void
  onStartEndless: () => void
  onOpenCustom: () => void
  /** 局部补丁更新设置（勿回传整份 settings，避免覆盖未改字段） */
  onUpdateSettings: (patch: Partial<Settings>) => void
  onOpenStats: () => void
}

export function Menu({
  progress,
  onStartSolo,
  onStartEndless,
  onOpenCustom,
  onUpdateSettings,
  onOpenStats,
}: Props) {
  const { m, t } = useI18n()
  const { openHelp } = useHelp()
  const { settings } = progress

  return (
    <div className="menu-screen">
      <div className="menu-hero">
        <div className="menu-device-preview" aria-hidden />
        <h1>{m.app.name}</h1>
        <p className="menu-hero-tagline">{m.app.tagline}</p>
        <HeroTags />
      </div>

      <div className="menu-cards">
        <section className="menu-block">
          <h2>{m.menu.soloTitle}</h2>
          <p className="menu-hint">{m.menu.soloHint}</p>
          <div className="menu-solo-list">
            <button
              type="button"
              className="btn btn-primary menu-solo-btn"
              onClick={() => onStartSolo('easy')}
            >
              <span className="menu-solo-name">
                <i className="menu-solo-emoji" aria-hidden>
                  🌱
                </i>
                {m.difficulty.easy}
              </span>
              <span className="menu-solo-level">
                {t(m.menu.levelBtn, { level: progress.solo.easy.unlocked })}
              </span>
            </button>
            <button
              type="button"
              className="btn btn-primary menu-solo-btn"
              onClick={() => onStartSolo('advanced')}
            >
              <span className="menu-solo-name">
                <i className="menu-solo-emoji" aria-hidden>
                  ⚡
                </i>
                {m.difficulty.advanced}
              </span>
              <span className="menu-solo-level">
                {t(m.menu.levelBtn, { level: progress.solo.advanced.unlocked })}
              </span>
            </button>
            <button
              type="button"
              className="btn btn-primary menu-solo-btn"
              onClick={() => onStartSolo('nightmare')}
            >
              <span className="menu-solo-name">
                <i className="menu-solo-emoji" aria-hidden>
                  ⏱️
                </i>
                {m.difficulty.nightmare}
              </span>
              <span className="menu-solo-level">
                {t(m.menu.levelBtn, {
                  level: progress.solo.nightmare.unlocked,
                })}
              </span>
            </button>
            <hr className="menu-solo-divider" />
            <button
              type="button"
              className="btn btn-primary menu-solo-btn"
              onClick={onStartEndless}
            >
              <span className="menu-solo-name">
                <i className="menu-solo-emoji" aria-hidden>
                  ♾️
                </i>
                {m.menu.endlessCta}
              </span>
              <span className="menu-solo-level">
                {t(m.menu.endlessBest, { n: progress.endless.bestClears })}
              </span>
            </button>
          </div>
        </section>

        <section className="menu-block">
          <h2>{m.menu.practiceTitle}</h2>
          <p className="menu-hint">{m.menu.practiceHint}</p>
          <div className="menu-row">
            <button type="button" className="btn btn-secondary" onClick={onOpenCustom}>
              {m.menu.practiceCta}
            </button>
          </div>
        </section>

        <section className="menu-block">
          <h2>{m.menu.helpTitle}</h2>
          <div className="menu-project-blurb">
            {m.menu.settingsHint.split(/\r\n|\n/).map((line) => (
              <p key={line} className="menu-hint">
                {line}
              </p>
            ))}
          </div>

          <MenuSettingRow label={m.menu.helpLabel} hint={m.menu.helpHint}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={openHelp}>
              {m.menu.helpTutorial}
              <kbd className="menu-kbd">H</kbd>
            </button>
          </MenuSettingRow>

          <MenuSettingRow label={m.menu.statsLabel} hint={m.menu.statsHint}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenStats}
            >
              {m.menu.statsCta}
            </button>
          </MenuSettingRow>

          <MenuSettingRow
            label={m.menu.themeLabel}
            hint={t(m.menu.themeHint, { n: THEME_IDS.length })}
          >
            <ThemePicker
              variant="inline"
              current={settings.theme}
              onSelect={(theme) => onUpdateSettings({ theme })}
            />
          </MenuSettingRow>

          <MenuSettingRow label={m.lang.label}>
            <LocaleSwitcher />
          </MenuSettingRow>

          <MenuSettingRow label={m.menu.soundLabel}>
            <SoundToggle
              on={settings.sound}
              onChange={(sound) => onUpdateSettings({ sound })}
            />
          </MenuSettingRow>

          <MenuSettingRow
            label={m.menu.colorBlindLabel}
            hint={m.menu.colorBlindHint}
          >
            <ColorBlindToggle
              on={settings.colorBlindPatterns}
              onChange={(colorBlindPatterns) =>
                onUpdateSettings({ colorBlindPatterns })
              }
            />
          </MenuSettingRow>

          <MenuSettingRow
            label={m.menu.confirmSubmitLabel}
            hint={m.menu.confirmSubmitHint}
          >
            <ConfirmSubmitToggle
              on={settings.confirmSubmit}
              onChange={(confirmSubmit) => onUpdateSettings({ confirmSubmit })}
            />
          </MenuSettingRow>

          <MenuSettingRow label={m.menu.sourceLabel} hint={m.menu.sourceHint}>
            <a
              className="menu-about-link"
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              title={m.app.githubTitle}
            >
              <SvgIcon name="github-mark" />
              <span>{m.app.githubLabel}</span>
            </a>
          </MenuSettingRow>
        </section>
      </div>
    </div>
  )
}
