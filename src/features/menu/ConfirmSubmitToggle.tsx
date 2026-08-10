import { useI18n } from '@/i18n'
import { OnOffToggle } from '@/ui/OnOffToggle'

type Props = {
  on: boolean
  onChange: (on: boolean) => void
}

export function ConfirmSubmitToggle({ on, onChange }: Props) {
  const { m } = useI18n()

  return (
    <OnOffToggle
      on={on}
      onChange={onChange}
      onLabel={m.menu.toggleOn}
      offLabel={m.menu.toggleOff}
      aria-label={m.menu.confirmSubmitLabel}
    />
  )
}
