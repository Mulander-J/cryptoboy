import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/paths'
import { useProgress } from '@/app/ProgressContext'
import { MAX_LEVELS } from '@/data/levels'
import { hasSoloProgress, type DifficultyProgress } from '@/data/progress'
import { formatMmSs } from '@/domain/clock'
import type { Difficulty } from '@/domain/types'
import { useI18n } from '@/i18n'
import { NavBackButton } from '@/ui/NavBackButton'

const SOLO_DIFFS: Difficulty[] = ['easy', 'advanced', 'nightmare']

function bestEntries(p: DifficultyProgress): { level: number; ms: number }[] {
  return Object.entries(p.bestTimes)
    .map(([k, ms]) => ({ level: Number(k), ms }))
    .filter((row) => Number.isInteger(row.level) && row.level >= 1 && row.ms >= 0)
    .sort((a, b) => a.level - b.level)
}

export function StatsPage() {
  const navigate = useNavigate()
  const { progress, resetProgress } = useProgress()
  const { m, t } = useI18n()
  const canReset = hasSoloProgress(progress)

  function handleResetProgress() {
    if (!canReset) return
    if (window.confirm(m.menu.progressResetConfirm)) {
      resetProgress()
    }
  }

  return (
    <div className="menu-screen custom-setup stats-screen">
      <header className="custom-setup-top">
        <NavBackButton label={m.stats.back} onClick={() => void navigate(ROUTES.home)} />
        <h1 className="custom-setup-top-title">{m.stats.title}</h1>
        <span className="custom-setup-top-spacer" aria-hidden />
      </header>

      <div className="custom-setup-scroll">
        <p className="menu-hint stats-lead">{m.stats.lead}</p>

        {SOLO_DIFFS.map((diff) => {
          const row = progress.solo[diff]
          const max = MAX_LEVELS[diff]
          const bests = bestEntries(row)
          return (
            <section key={diff} className="menu-block stats-block">
              <h2>{m.difficulty[diff]}</h2>
              <dl className="stats-summary">
                <div>
                  <dt>{m.stats.unlocked}</dt>
                  <dd>{t(m.stats.levelOfMax, { n: row.unlocked, max })}</dd>
                </div>
                <div>
                  <dt>{m.stats.cleared}</dt>
                  <dd>{t(m.stats.levelOfMax, { n: row.cleared, max })}</dd>
                </div>
              </dl>
              {bests.length === 0 ? (
                <p className="stats-empty">{m.stats.noBest}</p>
              ) : (
                <ul className="stats-best-list">
                  {bests.map(({ level, ms }) => (
                    <li key={level}>
                      <span>{t(m.stats.levelLabel, { n: level })}</span>
                      <strong>{formatMmSs(ms)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}

        <section className="menu-block stats-block">
          <h2>{m.menu.endlessCta}</h2>
          <dl className="stats-summary">
            <div>
              <dt>{m.stats.endlessBest}</dt>
              <dd>{t(m.stats.endlessBestValue, { n: progress.endless.bestClears })}</dd>
            </div>
          </dl>
        </section>

        <section className="menu-block stats-block stats-reset">
          <h2>{m.menu.progressLabel}</h2>
          <p className="menu-hint">{m.menu.progressHint}</p>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={!canReset}
            onClick={handleResetProgress}
          >
            {m.menu.progressReset}
          </button>
        </section>
      </div>
    </div>
  )
}
