import { COLOR_META } from '@/domain/colors'
import { formatMmSs } from '@/domain/clock'
import type { LoseReason, Password, TimerMode } from '@/domain/types'
import { useI18n } from '@/i18n'
import { ModalBackdrop } from './ModalBackdrop'

type Props = {
  status: 'won' | 'lost'
  secret: Password
  showNext?: boolean
  onRetry: () => void
  onNext?: () => void
  onMenu: () => void
  loseReason?: LoseReason | null
  timerMode?: TimerMode
  /** 本局用时（三档统一：挑战档=限额-剩余） */
  elapsedMs?: number
  /** 该关历史最佳用时 */
  bestTimeMs?: number
  isNewBest?: boolean
}

export function ResultModal({
  status,
  secret,
  showNext,
  onRetry,
  onNext,
  onMenu,
  loseReason,
  timerMode = 'countup',
  elapsedMs,
  bestTimeMs,
  isNewBest,
}: Props) {
  const { m } = useI18n()
  const won = status === 'won'
  const title = won
    ? m.result.won
    : loseReason === 'timeout'
      ? m.result.timeout
      : m.result.lost

  return (
    <ModalBackdrop>
      <div className={`result-modal ${won ? 'won' : 'lost'}`}>
        <h2>{title}</h2>
        {typeof elapsedMs === 'number' ? (
          <p className="result-time">
            {m.result.timeUsed} <strong>{formatMmSs(elapsedMs)}</strong>
            {timerMode === 'countdown' ? (
              <span className="result-time-hint">{m.result.withinLimit}</span>
            ) : null}
            {won && typeof bestTimeMs === 'number' ? (
              <>
                <br />
                <span className="result-best">
                  {m.result.best} {formatMmSs(bestTimeMs)}
                  {isNewBest ? m.result.newRecord : ''}
                </span>
              </>
            ) : null}
          </p>
        ) : null}
        <p className="result-secret">
          {m.result.secret}
          {secret.map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="secret-chip"
              style={{ background: COLOR_META[c].hex }}
              title={m.color[c]}
            />
          ))}
        </p>
        <div className="result-actions">
          {won && showNext && onNext ? (
            <button type="button" className="btn btn-primary" onClick={onNext}>
              {m.result.next}
            </button>
          ) : null}
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            {won ? m.result.playAgain : m.result.retry}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onMenu}>
            {m.result.mainMenu}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
