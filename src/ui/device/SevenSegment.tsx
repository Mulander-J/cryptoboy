import { useI18n } from '@/i18n'

type Props = {
  value: number
  digits?: number
}

/** 简易三段数码管风格显示（关卡号） */
export function SevenSegment({ value, digits = 3 }: Props) {
  const { m, t } = useI18n()
  const text = Math.max(0, value)
    .toString()
    .padStart(digits, '0')
    .slice(-digits)

  return (
    <div className="seven-segment" aria-label={t(m.device.levelAria, { level: text })}>
      <span className="seven-segment-ghost">{'8'.repeat(digits)}</span>
      <span className="seven-segment-value">{text}</span>
    </div>
  )
}
