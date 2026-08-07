import { useRef, type ReactNode } from 'react'
import { useFocusTrap } from './useFocusTrap'

type Props = {
  children: ReactNode
  className?: string
  labelledBy?: string
  /** 默认优先主按钮；无主按钮时落在第一个可聚焦控件 */
  initialFocus?: 'first' | 'primary'
}

/** 全屏遮罩弹层外壳（Result / Help / Confirm 等共用）：焦点陷阱 + aria dialog */
export function ModalBackdrop({
  children,
  className,
  labelledBy,
  initialFocus = 'primary',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(true, ref, { initialFocus })

  return (
    <div
      ref={ref}
      className={['modal-backdrop', className].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      {children}
    </div>
  )
}
