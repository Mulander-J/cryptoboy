import { Fragment, useState } from 'react'
import type { Difficulty } from '@/domain/types'
import { MAX_LEVELS } from '@/data/levels'
import { getUnlockedLevel, type ProgressState, type Settings } from '@/data/progress'
import { useI18n } from '@/i18n'
import { MenuSettingRow } from '@/ui/MenuSettingRow'
import { NextCycleModal } from '@/ui/NextCycleModal'
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

const SOLO_ROWS: { diff: Difficulty; emoji: string }[] = [
  { diff: 'easy', emoji: '🌱' },
  { diff: 'advanced', emoji: '⚡' },
  { diff: 'nightmare', emoji: '⏱️' },
]

type Props = {
  progress: ProgressState
  onStartSolo: (difficulty: Difficulty) => void
  onStartEndless: () => void
  /** 整档通关后开启下一周目（NG+） */
  onNextCycle: (difficulty: Difficulty) => void
  onOpenCustom: () => void
  /** 局部补丁更新设置（勿回传整份 settings，避免覆盖未改字段） */
  onUpdateSettings: (patch: Partial<Settings>) => void
  onOpenStats: () => void
}

export function Menu({
  progress,
  onStartSolo,
  onStartEndless,
  onNextCycle,
  onOpenCustom,
  onUpdateSettings,
  onOpenStats,
}: Props) {
  const { m, t } = useI18n()
  const { openHelp } = useHelp()
  const { settings } = progress
  const [pendingCycle, setPendingCycle] = useState<{
    diff: Difficulty
    cycle: number
  } | null>(null)

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
            {SOLO_ROWS.map(({ diff, emoji }) => {
              const row = progress.solo[diff]
              const max = MAX_LEVELS[diff]
              const unlocked = getUnlockedLevel(row, max)
              const conquered = row.cleared >= max
              return (
                <Fragment key={diff}>
                  <button
                    type="button"
                    className="btn btn-primary menu-solo-btn"
                    onClick={() => onStartSolo(diff)}
                  >
                    <span className="menu-solo-name">
                      <i className="menu-solo-emoji" aria-hidden>
                        {emoji}
                      </i>
                      {m.difficulty[diff]}
                    </span>
                    <span className="menu-solo-level">
                      {t(m.menu.levelBtn, { level: unlocked })}
                      {row.cycle > 1
                        ? ` · ${t(m.menu.cycleBadge, { n: row.cycle })}`
                        : ''}
                    </span>
                  </button>
                  {conquered ? (
                    <button
                      type="button"
                      className="btn btn-secondary menu-solo-btn menu-cycle-btn"
                      onClick={() =>
                        setPendingCycle({ diff, cycle: row.cycle + 1 })
                      }
                    >
                      <span className="menu-solo-name">
                        <i className="menu-solo-emoji" aria-hidden>
                          🔄
                        </i>
                        {t(m.menu.nextCycleCta, { n: row.cycle + 1 })}
                      </span>
                      <span className="menu-solo-level">
                        {t(m.menu.levelBtn, { level: 1 })}
                      </span>
                    </button>
                  ) : null}
                </Fragment>
              )
            })}
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

      {pendingCycle ? (
        <NextCycleModal
          difficulty={pendingCycle.diff}
          targetCycle={pendingCycle.cycle}
          onConfirm={() => {
            const diff = pendingCycle.diff
            setPendingCycle(null)
            onNextCycle(diff)
          }}
          onCancel={() => setPendingCycle(null)}
        />
      ) : null}
    </div>
  )
}
