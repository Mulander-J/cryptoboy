import type { ReactNode } from 'react'

type Props = {
  label: string
  children: ReactNode
}

/** 设置区一行：左侧标签 + 右侧控件 */
export function MenuSettingRow({ label, children }: Props) {
  return (
    <div className="menu-setting-row">
      <span className="menu-setting-label">{label}</span>
      {children}
    </div>
  )
}
