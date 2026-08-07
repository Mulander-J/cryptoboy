export type SegmentOption<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  value: T
  options: readonly SegmentOption<T>[]
  onChange: (value: T) => void
  'aria-label'?: string
  className?: string
}

/** 分段开关（语言 / 音效等同款 pill） */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
  className,
}: Props<T>) {
  return (
    <div
      className={['segmented-control', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            className={`segmented-control-btn${active ? ' active' : ''}`}
            aria-pressed={active}
            onClick={() => {
              if (!active) onChange(opt.value)
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
