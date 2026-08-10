import { SegmentedControl } from '@/ui/SegmentedControl'

type Props = {
  on: boolean
  onChange: (on: boolean) => void
  onLabel: string
  offLabel: string
  'aria-label': string
  className?: string
}

/** 开 / 关分段开关（与设置区音效等控件同款） */
export function OnOffToggle({
  on,
  onChange,
  onLabel,
  offLabel,
  'aria-label': ariaLabel,
  className,
}: Props) {
  return (
    <SegmentedControl
      className={className}
      value={on ? 'on' : 'off'}
      options={[
        { value: 'on', label: onLabel },
        { value: 'off', label: offLabel },
      ]}
      onChange={(v) => onChange(v === 'on')}
      aria-label={ariaLabel}
    />
  )
}
