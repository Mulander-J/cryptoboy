import { useI18n } from '@/i18n'

/** 标题下：AI 生成、非商业 */
export function HeroTags() {
  const { m } = useI18n()

  return (
    <p className="menu-hero-tags">
      <span className="menu-hero-tag" title={m.app.aiCreatedTitle}>
        {m.app.aiCreated}
      </span>
      <span className="menu-hero-tag">{m.app.nonCommercial}</span>
    </p>
  )
}
