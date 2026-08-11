import type { ReactNode } from 'react'
import { InfoTipButton } from '@/ui/InfoTipButton'

type Props = {
  label: string
  /** 可选说明：标签旁 info，悬浮 / 聚焦显示 tooltip */
  hint?: string
  children: ReactNode
}

/** 设置区一行：左侧标签（+ 可选 info）+ 右侧控件 */
export function MenuSettingRow({ label, hint, children }: Props) {
  return (
    <div className="menu-setting-row">
      <span className="menu-setting-label-wrap">
        <span className="menu-setting-label">{label}</span>
        {hint ? <InfoTipButton hint={hint} /> : null}
      </span>
      {children}
    </div>
  )
}
