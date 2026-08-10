import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { HelpPanel } from './HelpPanel'
import { isEditableTarget } from './shortcuts'

type HelpApi = {
  open: boolean
  openHelp: () => void
  closeHelp: () => void
  toggleHelp: () => void
}

const HelpContext = createContext<HelpApi | null>(null)

type Props = {
  initiallyOpen?: boolean
  onSeen?: () => void
  children: ReactNode
}

/** 全局唯一 HelpPanel：各页面通过 useHelp() 打开/关闭 */
export function HelpController({ initiallyOpen = false, onSeen, children }: Props) {
  const [open, setOpen] = useState(initiallyOpen)

  const openHelp = useCallback(() => setOpen(true), [])

  const closeHelp = useCallback(() => {
    setOpen(false)
    onSeen?.()
  }, [onSeen])

  const toggleHelp = useCallback(() => {
    setOpen((prev) => {
      if (prev) {
        onSeen?.()
        return false
      }
      return true
    })
  }, [onSeen])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isEditableTarget(e.target)) return

      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        toggleHelp()
        return
      }

      if (e.key === 'Escape' && open) {
        e.preventDefault()
        closeHelp()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, closeHelp, toggleHelp])

  const value = useMemo(
    () => ({ open, openHelp, closeHelp, toggleHelp }),
    [open, openHelp, closeHelp, toggleHelp],
  )

  return (
    <HelpContext.Provider value={value}>
      {children}
      <HelpPanel open={open} onClose={closeHelp} />
    </HelpContext.Provider>
  )
}

export function useHelp(): HelpApi {
  const ctx = useContext(HelpContext)
  if (!ctx) {
    throw new Error('useHelp must be used within HelpController')
  }
  return ctx
}
