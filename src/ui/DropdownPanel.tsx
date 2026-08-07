import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { SvgIcon } from './icons'

type Props = {
  id?: string
  /** listbox / menu 等 */
  role?: string
  'aria-label'?: string
  moreAboveHint?: string
  moreBelowHint?: string
  /** 约可见行数（含半行提示可滚） */
  maxRows?: number
  className?: string
  children: ReactNode
}

function MoreChevron({ dir }: { dir: 'up' | 'down' }) {
  return (
    <span className={`dropdown-panel-more-arrow ${dir}`}>
      <SvgIcon name="chevron" />
    </span>
  )
}

/**
 * 可滚动下拉面板：固定可视高度 + 上下箭头提示更多内容。
 * 定位由外层（如 absolute）负责，本组件不撑开触发器布局。
 */
export function DropdownPanel({
  id,
  role = 'listbox',
  'aria-label': ariaLabel,
  moreAboveHint,
  moreBelowHint,
  maxRows = 4.5,
  className,
  children,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const [moreAbove, setMoreAbove] = useState(false)
  const [moreBelow, setMoreBelow] = useState(false)

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return

    function updateMore() {
      if (!el) return
      setMoreAbove(el.scrollTop > 4)
      setMoreBelow(el.scrollHeight - el.clientHeight - el.scrollTop > 4)
    }

    updateMore()
    el.addEventListener('scroll', updateMore, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateMore) : null
    ro?.observe(el)
    return () => {
      el.removeEventListener('scroll', updateMore)
      ro?.disconnect()
    }
  }, [children])

  return (
    <div className={['dropdown-panel', className].filter(Boolean).join(' ')}>
      <div
        className={`dropdown-panel-more above${moreAbove ? ' visible' : ''}`}
        aria-hidden={!moreAbove}
        title={moreAboveHint}
      >
        <MoreChevron dir="up" />
      </div>
      <div
        ref={listRef}
        id={id}
        className="dropdown-panel-list"
        role={role}
        aria-label={ariaLabel}
        style={{ '--dropdown-max-rows': maxRows } as CSSProperties}
      >
        {children}
      </div>
      <div
        className={`dropdown-panel-more below${moreBelow ? ' visible' : ''}`}
        aria-hidden={!moreBelow}
        title={moreBelowHint}
      >
        <MoreChevron dir="down" />
      </div>
    </div>
  )
}
