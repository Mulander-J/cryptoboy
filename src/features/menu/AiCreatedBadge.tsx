import { useI18n } from '@/i18n'
import { assetUrl } from '@/lib/assetUrl'

/** 右下角标识：AI 生成 */
export function AiCreatedBadge() {
  const { m } = useI18n()

  return (
    <div className="ai-created-badge" title={m.app.aiCreatedTitle}>
      <span className="ai-created-mark" aria-hidden>
        <img
          className="ai-created-mark-icon"
          src={assetUrl('imgs/cursor.svg')}
          alt=""
          width={13}
          height={13}
        />
      </span>
      <span>{m.app.aiCreated}</span>
    </div>
  )
}
