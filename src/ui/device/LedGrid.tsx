import type { Attempt, ColorToken, EditableGuess, HintStyle } from '../../domain/types'
import { MAX_ATTEMPTS, PASSWORD_LENGTH } from '../../domain/types'
import { useI18n } from '../../i18n'
import { LedCell } from './LedCell'

type Props = {
  attempts: Attempt[]
  currentGuess: EditableGuess
  cursor: number
  editing: boolean
  hintStyle: HintStyle
  onCellClick: (col: number) => void
}

function HintDots({
  exact,
  present,
}: {
  exact: number
  present: number
}) {
  const { m, t } = useI18n()
  const dots: Array<'exact' | 'present' | 'empty'> = []
  for (let i = 0; i < exact; i++) dots.push('exact')
  for (let i = 0; i < present; i++) dots.push('present')
  while (dots.length < PASSWORD_LENGTH) dots.push('empty')
  return (
    <div
      className="hint-summary"
      aria-label={t(m.device.hintSummary, { exact, present })}
    >
      {dots.map((d, i) => (
        <span key={i} className={`hint-dot ${d}`} />
      ))}
    </div>
  )
}

function ColumnHints({
  perSlot,
}: {
  perSlot: readonly ('exact' | 'present' | 'absent')[] | undefined
}) {
  const slots = perSlot ?? Array.from({ length: 4 }, () => 'absent' as const)
  return (
    <div className="hint-columns">
      {slots.map((h, i) => (
        <span key={i} className={`hint-col ${h}`} />
      ))}
    </div>
  )
}

export function LedGrid({
  attempts,
  currentGuess,
  cursor,
  editing,
  hintStyle,
  onCellClick,
}: Props) {
  const { m } = useI18n()
  const rows = Array.from({ length: MAX_ATTEMPTS }, (_, row) => {
    const attempt = attempts.find((a) => a.rowIndex === row)
    const isCurrent = editing && row === attempts.length
    return { row, attempt, isCurrent }
  })

  return (
    <div className="led-grid-wrap">
      <div className="led-grid" role="grid" aria-label={m.device.gridAria}>
        {rows.map(({ row, attempt, isCurrent }) => (
          <div key={row} className="led-row" role="row">
            {Array.from({ length: PASSWORD_LENGTH }, (_, col) => {
              let color: ColorToken | null = null
              if (attempt) color = attempt.guess[col]!
              else if (isCurrent) color = currentGuess[col] ?? null
              return (
                <LedCell
                  key={col}
                  color={color}
                  active={isCurrent && cursor === col}
                  onClick={isCurrent ? () => onCellClick(col) : undefined}
                  disabled={!isCurrent}
                />
              )
            })}
            <div className="row-hint">
              {attempt ? (
                hintStyle === 'column' ? (
                  <ColumnHints perSlot={attempt.feedback.perSlot} />
                ) : (
                  <HintDots
                    exact={attempt.feedback.exactCount}
                    present={attempt.feedback.presentCount}
                  />
                )
              ) : (
                <div className="hint-placeholder" />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="speaker-grille" aria-hidden>
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  )
}
