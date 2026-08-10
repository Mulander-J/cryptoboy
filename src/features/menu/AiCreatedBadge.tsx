import { useI18n } from '@/i18n'
import { assetUrl } from '@/lib/assetUrl'

/** 「设置和其他」区：本项目 Agent Stats + logo + AI 生成 */
export function AiCreatedBadge() {
  const { m } = useI18n()

  return (
    <p className="menu-ai-badge" title={m.app.aiCreatedTitle}>
      <span>{m.app.aiCreatedLead}</span>
      <span className="ai-created-mark" aria-hidden>
        <img
          className="ai-created-mark-icon"
          src={assetUrl('imgs/cursor.svg')}
          alt=""
          width={12}
          height={12}
        />
      </span>
      <span>{m.app.aiCreated}</span>
    </p>
  )
}
