import { useI18n } from '../../i18n'

/** 右下角标识：AI 生成 */
export function AiCreatedBadge() {
  const { m } = useI18n()

  return (
    <div className="ai-created-badge" title={m.app.aiCreatedTitle}>
      <span className="ai-created-mark" aria-hidden>
        <img className="ai-created-mark-icon" src="/imgs/cursor/CUBE_25D.svg" alt="" width={13} height={13} />
      </span>
      <span>{m.app.aiCreated}</span>
    </div>
  )
}
