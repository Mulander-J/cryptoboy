import { formatMmSs, type GameClock, isUrgent } from '@/domain/clock'
import { useI18n } from '@/i18n'

type Props = {
  clock: GameClock
  label?: string
}

export function TimerDisplay({ clock, label }: Props) {
  const { m } = useI18n()
  const urgent = isUrgent(clock)
  const paused = clock.status === 'paused'
  const frozen = clock.status === 'frozen'
  const modeLabel = clock.mode === 'countdown' ? m.game.remaining : m.game.elapsed
  const title = `${modeLabel} ${formatMmSs(clock.displayedMs)}${frozen ? ` · ${m.game.frozen}` : ''}`

  return (
    <div
      className={[
        'game-timer',
        clock.mode === 'countdown' ? 'countdown' : 'countup',
        urgent ? 'urgent' : '',
        paused ? 'paused' : '',
        frozen ? 'frozen' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
      aria-label={title}
      title={title}
    >
      {label ? <span className="timer-label">{label}</span> : null}
      <span className="timer-digits">{formatMmSs(clock.displayedMs)}</span>
      {frozen ? (
        <span className="timer-frozen-tag" aria-hidden>
          ❄️
        </span>
      ) : null}
      {paused && !frozen ? <span className="timer-paused-tag">{m.game.paused}</span> : null}
    </div>
  )
}
