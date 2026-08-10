import { COLOR_META } from '@/domain/colors'
import { formatMmSs } from '@/domain/clock'
import type { LoseReason, Password, TimerMode } from '@/domain/types'
import { useI18n } from '@/i18n'
import { useColorBlindPatterns } from '@/ui/colorBlind/ColorBlindContext'
import { ColorPatternMark } from '@/ui/colorBlind/ColorPatternMark'
import { ModalBackdrop } from './ModalBackdrop'

type Props = {
  status: 'won' | 'lost'
  secret: Password
  /** 是否揭晓答案；Solo 失败默认不揭，避免固定种子刷题 */
  revealSecret?: boolean
  showNext?: boolean
  onRetry: () => void
  onNext?: () => void
  onMenu: () => void
  loseReason?: LoseReason | null
  timerMode?: TimerMode
  /** 本局用时（三档统一：倒计时档=限额-剩余） */
  elapsedMs?: number
  /** 该关历史最佳用时 */
  bestTimeMs?: number
  isNewBest?: boolean
  /** 无尽结算 */
  endlessClears?: number
  endlessBestClears?: number
  isNewEndlessBest?: boolean
}

export function ResultModal({
  status,
  secret,
  revealSecret = true,
  showNext,
  onRetry,
  onNext,
  onMenu,
  loseReason,
  timerMode = 'countup',
  elapsedMs,
  bestTimeMs,
  isNewBest,
  endlessClears,
  endlessBestClears,
  isNewEndlessBest,
}: Props) {
  const { m, t } = useI18n()
  const showPattern = useColorBlindPatterns()
  const won = status === 'won'
  const endless = typeof endlessClears === 'number'
  const title = endless
    ? m.result.endlessOver
    : won
      ? m.result.won
      : loseReason === 'timeout'
        ? m.result.timeout
        : m.result.lost
  const titleId = 'result-modal-title'

  return (
    <ModalBackdrop labelledBy={titleId}>
      <div className={`result-modal ${won && !endless ? 'won' : 'lost'}`}>
        <h2 id={titleId}>{title}</h2>
        {endless ? (
          <p className="result-time">
            {t(m.result.endlessStreak, { n: endlessClears })}
            <br />
            <span className="result-best">
              {t(m.result.endlessBest, {
                n: Math.max(endlessBestClears ?? 0, endlessClears),
              })}
              {isNewEndlessBest ? m.result.newRecord : ''}
            </span>
          </p>
        ) : typeof elapsedMs === 'number' ? (
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
        {revealSecret ? (
          <p className="result-secret">
            {m.result.secret}
            {secret.map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="secret-chip"
                style={{ background: COLOR_META[c].hex }}
                title={m.color[c]}
                aria-label={m.color[c]}
              >
                {showPattern ? <ColorPatternMark color={c} /> : null}
              </span>
            ))}
          </p>
        ) : null}
        <div className="result-actions">
          {won && showNext && onNext ? (
            <button type="button" className="btn btn-primary" onClick={onNext}>
              {m.result.next}
            </button>
          ) : null}
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            {endless ? m.result.endlessAgain : won ? m.result.playAgain : m.result.retry}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onMenu}>
            {m.result.mainMenu}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
