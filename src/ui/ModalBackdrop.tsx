import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  labelledBy?: string
}

/** 全屏遮罩弹层外壳（Result / Help 等共用） */
export function ModalBackdrop({ children, className, labelledBy }: Props) {
  return (
    <div
      className={['modal-backdrop', className].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal
      aria-labelledby={labelledBy}
    >
      {children}
    </div>
  )
}
