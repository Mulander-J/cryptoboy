import { LOCALES, useI18n, type Locale } from '../../i18n'
import { SegmentedControl } from '../../ui/SegmentedControl'

export function LocaleSwitcher() {
  const { locale, setLocale, m } = useI18n()

  return (
    <SegmentedControl
      value={locale}
      options={LOCALES.map((id) => ({
        value: id,
        label: id === 'zh-CN' ? m.lang.zh : m.lang.en,
      }))}
      onChange={(id) => setLocale(id as Locale)}
      aria-label={m.lang.label}
    />
  )
}
