import { useI18n } from '@/i18n'
import { assetUrl } from '@/lib/assetUrl'

/** 主菜单标题下的次要说明：AI 生成 */
export function AiCreatedBadge() {
  const { m } = useI18n()

  return (
    <p className="menu-hero-meta" title={m.app.aiCreatedTitle}>
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
