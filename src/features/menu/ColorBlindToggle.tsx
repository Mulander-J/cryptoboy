import { useI18n } from '@/i18n'
import { SegmentedControl } from '@/ui/SegmentedControl'

type Props = {
  on: boolean
  onChange: (on: boolean) => void
}

export function ColorBlindToggle({ on, onChange }: Props) {
  const { m } = useI18n()

  return (
    <SegmentedControl
      value={on ? 'on' : 'off'}
      options={[
        { value: 'on', label: m.menu.colorBlindOn },
        { value: 'off', label: m.menu.colorBlindOff },
      ]}
      onChange={(v) => onChange(v === 'on')}
      aria-label={m.menu.colorBlindLabel}
    />
  )
}
