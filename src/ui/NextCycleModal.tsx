import { useI18n } from '@/i18n'
import type { Difficulty } from '@/domain/types'
import { ModalBackdrop } from './ModalBackdrop'

type Props = {
  difficulty: Difficulty
  targetCycle: number
  onConfirm: () => void
  onCancel: () => void
}

/** 开启下一周目确认弹层（复用 ModalBackdrop / confirm-submit-modal 样式） */
export function NextCycleModal({ targetCycle, onConfirm, onCancel }: Props) {
  const { m, t } = useI18n()
  const titleId = 'next-cycle-title'

  return (
    <ModalBackdrop className="confirm-submit-backdrop" labelledBy={titleId}>
      <div
        className="confirm-submit-modal"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            onCancel()
          }
        }}
      >
        <h2 id={titleId}>{t(m.menu.nextCycleCta, { n: targetCycle })}</h2>
        <p className="confirm-submit-body">
          {t(m.menu.nextCycleConfirm, { n: targetCycle })}
        </p>
        <div className="confirm-submit-actions">
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            {m.game.confirmSubmitOk}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {m.game.confirmSubmitCancel}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}
