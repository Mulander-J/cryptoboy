import {
  applyIntensity,
  COLOR_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
  type CustomPracticeOptions,
  type PracticeIntensity,
} from '@/data/customPractice'
import { useI18n } from '@/i18n'
import { MenuSettingRow } from '@/ui/MenuSettingRow'
import { NavBackButton } from '@/ui/NavBackButton'
import { OnOffToggle } from '@/ui/OnOffToggle'

type Props = {
  value: CustomPracticeOptions
  onChange: (next: CustomPracticeOptions) => void
  onStart: () => void
  onBack: () => void
}

export function CustomPracticeSetup({ value, onChange, onStart, onBack }: Props) {
  const { m, t } = useI18n()

  function patch(partial: Partial<CustomPracticeOptions>) {
    onChange({ ...value, ...partial })
  }

  function onIntensity(raw: string) {
    const n = Number(raw) as PracticeIntensity
    if (n >= 1 && n <= 5) {
      onChange({ ...applyIntensity(n), presetSecret: value.presetSecret })
    }
  }

  const markParts = m.custom.intensityMarks.split(' · ')

  return (
    <div className="menu-screen custom-setup">
      <header className="custom-setup-top">
        <NavBackButton label={m.custom.back} onClick={onBack} />
        <h1 className="custom-setup-top-title">{m.custom.title}</h1>
        <span className="custom-setup-top-spacer" aria-hidden />
      </header>

      <div className="custom-setup-scroll">
        <section className="menu-block">
          <h2>{t(m.custom.intensityTitle, { label: m.intensity[value.intensity] })}</h2>
          <p className="menu-hint">{m.custom.intensityHint}</p>
          <input
            className="custom-range"
            type="range"
            min={1}
            max={5}
            step={1}
            value={value.intensity}
            onChange={(e) => onIntensity(e.target.value)}
            aria-label={m.custom.intensityAria}
          />
          <div className="custom-range-labels" aria-hidden>
            <span>{markParts[0] ?? '1'}</span>
            <span>{markParts[1] ?? '3'}</span>
            <span>{markParts[2] ?? '5'}</span>
          </div>
        </section>

        <section className="menu-block">
          <h2>{m.custom.detailsTitle}</h2>

          <div className="menu-settings-list">
            <MenuSettingRow label={m.custom.colorCount}>
              <select
                className="menu-setting-select"
                value={value.colorCount}
                aria-label={m.custom.colorCount}
                onChange={(e) => patch({ colorCount: Number(e.target.value) })}
              >
                {COLOR_COUNT_OPTIONS.map((n) => (
                  <option key={n} value={n} disabled={!value.allowRepeat && n < 4}>
                    {n}
                  </option>
                ))}
              </select>
            </MenuSettingRow>

            <MenuSettingRow label={m.custom.allowRepeat}>
              <OnOffToggle
                on={value.allowRepeat}
                onChange={(allowRepeat) => patch({ allowRepeat })}
                onLabel={m.menu.toggleOn}
                offLabel={m.menu.toggleOff}
                aria-label={m.custom.allowRepeat}
              />
            </MenuSettingRow>

            <MenuSettingRow
              label={m.custom.hintStyle}
              hint={m.custom.hintStyleHint}
            >
              <select
                className="menu-setting-select"
                value={value.hintStyle}
                aria-label={m.custom.hintStyle}
                onChange={(e) =>
                  patch({ hintStyle: e.target.value === 'column' ? 'column' : 'summary' })
                }
              >
                <option value="column">{m.custom.hintColumn}</option>
                <option value="summary">{m.custom.hintSummary}</option>
              </select>
            </MenuSettingRow>

            <MenuSettingRow label={m.custom.timed}>
              <OnOffToggle
                on={value.timed}
                onChange={(timed) => patch({ timed })}
                onLabel={m.menu.toggleOn}
                offLabel={m.menu.toggleOff}
                aria-label={m.custom.timed}
              />
            </MenuSettingRow>

            {value.timed ? (
              <MenuSettingRow label={m.custom.timeLimit}>
                <select
                  className="menu-setting-select"
                  value={value.timeLimitSec}
                  aria-label={m.custom.timeLimit}
                  onChange={(e) => patch({ timeLimitSec: Number(e.target.value) })}
                >
                  {TIME_LIMIT_OPTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      {t(m.custom.seconds, { n: sec })}
                    </option>
                  ))}
                </select>
              </MenuSettingRow>
            ) : null}

            <MenuSettingRow
              label={m.custom.presetSecret}
              hint={m.custom.presetSecretHint}
            >
              <OnOffToggle
                on={value.presetSecret}
                onChange={(presetSecret) => patch({ presetSecret })}
                onLabel={m.menu.toggleOn}
                offLabel={m.menu.toggleOff}
                aria-label={m.custom.presetSecret}
              />
            </MenuSettingRow>
          </div>
        </section>
      </div>

      <div className="custom-setup-actions">
        <button type="button" className="btn btn-primary" onClick={onStart}>
          {m.custom.start}
        </button>
      </div>
    </div>
  )
}
