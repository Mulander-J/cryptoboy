import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function listFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.getAttribute('aria-hidden') === 'true') return false
    // 不可见 / 不占位元素跳过（display:none、隐藏祖先）
    return el.getClientRects().length > 0
  })
}

type Options = {
  /** 默认优先 `.btn-primary`，否则第一个可聚焦控件 */
  initialFocus?: 'first' | 'primary'
}

/** 弹层打开时：焦点落入容器、Tab 循环、关闭后还原焦点；并锁 body 滚动 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options: Options = {},
): void {
  const { initialFocus = 'primary' } = options

  useEffect(() => {
    if (!active) return
    const node = containerRef.current
    if (!(node instanceof HTMLElement)) return
    const root: HTMLElement = node

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const items = listFocusable(root)
    let target: HTMLElement | null = null
    if (initialFocus === 'primary') {
      target = items.find((el) => el.classList.contains('btn-primary')) ?? null
    }
    target ??= items[0] ?? null

    if (!target) {
      if (!root.hasAttribute('tabindex')) root.tabIndex = -1
      target = root
    }
    target.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const focusable = listFocusable(root)
      if (focusable.length === 0) {
        e.preventDefault()
        root.focus()
        return
      }
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === root) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      root.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus()
    }
  }, [active, containerRef, initialFocus])
}
