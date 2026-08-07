import { useI18n } from '@/i18n'
import { ModalBackdrop } from './ModalBackdrop'

type Props = {
  onConfirm: () => void
  onCancel: () => void
}

/** 提交前二次确认（设置「确认提交」开启时） */
export function ConfirmSubmitModal({ onConfirm, onCancel }: Props) {
  const { m } = useI18n()
  const titleId = 'confirm-submit-title'

  return (
    <ModalBackdrop className="confirm-submit-backdrop" labelledBy={titleId}>
      <div className="confirm-submit-modal">
        <h2 id={titleId}>{m.game.confirmSubmitTitle}</h2>
        <p className="confirm-submit-body">{m.game.confirmSubmitBody}</p>
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
