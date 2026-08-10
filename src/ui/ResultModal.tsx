import { COLOR_META } from '@/domain/colors'
import { formatMmSs } from '@/domain/clock'
import type { FateCaseChoice } from '@/domain/fateCase'
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
  /** 合计用时（最佳记录按此累加覆盖） */
  elapsedMs?: number
  /** 左轮前推理用时（有左轮时分开展示） */
  baseElapsedMs?: number
  /** 左轮窗口用时（有左轮时分开展示） */
  fateCaseElapsedMs?: number
  /** 左轮打中的颜色 / 空弹 */
  fateCaseShot?: FateCaseChoice | null
  /** 该关历史最佳用时（合计） */
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
  baseElapsedMs,
  fateCaseElapsedMs,
  fateCaseShot = null,
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
        : loseReason === 'fateCase'
          ? m.result.fateCaseMiss
          : m.result.lost
  const titleId = 'result-modal-title'
  const showSplit =
    typeof baseElapsedMs === 'number' &&
    typeof fateCaseElapsedMs === 'number' &&
    fateCaseElapsedMs > 0
  const shotBlank = fateCaseShot === 'blank'
  const shotColor = fateCaseShot && fateCaseShot !== 'blank' ? fateCaseShot : null

  return (
    <ModalBackdrop labelledBy={titleId}>
      <div className={`result-modal ${won && !endless ? 'won' : 'lost'}`}>
        <h2 id={titleId}>{title}</h2>
        {fateCaseShot != null ? (
          <p className="result-fate-case-shot">
            <span>{m.result.fateCaseShot}</span>
            {shotBlank ? (
              <span className="secret-chip fate-case-shot-blank" title={m.game.fateCaseBlank}>
                ∅
              </span>
            ) : shotColor ? (
              <span
                className="secret-chip"
                style={{ background: COLOR_META[shotColor].hex }}
                title={m.color[shotColor]}
                aria-label={m.color[shotColor]}
              >
                {showPattern ? <ColorPatternMark color={shotColor} /> : null}
              </span>
            ) : null}
          </p>
        ) : null}
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
          <div className="result-time">
            {showSplit ? (
              <div className="result-time-split">
                <div className="result-time-row plus">
                  <span>
                    <span className="result-time-op" aria-hidden>
                      +
                    </span>
                    {m.result.timeSolve}
                  </span>
                  <strong>{formatMmSs(baseElapsedMs)}</strong>
                </div>
                <div className="result-time-row plus">
                  <span>
                    <span className="result-time-op" aria-hidden>
                      +
                    </span>
                    {m.result.timeFateCase}
                  </span>
                  <strong>{formatMmSs(fateCaseElapsedMs)}</strong>
                </div>
                <div className="result-time-rule" aria-hidden />
                <div className="result-time-row total">
                  <span>{m.result.timeTotal}</span>
                  <strong>{formatMmSs(elapsedMs)}</strong>
                </div>
              </div>
            ) : (
              <p>
                {m.result.timeUsed} <strong>{formatMmSs(elapsedMs)}</strong>
                {timerMode === 'countdown' ? (
                  <span className="result-time-hint">{m.result.withinLimit}</span>
                ) : null}
              </p>
            )}
            {won && typeof bestTimeMs === 'number' ? (
              <p className="result-best">
                {m.result.best} {formatMmSs(bestTimeMs)}
                {isNewBest ? m.result.newRecord : ''}
              </p>
            ) : null}
          </div>
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
