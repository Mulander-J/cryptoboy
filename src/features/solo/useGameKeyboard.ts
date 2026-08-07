import { useEffect, useRef } from 'react'
import { colorsForCount } from '@/domain/colors'
import type { ColorToken } from '@/domain/types'
import { isEditableTarget } from '@/features/help/shortcuts'

type Handlers = {
  active: boolean
  helpOpen: boolean
  resultOpen: boolean
  /** 提交确认弹层打开时：Enter 确认 / Esc 取消 */
  confirmOpen?: boolean
  onConfirmSubmit?: () => void
  onCancelConfirm?: () => void
  editing: boolean
  colorCount: number
  onPickColor: (color: ColorToken) => void
  onMoveCursor: (delta: -1 | 1) => void
  onCycle: (direction: 1 | -1) => void
  onSubmit: () => void
  onEscape: () => void
}

export function useGameKeyboard(handlers: Handlers): void {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const h = ref.current
      if (!h.active) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isEditableTarget(e.target)) return

      const key = e.key

      // ? / H 由全局 HelpController 统一处理，避免双触发

      if (key === 'Escape') {
        // 帮助打开时由 HelpController 关闭；此处不抢菜单返回
        if (h.helpOpen) return
        if (h.confirmOpen) {
          e.preventDefault()
          h.onCancelConfirm?.()
          return
        }
        e.preventDefault()
        h.onEscape()
        return
      }

      if (h.confirmOpen) {
        if (key === 'Enter') {
          e.preventDefault()
          h.onConfirmSubmit?.()
        }
        return
      }

      if (h.helpOpen || h.resultOpen) return
      if (!h.editing) return

      if (key >= '1' && key <= '9') {
        const palette = colorsForCount(h.colorCount)
        const idx = Number(key) - 1
        if (idx >= 0 && idx < palette.length) {
          e.preventDefault()
          h.onPickColor(palette[idx]!)
        }
        return
      }

      if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        e.preventDefault()
        h.onMoveCursor(-1)
        return
      }
      if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        e.preventDefault()
        h.onMoveCursor(1)
        return
      }

      if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === ' ') {
        e.preventDefault()
        h.onCycle(1)
        return
      }
      if (key === 'ArrowDown' || key === 's' || key === 'S') {
        e.preventDefault()
        h.onCycle(-1)
        return
      }

      if (key === 'Enter') {
        e.preventDefault()
        h.onSubmit()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
