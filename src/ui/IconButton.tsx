import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = {
  label: string
  onClick: () => void
  children: ReactNode
  className?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick' | 'type' | 'aria-label'>

/** 圆形图标按钮（右上角帮助等） */
export function IconButton({ label, onClick, children, className, ...rest }: Props) {
  return (
    <button
      type="button"
      className={['icon-btn', className].filter(Boolean).join(' ')}
      onClick={onClick}
      title={label}
      aria-label={label}
      {...rest}
    >
      {children}
    </button>
  )
}
