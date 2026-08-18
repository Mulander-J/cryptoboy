import type { CSSProperties, ReactNode } from 'react'
import { formatMmSs } from '@/domain/clock'
import { COLOR_META } from '@/domain/colors'
import type { Guess } from '@/domain/types'
import { useI18n } from '@/i18n'
import { useColorBlindPatterns } from '@/ui/colorBlind/ColorBlindContext'
import { ColorPatternMark } from '@/ui/colorBlind/ColorPatternMark'
import { ModalBackdrop } from '@/ui/ModalBackdrop'

type Props = {
  /** 对话框 aria-labelledby */
  titleId: string
  /** 玩法样式钩子：节拍 / 左轮 */
  playClass: 'play-beat' | 'play-revolver'
  /** 已开局（定色中） */
  live: boolean
  reduceMotion: boolean
  /** 倒计时进入紧迫态 */
  urgent: boolean
  /** 未中闪红 */
  missFlash: boolean
  /** 0–1，驱动入场/压迫动效强度 */
  timePressure: number
  styleExtra?: CSSProperties
  /** 玩法副标题（节拍 / 左轮） */
  subtitle: string
  /** 未开局提示；开局后为 null */
  hint: string | null
  remainingMs: number
  /** 触发收官时填写的 4 色猜测（仅展示四色，不标注正误/位置） */
  guess?: Guess
  /** 主按钮文案：开始 / 定色 */
  actionLabel: string
  /** 可定色（live 且未锁输入） */
  armed: boolean
  onStart: () => void
  onAction: () => void
  /** 玩法舞台（Beat / Revolver） */
  children: ReactNode
}

/** Fate Night 外壳：入场特效、标题、倒计时、主按钮；舞台由 children 注入 */
export function FateNightBase({
  titleId,
  playClass,
  live,
  reduceMotion,
  urgent,
  missFlash,
  timePressure,
  styleExtra,
  subtitle,
  hint,
  remainingMs,
  guess,
  actionLabel,
  armed,
  onStart,
  onAction,
  children,
}: Props) {
  const { m } = useI18n()
  const showPattern = useColorBlindPatterns()

  return (
    <ModalBackdrop className="fate-case-backdrop" labelledBy={titleId}>
      <div
        className={[
          'fate-case-moment',
          playClass,
          live ? (reduceMotion ? 'ready' : 'spinning') : 'intro',
          urgent ? 'is-urgent' : '',
          missFlash ? 'is-miss-flash' : '',
          reduceMotion ? 'reduce-motion' : 'has-entrance',
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          {
            '--fate-case-pressure': String(timePressure),
            ...styleExtra,
          } as CSSProperties
        }
      >
        <div className="fate-case-fx" aria-hidden>
          <span className="fate-case-flash" />
          <span className="fate-case-slash slash-a" />
          <span className="fate-case-slash slash-b" />
          <span className="fate-case-corner c-tl" />
          <span className="fate-case-corner c-br" />
        </div>

        <div className="fate-case-title-wrap">
          <h2 id={titleId}>
            <span className="fate-case-title-text">{m.game.fateCaseTitle}</span>
          </h2>
          <p className="fate-case-subtitle">{subtitle}</p>
        </div>

        {live ? (
          <p
            className={`fate-case-countdown${urgent ? ' urgent' : ''}`}
            aria-live="polite"
          >
            <span className="fate-case-countdown-digits">{formatMmSs(remainingMs)}</span>
          </p>
        ) : (
          <p className="fate-case-countdown waiting" aria-live="polite">
            <span className="fate-case-countdown-digits">--:--</span>
          </p>
        )}

        {guess ? (
          <div className="fate-case-guess-wrap">
            <div className="fate-case-guess-row">
              <div className="fate-case-locks" aria-hidden>
                {guess.map((color, i) => (
                  <div
                    key={i}
                    className="fate-case-lock"
                    style={
                      {
                        background: COLOR_META[color].hex,
                        '--lock-i': String(i),
                      } as CSSProperties
                    }
                  >
                    {showPattern ? <ColorPatternMark color={color} /> : null}
                    <span className="fate-case-lock-q">?</span>
                  </div>
                ))}
              </div>
              <div className="fate-case-hint-dots" aria-hidden title="3 绿提示">
                <span className="hint-dot exact" />
                <span className="hint-dot exact" />
                <span className="hint-dot exact" />
                <span className="hint-dot" />
              </div>
            </div>
            <p className="fate-case-shortcut-tip">{m.game.fateCaseShortcutTip}</p>
          </div>
        ) : null}

        {children}

        {!live ? (
          <button
            type="button"
            className="btn btn-primary fate-case-fire-btn"
            onClick={() => onStart()}
          >
            {m.game.fateCaseStart}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary fate-case-fire-btn"
            disabled={!armed}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        )}

        {hint ? <p className="fate-case-moment-hint">{hint}</p> : null}
      </div>
    </ModalBackdrop>
  )
}

export function FateNightCursor({ size = 22 }: { size?: number }) {
  const h = Math.round((size * 16) / 22)
  return (
    <svg viewBox="0 0 24 18" className="fate-case-cursor-mark" width={size} height={h}>
      <path d="M12 16 L2 2 H22 Z" />
    </svg>
  )
}
