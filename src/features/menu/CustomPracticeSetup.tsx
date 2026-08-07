import {
  applyIntensity,
  COLOR_COUNT_OPTIONS,
  optionsFromDifficulty,
  TIME_LIMIT_OPTIONS,
  type CustomPracticeOptions,
  type PracticeIntensity,
} from '../../data/customPractice'
import type { Difficulty } from '../../domain/types'
import { useI18n } from '../../i18n'

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

  function applyPreset(difficulty: Difficulty) {
    onChange(optionsFromDifficulty(difficulty))
  }

  function onIntensity(raw: string) {
    const n = Number(raw) as PracticeIntensity
    if (n >= 1 && n <= 5) onChange(applyIntensity(n))
  }

  const markParts = m.custom.intensityMarks.split(' · ')

  return (
    <div className="menu-screen custom-setup">
      <header className="custom-setup-top">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
          {m.custom.back}
        </button>
        <h1>{m.custom.title}</h1>
        <span className="badge">{m.custom.badge}</span>
      </header>

      <section className="menu-block">
        <h2>{m.custom.presetsTitle}</h2>
        <div className="menu-row">
          <button type="button" className="btn btn-secondary" onClick={() => applyPreset('easy')}>
            {m.difficulty.easy}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => applyPreset('advanced')}
          >
            {m.difficulty.advanced}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => applyPreset('challenge')}
          >
            {m.difficulty.challenge}
          </button>
        </div>
        <p className="menu-hint">{m.custom.presetsHint}</p>
      </section>

      <section className="menu-block">
        <h2>{t(m.custom.intensityTitle, { label: m.intensity[value.intensity] })}</h2>
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
        <p className="menu-hint">{m.custom.intensityHint}</p>
      </section>

      <section className="menu-block">
        <h2>{m.custom.detailsTitle}</h2>

        <label className="custom-field">
          <span>{m.custom.colorCount}</span>
          <select
            value={value.colorCount}
            onChange={(e) => patch({ colorCount: Number(e.target.value) })}
          >
            {COLOR_COUNT_OPTIONS.map((n) => (
              <option key={n} value={n} disabled={!value.allowRepeat && n < 4}>
                {t(m.custom.colorOption, { n })}
              </option>
            ))}
          </select>
        </label>

        <label className="custom-field custom-check">
          <input
            type="checkbox"
            checked={value.allowRepeat}
            onChange={(e) => patch({ allowRepeat: e.target.checked })}
          />
          <span>{m.custom.allowRepeat}</span>
        </label>

        <label className="custom-field">
          <span>{m.custom.hintStyle}</span>
          <select
            value={value.hintStyle}
            onChange={(e) =>
              patch({ hintStyle: e.target.value === 'column' ? 'column' : 'summary' })
            }
          >
            <option value="column">{m.custom.hintColumn}</option>
            <option value="summary">{m.custom.hintSummary}</option>
          </select>
        </label>

        <label className="custom-field custom-check">
          <input
            type="checkbox"
            checked={value.timed}
            onChange={(e) => patch({ timed: e.target.checked })}
          />
          <span>{m.custom.timed}</span>
        </label>

        {value.timed ? (
          <label className="custom-field">
            <span>{m.custom.timeLimit}</span>
            <select
              value={value.timeLimitSec}
              onChange={(e) => patch({ timeLimitSec: Number(e.target.value) })}
            >
              {TIME_LIMIT_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {t(m.custom.seconds, { n: sec })}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </section>

      <div className="custom-setup-actions">
        <button type="button" className="btn btn-primary" onClick={onStart}>
          {m.custom.start}
        </button>
      </div>
    </div>
  )
}
